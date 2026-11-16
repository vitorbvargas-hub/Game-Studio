"""C10: ataque S do híbrido D (F4). (1) saída por F2b attack/S q8 no lugar do rig q7 (sugestão do QA F4 §1.4);
(2) variante opcional com a bola de fogo do q3 subida 5 px, para nascer mais perto da boca. Só reorganiza
pixels já existentes (híbrido D e F2b); nada gerado."""
import sys, os, shutil
sys.path.insert(0, os.path.dirname(__file__)); from lib import *
SRC = L + '/fase12-comando9/f4/hibrido_agumon_S/ataque'
F2B = O + '/backup_f2b/pacote_agumon_f2/attack/S'
OUT = O + '/hibrido_agumon_S_c10'
TR = (0,0,0,0)
def ld(p): return load(p)[2]
D = [ld('%s/frame_%03d.png' % (SRC, i)) for i in range(9)]
def from_f2b(i, dx=3, dy=-5):
    s = ld('%s/frame_%03d.png' % (F2B, i)); out = [[TR]*64 for _ in range(64)]
    for y in range(60):
        for x in range(60):
            if s[y][x][3]:
                X, Y = x+dx, y+dy
                if 0 <= X < 64 and 0 <= Y < 64: out[Y][X] = tuple(s[y][x])
    return out
# verificação do registro: q3..q6 do D = F2b q4..q7 deslocados
for k in range(4):
    g = from_f2b(4+k); diff = sum(1 for y in range(64) for x in range(64) if tuple(g[y][x]) != tuple(D[3+k][y][x]))
    print('registro D q%d x F2b q%d: %d px diferentes' % (3+k, 4+k, diff))
q8b = from_f2b(8)
# A) só a saída
A = [D[0], D[1], D[2], D[3], D[4], D[5], D[6], q8b, D[8]]
# B) saída + fogo do q3 subido 5 px (fogo = pixels do q3 que diferem do q6 abaixo da linha 29)
q3 = D[3]; q6 = D[6]; UP = 5
fire = {(x,y): tuple(q3[y][x]) for y in range(29, 64) for x in range(23, 42) if tuple(q3[y][x]) != tuple(q6[y][x]) and q3[y][x][3]}
nq3 = [list(r) for r in q3]
for (x,y) in fire: nq3[y][x] = tuple(q6[y][x])
for (x,y), c in fire.items():
    if y-UP >= 0: nq3[y-UP][x] = c
B = list(A); B[3] = nq3
delays = open(SRC + '/delays_ms.txt').read().split()
for tag, seq in (('A_saida_q8', A), ('B_saida_q8_fogo_boca', B)):
    d = '%s/ataque_%s' % (OUT, tag); os.makedirs(d, exist_ok=True)
    for i, f in enumerate(seq): save_png_rgba('%s/frame_%03d.png' % (d, i), 64, 64, f)
    open(d + '/delays_ms.txt', 'w').write(' '.join(delays) + '\n')
    cuts = []
    for i in range(8):
        a, b = seq[i], seq[i+1]
        cuts.append(sum(1 for y in range(64) for x in range(64) if tuple(a[y][x]) != tuple(b[y][x])))
    tops = [min(y for y in range(64) for x in range(64) if f[y][x][3]) for f in seq]
    print(tag, 'cortes', cuts, 'topo', tops)
cuts = [sum(1 for y in range(64) for x in range(64) if tuple(D[i][y][x]) != tuple(D[i+1][y][x])) for i in range(8)]
print('F4 original cortes', cuts, 'topo', [min(y for y in range(64) for x in range(64) if f[y][x][3]) for f in D])
