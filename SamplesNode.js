import { WaveFile } from "https://code4fukui.github.io/wavefile-es/index.js";

export const i16_to_f32 = n => (n > 32767 ? n - 65536 : n) / 32768;
export const MAX_SAMPLES = 10000;

export const toSamplesFloat = (data) => {
  const wave = new Float32Array(data.length / 2);
  for (let i = 0; i < wave.length; i++) {
    const n = i * 2;
    wave[i] = i16_to_f32(data[n] + (data[n + 1] << 8));
  }
  return wave;
};

export class SamplesNode extends AudioWorkletNode {
  static async create(context) {
    await context.audioWorklet.addModule("samples-processor.js");
    return new SamplesNode(context);
  }
  constructor(context) {
    super(context, "samples-processor");
    this.vol = 0.1;
    this.id = MAX_SAMPLES;
  }
  setVolume(vol) {
    if (vol == this.vol) return;
    this.vol = vol;
    this.port.postMessage({ vol });
  }
  setSamples(samples) {
    this.port.postMessage({ samples });
  }
  async setWaveFiles(fns) {
    const samples = [];
    for (const fn of fns) {
      const wavebuf = new Uint8Array(await (await fetch(fn)).arrayBuffer());
      const wav = new WaveFile();
      wav.fromBuffer(wavebuf);
      const sample = toSamplesFloat(wav.data.samples);
      samples.push(sample);
    }
    this.setSamples(samples);
  }
  noteOn(nsample, vol = 1.0, pitch = 1.0, pan = 0, tempo = 0) {
    const mes = {
      noteOn: true,
      nsample,
      vol,
      pitch,
      pan,
      tempo,
    };
    this.port.postMessage(mes);
    return nsample >= MAX_SAMPLES ? nsample : this.id++;
  }
};
