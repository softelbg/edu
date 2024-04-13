/*
 * Misho Georgiev game project
 *
 * 2022 Softel Labs
 *
*/

class Paddle extends BaseMoveConstantVelocity {
  constructor(ctx, w, h, x0, y0, fps_ratio=1, controls={}) {
    super(ctx, w, h, x0, y0, 0, 0, fps_ratio, "blue")
    this.controls = controls

    this.ratio_move = new RatioRunner(2 / this.fps_ratio, this.move_paddle.bind(this), 1)

    this.w = this.W / 10
    this.h = 10

    this.v = 10

    document.addEventListener('keydown', this.on_keydown.bind(this))
    document.addEventListener('keyup', this.on_keyup.bind(this))
  }

  destructor() {
    document.removeEventListener('keydown', this.on_keydown.bind(this))
    document.removeEventListener('keyup', this.on_keyup.bind(this))
  }

  on_keydown(e) {
    if ('наляво' in this.controls && e.key == this.controls["наляво"]) {
      this.vx = - this.v
      this.vy = 0
      return
    }

    if ('надясно' in this.controls && e.key == this.controls["надясно"]) {
      this.vx = this.v
      this.vy = 0
      return
    }
  }

  on_keyup(e) {
    if ('наляво' in this.controls && e.key == this.controls["наляво"]) {
      this.vx = 0
      this.vy = 0
      return
    }

    if ('надясно' in this.controls && e.key == this.controls["надясно"]) {
      this.vx = 0
      this.vy = 0
      return
    }
  }

  move_paddle() {
    this.x += this.vx * this.fps_ratio
    this.y += this.vy * this.fps_ratio

    let xy = frame_bounds(this.W, this.H, this.x, this.y, this.w / 2, 0, this.w / 2, 0)
    this.x = xy[0]
    this.y = xy[1]
  }

  move() {
    this.ratio_move.run()
    this.draw()
  }

  draw() {
    draw_rect(this.ctx, this.x, this.y, this.w / 2, this.h, this.color, true)
    draw_rect(this.ctx, this.x - this.w / 2, this.y, this.w / 2, this.h, this.color, true)
  }
}