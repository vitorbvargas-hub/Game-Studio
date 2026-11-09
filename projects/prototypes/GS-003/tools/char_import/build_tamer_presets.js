'use strict';
// GS-003 -- v3 Tamer presets: "inspirado em protagonista" (neutral names),
// built from the official DW DS NPC base sprites (official-fan-use), with
// a hair recolor + light accessory kitbash (goggles/visor/scarf/collar/cap).
// Never a 1:1 copy of a franchise character -- silhouette + palette cues only.
const fs = require('fs');
const path = require('path');
const LIB = require('./npc_lib.js');
const KIT = require('./kitbash.js');
const { loadSheetCanvas, Canvas } = LIB;

const STUDIO = path.resolve(__dirname, '../../../../..');
const GA = path.join(STUDIO, 'assets/GAME-ASSETS');
const NPC_DIR = path.join(GA, '11-characters/official-npcs');
const OUT = path.join(GA, '11-characters');
const TODAY = '2026-11-08';

const SWATCHES = [
  { id: 'preto', hex: '#2B2B2B' },
  { id: 'castanho', hex: '#6B3A1F' },
  { id: 'loiro', hex: '#D9A441' },
  { id: 'ruivo', hex: '#B03A2E' },
  { id: 'azul', hex: '#1F6FB0' },
  { id: 'verde', hex: '#3E8E41' },
  { id: 'roxo', hex: '#7B4BA6' },
  { id: 'prateado', hex: '#C9CCCF' },
];

// GAME-ASSETS/11-characters/README.md tem o mapeamento completo para o dev trocar o FILE_DIR
// do mundo por este contrato direto. SW/SE = as 2 vistas de frente da folha; NW/NE = as 2 de
// costas (nao ha cardeal S/N/W/E real na folha de origem -- ver extract_npc_characters.js).
const DIRS = ['SW', 'SE', 'NW', 'NE'];
const FRONT_DIRS = ['SW', 'SE'];

// Each preset: base = NPC-XXXX source id, hair = canonical swatch id,
// accessory = {type, color, strapColor?, dirs?}, outfit = optional collar/
// torso accent. Names are neutral (no franchise names), per founder brief.
const PRESETS = [
  {
    id: 'TAMER-0003', name: 'Coragem (goggles)', base: 'NPC-0003', hair: 'ruivo',
    accessory: { type: 'goggles', color: [240, 140, 40, 255], strapColor: [40, 40, 40, 255], dirs: FRONT_DIRS },
    note: 'Goggles laranja + cabelo ruivo-acastanhado espetado: lembra o arquétipo "lider de goggles" (Tai/Takato/Agumon-tamer).',
  },
  {
    id: 'TAMER-0004', name: 'Amizade (loiro)', base: 'NPC-0021', hair: 'loiro',
    accessory: { type: 'collar', color: [40, 90, 200, 255], dirs: DIRS },
    note: 'Loiro espetado + gola alta azul: lembra o arquetipo "melhor amigo loiro" (Matt/Yamato).',
  },
  {
    id: 'TAMER-0005', name: 'Amor (lenco)', base: 'NPC-0013', hair: 'ruivo',
    accessory: { type: 'scarf', color: [235, 150, 30, 255], dirs: DIRS },
    note: 'Lenco laranja ao pescoco + cabelo ruivo curto: lembra o arquetipo "cuidadora com lenco" (Sora).',
  },
  {
    id: 'TAMER-0006', name: 'Determinacao (goggles azul)', base: 'NPC-0008', hair: 'ruivo',
    accessory: { type: 'goggles', color: [60, 140, 230, 255], strapColor: [30, 30, 30, 255], dirs: FRONT_DIRS },
    note: 'Goggles azuis sobre faixa/headband: lembra o arquetipo "goggles impetuoso" (Davis/Daisuke).',
  },
  {
    id: 'TAMER-0007', name: 'Esperanca (bone)', base: 'NPC-0002', hair: 'loiro',
    accessory: { type: 'cap', color: [220, 230, 240, 255], dirs: DIRS },
    note: 'Loiro claro + bone/chapeu claro: lembra o arquetipo "caçula de chapeu" (TK/Takeru).',
  },
  {
    id: 'TAMER-0008', name: 'Vinculo (goggles, jaqueta)', base: 'NPC-0010', hair: 'ruivo',
    accessory: { type: 'goggles', color: [235, 120, 30, 255], strapColor: [20, 20, 20, 255], dirs: FRONT_DIRS },
    note: 'Goggles laranja + base de cabelo curto castanho: lembra o arquetipo "tamer de dragao vermelho" (Takato).',
  },
  {
    id: 'TAMER-0009', name: 'Raposa (viseira)', base: 'NPC-0006', hair: 'ruivo',
    accessory: { type: 'visor', color: [180, 60, 160, 255], dirs: FRONT_DIRS },
    note: 'Cabelo ruivo preso + viseira: lembra o arquetipo "tamer solitaria de raposa" (Rika/Ruki).',
  },
  {
    id: 'TAMER-0010', name: 'Vento (oculos)', base: 'NPC-0019', hair: 'azul',
    accessory: { type: 'glasses', color: [30, 30, 30, 255], dirs: FRONT_DIRS },
    note: 'Cabelo azulado + oculos retangulares: lembra o arquetipo "estrategista de oculos" (Henry/Jenrya).',
  },
  {
    id: 'TAMER-0011', name: 'Chama (goggles vermelhos)', base: 'NPC-0009', hair: 'castanho',
    accessory: { type: 'goggles', color: [220, 50, 40, 255], strapColor: [30, 20, 10, 255], dirs: FRONT_DIRS },
    note: 'Goggles vermelhos + cabelo castanho despenteado: lembra o arquetipo "guerreiro das chamas" (Takuya).',
  },
  {
    id: 'TAMER-0012', name: 'Vanguarda (jaqueta vermelha)', base: 'NPC-0024', hair: 'castanho',
    accessory: { type: 'collar', color: [210, 40, 30, 255], dirs: DIRS },
    note: 'Cabelo castanho espetado + gola/jaqueta vermelha: lembra o arquetipo "tamer vanguardista" (Marcus/Masaru).',
  },
  {
    id: 'TAMER-0013', name: 'Xeno (cabelo prateado)', base: 'NPC-0022', hair: 'prateado',
    accessory: { type: 'collar', color: [235, 235, 240, 255], dirs: DIRS },
    note: 'Cabelo prateado + gola clara: lembra o arquetipo "rival de cabelo claro" (Kiriha/Michael).',
  },
  {
    id: 'TAMER-0014', name: 'Furia (goggles verdes)', base: 'NPC-0032', hair: 'castanho',
    accessory: { type: 'goggles', color: [60, 180, 90, 255], strapColor: [20, 20, 20, 255], dirs: FRONT_DIRS },
    note: 'Goggles verdes + silhueta despojada: lembra o arquetipo "novato caotico de goggles" (Tagiru).',
  },
];

