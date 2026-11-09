'use strict';
// GS-003 -- Digimon selvagens do mundo a partir das folhas de Digimon World DS do Spriters Resource
// (10-source-files/spriters-resource/dgmnworldds__*.png, camada official-fan-use, ADR-009).
//
//   node import_wild_dwds.js --index   # folha de contato numerada dos quadros de mapa achados (para conferir direções)
//   node import_wild_dwds.js           # grava CREATURE-01NN/ (creature.json v2, license.json, sprites, folha + atlas)
//
// Diferente de import_dwds_sheets.py (tabela de regiões feita à mão por folha), aqui o recorte é automático:
//  1. cores-chave = cores que formam algum bloco liso de 12x12 (fundo e caixas da folha; sprite DS nunca tem isso);
//  2. componentes conexos (8-viz.) do resto, fundidos a <= 2 px;
//  3. quadros de mapa = o maior grupo de componentes pequenos (altura 12..48) de alturas parecidas (o walk do DS),
//     em ordem de grade (linha, depois x). A tabela SPECIES só diz quais índices são S/N/W/E -- conferidos no olho
//     na folha de contato (--index) [H].
// Saída no mesmo contrato do creature.json v2 do importador v1/v2: walk/idle por direção (E espelhado de W quando
// não desenhado), pivô nos pés, ciclo f0-f1-f0-f2, idle = quadro do meio. Sem attack/hurt de mapa (o renderer
// usa o avanço procedural, como no Gigimon/Dorimon).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const AS = path.resolve(__dirname, '../../art/src');
const { loadSheetCanvas: loadPlainPng } = require(path.join(AS, 'dwds_extract.js'));
const { Canvas } = require(path.join(AS, 'canvas.js'));
const { drawText } = require(path.join(AS, 'font5x3.js'));

const STUDIO = path.resolve(__dirname, '../../../../..');
const GA = path.join(STUDIO, 'assets/GAME-ASSETS');
const SRC = path.join(GA, '10-source-files/spriters-resource');
const CRE = path.join(GA, '01-creatures');
const PREVIEWS = path.join(GA, '09-previews');
const TODAY = '2026-11-09';
const SR_PAGE = 'https://www.spriters-resource.com/ds_dsi/dgmnworldds/';
const COPYRIGHT = 'Digimon (c) Bandai Namco Entertainment Inc. / Toei Animation; Digimon World DS (c) Bandai Namco Games';
const WALK_FRAME_MS = 150;

