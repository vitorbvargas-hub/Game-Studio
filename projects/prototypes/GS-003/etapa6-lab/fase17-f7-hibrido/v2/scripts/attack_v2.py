"""F7v2 (Comando 12.1): ataque = corpo da F7 (attack_f7.build) com 2 correções de custo zero.
QA-1: resíduo do fogo antigo (vermelho-escuro) no corpo -> contorno ou cor vizinha do corpo.
QA-2: ataque N q4-q7 congelado -> q5 estica 1 px (cabeça), q7 assenta 1 px (tronco), pés fixos.
O fogo NÃO vem mais no pacote: é projétil separado (projetil.py)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
import attack_f7 as AT
W = H = 60
INK = AT.INK
def residue(c):
    r, g, b, a = c
    return bool(a) and r > 70 and g < 12 and b < 12        # #4e0303 #5e0304 #720503 #8d0206 (nunca aparecem nas rotações)
def clean_residue(p):
    pts = [(x, y) for y in range(H) for x in range(W) if residue(tuple(p[y][x]))]
    for x, y in pts:
        nb = [tuple(p[y+b][x+a]) if 0 <= y+b < H and 0 <= x+a < W else T for a, b in ((1,0),(-1,0),(0,1),(0,-1))]
        dark = sum(1 for k in nb if k[3] and sum(k[:3]) < 90 and not residue(k))
        if any(not k[3] for k in nb) or dark >= 2: p[y][x] = INK
        else:
            lit = [k for k in nb if k[3] and sum(k[:3]) >= 90 and not residue(k)]
            p[y][x] = max(set(lit), key=lit.count) if lit else INK
    return pts
def squash_down(p, top_fix=43):
    """tronco+cabeça descem 1 px sobre as pernas (pés fixos), igual ao recuo do q3 da F7."""
    q = [list(r) for r in p]
    for y in range(top_fix, 0, -1): q[y] = list(p[y-1])
    for x in range(W):
        if not q[top_fix+1][x][3] and p[top_fix+1][x][3]: q[top_fix+1][x] = p[top_fix+1][x]
    return q
def stretch_up(p, cut):
    """cabeça sobe 1 px; a linha `cut` (pescoço) é repetida para não abrir buraco."""
    q = [list(r) for r in p]
    for y in range(0, cut): q[y] = list(p[y+1])
    return q
def build(log=None):
    R = AT.build(); out = {}
    for d in 'SNE':
        body, fx, info = R[d]
        b = [[list(map(tuple, r)) for r in f[2]] for f in body]
        for i, p in enumerate(b):
            pts = clean_residue(p)
            if pts and log is not None: log.append(('residuo', d, i, len(pts), pts))
        if d == 'N':
            b[5] = stretch_up(b[5], 26)
            b[7] = squash_down(b[7])
        out[d] = [(W, H, p) for p in b]
    out['W'] = [mirror(f) for f in out['E']]
    return out, {d: R[d][2]['origem_boca'] for d in 'SNEW'}
if __name__ == '__main__':
    import zoomv
    lg = []; B, org = build(lg)
    for l in lg: print(l)
    print(org)
    zoomv.z('v2_atkN', B['N'], box=(14, 4, 45, 51), sc=6, cols=5); zoomv.z('v2_atkS', B['S'], box=(14, 8, 45, 51), sc=6, cols=5)
    zoomv.z('v2_atkE', B['E'], box=(8, 4, 51, 51), sc=5, cols=5)
