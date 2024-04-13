/*
 * Misho Georgiev game project
 *
 * 2022 Softel Labs
 *
*/


class AudioMic extends Game {
  constructor(canvas, w, h) {
    super(canvas, w, h)

    this.mic = new MicrophoneAudio(
      {
        "audio": this.on_audio.bind(this),
        "fft": this.on_fft.bind(this)
      }
    )

    this.buff_audio = []
    this.buff_fft = []

    setTimeout(this.on_fps.bind(this), 1500)
  }

  on_fps() {
    let fps = this.fps_counter.fps
    this.fps_ratio = 120 / fps
  }

  on_audio(buff_arr) {
    this.buff_audio = buff_arr
  }

  on_fft(buff_arr) {
    this.buff_fft = buff_arr
  }

  print_buff(buff_arr, tag) {
    let amin = 1000000000000
    let amax = -1000000000000
    for (let i = 1; i < buff_arr.length; i++) {
      amin = Math.min(amin, buff_arr[i])
      amax = Math.max(amax, buff_arr[i])
    }
    console.log(tag, amin, amax)
  }

  draw_buffer(buff_arr, x_offset, y_offset, ky, color="green", w=2) {
    let kx = (this.W - 2 * x_offset) / buff_arr.length

    draw_line(this.ctx, [x_offset, y_offset], [this.W - x_offset, y_offset], color, w)

    for (let i = 1; i < buff_arr.length; i++) {
      let p1 = [x_offset + kx * (i - 1), y_offset + ky * buff_arr[i - 1]]
      let p2 = [x_offset + kx * i, y_offset + ky * buff_arr[i]]
      draw_line(this.ctx, p1, p2, color, w)
    }

    // if (color == "red") { print_buff(buff_arr, color) }
  }

  draw() {
    this.draw_buffer(this.buff_audio, 10, this.H * 0.4, this.H * 0.4)
    this.draw_buffer(this.buff_fft, 10, this.H * 0.95, -1, "red")

    draw_text(this.ctx, "FPS " + Math.round(this.fps_counter.fps), 5, 40, 10, "white")
  }
}


const query = window.location.search
const params = new URLSearchParams(query)

new AudioMic(
    document.getElementsByTagName('canvas')[0],
    params.get("w") || 1200,
    params.get("h") || 800
).run()
