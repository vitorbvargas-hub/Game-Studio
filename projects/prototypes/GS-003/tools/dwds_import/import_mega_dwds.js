'use strict';
// GS-003 -- Digimon de estágio Mega (Supremo) a partir das folhas de Digimon World DS do Spriters Resource, para o
// fundador testar as animações de um Digimon mais evoluído (?partner=wargreymon). Mesmo pipeline e mesmo contrato
// dos selvagens (import_wild_dwds.js: chroma key automático, componentes conexos, pivô nos pés, creature.json v2,
// license.json), gravando na faixa 00NN (parceiros/evoluções). Diferente dos selvagens, a folha do WarGreymon tem
// pose de mapa de ataque e de dano, e as poses de batalha (idle x3, ataque, dano), então entram também:
//   - attack/hurt = os quadros de mapa 9 (braço erguido) e 8 (agachado) da própria folha, de frente (S), usados em
//     todas as direções (a folha não desenha ataque/dano de lado nem de costas);
//   - battle_idle/battle_attack/battle_hurt = as poses de batalha em escala nativa (space "battle").
// Testado e descartado: reduzir as poses de batalha (119 px) para a altura do mapa (36 px) por moda de bloco, como
// o import_dwds_sheets.py v2 faz, para ter ataque/dano W. No fator 0,30 e ampliado 2x no mundo, o resultado ficou
// borrado/ilegível (prévia em 09-previews/wargreymon_reduzido_descartado.png); downscale() fica aqui para referência.
//
//   node import_mega_dwds.js            # grava CREATURE-0016/ (WarGreymon)
//   node import_mega_dwds.js --index    # folha de contato numerada dos quadros de mapa (conferir direções)
//
// Escala: o sprite de mapa do DS do WarGreymon tem a mesma altura de um Champion (~36 px, Greymon 38 px). O mundo
// só escala por fator inteiro (mapScaleOf), então o porte Mega vem de mapScale 2 (~72 px, ~2,25 tiles), acima do
// Champion (1x, ~38 px). docs/ART_STYLE_GUIDE.md §3 só vai até o Champion (64x64, 2x2 tiles, um degrau acima do
// Rookie); o Mega segue a mesma progressão (um degrau acima do Champion) [H] -- o guia ainda não tem a linha Mega.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const W = require('./import_wild_dwds.js');
const AS = path.resolve(__dirname, '../../art/src');
const { Canvas } = require(path.join(AS, 'canvas.js'));
const { drawText } = require(path.join(AS, 'font5x3.js'));

const MEGAS = [
  {
    cid: 'CREATURE-0016',
    name: 'WarGreymon',
    file: 'WarGreymon__48613',
    stage: 'mega',
    mapScale: 2,
    element: 'vaccine',
    line: { lineId: 'agumon', previous: null, next: [], note: 'Agumon → Greymon → MetalGreymon → WarGreymon; MetalGreymon ainda sem criatura (ver qaNotes).' },
    credit: { ripper: 'A.J. Nitro, Dazz', text: 'Ripped by A.J. Nitro & Dazz. Give credit if used.', required: true },
    // índices 1-based na grade de mapa (--index), conferidos no olho [H]
    walk: { N: [1, 2, 3], W: [4, 5, 6], S: [7] },
    mapHurtS: 8,
    mapAttackS: 9,
    // poses de batalha: componentes grandes (altura > 48) em ordem de leitura
    battle: { idle: [0, 1, 2], attack: 3, hurt: 4 },
  },
];

