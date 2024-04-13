/*
 * Misho Georgiev game project
 *
 * 2022 Softel Labs
 *
*/


class Button {
  constructor(ctx, W, H, x0, y0, w, h, name, click_callback, color, text_size=32) {
    this.ctx = ctx
    this.W = W
    this.H = H
    this.W_ratio = this.W / 1200
    this.H_ratio = this.H / 800

    this.name = name
    this.click_callback = click_callback

    this.color = color
    this.color_text = "white"

    this.x0 = x0 * this.W_ratio
    this.y0 = y0 * this.H_ratio
    this.x = this.x0
    this.y = this.y0
    this.w = w * this.W_ratio
    this.h = h * this.H_ratio
    this.l0 = 0.3 * this.h * this.H_ratio
    this.l = this.l0
    this.alpha = to_radians(30)

    this.text_size = text_size * this.W_ratio

    this.mouse_listeners = {
      'mousemove': this.on_mouse_move.bind(this),
      'mouseup': this.on_mouse_up.bind(this),
      'mousedown': this.on_mouse_down.bind(this),
      'dblclick': this.on_dbl_click.bind(this),
    }

    for (const [key, value] of Object.entries(this.mouse_listeners)) {
      document.addEventListener(key, value)
    }
  }

  on_mouse_move(e) {
    let rect = this.ctx["BoundingClientRect"]
    this.mx = e.clientX - rect.left
    this.my = e.clientY - rect.top

    this.color_text = this.mouse_hover() ? "green" : "white"
  }
  on_mouse_down(e) {
    if (this.mouse_hover()) {
      this.l /= 2
      this.x += this.l * Math.cos(this.alpha)
      this.y -= this.l * Math.cos(this.alpha)
    }
  }
  on_mouse_up(e) {
    this.l = this.l0
    this.x = this.x0
    this.y = this.y0

    if (this.mouse_hover()) {
      this.click_callback()
    }
  }
  on_dbl_click(e) {

  }

  mouse_hover() {
    return this.mx >= this.x && this.mx <= this.x + this.w && this.my >= this.y && this.my <= this.y + this.h
  }

  draw() {
    draw_rect(this.ctx, this.x, this.y, this.w, this.h, this.color, false, 5)

    let p1 = [this.x + this.l * Math.cos(this.alpha), this.y - this.l * Math.sin(this.alpha)]
    let p2 = [this.x + this.w + this.l * Math.cos(this.alpha), this.y - this.l * Math.sin(this.alpha)]
    let p3 = [this.x + this.w + this.l * Math.cos(this.alpha), this.y + this.h - this.l * Math.sin(this.alpha)]

    draw_line(this.ctx, [this.x, this.y], p1, this.color, 3)
    draw_line(this.ctx, [this.x + this.w, this.y], p2, this.color, 3)
    draw_line(this.ctx, [this.x + this.w, this.y + this.h], p3, this.color, 3)

    draw_line(this.ctx, p1, p2, this.color, 3)
    draw_line(this.ctx, p2, p3, this.color, 3)

    draw_text(this.ctx, this.name, this.x + this.w / 6, this.y + this.h / 2, this.text_size, this.color_text)
  }
}


class ButtonURL extends Button {
  constructor(ctx, W, H, x0, y0, w, h, name, url_link, color) {
    super(ctx, W, H, x0, y0, w, h, name, function() { window.open(url_link, '_blank') }, color)
    this.url_link = url_link
  }
}