import sys; sys.path.insert(0,'tool'); sys.path.insert(0,'/home/openclaw/projects/GameStudio/workspaces/game-art/tools')
from pxpng import load_png_rgba, nn_scale
from gifenc import write_gif
bw,bh,bg=load_png_rgba('../fase1-pixellab/referencias/v15b_crop_NW_1x.png')
def frames(name):
    w,h,p=load_png_rgba(f'fixer_neural/frames/{name}_sheet.png'); n=w//48
    return [[r[i*48:(i+1)*48] for r in p] for i in range(n)]
W={'s':frames('frente_walk'),'e':frames('perfil_esq_walk'),'w':frames('perfil_dir_walk'),'n':frames('costas_walk')}
ds=load_png_rgba('../fase1-pixellab/referencias/agumon_ds_south.png')[2]
X0,Y0,CW,CH=300,300,200,120
path=[]; x,y=40,30
for d,dx,dy,n in (('e',2,0,24),('s',0,2,12),('w',-2,0,24),('n',0,-2,12)):
    for i in range(n): path.append((d,x,y,i)); x+=dx; y+=dy
out=[]
for d,x,y,i in path:
    cv=[r[X0:X0+CW] for r in bg[Y0:Y0+CH]]; cv=[r[:] for r in cv]
    def blit(s,X,Y):
        for j,row in enumerate(s):
            for k,px in enumerate(row):
                if px[3]>127 and 0<=Y+j<CH and 0<=X+k<CW: cv[Y+j][X+k]=px
    blit(ds,150,62)  # Agumon DS parado, para comparar escala
    fr=W[d]; blit(fr[i%len(fr)],x,y)
    out.append(cv)
S=4
write_gif('fixer_neural/cena_agumon_fixer_4direcoes.gif',[nn_scale(f,CW,CH,S) for f in out],CW*S,CH*S,[110]*len(out))
print(len(out),'quadros')