/** Redução por moda de bloco (porte de downscale() do import_dwds_sheets.py v2). */
function downscale(cell, r) {
  const tw = Math.max(1, Math.round(cell.w * r));
  const th = Math.max(1, Math.round(cell.h * r));
  const out = new Canvas(tw, th);
  for (let ty = 0; ty < th; ty++) {
    const y0 = Math.floor(ty / r), y1 = Math.max(y0 + 1, Math.floor((ty + 1) / r));
    for (let tx = 0; tx < tw; tx++) {
      const x0 = Math.floor(tx / r), x1 = Math.max(x0 + 1, Math.floor((tx + 1) / r));
      let total = 0;
      const cnt = new Map();
      for (let y = y0; y < Math.min(cell.h, y1); y++)
        for (let x = x0; x < Math.min(cell.w, x1); x++) {
          total++;
          const i = (y * cell.w + x) * 4;
          if (!cell.data[i + 3]) continue;
          const k = (cell.data[i] << 16) | (cell.data[i + 1] << 8) | cell.data[i + 2];
          cnt.set(k, (cnt.get(k) ?? 0) + 1);
        }
      const opaque = [...cnt.values()].reduce((s, n) => s + n, 0);
      if (!total || opaque < 0.45 * total) continue;
      let best = -1, bestN = -1;
      for (const [k, n0] of cnt) {
        const dark = ((k >> 16) & 255) + ((k >> 8) & 255) + (k & 255) < 120;
        const n = dark ? n0 * 1.4 : n0;
        if (n > bestN) { bestN = n; best = k; }
      }
      out.setPixel(tx, ty, [(best >> 16) & 255, (best >> 8) & 255, best & 255, 255]);
    }
  }
  return out;
}

function trim(c) {
  const b = W.bbox(c);
  const out = new Canvas(b.x1 - b.x0 + 1, b.y1 - b.y0 + 1);
  for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++) out.setPixel(x - b.x0, y - b.y0, c.getPixel(x, y));
  return out;
}

/** Poses de batalha: componentes altos (> 48 px), em ordem de leitura (linha, depois x). */
function battleCells(c, keys) {
  const { fg, comps } = W.components(c, keys);
  const big = comps.filter((b) => b.y1 - b.y0 + 1 > 48 && b.n >= 400);
  big.sort((a, b) => (Math.abs(a.y0 - b.y0) < 40 ? a.x0 - b.x0 : a.y0 - b.y0));
  return big.map((b) => W.cut(c, fg, b));
}

const h = (c) => {
  const b = W.bbox(c);
  return b.y1 - b.y0 + 1;
};

