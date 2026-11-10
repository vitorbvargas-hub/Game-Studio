'use strict';
// GS-003 Map Factory -- forest-v9-cliffs (penhasco/barranco organico v2).
//
// Pedido direto do founder via game-studio: o mirante elevado da clareira
// piloto (quality-overhaul, phase3) ainda le como uma "laje" cinza -- face
// retangular, pedra lisa em blocos, borda reta, zero vegetacao. Referencia
// de direcao: Drakantos (evidence/drakantos-video) tem falesias com camadas
// de rocha, raizes, musgo pendurado e contorno irregular. Este pacote
// SUBSTITUI o kit de penhasco de forest-v8-depth (tiles/cliff_*) por uma
// versao organica -- forest-v8-depth NAO e tocado, continua intacto; este
// e um pacote NOVO e paralelo (o resto de v8 -- chao, decalques, props
// emissores, clutter, NPCs -- continua a melhor fonte para essas coisas,
// so o penhasco e refeito aqui).
//
// 100% pipeline local (mesmo Canvas.js + blob_autotile16.js ja usados por
// forest-v4/v6/v7/v8): 0 geracoes do PixelLab gastas. Reaproveita a paleta
// de forest-v8-depth (buildDepthRamps) sem inventar hex novo -- "3-4 tons
// da paleta forest-v8, roxo-acinzentado e frio" e literalmente d.cliffFace
// {hi, lt, mid, dk, core} + d.mossEdge dessa mesma rampa.
//
// Run with: node art/src/gen_forest_v9_cliffs.js
const fs = require('fs');
const path = require('path');
const { Canvas } = require('./canvas.js');
const { W, withAlpha, rng } = require('./endesga32.js');
const { buildBlobTile } = require('./blob_autotile16.js');
const { buildDepthRamps } = require('./forest_v8_depth_palette.js');
const { drawText } = require('./font5x3.js');

const TILE = 32;
const OUT = path.resolve(__dirname, '../map-factory/forest-v9-cliffs');
const d = buildDepthRamps(); // same forest-v8-depth ramps: cliffTop, cliffFace{hi,lt,mid,dk,core}, mossEdge, foliage, bark, grass

function pick(rnd, arr) { return arr[Math.floor(rnd() * arr.length)]; }

// =========================================================================
// Shared helpers
// =========================================================================

// A deterministic per-row/per-column "wobble" profile -- a clamped random
// walk with occasional larger jumps ("chips") -- used everywhere a straight
// line needs to read as broken/weathered rock instead of a ruler-straight
// cut. This is the one new primitive this kit adds to the shared toolkit
// (kept local to this file, not pushed into blob_autotile16.js, which stays
// untouched for forest-v8).
function wobbleProfile(seed, steps, amp) {
  const rnd = rng(seed);
  const out = [];
  let x = 0;
  for (let i = 0; i < steps; i++) {
    x += (rnd() - 0.5) * 2.0;
    x = Math.max(-amp, Math.min(amp, x));
    if (rnd() < 0.08) x += (rnd() - 0.5) * amp * 1.5; // occasional chip/break
    out.push(x);
  }
  return out;
}

function groundBase(c, rnd) {
  const g = d.grass;
  c.fillRect(0, 0, TILE - 1, TILE - 1, g[2]);
  for (let i = 0; i < 5; i++) {
    const cx = 3 + Math.floor(rnd() * (TILE - 6)), cy = 3 + Math.floor(rnd() * (TILE - 6));
    c.fillEllipse(cx, cy, 4, 3, withAlpha(g[3], 120));
  }
  for (let i = 0; i < 40; i++) {
    const bx = 1 + Math.floor(rnd() * (TILE - 2)), by = 1 + Math.floor(rnd() * (TILE - 3));
    const lit = (bx + by) < 30;
    const tone = lit ? pick(rnd, [g[4], g[3]]) : pick(rnd, [g[0], g[1]]);
    c.setPixel(bx, by, tone);
    if (rnd() < 0.5) c.setPixel(bx, by + 1, tone);
  }
}

// Hanging grass tuft, blade strokes starting near y0 and drooping down --
// used both at the top of cliff_top tiles (overhang) and at the top rows
// of cliff_face pieces (the "borda caindo pela face" read).
function grassTuftDown(c, cx, y0, d_, rnd, count, maxLen) {
  const g = d_.foliage;
  for (let i = 0; i < count; i++) {
    const bx = cx + Math.round((rnd() - 0.5) * 10);
    const bh = 3 + Math.floor(rnd() * maxLen);
    const lean = Math.round((rnd() - 0.5) * 3);
    const tone = rnd() < 0.5 ? g[5] : g[3];
    c.line(bx, y0, bx + lean, y0 + bh, tone, 1);
    if (rnd() < 0.4) c.line(bx + 1, y0, bx + 1 + lean, y0 + bh - 1, withAlpha(g[2], 200), 1);
  }
}

// Drooping moss strand -- a teardrop made of shrinking ellipses, growing
// DOWN from (cx, y0) -- the "musgo pendurado" read, distinct from forest-v8's
// round ground moss_patch (that one sits flat on the ground, this one hangs).
function mossDrip(c, cx, y0, len, d_, rnd) {
  const steps = Math.max(3, Math.round(len / 3));
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const y = y0 + Math.round(t * len);
    const rx = Math.max(1, Math.round(2.4 * (1 - t * 0.7)));
    const wob = Math.round(Math.sin(t * 6 + cx) * 1.2);
    c.fillEllipse(cx + wob, y, rx, 2, withAlpha(d_.moss, Math.round(210 * (1 - t * 0.3))));
    if (rnd() < 0.5) c.setPixel(cx + wob - 1, y, d_.mossEdge);
  }
}

