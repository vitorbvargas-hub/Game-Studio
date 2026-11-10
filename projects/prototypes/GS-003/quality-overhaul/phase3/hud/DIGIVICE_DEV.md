# HUD Identity v3 — Alt A "Digivice Radial" + abas P0 (dev)

Branch `quality-overhaul`, worktree `workspaces/game-dev/qo`. Data: 2026-11-10. Tudo atrás de `?hud=v2`; sem a flag nada muda.
Base: `phase3/design/HUD_IDENTITY_V3.md` §2 (Alt A, decisão do fundador), `phase3/design/PANELS_SPEC.md` §5–§8, mockups `v3_mockups/alt_a_*.svg`.

- Commit do código: `e4c1a2a` (por cima de `33e7dc0`, o `?team=compare`; nada dele foi tocado). O trabalho que estava sem commit no worktree (`hud.ts`, `style.css`, `digivice.ts`, `achievements.json`, testes) foi retomado como estava, não refeito; nesta sessão só corrigi o que os testes apontaram (abaixo).
- Capturas e vídeo: tirados de um worktree limpo nesse commit (`/tmp/dgverify`, vite na **5191**), porque outro agente estava editando mapa/look/`main.ts` no worktree compartilhado durante a captura, e o HMR recarregava a página no meio. A 5190 continua servindo o worktree compartilhado (com o Digivice e as mudanças em andamento dele).

## Links

| O quê | URL |
|---|---|
| HUD v2 + Digivice (dia) | http://127.0.0.1:5190/?map=digimon-forest-01&look=v9&dpr=1&anim=v2&encounters=1&hud=v2 |
| Noite | http://127.0.0.1:5190/?map=digimon-forest-01&look=v9&dpr=1&anim=v2&encounters=1&hud=v2&time=night |
| Sem a flag (HUD antigo, inalterado) | http://127.0.0.1:5190/?map=digimon-forest-01&look=v9&dpr=1&anim=v2&encounters=1 |

Controles: clique no hub (canto superior direito) ou **H** abre o arco; **Esc** ou clique fora fecha; **O** abre Configurações. Os atalhos antigos da grade inferior Guilda, Correio e Conquistas levam ao mesmo painel do hub.

## O que entrou

1. **Hub Digivice no lugar do `.hud-tr`** (`src/ui/digivice.ts`, `digiviceHudHtml`): faixa fina de bits no topo (só leitura, sem "+"), hub circular de 64 px com emblema próprio em SVG (tela chanfrada + traço de circuito, nenhuma marca), até 3 pips em 10h/2h/6h, **só quando há novidade real** (conquista para coletar; chefe disponível ou recompensa pendente; Correio sempre apagado porque ainda não existe), e o arco do Chefe Mundial no aro: dourado cheio quando disponível, vermelho com o PV restante durante a janela, dourado enchendo até a meia-noite na recarga.
2. **Arco de 6 atalhos** (Guilda, Correio, Passe, Fonte dos Desejos, Chefe Mundial, Conquistas), do pé do hub até a esquerda (abre para dentro da tela). Cada um abre um `Panel` existente (`panel.ts`) e fecha o hub e os outros painéis. Entrada escalonada a partir do centro do hub; tudo some com `prefers-reduced-motion`. Um rótulo do atalho em foco aparece sob o arco.
3. **Chefe Mundial (P0, §5):** banner (retrato provisório, nome, nível, PV em vitórias), 4 estados: disponível ("Despertar o Chefão", 1× por dia de jogo), ativo (timer ao vivo, 10 min [H]), recompensa (participação = recompensa cheia, 200 bits [H], "Coletar") e recarga (contagem até a meia-noite). O dano é o número de vitórias da sua parceira durante a janela; o chefe da Floresta Densa é Kuwagamon (`regions.json`). Ranking local com 4 bots determinísticos pelo dia, sempre rotulados "BOT · simulado", com a nota de que o ranking real chega com o servidor.
4. **Conquistas v1 (P0, §6):** 12 itens em `src/data/content/achievements.json` (content pack, nada na UI), em 4 abas (Combate, Exploração, Coleção e Social, esta bloqueada com motivo). Os contadores vêm só do que já existe: `reward` (vitórias), `capture` com `done` (varreduras únicas, semeadas pelo `captured` do save), `evolve` da parceira, troca de mapa (`Hud.setRegion`), nível do Tamer e o próprio Chefe Mundial. Estados: bloqueada (0, dessaturada e sem cadeado), progresso, completa ("Coletar") e coletada (✓). Coletar = callback `onGrantBits` → intent `add_bits`, o mesmo das Missões.
5. **P1/P2 (Guilda, Correio, Passe, Fonte):** abrem o estado "Bloqueado nesta versão", que explica o sistema e cita a seção da spec, sem número falso.
6. **Configurações (§7):** só a moldura; as 4 opções são as que já existiam, com o mesmo comportamento.
7. **Linguagem "circuito digital"** (CSS, tudo escopado em `.hud-v2`): moldura chanfrada por `clip-path`, borda ciano dupla, linhas de circuito no cabeçalho dos painéis, ciano/azul sobre o navy do P8. É arte provisória: o kit 9-slice vem do game-art.
8. **Estado próprio em chave separada:** `gs003.world.save.digivice`, sem mudar o formato do save do mundo. "Resetar save" apaga as duas chaves.

