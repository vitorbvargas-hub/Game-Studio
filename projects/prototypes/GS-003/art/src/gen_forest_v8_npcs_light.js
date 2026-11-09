'use strict';
// GS-003 Map Factory -- forest-v8-depth ADDITIONS: NPC scale fix + 2 light props.
//
// Fixes the bug reported against forest-v7-pixellab (evidence/map-factory/
// factory_v4_clareira_luzes_dia_v4.png): props/npc_ranger.png and
// props/npc_merchant.png (48x64, PixelLab-painted style) read ~2x bigger
// than the Tamers (26x33, DW DS flat-chibi style, GAME-ASSETS/11-characters/
// TAMER-0003..0014). Rebuilds both NPCs at the Tamer's own native scale and
// pixel style by kitbashing an unused official-fan-use NPC base sprite
// (GAME-ASSETS/11-characters/official-npcs/, read-only input), the exact
// same technique tools/char_import/build_tamer_presets.js used to build the
// 12 Tamer presets (hair recolor via kitbash.js + a simple vector accessory
// drawn with Canvas.js primitives) -- 0 PixelLab generations.
//
// Also adds 2 new light-emitting props (lanterna de poste, fogueira
// pequena) in the forest-v8-depth emissiveProps convention (light:
// {color,radius,intensity} in tileset.json, same as data_crystal/
// mushroom_bioluminescent/data_totem).
//
// Writes ONLY new files into art/map-factory/forest-v8-depth/ -- no
// existing forest-v7-pixellab or forest-v8-depth piece is overwritten.
// tileset.json/license.json/README.md are extended (read-parse-append-
// write), never replaced wholesale.
//
// Run with: node art/src/gen_forest_v8_npcs_light.js
const fs = require('fs');
const path = require('path');
const { Canvas } = require('./canvas.js');
const { withAlpha, rng } = require('./endesga32.js');
const { loadSheetCanvas } = require('./dwds_extract.js');
const { rimDarken } = require('./forest_v4_props.js');
const { buildDepthRamps } = require('./forest_v8_depth_palette.js');
const { drawText } = require('./font5x3.js');
const KIT = require('../../tools/char_import/kitbash.js');

const STUDIO = path.resolve(__dirname, '../../../../..');
const GA = path.join(STUDIO, 'assets/GAME-ASSETS/11-characters'); // READ-ONLY input
const NPC_DIR = path.join(GA, 'official-npcs');
const OUT = path.resolve(__dirname, '../map-factory/forest-v8-depth');
const TODAY = '2026-11-09';

function darken(c, amt) { return [Math.max(0, c[0] - amt), Math.max(0, c[1] - amt), Math.max(0, c[2] - amt), c[3] ?? 255]; }
function lighten(c, amt) { return [Math.min(255, c[0] + amt), Math.min(255, c[1] + amt), Math.min(255, c[2] + amt), c[3] ?? 255]; }
function glowHalo(c, cx, cy, color, maxR, baseAlpha = 70) {
  for (let r = maxR; r >= 1; r--) {
    const a = Math.round(baseAlpha * (1 - r / maxR) * (1 - r / maxR));
    if (a <= 2) continue;
    c.fillEllipse(cx, cy, r, Math.round(r * 0.8), withAlpha(color, a));
  }
}

// =========================================================================
// 1. NPC kitbash -- same pipeline as build_tamer_presets.js, new accessory
//    shapes (ranger hat, merchant satchel) that kitbash.js does not have.
// =========================================================================
function loadNpcFrame(npcId, dir, idx) {
  return loadSheetCanvas(path.join(NPC_DIR, npcId, 'sprites', `${npcId}_walk_${dir}_0${idx}.png`));
}

function addRangerHat(frame, brim, crown) {
  const f = KIT.cloneFrame(frame);
  const a = KIT.headAnchor(f);
  const y = a.top;
  f.fillEllipse(a.cx, y, 8, 2, brim);
  f.strokeEllipse(a.cx, y, 8, 2, darken(brim, 60), 1);
  f.fillEllipse(a.cx, y - 2, 5, 3, crown);
  f.strokeEllipse(a.cx, y - 2, 5, 3, darken(crown, 60), 1);
  f.line(a.cx, y - 4, a.cx, y - 1, darken(crown, 80), 1);
  f.line(a.cx - 4, y, a.cx + 4, y, darken(brim, 40), 1);
  return f;
}

