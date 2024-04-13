/*
 * Misho Georgiev game project
 *
 * 2022 Softel Labs
 *
*/


class SpaceAsteroids extends Game {
  constructor(canvas, w, h, rocket_lives=10, asteroids_count=30, mouse=false, is_run) {
    super(canvas, w, h)

    this.is_run = is_run
    this.rocket_lives = rocket_lives
    this.asteroids_count = asteroids_count

    this.fps_ratio = 1

    this.rocket_controls={
      "огън": 'm',
      "ускорение": {
        'u': 0.01, 'i': 0.03, 'o': 0.02
      },
      "завъртане": {
        'h': -1, 'j': -3, 'k': 3, 'l': 1
      },
      "mouse": mouse
    }

    this.rocket_lives_bar = new VolumeBar(this.ctx, [100, 20], this.rocket_lives, "Мишо животи", "green")

    this.help = new Help(this.ctx, this.W, this.H, 30, 30, 20)
    this.game_over = new GameOver(this.ctx, this.W, this.H, 14)

    this.asteroids_removed = 0
    this.asteroids = []
    this.rockets = []

    this.bonuses = []

    this.help.show = true
    setTimeout(this.on_fps.bind(this), 1500)
  }

  on_fps() {
    let fps = this.fps_counter.fps
    this.fps_ratio = 120 / fps

    this.rockets = [
      new Rocket(this.ctx, this.W, this.H, 50, 50, "#CCCC00", 10, 200, 20, this.fps_ratio, this.rocket_controls),
      new Rocket(
        this.ctx, this.W, this.H, 150, 150, "#00DDDD", 10, 200, 20,
        this.fps_ratio,
        {
          "огън": 'x',
          "ускорение": {'w': 0.01},
          "завъртане": {'a': -3, 's': 1, 'd': 3}
        },
        "2", [450, 20]
      )
    ]

    this.init_asteroids()

    this.bonus_types = this.rockets[0].bonus_types

    this.help.controls(this.rockets, "Ракета")
    if (this.is_run) { this.help.show = false }

    document.addEventListener('keydown', this.on_keydown.bind(this))
  }

  on_keydown(e) {
    if (e.key === "Escape") {
      this.help.show = ! this.help.show
    }
  }

