// Generates every Gabumon-hand64 frame deterministically (no AI, no PixelLab).
// idle: breathing bob + ear/tail sway (feet planted -> frame 0 is literally "feet together, at rest").
// walk: alternating leg swing with a lift-on-swing / flat-on-stance foot curve, body bob timed to footfalls.
'use strict';
const g = require('./gabumon.js');
const fs = require('fs');
const path = require('path');
function savePNG(p, canvas) { fs.writeFileSync(p, canvas.toPNG()); }

const OUT = path.join(__dirname, '..', 'frames');
for (const d of ['idle-s', 'walk-s', 'idle-sw', 'walk-sw']) {
  fs.mkdirSync(path.join(OUT, d), { recursive: true });
}

function idlePose(i, n) {
  const phase = (i / n) * Math.PI * 2;
  return {
    bodyBob: +(1.2 * Math.sin(phase)).toFixed(2),
    earSway: +(1.5 * Math.sin(phase + 0.6)).toFixed(2),
    tailSway: +(1.5 * Math.sin(phase + 1.2)).toFixed(2),
    legL: { lift: 0, fwd: 0 },
    legR: { lift: 0, fwd: 0 },
    blink: false,
  };
}

function walkPose(i, n) {
  const phase = (i / n) * Math.PI * 2;
  const phaseR = phase + Math.PI;
  const fwdL = 3 * Math.cos(phase);
  const fwdR = 3 * Math.cos(phaseR);
  const liftL = Math.max(0, Math.sin(phase)) * 2.2;
  const liftR = Math.max(0, Math.sin(phaseR)) * 2.2;
  const bob = -Math.abs(Math.sin(phase * 2)) * 1.1;
  return {
    bodyBob: +bob.toFixed(2),
    earSway: +(0.8 * Math.sin(phase)).toFixed(2),
    tailSway: +(1.2 * Math.sin(phase + 0.8)).toFixed(2),
    legL: { lift: +liftL.toFixed(2), fwd: +fwdL.toFixed(2) },
    legR: { lift: +liftR.toFixed(2), fwd: +fwdR.toFixed(2) },
    blink: false,
  };
}

const IDLE_N = 6, WALK_N = 8;
const manifest = { idle: { S: [], SW: [] }, walk: { S: [], SW: [] } };

for (let i = 0; i < IDLE_N; i++) {
  const pose = idlePose(i, IDLE_N);
  const s = g.renderSouth(pose);
  const sw = g.renderSW(pose);
  const nameS = `idle-s/frame_${String(i).padStart(3, '0')}.png`;
  const nameSW = `idle-sw/frame_${String(i).padStart(3, '0')}.png`;
  savePNG(path.join(OUT, nameS), s);
  savePNG(path.join(OUT, nameSW), sw);
  manifest.idle.S.push({ file: nameS, pose });
  manifest.idle.SW.push({ file: nameSW, pose });
}

for (let i = 0; i < WALK_N; i++) {
  const pose = walkPose(i, WALK_N);
  const s = g.renderSouth(pose);
  const sw = g.renderSW(pose);
  const nameS = `walk-s/frame_${String(i).padStart(3, '0')}.png`;
  const nameSW = `walk-sw/frame_${String(i).padStart(3, '0')}.png`;
  savePNG(path.join(OUT, nameS), s);
  savePNG(path.join(OUT, nameSW), sw);
  manifest.walk.S.push({ file: nameS, pose });
  manifest.walk.SW.push({ file: nameSW, pose });
}

fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('generated', IDLE_N, 'idle frames x2 dirs +', WALK_N, 'walk frames x2 dirs');
