# F9 — Labramon Complete Production: relatório final

Digital Odyssey (GS-003) · game-studio · 2026-11-16 · Fase 12 do Comando F9.
Fan game não oficial, sem licença, sem monetização. Laboratório isolado; nada publicado; jogo principal intocado. **Execução técnica não é homologação.** O ChatGPT ainda **não** revisou este pacote.

## 1. Status geral
**Concluído como CANDIDATO.** Todas as 13 fases foram executadas. QA independente 7,79 → **8,04 após correções** (meta ≥ 8, por margem mínima; nenhum P0). Um P1 aberto (A1, passada × velocidade do Tamer) bloqueia a integração no jogo, não o laboratório.

## 2. Resumo por fase
| Fase | Entrega | Dono / modelo | Classificação |
|---|---|---|---|
| 0 Inventário e Reference Gate | `F9_01_REFERENCE_REPORT.md`, `refs/` (6 oficiais) | game-research / Opus | CONCLUÍDO E TESTADO |
| 1 Direção de arte e escala | `F9_02_ART_DIRECTION.md` | game-art / Opus | CANDIDATO — AGUARDANDO HOMOLOGAÇÃO |
| 2 Arte-mestra | `arte_mestra/` (v1 sentada, v2 em pé, ambas do Vitor no ChatGPT), `F9_03_MASTER_ART_QA.md` (10/10 invariantes) | Vitor + game-art | CANDIDATO |
| 3 Preparação técnica | `rotacoes/` (60×60, 36 px, 19 cores), `rotacoes_sentado/` | game-art / Opus | CANDIDATO |
| 4 Movimento | `movement/` standing + idle 4q + walk 8q × S/E/N/W | game-art / Fable | CANDIDATO |
| 5 Emoções | `emotions/` feliz, triste, irritado, assustado (E) | game-art / Fable | CANDIDATO |
| 6 Descanso e sono | `rest/` cadeia completa (E) | game-art / Fable | CANDIDATO |
| 7 Interações | `interactions/` carinho, comemoração + contratos JSON (E) | game-art / Fable | CANDIDATO |
| 8 Combate | `combat/` Retriever Bark + FX, dano, incapacitação e recuperação (E) | game-art / Fable | CANDIDATO |
| 9 Laboratório | `lab/` — http://127.0.0.1:5198/lab/index.html | game-dev / Sonnet | CONCLUÍDO E TESTADO |
| 10 QA independente | `F9_QA_INDEPENDENTE.md` (7,79), `F9_QA_REGRESSAO.md` (8,04) | game-qa / Opus | CONCLUÍDO |
| Correções pós-QA | `RELATORIO_F9_CORRECOES.md` (arte), `RELATORIO_F9_LAB_CORRECOES.md` (lab) | game-art / game-dev | CONCLUÍDO E TESTADO (regressão) |
| 11 Standard Visual 2.0 | `STANDARD_VISUAL_2_0_CANDIDATO.md` | game-studio | CANDIDATO |
| 12 Relatório final | este arquivo | game-studio | — |
| Estados especiais em S/N/W | — | — | NÃO INICIADO (fora do escopo de 1 direção) |
| Integração no jogo | — | — | NÃO INICIADO |
| BLOQUEADO | nenhum | — | — |

## 3. Evidências da pesquisa
Reference Book (digimon.net), folha de modelo Toei (lateral em pé), site oficial do Survive, arte do filme Tamers, sprite V-pet D-Ark 25th (paleta exata, 18 cores), sprite do Digimon RPG. Rookie, Beast, Vaccine; técnicas oficiais Cure Liqueur (cura) e Retriever Bark (ataque usado). Sem vista oficial de costas (adaptação). Evolução só com fonte wiki.

## 4. Resultados do QA (8,04 após regressão)
- **Os três defeitos do Hawkmon não voltaram:** rosto/marcas estáveis por quadro, idle sem salto de massa, pé de apoio regular.
- **Altos:** integridade dos arquivos e desempenho (9,0), idle (8,5), descanso (8,25).
- **Abaixo de 8:** fidelidade (presa/garras quase somem a 1×), caminhada (passada curta), interações (carinho sem Tamer em cena), transições (entradas ainda > 600 px), escalabilidade (pós-processo manual).
- **Corrigidos na regressão:** A3, A4, A7, A8, L1–L7. **Parciais:** A2 (entradas), A5 (rosto W a 1×).

