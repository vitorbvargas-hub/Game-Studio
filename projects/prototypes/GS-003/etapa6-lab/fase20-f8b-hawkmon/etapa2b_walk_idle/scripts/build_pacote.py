"""Etapa 2b: monta pacote_hawkmon_v1/ (rotações, walk, idle, camadas corpo/topete, pacote.json) e metricas_e2b.json.
0 gerações. Não destrutivo: se o pacote já existe, a versão anterior vai para _anteriores/<hora>/."""
import sys, os, json, time
sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hawk_anim import *
import hawk_anim as HA
PK = OUT + '/pacote_hawkmon_v1'
AG = LAB + '/fase17-f7-hibrido/v2/pacote_agumon_f7v2'
WALK_DELAY = 110
PX_POR_QUADRO = 2
def area(px): return sum(1 for r in px for p in r if p[3])
def comps(px):
    """componentes 8-conexos de pixels opacos"""
    h = len(px); w = len(px[0]); seen = set(); n = 0; sizes = []
    for y in range(h):
        for x in range(w):
            if px[y][x][3] and (x, y) not in seen:
                n += 1; st = [(x, y)]; seen.add((x, y)); k = 0
                while st:
                    a, b = st.pop(); k += 1
                    for dx in (-1, 0, 1):
                        for dy in (-1, 0, 1):
                            q = (a + dx, b + dy)
                            if 0 <= q[0] < w and 0 <= q[1] < h and px[q[1]][q[0]][3] and q not in seen: seen.add(q); st.append(q)
                sizes.append(k)
    return n, sorted(sizes)
def isolados(px):
    """pixels sem vizinho-4 da mesma cor (mesma régua do metricas_rotacoes da E2a)"""
    h = len(px); w = len(px[0]); n = 0
    for y in range(h):
        for x in range(w):
            p = px[y][x]
            if p[3] and not any(0 <= y + dy < h and 0 <= x + dx < w and px[y + dy][x + dx] == p for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): n += 1
    return n
def soltos(px):
    """pixels opacos sem nenhum vizinho-8 opaco"""
    h = len(px); w = len(px[0]); n = 0
    for y in range(h):
        for x in range(w):
            if px[y][x][3] and not any((dx or dy) and 0 <= y + dy < h and 0 <= x + dx < w and px[y + dy][x + dx][3] for dx in (-1, 0, 1) for dy in (-1, 0, 1)): n += 1
    return n
def met_frame(c, t, ref_area_S=None):
    o = comp(c, t); cols = set(p[:3] for r in o for p in r if p[3]); A = area(o); nc, sz = comps(o)
    tb = bbox(t); cb = bbox(c); ob = bbox(o)
    m = dict(area=A, area_div_agumon_S_582=round(A / 582.0, 3), bbox=ob, largura=ob[2] - ob[0] + 1, altura=ob[3] - ob[1] + 1,
             cores=len(cols), fora_P1=sum(1 for q in cols if q not in C2L), semitransparentes=sum(1 for r in o for p in r if 0 < p[3] < 255),
             componentes=nc, pixels_soltos=soltos(o), isolados_mesma_cor=isolados(o),
             topete_sobrepoe_corpo=sum(1 for y in range(H) for x in range(W) if t[y][x][3] and c[y][x][3]),
             topete_ponta_y=tb[1], topete_base_y=tb[3], cabeca_topo_y=cb[1], topete_vao_ate_cabeca=cb[1] - tb[3] - 1,
             topete_altura=tb[3] - tb[1] + 1, ultima_linha_opaca=ob[3])
    if ref_area_S: m['area_div_S_mesma_fase'] = round(A / float(ref_area_S), 3)
    return m
def foot_slide_E():
    """pé de apoio da E: x do tornozelo no mundo, com o corpo andando PX_POR_QUADRO por quadro. Parado = desvio 0."""
    out = {}
    for nome, near in (('perto', True), ('tras', False)):
        xs = []
        for f in range(8):
            p = f if near else (f + 4) % 8
            if p < 4:
                d, L = HA.e_phase(p, near); xs.append(((12 if near else 15) + d + PX_POR_QUADRO * p, f))
        out[nome] = dict(quadros_de_apoio=[f for _, f in xs], x_mundo=[x for x, _ in xs], deslizamento_px=max(x for x, _ in xs) - min(x for x, _ in xs))
    return out
