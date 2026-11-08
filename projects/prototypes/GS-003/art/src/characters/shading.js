'use strict';
// GS-003 character creator — shared shading helper. Light source is fixed
// top-left per ART_STYLE_GUIDE.md section 5: within any horizontal span, the
// left portion gets the light tone, the middle the base tone, the right
// portion the dark tone. 2-3 solid tones, no gradient, matching the rest of
// the project's pixel art.
function shadeSpan(x0, x1, tokens) {
  const w = x1 - x0 + 1;
  if (w <= 2) return [[x0, x1, tokens[1]]];
  const lightW = Math.max(1, Math.round(w * 0.3));
  const darkW = Math.max(1, Math.round(w * 0.3));
  const baseW = w - lightW - darkW;
  const spans = [];
  let x = x0;
  spans.push([x, x + lightW - 1, tokens[0]]);
  x += lightW;
  if (baseW > 0) { spans.push([x, x + baseW - 1, tokens[1]]); x += baseW; }
  spans.push([x, x1, tokens[2]]);
  return spans;
}

module.exports = { shadeSpan };
