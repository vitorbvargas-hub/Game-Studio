"""Comando 9 / F4 — híbrido do Agumon (direção S). PixelLab: 0 gerações.

Entradas (somente leitura):
  - rig 2D da F3 (f3/rig_agumon/rig_s.py, importado: só a composição; nada é gravado em f3/)
  - ataque S do pacote F2b (f2/pacote_agumon_f2/attack/S)
  - feliz v3 custom em 1x (f3/ref_v3_custom_feliz_1x)
Regras: só deslocamento inteiro, nenhuma reescala, nenhuma interpolação, alfa binário,
nenhuma cor fora da paleta do pacote F2 (rotations/S + attack/S).
Saída: ../hibrido_agumon_S/{idle,ataque,feliz}/frame_NNN.png + delays_ms.txt, e ../metricas_hibrido.json
Canvas comum: 64x64, sola em y=45 (âncora única para as 3 animações).
"""
import sys, os, glob, json
HERE = os.path.dirname(os.path.abspath(__file__))
F4 = os.path.dirname(HERE)
C9 = os.path.dirname(F4)
sys.dont_write_bytecode = True  # não deixar __pycache__ em f3/ (só leitura)
sys.path.insert(0, '/home/openclaw/projects/GameStudio/workspaces/game-art/tools')
sys.path.insert(0, os.path.join(C9, 'f3', 'rig_agumon'))
from pxpng import load_png_rgba, save_png_rgba
import rig_s  # noqa: E402  (import não grava nada; o main dele fica sob __name__)

N = 64
T = (0, 0, 0, 0)
ROT_OFF = (9, 1)    # rotations/S (48) -> canvas 64: medido, feliz q0 == rotations/S em 581/582 px com esse deslocamento
ATT_OFF = (3, -5)   # attack/S (60) -> canvas 64: melhor casamento de q0 com rotations/S (-6,-6) + ROT_OFF
FEL_OFF = (0, 0)    # o feliz v3 já está em 64x64 com a sola em 45

PKG = os.path.join(C9, 'f2', 'pacote_agumon_f2')

def ld(p):
    w, h, px = load_png_rgba(p)
    return {(x, y): px[y][x] for y in range(h) for x in range(w) if px[y][x][3]}

def from_grid(cv):
    return {(x, y): cv[y][x] for y in range(len(cv)) for x in range(len(cv[0])) if cv[y][x][3]}

def place(d, off):
    ox, oy = off
    return {(x + ox, y + oy): c for (x, y), c in d.items()}

def to_grid(d):
    cv = [[T] * N for _ in range(N)]
    for (x, y), c in d.items():
        assert 0 <= x < N and 0 <= y < N, ('fora do canvas', x, y)
        cv[y][x] = c
    return cv

# ---------- paleta do pacote ----------
PAL = set(ld(os.path.join(PKG, 'rotations', 'S.png')).values())
ATT = sorted(glob.glob(os.path.join(PKG, 'attack', 'S', 'frame_*.png')))
for p in ATT: PAL |= set(ld(p).values())

# ---------- rig ----------
def rig(**kw): return place(from_grid(rig_s.body(**kw)), ROT_OFF)

# ---------- feliz v3: polimento ----------
MOUTH_MAP = {  # boca roxa do v3 -> boca do Pepper Breath do mesmo pacote (attack/S)
    (0xc9, 0x41, 0x92): (0xca, 0x01, 0x46), (0xbb, 0x3e, 0x93): (0xca, 0x01, 0x46),
    (0xbe, 0x48, 0x8d): (0xca, 0x01, 0x46), (0xc2, 0x36, 0x8f): (0xca, 0x01, 0x46),
    (0xa9, 0x3b, 0x90): (0xca, 0x01, 0x46),
    (0x7c, 0x1f, 0x6c): (0x86, 0x00, 0x37),
    (0x7f, 0x10, 0x6c): (0x7d, 0x00, 0x32), (0x74, 0x0e, 0x63): (0x7d, 0x00, 0x32),
}
def nearest(c):
    return min(PAL, key=lambda q: sum((c[i] - q[i]) ** 2 for i in range(3)))

def polish_feliz(d):
    out, log = {}, {'boca': 0, 'snap': 0, 'soltos': 0}
    for k, c in d.items():
        if c in PAL: out[k] = c
        elif c[:3] in MOUTH_MAP: out[k] = MOUTH_MAP[c[:3]] + (255,); log['boca'] += 1
        else: out[k] = nearest(c); log['snap'] += 1
    # pixel solto (nenhum vizinho de 8) é apagado
    for (x, y) in list(out):
        if not any((x + dx, y + dy) in out for dx in (-1, 0, 1) for dy in (-1, 0, 1) if dx or dy):
            del out[(x, y)]; log['soltos'] += 1
    return out, log

# ---------- métricas ----------
def bbox(d):
    xs = [x for x, _ in d]; ys = [y for _, y in d]
    return min(xs), min(ys), max(xs), max(ys)

def sole(d):
    rows = {}
    for (x, y) in d: rows[y] = rows.get(y, 0) + 1
    return max(y for y, n in rows.items() if n >= 4)

