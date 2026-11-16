"""F7v2: comparações. (1) F7 x F7v2; (2) walk S/N: F2b x original (rig F7) x experimental; (3) ciclo com tempos >= 40 ms;
(4) demonstração do ataque com o projétil (simulação: o deslocamento real é do jogo)."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
sys.path.append(L + '/fase17-f7-hibrido/scripts')      # só leitura: funções de grade da F7
import comparacao_f7 as CF, metricas_f7 as M, build_f7v2 as B
from font35 import text
OUT = O + '/comparacao'; PJD = O + '/projetil_pepper_breath'
CF.OUT = OUT
def px(fr): return [M.P(f) for f in fr]
def gif_cells(name, cells, rows, cols, hdr, side, delays, scs=(1, 4)):
    n = max(len(v) for v in cells.values() if v)
    for sc in scs:
        fr = []
        for k in range(n):
            cv, Wd, Hd = CF.grid_frame(cells, rows, cols, sc, k, hdr, side); fr.append(cv)
        write_gif('%s/%s_%dx.gif' % (OUT, name, sc), fr, Wd, Hd, delays if isinstance(delays, list) else [delays]*n)
def sheet_rows(name, rows, scs=(1, 4)):
    n = max(len(v) for _, v in rows)
    for sc in scs:
        cells = {(r, c): [v[c]] for r, (lab, v) in enumerate(rows) for c in range(len(v))}
        cv, Wd, Hd = CF.grid_frame(cells, len(rows), n, sc, 0, ['Q%d' % i for i in range(n)], [l for l, _ in rows])
        save_png_rgba('%s/%s_%dx.png' % (OUT, name, sc), Wd, Hd, cv)
# ---------- cena com projétil (tick fixo) ----------
def load_proj():
    P = {d: {'nascer': px(frames(PJD, 'nascer', d)), 'voo': px(frames(PJD, 'voo', d))} for d in 'SNEW'}
    return P, px(frames(PJD, 'impacto'))
def at_time(seq, t, loop=False):
    """seq = [(quadro, ms)] -> quadro no instante t"""
    tot = sum(d for _, d in seq)
    if loop: t %= tot
    acc = 0
    for f, d in seq:
        if acc <= t < acc + d: return f
        acc += d
    return None
def scene(meta, pj, d, body_seq, t_fire_list, t, CW, MX, MY, sc, cv, ox, oy, alcance=30, vel=100):
    """desenha em cv a célula da direção d no instante t. body_seq = [(px, ms)]; t_fire_list = instantes de disparo."""
    P, I = load_proj.cache
    dirv = pj['direcao'][d]; org = pj['disparo']['origem_boca_no_canvas_do_sprite'][d]
    body = at_time(body_seq, t) or body_seq[-1][0]
    layers = []
    for tf in t_fire_list:
        dt = t - tf
        if dt < 0: continue
        nas = list(zip(P[d]['nascer'], pj['anims']['nascer']['delays_ms'])); tn = sum(m for _, m in nas)
        tfly = alcance * 1000 / vel
        if dt < tn: f, dist = at_time(nas, dt), 0
        elif dt < tn + tfly:
            f = at_time(list(zip(P[d]['voo'], pj['anims']['voo']['delays_ms'])), dt - tn, True); dist = round((dt - tn) * vel / 1000)
        else:
            f = at_time(list(zip(I, pj['anims']['impacto']['delays_ms'])), dt - tn - tfly); dist = alcance
        if f is None: continue
        layers.append((f, org[0] - 12 + dirv[0]*dist, org[1] - 12 + dirv[1]*dist))
    def draw_proj():
        for f, x0, y0 in layers: CF.blit(cv, f, ox + (MX + x0)*sc, oy + (MY + y0)*sc, sc)
    if d == 'N': draw_proj()
    CF.blit(cv, body, ox + MX*sc, oy + MY*sc, sc)
    if d != 'N': draw_proj()
def scene_gif(path, meta, pj, seqs, fires, sc, tick=40, CW=124, CH=124, MX=32, MY=38):
    tot = max(sum(m for _, m in s) for s in seqs.values()); lab = 1 if sc == 1 else 2; top = 7*lab + 2
    Wd, Hd = 4*CW*sc, top + CH*sc; out = []
    for t in range(0, tot, tick):
        cv = CF.canvas(Wd, Hd); CF.fill(cv, 0, 0, Wd, top, CF.HD)
        for c, d in enumerate('SNEW'):
            text(cv, Wd, Hd, c*CW*sc + 2, 1, d, scale=lab)
            CF.fill(cv, c*CW*sc, top + (MY + 50)*sc, CW*sc, sc, CF.BG2)
            scene(meta, pj, d, seqs[d], fires[d], t, CW, MX, MY, sc, cv, c*CW*sc, top)
        out.append(cv)
    write_gif(path, out, Wd, Hd, [tick]*len(out)); print(os.path.basename(path), len(out), 'quadros', tick, 'ms')
def storyboard():
    meta = json.load(open(F7 + '/pacote.json')); pj = json.load(open(PJD + '/projetil.json')); load_proj.cache = load_proj()
    CW = CH = 124; MX, MY = 32, 38; sc = 2; offs = [-120, 0, 60, 160, 280, 420, 500, 640]
    Wd, Hd = len(offs)*CW*sc, 4*CH*sc; cv = CF.canvas(Wd, Hd)
    for r, d in enumerate('SNEW'):
        at = M.norm(F7, 'attack', d); da = meta['anims']['attack']['delays_ms'][d]; idl = M.norm(F7, 'idle', d)
        seq = list(zip(at, da)) + [(idl[0], 600)]; tf = pj['disparo']['tempo_desde_o_inicio_do_ataque_ms'][d]
        for c, o in enumerate(offs):
            CF.fill(cv, c*CW*sc, (r*CH + MY + 50)*sc, CW*sc, sc, CF.BG2)
            scene(meta, pj, d, seq, [tf], tf + o, CW, MX, MY, sc, cv, c*CW*sc, r*CH*sc)
            text(cv, Wd, Hd, c*CW*sc + 2, r*CH*sc + 2, '%s T%+d' % (d, o), scale=2)
    save_png_rgba(PJD + '/demo_ataque_com_projetil_quadros_chave_2x.png', Wd, Hd, cv)
if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    if 'story' in sys.argv: storyboard(); sys.exit()
    meta = json.load(open(F7 + '/pacote.json')); pj = json.load(open(PJD + '/projetil.json'))
    load_proj.cache = load_proj()
    # (2) walk S/N: F2b x original x experimental
    wsn = B.walk_sn(); cols = []; hdr = []
    for d in 'SN':
        cols += [M.norm(F2B, 'walk', d), px(wsn[(d, 'original')]), px(wsn[(d, 'experimental')])]
        hdr += [d + ' F2B', d + ' ORIG F7', d + ' EXPER']
        for v in ('original', 'experimental'):
            for i, f in enumerate(wsn[(d, v)]): save('%s/walk_SN/%s_%s/frame_%03d.png' % (OUT, d, v, i), f)
        sheet_rows('folha_walk_%s_F2b_original_experimental' % d, [('F', M.norm(F2B, 'walk', d)), ('O', px(wsn[(d, 'original')])), ('X', px(wsn[(d, 'experimental')]))])
    gif_cells('walk_SN_F2b_original_experimental', {(0, c): v for c, v in enumerate(cols)}, 1, 6, hdr, None, 110)
    # pista vertical: S andando para baixo (3 px/quadro, como a walk E), original x experimental
    for sc in (1, 4):
        fr = []; Hp = 60 + 16*3 + 8
        for k in range(16):
            cv = CF.canvas(2*60*sc, Hp*sc)
            for c, v in enumerate(('original', 'experimental')):
                for ty in range(0, Hp, 8): CF.fill(cv, (c*60 + 2)*sc, ty*sc, 2*sc, sc, CF.HD)
                CF.blit(cv, px(wsn[('S', v)])[k % 8], c*60*sc, (3*k)*sc, sc)
            fr.append(cv)
        write_gif('%s/walk_S_pista_original_experimental_%dx.gif' % (OUT, sc), fr, 2*60*sc, Hp*sc, [110]*16)
    # (1) F7 x F7v2
    for a, dl in (('walk', 110), ('attack', 110)):
        cells = {}
        for r, d in enumerate('SNEW'):
            cells[(r, 0)] = M.norm(F7OLD, a, d); cells[(r, 1)] = M.norm(F7, a, d)
        gif_cells('F7_x_F7v2_%s_SNEW_corpo' % a, cells, 4, 2, ['F7', 'F7V2'], list('SNEW'), dl)
    for d in 'SN':
        sheet_rows('folha_attack_%s_F7_x_F7v2_corpo' % d, [('7', M.norm(F7OLD, 'attack', d)), ('2', M.norm(F7, 'attack', d))])
    import zoomv
    a7 = frames(F7OLD, 'attack', 'S'); a2 = frames(F7, 'attack', 'S')
    save(OUT + '/zoom10x_attack_S_q3_q4_F7_x_F7v2.png', sheet([zoomv.crop(f, 14, 12, 45, 51) for f in (a7[3], a2[3], a7[4], a2[4])], 10, cols=4))
    rows = [(0, c) for c in range(1)]
    cells = {}
    for r, d in enumerate('SNEW'):
        cells[(r, 0)] = [M.rot(F7OLD, d)]; cells[(r, 1)] = [M.rot(F7, d)]
    for sc in (1, 4):
        cv, Wd, Hd = CF.grid_frame(cells, 4, 2, sc, 0, ['F7', 'F7V2'], list('SNEW')); save_png_rgba('%s/F7_x_F7v2_rotacoes_%dx.png' % (OUT, sc), Wd, Hd, cv)
    # (3) ciclo idle -> walk x2 -> ataque (+ projétil simulado) -> idle
    seqs = {}; fires = {}; atk = {}; atk_f = {}
    for d in 'SNEW':
        idl = M.norm(F7, 'idle', d); wk = M.norm(F7, 'walk', d); at = M.norm(F7, 'attack', d)
        di = meta['anims']['idle']['delays_ms'][d]; da = meta['anims']['attack']['delays_ms'][d]
        pre = list(zip(idl, di)) + [(p, 110) for p in wk]*2
        seqs[d] = pre + list(zip(at, da)) + list(zip(idl, di))
        t0 = sum(m for _, m in pre); fires[d] = [t0 + pj['disparo']['tempo_desde_o_inicio_do_ataque_ms'][d]]
        atk[d] = list(zip(at, da)) + [(idl[0], 500)]; atk_f[d] = [pj['disparo']['tempo_desde_o_inicio_do_ataque_ms'][d]]
        # por direção, tempos EXATOS do pacote (só o corpo; todos os delays >= 90 ms)
        for sc in (1, 4):
            fr = []
            for p, ms in seqs[d]:
                cv = CF.canvas(60*sc, 60*sc); CF.fill(cv, 0, 50*sc, 60*sc, sc, CF.BG2); CF.blit(cv, p, 0, 0, sc); fr.append(cv)
            write_gif('%s/F7v2_ciclo_%s_tempos_exatos_corpo_%dx.gif' % (OUT, d, sc), fr, 60*sc, 60*sc, [ms for _, ms in seqs[d]])
    print('delays do ciclo por direção (min):', {d: min(ms for _, ms in seqs[d]) for d in 'SNEW'})
    for sc in (1, 3): scene_gif('%s/F7v2_ciclo_idle_walk_ataque_idle_SNEW_tick40ms_%dx.gif' % (OUT, sc), meta, pj, seqs, fires, sc)
    # (4) demonstração do ataque com projétil
    storyboard()
    for sc in (1, 4): scene_gif('%s/demo_ataque_com_projetil_SNEW_tick40ms_%dx.gif' % (PJD, sc), meta, pj, atk, atk_f, sc)
    print('ok')
