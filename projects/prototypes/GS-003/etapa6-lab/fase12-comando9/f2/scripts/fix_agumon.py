import sys, os, time, json
sys.path.insert(0, os.path.dirname(__file__))
from f2lib import *

SRC = '/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/etapa6-lab/fase9-pixellab-d12/pacote_agumon_v7'
DST = '/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/etapa6-lab/fase12-comando9/f2/pacote_agumon_f2'
data, rot = load_pack(SRC)
ORIG, _ = load_pack(SRC)  # F2b: referência intocada para a trava de oscilação
log = []
STEP = sys.argv[1] if len(sys.argv) > 1 else 'all'


def L(tag, msg, n):
    log.append({'correcao': tag, 'detalhe': msg, 'quadros': n})
    print(tag, '|', msg, '|', n)


# 1) walk/S: cabeça travada no quadro 0 (remove a crista dos quadros 2-7, iguala olhos e boca)
ws = data['walk/S']
ref = ws[0].copy()
HEAD = (19, 14, 40, 30)   # cabeça do quadro 0 (topo 14, pescoço 31)
FACE = (21, 16, 38, 28)
offs = []
for i, f in enumerate(ws):
    if i == 0:
        offs.append((0, 0)); continue
    dx, dy = match_offset(f, ref, FACE, rng=4, rngx=2)
    offs.append((dx, dy))
    # limpa tudo acima do pescoço deslocado (inclui a crista) e cola a cabeça de referência
    erase(f, (HEAD[0] - 4 + dx, 0, HEAD[2] + 4 + dx, HEAD[3] + dy))
    paste_region(f, ref, HEAD, dx, dy)
L('walk/S cabeça', 'cabeça do quadro 0 recolada (sem crista, olhos/boca estáveis); offsets %s' % offs, 7)

# 2) pés marrons -> laranja (walk/S 4-5, attack) : marrom escuro avermelhado fora do contorno
BROWN = [(0x50, 0x26, 0x1b), (0x3a, 0x20, 0x22), (0x6c, 0x39, 0x24), (0x67, 0x47, 0x3f), (0x6d, 0x45, 0x34), (0x79, 0x54, 0x3d)]
ORANGE = (0xf0, 0xaf, 0x32, 255); ORANGE_D = (0xc5, 0x7f, 0x3a, 255)
n = 0
for k in ('walk/S',):
    for f in data[k]:
        bb = f.bbox()
        foot = (0, bb[3] - 6, f.w - 1, bb[3])
        c1 = recolor(f, lambda c: any(dist(c, b) < 14 for b in BROWN[:1]), ORANGE, foot)
        c2 = recolor(f, lambda c: any(dist(c, b) < 14 for b in BROWN[1:]), ORANGE_D, foot)
        n += (c1 + c2) > 0
L('walk/S pés', 'pés marrons (#50261b/#3a2022) viram o laranja do corpo', n)

# 3) attack/S: chamas soltas acima da cabeça (q3, q4, q5) -> removidas; contorno do topo da cabeça refeito
a = data['attack/S']
fire = lambda c: c[0] > 200 and (c[1] < 110 or c[1] > 190) and c[2] < 200 or (c[0] > 110 and c[1] < 20)
n1 = erase(a[3], (12, 0, 46, 17))
n2 = erase(a[4], (12, 0, 46, 17))
for x in range(22, 38):
    a[4].set(x, 18, a[6].get(x, 18))
n3 = erase(a[5], (12, 0, 46, 15))
L('attack/S efeito', 'chama solta acima da cabeça removida (%d+%d+%d px); topo da cabeça do q4 refeito com o contorno do q6' % (n1, n2, n3), 3)

# 4) attack/N: q3-q6 mostravam ROSTO nas costas e o fogo descendo pelo corpo.
#    Novo intermediário: corpo de costas do q2 (braços erguidos) + bola de fogo subindo atrás da cabeça.
an = data['attack/N']
srcfire = an[4].copy()
ball = {}
for y in range(33, 50):
    for x in range(18, 38):
        c = srcfire.get(x, y)
        if c[3] and c[0] >= 0xf0 and c[1] >= 0xd0:
            ball[(x, y)] = c
bx0 = min(p[0] for p in ball); by0 = min(p[1] for p in ball)
bx1 = max(p[0] for p in ball); by1 = max(p[1] for p in ball)
RIM = (0xfb, 0x19, 0x03, 255)   # vermelho do próprio Pepper Breath (attack/S)

def put_ball(f, cx, top, src=None):
    # contorno vermelho em volta da bola, depois a bola; só em pixels transparentes (atrás da cabeça)
    # F2b: nunca desenha nas linhas 0 (borda do canvas fica transparente)
    src = ball if src is None else src
    sx0 = min(p[0] for p in src); sy0 = min(p[1] for p in src)
    pts = {(x - sx0 + cx, y - sy0 + top): c for (x, y), c in src.items()}
    rim = set()
    for (x, y) in pts:
        for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
            q = (x + dx, y + dy)
            if q not in pts:
                rim.add(q)
    for q in rim:
        if q[1] >= 1 and not f.op(*q):
            f.set(q[0], q[1], RIM)
    for q, c in pts.items():
        if q[1] >= 1 and not f.op(*q):
            f.set(q[0], q[1], c)

