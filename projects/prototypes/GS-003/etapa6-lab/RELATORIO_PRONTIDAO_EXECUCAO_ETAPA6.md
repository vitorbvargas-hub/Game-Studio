# Digital Odyssey — Etapa 6, Comando 3: relatório de prontidão para execução

- **Data:** 13/11/2026 · **Autor:** game-studio (consolidação, sem homologar o próprio trabalho).
- **Comandos de base:** `COMANDO_ETAPA6_C3_CONSOLIDACAO_ABC.md` e `COMANDO_ETAPA6_C3_ADENDO_PORTAO.md` (portão obrigatório).
- **Execução:** 7 passos, um agente por vez. Os passos 2 a 6 rodaram em Sonnet 5, como o fundador pediu.
- **Custo:** **0 gerações PixelLab**. Saldo 737,95 antes e depois. O jogo, a Database, os sprites e a configuração não foram alterados. Não houve deploy. Worktree `qo` limpo em `3289e32`.

## 1. Entregáveis (9 do comando + revisão do QA)
| # | Arquivo | Autor | Veredito do game-qa |
|---|---|---|---|
| 1 | `ADR_ETAPA6_DECISOES_FUNDADOR.md` | game-studio | conforme |
| 2 | `ESPECIFICACAO_TAMER_PERSONALIZAVEL_V1.md` | game-design | conforme |
| 3 | `ESCALA_E5_POR_ESPECIE_V1.md` | game-design | conforme |
| 4 | `COMPARATIVO_PALETAS_FLORESTA_V1.md` + `paletas/` | game-art | conforme |
| 5 | `BRIEFING_UNICO_LAB_A_B_C.md` | game-art | conforme com ressalva (banda de custo da animação do MetalGreymon) |
| 6 | `INVENTARIO_ASSETS_METODO_A_V1.md` | game-art | conforme |
| 7 | `PLANO_TESTES_JOGAVEIS_A_B_C.md` | game-dev | conforme |
| 8 | `ORCAMENTO_PIXEL_LAB_PILOTO_V1.md` | game-studio | rev. 1 **não conforme**: o preço de `create_character_state` era 10, não ~2, e o subtotal chegava a 19–20. **A rev. 2 foi corrigida** com os preços conferidos pelo QA e fecha em 15. A rev. 2 não passou por nova revisão do QA. |
| 9 | `RELATORIO_PRONTIDAO_EXECUCAO_ETAPA6.md` | game-studio | este documento |
| + | `REVISAO_QA_PRONTIDAO_C3.md` | game-qa | revisão independente |

## 2. Pronto para produção (assim que autorizado)
- As **decisões D1–D6** estão registradas.
- A **régua** está homologada (rubrica rev. 2 + AJUSTES, D4).
- O **briefing único** A/B/C traz: elenco de 9 espécies + Tamer com 2 presets, faixas E5 por espécie, especificação do mapa 40×30 preservando a v15b e especificações de produção por método.
- A **escala E5** traz faixas e colisão separada do visual. É **[H]**, e o plano de teste está definido.
- O **Tamer personalizável** está especificado: 36–50 px, 6 camadas, 4 direções no MVP.
- Há **3 paletas candidatas**, já aplicadas ao mesmo recorte.
- **Fontes de File Island** verificadas: 6 páginas do Wikimon com episódio.
- **Plano técnico dos 3 links:** 3 builds isolados (`lab-a/b/c`), roteiro de teste igual para os três e critério de "versão jogável".
- **Orçamento B** pronto: teto de 15 gerações (rev. 2).

## 3. Depende de novos arquivos
- **ZIP consolidado do ChatGPT.** Bloqueia o Método A inteiro (15 categorias listadas no inventário) e as referências visuais de **Kunemon e Kuwagamon**, que não têm nenhuma fonte visual no estúdio.
- Quando o ZIP chegar, falta confirmar se as "referências anteriores" de Guilmon, ExVeemon e Gabumon são as 3 folhas de 13/11 ou versões novas.

