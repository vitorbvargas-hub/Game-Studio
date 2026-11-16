# GIF: Tamer (fixo, escala) + 4 direções; sequência de animações (anim por direção configurável)
import sys,glob,json;sys.path.insert(0,'/home/openclaw/projects/GameStudio/workspaces/game-art/tools')
from pxpng import load_png_rgba,save_png_rgba,nn_scale,bbox_opaque
from gifenc import write_gif
cfg=json.loads(sys.argv[1]); R=cfg['root']; S=cfg.get('S',4); C=cfg.get('cell',56); BG=(48,52,60,255); FOOT=C-6
dirs=['south','west','east','north']
tam=load_png_rgba(cfg['tamer']) if cfg.get('tamer') else None
def place(cv,ox,img):
    w,h,p=img; b=bbox_opaque(p,w,h)
    if not b: return
    x0,y0,x1,y1=b; dx=ox+(C-(x1-x0+1))//2-x0; dy=FOOT-y1
    for y in range(y0,y1+1):
        for x in range(x0,x1+1):
            if p[y][x][3]>0 and 0<=y+dy<C: cv[y+dy][x+dx]=p[y][x][:3]+(255,)
ncol=4+(1 if tam else 0); frames=[];delays=[]
for seg in cfg['seq']:
    fr={d:sorted(glob.glob(f"{R}/animations/{seg['anim'].get(d,seg['anim'].get('*'))}/{d}/frame_*.png")) or [f"{R}/rotations/{d}.png"] for d in dirs}
    n=max(len(v) for v in fr.values())
    for _ in range(seg.get('loops',1)):
        for i in range(n):
            cv=[[BG]*(C*ncol) for _ in range(C)]
            k0=0
            if tam: place(cv,0,tam); k0=1
            for k,d in enumerate(dirs):
                place(cv,(k+k0)*C,load_png_rgba(fr[d][min(i,len(fr[d])-1)]))
            for x in range(C*ncol): cv[FOOT+1][x]=(70,75,85,255) if cv[FOOT+1][x]==BG else cv[FOOT+1][x]
            frames.append(nn_scale(cv,C*ncol,C,S)); delays.append(seg.get('ms',110))
write_gif(cfg['out'],frames,C*ncol*S,C*S,delays)
save_png_rgba(cfg['out'].replace('.gif','_f0.png'),C*ncol*S,C*S,frames[0])
print(len(frames),'frames')
