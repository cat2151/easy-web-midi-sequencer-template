import { postmateMidi } from "./postmate-midi.js";
import { kb } from "./keyboard.js";
postmateMidi.registerParent(/*child=*/'./child.html', null, null, null, null, null);
postmateMidi.seq.registerSeq(kb);
postmateMidi.seq.init(2);

import { initSynth } from "./synth-poly.js";
initSynth(postmateMidi.tonejs, {oscillator: {type: 'sawtooth'}});

console.log(`postmate-midi parent:`);
console.log(postmateMidi);
