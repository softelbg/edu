/*
 * Misho Georgiev game project
 *
 * 2023 Softel Labs
 *
*/


class Base3D {
  constructor(ctx) {
    this.ctx = ctx

    this.L = 100

    this.x = 400
    this.y = 200
    this.z = 0

    this.A = 0
    this.vA = 1.0

    this.random_points = []
    let ra = 1.5
    for (let i = 0; i < 20; i++) {
      this.random_points.push([randuniform(-ra, ra), randuniform(-ra, ra), randuniform(-ra, ra)])
    }
  }

  rotate() {
    this.rotateX = new Matrix([
      [1, 0, 0],
      [0, Math.cos(to_radians(this.A)), -Math.sin(to_radians(this.A))],
      [0, Math.sin(to_radians(this.A)),  Math.cos(to_radians(this.A))],
    ])

    this.rotateY = new Matrix([
      [Math.cos(to_radians(this.A)), 0, -Math.sin(to_radians(this.A))],
      [0, 1, 0],
      [Math.sin(to_radians(this.A)),  0, Math.cos(to_radians(this.A))],
    ])

    this.rotateZ = new Matrix([
      [Math.cos(to_radians(this.A)), -Math.sin(to_radians(this.A)), 0],
      [Math.sin(to_radians(this.A)),  Math.cos(to_radians(this.A)), 0],
      [0, 0, 1]
    ])

    this.projection = new Matrix([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ])
    // this.projection = new Matrix([[0.5, 0.2, 0.2], [0.2, 0.5, 0.2], [0.2, 0.2, 0.5]])
    // this.projection = new Matrix([
    //   [0.5, 0, 0.5],
    //   [0, 0.5, 0.5],
    //   [0, 0, 1]
    // ])
  }

  rotate_point(P) {
    let p = new Matrix([P]).transpose()
    p = this.rotateX.mult(p)
    p = this.rotateY.mult(p)
    p = this.rotateZ.mult(p)
    p = this.projection.mult(p)
    p.mult_by(this.L)
    p = p.sum(new Matrix([[this.x, this.y, this.z]]).transpose())
    return p
  }

  draw() {
    this.rotate()
    this.draw_rotation()
    this.draw_coordinates()

    this.A += this.vA
    this.A = this.A % 360

    // draw_text(this.ctx, "A " + Math.round(this.A), 5, 60, 10, "white")
  }

  draw_rotation() {
    let points = []

    points = points.concat(this.random_points)

    let rotated = []
    for (let i = 0; i < points.length; i++) {
      rotated.push(this.rotate_point(points[i]))
    }
    for (let i = 0; i < rotated.length; i++) {
      draw_circle(this.ctx, points[i].data[0], points[i].data[1], 5, "red", true)
    }
  }

  draw_coordinates() {
    let points_coord = [
      [0, 0, 0],
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ]
    let projection_coord = []
    for (let i = 0; i < points_coord.length; i++) {
      let p = new Matrix([points_coord[i]]).transpose()
      p = this.projection.mult(p)
      p.mult_by(50)
      p = p.sum(new Matrix([[this.x, this.y, 0]]).transpose())
      projection_coord.push(p)
    }
    for (let i = 1; i < projection_coord.length; i++) {
      draw_line(this.ctx, projection_coord[0].data, projection_coord[i].data, "blue", 1)
    }
    draw_circle(this.ctx, projection_coord[0].data[0], projection_coord[0].data[1], 5, "blue", true)
  }

  draw_contour(points, from, to, color="blue", w=3, filled=false) {
    let points_list = []
    for (let i = from; i < to; i++) {
      points_list.push(points[i].data)
    }
    draw_contours(this.ctx, points_list, color, w, filled)
  }
}


class Cube extends Base3D {
  constructor(ctx, l=100) {
    super(ctx)
    this.L = l
  }

