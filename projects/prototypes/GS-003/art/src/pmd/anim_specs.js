'use strict';
// Per-animation frame size/duration/event-frame table. Sizes are smaller
// than the founder's reference (e.g. its Attack is 64x64 over 11 frames) --
// our creatures are smaller/simpler, so 48x48 over 3 frames is enough to
// read the pose; durations for Idle/Walk/Hurt/Sleep are copied verbatim from
// the reference XML (art/reference/pmd-format-founder/AnimData.xml) since
// those tick counts are a generic "feel" convention, not specific art.
const ANIM_SPECS = [
  { name: 'Idle', frameWidth: 32, frameHeight: 40, durations: [12, 8, 8, 8] },
  { name: 'Walk', frameWidth: 32, frameHeight: 32, durations: [6, 8, 6, 8] },
  {
    name: 'Attack', frameWidth: 48, frameHeight: 48, durations: [4, 6, 4],
    rushFrame: 0, hitFrame: 1, returnFrame: 2,
  },
  { name: 'Hurt', frameWidth: 32, frameHeight: 32, durations: [2, 8] },
  { name: 'Sleep', frameWidth: 32, frameHeight: 24, durations: [30, 35] },
];

module.exports = { ANIM_SPECS };
