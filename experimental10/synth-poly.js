// import * as Tone from 'tone'; // コメントアウトする。index.htmlでTone.jsをsrcする。そうしないとバンドラーを使わない別projectにおいてソースをそのまま利用できず不便だったので。

function initSynth(s, synthParam) {
  const synth = new Tone.PolySynth(Tone.Synth, synthParam);
  const filter = new Tone.Filter({type: "lowpass", frequency: 2400});
  const vol = new Tone.Volume(-15);

  synth.connect(filter);
  filter.connect(vol);
  vol.toDestination();

  s.noteOn = noteOn;
  s.noteOff = noteOff;
  s.synth = synth;
  s.controlChange[74] = cutoff;

  function noteOn(noteNum, timestamp) {
    synth.triggerAttack(Tone.Midi(noteNum).toFrequency(), timestamp);
  };

  function noteOff(noteNum, timestamp) {
    synth.triggerRelease(Tone.Midi(noteNum).toFrequency(), timestamp);
  };

  function cutoff(v) {
    v *= 40; // 0～5120Hz
    filter.set({frequency: v});
  };
}

export { initSynth };
