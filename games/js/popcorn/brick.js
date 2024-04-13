/*
 * Misho Georgiev game project
 *
 * 2022 Softel Labs
 *
*/

class Brick {
  constructor(ctx, W, H, x0, y0, w, h, count_strikes=1) {
    this.ctx = ctx
    this.W = W
    this.H = H

    this.colors = ["#ade4e9", "blue", "green", "yellow", "orange", "red", "purple"]

    this.x = x0
    this.y = y0
    this.w = w
    this.h = h

    this.vertices = [[this.x, this.y], [this.x, this.y + this.h], [this.x + this.w, this.y + this.h], [this.x + this.w, this.y]]
    this.sides = [
      [[this.x, this.y], [this.x + this.w, this.y]],
      [[this.x, this.y + this.h], [this.x + this.w, this.y + this.h]],
      [[this.x, this.y], [this.x, this.y + this.h]],
      [[this.x + this.w, this.y], [this.x + this.w, this.y + this.h]]
    ]

    this.count_strikes = parseInt(count_strikes)
  }

  hit() {
    this.count_strikes -= 1
  }

  alive() {
    return this.count_strikes > 0
  }

  draw() {
    draw_rect(this.ctx, this.x, this.y, this.w, this.h, this.colors[(this.count_strikes - 1) % this.colors.length], true)
    draw_text(this.ctx, this.count_strikes, this.x + this.w / 2, this.y + this.h / 2, 10, "black")
  }
}
