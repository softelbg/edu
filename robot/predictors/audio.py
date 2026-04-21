#
# Stanislav Georgiev, Softel Labs 2024
#
# This file is licensed under the Apache License, Version 2.0 (the "License").
# You may obtain a copy of the License at https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

import os
import io
import queue
import re
import textwrap
import threading
import time
import wave
from collections import deque

import cv2
import numpy as np
import torch
from openai import OpenAI
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline

from sciveo.tools.daemon import *
from sciveo.tools.logger import *

try:
  import sounddevice as sd
except ImportError:
  sd = None


class AudioPromptPredictor(DaemonBase):
  def __init__(self, period=0.1, backend=None, model_name=None):
    super().__init__(period=period)

    self.enabled = os.environ.get("ROBOT_ENABLE_AUDIO", "1").lower() not in ["0", "false", "no"]
    self.backend = (backend or os.environ.get("ROBOT_AUDIO_BACKEND", "hf")).strip().lower()
    default_model = "gpt-4o-mini-transcribe" if self.backend in ["openai", "chatgpt", "remote"] else "openai/whisper-small"
    self.model_name = model_name or os.environ.get("ROBOT_AUDIO_MODEL", default_model)
    self.language = os.environ.get("ROBOT_AUDIO_LANGUAGE", "en")
    self.device_name = os.environ.get("ROBOT_AUDIO_DEVICE", None)
    self.compute_device = os.environ.get("ROBOT_AUDIO_COMPUTE_DEVICE", "").strip().lower()
    self.sample_rate = int(os.environ.get("ROBOT_AUDIO_SAMPLE_RATE", 16000))
    self.chunk_seconds = float(os.environ.get("ROBOT_AUDIO_CHUNK_SECONDS", 2.0))
    self.min_audio_level = float(os.environ.get("ROBOT_AUDIO_MIN_LEVEL", 0.01))
    self.prompt_cooldown = float(os.environ.get("ROBOT_AUDIO_PROMPT_COOLDOWN", 1.5))
    self.prompt_queue_size = int(os.environ.get("ROBOT_AUDIO_PROMPT_QUEUE", 16))
    self.max_prompt_size = int(os.environ.get("ROBOT_AUDIO_MAX_PROMPT_SIZE", 128))
    self.history_seconds = float(os.environ.get("ROBOT_AUDIO_HISTORY_SECONDS", 3.0))
    self.canvas_width = int(os.environ.get("ROBOT_AUDIO_CANVAS_WIDTH", 900))
    self.canvas_height = int(os.environ.get("ROBOT_AUDIO_CANVAS_HEIGHT", 320))
    self.cache_dir = os.environ.get("ROBOT_MODELS_PATH", None)

    self.chunk_samples = max(1, int(self.sample_rate * self.chunk_seconds))
    self.history_samples = max(1, int(self.sample_rate * self.history_seconds))

    self.audio_queue = queue.Queue(maxsize=32)
    self.prompt_queue = queue.Queue(maxsize=self.prompt_queue_size)
    self.audio_buffer = np.zeros(0, dtype=np.float32)
    self.waveform = deque(maxlen=self.history_samples)

    self.lock = threading.Lock()
    self.stream = None
    self.transcriber = None
    self.openai_client = None
    self.is_ready = False
    self.device_runtime = "cpu"
    self.device_pipeline = -1
    self.torch_dtype = torch.float32
    self.last_audio_level = 0.0
    self.last_prompt = ""
    self.last_prompt_ts = 0.0
    self.last_canvas = self.render_canvas(status="booting")
    self.status = "booting"

  def start(self):
    if not self.enabled:
      self.set_status("disabled")
      debug(type(self).__name__, "disabled")
      return

    if sd is None:
      self.set_status("sounddevice missing")
      error(type(self).__name__, "sounddevice is not installed. Audio prompts are disabled.")
      return

    try:
      self.set_status(f"loading {self.backend}")
      self.load_model()
      self.set_status("opening microphone")
      self.open_stream()
      self.is_ready = True
      self.set_status("listening")
      debug(
        type(self).__name__,
        "ready",
        self.backend,
        self.model_name,
        self.sample_rate,
        self.device_name,
        self.device_runtime,
        self.torch_dtype
      )
    except Exception as e:
      self.set_status("init failed")
      error(type(self).__name__, "failed to initialize audio prompts", e)
      self.close_stream()
      return

    super().start()

  def stop(self):
    self.close_stream()
    try:
      super().stop()
    except Exception:
      pass

  def close_stream(self):
    if self.stream is not None:
      try:
        self.stream.stop()
      except Exception:
        pass
      try:
        self.stream.close()
      except Exception:
        pass
      self.stream = None

  def load_model(self):
    if self.backend in ["openai", "chatgpt", "remote"]:
      self.load_openai_client()
      return

    self.load_local_model()

  def load_openai_client(self):
    self.openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    self.device_runtime = "openai"
    self.device_pipeline = None
    self.torch_dtype = "remote"

  def load_local_model(self):
    self.device_runtime, self.device_pipeline, self.torch_dtype = self.resolve_torch_device()
    processor = AutoProcessor.from_pretrained(self.model_name, cache_dir=self.cache_dir, resume_download=True)
    model = AutoModelForSpeechSeq2Seq.from_pretrained(
      self.model_name,
      cache_dir=self.cache_dir,
      torch_dtype=self.torch_dtype,
      low_cpu_mem_usage=True,
      resume_download=True
    )

    model = model.to(self.device_runtime)

    self.transcriber = pipeline(
      "automatic-speech-recognition",
      model=model,
      tokenizer=processor.tokenizer,
      feature_extractor=processor.feature_extractor,
      torch_dtype=self.torch_dtype,
      device=self.device_pipeline,
    )

  def resolve_torch_device(self):
    forced = self.compute_device
    has_mps = hasattr(torch.backends, "mps") and torch.backends.mps.is_available()

    if forced in ["cuda", "cuda:0"]:
      return "cuda:0", 0, torch.float16

    if forced == "mps":
      return "mps", "mps", torch.float16

    if forced == "cpu":
      return "cpu", -1, torch.float32

    if torch.cuda.is_available():
      return "cuda:0", 0, torch.float16

    if has_mps:
      return "mps", "mps", torch.float16

    return "cpu", -1, torch.float32

  def open_stream(self):
    self.stream = sd.InputStream(
      channels=1,
      samplerate=self.sample_rate,
      dtype="float32",
      device=self.device_name,
      callback=self.audio_callback,
    )
    self.stream.start()

  def audio_callback(self, indata, frames, time_info, status):
    if status:
      debug(type(self).__name__, "audio status", status)

    data = np.asarray(indata[:, 0], dtype=np.float32).copy()
    try:
      self.audio_queue.put_nowait(data)
    except queue.Full:
      try:
        self.audio_queue.get_nowait()
      except queue.Empty:
        pass
      try:
        self.audio_queue.put_nowait(data)
      except queue.Full:
        pass

  def loop(self):
    self.collect_audio()
    self.update_canvas()

    if not self.is_ready:
      return

    if len(self.audio_buffer) < self.chunk_samples:
      return

    audio_chunk = self.audio_buffer[:self.chunk_samples]
    self.audio_buffer = self.audio_buffer[self.chunk_samples:]

    self.last_audio_level = float(np.sqrt(np.mean(np.square(audio_chunk))))
    if self.last_audio_level < self.min_audio_level:
      self.set_status("listening")
      return

    self.set_status("transcribing")
    transcript = self.transcribe(audio_chunk)
    if len(transcript) == 0:
      self.set_status("no speech detected")
      return

    if self.should_skip_prompt(transcript):
      self.last_prompt = transcript
      self.set_status("duplicate prompt skipped")
      return

    self.enqueue_prompt(transcript)
    self.last_prompt = transcript
    self.last_prompt_ts = time.time()
    self.set_status("prompt queued")
    debug(type(self).__name__, "prompt", transcript)

  def collect_audio(self):
    chunks = []
    while True:
      try:
        chunks.append(self.audio_queue.get_nowait())
      except queue.Empty:
        break

    if len(chunks) == 0:
      return

    data = np.concatenate(chunks)
    self.audio_buffer = np.concatenate([self.audio_buffer, data])
    self.waveform.extend(data.tolist())
    self.last_audio_level = float(np.sqrt(np.mean(np.square(data))))

  def transcribe(self, audio_chunk):
    if self.backend in ["openai", "chatgpt", "remote"]:
      return self.transcribe_openai(audio_chunk)

    generate_kwargs = {
      "task": "transcribe",
      "max_new_tokens": self.max_prompt_size,
    }
    if len(self.language) > 0:
      generate_kwargs["language"] = self.language

    result = self.transcriber(
      {"array": audio_chunk, "sampling_rate": self.sample_rate},
      generate_kwargs=generate_kwargs
    )
    return self.normalize_text(result.get("text", ""))

  def transcribe_openai(self, audio_chunk):
    wav_buffer = io.BytesIO()
    wav_buffer.name = "audio.wav"

    audio_pcm = np.clip(audio_chunk, -1.0, 1.0)
    audio_pcm = (audio_pcm * 32767.0).astype(np.int16)

    with wave.open(wav_buffer, "wb") as wav_file:
      wav_file.setnchannels(1)
      wav_file.setsampwidth(2)
      wav_file.setframerate(self.sample_rate)
      wav_file.writeframes(audio_pcm.tobytes())

    wav_buffer.seek(0)

    params = {
      "model": self.model_name,
      "file": wav_buffer,
    }
    if len(self.language) > 0:
      params["language"] = self.language

    transcript = self.openai_client.audio.transcriptions.create(**params)
    text = getattr(transcript, "text", None)
    if text is None:
      text = str(transcript)
    return self.normalize_text(text)

  def normalize_text(self, text):
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:self.max_prompt_size].strip()

  def should_skip_prompt(self, prompt):
    if prompt != self.last_prompt:
      return False
    return time.time() - self.last_prompt_ts < self.prompt_cooldown

  def enqueue_prompt(self, prompt):
    payload = {
      "prompt": prompt,
      "ts": time.time(),
      "source": type(self).__name__,
    }

    try:
      self.prompt_queue.put_nowait(payload)
      return
    except queue.Full:
      pass

    try:
      self.prompt_queue.get_nowait()
    except queue.Empty:
      pass

    try:
      self.prompt_queue.put_nowait(payload)
    except queue.Full:
      pass

  def get_prompt_nowait(self):
    try:
      return self.prompt_queue.get_nowait()
    except queue.Empty:
      return None

  def get_prompt(self, timeout=None):
    try:
      return self.prompt_queue.get(timeout=timeout)
    except queue.Empty:
      return None

  def set_status(self, status):
    self.status = status
    self.update_canvas()

  def update_canvas(self):
    canvas = self.render_canvas(status=self.status)
    with self.lock:
      self.last_canvas = canvas

  def render_canvas(self, status=""):
    canvas = np.zeros((self.canvas_height, self.canvas_width, 3), dtype=np.uint8)
    canvas[:] = (18, 18, 18)

    title = f"Robot Audio Prompt [{self.backend}]"
    cv2.putText(canvas, title, (20, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (120, 220, 120), 2)

    queue_text = f"queue={self.prompt_queue.qsize()}  rms={self.last_audio_level:.4f}  backend={self.device_runtime}"
    cv2.putText(canvas, queue_text, (20, 65), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (200, 200, 200), 1)
    cv2.putText(canvas, f"status={status}", (20, 88), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (120, 180, 255), 1)

    graph_top = 110
    graph_height = 105
    graph_bottom = graph_top + graph_height
    graph_left = 20
    graph_right = self.canvas_width - 20
    graph_width = max(1, graph_right - graph_left)

    cv2.rectangle(canvas, (graph_left, graph_top), (graph_right, graph_bottom), (70, 70, 70), 1)
    cv2.line(canvas, (graph_left, graph_top + graph_height // 2), (graph_right, graph_top + graph_height // 2), (50, 50, 50), 1)

    if len(self.waveform) > 1:
      wave = np.array(self.waveform, dtype=np.float32)
      step = max(1, len(wave) // graph_width)
      wave = wave[::step][:graph_width]
      amplitude = max(float(np.max(np.abs(wave))), 1e-4)
      x0 = graph_left
      y_prev = graph_top + graph_height // 2
      for i, value in enumerate(wave):
        y = int(graph_top + graph_height * 0.5 - (value / amplitude) * graph_height * 0.45)
        x = graph_left + i
        if x > graph_right:
          break
        cv2.line(canvas, (x0, y_prev), (x, y), (0, 230, 120), 1)
        x0, y_prev = x, y

    prompt_text = self.last_prompt if len(self.last_prompt) > 0 else "waiting for speech..."
    lines = textwrap.wrap(prompt_text, width=60)[:4]
    y = 245
    for i, line in enumerate(lines):
      cv2.putText(canvas, line, (20, y + i * 22), cv2.FONT_HERSHEY_SIMPLEX, 0.58, (240, 240, 240), 1)

    return canvas

  def predict(self, frame):
    with self.lock:
      canvas = self.last_canvas.copy()
    return {"play": canvas}


class RemoteOpenAIAudioPromptPredictor(AudioPromptPredictor):
  def __init__(self, period=0.1, model_name=None):
    super().__init__(period=period, backend="openai", model_name=model_name or "gpt-4o-mini-transcribe")


AudioCommandPredictor = AudioPromptPredictor