base = an[2].copy()
bw = bx1 - bx0 + 1; bh = by1 - by0 + 1
head_top = base.bbox()[1]
cx = (base.bbox()[0] + base.bbox()[2]) // 2 - bw // 2
# F2b: bola menor = miolo da própria bola (disco de raio 4 em volta do centro), recorte sem reescala
mcx = (bx0 + bx1) / 2.0; mcy = (by0 + by1) / 2.0 + 1
core = {p: c for p, c in ball.items() if (p[0] - mcx) ** 2 + (p[1] - mcy) ** 2 <= 4.6 ** 2}
cw = max(p[0] for p in core) - min(p[0] for p in core) + 1
# F2b: trajetória dentro do canvas (contorno vermelho começa em y>=1; antes a bola saía pelo topo)
#  q3: bola grande nascendo atrás da cabeça; q4: disparo (corpo recua 1 px), bola grande no alto;
#  q5: bola menor (afastando-se, vista de costas) no alto; q6: faíscas
for i in (3, 4, 5, 6):
    f = base.copy()
    if i == 4:
        shift(f, 0, 1)  # recuo de 1 px no disparo
    if i == 3:
        put_ball(f, cx, 5)
    elif i == 4:
        put_ball(f, cx, 2)
    elif i == 5:
        put_ball(f, cx + (bw - cw) // 2, 2, core)
    else:  # q6: faíscas pequenas no alto, abaixo da borda
        for (sx, sy) in ((cx + 3, 3), (cx + bw - 4, 5), (cx + bw // 2, 1)):
            for dx in (0, 1):
                for dy in (0, 1):
                    f.set(sx + dx, sy + dy, RIM if (dx + dy) else (0xfd, 0xdb, 0x82, 255))
    an[i] = f
an[7] = base.copy()  # q7 original tinha cabeça com 'orelhas de urso' (forma diferente): volta às costas do q2
L('attack/N intermediário', 'q3-q6 refeitos: costas do q2 (sem rosto) + bola de fogo do próprio sprite subindo atrás da cabeça; bola %dx%d; F2b: trajetória dentro do canvas (topo >= 1), q5 com o miolo %dpx da própria bola' % (bw, bh, cw), 4)

# 5) barriga creme/branca (não existe na ficha) -> laranja claro do próprio sprite (#f6cb6a)
LIGHT = (0xf6, 0xcb, 0x6a, 255)
cream = lambda c: c[0] >= 0xd8 and c[1] >= 0xb0 and 0x60 <= c[2] <= 0xd8 and c[0] - c[2] > 24 and c[1] - c[2] > 8 and c[2] > 0x70
tot = 0; nq = 0
for k in ('walk/E', 'walk/W', 'walk/S', 'attack/E', 'attack/W'):
    for f in data[k]:
        rect = (0, 33, f.w - 1, f.h - 1) if k.startswith('attack') else None
        n = recolor(f, cream, LIGHT, rect)
        tot += n; nq += n > 0
L('barriga', 'creme/branco da barriga (%d px) vira laranja claro #f6cb6a' % tot, nq)

# 5b) F2b: andar L/O, perna/pé de trás em laranja-ferrugem (#cd6624) lia como "sapato".
#     Troca pela sombra laranja do próprio sprite (#d88126), só na perna de trás (abaixo da faixa
#     da cauda: componente ferrugem conectado à linha y>=43, limitado a y>=41).
RUST = (0xcd, 0x66, 0x24); SHADOW = (0xd8, 0x81, 0x26, 255)
tot = 0; nq = 0
for f in data['walk/E']:
    seeds = [(x, y) for y in range(43, f.h) for x in range(f.w) if f.op(x, y) and dist(f.get(x, y), RUST) <= 12]
    seen = set(seeds); st = list(seeds)
    while st:
        x, y = st.pop()
        for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
            q = (x + dx, y + dy)
            if q not in seen and q[1] >= 41 and f.op(*q) and dist(f.get(*q), RUST) <= 12:
                seen.add(q); st.append(q)
    for q in seen:
        f.set(q[0], q[1], SHADOW)
    tot += len(seen); nq += bool(seen)
L('walk/E pé de trás', 'ferrugem (#cd6624 e vizinhas a <=12 RGB) da perna de trás vira a sombra laranja #d88126 (%d px)' % tot, nq)

# 6) pé na mesma linha em todo o andar
for k in ('walk/S', 'walk/E', 'walk/N', 'walk/W'):
    ys, t, dys = align_feet(data[k], ref=ORIG[k])  # F2b: sola + trava de oscilação
    ys2 = [foot_y(f) for f in data[k]]
    L(k + ' pé', 'sola %s -> %s (alvo %d), dy por quadro %s' % (sorted(set(ys)), sorted(set(sole_y(f) for f in data[k])), t, dys), sum(1 for d in dys if d))

# 7) paleta: cores quase iguais (dist<=10) unificadas por animação (invisível; tira ruído)
for k, fr in data.items():
    a_, b_, ch = snap_palette(fr, 10)
    L(k + ' paleta', '%d -> %d cores (%d px)' % (a_, b_, ch), len(fr))

data['walk/W'] = [mirror(f) for f in data['walk/E']]
data['attack/W'] = [mirror(f) for f in data['attack/E']]
L('W', 'oeste = espelho exato do leste corrigido (como no original)', 17)

if STEP == 'all':
    save_pack(SRC, DST, data, rot, {'log': log})
else:
    save_pack(SRC, '/tmp/f2ag', data, rot, {'log': log})