// Thin root/vine tendril draping from the top, branching once -- distinct
// from forest-v8's stampRootTendril (which grows FROM the ground up); this
// one grows DOWN from a cliff edge like a hanging root breaking through soil.
function rootTendrilDown(c, x0, y0, len, d_, rnd, angleBias = 0) {
  const bark = d_.bark;
  let x = x0, y = y0, angle = Math.PI / 2 + angleBias;
  const branchAt = 3 + Math.floor(rnd() * Math.max(1, len / 6 - 2));
  for (let i = 0; i < len / 3; i++) {
    angle += (rnd() - 0.5) * 0.45;
    const nx = x + Math.cos(angle) * 2.2, ny = y + Math.sin(angle) * 3.0;
    c.line(x, y, nx, ny, bark.dk, 1);
    if (i === branchAt) rootTendrilDown(c, x, y, len * 0.5, d_, rnd, angleBias + (rnd() < 0.5 ? -0.6 : 0.6));
    x = nx; y = ny;
  }
}

function stampRubble(c, cx, cy, d_, rnd, count) {
  const f = d_.cliffFace;
  for (let i = 0; i < count; i++) {
    const a = rnd() * Math.PI * 2, r = 2 + rnd() * 8;
    const px = Math.round(cx + Math.cos(a) * r), py = Math.round(cy + Math.sin(a) * r * 0.5);
    const rr = 1 + Math.floor(rnd() * 2);
    c.fillEllipse(px, py, rr, Math.max(1, rr - 1), rnd() < 0.5 ? f.lt : f.mid);
    c.setPixel(px - 1, py - 1, f.hi);
    c.blendPixel(px + 1, py + rr, withAlpha([0, 0, 0, 255], 90));
  }
}

// =========================================================================
// 1. Cliff TOP (16-tile blob autotile, same geometry as forest-v8/v4/v6 --
//    blob_autotile16.js is NOT modified) -- the organic read comes from the
//    fg/bg textures passed in, not from the shared corner-rounding math.
// =========================================================================
function cliffTopFg(c, x0, y0, w, h, _ramp, seed) {
  const rnd = rng(seed);
  const top = d.cliffTop;
  c.fillRect(x0, y0, x0 + w - 1, y0 + h - 1, top[1]);
  for (let i = 0; i < Math.round(w * h * 0.12); i++) {
    const px = x0 + Math.floor(rnd() * w), py = y0 + Math.floor(rnd() * h);
    c.setPixel(px, py, rnd() < 0.5 ? top[0] : top[2]);
  }
  for (let i = 0; i < 5; i++) {
    const px = x0 + Math.floor(rnd() * w * 0.7), py = y0 + Math.floor(rnd() * h * 0.7);
    c.setPixel(px, py, top[3]);
  }
  // crumbling south edge: jittered moss/soil scatter, denser than v8, plus
  // a handful of grass blades poking past the edge (continues onto the
  // face piece placed one cell below -- see grassTuftDown there).
  const prof = wobbleProfile(seed + 77, w, 3);
  for (let x = 0; x < w; x++) {
    const edgeY = y0 + h - 1 - Math.max(0, Math.round(2 + prof[x]));
    for (let y = edgeY; y < y0 + h; y++) {
      if (rnd() < 0.5) c.setPixel(x0 + x, y, withAlpha(d.mossEdge, 170 + Math.floor(rnd() * 60)));
    }
  }
  for (let i = 0; i < 6; i++) {
    const px = x0 + Math.floor(rnd() * w);
    const g = d.foliage;
    c.line(px, y0 + h - 2, px + Math.round((rnd() - 0.5) * 2), y0 + h - 2 - (1 + Math.floor(rnd() * 3)), rnd() < 0.5 ? g[4] : g[3], 1);
  }
}

function cliffTopBg(c, x0, y0, w, h, _ramp, seed) {
  const rnd = rng(seed);
  const sub = new Canvas(w, h);
  groundBase(sub, rnd);
  c.blit(sub, x0, y0);
}

function cliffTopBlobSet(seed) {
  const tiles = {};
  for (let m = 0; m < 16; m++) {
    tiles[`cliff_top_blob_${m}`] = buildBlobTile(TILE, m, d, seed + m * 23, cliffTopFg, cliffTopBg, { rOuter: Math.round(TILE * 0.42), rSingle: Math.round(TILE * 0.26) });
  }
  return tiles;
}

// =========================================================================
// 2. Cliff FACE -- 4 variants, each 3-4 tons of d.cliffFace (hi/lt/mid/dk +
//    core for the base shadow), horizontal rock courses + fissures (same
//    base technique as forest-v8-depth's cliffFaceStraight), THEN layered
//    with: grass tufts drooping from the top edge, 1-2 drooping moss
//    strands, 0-1 hanging root tendril, rubble + jagged contact shadow at
//    the base. This is what makes the edge/base read organic instead of a
//    clean rectangular cut.
// =========================================================================
function cliffFaceBase(seed, bandSeedOffset, crackDensity) {
  const c = new Canvas(TILE, TILE);
  const f = d.cliffFace;
  const rnd = rng(seed);
  c.fillRect(0, 0, TILE - 1, TILE - 1, f.mid);
  c.fillRect(0, 0, TILE - 1, 2, f.hi);
  c.fillRect(0, 3, TILE - 1, 3, f.lt);
  // horizontal rock courses -- band heights vary per variant via bandSeedOffset
  const bandRnd = rng(seed + bandSeedOffset);
  let y = 5;
  while (y < TILE - 9) {
    const bandH = 4 + Math.floor(bandRnd() * 4);
    const tone = bandRnd() < 0.5 ? f.lt : f.mid;
    const bandEnd = Math.min(TILE - 10, y + bandH);
    c.fillRect(0, y, TILE - 1, bandEnd, tone);
    c.fillRect(0, Math.min(TILE - 9, bandEnd + 1), TILE - 1, Math.min(TILE - 9, bandEnd + 1), f.dk);
    y = bandEnd + 2;
  }
  // vertical fissure streaks, density varies per variant
  for (let yy = 5; yy < TILE - 9; yy++) {
    if (rnd() < 0.5 * crackDensity) c.setPixel(Math.round(TILE * 0.2) + Math.floor(rnd() * 2), yy, f.dk);
    if (rnd() < 0.45 * crackDensity) c.setPixel(Math.round(TILE * 0.56) + Math.floor(rnd() * 2), yy, f.dk);
    if (rnd() < 0.28) c.setPixel(Math.round(TILE * 0.38), yy, f.hi);
    if (rnd() < 0.22 * crackDensity) c.setPixel(Math.round(TILE * 0.82), yy, f.dk);
  }
  return { c, f, rnd };
}

