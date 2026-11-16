"""Folha rápida de conferência: python3 preview.py <pacote> <saida.png> [escala]"""
import sys, os
sys.path.insert(0, '/home/openclaw/projects/GameStudio/workspaces/game-art/tools')
from pxpng import load_png_rgba, save_png_rgba
P, OUTP = sys.argv[1], sys.argv[2]; SC = int(sys.argv[3]) if len(sys.argv) > 3 else 4
BG = (200, 210, 190, 255)
def ld(p): return load_png_rgba(p)
rows = [[ld(os.path.join(P, 'rotations', d + '.png')) for d in 'SENW']]
for anim in ('walk', 'attack'):
    for d in 'SEN':
        dd = os.path.join(P, anim, d)
        rows.append([ld(os.path.join(dd, f)) for f in sorted(os.listdir(dd)) if f.endswith('.png')])
cw = 60; W = max(len(r) for r in rows) * (cw * SC + 2); Hh = len(rows) * (cw * SC + 2)
out = [[BG] * W for _ in range(Hh)]
for j, r in enumerate(rows):
    for i, (w, h, px) in enumerate(r):
        ox = i * (cw * SC + 2); oy = j * (cw * SC + 2)
        for y in range(h):
            for x in range(w):
                c = px[y][x]
                if c[3]:
                    for dy in range(SC):
                        row = out[oy + y * SC + dy]
                        for dx in range(SC): row[ox + x * SC + dx] = tuple(c)
save_png_rgba(OUTP, W, Hh, out)
