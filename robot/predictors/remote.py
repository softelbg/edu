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
import json
from openai import OpenAI
import cv2
import numpy as np

import sciveo
from sciveo.tools.logger import *
from robot.predictors.base import BaseRobotPredictor


class ClientSimple:
  def __init__(self, url="http://localhost:8901", verify=True):
    self.auth_token = os.environ['SCI_API_AUTH_TOKEN']
    self.api_prefix = os.environ['SCI_API_PREFIX']
    self.url = f"{url}/{self.api_prefix}/predict"
    self.verify = verify

  def predict(self, params):
    headers = {"Authorization": f"Bearer {self.auth_token}"}
    debug("predicting", self.url, headers)
    response = requests.post(self.url, json=params, headers=headers, verify=self.verify)
    debug("predict response", response)

    if response.status_code == 200:
      data = response.json()
    else:
      error(f"Request [{self.url}] failed with status code {response.status_code}")
      data = {"error": response.status_code}
    return data


class LocalClientPredictor(BaseRobotPredictor):
  def __init__(self, host=None, port=8901, proto="http"):
    super().__init__()
    if host is None:
      host = self.scan_network(port)
    self.predictor_name = "TextImageChat"
    self.auth_token = os.environ['SCI_API_AUTH_TOKEN']
    self.client = ClientSimple(url=f"{proto}://{host}:{port}", verify=False)

    self.history = []

    self.prompt = "describe what you see in the image, also try to read all text you see"

  def scan_network(self, port):
    list_ip = sciveo.network(timeout=1.0, localhost=False).scan_port(port=port)
    if len(list_ip) > 0:
      return list_ip[0]
    return "127.0.0.1"

  def predict_frame(self, frame):
    images = []
    messages = []

    for i, h in enumerate(self.history[::-1]):
      images.append(h["image"])
      messages.append({
        "role": "user",
        "content": [
          {"type": "image"},
          {"type": "text", "text": f"Previous {len(self.history) - i} image, move {h['prediction']['move']}"},
        ]
      })
      messages.append({
        "role": "assistant",
        "content": [
          {"type": "text", "text": h["prediction"]},
        ]
      })

    image_base64 = self.frame_base64(frame)
    images.append(image_base64)
    messages.append({
      "role": "user",
      "content": [
        {"type": "image"},
        {"type": "text", "text": self.prompt},
      ]
    })

    debug("messages", messages)

    params = {
      "predictor": self.predictor_name,
      "X": [{
        "messages": messages,
        "images": images
      }]
    }

    prediction = self.client.predict(params)
    debug("predict", prediction)
    prediction_str_dict = prediction[self.predictor_name][0].replace('{', '').replace('}', '').replace('\'', '\"').rstrip(",.")
    if prediction_str_dict[-1] != '\"':
      prediction_str_dict += '\"'
    prediction_str_dict = "{" + prediction_str_dict + "}"
    debug("prediction_str_dict", prediction_str_dict)
    prediction = json.loads(prediction_str_dict)
    debug("predict", prediction)

    self.history.insert(0, {
      "image": image_base64,
      "prediction": {"move": prediction["move"]}
    })
    self.history = self.history[:1]

    prediction["play"] = self.draw_prediction(prediction)
    return prediction


class OpenAIPredictor(BaseRobotPredictor):
  def __init__(self):
    super().__init__()
    self.client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

  def predict_frame(self, frame):
    PROMPT_MESSAGES = [
      {
        "role": "user",
        "content": [
          self.prompt,
          {"image": self.frame_base64(frame), "resize": 768},
        ],
      },
    ]

    params = {
      "model": "gpt-4o",
      "messages": PROMPT_MESSAGES,
      "max_tokens": 500
    }

    response = self.client.chat.completions.create(**params)
    prediction = response.choices[0].message.content.strip()
    debug("predict", prediction)
    prediction = prediction.split("{")[1].split("}")[0].replace("\n", "")
    prediction = "{" + prediction + "}"
    debug("predict", prediction)
    prediction = json.loads(prediction)
    prediction["play"] = self.draw_prediction(prediction)
    return prediction