function applyAccessory(frame, acc) {
  const f = KIT.cloneFrame(frame);
  switch (acc.type) {
    case 'goggles': return KIT.addGoggles(f, acc.color, acc.strapColor);
    case 'visor': return KIT.addVisor(f, acc.color);
    case 'glasses': return KIT.addGlasses(f, acc.color);
    case 'scarf': return KIT.addScarf(f, acc.color);
    case 'collar': return KIT.addCollarBand(f, acc.color);
    case 'cap': return KIT.addCap(f, acc.color);
    default: return f;
  }
}

function loadBaseFrames(baseId) {
  const dir = path.join(NPC_DIR, baseId);
  const cj = JSON.parse(fs.readFileSync(path.join(dir, 'character.json'), 'utf8'));
  const frames = {};
  for (const d of DIRS) {
    frames[d] = cj.animations.walk.dirFrames[d].filter((_, i) => i < 3).map((fr) => loadSheetCanvas(path.join(dir, 'sprites', fr.atlasKey)));
  }
  // walk.dirFrames has f0,f1,f0,f2 (4 entries); de-dup to the 3 unique keys in order 0,1,2
  for (const d of DIRS) {
    const seen = new Set(); const uniq = [];
    for (const fr of cj.animations.walk.dirFrames[d]) { if (!seen.has(fr.atlasKey)) { seen.add(fr.atlasKey); uniq.push(loadSheetCanvas(path.join(dir, 'sprites', fr.atlasKey))); } }
    frames[d] = uniq;
  }
  return { cj, dir, frames };
}

