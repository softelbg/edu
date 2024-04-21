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


from robot.tools.daemon import *
from robot.tools.predictors import *
from robot.tools.timers import *


class BaseRobotCommandsDaemon(DaemonBase):
  def __init__(self, ip=None, period=1):
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
    self.fps = FPSCounter(period=5, tag="play")
    self.fps_predict = FPSCounter(period=5, tag="predict")
    self.prediction = None
    print(type(self).__name__, "init", self.url_base)

  def scan_for_server(self):
    list_ip = []
    for i in range(1, 10):
      list_ip = sciveo.network(timeout=0.01 * i, localhost=False).scan_port(port=self.port)
      if len(list_ip) > 0:
        break
    if len(list_ip) > 0:
      return list_ip[0]
    else:
      return "127.0.0.1"

  def command(self):
    if self.prediction is not None:
      response = requests.get(self.url_command, params=self.prediction)
      if response.status_code == 200:
        # print(type(self).__name__, "Command sent successfully", response.content)
        pass
      else:
        print(type(self).__name__, "Failed to send command to server")

  def draw_prediction(self):
    if self.prediction is not None:
      overlay = np.ones_like(self.frame) * 0
      font = cv2.FONT_HERSHEY_SIMPLEX
      font_scale = 4
      font_thickness = 8

      (text_width, text_height), _ = cv2.getTextSize(self.prediction["move"], font, font_scale, font_thickness)

      w, h = self.frame.shape[1], self.frame.shape[0]
      x = self.frame.shape[1] - text_width - 10
      y = text_height + 10

      cv2.putText(overlay, self.prediction["move"], (x, y), font, font_scale, (0, 255, 0), font_thickness)
      self.frame_play = cv2.addWeighted(self.frame, 1, overlay, 1.5, 0)

      lh = h // 4
      cv2.line(self.frame_play, (w // 2 - lh // 2, h // 2), (w // 2 + lh // 2, h // 2), (0, 255, 0), thickness=2)
      cv2.line(self.frame_play, (w // 2, h // 2 - lh // 2), (w // 2, h // 2 + lh // 2), (0, 255, 0), thickness=2)

  def play(self):
    if self.frame_play is not None:
      cv2.imshow(str(self.prediction), self.frame_play)
      cv2.waitKey(1)


class RobotCommandsDaemon(BaseRobotCommandsDaemon):
  def __init__(self, ip=None, period_cap=0.1, period_predict=1.0):
    super().__init__(ip, period_cap)

    self.timer = TimerExec(fn=self.predict, period=period_predict)

    # self.model = DummyPredictor()
    self.model = KeyboardPredictor()
    self.model.start()

  def read_frame(self):
    response = requests.get(self.url_frame, stream=True)
    if response.status_code == 200:
      try:
        image_array = np.frombuffer(response.content, dtype=np.uint8)
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        return image
      except Exception as e:
        print(type(self).__name__, "Error decoding image:", e)
    else:
      print(type(self).__name__, "Failed to fetch frame from server")

  def predict(self):
    self.prediction = self.model.predict(self.frame)
    # print(type(self).__name__, "prediction", self.prediction)
    self.command()
    self.fps_predict.update()

  def loop(self):
    try:
      self.frame = self.read_frame()
    except Exception as e:
      print(type(self).__name__, "Error reading frame", e)
      time.sleep(5)
    self.timer.run()
    self.draw_prediction()
    self.fps.update()


if __name__ == "__main__":
  cmd = RobotCommandsDaemon(ip=None, period_cap=0.02, period_predict=1.0)
  cmd.start()

  while(True):
    cmd.play()
    time.sleep(0.01)