  draw_rotation() {
    let points = [
      [-0.5, -0.5, -0.5],
      [0.5, -0.5, -0.5],
      [0.5, 0.5, -0.5],
      [-0.5, 0.5, -0.5],
      [-0.5, -0.5, 0.5],
      [0.5, -0.5, 0.5],
      [0.5, 0.5, 0.5],
      [-0.5, 0.5, 0.5],
    ]

    // points = points.concat(this.random_points)

    let rotated = []
    for (let i = 0; i < points.length; i++) {
      rotated.push(this.rotate_point(points[i]))
    }

    for (let i = 0; i < 4; i++) {
      draw_line(this.ctx, rotated[i].data, rotated[(i + 1) % 4].data, "green", 2)
      draw_line(this.ctx, rotated[i + 4].data, rotated[((i + 1) % 4) + 4].data, "green", 2)
      draw_line(this.ctx, rotated[i].data, rotated[i + 4].data, "green", 2)
    }

    for (let i = 0; i < rotated.length; i++) {
      draw_circle(this.ctx, rotated[i].data[0], rotated[i].data[1], 3, "red", true)
    }
  }
}


class Cylinder extends Base3D {
  constructor(ctx, l=100, r=1.0, s=12) {
    super(ctx)
    this.L = l
    this.R = r
    this.S = s
    this.step = 360 / this.S
  }

  draw_rotation() {
    let points = []
    for (let a = 0; a < 360; a += this.step) {
      points.push([this.R * Math.sin(to_radians(a)), this.R * Math.cos(to_radians(a)), 1.0])
    }
    for (let a = 0; a < 360; a += this.step) {
      points.push([this.R * Math.sin(to_radians(a)), this.R * Math.cos(to_radians(a)), -1.0])
    }

    let rotated = []
    for (let i = 0; i < points.length; i++) {
      rotated.push(this.rotate_point(points[i]))
    }

    for (let i = 0; i < points.length / 2; i++) {
      draw_line(this.ctx, rotated[i].data, rotated[i + points.length / 2].data, "green", 2)
    }

    // for (let i = 0; i < points.length / 2 - 1; i++) {
    //   draw_line(this.ctx, rotated[i].data, rotated[i + 1].data, "green", 2)
    //   draw_line(this.ctx, rotated[i + points.length / 2].data, rotated[i + points.length / 2 + 1].data, "green", 2)
    // }
    // draw_line(this.ctx, rotated[0].data, rotated[points.length / 2 - 1].data, "green", 2)
    // draw_line(this.ctx, rotated[points.length / 2].data, rotated[points.length - 1].data, "green", 2)

    this.draw_contour(rotated, 0, rotated.length / 2, "blue", 1, true)
    this.draw_contour(rotated, rotated.length / 2, rotated.length, "orange", 1, true)

    for (let i = 0; i < rotated.length; i++) {
      draw_circle(this.ctx, rotated[i].data[0], rotated[i].data[1], 3, "red", true)
    }
  }
}


class Sphere extends Base3D {
  constructor(ctx, r=50, s=12) {
    super(ctx)
    this.L = r
    this.S = s
    this.step = 360 / this.S
  }

  draw_rotation() {
    let points = []

    for (let phi = 0; phi < 360; phi += this.step) {
      for (let theta = 0; theta < 360; theta += this.step) {
        const x = Math.sin(to_radians(phi)) * Math.cos(to_radians(theta))
        const y = Math.sin(to_radians(phi)) * Math.sin(to_radians(theta))
        const z = Math.cos(to_radians(phi))
        points.push([x, y, z])
      }
    }

    let rotated = []
    for (let i = 0; i < points.length; i++) {
      rotated.push(this.rotate_point(points[i]))
    }

    for (let i = 0; i < rotated.length; i++) {
      draw_circle(this.ctx, rotated[i].data[0], rotated[i].data[1], 2, "red", true)
    }
  }
}


class Pyramid extends Base3D {
  constructor(ctx, h=50) {
    super(ctx)
    this.L = h
  }

