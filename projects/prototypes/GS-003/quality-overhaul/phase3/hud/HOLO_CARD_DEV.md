# GS-003 QO fase 3 — Correções do QA do HUD v2 + ficha holográfica do parceiro (`?hud=v2`)

- **Autor:** game-dev · **Data:** 2026-11-10 · **Branch:** `quality-overhaul` (worktree `workspaces/game-dev/qo`), servidor da branch na 5190 (a 5174 não foi usada). **0 gerações PixelLab.**
- **Origem:** `quality-overhaul/phase3/qa/QA_HUD_FB1_COMPARE.md` (P1 arco, P1 bots, P2 Tamer 120 px, P2 grama alta) e `quality-overhaul/phase3/design/VIDEO_IDEAS_SPEC.md` §3 (P0, ficha holográfica + árvore com %).
- **Retomada:** a sessão anterior caiu por limite de uso sem entregar; o trabalho não commitado dela (holo-card.ts, CSS da ficha, `boostEncGrass`, 1º ajuste do arco) foi mantido e continuado — nada foi descartado. Mudança de rumo sobre ele: o 7º atalho "Ficha do parceiro" no arco **saiu** (ver §1.1).
- **Tudo atrás de `?hud=v2`.** Sem a flag: sem ficha, sem retrato clicável, grade de cor do mapa como estava, Tamer/arco não existem (teste `holo-card.test.ts` "sem a flag…").
- **Legenda:** [E] evidência (arquivo/teste/captura) · [H] hipótese/julgamento.

## 1. Correções do QA

### 1.1 Arco do Digivice (P1) — agora lê como arco em volta do hub
| | Antes (`e4c1a2a`) | Depois |
|---|---|---|
| Centro do arco | o hub | o hub (a 1ª tentativa da sessão anterior deslocava o centro; lia como curva solta, longe do hub — rejeitada após captura) |
| Abertura | 90° (90°→180°) | **94° (90°→184°)**, última ponta na altura do hub, sem encostar na faixa de bits |
| Raio | 120 px | **140 px**, vizinhos a ~46 px (caixa de 36) |
| Atalhos | 6 | **6** (um 7º — "Ficha do parceiro", da sessão anterior — apertava os vizinhos para ~38–42 px; a ficha abre pelo retrato do parceiro) |
| Leitura de curva | só posição de caixas | **trilho de circuito** SVG (`.dg-rail`, `arcRailPath()`: mesmo círculo, 6° além de cada ponta, ciano tracejado com halo escuro) que liga os 6 ícones e só aparece com o hub aberto |

- [E] `src/ui/digivice.ts` (`ARC_*`, `arcRailPath`, `digiviceHudHtml`), CSS `.dg-rail*`, `.dg-caption` (top 196 px).
- [E] Teste `digivice.test.ts` "arco…": raio 138–142, nenhuma ponta à direita do hub nem acima de −16 px, abertura > 90°, vizinhos > 42 px, **flecha da curva > 35 px** (distância do atalho do meio à corda entre as pontas) e o `d` do trilho no DOM.
- [E] Capturas `fix_aberto_dia(_canto).png`, `fix_aberto_noite(_canto).png` (antes: `dg_aberto_*`/`kit_aberto_*`).
- [H] A tecla H continua (P2 do QA, decisão de spec, não reaberta aqui).

### 1.2 Ranking do Chefe Mundial com bots rotulados (P1)
- Decisão do coordenador (jogo local): bots ficam, sempre rotulados. O código já marcava cada linha de bot com **"BOT · simulado"** e a nota de rodapé "os outros nomes são **bots locais**, não jogadores" (`digivice.ts` `bossRanking`/painel). Nada mudou no comportamento; reconfirmado em captura nova com o arco corrigido: `fix_chefe_2_ativo_dia.png`/`_noite.png` [E]. Testes do Chefe Mundial seguem verdes.
- Pendente fora do código: `PANELS_SPEC.md` §5 ainda diz "nunca mostrar nomes" — cabe ao game-design anotar a exceção "bots rotulados enquanto não há servidor".

### 1.3 Bloco do Tamer com 120 px (P2)
- `.hud-tamer` 136 → **120 px** por fora (medido em tela: `tamerWidth: 120` em `hc_capture.json`). Para caber: padding 4→2 px e **barras de PV/Energia 68→58 px** (48 retrato + 4 gap + 2×2 padding + 2×3 borda = 62; sobram 58). A spec fixa 120 por fora **e** 68 nas barras, o que não cabe; prevaleceu a medida externa (pedido do coordenador). Capturas `hc_tamer_barra_dia/noite.png`.

### 1.4 Grama alta com saturação distinta (P2)
- `boostEncGrass()` (`render/look.ts`): no v2 o main grada as touceiras de encontro (`fp9_enc_grass_*`, `fp4_tall_grass_*`, mesmas chaves do `ENC_GRASS_RE`) com **saturationMul × 1,1** sobre a regra que já valia para elas; o resto do look é idêntico e o objeto original não é tocado.
- [E] Teste `hud-v2.test.ts` "grama alta +10%": multiplicador exato, outras chaves com a mesma regra, e um pixel verde da touceira sai mais saturado.
- [E] Capturas `hc_grama_v1_dia(.png|_centro.png)` × `hc_grama_v2_dia(…)`. **Limitação:** a diferença a olho é sutil (+10% é o que a spec pede) e uma medição por pixel entre os dois quadros não isola a grama — vento, água e criaturas também mudam entre capturas (razão de saturação dos pixels diferentes ≈ 0,99, inconclusiva). A prova é o teste unitário, não a captura.

