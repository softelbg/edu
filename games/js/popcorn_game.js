/*
 * Misho Georgiev game project
 *
 * 2022 Softel Labs
 *
*/


class PopCornGame extends Game {
  constructor(canvas, w, h, lives, n_balls, is_run) {
    super(canvas, w, h)

    this.paddle = 0
    this.balls = 0
    this.n_balls = n_balls
    this.is_run = is_run

    this.lives = lives
    this.lives_bar = new VolumeBar(this.ctx, [100, 10], this.lives, "животи", "green")

    this.level = 1
    this.level_bar = new VolumeBar(this.ctx, [250, 10], 20, "ниво", "blue")

    this.help = new Help(this.ctx, this.W, this.H, 30, 30, 20)
    this.game_over = new GameOver(this.ctx, this.W, this.H, 14)

    this.help.show = true
    setTimeout(this.on_fps.bind(this), 1500)
  }

  on_fps() {
    let fps = this.fps_counter.fps
    this.fps_ratio = 120 / fps

    this.generate_balls()
    this.generate_bricks()

    this.paddle = new Paddle(
      this.ctx, this.W, this.H,
      this.W / 2, this.H - 40,
      this.fps_ratio,
      {
        "наляво": 'j',
        "надясно": 'k',
        "стрелба":  ' '
      }
    )

    this.help.controls([this.paddle], "Мишо")
    if (this.is_run) { this.help.show = false }

    document.addEventListener('keydown', this.on_keydown.bind(this))
  }

  generate_balls() {
    this.balls = []

    for (let i = 0; i < this.n_balls; i++) {
      this.balls.push(
        new Ball(
          this.ctx, this.W, this.H,
          this.W / 2 + (i - this.n_balls / 2) * 20, this.H - 45,
          this.fps_ratio
        )
      )
    }
  }

  generate_bricks() {
    this.bricks = []

    let nx = 12
    let ny = 8

    let o = 1
    let bw = Math.floor(this.W / nx) - o
    let bh = Math.floor(bw / 2)

    for (let i = 0; i < ny; i++) {
      for (let j = 0; j < nx; j++) {
        this.bricks.push(
          new Brick(this.ctx, this.W, this.H, (bw + o) * j + 2, this.H / 10 + (bh + o) * i, bw, bh, Math.max(1, randint(1, 20) - 18 + this.level))
        )
      }
    }

    // TODO: Consider index build here
  }

  on_keydown(e) {
    if (e.key === "Escape") {
      this.help.show = ! this.help.show
    }

    if (e.key === " ") {
      for (let i = 0; i < this.balls.length; i++) {
        if (this.balls[i].vx == 0 && this.balls[i].vy == 0) {
          this.balls[i].vx = Math.min(10, randint(2, 2 + this.level))
          this.balls[i].vy = - Math.min(10, randint(3 + this.level, 7 + this.level))
        }
      }
      this.paddle.vx = 0
    }
  }

  draw() {
    if (this.game_over.show) {
      this.game_over.draw()
    } else if (this.help.show) {
      this.help.draw()
    } else {
      this.draw_game()
    }
  }

  draw_game() {
    for (let i = 0; i < this.bricks.length; i++) {
      this.bricks[i].draw()
    }

    this.paddle.move()

    let list_balls_remove = []

    for (let i = 0; i < this.balls.length; i++) {
      let flag_paddle_hit = false
      if (this.paddle.y - this.balls[i].y <= this.balls[i].r + this.balls[i].vy / this.balls[i].r) {
        if (Math.abs(this.balls[i].x - this.paddle.x) <= this.paddle.w / 2 + this.balls[i].r) {
          if (this.balls[i].hit()) {
            this.balls[i].vy = - this.balls[i].vy + 0.05 * this.paddle.vx
            this.balls[i].vx += 0.5 * (this.balls[i].x - this.paddle.x) / this.paddle.w + 0.1 * this.paddle.vx
            flag_paddle_hit = true
            this.balls[i].move()
          }
        }
      }

      if (
        flag_paddle_hit == false &&
        (
          (this.balls[i].x > this.paddle.x + this.paddle.w / 2 && this.balls[i].x - this.paddle.x - this.paddle.w / 2 <= this.balls[i].r + this.balls[i].vx / this.balls[i].r) ||
          (this.balls[i].x < this.paddle.x - this.paddle.w / 2 && this.paddle.x - this.paddle.w / 2 - this.balls[i].x <= this.balls[i].r + this.balls[i].vx / this.balls[i].r)
        )
      ) {
        if (Math.abs(this.balls[i].y - this.paddle.y) <= this.paddle.h / 2 + this.balls[i].r) {
          if (this.balls[i].hit()) {
            this.balls[i].vx = - this.balls[i].vx + 0.1 * this.paddle.vx
            this.balls[i].vy = - this.balls[i].vy + 0.05 * this.paddle.vx
            flag_paddle_hit = true
            this.balls[i].move()
          }
        }
      }

      if (this.balls[i].y > this.paddle.y + 0.1 * this.paddle.h && flag_paddle_hit == false) {
        list_balls_remove.push(i)
      }

      let h = false
      for (let j = 0; j < this.bricks.length; j++) {
        for (let k = 0; k < 2; k++) {
          if (this.balls[i].x >= this.bricks[j].sides[k][0][0] && this.balls[i].x <= this.bricks[j].sides[k][1][0]) {
            if (Math.abs(this.balls[i].y - this.bricks[j].sides[k][0][1]) <= this.balls[i].r) {
              if (this.balls[i].hit()) {
                this.balls[i].vy = - this.balls[i].vy
                this.bricks[j].hit()
                h = true
                break
              }
            }
          }
        }
        if (h) { break }

        for (let k = 2; k < this.bricks[j].sides.length; k++) {
          if (this.balls[i].y >= this.bricks[j].sides[k][0][1] && this.balls[i].y <= this.bricks[j].sides[k][1][1]) {
            if (Math.abs(this.balls[i].x - this.bricks[j].sides[k][0][0]) <= this.balls[i].r) {
              if (this.balls[i].hit()) {
                this.balls[i].vx = - this.balls[i].vx
                this.bricks[j].hit()
                h = true
                break
              }
            }
          }
        }
        if (h) { break }
      }

      this.balls[i].move()
    }

    list_balls_remove = Array.from(new Set(list_balls_remove))
    for (let i = list_balls_remove.length - 1; i >= 0; i--) {
      this.balls.splice(list_balls_remove[i], 1)
    }

    for (let i = this.bricks.length - 1; i >= 0; i--) {
      if (! this.bricks[i].alive()) {
        this.bricks.splice(i, 1)
      }
    }

    if (this.bricks.length == 0) {
      this.level += 1
      this.generate_balls()
      this.generate_bricks()
    }

    if (this.balls.length == 0) {
      this.lives -= 1
      this.generate_balls()
    }
    if (this.lives <= 0) {
      this.game_over.show = true
    }

    this.lives_bar.draw(this.lives)
    this.level_bar.draw(this.level)

    draw_text(this.ctx, "ESC за Помощ", 5, 20, 10, "white")
    draw_text(this.ctx, "FPS " + Math.round(this.fps_counter.fps), 5, 40, 10, "white")
  }
}


const query = window.location.search
const params = new URLSearchParams(query)

game = new PopCornGame(
              document.getElementsByTagName('canvas')[0],
              params.get("w") || 1200,
              params.get("h") || 800,
              params.get("lives") || 10,
              params.get("balls") || 1,
              params.get("run") || 0
)
game.run()
