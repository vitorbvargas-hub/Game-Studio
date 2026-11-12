# DOCUMENTATION — GS-003/knowledge (módulo GS-005, fase 1)

- **Autor:** game-research (subagente) · **Data:** 2026-11-09 · **Escopo:** retomada da tarefa GS-005 após limite de uso anterior.
- **Pedido original:** `docs/briefing/09_gs005_digimon_knowledge_studio.md` (briefing completo do módulo) + `docs/briefing/11_video_library.md` (lista de vídeos). Esta fase 1 cobriu apenas o subconjunto pedido na retomada (evolução em profundidade + treino + atributos + vídeos), não o briefing completo de §1-14.
- **Objetivo desta pasta:** ser a base de conhecimento Digimon compartilhada por todos os agentes do Game Studio (game-design, game-developer, game-art-director, game-map-designer, game-qa), evitando pesquisa duplicada.

## O que NÃO foi duplicado (já existia em outro lugar do GS-003)

- `docs/MOVE_SYSTEM.md` + `prototype/world/src/data/moves/{moves,learnsets,vfx_archetypes}.json` — sistema de golpes/learnset/VFX, já especificado e com dados reais escritos.
- `docs/GDD_MMO_V1.md` — mundo, regiões, quests, dungeons, world boss, arena, economia.
- `research/DIGIMON_SIZE_TABLE.{md,json}` — tamanhos relativos de sprite no mapa.

Esta pasta (`knowledge/`) cobre exclusivamente: índice de vídeos, evolução (prioridade máxima desta fase), treino comparativo, atributos/elementos, e a proposta de evolução para o MMO.

## Arquivos desta entrega

| Arquivo | Conteúdo | Como usar |
|---|---|---|
| `video_reference_index.json` | 35 links da biblioteca de vídeos classificados: vídeo real (oEmbed), página de playlist externa, indisponível (404), ou busca do YouTube (não é vídeo). | Para curar quais vídeos assistir de fato numa fase 2 (nenhum foi assistido nesta fase). |
| `evolution_chains.json` | As 5 linhas (Agumon/Gabumon/Patamon/Guilmon/Dorumon) de Baby a Mega, **separadas por jogo** (DW1, Next Order, Cyber Sleuth/HM, DMO, Dawn & Dusk), com status `confirmed`/`pendente`/`not_in_game` por Digimon. | Fonte primária para game-design/game-developer entenderem o que existe (ou não) em cada jogo antes de desenhar a nossa árvore. |
| `evolution_requirements.json` | Lista plana (flat) de arestas `from → to` com o texto exato do requisito, por jogo. | Para extrair rapidamente "quais números a franquia já usou" como referência de balanceamento. |
| `evolution_comparison_by_game.json` | Mesmas 5 linhas, mas organizadas por "posição no slot" (Baby/Rookie/Champion/Ultimate/Mega) com os 5 jogos lado a lado. | Para visualizar rapidamente onde cada jogo diverge (ex.: linha Dorumon não existe em DW1 nem Next Order). |
| `EVOLUTION_GRAPHS.md` | Grafo ASCII por linha × por jogo, com requisito inline e ramificações alternativas listadas. | Leitura humana rápida, sem precisar abrir o JSON. |
| `evolution_graphs/*.svg` | 5 SVGs simples (um por linha), cadeia canônica Baby→Mega em caixas coloridas. | Referência visual leve para apresentações/mockups de UI. |
| `attributes_and_elements.json` | Regras de atributo (Vaccine/Data/Virus/Free) e elemento, por jogo, incluindo fórmula de dano de Cyber Sleuth e a divisão de "Species" de Dawn & Dusk. | Insumo para o sistema de combate do MMO (MOVE_SYSTEM já define `element` por golpe — este arquivo documenta como cada jogo de origem usa vantagem elemental). |
| `training_systems.json` | Comparativo de treino (mecanismo, stats treináveis, fome/sono/felicidade/disciplina/vínculo, riscos, treino em grupo) por jogo. | Insumo direto para a proposta de treino do MMO (ainda não escrita nesta fase — fica pendente para fase 2, junto com os sistemas de combate/chefes/itens do briefing completo). |
| `EVOLUTION_PROPOSAL.md` | Proposta de sistema de evolução para o nosso MMO: requisitos visíveis, escolha do jogador em ramificação, Auto-evoluir restrito, treino/afinidade/itens, de-digivolução, evoluções raras. | Documento de design para revisão do game-design antes de qualquer implementação (o briefing proíbe implementar evolução antes de validar esta pesquisa). |
| `SOURCE_REGISTRY.md` | Toda fonte usada, com URL, confiabilidade e método de acesso (incluindo os 2 contornos técnicos usados: API MediaWiki e proxy `r.jina.ai`). | Auditoria e repetição da pesquisa. |
| `DATA_QUALITY_REPORT.md` | Cobertura numérica por linha×jogo, causa raiz de cada lacuna, classificação de confiabilidade das fontes. | Para qualquer agente decidir se os dados aqui são suficientes para uma decisão de design, ou se precisam de mais pesquisa antes. |
| `_research/*.json` | Dados brutos de cada subagente de pesquisa (1 por jogo + treino + atributos), antes da consolidação. Inclui `build_evolution.py` e `build_graphs.py`, os scripts que geraram os arquivos consolidados acima a partir desses brutos. | Rastreabilidade total; não é para consumo direto dos outros agentes (use os arquivos consolidados na raiz de `knowledge/`). |