  init_asteroids() {
    let dv = 1.1
    while(this.asteroids.length < this.asteroids_count) {
      let x0 = randint(200, this.W)
      let y0 = randint(200, this.H)
      let r0 = randint(5, 100)
      let is_usable = true
      for (let i = 0; i < this.asteroids.length; i++) {
        let asteroid = this.asteroids[i]
        let d = Math.sqrt((asteroid.x - x0) ** 2 + (asteroid.y - y0) ** 2)
        if (d < (asteroid.r + r0) * 1.2) {
          is_usable = false
          break
        }
      }

      if (is_usable) {
        this.asteroids.push(
          new Asteroid(
            this.ctx, this.W, this.H,
            x0, y0,
            randuniform(-dv, dv),
            randuniform(-dv, dv),
            r0, this.fps_ratio,
            "white", 10
          )
        )
      }
    }

    this.asteroids_bar = new VolumeBar(this.ctx, [100, 40], this.asteroids.length * 2, "Астероиди", "orange")
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
    this.rocket_lives_bar.draw(this.rocket_lives)
    this.asteroids_bar.draw(this.asteroids.length)

    let list_remove_bonuses = []
    for (let i = 0; i < this.rockets.length; i++) {
      this.rockets[i].move()
      list_remove_bonuses = list_remove_bonuses.concat(this.rockets[i].bonus_collisions(this.bonuses))
    }

    for (let i = list_remove_bonuses.length - 1; i >= 0; i--) {
      this.bonuses.splice(list_remove_bonuses[i], 1)
    }

    for (let i = 0; i < this.asteroids.length; i++) {
      this.asteroids[i].move()
    }

    for (let i = 0; i < this.bonuses.length; i++) {
      this.bonuses[i].move()
    }

    // Collisions between asteroids as pure elastic collision
    for (let i = 0; i < this.asteroids.length; i++) {
      for (let j = i + 1; j < this.asteroids.length; j++) {
        let d = Math.sqrt((this.asteroids[i].x - this.asteroids[j].x) ** 2 + (this.asteroids[i].y - this.asteroids[j].y) ** 2)
        if (d <= this.asteroids[i].r + this.asteroids[j].r) {
          let vx1 = ((this.asteroids[i].r - this.asteroids[j].r) * this.asteroids[i].vx + 2 * this.asteroids[j].r * this.asteroids[j].vx) / (this.asteroids[i].r + this.asteroids[j].r)
          let vy1 = ((this.asteroids[i].r - this.asteroids[j].r) * this.asteroids[i].vy + 2 * this.asteroids[j].r * this.asteroids[j].vy) / (this.asteroids[i].r + this.asteroids[j].r)
          let vx2 = ((this.asteroids[j].r - this.asteroids[i].r) * this.asteroids[j].vx + 2 * this.asteroids[i].r * this.asteroids[i].vx) / (this.asteroids[i].r + this.asteroids[j].r)
          let vy2 = ((this.asteroids[j].r - this.asteroids[i].r) * this.asteroids[j].vy + 2 * this.asteroids[i].r * this.asteroids[i].vy) / (this.asteroids[i].r + this.asteroids[j].r)
          this.asteroids[i].vx = vx1
          this.asteroids[i].vy = vy1
          this.asteroids[j].vx = vx2
          this.asteroids[j].vy = vy2
        }
      }
    }

    let asteroids_to_remove = []
    let laser_asteroid_collisions = this.rockets[0].laser_collisions(this.asteroids)
    let list_movable_collisions = laser_asteroid_collisions[0]
    let list_laser_collisions = laser_asteroid_collisions[1]

    for (let i = list_movable_collisions.length - 1; i >= 0; i--) {
      let asteroid = this.asteroids[list_movable_collisions[i]]
      let laser = this.rockets[0].lasers[list_laser_collisions[i]]
      if (!laser) { continue }
      if (asteroid.r > 10) {
        let angle1 = to_radians(laser.angle + 90)
        let angle2 = to_radians(laser.angle - 90)
        this.asteroids.push(
          new Asteroid(
            this.ctx, this.W, this.H,
            asteroid.x + Math.cos(angle1) * (asteroid.r / 1.9),
            asteroid.y + Math.sin(angle1) * (asteroid.r / 1.9),
            Math.cos(angle1) * asteroid.vx,
            Math.sin(angle1) * asteroid.vy,
            asteroid.r / 2,
            this.fps_ratio,
            "white", 10
          )
        )
        this.asteroids.push(
          new Asteroid(
            this.ctx, this.W, this.H,
            asteroid.x + Math.cos(angle2) * (asteroid.r / 1.9),
            asteroid.y + Math.sin(angle2) * (asteroid.r / 1.9),
            Math.cos(angle2) * asteroid.vx,
            Math.sin(angle2) * asteroid.vy,
            asteroid.r / 2,
            this.fps_ratio,
            "white", 10
          )
        )

        if (randint(0, 4) == 1) {

          this.bonuses.push(
            new this.bonus_types[randint(0, this.bonus_types.length - 1)](
              this.ctx, this.W, this.H,
              asteroid.x, asteroid.y,
              randint(0, 360), randuniform(-0.5, 0.5),
              this.fps_ratio
            )
          )
        }
      }

      this.asteroids.splice(list_movable_collisions[i], 1)
      this.rockets[0].remove_laser(list_laser_collisions[i])
      this.asteroids_removed += 1
    }

    for (let i = 0; i < this.asteroids.length; i++) {
      let asteroid = this.asteroids[i]
      if (this.rockets[0].check_collision(asteroid.x, asteroid.y, asteroid.r)) {
        this.asteroids.splice(i, 1)
        this.rockets[0] = new RocketExplosion(this.ctx, this.W, this.H, this.rockets[0].x, this.rockets[0].y, this.fps_ratio)
        this.rocket_lives -= 1
        break
      }
    }

    if (!this.rockets[0].alive()) {
      if (this.rocket_lives > 0) {
        this.rockets[0].destructor()
        this.rockets[0] = new Rocket(this.ctx, this.W, this.H, this.rockets[0].x, this.rockets[0].y, "#CCCC00", 10, this.asteroids.length * 10, 20, this.fps_ratio, this.rocket_controls)
      } else {
        this.game_over.show = true
      }
    }

    let txt = "Астероиди " + this.asteroids_removed + " / " +  this.asteroids.length
    if (this.asteroids.length == 0 && this.rocket_lives > 0) {
      this.rockets[0].destructor()
      this.rockets[0] = new Rocket(this.ctx, this.W, this.H, this.rockets[0].x, this.rockets[0].y, "#CCCC00", 50, 200, 50, this.fps_ratio, this.rocket_controls)
      txt = "Победа"
      this.rocket_lives = -1
    }
    draw_text(this.ctx, "ESC за Помощ", 5, 20, 10, "white")
    draw_text(this.ctx, txt, 5, 30, 10, "white")
    draw_text(this.ctx, "FPS " + Math.round(this.fps_counter.fps), 5, 40, 10, "white")
  }
}



const query = window.location.search
const params = new URLSearchParams(query)

game = new SpaceAsteroids(
              document.getElementsByTagName('canvas')[0],
              params.get("w") || 1200,
              params.get("h") || 800,
              params.get("lives") || 10,
              params.get("asteroids") || 20,
              params.get("mouse") || false,
              params.get("run") || 0
)
game.run()
