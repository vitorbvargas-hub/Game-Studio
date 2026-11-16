"""Rotações polidas do Hawkmon (Etapa 2a): S = base v3; N e E redesenhados à mão em P1 sobre a saída crua do PixelLab; W = espelho de E.
Canvas 48x48 (mesmo da referência: S em x=13, y=5). Topete = linhas 5-12 (camada separada); corpo = linhas 13-42."""
import sys, json, hashlib, os; sys.dont_write_bytecode=True
sys.path.insert(0,'/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/etapa6-lab/fase20-f8b-hawkmon/etapa1_pose_base/scripts')
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from comum import *; from pal import *
from base import TOPETE
from base_v3 import CORPO as S_CORPO, D
# ---------- N (costas): meia grade espelhada, 22 de largura em x=13 ----------
N_MEIO = [
 '.....kkkkkk', # 13 topo arredondado
 '....kWWWWWW', # 14 nuca sem rosto
 '....kWWWWWW', # 15
 '..kkkBBBBBB', # 16 tufo lateral + faixa dando a volta
 '.kWWkBBBBBB', # 17
 '..kwkbbbbbb', # 18
 '...kkwWWWWW', # 19
 '....kwWWWWW', # 20
 '....kwWWWWW', # 21
 '....kwwWWWW', # 22
 '.....kwwWWW', # 23
 '......kuvww', # 24 sombra do pescoço
 '....kWWWWWW', # 25 gola
 '...kWWwWWwW', # 26
 '...kWkWWkWW', # 27 zigue-zague
 '..krwqqwqqw', # 28
 '..krRkrRRRR', # 29 costas
 '.kqrRkrRRRR', # 30
 '.kqrRkrRRRr', # 31
 '.kprrkqrRRr', # 32
 '.kGGGGkqrRr', # 33 3 pontas escuras da asa
 '.kGkGkGkqrq', # 34
 '.kGkgkkkkqr', # 35 cauda curta (4 px) no centro
 '.khkk.kyykq', # 36 perna 1 + ponta da cauda
 '..k...kyykk', # 37 perna 2
 '......kyok.', # 38 perna 3
 '......kyok.', # 39 perna 4
 '....kkyyok.', # 40 calcanhar
 '...kCyyoonk', # 41 só a garra de fora aparece
 '....kkkkkk.', # 42
]
# ---------- E (lado, olhando para a direita): 26 de largura em x=10 ----------
E_TOPETE = [  # inclinado 1 px para trás
 '.............kk...........', # 5
 '............kYYk..........', # 6
 '............kYYk..........', # 7
 '............kyYk..........', # 8
 '.............kRyk.........', # 9
 '.............kRRk.........', # 10
 '.............krRk.........', # 11
 '.............kqrk.........', # 12
]
E_CORPO = [
 '..........kkkkkkkkkk......', # 13 
 '.........kWWWWWWWWrrk.....', # 14 marca vermelha da testa
 '.........kwWWWWWWWWWWk....', # 15 
 '.......kkkBBBBBBBBBBBSk...', # 16 tufo para trás + faixa + fivela de perfil
 '......kWWkBBBBBBBBBBBSk...', # 17 
 '.......kwkbbbbbbbbbbbsk...', # 18 
 '........kkwWWWWWWWkkkWk...', # 19 pálpebra
 '.........kwWWWWWWWCEeYYk..', # 20 olho + bico
 '.........kwWWWWWrWEkeyYYk.', # 21 
 '.........kwWWWWWrrEeEyyYk.', # 22 traço da bochecha
 '..........kwWWWWWrWWoooyk.', # 23 
 '..........kuwwwWWWWWkkonk.', # 24 gancho do bico
 '.........kwWWWWWWWwwvkkk..', # 25 gola
 '........kWkWWWwWWWWWwWk...', # 26 
 '.......kwkqwwwwWWkWWkWWk..', # 27 zigue-zague
 '.......kkRRRRRRwwqqwqkWk..', # 28 
 '......kqkRRRRRRrkrRRRrkk..', # 29 asa (esq.) + peito
 '.....krkRRRRRRRRkrRRRRk...', # 30 
 '....krrkRrRRRRRRkrRRRRk...', # 31 
 '...kGGqkGrrRRRRkqrRRRrk...', # 32 penas escuras
 '..kGGgGkGGGrrrrkqrrRrk....', # 33 
 '..kghGGkGGGGGGkqqqqrk.....', # 34 
 '...kkkkkkGkGkkkkkkkk......', # 35 3 pontas: a de trás e as 2 que descem
 '..........kkkkyykok.......', # 36 perna de perto + perna de trás (mais escura)
 '.............kyykok.......', # 37 
 '.............kyokok.......', # 38 
 '.............kyokok.......', # 39 
 '............kyyYyok.......', # 40 pé
 '...........kCyyyyoyCk.....', # 41 garra de trás + garra da frente
 '............kkkkkkkkk.....', # 42 
]
def place(rows, x0, y0, w=48, h=48):
    c=canvas(w,h); paste(c,from_txt(rows),x0,y0); return c
