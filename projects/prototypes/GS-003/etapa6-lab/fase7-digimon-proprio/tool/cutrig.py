"""Mock: desenho do ChatGPT (Método A, já reduzido a 1:1) recortado em partes e animado pelo rig local.
Nada é gerado por IA; nada é enviado a serviço externo (D12)."""
import sys; sys.path.insert(0,'/home/openclaw/projects/GameStudio/workspaces/game-art/tools')
from pxpng import load_png_rgba, save_png_rgba, nn_scale
from gifenc import write_gif
import os
OUT='../out/mock_chatgpt/'; os.makedirs(OUT,exist_ok=True)
FIRE=[(255,110,0,255),(255,210,60,255),(255,248,200,255)]
def load(p): w,h,px=load_png_rgba(p); return w,h,px
def cut(w,h,px,regions):
    """regions: list of (name,(x0,y0,x1,y1)); pixel vai para a 1a região que o contém; resto = 'body'"""
    parts={n:{} for n,_ in regions}; parts['body']={}
    for y in range(h):
        for x in range(w):
            c=px[y][x]
            if c[3]<128: continue
            for n,(x0,y0,x1,y1) in regions:
                if x0<=x<=x1 and y0<=y<=y1: parts[n][(x,y)]=c; break
            else: parts['body'][(x,y)]=c
    return parts
def compose(parts, W, H, off, moves, order, fx=None, flash=False, flip=False, srcw=None):
    cv=[[(0,0,0,0)]*W for _ in range(H)]
    for n in order:
        dx,dy=moves.get(n,(0,0))
        for (x,y),c in parts[n].items():
            X=x+off[0]+dx; Y=y+off[1]+dy
            if 0<=X<W and 0<=Y<H:
                if flash and c[0]+c[1]+c[2]>150: c=(255,255,255,255)
                cv[Y][X]=c
    if fx: fx(cv)
    if flip: cv=[r[::-1] for r in cv]
    return cv
def ball(cv,cx,cy,r):
    for y in range(len(cv)):
        for x in range(len(cv[0])):
            d=((x-cx)**2+(y-cy)**2)**.5
            if d<=r: cv[y][x]=FIRE[2] if d<r*0.4 else FIRE[1] if d<r*0.75 else FIRE[0]
def save(frames,name,delays,S=6):
    W=len(frames[0][0]); H=len(frames[0])
    big=[[[(p if p[3] else (40,44,52,255)) for p in r] for r in nn_scale(f,W,H,S)] for f in frames]
    write_gif(OUT+name+'.gif',big,W*S,H*S,delays)
    sheet=[[(0,0,0,0)]*(W*len(frames)) for _ in range(H)]
    for i,f in enumerate(frames):
        for y in range(H):
            for x in range(W): sheet[y][i*W+x]=f[y][x]
    save_png_rgba(OUT+name+'_sheet.png',W*len(frames),H,sheet)
    return sheet
