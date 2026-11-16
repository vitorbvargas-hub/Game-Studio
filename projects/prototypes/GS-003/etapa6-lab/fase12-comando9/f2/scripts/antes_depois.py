"""Antes/depois 4x: GIF (linha ANTES em cima, DEPOIS embaixo; colunas = walk S/E/N/W + attack S/E/N/W)
e PNG (todas as linhas de quadros, antes e depois intercalados). Uso: antes_depois.py <antes> <depois> <out_base> <titulo>"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from f2lib import load_pack, T
from pxpng import save_png_rgba
from font35 import text
NM = {'walk/S': 'ANDAR S', 'walk/E': 'ANDAR L', 'walk/N': 'ANDAR N', 'walk/W': 'ANDAR O', 'attack/S': 'ATAQUE S', 'attack/E': 'ATAQUE L', 'attack/N': 'ATAQUE N', 'attack/W': 'ATAQUE O'}
def draw_text(cv, W, H, x, y, s, scale=1):
    text(cv, W, H, x, y, NM.get(s, s), scale=2)
from gifenc import write_gif

A, D, OUT, TIT = sys.argv[1:5]
S = 4
BG = (96, 100, 112, 255); BG2 = (84, 88, 100, 255); LINE = (230, 200, 60, 255)
da, _ = load_pack(A); dd, _ = load_pack(D)
keys = [k for k in ('walk/S', 'walk/E', 'walk/N', 'walk/W', 'attack/S', 'attack/E', 'attack/N', 'attack/W') if k in dd]


def union_box(k):
    x0 = y0 = 10 ** 9; x1 = y1 = -1
    for fr in (da[k], dd[k]):
        for f in fr:
            for y in range(f.h):
                for x in range(f.w):
                    if f.px[y][x][3]:
                        x0 = min(x0, x); x1 = max(x1, x); y0 = min(y0, y); y1 = max(y1, y)
    return x0 - 1, y0 - 1, x1 + 1, y1 + 1


box = {k: union_box(k) for k in keys}
cw = max(b[2] - b[0] + 1 for b in box.values()); ch = max(b[3] - b[1] + 1 for b in box.values())


def blit(cv, W, f, b, ox, oy):
    # alinha pela base da caixa (pé) e centraliza na célula
    bw = b[2] - b[0] + 1; bh = b[3] - b[1] + 1
    ox += (cw - bw) // 2 * S; oy += (ch - bh) * S
    for y in range(b[1], b[3] + 1):
        for x in range(b[0], b[2] + 1):
            if 0 <= y < f.h and 0 <= x < f.w:
                c = f.px[y][x]
                if c[3]:
                    for sy in range(S):
                        row = cv[oy + (y - b[1]) * S + sy]
                        for sx in range(S):
                            row[ox + (x - b[0]) * S + sx] = c


# ---------- GIF ----------
LAB = 16; PAD = 4
W = len(keys) * (cw * S + PAD) + 80
H = 2 * (ch * S + LAB) + 16
nmax = 72  # mmc(8, 9): walk e ataque fecham o ciclo juntos
frames = []
base = [[BG] * W for _ in range(H)]
for i, k in enumerate(keys):
    x0 = 80 + i * (cw * S + PAD)
    for y in range(H):
        for x in range(x0, x0 + cw * S):
            base[y][x] = BG2
    draw_text(base, W, H, x0 + 2, 2, k, scale=1)
    draw_text(base, W, H, x0 + 2, ch * S + LAB + 9, k, scale=1)
draw_text(base, W, H, 2, LAB + 4, 'ANTES', scale=1)
draw_text(base, W, H, 2, ch * S + 2 * LAB + 20, 'DEPOIS', scale=1)
draw_text(base, W, H, 2, 2, TIT[:9].upper(), scale=1)
for x in range(W):
    base[ch * S + LAB + 6][x] = LINE
for t in range(nmax):
    cv = [list(r) for r in base]
    for i, k in enumerate(keys):
        x0 = 80 + i * (cw * S + PAD)
        fa = da[k][t % len(da[k])]; fd = dd[k][t % len(dd[k])]
        blit(cv, W, fa, box[k], x0, LAB)
        blit(cv, W, fd, box[k], x0, ch * S + 2 * LAB + 16)
    frames.append(cv)
write_gif(OUT + '.gif', frames, W, H, [110] * nmax)

# ---------- PNG (todos os quadros) ----------
cols = max(len(dd[k]) for k in keys)
PW = 110 + cols * (cw * S + PAD)
PH = len(keys) * 2 * (ch * S + LAB) + len(keys) * 10
cv = [[BG] * PW for _ in range(PH)]
y = 0
for k in keys:
    for tag, src in (('antes', da), ('depois', dd)):
        draw_text(cv, PW, PH, 2, y + LAB + 4, k, scale=1)
        draw_text(cv, PW, PH, 2, y + LAB + 16, tag.upper(), scale=1)
        for j, f in enumerate(src[k]):
            x0 = 110 + j * (cw * S + PAD)
            for yy in range(y + LAB, y + LAB + ch * S):
                for xx in range(x0, x0 + cw * S):
                    cv[yy][xx] = BG2
            draw_text(cv, PW, PH, x0 + 2, y + 1, 'q%d' % j, scale=1)
            blit(cv, PW, f, box[k], x0, y + LAB)
        y += ch * S + LAB
    for xx in range(PW):
        cv[y + 4][xx] = LINE
    y += 10
save_png_rgba(OUT + '.png', PW, PH, cv)
print(OUT, W, H, PW, PH)