  draw_rotation() {
    let points = [
      [0, 0, 0.5],
      [  0, -0.5, -0.5],
      [-0.4, 0.2, -0.5],
      [ 0.4, 0.2, -0.5]
    ]

    let rotated = []
    for (let i = 0; i < points.length; i++) {
      rotated.push(this.rotate_point(points[i]))
    }

    draw_line(this.ctx, rotated[0].data, rotated[1].data, "green", 2)
    draw_line(this.ctx, rotated[0].data, rotated[2].data, "green", 2)
    draw_line(this.ctx, rotated[0].data, rotated[3].data, "green", 2)

    // this.draw_contour(rotated, 0, rotated.length - 1, "blue", 2, true)
    this.draw_contour(rotated, 1, rotated.length, "green", 2, true)

    for (let i = 0; i < rotated.length; i++) {
      draw_circle(this.ctx, rotated[i].data[0], rotated[i].data[1], 3, "red", true)
    }
  }
}


class Cone extends Base3D {
  constructor(ctx, l=100, r=1.0, s=12) {
    super(ctx)
    this.L = l
    this.R = r
    this.S = s
    this.step = 360 / this.S
  }

  draw_rotation() {
    let points = []
    for (let z = 1.0; z >= 0.0; z -= 0.2) {
      for (let a = 0; a < 360; a += this.step) {
        points.push([z * this.R * Math.sin(to_radians(a)), z * this.R * Math.cos(to_radians(a)), z])
      }
    }

    let rotated = []
    for (let i = 0; i < points.length; i++) {
      rotated.push(this.rotate_point(points[i]))
    }

    for (let i = 0; i < rotated.length - 1; i++) {
      draw_line(this.ctx, rotated[i].data, rotated[i + 1].data, "red", 2)
    }

    for (let i = 0; i < rotated.length; i++) {
      draw_circle(this.ctx, rotated[i].data[0], rotated[i].data[1], 3, "red", true)
    }

    // this.draw_contour(rotated, 0, this.S, "orange", 1, true)
  }
}


class Spiral extends Base3D {
  constructor(ctx, l=100, r=1.0, s=12, c=5) {
    super(ctx)
    this.L = l
    this.R = r
    this.C = c
    this.S = s
    this.step = 360 / this.S
    this.step_z = 2.0 / (s * c)
  }

  draw_rotation() {
    let points = []
    let z = -1.0
    for (let c = 0; c < this.C; c++) {
      for (let a = 0; a < 360; a += this.step) {
        points.push([this.R * Math.sin(to_radians(a)), this.R * Math.cos(to_radians(a)), z])
        z += this.step_z
      }
    }

    let rotated = []
    for (let i = 0; i < points.length; i++) {
      rotated.push(this.rotate_point(points[i]))
    }

    for (let i = 0; i < rotated.length - 1; i++) {
      draw_line(this.ctx, rotated[i].data, rotated[i + 1].data, "red", 2)
    }

    for (let i = 0; i < rotated.length; i++) {
      draw_circle(this.ctx, rotated[i].data[0], rotated[i].data[1], 3, "red", true)
    }

    // this.draw_contour(rotated, 0, this.S, "orange", 1, true)
  }
}


class SinSpiral extends Base3D {
  constructor(ctx, l=100, r=1.0, s=12, c=30, step_a2=0.03) {
    super(ctx)
    this.L = l
    this.R = r
    this.C = c
    this.S = s
    this.step = 360 / this.S
    this.step_z = 5.0 / (s * c)
    this.step_a2 = step_a2
  }

  draw_rotation() {
    let points = []
    let z = -1.0
    let a2 = 0.0
    for (let c = 0; c < this.C; c++) {
      for (let a = 0; a < 360; a += this.step) {
        let r2 = Math.sin(a2)
        points.push([r2 * this.R * Math.sin(to_radians(a)), r2 * this.R * Math.cos(to_radians(a)), z])
        z += this.step_z
        a2 += this.step_a2
      }
    }

    let rotated = []
    for (let i = 0; i < points.length; i++) {
      rotated.push(this.rotate_point(points[i]))
    }

    for (let i = 0; i < rotated.length - 1; i++) {
      draw_line(this.ctx, rotated[i].data, rotated[i + 1].data, "red", 2)
    }

    for (let i = 0; i < rotated.length; i++) {
      draw_circle(this.ctx, rotated[i].data[0], rotated[i].data[1], 3, "red", true)
    }

    // this.draw_contour(rotated, 0, this.S, "orange", 1, true)
  }
}
