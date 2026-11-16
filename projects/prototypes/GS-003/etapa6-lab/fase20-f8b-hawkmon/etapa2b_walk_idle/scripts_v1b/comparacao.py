"""Etapa 2b: comparações (GIF e folhas, 1x e 4x) do pacote_hawkmon_v1 ao lado do Agumon F7v2 e do Tamer.
Colunas dos GIFs: Tamer (parado, só rotação S) | Hawkmon | Agumon F7v2. Linhas: S, N, E, W. Lê os PNG do pacote (não o rig)."""
import sys, os, json
sys.dont_write_bytecode = True
sys.path.insert(0, '/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/etapa6-lab/fase20-f8b-hawkmon/etapa1_pose_base/scripts')
from comum import *
from pal import *
sys.path.insert(0, '/home/openclaw/projects/GameStudio/workspaces/game-art/tools')
from gifenc import write_gif
E2B = LAB + '/fase20-f8b-hawkmon/etapa2b_walk_idle'
HK = E2B + '/pacote_hawkmon_v1b'; HK1 = E2B + '/pacote_hawkmon_v1'; AG = LAB + '/fase17-f7-hibrido/v2/pacote_agumon_f7v2'; CP = E2B + '/comparacao_v1b'
BG = (120, 160, 96, 255); G1 = (96, 136, 80, 255); G2 = (104, 144, 86, 255)
def frames(pk, a, d):
    dd = '%s/%s/%s' % (pk, a, d)
    return [load(dd + '/' + f)[2] for f in sorted(os.listdir(dd)) if f.endswith('.png')]
