"""F2: biblioteca de polimento. Só reorganiza pixels do PRÓPRIO sprite (sem gerar, sem
copiar arte de terceiros). Grades: px[y][x] = (r,g,b,a)."""
import os, sys, glob, shutil, json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from pxpng import load_png_rgba, save_png_rgba

T = (0, 0, 0, 0)


class Fr:
    def __init__(self, path=None, w=None, h=None, px=None):
        if path:
            self.w, self.h, self.px = load_png_rgba(path)
        else:
            self.w, self.h, self.px = w, h, px

    def copy(self):
        return Fr(w=self.w, h=self.h, px=[list(r) for r in self.px])

    def get(self, x, y):
        if 0 <= x < self.w and 0 <= y < self.h:
            return self.px[y][x]
        return T

    def set(self, x, y, c):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.px[y][x] = c

    def op(self, x, y):
        return self.get(x, y)[3] > 0

    def save(self, path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        save_png_rgba(path, self.w, self.h, self.px)

    def bbox(self):
        xs = []; ys = []
        for y in range(self.h):
            for x in range(self.w):
                if self.px[y][x][3] > 0:
                    xs.append(x); ys.append(y)
        return (min(xs), min(ys), max(xs), max(ys)) if xs else None


def dist(a, b):
    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2) ** 0.5


def lum(c):
    return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]


# ---------- limpeza ----------
def components(f):
    seen = set(); out = []
    for y in range(f.h):
        for x in range(f.w):
            if f.op(x, y) and (x, y) not in seen:
                st = [(x, y)]; seen.add((x, y)); c = []
                while st:
                    cx, cy = st.pop(); c.append((cx, cy))
                    for dy in (-1, 0, 1):
                        for dx in (-1, 0, 1):
                            n = (cx + dx, cy + dy)
                            if n not in seen and f.op(*n):
                                seen.add(n); st.append(n)
                out.append(c)
    out.sort(key=len, reverse=True)
    return out


def drop_small_components(f, maxsize, region=None):
    """Apaga componentes desconectados do corpo com <= maxsize px (opcional: só dentro de region)."""
    n = 0
    for c in components(f)[1:]:
        if len(c) <= maxsize:
            if region and not all(inrect(p, region) for p in c):
                continue
            for x, y in c:
                f.set(x, y, T); n += 1
    return n


def inrect(p, r):
    return r[0] <= p[0] <= r[2] and r[1] <= p[1] <= r[3]


def erase(f, rect, pred=None):
    n = 0
    for y in range(rect[1], rect[3] + 1):
        for x in range(rect[0], rect[2] + 1):
            c = f.get(x, y)
            if c[3] and (pred is None or pred(c)):
                f.set(x, y, T); n += 1
    return n


def recolor(f, pred, newc, rect=None):
    """Troca cada pixel que satisfaz pred(c) por newc (cor ou função c->cor)."""
    n = 0
    r = rect or (0, 0, f.w - 1, f.h - 1)
    for y in range(r[1], r[3] + 1):
        for x in range(r[0], r[2] + 1):
            c = f.get(x, y)
            if c[3] and pred(c):
                f.set(x, y, newc(c) if callable(newc) else newc); n += 1
    return n


def near(target, thr):
    return lambda c: dist(c, target) <= thr


def snap_palette(frames, thr=10, protect=()):
    """Une cores quase iguais (dist RGB <= thr) na mais frequente do grupo, em TODOS os quadros
    juntos. Diferença invisível em escala de jogo; reduz ruído de cor da geração."""
    cnt = {}
    for f in frames:
        for row in f.px:
            for c in row:
                if c[3]:
                    cnt[c[:3]] = cnt.get(c[:3], 0) + 1
    order = sorted(cnt, key=lambda k: -cnt[k])
    rep = {}
    reps = []
    for k in order:
        best = None
        for r in reps:
            if dist(k, r) <= thr and k not in protect:
                best = r; break
        if best is None:
            reps.append(k); rep[k] = k
        else:
            rep[k] = best
    changed = 0
    for f in frames:
        for y in range(f.h):
            for x in range(f.w):
                c = f.px[y][x]
                if c[3] and rep[c[:3]] != c[:3]:
                    f.px[y][x] = rep[c[:3]] + (255,); changed += 1
    return len(cnt), len(reps), changed


def fix_alpha(f):
    n = 0
    for y in range(f.h):
        for x in range(f.w):
            c = f.px[y][x]
            if 0 < c[3] < 255:
                f.px[y][x] = c[:3] + (255,) if c[3] >= 128 else T; n += 1
    return n


# ---------- geometria ----------
def shift(f, dx, dy):
    g = Fr(w=f.w, h=f.h, px=[[T] * f.w for _ in range(f.h)])
    for y in range(f.h):
        for x in range(f.w):
            c = f.px[y][x]
            if c[3]:
                g.set(x + dx, y + dy, c)
    f.px = g.px


SOLE_MIN = 4  # F2b: a sola é a linha mais baixa com >= 4 px opacos (ignora pontas de garra de 1-3 px)


def foot_y(f, ignore=None, min_px=1):
    for y in range(f.h - 1, -1, -1):
        n = 0
        for x in range(f.w):
            c = f.px[y][x]
            if c[3] and not (ignore and ignore(c)):
                n += 1
        if n >= min_px:
            return y
    return None


def sole_y(f, ignore=None):
    return foot_y(f, ignore, SOLE_MIN)


def _vmetrics(f, ignore=None):
    ys = [y for y in range(f.h) for x in range(f.w) if f.px[y][x][3]]
    return sum(ys) / len(ys), min(ys), sole_y(f, ignore)


