import { postmateMidi } from "./postmate-midi.js";
import { kb } from "./knob.js";
postmateMidi.registerChild(/*childId=*/1-1, null, null, null, null, null);
postmateMidi.seq.registerSeq(kb);

import { initSynth } from "./synth-poly.js";
initSynth(postmateMidi.tonejs, {oscillator: {type: 'triangle'}});

console.log(`postmate-midi child1:`, postmateMidi);
