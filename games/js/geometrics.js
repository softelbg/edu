/*
 * Misho Georgiev game project
 *
 * 2022 Softel Labs
 *
*/


function randint(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function randuniform(min, max, decimals=3) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals))
}

function to_radians(angle) {
  return angle * Math.PI / 180
}

function to_degrees(angle) {
  return angle * 180 / Math.PI
}

function line_perpendicular(p1, p2, l) {
  x1 = p1[0]
  y1 = p1[1]
  x2 = p2[0]
  y2 = p2[1]

  x3 = x2 - x1
  y3 = y2 - y1

  mag = Math.sqrt(x3 * x3 + y3 * y3)
  x3 /= mag
  y3 /= mag

  x4 = x2 - y3 * l
  y4 = y2 + x3 * l
  x5 = x2 + y3 * l
  y5 = y2 - x3 * l
  return [[x4, y4], [x5, y5]]
}

function frame_bounds_rewind(w, h, x, y, dx=0, dy=0) {
  if (x - dx > w) { x = 1 - dx }
  if (x + dx < 0) { x = w - 1 + dx }
  if (y - dy > h) { y = 1 - dx }
  if (y + dy < 0) { y = h - 1 + dx }
  return [x, y]
}

function frame_bounds(w, h, x, y, ldx=0, ldy=0, rdx=0, rdy=0) {
  x = Math.max(x, 0 + ldx)
  x = Math.min(x, w - rdx)
  y = Math.max(y, 0 + ldy)
  y = Math.min(y, h - rdy)
  return [x, y]
}

function get_angle(p1, p2) {
  x1 = p1[0]
  y1 = p1[1]
  x2 = p2[0]
  y2 = p2[1]

  if (y2 - y1 == 0) { return 90 }

  return to_degrees(Math.atan((x2 - x1) / (y2 - y1)))
}

function get_lines_angle(l1, l2) {
  let v1 = [l1[0][0] - l1[1][0], l1[0][1] - l1[1][1]]
  let v2 = [l2[0][0] - l2[1][0], l2[0][1] - l2[1][1]]
  let angle = to_degrees(Math.atan2(v1[0], v1[1]) - Math.atan2(v2[0], v2[1]))

  // if (angle < 0) { angle += 360 }
  return angle
}
