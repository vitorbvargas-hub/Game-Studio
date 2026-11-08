# GS-003: Arena de Ação e MMO-lite (viabilidade)

Autor: game-dev (subagente). Data: 2026-11-08. Status: **spike**, código descartável.
Escopo: fan game não comercial (ADR-007). Nada foi publicado nem contratado, e nenhum serviço externo foi criado.

Legenda: **[E]** evidência, com fonte e data ou com medição feita neste host. **[H]** hipótese ou estimativa.

---

## 0. O que o spike entrega

| Arquivo | Papel |
|---|---|
| `arena-spike/index.html` | Página separada. Com `npm run dev`, abre em `http://127.0.0.1:5173/arena-spike/` |
| `arena-spike/arena.ts` | **Simulação pura** da arena: passo fixo de 30 Hz, sem DOM, sem relógio e com RNG no estado. Também traz a IA |
| `arena-spike/render.ts` | Render em Canvas 2D de 320x180 (mesma resolução e escala inteira do jogo) |
| `arena-spike/main.ts` | Shell: teclado → `ArenaInput`, loop com acumulador e HUD em DOM |
| `arena-spike/arena.json` | Ajustes que só valem na arena (velocidade, alcance, multiplicador de HP, IA). Os packs não foram alterados |
| `arena-spike/arena.check.ts` + `vitest.config.ts` | 4 checagens headless, fora do `npm test` principal |
| `arena-spike/capture.ts` + `screens/*.png` | Capturas geradas com o render real numa luta de IA x IA |

Controles: WASD/setas para mover (8 direções), J/Espaço para o básico, K/E para o especial (sai na direção em que o lutador olha) e R para a revanche.
URL: `?p=agumon&e=patamon&lv=12&seed=3&pack=digimon-fan`. O padrão vem dos dados (`defaultMatchup`: primeiro par com sprite em que o jogador tem vantagem de afinidade; no pack atual, Gabumon x Agumon), Nv base da criatura.

Animações (2026-11-08): o render usa `anims` do pack — walk ao andar por input, attack no básico (`swing`) e no especial (evento `cast`), hit durante o `hitstun`, idle parado — e espelha o sprite quando o último lado horizontal é a esquerda. A escolha é só visual; a simulação ganhou apenas o campo `moving`. Capturas em `screens/` (inclui `arena_walk.png`).

Verificação [E] (2026-11-08, neste host):
- `npx tsc --noEmit -p arena-spike/tsconfig.json` passou sem erros.
- `npx vitest run --config arena-spike/vitest.config.ts`: 4/4. As checagens cobrem stats lidos do pack, determinismo por seed, vitória e derrota, básico com recarga e especial com projétil.
- `npm test` principal: 47/47 antes do spike e 47/47 depois. Às 11:15 o resultado era 7 arquivos e 60/60, porque outra sessão alterou `src/` e `tests/` durante este trabalho. O spike não escreve em `src/` nem em `tests/`. `npm run typecheck` também passou.
- `npm run dev` serve `/arena-spike/` e `/arena-spike/main.ts` com HTTP 200.
- Capturas em `screens/` (início, golpe básico, especial e fim). **Não testei com teclado num navegador real**: o Chromium headless não roda neste host (veja `scripts/capture-screens.ts`). O sentimento do controle não foi validado.
- Balanceamento IA x IA, 200 seeds, Nv 10: Gabumon x Agumon dá 97,5% de vitória para o Gabumon, com lutas de ~14 s. Agumon x Gabumon dá 8% de vitória para o Agumon (~18 s). A diferença vem do `affinityChart` do pack (dado → vacina = 1,25x; vacina → dado = 0,8x). Para ação em tempo real, esse multiplicador é forte demais [H].
- Custo da simulação: **0,16 µs por tick** da arena (2 lutadores com IA) e **0,43 µs por tick** do idle (`stepN`), num Ryzen 5 5500 com Node v24 sob vitest.

## 1. Como a arena reaproveita o motor e os packs

