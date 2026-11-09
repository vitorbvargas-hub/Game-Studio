'use strict';
// GS-003 -- v3 Tamers: extract ALL human characters from the DW DS
// "NPC-Characters" sheet (Spriters Resource, ripped by redblueyellow, "No
// credit needed") into GAME-ASSETS/11-characters/official-npcs/NPC-00NN.
// Layout: one colored "block" per character (portrait + 4 direction rows x
// 3 walk-step columns; a few blocks add a 13th "extra" frame, e.g. sleep).
// Pure Node (art/src/png_decode + canvas.js pipeline), no PIL/ImageMagick.
const fs = require('fs');
const path = require('path');
const LIB = require('./npc_lib.js');
const { loadSheetCanvas, cutMasked, bboxOf, opaquePts, normalize, Canvas } = LIB;

const STUDIO = path.resolve(__dirname, '../../../../..');
const GA = path.join(STUDIO, 'assets/GAME-ASSETS');
const SHEET = path.join(GA, '10-source-files/spriters-resource/dgmnworldds__arrow-drop-down__NPC-Characters__48318.png');
const OUT = path.join(GA, '11-characters/official-npcs');
const TODAY = '2026-11-08';
const SR_PAGE = 'https://www.spriters-resource.com/ds_dsi/dgmnworldds/';
const COPYRIGHT = 'Digimon (c) Bandai Namco Entertainment Inc. / Toei Animation; Digimon World DS (c) Bandai Namco Games';

const ROWS_TOP = { S: [38, 69], N: [72, 103], W: [106, 137], E: [140, 171] };
const ROWS_BOT = { S: [250, 281], N: [284, 315], W: [318, 349], E: [352, 383] };
const PORTRAIT_TOP = [2, 35];
const PORTRAIT_BOT = [214, 247];

function findBlocks(sheet, matte) {
  const boxes = LIB.components(sheet, matte, 10, 3, 200, [0, 0, sheet.w - 1, sheet.h - 1]);
  return boxes.filter((b) => (b[3] - b[1] + 1) >= 140).sort((a, b) => (a[1] - b[1]) || (a[0] - b[0]));
}

function extractRow(sheet, bx0, bx1, ry0, ry1) {
  const w = bx1 - bx0 + 1;
  const colW = w / 3;
  const localMatte = sheet.getPixel(bx0 + 1, ry0 + 1);
  const cells = [];
  for (let i = 0; i < 3; i++) {
    const cx0 = Math.round(bx0 + i * colW) + 1;
    const cx1 = Math.round(bx0 + (i + 1) * colW) - 1;
    cells.push(LIB.stripThinLines(LIB.keepLargestComponent(cutMasked(sheet, localMatte, 14, [cx0, ry0 + 1, cx1, ry1 - 1]))));
  }
  return cells;
}

function extractPortrait(sheet, bx0, bx1, py0, py1) {
  const localMatte = sheet.getPixel(bx0 + 1, py0 + 1);
  const raw = LIB.keepLargestComponent(cutMasked(sheet, localMatte, 14, [bx0 + 1, py0 + 1, bx1 - 1, py1 - 1]));
  const bb = bboxOf(raw);
  if (bb.maxX < bb.minX) return raw;
  const out = new Canvas(bb.maxX - bb.minX + 1, bb.maxY - bb.minY + 1);
  out.blit(raw.scaleNearest(1), -bb.minX, -bb.minY); // reuse blit (identity scale)
  return out;
}

function extractExtra(sheet, bx0, bx1, y0, y1) {
  const crop = LIB.cropRect(sheet, bx0 + 1, y0 + 1, bx1 - 1, y1 - 1);
  const matted = LIB.trimTransparent(LIB.matteByBorderFlood(crop, 30));
  if (matted.w <= 1 && matted.h <= 1) return null;
  return matted;
}

