"""Grade 1x (transparente) de um pacote: linhas = walk S/E/N/W + attack S/E/N/W, colunas = quadros.
Uso: grid.py <pacote> <out.png>"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from f2lib import load_pack, T
from pxpng import save_png_rgba

data, _ = load_pack(sys.argv[1])
keys = [k for k in ('walk/S', 'walk/E', 'walk/N', 'walk/W', 'attack/S', 'attack/E', 'attack/N', 'attack/W') if k in data]
cw = max(f.w for k in keys for f in data[k]); ch = max(f.h for k in keys for f in data[k])
cols = max(len(data[k]) for k in keys)
W, H = cw * cols, ch * len(keys)
px = [[T] * W for _ in range(H)]
for r, k in enumerate(keys):
    for c, f in enumerate(data[k]):
        ox = c * cw + (cw - f.w) // 2; oy = r * ch + (ch - f.h)
        for y in range(f.h):
            for x in range(f.w):
                if f.px[y][x][3]:
                    px[oy + y][ox + x] = f.px[y][x]
save_png_rgba(sys.argv[2], W, H, px)
print(sys.argv[2], W, H, keys)
