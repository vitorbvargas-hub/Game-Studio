import sys, os
sys.dont_write_bytecode=True
sys.path.insert(0, '/home/openclaw/projects/GameStudio/workspaces/game-art/tools')
from pxpng import load_png_rgba, save_png_rgba
from gifenc import write_gif
L='/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/etapa6-lab'
O=L+'/fase17-f7-hibrido'
F2B=L+'/fase12-comando9/f2/pacote_agumon_f2'
C10=L+'/fase13-comando10/pacote_agumon_c10'
F6=L+'/fase16-f6-blender/pacote_agumon_f6'
F4=L+'/fase12-comando9/f4/hibrido_agumon_S'
C10H=L+'/fase13-comando10/hibrido_agumon_S_c10'
F3=L+'/fase12-comando9/f3'
F7=O+'/pacote_agumon_f7'
T=(0,0,0,0)
def load(p):
    w,h,px=load_png_rgba(p); return w,h,[list(r) for r in px]
def save(p,img):
    w,h,px=img; os.makedirs(os.path.dirname(p),exist_ok=True); save_png_rgba(p,w,h,[[tuple(c) for c in r] for r in px])
def frames(pack, anim, d=None):
    dd=os.path.join(pack,anim,d) if d else os.path.join(pack,anim); fs=sorted(f for f in os.listdir(dd) if f.endswith('.png'))
    return [load(os.path.join(dd,f)) for f in fs]
def new(w,h): return (w,h,[[T]*w for _ in range(h)])
def pad(img,W,H,ox,oy):
    w,h,px=img; out=[[T]*W for _ in range(H)]
    for y in range(h):
        for x in range(w):
            if px[y][x][3] and 0<=y+oy<H and 0<=x+ox<W: out[y+oy][x+ox]=px[y][x]
    return (W,H,out)
def mirror(img):
    w,h,px=img; return (w,h,[list(reversed(r)) for r in px])
def bbox(img):
    w,h,px=img; xs=[x for y in range(h) for x in range(w) if px[y][x][3]]; ys=[y for y in range(h) for x in range(w) if px[y][x][3]]
    return (min(xs),min(ys),max(xs),max(ys)) if xs else None
def sheet(frs, scale, bg=(127,166,90,255), gap=2, cols=None):
    cols=cols or len(frs); rows=(len(frs)+cols-1)//cols
    w=max(f[0] for f in frs); h=max(f[1] for f in frs); W=(w*scale+gap)*cols; H=(h*scale+gap)*rows
    out=[[bg]*W for _ in range(H)]
    for i,(fw,fh,px) in enumerate(frs):
        ox=(i%cols)*(w*scale+gap); oy=(i//cols)*(h*scale+gap)+(h-fh)*scale
        for y in range(fh):
            for x in range(fw):
                c=px[y][x]
                if not c[3]: 
                    if (x//4+y//4)%2: 
                        cc=(120,158,84,255)
                    else: continue
                else: cc=tuple(c)
                for dy in range(scale):
                    row=out[oy+y*scale+dy]
                    for dx in range(scale): row[ox+x*scale+dx]=cc
    return W,H,out
def asc(img, pal=None):
    w,h,px=img; cols={}
    for r in px:
        for c in r:
            if c[3]: cols[tuple(c)]=cols.get(tuple(c),0)+1
    return cols
def hx(c): return '#%02x%02x%02x'%tuple(c[:3])
def rgb(s): s=s.lstrip('#'); return (int(s[0:2],16),int(s[2:4],16),int(s[4:6],16),255)
