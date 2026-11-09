'use strict';
// Gigimon -- hand-authored DS-scale MAP sprite (S/N drawn, W drawn, E
// mirrored from W), 3 frames per direction, replacing the Pagumon
// fallback that was shipping under the "Gigimon" name (GS-003 review,
// 2026-11-09). Digimon World DS has no real Gigimon map sheet to rip, so
// this is drawn pixel-by-pixel by a hand-authored character matrix (same
// technique as pilot_model_sheet.js, ADR-009 -- no fillEllipse/fillCircle
// body primitives), not generated from a parametric shape.
//
// Shape and palette are reduced/redrawn by hand FROM the official rip at
// CREATURE-0002/source/Gigimon.gif (E-M-B-E-R preservation of AngelOfHope's
// "With the Will" rip, battle idle; license: official-fan-use, see
// CREATURE-0002/license.json) -- sampled hex values below come directly
// from that PNG's own pixels (round red head-body, swept-back grey-blue
// ear/horn flaps, yellow slit eyes, pale grey belly fringe), scaled down
// to DS In-Training/baby map-sprite density (compare CREATURE-0005 Koromon,
// CREATURE-0003 Guilmon -- same evolution line, Koromon-equivalent stage).
const { Canvas } = require('./canvas.js');

const GP = {
  ink: [0x20, 0x20, 0x20, 255],     // outline -- sampled from the rip (#202020)
  hi: [0xd0, 0x48, 0x28, 255],      // body highlight (#d04828, rip's lightest red)
  mid: [0xa0, 0x30, 0x18, 255],     // body base (#a03018)
  sh: [0x80, 0x18, 0x10, 255],      // body shadow (#801810)
  deep: [0x68, 0x00, 0x00, 255],    // deep shadow accent (#680000)
  earHi: [0x48, 0x48, 0x58, 255],   // ear/horn highlight (#484858)
  earMid: [0x38, 0x38, 0x48, 255],  // ear/horn mid (#383848)
  earDk: [0x28, 0x30, 0x38, 255],   // ear/horn dark tip (#283038)
  eye: [0xf8, 0xd0, 0x00, 255],     // eye iris (#f8d000)
  pupil: [0x30, 0x18, 0x08, 255],   // eye pupil (dark warm brown, reads at tiny scale)
  eyeHi: [0xf8, 0xf8, 0xf8, 255],   // eye highlight dot (#f8f8f8)
  belly: [0xa0, 0xa0, 0xb0, 255],   // belly/foot fringe (#a0a0b0, rip's pale grey)
  bellySh: [0x78, 0x78, 0x88, 255], // belly/foot shadow (#787888)
};

const W = 26, H = 22;

// Half-width (columns filled, counted inward from the outer edge toward the
// vertical seam) per row for the round head-body silhouette, y=3..19.
// idx is an absolute column 0..12 (left half); mirrored column is 25-idx.
const BODY_ROWS = {
  3: 12, 4: 10, 5: 8, 6: 7, 7: 7, 8: 6, 9: 6, 10: 6,
  11: 5, 12: 6, 13: 6, 14: 6, 15: 7, 16: 7, 17: 8, 18: 10, 19: 12,
};

function fillSymmetric(c, color) {
  for (const [yStr, startIdx] of Object.entries(BODY_ROWS)) {
    const y = Number(yStr);
    for (let x = startIdx; x <= 12; x++) {
      c.setPixel(x, y, color);
      c.setPixel(W - 1 - x, y, color);
    }
  }
}

function drawEars(c) {
  // Left ear/horn (tip at the outer edge, root flaring into the head top);
  // mirrored for the right ear via the same idx->W-1-idx rule as the body.
  const ear = [
    [7, 0, GP.earMid],
    [6, 1, GP.earDk], [7, 1, GP.earMid], [8, 1, GP.earMid],
    [6, 2, GP.earDk], [7, 2, GP.earHi], [8, 2, GP.earMid], [9, 2, GP.earMid],
    [9, 3, GP.earMid], [10, 3, GP.earMid], [11, 3, GP.earDk],
  ];
  for (const [x, y, color] of ear) {
    c.setPixel(x, y, color);
    c.setPixel(W - 1 - x, y, color);
  }
}

