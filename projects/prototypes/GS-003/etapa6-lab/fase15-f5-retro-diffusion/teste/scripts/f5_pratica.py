"""F5 prática: fatia as folhas do Retro Diffusion, mede com as mesmas funções da F6/C10 e monta os comparativos.
Uso: python3 -I scripts/f5_pratica.py   (rodar da pasta teste/)"""
import sys, os, json
sys.path.insert(0, '/home/openclaw/projects/GameStudio/workspaces/game-art/tools')
from pxpng import load_png_rgba, save_png_rgba, new_canvas, crop, nn_scale, paste, rect, draw_text, bbox_opaque
from gifenc import write_gif
T = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); L = os.path.dirname(os.path.dirname(T))
F2B = L + '/fase13-comando10/backup_f2b/pacote_agumon_f2'; F6 = L + '/fase16-f6-blender/pacote_agumon_f6'
def load(p):
    w, h, px = load_png_rgba(p); return w, h, [[tuple(q) if q[3] else (0, 0, 0, 0) for q in r] for r in px]  # transparente normalizado
def frames(pack, anim, d):
    dd = os.path.join(pack, anim, d); return [load(os.path.join(dd, f)) for f in sorted(os.listdir(dd)) if f.endswith('.png')]
# ---------- fatiar
def slice_sheet(path, cw, ch):
    w, h, px = load(path); out = []
    for r in range(h // ch):
        for c in range(w // cw): out.append((cw, ch, [row[c * cw:(c + 1) * cw] for row in px[r * ch:(r + 1) * ch]]))
    return out
rot = slice_sheet(T + '/D_rotate/original/D_rotate_sheet.png', 48, 48)
# layout observado da folha 3x3 (centro vazio): a coluna da esquerda olha para a direita
RN = ['SE', 'S', 'SW', 'E', None, 'W', 'NE', 'N', 'NW']
ROT = {}
os.makedirs(T + '/D_rotate/rotations', exist_ok=True); os.makedirs(T + '/B_walk/walk/E', exist_ok=True)
for n, (w, h, px) in zip(RN, rot):
    if n: ROT[n] = (w, h, px); save_png_rgba(T + '/D_rotate/rotations/%s.png' % n, w, h, px)
WALK = slice_sheet(T + '/B_walk/original/B_walk_sheet.png', 48, 48)
for i, (w, h, px) in enumerate(WALK): save_png_rgba(T + '/B_walk/walk/E/frame_%03d.png' % i, w, h, px)
# ---------- medidas (mesmas definições de metricas_f6.py / metricas_c10.py)
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
def colors(frs):
    s = set()
    for _, _, px in frs:
        for r in px:
            for p in r:
                if p[3]: s.add(tuple(p[:3]))
    return s
def orphans(px):
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
def feet(px, ground):
    """grupos de colunas opacas nas 2 linhas do chão -> [(x0,x1),...] (posição dos pés em contato)"""
    h = len(px); w = len(px[0])
    cols = sorted({x for x in range(w) for y in (ground - 1, ground) if 0 <= y < h and px[y][x][3]}); g = []
    for x in cols:
        if g and x == g[-1][-1] + 1: g[-1].append(x)
        else: g.append([x])
    return [(a[0], a[-1]) for a in g]
PAL = set()
for a in ('walk', 'attack'):
    for k in 'SENW': PAL |= colors(frames(F2B, a, k))
for k in 'SENW': PAL |= colors([load(F2B + '/rotations/%s.png' % k)])
def near(c, pal): return min(sum((a - b) ** 2 for a, b in zip(c, p)) for p in pal) ** .5
def walk_metrics(fr):
    cent = []; cx = []; top = []; low = []; ft = []; comp = []; orph = []; semi = 0; border = 0; bbs = []
    for w, h, px in fr:
        o = opq(px); ys = [y for _, y in o]; xs = [x for x, _ in o]
        cent.append(round(sum(ys) / len(ys), 1)); cx.append(round(sum(xs) / len(xs), 1)); top.append(min(ys)); low.append(max(ys))
        ft.append(feet(px, max(low))) ; comp.append(len(comps(px))); orph.append(orphans(px)); bbs.append([min(xs), min(ys), max(xs), max(ys)])
        semi += sum(1 for r in px for p in r if 0 < p[3] < 255); border += sum(1 for (x, y) in o if x in (0, w - 1) or y in (0, h - 1))
    ground = max(low); ft = [feet(px, ground) for _, _, px in fr]
    def head(px, t): return [px[y] for y in range(t, t + 14)]
    h0 = head(fr[0][2], top[0]); diff = [sum(1 for a, b in zip(h0, head(f[2], t)) for p, q in zip(a, b) if p != q) for f, t in zip(fr, top)]
    # largura do crânio: maior largura opaca nas 12 linhas do topo
    def skull(px, t):
        return max((max(x for x in range(len(px[0])) if px[y][x][3]) - min(x for x in range(len(px[0])) if px[y][x][3]) + 1) for y in range(t, t + 12))
    sk = [skull(f[2], t) for f, t in zip(fr, top)]
    n = len(fr); W_ = fr[0][0]
    cuts = [sum(1 for y in range(fr[0][1]) for x in range(W_) if fr[i][2][y][x] != fr[(i + 1) % n][2][y][x]) for i in range(n)]
    cs = colors(fr); fora = cs - PAL
    percol = [len(colors([f])) for f in fr]
    return dict(canvas=[fr[0][0], fr[0][1]], quadros=n, bbox_por_quadro=bbs, centroide_y=cent, amp_centroide_y=round(max(cent) - min(cent), 1),
        centroide_x=cx, amp_centroide_x=round(max(cx) - min(cx), 1), topo=top, amp_topo=max(top) - min(top), px_mais_baixo=low,
        amp_px_mais_baixo=max(low) - min(low), linha_do_chao=ground, pes_em_contato_x=ft, grupos_de_pe=[len(a) for a in ft],
        componentes=comp, pixels_de_cor_isolados=orph, semitransparentes=semi, px_na_borda=border,
        cabeca_identica_ao_q0=sum(1 for d in diff if d == 0), cabeca_px_diferentes_do_q0=diff, largura_cranio_topo12=sk,
        cortes_entre_quadros=cuts, cores=len(cs), cores_por_quadro=percol, cores_fora_da_paleta_F2b=len(fora),
        dist_max_cor_fora_para_paleta_F2b=round(max([near(c, PAL) for c in fora] or [0]), 1))
def rot_metrics(w, h, px):
    o = opq(px); ys = [y for _, y in o]; xs = [x for x, _ in o]
    hw = max(max(x for x, y in o if y == yy) - min(x for x, y in o if y == yy) + 1 for yy in range(min(ys), min(ys) + 12))
    cs = colors([(w, h, px)])
    return dict(canvas=[w, h], bbox=[min(xs), min(ys), max(xs), max(ys)], altura=max(ys) - min(ys) + 1, largura=max(xs) - min(xs) + 1,
                largura_cabeca_topo12=hw, base_y=max(ys), cores=len(cs), cores_fora=len(cs - PAL), componentes=len(comps(px)), isolados=orphans(px),
                semitransparentes=sum(1 for r in px for p in r if 0 < p[3] < 255))
res = {'paleta_F2b_cores': len(PAL), 'walk_E': {}, 'rotations': {}}
WK = {'F2b': frames(F2B, 'walk', 'E'), 'F6': frames(F6, 'walk', 'E'), 'RD': WALK}
for k, fr in WK.items(): res['walk_E'][k] = walk_metrics(fr)
RT = {'F2b': {d: load(F2B + '/rotations/%s.png' % d) for d in 'SENW'}, 'F6': {d: load(F6 + '/rotations/%s.png' % d) for d in 'SENW'}, 'RD': ROT}
for k, dd in RT.items(): res['rotations'][k] = {d: rot_metrics(*v) for d, v in dd.items()}
inp = load(T + '/entrada/f2b_S_48.png'); inE = load(T + '/entrada/f2b_E_48.png')
res['RD_rotate_S_igual_a_entrada'] = ROT['S'][2] == inp[2]
res['RD_rotate_S_px_diferentes_da_entrada'] = sum(1 for a, b in zip(ROT['S'][2], inp[2]) for p, q in zip(a, b) if p != q)
res['RD_rotate_W_igual_flip_E'] = [list(reversed(r)) for r in ROT['E'][2]] == [list(r) for r in ROT['W'][2]]
res['RD_rotate_W_px_diferentes_do_flip_E'] = sum(1 for a, b in zip([list(reversed(r)) for r in ROT['E'][2]], ROT['W'][2]) for p, q in zip(a, b) if p != q)
res['RD_rotate_E_px_diferentes_do_F2b_E'] = sum(1 for a, b in zip(ROT['E'][2], inE[2]) for p, q in zip(a, b) if p != q)
res['RD_walk_q_px_diferentes_da_entrada_E'] = [sum(1 for a, b in zip(f[2], inE[2]) for p, q in zip(a, b) if p != q) for f in WALK]
allrd = colors(WALK) | colors(list(ROT.values()))
res['RD_cores_total'] = len(allrd); res['RD_cores_fora_da_paleta_F2b'] = len(allrd - PAL)
res['RD_rotate_cores_total'] = len(colors(list(ROT.values()))); res['RD_rotate_cores_fora'] = len(colors(list(ROT.values())) - PAL)
json.dump(res, open(T + '/metricas_f5_pratica.json', 'w'), ensure_ascii=False, indent=1)
for k in WK:
    m = res['walk_E'][k]
    print('== walk E', k, m['canvas'], 'q', m['quadros'], 'ampCy', m['amp_centroide_y'], 'ampCx', m['amp_centroide_x'], 'topo', m['topo'], 'baixo', m['px_mais_baixo'],
          '\n   cabeca=q0', m['cabeca_identica_ao_q0'], 'difcab', m['cabeca_px_diferentes_do_q0'], 'cranio', m['largura_cranio_topo12'], 'comp', m['componentes'],
          'isol', m['pixels_de_cor_isolados'], 'semi', m['semitransparentes'], 'borda', m['px_na_borda'], 'cores', m['cores'], m['cores_por_quadro'], 'fora', m['cores_fora_da_paleta_F2b'], 'dist', m['dist_max_cor_fora_para_paleta_F2b'],
          '\n   pes', m['pes_em_contato_x'], 'bbox', m['bbox_por_quadro'])
for k in RT: print('== rot', k, {d: (v['canvas'], v['altura'], v['largura'], v['largura_cabeca_topo12'], v['base_y'], v['cores'], v['cores_fora'], v['isolados'], v['componentes']) for d, v in res['rotations'][k].items()})
print({k: v for k, v in res.items() if k.startswith('RD_')})
# ---------- comparativos
BG = (236, 236, 236, 255); LN = (120, 120, 120, 255)
def cell(fr, cw, ch):
    """centraliza horizontalmente e alinha a base no mesmo chão (ch-4), sem reescalar"""
    w, h, px = fr; bb = bbox_opaque(px, w, h); c = new_canvas(cw, ch)
    if bb:
        x0, y0, x1, y1 = bb[0], bb[1], bb[2], bb[3]
        paste(c, cw, ch, px, w, h, (cw - w) // 2, (ch - 4) - max(y for _, y in opq(px)))
    return c
def flat(px, w, h):
    return [[p if p[3] else BG for p in r] for r in px]
def panel(rows, labels, cw, ch, scale, path, colnames=None):
    """rows: lista de listas de frames (w,h,px); gera grade com rótulo à esquerda"""
    lab = 44; n = max(len(r) for r in rows); W = lab + n * cw * scale; top = 10 if colnames else 0; H = top + len(rows) * ch * scale
    out = new_canvas(W, H, BG)
    if colnames:
        for i, cn in enumerate(colnames): draw_text(out, W, H, lab + i * cw * scale + 2, 1, cn, bg=None, scale=1)
    for j, r in enumerate(rows):
        draw_text(out, W, H, 2, top + j * ch * scale + 4, labels[j], bg=None, scale=2)
        for i, fr in enumerate(r):
            c = cell(fr, cw, ch); s = nn_scale(c, cw, ch, scale) if scale > 1 else c
            paste(out, W, H, s, cw * scale, ch * scale, lab + i * cw * scale, top + j * ch * scale)
    save_png_rgba(path, W, H, out)
def gif_side(tracks, labels, cw, ch, scale, path, delay=150):
    n = max(len(t) for t in tracks); W = len(tracks) * cw * scale; H = ch * scale + 9; fs = []
    for i in range(n):
        out = new_canvas(W, H, BG)
        for k, t in enumerate(tracks):
            c = cell(t[i % len(t)], cw, ch); s = nn_scale(c, cw, ch, scale) if scale > 1 else c
            paste(out, W, H, s, cw * scale, ch * scale, k * cw * scale, 9)
            draw_text(out, W, H, k * cw * scale + 2, 1, labels[k], bg=None, scale=1)
        fs.append(out)
    write_gif(path, fs, W, H, [delay] * n)
C = T + '/comparacao'; os.makedirs(C, exist_ok=True)
CW, CH = 64, 60
for s in (1, 4):
    panel([[RT[k][d] for d in 'SNEW'] for k in ('F2b', 'F6', 'RD')], ['1', '2', '3'], CW, CH, s, C + '/rotacoes_S_N_E_W_F2b_F6_RD_%dx.png' % s)
    panel([[ROT[d] for d in ('S', 'SE', 'E', 'NE', 'N', 'NW', 'W', 'SW')]], ['3'], CW, CH, s, C + '/RD_rotate_8dir_%dx.png' % s)
    panel([WK['F2b'], WK['F6'], WK['RD']], ['1', '2', '3'], CW, CH, s, C + '/walk_E_folha_F2b_F6_RD_%dx.png' % s)
    gif_side([WK['F2b'], WK['F6'], WK['RD']], ['1', '2', '3'], CW, CH, s, C + '/walk_E_F2b_F6_RD_%dx.gif' % s)
    gif_side([WK['RD']], ['3'], CW, CH, s, C + '/walk_E_RD_%dx.gif' % s)
# pista: desloca 3 px por quadro (passo do F6) para ver deslizamento, 4x
def track(fr, step, path, scale=4, loops=2):
    W = 150; H = 60; fs = []; n = len(fr)
    for i in range(n * loops):
        out = new_canvas(W, H, BG)
        for x in range(0, W, 8): rect(out, W, H, x, H - 3, 1, 3, LN)
        w, h, px = fr[i % n]; paste(out, W, H, px, w, h, 4 + i * step, (H - 4) - max(y for _, y in opq(px)))
        fs.append(nn_scale(out, W, H, scale))
    write_gif(path, fs, W * scale, H * scale, [150] * len(fs))
for st in (2, 3, 4): track(WK['RD'], st, C + '/pista_RD_walk_E_%dpx_4x.gif' % st)
print('ok')
# ---------- extras: natureza das diferenças e estabilidade da cabeça com alinhamento livre
def diffkind(a, b):
    sil = sum(1 for r, s in zip(a, b) for p, q in zip(r, s) if bool(p[3]) != bool(q[3]))
    col = [sum((x - y) ** 2 for x, y in zip(p[:3], q[:3])) ** .5 for r, s in zip(a, b) for p, q in zip(r, s) if p[3] and q[3] and p != q]
    return dict(silhueta_px=sil, cor_px=len(col), cor_dist_max=round(max(col or [0]), 1), cor_px_dist_maior_que_8=sum(1 for c in col if c > 8))
res['RD_rotate_S_vs_entrada_S'] = diffkind(ROT['S'][2], inp[2])
res['RD_rotate_E_vs_F2b_E'] = diffkind(ROT['E'][2], inE[2])
res['RD_walk_q0_vs_entrada_E'] = diffkind(WALK[0][2], inE[2])
def headfit(fr):
    t0 = min(y for _, y in opq(fr[0][2])); W = fr[0][0]; H = fr[0][1]; out = []
    for f in fr:
        best = None
        for dy in range(-4, 5):
            for dx in range(-4, 5):
                d = 0
                for y in range(t0, t0 + 14):
                    for x in range(W):
                        yy = y + dy; xx = x + dx
                        q = f[2][yy][xx] if 0 <= yy < H and 0 <= xx < W else (0, 0, 0, 0)
                        if q != fr[0][2][y][x]: d += 1
                if best is None or d < best[0]: best = (d, dx, dy)
        out.append(list(best))
    return out
for k in WK: res['walk_E'][k]['cabeca_melhor_alinhamento_vs_q0_[px_dif,dx,dy]'] = headfit(WK[k])
json.dump(res, open(T + '/metricas_f5_pratica.json', 'w'), ensure_ascii=False, indent=1)
for k in ('RD_rotate_S_vs_entrada_S', 'RD_rotate_E_vs_F2b_E', 'RD_walk_q0_vs_entrada_E'): print(k, res[k])
for k in WK: print('cabeca', k, res['walk_E'][k]['cabeca_melhor_alinhamento_vs_q0_[px_dif,dx,dy]'])
