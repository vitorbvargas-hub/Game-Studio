"""Hawkmon F8B, Etapa 2b: walk (8 quadros) e idle (6 quadros) em S/N/E/W por rig sobre as rotações v2 aprovadas.
0 gerações: cabeça, tronco, asas, cauda e topete são os pixels das rotações v2; as pernas e os pés são redesenhados à mão
(gabarito de movimento: walk_cru/S_template e walk_cru/E, PixelLab). W = espelho de E. Tudo em P1.
Canvas 60x60, âncora (29.5, 49): rotação 48x48 entra em (+6,+7).
Coordenadas internas = grade da rotação (linha 0 = ponta do topete; linha 37 = contorno de baixo dos pés)."""
import sys, os
sys.dont_write_bytecode = True
sys.path.insert(0, '/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/etapa6-lab/fase20-f8b-hawkmon/etapa1_pose_base/scripts')
from comum import *
from pal import *
E2A = LAB + '/fase20-f8b-hawkmon/etapa2a_rotacoes/rotacoes_polidas_v2/'
OUT = LAB + '/fase20-f8b-hawkmon/etapa2b_walk_idle'
W = H = 60
OY = 12                      # linha 0 da grade -> y=12 no canvas 60 (linha 37 -> y=49)
OX = {'S': 20, 'N': 20, 'E': 18}
def grade(d): return [l.rstrip('\n') for l in open(E2A + d + '_grade.txt') if l.strip()]
G = {d: grade(d) for d in 'SNE'}
for d in 'SN': assert len(G[d]) == 38 and all(len(r) == 20 for r in G[d])
assert len(G['E']) == 38 and all(len(r) == 24 for r in G['E'])

class Cv:
    """tela esparsa de letras P1, em coordenadas da grade"""
    def __init__(s): s.p = {}
    def put(s, rows, x0, y0, flip=None):
        for j, r in enumerate(rows):
            for i, ch in enumerate(r):
                if ch != '.':
                    x = x0 + i
                    if flip is not None: x = flip - x
                    s.p[(x, y0 + j)] = ch
    def set(s, x, y, ch):
        if ch == '.': s.p.pop((x, y), None)
        else: s.p[(x, y)] = ch
    def px(s, ox):
        c = canvas(W, H)
        for (x, y), ch in s.p.items(): c[y + OY][x + ox] = L2C[ch]
        return c
def mirror(px): return [r[::-1] for r in px]

# ---------------- topete (camada separada, mola de 1 px) ----------------
def topete(d, b, t):
    """b = deslocamento da cabeça (0/1); t = deslocamento da ponta (0/1, atrasada 1 quadro). Nunca se solta nem sobrepõe."""
    rows = G[d][0:8]; c = Cv()
    c.put(rows[0:6], 0, t)
    if t == b: c.put([rows[6]], 0, 6 + b)
    elif t < b: c.put([rows[6]], 0, 6 + t); c.put([rows[6]], 0, 7 + t)     # estica 1 px
    # t > b: comprime 1 px (a linha 6 some)
    c.put([rows[7]], 0, 7 + b)
    return c

# ---------------- S ----------------
S_LEG = ['kyyk', 'kyyk', 'kyok', 'kyok']               # colunas 5-8, linhas 31-34
S_F0 = ['.kyyYyok', 'kCyCycnk', '.kkkkkk.']           # pé inteiro no chão, colunas 2-9
S_F1 = ['...kyok.', '...kkkk.']                      # pé atrás/escondido (toco)
S_F2 = ['...kyyok', '...kCyck', '....kkk.']           # pé levantado vindo para a frente
#        fase:   0        1        2         3         4         5         6         7
S_PH = [(S_F0, 0), (S_F0, 0), (S_F0, 0), (S_F0, 0), (S_F1, -2), (S_F1, -3), (S_F2, -2), (S_F0, -1)]   # apoio 4 quadros no chão; o pé sai para trás (toco), volta levantado e desce inteiro
S_WING = {0: None,
          1: ['kprrk', 'kqrrk', 'kGGGG', 'kGkGk', 'kGkk.', 'khk..', '.k...']}   # linhas 27-33, colunas 0-4: asa 1 px mais baixa
