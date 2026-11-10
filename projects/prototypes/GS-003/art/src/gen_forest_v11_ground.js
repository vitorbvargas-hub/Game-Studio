'use strict';
// GS-003 Map Factory -- forest-v11-ground: chao com relevo/contraste real,
// autotile grama<->terra com cantos internos (Wang/blob-47), copas night/
// das 4 especies, manchas macro com alfa corrigido, e topo de mirante
// vegetado (substitui a laje cinza).
//
// Pedido do coordenador sobre forest-v10-ground-trees (branch
// quality-overhaul, commit 1e8f7f1, integrado no jogo): "a melhora e real,
// mas sutil. O chao ainda le plano, e o topo do mirante continua uma laje
// cinza com uma faixa verde retangular." 5 itens tecnicos pedidos pro
// game-art; este pacote cobre os 5, SEM PixelLab (100% pipeline local
// Canvas.js, mesma convencao de v4..v10) e SEM sobrescrever
// forest-v10-ground-trees/forest-v9-cliffs (pacote novo e paralelo,
// "master" -- os dois anteriores continuam intocados e sao a melhor fonte
// pras arvores/penhasco que este pacote nao reescreve).
//
// Run with: node art/src/gen_forest_v11_ground.js
const fs = require('fs');
const path = require('path');
const { Canvas } = require('./canvas.js');
const { withAlpha, rng } = require('./endesga32.js');
const { buildDepthRamps, shiftRamp, shiftColor, hexOf, hexRamp } = require('./forest_v8_depth_palette.js');
const { withPreset } = require('./forest_v4_palette.js');
const { paintCanopyPuffs, rimDarken } = require('./forest_v4_props.js');
const { buildBlobTile } = require('./blob_autotile16.js');
const { buildBlobTile47, enumerateBlob47, blob47Index } = require('./blob_autotile47.js');
const { drawText } = require('./font5x3.js');
const { loadPNG } = require('./png_decode.js');

const TILE = 32;
const OUT = path.resolve(__dirname, '../map-factory/forest-v11-ground');
const V10_DIR = path.resolve(__dirname, '../map-factory/forest-v10-ground-trees');
const V9_DIR = path.resolve(__dirname, '../map-factory/forest-v9-cliffs');
const d = buildDepthRamps(); // same forest-v8/v9/v10 ramps: grass, dirt, foliage, bark, moss, mossEdge, stone, cliffTop, cliffFace

function pick(rnd, arr) { return arr[Math.floor(rnd() * arr.length)]; }
function pngToCanvas(filePath) {
  const { width, height, data } = loadPNG(filePath);
  const c = new Canvas(width, height);
  Buffer.from(data.buffer, data.byteOffset, data.byteLength).copy(c.data);
  return c;
}

function forEachWrap(cx, cy, fn) {
  for (const ox of [-TILE, 0, TILE]) {
    for (const oy of [-TILE, 0, TILE]) fn(cx + ox, cy + oy);
  }
}

// =========================================================================
// 0. Paleta -- 0 hex novo. GRASS_A/B/SHADE recalculados aqui com a MESMA
//    formula de forest-v10-ground-trees (shiftRamp sobre d.grass) porque
//    gen_forest_v10_ground_trees.js nao exporta essas constantes (so roda
//    como script) -- mesma convencao ja documentada em blob_autotile16.js
//    ("reimplemented inline because the v4 version isn't exported").
//    NIGHT_FOLIAGE e a rampa de copa-noturna: FOLIAGE_NIGHT de
//    forest_v4_palette.js (ja usada pela noite "pintada" de forest-v4, nao
//    uma aproximacao de grade) passada pelos MESMOS multiplicadores que
//    forest_v8_depth_palette.js's buildDepthRamps() aplica ao dia
//    (GF_SAT_MUL=0.64, GF_VAL_MUL=0.80, RIM_SAT_MUL=0.88, RIM_VAL_MUL=0.92
//    -- copiados daquele arquivo, nao reinventados) -- assim a copa noturna
//    fica na MESMA "profundidade" (sat/val rebaixados) que a copa diurna,
//    so com a base azul-violeta da noite em vez da base verde do dia.
const GRASS_A = d.grass;
const GRASS_B = shiftRamp(d.grass, { hueDeg: -9, sMul: 0.95, vMul: 1.06 });
const GRASS_SHADE = shiftRamp(d.grass, { sMul: 1.03, vMul: 0.76, hueDeg: 5 });
const GF_SAT_MUL = 0.64, GF_VAL_MUL = 0.80, RIM_SAT_MUL = 0.88, RIM_VAL_MUL = 0.92;
const DAY_FOLIAGE = d.foliage; // o que as copas do v10 ja usam
const NIGHT_FOLIAGE = shiftRamp(withPreset(false).foliage, { sMul: GF_SAT_MUL, vMul: GF_VAL_MUL });
NIGHT_FOLIAGE[7] = shiftColor(withPreset(false).foliage[7], { sMul: RIM_SAT_MUL, vMul: RIM_VAL_MUL });

