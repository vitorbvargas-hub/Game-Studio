"""F8A: segmenta folhas oficiais do Hawkmon e mede cada sprite (bbox, altura, cores).
Somente leitura das folhas; grava ampliações para estudo em ../tmp e JSON de medidas.
Uso: python3 -I medir_folhas.py <folha.png> <saida_prefixo> [escala]"""
import sys, os, json
sys.dont_write_bytecode = True
sys.path.insert(0, '/home/openclaw/projects/GameStudio/workspaces/game-art/tools')
from pxpng import save_png_rgba
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pngidx import load_any as load_png_rgba

def main(p, outp, scale=4):
    w, h, px = load_png_rgba(p)
    px = [list(r) for r in px]
    bg = tuple(px[0][0])
    def isbg(c):
        return c[3] == 0 or tuple(c) == bg
    seen = [[False]*w for _ in range(h)]
    comps = []
    for y in range(h):
        for x in range(w):
            if seen[y][x] or isbg(px[y][x]):
                continue
            st = [(x, y)]; seen[y][x] = True; pts = []
            while st:
                cx, cy = st.pop(); pts.append((cx, cy))
                for dx in (-1, 0, 1):
                    for dy in (-1, 0, 1):
                        nx, ny = cx+dx, cy+dy
                        if 0 <= nx < w and 0 <= ny < h and not seen[ny][nx] and not isbg(px[ny][nx]):
                            seen[ny][nx] = True; st.append((nx, ny))
            xs = [a for a, b in pts]; ys = [b for a, b in pts]
            cols = {}
            for a, b in pts:
                k = '#%02x%02x%02x' % tuple(px[b][a][:3]); cols[k] = cols.get(k, 0)+1
            comps.append({'x0': min(xs), 'y0': min(ys), 'x1': max(xs), 'y1': max(ys),
                          'w': max(xs)-min(xs)+1, 'h': max(ys)-min(ys)+1, 'n': len(pts), 'ncores': len(cols),
                          'cores_top': sorted(cols.items(), key=lambda t: -t[1])[:12]})
    comps = [c for c in comps if c['n'] >= 40]
    comps.sort(key=lambda c: (c['y0']//20, c['x0']))
    out = [[(0, 0, 0, 0)]*(w*scale) for _ in range(h*scale)]
    for y in range(h):
        for x in range(w):
            c = tuple(px[y][x]) if not isbg(px[y][x]) else (200, 200, 200, 255)
            for dy in range(scale):
                for dx in range(scale):
                    out[y*scale+dy][x*scale+dx] = c
    save_png_rgba(outp+'_x%d.png' % scale, w*scale, h*scale, out)
    json.dump({'folha': os.path.basename(p), 'tamanho': [w, h], 'fundo': '#%02x%02x%02x%02x' % bg, 'sprites': comps},
              open(outp+'_medidas.json', 'w'), ensure_ascii=False, indent=1)
    for i, c in enumerate(comps):
        print(i, c['x0'], c['y0'], c['w'], 'x', c['h'], 'px', c['n'], 'cores', c['ncores'])

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 4)
