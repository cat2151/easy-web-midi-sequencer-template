import { postmateMidi } from "./postmate-midi.js";
import { kb } from "./knob.js";
postmateMidi.registerChild(/*childId=*/2-1, null, null, null, null, null);
postmateMidi.seq.registerSeq(kb);

import { initSynth } from "./synth-poly.js";
initSynth(postmateMidi.tonejs, {oscillator: {type: 'sawtooth'}});

console.log(`postmate-midi child2:`, postmateMidi);
