import sys; sys.path.insert(0,'/home/openclaw/projects/GameStudio/workspaces/game-art/tools')
from pxpng import load_png_rgba, save_png_rgba, nn_scale
from gifenc import write_gif
import os
w,h,img=load_png_rgba('chatgpt_prompt_padrao_v1/agumon_walk_neural_px45.png')
def isbg(c):  # magenta e franjas magenta
    r,g,b=c[:3]
    return r>150 and b>120 and g<r-60 and g<b-40
W,H=w,h; cw,ch=W/8,H/4; F=48; PAD=16
rows=['sul','oeste','leste','norte']
os.makedirs('chatgpt_prompt_padrao_v1/frames',exist_ok=True)
heights=[]
for r,name in enumerate(rows):
    frs=[]
    for c in range(8):
        x0,x1=max(0,int(c*cw)-PAD),min(W,int((c+1)*cw)+PAD); y0,y1=[(3,41),(54,99),(113,158),(162,195)][r]
        cx=(c+0.5)*cw
        pts=[(x,y) for y in range(y0,y1) for x in range(x0,x1) if not isbg(img[y][x])]
        S_=set(pts); seen=set(); comps=[]
        for s0 in pts:
            if s0 in seen: continue
            st=[s0]; seen.add(s0); comp=[]
            while st:
                a,b=st.pop(); comp.append((a,b))
                for da in (-1,0,1):
                    for db in (-1,0,1):
                        n=(a+da,b+db)
                        if n in S_ and n not in seen: seen.add(n); st.append(n)
            comps.append(comp)
        # componente principal = o grande mais perto do centro da célula
        lo,hi=c*cw,(c+1)*cw
        best=[pt for k in comps if len(k)>12 and lo<=sum(a for a,b in k)/len(k)<hi for pt in k]
        xs=[a for a,b in best]; ys=[b for a,b in best]
        X0,Y0,X1,Y1=min(xs),min(ys),max(xs),max(ys); heights.append(Y1-Y0+1)
        cv=[[(0,0,0,0)]*F for _ in range(F)]
        ox=(F-(X1-X0+1))//2; oy=44-(Y1-Y0+1)
        for a,b in best:
            X,Y=a-X0+ox,b-Y0+oy
            if 0<=X<F and 0<=Y<F: cv[Y][X]=img[b][a]
        frs.append(cv)
    sheet=[[(0,0,0,0)]*(F*8) for _ in range(F)]
    for i,f in enumerate(frs):
        for y in range(F):
            for x in range(F): sheet[y][i*F+x]=f[y][x]
    save_png_rgba(f'chatgpt_prompt_padrao_v1/frames/agumon_v5_walk_{name}_sheet.png',F*8,F,sheet)
    write_gif(f'chatgpt_prompt_padrao_v1/frames/agumon_v5_walk_{name}.gif',[[[(px if px[3] else (40,44,52,255)) for px in row] for row in nn_scale(f,F,F,5)] for f in frs],F*5,F*5,[110]*8)
print('alturas',min(heights),max(heights))
