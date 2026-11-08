'use strict';
// ByteLine-18 -- original limited palette for GS-003 Linha B (monstros digitais).
// All hex values authored for this project; not copied from any published palette.
function hx(h) {
  const n = parseInt(h.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
}

const P = {
  ink: hx('#12121c'),
  void: hx('#1d2238'),
  steel: hx('#3a4766'),
  steelLt: hx('#6b7aa1'),
  mist: hx('#aebbd6'),
  paper: hx('#eef2fb'),
  cyan: hx('#3fe0d0'),
  cyanDk: hx('#1c8b86'),
  cyanLt: hx('#a4f7ef'),
  magenta: hx('#e8459d'),
  magentaDk: hx('#8a2763'),
  amber: hx('#ffd27a'),
  amberDk: hx('#d99a33'),
  lilac: hx('#c9bdf2'),
  lilacDk: hx('#8f7fc9'),
  volt: hx('#9df24a'),
  blood: hx('#e8465f'),
  bgGrid: hx('#0c1024'),
};

function withAlpha(c, a) {
  return [c[0], c[1], c[2], a];
}

module.exports = { P, hx, withAlpha };
