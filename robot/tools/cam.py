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
import time
import threading

from robot.tools.daemon import *
from robot.tools.timers import FPSCounter


class CameraDaemon(DaemonBase):
  def __init__(self, cam_id=0, period=0.01, path="/dev/shm/frame.jpg"):
    super().__init__(period=period)
    self.path = path
    self.frame = None
    self.cap = cv2.VideoCapture(cam_id)
    self.lock_frame = threading.Lock()
    print(type(self).__name__, cam_id, "warming...")
    time.sleep(1)
    self.fps = FPSCounter(period=10, tag="cam")

  def close(self):
    self.cap.release()

  def read(self):
    with self.lock_frame:
      return self.frame

  def read_buf(self):
    frame = self.read()
    ret, buffer = cv2.imencode('.jpg', frame)
    return buffer.tobytes()

  def loop(self):
    with self.lock_frame:
      ret, self.frame = self.cap.read()
      self.fps.update()
      # if ret:
      #   cv2.imwrite(self.path, self.frame, [cv2.IMWRITE_JPEG_QUALITY, 100])
