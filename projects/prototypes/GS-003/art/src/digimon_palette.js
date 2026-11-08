'use strict';
// Colors for the Digimon-fan content pack (ADR-007). These are original hex
// values authored for this pack to approximate each Digimon's canonical
// color scheme from general public knowledge/memory -- no image reference,
// sprite, or file of the official character was fetched, viewed, or traced
// to produce them.
const { hx, withAlpha } = require('./palette.js');

const DP = {
  ink: hx('#12121c'),
  paper: hx('#f7f3e8'),

  agBody: hx('#f4863c'),
  agBodyDk: hx('#c15f22'),
  agBodyLt: hx('#ffaa66'),
  agBelly: hx('#fdeecb'),
  agRidge: hx('#a7352a'),
  agRidgeDk: hx('#7a2420'),
  agClaw: hx('#fdf6e8'),

  gbSkin: hx('#4f7fb0'),
  gbSkinDk: hx('#355d85'),
  gbFur: hx('#e8d6a8'),
  gbFurDk: hx('#c2a96e'),
  gbHorn: hx('#f4efe0'),
  gbHornTip: hx('#8a7a5c'),
  gbBelly: hx('#f2d94e'),
  gbStripe: hx('#8a5a2b'),

  ptBody: hx('#f4c988'),
  ptBodyDk: hx('#cf9c56'),
  ptEar: hx('#e8b36b'),
  ptEarDk: hx('#b67b3c'),
  ptEarInner: hx('#f8d9b0'),
};

module.exports = { DP, withAlpha };
