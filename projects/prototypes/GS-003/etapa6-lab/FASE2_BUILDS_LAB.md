# FASE2_BUILDS_LAB — Etapa 6, Comando 4, Fase 2: preparação técnica dos 3 links (RETOMADA)

- **Autor:** game-dev (subagente) · **Data:** 2026-11-13, retomada às 15h05.
- **Prevalece sobre este documento:** `COMANDO_ETAPA6_C4_DECISOES_FASE2.md` (D11–D13), `COMANDO_ETAPA6_C4_LAB_JOGAVEL.md` §3/§5, `COMANDO_ETAPA6_C4_ADENDO_AGUA_VIABILIDADE.md`, `ADR_ETAPA6_DECISOES_FUNDADOR.md`.
- **Regra respeitada: 0 gerações PixelLab.** Toda a produção desta entrega é engenharia (código, importação de assets já exportados, montagem de mapa) — nenhuma chamada paga foi feita.
- **Jogo principal intocado:** worktree `workspaces/game-dev/qo`, branch `quality-overhaul`, `git status` limpo, HEAD ainda em `3289e32` (verificado antes e depois desta tarefa).

---

## 1. Onde o trabalho foi feito

- Tag `pre-etapa6` em `3289e32` (já existia, de uma tentativa anterior sem produto).
- Worktree novo: `workspaces/game-dev/lab-etapa6`, branch `lab/etapa6`, criado a partir da tag.
- Commit local único nessa branch: `1f46309` — "Etapa 6, Comando 4, Fase 2: laboratório A/B/C isolado (M1-lite + M2 + build por variante)". **Nenhum push, nenhum deploy.**
- `qo` (jogo principal) nunca foi aberto para escrita — só lido (`cat`, `grep`) para generalizar o importador de Tamers v13.

## 2. Arquitetura (reaproveita o motor real, não um renderizador à parte)

A decisão de arquitetura seguiu a recomendação (b) do `PLANO_TESTES_JOGAVEIS_A_B_C.md` (passo 5 do Comando 3): **mesmo motor, 3 builds estáticos separados, variando só a pasta de assets em tempo de build.** Nenhum rota/flag nova foi criada **dentro** do jogo principal — o próprio `main.ts`/`WorldView`/`Presenter`/HUD do jogo real é reaproveitado inteiro; só o que muda por variante é:

