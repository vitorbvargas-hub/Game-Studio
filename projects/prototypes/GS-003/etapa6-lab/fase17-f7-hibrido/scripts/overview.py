from lib import *
import sys
for name,pack in (('F2b',F2B),('C10',C10),('F6',F6)):
    for anim in ('walk','attack'):
        for d in 'SEN':
            fr=frames(pack,anim,d)
            save(O+'/tmp/ov_%s_%s_%s.png'%(name,anim,d),sheet(fr,4,cols=len(fr)))
    rots=[load(pack+'/rotations/%s.png'%d) for d in 'SNEW']
    save(O+'/tmp/ov_%s_rot.png'%name,sheet(rots,6))
for n,p in (('f4_idle',F4+'/idle'),('f4_feliz',F4+'/feliz'),('f4_ataque',F4+'/ataque'),('c10_ataqueA',C10H+'/ataque_A_saida_q8'),('f3_idleE',F3+'/anim_idle_E'),('f3_idleS',F3+'/anim_idle_S'),('f3_felizS',F3+'/anim_feliz_S')):
    fr=frames(p,''); save(O+'/tmp/ov_%s.png'%n,sheet(fr,4))
