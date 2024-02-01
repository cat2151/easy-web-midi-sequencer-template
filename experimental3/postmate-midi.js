const postmateMidi = {};

postmateMidi.registerParent = function(url) {
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
      console.log(`parent : onmidimessage : received data : [${data}]`);
      postmateMidi.onMidiMessage(new Uint8Array([0x90, 48 - (data.length % 2) * 12, 127]));
    });

    // childとの双方向通信のtest用
    let textarea = document.querySelector("#textarea");
    textarea.addEventListener("input", onChangeTextarea);
    function onChangeTextarea() {
      console.log(`parent : onChangeTextarea : call data : [${textarea.value}]`);
      child.call('onChangeParent', textarea.value);
      child.call('onmidimessage', textarea.value);
    }
  });
}

postmateMidi.registerChild = function() {
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

    textarea.addEventListener("input", onChangeTextarea);
    function onChangeTextarea() {
      console.log(`child : onChangeTextarea : emit data : [${textarea.value}]`);
      parent.emit('onChangeChild', textarea.value);
      parent.emit('onmidimessage', textarea.value);
    }
  });

  // parentとの双方向通信のtest用
  const textarea = document.querySelector("#textarea");

  // parentからcallされる
  function onCompleteHandshakeParent(data) {
    console.log(`child : onCompleteHandshakeParent : received data : [${data}]`);
  }
  function onChangeParent(data) {
    console.log(`child : onChangeParent : received data : [${data}]`);
    textarea.value = data;
  }
  function onmidimessage(data) {
    console.log(`child : onmidimessage : received data : [${data}]`);
    postmateMidi.onMidiMessage(new Uint8Array([0x90, 64 + (data.length % 2) * 7, 127]));
  }
}

postmateMidi.onMidiMessage = function (event) {
  console.log(event);
  switch (event[0]) {
  // note on
  case 0x90:
    postmateMidi.noteOff();
    postmateMidi.noteOn(event[1]);
    break;
  }
};

postmateMidi.registerTonejsStarter = function() {
  const button = document.querySelector('button');
  button.onclick = function() {
    postmateMidi.initTonejsByUserAction();
    postmateMidi.noteOff();
    postmateMidi.noteOn(/*noteNum = */60); // playボタンを押した場合は常に鳴らす。「鳴る」ということをわかりやすくすることを優先する
  };
}
postmateMidi.initTonejsByUserAction = function() {
  // if (Tone.context.state === "running") return; // ここでは用途にマッチしない。LiveServerのライブリロード後は常時runningになるため。
  if (postmateMidi.synth) return;

  async () => {
    await Tone.start();
  }
  postmateMidi.synth = new Tone.Synth().toDestination();
}
postmateMidi.noteOn = function(noteNum) {
  postmateMidi.initTonejsByUserAction();
  postmateMidi.synth.triggerAttackRelease(Tone.Midi(noteNum).toFrequency(), "8n");
}
postmateMidi.noteOff = function() {
}

postmateMidi.registerTonejsStarter();