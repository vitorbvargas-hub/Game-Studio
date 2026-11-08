'use strict';
// GS-003 character creator — body layer (2 models, 3 directions, recolored
// per skin tone by the generator via palettes.js). Hand-authored row-span
// character matrix, see grid.js header for the ADR-009 technique note.
const { buildMatrix } = require('./grid.js');
const { shadeSpan } = require('./shading.js');
const legs = require('./legs.js');
const arms = require('./arms.js');

// Big chibi bobblehead: head max half-width (8 => 16px) is clearly wider
// than the shoulders below it, per the DS Hero / IdleDex scale references.
const HEAD_WIDTHS = [4, 5, 6, 7, 7, 8, 8, 8, 8, 7, 7, 5]; // y4..y15
const HEAD_Y0 = 4;

const MODELS = {
  male: {
    shoulders: [5, 5, 5, 4, 4, 4, 3], // y17..y23
    hip: 3,
  },
  female: {
    shoulders: [4, 4, 4, 3, 3, 3, 2], // narrower waist than male
    hip: 4, // flares wider than shoulders at the hip
  },
};

function headSpan(direction, w, rowIndex) {
  if (direction === 'E') {
    // Profile lean: silhouette shifted 1px back, nose bump added by caller.
    return [15 - w, 14 + w];
  }
  return [16 - w, 15 + w];
}

function pushShaded(rows, y, x0, x1, tokens) {
  if (!rows[y]) rows[y] = [];
  rows[y].push(...shadeSpan(x0, x1, tokens));
}

function buildHead(rows, direction) {
  const skinTokens = ['skinL', 'skin', 'skinD'];
  for (let i = 0; i < HEAD_WIDTHS.length; i++) {
    const y = HEAD_Y0 + i;
    const [x0, x1] = headSpan(direction, HEAD_WIDTHS[i], i);
    pushShaded(rows, y, x0, x1, skinTokens);
  }
  if (direction === 'E') {
    // Nose bump on the leading (east) edge, rows 8-9 of the head.
    rows[HEAD_Y0 + 4].push([14 + HEAD_WIDTHS[4] + 1, 14 + HEAD_WIDTHS[4] + 1, 'skin']);
    rows[HEAD_Y0 + 5].push([14 + HEAD_WIDTHS[5] + 1, 14 + HEAD_WIDTHS[5] + 1, 'skin']);
  }
  // Neck, y16.
  const neckSpan = direction === 'E' ? [13, 17] : [14, 17];
  pushShaded(rows, 16, neckSpan[0], neckSpan[1], skinTokens);

  buildEars(rows, direction);

  if (direction === 'S') {
    // Face sits at y10+ -- one clear row below any hair cut's hairline (the
    // lowest cap bottomY used anywhere in hair.js is y8), because
    // Canvas.autoOutline() stamps an outline pixel on *every* transparent
    // cell adjacent to a filled one, including the row directly below the
    // hair's own silhouette. Placing eyes/brows at y9 put them directly on
    // that auto-generated fringe row and the hair layer's outline color
    // silently painted over them on composite -- this is why v1's eyes were
    // never visible no matter what token they used.
    // Eyebrows, y10: a short dark dash above each eye.
    rows[10] = (rows[10] || []).concat([[11, 12, 'brow'], [19, 20, 'brow']]);
    // Eyes, y11-12: 2px-wide dark iris with a 1px bright shine pixel on the
    // top-left corner so the eye reads as lit, not a flat dot.
    rows[11] = (rows[11] || []).concat([[11, 11, 'eyeShine'], [12, 12, 'eye'], [19, 19, 'eyeShine'], [20, 20, 'eye']]);
    rows[12] = (rows[12] || []).concat([[11, 12, 'eye'], [19, 20, 'eye']]);
    // Mouth, y14: simple closed line.
    rows[14] = (rows[14] || []).concat([[14, 17, 'mouth']]);
  } else if (direction === 'E') {
    rows[10] = (rows[10] || []).concat([[18, 19, 'brow']]);
    rows[11] = (rows[11] || []).concat([[18, 18, 'eyeShine'], [19, 19, 'eye']]);
    rows[12] = (rows[12] || []).concat([[18, 19, 'eye']]);
  }
}

