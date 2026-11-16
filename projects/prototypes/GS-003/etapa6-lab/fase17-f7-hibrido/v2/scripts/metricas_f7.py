"""F7: métricas próprias, as mesmas para F2b (A), C10 (B), F6 e F7 (D). Tudo em canvas 60 com o registro de cada pacote."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
W = H = 60
def P(img): return [[tuple(c) for c in r] for r in img[2]]
def norm(pack, anim, d):
    fr = frames(pack, anim, d); out = []
    for f in fr:
        if f[0] == 56: f = pad(f, 60, 60, 2, 2)
        elif f[0] == 48: f = pad(f, 60, 60, 6, 5)
        elif f[0] == 64: f = (60, 60, [r[3:63] for r in pad(f, 64, 68, 0, 4)[2][0:60]])
        out.append(P(f))
    return out
def rot(pack, d):
    r = load(pack + '/rotations/%s.png' % d)
    if r[0] == 48: r = pad(r, 60, 60, 6, 5)
    return P(r)
def bb(p):
    xs = [x for y in range(H) for x in range(W) if p[y][x][3]]; ys = [y for y in range(H) for x in range(W) if p[y][x][3]]
    return (min(xs), min(ys), max(xs), max(ys)) if xs else None
def diff(a, b, rows=range(H), dx=0, dy=0):
    n = 0
    for y in rows:
        for x in range(W):
            yy, xx = y-dy, x-dx
            cb = b[yy][xx] if 0 <= yy < H and 0 <= xx < W else T
            if a[y][x] != cb and (a[y][x][3] or cb[3]): n += 1
    return n
def head_same(fr, ref=None, n=14):
    ref = ref or fr[0]; t = bb(ref)[1]; res = []
    for f in fr:
        res.append(min(diff(ref, f, range(t, t+n), dx, dy) for dx in range(-3, 4) for dy in range(-3, 4)))
    return res
def comps(p):
    seen = set(); sizes = []
    for y in range(H):
        for x in range(W):
            if p[y][x][3] and (x, y) not in seen:
                st = [(x, y)]; seen.add((x, y)); n = 0
                while st:
                    a, b = st.pop(); n += 1
                    for i in (-1, 0, 1):
                        for j in (-1, 0, 1):
                            q = (a+i, b+j)
                            if 0 <= q[0] < W and 0 <= q[1] < H and p[q[1]][q[0]][3] and q not in seen: seen.add(q); st.append(q)
                sizes.append(n)
    return sizes
def colors(fr):
    s = set()
    for p in fr:
        for r in p:
            for c in r:
                if c[3]: s.add(c)
    return s
def contact_runs(p, ground):
    """trechos de pixels opacos nas 2 últimas linhas do chão (pés em contato)"""
    cols = [x for x in range(W) if p[ground][x][3] or p[ground-1][x][3] and p[ground][x][3]]
    cols = [x for x in range(W) if p[ground][x][3]]
    runs = []
    for x in cols:
        if runs and x - runs[-1][1] <= 1: runs[-1][1] = x
        else: runs.append([x, x])
    return runs
def slide(fr, v):
    """deriva (px) do pé plantado em coordenada de mundo, avançando v px por quadro. Usa a borda de trás (calcanhar)
    e a borda da frente de cada trecho de contato; casa trechos de quadros vizinhos pelo menor deslocamento."""
    ground = max(bb(p)[3] for p in fr); n = len(fr); drifts = []
    for i in range(n):
        a = contact_runs(fr[i], ground) if bb(fr[i])[3] == ground else []
        b = contact_runs(fr[(i+1) % n], ground) if bb(fr[(i+1) % n])[3] == ground else []
        for ra in a:
            ca = (ra[0] + ra[1]) / 2 + v*i
            best = None
            for rb in b:
                cb = (rb[0] + rb[1]) / 2 + v*(i+1)
                if best is None or abs(cb-ca) < abs(best): best = cb - ca
            if best is not None and abs(best) <= 4: drifts.append(abs(best))
    return {'v': v, 'pares': len(drifts), 'deriva_media': round(sum(drifts)/len(drifts), 2) if drifts else None,
            'deriva_max': max(drifts) if drifts else None}
def stats(fr, pal=None, rotp=None):
    b = [bb(p) for p in fr]
    cy = []
    for p in fr:
        ys = [y for y in range(H) for x in range(W) if p[y][x][3]]; cy.append(sum(ys)/len(ys))
    cs = [comps(p) for p in fr]
    out = {
     'quadros': len(fr), 'topo': [k[1] for k in b], 'base': [k[3] for k in b], 'esq': [k[0] for k in b], 'dir': [k[2] for k in b],
     'osc_centroide_y': round(max(cy)-min(cy), 2),
     'cabeca_dif_q0_px': head_same(fr),
     'cabeca_igual_q0': '%d/%d' % (sum(1 for k in head_same(fr) if k == 0), len(fr)),
     'cores': len(colors(fr)),
     'semitransp': sum(1 for p in fr for r in p for c in r if 0 < c[3] < 255),
     'borda': sum(1 for p in fr for y in range(H) for x in range(W) if p[y][x][3] and (x in (0, W-1) or y in (0, H-1))),
     'componentes': [len(k) for k in cs], 'pixels_soltos': [sum(1 for s in k if s == 1) for k in cs],
     'cortes': [diff(fr[i], fr[(i+1) % len(fr)]) for i in range(len(fr))],
    }
    if pal is not None: out['cores_fora_paleta_F2b'] = len(colors(fr) - pal)
    if rotp is not None:
        out['rot_x_q0_px'] = diff(rotp, fr[0]); out['rot_x_q0_cabeca_px'] = min(diff(rotp, fr[0], range(bb(rotp)[1], bb(rotp)[1]+14), 0, dy) for dy in range(-3, 4))
        out['rot_x_ultimo_px'] = diff(rotp, fr[-1])
    return out
def claw_x(fr):
    """x médio das garras da mão de perto (E): branco #dee9f0 nas linhas 36..42"""
    res = []
    for p in fr:
        xs = [x for y in range(36, 43) for x in range(22, 42) if p[y][x][:3] == (0xde, 0xe9, 0xf0)]
        res.append(round(sum(xs)/len(xs), 1) if xs else None)
    return res