## 2. Ficha holográfica + árvore de evolução com % (VIDEO_IDEAS_SPEC §3, P0)

**Onde abre:** clique no bloco do parceiro na barra inferior (cursor/realce, title "Ficha do parceiro"). Esc, H e as teclas de painel fecham; abrir a ficha fecha o hub, os painéis do Digivice, o Equipe & Box e as telas do main. `src/ui/holo-card.ts` (HTML puro) + `Hud.openHolo/renderHolo` (redesenha quando nível, PV, XP, stats ou preferências mudam).

**Aba Ficha** (`hc_ficha_dia/noite(_painel).png`, `hc_ficha_ramo_nv20_dia_painel.png`): retrato 96 px num **anel de scanner** (CSS: varredura `conic-gradient` girando a 3,2 s, scanlines, duplo aro ciano; parada com `prefers-reduced-motion`), nome/nível, chips de estágio/atributo/espécie, PV e XP, 4 atributos com barra do kit, afinidade lida do `affinityChart` (bate forte / sofre mais / resiste, com o multiplicador), e um botão "Próxima evolução" com o anel de % do melhor caminho e o que falta, que leva à árvore.

**Aba Evolução** (`hc_arvore_*`): nós = espécies do content pack; até 2 formas anteriores e 3 estágios à frente; arestas em traço de circuito (degrau no meio), passadas em cinza, à frente tracejadas, elegíveis em dourado. Cada nó à frente: moldura do kit (frame1/2/3), nome, estágio, **anel de % de 24 px**, o que falta escrito no próprio nó (vermelho, `REQ_PT`), "Preferido" quando o Auto-evoluir aponta para ele, e o botão **Evoluir** no nó elegível quando a evolução está liberada (mesmo `data-act="evolve"` do HUD). Hover/foco abre um tooltip com cada requisito ✓/✗, o ramo de origem e o aviso "contra os atributos de hoje" nos estágios 2+; na última coluna ele abre para a esquerda.

**Critérios de aceite da spec:**
| Critério | Status |
|---|---|
| % só de `pathStatuses()`/`ReqCheck` | [E] `pathPct` = Σ min(have/need,1)/n truncado; teste compara cada nó com `pathPct(pathStatuses(...))` |
| `eligible` ⇒ 100% (e não-elegível nunca 100) | [E] teste; não-elegível com tudo cumprido (alvo sem espécie) fica em 99 |
| O que falta acessível do nó, sem 3º menu | [E] texto no nó + tooltip; teste confere o texto `missingText` em cada nó |
| Ramificação via `forksAhead`, nada hardcoded | [E] teste: `node.fork` ⇔ `forksAhead()`; linhas dos filhos distintas, pai no meio |
| Cadeado de traço (item 2 da spec) | **não feito** — depende dos traços (afeto/disciplina) que a sim não tem |

**Capturas da árvore:** Guilmon Nv.5 (linha sem ramo, Growlmon 31%), e Agumon via `__gs003.setPartner` — Nv.10 (ramo Greymon 62% / GeoGreymon 67%, com o que falta e tooltip) e Nv.20 (os dois em 100% dourado com Evoluir), dia e noite.

**Observação sobre a spec:** o exemplo do §3 ("Nível 12/16 e ATK 40/55 ≈ 61%") não bate com a própria fórmula: (0,75 + 0,727)/2 = **73,8%**. O código segue a fórmula (teste usa esse caso e espera 73); o exemplo da spec deveria ser corrigido.

## 3. Gates (rodados nesta sessão, no worktree)
- `npx vitest run`: **46 arquivos, 439 testes verdes** (era 432; +6 em `holo-card.test.ts`, +1 grama em `hud-v2.test.ts`, asserções de arco/trilho reescritas no teste existente; os 3 testes do Digivice que o trabalho anterior deixou vermelhos foram resolvidos).
- `npm run build` (tsc + vite): ok. `npm run map:validate`: 6/6 PASS. `node scripts/encounters/sim.mjs --check`: ok (19 entradas, 7 áreas).

## 4. Arquivos
- Código: `prototype/world/src/ui/holo-card.ts` (novo), `ui/hud.ts`, `ui/digivice.ts`, `render/look.ts`, `main.ts`, `style.css`.
- Testes: `tests/holo-card.test.ts` (novo), `tests/digivice.test.ts`, `tests/hud-v2.test.ts`.
- Capturas: `scripts/hc-capture.mjs` (novo) → `phase3/hud/hc_*.png` + `hc_capture.json`; `PREFIX=fix_ node scripts/dg-capture.mjs shots` → `phase3/hud/fix_*.png` + `fix_capture_shots.json`. Todas 1920×1080 (os `_canto`/`_painel`/`_barra`/`_centro` são recortes sem escala).

## 5. Limitações
- GeoGreymon (e qualquer espécie sem sprite no pack) aparece com "?" na moldura — falta de arte, não de dado.
- Estágios 2+ usam os atributos de hoje como referência (dito no nó e no tooltip); a sim não projeta stats futuros.
- Sem cadeado de traço (depende do item 2 da spec). Retrato do Tamer continua placeholder (condição 1 do QA anterior, inalterada).
- A ficha só mostra o parceiro ativo; não há atalho para ela no arco nem no Equipe & Box (o retrato é o único acesso). [H] se o QA achar pouco descobrível, a saída mais barata é um botão "Ficha" no Equipe & Box, não um 7º atalho no arco.
- Não gravei WebM novo; as capturas são estáticas.
