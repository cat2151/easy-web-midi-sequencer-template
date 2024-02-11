// 用途 : 簡易仮想Cutoffツマミのtest用
// usage : parent.js / child.js の import "./knob.js"; 付近を参照ください
const kb = { isTouch: false };
const elm = window;

elm.addEventListener("pointerdown", (ev) => {
  if (kb.isTouch) return; // iPadやAndroidで意図せぬ発音処理をさせない用（タッチ後にタップでmouseイベントが発生してここに到達する）
  const x = Math.floor(ev.clientX);
  onmousedownOrTouchStart(x);
});
elm.addEventListener("pointermove", (ev) => {
  if (kb.isTouch) return;
  const x = ev.clientX;
  onmousemoveOrTouchMove(x);
});

elm.addEventListener("touchstart", (ev) => {
  kb.isTouch = true;
  const x = Math.floor(ev.changedTouches[0].clientX);
  onmousedownOrTouchStart(x);
});
elm.addEventListener("touchmove", (ev) => {
  kb.isTouch = true;
  const x = Math.floor(ev.changedTouches[0].clientX);
  onmousemoveOrTouchMove(x);
  ev.preventDefault(); // iPadやAndroidでのスクロールを抑止する用
}, { passive: false }); // iPadやAndroidでのスクロールを抑止する用

function onmousedownOrTouchStart(x) {
  const noteNum = getMouseNoteNum(x);
  cc74(noteNum);
}
function onmousemoveOrTouchMove(x) {
  const noteNum = getMouseNoteNum(x);
  cc74(noteNum);
}

function getMouseNoteNum(x) {
  return Math.floor(x / window.innerWidth * 128); // 0～128
}

/////////////
// keyboard
onkeydown = (event) => {
  const noteNum = getKeyboardNoteNum(event.code);
  cc74(noteNum);
};

function getKeyboardNoteNum(key) {
  const i = "ASDFGHJKL".indexOf(key.replace("Key", ""));
  if (i < 0) return i = 0;
  return 4 + i * 15;
}

////////
// MIDI
function cc74(v) {
  // console.log(`knob : cc74 : ${v}`);
  kb.sendMidiMessage([[0xB0, 74, v]]);
}

export { kb };
