# Gabumon à mão (64px) vs. Guilmon PixelLab v3 — prova de custo x qualidade

- **Autor:** game-art, papel GAME-ART-DIRECTOR · **Data:** 2026-11-10
- **Pedido:** fundador, via coordenador `game-studio`: "fazer o Gabumon à mão, zero PixelLab/IA generativa, para jogar com os dois no teste (trocar entre eles) e comparar custo x qualidade."
- **Tempo gasto:** sessão aberta **06:19** (exploração do projeto/referências), primeiro `mkdir` do pipeline em **06:26:36**, commit final em **06:44:12** (timestamps reais de `date -Iseconds`/`git log`, não estimados) → **≈25 minutos** de ponta a ponta (exploração + pipeline + arte + animação + empacotamento + prancha + GIFs + relatório + commit). **0 gerações PixelLab gastas**: as únicas chamadas ao PixelLab foram `get_upload_url` + `pixelart_workbench inspect/crop` (leitura, grátis) para medir a escala do Guilmon v3 de referência — zero `create_*`/`animate_*`/`edit_*`/`inpaint_*`.

---

## 1. O que foi feito

Pipeline 100% local, sem nenhuma chamada de geração de IA (nenhum `create_*`, `animate_*`, `edit_*`, `inpaint_*` do PixelLab foi usado nos pixels finais):

1. **`src/png.js`** — encoder/decoder PNG puro-stdlib (zlib do Node), sem `canvas`/`pngjs`/`sharp`/`PIL` (nenhum instalado no host). Testado com round-trip exato contra o PNG do Guilmon v3.
2. **`src/canvas.js`** — "Canvas.js" próprio: `set/rect/ellipse/ellipseShaded/polygon/line/grid/pixels/autoOutline/composite` sobre um buffer RGBA cru. `ellipseShaded` faz sombreamento tipo toon (produto escalar de uma pseudo-normal elíptica com uma direção de luz) em 3-4 tons (hi/mid/lo/ao).
3. **`src/gabumon.js`** — a criatura: geometria paramétrica (elipses para cabeça/tronco, polígonos para orelhas/cauda/chifre, grid/pixels para olhos/boca), escalada por um fator `S` e ancorada num `FOOT_Y` fixo para bater a escala do Guilmon v3 medido.
4. **`src/generate.js`** — gera as 28 poses (6 idle + 8 walk, x2 direções) variando `bodyBob/earSway/tailSway/legL/legR` por fórmula (seno), sem desenhar quadro a quadro na mão — mas cada fórmula e cada parâmetro de forma foi decidido por mim, não por um modelo generativo.
5. **`src/gif.js`** — encoder GIF89a + LZW próprio (sem deps), validado com um parser de blocos GIF que confirma contagem de quadros e ausência de bytes inesperados.
6. **`src/compose_board.js`** — prancha comparativa (compositing puro, sem geração).

Referência visual: só *olhei* (via `view_image`) os previews de `CREATURE-0009` (rip oficial Digimon World DS já no projeto) para pegar silhueta/paleta geral — pelagem azul-esbranquiçada com listras roxas, chifre amarelo, capuz de pelo, patas amarelas. Nenhum pixel foi traçado, copiado ou usado como `init_image`/referência de IA. Detalhes completos em `license.json` (camada `original`, `fanException: true`, `basis: ADR-007`, mesmo padrão do exemplo Agumon do `ASSET_LICENSE_POLICY.md` §4).

### Bug encontrado e corrigido no caminho

A primeira versão de `ellipseShaded` tinha um bug real (raio fracionário gerava coordenada de linha não-inteira que vazava pixels pra linha/coluna errada do buffer — sintoma: duas manchas cinzas grudadas nas bordas do canvas). Corrigido trocando o loop para iterar em coordenadas absolutas inteiras com `floor/ceil` dos limites. Documentado aqui porque é o tipo de erro que character dumps "parecia ok" teria escondido — só foi pego porque fiz `bbox()` e vi `width: 64` onde devia ser ~20.

---

## 2. Medição — escala contra o Guilmon v3 (mesmo critério do `REANIM_REPORT.md`)

Guilmon v3 (`phase2/art/scale-proof-v3-reanim/fixed/idle-s/frame_000.png`), medido com o mesmo decoder PNG: **bbox {h: 32px, footY: 47, cx: 32}**.

Gabumon à mão, medido nos 28 quadros finais (script próprio, sem PIL):

| Métrica | Guilmon v3 (alvo) | Gabumon à mão |
|---|---:|---:|
| Altura do corpo | 32px | **32–33px** (28/28 quadros) |
| Y do pé (base) | 47 (variação ±1px no teste reanim) | **49, 0px de variação em 28/28 quadros** |
| Cores opacas | 17 (paleta travada de 18) | **14** (teto pedido: 15–20) |
| Outline | 1px preto, IA | **1px, determinístico (`autoOutline`, vizinhança 4-dir)** |
| Canvas | 64×64 | 64×64 |

O pé do Gabumon é mais estável que o do próprio Guilmon v3 (0px de variação vs. até 1px) porque o pivô nunca foi "desenhado" livre — é uma constante (`FOOT_Y=49`) que toda pose usa como âncora, uma vantagem estrutural do pipeline por código, não da minha habilidade de desenhista.

