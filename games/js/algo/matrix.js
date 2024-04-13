/*
 * Misho Georgiev
 *
 * 2023 Softel Labs
 *
*/


class Matrix {
  constructor(data) {
    this.rows = data.length;
    this.cols = data[0].length;
    this.data = data;
  }

  print() {
    let P = "Matrix"
    for (let i = 0; i < this.rows; i++) {
      P += "\r\n"
      for (let j = 0; j < this.cols; j++) {
        P += `${this.data[i][j]} `
      }
    }
    return P
  }

  mult(B) {
    if (this.cols !== B.rows) {
      console.error("Wrong col/rows", this.cols, B.rows)
    }

    const result = new Matrix(new Array(this.rows).fill(0).map(() => new Array(B.cols).fill(0)));
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < B.cols; j++) {
        let sum = 0.0;
        for (let k = 0; k < this.cols; k++) {
          sum += this.data[i][k] * B.data[k][j];
        }
        result.data[i][j] = sum;
      }
    }
    return result;
  }

  sum(B) {
    if (this.cols !== B.cols || this.rows != B.rows) {
      console.error("Wrong col/rows", this.cols, B.rows)
      return
    }

    const result = new Matrix(new Array(this.rows).fill(0).map(() => new Array(this.cols).fill(0)));
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.data[i][j] = this.data[i][j] + B.data[i][j];
      }
    }
    return result;
  }

  mult_by(a) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.data[i][j] *= a
      }
    }
  }
  sum_by(a) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.data[i][j] += a[j]
      }
    }
  }

  transpose() {
    const transposedData = new Array(this.cols).fill(0).map(() => new Array(this.rows).fill(0));
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        transposedData[j][i] = this.data[i][j];
      }
    }
    return new Matrix(transposedData);
  }
}
