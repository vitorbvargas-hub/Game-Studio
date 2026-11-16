import sys; sys.path.insert(0,'/home/openclaw/projects/GameStudio/workspaces/game-art/tools')
from pxpng import load_png_rgba, nn_scale
from gifenc import write_gif
bw,bh,bg=load_png_rgba('../fase1-pixellab/referencias/v15b_crop_NW_1x.png')
def frames(name):
    w,h,p=load_png_rgba(f'fixer_neural/frames/{name}_sheet.png'); n=w//48
    return [[r[i*48:(i+1)*48] for r in p] for i in range(n)]
A={'s':frames('frente_walk'),'e':frames('perfil_esq_walk'),'w':frames('perfil_dir_walk'),'n':frames('costas_walk')}
T={'s':frames('tamer_frente_walk'),'e':frames('tamer_perfil_esq_walk'),'w':frames('tamer_perfil_dir_walk'),'n':frames('tamer_costas_walk')}
X0,Y0,CW,CH=300,300,220,130
path=[]; x,y=30,20
for d,dx,dy,n in (('e',2,0,26),('s',0,2,14),('w',-2,0,26),('n',0,-2,14)):
    for i in range(n): path.append((d,x,y)); x+=dx; y+=dy
out=[]
for t,(d,x,y) in enumerate(path):
    cv=[r[X0:X0+CW] for r in bg[Y0:Y0+CH]]; cv=[r[:] for r in cv]
    def blit(s,X,Y):
        for j,row in enumerate(s):
            for k,px in enumerate(row):
                if px[3]>127 and 0<=Y+j<CH and 0<=X+k<CW: cv[Y+j][X+k]=px
    lag=max(0,t-8); d2,x2,y2=path[lag]
    sprites=[(A[d2][t%len(A[d2])],x2,y2+4),(T[d][t%len(T[d])],x,y)]
    sprites.sort(key=lambda s:s[2])
    for s,X,Y in sprites: blit(s,X,Y)
    out.append(cv)
S=3
write_gif('fixer_neural/cena_tamer_agumon_fixer.gif',[nn_scale(f,CW,CH,S) for f in out],CW*S,CH*S,[110]*len(out))
print(len(out))
