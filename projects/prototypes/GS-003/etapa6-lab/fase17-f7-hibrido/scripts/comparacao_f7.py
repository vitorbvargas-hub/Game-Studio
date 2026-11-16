"""F7: comparação A=F2b, B=C10, C=F4 (híbrido S), D=F7, + F6 como referência de movimento.
Mesma escala, mesmo fundo, mesma velocidade por prancha. Método sem a animação aparece como N/A (sem nota)."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
sys.path.insert(0, L + '/fase13-comando10/scripts')
from font35 import text
import metricas_f7 as M, attack_f7 as AT
OUT = O + '/comparacao'; os.makedirs(OUT, exist_ok=True)
BG = (127, 166, 90, 255); BG2 = (112, 150, 78, 255); HD = (40, 52, 30, 255); NA = (104, 138, 74, 255)
CW = 60
METH = [('A F2B', 'A'), ('B C10', 'B'), ('C F4', 'C'), ('D F7', 'D'), ('F6 REF', 'F')]
PK = {'A': F2B, 'B': C10, 'D': F7, 'F': F6}
def cell(m, anim, d):
    """lista de quadros (px 60x60) ou None"""
    if m == 'C':
        if d != 'S': return None
        sub = {'idle': 'idle', 'feliz': 'feliz', 'attack': 'ataque'}.get(anim)
        if not sub: return None
        return [M.P((60, 60, [r[3:63] for r in pad(f, 64, 68, 0, 4)[2][0:60]])) for f in frames(F4 + '/' + sub, '')]
    if anim == 'rot': return [M.rot(PK[m], d)]
    if not os.path.isdir('%s/%s/%s' % (PK[m], anim, d)): return None
    fr = M.norm(PK[m], anim, d)
    if m == 'D' and anim == 'attack':
        fx = M.norm(F7, 'attack_fx', d)
        fr = [AT.comp((60, 60, b), (60, 60, f), d == 'N')[2] for b, f in zip(fr, fx)]
    return fr
def canvas(w, h, c=BG): return [[c]*w for _ in range(h)]
def blit(cv, p, ox, oy, sc):
    for y in range(len(p)):
        row = p[y]
        for x in range(len(row)):
            c = row[x]
            if c[3]:
                for j in range(sc):
                    r = cv[oy + y*sc + j]
                    for i in range(sc): r[ox + x*sc + i] = c
def fill(cv, x0, y0, w, h, c):
    for y in range(y0, y0+h):
        r = cv[y]
        for x in range(x0, x0+w): r[x] = c
def grid_frame(cells, rows, cols, sc, k, hdr, side):
    """cells[(r,c)] = lista de quadros ou None; desenha o quadro k (mod len)"""
    cw = CW*sc; lab = 1 if sc == 1 else 2; top = 7*lab + 2; left = 6*lab + 2 if side else 0
    Wd = left + cols*cw; Hd = top + rows*cw
    cv = canvas(Wd, Hd); fill(cv, 0, 0, Wd, top, HD)
    for c in range(cols): text(cv, Wd, Hd, left + c*cw + 2, 1, hdr[c], scale=lab)
    for r in range(rows):
        if side: text(cv, Wd, Hd, 1, top + r*cw + 2, side[r], scale=lab, color=(250, 250, 250, 255))
        for c in range(cols):
            ox, oy = left + c*cw, top + r*cw
            fill(cv, ox, oy + 50*sc, cw, sc, BG2)          # linha do chão (y=50, logo abaixo da âncora y=49)
            fr = cells.get((r, c))
            if fr is None:
                fill(cv, ox + 2, oy + 2, cw - 4, cw - 4, NA); text(cv, Wd, Hd, ox + cw//2 - 6*lab, oy + cw//2 - 3*lab, 'N/A', scale=lab, color=(60, 80, 44, 255))
            else: blit(cv, fr[k % len(fr)], ox, oy, sc)
    return cv, Wd, Hd
def grid_gif(name, anim, dirs, meths, delays, scs=(1, 4)):
    cells = {}
    for r, d in enumerate(dirs):
        for c, (lab, m) in enumerate(meths): cells[(r, c)] = cell(m, anim, d)
    n = max(len(v) for v in cells.values() if v)
    assert all(len(v) == n for v in cells.values() if v), (name, [(k, len(v)) for k, v in cells.items() if v])
    for sc in scs:
        fr = []
        for k in range(n):
            cv, Wd, Hd = grid_frame(cells, len(dirs), len(meths), sc, k, [l for l, _ in meths], list(dirs))
            fr.append(cv)
        write_gif('%s/%s_%dx.gif' % (OUT, name, sc), fr, Wd, Hd, delays if isinstance(delays, list) else [delays]*n)
    print('gif', name, n)
def sheet_methods(name, anim, d, meths, scs=(1, 4)):
    rows = [(lab, cell(m, anim, d)) for lab, m in meths]
    n = max(len(v) for _, v in rows if v)
    for sc in scs:
        cells = {}
        for r, (lab, v) in enumerate(rows):
            for c in range(n): cells[(r, c)] = [v[c]] if v and c < len(v) else None
        cv, Wd, Hd = grid_frame(cells, len(rows), n, sc, 0, ['Q%d' % i for i in range(n)], [l[0] for l, _ in rows])
        save_png_rgba('%s/%s_%dx.png' % (OUT, name, sc), Wd, Hd, cv)
def merged(timelines):
    """timelines: lista de [(px, ms)] -> quadros combinados [(lista px por coluna, ms)]"""
    ev = set(); tot = max(sum(d for _, d in t) for t in timelines)
    for t in timelines:
        acc = 0
        for _, d in t: ev.add(acc); acc += d
    ev = sorted(e for e in ev if e < tot) + [tot]; out = []
    for a, b in zip(ev, ev[1:]):
        cur = []
        for t in timelines:
            acc = 0; sel = t[-1][0]
            for p, d in t:
                if acc <= a < acc + d: sel = p; break
                acc += d
            cur.append(sel)
        out.append((cur, b - a))
    return out
if __name__ == '__main__':
    meta = json.load(open(F7 + '/pacote.json'))
    ALL = METH
    # 1) rotações (pose parada)
    for sc in (1, 4):
        cells = {(r, c): (cell(m, 'rot', d) if m != 'C' else (cell('C', 'idle', d)[:1] if d == 'S' else None)) for r, d in enumerate('SNEW') for c, (lab, m) in enumerate(ALL)}
        cv, Wd, Hd = grid_frame(cells, 4, len(ALL), sc, 0, [l for l, _ in ALL], list('SNEW'))
        save_png_rgba('%s/rotacoes_ABCD_%dx.png' % (OUT, sc), Wd, Hd, cv)
    # 2) GIFs por animação, 4 direções, mesma velocidade (110 ms) em todos os métodos
    grid_gif('walk_ABCD_SNEW', 'walk', 'SNEW', ALL, 110)
    grid_gif('attack_ABCD_SNEW', 'attack', 'SNEW', ALL, 110)
    grid_gif('idle_ABCD_SNEW', 'idle', 'SNEW', ALL, meta['anims']['idle']['delays_ms']['S'])
    grid_gif('feliz_ABCD_S', 'feliz', 'S', ALL, meta['anims']['feliz']['delays_ms']['S'])
    # ataque S com os tempos próprios (C e D usam a mesma lista)
    grid_gif('attack_S_tempos_proprios_CD', 'attack', 'S', [('C F4', 'C'), ('D F7', 'D')], meta['anims']['attack']['delays_ms']['S'])
    # 3) folhas quadro a quadro por método
    for d in 'SNEW':
        sheet_methods('folha_walk_%s' % d, 'walk', d, ALL)
        sheet_methods('folha_attack_%s' % d, 'attack', d, ALL)
        sheet_methods('folha_idle_%s' % d, 'idle', d, [('C F4', 'C'), ('D F7', 'D')])
    sheet_methods('folha_feliz_S', 'feliz', 'S', [('C F4', 'C'), ('D F7', 'D')])
    # 4) camada de fogo isolada
    for sc in (1, 4):
        cells = {(r, c): [M.norm(F7, 'attack_fx', d)[c]] for r, d in enumerate('SNEW') for c in range(9)}
        cv, Wd, Hd = grid_frame(cells, 4, 9, sc, 0, ['Q%d' % i for i in range(9)], list('SNEW'))
        save_png_rgba('%s/F7_attack_fx_camada_%dx.png' % (OUT, sc), Wd, Hd, cv)
    # 5) ciclo completo do F7: idle -> walk x2 -> ataque -> idle, 4 direções, tempos do pacote
    tls = []
    for d in 'SNEW':
        idl = cell('D', 'idle', d); wk = cell('D', 'walk', d); at = cell('D', 'attack', d)
        di = meta['anims']['idle']['delays_ms'][d]; da = meta['anims']['attack']['delays_ms'][d]
        t = list(zip(idl, di)) + [(p, 110) for p in wk]*2 + list(zip(at, da)) + list(zip(idl, di))
        tls.append(t)
    mg = merged(tls)
    for sc in (1, 4):
        fr = []
        for cur, ms in mg:
            cells = {(0, c): [cur[c]] for c in range(4)}
            cv, Wd, Hd = grid_frame(cells, 1, 4, sc, 0, ['S', 'N', 'E', 'W'], None)
            fr.append(cv)
        write_gif('%s/F7_ciclo_idle_walk_ataque_idle_SNEW_%dx.gif' % (OUT, sc), fr, Wd, Hd, [ms for _, ms in mg])
    print('ciclo', len(mg), 'quadros', sum(ms for _, ms in mg), 'ms')
    # 6) pista: caminhada E com deslocamento real (pé plantado), 2 ciclos
    for sc in (1, 3):
        rows = [('A F2B 4PX', 'A', 4), ('B C10 4PX', 'B', 4), ('D F7 3PX', 'D', 3), ('F6 3PX', 'F', 3)]
        Wp = 60 + 16*4 + 8; lab = 1 if sc == 1 else 2; fr = []
        for k in range(16):
            cv = canvas(Wp*sc, len(rows)*60*sc)
            for r, (lb, m, v) in enumerate(rows):
                oy = r*60*sc
                fill(cv, 0, oy + 50*sc, Wp*sc, sc, BG2)
                for tx in range(0, Wp, 8): fill(cv, tx*sc, oy + 51*sc, sc, 2*sc, HD)      # marcas no chão a cada 8 px
                blit(cv, cell(m, 'walk', 'E')[k % 8], (4 + v*k)*sc, oy, sc)
                text(cv, Wp*sc, len(rows)*60*sc, 2, oy + 2, lb, scale=lab)
            fr.append(cv)
        write_gif('%s/walk_E_pista_ABD_F6_%dx.gif' % (OUT, sc), fr, Wp*sc, len(rows)*60*sc, [110]*16)
    print('ok')
