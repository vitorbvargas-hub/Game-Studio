"""Imprime, por linha do sprite, quantos pixels são sombra-escura vs. corpo, para achar onde a sombra começa.
Uso: folha.png medidas.json idx"""
import sys, os, json
sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pngidx import load_any
w, h, px = load_any(sys.argv[1]); d = json.load(open(sys.argv[2])); s = d['sprites'][int(sys.argv[3])]
bg = tuple(px[0][0]); DARK = {'#292121', '#212121', '#181818'}
for y in range(s['y0'], s['y1']+1):
    line = ''
    for x in range(s['x0'], s['x1']+1):
        c = px[y][x]
        if not c[3] or tuple(c) == bg: line += '.'
        else:
            k = '#%02x%02x%02x' % tuple(c[:3])
            line += {'#292121': 's', '#212121': 'S', '#181818': 'o'}.get(k, '#')
    print('%3d %s' % (y - s['y0'], line))
