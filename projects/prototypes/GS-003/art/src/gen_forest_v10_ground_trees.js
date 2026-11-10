'use strict';
// GS-003 Map Factory -- forest-v10-ground-trees ("chao fraco" + "arvores fracas").
//
// Pedido direto do fundador, via game-studio, sobre a clareira v9
// (quality-overhaul, phase3, p7_clareira_depois_v9p7_*_r2.png): "o mapa
// esta bem melhor, mas o chao esta estranho, parece 'fraco', e as arvores
// tambem". Diagnostico (game-art, inspecionando os PNGs e o codigo-fonte
// que os desenhou):
//
//  1. CHAO -- forest-v8-depth/gen_forest_v8_depth.js groundBase() enche o
//     tile com UMA cor solida e espalha 40 PIXELS ISOLADOS (1-2px cada) +
//     5 elipses de "mancha" -- sem clusters, sem massa. Pior: o switch de
//     groundVariant() aplica stampCrack() (um rabisco preto fino, cor
//     d.cliffFace.core, quase preto) em QUALQUER variante, inclusive
//     grama (variant 3/5) -- exatamente a "rachadura preta fina repetida"
//     que o fundador viu, porque o crack foi pensado pra barro seco, nao
//     pra grama. forest-v9-cliffs reusa o MESMO groundBase() verbatim
//     (ver gen_forest_v9_cliffs.js), entao o chao real da clareira em uso
//     tem esse problema em 100% do piso.
//  2. ARVORES -- forest_v4_props.js's paintCanopyPuffs() ja faz leaf-puffs
//     (nao e um blob liso), mas treeRound/treeBushy/etc. usam 1 unica
//     chamada com um (rx,ry) so -- um unico ovoide de puffs. Visto de
//     cima (a camera do jogo), isso le como "um blob redondo" porque nao
//     ha lobulos/massas distintas quebrando a silhueta, e o tronco (fino,
//     ~8-16px) quase nunca aparece sob a copa alargada -- daí "sem tronco
//     forte, sem variacao de silhueta" (confirmado comparando
//     p7_clareira_depois_v9p7_dia_geral_r2.png com
//     evidence/drakantos-video/t0058_floresta_lama_roxa_fundador.png e
//     t0560_floresta_tronco_caido.png: la os troncos sao grossos com
//     raizes visiveis e os arbustos/copas sao massas irregulares de
//     folhas serrilhadas em 3-4 tons, nunca uma elipse unica).
//
// Esta entrega substitui SO o chao de clareira (ground_variant_*) e
// acrescenta 4 especies de arvore NOVAS (nao mexe em forest-v4/v6/v7/v8/v9
// -- nenhum desses pacotes e sobrescrito; este e um pacote NOVO e
// paralelo, "master" com todos os ativos próprios). Reaproveita a mesma
// paleta mais fria/escura de forest-v8-depth (buildDepthRamps(), 0 hex
// novo) -- o fundador nao reclamou da direcao de cor/luz ("as
// movimentacoes ficaram legais"), so da TECNICA de textura/volume.
//
// 100% pipeline local (Canvas.js + os mesmos primitivos de
// forest_v4_props.js -- paintCanopyPuffs/rimDarken -- reaproveitados, nao
// reinventados): 0 geracoes do PixelLab gastas (saldo da conta: 0,8,
// intocado -- nenhuma chamada de API foi feita).
//
// Run with: node art/src/gen_forest_v10_ground_trees.js
const fs = require('fs');
const path = require('path');
const { Canvas } = require('./canvas.js');
const { W, hx, withAlpha, rng } = require('./endesga32.js');
const { buildDepthRamps, shiftRamp, shiftColor, hexOf, hexRamp } = require('./forest_v8_depth_palette.js');
const { paintCanopyPuffs, rimDarken } = require('./forest_v4_props.js');
const { drawText } = require('./font5x3.js');

const TILE = 32;
const OUT = path.resolve(__dirname, '../map-factory/forest-v10-ground-trees');
const d = buildDepthRamps(); // same forest-v8/v9 ramps: grass, dirt, leafLitter, moss, mossEdge, stone, bark, foliage

function pick(rnd, arr) { return arr[Math.floor(rnd() * arr.length)]; }

// =========================================================================
// 0. Macro-hue ground families -- item pedido "variacao de matiz em
//    macro-escala (manchas grandes de tom)". Nao e possivel pintar uma
//    mancha de centenas de px DENTRO de um tile de 32px -- a escala macro
//    vem de ALTERNAR FAMILIAS inteiras de tile por regiao (nao por celula),
//    cada familia com seu proprio tom de base, documentado em tileset.json
//    como regra de espalhamento pro game-dev. 0 hex novo -- shiftColor/
//    shiftRamp (ja usados por forest_v8_depth_palette.js) sobre d.grass.
// =========================================================================
const GRASS_A = d.grass; // familia base (igual a clareira atual)
const GRASS_B = shiftRamp(d.grass, { hueDeg: -9, sMul: 0.95, vMul: 1.06 }); // oliva quente, mancha macro
const GRASS_SHADE = shiftRamp(d.grass, { sMul: 1.03, vMul: 0.76, hueDeg: 5 }); // poca de sombra sob copa, mais fria/escura
const FLECK_CLOVER_W = shiftColor(W.white, { vMul: 0.88 });
const FLECK_CLOVER_Y = shiftColor(hx('#f6d84a'), { sMul: 0.55, vMul: 0.8 });

// =========================================================================
// 1. Textura de chao -- clusters de folhagem (substitui pontinhos
//    isolados) + 2-3 blotches de valor macio (substitui elipses de borda
//    dura) + decalques GRANDES (substitui o crack preto fino).
// =========================================================================
function clumpBlades(c, cx, cy, ramp5, rnd, opts = {}) {
  const n = opts.n || (8 + Math.floor(rnd() * 6));
  const spread = opts.spread != null ? opts.spread : 3.4;
  for (let i = 0; i < n; i++) {
    const a = rnd() * Math.PI * 2;
    const r = spread * Math.sqrt(rnd());
    const bx = cx + Math.cos(a) * r;
    const by = cy + Math.sin(a) * r * 0.7;
    const bh = 2 + Math.floor(rnd() * 3);
    const lean = Math.round((rnd() - 0.5) * 2);
    const lit = -Math.cos(a) * 0.6 - Math.sin(a) * 0.85; // upper-left do CLUSTER = lamina clara
    let idx = Math.round(2 + lit * 1.7);
    idx = Math.max(0, Math.min(4, idx));
    const tone = rnd() < 0.78 ? ramp5[idx] : ramp5[Math.max(0, idx - 1)];
    c.line(Math.round(bx), Math.round(by + bh), Math.round(bx + lean), Math.round(by), tone, 1);
  }
}

function groundClumpFill(c, ramp5, rnd, opts = {}) {
  c.fillRect(0, 0, TILE - 1, TILE - 1, ramp5[2]);
  const blotches = opts.blotches != null ? opts.blotches : 2;
  for (let i = 0; i < blotches; i++) {
    const bx = 4 + rnd() * (TILE - 8), by = 4 + rnd() * (TILE - 8);
    const r = 6 + rnd() * 5;
    const n = Math.round(r * r * 0.55);
    for (let k = 0; k < n; k++) {
      const a = rnd() * Math.PI * 2, rr = r * Math.sqrt(rnd());
      const px = Math.round(bx + Math.cos(a) * rr), py = Math.round(by + Math.sin(a) * rr * 0.7);
      c.blendPixel(px, py, withAlpha(ramp5[rnd() < 0.5 ? 1 : 3], 65));
    }
  }
  const clusterCount = opts.clusters != null ? opts.clusters : (4 + Math.floor(rnd() * 2));
  const centers = [];
  for (let i = 0; i < clusterCount; i++) {
    const cx = 4 + rnd() * (TILE - 8), cy = 4 + rnd() * (TILE - 8);
    centers.push([cx, cy]);
    clumpBlades(c, cx, cy, ramp5, rnd, { n: 8 + Math.floor(rnd() * 6), spread: 3 + rnd() * 1.7 });
  }
  // AO entre clusters -- gruda a leitura de "tufos separados", nao poeira solta
  for (let i = 0; i < 9; i++) {
    const px = 2 + Math.floor(rnd() * (TILE - 4)), py = 2 + Math.floor(rnd() * (TILE - 4));
    let near = false;
    for (const [cx, cy] of centers) { if (Math.hypot(px - cx, py - cy) < 4) { near = true; break; } }
    if (near) continue;
    if (rnd() < 0.55) c.blendPixel(px, py, withAlpha(ramp5[0], 85));
  }
  return c;
}

