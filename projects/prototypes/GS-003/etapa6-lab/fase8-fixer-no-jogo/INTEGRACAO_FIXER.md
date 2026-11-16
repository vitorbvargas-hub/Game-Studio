# Etapa 6, Fase 8 — Agumon e Tamer do Fixer Neural no jogo (Link A)

> Pedido direto do fundador (2026-11-13): "coloca isso no game pra gente testar" — o Agumon e o Tamer da ficha v4
> (ChatGPT) depois de passar pelo Pixel Art Fixer, agora em 4 direções com idle e caminhada.
> Executor: `game-dev` (agente único de execução). Worktree `~/projects/GameStudio/workspaces/game-dev/lab-etapa6`,
> branch `lab/etapa6`, commit desta fase: **`7a2ca55`** (partiu de `ca5f131`).
> Só o **Link A** (porta 5191, Método ChatGPT) foi tocado. Links B (5192) e C (5193) e o jogo principal `qo`
> (worktree em `3289e32`) continuam exatamente como estavam.

## 1. O que mudou

### 1.1 Agumon (CREATURE-0006) — visual de mapa, por padrão

- Antes (Comando 5): uma única pose (retrato A), usada como idle **e** walk nas 4 direções (placeholder).
- Agora: 4 direções desenhadas de verdade (sul/norte/oeste/leste), com **idle** (4 quadros) e **walk** (8 quadros)
  próprios por direção — não é mais a mesma imagem repetida.
- Vale como: parceiro no mundo, parceiro no teste de evolução (`?novo=1`, Nv.20, evolui para Greymon), e Digimon
  selvagem se aparecer na tabela de encontros do Link A (mesmo visual, trocado pelo catálogo `creatures[]`).
- **Greymon e as outras espécies do Método A (koromon, wargreymon, palmon, betamon) não foram tocadas** — continuam
  na pose única de antes, pelos mesmos arquivos de sempre.
- **D13 respeitado:** nenhum redimensionamento. O canvas de cada quadro é 48×48 px (o tamanho da prancha do Fixer);
  o conteúdo desenhado dentro dele mede **25–31 px de altura** nas medições de bounding box (variando por quadro de
  caminhada, perna estendida ou recolhida) — na faixa do DS, como pedido.
- Toggle de segurança: **`?fixer=0`** na URL volta ao comportamento de antes (pose única, Comando 5), sem precisar
  reverter código. Testado e confirmado nesta fase (ver §3, item 10).

### 1.2 Tamer — novo preset no criador, os de antes continuam

- Novo preset no criador de Tamer do Link A: **"Tamer ficha v4 (TESTE — lembra o Tai, não é o Tamer final)"**,
  3º botão da grade, ao lado dos 2 presets A de antes (cabelo preto / cabelo azul, que continuam exatamente como
  estavam — nenhum dos dois foi removido ou alterado).
- 4 direções desenhadas de verdade, com caminhada. **Idle real não foi usado para o Tamer**: a ficha v4 trouxe um
  "idle_sheet" de 4 quadros por direção, mas é quase idêntico à respiração que o motor já simula sobre o quadro de
  rotação (mesma pose, variação mínima) — manter os dois juntos não mudava nada visível que valesse o quadro extra
  de manutenção; só o `walk` real foi ligado (o schema aceita `idle` quando fizer diferença: ver §1.3).
- **Defeito conhecido, medido e contornado:** nos 8 quadros de caminhada de cada direção do Tamer, os quadros 4–7
  (a 2ª metade) saíram **visivelmente menores** que os quadros 0–3 — a cabeça/cabelo aparece cortada/comprimida
  (ver captura `15_tamer_defeito_quadros4a7_zoom.png`). Medido por bounding box de pixels opacos nas 4 direções:

  | Direção | altura quadro 0 | altura quadro 3 | altura quadro 4 | altura quadro 7 |
  |---|---|---|---|---|
  | sul | 33 px | 33 px | 28 px | 29 px |
  | norte | 35 px | 34 px | 31 px | 31 px |
  | oeste | 32 px | 33 px | 28 px | 28 px |
  | leste | 35 px | 35 px | 31 px | 31 px |

  **Decisão tomada:** usar só os quadros 0–3 (consistentes nas 4 direções) para a caminhada do Tamer, em loop —
  uma caminhada de 4 quadros em vez de 8. Os quadros 4–7 foram descartados (não copiados para `lab-assets`).

### 1.3 O que foi construído no motor (reaproveitando o importador M2)