Reaproveitado sem alteração, por import direto de `src/`:
- **Packs e descoberta** (`src/packs.ts` → `loadPack`): a arena lê o mesmo `ContentBundle` validado e funciona com qualquer pack (`?pack=original-b`).
- **Stats**: `statsAtLevel(base, growth, nível, baseLevel)` de `creatures.json`. HP × `hpMult` (4) porque a ação precisa de mais acertos que o ATB.
- **Dano**: `computeDamage` (modelo `subtractive` do `balance.json` do digimon-fan), `affinityMult` (`theme.affinityChart`), variância e crítico do `balance.json`.
- **Habilidades**: o básico é `balance.basicSkillId` (`investida`). O especial é a primeira skill da criatura que não é a básica (Agumon → `baby_flame`, Gabumon → `petit_fire`). `cooldownTicks × balance.tickMs` vira milissegundos de recarga. Os `kind` `damage`, `heal` e `guard` têm tradução para 1v1: projétil, autocura e redução de dano.
- **RNG**: o mesmo mulberry32 (`src/sim/rng.ts`), com estado dentro do `ArenaState`.
- **Visual**: sprites idle do pack, paleta do `theme.json`, cores de afinidade e a fonte bitmap de dígitos (`src/render/pixelfont.ts`).

A arena seguiu as regras do motor: simulação pura, determinística e serializável, com o render só lendo o estado. Por isso ela já está no formato que um servidor autoritativo exige (§2).

Lacunas para virar modo de jogo [H]:
- Os packs não descrevem ação: alcance, forma (cone, projétil, área), velocidade, *startup/recovery* e hitbox. Proposta: um bloco opcional `action` em `skills.json` (por exemplo `{ "shape": "projectile", "speed": 170, "range": 220 }`), validado em `content.ts` com padrões para quem não declarar. Hoje isso está fixo em `arena.json`.
- Faltam sprites de andar e de ataque. Só existem 2 frames de idle, então o personagem desliza. A arte precisa seguir a regra de arte do ADR-007.
- A afinidade de 1,25x/0,8x decide a luta. A arena deve ter um `affinityChart` próprio ou um multiplicador amortecido.
- A IA é uma máquina de estados simples, sem desvio de projéteis nem pathfinding. Basta para PvE de treino, não para dar desafio.
- Faltam integração com o save (escolher entre os monstros do time e ganhar XP ou bits), menu, áudio e controle por toque e gamepad.

## 2. O que falta para PvP em tempo real

A simulação já é determinística e tem como único input um `ArenaInput` (`mx`, `my`, `basic`, `special`) por lutador e por tick, cerca de 1 byte compactado. Isso vale para os dois modelos de rede.

| Opção | Como funciona | Prós | Contras |
|---|---|---|---|
| **A. Servidor autoritativo + predição do cliente + reconciliação** (recomendado) | O servidor roda `stepArena` a 30 Hz e recebe inputs com número de tick. Envia snapshots (ou deltas) a ~15–20 Hz. O cliente prediz o próprio movimento, re-simula a partir do snapshot confirmado e interpola o oponente | Anti-trapaça natural, porque o servidor decide o dano. É o mesmo servidor do MMO-lite e não exige determinismo bit a bit entre máquinas | Há custo de servidor por partida. Acertos podem "voltar atrás" com ping alto, o que pede *lag compensation* nos projéteis |
| B. Rollback P2P (estilo GGPO) | Cada cliente roda a simulação inteira, prediz o input remoto e volta e re-simula quando o input real chega | Latência percebida mínima e sem servidor de jogo | Exige **determinismo bit a bit** entre navegadores e WebRTC com servidor de sinalização e TURN. Não tem anti-trapaça e não serve para MMO |
| C. Lockstep com atraso de input | Os dois esperam os inputs do tick N antes de simular | É simples | Com ~100–200 ms de atraso fixo, fica ruim para ação |

Trabalho que falta (opção A):
1. **Transporte**: WebSocket com servidor Node. WebRTC DataChannel (UDP) ou WebTransport ficam para depois [H].
2. **Protocolo**: `hello`/`join`, `input{tick, bits}`, `snapshot{tick, ackInputTick, fighters, projectiles}` e `event`. Mensagens binárias pequenas.
3. **Relógio e ticks**: sincronização do tick (estilo NTP), buffer de input no servidor (1–3 ticks) e descarte de input atrasado.
4. **Predição e reconciliação no cliente**: guardar os inputs não confirmados e re-simular a partir do snapshot. Como `stepArena` é pura e barata (0,16 µs/tick [E]), re-simular 10 ticks por frame não custa nada.
5. **Interpolação do oponente**: render ~100 ms no passado.
6. **Lag compensation**: o servidor testa o acerto do básico contra a posição que o atacante via.
7. **Determinismo**: com a opção A, divergências pequenas entre cliente e servidor só causam correções. Com a opção B, seria preciso trocar `Math.sqrt` e floats por ponto fixo ou inteiros. A arena já evita trigonometria e usa só + − × ÷ e `sqrt`, que é exato pelo IEEE-754, mas o arredondamento entre motores JS não foi testado [H].
8. **Matchmaking e salas**: fila simples, sala por partida, reconexão e abandono.
9. **Anti-trapaça mínima**: validar que o input está em {-1, 0, 1}, limitar a taxa e nunca confiar em dano ou posição vindos do cliente.

