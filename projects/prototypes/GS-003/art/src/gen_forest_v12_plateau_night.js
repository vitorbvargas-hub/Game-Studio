'use strict';
// GS-003 Map Factory -- forest-v12-plateau-night: pacote NOVO e paralelo a
// forest-v11-ground (que NAO e tocado/sobrescrito). Cobre as 2 pendencias
// de arte deixadas em V11_DEV.md (Limitacoes / proximos passos):
//   1. borda superior do plato do mirante (hoje o topo simplesmente "corta"
//      no ultimo tile de grama, sem lingua/transicao) -- um lip com
//      musgo/grama caindo por cima da borda, sombra de contato (a borda
//      le como "beirada", nao corte reto) e pecas de canto;
//   2. versao NOTURNA PINTADA (nao so o tint uniforme de grade que o
//      renderer ja aplica) da terra batida Wang-47 e do topo do mirante --
//      mesma tecnica de forest-v4 "noite pintada": paleta propria
//      (GROUND_NIGHT de forest_v4_palette.js, ja hand-picked e aprovada,
//      0 hex novo) passada pela MESMA formula de profundidade
//      (buildDepthRamps()/GF_SAT_MUL/GF_VAL_MUL) que forest-v8-depth
//      aplica ao dia -- nao um lerp/recolor em cima do PNG diurno (essa
//      tecnica ja foi usada nas copas em v11; aqui o pedido do
//      coordenador e especificamente terra+mirante "pintados", entao a
//      MESMA geometria (blob-47/blob-16) e repintada do zero com a rampa
//      noturna, como um artista pintaria os 2 presets).
//
// Run with: node art/src/gen_forest_v12_plateau_night.js
const fs = require('fs');
const path = require('path');
const { Canvas } = require('./canvas.js');
const { withAlpha, rng } = require('./endesga32.js');
const { buildDepthRamps, shiftRamp, shiftColor, hexOf, hexRamp } = require('./forest_v8_depth_palette.js');
const { withPreset } = require('./forest_v4_palette.js');
const { buildBlobTile } = require('./blob_autotile16.js');
const { buildBlobTile47, enumerateBlob47, blob47Index } = require('./blob_autotile47.js');
const { drawText } = require('./font5x3.js');
const { loadPNG } = require('./png_decode.js');

const TILE = 32;
const OUT = path.resolve(__dirname, '../map-factory/forest-v12-plateau-night');
const V11_DIR = path.resolve(__dirname, '../map-factory/forest-v11-ground');
const V9_DIR = path.resolve(__dirname, '../map-factory/forest-v9-cliffs');

function pngToCanvas(filePath) {
  const { width, height, data } = loadPNG(filePath);
  const c = new Canvas(width, height);
  Buffer.from(data.buffer, data.byteOffset, data.byteLength).copy(c.data);
  return c;
}
function pick(rnd, arr) { return arr[Math.floor(rnd() * arr.length)]; }
function forEachWrap(cx, cy, fn) {
  for (const ox of [-TILE, 0, TILE]) for (const oy of [-TILE, 0, TILE]) fn(cx + ox, cy + oy);
}

// ---------------------------------------------------------------------
// 0. Paletas dia + noite -- dia e EXATAMENTE a mesma d de forest-v11
//    (buildDepthRamps(), 0 recalculo). Noite e a MESMA formula (shiftRamp
//    com GF_SAT_MUL/GF_VAL_MUL etc., copiada linha a linha de
//    forest_v8_depth_palette.js buildDepthRamps()) aplicada a BASE
//    noturna (forest_v4_palette.js GROUND_NIGHT/FOLIAGE_NIGHT, ja
//    hand-picked e usada pela noite "pintada" de forest-v4 em vez da
//    aproximacao de grade) -- nenhum hex novo, so a base trocada de dia
//    pra noite, no mesmo ponto da cadeia onde forest-v8-depth troca
//    Endesga-32 puro pela rampa derivada.
const d = buildDepthRamps(); // dia (forest-v11 reusa isto sem recalcular)
const GF_SAT_MUL = 0.64, GF_VAL_MUL = 0.80, RIM_SAT_MUL = 0.88, RIM_VAL_MUL = 0.92;

