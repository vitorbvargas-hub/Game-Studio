"""F7: rig por partes das rotações S e N do F2b (mesma técnica do F3: só deslocamento inteiro, sem
reescala, sem cor nova). Usado na caminhada S/N, no idle N e no neutro dos ataques.
Coordenadas internas = canvas 48 da rotação; a saída vai para o canvas 60 com registro (+6,+5)."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
sys.path.insert(0, F3 + '/rig_agumon')
import rig_s as RS
W48 = 48
INK = RS.INK
def parts_n():
    _, _, src = load(F2B + '/rotations/N.png')
    P = {n: {} for n in ('head', 'torso', 'armL', 'armR', 'legL', 'legR')}
    for y in range(48):
        for x in range(48):
            c = tuple(src[y][x])
            if not c[3]: continue
            if y <= 21: n = 'head'
            elif 28 <= y <= 35 and x <= (18 if y <= 29 else 17): n = 'armL'
            elif 28 <= y <= 35 and x >= (29 if y <= 29 else 30): n = 'armR'
            elif y >= 39: n = 'legL' if x <= 23 else 'legR'
            else: n = 'torso'
            P[n][(x, y)] = c
    return P
PS = RS.PARTS
PN = parts_n()
def sh(p, dx, dy): return {(x+dx, y+dy): c for (x, y), c in p.items()}
def pose(P, t=0, dx=0, legL=0, legR=0, armL=(0,0), armR=(0,0), hd=0, head=None):
    """t: dy do tronco+cabeça+braços; dx: balanço lateral do tronco; legL/legR: dy de cada perna (<0 ergue);
    armL/armR: (dx,dy) extra de cada braço; hd: dy extra da cabeça."""
    head = head or P['head']
    L = [sh(P['legL'], 0, legL), sh(P['legR'], 0, legR)]
    if t < 0: L.append(sh(P['torso'], dx, 0))
    L.append(sh(P['torso'], dx, t))
    L.append(sh(P['armL'], dx + armL[0], t + armL[1])); L.append(sh(P['armR'], dx + armR[0], t + armR[1]))
    if hd < 0: L.append(sh(head, dx, t))
    L.append(sh(head, dx, t + hd))
    cv = RS.compose(L)
    for y in range(1, 47):          # furo de 1 px entre peças vira contorno
        for x in range(1, 47):
            if not cv[y][x][3] and all(cv[y+b][x+a][3] for a, b in ((1,0),(-1,0),(0,1),(0,-1))): cv[y][x] = INK
    return cv
def to60(cv48): return pad((48, 48, cv48), 60, 60, 6, 5)
# ciclo de caminhada (gabarito F6: contato, descida, passagem, subida; cabeça 0,+1,0,-1)
def walk(P, armdx=True):
    A = (lambda dx, dy: (dx, dy)) if armdx else (lambda dx, dy: (0, dy))
    # S/N: o pé da frente (mais perto da câmera em S) fica no chão; o de trás sobe 1 px já no contato
    seq = [
     dict(t=0,  legL=-1, armL=A(0,0),   armR=A(0,1)),
     dict(t=1,  legL=-2, armL=A(0,-1),  armR=A(0,1)),
     dict(t=0,  legL=-3, armL=A(-1,-1), armR=A(0,1), dx=1),
     dict(t=-1, legL=-1, armL=A(0,-1),  armR=A(0,0)),
     dict(t=0,  legR=-1, armR=A(0,0),   armL=A(0,1)),
     dict(t=1,  legR=-2, armR=A(0,-1),  armL=A(0,1)),
     dict(t=0,  legR=-3, armR=A(1,-1),  armL=A(0,1), dx=-1),
     dict(t=-1, legR=-1, armR=A(0,-1),  armL=A(0,0)),
    ]
    return [to60(pose(P, **k)) for k in seq]
if __name__ == '__main__':
    for d, P in (('S', PS), ('N', PN)):
        fr = walk(P, d == 'S')
        for i, f in enumerate(fr): save(O + '/tmp/walk%s_try/frame_%03d.png' % (d, i), f)
        save(O + '/tmp/walk%s_try_a.png' % d, sheet(fr[:4], 8, cols=4)); save(O + '/tmp/walk%s_try_b.png' % d, sheet(fr[4:], 8, cols=4))
    print('ok')