// =========================================================================
// 1. Chao com relevo/contraste real -- substitui groundClumpFill/
//    dirtGrainFill do v10 (chao ainda "le plano" no feedback). Mudancas:
//    (a) separacao de valor mais forte entre clusters: o calculo de idx
//        (upper-left = mais claro) agora cobre 0..4 de verdade (multiplier
//        maior), com uma lamina-destaque fixa por cluster (a mais alta,
//        voltada pra luz) sempre no indice 4 -- antes a maioria das
//        laminas ficava presa no meio da rampa (2-3), entao o verde
//        parecia uma cor so.
//    (b) microsombra sob cada tufo: uma elipse rasteira no tom mais escuro
//        (ramp5[0]), alpha baixo, desenhada ANTES das laminas e deslocada
//        pra baixo-direita (oposto da luz) -- o tufo passa a "pousar" no
//        chao em vez de flutuar sobre uma textura uniforme.
//    (c) realce no topo do tufo: 1-2px no tom mais claro (ramp5[4]) no
//        topo da lamina mais alta -- a luz batendo na ponta do tufo,
//        reforcando que ele tem altura (pequeno desnivel), nao so cor.
//    Mantem a tecnica de wrap-around (forEachWrap) de v10 pra continuar
//    tileavel -- nenhuma regressao na prova de xadrez.
// =========================================================================
function clumpBladesRelief(c, cx, cy, ramp5, rnd, opts = {}) {
  const n = opts.n || (8 + Math.floor(rnd() * 6));
  const spread = opts.spread != null ? opts.spread : 3.4;
  const blades = [];
  for (let i = 0; i < n; i++) {
    const a = rnd() * Math.PI * 2;
    const r = spread * Math.sqrt(rnd());
    const bx = cx + Math.cos(a) * r;
    const by = cy + Math.sin(a) * r * 0.7;
    const bh = 2 + Math.floor(rnd() * 3);
    const lean = Math.round((rnd() - 0.5) * 2);
    const lit = -Math.cos(a) * 0.6 - Math.sin(a) * 0.85;
    let idx = Math.round(2 + lit * 2.15); // faixa mais ampla que v10 (1.7) -- usa 0 e 4 de verdade
    idx = Math.max(0, Math.min(4, idx));
    const tone = rnd() < 0.82 ? ramp5[idx] : ramp5[Math.max(0, idx - 1)];
    blades.push({ bx, by, bh, lean, tone, lit });
  }
  // microsombra sob o cluster -- um oco raso no tom mais escuro, deslocado
  // pra baixo-direita (lado oposto da luz cima-esquerda), ANTES das laminas.
  forEachWrap(cx + 1.4, cy + 1.6, (x, y) => c.fillEllipse(Math.round(x), Math.round(y), 3, 2, withAlpha(ramp5[0], 95)));
  blades.sort((p, q) => p.lit - q.lit); // mais escuro primeiro, mais claro por cima (silhueta nao se perde)
  for (const b of blades) {
    for (const ox of [-TILE, 0, TILE]) {
      for (const oy of [-TILE, 0, TILE]) c.line(Math.round(b.bx + ox), Math.round(b.by + b.bh + oy), Math.round(b.bx + b.lean + ox), Math.round(b.by + oy), b.tone, 1);
    }
  }
  // realce no topo da lamina mais clara do cluster -- a ponta que pega luz.
  const brightest = blades.reduce((best, b) => (b.lit > best.lit ? b : best), blades[0]);
  if (brightest) forEachWrap(brightest.bx + brightest.lean, brightest.by, (x, y) => c.blendPixel(Math.round(x), Math.round(y), withAlpha(ramp5[4], 210)));
}

function groundClumpFillRelief(c, ramp5, rnd, opts = {}) {
  c.fillRect(0, 0, TILE - 1, TILE - 1, ramp5[2]);
  const clusterCount = opts.clusters != null ? opts.clusters : (4 + Math.floor(rnd() * 2));
  const centers = [];
  for (let i = 0; i < clusterCount; i++) {
    const cx = rnd() * TILE, cy = rnd() * TILE;
    centers.push([cx, cy]);
    clumpBladesRelief(c, cx, cy, ramp5, rnd, { n: 8 + Math.floor(rnd() * 6), spread: 3 + rnd() * 1.7 });
  }
  // AO entre clusters -- blotches de 2px (nao 1 pixel solto como v10), pra
  // ler como sombra de desnivel entre tufos, nao poeira.
  for (let i = 0; i < 7; i++) {
    const px = Math.floor(rnd() * TILE), py = Math.floor(rnd() * TILE);
    let near = false;
    for (const [cx, cy] of centers) { if (Math.hypot(px - cx, py - cy) < 4) { near = true; break; } }
    if (near) continue;
    if (rnd() < 0.6) forEachWrap(px, py, (x, y) => c.fillEllipse(Math.round(x), Math.round(y), 1, 1, withAlpha(ramp5[0], 120)));
  }
  return c;
}

function dirtGrainFillRelief(c, dirtRamp, rnd) {
  c.fillRect(0, 0, TILE - 1, TILE - 1, dirtRamp[1]);
  // pequenos desniveis -- blobs rasos mais escuros (sombra de depressao) +
  // blobs mais claros (crista) perto um do outro, nao so uma mancha neutra.
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
      c.setPixel(x, y, d.stone[1]);
      if (rnd() < 0.5) c.setPixel(x + 1, y, withAlpha(d.stone[0], 180));
      c.blendPixel(x + 1, y + 1, withAlpha([0, 0, 0, 255], 70)); // AO da pedrinha -- reforca o desnivel
    });
  }
}

// -- decalques (versoes compactas, mesmos tons de v10, pra manter os 10
//    slots de GROUND_META drop-in-compativeis) -------------------------
function stampLeafLitter(c, cx, cy, rnd) {
  const l = d.leafLitter;
  for (let i = 0; i < 7; i++) {
    const a = rnd() * Math.PI * 2, r = rnd() * 6;
    const px = Math.round(cx + Math.cos(a) * r), py = Math.round(cy + Math.sin(a) * r * 0.6);
    c.fillEllipse(px, py, 2 + Math.floor(rnd() * 2), 1 + Math.floor(rnd() * 2), withAlpha(l[Math.floor(rnd() * l.length)], 230));
  }
  c.line(Math.round(cx), Math.round(cy + 3), Math.round(cx - 1), Math.round(cy + 6), d.bark.dk, 1);
}
function stampRoot(c, cx, cy, rnd) {
  const bark = d.bark;
  for (let x = cx - 9; x <= cx + 9; x++) {
    const t = (x - (cx - 9)) / 18;
    const yoff = Math.round(Math.sin(t * Math.PI) * 4);
    c.setPixel(x, cy - yoff, bark.dk);
    c.setPixel(x, cy - yoff + 1, bark.mid);
  }
  c.fillEllipse(cx, cy - 4, 3, 2, withAlpha(d.moss, 185));
  c.fillEllipse(cx, cy + 2, 8, 2, withAlpha([0, 0, 0, 255], 80));
}
function stampStones(c, cx, cy, rnd, count) {
  const s = d.stone;
  for (let i = 0; i < count; i++) {
    const a = rnd() * Math.PI * 2, r = 2 + rnd() * 6;
    const px = Math.round(cx + Math.cos(a) * r), py = Math.round(cy + Math.sin(a) * r * 0.6);
    const rr = 2 + Math.floor(rnd() * 2);
    c.fillEllipse(px, py, rr, Math.max(1, rr - 1), rnd() < 0.5 ? s[0] : s[1]);
    c.fillEllipse(px - 1, py - 1, Math.max(1, rr - 1), 1, s[2]);
    c.fillEllipse(px, py - rr + 1, Math.max(1, rr - 1), 1, withAlpha(d.moss, 190));
    c.blendPixel(px + rr, py + 1, withAlpha([0, 0, 0, 255], 100));
  }
}
function stampClover(c, cx, cy, rnd, count) {
  const w = shiftColor(d.grass[4], { vMul: 0.95 }), y = shiftColor([246, 216, 74, 255], { sMul: 0.55, vMul: 0.8 });
  for (let i = 0; i < count; i++) {
    const px = Math.round(cx + (rnd() - 0.5) * 10), py = Math.round(cy + (rnd() - 0.5) * 7);
    c.setPixel(px, py, rnd() < 0.6 ? w : y);
  }
}
function clayCrackMuted(c, cx, cy, rnd, len) {
  const col = d.dirt[0];
  let x = cx, y = cy, angle = rnd() * Math.PI * 2;
  for (let i = 0; i < Math.round(len / 3); i++) {
    angle += (rnd() - 0.5) * 0.7;
    const nx = x + Math.cos(angle) * 2.4, ny = y + Math.sin(angle) * 1.6;
    c.line(Math.round(x), Math.round(y), Math.round(nx), Math.round(ny), withAlpha(col, 160), 1);
    x = nx; y = ny;
  }
}

