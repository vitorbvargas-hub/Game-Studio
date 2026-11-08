'use strict';
// GS-003 character creator v2 — shared arm geometry (upper arm + forearm +
// hand), analogous to legs.js. body.js draws the bare-skin arm, clothing.js
// draws the sleeve/glove overlay over the same rows so they stay aligned
// across every walk frame, same pattern legs.js/clothing.js already use.
const UPPER_ROWS = [18, 19, 20];
const FORE_ROWS = [21, 22, 23];
const HAND_ROW = 24;

// Forearm+hand x-offset per walk frame, opposite-arm-leg sync: legs.js's
// WALK_A (frame 1) plants the left leg forward, so the right arm swings
// forward (+1) and the left arm swings back (-1) here; WALK_B (frame 3,
// right leg forward) swings the opposite way. Frames 0/2 are the stand
// mid-points, arms hang neutral.
function armSwingDx(frame, side) {
  const f = frame % 4;
  if (f === 1) return side === 'right' ? 1 : -1;
  if (f === 3) return side === 'left' ? 1 : -1;
  return 0;
}

module.exports = { UPPER_ROWS, FORE_ROWS, HAND_ROW, armSwingDx };
