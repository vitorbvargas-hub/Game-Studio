'use strict';
// GS-003 -- replace the hand-drawn ("original") Gigimon MAP sprite with a
// base derived from the OFFICIAL Digimon Tamers: Brave Tamer "Baby I /
// Baby II" sheet (The Spriters Resource, ripper Airshuffler), row 3 col 3
// of the grid: red body, swept-back horns, open roaring mouth -- confirmed
// against the existing E-M-B-E-R battle_idle rip and the Battle Spirit
// ver1.5 portraits sheet before use (view_image, this session).
//
// The sheet cell already carries real alpha transparency (not an opaque
// white fill), so "chroma key" here is: border-flood-fill matte (removes
// any residual near-white/background pixels) + trim, same dwds_extract.js
// helpers used across this project's rip pipeline -- no PIL, pure Node.
//
// Only ONE official pose exists for this stage (a 3/4 roar shot, asymmetric:
// horns upper-left, mouth lower-right) -- per GS-003 direction: used as-is
// for S, mirrored for W (and E = mirror of W, i.e. same pixels as S), and a
// simple hand-built round back silhouette (same palette, matched envelope)
// for N, since there is no official back view to derive from.
const fs = require('fs');
const path = require('path');
const { loadSheetCanvas, cropRect, matteByBorderFlood, trimTransparent } = require('./dwds_extract.js');
const { Canvas } = require('./canvas.js');

const SHEET = path.resolve(
  __dirname, '../../../../../assets/GAME-ASSETS/10-source-files/spriters-resource/',
  'digimontamersbravetamer__arrow-drop-down__Baby-I-Baby-II__142452.png'
);
const CELL_BOX = [194, 162, 287, 255]; // row3 col3, detected by column-band scan of the sheet's teal background

// Palette sampled directly from the official cell's own pixels (flat-shaded
// source, only 12 opaque colors total -- verified by histogram this session).
const GP = {
  ink: [0, 0, 0, 255],
  hi: [238, 85, 68, 255],
  mid: [170, 51, 34, 255],
  sh: [102, 34, 17, 255],
  earMid: [85, 85, 85, 255],
  earDk: [34, 34, 34, 255],
  eye: [255, 238, 34, 255],
  pupil: [153, 136, 34, 255],
};

const FRAME_W = 24, FRAME_H = 24;
const CONTENT_OX = 1, CONTENT_OY = 4; // placement of the official-derived content inside the frame
const GROUND_Y = 22; // bottom row every direction's neutral pose sits on (pivot anchor)

function nearestResize(c, destW, destH) {
  const out = new Canvas(destW, destH);
  for (let y = 0; y < destH; y++) {
    for (let x = 0; x < destW; x++) {
      const sx = Math.min(c.w - 1, Math.floor(((x + 0.5) * c.w) / destW));
      const sy = Math.min(c.h - 1, Math.floor(((y + 0.5) * c.h) / destH));
      out.setPixel(x, y, c.getPixel(sx, sy));
    }
  }
  return out;
}

function bboxOf(c) {
  let minX = c.w, minY = c.h, maxX = -1, maxY = -1;
  for (let y = 0; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) {
      if (c.getPixel(x, y)[3] > 0) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
  }
  return { minX, minY, maxX, maxY };
}

// Squash/stretch: resample the opaque content by (scaleX, scaleY), keeping
// the bottom edge and horizontal center fixed (classic animation anchor --
// the ground-contact point never moves, only the mass above it deforms).
function deform(c, scaleX, scaleY) {
  const { minX, minY, maxX, maxY } = bboxOf(c);
  if (maxX < minX) return new Canvas(c.w, c.h);
  const bw = maxX - minX + 1, bh = maxY - minY + 1;
  const sub = cropRect(c, minX, minY, maxX, maxY);
  const destW = Math.max(1, Math.round(bw * scaleX));
  const destH = Math.max(1, Math.round(bh * scaleY));
  const resized = nearestResize(sub, destW, destH);
  const out = new Canvas(c.w, c.h);
  const centerX = (minX + maxX) / 2;
  const destX0 = Math.round(centerX - destW / 2);
  const destY0 = maxY - destH + 1;
  out.blit(resized, destX0, destY0);
  return out;
}

// Remove tiny isolated opaque specks (area<=1, no opaque 8-neighbor) left
// over from nearest-neighbor downsampling -- manual pixel cleanup pass.
function despeckle(c) {
  const out = new Canvas(c.w, c.h);
  for (let y = 0; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) out.setPixel(x, y, c.getPixel(x, y));
  }
  for (let y = 0; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) {
      const p = c.getPixel(x, y);
      if (p[3] === 0) continue;
      let hasNeighbor = false;
      for (let dy = -1; dy <= 1 && !hasNeighbor; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          if (c.getPixel(x + dx, y + dy)[3] > 0) { hasNeighbor = true; break; }
        }
      }
      if (!hasNeighbor) out.setPixel(x, y, [0, 0, 0, 0]);
    }
  }
  return out;
}

