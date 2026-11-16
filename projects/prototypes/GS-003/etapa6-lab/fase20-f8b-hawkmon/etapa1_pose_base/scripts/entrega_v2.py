"""Comparações e métricas da base v2 (E1b). Mesmas definições do QA independente (medir.py)."""
from comum import *; from pal import *
import json
from base import TOPETE, CORPO as C1
from base_v2 import CORPO as C2
BG=(120,160,96,255); BG2=(200,204,196,255)
v1=from_txt(TOPETE+C1); v2=from_txt(TOPETE+C2)
def cut(p):
    w,h,px=load(p); return crop(px,*bbox(px))
c00=load(OUT+'/candidatos/cand_00.png')[2]; c00c=crop(c00,*bbox(c00))
ag=cut(OUT+'/refs_enviadas/ref3_estilo_agumon_f7v2_S.png')
tm=cut(LAB+'/lab-assets/a-f7v2/tamer/tamer_a_cabelo_preto/rotations/south.png')
d=OUT+'/base_polida_v2/'
# v1 x v2 x cand_00 x Agumon, pés na mesma linha
W,H,G=150,70,66
c=canvas(W,H,BG2); x=4
for s in (v1,v2,c00c,ag):
    paste(c,s,x,G-len(s)); x+=len(s[0])+8
c=[r[:x] for r in c]
save(d+'comparacao_v1_v2_cand00_agumon_1x.png',c); save(d+'comparacao_v1_v2_cand00_agumon_4x.png',scale(c,4))
# escala sobre tile 32
W,H,G=128,56,50
e=canvas(W,H,BG)
for xx in range(W):
    for y in range(G,H): e[y][xx]=(96,136,80,255) if (xx//32)%2==0 else (104,144,86,255)
x=6
for s in (tm,ag,v2,v1):
    paste(e,s,x,G-len(s)); x+=len(s[0])+8
save(d+'escala_tamer_agumon_v2_v1_1x.png',e); save(d+'escala_tamer_agumon_v2_v1_4x.png',scale(e,4))
# silhuetas
def sil(px): return [[(0,0,0,255) if p[3] else (255,255,255,255) for p in r] for r in px]
sw=canvas(150,70,(255,255,255,255)); x=4
for s in (v1,v2,c00c,ag):
    q=sil(s)
    for yy,r in enumerate(q):
        for xx,p in enumerate(r): sw[66-len(s)+yy][x+xx]=p
    x+=len(s[0])+8
sw=[r[:x] for r in sw]; save(d+'silhuetas_v1_v2_cand00_agumon_4x.png',scale(sw,4))
def met(px,rows=None):
    bb=bbox(px); cols={}
    for r in px:
        for p in r:
            if p[3]: cols[p[:3]]=cols.get(p[:3],0)+1
    h=len(px); w=len(px[0]); iso=0
    for y in range(h):
        for x in range(w):
            p=px[y][x]
            if p[3] and not any(0<=y+dy<h and 0<=x+dx<w and px[y+dy][x+dx]==p for dx,dy in((1,0),(-1,0),(0,1),(0,-1))): iso+=1
    perfil=[sum(1 for p in r if p[3]) for r in px[bb[1]:bb[3]+1]]
    ext=[(max(x for x,p in enumerate(r) if p[3])-min(x for x,p in enumerate(r) if p[3])+1) for r in px[bb[1]:bb[3]+1]]
    return dict(largura=bb[2]-bb[0]+1,altura=bb[3]-bb[1]+1,opacos=sum(cols.values()),cores=len(cols),
        fora_P1=[k for k in cols if k not in C2L], usadas=''.join(sorted(C2L.get(k,'?') for k in cols)),
        nao_usadas=''.join(sorted(set(C2L.values())-set(C2L.get(k,'?') for k in cols))),isolados=iso,perfil_opacos=perfil,extensao_por_linha=ext)
AG=sum(1 for r in ag for p in r if p[3])
E32=set(rgb(h) for h in '#be4a2f #d77643 #ead4aa #e4a672 #b86f50 #733e39 #3e2731 #a22633 #e43b44 #f77622 #feae34 #fee761 #63c74d #3e8948 #265c42 #193c3e #124e89 #0099db #2ce8f5 #ffffff #c0cbdc #8b9bb4 #5a6988 #3a4466 #262b44 #181425 #ff0044 #68386c #b55088 #f6757a #e8b796 #c28569'.split())
out={}
for n,px,rows in (('v1',v1,TOPETE+C1),('v2',v2,TOPETE+C2)):
    m=met(px); m['area_div_agumon']=round(m['opacos']/AG,3)
    m['simetria_pares_diferentes']=sum(1 for r in rows for x in range(11) if r[x]!=r[21-x])
    m['cores_exatas_endesga32']=sum(1 for r in [0] for k in set(p[:3] for rr in px for p in rr if p[3]) if k in E32)
    out[n]=m
out['agumon_f7v2_S']=dict(largura=len(ag[0]),altura=len(ag),opacos=AG)
out['tamer_A']=dict(largura=len(tm[0]),altura=len(tm),opacos=sum(1 for r in tm for p in r if p[3]))
# v2: medidas de estrutura
cab=[r for r in C2[0:12]]
out['v2']['cabeca_largura_max']=max(len(r.strip('.')) for r in cab); out['v2']['cabeca_altura']=12
out['v2']['cabeca_div_largura_max']=round(out['v2']['cabeca_largura_max']/out['v2']['largura'],2)
out['v2']['linhas_haste_perna']=[i+8 for i,r in enumerate(C2) if 'kyyk..kyyk' in r or 'kyok..koyk' in r]
out['v2']['linhas_haste_perna_sem_asa_ao_lado']=[i+8 for i,r in enumerate(C2) if r.strip('.') in ('kyyk..kyyk','kyok..koyk')]
out['v2']['topete_px']=8; out['v2']['corpo_px']=30
json.dump(out,open(d+'metricas_v2.json','w'),indent=1,ensure_ascii=False)
for k,v in out.items(): print(k,{a:b for a,b in v.items()})
T='/home/openclaw/projects/GameStudio/workspaces/game-art/tmp/c14b/'
save(T+'comp_x4.png',scale(c,4)); save(T+'escala_x3.png',scale(e,3)); save(T+'sil.png',scale(sw,4)); save(T+'comp_x1.png',scale(c,2))