function buildNightDepthRamps() {
  const base = withPreset(false); // forest-v4 NIGHT ramp (GROUND_NIGHT/FOLIAGE_NIGHT)
  const foliage = shiftRamp(base.foliage, { sMul: GF_SAT_MUL, vMul: GF_VAL_MUL });
  foliage[7] = shiftColor(base.foliage[7], { sMul: RIM_SAT_MUL, vMul: RIM_VAL_MUL });
  const grass = shiftRamp(base.ground.grass, { sMul: GF_SAT_MUL, vMul: GF_VAL_MUL });
  const dirt = shiftRamp(base.ground.dirt, { sMul: GF_SAT_MUL + 0.08, vMul: GF_VAL_MUL + 0.02 });
  const moss = shiftColor(base.ground.moss, { sMul: GF_SAT_MUL + 0.05, vMul: GF_VAL_MUL - 0.08, hueDeg: 8 });
  const stone = shiftRamp(base.ground.stone, { sMul: 0.92, vMul: GF_VAL_MUL + 0.02 });
  const mossEdge = shiftColor(base.ground.moss, { sMul: GF_SAT_MUL + 0.12, vMul: GF_VAL_MUL + 0.02, hueDeg: 10 });
  return { foliage, grass, dirt, moss, stone, mossEdge };
}
const dn = buildNightDepthRamps(); // noite -- mesmas chaves de `d` que este pacote usa (grass/dirt/stone/moss/mossEdge/foliage)

