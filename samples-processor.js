export const MAX_SAMPLES = 10000;

class Tone {
  constructor(id, samples, vol = 1, pitch = 1, pan = 0, tempo = 0) {
    this.id = id;
    this.samples = samples;
    this.p = 0;
    this.set(vol, pitch, pan, tempo);
  }
  set(vol = 1, pitch = 1, pan = 0, tempo = 0) {
    this.vol = vol;
    this.pitch = pitch;
    this.pan = pan;
    this.repeatlen = 60 / tempo * sampleRate * pitch;
  }
  tickSample() {
    const n = this.repeatlen ? (this.p % this.repeatlen) >> 0 : this.p >> 0;
    const vol = n < this.samples.length ? this.samples[n] : 0;
    this.p += this.pitch;
    return vol;
  }
  isEnd() {
    return this.repeatlen ? false : this.p >= this.samples.length;
  }
}

class SamplesProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.vol = 0.1;
    this.samples = [];
    this.tones = [];
    this.id = MAX_SAMPLES;
    this.port.onmessage = e => {
      if (e.data.samples) {
        this.samples = e.data.samples;
        return;
      }
      if (e.data.noteOn) {
        const vol = parseFloat(e.data.vol);
        const pitch = parseFloat(e.data.pitch);
        const pan = parseFloat(e.data.pan); // -1: left, 0: center, 1: right
        const tempo = parseFloat(e.data.tempo);
        const nsample = parseInt(e.data.nsample);
        if (nsample < MAX_SAMPLES) {
          const samples = this.samples[nsample];
          const id = this.id++;

          const tone = new Tone(id, samples, vol, pitch, pan, tempo);
          for (let i = 0; i < this.tones.length; i++) {
            if (!this.tones[i]) {
              this.tones[i] = tone;
              return;
            }
          }
          this.tones.push(tone);
        } else {
          const tone = this.tones.find(i => i && i.id == nsample);
          if (tone) tone.set(vol, pitch, pan, tempo);
        }
        return;
      }
      if (e.data.vol) {
        this.vol = e.data.vol;
        return;
      }
    };
  }
  process(inputs, outputs, parameters) {
    //console.log(outputs, parameters); // [Array([Float32Array(128))]
    const output = outputs[0];
    const chlen = output.length;
    const len = output[0].length; // 128 = 2.7msec in 48kHz
    //console.log("chlen", chlen, len); // why chlen == 1?
    if (chlen >= 2) {
      for (let i = 0; i < len; i++) {
        let voll = 0;
        let volr = 0;
        for (const t of this.tones) {
          if (!t) continue;
          const v = t.tickSample();
          voll += v * -(-1 - t.pan) / 2;
          volr += v * (1 + t.pan) / 2;
        }
        output[0][i] = voll * this.vol;
        output[1][i] = volr * this.vol;
      }
    } else {
      for (let i = 0; i < len; i++) {
        let vol = 0;
        for (const t of this.tones) {
          if (!t) continue;
          const v = t.tickSample();
          vol += v;
        }
        output[0][i] = vol * this.vol;
      }
    }
    for (let i = 0; i < this.tones.length; i++) {
      const t = this.tones[i];
      if (!t) continue;
      if (t.isEnd()) {
        this.tones[i] = null;
      }
    }
    return true;
  }
}

registerProcessor("samples-processor", SamplesProcessor);
