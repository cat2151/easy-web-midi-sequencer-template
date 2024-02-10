// 用途 : 簡易仮想MIDIキーボードのtest用
// usage : parent.js / child.js の import "./keyboard.js"; 付近を参照ください
const kb = { mouseNoteNums: [], mouseLastNoteNum: null, keyboardNoteNums: [], keyShift: 0, isTouch: false };

kb.init = (keyShift) => {
  kb.keyShift = keyShift; // parent / child から個別の値を指定して呼び出す用
}

////////////////////////////
// mouse or touch device
const elm = window; // windowの場合は、childの下の空白をpointしても音が鳴る（そこはwindowなので）。bodyやdiv範囲外に出てもmouseupを検知できる（そこはwindowなので）。
//const elm = document.querySelector("#div"); // bodyや#divの場合は、childの下の空白をpointしても音が鳴らない（そこはbodyやdivではないということ）。bodyやdiv範囲外に出るとmouseup等を検知できない（そこはbodyやdivではないということ）。

////////////////////////////////////
// pointer (mouse or touch device)
// シンプル優先で、mousedownやtouchstartでなく、これを使う。 → pointercancelが意図しないタイミングで発生したため、やむなくtouchも併用する。
elm.addEventListener("pointerdown", (ev) => {
  if (kb.isTouch) return; // iPadやAndroidで意図せぬ発音処理をさせない用（タッチ後にタップでmouseイベントが発生してここに到達する）
  const x = Math.floor(ev.clientX);
  console.log("pointerdown", ev, x);
  onmousedownOrTouchStart(x);
});
elm.addEventListener("pointermove", (ev) => {
  if (kb.isTouch) return;
  // console.log("pointermove");
  const x = ev.clientX;
  onmousemoveOrTouchMove(x);
});
elm.addEventListener("pointercancel", (ev) => { // PC Chrome DevTools iPad emulator にて、mouseを少し動かすだけで発生した。これではiPadのtestができない。対策として、touch検出時はtouchを優先して使うようにした。
  if (kb.isTouch) return;
  console.log("pointercancel");
  onmouseupOrTouchEnd();
});
elm.addEventListener("pointerup", (ev) => {
  if (kb.isTouch) return;
  console.log("pointerup");
  onmouseupOrTouchEnd();
});

elm.addEventListener("blur", (ev) => { // ALT+TAB等で発生する
  console.log("blur");
  allNoteOff();
});

///////////////////
// touch device
elm.addEventListener("touchstart", (ev) => {
  kb.isTouch = true;
  const x = Math.floor(ev.changedTouches[0].clientX);
  console.log("touchstart", ev, x);
  onmousedownOrTouchStart(x);
});
elm.addEventListener("touchmove", (ev) => {
  kb.isTouch = true;
  const x = Math.floor(ev.changedTouches[0].clientX);
  // console.log("touchmove", ev, x, window.innerWidth);
  onmousemoveOrTouchMove(x);
});
elm.addEventListener("touchcancel", (ev) => { // ALT+TAB等で発生する
  kb.isTouch = true;
  console.log("touchcancel");
  onmouseupOrTouchEnd();
});
elm.addEventListener("touchend", (ev) => {
  kb.isTouch = true;
  console.log("touchend", ev);
  onmouseupOrTouchEnd();
});

////////////////////
// mouse or touch
function onmousedownOrTouchStart(x) {
  const noteNum = getMouseNoteNum(x);
  if (noteNum == kb.mouseLastNoteNum) return;
  // noteOn(noteNum);
  cc74(noteNum);
  kb.mouseNoteNums.push(noteNum);
  kb.mouseLastNoteNum = noteNum;
}
function onmousemoveOrTouchMove(x) {
  const noteNum = getMouseNoteNum(x);
  if (kb.mouseLastNoteNum == null) return;
  if (noteNum == kb.mouseLastNoteNum) return;
  // noteOff(kb.mouseNoteNums.pop());
  // noteOn(noteNum);
  cc74(noteNum);
  kb.mouseNoteNums.push(noteNum);
  kb.mouseLastNoteNum = noteNum;
}
function onmouseupOrTouchEnd() {
  // while (kb.mouseNoteNums.length) {
    // noteOff(kb.mouseNoteNums.pop());
  // }
  kb.mouseLastNoteNum = null;
}

function getMouseNoteNum(x) {
  return Math.floor(x / window.innerWidth * 128); // 0～128
}

/////////////
// keyboard
onkeydown = (event) => {
  const noteNum = getPenta(getKeyboardNoteNum(event.code));
  console.log("onkeydown", event.code, noteNum)
  if (noteNum < 0) return;
  if (kb.keyboardNoteNums[noteNum]) return;
  kb.keyboardNoteNums[noteNum] = true;
  noteOn(noteNum);
};
onkeyup = (event) => {
  const noteNum = getPenta(getKeyboardNoteNum(event.code));
  console.log("onkeyup", event.code, noteNum)
  if (noteNum < 0) return;
  noteOff(noteNum);
  kb.keyboardNoteNums[noteNum] = false;
};

function getKeyboardNoteNum(key) {
  const i = "ASDFGHJKL".indexOf(key.replace("Key", ""));
  if (i < 0) return i;
  return 60 + i2penta(i);
  function i2penta(i) {
    switch (i) {
      case  0: return  0;
      case  1: return  3;
      case  2: return  5;
      case  3: return  7;
      case  4: return 10;
      case  5: return 12 + 0;
      case  6: return 12 + 3;
      case  7: return 12 + 5;
      case  8: return 12 + 7;
    }
  }
}

////////
// MIDI
function cc74(v) {
  kb.sendMidiMessage([[0xB0, 74, v]]);
}

export { kb };
