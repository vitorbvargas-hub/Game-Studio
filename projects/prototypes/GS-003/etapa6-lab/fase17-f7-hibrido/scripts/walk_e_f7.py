"""F7: caminhada lateral (E) do Agumon. Base = rotação E do F2b (pose parada aprovada), pixel a pixel:
cabeça, tronco, barriga clara e cauda são do F2b. Pernas redesenhadas (técnica do C10: pé plantado),
com passada de 3 px/quadro (gabarito F6). Braço: 5 poses desenhadas à mão (a do meio é o braço original
do F2b), balanço de ~5 px (garras de x≈28 a x≈33) em oposição à perna de perto. Cauda: a ponta atrasa 1 quadro. W = espelho."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
W = H = 60
OX, OY = 6, 5       # registro rot48 -> canvas 60
HXC = {'A': (0,0,0,255), 'T': rgb('cd6624'), 'V': rgb('d88126'), 'd': rgb('efaa2b'), 'i': rgb('f6cb6a'),
       'b': rgb('e9a228'), 'l': rgb('dee9f0'), 'j': rgb('cfd9e5'), 'C': rgb('1d0100'), 'g': rgb('fbb838'),
       'B': rgb('ce6925')}
TR = (0,0,0,0)
def rot_e():
    return pad(load(F2B + '/rotations/E.png'), W, H, OX, OY)[2]

def body_noarm(src):
    b = [list(map(tuple, r)) for r in src]
    d = HXC['d']
    for y in range(32, 40):
        for x in range(28, 33):
            if b[y][x][3] and b[y][x] not in (rgb('fbe598'), rgb('f6cb6a')): b[y][x] = d
    for y in (37, 38, 39): b[y][26] = d; b[y][27] = d
    for x in range(27, 33): b[40][x] = d
    for x in range(27, 32): b[41][x] = d
    b[40][34] = HXC['A']
    return b

ARMS = {  # (y, x0, linha) em coordenadas absolutas com dy=0. Estilo do braço original: linha da frente
          # escura, costas do braço só em sombra no ombro (laço aberto) e escura no antebraço
 'b2': [(33,28,'TdddC'),(34,28,'TdddC'),(35,27,'TdddC'),(36,27,'CdddC'),(37,27,'CTdC'),
        (38,26,'CTddC'),(39,26,'CldlC'),(40,27,'AAA')],
 'b1': [(33,28,'TdddC'),(34,28,'TdddC'),(35,28,'TdddC'),(36,28,'TddC'),(37,27,'CTddC'),
        (38,27,'CTddC'),(39,27,'CldlC'),(40,28,'AAA')],
 'f0': [(33,28,'TdddC'),(34,28,'TdddC'),(35,28,'TdddC'),(36,29,'TddC'),(37,29,'CTddC'),
        (38,29,'CTddC'),(39,29,'CldlC'),(40,30,'AAA')],
 'f1': [(33,28,'TdddC'),(34,28,'TdddC'),(35,29,'TdddC'),(36,29,'CTddC'),(37,30,'CTddC'),
        (38,30,'CTddC'),(39,31,'CldlC'),(40,32,'AAA')],
}
FAR = {'d': 'V', 'g': 'V', 'b': 'T', 'T': 'T', 'l': 'j', 'C': 'A', 'A': 'A'}
def paint_arm(img, pose, dy, near, body_mask):
    for (y, x0, s) in ARMS[pose]:
        for k, ch in enumerate(s):
            x, yy = x0 + k + (0 if near else 1), y + dy
            if near:
                if ch == 'C' and (x, yy) not in body_mask: ch = 'A'
            else:
                if (x, yy) in body_mask: continue
                ch = FAR[ch]
            img[yy][x] = HXC[ch]

def disk_mask(segs):
    m = set()
    for (x0,y0),(x1,y1),r in segs:
        n = int(max(abs(x1-x0), abs(y1-y0))*3)+1
        for k in range(n+1):
            t = k/n; cx = x0+(x1-x0)*t; cy = y0+(y1-y0)*t
            R = int(r)+2
            for yy in range(int(cy)-R, int(cy)+R+1):
                for xx in range(int(cx)-R, int(cx)+R+1):
                    if (xx-cx)**2 + (yy-cy)**2 <= r*r: m.add((xx,yy))
    return m
def outline4(m):
    o = set()
    for (x,y) in m:
        for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
            if (x+dx,y+dy) not in m: o.add((x+dx,y+dy))
    return o
GROUND = 48
def foot_shape(fx, lift, kind):
    g = GROUND - lift
    if kind == 'flat':  rows = {g-2: (fx-2, fx+2), g-1: (fx-3, fx+3), g: (fx-3, fx+3)}; claws = [(fx+3, g), (fx+1, g)]
    elif kind == 'toe': rows = {g-3: (fx-3, fx-1), g-2: (fx-3, fx+1), g-1: (fx-2, fx+2), g: (fx, fx+3)}; claws = [(fx+3, g), (fx+1, g)]
    elif kind == 'heel':rows = {g-3: (fx+1, fx+3), g-2: (fx-2, fx+3), g-1: (fx-3, fx+3), g: (fx-3, fx)}; claws = [(fx+3, g-2), (fx+3, g-1)]
    m = {(x,y) for y,(a,b) in rows.items() for x in range(a, b+1)}
    return m, claws, g
def leg(fx, lift, kind, dy, near):
    hip = (29.0 if near else 30.0, 41.0 + dy)
    m_foot, claws, g = foot_shape(fx, lift, kind)
    ank = (fx - 0.5, g - 2.5)
    knee = ((hip[0]+ank[0])/2 + 1.0, (hip[1]+ank[1])/2)
    m = disk_mask([(hip, knee, 2.9), (knee, ank, 2.1)]) | m_foot
    return m, claws
def paint_leg(img, m, claws, dy, near, body_mask):
    fill = HXC['d'] if near else HXC['V']
    shade = HXC['B'] if near else HXC['T']
    o = outline4(m)
    for (x,y) in o:
        if not (0 <= x < W and 0 <= y < H): continue
        if near and y < 43 + dy and x >= 26: continue
        if not near and (x,y) in body_mask: continue
        img[y][x] = HXC['A']
    for (x,y) in m:
        if not (0 <= x < W and 0 <= y < H): continue
        if not near and (x,y) in body_mask: continue
        c = fill
        if (x-1, y) not in m: c = shade
        img[y][x] = c
    for (x,y) in claws:
        if (x,y) in m: img[y][x] = HXC['l'] if near else HXC['j']

def shift_region(img, dy, pred):
    """desloca verticalmente só os pixels (x,y) com pred(x)"""
    out = [list(r) for r in img]
    for y in range(H):
        for x in range(W):
            if pred(x): out[y][x] = TR
    for y in range(H):
        for x in range(W):
            if pred(x) and img[y][x][3] and 0 <= y+dy < H: out[y+dy][x] = img[y][x]
    return out
def shift(img, dy):
    out = [[TR]*W for _ in range(H)]
    for y in range(H):
        if 0 <= y-dy < H: out[y] = list(img[y-dy])
    return out

DY = [0, 1, 0, -1, 0, 1, 0, -1]
# (perna_perto, perna_longe, braço_perto, braço_longe)
PLAN = [
 ((35,0,'heel'), (23,0,'toe'),  'b2', 'f1'),
 ((32,0,'flat'), (26,1,'flat'), 'b1', 'f0'),
 ((29,0,'flat'), (30,3,'flat'), 'mid','mid'),
 ((26,0,'flat'), (34,1,'flat'), 'f0', 'b1'),
 ((23,0,'toe'),  (35,0,'heel'), 'f1', 'b2'),
 ((26,1,'flat'), (32,0,'flat'), 'f0', 'b1'),
 ((30,3,'flat'), (29,0,'flat'), 'mid','mid'),
 ((34,1,'flat'), (26,0,'flat'), 'b1', 'f0'),
]
def build():
    src = rot_e()
    up_orig = [[tuple(src[y][x]) if y <= 41 else TR for x in range(W)] for y in range(H)]
    na = body_noarm(src)
    up_na = [[tuple(na[y][x]) if y <= 41 else TR for x in range(W)] for y in range(H)]
    out = []
    for i, (nl, fl, an, af) in enumerate(PLAN):
        dy = DY[i]
        base = up_orig if an == 'mid' else up_na
        base = [list(r) for r in base]
        # fecha por baixo (barriga/cauda)
        for x in range(W):
            if base[41][x][3] and base[41][x] != HXC['A'] and sum(base[41][x][:3]) > 60: base[42][x] = HXC['A']
        tip = DY[(i-1) % 8] - dy
        base = shift_region(base, tip, lambda x: x <= 18)
        body = shift(base, dy)
        bm = {(x,y) for y in range(H) for x in range(W) if body[y][x][3]}
        img = [[TR]*W for _ in range(H)]
        if af != 'mid': paint_arm(img, af, dy, False, bm)
        m, cl = leg(*fl, dy, False); paint_leg(img, m, cl, dy, False, bm)
        for y in range(H):
            for x in range(W):
                if body[y][x][3]: img[y][x] = body[y][x]
        m, cl = leg(*nl, dy, True); paint_leg(img, m, cl, dy, True, bm)
        if an != 'mid': paint_arm(img, an, dy, True, bm)
        out.append((W, H, img))
    return out
if __name__ == '__main__':
    fr = build()
    d = sys.argv[1] if len(sys.argv) > 1 else O + '/tmp/walkE_try'
    for i, f in enumerate(fr): save('%s/frame_%03d.png' % (d, i), f)
    save(O + '/tmp/walkE_try_a.png', sheet(fr[:4], 8, cols=4)); save(O + '/tmp/walkE_try_b.png', sheet(fr[4:], 8, cols=4))
    save(O + '/tmp/walkE_try_1x.png', sheet(fr, 2, cols=8))
    print('ok')