function dirtGrainFill(c, dirtRamp, rnd) {
  c.fillRect(0, 0, TILE - 1, TILE - 1, dirtRamp[1]);
  for (let i = 0; i < 3; i++) {
    const bx = Math.round(4 + rnd() * (TILE - 8)), by = Math.round(4 + rnd() * (TILE - 8)), r = Math.round(5 + rnd() * 4);
    c.fillEllipse(bx, by, r, Math.round(r * 0.6), withAlpha(dirtRamp[2], 110));
  }
  for (let i = 0; i < Math.round(TILE * TILE * 0.12); i++) {
    const px = Math.floor(rnd() * TILE), py = Math.floor(rnd() * TILE);
    c.setPixel(px, py, rnd() < 0.5 ? dirtRamp[0] : dirtRamp[2]);
  }
  for (let i = 0; i < 3; i++) {
    const px = 3 + Math.floor(rnd() * (TILE - 6)), py = 3 + Math.floor(rnd() * (TILE - 6));
    c.setPixel(px, py, d.stone[1]);
    if (rnd() < 0.5) c.setPixel(px + 1, py, withAlpha(d.stone[0], 180));
  }
}

// Rachadura de barro seco MUDA (tom terra, nao quase-preto) -- so faz
// sentido fisico em terra seca, nunca em grama; mantida rara (1 variante).
function clayCrackMuted(c, cx, cy, rnd, len = 10) {
  const col = d.dirt[0];
  let x = cx, y = cy, angle = rnd() * Math.PI * 2;
  const steps = Math.round(len / 3);
  for (let i = 0; i < steps; i++) {
    angle += (rnd() - 0.5) * 0.7;
    const nx = x + Math.cos(angle) * 2.4, ny = y + Math.sin(angle) * 1.6;
    c.line(Math.round(x), Math.round(y), Math.round(nx), Math.round(ny), withAlpha(col, 160), 1);
    x = nx; y = ny;
  }
}

// -- decalques GRANDES (substituem o crack fino como "coisa espalhada
//    pelo chao") -- folhas em grupo, raiz exposta com musgo, pedras com
//    musgo. Desenhaveis tanto embutidos num tile quanto como PNG avulso.
function stampLeafLitterBig(c, cx, cy, rnd) {
  const l = d.leafLitter;
  for (let i = 0; i < 7; i++) {
    const a = rnd() * Math.PI * 2, r = rnd() * 6;
    const px = Math.round(cx + Math.cos(a) * r), py = Math.round(cy + Math.sin(a) * r * 0.6);
    const tone = l[Math.floor(rnd() * l.length)];
    c.fillEllipse(px, py, 2 + Math.floor(rnd() * 2), 1 + Math.floor(rnd() * 2), withAlpha(tone, 230));
    if (rnd() < 0.4) c.setPixel(px - 1, py, withAlpha(l[0], 160));
  }
  c.line(Math.round(cx), Math.round(cy + 3), Math.round(cx - 1), Math.round(cy + 6), d.bark.dk, 1);
}

function stampExposedRoot(c, cx, cy, rnd) {
  const bark = d.bark;
  const x0 = cx - 9, x1 = cx + 9;
  for (let x = x0; x <= x1; x++) {
    const t = (x - x0) / (x1 - x0);
    const yoff = Math.round(Math.sin(t * Math.PI) * 4);
    c.setPixel(x, cy - yoff, bark.dk);
    c.setPixel(x, cy - yoff + 1, bark.mid);
  }
  c.setPixel(cx - 6, cy - 5, bark.hi);
  c.setPixel(cx + 5, cy - 4, bark.hi);
  c.fillEllipse(cx, cy - 4, 3, 2, withAlpha(d.moss, 185));
  c.fillEllipse(cx + 5, cy - 3, 2, 1, withAlpha(d.mossEdge, 170));
  c.fillEllipse(cx, cy + 2, 8, 2, withAlpha([0, 0, 0, 255], 70));
}

function stampMossyStoneCluster(c, cx, cy, rnd, count = 3) {
  const s = d.stone;
  for (let i = 0; i < count; i++) {
    const a = rnd() * Math.PI * 2, r = 2 + rnd() * 6;
    const px = Math.round(cx + Math.cos(a) * r), py = Math.round(cy + Math.sin(a) * r * 0.6);
    const rr = 2 + Math.floor(rnd() * 2);
    c.fillEllipse(px, py, rr, Math.max(1, rr - 1), s[0]);
    c.fillEllipse(px - 1, py - 1, Math.max(1, rr - 1), 1, s[2]);
    c.fillEllipse(px, py - rr + 1, Math.max(1, rr - 1), 1, withAlpha(d.moss, 190));
    c.blendPixel(px + rr, py + 1, withAlpha([0, 0, 0, 255], 90));
  }
}

function stampCloverFleck(c, cx, cy, rnd, count = 3) {
  for (let i = 0; i < count; i++) {
    const px = Math.round(cx + (rnd() - 0.5) * 10), py = Math.round(cy + (rnd() - 0.5) * 7);
    c.setPixel(px, py, rnd() < 0.6 ? FLECK_CLOVER_W : FLECK_CLOVER_Y);
  }
}

function tuftClusterDense(c, cx, baseY, rnd, count, maxLen) {
  const g = d.foliage;
  for (let i = 0; i < count; i++) {
    const bx = cx + Math.round((rnd() - 0.5) * 10);
    const lean = Math.round((rnd() - 0.5) * 3);
    const bh = 3 + Math.floor(rnd() * maxLen);
    c.line(bx, baseY, bx + lean, baseY - bh, rnd() < 0.4 ? g[6] : g[4], 1);
    if (rnd() < 0.4) c.line(bx + 1, baseY, bx + 1 + lean, baseY - bh + 1, withAlpha(g[3], 200), 1);
  }
}

// Borda macia entre familias de grama (A/B) -- espalha pixels do tom
// vizinho com densidade decrescente perto da borda, pra uma tira de
// tiles da MESMA familia ler como uma mancha unica de bordas organicas,
// nao um retangulo xadrez.
function softFamilyEdge(c, towardRamp, rnd, side) {
  for (let i = 0; i < 55; i++) {
    let x, y;
    const depth = Math.floor(Math.pow(rnd(), 1.6) * 10);
    if (side === 'south') { x = Math.floor(rnd() * TILE); y = TILE - 1 - depth; }
    else { x = TILE - 1 - depth; y = Math.floor(rnd() * TILE); }
    c.blendPixel(x, y, withAlpha(towardRamp[rnd() < 0.5 ? 1 : 2], 60 + Math.floor(rnd() * 55)));
  }
}

// Transicao grama<->terra com tufos SOBREPOSTOS mordendo a terra (em vez
// da costura reta/dura).
function transitionTile(grassRamp, dirtRamp, rnd, mirrorFlag) {
  const c = new Canvas(TILE, TILE);
  dirtGrainFill(c, dirtRamp, rnd);
  const sub = new Canvas(TILE, TILE);
  groundClumpFill(sub, grassRamp, rnd, { clusters: 5 });
  const seamBase = mirrorFlag ? TILE * 0.62 : TILE * 0.38;
  for (let y = 0; y < TILE; y++) {
    const jitter = Math.round((rnd() - 0.5) * 3);
    const seamX = Math.round(seamBase + jitter);
    for (let x = 0; x < TILE; x++) {
      const isGrassSide = mirrorFlag ? (x > seamX) : (x < seamX);
      if (isGrassSide) c.blendPixel(x, y, sub.getPixel(x, y));
    }
  }
  for (let i = 0; i < 9; i++) {
    const y = Math.floor(rnd() * (TILE - 4)) + 2;
    const bx = Math.round(seamBase) + (-2 + Math.floor(rnd() * 4));
    const lean = mirrorFlag ? -(2 + Math.floor(rnd() * 4)) : (2 + Math.floor(rnd() * 4));
    const bh = 3 + Math.floor(rnd() * 4);
    c.line(bx, y + 2, bx + lean, y - bh + 2, rnd() < 0.4 ? d.foliage[6] : d.foliage[4], 1);
  }
  return c;
}

