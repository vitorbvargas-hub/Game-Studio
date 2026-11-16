"""Folha de contato de um pacote: uma linha por anim/direção, escala S, fundo cinza,
grade de 8px e linha do pé (bbox inferior) marcada. Uso: sheet.py <pacote> <out.png> [escala] [filtro]"""
import sys, os, glob
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from pxpng import load_png_rgba, save_png_rgba, new_canvas, nn_scale, paste, draw_text

pk, out = sys.argv[1], sys.argv[2]
S = int(sys.argv[3]) if len(sys.argv) > 3 else 5
flt = sys.argv[4] if len(sys.argv) > 4 else ''
rows = []
for anim in ('rotations', 'walk', 'attack'):
    if anim == 'rotations':
        fs = [os.path.join(pk, anim, d + '.png') for d in 'SENW']
        fs = [f for f in fs if os.path.exists(f)]
        if fs and ('rot' in flt or not flt):
            rows.append(('rot', fs))
        continue
    for d in 'SENW':
        fs = sorted(glob.glob(os.path.join(pk, anim, d, 'frame_*.png')))
        tag = anim + '/' + d
        if fs and (not flt or flt in tag):
            rows.append((tag, fs))
imgs = {}
mw = mh = 0
for _, fs in rows:
    for f in fs:
        im = load_png_rgba(f)
        imgs[f] = im
        mw, mh = max(mw, im[0]), max(mh, im[1])
cols = max(len(fs) for _, fs in rows)
# recorte pela união das bboxes (margem 1)
x0u=y0u=10**9; x1u=y1u=-1
for f,(w,h,px) in imgs.items():
    for yy in range(h):
        for xx in range(w):
            if px[yy][xx][3]>0:
                x0u=min(x0u,xx);x1u=max(x1u,xx);y0u=min(y0u,yy);y1u=max(y1u,yy)
x0u=max(0,x0u-1);y0u=max(0,y0u-1)
for f,(w,h,px) in list(imgs.items()):
    nw=min(w,x1u+2)-x0u; nh=min(h,y1u+2)-y0u
    imgs[f]=(nw,nh,[row[x0u:x0u+nw] for row in px[y0u:y0u+nh]])
mw=max(v[0] for v in imgs.values()); mh=max(v[1] for v in imgs.values())
print('crop origin',x0u,y0u)
CW, CH = mw * S + 6, mh * S + 6
W, H = 80 + cols * CW, len(rows) * (CH + 14)
cv = new_canvas(W, H, (60, 60, 70, 255))
for ri, (tag, fs) in enumerate(rows):
    y0 = ri * (CH + 14)
    draw_text(cv, W, H, 2, y0 + 4, tag, scale=1)
    for ci, f in enumerate(fs):
        w, h, px = imgs[f]
        x0 = 80 + ci * CW
        # bg checker
        for yy in range(h * S):
            for xx in range(w * S):
                c = (120, 120, 130, 255) if ((xx // S + x0u) // 4 + (yy // S + y0u) // 4) % 2 else (135, 135, 145, 255)
                cv[y0 + 10 + yy][x0 + xx] = c
        sc = nn_scale(px, w, h, S)
        paste(cv, W, H, sc, w * S, h * S, x0, y0 + 10)
        draw_text(cv, W, H, x0, y0 + 1, str(ci), scale=1)
save_png_rgba(out, W, H, cv)
print(out, W, H)
