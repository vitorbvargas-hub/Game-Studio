const { readPNG } = require('./png.js');
const files = process.argv.slice(2);
const all = new Map();
for (const f of files) {
  const img = readPNG(f);
  const { width, height, data } = img;
  const local = new Map();
  let semi = 0, opaque = 0;
  for (let i = 0; i < width * height; i++) {
    const o = i * 4;
    const a = data[o + 3];
    if (a > 0 && a < 255) semi++;
    if (a === 255) {
      opaque++;
      const key = data[o] + ',' + data[o + 1] + ',' + data[o + 2];
      local.set(key, (local.get(key) || 0) + 1);
      all.set(key, (all.get(key) || 0) + 1);
    }
  }
  console.log(f, 'opaque=', opaque, 'semi=', semi, 'unique_colors=', local.size);
}
console.log('TOTAL unique colors across all files:', all.size);
const sorted = [...all.entries()].sort((a, b) => b[1] - a[1]);
console.log('colors:', sorted.map(([k, v]) => `#${k}(${v})`).join(' '));
