import { postmateMidi } from "./postmate-midi.js";
import { kb } from "./keyboard.js";
/*sleep*/await new Promise(resolve => setTimeout(resolve, 500)); // child1より遅らせる。でないとhandshakeに失敗することがある。400msecでは失敗することがあった（child2がcompleteをrecvしなかった）
postmateMidi.registerChild(/*childId=*/2-1, null, null, null, null, null);
postmateMidi.seq.registerSeq(kb);

import { initSynth } from "./synth-poly.js";
initSynth(postmateMidi.tonejs, {oscillator: {type: 'triangle'}});

console.log(`postmate-midi child2:`, postmateMidi);
