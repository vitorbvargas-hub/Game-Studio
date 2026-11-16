"""Limpeza local gratuita: quantiza para N cores (k-means), remove pixels isolados. Sem IA, sem serviço externo."""
import sys,random; sys.path.insert(0,'/home/openclaw/projects/GameStudio/workspaces/game-art/tools')
from pxpng import load_png_rgba, save_png_rgba, nn_scale
src,dst,N=sys.argv[1],sys.argv[2],int(sys.argv[3])
w,h,p=load_png_rgba(src)
pts=[c[:3] for r in p for c in r if c[3]>127]
random.seed(1); cent=random.sample(pts,N)
for it in range(12):
    acc=[[0,0,0,0] for _ in cent]
    for c in pts:
        i=min(range(N),key=lambda k:(c[0]-cent[k][0])**2+(c[1]-cent[k][1])**2+(c[2]-cent[k][2])**2)
        a=acc[i]; a[0]+=c[0];a[1]+=c[1];a[2]+=c[2];a[3]+=1
    cent=[(a[0]//a[3],a[1]//a[3],a[2]//a[3]) if a[3] else cent[i] for i,a in enumerate(acc)]
def near(c): return min(cent,key=lambda k:(c[0]-k[0])**2+(c[1]-k[1])**2+(c[2]-k[2])**2)
q=[[ (near(c[:3])+(255,)) if c[3]>127 else (0,0,0,0) for c in r] for r in p]
# remove pixels isolados (cor diferente de todos os 4 vizinhos e vizinhos iguais entre si)
out=[r[:] for r in q]
for y in range(1,h-1):
    for x in range(1,w-1):
        c=q[y][x]
        if c[3]==0: continue
        nb=[q[y-1][x],q[y+1][x],q[y][x-1],q[y][x+1]]
        if all(n!=c for n in nb):
            from collections import Counter
            m,k=Counter(nb).most_common(1)[0]
            if k>=3 and m[3]: out[y][x]=m
save_png_rgba(dst,w,h,out)
S=3; save_png_rgba(dst.replace('.png','_3x.png'),w*S,h*S,[[(c if c[3] else (40,44,52,255)) for c in r] for r in nn_scale(out,w,h,S)])
save_png_rgba(src.split('/')[-1].replace('.png','_orig_3x.png') if False else dst.replace('.png','_orig_3x.png'),w*S,h*S,[[(c if c[3] else (40,44,52,255)) for c in r] for r in nn_scale(p,w,h,S)])
print(len(set(c for r in out for c in r if c[3])),'cores')