function buildCharacter(id, sheet, block) {
  const [bx0, by0, bx1, by1] = block;
  const top = by0 < 210;
  const ROWS = top ? ROWS_TOP : ROWS_BOT;
  const [py0, py1] = top ? PORTRAIT_TOP : PORTRAIT_BOT;
  const dirs = ['S', 'N', 'W', 'E'];
  const raw = {};
  for (const d of dirs) raw[d] = extractRow(sheet, bx0, bx1, ROWS[d][0], ROWS[d][1]);
  const portrait = extractPortrait(sheet, bx0, bx1, py0, py1);

  const eBottom = ROWS.E[1];
  let extra = null;
  if (by1 > eBottom + 4) extra = extractExtra(sheet, bx0, bx1, eBottom + 3, by1);

  const order = [];
  for (const d of dirs) for (let i = 0; i < 3; i++) order.push([d, i]);
  const allCells = order.map(([d, i]) => raw[d][i]);
  if (extra) allCells.push(extra);
  const { frames: normFrames, pivot } = normalize(allCells, 2);
  const nFramesCore = order.length;
  const frames = {};
  order.forEach(([d, i], idx) => { (frames[d] = frames[d] || [])[i] = normFrames[idx]; });
  const extraFrame = extra ? normFrames[nFramesCore] : null;

  const dir = path.join(OUT, id);
  const spritesDir = path.join(dir, 'sprites');
  fs.mkdirSync(spritesDir, { recursive: true });
  const keys = {};
  for (const d of dirs) {
    keys[d] = frames[d].map((c, i) => {
      const k = `${id}_walk_${d}_0${i}.png`;
      c.save(path.join(spritesDir, k));
      return k;
    });
  }
  let extraKey = null;
  if (extraFrame) {
    extraKey = `${id}_extra_sleep.png`;
    extraFrame.save(path.join(spritesDir, extraKey));
  }
  portrait.save(path.join(dir, 'portrait.png'));

  function dirFrames(d, durArr) { return durArr.map((ms, i) => ({ durationMs: ms, atlasKey: keys[d][i] })); }
  const DIRS = dirs;
  const animations = {
    idle: {
      loop: true, space: 'map',
      frames: [{ durationMs: 600, atlasKey: keys.S[1] }],
      events: [],
      dirFrames: Object.fromEntries(DIRS.map((d) => [d, [{ durationMs: 600, atlasKey: keys[d][1] }]])),
    },
    walk: {
      loop: true, space: 'map',
      frames: [
        { durationMs: 150, atlasKey: keys.S[0] }, { durationMs: 150, atlasKey: keys.S[1] },
        { durationMs: 150, atlasKey: keys.S[0] }, { durationMs: 150, atlasKey: keys.S[2] },
      ],
      events: [],
      dirFrames: Object.fromEntries(DIRS.map((d) => {
        const f = dirFrames(d, [150, 150, 150]);
        return [d, [f[0], f[1], f[0], f[2]]];
      })),
    },
  };
  if (extraKey) {
    animations.sleep = { loop: true, space: 'map', frames: [{ durationMs: 800, atlasKey: extraKey }], events: [] };
  }

  const stand = frames.S[1];
  const standBB = bboxOf(stand);

  const characterJson = {
    schemaVersion: 1,
    version: '1.0.0',
    id,
    name: `${id} (provisorio)`,
    category: 'npc-human',
    role: 'npc',
    description: 'NPC humano de Digimon World DS (folha "NPC-Characters", Spriters Resource). No mapa: idle e walk nas 4 direcoes desenhadas (S/N/W/E), sem espelhamento.',
    dimensions: { frameW: stand.w, frameH: stand.h, tile: 32 },
    pivot,
    directions: { walk: { drawn: DIRS, mirrored: {} }, idle: { drawn: DIRS, mirrored: {} } },
    animations,
    walkSpeedPxPerSec: 140,
    sprites: './sprites/',
    portrait: './portrait.png',
    assetOrigin: {
      layer: 'official-fan-use',
      sourceDescription: `Folha Digimon World DS "NPC-Characters" do Spriters Resource (${SR_PAGE}), ripada por redblueyellow ("No credit needed"); 10-source-files/spriters-resource/dgmnworldds__arrow-drop-down__NPC-Characters__48318.png. Detalhe em license.json.`,
    },
    approvalStatus: 'UNDER_REVIEW',
    qaNotes: [
      'Bloco detectado por componentes conexos contra o teal de fundo da folha (merge <= 3px); colunas = terco igual da largura do bloco (grade RPG-Maker-like, sem suposicao de tamanho de celula fixo).',
      extra ? 'Tem um 13o quadro extra abaixo da linha E (provavelmente dormir/desmaiar); exportado em sprites/..._extra_sleep.png e animations.sleep, nao usado no walk/idle.' : 'Sem quadro extra alem dos 12 (4 direcoes x 3 passos).',
      'Pivo = centroide em x das 12-13 celulas, alinhado pelos pes (ultima linha opaca). Nome provisorio: preencher apos a revisao da folha de contato (09-previews/).',
    ],
  };
  fs.writeFileSync(path.join(dir, 'character.json'), JSON.stringify(characterJson, null, 2));

  const license = {
    characterId: id,
    version: '1.0.0',
    layer: 'official-fan-use',
    officialRip: true,
    nonCommercial: true,
    copyright: COPYRIGHT,
    source: {
      type: 'game-rip', game: 'Digimon World DS (Nintendo DS)', site: 'The Spriters Resource',
      sitePage: SR_PAGE, sheetFile: '10-source-files/spriters-resource/dgmnworldds__arrow-drop-down__NPC-Characters__48318.png',
      retrievedAt: TODAY, modifications: 'componentes conexos contra o teal de fundo; colunas por terco de largura; quadros recortados, mascarados por chave de cor local e realinhados pelo pivo nos pes.',
    },
    credit: { ripper: 'redblueyellow', creditTextOnSheet: 'Ripped by redblueyellow. No credit needed.', creditRequiredBySheet: false, site: 'The Spriters Resource' },
    verifiedAt: TODAY, verifiedBy: 'game-art',
    notes: 'Credito opcional (a folha dispensa): redblueyellow, The Spriters Resource, Digimon World DS. (c) Bandai Namco.',
  };
  fs.writeFileSync(path.join(dir, 'license.json'), JSON.stringify(license, null, 2));

  // per-character preview: 4 rows (S,N,W,E) + extra, 3 cols, scaled 4x
  const S4 = 4;
  const fw = stand.w, fh = stand.h;
  const rowsForPreview = [...DIRS.map((d) => frames[d])];
  const prevW = fw * S4 * 3 + 8;
  const prevH = fh * S4 * (rowsForPreview.length + (extraFrame ? 1 : 0)) + 8;
  const preview = new Canvas(prevW, prevH);
  preview.fillRect(0, 0, prevW - 1, prevH - 1, [30, 34, 44, 255]);
  rowsForPreview.forEach((row, r) => {
    row.forEach((f, c) => preview.blit(f.scaleNearest(S4), 4 + c * fw * S4, 4 + r * fh * S4));
  });
  if (extraFrame) {
    preview.blit(extraFrame.scaleNearest(S4), 4, 4 + rowsForPreview.length * fh * S4);
  }
  preview.save(path.join(dir, 'preview.png'));

  return { id, dir, portrait, stand, standBB, blockBox: block };
}