const GROUND_META = [
  { decal: 'grama densa, sem decalque, com relevo (clusters + microsombra)', family: 'grass-A' },
  { decal: 'grama + folhas caidas em grupo', family: 'grass-A' },
  { decal: 'grama + raiz exposta com musgo', family: 'grass-A' },
  { decal: 'grama + pedras com musgo (grupo de 3)', family: 'grass-A' },
  { decal: 'grama + trevo/flor esparsa', family: 'grass-A' },
  { decal: 'grama + 1 pedra com musgo (sutil)', family: 'grass-A' },
  { decal: 'grama + folhas caidas (posicao alternativa)', family: 'grass-A' },
  { decal: 'grama + trevo esparso (sutil)', family: 'grass-A' },
  { decal: 'terra/trilha (grao + desnivel, sem rachadura)', family: 'dirt' },
  { decal: 'terra + rachadura muda (tom terra, rara)', family: 'dirt' },
];

function groundVariant(variant, seed) {
  const rnd = rng(seed + variant * 191);
  const c = new Canvas(TILE, TILE);
  const isDirt = variant >= 8;
  if (isDirt) dirtGrainFillRelief(c, d.dirt, rnd);
  else groundClumpFillRelief(c, GRASS_A, rnd, { clusters: 5 });
  switch (variant) {
    case 1: stampLeafLitter(c, 16, 20, rnd); break;
    case 2: stampRoot(c, 16, 22, rnd); break;
    case 3: stampStones(c, 17, 18, rnd, 3); break;
    case 4: stampClover(c, 16, 18, rnd, 3); break;
    case 5: stampStones(c, 15, 16, rnd, 1); break;
    case 6: stampLeafLitter(c, 18, 15, rnd); break;
    case 7: stampClover(c, 17, 19, rnd, 2); break;
    case 9: clayCrackMuted(c, 12, 18, rnd, 10); clayCrackMuted(c, 22, 10, rnd, 7); break;
    default: break;
  }
  return c;
}

// =========================================================================
// 2. Autotile grama<->terra Wang-47 (blob_autotile47.js, cantos internos) --
//    resolve a limitacao documentada em forest-v10-ground-trees/README.md:
//    "o blob-16 do pacote nao tem canto interno: as pecas de borda levam a
//    terra ate a borda do tile... a borda de um bloco le como 'retangulo
//    com dentes' a cada 32px". Agora, numa celula-"braco" saindo de um
//    bloco (ambas as arestas adjacentes continuam mas a diagonal e grama),
//    o corner renderiza um pequeno entalhe concavo em vez de um quadrado
//    cheio -- qualquer mancha de terra, de qualquer forma, fecha sem
//    degrau reto. Textura de borda tambem ficou mais organica: usa o
//    `isBg` que buildBlobTile47 devolve pra plantar tufos de grama
//    mordendo a terra e pedrinhas do lado da terra, exatamente ao longo
//    do contorno resolvido pelo blob (nao so o arredondamento geometrico).
// =========================================================================
function grassDirtFgV11(c, x0, y0, w, h, _ramp, seed) {
  const rnd = rng(seed);
  const sub = new Canvas(w, h);
  dirtGrainFillRelief(sub, d.dirt, rnd);
  c.blit(sub, x0, y0);
}
function grassDirtBgV11(c, x0, y0, w, h, _ramp, seed) {
  const rnd = rng(seed);
  const sub = new Canvas(w, h);
  groundClumpFillRelief(sub, GRASS_A, rnd, { clusters: 5 });
  c.blit(sub, x0, y0);
}

function decorateBoundary(c, isBg, size, seed) {
  const rnd = rng(seed + 3000);
  const at = (x, y) => (x >= 0 && x < size && y >= 0 && y < size) ? isBg[y * size + x] : isBg[Math.max(0, Math.min(size - 1, y)) * size + Math.max(0, Math.min(size - 1, x))];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const v = at(x, y);
      const boundary = at(x + 1, y) !== v || at(x - 1, y) !== v || at(x, y + 1) !== v || at(x, y - 1) !== v;
      if (!boundary) continue;
      if (v === 1) { // lado grama -- tufo mordendo a terra
        if (rnd() < 0.3) {
          // direcao aproximada pro lado da terra (vizinho com v diferente)
          let dx = 0, dy = 0;
          if (at(x + 1, y) !== v) dx = 1; else if (at(x - 1, y) !== v) dx = -1;
          if (at(x, y + 1) !== v) dy = 1; else if (at(x, y - 1) !== v) dy = -1;
          const len = 2 + Math.floor(rnd() * 3);
          c.line(x, y, x + dx * len, y + dy * len, rnd() < 0.5 ? d.foliage[6] : d.foliage[4], 1);
        }
      } else if (rnd() < 0.22) { // lado terra -- pedrinha junto a borda
        const rr = 1;
        c.fillEllipse(x, y, rr, rr, d.stone[rnd() < 0.5 ? 0 : 1]);
        c.blendPixel(x + 1, y + 1, withAlpha([0, 0, 0, 255], 90));
      }
    }
  }
}

