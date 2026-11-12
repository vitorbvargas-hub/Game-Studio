'use strict';
// Shared primitives for Baby II round-blob Digimon (Koromon/Tsunomon/
// Tokomon) -- a small spherical silhouette with oversized eyes and no true
// legs. Reused by koromon.js/tsunomon.js/tokomon.js the same way the Rookie
// generators (agumon.js/gabumon.js/patamon.js) reuse Canvas.translate()/
// tint() instead of redrawing a creature per pose.
const { DP, withAlpha } = require('./digimon_palette.js');

// squash<0 = ground-contact squat (wider/flatter), squash>0 = airborne
// stretch (narrower/taller) -- drives the hop cycle used as "walk".
function drawBlobBody(c, cx, cy, r, body, bodyDk, bodyLt, belly, squash = 0) {
  const rx = r - squash * 0.6;
  const ry = r + squash * 0.6;
  c.fillEllipse(cx, cy, rx, ry, body);
  c.fillEllipse(cx, cy + ry * 0.4, rx * 0.55, ry * 0.45, belly);
  c.fillEllipse(cx - rx * 0.35, cy - ry * 0.4, rx * 0.35, ry * 0.3, withAlpha(bodyLt, 130));
  c.fillEllipse(cx + rx * 0.3, cy + ry * 0.35, rx * 0.4, ry * 0.3, withAlpha(bodyDk, 100));
}

function drawBlobEyes(c, cx, eyeY, spacing, blink) {
  if (blink) {
    c.line(cx - spacing - 1, eyeY, cx - spacing + 1, eyeY, DP.ink, 1);
    c.line(cx + spacing - 1, eyeY, cx + spacing + 1, eyeY, DP.ink, 1);
    return;
  }
  c.fillEllipse(cx - spacing, eyeY, 2, 3, DP.paper);
  c.fillEllipse(cx + spacing, eyeY, 2, 3, DP.paper);
  c.fillRect(cx - spacing - 1, eyeY, cx - spacing, eyeY + 1, DP.ink);
  c.fillRect(cx + spacing - 1, eyeY, cx + spacing, eyeY + 1, DP.ink);
}

function drawGroundShadow(c, cx, cy, rx, ry) {
  c.fillEllipse(cx, cy, rx, ry, withAlpha(DP.ink, 60));
}

// Hop cycle (anticipation squat -> airborne stretch -> landing squat ->
// settle) -- the baby forms have no legs to animate, so locomotion is
// reinterpreted as a hop, same documented approach as Patamon's hover-bob
// "walk" (see PIXEL_ART_DIRECTION.md §0.1).
function hopPoses() {
  return [-6, 6, -4, 0];
}

module.exports = { drawBlobBody, drawBlobEyes, drawGroundShadow, hopPoses };
