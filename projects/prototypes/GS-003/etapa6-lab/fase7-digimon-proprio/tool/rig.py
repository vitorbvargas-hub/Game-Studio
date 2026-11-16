"""Rig de pixel art feito à mão pelo game-studio (exceção autorizada pelo fundador, 13/11).
Desenho 100% por código: formas + contorno automático + sombreamento por direção de luz + detalhes em grade.
Sem IA, sem referência enviada a serviço externo."""
import sys
sys.path.insert(0, '/home/openclaw/projects/GameStudio/workspaces/game-art/tools')
from pxpng import save_png_rgba
from gifenc import write_gif

PAL = {
 'o': (46, 24, 10, 255),   # contorno
 'Y': (240, 164, 28, 255), # base laranja-amarelo
 'y': (255, 206, 72, 255), # luz
 'L': (255, 232, 140, 255),# brilho
 'D': (200, 112, 18, 255), # sombra
 'd': (150, 74, 12, 255),  # sombra funda
 'w': (255, 250, 236, 255),# branco/garras
 'W': (214, 206, 190, 255),# branco sombra
 'g': (66, 190, 72, 255),  # íris
 'G': (28, 110, 36, 255),  # íris escura
 'k': (16, 16, 16, 255),   # pupila
 'm': (120, 24, 24, 255),  # boca
 'r': (210, 60, 50, 255),  # língua
 'f1': (255, 110, 0, 255), 'f2': (255, 210, 60, 255), 'f3': (255, 248, 200, 255),
 's': (255, 255, 255, 255), 't': (120, 200, 255, 255), 'b': (90, 140, 230, 255), 'p': (255, 120, 160, 255),
}

class C:
    def __init__(s, w, h): s.w, s.h = w, h; s.p = [[None]*w for _ in range(h)]
    def put(s, x, y, c):
        if 0 <= x < s.w and 0 <= y < s.h: s.p[y][x] = c
    def get(s, x, y): return s.p[y][x] if 0 <= x < s.w and 0 <= y < s.h else None
    def ellipse(s, cx, cy, rx, ry, c):
        for y in range(s.h):
            for x in range(s.w):
                if ((x+.5-cx)/rx)**2 + ((y+.5-cy)/ry)**2 <= 1: s.p[y][x] = c
    def rect(s, x0, y0, x1, y1, c):
        for y in range(y0, y1+1):
            for x in range(x0, x1+1): s.put(x, y, c)
    def grid(s, x0, y0, rows, keep='.'):
        for j, r in enumerate(rows):
            for i, ch in enumerate(r):
                if ch == keep: continue
                s.put(x0+i, y0+j, None if ch == '_' else ch)
    def shade(s, base='Y', lit='y', dark='D', lx=-1, ly=-1):
        """luz vinda de cima-esquerda: borda iluminada clara, borda oposta escura"""
        src = [r[:] for r in s.p]
        for y in range(s.h):
            for x in range(s.w):
                if src[y][x] != base: continue
                if (0 <= y+ly < s.h and 0 <= x+lx < s.w and src[y+ly][x+lx] is None) or (0 <= y+ly < s.h and src[y+ly][x] is None):
                    s.p[y][x] = lit
                elif (0 <= y-ly < s.h and 0 <= x-lx < s.w and src[y-ly][x-lx] is None) or (0 <= y-ly < s.h and src[y-ly][x] is None):
                    s.p[y][x] = dark
    def outline(s, c='o'):
        src = [r[:] for r in s.p]
        for y in range(s.h):
            for x in range(s.w):
                if src[y][x] is not None: continue
                for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
                    xx, yy = x+dx, y+dy
                    if 0 <= xx < s.w and 0 <= yy < s.h and src[yy][xx] not in (None, c):
                        s.p[y][x] = c; break
    def paste(s, other, dx, dy, flip=False):
        for y in range(other.h):
            for x in range(other.w):
                c = other.p[y][other.w-1-x if flip else x]
                if c is not None: s.put(x+dx, y+dy, c)
    def flipped(s):
        n = C(s.w, s.h)
        for y in range(s.h): n.p[y] = s.p[y][::-1]
        return n
    def rgba(s):
        return [[PAL[c] if c else (0,0,0,0) for c in r] for r in s.p]

def save(frames, path, delays, scale=6):
    from pxpng import nn_scale
    big = []
    for f in frames:
        rows = nn_scale(f.rgba(), f.w, f.h, scale)
        big.append([[(p if p[3] else (40, 44, 52, 255)) for p in r] for r in rows])
    write_gif(path + '.gif', big, frames[0].w*scale, frames[0].h*scale, delays)
    w, h = frames[0].w, frames[0].h
    sheet = [[(0,0,0,0)]*(w*len(frames)) for _ in range(h)]
    for i, f in enumerate(frames):
        px = f.rgba()
        for y in range(h):
            for x in range(w): sheet[y][i*w+x] = px[y][x]
    save_png_rgba(path + '_sheet.png', w*len(frames), h, sheet)
    pv = nn_scale(frames[0].rgba(), w, h, scale)
    save_png_rgba(path + '_preview.png', w*scale, h*scale, [[(p if p[3] else (40,44,52,255)) for p in r] for r in pv])

def blob(c, cx, cy, rx, ry, base='Y', lit='y', dark='D', deep='d', hi=None):
    """elipse sombreada: luz de cima-esquerda, sombra baixo-direita (bandas de pixel art)"""
    for y in range(c.h):
        for x in range(c.w):
            nx=(x+.5-cx)/rx; ny=(y+.5-cy)/ry
            r2=nx*nx+ny*ny
            if r2>1: continue
            d=-(nx*-0.55+ny*-0.83)  # negativo = voltado para a luz
            v=nx*0.55+ny*0.83
            col=base
            if v< -0.55 and hi and r2>0.25 and r2<0.6: col=hi
            elif v< -0.38: col=lit
            elif v> 0.62: col=deep
            elif v> 0.30: col=dark
            c.p[y][x]=col