## 4. Depende de decisão do fundador (uma por vez, nesta ordem de impacto)
1. **Autorizar o crédito do Método B** (Solicitação 2 abaixo).
2. **Autorizar o código mínimo do 1º link**: M2 (importador genérico de personagem) + M1-lite (mapa-piloto em `.tmj`) + build isolado, ~2–3 dias. Sem isso nenhum dos 3 links fica jogável.
3. **Onde ficam os links.** Recomendo **local/portal** nesta rodada: risco de PI zero, mas o link só existe enquanto a sessão está ativa. Outra opção é a homologação interna protegida. Prévia pública só com decisão explícita.
4. **Paleta de trabalho do laboratório:** P-i Endesga-32, P-ii real v15b ou P-iii harmonização. É a mesma nos 3 métodos.
5. **Colisão.** Rota 1 mantém `radiusByStage` como está; Rota 2 faz a colisão acompanhar o porte visual. Recomendo a Rota 1 nesta rodada e medir no playtest.
6. **MVP da personalização:** presets completos (recomendado para o laboratório) ou camadas reais.
7. **Kunemon e Kuwagamon na Database:** a entrada formal fica para depois. No teste aparecem como "fora da Database piloto".

## 5. Riscos técnicos relevantes
| Risco | Mitigação |
|---|---|
| Assets do laboratório vazarem para o bundle do jogo principal (os globs são `eager`) | Builds isolados com alias próprio (opção b) |
| Save `gs003.world.save` compartilhado entre os links | Chave de save própria por build, ou origem separada |
| FPS e memória nunca medidos no projeto | Protocolo de medição em cada link (plano §6) |
| Colisão da Rota 1 muito menor que a silhueta dos grandes | Efeito esperado. Métricas N1–N4 no playtest |
| Folhas do ChatGPT sem grade 1:1 (D3) | Conversão ou redesenho entra no custo do Método A |
| Importador do PixelLab fixo na v15b | M1-lite (Tiled) no 1º link. M1 completo só se necessário |
| Risco de PI de um fangame sem licença | Links internos. Nada público sem decisão específica |
| Limite de uso de 5 h dos agentes | `PROGRESS.md` por passo e retomada na mesma sessão |

## 6. Proposta objetiva da 1ª execução experimental
Ordem: **B → A → C**, um agente por vez.
1. **B (PixelLab), até 15 gerações:**
   - Tamer v3 em 2 presets;
   - walk do Tamer em 4 direções;
   - Agumon v3 com walk;
   - terreno grama ↔ água;
   - reserva de 3 gerações;
   - props reaproveitados da v15b, com custo 0.
2. **A (ChatGPT)**, depois do ZIP: inventário, conversão das folhas aproveitáveis para o mesmo recorte e o mesmo elenco mínimo, com custo 0 no PixelLab.
3. **Código do 1º link** (se autorizado): M2 + M1-lite + build isolado. Depois **Link B** local, com captura e FPS.
4. **C (híbrido)**, só com resultados aproveitáveis de A e B.

**Custo previsto:**
- 15 gerações. O saldo cai de 737,95 para no mínimo 722,95.
- ~2–3 dias de código, se autorizados.
- O pacote completo do briefing, estimado em ~190–220 gerações, fica para depois da rodada e precisa de autorização própria.

**Critérios de parada** (detalhe em `ORCAMENTO_PIXEL_LAB_PILOTO_V1.md` §3):
- `get_balance` antes e depois de cada job;
- parada dura em 15 gerações;
- no máximo 1 retrabalho por item;
- se o Tamer falhar 2 vezes, os itens dependentes não são feitos;
- nada é integrado sem a rubrica aplicada (game-art) e revisada (game-qa);
- piso de saldo de 200.

## 7. Pendências menores registradas
- **F0-004 Gabumon:** a nota publicada é 4,0 e deveria ser 4,25, segundo a própria fórmula. O autor (game-art) corrige na próxima rodada dele.
- **Briefing:** a banda de custo da animação do MetalGreymon precisa ser corrigida pelo game-art.
- O `studio-alignment/07` ainda traz a definição antiga de A/B/C, que fica só como histórico.

## 8. Dependências obrigatórias (portão, adendo §7)
- **SOLICITAÇÃO 1 — PACOTE VISUAL CHATGPT:** "Estamos prontos para receber o ZIP consolidado de assets e referências visuais do ChatGPT para o laboratório A/B/C. Envie o pacote completo para inventário e validação antes da produção."
- **SOLICITAÇÃO 2 — ORÇAMENTO PIXELLAB:** "Fundador, autoriza o consumo de até 15 gerações PixelLab para a rodada experimental descrita?"

---

**ETAPA 6, COMANDO 3: PLANEJAMENTO E PREPARAÇÃO CONCLUÍDOS. AGUARDANDO O ZIP DO CHATGPT E A AUTORIZAÇÃO DO FUNDADOR PARA INICIAR A PRODUÇÃO EXPERIMENTAL.**
