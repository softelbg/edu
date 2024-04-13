/*
 * Misho Georgiev game project
 *
 * 2022 Softel Labs
 *
*/


class LanderGame extends Game {
  constructor(canvas, w, h, lives, players, is_run) {
    super(canvas, w, h)

    this.players = players
    this.rocket_lives = lives
    this.is_run = is_run

    this.rockets = []
    this.rocks = []

    this.generate_rocks()

    this.help = new Help(this.ctx, this.W, this.H, 30, 30, 20)
    this.game_over = new GameOver(this.ctx, this.W, this.H, 14)

    this.rocket_lives_bar = new VolumeBar(this.ctx, [100, 20], this.rocket_lives, "Мишо животи", "green")

    this.danger = new DangerBall(this.ctx, w, h)

    this.controls = [
      {
        "ускорение": {
          'u': 0.01, 'i': 0.03, 'o': 0.02
        },
        "завъртане": {
          'h': -1, 'j': -3, 'k': 3, 'l': 1
        }
      },
      {
        "ускорение": {
          'q': 0.01, 'w': 0.03, 'e': 0.02
        },
        "завъртане": {
          'a': -1, 's': -3, 'd': 3, 'f': 1
        }
      }
    ]

    this.help.show = true
    setTimeout(this.on_fps.bind(this), 1500)
  }

  on_fps() {
    let fps = this.fps_counter.fps

    this.rockets = []

    for (let i = 0; i < this.players; i++) {
      this.rockets.push(
        new Rocket(
          this.ctx, this.W, this.H,
          randint(50, this.W - 50), 50,
          "#33EEEE", 15, 0, 20,
          this.fps_ratio,
          this.controls[i % this.controls.length],
          i.toString(), [300 + i * 150, 20]
        )
      )
    }

    for (let i = 0; i < this.rockets.length; i++) {
      this.rockets[i].set_gravity(0.0, 0.002)
      this.rockets[i].vx = randuniform(0.0, 1.0, 3)
      this.rockets[i].vy = randuniform(0.0, 1.0, 3)
      this.rockets[i].angle = randint(0, 360)
    }

    this.help.controls(this.rockets, "Ракета")
    if (this.is_run) { this.help.show = false }

    document.addEventListener('keydown', this.on_keydown.bind(this))
  }

  on_keydown(e) {
    if (e.key === "Escape") {
      this.help.show = ! this.help.show
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
    if (this.rocket_lives <= 0) {
      this.game_over.show = true
    }

    this.rocket_lives_bar.draw(this.rocket_lives)

    for (let i = 0; i < this.rockets.length; i++) {
      this.rockets[i].move()
      if (this.rockets[i].y <= this.rockets[i].l) {
        this.rocket_lives -= 1
        this.rockets[i] = new RocketExplosion(this.ctx, this.W, this.H, this.rockets[i].x, this.rockets[i].y, this.fps_ratio)
      }
    }

    for (let i = 0; i < this.rocks.length; i++) {
      draw_line(this.ctx, [this.rocks[i][0], this.H], this.rocks[i], "green", 3)
    }

    for (let i = 0; i < this.rockets.length; i++) {
      for (let j = 0; j < this.rocks.length; j++) {
        let d = Math.sqrt((this.rockets[i].x - this.rocks[j][0]) ** 2 + (this.rockets[i].y - this.rocks[j][1]) ** 2)
        if (d < this.rockets[i].l) {
          if (this.rockets[i].vx > 0.2 || this.rockets[i].vy > 0.2 || Math.abs(this.rockets[i].angle - 270) > 10) {
            this.rocket_lives -= 1
            this.rockets[i] = new RocketExplosion(this.ctx, this.W, this.H, this.rockets[i].x, this.rockets[i].y, this.fps_ratio)
          }
          else {
            this.generate_rocks()
            this.on_fps()
          }
          break
        }
      }
    }

    for (let i = 0; i < this.rockets.length; i++) {
      if (!this.rockets[i].alive()) {
        this.on_fps()
        break
      }
    }

    draw_text(this.ctx, "ESC за Помощ", 5, 20, 10, "white")
    draw_text(this.ctx, "FPS " + Math.round(this.fps_counter.fps), 5, 40, 10, "white")

    this.danger.draw()
    for (let i = 0; i < this.rockets.length; i++) {
      if (! this.rockets[i].alive()) {
        continue
      }

      let d = Math.sqrt((this.rockets[i].y - this.danger.y) ** 2 + (this.rockets[i].x - this.danger.x) ** 2)
      if (d <= this.rockets[i].l + this.danger.r) {
        this.rocket_lives -= 1
        this.rockets[i] = new RocketExplosion(this.ctx, this.W, this.H, this.rockets[i].x, this.rockets[i].y, this.fps_ratio)
      }
    }
  }

  generate_rocks() {
    this.rocks = []
    let h0 = this.H - 50

    var l = 0
    var h = 0
    for (let x = 0; x < this.W; x++) {
      if (l == 0) {
        l = randint(50, 200)
        h = randint(30, 150)
      }

      let p = [x, h0 - h]
      this.rocks.push(p)

      l -= 1
    }
  }
}


const query = window.location.search
const params = new URLSearchParams(query)

game = new LanderGame(
              document.getElementsByTagName('canvas')[0],
              params.get("w") || 1200,
              params.get("h") || 800,
              params.get("lives") || 10,
              params.get("players") || 1,
              params.get("run") || 0
)
game.run()
