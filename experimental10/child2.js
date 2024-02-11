import { postmateMidi } from "./postmate-midi.js";
postmateMidi.registerChild(/*childId=*/2-1, null, null, null, null, null);

import { initSynth } from "./synth-poly.js";
initSynth(postmateMidi.tonejs, {oscillator: {type: 'sawtooth'}});

console.log(`postmate-midi child2:`, postmateMidi);
