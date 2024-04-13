/*
 * Misho Georgiev game project
 *
 * 2022 Softel Labs
 *
*/


class FPSCounter {
  constructor(interval) {
    this.interval = interval

    this.fps = 0
    this.n_frames = 0

    this.last_timestamp = Date.now()

    setTimeout(this.calc_fps.bind(this), 1000)
  }

  calc_fps() {
    let t2 = Date.now()
    let p = t2 - this.last_timestamp
    this.fps = this.n_frames * 1000 / p
    this.n_frames = 0
    this.last_timestamp = Date.now()

    setTimeout(this.calc_fps.bind(this), this.interval)
  }

  update() {
    this.n_frames += 1
  }
}


class Game {
  constructor(canvas, w, h, background_color="black") {
    this.W = w
    this.H = h
    this.W_ratio = this.W / 1200
    this.H_ratio = this.H / 800

    this.background_color = background_color
    canvas.width = w
    canvas.height = h
    this.ctx = canvas.getContext('2d')
    this.ctx["BoundingClientRect"] = canvas.getBoundingClientRect()
    this.ctx["WH"] = {"W": this.W, "H": this.H, "W_ratio": this.W_ratio, "H_ratio": this.H_ratio}

    this.fps_counter = new FPSCounter(10000)
  }

  count_fps() {

  }

  clear() {
    this.ctx.clearRect(0, 0, this.W, this.H)
    this.ctx.rect(0, 0, this.W, this.H)
    this.ctx.fillStyle = this.background_color
    this.ctx.fill()
  }

  run() {
    this.fps_counter.update()
    this.clear()
    this.draw()
    requestAnimationFrame(this.run.bind(this))
  }

  draw() {

  }
}
