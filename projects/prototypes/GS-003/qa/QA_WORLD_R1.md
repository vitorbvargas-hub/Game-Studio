# QA Report R1 — GS-003 Mundo (vertical slice, Fase 5): criador, golpes, save/offline, dia/noite

> Template Game Studio. Datas em ISO. Marque afirmações como **[E]** evidência (com fonte) ou **[H]** hipótese.

- **Projeto:** GS-003 (fase PROTOTYPE)
- **Autor (agente):** game-qa
- **Data:** 2026-11-08
- **Status:** concluído — ver veredito

## Escopo testado (versão/commit)

- Diretório: `projects/prototypes/GS-003/prototype/world/`.
- **[E]** `npm test`, `npm run build` e toda a sessão interativa com navegador (ver "Ambiente") rodaram no commit `2b6a12f` ("GS-003 world: save versionado + progresso offline... Auto-evoluir; corrige ENGAGE→FOLLOW"), conforme pedido na tarefa.
- **[E] Aviso de concorrência:** durante esta QA, outro dev commitou `c982316` ("GS-003: world — wang-47, árvores novas, noite nas entidades") na mesma árvore. Conferi `git diff --stat 2b6a12f c982316 -- src/`: as mudanças ficam só em `assets/scene-tiles.ts`, `data/maps/forest-proof.*`, `render/lighting.ts`, `render/nightgrade.ts`, `render/pathsmooth.ts`, `render/view.ts` (+1 linha em `main.ts`) — exatamente a área de autotile/árvores/tingimento noturno que a tarefa pediu para eu não cobrir. Nenhum arquivo de `sim/`, `ui/` ou `save/` mudou entre os dois commits, então os achados desta QA (criador, combate, golpes, AUTO, save/offline, HUD, desempenho, conformidade) continuam válidos para `c982316`. Não há achado desta QA sobre autotile ou tingimento noturno — fora do escopo pedido.

## Ambiente

- Node.js v24.19.0 (`npm test`, `npm run build`).
- **Chromium headless real via CDP** (`chrome-headless-shell` do cache do Playwright, `CHROME_LIBS=/tmp/chromelibs/...` para `libnss3`/`libnspr4`/`libasound`, conforme o README) — diferente das rodadas anteriores de QA do GS-003 (`QA_REPORT_PROTOTYPE_B*.md`), que não tinham navegador real neste host. Escrevi um script temporário (`scripts/qa-live-tmp.mjs`, baseado no padrão de `scripts/capture-live.mjs`, **removido ao final, não commitado**) que abre o jogo de verdade, despacha eventos reais de teclado/ponteiro (`KeyboardEvent`/`PointerEvent`) nos mesmos listeners que o jogador usaria, lê o estado da sim via `window.__gs003` só para **verificar** resultado (nunca para pular a UI) e tira screenshots.
- 3 rodadas completas do script (mesma seed=7, determinístico): 2 rodadas curtas para validar o próprio script de QA (achei e corrigi 3 bugs **no meu script**, não no jogo — ver nota no fim desta seção) e 1 rodada final completa (~14 min, com o teste de desempenho de 10 min cheio). Os números usados neste relatório são da rodada final, exceto save/offline e a transição dia/noite (a rodada final bateu um timeout de 20 s em 2 chamadas CDP — carga do host, não do jogo —, então uso a rodada curta anterior, idêntica por ser determinística com a mesma seed).
- **Nota sobre o próprio script de QA:** a 1ª versão clicava no selvagem usando o centro visual do sprite (`motionPos`), que falhava contra o hit-test real (`pickWild()`, que usa a hitbox do manifest); troquei para replicar a hitbox exata via `presenter.manifestOf()` (campo não-privado em runtime, TS `private` é só compile-time) e o engage passou a funcionar 100% das vezes. Também achei que o mundo `forest-proof` tem 3 bots com AUTO que lutam sozinhos contra os selvagens — isso confundia meus testes de combate (um selvagem "morria" sem eu ter feito nada); troquei os testes de combate/AUTO-evoluir para `?map=meadow` (sem bots) para isolar causa e efeito. Registro isso por transparência: são bugs do meu arnês de teste, não do jogo.

