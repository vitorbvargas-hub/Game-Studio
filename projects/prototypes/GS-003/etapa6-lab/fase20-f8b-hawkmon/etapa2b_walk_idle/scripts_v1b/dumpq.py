"""dumpq.py <pasta> [y0 y1]: quadros como grade de letras P1 (cor mais próxima), lado a lado."""
import sys,os; sys.dont_write_bytecode=True
sys.path.insert(0,'/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/etapa6-lab/fase20-f8b-hawkmon/etapa1_pose_base/scripts')
from comum import *; from pal import *
def near(c):
    if c[3]<128: return '.'
    return min(L2C,key=lambda k: 1e9 if k=='.' else sum((a-b)**2 for a,b in zip(L2C[k][:3],c[:3])))
def grid(px): return [''.join(near(c) for c in r) for r in px]
if __name__=='__main__':
    d=sys.argv[1]; y0=int(sys.argv[2]) if len(sys.argv)>2 else 0; y1=int(sys.argv[3]) if len(sys.argv)>3 else 63
    x0=int(sys.argv[4]) if len(sys.argv)>4 else 16; x1=int(sys.argv[5]) if len(sys.argv)>5 else 47
    fs=sorted(f for f in os.listdir(d) if f.endswith('.png'))
    G=[grid(load(d+'/'+f)[2]) for f in fs]
    for y in range(y0,y1+1): print('%2d '%y+' '.join(g[y][x0:x1+1] for g in G))
