from comum import *; from pal import *
from base import TOPETE, CORPO
BG=(120,160,96,255); BG2=(200,204,196,255)
comp=from_txt(TOPETE+CORPO)
cs=[load(OUT+'/candidatos/cand_%02d.png'%i)[2] for i in range(16)]
# top 3
t=canvas(64*3,64,BG2)
for n,i in enumerate((0,8,9)):
    paste(t,cs[i],n*64,0); save(OUT+'/top3/top%d_cand_%02d.png'%(n+1,i),cs[i])
save(OUT+'/top3/top3_1x.png',t); save(OUT+'/top3/top3_4x.png',scale(t,4))
# antes/depois
a=canvas(64+30,64,BG2); paste(a,cs[0],0,0); paste(a,comp,68,62-38)
save(OUT+'/comparacao/antes_cand00_depois_base_1x.png',a); save(OUT+'/comparacao/antes_cand00_depois_base_4x.png',scale(a,4))
# escala: Tamer, Agumon, Hawkmon sobre linha de chão, com tile 32
def cut(p):
    w,h,px=load(p); return crop(px,*bbox(px))
ag=cut(LAB+'/fase17-f7-hibrido/v2/pacote_agumon_f7v2/rotations/S.png')
tm=cut(LAB+'/lab-assets/a-f7v2/tamer/tamer_a_cabelo_preto/rotations/south.png')
ds=cut(OUT+'/refs_enviadas/ref2_oficial_ds_dawndusk_mini_frente.png')
W,H,G=128,56,50
c=canvas(W,H,BG)
for x in range(W):
    for y in range(G,H): c[y][x]=(96,136,80,255) if (x//32)%2==0 else (104,144,86,255)
x=6
for s in (tm,ag,comp):
    paste(c,s,x,G-len(s)); print(len(s[0]),len(s)); x+=len(s[0])+10
save(OUT+'/comparacao/escala_tamer_agumon_hawkmon_1x.png',c); save(OUT+'/comparacao/escala_tamer_agumon_hawkmon_4x.png',scale(c,4))
# medidas
cols={}
for r in comp:
    for p in r:
        if p[3]: cols[p[:3]]=cols.get(p[:3],0)+1
E32=set(rgb(h) for h in '#be4a2f #d77643 #ead4aa #e4a672 #b86f50 #733e39 #3e2731 #a22633 #e43b44 #f77622 #feae34 #fee761 #63c74d #3e8948 #265c42 #193c3e #124e89 #0099db #2ce8f5 #ffffff #c0cbdc #8b9bb4 #5a6988 #3a4466 #262b44 #181425 #ff0044 #68386c #b55088 #f6757a #e8b796 #c28569'.split())
print('cores',len(cols),'todas P1',all(k in C2L for k in cols),'em Endesga-32',sum(1 for k in cols if k in E32))
print('usadas',''.join(sorted(C2L[k] for k in cols)),'nao usadas',''.join(sorted(set(C2L.values())-set(C2L[k] for k in cols))))
print('opacos',sum(cols.values()))
# pixels soltos (sem vizinho-4 da mesma cor)
n=0
for y,r in enumerate(comp):
    for x,p in enumerate(r):
        if not p[3]: continue
        if not any(0<=y+dy<38 and 0<=x+dx<22 and comp[y+dy][x+dx]==p for dx,dy in((1,0),(-1,0),(0,1),(0,-1))): n+=1
print('pixels sem vizinho-4 da mesma cor',n)
# simetria
print('simetria',sum(1 for r in TOPETE+CORPO for x in range(11) if r[x]!=r[21-x]),'pares diferentes')
T='/home/openclaw/projects/GameStudio/workspaces/game-art/tmp/c14/'
save(T+'escala_x4.png',scale(c,4)); save(T+'antes_depois_x6.png',scale(a,6)); save(T+'base_1x_x2.png',scale(c,2))
