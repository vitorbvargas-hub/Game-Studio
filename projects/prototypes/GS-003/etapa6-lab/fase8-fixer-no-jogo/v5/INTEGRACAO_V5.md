# Etapa 6, Fase 8b — Agumon v5 (ChatGPT prompt padrão + Fixer Neural pixel 4,5) no Link A

> Pedido direto do fundador (2026-11-13), em seguida à Fase 8 (v4). Executor: `game-dev`. Worktree
> `~/projects/GameStudio/workspaces/game-dev/lab-etapa6`, branch `lab/etapa6`, partiu de `7a2ca55`.
> Só o **Link A** (porta 5191) foi tocado. Links B/C e `qo` continuam intocados.

## 1. O que mudou

- **Agumon (CREATURE-0006) passa a usar o v5 por padrão** (parceiro, `?novo=1`, encontros selvagens). Entrada: 4
  pranchas já com nome de direção correto (`agumon_v5_walk_{sul,oeste,leste,norte}_sheet.png`, 8 quadros de
  48×48 cada, sem prancha de idle separada).
- **Idle**: sem arte nova. `rotations/<dir>.png` = quadro 0 do andar de cada direção; como o idle fica com 1
  único quadro por direção, o motor já aplica sozinho o bob de 1px na pose parada (`animctl.ts`, regra existente
  "bob só quando idle tem <2 quadros") — nenhuma respiração foi desenhada ou simulada aqui.
- **Pivô**: medido quadro a quadro (linha opaca mais baixa, centro x), mas usado **fixo por direção** (mediana
  dos 8 quadros; y=43 uniforme nas 32 amostras) — o medido por quadro oscilava até 8px em x dentro da mesma
  direção (oeste 24–32, leste 21–25), o que faria o Agumon deslizar de lado ao andar se usado direto. Pivôs
  usados: sul (29,43), oeste (28,43), leste (22,43), norte (28,43). Nenhum pixel foi redesenhado ou deslocado —
  só o ponto de referência (D13 respeitado, nada redimensionado).
- **Defeito de origem, registrado e NÃO corrigido por escala** (pedido explícito do comando): as vistas de perfil
  (leste/oeste) saem com conteúdo de ~44px de altura contra ~33–38px em sul/norte — maiores que as outras
  direções na mesma ficha. Medido por quadro, consistente nas 4 direções/8 quadros (ver
  `lab-assets/a/digimon/CREATURE-0006/fixer5/_slice-report-v5.json`).
- **Reversão por URL, sem tocar em código**:
  - `?agumon=v4` — volta à ficha v4 (Fixer Neural, idle real de 4 quadros), Fase 8 anterior, intocada.
  - `?fixer=0` — volta à pose única do Comando 5 (placeholder original).
  - Confirmado nos dois (ver §3): `manifest.name` e a contagem de quadros de idle/walk batem com cada versão.

## 2. Como foi construído

- `scripts/lab/import-agumon-v5.mjs` (novo, autocontido — não reaproveita `slice-fixer-sheets.mjs`, cuja entrada
  é outro layout: nomes frente/costas/perfil_dir/perfil_esq + idle_sheet+walk_sheet). Fatia as 4 pranchas, mede o
  pivô por quadro, grava o pivô fixo por direção (mediana) e escreve `lab-character.json` diretamente — não passa
  pelo importador genérico `import-lab-character.mjs` (que re-mediria pivô por quadro e reintroduziria a
  oscilação lateral).
- Saída: `lab-assets/a/digimon/CREATURE-0006/fixer5/` (subpasta **irmã** de `fixer/`, a v4 — nenhuma das duas foi
  removida).
- `src/assets/lab-creatures.ts`: globs próprios para `fixer5/` ao lado dos de `fixer/` (v4); `loadFixerDigimonVisuals`
  agora recebe qual conjunto de manifests/pngs usar; `loadLabCreatureVisuals(fixerEnabled, agumonVersion)` escolhe
  v5 (padrão) ou v4.
- `src/main.ts`: lê `?agumon=v4` e repassa; sem o parâmetro (ou qualquer outro valor), usa v5.
- Nenhuma espécie além do Agumon foi tocada; Greymon e as demais do Método A continuam na pose única.

## 3. Verificação

- `tsc --noEmit`: sem erros.
- `vitest`: **509/509** (mesmo total de antes — mudança aditiva, sem teste novo nem quebrado; uma rodada isolada
  confirmou 2 arquivos que deram timeout na rodada cheia por carga do host, não por regressão real).
- `map:validate --no-write`: **PASS nos 9 mapas**.
- Consulta direta ao estado do jogo (`window.__gs003`, sem UI) confirmando os 3 caminhos:

  | URL | `manifest.name` (trecho) | idle (quadros/direção) | walk (quadros/direção) |
  |---|---|---|---|
  | `?novo=1` (padrão) | "...ficha v5 ChatGPT prompt padrão + Fixer Neural pixel 4,5..." | 1 | 8 |
  | `?novo=1&agumon=v4` | "...ficha v4 Fixer Neural..." | 4 | 8 |
  | `?novo=1&fixer=0` | "...pose única, placeholder" | 1 | 1 |

- Capturado ao vivo (Chromium headless + CDP, `NO_PROXY=127.0.0.1`): Agumon v5 Nv.20 andando nas 4 direções no
  mundo, 0 erros de console. Evidências nesta pasta:

  | Arquivo | O que mostra |
  |---|---|
  | `01_mundo_agumon_v5_sul.png` | Tamer + Agumon v5 parados, de frente (sul) |
  | `02_andando_sul.png` a `05_andando_leste.png` | Caminhada nas 4 direções (a parceira pode ficar um passo atrás do Tamer em trocas curtas — regra de `FOLLOW` já existente, não desta integração; por isso o Agumon não aparece em 1 dos 4 quadros, mais atrasado) |
  | `fase8b_agumon_v5.gif` | GIF curto (0,43 MB) da sequência |
  | `capture-report.json` | Dados brutos (espécie/nível do parceiro, erros de console) |

- B (5192, PID 146750) e C (5193, PID 97714): mesmos processos de antes, intocados. `qo`: `git status` limpo em
  `3289e32`. 0 gerações PixelLab usadas (só processamento de pixel local). Sem push/deploy.

## 4. O que não foi feito / decisões do fundador

- O defeito das vistas de perfil maiores (§1) não foi corrigido — registrado, como pedido.
- Não decidi se o Agumon v5 deveria também ganhar uma prancha de idle própria (respiração desenhada) depois: o
  bob automático de 1px já cobre a pose parada sem inventar arte; se quiser idle desenhado, precisa de uma nova
  prancha `idle_sheet` por direção, fora do escopo deste pedido.
- Greymon e as demais espécies do Método A continuam na pose única; não entraram neste teste.
