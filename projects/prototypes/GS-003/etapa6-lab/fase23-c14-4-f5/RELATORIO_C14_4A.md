# Relatório C14.4-A: cadência de 50 ms do Hawkmon + Agumon de comparação em N/S

**Data:** 2026-11-15 · **Autor:** game-dev (Opus 5.5) · **Status:** build no ar na 5197, **não homologado**. Próximos passos: game-qa, depois ChatGPT, depois Vitor.
Fan game não oficial e não licenciado. Uso só local; nada foi publicado. Hawkmon e Agumon são espécies oficiais de Digimon (Bandai/Toei); os sprites são adaptação do estúdio.

## 0. Resumo

- **Hawkmon a ~50 ms por quadro por padrão**, sem nenhum parâmetro na URL.
  - Medido na velocidade normal: **mediana de 50 ms** nas 4 direções (média de 49,5 a 51,7 ms).
  - Passo de 5 px por quadro, a 88–92 px/s, com 0 quadros pulados.
  - Antes eram 16,7 ms (média de 20,4 a 20,8 ms) com passo de 2 px.
- **`&hawkms=` e `&hawkpx=` continuam funcionando.**
  - `&hawkms=73`: 66,7 ms (7,3 px por quadro).
  - `&hawkpx=2`: 16,7 ms (2 px), que é o comportamento antigo.
- **Agumon de comparação volta a andar em N/S.**
  - Antes: 0 quadros de walk em N e em S.
  - Depois: 24 a 27 quadros por trecho, mediana de 116,6 ms.
  - **O defeito era da ferramenta de teste** (a formação do Tamer de comparação), não do Agumon nem do motor. A correção ficou só nela.
- **Agumon, Tamer e `WORLD` não mudaram.**
  - Agumon como parceiro principal (`&parceiro=agumon`): 116,6 ms, 11 px por quadro, 89–92 px/s. São os mesmos números do 14.3.
  - Tamer: 91–93 px/s, igual antes e depois. `WORLD` não foi tocado.
- **Validação:**
  - `tsc` sem erros;
  - `vitest` 526/530, com as **mesmas 4 falhas antigas** de `lab-duas-linhas.test.ts`, igual ao 14.3;
  - `map:validate --no-write` 9/9 PASS;
  - **0 erros de console e 0 falhas de rede** em 11 sessões.
- **Commit local `3dd8837`** na branch `lab/hawkmon-v1b`. `dist-lab-hawkmon` recompilado e serviço `gs003-lab-hawkmon-5197` religado. Sem push, sem merge, sem deploy e sem PixelLab.

## 1. Links de teste (só nesta máquina)

| Link | O que mostra |
|---|---|
| http://127.0.0.1:5197/?novo=1&time=dia | **padrão novo**: Hawkmon a ~50 ms por quadro, Agumon F7v2 ao lado |
| http://127.0.0.1:5197/?novo=1&time=dia&hawkms=73 | alternativa de 73 ms (o pé escorrega ~5 px por quadro) |
| http://127.0.0.1:5197/?novo=1&time=dia&hawkpx=2 | padrão antigo (pé travado, ~17–20 ms por quadro) |
| http://127.0.0.1:5197/?novo=1&time=dia&parceiro=agumon | Agumon como parceiro ativo e Hawkmon ao lado (também a 50 ms) |
| http://127.0.0.1:5197/?novo=1&time=dia&comparar=0 | sem o Tamer de comparação |

A faixa roxa no topo agora mostra o passo em uso, por exemplo "walk ~50 ms/quadro" ou "walk ~73 ms/quadro (URL)". Fonte: `medicoes/links.json`, que registra a faixa, o passo e 0 erros em cada link.

**Teclas:** iguais às do 14.3 (`WASD`, `Shift` para andar lento, `Tab`, `Esc`).

## 2. Medições antes e depois [E]

**Como medi:**
- Chromium headless, 1280×720, rAF a ~60 Hz, sem GPU (medição indicativa).
- Roteiros `tools/h143/walk.mjs` e `analisa.mjs`, sem alteração, com `QA_OUT=fase23-c14-4-f5/medicoes`.
- Trechos de 2,5 s por direção, na velocidade normal e no lento (Shift).
- Valores em ms por quadro (mediana / média), px andados por quadro e velocidade.

### 2.1 Hawkmon, velocidade normal

