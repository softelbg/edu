/*
 * Misho Georgiev game project
 *
 * 2023 Softel Labs
 *
*/


class BaseGravityBounce {
  constructor(ctx, bounce, x, y, vx=1.0, vy=0.0, g=0.03, ga=90) {
    this.ctx = ctx

    this.x = x
    this.y = y

    this.vx = vx
    this.vy = vy
    this.vloss = 1.0

    this.G = g
    this.GA = ga

    this.bounce = bounce
  }

  draw() {
    let GA_radians = to_radians(this.GA)
    let gx = this.G * Math.cos(GA_radians)
    let gy = this.G * Math.sin(GA_radians)

    this.vx += gx
    this.vy += gy

    this.x += this.vx
    this.y += this.vy

    if (this.x > this.ctx["WH"]["W"] || this.x < 0) { this.vx = - this.vloss * this.vx }
    if (this.y > this.ctx["WH"]["H"] || this.y < 0) { this.vy = - this.vloss * this.vy }
    let xy = frame_bounds(this.ctx["WH"]["W"], this.ctx["WH"]["H"], this.x, this.y)
    this.x = xy[0]
    this.y = xy[1]

    this.bounce.x = this.x
    this.bounce.y = this.y
    this.bounce.draw()
  }
}


class BounceView extends Game {
  constructor(canvas, w, h, n, g) {
    super(canvas, w, h)

    let vy = 0.0
    let max_y = h / 2

    this.bounce_list = []
    for (let i = 0; i < n; i++) {
      this.bounce_list.push(new BaseGravityBounce(
        this.ctx,
        new Cube(this.ctx, randint(20, 100)),
        randint(30, w - 30), randint(0, max_y), randuniform(-3.0, 3.0), vy, g)
      )
      this.bounce_list.push(new BaseGravityBounce(
        this.ctx,
        new Cylinder(this.ctx, randint(30, 100), randuniform(0.5, 1.5), 12),
        randint(30, w - 30), randint(0, max_y), randuniform(-3.0, 3.0), vy, g)
      )
      this.bounce_list.push(new BaseGravityBounce(
        this.ctx,
        new Sphere(this.ctx, randint(30, 100), 20),
        randint(30, w - 30), randint(0, max_y), randuniform(-3.0, 3.0), vy, g)
      ),
      this.bounce_list.push(new BaseGravityBounce(
        this.ctx,
        new Pyramid(this.ctx, randint(100, 200)),
        randint(30, w - 30), randint(0, max_y), randuniform(-3.0, 3.0), vy, g)
      ),
      this.bounce_list.push(new BaseGravityBounce(
        this.ctx,
        new Cone(this.ctx, randint(50, 200), randuniform(0.5, 1.0), 12),
        randint(30, w - 30), randint(0, max_y), randuniform(-3.0, 3.0), vy, g)
      ),
      this.bounce_list.push(new BaseGravityBounce(
        this.ctx,
        new Spiral(this.ctx, randint(50, 100), randuniform(0.5, 1.0), 12, randint(3, 7)),
        randint(30, w - 30), randint(0, max_y), randuniform(-3.0, 3.0), vy, g)
      ),
      this.bounce_list.push(new BaseGravityBounce(
        this.ctx,
        new SinSpiral(this.ctx, randint(50, 100), randuniform(0.8, 1.2), 10, 20, randuniform(0.03, 0.05)),
        randint(30, w - 30), randint(0, max_y), randuniform(-3.0, 3.0), vy, g)
      )
    }
  }

  draw() {
    draw_text(this.ctx, "FPS " + Math.round(this.fps_counter.fps), 5, 20, 10, "white")
    draw_text(this.ctx, "3D rotations on plain 2D (using only line, circrle draw)", 5, 40, 10, "white")
    for (let i = 0; i < this.bounce_list.length; i++) {
      this.bounce_list[i].draw()
    }
  }
}