---

## 3. Entregas

- **Jogo-pronto:** `assets/GAME-ASSETS/01-creatures/CREATURE-0119-gabumon-hand64/`
  - `creature.json` (pivô no pé, idle com respiração real de 6 quadros — não é o quadro do meio do walk, ao contrário do padrão do rip oficial —, walk de 8 quadros, S e SW)
  - `license.json` (camada `original`, exceção ADR-007, sem rip, autoria própria)
  - `sprites/` — 28 PNGs (`CREATURE-0119_{idle,walk}_{S,SW}_NN.png`)
  - `previews/` — prancha comparativa (PNG, 1x e 4x) + 4 GIFs (idle/walk x S/SW)
  - `source/` — cópia dos 5 scripts geradores
- **Processo/prova:** `projects/prototypes/GS-003/quality-overhaul/phase2/art/gabumon-hand64/`
  - `src/` (os 6 scripts), `frames/` (28 PNGs brutos + `manifest.json` com a pose de cada quadro), `board/` (prancha + GIFs antes de copiar pro asset), este `REPORT.md`

### Prancha comparativa

`projects/prototypes/GS-003/quality-overhaul/phase2/art/gabumon-hand64/board/compare_board_x4.png` (cópia em `assets/.../previews/compare_board_guilmon_vs_gabumon_x4.png`): 4 células na mesma linha de chão — **Guilmon (PixelLab v3)** | **Gabumon (à mão)** | **Tamer (TAMER-0001, 2x nearest pra igualar a densidade de pixel)** | **1 tile de grama (forest-v5, 2x)**, barra de cor embaixo de cada um como legenda (vermelho/roxo/verde/cinza).

---

## 4. O que NÃO foi feito (por tempo, não por limite técnico)

- **Direções W/E:** não deu tempo. S e SW estão completos (idle+walk); W/E ficam para uma próxima rodada se o fundador quiser (o pipeline paramétrico torna isso rápido — é outro `turn`/ângulo na mesma função, não um redesenho do zero).
- **Braços animados:** as patas dianteiras são estáticas (parte do corpo), não balançam contra-fase com as pernas no walk. Detalhe de realismo que o Guilmon (IA) provavelmente acerta sozinho; aqui ficou de fora conscientemente pra não estourar o tempo.
- **View SW é um "turn" paramétrico** (deslocamento/encolhimento do lado distante), não uma reprojeção de perspectiva de verdade. Funciona e é estável, mas é visivelmente mais simples que uma rotação real de 3/4.
- **attack/hurt/battle_*:** não foram pedidos nesta tarefa e não foram inventados.

---

## 5. Veredito do diretor (franco, pedido explícito do fundador)

**Qualidade:** o Guilmon v3 (PixelLab) tem um acabamento visivelmente superior — sombreamento mais rico, silhueta mais expressiva, consistência entre direções que vem de um modelo treinado nisso. O Gabumon à mão é **reconhecível, limpo, na escala certa, com pé 100% estável e paleta sob controle**, mas o sombreamento é claramente "geométrico" (elipses com produto escalar, 3-4 tons regulares) em vez de pincelada autoral, e a view SW é uma aproximação, não uma pose nova de verdade.

**Custo:** o Gabumon à mão gastou **0 gerações/créditos PixelLab** e **≈25 minutos de um agente** (ponta a ponta, commit incluso). Para comparação, o teste Guilmon v3 citado (`REANIM_REPORT.md`) gastou **2,0 gerações pagas** só na etapa de reanimação (fora o custo original de criação do personagem, que o relatório cita como "6 gerações já pagas na v3" antes disso) — ou seja, o Guilmon v3 testado já carrega pelo menos ~8 gerações acumuladas antes de qualquer QA, enquanto o Gabumon à mão não gastou nenhuma, a qualquer momento do processo.

**Recomendação:** para um roster de produção, PixelLab (ou uma revisão manual em cima do PixelLab) ainda dá o acabamento mais rápido por geração nova. O pipeline à mão vale a pena quando: (a) o orçamento de gerações está apertado, (b) o estúdio quer uma criatura 100% original sem depender de IA generativa (ex. para reduzir risco de disputa de autoria/estilo), ou (c) como neste caso, pra ter uma régua honesta de "o que dá pra fazer sem gastar nada". Não recomendo trocar o pipeline de produção padrão por este — recomendo mantê-lo como opção de baixo custo para criaturas secundárias ou para quando o saldo de créditos acabar.

---

## 6. Limitações desta entrega

- Medições de bbox/cor são de um script próprio (sem PIL/ImageMagick no host) — revisadas visualmente, mas não é um QA independente (ADR-012 §3 pede revisão por outro agente antes de aprovar).
- `approvalStatus: UNDER_REVIEW` em `creature.json` — não aprovo meu próprio trabalho.
- A integração real no jogo (colocar os dois Digimon no roster/equipe, trocar entre eles no teste) é trabalho de `game-dev`; esta tarefa entrega os assets prontos (mesmo formato `creature.json` do Guilmon) mas não toca em nenhum código do jogo.
