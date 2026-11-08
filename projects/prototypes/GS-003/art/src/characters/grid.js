'use strict';
// GS-003 character creator — shared character-matrix utilities.
//
// Every shape in this package (body/hair/clothing, any direction, any frame)
// is authored as a `CharMatrix`: an array of rows, each row an array of
// [startX, endX, token] spans across a FRAME_W-wide grid. Rendering walks the
// matrix and calls `Canvas.setPixel()` once per cell — this file and every
// file under characters/ intentionally never calls `Canvas.fillRect`,
// `fillEllipse`, `fillCircle` or `fillPolygon` (ADR-009: the founder rejected
// the earlier parametric-shape pipeline; `pilot_model_sheet.js` set the
// precedent this package follows at full character scale).
const { Canvas } = require('../canvas.js');

const FRAME_W = 32;
const FRAME_H = 40;
// Pivot = feet/ground contact point (SPRITE_SPECIFICATION.md convention).
const PIVOT = { x: 16, y: 35 };

// center-symmetric span helper: halfWidth=w around the x=15.5 centerline.
// e.g. sym(3) -> [13,18], sym(9) -> [7,24]. Used so hand-authored rows read
// as "how wide is the silhouette here" instead of raw left/right numbers.
function sym(w) {
  return [16 - w, 15 + w];
}

// Build a CharMatrix (2D token array, FRAME_H x FRAME_W) from a sparse row
// map: { y: [[x0,x1,token], ...] }. Unset cells stay null (transparent).
function buildMatrix(rowSpans) {
  const m = [];
  for (let y = 0; y < FRAME_H; y++) m.push(new Array(FRAME_W).fill(null));
  for (const yStr of Object.keys(rowSpans)) {
    const y = Number(yStr);
    if (y < 0 || y >= FRAME_H) continue;
    for (const [x0, x1, token] of rowSpans[y]) {
      for (let x = x0; x <= x1; x++) {
        if (x < 0 || x >= FRAME_W) continue;
        m[y][x] = token;
      }
    }
  }
  return m;
}

// Shallow-clone a matrix so a base pose can be reused and locally edited per
// frame (e.g. shifting a leg) without mutating the shared base.
function cloneMatrix(m) {
  return m.map((row) => row.slice());
}

// Set a single cell on an existing matrix (used for per-frame leg/arm
// offsets and single-pixel features like eyes/buttons).
function setCell(m, x, y, token) {
  if (x < 0 || x >= FRAME_W || y < 0 || y >= FRAME_H) return;
  m[y][x] = token;
}

function clearCell(m, x, y) {
  if (x < 0 || x >= FRAME_W || y < 0 || y >= FRAME_H) return;
  m[y][x] = null;
}

// Move every non-null cell of one row left/right (used for walk-cycle leg
// stepping without re-authoring the whole leg shape per frame).
function shiftRow(m, y, dx) {
  if (y < 0 || y >= FRAME_H) return;
  const src = m[y];
  const dst = new Array(FRAME_W).fill(null);
  for (let x = 0; x < FRAME_W; x++) {
    if (src[x] == null) continue;
    const nx = x + dx;
    if (nx >= 0 && nx < FRAME_W) dst[nx] = src[x];
  }
  m[y] = dst;
}

// Move an [yFrom,yTo] band of rows down/up by dy rows (used to raise/lower a
// foot or bob the whole silhouette for idle breathing).
function shiftBand(m, yFrom, yTo, dy) {
  if (dy === 0) return m;
  const band = [];
  for (let y = yFrom; y <= yTo; y++) band.push(m[y] ? m[y].slice() : new Array(FRAME_W).fill(null));
  for (let y = yFrom; y <= yTo; y++) m[y] = new Array(FRAME_W).fill(null);
  for (let i = 0; i < band.length; i++) {
    const ny = yFrom + i + dy;
    if (ny >= 0 && ny < FRAME_H) m[ny] = band[i];
  }
  return m;
}

// Render a CharMatrix to a Canvas using a token->rgba palette map. Unknown
// tokens stay transparent (lets layers share one matrix shape while only
// painting the tokens that belong to them, if ever needed).
function render(matrix, paletteMap) {
  const c = new Canvas(FRAME_W, FRAME_H);
  for (let y = 0; y < FRAME_H; y++) {
    for (let x = 0; x < FRAME_W; x++) {
      const token = matrix[y][x];
      if (!token) continue;
      const color = paletteMap[token];
      if (!color) continue;
      c.setPixel(x, y, color);
    }
  }
  return c;
}

// Flat, hand-specified ground-contact shadow band (not an ellipse formula) --
// same technique as pilot_model_sheet.js's addGroundShadow, sized for the
// character frame's feet.
function addGroundShadow(c, ink) {
  const bands = [
    { y: PIVOT.y, x0: 12, x1: 19, a: 70 },
    { y: PIVOT.y + 1, x0: 10, x1: 21, a: 45 },
  ];
  for (const b of bands) {
    for (let x = b.x0; x <= b.x1; x++) {
      c.blendPixel(x, b.y, [ink[0], ink[1], ink[2], b.a]);
    }
  }
}

module.exports = {
  FRAME_W, FRAME_H, PIVOT,
  sym, buildMatrix, cloneMatrix, setCell, clearCell, shiftRow, shiftBand,
  render, addGroundShadow,
};