if __name__ == '__main__':
    pal = set()
    for a in ('walk', 'attack'):
        for d in 'SNEW': pal |= colors(norm(F2B, a, d))
    for d in 'SNEW': pal |= colors([rot(F2B, d)])
    M = {'paleta_pacote_F2b_cores': len(pal)}
    packs = (('A_F2b', F2B), ('B_C10', C10), ('F6', F6), ('D_F7', F7))
    for name, pack in packs:
        M[name] = {}
        for a in ('walk', 'attack', 'idle', 'feliz', 'attack_fx'):
            for d in 'SNEW':
                if not os.path.isdir('%s/%s/%s' % (pack, a, d)): continue
                fr = norm(pack, a, d)
                if a == 'attack_fx':
                    M[name][a + '/' + d] = {'px_por_quadro': [sum(1 for r in p for c in r if c[3]) for p in fr], 'borda': sum(1 for p in fr for y in range(H) for x in range(W) if p[y][x][3] and (x in (0, W-1) or y in (0, H-1))),
                                           'cores': len(colors(fr)), 'cores_fora_paleta_F2b': len(colors(fr) - pal), 'semitransp': sum(1 for p in fr for r in p for c in r if 0 < c[3] < 255)}
                    continue
                s = stats(fr, pal, rot(pack, d))
                if a == 'walk' and d in 'EW':
                    s['deslize'] = [slide(fr if d == 'E' else [[list(reversed(r)) for r in p] for p in fr], v) for v in (2, 3, 4)]
                    if d == 'E': s['garra_mao_x'] = claw_x(fr)
                M[name][a + '/' + d] = s
        # espelho
        for a in ('walk', 'attack', 'idle'):
            if os.path.isdir('%s/%s/W' % (pack, a)) and os.path.isdir('%s/%s/E' % (pack, a)):
                e = norm(pack, a, 'E'); w = norm(pack, a, 'W')
                M[name]['espelho_%s_W_x_E_px' % a] = sum(diff([list(reversed(r)) for r in pe], pw) for pe, pw in zip(e, w))
    # híbrido F4 (C) e C10A: só S
    for name, base in (('C_F4', F4), ('C10A', C10H)):
        M[name] = {}
        for a in (('idle', 'feliz', 'ataque') if name == 'C_F4' else ('ataque_A_saida_q8',)):
            fr = [P((60, 60, [r[3:63] for r in pad(f, 64, 68, 0, 4)[2][0:60]])) for f in frames(base + '/' + a, '')]
            M[name][a + '/S'] = stats(fr, pal, rot(F2B, 'S'))
    # transições do F7
    tr = {}
    for d in 'SNEW':
        r = rot(F7, d); w = norm(F7, 'walk', d); i = norm(F7, 'idle', d); at = norm(F7, 'attack', d)
        tr[d] = {'idle_q0_x_rot': diff(r, i[0]), 'idle_ultimo_x_walk_q0': diff(i[-1], w[0]), 'rot_x_walk_q0': diff(r, w[0]),
                 'walk_q7_x_q0': diff(w[7], w[0]), 'rot_x_attack_q0': diff(r, at[0]), 'attack_q8_x_rot': diff(at[8], r),
                 'cabeca_rot_x_walk_q0': min(diff(r, w[0], range(bb(r)[1], bb(r)[1]+14), 0, dy) for dy in range(-3, 4)),
                 'base_rot': bb(r)[3], 'base_walk': sorted(set(bb(p)[3] for p in w)), 'base_idle': sorted(set(bb(p)[3] for p in i)), 'base_attack': sorted(set(bb(p)[3] for p in at))}
    fz = norm(F7, 'feliz', 'S'); r = rot(F7, 'S')
    tr['S']['rot_x_feliz_q0'] = diff(r, fz[0]); tr['S']['feliz_q9_x_rot'] = diff(fz[-1], r)
    M['transicoes_F7'] = tr
    # escala (G-2)
    M['escala_F7_px'] = {d: {'altura': bb(rot(F7, d))[3]-bb(rot(F7, d))[1]+1, 'largura': bb(rot(F7, d))[2]-bb(rot(F7, d))[0]+1} for d in 'SNEW'}
    json.dump(M, open(O + '/metricas_f7.json', 'w'), ensure_ascii=False, indent=1)
    def show(name, key, fields):
        s = M[name].get(key)
        if s: print(name, key, {f: s.get(f) for f in fields})
    for name in ('A_F2b', 'B_C10', 'F6', 'D_F7'):
        for d in 'SNE':
            show(name, 'walk/' + d, ['cabeca_igual_q0', 'topo', 'base', 'osc_centroide_y', 'cores', 'cores_fora_paleta_F2b', 'componentes', 'pixels_soltos', 'rot_x_q0_cabeca_px', 'cortes', 'semitransp', 'borda'])
        show(name, 'walk/E', ['deslize', 'garra_mao_x'])
        for d in 'SNE': show(name, 'attack/' + d, ['topo', 'base', 'cores', 'cores_fora_paleta_F2b', 'componentes', 'pixels_soltos', 'rot_x_q0_px', 'rot_x_ultimo_px', 'cortes', 'borda'])
        for k in M[name]:
            if k.startswith('espelho') or k.startswith('attack_fx') or k.startswith('idle') or k.startswith('feliz'): print(name, k, M[name][k] if not isinstance(M[name][k], dict) else {f: M[name][k].get(f) for f in ('cabeca_igual_q0', 'base', 'cores', 'cores_fora_paleta_F2b', 'componentes', 'pixels_soltos', 'cortes', 'px_por_quadro', 'borda', 'rot_x_q0_px', 'rot_x_ultimo_px')})
    for name in ('C_F4', 'C10A'):
        for k, s in M[name].items(): print(name, k, {f: s.get(f) for f in ('base', 'cores', 'cortes', 'rot_x_q0_px', 'rot_x_ultimo_px', 'componentes')})
    print(json.dumps(M['transicoes_F7'])); print(M['escala_F7_px'])
