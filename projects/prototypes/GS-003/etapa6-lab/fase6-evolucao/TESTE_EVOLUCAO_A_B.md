# Etapa 6, Fase 6 — teste de evolução Agumon→Greymon nos Links A e B

> Pedido direto do fundador (2026-11-13): "um dos principais testes não deu para fazer, que é comparar o sprite
> do DS e o nosso. No A coloca o sprite do Agumon já Lv 20 para eu poder evoluir para Greymon, sprite do chat. Na
> B coloca sprite do DS Agumon e de alguma evolução dele que tiver pronta. Não mexa na C ainda."
> Worktree: `lab-etapa6`, branch `lab/etapa6`. Partiu de `8dc7a0f` (C5 v2); commit desta fase: **`ca5f131`**.

## Como o fundador testa (passo a passo)

1. Abra **http://127.0.0.1:5191/?novo=1** (Link A) ou **http://127.0.0.1:5192/?novo=1** (Link B) — `?novo=1` força um
   jogo novo neste slot sem precisar limpar o navegador.
2. Criador: escolha um visual do Tamer e confirme ("Entrar no mundo"). **Não aparece** a tela "Escolha seu
   parceiro" — o jogo entra direto no mundo com o **Agumon no Nv.20** como parceira (A: retrato do Método
   ChatGPT; B: sprite oficial DS).
3. Em poucos segundos o jogo abre sozinho o Digivice na aba **Evolução** (igual ao jogo real: qualquer parceira
   elegível com Auto‑evoluir desligado abre esse aviso). A árvore mostra Koromon → Agumon (você) → **dois** nós a
   100%: **Greymon** (com arte) e **GeoGreymon** (ainda sem arte, mostra "?" — não é bug, é a regra já existente:
   Agumon tem dois caminhos no Nv.16+, ver `data/evolution-paths.json`).
4. Clique **Evoluir** no nó do **Greymon**. A parceira vira Greymon na hora (mesmo nível, PV máximo recalculado).
   Se fechar e reabrir essa aba sem ter clicado, o aviso reaparece — fechar é só "agora não".
5. Para comparar os dois links lado a lado, repita no outro link. Os dois partem exatamente das mesmas condições
   (ver "Mesmas condições" abaixo).
6. Para voltar ao fluxo de antes desta fase (Koromon pré-selecionado, sem pular a tela do parceiro): acrescente
   `&evo=0` na URL (ex. `http://127.0.0.1:5191/?novo=1&evo=0`).

Link C: **http://127.0.0.1:5193/** — nada mudou nele; ver "Prova de que o C não mudou" abaixo.

Se uma porta não responder (host instável, ver nota no fim), reinicie com:
```
cd ~/projects/GameStudio/workspaces/game-dev/lab-etapa6/projects/prototypes/GS-003/prototype/world
node_modules/.bin/vite preview --outDir dist-lab-a --port 5191 --strictPort --host 127.0.0.1 &
node_modules/.bin/vite preview --outDir dist-lab-b --port 5192 --strictPort --host 127.0.0.1 &
```

## O que mudou (código)

Tudo em `projects/prototypes/GS-003/prototype/world/`, commit `ca5f131`:

- **`src/main.ts`**: nova constante `LAB_EVO_PARTNER` — só quando `LAB_VARIANT` é `"a"` ou `"b"` (nunca `"c"`) e
  sem `?evo=0`, o parceiro de um jogo novo passa a ser `CREATURE-0006` (Agumon) direto, em vez de abrir a tela
  "Escolha seu parceiro" (`chooseStarter`). O nível desse parceiro usa `LAB_EVO_PARTNER_LEVEL = 20` em vez de
  `STARTER_LEVEL` — **mesmo mecanismo que já existia** (`opts.partnerSpecies`/`opts.partnerLevel` em
  `createMapWorld`, o que `?partner=`/`?team=compare` já usavam para pular a tela), só com um nível diferente
  para este parceiro específico. Nenhuma tabela de evolução, stat ou regra de jogo foi tocada.
- **`src/world/lab-a.ts`**: `LAB_A_SLOT` (chave de save do Link A) vira **`do.lab.a.save.v2:`** (era
  `lab-a-c5:`) — só para o jogo novo desta fase não esbarrar num save antigo do mesmo endereço. Nada apagado; o
  save antigo continua no navegador, só inacessível por esse prefixo novo.
- **`src/world/lab-b.ts`** (novo arquivo, só do Link B): o mesmo padrão, prefixo **`do.lab.b.save.v2:`**. Antes
  desta fase o Link B usava a chave de save crua (sem prefixo próprio).
