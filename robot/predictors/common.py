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
from sciveo.common.tools.timers import *
from robot.predictors.depth import *
from robot.predictors.remote import *


class PipelinePredictor:
  def __init__(self):
    self.pipeline = [
      DepthEstimator(),

      # OpenAIPredictor(),
      LocalClientPredictor(host="sof-1.softel.bg", port=8901, proto="https"),

      # KeyboardPredictor(),
      # KeyboardSpeedPredictor(),
    ]

    self.start()

  def start(self):
    for model in self.pipeline:
      model.start()

  def predict(self, frame):
    predictions = {}
    for model in self.pipeline:
      prediction = model.predict(frame)
      for k, v in prediction.items():
        if k == "play":
          predictions.setdefault("play", [])
          if v is not None:
            predictions["play"].append(v)
        else:
          predictions[k] = v
    return predictions


class DummyPredictor:
  def __init__(self):
    self.idx = 0
    self.move = ['F', 'F', 'R', 'F', 'R', 'F', 'F', 'R', 'F', 'R', 'F', 'F']

  def start(self):
    pass

  def predict(self, frame_array):
    result = self.move[self.idx]
    self.idx += 1
    if self.idx >= len(self.move):
      self.idx = 0
    return {"move": result}


class KeyboardPredictor(DaemonBase):
  def __init__(self, period=0.1):
    super().__init__(period=period)
    self.keyboard = {
      'i': 'F',
      'm': 'B',
      'j': 'L',
      'k': 'R',
      's': 'S'
    }
    self.c = 'S'
    self.m = 'S'
    self.k = 's'

  def loop(self):
    import sys
    import tty
    import termios
    old_settings = termios.tcgetattr(sys.stdin)
    try:
      tty.setraw(sys.stdin.fileno())
      self.k = sys.stdin.read(1)
      self.read_commands()
    finally:
      termios.tcsetattr(sys.stdin, termios.TCSADRAIN, old_settings)

  def read_commands(self):
    self.m = self.keyboard.get(self.k, 'S')
    self.c = self.m

  def predict(self, frame_array):
    result = {"move": self.c}
    if self.k == 'z':
      result["poweroff"] = 1
    return result


class KeyboardSpeedPredictor(KeyboardPredictor):
  def __init__(self, period=0.1):
    super().__init__(period=period)
    self.keyboard_speed = {
      'u': -2,
      'o': +2,
      'y': -10,
      'p': +10
    }
    self.speed = 128

  def read_commands(self):
    if self.k in self.keyboard:
      self.m = self.keyboard[self.k]
    if self.k in self.keyboard_speed:
      self.speed += self.keyboard_speed[self.k]
      self.speed = max(self.speed, 0)
      self.speed = min(self.speed, 255)
    self.c = f"{self.m}:{self.speed}"