| Rodada | E | W | N | S | Pulos |
|---|---|---|---|---|---|
| **Antes** (`antes`, padrão 2 px) | 16,7 / 20,4 · 2 px · 92 px/s | 16,7 / 20,6 · 2 · 91 | 16,7 / 20,8 · 2 · 88 | 16,7 / 20,6 · 2 · 91 | 0/440 |
| **Depois** (`depois`, sem parâmetro) | **50 / 51,7 · 5 px · 92** | **50 / 50,4 · 5 · 91** | **50 / 51,0 · 5 · 88** | **50 / 51,4 · 5 · 91** | 0/175 |
| Depois, repetição (`depois_r2`) | 50 / 51,4 · 5 · 92 | 50 / 50,7 · 5 · 91 | 50 / 49,5 · 4,8 · 89 | 50 / 51,4 · 5 · 91 | 0/177 |
| Depois, `&hawkms=73` | 66,8 · 7,3 · 92 | 66,7 · 7,3 · 91 | 66,7 · 7,0 · 89 | 66,7 · 7,3 · 91 | 0 |
| Depois, `&hawkpx=2` | 16,7 · 2 · 92 | 16,7 · 2 · 90 | 16,7 · 2 · 89 | 16,7 · 2 · 91 | 0 |

**Observações:**
- **Critério 1 atendido:** 50 ms (±5) por quadro, dentro da faixa de 45–55 ms do QA.
- A 60 Hz, cada pose fica 3 rAF estáveis. Os q5–q6 da E/W ficam 50 ms cada, com uma ou outra ocorrência de 67 ms.
- O valor máximo isolado, de 100 ms, é a entrada ou a saída da walk.
- **No lento (Shift), o passo de 5 px dá 117–133 ms por quadro** a ~38 px/s. Antes eram 50 ms com 2 px. Isso é consequência do passo fixo e fica registrado; o Shift é só modo de teste.

### 2.2 Agumon F7v2, Tamer e velocidade global

| Medida | Antes | Depois |
|---|---|---|
| Agumon de comparação E/W | 116,6 ms · 11 px · 86–88 px/s | 116,6–116,7 ms · 10–10,3 px · 74–81 px/s |
| **Agumon de comparação N/S** | **0 quadros de walk (não anda)** | **116,6–116,7 ms · 9,3–9,6 px · 82–83 px/s · 24–27 quadros** |
| Agumon como parceiro principal (`&parceiro=agumon`) | 116,6 ms · 10,3–11 px · 89–91 px/s (14.3, `walk_analise_padrao`) | **116,6–116,7 ms · 11 px · 89–92 px/s** (`depois_agumon_ativo`) |
| Tamer local | 91–93 px/s (lento: 38) | 91–93 px/s (lento: 38) |
| `WORLD` (`params.ts`) | tamerSpeed 5, partnerSpeed 5 | **não alterado** (o diff do commit só toca `main.ts`) |

**Observações:**
- [E] O código do Agumon não mudou: nem o manifesto, nem o `animctl`, nem a `view`.
- [E] A cadência do Agumon como parceiro principal é idêntica à do 14.3.
- [E/H] No Agumon *de comparação*, a velocidade média medida caiu (74–83 px/s) e o px por quadro ficou em 9–10. A causa é o percurso do Tamer de comparação, que agora às vezes segue a trilha e faz curvas para se reagrupar, e não o tempo de quadro. A mediana continua em 116,6 ms.

## 3. Agumon que não andava em N/S: causa e correção [E]

**Diagnóstico** (`tools/h143/diag_cmp.mjs`, saída em `medicoes/diag_antes.json`):
- O Tamer de comparação fica em formação 3 tiles à direita do Tamer local e recebe `move_to` para esse ponto a cada tick.
- Indo para N a partir do início do mapa, a coluna dele bate num obstáculo em y = 242 sub. Ele fica no estado "WALK" contra o obstáculo, sem sair do lugar, durante todo o trecho.
- O `stuckTicks` da sim zera a cada `move_to` reenviado, por isso a sim nunca desiste.
- Como o Tamer de comparação não se afasta, o Agumon dele não segue e fica em IDLE.
- No S, o alvo começa ao norte (ainda bloqueado) e só fica livre no fim do trecho.
- **Conclusão: o defeito é da ferramenta de teste** (a regra de formação do lab), não do Agumon, do motor nem da sim.

**Correção** (só em `main.ts`, só no build hawkmon, função `followFormation`):
- Se o Tamer de comparação fica 2 ticks sem se mover com a formação longe, ou se o ponto da formação é sólido, ele passa a seguir a **trilha do Tamer local**, 4 tiles atrás (`CMP_TRAIL_DIST`). É um caminho que acabou de ser andado, portanto livre.
- Ao começar ou parar de andar, ele tenta a formação de novo.
- Parado e com a formação bloqueada, ele fica onde está, sem insistir contra o obstáculo.
- A sim e o motor não mudaram.

**Depois** (`medicoes/diag_depois.json`, `walk_analise_depois*.json`): o Tamer de comparação e o Agumon andam nas 4 direções. No N, o Agumon fica atrás, em fila com o seu grupo, e volta ao lado quando a formação fica livre.

## 4. O que mudou no código (commit `3dd8837`, `lab/hawkmon-v1b`)

Arquivo único: `src/main.ts` (+42/−8). Tudo vale só com `VITE_LAB_BUILD=hawkmon`.

