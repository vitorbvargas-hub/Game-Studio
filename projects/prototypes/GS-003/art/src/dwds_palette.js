'use strict';
// Palette sampled directly from real Digimon World DS farm/biome rip sheets
// (10-source-files/spriters-resource/dgmnworldds__*Digi-Farm*, Beast/Default),
// via art/src/dwds_extract.js pixel sampling. More saturated/bright than the
// shared Endesga-32 "vegetacao" subset (W.grassLt/Mid/Dk) -- used only for the
// *-dwds biome packs so the existing grass/forest/water packs keep their look.
function c(r, g, b, a = 255) { return [r, g, b, a]; }

const DW = {
  grassDk: c(40, 208, 80),
  grassMid: c(88, 208, 48),
  grassLt: c(128, 224, 120),
  grassBright: c(160, 248, 48),
  sand: c(248, 216, 144),
  sandDk: c(176, 152, 96),
  cliffTan: c(240, 200, 152),
  water: c(24, 104, 232),
  waterLt: c(80, 160, 248),
  foam: c(240, 232, 176),
  trunk: c(152, 120, 96),
  trunkDk: c(104, 80, 64),
  ink: c(24, 24, 24),
};

module.exports = { DW };
