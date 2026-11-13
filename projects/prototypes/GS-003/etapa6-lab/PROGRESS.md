# PROGRESS — Etapa 6, Comando 1 (game-research)

- **Executor:** game-research (subagente) · **Início:** 2026-11-13

## Linha do tempo

1. Lido `COMANDO_ETAPA6_C1.md`, `shared/knowledge/DIGITAL_ODYSSEY_CONTEXT.md`, `database/07_CATALOGO_PILOTO.md`.
2. Verificado `database/sources_cache/refbook_extract.json`: **não tem campo de altura/peso** (só name/level/type/attribute/special_moves). Confirmado em vivo via `web_fetch` em `digimon.net/reference_en/detail.php?directory_name=agumon`: a página oficial não publica altura/peso.
3. Verificado `database/sources_cache/wikimon_infobox_extract.json` e a página viva `wikimon.net/Agumon`: infobox tem só "Min Weight" em gramas (estatística de crescimento do virtual pet Digimon Pendulum/Digital Monster, **não** massa corporal real) — sem campo de altura.
4. **Achado:** já existe `research/DIGIMON_SIZE_TABLE.md` (2026-11-08) com a mesma conclusão (sem altura/peso oficial) e um proxy empírico de pixel (sprites de mapa do Digimon World DS) para 40 espécies, 16 delas dentro do piloto da Database. **Reaproveitado** como fonte primária desta entrega (data original mantida, status `reused_unverified`).
5. Cruzado com `qa/ETAPA2_HOMOLOGACAO.md` (dimensões de canvas: Tamer 36px, Rookies DS 30-34px, Greymon 40×42) e `prototype/world/src/data/world-species.json` (`radiusByStage`: raio de colisão por estágio numérico, já implementado no jogo, independente da altura do sprite).
6. `digimon.fandom.com` bloqueado por Cloudflare (403) — não usado.
7. `wikimon.net/Dark_Tower` e `wikimon.net/Trailmon` lidos (1 req. cada, dentro do crawl-delay de 60s) para o estudo de regiões (02 e Frontier).
8. Lido `research/etapa3-imersao/01_UNIVERSO.md`, `04_MUNDO_DIGITAL.md`, `05_DIRECAO_DE_ARTE.md`, `SOURCES.md`, `docs/GDD_MMO_V1.md` §1 para o estudo de regiões.
9. Escrito `ESTUDO_ESCALA_DIGIMONS.md` e `ESTUDO_REGIOES_E_MAPA_PILOTO.md` (Parte 1 — só pesquisa, sem layout-brief).

## Status final

- **Entregável 1 (escala):** concluído.
- **Entregável 2 (regiões, Parte 1):** concluído. Parte 2 (layout-brief) é do `game-design`, não escrita aqui.
- **Database, jogo e assets:** não alterados. PixelLab não usado. Nenhum outro agente acionado.

## Para o próximo agente (game-studio → game-design)

- A Parte 2 do `ESTUDO_REGIOES_E_MAPA_PILOTO.md` (layout-brief da floresta de Adventure) deve ser escrita pelo `game-design`, usando a seção "Insumos para o layout-brief" no fim da Parte 1.

---

## game-design (2026-11-13) — Comando 1, Parte 2 (layout-brief)

1. Lido `COMANDO_ETAPA6_C1.md`, `shared/knowledge/DIGITAL_ODYSSEY_CONTEXT.md`, a Parte 1 de `ESTUDO_REGIOES_E_MAPA_PILOTO.md` (§6 Insumos), `ESTUDO_ESCALA_DIGIMONS.md`.
2. Lido `qa/ETAPA2_HOMOLOGACAO.md` §D (gameplay G1–G8) e §E (auditoria visual) e `art/digi-forest-v15/v15b/V15B.md` (estrutura em jogo hoje).
3. Buscado no `quality-overhaul/PROJECT_LOG.md` o histórico de feedback do fundador sobre o mapa (10/11 a 12/11): achado decisivo — 12/11 ~10:3x, "estilo Pokémon: chão todo verde, caminho por maciços de árvore, sem trilha marrom". Usado como princípio de legibilidade do brief (§1 da Parte 2).
4. Tentativa de ver as referências do fundador (`direction-v13/refs/founder-pixellab-chat/*.png`) via `view_image` falhou (caminho fora de diretório permitido para esta ferramenta); usada a descrição textual já registrada em `ETAPA2_HOMOLOGACAO.md` §E (comparação visual contra as refs) como evidência indireta — registrado como limitação.
5. Escrita a **Parte 2 — Layout-brief da floresta-piloto (Adventure)** em `ESTUDO_REGIOES_E_MAPA_PILOTO.md` (apêndice, Parte 1 preservada): dimensão 40×30 tiles (32px), diagrama ASCII de zonas, narrativa do percurso, 11 POIs com função, densidade de vegetação por zona, 5 requisitos de legibilidade, encontros futuros por zona [PROPOSTA, Camada B, regras congeladas] resolvendo G1/G2, 8 transições entre áreas, 10 critérios verificáveis para o game-qa, limitações e decisões pendentes do fundador.