// id: bloco 01NN do game-dev (o game-art usa a sequência 00NN). walk: índices 1-based na grade de mapa (--index).
// stage: 1 bebê, 2 criança, 3 adulto, 4 perfeito. credit: texto da própria folha.
const SPECIES = [
  { cid: 'CREATURE-0101', name: 'Dorumon', file: 'Dorumon__48420', stage: 2, credit: { ripper: 'Mighty Jetters, redblueyellow', text: 'Dorumon from Digimon World DS ripped by Mighty Jetters and redblueyellow. Credit is not required.', required: false }, walk: { W: [1, 2, 3], S: [4, 5, 6] } },
  { cid: 'CREATURE-0102', name: 'Dorugamon', file: 'Dorugamon__48574', stage: 3, walk: { S: [1, 2, 3], W: [4, 5, 6], N: [7, 8, 9] } },
  { cid: 'CREATURE-0103', name: 'DoruGreymon', file: 'DoruGreymon__48605', stage: 4, walk: { N: [1, 2, 3], W: [4, 5, 6], S: [7, 8, 9] } },
  { cid: 'CREATURE-0104', name: 'Biyomon', file: 'Biyomon__48423', stage: 2, credit: { ripper: 'Mighty Jetters, redblueyellow', text: 'Biyomon from Digimon World DS ripped by Mighty Jetters and redblueyellow. Credit is not required.', required: false }, walk: { W: [1, 2, 3], S: [4, 5, 6], N: [7, 8] } },
  { cid: 'CREATURE-0105', name: 'Gomamon', file: 'Gomamon__48321', stage: 2, credit: { ripper: 'RadSpyro', text: 'Ripped by RadSpyro. Credit appreciated.', required: true }, walk: { S: [1, 2, 3], W: [4, 5, 6], N: [7, 8, 9] } },
  { cid: 'CREATURE-0106', name: 'Tentomon', file: 'Tentomon__48424', stage: 2, walk: { N: [1, 2, 3], W: [4, 5, 6], S: [7, 8, 9] } },
  { cid: 'CREATURE-0107', name: 'Palmon', file: 'Palmon__48283', stage: 2, credit: { ripper: 'redblueyellow', text: 'Ripped by redblueyellow. No credit needed.', required: false }, walk: { S: [2, 3, 4], W: [5, 6, 7], N: [8, 9, 10] } },
  { cid: 'CREATURE-0108', name: 'Betamon', file: 'Betamon__48421', stage: 2, walk: { W: [1, 2, 3], N: [4, 5, 6], S: [7, 8, 9] } },
  { cid: 'CREATURE-0109', name: 'Gotsumon', file: 'Gotsumon__48428', stage: 2, walk: { W: [1, 2, 3], S: [4, 5, 6] } },
  { cid: 'CREATURE-0110', name: 'Numemon', file: 'Numemon__48598', stage: 3, walk: { S: [2, 3, 4], W: [5, 6, 7], N: [8, 9, 10] } },
  { cid: 'CREATURE-0111', name: 'Floramon', file: 'Floramon__48316', stage: 2, walk: { S: [2, 3, 4], W: [5, 6, 7], N: [8, 9, 10] } },
  { cid: 'CREATURE-0112', name: 'Hagurumon', file: 'Hagurumon__48317', stage: 2, walk: { S: [2, 3, 4], W: [5, 6, 7], N: [8, 9, 10] } },
  { cid: 'CREATURE-0113', name: 'Crabmon', file: 'Crabmon__48327', stage: 2, keys: ['50b058'], walk: { S: [2, 3, 4], W: [5, 6, 7], N: [8, 9, 10] } },
  { cid: 'CREATURE-0114', name: 'Otamamon', file: 'Otamamon__48426', stage: 2, walk: { W: [1, 2, 3], S: [4, 5, 6] } },
  { cid: 'CREATURE-0115', name: 'Goburimon', file: 'Goburimon__48522', stage: 2, walk: { W: [1, 2, 3], S: [4, 5] } },
  { cid: 'CREATURE-0116', name: 'Tanemon', file: 'Tanemon__48413', stage: 1, walk: { N: [1, 2, 3], S: [4, 5, 6] } },
  { cid: 'CREATURE-0117', name: 'Lalamon', file: 'Lalamon__48432', stage: 2, walk: { S: [2, 3, 4], W: [5, 6, 7], N: [8, 9, 10] } },
  { cid: 'CREATURE-0118', name: 'Penguinmon', file: 'Penguinmon__48521', stage: 2, walk: { N: [1, 2, 3], W: [4, 5, 6], S: [7, 8] } },
];

const STAGE_NAME = { 1: 'in-training', 2: 'rookie', 3: 'champion', 4: 'ultimate' };

// Algumas folhas do Spriters Resource são PNG entrelaçado (o decodificador puro do art/src não lê): nesse caso
// decodifica pelo @napi-rs/canvas que o projeto world já tem em devDependencies.
const decoded = new Map();
function loadSheetCanvas(file) {
  if (decoded.has(file)) return decoded.get(file);
  return loadPlainPng(file);
}
/** Pré-decodifica (assíncrono) as folhas entrelaçadas pelo @napi-rs/canvas. */
async function predecode(files) {
  const napi = require(path.resolve(__dirname, '../../prototype/world/node_modules/@napi-rs/canvas'));
  for (const file of files) {
    try {
      loadPlainPng(file);
      continue;
    } catch (e) {
      if (!/interlaced/.test(String(e))) throw e;
    }
    const img = await napi.loadImage(fs.readFileSync(file));
    const cv = napi.createCanvas(img.width, img.height);
    const g = cv.getContext('2d');
    g.drawImage(img, 0, 0);
    const c = new Canvas(img.width, img.height);
    Buffer.from(g.getImageData(0, 0, img.width, img.height).data.buffer).copy(c.data);
    decoded.set(file, c);
  }
}

function sheetPath(s) {
  return path.join(SRC, `dgmnworldds__arrow-drop-down__${s.file}.png`);
}

const key = (c, x, y) => {
  const i = (y * c.w + x) * 4;
  return c.data[i + 3] === 0 ? -1 : (c.data[i] << 16) | (c.data[i + 1] << 8) | c.data[i + 2];
};

