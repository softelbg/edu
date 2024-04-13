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

import serial
import time


class SerialDummy:
  def __init__(self, address='/dev/ttyACM0', speed=9600):
    print(type(self).__name__, address, speed)

  def close(self):
    print(type(self).__name__)

  def send(self, value):
    print(type(self).__name__, "send", value)


class SerialCom:
  def __init__(self, address='/dev/ttyACM0', speed=9600):
    self.address = address
    self.speed = speed
    self.com = serial.Serial(self.address, self.speed)
    print(type(self).__name__, self.address, self.speed, "warming...")
    time.sleep(2)

  def close(self):
    self.com.close()

  def send(self, value):
    self.com.write(f"{value}\n".encode())