"""C10: recompõe a caminhada lateral (E) do Agumon v7 F2b. Cabeça, pescoço superior e cauda vêm
PIXEL A PIXEL do quadro 0 do próprio F2b (sem gerar nada); tronco, braço e pernas são redesenhados
aqui em pixel (formas definidas à mão, cores só da paleta existente do pacote). Oeste = espelho."""
import sys, os, math, json
sys.path.insert(0, os.path.dirname(__file__)); from lib import *
SRC = O + '/backup_f2b/pacote_agumon_f2'
DST = O + '/pacote_agumon_c10'
HX = {'A': (0,0,0,255), 'T': (0xcd,0x66,0x24,255), 'V': (0xd8,0x81,0x26,255), 'd': (0xef,0xaa,0x2b,255),
      'i': (0xf6,0xcb,0x6a,255), 'b': (0xe9,0xa2,0x28,255), 'l': (0xde,0xe9,0xf0,255), 'j': (0xcf,0xd9,0xe5,255),
      'C': (0x1d,0x01,0x00,255), 'B': (0x0c,0x01,0x00,255), 'g': (0xfb,0xb8,0x38,255)}
TR = (0,0,0,0)
W = H = 60
# ---- tronco redesenhado (dy=0). Cada linha: (y, x0, string). '.'=transparente, ','=mantém
TORSO = [
 (29, 28, 'ATTTTTTTAA'),
 (30, 27, 'ATddddddiA'),
 (31, 27, 'ATdddddiiiA'),
 (32, 27, 'ATdddddiiiA'),
 (33, 26, 'AATdddddiiiA'),
 (34, 25, 'AAAVdddddiiiA'),
 (35, 28, 'TdddddiiiA'),
 (36, 27, 'BTdddddiiiA'),
 (37, 27, 'ATdddddiiiA'),
 (38, 28, 'BVddddiiA'),
 (39, 28, 'ABTdddiiA'),
 (40, 27, 'TTVdddiiA'),
 (41, 30, 'VddiVA'),
]
def base_body():
    w, h, px = load(SRC + '/walk/E/frame_000.png')
    out = [[TR]*W for _ in range(H)]
    for y in range(H):
        for x in range(W):
            if y <= 41: out[y][x] = tuple(px[y][x])
    # apaga o tronco/braço antigos à direita da linha das costas
    starts = {y: x0 for y, x0, _ in TORSO}
    for y in range(29, 42):
        for x in range(max(starts[y], 27), W):
            out[y][x] = TR
    for y, x0, s in TORSO:
        for k, ch in enumerate(s):
            if ch == '.': out[y][x0+k] = TR
            elif ch != ',': out[y][x0+k] = HX[ch]
    # contorno de baixo do corpo (barriga/cauda)
    for x in range(W):
        if out[41][x][3] and out[41][x] != HX['A'] and not out[42][x][3]:
            out[42][x] = HX['A']
    return out

def disk_mask(segs, rad):
    m = set()
    for (x0,y0),(x1,y1),r in segs:
        n = int(max(abs(x1-x0), abs(y1-y0))*3)+1
        for k in range(n+1):
            t = k/n; cx = x0+(x1-x0)*t; cy = y0+(y1-y0)*t
            R = int(r)+2
            for yy in range(int(cy)-R, int(cy)+R+1):
                for xx in range(int(cx)-R, int(cx)+R+1):
                    if (xx+0.5-cx-0.5)**2 + (yy+0.5-cy-0.5)**2 <= r*r: m.add((xx,yy))
    return m

def outline4(m):
    o = set()
    for (x,y) in m:
        for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
            if (x+dx,y+dy) not in m: o.add((x+dx,y+dy))
    return o

GROUND = 48  # última linha de preenchimento do pé; contorno em 49
def foot_shape(fx, lift, kind):
    g = GROUND - lift
    rows = {}
    if kind == 'flat':
        rows = {g-2: (fx-2, fx+2), g-1: (fx-3, fx+3), g: (fx-3, fx+4)}
    elif kind == 'toe':   # calcanhar levantado, empurrando com os dedos
        rows = {g-3: (fx-3, fx-1), g-2: (fx-3, fx+2), g-1: (fx-1, fx+3), g: (fx+1, fx+4)}
    elif kind == 'heel':  # contato: dedos ainda erguidos 1px
        rows = {g-3: (fx+1, fx+4), g-2: (fx-2, fx+4), g-1: (fx-3, fx+3), g: (fx-3, fx+1)}
    m = set()
    for y,(a,b) in rows.items():
        for x in range(a, b+1): m.add((x,y))
    claws = []
    if kind == 'flat': claws = [(fx+4, g), (fx+2, g)]
    elif kind == 'toe': claws = [(fx+4, g), (fx+2, g)]
    elif kind == 'heel': claws = [(fx+4, g-2), (fx+3, g-1)]
    return m, claws, g

def leg(fx, lift, kind, dy, near):
    hip = (29.0 if near else 30.0, 41.0 + dy)
    m_foot, claws, g = foot_shape(fx, lift, kind)
    ank = (fx - 0.5, g - 2.5)
    knee = ((hip[0]+ank[0])/2 + 1.2, (hip[1]+ank[1])/2)
    m = disk_mask([(hip, knee, 3.0), (knee, ank, 2.2)], 0) | m_foot
    return m, claws

