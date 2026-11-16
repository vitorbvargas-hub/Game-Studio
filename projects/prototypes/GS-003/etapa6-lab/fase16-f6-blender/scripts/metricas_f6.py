"""F6: as mesmas medidas do C10 (metricas_c10.py), para F2b, B (C10) e F6, em S, E e N.
Uso: python3 metricas_f6.py   -> metricas_f6.json + tabela no terminal."""
import sys, os, json
sys.path.insert(0, '/home/openclaw/projects/GameStudio/workspaces/game-art/tools')
from pxpng import load_png_rgba
HERE = os.path.dirname(os.path.abspath(__file__)); O = os.path.dirname(HERE); L = os.path.dirname(O)
PACKS = {'F2b': L + '/fase12-comando9/f2/pacote_agumon_f2', 'B_C10': L + '/fase13-comando10/pacote_agumon_c10', 'F6': O + '/pacote_agumon_f6'}
def load(p):
    w, h, px = load_png_rgba(p); return w, h, [list(r) for r in px]
def frames(pack, anim, d):
    dd = os.path.join(pack, anim, d); return [load(os.path.join(dd, f)) for f in sorted(os.listdir(dd)) if f.endswith('.png')]
def opq(px): return [(x, y) for y in range(len(px)) for x in range(len(px[0])) if px[y][x][3]]
def comps(px):
    s = set(opq(px)); seen = set(); out = []
    for p in s:
        if p in seen: continue
        st = [p]; seen.add(p); n = 0
        while st:
            x, y = st.pop(); n += 1
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    q = (x + dx, y + dy)
                    if q in s and q not in seen: seen.add(q); st.append(q)
        out.append(n)
    return sorted(out, reverse=True)
def sole(px):
    h = len(px); w = len(px[0]); rows = {}
    for y in range(h):
        for x in range(w):
            if px[y][x][3] and (y + 1 >= h or not px[y + 1][x][3]): rows[y] = rows.get(y, 0) + 1
    return sorted(y for y, n in rows.items() if n >= 4 and y >= h - 15)
def feet_groups(px, ground):
    h = len(px); w = len(px[0])
    cols = sorted({x for x in range(w) for y in (ground - 1, ground) if 0 <= y < h and px[y][x][3]})
    g = []
    for x in cols:
        if g and x == g[-1][-1] + 1: g[-1].append(x)
        else: g.append([x])
    return len(g)
def colors(frs):
    s = set()
    for _, _, px in frs:
        for r in px:
            for p in r:
                if p[3]: s.add(tuple(p[:3]))
    return s
def orphans(px):
    """pixel de cor isolado: opaco, nenhum dos 8 vizinhos tem a mesma cor (olho/garra contam; é a medida crua)."""
    h = len(px); w = len(px[0]); n = 0
    for y in range(h):
        for x in range(w):
            c = px[y][x]
            if not c[3]: continue
            same = False
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    if (dx or dy) and 0 <= x + dx < w and 0 <= y + dy < h and px[y + dy][x + dx] == c: same = True
            if not same: n += 1
    return n
# paleta do F2b (rotações + walk + attack, 4 direções)
PAL = set()
for a in ('walk', 'attack'):
    for k in 'SENW': PAL |= colors(frames(PACKS['F2b'], a, k))
