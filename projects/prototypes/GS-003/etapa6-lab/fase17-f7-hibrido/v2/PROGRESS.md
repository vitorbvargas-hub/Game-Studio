# PROGRESS — F7v2 (Comando 12.1, fechamento da F7 do Agumon)
Brief: `etapa6-lab/BRIEF_COMANDO_12_1_F7_FECHAMENTO.md` · game-art · PixelLab: 0 gerações · sem integração · F7 original intocada

| Hora | Etapa | Estado |
|---|---|---|
| 21:33 | Início: brief, QA_F7_INDEPENDENTE e RELATORIO_F7 lidos; scripts da F7 copiados para `v2/scripts/` | feito |
| 21:34 | Walk S/N experimental (`scripts/walk_sn_v2.py`): pernas/braços F2b + cabeça/tronco da rotação, chão fixo, sobe-e-desce regular. Achado: os quadros F2b S são simétricos (as duas pernas fazem o mesmo), então a metade direita vem do quadro i+4 para ter passada alternada | feito |
| 21:36 | Ataque (`scripts/attack_v2.py`): resíduo vermelho-escuro limpo (S q3 15 px, S q4 2 px, E q2 1 px); ataque N q5 cabeça +1, q7 tronco −1 (sem congelamento) | feito |
| 21:37 | Projétil (`scripts/projetil.py`): canvas 24×24, âncora no pixel (12,12); nascer 2, voo 4 (S/N/E/W), impacto 4 | feito |
| 21:38 | Build não destrutivo (`scripts/build_f7v2.py`): pasta nova + troca; a saída anterior vai para `_anteriores/` (nunca apagada). Refeito 2× = idêntico | feito |
| 21:39 | Métricas (`scripts/metricas_v2.py` → `metricas_f7v2.json`). Decisão: walk S = experimental; walk N = original | feito |
| 21:40 | Comparações (`scripts/comparacao_v2.py` → `comparacao/` e demo do projétil), 1ª rodada | feito |
| 21:43 | Revisão visual: sobravam 5 px `#4e0303` no ataque S q3; limiar do resíduo ampliado (total 20 px em q3). Pacote, métricas e comparações refeitos | feito |
| 21:47 | `RELATORIO_F7V2.md`, `sha256.txt`. F7 original conferida: `sha256sum -c ../sha256.txt` = 188/188 OK | feito |
| 21:47 | **CONCLUÍDO.** Walk S = experimental, walk N = original. Próximo: game-qa → ChatGPT → build isolado do game-dev. Nada integrado. | parado |

## Como refazer
`cd v2/scripts && python3 build_f7v2.py && python3 metricas_v2.py && python3 comparacao_v2.py` (só leitura das fases anteriores e da F7).

## Pendências conhecidas
Ver `RELATORIO_F7V2.md` §6 (V2-R1 a R8) e §8. Não assisti aos GIFs em movimento: a escolha da walk S é hipótese até o QA.
`_anteriores/` guarda as saídas de build anteriores desta sessão (o build não apaga nada); `tmp/` são folhas de inspeção.
