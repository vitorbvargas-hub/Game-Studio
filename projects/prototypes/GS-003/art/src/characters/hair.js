'use strict';
// GS-003 character creator v2 — hair layer (7 cuts x 3 directions, recolored
// by the generator via palettes.js HAIR_COLORS). Hand-authored row-span
// matrix, aligned to body.js's HEAD_WIDTHS/headSpan so every cut hugs the
// same head shape regardless of direction. The 6 cuts the founder named
// explicitly (espetado volumoso, franja longa, marias-chiquinhas, rabo de
// cavalo, curto, longo liso) all exist here, plus moicano as a 7th bonus
// option.
//
// v2 rewrite (coordinator rejected v1 at 4/10: the 7 cuts read as near-
// identical helmets). Every cut below now has its own large-scale silhouette
// shape, not just a recolored cap, and `character_silhouette_test.png`
// checks that claim directly. `cap()` also now bakes in two things every
// cut needs per the founder brief: a crown highlight streak (4th "hairHi"
// tone, "destaque de luz") and a solid dark hairline row that reads as the
// hair casting a shadow on the forehead, instead of the plain 3-tone
// gradient a flat cap used to produce.
const { buildMatrix, shiftBand } = require('./grid.js');
const { shadeSpan } = require('./shading.js');
const { HEAD_WIDTHS, HEAD_Y0, headSpan, headBobOffset } = require('./body.js');

const HAIR_TOKENS = ['hairL', 'hair', 'hairD'];

function push(rows, y, x0, x1, tokens = HAIR_TOKENS) {
  if (!rows[y]) rows[y] = [];
  rows[y].push(...shadeSpan(x0, x1, tokens));
}

// A snug cap following the head silhouette from topY to bottomY, `overhang`
// px wider than the skin on each visible row (0 = skin-tight). Every cut
// starts from this shared skull coverage, then adds its own distinguishing
// shape (spikes/tails/buns/fringe/ridge) around it.
function cap(rows, direction, topY, bottomY, overhang) {
  for (let y = topY; y <= bottomY; y++) {
    const idx = y - HEAD_Y0;
    if (idx < 0 || idx >= HEAD_WIDTHS.length) continue;
    const [x0, x1] = headSpan(direction, HEAD_WIDTHS[idx] + overhang, idx);
    push(rows, y, x0, x1);
  }
  // Crown highlight (4th tone): light source is top-left per shading.js, so
  // a 2px bright streak just right of the cap's top-left edge reads as a
  // light catch on the crown.
  const topIdx = Math.max(0, topY - HEAD_Y0);
  if (topIdx < HEAD_WIDTHS.length) {
    const [hx0] = headSpan(direction, HEAD_WIDTHS[topIdx] + overhang, topIdx);
    push(rows, topY, hx0 + 1, hx0 + 2, ['hairHi', 'hairHi', 'hairHi']);
  }
  // Forehead shadow: the lowest cap row goes solid dark instead of the
  // usual light/base/dark gradient, reading as the fringe casting a shadow
  // at the hairline rather than a flat painted band.
  const botIdx = bottomY - HEAD_Y0;
  if (botIdx >= 0 && botIdx < HEAD_WIDTHS.length) {
    const [bx0, bx1] = headSpan(direction, HEAD_WIDTHS[botIdx] + overhang, botIdx);
    push(rows, bottomY, bx0, bx1, ['hairD', 'hairD', 'hairD']);
  }
}