/** Cores com algum bloco liso de B x B (fundo/caixas da folha). Transparente sempre conta como chave. */
function keyColors(c, B = 12) {
  const run = new Int32Array(c.w * c.h);
  for (let y = 0; y < c.h; y++)
    for (let x = c.w - 1; x >= 0; x--) {
      const k = key(c, x, y);
      run[y * c.w + x] = x + 1 < c.w && key(c, x + 1, y) === k ? run[y * c.w + x + 1] + 1 : 1;
    }
  const keys = new Set([-1]);
  for (let x = 0; x < c.w; x++) {
    let streak = 0;
    let prev = null;
    for (let y = 0; y < c.h; y++) {
      const k = key(c, x, y);
      if (run[y * c.w + x] >= B && k === prev) streak++;
      else streak = run[y * c.w + x] >= B ? 1 : 0;
      prev = run[y * c.w + x] >= B ? k : null;
      if (streak >= B) keys.add(k);
    }
  }
  return keys;
}

/** Cores-chave automáticas + as da tabela (ex. caixas de quadro de 32x32 sem bloco liso), em hex RRGGBB. */
function sheetKeys(s, c) {
  const k = keyColors(c);
  for (const h of s.keys ?? []) k.add(parseInt(h, 16));
  return k;
}

function components(c, keys, merge = 2) {
  const fg = new Uint8Array(c.w * c.h);
  for (let y = 0; y < c.h; y++) for (let x = 0; x < c.w; x++) fg[y * c.w + x] = keys.has(key(c, x, y)) ? 0 : 1;
  const seen = new Uint8Array(c.w * c.h);
  let out = [];
  for (let y = 0; y < c.h; y++)
    for (let x = 0; x < c.w; x++) {
      if (!fg[y * c.w + x] || seen[y * c.w + x]) continue;
      const st = [[x, y]];
      seen[y * c.w + x] = 1;
      let x0 = x, x1 = x, y0 = y, y1 = y, n = 0;
      while (st.length) {
        const [px, py] = st.pop();
        n++;
        if (px < x0) x0 = px;
        if (px > x1) x1 = px;
        if (py < y0) y0 = py;
        if (py > y1) y1 = py;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            const qx = px + dx, qy = py + dy;
            if (qx < 0 || qy < 0 || qx >= c.w || qy >= c.h) continue;
            const j = qy * c.w + qx;
            if (fg[j] && !seen[j]) {
              seen[j] = 1;
              st.push([qx, qy]);
            }
          }
      }
      out.push({ x0, y0, x1, y1, n });
    }
  // funde caixas próximas (partes soltas do mesmo quadro: chifre, asa, sombra de 1 px)
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < out.length && !changed; i++)
      for (let j = i + 1; j < out.length; j++) {
        const a = out[i], b = out[j];
        if (a.x0 - merge <= b.x1 && b.x0 - merge <= a.x1 && a.y0 - merge <= b.y1 && b.y0 - merge <= a.y1) {
          out[i] = { x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1), n: a.n + b.n };
          out.splice(j, 1);
          changed = true;
          break;
        }
      }
  }
  return { fg, comps: out };
}

/** Quadros de mapa: o maior grupo de componentes pequenos com alturas parecidas, em ordem de grade. */
function mapFrames(c, keys) {
  const { fg, comps } = components(c, keys);
  const small = comps.filter((b) => {
    const w = b.x1 - b.x0 + 1, h = b.y1 - b.y0 + 1;
    return h >= 12 && h <= 48 && w >= 8 && w <= 56 && b.n >= 50;
  });
  let best = [];
  for (const ref of small) {
    const h = ref.y1 - ref.y0 + 1;
    const g = small.filter((b) => Math.abs(b.y1 - b.y0 + 1 - h) <= Math.max(5, h * 0.22));
    if (g.length > best.length) best = g;
  }
  // grade: agrupa por linha (centro vertical a <= meia altura) e ordena por x
  best.sort((a, b) => a.y0 - b.y0);
  const rows = [];
  for (const b of best) {
    const cy = (b.y0 + b.y1) / 2;
    const r = rows.find((r) => Math.abs(r.cy - cy) <= (b.y1 - b.y0 + 1) / 2);
    if (r) r.items.push(b);
    else rows.push({ cy, items: [b] });
  }
  return { fg, frames: rows.sort((a, b) => a.cy - b.cy).flatMap((r) => r.items.sort((a, b) => a.x0 - b.x0)) };
}

function cut(c, fg, b) {
  const out = new Canvas(b.x1 - b.x0 + 1, b.y1 - b.y0 + 1);
  for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++) if (fg[y * c.w + x]) out.setPixel(x - b.x0, y - b.y0, c.getPixel(x, y));
  return out;
}

