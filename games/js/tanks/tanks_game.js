/*
 * Misho Georgiev game project
 *
 * 2025 Softel Labs
 *
*/


class TanksGame extends Game {
  constructor(canvas, w, h, lives, gx, gy) {
    super(canvas, w, h)

    this.help = new Help(this.ctx, this.W, this.H, 30, 30, 20)
    this.game_over = new GameOver(this.ctx, this.W, this.H, 14)

    this.terrain = [[0, this.H - 100], [this.W, this.H - 100]]
    this.G = [parseFloat(gx), parseFloat(gy)]
    console.log("Gravity:", this.G)

    this.list_hills = [
      new Hill(this.ctx, this.W, this.H, this.W / 2, this.terrain[0][1], 50)
    ]

    this.players = [
      new Tank(this.ctx, this.W, this.H, randint(50, this.W / 2 - 80), this.terrain[0][1], 10, this.G, "orange", 270,
        {
          "наляво":  'a',
          "надясно": 's',
          "изстрел": 'w',
        },
        "играч 1"
      ),
      new Tank(this.ctx, this.W, this.H, randint(this.W / 2 + 80, this.W - 80), this.terrain[0][1], 10, this.G, "yellow", 270,
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

    // draw_line(this.ctx, this.terrain[0], this.terrain[1], "green", 4)
    draw_rect(this.ctx, this.terrain[0][0], this.terrain[0][1], this.W, this.H - this.terrain[0][1], "green", true)

    for (let i = 0; i < this.list_hills.length; i++) {
      this.list_hills[i].draw()
    }

    draw_text(this.ctx, "ESC за Помощ", 5, 20, 10, "white")
    draw_text(this.ctx, "FPS " + Math.round(this.fps_counter.fps), 5, 40, 10, "white")

    for (let i = 0; i < this.players.length; i++) {
      for (let j = 0; j < this.players[i].cannon_balls.length; j++) {
        this.players[i].cannon_balls[j].check_bounds(0, 0,  this.terrain[1][0],  this.terrain[1][1])

        for (let h = 0; h < this.list_hills.length; h++) {
          let is_collision = this.players[i].cannon_balls[j].collision_circle(this.list_hills[h].x, this.list_hills[h].y, this.list_hills[h].r)
        }

        for (let p = 0; p < this.players.length; p++) {
          if (this.players[p].alive) {
            let is_collision = this.players[i].cannon_balls[j].collision_circle(this.players[p].x, this.players[p].y, this.players[p].r)
            if (is_collision) {
              this.players[p].kill()
            }
          }
        }
      }
    }

    for (let i = 0; i < this.players.length; i++) {
      this.players[i].draw()
      draw_text(this.ctx, this.players[i].info(), 5 + (i * 140), 60, 10, "white")
    }

    this.draw_gravity_vector()
  }

  // Draw Gravity vector on the upper right corner with an red arrow
  draw_gravity_vector() {
    let g_len = 20000 * (Math.sqrt(this.G[0]**2 + this.G[1]**2))
    let g_angle = Math.atan2(this.G[1], this.G[0])
    let g_x = this.W * 0.8
    let g_y = 10 + g_len
    let g_x2 = g_x + g_len * Math.cos(g_angle)
    let g_y2 = g_y + g_len * Math.sin(g_angle)
    draw_line(this.ctx, [g_x, g_y], [g_x2, g_y2], "red", 2)
    // Draw arrowhead
    let arrow_size = 10
    let arrow_angle1 = g_angle + Math.PI / 6
    let arrow_angle2 = g_angle - Math.PI / 6
    let arrow_x1 = g_x2 - arrow_size * Math.cos(arrow_angle1)
    let arrow_y1 = g_y2 - arrow_size * Math.sin(arrow_angle1)
    let arrow_x2 = g_x2 - arrow_size * Math.cos(arrow_angle2)
    let arrow_y2 = g_y2 - arrow_size * Math.sin(arrow_angle2)
    draw_line(this.ctx, [g_x2, g_y2], [arrow_x1, arrow_y1], "red", 2)
    draw_line(this.ctx, [g_x2, g_y2], [arrow_x2, arrow_y2], "red", 2)
  }
}


const query = window.location.search
const params = new URLSearchParams(query)

let gx_var = 0.001

game = new TanksGame(
              document.getElementsByTagName('canvas')[0],
              params.get("w") || 1200,
              params.get("h") || 800,
              params.get("lives") || 10,
              params.get("gx") || Math.random() * gx_var * 2 - gx_var,
              params.get("gy") || Math.random() * 0.003 + 0.001,
)
game.run()
