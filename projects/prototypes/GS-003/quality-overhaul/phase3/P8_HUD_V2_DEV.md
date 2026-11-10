# P8 — HUD v2, itens P0, atrás de `?hud=v2` (game-dev)

- **Autor:** game-dev (GS-003) · **Data:** 2026-11-10 (sessão noturna autorizada pelo fundador)
- **Branch:** `quality-overhaul`, worktree `~/projects/GameStudio/workspaces/game-dev/qo`. Commits desta entrega: `0025e2d`, `2c46726`, `577e1dd`, `3ffbe55` e o commit deste relatório. Nada foi feito no `master` nem na porta 5174. **0 gerações PixelLab** foram usadas. Nada foi publicado nem apagado.
- **Entradas:** `phase2/design/P8_HUD_V2_SPEC.md` (§9: lista de P0) + `p8_mockups/*.svg`. QA: `phase2/qa/QA_P8_AND_V3FIX.md` (no checkout do master), "pronta COM condições". Escala do Tamer: `ART_DIRECTION_V2.md` §1.5 (game-art, `dbe67e6`, entrou pelo merge `9719c03` enquanto eu trabalhava).
- **Legenda:** **[E]** evidência (arquivo, comando ou medição de 2026-11-10) · **[H]** hipótese/julgamento.
- **Caminhos de código** são relativos a `GS-003/prototype/world/`.

## 0. Resumo

Os 5 itens P0 da spec (§9 a–e) estão implementados atrás de `?hud=v2`. **Sem a flag, o HUD atual não muda.** Isto é verificado por teste: nenhuma classe ou bloco v2 entra no DOM, e todo seletor CSS novo começa com `.hud-v2`.

| P0 | Item | Estado | Onde |
|---|---|---|---|
| (a) | Moldura nível 1 que reage ao PV no Tamer, no parceiro e no alvo | **Atendido.** O alvo usa a borda de raridade, e a barra de PV dele usa as faixas do §2.1 (ver §2). | `src/ui/hud-v2.ts`, `style.css` (bloco "P8 — HUD v2"), `src/render/targetplate.ts` |
| (b) | Bloco novo do Tamer, com PV e Energia | **Atendido**, com 2 ressalvas: a Energia é só visual, e o retrato é placeholder (condição 1 do QA) | `tamerBlockHtml`, `Hud.updateTamer` |
| (c) | Hotbar com a borda pela categoria do golpe | **Atendido** | `Hud.paintMoveKinds`, `.hud-v2 .mv[data-kind]` |
| (d) | Placa de alvo com a borda pela raridade + "!" com fundo + timing do §8.1 | **Atendido** no timing da rodada 2 (2,0 s). Critério 10.3 lido na redação corrigida pelo QA. | `targetplate.ts` (`platesFor`, `drawTargetPlate`), `encounterFx.ts` (`v2`, `intro()`, `drawAlertPill`) |
| (e) | Grama alta que se distingue | **Parcial.** A altura vem da arte da R2, já ≥40% [E]. O vento 2× foi implementado. A saturação +10% **não** foi mexida (§3). | `view.ts` (`encGrassSwayMul`, `ENC_GRASS_RE`) |

**Verificação [E]:** num worktree limpo do commit `3ffbe55` (`/tmp/p8verify`, sem o trabalho em andamento de outro agente — ver §6):
- `npm test`: **40 arquivos, 376 testes verdes**. 19 testes são novos: `tests/hud-v2.test.ts` (11) e `tests/targetplate.test.ts` (8).
- `npm run build`: ok.
- `map:validate`: 6 mapas PASS, 0 FAIL.
- `node scripts/encounters/sim.mjs --check`: ok (19 entradas, 7 áreas).

## 1. O que entrou (por bloco da spec)

**Flag.** `hudVariantOf()` só aceita `?hud=v2` exato. `HudOptions.variant` leva a flag para o HUD; `main.ts` liga, só com a flag:
- o bloco do Tamer;
- `encGrassSwayMul: 2`;
- a placa v2;
- `EncounterFx({ v2 })`.

Parâmetro de teste: `?tamerhp=N` (0–100, só com `hud=v2`) força o PV mostrado do Tamer, porque a sim não dá dano ao Tamer hoje.

**Moldura nível 1 (§2, §2.1).** Classe `.f1`:
- borda de 3 px na cor do estado (`--ui-green` / `--ui-gold` / `--ui-red`);
- fundo `rgba(14,16,24,0.78)`;
- cantos cortados com `clip-path` (chanfro de 4 px), **sem `border-radius`**.

