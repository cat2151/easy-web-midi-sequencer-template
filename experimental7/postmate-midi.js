// usage : parent.js / child.js を参照ください
const postmateMidi = {};

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
      postmateMidi.onMidiMessage(data);
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
    onmidimessage
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
    postmateMidi.onMidiMessage(data);
  }
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
}

postmateMidi.sendMidiMessage = (event) => {
  if (postmateMidi.child) {
    postmateMidi.child.call('onmidimessage', event);
    return;
  }
  if (postmateMidi.parent) {
    postmateMidi.parent.emit('onmidimessage', event);
    return;
  }
}

postmateMidi.onMidiMessage = function (events) {
  for (const event of events) {
    // console.log(event);
    switch (event[0]) {
    // note on
    case 0x90: postmateMidi.noteOn(event[1]); break;
    // note off
    case 0x80: postmateMidi.noteOff(event[1]); break;
    // control change
    case 0xB0: postmateMidi.controlChange(event[1], event[2]); break;
    }
  }
};

////////////////////
// synth by Tone.js
postmateMidi.registerTonejsStarter = function(buttonSelector, playFnc) {
  const button = document.querySelector(buttonSelector);
  button.onclick = function() {
    postmateMidi.initTonejsByUserAction();
    playFnc();
  };
}
let defaultSynth; // postmateMidiのプロパティにしない。影響範囲を狭くする用。
postmateMidi.initTonejsByUserAction = function() {
  // if (Tone.context.state === "running") return; // ここでは用途にマッチしない。LiveServerのライブリロード後は常時runningになるため。
  if (defaultSynth) return;

  async () => {
    await Tone.start();
  }

  createDefaultSynth();
}
function createDefaultSynth() {
  defaultSynth = new Tone.PolySynth(Tone.Synth, {oscillator: {type: 'sawtooth'}}); // polyとする。poly用のseqを鳴らすときに、monoのsynthだと混乱したので。
  const filter = new Tone.Filter({type: "lowpass", frequency: 2400});
  const vol = new Tone.Volume(-15);

  defaultSynth.connect(filter);
  filter.connect(vol);
  vol.toDestination();
}
postmateMidi.noteOn = function(noteNum) {
  postmateMidi.initTonejsByUserAction();
  defaultSynth.triggerAttack(Tone.Midi(noteNum).toFrequency());
}
postmateMidi.noteOff = function(noteNum) {
  defaultSynth.triggerRelease(Tone.Midi(noteNum).toFrequency());
}
postmateMidi.controlChange = function(controller, v) {
  switch (controller) {
  case 0x7B: postmateMidi.allNoteOff(); break;
  }
}
postmateMidi.allNoteOff = function() {
  // PolySynthは明示的にnoteNumの指定が必要。また、タイミング次第では1回で不足のことがあったので、ひとまず4回noteOffしておく
  for (let noteNum = 0; noteNum < 128; noteNum++) {
    for (let i = 0; i < 4; i++) {
      defaultSynth.triggerRelease(Tone.Midi(noteNum).toFrequency());
    }
  }
}

////////////////////
export { postmateMidi };
