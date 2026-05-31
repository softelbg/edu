/*
 * Misho Georgiev game project
 *
 * 2022 Softel Labs
 *
*/


function rounded_rect_path(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2)

  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}


class Button {
  constructor(ctx, W, H, x0, y0, w, h, name, click_callback, color, text_size=32, options={}) {
    this.ctx = ctx
    this.W = W
    this.H = H
    this.W_ratio = this.W / 1200
    this.H_ratio = this.H / 800

    this.name = name
    this.click_callback = click_callback

    this.color = color
    this.color_text = "white"
    this.subtitle = options.subtitle || ""
    this.badge = options.badge || ""
    this.accent = options.accent || this.color || "#1d8ea7"
    this.fill = options.fill || "#111a24"
    this.fill_hover = options.fill_hover || "#172636"
    this.text_color = options.text_color || "#f8fbff"
    this.muted_text_color = options.muted_text_color || "#9fb1c2"
    this.radius = options.radius || 16
    this.shadow = options.shadow === undefined ? true : options.shadow
    this.align = options.align || "left"
    this.show_arrow = options.show_arrow || false
    this.hover = false
    this.is_down = false

    this.x0 = x0 * this.W_ratio
    this.y0 = y0 * this.H_ratio
    this.x = this.x0
    this.y = this.y0
    this.w = w * this.W_ratio
    this.h = h * this.H_ratio
    this.l0 = 0.08 * this.h
    this.l = this.l0
    this.alpha = to_radians(30)

    this.text_size = text_size * Math.min(this.W_ratio, this.H_ratio)
    this.subtitle_size = Math.max(12, this.text_size * 0.45)
    this.badge_size = Math.max(11, this.text_size * 0.38)

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
    let rect = this.ctx.canvas.getBoundingClientRect()
    this.ctx["BoundingClientRect"] = rect
    this.mx = (e.clientX - rect.left) * (this.W / rect.width)
    this.my = (e.clientY - rect.top) * (this.H / rect.height)

    this.hover = this.mouse_hover()
    this.color_text = this.hover ? "#ffffff" : this.text_color
  }
  on_mouse_down(e) {
    if (this.mouse_hover()) {
      this.is_down = true
      this.l = this.l0 / 2
      this.x = this.x0 + 2 * this.W_ratio
      this.y = this.y0 + 2 * this.H_ratio
    }
  }
  on_mouse_up(e) {
    this.is_down = false
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
    let ctx = this.ctx
    let radius = this.radius * Math.min(this.W_ratio, this.H_ratio)
    let accent_width = Math.max(4, 7 * this.W_ratio)
    let fill = this.hover ? this.fill_hover : this.fill
    let border = this.hover ? this.accent : "rgba(255, 255, 255, 0.15)"

    ctx.save()

    if (this.shadow) {
      ctx.shadowColor = this.hover ? "rgba(29, 142, 167, 0.34)" : "rgba(0, 0, 0, 0.28)"
      ctx.shadowBlur = this.hover ? 24 : 12
      ctx.shadowOffsetY = this.hover ? 10 : 6
    }

    rounded_rect_path(ctx, this.x, this.y, this.w, this.h, radius)
    let gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.w, this.y + this.h)
    gradient.addColorStop(0, fill)
    gradient.addColorStop(1, this.hover ? "#21394a" : "#192532")
    ctx.fillStyle = gradient
    ctx.fill()

    ctx.shadowColor = "transparent"
    ctx.lineWidth = this.hover ? 2 : 1
    ctx.strokeStyle = border
    ctx.stroke()

    rounded_rect_path(ctx, this.x, this.y, accent_width, this.h, Math.min(radius, accent_width))
    ctx.fillStyle = this.accent
    ctx.fill()

    if (this.badge) {
      let badge_x = this.x + this.w - 92 * this.W_ratio
      let badge_y = this.y + 15 * this.H_ratio
      let badge_w = 72 * this.W_ratio
      let badge_h = 25 * this.H_ratio
      rounded_rect_path(ctx, badge_x, badge_y, badge_w, badge_h, 12 * Math.min(this.W_ratio, this.H_ratio))
      ctx.fillStyle = "rgba(255, 255, 255, 0.09)"
      ctx.fill()
      ctx.font = "700 " + this.badge_size + "px Arial"
      ctx.fillStyle = this.accent
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(this.badge, badge_x + badge_w / 2, badge_y + badge_h / 2)
    }

    let tx = this.x + 24 * this.W_ratio
    let ty = this.y + this.h / 2
    if (this.subtitle) {
      ty = this.y + this.h / 2 - 7 * this.H_ratio
    }

    ctx.font = "800 " + this.text_size + "px Arial"
    ctx.fillStyle = this.color_text
    ctx.textAlign = this.align
    ctx.textBaseline = "middle"
    ctx.fillText(this.name, tx, ty)

    if (this.subtitle) {
      ctx.font = "600 " + this.subtitle_size + "px Arial"
      ctx.fillStyle = this.muted_text_color
      ctx.fillText(this.subtitle, tx, ty + this.text_size * 0.82)
    }

    if (this.show_arrow) {
      ctx.font = "700 " + Math.max(18, this.text_size * 0.72) + "px Arial"
      ctx.fillStyle = this.hover ? "#ffffff" : this.accent
      ctx.textAlign = "right"
      ctx.fillText(">", this.x + this.w - 24 * this.W_ratio, this.y + this.h / 2 + 1)
    }

    ctx.restore()
  }
}


class ButtonURL extends Button {
  constructor(ctx, W, H, x0, y0, w, h, name, url_link, color, text_size=32, options={}) {
    options.show_arrow = options.show_arrow === undefined ? true : options.show_arrow
    let target = options.target || "_blank"
    super(ctx, W, H, x0, y0, w, h, name, function() { window.open(url_link, target) }, color, text_size, options)
    this.url_link = url_link
  }
}
