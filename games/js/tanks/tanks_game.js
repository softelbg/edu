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

    this.draw_velocity_bars()
    this.draw_gravity_vector()
  }

  draw_velocity_bars() {
    let bar_w = 310 * this.W_ratio
    let bar_h = 24 * this.H_ratio
    let y = 84 * this.H_ratio

    this.draw_velocity_bar(this.players[0], 18 * this.W_ratio, y, bar_w, bar_h, false)
    this.draw_velocity_bar(this.players[1], this.W - bar_w - 18 * this.W_ratio, y, bar_w, bar_h, true)
  }

  draw_velocity_bar(player, x, y, w, h, align_right=false) {
    let ctx = this.ctx
    let velocity = player.current_shot_velocity()
    let display_max_velocity = 6
    let ratio = Math.min(1, velocity / display_max_velocity)
    let label = `${player.name} velocity ${velocity.toFixed(1)}`
    let hint = `hold ${player.control_label("изстрел")}`
    let fill_w = Math.max(0, Math.min(w, w * ratio))

    ctx.save()

    ctx.globalAlpha = 0.88
    draw_rect(ctx, x, y, w, h, "rgba(0, 0, 0, 0.58)", true)
    ctx.globalAlpha = 1

    let fill_color = ratio > 0.75 ? "#ffcf4a" : ratio > 0.38 ? "#55c3d8" : "#58c878"
    draw_rect(ctx, x, y, fill_w, h, fill_color, true)
    draw_rect(ctx, x, y, w, h, player.color, false, 2)

    ctx.font = `${14 * this.W_ratio}px Arial`
    ctx.fillStyle = "white"
    ctx.textAlign = align_right ? "right" : "left"
    ctx.fillText(label, align_right ? x + w : x, y - 8 * this.H_ratio)

    ctx.font = `${11 * this.W_ratio}px Arial`
    ctx.fillStyle = "#dce8ef"
    ctx.textAlign = align_right ? "left" : "right"
    ctx.fillText(hint, align_right ? x : x + w, y + h + 15 * this.H_ratio)

    ctx.restore()
  }

  // Draw Gravity vector on the upper right corner with an red arrow
  draw_gravity_vector() {
    let g_len = 20000 * (Math.sqrt(this.G[0]**2 + this.G[1]**2))
    let g_angle = Math.atan2(this.G[1], this.G[0])
    let g_x = this.W * 0.8
    let g_y = 10 + g_len
    let g_x2 = g_x + g_len * Math.cos(g_angle)
    let g_y2 = g_y + g_len * Math.sin(g_angle)

    draw_arrow(this.ctx, g_x, g_y, g_x2, g_y2, "red", 2)
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