## 5. Créditos PixelLab
| Fase | Gerações |
|---|---|
| 0–3 | 0,6 |
| 4 Movimento | 15,05 (6 em testes reprovados: v3 e template dog) |
| 5–8 | 16 |
| Correções | 2 (não aproveitadas) |
| **Total F9** | **33,65 de 60** |
Saldo: 545,40 → **511,75**. Piso de 485 respeitado. Nenhuma compra. Retro Diffusion não usado.

## 6. Tempo de produção
15/11 ~23:00 → 16/11 ~06:30, com ~3h30 paradas pelo limite de uso de 5h (as retomadas das 03:20 e 05:00 falharam e foram refeitas às 05:20). Produção efetiva ~4h.

## 7. Falhas e correções
- ChatGPT desenhou o Labramon **sentado**; o Vitor gerou a v2 em pé (custo 0). Lição no Prompt 2.0.
- v3 custom e template dog redesenharam/encolheram o personagem → **pixminimax + palette + trava de rosto** (a principal lição técnica do F9).
- pixminimax recentra o canvas com `end_frame` → realinhamento por script.
- Intermediários de entrada gerados pioraram o salto → feitos localmente.
- Lab deixava estados impossíveis → máquina de estados corrigida e testada.
- Entregas internas dos subagentes ao coordenador falharam várias vezes (OpenClaw); compensado lendo arquivos e PROGRESS.

## 8. Pendências (decisão do Vitor)
1. **A1 — locomoção:** Labramon mais lento que o Tamer, trote (~4 ger) ou mudar a velocidade da parceira (regra congelada).
2. Estados especiais em mais direções (~16 ger por direção).
3. Cor: rosa atual ou o tom do Reference Book (A10, 0 ger).
4. Aceitar olho maior nos picos de ação (A4) e o intermediário local da comemoração.
5. G-1 (paleta) e G-2 (escala Tamer/Digimon), abertos desde a Etapa 6.
6. **Commit**: a pasta `etapa6-lab/` (fases 6–24, inclusive Hawkmon v2 e F9) está fora do git — risco de perda. Recomendo commit local imediato.
7. Servidor 5198 ligado (local): manter ou desligar.

## 9. Comparação com o Hawkmon v2
| | Hawkmon v2 | Labramon F9 |
|---|---|---|
| Anatomia | bípede | quadrúpede |
| Escopo | rotações + walk/idle | rotações + walk/idle + 14 estados (E) + lab |
| QA | 7,78 (correções não feitas) | 8,04 após correções |
| Defeito principal | rosto cintila no idle | passada curta × Tamer |
| Gerações | 14,55 | 33,65 |
As notas não são diretamente comparáveis (escopos diferentes).

## 10. Standard Visual 2.0
Ver `STANDARD_VISUAL_2_0_CANDIDATO.md`. Validado em 2 espécies: Reference Gate, arte-mestra no ChatGPT, limpeza, import, pixminimax + palette + trava de rosto, QA com medidas por quadro. Proposto (1 espécie): quadrúpedes, estados especiais, costuras. Falta: 3ª espécie, G-1/G-2, regra de locomoção.

## 11. Recomendação para o Tamer 2.0
**Não iniciar ainda** (o comando proíbe sem aprovação). Quando o Vitor autorizar: aplicar o mesmo pipeline (arte-mestra no ChatGPT com as 4 vistas, limpeza, pixminimax + palette, trava de rosto), começando pela **decisão de escala G-2**, porque ela define a altura do Tamer e de todos os Digimon. Resolver junto a velocidade do Tamer, que é a outra metade do A1.

## 12. Próximo passo
1. Enviar este pacote ao ChatGPT (aba "Planejamento do Game Studio") para parecer.
2. Vitor testa o laboratório e decide as pendências do §8.
3. Em paralelo, conforme pedido do Vitor: concluir a Knowledge Base dos Digimon (GD-066).
