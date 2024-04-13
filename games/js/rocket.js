/*
 * Misho Georgiev game project
 *
 * 2022 Softel Labs
 *
*/

class RocketBase extends BaseMoveConstantVelocity {
  constructor(ctx, w, h, x0, y0, fps_ratio=1, controls={}) {
    super(ctx, w, h, x0, y0, 0, 0, fps_ratio, "blue")
    this.l = 0
    this.angle = 0
    this.controls = controls

    this.vrotate = 0
    this.last_rotate_to = -1
    this.vaccelerate = 0
    this.ratio_fire = new RatioRunner(10 / this.fps_ratio, this.fire.bind(this))

    this.mx = -1
    this.my = -1

    document.addEventListener('keydown', this.on_keydown.bind(this))
    document.addEventListener('keyup', this.on_keyup.bind(this))

    this.mouse_listeners = {
      'mousemove': this.on_mouse_move.bind(this),
      'mouseup': this.on_mouse_up.bind(this),
      'mousedown': this.on_mouse_down.bind(this),
      'dblclick': this.on_dbl_click.bind(this),
    }

    if ("mouse" in this.controls && this.controls["mouse"]) {
      for (const [key, value] of Object.entries(this.mouse_listeners)) {
        document.addEventListener(key, value)
      }
    }
  }

  destructor() {
    document.removeEventListener('keydown', this.on_keydown.bind(this))
    document.removeEventListener('keyup', this.on_keyup.bind(this))

    if ("mouse" in this.controls && this.controls["mouse"]) {
      for (const [key, value] of Object.entries(this.mouse_listeners)) {
        document.removeEventListener(key, value)
      }
    }
  }

  on_mouse_move(e) {
    let rect = this.ctx["BoundingClientRect"]
    this.mx = e.clientX - rect.left
    this.my = e.clientY - rect.top

    let angle_radians = to_radians(this.angle)
    let p0 = [this.x, this.y]
    let p1 = [this.x + 100 * Math.cos(angle_radians), this.y + 100 * Math.sin(angle_radians)]
    let p2 = [this.mx, this.my]

    let angle = this.angle - get_lines_angle([p0, p2], [p0, p1])
    this.rotate_to(angle)
  }
  on_mouse_up(e) {
    this.vaccelerate = 0
  }
  on_mouse_down(e) {
    this.vaccelerate = 0.03 * this.fps_ratio
  }
  on_dbl_click(e) {
    this.fire()
  }

  on_keydown(e) {
    if ('огън' in this.controls && e.key == this.controls["огън"]) {
      this.ratio_fire.set(1)
      return
    }

    if ('ускорение' in this.controls) {
      for (const [key, value] of Object.entries(this.controls["ускорение"])) {
        if (e.key == key) {
          this.vaccelerate = value * this.fps_ratio
          return
        }
      }
    }

    if ('завъртане' in this.controls) {
      for (const [key, value] of Object.entries(this.controls["завъртане"])) {
        if (e.key == key) {
          this.vrotate = value * this.fps_ratio
          return
        }
      }
    }
  }

  on_keyup(e) {
    if ('огън' in this.controls && e.key == this.controls["огън"]) {
      this.ratio_fire.set(0)
      return
    }

    if ('ускорение' in this.controls) {
      for (const [key, value] of Object.entries(this.controls["ускорение"])) {
        if (e.key == key) {
          this.vaccelerate = 0
          return
        }
      }
    }

    if ('завъртане' in this.controls) {
      for (const [key, value] of Object.entries(this.controls["завъртане"])) {
        if (e.key == key) {
          this.vrotate = 0
          return
        }
      }
    }
  }

  move() {
    this.ratio_fire.run()
    this.accelerate(this.vaccelerate)

    if (this.last_rotate_to > 0 && Math.abs(this.angle - this.last_rotate_to) < Math.abs(this.vrotate)) {
      this.rotate(this.angle - this.last_rotate_to)
      this.vrotate = 0
      this.last_rotate_to = -1
    }
    this.rotate(this.vrotate)

    super.move()
  }

  check_collision(x, y, r) {
    return false
  }

  rotate(angle) {
    this.angle += angle
    if (this.angle >= 360) { this.angle -= 360 }
    if (this.angle < 0) { this.angle += 360 }
  }

  rotate_to(angle) {
    let angle_speed = 1.0 + angle / 100
    this.last_rotate_to = angle
    this.vrotate = this.angle < angle ? angle_speed : -angle_speed
  }

  accelerate(a) {}

  fire() {}

  alive() {
    return true
  }

  laser_positions() {
    return []
  }

  laser_collisions(list_movables) {
    return [[], []]
  }