// ---------------------------------------------------------------------
// 1. Terra batida Wang-47 "pintada" dia/noite -- MESMA geometria de
//    forest-v11-ground (blob_autotile47.js, nao modificado), repintada do
//    zero com `dn` em vez de aplicar o GradeRule.night (tint uniforme) em
//    cima do PNG diurno -- o pedido explicito do coordenador e "versao
//    noturna PINTADA", nao mais um recolor por grade.
function dirtGrainFill(c, dirtRamp, stoneRamp, rnd) {
  c.fillRect(0, 0, TILE - 1, TILE - 1, dirtRamp[1]);
  for (let i = 0; i < 4; i++) {
    const bx = Math.round(rnd() * TILE), by = Math.round(rnd() * TILE), r = Math.round(4 + rnd() * 4);
    forEachWrap(bx, by, (x, y) => c.fillEllipse(x, y, r, Math.round(r * 0.55), withAlpha(dirtRamp[0], 90)));
    forEachWrap(bx - 1, by - 1, (x, y) => c.fillEllipse(x, y, Math.max(1, r - 2), Math.max(1, Math.round(r * 0.4)), withAlpha(dirtRamp[3] || dirtRamp[2], 110)));
  }
  for (let i = 0; i < Math.round(TILE * TILE * 0.12); i++) {
    const px = Math.floor(rnd() * TILE), py = Math.floor(rnd() * TILE);
    c.setPixel(px, py, rnd() < 0.5 ? dirtRamp[0] : dirtRamp[2]);
  }
  for (let i = 0; i < 3; i++) {
    const px = Math.floor(rnd() * TILE), py = Math.floor(rnd() * TILE);
    forEachWrap(px, py, (x, y) => {
      c.setPixel(x, y, stoneRamp[1]);
      if (rnd() < 0.5) c.setPixel(x + 1, y, withAlpha(stoneRamp[0], 180));
      c.blendPixel(x + 1, y + 1, withAlpha([0, 0, 0, 255], 70));
    });
  }
}
function clumpBlades(c, cx, cy, ramp5, rnd) {
  const n = 8 + Math.floor(rnd() * 6);
  const blades = [];
  for (let i = 0; i < n; i++) {
    const a = rnd() * Math.PI * 2, r = 3.4 * Math.sqrt(rnd());
    const bx = cx + Math.cos(a) * r, by = cy + Math.sin(a) * r * 0.7;
    const bh = 2 + Math.floor(rnd() * 3), lean = Math.round((rnd() - 0.5) * 2);
    const lit = -Math.cos(a) * 0.6 - Math.sin(a) * 0.85;
    let idx = Math.max(0, Math.min(4, Math.round(2 + lit * 2.15)));
    const tone = rnd() < 0.82 ? ramp5[idx] : ramp5[Math.max(0, idx - 1)];
    blades.push({ bx, by, bh, lean, tone, lit });
  }
  forEachWrap(cx + 1.4, cy + 1.6, (x, y) => c.fillEllipse(Math.round(x), Math.round(y), 3, 2, withAlpha(ramp5[0], 95)));
  blades.sort((p, q) => p.lit - q.lit);
  for (const b of blades) for (const ox of [-TILE, 0, TILE]) for (const oy of [-TILE, 0, TILE]) c.line(Math.round(b.bx + ox), Math.round(b.by + b.bh + oy), Math.round(b.bx + b.lean + ox), Math.round(b.by + oy), b.tone, 1);
  const brightest = blades.reduce((best, b) => (b.lit > best.lit ? b : best), blades[0]);
  if (brightest) forEachWrap(brightest.bx + brightest.lean, brightest.by, (x, y) => c.blendPixel(Math.round(x), Math.round(y), withAlpha(ramp5[4], 210)));
}
function groundClumpFill(c, ramp5, rnd, clusters) {
  c.fillRect(0, 0, TILE - 1, TILE - 1, ramp5[2]);
  const centers = [];
  for (let i = 0; i < clusters; i++) {
    const cx = rnd() * TILE, cy = rnd() * TILE;
    centers.push([cx, cy]);
    clumpBlades(c, cx, cy, ramp5, rnd);
  }
  for (let i = 0; i < 7; i++) {
    const px = Math.floor(rnd() * TILE), py = Math.floor(rnd() * TILE);
    if (centers.some(([cx, cy]) => Math.hypot(px - cx, py - cy) < 4)) continue;
    if (rnd() < 0.6) forEachWrap(px, py, (x, y) => c.fillEllipse(Math.round(x), Math.round(y), 1, 1, withAlpha(ramp5[0], 120)));
  }
}
function decorateBoundary(c, isBg, size, seed, grassRamp, foliageRamp, stoneRamp) {
  const rnd = rng(seed + 3000);
  const at = (x, y) => (x >= 0 && x < size && y >= 0 && y < size) ? isBg[y * size + x] : isBg[Math.max(0, Math.min(size - 1, y)) * size + Math.max(0, Math.min(size - 1, x))];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const v = at(x, y);
    const boundary = at(x + 1, y) !== v || at(x - 1, y) !== v || at(x, y + 1) !== v || at(x, y - 1) !== v;
    if (!boundary) continue;
    if (v === 1) {
      if (rnd() < 0.3) {
        let dx = 0, dy = 0;
        if (at(x + 1, y) !== v) dx = 1; else if (at(x - 1, y) !== v) dx = -1;
        if (at(x, y + 1) !== v) dy = 1; else if (at(x, y - 1) !== v) dy = -1;
        const len = 2 + Math.floor(rnd() * 3);
        c.line(x, y, x + dx * len, y + dy * len, rnd() < 0.5 ? foliageRamp[6] : foliageRamp[4], 1);
      }
    } else if (rnd() < 0.22) {
      c.fillEllipse(x, y, 1, 1, stoneRamp[rnd() < 0.5 ? 0 : 1]);
      c.blendPixel(x + 1, y + 1, withAlpha([0, 0, 0, 255], 90));
    }
  }
}
function grassDirtWang47SetPainted(seed, ramps) {
  const table = enumerateBlob47();
  const fg = (c, x0, y0, w, h) => { const rnd = rng(seed + 777); const sub = new Canvas(w, h); dirtGrainFill(sub, ramps.dirt, ramps.stone, rnd); c.blit(sub, x0, y0); };
  const bg = (c, x0, y0, w, h) => { const rnd = rng(seed + 778); const sub = new Canvas(w, h); groundClumpFill(sub, ramps.grass, rnd, 5); c.blit(sub, x0, y0); };
  const tiles = [];
  for (let i = 0; i < table.length; i++) {
    const { edgeMask, diagMask } = table[i];
    const { canvas, isBg } = buildBlobTile47(TILE, edgeMask, diagMask, ramps, seed + i * 23, fg, bg, { rOuter: Math.round(TILE * 0.4), rSingle: Math.round(TILE * 0.24), rConcave: Math.round(TILE * 0.17) });
    decorateBoundary(canvas, isBg, TILE, seed + i * 23, ramps.grass, ramps.foliage, ramps.stone);
    tiles.push({ index: i, edgeMask, diagMask, canvas });
  }
  return tiles;
}

