"""F2b: oscilação vertical do corpo no andar. Por quadro: centróide vertical (y médio dos opacos, mesma
medida do QA) e topo do bbox; amplitude = máx - mín. Uso: oscilacao.py rotulo=pacote [...]"""
import sys, os, json
sys.path.insert(0, os.path.dirname(__file__))
from f2lib import load_pack, sole_y, foot_y
res = {}
for arg in sys.argv[1:]:
    tag, pk = arg.split('=', 1)
    d, _ = load_pack(pk)
    for k in ('walk/S', 'walk/E', 'walk/N', 'walk/W'):
        if k not in d: continue
        cs = []; tops = []; soles = []; lows = []
        for f in d[k]:
            ys = [y for y in range(f.h) for x in range(f.w) if f.px[y][x][3]]
            cs.append(sum(ys) / len(ys)); tops.append(min(ys)); soles.append(sole_y(f)); lows.append(foot_y(f))
        res.setdefault(k, {})[tag] = dict(cent=[round(c, 1) for c in cs], amp=round(max(cs) - min(cs), 1),
            topo=tops, amp_topo=max(tops) - min(tops), sola=sorted(set(soles)), mais_baixo=sorted(set(lows)))
for k, v in res.items():
    for tag, m in v.items():
        print('%-7s %-5s amp_cent %.1f  amp_topo %d  sola %s  px_mais_baixo %s  cent %s  topo %s' % (k, tag, m['amp'], m['amp_topo'], m['sola'], m['mais_baixo'], m['cent'], m['topo']))
