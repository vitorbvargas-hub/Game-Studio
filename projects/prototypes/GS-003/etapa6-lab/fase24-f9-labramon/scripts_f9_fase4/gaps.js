'use strict';
// node gaps.js file|dir ... — conta pixels claros (não escuros) encostados em transparência (falha de contorno)
const L = require('./lib.js'), G = require('./rig.js'), fs = require('fs');
for (const a of process.argv.slice(2)) { const files = fs.statSync(a).isDirectory() ? L.frames(a) : [a]; const out = [];
  for (const f of files) { const img = L.readPNG(f); let n = 0; for (let y = 0; y < 60; y++) for (let x = 0; x < 60; x++) { const h = G.at(img, x, y); if (!h || G.isDark(h)) continue; if (!G.at(img, x + 1, y) || !G.at(img, x - 1, y) || !G.at(img, x, y + 1) || !G.at(img, x, y - 1)) n++; } out.push(n); }
  console.log(a, out.join(' ')); }