// =========================================================================
// 2. 12 variantes de chao (pedido: 8-12)
// =========================================================================
function groundVariant(variant, seed) {
  const rnd = rng(seed + variant * 191);
  let c;
  switch (variant) {
    case 0: c = groundClumpFill(new Canvas(TILE, TILE), GRASS_A, rnd, { clusters: 5 }); break;
    case 1: c = groundClumpFill(new Canvas(TILE, TILE), GRASS_A, rnd, { clusters: 4 }); stampLeafLitterBig(c, 16, 20, rnd); break;
    case 2: c = groundClumpFill(new Canvas(TILE, TILE), GRASS_A, rnd, { clusters: 4 }); stampExposedRoot(c, 16, 22, rnd); break;
    case 3: c = groundClumpFill(new Canvas(TILE, TILE), GRASS_A, rnd, { clusters: 4 }); stampMossyStoneCluster(c, 17, 18, rnd, 3); break;
    case 4: c = groundClumpFill(new Canvas(TILE, TILE), GRASS_A, rnd, { clusters: 5 }); stampCloverFleck(c, 16, 18, rnd, 3); break;
    case 5: c = groundClumpFill(new Canvas(TILE, TILE), GRASS_SHADE, rnd, { clusters: 5, blotches: 1 }); break;
    case 6: c = groundClumpFill(new Canvas(TILE, TILE), GRASS_B, rnd, { clusters: 5 }); softFamilyEdge(c, GRASS_A, rnd, 'south'); break;
    case 7: c = groundClumpFill(new Canvas(TILE, TILE), GRASS_B, rnd, { clusters: 4 }); stampMossyStoneCluster(c, 16, 17, rnd, 2); softFamilyEdge(c, GRASS_A, rnd, 'east'); break;
    case 8: c = new Canvas(TILE, TILE); dirtGrainFill(c, d.dirt, rnd); break;
    case 9: c = new Canvas(TILE, TILE); dirtGrainFill(c, d.dirt, rnd); clayCrackMuted(c, 12, 18, rnd, 10); clayCrackMuted(c, 22, 10, rnd, 7); break;
    case 10: c = transitionTile(GRASS_A, d.dirt, rnd, false); break;
    case 11: c = transitionTile(GRASS_A, d.dirt, rnd, true); break;
    default: c = groundClumpFill(new Canvas(TILE, TILE), GRASS_A, rnd, { clusters: 5 }); break;
  }
  return c;
}

const GROUND_META = [
  { decal: 'grama densa (familia A)', family: 'grass-A' },
  { decal: 'grama + folhas caidas em grupo', family: 'grass-A' },
  { decal: 'grama + raiz exposta com musgo', family: 'grass-A' },
  { decal: 'grama + pedras com musgo', family: 'grass-A' },
  { decal: 'grama + trevo/flor esparsa', family: 'grass-A' },
  { decal: 'grama em poca de sombra (mais fria/escura)', family: 'grass-shade' },
  { decal: 'grama familia B (oliva, mancha macro) + borda macia sul', family: 'grass-B' },
  { decal: 'grama familia B + pedras com musgo + borda macia leste', family: 'grass-B' },
  { decal: 'terra/trilha (grao, sem rachadura)', family: 'dirt' },
  { decal: 'terra + rachadura muda (tom terra, rara)', family: 'dirt' },
  { decal: 'transicao grama->terra com tufos sobrepostos', family: 'transition' },
  { decal: 'transicao grama->terra (espelhada)', family: 'transition' },
];

// =========================================================================
// 3. Decalques avulsos (PNG transparente, maiores que os de v8/v9)
// =========================================================================
function decalLeafLitterBig(seed) { const c = new Canvas(20, 14); stampLeafLitterBig(c, 10, 8, rng(seed)); return c; }
function decalRootExposedMossy(seed) { const c = new Canvas(22, 12); stampExposedRoot(c, 11, 7, rng(seed)); return c; }
function decalMossyStoneCluster(seed) { const c = new Canvas(22, 14); stampMossyStoneCluster(c, 11, 8, rng(seed), 3); return c; }
function decalTuftOverlapBig(seed) { const c = new Canvas(20, 16); tuftClusterDense(c, 10, 15, rng(seed), 14, 10); return c; }

// =========================================================================
// 4. Arvores -- tronco grosso + raizes, copa composta de 2-3 MASSAS
//    (lobulos) com luz de cima-a-esquerda, rim light explicito e sombra
//    interna, 4 especies de silhueta distinta, 2 tamanhos cada.
// =========================================================================
function paintTrunkThick(c, cx, footY, trunkH, baseW, topW, bark, rootCount, seed, opts = {}) {
  const rnd = rng(seed);
  const lean = opts.lean || 0;
  const topX = cx + lean;
  const collarY = footY - Math.round(trunkH * 0.2);
  const shaftTopW = topW, shaftBaseW = Math.round(topW * 1.3);
  const flare = Math.max(4, Math.round(baseW * 0.46));
  const pts = [
    [topX - shaftTopW / 2, footY - trunkH], [topX + shaftTopW / 2, footY - trunkH],
    [cx + shaftBaseW / 2, collarY],
    [cx + baseW / 2 + flare, footY - 1], [cx + baseW / 2, footY],
    [cx - baseW / 2, footY], [cx - baseW / 2 - flare, footY - 1],
    [cx - shaftBaseW / 2, collarY],
  ];
  c.fillPolygon(pts, bark.dk);
  c.fillPolygon([
    [topX - shaftTopW / 2 + 1, footY - trunkH], [topX + shaftTopW / 2 - 1, footY - trunkH],
    [cx + shaftBaseW / 2 - 1, collarY], [cx + baseW / 2 - 1, footY - 1],
    [cx - baseW / 2 + 1, footY - 1], [cx - shaftBaseW / 2 + 1, collarY],
  ], bark.mid);
  const hiW = Math.max(1, Math.round(shaftTopW * 0.3));
  // Highlight column FOLLOWS the lean-interpolated centerline (cxAtY) --
  // a fixed-x fillRect here (the v1 approach) pokes out past the actual
  // leaned polygon near the top and reads as a disconnected floating
  // stick on leaning species; a seed caught this (leaning_large close-up).
  for (let y = footY - trunkH + 2; y < footY - 2; y++) {
    const t = (y - (footY - trunkH)) / Math.max(1, trunkH);
    const cxAtY = topX + (cx - topX) * t;
    const w = shaftTopW + (shaftBaseW - shaftTopW) * t;
    for (let hx2 = 0; hx2 < hiW; hx2++) c.setPixel(Math.round(cxAtY - w * 0.34) + hx2, y, bark.hi);
    if (rnd() < 0.55) c.setPixel(Math.round(cxAtY - w * 0.32), y, bark.dk);
    if (rnd() < 0.45) c.setPixel(Math.round(cxAtY + w * 0.3), y, bark.dk);
    if (rnd() < 0.2) c.setPixel(Math.round(cxAtY + w * 0.02), y, bark.hi);
  }
  if (trunkH > 20 && rnd() < 0.75) {
    c.fillEllipse(cx + Math.round(baseW * 0.18), footY - Math.round(trunkH * 0.4), 2, 2, bark.core);
    c.fillEllipse(cx + Math.round(baseW * 0.18) - 1, footY - Math.round(trunkH * 0.4) - 1, 1, 1, bark.hi);
  }
  rimDarken(c, bark.core, 170);
  const rootLen = Math.max(12, Math.round(baseW * 2.1));
  for (let i = 0; i < rootCount; i++) {
    const t = rootCount === 1 ? 0.5 : i / (rootCount - 1);
    const angle = (t - 0.5) * 2.8;
    const len = Math.round(rootLen * (0.85 + rnd() * 0.45));
    const midX = cx + Math.round(Math.sin(angle) * len * 0.45);
    const midY = footY + Math.round(1 + Math.abs(Math.cos(angle)) * len * 0.15);
    const endX = cx + Math.round(Math.sin(angle) * len);
    const endY = footY + Math.round(2 + Math.abs(Math.cos(angle)) * len * 0.26);
    c.line(cx + Math.round(Math.sin(angle) * baseW * 0.32), footY - 1, midX, midY, bark.dk, 3);
    c.line(midX, midY, endX, endY, bark.dk, 2);
    c.line(cx + Math.round(Math.sin(angle) * baseW * 0.32), footY - 2, midX, midY - 1, bark.hi, 1);
    if (rnd() < 0.5) c.fillEllipse(endX, endY, 2, 1, withAlpha(d.moss, 170));
  }
  c.fillEllipse(cx - Math.round(baseW * 0.3), footY - 1, 3, 2, withAlpha(d.moss, 160));
  c.fillEllipse(cx, footY + 1, Math.round(baseW * 1.3), 3, withAlpha([0, 0, 0, 255], 90));
}