### Status final

- Entregável concluído: `ESTUDO_REGIOES_E_MAPA_PILOTO.md`, Parte 2 anexada ao final, Parte 1 intacta.
- Nenhum mapa implementado, nenhum PixelLab usado, Database/jogo/assets intocados, nenhum outro agente acionado.

### Para o próximo agente (game-studio → game-art)

- Usar a Parte 2 como o "cenário comum" (comando §4) para `COMPARATIVO_FERRAMENTAS_VISUAIS.md`: os 3 métodos de produção testam o mesmo layout-brief.

---

## game-art (2026-11-13) — Comando 1, item 3 (`COMPARATIVO_FERRAMENTAS_VISUAIS.md`)

1. Lido `COMANDO_ETAPA6_C1.md` (§3/§4/§8), AGENTS.md, `DIGITAL_ODYSSEY_CONTEXT.md`, `ESTUDO_ESCALA_DIGIMONS.md`, `ESTUDO_REGIOES_E_MAPA_PILOTO.md` (Parte 1 e 2), `07_BRIEFING_ETAPA6_VISUAL.md`, o Style Bible completo, `V15.md`, `V15B.md`, `TAMERS_V13.md`, e trechos relevantes de `PROJECT_LOG.md` (grep por custo/gerações) e `ETAPA2_HOMOLOGACAO.md` §E/§F/§G.
2. **Achado:** `07_BRIEFING_ETAPA6_VISUAL.md` (2026-11-12) define A/B/C de forma diferente do `COMANDO_ETAPA6_C1.md` (2026-11-13, mais recente e em execução). Usei a definição do comando atual (A=ChatGPT+gratuitas, B=PixelLab, C=híbrido) e registrei a divergência como achado, não decisão (§0 do comparativo).
3. `get_balance` chamado (único acesso PixelLab desta entrega): 737,95/2000 restantes, $0 créditos. Nenhuma geração, nenhum asset produzido, nenhum agente acionado.
4. Escrito `COMPARATIVO_FERRAMENTAS_VISUAIS.md` com os 8 itens pedidos: 3 métodos com fluxo por tipo de asset e limitações (Método A/C marcados [H], sem acesso real a ChatGPT nesta sessão; Método B com histórico real citado — Guilmon 64px 3 rodadas/18,2 gerações nunca aprovado, Tamers v13 43 gerações/6 presets, Digi Forest v13 r1 203 gerações reprovada vs. v15 2 gerações aprovada, UI v13 147→0 gerações); briefing único (Tamer + Koromon/Agumon/WarGreymon + recorte 12×10 tiles, escala/paleta como variáveis de teste, não decisão); matriz de comparação com procedimento de medição por critério; estimativa de custo (PixelLab por histórico real, ChatGPT sem acesso registrado, tempo humano/agente estimado [H]); propostas comparativas de revisão do Style Bible (paleta e escala, 3–4 alternativas cada, sem decidir); seção 6 vazia (placeholder game-dev); 6 limiares objetivos de continuidade do PixelLab (L1–L6).

### Status final

- Entregável concluído: `COMPARATIVO_FERRAMENTAS_VISUAIS.md`.
- Nenhuma geração PixelLab (só `get_balance`), nenhum asset produzido, Database/jogo/assets intocados, nenhum outro agente acionado.

### Para o próximo agente (game-studio → game-dev)

- Preencher a seção 6 ("Requisitos técnicos de exportação e integração") do comparativo.
- Avaliar se arquiva/atualiza `07_BRIEFING_ETAPA6_VISUAL.md` por causa da divergência de definição A/B/C registrada no §0 do comparativo.

---

## game-art (2026-11-13, continuação) — adendo do fundador (ADR-015) processado

