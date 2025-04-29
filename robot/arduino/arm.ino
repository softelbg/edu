#include <Braccio.h>
#include <Servo.h>

Servo base;
Servo shoulder;
Servo elbow;
Servo wrist_ver;
Servo wrist_rot;
Servo gripper;

void setup() {
  Serial.begin(9600);
  Braccio.begin();

  // Initial safe position
  Braccio.ServoMovement(20, 90, 90, 90, 90, 90, 10);
}

void loop() {
  if (Serial.available()) {
    String input = Serial.readStringUntil('\n');
    input.trim();  // remove any newline or spaces

    if (input.startsWith("mv:")) {
      input.remove(0, 3);  // remove "mv:"
      int values[7];
      int i = 0;

      while (input.length() > 0 && i < 7) {
        int index = input.indexOf(',');
        if (index == -1) {
          values[i++] = input.toInt();
          break;
        } else {
          values[i++] = input.substring(0, index).toInt();
          input = input.substring(index + 1);
        }
      }

      if (i == 7) {
        // All 7 values read successfully: step, m1 to m6
        Braccio.ServoMovement(
          values[0], // step
          values[1], // m1 - base
          values[2], // m2 - shoulder
          values[3], // m3 - elbow
          values[4], // m4 - wrist_ver
          values[5], // m5 - wrist_rot
          values[6]  // m6 - gripper
        );
        Serial.println("OK");
      } else {
        Serial.println("ERR: Invalid format");
      }
    } else {
      Serial.println("ERR: Unknown command");
    }
  }
}
