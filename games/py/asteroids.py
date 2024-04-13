import cv2
import numpy as np

from rocket import *
from asteroid import *
from volume_bar import *


def main():

  W = 1200
  H = 800

  # rockets = [
  #   SimpleRocket(x0=100, y0=100, color=(0, 0, 255)),
  #   Rocket(x0=200, y0=200, color=(0, 255, 0))
  # ]

  # from circle import *
  # circles = [
  #   Circle(x0=300, y0=300, r=100, vx0=0.1, vy0=0.2),
  #   Circle(x0=350, y0=350, r=150, vx0=0.3, vy0=0.3, color=(255, 0, 0)),
  #   Circle(x0=450, y0=450, r=200, vx0=0.4, vy0=0.1, color=(0, 255, 0)),
  # ]

  rocket = Rocket(x0=50, y0=50, color=(255, 255, 0), txt_pos=(300, 20), laser_count=200)

  asteroids = []

  dv = 1.1
  while(len(asteroids) < 30):
    x0 = np.random.randint(200, W)
    y0 = np.random.randint(200, H)
    r0 = np.random.randint(5, 70)
    is_usable = True
    for asteroid in asteroids:
      d = math.sqrt((asteroid.x - x0) ** 2 + (asteroid.y - y0) ** 2)
      if d < (asteroid.r + r0) * 1.2:
        is_usable = False
        break

    if is_usable:
      asteroids.append(
        Asteroid(
          x0, y0,
          np.random.uniform(-dv, dv),
          np.random.uniform(-dv, dv),
          r0,
          color=(255, 255, 255),
          size_contour=10
        )
      )

  rocket_lives = 10
  asteroids_removed = 0

  rocket_lives_bar = VolumeBar((200, 20), rocket_lives, name="LIVE", color=(0, 255, 0))

  vrotate = 0

  while(True):
    k = cv2.waitKey(1)
    if k == 27:    # Esc key to stop
      break

    if k == ord('u'):
      rocket.accelerate(0.1)
    if k == ord('i'):
      rocket.accelerate(0.2)
    if k == ord('o'):
      rocket.accelerate(0.3)
    if k == ord('m'):
      rocket.fire()
    if k == ord('j'):
      vrotate = -2
    if k == ord('k'):
      vrotate = 0
    if k == ord('l'):
      vrotate = 2

    rocket.rotate(vrotate)

    frame = np.zeros(shape=[H, W, 3], dtype=np.uint8)

    rocket.move(frame)

    for asteroid in asteroids:
      asteroid.move(frame)

    for i in range(len(asteroids)):
      for j in range(i + 1, len(asteroids)):
        d = math.sqrt((asteroids[i].x - asteroids[j].x) ** 2 + (asteroids[i].y - asteroids[j].y) ** 2)
        if d < asteroids[i].r + asteroids[j].r:
          vx1 = ((asteroids[i].r - asteroids[j].r) * asteroids[i].vx + 2 * asteroids[j].r * asteroids[j].vx) / (asteroids[i].r + asteroids[j].r)
          vy1 = ((asteroids[i].r - asteroids[j].r) * asteroids[i].vy + 2 * asteroids[j].r * asteroids[j].vy) / (asteroids[i].r + asteroids[j].r)
          vx2 = ((asteroids[j].r - asteroids[i].r) * asteroids[j].vx + 2 * asteroids[i].r * asteroids[i].vx) / (asteroids[i].r + asteroids[j].r)
          vy2 = ((asteroids[j].r - asteroids[i].r) * asteroids[j].vy + 2 * asteroids[i].r * asteroids[i].vy) / (asteroids[i].r + asteroids[j].r)
          asteroids[i].vx = vx1
          asteroids[i].vy = vy1
          asteroids[j].vx = vx2
          asteroids[j].vy = vy2

    laser_positions = rocket.laser_positions()
    for asteroid in asteroids:
      for i, laser in enumerate(laser_positions):
        # d1 = np.linalg.norm(np.array([asteroid.x, asteroid.y]) - np.array([laser[0][0], laser[0][1]]))
        # d2 = np.linalg.norm(np.array([asteroid.x, asteroid.y]) - np.array([laser[1][0], laser[1][1]]))
        d1 = math.sqrt((asteroid.x - laser[0][0]) ** 2 + (asteroid.y - laser[0][1]) ** 2)
        d2 = math.sqrt((asteroid.x - laser[1][0]) ** 2 + (asteroid.y - laser[1][1]) ** 2)
        if d1 < asteroid.r or d2 < asteroid.r:
          asteroids.remove(asteroid)
          rocket.remove_laser(i)
          asteroids_removed += 1

          if asteroid.r > 10:
            angle1 = to_radians(laser[2] + 90)
            angle2 = to_radians(laser[2] - 90)
            asteroids.append(
              Asteroid(
                asteroid.x + math.cos(angle1) * (asteroid.r / 1.9),
                asteroid.y + math.sin(angle1) * (asteroid.r / 1.9),
                math.cos(angle1) * asteroid.vx,
                math.sin(angle1) * asteroid.vy,
                asteroid.r / 2,
                color=(255, 255, 255),
                size_contour=10
              )
            )
            asteroids.append(
              Asteroid(
                asteroid.x + math.cos(angle2) * (asteroid.r / 1.9),
                asteroid.y + math.sin(angle2) * (asteroid.r / 1.9),
                math.cos(angle2) * asteroid.vx,
                math.sin(angle2) * asteroid.vy,
                asteroid.r / 2,
                color=(255, 255, 255),
                size_contour=10
              )
            )

          break

    for asteroid in asteroids:
      if rocket.check_collision(asteroid.x, asteroid.y, asteroid.r):
        asteroids.remove(asteroid)
        rocket = RocketExplosion(rocket.x, rocket.y)
        rocket_lives -= 1
        break

    if not rocket.alive():
      if rocket_lives > 0:
        rocket = Rocket(x0=rocket.x, y0=rocket.y, color=(255, 255, 0), txt_pos=(300, 20), laser_count=len(asteroids) * 10)
      else:
        break

    if len(asteroids) == 0 and rocket_lives > 0:
      rocket = Rocket(x0=400, y0=400, color=(255, 255, 0), txt_pos=(300, 20), l=50)
      txt = "Winner"
      rocket_lives = -1
    else:
      txt = "Asteroids {} / {}".format(len(asteroids), asteroids_removed)
    cv2.putText(frame, txt, (5, 20), fontFace=cv2.FONT_HERSHEY_SIMPLEX, fontScale=0.5, color=(255, 255, 255), thickness=1)

    rocket_lives_bar.draw(frame, rocket_lives)

    cv2.imshow('asteroids', frame)



if __name__=='__main__':
        main()


