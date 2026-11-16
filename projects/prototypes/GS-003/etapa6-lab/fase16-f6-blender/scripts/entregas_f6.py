"""F6: folhas PNG e GIFs lado a lado: F2b (referência) x B (C10, polimento manual) x D (híbrido F4, só S) x F6 (Blender).
Só composição nearest-neighbor. Mesma escala, mesmo canvas (60, âncora pela base), mesma velocidade (110 ms por quadro).
Uso: python3 entregas_f6.py"""
import sys, os
sys.path.insert(0, '/home/openclaw/projects/GameStudio/workspaces/game-art/tools')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pxpng import load_png_rgba, save_png_rgba
from gifenc import write_gif
from font35 import text as _t
HERE = os.path.dirname(os.path.abspath(__file__)); O = os.path.dirname(HERE); L = os.path.dirname(O)
F2B = L + '/fase12-comando9/f2/pacote_agumon_f2'; C10 = L + '/fase13-comando10/pacote_agumon_c10'; F6 = O + '/pacote_agumon_f6'
D_IDLE = L + '/fase12-comando9/f4/hibrido_agumon_S/idle'; D_ATK = L + '/fase13-comando10/hibrido_agumon_S_c10/ataque_A_saida_q8'
OUT = O + '/comparacao'; os.makedirs(OUT, exist_ok=True)
BG = (200, 210, 190, 255); DELAY = 110
def load(p): return [list(r) for r in load_png_rgba(p)[2]]
def frames(dd): return [load(os.path.join(dd, f)) for f in sorted(os.listdir(dd)) if f.endswith('.png')]
def pad(px, W=64, H=64):
    """centra na horizontal e ancora pela base, com 2 px de folga embaixo para o canvas 60 caber no 64"""
    h = len(px); w = len(px[0]); out = [[(0, 0, 0, 0)] * W for _ in range(H)]
    ox = (W - w) // 2; oy = H - h - (2 if h <= 60 else 0)
    if h == 56: oy = H - h - 2 - 3   # o N do F2b (56x56) tem a sola 3 linhas acima das outras direções
    for y in range(h):
        for x in range(w): out[y + oy][x + ox] = tuple(px[y][x])
    return out
EMPTY = [[(0, 0, 0, 0)] * 64 for _ in range(64)]
def canvas(w, h): return [[BG] * w for _ in range(h)]
def blit(dst, src, ox, oy, sc):
    for y, row in enumerate(src):
        for x, c in enumerate(row):
            if c[3]:
                for dy in range(sc):
                    r = dst[oy + y * sc + dy]
                    for dx in range(sc): r[ox + x * sc + dx] = c
def label(c, x, y, s, scale=2): _t(c, len(c[0]), len(c), x, y, s, color=(20, 20, 20, 255), scale=scale)
def grid(cells, sc, col_labels=None, row_labels=None):
    """cells: linhas de painéis 64x64 -> uma imagem"""
    lw = 0 if not row_labels else (max(len(s) for s in row_labels) * 8 + 8 if sc > 1 else 0)
    top = 14 if (col_labels and sc > 1) else 0; gap = 2 * sc
    W = lw + len(cells[0]) * (64 * sc + gap); H = top + len(cells) * (64 * sc + gap)
    c = canvas(W, H)
    for j, row in enumerate(cells):
        for i, p in enumerate(row): blit(c, p, lw + i * (64 * sc + gap), top + j * (64 * sc + gap), sc)
        if lw: label(c, 2, top + j * (64 * sc + gap) + 4, row_labels[j])
    if top:
        for i, s in enumerate(col_labels): label(c, lw + i * (64 * sc + gap) + 4, 2, s)
    return W, H, c
def save(name, W, H, c): save_png_rgba(os.path.join(OUT, name), W, H, c); print(name, W, H)
def gif(name, seq, sc, **kw):
    out = []
    for cells in seq:
        W, H, c = grid(cells, sc, **kw); out.append(c)
    write_gif(os.path.join(OUT, name), out, W, H, [DELAY] * len(out)); print(name, W, H, len(out))

