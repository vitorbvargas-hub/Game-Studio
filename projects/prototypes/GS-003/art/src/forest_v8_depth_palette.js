'use strict';
// GS-003 forest-v8-depth -- revised ground/foliage palette.
//
// Drakantos study (docs/DRAKANTOS_VISUAL_STUDY.md) item #6: "Paleta: base
// escura e fria... com acentos saturados e quentes so onde importa. Hoje:
// verde medio e saturado em tudo, entao nada se destaca." Action: "rebaixar
// a saturacao e o valor do chao e das copas e reservar o saturado para
// interativos, luzes e criaturas."
//
// Implemented as a documented HSV shift of the existing forest-v4 day
// ramps (forest_v4_palette.js) -- not new hand-picked hex -- so the exact
// math is reproducible and a renderer could apply the same multipliers to
// any already-painted forest-v4/v6/v7 ground/foliage sprite without
// re-baking art (see renderPreset in buildPaletteDoc()). Emissive/
// interactive accents are defined separately and are NEVER multiplied --
// that contrast is the whole point of the study item.
const { W, hx } = require('./endesga32.js');
const { withPreset } = require('./forest_v4_palette.js');

function clamp01(x) { return Math.max(0, Math.min(1, x)); }

function rgbToHsv(r, g, b) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  const v = max;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
    if (h < 0) h += 1;
  }
  return [h, s, v];
}

function hsvToRgb(h, s, v) {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: return [v, t, p];
    case 1: return [q, v, p];
    case 2: return [p, v, t];
    case 3: return [p, q, v];
    case 4: return [t, p, v];
    default: return [v, p, q];
  }
}

// opts: sMul/vMul multiply saturation/value; sAdd/vAdd add after the
// multiply; hueDeg rotates hue (degrees, wraps).
function shiftColor(c, opts = {}) {
  const { sMul = 1, vMul = 1, sAdd = 0, vAdd = 0, hueDeg = 0 } = opts;
  let [h, s, v] = rgbToHsv(c[0] / 255, c[1] / 255, c[2] / 255);
  h += hueDeg / 360; h -= Math.floor(h);
  s = clamp01(s * sMul + sAdd);
  v = clamp01(v * vMul + vAdd);
  const [r, g, b] = hsvToRgb(h, s, v);
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), c[3] === undefined ? 255 : c[3]];
}
function shiftRamp(arr, opts) { return arr.map((c) => shiftColor(c, opts)); }
function hexOf(c) { return '#' + [c[0], c[1], c[2]].map((v) => v.toString(16).padStart(2, '0')).join(''); }
function hexRamp(arr) { return arr.map(hexOf); }

// Multipliers applied to every GROUND/FOLIAGE ramp only -- never to props,
// characters or UI. Documented here so they can be reproduced exactly.
const GF_SAT_MUL = 0.64;
const GF_VAL_MUL = 0.80;
// Foliage rim-highlight (the sunlit edge, index 7 of the 8-stop ramp) keeps
// more of its original punch so lit canopy edges still read as lit.
const RIM_SAT_MUL = 0.88;
const RIM_VAL_MUL = 0.92;

function buildDepthRamps() {
  const base = withPreset(true); // forest-v4 day ramp
  const foliage = shiftRamp(base.foliage, { sMul: GF_SAT_MUL, vMul: GF_VAL_MUL });
  foliage[7] = shiftColor(base.foliage[7], { sMul: RIM_SAT_MUL, vMul: RIM_VAL_MUL });
  const grass = shiftRamp(base.ground.grass, { sMul: GF_SAT_MUL, vMul: GF_VAL_MUL });
  const dirt = shiftRamp(base.ground.dirt, { sMul: GF_SAT_MUL + 0.08, vMul: GF_VAL_MUL + 0.02 });
  const leafLitter = shiftRamp(base.ground.leafLitter, { sMul: GF_SAT_MUL + 0.1, vMul: GF_VAL_MUL - 0.05 });
  // Moss reads cooler/shadowed on a dim forest floor than the Day moss --
  // a small hue push toward teal on top of the usual darken/desaturate.
  const moss = shiftColor(base.ground.moss, { sMul: GF_SAT_MUL + 0.05, vMul: GF_VAL_MUL - 0.08, hueDeg: 8 });
  const stone = shiftRamp(base.ground.stone, { sMul: 0.92, vMul: GF_VAL_MUL + 0.02 }); // already near-neutral; mostly a value drop
  const bark = {
    hi: shiftColor(base.bark.hi, { sMul: GF_SAT_MUL + 0.1, vMul: GF_VAL_MUL + 0.05 }),
    lt: shiftColor(base.bark.lt, { sMul: GF_SAT_MUL + 0.1, vMul: GF_VAL_MUL }),
    mid: shiftColor(base.bark.mid, { sMul: GF_SAT_MUL + 0.1, vMul: GF_VAL_MUL - 0.03 }),
    dk: shiftColor(base.bark.dk, { sMul: GF_SAT_MUL + 0.05, vMul: GF_VAL_MUL - 0.05 }),
    core: shiftColor(base.bark.core, { sMul: GF_SAT_MUL, vMul: GF_VAL_MUL - 0.1 }),
  };
  // Cliff ramp -- new family, not present in forest-v4. Built from
  // ground.stone so it stays in the same mineral hue, but pushed darker
  // and slightly cooler so the barranco mass reads as distinct from the
  // small stone pebbles already used as ground decor (those stay lighter).
  const cliffTop = [
    shiftColor(base.ground.stone[0], { sMul: 0.85, vMul: 0.62, hueDeg: 6 }),
    shiftColor(base.ground.stone[1], { sMul: 0.85, vMul: 0.72, hueDeg: 6 }),
    shiftColor(base.ground.stone[2], { sMul: 0.85, vMul: 0.84, hueDeg: 6 }),
    shiftColor(base.ground.stone[2], { sMul: 0.55, vMul: 0.98, hueDeg: 4 }),
  ];
  const cliffFace = {
    hi: shiftColor(base.ground.stone[2], { sMul: 0.8, vMul: 0.62, hueDeg: 8 }),
    lt: shiftColor(base.ground.stone[1], { sMul: 0.85, vMul: 0.48, hueDeg: 8 }),
    mid: shiftColor(base.ground.stone[0], { sMul: 0.9, vMul: 0.34, hueDeg: 8 }),
    dk: shiftColor(base.ground.stone[0], { sMul: 0.95, vMul: 0.22, hueDeg: 10 }),
    core: [10, 10, 16, 255], // near-black contact shadow -- hand-picked, not derivable by multiplying a mid-value source
  };
  const mossEdge = shiftColor(base.ground.moss, { sMul: GF_SAT_MUL + 0.12, vMul: GF_VAL_MUL + 0.02, hueDeg: 10 });

  return { foliage, grass, dirt, leafLitter, moss, stone, bark, cliffTop, cliffFace, mossEdge };
}

