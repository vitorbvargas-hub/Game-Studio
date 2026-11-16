import sys; sys.path.insert(0,'.')
from cutrig import *
SRC='/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/etapa6-lab/metodo-a-v2/game-ready/digimon/agumon/agumon_retrato_A.png'
w,h,px=load(SRC)
P=cut(w,h,px,[('head',(0,0,22,13)),('arm_f',(0,14,10,23)),('arm_b',(24,14,31,24)),('leg_b',(4,26,18,33)),('leg_f',(19,26,31,33))])
W,H,OFF=52,46,(12,9)
ORDER=['arm_b','leg_b','body','leg_f','head','arm_f']
def fr(m=None,**k): return compose(P,W,H,OFF,m or {},ORDER,**k)
up=lambda d:{'head':(0,d),'body':(0,d),'arm_f':(0,d),'arm_b':(0,d)}
def mix(*ds):
    r={}
    for d in ds:
        for k,v in d.items(): a=r.get(k,(0,0)); r[k]=(a[0]+v[0],a[1]+v[1])
    return r
anims={}
anims['idle']=([fr(),fr(up(0)|{'head':(0,1)}),fr(up(1)),fr(up(1)|{'head':(0,0)})],[260]*4)
walk=[mix(up(0),{'leg_f':(-1,-2),'arm_f':(1,0),'arm_b':(-1,0)}),mix(up(1)),mix(up(0),{'leg_b':(-1,-2),'arm_f':(-1,0),'arm_b':(1,0)}),mix(up(1))]
anims['walk_oeste']=([fr(m) for m in walk],[150]*4)
anims['walk_leste']=([fr(m,flip=True) for m in walk],[150]*4)
anims['feliz']=([fr(mix(up(-2),{'leg_f':(0,-2),'leg_b':(0,-2),'arm_f':(0,-3),'arm_b':(0,-3)})),fr(up(0)),fr(mix(up(-2),{'leg_f':(0,-2),'leg_b':(0,-2),'arm_f':(0,-3),'arm_b':(0,-3)})),fr(up(1))],[160,160,160,240])
anims['triste']=([fr({'head':(0,2),'arm_f':(0,1),'arm_b':(0,1)}),fr({'head':(0,3),'arm_f':(0,1),'arm_b':(0,1),'body':(0,1)}),fr({'head':(0,3),'arm_f':(0,2),'arm_b':(0,2),'body':(0,1)}),fr({'head':(0,2),'arm_f':(0,1),'arm_b':(0,1)})],[420]*4)
anims['bravo']=([fr({'head':(-1,1)}),fr({'head':(0,0),'body':(1,0),'arm_f':(1,0)}),fr({'head':(-1,1),'body':(-1,0),'arm_f':(-1,0)}),fr({'head':(-1,1)})],[200,80,80,200])
MX,MY=OFF[0]+1,OFF[1]+11   # boca
atk=[fr({'head':(1,1),'arm_f':(1,0)}),fr({'head':(0,-1)}),
     fr({'head':(-1,0)},fx=lambda c:ball(c,MX-2,MY,2.5)),
     fr({'head':(-1,0)},fx=lambda c:ball(c,MX-6,MY,3.5)),
     fr({},fx=lambda c:ball(c,MX-10,MY,4)),fr({})]
anims['ataque_pepper_breath']=(atk,[180,120,90,90,110,220])
anims['dano']=([fr({'head':(1,0)}),fr({'head':(2,-1),'body':(1,0)},flash=True),fr({'head':(1,0),'body':(1,0)}),fr()],[80,80,120,220])
anims['derrota']=([fr({'head':(1,1)}),fr({'head':(1,3),'body':(0,2),'arm_f':(0,3),'arm_b':(0,3)}),fr({'head':(1,6),'body':(0,4),'arm_f':(0,5),'arm_b':(0,5)}),fr({'head':(1,8),'body':(0,5),'arm_f':(0,6),'arm_b':(0,6)})],[200,200,240,600])
sheets=[]
for k,(f,d) in anims.items(): sheets.append(save(f,'agumonA_'+k,d))
# prancha de contato
S=4; Wm=max(len(s[0]) for s in sheets)*S; Hm=sum(len(s) for s in sheets)*S
cv=[[(40,44,52,255)]*Wm for _ in range(Hm)]; y0=0
for s in sheets:
    sc=nn_scale(s,len(s[0]),len(s),S)
    for y,r in enumerate(sc):
        for x,p in enumerate(r):
            if p[3]: cv[y0+y][x]=p
    y0+=len(s)*S
save_png_rgba(OUT+'contato_agumonA.png',Wm,Hm,cv)
print(list(anims))
