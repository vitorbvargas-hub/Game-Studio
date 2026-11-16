import sys; sys.path.insert(0,'.')
from rig import C, save, blob
import agumon_s as S
W,H=S.W,S.H
def legE(x,lift=0,back=False):
    l=C(W,H); y0=31-lift
    blob(l,x+3,y0+4,3.2,4.5,dark='d' if back else 'D'); blob(l,x+4,y0+8.5,4.5,2)
    l.outline()
    for dx in (3,5,7): l.put(x+dx,y0+10,'w')
    return l
def east(bob=0,fl=0,bl=0,arm=0,tail=0,mouth='closed'):
    f=C(W,H)
    t=C(W,H); blob(t,9,32+tail,5.5,3.2); t.outline(); f.paste(t,0,bob)
    f.paste(legE(13,bl,True),0,0)
    tor=C(W,H); blob(tor,19,27.5,6.5,6); tor.outline(); f.paste(tor,0,bob)
    f.paste(legE(19,fl),0,0)
    a=C(W,H); blob(a,25,25-arm,2.2,3.5); blob(a,27,28-arm,2.5,1.8); a.outline()
    for dx in (27,29): a.put(dx,30-arm,'w')
    f.paste(a,0,bob)
    h=C(W,H); blob(h,19,12,8,7.5,hi='L'); blob(h,27,16,7.5,4.6); h.outline()
    h.grid(20,7,["..ooo.",".owGGo","ogGkko","ogGkko",".oggo.","..oo.."])
    h.put(32,13,'d')
    if mouth=='open':
        h.grid(23,18,["oooooooooooo","wmmmmmmmrrmw",".oooooooooo."])
    else:
        h.grid(23,19,["ooooooooooo."]); h.put(33,19,'w')
    f.paste(h,0,bob)
    return f
def north(bob=0,ll=0,rl=0,la=0,ra=0,tdx=0):
    f=C(W,H)
    f.paste(S.leg(13,ll),0,0); f.paste(S.leg(20,rl),0,0)
    tor=C(W,H); blob(tor,20,28,6.8,5.8); tor.outline(); f.paste(tor,0,bob)
    f.paste(S.arm('L',la),0,bob); f.paste(S.arm('R',ra),0,bob)
    h=C(W,H); blob(h,20,12.5,10.5,8.5,hi='L'); blob(h,20,18,10,4); h.outline(); f.paste(h,0,bob)
    t=C(W,H); blob(t,20+tdx,36,4,3.5); t.outline(); f.paste(t,0,bob)
    return f
if __name__=='__main__':
    OUT='../out/'
    save([east(fl=3,bl=0,arm=1),east(bob=1),east(fl=0,bl=3,arm=-1),east(bob=1)],OUT+'agumon_walk_e',[150]*4)
    save([north(ll=3,ra=1),north(bob=1,tdx=1),north(rl=3,la=1),north(bob=1,tdx=-1)],OUT+'agumon_walk_n',[150]*4)
    # oeste = espelho do leste (grátis)
    import importlib
    W_=[east(fl=3,bl=0,arm=1).flipped(),east(bob=1).flipped(),east(fl=0,bl=3,arm=-1).flipped(),east(bob=1).flipped()]
    save(W_,OUT+'agumon_walk_w',[150]*4)
    # ataque de perfil (bola de fogo indo para a direita)
    from anims import fireball, sparks
    def fx(cx,r):
        return lambda f: fireball(f,cx,16,r)
    fr=[east(mouth='closed',bob=1),east(mouth='open'),east(mouth='open')]
    fireball(fr[1],36,17,2.5); fireball(fr[2],38,16,3.5)
    save(fr+[east(mouth='closed')],OUT+'agumon_ataque_e',[160,100,120,200])
    save([east()],OUT+'agumon_rot_e',[500]); save([north()],OUT+'agumon_rot_n',[500])
