# GIF de prévia de personagem PixelLab: 4 direções lado a lado, anims em sequência; + strip PNG; + métricas
import sys,os,glob,json;sys.path.insert(0,'/home/openclaw/projects/GameStudio/workspaces/game-art/tools')
from pxpng import load_png_rgba,save_png_rgba,nn_scale,bbox_opaque
from gifenc import write_gif
root,anims,out,S=sys.argv[1],sys.argv[2].split(','),sys.argv[3],int(sys.argv[4])
dirs=['south','west','east','north']; BG=(48,52,60,255)
seq=[];delays=[];met={}
for an in anims:
    fr={d:sorted(glob.glob(f'{root}/animations/{an}/{d}/frame_*.png')) for d in dirs}
    n=max(len(v) for v in fr.values())
    for rep in range(2 if an.startswith('walk') else 1):
        for i in range(n):
            ims=[load_png_rgba(fr[d][min(i,len(fr[d])-1)]) for d in dirs]
            w,h=ims[0][0],ims[0][1]
            cv=[[BG]*(w*4) for _ in range(h)]
            for k,(ww,hh,p) in enumerate(ims):
                for y in range(hh):
                    for x in range(ww):
                        if p[y][x][3]>0: cv[y][k*w+x]=p[y][x][:3]+(255,)
                if rep==0:
                    b=bbox_opaque(p,ww,hh); met.setdefault(an,{}).setdefault(dirs[k],[]).append(b[3]-b[1]+1 if b else 0)
            seq.append(nn_scale(cv,w*4,h,S)); delays.append(100 if an.startswith('walk') else 120)
W=len(seq[0][0]);H=len(seq[0])
write_gif(out,seq,W,H,delays)
print(json.dumps({a:{d:(min(v),max(v)) for d,v in m.items()} for a,m in met.items()}))
