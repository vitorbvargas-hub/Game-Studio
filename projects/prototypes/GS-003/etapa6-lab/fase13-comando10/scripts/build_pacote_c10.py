"""C10: monta pacote_agumon_c10 = F2b + caminhada lateral recomposta (E, O espelhado) + rotação E/O
de pé com o mesmo tronco/braço/pernas. Demais arquivos: cópia byte a byte do F2b."""
import sys, os, json, shutil
sys.path.insert(0, os.path.dirname(__file__)); from lib import *
import walk_e_c10 as wk
SRC = O + '/backup_f2b/pacote_agumon_f2'; DST = O + '/pacote_agumon_c10'
def mirror(px): return [list(reversed(r)) for r in px]
# rotação W do F2b é espelho da E?
_, _, rE = load(SRC + '/rotations/E.png'); _, _, rW = load(SRC + '/rotations/W.png')
print('F2b rotations W == flip(E):', mirror(rE) == [list(map(tuple, r)) for r in rW] or sum(1 for y in range(48) for x in range(48) if tuple(mirror(rE)[y][x]) != tuple(rW[y][x])))
fr = wk.build()
for i, f in enumerate(fr):
    save_png_rgba('%s/walk/E/frame_%03d.png' % (DST, i), 60, 60, f)
    save_png_rgba('%s/walk/W/frame_%03d.png' % (DST, i), 60, 60, mirror(f))
# rotação de pé: mesma montagem, pés afastados 5 px (sem sobrepor), braço no meio
wk.PLAN = [(0, (32, 0, 'flat'), (27, 0, 'flat'), 0.0)]
st = wk.build()[0]
rot = [[(0,0,0,0)]*48 for _ in range(48)]
for y in range(60):
    for x in range(60):
        if st[y][x][3]:
            X, Y = x - 6, y - 5
            assert 0 <= X < 48 and 0 <= Y < 48, (x, y)
            rot[Y][X] = st[y][x]
save_png_rgba(DST + '/rotations/E.png', 48, 48, rot)
save_png_rgba(DST + '/rotations/W.png', 48, 48, mirror(rot))
pj = json.load(open(SRC + '/pacote.json'))
pj['c10'] = {'data': '2026-11-14', 'base': 'F2b (fase12-comando9/f2/pacote_agumon_f2), backup em fase13-comando10/backup_f2b',
  'log': [
   {'correcao': 'walk/E recomposta', 'detalhe': 'cabeça, pescoço e cauda = pixels do F2b walk/E q0; tronco, braço (3 poses, braço de longe atrás) e pernas (contato/descida/passagem/subida) redesenhados em pixel com a paleta do pacote; pé plantado recua 4 px/quadro; dy do corpo [0,1,0,-1,0,1,0,-1]', 'quadros': 8},
   {'correcao': 'walk/W', 'detalhe': 'espelho exato do walk/E C10', 'quadros': 8},
   {'correcao': 'rotations/E e W', 'detalhe': 'pose de pé com o mesmo tronco/braço/pernas da caminhada (antes: braço colado); cabeça da caminhada; registro (-6,-5) no canvas 48', 'quadros': 2},
   {'correcao': 'attack/*, walk/S, walk/N, rotations/S e N', 'detalhe': 'inalterados (cópia do F2b)', 'quadros': 0}]}
json.dump(pj, open(DST + '/pacote.json', 'w'), ensure_ascii=False, indent=1)
print('pacote ok')
