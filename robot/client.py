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

import cv2
import requests
import numpy as np
import time
import sciveo


from sciveo.network.tools import NetworkTools
from sciveo.tools.logger import *
from sciveo.tools.daemon import *
from sciveo.tools.timers import *
from robot.predictors.common import *
from robot.predictors.arm import *


class PredictionDaemon(DaemonBase):
  def __init__(self, base, period=1):
    super().__init__(period=period)
    self.base = base
    self.fps = FPSCounter(period=5, tag="predictor")

  def loop(self):
    try:
      self.base.predict()
      self.fps.update()
    except Exception as e:
      error("Error prediction", e)
      time.sleep(5)


class BaseRobotCommandsDaemon(DaemonBase):
  def __init__(self, ip=None, period=1, period_predict=1):
    super().__init__(period=period)
    self.port = 9901
    if ip is None:
      self.ip = self.scan_for_server()
    else:
      self.ip = ip

    self.url_base = f"http://{self.ip}:{self.port}"
    self.url_frame = f"{self.url_base}/frame"
    self.url_command = f"{self.url_base}/command"
    self.frame = None
    self.frame_play = None
    self.fps = FPSCounter(period=5, tag="main loop")
    self.fps_predict = FPSCounter(period=5, tag="predict")
    self.fps_play = FPSCounter(period=5, tag="play")

    self.model = None
    self.lock_model = threading.Lock()

    self.lock_prediction = threading.Lock()
    self.prediction = None

    self.predict_daemon = PredictionDaemon(self, period_predict)

    debug("init", self.url_base)

  def start(self):
    super().start()
    self.predict_daemon.start()

  def read_frame(self):
    response = requests.get(self.url_frame, stream=True)
    if response.status_code == 200:
      try:
        image_array = np.frombuffer(response.content, dtype=np.uint8)
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        return image
      except Exception as e:
        error("Error decoding image:", e)
    else:
      error("Failed to fetch frame from server")

  def predict(self):
    prediction = None
    with self.lock_model:
      if self.model is not None:
        prediction = self.model.predict(self.frame)
        self.fps_predict.update()
    self.set_prediction(prediction)
    self.print_prediction()
    self.command()

  def loop(self):
    try:
      self.frame = self.read_frame()
    except Exception as e:
      error("Error reading frame", e)
      time.sleep(5)
    self.draw_prediction()
    self.fps.update()

  def set_prediction(self, prediction):
    with self.lock_prediction:
      self.prediction = prediction

  def get_prediction(self):
    with self.lock_prediction:
      return self.prediction

  def scan_for_server(self):
    list_ip = []
    for i in range(1, 10):
      list_ip = NetworkTools(timeout=0.3 * i, localhost=False).scan_port(port=self.port)
      if len(list_ip) > 0:
        break
    if len(list_ip) > 0:
      return list_ip[0]
    else:
      return "127.0.0.1"

  def command(self):
    current_prediction = self.get_prediction()
    if current_prediction is not None:
      params = {k: current_prediction[k] for k in ["move", "poweroff"] if k in current_prediction}
      response = requests.get(self.url_command, params=params)
      if response.status_code == 200:
        debug("CMD", params, "response", response.content)
        time.sleep(5)
      else:
        error("Failed to send command to server")
    else:
      debug("command current_prediction is NONE")

  def draw_prediction(self):
    current_prediction = self.get_prediction()
    if current_prediction is not None:
      self.frame_play = self.frame.copy()

      font = cv2.FONT_HERSHEY_SIMPLEX
      font_scale = 1
      font_thickness = 3
      (text_width, text_height), _ = cv2.getTextSize(current_prediction.get("move", ""), font, font_scale, font_thickness)
      w, h = self.frame.shape[1], self.frame.shape[0]
      x = self.frame.shape[1] - text_width - 10
      y = text_height + 10
      cv2.putText(self.frame_play, current_prediction.get("move", ""), (x, y), font, font_scale, (0, 255, 0), font_thickness)

      lh = h // 4
      cv2.line(self.frame_play, (w // 2 - lh // 2, h // 2), (w // 2 + lh // 2, h // 2), (0, 255, 0), thickness=2)
      cv2.line(self.frame_play, (w // 2, h // 2 - lh // 2), (w // 2, h // 2 + lh // 2), (0, 255, 0), thickness=2)
    else:
      debug("draw_prediction current_prediction is NONE")

  def play(self):
    if self.frame_play is not None:
      cv2.imshow(f"{self.url_frame}::robot", self.frame_play)
      current_prediction = self.get_prediction()
      if current_prediction is not None and "play" in current_prediction:
        if isinstance(current_prediction["play"], list):
          for i, frame in enumerate(current_prediction["play"]):
            cv2.imshow(f"{self.url_frame}::prediction {i}", frame)
        else:
          cv2.imshow(f"{self.url_frame}::prediction", current_prediction["play"])
      cv2.waitKey(1)
      self.fps_play.update()

  def print_prediction(self):
    current_prediction = self.get_prediction()
    if current_prediction is not None:
      for k, v in current_prediction.items():
        if k not in ["play"]:
          debug("prediction", k, "=>", v)
    else:
      debug("print_prediction current_prediction is NONE")


class RobotCommandsDaemon(BaseRobotCommandsDaemon):
  def __init__(self, ip=None, period_cap=0.1, period_predict=1.0):
    super().__init__(ip, period_cap, period_predict)

    self.model = PipelinePredictor()


class RobotArmDaemon(BaseRobotCommandsDaemon):
  def __init__(self, ip=None, period_cap=0.1, period_predict=1.0):
    super().__init__(ip, period_cap, period_predict)

    self.url_frame = f"{self.url_base}/arm/frame"
    self.url_command = f"{self.url_base}/arm/command"

    self.model = ArmPipelinePredictor()



if __name__ == "__main__":
  # ip = "10.37.0.22"
  ip = None
  daemons = [
    RobotCommandsDaemon(ip=ip, period_cap=0.02, period_predict=0.1),
    RobotArmDaemon(ip=ip, period_cap=0.02, period_predict=5.0),
  ]

  for d in daemons:
    d.start()

  while(True):
    for d in daemons:
      d.play()
    time.sleep(0.01)
