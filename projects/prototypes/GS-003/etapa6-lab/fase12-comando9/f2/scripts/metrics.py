"""Métricas objetivas por quadro de um pacote: bbox, altura, linha do pé, pixels soltos
(componentes opacos 8-conexos de tamanho <= 3 separados do corpo), cores únicas.
Uso: metrics.py <pacote> [json_out]"""
import sys, os, glob, json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from pxpng import load_png_rgba


def comps(px, w, h):
    seen = [[False] * w for _ in range(h)]
    out = []
    for y in range(h):
        for x in range(w):
            if px[y][x][3] > 0 and not seen[y][x]:
                st = [(x, y)]; seen[y][x] = True; c = []
                while st:
                    cx, cy = st.pop(); c.append((cx, cy))
                    for dy in (-1, 0, 1):
                        for dx in (-1, 0, 1):
                            nx, ny = cx + dx, cy + dy
                            if 0 <= nx < w and 0 <= ny < h and not seen[ny][nx] and px[ny][nx][3] > 0:
                                seen[ny][nx] = True; st.append((nx, ny))
                out.append(c)
    out.sort(key=len, reverse=True)
    return out


def frame_metrics(path):
    w, h, px = load_png_rgba(path)
    cs = comps(px, w, h)
    main = cs[0] if cs else []
    xs = [p[0] for p in main]; ys = [p[1] for p in main]
    cols = set()
    semi = 0
    for row in px:
        for c in row:
            if c[3] > 0:
                cols.add(c[:3])
                if c[3] < 255: semi += 1
    return {
        'w': w, 'h': h,
        'bbox': [min(xs), min(ys), max(xs), max(ys)] if main else None,
        'altura': (max(ys) - min(ys) + 1) if main else 0,
        'largura': (max(xs) - min(xs) + 1) if main else 0,
        'pe_y': max(ys) if main else None,
        'soltos_px': sum(len(c) for c in cs[1:] if len(c) <= 3),
        'componentes_extra': len(cs) - 1,
        'cores': len(cols),
        'semi_alpha': semi,
    }


def pack_metrics(pk):
    res = {}
    for anim in ('walk', 'attack'):
        for d in 'SENW':
            fs = sorted(glob.glob(os.path.join(pk, anim, d, 'frame_*.png')))
            if fs:
                res[anim + '/' + d] = [frame_metrics(f) for f in fs]
    return res


def summary(res):
    out = {}
    for k, fr in res.items():
        alt = [m['altura'] for m in fr]; pe = [m['pe_y'] for m in fr]
        out[k] = {
            'n': len(fr),
            'altura_min_max': [min(alt), max(alt)],
            'var_altura': max(alt) - min(alt),
            'pe_y_distintos': sorted(set(pe)),
            'soltos_px': sum(m['soltos_px'] for m in fr),
            'comp_extra': sum(m['componentes_extra'] for m in fr),
            'semi_alpha': sum(m['semi_alpha'] for m in fr),
            'cores_total': None,
        }
    return out


if __name__ == '__main__':
    r = pack_metrics(sys.argv[1])
    s = summary(r)
    for k, v in s.items():
        print(k, v)
    if len(sys.argv) > 2:
        json.dump({'quadros': r, 'resumo': s}, open(sys.argv[2], 'w'), indent=1)
