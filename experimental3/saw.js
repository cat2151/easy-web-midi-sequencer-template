// 取り急ぎtest用に、コピー元から変更した。詳しくはコピー元とのdiffを参照のこと。

function initSynthSaw(s) {
  const synth = new Tone.Synth({oscillator: {type: 'sawtooth'}});
  const filter = new Tone.Filter({type: "lowpass"});
  const freqEnv = new Tone.FrequencyEnvelope({
    attack: 0,
    decay: 2,
    baseFrequency: Tone.Midi(30).toFrequency(),
    octaves: 4
  });
  const vol = new Tone.Volume(-6);

  synth.connect(filter);
  filter.connect(vol);
  freqEnv.connect(filter.frequency);
  vol.toDestination();

  s.noteOn = noteOn;
  s.noteOff = noteOff;

  function noteOn(noteNum) {
    filter.set({Q: 10 + Math.random() * 10});
    freqEnv.set({decay: 1 + Math.random() * 2});
    freqEnv.set({baseFrequency: Tone.Midi(20 + Math.random() * 40).toFrequency()});
    freqEnv.triggerAttack();

    synth.triggerAttackRelease(Tone.Midi(noteNum).toFrequency(), "8n");
    s.isNoteOn = true;
  };

  function noteOff(noteNum) {
    if (!s.isNoteOn) return;
    synth.triggerRelease();
  };
}

export { initSynthSaw };
