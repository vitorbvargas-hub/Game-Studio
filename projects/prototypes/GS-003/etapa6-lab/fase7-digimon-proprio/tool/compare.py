import sys; sys.path.insert(0,'/home/openclaw/projects/GameStudio/workspaces/game-art/tools')
from pxpng import load_png_rgba, save_png_rgba, nn_scale, bbox_opaque, draw_text
S=5
items=[("DS (oficial)",'fase1-pixellab/referencias/agumon_ds_south.png'),
       ("ChatGPT (A)",'metodo-a-v2/game-ready/digimon/agumon/agumon_retrato_A.png'),
       ("PixelLab v2 (reprovado)",'fase1-pixellab/v2/agumon_v2_extracted/Idle/rotations/south.png'),
       ("game-studio (codigo)",'fase7-digimon-proprio/out/agumon_idle_sheet.png')]
imgs=[]
for name,p in items:
    w,h,px=load_png_rgba(p)
    if 'sheet' in p:  # 1o quadro
        fw=40; px=[r[:fw] for r in px]; w=fw
    bb=bbox_opaque(px,w,h)
    imgs.append((name,w,h,px,bb))
cell=60*S; Hh=60*S+30
canvas=[[(40,44,52,255)]*(cell*len(imgs)) for _ in range(Hh)]
for i,(name,w,h,px,bb) in enumerate(imgs):
    sc=nn_scale(px,w,h,S)
    ox=i*cell+(cell-w*S)//2; oy=30+(60*S-h*S)
    for y in range(h*S):
        for x in range(w*S):
            if sc[y][x][3] and 0<=oy+y<Hh: canvas[oy+y][ox+x]=sc[y][x]
    try: draw_text(canvas,cell*len(imgs),Hh,i*cell+6,6,f"{name} {bb}",scale=2)
    except Exception as e: print('txt',e)
    print(name,w,h,'bbox',bb)
save_png_rgba('fase7-digimon-proprio/out/comparacao_agumon_4_metodos.png',cell*len(imgs),Hh,canvas)
