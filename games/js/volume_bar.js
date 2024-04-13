/*
 * Misho Georgiev game project
 *
 * 2022 Softel Labs
 *
*/


class VolumeBar {
  constructor(ctx, p1, max_vol, name, color, min_vol=0.0) {
    this.ctx = ctx
    this.w = 100
    this.h = 15
    this.p1 = p1
    this.max_vol = max_vol
    this.min_vol = min_vol
    this.name = name
    this.color = color

    this.p2 = [p1[0] + this.w, p1[1] + this.h]
  }

  draw(vol) {
    this.max_vol = Math.max(this.max_vol, vol)
    this.min_vol = Math.min(this.min_vol, vol)
    // vol = Math.min(this.max_vol, vol)
    // vol = Math.max(this.min_vol, vol)

    draw_text(this.ctx, this.name, this.p2[0] + 3, this.p2[1], 12, "white")
    draw_rect(this.ctx, this.p1[0], this.p1[1], this.w * vol / (this.max_vol - this.min_vol), this.h, this.color, true)
    draw_rect(this.ctx, this.p1[0], this.p1[1], this.w, this.h, "white")

    draw_text(this.ctx, parseInt(vol), this.p1[0] + this.w / 4, this.p1[1] + this.h / 2 + 3, 10, "white")
  }
}