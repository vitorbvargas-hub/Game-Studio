# Brief de coordenação F9 — Labramon Complete Production

Data: 2026-11-15 ~23:00 · Coordenação: game-studio · Comando: `COMANDO_F9_LABRAMON.md` (nesta pasta; vale integralmente).
Fan game não oficial, sem licença, sem monetização. Laboratório isolado; nada publicado; jogo principal intocado.

## Decisões do Vitor (2026-11-15)
- "Retro Diffusion — ADIADO" (não executar F5, nem conta, nem créditos).
- "Método ChatGPT → PixelLab — APROVADO COMO PADRÃO 1.1 PROVISÓRIO" (Hawkmon v2 não homologado; sem correções nesta rodada).
- Orçamento PixelLab: "é o teste final, pode gastar a quantidade necessária". Aplicação do game-studio: **teto F9 = 60 gerações, piso de saldo = 485** (saldo inicial 545,40). Registrar custo por operação. Acima disso, parar e pedir.
- Arte-mestra: o Vitor gera no ChatGPT antes de dormir e envia o PNG (fundo #FF00FF). Destino: `fase24-f9-labramon/arte_mestra/`. Se não chegar, Fase 2 = BLOQUEADA (não substituir por outro gerador).
- Depois do Labramon: concluir a Knowledge Base GD-066 (lotes C1 → R1 → C2 → P1-R → A1 → W1).

## Donos por fase (um agente por vez)
| Fase | Dono | Modelo | Entregável |
|---|---|---|---|
| 0 Inventário + Reference Report | game-research | Opus 5.5 | `F9_01_REFERENCE_REPORT.md` |
| 1 Direção de arte e escala | game-art | Opus 5.5 | `F9_02_ART_DIRECTION.md` |
| 2 Validação da arte-mestra | game-art | Opus 5.5 | `F9_03_MASTER_ART_QA.md` |
| 3 Preparação técnica | game-art | Sonnet | `rotacoes/` + manifesto |
| 4 Movimento (standing/idle/walk 4 direções) | game-art | Fable 5.2 | `movement/` |
| 5 Emoções (1 direção) | game-art | Fable 5.2 | `emotions/` |
| 6 Descanso e sono | game-art | Fable 5.2 | `rest/` |
| 7 Interações com o Tamer | game-art | Fable 5.2 | `interactions/` + contratos |
| 8 Combate (ataque/dano/incapacitação) | game-art | Fable 5.2 | `combat/` |
| 9 Laboratório HTML interativo | game-dev | Sonnet | `lab/` (local) + relatório de testes |
| 10 QA independente | game-qa | Opus 5.5 | `F9_QA_INDEPENDENTE.md` |
| 11 Standard Visual 2.0 candidato | game-studio | Opus 5.5 | `STANDARD_VISUAL_2_0_CANDIDATO.md` |
| 12 Relatório final | game-studio | Opus 5.5 | `F9_RELATORIO_FINAL.md` |

Fases 4–8 podem ser agrupadas em 1–2 tarefas do game-art para economizar contexto. Toda tarefa mantém `PROGRESS.md` nesta pasta para retomada.

## Retomada
Ler `PROGRESS.md` e o PROJECT_LOG; conferir no PixelLab (`list_characters`, `list_jobs`, `get_balance`) o que já foi gerado antes de gerar de novo.