| Peça | O que é | Novo ou reaproveitado |
|---|---|---|
| `scripts/lab/crop-lab-piloto.mjs` | **M1-lite**: recorte 40×30 de `digi-forest-v15b.tmj.json` (48×36), origem (x=4,y=6) — contém o `start` do jogador, o portal do Mapa-múndi, a linha da ponte (BRIDGE_ROW=17) e a região do rio/cachoeira/santuário já usada em `agua-v1/MANIFEST.json` (crop 13,1 28×24). **Não é mapa novo**: é pixel-a-pixel um corte do `.tmj` já aprovado — preserva rio, ponte, cachoeira, desnível, santuário e os caminhos de vegetação por construção, não por reprodução manual. | Novo (script) |
| `src/data/maps/lab-piloto-v15b.{tmj,aliases}.json` | Saída do M1-lite, registrada em `src/world/regions.ts` como `MAPS["lab-piloto-v15b"]` | Novo (dado gerado) |
| `scripts/lab/import-lab-character.mjs` | **M2**: importador genérico de personagem (generaliza `import-tamers-v13.mjs`, que era fixo nos 12 presets do disco): lê uma pasta `rotations/<dir>.png` + `animations/walk/<dir>/frame_NNN.png` (o layout que `export_asset`/`get_character` devolvem) e mede o pivô no pé de **cada** PNG, sem assumir tamanho único. **D13 respeitada**: rotação (56×56) e walk (44×44) do Tamer P1 v2 ficam em tamanhos diferentes no manifesto — nada é redimensionado para escondê-los. | Novo (script) |
| `etapa6-lab/lab-assets/{a,b,c}/` | Pasta de assets por variante (fora do worktree, na checkout raiz do GameStudio — ver §2.1 sobre o bug corrigido) | Novo (dados) |
| `src/assets/lab-tamer.ts` | Lê `etapa6-lab/lab-assets/<variante>/tamer/lab-character.json` com um `import.meta.glob` **próprio** (`@lab-assets`), nunca `@game-assets`/`creatures.ts`/`tamer-presets.ts`. Monta um `CreatureVisual` (schemaVersion 2) com atlas **por quadro** (cada frame com seu próprio `w,h,pivotPx`) — o mesmo formato que o motor já usa para criaturas com quadros de tamanho variável. Variantes sem Tamer do laboratório (A/C) devolvem `undefined`, caindo no Tamer v13 padrão (nenhum asset inventado). | Novo (módulo) |
| `vite.config.ts` | Alias `@lab-assets` + `build.outDir = dist-lab-<variante>`, ambos decididos por `VITE_LAB_VARIANT` (env, **tempo de build**, não URL) | Alterado (alias/outDir novos; nada removido) |
| `src/main.ts` | `LAB_VARIANT` (constante `__LAB_VARIANT__` injetada por `define` no build); quando setada: mapa padrão → `lab-piloto-v15b`; parceira de teste padrão → Agumon (`?partner=agumon`, já existente, save próprio); criador de Tamer desligado por padrão; encontros selvagens desligados por padrão (sem combate novo); `tv[LOCAL_PLAYER]` sobrescrito por `loadLabTamerVisual()` quando a variante tem Tamer do laboratório; faixa fixa no topo (`mountLabBanner`) identificando o link e o status. **Nenhum sistema de combate/boss/PvP/evolução foi tocado** — só lidos os pontos de entrada já existentes (`?partner=`, `?encounters=`, `?criador=`). | Alterado (acréscimos, nada removido) |
| `src/world/regions.ts` | +1 entrada em `MAPS` | Alterado (acréscimo) |
| `tests/regions.test.ts` | Ajustado para o novo mapa (mesma regra do `digi-forest-v15b`: só o portal do Mapa-múndi) | Alterado |
| `scripts/lab/capture-lab.mjs`, `debug-lab.mjs` | Captura e depuração via Chromium headless + CDP (reaproveita o padrão de `scripts/capture-live.mjs`) | Novo (ferramentas de verificação, não fazem parte do jogo) |

### 2.1 Bug encontrado e corrigido durante a verificação: alias apontando para o worktree errado

Na 1ª tentativa, `@lab-assets` foi calculado por caminho **relativo** a `vite.config.ts` (como `@game-assets` já faz). Isso resolveu para dentro do **próprio worktree** `lab-etapa6` — que, por ser um git worktree, tem sua **própria cópia isolada** de `projects/prototypes/GS-003/etapa6-lab/` (a mesma pasta onde os agentes desta etapa vêm gravando documentos, mas na checkout **raiz** do GameStudio, não neste worktree). O glob `import.meta.glob` resolvia para uma pasta vazia e caía sempre no Tamer v13 padrão, silenciosamente — **as 2 primeiras capturas (link-a e link-b) mostravam o mesmo Tamer**, sem erro no console. Encontrado medindo (checksum + log de depuração), corrigido trocando o alias para o caminho **absoluto** da checkout raiz (`/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/etapa6-lab/lab-assets/<variante>`). Depois da correção, `node scripts/lab/debug-lab.mjs` confirma `labTamer=tamer:lab:tamer-p1-v2, frameUrls=28` para a variante B, e as capturas mostram visuais diferentes para A e B (ver §5).

### 2.2 Por que não houve "vazamento" para o bundle principal

- O glob de `lab-tamer.ts` é **próprio** (`@lab-assets`), nunca aponta para dentro de `@game-assets` nem é lido por `creatures.ts`/`tamer-presets.ts`.
- O jogo principal é buildado a partir do worktree `qo` (branch `quality-overhaul`), que nunca teve nenhum destes arquivos — o laboratório vive só em `lab-etapa6` (branch `lab/etapa6`), nunca mesclada.
- Os 3 builds do laboratório (`dist-lab-a/b/c`) são 3 pastas de saída diferentes, cada uma só com os assets da sua própria variante.

## 3. Status de cada link