function grassDirtWang47Set(seed) {
  const table = enumerateBlob47();
  const tiles = [];
  for (let i = 0; i < table.length; i++) {
    const { edgeMask, diagMask } = table[i];
    const { canvas, isBg } = buildBlobTile47(TILE, edgeMask, diagMask, d, seed + i * 23, grassDirtFgV11, grassDirtBgV11, { rOuter: Math.round(TILE * 0.4), rSingle: Math.round(TILE * 0.24), rConcave: Math.round(TILE * 0.17) });
    decorateBoundary(canvas, isBg, TILE, seed + i * 23);
    tiles.push({ index: i, edgeMask, diagMask, canvas });
  }
  return tiles;
}

// =========================================================================
// 3. Copas night/ -- paleta noturna aplicada aos 16 PNGs de `top` JA
//    APROVADOS de forest-v10-ground-trees (silhueta/lobulos/rim/AO
//    identicos, 0 risco de divergencia de forma). Tecnica: cada pixel
//    opaco e lido como um ponto na rampa de 8 tons DAY_FOLIAGE (pelo
//    canal mais claro, equivalente ao V de HSV -- suficiente porque a
//    arte so usa tons dessa rampa + blends entre tons adjacentes), 2
//    vizinhos de rampa mais proximos por valor sao achados e o pixel vira
//    um lerp entre os MESMOS 2 indices da rampa NIGHT_FOLIAGE -- o realce
//    (idx 7, blendado) e a sombra interna (idx 0, blendada) do baking do
//    v10 caem automaticamente nos extremos corretos da rampa noturna, sem
//    reprocessar rim-light/AO. Alfa e preservado pixel a pixel (contorno
//    da copa inalterado).
// =========================================================================
function hsvValueOf(c) { return Math.max(c[0], c[1], c[2]) / 255; }
function lerpRGB(a, b, t) { return [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t)]; }

function recolorFoliageToNight(canvas) {
  const dayStops = DAY_FOLIAGE.map(hsvValueOf);
  const out = new Canvas(canvas.w, canvas.h);
  for (let y = 0; y < canvas.h; y++) {
    for (let x = 0; x < canvas.w; x++) {
      const [r, g, b, a] = canvas.getPixel(x, y);
      if (a === 0) continue;
      const v = hsvValueOf([r, g, b]);
      let i0 = 0;
      while (i0 < dayStops.length - 2 && v > dayStops[i0 + 1]) i0++;
      const i1 = Math.min(dayStops.length - 1, i0 + 1);
      const span = dayStops[i1] - dayStops[i0];
      const t = span > 0.0001 ? Math.max(0, Math.min(1, (v - dayStops[i0]) / span)) : 0;
      const [nr, ng, nb] = lerpRGB(NIGHT_FOLIAGE[i0], NIGHT_FOLIAGE[i1], t);
      out.setPixel(x, y, [nr, ng, nb, a]);
    }
  }
  return out;
}

const TREE_SPECIES = ['tall_narrow', 'wide_low', 'leaning', 'ancient_thick'];
const TREE_SIZES = ['small', 'large'];

function buildNightCanopies() {
  const night = {};
  for (const kind of TREE_SPECIES) {
    for (const size of TREE_SIZES) {
      const file = `${kind}_${size}_top.png`;
      const dayTop = pngToCanvas(path.join(V10_DIR, 'trees', file));
      night[file] = recolorFoliageToNight(dayTop);
    }
  }
  return night;
}

// =========================================================================
// 4. Manchas macro com alfa corrigido -- mesma forma/lobulos/dither de
//    v10's macroPatch(), MAIS: (a) rBase reduzido para o alcance organico
//    maximo caber dentro do raio util com folga, e (b) um anel de 8px na
//    borda do canvas forcado a alfa 0 (requisito do coordenador), com uma
//    rampa suave de 8-20px entre o alfa organico e esse zero -- evita tanto
//    a linha reta na borda (bug relatado) quanto um corte circular visivel.
// =========================================================================
function macroPatchFixed(size, tintRamp, seed) {
  const c = new Canvas(size, size);
  const rnd = rng(seed);
  const cx = size / 2, cy = size / 2;
  const lobes = 10;
  const rBase = size * 0.30; // v10 usava 0.36 -- reduzido pra sobrar folga antes da borda
  const radii = [];
  for (let i = 0; i < lobes; i++) radii.push(rBase * (0.72 + rnd() * 0.5));
  const featherBand = Math.round(size * 0.09);
  const HARD_ZERO = 8, RAMP_BAND = 12; // >=8px de alfa zero garantido; mais 12px de transicao suave
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx, dy = y - cy;
      const dist = Math.hypot(dx, dy);
      const ang = Math.atan2(dy, dx);
      const t = ((ang + Math.PI) / (2 * Math.PI)) * lobes;
      const i0 = Math.floor(t) % lobes, i1 = (i0 + 1) % lobes;
      const f = t - Math.floor(t);
      const r = radii[i0] * (1 - f) + radii[i1] * f;
      if (dist > r + featherBand) continue;
      let a;
      if (dist < r - featherBand) a = 150;
      else a = Math.round(150 * Math.max(0, Math.min(1, (r + featherBand - dist) / (featherBand * 2))));
      a += Math.round((rnd() - 0.5) * 55);
      a = Math.max(0, Math.min(150, a));
      // anel de borda: alfa 0 garantido nos HARD_ZERO px mais proximos da
      // borda do CANVAS (nao do blob), com rampa suave ate RAMP_BAND px.
      const distToEdge = Math.min(x, size - 1 - x, y, size - 1 - y);
      if (distToEdge < HARD_ZERO) a = 0;
      else if (distToEdge < HARD_ZERO + RAMP_BAND) a = Math.round(a * (distToEdge - HARD_ZERO) / RAMP_BAND);
      if (a <= 4) continue;
      c.blendPixel(x, y, withAlpha(tintRamp[rnd() < 0.5 ? 2 : 3], a));
    }
  }
  return c;
}

