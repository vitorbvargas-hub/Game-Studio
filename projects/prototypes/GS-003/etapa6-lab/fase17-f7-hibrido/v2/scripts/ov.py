import sys,os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
def n60(f):
    if f[0]==48: return pad(f,60,60,6,5)
    if f[0]==56: return pad(f,60,60,2,2)
    return f
for d in 'SN':
    a=[n60(f) for f in frames(F2B,'walk',d)]; b=frames(F7OLD,'walk',d)
    print(d,[ (f[0],f[1]) for f in frames(F2B,'walk',d)][:1],[bbox(f) for f in a],[bbox(f) for f in b][:2])
    save(O+'/tmp/ov_walk_%s_F2b.png'%d, sheet(a,6,cols=4)); save(O+'/tmp/ov_walk_%s_F7.png'%d, sheet(b,6,cols=4))