// ---------------------------------------------------------------------
// 2. Topo do mirante "pintado" dia/noite -- MESMA geometria blob-16 de
//    forest-v11-ground (nao modificada), repintada com `dn`.
function wobbleProfile(seed, steps, amp) {
  const rnd = rng(seed);
  const prof = [];
  let v = 0;
  for (let i = 0; i < steps; i++) { v += (rnd() - 0.5) * 1.6; v = Math.max(-amp, Math.min(amp, v)); prof.push(v); }
  return prof;
}
function miranteTopFgPainted(c, x0, y0, w, h, ramps, seed) {
  const rnd = rng(seed);
  const g = ramps.grass;
  c.fillRect(x0, y0, x0 + w - 1, y0 + h - 1, g[2]);
  for (let i = 0; i < 5; i++) {
    const cx = x0 + 3 + Math.floor(rnd() * Math.max(1, w - 6)), cy = y0 + 3 + Math.floor(rnd() * Math.max(1, h - 6));
    c.fillEllipse(cx, cy, 4, 3, withAlpha(g[3], 120));
  }
  for (let i = 0; i < 40; i++) {
    const bx = x0 + 1 + Math.floor(rnd() * (w - 2)), by = y0 + 1 + Math.floor(rnd() * (h - 3));
    const lit = (bx + by) < 30;
    const tone = lit ? pick(rnd, [g[4], g[3]]) : pick(rnd, [g[0], g[1]]);
    c.setPixel(bx, by, tone);
    if (rnd() < 0.5) c.setPixel(bx, by + 1, tone);
  }
  const dirtPatches = 1 + (rnd() < 0.35 ? 1 : 0);
  for (let i = 0; i < dirtPatches; i++) {
    const cx = x0 + 6 + Math.floor(rnd() * Math.max(1, w - 12)), cy = y0 + 6 + Math.floor(rnd() * Math.max(1, h - 12));
    const rx = 3 + Math.floor(rnd() * 4), ry = 2 + Math.floor(rnd() * 3);
    c.fillEllipse(cx, cy, rx, ry, ramps.dirt[1]);
    c.fillEllipse(cx - 1, cy - 1, Math.max(1, rx - 2), Math.max(1, ry - 2), ramps.dirt[2]);
  }
  const rockClusters = 1 + (rnd() < 0.6 ? 1 : 0);
  for (let i = 0; i < rockClusters; i++) {
    const cx = x0 + 5 + Math.floor(rnd() * Math.max(1, w - 10)), cy = y0 + 5 + Math.floor(rnd() * Math.max(1, h - 10));
    for (let k = 0; k < 2 + Math.floor(rnd() * 2); k++) {
      const a = rnd() * Math.PI * 2, r = 2 + rnd() * 5;
      const px = Math.round(cx + Math.cos(a) * r), py = Math.round(cy + Math.sin(a) * r * 0.6);
      const rr = 2 + Math.floor(rnd() * 2);
      c.fillEllipse(px, py, rr, Math.max(1, rr - 1), ramps.stone[rnd() < 0.5 ? 0 : 1]);
      c.fillEllipse(px - 1, py - 1, Math.max(1, rr - 1), 1, ramps.stone[2]);
      c.fillEllipse(px, py - rr + 1, Math.max(1, rr - 1), 1, withAlpha(ramps.moss, 180));
      c.blendPixel(px + rr, py + 1, withAlpha([0, 0, 0, 255], 100));
    }
  }
  for (let i = 0; i < 3; i++) {
    const px = x0 + Math.floor(rnd() * w), py = y0 + Math.floor(rnd() * h);
    c.setPixel(px, py, ramps.stone[1]);
    if (rnd() < 0.4) c.setPixel(px + 1, py, withAlpha(ramps.stone[0], 180));
  }
  const prof = wobbleProfile(seed + 77, w, 4.2);
  for (let x = 0; x < w; x++) {
    const edgeY = y0 + h - 1 - Math.max(0, Math.round(2 + prof[x]));
    for (let y = edgeY; y < y0 + h; y++) if (rnd() < 0.55) c.setPixel(x0 + x, y, withAlpha(ramps.mossEdge, 170 + Math.floor(rnd() * 60)));
  }
  for (let i = 0; i < 7; i++) {
    const px = x0 + Math.floor(rnd() * w);
    const fo = ramps.foliage;
    c.line(px, y0 + h - 2, px + Math.round((rnd() - 0.5) * 3), y0 + h - 2 - (1 + Math.floor(rnd() * 4)), rnd() < 0.5 ? fo[4] : fo[3], 1);
  }
}
function miranteTopBgPainted(c, x0, y0, w, h, ramps, seed) {
  const rnd = rng(seed);
  const sub = new Canvas(w, h);
  groundClumpFill(sub, ramps.grass, rnd, 5);
  c.blit(sub, x0, y0);
}
function miranteTopBlobSetPainted(seed, ramps) {
  const tiles = {};
  for (let m = 0; m < 16; m++) tiles[m] = buildBlobTile(TILE, m, ramps, seed + m * 23, miranteTopFgPainted, miranteTopBgPainted, { rOuter: Math.round(TILE * 0.42), rSingle: Math.round(TILE * 0.26) });
  return tiles;
}

