/*
 * Misho Georgiev game project
 *
 * 2022 Softel Labs
 *
*/


class IndexGame extends Game {
  constructor(canvas, w, h) {
    super(canvas, w, h, "#0b1118")

    this.t = 0
    this.list_games = [
      {
        name: "ASTEROIDS",
        url: "asteroids.html?w=1200&h=800&lives=5",
        category: "Game",
        subtitle: "Space flight, lasers, collision physics",
        accent: "#55c3d8"
      },
      {
        name: "SNAKE",
        url: "snake.html?w=1200&h=800&lives=20",
        category: "Game",
        subtitle: "Grid movement and growing path logic",
        accent: "#56c271"
      },
      {
        name: "ROCKET LANDER",
        url: "lander.html?w=1200&h=800&lives=10&players=1",
        category: "Game",
        subtitle: "Thrust, inertia, fuel, and landing control",
        accent: "#d8a24a"
      },
      {
        name: "POPCORN",
        url: "popcorn.html?w=1200&h=800&lives=10&balls=5",
        category: "Game",
        subtitle: "Paddle, bricks, rebounds, and bonuses",
        accent: "#e37c68"
      },
      {
        name: "TANKS",
        url: "tanks.html?w=1200&h=800&lives=10",
        category: "Game",
        subtitle: "Two-player aiming and projectile motion",
        accent: "#7cb86c"
      },
      {
        name: "MICROPHONE VISUALIZER",
        url: "mic.html?w=1200&h=800",
        category: "Audio",
        subtitle: "Live microphone signal visualization",
        accent: "#a675d8"
      },
      {
        name: "MATRIX SNAIL",
        url: "algo/index.html?w=1200&h=800&n=10&m=1",
        category: "Algorithm",
        subtitle: "Spiral traversal as an interactive simulation",
        accent: "#65b7a8"
      },
      {
        name: "INTEGRAL SIMULATION",
        url: "algo/integral.html?w=1200&h=800&a=-10&b=10&formula=10*sin(0.5*x)*sin(10*x)&dx=0.01&round=5",
        category: "Math",
        subtitle: "Two-frequency wave with low-frequency modulation",
        accent: "#5a8dde"
      },
      {
        name: "3D CUBE SIMULATION",
        url: "3d/index.html?w=1200&h=800&n=3&g=0.03",
        category: "3D",
        subtitle: "Projected cube motion in a 2D canvas",
        accent: "#cf7edb"
      }
    ]

    this.list_buttons = []
    let start_x = 58
    let start_y = 270
    let button_w = 342
    let button_h = 118
    let gap_x = 28
    let gap_y = 24

    for (let i = 0; i < this.list_games.length; i++) {
      let game = this.list_games[i]
      let col = i % 3
      let row = Math.floor(i / 3)

      this.list_buttons.push(
        new ButtonURL(
          this.ctx, this.W, this.H,
          start_x + col * (button_w + gap_x),
          start_y + row * (button_h + gap_y),
          button_w, button_h,
          game.name, game.url, game.accent, 25,
          {
            subtitle: game.subtitle,
            badge: game.category,
            accent: game.accent,
            fill: "#111b26",
            fill_hover: "#182939",
            target: "_self"
          }
        )
      )
    }

    document.addEventListener('keydown', this.on_keydown.bind(this))
  }

  on_keydown(e) {

  }

  draw() {
    this.t += 0.01
    this.draw_background()
    this.draw_header()

    for (let i = 0; i < this.list_buttons.length; i++) {
      this.list_buttons[i].draw()
    }

    this.draw_footer()
  }

  draw_background() {
    let ctx = this.ctx
    let gradient = ctx.createLinearGradient(0, 0, this.W, this.H)
    gradient.addColorStop(0, "#0b1118")
    gradient.addColorStop(0.55, "#101d28")
    gradient.addColorStop(1, "#0d161f")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, this.W, this.H)

    ctx.save()
    ctx.globalAlpha = 0.22
    for (let x = 0; x <= this.W; x += 60 * this.W_ratio) {
      draw_line(ctx, [x, 0], [x, this.H], "#294354", 1)
    }
    for (let y = 0; y <= this.H; y += 60 * this.H_ratio) {
      draw_line(ctx, [0, y], [this.W, y], "#294354", 1)
    }
    ctx.restore()

    ctx.save()
    ctx.globalAlpha = 0.32
    draw_circle(ctx, 960 * this.W_ratio, 140 * this.H_ratio, 170 * this.W_ratio, "#1d8ea7", true)
    draw_circle(ctx, 1000 * this.W_ratio, 650 * this.H_ratio, 150 * this.W_ratio, "#204f8f", true)
    ctx.restore()
  }

  draw_header() {
    let ctx = this.ctx

    ctx.save()
    ctx.font = "800 " + 22 * this.W_ratio + "px Arial"
    ctx.fillStyle = "#80d7e4"
    ctx.fillText("SOFTEL LABS EDUCATION", 58 * this.W_ratio, 62 * this.H_ratio)

    ctx.font = "900 " + 58 * this.W_ratio + "px Arial"
    ctx.fillStyle = "#f8fbff"
    ctx.fillText("Games & interactive simulations", 56 * this.W_ratio, 132 * this.H_ratio)

    ctx.font = "600 " + 22 * this.W_ratio + "px Arial"
    ctx.fillStyle = "#a7b8c8"
    ctx.fillText("Canvas-based projects for physics, algorithms, audio, and programming practice.", 60 * this.W_ratio, 178 * this.H_ratio)

    ctx.fillStyle = "rgba(255, 255, 255, 0.08)"
    rounded_rect_path(ctx, 58 * this.W_ratio, 210 * this.H_ratio, 252 * this.W_ratio, 36 * this.H_ratio, 18 * this.W_ratio)
    ctx.fill()
    ctx.font = "800 " + 15 * this.W_ratio + "px Arial"
    ctx.fillStyle = "#d9eef2"
    ctx.fillText("9 available activities", 78 * this.W_ratio, 233 * this.H_ratio)
    ctx.restore()
  }

  draw_footer() {
    let ctx = this.ctx
    ctx.save()
    ctx.font = "600 " + 15 * this.W_ratio + "px Arial"
    ctx.fillStyle = "#728494"
    ctx.fillText("Click a card to launch. Use each activity's in-game controls after it opens.", 60 * this.W_ratio, 748 * this.H_ratio)
    ctx.restore()
  }
}


const query = window.location.search
const params = new URLSearchParams(query)

game = new IndexGame(
              document.getElementsByTagName('canvas')[0],
              params.get("w") || 1200,
              params.get("h") || 800
)
game.run()