- `scripts/lab/slice-fixer-sheets.mjs` (novo): fatia as pranchas do Fixer Neural (48×48, um quadro ao lado do
  outro) nos quadros avulsos que o importador M2 espera, com a correção de direção pedida no brief
  (`frente→sul, costas→norte, perfil_dir→oeste, perfil_esq→leste` — confirmado visualmente, ver §2 e §4) e pivô
  **fixo** em (x=24, y=43): a ficha declara o pivô no pé em x=24; y=43 foi medido por varredura de alfa e é
  idêntico em 100% dos 104 quadros fatiados. O pivô **não** foi medido quadro a quadro (a medida por quadro variava
  até ±10 px em x conforme a perna de apoio do passo, o que faria o personagem "deslizar" de lado ao andar —
  um artefato que o pivô fixo evita).
- `scripts/lab/import-lab-character.mjs` (M2 existente, **estendido**): agora também importa
  `animations/idle/<dir>/frame_NNN.png` como um campo `idle` opcional do manifesto, ao lado do `walk` que já
  existia. Sem essa pasta (presets A v1/v2, só a vista sul), nada muda — o idle continua caindo no quadro único da
  rotação, como sempre foi.
- `src/assets/lab-tamer.ts`: o schema `LabCharacterManifest` ganhou o campo opcional `idle`; `listLabTamerPresets()`
  (grade do criador) e `loadLabTamerVisual()` (visual de mundo) usam o idle real quando ele existe, com fallback
  para o comportamento de antes quando não existe.
- `src/assets/lab-creatures.ts`: nova subpasta **`digimon/<speciesId>/fixer/lab-character.json`**, reaproveitando o
  mesmo schema e o mesmo importador do Tamer — ao lado (não no lugar) do `lab-creature.json` de pose única que já
  existia. Só quem tem essa subpasta `fixer/` (hoje só o Agumon/CREATURE-0006) ganha o visual novo; as demais
  espécies seguem pelo caminho de sempre. `loadLabCreatureVisuals(fixerEnabled)` decide qual dos dois usar;
  `?fixer=0` passa `fixerEnabled=false`.
- `src/main.ts`: lê `params.get("fixer") !== "0"` e passa para `loadLabCreatureVisuals`.

## 2. Problemas visuais vistos no jogo (não escondidos, registrados para o fundador decidir)

1. **Costas em formato de "bola" (Agumon e Tamer).** A vista de costas (norte) de ambos é um contorno arredondado
   sem feições — sem rosto, sem detalhe de cabelo recortado — visível com clareza nas pranchas isoladas
   (`11_agumon_4dir_idle_contato.png`, linha "north"; `13_tamer_4dir_idle_contato.png`, linha "north"). É um traço
   da ficha v4 original (ChatGPT), não algo que o Fixer ou esta integração introduziu, mas fica mais exposto agora
   que as 4 direções estão realmente em uso (antes só a pose única de frente aparecia, sempre).
2. **Caminhada do Tamer com defeito nos quadros 4–7** (§1.2) — contornado usando só os 4 primeiros quadros, mas é
   a prova de que o processo "ChatGPT + Fixer Neural" ainda produz lotes inconsistentes dentro da mesma ficha.
3. **Escala:** dentro da faixa esperada (Agumon 25–31 px de conteúdo num quadro de 48×48, D13 respeitado, nada
   redimensionado). Não achei um problema de escala Tamer×Agumon que destoe do que já existia nos links A/B.
4. **Artefatos:** nenhum encontrado nos quadros do Agumon (8 quadros de caminhada em cada direção, head-zoom
   conferido — ver `agumon_south_walk_heads_zoom` nas evidências da sessão). Nos quadros 4-7 do Tamer, além de
   menores, a cabeça aparece cortada/comprimida (artefato de "lote 2" — provável geração em duas levas separadas
   pela ficha v4 original).
5. **Parceiro (Agumon) demora para acompanhar a troca de direção do Tamer** em distâncias curtas (regra de
   `followDist`/`FOLLOW` do próprio motor, não desta integração): numa caminhada muito curta ele pode continuar
   de frente por um instante enquanto o Tamer já virou. Isso **não** é um defeito do sprite — é o comportamento de
   "seguir o líder" já existente no jogo, só mais visível agora que o Agumon tem 4 direções reais para mostrar essa
   defasagem.

## 3. Como testar

Servidores: **5191 = Link A (esta fase)**, 5192 = Link B (intocado), 5193 = Link C (intocado).

1. **Agumon novo por padrão, no teste de evolução:**
   `http://127.0.0.1:5191/?novo=1` → escolha qualquer visual do Tamer (ou o preset novo, item 2) → "Entrar no
   mundo" → entra direto com o **Agumon Nv.20** andando junto nas 4 direções (WASD) → em poucos segundos abre
   sozinho o Digivice/Evolução → **Evoluir** no nó do Greymon → Agumon vira Greymon na hora.
