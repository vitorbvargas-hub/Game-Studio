'use strict';
// GS-003 character creator — clothing layer (3 outfits x 3 directions,
// recolored by the generator via palettes.js OUTFIT_COLOR_OPTIONS). Shares
// leg geometry with body.js's bare-skin legs (legs.js) so pants/shorts line
// up with the leg they cover in every walk frame, and shares head geometry
// with body.js/hair.js for the Tamer-classico goggles.
const { buildMatrix, shiftBand } = require('./grid.js');
const { shadeSpan } = require('./shading.js');
const { MODELS, headSpan, HEAD_WIDTHS, HEAD_Y0, headBobOffset } = require('./body.js');
const legs = require('./legs.js');

const CLOTH_TOKENS = ['clothL', 'cloth', 'clothD'];
const BOOT_TOKENS = ['clothD', 'clothD', 'ink'];

function push(rows, y, x0, x1, tokens = CLOTH_TOKENS) {
  if (!rows[y]) rows[y] = [];
  rows[y].push(...shadeSpan(x0, x1, tokens));
}

function buildTorsoWear(rows, direction, model, hemY) {
  const m = MODELS[model];
  for (let i = 0; i < m.shoulders.length; i++) {
    const y = 17 + i;
    if (y > hemY) continue;
    const w = m.shoulders[i] + 1; // overhang over the bare skin torso
    const [x0, x1] = direction === 'E' ? [15 - w, 14 + w] : [16 - w, 15 + w];
    push(rows, y, x0, x1);
  }
  if (hemY >= 24) {
    const w = m.hip + 1;
    const [x0, x1] = direction === 'E' ? [15 - w, 14 + w] : [16 - w, 15 + w];
    push(rows, 24, x0, x1);
  }
  // Collar notch.
  const collarW = direction === 'E' ? [16, 18] : [14, 17];
  push(rows, 17, collarW[0], collarW[1], ['clothD', 'clothD', 'ink']);
}

function buildBottomWear(rows, direction, coverShin, anim, frame) {
  if (direction !== 'E') {
    const pose = anim === 'walk' ? legs.frontBackWalkFrame(frame) : legs.STANCE;
    const footRow = pose.footRow || 32;
    for (const y of legs.THIGH_ROWS) {
      push(rows, y, pose.thigh.left[0] - 1, pose.thigh.left[1] + 1);
      push(rows, y, pose.thigh.right[0] - 1, pose.thigh.right[1] + 1);
    }
    if (coverShin) {
      const shinRows = pose.shinRows || legs.SHIN_ROWS;
      for (const y of shinRows) push(rows, y, pose.shin.left[0] - 1, pose.shin.left[1] + 1);
      for (const y of legs.SHIN_ROWS) push(rows, y, pose.shin.right[0] - 1, pose.shin.right[1] + 1);
      for (const y of legs.FOOT_ROWS) {
        if (y === footRow || footRow === 32) push(rows, y, pose.foot.left[0], pose.foot.left[1], BOOT_TOKENS);
        push(rows, y, pose.foot.right[0], pose.foot.right[1], BOOT_TOKENS);
      }
    }
  } else {
    const pose = anim === 'walk' ? legs.sideWalkFrame(frame) : legs.SIDE_STANCE;
    const farLift = pose.farShinLift || 0;
    for (const y of legs.THIGH_ROWS) push(rows, y, pose.thigh[0] - 1, pose.thigh[1] + 1);
    if (coverShin) {
      for (const y of legs.SHIN_ROWS) push(rows, y, pose.near.shin[0] - 1, pose.near.shin[1] + 1);
      for (const y of legs.SHIN_ROWS.slice(0, legs.SHIN_ROWS.length - farLift)) {
        push(rows, y, pose.far.shin[0] - 1, pose.far.shin[1] + 1);
      }
      for (const y of legs.FOOT_ROWS) push(rows, y, pose.near.foot[0], pose.near.foot[1], BOOT_TOKENS);
      for (const y of legs.FOOT_ROWS.slice(0, legs.FOOT_ROWS.length - farLift)) {
        push(rows, y, pose.far.foot[0], pose.far.foot[1], BOOT_TOKENS);
      }
    }
  }
}

// Identity accents required by the founder's Tamer brief (gloves, jacket
// tech trim, belt Digivice, cyan/digital accents -- goggles stay their own
// function below, exclusive to tamer-classico). These three are drawn on
// every outfit so the "Tamer" identity does not depend on which outfit the
// player picks; only the goggles differ per outfit per ART_STYLE_GUIDE.md
// section 6 (silhouette/color differentiates, pattern reinforces).
const GLOVE_TOKENS = ['gloveL', 'glove', 'gloveD'];
const TECH_TOKENS = ['techL', 'tech', 'techD'];
const DEVICE_TOKENS = ['deviceL', 'device', 'deviceD'];

