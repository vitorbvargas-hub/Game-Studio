// Gabumon, hand-drawn at 64x64, matching the Guilmon v3 (PixelLab) scale/outline/shading
// convention. 100% procedural placement authored by game-art; no AI generation, no PixelLab.
// Scale reference measured from phase2/art/scale-proof-v3-reanim/fixed/idle-s/frame_000.png:
// Guilmon v3 bbox = {minX:20,minY:16,maxX:44,maxY:47} -> height 32px, foot baseline y=47, cx=32.
'use strict';
const { Canvas } = require('./canvas.js');

const PALETTE = {
  ink: '#1c1a22',
  furHi: '#f4f8fc',
  furMid: '#cfdbe8',
  furLo: '#9fb0c4',
  furAO: '#70829a',
  stripeHi: '#7a66b8',
  stripe: '#5c4b96',
  stripeDk: '#3a2f63',
  hornHi: '#ffe17a',
  horn: '#f3b63a',
  hornDk: '#c6811a',
  pink: '#ff93bd',
  pinkDk: '#d4618f',
  eye: '#e23b3b',
  eyeDk: '#6e1414',
};

const W = 64, H = 64;

// --- scale to match Guilmon v3's envelope (height ~32px, foot baseline y~47-49) ---
const S = 0.68; // uniform scale from the original full-size design
const CX = 32; // horizontal pivot (design centerline)
const FOOT_Y = 49; // target foot baseline (Guilmon v3 = 47; Gabumon sits ~2px lower, stockier legs)
const OLD_FOOT_Y = 55; // foot baseline of the pre-scale design this was authored at
function sx(x) { return CX + (x - CX) * S; }
function sy(y) { return FOOT_Y + (y - OLD_FOOT_Y) * S; }
function sp(points) { return points.map(([x, y]) => [sx(x), sy(y)]); }

// ---- base geometry (south, rest pose), authored at full size then uniformly scaled. ----
const G = {
  headC: [sx(32), sy(28)], headR: [10 * S, 8.5 * S],
  torsoC: [sx(32), sy(41.5)], torsoR: [9.5 * S, 7.5 * S],
  hornBase: [sx(32), sy(20)], hornTip: [sx(31), sy(11)],
  earL: sp([[23, 21], [18, 25], [14, 34], [13, 43], [16, 46], [20, 40], [24, 27]]),
  earR: sp([[41, 21], [46, 25], [50, 34], [51, 43], [48, 46], [44, 40], [40, 27]]),
  tail: sp([[39, 46], [43, 44], [50, 48], [48, 53], [43, 52], [38, 49]]),
  footL: [sx(27), sy(51)], footR: [sx(37), sy(51)],
  pawL: [sx(22), sy(41)], pawR: [sx(42), sy(41)],
  footR_: 4 * S, pawR_: 3 * S,
  eyeL: [sx(26), sy(25)], eyeR: [sx(37), sy(25)],
  mouth: [sx(29), sx(35), sy(33)],
  stripes: {
    forehead: [[[28, 22], [30, 24]], [[36, 22], [34, 24]]],
    cheeks: [[[24, 29], [26, 31]], [[40, 29], [38, 31]]],
    flankHi: [[[23, 39], [25, 41]], [[41, 39], [39, 41]]],
    flankLo: [[[24, 46], [26, 48]], [[40, 46], [38, 48]]],
  },
  belly: [sx(32), sy(45.5), 4.2 * S, 3.2 * S],
};

function drawHorn(c, baseY, tipXY, sway = 0) {
  const [bx, by] = [G.hornBase[0] + sway, baseY];
  const [tx, ty] = [tipXY[0] + sway, tipXY[1]];
  const hw = 3 * S;
  c.polygon([[bx - hw, by], [bx + hw, by], [tx + 0.6, ty], [tx - 0.6, ty]], 'horn');
  c.polygon([[bx - hw, by], [bx - hw * 0.4, by - hw], [tx, ty], [tx - 0.6, ty]], 'hornHi');
  c.line(tx, ty, bx - hw * 0.7, by - 1, 'hornDk');
}

function drawEar(c, points, dx, dy, colorHi, colorMid) {
  const p = points.map(([x, y]) => [x + dx, y + dy]);
  c.polygon(p, colorMid);
  const hi = p.slice(0, 4);
  c.polygon(hi, colorHi);
  const tipPts = p.slice(2, 5);
  if (tipPts.length >= 3) c.polygon(tipPts, 'stripe');
}

function drawTail(c, dx, dy) {
  const p = G.tail.map(([x, y]) => [x + dx, y + dy]);
  c.polygon(p, 'horn');
  c.polygon([p[0], p[1], p[p.length - 1]], 'hornHi');
  c.line(p[2][0], p[2][1], p[3][0], p[3][1], 'hornDk');
}

function drawFoot(c, cx, cy, liftY, forwardX) {
  const fx = cx + forwardX, fy = cy - liftY;
  const rx = G.footR_, ry = rx * 0.75;
  c.ellipseShaded(fx, fy, rx, ry, { hi: 'hornHi', mid: 'horn', lo: 'hornDk', ao: 'hornDk' }, [-0.5, -0.7]);
  c.set(fx - rx * 0.5, fy + ry * 0.7, 'ink');
  c.set(fx + rx * 0.5, fy + ry * 0.7, 'ink');
}

