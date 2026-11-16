import sys; sys.path.insert(0,'/home/openclaw/projects/GameStudio/workspaces/game-art/tools')
from pxpng import load_png_rgba, save_png_rgba, nn_scale
from gifenc import write_gif
import os
import json
CFG=json.loads(sys.argv[1])
w,h,p=load_png_rgba(CFG['src'])
PREF=CFG['prefix']
BG=tuple(CFG['bg'])
def op(c): return sum(abs(c[i]-BG[i]) for i in range(3))>14
BANDS={k:tuple(v) for k,v in CFG['bands'].items()}
DIRS=['frente','perfil_dir','perfil_esq','costas']
F=CFG.get('F',48); cells={}
for name,(y0,y1) in BANDS.items():
    H=y1-y0+1
    col=[sum(1 for y in range(y0,y1+1) if op(p[y][x])) for x in range(w)]
    isline=[c>=H-2 for c in col]
    panels=[tuple(x) for x in CFG['panels']]
    runs=[]
    for (a,b) in panels:
        wd=(b-a+1)/4
        for k in range(4): runs.append((int(a+k*wd),int(a+(k+1)*wd)-1))
    print(name,len(runs),[r[1]-r[0]+1 for r in runs])
    cells[name]=runs
os.makedirs('fixer_neural/frames',exist_ok=True)
def frame(x0,x1,y0,y1):
    pts=[(x,y) for y in range(y0-2,y1+3) for x in range(x0,x1+1) if 0<=y<h and op(p[y][x])]
    ys=[b for a,b in pts]; xs=[a for a,b in pts]
    X0,Y0,X1,Y1=min(xs),min(ys),max(xs),max(ys)
    cv=[[(0,0,0,0)]*F for _ in range(F)]
    ox=(F-(X1-X0+1))//2; oy=44-(Y1-Y0+1)
    # mantém só o maior componente conectado (remove lascas de quadros vizinhos)
    S_=set(pts); best=[]
    seen=set()
    for s0 in pts:
        if s0 in seen: continue
        st=[s0]; seen.add(s0); comp=[]
        while st:
            a,b=st.pop(); comp.append((a,b))
            for da in (-1,0,1):
                for db in (-1,0,1):
                    n=(a+da,b+db)
                    if n in S_ and n not in seen: seen.add(n); st.append(n)
        if len(comp)>len(best): best=comp
    pts=best
    xs=[a for a,b in pts]; ys=[b for a,b in pts]
    X0,Y0,X1,Y1=min(xs),min(ys),max(xs),max(ys)
    cv=[[(0,0,0,0)]*F for _ in range(F)]
    ox=(F-(X1-X0+1))//2; oy=44-(Y1-Y0+1)
    for a,b in pts: cv[b-Y0+oy][a-X0+ox]=p[b][a]
    return cv,(X1-X0+1,Y1-Y0+1)
anim={d:{'idle':[],'walk':[]} for d in DIRS}; sizes=[]
for name,runs in cells.items():
    y0,y1=BANDS[name]
    if len(runs)!=16: print('AVISO',name,len(runs))
    for i,(x0,x1) in enumerate(runs[:16]):
        f,sz=frame(x0,x1,y0,y1); sizes.append(sz)
        anim[DIRS[i//4]]['idle' if name=='idle' else 'walk'].append(f)
S=5
for d,a in anim.items():
    for k,frs in a.items():
        big=[[[(px if px[3] else (40,44,52,255)) for px in row] for row in nn_scale(f,F,F,S)] for f in frs]
        write_gif(f'fixer_neural/frames/{PREF}{d}_{k}.gif',big,F*S,F*S,[220 if k=='idle' else 130]*len(frs))
        sheet=[[(0,0,0,0)]*(F*len(frs)) for _ in range(F)]
        for i,f in enumerate(frs):
            for y in range(F):
                for x in range(F): sheet[y][i*F+x]=f[y][x]
        save_png_rgba(f'fixer_neural/frames/{PREF}{d}_{k}_sheet.png',F*len(frs),F,sheet)
print('tamanhos',sorted(set(sizes)))