1. Recebido adendo via `game-studio` pedindo releitura de `ADR-015-digital-odyssey-uso-criativo-da-franquia.md` e do contexto comum v1.2 (§1.2), e 3 ajustes no `COMPARATIVO_FERRAMENTAS_VISUAIS.md` já entregue.
2. Lidos os dois documentos. Aplicados os 3 ajustes pedidos: (a) nova §0b removendo a restrição implícita a "só inspiração genérica" em todos os métodos, com nota em §1 e atualização em §2.2 permitindo referência direta a File Island/praia dos postes/Torre Infinita no briefing de teste; (b) nova §2.4 com a classificação documental (1) oficial / (2) recriação-adaptação / (3) original / (4) fonte-e-risco, aplicada ao elenco e ao cenário do laboratório; (c) nova §2.5 registrando o ponto aberto sobre extração de frame como asset.
3. **Achado não resolvido, reportado em §2.5 e §8 item 9 do comparativo:** o próprio ADR-015 (seção "Extração de material do anime") e o cabeçalho do contexto v1.2 ("v1.2 = extração do anime liberada") dizem que a extração de frame como base de asset **já foi decidida e liberada** (com condições de rastreabilidade); a instrução do adendo recebido pediu para tratar como **não decidida** ("NÃO está explícito... nenhum método usa frame extraído"). Segui a instrução direta e mais conservadora para o conteúdo do documento, mas não escolhi qual fonte prevalece — fica explícito para o `game-studio`/fundador reconciliarem.
4. Nenhuma geração PixelLab nesta etapa (só leitura de arquivo), nenhum asset produzido, nenhum outro agente acionado.

### Status final (após 1º adendo)

- `COMPARATIVO_FERRAMENTAS_VISUAIS.md` atualizado e consistente com o ADR-015, com a contradição de fonte sinalizada explicitamente, não resolvida unilateralmente.

---

## game-art (2026-11-13, 2º adendo) — extração de frame CONFIRMADA liberada pelo fundador

1. Recebido 2º adendo: o fundador confirmou "pode extrair e usar se achar" e pediu para desconsiderar o ponto aberto do 1º adendo, tratando a extração como opção legítima nos 3 métodos, com as condições do ADR-015 (fonte obra/episódio/minuto, camada `official-fan-use`/`reference` com crédito, nota ≥ 8 porque frame cru não é sprite, só fonte legítima sem contornar DRM).
2. Reescrita a §2.5 do comparativo: de "ponto aberto + contradição não resolvida" para "opção liberada, com tabela de condições e onde entra em cada um dos métodos A/B/C". Atualizado o item 9 da §8 (limitações) registrando que a contradição foi resolvida pelo fundador, não por este agente.
3. Nenhuma geração nem extração executada nesta rodada (continua só planejamento); nenhum outro agente acionado.

### Status final (após 2º adendo)

- `COMPARATIVO_FERRAMENTAS_VISUAIS.md` consistente com o ADR-015 e com os dois adendos do fundador; nenhuma contradição pendente de reconciliação nesta entrega.

---

## game-dev (2026-11-13) — Comando 1, item 4 (§6 do `COMPARATIVO_FERRAMENTAS_VISUAIS.md`)

