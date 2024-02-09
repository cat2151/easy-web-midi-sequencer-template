import { postmateMidi } from "./postmate-midi.js";
import { kb } from "./keyboard.js";
postmateMidi.registerChild(null, null, null, null, null);
postmateMidi.seq.registerSeq(kb);
postmateMidi.ui.registerPlayButton('button', kb.initOnStartPlaying, /*isRemovePlayButtonAtTonejsStartRunning=*/true); // iPadではplayボタン経由でTone.js startしないと音が鳴らないことがあるようなので

import { initSynth } from "./synth-poly.js";
initSynth(postmateMidi.tonejs, {oscillator: {type: 'triangle'}});

console.log(`postmate-midi child:`);
console.log(postmateMidi);