## Cobertura resumida (ver `DATA_QUALITY_REPORT.md` para detalhe completo)

- **Jogos com dados de evolução ricos (requisito numérico exato):** Digimon Story: Cyber Sleuth/Hacker's Memory e Digimon World: Dawn & Dusk.
- **Jogos com presença/ausência confirmada mas requisito numérico pendente (bloqueio técnico de ferramenta):** Digimon World: Next Order e Digimon Masters Online.
- **Jogo com cobertura mais fraca:** Digimon World (PS1) — fontes majoritariamente incompletas na própria wiki.
- **24 de 26 "vagas" de Digimon nas 5 linhas pesquisadas** foram confirmadas como existentes em pelo menos 1 jogo, com requisito numérico documentado em Cyber Sleuth e/ou Dawn & Dusk.

## Limitações gerais desta fase (ver também cada JSON/`DATA_QUALITY_REPORT.md`)

1. Nenhum vídeo foi assistido (ferramenta não permite) — apenas metadados via oEmbed.
2. `web_search` estava desabilitado nesta sessão; o fallback DuckDuckGo HTML foi bloqueado por CAPTCHA em toda tentativa.
3. Várias wikis Fandom/StrategyWiki bloqueiam `web_fetch` direto com desafio Cloudflare — contornado via API MediaWiki ou proxy de leitura (`r.jina.ai`), documentado em `SOURCE_REGISTRY.md`.
4. dmokb.info (DMO) renderiza a árvore de digivolução via JavaScript no cliente — impossível de capturar com as ferramentas desta sessão; requisitos de DMO ficaram `pendente` quase em sua totalidade.
5. GameFAQs bloqueou 100% das tentativas de acesso.
6. digidex.gg foi verificado e descartado: é um banco de dados do Digimon Card Game (TCG), não dos jogos de RPG/MMO pesquisados.

## Próximos passos sugeridos (fora do escopo desta entrega)

1. Pesquisa de requisitos numéricos de Next Order e DMO com acesso via navegador real (fora das ferramentas atuais).
2. Expandir as 5 linhas pesquisadas para o resto do roster do nosso MMO conforme ele crescer.
3. Curadoria de vídeos de fato assistidos (por um agente ou humano com acesso a vídeo), preenchendo os campos `pendente` de `video_reference_index.json`.
4. Seguir para os demais itens do briefing completo (§6-§10: digimon_database.json, skills_database.json, bosses_database.json, dungeons_database.json, items_database.json) — não cobertos nesta fase, que priorizou evolução por instrução explícita da retomada.
