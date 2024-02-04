// usage : parent.js / child.js を参照ください
const postmateMidi = {parent: null, child: null, isParent:null, isChild:null};

postmateMidi.registerParent = function(url, textareaSelector, textareaSeqFnc, textareaTemplateDropDownListSelector, textareaTemplatesFnc, setupSeqByTextareaFnc) {
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
    child.on('onChangeChild', data => {
      console.log(`parent : onChangeChild : received data : [${data}]`);
      textarea.value = data;
    });
    child.on('onmidimessage', data => {
      // console.log(`parent : onmidimessage : received data : [${data}]`);
      postmateMidi.onMidiMessage(/*events=*/data[0], /*time=*/data[1]);
    });
    child.on('onStartPlaying', data => {
      postmateMidi.onStartPlaying(data);
    });

    // childとの双方向通信のtest用
    if (textareaSelector) {
      const textarea = document.querySelector(textareaSelector);
      textarea.addEventListener("input", onChangeTextarea);
      function onChangeTextarea() {
        if (textareaSeqFnc) {
          textareaSeqFnc(textarea.value);
        } else {
          console.log(`parent : onChangeTextarea : call data : [${textarea.value}]`);
          child.call('onChangeParent', textarea.value);
        }
      }

      if (textareaTemplateDropDownListSelector) {
        setupSelect(textareaTemplateDropDownListSelector, textareaTemplatesFnc, onChangeTextarea, setupSeqByTextareaFnc);
      }
    }

    postmateMidi.child = child;
  });
}

postmateMidi.registerChild = function(textareaSelector, textareaSeqFnc, textareaTemplateDropDownListSelector, textareaTemplatesFnc, setupSeqByTextareaFnc) {
  const handshake = new Postmate.Model({
    // Expose your model to the Parent. Property values may be functions, promises, or regular values
    height: () => document.height || document.body.offsetHeight,
    onCompleteHandshakeParent,
    onChangeParent,
    onmidimessage,
    onStartPlaying
  });

  handshake.then(parent => {
    console.log('child : handshake is complete');
    parent.emit('onCompleteHandshakeChild', '"Hello, World!" by child');

    // parentとの双方向通信のtest用
    if (textareaSelector) {
      const textarea = document.querySelector(textareaSelector);
      textarea.addEventListener("input", onChangeTextarea);
      function onChangeTextarea() {
        if (textareaSeqFnc) {
          textareaSeqFnc(textarea.value);
        } else {
          console.log(`child : onChangeTextarea : emit data : [${textarea.value}]`);
          parent.emit('onChangeChild', textarea.value);
        }
      }

      if (textareaTemplateDropDownListSelector) {
        setupSelect(textareaTemplateDropDownListSelector, textareaTemplatesFnc, onChangeTextarea, setupSeqByTextareaFnc);
      }
    }

    postmateMidi.parent = parent;
  });

  // parentからcallされる
  function onCompleteHandshakeParent(data) {
    console.log(`child : onCompleteHandshakeParent : received data : [${data}]`);
  }
  function onChangeParent(data) {
    console.log(`child : onChangeParent : received data : [${data}]`);
    textarea.value = data;
  }
  function onmidimessage(data) {
    // console.log(`child : onmidimessage : received data : [${data}]`);
    postmateMidi.onMidiMessage(/*events=*/data[0], /*time=*/data[1]);
  }
  function onStartPlaying(data) {
    postmateMidi.onStartPlaying(data);
  };
}

postmateMidi.isParent = () => {
  return Boolean(postmateMidi.child); // childを持っているならparent。code中に if (postmateMidi.child) があると、isChildの意味と混同してミスしたので、防止用にisを用意した。
}
postmateMidi.isChild = () => {
  return Boolean(postmateMidi.parent); // parentを持っているならchild
}

////////////////////////////////////////////////
// ドロップダウンリスト textareaのtemplate用
function setupSelect(textareaTemplateDropDownListSelector, textareaTemplatesFnc, onChangeTextarea, setupSeqByTextareaFnc) {
  const select = document.querySelector(textareaTemplateDropDownListSelector);
  select.addEventListener('change', onChangeSelect);
  for (const t of textareaTemplatesFnc()) {
    addOptionToSelect(t[1], t[0]);
  }
  const options = document.querySelectorAll(textareaTemplateDropDownListSelector + " option");
  textarea.value = options[1].value;     // playボタンですぐ音を鳴らす用
  setupSeqByTextareaFnc(textarea.value); // 〃

  function onChangeSelect() {
    textarea.value = options[select.selectedIndex].value;
    onChangeTextarea();
  }

  function addOptionToSelect(value, text) {
    const opt = document.createElement("option");
    opt.value = removeIndent(value);
    opt.text = text;
    select.add(opt);

    function removeIndent(rawString) {
      const lines = rawString.split('\n');
      const trimmedLines = lines.map(line => line.trim());
      return trimmedLines.join('\n');
    }
  }
}

////////////////////
// MIDI
postmateMidi.registerSeq = (seq) => {
  postmateMidi.seq = seq;
  postmateMidi.seq.sendMidiMessage = postmateMidi.sendMidiMessage;
  postmateMidi.seq.initOnStartPlaying = initOnStartPlaying;
}

