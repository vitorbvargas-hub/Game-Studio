from comum import *
BG=(200,204,196,255)
cs=[load(OUT+'/candidatos/cand_%02d.png'%i)[2] for i in range(16)]
sh=canvas(64*4,64*4,BG)
for i,c in enumerate(cs): paste(sh,c,(i%4)*64,(i//4)*64)
save(OUT+'/candidatos/folha_candidatos_1x.png',sh)
save(OUT+'/candidatos/folha_candidatos_4x.png',scale(sh,4))
T='/home/openclaw/projects/GameStudio/workspaces/game-art/tmp/c14/'
for r in range(2):
    s=canvas(64*4,64*2,BG)
    for i in range(8): paste(s,cs[r*8+i],(i%4)*64,(i//4)*64)
    save(T+'cand_%d.png'%r,scale(s,6))
for i,c in enumerate(cs):
    b=bbox(c); cols=set(p[:3] for r in c for p in r if p[3]==255); semi=sum(1 for r in c for p in r if 0<p[3]<255)
    print(i,b,'w',b[2]-b[0]+1,'h',b[3]-b[1]+1,'cores',len(cols),'semi',semi)
