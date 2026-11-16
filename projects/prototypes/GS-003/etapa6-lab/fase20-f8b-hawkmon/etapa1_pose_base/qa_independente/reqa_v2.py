# Re-QA v2: isolados por cor, area, cabeca, vao perna/asa. Uso: python3 -I reqa_v2.py <png_v1> <png_v2>
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from medir import load_png, hexc, bbox
def iso(px):
    h=len(px); w=len(px[0]); d={}
    for y in range(h):
        for x in range(w):
            c=px[y][x]
            if c[3]!=255: continue
            if not any(0<=y+dy<h and 0<=x+dx<w and px[y+dy][x+dx]==c for dx,dy in((1,0),(-1,0),(0,1),(0,-1))):
                d[hexc(c)]=d.get(hexc(c),0)+1
    return d
for p in sys.argv[1:]:
    w,h,px=load_png(p); bb=bbox(px)
    area=sum(1 for r in px for c in r if c[3])
    d=iso(px); print(p.split('/')[-2], 'area',area,'area/582',round(area/582,3),'iso',sum(d.values()))
    print('  iso por cor', dict(sorted(d.items(),key=lambda k:-k[1])))
    # transparencia por linha 28-37 entre col 0 e 10 (lado esquerdo)
    for y in range(28,38):
        print('  linha',y,''.join('#' if px[y][x][3] else '.' for x in range(w)))