// ---------------------------------------------------------------------
// 3. Borda superior do plato (lip) -- o topo do mirante hoje (v9-cliffs +
//    v11-ground) so tem decoracao de borda no lado SUL (face/rampa/cantos
//    do penhasco, ja aprovados). O lado NORTE (fileira mais distante da
//    camera, onde o topo "acaba" sem nenhum penhasco visivel porque o jogo
//    e top-down/3-4 e nao desenha parede naquele lado) hoje so corta no
//    ultimo tile de grama -- pedido do coordenador. Este lip e um tile
//    DROP-IN (substitui a fileira norte do mirante_top_blob_*) com:
//      - sombra de contato: banda escura (alfa variavel, ramps.cliffFace
//        quando existir, senao preto translucido) nos ~4px do topo,
//        simulando a beirada vista de cima;
//      - musgo/grama caindo por cima da borda: tufos de ramps.mossEdge +
//        ramps.foliage pendendo PARA DENTRO do tile (y crescente), alguns
//        "pingando" mais fundo que outros (comprimento aleatorio por
//        seed) -- a leitura de "beirada vegetada", nao corte reto;
//      - 3 variantes retas (seeds diferentes) + 2 cantos externos
//        (esquerdo/direito), pra nenhuma fileira repetir identica nem
//        ficar quadrada na virada.
const LIP_H_BAND = 10; // altura da banda de sombra+musgo a partir do topo do tile
function paintLip(c, ramps, rnd, { cornerSide } = {}) {
  // sombra de contato -- gradiente de alfa nos primeiros px (mais escuro
  // junto a borda, dissolvendo pro verde do topo)
  for (let y = 0; y < LIP_H_BAND; y++) {
    const a = Math.round(170 * Math.max(0, 1 - y / LIP_H_BAND));
    if (a <= 2) continue;
    for (let x = 0; x < TILE; x++) c.blendPixel(x, y, withAlpha([6, 8, 14, 255], a));
  }
  // musgo/grama caindo -- tufos verticais com comprimento/posicao por rng,
  // mais densos (e mais compridos) perto da borda do canto quando houver.
  const tufts = 9 + Math.floor(rnd() * 4);
  for (let i = 0; i < tufts; i++) {
    const x = Math.floor(rnd() * TILE);
    const len = 3 + Math.floor(rnd() * 6);
    const mossy = rnd() < 0.6;
    const tone = mossy ? ramps.mossEdge : pick(rnd, [ramps.foliage[4], ramps.foliage[6]]);
    for (let k = 0; k < len; k++) {
      const yy = k;
      const xx = x + Math.round(Math.sin(k * 0.9 + x) * 0.8);
      if (yy >= TILE) break;
      c.blendPixel(xx, yy, withAlpha(tone, 230 - Math.round((k / len) * 140)));
    }
    // "pingo" de musgo na ponta, 1-2px, pra nao ler como lamina reta
    if (rnd() < 0.5) c.blendPixel(x, Math.min(TILE - 1, len), withAlpha(ramps.mossEdge, 200));
  }
  if (cornerSide) {
    // banda vertical na lateral externa do canto (oeste no canto
    // esquerdo, leste no direito), mesma tecnica da banda norte
    const vx0 = cornerSide === 'left' ? 0 : TILE - LIP_H_BAND;
    for (let x = 0; x < LIP_H_BAND; x++) {
      const px = cornerSide === 'left' ? vx0 + x : vx0 + (LIP_H_BAND - 1 - x);
      const a = Math.round(140 * Math.max(0, 1 - x / LIP_H_BAND));
      if (a <= 2) continue;
      for (let y = 0; y < TILE; y++) c.blendPixel(px, y, withAlpha([6, 8, 14, 255], a));
    }
  }
}
function mirantePlateauLip(ramps, seed, opts) {
  const c = new Canvas(TILE, TILE);
  const rnd = rng(seed);
  miranteTopBgPainted(c, 0, 0, TILE, TILE, ramps, seed + 1);
  paintLip(c, ramps, rnd, opts);
  return c;
}
function buildLipSet(ramps, seedBase) {
  return {
    straight_0: mirantePlateauLip(ramps, seedBase + 1),
    straight_1: mirantePlateauLip(ramps, seedBase + 2),
    straight_2: mirantePlateauLip(ramps, seedBase + 3),
    corner_outer_left: mirantePlateauLip(ramps, seedBase + 4, { cornerSide: 'left' }),
    corner_outer_right: mirantePlateauLip(ramps, seedBase + 5, { cornerSide: 'right' }),
  };
}