function cliffFaceVariant(letter, seed) {
  const bandSeedOffset = { a: 500, b: 900, c: 1300, d: 1700 }[letter];
  const crackDensity = { a: 1.0, b: 1.3, c: 0.7, d: 1.1 }[letter];
  const { c, f, rnd } = cliffFaceBase(seed, bandSeedOffset, crackDensity);

  // -- irregular top edge: grass tufts drooping over + 1-2 moss drips --
  grassTuftDown(c, 10, 0, d, rnd, 3, 7);
  grassTuftDown(c, 22, 0, d, rnd, 3, 6);
  mossDrip(c, letter === 'b' ? 6 : 26, 0, 9 + Math.floor(rnd() * 7), d, rnd);
  if (letter === 'c' || letter === 'd') mossDrip(c, 16, 0, 7 + Math.floor(rnd() * 5), d, rnd);

  // -- hanging root (only on 2 of the 4 variants, so a run of cells reads
  //    as "some of this wall has exposed roots", not a repeating carpet) --
  if (letter === 'a' || letter === 'd') {
    rootTendrilDown(c, letter === 'a' ? 20 : 11, 0, 16 + Math.floor(rnd() * 8), d, rnd, (rnd() - 0.5) * 0.4);
  }

  // -- mid-face feature: variant c gets a lichen/moss patch off the top
  //    edge (crevice damp spot), variant b gets a small ledge outcrop so
  //    silhouettes differ, not just the surface decoration --
  if (letter === 'c') {
    c.fillEllipse(24, 14, 4, 3, withAlpha(d.moss, 170));
    c.fillEllipse(23, 13, 2, 2, withAlpha(d.mossEdge, 160));
  }
  if (letter === 'b') {
    c.fillRect(0, 16, 6, 19, f.hi);
    c.fillRect(0, 19, 6, 20, f.core);
  }

  // -- jagged contact shadow at the base (study item #4, baked here since
  //    the face tile IS the base) -- the shadow's own top edge wobbles per
  //    column instead of a dead-straight line, and a few rock chips sit at
  //    the foot. --
  const shadowProf = wobbleProfile(seed + 3001, TILE, 2);
  for (let x = 0; x < TILE; x++) {
    const topY = TILE - 7 + Math.round(shadowProf[x]);
    c.fillRect(x, topY, x, TILE - 1, f.dk);
    c.fillRect(x, Math.min(TILE - 1, topY + 4), x, TILE - 1, f.core);
  }
  stampRubble(c, 8, TILE - 3, d, rnd, 3);
  stampRubble(c, 24, TILE - 2, d, rnd, 2);
  for (let i = 0; i < 6; i++) {
    const px = Math.floor(rnd() * TILE);
    c.setPixel(px, TILE - 2, withAlpha(d.mossEdge, 190));
  }
  return c;
}

// =========================================================================
// 3. Corners -- broken/irregular fracture line instead of a straight
//    diagonal fold (v8's approach), via wobbleProfile per row.
// =========================================================================
function cliffFaceCornerOuter(seed, side) {
  const c = cliffFaceVariant('a', seed);
  const f = d.cliffFace;
  const baseFold = side === 'left' ? Math.round(TILE * 0.6) : Math.round(TILE * 0.4);
  const prof = wobbleProfile(seed + (side === 'left' ? 4001 : 4002), TILE, 4);
  for (let y = 3; y < TILE; y++) {
    const foldX = baseFold + Math.round(prof[y]);
    for (let x = 0; x < TILE; x++) {
      const past = side === 'left' ? x > foldX : x < foldX;
      if (past) c.blendPixel(x, y, withAlpha(f.dk, 90));
    }
    c.setPixel(foldX, y, f.core);
    c.setPixel(foldX + (side === 'left' ? -1 : 1), y, withAlpha(f.hi, 150));
    if ((y + seed) % 9 === 0) c.setPixel(foldX + (side === 'left' ? 1 : -1), y, f.dk); // chip notch
  }
  return c;
}

function cliffFaceCornerInner(seed) {
  const c = cliffFaceVariant('c', seed);
  const f = d.cliffFace;
  const rnd = rng(seed + 5001);
  const prof = wobbleProfile(seed + 5002, 360, 3);
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const dx = x - TILE / 2, dy = y - TILE / 2;
      const ang = Math.atan2(dy, dx);
      const idx = Math.floor(((ang + Math.PI) / (2 * Math.PI)) * 359);
      const dist = Math.hypot(dx, dy) - prof[idx] * 0.6;
      if (dist < TILE * 0.3) c.blendPixel(x, y, withAlpha(f.core, Math.round(130 * (1 - Math.max(0, dist) / (TILE * 0.3)))));
    }
  }
  // moss collects in the damp crevice
  c.fillEllipse(TILE / 2, TILE / 2 - 2, 3, 3, withAlpha(d.moss, 160));
  stampRubble(c, TILE / 2, TILE / 2 + 4, d, rnd, 3);
  return c;
}

// =========================================================================
// 4. Natural stone ramp/staircase -- uneven steps, moss on treads, grass
//    growing between, instead of v8's clean rectangular steps.
// =========================================================================
function cliffRamp(seed) {
  const c = new Canvas(TILE, TILE);
  const rnd = rng(seed);
  const f = d.cliffFace;
  const sub = new Canvas(TILE, TILE);
  groundBase(sub, rnd);
  c.blit(sub, 0, 0);
  const steps = 3;
  const bottomY = TILE - 9;
  let stepY = bottomY;
  for (let s = 0; s < steps; s++) {
    const stagger = Math.round((rnd() - 0.5) * 3);
    const treadH = 4 + Math.floor(rnd() * 3);
    const y0 = stepY - treadH;
    if (y0 < 0) break;
    const x0 = 2 + Math.max(0, stagger), x1 = TILE - 3 - Math.max(0, -stagger);
    c.fillRect(x0, y0, x1, stepY, f.lt);
    c.fillRect(x0, stepY - 1, x1, stepY, f.dk);
    c.fillRect(x0, y0, x1, y0, f.hi);
    // moss on the tread edge + a grass tuft growing out of the step seam
    if (rnd() < 0.7) c.fillEllipse(x0 + 2 + Math.floor(rnd() * (x1 - x0 - 3)), y0 + 1, 2, 1, withAlpha(d.moss, 170));
    if (rnd() < 0.6) grassTuftDown(c, x0 + Math.floor(rnd() * (x1 - x0)), y0, d, rnd, 1, 4);
    stepY = y0 - 2;
  }
  c.fillRect(0, 0, 2, TILE - 1, f.mid);
  c.fillRect(TILE - 3, 0, TILE - 1, TILE - 1, f.mid);
  stampRubble(c, 4, TILE - 4, d, rnd, 2);
  return c;
}