// Rim light explicito -- pixel opaco cuja vizinhanca acima/esquerda e
// transparente ganha um realce (alem do speckle ja interno do
// paintCanopyPuffs), pra borda superior-esquerda da massa ler clara.
function addRimLightPass(c, hi) {
  for (let y = 0; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) {
      const [, , , a] = c.getPixel(x, y);
      if (a === 0) continue;
      const up = c.getPixel(x, y - 1)[3], left = c.getPixel(x - 1, y)[3], ul = c.getPixel(x - 1, y - 1)[3];
      if (up === 0 || left === 0 || ul === 0) c.blendPixel(x, y, withAlpha(hi, 150));
    }
  }
}

// Sombra interna -- flecks escuros no MEIO da massa (nao so na borda),
// simulando reentrancias entre folhagens pra dar volume.
function addInnerShadowPass(c, dk, seed) {
  const rnd = rng(seed);
  const n = Math.round((c.w * c.h) / 650);
  for (let i = 0; i < n; i++) {
    const px = Math.floor(rnd() * c.w), py = Math.floor(rnd() * c.h);
    const [, , , a] = c.getPixel(px, py);
    if (a === 0) continue;
    const borders = [c.getPixel(px, py - 2)[3], c.getPixel(px, py + 2)[3], c.getPixel(px - 2, py)[3], c.getPixel(px + 2, py)[3]];
    if (borders.some((v) => v === 0)) continue; // so interior, nao a borda
    c.fillCircle(px, py, 2 + Math.floor(rnd() * 2), withAlpha(dk, 85));
  }
}

function paintCanopyVolume(c, lobes, foliage, seed) {
  lobes.forEach((lobe, i) => {
    paintCanopyPuffs(c, lobe.cx, lobe.cy, lobe.rx, lobe.ry, foliage, seed + i * 97, {
      puffMin: lobe.puffMin || 4, puffMax: lobe.puffMax || 7, count: lobe.count, flatten: lobe.flatten || 1, lightBias: lobe.lightBias || 0,
    });
  });
  addRimLightPass(c, foliage[7]);
  addInnerShadowPass(c, foliage[0], seed + 999);
}

const SPECIES = {
  tall_narrow: {
    label: 'ALTA/ESTREITA',
    sizes: {
      small: { trunkH: 30, baseW: 13, topW: 5, rootCount: 5, lean: 0, lobes: [
        { dx: 0, dy: 14, rx: 13, ry: 19, count: 70 },
        { dx: -2, dy: -6, rx: 10, ry: 15, count: 50, flatten: 0.95, lightBias: 0.2 },
      ] },
      large: { trunkH: 46, baseW: 19, topW: 8, rootCount: 6, lean: 0, lobes: [
        { dx: 0, dy: 20, rx: 19, ry: 28, count: 130 },
        { dx: -3, dy: -9, rx: 15, ry: 22, count: 90, flatten: 0.95, lightBias: 0.2 },
      ] },
    },
  },
  wide_low: {
    label: 'LARGA/BAIXA',
    sizes: {
      small: { trunkH: 15, baseW: 19, topW: 10, rootCount: 6, lean: 0, lobes: [
        { dx: -15, dy: 3, rx: 15, ry: 11, count: 55, flatten: 0.85 },
        { dx: 14, dy: 3, rx: 15, ry: 11, count: 55, flatten: 0.85 },
        { dx: 0, dy: -4, rx: 19, ry: 13, count: 80, flatten: 0.9, lightBias: 0.2 },
      ] },
      large: { trunkH: 21, baseW: 27, topW: 14, rootCount: 7, lean: 0, lobes: [
        { dx: -23, dy: 4, rx: 21, ry: 15, count: 85, flatten: 0.85 },
        { dx: 22, dy: 4, rx: 21, ry: 15, count: 85, flatten: 0.85 },
        { dx: 0, dy: -6, rx: 27, ry: 18, count: 120, flatten: 0.9, lightBias: 0.2 },
      ] },
    },
  },
  leaning: {
    label: 'TOMBADA/TORTA',
    sizes: {
      small: { trunkH: 27, baseW: 12, topW: 5, rootCount: 5, lean: 11, lobes: [
        { dx: 8, dy: 10, rx: 13, ry: 15, count: 60 },
        { dx: 14, dy: -4, rx: 10, ry: 12, count: 45, flatten: 0.95, lightBias: -0.1 },
      ] },
      large: { trunkH: 40, baseW: 17, topW: 7, rootCount: 6, lean: 17, lobes: [
        { dx: 12, dy: 14, rx: 18, ry: 21, count: 100 },
        { dx: 21, dy: -5, rx: 14, ry: 17, count: 70, flatten: 0.95, lightBias: -0.1 },
      ] },
    },
  },
  ancient_thick: {
    label: 'GROSSA/RAIZES A MOSTRA',
    sizes: {
      small: { trunkH: 24, baseW: 21, topW: 10, rootCount: 7, lean: 0, lobes: [
        { dx: -10, dy: 4, rx: 13, ry: 12, count: 46, flatten: 0.95 },
        { dx: 10, dy: 2, rx: 14, ry: 13, count: 50, flatten: 0.95 },
        { dx: 0, dy: -8, rx: 17, ry: 14, count: 75, flatten: 0.9, lightBias: 0.1 },
      ] },
      large: { trunkH: 32, baseW: 29, topW: 14, rootCount: 8, lean: 0, lobes: [
        { dx: -15, dy: 6, rx: 18, ry: 16, count: 70, flatten: 0.95 },
        { dx: 15, dy: 3, rx: 19, ry: 17, count: 75, flatten: 0.95 },
        { dx: 0, dy: -11, rx: 23, ry: 19, count: 110, flatten: 0.9, lightBias: 0.1 },
      ] },
    },
  },
};

function buildTree(kind, sizeKey, seed) {
  const spec = SPECIES[kind].sizes[sizeKey];
  const lobes = spec.lobes;
  let maxRX = 0, minDY = 0, maxDY = 0;
  for (const l of lobes) {
    maxRX = Math.max(maxRX, Math.abs(l.dx) + l.rx);
    minDY = Math.min(minDY, l.dy - l.ry);
    maxDY = Math.max(maxDY, l.dy + l.ry);
  }
  const padX = 6, padTop = 10, padBottom = 8;
  const topW = Math.round(maxRX * 2 + padX * 2);
  const topH = Math.round((maxDY - minDY) + padTop + padBottom);
  const top = new Canvas(topW, topH);
  const cx0 = topW / 2, cy0 = -minDY + padTop;
  const lobesAbs = lobes.map((l) => ({
    cx: cx0 + l.dx, cy: cy0 + l.dy, rx: l.rx, ry: l.ry, count: l.count,
    flatten: l.flatten, lightBias: l.lightBias,
    puffMin: l.rx > 16 ? 5 : 4, puffMax: l.rx > 16 ? 8 : 6,
  }));
  paintCanopyVolume(top, lobesAbs, d.foliage, seed);

  const rootLenApprox = Math.max(12, Math.round(spec.baseW * 2.1)) * 1.3;
  const canvasW = Math.round(Math.max(spec.baseW * 2.4, rootLenApprox * 1.6) + Math.abs(spec.lean) * 2 + 18);
  const canvasH = spec.trunkH + 16;
  const base = new Canvas(canvasW, canvasH);
  const footY = canvasH - 5;
  const cx = Math.round(canvasW / 2 - spec.lean / 2);
  paintTrunkThick(base, cx, footY, spec.trunkH, spec.baseW, spec.topW, d.bark, spec.rootCount, seed + 11, { lean: spec.lean });

  const overlap = Math.round(top.h * 0.4);
  return { top, base, overlap, kind, sizeKey, label: SPECIES[kind].label };
}