function bbox(c) {
  let x0 = c.w, y0 = c.h, x1 = -1, y1 = -1;
  for (let y = 0; y < c.h; y++) for (let x = 0; x < c.w; x++) if (c.data[(y * c.w + x) * 4 + 3]) {
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  return { x0, y0, x1, y1 };
}

/** Mesmo tamanho para todos: pés na última linha, centróide horizontal no pivô (como normalize() do v2). */
function normalize(cells) {
  const cx = (c) => {
    let s = 0, n = 0;
    for (let y = 0; y < c.h; y++) for (let x = 0; x < c.w; x++) if (c.data[(y * c.w + x) * 4 + 3]) { s += x; n++; }
    return n ? s / n : c.w / 2;
  };
  const L = Math.max(...cells.map((c) => Math.ceil(cx(c)))) + 1;
  const R = Math.max(...cells.map((c) => Math.ceil(c.w - cx(c)))) + 1;
  const H = Math.max(...cells.map((c) => c.h)) + 1;
  const W = L + R;
  const out = cells.map((c) => {
    const o = new Canvas(W, H);
    o.blit(c, Math.round(L - cx(c)), H - 1 - c.h);
    return o;
  });
  return { cells: out, pivot: { x: L, y: H - 1 } };
}

function packSheet(rows) {
  const pad = 1;
  const W = Math.max(...rows.map((r) => r.reduce((s, x) => s + x.c.w + pad, pad)));
  const H = rows.reduce((s, r) => s + Math.max(...r.map((x) => x.c.h)) + pad, pad);
  const sheet = new Canvas(W, H);
  const frames = {};
  let y = pad;
  for (const r of rows) {
    let x = pad;
    for (const it of r) {
      sheet.blit(it.c, x, y);
      frames[it.key] = { frame: { x, y, w: it.c.w, h: it.c.h }, rotated: false, trimmed: false, spriteSourceSize: { x: 0, y: 0, w: it.c.w, h: it.c.h }, sourceSize: { w: it.c.w, h: it.c.h }, pivot: { x: it.pivot.x / it.c.w, y: it.pivot.y / it.c.h }, pivotPx: it.pivot };
      x += it.c.w + pad;
    }
    y += Math.max(...r.map((x) => x.c.h)) + pad;
  }
  return { sheet, frames };
}

function sheetCredit(s) {
  // texto de crédito da folha (lido no olho nas folhas de contato; quase todas são do mesmo grupo de rip)
  return s.credit ?? { ripper: 'Mighty Jetters, redblueyellow (conferir na folha)', text: 'Rip de Digimon World DS do Spriters Resource; ver a folha original.', required: false };
}

function indexSheet(only) {
  const S = 4;
  const list = only ? SPECIES.filter((s) => only.includes(s.name)) : SPECIES;
  const cellH = 220;
  const out = new Canvas(2200, list.length * cellH);
  out.fillRect(0, 0, out.w - 1, out.h - 1, [24, 26, 36, 255]);
  list.forEach((s, i) => {
    const c = loadSheetCanvas(sheetPath(s));
    const { fg, frames } = mapFrames(c, sheetKeys(s, c));
    const oy = i * cellH;
    drawText(out, `${s.name} ${frames.length}`, 4, oy + 4, [255, 230, 120, 255]);
    let x = 110;
    frames.forEach((b, k) => {
      const cell = cut(c, fg, b).scaleNearest(S);
      if (x + cell.w > out.w - 4) return;
      out.blit(cell, x, oy + 12);
      drawText(out, String(k + 1), x, oy + 16 + cell.h, [200, 220, 255, 255]);
      drawText(out, String(k + 1), x + 1, oy + 16 + cell.h, [200, 220, 255, 255]);
      x += cell.w + 8;
    });
  });
  const p = path.join(__dirname, 'wild_index.png');
  out.save(p);
  console.log('wrote', p);
}

function walkCycle(keys) {
  return keys.length === 3 ? [keys[0], keys[1], keys[0], keys[2]] : keys;
}
function standKey(keys) {
  return keys.length === 3 ? keys[1] : keys[0];
}

function importOne(s) {
  const file = sheetPath(s);
  const c = loadSheetCanvas(file);
  const { fg, frames } = mapFrames(c, sheetKeys(s, c));
  const used = Object.values(s.walk).flat();
  if (Math.max(...used) > frames.length) throw new Error(`${s.name}: ${frames.length} quadros de mapa, a tabela pede #${Math.max(...used)}`);
  const raw = Object.fromEntries(Object.entries(s.walk).map(([d, idx]) => [d, idx.map((i) => cut(c, fg, frames[i - 1]))]));
  const all = Object.values(raw).flat();
  const { cells, pivot } = normalize(all);
  let k = 0;
  const walk = Object.fromEntries(Object.entries(raw).map(([d, list]) => [d, list.map(() => cells[k++])]));
  const dirs = ['S', 'N', 'W', 'E'].filter((d) => walk[d]);
  if (!walk.W && walk.E) throw new Error(`${s.name}: sem W`);
  const keys = Object.fromEntries(dirs.map((d) => [d, walk[d].map((_, i) => `${s.cid}_walk_${d}_${String(i).padStart(2, '0')}.png`)]));
  const mirrored = walk.E ? {} : { E: 'W' };
  const d = path.join(CRE, s.cid);
  for (const sub of ['sprites', 'spritesheets', 'previews']) {
    fs.mkdirSync(path.join(d, sub), { recursive: true });
    for (const f of fs.readdirSync(path.join(d, sub))) fs.unlinkSync(path.join(d, sub, f));
  }
  const rows = dirs.map((dr) => walk[dr].map((cell, i) => ({ key: keys[dr][i], c: cell, pivot })));
  for (const r of rows) for (const it of r) it.c.save(path.join(d, 'sprites', it.key));
  const { sheet, frames: atlasFrames } = packSheet(rows);
  sheet.save(path.join(d, 'spritesheets', `${s.cid}.png`));
  fs.writeFileSync(path.join(d, 'spritesheets', `${s.cid}.atlas.json`), JSON.stringify({ frames: atlasFrames, meta: { app: 'GS-003 tools/dwds_import/import_wild_dwds.js', image: `${s.cid}.png`, format: 'RGBA8888', size: { w: sheet.w, h: sheet.h }, scale: '1' } }, null, 2) + '\n');
  // prévia 4x
  const S = 4;
  const pv = new Canvas(all.length * (cells[0].w * S + 4) + 4, cells[0].h * S + 8);
  pv.fillRect(0, 0, pv.w - 1, pv.h - 1, [30, 34, 44, 255]);
  dirs.flatMap((dr) => walk[dr]).forEach((cell, i) => pv.blit(cell.scaleNearest(S), 4 + i * (cells[0].w * S + 4), 4));
  pv.save(path.join(d, 'previews', 'map_walk_x4.png'));

  const standH = (() => {
    const b = bbox(walk.S ? walk.S[walk.S.length === 3 ? 1 : 0] : cells[0]);
    return b.y1 - b.y0 + 1;
  })();
  const union = cells.map(bbox).reduce((a, b) => ({ x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1) }));
  const hb = { x: union.x0, y: union.y0, w: union.x1 - union.x0 + 1, h: union.y1 - union.y0 + 1 };
  const rx = Math.max(3, Math.round(hb.w * 0.38));
  const fr = (ks, ms = WALK_FRAME_MS) => ks.map((atlasKey) => ({ durationMs: ms, atlasKey }));
  const walkDir = Object.fromEntries(dirs.map((dr) => [dr, fr(walkCycle(keys[dr]))]));
  const idleDir = Object.fromEntries(dirs.map((dr) => [dr, fr([standKey(keys[dr])], 600)]));
  const front = dirs.includes('S') ? 'S' : dirs[0];
  const sha = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const creature = {
    schemaVersion: 2,
    version: '1.0.0',
    id: s.cid,
    name: s.name,
    category: 'digital-creature',
    rarity: 'common',
    element: 'none',
    attributes: {},
    evolutionStage: STAGE_NAME[s.stage],
    evolutionLine: s.line ?? null,
    evolutionRequirements: {},
    description: `${s.name}: sprites de mapa oficiais de Digimon World DS (walk em ${dirs.join(', ')}${walk.E ? '' : '; E espelhado de W'}). Selvagem do mundo do GS-003; sem attack/hurt de mapa (o renderer usa o avanço procedural).`,
    dimensions: { frameW: cells[0].w, frameH: cells[0].h, tile: 32 },
    pivot,
    mapScale: 1,
    targetHeightPx: standH,
    nativeMapHeightPx: standH,
    sizeNotes: 'Altura nativa do sprite de mapa do DS (pose de pé), já relativa entre espécies.',
    hitbox: hb,
    anchors: { head: { x: pivot.x, y: hb.y }, hit: { x: pivot.x, y: hb.y + Math.floor(hb.h / 2) }, shadow: { cx: pivot.x, cy: pivot.y, rx, ry: Math.max(2, Math.round(rx * 0.35)) } },
    directions: { walk: { drawn: dirs, mirrored }, idle: { drawn: dirs, mirrored } },
    animations: {
      idle: { loop: true, space: 'map', frames: idleDir[front], events: [], dirFrames: idleDir },
      walk: { loop: true, space: 'map', frames: walkDir[front], events: [], dirFrames: walkDir },
    },
    walkSpeedPxPerSec: 160,
    combatStates: { IDLE: 'idle', WALK: 'walk', FOLLOW: 'walk', ENGAGE: 'walk', RETURN: 'walk' },
    sprites: './sprites/',
    spritesheets: './spritesheets/',
    assetOrigin: { layer: 'official-fan-use', sourceDescription: `Folha Digimon World DS "${s.name}" do Spriters Resource (${SR_PAGE}); 10-source-files/spriters-resource/${path.basename(file)}. Detalhe em license.json.` },
    approvalStatus: 'UNDER_REVIEW',
    qaNotes: [
      `Quadros de mapa achados automaticamente (${frames.length}); direções pela tabela SPECIES, conferidas no olho na folha de contato [H]: ${JSON.stringify(s.walk)}.`,
      'Sem poses de ataque/dano de mapa; sem pose de batalha (não importada nesta passada).',
      'rarity/element/evolutionStage provisórios [H].',
    ],
  };
  fs.writeFileSync(path.join(d, 'creature.json'), JSON.stringify(creature, null, 2) + '\n');
  const cr = sheetCredit(s);
  const license = {
    creatureId: s.cid,
    version: '1.0.0',
    layer: 'official-fan-use',
    officialRip: true,
    fanException: false,
    baseCharacter: s.name,
    nonCommercial: true,
    noRip: false,
    copyright: COPYRIGHT,
    source: {
      type: 'game-rip', game: 'Digimon World DS (Nintendo DS)', site: 'The Spriters Resource', sitePage: SR_PAGE,
      sheetFile: `10-source-files/spriters-resource/${path.basename(file)}`, sha256: sha, bytes: fs.statSync(file).size, retrievedAt: TODAY,
      modifications: 'chroma key automático (cores com bloco liso 12x12); quadros de mapa recortados por componentes conexos e realinhados pelo pivô nos pés',
    },
    credit: { ripper: cr.ripper, creditTextOnSheet: cr.text, creditRequiredBySheet: cr.required, site: 'The Spriters Resource' },
    verifiedAt: TODAY,
    verifiedBy: 'game-dev',
    notes: `Créditos em qualquer build/tela de créditos: ${cr.ripper} (rip DW DS, The Spriters Resource); (c) Bandai Namco.`,
  };
  fs.writeFileSync(path.join(d, 'license.json'), JSON.stringify(license, null, 2) + '\n');
  console.log(s.cid, s.name, `${frames.length} quadros de mapa`, dirs.join(''), `${cells[0].w}x${cells[0].h}`, `pé ${standH}px`);
  return { s, stand: walk[front][walk[front].length === 3 ? 1 : 0] };
}

