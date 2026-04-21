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

import time

import cv2

from sciveo.tools.logger import *
from robot.predictors.audio import AudioPromptPredictor


if __name__ == "__main__":
  predictor = AudioPromptPredictor(period=0.05)
  predictor.start()

  while True:
    prediction = predictor.predict(None)
    if prediction is not None and "play" in prediction:
      cv2.imshow("robot::microphone", prediction["play"])

    payload = predictor.get_prompt_nowait()
    if payload is not None:
      debug("audio prompt", payload)

    key = cv2.waitKey(1) & 0xFF
    if key in [27, ord('q')]:
      break

    time.sleep(0.01)

  predictor.stop()
  cv2.destroyAllWindows()