2. **Preset novo do Tamer no criador:**
   `http://127.0.0.1:5191/?novo=1` → tela "Crie seu Tamer" → 3º botão da grade, **"Tamer ficha v4 (TESTE — lembra
   o Tai, não é o Tamer final)"**.
3. **Voltar ao comportamento de antes (pose única, Comando 5):**
   `http://127.0.0.1:5191/?novo=1&fixer=0` — o Agumon volta a ser a pose única parada; os presets do Tamer
   continuam os 3 (o novo preset do Tamer não tem toggle próprio porque é aditivo, não substitui nada).
4. Para repetir com um slot limpo, troque `?novo=1` por `?novo=1&seed=<outro número>` ou limpe o localStorage da
   porta 5191 (slot próprio, prefixo `lab-a-c5:`, não toca no save do jogo principal).

## 4. Evidências (nesta pasta)

| Arquivo | O que mostra |
|---|---|
| `01_criador_grade_com_preset_fixer.png` | Criador do Tamer, grade com o preset novo visível |
| `02_criador_preset_fixer_selecionado.png` | Preset novo selecionado (nome, aviso "TESTE") |
| `03_mundo_tamer_fixer_agumon_fixer_sul.png` | Tamer + Agumon no mundo, os dois de frente (sul), com detalhe |
| `04_andando_sul.png` a `07_andando_leste.png` | Caminhada nas 4 direções (o Agumon, seguindo o líder, pode ficar fora do quadro ou um passo atrás — ver §2 item 5) |
| `08_prompt_evolucao.png` | Aviso de Digivolução disponível, Agumon Nv.20 |
| `09_greymon_depois_da_evolucao.png` | Depois de clicar Evoluir: Greymon, mesmo nível, PV recalculado |
| `10_toggle_fixer0_pose_unica_de_antes.png` | `?fixer=0`: Agumon de volta à pose única (prova de que o toggle funciona) |
| `11_agumon_4dir_idle_contato.png` / `12_..._walk_contato.png` | As 4 direções do Agumon lado a lado (idle e caminhada), prancha isolada sem oclusão de cenário |
| `13_tamer_4dir_idle_contato.png` / `14_..._walk_contato.png` | O mesmo para o Tamer |
| `15_tamer_defeito_quadros4a7_zoom.png` | Zoom nas 8 cabeças da caminhada do Tamer — quadros 4-7 visivelmente menores |
| `fase8_navegacao.gif` | GIF curto (556 KB) da sequência: criador → mundo → 4 direções → Greymon |
| `capture-report.json` | Dados brutos da captura (espécie/nível do parceiro antes e depois da evolução, sem erros de console) |

## 5. Verificação técnica

- `npx tsc --noEmit`: sem erros.
- `npx vitest run`: **509/509** (mesmo total de antes da mudança — nenhum teste quebrado, nenhum teste nesta
  fase: a mudança foi aditiva por design e os testes existentes de `lab-a.test.ts`/`singlePoseManifest` continuam
  cobrindo o caminho de pose única, inalterado).
- `dist-lab-a` reconstruído (`npm run build`, `VITE_LAB_VARIANT` padrão `a`); preview da porta 5191 reiniciado.
- **5192 e 5193 não foram tocados**: mesmos processos (PID 146750 e 97714) desde antes desta fase, `dist-lab-b`/
  `dist-lab-c` com a mesma data de modificação de antes.
- `qo` (jogo principal): `git status` limpo, HEAD em `3289e32` — o mesmo commit informado no brief, sem alteração.
- Nenhuma geração PixelLab usada. Nenhum deploy, nenhum push.

## 6. O que não foi feito / decisões do fundador

- **Idle animado do Tamer não foi ligado** (§1.2) — avaliado e descartado por não mudar nada visível que
  justificasse o custo de manutenção extra; se o fundador quiser mesmo assim, o campo `idle` já existe no schema
  e os quadros já fatiados (idle e walk, Agumon e Tamer, incluindo os descartados) estão guardados em
  `_staging-fatiado/` nesta mesma pasta, prontos para reimportar com `import-lab-character.mjs`.
- **Não decidi** se o defeito dos quadros 4-7 do Tamer (§1.2) deve voltar para o `game-art`/processo "ChatGPT +
  Fixer" para gerar de novo, ou se 4 quadros de caminhada bastam para este teste — segui a instrução do brief
  ("use o que funcionar melhor") e documentei a escolha.
- **Não resolvi** o traço de "bola" nas costas (§2 item 1): é da ficha original, não desta integração, e cai nos
  conflitos visuais em aberto da Etapa 6 (identidade visual ainda não homologada) — só registrado como achado.
- Greymon e as outras espécies do Método A continuam na pose única; não foram candidatas a este teste.