// =========================================================================
// 5. Topo do mirante -- substitui a laje cinza + faixa verde retangular
//    pedida pelo coordenador. Reusa a MESMA geometria blob-16
//    (blob_autotile16.js, NAO modificado) e a MESMA rampa/tecnica ja usada
//    e aprovada em forest-v9-cliffs (cliffTopFg: fundo de grama + manchas
//    de terra batida + musgo na borda sul) -- e por isso que "casa" com
//    forest-v9-cliffs (mesmas ramps d.grass/d.dirt/d.stone/d.mossEdge, 0
//    hex novo). O que este pacote ACRESCENTA, respondendo literalmente ao
//    pedido "com pedras e borda irregular": mais pedras visiveis (clusters
//    com musgo e AO, nao so 3 pixels soltos) e um wobble de borda mais
//    forte + mordidas de musgo/grama na face, pra nenhuma aresta do topo
//    ler reta mesmo numa fileira longa.
// =========================================================================
function wobbleProfile(seed, steps, amp) {
  const rnd = rng(seed);
  const prof = [];
  let v = 0;
  for (let i = 0; i < steps; i++) { v += (rnd() - 0.5) * 1.6; v = Math.max(-amp, Math.min(amp, v)); prof.push(v); }
  return prof;
}

function miranteTopFg(c, x0, y0, w, h, _ramp, seed) {
  const rnd = rng(seed);
  const g = d.grass;
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
  // terra batida (1-2 manchas, como v9-cliffs)
  const dirtPatches = 1 + (rnd() < 0.35 ? 1 : 0);
  for (let i = 0; i < dirtPatches; i++) {
    const cx = x0 + 6 + Math.floor(rnd() * Math.max(1, w - 12)), cy = y0 + 6 + Math.floor(rnd() * Math.max(1, h - 12));
    const rx = 3 + Math.floor(rnd() * 4), ry = 2 + Math.floor(rnd() * 3);
    c.fillEllipse(cx, cy, rx, ry, d.dirt[1]);
    c.fillEllipse(cx - 1, cy - 1, Math.max(1, rx - 2), Math.max(1, ry - 2), d.dirt[2]);
  }
  // pedras -- clusters com musgo e AO (mais presentes que v9-cliffs' 3px
  // soltos), resposta direta ao pedido "com pedras".
  const rockClusters = 1 + (rnd() < 0.6 ? 1 : 0);
  for (let i = 0; i < rockClusters; i++) {
    const cx = x0 + 5 + Math.floor(rnd() * Math.max(1, w - 10)), cy = y0 + 5 + Math.floor(rnd() * Math.max(1, h - 10));
    for (let k = 0; k < 2 + Math.floor(rnd() * 2); k++) {
      const a = rnd() * Math.PI * 2, r = 2 + rnd() * 5;
      const px = Math.round(cx + Math.cos(a) * r), py = Math.round(cy + Math.sin(a) * r * 0.6);
      const rr = 2 + Math.floor(rnd() * 2);
      c.fillEllipse(px, py, rr, Math.max(1, rr - 1), d.stone[rnd() < 0.5 ? 0 : 1]);
      c.fillEllipse(px - 1, py - 1, Math.max(1, rr - 1), 1, d.stone[2]);
      c.fillEllipse(px, py - rr + 1, Math.max(1, rr - 1), 1, withAlpha(d.moss, 180));
      c.blendPixel(px + rr, py + 1, withAlpha([0, 0, 0, 255], 100));
    }
  }
  for (let i = 0; i < 3; i++) {
    const px = x0 + Math.floor(rnd() * w), py = y0 + Math.floor(rnd() * h);
    c.setPixel(px, py, d.stone[1]);
    if (rnd() < 0.4) c.setPixel(px + 1, py, withAlpha(d.stone[0], 180));
  }
  // borda sul -- wobble mais forte que v9-cliffs (amp 3 -> 4.2) + mordidas
  // de grama pra reforcar "borda nunca e reta".
  const prof = wobbleProfile(seed + 77, w, 4.2);
  for (let x = 0; x < w; x++) {
    const edgeY = y0 + h - 1 - Math.max(0, Math.round(2 + prof[x]));
    for (let y = edgeY; y < y0 + h; y++) {
      if (rnd() < 0.55) c.setPixel(x0 + x, y, withAlpha(d.mossEdge, 170 + Math.floor(rnd() * 60)));
    }
  }
  for (let i = 0; i < 7; i++) {
    const px = x0 + Math.floor(rnd() * w);
    const fo = d.foliage;
    c.line(px, y0 + h - 2, px + Math.round((rnd() - 0.5) * 3), y0 + h - 2 - (1 + Math.floor(rnd() * 4)), rnd() < 0.5 ? fo[4] : fo[3], 1);
  }
}
function miranteTopBg(c, x0, y0, w, h, _ramp, seed) {
  const rnd = rng(seed);
  const sub = new Canvas(w, h);
  groundClumpFillRelief(sub, GRASS_A, rnd, { clusters: 5 });
  c.blit(sub, x0, y0);
}
function miranteTopBlobSet(seed) {
  const tiles = {};
  for (let m = 0; m < 16; m++) {
    tiles[m] = buildBlobTile(TILE, m, d, seed + m * 23, miranteTopFg, miranteTopBg, { rOuter: Math.round(TILE * 0.42), rSingle: Math.round(TILE * 0.26) });
  }
  return tiles;
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

function buildMiranteDemo(miranteTiles) {
  // Plataforma IRREGULAR (nao retangular) -- prova visual de que o topo
  // novo nao le como laje: uma reentrancia e uma saliencia na silhueta.
  const grid = [
    '.######.',
    '#########',
    '#########',
    '##########',
    '.########',
    '..######.',
  ].map((row) => row.split('').map((ch) => ch === '#'));
  const ROWS = grid.length, COLS = Math.max(...grid.map((r) => r.length));
  const normGrid = grid.map((row) => { const r = row.slice(); while (r.length < COLS) r.push(false); return r; });
  const W_px = COLS * TILE, H_px = (ROWS + 2) * TILE; // +2 linhas pra face/chao abaixo
  const scene = new Canvas(W_px, H_px);
  const groundRnd = rng(909);
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      if (!normGrid[ty][tx]) { scene.blit(groundVariant(0, 7000 + tx + ty * 13), tx * TILE, ty * TILE); continue; }
      const m = pathBitmaskGrid(normGrid, ROWS, COLS, tx, ty);
      scene.blit(miranteTiles[m], tx * TILE, ty * TILE);
      // Decalque esparso por celula (so nesta DEMO -- nao no tile de
      // producao) -- como um level designer faria de verdade: o topo e
      // autotile (1 textura canonica por mascara, mesma convencao de
      // cliff_top_blob/grass_dirt_blob ja aceita em v8/v9/v10), entao uma
      // area interior grande SEM decalque repete a mesma peca -- e o
      // motivo de v10 ter criado decals/ avulsos pra espalhar por cima.
      // Sem isso aqui, celulas interiores identicas ficavam lado a lado
      // formando uma grade visivel na demo (achado da propria revisao do
      // diretor).
      const cellRnd = rng(5000 + tx * 53 + ty * 97);
      if (cellRnd() < 0.4) stampClover(scene, tx * TILE + 10 + Math.round(cellRnd() * 12), ty * TILE + 10 + Math.round(cellRnd() * 12), cellRnd, 2);
    }
  }
  // face/degraus/cantos reais de forest-v9-cliffs (lidos do disco, nao
  // redesenhados) -- so pra provar que o topo novo casa visualmente com
  // o penhasco ja aprovado, sem reler forest-v9-cliffs aqui.
  const faceA = pngToCanvas(path.join(V9_DIR, 'tiles', 'cliff_face_a.png'));
  const faceB = pngToCanvas(path.join(V9_DIR, 'tiles', 'cliff_face_b.png'));
  const faceC = pngToCanvas(path.join(V9_DIR, 'tiles', 'cliff_face_c.png'));
  const ramp = pngToCanvas(path.join(V9_DIR, 'tiles', 'cliff_ramp.png'));
  const cornerL = pngToCanvas(path.join(V9_DIR, 'tiles', 'cliff_face_corner_outer_left.png'));
  const cornerR = pngToCanvas(path.join(V9_DIR, 'tiles', 'cliff_face_corner_outer_right.png'));
  const faceRow = [cornerL, faceA, faceB, faceC, faceA, ramp, faceB, faceC, faceA, cornerR];
  for (let tx = 0; tx < COLS; tx++) scene.blit(faceRow[tx % faceRow.length], tx * TILE, ROWS * TILE);
  const groundRow2 = [];
  for (let tx = 0; tx < COLS; tx++) { const g2 = new Canvas(TILE, TILE); groundClumpFillRelief(g2, GRASS_A, groundRnd, { clusters: 4 }); scene.blit(g2, tx * TILE, (ROWS + 1) * TILE); }
  return scene;
}

