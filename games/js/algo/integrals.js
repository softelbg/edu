/*
 * Alexander Georgiev game project
 *
 * 2025 Softel Labs
 *
*/


const { sin, cos, tan } = Math;
const { asin, acos, atan, atan2 } = Math;
const { sinh, cosh, tanh } = Math;
const { asinh, acosh, atanh } = Math;
const { exp, log, log10, log2, sqrt, pow, abs, floor, ceil, round} = Math;
const { min, max } = Math;


class Integrals extends Game {
  constructor(canvas, w, h, formula, a, b, dx, round, xb, yb) {
    super(canvas, w, h)

    this.formula = formula
    this.a = parseFloat(a)
    this.b = parseFloat(b)
    this.dx = parseFloat(dx)
    this.round = min(parseFloat(round), 100)

    this.formula = this.formula.replaceAll("^", "**")

    this.F = new Function("x", `return ${this.formula};`);

    this.xa = this.W / 2
    this.ya = this.H / 2
    let minmax = this.get_minmax()
    this.min_y = minmax[0]
    this.max_y = minmax[1]
    this.yh = this.max_y - this.min_y
    this.xw = this.b - this.a
    this.xb = 0.7 * this.W / this.xw
    this.yb = 0.5 * this.H / this.yh
    console.log("Center:", this.xa, this.ya, "min_y:", this.min_y, "max_y:", this.max_y)

    this.current_x = this.a
    this.current_y = 0.0
    this.S = 0.0
    this.integral_sum = null

    this.list_rectangles = []
    this.list_sums = []

    console.log("Formula", this.formula, this.F, "from", this.a, "to", this.b, "dx", this.dx)

    this.ratio_move = new RatioRunner(2, this.sum_next.bind(this), 0)
    setTimeout(this.on_fps.bind(this), 1500)
  }

  get_minmax() {
    let min_y = 100e10
    let max_y = -100e10
    for (let x = this.a; x <= this.b; x += 0.1) {
      let y = this.F(x)
      min_y = min(min_y, y)
      max_y = max(max_y, y)
    }
    return [min_y, max_y]
  }

  get_x(x) {
    return this.xa + x * this.xb
  }
  get_y(y) {
    return this.ya - y * this.yb
  }

  on_fps() {
    let fps = this.fps_counter.fps
    this.fps_ratio = 120 / fps
    this.ratio_move = new RatioRunner(1 / this.fps_ratio, this.sum_next.bind(this), 1)
  }

  sum_next() {
      this.current_y = this.F(this.current_x)
      let ds = this.current_y * this.dx
      this.S += ds
      this.current_x += this.dx
      // this.list_rectangles.push([50 + (this.current_x - this.a) * 10, 400 - this.current_y * 2, this.dx * 10, this.current_y * 2])
      this.list_rectangles.push([this.get_x(this.current_x - this.dx), this.get_y(this.current_y), this.dx * this.xb, this.current_y * this.yb])
      this.list_sums.push(ds)
      // console.log("Current x:", this.current_x, "y:", this.current_y, "S:", this.S)
      // console.log(this.list_rectangles)

      if (this.current_x >= this.b) {
        console.log("Integral", this.formula, "from", this.a, "to", this.b, "=", this.S)
        this.current_x = this.a
        this.current_y = 0.0
        this.integral_sum = this.S
        if (this.round >= 0) {
          this.integral_sum = parseFloat(this.integral_sum.toFixed(this.round))
        }
        this.S = 0.0
        this.list_rectangles = []
        this.list_sums = []
      }
  }

  draw() {
      draw_text(this.ctx, "FPS " + Math.round(this.fps_counter.fps) + " formula " + this.formula, 5, 40, 10, "orange")
      draw_text(this.ctx, "Integral from " + this.a + " to " + this.b + " dx=" + this.dx + " Current sum: " + this.S.toFixed(4), 5, 60, 12, "white")
      if (this.integral_sum !== null) {
        draw_text(this.ctx, "Last computed integral sum: " + this.integral_sum, 5, 100, 15, "white")
      }

      for (let i = 0; i < this.list_rectangles.length; i++) {
        let r = this.list_rectangles[i]
        if (i >= this.list_rectangles.length - 10) {
          draw_rect(this.ctx, r[0], r[1], r[2], r[3], "orange", true, 1)
        } else {
          let color = "green"
          if (this.list_sums[i] < 0)
            color = "red"
          draw_rect(this.ctx, r[0], r[1], r[2], r[3], color, true, 1)
        }
      }

      draw_line(this.ctx, [this.get_x(this.a * 1.2), this.get_y(0)], [this.get_x(this.b * 1.2), this.get_y(0)], "white", 2)
      draw_line(this.ctx, [this.get_x(0), this.get_y(this.min_y * 1.5)], [this.get_x(0), this.get_y(this.max_y * 1.5)], "white", 2)

      this.ratio_move.run()
  }
}
