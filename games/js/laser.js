/*
 * Misho Georgiev game project
 *
 * 2022 Softel Labs
 *
*/


class Laser extends BaseMoveConstantVelocity {
  constructor(ctx, w, h, x0, y0, angle, v, fps_ratio=1) {
    super(ctx, w, h, x0, y0, 0, 0, fps_ratio, "red")

    this.l = 10
    this.angle = angle

    this.points()

    this.v = v
    this.vx = this.fps_ratio * this.v * Math.cos(to_radians(this.angle))
    this.vy = this.fps_ratio * this.v * Math.sin(to_radians(this.angle))
  }

  points(self) {
    let angle = to_radians(this.angle)
    this.p1 = [this.x, this.y]
    this.p2 = [this.x + this.l * Math.cos(angle), this.y + this.l * Math.sin(angle)]
  }

  move() {
    this.x += this.vx
    this.y += this.vy

    this.points()

    draw_line(this.ctx, this.p1, this.p2, this.color, 2)

    return this.x >= 0 && this.x <= this.W && this.y >= 0 && this.y <= this.H
  }
}