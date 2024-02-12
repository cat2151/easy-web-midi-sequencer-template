import { postmateMidi } from "../postmate-midi.js";
if (!new URL(window.location.href).searchParams.get('query')) window.location.href = "../"; // dir階層直叩きした場合の混乱防止用
const urlParams = rison2.parse(new URL(window.location.href).searchParams.get('query'));
postmateMidi.registerChild(urlParams, null, null, null, null, null);

import { initSynth } from "./synth-poly.js";
for (let ch = 0; ch < 16; ch++) {
  initSynth(postmateMidi.ch[ch], {oscillator: {type: 'triangle'}});
}
initSynth(postmateMidi.ch[1-1], {oscillator: {type: 'square'}});
initSynth(postmateMidi.ch[2-1], {oscillator: {type: 'sawtooth'}});

postmateMidi.ui.visualizeCurrentSound();

console.log(`postmate-midi child2:`, postmateMidi);
