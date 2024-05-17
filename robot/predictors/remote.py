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
import requests
from openai import OpenAI
import cv2
import numpy as np

from sciveo.common.tools.logger import *
from robot.predictors.base import BaseRobotPredictor


class LocalClientPredictor(BaseRobotPredictor):
  def __init__(self, ip="localhost", port=8901, proto="http"):
    super().__init__()
    self.predictor_name = "TextImageChat"
    self.auth_token = os.environ['SCI_API_AUTH_TOKEN']
    self.url = f"{proto}://{ip}:{port}/{self.auth_token}/predict"

  def remote_predict(self, params):
    headers = {"Authorization": f"Bearer {self.auth_token}"}
    response = requests.post(self.url, json=params, headers=headers)

    if response.status_code == 200:
      data = response.json()
    else:
      error(f"Request failed with status code {response.status_code}")
      data = {"error": response.status_code}
    return data

  def predict_frame(self, frame_array):
    buffer = cv2.imencode('.jpg', frame_array)[1].tostring()
    image_base64 = base64.b64encode(buffer).decode('utf-8')

    params = {
      "predictor": self.predictor_name,
      "X": [
        {
          "prompt": self.prompt,
          "image": image_base64
        }
      ]
    }

    result = self.remote_predict(params)
    debug(type(self).__name__, "predict", result)

    result = result[self.predictor_name][0].replace('.', '')

    prediction = {"move": result}
    prediction["play"] = self.draw_prediction(prediction)
    return prediction



class OpenAIPredictor(BaseRobotPredictor):
  def __init__(self):
    super().__init__()
    self.client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

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
    debug(type(self).__name__, "predict", result)
    prediction = {"move": result}
    prediction["play"] = self.draw_prediction(prediction)
    return prediction