// =========================================================================
// 5. Standalone decals -- scatter over ANY face piece for extra variety
//    (same "decal over tile" convention as forest-v8-depth's ground
//    decals), not baked into every single tile so repeats stay bearable.
// =========================================================================
function decalRootVine(seed, variant) {
  const w = 12, h = 28;
  const c = new Canvas(w, h);
  const rnd = rng(seed + variant * 71);
  rootTendrilDown(c, w / 2, 0, h - 3, d, rnd, variant === 0 ? -0.2 : 0.3);
  // small leaf flecks along the vine (cipo, not bare root)
  for (let i = 0; i < 6; i++) {
    const py = 4 + Math.floor(rnd() * (h - 8));
    const px = Math.round(w / 2 + (rnd() - 0.5) * 5);
    c.fillEllipse(px, py, 2, 1, withAlpha(d.foliage[3], 210));
  }
  return c;
}

function decalMossDripStandalone(seed) {
  const w = 10, h = 24;
  const c = new Canvas(w, h);
  const rnd = rng(seed);
  mossDrip(c, w / 2, 0, h - 3, d, rnd);
  return c;
}

function decalGrassTuftEdge(seed) {
  const w = 16, h = 10;
  const c = new Canvas(w, h);
  const rnd = rng(seed);
  grassTuftDown(c, w / 2 - 3, 0, d, rnd, 2, 6);
  grassTuftDown(c, w / 2 + 3, 0, d, rnd, 2, 7);
  return c;
}

// =========================================================================
// Preview sheet
// =========================================================================
function buildPreviewSheet(sections) {
  const pad = 6;
  let y = 24;
  let maxW = 0;
  const rows = [];
  for (const sec of sections) {
    const scale = sec.scale || 3;
    const rowH = Math.max(...sec.items.map((it) => it.canvas.h * scale)) + 14;
    rows.push({ sec, y, scale });
    let rowW = 8;
    for (const it of sec.items) rowW += it.canvas.w * scale + pad;
    maxW = Math.max(maxW, rowW);
    y += rowH + 10;
  }
  const sheet = new Canvas(maxW + 16, y + 10);
  sheet.fillRect(0, 0, sheet.w - 1, sheet.h - 1, [12, 12, 20, 255]);
  drawText(sheet, 'FOREST-V9-CLIFFS', 8, 6, [220, 190, 255, 255]);
  for (const row of rows) {
    drawText(sheet, row.sec.title, 8, row.y, [200, 210, 230, 255]);
    let x = 8;
    const itemsY = row.y + 10;
    for (const it of row.sec.items) {
      sheet.blit(it.canvas.scaleNearest(row.scale), x, itemsY);
      x += it.canvas.w * row.scale + pad;
    }
  }
  return sheet;
}

// =========================================================================
// Comparison mockup: "ANTES" (laje atual, reconstruida esquematicamente a
// partir da descricao/captura do mirante -- blocos lisos retos sem
// vegetacao) vs "DEPOIS" (este kit), 8 colunas x 3 linhas cada metade.
// =========================================================================
function oldMiranteSchematic() {
  // Flat smooth gray-blue panel blocks, dead-straight seams, no autotile
  // rounding, no vegetation, flat shadow line -- matches the mirante as it
  // reads today in p7_clareira_depois_v9p7_dia.png (dark blue-gray banded
  // wall, straight top/bottom, no texture variance, one stray bush is the
  // ONLY vegetation and it's clearly foreign to the wall itself).
  const capCol = [58, 62, 72, 255];
  const bodyCol = [40, 44, 54, 255];
  const bodyColAlt = [36, 40, 50, 255];
  const seamCol = [24, 26, 34, 255];
  const baseCol = [28, 30, 38, 255];
  const rows = [];
  for (let col = 0; col < 8; col++) {
    const top = new Canvas(TILE, TILE);
    top.fillRect(0, 0, TILE - 1, TILE - 1, capCol);
    top.fillRect(0, TILE - 2, TILE - 1, TILE - 1, [50, 54, 64, 255]);
    top.fillRect(TILE - 1, 0, TILE - 1, TILE - 1, seamCol); // straight seam, every tile identical
    const body = new Canvas(TILE, TILE);
    body.fillRect(0, 0, TILE - 1, TILE - 1, col % 2 === 0 ? bodyCol : bodyColAlt);
    body.fillRect(0, 0, TILE - 1, 1, [50, 54, 64, 255]);
    body.fillRect(TILE - 1, 0, TILE - 1, TILE - 1, seamCol);
    const base = new Canvas(TILE, TILE);
    base.fillRect(0, 0, TILE - 1, TILE - 1, baseCol);
    base.fillRect(0, TILE - 4, TILE - 1, TILE - 1, [18, 19, 26, 255]); // flat straight shadow line
    base.fillRect(TILE - 1, 0, TILE - 1, TILE - 1, seamCol);
    rows.push([top, body, base]);
  }
  return rows;
}

