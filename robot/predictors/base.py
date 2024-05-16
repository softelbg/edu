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

from robot.tools.timers import *
from robot.tools.daemon import *


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
