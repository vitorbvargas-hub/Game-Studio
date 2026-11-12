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

  // Baby II stage (zona1_campo_de_bits) -- colors chosen close to each
  // creature's Rookie evolution (Koromon->Agumon, Tsunomon->Gabumon,
  // Tokomon->Patamon) so the evolution line reads as the same family.
  kmBody: hx('#f28aa0'),
  kmBodyDk: hx('#c15d78'),
  kmBodyLt: hx('#ffc3d4'),
  kmBelly: hx('#fde7ee'),
  kmAccent: hx('#d9414a'),

  tsBody: hx('#6fa8e0'),
  tsBodyDk: hx('#4a7cb3'),
  tsBodyLt: hx('#b3d9fb'),
  tsBelly: hx('#e8f4ff'),
  tsHorn: hx('#f4efe0'),
  tsHornTip: hx('#c9bb94'),
  tsSpot: hx('#2f5a85'),

  tkBody: hx('#f7ddab'),
  tkBodyDk: hx('#d4a86a'),
  tkBodyLt: hx('#fff0d2'),
  tkBelly: hx('#fff6e5'),
  tkEar: hx('#eec488'),
  tkEarDk: hx('#c6925a'),
  tkEarInner: hx('#fbe0bb'),
};

module.exports = { DP, withAlpha };