function newMiranteAssembly(topTiles, faces, ramp) {
  const topMasks = [3, 11, 11, 11, 11, 11, 11, 9]; // outer-left corner ... outer-right corner, flat run between
  const faceRow = [
    'corner_outer_left', 'b', 'a', 'c', 'd', 'b', 'ramp', 'corner_outer_right',
  ];
  const groundRnd = rng(42);
  const groundRow = [];
  for (let i = 0; i < 8; i++) {
    const g = new Canvas(TILE, TILE);
    groundBase(g, groundRnd);
    groundRow.push(g);
  }
  const topRow = topMasks.map((m) => topTiles[`cliff_top_blob_${m}`]);
  const faceRowCanvas = faceRow.map((key) => {
    if (key === 'ramp') return ramp;
    if (key === 'corner_outer_left') return faces.cornerOuterLeft;
    if (key === 'corner_outer_right') return faces.cornerOuterRight;
    return faces[key];
  });
  return [topRow, faceRowCanvas, groundRow];
}

function buildComparisonMockup(topTiles, faces, ramp) {
  const oldRows = oldMiranteSchematic(); // [col][row] -> canvas
  const newRows = newMiranteAssembly(topTiles, faces, ramp); // [row][col] -> canvas

  const gap = 40;
  const labelH = 20;
  const halfW = TILE * 8;
  const totalW = halfW * 2 + gap + 16;
  const totalH = labelH + TILE * 3 + 10;
  const sheet = new Canvas(totalW, totalH);
  sheet.fillRect(0, 0, sheet.w - 1, sheet.h - 1, [14, 14, 22, 255]);
  drawText(sheet, 'ANTES - LAJE ATUAL', 8, 6, [255, 150, 150, 255]);
  drawText(sheet, 'DEPOIS - FOREST-V9-CLIFFS', halfW + gap + 8, 6, [160, 255, 180, 255]);

  for (let col = 0; col < 8; col++) {
    for (let row = 0; row < 3; row++) {
      sheet.blit(oldRows[col][row], 8 + col * TILE, labelH + row * TILE);
    }
  }
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      sheet.blit(newRows[row][col], 8 + halfW + gap + col * TILE, labelH + row * TILE);
    }
  }
  return sheet;
}

// =========================================================================
// tileset.json / license.json / README.md
// =========================================================================
function hexOf(c) { return '#' + [c[0], c[1], c[2]].map((v) => v.toString(16).padStart(2, '0')).join(''); }
function hexRamp(arr) { return arr.map(hexOf); }

function paletteJson() {
  return {
    biome: 'forest-v9-cliffs',
    note: 'NENHUM hex novo -- esta paleta e uma copia direta (nao um re-derive) da rampa "cliff" de forest-v8-depth/palette.json (buildDepthRamps() em forest_v8_depth_palette.js), citada aqui em forma de arquivo soh para forest-v9-cliffs ser auto-contido e nao depender de abrir forest-v8-depth/ pra saber as cores. "3-4 tons roxo-acinzentados e frios" pedido na tarefa = cliffFace.{hi,lt,mid,dk} abaixo (core e a sombra de contato quase-preta, nao um 5o tom de rocha). foliage/bark/mossEdge tambem reaproveitados de v8, usados aqui so para a vegetacao (tufos, musgo, raizes) desenhada sobre a face.',
    ramps: {
      cliff: {
        top: hexRamp(d.cliffTop),
        face: { hi: hexOf(d.cliffFace.hi), lt: hexOf(d.cliffFace.lt), mid: hexOf(d.cliffFace.mid), dk: hexOf(d.cliffFace.dk), core: hexOf(d.cliffFace.core) },
        mossEdge: hexOf(d.mossEdge),
      },
      foliageDepth: hexRamp(d.foliage),
      barkDepth: { hi: hexOf(d.bark.hi), lt: hexOf(d.bark.lt), mid: hexOf(d.bark.mid), dk: hexOf(d.bark.dk), core: hexOf(d.bark.core) },
      grass: hexRamp(d.grass),
      moss: hexOf(d.moss),
    },
    source: 'art/src/forest_v8_depth_palette.js buildDepthRamps() -- ver esse arquivo para a derivacao HSV completa a partir de forest_v4_palette.js.',
  };
}

