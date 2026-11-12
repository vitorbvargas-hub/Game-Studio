# DIGIMON_COVERAGE_REPORT — GS-003 (Prioridade Zero)

- **Data:** 2026-11-08 (atualizado no mesmo dia após decisão do fundador)
- **Base:** ADR-009 atualizada (ADR-007 regra 2 revogada), docs 03/04/05 do briefing, `DIGIMON_ASSET_INDEX.json/.md`, `art/FAN_SPRITE_SOURCES.md`.
- **[E]** = evidência com fonte/data. **[H]** = hipótese.

## 0. Atualização do fundador (2026-11-08)

O fundador revogou a regra 2 do ADR-007: **sprites oficiais (rips de DW DS, Dawn, Dusk e outros jogos/devices) estão liberados em todo o projeto, inclusive no git**, para o fan game não comercial GS-003. Estratégia: usar os oficiais primeiro, substituir aos poucos por arte própria. Esta versão do relatório substitui a recomendação anterior "cenário (a)/(b)" por uma **recomendação única**, já que o bloqueio de licença que gerava os dois cenários deixou de existir.

## 1. Cobertura por linha evolutiva (pós-liberação)

### Guilmon (Gigimon → Guilmon → Growlmon → WarGrowlmon → Dukemon)
- **[E]** Todos os 5 estágios disponíveis como GIF idle animado em `E-M-B-E-R/digimon-world-ds-dawn-dusk-animated-sprites`, agora **official-fan-use**.
- **Cobertura de idle: 5 de 5 estágios (100%).** Walk/attack/sleep: 0 de 5.

### Agumon (Botamon → Koromon → Agumon → Greymon → MetalGreymon → WarGreymon)
- **[E]** Todos os 6 estágios na mesma fonte, mais Agumon em `kaisadilla` (rip oficial, cobertura parcial) e Digimon Pixels (fan-made, [H]).
- **Cobertura de idle: 6 de 6 (100%).** Walk/attack/sleep: 0 de 6.

### Gabumon (Tsunomon → Gabumon → Garurumon → WereGarurumon → MetalGarurumon)
- **[E]** Todos os 5 estágios na mesma fonte.
- **Cobertura de idle: 5 de 5 (100%).** Walk/attack/sleep: 0 de 5.

### Patamon (Poyomon → Tokomon → Patamon → Angemon → HolyAngemon/MagnaAngemon → Seraphimon)
- **[E]** Todos os 6 estágios na mesma fonte, mais Patamon/Angemon em `kaisadilla` (parcial).
- **Cobertura de idle: 6 de 6 (100%).** Walk/attack/sleep: 0 de 6.

### 10 selvagens comuns de rookie
- **[E]** Todos os 10 (Tentomon, Palmon, Biyomon, Gomamon, Renamon, Terriermon, Wormmon, Hawkmon, Impmon, Lopmon) na mesma fonte liberada.
- **Cobertura de idle: 10 de 10 (100%).**

**Resumo geral:** a liberação resolve 100% da cobertura de **idle** para todos os 22 estágios-alvo + 10 selvagens, todos pela mesma fonte (`E-M-B-E-R`), agora licenciada e com créditos registrados. **Nenhum ganho em walk/attack/sleep** — isso depende de uma segunda fonte (rip real do jogo) que não foi extraída nesta sessão.

## 2. Cobertura por tipo de animação

| Animação | Situação pós-liberação |
|---|---|
| **Idle** | 100% coberto para as 4 linhas-alvo + 10 selvagens, via `E-M-B-E-R` (official-fan-use). Pose única, sem direções múltiplas. |
| **Walk** | 0% coberto. Única fonte com walk real (4 direções isométricas) é `DigimonWorldSpriteManager` sobre o rip genuíno do jogo (Spriters Resource) — também liberada pelo fundador, mas **não executada nesta sessão** (ferramenta Python local). **Próximo passo recomendado.** |
| **Attack** | 0% coberto em qualquer fonte pesquisada, inclusive após a liberação. A própria comunidade original (With the Will, 2010) proibiu explicitamente animações de ataque nesse conjunto. Nenhuma ferramenta/fonte investigada tem esse slot. **Produção original será necessária em qualquer cenário.** |
| **Sleep** | 0% coberto, exceto pela mesma ferramenta de rip real (não executada). |