- **`tests/fase6-evolucao.test.ts`** (novo, 4 testes): prova, no nível da sim (sem navegador), que Agumon Nv.20
  nasce elegível para Greymon, que a sim não evolui sozinha com Auto‑evoluir desligado, que o intent manual
  `evolve` (o mesmo que o clique real em "Evoluir" dispara) evolui para Greymon mantendo o nível, e que sem
  escolher o caminho com 2+ elegíveis a sim recusa (confirma que é sempre o jogador quem escolhe).
- **`scripts/lab/capture-fase6-evo.mjs`** e **`scripts/lab/compose-fase6-evo.mjs`** (novos): script de captura
  por Chromium headless + CDP (mesma técnica de `capture-lab-a.mjs`) e o script que monta as pranchas lado a
  lado e os GIFs a partir dos screenshots.

### Por que "criador → mundo" e não "criador → parceiro → mundo"

A tela "Escolha seu parceiro" (`StarterPicker`) só lista os 5 bebês de `data/starters.json` — Agumon não é um
deles (ele é a 2ª forma da linha do Koromon). Oferecer Agumon ali exigiria uma opção nova nessa tela, o que o
comando pediu para evitar ("sem regra nova"). Por isso o parceiro padrão entra direto, do mesmo jeito que
`?partner=`/`?team=compare` já pulavam essa tela — só que agora é o padrão do link, não algo que precisa de um
parâmetro na URL.

## Mesmas condições nos dois links

| | Link A | Link B |
|---|---|---|
| Parceiro padrão | Agumon, retrato ChatGPT (Método A) | Agumon, sprite oficial DS |
| Nível de entrada | **20** | **20** |
| PV ao carregar | 131/131 | 131/131 |
| Caminhos elegíveis no Nv.20 | Greymon (arte) + GeoGreymon (sem arte, "?") | Greymon (arte) + GeoGreymon (sem arte, "?") |
| Evolução | manual (Auto‑evoluir DESL. por padrão) | manual (Auto‑evoluir DESL. por padrão) |
| Depois de evoluir | Greymon, retrato ChatGPT, PV 180/180 | Greymon, sprite oficial DS, PV 180/180 |
| Fluxo de jogo novo | criador → mundo | criador → mundo |
| Chave de save | `do.lab.a.save.v2:` | `do.lab.b.save.v2:` |

GeoGreymon (o outro ramo de Agumon, `SP-GEOGREYMON`) não tem arte em nenhum dos dois links — mostra "?" na
árvore, como qualquer espécie sem arte no jogo real. Não é um bug desta fase; é a regra de evolução já existente
(`data/evolution-paths.json`), registrada aqui só para constar: **nenhuma outra evolução pronta da linha do
Agumon** foi encontrada em nenhum dos dois links (a linha para no Greymon nesta prova — MetalGreymon não existe
como espécie jogável ainda, conforme o comentário do próprio arquivo de evoluções).

## Evidências

Capturado ao vivo (Chromium headless + CDP, `NO_PROXY=127.0.0.1`, a mesma técnica de `capture-lab-a.mjs`), **não
simulado** — clique real no botão "Evoluir" (`data-evolve-to`), o mesmo que o fundador vai clicar:

| Arquivo | O quê |
|---|---|
| `a_00_criador.png` / `b_00_criador.png` | Tela do criador de Tamer, cada link |
| `a_01_agumon_lv20.png` / `b_01_agumon_lv20.png` | Mundo carregado: Agumon Nv.20 (HUD) + o aviso de evolução já aberto sozinho (`checkEvolve`, regra existente) |
| `a_02_prompt_evolucao.png` / `b_02_prompt_evolucao.png` | Árvore de evolução: Greymon e GeoGreymon a 100% |
| `a_03_greymon.png` / `b_03_greymon.png` | Logo depois do clique em "Evoluir para Greymon" |
| `a_03b_greymon_apos_wait.png` | Mesma cena do A, mais ~1 s depois (o painel acompanha o passo seguinte do jogo e atualiza nome/retrato/HP; é o mesmo redesenho que o jogo real faz a cada passo) |
| `a_04_perfil_depois.png` | Aba "Perfil" do Digimon no Link A: Greymon Nv.20, Vacina, PV 180/180, "Forma final nesta prova" |
| `comparacao_agumon_A_x_B.png` | **Prancha lado a lado**: Agumon Nv.20, A × B |
| `comparacao_greymon_A_x_B.png` | **Prancha lado a lado**: Greymon depois de evoluir, A × B |
| `a_evolucao.gif` / `b_evolucao.gif` | GIF curto da sequência completa, cada link |
| `report-a.json` / `report-a-recheck.json` / `report-b.json` | Estado real da sim (espécie/nível/PV) antes e depois, lido direto do jogo (`window.__gs003`), e `consoleErrors: []` nos dois |
| `c_depois_sem_mudanca.png` | Link C depois desta fase (ver abaixo) |

