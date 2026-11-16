"""Recorta região de uma folha e amplia (estudo interno). Uso: recorte.py folha.png x0 y0 x1 y1 escala saida.png"""
import sys, os
sys.dont_write_bytecode = True
sys.path.insert(0, '/home/openclaw/projects/GameStudio/workspaces/game-art/tools')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pxpng import save_png_rgba
from pngidx import load_any
p, x0, y0, x1, y1, s, o = sys.argv[1], *map(int, sys.argv[2:7]), sys.argv[7]
w, h, px = load_any(p)
out = []
for y in range(y0, y1):
    row = []
    for x in range(x0, x1):
        c = px[y][x] if 0 <= x < w and 0 <= y < h else (0, 0, 0, 0)
        if c[3] == 0: c = (200, 200, 200, 255)
        row += [tuple(c)]*s
    for _ in range(s): out.append(list(row))
save_png_rgba(o, (x1-x0)*s, (y1-y0)*s, out)
