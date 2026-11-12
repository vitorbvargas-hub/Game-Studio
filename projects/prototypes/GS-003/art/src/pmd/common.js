'use strict';
// Shared primitives for the PMD-format pipeline (GS-003, Koromon/Agumon
// generation). Format reference: art/reference/pmd-format-founder/ (founder's
// Charmander sample) -- used ONLY to learn the structure (8-direction grid,
// AnimData.xml, Anim/Offsets/Shadow sheets); no pixel from that reference was
// read, copied or traced to build any shape here. All silhouettes below are
// original, built on the same body-part/outline/light rules already used by
// the Digimon-fan battle sprites (see ../digimon_palette.js, ../agumon.js
// etc.) so the two formats read as the same product.
const { Canvas } = require('../canvas.js');
const { withAlpha } = require('../palette.js');

// Direction row order for Anim.png/Offsets.png/Shadow.png, matching the
// reference sheet's convention: S, SE, E, NE, N, NW, W, SW (top to bottom).
const DIR_ORDER = ['S', 'SE', 'E', 'NE', 'N', 'NW', 'W', 'SW'];

// turn: -1 (west) .. 0 (centered) .. 1 (east) -- horizontal feature shift.
// face: 1 (facing the camera, S) .. -1 (facing away, N) -- drives eye/face
// visibility. vec: forward unit vector in screen space (x right+, y down+),
// used to point lunge/knockback translation in Attack/Hurt frames.
// Only S/SE/E/NE/N are hand-posed; NW/W/SW are produced by mirroring the
// NE/E/SE canvases horizontally (documented fallback explicitly allowed by
// the brief when full hand-drawn 8-way art isn't in scope -- see
// art/sprites/pmd/README.md "Limitacoes").
const DIR_META = {
  S: { turn: 0, face: 1, vec: [0, 1], mirrorOf: null },
  SE: { turn: 0.55, face: 0.55, vec: [0.7, 0.7], mirrorOf: null },
  E: { turn: 1, face: 0.05, vec: [1, 0], mirrorOf: null },
  NE: { turn: 0.55, face: -0.6, vec: [0.7, -0.7], mirrorOf: null },
  N: { turn: 0, face: -1, vec: [0, -1], mirrorOf: null },
  NW: { turn: -0.55, face: -0.6, vec: [-0.7, -0.7], mirrorOf: 'NE' },
  W: { turn: -1, face: 0.05, vec: [-1, 0], mirrorOf: 'E' },
  SW: { turn: -0.55, face: 0.55, vec: [-0.7, 0.7], mirrorOf: 'SE' },
};
const UNIQUE_DIRS = ['S', 'SE', 'E', 'NE', 'N'];

function eyePair(c, cx, cy, spacing, meta, ink, paper, opts = {}) {
  const { face, turn } = meta;
  if (face <= -0.75) return; // back view: no face, species backMark (if any) handles it
  const closed = !!opts.closed;
  const compress = 1 - Math.min(0.5, Math.abs(turn) * 0.5);
  const shift = turn * spacing * 0.45;
  const lx = Math.round(cx - spacing * compress + shift);
  const rx = Math.round(cx + spacing * compress + shift);
  const near = turn >= 0 ? rx : lx;
  const far = turn >= 0 ? lx : rx;
  const hideFar = Math.abs(turn) > 0.85 && face < 0.2;
  const drawOne = (ex, big) => {
    if (closed) { c.line(ex - 1, cy, ex + 1, cy, ink, 1); return; }
    const r = big ? 2 : 1;
    c.fillEllipse(ex, cy, r, r + 1, paper);
    c.fillRect(ex - r, cy, ex + r, cy + 1, ink);
  };
  drawOne(near, true);
  if (!hideFar) drawOne(far, face > -0.3);
}

function drawZzz(c, x, y, pose, ink) {
  const n = pose.sleepPhase ? 2 : 1;
  for (let i = 0; i < n; i++) {
    const ox = x + i * 4, oy = y - i * 5;
    c.line(ox - 2, oy, ox + 2, oy, ink, 1);
    c.line(ox + 2, oy, ox - 2, oy + 3, ink, 1);
    c.line(ox - 2, oy + 3, ox + 2, oy + 3, ink, 1);
  }
}

