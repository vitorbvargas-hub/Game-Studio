"""Comando 9 / F3 — rig 2D por partes do Agumon v7 (direção E): idle com cauda.
Mesmas regras do rig_s.py (só deslocamento inteiro, paleta do pacote, PixelLab 0)."""
import os
from rig_s import load_png_rgba, save_png_rgba, PKG, OUT, HERE, T, shift, compose, head_blink

W = H = 48
_, _, SRC = load_png_rgba(os.path.join(PKG, 'rotations', 'E.png'))

def part_of(x, y):
    if 30 <= y <= 37 and x <= 12: return 'tail_tip'
    if 30 <= y <= 37 and x <= 19: return 'tail_base'
    if y >= 36: return 'legs'
    return 'upper'                       # cabeça + tronco + braço

PARTS = {n: {} for n in ('tail_tip', 'tail_base', 'legs', 'upper')}
for y in range(H):
    for x in range(W):
        c = SRC[y][x]
        if c[3]: PARTS[part_of(x, y)][(x, y)] = c

def body(t=0, tip=0, base=0, blink=False):
    up = PARTS['upper']
    if blink:
        up = dict(up)
        for x in range(25, 31):
            for y in range(11, 17):
                c = up.get((x, y))
                if c and ((c[1] > c[0] and c[1] > c[2]) or sum(c[:3]) > 600):
                    up[(x, y)] = (12, 5, 6, 255) if y == 15 else (240, 175, 50, 255)
    layers = [shift(PARTS['tail_tip'], 0, tip), shift(PARTS['tail_base'], 0, base), PARTS['legs']]
    if t < 0: layers.append(up)          # cópia de baixo preenche 1 px na cintura
    layers.append(shift(up, 0, t))
    return compose(layers)

FRAMES = [body(), body(t=-1, tip=-1), body(t=-1, tip=-1, base=-1), body(t=-1, tip=0),
          body(tip=1), body(tip=1, blink=True)]
DELAYS = [220, 180, 240, 180, 200, 160]

if __name__ == '__main__':
    pdir = os.path.join(HERE, 'partes_E'); os.makedirs(pdir, exist_ok=True)
    for n, p in PARTS.items():
        cv = [[T] * W for _ in range(H)]
        for (x, y), c in p.items(): cv[y][x] = c
        save_png_rgba(os.path.join(pdir, n + '.png'), W, H, cv)
    d = os.path.join(OUT, 'anim_idle_E'); os.makedirs(d, exist_ok=True)
    for f in os.listdir(d): os.remove(os.path.join(d, f))
    for i, f in enumerate(FRAMES): save_png_rgba(os.path.join(d, 'frame_%03d.png' % i), W, H, f)
    open(os.path.join(d, 'delays_ms.txt'), 'w').write(' '.join(map(str, DELAYS)) + '\n')
    print('ok idle_E', len(FRAMES))
