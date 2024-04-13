/*
 * Misho Georgiev game project
 *
 * 2022 Softel Labs
 *
*/


class MicrophoneAudio {
  constructor(callbacks_buff, buff_size=16384) {
    this.callbacks_buff = callbacks_buff
    this.buff_size = buff_size

    this.ctx = new AudioContext()

    if (!navigator.getUserMedia) {
      navigator.getUserMedia ||= navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia
    }

    if (navigator.getUserMedia) {
      navigator.getUserMedia(
        {audio:true},
        function(stream) {
          this.start(stream)
        }.bind(this),
        function(e) {
          alert('Error capturing audio.')
        }
      );

    } else { alert('getUserMedia not supported in this browser.') }
  }

  on_audio(event) {
    let channel_buffer = event.inputBuffer.getChannelData(0); // MONO 1st channel
    this.callbacks_buff["audio"](channel_buffer)
  }

  on_audio_fft(event) {
    var array = new Uint8Array(this.analyser_node.frequencyBinCount)
    this.analyser_node.getByteFrequencyData(array)
    if (this.microphone_stream.playbackState == this.microphone_stream.PLAYING_STATE) {
      this.callbacks_buff["fft"](array)
    }
  }

  start(stream) {
    // let gain_node = this.ctx.createGain()
    // gain_node.connect(this.ctx.destination)

    this.microphone_stream = this.ctx.createMediaStreamSource(stream);
    // this.microphone_stream.connect(gain_node);

    let script_processor_node = this.ctx.createScriptProcessor(this.buff_size, 1, 1);
    script_processor_node.onaudioprocess = this.on_audio.bind(this);

    this.microphone_stream.connect(script_processor_node);

    let script_processor_fft_node = this.ctx.createScriptProcessor(2048, 1, 1);
    // script_processor_fft_node.connect(gain_node);

    this.analyser_node = this.ctx.createAnalyser();
    this.analyser_node.smoothingTimeConstant = 0;
    this.analyser_node.fftSize = 2048;

    this.microphone_stream.connect(this.analyser_node);

    this.analyser_node.connect(script_processor_fft_node);

    script_processor_fft_node.onaudioprocess = this.on_audio_fft.bind(this)
  }
}
