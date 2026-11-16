"""ver.py <pasta de quadros> <saida.png> [escala] [x0 y0 x1 y1]: folha dos quadros lado a lado."""
import sys,os; sys.dont_write_bytecode=True
sys.path.insert(0,'/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/etapa6-lab/fase20-f8b-hawkmon/etapa1_pose_base/scripts')
from comum import *
d=sys.argv[1]; out=sys.argv[2]; sc=int(sys.argv[3]) if len(sys.argv)>3 else 6
box=list(map(int,sys.argv[4:8])) if len(sys.argv)>7 else None
fs=sorted(f for f in os.listdir(d) if f.endswith('.png'))
frs=[load(d+'/'+f)[2] for f in fs]
if box: frs=[crop(f,*box) for f in frs]
w=len(frs[0][0]); h=len(frs[0]); BG=(120,160,96,255)
c=canvas((w+1)*len(frs),h,BG)
for i,f in enumerate(frs):
    paste(c,f,i*(w+1),0)
    for y in range(h): c[y][i*(w+1)+w]=(60,80,48,255)
save(out,scale(c,sc))
for i,f in enumerate(frs):
    A=sum(1 for r in f for p in r if p[3]); print(fs[i],'area',A,'bbox',bbox(f),'semi',sum(1 for r in f for p in r if 0<p[3]<255))