- `HAWK_WALK_PX_DEFAULT = 5`: passo padrão da walk do Hawkmon neste build (5 px a 100 px/s = 50 ms por quadro). `?hawkpx=` e `?hawkms=` vencem esse padrão.
  - **O manifesto do pacote (`lab-character.json`, `walkPxPerFrame: 2`) não foi alterado** (sem tocar em arte nem em assets). O padrão novo é aplicado na carga, no mesmo ponto onde a URL já aplicava.
- `followFormation(walking)`: modo trilha quando a formação trava (§3).
- Faixa do topo: "C14.3 + C14.4-A" e o passo em uso.

**Build e serviço:**
- Build: `VITE_LAB_VARIANT=a VITE_LAB_ASSETS_DIR=a-hawkmon VITE_LAB_BUILD=hawkmon npx vite build --outDir dist-lab-hawkmon` (2026-11-15, ~20:55).
- Serviço: `gs003-lab-hawkmon-5197` religado com o comando do `PROGRESS` da fase 21 (`systemd-run --user …`), depois `restart` após o ajuste da faixa. Status `active`, HTTP 200.
- [E] As medições do §2 foram feitas no build anterior ao ajuste da faixa. A lógica é a mesma; só o texto da faixa mudou. `links.json` foi gerado no build final.

## 5. Testes [E]

| Teste | Resultado |
|---|---|
| `npx tsc --noEmit` | 0 erros |
| `npx vitest run` | 526/530. As 4 falhas são as antigas de `tests/lab-duas-linhas.test.ts`, as mesmas do 14.3, do F7v2 e do `lab/etapa6`. Nenhuma falha nova |
| `npm run map:validate -- --no-write` | 9/9 PASS, sem reescrever relatório |
| Console e rede | 0 erros e 0 falhas em 11 sessões: `walk` antes, depois, depois_r2, ms73, px2 e agumon_ativo; `diag` antes e depois; `faixa` com 5 links |
| Isolamento | Database: `md5sum data/*.json \| md5sum` = `8b71f53e…`, igual. `dist-lab-a` (11-14 09:04) e `dist-lab-f7v2` (11-14 22:54) intocados. 5196 ativo (200) |

**Sobre a 5191:** já não estava rodando quando comecei (não aparece entre os serviços; HTTP 000). Não a toquei, conforme o brief. Provavelmente caiu no reboot; para religá-la é preciso uma ordem do `game-studio`.

## 6. Limitações e o que não foi feito

- Medição em headless sem GPU, a 60 Hz. Não testei em monitor de 120/144 Hz. A 50 ms isso pesa menos que a 17 ms, mas não foi validado.
- Não refiz GIFs nem reconstruções (`recon_*`). As comparações visuais de 50 ms continuam sendo as do QA (`fase21-build-hawkmon/qa_independente/cadencias_E*.gif`). Não houve leitura visual minha; ela fica com o game-qa, o ChatGPT e o Vitor.
- O manifesto do pacote continua com 2 px. Se o Vitor adotar 50 ms em definitivo e a walk for refeita sobre a arte nova (C15a), a cadência precisa ser re-medida com a passada nova. O mecanismo (`walkPxPerFrame` e o padrão por build) continua o mesmo.
- O pulinho dos q5–q6 a 50 ms (P3, arte) não foi tocado.
- O Q3 do QA (a faixa não muda depois do `Tab`) continua sem correção, fora do escopo.
- O formato de save não mudou.
- Nenhuma arte, sprite ou asset alterado. Sem PixelLab, sem merge, sem push, sem deploy. Jogo principal, Database, 5191 e 5196 não foram tocados.

## 7. Evidências (`fase23-c14-4-f5/medicoes/`)

| Arquivo | O que contém |
|---|---|
| `walk_antes.json`, `walk_log_antes.json`, `walk_analise_antes.json` | antes (build 34327c7) |
| `walk_*depois*.json` (`depois`, `depois_r2`, `depois_ms73`, `depois_px2`, `depois_agumon_ativo`) | depois |
| `diag_antes.json`, `diag_depois.json` | posições na sim (Tamer local, Tamer de comparação, parceiras), tick a tick |
| `links.json` | os 5 links com `&time=dia`: faixa, passo do Hawkmon e erros |

**Roteiros novos** (fora do jogo, em `workspaces/game-dev/tools/h143/`):
- `diag_cmp.mjs`: diagnóstico da formação;
- `faixa.mjs`: conferência dos links.

## 8. Decisões do fundador / ChatGPT

1. Confirmar os 50 ms como cadência do Hawkmon depois do QA, ou escolher 73 ms ou 2 px pela URL.
2. Se o C15a (arte nova) for adotado, refazer a walk e re-medir a cadência.
3. Religar a 5191, se ainda for usada (fora do meu escopo nesta tarefa).

## Crédito
Hawkmon e Agumon são espécies oficiais de Digimon (Bandai/Toei). Este é um fangame não oficial, sem licença. Os sprites são adaptação do estúdio. Camada `private-prototype`. **Não homologado.**
