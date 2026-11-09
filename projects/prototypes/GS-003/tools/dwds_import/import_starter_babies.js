'use strict';
// GS-003 -- v3 starters: Dorimon (Dorumon line, new) + Gigimon fallback
// (DW DS has no Guilmon-line baby map sprite; founder-approved fallback is
// Pagumon per the brief). Source: Spriters Resource DW DS battle-pose rips
// (portrait row + body-pose row, no map walk in this source) -- same
// "battle idle, downscaled to In-Training map height" method already used
// for CREATURE-0002 Gigimon v1->v2 in tools/dwds_import/import_dwds_sheets.py.
const fs = require('fs');
const path = require('path');
const CHAR_LIB = require('../char_import/npc_lib.js');
const { loadSheetCanvas, components, cutMasked, bboxOf, opaquePts, keepLargestComponent, Canvas } = CHAR_LIB;

const STUDIO = path.resolve(__dirname, '../../../../..');
const GA = path.join(STUDIO, 'assets/GAME-ASSETS');
const SRC = path.join(GA, '10-source-files/spriters-resource');
const CRE = path.join(GA, '01-creatures');
const TODAY = '2026-11-08';
const SR_BASE = 'https://www.spriters-resource.com/ds_dsi/dgmnworldds/';
const COPYRIGHT = 'Digimon (c) Bandai Namco Entertainment Inc. / Toei Animation; Digimon World DS (c) Bandai Namco Games';
const TARGET_H = 19; // matches CREATURE-0002/0008 In-Training convention

function bboxH(c) {
  const bb = bboxOf(c);
  return bb.maxY - bb.minY + 1;
}

// Block-mode downscale (ports import_dwds_sheets.py downscale()): each dest
// pixel takes the most common opaque source color in its block, weighting
// dark outline colors 1.4x so the DS outline survives the reduction.
function downscale(c, r) {
  const tw = Math.max(1, Math.round(c.w * r));
  const th = Math.max(1, Math.round(c.h * r));
  const out = new Canvas(tw, th);
  for (let ty = 0; ty < th; ty++) {
    const y0 = Math.floor(ty / r), y1 = Math.max(y0 + 1, Math.floor((ty + 1) / r));
    for (let tx = 0; tx < tw; tx++) {
      const x0 = Math.floor(tx / r), x1 = Math.max(x0 + 1, Math.floor((tx + 1) / r));
      const counts = new Map();
      let total = 0, opaque = 0;
      for (let y = y0; y < Math.min(c.h, y1); y++) {
        for (let x = x0; x < Math.min(c.w, x1); x++) {
          total++;
          const p = c.getPixel(x, y);
          if (p[3] === 0) continue;
          opaque++;
          const lum = (p[0] + p[1] + p[2]) / 3;
          const w = lum < 120 ? 1.4 : 1;
          const key = `${p[0]},${p[1]},${p[2]},${p[3]}`;
          counts.set(key, (counts.get(key) || 0) + w);
        }
      }
      if (!total || opaque < 0.45 * total) continue;
      let best = null, bestN = -1;
      for (const [k, n] of counts) if (n > bestN) { bestN = n; best = k; }
      const [r_, g_, b_, a_] = best.split(',').map(Number);
      out.setPixel(tx, ty, [r_, g_, b_, a_]);
    }
  }
  return out;
}

function trim(c) {
  const bb = bboxOf(c);
  if (bb.maxX < bb.minX) return new Canvas(1, 1);
  const out = new Canvas(bb.maxX - bb.minX + 1, bb.maxY - bb.minY + 1);
  out.blit(c, -bb.minX, -bb.minY);
  return out;
}

function extractCellAt(sheet, box) {
  const [x0, y0, x1, y1] = box;
  const localMatte = sheet.getPixel(x0 + 1, y0 + 1);
  return trim(keepLargestComponent(cutMasked(sheet, localMatte, 16, [x0 + 1, y0 + 1, x1 - 1, y1 - 1])));
}

