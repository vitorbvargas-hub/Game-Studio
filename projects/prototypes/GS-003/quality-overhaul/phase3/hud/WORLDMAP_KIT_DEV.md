# Mapa-múndi v1 + kit circuit-kit-v1 no HUD v2 (dev)

Branch `quality-overhaul`, worktree `workspaces/game-dev/qo`. Data: 2026-11-10. Tudo atrás de `?hud=v2`; sem a flag nada muda.
Antes de começar: `git merge master` (`c298a75`), que trouxe o `bc28989` (`art/map-factory/worldmap-v1/` e `art/ui/circuit-kit-v1/`).

- Commits: `6c5e218` (mapa-múndi, kit e testes), `1ff409c` e `f53b36c` (ajustes vistos nas capturas: a moldura lendária esticada, POI em escala 2× inteira e a cor dos botões do kit, que a regra `#hud button` passava por cima, além do cadeado do `button_locked` no Viajar travado) e `633ee1c` (só um comentário no CSS). Arquivos meus: `src/ui/worldmap.ts`, `src/ui/circuit-kit.ts` (novo), `src/ui/digivice.ts`, `src/ui/hud.ts`, `src/style.css`, `tests/worldmap-v2.test.ts` (novo), `tests/digivice.test.ts`, `tests/hud-v2.test.ts`, `scripts/dg-capture.mjs`.
- **Não toquei em `main.ts`, look, render nem mapa.** O v10 do outro game-dev segue sem commit no worktree, e nada dele entrou nos meus commits. O mapa-múndi descobre a flag sozinho, pela URL, porque o `main.ts` chama `worldMapHtml(região, progresso)` sem variante. Como os painéis também ficam dentro do `#hud`, o kit chega a todos pelas variáveis CSS que o `Hud` v2 define.
- Capturas tiradas de um worktree limpo nesses commits (`/tmp/wmverify`, vite na **5191**), como da outra vez.

## Links (5190, worktree compartilhado)

| O quê | URL |
|---|---|
| HUD v2 + mapa-múndi novo (tecla **M** ou botão do minimapa) | http://127.0.0.1:5190/?map=digimon-forest-01&look=v9&dpr=1&anim=v2&encounters=1&hud=v2 |
| Noite | o mesmo link com `&time=night` |
| Sem a flag (grafo v1 e painéis antigos) | o mesmo link sem `&hud=v2` |

A 5190 serve o worktree compartilhado, então mostra também o v10 em andamento do outro agente.

## 1. Mapa-múndi v1 (`?hud=v2`)

- **Ilustração:** `worldmap_v1.png` (640×360, já com a moldura de Digivice) em 2×, até 1280×720, encolhendo com a tela (`aspect-ratio`, `image-rendering: pixelated`).
- **POIs dinâmicos:** um botão por região, nas `pos_px` do `worldmap.json` (convertidas para % do canvas, então acompanham a escala). O glifo vem de `poi_icons.png`, pelo `icon` do JSON e em 2×: linha 0 para as regiões abertas, linha 1 (com cadeado) para as bloqueadas. A moldura vem do kit: lendária = você está aqui (pulsa), rara = liberada, comum = bloqueada ou sem mapa. O nome aparece sob o POI. O estado é o mesmo do grafo v1, calculado por `unlockState()` + `canTravel()`, na nova função `regionMapState`.
- **Rotas:** as 5 do `worldmap.json`, desenhadas por cima em tracejado (ciano quando as duas pontas estão abertas, cinza quando não), porque as rotas assadas no PNG são discretas (o próprio README avisa).
- **Painel lateral do destino** (moldura do kit pelo estado): nome, faixa de nível, número de espécies, estado, **requisitos** (a regra do JSON escrita por extenso, com ✓ se cumprida), **selvagens** (nome e faixa de nível de cada espécie) e **Viajar** (botão do kit; o estado bloqueado usa `button_locked`). Abre no lugar onde você está. Clicar num POI troca o destino sem re-renderizar, e a escolha sobrevive a reaberturas até a região atual mudar. Arena e a nota continuam no painel.
- **Viagem:** usa os mesmos `data-travel` e `data-arena` que o `main.ts` já trata, então nada mudou ali. A captura confirmou: Floresta (`digimon-forest-01`) → Vila (`vila`, POI "aqui") → Floresta (`digimon-forest-01`). Ver `kit_capture.json` → `worldmap.travel`.

## 2. Kit circuit-kit-v1 no Digivice e nos painéis v2

`src/ui/circuit-kit.ts` importa as 15 peças e o `Hud` v2 as aplica como `--ck-<peça>: url(...)` no `#hud` (mais `data-kit="circuit-v1"`). O CSS usa as variáveis em `border-image` (9-slice) com os insets do `metadata.json` × 2:

