"""F8A: pranchas de ESTUDO (diagramas sobre arte oficial e sobre o pacote aprovado). Não cria sprite.
- prancha_direcoes: recortes oficiais (DS Dawn/Dusk e WSC Digital Partner) agrupados por direção, com linhas de medida.
- prancha_escala: Tamer A (S) | Agumon F7v2 (S, E) | Hawkmon DS oficial (nativo) | caixas das opções de escala A/B/C.
Uso: python3 -I pranchas.py   (lê caminhos fixos; grava em ../estudos/)"""
import sys, os
sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, '/home/openclaw/projects/GameStudio/workspaces/game-art/tools')
from pngidx import load_any
from pxpng import save_png_rgba
L = '/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/etapa6-lab'
B = L + '/fase19-f8a-hawkmon/biblioteca/oficiais'
OUT = L + '/fase19-f8a-hawkmon/estudos'
os.makedirs(OUT, exist_ok=True)
BG = (236, 236, 228, 255); GRID = (222, 222, 212, 255)
RED = (220, 40, 40, 255); BLUE = (40, 90, 220, 255); GREEN = (30, 150, 60, 255); ORANGE = (240, 140, 0, 255); GREY = (120, 120, 120, 255)

def crop(img, x0, y0, w, h, drop=()):
    W, H, px = img; bg = tuple(px[0][0]); out = []
    for y in range(y0, y0+h):
        r = []
        for x in range(x0, x0+w):
            c = tuple(px[y][x]) if 0 <= x < W and 0 <= y < H else (0, 0, 0, 0)
            if c[3] == 0 or c == bg or ('#%02x%02x%02x' % c[:3]) in drop: c = (0, 0, 0, 0)
            r.append(c)
        out.append(r)
    return (w, h, out)

def trim(img):
    w, h, px = img
    ys = [y for y in range(h) for x in range(w) if px[y][x][3]]; xs = [x for y in range(h) for x in range(w) if px[y][x][3]]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    return (x1-x0+1, y1-y0+1, [r[x0:x1+1] for r in px[y0:y1+1]])

