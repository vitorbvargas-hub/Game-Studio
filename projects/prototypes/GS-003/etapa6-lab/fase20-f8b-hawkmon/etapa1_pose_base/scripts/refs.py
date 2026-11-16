from comum import *
w,h,px = load(LAB+'/fase19-f8a-hawkmon/biblioteca/oficiais/ds_dawndusk/sr40896_hawkmon.png')
bg = px[0][0]
def cut(b, pad=3):
    x0,y0,x1,y1=b
    return [[ (0,0,0,0) if px[y][x]==bg else px[y][x] for x in range(x0-pad,x1+pad+1)] for y in range(y0-pad,y1+pad+1)]
save(OUT+'/refs_enviadas/ref1_oficial_ds_dawndusk_batalha_frente.png',cut((7,7,78,80)))
save(OUT+'/refs_enviadas/ref2_oficial_ds_dawndusk_mini_frente.png',cut((100,104,121,134)))
T='/home/openclaw/projects/GameStudio/workspaces/game-art/tmp/c14/'
save(T+'mini_front_x8.png',scale([[c if c[3] else (230,230,225,255) for c in r] for r in cut((100,104,121,134))+cut((138,106,159,135))],8))