function buildGloves(rows, direction, model) {
  // Extends the sleeve cuff 2px beyond the torso silhouette at wrist height
  // (rows 20-22) so it stays connected to the torso already pushed by
  // buildTorsoWear -- no gap, unlike the floating hand nubs rejected in
  // iteration 1 (see DECISIONS.md).
  const m = MODELS[model];
  for (const i of [3, 4, 5]) { // y20, y21, y22
    const y = 17 + i;
    const w = m.shoulders[i] + 1;
    if (direction === 'E') {
      const x1 = 14 + w;
      push(rows, y, x1 + 1, x1 + 2, GLOVE_TOKENS);
    } else {
      const x0 = 16 - w;
      const x1 = 15 + w;
      push(rows, y, x0 - 2, x0 - 1, GLOVE_TOKENS);
      push(rows, y, x1 + 1, x1 + 2, GLOVE_TOKENS);
    }
  }
}

function buildTechTrim(rows, direction, hemY) {
  // A thin cyan zipper/circuit line down the jacket front -- overwrites
  // pixels already drawn by buildTorsoWear (stays inside the silhouette,
  // never a separate shape) so it reads as a seam, not an applique.
  if (direction === 'E') {
    push(rows, 18, 19, 19, TECH_TOKENS);
    push(rows, 19, 19, 19, TECH_TOKENS);
  } else {
    for (let y = 18; y < hemY; y++) push(rows, y, 16, 16, TECH_TOKENS);
  }
}

function buildDigivice(rows, direction, hemY) {
  // A small clip-on Digivice icon at the belt/hip: a dark casing row with a
  // bright cyan screen row on top, 3px wide so it reads as a distinct
  // rectangular device, not a stray pixel. Fixed at rows 23-24 (the hip,
  // just above where the thighs start at y25) regardless of hemY, so it
  // always reads as "on the belt" rather than drifting up the torso on the
  // shorter-hemmed casual outfit -- overwrites pixels already drawn by
  // buildTorsoWear/buildBottomWear there, so it never forms a floating
  // island. Front-facing only (S/E): a worn device at the hip is not
  // something you'd draw from behind, so N skips it.
  if (direction === 'N') return;
  const x0 = 18;
  const x1 = x0 + 2;
  if (!rows[23]) rows[23] = [];
  rows[23].push([x0, x1, 'deviceL']);
  if (!rows[24]) rows[24] = [];
  rows[24].push([x0, x1, 'deviceD']);
}

function buildGoggles(rows, direction) {
  // A single thin strap row at the hairline (not a full helmet band) with
  // small lenses on the forehead -- leaves hair/scalp visible above and
  // skin visible at the temples, per the side-by-side check against the DS
  // Hero reference (iteration 2: the first pass read as a helmet).
  const strapIdx = 7 - HEAD_Y0;
  const strapW = HEAD_WIDTHS[strapIdx] + 1;
  const [sx0, sx1] = headSpan(direction, strapW, strapIdx);
  push(rows, 7, sx0, sx1, ['strapL', 'strap', 'strapD']);
  if (direction === 'E') {
    push(rows, 8, 19, 21, ['goggleL', 'goggle', 'goggleD']);
  } else {
    push(rows, 8, 11, 13, ['goggleL', 'goggle', 'goggleD']);
    push(rows, 8, 18, 20, ['goggleL', 'goggle', 'goggleD']);
  }
}

const OUTFITS = {
  casual(direction) {
    const rows = {};
    return { rows, hemY: 23, coverShin: false, goggles: false };
  },
  aventureiro(direction) {
    const rows = {};
    return { rows, hemY: 24, coverShin: true, goggles: false };
  },
  'tamer-classico'(direction) {
    const rows = {};
    return { rows, hemY: 24, coverShin: true, goggles: true };
  },
};

const OUTFIT_IDS = Object.keys(OUTFITS);

// pose: { outfit, model, direction: 'S'|'E'|'N', anim, frame }
function buildClothingMatrix(pose) {
  const { outfit, model = 'male', direction = 'S', anim = 'idle', frame = 0 } = pose;
  const spec = OUTFITS[outfit];
  if (!spec) throw new Error(`unknown outfit: ${outfit}`);
  const { rows, hemY, coverShin, goggles } = spec(direction);
  buildTorsoWear(rows, direction, model, hemY);
  buildBottomWear(rows, direction, coverShin, anim, frame);
  buildGloves(rows, direction, model);
  buildTechTrim(rows, direction, hemY);
  buildDigivice(rows, direction, hemY);
  if (goggles) buildGoggles(rows, direction);

  const matrix = buildMatrix(rows);
  const bob = headBobOffset(anim, frame);
  if (bob !== 0) {
    // Only the torso/goggles band bobs with the head; legs stay grounded.
    shiftBand(matrix, 4, 24, bob);
  }
  return matrix;
}

module.exports = { buildClothingMatrix, OUTFIT_IDS };
