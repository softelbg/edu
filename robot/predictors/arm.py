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
from robot.predictors.common import PipelinePredictor


class ArmOpenAIPredictor(OpenAIPredictor):
  def test_search_object(self):
    command_prompt = " ".join([
      "Start searching for a bottle of water and try to pick it.",
      "When picked, shake it."
    ])
    self.set_prompt(command_prompt)

  def set_prompt(self, command_prompt):
    if isinstance(command_prompt, list):
      command_prompt = " ".join(command_prompt)

    response_template = "{ 'move': 'mv:200,<arm link 1 degree>,<arm link 2 degree>,<arm link 3 degree>,<arm link 4 degree>,<arm link 5 degree>,<arm link 6 degree>' }"
    self.prompt = " ".join([
      "You are a robot arm with 6 links DOF. The last one (number 6 is a gripper).",
      "When the object is in the reach of the gripper (6th motor), grab it!",
      "Every command will move the arm to the specified degrees.",
      "Look at the image from the robot arm camera for navigation.",
      command_prompt,
      "The move command should include 6 DOF degrees with limits as [[0, 180], [0, 90], [0, 100], [0, 100], [0, 180], [0, 90]].",
      "Keep attention to the move command and try to be very accurate.",
      "When not sure what to do, just return same degrees as last time.",
      f"Respond with a json dict like {response_template} and be strict of the json validity."
    ])
    debug(type(self).__name__, "set prompt", self.prompt)


class ArmPipelinePredictor(PipelinePredictor):
  def __init__(self):
    self.pipeline = [
      # ArmOpenAIPredictor(),
      DepthEstimator(),

      # LocalClientPredictor(host="sof-1.softel.bg", port=8901, proto="https"),

      # ArmKeyboardPredictor(),
      # ArmSimulationPredictor(),
      # ArmDummyPredictor(),
    ]

    self.start()

  def predict(self, frame):
    predictions = super().predict(frame)
    if "move" in predictions:
      predictions["move"] = predictions["move"].replace("<", "").replace(">", "")
      debug("move", predictions["move"])
    return predictions


class ArmDummyPredictor:
  def __init__(self):
    self.idx = 0

  def start(self):
    pass

  """
  Robo Arm initialisation and

  1 base: 0 - 180
  2 :  45 - 90   max(0 - 90)
  3 :  0 - 80
  4:   0 - 120
  5:   0 - 180
  6:   0 - 90
  """
  def predict(self, frame_array):

    arm_bounds = {
      0: [0, 180],
      1: [45, 90],
      2: [0, 80],
      3: [0, 120],
      4: [0, 120],
      5: [0, 180],
      6: [0, 90]
    }

    offset = 0
    max_idx = 90
    step = 5

    if self.idx >= max_idx - offset:
      self.idx = 0
    m1 = offset + self.idx
    self.idx += step

    return {
      # "move": f"mv:200,{m1},{m1},{m1},{m1},{m1},{m1}",
      "move": f"mv:200,90,60,60,60,90,{m1}",
      "play": frame_array
    }


class ArmSimulationPredictor:
  def __init__(self):
    self.arms = []
    self.bounds = {
      0: [45, 135],
      1: [45, 90],
      2: [0, 80],
      3: [0, 120],
      4: [0, 120],
      5: [0, 180],
      6: [0, 90]
    }

  def start(self):
    for i in range(6):
      self.arms.append(45)

  def predict(self, frame_array):
    step = 5

    cmd = "mv:300"
    for i in range(len(self.arms)):
      self.arms[i] += step
      if self.arms[i] > self.bounds[i][1]:
        self.arms[i] = self.bounds[i][0]
      cmd += f",{self.arms[i]}"

    return {
      "move": cmd,
      "play": frame_array
    }


class ArmSimulationPredictor2:
  def __init__(self):
    self.arms = []
    self.bounds = {
      0: [0, 180],
      1: [45, 90],
      2: [0, 80],
      3: [0, 120],
      4: [0, 120],
      5: [0, 180],
      6: [0, 90]
    }
    self.frame_count = 0

  def start(self):
    self.arms = [90, 60, 40, 60, 60, 90, 45]  # start in a mid-rest pose

  def predict(self, frame_array):
    self.frame_count += 1
    phase = (self.frame_count // 20) % 4

    if phase == 0:
      # Wave up
      self.arms[3] = min(self.arms[3] + 3, self.bounds[3][1])
      self.arms[4] = max(self.arms[4] - 3, self.bounds[4][0])
    elif phase == 1:
      # Wave down
      self.arms[3] = max(self.arms[3] - 3, self.bounds[3][0])
      self.arms[4] = min(self.arms[4] + 3, self.bounds[4][1])
    elif phase == 2:
      # Point forward
      self.arms[1] = 60
      self.arms[2] = 20
      self.arms[5] = 90
      self.arms[6] = 30
    elif phase == 3:
      # Return to rest
      self.arms = [90, 60, 40, 60, 60, 90, 45]

    # Build the command
    cmd = "mv:200"
    for i in range(len(self.arms)):
      cmd += f",{int(self.arms[i])}"

    return {
      "move": cmd,
      "play": frame_array
    }


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
    return {
      "move": "mv:90,90,90,90,90,90",
      "play": frame_array
    }
