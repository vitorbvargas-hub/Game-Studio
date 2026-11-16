"""F6: passes brutos do Blender (240x240) -> sprites 60x60 na paleta do F2b.

Uso: python3 pixelize.py <raw> <pacote_saida>
Sem dependências além de pxpng.py (leitor/gravador PNG próprio do workspace).

Passos por quadro:
 1. redução 4x4 -> 1 por voto: opaco se >= COVER amostras; grupo = o mais votado (peças finas têm peso maior);
 2. tom por faixa (cel shading): cada amostra vota sombra, base ou luz pelo N.L; vence a maioria; cores só do F2b;
 3. linha interna: onde o vizinho está mais perto da câmera por mais de DEPTH_T, o pixel de trás vira linha;
 4. contorno externo de 1 px (4-vizinhança) na cor de contorno do F2b;
 5. limpeza: pixel de cor isolado (sem vizinho igual) assume a cor vizinha mais comum; sem semitransparência.
W é o espelho exato de E (regra do brief); o W "de verdade" do 3D vai para <pacote>/_W_3d_real/ só para comparação.
"""
import sys, os, json
sys.path.insert(0, '/home/openclaw/projects/GameStudio/workspaces/game-art/tools')
from pxpng import load_png_rgba, save_png_rgba

RAW, PACK = sys.argv[1], sys.argv[2]
META = json.load(open(os.path.join(RAW, 'meta.json')))
SS, CAN = META['ss'], META['canvas']
GROUPS = META['groups']
COVER = 7
DEPTH_T = 2.0

def hx(s): return (int(s[1:3], 16), int(s[3:5], 16), int(s[5:7], 16), 255)
# Todas as cores abaixo existem no pacote F2b (medido em 2026-11-14; metricas_f6.py confere de novo).
OUTLINE = hx('#000000'); LINE = hx('#2d0501')
# grupo -> (sombra, base, luz, limiar_sombra, limiar_luz) em N.L
RAMP = {
    'skin':  (hx('#ce6925'), hx('#efaa2b'), hx('#f6cb6a'), 0.02, 0.90),
    'belly': (hx('#eaae45'), hx('#f6cb6a'), hx('#f6cb6a'), 0.10, 2.0),
    'nape':  (hx('#ce6925'), hx('#d88126'), hx('#d88126'), -0.10, 2.0),
    'spot':  (hx('#af6731'), hx('#c17742'), hx('#c17742'), -0.10, 2.0),
    'eye_dark':  (hx('#011f0c'), hx('#011f0c'), hx('#011f0c'), -2, 2),
    'eye_green': (hx('#39af6b'), hx('#39af6b'), hx('#39af6b'), -2, 2),
    'eye_white': (hx('#dfeaf2'), hx('#dfeaf2'), hx('#dfeaf2'), -2, 2),
    'claw':  (hx('#cfd9e5'), hx('#fefdfb'), hx('#fefdfb'), -0.15, 2),
    'nostril': (hx('#2d0501'), hx('#2d0501'), hx('#2d0501'), -2, 2),
    'lip': (hx('#2d0501'), hx('#2d0501'), hx('#2d0501'), -2, 2),
    'mouth': (hx('#400000'), hx('#400000'), hx('#400000'), -2, 2),
    'tooth': (hx('#fefdfb'), hx('#fefdfb'), hx('#fefdfb'), -2, 2),
    'fire_out': (hx('#fb1903'), hx('#f74502'), hx('#fdff2b'), -0.25, 0.45),
    'fire_in':  (hx('#fdff2b'), hx('#fdff2b'), hx('#fcfeb4'), -2, 0.6),
}
WEIGHT = {'eye_white': 3.0, 'claw': 2.2, 'nostril': 3.0, 'lip': 1.5, 'eye_green': 1.6, 'eye_dark': 1.3, 'tooth': 2.5, 'fire_in': 1.0}
NO_LINE = {'lip', 'eye_dark', 'eye_green', 'eye_white', 'nostril', 'mouth', 'fire_out', 'fire_in', 'tooth'}
KEEP = {'lip', 'eye_white', 'claw', 'nostril', 'eye_green', 'eye_dark', 'tooth'}   # não entram na limpeza de isolados

def s2l(c):
    c /= 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
S2L = [s2l(i) for i in range(256)]
PIDS = META['pecas_id']
IDC = [tuple(p['cor']) for p in PIDS]
_idcache = {}
def gid(rgb):
    g = _idcache.get(rgb)
    if g is None:
        lin = (S2L[rgb[0]], S2L[rgb[1]], S2L[rgb[2]])
        g = min(range(len(IDC)), key=lambda i: sum((lin[k] - IDC[i][k]) ** 2 for k in range(3)))
        _idcache[rgb] = g
    return g

