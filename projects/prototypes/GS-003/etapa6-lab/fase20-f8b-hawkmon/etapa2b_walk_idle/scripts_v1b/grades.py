"""grades.py <anim> <dir> [y0 y1]: quadros como grade de letras lado a lado (coordenadas da grade da rotação)."""
import sys; sys.dont_write_bytecode=True
from hawk_anim import *
a,d=sys.argv[1],sys.argv[2]; y0=int(sys.argv[3]) if len(sys.argv)>3 else 26; y1=int(sys.argv[4]) if len(sys.argv)>4 else 37
fs={'walk':{'S':walk_S,'N':walk_N,'E':walk_E},'idle':{'S':idle_S,'N':idle_N,'E':idle_E}}[a][d]()
x0=-2 if d!='E' else -4; x1=21 if d!='E' else 25
for y in range(y0,y1+1):
    print('%2d '%y+' '.join(''.join(t.p.get((x,y),c.p.get((x,y),'.')) for x in range(x0,x1+1)) for c,t in fs))