function tilesetJson() {
  const cliffNote = 'Mesma geometria compartilhada de autotile blob-16 de forest-v4/v6/v7/v8 (blob_autotile16.js, NAO modificado por este pacote). O topo usa o mesmo bitmask N*1+E*2+S*4+W*8 com cantos em quarto-de-circulo; o que muda aqui e so a textura dentro de cada celula (borda sul com musgo/grama espalhados por ruido) e as PECAS da face, que agora sao 4 variantes (nao 1) e tem vegetacao/raizes/sombra organica desenhadas em cada uma. Regra de posicionamento igual a v8: onde o bit S (bit 2) do cliff_top_blob for 0, colocar UMA das 4 variantes de face (ou um canto, se for extremidade) uma celula abaixo, na layer "cliff-face"; cliff_ramp.png em qualquer vao da fileira para o jogador subir.';
  return {
    biome: 'forest-v9-cliffs',
    note: 'Kit de penhasco/barranco organico v2 -- SUBSTITUI apenas o sub-kit cliff_* de forest-v8-depth (que continua intacto e e a melhor fonte para chao, decalques, props emissores, clutter e NPCs). Pedido do founder: o mirante da clareira piloto lia como laje cinza lisa, sem variacao nem vegetacao -- ver README.md para a comparacao lado a lado. NAO esta integrado em prototype/world -- isso e trabalho de game-dev. 0 PixelLab generations gastas -- pipeline 100% local Canvas.js.',
    tile: TILE,
    grid: { tileWidth: TILE, tileHeight: TILE },
    layers: ['ground', 'cliff-face', 'cliff-face-decal', 'decor'],
    palette: 'Ver palette.json -- reaproveita INTEGRALMENTE a rampa cliff de forest-v8-depth/palette.json (d.cliffFace hi/lt/mid/dk/core + d.mossEdge + d.foliage + d.bark via buildDepthRamps()), nenhum hex novo foi inventado. "3-4 tons roxo-acinzentados e frios" = cliffFace.{hi,lt,mid,dk} + core para a sombra de contato.',
    cliff: {
      note: cliffNote,
      topAutotile: {
        pattern: '16-tile blob, geometria compartilhada em blob_autotile16.js (identica a forest-v8); textura da celula reescrita aqui para borda sul irregular (musgo + grama por ruido).',
        files: Array.from({ length: 16 }, (_, m) => `tiles/cliff_top_blob_${m}.png`),
      },
      facePieces: [
        { file: 'tiles/cliff_face_a.png', collision: true, suggestedLayer: 'cliff-face', variant: 'a', note: 'estratos padrao + raiz pendurada; use junto com b/c/d para variar a parede, nao sozinha' },
        { file: 'tiles/cliff_face_b.png', collision: true, suggestedLayer: 'cliff-face', variant: 'b', note: 'estratos + fissuras mais densas + pequena saliencia/ressalto na base esquerda (silhueta muda, nao so a textura)' },
        { file: 'tiles/cliff_face_c.png', collision: true, suggestedLayer: 'cliff-face', variant: 'c', note: 'estratos + mancha de liquen/musgo a meia-altura (fenda umida) -- a unica variante com musgo fora da borda superior' },
        { file: 'tiles/cliff_face_d.png', collision: true, suggestedLayer: 'cliff-face', variant: 'd', note: 'estratos + raiz pendurada (segunda posicao) -- junto com "a", cobre o caso "parede com raizes expostas" sem repetir a mesma raiz' },
        { file: 'tiles/cliff_face_corner_outer_left.png', collision: true, suggestedLayer: 'cliff-face', note: 'canto convexo, fratura irregular (nao diagonal reta) -- plataforma vira para a esquerda' },
        { file: 'tiles/cliff_face_corner_outer_right.png', collision: true, suggestedLayer: 'cliff-face', note: 'canto convexo, espelho do esquerdo' },
        { file: 'tiles/cliff_face_corner_inner.png', collision: true, suggestedLayer: 'cliff-face', note: 'canto concavo, fratura irregular + musgo acumulado na fenda (concavidades retem umidade -- leitura organica, nao so geometrica)' },
        { file: 'tiles/cliff_ramp.png', collision: false, suggestedLayer: 'cliff-face', interactive: false, note: 'escada de pedra natural -- degraus desalinhados, musgo na borda dos degraus, grama crescendo na fresta; coloque em qualquer vao da fileira de face' },
      ],
    },
    decals: {
      note: 'Overlays transparentes para espalhar por ruido SOBRE qualquer peca de face (das 4 variantes ou os cantos), mesma convencao dos decalques de chao de forest-v8-depth -- nao sao obrigatorios, adicionam variedade extra sem precisar de mais pecas base.',
      cliffFace: [
        { file: 'decals/root_vine_a.png', size: '12x28', note: 'cipo/raiz pendurado com flecks de folha -- variante A' },
        { file: 'decals/root_vine_b.png', size: '12x28', note: 'cipo/raiz pendurado com flecks de folha -- variante B, angulo espelhado' },
        { file: 'decals/moss_drip_extra.png', size: '10x24', note: 'musgo pendurado avulso, para alem do que ja esta cozido nas variantes b/c que tem musgo' },
        { file: 'decals/grass_tuft_edge.png', size: '16x10', note: 'tufo de grama extra para a borda superior, reforcar a leitura "borda nunca e reta" em fileiras longas' },
      ],
    },
  };
}

function licenseJson() {
  return {
    biome: 'forest-v9-cliffs',
    layer: 'original',
    assets: [
      {
        group: 'palette.json (reaproveitada de forest-v8-depth) + 16 cliff_top_blob + 4 variantes de face + 3 cantos + 1 rampa + 4 decalques',
        origin: 'game-art, 100% pipeline local, 2026-11-10',
        layer: 'original',
        author: 'game-art',
        technique: 'Canvas.js pixel matrix (fillEllipse/fillRect/fillPolygon/line/blendPixel) + a geometria compartilhada de autotile blob-16 (blob_autotile16.js, reaproveitada sem alteracao) + um novo primitivo local (wobbleProfile, random-walk clampado com "chips" ocasionais) para bordas/fraturas organicas, nao adicionado ao modulo compartilhado. Paleta: 100% reaproveitada de forest_v8_depth_palette.js (nenhum hex novo), que por sua vez e um deslocamento HSV documentado de forest_v4_palette.js. Sem geracao do PixelLab e sem arte de terceiros referenciada pixel a pixel.',
        styleReference: 'docs/DRAKANTOS_VISUAL_STUDY.md + evidence/drakantos-video/t0150_estrada_carroca_lanterna.png (direcao de estilo -- falesia em camadas, raizes, musgo pendurado, contorno irregular -- citado por numero/descricao, nenhum pixel copiado do frame).',
        license: 'studio-original (GS-003 fan game, ADR-007/ADR-009) -- referencias de terceiros (Drakantos) informaram so a direcao de composicao/organicidade, per ADR-010/011 Secao 5, nao estes pixels especificos.',
      },
    ],
    verifiedAt: new Date().toISOString().slice(0, 10),
    verifiedBy: 'game-art',
  };
}

