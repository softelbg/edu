/*
 * Misho Georgiev game project
 *
 * 2025 Softel Labs
 *
*/


class SemiCircle {
  constructor(ctx, w, h, x, y, r, color) {
    this.ctx = ctx
    this.W = w
    this.H = h

    this.x = x
    this.y = y
    this.r = r
    this.color = color
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.r, 1.0 * Math.PI, 2.0 * Math.PI);
    draw_filled(this.ctx, this.color, true)
  }
}


class CannonBall {
  constructor(ctx, w, h, x, y, v, angle, r, g, color) {
    this.ctx = ctx
    this.W = w
    this.H = h

    this.x = x
    this.y = y
    this.v = v
    this.angle = to_radians(angle)
    this.r = r
    this.g = g
    this.color = color

    this.vx = this.v * Math.cos(this.angle)
    this.vy = this.v * Math.sin(this.angle)
  }

  draw() {
    draw_circle(this.ctx, this.x, this.y, this.r, this.color, true)

    this.x += this.vx
    this.y += this.vy

    this.vx += this.g[0]
    this.vy += this.g[1]
  }
}


class Hill extends SemiCircle {
  constructor(ctx, w, h, x, y, r) {
    super(ctx, w, h, x, y, r, "red")
  }
}

class Tank extends SemiCircle {
  constructor(ctx, w, h, x, y, r, g, color, controls={}, name="") {
    super(ctx, w, h, x, y, r, color)

    this.controls = controls
    this.name = name

    this.g = g
    this.angle = 270
    this.turret_len = 2 * this.r

    this.cannon_balls = []

    document.addEventListener('keydown', this.on_keydown.bind(this))
    // document.addEventListener('keyup', this.on_keyup.bind(this))
  }

  on_keydown(e) {
    if ('наляво' in this.controls && e.key == this.controls["наляво"]) {
      this.angle -= 5
      if (this.angle < 190) {
        this.angle = 190
      }
      return
    }

    if ('надясно' in this.controls && e.key == this.controls["надясно"]) {
      this.angle += 5
      if (this.angle > 350) {
        this.angle = 350
      }
      return
    }

    if ('изстрел' in this.controls && e.key == this.controls["изстрел"]) {
      this.cannon_balls.push(
        new CannonBall(this.ctx, this.W, this.H, this.x, this.y, 1.0, this.angle, 5, this.g, "red")
      )
      return
    }
  }

  on_keyup(e) {

  }

  draw() {
    super.draw()

    let angle_radians = to_radians(this.angle)

    let x2 = this.x + this.turret_len * Math.cos(angle_radians)
    let y2 = this.y + this.turret_len * Math.sin(angle_radians)

    draw_line(this.ctx, [this.x, this.y], [x2, y2], this.color, 1)

    for (let i = 0; i < this.cannon_balls.length; i++) {
      this.cannon_balls[i].draw()
    }
  }

  info() {
    return `${this.name}: angle ${this.angle}`;
  }
}