const CUTS = {
  // 1) curto -- the shortest, tightest cut: skin-hugging cap ending above
  // the ears, nothing extra. Baseline silhouette every other cut reads
  // against.
  curto(direction) {
    const rows = {};
    cap(rows, direction, 3, 8, 0);
    return rows;
  },

  // 2) espetado-tai -- tall upward spikes, by far the tallest silhouette of
  // the set (reaches y0 vs the cap's own y3-8), unmistakable even as a
  // black silhouette.
  'espetado-tai'(direction) {
    const rows = {};
    cap(rows, direction, 4, 8, 1);
    const cx = direction === 'E' ? 15 : 16;
    const spikes = direction === 'E'
      ? [[cx - 7, cx - 4], [cx - 3, cx], [cx + 1, cx + 4]]
      : [[cx - 8, cx - 5], [cx - 2, cx + 1], [cx + 4, cx + 7]];
    const heights = [4, 5, 3];
    spikes.forEach(([x0, x1], i) => {
      const h = heights[i];
      for (let k = 0; k < h; k++) push(rows, 3 - k, x0 + k, x1 - k);
    });
    return rows;
  },

  // 3) longo-liso -- symmetric long straight panels framing the face down
  // past the shoulders (to y27, well below the cap). Reads as a wide
  // silhouette block under the head, the same on both sides.
  'longo-liso'(direction) {
    const rows = {};
    // bottomY capped at 8 (not 9) so every cut shares the same hairline row
    // -- keeps the auto-outline fringe row (see body.js buildHead comment)
    // in the same place for every cut, clear of the face.
    cap(rows, direction, 3, 8, 1);
    if (direction === 'S') {
      for (let y = 10; y <= 27; y++) {
        const idx = Math.min(HEAD_WIDTHS.length - 1, y - HEAD_Y0);
        const w = HEAD_WIDTHS[idx] + 1;
        const taper = y > 20 ? 1 : 0;
        push(rows, y, 16 - w, 15 - w + 2 - taper);
        push(rows, y, 16 + w - 2 + taper, 15 + w);
      }
    } else if (direction === 'N') {
      for (let y = 10; y <= 27; y++) {
        const idx = Math.min(HEAD_WIDTHS.length - 1, y - HEAD_Y0);
        const w = HEAD_WIDTHS[idx] + 1;
        push(rows, y, 16 - w, 15 + w);
      }
    } else {
      for (let y = 10; y <= 26; y++) push(rows, y, 10, 13);
    }
    return rows;
  },

  // 4) rabo-de-cavalo -- front pulled back tight (shorter than even
  // `curto`), single tail swinging out to one side from the crown. The
  // lone side-tail is the defining silhouette trait: nothing else in the
  // set has an asymmetric shape jutting out from the head like this.
  'rabo-de-cavalo'(direction) {
    const rows = {};
    cap(rows, direction, 3, 7, -1);
    if (direction === 'N') {
      for (let y = 7; y <= 23; y++) {
        const t = (y - 7) / 16;
        const w = Math.round(3 - t * 1.5);
        push(rows, y, 16 - w, 15 + w);
      }
    } else if (direction === 'E') {
      for (let y = 6; y <= 22; y++) {
        const t = (y - 6) / 16;
        const cx = 8 - Math.round(t * 3);
        const w = Math.round(3 - t * 1.5);
        push(rows, y, cx, cx + w);
      }
    } else {
      // S: tail swings out to screen-right, clearly outside the head
      // silhouette instead of hidden behind it.
      for (let y = 6; y <= 22; y++) {
        const t = (y - 6) / 16;
        const cx = 23 + Math.round(t * 3);
        const w = Math.round(3 - t * 1.5);
        push(rows, y, cx - w, cx);
      }
    }
    return rows;
  },

  // 5) marias-chiquinhas -- two round twin-tail bunches hanging past the
  // shoulders, wide and symmetric but made of two separate round blobs
  // (vs longo-liso's two flat straight panels) -- the clearest silhouette
  // contrast in the set is this cut vs. longo-liso.
  'marias-chiquinhas'(direction) {
    const rows = {};
    cap(rows, direction, 3, 8, 0);
    if (direction === 'E') {
      for (let y = 7; y <= 20; y++) {
        const t = Math.min(1, Math.abs(y - 11) / 6);
        const w = Math.round(4 - t * 2);
        push(rows, y, 4, 4 + w);
      }
    } else {
      for (let y = 7; y <= 20; y++) {
        const t = Math.min(1, Math.abs(y - 11) / 6);
        const w = Math.round(4 - t * 2);
        push(rows, y, 4, 4 + w);
        push(rows, y, 27 - w, 27);
      }
    }
    return rows;
  },

  // 7) franja-longa -- asymmetric: one side stays short at the cap, the
  // other grows into a single long lock past the shoulder, plus a fringe
  // sweeping over one eye. The left/right imbalance is unique to this cut.
  'franja-longa'(direction) {
    const rows = {};
    cap(rows, direction, 3, 8, 0);
    if (direction === 'E') {
      for (let y = 7; y <= 12; y++) push(rows, y, 17, 21);
    } else {
      // Long lock on the screen-right side only, down past the shoulder.
      for (let y = 9; y <= 24; y++) {
        const idx = Math.min(HEAD_WIDTHS.length - 1, y - HEAD_Y0);
        const w = HEAD_WIDTHS[idx] + 1;
        const taper = y > 18 ? 1 : 0;
        push(rows, y, 16 + w - 2, 17 + w - taper);
      }
      // Fringe sweeping across the forehead toward the left eye.
      for (let y = 8; y <= 10; y++) {
        const t = (y - 8) / 2;
        push(rows, y, 10, Math.round(13 + t * 2));
      }
    }
    return rows;
  },

  // 6) moicano -- bald sides (no cap() call at all -- the only cut that
  // leaves skin visible down the sides of the head), tall narrow ridge
  // along the center that tapers toward the back, reaching as high as the
  // tallest spikes. Most distinct silhouette of the set by construction.
  moicano(direction) {
    const rows = {};
    if (direction === 'E') {
      for (let y = 0; y <= 9; y++) {
        const w = y <= 3 ? 1 : 2;
        push(rows, y, 17 - (y <= 3 ? 1 : 0), 17 + w);
      }
    } else {
      for (let y = 0; y <= 9; y++) {
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
  if (bob !== 0) shiftBand(matrix, 0, 27, bob);
  return matrix;
}

module.exports = { buildHairMatrix, CUT_IDS };