## 3. Fontes oficiais (rip) vs. fan-made — status atualizado

### Oficiais, agora `official-fan-use` (liberadas pelo fundador em 2026-11-08)
- **E-M-B-E-R / With the Will (idle, preservação do rip oficial via comunidade)** — fonte preferida, cobertura completa das 4 linhas-alvo. Crédito: AngelOfHope (ripper original) + E-M-B-E-R (preservação no GitHub).
- **DigimonWorldSpriteManager → Spriters Resource (rip real, walk+idle+sleep)** — prioritária para completar as animações que faltam; não executada nesta sessão. Crédito: comunidade do Spriters Resource + netraular (ferramenta).
- **kaisadilla/digimon-sprite-collection** — agregador de múltiplos jogos oficiais; crédito por arquivo não individualizado, cobertura por Digimon-alvo parcialmente verificada.
- **aderekart.github.io** — agregador pessoal (SPA), crédito não individualizado, conteúdo não extraível sem browser automation.
- **DIM Modifier (dim.digitallink.games)** — ferramenta de modding de hardware Vital Bracelet, "946 sprites oficiais"; acesso real ao conteúdo requer browser automation.
- **kongtaehun/digimon-assets-VB** — sprites oficiais do Vital Bracelet (2 frames, idle simples); crédito: kongtaehun + humulos.com/wikimon.net + direitos Bandai/Hongo/Toei.

### Fan-made (não afetadas pela liberação de rips — continuam `UNDER_REVIEW` por outros motivos)
- **CinzadeNeve (itch.io)** — pago por item, idle-only, licença completa de uso não lida até o fim.
- **Digimon Pixels** — uso livre com crédito pedido, cobertura por Digimon não confirmada visualmente.

## 4. Recomendação final

1. **Adotar `E-M-B-E-R` (idle oficial) como base imediata** para as 4 linhas-alvo e os 10 selvagens — é a única fonte com cobertura completa, já licenciada, com créditos identificados (AngelOfHope + E-M-B-E-R). Registrar os créditos em `CREDITS.md` ao integrar qualquer sprite.
2. **Executar `DigimonWorldSpriteManager` numa sessão com acesso Python local** (não disponível nesta sessão de pesquisa) para extrair walk (4 direções iso) e sleep do rip real do jogo — é o maior ganho de cobertura disponível e já está liberado pelo fundador. Creditar The Spriters Resource + netraular.
3. **Produzir attack original** para todas as 4 linhas-alvo (GAME-SPRITE-ARTIST + GAME-ANIMATOR) — nenhuma fonte pesquisada, oficial ou fan-made, cobre essa animação. Usar os sprites oficiais de idle/walk como referência de proporção e paleta para manter consistência visual.
4. **Avaliar perspectiva:** os sprites do `E-M-B-E-R` são pose única frontal (não 4-direções top-down) — game-art precisa decidir se adapta a pose existente para o mapa ou se produz variações de direção a partir dela.
5. **Investigar `kaisadilla` e `aderekart.github.io`/`DIM Modifier` com browser automation** numa sessão futura — podem ter cobertura adicional (outros estilos oficiais, inclusive talvez walk/attack de outros jogos) não confirmada por serem SPAs ou agregadores grandes não totalmente navegáveis via `web_fetch`.
6. **Fontes fan-made (CinzadeNeve, Digimon Pixels) ficam como complementares**, não prioritárias — só valem a pena se cobrirem algum selvagem fora do alcance do rip oficial (ex.: Elecmon, Gazimon) e após confirmação de licença completa.

