'use strict';
// Lospec "Endesga 32" palette (lospec.com/palette-list/endesga-32), adopted as
// the single shared world/creature/UI palette in ART_STYLE_GUIDE.md section 4
// (verified by game-art 2026-11-08). Hex values copied from that document,
// not re-derived from the Lospec page image.
function hx(h) {
  const n = parseInt(h.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
}

const E32 = {
  c1: hx('#be4a2f'), c2: hx('#d77643'), c3: hx('#ead4aa'), c4: hx('#e4a672'),
  c5: hx('#b86f50'), c6: hx('#733e39'), c7: hx('#3e2731'), c8: hx('#a22633'),
  c9: hx('#e43b44'), c10: hx('#f77622'), c11: hx('#feae34'), c12: hx('#fee761'),
  c13: hx('#63c74d'), c14: hx('#3e8948'), c15: hx('#265c42'), c16: hx('#193c3e'),
  c17: hx('#124e89'), c18: hx('#0099db'), c19: hx('#2ce8f5'), c20: hx('#ffffff'),
  c21: hx('#c0cbdc'), c22: hx('#8b9bb4'), c23: hx('#5a6988'), c24: hx('#3a4466'),
  c25: hx('#262b44'), c26: hx('#181425'), c27: hx('#ff0044'), c28: hx('#68386c'),
  c29: hx('#b55088'), c30: hx('#f6757a'), c31: hx('#e8b796'), c32: hx('#c28569'),
};

// Semantic aliases, grouped per ART_STYLE_GUIDE section 4 sub-palettes.
const W = {
  ink: E32.c26,
  grassLt: E32.c13, grassMid: E32.c14, grassDk: E32.c15,
  dirtLt: E32.c4, dirt: E32.c5, dirtDk: E32.c6, dirtDarkest: E32.c7,
  cream: E32.c3,
  waterDeep: E32.c16, waterMid: E32.c17, waterBright: E32.c18, waterFoam: E32.c19,
  white: E32.c20,
  steelLt: E32.c21, steel: E32.c22, steelDk: E32.c23,
  navy: E32.c24, navyDk: E32.c25,
  hpGreen: E32.c13, hpYellow: E32.c11, hpRed: E32.c27,
  purple: E32.c28, pink: E32.c29, pinkLt: E32.c30,
  skin: E32.c31, skinDk: E32.c32,
  gold: E32.c11, yellow: E32.c12, orange: E32.c10, red: E32.c9, redDk: E32.c8,
};

function withAlpha(c, a) { return [c[0], c[1], c[2], a]; }

// Deterministic tiny PRNG (mulberry32) -- every tile/prop in this pack is
// reproducible from its seed, no Math.random(), per the pipeline's existing
// "reproducible" convention (pilot_model_sheet.js).
function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

module.exports = { hx, E32, W, withAlpha, rng };