| Peça | Onde |
|---|---|
| `panel_9slice` (fatias 32/8/31/8 → 64/16/62/16 px) | todos os painéis v2: Digivice, Configurações, Mapa-múndi, Missões etc. A faixa clara de cima do PNG vira o cabeçalho (48 px), e o corpo é a parte escura |
| `button_normal/hover/pressed/locked` (5 → 10 px) | `.dg-cta`: Despertar, Coletar, Viajar; `:disabled` usa `button_locked`. As abas das Conquistas usam o normal, o pressed na aba ativa e o locked em Social |
| `icon_frame_tier1/2/3` (4 → 8 px) | atalhos do arco (raro; P1/P2 comum; lendário no hover), linhas de conquista (comum, rara + filete âmbar na pronta para coletar), retrato do chefão (lendário, 64 px = 2× exato), banner, estados bloqueados, POIs e painel lateral do mapa |
| `bar_frame` + `bar_fill_xp` / `bar_fill_hp` | barras das conquistas (XP ciano) e PV do chefão (`bar_fill_hp` tingido de blood `#e8465f`, como o kit pede para o crítico) |
| `divider` | sob "Ranking local" e os outros subtítulos `.dg-sub` |
| `digivice_emblem` (24 → 48 px) | centro do hub; o aro e o arco do chefe continuam em SVG |
| `notification_badge` (16 px, 1×) | pips do hub, novidade nos atalhos do arco e nas abas |

O CSS provisório saiu: o chanfro por `clip-path` dos painéis, os traços de circuito em gradiente (`--dg-circuit`, `--chamfer8`) e o emblema desenhado em SVG.

## Verificação

Rodada no worktree limpo (`/tmp/wmverify`, commit `633ee1c`):

- `tsc --noEmit`: ok.
- `npm test --maxWorkers=4`: **428/428** (44 arquivos), incluindo os do feedback1 (viagem, último mapa da região, Arena), `regions.test` e `arena-ui.test`, que somam 35 e estão verdes sem mudança.
- `npm run build`: ok.
- `map:validate`: 6/6 PASS, 0 FAIL.
- `node scripts/encounters/sim.mjs --check`: ok (19 entradas, 7 áreas).
- Testes novos (`tests/worldmap-v2.test.ts`, 8): sem a flag fica o grafo v1; ilustração e coordenadas do JSON (um POI por região, glifo pelo tipo, 5 rotas); estado de cada POI igual a `unlockState`/`canTravel` em 3 níveis de Tamer, com o cadeado na linha 1; painel lateral (nome, nível, espécies, requisitos, estado, Viajar ligado ou desligado, Arena); trocar de destino, que sobrevive ao re-render e volta ao "aqui" depois da viagem; todas as peças entram como `--ck-*` só com a flag e o emblema do kit vai no hub; o CSS usa só peças do kit, sempre em `.hud-v2`, com os insets do metadata; as cores dos botões vencem `#hud button`. `tests/hud-v2.test.ts`: sem a flag não há `--ck-*` nem `data-kit`.
- Viagem real no navegador (5191): Floresta → Vila → Floresta pelo painel lateral, com `mapId` conferido a cada passo (`kit_capture.json` → `worldmap.travel`).

## Arquivos (`quality-overhaul/phase3/hud/`)

- Mapa-múndi: `wm_aberto_{dia,noite}.png` (abre em "aqui"), `wm_praia_{dia,noite}.png` (destino liberado, com Viajar), `wm_bloqueada_montanha_dia.png` (bloqueado: requisito não cumprido e botão travado), `wm_na_vila_dia.png` (depois de viajar: Vila = aqui), `wm_volta_floresta_dia.png` e `wm_sem_flag_v1_dia.png` (referência: grafo v1 inalterado).
- Painéis com o kit (mesmos estados das capturas `dg_*` anteriores, para comparar): `kit_fechado_*`, `kit_aberto_*` (+ `_canto`), `kit_chefe_{1..4}_*`, `kit_fechado_chefe_ativo_*_canto`, `kit_conquistas_*`, `kit_bloqueado_guilda_dia`, `kit_configuracoes_{dia,noite}` e `kit_digivice.webm` (1280×720, VP8).
- `kit_capture.json`: o estado de cada captura, inclusive os POIs e a viagem.

## Limitações

- Os POIs assados no `worldmap_v1.png` (estado de demonstração) ficam embaixo dos dinâmicos. Na Vila sobra um pontinho do selo assado acima do POI. Uma versão do PNG sem marcadores resolveria (pedido ao game-art).
- A ilustração é 640×360 em 2×. Abaixo de ~1500 px de largura ela encolhe com escala não inteira, e os pixels ficam desiguais.
- O kit foi desenhado para 320×180. Usei 2× em painéis, botões, molduras e barras; o selo de notificação ficou em 1× (em 2× ocuparia meio hub). A mistura de escalas aparece nos pips.
- `panel_9slice` tem duas faixas de cor (clara em cima, escura embaixo). Usei a clara como faixa de cabeçalho de 64 px, uma interpretação minha. Se a intenção for outra, mudam só as fatias.
- A moldura lendária tem um ornamento no meio da borda que estica em caixas largas, por isso ela só é usada em tamanhos próximos de 2× (retrato, POI, hover do atalho).
- Os nomes das regiões vêm do `regions.json` do jogo (o PNG não tem texto). As espécies no painel lateral são as do JSON, sem sprite.
- O bloco do Tamer, a hotbar e a barra inferior do HUD v2 não usam o kit: a tarefa era o Digivice e os painéis.
- PV do chefão: `bar_fill_hp` (verde) multiplicado por blood fica vermelho-escuro, quase marrom. Uma textura vermelha no kit, ou só a cor sólida, ficaria mais limpa.
- As capturas do mapa-múndi usam o save de teste com o Tamer no Nv.12, por isso a Praia aparece liberada; num jogo novo (Nv.1) ela fica bloqueada.