| Link | Elenco | Mapa | Status |
|---|---|---|---|
| **B (PixelLab)** | Tamer P1 v2 (rotações 56×56 + walk 44×44, 4 direções, `6cd24249-…`) + Agumon DS como parceira de teste (placeholder D11, `CREATURE-0006`, save próprio) | `lab-piloto-v15b` (M1-lite), água e cachoeira animadas (mecanismo já existente do motor, `ScenePack.waterAnim`, reaproveitado sem mudança) | **Jogável.** Ver evidências §5. |
| **A (ChatGPT)** | Estrutura pronta: mesmo mapa, Tamer v13 padrão do jogo, Agumon DS como parceira. **Nenhum asset do ChatGPT foi inventado** — a pasta `etapa6-lab/lab-assets/a/` só tem um `PLACEHOLDER.json` marcando "aguardando ZIP consolidado" | `lab-piloto-v15b` | **Estrutura pronta, aguardando o ZIP.** Faixa fixa no topo avisa o status. |
| **C (Híbrido)** | Idem A | `lab-piloto-v15b` | **Estrutura pronta, aguardando resultados de A e B.** |

## 4. Como subir os 3 servidores (comandos exatos)

```bash
cd ~/projects/GameStudio/workspaces/game-dev/lab-etapa6/projects/prototypes/GS-003/prototype/world

# build (uma vez, ou sempre que o código/assets mudarem)
VITE_LAB_VARIANT=a npx vite build   # → dist-lab-a
VITE_LAB_VARIANT=b npx vite build   # → dist-lab-b
VITE_LAB_VARIANT=c npx vite build   # → dist-lab-c

# servir (3 processos, 3 portas — 5190 é do qo, não usar)
npx vite preview --outDir dist-lab-a --port 5191 --strictPort --host 127.0.0.1   # Link A
npx vite preview --outDir dist-lab-b --port 5192 --strictPort --host 127.0.0.1   # Link B
npx vite preview --outDir dist-lab-c --port 5193 --strictPort --host 127.0.0.1   # Link C
```

**Estado atual (no momento desta entrega): os 3 já estão rodando** nessas 3 portas, builds já feitos — o coordenador pode expor 127.0.0.1:5191/5192/5193 via portal sem recomandar nada. Reiniciar o servidor (`kill` + o comando `vite preview` de novo) é preciso só depois de um novo `vite build`.

## 5. Evidências (`etapa6-lab/fase2-builds/`)

Capturadas com Chromium headless (`~/.cache/ms-playwright/chromium_headless_shell-1243`) + CDP (`scripts/lab/capture-lab.mjs`), input de teclado real (WASD — **o jogo usa WASD, não as setas**; achado registrado para qualquer captura futura), não só o quadro estático:

| Arquivo | O que mostra |
|---|---|
| `link-b_01_load.png` | Carregamento do Link B: mapa `lab-piloto-v15b`, faixa do laboratório, HUD completo, lago visível, Agumon Nv.8 no time |
| `link-b_02/03/04/05_andando_*.png` | Tamer andando sul/oeste/norte/leste (WASD segurado 1,2–2,5 s cada) — câmera acompanha, FPS 60 qps estável |
| `link-b_06_teste_colisao.png` + o JSON de posição antes/depois no log | Segurando "a" (oeste) por 4 s: posição sub-tile foi de x=328 a x=258 e **parou** (não continuou decrescendo até o fim do tempo) — consistente com bloqueio por colisão (árvore/borda), não um erro de input |
| `link-b_07/08_perto_da_agua.png` | Dois quadros do Tamer perto do lago, para inspeção visual da água (o shader de deslocamento de UV do motor, `ScenePack.waterAnim`, já estava configurado no `digi-forest-v15b.aliases.json` original e foi herdado 1:1 pelo recorte — **nenhuma linha de código nova para animar a água foi necessária**) |
| `link-b_zoom_charh25.png` | **Close-up (`?charh=25`) do Tamer P1 v2 + Agumon DS lado a lado** — identidade visual clara: cabelo verde-petróleo, colete verde-oliva, camisa mostarda, calça marrom, bolsa a tiracolo, pulseira cyan (bate com `tamer1_v2_extracted/Idle/metadata.json`) |
| `link-a_01/02_*.png`, `link-a_zoom_charh25.png` | Link A: mesmo mapa, **Tamer v13 padrão** (boné vermelho, jaqueta azul — visivelmente diferente do Tamer do Link B), Agumon DS, faixa "aguardando ZIP…" |
| `link-c_01/02_*.png` | Link C: idem A, faixa "aguardando resultados de A e B…" |
| `capture-report.json` | FPS e erros de console por link (0 erros nos 3) |