def rot(pk, d): return load('%s/rotations/%s.png' % (pk, d))[2]
mh = json.load(open(HK + '/pacote.json')); ma = json.load(open(AG + '/pacote.json'))
_, _, tm = load(LAB + '/lab-assets/a-f7v2/tamer/tamer_a_cabelo_preto/rotations/south.png'); tb = bbox(tm); tm = crop(tm, *tb)
TM60 = canvas(60, 60); paste(TM60, tm, 30 - len(tm[0]) // 2, 50 - len(tm))
def at(seq, t):
    tot = sum(m for _, m in seq); t %= tot; acc = 0
    for f, m in seq:
        if t < acc + m: return f
        acc += m
def changes(seq, dur):
    out = set(); tot = sum(m for _, m in seq); t = 0
    while t < dur:
        for _, m in seq:
            out.add(t); t += m
            if t >= dur: break
    return out
def grid_gif(name, cells, dur, rows=4, cols=3, CW=64, CH=62, scs=(1, 4), shift=None):
    """cells[(r,c)] = [(px60, ms)] em laço. Um quadro de GIF a cada mudança de qualquer célula."""
    ts = sorted(set().union(*[changes(s, dur) for s in cells.values()]) | {0}); ts = [t for t in ts if t < dur]
    for sc in scs:
        out = []
        for t in ts:
            cv = canvas(cols * CW, rows * CH, BG)
            for r in range(rows):
                for x in range(cols * CW):
                    for y in range(r * CH + 51, r * CH + CH): cv[y][x] = G1 if (x // 32) % 2 == 0 else G2
            for (r, c), s in cells.items(): paste(cv, at(s, t), c * CW + 2, r * CH + 1)
            out.append(scale(cv, sc) if sc > 1 else cv)
        dl = [ts[i + 1] - ts[i] if i + 1 < len(ts) else dur - ts[i] for i in range(len(ts))]
        write_gif('%s/%s_%dx.gif' % (CP, name, sc), out, cols * CW * sc, rows * CH * sc, dl)
    print(name, len(ts), 'quadros; delays', sorted(set(dl)))
def sheet(name, rowsdef, scs=(1, 4), CW=44, CH=44, x0=8, y0=8):
    n = max(len(v) for _, v in rowsdef)
    cv = canvas(n * CW, len(rowsdef) * CH, BG)
    for r, (lab, v) in enumerate(rowsdef):
        for x in range(n * CW):
            for y in range(r * CH + 42, r * CH + CH): cv[y][x] = G1 if (x // CW) % 2 == 0 else G2
        for i, f in enumerate(v): paste(cv, crop(f, x0, y0, x0 + CW - 1, y0 + CH - 1), i * CW, r * CH)
    for sc in scs: save('%s/%s_%dx.png' % (CP, name, sc), scale(cv, sc) if sc > 1 else cv)
if __name__ == '__main__':
    os.makedirs(CP, exist_ok=True); SO_MED = 'med' in sys.argv
    WD = mh['anims']['walk']['delay_ms']; assert WD == ma['anims']['walk']['delay_ms'] == 110
    hw = {d: frames(HK, 'walk', d) for d in 'SNEW'}; hi = {d: frames(HK, 'idle', d) for d in 'SNEW'}
    aw = {d: frames(AG, 'walk', d) for d in 'SNEW'}; ai = {d: frames(AG, 'idle', d) for d in 'SNEW'}
    hid = mh['anims']['idle']['delays_ms']; aid = ma['anims']['idle']['delays_ms']
    # folhas de quadros (corpo inteiro), com a rotação na primeira coluna
    sheet('folha_walk_hawkmon_SNEW', [(d, [rot(HK, d)] + hw[d]) for d in 'SNEW'])
    sheet('folha_idle_hawkmon_SNEW', [(d, [rot(HK, d)] + hi[d]) for d in 'SNEW'])
    sheet('folha_walk_hawkmon_x_agumon_SE', [('HS', hw['S']), ('AS', aw['S']), ('HE', hw['E']), ('AE', aw['E'])])
    # GIFs lado a lado
    T = [(TM60, 1000)]
    cells = {}
    for r, d in enumerate('SNEW'):
        cells[(r, 0)] = T; cells[(r, 1)] = [(f, WD) for f in hw[d]]; cells[(r, 2)] = [(f, WD) for f in aw[d]]
    if not SO_MED: grid_gif('walk_SNEW_tamer_hawkmon_agumon_110ms', cells, 8 * WD)
    cells = {}
    for r, d in enumerate('SNEW'):
        cells[(r, 0)] = T; cells[(r, 1)] = list(zip(hi[d], hid[d])); cells[(r, 2)] = list(zip(ai[d], aid[d]))
    if not SO_MED: grid_gif('idle_SNEW_tamer_hawkmon_agumon', cells, sum(hid['S']))
    cells = {}
    for r, d in enumerate('SNEW'):
        cells[(r, 0)] = T
        cells[(r, 1)] = list(zip(hi[d], hid[d])) + [(f, WD) for f in hw[d]] * 2 + list(zip(hi[d], hid[d]))
        cells[(r, 2)] = list(zip(ai[d], aid[d])) + [(f, WD) for f in aw[d]] * 2 + list(zip(ai[d], aid[d]))
    if not SO_MED: grid_gif('ciclo_idle_walk_idle_SNEW_tamer_hawkmon_agumon', cells, 2 * sum(hid['S']) + 16 * WD)
    # v1 x v1b: walk a 110 ms, colunas v1 | v1b, linhas S N E W
    hw1 = {d: frames(HK1, 'walk', d) for d in 'SNEW'}
    cells = {}
    for r, d in enumerate('SNEW'):
        cells[(r, 0)] = [(f, WD) for f in hw1[d]]; cells[(r, 1)] = [(f, WD) for f in hw[d]]
    if not SO_MED: grid_gif('walk_SNEW_v1_x_v1b_110ms', cells, 8 * WD, cols=2)
    sheet('folha_walk_v1_x_v1b_SNE', [('S v1', hw1['S']), ('S v1b', hw['S']), ('N v1', hw1['N']), ('N v1b', hw['N']), ('E v1', hw1['E']), ('E v1b', hw['E'])])
    # pista E: os dois andando no mundo, cada um na sua velocidade de pé plantado (Hawkmon 2 px/quadro, Agumon 3 px/quadro), 110 ms
    for sc in (() if SO_MED else (1, 4)):
        out = []; Wp = 150; Hp = 124
        for k in range(24):
            cv = canvas(Wp, Hp, BG)
            for r in range(2):
                for x in range(Wp):
                    for y in range(r * 62 + 51, r * 62 + 62): cv[y][x] = G1 if (x // 8) % 2 == 0 else G2
            paste(cv, hw['E'][k % 8], 2 + 2 * k, 1); paste(cv, aw['E'][k % 8], 2 + 3 * k, 63)
            out.append(scale(cv, sc) if sc > 1 else cv)
        write_gif('%s/pista_E_hawkmon_2px_x_agumon_3px_110ms_%dx.gif' % (CP, sc), out, Wp * sc, Hp * sc, [110] * 24)
    # prancha parada (quadro de contato da walk) em escala de jogo: Tamer, Hawkmon, Agumon
    cv = canvas(3 * 64, 4 * 62, BG)
    for r, d in enumerate('SNEW'):
        for x in range(3 * 64):
            for y in range(r * 62 + 51, r * 62 + 62): cv[y][x] = G1 if (x // 32) % 2 == 0 else G2
        paste(cv, TM60, 2, r * 62 + 1); paste(cv, hw[d][0], 66, r * 62 + 1); paste(cv, aw[d][0], 130, r * 62 + 1)
    save(CP + '/quadro_contato_walk_tamer_hawkmon_agumon_1x.png', cv); save(CP + '/quadro_contato_walk_tamer_hawkmon_agumon_4x.png', scale(cv, 4))
    # ---- medidas tiradas dos PNG do pacote
    med = {}
    def find(px, letter, ys=None):
        c = L2C[letter]; return sorted((x, y) for y, r in enumerate(px) for x, p in enumerate(r) if tuple(p) == c and (ys is None or y in ys))
    near = [min(x for x, y in find(hw['E'][f], 'C', (48,))) + 2 * f for f in range(4)]      # garra de trás do pé de perto, na linha do chão
    far = []; far_q = []                                                                      # garra do pé de trás (só onde não está encoberta)
    for f in range(4, 8):
        xs = [x for x, y in find(hw['E'][f], 'c', (47,))]
        if xs: far.append(min(xs) + 2 * f); far_q.append(f)
    med['E_pe_de_perto_x_mundo_quadros_0a3'] = near; med['E_pe_de_tras_x_mundo'] = far; med['E_pe_de_tras_quadros_medidos'] = far_q
    med['E_deslizamento_px'] = {'perto': max(near) - min(near), 'tras': max(far) - min(far)}
    # N: ponta central do leque (vermelho-escuro q nas colunas 29-30) e pés: linhas
    tip = []
    for f in range(8):
        px = hw['N'][f]; ys = [y for y in range(60) for x in (29, 30) if tuple(px[y][x]) in (L2C['q'], L2C['r'], L2C['R'])]
        tip.append(max(ys))
    med['N_walk_ponta_central_do_leque_ultima_linha_vermelha'] = tip; med['N_linha_do_chao'] = 49
    med['S_walk_ultima_linha_opaca'] = [bbox(f)[3] for f in hw['S']]; med['N_walk_ultima_linha_opaca'] = [bbox(f)[3] for f in hw['N']]
    med['E_walk_ultima_linha_opaca'] = [bbox(f)[3] for f in hw['E']]
    # E: vão/contorno entre a ponta da asa (h) e qualquer amarelo/laranja de pé: distância mínima de Chebyshev
    mind = []
    for f in range(8):
        px = hw['E'][f]; hs = find(px, 'h'); feet = [p for l in 'yYon' for p in find(px, l, range(43, 50))]
        mind.append(min(max(abs(a - c), abs(b - d)) for a, b in hs for c, d in feet))
    med['E_walk_distancia_min_ponta_da_asa_h_ate_pes'] = mind
    # E: cauda vermelha (colunas à esquerda do corpo) sempre acima da ponta escura da asa
    cau = []
    for f in range(8):
        px = hw['E'][f]; reds = [y for y in range(60) for x in range(18, 23) if tuple(px[y][x]) in (L2C['R'], L2C['r'])]
        hs = find(px, 'h'); cau.append([min(reds), max(reds), min(y for x, y in hs)])
    med['E_walk_cauda_vermelha_y_min_max_e_ponta_asa_h_y'] = cau
    # ---- E2b-c
    PE = [L2C[l] for l in 'yYonCc']
    def pes_N(fr):
        out = []
        for px in fr:
            e = sum(1 for y in range(44, 50) for x in range(0, 30) if tuple(px[y][x]) in PE); d_ = sum(1 for y in range(44, 50) for x in range(30, 60) if tuple(px[y][x]) in PE)
            out.append([e, d_])
        return out
    med['N_walk_px_de_perna_e_pe_visiveis_esq_dir_v1b'] = pes_N(hw['N']); med['N_walk_px_de_perna_e_pe_visiveis_esq_dir_v1'] = pes_N(hw1['N'])
    med['N_walk_quadros_com_os_dois_lados_com_3px_ou_mais'] = {'v1b': sum(1 for a, b in pes_N(hw['N']) if a >= 3 and b >= 3), 'v1': sum(1 for a, b in pes_N(hw1['N']) if a >= 3 and b >= 3)}
    # pontas das penas laterais do leque (N): última linha vermelha nas colunas 25-26 e 33-34 (grade 5-6 e 13-14)
    RED = [L2C[l] for l in 'Rrq']
    med['N_walk_penas_laterais_ultima_linha_vermelha_esq_dir'] = [[max(y for y in range(60) for x in (25, 26) if tuple(px[y][x]) in RED), max(y for y in range(60) for x in (33, 34) if tuple(px[y][x]) in RED)] for px in hw['N']]
    # asas S/N: linha mais baixa do pixel h (ponta) de cada lado
    def pontas(fr): return [[max(y for x, y in find(px, 'h') if x < 30), max(y for x, y in find(px, 'h') if x >= 30)] for px in fr]
    med['S_walk_ponta_da_asa_h_y_esq_dir'] = {'v1b': pontas(hw['S']), 'v1': pontas(hw1['S'])}
    med['N_walk_ponta_da_asa_h_y_esq_dir'] = {'v1b': pontas(hw['N']), 'v1': pontas(hw1['N'])}
    def dist_asa_pe(fr):
        out = []
        for px in fr:
            hs = find(px, 'h'); feet = [p for l in 'yYonCc' for p in find(px, l, range(43, 50))]
            out.append(min(max(abs(a - c), abs(b - d)) for a, b in hs for c, d in feet))
        return out
    med['S_walk_distancia_min_ponta_da_asa_h_ate_pes'] = dist_asa_pe(hw['S']); med['N_walk_distancia_min_ponta_da_asa_h_ate_pes'] = dist_asa_pe(hw['N'])
    # px diferentes v1 x v1b por quadro; idle e rotações têm de ser idênticos
    def dif(a, b): return sum(1 for y in range(60) for x in range(60) if tuple(a[y][x]) != tuple(b[y][x]))
    med['walk_px_diferentes_v1_x_v1b'] = {d: [dif(a, b) for a, b in zip(hw1[d], hw[d])] for d in 'SNEW'}
    med['idle_px_diferentes_v1_x_v1b'] = {d: sum(dif(a, b) for a, b in zip(frames(HK1, 'idle', d), hi[d])) for d in 'SNEW'}
    med['rotations_px_diferentes_v1_x_v1b'] = {d: dif(rot(HK1, d), rot(HK, d)) for d in 'SNEW'}
    # transições (px trocados): idle q5 -> walk q0, walk q7 -> idle q0, dentro do ciclo
    med['transicoes_px_trocados'] = {d: {'idle_para_walk': dif(hi[d][-1], hw[d][0]), 'walk_para_idle': dif(hw[d][-1], hi[d][0]),
                                         'ciclo_media': round(sum(dif(hw[d][i], hw[d][(i + 1) % 8]) for i in range(8)) / 8.0, 1), 'ciclo_max': max(dif(hw[d][i], hw[d][(i + 1) % 8]) for i in range(8))} for d in 'SNE'}
    json.dump(med, open(E2B + '/medidas_pixels_e2b_v1b.json', 'w'), indent=1); print(json.dumps(med))
