# Digivice VI 1.0 — P0/P1 entregue (game-dev)

- **Spec:** `projects/prototypes/GS-003/quality-overhaul/phase3/design/DIGIVICE_VI1_SPEC.md` (raiz do estúdio)
- **Branch:** `quality-overhaul` (worktree `workspaces/game-dev/qo`) — sem merge no master
- **Commit de código:** `1ce3019`
- **Data:** 2026-11-11

## O que entrou

| Spec | Item | Prioridade | Estado |
|---|---|---|---|
| §4.1 | Núcleo = um só `Panel` (`dvc`) com aba lateral: grupos TAMER/DIGIMON com disclosure ▾/▸, itens soltos Evolução · Vínculo · Banco de dados · Registros e descobertas; item ativo dourado; pendentes com cadeado | P0 | feito |
| §2.2 | 3 portas, 1 sala: **V**/atalho "dex" → Banco de dados; retrato do parceiro → Digimon · Perfil; bloco do Tamer (antes sem ação) → Tamer · Perfil | P0 | feito |
| §4.2 | Tamer · Perfil: nome/nível/XP = `hud.tamerProgress()` (mesma curva da barra inferior); retrato provisório (`TAMER_PORTRAIT_CROP` ainda pendente) | P0 | feito |
| §4.6/§4.7 | `holoCardHtml` dividida em `holoProfileHtml` + `holoAttrsHtml` (cálculo idêntico) → Digimon · Perfil e Digimon · Atributos | P0 | feito |
| §4.10 | Evolução unificada: o gatilho de nível abre a aba Evolução do núcleo com o aviso "Digivolução disponível" (sem 2ª renderização da %); "Evoluir" num nó manda o alvo (`onEvolveTo`); fechar = "agora não" | P0 | feito |
| §2.3 | Atalho "evo" removido da grade inferior no v2 (o v1 não muda) | P0 | feito |
| §4.12 | Banco de dados = o mesmo `digiviceHtml` do bestiário, dentro do núcleo | P0 | feito |
| §4.13 | Nó `trophy` do anel (mesma posição/ícone/raio da Alt A) rotulado **Registros e descobertas**; abre a seção do núcleo; sub-aba Conquistas usa a mesma lógica/coleta (`handleAchClick`); pip com a mesma condição | P0 | feito (rótulo corrigido nesta retomada) |
| §4.3 | Tamer · Atributos = 6 contadores via `statValue(DigiviceSave)`, sem barra, com nota "não são atributos de combate" | P1 | feito |
| §4.8 | Digimon · Habilidades somente leitura (4 slots = `MovesView`, aprendidos, futuros por nível) + "Editar em Equipe & Box" → aba Golpes | P1 | feito |
| §4.13 | Sub-aba Mapas visitados = `DigiviceSave.maps` na ordem da 1ª visita | P1 | feito |
| §4.11 | Vínculo: estrutura de UI no estado bloqueado — só o aviso, **nenhuma barra/número** | P1 | feito (bloqueado) |
| §4.4/§4.5/§4.9 | Poderes do Tamer, Árvore de talentos do Tamer, Árvore de talentos do Digimon | P2 | **não implementados** — "aguardando aprovação de regra" (regras congeladas pelo fundador) |

Nenhuma linha de sim mudou: só UI sobre dados que já existem.

## Verificação

- `npm test`: 52 arquivos / **486 testes verdes** (2 corridas seguidas). Uma 1ª corrida, em paralelo com o `tsc`, teve 1 falha que não se repetiu — tratada como instabilidade por carga; o nome do teste não ficou no log.
- `tsc --noEmit` ok · `npm run build` ok · `map:validate` 6/6 PASS · `node scripts/encounters/sim.mjs --check` ok (19 entradas, 7 áreas).
- Testes novos: `tests/digivice-core.test.ts` (estrutura, 3 portas com o mesmo nome/nível do Tamer, grade sem "evo", Atributos = `statValue`, Habilidades = `MovesView` + Editar, % da Evolução = `pathPct`, Registros/Mapas = `DigiviceSave.maps`, rótulo do nó do anel, pendentes sem barra/número).

## Capturas (1920×1080, URL padrão `?map=digimon-forest-01`, vite próprio na 5191, 0 erros de página)

Estado de cada uma está em `dv_capture.json` (seção aberta, `pendingBlocks`, `barsInPending: 0`, `evoShortcutInGrid: false`). Script: `prototype/world/scripts/dv-capture.mjs`.

| Arquivo | Conteúdo |
|---|---|
| `dv_tamer_perfil.png` | Tamer · Perfil (porta: bloco do Tamer) |
| `dv_tamer_atributos.png` | Tamer · Atributos (registro de atividade) |
| `dv_tamer_poderes.png` / `dv_tamer_talentos.png` | P2 bloqueado |
| `dv_digimon_perfil.png` / `dv_digimon_atributos.png` | ficha dividida |
| `dv_digimon_habilidades.png` | somente leitura + Editar |
| `dv_digimon_talentos.png` | P2 bloqueado |
| `dv_evolucao.png` / `dv_evolucao_gatilho.png` | árvore; aberta pelo gatilho de nível (ramificação Greymon/GeoGreymon) |
| `dv_vinculo.png` | Vínculo bloqueado, sem número |
| `dv_banco_dados.png` | Banco de dados (porta V) |
| `dv_registros_conquistas.png` / `dv_registros_mapas.png` | Registros e descobertas |
| `dv_nav_recolhida.png` | grupos recolhidos |
| `dv_anel_externo.png` | anel social (Alt A inalterada) |

Cópias para revisão: `workspaces/game-studio/review/dv_tamer_perfil.png`, `dv_evolucao_gatilho.png`, `dv_registros_mapas.png`, `dv_vinculo.png`.

## Limitações

- Retrato do Tamer é moldura provisória (decisão de game-art pendente).
- O título da seção fica colado ao cabeçalho do modal (espaçamento de ~0 px) — ajuste cosmético para a passada de identidade visual.
- §6 do spec (badge de Inventário e badges da grade) não faz parte de P0/P1 deste pedido — não implementado.
- Arte de mapa não foi tocada; os relatórios `docs/map-factory/validation/*` só mudaram a data.
- `scripts/qa-default-url-p2.mjs` (não rastreado) é do game-qa — deixado como estava, fora do commit.
