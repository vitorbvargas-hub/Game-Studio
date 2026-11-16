"""python3 crop.py <folha.png> <saida.png> linha [escala]  -> recorta uma linha da folha do preview.py (célula 242 px)"""
import sys
sys.path.insert(0, '/home/openclaw/projects/GameStudio/workspaces/game-art/tools')
from pxpng import load_png_rgba, save_png_rgba
w, h, px = load_png_rgba(sys.argv[1]); r = int(sys.argv[3]); n = int(sys.argv[4]) if len(sys.argv) > 4 else 4
W = min(w, n * 242)
save_png_rgba(sys.argv[2], W, 242, [px[r * 242 + y][:W] for y in range(242)])