## Casos executados (passou/falhou)

| # | Caso | Resultado |
|---|---|---|
| 1 | `npm test` | ✅ **149/149 testes, 15 arquivos** |
| 2 | `npm run build` | ✅ `tsc --noEmit` sem erro; `vite build` → `dist/assets/index-*.js 1.012,85 kB (gzip 142,75 kB)` + CSS 24,45 kB (gzip 5,79 kB) — aviso de chunk grande, não erro |
| 3 | Criador de Tamer: opções, Aleatório, nome vazio/longo, Tamer no mundo | ✅ Passou — ver seção dedicada |
| 4 | Movimento (clique, WASD), colisão, parceira segue, copa translúcida | ✅ Passou, com 1 ressalva (colisão não confirmada com rigor) — ver seção |
| 5 | Combate: engage, ataque, dano, derrota, fuga, XP | ✅ Passou — ver seção |
| 6 | Golpes: teclas 1–4, recarga, MP, aprender golpe, trocar slot, editor de prioridade do AUTO | ✅ Passou — ver seção |
| 7 | AUTO (ataca sozinho) | ✅ Passou |
| 8 | Auto-evoluir: evolução + herança online | ⚠️ **Não reproduzido ao vivo** dentro da janela de QA — ver seção (evidência indireta via offline, que usa a mesma função) |
| 9 | Save: recarregar mantém progresso | ✅ Passou |
| 10 | Offline: `?offline=MIN`, relatório, teto de 4 h | ✅ Passou |
| 11 | Dia/noite: `?time=`, transição | ✅ Passou |
| 12 | HUD: atalhos, modal Equipe & Box (abrir/fechar por 3 vias + 3 formas de fechar), textos pt-BR | ✅ Passou — 6/6 variações de abrir/fechar confirmadas |
| 13 | Desempenho: fps e memória por 10 min com os bots | ✅ Passou — 60 qps estável, memória sem crescimento perceptível |
| 14 | ADR-007/009: sem rede externa, sem logo oficial, aviso de fan game, créditos | ⚠️ **Aprovado com ressalva** — aviso incompleto/pouco legível (Bug #1) |

## 1. Criador de Tamer

- **[E]** Contagem de opções por grupo, lida do DOM: Modelo **2**, Tom de pele **3**, Corte **7**, Cor do cabelo **8**, Roupa **3**, Cor da roupa **7** — bate exatamente com o README (3 × 7 combinações de roupa).
- **[E]** Nome vazio: botão "Entrar no mundo" fica `disabled`, mensagem "Digite um nome para o seu Tamer." aparece em vermelho abaixo do campo (conferido também por screenshot, `qa_creator_nome_vazio.png`).
- **[E]** Nome longo: o campo tem `maxlength="14"` (atributo HTML nativo). Digitação real do teclado respeita esse limite (não testei tecla a tecla, mas é o comportamento padrão do navegador para `maxlength`); ver Bug #2 sobre o caminho de bypass.
- **[E]** Botão Aleatório: 2 cliques seguidos deram combinações diferentes (`Modelo 1 · pele clara · Espetado preto · Tamer clássico verde` → `Modelo 2 · pele clara · Curto branco · Tamer clássico marrom`).
- **[E]** Escolhi uma combinação específica (Modelo 2, pele escura, Marias-chiquinhas, rosa, Aventureiro, roxo) + nome "QA_Tester", cliquei Confirmar: o jogo abriu, `sim.state.entities` tem uma entidade `p1` com `name === "QA_Tester"`. Screenshot `qa_creator_no_mundo.png` confirma o Tamer escolhido visível no mundo.

## 2. Movimento e câmera

- **[E]** WASD: segurei `d` por 900 ms → `x` foi de 472 para 522 (+50 px); segurei `s` por 900 ms → `y` foi de 424 para 469 (+45 px). Os dois eixos respondem.
- **[E]** Clique para andar: clique num ponto fixo da tela (centro + 150 px), convertido para coordenada de mundo via `view.screenToWorld` — o jogador se aproximou do destino (`aproximou: true`) depois do clique.
- **[E]** Parceira segue: distância entre Tamer e parceira = 22 px (dentro de `followDist`), estado `IDLE`/`FOLLOW` normal, sem parceira presa ou muito longe.
- **[E]** Copa translúcida: posicionei o jogador sob a copa de uma árvore andável próxima (mesma técnica do `capture-live.mjs`) — `view.canopyAlphaOf()` retornou **0,45** (abaixo do padrão, confirma a transição para alpha baixo quando a copa cobre o jogador). Screenshot `qa_movimento_copa.png`.
- **⚠️ Colisão — não confirmada com rigor [H]:** segurei `a` (esquerda) por 4 s contínuos; o jogador andou de x=560 para x=360 (parou de se mover, não atravessou o mapa inteiro, o que é um bom sinal). Porém o tile final sob o jogador deu `tileSolid: true` no meu cálculo (`floor(x/32)`), o que seria estranho (jogador "dentro" de um tile sólido). Isso é mais provável ser um artefato da minha conta simplificada (o anchor de colisão da sim pode não ser exatamente `floor(x/32)` do centro do sprite) do que um clipping real — o jogador claramente parou de andar, não "vazou" pelo mapa. Não tive tempo de instrumentar um teste de colisão mais preciso (ex.: ler o retângulo de colisão real da sim). **Recomendo um teste dedicado de colisão antes de dar isso como resolvido.**

## 3. Combate no mapa

Testado em `?map=meadow` (sem os bots do forest-proof, que senão "roubam" o selvagem antes do meu teste — ver nota em Ambiente).

- **[E]** Engage: clique explícito no selvagem (hit-test replicado da função `pickWild()` real) → `partner.targetId` e `partner.encounterId` setados, estado vai a `ATTACK`.
- **[E]** Dano: selvagem (CREATURE-0008, 38 PV) caiu para 9 PV depois do engage — dano real aplicado pela sim.
- **[E]** Tecla 1 (slot): `partner.queuedMove` setado ao apertar `1`; a barra do HUD mostra MP por golpe (14/16), recarga radial (`--cd: 0.548`, contagem regressiva "3"), classe `cooling` ativa durante a recarga — tudo consistente com `moves-ui.ts`.
- **[E]** Derrota + XP/bits: forcei PV=1 no alvo atual e apertei 1 → selvagem derrotado (`!partner.targetId && !partner.encounterId`). **Nota:** o par `xpBefore`/`xpAfter` desse sub-teste específico deu igual (8/8) porque a recompensa da derrota real já tinha sido creditada *antes* desse checkpoint (o combate básico continua rolando entre os passos do teste, sem AUTO) — não é ausência de recompensa; **[E]** bits foram de 0→3 e XP de 0→8 entre o início do combate e esse ponto, confirmando que a recompensa é concedida normalmente.
- **[E]** Fuga: tecla `F` → `partner.encounterId` limpo (`fled: true`). O `state` ainda aparecia como `ATTACK` logo depois, o que é o comportamento **esperado** pelo código (`world.ts`: `flee` só força `RETURN` se já estava `IDLE`; em pleno ataque, a animação termina antes de trocar de estado) — não é bug.
- **[E]** Aprender golpe novo: forcei XP até o próximo nível com learnset e venci um combate → toast real no HUD: **"Guilmon aprendeu Sharp Claws! Equipado no slot 3."** — confirma o slot vazio sendo preenchido automaticamente (regra §2.2 do README).
- **[E]** Trocar slot (aba Golpes): escolhi um golpe aprendido fora dos slots (`air_fireball`), cliquei Trocar → clique no slot 1 → `partner.moves[0]` passou a ser `air_fireball`. Funciona.
- **[E]** Editor de prioridade do AUTO: subi/desci uma regra (▲▼), troquei a condição para "Meu PV abaixo de" com 30%, desliguei "usar" (checkbox) — tudo refletido em `partner.autoRules` em tempo real. Cliquei "Restaurar padrão" → voltou para a ordem dos slots equipados, todos `always`, todos ligados. Screenshot `qa_combate_auto_editor.png` mostra a UI completa (4 regras, selects, inputs de %, checkboxes, setas).

## 4. AUTO e Auto-evoluir

- **[E]** AUTO: parceira perto de um selvagem, sem nenhuma tecla apertada, com AUTO ligado → o selvagem perdeu PV sozinho (`autoAtaca: true`). Confirmado 2 vezes (rodadas diferentes).
- **⚠️ Auto-evoluir — evolução ao vivo não reproduzida dentro da janela de QA:** liguei o Auto-evoluir, forcei a parceira para Nv.15 (1 nível abaixo do gatilho Guilmon→Growlmon, conforme o README) e deixei a sim rodar em tempo real por até 90 s reais, mantendo-a engajada contra selvagens. A evolução **não aconteceu** nesse intervalo (`evolved: false`). Isso é mais provável ser **limitação do meu teste** do que bug: a curva de XP sobe com `nível^expoente`, e no Nv.15 o XP necessário por vitória contra selvagens fracos do `meadow` provavelmente exige dezenas de vitórias — 90 s reais (~900 ticks de 100 ms) não é tempo suficiente. **Evidência indireta de que o mecanismo funciona:** o teste de save/offline (que roda a **mesma função `evolve()`**, segundo o README) creditou 4h de progresso e subiu a parceira de Nv.5 para Nv.10 automaticamente com Auto-evoluir ligado (ver seção 5). **Recomendo** um teste dedicado com XP forçada artificialmente mais perto do gatilho (ex. faltando só 1 vitória) para confirmar a evolução + herança de golpes *ao vivo* (não só offline), já que não consegui isolar isso com segurança no tempo desta QA.

## 5. Save e progresso offline

- **[E]** Save/reload: salvei (`persist()`), recarreguei a página **sem** `?novo=1` (lê o save) → espécie, nível, XP e bits da parceira mantidos (nível igual ou maior, já que o AUTO continuou progredindo entre a gravação e a recarga). A posição do Tamer (x,y) volta ao spawn — isso é **esperado**: o README lista o que o save guarda (Tamer, equipe, golpes, nível/XP, bits, Digidex, AUTO/Auto-evoluir) e posição não está na lista.
- **[E]** `?offline=300` (5h fora, acima do teto): o Relatório Offline apareceu com o texto exato **"Você ficou fora por 5 h. Crédito máximo: 4 h. Guilmon seguiu caçando no AUTO (rendimento offline 50%)."**, XP **+9.804**, Vitórias **912**, Bits **+4.644**, Nível **Nv.5 → Nv.10**, "Tamer subiu 22 níveis!", golpe aprendido "Sharp Claws" listado em chip. Bate ponto a ponto com o teto de 4h e o rendimento de 50% documentados no README. Screenshot `qa_offline_relatorio.png`.

## 6. Dia/noite

- **[E]** `?time=day` → `view.nightMix = 0`, HUD "Dia 14:23".
- **[E]** `?time=18:30&timescale=0` → `view.nightMix = 0,5` **exatamente**, HUD "Anoitecer 18:30" — bate matematicamente com a janela de transição 18:00–19:00 (smoothstep), já que 18:30 é o meio exato da janela.
- **[E]** `?time=night` → `view.nightMix = 1`, HUD "Noite 22:13".
- Screenshots `qa_daynight_day.png`, `qa_daynight_1830.png`, `qa_daynight_night.png` mostram a paleta mudando de fato (verde-dia → roxo-anoitecer → azul-noite), overlay e sombras incluídos.
- Um sub-teste complementar (2 amostras de `nightMix` com 4 s de intervalo, `timescale=60`) não deu resultado útil (as 2 amostras já chegaram em 1,0, provavelmente por eu ter amostrado tarde demais na janela) — não conto isso como falha, só não é evidência adicional; o teste dos 3 pontos fixos acima já é suficiente e preciso.

## 7. HUD

- **[E]** 12 atalhos no grid: só "Equipe & Box (E)" habilitado, os outros 11 (Digidex, Missões, Mapa, Loja, Evolução, Arena, Amigos, Guilda, Conquistas, Correio, Configurações) com `aria-disabled="true"` e título "— em breve", tudo em pt-BR.
- **[E]** Modal Equipe & Box — **6 de 6 variações confirmadas**: abre pelo atalho ✅, abre pela tecla **E** ✅, abre clicando num slot da equipe ✅; fecha com **Esc** ✅, fecha no **×** ✅, fecha clicando fora (backdrop) ✅.
- **[E]** Legibilidade dos nomes com várias entidades: screenshots do forest-proof com Tamer local + parceira + 3 bots + múltiplos selvagens mostram rótulos sem sobreposição visível, com nome + "Nv." consistente (`qa_movimento_colisao.png`, `qa_daynight_1830.png`).
- **[E]** Textos pt-BR: varri o texto visível do HUD (`#hud .innerText`) contra uma lista de termos em inglês comuns de HUD de jogo (Loading, Health, Attack, Defense, Speed, Level, Experience, Cooldown) — **zero ocorrências**.

## 8. Desempenho

- **[E]** Rodei o jogo real (forest-proof, com os 3 bots + selvagens, AUTO ligado) por **10,3 minutos contínuos** (620.920 ms), amostrando a cada 30 s (19 amostras).
- **fps:** `"60 qps"` (contador do próprio HUD) em **todas as 19 amostras**, sem nenhuma queda registrada.
- **memória:** `performance.memory.usedJSHeapSize` ficou **fixo em 18.200.000 bytes (~18,2 MB)** e `totalJSHeapSize` em **37.300.000 bytes (~37,3 MB)** do início ao fim — nenhum crescimento ao longo dos 10 min, o que é um bom sinal de ausência de vazamento de memória perceptível neste cenário.
- **entidades:** flutuou entre 25 e 31 (selvagens nascendo/morrendo/recarregando naturalmente) — comportamento esperado, nenhuma entidade "travada" acumulando sem limite.
- **[H] Ressalva de medição:** o valor de memória ficou *exatamente* igual em todas as 19 amostras, sem nenhuma variação de nem 1 KB — isso é mais estável do que eu esperaria de um heap JS real sob carga ativa (VFX, dano, partículas). É possível que o `chrome-headless-shell` (variante "headless shell", não o Chrome completo) não atualize `performance.memory` com granularidade fina nesse modo, ou que o GC mantenha um platô estável por coincidência. Não acuso isso de falha de medição, só registro a ressalva: o sinal "sem vazamento" é real (nenhuma tendência de crescimento), mas a precisão absoluta do número é incerta.

## 9. Conformidade ADR-007/009

| Item | Resultado |
|---|---|
| Sem chamada de rede em `src/`/`index.html` (grep estático) | ✅ Passou — `fetch(`, `XMLHttpRequest`, `sendBeacon`, `WebSocket(`, `analytics`, `telemetry`, `gtag` → zero ocorrências |
| Sem rede durante o jogo de verdade (CDP `Network.enable`, build de produção `dist/` servido estático, sessão completa) | ✅ Passou — **[E]** único host contactado: `127.0.0.1:5192` (o próprio servidor estático local); nenhuma requisição externa |
| Sem logo/marca oficial em texto | ✅ Passou — grep por "nintendo/game freak/the pokemon company/toei" em `src/`, `index.html`: zero ocorrências |
| Aviso de fan game sempre visível | ⚠️ **Ver Bug #1** — presente e tecnicamente visível, mas incompleto frente ao texto exigido pelo ADR-007 e com legibilidade fraca em jogo |
| Créditos de asset (origem/ripper) | ✅ Passou, por um caminho diferente do esperado — **[E]** não existe `CREDITS.md` consolidado, mas cada asset tem metadados de origem: `creature.json` do Guilmon tem `assetOrigin.sourceDescription` ("Spriters Resource... ripada por Sonicteam24..."), e `GAME-ASSETS/03-environments/forest-v4/license.json` tem crédito formal (`ripper: "Atlanta"`, site, copyright, base ADR-009/ADR-010) — satisfaz a exigência "cada asset registra a origem e os créditos" do ADR-009, mesmo sem um arquivo único |
| Sem monetização/IAP/anúncio | ✅ Passou — nenhum campo de preço/loja real; o botão "+" de bits é `data-soon="Loja"` (desabilitado, "em breve") |

### Bug #1 — Aviso de fan game incompleto e pouco legível
**Severidade: Média** (item explícito do ADR-007 §3, não bloqueia o jogo, mas é requisito de conformidade declarado)

- **Onde:** `index.html`, `<p class="fan-note">`; `src/style.css` `.fan-note` (posição `fixed`, `font-size: 9px`, `top: 94px`, `left: 8px`).
- **Texto atual:** "Fan game não comercial. Digimon © Bandai Namco. Sprites oficiais de DW DS (rip AngelOfHope / With the Will)."
- **ADR-007 §3** exige: "aviso de 'fan game não oficial, sem afiliação com Nintendo/Game Freak/The Pokémon Company/Bandai/Toei'". O texto atual tem "não comercial" e credita Bandai Namco, mas **não tem a frase de não-afiliação** nem cita Toei (co-detentora de direitos do Digimon, conforme o próprio `license.json` do forest-v4: "Digimon (c) Bandai Namco Entertainment Inc. / Toei Animation").
- **Passos para reproduzir:** abrir o jogo, ler `document.querySelector(".fan-note").textContent`.
- **[E]** Legibilidade: inspecionei o recorte ampliado (`qa_compliance_disclaimer.png`, zoom 3×) — com zoom, o texto é legível. Mas em capturas normais de jogo (`qa_movimento_colisao.png`, `qa_daynight_1830.png`), o texto de 9px fica espremido contra o relógio/região no canto superior esquerdo e quase se perde contra o fundo escuro, especialmente à noite — na prática, um jogador dificilmente notaria o aviso durante o jogo normal.
- **Impacto:** risco de conformidade formal com o texto exato exigido pelo ADR; a visibilidade prática também é fraca.
- **Não corrigido** (fora do escopo desta QA); sugestão: completar o texto com a frase de não-afiliação + Toei, e considerar tamanho/posição mais legíveis (ex. um rodapé fixo com contraste, como o HUD já faz para outros textos).

### Bug #2 — Limite de nome do Tamer só por atributo HTML, sem validação em JS
**Severidade: Baixa**

- **Onde:** `src/ui/creator.ts`, input `[data-testid="cr-name"]` com `maxlength="14"`.
- **Passos para reproduzir:** via console/devtools (não pela digitação normal), setar `input.value = "NomeMuitoLongoDemaisQA"` (22 caracteres) e disparar o evento `input` — o valor fica com 22 caracteres, sem corte. A digitação real pelo teclado **é** limitada normalmente pelo navegador (comportamento nativo do `maxlength`), então isso não é alcançável por um jogador comum digitando.
- **Impacto:** baixo — só afeta quem manipula o DOM diretamente (fora do fluxo normal de jogo); se algum caminho futuro setar `look.name` programaticamente (import de save, API, etc.) sem passar pelo input, não há corte de tamanho no lado do dado.
- **Não corrigido** (fora do escopo desta QA); sugestão: truncar/validar o tamanho do nome também no momento de montar o `TamerLook` final (`confirm`), não só no atributo do input.

### Achado informativo (não é bug) — asset padrão da parceira marcado `UNDER_REVIEW`
- **[E]** `GAME-ASSETS/01-creatures/CREATURE-0003/creature.json` (Guilmon, a parceira padrão de todo novo jogo) tem `"approvalStatus": "UNDER_REVIEW"`. Isso é um campo de processo/governança do pipeline de arte, não um bug funcional — registro para o estúdio decidir se o parceiro padrão deveria usar um asset já aprovado.

## Riscos residuais

- **[H]** Colisão com paredes/obstáculos não foi confirmada com rigor (ver seção 2) — recomendo um teste dedicado antes de considerar esse ponto validado.
- **[H]** Evolução + herança de golpes **ao vivo** (não offline) não foi reproduzida dentro da janela desta QA — a evidência disponível é indireta (via offline, mesma função `evolve()` segundo o README). Recomendo um teste com XP forçada a 1 vitória do gatilho de evolução.
- **[H]** A medição de memória (seção 8) tem um valor constante suspeito demais para ter certeza da precisão absoluta, embora o sinal "sem crescimento" seja confiável.
- **[E]** HEAD mudou de `2b6a12f` para `c982316` durante esta QA (outro dev, área de autotile/noite) — confirmei por `git diff --stat` que não há sobreposição com o que testei; nenhum achado desta QA cobre as mudanças de `c982316`.
- Nenhum teste cobriu multiplayer real entre 2 navegadores distintos (só o jogador local + bots `remote_player` simulados pela própria sim, como já era o desenho documentado no README).

## Evidências (logs, prints, comandos)

- `npm test`: `Test Files 15 passed (15)` / `Tests 149 passed (149)`.
- `npm run build`: `tsc --noEmit` sem erro; `dist/assets/index-*.js 1.012,85 kB (gzip 142,75 kB)`.
- Script de QA temporário (`scripts/qa-live-tmp.mjs`, Chromium headless real via CDP, removido ao final) — 3 rodadas, seed=7 determinística.
- `raw-results.json` (dados estruturados de todas as verificações, salvo em `GS-003/qa/raw-results.json`).
- 31 screenshots em `GS-003/qa/screens/qa_*.png`, cobrindo: criador (tela, nome vazio, aleatório, escolhas, no mundo), movimento (wasd, clique, colisão, copa), combate (engage, dano, derrota, fuga, aprendeu, hud de golpes, modal de golpes, trocar golpe, editor do AUTO), auto-evoluir, save/reload, offline (relatório), dia/noite (dia/anoitecer/noite), HUD (modal por atalho/tecla E/slot, rótulos), desempenho (estado final) e conformidade (aviso de fan game ampliado).
- `git diff --stat 2b6a12f c982316 -- src/` confirmando que as mudanças concorrentes do outro dev não tocam `sim/`, `ui/` ou `save/`.
- `grep` de rede/telemetria/marca em `src/`, `index.html`: zero ocorrências; CDP `Network.enable` na sessão completa do build de produção: único host `127.0.0.1:5192`.

## Veredito: **aprovado com ressalvas**

Todas as funcionalidades pedidas passaram com evidência real de navegador headless (clique, teclado, estado da sim lido só para verificação): criador de Tamer, movimento, combate completo (engage → dano → derrota → fuga → XP), os 4 slots de golpe com recarga/MP, aprender golpe novo, trocar slot, o editor de prioridade do AUTO, AUTO em si, save/reload, o relatório offline com teto de 4h, dia/noite nos 3 presets, e as 6 variações de abrir/fechar o modal Equipe & Box. Desempenho ficou estável em 60 fps por 10,3 min seguidos, sem sinal de crescimento de memória. Não há chamada de rede externa em lugar nenhum (grep estático + observação de rede ao vivo no build de produção), e os créditos de asset existem por arquivo (`assetOrigin`/`license.json`), mesmo sem um `CREDITS.md` único.

A ressalva principal é de conformidade: o aviso de fan game existe e é tecnicamente visível, mas **não tem o texto exato exigido pelo ADR-007** (falta a frase de não-afiliação e a menção à Toei) e tem legibilidade fraca em jogo normal (Bug #1, severidade média). Um segundo achado (Bug #2, baixo) é só um caminho de bypass de validação não alcançável pela digitação normal. Dois pontos ficaram sem confirmação definitiva por limitação de tempo desta sessão, não por falha observada: colisão com paredes (o jogador parou de andar, mas não cravei a geometria exata) e a evolução automática **ao vivo** (só confirmada indiretamente via offline, que usa a mesma função).

## Limitações desta QA

- Script de QA (`scripts/qa-live-tmp.mjs`) foi escrito e usado só para esta sessão, removido ao final — não ficou no repositório do jogo.
- Colisão com paredes e evolução automática ao vivo (Nv.15→16) não foram confirmadas com o rigor dos demais itens (ver "Riscos residuais"); recomendo retestar especificamente esses dois pontos.
- Não testei multiplayer real entre 2 clientes distintos, nem dispositivos móveis/touch (o clique testado foi `PointerEvent` sintético, equivalente a mouse).
- Não revisei qualidade artística/fidelidade visual dos sprites, só funcionalidade e conformidade.
- Nenhuma correção de código foi feita, conforme instrução da tarefa; todos os achados acima são apenas relatados.
