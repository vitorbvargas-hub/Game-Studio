import sys; sys.path.insert(0,'.')
from rig import C, save, blob
W,H=40,44
EYES={
 'open':  ["..ooo.","oowGGo","ogGkko","ogGkko","owggGo",".oooo."],
 'happy': ["......","..oo..",".o..o.","o....o","......","......"],
 'sad':   ["......","oo....",".ooooo","ogGkko","oggGGo",".oooo."],
 'angry': ["oo....",".oooo.","..oGko","ogGkko","oggGGo",".oooo."],
 'closed':["......","......","......","oooooo","......","......"],
 'hurt':  ["......","o....o",".o..o.","..oo..",".o..o.","......"],
}
MOUTH={
 'smile':[("ooooooooooooo",13,20),("w...........w",13,21)],
 'grin': [("ooooooooooooo",13,19),("wwmmmmmmmmmww",13,20),(".ommrrrrrmmo.",13,21),("..ooooooooo..",13,22)],
 'roar': [("ooooooooooooo",13,18),("wwmmmmmmmmmww",13,19),("ommmrrrrrmmmo",13,20),("omrrrrrrrrrmo",13,21),("wwmmmmmmmmmww",13,22),(".ooooooooooo.",13,23)],
 'sad':  [("....ooooo....",13,21),("..oo.....oo..",13,22)],
 'flat': [("..ooooooooo..",13,20)],
 'ouch': [("...ooooooo...",13,19),("..owmmmmmwo..",13,20),("...ooooooo...",13,21)],
}
def head(mouth='smile', eyes='open'):
    h=C(W,H)
    blob(h,20,12,10.5,8,hi='L')         # crânio
    blob(h,20,18,11.2,5.2)                    # focinho/mandíbula
    h.outline()
    E=EYES[eyes]; h.grid(11,8,E); h.grid(23,8,[r[::-1] for r in E])
    h.put(18,16,'d'); h.put(21,16,'d')
    for row,x,y in MOUTH[mouth]: h.grid(x,y,[row])
    return h
def torso():
    t=C(W,H); blob(t,20,28,6.8,5.8); t.outline(); return t
def leg(x, lift=0, fwd=0):
    l=C(W,H); y0=31-lift+fwd
    blob(l,x+3.5,y0+4,3.5,4.5); blob(l,x+3.5,y0+8.5,4.2,2.2)
    l.outline()
    for dx in (0,3,6): l.put(x+dx, y0+10, 'w')
    return l
def arm(side, raise_=0, fwd=0):
    a=C(W,H)
    if side=='L': x=7
    else: x=29
    blob(a,x+2,25-raise_+fwd,2.2,4.2); blob(a,x+2,29.5-raise_+fwd,2.6,2)
    a.outline()
    for dx in (0,2,4): a.put(x+dx, 31-raise_+fwd, 'w')
    return a
def tail(dy=0,dx=0):
    t=C(W,H); blob(t,31+dx,36+dy,3.2,2.6); t.outline(); return t
def frame(bob=0, mouth='smile', eyes='open', ll=0, rl=0, la=0, ra=0, tdy=0, tdx=0, hdy=0, fx=None, under=None):
    f=C(W,H)
    if under: under(f)
    parts=[(tail(tdy,tdx),bob),(leg(13,ll),0),(leg(20,rl),0),(torso(),bob),(arm('L',la),bob),(arm('R',ra),bob),(head(mouth,eyes),bob+hdy)]
    for part,dy in parts: f.paste(part,0,dy)
    if fx: fx(f)
    return f
if __name__=='__main__':
    save([frame()], 'out_test', [500])