// Ear nubs just outside the head silhouette at ear height (y13-14, level
// with the eyes), touching the head edge so autoOutline merges them into
// the head blob instead of reading them as floating islands.
function buildEars(rows, direction) {
  const idx = 13 - HEAD_Y0;
  const w = HEAD_WIDTHS[idx];
  if (direction === 'E') {
    const [x0] = headSpan(direction, w, idx);
    rows[13] = (rows[13] || []).concat([[x0 - 1, x0 - 1, 'skin']]);
    rows[14] = (rows[14] || []).concat([[x0 - 1, x0 - 1, 'skinD']]);
    return;
  }
  const [x0, x1] = headSpan(direction, w, idx);
  rows[13] = (rows[13] || []).concat([[x0 - 1, x0 - 1, 'skin'], [x1 + 1, x1 + 1, 'skin']]);
  rows[14] = (rows[14] || []).concat([[x0 - 1, x0 - 1, 'skinD'], [x1 + 1, x1 + 1, 'skinD']]);
}

function buildTorso(rows, direction, model) {
  const m = MODELS[model];
  const clothTokens = null; // body layer draws bare torso only where a sleeve
  // gap would show skin; full torso silhouette is normally hidden under the
  // clothing layer (drawn after body by the generator), so we still author a
  // plain skin torso here for when a layer is previewed alone / no outfit.
  const skinTokens = ['skinL', 'skin', 'skinD'];
  for (let i = 0; i < m.shoulders.length; i++) {
    const y = 17 + i;
    const w = m.shoulders[i];
    const [x0, x1] = direction === 'E' ? [15 - w, 14 + w] : [16 - w, 15 + w];
    pushShaded(rows, y, x0, x1, skinTokens);
  }
  const hipW = m.hip;
  const [hx0, hx1] = direction === 'E' ? [15 - hipW, 14 + hipW] : [16 - hipW, 15 + hipW];
  pushShaded(rows, 24, hx0, hx1, skinTokens);
}

// Bare-skin arm: upper arm hugs the shoulder, forearm+hand swing per walk
// frame (arms.armSwingDx), opposite the leg that is forward that frame so
// the walk reads as a real gait instead of a static torso. clothing.js's
// buildSleeves mirrors this exact geometry so a sleeve always covers the
// arm it belongs to.
function buildArms(rows, direction, model, anim, frame) {
  const m = MODELS[model];
  const skinTokens = ['skinL', 'skin', 'skinD'];
  const shoulderW = m.shoulders[1]; // width at y18, arm attach row
  if (direction === 'E') {
    const ax0 = 14 + shoulderW + 1;
    const ax1 = ax0 + 1;
    for (const y of arms.UPPER_ROWS) pushShaded(rows, y, ax0, ax1, skinTokens);
    const dx = anim === 'walk' ? arms.armSwingDx(frame, 'right') : 0;
    for (const y of arms.FORE_ROWS) pushShaded(rows, y, ax0 + dx, ax1 + dx, skinTokens);
    rows[arms.HAND_ROW] = (rows[arms.HAND_ROW] || []).concat([[ax0 + dx, ax1 + dx, 'skinD']]);
    return;
  }
  const x0 = 16 - shoulderW;
  const x1 = 15 + shoulderW;
  const sides = [
    { side: 'left', ux0: x0 - 2, ux1: x0 - 1 },
    { side: 'right', ux0: x1 + 1, ux1: x1 + 2 },
  ];
  for (const { side, ux0, ux1 } of sides) {
    for (const y of arms.UPPER_ROWS) pushShaded(rows, y, ux0, ux1, skinTokens);
    const dx = anim === 'walk' ? arms.armSwingDx(frame, side) : 0;
    for (const y of arms.FORE_ROWS) pushShaded(rows, y, ux0 + dx, ux1 + dx, skinTokens);
    rows[arms.HAND_ROW] = (rows[arms.HAND_ROW] || []).concat([[ux0 + dx, ux1 + dx, 'skinD']]);
  }
}