ROWS = ['F2B', 'B C10', 'D F4', 'F6 3D']
# 1. rotações S/N/E/W (D só existe no S: quadro 0 do idle)
rot = [[pad(load(P + '/rotations/%s.png' % d)) for d in 'SNEW'] for P in (F2B, C10)]
rot.append([pad(frames(D_IDLE)[0]), EMPTY, EMPTY, EMPTY])
rot.append([pad(load(F6 + '/rotations/%s.png' % d)) for d in 'SNEW'])
for sc in (1, 4, 6):
    W, H, c = grid(rot, sc, ['S', 'N', 'E', 'W'], ROWS); save('rotacoes_S_N_E_W_%dx.png' % sc, W, H, c)
W, H, c = grid([[pad(load(F6 + '/rotations/%s.png' % d)) for d in 'SNEW']], 6, ['S', 'N', 'E', 'W']); save('F6_rotacoes_S_N_E_W_6x.png', W, H, c)
# 2. caminhada: GIF 1x e 4x, linhas = método, colunas = direção (D não tem caminhada)
WR = ['F2B', 'B C10', 'F6 3D']
walk = {t: {d: [pad(f) for f in frames(P + '/walk/' + d)] for d in 'SNEW'} for t, P in (('F2B', F2B), ('B C10', C10), ('F6 3D', F6))}
seq = [[[walk[t][d][i] for d in 'SNEW'] for t in WR] for i in range(8)]
gif('walk_S_N_E_W_1x.gif', seq, 1)
gif('walk_S_N_E_W_4x.gif', seq, 4, col_labels=['S', 'N', 'E', 'W'], row_labels=WR)
gif('F6_walk_S_N_E_W_1x.gif', [[[walk['F6 3D'][d][i] for d in 'SNEW']] for i in range(8)], 1)
gif('F6_walk_S_N_E_W_4x.gif', [[[walk['F6 3D'][d][i] for d in 'SNEW']] for i in range(8)], 4, col_labels=['S', 'N', 'E', 'W'])
# 3. caminhada: folhas PNG por direção, 3x (8 quadros por linha) e uma folha 1x com tudo
for d in 'SEN':
    W, H, c = grid([walk[t][d] for t in WR], 3, ['Q%d' % i for i in range(8)], WR); save('walk_%s_folha_3x.png' % d, W, H, c)
W, H, c = grid([walk[t][d] for d in 'SEN' for t in WR], 1); save('walk_S_E_N_folha_1x.png', W, H, c)
# 4. ataque (Pepper Breath), S e E: F2b x D (só S) x F6, 9 quadros
atk = {('F2B', d): [pad(f) for f in frames(F2B + '/attack/' + d)] for d in 'SE'}
atk.update({('F6 3D', d): [pad(f) for f in frames(F6 + '/attack/' + d)] for d in 'SE'})
dS = [pad(f) for f in frames(D_ATK)]
AR = ['F2B', 'D F4', 'F6 3D']
seq = [[[atk[('F2B', 'S')][i], atk[('F2B', 'E')][i]], [dS[i], EMPTY], [atk[('F6 3D', 'S')][i], atk[('F6 3D', 'E')][i]]] for i in range(9)]
gif('ataque_S_E_1x.gif', seq, 1)
gif('ataque_S_E_4x.gif', seq, 4, col_labels=['S', 'E'], row_labels=AR)
W, H, c = grid([atk[('F2B', 'S')], dS, atk[('F6 3D', 'S')], atk[('F2B', 'E')], atk[('F6 3D', 'E')]], 3, ['Q%d' % i for i in range(9)], ['F2B S', 'D F4 S', 'F6 S', 'F2B E', 'F6 E'])
save('ataque_S_E_folha_3x.png', W, H, c)
# 5. W: espelho de E (entregue) x W renderizado de verdade no 3D (luz não espelha)
w3 = [pad(f) for f in frames(F6 + '/_W_3d_real/walk')]
W, H, c = grid([walk['F6 3D']['W'], w3], 3, ['Q%d' % i for i in range(8)], ['W ESPELHO', 'W 3D REAL']); save('F6_W_espelho_x_W_3d_3x.png', W, H, c)
print('ok')
