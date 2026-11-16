"""Comando 9 / F3 — rig 2D por partes do Agumon v7 (direção S).

Nada é gerado por IA (PixelLab 0). Entrada: rotations/S.png do pacote F2 (somente leitura).
Regras: só deslocamento inteiro, giro de 90°/espelho exatos (sem interpolação), nenhuma reescala,
nenhuma cor fora da paleta do pacote (rotations + boca do attack/S do mesmo pacote).
Uso: python3 rig_s.py  -> grava partes, quadros e folhas em ../
"""
import sys, os
sys.path.insert(0, '/home/openclaw/projects/GameStudio/workspaces/game-art/tools')
from pxpng import load_png_rgba, save_png_rgba

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(HERE)
PKG = os.path.join(OUT, '..', 'f2', 'pacote_agumon_f2')
T = (0, 0, 0, 0)
INK = (12, 5, 6, 255)           # contorno mais usado no sprite
MOUTH = (125, 0, 50, 255)       # boca do attack/S (mesmo pacote)
MOUTH2 = (134, 0, 55, 255)
TONGUE = (202, 1, 70, 255)
TOOTH = (223, 234, 242, 255)    # branco das garras (rotations/S)
SKIN = (240, 175, 50, 255)      # laranja base (rotations/S)

W = H = 48
_, _, SRC = load_png_rgba(os.path.join(PKG, 'rotations', 'S.png'))

# ---------- recorte ----------
INNER_L = {30: 19, 31: 19, 32: 18, 33: 18, 34: 18, 35: 18, 36: 18, 37: 17, 38: 17, 39: 16}
INNER_R = {30: 28, 31: 28, 32: 29, 33: 29, 34: 29, 35: 29, 36: 29, 37: 30, 38: 30, 39: 31}

def part_of(x, y):
    if y <= 26: return 'head'
    if y in INNER_L and x <= INNER_L[y]: return 'armL'
    if y in INNER_R and x >= INNER_R[y]: return 'armR'
    if y >= 39: return 'legL' if x <= 23 else 'legR'
    return 'torso'

PARTS = {n: {} for n in ('head', 'torso', 'armL', 'armR', 'legL', 'legR')}
for y in range(H):
    for x in range(W):
        c = SRC[y][x]
        if c[3]: PARTS[part_of(x, y)][(x, y)] = c

# ---------- transformações exatas ----------
def shift(p, dx, dy): return {(x + dx, y + dy): c for (x, y), c in p.items()}

def bbox(p):
    xs = [x for x, _ in p]; ys = [y for _, y in p]
    return min(xs), min(ys), max(xs), max(ys)

def rot90_out(arm, side):
    """braço caído -> braço aberto na horizontal (giro de 90°, exato). Ancora no ombro."""
    x0, y0, x1, y1 = bbox(arm)
    out = {}
    for (x, y), c in arm.items():
        v = y - y0                               # distância do ombro
        if side == 'L': out[(x1 - v, y0 + (x - x0))] = c      # giro +90°
        else:           out[(x0 + v, y0 + (x1 - x))] = c      # giro -90°
    return out

def flip_up(arm, side, lean=0):
    """braço caído -> erguido (espelho vertical exato), base no ombro; lean = cisalhamento inteiro para fora."""
    x0, y0, x1, y1 = bbox(arm)
    out = {}
    for (x, y), c in arm.items():
        ny = y0 - (y - y0) + 1                   # sobe a partir do ombro
        k = (y - y0) // 2 * lean                 # quanto mais longe do ombro, mais para fora
        nx = x - k if side == 'L' else x + k
        out[(nx, ny)] = c
    return out

def head_mouth(head, level):
    """abre a boca dentro do contorno da cabeça (desenho à mão por código; silhueta igual)."""
    h = dict(head)
    if level >= 1:
        for x in range(21, 27): h[(x, 24)] = INK; h[(x, 26)] = INK
        h[(21, 25)] = INK; h[(26, 25)] = INK
        for x in range(22, 26): h[(x, 25)] = MOUTH
    if level >= 2:   # boca escancarada: o queixo desce 1 px (só a mandíbula; topo da cabeça fixo)
        for x in range(20, 28): h[(x, 27)] = h.get((x, 26), INK)
        for x in range(21, 27): h[(x, 26)] = MOUTH2
        h[(22, 25)] = TOOTH; h[(25, 25)] = TOOTH
        h[(23, 26)] = TONGUE; h[(24, 26)] = TONGUE
        h[(21, 26)] = INK; h[(26, 26)] = INK
        h[(19, 27)] = INK; h[(28, 27)] = INK
    return h

