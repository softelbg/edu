/*
 * Misho Georgiev game project
 *
 * 2022 Softel Labs
 *
*/


class Snake {
  constructor(ctx, w, h, x0, y0, lives, fps_ratio=1, controls={}, name="", color="green", info_pos=[300, 20]) {
    this.ctx = ctx
    this.W = w
    this.H = h
    this.fps_ratio = fps_ratio
    this.controls = controls

    this.name = name
    this.color = color
    this.info_pos = info_pos
    this.d = 10

    this.v = 1
    this.vx = 0
    this.vy = 0

    this.body = [[x0, y0], [x0 + this.d, y0]]

    this.ratio_move = new RatioRunner(10 / this.fps_ratio, this.move_body.bind(this), 1)

    this.lives = lives
    this.lives_bar = new VolumeBar(this.ctx, this.info_pos, this.lives, this.name + " животи", this.color)

    this.bitten = new IDraw()
    this.apple_bitten = new IDraw()

    document.addEventListener('keydown', this.on_keydown.bind(this))
    // document.addEventListener('keyup', this.on_keyup.bind(this))
  }

  on_keydown(e) {
    if ('нагоре' in this.controls && e.key == this.controls["нагоре"]) {
      this.vx = 0
      this.vy = - this.v
      this.ratio_move.normal()
      return
    }

    if ('надолу' in this.controls && e.key == this.controls["надолу"]) {
      this.vx = 0
      this.vy = this.v
      this.ratio_move.normal()
      return
    }

    if ('наляво' in this.controls && e.key == this.controls["наляво"]) {
      this.vx = - this.v
      this.vy = 0
      this.ratio_move.normal()
      return
    }

    if ('надясно' in this.controls && e.key == this.controls["надясно"]) {
      this.vx = this.v
      this.vy = 0
      this.ratio_move.normal()
      return
    }

    if ('бързо' in this.controls && e.key == this.controls["бързо"]) {
      this.ratio_move.speed(6 / this.fps_ratio)
      return
    }

    // if (e.key == 'o') {
    //   this.vx = 0
    //   this.vy = 0
    //   return
    // }
  }

  on_keyup(e) {

  }

  check_next_move_collision(pn) {
    if (pn[0] < this.d / 2 || pn[0] > this.W - this.d / 2 || pn[1] < this.d || pn[1] > this.H - this.d / 2) {
      return this.body.length - 1
    }

    for (let i = 0; i < this.body.length - 1; i++) {
      let d = Math.sqrt((pn[0] - this.body[i][0]) ** 2 + (pn[1] - this.body[i][1]) ** 2)
      if (d < this.d) { return i }
    }

    return -1
  }

  move_body() {
    if (this.vx != 0 || this.vy != 0) {
      let p = this.body.slice(-1)[0]
      let pn = [p[0] + this.vx * this.d, p[1] + this.vy * this.d]

      let ic = this.check_next_move_collision(pn)
      if (ic >= 0) {
        this.lives -= 1
        this.vx = 0
        this.vy = 0
        this.bitten = new Bitten(this.ctx, this.body[ic][0], this.body[ic][1], this.d / 2)
        return
      }

      this.body.push(pn)
      this.body.shift()
    }
  }

  move() {
    this.ratio_move.run()
    this.draw()
  }

  draw() {
    for (let i = 0; i < this.body.length - 1; i++) {
      draw_circle(this.ctx, this.body[i][0], this.body[i][1], this.d / 2, this.color, true)
    }

    draw_circle(this.ctx, this.body[this.body.length - 1][0], this.body[this.body.length - 1][1], this.d / 2 + 3, "#AA5511", true)

    this.bitten.draw()
    this.apple_bitten.draw()

    this.lives_bar.draw(this.lives)
  }

  check_eat(apples) {
    let p = this.body.slice(-1)[0]
    let pn = [p[0] + this.vx * this.d, p[1] + this.vy * this.d]
    for (let i = 0; i < apples.length; i++) {
      let d = Math.sqrt((pn[0] - apples[i].x) ** 2 + (pn[1] - apples[i].y) ** 2)
      if (d < apples[i].r + this.d / 2) {
        this.body.push(pn)
        this.apple_bitten = new Bitten(this.ctx, apples[i].x, apples[i].y, apples[i].r, "orange", 77)
        return i
      }
    }
    return -1
  }
}


class Apple {
  constructor(ctx, x0, y0) {
    this.ctx = ctx
    this.x = x0
    this.y = y0
    this.r = 5
  }

  draw() {
    draw_circle(this.ctx, this.x, this.y, this.r, "red", true)
  }
}


class Bitten {
  constructor(ctx, x0, y0, r, color="red", counter=100) {
    this.color = color
    this.ctx = ctx
    this.x = x0
    this.y = y0
    this.r = r

    this.counter = counter
    this.active = true
  }

  draw() {
    if (this.active) {
      this.draw_active()
    }
  }

  draw_active() {
    draw_circle(this.ctx, this.x, this.y, this.r + this.counter / 10, this.color, true)
    this.counter -= 1

    if (this.counter == 0) {
      this.active = false
    }
  }
}
