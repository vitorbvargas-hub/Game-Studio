from lib import *
def S(name, fr, sc=5, cols=5): save(O+'/tmp/'+name+'.png', sheet(fr,sc,cols=cols))
for name,pack in (('F2b',F2B),('F6',F6)):
    for d in 'SEN':
        S('o2_%s_walk_%s'%(name,d), frames(pack,'walk',d), 5, 4)
        S('o2_%s_attack_%s'%(name,d), frames(pack,'attack',d), 4, 5)
S('o2_c10_walkE', frames(C10,'walk','E'),5,4)
for n,p in (('f4_idle',F4+'/idle'),('f4_feliz',F4+'/feliz'),('f4_ataque',F4+'/ataque'),('c10_ataqueA',C10H+'/ataque_A_saida_q8'),('f3_idleE',F3+'/anim_idle_E'),('f3_idleS',F3+'/anim_idle_S'),('f3_felizS',F3+'/anim_feliz_S'),('f3_v3feliz',F3+'/ref_v3_custom_feliz_1x'),('f3_preparo',F3+'/anim_preparo_S')):
    fr=frames(p,''); S('o2_'+n, fr, 4, 5); print(n, len(fr), [(f[0],f[1]) for f in fr][:1], [bbox(f) for f in fr][:3])
for name,pack in (('F2b',F2B),('C10',C10),('F6',F6)):
    for a in ('walk','attack'):
        for d in 'SNEW':
            fr=frames(pack,a,d); print(name,a,d,len(fr),fr[0][0],fr[0][1],[bbox(f) for f in fr][:2])
    for d in 'SNEW':
        r=load(pack+'/rotations/%s.png'%d); print(name,'rot',d,r[0],r[1],bbox(r))
