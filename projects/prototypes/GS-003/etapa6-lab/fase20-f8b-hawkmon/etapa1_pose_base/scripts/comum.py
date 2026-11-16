import sys, os
sys.dont_write_bytecode = True
sys.path.insert(0, '/home/openclaw/projects/GameStudio/workspaces/game-art/tools')
sys.path.insert(0, '/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/etapa6-lab/fase19-f8a-hawkmon/scripts')
from pxpng import save_png_rgba, load_png_rgba
from pngidx import load_any
LAB = '/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/etapa6-lab'
OUT = LAB + '/fase20-f8b-hawkmon/etapa1_pose_base'
def load(p):
    w, h, px = load_any(p); return w, h, [list(r) for r in px]
def save(p, px):
    save_png_rgba(p, len(px[0]), len(px), px)
def scale(px, s):
    out = []
    for r in px:
        rr = []
        for c in r: rr += [c]*s
        for _ in range(s): out.append(list(rr))
    return out
def canvas(w, h, c=(0,0,0,0)): return [[c]*w for _ in range(h)]
def paste(dst, src, dx, dy):
    for y, r in enumerate(src):
        for x, c in enumerate(r):
            if c[3] and 0 <= y+dy < len(dst) and 0 <= x+dx < len(dst[0]): dst[y+dy][x+dx] = c
def bbox(px):
    xs = [x for r in px for x, c in enumerate(r) if c[3]]; ys = [y for y, r in enumerate(px) if any(c[3] for c in r)]
    return (min(xs), min(ys), max(xs), max(ys)) if xs else None
def crop(px, x0, y0, x1, y1): return [r[x0:x1+1] for r in px[y0:y1+1]]