## 5. Impacto da mudança de licença na pontuação de qualidade

Com `licenciamento` agora pleno (20/20) para as fontes oficiais, a pontuação subiu, mas **permanece abaixo do threshold de 70** da rubrica do doc 05 para a fonte `E-M-B-E-R` (score recalculado: 68/100) — porque o componente `animações` (20 pontos) só pode contar idle, não walk/attack/sleep. Isso significa: **a licença deixou de ser o bloqueio, mas a cobertura de animação ainda exige revisão antes de aprovação automática** (`UNDER_REVIEW`, não `APPROVED`). A aprovação final por Digimon deve vir do game-art/QA depois de decidir como completar walk/attack/sleep (produção original ou extração do rip real via `DigimonWorldSpriteManager`).

## 6. Amostras para inspeção visual — tentativa e bloqueio técnico

Ao contrário da versão anterior deste relatório (que bloqueava por licença incerta), **a licença não é mais o impedimento**. Tentei baixar 10 arquivos de amostra (4 linhas-alvo + 2 selvagens) para `art/reference/private/digimon-ember-samples/` via `exec`/`curl`:

| Digimon | Estágio | URL pretendida |
|---|---|---|
| Guilmon | rookie | `https://raw.githubusercontent.com/E-M-B-E-R/digimon-world-ds-dawn-dusk-animated-sprites/main/rookie/Guilmon.gif` |
| Growlmon | champion | `.../champion/Growlmon.gif` |
| Agumon | rookie | `.../rookie/Agumon.gif` |
| Greymon | champion | `.../champion/Greymon.gif` |
| Gabumon | rookie | `.../rookie/Gabumon.gif` |
| Garurumon | champion | `.../champion/Garurumon.gif` |
| Patamon | rookie | `.../rookie/Patamon.gif` |
| Angemon | champion | `.../champion/Angemon.gif` |
| Tentomon | rookie | `.../rookie/Tentomon.gif` |
| Renamon | rookie | `.../rookie/Renamon.gif` |

**Resultado:** todas as 10 tentativas falharam com `curl: (56) CONNECT tunnel failed, response 403`, inclusive para `https://github.com` e `https://api.github.com` puros (sem path). O ambiente de execução (`exec`) passa por um egress proxy do sandbox (`HTTPS_PROXY=http://...@127.0.0.1:37243`) que bloqueia esse domínio por completo — não é uma permissão do GitHub nem da licença, é uma restrição de rede do ambiente de execução desta sessão de pesquisa.

**Recomendação:** o fundador ou operador pode baixar esses 10 arquivos manualmente (URLs acima) para `art/reference/private/digimon-ember-samples/` (pasta já git-ignorada), ou uma sessão futura com `exec` apontando para um ambiente sem esse bloqueio de egress pode concluir a amostragem.

## 7. Limitações desta pesquisa

- `web_search` esteve indisponível nesta sessão; toda pesquisa usou `web_fetch`, GitHub API (`api.github.com/repos/.../contents/...`) e busca via `html.duckduckgo.com/html/`.
- `dim.digitallink.games` e `aderekart.github.io` (site) são SPAs que não renderizam conteúdo via `web_fetch` simples — avaliação parcial, baseada em metadados externos.
- `kaisadilla/digimon-sprite-collection` tem 15 subpastas de origem; só uma (`adventure_02_ow`) foi amostrada parcialmente.
- `DigimonWorldSpriteManager` é uma ferramenta Python local, avaliada só pela documentação — não executada nesta sessão.
- Dimensões em pixel, contagem exata de frames e número de direções não foram confirmados por inspeção de imagem em nenhuma fonte.
- Download de amostras bloqueado por restrição de rede do ambiente `exec` (ver seção 6), não por licença.
- Licença completa de cada item da CinzadeNeve (uso comercial vs. não-comercial) não foi lida até o fim.
