'use strict';
// Builds an AnimData.xml compatible in structure with the founder's
// reference (ShadowSize, Anims/Anim/Name/Index/FrameWidth/FrameHeight/
// RushFrame/HitFrame/ReturnFrame/Durations), covering only the 5 animations
// this pack ships (Idle/Walk/Attack/Hurt/Sleep) instead of the reference's
// full ~35-animation set.
function buildAnimDataXml(anims) {
  const lines = ['<?xml version="1.0" ?>', '<AnimData>', '\t<ShadowSize>1</ShadowSize>', '\t<Anims>'];
  anims.forEach((a, i) => {
    lines.push('\t\t<Anim>');
    lines.push(`\t\t\t<Name>${a.name}</Name>`);
    lines.push(`\t\t\t<Index>${i}</Index>`);
    lines.push(`\t\t\t<FrameWidth>${a.frameWidth}</FrameWidth>`);
    lines.push(`\t\t\t<FrameHeight>${a.frameHeight}</FrameHeight>`);
    if (a.rushFrame !== undefined) lines.push(`\t\t\t<RushFrame>${a.rushFrame}</RushFrame>`);
    if (a.hitFrame !== undefined) lines.push(`\t\t\t<HitFrame>${a.hitFrame}</HitFrame>`);
    if (a.returnFrame !== undefined) lines.push(`\t\t\t<ReturnFrame>${a.returnFrame}</ReturnFrame>`);
    lines.push('\t\t\t<Durations>');
    a.durations.forEach((d) => lines.push(`\t\t\t\t<Duration>${d}</Duration>`));
    lines.push('\t\t\t</Durations>');
    lines.push('\t\t</Anim>');
  });
  lines.push('\t</Anims>', '</AnimData>', '');
  return lines.join('\n');
}

module.exports = { buildAnimDataXml };
