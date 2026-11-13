# Digital Odyssey — Etapa 6, Comando 1: relatório de preparação

- **Data:** 2026-11-13 · **Autor:** game-studio (coordenação e consolidação; não homologa o próprio trabalho)
- **Escopo autorizado:** só planejamento e preparação documental. **Nenhum experimento foi executado.**

## 1. Resumo executivo
O laboratório visual está planejado. Os 6 entregáveis do C1 §11 estão prontos e há um entregável extra: o inventário da Fase 0, pedido no adendo sobre os assets do ChatGPT. Todo o trabalho saiu de **5 agentes, um de cada vez**, em série. **Não houve geração no PixelLab** (saldo de 737,95 de 2.000, renovação em 11/12). Não houve alteração de código, sprite, mapa, Database, UI, save, configuração ou deploy. O worktree `qo` continua limpo em `3289e32`.

**Recomendação:** aprovar a execução da **Fase 0** (avaliação das 4 folhas do ChatGPT) e dos **experimentos E1–E4** (pranchas de escala). As duas etapas custam **0 gerações**. Depois disso, você escolhe a escala, e só então entram os métodos A, B e C (teto proposto de 90 gerações, ainda **não** autorizado).

## 2. Entregáveis
| # | Arquivo | Autor | Status |
|---|---|---|---|
| 1 | `PLANO_LABORATORIO_VISUAL_ETAPA6.md` | game-studio | pronto |
| 2 | `COMPARATIVO_FERRAMENTAS_VISUAIS.md` | game-art (§1–5, §7–8) + game-dev (§6) | pronto; ajustado ao ADR-015 e à extração |
| 3 | `ESTUDO_ESCALA_DIGIMONS.md` | game-research | pronto |
| 4 | `ESTUDO_REGIOES_E_MAPA_PILOTO.md` | game-research (Parte 1) + game-design (Parte 2, layout-brief) | pronto; §7 ajustada pelo coordenador ao ADR-015 |
| 5 | `RUBRICA_QUALIDADE_VISUAL_V1.md` | game-qa | pronto (revisão 2, alinhada ao C1 §7) |
| 6 | `RELATORIO_PREPARACAO_ETAPA6.md` | game-studio | este documento |
| + | `INVENTARIO_ASSETS_CHATGPT.md` + `fase0-chatgpt/` | game-studio | catalogado; não avaliado |

## 3. Checagem dos critérios de conclusão (C1 §12)
| Critério | Situação | Evidência |
|---|---|---|
| 3 métodos definidos | sim | COMPARATIVO §1 (A = ChatGPT + ferramentas gratuitas, B = PixelLab, C = híbrido) |
| Regras de comparação claras | sim | COMPARATIVO §2 (briefing único) + §3 (matriz) + PLANO §2.1 (Fase 0 separada) |
| Classes de tamanho fundamentadas | sim, com ressalva | ESTUDO_ESCALA: 0 de 23 espécies têm altura oficial; usa como proxy a altura do sprite do DS. Trio: Koromon 17 px, Agumon 26 px, WarGreymon 37 px |
| Piloto especificado | sim | ESTUDO_REGIOES Parte 2: 40×30 tiles, 11 POIs, 10 critérios verificáveis |
| Régua pronta | sim | RUBRICA rev. 2: 35/35/15/10/5, 12 bloqueantes, média ≥ 8 e nenhum critério < 7, portão técnico I-01..I-16, custo registrado à parte |
| Custos e riscos levantados | sim | PLANO §5–6; COMPARATIVO §4, §6.4, §6.6, §7 (L1–L6) |
| Nenhum asset ou arquivo operacional alterado | sim | `qo` limpo em `3289e32`; 0 gerações; só documentos novos em `etapa6-lab/` |

