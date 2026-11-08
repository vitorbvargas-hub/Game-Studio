'use strict';
// GS-003 character creator — hair layer (7 cuts x 3 directions, recolored by
// the generator via palettes.js HAIR_COLORS). Hand-authored row-span matrix,
// aligned to body.js's HEAD_WIDTHS/headSpan so every cut hugs the same head
// shape regardless of direction. The 6 cuts the founder named explicitly
// (espetado volumoso, franja longa, marias-chiquinhas, rabo de cavalo,
// curto, longo liso) all exist here, plus moicano as a 7th bonus option.
const { buildMatrix, shiftBand } = require('./grid.js');
const { shadeSpan } = require('./shading.js');
const { HEAD_WIDTHS, HEAD_Y0, headSpan, headBobOffset } = require('./body.js');

const HAIR_TOKENS = ['hairL', 'hair', 'hairD'];

function push(rows, y, x0, x1, tokens = HAIR_TOKENS) {
  if (!rows[y]) rows[y] = [];
  rows[y].push(...shadeSpan(x0, x1, tokens));
}

// A snug cap following the head silhouette from topY to bottomY, `overhang`
// px wider than the skin on each visible row (0 = skin-tight).
function cap(rows, direction, topY, bottomY, overhang) {
  for (let y = topY; y <= bottomY; y++) {
    const idx = y - HEAD_Y0;
    if (idx < 0 || idx >= HEAD_WIDTHS.length) continue;
    const [x0, x1] = headSpan(direction, HEAD_WIDTHS[idx] + overhang, idx);
    push(rows, y, x0, x1);
  }
}

const CUTS = {
  // 1) curto -- snug cap, crown to upper-ear line, face left open.
  curto(direction) {
    const rows = {};
    cap(rows, direction, 3, 9, 1);
    if (direction !== 'S') cap(rows, direction, 10, 11, 1); // more coverage at the back/sides
    return rows;
  },

  // 2) espetado estilo Tai -- short cap plus upward spikes above the head.
  'espetado-tai'(direction) {
    const rows = {};
    cap(rows, direction, 4, 9, 1);
    const cx = direction === 'E' ? 15 : 16;
    const spikes = direction === 'E'
      ? [[cx - 6, cx - 3], [cx - 2, cx + 1], [cx + 2, cx + 5]]
      : [[cx - 7, cx - 4], [cx - 2, cx + 1], [cx + 3, cx + 6]];
    const heights = [1, 2, 1];
    spikes.forEach(([x0, x1], i) => {
      const h = heights[i];
      for (let k = 0; k < h; k++) push(rows, 3 - k, x0 + k, x1 - k);
    });
    return rows;
  },

  // 3) longo liso -- cap plus straight strands framing the face down to the
  // shoulders (and full back coverage in N).
  'longo-liso'(direction) {
    const rows = {};
    cap(rows, direction, 3, 9, 1);
    if (direction === 'S') {
      for (let y = 10; y <= 21; y++) {
        const idx = Math.min(HEAD_WIDTHS.length - 1, y - HEAD_Y0);
        const w = HEAD_WIDTHS[idx] + 1;
        push(rows, y, 16 - w, 15 - w + 2);
        push(rows, y, 16 + w - 2, 15 + w);
      }
    } else if (direction === 'N') {
      for (let y = 10; y <= 22; y++) {
        const idx = Math.min(HEAD_WIDTHS.length - 1, y - HEAD_Y0);
        const w = HEAD_WIDTHS[idx] + 1;
        push(rows, y, 16 - w, 15 + w);
      }
    } else {
      for (let y = 10; y <= 20; y++) push(rows, y, 10, 13);
    }
    return rows;
  },

  // 4) rabo de cavalo -- cap plus a single tail trailing from the back.
  'rabo-de-cavalo'(direction) {
    const rows = {};
    cap(rows, direction, 3, 9, 1);
    if (direction === 'N') {
      for (let y = 10; y <= 25; y++) {
        const t = (y - 10) / 15;
        const w = Math.round(3 - t * 1.5);
        push(rows, y, 16 - w, 15 + w);
      }
    } else if (direction === 'E') {
      // Trails opposite the facing direction (west/back of the silhouette).
      for (let y = 9; y <= 23; y++) {
        const t = (y - 9) / 14;
        const w = Math.round(3 - t * 1.5);
        push(rows, y, 7 - Math.round(t * 2), 7 - Math.round(t * 2) + w);
      }
    } else {
      // S: mostly hidden behind the head, small tuft peeking at the crown.
      push(rows, 9, 20, 21);
      push(rows, 10, 20, 22);
    }
    return rows;
  },

  // 5) coque/marias-chiquinhas -- cap plus two side buns at ear height.
  'marias-chiquinhas'(direction) {
    const rows = {};
    cap(rows, direction, 3, 9, 1);
    const bunRows = [8, 9, 10];
    if (direction === 'E') {
      bunRows.forEach((y) => push(rows, y, 6, 9));
    } else {
      bunRows.forEach((y) => {
        const idx = y - HEAD_Y0;
        const w = HEAD_WIDTHS[idx];
        push(rows, y, 16 - w - 4, 16 - w - 1);
        push(rows, y, 16 + w + 1, 16 + w + 4);
      });
    }
    return rows;
  },

  // 7) franja longa -- cap plus a long, straight fringe swept over one
  // side of the forehead, reaching past the eye line (distinct from
  // longo-liso's symmetric face-framing strands: this is one-sided and
  // confined to the brow, not the full head length).
  'franja-longa'(direction) {
    const rows = {};
    cap(rows, direction, 3, 9, 1);
    if (direction === 'E') {
      for (let y = 7; y <= 11; y++) push(rows, y, 17, 20);
    } else {
      for (let y = 7; y <= 11; y++) {
        const idx = y - HEAD_Y0;
        const w = HEAD_WIDTHS[idx];
        const t = (y - 7) / 4;
        push(rows, y, 16 - w - 1, Math.round(16 - w + 2 + t * 3));
      }
    }
    return rows;
  },

  // 6) moicano -- bald sides, a tall narrow ridge along the center/top.
  moicano(direction) {
    const rows = {};
    if (direction === 'E') {
      for (let y = 2; y <= 9; y++) push(rows, y, 17, 19);
    } else {
      for (let y = 1; y <= 9; y++) {
        const h = y <= 4 ? [14, 17] : [15, 16];
        push(rows, y, h[0], h[1]);
      }
    }
    return rows;
  },
};

const CUT_IDS = Object.keys(CUTS);

// pose: { cut, direction: 'S'|'E'|'N', anim, frame }
function buildHairMatrix(pose) {
  const { cut, direction = 'S', anim = 'idle', frame = 0 } = pose;
  const builder = CUTS[cut];
  if (!builder) throw new Error(`unknown hair cut: ${cut}`);
  const rows = builder(direction);
  const matrix = buildMatrix(rows);
  const bob = headBobOffset(anim, frame);
  if (bob !== 0) shiftBand(matrix, 0, 26, bob);
  return matrix;
}

module.exports = { buildHairMatrix, CUT_IDS };
