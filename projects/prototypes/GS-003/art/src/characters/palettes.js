'use strict';
// GS-003 character creator — recolor palettes, all drawn from the shared
// Lospec "Endesga 32" set already adopted project-wide (ART_STYLE_GUIDE.md
// section 4 / art/src/endesga32.js). Every ramp below is {light, base, dark}
// (3 tones) so a layer can be recolored by swapping one ramp, per
// ART_STYLE_GUIDE.md section 5 ("2-3 tons por cor, blocos sólidos").
const { E32 } = require('../endesga32.js');

const INK = E32.c26; // #181425, shared 1px outline ink (fallback / outer contour).

// Mix two {r,g,b,a} arrays, t in [0,1] (0 = a, 1 = b).
function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
    255,
  ];
}

// Selective outline ("sel-out", DS-style): each layer's own outline uses a
// darkened version of that layer's dark tone instead of flat black, so the
// line color shifts with what it borders (dark-skin line on the face,
// dark-hair line on the hair, dark-cloth line on the jacket) instead of one
// uniform ink everywhere. Kept dark enough (65% toward INK) to stay legible
// at 32px.
function selOutline(ramp) {
  return mix(ramp.dark, INK, 0.65);
}

// -- Body skin tones (3, ART_STYLE_GUIDE palette only) ----------------------
const SKIN_TONES = {
  pale: { light: E32.c3, base: E32.c4, dark: E32.c32 },
  tan: { light: E32.c4, base: E32.c32, dark: E32.c5 },
  deep: { light: E32.c32, base: E32.c5, dark: E32.c6 },
};

// -- Hair colors (8 minimum required) ---------------------------------------
const HAIR_COLORS = {
  preto: { light: E32.c24, base: E32.c25, dark: E32.c26 },
  castanho: { light: E32.c5, base: E32.c6, dark: E32.c7 },
  loiro: { light: E32.c12, base: E32.c11, dark: E32.c10 },
  ruivo: { light: E32.c10, base: E32.c9, dark: E32.c8 },
  azul: { light: E32.c19, base: E32.c18, dark: E32.c17 },
  rosa: { light: E32.c30, base: E32.c29, dark: E32.c28 },
  verde: { light: E32.c13, base: E32.c14, dark: E32.c15 },
  branco: { light: E32.c20, base: E32.c21, dark: E32.c22 },
};

// -- Clothing color ramps, shared pool; each outfit picks a subset below ----
const CLOTH_RAMPS = {
  azul: { light: E32.c18, base: E32.c17, dark: E32.c16 },
  vermelho: { light: E32.c9, base: E32.c8, dark: E32.c7 },
  verde: { light: E32.c13, base: E32.c14, dark: E32.c15 },
  amarelo: { light: E32.c12, base: E32.c11, dark: E32.c10 },
  roxo: { light: E32.c29, base: E32.c28, dark: E32.c7 },
  marrom: { light: E32.c5, base: E32.c6, dark: E32.c7 },
  aco: { light: E32.c22, base: E32.c23, dark: E32.c24 },
};

// Which CLOTH_RAMPS entries each outfit exposes as its "cor" options
// (ART_STYLE_GUIDE.md section 4 "no máximo 5-6 cores por criatura" guidance
// applied here per outfit, not per whole character).
const OUTFIT_COLOR_OPTIONS = {
  casual: ['azul', 'vermelho', 'verde'],
  aventureiro: ['verde', 'marrom'],
  'tamer-classico': ['azul', 'amarelo'],
};

// Fixed accent ramp for the Tamer-classico goggles -- stays constant across
// the outfit's own color swap so the silhouette always reads as "goggles",
// per ART_STYLE_GUIDE.md section 6 (silhouette/color must already
// differentiate, pattern is reinforcement only).
const GOGGLE_RAMP = { light: E32.c19, base: E32.c18, dark: E32.c24 };
const GOGGLE_STRAP = { light: E32.c22, base: E32.c23, dark: E32.c25 };

// Fixed Tamer-identity accents (founder brief via ADR-010/DECISIONS.md:
// goggles + gloves + jacket tech trim + belt Digivice + cyan/digital
// accents, no Ash-style cap). These stay constant across every outfit
// color swap, same reasoning as GOGGLE_RAMP above, so the "Tamer"
// silhouette reads consistently no matter which outfit/color is picked.
const GLOVE_RAMP = { light: E32.c20, base: E32.c23, dark: E32.c24 }; // light grey, contrasts any cloth color
const TECH_RAMP = { light: E32.c19, base: E32.c18, dark: E32.c17 }; // cyan jacket trim/zipper line
const DIGIVICE_RAMP = { light: E32.c19, base: E32.c23, dark: E32.c25 }; // cyan screen + grey casing

function paletteMapFor({ skin, hair, cloth, goggle = false }) {
  const m = { ink: INK };
  if (skin) { m.skinL = skin.light; m.skin = skin.base; m.skinD = skin.dark; }
  if (hair) {
    m.hairL = hair.light; m.hair = hair.base; m.hairD = hair.dark;
    // 4th tone: a crown shine streak, lightened toward white ("destaque de
    // luz" required on top of the 3-tone light/base/dark ramp).
    m.hairHi = mix(hair.light, E32.c20, 0.55);
  }
  if (cloth) {
    m.clothL = cloth.light; m.cloth = cloth.base; m.clothD = cloth.dark;
    // Gloves/tech-trim/Digivice only make sense when clothing is being
    // drawn (they are part of the clothing layer's matrix, see
    // clothing.js) -- always present once an outfit is picked, per the
    // founder's "identidade de Tamer" brief (not optional per outfit).
    m.gloveL = GLOVE_RAMP.light; m.glove = GLOVE_RAMP.base; m.gloveD = GLOVE_RAMP.dark;
    m.techL = TECH_RAMP.light; m.tech = TECH_RAMP.base; m.techD = TECH_RAMP.dark;
    m.deviceL = DIGIVICE_RAMP.light; m.device = DIGIVICE_RAMP.base; m.deviceD = DIGIVICE_RAMP.dark;
  }
  if (goggle) {
    m.goggleL = GOGGLE_RAMP.light; m.goggle = GOGGLE_RAMP.base; m.goggleD = GOGGLE_RAMP.dark;
    m.strapL = GOGGLE_STRAP.light; m.strap = GOGGLE_STRAP.base; m.strapD = GOGGLE_STRAP.dark;
  }
  // Universal tokens usable by any layer's matrix.
  m.eye = E32.c26;
  m.eyeShine = E32.c20;
  m.mouth = E32.c7;
  m.brow = E32.c26;
  return m;
}

module.exports = {
  INK, SKIN_TONES, HAIR_COLORS, CLOTH_RAMPS, OUTFIT_COLOR_OPTIONS,
  GOGGLE_RAMP, GOGGLE_STRAP, GLOVE_RAMP, TECH_RAMP, DIGIVICE_RAMP, paletteMapFor,
  mix, selOutline,
};
