"""Mede altura/largura dos minis de campo excluindo a cor da sombra. Uso: folha.png medidas.json idx,idx,... #sombra"""
import sys, os, json
sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pngidx import load_any
w, h, px = load_any(sys.argv[1]); d = json.load(open(sys.argv[2]))
idx = [int(i) for i in sys.argv[3].split(',')]; sh = sys.argv[4].lower()
bg = tuple(px[0][0])
for i in idx:
    s = d['sprites'][i]; pts = []
    for y in range(s['y0'], s['y1']+1):
        for x in range(s['x0'], s['x1']+1):
            c = px[y][x]
            if c[3] and tuple(c) != bg and '#%02x%02x%02x' % tuple(c[:3]) != sh: pts.append((x, y))
    xs = [a for a, b in pts]; ys = [b for a, b in pts]
    # altura do topete: linhas acima do primeiro pixel branco/cinza da cabeça
    print(i, 'corpo %dx%d' % (max(xs)-min(xs)+1, max(ys)-min(ys)+1), 'px', len(pts))