def main():
    B = build(); R = rotations()
    stamp = time.strftime('%Y%m%d_%H%M%S'); st = OUT + '/_build_' + stamp
    for d in 'SNEW':
        save_mk(st + '/rotations/%s.png' % d, R[d]['composto'])
        save_mk(st + '/camadas/rotations/%s_corpo.png' % d, R[d]['corpo']); save_mk(st + '/camadas/rotations/%s_topete.png' % d, R[d]['topete'])
        for a in ('walk', 'idle'):
            for i, (c, t) in enumerate(B[a][d]):
                save_mk(st + '/%s/%s/frame_%03d.png' % (a, d, i), comp(c, t))
                save_mk(st + '/camadas/%s/%s/corpo_%03d.png' % (a, d, i), c); save_mk(st + '/camadas/%s/%s/topete_%03d.png' % (a, d, i), t)
    # ---- métricas
    M = {'rotations': {}, 'walk': {}, 'idle': {}}
    for d in 'SNEW': M['rotations'][d] = met_frame(R[d]['corpo'], R[d]['topete'])
    for a in ('walk', 'idle'):
        for d in 'SNEW':
            fr = [met_frame(c, t, area(comp(*B[a]['S'][i]))) for i, (c, t) in enumerate(B[a][d])]
            ar = [m['area'] for m in fr]
            M[a][d] = dict(quadros=fr, resumo=dict(
                area_min=min(ar), area_max=max(ar), area_div_agumon_S_min=round(min(ar) / 582.0, 3), area_div_agumon_S_max=round(max(ar) / 582.0, 3),
                area_div_S_mesma_fase_min=min(m['area_div_S_mesma_fase'] for m in fr),
                cores_max=max(m['cores'] for m in fr), fora_P1=sum(m['fora_P1'] for m in fr), semitransparentes=sum(m['semitransparentes'] for m in fr),
                componentes_max=max(m['componentes'] for m in fr), pixels_soltos=sum(m['pixels_soltos'] for m in fr),
                isolados_mesma_cor_min_max=[min(m['isolados_mesma_cor'] for m in fr), max(m['isolados_mesma_cor'] for m in fr)],
                topete_sobrepoe_corpo=sum(m['topete_sobrepoe_corpo'] for m in fr),
                topete_ponta_y_min_max=[min(m['topete_ponta_y'] for m in fr), max(m['topete_ponta_y'] for m in fr)],
                topete_oscilacao_ponta_px=max(m['topete_ponta_y'] for m in fr) - min(m['topete_ponta_y'] for m in fr),
                topete_altura_min_max=[min(m['topete_altura'] for m in fr), max(m['topete_altura'] for m in fr)],
                topete_vao_ate_cabeca_max=max(m['topete_vao_ate_cabeca'] for m in fr),
                cabeca_topo_y_min_max=[min(m['cabeca_topo_y'] for m in fr), max(m['cabeca_topo_y'] for m in fr)],
                ultima_linha_opaca_min_max=[min(m['ultima_linha_opaca'] for m in fr), max(m['ultima_linha_opaca'] for m in fr)]))
        dw = 0
        for (c, t), (c2, t2) in zip(B[a]['W'], B[a]['E']):
            ow = comp(c, t); oe = comp(c2, t2)
            dw += sum(1 for y in range(H) for x in range(W) if ow[y][x] != oe[y][W - 1 - x])
        M[a]['W_dif_do_espelho_de_E'] = dw
    M['walk']['deslizamento_pe_apoio_E'] = foot_slide_E()
    M['walk']['px_por_quadro_E_W'] = PX_POR_QUADRO
    M['idle_q0_igual_rotacao'] = {d: comp(*B['idle'][d][0]) == [list(r) for r in R[d]['composto']] for d in 'SNEW'}
    # cabeça idêntica à rotação em todos os quadros (linhas 8-24 da grade = y 20-36 no canvas, deslocada pelo corpo)
    head = {}
    for a in ('walk', 'idle'):
        for d in 'SNEW':
            dif = 0
            for i, (c, t) in enumerate(B[a][d]):
                dy = bbox(c)[1] - bbox(R[d]['corpo'])[1]
                for y in range(20, 32):
                    for x in range(W):
                        if c[y + dy][x] != R[d]['corpo'][y][x]: dif += 1
            head['%s/%s' % (a, d)] = dif
    M['cabeca_px_diferentes_da_rotacao_exceto_piscar'] = head
    json.dump(M, open(OUT + '/metricas_e2b.json', 'w'), indent=1, ensure_ascii=False)
    # ---- pacote.json
    meta = {
     "especie": "Hawkmon (rookie)", "versao": "v1 (Comando 14, F8B, Etapa 2b)", "data": "2026-11-15",
     "licenca": "private-prototype (fangame não oficial, sem licença; sem integração). NÃO homologado.",
     "pixellab_geracoes": {"etapa_2b": 3, "uso": "só gabarito de movimento (walk_cru/); nenhum pixel gerado entra no pacote"},
     "canvas": [60, 60],
     "registro": "rotações, walk e idle no mesmo canvas 60x60; a rotação 48x48 da Etapa 2a (rotacoes_polidas_v2) entra em (+6,+7)",
     "ancora": {"tipo": "quadril/corpo", "x": 29.5, "y_chao": 49,
                "doc": "Mesma âncora do Agumon F7v2: centro do corpo em x=29.5 (entre as colunas 29 e 30), chão em y=49 (última linha opaca dos pés em S e N e do pé de perto em E/W). Posicione pelo ponto (29.5, 49) em todas as animações, nunca pelo bbox. Em E/W o pé de trás pisa em y=48 (1 px acima, por perspectiva, como na rotação): nos quadros 4-7 da walk E/W a última linha opaca é 48 e o chão continua 49. W é espelho horizontal exato de E em torno de x=29.5."},
     "delay_padrao_ms": WALK_DELAY,
     "anims": {
      "walk": {"dirs": list("SNEW"), "quadros": 8, "delay_ms": WALK_DELAY, "loop": True,
               "deslocamento": "E/W: pé de apoio parado no mundo com %d px por quadro (%.1f px/s a %d ms). Para outra velocidade: delay_ms = %d / velocidade_px_s (ao lado do Agumon F7v2, 27,3 px/s, dá ~73 ms). S/N: pé de apoio fixo no chão por 4 quadros; não há medida de deslizamento vertical." % (PX_POR_QUADRO, PX_POR_QUADRO * 1000.0 / WALK_DELAY, WALK_DELAY, PX_POR_QUADRO * 1000),
               "sobe_e_desce": "corpo 1 px mais baixo nos quadros 0 e 4 (contato); a altura máxima é a da rotação",
               "fonte": {"S": "rotação S v2 (cabeça, tronco, asas) + pernas e pés redesenhados; gabarito: walk_cru/S_template (PixelLab template walking-8-frames)",
                         "N": "rotação N v2 + pernas e pés redesenhados atrás do leque; sem geração (movimento da S com a profundidade invertida)",
                         "E/W": "rotação E v2 + pernas e pés redesenhados (passada de 6 px por pé); gabarito: walk_cru/E (PixelLab animate_image); W = espelho"}},
      "idle": {"dirs": list("SNEW"), "quadros": 6, "delays_ms": HA.IDLE_DELAYS, "loop": True,
               "fonte": {"S": "rig: q0 rotação; q1-q2 corpo desce 1 px (topete estica e assenta); q3 sobe com as asas 1 px soltas; q4 pisca; q5 rotação",
                         "N": "igual à S; de costas não pisca: em q4 ajeita uma asa",
                         "E/W": "rig: q1-q2 corpo desce 1 px; q2 cauda cai 1 px; q3 pontas da asa 1 px para trás; q4 pisca"}}},
     "camadas": {"doc": "camadas/<anim>/<dir>/corpo_NNN.png e topete_NNN.png, mesmo canvas 60x60 e mesma âncora; frame = corpo + topete por cima. O topete nunca sobrepõe o corpo (0 px) e nunca se solta (vão 0). Ele é a pena da Feather Slash: separado para o ataque futuro.",
                 "topete": "a ponta fica parada quando a cabeça desce 1 px (a pena estica 1 px na base); oscilação máxima de 1 px"},
     "nao_incluido": ["ataque", "diagonais", "feliz", "integração no jogo", "sombra de contato (a cargo do jogo, como no Agumon F7v2)"],
     "credito": "Hawkmon é espécie oficial de Digimon (Bandai/Toei). Adaptação do estúdio (PixelLab + edição manual por código). Fangame não oficial.",
    }
    json.dump(meta, open(st + '/pacote.json', 'w'), indent=1, ensure_ascii=False)
    if os.path.isdir(PK):
        old = OUT + '/_anteriores/pacote_hawkmon_v1_' + stamp; os.makedirs(os.path.dirname(old), exist_ok=True); os.rename(PK, old); print('anterior movido para', old)
    os.rename(st, PK)
    for a in ('walk', 'idle'):
        for d in 'SNEW': print(a, d, json.dumps(M[a][d]['resumo'], ensure_ascii=False))
    print('W espelho', M['walk']['W_dif_do_espelho_de_E'], M['idle']['W_dif_do_espelho_de_E'], '| slide', M['walk']['deslizamento_pe_apoio_E'], '| cabeça', head, '| idle q0', M['idle_q0_igual_rotacao'])
def save_mk(p, px):
    os.makedirs(os.path.dirname(p), exist_ok=True); save(p, px)
if __name__ == '__main__': main()