for k in 'SENW': PAL |= colors([load(PACKS['F2b'] + '/rotations/%s.png' % k)])
res = {'paleta_F2b_cores': len(PAL)}
for tag, P in PACKS.items():
    res[tag] = {}
    for d in 'SEN':
        fr = frames(P, 'walk', d)
        cent = []; top = []; low = []; soles = []; feet = []; comp = []; semi = 0; border = 0; orph = []
        for w, h, px in fr:
            o = opq(px); ys = [y for _, y in o]
            cent.append(round(sum(ys) / len(ys), 1)); top.append(min(ys)); low.append(max(ys)); soles.append(sole(px))
            feet.append(feet_groups(px, max(ys))); comp.append(len(comps(px))); orph.append(orphans(px))
            semi += sum(1 for y in range(h) for x in range(w) if 0 < px[y][x][3] < 255)
            border += sum(1 for (x, y) in o if x in (0, w - 1) or y in (0, h - 1))
        W_ = fr[0][0]
        def head(px, t): return [tuple(map(tuple, px[y])) for y in range(t, t + 14)]
        h0 = head(fr[0][2], top[0]); same = [head(f[2], t) == h0 for f, t in zip(fr, top)]
        # quanto da cabeça muda (px diferentes do q0 nas 14 linhas do topo, alinhadas pelo topo)
        diff = [sum(1 for a, b in zip(h0, head(f[2], t)) for p, q in zip(a, b) if p != q) for f, t in zip(fr, top)]
        n = len(fr)
        cuts = [sum(1 for y in range(fr[0][1]) for x in range(W_) if tuple(fr[i][2][y][x]) != tuple(fr[(i + 1) % n][2][y][x])) for i in range(n)]
        cs = colors(fr)
        res[tag]['walk_' + d] = dict(canvas=[fr[0][0], fr[0][1]], quadros=n, centroide_y=cent, amp_centroide=round(max(cent) - min(cent), 1),
            topo=top, amp_topo=max(top) - min(top), px_mais_baixo=low, amp_px_mais_baixo=max(low) - min(low), linhas_de_sola=soles,
            grupos_de_pe_no_chao=feet, componentes=comp, pixels_de_cor_isolados=orph, semitransparentes=semi, px_na_borda=border,
            cabeca_identica_ao_q0=sum(same), cabeca_px_diferentes_do_q0=diff, cortes_entre_quadros=cuts, cores=len(cs), cores_fora_da_paleta_F2b=len(cs - PAL))
    E = frames(P, 'walk', 'E'); Wf = frames(P, 'walk', 'W')
    res[tag]['W_igual_flip_E'] = all([list(reversed(r)) for r in E[i][2]] == [list(r) for r in Wf[i][2]] for i in range(len(E)))
    rot = {}
    for d in 'SENW':
        w, h, px = load(P + '/rotations/%s.png' % d); o = opq(px); ys = [y for _, y in o]; xs = [x for x, _ in o]
        # largura da cabeça = maior largura opaca nas 12 linhas do topo; altura da cabeça não é separável sem rótulo
        hw = max(max(x for x, y in o if y == yy) - min(x for x, y in o if y == yy) + 1 for yy in range(min(ys), min(ys) + 12))
        cs = colors([(w, h, px)])
        rot[d] = dict(canvas=[w, h], altura=max(ys) - min(ys) + 1, largura=max(xs) - min(xs) + 1, largura_cabeca_topo12=hw, cores=len(cs),
                      cores_fora=len(cs - PAL), componentes=len(comps(px)), isolados=orphans(px))
    res[tag]['rotations'] = rot
    allc = set()
    for a in ('walk', 'attack'):
        for k in 'SENW': allc |= colors(frames(P, a, k))
    for k in 'SENW': allc |= colors([load(P + '/rotations/%s.png' % k)])
    res[tag]['cores_pacote_inteiro'] = len(allc); res[tag]['cores_pacote_fora_da_paleta_F2b'] = len(allc - PAL)
# deslizamento do pé medido no modelo (só F6): tornozelo em px de tela, quadros de apoio
try:
    meta = json.load(open(O + '/raw/meta.json')); ft = meta['tornozelo_tela_px']['E']
    xs = [ft[f]['L'][0] for f in range(5)]; steps = [round(xs[i + 1] - xs[i], 2) for i in range(4)]
    res['F6']['pe_de_apoio_E_modelo'] = dict(x_tornozelo_L_q0a4=xs, passo_por_quadro=steps, altura_tornozelo_q0a4=[ft[f]['L'][2] for f in range(5)])
    res['F6']['modelo'] = {k: meta[k] for k in ('pecas', 'ossos', 'vertices', 'faces', 'blender', 'tempos_s', 'pitch', 'px')}
except Exception as e: res['F6']['pe_de_apoio_E_modelo'] = 'sem meta: %s' % e
json.dump(res, open(O + '/metricas_f6.json', 'w'), ensure_ascii=False, indent=1)
for tag in PACKS:
    print('==', tag, 'W=flip(E):', res[tag]['W_igual_flip_E'], 'cores pacote:', res[tag]['cores_pacote_inteiro'], 'fora:', res[tag]['cores_pacote_fora_da_paleta_F2b'])
    for d in 'SEN':
        m = res[tag]['walk_' + d]
        print(' walk', d, 'ampC', m['amp_centroide'], 'topo', m['topo'], 'baixo', m['px_mais_baixo'], 'cabeca=q0', m['cabeca_identica_ao_q0'], '/', m['quadros'],
              'difcab', m['cabeca_px_diferentes_do_q0'], 'comp', m['componentes'], 'isol', m['pixels_de_cor_isolados'], 'semi', m['semitransparentes'], 'borda', m['px_na_borda'],
              'cores', m['cores'], 'fora', m['cores_fora_da_paleta_F2b'], 'pes', m['grupos_de_pe_no_chao'], 'cortes', m['cortes_entre_quadros'])
    print(' rot', {d: (v['altura'], v['largura'], v['largura_cabeca_topo12'], v['cores'], v['isolados']) for d, v in res[tag]['rotations'].items()})
print('pe F6', res['F6'].get('pe_de_apoio_E_modelo'))
