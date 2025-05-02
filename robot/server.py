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
import datetime
from flask import Flask, jsonify, request, Response
from waitress import serve

from sciveo.tools.logger import *
from robot.tools.cam import *
from robot.tools.serial import *


cam_car = CameraDaemon(cam_id=0)
com_car = SerialCom(address="/dev/ttyACM0")

cam_arm = CameraDaemon(cam_id=1)
com_arm = SerialCom(address="/dev/ttyACM1")

# com_car = SerialDummy()
# com_arm = SerialDummy()
# com = SerialCom(address="/dev/ttyACM0")
# com = SerialCom(address="/dev/ttyUSB0")

app = Flask(__name__)

@app.route('/frame')
def frame():
  return Response(cam_car.read_buf(), mimetype='image/jpeg')

@app.route('/command')
def command():
  data = request.args.to_dict()
  debug(datetime.datetime.now(), "command", data)
  if "move" in data:
    com_car.send(data["move"])
  if "poweroff" in data:
    os.system("sudo poweroff")
  return jsonify(data)


@app.route('/arm/frame')
def arm_frame():
  return Response(cam_arm.read_buf(), mimetype='image/jpeg')

@app.route('/arm/command')
def arm_command():
  data = request.args.to_dict()
  debug(datetime.datetime.now(), "arm", data)
  if "move" in data:
    com_arm.send(data["move"])
  return jsonify(data)


if __name__ == '__main__':
  cam_car.start()
  cam_arm.start()

  serve(app, host='0.0.0.0', port=9901)

  com_car.close()
  com_arm.close()