// =========================================================================
// 6. Montagem simulada 20x12 -- v10 (ANTES) vs v11 (DEPOIS), dia e noite,
//    mais zoom. Carrega os PNGs JA RENDERIZADOS de forest-v10-ground-trees
//    do disco (pngToCanvas) em vez de reexecutar o gerador do v10 -- nao
//    toca nem reimporta codigo interno do v10 (arvores do v10 ficam
//    intocadas aqui, como pedido: este pacote nao redesenha arvore).
// =========================================================================
const COLS = 20, ROWS = 12;

function computePathGrid() {
  const grid = [];
  for (let ty = 0; ty < ROWS; ty++) {
    const row = [];
    for (let tx = 0; tx < COLS; tx++) {
      // uma mancha de terra IRREGULAR (nao uma trilha reta de 2 celulas) --
      // prova o Wang-47 numa forma com bracos e reentrancias, o caso que o
      // blob-16 do v10 documentou como "retangulo com dentes".
      const cx = 10, cy = 6;
      const dx = tx - cx, dy = ty - cy;
      const blobby = Math.hypot(dx * 1.3, dy * 1.7) < 3.4 + Math.sin(tx * 0.9 + ty * 1.3) * 1.1;
      const arm = (ty === cy && tx >= cx + 2 && tx <= cx + 5) || (tx === cx - 4 && ty >= cy - 1 && ty <= cy + 1);
      row.push(blobby || arm);
    }
    grid.push(row);
  }
  return grid;
}

function loadV10GroundTiles() {
  const tiles = [];
  for (let v = 0; v < 10; v++) tiles.push(pngToCanvas(path.join(V10_DIR, 'tiles', `ground_variant_${v}.png`)));
  return tiles;
}
function loadV10BlobSet() {
  const set = {};
  for (let m = 0; m < 16; m++) set[m] = pngToCanvas(path.join(V10_DIR, 'tiles', `grass_dirt_blob_${m}.png`));
  return set;
}
function loadV10Trees() {
  const trees = {};
  for (const kind of TREE_SPECIES) for (const size of TREE_SIZES) {
    trees[`${kind}_${size}`] = {
      base: pngToCanvas(path.join(V10_DIR, 'trees', `${kind}_${size}_base.png`)),
      top: pngToCanvas(path.join(V10_DIR, 'trees', `${kind}_${size}_top.png`)),
    };
  }
  return trees;
}

function tamerScaleMarker() {
  const w = 16, h = 30;
  const c = new Canvas(w, h);
  c.fillRect(5, 19, 11, 27, [45, 60, 110, 255]);
  c.fillRect(4, 10, 12, 21, [80, 150, 210, 255]);
  c.fillRect(3, 9, 13, 21, [68, 128, 188, 255]);
  c.fillCircle(8, 6, 5, [230, 190, 150, 255]);
  c.fillEllipse(8, 2, 6, 3, [190, 50, 50, 255]);
  c.setPixel(6, 6, [20, 20, 20, 255]);
  c.setPixel(10, 6, [20, 20, 20, 255]);
  c.autoOutline([10, 10, 14, 255]);
  c.fillEllipse(8, 29, 6, 2, withAlpha([0, 0, 0, 255], 100));
  return c;
}

function placeTreeTop(scene, entities, tree, footX, footY) {
  const { top, base } = tree;
  scene.blit(base, Math.round(footX - base.w / 2), footY - base.h);
  const overlap = Math.round(top.h * 0.4);
  const topY = footY - base.h - top.h + overlap;
  entities.push({ canvas: top, x: Math.round(footX - top.w / 2), y: topY });
}

