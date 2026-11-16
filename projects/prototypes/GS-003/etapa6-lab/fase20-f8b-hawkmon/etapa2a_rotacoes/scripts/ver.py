import sys; sys.dont_write_bytecode=True
sys.path.insert(0,'/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/etapa6-lab/fase20-f8b-hawkmon/etapa1_pose_base/scripts')
from comum import *; from pal import *
D=LAB+'/fase20-f8b-hawkmon/etapa2a_rotacoes'
T='/home/openclaw/projects/GameStudio/workspaces/game-art/tmp/c14e2a/'
src=sys.argv[1]; s=int(sys.argv[2]) if len(sys.argv)>2 else 8
BG=(120,160,96,255)
c=canvas(48*4+10,48+4,BG)
for i,d in enumerate(('south','east','north','west')):
    w,h,px=load(D+'/'+src+'/'+d+'.png'); paste(c,px,2+i*50,2)
    cols=set(tuple(p) for r in px for p in r if p[3]); semi=sum(1 for r in px for p in r if 0<p[3]<255)
    print(d,w,h,'bbox',bbox(px),'area',sum(1 for r in px for p in r if p[3]),'cores',len(cols),'semi',semi,'foraP1',sum(1 for k in cols if k[:3] not in C2L))
save(T+src.replace('/','_')+'_x%d.png'%s,scale(c,s))
