# Etapa 6, Fase 9 — Agumon v6 (PixelLab) no Link A

> Executor: `game-dev` · 2026-11-14 · mandato noturno do fundador. Brief: `fase9-pixellab-d12/BRIEF_GAMEDEV_AGUMON_V6.md`.
> Worktree `~/projects/GameStudio/workspaces/game-dev/lab-etapa6`, branch `lab/etapa6` (partiu de `62aef2d`).
> Só o **Link A** (5191) foi alterado. Jogo principal (`3289e32`), Database e saves: intocados. Custo PixelLab: **0**. Sem push e sem deploy.

## 1. O que mudou

- **Agumon v6 é o padrão no Link A**: caminhada de 8 quadros e ataque Pepper Breath de 9 quadros, nas 4 direções (S/W/E/N), quadros **56×56 entrando 1:1** (D13: nada reescalado nem editado). Vale para o parceiro de `?novo=1` e para encontros.
- **Versões anteriores acessíveis, sem mexer no código**: `?agumon=v5`, `?agumon=v4`, `?fixer=0` (pose única) — as três pastas continuam em `lab-assets/a/digimon/CREATURE-0006/` (`fixer/`, `fixer5/`, `pixellab6/`).
- **Ataque ligado ao evento que já existe** (`attack_start` → estado `ATTACK` do Presenter → `animctl`): o `animctl` já tocava arte de `attack` quando o manifesto a tinha; faltava só o manifesto. `combatStates.ATTACK = "attack"`, `loop:false`, `hitFrame = 3` (quadros 3–4 = disparo). A animação toca **uma vez** (9 × 125 ms) e o controlador volta a `idle`. Regras, dano, recarga e balanceamento **não** foram tocados: o tempo em que o resultado *aparece* passa a seguir o quadro do disparo (regra já existente de `attackTiming`: o dano continua sendo calculado na sim; só a exibição espera o `hitFrame`).
- **Pivô pelo pé** (formato do `fixer5`, campo `pivot` por quadro): `y` = linha opaca mais baixa **de cada quadro** (pé sempre na linha do chão, sem tremer); `x` = mediana por direção/animação (o centro do pé medido por quadro oscila 4–8 px porque a perna de apoio alterna; usado direto faria o bicho deslizar de lado — lição da v5). Pivôs usados no andar: S x28, W x29, E x27, N x27.
- **Pose parada**: `rotations/<dir>.png` do pacote (1 quadro por direção); o motor aplica sozinho o bob de 1 px (regra existente de idle de 1 quadro). Nenhuma respiração nova.
- **Evolução Agumon→Greymon (`?novo=1`)**: a parceira de teste é `CREATURE-0006`, a mesma chave do catálogo; portanto antes de evoluir ela já usa o v6 (verificado ao vivo). O Greymon continua na pose única do Comando 5, **intacto**; ao voltar a Agumon (setPartner) o v6 reaparece.

### Mudanças de código (todas no worktree `lab-etapa6`, pasta `projects/prototypes/GS-003/prototype/world`)
| Arquivo | O que |
|---|---|
| `scripts/lab/import-agumon-v6.mjs` (novo) | copia o pacote 1:1 para `lab-assets/a/digimon/CREATURE-0006/pixellab6/`, mede o pé e escreve `lab-character.json` (+ `attack`) e `_slice-report-v6.json` |
| `src/assets/lab-tamer.ts` | campo opcional `attack` no `LabCharacterManifest` |
| `src/assets/lab-creatures.ts` | globs de `pixellab6/`; `fixerCreatureVisual` monta `attack` (dirFrames, evento `hitFrame`, `combatStates.ATTACK`); `loadLabCreatureVisuals(…, "v6"\|"v5"\|"v4")`, padrão v6 |
| `src/main.ts` | `?agumon=v5\|v4`; sem parâmetro = v6 |
| `src/render/view.ts` | **única alteração de comportamento fora do catálogo**: no golpe, quem **desenha o ataque em S e N** (só o v6) vira para o eixo do alvo (`face4Of`); as demais criaturas seguem a regra antiga (golpe lateral W/E). Sem isso o ataque do v6 sairia sempre de lado. |
| `tests/lab-agumon-v6.test.ts` (novo, 6 testes) | catálogo, quadros 56×56 e pivôs, direções do ataque, ciclo attack→idle no `animctl`, v5/v4/pose única acessíveis |
| `scripts/lab/capture-fase9-agumon-v6.mjs` (novo) | capturas via CDP (andar, ataque por direção, evolução) |

## 2. Como testar

- Link A: `http://127.0.0.1:5191/?novo=1` (v6, padrão) · `…&agumon=v5` · `…&agumon=v4` · `…&fixer=0`.
- Atacar: clique num selvagem (ou encontro na grama alta) — o parceiro ataca sozinho; teclas 1–4 usam o golpe do slot.
- Reconstruir: `VITE_LAB_VARIANT=a npx vite build --outDir dist-lab-a` e servir com
  `setsid nohup npx vite preview --outDir dist-lab-a --port 5191 --strictPort --host 127.0.0.1 > /tmp/lab-a-5191.log 2>&1 < /dev/null &`
- Recapturar: `NO_PROXY=127.0.0.1 node scripts/lab/capture-fase9-agumon-v6.mjs` (variáveis `ATK_DIRS`, `ATK_TILE`, `SKIP_WALK`, `EVO`; `--url-extra="&agumon=v5"` para comparar).

