"""F7v2 (Comando 12.1): Pepper Breath como PROJÉTIL independente. Desenho por código (mesma função fireball
da F7), só com as 6 cores de fogo que o F2b já tinha. Canvas 24x24, âncora no centro da bola (12, 12).
Deslocamento, colisão e impacto são do jogo; aqui só a arte e a especificação."""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
import attack_f7 as AT
S = 24; C = 12
FC = AT.FC
def ball(r, tx=0, ty=0, tail=0.0, sp=()):
    old = (AT.W, AT.H); AT.W = AT.H = S
    d = AT.fireball(C, C, r, tx, ty, tail)
    AT.W, AT.H = old
    for x, y, c in sp:
        if 0 <= C+x < S and 0 <= C+y < S: d[(C+x, C+y)] = FC[c]
    p = [[T]*S for _ in range(S)]
    for (x, y), c in d.items(): p[y][x] = c
    return (S, S, p)
def rot(sp, d):      # faíscas definidas para E (cauda em -x); gira para S (cauda em -y) e N (cauda em +y)
    if d == 'E': return sp
    if d == 'S': return [(y, x, c) for x, y, c in sp]
    if d == 'N': return [(y, -x, c) for x, y, c in sp]
    if d == 'W': return [(-x, y, c) for x, y, c in sp]
TAIL = {'E': (-1, 0), 'W': (1, 0), 'S': (0, -1), 'N': (0, 1)}
def frames_dir(d):
    tx, ty = TAIL[d]
    nascer = [ball(2.2), ball(3.4, tx, ty, 2)]
    voo = [ball(4.4, tx, ty, 5, rot([(-9, -2, 'r')], d)),
           ball(4.0, tx, ty, 6, rot([(-8, 3, 'o'), (-10, 0, 'd')], d)),
           ball(4.4, tx, ty, 4, rot([(-8, 2, 'r'), (-10, -3, 'd')], d)),
           ball(4.0, tx, ty, 6, rot([(-9, -3, 'o'), (-10, 1, 'd')], d))]
    return nascer, voo
def impacto():
    ring = lambda r, c, n=8, ph=0: [(round(r*__import__('math').cos(6.2832*(k+ph)/n)), round(r*__import__('math').sin(6.2832*(k+ph)/n)), c) for k in range(n)]
    return [ball(5.4), ball(4.2, sp=ring(7, 'o') + ring(8, 'r', 8, .5)),
            ball(2.4, sp=ring(8, 'r') + ring(10, 'd', 8, .5) + ring(5, 'y', 4, .5)),
            ball(0, sp=ring(10, 'd', 8, .25) + ring(7, 'r', 4, .5))]
DELAYS = {'nascer': [60, 60], 'voo': [80, 80, 80, 80], 'impacto': [60, 70, 80, 90]}
def build():
    out = {}
    for d in 'ESNW':       # W é desenhado direto (não espelhado), para a bola continuar centrada no pixel (12,12)
        n, v = frames_dir(d); out[d] = {'nascer': n, 'voo': v}
    return out, impacto()
if __name__ == '__main__':
    B, I = build()
    row = []
    for d in 'SNEW': row += B[d]['nascer'] + B[d]['voo']
    save(O + '/tmp/z_proj.png', sheet(row + I, 8, cols=6))
    print('ok')
