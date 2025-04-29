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

from sciveo.tools.logger import *
from robot.tools.serial import SerialCom


class RoboArmSerial(SerialCom):
  def __init__(self, port='/dev/ttyACM0', baudrate=9600, timeout=2):
    super().__init__(port, baudrate, timeout)

    self.move_range = [
      [0, 180],
      [0, 90],
      [0, 100],
      [0, 100],
      [0, 180],
      [0, 90],
    ]

  def move(self, step, M):
    for i in range(M):
      M[i] = max(self.move_range[i][0], M[i])
      M[i] = min(self.move_range[i][1], M[i])
    cmd = f"mv:{step},{M[0]},{M[1]},{M[2]},{M[3]},{M[4]},{M[5]}\n"
    self.com.write(cmd.encode('utf-8'))
    response = self.com.readline().decode('utf-8').strip()
    if response != "OK":
      error(f"Move command failed: {response}")
    return response

  def interactive(self):
    info("Enter movement commands (e.g., mv:30,90,90,90,90,90,10), or 'exit' to quit:")
    while True:
      try:
        line = input(">> ").strip()
        if line.lower() == 'exit':
          info("Exiting interactive mode.")
          break
        if line.startswith("mv:"):
          cmd = line[3:].split(",")
          debug("MV", cmd)
          response = self.move(cmd[0], cmd[1:])
          info("Arduino:", response)
      except KeyboardInterrupt:
        info("\nInterrupted by user.")
        break
      except Exception as e:
        exception(e)


if __name__ == "__main__":
  arm = RoboArmSerial(port="/dev/ttyACM0")
  try:
    arm.interactive()
  finally:
    arm.close()