function contactSheet(results) {
  const S = 3;
  const cellW = 120;
  const out = new Canvas(Math.min(results.length, 9) * cellW, Math.ceil(results.length / 9) * 130);
  out.fillRect(0, 0, out.w - 1, out.h - 1, [24, 26, 36, 255]);
  results.forEach((r, i) => {
    const ox = (i % 9) * cellW, oy = Math.floor(i / 9) * 130;
    const big = r.stand.scaleNearest(S);
    out.blit(big, ox + Math.max(0, Math.round((cellW - big.w) / 2)), oy + 104 - big.h);
    drawText(out, r.s.name, ox + 4, oy + 110, [200, 220, 255, 255]);
    drawText(out, r.s.cid, ox + 4, oy + 118, [255, 230, 120, 255]);
  });
  const p = path.join(PREVIEWS, 'wild_dwds_contact_sheet.png');
  out.save(p);
  console.log('wrote', p);
}

module.exports = { SPECIES, keyColors, mapFrames, components, loadSheetCanvas, sheetPath, predecode };

if (require.main === module) {
  predecode(SPECIES.map(sheetPath)).then(() => {
    if (process.argv.includes('--index')) indexSheet(process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1].split(',') : null);
    else contactSheet(SPECIES.map(importOne));
  });
}