Limiares: ≥50% verde, 20–49% dourado, <20% vermelho com pulso de opacidade 1,0↔0,6 a cada 600 ms. O percentual é **truncado** antes da faixa (49,9% conta como dourado). Aplicada ao bloco do Tamer, ao parceiro e ao contêiner da hotbar (este último com a cor neutra).

**Bloco TAMER (§4.1).** Fica à esquerda do parceiro, com:
- retrato 48×48;
- "Nome Lv.N" em 12 px bold;
- PV 68×7 e Energia 68×5, com 2 px entre as barras.

O PV vem da entidade Tamer da sim. A Energia fica sempre cheia e está marcada como provisória no título, porque não tem regra na sim (§12 da spec). Desvio: o bloco tem **136 px, não 120**. A spec fixa 48 + 68 px internos, que não cabem em 120 com borda de 3 px e padding de 4 px (comentário no CSS).

**Retrato do Tamer — condição 1 do QA.** **Não há recorte.** O retrato é um placeholder listrado com moldura e o rótulo "TAMER". O recorte é parametrizável por `TAMER_PORTRAIT_CROP` (`{x,y,w,h,scale}`, escala inteira), hoje `null`, e há um teste garantindo que continua nulo. A §1.5 do `ART_DIRECTION_V2.md` fechou o número (56–64 px nativos), mas a própria seção diz que o sprite atual (30 px) só renderia um retrato provisório. O recorte fica para quando a arte nova existir.

**Parceiro (§4.1).** Moldura nível 1 que reage ao PV. A barra de PV fica dourada ou vermelha conforme a faixa. Um anel de 3 px no retrato usa a cor do **atributo** (Vacina `#4fa8ff`, Dados `#8fe07a`, Vírus `#c77ad1`, Livre `#b8c2d8`). O `world-species.json` não tem campo de elemento, então o anel não pode seguir o elemento como a spec cita (ver 10.2).

**Hotbar (§4.4).** Slot de 52×52 (`box-sizing: border-box`), borda de 3 px chanfrada na cor da categoria do golpe e fundo tingido pelo token `.chip.k-*`.

Cores da borda: são os acentos do `hotbar_target.svg` — físico `#feae34`, especial `#9ad4ff`, buff `#ffd66b`, cura `#8fe07a`. O debuff usa `#c77ad1`, que o mockup não traz. **Não** usei os `k-*` escuros como borda: `#2a3550` com 3 px some sobre o painel [H, visto na captura].

O golpe na fila (`.queued`) continua dourado, porque a seleção tem prioridade (§3/§4.1). Por isso o slot 1 aparece dourado em algumas capturas.

**Placa de alvo (§4.3.1, §8.1).** A placa sai do canvas do mundo e vai para a camada de nomes (resolução de tela). As medidas da spec são px de tela, e o mundo é ampliado ×3: uma placa de 20 px no mundo viraria 60 px. Ela tem:
- 20 px de altura, mínimo de 64 px de largura, padding de 4 px;
- borda de 2 px na cor da raridade (tokens da §1.3);
- fundo `rgba(10,12,18,0.72)`;
- selo "NOVO" de 28×14 (`--ui-gold`, texto `#171a26`).

Regra pura em `platesFor`:
1. A placa aparece **no pouso** (`T_LAND`).
2. No tick em que a sim põe a parceira em combate (`T_FIGHT = INTRO_TICKS × TICK_MS`), a mesma placa ganha a 2ª linha: barra de PV de 4 px, na cor da faixa do §2.1. Ela fica enquanto o selvagem for o alvo da parceira.
3. O selvagem que não virou alvo some como antes (2300→2600 ms).
4. Alvos fora da grama (pontos visíveis) recebem a placa com barra direto.

Para o alvo com placa, o rótulo comum e a barra de PV desenhada no mundo ficam escondidos, para não duplicar (`view.plateIds`). A raridade vem do `wild_appear`; senão, da entrada visível da tabela; senão, "comum".

**"!" (§8.1).** O balão existente ganha uma pílula escura `0,72` atrás. São 2 px de folga no mundo, ≈17×20 px na tela, contra 18×22 da spec.

**Grama (§8.3).** As touceiras `fp4_tall_grass_*` e `fp9_enc_grass_*` balançam com amplitude 2× a do resto (1 → 2 px de arte). As outras chaves de vento não mudam (teste).

## 2. Timing do encontro e critério 10.3 (condição 2 do QA)