function buildScene11(isV11, pathGrid, v10Tiles, v10Blob, v10Trees, wang47ByIndex, v11Tiles, miranteTiles, macroOlive, macroShade, seed) {
  const scene = new Canvas(COLS * TILE, ROWS * TILE);
  const rnd = rng(seed);
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      let tile;
      if (pathGrid[ty][tx]) {
        if (isV11) {
          const N = ty > 0 && pathGrid[ty - 1][tx], E = tx < COLS - 1 && pathGrid[ty][tx + 1];
          const S = ty < ROWS - 1 && pathGrid[ty + 1][tx], WEST = tx > 0 && pathGrid[ty][tx - 1];
          const NE = ty > 0 && tx < COLS - 1 && pathGrid[ty - 1][tx + 1];
          const SE = ty < ROWS - 1 && tx < COLS - 1 && pathGrid[ty + 1][tx + 1];
          const SW = ty < ROWS - 1 && tx > 0 && pathGrid[ty + 1][tx - 1];
          const NW = ty > 0 && tx > 0 && pathGrid[ty - 1][tx - 1];
          const edgeMask = (N ? 1 : 0) | (E ? 2 : 0) | (S ? 4 : 0) | (WEST ? 8 : 0);
          const diagMask = (NE ? 1 : 0) | (SE ? 2 : 0) | (SW ? 4 : 0) | (NW ? 8 : 0);
          tile = wang47ByIndex[blob47Index(enumerateBlob47(), edgeMask, diagMask)];
        } else {
          const mask = pathBitmaskGrid(pathGrid, ROWS, COLS, tx, ty);
          tile = v10Blob[mask];
        }
      } else {
        const r = rnd();
        let v;
        if (r < 0.62) v = 0; else if (r < 0.74) v = 1; else if (r < 0.83) v = 2;
        else if (r < 0.90) v = 3; else if (r < 0.95) v = 4; else v = 5 + Math.floor(rnd() * 3);
        tile = isV11 ? v11Tiles[v] : v10Tiles[v];
      }
      scene.blit(tile, tx * TILE, ty * TILE);
    }
  }
  // amostra do mirante/laje numa celula ABERTA da clareira (tx 2..5,
  // ty=9) -- nao sob a copa densa da borda, pra ficar visivel na
  // montagem (a borda tx<2/tx>COLS-3/ty<2/ty>ROWS-3 e onde as arvores
  // grandes entram, ver edgeCells abaixo).
  if (isV11) {
    scene.blit(macroOlive, 46, 210);
    scene.blit(macroShade, 380, 70);
    for (let i = 0; i < 4; i++) scene.blit(miranteTiles[11], (2 + i) * TILE, 9 * TILE);
  } else {
    // "antes": laje cinza retangular no mesmo lugar (reconstrucao da
    // tecnica do painel ANTES de forest-v9-cliffs/README.md -- gray slab,
    // reta, sem vegetacao).
    for (let i = 0; i < 4; i++) {
      const slab = new Canvas(TILE, TILE);
      slab.fillRect(0, 0, TILE - 1, TILE - 1, [40, 44, 54, 255]);
      slab.fillRect(0, 0, TILE - 1, 1, [58, 62, 72, 255]);
      slab.fillRect(0, 0, 3, TILE - 1, [78, 160, 90, 255]); // faixa verde retangular, igual ao relatado
      scene.blit(slab, (2 + i) * TILE, 9 * TILE);
    }
  }
  const treeEntities = [];
  const kinds = TREE_SPECIES;
  const edgeCells = [];
  const erand = rng(seed + 500);
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      const onBorder = tx < 2 || tx > COLS - 3 || ty < 2 || ty > ROWS - 3;
      const nearCenter = Math.abs(tx - 10) < 3 && Math.abs(ty - 6) < 3;
      if (onBorder && !nearCenter && erand() < 0.62) edgeCells.push([tx, ty]);
    }
  }
  let ki = 0;
  for (const [tx, ty] of edgeCells) {
    const footX = tx * TILE + 16 + Math.round((erand() - 0.5) * 10);
    const footY = ty * TILE + 26 + Math.round((erand() - 0.5) * 8);
    const kind = kinds[ki % kinds.length]; ki++;
    const sizeKey = (ty < 2 || ty > ROWS - 3) ? 'large' : 'small';
    placeTreeTop(scene, treeEntities, v10Trees[`${kind}_${sizeKey}`], footX, footY);
  }
  const tamer = tamerScaleMarker();
  const tFootX = 10 * TILE + 16, tFootY = 6 * TILE + 24;
  scene.fillEllipse(tFootX, tFootY + 1, 7, 2, withAlpha([0, 0, 0, 255], 90));
  scene.blit(tamer, tFootX - Math.round(tamer.w / 2), tFootY - tamer.h);
  treeEntities.sort((a, b) => (a.y + a.canvas.h) - (b.y + b.canvas.h));
  for (const e of treeEntities) scene.blit(e.canvas, e.x, e.y);
  return scene;
}

function buildSceneNight(dayScene, treesUsed, nightCanopies, isV11) {
  // "noite" -- o chao/props recebem o tint uniforme azul-violeta que o
  // renderer ja aplica hoje (GradeRule, aproximacao por grade); a COPA, se
  // for v11, usa a arte night/ dedicada (reconstruida sobre a MESMA cena
  // dia, recompondo so a camada de copa) -- o contraste entre as duas
  // metades mostra exatamente o que o item 3 pediu: a copa deixa de ser
  // so um tom-azul-aproximado e ganha uma paleta noturna propria.
  const scene = dayScene.tint([40, 36, 90, 255], 130);
  return scene;
}

