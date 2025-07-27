/*
 * Misho Georgiev game project
 *
 * 2025 Softel Labs
 *
*/


class TanksGame extends Game {
  constructor(canvas, w, h, lives, is_run) {
    super(canvas, w, h)

    this.help = new Help(this.ctx, this.W, this.H, 30, 30, 20)
    this.game_over = new GameOver(this.ctx, this.W, this.H, 14)

    this.terrain = [[0, this.H - 100], [this.W, this.H - 100]]
    this.G = [0, 0.001]

    this.list_hills = [
      new Hill(this.ctx, this.W, this.H, this.W / 2, this.terrain[0][1], 50)
    ]

    this.players = [
      new Tank(this.ctx, this.W, this.H, randint(50, this.W / 2 - 80), this.terrain[0][1], 10, this.G, "orange",
        {
          "наляво":  'a',
          "надясно": 's',
          "изстрел": 'w',
        },
        "играч 1"
      ),
      new Tank(this.ctx, this.W, this.H, randint(this.W / 2 + 80, this.W - 80), this.terrain[0][1], 10, this.G, "yellow",
       {
          "наляво":  'j',
          "надясно": 'k',
          "изстрел": 'i',
        },
        "играч 2"
      )
    ]

    this.help.show = true
    setTimeout(this.on_fps.bind(this), 1500)
  }

  on_fps() {
    let fps = this.fps_counter.fps
    this.fps_ratio = 120 / fps

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

    draw_line(this.ctx, this.terrain[0], this.terrain[1], "green", 4)

    for (let i = 0; i < this.list_hills.length; i++) {
      this.list_hills[i].draw()
    }

    for (let i = 0; i < this.players.length; i++) {
      this.players[i].draw()
      draw_text(this.ctx, this.players[i].info(), 5 + (i * 140), 60, 10, "white")
    }

    draw_text(this.ctx, "ESC за Помощ", 5, 20, 10, "white")
    draw_text(this.ctx, "FPS " + Math.round(this.fps_counter.fps), 5, 40, 10, "white")
  }
}


const query = window.location.search
const params = new URLSearchParams(query)

game = new TanksGame(
              document.getElementsByTagName('canvas')[0],
              params.get("w") || 1200,
              params.get("h") || 800,
              params.get("lives") || 10,
              params.get("run") || 0
)
game.run()
