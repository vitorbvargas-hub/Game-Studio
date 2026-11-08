'use strict';
// GS-003 forest-v4 -- extended environment palette (day + night), hand-picked
// hex ramps (not sampled from any third-party asset), built to fix the
// "flat/chapada" diagnosis in forest-v4 README section 1: Endesga-32 only
// carries 3 green steps (grassLt/Mid/Dk) shared by every biome, which is why
// forest-v3 canopies read as near-flat blobs regardless of how they're
// shaded. These ramps add the value range a layered canopy needs while
// staying in the same low-saturation pixel-art family as Endesga-32.
const { hx, W, withAlpha } = require('./endesga32.js');

// 7-stop foliage ramp, dark->light, upper-left sun bias.
const FOLIAGE_DAY = [
  hx('#0c2615'), // 0 core shadow (AO pockets between clumps)
  hx('#143a1e'), // 1 shadow
  hx('#1f4f28'), // 2 dark
  hx('#2f6e33'), // 3 mid-dark
  hx('#4c9240'), // 4 mid
  hx('#78b84a'), // 5 mid-light
  hx('#aad85c'), // 6 light
  hx('#dff08a'), // 7 rim highlight (sun hit)
];
const FOLIAGE_NIGHT = [
  hx('#0a0e20'),
  hx('#121a33'),
  hx('#1c2a46'),
  hx('#28395c'),
  hx('#3a4f78'),
  hx('#54689a'),
  hx('#7488b8'),
  hx('#a6c0e8'), // moonlight rim, cool not flattened
];

// Blossom accent (flowering tree), day vs. night tint.
const BLOSSOM_DAY = [hx('#f6c6d8'), hx('#f092b6'), hx('#d65f96')];
const BLOSSOM_NIGHT = [hx('#c9b0e0'), hx('#9a7ad0'), hx('#6a4aa8')];

// Bark ramp (shared day/night, slightly dimmed at night via tintNight()).
const BARK_DAY = {
  hi: hx('#c99a5f'), lt: hx('#a87444'), mid: hx('#7a5230'), dk: hx('#4d3420'), core: hx('#2b1c12'),
};
const BARK_NIGHT = {
  hi: hx('#8f91b8'), lt: hx('#6c6d96'), mid: hx('#4a4a70'), dk: hx('#2f2f4c'), core: hx('#1a1a2e'),
};
const BIRCH_BARK_DAY = {
  hi: hx('#f3efe0'), lt: hx('#d9d2ba'), mid: hx('#b3ab8e'), dk: hx('#7c7458'), core: hx('#4a4432'),
};
const BIRCH_BARK_NIGHT = {
  hi: hx('#b6bcd8'), lt: hx('#9298b8'), mid: hx('#6c7294'), dk: hx('#484c68'), core: hx('#2a2c40'),
};

// Ground ramps.
const GROUND_DAY = {
  grass: [hx('#1f4f28'), hx('#2f6e33'), hx('#4c9240'), hx('#78b84a'), hx('#aad85c')],
  dirt: [hx('#4d3420'), hx('#6b4b2a'), hx('#8a6538'), hx('#ab8550')],
  leafLitter: [hx('#8a5a2a'), hx('#b07a32'), hx('#d6a23e')],
  moss: hx('#5a7a3a'),
  stone: [hx('#555a66'), hx('#7a818f'), hx('#aab0ba')],
  water: W.waterMid,
};
const GROUND_NIGHT = {
  grass: [hx('#121a33'), hx('#1c2a46'), hx('#28395c'), hx('#3a4f78'), hx('#54689a')],
  dirt: [hx('#241a30'), hx('#342444'), hx('#45305a'), hx('#5c4278')],
  leafLitter: [hx('#3a2850'), hx('#4e3468'), hx('#634888')],
  moss: hx('#2e3f5c'),
  stone: [hx('#232838'), hx('#333a52'), hx('#4a5272')],
  water: hx('#162d52'),
};

const FLOWER_DAY = { red: hx('#e8475a'), white: hx('#f6f3e4'), purple: hx('#9a5ac0'), yellow: hx('#f6d84a') };
const FLOWER_NIGHT = { red: hx('#9a3a52'), white: hx('#bcb6e8'), purple: hx('#6a3ea0'), yellow: hx('#9a8a3a') };

function withPreset(day) {
  return {
    foliage: day ? FOLIAGE_DAY : FOLIAGE_NIGHT,
    blossom: day ? BLOSSOM_DAY : BLOSSOM_NIGHT,
    bark: day ? BARK_DAY : BARK_NIGHT,
    birchBark: day ? BIRCH_BARK_DAY : BIRCH_BARK_NIGHT,
    ground: day ? GROUND_DAY : GROUND_NIGHT,
    flower: day ? FLOWER_DAY : FLOWER_NIGHT,
    ink: day ? hx('#14130f') : hx('#0a0a16'),
    ambient: day ? withAlpha(hx('#fff3c2'), 26) : withAlpha(hx('#2a1f5c'), 70),
    canopyShadow: day ? withAlpha(hx('#0c2615'), 92) : withAlpha(hx('#060a1c'), 130),
  };
}

module.exports = { FOLIAGE_DAY, FOLIAGE_NIGHT, BARK_DAY, BARK_NIGHT, GROUND_DAY, GROUND_NIGHT, FLOWER_DAY, FLOWER_NIGHT, withPreset };
