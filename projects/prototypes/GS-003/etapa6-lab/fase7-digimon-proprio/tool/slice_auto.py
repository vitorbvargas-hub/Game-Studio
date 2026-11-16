# fatia folha magenta (4 linhas x N col) em frames FxF, pé em y=F-4; bandas por projeção y
import sys,os,json;sys.path.insert(0,'/home/openclaw/projects/GameStudio/workspaces/game-art/tools')
from pxpng import load_png_rgba, save_png_rgba, nn_scale
from gifenc import write_gif
cfg=json.loads(sys.argv[1])
w,h,img=load_png_rgba(cfg['src'])
def isbg(c):
    r,g,b,a=c
    return a<128 or (r>150 and b>120 and g<r-60 and g<b-40)
NC=cfg.get('cols',8); F=cfg.get('F',48); PAD=cfg.get('pad',16); FOOT=F-4
names=cfg['rows']; keep=cfg.get('keep',names)
# projeção y
prof=[sum(1 for x in range(w) if not isbg(img[y][x])) for y in range(h)]
bands=[];inb=False
for y,v in enumerate(prof+[0]):
    if v>cfg.get('thr',2) and not inb: y0=y;inb=True
    elif v<=cfg.get('thr',2) and inb:
        if y-y0>8: bands.append([y0,y])
        inb=False
print('bandas',bands)
if 'bands' in cfg: bands=cfg['bands']
assert len(bands)==len(names),(len(bands),names)
cw=w/NC; os.makedirs(cfg['out'],exist_ok=True); rep={}
for r,name in enumerate(names):
    if name not in keep: continue
    y0,y1=bands[r]; frs=[]; hs=[]; ws=[]
    for c in range(NC):
        x0,x1=max(0,int(c*cw)-PAD),min(w,int((c+1)*cw)+PAD)
        pts=[(x,y) for y in range(y0,y1) for x in range(x0,x1) if not isbg(img[y][x])]
        S_=set(pts);seen=set();comps=[]
        for s0 in pts:
            if s0 in seen: continue
            st=[s0];seen.add(s0);comp=[]
            while st:
                a,b=st.pop();comp.append((a,b))
                for da in(-1,0,1):
                    for db in(-1,0,1):
                        n=(a+da,b+db)
                        if n in S_ and n not in seen: seen.add(n);st.append(n)
            comps.append(comp)
        lo,hi=c*cw,(c+1)*cw
        best=[pt for k in comps if len(k)>cfg.get('minc',12) and lo<=sum(a for a,b in k)/len(k)<hi for pt in k]
        xs=[a for a,b in best];ys=[b for a,b in best]
        X0,Y0,X1,Y1=min(xs),min(ys),max(xs),max(ys);hs.append(Y1-Y0+1);ws.append(X1-X0+1)
        cv=[[(0,0,0,0)]*F for _ in range(F)]
        ox=(F-(X1-X0+1))//2;oy=FOOT-(Y1-Y0+1)
        for a,b in best:
            X,Y=a-X0+ox,b-Y0+oy
            if 0<=X<F and 0<=Y<F: cv[Y][X]=img[b][a]
        frs.append(cv)
    sheet=[[(0,0,0,0)]*(F*NC) for _ in range(F)]
    for i,f in enumerate(frs):
        for y in range(F):
            for x in range(F): sheet[y][i*F+x]=f[y][x]
    pre=cfg['prefix']
    save_png_rgba(f"{cfg['out']}/{pre}_{name}_sheet.png",F*NC,F,sheet)
    write_gif(f"{cfg['out']}/{pre}_{name}.gif",[[[(px if px[3] else (40,44,52,255)) for px in row] for row in nn_scale(f,F,F,5)] for f in frs],F*5,F*5,[cfg.get('ms',110)]*NC)
    rep[name]={'h':(min(hs),max(hs)),'w':(min(ws),max(ws))}
print(json.dumps(rep))