def align_feet(frames, target=None, ignore=None, ref=None, rng=2):
    """F2b: alinha pela SOLA (linha mais baixa com >= SOLE_MIN px), não pelo pixel mais baixo, e com
    uma trava: a oscilação do corpo (amplitude do centróide vertical e do topo) não pode passar a do
    original (`ref`, quadros do pacote original; sem ref, os próprios quadros de entrada).
    Busca exaustiva de dy em [-rng, rng] por quadro. Critério, em ordem: (1) respeitar a trava;
    (2) menos linhas de sola distintas; (3) menor desvio total da sola à linha; (4) menor amplitude
    do centróide; (5) menos deslocamento. Devolve (solas antes, linha alvo, dys)."""
    import itertools
    m = [_vmetrics(f, ignore) for f in frames]
    rm = [_vmetrics(f, ignore) for f in (ref or frames)]
    cap_c = max(c for c, _, _ in rm) - min(c for c, _, _ in rm) + 1e-6
    cap_t = max(t for _, t, _ in rm) - min(t for _, t, _ in rm)
    ys = [s_ for _, _, s_ in m]
    if target is None:
        target = max(set(ys), key=ys.count)
    best = None
    for dys in itertools.product(range(-rng, rng + 1), repeat=len(frames)):
        cs = [m[i][0] + d for i, d in enumerate(dys)]
        ts = [m[i][1] + d for i, d in enumerate(dys)]
        ss = [m[i][2] + d for i, d in enumerate(dys)]
        ac = max(cs) - min(cs); at = max(ts) - min(ts)
        ok = ac <= cap_c and at <= cap_t
        key = (0 if ok else 1, len(set(ss)), sum(abs(v - target) for v in ss), round(ac, 2),
               sum(abs(d) for d in dys))
        if best is None or key < best[0]:
            best = (key, dys)
    dys = best[1]
    for f, d in zip(frames, dys):
        if d:
            shift(f, 0, d)
    return ys, target, list(dys)


def paste_region(dst, src, rect, dx=0, dy=0, clear=None, only_opaque=True):
    """Copia src[rect] para dst na posição deslocada (dx,dy). clear: rect em dst a limpar antes."""
    if clear:
        erase(dst, clear)
    for y in range(rect[1], rect[3] + 1):
        for x in range(rect[0], rect[2] + 1):
            c = src.get(x, y)
            if c[3] or not only_opaque:
                dst.set(x + dx, y + dy, c)


def match_offset(dst, src, rect, rng=4, rngx=None):
    """Melhor (dx,dy) para encaixar src[rect] em dst (menor diferença)."""
    rngx = rng if rngx is None else rngx
    best = None
    for dy in range(-rng, rng + 1):
        for dx in range(-rngx, rngx + 1):
            s = 0
            for y in range(rect[1], rect[3] + 1):
                for x in range(rect[0], rect[2] + 1):
                    a = src.get(x, y); b = dst.get(x + dx, y + dy)
                    if a[3] != b[3]:
                        s += 300
                    elif a[3]:
                        s += dist(a, b)
            if best is None or s < best[0]:
                best = (s, dx, dy)
    return best[1], best[2]


def mirror(f):
    g = f.copy()
    for y in range(f.h):
        g.px[y] = list(reversed(f.px[y]))
    return g


# ---------- contorno ----------
def outline_gaps(f, outline_pred):
    """Conta pixels de borda (opaco com vizinho 4-transparente) que não são contorno."""
    n = 0
    for y in range(f.h):
        for x in range(f.w):
            if f.op(x, y):
                if any(not f.op(x + a, y + b) for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                    if not outline_pred(f.get(x, y)):
                        n += 1
    return n


def close_outline(f, outc, outline_pred, skip=None):
    """Põe contorno em pixel transparente vizinho de pixel de borda sem contorno: NÃO usado
    por padrão (engorda o sprite). Mantido para casos pontuais."""
    pts = []
    for y in range(f.h):
        for x in range(f.w):
            if f.op(x, y) and not outline_pred(f.get(x, y)) and not (skip and skip(f.get(x, y))):
                for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    if not f.op(x + a, y + b):
                        pts.append((x + a, y + b))
    for p in pts:
        f.set(p[0], p[1], outc)
    return len(pts)


# ---------- pacote ----------
def load_pack(pk):
    data = {}
    for anim in ('walk', 'attack'):
        for d in 'SENW':
            fs = sorted(glob.glob(os.path.join(pk, anim, d, 'frame_*.png')))
            if fs:
                data[anim + '/' + d] = [Fr(p) for p in fs]
    rot = {d: Fr(os.path.join(pk, 'rotations', d + '.png')) for d in 'SENW'
           if os.path.exists(os.path.join(pk, 'rotations', d + '.png'))}
    return data, rot


def save_pack(src_pk, dst_pk, data, rot, meta_extra):
    if os.path.exists(dst_pk):
        shutil.rmtree(dst_pk)
    os.makedirs(dst_pk)
    for k, frs in data.items():
        for i, f in enumerate(frs):
            f.save(os.path.join(dst_pk, k, 'frame_%03d.png' % i))
    for d, f in rot.items():
        f.save(os.path.join(dst_pk, 'rotations', d + '.png'))
    meta = json.load(open(os.path.join(src_pk, 'pacote.json')))
    meta['f2'] = meta_extra
    json.dump(meta, open(os.path.join(dst_pk, 'pacote.json'), 'w'), indent=1, ensure_ascii=False)