A spec §8.1 usa a sequência de 1,2 s do `ENCOUNTER_ARCHITECTURE.md`. A rodada 2 da fase 3 (P1-3 do QA da fase 3, já aprovada) alongou essa sequência para **2,0 s**, em 5 fases. **Mantive a de 2,0 s** e mapeei as peças da spec por fase, não por milissegundo:

| Spec §8.1 | Fase no jogo (R2) |
|---|---|
| farfalhar 0 ms | 0–600 ms |
| "!" 0–350 | 600–1500 ms (com pílula no v2) |
| salto 350–700 | 1000–1500 ms |
| placa 700–1000 | 1500 ms (pouso) |
| placa → barra de PV 1000–1200 | 2000 ms (início do combate) |

**10.3 na redação corrigida do QA** (§1.2.2: "a placa aparece dentro da janela da sequência e não atrasa o início do combate"):
- Teste: a placa não existe antes do pouso, nem quando o selvagem já é alvo e ainda está escondido.
- Teste: ela surge em `T_LAND`.
- Teste: `INTRO_TICKS × TICK_MS === T_FIGHT`. O combate começa no mesmo tick de sempre, porque a placa só lê a fase, nunca a define.

Medição nas capturas [E]: a placa estava presente a 1660–1662 ms do sorteio e com a barra de PV a 2462–2466 ms, nos 2 encontros v2 (dia e noite).

## 3. Grama alta (P0 e) — o que foi e o que não foi feito

Altura, medida no PNG fonte [E]:
- `enc_grass_a/b/c` (arte da R2): 25 px opacos;
- `tuft.png` / `tuft_over_path_a/b`: 7–8 px;
- ou seja, **+210%**, acima dos ≥40% do critério 10.4.

Saturação média (HSV, PNG fonte) [E]: 0,59 contra 0,37.

**Não mexi** na regra de cor do look v9 (`saturationMul 0.95, valueMul 0.9` para `^fp9_enc_grass_`, decisão de arte da R2). Os +10% da spec são relativos à grama comum **depois** do grade, e ajustar isso é decisão de game-art [H]. Esta parte do P0(e) fica pendente.

O QA §1.2.3 lembra que a aprovação da touceira é dependência externa ao P8 (GS-010).

## 4. Checklist dos critérios de aceite (spec §10)

| # | Critério | Estado | Evidência / observação |
|---|---|---|---|
| 10.1a | Texto flutuante com fundo ≥0,70 e contraste ≥4,5:1 em 3 fundos | **Parcial** | A placa v2 tem fundo 0,72. O contraste do texto `#e6e9f2` sobre a pílula composta é **6,6** sobre branco (pior caso), **8,1** sobre areia clara, **11,1** sobre grama de dia e **15,5** à noite [E, cálculo WCAG]. O selo NOVO tem 9,4. O "!" ganhou pílula 0,72, mas o glifo vermelho sobre o balão branco tem **4,3** (é ícone; WCAG pede 3:1 para gráfico, mas abaixo dos 4,5 da spec). Os **rótulos comuns** de nome no mundo seguem só com contorno: isso é o rótulo passivo da §8.2, P1. |
| 10.1b | Nível 1 sem `border-radius`, só `clip-path` | **Atendido** | Teste lê o bloco CSS v2: todo `.f1`/`.mv` tem `border-radius: 0` e `clip-path: var(--chamfer)`. |
| 10.1c | No máximo 2 famílias tipográficas | **Atendido** (2 de 3 telas) | Uma família só (Ubuntu/DejaVu, placeholder da fonte bitmap P2) no HUD em combate e no modal. A tela de diálogo não existe (P2). |
| 10.2a | Bloco Tamer com PV 7 px e Energia 5 px, sempre visível na sessão | **Atendido** | Teste + `p8_hud_v2_{dia,noite}.png`. A Energia é só visual. |
| 10.2b | Borda muda nos 3 limiares exatos | **Atendido** | Teste com 100/50/49/20/19/1 → ok/ok/warn/warn/crit/crit (Tamer e parceiro). Capturas `p8_hud_v2_tamer_{warn,crit}_barra.png` (35% e 12%, via `?tamerhp`). No parceiro, a faixa muda com o dano real do combate. |
| 10.2c | Anel de 3 px no retrato do parceiro na cor do elemento, 3 elementos | **Parcial** | O anel existe e segue a cor do **atributo**: 4 atributos, ≥3 cores distintas testadas contra o `world-species.json`. A espécie não tem campo de elemento, então "Fogo/Água" não é verificável. |
| 10.3a | Placa dentro da janela da sequência, sem atrasar o combate (redação do QA) | **Atendido** | §2 acima (testes + medição nas capturas). |
| 10.3b | Cor da borda = raridade real, forçando as 4 raridades com `?encdebug=1` | **Parcial** | Teste: cada raridade da tabela do piloto tem cor própria, e a cor vem do evento do sorteio. Ao vivo, só **raro** foi forçado e capturado (ciano, dia e noite). As outras 3 não têm captura. |
| 10.3c | Bordas da hotbar mudam por categoria | **Atendido** | Teste com até 4 categorias distintas do `moves.json`; trocar o golpe troca a cor, esvaziar remove. Ao vivo, o Guilmon tem 2 golpes (físico laranja, especial azul). |
| 10.4a | Grama alta ≥40% mais alta que o tufo comum | **Atendido** (arte-fonte) | 25 px contra 7–8 px no PNG (§3). Não medi na captura. |
| 10.4b | Vento visivelmente maior em vídeo de ≥3 s | **Parcial** | Amplitude 2× implementada e testada (máximo de 1 px → 2 px). **Sem vídeo** nesta entrega. |
| 10.4c | 0 encontros com placa sem borda de raridade | **Atendido** | Teste contra `digimon-forest-01.json`; raridade desconhecida cai em "comum", nunca sem cor. |
| 10.5 | Inventário e painel do parceiro | **Não** (fora do P0) | São P1 na §9. |

