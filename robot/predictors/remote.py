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
from openai import OpenAI
import cv2
import numpy as np

from robot.predictors.base import BaseDaemonPredictor


class OpenAIPredictor(BaseDaemonPredictor):
  def __init__(self):
    super().__init__()
    self.client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
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
    print(type(self).__name__, "set prompt", self.prompt)

  def predict_frame(self, frame_array):
    buffer = cv2.imencode('.jpg', frame_array)[1].tostring()
    image_base64 = base64.b64encode(buffer).decode('utf-8')

    PROMPT_MESSAGES = [
      {
        "role": "user",
        "content": [
          self.prompt,
          {"image": image_base64, "resize": 768},
        ],
      },
    ]

    params = {
      "model": "gpt-4o",
      "messages": PROMPT_MESSAGES,
      "max_tokens": 32
    }

    response = self.client.chat.completions.create(**params)
    result = response.choices[0].message.content.strip()
    print(type(self).__name__, "predict", result)
    prediction = {"move": result}
    prediction["play"] = self.draw_prediction(prediction)
    return prediction

  def predict(self, frame):
    with self.lock:
      self.frame = frame
      current_prediction = self.prediction
      self.prediction = {"move": 'S'}
      return current_prediction