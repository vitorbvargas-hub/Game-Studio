"""Correções E2a-b (QA independente, 0 gerações): E/W com asa recolhida + cauda vermelha curta + pé de trás + bico 1 px à frente;
N com leque de cauda de 3 pontas + nuca sombreada + marcas de penas nas costas. S e topete inalterados. W = espelho de E.
Saída: rotacoes_polidas_v2/ e prancha_v2/. Não sobrescreve a v1."""
import sys, os, json; sys.dont_write_bytecode=True
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from polir import *
import polir as V1
N2=list(N_MEIO); E2=list(E_CORPO)
def setrows(L,first,rows,w):
    for i,r in enumerate(rows):
        assert len(r)==w,(first+i,len(r),r); L[first+i-13]=r
# ---------- N ----------
setrows(N2,22,[
 '....kwwWwWW', # 22 marcas de penas da nuca
 '.....kwwvww', # 23 nuca sombreada
 '......kuvvw', # 24 sombra do pescoço
],11)
setrows(N2,32,[
 '.kprrkqrqrq', # 32 costas escurecem para a barra
 '.kGGGGkqkqk', # 33 barra das costas em pontas (penas sobrepostas); o leque sai por baixo
 '.kGkGkkRqRR', # 34 leque: pena lateral | pena central larga
 '.kGkgkRRqRR', # 35
 '.khkkkRrkRR', # 36
 '..k..krqkrR', # 37 ponta lateral, aberta para fora, por cima do alto da perna
 '......kkokr', # 38 perna aparece sob o leque
 '......kyokq', # 39 ponta central (a mais longa)
 '....kkyyokk', # 40
 '...kCyyonk.', # 41 pés 1 px mais curtos por dentro: a ponta central fica livre
 '....kkkkk..', # 42
],11)
# ---------- E ----------
setrows(E2,20,[
 '.........kwWWWWWWWCEeYYkk.', # 20 olho + bico
 '.........kwWWWWWrWEkeyYYYk', # 21 bico 1 px mais à frente
 '.........kwWWWWWrrEeEyyYYk', # 22
 '..........kwWWWWWrWWoooyYk', # 23
 '..........kuwwwWWWWWkkkonk', # 24 gancho: a ponta desce
 '.........kwWWWWWWWwwvkkkk.', # 25 gola
],26)
setrows(E2,29,[
 '.......krRRRRRRrkrRRRrkk..', # 29 asa recolhida sobre o flanco
 '.....kkkrRRRRRRRkrRRRRk...', # 30 cauda curta sai atrás
 '...kkRRkrRRRRRRRkrRRRRk...', # 31
 '..kRRrrkGrRRRRRkqrRRRrk...', # 32
 '..kqkrqkGGGrrrrkqrrRrk....', # 33 pontas da cauda
 '...k.kkkGgGGGGkqqqqrk.....', # 34 penas escuras da asa
 '......kGkGkGGkkkkkkk......', # 35 3 pontas descendo para baixo e para trás
 '......khkkkkkkyykok.......', # 36
 '.......k.....kyykok.......', # 37
 '.............kyokok.......', # 38
 '.............kyokokkk.....', # 39 pé de trás (mais escuro), 1 px acima e à frente
 '............kyyYyoonck....', # 40
 '...........kCyyyyoyCk.....', # 41
 '............kkkkkkkkk.....', # 42
],26)
def build2():
    Nc=[m+m[::-1] for m in N2]
    for r in E_TOPETE+E2: assert len(r)==26,(len(r),r)
    out={'S':(place(TOPETE,13,5),place(S_CORPO,13,13)),'N':(place(TOPETE,13,5),place(Nc,13,13)),'E':(place(E_TOPETE,10,5),place(E2,10,13))}
    out['W']=(mirror(out['E'][0]),mirror(out['E'][1])); return out
def cut(p):
    w,h,px=load(p); return crop(px,*bbox(px))