EYE_L = [(x, y) for x in range(17, 20) for y in range(14, 20)]
EYE_R = [(x, y) for x in range(28, 31) for y in range(14, 20)]
def head_blink(head):
    h = dict(head)
    for (x, y) in EYE_L + EYE_R:
        c = h.get((x, y))
        if c is None: continue
        r, g, b, _ = c
        if (g > r and g > b) or r + g + b > 600:     # íris/brilho
            h[(x, y)] = INK if y == 17 else SKIN
    return h

# ---------- composição ----------
def is_ink(c): return c[3] and sum(c[:3]) < 200

def compose(layers):
    cv = [[T] * W for _ in range(H)]
    for p in layers:
        for (x, y), c in p.items():
            if 0 <= x < W and 0 <= y < H: cv[y][x] = c
    # fecha contorno onde uma peça saiu e deixou pele exposta ao vazio
    add = []
    for y in range(H):
        for x in range(W):
            if cv[y][x][3]: continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                X, Y = x + dx, y + dy
                if 0 <= X < W and 0 <= Y < H and cv[Y][X][3] and not is_ink(cv[Y][X]):
                    add.append((x, y)); break
    for x, y in add: cv[y][x] = INK
    return cv

P = PARTS
def body(t=0, hd=0, legs=0, arms=('down', 'down'), ad=0, mouth=0, blink=False, stretch=True):
    """t: dy do tronco; hd: dy extra da cabeça; legs: dy das pernas (≠0 só no pulo); ad: dy dos braços."""
    layers = [shift(P['legL'], 0, legs), shift(P['legR'], 0, legs)]
    if stretch and t < 0:                      # tronco subiu: a cópia de baixo preenche a barriga (1 px)
        layers.append(shift(P['torso'], 0, legs))
    layers.append(shift(P['torso'], 0, t + legs))
    for side, pose in zip('LR', arms):
        a = P['arm' + side]
        if pose == 'out': a = shift(rot90_out(a, side), 0, -1)
        elif pose == 'up': a = flip_up(a, side, lean=1)
        elif pose == 'mid': a = shift(a, -1 if side == 'L' else 1, -1)
        layers.append(shift(a, 0, t + legs + ad))
    hdp = P['head']
    if mouth: hdp = head_mouth(hdp, mouth)
    if blink: hdp = head_blink(hdp)
    if hd < 0:                                 # pescoço: a cópia de baixo da cabeça preenche 1 px
        layers.append(shift(hdp, 0, t + legs))
    layers.append(shift(hdp, 0, t + hd + legs))
    return compose(layers)

ANIMS = {
    # respiração: tronco+cabeça sobem 1 px, braços atrasam 1 quadro; pés fixos; piscar no último
    'idle': ([body(), body(t=-1, ad=1), body(t=-1), body(t=-1), body(t=0, ad=-1), body(blink=True)],
             [220, 180, 260, 180, 200, 140]),
    # feliz: agacha, sobe com braços abrindo/erguendo e boca aberta, aterrissa e assenta
    'feliz': ([body(),
               body(t=1, arms=('mid', 'mid'), mouth=1),
               body(legs=-3, arms=('out', 'out'), mouth=2),
               body(legs=-5, arms=('up', 'up'), mouth=2),
               body(legs=-3, arms=('up', 'up'), mouth=2),
               body(legs=0, t=1, arms=('out', 'out'), mouth=2),
               body(arms=('mid', 'mid'), mouth=1),
               body()],
              [160, 110, 90, 140, 90, 110, 140, 200]),
    # preparo: antecipação (agacha), inclina para trás (cabeça sobe), boca abre em 2 tempos, segura
    'preparo': ([body(),
                 body(t=1, ad=0),
                 body(t=0, hd=-1, arms=('mid', 'mid'), mouth=1),
                 body(t=-1, hd=-1, arms=('mid', 'mid'), mouth=2),
                 body(t=-1, hd=-1, arms=('out', 'out'), mouth=2),
                 body(t=-1, hd=-1, arms=('out', 'out'), ad=-1, mouth=2)],
                [180, 160, 120, 120, 160, 300]),
}

if __name__ == '__main__':
    pdir = os.path.join(HERE, 'partes_S'); os.makedirs(pdir, exist_ok=True)
    for n, p in PARTS.items():
        cv = [[T] * W for _ in range(H)]
        for (x, y), c in p.items(): cv[y][x] = c
        save_png_rgba(os.path.join(pdir, n + '.png'), W, H, cv)
    for name, (frames, delays) in ANIMS.items():
        d = os.path.join(OUT, 'anim_%s_S' % name); os.makedirs(d, exist_ok=True)
        for f in os.listdir(d): os.remove(os.path.join(d, f))
        for i, f in enumerate(frames): save_png_rgba(os.path.join(d, 'frame_%03d.png' % i), W, H, f)
        with open(os.path.join(d, 'delays_ms.txt'), 'w') as fh: fh.write(' '.join(map(str, delays)) + '\n')
    print('ok', {k: len(v[0]) for k, v in ANIMS.items()})