function readmeMd() {
  return `# forest-v9-cliffs — penhasco/barranco organico v2 (Map Factory, 2026-11-10)

Pedido direto, via game-studio: na clareira piloto (branch \`quality-overhaul\`, capturas em
\`projects/prototypes/GS-003/quality-overhaul/phase3/img/p7_clareira_depois_v9p7_*.png\`), o mirante
elevado ainda le como uma **laje cinza** -- face retangular, pedra lisa em blocos, borda reta, zero
vegetacao (confirmado visualmente no canto superior-esquerdo de \`p7_clareira_depois_v9p7_dia.png\`: uma
faixa cinza-azulada lisa com costuras retas identicas, um unico arbusto estranho ao muro e a UNICA
vegetacao visivel). Direcao pedida: Drakantos tem barrancos organicos -- camadas de rocha, raizes, musgo
pendurado, contorno irregular (\`evidence/drakantos-video/t0150_estrada_carroca_lanterna.png\` como
referencia de ESTILO/composicao, nao um frame literal de penhasco -- o video nao tem um close de falesia
nos 6 frames capturados neste repo; a direcao veio da descricao do pedido).

**Este pacote SUBSTITUI so o sub-kit \`cliff_*\` de \`forest-v8-depth\`** (chao, decalques, props emissores,
clutter e NPCs de v8 continuam sendo a melhor fonte -- nao foram tocados, \`forest-v8-depth/\` nao foi
sobrescrito). **100% pipeline local** (Canvas.js, mesma convencao de v4/v6/v7/v8): **0 geracoes do
PixelLab gastas** -- o saldo da conta nao foi usado (ver \`shared/tools/map-factory/logs/pixellab-usage.csv\`
se existir uma linha de registro; nada foi debitado porque nenhuma chamada de API foi feita).

## O que tem aqui

- **\`palette.json\`** — reaproveita INTEGRALMENTE a rampa \`cliff\` de \`forest-v8-depth/palette.json\`
  (\`cliffFace.{hi,lt,mid,dk,core}\` + \`mossEdge\` + \`foliage\`/\`bark\` para vegetacao/raizes) -- nenhum hex
  novo. "3-4 tons roxo-acinzentados e frios" pedido na tarefa e literalmente essa rampa, ja derivada por
  deslocamento HSV de \`forest_v4_palette.js\` com um \`hueDeg\` que puxa pro frio/azulado.
- **\`tiles/cliff_top_blob_0..15.png\`** — topo, MESMA geometria de autotile blob-16 compartilhada (N/E/S/W,
  cantos em quarto-de-circulo) de \`forest-v4/v6/v7/v8\` -- \`blob_autotile16.js\` **nao foi modificado**. A
  borda sul (onde a face comeca) ganhou musgo/grama espalhados por ruido em vez da textura lisa de v8.
- **\`tiles/cliff_face_a/b/c/d.png\`** — **4 variantes** de face (pedido minimo: 3), cada uma com
  estratos de rocha em 3-4 tons + fissuras com densidade propria + UMA combinacao diferente de
  tufo-de-grama-pendurado / musgo-pendurado / raiz-pendurada / ressalto de rocha, para a parede nao
  repetir pedra identica a cada 32px. Sombra de contato forte na base, com a linha do topo da sombra
  JITTERED por coluna (nao reta) e detritos/pedregulhos espalhados no pe.
- **\`tiles/cliff_face_corner_outer_left/right.png\`**, **\`cliff_face_corner_inner.png\`** — cantos externo e
  interno com **fratura irregular** (random-walk clampado por linha, com "lascas" ocasionais) em vez do
  corte diagonal reto de v8; o canto interno acumula musgo na fenda.
- **\`tiles/cliff_ramp.png\`** — escada de pedra natural: degraus com leve desalinhamento horizontal entre
  si, musgo na borda de alguns degraus, grama crescendo na fresta -- continua 100% andavel
  (\`collision: false\`), so a leitura visual mudou.
- **\`decals/root_vine_a/b.png\`**, **\`decals/moss_drip_extra.png\`**, **\`decals/grass_tuft_edge.png\`** —
  4 overlays transparentes (cipo/raiz com flecks de folha, musgo pendurado avulso, tufo de grama extra)
  para espalhar por ruido sobre QUALQUER peca de face, mesma convencao dos decalques de chao de v8 --
  reforca variedade sem precisar de mais pecas base.
- **\`preview.png\`** — prancha com topo (16), as 4 faces, os 3 cantos, a rampa e os 4 decalques.
- **\`mirante_comparison.png\`** — montagem simulada **8x3**, lado a lado: ANTES (reconstrucao esquematica
  da laje atual -- blocos lisos cinza-azulados, costuras retas identicas, sombra reta, zero vegetacao,
  **nao** uma captura real editada, so uma recriacao fiel da descricao/leitura visual) vs DEPOIS (este
  kit montado: topo autotile com cantos arredondados + 4 variantes de face + os 2 cantos externos + a
  rampa + chao de grama embaixo).
- \`tileset.json\` / \`license.json\` — mesmo schema de forest-v4/v6/v7/v8.

## O que o game-dev precisa fazer

1. **Trocar as referencias do mirante/penhasco** que hoje apontam para a laje atual (ou para
   \`forest-v8-depth/tiles/cliff_*\`, se for o caso) por este kit -- \`forest-v8-depth\` continua valendo
   para tudo que NAO e penhasco.
2. **Autotile do topo**: ler o bit S do \`cliff_top_blob\` como em v8; colocar uma das 4 variantes de face
   (escolha aleatoria/por ruido -- nao ha regra de qual variante usar onde, sao intercambiaveis) OU um
   canto nas extremidades, uma celula abaixo, na layer \`cliff-face\`.
3. **Decalques opcionais**: estampar 0-1 dos 4 decalques de \`decals/\` sobre uma peca de face escolhida
   por ruido, para parede mais longa nao ficar repetitiva so com as 4 variantes base.
4. **Colisao**: como sempre neste pipeline, \`collision\` vem de \`tileset.json\` por arquivo -- hitbox e
   trabalho do game-dev.

## Limitacoes (autocritica, como diretor de arte)

- **Ainda e um kit de 1 nivel, 4 variantes de face + 3 cantos + 1 rampa -- nao autotile completo da
  face.** O topo e autotile de verdade (16 pecas, mesma geometria que o resto do pipeline ja usa havia
  tempo); a face continua sendo "escolha entre N pecas discretas", so que N subiu de 1 (v8) pra 4, mais
  decalques. Um contorno MUITO irregular (varias reentrancias seguidas, ilhas isoladas) ainda pode
  expor a repeticao -- nao testado num mapa real com geometria assim.
- **A "irregularidade" da borda e da fratura dos cantos e um random-walk clampado (\`wobbleProfile\`), nao
  uma silhueta de rocha desenhada a mao.** Funciona bem pra quebrar a leitura "ruler-straight" que era o
  problema relatado, mas um escultor de pixel art dedicado desenharia quebras mais deliberadas
  (fissuras que seguem a direcao do estrato, por exemplo) em vez de ruido generico.
  **Honesto: comparado a uma falesia pintada a mao (tipo a referencia de composicao do estilo
  Drakantos), este kit ainda e claramente proceduralmente gerado de perto -- resolve o problema
  relatado (laje lisa sem vegetacao) mas nao e arte pintada a mao peca a peca.**
- **\`mirante_comparison.png\` e uma RECONSTRUCAO ESQUEMATICA do "antes", nao a captura real editada.**
  Fiz a leitura visual (blocos lisos cinza-azulados, costuras retas, sem vegetacao) direto da captura
  \`p7_clareira_depois_v9p7_dia.png\` (inspecionada com um crop local, sem Pillow disponivel neste
  ambiente -- usei o decoder PNG puro-Node do proprio pipeline, \`art/src/png_decode.js\`), mas nao
  recortei/editei o PNG real da captura -- seria preciso o asset fonte do mirante (nao encontrado como
  arquivo isolado, so dentro da composicao final da cena) pra fazer um "antes" pixel-identico.
- **Referencia Drakantos (\`evidence/drakantos-video/t0150_*\`) e um unico frame de estrada/carroca, NAO
  um close de falesia.** Os 6 frames capturados neste repo (\`evidence/drakantos-video/\`) nao incluem
  nenhum penhasco visivel -- a direcao "camadas de rocha, raizes, musgo pendurado, contorno irregular"
  veio da descricao do pedido, nao de um frame especifico que eu pude conferir pixel a pixel. Se existir
  um frame de barranco do Drakantos em outro lugar do estudo (\`docs/DRAKANTOS_VISUAL_STUDY.md\`), vale
  o game-studio apontar pra ca numa proxima rodada pra eu comparar de perto.
- **Nada disto foi testado no motor real**, so inspecionado visualmente via \`preview.png\` e
  \`mirante_comparison.png\`.
- **0 geracoes do PixelLab usadas** -- o pipeline local se mostrou suficiente outra vez; o saldo (quase
  zerado, por isso o pedido explicito de nao gastar) continua intocado.

## Veredito do diretor

Resolve o problema relatado -- a laje deixa de ser lisa/reta/sem vegetacao, ganha estratos, musgo
pendurado, raizes, cantos quebrados e uma escada organica, na mesma paleta fria de v8. Mas e um kit
procedural de 4 variantes + decalques, nao pintura a mao peca a peca -- de perto, ainda vai ler como
"gerado", so que agora gerado-organico em vez de gerado-laje. Recomendo integrar e avaliar no mapa real
antes de decidir se vale um proximo passo (passe manual nas 4 faces, ou mais variantes) -- sem gastar
PixelLab agora que o saldo esta baixo.
`;
}