def body_S(d='S'):
    g = [list(r) for r in G[d]]
    if d == 'S':
        for y in range(31, 38):
            for x in range(0, 20):
                if y >= 33 or 4 <= x <= 15: g[y][x] = '.'
    else:
        for y in range(33, 38):
            for x in range(0, 20):
                if not (8 <= x <= 11 and y <= 35) and not (y == 33 and x in (5, 6, 13, 14)): g[y][x] = '.'
    return g
def leg_SN(c, leg, foot, dy, b, side):
    """side 0 = perna da esquerda da tela, 1 = da direita (espelho na coluna 19-x)"""
    fl = None if side == 0 else 19
    top = 31 + b; bot = 34 + dy
    for r in range(top, bot + 1): c.put([leg[3 - (bot - r)]], 5, r, fl)
    c.put(foot, 2, 35 + dy, fl)
N_WING = {0: None,
          1: ['kprrk', 'kqrrk', 'kGGGG', 'kGkGk', 'kGkkk', 'khk.k', '.k...']}   # N: a coluna 4 é a borda do leque e fica
def wings_SN(g, wl, wr, WG=None):
    for side, w in ((0, wl), (1, wr)):
        if not w: continue
        for j, row in enumerate((WG or S_WING)[w]):
            for i, ch in enumerate(row):
                x = i if side == 0 else 19 - i
                g[27 + j][x] = ch
def blink_S(g):
    for x0 in (5, 12):
        for i, ch in enumerate('wWW' if x0 == 5 else 'WWw'): g[15][x0 + i] = ch
        for i in range(3): g[16][x0 + i] = 'k'
        for i, ch in enumerate('wWw'): g[17][x0 + i] = ch
def frame_SN(d, b, pl, pr, wl=0, wr=0, blink=False, t=None, PH=None, LEG=None):
    c = Cv()
    for side, p in ((0, pl), (1, pr)):
        foot, dy = PH[p] if isinstance(p, int) else p
        leg_SN(c, LEG, foot, dy, b, side)
    g = body_S(d); wings_SN(g, wl, wr, N_WING if d == 'N' else S_WING)
    if blink: blink_S(g)
    if d == 'N' and b:      # a ponta central do leque não desce com o corpo: encurta 1 px (nunca chega mais perto do chão)
        c.put([''.join(r) for r in g[8:33]], 0, 9)
        c.put(['.....kk.kqqk.kk.....', '........kkkk........'], 0, 34)
    else:
        c.put([''.join(r) for r in g[8:]], 0, 8 + b)
    return c, topete(d, b, b if t is None else t)
BOB = [1, 0, 0, 0, 1, 0, 0, 0]
def walk_S():
    out = []
    for f in range(8):
        wr = 1 if f in (1, 2) else 0; wl = 1 if f in (5, 6) else 0
        out.append(frame_SN('S', BOB[f], f, (f + 4) % 8, wl, wr, t=0, PH=S_PH, LEG=S_LEG))
    return out
# ---------------- N ----------------
N_LEG = ['kyok'] * 4
N_F0 = ['.kkyyok', 'kCyyonk', '.kkkkk.']             # pé inteiro (perto da câmera), colunas 2-8: 1 px mais curto por dentro
N_F1 = ['...kyok', '...kkkk']                        # pé à frente (longe), encurtado sob o leque
N_F2 = ['..kyook', '..konnk', '...kkk.']             # pé levantado: sola
N_PH = [(N_F0, 0), (N_F0, 0), (N_F0, 0), (N_F0, 0), (N_F2, -1), (N_F1, -2), (N_F1, -3), (N_F0, -1)]   # sai mostrando a sola, some sob o leque, desce inteiro
def walk_N():
    out = []
    for f in range(8):
        wr = 1 if f in (1, 2) else 0; wl = 1 if f in (5, 6) else 0
        out.append(frame_SN('N', BOB[f], f, (f + 4) % 8, wl, wr, t=0, PH=N_PH, LEG=N_LEG))
    return out
