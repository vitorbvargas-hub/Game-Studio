import sys; sys.path.insert(0,'.')
from cutrig import *
bgw,bgh,bg=load('/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/etapa6-lab/fase1-pixellab/referencias/v15b_crop_NW_1x.png')
X0,Y0,CW,CH=300,300,192,108
def sheet_frames(path,n):
    w,h,px=load(path); fw=w//n
    return [[r[i*fw:(i+1)*fw] for r in px] for i in range(n)]
A=sheet_frames(OUT+'agumonA_walk_oeste_sheet.png',4)
M=sheet_frames('../out/agumon_walk_e_sheet.png',4)
frames=[]
for t in range(16):
    cv=[row[X0:X0+CW] for row in bg[Y0:Y0+CH]]
    cv=[r[:] for r in cv]
    def blit(spr,x,y):
        for j,r in enumerate(spr):
            for i,p in enumerate(r):
                if p[3]>127 and 0<=y+j<CH and 0<=x+i<CW: cv[y+j][x+i]=p
    blit(A[t%4],150-t*3,40)           # Agumon ChatGPT+rig andando para oeste
    blit(M[t%4],t*3-10,50)            # Agumon desenhado pelo game-studio andando para leste
    frames.append(cv)
S=4
big=[nn_scale(f,CW,CH,S) for f in frames]
write_gif(OUT+'cena_floresta_dois_agumons.gif',big,CW*S,CH*S,[150]*16)
print('ok')
