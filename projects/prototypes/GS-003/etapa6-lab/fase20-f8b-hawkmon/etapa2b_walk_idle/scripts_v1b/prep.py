import sys,os; sys.dont_write_bytecode=True
sys.path.insert(0,'/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/etapa6-lab/fase20-f8b-hawkmon/etapa1_pose_base/scripts')
from comum import *
R=LAB+'/fase20-f8b-hawkmon/etapa2a_rotacoes/rotacoes_polidas_v2/'; O=LAB+'/fase20-f8b-hawkmon/etapa2b_walk_idle/walk_cru/'
for d in 'SNE':
    w,h,px=load(R+d+'_composto.png'); c=canvas(64,64); paste(c,px,8,8); save(O+'entrada_%s_64.png'%d,c); print(d,bbox(c))