// Reserved saturated accents -- used ONLY on emissive props, their point
// light color, and small focal sparkle pixels (puddle reflection, moss
// edge fleck). Never applied to base ground/foliage fills.
const ACCENT = {
  digitalCyan: hx('#2ce8f5'), // = endesga32 c19, already the studio's digital accent (forest-v4.1 leaf, forest-v6 healing_point)
  digitalMagenta: hx('#ff5fc1'), // new: bioluminescent-mushroom family, same low-key magenta/purple hue as BLOSSOM/flower.purple but pushed fully saturated
  dataAmber: hx('#feae34'), // = endesga32 c11, warm beacon tone for the data totem
  puddleSparkle: hx('#2ce8f5'), // sky/digital reflection fleck inside puddles and wet shore stones, 2-3px max per instance
};

function buildPaletteDoc() {
  const d = buildDepthRamps();
  return {
    biome: 'forest-v8-depth',
    note: 'Revised ground+foliage palette only (DRAKANTOS_VISUAL_STUDY.md item #6) -- darker and less saturated than the forest-v4 day ramps, with saturation reserved for emissive props and small focal highlights. Derived as a documented HSV shift of forest_v4_palette.js (see renderPreset below for the exact multipliers), not new hand-picked hex, so any already-painted forest-v4/v6/v7 ground/foliage sprite or tile can be approximated with the same math without re-baking art. This file does NOT touch ambient lighting/day-night (study items #3/#7) -- that is game-dev renderer work, out of this package.',
    ramps: {
      foliageDepth: hexRamp(d.foliage),
      groundDepth: {
        grass: hexRamp(d.grass),
        dirt: hexRamp(d.dirt),
        leafLitter: hexRamp(d.leafLitter),
        moss: hexOf(d.moss),
        stone: hexRamp(d.stone),
      },
      barkDepth: { hi: hexOf(d.bark.hi), lt: hexOf(d.bark.lt), mid: hexOf(d.bark.mid), dk: hexOf(d.bark.dk), core: hexOf(d.bark.core) },
      cliff: {
        top: hexRamp(d.cliffTop),
        face: { hi: hexOf(d.cliffFace.hi), lt: hexOf(d.cliffFace.lt), mid: hexOf(d.cliffFace.mid), dk: hexOf(d.cliffFace.dk), core: hexOf(d.cliffFace.core) },
        mossEdge: hexOf(d.mossEdge),
      },
    },
    accentSaturated: {
      digitalCyan: hexOf(ACCENT.digitalCyan),
      digitalMagenta: hexOf(ACCENT.digitalMagenta),
      dataAmber: hexOf(ACCENT.dataAmber),
      puddleSparkle: hexOf(ACCENT.puddleSparkle),
      note: 'Reserved for emissive props (data_crystal / mushroom_bioluminescent / data_totem), their point-light color (see tileset.json "light" field on each), and tiny focal sparkle pixels (puddle reflection, wet shore-stone sheen). Never applied to base ground/foliage fills -- that contrast is the point of DRAKANTOS_VISUAL_STUDY.md item #6.',
    },
    renderPreset: {
      description: 'How a renderer can reproduce this exact shift procedurally on an existing forest-v4/v6/v7 ground or foliage sprite/tile, instead of re-baking every asset: convert each opaque pixel to HSV, multiply saturation and value by the ground/foliage multipliers below (ground/decor/foliage layers ONLY -- never characters, UI, or this pack\'s own emissive props), convert back to RGB. For a flat (non-ramped) sprite, treat its lightest ~12% of pixels by value as the "rim highlight" and use the gentler rimHighlight multipliers on those instead, so sunlit edges keep reading as lit.',
      groundFoliageSaturationMul: GF_SAT_MUL,
      groundFoliageValueMul: GF_VAL_MUL,
      rimHighlightSaturationMul: RIM_SAT_MUL,
      rimHighlightValueMul: RIM_VAL_MUL,
      accentSaturationMul: 1.0,
      scopeNote: 'Apply only to ground/decor/foliage layers. Never multiply characters, UI, or this pack\'s emissive props/lights -- their saturation being untouched is the contrast the study asked for.',
    },
  };
}

module.exports = { shiftColor, shiftRamp, hexOf, hexRamp, buildDepthRamps, buildPaletteDoc, ACCENT };