function drawHighlightAndShadow(c) {
  // One-directional light (fixed upper-left) painted as thin RIM bands just
  // inside the silhouette edge -- not a filled interior patch, so it reads
  // as curvature shading instead of a blotch, and stays clear of the mouth.
  const hi = [[8, 5], [7, 6], [7, 7], [6, 8], [6, 9], [6, 10]];
  for (const [x, y] of hi) if (c.getPixel(x, y)[3] > 0) c.setPixel(x, y, GP.hi);
  const sh = [
    [18, 12], [19, 12], [18, 13], [19, 13], [18, 14], [19, 14],
    [17, 15], [18, 15], [17, 16], [18, 16], [16, 17], [17, 17], [14, 18], [15, 18],
  ];
  for (const [x, y] of sh) if (c.getPixel(x, y)[3] > 0) c.setPixel(x, y, GP.sh);
  const deep = [[19, 13], [18, 16], [17, 17]];
  for (const [x, y] of deep) if (c.getPixel(x, y)[3] > 0) c.setPixel(x, y, GP.deep);
}

function drawFeet(c, stride) {
  // stride: -1 (left foot forward), 0 (neutral/together), 1 (right foot forward)
  const dy = stride === 0 ? 0 : -1;
  const left = [[9, 20 + (stride < 0 ? dy : 0)], [10, 20 + (stride < 0 ? dy : 0)], [9, 21], [10, 21]];
  const right = [[15, 20 + (stride > 0 ? dy : 0)], [16, 20 + (stride > 0 ? dy : 0)], [15, 21], [16, 21]];
  for (const [x, y] of left) c.setPixel(x, y, GP.belly);
  for (const [x, y] of right) c.setPixel(x, y, GP.bellySh);
}

function drawEyesFront(c, blink) {
  if (blink) {
    c.line(9, 9, 11, 9, GP.ink, 1);
    c.line(15, 9, 17, 9, GP.ink, 1);
    return;
  }
  for (const cx of [10, 16]) {
    c.setPixel(cx, 8, GP.eye);
    c.fillRect(cx - 1, 9, cx + 1, 9, GP.eye);
    c.setPixel(cx, 10, GP.eye);
    c.setPixel(cx, 9, GP.pupil);
    c.setPixel(cx - 1, 8, GP.eyeHi);
  }
}

function drawMouthFront(c, open) {
  if (open) {
    c.fillRect(12, 15, 13, 16, GP.deep);
  } else {
    c.line(11, 15, 14, 15, [GP.ink[0], GP.ink[1], GP.ink[2], 180], 1);
  }
}

function drawBellyFringe(c) {
  const dots = [[10, 19], [12, 19], [14, 19], [16, 19]];
  for (const [x, y] of dots) c.setPixel(x, y, GP.belly);
}

function drawEyeSide(c, blink) {
  if (blink) { c.line(9, 9, 11, 9, GP.ink, 1); return; }
  c.setPixel(10, 8, GP.eye);
  c.fillRect(9, 9, 11, 9, GP.eye);
  c.setPixel(10, 10, GP.eye);
  c.setPixel(10, 9, GP.pupil);
  c.setPixel(9, 8, GP.eyeHi);
}

function drawMouthSide(c, open) {
  if (open) c.fillRect(5, 13, 7, 14, GP.deep);
  else c.line(5, 13, 8, 13, GP.ink, 1);
}