def pixelize(idp, nlp):
    _, _, ID = load_png_rgba(idp); _, _, NL = load_png_rgba(nlp)
    grp = [[None] * CAN for _ in range(CAN)]; chn = [[None] * CAN for _ in range(CAN)]; nl = [[0.0] * CAN for _ in range(CAN)]; dep = [[0.0] * CAN for _ in range(CAN)]
    for y in range(CAN):
        for x in range(CAN):
            votes = {}; n = 0
            for sy in range(SS):
                r1 = ID[y * SS + sy]; r2 = NL[y * SS + sy]
                for sx in range(SS):
                    p = r1[x * SS + sx]
                    if p[3] < 128: continue
                    n += 1; pid = gid(p[:3]); g = PIDS[pid]['grupo']; q = r2[x * SS + sx]
                    v = votes.setdefault(g, [0, 0.0, 0.0, {}, 0, 0]); v[0] += 1; v[2] += S2L[q[1]]
                    nlv = 2 * S2L[q[0]] - 1; rp = RAMP[g]
                    if nlv < rp[3]: v[4] += 1
                    elif nlv > rp[4]: v[5] += 1
                    v[3][PIDS[pid]['cadeia']] = v[3].get(PIDS[pid]['cadeia'], 0) + 1
            if n < COVER: continue
            g = max(votes, key=lambda k: votes[k][0] * WEIGHT.get(k, 1.0))
            c, a, b, chs, nsh, nhl = votes[g]
            # tom por voto das amostras (mais estável entre quadros do que a média de N.L perto do limiar)
            grp[y][x] = g; chn[y][x] = max(sorted(chs), key=chs.get); nl[y][x] = -1 if nsh * 2 > c else (1 if nhl * 2 > c else 0); dep[y][x] = b / c * 120 - 60
    # tom por faixa
    out = [[(0, 0, 0, 0)] * CAN for _ in range(CAN)]
    for y in range(CAN):
        for x in range(CAN):
            g = grp[y][x]
            if g is None: continue
            sh, ba, hl, ts, tl = RAMP[g]; v = nl[y][x]
            out[y][x] = sh if v < 0 else (hl if v > 0 else ba)
    N4 = ((1, 0), (-1, 0), (0, 1), (0, -1))
    # limpeza de isolados (antes das linhas)
    for y in range(CAN):
        for x in range(CAN):
            g = grp[y][x]
            if g is None or g in KEEP: continue
            nb = [out[y + dy][x + dx] for dx, dy in N4 if 0 <= x + dx < CAN and 0 <= y + dy < CAN and grp[y + dy][x + dx] is not None]
            if nb and out[y][x] not in nb:
                out[y][x] = max(set(nb), key=nb.count)
    # linha interna por descontinuidade de profundidade
    line = []
    for y in range(CAN):
        for x in range(CAN):
            g = grp[y][x]
            if g is None or g in NO_LINE: continue
            for dx, dy in N4:
                xx, yy = x + dx, y + dy
                if 0 <= xx < CAN and 0 <= yy < CAN and grp[yy][xx] is not None and grp[yy][xx] not in ('fire_out', 'fire_in'):
                    if chn[y][x] != chn[yy][xx] and dep[y][x] - dep[yy][xx] > DEPTH_T: line.append((x, y)); break
    for x, y in line: out[y][x] = LINE
    # contorno externo
    edge = []
    for y in range(CAN):
        for x in range(CAN):
            if grp[y][x] is not None: continue
            for dx, dy in N4:
                xx, yy = x + dx, y + dy
                if 0 <= xx < CAN and 0 <= yy < CAN and grp[yy][xx] is not None: edge.append((x, y)); break
    for x, y in edge: out[y][x] = OUTLINE
    return out

def mirror(px): return [list(reversed(r)) for r in px]
def save(path, px):
    os.makedirs(os.path.dirname(path), exist_ok=True); save_png_rgba(path, CAN, CAN, px)

for anim in ('rotations', 'walk', 'attack'):
    res = {}
    for d in 'SENW':
        dd = os.path.join(RAW, anim, d)
        n = len([f for f in os.listdir(dd) if f.endswith('_id.png')])
        res[d] = [pixelize(os.path.join(dd, 'f%03d_id.png' % i), os.path.join(dd, 'f%03d_nl.png' % i)) for i in range(n)]
    w3d = res['W']; res['W'] = [mirror(p) for p in res['E']]
    for d in 'SENW':
        for i, px in enumerate(res[d]):
            p = os.path.join(PACK, 'rotations', d + '.png') if anim == 'rotations' else os.path.join(PACK, anim, d, 'frame_%03d.png' % i)
            save(p, px)
    for i, px in enumerate(w3d):
        save(os.path.join(PACK, '_W_3d_real', anim, 'frame_%03d.png' % i), px)
json.dump({
    'especie': 'Agumon (rookie), F6 Blender 3D -> pixel art, PROVA DE CONCEITO, NAO HOMOLOGADO',
    'origem': 'modelo low-poly próprio por script (scripts/agumon_blender.py), Blender ' + META['blender'],
    'licenca': 'original (modelo e scripts do estúdio); espécie de terceiros, fangame não oficial',
    'canvas': [CAN, CAN], 'ancora_pe_linha': META['ground_row'],
    'walk': '8 quadros, pé de apoio recua %.1f px por quadro' % META['px_por_quadro_tela'],
    'attack': '9 quadros, Pepper Breath, disparo no quadro 4', 'W': 'espelho exato de E',
}, open(os.path.join(PACK, 'pacote.json'), 'w'), ensure_ascii=False, indent=1)
print('pixelize ok')
