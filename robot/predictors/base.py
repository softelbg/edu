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
import numpy as np

from sciveo.common.tools.daemon import *
from sciveo.common.tools.timers import FPSCounter


class BaseDaemonPredictor(DaemonBase):
  def __init__(self):
    super().__init__(period=0.1)

    self.fps = FPSCounter(period=5, tag=type(self).__name__)
    self.prediction = None
    self.frame = None
    self.frame_play = None
    self.lock = threading.Lock()

  def predict_frame(self, frame):
    return None

  def loop(self):
    if self.frame is None:
      return
    with self.lock:
      frame = self.frame.copy()
    current_prediction = self.predict_frame(frame)
    with self.lock:
      self.prediction = current_prediction
    self.fps.update()

  def predict(self, frame):
    with self.lock:
      self.frame = frame
      return self.prediction

  def draw_prediction(self, prediction):
    if self.frame is not None:
      self.frame_play = self.frame.copy()

      font = cv2.FONT_HERSHEY_SIMPLEX
      font_scale = 4
      font_thickness = 8
      (text_width, text_height), _ = cv2.getTextSize(prediction["move"], font, font_scale, font_thickness)
      w, h = self.frame.shape[1], self.frame.shape[0]
      x = self.frame.shape[1] - text_width - 10
      y = text_height + 10
      cv2.putText(self.frame_play, prediction["move"], (x, y), font, font_scale, (0, 255, 0), font_thickness)
    return self.frame_play


class BaseRobotPredictor(BaseDaemonPredictor):
  def __init__(self):
    super().__init__()
    self.set_prompt(
      [
        "Start searching for a computer backpack.",
        "If the backpack is not visible, start rotation.",
        "When backpack is visible start moving toward it.",
        "When distance to the backpack is less than 15 centimeters then stop.",
        "When obstacles in front try to avoid collision."
      ]
    )

  def set_prompt(self, command_prompt):
    if isinstance(command_prompt, list):
      command_prompt = " ".join(command_prompt)
    self.prompt = " ".join([
      "You are a robot with 5 possible actions: forward, backward, left, right and stop.",
      "Every command will move the robot for 0.5 seconds.",
      "Look at the image from the front facing robot camera for navigation.",
      command_prompt,
      "You should respond only with one letter of this list ['F','B','R','L','S']."
    ])
    debug(type(self).__name__, "set prompt", self.prompt)

  def predict(self, frame):
    with self.lock:
      self.frame = frame
      current_prediction = self.prediction
      self.prediction = {"move": 'S'}
      return current_prediction