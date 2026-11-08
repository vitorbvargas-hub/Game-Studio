'use strict';
// GS-003 -- extract the DW DS Hero sheet into real Tamer character packs
// (TAMER-0001 = main protagonist, TAMER-0002 = alt/NPC tamer), replacing
// tamer_placeholder.js's blocky procedural avatar. Pure Node, no PIL: uses
// the project's own png_decode/Canvas pipeline + dwds_extract per-cell
// chroma-key (the sheet alternates matte tint per cell, see dwds_extract.js).
const fs = require('fs');
const path = require('path');
const { loadSheetCanvas, extractCell } = require('./dwds_extract.js');
const { Canvas } = require('./canvas.js');

const SHEET = path.resolve(
  __dirname, '../../../../../assets/GAME-ASSETS/10-source-files/spriters-resource/',
  'dgmnworldds__arrow-drop-down__Hero__48323.png'
);
const OUT_BASE = path.resolve(__dirname, '../../../../../assets/GAME-ASSETS/11-characters');

// Variant 1 (first appearance/outfit) of each character block.
// Row order confirmed by visual inspection (art/scratch/hero_variant1_grid_x4.png):
// row0=Down(S), row1=Up(N), row2=Left(W), row3=Right(E). Columns: 0/2 = walk
// step extremes, 1 = standing/idle (classic RPG-Maker-style charset layout).
const ROW_Y = { S: 40, N: 74, W: 108, E: 142 };
const COL_X = [0, 34, 68]; // relative to block x0, cell stride 34 (32 + 2 gap)
const CELL = 32;

const CHARACTERS = [
  { id: 'TAMER-0001', name: 'Tamer (protagonista)', blockX0: 2, role: 'player' },
  { id: 'TAMER-0002', name: 'Tamer (NPC alternativo)', blockX0: 187, role: 'npc' },
];

function bboxOf(c) {
  let minX = c.w, minY = c.h, maxX = -1, maxY = -1;
  for (let y = 0; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) {
      if (c.getPixel(x, y)[3] > 0) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
  }
  return { minX, minY, maxX, maxY };
}

function buildCharacter(sheet, def) {
  const dir = path.join(OUT_BASE, def.id);
  const spritesDir = path.join(dir, 'sprites');
  fs.mkdirSync(spritesDir, { recursive: true });

  const frames = {}; // dirLetter -> [frame0, frame1(idle), frame2]
  for (const [d, y] of Object.entries(ROW_Y)) {
    frames[d] = COL_X.map((dx) => extractCell(sheet, def.blockX0 + dx, y, CELL, CELL, 16));
  }

  // Pivot: feet-center of the down-idle frame (col1), consistent across the
  // 32x32 canvas since the sheet keeps the character centered per cell.
  const downIdleBox = bboxOf(frames.S[1]);
  const pivot = { x: 16, y: downIdleBox.maxY + 1 };

  for (const [d, fset] of Object.entries(frames)) {
    fset.forEach((canvas, i) => {
      canvas.save(path.join(spritesDir, `${def.id}_walk_${d}_0${i}.png`));
    });
  }

  function dirFrames(d, durMsArr) {
    return durMsArr.map((ms, i) => ({ durationMs: ms, atlasKey: `${def.id}_walk_${d}_0${i}.png` }));
  }
  function idleDirFrames(d) {
    return [{ durationMs: 600, atlasKey: `${def.id}_walk_${d}_01.png` }];
  }
  const DIRS = ['S', 'N', 'W', 'E'];
  const walkDur = [150, 150, 150]; // f0,f1,f2 -- rendered as f0-f1-f0-f2 cycle like the creature pipeline

  const animations = {
    idle: {
      loop: true, space: 'map',
      frames: idleDirFrames('S'),
      events: [],
      dirFrames: Object.fromEntries(DIRS.map((d) => [d, idleDirFrames(d)])),
    },
    walk: {
      loop: true, space: 'map',
      frames: [
        { durationMs: 150, atlasKey: `${def.id}_walk_S_00.png` },
        { durationMs: 150, atlasKey: `${def.id}_walk_S_01.png` },
        { durationMs: 150, atlasKey: `${def.id}_walk_S_00.png` },
        { durationMs: 150, atlasKey: `${def.id}_walk_S_02.png` },
      ],
      events: [],
      dirFrames: Object.fromEntries(DIRS.map((d) => {
        const f = dirFrames(d, walkDur);
        return [d, [f[0], f[1], f[0], f[2]]];
      })),
    },
  };

  const characterJson = {
    schemaVersion: 1,
    version: '1.0.0',
    id: def.id,
    name: def.name,
    category: 'tamer',
    role: def.role,
    description: 'Tamer: sprites oficiais de Digimon World DS (protagonista/NPC Hero). No mapa: idle e walk nas 4 direcoes (S/N/W/E desenhadas, sem espelhamento -- a folha ja traz as 4).',
    dimensions: { frameW: CELL, frameH: CELL, tile: 32 },
    pivot,
    directions: {
      walk: { drawn: DIRS, mirrored: {} },
      idle: { drawn: DIRS, mirrored: {} },
    },
    animations,
    walkSpeedPxPerSec: 140,
    sprites: './sprites/',
    assetOrigin: {
      layer: 'official-fan-use',
      sourceDescription: 'Folha Digimon World DS "Hero" do Spriters Resource (https://www.spriters-resource.com/ds_dsi/dgmnworldds/), ripada por redblueyellow; baixada por varredura automatica em 10-source-files/spriters-resource/. Detalhe em license.json.',
    },
    approvalStatus: 'UNDER_REVIEW',
    qaNotes: [
      'Grade de 4 variantes (outfits) x 4 direcoes x 3 colunas (32x32) detectada por deteccao de banda vazia (sem suposicao de grade fixa); usada a variante 1 de cada bloco (boy/girl).',
      'Chroma key por celula (cada celula amostra sua propria cor de canto) porque a folha alterna o tom de fundo entre celulas adjacentes.',
      'Coluna do meio = idle (de pe); colunas 0/2 = extremos do passo de caminhada, ciclo renderizado f0-f1-f0-f2 como no pipeline de CREATURE-000X.',
      'Pivo = centro-x da celula (16) e y logo abaixo do pixel mais baixo nao-transparente do quadro down-idle.',
    ],
  };

  fs.writeFileSync(path.join(dir, 'character.json'), JSON.stringify(characterJson, null, 2));

  // preview: 4 rows (S,N,W,E) x 3 cols, scaled 4x, labelled implicitly by order
  const { drawText } = require('./font5x3.js');
  const SCALE = 4;
  const preview = new Canvas(CELL * SCALE * 3 + 20, CELL * SCALE * 4 + 30);
  preview.fillRect(0, 0, preview.w - 1, preview.h - 1, [30, 34, 44, 255]);
  DIRS.forEach((d, row) => {
    drawText(preview, d, 4, row * (CELL * SCALE + 6) + 24 + CELL * SCALE / 2 - 3, [255, 255, 255, 255]);
    frames[d].forEach((f, col) => {
      preview.blit(f.scaleNearest(SCALE), 16 + col * CELL * SCALE, row * (CELL * SCALE + 6) + 24);
    });
  });
  drawText(preview, def.id, 4, 4, [255, 230, 120, 255]);
  preview.save(path.join(dir, 'preview.png'));

  return { dir, pivot, downIdleBox };
}

function main() {
  const sheet = loadSheetCanvas(SHEET);
  for (const def of CHARACTERS) {
    const r = buildCharacter(sheet, def);
    console.log(def.id, '->', r.dir, 'pivot', r.pivot);
  }
}

main();
