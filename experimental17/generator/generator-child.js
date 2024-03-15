import { postmateMidi } from "../postmate-midi.js";
import { gn } from "./generator.js";
if (!new URL(window.location.href).searchParams.get('query')) window.location.href = "../"; // dir階層直叩きした場合の混乱防止用
const urlParams = rison2.parse(new URL(window.location.href).searchParams.get('query'));

postmateMidi.registerChild(urlParams, null, null, null, null, null);
postmateMidi.tonejs.generator.registerGenerator(gn);

// TODO generateした波形をvisualizationする。postmateMidiのvisualizationを参考にする想定。

console.log(`postmate-midi child:`, postmateMidi);
