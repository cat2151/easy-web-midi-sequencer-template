import { postmateMidi } from "./postmate-midi.js";
import { seq as sq } from "./seq.js";
postmateMidi.registerParent(/*children=*/['./child1.html', './child2.html'], /*midiOutputIds=*/[1], '#textarea', sq.startPlayJson, 'select', sq.getTemplates, sq.setupByData);
postmateMidi.seq.registerSeq(sq);
postmateMidi.ui.registerPlayButton('button', sq.togglePlay);

console.log(`postmate-midi parent:`, postmateMidi);
