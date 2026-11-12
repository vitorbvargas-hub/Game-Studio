# Layout v15b (coordenador): árvores densas sobrepostas, corredores, mato de batalha. Determinístico.
import json, math, random, sys
W,H=48,36
WATER_ROWS={6:(27,32),7:(21,32),8:(19,32),9:(18,32),10:(18,29),11:(22,28),12:(22,28),13:(21,26),14:(21,24),15:(21,25),
16:(23,27),17:(24,27),18:(23,27),19:(22,26),20:(22,25),21:(22,26),22:(24,28),23:(25,28),24:(24,28),25:(24,27),26:(24,26)}
def water(c,r): 
    if r in WATER_ROWS: a,b=WATER_ROWS[r]; return a<=c<=b
    return False
ZONES=[(20,27,29,35),(7,10,17,20),(35,12,46,23),(38,3,46,11),(3,25,7,30),(6,3,11,7)]
LANES=[[(24,35),(24,28),(21,25),(20,20),(21,17),(23,17)],[(27,17),(31,17),(37,16),(41,14),(42,10),(43,7)],
[(20,17),(16,15),(13,15)],[(21,29),(14,28),(8,28)],[(10,11),(9,7)],[(13,20),(19,22)]]
def segd(px,py,a,b):
    ax,ay=a;bx,by=b;dx,dy=bx-ax,by-ay;L=dx*dx+dy*dy or 1
    t=max(0,min(1,((px-ax)*dx+(py-ay)*dy)/L));return math.hypot(px-ax-t*dx,py-ay-t*dy)
def lane_d(c,r): return min(segd(c,r,l[i],l[i+1]) for l in LANES for i in range(len(l)-1))
def is_open(c,r):
    if any(x0<=c<=x1 and y0<=r<=y1 for x0,y0,x1,y1 in ZONES): return True
    return lane_d(c,r)<=1.6
PATCH=[(21,31,2.5,2,'batalha'),(28,30,2,2,'batalha'),(10,17,3,2,'batalha'),(14,11.5,2.5,1.5,'batalha'),(40,21,3,1.5,'batalha'),
(40,6,2,2,'batalha'),(19,22,1.5,2,'batalha'),(33,19,2,1,'batalha'),(5,27,2.5,2,'surpresa'),(8,5,2.5,1.5,'surpresa')]
random.seed(15)
TREES=[('8842a0c7-6c9e-4973-a8e0-1cd58e262103',.40),('c94af4b6-8a81-4a60-bb6c-784c83462afc',.30),('0bc74835-37cc-4177-8810-5e15c0c6cf67',.20),('74fa811e-929e-4298-b528-b57503194fb4',.10)]
def pick():
    x=random.random();s=0
    for i,p in TREES:
        s+=p
        if x<=s: return i
    return TREES[0][0]
pl=[]
row=0
for fy in range(40,H*32+40,34):
    off=26 if row%2 else 0; row+=1
    for fx in range(8+off,W*32+40,52):
        x=fx+random.randint(-6,6); y=fy+random.randint(-4,4)
        c,r=x//32,(y-4)//32
        if c<0 or c>=W: continue
        r=min(max(r,0),H-1)
        if is_open(c,r): continue
        if any(water(cc,rr) for cc in (c-1,c,c+1) for rr in (r-2,r-1,r,r+1)): continue
        pl.append({"object_id":pick(),"world_x":x,"world_y":min(y,H*32+30)})
tufts=[];zones=[]
TUFT='86f14694-c863-4ded-91cf-e96ced0064f9'
for cx,cy,rx,ry,kind in PATCH:
    cells=0
    for r in range(int(cy-ry)-1,int(cy+ry)+2):
        for c in range(int(cx-rx)-1,int(cx+rx)+2):
            n=((c-cx)/rx)**2+((r-cy)/ry)**2
            if n>1+random.uniform(-.25,.25): continue
            if water(c,r) or lane_d(c,r)<=0.9: continue
            cells+=1
            for ox,oy in ((16,24),):
                tufts.append({"object_id":TUFT,"world_x":c*32+ox+random.randint(-2,2),"world_y":r*32+oy+random.randint(-2,2)})
    zones.append({"tipo":kind,"centro":[cx,cy],"celulas":cells})
FLOWER='716a5c1d-8166-4f80-b089-31ab76e69305'
fl=[]
for c,r in [(11,13),(16,18),(37,14),(44,16),(25,34),(9,26),(42,4),(33,16),(18,19)]:
    if lane_d(c,r)>0.9 and not water(c,r): fl.append({"object_id":FLOWER,"world_x":c*32+16,"world_y":r*32+24})
allp=pl+tufts+fl
allp.sort(key=lambda p:p["world_y"])
pass
json.dump({"placements":allp,"zones":zones,"counts":{"trees":len(pl),"tufts":len(tufts),"flowers":len(fl)}},open(sys.argv[1],'w'),separators=(',',':'))
print(len(pl),len(tufts),len(fl),zones)
