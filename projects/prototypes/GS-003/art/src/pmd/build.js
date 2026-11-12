'use strict';
// Orchestrator for the PMD-format content pack (GS-003). For each creature:
// writes AnimData.xml + <Anim>-Anim.png/-Offsets.png/-Shadow.png per
// animation under art/sprites/pmd/<monster>/, plus review previews (per-anim
// x4 strip, south direction, and an 8-direction idle turnaround) under
// art/sprites/pmd/<monster>/preview/.
const fs = require('fs');
const path = require('path');
const { Canvas } = require('../canvas.js');
const { P } = require('../palette.js');
const { drawText } = require('../font5x3.js');
const { DIR_ORDER, buildAnimDirections, UNIQUE_DIRS, DIR_META } = require('./common.js');
const { buildGridPng, buildOffsetsPng } = require('./sheet.js');
const { ANIM_SPECS } = require('./anim_specs.js');
const { buildAnimDataXml } = require('./xml.js');

const CREATURES = [
  require('./creatures/koromon.js'),
  require('./creatures/agumon.js'),
  require('./creatures/tsunomon.js'),
  require('./creatures/gabumon.js'),
  require('./creatures/tokomon.js'),
  require('./creatures/patamon.js'),
];

function buildCreature(creature, outRoot) {
  const { sp, name } = creature;
  const outDir = path.join(outRoot, name);
  const previewDir = path.join(outDir, 'preview');
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(previewDir, { recursive: true });

  const perAnim = {};
  for (const spec of ANIM_SPECS) {
    const { framesByDir, shadowByDir } = buildAnimDirections(sp, spec.frameWidth, spec.frameHeight, spec.name);
    perAnim[spec.name] = { spec, framesByDir, shadowByDir };

    const animPng = buildGridPng(framesByDir, spec.frameWidth, spec.frameHeight);
    const shadowPng = buildGridPng(shadowByDir, spec.frameWidth, spec.frameHeight);
    const nFrames = framesByDir.S.length;
    const offsetsPng = buildOffsetsPng(spec.frameWidth, spec.frameHeight, nFrames, spec.frameHeight - 4);

    animPng.save(path.join(outDir, `${spec.name}-Anim.png`));
    shadowPng.save(path.join(outDir, `${spec.name}-Shadow.png`));
    offsetsPng.save(path.join(outDir, `${spec.name}-Offsets.png`));

    // Per-animation x4 preview strip, S direction (task-requested artifact).
    const strip = new Canvas(spec.frameWidth * nFrames, spec.frameHeight);
    framesByDir.S.forEach((f, i) => strip.blit(f, i * spec.frameWidth, 0));
    strip.scaleNearest(4).save(path.join(previewDir, `${name}_${spec.name.toLowerCase()}_south_x4.png`));
  }

  fs.writeFileSync(path.join(outDir, 'AnimData.xml'), buildAnimDataXml(ANIM_SPECS));

  // 8-direction idle turnaround, frame 1, for a quick directional QA look.
  const idleW = ANIM_SPECS[0].frameWidth, idleH = ANIM_SPECS[0].frameHeight;
  const turn = new Canvas(idleW * 8, idleH);
  DIR_ORDER.forEach((d, i) => turn.blit(perAnim.Idle.framesByDir[d][0], i * idleW, 0));
  turn.scaleNearest(4).save(path.join(previewDir, `${name}_directions_x4.png`));

  return { name, perAnim };
}

function buildContactSheet(built, outRoot) {
  const scale = 2;
  const rowH = 48 * scale + 14;
  const labelW = 70;
  const cols = 8; // widest row = 8-direction idle turnaround
  const idleW = ANIM_SPECS[0].frameWidth * scale;
  const width = labelW + cols * idleW;
  const animOrder = ['Idle', 'Walk', 'Attack', 'Hurt', 'Sleep'];
  const height = built.length * (animOrder.length + 1) * rowH + 20;
  const sheet = new Canvas(width, height);
  sheet.fillRect(0, 0, width - 1, height - 1, P.void);

  let y = 6;
  for (const b of built) {
    drawText(sheet, b.name.toUpperCase(), 4, y, P.paper);
    y += 10;
    for (const animName of animOrder) {
      const { spec, framesByDir } = b.perAnim[animName];
      drawText(sheet, animName.toUpperCase(), 4, y + 10, P.mist);
      let x = labelW;
      framesByDir.S.forEach((f) => {
        sheet.blit(f.scaleNearest(scale), x, y);
        x += spec.frameWidth * scale;
      });
      y += spec.frameHeight * scale + 6;
    }
    // directions turnaround row
    drawText(sheet, 'DIRS', 4, y + 10, P.mist);
    let x = labelW;
    DIR_ORDER.forEach((d) => {
      sheet.blit(b.perAnim.Idle.framesByDir[d][0].scaleNearest(scale), x, y);
      x += ANIM_SPECS[0].frameWidth * scale;
    });
    y += ANIM_SPECS[0].frameHeight * scale + 14;
  }

  fs.mkdirSync(outRoot, { recursive: true });
  sheet.save(path.join(outRoot, 'pmd_contact_sheet.png'));
}

function generate(outRoot) {
  const built = CREATURES.map((cr) => buildCreature(cr, outRoot));
  buildContactSheet(built, outRoot);
  console.log(`PMD sprites written for: ${built.map((b) => b.name).join(', ')}`);
}

module.exports = { generate, CREATURES };
if (require.main === module) {
  generate(process.argv[2] || path.join(__dirname, '..', '..', 'sprites', 'pmd'));
}
