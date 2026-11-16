"""F7: ataque (Pepper Breath) nas 4 direções, com o fogo fora do corpo (camada attack_fx/).
Corpo: S = antecipação do rig (F3/F4) + quadros F2b q4..q7 sem fogo + saída pelo q8 (C10A) + neutro;
E/N = F2b attack com q0 = rotação (transição limpa) e fogo removido; W = espelho de E."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
import rig_f7 as R
W = H = 60
def px(img): return [[tuple(c) for c in r] for r in img[2]]
def shifted(img, dx, dy):
    w, h, p = img; out = [[T]*W for _ in range(H)]
    for y in range(h):
        for x in range(w):
            if p[y][x][3] and 0 <= x+dx < W and 0 <= y+dy < H: out[y+dy][x+dx] = tuple(p[y][x])
    return out
def is_fire(c):
    r, g, b, a = c
    if not a: return False
    if r > 195 and g < 150 and b < 60 and not (g > 95 and r < 235): return True      # vermelhos/laranjas vivos
    return False
def is_glow(c):
    r, g, b, a = c
    return a and r > 240 and g > 150 and (b > 60 or g > 240) and not (r == 240 and g == 175)
def comps(mask):
    seen = set(); out = []
    for p in mask:
        if p in seen: continue
        st = [p]; seen.add(p); comp = []
        while st:
            x, y = st.pop(); comp.append((x, y))
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    q = (x+dx, y+dy)
                    if q in mask and q not in seen: seen.add(q); st.append(q)
        out.append(comp)
    return out
def fire_mask(p, region):
    cand = {(x, y) for y in range(H) for x in range(W) if region(x, y) and (is_fire(p[y][x]) or is_glow(p[y][x]))}
    m = set()
    for comp in comps(cand):
        if any(is_fire(p[y][x]) for x, y in comp): m |= set(comp)
    return m

INK = (12, 5, 6, 255)
def close_outline(p):
    add = []
    for y in range(H):
        for x in range(W):
            if p[y][x][3]: continue
            for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
                X, Y = x+dx, y+dy
                if 0 <= X < W and 0 <= Y < H and p[Y][X][3] and sum(p[Y][X][:3]) >= 200: add.append((x, y)); break
    for x, y in add: p[y][x] = INK
    return len(add)
def defire(p, donor, region=lambda x, y: True):
    """tira o fogo de p; onde o fogo cobria o corpo, usa o pixel do quadro doador (mesma pose, sem fogo).
    O doador é alinhado em dy (-1..1) pelo menor erro fora da máscara."""
    m = fire_mask(p, region)
    q = [list(r) for r in p]
    if donor:
        dm0 = fire_mask(donor, lambda x, y: True)
        def err(dy):
            n = 0
            for y in range(2, H-2):
                for x in range(W):
                    if (x, y) in m: continue
                    if p[y][x] != donor[y-dy][x]: n += 1
            return n
        dy = min((-1, 0, 1), key=err) if m else 0
    for (x, y) in m:
        c = T
        if donor and 0 <= y-dy < H and (x, y-dy) not in dm0: c = donor[y-dy][x]
        q[y][x] = c
    # restos de brilho soltos (não ligados à massa do fogo)
    for y in range(H):
        for x in range(W):
            if is_fire(q[y][x]):
                c = T
                if donor and 0 <= y-dy < H and not is_fire(donor[y-dy][x]): c = donor[y-dy][x]
                if not c[3]:
                    nb = [q[y+b][x+a] for a, b in ((1,0),(-1,0),(0,1),(0,-1)) if 0 <= y+b < H and 0 <= x+a < W]
                    nb = [k for k in nb if k[3] and not is_fire(k)]
                    if len(nb) >= 3: c = max(nb, key=lambda k: sum(k[:3]))
                q[y][x] = c
    n = close_outline(q)
    return q, m, n
# ---------- fogo desenhado por nós (Pepper Breath) ----------
FC = {'r': rgb('fb1903'), 'o': rgb('fd8c35'), 'y': rgb('fdd66f'), 'p': rgb('fcf6cf'), 'w': rgb('fcfffe'), 'd': rgb('e20704')}
def fireball(cx, cy, r, tx=0.0, ty=0.0, tail=0.0):
    """bola com núcleo quente e cauda afinando na direção (tx,ty) (de onde ela veio)."""
    out = {}
    R = int(r + tail) + 3
    for y in range(int(cy)-R, int(cy)+R+1):
        for x in range(int(cx)-R, int(cx)+R+1):
            best = None
            n = 8 if tail > 0 else 0
            for k in range(n+1):
                t = k/n if n else 0
                px_, py_ = cx + tx*tail*t, cy + ty*tail*t
                rr = r*(1 - 0.75*t)
                e = rr - ((x-px_)**2 + (y-py_)**2) ** 0.5       # profundidade dentro da forma
                if best is None or e > best: best = e
            if best is None or best < 0: continue
            if best < 1.0: c = 'r'
            elif best < 2.0: c = 'o'
            elif best < 3.1: c = 'y'
            elif best < 4.3: c = 'p'
            else: c = 'w'
            if r <= 2.6 and best >= 1.0: c = 'y'
            if 0 <= x < W and 0 <= y < H: out[(x, y)] = FC[c]
    return out
def sparks(pts):
    return {(x, y): FC[c] for x, y, c in pts if 0 <= x < W and 0 <= y < H}
def fx_frames(d, org):
    ox, oy = org; E = {}
    if d == 'S':     # vem na direção da câmera: nasce na boca, cresce e desce
        return [E, E, fireball(ox, oy, 2.2), fireball(ox, oy+2, 4.2, 0, -1, 2), fireball(ox, oy+5, 6.0, 0, -1, 3),
                fireball(ox, oy+9, 7.8, 0, -1, 4),
                sparks([(ox-9, oy+5, 'r'), (ox+9, oy+6, 'r'), (ox-11, oy+11, 'd'), (ox+11, oy+12, 'd'), (ox-7, oy+16, 'o'), (ox+7, oy+17, 'o'),
                        (ox-3, oy+19, 'r'), (ox+3, oy+19, 'r'), (ox, oy+12, 'y'), (ox-4, oy+9, 'o'), (ox+4, oy+10, 'y'), (ox, oy+21, 'd')]),
                E, E]
    if d == 'E':     # sai para a direita, dentro do canvas
        return [E, E, fireball(ox+2, oy, 2.4), fireball(ox+5, oy, 3.6, -1, 0, 3), fireball(ox+8, oy, 4.4, -1, 0, 5),
                {**fireball(ox+10, oy, 2.4), **sparks([(ox+4, oy-3, 'r'), (ox+5, oy+3, 'o'), (ox+2, oy+1, 'r'), (ox+11, oy-4, 'd'), (ox+11, oy+4, 'd')])},
                sparks([(ox+7, oy-4, 'r'), (ox+9, oy+3, 'r'), (ox+11, oy-1, 'o'), (ox+5, oy+1, 'd')]),
                sparks([(ox+10, oy-3, 'd')]), E]
    if d == 'N':     # vai para o fundo: sobe e diminui; a camada fica ATRÁS do corpo
        return [E, E, E, fireball(ox, oy-2, 5.2, 0, 1, 3), fireball(ox, oy-6, 4.4, 0, 1, 4), fireball(ox, oy-8, 3.0, 0, 1, 3),
                sparks([(ox-4, oy-8, 'r'), (ox+3, oy-9, 'r'), (ox, oy-10, 'o'), (ox-1, oy-6, 'y'), (ox+5, oy-6, 'd')]),
                E, E]
def to_img(dct):
    p = [[T]*W for _ in range(H)]
    for (x, y), c in dct.items(): p[y][x] = c
    return (W, H, p)
def mirror_px(p): return [list(reversed(r)) for r in p]

def build():
    """devolve {dir: (corpo[9], fx[9], info)}"""
    res = {}
    # ---- S: C10A (rig + F2b q4..q7 + saída q8 + rig)
    A = [shifted(f, -3, 4) for f in frames(C10H + '/ataque_A_saida_q8', '')]
    body = [A[0], A[1], A[2]]; rem = []
    donor = A[6]
    dq, dm, _ = defire(donor, None, lambda x, y: y >= 34)      # o doador (F2b q7) tem só a faísca no chão
    for i in (3, 4, 5):
        q, m, n = defire(A[i], dq, lambda x, y: y >= 28)
        for y in range(34, H):          # brilho residual do fogo no corpo (S): volta ao pixel do doador
            for x in range(W):
                if hx(q[y][x]) in ('#ba0106', '#e46423') and q[y][x][3]: q[y][x] = dq[y][x]
        body.append(q); rem.append(len(m))
    body.append(dq); rem.append(len(dm)); body += [A[7], A[8]]
    res['S'] = (body, (30, 29), {'fogo_removido_px': rem})
    # ---- E: F2b attack/E, q0 = rotação
    rotE = px(pad(load(F2B + '/rotations/E.png'), W, H, 6, 5))
    FE = [shifted(f, 0, -1) for f in frames(F2B, 'attack', 'E')]
    body = [rotE]; rem = []
    m2 = fire_mask(FE[2], lambda x, y: True)
    oy = round(sum(y for x, y in m2)/len(m2))
    for i in range(1, 9):
        q, m, n = defire(FE[i], None); body.append(q); rem.append(len(m))
    import rig_e as RE                      # saída: pose parada com o olho fechado (rig F3), no lugar do q8 redesenhado
    body[8] = px(pad((48, 48, RE.body(blink=True)), W, H, 6, 5))
    org = (max(x for x in range(W) if body[3][oy][x][3]) + 1, oy)
    res['E'] = (body, org, {'fogo_removido_px': rem})
    # ---- N: F2b attack/N, q0 = rotação; doador = q2 (mesma pose, sem fogo)
    rotN = px(pad(load(F2B + '/rotations/N.png'), W, H, 6, 5))
    FN = [shifted(f, 2, 0 if i == 4 else 1) for i, f in enumerate(frames(F2B, 'attack', 'N'))]   # q4 vinha 1 px abaixo
    body = [rotN]; rem = []
    for i in range(1, 9):
        q, m, n = defire(FN[i], FN[2] if i in (3, 4, 5, 6) else None); body.append(q); rem.append(len(m))
    body[8] = rotN                          # saída = pose parada exata
    # recuo do disparo (q3): tronco e cabeça descem 1 px sobre as pernas (pés fixos), como no rig
    q = [list(r) for r in body[3]]
    for y in range(43, 0, -1): q[y] = list(body[3][y-1])
    for x in range(W):                       # mantém as pernas (y>=44) e não deixa buraco
        if not q[44][x][3] and body[3][44][x][3]: q[44][x] = body[3][44][x]
    body[3] = q
    top = min(y for y in range(H) for x in range(W) if FN[2][y][x][3])
    res['N'] = (body, (30, top), {'fogo_removido_px': rem})
    out = {}
    for d in res:                           # pedaços soltos pequenos (resto de faísca) saem do corpo
        for p in res[d][0]:
            cs = comps({(x, y) for y in range(H) for x in range(W) if p[y][x][3]})
            big = max(cs, key=len)
            for c in cs:
                if c is not big:
                    for x, y in c: p[y][x] = T
    for d, (body, org, info) in res.items():
        fx = [to_img(f) for f in fx_frames(d, org)]
        out[d] = ([(W, H, b) for b in body], fx, dict(info, origem_boca=list(org)))
    bE, fE, iE = out['E']
    out['W'] = ([mirror(b) for b in bE], [mirror(f) for f in fE], dict(iE, origem_boca=[59 - iE['origem_boca'][0], iE['origem_boca'][1]], espelho_de='E'))
    return out
def comp(body, fx, behind=False):
    w, h, b = body; f = fx[2]; out = [[T]*W for _ in range(H)]
    for y in range(H):
        for x in range(W):
            lo, hi = (f[y][x], b[y][x]) if behind else (b[y][x], f[y][x])
            out[y][x] = tuple(hi) if hi[3] else tuple(lo)
    return (W, H, out)
if __name__ == '__main__':
    R_ = build()
    for d in 'SEN':
        body, fx, info = R_[d]
        print(d, info)
        save(O + '/tmp/atk_%s_body.png' % d, sheet(body, 4, cols=5))
        save(O + '/tmp/atk_%s_comp.png' % d, sheet([comp(b, f, d == 'N') for b, f in zip(body, fx)], 4, cols=5))
