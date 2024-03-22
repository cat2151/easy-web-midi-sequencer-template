// import * as Tone from 'tone'; // コメントアウトする。index.htmlでTone.jsをsrcする。そうしないとバンドラーを使わない別projectにおいてソースをそのまま利用できず不便だったので。

const gn = { createWav, setupPreRenderer };

function createWav(noteNum = 60, time = 7/*sec メロトロンが最大7秒のワンショット。なお手元環境で演奏開始時のプリレンダリングからsampler add完了まで12msecだった*/) {
  const sampleRate = Tone.context.sampleRate;
  console.log(`generator : sampling rate : ${sampleRate}`);
  const freq = Tone.Midi(noteNum).toFrequency()
  const twoPiFreqPerSampleRate = 2 * Math.PI * freq / sampleRate
  let wav = new Float32Array(sampleRate * time);
  for (let i = 0; i < wav.length; i++) {
    wav[i] = 0.5 * Math.sin(i * twoPiFreqPerSampleRate);
  }
  console.log(`generator : wav : `, wav);
  return wav;
}

function setupPreRenderer(context) {
  const synth = new Tone.PolySynth({ context, volume: -12 }).toDestination();
  synth.set({
    oscillator: {type: "sawtooth"},
    envelope: {attack: 0.8, decay: 0.8}
  });
  synth.triggerAttackRelease(["C4","E4","G4","B4"], 7);
}

export { gn };
