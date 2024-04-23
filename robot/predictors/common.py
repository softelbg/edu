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
import base64
import openai
import cv2
import numpy as np

from robot.tools.daemon import *


class DummyPredictor:
  def __init__(self):
    self.idx = 0
    self.move = ['F', 'F', 'R', 'F', 'R', 'F', 'F', 'R', 'F', 'R', 'F', 'F']

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


class OpenAIPredictor:
  def __init__(self):
    openai.api_key = os.environ["OPENAI_API_KEY"]
    self.prompt = "You are a robot with 5 possible actions: forward, backward, left, right and stop. Every command will move the robot for 0.5 seconds. Look at the image and start searching for a computer backpack. If not visible, start rotation. You should respond only with one letter of this list ['F','B','R','L','S']."

  def predict(self, frame_array):
    buffer = cv2.imencode('.jpg', frame_array)[1].tostring()
    image_base64 = base64.b64encode(buffer).decode('utf-8')

    completion_params = {
      "model": "text-davinci-003",
      "prompt": f"{self.prompt}\n{image_base64}",
      "temperature": 0.7,
      "max_tokens": 100,
      "top_p": 1.0,
      "frequency_penalty": 0.0,
      "presence_penalty": 0.0,
      "stop": ["\n"]
    }

    response = openai.Completion.create(**completion_params)
    print(response.choices[0].text.strip())
    return {"move": response.choices[0].text.strip()}