# ---------------- E ----------------
E_NF = [(-2, 'kyyYyo'), (-3, 'kCyyyyoyCk'), (-2, 'kkkkkkkkk')]     # pé de perto: (x relativo ao tornozelo col 12, linha)
E_FF = [(1, 'kkk'), (-1, 'koonck'), (-1, 'kkkkk')]                  # pé de trás (mais escuro), 1 linha acima
def rnd(v):
    import math
    return int(math.floor(v + 0.5))
def leg_E(c, near, d, L, b):
    """d = deslocamento horizontal do pé; L = pé levantado L px; b = corpo 1 px mais baixo"""
    top = 31 + b; bot = 34 - L; n = bot - top + 1
    for k, r in enumerate(range(top, bot + 1)):
        sx = rnd(d * (k + 1) / (n + 1.0))
        if near: c.put(['kyyk' if (bot - r) >= 2 else 'kyok'], 11 + sx, r)
        else: c.put(['kok'], 14 + sx, r)
    if near:
        for j, (x0, row) in enumerate(E_NF): c.put([row], 12 + d + x0, 35 - L + j)
        if (12 + d + 4, 35 - L) not in c.p: c.set(12 + d + 4, 35 - L, 'k')      # contorno da frente só onde o pé de trás não está
    else:
        for j, (x0, row) in enumerate(E_FF): c.put([row], 15 + d + x0, 34 - L + j)
def body_E(wing=0, tail=0, blink=False):
    g = [list(r) for r in G['E']]
    for y in range(31, 38):
        for x in range(0, 24):
            if not ((y == 31 and 4 <= x <= 11) or (y == 32 and x == 5)): g[y][x] = '.'
    if tail:        # cauda vermelha atrasa 1 px (cai 1 linha)
        col = [[g[y][x] for x in range(5)] for y in range(25, 30)]
        for x in range(5): g[25][x] = '.'
        for j in range(5):
            for x in range(5):
                if col[j][x] != '.' or 26 + j <= 29: g[26 + j][x] = col[j][x] if col[j][x] != '.' else ('.' if 26 + j <= 29 else g[26 + j][x])
    if wing:        # pontas escuras da asa 1 px para trás
        r30 = g[30][4:12]; r31 = g[31][4:12]
        g[30][3:11] = r30; g[30][11] = 'k'
        g[31][3:11] = r31; g[31][11] = '.'
        g[32][5] = '.'; g[32][4] = 'k'
    if blink:
        for i, ch in enumerate('WWw'): g[15][16 + i] = ch
        for i in range(3): g[16][16 + i] = 'k'
        for i, ch in enumerate('wWW'): g[17][16 + i] = ch
    return g
E_ST_N = [4, 2, 0, -2]; E_ST_F = [2, 0, -2, -4]        # apoio: 2 px por quadro, pé parado no mundo
def e_phase(p, near):
    st = E_ST_N if near else E_ST_F
    if p < 4: return st[p], 0
    c = st[0] - 3                                          # centro da passada
    if near: return [(c - 2, 1), (c, 3), (c + 2, 3), (c + 3, 1)][p - 4]    # o pé de perto sobe 3 px na passada: o pé de trás (apoio) fica à vista por baixo
    return [(c - 2, 1), (c, 2), (c + 2, 2), (c + 3, 1)][p - 4]
def frame_E(b, pn, pf, wing=0, tail=0, blink=False, t=None):
    c = Cv()
    d, L = pf if isinstance(pf, tuple) else e_phase(pf, False); leg_E(c, False, d, L, b)
    d, L = pn if isinstance(pn, tuple) else e_phase(pn, True); leg_E(c, True, d, L, b)
    g = body_E(wing, tail, blink)
    c.put([''.join(r) for r in g[8:]], 0, 8 + b)
    return c, topete('E', b, b if t is None else t)
def walk_E():
    out = []
    for f in range(8):
        out.append(frame_E(BOB[f], f, (f + 4) % 8, wing=1 if f in (1, 2, 5, 6) else 0, tail=1 if f in (1, 5) else 0, t=0))
    return out
# ---------------- idle (6 quadros) ----------------
IDLE_DELAYS = {'S': [220, 180, 260, 180, 200, 140], 'N': [220, 180, 260, 180, 200, 140],
               'E': [220, 180, 240, 180, 200, 160], 'W': [220, 180, 240, 180, 200, 160]}