function initOnStartPlaying() {
  // seqから呼ばれ、synth側のbaseTimeStampを更新する用
  if (postmateMidi.isParent()) {
    postmateMidi.child.call('onStartPlaying');
  }
  if (postmateMidi.isChild()) {
    postmateMidi.parent.emit('onStartPlaying');
  }
}

postmateMidi.onStartPlaying = () => {
  // parentからchild、childからparentへ、相手のbaseTimeStampを更新させる用に呼ばれる
  initTonejsByUserAction();
  initBaseTimeStampAudioContext();
}

function initBaseTimeStampAudioContext() {
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
  if (!postmateMidi.tonejs) {
    postmateMidi.tonejs = {};
  }
  postmateMidi.tonejs.baseTimeStampAudioContext = Tone.now(); // 注意、performance.now() と混同しないこと。違う値となることを確認した。Tone.jsのtriggerに使うのでTone.now()のほうを使う。
}

postmateMidi.sendMidiMessage = (events, playTime) => {
  if (postmateMidi.isParent()) {
    postmateMidi.child.call('onmidimessage', [events, playTime]);
    return;
  }
  if (postmateMidi.isChild()) {
    postmateMidi.parent.emit('onmidimessage', [events, playTime]);
    return;
  }
}

const ofsMsec = 50; // timestampが過去にならない程度の値とした。過去になると発音やenvelopeが異常となる想定。手元では50msecがそこそこ安定した感触。今後は環境ごとに指定可能にする想定。
postmateMidi.onMidiMessage = function (events, playTimeMsec) {
  let baseMsec;
  if (postmateMidi.tonejs) { // consoleにエラーログを出さない用
    baseMsec = postmateMidi.tonejs.baseTimeStampAudioContext * 1000;
  } else {
    baseMsec = Tone.now();
  }
  const timestamp = (baseMsec + playTimeMsec + ofsMsec) / 1000;
  // console.log(`synth: ${getMidiEventName(events[0][0])} ${Math.floor((timestamp - Tone.now()) * 1000)}`); // ofsMsecのチューニング用
  // if (timestamp - Tone.now() < 0) alert(); // timestampが過去になっていないことをチェック
  for (const event of events) {
    switch (event[0]) {
    // note on
    case 0x90: postmateMidi.noteOn(event[1], timestamp); break;
    // note off
    case 0x80: postmateMidi.noteOff(event[1], timestamp); break;
    // control change
    case 0xB0: postmateMidi.controlChange(event[1], event[2]); break;
    }
  }
};

function getParentOrChild() { // for debug
  if (postmateMidi.isParent()) return 'parent';
  if (postmateMidi.isChild()) return 'child';
}

function getMidiEventName(i) { // for debug
  switch (i) {
  case 0x90: return 'noteOn';
  case 0x80: return 'noteOff';
  case 0xB0: return 'ControlChange';
  }
}

////////////////////
// synth by Tone.js
// 用途、各種Tone.js系synth js（以下synth js）のコードのうち共通部分をここに集約することで、synth jsの実装をシンプルにする。
//  必要に応じてsynth js側でそれらを上書きしてよい。
//  注意、ただしnote onと、セットとなるnote offだけは、synth js側で実装必須とする。そうしないとsynth js側単体でnote onできなくなり、わかりづらいため。
postmateMidi.registerTonejsStarter = function(buttonSelector, playButtonFnc) {
  const button = document.querySelector(buttonSelector);
  button.onclick = function() {
    initTonejsByUserAction();
    playButtonFnc();
  };
}
function initTonejsByUserAction() {
  // if (Tone.context.state === "running") return; // ここでは用途にマッチしない。LiveServerのライブリロード後は常時runningになるため。
  if (postmateMidi.isStartTone) return;

  async () => {
    await Tone.start();
  }

  // 以降の発音を可能にする用のダミー。ないと音が鳴らないことがあった。
  postmateMidi.synth.triggerAttack(Tone.Midi(69).toFrequency(), 0, 0);
  postmateMidi.synth.triggerRelease(Tone.Midi(69).toFrequency());

  postmateMidi.isStartTone = true;
}
postmateMidi.noteOn = function(noteNum) {
  alert("noteOnを実装してください");
}
postmateMidi.noteOff = function(noteNum) {
  alert("noteOffを実装してください");
}
postmateMidi.controlChange = function(controller, v) {
  switch (controller) {
  case 0x78: postmateMidi.allSoundOff(); break;
  case 0x7B: postmateMidi.allNoteOff(); break;
  }
}
postmateMidi.allNoteOff = function() {
  // PolySynthは明示的にnoteNumの指定をしないとエラーになった。また、タイミング次第では1回で不足のことがあったので、ひとまず4回noteOffとした。
  for (let noteNum = 0; noteNum < 128; noteNum++) {
    for (let i = 0; i < 4; i++) {
      postmateMidi.synth.triggerRelease(Tone.Midi(noteNum).toFrequency());
    }
  }
}
postmateMidi.allSoundOff = function() {
  for (let noteNum = 0; noteNum < 128; noteNum++) {
    for (let i = 0; i < 4; i++) {
      postmateMidi.synth.triggerRelease(Tone.Midi(noteNum).toFrequency(), /*time=*/0); // 時刻0が過去だからか、すぐ消音される
    }
  }
}

////////////////////
export { postmateMidi };
