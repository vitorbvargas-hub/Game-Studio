// Chroma-key removal via flood fill from the border, seeded on the
// dominant border color, so only the CONNECTED background becomes
// transparent (never an isolated similar-colored pixel inside the subject).
const { readPNG, writePNG } = require('./png.js');

const src = process.argv[2];
const dst = process.argv[3];
const tol = process.argv[4] ? parseFloat(process.argv[4]) : 60;

const img = readPNG(src);
const { width, height, data } = img;

function colorAt(x, y) {
  const i = (y * width + x) * 4;
  return [data[i], data[i + 1], data[i + 2]];
}

// dominant border color (mode, rounded to buckets of 8 to merge near-dupes)
const counts = new Map();
function bucket(c) {
  return [Math.round(c[0] / 8) * 8, Math.round(c[1] / 8) * 8, Math.round(c[2] / 8) * 8].join(',');
}
for (let x = 0; x < width; x++) {
  counts.set(bucket(colorAt(x, 0)), (counts.get(bucket(colorAt(x, 0))) || 0) + 1);
  counts.set(bucket(colorAt(x, height - 1)), (counts.get(bucket(colorAt(x, height - 1))) || 0) + 1);
}
for (let y = 0; y < height; y++) {
  counts.set(bucket(colorAt(0, y)), (counts.get(bucket(colorAt(0, y))) || 0) + 1);
  counts.set(bucket(colorAt(width - 1, y)), (counts.get(bucket(colorAt(width - 1, y))) || 0) + 1);
}
let bestKey = null, bestCount = -1;
for (const [k, v] of counts) if (v > bestCount) { bestCount = v; bestKey = k; }
const seed = bestKey.split(',').map(Number);
console.error('seed background color ~', seed, 'tol', tol);

function dist2(c) {
  const dr = c[0] - seed[0], dg = c[1] - seed[1], db = c[2] - seed[2];
  return dr * dr + dg * dg + db * db;
}

const visited = new Uint8Array(width * height);
const isBg = new Uint8Array(width * height);
const stack = [];
for (let x = 0; x < width; x++) { stack.push([x, 0]); stack.push([x, height - 1]); }
for (let y = 0; y < height; y++) { stack.push([0, y]); stack.push([width - 1, y]); }

const tol2 = tol * tol;
while (stack.length) {
  const [x, y] = stack.pop();
  if (x < 0 || y < 0 || x >= width || y >= height) continue;
  const idx = y * width + x;
  if (visited[idx]) continue;
  visited[idx] = 1;
  const c = colorAt(x, y);
  if (dist2(c) > tol2) continue;
  isBg[idx] = 1;
  stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
}

const out = new Uint8ClampedArray(width * height * 4);
let bgCount = 0;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = y * width + x;
    const i = idx * 4;
    if (isBg[idx]) {
      out[i] = 0; out[i + 1] = 0; out[i + 2] = 0; out[i + 3] = 0;
      bgCount++;
    } else {
      out[i] = data[i]; out[i + 1] = data[i + 1]; out[i + 2] = data[i + 2]; out[i + 3] = 255;
    }
  }
}
writePNG(dst, width, height, out);
console.error('bg pixels removed:', bgCount, '/', width * height);