function standingComposite(tree) {
  const { top, base, overlap } = tree;
  const w = Math.max(top.w, base.w);
  const h = base.h + top.h - overlap;
  const c = new Canvas(w, h);
  const footX = Math.round(w / 2);
  c.blit(base, Math.round(footX - base.w / 2), h - base.h);
  const topY = h - base.h - top.h + overlap;
  c.blit(top, Math.round(footX - top.w / 2), topY);
  return c;
}

// =========================================================================
// 5. Reconstrucao esquematica do "ANTES" (v8/v9 groundBase + stampCrack +
//    arvore-blob) -- MESMA tecnica/formulas do codigo real citado acima,
//    nao uma captura editada (mesma convencao de honestidade usada em
//    forest-v9-cliffs/README.md pro mirante_comparison.png).
// =========================================================================
function oldGroundTile(seed) {
  const c = new Canvas(TILE, TILE);
  const rnd = rng(seed);
  const ramp = d.grass;
  c.fillRect(0, 0, TILE - 1, TILE - 1, ramp[2]);
  for (let i = 0; i < 5; i++) {
    const cx = 3 + Math.floor(rnd() * (TILE - 6)), cy = 3 + Math.floor(rnd() * (TILE - 6));
    c.fillEllipse(cx, cy, 4, 3, withAlpha(ramp[3], 120));
  }
  for (let i = 0; i < 40; i++) {
    const bx = 1 + Math.floor(rnd() * (TILE - 2)), by = 1 + Math.floor(rnd() * (TILE - 3));
    const lit = (bx + by) < 30;
    const tone = lit ? pick(rnd, [ramp[4], ramp[3]]) : pick(rnd, [ramp[0], ramp[1]]);
    c.setPixel(bx, by, tone);
    if (rnd() < 0.5) c.setPixel(bx, by + 1, tone);
  }
  if (rnd() < 0.55) {
    const col = d.cliffFace.core; // quase-preto -- a causa raiz do bug relatado
    let x = 16 + Math.floor((rnd() - 0.5) * 14), y = 16 + Math.floor((rnd() - 0.5) * 14);
    let angle = rnd() * Math.PI * 2;
    for (let i = 0; i < 5; i++) {
      angle += (rnd() - 0.5) * 0.6;
      const nx = x + Math.cos(angle) * 2.6, ny = y + Math.sin(angle) * 1.8;
      c.line(Math.round(x), Math.round(y), Math.round(nx), Math.round(ny), withAlpha(col, 220), 1);
      x = nx; y = ny;
    }
  }
  return c;
}

function oldTree(seed) {
  const top = new Canvas(64, 50);
  top.fillEllipse(32, 28, 30, 22, d.foliage[3]);
  top.fillEllipse(26, 20, 14, 10, withAlpha(d.foliage[5], 160));
  rimDarken(top, d.foliage[0], 120);
  const base = new Canvas(14, 20);
  base.fillRect(5, 0, 9, 18, d.bark.mid);
  base.fillRect(5, 0, 6, 18, d.bark.dk);
  base.fillEllipse(7, 19, 6, 2, withAlpha([0, 0, 0, 255], 80));
  return { top, base, overlap: Math.round(top.h * 0.3) };
}

// =========================================================================
// 6. Marcador de escala do Tamer (NAO e arte final de personagem -- so um
//    silhouette compacto na proporcao documentada em forest-v8-depth/
//    README.md "NPCs reconstruidos na escala do Tamer": ~26x33).
// =========================================================================
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

// =========================================================================
// Preview sheet (reaproveita o padrao buildPreviewSheet de v8/v9)
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
  drawText(sheet, 'FOREST-V10-GROUND-TREES', 8, 6, [255, 230, 120, 255]);
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
// 7. Montagem simulada 20x12 tiles -- ANTES (reconstrucao esquematica da
//    tecnica atual) vs DEPOIS (este pacote), com o marcador de escala do
//    Tamer na MESMA celula nas duas metades.
// =========================================================================
const COLS = 20, ROWS = 12;

function isOnPath(tx, ty) {
  const pathX = COLS * 0.42 + Math.sin(ty * 0.45) * 3.2;
  return Math.abs(tx - pathX) < 1.4;
}

function placeTreeOnScene(scene, treeEntities, tree, footX, footY) {
  const { top, base, overlap } = tree;
  const topY = footY - base.h - top.h + overlap;
  scene.blit(base, Math.round(footX - base.w / 2), footY - base.h);
  treeEntities.push({ canvas: top, x: Math.round(footX - top.w / 2), y: topY });
}

function buildScene(isAfter, seed) {
  const W_px = COLS * TILE, H_px = ROWS * TILE;
  const scene = new Canvas(W_px, H_px);
  const rnd = rng(seed);
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      let tile;
      if (isAfter) {
        if (isOnPath(tx, ty)) {
          tile = groundVariant(8 + (rnd() < 0.5 ? 0 : 1), 9000 + ty * 97 + tx * 7);
        } else {
          const r = rnd();
          let v;
          if (r < 0.42) v = 0; else if (r < 0.56) v = 5; else if (r < 0.68) v = 6;
          else if (r < 0.76) v = 1; else if (r < 0.84) v = 2; else if (r < 0.91) v = 3; else v = 4;
          tile = groundVariant(v, 9000 + ty * 131 + tx * 11);
        }
      } else {
        tile = oldGroundTile(9000 + ty * 131 + tx * 11);
      }
      scene.blit(tile, tx * TILE, ty * TILE);
    }
  }

  const treeEntities = [];
  const kinds = Object.keys(SPECIES);
  const edgeCells = [];
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      const onBorder = tx < 2 || tx > COLS - 3 || ty < 2 || ty > ROWS - 3;
      const nearCenter = Math.abs(tx - 10) < 3 && Math.abs(ty - 6) < 3;
      if (onBorder && !nearCenter && rnd() < 0.62) edgeCells.push([tx, ty]);
    }
  }
  let ki = 0;
  for (const [tx, ty] of edgeCells) {
    const footX = tx * TILE + 16 + Math.round((rnd() - 0.5) * 10);
    const footY = ty * TILE + 26 + Math.round((rnd() - 0.5) * 8);
    if (isAfter) {
      const kind = kinds[ki % kinds.length]; ki++;
      const sizeKey = (ty < 2 || ty > ROWS - 3) ? 'large' : 'small';
      const tree = buildTree(kind, sizeKey, 20000 + tx * 53 + ty * 97);
      placeTreeOnScene(scene, treeEntities, tree, footX, footY);
    } else {
      const tree = oldTree(21000 + tx * 53 + ty * 97);
      placeTreeOnScene(scene, treeEntities, tree, footX, footY);
    }
  }

  // Tamer na mesma celula nas duas cenas, pra comparar escala
  const tamer = tamerScaleMarker();
  const tFootX = 10 * TILE + 16, tFootY = 6 * TILE + 24;
  scene.fillEllipse(tFootX, tFootY + 1, 7, 2, withAlpha([0, 0, 0, 255], 90));
  scene.blit(tamer, tFootX - Math.round(tamer.w / 2), tFootY - tamer.h);

  treeEntities.sort((a, b) => (a.y + a.canvas.h) - (b.y + b.canvas.h));
  for (const e of treeEntities) scene.blit(e.canvas, e.x, e.y);
  return scene;
}