Correções nesta retomada: `Hud.setBits` (o teste dependia dele); raio do arco de 112 para 120 px (6 ícones de 32 px se sobrepunham em 90°); a janela do chefe agora fecha ao abrir o painel ou a cada evento, e não só no tick de 1 s; o texto da Fonte dos Desejos perdeu as porcentagens; o rótulo do arco desceu para baixo do arco, porque ficava atrás do atalho de Conquistas.

## Checklist da spec

### HUD_IDENTITY_V3 §2 (Alt A)

| Item | Estado | Nota |
|---|---|---|
| Faixa de bits de 20 px, sem "+" | atendido | `dg_fechado_*_canto.png` |
| Hub circular de 64 px com emblema estático | atendido | emblema próprio em SVG |
| Pips em 10h/2h/6h, nenhum sem novidade | atendido | teste "pips só com novidade real" |
| Arco do Chefe Mundial substitui "6h55"; vazio = nada | parcial | sempre desenha algo, porque o chefe local sempre tem um estado (disponível = cheio, recarga = enchendo); nunca há "—" |
| 6 ícones em arco, quadrante inferior-esquerdo, para dentro da tela | atendido | teste do `arcLayout` |
| Raio de 72 px | alterado | 120 px: com 72 (e até 112) os 6 ícones de 32 px se sobrepunham em 90° |
| Entrada escalonada de 120 ms por ícone | ajustado | 120 ms de duração com 30 ms entre ícones (com 120 ms por ícone, o 6º só chegava aos 720 ms) |
| Cada ícone abre o `Panel` e o hub fecha | atendido | teste |
| "Sem gesto novo de input" | divergência | a tarefa pediu "clique (ou tecla)": entrou a tecla **H**; ela é opcional |

### PANELS_SPEC §5 Chefe Mundial

| Critério | Estado | Nota |
|---|---|---|
| Despertar 1× por dia de jogo, com recarga persistida no save | atendido | chave do Digivice; teste "estado persiste" |
| Recompensa de participação sempre cheia | atendido | 200 bits fixos com dano ≥ 1; sem participação não há recompensa |
| Nunca mostrar nomes de outros jogadores no ranking | **conflito** | a tarefa do fundador pediu "ranking local com bots". Os nomes são `BOT-…` com a etiqueta "BOT · simulado" e uma nota dizendo que não são jogadores. Se a spec prevalecer, basta trocar `BOSS_BOTS` por `[]` |
| Só bits/cosmético, sem vantagem de poder | atendido | só bits |
| Log de dano (`.hud-log` filtrado) no estado ativo | não | o dano aparece no ranking e no PV; o log do HUD continua mostrando as vitórias |
| Item na recompensa (§5.4 do GDD) | não | só bits; não há item de chefe no content pack |

### PANELS_SPEC §6 Conquistas

| Critério | Estado | Nota |
|---|---|---|
| Só eventos que já existem | atendido | teste "todo stat é alimentado por evento/tela que já existe" |
| Coletar pelo mesmo caminho das Missões | atendido | `add_bits` |
| Lista em arquivo de dados | atendido | teste confere que `win_1` não está no `screens.ts` |
| Abas por categoria, contador, 4 estados | atendido | Social bloqueada com motivo (Guilda/Correio são P1) |
| "Derrotou o chefe" via evento `defeat` do boss | adaptado | conta a queda do Chefe Mundial local (`bossDefeats`); o boss de região não tem `defeat` próprio nesta versão |

### PANELS_SPEC §7 Configurações

| Critério | Estado |
|---|---|
| Moldura nível 2 chanfrada, nenhum toggle muda de comportamento | atendido (`dg_configuracoes_*.png`; teste de CSS) |
| Nenhuma opção de áudio nova | atendido |

