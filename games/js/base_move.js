/*
 * Misho Georgiev game project
 *
 * 2022 Softel Labs
 *
*/


class BaseMoveConstantVelocity {
  constructor(ctx, w, h, x0, y0, vx0, vy0, fps_ratio=1, color=[0, 0, 255]) {
    this.ctx = ctx
    this.W = w
    this.H = h
    this.W_ratio = this.W / 1200
    this.H_ratio = this.H / 800

    this.x = x0
    this.y = y0
    this.vx = vx0
    this.vy = vy0
    this.ax = 0
    this.ay = 0
    this.gx = 0
    this.gy = 0

    this.color = color
    this.fps_ratio = fps_ratio

    this.ox = 0
    this.oy = 0
  }

  set_gravity(gx, gy) {
    this.gx = gx
    this.gy = gy
  }

  full_stop() {
    this.vx = 0
    this.vy = 0
    this.ax = 0
    this.ay = 0
  }

  move() {
    this.vx += this.gx
    this.vy += this.gy

    this.x += this.vx * this.fps_ratio
    this.y += this.vy * this.fps_ratio

    let xy = frame_bounds_rewind(this.W, this.H, this.x, this.y, this.ox, this.oy)
    this.x = xy[0]
    this.y = xy[1]

    this.draw()
  }

  draw() {

  }
}


class RatioRunner {
  constructor(ratio, fn, count_inc=0) {
    this.ratio0 = ratio
    this.ratio = ratio
    this.fn = fn
    this.count = 0
    this.count_inc = count_inc
    console.log("RatioRunner", "ratio", this.ratio, "count_inc", count_inc)
  }

  set_ratio(ratio) {
    this.ratio0 = ratio
    this.ratio = ratio
  }

  speed(a) {
    this.ratio -= a
    this.ratio = Math.max(this.ratio, 0)
  }

  normal() {
    this.ratio = this.ratio0
  }

  set(count_inc) { this.count_inc = count_inc }

  run() {
    this.count += this.count_inc
    if (this.count >= this.ratio) {
      this.count = 0
      this.fn()
    }
  }
}