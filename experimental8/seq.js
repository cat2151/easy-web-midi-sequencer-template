// 用途 : JSON演奏のtest用
// usage : parent.js / child.js の import "./seq.js"; 付近を参照ください
const BPM = 130;
const TICKS_PER_MEASURE = 192;
const seq = {};

seq.getTemplates = () => {
  return [
    ["テンプレートを選んでください", ``],
    //   event           st   gt
    ["test1", `[
      [ [0x90, 60, 127],   0, 180 ],
      [ [0x90, 64, 127],   0, 180 ],
      [ [0x90, 67, 127],   0, 180 ],
      [ [0x90, 71, 127], 192, 180 ],
      [ [0x90, 62, 127],   0, 180 ],
      [ [0x90, 66, 127],   0, 180 ],
      [ [0x90, 69, 127],   0, 180 ],
      [ [0x90, 73, 127], 192, 180 ]
    ]`],
    ["test2", `[
      [ [0x90, 48, 127], 24,  1 ]
    ]`],
  ];
}

seq.togglePlay = () => {
  seq.isPlaying = !seq.isPlaying;
  if (seq.isPlaying) {
    init();
    seqPlay();
  } else {
    allNoteOff(); // 音の余韻が残る。playボタンの操作感覚としては心地よい
    // init(); // 音がぶつ切りになる。用途次第ではこちらもよいので使い分け想定
  }
}

seq.setupByData = (data) => {
  data = data.replace(/0x[0-9A-Fa-f]+/g, function (match) {
    return parseInt(match, 16);
  });
  seq.json = JSON.parse(data);
}

seq.startPlayJson = (data) => {
  seq.setupByData(data);
  // console.log(seq.json);
  init();
  seq.isPlaying = true;
  seqPlay();
}

function seqPlay() {
  if (!seq.isPlaying) return;

  seq.midiMessagesBuffer = [];
  let time;
  while (!time) {
    time = playStep(); // st0の間はmidiMessageをバッファリングし、まとめてpostmate-midiにsendとした。まだわずかにズレが出ることがあると感じる、今後の課題とする。
  }
  seq.sendMidiMessage(seq.midiMessagesBuffer);
  seq.timeoutIds.push(setTimeout(seqPlay, time));
}

function init() {
  allSoundOff();
  seq.timeOf1st = calcStepTimeMsec(BPM, TICKS_PER_MEASURE);
  seq.baseTime = performance.now();
  seq.playTime = 0;
  seq.index = 0;
  if (seq.timeoutIds) {
    for (const id of seq.timeoutIds) {
      clearTimeout(id); // 再演奏時に、以前のnoteOffのsetTimeoutが残っていて音が消える、のを防止する用。なお発火済みのtimeoutを都度消すのはしていない、シンプル優先。仮に1秒に10要素、1時間で36000要素、問題ないと想定する。
    }
    seq.timeoutIds = [];
  } else {
    seq.timeoutIds = [];
  }
}

function playStep() {
  const arr = seq.json[seq.index][0];
  const event = new Uint8Array(arr);
  // console.log(event);

  const st = seq.json[seq.index][1];
  let time = st ? (procNextTime(seq.timeOf1st * st)) : 0;

  seq.midiMessagesBuffer.push(event);
  if (isNoteOn(event)) {
    setupNoteOff();
    function setupNoteOff() {
      const gt = seq.json[seq.index][2];
      let noteOffTime = st ? (time * gt / st) : (seq.timeOf1st * gt);
      if (noteOffTime < 17) noteOffTime = 17; // gtが短すぎるとき音途切れがあるので、音途切れ防止用
      seq.timeoutIds.push(setTimeout(noteOff, noteOffTime, new Uint8Array(arr)));
      function noteOff(event) {
        event[0] = 0x80;
        seq.sendMidiMessage([event]);
      }
    }
  }

  seq.index = (seq.index + 1) % seq.json.length;
  return time;

  function isNoteOn(event) {
    return event[0] == 0x90;
  }
}

function procNextTime(stepTime) {
  const real = performance.now() - seq.baseTime;
  const diff = real - seq.playTime;
  const time = stepTime - diff;
  // console.log({diff: Math.floor(diff), time: Math.floor(time)});
  seq.playTime += stepTime;
  return time;
}

function calcStepTimeMsec(bpm, beatnote) {
  return 1000 * 60 * 4 / bpm / beatnote;
}

function allNoteOff() {
  seq.sendMidiMessage([new Uint8Array([0xB0, 0x7B, 0])]);
}

function allSoundOff() {
  seq.sendMidiMessage([new Uint8Array([0xB0, 0x78, 0])]);
}

export { seq };
