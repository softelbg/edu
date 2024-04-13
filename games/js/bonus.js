/*
 * Misho Georgiev game project
 *
 * 2022 Softel Labs
 *
*/


class Bonus extends BaseMoveConstantVelocity {
  constructor(ctx, w, h, x0, y0, angle, v, fps_ratio, color) {
    super(ctx, w, h, x0, y0, 0, 0, fps_ratio, color)

    this.angle = angle

    this.v = v
    this.vx = this.fps_ratio * this.v * Math.cos(to_radians(this.angle))
    this.vy = this.fps_ratio * this.v * Math.sin(to_radians(this.angle))

    this.bonus_value = 0
  }

  name() {
    return this.constructor.name
  }

  value() {
    return this.bonus_value
  }

  draw() {
    draw_rect(this.ctx, this.x, this.y, 50, 50, this.color, false, 3)
  }
}

class BonusRectangle extends Bonus {
  constructor(ctx, w, h, x0, y0, angle, v, fps_ratio, color) {
    super(ctx, w, h, x0, y0, angle, v, fps_ratio, color)

    this.l = 50
    this.tag = "NONE"
  }

  draw() {
    draw_rect(this.ctx, this.x, this.y, this.l * this.W_ratio, this.l * this.W_ratio, this.color, false, 3)
    draw_text(this.ctx, "+ " + this.bonus_value, this.x + 5, this.y + 20 * this.W_ratio, 17 * this.W_ratio, this.color)
    draw_text(this.ctx, this.tag, this.x + 3, this.y + 32 * this.W_ratio, 9 * this.W_ratio, this.color)
  }
}



class BonusWeapon extends BonusRectangle {
  constructor(ctx, w, h, x0, y0, angle, v, fps_ratio) {
    super(ctx, w, h, x0, y0, angle, v, fps_ratio, "orange")

    this.tag = "WEAPON"
    this.bonus_value = 1
  }
}

class BonusLaserCount extends BonusRectangle {
  constructor(ctx, w, h, x0, y0, angle, v, fps_ratio) {
    super(ctx, w, h, x0, y0, angle, v, fps_ratio, "red")

    this.bonus_value = randint(20, 100)
    this.tag = "LASER"
  }
}

class BonusFuel extends BonusRectangle {
  constructor(ctx, w, h, x0, y0, angle, v, fps_ratio) {
    super(ctx, w, h, x0, y0, angle, v, fps_ratio, "blue")

    this.bonus_value = randint(2, 10)
    this.tag = "FUEL"
  }
}

class BonusLive extends BonusRectangle {
  constructor(ctx, w, h, x0, y0, angle, v, fps_ratio) {
    super(ctx, w, h, x0, y0, angle, v, fps_ratio, "green")

    this.bonus_value = 1
    this.tag = "LIVE"
  }
}