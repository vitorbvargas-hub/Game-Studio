"""F7v2 (Comando 12.1): monta pacote_agumon_f7v2/ e projetil_pepper_breath/. PixelLab: 0 gerações.
NÃO DESTRUTIVO (QA-4): escreve numa pasta nova (_build_<hora>), e só então troca; a saída anterior, se existir,
é MOVIDA para _anteriores/<nome>_<hora>/ (nunca apagada). A F7 original (../pacote_agumon_f7) não é tocada."""
import sys, os, json, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
import walk_e_f7 as WE, rig_f7 as R, attack_f7 as AT, attack_v2 as A2, walk_sn_v2 as WS, projetil as PJ
W = H = 60
WALK_ESCOLHIDA = {'S': 'experimental', 'N': 'original'}      # decisão registrada no RELATORIO_F7V2.md §3
STAMP = time.strftime('%Y%m%d_%H%M%S')
def wr(base, sub, frs):
    for i, f in enumerate(frs): save('%s/%s/frame_%03d.png' % (base, sub, i), f)
def publish(stage, final):
    if os.path.isdir(final):
        old = '%s/_anteriores/%s_%s' % (O, os.path.basename(final), STAMP)
        os.makedirs(os.path.dirname(old), exist_ok=True); os.rename(final, old); print('saída anterior movida para', old)
    os.rename(stage, final)
def shifted_img(img, dx, dy): return (W, H, AT.shifted(img, dx, dy))
def walk_sn():
    return {('S', 'original'): R.walk(R.PS, True), ('N', 'original'): R.walk(R.PN, False),
            ('S', 'experimental'): WS.build('S', alt=True), ('N', 'experimental'): WS.build('N')}