function importMega(s) {
  const file = W.sheetPath(s);
  const c = W.loadSheetCanvas(file);
  const keys = W.sheetKeys(s, c);
  const { fg, frames } = W.mapFrames(c, keys);
  const need = Math.max(...Object.values(s.walk).flat(), s.mapHurtS, s.mapAttackS);
  if (need > frames.length) throw new Error(`${s.name}: ${frames.length} quadros de mapa, a tabela pede #${need}`);
  const mapCell = (i) => W.cut(c, fg, frames[i - 1]);
  const battle = battleCells(c, keys);
  if (battle.length < 5) throw new Error(`${s.name}: ${battle.length} poses de batalha (esperava 5)`);
  const bIdle = s.battle.idle.map((i) => battle[i]);
  const bAtk = battle[s.battle.attack];
  const bHurt = battle[s.battle.hurt];

  const rawWalk = Object.fromEntries(Object.entries(s.walk).map(([d, idx]) => [d, idx.map(mapCell)]));
  const standS = rawWalk.S[rawWalk.S.length === 3 ? 1 : 0];
  const standH = h(standS);
  const battleH = Math.max(...bIdle.map(h));
  const ratio = standH / battleH;
  const raw = {
    walk: rawWalk,
    attack: { S: [mapCell(s.mapAttackS)] },
    hurt: { S: [mapCell(s.mapHurtS)] },
  };
  // todos os quadros de mapa no mesmo tamanho, pés na última linha, centróide no pivô
  const flat = [];
  for (const [anim, byDir] of Object.entries(raw)) for (const [d, list] of Object.entries(byDir)) list.forEach((cell, i) => flat.push({ anim, d, i, cell }));
  const { cells, pivot } = W.normalize(flat.map((f) => f.cell));
  flat.forEach((f, k) => (f.cell = cells[k]));
  const keyOf = (anim, d, i) => `${s.cid}_${anim}_${d}_${String(i).padStart(2, '0')}.png`;
  // poses de batalha: quadro comum próprio (escala nativa), pivô nos pés
  const bList = [...bIdle.map((cell, i) => ({ anim: 'battle_idle', d: 'SW', i, cell })), { anim: 'battle_attack', d: 'SW', i: 0, cell: bAtk }, { anim: 'battle_hurt', d: 'SW', i: 0, cell: bHurt }];
  const bn = W.normalize(bList.map((b) => b.cell));
  bList.forEach((b, k) => (b.cell = bn.cells[k]));

  const d = path.join(W.CRE, s.cid);
  for (const sub of ['sprites', 'spritesheets', 'previews']) {
    fs.mkdirSync(path.join(d, sub), { recursive: true });
    for (const f of fs.readdirSync(path.join(d, sub))) fs.unlinkSync(path.join(d, sub, f));
  }
  const rowsOf = (list, pv) => {
    const groups = new Map();
    for (const f of list) {
      const g = `${f.anim}_${f.d}`;
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push({ key: keyOf(f.anim, f.d, f.i), c: f.cell, pivot: pv });
    }
    return [...groups.values()];
  };
  const rows = [...rowsOf(flat, pivot), ...rowsOf(bList, bn.pivot)];
  for (const r of rows) for (const it of r) it.c.save(path.join(d, 'sprites', it.key));
  const { sheet, frames: atlasFrames } = W.packSheet(rows);
  sheet.save(path.join(d, 'spritesheets', `${s.cid}.png`));
  fs.writeFileSync(
    path.join(d, 'spritesheets', `${s.cid}.atlas.json`),
    JSON.stringify({ frames: atlasFrames, meta: { app: 'GS-003 tools/dwds_import/import_mega_dwds.js', image: `${s.cid}.png`, format: 'RGBA8888', size: { w: sheet.w, h: sheet.h }, scale: '1' } }, null, 2) + '\n',
  );

  // prévias 4x: mapa (walk N/W/S, attack S/W, hurt S/W) e batalha 1x
  const S4 = 4;
  const cw = cells[0].w * S4 + 4;
  const pv = new Canvas(flat.length * cw + 4, cells[0].h * S4 + 16);
  pv.fillRect(0, 0, pv.w - 1, pv.h - 1, [30, 34, 44, 255]);
  flat.forEach((f, i) => {
    pv.blit(f.cell.scaleNearest(S4), 4 + i * cw, 4);
    drawText(pv, `${f.anim[0]}${f.d}${f.i}`, 6 + i * cw, pv.h - 9, [255, 230, 120, 255]);
  });
  pv.save(path.join(d, 'previews', 'map_all_x4.png'));
  const bw = bn.cells[0].w + 4;
  const bp = new Canvas(bList.length * bw + 4, bn.cells[0].h + 8);
  bp.fillRect(0, 0, bp.w - 1, bp.h - 1, [30, 34, 44, 255]);
  bList.forEach((b, i) => bp.blit(b.cell, 4 + i * bw, 4));
  bp.save(path.join(d, 'previews', 'battle_x1.png'));

  // registro do teste descartado: poses de batalha de ataque/dano reduzidas para o mapa, 4x
  const red = [trim(downscale(bAtk, ratio)), trim(downscale(bHurt, ratio))];
  const rp = new Canvas(red.reduce((a, c2) => a + c2.w * 4 + 8, 8), Math.max(...red.map((c2) => c2.h)) * 4 + 8);
  rp.fillRect(0, 0, rp.w - 1, rp.h - 1, [30, 34, 44, 255]);
  red.reduce((x, c2) => (rp.blit(c2.scaleNearest(4), x, 4), x + c2.w * 4 + 8), 8);
  rp.save(path.join(W.PREVIEWS, `${s.name.toLowerCase()}_reduzido_descartado.png`));
  const keysBy = (anim) => Object.fromEntries(Object.entries(raw[anim]).map(([dr, list]) => [dr, list.map((_, i) => keyOf(anim, dr, i))]));
  const wk = keysBy('walk');
  const ak = keysBy('attack');
  const hk = keysBy('hurt');
  const fr = (ks, ms) => ks.map((atlasKey) => ({ durationMs: ms, atlasKey }));
  const walkDir = Object.fromEntries(Object.entries(wk).map(([dr, ks]) => [dr, fr(ks.length === 1 ? ks : W.walkCycle(ks), W.WALK_FRAME_MS)]));
  const idleDir = Object.fromEntries(Object.entries(wk).map(([dr, ks]) => [dr, fr([W.standKey(ks)], 600)]));
  // ataque: de pé (antecipação) → braço erguido (hitFrame) → de pé; uma direção desenhada (S) para todas
  const atkDir = { S: [{ durationMs: 180, atlasKey: W.standKey(wk.S) }, { durationMs: 220, atlasKey: ak.S[0] }, { durationMs: 80, atlasKey: W.standKey(wk.S) }] };
  const hurtDir = { S: fr(hk.S, 240) };
  const dirs = Object.keys(wk);
  const union = cells.map(W.bbox).reduce((a, b) => ({ x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1) }));
  const standBox = W.bbox(flat.find((f) => f.anim === 'walk' && f.d === 'S').cell);
  const hb = { x: standBox.x0, y: standBox.y0, w: standBox.x1 - standBox.x0 + 1, h: standBox.y1 - standBox.y0 + 1 };
  const rx = Math.max(3, Math.round(hb.w * 0.38));
  const sha = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const bk = (anim) => bList.filter((b) => b.anim === anim).map((b) => keyOf(b.anim, b.d, b.i));
  const bIdleKeys = bk('battle_idle');
  const creature = {
    schemaVersion: 2,
    version: '1.0.0',
    id: s.cid,
    name: s.name,
    category: 'digital-creature',
    rarity: 'legendary',
    element: s.element,
    attributes: {},
    evolutionStage: s.stage,
    evolutionLine: s.line,
    evolutionRequirements: {},
    description:
      `${s.name}: sprites oficiais de Digimon World DS. No mapa: walk em N e W (3 quadros) e S (1 quadro de pé; a folha não desenha passada de frente); ` +
      'E espelhado de W. Ataque e dano de mapa: os quadros de mapa da própria folha (braço erguido / agachado), de frente, em todas as direções. ' +
      'Poses de batalha em escala nativa em battle_*. Porte Mega: mapScale 2.',
    dimensions: { frameW: cells[0].w, frameH: cells[0].h, tile: 32 },
    pivot,
    mapScale: s.mapScale,
    targetHeightPx: standH * s.mapScale,
    nativeMapHeightPx: standH,
    nativeBattleHeightPx: battleH,
    sizeNotes:
      `Sprite de mapa do DS com ${standH} px de pé (mesma altura nativa de um Champion: Greymon 38 px). O ART_STYLE_GUIDE §3 vai até o Champion; ` +
      `porte Mega = um degrau acima dele [H]: mapScale ${s.mapScale} (inteiro, pixel-perfect) -> ~${standH * s.mapScale} px no mapa, contra ~38 px do Champion (1x). O fator 2 é decisão de apresentação, não medida do jogo.`,
    hitbox: hb,
    anchors: { head: { x: pivot.x, y: hb.y }, hit: { x: pivot.x, y: hb.y + Math.floor(hb.h / 2) }, shadow: { cx: pivot.x, cy: pivot.y, rx, ry: Math.max(2, Math.round(rx * 0.35)) } },
    directions: {
      walk: { drawn: dirs, mirrored: { E: 'W' } },
      idle: { drawn: dirs, mirrored: { E: 'W' } },
      attack: { drawn: ['S'], mirrored: {} },
      hurt: { drawn: ['S'], mirrored: {} },
      battle_idle: { drawn: ['SW'], mirrored: { SE: 'SW' } },
    },
    animations: {
      idle: { loop: true, space: 'map', frames: idleDir.S, events: [], dirFrames: idleDir },
      walk: { loop: true, space: 'map', frames: walkDir.S, events: [], dirFrames: walkDir },
      attack: { loop: false, space: 'map', frames: atkDir.S, events: [{ frame: 1, name: 'hitFrame' }], dirFrames: atkDir },
      hurt: { loop: false, space: 'map', frames: hurtDir.S, events: [], dirFrames: hurtDir },
      battle_idle: { loop: true, space: 'battle', frames: fr([...bIdleKeys, bIdleKeys[1]], 250), events: [] },
      battle_attack: { loop: false, space: 'battle', frames: fr(bk('battle_attack'), 200), events: [{ frame: 0, name: 'hitFrame' }] },
      battle_hurt: { loop: false, space: 'battle', frames: fr(bk('battle_hurt'), 300), events: [] },
    },
    walkSpeedPxPerSec: 160,
    combatStates: { IDLE: 'idle', WALK: 'walk', FOLLOW: 'walk', ENGAGE: 'walk', RETURN: 'walk', ATTACK: 'attack', HURT: 'hurt', DEFEAT: 'hurt' },
    sprites: './sprites/',
    spritesheets: './spritesheets/',
    assetOrigin: {
      layer: 'official-fan-use',
      sourceDescription: `Folha Digimon World DS "${s.name}" do Spriters Resource (${W.SR_PAGE}); 10-source-files/spriters-resource/${path.basename(file)}. Detalhe em license.json.`,
    },
    approvalStatus: 'UNDER_REVIEW',
    qaNotes: [
      `Quadros de mapa achados automaticamente (${frames.length}); direções conferidas no olho [H]: walk ${JSON.stringify(s.walk)}, dano S #${s.mapHurtS}, ataque S #${s.mapAttackS}.`,
      'A folha só tem 1 quadro de frente (S): andando para o sul o sprite não troca de perna (desliza na pose de pé).',
      'Ataque/dano só existem de frente (quadros 9 e 8): virado para N/W/E o golpe e o dano usam a pose de frente. As poses de batalha (de lado) ficam em battle_* na escala nativa; reduzidas para o mapa ficaram ilegíveis e foram descartadas.',
      'Linha: MetalGreymon não tem criatura importada (a folha 48322 existe no acervo, mas a grade de mapa mistura duas paletas e não dá para separar direções com segurança). Sem caminho Greymon → WarGreymon no jogo normal.',
      'rarity/element/evolutionStage provisórios [H].',
    ],
  };
  fs.writeFileSync(path.join(d, 'creature.json'), JSON.stringify(creature, null, 2) + '\n');
  const cr = s.credit;
  const license = {
    creatureId: s.cid,
    version: '1.0.0',
    layer: 'official-fan-use',
    officialRip: true,
    fanException: false,
    baseCharacter: s.name,
    nonCommercial: true,
    noRip: false,
    copyright: W.COPYRIGHT,
    source: {
      type: 'game-rip', game: 'Digimon World DS (Nintendo DS)', site: 'The Spriters Resource', sitePage: W.SR_PAGE,
      sheetFile: `10-source-files/spriters-resource/${path.basename(file)}`, sha256: sha, bytes: fs.statSync(file).size, retrievedAt: W.TODAY,
      modifications: 'chroma key automático (cores com bloco liso 12x12); quadros de mapa e poses de batalha recortados por componentes conexos e realinhados pelo pivô nos pés (sem redimensionar)',
    },
    credit: { ripper: cr.ripper, creditTextOnSheet: cr.text, creditRequiredBySheet: cr.required, site: 'The Spriters Resource' },
    verifiedAt: W.TODAY,
    verifiedBy: 'game-dev',
    notes: `Crédito obrigatório pela folha: ${cr.ripper} (rip DW DS, The Spriters Resource); (c) Bandai Namco.`,
  };
  fs.writeFileSync(path.join(d, 'license.json'), JSON.stringify(license, null, 2) + '\n');
  console.log(s.cid, s.name, `${frames.length} quadros de mapa + ${battle.length} poses de batalha`, `quadro ${cells[0].w}x${cells[0].h}`, `pé ${standH}px x${s.mapScale}`, `batalha ${battleH}px`);
  return creature;
}

function indexSheet() {
  for (const s of MEGAS) {
    const c = W.loadSheetCanvas(W.sheetPath(s));
    const { fg, frames } = W.mapFrames(c, W.sheetKeys(s, c));
    const S = 4;
    const out = new Canvas(frames.length * (60 * S) / 2 + 8, 56 * S);
    out.fillRect(0, 0, out.w - 1, out.h - 1, [24, 26, 36, 255]);
    let x = 4;
    frames.forEach((b, k) => {
      const cell = W.cut(c, fg, b).scaleNearest(S);
      out.blit(cell, x, 4);
      drawText(out, String(k + 1), x, 8 + cell.h, [200, 220, 255, 255]);
      x += cell.w + 8;
    });
    const p = path.join(__dirname, `mega_index_${s.name}.png`);
    out.save(p);
    console.log('wrote', p);
  }
}

module.exports = { MEGAS, importMega, downscale };

if (require.main === module) {
  W.predecode(MEGAS.map(W.sheetPath)).then(() => (process.argv.includes('--index') ? indexSheet() : MEGAS.forEach(importMega)));
}
