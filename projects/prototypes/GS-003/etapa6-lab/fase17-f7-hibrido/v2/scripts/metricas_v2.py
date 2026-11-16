"""F7v2: métricas do pacote v2 e regressão contra a F7 (mesmas contas do metricas_f7.py)."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
import metricas_f7 as M, build_f7v2 as B, attack_v2 as A2
W = H = 60
def px(fr): return [M.P(f) for f in fr]
def main():
    pal = set()
    for a in ('walk', 'attack'):
        for d in 'SNEW': pal |= M.colors(M.norm(F2B, a, d))
    for d in 'SNEW': pal |= M.colors([M.rot(F2B, d)])
    R = {'paleta_pacote_F2b_cores': len(pal), 'pacote_v2': {}, 'regressao_F7_x_F7v2_px_por_quadro': {}}
    allc = set()
    for a in ('walk', 'idle', 'attack', 'feliz'):
        for d in 'SNEW':
            if not os.path.isdir('%s/%s/%s' % (F7, a, d)): continue
            new = M.norm(F7, a, d); old = M.norm(F7OLD, a, d); allc |= M.colors(new)
            s = M.stats(new, pal, M.rot(F7, d))
            s['meia_volta_qi_x_qi4'] = [M.diff(new[i], new[i+4]) for i in range(4)] if a == 'walk' else None
            if a == 'walk' and d == 'E': s['deslize'] = [M.slide(new, 3)]
            R['pacote_v2'][a + '/' + d] = s
            R['regressao_F7_x_F7v2_px_por_quadro'][a + '/' + d] = [M.diff(x, y) for x, y in zip(old, new)]
    for d in 'SNEW':
        allc |= M.colors([M.rot(F7, d)])
        R['regressao_F7_x_F7v2_px_por_quadro']['rotations/' + d] = [M.diff(M.rot(F7OLD, d), M.rot(F7, d))]
    R['cores_pacote_v2'] = len(allc); R['cores_fora_paleta_F2b'] = len(allc - pal)
    R['residuo_vermelho_escuro_px'] = {'F7': {}, 'F7v2': {}}
    for name, pack in (('F7', F7OLD), ('F7v2', F7)):
        for d in 'SNE':
            R['residuo_vermelho_escuro_px'][name][d] = [sum(1 for r in p for c in r if A2.residue(c)) for p in M.norm(pack, 'attack', d)]
    R['ataque_N_cortes'] = {'F7': M.stats(M.norm(F7OLD, 'attack', 'N'))['cortes'], 'F7v2': R['pacote_v2']['attack/N']['cortes']}
    R['espelho_W_x_E_px'] = {a: sum(M.diff([list(reversed(r)) for r in pe], pw) for pe, pw in zip(M.norm(F7, a, 'E'), M.norm(F7, a, 'W'))) for a in ('walk', 'idle', 'attack')}
    # walk S/N: original x experimental x F2b
    wsn = B.walk_sn(); cmp_ = {}
    import probe_walk as PW
    for d, g in (('S', 49), ('N', 48)):
        rotp = M.rot(F7, d)
        for name, fr in (('F2b', None), ('original', wsn[(d, 'original')]), ('experimental', wsn[(d, 'experimental')])):
            p = M.norm(F2B, 'walk', d) if fr is None else px(fr)
            s = M.stats(p, pal, rotp)
            st = PW.stats([(60, 60, q) for q in p], g)
            hl = [k[10] for k in st]; hr = [k[11] for k in st]
            def amp(h, i): 
                v = [k[i] for k in h if k]; return round(max(v) - min(v), 1) if v else None
            cmp_['%s/%s' % (d, name)] = {
             'cabeca_rot_x_quadro_px': [min(M.diff(rotp, q, range(M.bb(rotp)[1], M.bb(rotp)[1]+14), 0, dy) for dy in range(-3, 4)) for q in p],
             'base': s['base'], 'topo': s['topo'], 'largura': [k[2]-k[0]+1 for k in st], 'osc_centroide_y': s['osc_centroide_y'],
             'cortes': s['cortes'], 'meia_volta_qi_x_qi4': [M.diff(p[i], p[i+4]) for i in range(4)],
             'pe_erguido_esq_dir_px': [(k[5], k[6]) for k in st], 'pe_esq_largura': [k[7][1]-k[7][0]+1 for k in st], 'pe_dir_largura': [k[8][1]-k[8][0]+1 for k in st],
             'mao_esq_amp_xy': (amp(hl, 0), amp(hl, 1)), 'mao_dir_amp_xy': (amp(hr, 0), amp(hr, 1)), 'maos_visiveis': sum(1 for a_, b_ in zip(hl, hr) if a_ and b_),
             'assimetria_esq_dir_px': [sum(1 for y in range(34, 50) for x in range(30) if (q[y][x][3] > 0) != (q[y][59-x][3] > 0)) for q in p],
             'componentes': s['componentes'], 'pixels_soltos': s['pixels_soltos'], 'cores': s['cores'], 'cores_fora_paleta_F2b': s['cores_fora_paleta_F2b'], 'semitransp': s['semitransp']}
    R['walk_SN_comparacao'] = cmp_; R['walk_SN_escolha'] = B.WALK_ESCOLHIDA
    # transições
    tr = {}
    for d in 'SNEW':
        r = M.rot(F7, d); w = M.norm(F7, 'walk', d); i = M.norm(F7, 'idle', d); at = M.norm(F7, 'attack', d)
        tr[d] = {'idle_q0_x_rot': M.diff(r, i[0]), 'rot_x_walk_q0': M.diff(r, w[0]), 'idle_ultimo_x_walk_q0': M.diff(i[-1], w[0]),
                 'walk_ultimo_x_attack_q0': M.diff(w[-1], at[0]), 'rot_x_attack_q0': M.diff(r, at[0]), 'attack_q8_x_rot': M.diff(at[8], r),
                 'cabeca_rot_x_walk_q0': min(M.diff(r, w[0], range(M.bb(r)[1], M.bb(r)[1]+14), 0, dy) for dy in range(-3, 4)),
                 'base_walk': sorted(set(M.bb(p)[3] for p in w)), 'base_attack': sorted(set(M.bb(p)[3] for p in at))}
    R['transicoes_v2'] = tr
    # projétil
    PJD = O + '/projetil_pepper_breath'; pj = {}
    for a in ('nascer', 'voo'):
        for d in 'SNEW':
            fr = frames(PJD, a, d)
            pj['%s/%s' % (a, d)] = {'px': [sum(1 for r in f[2] for c in r if c[3]) for f in fr], 'bbox': [bbox(f) for f in fr],
                                    'borda': sum(1 for f in fr for y in range(24) for x in range(24) if f[2][y][x][3] and (x in (0, 23) or y in (0, 23))),
                                    'semitransp': sum(1 for f in fr for r in f[2] for c in r if 0 < c[3] < 255)}
    fr = frames(PJD, 'impacto'); pj['impacto'] = {'px': [sum(1 for r in f[2] for c in r if c[3]) for f in fr], 'bbox': [bbox(f) for f in fr]}
    cols = set()
    for root, _, fs in os.walk(PJD):
        for f in fs:
            if f.startswith('frame_'):
                for r in load(os.path.join(root, f))[2]:
                    for c in r:
                        if c[3]: cols.add(tuple(c))
    pj['cores'] = sorted(hx(c) for c in cols); pj['cores_fora_paleta_F2b'] = len(cols - pal)
    eE = frames(PJD, 'voo', 'E'); eW = frames(PJD, 'voo', 'W')
    pj['W_espelho_de_E_em_torno_do_pixel_12'] = all(eE[k][2][y][x] == eW[k][2][y][24-x] for k in range(4) for y in range(24) for x in range(1, 24))
    R['projetil'] = pj
    R['escala_px'] = {d: {'altura': M.bb(M.rot(F7, d))[3]-M.bb(M.rot(F7, d))[1]+1, 'largura': M.bb(M.rot(F7, d))[2]-M.bb(M.rot(F7, d))[0]+1} for d in 'SNEW'}
    json.dump(R, open(O + '/metricas_f7v2.json', 'w'), ensure_ascii=False, indent=1)
    print('REGRESSAO', json.dumps(R['regressao_F7_x_F7v2_px_por_quadro']))
    print('RESIDUO', R['residuo_vermelho_escuro_px']); print('ATK N', R['ataque_N_cortes']); print('ESPELHO', R['espelho_W_x_E_px'])
    print('CORES', R['cores_pacote_v2'], R['cores_fora_paleta_F2b'])
    for k, v in cmp_.items(): print(k, json.dumps(v))
    for k in ('walk/S', 'walk/N', 'attack/S', 'attack/N', 'attack/E'):
        s = R['pacote_v2'][k]; print(k, {f: s[f] for f in ('base', 'topo', 'componentes', 'pixels_soltos', 'cortes', 'semitransp', 'borda', 'cores', 'cores_fora_paleta_F2b', 'cabeca_igual_q0', 'rot_x_q0_px', 'rot_x_ultimo_px')})
    print('TR', json.dumps(tr)); print('PROJ', json.dumps(pj))
if __name__ == '__main__': main()
