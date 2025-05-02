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

from sciveo.tools.daemon import *
from sciveo.tools.timers import *
from robot.predictors.depth import *
from robot.predictors.remote import *


class ArmPipelinePredictor:
  def __init__(self):
    self.pipeline = [
      ArmKeyboardPredictor()
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


class ArmKeyboardPredictor(DaemonBase):
  def __init__(self, period=0.1):
    super().__init__(period=period)
    self.keyboard = {
      'q': 'F',
      'w': 'B',
      'a': 'L',
      's': 'R',
      'z': 'S'
    }


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
    return result