function buildPreset(def) {
  const { cj: baseCj, frames: baseFrames } = loadBaseFrames(def.base);
  const swatch = SWATCHES.find((s) => s.id === def.hair);
  const seed = KIT.sampleHairSeed(baseFrames.SW[1]);

  function makeVariant(hairHex) {
    const out = {};
    for (const d of DIRS) {
      out[d] = baseFrames[d].map((fr) => {
        const recolored = KIT.recolorHair(fr, seed, hairHex, 48);
        const withAcc = (def.accessory.dirs.includes(d)) ? applyAccessory(recolored, def.accessory) : recolored;
        return withAcc;
      });
    }
    return out;
  }

  const canonical = makeVariant(swatch.hex);
  if (!buildPreset._all) buildPreset._all = [];
  buildPreset._all.push({ id: def.id, name: def.name, canonical });

  const dir = path.join(OUT, def.id);
  const spritesDir = path.join(dir, 'sprites');
  fs.mkdirSync(spritesDir, { recursive: true });
  for (const f of fs.readdirSync(spritesDir)) { // drop stale S/N/W/E files and recolor_* dirs from before the SW/SE/NW/NE rename
    const fp = path.join(spritesDir, f);
    fs.rmSync(fp, { recursive: true, force: true });
  }
  const keys = {};
  for (const d of DIRS) {
    keys[d] = canonical[d].map((c, i) => {
      const k = `${def.id}_walk_${d}_0${i}.png`;
      c.save(path.join(spritesDir, k));
      return k;
    });
  }

  // 8-color hair recolor extra: generate alternates for every swatch other
  // than the canonical one, same kitbash, into sprites/recolor_<id>/.
  const recolorIndex = [];
  for (const sw of SWATCHES) {
    const sub = path.join(spritesDir, `recolor_${sw.id}`);
    fs.mkdirSync(sub, { recursive: true }); // spritesDir was just cleared above, so this is always fresh
    const variant = sw.id === def.hair ? canonical : makeVariant(sw.hex);
    const relKeys = {};
    for (const d of DIRS) {
      relKeys[d] = variant[d].map((c, i) => {
        const fname = `${def.id}_${sw.id}_${d}_0${i}.png`;
        c.save(path.join(sub, fname));
        return `./sprites/recolor_${sw.id}/${fname}`;
      });
    }
    recolorIndex.push({ id: sw.id, hex: sw.hex, default: sw.id === def.hair, frames: relKeys });
  }

  function dirFramesOf(d) {
    const f = keys[d];
    return [{ durationMs: 150, atlasKey: f[0] }, { durationMs: 150, atlasKey: f[1] }, { durationMs: 150, atlasKey: f[0] }, { durationMs: 150, atlasKey: f[2] }];
  }
  const animations = {
    idle: { loop: true, space: 'map', frames: [{ durationMs: 600, atlasKey: keys.SW[1] }], events: [], dirFrames: Object.fromEntries(DIRS.map((d) => [d, [{ durationMs: 600, atlasKey: keys[d][1] }]])) },
    walk: { loop: true, space: 'map', frames: dirFramesOf('SW'), events: [], dirFrames: Object.fromEntries(DIRS.map((d) => [d, dirFramesOf(d)])) },
  };

  const stand = canonical.SW[1];
  const bb = LIB.bboxOf(stand);
  const pivot = { x: Math.round((bb.minX + bb.maxX) / 2), y: bb.maxY + 1 };

  const characterJson = {
    schemaVersion: 1,
    version: '1.0.0',
    id: def.id,
    name: def.name,
    category: 'tamer',
    role: 'player',
    description: `Tamer jogavel "${def.name}", inspirado no arquetipo visual descrito (nao e copia 1:1 de personagem da franquia). Base de sprite: DW DS ${def.base} (official-fan-use), com recolor de cabelo + kitbash leve (${def.accessory.type}). ${def.note}`,
    dimensions: { frameW: stand.w, frameH: stand.h, tile: 32 },
    pivot,
    directions: { walk: { drawn: DIRS, mirrored: {} }, idle: { drawn: DIRS, mirrored: {} } },
    animations,
    walkSpeedPxPerSec: 140,
    sprites: './sprites/',
    hairRecolors: { active: def.hair, options: recolorIndex },
    kitbash: { accessory: def.accessory.type, color: def.accessory.color, appliedDirs: def.accessory.dirs, baseCharacter: def.base },
    assetOrigin: {
      layer: 'official-fan-use-derived',
      sourceDescription: `Derivado de ${def.base} (sprite oficial Digimon World DS, Spriters Resource, ripper redblueyellow, "No credit needed"), com recolor de cabelo (paleta propria) e kitbash de acessorio (desenho proprio, primitivo vetorial) sobre o rip. Ver license.json.`,
    },
    approvalStatus: 'UNDER_REVIEW',
    qaNotes: [
      'Kitbash e recolor sao proceduais (desenho vetorial simples sobre o sprite oficial); recomenda-se passe manual de arte antes de considerar "final" -- ver AGENTS do game-art.',
      'Nome e arquetipo propositalmente neutros (nao usar nomes de personagens da franquia em UI/texto de jogo).',
      `Pivo = centro-x (${pivot.x}) e pes (${pivot.y}) do quadro parado S, herdado do recorte do NPC base.`,
    ],
  };
  fs.writeFileSync(path.join(dir, 'character.json'), JSON.stringify(characterJson, null, 2));

  const baseLic = JSON.parse(fs.readFileSync(path.join(NPC_DIR, def.base, 'license.json'), 'utf8'));
  const license = {
    characterId: def.id,
    version: '1.0.0',
    layer: 'official-fan-use-derived',
    derivedFrom: { characterId: def.base, path: `11-characters/official-npcs/${def.base}/` },
    officialRip: true,
    modificationsByStudio: 'recolor de cabelo (hue-shift para paleta propria) + kitbash de acessorio (goggles/viseira/oculos/lenco/gola/bone, desenho vetorial proprio sobre o sprite oficial)',
    nonCommercial: true,
    copyright: baseLic.copyright,
    source: baseLic.source,
    credit: baseLic.credit,
    verifiedAt: TODAY,
    verifiedBy: 'game-art',
    notes: `Preset "${def.name}": nome e combinacao de acessorio/cor sao criacao do estudio; a base de sprite segue a licenca do NPC oficial (${def.base}).`,
  };
  fs.writeFileSync(path.join(dir, 'license.json'), JSON.stringify(license, null, 2));

  // preview: 4 rows x 3 cols, 4x
  const S4 = 4; const fw = stand.w, fh = stand.h;
  const preview = new Canvas(fw * S4 * 3 + 8, fh * S4 * 4 + 8);
  preview.fillRect(0, 0, preview.w - 1, preview.h - 1, [30, 34, 44, 255]);
  DIRS.forEach((d, r) => { canonical[d].forEach((f, c) => preview.blit(f.scaleNearest(S4), 4 + c * fw * S4, 4 + r * fh * S4)); });
  preview.save(path.join(dir, 'preview.png'));

  return { id: def.id, name: def.name, dir, stand, pivot };
}

