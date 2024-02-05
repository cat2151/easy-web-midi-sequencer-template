// usage : parent.js / child.js を参照ください
const postmateMidi = { parent: null, child: null,
  ui: { registerPlayButton: null },
  seq: { registerSeq: null }, // register時、seqそのものが外部sqに上書きされる
  tonejs: { synth: null, initBaseTimeStampAudioContext: null, baseTimeStampAudioContext: 0, controlChange: [] } };

postmateMidi.registerParent = function(url, textareaSelector, textareaSeqFnc, textareaTemplateDropDownListSelector, textareaTemplatesFnc, setupSeqByTextareaFnc) {
  const ui = postmateMidi.ui;

  const handshake = new Postmate({
    url
  });

  handshake.then(child => {
    console.log('parent : handshake is complete');
    child.call('onCompleteHandshakeParent', '"Hello, World!" by parent');

    child.get('height')
    .then(height => child.frame.style.height = `${height * 1.5}px`);
      // ↑ 見切れる。原因不明。取り急ぎ height * 1.5 した

    // Listen to a particular event from the child
    child.on('onCompleteHandshakeChild', data => {
      console.log(`parent : onCompleteHandshakeChild : received data : [${data}]`);
    });
    child.on('onChangeChildTextarea', data => {
      console.log(`parent : onChangeChildTextarea : received data : [${data}]`);
      ui.textarea.value = data;
    });
    child.on('onStartPlaying', data => {
      onStartPlaying(data);
    });
    child.on('onmidimessage', data => {
      onmidimessage(data);
    });

    // childとの双方向通信のtest用
    if (textareaSelector) {
      ui.textarea = document.querySelector(textareaSelector);
      ui.textarea.addEventListener("input", onChangeTextarea);
      if (textareaTemplateDropDownListSelector) {
        setupDropDownListForTextareaTemplate(textareaTemplateDropDownListSelector, textareaTemplatesFnc, onChangeTextarea, setupSeqByTextareaFnc);
      }

      function onChangeTextarea() {
        if (textareaSeqFnc) {
          textareaSeqFnc(ui.textarea.value);
        } else {
          console.log(`parent : onChangeTextarea : call data : [${ui.textarea.value}]`);
          child.call('onChangeParentTextarea', ui.textarea.value);
        }
      }
    }

    postmateMidi.child = child;
  });
}

postmateMidi.registerChild = function(textareaSelector, textareaSeqFnc, textareaTemplateDropDownListSelector, textareaTemplatesFnc, setupSeqByTextareaFnc) {
  const ui = postmateMidi.ui;

  const handshake = new Postmate.Model({
    // Expose your model to the Parent. Property values may be functions, promises, or regular values
    height: () => document.height || document.body.offsetHeight,
    onCompleteHandshakeParent,
    onChangeParentTextarea,
    onStartPlaying,
    onmidimessage
  });

  handshake.then(parent => {
    console.log('child : handshake is complete');
    parent.emit('onCompleteHandshakeChild', '"Hello, World!" by child');

    // parentとの双方向通信のtest用
    if (textareaSelector) {
      ui.textarea = document.querySelector(textareaSelector);
      ui.textarea.addEventListener("input", onChangeTextarea);
      if (textareaTemplateDropDownListSelector) {
        setupDropDownListForTextareaTemplate(textareaTemplateDropDownListSelector, textareaTemplatesFnc, onChangeTextarea, setupSeqByTextareaFnc);
      }

      function onChangeTextarea() {
        if (textareaSeqFnc) {
          textareaSeqFnc(ui.textarea.value);
        } else {
          console.log(`child : onChangeTextarea : emit data : [${ui.textarea.value}]`);
          parent.emit('onChangeChildTextarea', ui.textarea.value);
        }
      }
    }

    postmateMidi.parent = parent;
  });

  // parentからcallされる
  function onCompleteHandshakeParent(data) {
    console.log(`child : onCompleteHandshakeParent : received data : [${data}]`);
  }
  function onChangeParentTextarea(data) {
    console.log(`child : onChangeParentTextarea : received data : [${data}]`);
    ui.textarea.value = data;
  }
}

