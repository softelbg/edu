/*
 * Misho Georgiev game project
 *
 * 2022 Softel Labs
 *
*/


class Help {
  constructor(ctx, w, h, x0, y0, size=12) {
    this.ctx = ctx
    this.W = w
    this.H = h
    this.x = x0
    this.y = y0
    this.txt = ["ESC за ПОМОЩ", ""]
    this.W_ratio = this.W / 1200
    this.H_ratio = this.H / 800
    this.size = size * this.W_ratio

    this.left_side = [
      "Мишо Георгиев НПМГ училищен проект-игра",
      "Управление на ракетата при липса на гравитация и триене.",
      "Лимит на гориво и лазер.",
      "",
      "Идеи за следващи допълнения",
      "1P: (1 допълнителен играч)",
      "F: зареждане на гориво",
      "L: зареждане на лазера",
      "1WS: по-бърз лазер",
      "3W: допълнителни 2 лазера на всяко крило (общо 3 лазера)",
    ]
    this.text_scroll = new TextScroll(this.ctx, this.x + (300 * this.W_ratio), this.y, this.left_side, this.size)

    this.show = false

    this.text_misho = new TextHorizontalScroll(this.ctx, 100 * this.W_ratio, 400 * this.W_ratio, 500 * this.H_ratio, "Мишо учи javascript", 32 * this.W_ratio, 0.5)
  }

  controls(list_controls, tag="") {
    this.txt = ["ESC за ПОМОЩ", ""]
    for (let i = 0; i < list_controls.length; i++) {
      this.txt.push(tag + " " + (i + 1))
      for (const [action, action_controls] of Object.entries(list_controls[i].controls)) {
        if (action_controls.constructor == Object) {
          for (const [key, value] of Object.entries(action_controls)) {
            this.txt.push("[ " + key + " ] " + action + " с " + value)
          }
        } else {
          this.txt.push("[ " + action_controls + " ] " + action)
        }
      }
      this.txt.push("")
    }
  }

  draw() {
    for (let i = 0; i < this.txt.length; i++) {
      draw_text(this.ctx, this.txt[i], this.x, this.y + i * this.size + 3, this.size, "white")
    }

    this.text_scroll.draw()
    this.text_misho.draw()
  }
}