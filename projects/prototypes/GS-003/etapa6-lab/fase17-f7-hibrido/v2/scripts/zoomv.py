from lib import *
def crop(img,x0,y0,x1,y1):
    w,h,px=img; return (x1-x0+1,y1-y0+1,[r[x0:x1+1] for r in px[y0:y1+1]])
def z(name, fr, box=(14,7,45,51), sc=7, cols=4):
    save(O+'/tmp/z_'+name+'.png', sheet([crop(f,*box) for f in fr], sc, cols=cols))
