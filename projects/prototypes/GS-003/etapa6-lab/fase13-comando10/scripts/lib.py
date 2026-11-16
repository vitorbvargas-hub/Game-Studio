import sys, os
sys.path.insert(0, '/home/openclaw/projects/GameStudio/workspaces/game-art/tools')
from pxpng import load_png_rgba, save_png_rgba
from gifenc import write_gif
L='/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/etapa6-lab'
O=L+'/fase13-comando10'
def load(p):
    w,h,px=load_png_rgba(p); return w,h,[list(r) for r in px]
def frames(pack, anim, d):
    dd=os.path.join(pack,anim,d); fs=sorted(f for f in os.listdir(dd) if f.endswith('.png'))
    return [load(os.path.join(dd,f)) for f in fs]
def sheet(frs, scale, bg=(200,210,190,255), gap=2, grid=False):
    w,h=frs[0][0],frs[0][1]; W=(w*scale+gap)*len(frs); H=h*scale
    out=[[bg]*W for _ in range(H)]
    for i,(fw,fh,px) in enumerate(frs):
        ox=i*(w*scale+gap)
        for y in range(fh):
            for x in range(fw):
                c=px[y][x]
                if grid and c[3]==0 and ((x+y)%2==0): cc=(185,195,175,255)
                else: cc=c if c[3] else (bg if not grid else (200,210,190,255))
                for dy in range(scale):
                    row=out[y*scale+dy]
                    for dx in range(scale): row[ox+x*scale+dx]=tuple(cc)
    return W,H,out
