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


from robot.tools.daemon import *
from robot.tools.predictors import *
from robot.tools.fps import FPSCounter


class BaseRobotCommandsDaemon(DaemonBase):
  def __init__(self, ip, period=1):
    super().__init__(period=period)
    self.url_base = f"http://{ip}:9901"
    self.url_frame = f"{self.url_base}/frame"
    self.url_command = f"{self.url_base}/command"
    self.frame = None
    self.frame_play = None
    self.fps = FPSCounter(5)
    print(type(self).__name__, "init", self.url_base)

  def command(self, prediction):
    response = requests.get(self.url_command, params={'move': prediction})
    if response.status_code == 200:
      # print(type(self).__name__, "Command sent successfully", response.content)
      pass
    else:
      print(type(self).__name__, "Failed to send command to server")

  def draw_prediction(self, prediction):
    overlay = np.ones_like(self.frame) * 0
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 4
    font_thickness = 8

    (text_width, text_height), _ = cv2.getTextSize('F', font, font_scale, font_thickness)

    x = self.frame.shape[1] - text_width - 10
    y = text_height + 10

    cv2.putText(overlay, prediction, (x, y), font, font_scale, (0, 0, 255), font_thickness)
    self.frame_play = cv2.addWeighted(self.frame, 1, overlay, 1.5, 0)

  def play(self):
    if self.frame_play is not None:
      cv2.imshow('Frame', self.frame_play)
      cv2.waitKey(1)


class RobotCommandsDaemon(BaseRobotCommandsDaemon):
  def __init__(self, ip, period=1):
    super().__init__(ip, period)
    self.model = DummyPredictor()
    # self.model = KeyboardPredictor()
    # self.model.start()

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

  def loop(self):
    self.frame = self.read_frame()
    self.fps.update()

    prediction = self.model.predict(self.frame)
    # print(type(self).__name__, "prediction", prediction)

    self.command(prediction)
    self.draw_prediction(prediction)


if __name__ == "__main__":
  cmd = RobotCommandsDaemon(ip="127.0.0.1", period=0.5)
  cmd.start()

  while(True):
    cmd.play()
    time.sleep(0.1)