function drawTail(c, wag) {
  // Trails out of the back (right side, since the creature faces/walks
  // left) -- red base tapering into a dark swept-blue tip, matching the
  // ear/horn material. Thick enough (2px) to read as a tail, not a dot.
  const up = [
    [18, 14, GP.mid], [19, 14, GP.hi], [19, 13, GP.mid],
    [20, 13, GP.earMid], [20, 12, GP.earMid], [21, 11, GP.earDk],
    [21, 12, GP.earMid], [22, 10, GP.earDk], [22, 11, GP.earDk],
  ];
  const down = [
    [18, 15, GP.mid], [19, 16, GP.mid], [19, 17, GP.sh],
    [20, 17, GP.earMid], [20, 18, GP.earMid], [21, 19, GP.earDk],
    [21, 18, GP.earMid], [22, 20, GP.earDk], [22, 19, GP.earDk],
  ];
  const pts = wag ? up : down;
  for (const [x, y, color] of pts) c.setPixel(x, y, color);
}

function baseFrame() {
  const c = new Canvas(W, H);
  fillSymmetric(c, GP.mid);
  drawEars(c);
  drawHighlightAndShadow(c);
  return c;
}

function frameS({ open = false, blink = false, stride = 0 } = {}) {
  const c = baseFrame();
  drawEyesFront(c, blink);
  drawMouthFront(c, open);
  drawBellyFringe(c);
  c.autoOutline(GP.ink);
  drawFeet(c, stride);
  return c;
}

function frameN({ wag = false, stride = 0 } = {}) {
  const c = baseFrame();
  // Spine seam down the back -- no face from behind.
  c.line(13, 5, 13, 17, [GP.sh[0], GP.sh[1], GP.sh[2], 160], 1);
  drawTail(c, wag);
  c.autoOutline(GP.ink);
  drawFeet(c, stride);
  return c;
}

function frameW({ open = false, blink = false, stride = 0 } = {}) {
  const c = baseFrame();
  drawEyeSide(c, blink);
  drawMouthSide(c, open);
  drawTail(c, stride !== 0);
  c.autoOutline(GP.ink);
  drawFeet(c, stride);
  return c;
}

function walkSet(frameFn, variantMid, variantA, variantB) {
  // DS convention (see CREATURE-0005/0003 qaNotes): 3 frames per direction,
  // frame 01 is the standing pose (also used as idle), 00/02 are the two
  // alternating mid-step poses with a 1px bounce.
  const f01 = frameFn(variantMid);
  const f00 = frameFn(variantA).translate(0, -1);
  const f02 = frameFn(variantB).translate(0, 1);
  return [f00, f01, f02];
}

function generate(outDir, previewDir) {
  const fs = require('fs');
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(previewDir, { recursive: true });

  const sets = {
    S: walkSet(frameS, { open: false, blink: false, stride: 0 },
      { open: true, blink: false, stride: -1 }, { open: false, blink: true, stride: 1 }),
    N: walkSet(frameN, { wag: false, stride: 0 },
      { wag: true, stride: -1 }, { wag: false, stride: 1 }),
    W: walkSet(frameW, { open: false, blink: false, stride: 0 },
      { open: true, blink: false, stride: -1 }, { open: false, blink: true, stride: 1 }),
  };

  const written = [];
  for (const dir of ['S', 'N', 'W']) {
    sets[dir].forEach((frame, i) => {
      const name = `CREATURE-0002_walk_${dir}_0${i}.png`;
      frame.save(`${outDir}/${name}`);
      frame.scaleNearest(8).save(`${previewDir}/gigimon_${dir}_0${i}_x8.png`);
      written.push(name);
    });
  }
  // E = horizontal mirror of W, same convention as every other map creature here.
  sets.W.forEach((frame, i) => {
    const mirrored = frame.flipX();
    const name = `CREATURE-0002_walk_E_0${i}.png`;
    mirrored.save(`${outDir}/${name}`);
    mirrored.scaleNearest(8).save(`${previewDir}/gigimon_E_0${i}_x8.png`);
    written.push(name);
  });

  console.log('Gigimon map sprites written:', written.join(', '));
  return written;
}

module.exports = { generate, frameS, frameN, frameW, GP, W, H };
if (require.main === module) {
  generate(
    process.argv[2] || './out',
    process.argv[3] || './out/preview'
  );
}