function drawPaw(c, cx, cy) {
  const r = G.pawR_;
  c.ellipseShaded(cx, cy, r, r * 0.7, { hi: 'furHi', mid: 'furMid', lo: 'furLo' }, [-0.5, -0.7]);
  c.set(cx - r * 0.4, cy + r * 0.5, 'ink');
  c.set(cx + r * 0.4, cy + r * 0.5, 'ink');
}

function drawStripes(c, dx) {
  dx = dx || 0;
  for (const key of ['forehead', 'cheeks', 'flankHi', 'flankLo']) {
    const col = key === 'flankLo' || key === 'flankHi' ? 'stripeDk' : 'stripe';
    for (const [[x0, y0], [x1, y1]] of G.stripes[key]) {
      c.line(sx(x0) + dx, sy(y0), sx(x1) + dx, sy(y1), col);
    }
  }
}

function drawFace(c, blink, dx) {
  dx = dx || 0;
  const [exL, eyL] = G.eyeL, [exR, eyR] = G.eyeR;
  if (!blink) {
    c.set(exL + dx, eyL, 'eye'); c.set(exL + dx + 1, eyL, 'eyeDk');
    c.set(exR + dx, eyR, 'eye'); c.set(exR + dx + 1, eyR, 'eyeDk');
  } else {
    c.line(exL + dx, eyL + 0.5, exL + dx + 1, eyL + 0.5, 'ink');
    c.line(exR + dx, eyR + 0.5, exR + dx + 1, eyR + 0.5, 'ink');
  }
  c.line(G.mouth[0] + dx, G.mouth[2], G.mouth[1] + dx, G.mouth[2], 'ink');
}

function drawBelly(c, dx) {
  dx = dx || 0;
  const [bx, by, brx, bry] = G.belly;
  c.ellipseShaded(bx + dx, by, brx, bry, { hi: 'pink', mid: 'pink', lo: 'pinkDk', ao: 'pinkDk' }, [-0.5, -0.7]);
  c.ellipse(bx + dx, by, brx * 0.38, bry * 0.34, 'pinkDk');
}

// pose: { bodyBob, earSway, tailSway, legL:{lift,fwd}, legR:{lift,fwd}, blink }
// facing: 'S' (straight front) or 'SW' (3/4 turn toward camera-left/down)
function renderPose(pose, facing) {
  pose = pose || {};
  facing = facing || 'S';
  const turn = facing === 'SW' ? 1 : 0;
  const bob = (pose.bodyBob || 0) * S;
  const earSway = (pose.earSway || 0) * S;
  const tailSway = (pose.tailSway || 0) * S;
  const legL = pose.legL || { lift: 0, fwd: 0 };
  const legR = pose.legR || { lift: 0, fwd: 0 };

  const shiftX = -3 * S * turn;
  const farShrink = 2 * S * turn;
  const nearGrow = 1 * S * turn;
  const tailShiftX = 3 * S * turn, tailShiftY = -1 * S * turn;

  const back = new Canvas(W, H).usePalette(PALETTE);
  drawTail(back, tailSway + shiftX + tailShiftX, bob + tailShiftY);

  const legs = new Canvas(W, H).usePalette(PALETTE);
  drawFoot(legs, G.footL[0] + shiftX - nearGrow, G.footL[1], legL.lift * S, legL.fwd * S);
  drawFoot(legs, G.footR[0] + shiftX + farShrink, G.footR[1], legR.lift * S, legR.fwd * S);

  const ears = new Canvas(W, H).usePalette(PALETTE);
  drawEar(ears, G.earL, earSway + shiftX - nearGrow, bob, 'furHi', 'furMid');
  drawEar(ears, G.earR, -earSway + shiftX + farShrink, bob, 'furHi', 'furMid');

  const body = new Canvas(W, H).usePalette(PALETTE);
  const [hcx, hcy] = G.headC, [hrx, hry] = G.headR;
  const [tcx, tcy] = G.torsoC, [trx, try_] = G.torsoR;
  const lightDir = [-0.62 + 0.25 * turn, -0.78];
  body.ellipseShaded(hcx + shiftX, hcy + bob, hrx - farShrink * 0.3, hry, { hi: 'furHi', mid: 'furMid', lo: 'furLo', ao: 'furAO' }, lightDir);
  body.ellipseShaded(tcx + shiftX, tcy + bob, trx - farShrink * 0.3, try_, { hi: 'furHi', mid: 'furMid', lo: 'furLo', ao: 'furAO' }, lightDir);
  drawPaw(body, G.pawL[0] + shiftX - nearGrow, G.pawL[1] + bob);
  drawPaw(body, G.pawR[0] + shiftX + farShrink, G.pawR[1] + bob);
  drawStripes(body, shiftX);
  drawFace(body, pose.blink, shiftX);
  drawBelly(body, shiftX);

  const horn = new Canvas(W, H).usePalette(PALETTE);
  drawHorn(horn, G.hornBase[1] + bob, [G.hornTip[0] + shiftX, G.hornTip[1] + bob]);

  let flat = Canvas.composite([back, legs, ears, body, horn]);
  flat.usePalette(PALETTE);
  flat.autoOutline('ink');
  return flat;
}

function renderSouth(pose) { return renderPose(pose, 'S'); }
function renderSW(pose) { return renderPose(pose, 'SW'); }

module.exports = { PALETTE, renderSouth, renderSW, renderPose, W, H, G, S, FOOT_Y };