Bibliotecas que encurtam o caminho, verificadas e **não instaladas** (o registro npm está bloqueado neste host):
- **Colyseus** (salas, estado sincronizado, matchmaking; Node/TS). Licença MIT [E] (`LICENSE` do repositório colyseus/colyseus, consultado em 2026-11-08). Não verifiquei manutenção nem compatibilidade com Node 24 [H].
- geckos.io (UDP/WebRTC para Node) e nengi.js [H] (não verificados).

## 3. Arquitetura recomendada para o MMO-lite (estilo IdleDex)

Objetivo do fundador: o servidor decide tudo, o AUTO continua com a aba fechada, há mercado entre jogadores e um World Boss.

```
 navegador (Vite/Canvas, render + predição)
     │  HTTPS (REST/JSON): conta, inventário, mercado, comandos idle
     │  WebSocket: arena PvP, World Boss ao vivo, notificações
     ▼
 servidor de jogo Node/TS  ── importa  packages/sim (o atual src/sim + arena.ts)
     │   • "catch-up" idle preguiçoso por jogador
     │   • salas de arena (30 Hz) e instância do World Boss
     │   • mercado (livro de ofertas transacional)
     ▼
 Postgres (contas, saves, inventário, mercado, ledger)   [+ Redis opcional depois]
```

Decisões:
1. **Mover a simulação para o servidor sem reescrever.** `src/sim/` já é TypeScript puro, sem DOM nem relógio, com RNG serializado e conteúdo vindo de JSON. Ela vira um pacote compartilhado (`packages/sim`) que cliente e servidor importam. O único trecho preso ao Vite é `src/packs.ts` (`import.meta.glob`). No servidor, um loader lê `packs/*/*.json` do disco e chama o mesmo `buildContent`.
2. **AUTO com a aba fechada = simulação preguiçosa ("catch-up").** O servidor não precisa rodar o tick de cada jogador o tempo todo. Ele guarda `lastSimAt` e, quando o jogador volta ou age, roda `stepN(agora − lastSimAt)`. Medição [E]: 0,43 µs/tick, então 8 h a 10 Hz (288 mil ticks) custam ~125 ms de CPU. Com teto e amostragem, que já existem em `offline.ts`, o custo fica em poucos ms. Num jogo MMO, o resultado do idle passa a ser **autoritativo**. O `applyOffline` com eficiência de 50% vira regra de servidor, não de cliente.
3. **Comandos, não estado.** O cliente envia intenções (`travelTo`, `chooseEvolution`, `challengeBoss`, `listItem`) e o servidor valida, aplica com as mesmas funções de `game.ts`, persiste e responde. O cliente só exibe e prediz. O save em `localStorage` vira cache.
4. **Banco: Postgres.**
   - `accounts` (id, provedor, criado_em), `profiles`
   - `game_states` (account_id, pack_id, state JSONB, version, last_sim_at). O `GameState` já é JSON e versionado em `save.ts`. Com lock otimista por `version`
   - `inventory_items` e `currency_ledger` (append-only; o saldo é derivado ou materializado), para auditoria e anti-duplicação
   - `market_orders` e `trades`: compra/venda em transação `SERIALIZABLE` ou com `SELECT … FOR UPDATE`, mais taxa de mercado como sumidouro de moeda
   - `world_boss` (instância, HP global, janela) e `world_boss_damage` (contribuição por conta; recompensa por faixa)
