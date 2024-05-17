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

from sciveo.common.tools.logger import *
from sciveo.common.tools.daemon import *
from sciveo.common.tools.timers import FPSCounter


class CameraDaemon(DaemonBase):
  def __init__(self, cam_id=0, period=0.01):
    super().__init__(period=period)
    self.frame = None
    self.cap = cv2.VideoCapture(cam_id)
    self.lock_frame = threading.Lock()
    debug(type(self).__name__, cam_id, "warming...")
    time.sleep(1)
    self.fps = FPSCounter(period=10, tag="cam")

    self.writers = [
      # cv2.VideoWriter("rtsp://0.0.0.0:554/s1", fourcc=cv2.VideoWriter_fourcc(*'XVID'), fps=30.0, frameSize=(640, 480))
    ]

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
    for writer in self.writers:
      writer.write(self.frame)