### Tarefa

| Item | Estado |
|---|---|
| Sem a flag nada muda | atendido: `tests/hud-v2.test.ts` confere que o `.hud-tr` antigo fica e que nenhum `.dg`/`dg-*` entra |
| Testes novos (hub e abas) | `tests/digivice.test.ts`, 17 testes |
| `npm test` / `npm run build` / gates | ver "Verificação" |
| Capturas 1920×1080 e WebM | ver "Arquivos" |

## Verificação

Rodada no worktree limpo (`/tmp/dgverify`, commit `e4c1a2a`):

- `tsc --noEmit`: ok.
- `npm test`: **414/414** (42 arquivos) com `--maxWorkers=4`. Com o padrão de 12 workers, numa máquina com carga de ~10 (outro agente + 2 vites), 1 teste de `tests/look-v9.test.ts` estoura o limite de 5 s (a cada rodada um diferente: "água do riacho" ou "primeiro plano"). Sozinho, o arquivo passa 11/11. Não tem relação com o HUD: é o renderer v9.
- `npm run build`: ok (o aviso de chunk > 500 kB já existia).
- `map:validate`: 6/6 PASS, `digimon-forest-01` (v9) incluso.
- `node scripts/encounters/sim.mjs --check`: ok (19 entradas, 7 áreas).
- Testes novos: `tests/digivice.test.ts` tem 17 testes (hub e arco, teclado, painéis, P1/P2 bloqueados, atalhos antigos, pips, escopo do CSS e reduced-motion, ciclo do chefe, sem participação, queda antecipada, ranking determinístico, arco do hub, DOM do chefe com persistência, conquistas: content pack, eventos, estados e DOM). `tests/hud-v2.test.ts` ganhou a checagem "sem a flag, nada do Digivice".

## Arquivos (`quality-overhaul/phase3/hud/`)

- `dg_fechado_{dia,noite}.png` (+ `_canto`, recorte 400×300 do canto em tamanho real): hub fechado, com o pip de Conquistas aceso.
- `dg_aberto_{dia,noite}.png` (+ `_canto`): arco aberto, com o foco em Chefe Mundial.
- `dg_fechado_chefe_ativo_{dia,noite}_canto.png`: arco vermelho durante a janela.
- `dg_chefe_1_disponivel_{dia,noite}`, `dg_chefe_2_ativo_{dia,noite}`, `dg_chefe_3_recompensa_dia`, `dg_chefe_4_recarga_dia`.
- `dg_conquistas_{dia,noite}`, `dg_conquistas_exploracao_dia`, `dg_conquistas_social_bloqueada_dia`, `dg_bloqueado_guilda_dia`, `dg_configuracoes_{dia,noite}`.
- `dg_digivice.webm` (1280×720, VP8): abre o hub, passa pelos 6 atalhos, coleta uma conquista, Esc, H, desperta o chefe, arco vermelho, Configurações. Os marcos estão em `dg_capture.json` → `video.marks`.
- `dg_capture.json`: o estado de cada captura (hub aberto, fase do chefe, pips, painéis abertos).
- Script: `prototype/world/scripts/dg-capture.mjs` (`shots|video|all`; `BASE=` escolhe a porta).

Os estados do chefe são semeados na chave do Digivice antes do carregamento (`addInitScript`), para não esperar 10 minutos de jogo. Por isso o "ativo" mostra o tempo e o dano semeados.

## Limitações

- **Ranking com bots × spec §5:** está explicado acima e precisa de uma decisão (fundador × game-design).
- Números [H], não calibrados: janela de 10 min, PV de 40 vitórias, 200 bits, bots com 4–10 vitórias e as recompensas das conquistas.
- O "dia de jogo" do chefe usa o dia do relógio local (meia-noite), não o ciclo de 24 min do jogo.
- O retrato do chefão é o ícone `boss` (não há arte de Kuwagamon como chefe). O emblema e as molduras são CSS/SVG provisórios até o kit 9-slice do game-art.
- O pip do Correio nunca acende (Correio é P1). O pip do Passe, previsto no §2.1, não existe porque o Passe é P2; no lugar dele está o pip do Chefe Mundial (2h).
- A tecla H é nova (a spec dizia "sem gesto novo").
- No v2, os atalhos antigos da grade inferior continuam lá (Guilda, Correio e Conquistas abrem o painel do Digivice; o resto, como antes). A spec não pede para tirá-los.
