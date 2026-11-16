# extrai imagem pixel-exata do overlay #__ov (escala S, canto sup-esq) de um screenshot
import sys;sys.path.insert(0,'/home/openclaw/projects/GameStudio/workspaces/game-art/tools')
from pxpng import load_png_rgba, save_png_rgba
src,W,H,S,out=sys.argv[1],int(sys.argv[2]),int(sys.argv[3]),int(sys.argv[4]),sys.argv[5]
w,h,p=load_png_rgba(src)
img=[[p[y*S+S//2][x*S+S//2] for x in range(W)] for y in range(H)]
bad=sum(1 for y in range(H) for x in range(W) if any(p[y*S+dy][x*S+dx]!=img[y][x] for dy in (0,S-1) for dx in (0,S-1)))
save_png_rgba(out,W,H,img); print('ok',W,H,'blocos nao uniformes:',bad)