**FPS medido** (contador "qps" já existente no HUD, `data-testid="fps"`, 4 Hz): **60 qps** nos 3 links, parado e em movimento, incluindo a captura perto da água.

## 6. Verificação técnica

- `npx tsc --noEmit`: **sem erros.**
- `npx vitest run`: **496/496 testes passam** (1 teste ajustado: `regions.test.ts` precisou incluir `lab-piloto-v15b` na lista de mapas e no tratamento especial de portal-só-Mapa-múndi, mesma regra já aplicada ao `digi-forest-v15b` do qual ele deriva). Dois testes não relacionados (`digivice-core`/`digivice-panels`) tiveram timeout de 5 s numa rodada com 3 servidores + Chromium rodando em paralelo (CPU disputada); confirmados passando isoladamente logo em seguida.
- `qo`: `git status` limpo, HEAD em `3289e32`, nunca aberto para escrita.
- `map:validate` (script do próprio projeto): **não executado** — o script reescreve relatórios versionados fora do escopo desta entrega (AGENTS.md §5); como o mapa é um recorte direto de um `.tmj` já validado em produção, não um mapa novo desenhado à mão, considerei a validação coberta pela origem. Fica registrado como item não executado, para o coordenador decidir se exige rodá-lo.

## 7. Problemas encontrados (e como foram tratados)

1. **Bug de alias do worktree** (§2.1) — corrigido, re-verificado com checksum + log + captura visual antes de fechar a entrega.
2. **Movimento é WASD, não as setas** — descoberto só ao investigar por que a 1ª rodada de capturas não mostrava movimento nenhum; corrigido no script de captura.
3. **`firstMap` tinha sua própria lógica**, separada da constante `MAP` que eu havia alterado — por isso o mapa carregado continuou sendo `digi-forest-v15b` na 1ª rodada mesmo com o `MAP` "correto". Corrigido tornando `firstMap` ciente de `LAB_VARIANT`.
4. **Processos em segundo plano se auto-matando**: `pkill -f "vite preview"` combinado com a forma como o shell deste ambiente expõe o próprio comando no `ps aux` fez 2 chamadas se autoderrubarem (SIGTERM). Contornado matando por PID explícito.
5. **Chromium headless sem `libnspr4.so`/`libnss3.so`**: resolvido apontando `LD_LIBRARY_PATH` para uma pasta de libs já existente no host (`~/projects/cog-ferramentas/libs/root/usr/lib/x86_64-linux-gnu`).
6. **Tamanhos mistos do Tamer P1 v2** (rotação 56×56 × walk 44×44, achado antigo do game-qa, `REVISAO_QA_V2_VIABILIDADE.md` §1.4): **não escondido** — o visual é montado com atlas por quadro, cada um no seu tamanho nativo; o "pulso" de tamanho ao começar a andar deve ser visível no jogo real, exatamente como a decisão D13 exige. Não corrigido (a correção da caminhada é tarefa futura, antes da homologação visual, conforme D13).

## 8. O que NÃO foi feito (limitações explícitas)

- **Nenhuma geração PixelLab** nesta entrega.
- **Água**: reaproveitado o mecanismo já existente do motor (`waterAnim`), **não** o pipeline específico de `agua-v1/` (cachoeira/rio/lago com os assets dedicados daquele laboratório) — isso é compatível com o pedido ("a água deve ficar animada no motor, com o algoritmo atual"), mas os assets extras de `agua-v1/` (efeito digital do santuário, transições dedicadas) **não foram plantados no mapa** nesta rodada — ficam como trabalho futuro, não bloqueante para "versão jogável".
- **`map:validate`** não executado (ver §6).
- **Walk do Tamer P1 v2 não foi corrigido** — entra como placeholder técnico, conforme D13 manda explicitamente.
- **Nenhum teste de usuário real** (só automação via teclado simulado) — critério "3 testadores por link" do `PLANO_TESTES_JOGAVEIS_A_B_C.md` §6.5 não executado nesta rodada.
- Links A e C continuam sem nenhum asset próprio — não há nada a avaliar neles além da estrutura/isolamento, até o ZIP chegar e os resultados de A/B existirem.

