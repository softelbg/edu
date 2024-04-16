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


class FPSCounter:
  def __init__(self, period=10, tag=""):
    self.period = period
    self.tag = tag
    self.n = 0
    self.t1 = time.time()

  def update(self):
    self.n += 1
    t2 = time.time()
    if t2 - self.t1 > self.period:
      print(type(self).__name__, self.tag, "FPS", self.n / (t2 - self.t1))
      self.n = 0
      self.t1 = time.time()


class TimerExec:
  def __init__(self, fn, period=1.0):
    self.fn = fn
    self.period = period
    self.t1 = time.time()

  def run(self):
    t2 = time.time()
    if t2 - self.t1 > self.period:
      self.fn()
      self.t1 = time.time()


class Timer:
  def __init__(self):
    self.start()

  def start(self):
    self.start_at = time.time()

  def stop(self):
    self.end_at = time.time()
    return self.elapsed()

  def elapsed(self):
    return self.end_at - self.start_at