function addSatchel(frame, strap, bag) {
  const f = KIT.cloneFrame(frame);
  const a = KIT.headAnchor(f);
  const sx = a.cx - 5, sy = a.neckY - 1;
  const bx = a.cx + 4, by = a.neckY + 9;
  f.line(sx, sy, bx, by, strap, 1);
  f.fillEllipse(bx, by, 3, 3, bag);
  f.fillRect(bx - 2, by - 2, bx + 2, by - 1, lighten(bag, 40));
  f.strokeEllipse(bx, by, 3, 3, darken(bag, 70), 1);
  f.setPixel(bx, by - 3, [230, 200, 120, 255]);
  return f;
}

function buildNpc({ base, hairHex, kit }) {
  const stand = loadNpcFrame(base, 'SW', 1);
  const seed = KIT.sampleHairSeed(stand);
  const recolored = KIT.recolorHair(stand, seed, hairHex, 48);
  return kit(recolored);
}

const RANGER = buildNpc({
  base: 'NPC-0016', // "Castanho Claro, masc" -- unused by any TAMER-00NN preset
  hairHex: '#5B4327', // earthy forest brown
  kit: (f) => {
    const withVest = KIT.addCollarBand(f, [74, 94, 58, 255]); // moss-green vest trim, reads from any angle
    return addRangerHat(withVest, [91, 107, 66, 255], [61, 74, 43, 255]); // olive brim + darker crown
  },
});

const MERCHANT = buildNpc({
  base: 'NPC-0005', // "Ancião Grisalho" (mentor/vila) -- unused by any TAMER-00NN preset
  hairHex: '#C9CCCF', // keep the natural grey ("Ancião") -- fits a travelling merchant
  kit: (f) => {
    const withVest = KIT.addCollarBand(f, [196, 138, 59, 255]); // tan/mustard vest trim
    return addSatchel(withVest, [90, 58, 30, 255], [139, 90, 43, 255]); // leather strap + brown satchel
  },
});

// =========================================================================
// 2. Light props -- forest-v8-depth emissiveProps convention.
// =========================================================================
function lanternPost(bark) {
  const w = 16, h = 42;
  const c = new Canvas(w, h);
  const cx = w / 2;
  const fire = [255, 175, 85, 255];
  glowHalo(c, cx, 9, fire, 10, 85);
  c.fillRect(cx - 2, 14, cx + 1, h - 3, bark.mid);
  c.fillRect(cx - 2, 14, cx - 1, h - 3, bark.dk);
  c.fillRect(cx + 1, 14, cx + 2, h - 3, bark.hi);
  c.fillRect(cx - 4, 4, cx + 4, 14, [40, 34, 28, 255]);
  c.fillRect(cx - 3, 5, cx + 3, 13, withAlpha(fire, 215));
  c.line(cx, 5, cx, 13, [30, 26, 22, 255], 1);
  c.line(cx - 3, 9, cx + 3, 9, [30, 26, 22, 255], 1);
  c.fillPolygon([[cx - 5, 4], [cx + 5, 4], [cx, 0]], bark.dk);
  c.strokePolygon([[cx - 5, 4], [cx + 5, 4], [cx, 0]], [20, 16, 12, 255], 1);
  c.setPixel(cx, 8, [255, 230, 170, 255]);
  rimDarken(c, [12, 10, 8, 255], 120);
  c.fillEllipse(cx, h - 2, 6, 2, withAlpha([0, 0, 0, 255], 100));
  return c;
}