## 9. Próximos passos (para o fundador/coordenação)

1. Expor 127.0.0.1:5191 (A), 5192 (B) e 5193 (C) via portal para avaliação visual.
2. Decidir se o M1-lite (recorte 40×30) é suficiente ou se vale completar o M1 inteiro (generalizar `import-pixellab-map.mjs`) para permitir um mapa-piloto desenhado do zero no Map Workshop, não só um recorte do mapa em produção.
3. Autorizar (ou não) plantar os assets de `agua-v1/` (cachoeira/transições dedicadas, efeito digital do santuário) no mapa-piloto, além do `waterAnim` já herdado.
4. Decidir quando corrigir o walk do Tamer P1 v2 (D13) — antes ou depois da homologação visual A/B/C.
5. Pedir ao fundador o ZIP consolidado do ChatGPT para começar a popular o Link A de verdade.

---

## 10. Ajuste do fundador (mesmo dia, após testar o Link B) — encontros/combate/evolução já existentes ligados + criador com os presets do laboratório

**Esclarecimento recebido:** a regra "não implementar sistemas NOVOS de combate/boss/PvP/evolução" não pedia desligar os sistemas que já existem no jogo. Os 3 links devem ter a MESMA experiência do jogo real, trocando só a arte. Commit local: `a944e80` (branch `lab/etapa6`, worktree `lab-etapa6`, mesmo isolamento do `qo`).

### 10.1 O que mudou

| Item | Antes (1ª rodada) | Depois (ajuste) |
|---|---|---|
| Encontros/combate | `?encounters=0` por padrão (desligado) | **Ligado por padrão**, igual ao jogo real (`?encounters=0` desliga, `encountersOf(params)` sem alteração) |
| Tabela de encontros | `ENCOUNTER_TABLES["lab-piloto-v15b"]` não existia — mapa sem tabela = sem spawn nenhum | **Nova entrada**, a mesma tabela do `digi-forest-v15b` **deslocada** (-4,-6) para o recorte 40×30, sem duplicar dado (`src/sim/encounters/lab-table.ts`, função `shiftEncounterTable`) — as 4 entradas "visível" (Digimon forte, `CREATURE-0007`) caíram todas dentro do recorte depois do deslocamento; áreas de grama fora do recorte são descartadas (não fazem sentido num mapa menor) |
| Criador de Tamer | Desligado por padrão (`?criador=1` ligava) | **Ligado por padrão**, igual ao jogo real (`?criador=0` pula) |
| Parceira padrão | `?partner=agumon` (modo de TESTE, save próprio, **pulava** a tela real "Escolha seu parceiro") | Fluxo real mantido: **criador → escolha do parceiro → mundo**; Agumon DS (D11) entra como **pré-seleção** da tela real (`CREATURE-0005`, Koromon, a linha do Agumon — STARTERS guarda o bebê, não o próprio Agumon) |
| Criador — Link B | Sem presets do laboratório (Tamer v13 padrão) | **2 presets do laboratório**: "Tamer Principal (PixelLab v2)" (com caminhada) e "Tamer P2 (laboratório, placeholder sem caminhada) [ESTÁTICO — sem caminhada, placeholder]" (rotações 56×56 já baixadas no Fase 1 via `export_asset`, 0 gerações novas) |
| Criador — Links A/C | v13 padrão | Sem mudança (v13 padrão, nenhum preset do laboratório existe para A/C) |

### 10.2 Bug encontrado e corrigido nesta rodada: `?inicial=` precisa do id do BEBÊ, não da espécie adulta

A 1ª tentativa forçou `?inicial=CREATURE-0006` (Agumon). A tela "Escolha seu parceiro" mostra os **BEBÊS** (Koromon, Tsunomon, Tokomon, Gigimon, Dorimon), cada um já com a prévia da linha evolutiva ("Koromon Bebê → Agumon Nv.8 → Greymon Nv.16"); `StarterPicker` só aceita um id que esteja na lista de BEBÊS (`STARTERS[].speciesId`) — um id de adulto não bate com nenhum, e a tela cai no 1º da lista por padrão (que, por coincidência de ordem, já era o Koromon — por isso o bug não quebrou nada, só não estava explícito). Corrigido para `?inicial=CREATURE-0005` (Koromon).

