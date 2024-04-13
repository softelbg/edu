/*
 * Misho Georgiev game project
 *
 * 2022 Softel Labs
 *
*/


class DangerBall {
  constructor(ctx, W, H) {
    this.ctx = ctx
    this.W = W
    this.H = H

    this.x = 70
    this.y = 60
    this.r = 40

    this.vx = 0.5
    this.vy = 0.5
  }

  draw() {
    if (randint(0, 30) == 1) {
      this.vx += randuniform(-0.2, 0.2)
      this.vy += randuniform(-0.2, 0.2)
    }

    this.x = this.x + this.vx
    this.y = this.y + this.vy

    if (this.y + this.r >= this.H) {
      this.vy = - this.vy
      this.y = this.H - this.r
    }
    if (this.y - this.r <= 0) {
      this.vy = - this.vy
      this.y = this.r
    }
    if (this.x + this.r >= this.W) {
      this.vx = - this.vx
      this.x = this.W - this.r
    }
    if (this.x - this.r <= 0) {
      this.vx = - this.vx
      this.x = this.r
    }

    draw_circle(this.ctx, this.x, this.y, this.r, "red", true)
  }
}