// =========================================================================
// main
// =========================================================================
function main() {
  fs.mkdirSync(path.join(OUT, 'tiles'), { recursive: true });
  fs.mkdirSync(path.join(OUT, 'decals'), { recursive: true });

  const seed = 90210;
  const topTiles = cliffTopBlobSet(seed);
  for (const [name, c] of Object.entries(topTiles)) c.save(path.join(OUT, 'tiles', `${name}.png`));

  const faceA = cliffFaceVariant('a', seed + 1);
  const faceB = cliffFaceVariant('b', seed + 2);
  const faceC = cliffFaceVariant('c', seed + 3);
  const faceD = cliffFaceVariant('d', seed + 4);
  faceA.save(path.join(OUT, 'tiles', 'cliff_face_a.png'));
  faceB.save(path.join(OUT, 'tiles', 'cliff_face_b.png'));
  faceC.save(path.join(OUT, 'tiles', 'cliff_face_c.png'));
  faceD.save(path.join(OUT, 'tiles', 'cliff_face_d.png'));

  const cornerOuterLeft = cliffFaceCornerOuter(seed + 5, 'left');
  const cornerOuterRight = cliffFaceCornerOuter(seed + 6, 'right');
  const cornerInner = cliffFaceCornerInner(seed + 7);
  cornerOuterLeft.save(path.join(OUT, 'tiles', 'cliff_face_corner_outer_left.png'));
  cornerOuterRight.save(path.join(OUT, 'tiles', 'cliff_face_corner_outer_right.png'));
  cornerInner.save(path.join(OUT, 'tiles', 'cliff_face_corner_inner.png'));

  const ramp = cliffRamp(seed + 8);
  ramp.save(path.join(OUT, 'tiles', 'cliff_ramp.png'));

  const rootVineA = decalRootVine(seed + 9, 0);
  const rootVineB = decalRootVine(seed + 10, 1);
  const mossDripExtra = decalMossDripStandalone(seed + 11);
  const grassTuftEdge = decalGrassTuftEdge(seed + 12);
  rootVineA.save(path.join(OUT, 'decals', 'root_vine_a.png'));
  rootVineB.save(path.join(OUT, 'decals', 'root_vine_b.png'));
  mossDripExtra.save(path.join(OUT, 'decals', 'moss_drip_extra.png'));
  grassTuftEdge.save(path.join(OUT, 'decals', 'grass_tuft_edge.png'));

  const preview = buildPreviewSheet([
    { title: 'TOP (16 blob)', items: Array.from({ length: 16 }, (_, m) => ({ canvas: topTiles[`cliff_top_blob_${m}`] })), scale: 2 },
    { title: 'FACE VARIANTS (a/b/c/d)', items: [faceA, faceB, faceC, faceD].map((c) => ({ canvas: c })), scale: 3 },
    { title: 'CORNERS + RAMP', items: [cornerOuterLeft, cornerOuterRight, cornerInner, ramp].map((c) => ({ canvas: c })), scale: 3 },
    { title: 'DECALS', items: [rootVineA, rootVineB, mossDripExtra, grassTuftEdge].map((c) => ({ canvas: c })), scale: 3 },
  ]);
  preview.save(path.join(OUT, 'preview.png'));

  const comparison = buildComparisonMockup(topTiles, { a: faceA, b: faceB, c: faceC, d: faceD, cornerOuterLeft, cornerOuterRight }, ramp);
  comparison.save(path.join(OUT, 'mirante_comparison.png'));

  fs.writeFileSync(path.join(OUT, 'palette.json'), JSON.stringify(paletteJson(), null, 2));
  fs.writeFileSync(path.join(OUT, 'tileset.json'), JSON.stringify(tilesetJson(), null, 2));
  fs.writeFileSync(path.join(OUT, 'license.json'), JSON.stringify(licenseJson(), null, 2));
  fs.writeFileSync(path.join(OUT, 'README.md'), readmeMd());

  console.log('forest-v9-cliffs written to', OUT);
}

main();