class Canvas:
    def __init__(s, w, h, grid=0):
        s.w, s.h = w, h
        s.px = [[(GRID if grid and ((x//grid + y//grid) % 2) else BG) for x in range(w)] for y in range(h)]
    def paste(s, img, x0, ybase):  # ybase = linha do chão (último pixel do sprite)
        w, h, px = img
        for y in range(h):
            for x in range(w):
                if px[y][x][3]:
                    X, Y = x0+x, ybase-h+1+y
                    if 0 <= X < s.w and 0 <= Y < s.h: s.px[Y][X] = px[y][x]
    def hline(s, x0, x1, y, c, dash=False):
        for x in range(max(0, x0), min(s.w, x1+1)):
            if 0 <= y < s.h and (not dash or x % 2 == 0): s.px[y][x] = c
    def vline(s, x, y0, y1, c):
        for y in range(max(0, y0), min(s.h, y1+1)):
            if 0 <= x < s.w: s.px[y][x] = c
    def rect(s, x0, y0, x1, y1, c):
        s.hline(x0, x1, y0, c); s.hline(x0, x1, y1, c); s.vline(x0, y0, y1, c); s.vline(x1, y0, y1, c)
    def save(s, path, k):
        out = []
        for r in s.px:
            row = [c for c in r for _ in range(k)]
            for _ in range(k): out.append(list(row))
        save_png_rgba(path, s.w*k, s.h*k, out)

def bbox_top(img):
    w, h, px = img
    return min(y for y in range(h) for x in range(w) if px[y][x][3])

# ---------- prancha de direções ----------
dd = load_any(B + '/ds_dawndusk/sr40896_hawkmon.png')
wsc = load_any(B + '/wsc_digitalpartner/sr483619_hawkmon.png')
SH = ('#292121',)
ds = {k: trim(crop(dd, *v, drop=SH)) for k, v in {
    'S_idle': (100, 104, 22, 31), 'SE_walk1': (20, 128, 22, 29), 'SE_walk2': (44, 126, 22, 31), 'SE_walk3': (68, 128, 22, 29),
    'NE_walk1': (19, 96, 22, 26), 'NE_walk2': (43, 93, 22, 29), 'NE_walk3': (67, 96, 22, 26), 'salto': (165, 98, 21, 25)}.items()}
# WSC: células 16x32 (minis) e 48x48 (poses); o fundo azul da célula sai por cor
def wsc_cell(x, y, w, h):
    W, H, px = wsc; cbg = tuple(px[y+1][x+1])
    out = []
    for yy in range(y, y+h):
        r = []
        for xx in range(x, x+w):
            c = tuple(px[yy][xx]); r.append((0, 0, 0, 0) if c == cbg else c)
        out.append(r)
    return trim((w, h, out))
ws = {'S_mini1': wsc_cell(256, 328, 16, 32), 'S_mini2': wsc_cell(280, 328, 16, 32),
      'W_mini1': wsc_cell(312, 328, 16, 32), 'W_mini2': wsc_cell(336, 328, 16, 32),
      'N_mini1': wsc_cell(368, 328, 16, 32), 'N_mini2': wsc_cell(392, 328, 16, 32),
      'N_48': wsc_cell(368, 72, 48, 48), 'lado_48': wsc_cell(304, 72, 48, 48)}
rows = [('S', [ds['S_idle'], ds['SE_walk1'], ds['SE_walk2'], ds['SE_walk3'], ws['S_mini1'], ws['S_mini2']]),
        ('N', [ds['NE_walk1'], ds['NE_walk2'], ds['NE_walk3'], ws['N_mini1'], ws['N_mini2'], ws['N_48']]),
        ('E_W', [ws['W_mini1'], ws['W_mini2'], ws['lado_48'], ds['salto']])]
CW, RH = 56, 60
cv = Canvas(CW*6+8, RH*3+8)
for ri, (name, imgs) in enumerate(rows):
    ground = 4 + RH*(ri+1) - 8
    for ci, im in enumerate(imgs):
        x0 = 4 + ci*CW + (CW - im[0])//2
        cv.paste(im, x0, ground)
        top = ground - im[1] + 1
        cv.hline(4+ci*CW+2, 4+ci*CW+CW-3, ground+1, GREEN)        # chão
        cv.hline(4+ci*CW+2, 4+ci*CW+CW-3, top-1, RED, dash=True)  # topo (topete incluído)
    cv.hline(0, cv.w-1, 4+RH*(ri+1)-2, GREY)
cv.save(OUT + '/prancha_direcoes_oficial_x6.png', 6)

# ---------- prancha de escala ----------
tam = trim(load_any(L + '/lab-assets/a-f7v2/tamer/tamer_a_cabelo_preto/rotations/south.png'))
agS = trim(load_any(L + '/fase17-f7-hibrido/v2/pacote_agumon_f7v2/rotations/S.png'))
agE = trim(load_any(L + '/fase17-f7-hibrido/v2/pacote_agumon_f7v2/rotations/E.png'))
hk = ds['S_idle']
ground = 70
cv = Canvas(8*40+8, 80, grid=32)
items = [tam, agS, agE, hk]
for i, im in enumerate(items):
    x0 = 4 + i*40 + (40 - im[0])//2
    cv.paste(im, x0, ground)
# opções: (corpo até o alto da cabeça, topete, largura S)
opts = [('A', 30, 8, 18, BLUE), ('B', 28, 7, 17, ORANGE), ('C', 34, 9, 20, RED)]
for j, (nm, body, plume, wid, col) in enumerate(opts):
    cx = 4 + (4+j)*40 + 20
    x0, x1 = cx - wid//2, cx + (wid - wid//2) - 1
    cv.rect(x0, ground-body+1, x1, ground, col)                 # corpo
    cv.vline(cx, ground-body-plume+1, ground-body, col)          # topete
    cv.vline(cx+1, ground-body-plume+1, ground-body, col)
cv.hline(0, cv.w-1, ground+1, GREEN)
for y, c in ((ground-41+1, (90, 90, 90, 255)), (ground-35+1, (150, 110, 40, 255))):  # altura do Tamer (41) e do Agumon S (35)
    cv.hline(0, cv.w-1, y-1, c, dash=True)
cv.save(OUT + '/prancha_escala_opcoes_x4.png', 4)
print('ok', {k: (v[0], v[1]) for k, v in list(ds.items()) + list(ws.items())})
