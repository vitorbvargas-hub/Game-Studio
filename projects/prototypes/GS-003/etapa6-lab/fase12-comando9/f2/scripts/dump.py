"""Despeja um PNG como grade ASCII (1 char por cor) com legenda. Uso: dump.py a.png [b.png ...] [--crop x0,y0,x1,y1]"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from pxpng import load_png_rgba

CH = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+=?@'
args = [a for a in sys.argv[1:] if not a.startswith('--')]
crop = None
for a in sys.argv[1:]:
    if a.startswith('--crop='):
        crop = [int(v) for v in a[7:].split(',')]
leg = {}
grids = []
for p in args:
    w, h, px = load_png_rgba(p)
    x0, y0, x1, y1 = crop or (0, 0, w - 1, h - 1)
    g = []
    for y in range(y0, y1 + 1):
        s = ''
        for x in range(x0, x1 + 1):
            c = px[y][x]
            if c[3] == 0:
                s += '.'
            else:
                k = c[:3]
                if k not in leg:
                    leg[k] = CH[len(leg) % len(CH)]
                s += leg[k]
        g.append('%2d %s' % (y, s))
    grids.append((p, g, x0))
for p, g, x0 in grids:
    print('##', os.path.relpath(p), 'x0=', x0)
    print('   ' + ''.join(str((x0 + i) % 10) for i in range(len(g[0]) - 3)))
    print('\n'.join(g))
print('LEGENDA', ' '.join('%s=#%02x%02x%02x' % (v, *k) for k, v in leg.items()))
