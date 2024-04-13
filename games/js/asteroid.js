/*
 * Misho Georgiev game project
 *
 * 2022 Softel Labs
 *
*/


class Asteroid extends BaseMoveConstantVelocity {
  constructor(ctx, w, h, x0, y0, vx0, vy0, r0, fps_ratio=1, color="white", size_contour=20) {
    super(ctx, w, h, x0, y0, vx0, vy0, fps_ratio, color)

    this.r0 = r0
    this.r = r0
    this.size_contour = size_contour
    this.ox = r0
    this.oy = r0

    this.generate_contour()
  }

  draw() {
    // this.generate_contour()
    let current_list_points = []
    for (let i = 0; i < this.list_points.length; i++) {
      let x1 = this.x + this.list_points[i][0]
      let y1 = this.y + this.list_points[i][1]
      let p1 = [x1, y1]
      current_list_points.push([x1, y1])
    }

    draw_contours(this.ctx, current_list_points, this.color, 1)
    draw_circle(this.ctx, this.x, this.y, this.r, "#AA0000")
  }

  generate_contour() {
    this.list_points = []
    for (let i = 0; i < this.size_contour; i++) {
      let r = this.r0 * Math.sqrt(randuniform(0.3, 1.0, 5))
      let angle = i * 2 * Math.PI / this.size_contour
      let p = [r * Math.cos(angle), r * Math.sin(angle)]
      this.list_points.push(p)
    }
  }
}