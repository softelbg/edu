/*
 * Misho Georgiev game project
 *
 * 2023 Softel Labs
 *
*/


class MatrixSnail extends Game {
  constructor(canvas, w, h, n, m) {
    super(canvas, w, h)

    this.x = 50
    this.y = 50
    this.d = 30

    this.n = 1
    this.n_max = n
    this.m = parseInt(m)

    this.build_matrix()

    this.ratio_move = new RatioRunner(20, this.move_next.bind(this), 0)
    setTimeout(this.on_fps.bind(this), 1500)
  }

  on_fps() {
    let fps = this.fps_counter.fps
    this.fps_ratio = 120 / fps
    this.ratio_move = new RatioRunner(10 / this.fps_ratio, this.move_next.bind(this), 1)
  }

  build_matrix() {
    this.a = []
    this.c = []
    this.ci = 0

    var k = this.m
    for (var i = 0; i < this.n; i++) {
      this.a.push([])
      for (var j = 0; j < this.n; j++) {
        this.a[i].push(k)
        k++
      }
    }

    this.fill_matrix()
  }

  set(from, to, d, m) {
    for (var i = from; i < to; i += d) {
      this.a[i][this.n - k - 1] = m
      m++
    }
    return m
  }

  fill_matrix() {
    var m = this.m
    for (var k = 0; k < this.n / 2 + 1; k++) {
      for (var j = k; j < this.n - k; j++) {
        this.a[k][j] = m
        m++
        this.c.push([k, j])
      }
      for (var i = k + 1; i < this.n - k; i++) {
        this.a[i][this.n - k - 1] = m
        m++
        this.c.push([i, this.n - k - 1])
      }
      for (var j = this.n - k - 2; j >= k; j--) {
        this.a[this.n - k - 1][j] = m
        m++
        this.c.push([this.n - k - 1, j])
      }
      for (var i = this.n - k - 2; i >= k + 1; i--) {
        this.a[i][k] = m
        m++
        this.c.push([i, k])
      }
    }
    // console.log("A", this.a)
    // console.log("C", this.c)
  }

  move_next() {
    this.ci++
    if (this.ci >= this.c.length) {
      this.n++
      if (this.n > this.n_max) { this.n = 1 }
      this.build_matrix()
    }
  }

  draw_cell(i, j) {
    var x = this.x + j * this.d
    var y = this.y + i * this.d
    draw_rect(this.ctx, x, y, this.d, this.d, "white", false, 2)
    draw_text(this.ctx, this.a[i][j], x + 10, y + 20, 8, "white")
  }

  draw() {
    draw_text(this.ctx, "FPS " + Math.round(this.fps_counter.fps), 5, 40, 10, "white")

    this.ratio_move.run()
    for (var i = 0; i <= this.ci; i++) {
      this.draw_cell(this.c[i][0], this.c[i][1])
    }

    // for (var i = 0; i < this.n; i++) {
    //   for (var j = 0; j < this.n; j++) {
    //     this.draw_cell(i, j)
    //   }
    // }
  }
}
