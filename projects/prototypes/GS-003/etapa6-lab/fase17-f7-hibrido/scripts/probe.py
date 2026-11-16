from lib import *
def headdiff(a,b,rows,dx,dy):
    # a,b px; compara linhas rows de a com b deslocado
    n=0
    for y in rows:
        for x in range(60):
            ca=tuple(a[y][x]); yy=y-dy; xx=x-dx
            cb=tuple(b[yy][xx]) if 0<=yy<len(b) and 0<=xx<len(b[0]) else T
            if ca!=cb and (ca[3] or cb[3]): n+=1
    return n
for d,cv,off in (('S',60,(0,0)),('N',56,(2,2))):
    rot=pad(load(F2B+'/rotations/%s.png'%d),60,60,6,5)
    rb=bbox(rot); print(d,'rot bbox',rb)
    for anim in ('walk','attack'):
        fr=[pad(f,60,60,*off) for f in frames(F2B,anim,d)]
        for i,f in enumerate(fr):
            b=bbox(f)
            best=min(((headdiff(rot[2],f[2],range(rb[1],rb[1]+14),dx,dy),dx,dy) for dx in range(-3,4) for dy in range(-4,5)))
            low=[x for x in range(60) if f[2][b[3]][x][3]]
            print(d,anim,i,'bbox',b,'cabeca vs rot (px,dx,dy)',best,'cols',len(asc(f)))