function buildLegsSkin(rows, direction, anim, frame) {
  const skinTokens = ['skinL', 'skin', 'skinD'];
  if (direction !== 'E') {
    const pose = anim === 'walk' ? legs.frontBackWalkFrame(frame) : legs.STANCE;
    const footRow = pose.footRow || 32;
    for (const y of legs.THIGH_ROWS) {
      pushShaded(rows, y, pose.thigh.left[0], pose.thigh.left[1], skinTokens);
      pushShaded(rows, y, pose.thigh.right[0], pose.thigh.right[1], skinTokens);
    }
    const shinRows = pose.shinRows || legs.SHIN_ROWS;
    for (const y of shinRows) {
      pushShaded(rows, y, pose.shin.left[0], pose.shin.left[1], skinTokens);
    }
    for (const y of legs.SHIN_ROWS) {
      pushShaded(rows, y, pose.shin.right[0], pose.shin.right[1], skinTokens);
    }
    for (const y of legs.FOOT_ROWS) {
      if (y === footRow || footRow === 32) {
        pushShaded(rows, y, pose.foot.left[0], pose.foot.left[1], ['skinD', 'skinD', 'ink']);
      }
      pushShaded(rows, y, pose.foot.right[0], pose.foot.right[1], ['skinD', 'skinD', 'ink']);
    }
  } else {
    const pose = anim === 'walk' ? legs.sideWalkFrame(frame) : legs.SIDE_STANCE;
    for (const y of legs.THIGH_ROWS) pushShaded(rows, y, pose.thigh[0], pose.thigh[1], skinTokens);
    const farLift = pose.farShinLift || 0;
    for (const y of legs.SHIN_ROWS) pushShaded(rows, y, pose.near.shin[0], pose.near.shin[1], skinTokens);
    for (const y of legs.SHIN_ROWS.slice(0, legs.SHIN_ROWS.length - farLift)) {
      pushShaded(rows, y, pose.far.shin[0], pose.far.shin[1], skinTokens);
    }
    for (const y of legs.FOOT_ROWS) pushShaded(rows, y, pose.near.foot[0], pose.near.foot[1], ['skinD', 'skinD', 'ink']);
    for (const y of legs.FOOT_ROWS.slice(0, legs.FOOT_ROWS.length - farLift)) {
      pushShaded(rows, y, pose.far.foot[0], pose.far.foot[1], ['skinD', 'skinD', 'ink']);
    }
  }
}

// Shared head/torso bob offset so body, hair and clothing stay pixel-aligned
// across idle breathing and walk footfall. Idle: up on the middle frame of a
// 3-frame loop. Walk: up on the two "foot planted mid-step" frames.
function headBobOffset(anim, frame) {
  if (anim === 'idle') return [0, -1, 0][frame % 3] || 0;
  if (anim === 'walk') return [0, -1, 0, -1][frame % 4] || 0;
  return 0;
}

// pose: { model: 'male'|'female', direction: 'S'|'E'|'N', anim: 'idle'|'walk'|'point', frame: number }
function buildBodyMatrix(pose) {
  const { model = 'male', direction = 'S', anim = 'idle', frame = 0 } = pose;
  const rows = {};
  buildHead(rows, direction);
  buildTorso(rows, direction, model);
  buildArms(rows, direction, model, anim, frame);
  buildLegsSkin(rows, direction, anim, frame);

  // Bob the head+torso band (y4-23); legs/hip stay put (feet are grounded).
  let matrix = buildMatrix(rows);
  const bob = headBobOffset(anim, frame);
  if (bob !== 0) {
    const { shiftBand } = require('./grid.js');
    shiftBand(matrix, 4, 23, bob);
  }
  if (anim === 'point') {
    // Command/point pose: raises the right arm's upper-arm segment one row
    // and recolors it, reading as "pointing forward" at this scale. armX is
    // derived from the model's own shoulder width (buildArms uses the same
    // formula) so it stays attached to the torso for both models instead of
    // the fixed column v1 used, which only lined up for the male model.
    const { setCell } = require('./grid.js');
    const shoulderW = MODELS[model].shoulders[1];
    const armX = 15 + shoulderW + 1;
    for (let y = 18; y <= 20; y++) { setCell(matrix, armX, y, 'skinD'); setCell(matrix, armX + 1, y, 'skin'); }
    setCell(matrix, armX + 1, 17, 'skin');
  }
  return matrix;
}

module.exports = { buildBodyMatrix, MODELS, HEAD_WIDTHS, HEAD_Y0, headBobOffset, headSpan };
