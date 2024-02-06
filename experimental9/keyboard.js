// 用途 : 簡易仮想MIDIキーボードのtest用
// usage : parent.js / child.js の import "./keyboard.js"; 付近を参照ください
const kb = { mouseNoteNums: [], mouseLastNoteNum: null, keyboardNoteNums: [], keyShift: 0 };

kb.init = (keyShift) => {
  kb.keyShift = keyShift; // parent / child から個別の値を指定して呼び出す用
}

onmousedown = (event) => {
  const noteNum = getPenta(getMouseNoteNum(event.clientX));
  console.log("down", `x:${event.clientX} y:${event.clientY}`, noteNum)
  if (noteNum == kb.mouseLastNoteNum) return;
  noteOn(noteNum);
  kb.mouseNoteNums.push(noteNum);
  kb.mouseLastNoteNum = noteNum;
};
onmouseup = (event) => {
  console.log("up")
  noteOff(kb.mouseNoteNums.pop());
  kb.mouseLastNoteNum = null;
};
onmousemove = (event) => {
  console.log("move")
  const noteNum = getPenta(getMouseNoteNum(event.clientX));
  if (kb.mouseLastNoteNum == null) return;
  if (noteNum == kb.mouseLastNoteNum) return;
  noteOff(kb.mouseNoteNums.pop());
  noteOn(noteNum);
  kb.mouseNoteNums.push(noteNum);
  kb.mouseLastNoteNum = noteNum;
};

function getMouseNoteNum(x) {
  return 36 + Math.floor(x / window.innerWidth * 48);
}

onkeydown = (event) => {
  const noteNum = getPenta(getKeyboardNoteNum(event.code));
  console.log("down", event.code, noteNum)
  if (kb.keyboardNoteNums[noteNum]) return;
  kb.keyboardNoteNums[noteNum] = true;
  noteOn(noteNum);
};
onkeyup = (event) => {
  const noteNum = getPenta(getKeyboardNoteNum(event.code));
  console.log("up", event.code, noteNum)
  noteOff(noteNum);
  kb.keyboardNoteNums[noteNum] = false;
};

function getKeyboardNoteNum(key) {
  const i = "ASDFGHJKL".indexOf(key.replace("Key", ""));
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

function getPenta(noteNum) {
  const octave = Math.floor(noteNum / 12);
  const semitone = noteNum % 12;
  const result = octave * 12 + semitone2penta(semitone);
  console.log(octave, semitone, result);
  return result;
  function semitone2penta(semitone) {
    // minor penta
    switch (semitone) {
    case  0: return  0;
    case  1: return  0;
    case  2: return  0;
    case  3: return  3;
    case  4: return  3;
    case  5: return  5;
    case  6: return  5;
    case  7: return  7;
    case  8: return  7;
    case  9: return  7;
    case 10: return 10;
    case 11: return 10;
    }
  }
}

function noteOn(noteNum) {
  noteNum += kb.keyShift;
  kb.initOnStartPlaying();
  kb.sendMidiMessage([[0x90, noteNum, 127]]);
}
function noteOff(noteNum) {
  noteNum += kb.keyShift;
  kb.sendMidiMessage([[0x80, noteNum, 127]]);
}

export { kb };
