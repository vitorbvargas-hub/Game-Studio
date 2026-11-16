import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from f2lib import *

SRC = '/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/etapa6-lab/fase9-pixellab-d12/pacote_gomamon_v2'
DST = '/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/etapa6-lab/fase12-comando9/f2/pacote_gomamon_f2'
data, rot = load_pack(SRC)
ORIG, _ = load_pack(SRC)  # F2b: referência intocada para a trava de oscilação
log = []
STEP = sys.argv[1] if len(sys.argv) > 1 else 'all'


def L(tag, msg, n):
    log.append({'correcao': tag, 'detalhe': msg, 'quadros': n})
    print(tag, '|', msg, '|', n)


red = lambda c: c[0] > 0x80 and c[1] < 0x40 and c[2] < 0x40
CLAW = (0x13, 0x1c, 0x23, 255)

# 1) walk/S: cabeça+crina+orelhas travadas no quadro 0 (crina crescia, rosto subia, olho mudava)
ws = data['walk/S']
ref = ws[0].copy()
HEAD = (5, 10, 50, 39)
FACE = (23, 28, 42, 38)
offs = []
for i, f in enumerate(ws[1:], 1):
    dx, dy = match_offset(f, ref, FACE, rng=6, rngx=2)
    offs.append((dx, dy))
    erase(f, (0, 0, f.w - 1, HEAD[3] + dy))
    paste_region(f, ref, HEAD, dx, dy)
L('walk/S cabeça', 'cabeça, crina e orelhas do q0 recoladas (crina deixava de crescer/encolher); offsets %s' % offs, 7)

# 2) walk/S: garras vermelhas -> escuras; manchas brancas soltas ao lado do corpo
n = 0; nb = 0
for f in ws:
    n += recolor(f, lambda c: (c[0] > c[2] + 25 and c[0] > 0x25) or (c[1] > c[0] + 40 and c[1] > c[2] + 40), CLAW, (0, 40, f.w - 1, f.h - 1)) > 0
    nb += drop_small_components(f, 30)
L('walk/S garras', 'garras vermelhas viram escuras (#131c23)', n)
L('walk/S limpeza', 'manchas/pixels soltos fora do corpo removidos (%d px)' % nb, 8)

# 3) walk/E (W = espelho): cabeça travada no q0 (gota ciano na boca, traço solto na crina, orelha roxa trocando)
we = data['walk/E']
ref = we[0].copy()
HEAD_A = (16, 10, 48, 27)
HEAD_B = (27, 28, 48, 32)
FACE = (34, 19, 45, 29)
offs = []
for i, f in enumerate(we[1:], 1):
    dx, dy = match_offset(f, ref, FACE, rng=3, rngx=2)
    offs.append((dx, dy))
    erase(f, (HEAD_A[0] + dx, 0, HEAD_A[2] + dx, HEAD_A[3] + dy))
    erase(f, (HEAD_B[0] + dx, HEAD_B[1] + dy, HEAD_B[2] + dx, HEAD_B[3] + dy))
    paste_region(f, ref, HEAD_A, dx, dy)
    paste_region(f, ref, HEAD_B, dx, dy)
cyan = lambda c: c[2] > c[0] + 50 and c[1] > c[0] + 40
nc = sum(recolor(f, cyan, (0xf5, 0xf6, 0xf7, 255)) > 0 for f in we)
L('walk/E cabeça', 'cabeça do q0 recolada (sem gota ciano, crina e orelha estáveis); offsets %s; ciano restante em %d quadros' % (offs, nc), 7)

# 4) walk/N: costas 'lisas' -> 2 manchas roxas no dorso (ficha: manchas roxas nas costas), seguindo o corpo
wn = data['walk/N']
ref = wn[0].copy()
BODY = (14, 27, 36, 38)
P1 = (0x76, 0x5b, 0x8c, 255); P2 = (0x63, 0x4f, 0x85, 255)
SPOTS = [(14, 31), (32, 31), (22, 35)]
shape = [((0, 0), P1), ((1, 0), P1), ((0, 1), P1), ((1, 1), P2)]
for f in wn:
    dx, dy = match_offset(f, ref, BODY, rng=2, rngx=2)
    for sx, sy in SPOTS:
        for (ox, oy), c in shape:
            x, y = sx + ox + dx, sy + oy + dy
            p = f.get(x, y)
            if p[3] and lum(p) > 170:
                f.set(x, y, c)
L('walk/N costas', '3 manchas roxas 2x2 no dorso (cor das manchas do próprio sprite, #765b8c/#634f85)', 8)

# 5) attack/N: crina some nos q3-q7 -> crina do q0 recolada no topo da cabeça
an = data['attack/N']
ref = an[0].copy()
crest = {}
for y in range(8, 19):
    for x in range(24, 35):
        c = ref.get(x, y)
        if c[3]:
            crest[(x, y)] = c
HEADBAND = (21, 19, 37, 24)
for i in range(2, 9):
    f = an[i]
    dx, dy = match_offset(f, ref, HEADBAND, rng=3, rngx=2)
    for (x, y), c in crest.items():
        if y <= 17 or not f.op(x + dx, y + dy):
            f.set(x + dx, y + dy, c)
L('attack/N crina', 'crina do q0 recolada nos q2-q8 (sumia nos q3-q7, encolhia nos q2 e q8)', 7)

# 6) attack/S: q5-q7 deformados (borrões pretos, corte ciano) -> intermediários simples
a = data['attack/S']
spark = {}
q5 = a[5]
cs = components(q5)
cx = (q5.bbox()[0] + q5.bbox()[2]) / 2
for c in cs[1:]:
    if len(c) <= 40:
        for p in c:
            spark[p] = q5.get(*p)
new5 = a[4].copy()
for p, c in spark.items():
    if p[0] > cx and not new5.op(*p):
        new5.set(p[0], p[1], c)
a[5] = new5
a[6] = a[3].copy()
a[7] = a[2].copy()
L('attack/S intermediário', 'q5 = golpe do q4 + faísca de impacto do próprio q5; q6 = q3; q7 = q2 (volta limpa)', 3)
n = sum(recolor(f, red, CLAW, (0, 40, f.w - 1, f.h - 1)) > 0 for f in a)
L('attack/S garras', 'garras vermelhas -> escuras', n)

# 7) attack/E: faísca branca solta do q5 fica (é efeito); só garras vermelhas
n = sum(recolor(f, red, CLAW, (0, 38, f.w - 1, f.h - 1)) > 0 for f in data['attack/E'])
L('attack/E garras', 'garras vermelhas -> escuras', n)

# 8) pé na mesma linha (andar)
for k in ('walk/S', 'walk/E', 'walk/N'):
    ys, t, dys = align_feet(data[k], ref=ORIG[k])  # F2b: sola + trava de oscilação
    L(k + ' pé', 'sola %s -> %s (alvo %d), dy por quadro %s' % (sorted(set(ys)), sorted(set(sole_y(f) for f in data[k])), t, dys), sum(1 for d in dys if d))

# 9) paleta: quase iguais unificadas
for k, fr in data.items():
    if k.endswith('/W'):
        continue
    a_, b_, ch = snap_palette(fr, 10)
    L(k + ' paleta', '%d -> %d cores (%d px)' % (a_, b_, ch), len(fr))

# W = espelho exato do E (como no pacote original)
data['walk/W'] = [mirror(f) for f in data['walk/E']]
data['attack/W'] = [mirror(f) for f in data['attack/E']]
L('W', 'oeste regenerado como espelho do leste corrigido', 17)

save_pack(SRC, DST if STEP == 'all' else '/tmp/f2go', data, rot, {'log': log})