function main() {
  const results = PRESETS.map(buildPreset);
  for (const r of results) console.log(r.id, r.name, '->', r.dir);

  const previewsDir = path.join(GA, '09-previews');
  const { drawText } = require(path.join(STUDIO, 'projects/prototypes/GS-003/art/src/font5x3.js'));
  const COLS = 6;
  const cellW = 120, cellH = 150;
  const rows = Math.ceil(results.length / COLS);
  const sheet = new Canvas(COLS * cellW, rows * cellH);
  sheet.fillRect(0, 0, sheet.w - 1, sheet.h - 1, [24, 26, 36, 255]);
  results.forEach((r, i) => {
    const col = i % COLS, row = (i / COLS) | 0;
    const ox = col * cellW + 6, oy = row * cellH + 6;
    const s4 = r.stand.scaleNearest(4);
    sheet.blit(s4, ox + Math.max(0, (cellW - 20 - s4.w) / 2), oy);
    drawText(sheet, r.id, ox, oy + 140, [255, 230, 120, 255]);
    drawText(sheet, r.name.split(' ')[0], ox, oy + 130, [200, 220, 255, 255]);
  });
  sheet.save(path.join(previewsDir, 'tamers_v3_presets_stand.png'));
  console.log('wrote', path.join(previewsDir, 'tamers_v3_presets_stand.png'));

  // Required deliverable: every preset, 4 directions (idle frame), 4x.
  const all = buildPreset._all;
  const S4 = 4;
  const dCellW = 44 * S4, labelH = 18, dCellH = 36 * S4 + labelH;
  const dirSheet = new Canvas(DIRS.length * dCellW + 160, all.length * dCellH + 20);
  dirSheet.fillRect(0, 0, dirSheet.w - 1, dirSheet.h - 1, [24, 26, 36, 255]);
  DIRS.forEach((d, c) => drawText(dirSheet, d, 160 + c * dCellW + dCellW / 2 - 2, 4, [160, 200, 220, 255]));
  all.forEach((r, row) => {
    const oy = row * dCellH + 20;
    drawText(dirSheet, r.id, 4, oy + labelH + 50, [255, 230, 120, 255]);
    drawText(dirSheet, r.name, 4, oy + labelH + 60, [200, 220, 255, 255]);
    DIRS.forEach((d, col) => {
      const f = r.canonical[d][1].scaleNearest(S4);
      dirSheet.blit(f, 160 + col * dCellW + (dCellW - f.w) / 2, oy + labelH);
    });
  });
  dirSheet.save(path.join(previewsDir, 'tamers_v3_presets.png'));
  console.log('wrote', path.join(previewsDir, 'tamers_v3_presets.png'));
}

main();
