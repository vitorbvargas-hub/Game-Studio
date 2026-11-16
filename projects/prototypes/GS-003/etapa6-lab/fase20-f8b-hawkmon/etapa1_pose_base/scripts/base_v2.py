"""Base S do Hawkmon v2 (correções E1b do QA independente), 22x38 de tela, sprite com 20 px de largura, paleta P1.
Editado à mão a partir de base.py. Meia grade esquerda (colunas 0-10), espelhada; exceções em FIX.
Topete = linhas 0-7 (camada separada, igual à v1). Corpo = linhas 8-37 (30 px)."""
from comum import *; from pal import *
from base import TOPETE, CORPO as CORPO_V1
MEIO = [
 '....k..kkkk', # 8  tufos colados + topo da cabeça
 '....kWkWWrW', # 9  V vermelho (pontas)
 '....kWWWWWr', # 10 V vermelho (vértice)
 '....kBBBBSS', # 11 faixa + fivela
 '....kBBBBSb', # 12
 '....kbbbbss', # 13
 '....kwkkkWW', # 14 pálpebra escura
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
 '.kGkGkgkkkk', # 30
 '.kgkgkkyyk.', # 31 perna (haste) 1
 '.khkk.kyyk.', # 32 perna 2
 '..k...kyok.', # 33 perna 3
 '......kyok.', # 34 perna 4
 '....kyyYyok', # 35 pé
 '...kCyCycnk', # 36 garras
 '....kkkkkk.', # 37
]
FIX = {}  # (linha, coluna): letra  -> assimetrias propositais
def monta():
    rows=[]
    for i,m in enumerate(MEIO):
        assert len(m)==11,(i+8,m)
        r=list(m+m[::-1])
        for (y,x),ch in FIX.items():
            if y==i+8: r[x]=ch
        rows.append(''.join(r))
    return rows
CORPO = monta()
if __name__ == '__main__':
    import os
    d=OUT+'/base_polida_v2/'; os.makedirs(d,exist_ok=True)
    blank=['.'*22]
    top=from_txt(TOPETE+blank*30); body=from_txt(blank*8+CORPO); comp=from_txt(TOPETE+CORPO)
    save(d+'base_S_topete.png',top); save(d+'base_S_corpo.png',body); save(d+'base_S_composto.png',comp)
    for n,p in (('topete',top),('corpo',body),('composto',comp)): save(d+'base_S_%s_4x.png'%n,scale(p,4))
    open(d+'grade_v2.txt','w').write('\n'.join(TOPETE+CORPO)+'\n')
    T='/home/openclaw/projects/GameStudio/workspaces/game-art/tmp/c14b/'
    BG=(120,160,96,255)
    v1=from_txt(TOPETE+CORPO_V1)
    v=canvas(52,42,BG); paste(v,v1,2,2); paste(v,comp,28,2)
    save(T+'v1_v2_x10.png',scale(v,10))
    print('\n'.join(CORPO))
    print('opacos',sum(1 for r in comp for c in r if c[3]))