  bonus_collisions(list_bonuses) {
    return []
  }
}


class Rocket extends RocketBase {
  constructor(ctx, w, h, x0=0, y0=0, color="blue", l=10, laser_count=100, fuel=20, fps_ratio=1, controls={}, tag="", volume_bar_pos=[300, 20]) {
    super(ctx, w, h, x0, y0, fps_ratio, controls)
    this.color = color
    this.l = l
    this.tag = tag
    this.volume_bar_pos = volume_bar_pos

    this.thruster_default = 30
    this.thruster = 0
    this.fuel = fuel

    this.a = 0
    this.ax = 0
    this.ay = 0

    this.vx = 0
    this.vy = 0

    this.laser_count = laser_count
    this.lasers = []
    this.weapon_type = 0

    this.fuel_bar = new VolumeBar(this.ctx, this.volume_bar_pos, this.fuel, "Гориво " + this.tag, "blue")
    this.laser_bar = new VolumeBar(this.ctx, [this.volume_bar_pos[0], this.volume_bar_pos[1] + 20], this.laser_count, "Лазер " + this.tag, "red")

    this.bonus_types = [BonusWeapon, BonusLaserCount, BonusFuel]
    this.my_bonuses = {
      "BonusWeapon": function(bonus_value) { this.weapon_type += bonus_value }.bind(this),
      "BonusLaserCount": function(bonus_value) { this.laser_count += bonus_value }.bind(this),
      "BonusFuel": function(bonus_value) { this.fuel += bonus_value }.bind(this)
    }
  }

  accelerate(a) {
    if (this.fuel < a) { a = this.fuel }
    this.fuel -= a

    let angle_radians = to_radians(this.angle)
    this.ax = a * Math.cos(angle_radians)
    this.ay = a * Math.sin(angle_radians)
    this.a = a

    this.vx += this.ax
    this.vy += this.ay

    this.thruster = this.thruster_default
  }

  draw() {
    let angle_radians = to_radians(this.angle)
    let p0 = [this.x, this.y]
    let p1 = [this.x + this.l * Math.cos(angle_radians), this.y + this.l * Math.sin(angle_radians)]
    let p2 = [this.x - this.l * Math.cos(angle_radians), this.y - this.l * Math.sin(angle_radians)]
    let pr = line_perpendicular(p1, p2, this.l)
    let p3 = pr[0]
    let p4 = pr[1]

    draw_line(this.ctx, p1, p2, this.color, 2)
    draw_line(this.ctx, p3, p1, "green", 3)
    draw_line(this.ctx, p4, p1, "red", 3)
    draw_line(this.ctx, p3, p0, this.color, 2)
    draw_line(this.ctx, p4, p0, this.color, 2)

    draw_circle(this.ctx, p1[0], p1[1], 10, "red")

    this.pr_left = line_perpendicular(p4, p3, 15)
    this.pr_right = line_perpendicular(p3, p4, 15)
    draw_line(this.ctx, this.pr_left[0], this.pr_left[1], "blue", 1)
    draw_line(this.ctx, this.pr_right[0], this.pr_right[1], "blue", 1)

    this.draw_mouse()

    if (this.thruster > 0) {
      let l = this.a * 1000
      let p1 = [this.x - this.l * Math.cos(angle_radians), this.y - this.l * Math.sin(angle_radians)]
      let da = 0.3
      let p2 = [p1[0] - l * Math.cos(angle_radians - da), p1[1] - l * Math.sin(angle_radians - da)]
      let p3 = [p1[0] - l * Math.cos(angle_radians + da), p1[1] - l * Math.sin(angle_radians + da)]
      draw_contours(this.ctx, [p1, p2, p3], "red", 1, true)
      this.thruster -= 1
    }

    let txt = "V ( " + this.vx.toFixed(2) + " , " + this.vy.toFixed(2) + " ) A " + this.angle.toFixed(2) //Math.round(this.angle, 3)
    draw_text(this.ctx, txt, this.volume_bar_pos[0], this.volume_bar_pos[1] + 50, 10, "white")
    // draw_text(this.ctx, this.x.toFixed(2) + ", " + this.y.toFixed(2), 5, 50, 10, "white")

    this.move_lasers()

    this.fuel_bar.draw(this.fuel)
    this.laser_bar.draw(this.laser_count)
  }

  draw_mouse() {
    if ("mouse" in this.controls && this.controls["mouse"]) {
      let p0 = [this.x, this.y]
      let angle_radians = to_radians(this.angle)
      let l = Math.sqrt((p0[0] - this.mx) ** 2 + (p0[1] - this.my) ** 2)
      draw_line(this.ctx, p0, [this.mx, this.my], "#555555", 1)
      draw_line(this.ctx, p0, [this.x + l * Math.cos(angle_radians), this.y + l * Math.sin(angle_radians)], "#880000", 1)
    }
  }

