from lib import *
import sys
def crop(img,x0,y0,x1,y1):
    w,h,px=img; return (x1-x0+1,y1-y0+1,[r[x0:x1+1] for r in px[y0:y1+1]])
if __name__=='__main__':
    d=sys.argv[1]; out=sys.argv[2]; x0,y0,x1,y1=map(int,sys.argv[3:7]); sc=int(sys.argv[7]); cols=int(sys.argv[8])
    idx=[int(a) for a in sys.argv[9:]] 
    fr=frames(d,'')
    if idx: fr=[fr[i] for i in idx]
    save(O+'/tmp/'+out+'.png', sheet([crop(f,x0,y0,x1,y1) for f in fr], sc, cols=cols))
