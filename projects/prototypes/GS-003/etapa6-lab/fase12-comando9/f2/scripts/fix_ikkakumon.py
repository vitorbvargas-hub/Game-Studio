import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from f2lib import *

SRC = '/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/etapa6-lab/fase9-pixellab-d12/pacote_ikkakumon_v2'
DST = '/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/etapa6-lab/fase12-comando9/f2/pacote_ikkakumon_f2'
data, rot = load_pack(SRC)
ORIG, _ = load_pack(SRC)  # F2b: referência intocada para a trava de oscilação
log = []
STEP = sys.argv[1] if len(sys.argv) > 1 else 'all'


def L(tag, msg, n):
    log.append({'correcao': tag, 'detalhe': msg, 'quadros': n})
    print(tag, '|', msg, '|', n)


def heal(f, pts, bad):
    """Troca cada ponto pela cor mais comum entre os vizinhos opacos que não são 'bad'."""
    for (x, y) in pts:
        cnt = {}
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                c = f.get(x + dx, y + dy)
                if (dx or dy) and c[3] and not bad(c) and lum(c) > 120:
                    cnt[c] = cnt.get(c, 0) + 1
        if not cnt:  # sem vizinho claro: procura o pelo mais próximo (raio 3)
            for r in (2, 3):
                for dy in range(-r, r + 1):
                    for dx in range(-r, r + 1):
                        c = f.get(x + dx, y + dy)
                        if c[3] and not bad(c) and lum(c) > 120:
                            cnt[c] = cnt.get(c, 0) + 1
                if cnt:
                    break
        if cnt:
            f.set(x, y, max(cnt, key=cnt.get))


red = lambda c: c[0] > 0x40 and c[0] > c[1] + 35 and c[0] > c[2] + 30 and c[1] < 0x50
# 1) manchas vermelhas no dorso (E; W espelha) -> pelo
n = 0; px = 0
for f in data['walk/E']:
    bb = f.bbox()
    pts = [(x, y) for y in range(bb[1], 46) for x in range(0, 46) if f.get(x, y)[3] and red(f.get(x, y))]
    for _ in range(3):
        heal(f, [p for p in pts if red(f.get(*p)) or lum(f.get(*p)) < 120], lambda c: red(c) or lum(c) < 120)
    n += bool(pts); px += len(pts)
L('walk/E dorso', 'pontos vermelhos no dorso (garra vazando pela anca) viram pelo: %d px' % px, n)

# 2) pé na mesma linha
for k in ('walk/S', 'walk/E', 'walk/N'):
    ys, t, dys = align_feet(data[k], ref=ORIG[k])  # F2b: sola + trava de oscilação
    L(k + ' pé', 'sola %s -> %s (alvo %d), dy por quadro %s' % (sorted(set(ys)), sorted(set(sole_y(f) for f in data[k])), t, dys), sum(1 for d in dys if d))

# 3) pixels soltos
for k in ('walk/S', 'walk/E', 'walk/N'):
    nb = sum(drop_small_components(f, 3) for f in data[k])
    L(k + ' soltos', '%d px soltos removidos' % nb, len(data[k]))

# 4) paleta
for k in ('walk/S', 'walk/E', 'walk/N'):
    a_, b_, ch = snap_palette(data[k], 10)
    L(k + ' paleta', '%d -> %d cores (%d px)' % (a_, b_, ch), 8)

data['walk/W'] = [mirror(f) for f in data['walk/E']]
L('W', 'oeste regenerado como espelho do leste corrigido', 8)
save_pack(SRC, DST if STEP == 'all' else '/tmp/f2ik', data, rot, {'log': log})