### 10.3 Evolução

Nenhum código de evolução foi tocado, em nenhuma das 2 rodadas — o sistema é o mesmo do jogo real, nunca desligado. Não testado ao vivo nesta entrega (exigiria horas de XP para subir de nível); evidência indireta: `tests/evolution.test.ts` (14 testes) passa sem alteração.

### 10.4 Evidências novas (`etapa6-lab/fase2-builds/`)

| Arquivo | O que mostra |
|---|---|
| `criador_link-b_01_grade.png` | **Criador do Link B**: grade com os 2 presets do laboratório, P2 claramente marcado `[ESTÁTICO — sem caminhada, placeholder]` |
| `criador_link-a_01_presets_padrao.png`, `criador_link-c_01_presets_padrao.png` | Links A/C: os 12 presets v13 padrão do jogo, banner "aguardando" no topo |
| `starter_link-b_01_escolha_parceiro.png` | Tela real "Escolha seu parceiro" (não pulada), Koromon pré-selecionado (linha do Agumon) |
| `link-b_mundo_01_apos_escolher_parceiro.png`, `link-b_mundo_02/03_andando_grama.png` | **Tamer com o parceiro**: Kaio (Tamer P1 v2) andando com Koromon Nv.1 ao lado, nome e PV do parceiro no HUD |
| `link-b_combate_debug_painel.png`, `link-b_combate_01_apos_forcar.png`, `link-b_combate_02_depois.png` | **Encontro e combate reais**: painel de debug GS-012 (`?encdebug=1`, só para esta verificação — não fica ligado por padrão) mostra a tabela completa de espécies/raridades carregada para `lab-piloto-v15b` (Agumon, Greymon, WarGreymon etc., as mesmas do jogo real); ao forçar um encontro, um Digimon selvagem (`CREATURE-0113`) entra em `state:"ATTACK"` e causa **39 de dano** no Koromon (barra de PV caindo, borda vermelha no retrato do HUD) — combate de verdade, no mapa, sem tela separada (ADR D3 do Comando 3, "combate em tempo real no próprio mapa, sem tela de batalha separada") |
| `capture-report.json` (sobrescrito nas rodadas anteriores) | FPS/erros de console por link na 1ª rodada; 0 erros em todas as verificações desta 2ª rodada também (conferido via log do Chromium, não re-salvo em JSON) |

### 10.5 Verificação

- `npx tsc --noEmit`: sem erros.
- `npx vitest run`: **496/496** (mesmos números da 1ª rodada; nenhum teste quebrado pelas mudanças).
- `qo`: `git status` limpo, HEAD em `3289e32`, nunca tocado.
- Rebuild dos 3 (`dist-lab-a/b/c`) e os 3 servidores reiniciados nas portas 5191/5192/5193 (mesmos comandos do §4).
- **Nenhuma geração PixelLab**: o Tamer P2 v2 já estava baixado (Fase 1, `export_asset`, grátis) — só reaproveitado pelo M2 (`import-lab-character.mjs`), nenhuma chamada nova ao PixelLab nesta rodada.

### 10.6 Limitações desta rodada

- O encontro de combate mostrado foi **forçado** pelo painel de debug (`?encdebug=1`), não um encontro aleatório real pego andando (a varredura manual por teclado simulado não conseguiu entrar na célula exata de `tall_grass` a tempo dentro do orçamento desta tarefa) — a **mecânica em si** está confirmada ativa (lista de espécies/taxas carregada, entidades selvagens spawnando e andando no mapa, deslocamento de coordenadas correto), só não foi um acionamento 100% orgânico por step aleatório nesta captura específica. O painel de debug **não fica ligado por padrão** (só usado aqui para a verificação).
- Evolução não testada ao vivo (ver §10.3).
- Os 4 "Digimon forte" (CREATURE-0007, visíveis/fightáveis) e as áreas de grama que sobrevivem ao recorte foram confirmados por cálculo de coordenada (x,y dentro de 0..40/0..30 depois do deslocamento), não um a um visualmente no mapa.