5. **World Boss.** Uma instância por janela (por exemplo, a cada 2 h). O HP global fica na memória do servidor, com *flush* periódico para o Postgres. A contribuição de cada jogador vem do dano **simulado pelo servidor**, com o time dele contra o boss. A parte ao vivo é o broadcast do HP por WebSocket a 1–2 Hz [H].
6. **Contas.** OAuth (Discord/GitHub/Google) ou *magic link* por e-mail, com sessão em cookie httpOnly. **Não usar credenciais pessoais do fundador.** Qualquer provedor de e-mail ou OAuth exige aprovação, porque é comunicação externa.
7. **ADR-007 continua valendo.** Sem monetização e sem telemetria comercial. O mercado usa **só moeda do jogo**, sem venda por dinheiro real e sem troca entre contas que crie valor fora do jogo [H: confirmar com o fundador]. Um servidor público é **publicação** e aumenta o risco de DMCA/C&D que o ADR já aceitou para o caso de publicar. Recomendo começar com servidor privado e acesso por convite.
8. **Mesmo processo no começo.** Um único servidor Node (HTTP, WebSocket, salas e boss) e um Postgres atendem centenas de jogadores simultâneos [H]. O CPU de simulação é desprezível (§0): 30 Hz × 0,16 µs ≈ 5 µs de CPU por segundo de partida. O gargalo será rede e banco, não a simulação.

Riscos técnicos [H]: duplicação de itens no mercado (resolvida com ledger e transações), divergência de versão de pack entre cliente e servidor (enviar `pack.version` no handshake), migração de saves locais para a conta (importar uma vez, com validação no servidor), e tempo de operação (backup, atualização e moderação), que é o custo real de um MMO.

## 4. Hospedagem gratuita ou barata

Nada foi contratado, cadastrado ou criado. Os preços foram lidos nas páginas oficiais em **2026-11-08**.

| Opção | Bom para | O que foi verificado | Ressalvas |
|---|---|---|---|
| **Oracle Cloud Always Free**: VM Ampere A1 (Arm) | Servidor Node + Postgres no mesmo host, sem limite de horas | [E] 1.500 OCPU-horas e 9.000 GB-horas por mês, "equivalente a 2 OCPUs e 12 GB de memória", e 200 GB de block volume. Contas ociosas por 30 dias podem ser suspensas. Pede cartão no cadastro (docs.oracle.com "Always Free Resources" e oracle.com/cloud/free) | [E] O próprio doc avisa sobre erros de "out of host capacity". [H] Exige operar a VM sozinho (SO, backup, TLS) |
| **Cloudflare Workers + Durable Objects (SQLite)** no plano Free | Sala de arena ou World Boss como Durable Object, com WebSocket e hibernação | [E] DO no plano Free: 100.000 requisições/dia, 13.000 GB-s/dia, 5 milhões de linhas lidas e 100 mil escritas por dia, 5 GB de armazenamento SQLite. Mensagens WebSocket de entrada contam na proporção 20:1 e as de saída não contam. Ao estourar um limite, a operação falha (developers.cloudflare.com/durable-objects/platform/pricing, atualizada em 2026-10-18). Workers Free: 100.000 requisições/dia e 10 ms de CPU por invocação. O plano pago começa em US$ 5/mês (…/workers/platform/pricing) | [H] O tick de 30 Hz contínuo dentro do DO impede a hibernação e consome GB-s rápido; o modelo encaixa melhor em idle por comando e boss a 1–2 Hz. É outro runtime (não é Node puro), mas o `src/sim` deve rodar nele sem mudança |
| **Render** (Free) | Testes e demo | [E] Web service grátis: dorme após 15 min sem tráfego e leva ~1 min para acordar. 750 h/mês por workspace. Sistema de arquivos efêmero. **O Postgres Free expira em 30 dias** e é apagado após 14 dias de carência (render.com/docs/free) | [E] Não serve para estado persistente nem para AUTO 24 h. [H] A soneca derruba WebSockets |
| **Fly.io** (pago, barato) | Servidor Node sempre ligado, perto do usuário | [E] O menor Machine sempre ligado custa US$ 2,19/mês (shared-cpu-1x, 256 MB); 1 GB custa US$ 6,70/mês. Volume a US$ 0,15/GB/mês. O Managed Postgres começa em US$ 38/mês (docs.fly.io/about/pricing) | [H] Postgres próprio num volume sai mais barato que o gerenciado |
| **Neon** (Postgres Free) | Banco gerenciado para qualquer uma das opções acima | [E] Plano Free permanente, sem cartão: 100 CU-horas/mês por projeto, 1 GB por projeto, 5 GB de egress, escala a zero após 5 min, sem pausa por inatividade (neon.com/pricing, atualizada em 2026-11-04) | [H] O *cold start* de algumas centenas de ms aparece na primeira query após ociosidade |
| **Supabase** (Free) | Postgres + Auth prontos | [E] Banco de 500 MB, 50.000 MAU, 5 GB de egress. **Projetos Free pausam após 1 semana de inatividade.** Limite de 2 projetos ativos. O Pro custa a partir de US$ 25/mês (supabase.com/pricing) | [E] A pausa por inatividade atrapalha um servidor que precisa estar sempre disponível |
| **Hetzner Cloud** (VPS) | VPS barato na Europa | [E] A página oficial (hetzner.com/cloud) carregou sem os preços, que são renderizados em JS. [H] Planos de entrada na casa de poucos euros por mês | Latência Europa–Brasil [H] de ~200 ms, ruim para arena em tempo real |
| Cliente estático (Cloudflare Pages, GitHub Pages, Netlify) | O front Vite (`dist/`) | [H] Todos têm plano gratuito para site estático. Não verifiquei os limites hoje | Publicar exige aprovação (ADR-007 §4) |

