"""F7: monta pacote_agumon_f7/ (canvas 60x60 em tudo; registro rot48 + (6,5)). PixelLab: 0 gerações."""
import sys, os, json, shutil
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
import walk_e_f7 as WE, rig_f7 as R, attack_f7 as AT
W = H = 60
def wr(sub, frs):
    d = F7 + '/' + sub
    if os.path.isdir(d): shutil.rmtree(d)
    for i, f in enumerate(frs): save('%s/frame_%03d.png' % (d, i), f)
def main():
    if os.path.isdir(F7): shutil.rmtree(F7)
    # rotações: F2b sem alteração de pixel, só o canvas 60
    for d in 'SNEW': save(F7 + '/rotations/%s.png' % d, pad(load(F2B + '/rotations/%s.png' % d), W, H, 6, 5))
    # walk
    we = WE.build(); wr('walk/E', we); wr('walk/W', [mirror(f) for f in we])
    wr('walk/S', R.walk(R.PS, True)); wr('walk/N', R.walk(R.PN, False))
    # attack + fx
    at = AT.build()
    for d in 'SNEW':
        body, fx, info = at[d]; wr('attack/' + d, body); wr('attack_fx/' + d, fx)
    # idle
    idS = [pad(f, W, H, 6, 5) for f in frames(F3 + '/anim_idle_S', '')]
    idE = [pad(f, W, H, 6, 5) for f in frames(F3 + '/anim_idle_E', '')]
    P = R.PN
    idN = [R.to60(R.pose(P, **k)) for k in (dict(), dict(t=-1, armL=(0, 1), armR=(0, 1)), dict(t=-1), dict(t=-1),
                                              dict(t=0, armL=(0, -1), armR=(0, -1)), dict())]
    wr('idle/S', idS); wr('idle/E', idE); wr('idle/W', [mirror(f) for f in idE]); wr('idle/N', idN)
    # feliz (v3 custom polido do F4) — só S existe
    wr('feliz/S', [shifted_img(f, -3, 4) for f in frames(F4 + '/feliz', '')])
    meta = {
     "especie": "Agumon (rookie)", "versao": "F7 híbrido ampliado (Comando 12)", "data": "2026-11-14",
     "pixellab_geracoes": 0, "licenca": "private-prototype (fangame não oficial; sem integração)",
     "canvas": [60, 60],
     "registro": "todas as animações e rotações no mesmo canvas 60x60; rotação 48x48 do F2b entra em (+6,+5)",
     "ancora": {"tipo": "quadril/corpo", "x": 29.5, "y_chao": 49,
                "doc": "Âncora no centro do corpo (x=29.5, entre as colunas 29 e 30) na linha do chão y=49 (última linha opaca dos pés em S/E/W). Em N os pés terminam em y=48 por perspectiva (igual à rotação N do F2b); o chão continua y=49. Posicione o sprite pelo ponto (29.5, 49) em TODAS as animações: não ancorar pelo bbox nem pelo pixel mais baixo. W é espelho horizontal exato de E em torno de x=29.5."},
     "delay_padrao_ms": 110,
     "anims": {
      "walk": {"dirs": ["S", "N", "E", "W"], "quadros": 8, "delay_ms": 110, "loop": True,
               "deslocamento": "E/W: pé de apoio parado no mundo com 3 px por quadro (27 px/s a 110 ms). Se o jogo andar a outra velocidade, ajuste o delay: delay_ms = 3000 / velocidade_px_s",
               "fonte": {"E/W": "rotação E F2b (cabeça, tronco, cauda) + pernas redesenhadas (técnica C10) + braço em 5 poses (balanço ~5 px) + ponta da cauda atrasada; gabarito de pose F6",
                         "S/N": "rig por partes das rotações S/N do F2b (técnica F3), gabarito F6 (contato/descida/passagem/subida): cada perna sobe 1-2-3-1 px, braços em oposição, cabeça 0,+1,0,-1"}},
      "idle": {"dirs": ["S", "N", "E", "W"], "quadros": 6, "delays_ms": {"S": [220, 180, 260, 180, 200, 140], "N": [220, 180, 260, 180, 200, 140], "E": [220, 180, 240, 180, 200, 160], "W": [220, 180, 240, 180, 200, 160]}, "loop": True,
               "fonte": {"S": "rig F3 (= idle do híbrido F4)", "E/W": "rig F3 idle E (respira, pisca, cauda)", "N": "rig F7 sobre a rotação N (respira; de costas não há piscar)"}},
      "attack": {"dirs": ["S", "N", "E", "W"], "quadros": 9, "loop": False,
                 "delays_ms": {"S": [200, 140, 120, 160, 120, 120, 160, 140, 200], "N": [160, 140, 120, 140, 120, 120, 140, 140, 200], "E": [160, 160, 120, 120, 120, 120, 140, 140, 200], "W": [160, 160, 120, 120, 120, 120, 140, 140, 200]},
                 "fx": "attack_fx/<dir>/frame_NNN.png: mesma contagem, mesmo canvas e mesmo registro do corpo; desenhe o quadro i do fx junto com o quadro i do corpo",
                 "fx_ordem": {"S": "fx NA FRENTE do corpo", "E": "fx NA FRENTE do corpo", "W": "fx NA FRENTE do corpo", "N": "fx ATRÁS do corpo"},
                 "fx_origem_boca": {d: at[d][2]["origem_boca"] for d in "SNEW"},
                 "disparo_quadro": {"S": 3, "N": 3, "E": 2, "W": 2},
                 "fonte": {"S": "q0-q2 rig F3/F4 (antecipação); q3-q6 F2b attack/S q4-q7 com o fogo removido; q7 F2b q8 (saída C10A); q8 rig neutro",
                           "E/W": "q0 = rotação E; q1-q7 F2b attack/E com o fogo removido, subidos 1 px (âncora 49); q8 = rotação E com o olho fechado (rig F3)",
                           "N": "q0 e q8 = rotação N; q1-q7 F2b attack/N com o fogo removido (q4 subido 1 px; q3 com recuo de 1 px do tronco, pés fixos)",
                           "fx": "Pepper Breath desenhado por código próprio (attack_f7.py: fireball/sparks), cores do fogo do próprio F2b"}},
      "feliz": {"dirs": ["S"], "quadros": 10, "delays_ms": {"S": [160, 110, 90, 120, 140, 140, 110, 120, 200, 220]}, "loop": False,
                "fonte": "PixelLab v3 custom polido (híbrido F4/D), sem alteração de pixel; só existe em S"},
     },
     "rotations": "F2b sem alteração de pixel (pose parada lateral do F2b, decisão do revisor artístico)",
     "nao_incluido": ["diagonais", "feliz em N/E/W", "projétil além do canvas (fica a cargo do jogo)"],
    }
    json.dump(meta, open(F7 + '/pacote.json', 'w'), ensure_ascii=False, indent=1)
    print('pacote ok')
def shifted_img(img, dx, dy): return (W, H, AT.shifted(img, dx, dy))
if __name__ == '__main__': main()
