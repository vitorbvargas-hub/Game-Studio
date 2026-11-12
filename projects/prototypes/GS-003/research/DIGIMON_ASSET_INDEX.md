# DIGIMON_ASSET_INDEX — GS-003 (Prioridade Zero)

- **Data:** 2026-11-08 (atualizado no mesmo dia após decisão do fundador)
- **Escopo:** inventário das fontes do doc 04 + Digimon Pixels + With the Will. Versão legível; dados completos em `DIGIMON_ASSET_INDEX.json`.
- **Rubrica de qualidade (doc 05):** visual 25 + técnica 20 + animações 20 + compat. jogo 15 + licenciamento 20 = 100. Nota < 70 não aprova automático.
- **[E]** = evidência com fonte/data. **[H]** = hipótese não confirmada.

## ⚠️ Atualização do fundador (2026-11-08): rips oficiais LIBERADOS

O fundador revogou a regra 2 do ADR-007 (ver ADR-009, seção Licença): **sprites oficiais (rips de DW DS, Dawn, Dusk e outros jogos/devices) estão liberados em todo o projeto, inclusive no git**, para o fan game não comercial GS-003. A estratégia é usar os oficiais primeiro e substituir aos poucos por arte própria.

Efeitos nesta entrega:
- Toda fonte antes marcada `PENDENTE` ou `REJECTED` por ser rip oficial passou para a camada de licença **`official-fan-use`**.
- O ban anterior do "Full Color Dot Sprites" (With the Will/AngelOfHope, preservado no repo `E-M-B-E-R/digimon-world-ds-dawn-dusk-animated-sprites`) tinha como base legal exatamente a regra agora revogada — **deixa de se aplicar**. Essa fonte passa a ser a **PREFERIDA** para as 4 linhas-alvo, por ser a única com cobertura completa de todos os estágios e já estar licenciada.
- Créditos (ripper + fonte) foram registrados em cada entrada e na lista de fontes — ver campo `credits` no JSON.
- **Ressalva importante que permanece:** mesmo liberada, essa fonte só tem **idle** (sem walk/attack/sleep), então a pontuação de qualidade fica em **68/100** — abaixo do threshold de 70 da rubrica do doc 05. Por isso o status é `UNDER_REVIEW`, não `APPROVED` automático: a licença deixou de ser o bloqueio, mas a cobertura de animação ainda é insuficiente para aprovação direta em produção.

## Cobertura por linha evolutiva (resumo pós-liberação)

| Linha | Estágios cobertos (fonte preferida) | Walk? | Attack? | Sleep? | Status | Licença |
|---|---|---|---|---|---|---|
| **Guilmon** | Gigimon→Guilmon→Growlmon→WarGrowlmon→Dukemon — 5/5 em E-M-B-E-R | Não | Não | Não | `UNDER_REVIEW` (68/100) | official-fan-use |
| **Agumon** | Botamon→Koromon→Agumon→Greymon→MetalGreymon→WarGreymon — 6/6 em E-M-B-E-R | Não | Não | Não | `UNDER_REVIEW` (68/100) | official-fan-use |
| **Gabumon** | Tsunomon→Gabumon→Garurumon→WereGarurumon→MetalGarurumon — 5/5 em E-M-B-E-R | Não | Não | Não | `UNDER_REVIEW` (68/100) | official-fan-use |
| **Patamon** | Poyomon→Tokomon→Patamon→Angemon→HolyAngemon→Seraphimon — 6/6 em E-M-B-E-R | Não | Não | Não | `UNDER_REVIEW` (68/100) | official-fan-use |
| **10 selvagens rookie** | Tentomon, Palmon, Biyomon, Gomamon, Renamon, Terriermon, Wormmon, Hawkmon, Impmon, Lopmon — 10/10 em E-M-B-E-R | Não | Não | Não | `UNDER_REVIEW` (68/100) | official-fan-use |