Recomendação [H]:
- **Fase 0 (agora)**: tudo local. Servidor Node em `localhost`, Postgres em Docker ou mesmo SQLite. Zero custo e zero exposição.
- **Fase 1 (teste fechado, se o fundador aprovar)**: 1 VM Oracle Always Free (Node + Postgres no mesmo host) em região próxima do Brasil (São Paulo ou Vinhedo, se houver capacidade A1 [H]), com convite e allowlist. Plano B: Fly.io por ~US$ 2–7/mês com Neon Free. Uma nota de latência [H]: arena PvP precisa de servidor na América do Sul; idle, mercado e boss toleram qualquer região.
- Evitar Render e Supabase Free para o servidor autoritativo por causa da soneca e da expiração ou pausa.

## 5. Estimativa de esforço [H]

Uma pessoa dev, em dias úteis, com a base atual e sem arte nova. A arte (sprites de andar e de ataque) fica à parte e depende da regra do ADR-007.

| Etapa | Escopo | Estimativa |
|---|---|---|
| A1. Arena PvE jogável | Bloco `action` nos packs + validação, 3–4 formatos de golpe, IA melhor, escolha do monstro no time, recompensa no save, testes | 5–8 d |
| A2. Polimento de ação | Animação de andar e ataque, *hit-stop*, áudio, toque e gamepad, balanceamento de afinidade | 4–6 d (+ arte) |
| B1. Servidor base | `packages/sim` compartilhado, loader de packs em Node, servidor HTTP+WS, contas (1 provedor OAuth ou magic link), `game_states` no Postgres, comandos idle autoritativos com catch-up | 8–12 d |
| B2. PvP em tempo real | Protocolo, sync de tick, predição e reconciliação, interpolação, lag compensation simples, matchmaking 1v1, reconexão | 8–12 d |
| B3. Mercado | Inventário, ledger, ordens e trades transacionais, taxas, UI, testes de concorrência | 6–9 d |
| B4. World Boss | Instância por janela, dano simulado no servidor, broadcast de HP, faixas de recompensa | 4–6 d |
| B5. Operação | Deploy na VM, TLS, backup, logs, rate limit, moderação mínima, termos e aviso de fan game | 3–5 d |
| **Total** | Arena PvE (A1+A2) | **~2 semanas** |
| | MMO-lite com PvP, mercado e boss (B1–B5) | **~6–9 semanas** |

O maior risco do cronograma [H] é a parte de rede da arena em tempo real (B2), que costuma pedir várias rodadas de ajuste com ping real. O segundo é a moderação e operação contínua de um servidor público, que não termina com a entrega.

## 6. Limitações deste spike
- Não houve teste de jogabilidade com teclado num navegador real (sem Chromium neste host). As capturas foram geradas com `@napi-rs/canvas`, já presente em `node_modules`.
- `npm run build` não inclui a arena (o Vite só empacota `index.html`). Para um build da arena: `npx vite build arena-spike --outDir /tmp/arena-build`, testado [E].
- O balanceamento da arena (`arena.json`) é chute inicial, e a IA é básica.
- Os preços mudam. Tudo marcado [E] vale para 2026-11-08 e precisa ser reconferido antes de qualquer decisão. Nenhuma conta foi criada.