## 5. Capturas (1920×1080, `?dpr=1&look=v9&anim=v2&encounters=1`, seed 7)

Em `quality-overhaul/phase3/img/`. Os metadados estão em `p8_hud_capture.json`: query, faixa, atributo, categorias da hotbar e ms desde o sorteio. O script é `scripts/p8-capture.mjs`.

- **Sem e com a flag, dia e noite:** `p8_hud_{v1,v2}_{dia,noite}.png` e o recorte da barra inferior `…_barra.png`.
- **Faixas do Tamer:** `p8_hud_v2_tamer_warn_barra.png` (35%, dourado) e `p8_hud_v2_tamer_crit_barra.png` (12%, vermelho).
- **Encontro raro forçado, sem e com a flag, dia e noite:** `p8_hud_{v1,v2}_encontro_{dia,noite}_{1_alerta,2_placa,3_combate,4_combate_barra}.png`. Os tempos são ~760 ms ("!"), ~1660 ms (placa no pouso) e ~2460 ms (placa com barra de PV).

As capturas finais saíram de um vite **na porta 5191**, servido do worktree limpo `/tmp/p8verify` (commit `3ffbe55`). Motivo: a 5190 serve o worktree compartilhado, que tinha mudanças sem commit de outro agente (§6). `p8_hud_capture_enc.json` é de uma rodada anterior na 5190 e foi superado pelo `p8_hud_capture.json`; mantive o arquivo porque nada foi apagado.

## 6. Limitações

- **Worktree compartilhado.** Durante a entrega, outro agente começou a trabalhar no mesmo worktree, sem commit:
  - mudanças em `src/main.ts`, `src/render/view.ts`, `src/style.css` e `src/world/regions.ts`;
  - os arquivos novos `src/render/standpose.ts` e `tests/feedback1.test.ts`. Esse teste hoje quebra o `tsc` do worktree compartilhado (`feedback1.test.ts(77,12)`).

  Commitei **só as minhas mudanças**: o hunk do `main.ts` foi aplicado com `git apply --cached`. A verificação e as capturas foram feitas num worktree limpo. **Não toquei** nos arquivos dele.
- **Arte provisória em código.** A moldura é CSS chanfrado, sem o ornamento "garra" (P1). As fontes são as do sistema (a bitmap é P2). O retrato do Tamer é placeholder.
- **A Energia do Tamer não tem regra** e fica sempre cheia. O **Tamer não toma dano** na sim, então a moldura do Tamer só sai do verde com `?tamerhp`.
- **O timing segue a R2 (2,0 s), não o 1,2 s literal da §8.1** (§2). Se o design quiser voltar ao 1,2 s, é mudança no `INTRO_TICKS` e no `encounterFx`, não neste P8.
- **Sem vídeo** do vento 2× (10.4b). Só o "raro" foi capturado ao vivo (10.3b).
- **A saturação da grama alta não foi alterada** (§3).
- Os itens P1/P2 da spec ficaram fora: minimapa circular, anel no solo, painel do parceiro, inventário, garra, rótulo passivo, diálogo e fonte.
- Desvios de medida documentados: bloco do Tamer com 136 px em vez de 120; acentos do mockup na borda da hotbar em vez dos `k-*` escuros; pílula do "!" ≈17×20 em vez de 18×22, porque fica no grid do mundo ×3.
