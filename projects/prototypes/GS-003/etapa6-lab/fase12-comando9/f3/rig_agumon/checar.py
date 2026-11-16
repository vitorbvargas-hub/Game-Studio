"""Checagens objetivas do F3: paleta, linha do chão, tamanho da cabeça."""
import os, glob
from rig_s import load_png_rgba, PKG, OUT
pal = set()
for f in glob.glob(os.path.join(PKG, 'rotations', '*.png')) + glob.glob(os.path.join(PKG, 'attack', 'S', '*.png')):
    w, h, px = load_png_rgba(f); pal |= {c for r in px for c in r if c[3]}
for d in sorted(glob.glob(os.path.join(OUT, 'anim_*'))):
    novas = set(); pes = []; topo = []; alfa = set()
    for f in sorted(glob.glob(d + '/frame_*.png')):
        w, h, px = load_png_rgba(f)
        cs = {c for r in px for c in r if c[3]}; novas |= cs - pal; alfa |= {c[3] for c in cs}
        ys = [y for y in range(h) for x in range(w) if px[y][x][3]]
        pes.append(max(ys)); topo.append(min(ys))
    print(os.path.basename(d), 'cores fora da paleta:', len(novas), '| alfa:', sorted(alfa), '| linha do pé:', pes, '| topo:', topo)
