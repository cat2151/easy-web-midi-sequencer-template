import "./seq.js";

import { initSynthPoly } from "./poly.js";
initSynthPoly(postmateMidi);

postmateMidi.registerParent(/*child=*/'./child.html', 'textarea');
