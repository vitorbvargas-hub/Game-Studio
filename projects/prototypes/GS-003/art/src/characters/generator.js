'use strict';
// GS-003 — player character creator (paper-doll) generator.
//
// Produces, per ART_DIRECTION requested by the founder (GS-003, 2026-11-08):
//   body/   -- 2 models x 3 skin tones
//   hair/   -- 7 cuts x 8 colors
//   clothing/ -- 3 outfits x 2-3 colors each
// Every frame is a separate transparent PNG, drawn pixel-by-pixel from a
// hand-authored character matrix (grid.js/body.js/hair.js/clothing.js) and
// finished with Canvas.autoOutline() -- never Canvas.fillEllipse/fillCircle/
// fillPolygon, per ADR-009 (the founder rejected the earlier parametric-shape
// pipeline). See DECISIONS.md in this folder for the two authoring
// iterations and the side-by-side check against the DS Hero sprite.
const fs = require('fs');
const path = require('path');
const { render, addGroundShadow, FRAME_W, FRAME_H, PIVOT } = require('./grid.js');
const { buildBodyMatrix, MODELS } = require('./body.js');
const { buildHairMatrix, CUT_IDS } = require('./hair.js');
const { buildClothingMatrix, OUTFIT_IDS } = require('./clothing.js');
const {
  INK, SKIN_TONES, HAIR_COLORS, CLOTH_RAMPS, OUTFIT_COLOR_OPTIONS, GOGGLE_RAMP, GOGGLE_STRAP,
  GLOVE_RAMP, TECH_RAMP, DIGIVICE_RAMP, paletteMapFor, selOutline,
} = require('./palettes.js');

const OUT_DIR = path.resolve(__dirname, '../../../../../../assets/GAME-ASSETS/11-characters/player');
const PREVIEW_DIR = path.resolve(__dirname, '../../../../../../assets/GAME-ASSETS/09-previews');

const DIRS = ['S', 'E', 'N'];
const IDLE_FRAMES = 3;
const WALK_FRAMES = 4;

function ramp3(r) {
  return { light: hex(r.light), base: hex(r.base), dark: hex(r.dark) };
}
function hex(c) {
  return '#' + c.slice(0, 3).map((v) => v.toString(16).padStart(2, '0')).join('');
}

function frameName(prefix, variantId, anim, dir, n) {
  return dir ? `${prefix}_${variantId}_${anim}_${dir}_${String(n).padStart(2, '0')}.png`
    : `${prefix}_${variantId}_${anim}_${String(n).padStart(2, '0')}.png`;
}

// Generic driver: for each direction, builds idle(3)+walk(4)+point(1) frames
// via `buildFn(direction, anim, frame)` -> CharMatrix, renders with
// `paletteMap`, outlines, and (bodies only) adds the ground-contact shadow.
function generateFrames(buildFn, paletteMap, outDir, prefix, variantId, withShadow, outlineColor) {
  fs.mkdirSync(outDir, { recursive: true });
  const ink = outlineColor || INK;
  const manifestFrames = { idle: {}, walk: {}, point: {} };
  for (const dir of DIRS) {
    const idle = [];
    for (let f = 0; f < IDLE_FRAMES; f++) {
      const c = render(buildFn(dir, 'idle', f), paletteMap);
      c.autoOutline(ink);
      if (withShadow) addGroundShadow(c, INK);
      const name = frameName(prefix, variantId, 'idle', dir, f + 1);
      c.save(path.join(outDir, name));
      idle.push({ atlasKey: name, durationMs: 280 });
    }
    manifestFrames.idle[dir] = idle;

    const walk = [];
    for (let f = 0; f < WALK_FRAMES; f++) {
      const c = render(buildFn(dir, 'walk', f), paletteMap);
      c.autoOutline(ink);
      if (withShadow) addGroundShadow(c, INK);
      const name = frameName(prefix, variantId, 'walk', dir, f + 1);
      c.save(path.join(outDir, name));
      walk.push({ atlasKey: name, durationMs: 125 });
    }
    manifestFrames.walk[dir] = walk;
  }
  // Point/command pose: single frame, south-facing only (camera-facing
  // "vitrine" pose, same convention ANIMATION_STANDARD.md uses for
  // showcase-style animations).
  const cp = render(buildFn('S', 'point', 0), paletteMap);
  cp.autoOutline(ink);
  if (withShadow) addGroundShadow(cp, INK);
  const pname = frameName(prefix, variantId, 'point', null, 1);
  cp.save(path.join(outDir, pname));
  manifestFrames.point.S = [{ atlasKey: pname, durationMs: 0 }];

  return manifestFrames;
}

