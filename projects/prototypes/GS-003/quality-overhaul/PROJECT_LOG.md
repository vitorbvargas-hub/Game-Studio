# Quality Overhaul — registro central (GS-008/009/010/011)

Decisão: ADR-012. Coordenação: game-studio. Aprovação visual: game-art (diretor) + fundador.

## Fases
| Fase | Status | Início | Fim |
|---|---|---|---|
| 1 Diagnóstico | concluída (`PHASE1_REPORT.md`) | 2026-11-09 | 2026-11-09 |
| 2 Preparação | em andamento | 2026-11-09 | — |
| 3 Laboratório visual | pendente | — | — |
| 4 Integração | pendente | — | — |
| 5 Homologação | pendente | — | — |

## Tarefas
| ID | Tarefa | Responsável | Depende de | Status | Saída |
|---|---|---|---|---|---|
| D1 | Auditoria visual: personagens, Digimon, mapas, comparação com Drakantos, região piloto | game-art | — | **entregue** | `quality-overhaul/audit/VISUAL_AUDIT.md` + `quality-overhaul/ART_DIRECTION_V2.md` |
| D2 | Auditoria técnica: renderer, câmera, escala, sistema de animação, sprites, ferramentas, limitações | game-dev | — | em andamento | `quality-overhaul/audit/TECH_AUDIT.md` |
| D3 | Auditoria de UI/HUD/painéis + gap do GS-009 (mapa-múndi/viagem) | game-design | — | em andamento | `quality-overhaul/audit/UI_WORLD_AUDIT.md` |
| D4 | Consolidação: diagnóstico + plano + cronograma ao fundador | game-studio | D1–D3 | concluído | `quality-overhaul/PHASE1_REPORT.md` |
| P1-P3 | Ambiente seguro + escala/DPR + controlador de animação v2 + FG/vida (look v9) + bug Praia | game-dev | — | em andamento | `phase2/PHASE2_DEV.md` |
| P4 | Padrão de animação v2 + protótipo Guilmon (local vs PixelLab) | game-art | — | em andamento | `ANIMATION_STANDARD_V2.md`, `phase2/art/` |
| E1 | GS-012 encontros selvagens: auditoria de combate/spawn + arquitetura + comparação A/B (mapa × instância) | game-dev | — | concluído (f2f9e82); recomendação A, combate no mapa | `quality-overhaul/encounters/ENCOUNTER_ARCHITECTURE.md` |
| X1 | WarGreymon parceiro de teste (pedido anterior do fundador) | game-dev | — | concluído (b3d3a24) | `evidence/wargreymon/` |

## Decisões
- 2026-11-09: GS-012 (encontros selvagens) recebido (`docs/briefing/17_gs012_wild_encounters.md`). Entra no laboratório da floresta-piloto, subordinado ao GS-010. [E] Hoje a simulação é local, com bots e sem servidor: a proteção server-side do §10 vira requisito de arquitetura, não implementação agora.
- 2026-11-09: ADR-012 aprovado (Quality First). Expansão de mundo congelada.
- 2026-11-09: D1 entregue (game-art/GAME-ART-DIRECTOR). Achado principal: o look v8 do mapa (já bom, perto da linguagem Drakantos) está atrás da flag `?look=v8` e não é o padrão carregado pelo jogo — maior ganho visual de custo zero do diagnóstico. Personagem/Digimon: rips oficiais DS com idle reaproveitado (sem respiração), attack/hurt em 1 quadro só (quando existem) e Dorumon sem direção Norte nem combate no schema — nenhum bate o padrão P0 do próprio `ANIMATION_STANDARD.md`. Piloto recomendado: Clareira Central + riacho/ponte, elenco Tamer + Guilmon (bípede) + Dorumon (quadrúpede) + Tentomon (candidato a voador, hoje sem animação de voo).

## Evidências
- Referências Drakantos: `evidence/drakantos-video/`, `docs/DRAKANTOS_VISUAL_STUDY.md`.
- Estado atual: `evidence/map-factory/` (v3/v4/v5/v5b), `evidence/evolution/`.

