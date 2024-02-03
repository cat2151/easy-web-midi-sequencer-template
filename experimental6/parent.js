import { postmateMidi } from "./postmate-midi.js";
postmateMidi.registerTonejsStarter();
postmateMidi.registerParent(/*child=*/'./child.html', 'textarea');

import { seq } from "./seq.js";
postmateMidi.seq = seq;
postmateMidi.seq.sendMidiMessage = postmateMidi.sendMidiMessage;

import { initSynthPoly } from "./poly.js";
initSynthPoly(postmateMidi);
