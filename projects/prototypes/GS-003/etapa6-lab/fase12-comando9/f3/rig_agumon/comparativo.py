"""Gera comparativo_f3.png/.gif (4x, nearest-neighbor) — v3 custom x rig 2D."""
import os, glob, sys
from rig_s import load_png_rgba, save_png_rgba, OUT, PKG
sys.path.insert(0, '/home/openclaw/projects/GameStudio/workspaces/game-art/tools')
from pxpng import bbox_opaque
F35 = {'A':'010101111101101','B':'110101110101110','C':'011100100100011','D':'110101101101110','E':'111100110100111',
 'F':'111100110100100','G':'011100101101011','I':'111010010010111','L':'100100100100111','O':'010101101101010',
 'P':'110101110100100','Q':'010101101110011','R':'110101110101101','S':'011100010001110','T':'111010010010010',
 'U':'101101101101111','V':'101101101101010','Z':'111001010100111','M':'101111111101101','N':'110101101101101',
 '0':'111101101101111','1':'010110010010111','2':'110001010100111','3':'110001010001110','4':'101101111001001',
 '-':'000000111000000',' ':'000000000000000','(':'010100100100010',')':'010001001001010'}
def draw_text(dst, dw, dh, x, y, text, scale=2, **kw):
    cx = x
    for ch in text.upper():
        g = F35.get(ch, F35[' '])
        for i, b in enumerate(g):
            if b == '1':
                for j in range(scale):
                    for q in range(scale):
                        X, Y = cx + (i % 3) * scale + q, y + (i // 3) * scale + j
                        if 0 <= X < dw and 0 <= Y < dh: dst[Y][X] = (235, 235, 235, 255)
        cx += 4 * scale

from gifenc import write_gif

V3FELIZ = os.path.join(OUT, 'ref_v3_custom_feliz_1x')
BG = (48, 52, 60, 255); BG2 = (40, 43, 50, 255); S = 4; C = 64; LAB = 12

def load_dir(d, idx=None, delays=None):
    fs = sorted(glob.glob(os.path.join(d, 'frame_*.png')))
    if idx: fs = [fs[i] for i in idx]
    fr = []
    for f in fs:
        w, h, px = load_png_rgba(f)
        x0, y0, x1, y1 = bbox_opaque(px, w, h)
        cv = [[(0, 0, 0, 0)] * C for _ in range(C)]
        ox, oy = (C - w) // 2, C - h          # só translação inteira; ground() acerta o chão
        for y in range(h):
            for x in range(w):
                if px[y][x][3]: cv[y + oy][x + ox] = px[y][x]
        fr.append(cv)
    if delays is None:
        dp = os.path.join(d, 'delays_ms.txt')
        delays = list(map(int, open(dp).read().split())) if os.path.exists(dp) else [120] * len(fr)
    return fr, delays

def ground(frs):
    """corrige a linha do chão: alinha o pé (último y opaco) do 1o quadro em C-6."""
    yb = max(y for y in range(C) for x in range(C) if frs[0][y][x][3])
    d = (C - 6) - yb
    return [[[f[y - d][x] if 0 <= y - d < C else (0, 0, 0, 0) for x in range(C)] for y in range(C)] for f in frs]

PANELS = []
def add(label, frs, delays):
    PANELS.append((label, ground(frs), delays))

f, d = load_dir(V3FELIZ, delays=[120] * 9); add('v3 CUSTOM FELIZ', f, d)
f, d = load_dir(os.path.join(OUT, 'anim_feliz_S')); add('RIG FELIZ', f, d)
f, d = load_dir(os.path.join(PKG, 'attack', 'S'), idx=[0, 1, 2, 3, 4], delays=[180, 160, 120, 120, 300]); add('v3 ATAQUE 0-4 (F2)', f, d)
f, d = load_dir(os.path.join(OUT, 'anim_preparo_S')); add('RIG PREPARO', f, d)
f, d = load_dir(os.path.join(OUT, 'anim_idle_S')); add('RIG IDLE S', f, d)
f, d = load_dir(os.path.join(OUT, 'anim_idle_E')); add('RIG IDLE E (CAUDA)', f, d)

CW = C * S; WW = CW * len(PANELS); HH = CW + LAB * 2

def canvas_at(t_ms):
    cv = [[BG if (i // CW) % 2 == 0 else BG2 for i in range(WW)] for _ in range(HH)]
    for k, (label, frs, dl) in enumerate(PANELS):
        tot = sum(dl); t = t_ms % tot; i = 0
        while t >= dl[i]: t -= dl[i]; i += 1
        f = frs[i]
        for y in range(C):
            for x in range(C):
                c = f[y][x]
                if c[3]:
                    for j in range(S):
                        row = cv[LAB * 2 + y * S + j]
                        for q in range(S): row[k * CW + x * S + q] = c
        draw_text(cv, WW, HH, k * CW + 6, 6, label, scale=3)
    return cv

if __name__ == '__main__':
    # PNG: folha com todos os quadros, uma linha por painel, 4x
    maxn = max(len(p[1]) for p in PANELS)
    PW = C * S * maxn + 200; PH = (C * S + 8) * len(PANELS)
    sheet = [[BG] * PW for _ in range(PH)]
    for r, (label, frs, _) in enumerate(PANELS):
        y0 = r * (C * S + 8)
        draw_text(sheet, PW, PH, 6, y0 + 8, label.replace(' (', ' ').replace(')', ''), scale=2)
        for i, f in enumerate(frs):
            for y in range(C):
                for x in range(C):
                    c = f[y][x]
                    if c[3]:
                        for j in range(S):
                            row = sheet[y0 + y * S + j]
                            for q in range(S): row[200 + (i * C + x) * S + q] = c
            for y in range(y0, y0 + C * S): sheet[y][200 + i * C * S] = (90, 90, 100, 255)
    save_png_rgba(os.path.join(OUT, 'comparativo_f3.png'), PW, PH, sheet)
    TICK = 60; total = 2400
    frames = [canvas_at(t) for t in range(0, total, TICK)]
    write_gif(os.path.join(OUT, 'comparativo_f3.gif'), frames, WW, HH, [TICK] * len(frames))
    print('ok', WW, HH, len(frames))
