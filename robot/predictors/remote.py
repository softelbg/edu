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


class OpenAIPredictor:
  def __init__(self):
    openai.api_key = os.environ["OPENAI_API_KEY"]
    self.prompt = "You are a robot with 5 possible actions: forward, backward, left, right and stop. Every command will move the robot for 0.5 seconds. Look at the image and start searching for a computer backpack. If not visible, start rotation. You should respond only with one letter of this list ['F','B','R','L','S']."

  def start(self):
    pass

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