// One generic chibi-creature drawer reused by all 6 species. Each species
// config (sp) supplies colors + optional hooks (back/front/frontOverOutline/
// backMark) that draw its distinguishing features (ears, tail, legs, horn,
// hood, dorsal ridges) around this shared body/eye/outline/shadow core --
// same approach as the existing battle-sprite generators reusing
// Canvas.translate()/tint() instead of redrawing a creature per pose.
function drawCreature(c, cx, baseY, meta, pose, sp) {
  const squash = pose.squash || 0;
  const hop = pose.hop || 0;
  const rx = sp.r - squash * 0.5;
  const ry = sp.r + squash * 0.5;
  const cy = baseY - sp.r + hop;
  const ox = cx + meta.turn * sp.r * (sp.turnShift ?? 0.15);

  if (sp.back) sp.back(c, ox, cy, rx, ry, meta, pose, sp);
  c.fillEllipse(ox, cy, rx, ry, sp.body);
  // Chest/belly patch only reads as a chest when the front is actually in
  // view -- drawing it for N/NE/NW used to leave a pale blotch sitting right
  // where eyes would be, faking a face on the back of the head.
  if (meta.face > -0.3) {
    c.fillEllipse(ox + meta.turn * rx * 0.3, cy + ry * 0.35, rx * 0.5, ry * 0.35, sp.belly);
  }
  const hlAlpha = meta.face > -0.3 ? 130 : 70;
  c.fillEllipse(ox - meta.turn * rx * 0.25 - rx * 0.25, cy - ry * 0.48, rx * 0.26, ry * 0.16, withAlpha(sp.bodyLt, hlAlpha));
  if (sp.front) sp.front(c, ox, cy, rx, ry, meta, pose, sp);
  c.autoOutline(sp.ink);
  if (sp.frontOverOutline) {
    sp.frontOverOutline(c, ox, cy, rx, ry, meta, pose, sp);
    c.autoOutline(sp.ink);
  }

  if (meta.face <= -0.75) {
    if (sp.backMark) sp.backMark(c, ox, cy, rx, ry, meta, pose, sp);
  } else {
    const ey = cy - ry * 0.05 + (sp.eyeYOffset || 0) * ry;
    eyePair(c, ox, ey, sp.eyeSpacing, meta, sp.ink, sp.paper, { closed: pose.sleeping || pose.blink });
    const my = cy + ry * (sp.mouthY ?? 0.18);
    if (pose.mouthOpen) c.fillEllipse(ox, my, sp.mouthR ?? 2, (sp.mouthR ?? 2) * 0.7, sp.accent);
    else if (sp.showMouth !== false) c.line(ox - 2, my, ox + 2, my, withAlpha(sp.ink, 150), 1);
  }
  // Beside the head (not above it) so the mark still fits inside the short
  // 24px-tall Sleep frame instead of being clipped off the top edge.
  if (pose.sleeping) drawZzz(c, ox + rx * 1.05, cy - ry * 0.25, pose, sp.ink);
  return c;
}

// Standard pose sequence per animation -- identical skeleton for every
// species; species differences come entirely from how their back/front hooks
// react to legOffset/armLift/flap/squash/hop, so Idle/Walk/Attack/Hurt/Sleep
// stay visually consistent across the whole roster.
function posesFor(animName) {
  switch (animName) {
    case 'Idle':
      return [
        { squash: 0, hop: 0, blink: false },
        { squash: 0, hop: 0, blink: true },
        { squash: -1, hop: 1, blink: false },
        { squash: 0, hop: 0, blink: false },
      ];
    case 'Walk':
      return [
        { squash: 0, hop: 0, legOffset: 2, armLift: 1, flap: 2 },
        { squash: 1, hop: -2, legOffset: 0, armLift: 0, flap: 0 },
        { squash: 0, hop: 0, legOffset: -2, armLift: 1, flap: -2 },
        { squash: 1, hop: -2, legOffset: 0, armLift: 0, flap: 0 },
      ];
    case 'Attack':
      return [
        { squash: -2, hop: 0, lunge: -2, armLift: 1, flap: -3 },
        { squash: 3, hop: 0, lunge: 4, mouthOpen: true, flash: true, flap: 4 },
        { squash: 0, hop: 0, lunge: 1, flap: 1 },
      ];
    case 'Hurt':
      return [
        { squash: 0, hop: 0, lunge: -2, blink: true, flashWhite: 150 },
        { squash: 0, hop: 0, lunge: -1, blink: true, flashWhite: 70 },
      ];
    case 'Sleep':
      return [
        { squash: 2, hop: 2, sleeping: true, sleepPhase: 0 },
        { squash: 2, hop: 3, sleeping: true, sleepPhase: 1 },
      ];
    default:
      throw new Error(`Unknown anim ${animName}`);
  }
}

function buildFrame(sp, frameW, frameH, dirName, pose) {
  const meta = DIR_META[dirName];
  const c = new Canvas(frameW, frameH);
  const baseY = frameH - 5;
  drawCreature(c, Math.floor(frameW / 2), baseY, meta, pose, sp);
  let out = c;
  if (pose.lunge) {
    const [vx, vy] = meta.vec;
    out = out.translate(Math.round(vx * pose.lunge), Math.round(vy * pose.lunge));
  }
  if (pose.flash) out = out.tint(sp.accent, 110);
  if (pose.flashWhite) out = out.tint(sp.paper, pose.flashWhite);
  return out;
}

function buildShadowFrame(sp, frameW, frameH, pose) {
  const c = new Canvas(frameW, frameH);
  const baseY = frameH - 4;
  const squash = pose.squash || 0;
  const hop = pose.hop || 0;
  const rx = Math.max(2, sp.r * 0.75 - Math.abs(hop) * 0.4 + squash * 0.1);
  const ry = Math.max(1, rx * 0.22);
  c.fillEllipse(Math.floor(frameW / 2), baseY, rx, ry, [10, 10, 14, 255]);
  return c;
}

// Build every unique-direction frame list for one animation, then mirror to
// fill the remaining 3 rows -- see DIR_META comment above.
function buildAnimDirections(sp, frameW, frameH, animName) {
  const poses = posesFor(animName);
  const framesByDir = {};
  const shadowByDir = {};
  for (const d of UNIQUE_DIRS) {
    framesByDir[d] = poses.map((p) => buildFrame(sp, frameW, frameH, d, p));
    shadowByDir[d] = poses.map((p) => buildShadowFrame(sp, frameW, frameH, p));
  }
  for (const d of DIR_ORDER) {
    const mirrorOf = DIR_META[d].mirrorOf;
    if (mirrorOf) {
      framesByDir[d] = framesByDir[mirrorOf].map((f) => f.flipX());
      shadowByDir[d] = shadowByDir[mirrorOf];
    }
  }
  return { framesByDir, shadowByDir };
}

module.exports = {
  DIR_ORDER, DIR_META, UNIQUE_DIRS, eyePair, drawZzz, drawCreature, posesFor, buildFrame,
  buildShadowFrame, buildAnimDirections,
};
