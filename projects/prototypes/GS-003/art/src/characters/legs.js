'use strict';
// GS-003 character creator — shared leg geometry (x-ranges per leg, per row,
// per direction/frame). Pure data, no Canvas calls. Both body.js (bare
// skin shin/foot) and clothing.js (shorts/pants overlay) read the same
// geometry so a pair of pants always lines up with the leg it is covering,
// across every walk frame.
const THIGH_ROWS = [25, 26, 27];
const SHIN_ROWS = [28, 29, 30, 31];
const FOOT_ROWS = [32, 33];

// -- Front / back (S and N share the same leg silhouette: a chibi sprite's
// front and back stepping reads the same way at this scale) ---------------
const STANCE = {
  thigh: { left: [11, 14], right: [17, 20] },
  shin: { left: [11, 13], right: [18, 20] },
  foot: { left: [10, 14], right: [17, 21] },
};

// frame 'a': left leg forward+lifted one row, right leg planted+spread.
const WALK_A = {
  thigh: { left: [10, 14], right: [17, 21] },
  shinRows: SHIN_ROWS.slice(0, 3), // left shin is 1 row shorter (lifted)
  shin: { left: [10, 12], right: [18, 21] },
  footRow: 31, // left foot sits one row higher than normal (mid-step)
  foot: { left: [9, 13], right: [17, 22] },
};
// frame 'b' is WALK_A mirrored left<->right.
function mirrorWalk(w) {
  return {
    thigh: { left: w.thigh.right, right: w.thigh.left },
    shinRows: w.shinRows,
    shin: { left: w.shin.right, right: w.shin.left },
    footRow: w.footRow,
    foot: { left: w.foot.right, right: w.foot.left },
  };
}
const WALK_B = mirrorWalk(WALK_A);

// S/N walk cycle: stand (frame0) -> A (frame1) -> stand (frame2) -> B (frame3)
function frontBackWalkFrame(i) {
  return [STANCE, WALK_A, STANCE, WALK_B][i % 4];
}

// -- Side (E) view: legs overlap front-to-back instead of left-right -------
const SIDE_STANCE = {
  thigh: [13, 19],
  near: { shin: [15, 19], foot: [14, 21] }, // leg toward the walk direction
  far: { shin: [12, 16], foot: [11, 17] },  // trailing leg
  farShinLift: 0,
};
const SIDE_WALK_A = {
  thigh: [12, 19],
  near: { shin: [16, 20], foot: [16, 23] },
  far: { shin: [11, 15], foot: [10, 15] },
  farShinLift: 1, // trailing leg raised one row (mid-step)
};
const SIDE_WALK_B = {
  thigh: [12, 19],
  near: { shin: [12, 16], foot: [10, 16] },
  far: { shin: [15, 19], foot: [17, 22] },
  farShinLift: 1,
};
function sideWalkFrame(i) {
  return [SIDE_STANCE, SIDE_WALK_A, SIDE_STANCE, SIDE_WALK_B][i % 4];
}

module.exports = {
  THIGH_ROWS, SHIN_ROWS, FOOT_ROWS,
  STANCE, frontBackWalkFrame,
  SIDE_STANCE, sideWalkFrame,
};
