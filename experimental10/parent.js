import { postmateMidi } from "./postmate-midi.js";
import { seq as sq } from "./seq.js";
postmateMidi.registerParent(/*child=*/'./child.html', '#textarea', sq.startPlayJson, 'select', sq.getTemplates, sq.setupByData);
postmateMidi.seq.registerSeq(sq);
postmateMidi.ui.registerPlayButton('button', sq.togglePlay);

import { initSynth } from "./synth-poly.js";
initSynth(postmateMidi.tonejs, {oscillator: {type: 'sawtooth'}});

console.log(`postmate-midi parent:`, postmateMidi);
