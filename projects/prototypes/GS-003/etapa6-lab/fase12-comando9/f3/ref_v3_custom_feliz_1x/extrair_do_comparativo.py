import sys,os; sys.path.insert(0,'/home/openclaw/projects/GameStudio/workspaces/game-art/tools')
from pxpng import *
w,h,px=load_png_rgba('../comparativo_feliz.png'); bg=px[0][0]
# phase: boundaries x where px changes
from collections import Counter
cx=Counter(); cy=Counter()
for y in range(0,h,3):
    for x in range(1,w):
        if px[y][x]!=px[y][x-1]: cx[x%4]+=1
for x in range(0,w,3):
    for y in range(1,h):
        if px[y][x]!=px[y-1][x]: cy[y%4]+=1
print(cx,cy)
ox=cx.most_common(1)[0][0]; oy=cy.most_common(1)[0][0]
W=(w-ox)//4; H=(h-oy)//4
sm=[[px[oy+4*j][ox+4*i] for i in range(W)] for j in range(H)]
sm=[[(0,0,0,0) if c==bg else c for c in r] for r in sm]
# row3: y from 484//4..651//4
y0=(484-oy)//4; y1=(651-oy)//4+1
colsx=[i for i in range(W) if any(sm[j][i][3] for j in range(y0,y1))]
runs=[];s=colsx[0];p=s
for v in colsx[1:]:
    if v>p+2: runs.append((s,p)); s=v
    p=v
runs.append((s,p)); print(len(runs),runs)
os.makedirs('v3feliz',exist_ok=True)
# put each in 64x64 canvas, aligned by bottom (feet bottom at its row) -> keep vertical as is: canvas y from y0-? 
top=y0-4
for k,(a,b) in enumerate(runs):
    cx0=(a+b)//2-32
    cv=[[sm[j][i] if 0<=i<W and 0<=j<H and top<=j<y1+2 else (0,0,0,0) for i in range(cx0,cx0+64)] for j in range(top,top+64)]
    save_png_rgba('v3feliz/frame_%03d.png'%k,64,64,cv)
print(y0,y1,top)