function campfireSmall(seed) {
  const w = 20, h = 16;
  const c = new Canvas(w, h);
  const fire = [255, 140, 60, 255];
  glowHalo(c, w / 2, h * 0.45, fire, 9, 90);
  const log = [90, 58, 30, 255];
  c.line(4, h - 3, w - 5, h - 7, log, 2);
  c.line(w - 5, h - 3, 4, h - 7, log, 2);
  const base = h - 6;
  c.fillPolygon([[w / 2 - 4, base], [w / 2 + 4, base], [w / 2, base - 9]], [200, 40, 20, 255]);
  c.fillPolygon([[w / 2 - 3, base], [w / 2 + 3, base], [w / 2, base - 7]], [255, 120, 30, 255]);
  c.fillPolygon([[w / 2 - 2, base], [w / 2 + 2, base], [w / 2, base - 5]], [255, 210, 90, 255]);
  c.setPixel(w / 2, base - 6, [255, 255, 220, 255]);
  rimDarken(c, [10, 8, 8, 255], 90);
  c.fillEllipse(w / 2, h - 2, 7, 2, withAlpha([0, 0, 0, 255], 90));
  return c;
}

// =========================================================================
// 3. Comparison plank -- 2 new NPCs next to 2 Tamers, same scale (4x).
// =========================================================================
function loadTamerStand(id, hair) {
  const cj = JSON.parse(fs.readFileSync(path.join(GA, id, 'character.json'), 'utf8'));
  const frames = cj.hairRecolors.options.find((o) => o.id === hair).frames.SW;
  return loadSheetCanvas(path.join(GA, id, frames[1].replace(/^\.\//, '')));
}

function buildComparisonSheet() {
  const items = [
    { canvas: RANGER, label: 'RANGER' },
    { canvas: MERCHANT, label: 'MERCHANT' },
    { canvas: loadTamerStand('TAMER-0003', 'ruivo'), label: 'TAMER-0003' },
    { canvas: loadTamerStand('TAMER-0004', 'loiro'), label: 'TAMER-0004' },
  ];
  const S = 4;
  const cellW = 26 * S + 16, cellH = 33 * S + 26;
  const sheet = new Canvas(cellW * items.length + 8, cellH + 20);
  sheet.fillRect(0, 0, sheet.w - 1, sheet.h - 1, [24, 26, 36, 255]);
  drawText(sheet, 'FOREST-V8 NPC SCALE VS TAMER (4X, SAME BASE 26X33)', 6, 4, [220, 220, 230, 255]);
  items.forEach((it, i) => {
    const ox = 4 + i * cellW, oy = 16;
    const s = it.canvas.scaleNearest(S);
    sheet.blit(s, ox + (cellW - s.w) / 2, oy);
    drawText(sheet, it.label, ox + 4, oy + 33 * S + 6, [255, 230, 120, 255]);
    drawText(sheet, `${it.canvas.w}X${it.canvas.h}`, ox + 4, oy + 33 * S + 16, [160, 200, 220, 255]);
  });
  return sheet;
}

// =========================================================================
// 4. tileset.json / license.json / README.md -- extend, never overwrite.
// =========================================================================
function extendTileset(tilesetPath) {
  const t = JSON.parse(fs.readFileSync(tilesetPath, 'utf8'));
  if (!t.layers.includes('npc')) t.layers.push('npc');
  t.npcs = (t.npcs || []).concat([
    {
      file: 'props/npc_ranger.png',
      size: '26x33',
      collision: true,
      suggestedLayer: 'npc',
      note: 'Replaces forest-v7-pixellab/props/npc_ranger.png (48x64, ~2x the Tamer scale -- see evidence/map-factory/factory_v4_clareira_luzes_dia_v4.png). Rebuilt from GAME-ASSETS/11-characters/official-npcs/NPC-0016 (unused by any TAMER-00NN preset) with a hair recolor + kitbash ranger hat (olive brim/crown) + a moss-green vest-trim accent, same technique and exact 26x33 canvas as the Tamer presets (build_tamer_presets.js). Single standing frame (SW, front-facing), same convention as the piece it replaces.',
    },
    {
      file: 'props/npc_merchant.png',
      size: '26x33',
      collision: true,
      suggestedLayer: 'npc',
      note: 'Replaces forest-v7-pixellab/props/npc_merchant.png (48x64). Rebuilt from GAME-ASSETS/11-characters/official-npcs/NPC-0005 (unused by any TAMER-00NN preset) with a kitbash leather satchel/backpack (strap + bag) + a tan vest-trim accent, same 26x33 canvas as the Tamer presets. Single standing frame (SW, front-facing).',
    },
  ]);
  t.emissiveProps = (t.emissiveProps || []).concat([
    {
      file: 'props/lantern_post.png',
      size: '16x42',
      collision: true,
      suggestedLayer: 'decor',
      light: { color: '#ffb347', radius: 50, intensity: 0.85 },
      note: 'Forest-path lamp post (wooden post, caged glass top) -- warm firelight, not the digital-theme accent used by data_crystal/data_totem. Place along paths/clearing edges for the night look.',
    },
    {
      file: 'props/campfire_small.png',
      size: '20x16',
      collision: true,
      suggestedLayer: 'decor',
      light: { color: '#ff7a33', radius: 36, intensity: 0.8 },
      note: 'Small crossed-log campfire, warm orange-red light, smaller radius than lantern_post -- camp/rest-point prop.',
    },
  ]);
  fs.writeFileSync(tilesetPath, JSON.stringify(t, null, 2));
}

function extendLicense(licensePath) {
  const l = JSON.parse(fs.readFileSync(licensePath, 'utf8'));
  l.assets.push(
    {
      group: 'props/npc_ranger.png + props/npc_merchant.png',
      origin: 'game-art, local kitbash pipeline (recolor + vector accessory over an official-fan-use base sprite), 2026-11-09',
      layer: 'official-fan-use-derived',
      author: 'game-art',
      technique: 'Same pipeline as GAME-ASSETS/11-characters/TAMER-0003..0014 (tools/char_import/build_tamer_presets.js): kitbash.js hair recolor (hue-shift preserving shading) + a vector accessory (ellipse/line/polygon primitives, this file\'s addRangerHat/addSatchel) drawn over the official NPC base sprite. 0 PixelLab generations.',
      derivedFrom: [
        { characterId: 'NPC-0016', path: '11-characters/official-npcs/NPC-0016/ (GAME-ASSETS, not copied into this pack)', usedFor: 'props/npc_ranger.png' },
        { characterId: 'NPC-0005', path: '11-characters/official-npcs/NPC-0005/ (GAME-ASSETS, not copied into this pack)', usedFor: 'props/npc_merchant.png' },
      ],
      officialRip: true,
      nonCommercial: true,
      copyright: 'Digimon (c) Bandai Namco Entertainment Inc. / Toei Animation; Digimon World DS (c) Bandai Namco Games',
      credit: { ripper: 'redblueyellow', site: 'The Spriters Resource', creditRequiredBySheet: false },
      license: 'Same official-fan-use-derived terms as TAMER-0003..0014 (see GAME-ASSETS/11-characters/TAMER-0016? n/a -- see any TAMER-00NN/license.json for the identical clause). Studio modifications (recolor + accessory) are original; the base rip follows the sheet\'s own no-credit-required terms.',
      verifiedAt: TODAY,
      verifiedBy: 'game-art',
    },
    {
      group: 'props/lantern_post.png + props/campfire_small.png',
      origin: 'game-art, 100% local pipeline (Canvas.js), 2026-11-09',
      layer: 'original',
      author: 'game-art',
      technique: 'Canvas.js primitives (fillRect/fillEllipse/fillPolygon/line) + the same glowHalo()/rimDarken() technique as this pack\'s 3 existing emissiveProps. Bark tones reused from forest_v8_depth_palette.js buildDepthRamps(); fire colors are new, reserved to these 2 light props only.',
      license: 'studio-original (GS-003 fan game, ADR-007/ADR-009) -- no third-party art referenced pixel-for-pixel.',
      verifiedAt: TODAY,
      verifiedBy: 'game-art',
    },
  );
  fs.writeFileSync(licensePath, JSON.stringify(l, null, 2));
}

function appendReadme(readmePath) {
  const addendum = `

## Adicao 2026-11-09 — NPCs na escala do Tamer + lanterna/fogueira (GS-003, pedido do game-studio)

Corrige o bug reportado contra \`forest-v7-pixellab\` (NPCs do PixelLab ~2x maiores que os Tamers --
\`evidence/map-factory/factory_v4_clareira_luzes_dia_v4.png\`) e adiciona 2 props de luz. **0 geracoes do
PixelLab gastas** -- \`get_balance\` antes e depois: 26 restantes, 14 usadas, sem mudanca (mesmo pipeline
local desta pasta).

### NPCs reconstruidos na escala do Tamer

- \`props/npc_ranger.png\` e \`props/npc_merchant.png\` (26x33 cada, antes 48x64 no \`forest-v7-pixellab\`) --
  reconstruidos pelo MESMO pipeline que gerou \`GAME-ASSETS/11-characters/TAMER-0003..0014\`
  (\`tools/char_import/build_tamer_presets.js\`): recolor de cabelo + kitbash de acessorio vetorial sobre
  um sprite-base oficial (\`official-fan-use\`) de \`GAME-ASSETS/11-characters/official-npcs/\`, nao usado
  por nenhum preset de Tamer (NPC-0016 para o ranger, NPC-0005 para o comerciante). Mesmo canvas 26x33,
  mesmo pivo, mesmo outline/estilo chibi DW DS -- a causa raiz do bug (dois pipelines de arte diferentes
  no mesmo mapa) deixa de existir porque agora e o MESMO pipeline.
  - **Ranger**: cabelo recolorido para castanho-terra + kitbash de chapeu de aba larga (verde-oliva) +
    friso de colete verde-musgo (\`addRangerHat\`/\`addCollarBand\` reaproveitado de \`kitbash.js\`).
  - **Comerciante**: base "Anciao Grisalho" (cabelo grisalho mantido -- arquetipo de mercador viajante) +
    kitbash de mochila/bolsa de couro (alca + bolsa, \`addSatchel\`) + friso de colete mostarda.
  - **Um frame so** (SW, de frente), mesma convencao do que foi substituido ("Standing idle... Single
    frame, no walk animation" no README do \`forest-v7-pixellab\`).
  - \`forest-v7-pixellab/props/npc_ranger.png\`/\`npc_merchant.png\` **nao foram tocados** -- ficam no pacote
    v7 como estavam; o kit v8 e quem o game-dev deve apontar para os novos.
- \`npc_scale_comparison.png\` (raiz deste pacote) -- prancha 4x comparando os 2 NPCs novos lado a lado com
  2 Tamers (\`TAMER-0003\` ruivo, \`TAMER-0004\` loiro) na MESMA escala, confirmando visualmente que a
  proporcao bate (26x33 todos, mesmo fator 4x de preview).

### 2 novos props de luz (\`light\` em \`tileset.json\`, mesma convencao dos 3 \`emissiveProps\` ja existentes)

- \`props/lantern_post.png\` (16x42) -- poste de madeira com lanterna/caixa de vidro no topo, luz quente
  (\`#ffb347\`, raio 50, intensidade 0.85). Cor deliberadamente diferente do acento "digital" (\`dataAmber\`)
  usado por \`data_totem.png\` -- isto e uma lanterna comum, nao um farol digital.
- \`props/campfire_small.png\` (20x16) -- fogueira pequena (2 toras cruzadas + chama em 3 camadas), luz
  quente laranja-avermelhada (\`#ff7a33\`, raio 36, intensidade 0.8), raio menor que a lanterna (prop de
  acampamento/ponto de descanso, nao de trilha).
- Ambos entraram em \`tileset.json.emissiveProps\` (array estendido, os 3 props existentes **nao** foram
  alterados) e a layer \`"npc"\` foi adicionada a \`tileset.json.layers\` (as 5 layers existentes continuam
  as mesmas).

### O que o game-dev precisa trocar no kit

1. **Qualquer referencia a \`forest-v7-pixellab/props/npc_ranger.png\`/\`npc_merchant.png\`** (aliases.json,
   gerador de mapa, ou a propria clareira em \`evidence/map-factory/factory_v4_clareira_luzes_dia_v4.png\`
   se ela for regerada) deve apontar para \`forest-v8-depth/props/npc_ranger.png\`/\`npc_merchant.png\`.
2. **Escala de desenho**: como os novos NPCs sao 26x33 (identico ao frame do Tamer), eles devem ser
   desenhados pelo MESMO caminho de renderizacao/pivo usado para os Tamers (pivot pes-centro-x), nao pelo
   caminho de prop generico 48x64 do v7 -- caso o renderer escale props para um tamanho fixo, essa escala
   fixa deve sair da lista para estes 2 arquivos.
3. **Luz dos props novos**: mesmo trabalho pendente ja documentado para \`data_crystal\`/\`mushroom_bioluminescent\`/
   \`data_totem\` -- ler o campo \`light\` e desenhar o gradiente aditivo; nada disso esta implementado aqui,
   so os dados (ver Limitacoes do README original acima).
4. **Colisao**: \`npc_ranger.png\`/\`npc_merchant.png\`/\`lantern_post.png\`/\`campfire_small.png\` tem
   \`collision: true\` em \`tileset.json\` -- hitbox e trabalho do game-dev, como sempre neste pipeline.

### Limitacoes (autocritica)

- **Kitbash vetorial, nao arte final** -- mesma ressalva que \`TAMERS_V3_PRESETS.md\` ja faz para os 12
  presets de Tamer: \`addRangerHat\`/\`addSatchel\` sao formas geometricas simples (elipse/linha/retangulo)
  sobre o sprite oficial, nao um passe de pixel art manual. Um passe manual deixaria os acessorios mais
  nitidos em 26x33 (canvas pequeno, poucos pixels de folga).
  **Nao foi testado num mapa real nem com o pivo/colisao real do motor.**
- **Satchel/vest sao simetricos em todas as direcoes** (nao ha 4 variantes direcionais do acessorio) --
  so a direcao SW (frente) foi gerada; se o game-dev quiser os NPCs andando ou vistos de costas, falta
  gerar SE/NW/NE com o mesmo kitbash (o pipeline suporta, so nao foi rodado nas 4 direcoes aqui porque o
  piece que ele substitui tambem era 1 frame so).
- **Lanterna/fogueira sao so a arte + o dado \`light\`** -- igual aos 3 emissiveProps que ja existiam neste
  pacote, nao ha renderizacao de luz implementada.
- **0 geracoes do PixelLab usadas** -- pipeline 100% local, mesmo padrao do resto de \`forest-v8-depth\`.
`;
  fs.appendFileSync(readmePath, addendum);
}

// =========================================================================
function main() {
  const d = buildDepthRamps();
  const propsDir = path.join(OUT, 'props');
  fs.mkdirSync(propsDir, { recursive: true });

  RANGER.save(path.join(propsDir, 'npc_ranger.png'));
  MERCHANT.save(path.join(propsDir, 'npc_merchant.png'));
  lanternPost(d.bark).save(path.join(propsDir, 'lantern_post.png'));
  campfireSmall(9101).save(path.join(propsDir, 'campfire_small.png'));
  buildComparisonSheet().save(path.join(OUT, 'npc_scale_comparison.png'));

  extendTileset(path.join(OUT, 'tileset.json'));
  extendLicense(path.join(OUT, 'license.json'));
  appendReadme(path.join(OUT, 'README.md'));

  console.log('wrote', path.join(propsDir, 'npc_ranger.png'), `(${RANGER.w}x${RANGER.h})`);
  console.log('wrote', path.join(propsDir, 'npc_merchant.png'), `(${MERCHANT.w}x${MERCHANT.h})`);
  console.log('wrote', path.join(propsDir, 'lantern_post.png'));
  console.log('wrote', path.join(propsDir, 'campfire_small.png'));
  console.log('wrote', path.join(OUT, 'npc_scale_comparison.png'));
  console.log('extended', path.join(OUT, 'tileset.json'), path.join(OUT, 'license.json'), path.join(OUT, 'README.md'));
}

main();
