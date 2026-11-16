"""Base S do Hawkmon v3 (ajustes gratuitos da Etapa 2a), 22x38, paleta P1. Não altera base_v2.py nem base_polida_v2/.
Mudanças sobre a v2: tufos nas laterais (linhas 11-13), cantos de cima arredondados (linha 8), pontas das asas 1 px mais curtas."""
import sys; sys.dont_write_bytecode=True
sys.path.insert(0,'/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/etapa6-lab/fase20-f8b-hawkmon/etapa1_pose_base/scripts')
from comum import *; from pal import *
from base import TOPETE
from base_v2 import CORPO as CORPO_V2
D=LAB+'/fase20-f8b-hawkmon/etapa2a_rotacoes'
MEIO = [
 '.....kkkkkk', # 8  topo arredondado (canto cortado 1 px)
 '....kWWWWrW', # 9  V vermelho (pontas)
 '....kWWWWWr', # 10 V vermelho (vértice)
 '..kkkBBBBSS', # 11 tufo lateral (contorno de cima) + faixa + fivela
 '.kWWkBBBBSb', # 12 tufo lateral apontando para fora
 '..kwkbbbbss', # 13 tufo (base)
 '...kkwkkkWW', # 14 pálpebra escura
 '....kwCEeWY', # 15 olho 3x3
 '....kwEkeyY', # 16
 '....krEeEyY', # 17 traço da bochecha
 '.....krWkoy', # 18
 '......kuWkn', # 19 queixo + ponta escura do bico (gancho)
 '....kWWWwvk', # 20 gola
 '...kWWwWWwW', # 21
 '...kWkWWkWW', # 22 zigue-zague
 '..krwppwqqW', # 23
 '..krRkrRRrr', # 24 sombra sob a gola
 '.kqrRkrRRRR', # 25
 '.kqrRkrRRRR', # 26
 '.kprrkqrRRR', # 27
 '.kGGGGkqrRR', # 28 pontas escuras da asa
 '.kGkGkGkqrr', # 29
 '.kGkgkkkkkk', # 30 3a pena termina na 29, 2a na 30
 '.khkk.kyyk.', # 31 1a pena termina aqui; perna (haste) 1 com 1 px de vão
 '..k...kyyk.', # 32 perna 2
 '......kyok.', # 33 perna 3
 '......kyok.', # 34 perna 4
 '....kyyYyok', # 35 pé
 '...kCyCycnk', # 36 garras
 '....kkkkkk.', # 37
]
CORPO=[m+m[::-1] for m in MEIO]
for i,m in enumerate(MEIO): assert len(m)==11,(i+8,m)
if __name__=='__main__':
    d=D+'/base_v3/'; blank=['.'*22]
    top=from_txt(TOPETE+blank*30); body=from_txt(blank*8+CORPO); comp=from_txt(TOPETE+CORPO)
    save(d+'base_S_topete.png',top); save(d+'base_S_corpo.png',body); save(d+'base_S_composto.png',comp)
    for n,p in (('topete',top),('corpo',body),('composto',comp)): save(d+'base_S_%s_4x.png'%n,scale(p,4))
    open(d+'grade_v3.txt','w').write('\n'.join(TOPETE+CORPO)+'\n')
    # referência para o PixelLab: 48x48, centralizada, sem reescalar (x0=13, y0=5)
    ref=canvas(48,48); paste(ref,comp,13,5); save(d+'ref_pixellab_48x48_S.png',ref)
    v2=from_txt(TOPETE+CORPO_V2)
    def cut(p):
        w,h,px=load(p); return crop(px,*bbox(px))
    ag=cut(OUT+'/refs_enviadas/ref3_estilo_agumon_f7v2_S.png')
    c00=cut(OUT+'/candidatos/cand_00.png')
    BG2=(200,204,196,255)
    c=canvas(170,70,BG2); x=4
    for s in (v2,comp,c00,ag): paste(c,s,x,66-len(s)); x+=len(s[0])+8
    c=[r[:x] for r in c]; save(d+'comparacao_v2_v3_cand00_agumon_1x.png',c); save(d+'comparacao_v2_v3_cand00_agumon_4x.png',scale(c,4))
    sw=canvas(170,70,(255,255,255,255)); x=4
    for s in (v2,comp,c00,ag):
        for yy,r in enumerate(s):
            for xx,p in enumerate(r):
                if p[3]: sw[66-len(s)+yy][x+xx]=(0,0,0,255)
        x+=len(s[0])+8
    sw=[r[:x] for r in sw]; save(d+'silhuetas_v2_v3_cand00_agumon_4x.png',scale(sw,4))
    T='/home/openclaw/projects/GameStudio/workspaces/game-art/tmp/c14e2a/'
    save(T+'comp_x6.png',scale(c,6)); save(T+'sil_x4.png',scale(sw,4)); save(T+'comp_x1.png',c)
    AG=sum(1 for r in ag for p in r if p[3]); A=sum(1 for r in comp for p in r if p[3])
    cols=set(p[:3] for r in comp for p in r if p[3])
    print('area',A,'agumon',AG,round(A/AG,3),'cores',len(cols),'nao usadas',sorted(set(C2L.values())-set(C2L[k] for k in cols)))
    bb=bbox(comp); print('bbox',bb, 'larg',bb[2]-bb[0]+1,'alt',bb[3]-bb[1]+1)