// Cell X ranges measured directly off each sheet (greenish-background column
// scan at a row inside each strip) -- component-merge detection was unreliable
// here because adjacent cells touch through a 1px divider close in hue to the
// chroma key. Portrait/battle Y bands measured the same way (vertical scan).
const CONFIGS = [
  {
    cid: 'CREATURE-0014', name: 'Dorimon', lineId: 'dorumon', next: [],
    file: 'dgmnworldds__arrow-drop-down__Dorimon__48417.png',
    portraitY: [1, 36], battleY: [38, 69],
    portraitX: [[69, 105], [107, 143], [145, 181], [183, 219], [221, 257], [259, 284]],
    battleX: [[29, 60], [62, 93], [95, 126], [128, 159], [161, 192], [194, 225], [227, 258], [260, 291], [293, 324]],
    battleIndex: 0,
    credit: 'Mighty Jetters, redblueyellow', creditText: 'Dorimon from Digimon World DS ripped by Mighty Jetters and redblueyellow. Credit is not required.',
    sourceDesc: 'novo baby (linha Dorumon), nao existia no estudio antes da v3',
  },
  {
    cid: 'CREATURE-0002', name: 'Gigimon', lineId: 'guilmon', next: ['CREATURE-0003'],
    file: 'dgmnworldds__arrow-drop-down__Pagumon__48414.png',
    portraitY: [1, 40], battleY: [42, 73],
    portraitX: [[16, 75], [77, 136], [138, 197], [199, 258], [260, 319]],
    battleX: [[16, 47], [49, 80], [82, 113], [115, 146], [148, 179], [181, 212], [214, 245], [247, 278], [280, 311], [313, 340]],
    battleIndex: 0,
    credit: 'Mighty Jetters, redblueyellow', creditText: 'Pagumon from Digimon World DS ripped by Mighty Jetters and redblueyellow. Credit is not required.',
    sourceDesc: 'FALLBACK Pagumon (DS nao tem Gigimon/Guilmon baby): hand-draw de 4 direcoes avaliado como alto risco de qualidade nesta sessao (ver docs); usa-se o fallback sancionado pela tarefa, documentado e versionado (v2 E-M-B-E-R fica em versions/v2).',
    isFallback: true, baseCharacterName: 'Pagumon (fallback por Guilmon/Gigimon nao existir no DS)',
  },
];

function preserveVersion(d, fromVersion, toVersionLabel) {
  const sub = path.join(d, 'versions', toVersionLabel);
  if (fs.existsSync(path.join(sub, 'creature.json'))) return;
  fs.mkdirSync(sub, { recursive: true });
  for (const f of ['creature.json', 'license.json']) {
    const src = path.join(d, f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(sub, f));
  }
  for (const sub2 of ['sprites', 'spritesheets', 'previews']) {
    const src = path.join(d, sub2);
    if (fs.existsSync(src)) {
      fs.mkdirSync(path.join(sub, sub2), { recursive: true });
      for (const f of fs.readdirSync(src)) fs.copyFileSync(path.join(src, f), path.join(sub, sub2, f));
    }
  }
}

