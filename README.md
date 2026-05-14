# metronome

> 日本語のREADMEはこちらです: [README.ja.md](README.ja.md)

A simple, web-based metronome built with the Web Audio API's `AudioWorklet` for precise, low-latency audio scheduling.

## Demo

https://code4fukui.github.io/audioworklet-test/

## Features

- **Precise Timing**: Uses the `AudioWorklet` API to run audio processing on a separate thread, preventing clicks and stuttering from main thread load.
- **Adjustable Controls**: Easily change the tempo (BPM) and master volume using UI sliders.
- **Multiple Samples**: Supports loading multiple `.wav` files to play different sounds (e.g., a primary click and a bell for the downbeat).
- **Device Selection**: Allows you to choose your preferred audio output device.

## How It Works

This project demonstrates a robust method for scheduling audio with high precision in the browser.

1.  The main thread handles the UI and loads the `.wav` audio samples.
2.  An `AudioWorkletNode` (`SamplesNode`) is created, which runs a custom `SamplesProcessor` on a dedicated, high-priority audio thread.
3.  Audio samples and playback parameters (like tempo changes from the slider) are sent from the main thread to the worklet via `port.postMessage`.
4.  The `SamplesProcessor`'s `process()` method is called by the audio engine to fill the next audio buffer. It calculates the sound wave in real-time, ensuring the metronome's timing is consistent and unaffected by UI updates or other main-thread tasks.

## Usage

1.  Open the [demo page](https://code4fukui.github.io/audioworklet-test/).
2.  (Optional) Select your desired audio output device from the dropdown menu.
3.  Adjust the **VOL** and **TEMPO** sliders to your preference. The default tempo is 120 BPM.
4.  Click the `START` button to begin playback.
5.  Click the `STOP` button to end playback.

## Requirements

- A modern web browser that supports the `AudioWorklet` API (e.g., Chrome 77+, Edge 79+, Firefox 76+).

## License

MIT License — see [LICENSE](LICENSE).