function buildComparisonSheet(pathGrid, v10Tiles, v10Blob, v10Trees, wang47ByIndex, v11Tiles, miranteTiles, macroOlive, macroShade, nightCanopies) {
  const dayV10 = buildScene11(false, pathGrid, v10Tiles, v10Blob, v10Trees, wang47ByIndex, v11Tiles, miranteTiles, macroOlive, macroShade, 31000);
  const dayV11 = buildScene11(true, pathGrid, v10Tiles, v10Blob, v10Trees, wang47ByIndex, v11Tiles, miranteTiles, macroOlive, macroShade, 32000);
  const nightV10 = buildSceneNight(dayV10, v10Trees, nightCanopies, false);
  // noite v11: reconstroi a cena dia-v11 com o MESMO seed/traçado, mas
  // passando um mapa de arvores onde "top" e a copa night/ dedicada (base/
  // tronco continua a do dia -- so a copa muda, como pedido) -- demonstra
  // o item 3 isoladamente, sem reimplementar um sistema de luz completo
  // (fora de escopo de game-art).
  const nightTreesMap = {};
  for (const kind of TREE_SPECIES) {
    for (const size of TREE_SIZES) {
      const key = `${kind}_${size}`;
      nightTreesMap[key] = { base: v10Trees[key].base, top: nightCanopies[`${key}_top.png`] };
    }
  }
  const nightV11Base = buildScene11(true, pathGrid, v10Tiles, v10Blob, nightTreesMap, wang47ByIndex, v11Tiles, miranteTiles, macroOlive, macroShade, 32000);
  const nightV11 = nightV11Base.tint([40, 36, 90, 255], 95); // tint mais leve -- a copa ja carrega a cor da noite

  const labelH = 18, gap = 10;
  const halfW = COLS * TILE;
  const halfH = ROWS * TILE;
  const zoomScale = 4;
  const zoom1W = 7 * TILE * zoomScale, zoom1H = 6 * TILE * zoomScale; // wang-47 crop (cropW=7,cropH=6)
  const zoom2W = 6 * TILE * zoomScale, zoom2H = 4 * TILE * zoomScale; // mirante crop (6x4)
  const totalW = Math.max(halfW + 16, 8 + zoom1W + 16 + zoom1W + 8, 8 + zoom2W + 16 + zoom2W + 8) + 8;
  // altura: titulo + 4x(label+cena+gap) + 2x(label+zoom) + margem
  const totalH = 22 + 4 * (12 + halfH + gap) + (12 + zoom1H + 16) + (12 + zoom2H) + 30;
  const sheet = new Canvas(totalW, totalH);
  sheet.fillRect(0, 0, sheet.w - 1, sheet.h - 1, [12, 12, 20, 255]);
  let y = 6;
  drawText(sheet, 'FOREST-V11-GROUND -- MONTAGEM 20X12', 8, y, [255, 230, 120, 255]); y += 16;

  drawText(sheet, 'DIA - V10 (ANTES, INTEGRADO NO JOGO)', 8, y, [255, 170, 170, 255]); y += 12;
  sheet.blit(dayV10, 8, y); y += halfH + gap;

  drawText(sheet, 'DIA - V11 (DEPOIS: relevo + wang-47 + macro + mirante)', 8, y, [160, 255, 180, 255]); y += 12;
  sheet.blit(dayV11, 8, y); y += halfH + gap;

  drawText(sheet, 'NOITE - V10 (ANTES: so tint uniforme de grade)', 8, y, [255, 170, 170, 255]); y += 12;
  sheet.blit(nightV10, 8, y); y += halfH + gap;

  drawText(sheet, 'NOITE - V11 (DEPOIS: copa com paleta night/ propria)', 8, y, [160, 255, 180, 255]); y += 12;
  sheet.blit(nightV11, 8, y); y += halfH + gap;

  // --- zooms ---
  drawText(sheet, 'ZOOM 4X -- autotile Wang-47 (braco de terra, canto interno)', 8, y, [200, 220, 255, 255]); y += 12;
  const zoomSrcV10 = dayV10;
  const zoomSrcV11 = dayV11;
  const cropW = 7, cropH = 6, cropX = 7, cropY = 3;
  const cropV10 = new Canvas(cropW * TILE, cropH * TILE);
  cropV10.blit(zoomSrcV10, -cropX * TILE, -cropY * TILE);
  const cropV11 = new Canvas(cropW * TILE, cropH * TILE);
  cropV11.blit(zoomSrcV11, -cropX * TILE, -cropY * TILE);
  const z10 = cropV10.scaleNearest(4), z11 = cropV11.scaleNearest(4);
  sheet.blit(z10, 8, y);
  sheet.blit(z11, 8 + z10.w + 16, y);
  drawText(sheet, 'V10', 8, y - 10, [255, 170, 170, 255]);
  drawText(sheet, 'V11', 8 + z10.w + 16, y - 10, [160, 255, 180, 255]);
  y += z10.h + 16;

  drawText(sheet, 'ZOOM 4X -- topo do mirante (laje cinza vs. penhasco vegetado)', 8, y, [200, 220, 255, 255]); y += 12;
  const slabDemo = new Canvas(6 * TILE, 4 * TILE);
  for (let ty = 0; ty < 4; ty++) for (let tx = 0; tx < 6; tx++) {
    const slab = new Canvas(TILE, TILE);
    slab.fillRect(0, 0, TILE - 1, TILE - 1, [40, 44, 54, 255]);
    slab.fillRect(0, 0, TILE - 1, 1, [58, 62, 72, 255]);
    if (tx === 0) slab.fillRect(0, 0, 3, TILE - 1, [78, 160, 90, 255]);
    slabDemo.blit(slab, tx * TILE, ty * TILE);
  }
  const miranteDemo = buildMiranteDemo(miranteTiles);
  const miranteCrop = new Canvas(6 * TILE, 4 * TILE);
  miranteCrop.blit(miranteDemo, -TILE, 0);
  const zs = slabDemo.scaleNearest(4), zm = miranteCrop.scaleNearest(4);
  sheet.blit(zs, 8, y);
  sheet.blit(zm, 8 + zs.w + 16, y);
  drawText(sheet, 'ANTES', 8, y - 10, [255, 170, 170, 255]);
  drawText(sheet, 'V11', 8 + zs.w + 16, y - 10, [160, 255, 180, 255]);

  return sheet;
}

// =========================================================================
// preview sheet
// =========================================================================
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
  drawText(sheet, 'FOREST-V11-GROUND', 8, 6, [255, 230, 120, 255]);
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

function main() { require('./gen_forest_v11_ground_main.js').run(module.exports); }
module.exports = {
  TILE, OUT, V10_DIR, V9_DIR, d, GRASS_A, GRASS_B, GRASS_SHADE, DAY_FOLIAGE, NIGHT_FOLIAGE,
  groundVariant, GROUND_META, grassDirtWang47Set, buildNightCanopies, macroPatchFixed,
  miranteTopBlobSet, buildMiranteDemo, computePathGrid, loadV10GroundTiles, loadV10BlobSet, loadV10Trees,
  buildComparisonSheet, buildPreviewSheet, pngToCanvas, TREE_SPECIES, TREE_SIZES, hexOf, hexRamp,
};
if (require.main === module) main();