def paint_leg(img, m, claws, dy, near, body_mask):
    fill = HX['d'] if near else HX['V']
    shade = HX['b'] if near else HX['T']
    o = outline4(m)
    for (x,y) in o:
        if not (0 <= x < W and 0 <= y < H): continue
        if near and y < 43 + dy and x >= 26: continue   # quadril funde no tronco; contra a cauda fica o contorno
        if not near and (x,y) in body_mask: continue
        img[y][x] = HX['A']
    for (x,y) in m:
        if not (0 <= x < W and 0 <= y < H): continue
        if not near and (x,y) in body_mask: continue
        c = fill
        if (x-1, y) not in m: c = shade
        img[y][x] = c
    for (x,y) in claws:
        img[y][x] = HX['l'] if near else HX['j']

def arm(phase, dy, near):
    # phase em [-1, 1]: -1 mão atrás, +1 mão à frente
    sh = (31.5 if near else 32.5, 33.5 + dy)
    el = (sh[0] + 1.5 + 0.8*phase, sh[1] + 3.2)
    hd = (el[0] + 2.4 + 1.6*phase, el[1] + 1.4 - 0.6*phase)
    m = disk_mask([(sh, el, 1.25), (el, hd, 1.2)], 0)
    tip = (int(round(hd[0]))+1, int(round(hd[1])))
    return m, sh, tip

def paint_arm(img, m, sh, tip, near, body_mask):
    o = outline4(m)
    for (x,y) in o:
        if y < sh[1] - 0.5 and abs(x - sh[0]) < 2.5: continue   # ombro funde
        if not near and (x,y) in body_mask: continue
        img[y][x] = HX['A'] if (x,y) not in body_mask else HX['C']
    for (x,y) in m:
        if not near and (x,y) in body_mask: continue
        c = HX['d'] if near else HX['V']
        if (x, y+1) not in m or (x-1,y) not in m: c = HX['T'] if not near else HX['b']
        img[y][x] = c
    tx, ty = tip
    if near:
        img[ty][tx] = HX['l']; img[ty+1][tx-1] = HX['l']; img[ty+1][tx] = HX['A'] if img[ty+1][tx][3]==0 else img[ty+1][tx]
    else:
        img[ty][tx] = HX['j']

ARMS = {  # origem (x=30, y=33) com dy=0; '.'=não pinta
 'back': [
  "..CCC....",
  ".CggdC...",
  ".CgddC...",
  ".CgdddC..",
  "..CdddC..",
  "..CTddbA.",
  "...CTdlA.",
  "....AlAl."],
 'mid': [
  "..CCC......",
  ".CggdC.....",
  ".CgdddC....",
  "..CgddbC...",
  "...CTdddA..",
  "....CTddlA.",
  ".....AAlAl.",
  "......A.A.."],
 'fwd': [
  "..CCC.......",
  ".CggdC......",
  ".CgdddCC....",
  "..CTdddddA..",
  "...CTTdddlA.",
  "....AAAlAl..",
  "......A.A..."],
}
def arm_pose(ph):
    return 'fwd' if ph > 0.5 else ('back' if ph < -0.5 else 'mid')

def paint_arm2(img, ph, dy, near, body_mask):
    rows = ARMS[arm_pose(ph)]
    ox, oy = (30, 33 + dy) if near else (31, 33 + dy)
    far = {'d': 'V', 'g': 'V', 'b': 'T', 'T': 'T', 'l': 'j', 'C': 'A', 'A': 'A'}
    for r, line in enumerate(rows):
        for c, ch in enumerate(line):
            if ch == '.': continue
            x, y = ox + c, oy + r
            if not near:
                if (x, y) in body_mask: continue
                ch = far[ch]
            else:
                # contorno do braço por fora do corpo é preto puro; por dentro, marrom-escuro
                if ch == 'C' and (x, y) not in body_mask: ch = 'A'
            img[y][x] = HX[ch]

def shift(img, dy):
    out = [[TR]*W for _ in range(H)]
    for y in range(H):
        yy = y - dy
        if 0 <= yy < H: out[y] = list(img[yy])
    return out

# plano do ciclo: (dy, perna_perto, perna_longe, braço_perto)
#   perna = (fx, lift, kind)
PLAN = [
 ( 0, (37,0,'heel'), (21,0,'toe'),  -1.0),
 ( 1, (33,0,'flat'), (25,1,'flat'), -0.6),
 ( 0, (29,0,'flat'), (32,3,'flat'),  0.0),
 (-1, (25,0,'toe'),  (36,1,'flat'),  0.6),
 ( 0, (21,0,'toe'),  (37,0,'heel'),  1.0),
 ( 1, (25,1,'flat'), (33,0,'flat'),  0.6),
 ( 0, (32,3,'flat'), (29,0,'flat'),  0.0),
 (-1, (36,1,'flat'), (25,0,'toe'), -0.6),
]

def build():
    base = base_body()
    frames_out = []
    for i,(dy, nl, fl, ph) in enumerate(PLAN):
        body = shift(base, dy)
        body_mask = {(x,y) for y in range(H) for x in range(W) if body[y][x][3]}
        img = [[TR]*W for _ in range(H)]
        # braço de longe (atrás do corpo)
        paint_arm2(img, -ph, dy, False, body_mask)
        # perna de longe
        m, cl = leg(*fl, dy, False); paint_leg(img, m, cl, dy, False, body_mask)
        # corpo
        for y in range(H):
            for x in range(W):
                if body[y][x][3]: img[y][x] = body[y][x]
        m, cl = leg(*nl, dy, True); paint_leg(img, m, cl, dy, True, body_mask)
        paint_arm2(img, ph, dy, True, body_mask)
        frames_out.append(img)
    return frames_out

if __name__ == '__main__':
    fr = build()
    outdir = sys.argv[1] if len(sys.argv) > 1 else O + '/tmp/walkE_try'
    os.makedirs(outdir, exist_ok=True)
    for i, f in enumerate(fr):
        save_png_rgba(os.path.join(outdir, 'frame_%03d.png' % i), W, H, f)
    print('ok', outdir)
