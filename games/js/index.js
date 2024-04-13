/*
 * Misho Georgiev game project
 *
 * 2022 Softel Labs
 *
*/


class IndexGame extends Game {
  constructor(canvas, w, h) {
    super(canvas, w, h)

    this.list_games = [
      ["ASTEROIDS", "asteroids.html?w=1200&h=800&lives=5"],
      ["SNAKE", "snake.html?w=1200&h=800&lives=20"],
      ["ROCKET LANDER", "lander.html?w=1200&h=800&lives=10&players=1"],
      ["POPCORN", "popcorn.html?w=1200&h=800&lives=10&balls=5"]
    ]

    this.list_buttons = []
    let button_space = this.H / this.list_games.length

    for (let i = 0; i < this.list_games.length; i++) {
      this.list_buttons.push(
        new ButtonURL(
          this.ctx, this.W, this.H,
          50 * this.W_ratio, 50 * this.H_ratio + i * button_space,
          400, 100,
          this.list_games[i][0], this.list_games[i][1], "blue")
      )
    }

    document.addEventListener('keydown', this.on_keydown.bind(this))
  }

  on_keydown(e) {

  }

  draw() {
    for (let i = 0; i < this.list_buttons.length; i++) {
      this.list_buttons[i].draw()
    }
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