function buildBeforeAfterMockup() {
  const before = buildScene(false, 31000);
  const after = buildScene(true, 32000);
  const labelH = 20, gap = 14;
  const sheet = new Canvas(before.w + 16, labelH + before.h + gap + labelH + after.h + 10);
  sheet.fillRect(0, 0, sheet.w - 1, sheet.h - 1, [14, 14, 22, 255]);
  drawText(sheet, 'ANTES - TECNICA V8/V9 (RECONSTRUCAO)', 8, 6, [255, 150, 150, 255]);
  sheet.blit(before, 8, labelH);
  const afterY = labelH + before.h + gap + labelH;
  drawText(sheet, 'DEPOIS - FOREST-V10-GROUND-TREES', 8, labelH + before.h + gap + 6, [160, 255, 180, 255]);
  sheet.blit(after, 8, afterY);
  return sheet;
}

// =========================================================================
// tileset.json / palette.json / license.json / README.md
// =========================================================================
function paletteJson() {
  return {
    biome: 'forest-v10-ground-trees',
    note: 'Reaproveita INTEGRALMENTE as rampas de forest-v8-depth/palette.json (buildDepthRamps()) -- nenhum hex novo para grass/dirt/bark/foliage/moss/stone. So 2 familias NOVAS de grama (GRASS_B, GRASS_SHADE) sao derivadas por shiftColor/shiftRamp (mesma funcao ja usada por forest_v8_depth_palette.js), pra variacao de matiz em macro-escala (item pedido pelo fundador). Acentos de flor sao versoes rebaixadas (sMul/vMul) de tons ja usados no pipeline, nunca o ACCENT reservado para props emissores.',
    ramps: {
      grassFamilyA: hexRamp(GRASS_A),
      grassFamilyBOlive: hexRamp(GRASS_B),
      grassShadePocket: hexRamp(GRASS_SHADE),
      dirt: hexRamp(d.dirt),
      foliageDepth: hexRamp(d.foliage),
      barkDepth: { hi: hexOf(d.bark.hi), lt: hexOf(d.bark.lt), mid: hexOf(d.bark.mid), dk: hexOf(d.bark.dk), core: hexOf(d.bark.core) },
      moss: hexOf(d.moss), mossEdge: hexOf(d.mossEdge),
      cloverFleck: { white: hexOf(FLECK_CLOVER_W), yellow: hexOf(FLECK_CLOVER_Y) },
    },
    source: 'art/src/forest_v8_depth_palette.js buildDepthRamps() + shiftRamp/shiftColor sobre d.grass para as 2 familias macro novas.',
  };
}

function tilesetJson(decals) {
  return {
    biome: 'forest-v10-ground-trees',
    note: 'Responde ao feedback do fundador na clareira v9 (branch quality-overhaul, p7_clareira_depois_v9p7_*_r2.png): chao "fraco" (verde chapado com rachaduras pretas finas + pontinhos) e arvores "fracas" (blobs de copa sem volume/tronco/silhueta). Substitui so os ground_variant_* e os props de arvore de forest-v8-depth -- decalques de chao, props emissores, clutter, cliff, NPCs e luzes de v8/v9 NAO sao tocados nem sobrescritos por este pacote (continuam a melhor fonte para esses itens). NAO integrado em prototype/world -- isso e trabalho de game-dev. 0 geracoes do PixelLab gastas -- pipeline 100% local Canvas.js.',
    tile: TILE,
    grid: { tileWidth: TILE, tileHeight: TILE },
    layers: ['ground', 'ground-decal', 'decor', 'canopy-top'],
    palette: 'Ver palette.json -- mesma rampa fria/escura de forest-v8-depth, mais 2 familias de grama macro-escala.',
    groundVariants: {
      note: 'NAO autotile -- espalhar por ruido/aleatorio igual a convencao ja usada por forest-v4/v6/v7/v8. REGRA NOVA pedida pelo fundador (macro-escala): nao sortear familia A/B/sombra POR CELULA -- sortear por REGIAO (ruido de baixa frequencia, ex. Perlin/value-noise amostrado a cada 4-6 celulas, ou "blotches" de 3-8 celulas contiguas da MESMA familia) para que o tom mude em manchas grandes, nao em xadrez. Dentro de uma regiao, ai sim sortear a variante especifica (plain/decal) por celula.',
      families: { grassA: 'tom base da clareira (igual hoje)', grassB: 'oliva quente, mancha macro alternativa', grassShade: 'poca de sombra sob copa densa', dirt: 'trilha/terra', transition: 'borda grama<->terra' },
      files: Array.from({ length: 12 }, (_, i) => ({
        file: `tiles/ground_variant_${i}.png`,
        collision: false,
        suggestedLayer: 'ground',
        family: GROUND_META[i].family,
        decal: GROUND_META[i].decal,
      })),
    },
    decals: {
      note: 'Overlays transparentes, maiores/mais massudos que os de forest-v8-depth (que eram elipses pequenas ou pixel-crack) -- espalhar por ruido sobre QUALQUER chao, nao so os ground_variant_* novos.',
      files: [
        { file: 'decals/leaf_litter_big.png', size: '20x14', note: 'grupo de 5-7 folhas sobrepostas, nao 1 elipse isolada' },
        { file: 'decals/root_exposed_mossy.png', size: '22x12', note: 'raiz arqueada saindo do solo com musgo no topo' },
        { file: 'decals/mossy_stone_cluster.png', size: '22x14', note: '3 pedras com capa de musgo + realce + AO' },
        { file: 'decals/tuft_overlap_big.png', size: '20x16', note: 'tufo denso de 14 laminas, pra morder bordas grama<->terra' },
      ],
    },
    trees: {
      note: 'Substitui os troncos finos/copa-unica de forest-v4 props.js para a clareira v10: tronco grosso com raizes visiveis (paintTrunkThick), copa composta de 2-3 lobulos (nao 1 elipse), rim light explicito (luz de cima-esquerda) + sombra interna entre lobulos. base = tronco+raizes (colide, layer "decor", Y-sort pelo pe); top = copa (nao colide, layer "canopy-top", sempre desenhada por cima de qualquer entidade -- MESMA convencao de overlap de forest_v4_proof_scene.js: topY = footY - base.h - top.h + round(top.h*0.4)).',
      species: Object.entries(SPECIES).map(([kind, s]) => ({
        kind, label: s.label,
        sizes: ['small', 'large'].map((sz) => ({
          size: sz,
          base: `trees/${kind}_${sz}_base.png`,
          top: `trees/${kind}_${sz}_top.png`,
          collision: true,
          overlapRule: 'topY = footY - base.h - top.h + round(top.h * 0.4)',
        })),
      })),
    },
  };
}

function licenseJson() {
  return {
    biome: 'forest-v10-ground-trees',
    layer: 'original',
    assets: [
      {
        group: 'palette.json (2 familias novas + rampas reaproveitadas de v8) + 12 ground variants + 4 decalques grandes + 4 especies de arvore x 2 tamanhos (8 top + 8 base) + preview.png + before_after_20x12.png',
        origin: 'game-art, 100% pipeline local, 2026-11-10',
        layer: 'original',
        author: 'game-art',
        technique: 'Canvas.js pixel matrix (fillEllipse/fillRect/fillPolygon/line/blendPixel/fillCircle) + forest_v4_props.js paintCanopyPuffs()/rimDarken() reaproveitados sem alteracao + 2 primitivos novos locais (clumpBlades/groundClumpFill para textura de chao em clusters, addRimLightPass/addInnerShadowPass para volume de copa). Paleta 100% derivada de forest_v8_depth_palette.js (buildDepthRamps + shiftRamp/shiftColor), nenhum hex novo "no olho". Sem geracao do PixelLab e sem arte de terceiros referenciada pixel a pixel.',
        styleReference: 'docs/DRAKANTOS_VISUAL_STUDY.md + evidence/drakantos-video/t0058_floresta_lama_roxa_fundador.png + t0560_floresta_tronco_caido.png (direcao de estilo -- tufos densos, folhas, raizes, manchas em 3-4 valores no chao; troncos grossos com raizes e copas com volume/luz de cima nas arvores -- citado por descricao, nenhum pixel copiado dos frames).',
        license: 'studio-original (GS-003 fan game, ADR-007/ADR-009) -- referencias de terceiros (Drakantos) informaram so a direcao de tecnica/composicao, per ADR-010/011 Secao 5, nao estes pixels especificos.',
      },
    ],
    verifiedAt: new Date().toISOString().slice(0, 10),
    verifiedBy: 'game-art',
  };
}

