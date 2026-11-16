import sys; sys.path.insert(0,'/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/etapa6-lab/fase13-comando10/scripts'); from lib import *
from collections import Counter
def palette(frs):
    c=Counter()
    for w,h,px in frs:
        for r in px:
            for p in r:
                if p[3]: c[tuple(p[:3])]+=1
    return c
SYM='.ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*+=-~^<>?!'
def dump(px, cmap, x0,y0,x1,y1):
    out=['    '+''.join(str((x//10)%10) for x in range(x0,x1+1)),'    '+''.join(str(x%10) for x in range(x0,x1+1))]
    for y in range(y0,y1+1):
        out.append('%3d '%y+''.join(cmap.get(tuple(px[y][x][:3]),'?') if px[y][x][3] else '.' for x in range(x0,x1+1)))
    return '\n'.join(out)
if __name__=='__main__':
    P=sys.argv[1]; a,d=sys.argv[2],sys.argv[3]
    fr=frames(P,a,d)
    pal=palette(fr)
    # sort by luminance
    cols=sorted(pal, key=lambda c:0.299*c[0]+0.587*c[1]+0.114*c[2])
    cmap={c:SYM[i+1] for i,c in enumerate(cols)}
    for c in cols: print(cmap[c], '#%02x%02x%02x'%c, pal[c])
    for i in [int(v) for v in sys.argv[4].split(',')]:
        print('== frame',i); print(dump(fr[i][2],cmap,8,6,48,51))
