from lib import *
def diff(a,b,dx,dy,rows=range(60)):
    n=0
    for y in rows:
        for x in range(60):
            ca=tuple(a[y][x]); yy=y-dy; xx=x-dx
            cb=tuple(b[yy][xx]) if 0<=yy<60 and 0<=xx<60 else T
            if ca!=cb and (ca[3] or cb[3]): n+=1
    return n
for d,off in (('S',(0,0)),('E',(0,0)),('N',(2,2))):
    rot=pad(load(F2B+'/rotations/%s.png'%d),60,60,6,5)
    fr=[pad(f,60,60,*off) for f in frames(F2B,'attack',d)]
    for i in (0,8):
        best=min((diff(rot[2],fr[i][2],dx,dy),dx,dy) for dx in range(-3,4) for dy in range(-4,5))
        print(d,'attack q%d vs rot: (px,dx,dy)'%i,best)
    base=asc(fr[0]); 
    for i in range(1,9):
        new={c:n for c,n in asc(fr[i]).items() if c not in base}
        fire={c:n for c,n in new.items() if c[0]>200 and (c[2]<140 or min(c[:3])>200) and not (c[0]<240 and c[1]<200 and c[2]<100 and c[1]>120)}
        print(d,i,'novas',len(new),'fogo?',sorted(((n,hx(c)) for c,n in fire.items()),reverse=True)[:14])