1. Lidos: contexto comum v1.2, ADR-015, `COMANDO_ETAPA6_C1.md`, o comparativo inteiro, `ESTUDO_ESCALA_DIGIMONS.md`, `ESTUDO_REGIOES_E_MAPA_PILOTO.md` (Partes 1 e 2), `INVENTARIO_ASSETS_CHATGPT.md`, `docs/DIAGNOSTICO_TECNICO_1.0.md` e `studio-alignment/07_BRIEFING_ETAPA6_VISUAL.md` §4 (definição de E1–E4).
2. Código lido, sem alteração: worktree `qo`, branch `quality-overhaul`, HEAD `3289e32`, `git status` limpo antes e depois. Loaders (`assets/creatures.ts`, `tiles.ts`, `scene-tiles.ts`, `tamer-presets.ts`), render (`view.ts`, `scale.ts`, `anim.ts`), mapa (`sim/map.ts`, `world/regions.ts`), importadores (`import-pixellab-map.mjs`, `import-tamers-v13.mjs`, `build-official-mons.mjs`), `vite.config.ts` e os manifestos de Koromon, Agumon e WarGreymon no `GA` do `qo`.
3. Substituído o placeholder da §6 por 8 subseções: 6.1 pipeline atual com [E] caminho:linha; 6.2 cinco divergências com outras seções/documentos + 6 regras do motor (R1–R6); 6.3 requisitos por tipo (personagem, tile, prop, mapa); 6.4 caminho do asset do ChatGPT (A1–A8) com esforço por asset [H]; 6.5 checklist binária I-01 a I-16; 6.6 mudanças de código M1–M5 e E1–E4, só estimadas; 6.7 riscos de misturar fontes; 6.8 limitações.
4. Achados principais: (a) na URL padrão (`?dpr=1`) o `mapScale 2` do WarGreymon é ignorado — ele aparece a 1×, não a ~72 px; (b) o importador PixelLab funciona só para a v15b (id, tileset, 2 terrenos e linha da ponte fixos) — o piloto precisa de M1; (c) o runtime usa 4 direções do Tamer, não 8; (d) "múltiplo de 4 px" é regra do PixelLab, não do motor; (e) o `DIAGNOSTICO_TECNICO_1.0.md` §I.2 está desatualizado (v15b integrada no `69b9487`).
5. Nada rodado que grave arquivo (sem testes, sem `map:validate`, que reescreve relatórios). Nenhuma geração PixelLab, nenhum commit, nenhum outro agente acionado. As outras seções do comparativo não foram editadas.

### Status final
- §6 concluída. Próximo na sequência: `game-qa` → `RUBRICA_QUALIDADE_VISUAL_V1.md` (usar a checklist 6.5 na linha "Integração técnica").
- Para o `game-studio`: reconciliar E1–E4 no `PLANO` (usei a definição do briefing 07 §4) e decidir onde ficam os assets do laboratório (divergência T6 do `GA`).

---

## game-qa (2026-11-13) — Comando 1, item 5 (`RUBRICA_QUALIDADE_VISUAL_V1.md`)

