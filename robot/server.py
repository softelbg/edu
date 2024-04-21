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
import requests
import time
from flask import Flask, jsonify, render_template, request, url_for, Response
from waitress import serve

from robot.tools.cam import *
from robot.tools.serial import *


cam = CameraDaemon()
com = SerialDummy()

app = Flask(__name__)

@app.route('/frame')
def frame():
  # return Response(cam.read_buf(), mimetype='multipart/x-mixed-replace; boundary=frame')
  return Response(cam.read_buf(), mimetype='image/jpeg')


@app.route('/command')
def command():
  data = request.args.to_dict()
  print(data)
  if "move" in data:
    com.send(data["move"])
  if "poweroff" in data:
    os.system("sudo poweroff")
  return jsonify(data)


if __name__ == '__main__':
  cam.start()

  serve(app, host='0.0.0.0', port=9901)

  cam.close()
  ser.close()