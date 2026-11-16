import sys; sys.path.insert(0,'/home/openclaw/projects/GameStudio/workspaces/game-art/tools')
from pxpng import load_png_rgba, save_png_rgba, nn_scale
out=sys.argv[1]; files=sys.argv[2:]; S=int(__import__('os').environ.get('S','4'))
sheets=[load_png_rgba(f) for f in files]
W=max(w for w,h,p in sheets)*S; H=sum(h for w,h,p in sheets)*S+len(sheets)*4
canvas=[[(40,44,52,255)]*W for _ in range(H)]
y0=0
for w,h,p in sheets:
    sc=nn_scale(p,w,h,S)
    for y in range(h*S):
        for x in range(w*S):
            if sc[y][x][3]: canvas[y0+y][x]=sc[y][x]
    y0+=h*S+4
save_png_rgba(out,W,H,canvas)
