# PROGRESS — F7 híbrido ampliado (Agumon)
Brief: `etapa6-lab/BRIEF_COMANDO_13_F7.md` · game-art · PixelLab: 0 gerações · sem integração

| Hora | Etapa | Estado |
|---|---|---|
| 18:47 | Início; leitura do brief, contexto §4.1, Reference Gate, ficha, relatórios e QAs C10/F6 | feito |
| 21:00 | Retomada (2ª execução). Brief + ADENDO + Comando 12 do fundador lidos; inventário das fontes; folhas de visão geral em `tmp/o2_*` | feito |
| 21:02 | Decisões de formato: canvas 60×60 em tudo; registro rot48+(6,5); parada lateral = rotação E do F2b | feito |
| 21:06 | Etapa 1: walk E/W (`scripts/walk_e_f7.py`): base rot E F2b; pernas C10 com passada 3 px/quadro; braço 5 poses; ponta da cauda atrasada | feito |
| 21:08 | Etapa 2: walk S/N por rig das rotações (`scripts/rig_f7.py`) | 1ª versão feita |
| 21:12 | Etapa 3: ataque S/N/E/W com fogo removido do corpo + `attack_fx/` (`scripts/attack_f7.py`) | feito |
| 21:13 | Etapa 4: idle S/N/E/W, feliz S, rotações, `pacote.json` → `pacote_agumon_f7/` (`scripts/build_f7.py`) | feito |
| 21:13 | Etapa 5: métricas (`scripts/metricas_f7.py` → `metricas_f7.json`) + 4 correções pós-métrica | feito |
| 21:14 | Etapa 6: comparação A/B/C/D (+F6) em `comparacao/` (`scripts/comparacao_f7.py`), 1ª versão | feito |
| 21:16 | Etapa 7: revisão visual das pranchas e 2ª passada (walk S/N mais viva, recuo no ataque N); pacote, métricas e comparação refeitos | feito |
| 21:20 | Etapa 8: `RELATORIO_F7.md`, `sha256.txt` (188 arquivos). Saldo PixelLab 573,95 (0 gerações) | feito |
| 21:20 | **CONCLUÍDO.** Próximo: game-qa independente → ChatGPT → build isolado para o Vitor. Nada integrado. | parado |

> Nota: as horas das linhas anteriores foram corrigidas pelo horário real dos arquivos (a 1ª anotação estava estimada a mais).

## Como refazer
`cd scripts && python3 build_f7.py && python3 metricas_f7.py && python3 comparacao_f7.py` (≈1 min; só leitura das fases anteriores).

## Pendências conhecidas
Ver `RELATORIO_F7.md` §8 (F7-R1 a R12) e §9. Não assisti aos GIFs em movimento: fluidez é hipótese até o QA.