## 4. Adendos do fundador incorporados
1. **ADR-015, uso criativo amplo da franquia.** Já criado antes; o contexto comum está na v1.2. A classificação documental (1)–(4) foi aplicada ao elenco, ao cenário e ao estudo de regiões, onde a §7 antiga ficou marcada como substituída.
2. **Extração de frames do anime liberada.** Passou a ser opção válida nos 3 métodos, com as condições do ADR-015: fonte com episódio e minuto, acesso legítimo, crédito e tratamento até nota ≥ 8 (COMPARATIVO §2.5). Nenhuma extração foi executada.
3. **Assets do ChatGPT.** Criada a Fase 0. O ZIP recebido está preservado com md5 `ee2f29be…`. Foram catalogadas 4 folhas: Guilmon, ExVeemon, Agumon e Gabumon; o Veemon está pendente. Fatos: são RGB sem alfa, 1536×1024, com o quadriculado pintado e sem grade de quadros, e o próprio pacote diz "NÃO IMPORTAR". O reaproveitamento fica **separado** da comparação controlada, e o Método A **não foi ranqueado**. Os scripts 01 e 02 do pacote foram registrados e não executados.

## 5. Achados que mudam leituras anteriores
- **[E, game-dev] WarGreymon:** na URL padrão aparece com ~36 px. Os 72 px citados antes só valem com `?dpr=0`.
- **[E, game-dev] Importador do PixelLab:** está fixo na v15b. O mapa-piloto não entra no jogo sem generalizar o importador (M1, 1–2 dias).
- **[E, game-dev] Tamer:** o jogo usa só 4 das 8 direções do Tamer v13.
- **[E, game-dev] Custo do Método A:** integrar um personagem completo vindo do ChatGPT leva 12–32 h; um prop leva 0,6–1,7 h. O que mais custa é fazer as direções e os quadros.
- **[E] Agumon:** os 26 px (corpo) e os 30–34 px (quadro com margem) não se contradizem; são métricas diferentes. O laboratório passa a medir a bounding box opaca (PLANO §3.1).

## 6. Erros e correções da coordenação
- **Rubrica:** no brief do game-qa eu reformulei os 5 critérios sem autorização. Ele registrou a divergência e eu corrigi: prevalece o C1 §7. Na revisão 2, a checklist técnica virou portão obrigatório e o custo virou registro separado, sem peso.
- **Divergência A/B/C:** o C1 define os métodos de um jeito e o `studio-alignment/07` de outro. Prevalece o C1; o 07 fica como histórico.

## 7. Decisões pedidas ao fundador (em ordem; uma por vez)
1. Executar a **Fase 0** (avaliação das 4 folhas: game-art, depois game-qa). Custo 0. **Recomendo.**
2. Executar **E1–E4** (pranchas de escala sem geração). Custo 0. **Recomendo.**
3. Escolher a escala.
4. Método A: quem gera as imagens no ChatGPT seguindo o briefing único.
5. Autorizar o gasto de B e C: até 90 gerações, com piso de saldo de 200.
6. Pendências antigas, ainda abertas:
   - a diretiva "uma ação por vez até 15/11" no USER.md;
   - a prévia pública sem login (risco de PI);
   - a incompatibilidade de GOVERNANCE e VISION com a exceção de fangame.

## 8. Conflitos visuais abertos — continuam abertos
Endesga-32 × referências posteriores; escala Tamer/Digimon; critério unificado de qualidade; densidade dos mapas; convenções da Database para sprites. A rubrica (§8) e o PLANO (§6) só os tratam como variáveis a medir. **Nenhum foi decidido.**

## 9. Custo desta preparação
- **PixelLab:** 0 gerações.
- **Agentes:** game-research (~10 min), game-design (~9 min), game-art (3 rodadas), game-dev (1 rodada), game-qa (2 rodadas), game-studio (coordenação).
- **Serviços pagos:** nenhum contratado.

---

**ETAPA 6 — PLANEJAMENTO DO LABORATÓRIO VISUAL CONCLUÍDO. AGUARDANDO APROVAÇÃO DO FUNDADOR PARA EXECUTAR OS EXPERIMENTOS.**
