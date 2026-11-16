from lib import *
import sys
def dump(img, x0=0,y0=0,x1=None,y1=None):
    w,h,px=img; x1=x1 or w-1; y1=y1 or h-1
    cols={}
    for y in range(y0,y1+1):
        for x in range(x0,x1+1):
            c=tuple(px[y][x])
            if c[3]: cols[c]=cols.get(c,0)+1
    order=sorted(cols,key=lambda c:-cols[c])
    chars='#ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$%&*+=<>?'
    cm={c:chars[i] if i<len(chars) else '?' for i,c in enumerate(order)}
    print('    '+''.join(str(x//10) for x in range(x0,x1+1)))
    print('    '+''.join(str(x%10) for x in range(x0,x1+1)))
    for y in range(y0,y1+1):
        print('%3d '%y+''.join(cm[tuple(px[y][x])] if px[y][x][3] else '.' for x in range(x0,x1+1)))
    for c in order: print(cm[c], hx(c), cols[c])
if __name__=='__main__':
    p=sys.argv[1]; img=load(p)
    if len(sys.argv)>2:
        ox,oy=int(sys.argv[2]),int(sys.argv[3]); img=pad(img,60,60,ox,oy)
    b=bbox(img); dump(img,b[0]-1,b[1]-1,b[2]+1,b[3]+1)