Resumo do `report-*.json` (idêntico nos dois links, só a espécie do nome muda de retrato):
```
antes:  { speciesId: "CREATURE-0006", level: 20, hp: 131, maxHp: 131 }
depois: { speciesId: "CREATURE-0007", level: 20, hp: 180, maxHp: 180 }
consoleErrors: []
```

## Prova de que o C não mudou

- `LAB_EVO_PARTNER` só existe para `LAB_VARIANT === "a" || "b"`; no C (`LAB_VARIANT === "c"`) o código cai
  exatamente no mesmo `regionMode && CREATOR ? await chooseStarter(...)` de antes — nenhuma linha nova é
  executada para essa variante. `labAStorage`/`labBStorage` também não se aplicam a ela.
- `git diff --stat` do commit `ca5f131` não toca nenhum arquivo específico do C (`lab-assets/c/`,
  `dist-lab-c/`, nenhuma referência a `"c"` em `main.ts` fora da checagem acima, que já existia).
- `dist-lab-c/` não foi reconstruído nesta fase: `ls -la dist-lab-c/assets/*.js` mostra `Nov 13 16:00` (Comando 5
  v2), **antes** desta fase começar (20:xx). O servidor da porta 5193 é o mesmo processo rodando desde `16:20`,
  nunca reiniciado por mim.
- `c_depois_sem_mudanca.png`: captura ao vivo da 5193 agora — mesmo banner ("Comando 4, Fase 2 · Link C ·
  aguardando resultados aproveitáveis de A e B"), mesma tela de criador v13 com 12 presets, igual à captura
  antiga `fase2-builds/link-c_01_load.png`.

## Verificação técnica

- `npx tsc --noEmit`: sem erros.
- `npx vitest run`: **509/509** (505 da branch + 4 novos de `fase6-evolucao.test.ts`), nenhuma regressão.
- `node scripts/validate-map.mjs --no-write`: **PASS** nos 9 mapas (`lab-a-chatgpt`, `lab-piloto-v15b`,
  `digi-forest-v15b`, etc.).
- Rebuild: `node scripts/lab/build-lab-a.mjs` (mapa do A, determinístico) + `VITE_LAB_VARIANT=a npx vite build`
  + `VITE_LAB_VARIANT=b npx vite build` → `dist-lab-a/`, `dist-lab-b/` novos.
- Servidores: 5191 e 5192 reiniciados com os builds novos (`vite preview --outDir dist-lab-a|b`); 5193
  **não reiniciado** (mesmo processo de antes).
- `git status` final: limpo na branch `lab/etapa6`; commit local `ca5f131`. Sem push, sem deploy.
- `qo` (branch `quality-overhaul`, worktree separado): continua em `3289e32`, não tocado.
- **0 gerações PixelLab**: arte reaproveitada (retrato A do Agumon/Greymon de `metodo-a-v2/game-ready`, já
  gerada no Comando 5; sprites DS `CREATURE-0006`/`CREATURE-0007`, já em produção).

## Limitações e o que não foi feito

- **Host instável durante a sessão**: este ambiente compartilhado ficou sob pressão de memória algumas vezes
  durante a tarefa (processos em segundo plano — incluindo os servidores de preview — foram derrubados pelo OOM
  killer do Linux mais de uma vez). Reiniciei A e B pelo mecanismo de processo em segundo plano da ferramenta
  (mais estável que `nohup`/`disown` direto) e confirmei as três portas respondendo ao final desta entrega; se
  o fundador encontrar uma porta fora do ar, os comandos de reinício estão em "Como o fundador testa" acima.
  Isso é uma característica do host nesta sessão, não um defeito do código.
- **GeoGreymon permanece sem arte** nos dois links (como no jogo real) — não é parte deste pedido, só registrado
  para quando a Etapa 6 decidir sobre esse ramo.
- **Não decidi** entre o estilo A (ChatGPT) e o estilo B (DS) — essa comparação de qualidade visual é do
  fundador/game-studio, não minha (conflito aberto da Etapa 6, ADR-006 a ADR-014).
- Nenhuma mudança na Database, no jogo principal (`qo`) nem nas regras de evolução. Nenhuma publicação.