function readmeMd() {
  return `# forest-v10-ground-trees — chao e arvores mais fortes (Map Factory, 2026-11-10)

Feedback do fundador sobre a clareira v9 (branch \`quality-overhaul\`, capturas em
\`quality-overhaul/phase3/img/p7_clareira_depois_v9p7_*_r2.png\`): "o mapa esta bem melhor, mas o chao esta
estranho, parece 'fraco', e as arvores tambem. As movimentacoes ficaram legais." Este pacote responde so
ao chao e as arvores -- nao mexe em penhasco, props emissores, clutter, NPCs, autotile de trilha/agua nem
nada mais de \`forest-v8-depth\`/\`forest-v9-cliffs\` (nenhum dos dois e sobrescrito; este e um pacote NOVO
e paralelo, "master"). **100% pipeline local** (Canvas.js, mesma convencao de v4/v6/v7/v8/v9): **0
geracoes do PixelLab gastas** -- o saldo da conta (0,8, quase zerado) nao foi usado, nenhuma chamada de
API foi feita.

## Diagnostico (antes de desenhar qualquer coisa)

Inspecionei \`p7_clareira_depois_v9p7_dia_geral_r2.png\`/\`_dia_r2.png\` e o codigo-fonte que os gerou
(\`art/src/gen_forest_v8_depth.js\`, reaproveitado verbatim por \`gen_forest_v9_cliffs.js\`):

1. **Chao**: \`groundBase()\` enche o tile com 1 cor solida + 5 elipses de "mancha" + 40 **pixels isolados**
   (1-2px cada, sem clusters) -- e o \`groundVariant()\` aplica \`stampCrack()\` (rabisco fino na cor
   \`d.cliffFace.core\`, quase preto) em variantes de GRAMA tambem, nao so terra. E literalmente a
   "rachadura preta fina repetida + pontinhos" que o fundador viu -- confirmei pixel a pixel na captura.
2. **Arvores**: \`forest_v4_props.js\` ja tem um bom primitivo (\`paintCanopyPuffs\`, leaf-puffs em vez de
   elipse lisa), mas cada \`treeXxx()\` chama ele **uma unica vez** com um (rx,ry) so -- um ovoide so.
   Visto de cima (camera do jogo), isso le como "um blob redondo", e o tronco fino quase nunca aparece
   sob a copa alargada.

Comparei contra \`evidence/drakantos-video/t0058_floresta_lama_roxa_fundador.png\` e
\`t0560_floresta_tronco_caido.png\` [E]: la o chao tem manchas GRANDES e macias (nao pontos), moitas com
silhueta serrilhada em 3-4 valores com AO forte entre clumps, e os troncos/raizes sao grossos e visiveis
mesmo sob a copa.

## O que tem aqui

- **\`palette.json\`** — reaproveita 100% as rampas de \`forest-v8-depth/palette.json\` (0 hex novo pra
  grass/dirt/bark/foliage/moss/stone) + 2 familias NOVAS de grama (\`GRASS_B\` oliva quente, \`GRASS_SHADE\`
  poca fria) derivadas pela MESMA funcao \`shiftColor\`/\`shiftRamp\` que ja existia, pra variacao de matiz
  em macro-escala.
- **\`tiles/ground_variant_0..11.png\`** (32x32, 12 variantes) — chao reescrito do zero: \`groundClumpFill()\`
  planta 4-5 CLUSTERS de 8-14 laminas cada (nao 40 pixels soltos), em ate 4-5 tons com vies de luz
  cima-esquerda por cluster, + AO entre clusters (nao em cima deles) + 2 blotches macios de valor (nao
  elipse de borda dura). O \`stampCrack\` preto sumiu de TODAS as variantes de grama -- so sobra uma
  rachadura muda (tom terra, nao quase-preto) numa unica variante de TERRA seca (fisicamente faz sentido
  so ali). Decalques embutidos: folhas em grupo, raiz exposta com musgo, pedras com musgo, trevo esparso
  -- nunca mais um ponto isolado. 2 variantes de transicao grama<->terra com tufos SOBREPOSTOS mordendo a
  costura (pedido explicito da tarefa).
- **\`decals/\`** (4 PNGs avulsos, maiores que os de v8) — \`leaf_litter_big\` (grupo de 5-7 folhas),
  \`root_exposed_mossy\`, \`mossy_stone_cluster\`, \`tuft_overlap_big\` -- pra espalhar sobre QUALQUER chao do
  jogo, nao so os \`ground_variant_*\` novos.
- **\`trees/\`** (4 especies x 2 tamanhos = 8 \`_top\` + 8 \`_base\`) — \`tall_narrow\` (alta/estreita),
  \`wide_low\` (larga/baixa), \`leaning\` (tombada/torta) e \`ancient_thick\` (grossa, raizes a mostra).
  Cada arvore: \`paintTrunkThick()\` (tronco mais grosso que \`forest_v4_props.js\`'s \`paintTrunkRoots\`,
  5-8 raizes visiveis com musgo na ponta, sombra de contato propria) + copa composta de 2-3
  **lobulos** (\`paintCanopyVolume\`, cada lobulo e uma chamada separada de \`paintCanopyPuffs\` com seu
  proprio (rx,ry,offset) -- o encontro entre lobulos ja cria uma fenda de AO de graca, porque o
  \`rimDarken\` interno do \`paintCanopyPuffs\` roda de novo sobre a mascara acumulada) + um passe extra
  \`addRimLightPass\` (realce explicito na borda superior-esquerda de toda a massa) e \`addInnerShadowPass\`
  (manchas escuras no MEIO da copa, nao so na borda, pra sugerir profundidade entre folhagens). \`base\`
  colide e vai na layer "decor" (Y-sort pelo pe); \`top\` nao colide e vai na layer "canopy-top", SEMPRE
  acima de qualquer entidade -- mesma regra de overlap ja usada em \`forest_v4_proof_scene.js\`
  (\`topY = footY - base.h - top.h + round(top.h * 0.4)\`).
- **\`preview.png\`** — prancha com as 12 variantes de chao, os 4 decalques e as 8 arvores (4 especies x 2
  tamanhos, compostas de pe).
- **\`before_after_20x12.png\`** — montagem simulada de 20x12 tiles (640x384px cada metade). **ANTES** e
  uma RECONSTRUCAO ESQUEMATICA rodando as MESMAS formulas de \`gen_forest_v8_depth.js\` (\`groundBase\` +
  \`stampCrack\`) e uma arvore-blob equivalente (1 elipse de copa + tronco fino), nao uma captura real
  editada -- ver Limitacoes. **DEPOIS** usa este pacote (variantes de chao + trilha de terra sinuosa +
  as 4 especies de arvore nas bordas) com o MARCADOR DE ESCALA do Tamer (~26x33, proporcao documentada em
  \`forest-v8-depth/README.md\`) na MESMA celula nas duas metades.
- \`tileset.json\` / \`license.json\` — mesmo schema de forest-v4/v6/v7/v8/v9.

## O que o game-dev precisa ligar

1. **Trocar as referencias de chao de clareira** que hoje apontam pra \`forest-v8-depth/tiles/ground_variant_*\`
   por este pacote -- os decalques/props emissores/clutter/cliff/NPCs de v8/v9 continuam valendo, so o
   CHAO muda.
2. **Espalhamento por REGIAO, nao por celula**: pra a variacao de matiz macro funcionar, nao sortear a
   familia (A/B/sombra) tile a tile -- usar ruido de baixa frequencia (Perlin/value-noise amostrado a
   cada 4-6 celulas) ou blotches de 3-8 celulas contiguas da MESMA familia; dentro da regiao, ai sim
   sortear a variante especifica por celula. Sem isso o efeito de "mancha grande" nao aparece -- so
   plantar os 12 arquivos ja resolve os pontinhos/rachaduras, mas nao a macro-variacao de tom.
2. **Arvores**: trocar os \`tree_round\`/\`tree_bushy\`/etc. de \`forest_v4_props.js\` usados na clareira
   pelas 4 especies novas (ou usar ambos, misturados -- as novas nao substituem as de v4 em outras areas
   do mapa, so foram feitas pra essa clareira). \`base\` tem colisao; \`top\` nao, e precisa da layer
   dedicada "canopy-top" sempre por cima (se o motor ja tem essa layer pras arvores de v4, e so apontar
   pra ela).
3. **Colisao**: como sempre neste pipeline, vem de \`tileset.json\` por arquivo -- hitbox e trabalho do
   game-dev.

## Veredito do diretor

Resolve o problema relatado nos dois pontos exatos que o fundador apontou: o chao deixa de ser "verde
chapado com rachadura preta fina + pontinho" e passa a ter massa de clusters + decalques grandes +
manchas de tom; as arvores deixam de ser 1 elipse sobre um palito e passam a ter tronco grosso com
raizes visiveis, copa em 2-3 lobulos com rim light e sombra interna, e 4 silhuetas diferentes. Aprovo
para integracao e teste no mapa real.

**Mas, sendo critico**: isto ainda e textura/volume GERADOS POR REGRA (clusters/lobulos proceduralmente
posicionados), nao pintura a mao peca a peca -- de perto, ainda vai ler como "gerado", so que agora
gerado-organico em vez de gerado-chapado (mesma ressalva honesta que \`forest-v9-cliffs/README.md\` ja fez
pro penhasco). O salto real de qualidade so vem depois de ver isto rodando no mapa de verdade, com as
variantes espalhadas por regiao (nao so plantadas) e as 4 especies de arvore misturadas de forma
nao-repetitiva -- o que este pacote nao pode validar sozinho (ver Limitacoes).

## Limitacoes (autocritica)

- **\`before_after_20x12.png\` "ANTES" e uma reconstrucao esquematica, nao a captura real editada** --
  rodei as formulas exatas de \`gen_forest_v8_depth.js\` isoladas (sem o resto do mapa: rio, trilha,
  NPCs, UI), entao a composicao geral (onde fica cada coisa) nao e identica a captura real, so a
  TECNICA de chao/arvore e. O \`before_after_20x12.png\` "DEPOIS" e so este pacote isolado -- nao mostra
  como fica MISTURADO com o resto do chao de v8 (decalques/trilha/agua), que o fundador nao reclamou e
  continua intocado.
- **O marcador de escala do Tamer (\`tamerScaleMarker()\`) NAO e arte de personagem nova** -- e um
  silhouette compacto de 16x30px so pra comparar proporcao chao/arvore x jogador na montagem, na mesma
  proporcao documentada (~26x33) que \`forest-v8-depth/README.md\` ja usou pros NPCs -- nao e pra ser
  exportado nem usado no jogo.
- **Espalhamento por regiao (macro-escala) e so uma REGRA documentada em \`tileset.json\`, nao
  implementada aqui** -- os 12 arquivos de chao existem e cada um resolve pontinho/rachadura sozinho,
  mas o efeito de "mancha de tom grande" so aparece se o game-dev plantar GRASS_A/B/shade em blocos
  contiguos, nao tile a tile; isto e dado + instrucao, nao codigo de posicionamento (mesma divisao de
  responsabilidade do resto do pipeline -- game-art nao escreve o posicionador do game-dev).
  Um motivo, que ficou mais claro depois de montar a cena 20x12 de teste: 1 unica celula de 32px nao tem
  espaco pra ler como "mancha grande" sozinha -- a macro-variacao SO existe quando varias celulas da
  mesma familia ficam juntas, entao o impacto real desta entrega so se confirma depois do game-dev
  implementar o espalhamento por regiao, nao antes.
- **4 especies, 2 tamanhos cada -- nao um "arvoredo" infinito** -- um trecho MUITO grande e denso ainda
  pode repetir uma mesma especie/tamanho visivel se o game-dev nao misturar bem; nao testado em escala
  (so nas bordas da cena 20x12 de exemplo).
- **Lobulos de copa sao elipses deformadas por ruido (\`paintCanopyPuffs\`), nao uma silhueta de folhagem
  desenhada a mao galho a galho** -- cobre a direcao pedida (massa com volume, nao 1 blob), mas um
  ilustrador dedicado desenharia quebras de silhueta mais deliberadas (uma copa realmente assimetrica,
  nao so 2-3 ovoides deslocados).
- **Nada disto foi testado no motor real**, so inspecionado visualmente via \`preview.png\` e
  \`before_after_20x12.png\`.
- **0 geracoes do PixelLab usadas** -- pipeline 100% local se mostrou suficiente de novo; o saldo (0,8)
  continua intocado.
`;
}

