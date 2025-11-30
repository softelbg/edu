/*
 * Alexander Georgiev game project
 *
 * 2025 Softel Labs
 *
*/


class Integrals extends Game {
  constructor(canvas, w, h, formula, a, b, dx) {
    super(canvas, w, h)

    this.formula = formula
    this.a = parseFloat(a)
    this.b = parseFloat(b)
    this.dx = parseFloat(dx)

    this.F = new Function("x", `return ${formula};`);

    this.fa = this.F(this.a)
    this.fb = this.F(this.b)

    console.log("F(a)=", this.fa, "F(b)=", this.fb)
    
    this.xa = 400
    this.xb = 10
    this.ya = 400
    this.yb = 3

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
      draw_line(this.ctx, [this.get_x(0), this.get_y(this.fa * 1.5)], [this.get_x(0), this.get_y(this.fb * 1.5)], "white", 2)
  
      this.ratio_move.run()
  }
}
  