// ---------------------------------------------------------------------
// 4. Prancha de prova dia/noite, escala de jogo -- monta um mirante 8x5
//    com a fileira norte usando o lip (reta + 2 cantos) e o miolo com
//    mirante_top_blob_* (lido de forest-v11-ground, nao redesenhado),
//    terra batida Wang-47 (pintada, dia e noite) espalhada no chao em
//    volta, e a face/rampa/cantos REAIS de forest-v9-cliffs embaixo --
//    MESMA convencao de buildMiranteDemo de forest-v11-ground (le PNGs do
//    disco via pngToCanvas, nao reimplementa o penhasco).
function loadV11MiranteTiles() {
  const tiles = {};
  for (let m = 0; m < 16; m++) tiles[m] = pngToCanvas(path.join(V11_DIR, 'mirante', `mirante_top_blob_${m}.png`));
  return tiles;
}
function loadV11GroundTiles() {
  const tiles = [];
  for (let v = 0; v < 10; v++) tiles.push(pngToCanvas(path.join(V11_DIR, 'tiles', `ground_variant_${v}.png`)));
  return tiles;
}

const PLAT_COLS = 10, PLAT_ROWS = 6;
function platGrid() {
  return [
    '.########.',
    '##########',
    '##########',
    '##########',
    '##########',
    '.########.',
  ].map((row) => row.split('').map((ch) => ch === '#'));
}
function pathBitmaskGrid(grid, ROWS, COLS, tx, ty) {
  const at = (x, y) => (y >= 0 && y < ROWS && x >= 0 && x < COLS) ? grid[y][x] : false;
  let m = 0;
  if (at(tx, ty - 1)) m |= 1;
  if (at(tx + 1, ty)) m |= 2;
  if (at(tx, ty + 1)) m |= 4;
  if (at(tx - 1, ty)) m |= 8;
  return m;
}
function buildPlateauScene(isNight, v11Mirante, v11Ground, lipSet, wangTiles) {
  const grid = platGrid();
  const COLS = Math.max(...grid.map((r) => r.length)), ROWS = grid.length;
  const W_px = COLS * TILE, H_px = (ROWS + 2) * TILE;
  const scene = new Canvas(W_px, H_px);
  const rnd = rng(isNight ? 88002 : 88001);
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      if (!grid[ty][tx]) { scene.blit(pick(rnd, v11Ground), tx * TILE, ty * TILE); continue; }
      const northOpen = ty === 0 || !grid[ty - 1][tx];
      if (northOpen) {
        let tile;
        if (tx > 0 && (!grid[ty][tx - 1])) tile = lipSet.corner_outer_left;
        else if (tx < COLS - 1 && (!grid[ty][tx + 1])) tile = lipSet.corner_outer_right;
        else tile = pick(rnd, [lipSet.straight_0, lipSet.straight_1, lipSet.straight_2]);
        scene.blit(tile, tx * TILE, ty * TILE);
      } else {
        const m = pathBitmaskGrid(grid, ROWS, COLS, tx, ty);
        scene.blit(v11Mirante[m], tx * TILE, ty * TILE);
      }
    }
  }
  // terra batida pintada espalhada no chao em volta (2 manchas pequenas)
  const DIRT_SPOTS = [[1, 7], [8, 8]];
  for (const [cx, cy] of DIRT_SPOTS) {
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const tx = cx + dx, ty = cy + dy;
      if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS + 2) continue;
      const edge = (dx === 0 && dy === 0) ? 15 : 0; // centro cheio; vizinhos usam a peca "solta" (index 0, edgeMask 0) so pra mostrar o tom
      const idx = (dx === 0 && dy === 0) ? 46 : 0; // 46 = centro totalmente cercado (todas arestas+diagonais terra); 0 = celula solta
      scene.blit(wangTiles[idx], tx * TILE, ty * TILE);
    }
  }
  // face/rampa/cantos REAIS de forest-v9-cliffs por baixo (nao redesenhados)
  const faceA = pngToCanvas(path.join(V9_DIR, 'tiles', 'cliff_face_a.png'));
  const faceB = pngToCanvas(path.join(V9_DIR, 'tiles', 'cliff_face_b.png'));
  const faceC = pngToCanvas(path.join(V9_DIR, 'tiles', 'cliff_face_c.png'));
  const ramp = pngToCanvas(path.join(V9_DIR, 'tiles', 'cliff_ramp.png'));
  const cornerL = pngToCanvas(path.join(V9_DIR, 'tiles', 'cliff_face_corner_outer_left.png'));
  const cornerR = pngToCanvas(path.join(V9_DIR, 'tiles', 'cliff_face_corner_outer_right.png'));
  const faceRow = [cornerL, faceA, faceB, faceC, ramp, faceB, faceA, faceC, faceB, cornerR];
  for (let tx = 0; tx < COLS; tx++) scene.blit(faceRow[tx % faceRow.length], tx * TILE, ROWS * TILE);
  const groundRnd = rng(909);
  for (let tx = 0; tx < COLS; tx++) scene.blit(pick(groundRnd, v11Ground), tx * TILE, (ROWS + 1) * TILE);
  return scene;
}