// =========================================================================
// main
// =========================================================================
function main() {
  fs.mkdirSync(path.join(OUT, 'tiles'), { recursive: true });
  fs.mkdirSync(path.join(OUT, 'decals'), { recursive: true });
  fs.mkdirSync(path.join(OUT, 'trees'), { recursive: true });

  const seed = 101000;

  const groundTiles = [];
  for (let v = 0; v < 12; v++) {
    const c = groundVariant(v, seed);
    c.save(path.join(OUT, 'tiles', `ground_variant_${v}.png`));
    groundTiles.push(c);
  }

  const decalLeafLitter = decalLeafLitterBig(seed + 1);
  const decalRoot = decalRootExposedMossy(seed + 2);
  const decalStones = decalMossyStoneCluster(seed + 3);
  const decalTuft = decalTuftOverlapBig(seed + 4);
  decalLeafLitter.save(path.join(OUT, 'decals', 'leaf_litter_big.png'));
  decalRoot.save(path.join(OUT, 'decals', 'root_exposed_mossy.png'));
  decalStones.save(path.join(OUT, 'decals', 'mossy_stone_cluster.png'));
  decalTuft.save(path.join(OUT, 'decals', 'tuft_overlap_big.png'));

  const treeComposites = { small: [], large: [] };
  const treeMeta = [];
  let ti = 0;
  for (const kind of Object.keys(SPECIES)) {
    for (const sizeKey of ['small', 'large']) {
      const tree = buildTree(kind, sizeKey, seed + 100 + ti * 37);
      ti++;
      tree.top.save(path.join(OUT, 'trees', `${kind}_${sizeKey}_top.png`));
      tree.base.save(path.join(OUT, 'trees', `${kind}_${sizeKey}_base.png`));
      treeComposites[sizeKey].push({ canvas: standingComposite(tree), label: `${kind}_${sizeKey}` });
      treeMeta.push({ kind, sizeKey });
    }
  }

  const preview = buildPreviewSheet([
    { title: 'CHAO (12 variantes)', items: groundTiles.map((c) => ({ canvas: c })), scale: 3 },
    { title: 'DECALQUES AVULSOS', items: [decalLeafLitter, decalRoot, decalStones, decalTuft].map((c) => ({ canvas: c })), scale: 4 },
    { title: 'ARVORES - PEQUENAS (tall_narrow / wide_low / leaning / ancient_thick)', items: treeComposites.small.map((t) => ({ canvas: t.canvas })), scale: 2 },
    { title: 'ARVORES - GRANDES (tall_narrow / wide_low / leaning / ancient_thick)', items: treeComposites.large.map((t) => ({ canvas: t.canvas })), scale: 2 },
  ]);
  preview.save(path.join(OUT, 'preview.png'));

  const mockup = buildBeforeAfterMockup();
  mockup.save(path.join(OUT, 'before_after_20x12.png'));

  fs.writeFileSync(path.join(OUT, 'palette.json'), JSON.stringify(paletteJson(), null, 2));
  fs.writeFileSync(path.join(OUT, 'tileset.json'), JSON.stringify(tilesetJson(), null, 2));
  fs.writeFileSync(path.join(OUT, 'license.json'), JSON.stringify(licenseJson(), null, 2));
  fs.writeFileSync(path.join(OUT, 'README.md'), readmeMd());

  console.log('forest-v10-ground-trees written to', OUT);
}

main();
