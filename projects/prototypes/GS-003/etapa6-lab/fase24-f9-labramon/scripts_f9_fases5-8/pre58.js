'use strict';
// F9 Fases 5–8 — passo 1 do pós-processo: recorte para 60x60 no deslocamento medido, remoção de componentes soltos, âncora y=49.
// node pre58.js  (lê raw/<anim>, grava pre/<anim>, log em pre/_log.json)
const L = require('./lib.js'), G = require('./rig.js'), fs = require('fs');
const CFG = {
  'f8-attack-bark': { dx: 6 }, 'f8-hurt': { dx: 2 }, 'f8-ko-fall': { dx: 0 }, 'f8-ko-recover': { dx: 4 }, 'f8-ko-loop': { dx: 4 },
  'f6-stand-to-lie': { dx: 0 }, 'f6-lie-to-sleep': { dx: 2 }, 'f6-sleep-loop': { dx: 2 }, 'f6-sleep-to-wake': { dx: 4 }, 'f6-lie-to-stand': { dx: 0 },
  'f5-happy': { dx: 0 }, 'f5-sad': { dx: 0 }, 'f5-angry': { dx: 0 }, 'f5-scared': { dx: 0 },
  'f7-petting': { dx: 0 }, 'f7-celebrate': { dx: 0, air: [2, 3, 4] },
};
function components(img) {
  const seen = new Uint8Array(3600), out = [];
  for (let y = 0; y < 60; y++) for (let x = 0; x < 60; x++) {
    if (seen[y * 60 + x] || !G.at(img, x, y)) continue;
    const c = [], st = [[x, y]]; seen[y * 60 + x] = 1;
    while (st.length) { const [cx, cy] = st.pop(); c.push([cx, cy]);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx > 59 || ny > 59 || seen[ny * 60 + nx] || !G.at(img, nx, ny)) continue; seen[ny * 60 + nx] = 1; st.push([nx, ny]); } }
    out.push(c);
  }
  return out.sort((a, b) => b.length - a.length);
}
const log = {};
for (const [name, c] of Object.entries(CFG)) {
  log[name] = [];
  L.frames('raw/' + name).forEach((f, i) => {
    const src = L.readPNG(f);
    let img = L.crop(src, c.dx, 0, 60, 60);
    // pixels opacos perdidos no recorte
    const lost = L.measure(src).n - L.measure(img).n;
    const comps = components(img); let removed = 0;
    for (const k of comps.slice(1)) for (const [x, y] of k) { G.set(img, x, y, null); removed++; }
    const m = L.measure(img); let dy = 0;
    if (!(c.air || []).includes(i)) { dy = 49 - m.bbox[3]; if (dy) img = L.shift(img, 0, dy); }
    L.save(`pre/${name}/frame_${String(i).padStart(3, '0')}.png`, img);
    log[name].push({ frame: i, srcSize: [src.width, src.height], cropDx: c.dx, lostByCrop: lost, looseComponents: comps.length - 1, loosePx: removed, anchorDy: dy });
  });
  console.log(name, log[name].map(e => `q${e.frame}:lost${e.lostByCrop}/solto${e.loosePx}/dy${e.anchorDy}`).join(' '));
}
fs.writeFileSync('pre/_log.json', JSON.stringify(log, null, 1));
