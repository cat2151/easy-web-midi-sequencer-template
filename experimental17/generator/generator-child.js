import { postmateMidi } from "../postmate-midi.js";
import { initGenerator } from "./generator.js";
if (!new URL(window.location.href).searchParams.get('query')) window.location.href = "../"; // dir階層直叩きした場合の混乱防止用
const urlParams = rison2.parse(new URL(window.location.href).searchParams.get('query'));

postmateMidi.registerChild(urlParams, null, null, null, null, null);
// TODO 構造を見直す。現在未使用。
postmateMidi.tonejs.wav = initGenerator();

// TODO generateした波形をvisualizationする。postmateMidiのvisualizationを参考にする想定。

console.log(`postmate-midi child:`, postmateMidi);
