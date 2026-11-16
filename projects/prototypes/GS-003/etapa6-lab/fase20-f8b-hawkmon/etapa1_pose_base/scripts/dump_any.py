from comum import *
import sys
w,h,px=load(sys.argv[1]); b=bbox(px); c=crop(px,*b)
cols={}
for r in c:
    for p in r:
        if p[3]: cols[p[:3]]=cols.get(p[:3],0)+1
L='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
m={k:L[i] for i,(k,_) in enumerate(sorted(cols.items(),key=lambda t:-t[1]))}
for k,v in m.items(): print(v,'#%02x%02x%02x'%k,cols[k])
print(b)
for r in c: print(''.join(m[p[:3]] if p[3] else '.' for p in r))
