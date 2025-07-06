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
import base64
import numpy as np

from sciveo.tools.daemon import *
from sciveo.tools.timers import FPSCounter


class BaseDaemonPredictor(DaemonBase):
  def __init__(self):
    super().__init__(period=5)

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
    self.test_search_object()

  def test_search_object(self):
    search_object = "bottle of water"
    command_prompt = " ".join([
      f"Start searching for a {search_object}.",
      f"If the {search_object} is not visible, start rotation to the right.",
      f"When {search_object} is visible start moving toward it.",
      f"Try to reposition and move so the {search_object} is in the center of the image.",
      f"When distance to the {search_object} is less than 30 centimeters then stop.",
      f"When obstacles in front try to avoid collision, making turn around the obstacle object."
    ])
    self.set_prompt(command_prompt)

  def set_prompt(self, command_prompt):
    if isinstance(command_prompt, list):
      command_prompt = " ".join(command_prompt)

    # response_template = "{ 'move': '<command>', 'move word': <command as word>, 'reason': '<the reason why chose move command>', 'description': '<describe what you see in the image>' }"
    response_template = "{ 'move': '<command>', 'move free': <any move command>, 'reason': '<the reason why chose move free command>', }"
    self.prompt = " ".join([
      "You are a robot with 5 possible actions: Forward, Backward, Left, Right and Stop.",
      "Every command will move the robot for 0.5 seconds.",
      "Look at the image from the front facing robot camera for navigation.",
      command_prompt,
      # "You should respond with move command and description why you choose this command. Attention to details and carefully chose move command!",
      "The move commands are only from this list ['F','B','R','L','S'] as these are the first letters of the possible actions: Forward, Backward, Right, Left and Stop.",
      "Keep attention to the move command and try to be very accurate.",
      "When not sure what to do start rotation to the right.",
      # "If choose 'B' Backward move direction, explain int the reason section why not chose rotation to the Left or Right instead!",
      # "The move command description should explain the reasons why it is choosen.",
      "The move free command is any type of move related command.",
      f"Respond with a json dict like {response_template} and be strict of the json validity."
    ])
    debug(type(self).__name__, "set prompt", self.prompt)

  def frame_base64(self, frame):
    buffer = cv2.imencode('.jpg', frame)[1].tostring()
    return base64.b64encode(buffer).decode('utf-8')

  def predict(self, frame):
    with self.lock:
      self.frame = frame
      current_prediction = self.prediction
      self.prediction = {"move": 'S'}
      return current_prediction