function process(cfg) {
  const sheetPath = path.join(SRC, cfg.file);
  const sheet = loadSheetCanvas(sheetPath);
  const matte = sheet.getPixel(0, 0);

  const portrait = extractCellAt(sheet, [cfg.portraitX[0][0], cfg.portraitY[0], cfg.portraitX[0][1], cfg.portraitY[1]]);
  const bx = cfg.battleX[cfg.battleIndex];
  const battleRaw = extractCellAt(sheet, [bx[0], cfg.battleY[0], bx[1], cfg.battleY[1]]);
  const battleH = bboxH(battleRaw);
  const ratio = TARGET_H / battleH;
  const mapW = downscale(battleRaw, ratio);
  const mapE = mapW.flipX();

  const d = path.join(CRE, cfg.cid);
  const existed = fs.existsSync(path.join(d, 'creature.json'));
  let old = null, oldLic = null, prevSummary = null;
  if (existed) {
    old = JSON.parse(fs.readFileSync(path.join(d, 'creature.json'), 'utf8'));
    oldLic = JSON.parse(fs.readFileSync(path.join(d, 'license.json'), 'utf8'));
    const label = cfg.isFallback ? 'v2' : 'prev';
    preserveVersion(d, old.version, label);
    prevSummary = { version: old.version, path: `versions/${label}/creature.json`, summary: old.description ? old.description.slice(0, 160) : 'versao anterior' };
  }
  for (const sub of ['sprites', 'spritesheets', 'previews']) {
    fs.mkdirSync(path.join(d, sub), { recursive: true });
    for (const f of fs.readdirSync(path.join(d, sub))) if (f.endsWith('.png') || f.endsWith('.json')) fs.unlinkSync(path.join(d, sub, f));
  }

  const kW = `${cfg.cid}_walk_W_00.png`;
  const kE = `${cfg.cid}_walk_E_00.png`;
  mapW.save(path.join(d, 'sprites', kW));
  mapE.save(path.join(d, 'sprites', kE));
  const bKey = `${cfg.cid}_battle_idle_SW_00.png`;
  battleRaw.save(path.join(d, 'sprites', bKey));
  portrait.save(path.join(d, 'portrait.png'));

  const hb = { x: 0, y: 0, w: mapW.w, h: mapW.h };
  const pivot = { x: Math.round(mapW.w / 2), y: mapW.h };

  const creature = {
    schemaVersion: 2,
    version: cfg.isFallback ? '3.0.0' : '1.0.0',
    ...(prevSummary ? { previousVersions: [...(old.previousVersions || []), prevSummary] } : {}),
    id: cfg.cid,
    name: cfg.name,
    category: 'digital-creature',
    rarity: 'common',
    element: 'none',
    attributes: {},
    evolutionStage: 'baby',
    evolutionLine: { lineId: cfg.lineId, previous: null, next: cfg.next },
    evolutionRequirements: {},
    description: `${cfg.name}: sprite de mapa PROVISORIO (uma direcao W, E espelhado) derivado da pose de batalha oficial de Digimon World DS, reduzida por moda de bloco para a altura media dos In-Training do DS (~${TARGET_H}px). ${cfg.sourceDesc}`,
    dimensions: { frameW: mapW.w, frameH: mapW.h, tile: 32 },
    pivot,
    mapScale: 1,
    targetHeightPx: mapW.h,
    nativeMapHeightPx: mapW.h,
    nativeBattleHeightPx: battleH,
    sizeNotes: `Reduzido de ${battleH}px (pose de batalha) para ${mapW.h}px (fator ${ratio.toFixed(3)}), por moda de bloco sem interpolacao.`,
    hitbox: hb,
    anchors: { head: { x: pivot.x, y: 0 }, hit: { x: pivot.x, y: Math.round(mapW.h / 2) }, shadow: { cx: pivot.x, cy: pivot.y, rx: Math.max(3, Math.round(mapW.w * 0.38)), ry: Math.max(2, Math.round(mapW.w * 0.38 * 0.35)) } },
    directions: { walk: { drawn: ['W'], mirrored: { E: 'W' } }, idle: { drawn: ['W'], mirrored: { E: 'W' } }, battle_idle: { drawn: ['SW'], mirrored: { SE: 'SW' } } },
    animations: {
      idle: { loop: true, space: 'map', frames: [{ durationMs: 600, atlasKey: kW }], events: [], dirFrames: { W: [{ durationMs: 600, atlasKey: kW }], E: [{ durationMs: 600, atlasKey: kE }] } },
      walk: { loop: true, space: 'map', frames: [{ durationMs: 250, atlasKey: kW }], events: [], dirFrames: { W: [{ durationMs: 250, atlasKey: kW }], E: [{ durationMs: 250, atlasKey: kE }] } },
      battle_idle: { loop: true, space: 'battle', frames: [{ durationMs: 250, atlasKey: bKey }] },
    },
    walkSpeedPxPerSec: 120,
    combatStates: { IDLE: 'idle', WALK: 'walk', FOLLOW: 'walk', ENGAGE: 'walk', RETURN: 'walk' },
    sprites: './sprites/',
    portrait: './portrait.png',
    assetOrigin: {
      layer: 'official-fan-use',
      sourceDescription: `Folha Digimon World DS "${cfg.baseCharacterName || cfg.name}" do Spriters Resource (${SR_BASE}), ripada por ${cfg.credit}; 10-source-files/spriters-resource/${cfg.file}. Pose de batalha unica (sem walk de mapa na fonte); mapa derivado por reducao, nao e sprite de mapa oficial. Detalhe em license.json.`,
    },
    approvalStatus: 'PENDING_OFFICIAL_MAP_SPRITE',
    qaNotes: [
      'Fonte so tem pose de batalha (sem walk/4 direcoes de mapa); mapa = pose de batalha reduzida por moda de bloco, 1 direcao (W) com E espelhado -- mesma tecnica do CREATURE-0002 v1->v2.',
      cfg.isFallback ? 'Guilmon/Gigimon nao existe na DS: desenhar a mao um sprite de mapa de 4 direcoes foi avaliado como alto risco de qualidade nesta sessao (o fundador rejeitou geracao procedural de personagens na v2 dos Tamers); usado o fallback Pagumon sancionado pela tarefa.' : 'Baby novo (linha Dorumon), sem precedente no estudio antes desta sessao.',
      'Revisar com game-dev antes de promover approvalStatus; recomenda-se, quando possivel, substituir por um rip de mapa real de 4 direcoes.',
    ],
  };
  fs.writeFileSync(path.join(d, 'creature.json'), JSON.stringify(creature, null, 2));

  const license = {
    creatureId: cfg.cid,
    version: creature.version,
    layer: 'official-fan-use',
    officialRip: true,
    nonCommercial: true,
    copyright: COPYRIGHT,
    baseCharacter: cfg.baseCharacterName || cfg.name,
    source: {
      type: 'game-rip', game: 'Digimon World DS (Nintendo DS)', site: 'The Spriters Resource', sitePage: SR_BASE,
      sheetFile: `10-source-files/spriters-resource/${cfg.file}`, retrievedAt: TODAY,
      modifications: 'componentes conexos contra o verde de fundo da folha; mascara por chave de cor local; pose de batalha reduzida por moda de bloco para escala de mapa (derivado, nao oficial).',
    },
    credit: { ripper: cfg.credit, creditTextOnSheet: cfg.creditText, creditRequiredBySheet: false, site: 'The Spriters Resource' },
    ...(prevSummary ? { previousVersions: [...(oldLic.previousVersions || []), { version: oldLic.version, path: prevSummary.path.replace('creature.json', 'license.json'), stillShipped: false }] } : {}),
    verifiedAt: TODAY, verifiedBy: 'game-art',
    notes: `Credito opcional (a folha dispensa): ${cfg.credit}, The Spriters Resource, Digimon World DS. (c) Bandai Namco.${cfg.isFallback ? ' Fallback de baby documentado: Pagumon no lugar de Gigimon/Guilmon (DS nao tem).' : ''}`,
  };
  fs.writeFileSync(path.join(d, 'license.json'), JSON.stringify(license, null, 2));

  const S = 6;
  const preview = new Canvas((mapW.w + mapE.w) * S + 24, Math.max(mapW.h, mapE.h) * S + 8);
  preview.fillRect(0, 0, preview.w - 1, preview.h - 1, [30, 34, 44, 255]);
  preview.blit(mapW.scaleNearest(S), 8, 4);
  preview.blit(mapE.scaleNearest(S), 16 + mapW.w * S, 4);
  preview.save(path.join(d, 'previews', 'map_walk_x4.png'));

  console.log(cfg.cid, cfg.name, '-> battleH', battleH, 'mapH', mapW.h, 'ratio', ratio.toFixed(3));
  return { cid: cfg.cid, name: cfg.name, mapW, mapE, portrait };
}