1. Lidos: `DIGITAL_ODYSSEY_CONTEXT.md` v1.2, `ADR-015-digital-odyssey-uso-criativo-da-franquia.md`, `COMANDO_ETAPA6_C1.md`, `COMPARATIVO_FERRAMENTAS_VISUAIS.md` inteiro (incl. §3 matriz e §6.5 checklist I-01..I-16 do game-dev), `ESTUDO_ESCALA_DIGIMONS.md`, `ESTUDO_REGIOES_E_MAPA_PILOTO.md` (Partes 1 e 2, incl. §10 critérios do layout-brief), `INVENTARIO_ASSETS_CHATGPT.md`, e `qa/ETAPA2_HOMOLOGACAO.md` §E/§F/§G/§H para calibrar âncoras de nota com o histórico real de auditoria (nota média 4,6/10, itens 2/5/6/7/11).
2. **Achado (não resolvido, só registrado em §0 da rubrica):** o `COMANDO_ETAPA6_C1.md` §7 define 5 critérios/pesos diferentes dos que a instrução específica deste Comando 1 (recebida por este agente) pedia. Segui a instrução recebida (mais específica e em execução), igual à prática já usada pelo `game-art` em `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §0 para uma divergência análoga.
3. Escrita `RUBRICA_QUALIDADE_VISUAL_V1.md`: 5 critérios ponderados (fidelidade/franquia 35%, qualidade de pixel art 35%, coerência visual 15%, integração técnica via I-01..I-16 10%, custo/retrabalho 5%) com âncoras 0/4/6/8/10 observáveis, como medir e evidência exigida por critério; 12 falhas bloqueantes (as 8 do comando + 4 adicionais fundamentadas em Style Bible/AGENTS.md/layout-brief); regras de nota mínima (média ≥8,0, nenhum critério <7, mapa-piloto cruzado com os 10 critérios do layout-brief); processo (autoavaliação não conta, revisão independente game-qa + game-art quando o autor não é o game-art, homologação só do fundador, ficha reaproveitando os campos do `INVENTARIO_ASSETS_CHATGPT.md` §3, regra de registro de divergência ≥1,0 ponto sem tirar média automática); separação Fase 0 × comparação A/B/C (Método A não ranqueado antes de avaliado); tabela dos 5 conflitos visuais abertos como variáveis a observar com evidência, sem resolver nenhum.
4. Nenhum asset avaliado (nada foi produzido ainda), nenhuma geração PixelLab, nenhum código/sprite/mapa/Database alterado, nenhum outro agente acionado.

### Status final
- Entregável concluído: `RUBRICA_QUALIDADE_VISUAL_V1.md`.
- Para o `game-studio`: harmonizar (ou não) o `COMANDO_ETAPA6_C1.md` §7 com os pesos usados nesta rubrica (achado do item 2 acima); o script automático M3 da checklist I-01..I-16 ainda não existe — até lá, parte da verificação técnica depende de inspeção manual do game-qa.
- Próximo na sequência: `game-studio` → `PLANO_LABORATORIO_VISUAL_ETAPA6.md` + `RELATORIO_PREPARACAO_ETAPA6.md`.

---

## game-qa (2026-11-13, Revisão 2) — correção do `game-studio` sobre os pesos da rubrica

1. Recebida correção do `game-studio`: a divergência de pesos registrada na Revisão 1 (§0) foi causada por uma reformulação do próprio `game-studio` no brief deste Comando 1, sem autorização do fundador. Prevalece `COMANDO_ETAPA6_C1.md` §7: Fidelidade e beleza dos Digimon 35% / Beleza e exploração dos mapas 35% / Animações e imersão 15% / Escala e consistência 10% / Integração com a UI 5%.
2. Reescrita `RUBRICA_QUALIDADE_VISUAL_V1.md` (Revisão 2) sobre a tabela correta, sem perder o conteúdo já levantado: fidelidade de espécie + craft de pixel art fundidos no critério "Fidelidade e beleza dos Digimon"; craft de tileset/props + os 10 critérios do layout-brief no critério "Beleza e exploração dos mapas"; critério novo "Animações e imersão" (fluidez + Y-sort/profundidade, calibrado contra Etapa 2 itens 4 e 8); a antiga "coerência visual entre assets" migrada para dentro de "Escala e consistência"; critério novo "Integração com a UI" (legibilidade do asset contra HUD/nome/nível/barra, calibrado contra Etapa 2 item 10).
3. A checklist I-01..I-16 deixou de ter peso e virou **portao técnico binário** (§2): PASSOU só se todos os itens aplicáveis = sim, lista explícita dos que falharem, reprova a integração independente da nota.
4. Custo e retrabalho deixaram de ter peso e viraram **registro obrigatório separado** (§3: gerações, horas, nº de rodadas, % vs. projeção), relatado ao lado da nota, nunca somado a ela.
5. Escrita a regra de renormalização para assets isolados sem mapa (§5.2): o critério "Beleza e exploração dos mapas" fica N/A e o peso (35%) é redistribuído proporcionalmente entre os 4 restantes (fórmula + tabela com os pesos renormalizados: 53,8/23,1/15,4/7,7%); registrada a excessão de "Animações e imersão", que avalia só a metade "imersão" num asset estático em vez de virar N/A total.
6. Ficha de avaliação (§6.2) reescrita com uma coluna explícita mostrando que cobre cada campo de `INVENTARIO_ASSETS_CHATGPT.md` §3 — nenhum campo do inventário ficou sem equivalente; mantido o conjunto de veredito próprio da Fase 0 (candidato apoveitável/precisa de retrabalho/descartado, nunca "aprovado") separado do conjunto da comparação A/B/C (aprovado/reprovado/aprovado com ressalva).
7. **Nenhuma avaliação executada:** as 4 folhas do ChatGPT já recebidas (Guilmon, ExVeemon, Agumon, Gabumon, `INVENTARIO_ASSETS_CHATGPT.md` §4) não foram avaliadas por este agente, por instrução explícita — o `game-art` avalia primeiro, o `game-qa` revisa depois. Só foi confirmada a cobertura de campos da ficha (item 6).
8. Falhas bloqueantes (12 itens), nota mínima (≥8,0 ponderada, nenhum critério <7) e a separação Fase 0 × A/B/C mantidas sem alteração de conteúdo, só renumeradas. Nenhuma avaliação de asset, nenhuma geração PixelLab, nenhum código/sprite/mapa/Database alterado, nenhum outro agente acionado.

### Status final (Revisão 2)
- `RUBRICA_QUALIDADE_VISUAL_V1.md` atualizada com os pesos do fundador (`COMANDO_ETAPA6_C1.md` §7), portao técnico e custo sem peso, regra de renormalização para assets isolados, e ficha compatível com `INVENTARIO_ASSETS_CHATGPT.md`.
- Aguardando: avaliação do `game-art` sobre as 4 folhas da Fase 0 antes da revisão deste agente.
