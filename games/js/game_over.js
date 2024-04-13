/*
 * Misho Georgiev game project
 *
 * 2022 Softel Labs
 *
*/


class GameOver {
  constructor(ctx, w, h, size=10) {
    this.ctx = ctx
    this.W = w
    this.H = h
    this.W_ratio = this.W / 1200
    this.H_ratio = this.H / 800
    this.size = size * this.W_ratio

    this.top = [
      "КРАЙ на ИГРАТА"
    ]

    this.txt = [
      "Мишо Георгиев 5-ти клас в НПМГ училищен проект игра.",
      "с помощта на Станислав Георгиев", "", "",
      "Математика: ъгли sin/cos, корен квадратен, окръжности, евклидово разстояние м/у 2 точки",
      "Физика: летене в космоса (без гравитация и триене), напълно еластичен удар м/у 2 тела",
      "Програмиране: променливи, цикли, условно управление, класове",
      "CS: Подобряване на детектора за колизии, ползване на по-ефективен алгоритъм с по-ниска времева сложност",
      "", "",
      "Идеи за следващи допълнения",
      "1P: (1 допълнителен играч)",
      "1WS: по-бърз лазер",
      "3W: допълнителни 2 лазера на всяко крило (общо 3 лазера)",
    ]

    this.x = this.W / 6
    this.y = this.H / 8

    this.text_scroll = new TextScroll(ctx, this.x, this.y + 50 * this.H_ratio, this.txt, this.size)

    this.button_new_game = new Button(
      this.ctx, this.W, this.H,
      10, 50,
      100, 40,
      "Нова игра", function() { window.location.reload() },
      "blue", 12
    )

    this.show = false
  }

  draw() {
    let size = 40 * this.W_ratio
    for (let i = 0; i < this.top.length; i++) {
      draw_text(this.ctx, this.top[i], this.x, this.y + i * size + 3, size, "#EE0000")
    }

    this.text_scroll.draw()
    this.button_new_game.draw()
  }
}