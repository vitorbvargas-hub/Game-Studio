'use strict';
// Assigns 15 web_fetch spill logs (given by hash, in the canonical order
// below) to the 15 PNGs of one Pokemon, decodes them and
// validates every sheet against AnimData.xml (FrameWidth*frames x FrameHeight*8).
// Usage: node ingest_batch.js NNNN <stagingDir> <outDir> <hash x15>
const fs = require('fs');
const path = require('path');
const { decodePNG } = require('../png_decode.js');

const ANIMS = ['Idle', 'Walk', 'Attack', 'Hurt', 'Sleep'];
const KINDS = ['Anim', 'Shadow', 'Offsets'];
const ORDER = ANIMS.flatMap((a) => KINDS.map((k) => `${a}-${k}.png`));

function body(spill) {
  const s = fs.readFileSync(spill, 'utf8');
  const m = s.match(/---\n([\s\S]*?)\n?<<<END_EXTERNAL_UNTRUSTED_CONTENT/);
  return m[1].trim().replace(/^data:[^,]*,/, '');
}

function animSpec(xml, name) {
  for (const m of xml.matchAll(/<Anim>([\s\S]*?)<\/Anim>/g)) {
    const b = m[1];
    if (b.match(/<Name>(.*?)</)[1] !== name) continue;
    return {
      fw: +b.match(/<FrameWidth>(\d+)/)[1],
      fh: +b.match(/<FrameHeight>(\d+)/)[1],
      n: (b.match(/<Duration>/g) || []).length,
    };
  }
  throw new Error(`anim ${name} missing`);
}

function main() {
  const [num, staging, outDir, ...hashes] = process.argv.slice(2);
  if (hashes.length !== ORDER.length) throw new Error(`need ${ORDER.length} hashes, got ${hashes.length}`);
  const spills = hashes.map((h) => ({ f: `/tmp/openclaw-web-fetch-${h}.log` }));
  const xml = fs.readFileSync(path.join(staging, num, 'AnimData.xml'), 'utf8');
  const dst = path.join(outDir, num);
  fs.mkdirSync(dst, { recursive: true });
  let ok = true;
  ORDER.forEach((name, i) => {
    const buf = Buffer.from(body(spills[i].f), 'base64');
    const img = decodePNG(buf);
    const spec = animSpec(xml, name.split('-')[0]);
    const expW = spec.fw * spec.n, expH = spec.fh * 8;
    const colors = new Set();
    for (let p = 0; p < img.data.length; p += 4) if (img.data[p + 3]) colors.add((img.data[p] << 16) | (img.data[p + 1] << 8) | img.data[p + 2]);
    // Single-direction anims (e.g. Sleep) ship 1 row instead of 8.
    const good = img.width === expW && (img.height === expH || img.height === spec.fh);
    if (!good) ok = false;
    fs.writeFileSync(path.join(dst, name), buf);
    console.log(`${good ? 'OK ' : 'BAD'} ${num}/${name} ${img.width}x${img.height} exp ${expW}x${expH} colors=${colors.size}`);
  });
  for (const f of ['AnimData.xml', 'credits.txt']) fs.copyFileSync(path.join(staging, num, f), path.join(dst, f));
  if (!ok) process.exitCode = 1;
}
main();
