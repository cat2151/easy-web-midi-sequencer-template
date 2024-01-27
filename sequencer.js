let easyWebMidiSequencer = {};

easyWebMidiSequencer.init = function(access) {
  const midiOutPortIndex = 0;
  const bpm = 120;
  const beat = 4;
  const midiOut = createMidiOutputs(access)[midiOutPortIndex];
  document.body.innerHTML = `MIDI OUT : [${midiOut.name}]`; // Shared Pianoと違って、この場でMIDI OUTであることを明示とした（当アプリは見た目がINかOUTか一目瞭然ではないので）
  initInterval(bpm, beat);

  function createMidiOutputs(access) {
    let outputs = [];
    const outputIterator = access.outputs.values();
    for (let o = outputIterator.next(); !o.done; o = outputIterator.next()) {
        outputs.push(o.value);
    }
    // console.log(outputs);
    return outputs;
  }
  function initInterval(bpm, beat) {
    let lastClickTimeStamp = performance.now();
    const beatTick = 60 * 1000 / bpm / beat * 4;

    setInterval(() => {
      const now = performance.now();
      for (let nextClickTimeStamp = lastClickTimeStamp + beatTick;
          nextClickTimeStamp < now + 1500;
          nextClickTimeStamp += beatTick) {
        play(nextClickTimeStamp, beatTick);
        lastClickTimeStamp = nextClickTimeStamp;
      }
    }, 1000);
  }
  function play(noteOnTimeStamp, beatTick) {
    const noteNum = [60, 64, 67][Math.floor(Math.random() * 3)];
    const vel = 127;
    const duration = beatTick * 7 / 8;
    noteOn(noteNum, vel, noteOnTimeStamp, duration);
    function noteOn(noteNum, vel, noteOnTimeStamp, duration) {
      midiOut.send([0x90, noteNum, vel], noteOnTimeStamp);
      midiOut.send([0x80, noteNum, vel], noteOnTimeStamp + duration);
    }
  }
}

// Web MIDI API初期化 ～ 演奏開始
navigator.requestMIDIAccess({sysex:false}).then(easyWebMidiSequencer.init);