  move_lasers() {
    let lasers_to_remove = []
    for (let i = 0; i < this.lasers.length; i++) {
      let laser = this.lasers[i];
      if (! laser.move()) { lasers_to_remove.push(i) }
    }
    for (let i = 0; i < lasers_to_remove.length; i++) {
      this.remove_laser(lasers_to_remove[i])
    }
  }

  fire() {
    if (this.laser_count > 0) {
      this.laser_count -= 1;
      this.lasers.push(new Laser(this.ctx, this.W, this.H, this.x, this.y, this.angle, 2.5, this.fps_ratio))

      if (this.weapon_type > 0) {
        this.lasers.push(new Laser(this.ctx, this.W, this.H, this.pr_left[0][0], this.pr_left[0][1], this.angle, 3.0, this.fps_ratio))
        this.lasers.push(new Laser(this.ctx, this.W, this.H, this.pr_right[1][0], this.pr_right[1][1], this.angle, 3.0, this.fps_ratio))
      }

      if (this.weapon_type > 1) {
        this.lasers.push(new Laser(this.ctx, this.W, this.H, this.pr_left[0][0], this.pr_left[0][1], this.angle - 30, 2.0, this.fps_ratio))
        this.lasers.push(new Laser(this.ctx, this.W, this.H, this.pr_right[1][0], this.pr_right[1][1], this.angle + 30, 2.0, this.fps_ratio))
      }

      if (this.weapon_type > 2) {
        this.lasers.push(new Laser(this.ctx, this.W, this.H, this.pr_left[0][0], this.pr_left[0][1], this.angle - 60, 1.5, this.fps_ratio))
        this.lasers.push(new Laser(this.ctx, this.W, this.H, this.pr_right[1][0], this.pr_right[1][1], this.angle + 60, 1.5, this.fps_ratio))
      }

      if (this.weapon_type > 3) {
        this.lasers.push(new Laser(this.ctx, this.W, this.H, this.x, this.y, this.angle, -2.5, this.fps_ratio))
      }
    }
  }

  laser_positions() {
    let positions = []
    for (let i = 0; i < this.lasers.length; i++) {
      positions.push([this.lasers[i].p1, this.lasers[i].p2, this.lasers[i].angle])
    }
    return positions
  }

  laser_collisions(list_movables) {
    let list_movable_collisions = []
    let list_laser_collisions = []
    for (let i = 0; i < list_movables.length; i++) {
      for (let j = 0; j < this.lasers.length; j++) {
        if (j in list_laser_collisions) { continue }

        let d1 = Math.sqrt((list_movables[i].x - this.lasers[j].p1[0]) ** 2 + (list_movables[i].y - this.lasers[j].p1[1]) ** 2)
        let d2 = Math.sqrt((list_movables[i].x - this.lasers[j].p2[0]) ** 2 + (list_movables[i].y - this.lasers[j].p2[1]) ** 2)
        if (d1 < list_movables[i].r || d2 < list_movables[i].r) {
          list_movable_collisions.push(i)
          list_laser_collisions.push(j)
          break
        }
      }
    }
    return [list_movable_collisions, list_laser_collisions]
  }

  remove_laser(idx) {
    if (idx < this.lasers.length) { this.lasers.splice(idx, 1) }
  }

  check_collision(x, y, r) {
    let d = Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2)
    return d < r + this.l
  }

  bonus_collisions(list_movables) {
    let list_collected_bonuses = []
    for (let i = 0; i < list_movables.length; i++) {
      let pb = [list_movables[i].x + list_movables[i].l / 2, list_movables[i].y + list_movables[i].l / 2]
      let d = Math.sqrt((pb[0] - this.x) ** 2 + (pb[1] - this.y) ** 2)
      if (d < this.l + list_movables[i].l / 2) {
        list_collected_bonuses.push(i)
        this.my_bonuses[list_movables[i].name()](list_movables[i].value())
      }
    }

    return list_collected_bonuses
  }
}


class RocketExplosion extends RocketBase {
  constructor(ctx, w, h, x0, y0, fps_ratio=1) {
    super(ctx, w, h, x0, y0, fps_ratio)
    this.r = 3
  }

  move() {
    draw_circle(this.ctx, this.x, this.y, this.r, "red", true)
    this.r += 0.8 * this.fps_ratio
  }

  alive() {
    return this.r < 100
  }
}