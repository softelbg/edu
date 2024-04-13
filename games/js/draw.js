/*
 * Misho Georgiev game project
 *
 * 2022 Softel Labs
 *
*/


function draw_filled(ctx, color, filled) {
  if (filled) {
    ctx.fillStyle = color;
    ctx.fill();
  } else {
    ctx.strokeStyle = color;
    ctx.stroke();
  }
}

function draw_text(ctx, txt, x, y, size, color="black", font="arial", min_y=-1, max_y=-1) {
  if (max_y > -1 || min_y > -1) {
    if (y > max_y) { y = y - max_y + min_y }
    if (y < min_y) { y = max_y - min_y + y}
  }

  ctx.beginPath();
  ctx.font = size + 'px ' + font;
  ctx.fillStyle = color;
  ctx.fillText(txt, x, y);
}

function draw_line(ctx, p1, p2, color, w) {
  ctx.beginPath();
  ctx.lineWidth = w;
  ctx.moveTo(p1[0], p1[1]);
  ctx.lineTo(p2[0], p2[1]);
  ctx.strokeStyle = color;
  ctx.stroke();
}

function draw_contours(ctx, points, color, w, filled=false) {
  // console.log("draw_contours", points, color, w, filled)
  ctx.beginPath();
  ctx.lineWidth = w;
  ctx.moveTo(points[0][0], points[0][1]);
  for (i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.closePath();

  draw_filled(ctx, color, filled)
}

function draw_rect(ctx, x, y, w, h, color="black", filled=false, width=1) {
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.rect(x, y, w, h);

  draw_filled(ctx, color, filled)
}

function draw_circle(ctx, x, y, r, color="black", filled=false) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);

  draw_filled(ctx, color, filled)
}


class IDraw {
  draw() {}
}

class TextScroll {
  constructor(ctx, x0, y0, txt, size, dy=0.1) {
    this.ctx = ctx
    this.size = size
    this.txt = txt

    this.x0 = x0
    this.y0 = y0
    this.x = x0
    this.y = y0
    this.dy = dy
    this.scroll_size = 300
  }

  draw() {
    for (let i = 0; i < this.txt.length; i++) {
      draw_text(this.ctx, this.txt[i], this.x, this.y + i * this.size + 3, this.size, "white", "arial", this.y0, this.y0 + this.scroll_size)
    }

    this.y += this.dy
    if (this.y >= this.y0 + this.scroll_size) { this.y = this.y0 }
  }
}


class TextHorizontalScroll {
  constructor(ctx, x0, x1, y0, txt, size, dx=0.1) {
    this.ctx = ctx
    this.txt = txt
    this.size = size

    this.x0 = x0
    this.x1 = x1
    this.y0 = y0

    this.dx = dx
    this.x = x0
    this.y = y0
  }

  draw() {
    this.x = this.x + this.dx

    if (this.x > this.x1 || this.x < this.x0) {
      this.dx = - this.dx
    }

    draw_text(this.ctx, this.txt, this.x, this.y, this.size, "white")
  }
}