def main():
    assert os.path.realpath(F7) != os.path.realpath(F7OLD)
    st = '%s/_build_%s' % (O, STAMP); pk = st + '/pacote'; pj = st + '/projetil'
    for d in 'SNEW': save(pk + '/rotations/%s.png' % d, pad(load(F2B + '/rotations/%s.png' % d), W, H, 6, 5))
    we = WE.build(); wr(pk, 'walk/E', we); wr(pk, 'walk/W', [mirror(f) for f in we])
    wsn = walk_sn()
    for d in 'SN': wr(pk, 'walk/' + d, wsn[(d, WALK_ESCOLHIDA[d])])
    bodies, org = A2.build()
    for d in 'SNEW': wr(pk, 'attack/' + d, bodies[d])
    idS = [pad(f, W, H, 6, 5) for f in frames(F3 + '/anim_idle_S', '')]
    idE = [pad(f, W, H, 6, 5) for f in frames(F3 + '/anim_idle_E', '')]
    P = R.PN
    idN = [R.to60(R.pose(P, **k)) for k in (dict(), dict(t=-1, armL=(0, 1), armR=(0, 1)), dict(t=-1), dict(t=-1),
                                              dict(t=0, armL=(0, -1), armR=(0, -1)), dict())]
    wr(pk, 'idle/S', idS); wr(pk, 'idle/E', idE); wr(pk, 'idle/W', [mirror(f) for f in idE]); wr(pk, 'idle/N', idN)
    wr(pk, 'feliz/S', [shifted_img(f, -3, 4) for f in frames(F4 + '/feliz', '')])
    # ---- projétil
    B, I = PJ.build()
    for d in 'SNEW':
        wr(pj, 'nascer/' + d, B[d]['nascer']); wr(pj, 'voo/' + d, B[d]['voo'])
    wr(pj, 'impacto', I)
    cells = []
    for d in 'SNEW': cells += B[d]['nascer'] + B[d]['voo']
    cells += I
    for sc in (1, 4):
        Wd, Hd = 6*24*sc, 5*24*sc; cv = [[T]*Wd for _ in range(Hd)]
        for k, f in enumerate(cells):
            ox, oy = (k % 6)*24*sc, (k//6)*24*sc
            for y in range(24):
                for x in range(24):
                    c = tuple(f[2][y][x])
                    if c[3]:
                        for j in range(sc):
                            for i in range(sc): cv[oy+y*sc+j][ox+x*sc+i] = c
        save_png_rgba('%s/folha_projetil_%dx.png' % (pj, sc), Wd, Hd, cv)
    disparo = {"S": 3, "N": 3, "E": 2, "W": 2}
    atk_delays = {"S": [200, 140, 120, 160, 120, 120, 160, 140, 200], "N": [160, 140, 120, 140, 120, 120, 140, 140, 200],
                  "E": [160, 160, 120, 120, 120, 120, 140, 140, 200], "W": [160, 160, 120, 120, 120, 120, 140, 140, 200]}
    proj = {
     "nome": "Pepper Breath (projétil independente)", "versao": "F7v2 (Comando 12.1)", "data": "2026-11-14",
     "licenca": "private-prototype (fangame não oficial; sem integração)", "pixellab_geracoes": 0,
     "canvas": [24, 24], "ancora_pixel": [12, 12],
     "ancora_doc": "O centro da bola é o pixel (12,12) do canvas 24x24 em todos os quadros. Posicione o projétil por esse pixel.",
     "folha": {"arquivo": "folha_projetil_1x.png", "celula": [24, 24], "colunas": 6,
               "linhas": ["S: nascer 0-1, voo 2-5", "N: nascer 0-1, voo 2-5", "E: nascer 0-1, voo 2-5", "W: nascer 0-1, voo 2-5", "impacto 0-3 (igual para todas as direções)"]},
     "anims": {"nascer": {"quadros": 2, "delays_ms": PJ.DELAYS['nascer'], "loop": False, "doc": "preso à boca, sem deslocar"},
               "voo": {"quadros": 4, "delays_ms": PJ.DELAYS['voo'], "loop": True, "doc": "a cauda aponta para de onde ele veio"},
               "impacto": {"quadros": 4, "delays_ms": PJ.DELAYS['impacto'], "loop": False, "doc": "o jogo toca ao colidir ou no fim do alcance"}},
     "disparo": {
      "quadro_do_ataque": disparo,
      "tempo_desde_o_inicio_do_ataque_ms": {d: sum(atk_delays[d][:disparo[d]]) for d in "SNEW"},
      "origem_boca_no_canvas_do_sprite": org,
      "offset_da_ancora_do_sprite": {d: [org[d][0] - 29.5, org[d][1] - 49] for d in "SNEW"},
      "canto_do_canvas_do_projetil_no_canvas_do_sprite": {d: [org[d][0] - 12, org[d][1] - 12] for d in "SNEW"},
      "doc": "No INÍCIO do quadro `quadro_do_ataque` do attack/<dir>, crie o projétil com o pixel-âncora (12,12) sobre o pixel `origem_boca` do canvas 60x60 do Agumon (ou: âncora do sprite (29.5, 49) + offset). Toque `nascer` parado e depois `voo` em loop, deslocando."},
     "direcao": {"S": [0, 1], "N": [0, -1], "E": [1, 0], "W": [-1, 0]},
     "ordem_de_desenho": {"S": "na frente do Agumon", "E": "na frente do Agumon", "W": "na frente do Agumon", "N": "ATRÁS do Agumon enquanto houver sobreposição (ele atira para o fundo)"},
     "a_cargo_do_jogo": ["deslocamento e velocidade", "alcance", "colisão", "quando tocar o impacto", "dano"],
     "sugestoes_nao_validadas": {"velocidade_px_s": 100, "hitbox": "8x8 centrada no pixel-âncora", "alcance_px": "definir no jogo",
                                  "doc": "[H] valores usados só na simulação dos GIFs de demonstração; não testados no jogo"},
     "cores": sorted({hx(c) for f in cells for r in f[2] for c in r if c[3]}),
     "fonte": "desenho por código próprio (scripts/projetil.py, mesma função fireball da F7), só cores de fogo já presentes no F2b",
    }
    json.dump(proj, open(pj + '/projetil.json', 'w'), ensure_ascii=False, indent=1)
    meta = json.load(open(F7OLD + '/pacote.json'))
    meta["versao"] = "F7v2 (Comando 12.1, fechamento da F7)"; meta["base"] = "F7 (../pacote_agumon_f7), preservada sem alteração"
    a = meta["anims"]
    a["walk"]["fonte"]["S/N"] = ("S = EXPERIMENTAL do Comando 12.1: pernas e braços dos quadros F2b walk/S (metade esquerda do quadro i, metade direita do quadro i+4), "
                                 "cabeça e tronco da rotação S (pixels da F7), sobe-e-desce -1,-2,-1,0, chão fixo em y=49. "
                                 "N = ORIGINAL da F7 (rig por partes): a experimental de N não melhorou e foi descartada (ver RELATORIO_F7V2.md)")
    a["walk"]["escolha_SN"] = WALK_ESCOLHIDA
    at = a["attack"]
    for k in ("fx", "fx_ordem", "fx_origem_boca"): at.pop(k, None)
    at["disparo_quadro"] = disparo
    at["fases"] = {"S": {"preparacao": [0, 2], "boca_aberta": [3, 6], "recuperacao": [7, 8]},
                   "N": {"preparacao": [0, 2], "boca_aberta": [3, 6], "recuperacao": [7, 8]},
                   "E": {"preparacao": [0, 1], "boca_aberta": [2, 7], "recuperacao": [8, 8]},
                   "W": {"preparacao": [0, 1], "boca_aberta": [2, 7], "recuperacao": [8, 8]}}
    at["projetil"] = {"pacote": "../projetil_pepper_breath/projetil.json",
                      "doc": "O corpo do ataque NÃO tem fogo. O Pepper Breath é projétil independente: nasce no quadro `disparo_quadro`, no pixel `origem_boca` do canvas do sprite.",
                      "origem_boca": org, "offset_da_ancora": {d: [org[d][0] - 29.5, org[d][1] - 49] for d in "SNEW"},
                      "direcao": proj["direcao"], "ordem_de_desenho": proj["ordem_de_desenho"]}
    at["fonte"]["N"] += "; F7v2: q5 cabeça +1 px para cima, q7 tronco 1 px para baixo (o corpo não fica mais parado em q4-q7)"
    at["fonte"]["S"] += "; F7v2: resíduo vermelho-escuro do fogo antigo limpo em q3 (15 px) e q4 (2 px)"
    at["fonte"]["E/W"] += "; F7v2: 1 px de resíduo limpo em q2"
    at["fonte"].pop("fx", None)
    meta["nao_incluido"] = ["diagonais", "feliz em N/E/W", "deslocamento, colisão e impacto do projétil (a cargo do jogo)"]
    json.dump(meta, open(pk + '/pacote.json', 'w'), ensure_ascii=False, indent=1)
    publish(pk, F7); publish(pj, O + '/projetil_pepper_breath'); os.rmdir(st)
    print('pacote ok', F7)
if __name__ == '__main__': main()