function main() {
  const results = CONFIGS.map(process);
  const previewsDir = path.join(GA, '09-previews');
  const { drawText } = require(path.join(STUDIO, 'projects/prototypes/GS-003/art/src/font5x3.js'));
  const S = 6;
  const cellW = 160, cellH = 90;
  const sheet = new Canvas(results.length * cellW, cellH);
  sheet.fillRect(0, 0, sheet.w - 1, sheet.h - 1, [24, 26, 36, 255]);
  results.forEach((r, i) => {
    const ox = i * cellW + 8, oy = 6;
    sheet.blit(r.portrait.scaleNearest(2), ox, oy);
    sheet.blit(r.mapW.scaleNearest(S), ox + 50, oy + 40 - r.mapW.h * S);
    drawText(sheet, r.cid, ox, oy + 76, [255, 230, 120, 255]);
    drawText(sheet, r.name, ox, oy + 68, [200, 220, 255, 255]);
  });
  sheet.save(path.join(previewsDir, 'starters_new_babies_contact.png'));
  console.log('wrote', path.join(previewsDir, 'starters_new_babies_contact.png'));

  const STARTERS = [
    { cid: 'CREATURE-0005', name: 'Koromon', dir: 'S' },
    { cid: 'CREATURE-0008', name: 'Tsunomon', dir: 'S' },
    { cid: 'CREATURE-0011', name: 'Tokomon', dir: 'S' },
    { cid: 'CREATURE-0014', name: 'Dorimon', dir: 'W' },
    { cid: 'CREATURE-0002', name: 'Gigimon', dir: 'W' },
  ];
  const S5 = 5;
  const w5 = 130;
  const starters5 = new Canvas(STARTERS.length * w5, 150);
  starters5.fillRect(0, 0, starters5.w - 1, starters5.h - 1, [24, 26, 36, 255]);
  STARTERS.forEach((s, i) => {
    const sdir = path.join(CRE, s.cid, 'sprites');
    const names = fs.readdirSync(sdir);
    const file = names.find((f) => f.includes(`walk_${s.dir}_`)) || names.find((f) => f.includes('walk_'));
    const c = loadSheetCanvas(path.join(sdir, file));
    const ox = i * w5 + 8;
    const big = c.scaleNearest(S5);
    starters5.blit(big, ox + Math.max(0, (w5 - 20 - big.w) / 2), 100 - big.h);
    drawText(starters5, s.cid, ox, 110, [255, 230, 120, 255]);
    drawText(starters5, s.name, ox, 120, [200, 220, 255, 255]);
  });
  starters5.save(path.join(previewsDir, 'starters_5.png'));
  console.log('wrote', path.join(previewsDir, 'starters_5.png'));
}

main();
