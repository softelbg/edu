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

    this.alive = true

    this.explosion = 0
  }

  draw() {
    if (this.alive) {
      draw_circle(this.ctx, this.x, this.y, this.r, this.color, true)

      this.x += this.vx
      this.y += this.vy

      this.vx += this.g[0]
      this.vy += this.g[1]
    }

    if (this.explosion) {
      this.explosion.draw()
    }
  }

  explode() {
    if (this.alive) {
      this.explosion = new Explosion(this.ctx, this.x, this.y)
      this.kill()
    }
  }

  collision_circle(x, y, r) {
    let l = ((this.x - x) ** 2 + (this.y - y) ** 2) **  0.5
    let is_collision = (l <= r + this.r)
    if (is_collision) {
      this.explode()
    }
    return is_collision
  }

  check_bounds(x1, y1, x2, y2) {
    if (this.x < x1 || this.x > x2 || this.y < y1 || this.y > y2) {
      this.explode()
    }
    return this.alive
  }

  kill() {
    this.alive = false
  }
}


class Hill extends SemiCircle {
  constructor(ctx, w, h, x, y, r) {
    super(ctx, w, h, x, y, r, "green")
  }
}


class Tank extends SemiCircle {
  constructor(ctx, w, h, x, y, r, g, color, angle=190, controls={}, name="") {
    super(ctx, w, h, x, y, r, color)

    this.controls = controls
    this.name = name

    this.alive = true

    this.g = g
    this.angle = angle
    this.turret_len = 2 * this.r

    this.cannon_balls = []

    this.explosion = 0
    this.last_shot_key_down = 0
    this.is_shot_key_down = false

    document.addEventListener('keydown', this.on_keydown.bind(this))
    document.addEventListener('keyup', this.on_keyup.bind(this))
  }

  kill() {
    if (this.alive) {
      this.explosion = new Explosion(this.ctx, this.x, this.y, this.color, 100)
    }
    this.alive = false
  }

  on_keyup(e) {
    if (this.alive) {
      if ('изстрел' in this.controls && e.key == this.controls["изстрел"]) {
        let angle_radians = to_radians(this.angle)
        let x1 = this.x + this.turret_len * Math.cos(angle_radians)
        let y1 = this.y + this.turret_len * Math.sin(angle_radians)
        let v = this.last_shot_key_down ? Math.min(15, (Date.now() - this.last_shot_key_down) / 100) : 5
        console.log("Firing cannon ball with velocity", v)
        this.cannon_balls.push(
          new CannonBall(this.ctx, this.W, this.H, x1, y1, v, this.angle, 5, this.g, "red")
        )
        this.is_shot_key_down = false
        return
      }
    }
  }

  on_keydown(e) {
    if (this.alive) {
      if ('наляво' in this.controls && e.key == this.controls["наляво"]) {
        this.angle -= 1
        if (this.angle < 190) {
          this.angle = 190
        }
        return
      }

      if ('надясно' in this.controls && e.key == this.controls["надясно"]) {
        this.angle += 1
        if (this.angle > 350) {
          this.angle = 350
        }
        return
      }

      if ('изстрел' in this.controls && e.key == this.controls["изстрел"]) {
        if (this.is_shot_key_down == false) {
          this.is_shot_key_down = true
          this.last_shot_key_down = Date.now()
          console.log("Start charging shot...")
        }
        return
      }
    }
  }

  draw() {
    if (this.alive) {
      super.draw()

      let angle_radians = to_radians(this.angle)

      let x2 = this.x + this.turret_len * Math.cos(angle_radians)
      let y2 = this.y + this.turret_len * Math.sin(angle_radians)

      draw_line(this.ctx, [this.x, this.y], [x2, y2], this.color, 1)
    } else {
      draw_circle(this.ctx, this.x, this.y, 3 * this.r, "black", true)

      if(this.explosion) {
        this.explosion.draw()
      }
    }

    for (let i = 0; i < this.cannon_balls.length; i++) {
      this.cannon_balls[i].draw()
    }
  }

  info() {
    return `${this.name}: angle ${this.angle}`;
  }
}


class Explosion {
  constructor(ctx, x, y, color="red", size=30, fps_ratio=1) {
    this.ctx = ctx
    this.x = x
    this.y = y
    this.fps_ratio = fps_ratio
    this.r = 2
    this.color = color
    this.size = size
    this.alive = true
  }

  draw() {
    if (this.alive) {
      draw_circle(this.ctx, this.x, this.y, this.r, this.color, true)
      this.r += 0.2 * this.fps_ratio
      if (this.r > this.size) {
        this.alive = false
      }
    }
  }
}