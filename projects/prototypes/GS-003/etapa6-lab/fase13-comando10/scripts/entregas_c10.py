"""C10: PNG/GIF antes-depois, 1x e 4x, comparação com S e N, híbrido (saída). Só composição nearest-neighbor."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__)); from lib import *
from font35 import text as _t
def draw_text(c, W, H, x, y, s, scale=2): _t(c, W, H, x, y, s, color=(20,20,20,255), scale=scale)
A = O + '/backup_f2b/pacote_agumon_f2'; B = O + '/pacote_agumon_c10'
BG = (200, 210, 190, 255); GROUND = (150, 165, 135, 255)
def canvas(w, h, c=BG): return [[c]*w for _ in range(h)]
def blit(dst, src, ox, oy, sc, ground_y=None):
    h = len(src); w = len(src[0])
    for y in range(h):
        for x in range(w):
            c = src[y][x]
            if c[3]:
                for dy in range(sc):
                    for dx in range(sc): dst[oy+y*sc+dy][ox+x*sc+dx] = tuple(c)
def pad(px, W, H, anchor_bottom=True):
    h = len(px); w = len(px[0]); out = [[(0,0,0,0)]*W for _ in range(H)]
    ox = (W - w)//2; oy = (H - h) if anchor_bottom else (H-h)//2
    for y in range(h):
        for x in range(w): out[y+oy][x+ox] = px[y][x]
    return out
def ground(dst, y, x0, x1):
    for x in range(x0, x1):
        dst[y][x] = GROUND
def gif(path, seq, sc, delay, labels=None):
    # seq: lista de quadros; cada quadro = lista de painéis (px) lado a lado
    n = len(seq[0]); w = len(seq[0][0][0]); h = len(seq[0][0]); gap = 4*sc if sc>1 else 2
    top = 16 if labels else 0
    W = n*w*sc + (n-1)*gap; H = h*sc + top
    out = []
    for frame in seq:
        c = canvas(W, H)
        for i, p in enumerate(frame):
            blit(c, p, i*(w*sc+gap), top, sc)
        if labels:
            for i, t in enumerate(labels): draw_text(c, W, H, i*(w*sc+gap)+2, 2, t, scale=2)
        out.append(c)
    write_gif(path, out, W, H, [delay]*len(out))
    return W, H
wa = [f[2] for f in frames(A,'walk','E')]; wb = [f[2] for f in frames(B,'walk','E')]
wbw = [f[2] for f in frames(B,'walk','W')]
D = 110
gif(O+'/walkE_F2b_1x.gif', [[f] for f in wa], 1, D)
gif(O+'/walkE_C10_1x.gif', [[f] for f in wb], 1, D)
gif(O+'/walkE_F2b_4x.gif', [[f] for f in wa], 4, D)
gif(O+'/walkE_C10_4x.gif', [[f] for f in wb], 4, D)
gif(O+'/walkW_C10_4x.gif', [[f] for f in wbw], 4, D)
gif(O+'/walk_lateral_antes_depois_4x.gif', [[a, b] for a, b in zip(wa, wb)], 4, D, ['ANTES F2B', 'DEPOIS C10'])
gif(O+'/walk_lateral_antes_depois_1x.gif', [[a, b] for a, b in zip(wa, wb)], 1, D)
# PNG antes/depois: 2 faixas 4x + rotação E
sc = 4; gap = 8; n = 8
W = n*60*sc + (n-1)*gap + 48*sc + 40; Hh = 2*60*sc + 3*20 + 20
c = canvas(W, Hh)
ra = load(A+'/rotations/E.png')[2]; rb = load(B+'/rotations/E.png')[2]
for row, (seq, rot, lab) in enumerate(((wa, ra, 'ANTES F2B  WALK E Q0-Q7 / ROTACAO E'), (wb, rb, 'DEPOIS C10  WALK E Q0-Q7 / ROTACAO E'))):
    oy = 20 + row*(60*sc + 30)
    draw_text(c, W, Hh, 4, oy-18, lab, scale=2)
    for i, f in enumerate(seq): blit(c, f, i*(60*sc+gap), oy, sc)
    ground(c, oy + 50*sc, 0, n*(60*sc+gap))
    blit(c, rot, n*(60*sc+gap)+30, oy + 5*sc, sc)
save_png_rgba(O+'/antes_depois_lateral_4x.png', W, Hh, c)
# PNG 1x lado a lado (escala de jogo) e 2x
for s in (1, 2):
    gap = 4*s; W = 8*60*s + 7*gap; Hh = 2*60*s + gap
    c = canvas(W, Hh)
    for row, seq in enumerate((wa, wb)):
        for i, f in enumerate(seq): blit(c, f, i*(60*s+gap), row*(60*s+gap), s)
    save_png_rgba(O+'/antes_depois_lateral_%dx.png' % s, W, Hh, c)
# comparação com S e N (rotações + caminhada), canvas comum 60, âncora pela base
dirs = []
for k in 'SNEW':
    P = B
    fr = [f[2] for f in frames(P, 'walk', k)]
    dirs.append([pad(f, 60, 60) for f in fr])
gif(O+'/comparacao_S_N_E_W_walk_4x.gif', [[d[i] for d in dirs] for i in range(8)], 4, D, ['S', 'N', 'E C10', 'W C10'])
gif(O+'/comparacao_S_N_E_W_walk_1x.gif', [[d[i] for d in dirs] for i in range(8)], 1, D)
rots = [pad(load(B+'/rotations/%s.png' % k)[2], 48, 48) for k in 'SNEW'] + [pad(load(A+'/rotations/E.png')[2], 48, 48)]
sc = 6; gap = 12; W = 5*48*sc + 4*gap; Hh = 48*sc + 24
c = canvas(W, Hh)
for i, (r, t) in enumerate(zip(rots, ['S', 'N', 'E C10', 'W C10', 'E F2B'])):
    blit(c, r, i*(48*sc+gap), 24, sc); draw_text(c, W, Hh, i*(48*sc+gap)+4, 4, t, scale=2)
save_png_rgba(O+'/comparacao_rotacoes_S_N_E_W_6x.png', W, Hh, c)
# híbrido S: saída antes x depois
ha = [load(L+'/fase12-comando9/f4/hibrido_agumon_S/ataque/frame_%03d.png' % i)[2] for i in range(9)]
hb = [load(O+'/hibrido_agumon_S_c10/ataque_A_saida_q8/frame_%03d.png' % i)[2] for i in range(9)]
dl = [int(v) for v in open(O+'/hibrido_agumon_S_c10/ataque_A_saida_q8/delays_ms.txt').read().split()]
out = []; sc = 4; W = 2*64*sc + 16; Hh = 64*sc + 16
for a, b in zip(ha, hb):
    c = canvas(W, Hh); blit(c, a, 0, 16, sc); blit(c, b, 64*sc+16, 16, sc)
    draw_text(c, W, Hh, 2, 2, 'F4 D', scale=2); draw_text(c, W, Hh, 64*sc+18, 2, 'C10 SAIDA Q8', scale=2); out.append(c)
write_gif(O+'/hibrido_ataqueS_saida_antes_depois_4x.gif', out, W, Hh, dl)
c = canvas(9*64*3 + 8*6, 2*64*3 + 6)
for row, seq in enumerate((ha, hb)):
    for i, f in enumerate(seq): blit(c, f, i*(64*3+6), row*(64*3+6), 3)
save_png_rgba(O+'/hibrido_ataqueS_saida_antes_depois_3x.png', len(c[0]), len(c), c)
print('ok')