## 3. Verificação (números)

- `tsc --noEmit`: sem erros. `vitest`: **515/515** (509 de antes + 6 novos), 56 arquivos. `map:validate --no-write`: **PASS em 9/9 mapas** (nenhum relatório versionado alterado).
- Build `dist-lab-a` ok (o aviso de chunk > 500 kB já existia).
- Portas: **5191 = 200** (v6, processo novo `setsid`, desacoplado da sessão), **5192 = 200** (pid 146750, intocado), **5193 = 200** (pid 97714, intocado).
- Console do navegador: **0 erros** em todas as rodadas (`consoleErrors: []` em `capture-report*.json`).
- **Andar nas 4 direções, pé na linha do chão**: o pivô `y` é o pé de cada quadro, portanto a linha do chão na tela não varia (0 px de tremida vertical por construção). Sem esse pivô, o pé cru oscilaria 1 px (S), 2 px (W), 3 px (E) e 3 px (N) entre quadros. Em x, o centro do pé medido oscila 8/8/7/4 px entre quadros (S/W/E/N); fica o pivô fixo por direção, então o corpo balança com o desenho, sem deslizar. O bob do idle é o de 1 px do motor.
- **Ataque, ao vivo (amostrado a cada ~35 ms, 4 direções)**: sequência `idle → attack_<dir>_00 … _08 → idle_<dir>`, **uma vez**, na direção correta (S/W/E/N), sem repetir os quadros fora de ordem (amostragem salta alguns quadros, nunca volta). Evidência: `capture-report.json` → `attacks.*.keys`.
- `?agumon=v5` mostra a v5 (manifest "ficha v5…", capturas `*_agumonv5.png`); o teste unitário cobre v4 e pose única.

## 4. Capturas (esta pasta)

| Arquivo | O que mostra |
|---|---|
| `01_parado_sul.png` | parado, de frente |
| `02_andando_frente_sul.png`, `03_andando_lado_oeste.png`, `05_andando_lado_leste.png`, `04_andando_costas_norte.png` | andando em frente / lado (W e E) / costas |
| `06_ataque_pepper_breath_{S,W,E,N}_q03.png` (+ `q04`) | quadros 3 e 4 do Pepper Breath em cada direção |
| `07_evolucao_greymon_intacto.png`, `07_evolucao_agumon_v6_de_volta.png` | Greymon (pose única, intacto) e o Agumon v6 de volta |
| `*_zoom.png` | recorte 3× em torno do Agumon de cada captura |
| `folha_contato_v6.png` | 8 recortes (andar S/W/N/E e ataque S/W/E/N) numa folha |
| `folha_quadros_v6_pivo_no_pe.png` | todos os quadros do pacote 2× com o pivô (traço magenta) no pé |
| `*_agumonv5.png` | mesmas cenas com `?agumon=v5`, para comparar |
| `capture-report.json`, `capture-report_agumonv5.json`, `capture-report-evolucao.json` | dados brutos (erros de console, sequência de quadros do ataque, nomes dos manifestos) |

## 5. Problemas e observações

1. **Defeito de arte — costas (N) do Agumon**: a vista de costas (andar e ataque) sai como um corpo liso sem braços, pernas ou cauda legíveis (ver `folha_quadros_v6_pivo_no_pe.png`, linhas 4 e 8). É o desenho do pacote; **não foi corrigido** (proibido editar a arte). Fica para o `game-art`/QA.
2. **Idle sem animação própria** (1 quadro por direção, só o bob de 1 px): o pacote não trouxe prancha de idle.
3. **Atenção ao tempo do ataque**: o Pepper Breath dura 1125 ms e o disparo (hitFrame 3) cai em 375 ms; o ataque procedural antigo durava 380 ms (disparo em 160 ms). Só a *exibição* do resultado muda (a sim e o dano não); se o fundador achar lento, o ajuste é `fps_sugerido.attack` (8 → 10/12) em `import-agumon-v6.mjs`. Não alterei por estar fora do brief.
4. **Teste depende de arquivos fora do worktree**: `lab-assets/` vive em `etapa6-lab/` da checkout raiz (como na v5, não é versionado no `lab/etapa6`). Os testes `tests/lab-agumon-v6.test.ts` só passam onde essa pasta existe (aqui, sim). O importador reproduz a pasta a partir de `pacote_agumon_v6/`.
5. **Processo da 5191**: o pid 187780 já não existia; o primeiro preview que subi morreu junto com um comando abortado do meu shell. O atual (pid 197229, `setsid`) tem sessão própria. Se cair, usar o comando de §2.
6. **Capturas**: a parceira pode ficar atrás do Tamer em trocas curtas de direção (regra `FOLLOW` existente); por isso as capturas teletransportam o par a um tile aberto antes de cada direção. Os ganchos `window.__gs003` seguem no build (só laboratório, não publicado).
7. Não testado: ataque contra selvagens em movimento real na grama alta durante uma partida longa; só encontros forçados com o alvo posicionado por direção (o alvo foi reposicionado por script para cobrir as 4 direções).

## 6. Decisões do fundador / próximos passos

- Aprovar (ou não) a arte do v6, em especial as costas (item 1) e a duração do ataque (item 3).
- Decidir se o hurt/derrota/vitória do v6 também vira arte (hoje usam os efeitos procedurais existentes).
