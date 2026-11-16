import sys,os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
import walk_sn_v2 as WS
def stats(fr, g):
    out=[]
    for f in fr:
        p=f[2]
        def low(xs):
            ys=[y for y in range(60) for x in xs if p[y][x][3]]; return max(ys)
        L=low(range(0,30)); Rr=low(range(30,60))
        b=bbox(f)
        # largura dos pes nas 2 ultimas linhas por lado
        fl=[x for x in range(0,30) if p[L][x][3]]; fr_=[x for x in range(30,60) if p[Rr][x][3]]
        # maos: pixels quase brancos
        hands=[(x,y) for y in range(60) for x in range(60) if p[y][x][3] and min(p[y][x][:3])>200 and y<46 and y>30]
        hl=[q for q in hands if q[0]<30]; hr=[q for q in hands if q[0]>=30]
        c=lambda h:(round(sum(x for x,y in h)/len(h),1),round(sum(y for x,y in h)/len(h),1)) if h else None
        out.append((b[0],b[1],b[2],b[3],'pes',g-L,g-Rr,(min(fl),max(fl)),(min(fr_),max(fr_)),'maos',c(hl),c(hr)))
    return out
if __name__=="__main__":
 for d,g in (('S',49),('N',48)):
     for name,fr in (('F2b',[WS.n60(f) for f in frames(F2B,'walk',d)]),('F7',frames(F7OLD,'walk',d)),('EXP',WS.build(d))):
          print(d,name)
          for s in stats(fr,g): print('  ',s)