## Pendências / bloqueios
- O GS-008 cita "dois vídeos". Até agora só recebemos 1: o Drakantos (gJOLy2mhp50). O segundo pode ser o vídeo do IdleDex já registrado em `evidence/founder-video-idledex/`. Confirmar com o fundador.

## Autorização noturna (2026-11-09 ~23:40)
O fundador foi dormir e autorizou: "continue os trabalhos, lembre da qualidade e do mapa, pode executar as ações em minha autorização". Escopo assumido pelo coordenador: tudo o que é reversível e já foi discutido (Fase 2/3 do GS-010, GS-012 passos 5–7 atrás de flag, promover o look v8 a padrão, usar até as 26 gerações restantes do PixelLab com registro). **Não incluído:** compra de créditos, publicação e qualquer ação destrutiva. Entrega pela manhã com evidências.
- 2026-11-10 00:2x: P4 parcial concluído (19b6507). Guilmon a×b: 5 gerações gastas, saldo 21. Recomendação híbrida do game-art. Coordenador: as duas vias ainda estão na escala nativa DS (~24–32 px), insuficiente para Quality First. Lançados: VISUAL-QA do protótipo (game-qa) e a prova de escala do Guilmon a ~64 px nativos via PixelLab (game-art, teto de 8 gerações).
- 2026-11-10 01:15 (cron noturno): verificação. Em andamento e vivos (processos ativos): game-dev Fase 2 (P1–P3 já commitados em `ca8267c` na branch `quality-overhaul`, worktree `workspaces/game-dev/qo`; falta `PHASE2_DEV.md`; backup `.tgz` OK em `assets/_backups/`), game-art prova de escala 64 px, game-qa VISUAL-QA. PixelLab sem jobs ativos; saldo registrado 21. Nenhum subagente interrompido; nada retomado. Lançado (4ª vaga): game-design, P7 brief de composição da Clareira piloto (`phase2/design/P7_CLAREIRA_BRIEF.md`), só desenho, custo zero.
- 2026-11-10 00:4x: QA do Guilmon a×b concluído (`phase2/qa/QA_GUILMON_PROTO.md`). Animação 5 (a) / 6 (b); identidade 9 / 6; consistência 9 / 5. Veredito: na escala nativa ~26–34 px nenhuma via chega a 9/10 (limite físico). A escala precisa subir, o que confirma a prova de escala em andamento (game-art, ~64 px).
- 2026-11-10 01:3x: P1–P3 concluídos na branch `quality-overhaul` (worktree `workspaces/game-dev/qo`; tag `pre-quality-overhaul`=42109e3; commits e0fff98, ca8267c, 569a0f7). Feito: backup .tgz, `?dpr=1` (escala inteira, 8,3% da altura; `?charh=11` dá 11,1%), `?anim=v2` (11 estados, fallback por anatomia), `?look=v9` (FG `objects_above`, água corrente, vento, luzes de 66 para 13) e Praia corrigida. 331 testes. Servidor da branch na 5190. Pendente de arte: estados sem quadros desenhados.
- P7 brief (game-design, 10bc126): recorte da clareira x12–41 × y6–29, composição em camadas, 2 zonas novas de grama alta.
- 2026-11-10 01:3x: prova de escala v1 (ce83237): Guilmon 60×68, 5 gerações, saldo 16. Escala aprovada (Rookie 56–64 px em ART_DIRECTION_V2 §1.4), mas na leitura do coordenador o resultado sai ruidoso, sem clusters limpos, por causa da referência nearest ×2. Lançados: QA da prova (game-qa) e prova v2 com métodos M1 (pro_flash por texto + style) e M2 (referência redesenhada limpa), teto de 8 gerações.
- 2026-11-10 01:4x: QA da prova de escala v1: identidade 6, clusters 4, animação 5, consistência 4. A south.png é 99,74% igual ao nearest ×2 do rip (não foi regenerada), e a paleta subiu de 12 para 40 cores. Achados repassados à v2 (sem ref ×2, paleta travada, olhos).
- 2026-11-10 01:5x: prova de escala v2 (M2, d264b1d): ruído resolvido com repair + reduce_colors antes do ×2, 5,2 gerações, saldo ~10,8. Leitura do coordenador: ficou limpo, mas é '30 px dobrado' (4 cores, sem detalhe novo). Lançada a v3 (M1, Pro Flash por texto a 64 px, teto de 8 gerações).
- 2026-11-10 02:0x: prova de escala v3 (M1, Pro Flash por texto, 53f6c5d): 8 gerações, saldo PixelLab 2,8. É a melhor até agora: 17 cores, sombreamento real e Guilmon reconhecível, estilo mais chibi e corpo de ~40 px no canvas de 64. Ressalva: símbolo do peito aproximado. QA da v3 lançado. Saldo PixelLab quase esgotado; decisão de créditos fica para o fundador.
- 2026-11-10 02:1x: QA da v3 (QA_SCALE_PROOF_V3.md): identidade 6, clusters 8, animação 4, consistência 5. O sombreamento ficou resolvido, mas surgiram problemas: o corpo encolhe 36–47% ao animar, a paleta continua sem trava e a fidelidade ao oficial não foi verificada. O pipeline ainda não serve para o piloto. Próximo passo dentro do saldo: trava de paleta local e investigação da queda de escala (animate v3 custom ou edição); a decisão de créditos fica com o fundador.
- 2026-11-10 02:2x: P7 e GS-012 passos 5–7 concluídos na branch (fa0ab12, d9b1550, 6dd415d, ece1fe2). Clareira recomposta (clusters, menos tufos, FG em 2 fileiras, água sem repetição, ponte corrigida). Encontros com ?encounters=1 (7 áreas de grama, 5 pontos visíveis com até 6 vivos, salto de 1,2 s, painel debug). 357 testes. Vídeo phase3/img/p12_*.webm. Leitura do coordenador: o mirante ainda parece uma laje cinza; lançados o QA da fase 3 e o kit de penhasco orgânico.
- 2026-11-10 02:3x: QA da fase 3 (phase3/qa/QA_PHASE3.md): cenário 6, profundidade 6, iluminação 6, vida 6, consistência 6, integração 8. P1: mirante com cara de laje, oclusão FG não demonstrada (moita de 15–24 px contra corpo de ~56 px) e salto pouco legível. P2: rótulo legal fixo, grama alta indistinta, contraste dia/noite fraco. Lançada a rodada de correções P1/P2 (game-dev), depois do kit de penhasco.
- 2026-11-10 02:3x: kit de penhasco forest-v9-cliffs (6110bab, master, 0 gerações): topo blob-16 com borda irregular, 4 faces estratificadas, musgo, raízes e rampa natural. Leitura do coordenador: melhora, mas a face ainda lê como faixa escura e o topo como ruído cinza; precisa ser validado no jogo. Integração na rodada de correções do game-dev (se o merge pegou o 6110bab; senão, follow-up).
- 2026-11-10 02:4x (cron noturno): verificação. Em andamento e vivo: game-dev, correções P1/P2 da fase 3 (sessão 4a248db5). Nenhum subagente interrompido; nada retomado. Lançados, com custo zero e sem PixelLab: game-art, correção local da v3 do Guilmon (trava de paleta e normalização de escala por quadro, saída `phase2/art/scale-proof-v3-fix/`), e game-design, P8 spec de HUD/painéis v2 (`phase2/design/P8_HUD_V2_SPEC.md`). Total de 3 tarefas ativas. Saldo PixelLab mantido em ~2,8.
- 2026-11-10 ~02:5x: P8 entregue (game-design, custo zero, sem PixelLab): `phase2/design/P8_HUD_V2_SPEC.md` + 6 mockups SVG em `phase2/design/p8_mockups/`. Spec cobre HUD (PV/energia Tamer e parceiro, alvo, hotbar, minimapa), painel de parceiro, inventário, diálogo (novo) e feedback de encontro selvagem GS-012 (entrada em combate, rótulo, grama alta), com grid/px em `?dpr=1`, 3 níveis de moldura, estados, tipografia e paleta reaproveitando tokens já existentes no `style.css` (elemento/raridade/categoria). Prioridades P0/P1/P2 e critérios de aceite mensuráveis para game-qa inclusos. Pendências: produção de arte real (ornamento de canto, ícones coloridos, fonte pixel-bitmap) e confirmação de esforço do minimapa circular com game-dev.
