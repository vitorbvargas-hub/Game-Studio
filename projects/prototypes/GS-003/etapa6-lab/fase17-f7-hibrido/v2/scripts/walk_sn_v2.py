"""F7v2 (Comando 12.1): walk S/N EXPERIMENTAL. Pernas e braços dos quadros F2b walk S/N; cabeça e tronco da
rotação (F7), colados por melhor encaixe inteiro; âncora da F7 (linha do chão fixa). Sem reescala, sem cor nova."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
import rig_f7 as R
W = H = 60
GROUND = {'S': 49, 'N': 48}
def n60(f):
    if f[0] == 48: return pad(f, 60, 60, 6, 5)
    if f[0] == 56: return pad(f, 60, 60, 2, 2)
    return f
def P(img): return [[tuple(c) for c in r] for r in img[2]]
def part60(p): return {(x+6, y+5): tuple(c) for (x, y), c in p.items()}
def shiftpx(p, dx, dy):
    out = [[T]*W for _ in range(H)]
    for y in range(H):
        for x in range(W):
            if p[y][x][3] and 0 <= x+dx < W and 0 <= y+dy < H: out[y+dy][x+dx] = p[y][x]
    return out
def fit(part, p, rng=4, w=None):
    best = None
    for dy in range(-rng, rng+1):
        for dx in range(-rng, rng+1):
            n = 0
            for (x, y), c in part.items():
                X, Y = x+dx, y+dy
                if not (0 <= X < W and 0 <= Y < H) or p[Y][X] != c: n += 1
            k = (n, abs(dx)+abs(dy))
            if best is None or k < best[0]: best = (k, dx, dy)
    return best[1], best[2], best[0][0]
# sobe-e-desce regular da cabeça/tronco (dy relativo à pose parada; <0 = mais alto) e linha onde a perna
# perde/ganha 1 linha para o corpo chegar lá (os quadros F2b têm pernas de comprimento desigual entre as metades)
BOB = {'S': [-1, -2, -1, 0, -1, -2, -1, 0], 'N': [0, -1, 0, 0, 0, -1, 0, 0]}
LEGROW = {'S': 45, 'N': 44}
def squash(p, row, delta):
    """delta>0: tira `delta` linhas (row, row-1, ...) e desce tudo que está acima; delta<0: duplica a linha `row`."""
    q = [list(r) for r in p]
    for _ in range(abs(delta)):
        if delta > 0:
            for y in range(row, 0, -1): q[y] = list(q[y-1])
            q[0] = [T]*W
        else:
            for y in range(0, row): q[y] = list(q[y+1])
    return q
def build(d, variant='torso', log=None, regular=True, alt=False):
    Pp = R.PS if d == 'S' else R.PN
    head = part60(Pp['head']); torso = part60(Pp['torso'])
    hb = max(y for x, y in head)
    out = []; norm = []
    for i, f in enumerate(frames(F2B, 'walk', d)):
        p = P(n60(f))
        low = max(y for y in range(H) for x in range(W) if p[y][x][3])
        p = shiftpx(p, 0, GROUND[d]-low)
        hdx, hdy, he = fit(head, p)
        dl = 0
        if regular:
            dl = BOB[d][i] - hdy
            p = squash(p, LEGROW[d], dl); hdy += dl
        norm.append((p, low, hdx, hdy, he, dl))
    for i in range(8):
        p, low, hdx, hdy, he, dl = norm[i]
        if alt:      # os quadros F2b S são simétricos (as duas pernas fazem o mesmo): a metade direita vem do quadro
            p2 = norm[(i+4) % 8][0]     # i+4 (meio ciclo depois), o que dá passada alternada e braços em oposição
            p = [list(p[y][:30]) + list(p2[y][30:]) for y in range(H)]
        tdx, tdy, te = fit(torso, p, 3)
        if alt: tdx, tdy = 0, hdy
        q = [list(r) for r in p]
        for y in range(0, hb+hdy+1):            # tira a cabeça F2b
            for x in range(W): q[y][x] = T
        if variant == 'torso':
            for (x, y), c in torso.items(): q[y+tdy][x+tdx] = c
        for (x, y), c in head.items(): q[y+hdy][x+hdx] = c
        if log is not None: log.append(dict(q=i, chao_shift=GROUND[d]-low, perna_linhas=-dl, cabeca=(hdx, hdy, he), tronco=(tdx, tdy, te)))
        out.append((W, H, q))
    return out
if __name__ == '__main__':
    import zoomv
    for d in 'SN':
        for v in ('torso', 'head'):
            lg = []; fr = build(d, v, lg)
            if v == 'torso':
                for l in lg: print(d, l)
            zoomv.z('exp_%s_%s' % (d, v), fr)
        zoomv.z('exp_%s_alt' % d, build(d, alt=True)); zoomv.z('legs_%s_alt' % d, build(d, alt=True), box=(14,30,45,50), sc=8)
        zoomv.z('f7_%s' % d, frames(F7OLD, 'walk', d)); zoomv.z('f2b_%s' % d, [n60(f) for f in frames(F2B, 'walk', d)])
