"""C10: métricas antes (F2b) x depois (C10) da vista lateral."""
import sys, os, json
sys.path.insert(0, os.path.dirname(__file__)); from lib import *
A = O + '/backup_f2b/pacote_agumon_f2'; B = O + '/pacote_agumon_c10'
def opq(px): return [(x,y) for y in range(len(px)) for x in range(len(px[0])) if px[y][x][3]]
def comps(px):
    s = set(opq(px)); seen = set(); out = []
    for p in s:
        if p in seen: continue
        st = [p]; seen.add(p); n = 0
        while st:
            x,y = st.pop(); n += 1
            for dx in (-1,0,1):
                for dy in (-1,0,1):
                    q = (x+dx,y+dy)
                    if q in s and q not in seen: seen.add(q); st.append(q)
        out.append(n)
    return sorted(out, reverse=True)
def sole(px):
    # linha de sola = linhas com >= 4 px opacos que são a base de uma coluna (pixel opaco sem opaco abaixo)
    h = len(px); w = len(px[0]); rows = {}
    for y in range(h):
        for x in range(w):
            if px[y][x][3] and (y+1 >= h or not px[y+1][x][3]): rows[y] = rows.get(y,0)+1
    return sorted(y for y,n in rows.items() if n >= 4 and y >= h-15)
def feet_gap(px, ground):
    # colunas opacas nas 2 linhas acima da linha mais baixa: grupos separados = pés distintos
    h = len(px); w = len(px[0])
    cols = sorted({x for x in range(w) for y in (ground-1, ground) if 0<=y<h and px[y][x][3]})
    groups = []; 
    for x in cols:
        if groups and x == groups[-1][-1]+1: groups[-1].append(x)
        else: groups.append([x])
    return len(groups), [ (g[0], g[-1]) for g in groups]
def colors(frs):
    s = set()
    for _,_,px in frs:
        for r in px:
            for p in r:
                if p[3]: s.add(tuple(p[:3]))
    return s
res = {}
allA = set(); 
for d in ('walk','attack'):
    for k in 'SENW':
        try: allA |= colors(frames(A, d, k))
        except Exception: pass
for nm in 'SENW': allA |= colors([load(A+'/rotations/%s.png'%nm)])
for tag, P in (('F2b', A), ('C10', B)):
    fr = frames(P, 'walk', 'E')
    cent = []; top = []; soles = []; low = []; feet = []; comp = []; semi = 0; border = 0
    for w,h,px in fr:
        o = opq(px); ys = [y for _,y in o]
        cent.append(round(sum(ys)/len(ys),1)); top.append(min(ys)); low.append(max(ys)); soles.append(sole(px))
        feet.append(feet_gap(px, max(ys))[0]); comp.append(len(comps(px)))
        semi += sum(1 for y in range(h) for x in range(w) if 0 < px[y][x][3] < 255)
        border += sum(1 for (x,y) in o if x in (0,w-1) or y in (0,h-1))
    # cabeça idêntica? linhas acima do queixo (topo .. topo+18) comparadas ao q0 alinhado pelo topo
    def head(px, t): return [tuple(map(tuple, px[y][15:50])) for y in range(t, t+18)]
    h0 = head(fr[0][2], top[0]); headsame = [head(f[2], t) == h0 for f, t in zip(fr, top)]
    cuts = [sum(1 for y in range(60) for x in range(60) if tuple(fr[i][2][y][x]) != tuple(fr[(i+1)%8][2][y][x])) for i in range(8)]
    W = frames(P, 'walk', 'W')
    mirror_ok = all([list(reversed(r)) for r in fr[i][2]] == [list(r) for r in W[i][2]] for i in range(8))
    cs = colors(fr)
    res[tag] = dict(centroide=cent, amp_centroide=round(max(cent)-min(cent),1), topo=top, amp_topo=max(top)-min(top),
        px_mais_baixo=low, linhas_de_sola=soles, grupos_de_pe_no_chao=feet, componentes=comp, semitransparentes=semi,
        px_na_borda=border, cabeca_identica_ao_q0=headsame, cortes_entre_quadros=cuts, W_igual_flip_E=mirror_ok,
        cores_walkE=len(cs), cores_fora_da_paleta_F2b=len(cs - allA))
rot = {}
for tag, P in (('F2b', A), ('C10', B)):
    w,h,px = load(P+'/rotations/E.png'); o = opq(px); ys=[y for _,y in o]; xs=[x for x,_ in o]
    rot[tag] = dict(canvas=(w,h), bbox=(min(xs),min(ys),max(xs),max(ys)), altura=max(ys)-min(ys)+1, cores=len(colors([(w,h,px)])),
                    cores_fora=len(colors([(w,h,px)])-allA), componentes=len(comps(px)))
res['rotations_E'] = rot
# alturas em px (G-2): bbox da rotação S/N/E
alt = {}
for nm in 'SNE':
    for tag, P in (('F2b', A), ('C10', B)):
        w,h,px = load(P+'/rotations/%s.png'%nm); ys=[y for _,y in opq(px)]
        alt['%s_%s'%(nm,tag)] = max(ys)-min(ys)+1
res['altura_rotacoes_px'] = alt
json.dump(res, open(O+'/metricas_c10.json','w'), ensure_ascii=False, indent=1)
for k,v in res.items(): print(k, json.dumps(v, ensure_ascii=False))
