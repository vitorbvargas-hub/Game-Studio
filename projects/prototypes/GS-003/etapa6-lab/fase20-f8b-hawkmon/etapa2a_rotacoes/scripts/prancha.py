"""Pranchas da Etapa 2a: 4 direções do Hawkmon (polidas) ao lado do Agumon F7v2 e do Tamer, em 1x e 4x; cru x polido; silhuetas."""
import sys, os; sys.dont_write_bytecode=True
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from polir import *
R=build(); P=D+'/prancha/'; os.makedirs(P,exist_ok=True)
def cut(p):
    w,h,px=load(p); return crop(px,*bbox(px))
AGD=LAB+'/fase17-f7-hibrido/v2/pacote_agumon_f7v2/rotations/'
tm=cut(LAB+'/lab-assets/a-f7v2/tamer/tamer_a_cabelo_preto/rotations/south.png')
hk={k:crop(comp(*R[k]),*bbox(comp(*R[k]))) for k in 'SNEW'}
ag={k:cut(AGD+k+'.png') for k in 'SNEW'}
BG=(120,160,96,255)
# prancha principal: 2 faixas (Hawkmon, Agumon) sobre chão em tiles de 32; Tamer S à esquerda de cada faixa
CW=44; W=8+len(tm[0])+10+4*CW; FH=60; H=2*FH
c=canvas(W,H,BG)
for f,(sp) in enumerate((hk,ag)):
    G=f*FH+52
    for x in range(W):
        for y in range(G,f*FH+FH): c[y][x]=(96,136,80,255) if (x//32)%2==0 else (104,144,86,255)
    paste(c,tm,6,G-len(tm))
    for i,k in enumerate('SNEW'):
        s=sp[k]; paste(c,s,8+len(tm[0])+10+i*CW+(CW-len(s[0]))//2,G-len(s))
save(P+'prancha_4direcoes_hawkmon_agumon_tamer_1x.png',c); save(P+'prancha_4direcoes_hawkmon_agumon_tamer_4x.png',scale(c,4))
# cru x polido
v=canvas(4*30+4,2*44+4,BG)
for i,(k,n) in enumerate((('S','south'),('N','north'),('E','east'),('W','west'))):
    w,h,raw=load(D+'/rotacoes_cruas/'+n+'.png'); paste(v,crop(raw,9,4,38,44),2+i*30,2); paste(v,crop(comp(*R[k]),9,4,38,44),2+i*30,46)
save(P+'cru_x_polido_SNEW_1x.png',v); save(P+'cru_x_polido_SNEW_4x.png',scale(v,4))
# camadas: corpo | topete | composto por direção
v=canvas(4*30+4,3*44+4,BG)
for i,k in enumerate('SNEW'):
    t,b=R[k]
    for j,p in enumerate((b,t,comp(t,b))): paste(v,crop(p,9,4,38,44),2+i*30,2+j*44)
save(P+'camadas_corpo_topete_composto_SNEW_4x.png',scale(v,4))
# silhuetas Hawkmon x Agumon
sw=canvas(W,H,(255,255,255,255))
for f,sp in enumerate((hk,ag)):
    G=f*FH+52
    for i,k in enumerate('SNEW'):
        s=sp[k]; x0=8+len(tm[0])+10+i*CW+(CW-len(s[0]))//2
        for yy,r in enumerate(s):
            for xx,p in enumerate(r):
                if p[3]: sw[G-len(s)+yy][x0+xx]=(0,0,0,255)
save(P+'silhuetas_hawkmon_agumon_SNEW_4x.png',scale(sw,4))
T='/home/openclaw/projects/GameStudio/workspaces/game-art/tmp/c14e2a/'
save(T+'prancha_x4.png',scale(c,4)); save(T+'sil_rot_x3.png',scale(sw,3))
print('tamer',len(tm[0]),len(tm),{k:(len(ag[k][0]),len(ag[k])) for k in ag})
