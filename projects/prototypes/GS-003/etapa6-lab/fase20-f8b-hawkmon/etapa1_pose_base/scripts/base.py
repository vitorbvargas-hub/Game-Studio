"""Base S do Hawkmon, 22x38, paleta P1. Redução manual (pixel a pixel) do candidato 00.
Topete = linhas 0-7 (camada separada). Corpo = linhas 8-37 (30 px)."""
from comum import *; from pal import *
TOPETE = [
 '..........kk..........',
 '.........kYYk.........',
 '.........kYYk.........',
 '.........kyYk.........',
 '.........kRyk.........',
 '.........kRRk.........',
 '.........krRk.........',
 '.........kqrk.........',
]
CORPO = [
 '......kkkkkkkkkk......', # 8
 '...k.kWWWWWWWWWWk.k...', # 9
 '..kWkWrrWWWWWWrrWkWk..', # 10
 '..kBBBBBBSSSSBBBBBBk..', # 11
 '..kBBBBBBSbbSBBBBBBk..', # 12
 '..kbbbbbbssssbbbbbbk..', # 13
 '..kwWCkeWWWWWWekCWwk..', # 14
 '..kwWEkeWyYYyWekEWwk..', # 15
 '..kwrEeeyYYYYyeeErwk..', # 16
 '..kwWrWkyyYYyykWrWwk..', # 17
 '...kwWWWkyyyykWWWwk...', # 18
 '...kvwWWWkookWWWwvk...', # 19
 '..kWWwWWvvkkvvWWwWWk..', # 20
 '.kkwWqWWWWWWWWWWqWwkk.', # 21
 'krRrWRWWqWWWWqWWRWrRrk', # 22
 'krRrkRRRRwWWwRRRRkrRrk', # 23
 'krRrkRRRRRwwRRRRRkrRrk', # 24
 'krRrkRRRRRRRRRRRRkrRrk', # 25
 'krRrkrRRRRRRRRRRrkrRrk', # 26
 'kqrqkrRRRRRRRRRRrkqrqk', # 27
 'kGGGkrRRRRRRRRRRrkGGGk', # 28
 'kGGGkqrRRRRRRRRrqkGGGk', # 29
 'kGkGGkqrRRRRRRrqkGGkGk', # 30
 'kGkGkGkqrrrrrrqkGkGkGk', # 31
 '.kkgkgkkqqqqqqkkgkgkk.', # 32
 '...k.kkookkkkookk.k...', # 33
 '......kyyk..kyyk......', # 34
 '....kyyYYykkyYYyyk....', # 35
 '...kCyCyCokkoCyCyCk...', # 36
 '....kkkkkk..kkkkkk....', # 37
]
if __name__ == '__main__':
    for i,r in enumerate(TOPETE+CORPO): assert len(r)==22,(i,len(r),r)
    blank=['.'*22]
    top=from_txt(TOPETE+blank*30); body=from_txt(blank*8+CORPO); comp=from_txt(TOPETE+CORPO)
    d=OUT+'/base_polida/'
    save(d+'base_S_topete.png',top); save(d+'base_S_corpo.png',body); save(d+'base_S_composto.png',comp)
    for n,p in (('topete',top),('corpo',body),('composto',comp)): save(d+'base_S_%s_4x.png'%n,scale(p,4))
    T='/home/openclaw/projects/GameStudio/workspaces/game-art/tmp/c14/'
    BG=(120,160,96,255)
    v=canvas(22*3+16,42,BG)
    paste(v,comp,2,2); paste(v,body,28,2); paste(v,top,54,2)
    save(T+'base_x10.png',scale(v,10))
    c1=canvas(60,44,BG); paste(c1,comp,4,3)
    w,h,ag=load(OUT+'/refs_enviadas/ref3_estilo_agumon_f7v2_S.png'); ag=crop(ag,*bbox(ag)); paste(c1,ag,32,41-len(ag))
    save(T+'base_vs_ag_x3.png',scale(c1,3))
