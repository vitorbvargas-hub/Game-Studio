"""Força P1 (vizinho mais próximo em RGB) nas rotações cruas e imprime a grade de letras. Uso: python3 quant.py east"""
import sys; sys.dont_write_bytecode=True
sys.path.insert(0,'/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/etapa6-lab/fase20-f8b-hawkmon/etapa1_pose_base/scripts')
from comum import *; from pal import *
D=LAB+'/fase20-f8b-hawkmon/etapa2a_rotacoes'
def near(c):
    return min(C2L, key=lambda k:(k[0]-c[0])**2+(k[1]-c[1])**2+(k[2]-c[2])**2)
def quant(px):
    return [[(0,0,0,0) if p[3]==0 else near(p)+(255,) for p in r] for r in px]
if __name__=='__main__':
    for d in sys.argv[1:]:
        w,h,px=load(D+'/rotacoes_cruas/'+d+'.png'); q=quant(px)
        fora={}
        for r in px:
            for p in r:
                if p[3] and tuple(p[:3]) not in C2L: fora['#%02x%02x%02x'%tuple(p[:3])]=C2L[near(p)]
        print(d,'fora->P1',fora)
        for y,r in enumerate(to_txt(q)): print("%2d '%s',"%(y,r))