function main() {
  const sheet = loadSheetCanvas(SHEET);
  const matte = sheet.getPixel(0, 0);
  const blocks = findBlocks(sheet, matte);
  console.log('found', blocks.length, 'character blocks');
  fs.mkdirSync(OUT, { recursive: true });
  const results = [];
  blocks.forEach((b, i) => {
    const id = `NPC-${String(i + 1).padStart(4, '0')}`;
    const r = buildCharacter(id, sheet, b);
    console.log(id, 'block', b.slice(0, 4), '->', r.dir);
    results.push(r);
  });

  // master contact sheet: portrait + stand pose per character, grid of 6 cols
  const COLS = 6;
  const cellW = 140, cellH = 150;
  const rows = Math.ceil(results.length / COLS);
  const sheetOut = new Canvas(COLS * cellW, rows * cellH);
  sheetOut.fillRect(0, 0, sheetOut.w - 1, sheetOut.h - 1, [24, 26, 36, 255]);
  const { drawText } = require(path.join(STUDIO, 'projects/prototypes/GS-003/art/src/font5x3.js'));
  results.forEach((r, i) => {
    const col = i % COLS, row = (i / COLS) | 0;
    const ox = col * cellW + 6, oy = row * cellH + 6;
    const p = r.portrait.scaleNearest(2);
    sheetOut.blit(p, ox, oy);
    const s = r.stand.scaleNearest(3);
    sheetOut.blit(s, ox + 70, oy + Math.max(0, 64 - s.h));
    drawText(sheetOut, r.id, ox, oy + 68, [255, 230, 120, 255]);
  });
  const previewsDir = path.join(GA, '09-previews');
  fs.mkdirSync(previewsDir, { recursive: true });
  sheetOut.save(path.join(previewsDir, 'official_npcs_contact_sheet.png'));
  console.log('wrote', path.join(previewsDir, 'official_npcs_contact_sheet.png'));

  fs.writeFileSync(path.join(OUT, '_index.json'), JSON.stringify(results.map((r) => ({ id: r.id, blockBox: r.blockBox })), null, 2));
}

main();
