// node row.mjs <saida.png> <zoom> <x0> <y0> <w> <h> arquivos...   (recorte de cada quadro lado a lado, fundo cinza, linha de chão y=49 marcada)
import { readPNG, writePNG } from './png.mjs';
const [out, Zs, x0s, y0s, ws, hs, ...files] = process.argv.slice(2); const Z = +Zs, X0 = +x0s, Y0 = +y0s, w = +ws, h = +hs;
const C = +(process.env.COLS||files.length), RW = Math.ceil(files.length / C); const W = C * (w * Z + 3) + 3, H = RW * (h * Z + 3) + 3; const b = Buffer.alloc(W * H * 4);
for (let i = 0; i < W * H; i++) { b[i * 4] = 30; b[i * 4 + 1] = 30; b[i * 4 + 2] = 36; b[i * 4 + 3] = 255; }
files.forEach((f, c) => { const d = readPNG(f).data; const ox = 3 + (c % C) * (w * Z + 3), oy = 3 + Math.floor(c / C) * (h * Z + 3);
  for (let y = 0; y < h * Z; y++) for (let x = 0; x < w * Z; x++) { const sx = X0 + Math.floor(x / Z), sy = Y0 + Math.floor(y / Z); const si = (sy * 60 + sx) * 4; const o = ((oy + y) * W + ox + x) * 4;
    let col = [128, 128, 128]; if (sy === 50) col = [200, 60, 60]; if (d[si + 3]) col = [d[si], d[si + 1], d[si + 2]]; b[o] = col[0]; b[o + 1] = col[1]; b[o + 2] = col[2]; } });
writePNG(out, W, H, b);
