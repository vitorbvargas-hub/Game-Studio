import sys; sys.path.insert(0,'.')
from rig import C, save, blob
import agumon_s as S
W,H=S.W,S.H
OUT='../out/'
import os; os.makedirs(OUT,exist_ok=True)

def shift(f,dx,dy=0):
    n=C(f.w,f.h); n.paste(f,dx,dy); return n
def fireball(f,cx,cy,r):
    if r<=0: return
    blob(f,cx,cy,r,r,base='f2',lit='f3',dark='f1',deep='f1'); 
def sparks(f,pts,col='f2'):
    for x,y in pts: f.put(x,y,col)
def flash(f):
    for y in range(f.h):
        for x in range(f.w):
            if f.p[y][x] not in (None,'o'): f.p[y][x]='s'

anims={}
# IDLE: respiração + piscada + cauda
anims['idle']=([S.frame(bob=0),S.frame(bob=0,tdx=1),S.frame(bob=1,tdx=1),S.frame(bob=1,eyes='closed')],[260,260,260,140])
# WALK sul: pernas alternadas, braços contrários, sobe e desce
anims['walk_s']=([S.frame(ll=3,ra=1,bob=0),S.frame(bob=1),S.frame(rl=3,la=1,bob=0),S.frame(bob=1)],[150]*4)
# FELIZ: pulinhos, olhos fechados de alegria, braços para cima
anims['feliz']=([S.frame(eyes='happy',mouth='grin',la=3,ra=3,bob=-2,hdy=0),S.frame(eyes='happy',mouth='grin',la=1,ra=1),
                 S.frame(eyes='happy',mouth='grin',la=3,ra=3,bob=-2),S.frame(eyes='happy',mouth='smile')],[160,160,160,240])
# TRISTE: cabeça baixa, olhos e boca tristes, respiração lenta
anims['triste']=([S.frame(eyes='sad',mouth='sad',hdy=1),S.frame(eyes='sad',mouth='sad',hdy=2,bob=0),S.frame(eyes='sad',mouth='sad',hdy=2,bob=1),S.frame(eyes='closed',mouth='sad',hdy=1)],[400,400,400,300])
# BRAVO: rosnado, tremor lateral
a=[S.frame(eyes='angry',mouth='flat'),S.frame(eyes='angry',mouth='roar'),S.frame(eyes='angry',mouth='roar'),S.frame(eyes='angry',mouth='flat')]
anims['bravo']=([a[0],shift(a[1],1),shift(a[2],-1),a[3]],[200,90,90,200])
# ATAQUE "Pepper Breath" (bola de fogo): preparação, inspiração, disparo, bola viaja para frente (para baixo na tela)
def fb(cx,cy,r,sp=()):
    return lambda f:(fireball(f,cx,cy,r),sparks(f,sp))
atk=[S.frame(eyes='angry',mouth='flat',hdy=1,bob=1,la=1,ra=1),
     S.frame(eyes='angry',mouth='grin',hdy=-1,la=2,ra=2),
     S.frame(eyes='angry',mouth='roar',fx=fb(20,26,2.5,[(17,24),(23,24)])),
     S.frame(eyes='angry',mouth='roar',fx=fb(20,32,4,[(15,29),(25,30),(20,27)])),
     S.frame(eyes='angry',mouth='grin',fx=fb(20,38,5,[(14,35),(26,36),(16,41),(24,41)])),
     S.frame(eyes='open',mouth='smile',fx=lambda f:sparks(f,[(13,40),(27,39),(20,42),(17,37),(23,37)],'f1'))]
anims['ataque_pepper_breath']=(atk,[180,140,90,90,110,200])
# DANO: recuo + flash branco
h1=S.frame(eyes='hurt',mouth='ouch',bob=-1); flash(h1)
anims['dano']=([S.frame(eyes='hurt',mouth='ouch'),h1,shift(S.frame(eyes='hurt',mouth='ouch'),-1),S.frame(eyes='sad',mouth='flat')],[80,80,120,220])
# DERROTA: fecha os olhos e cai
anims['derrota']=([S.frame(eyes='hurt',mouth='ouch'),S.frame(eyes='closed',mouth='sad',hdy=1,bob=1),S.frame(eyes='closed',mouth='sad',hdy=3,bob=3,la=-1,ra=-1),S.frame(eyes='closed',mouth='flat',hdy=5,bob=5,la=-2,ra=-2)],[200,200,240,600])

for k,(fr,d) in anims.items(): save(fr, OUT+'agumon_'+k, d)
print(list(anims))