function extractOfficialBase() {
  const sheet = loadSheetCanvas(SHEET);
  const raw = cropRect(sheet, ...CELL_BOX);
  const matted = matteByBorderFlood(raw, 40); // chroma-key pass: flood-fill matte from the cell's own border pixels
  const trimmed = trimTransparent(matted);
  const targetH = 19; // DS baby map-sprite band (Koromon 17 / Tsunomon 19 / Tokomon 21, see creature.json notes)
  const targetW = Math.round((trimmed.w * targetH) / trimmed.h);
  const small = despeckle(nearestResize(trimmed, targetW, targetH));

  const frame = new Canvas(FRAME_W, FRAME_H);
  frame.blit(small, CONTENT_OX, CONTENT_OY);
  return frame; // bottom row of content lands on GROUND_Y by construction (CONTENT_OY + targetH - 1 === GROUND_Y)
}

// -- N: simple hand-built back silhouette, same palette + matched envelope
// (width/height) as the official S base -- there is no official back view
// of this pose to derive from, so this is deliberately plain (ADR-009
// technique: pixel matrix, no fillEllipse/fillCircle shape primitives).
const CX = 11; // center column within a 21-wide content box
// Round/bulbous dome taper (narrow under the horns, widest at mid-body,
// gently tapering to a rounded base) -- NOT an hourglass: half-width only
// ever increases top->mid, then decreases mid->bottom.
const BACK_ROWS = {
  3: 5, 4: 7, 5: 8, 6: 9, 7: 9, 8: 9, 9: 9, 10: 9,
  11: 9, 12: 8, 13: 8, 14: 7, 15: 7, 16: 6, 17: 5,
};

function fillSymmetric(c, color) {
  for (const [yStr, hw] of Object.entries(BACK_ROWS)) {
    const y = Number(yStr);
    for (let x = CX - hw; x <= CX; x++) {
      c.setPixel(x, y, color);
      c.setPixel(2 * CX - x, y, color);
    }
  }
}

function drawBackHorns(c) {
  const horn = [
    [CX - 3, 0, GP.earDk],
    [CX - 4, 1, GP.earDk], [CX - 3, 1, GP.earMid], [CX - 2, 1, GP.earMid],
    [CX - 4, 2, GP.earDk], [CX - 3, 2, GP.earMid], [CX - 2, 2, GP.earMid], [CX - 1, 2, GP.earMid],
    [CX - 1, 3, GP.earMid], [CX, 3, GP.earMid],
  ];
  for (const [x, y, color] of horn) {
    c.setPixel(x, y, color);
    c.setPixel(2 * CX - x, y, color);
  }
}

function buildBackContent() {
  const w = 2 * CX + 1, h = 19;
  const c = new Canvas(w, h);
  fillSymmetric(c, GP.mid);
  drawBackHorns(c);
  // Spine seam -- the only "detail" visible from behind.
  c.line(CX, 4, CX, 17, [GP.sh[0], GP.sh[1], GP.sh[2], 160], 1);
  c.autoOutline(GP.ink);
  return c;
}

function buildBackBase() {
  const content = buildBackContent();
  const frame = new Canvas(FRAME_W, FRAME_H);
  const ox = CONTENT_OX; // same horizontal placement convention as S for a consistent silhouette column
  const oy = GROUND_Y - content.h + 1;
  frame.blit(content, ox, oy);
  return frame;
}

// 3-frame hop: 01 neutral (also the idle pose), 00 apex (airborne, stretched
// taller/narrower, lifted), 02 landing (grounded, squashed shorter/wider).
function hopSet(base) {
  const f01 = base;
  const f00 = deform(base, 0.9, 1.1).translate(0, -2);
  const f02 = deform(base, 1.05, 0.9).translate(0, 1);
  return [f00, f01, f02];
}

function generate(outDir, previewDir) {
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(previewDir, { recursive: true });

  const sBase = extractOfficialBase();
  const nBase = buildBackBase();
  const wBase = sBase.flipX();

  const S = hopSet(sBase);
  const N = hopSet(nBase);
  const W = hopSet(wBase);
  const E = W.map((f) => f.flipX());

  const written = [];
  const sets = { S, N, W, E };
  for (const dir of ['S', 'N', 'W', 'E']) {
    sets[dir].forEach((frame, i) => {
      const name = `CREATURE-0002_walk_${dir}_0${i}.png`;
      frame.save(path.join(outDir, name));
      frame.scaleNearest(8).save(path.join(previewDir, `gigimon_${dir}_0${i}_x8.png`));
      written.push(name);
    });
  }
  console.log('Gigimon OFFICIAL map sprites written:', written.join(', '));
  return { written, frameW: FRAME_W, frameH: FRAME_H, groundY: GROUND_Y };
}

module.exports = { generate, extractOfficialBase, buildBackBase, hopSet, FRAME_W, FRAME_H, GROUND_Y, CELL_BOX, SHEET };
if (require.main === module) {
  generate(
    process.argv[2] || './out',
    process.argv[3] || './out/preview'
  );
}