function isParent() {
  return Boolean(postmateMidi.child); // childを持っているならparent。code中に if (postmateMidi.child) があると、isChildの意味と混同してミスしたので、防止用にisを用意した。
}
function isChild() {
  return Boolean(postmateMidi.parent); // parentを持っているならchild
}

function getParentOrChild() { // for debug
  if (isParent()) return 'parent';
  if (isChild()) return 'child';
}

////////
// UI
postmateMidi.ui.registerPlayButton = function(buttonSelector, playButtonFnc) {
  const ui = postmateMidi.ui;
  ui.button = document.querySelector(buttonSelector);
  ui.button.onclick = function() {
    postmateMidi.tonejs.initTonejsByUserAction();
    playButtonFnc();
  };
}

function setupDropDownListForTextareaTemplate(textareaTemplateDropDownListSelector, textareaTemplatesFnc, onChangeTextarea, setupSeqByTextareaFnc) {
  const ui = postmateMidi.ui;
  ui.select = document.querySelector(textareaTemplateDropDownListSelector);
  ui.select.addEventListener('change', onChangeSelect);
  for (const t of textareaTemplatesFnc()) {
    addOptionToSelect(t[1], t[0]);
  }
  ui.options = document.querySelectorAll(textareaTemplateDropDownListSelector + " option");
  ui.textarea.value = ui.options[1].value;  // playボタンですぐ音を鳴らす用
  setupSeqByTextareaFnc(ui.textarea.value); // 〃

  function onChangeSelect() {
    ui.textarea.value = ui.options[ui.select.selectedIndex].value;
    onChangeTextarea();
  }

  function addOptionToSelect(value, text) {
    const opt = document.createElement("option");
    opt.value = removeIndent(value);
    opt.text = text;
    ui.select.add(opt);

    function removeIndent(rawString) {
      const lines = rawString.split('\n');
      const trimmedLines = lines.map(line => line.trim());
      return trimmedLines.join('\n');
    }
  }
}

//////////
// MIDI
postmateMidi.seq.registerSeq = (sq) => {
  postmateMidi.seq = sq;
  postmateMidi.seq.sendMidiMessage = sendMidiMessage;       // 外部sq側から使う用
  postmateMidi.seq.initOnStartPlaying = initOnStartPlaying; // 〃
}

function initOnStartPlaying() {
  // seqから呼ばれ、synth側のbaseTimeStampを更新する用
  if (isParent()) {
    postmateMidi.child.call('onStartPlaying');
  }
  if (isChild()) {
    postmateMidi.parent.emit('onStartPlaying');
  }
}

function onStartPlaying(data) {
  // parentからchild、childからparentへ、相手のbaseTimeStampを更新させる用に呼ばれる
  postmateMidi.tonejs.initTonejsByUserAction();
  postmateMidi.tonejs.initBaseTimeStampAudioContext();
}

function sendMidiMessage(events, playTime) {
  if (isParent()) {
    postmateMidi.child.call('onmidimessage', [events, playTime]);
    return;
  }
  if (isChild()) {
    postmateMidi.parent.emit('onmidimessage', [events, playTime]);
    return;
  }
}

const ofsMsec = 50; // seq側の送信タイミングのジッタを、synth側の発音時刻指定で吸収する用。timestampが過去にならない程度の値とした。過去になると発音やenvelopeが異常となる想定。手元では50msecがそこそこ安定した感触。今後は環境ごとに指定可能にする想定。その場合は「レイテンシなし（ジッタがある）」も選べる想定。
function onmidimessage(data) {
  const events = data[0];
  const playTimeMsec = data[1];
  const baseMsec = postmateMidi.tonejs.baseTimeStampAudioContext * 1000;
  const timestamp = (baseMsec + playTimeMsec + ofsMsec) / 1000;
  // console.log(`synth: ${getMidiEventName(events[0][0])} ${Math.floor((timestamp - Tone.now()) * 1000)}`); // ofsMsecのチューニング用
  // if (timestamp - Tone.now() < 0) alert(); // timestampが過去になっていないことをチェック
  for (const event of events) {
    switch (event[0]) {
    // note on
    case 0x90: postmateMidi.tonejs.noteOn(event[1], timestamp); break;
    // note off
    case 0x80: postmateMidi.tonejs.noteOff(event[1], timestamp); break;
    // control change
    case 0xB0: postmateMidi.tonejs.controlChange[event[1]](event[2]); break;
    }
  }
};