def mirror(px): return [r[::-1] for r in px]
def build():
    out={}
    b22=['.'*22]; b26=['.'*26]
    Sr=TOPETE; Nc=[m+m[::-1] for m in N_MEIO]
    for r in Nc: assert len(r)==22
    for r in E_TOPETE+E_CORPO: assert len(r)==26,(len(r),r)
    out['S']=(place(Sr,13,5), place(S_CORPO,13,13))
    out['N']=(place(TOPETE,13,5), place(Nc,13,13))
    out['E']=(place(E_TOPETE,10,5), place(E_CORPO,10,13))
    out['W']=(mirror(out['E'][0]), mirror(out['E'][1]))
    return out
def comp(t,b):
    c=[list(r) for r in b]; paste(c,t,0,0); return c
if __name__=='__main__':
    R=build(); d=D+'/rotacoes_polidas/'
    def cut(p):
        w,h,px=load(p); return crop(px,*bbox(px))
    AGD=LAB+'/fase17-f7-hibrido/v2/pacote_agumon_f7v2/rotations/'
    met={}
    for k,(t,b) in R.items():
        c=comp(t,b)
        for n,p in (('topete',t),('corpo',b),('composto',c)):
            save(d+'%s_%s.png'%(k,n),p); save(d+'%s_%s_4x.png'%(k,n),scale(p,4))
        open(d+'%s_grade.txt'%k,'w').write('\n'.join(to_txt(crop(c,*bbox(c))))+'\n')
        bb=bbox(c); A=sum(1 for r in c for p in r if p[3]); cols=set(p[:3] for r in c for p in r if p[3])
        ag=cut(AGD+k+'.png'); AG=sum(1 for r in ag for p in r if p[3])
        h=len(c); w=len(c[0]); iso=0
        for y in range(h):
            for x in range(w):
                p=c[y][x]
                if p[3] and not any(0<=y+dy<h and 0<=x+dx<w and c[y+dy][x+dx]==p for dx,dy in((1,0),(-1,0),(0,1),(0,-1))): iso+=1
        met[k]=dict(bbox=bb,largura=bb[2]-bb[0]+1,altura=bb[3]-bb[1]+1,opacos=A,cores=len(cols),fora_P1=sum(1 for q in cols if q not in C2L),
            semitransparentes=sum(1 for r in c for p in r if 0<p[3]<255),isolados=iso,
            agumon_f7v2=dict(largura=len(ag[0]),altura=len(ag),opacos=AG),area_div_agumon_mesma_direcao=round(A/AG,3),area_div_agumon_S_582=round(A/582,3),
            topete_sobrepoe_corpo=sum(1 for y in range(h) for x in range(w) if t[y][x][3] and b[y][x][3]))
        print(k,met[k])
    # cru x polido: quantos pixels mudaram
    for k,n in (('S','south'),('N','north'),('E','east'),('W','west')):
        w,h,raw=load(D+'/rotacoes_cruas/'+n+'.png'); c=comp(*R[k])
        met[k]['pixels_diferentes_do_cru']=sum(1 for y in range(48) for x in range(48) if tuple(raw[y][x])!=tuple(c[y][x]) and (raw[y][x][3] or c[y][x][3]))
        rc=set(tuple(p[:3]) for r in raw for p in r if p[3]); met[k]['cru_cores']=len(rc); met[k]['cru_fora_P1']=sum(1 for q in rc if q not in C2L)
        met[k]['cru_opacos']=sum(1 for r in raw for p in r if p[3])
    json.dump(met,open(d+'metricas_rotacoes.json','w'),indent=1,ensure_ascii=False)
    for k in met: print(k,'dif cru',met[k]['pixels_diferentes_do_cru'],'cru cores',met[k]['cru_cores'],'fora',met[k]['cru_fora_P1'])
    # visão rápida
    T='/home/openclaw/projects/GameStudio/workspaces/game-art/tmp/c14e2a/'
    BG=(120,160,96,255); v=canvas(4*30+4,2*44+4,BG)
    for i,(k,n) in enumerate((('S','south'),('N','north'),('E','east'),('W','west'))):
        w,h,raw=load(D+'/rotacoes_cruas/'+n+'.png'); paste(v,crop(raw,9,4,38,44),2+i*30,2); paste(v,crop(comp(*R[k]),9,4,38,44),2+i*30,46)
    save(T+'cru_polido_x8.png',scale(v,8)); save(T+'cru_polido_x2.png',scale(v,2))