function run() {
  const manifest = {
    characterId: 'PLAYER-TAMER',
    description: 'Criador de Tamer modular (paper doll): corpo, cabelo e roupa, trocados por camada e recoloridos por paleta. Técnica: matriz de caracteres pixel a pixel (grid.js/body.js/hair.js/clothing.js), sem formas paramétricas (ADR-009).',
    frame: { w: FRAME_W, h: FRAME_H, tile: 32 },
    pivot: PIVOT,
    anchors: {
      head: { x: 16, y: 4 },
      shadow: { cx: 16, cy: PIVOT.y, rx: 4, ry: 1 },
    },
    drawOrder: ['body', 'hair', 'clothing'],
    paletteSource: 'Lospec Endesga 32 (lospec.com/palette-list/endesga-32), ART_STYLE_GUIDE.md secao 4',
    directions: { drawn: DIRS, mirrored: { W: 'E' } },
    animations: {
      idle: { frames: IDLE_FRAMES, fps: 3.6, loop: true, directions: DIRS },
      walk: { frames: WALK_FRAMES, fps: 8, loop: true, directions: DIRS },
      point: { frames: 1, loop: false, directions: ['S'], note: 'pose de comando/apontar para o momento de combate' },
    },
    layers: { body: {}, hair: {}, clothing: {} },
  };

  // -- Body ------------------------------------------------------------
  const bodyOutDir = path.join(OUT_DIR, 'body');
  manifest.layers.body = {
    models: Object.keys(MODELS),
    skinTones: Object.fromEntries(Object.entries(SKIN_TONES).map(([k, v]) => [k, ramp3(v)])),
    variants: {},
  };
  for (const model of Object.keys(MODELS)) {
    for (const [skinId, skin] of Object.entries(SKIN_TONES)) {
      const variantId = `${model}_${skinId}`;
      const paletteMap = paletteMapFor({ skin });
      const frames = generateFrames(
        (dir, anim, frame) => buildBodyMatrix({ model, direction: dir, anim, frame }),
        paletteMap, bodyOutDir, 'body', variantId, true, selOutline(skin),
      );
      manifest.layers.body.variants[variantId] = { model, skin: skinId, frames };
    }
  }

  // -- Hair --------------------------------------------------------------
  const hairOutDir = path.join(OUT_DIR, 'hair');
  manifest.layers.hair = {
    cuts: CUT_IDS,
    colors: Object.fromEntries(Object.entries(HAIR_COLORS).map(([k, v]) => [k, ramp3(v)])),
    variants: {},
  };
  for (const cut of CUT_IDS) {
    for (const [colorId, color] of Object.entries(HAIR_COLORS)) {
      const variantId = `${cut}_${colorId}`;
      const paletteMap = paletteMapFor({ hair: color });
      const frames = generateFrames(
        (dir, anim, frame) => buildHairMatrix({ cut, direction: dir, anim, frame }),
        paletteMap, hairOutDir, 'hair', variantId, false, selOutline(color),
      );
      manifest.layers.hair.variants[variantId] = { cut, color: colorId, frames };
    }
  }

  // -- Clothing ------------------------------------------------------------
  const clothOutDir = path.join(OUT_DIR, 'clothing');
  manifest.layers.clothing = {
    outfits: OUTFIT_IDS,
    colorOptions: OUTFIT_COLOR_OPTIONS,
    colorRamps: Object.fromEntries(Object.entries(CLOTH_RAMPS).map(([k, v]) => [k, ramp3(v)])),
    goggleRamp: ramp3(GOGGLE_RAMP),
    goggleStrapRamp: ramp3(GOGGLE_STRAP),
    gloveRamp: ramp3(GLOVE_RAMP),
    techTrimRamp: ramp3(TECH_RAMP),
    digiviceRamp: ramp3(DIGIVICE_RAMP),
    identityNote: 'gloveRamp/techTrimRamp/digiviceRamp sao fixos em todo outfit (identidade de Tamer: luvas, detalhe tecnologico na jaqueta, Digivice no cinto, acentos ciano) -- goggleRamp/goggleStrapRamp ficam exclusivos do outfit tamer-classico.',
    variants: {},
  };
  for (const outfit of OUTFIT_IDS) {
    for (const colorId of OUTFIT_COLOR_OPTIONS[outfit]) {
      const color = CLOTH_RAMPS[colorId];
      const variantId = `${outfit}_${colorId}`;
      const goggle = outfit === 'tamer-classico';
      const paletteMap = paletteMapFor({ cloth: color, goggle });
      // Clothing is drawn per model (pants/shirt width follows the body it
      // covers) -- two file sets per outfit/color, suffixed by model.
      for (const model of Object.keys(MODELS)) {
        const fullVariantId = `${variantId}_${model}`;
        const frames = generateFrames(
          (dir, anim, frame) => buildClothingMatrix({ outfit, model, direction: dir, anim, frame }),
          paletteMap, clothOutDir, 'clothing', fullVariantId, false, selOutline(color),
        );
        manifest.layers.clothing.variants[fullVariantId] = { outfit, color: colorId, model, goggle, frames };
      }
    }
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, 'character_parts.json'), JSON.stringify(manifest, null, 2));
  console.log('character_parts.json written.');
  console.log('body variants:', Object.keys(manifest.layers.body.variants).length);
  console.log('hair variants:', Object.keys(manifest.layers.hair.variants).length);
  console.log('clothing variants:', Object.keys(manifest.layers.clothing.variants).length);
}

module.exports = { run, OUT_DIR, PREVIEW_DIR };
if (require.main === module) run();