def skull(d):
    """topo e largura do crânio: linha topo+5, trecho contínuo que contém a coluna central do topo."""
    top = min(y for _, y in d)
    xs_top = sorted(x for (x, y) in d if y == top)
    cx = xs_top[len(xs_top) // 2]
    y = top + 5
    if (cx, y) not in d: return top, 0
    l = r = cx
    while (l - 1, y) in d: l -= 1
    while (r + 1, y) in d: r += 1
    return top, r - l + 1

def diff(a, b):
    ks = set(a) | set(b)
    return sum(1 for k in ks if a.get(k) != b.get(k))

def metrics(frames):
    m = []
    for i, d in enumerate(frames):
        x0, y0, x1, y1 = bbox(d); top, sw = skull(d)
        m.append({'q': i, 'bbox': [x0, y0, x1, y1], 'sola': sole(d), 'cranio_topo': top, 'cranio_larg': sw,
                  'cores': len(set(d.values())), 'fora_paleta': sum(1 for c in set(d.values()) if c not in PAL),
                  'px_mudados_vs_ant': diff(frames[i - 1], d) if i else None})
    return m

def save_anim(name, frames, delays, origem):
    d = os.path.join(F4, 'hibrido_agumon_S', name)
    os.makedirs(d, exist_ok=True)
    for f in glob.glob(os.path.join(d, 'frame_*.png')): os.remove(f)
    for i, fr in enumerate(frames):
        save_png_rgba(os.path.join(d, 'frame_%03d.png' % i), N, N, to_grid(fr))
    with open(os.path.join(d, 'delays_ms.txt'), 'w') as fh: fh.write(' '.join(map(str, delays)) + '\n')
    with open(os.path.join(d, 'origem.txt'), 'w') as fh: fh.write('\n'.join('q%d: %s' % (i, o) for i, o in enumerate(origem)) + '\n')

if __name__ == '__main__':
    out = {}
    # 1) IDLE = rig F3 (mesmos quadros e tempos do anim_idle_S, só transladados para o canvas 64)
    idle_frames, idle_delays = rig_s.ANIMS['idle']
    idle = [place(from_grid(f), ROT_OFF) for f in idle_frames]
    save_anim('idle', idle, idle_delays, ['rig F3 idle q%d' % i for i in range(len(idle))])
    out['idle'] = metrics(idle)

    # 2) ATAQUE = antecipação do rig (2 q) + miolo v3/F2b (q4-q7) + volta do rig (2 q)
    att = [place(ld(p), ATT_OFF) for p in ATT]
    seq = [
        (rig(), 200, 'rig: neutro (= idle q0)'),
        (rig(t=1), 140, 'rig: agacha 1 px'),
        (rig(t=1, arms=('mid', 'mid'), mouth=1), 120, 'rig: agachado, braços 1 px para fora, boca nível 1'),
        (att[4], 160, 'F2b attack/S q4: disparo (boca aberta, fogo)'),
        (att[5], 120, 'F2b attack/S q5: fogo no chão'),
        (att[6], 120, 'F2b attack/S q6: faísca'),
        (att[7], 160, 'F2b attack/S q7: boca aberta, sem fogo'),
        (rig(arms=('mid', 'mid'), mouth=1), 140, 'rig: braços 1 px para fora, boca nível 1'),
        (rig(), 200, 'rig: neutro (= idle q0)'),
    ]
    ataque = [s[0] for s in seq]
    save_anim('ataque', ataque, [s[1] for s in seq], [s[2] for s in seq])
    out['ataque'] = metrics(ataque)
    # referência: o ataque F2b inteiro (q0-q8) no mesmo canvas, para comparar as emendas com os cortes internos do v3
    out['ataque_F2b_ref'] = metrics(att)

    # 3) FELIZ = v3 custom polido (q0-q8) + volta ao neutro (q0)
    fel_src = [place(ld(p), FEL_OFF) for p in sorted(glob.glob(os.path.join(C9, 'f3', 'ref_v3_custom_feliz_1x', 'frame_*.png')))]
    out['feliz_antes'] = metrics(fel_src)
    fel, logs = [], []
    for d in fel_src:
        p, lg = polish_feliz(d); fel.append(p); logs.append(lg)
    fel.append(dict(fel[0]))
    fel_delays = [160, 110, 90, 120, 140, 140, 110, 120, 200, 220]
    save_anim('feliz', fel, fel_delays, ['v3 custom feliz q%d polido' % i for i in range(9)] + ['= q0 (volta ao neutro)'])
    out['feliz'] = metrics(fel)
    out['feliz_polimento'] = logs
    # emendas com o idle do rig: neutro do rig x q0 de cada animação
    out['emenda_idle_x_feliz_q0'] = diff(idle[0], fel[0])
    out['emenda_idle_x_ataque_q0'] = diff(idle[0], ataque[0])
    with open(os.path.join(F4, 'metricas_hibrido.json'), 'w') as fh: json.dump(out, fh, indent=1, ensure_ascii=False)
    for k in ('idle', 'ataque', 'ataque_F2b_ref', 'feliz_antes', 'feliz'):
        print(k)
        for r in out[k]: print('  ', r)
    print('polimento feliz', logs)
    print('emendas', out['emenda_idle_x_feliz_q0'], out['emenda_idle_x_ataque_q0'])