function getMidiEventName(i) { // for debug
  switch (i) {
  case 0x90: return 'noteOn';
  case 0x80: return 'noteOff';
  case 0xB0: return 'ControlChange';
  }
}

/////////////////
// Tone.js utils
// 用途、各種Tone.js系synth js（以下synth js）のコードのうち共通部分をここに集約することで、synth jsの実装をシンプルにする。
//  必要に応じてsynth js側でそれらを上書きしてよい。
//  注意、ただしnote onと、セットとなるnote offだけは、synth js側で実装必須とする。そうしないとsynth jsソースだけ見たとき鳴らし方がわからず、ソースが読みづらいため。
postmateMidi.tonejs.initTonejsByUserAction = () => {
  // if (Tone.context.state === "running") return; // ここでは用途にマッチしない。LiveServerのライブリロード後は常時runningになるため。
  if (postmateMidi.tonejs.isStartTone) return;

  async () => {
    await Tone.start();
  }

  // 以降の発音を可能にする用のダミー。ないと音が鳴らないことがあった。
  const synth = postmateMidi.tonejs.synth;
  synth.triggerAttack(Tone.Midi(69).toFrequency(), 0, 0);
  synth.triggerRelease(Tone.Midi(69).toFrequency());

  postmateMidi.tonejs.isStartTone = true;
}

postmateMidi.tonejs.initBaseTimeStampAudioContext = () => {
  // Bassのヨレ、和音の構成音ごとの発音タイミングズレ、を防止するため、seq側は演奏予定時刻を指定してpostmate-midiにわたす。postmate-midiはそれを加工してTone.jsにわたす。
  //  流れは：
  //   postmateMidiが受信したmidimessageは：
  //     playTimeが付与されている。
  //   postmateMidiの処理は：
  //     受信したらすぐTone.jsをtriggerする。
  //       このとき、演奏予定timestampをわたす。
  //       演奏予定timestampは：
  //         playTimeと、synth側pageのbaseTimeStampAudioContext（seq側pageのbaseTimeStampAudioContextとは別）から算出する。
  //          このとき50msec程度の猶予をもたせることで、seq側のテンポのヨレを吸収して、Tone.js側は正確なタイミングで発音できる。
  postmateMidi.tonejs.baseTimeStampAudioContext = Tone.now(); // 注意、performance.now() と混同しないこと。違う値となることを確認した。Tone.jsのtriggerに使うのでTone.now()のほうを使う。
}

postmateMidi.tonejs.noteOn = function(noteNum) {
  alert("noteOnを実装してください");
}

postmateMidi.tonejs.noteOff = function(noteNum) {
  alert("noteOffを実装してください");
}

for (let i = 0; i < 128; i++) {
  postmateMidi.tonejs.controlChange[i] = (controller, v) => {}; // noteOnと違って実装を省略可。noteOnのように上書き可。
}

postmateMidi.tonejs.controlChange[0x78] = (controller, v) => {
  allSoundOff();
  function allSoundOff() {
    const synth = postmateMidi.tonejs.synth;
    for (let noteNum = 0; noteNum < 128; noteNum++) {
      for (let i = 0; i < 4; i++) {
        synth.triggerRelease(Tone.Midi(noteNum).toFrequency(), /*time=*/0); // 時刻0が過去だからか、すぐ消音される
      }
    }
  }
};

postmateMidi.tonejs.controlChange[0x7B] = (controller, v) => {
  allNoteOff();
  function allNoteOff() {
    const synth = postmateMidi.tonejs.synth;
    // PolySynthは明示的にnoteNumの指定をしないとエラーになった。また、タイミング次第では1回で不足のことがあったので、ひとまず4回noteOffとした。
    for (let noteNum = 0; noteNum < 128; noteNum++) {
      for (let i = 0; i < 4; i++) {
        synth.triggerRelease(Tone.Midi(noteNum).toFrequency());
      }
    }
  }
};

////////////////////
export { postmateMidi };