AGD=LAB+'/fase17-f7-hibrido/v2/pacote_agumon_f7v2/rotations/'
if __name__=='__main__':
    R=build2(); R1=V1.build(); d=D+'/rotacoes_polidas_v2/'; P=D+'/prancha_v2/'
    os.makedirs(d,exist_ok=True); os.makedirs(P,exist_ok=True); met={}
    AS=sum(1 for r in comp(*R['S']) for p in r if p[3])
    for k,(t,b) in R.items():
        c=comp(t,b)
        for n,p in (('topete',t),('corpo',b),('composto',c)):
            save(d+'%s_%s.png'%(k,n),p); save(d+'%s_%s_4x.png'%(k,n),scale(p,4))
        open(d+'%s_grade.txt'%k,'w').write('\n'.join(to_txt(crop(c,*bbox(c))))+'\n')
        bb=bbox(c); A=sum(1 for r in c for p in r if p[3]); cols=set(p[:3] for r in c for p in r if p[3])
        ag=cut(AGD+k+'.png'); AG=sum(1 for r in ag for p in r if p[3]); c1=comp(*R1[k]); h=len(c); w=len(c[0])
        met[k]=dict(bbox=bb,largura=bb[2]-bb[0]+1,altura=bb[3]-bb[1]+1,opacos=A,cores=len(cols),fora_P1=sum(1 for q in cols if q not in C2L),
            semitransparentes=sum(1 for r in c for p in r if 0<p[3]<255),area_div_agumon_S_582=round(A/582,3),area_div_propria_S=round(A/AS,3),
            agumon_mesma_direcao=AG,area_div_agumon_mesma_direcao=round(A/AG,3),
            topete_sobrepoe_corpo=sum(1 for y in range(h) for x in range(w) if t[y][x][3] and b[y][x][3]),
            topete_bbox=bbox(t),topete_igual_v1=(t==R1[k][0]),
            v1_opacos=sum(1 for r in c1 for p in r if p[3]),pixels_diferentes_da_v1=sum(1 for y in range(h) for x in range(w) if tuple(c[y][x])!=tuple(c1[y][x]) and (c[y][x][3] or c1[y][x][3])),
            mascara_diferente_da_S=sum(1 for y in range(h) for x in range(w) if bool(c[y][x][3])!=bool(comp(*R['S'])[y][x][3])))
        print(k,met[k])
    cw=comp(*R['W']); ce=mirror(comp(*R['E'])); met['W']['dif_do_espelho_de_E']=sum(1 for y in range(48) for x in range(48) if tuple(cw[y][x])!=tuple(ce[y][x]))
    json.dump(met,open(d+'metricas_rotacoes_v2.json','w'),indent=1,ensure_ascii=False)
    # pranchas
    tm=cut(LAB+'/lab-assets/a-f7v2/tamer/tamer_a_cabelo_preto/rotations/south.png')
    hk={k:crop(comp(*R[k]),*bbox(comp(*R[k]))) for k in 'SNEW'}; h1={k:crop(comp(*R1[k]),*bbox(comp(*R1[k]))) for k in 'SNEW'}
    ag={k:cut(AGD+k+'.png') for k in 'SNEW'}; BG=(120,160,96,255)
    CW=44; W=8+len(tm[0])+10+4*CW; FH=60
    def sheet(rows,sil=False):
        H=len(rows)*FH; c=canvas(W,H,(255,255,255,255) if sil else BG)
        for f,sp in enumerate(rows):
            G=f*FH+52
            if not sil:
                for x in range(W):
                    for y in range(G,f*FH+FH): c[y][x]=(96,136,80,255) if (x//32)%2==0 else (104,144,86,255)
                paste(c,tm,6,G-len(tm))
            for i,k in enumerate('SNEW'):
                s=sp[k]; x0=8+len(tm[0])+10+i*CW+(CW-len(s[0]))//2
                if sil:
                    for yy,r in enumerate(s):
                        for xx,p in enumerate(r):
                            if p[3]: c[G-len(s)+yy][x0+xx]=(0,0,0,255)
                else: paste(c,s,x0,G-len(s))
        return c
    c=sheet((hk,ag)); save(P+'prancha_v2_4direcoes_hawkmon_agumon_tamer_1x.png',c); save(P+'prancha_v2_4direcoes_hawkmon_agumon_tamer_4x.png',scale(c,4))
    c=sheet((h1,hk)); save(P+'v1_x_v2_SNEW_1x.png',c); save(P+'v1_x_v2_SNEW_4x.png',scale(c,4))
    save(P+'silhuetas_v2_hawkmon_agumon_SNEW_4x.png',scale(sheet((hk,ag),True),4))
    save(P+'silhuetas_v1_x_v2_SNEW_4x.png',scale(sheet((h1,hk),True),4))
    v=canvas(4*30+4,3*44+4,BG)
    for i,k in enumerate('SNEW'):
        t,b=R[k]
        for j,p in enumerate((b,t,comp(t,b))): paste(v,crop(p,9,4,38,44),2+i*30,2+j*44)
    save(P+'camadas_v2_corpo_topete_composto_SNEW_4x.png',scale(v,4))
