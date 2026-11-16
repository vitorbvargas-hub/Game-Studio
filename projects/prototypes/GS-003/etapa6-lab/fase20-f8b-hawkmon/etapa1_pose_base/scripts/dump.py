from comum import *; from pal import *
import sys
i=int(sys.argv[1]); w,h,px=load(OUT+'/candidatos/cand_%02d.png'%i)
b=bbox(px); c=crop(px,*b)
for n,r in enumerate(to_txt(c)): print('%02d %s'%(n+b[1],r))
T='/home/openclaw/projects/GameStudio/workspaces/game-art/tmp/c14/'
save(T+'cand%02d_x12.png'%i,scale([[p if p[3] else (200,204,196,255) for p in r] for r in c],12))
