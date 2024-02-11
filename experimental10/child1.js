import { postmateMidi } from "./postmate-midi.js";
import { kb } from "./knob.js";
postmateMidi.registerChild(/*childId=*/1-1, null, null, null, null, null);
postmateMidi.seq.registerSeq(kb);

console.log(`postmate-midi child1:`, postmateMidi);