def idle_S():
    R = (S_F0, 0)
    k = dict(PH=S_PH, LEG=S_LEG)
    return [frame_SN('S', 0, R, R, **k),                       # repouso (= rotação)
            frame_SN('S', 1, R, R, t=0, **k),                  # solta o ar: corpo desce 1 px, topete atrasa
            frame_SN('S', 1, R, R, 0, 0, **k),                 # topete assenta
            frame_SN('S', 0, R, R, 1, 1, **k),                 # puxa o ar: corpo sobe, asas ainda soltas
            frame_SN('S', 0, R, R, blink=True, **k),           # pisca
            frame_SN('S', 0, R, R, **k)]
def idle_N():
    R = (N_F0, 0)
    k = dict(PH=N_PH, LEG=N_LEG)
    return [frame_SN('N', 0, R, R, **k),
            frame_SN('N', 1, R, R, t=0, **k),
            frame_SN('N', 1, R, R, 0, 0, **k),
            frame_SN('N', 0, R, R, 1, 1, **k),
            frame_SN('N', 0, R, R, 1, 0, **k),                 # de costas não pisca: ajeita uma asa
            frame_SN('N', 0, R, R, **k)]
def idle_E():
    R = (0, 0)
    return [frame_E(0, R, R),
            frame_E(1, R, R, t=0),
            frame_E(1, R, R, tail=1),
            frame_E(0, R, R, wing=1),
            frame_E(0, R, R, blink=True),
            frame_E(0, R, R)]
def build():
    """-> {anim: {dir: [(corpo60, topete60)]}}"""
    out = {'walk': {}, 'idle': {}}
    for a, fs in (('walk', {'S': walk_S(), 'N': walk_N(), 'E': walk_E()}), ('idle', {'S': idle_S(), 'N': idle_N(), 'E': idle_E()})):
        for d, frs in fs.items():
            out[a][d] = [(c.px(OX[d]), t.px(OX[d])) for c, t in frs]
        out[a]['W'] = [(mirror(c), mirror(t)) for c, t in out[a]['E']]
    return out
def comp(c, t):
    o = [list(r) for r in c]; paste(o, t, 0, 0); return o
def rotations():
    out = {}
    for d in 'SNEW':
        r = {}
        for n in ('corpo', 'topete', 'composto'):
            w, h, px = load(E2A + '%s_%s.png' % (d, n)); c = canvas(W, H); paste(c, px, 6, 7); r[n] = c
        out[d] = r
    return out
if __name__ == '__main__':
    T = '/home/openclaw/projects/GameStudio/workspaces/game-art/tmp/c14e2b/'
    B = build(); R = rotations(); BG = (120, 160, 96, 255)
    for a in ('walk', 'idle'):
        n = len(B[a]['S']); CW, CH = 34, 42
        v = canvas(CW * (n + 1), CH * 4, BG)
        for j, d in enumerate('SNEW'):
            paste(v, crop(R[d]['composto'], 13, 9, 13 + CW - 1, 9 + CH - 1), 0, j * CH)
            for i, (c, t) in enumerate(B[a][d]): paste(v, crop(comp(c, t), 13, 9, 13 + CW - 1, 9 + CH - 1), (i + 1) * CW, j * CH)
            for x in range(CW * (n + 1)): v[j * CH + 40][x] = (96, 136, 80, 255) if v[j * CH + 40][x] == BG else v[j * CH + 40][x]
        save(T + 'prev_%s_6x.png' % a, scale(v, 6)); save(T + 'prev_%s_1x.png' % a, v)
        for j, d in enumerate('SNEW'[:3]): save(T + 'prev_%s_%s_10x.png' % (a, d), scale(crop(v, CW, j * CH, CW * (n + 1) - 1, j * CH + CH - 1), 4 if a == 'walk' else 5))
    # conferência: idle q0 == rotação
    for d in 'SNEW':
        c, t = B['idle'][d][0]
        print(d, 'idle q0 == rotação:', comp(c, t) == [list(r) for r in R[d]['composto']], '| corpo:', c == [list(r) for r in R[d]['corpo']], '| topete:', t == [list(r) for r in R[d]['topete']])