function buildProofSheet(day, night) {
  const gap = 16, labelH = 12;
  const W_px = Math.max(day.w, night.w) + 16;
  const H_px = 24 + labelH + day.h + gap + labelH + night.h + 10;
  const sheet = new Canvas(W_px, H_px);
  sheet.fillRect(0, 0, sheet.w - 1, sheet.h - 1, [12, 12, 20, 255]);
  let y = 6;
  drawText(sheet, 'FOREST-V12-PLATEAU-NIGHT -- PROVA DIA/NOITE, ESCALA DE JOGO (32PX)', 8, y, [255, 230, 120, 255]); y += 16;
  drawText(sheet, 'DIA -- lip (musgo/sombra de contato/cantos) + terra Wang-47 pintada + mirante top', 8, y, [160, 255, 180, 255]); y += labelH;
  sheet.blit(day, 8, y); y += day.h + gap;
  drawText(sheet, 'NOITE -- MESMA geometria repintada com GROUND_NIGHT (nao e tint de grade)', 8, y, [160, 200, 255, 255]); y += labelH;
  sheet.blit(night, 8, y);
  return sheet;
}

function buildPreviewSheet(sections) {
  const pad = 6;
  let y = 24;
  let maxW = 0;
  const rows = [];
  for (const sec of sections) {
    const scale = sec.scale || 2;
    const rowH = Math.max(...sec.items.map((it) => it.canvas.h * scale)) + 14;
    rows.push({ sec, y, scale });
    let rowW = 8;
    for (const it of sec.items) rowW += it.canvas.w * scale + pad;
    maxW = Math.max(maxW, rowW);
    y += rowH + 10;
  }
  const sheet = new Canvas(maxW + 16, y + 10);
  sheet.fillRect(0, 0, sheet.w - 1, sheet.h - 1, [12, 12, 20, 255]);
  drawText(sheet, 'FOREST-V12-PLATEAU-NIGHT', 8, 6, [255, 230, 120, 255]);
  for (const row of rows) {
    drawText(sheet, row.sec.title, 8, row.y, [200, 210, 230, 255]);
    let x = 8;
    const itemsY = row.y + 10;
    for (const it of row.sec.items) { sheet.blit(it.canvas.scaleNearest(row.scale), x, itemsY); x += it.canvas.w * row.scale + pad; }
  }
  return sheet;
}

function main() { require('./gen_forest_v12_plateau_night_main.js').run(module.exports); }
module.exports = {
  TILE, OUT, V11_DIR, V9_DIR, d, dn,
  grassDirtWang47SetPainted, miranteTopBlobSetPainted, buildLipSet,
  loadV11MiranteTiles, loadV11GroundTiles, buildPlateauScene, buildProofSheet, buildPreviewSheet,
  pngToCanvas, hexOf, hexRamp,
};
if (require.main === module) main();