**Cobertura de idle agora é 100% para as 4 linhas-alvo + 10 selvagens**, todos pela mesma fonte liberada. **Walk, attack e sleep continuam em 0%** para todas — a única fonte com walk/sleep reais (`DigimonWorldSpriteManager`, rip genuíno do jogo via Spriters Resource) também foi liberada, mas requer execução local (ferramenta Python) não feita nesta sessão.

## Fontes investigadas (ver `DIGIMON_ASSET_INDEX.json` → `sources` para detalhe completo, incl. créditos)

| Fonte | Tipo | Licença (pós-atualização) | Créditos (resumo) |
|---|---|---|---|
| `E-M-B-E-R/digimon-world-ds-dawn-dusk-animated-sprites` | Rip oficial animado, preservado via thread da comunidade | **official-fan-use** (preferida) | AngelOfHope (With the Will) + preservação E-M-B-E-R |
| `DigimonWorldSpriteManager` (netraular) | Ferramenta que baixa rip real do DW DS | **official-fan-use** (prioritária para walk/sleep) | The Spriters Resource (rip) + netraular (ferramenta) |
| `kaisadilla/digimon-sprite-collection` | Agregador de rips oficiais de vários jogos/devices | **official-fan-use** | kaisadilla (agregador); origem por arquivo não individualizada |
| `aderekart.github.io` | Agregador pessoal (SPA) + CSV + zip VB | **official-fan-use** | AderekArt |
| `DIM Modifier (dim.digitallink.games)` | Ferramenta web de modding de DIM cards | **official-fan-use** | [H] mesma origem do aderekart.github.io |
| `kongtaehun/digimon-assets-VB` | Dados + sprites oficiais do Vital Bracelet | **official-fan-use** | kongtaehun; dados humulos.com/wikimon.net; direitos Bandai/Hongo/Toei |
| `cinzadeneve.itch.io` | Fan-made, pago por item, idle-only | `UNDER_REVIEW` (não é rip, não afetado pela liberação) | CinzadeNeve |
| `Digimon Pixels` (thejeneral.wixsite.com) | Fan-made, uso livre com crédito pedido | `UNDER_REVIEW` (não é rip) | múltiplos artistas por galeria |
| `With the Will` (thread original) | Origem do E-M-B-E-R | **official-fan-use** | ver E-M-B-E-R |

## Lacunas que persistem mesmo após a liberação

1. **Attack:** nenhuma fonte pesquisada tem esse slot — nem a fonte oficial preferida, nem a ferramenta de rip real, nem as fontes fan-made. Produção original será necessária para todas as linhas.
2. **Walk e sleep:** só existem na fonte `DigimonWorldSpriteManager` (rip genuíno, isométrico), que não foi executada nesta sessão (requer Python local) — é o próximo passo recomendado antes de iniciar produção.
3. **Perspectiva:** os GIFs do E-M-B-E-R são pose única frontal, não um sprite sheet 4-direções top-down — precisam de avaliação/adaptação pelo game-art antes de uso direto no mapa.
4. **DIM Modifier e aderekart.github.io** continuam não totalmente inspecionáveis (SPAs) — requer browser automation numa sessão futura.
5. **kaisadilla/digimon-sprite-collection** tem 15 subpastas de fontes diferentes; só uma amostra pequena foi verificada — cobertura exata por Digimon-alvo ainda não confirmada em todas as subpastas.

## Amostras para inspeção visual

**Download não concluído nesta sessão** - não é mais bloqueio de licença (liberada pelo fundador), mas um bloqueio técnico: o egress proxy do sandbox de execução rejeita qualquer conexão a `github.com`/`raw.githubusercontent.com` (CONNECT tunnel 403), inclusive com User-Agent de navegador. Lista de 10 arquivos pretendidos (4 linhas-alvo + 2 selvagens) e URLs diretas ficam registradas em `DIGIMON_COVERAGE_REPORT.md` seção 6, para download manual pelo fundador/operador ou numa sessão com acesso de rede liberado.
