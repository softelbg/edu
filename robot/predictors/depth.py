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
import cv2
import threading
import numpy as np

import torch
from transformers import AutoImageProcessor, AutoModelForDepthEstimation

from robot.tools.timers import *
from robot.tools.daemon import *


class DepthEstimator(DaemonBase):
  def __init__(self):
    super().__init__(period=0.1)
    cache_dir = os.environ['ROBOT_MODELS_PATH']
    model_name = "softel/depth-anything-v0.9"
    self.image_processor = AutoImageProcessor.from_pretrained(model_name, cache_dir=cache_dir, resume_download=True)
    self.model = AutoModelForDepthEstimation.from_pretrained(model_name, cache_dir=cache_dir, resume_download=True)

    self.fps = FPSCounter(period=5, tag=type(self).__name__)
    self.prediction = None
    self.lock = threading.Lock()

  def crop(self, frame, crop_ratio=0.2):
    height, width = frame.shape[:2]
    margin = int(min(height, width) * crop_ratio)
    start_y = margin
    end_y = height - margin
    start_x = margin
    end_x = width - margin
    return frame[start_y:end_y, start_x:end_x]

  def predict_depth(self, frame):
    self.fps.update()
    frame = self.crop(frame)
    h, w, c = frame.shape
    inputs = self.image_processor(images=frame, return_tensors="pt")
    with torch.no_grad():
      outputs = self.model(**inputs)
      predicted_depth = outputs.predicted_depth
    prediction = torch.nn.functional.interpolate(
      predicted_depth.unsqueeze(1),
      size=(h // 2, w // 2),
      mode="bicubic",
      align_corners=False,
    )
    output = prediction.squeeze().cpu().numpy()
    # formatted = (output * 255 / np.max(output)).astype("uint8")
    formatted = ((1.0 - output / 30) * 255).astype("uint8")
    image_depth = cv2.applyColorMap(formatted, cv2.COLORMAP_RAINBOW)
    return predicted_depth, image_depth

  def loop(self):
    frame = None
    with self.lock:
      frame = self.frame.copy()
    t = Timer()
    predicted_depth, image_depth = self.predict_depth(frame)
    result = {
      "move": "S:0",
      "play": image_depth
    }
    print(type(self).__name__, "predict elapsed", t.stop(), "depth", [predicted_depth.min(), predicted_depth.max()])
    with self.lock:
      self.prediction = result

  def predict(self, frame):
    with self.lock:
      self.frame = frame
      return self.prediction