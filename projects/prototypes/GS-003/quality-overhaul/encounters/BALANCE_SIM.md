# GS-012 — Simulação de balanceamento dos encontros aleatórios

- **Autor:** game-dev · **Data:** 2026-11-09
- **Ferramenta:** `prototype/world/scripts/encounters/sim.mjs` (regra em `engine.mjs`, mesmo RNG mulberry32 do jogo)
- **Tabela:** `tables/digimon-forest-01.json` · seed 12012 · 200 000 passos por cenário · passo = 0,32 s · combate simulado = 15 s
- Todos os números são **[E] saída do simulador** com rotas sintéticas. A sensação real só se confirma jogando (passo 9).

## Como rodar (de `prototype/world/`)

```bash
node scripts/encounters/sim.mjs --check          # valida a tabela (espécies reais, enums, referências, 1 comum por área/horário/clima)
node scripts/encounters/sim.mjs --naive          # todos os cenários + regra ingênua 10%/passo para comparar
node scripts/encounters/sim.mjs --seed 7 --set params.pMax=0.3 --set terrains.reeds.baseRate=0.05
node scripts/encounters/sim.mjs --json           # saída para planilha/CI
```

`--set` só altera a cópia em memória; os dados de produção nunca são tocados (GS-012 §11).

## Métricas

- **/100 passos:** encontros a cada 100 passos andando dentro de vegetação.
- **Intervalo:** passos em vegetação entre um encontro e o próximo (p10/p50/p90/p99, mínimo). O "farfalhar vazio" não zera essa contagem.
- **Maior seca:** maior trecho sem encontro.
- **Maior rajada:** maior sequência de encontros com intervalos ≤ 20 passos (≈ 6 s de grama) entre si.
- **Máx. em 100:** maior número de encontros dentro de 100 passos em vegetação.

## Iterações

Cenário de referência: grama contínua, dia, céu limpo, seed 12012.

| # | Parâmetros | /100 | média | p10 | p90 | mín | maior seca | rajada | máx/100 | Decisão |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | **Ingênua**: 10%/passo, sem carência | 10,22 | 9,8 | 1 | 22 | **1** | 121 | **58** | **23** | rejeitada: encontro a cada ~3 s de grama, 23 em 100 passos |
| 1 | carência 14–22, rampa 45/+0,25 pp, teto 16% | 2,22 | 45,1 | 22 | 73 | 15 | 209 | 5 | 6 | rajada de 5 e seca de 209 longas demais |
| 2 | rampa 40/+0,4 pp | 2,31 | 43,2 | 22 | 66 | 15 | 175 | 5 | 6 | seca melhor, rajada igual |
| 3 | carência 16–24 + rampa 40/+0,4 pp | 2,23 | 44,8 | 24 | 67 | 17 | 193 | 3 | 5 | rajada resolvida |
| 4 | carência 18–26 + rampa 40/+0,4 pp | 2,16 | 46,3 | 26 | 68 | 19 | 195 | 3 | 5 | ritmo mais lento, sem ganho na seca |
| **5** | **carência 16–24, rampa 40/+0,6 pp, teto 22%** | **2,27** | **44,0** | **24** | **65** | **17** | **193** | **3** | **5** | **adotada** (p90 e p99 menores que o #3) |
| 6 | #5 + farfalhar 10% (4–8) | 2,36 | 42,4 | 23 | 61 | 17 | 197 | 3 | 5 | diferença pequena; mantido 12% (mais tensão sem combate) |

A seca máxima fica em ~190 passos com qualquer ajuste, porque o farfalhar vazio zera a rampa. É um caso de cauda: p99 é ~107. Mesmo nesse caso o jogador vê farfalhares no meio, então não fica "sem nada". Se o teste em jogo mostrar seca incômoda, o ajuste é não zerar a rampa no farfalhar (mudança de 1 linha no `engine.mjs`).

## Resultado com a tabela adotada (#5)

| Cenário | /100 | /min andando | intervalo médio | p10–p90 | mín | maior seca | rajada | máx/100 | comum / incomum / raro / muito raro (%) |
|---|---|---|---|---|---|---|---|---|---|
| Grama contínua, dia, limpo | 2,27 | 4,26 | 44 passos (~14,1 s) | 24–65 | 17 | 193 | 3 | 5 | 77,1 / 19,7 / 3,1 / 0 |
| Grama contínua, noite, limpo | 2,35 | 4,40 | 42,6 (~13,6 s) | 23–63 | 17 | 193 | 3 | 5 | 79,3 / 16,2 / 4,3 / 0,1 |
| Grama contínua, dia, chuva | 2,37 | 4,44 | 42,2 (~13,5 s) | 23–63 | 17 | 193 | 3 | 5 | 76,1 / 21,1 / 1,5 / 1,2 |
| Grama contínua, noite, chuva | 2,44 | 4,57 | 41 (~13,1 s) | 23–61 | 17 | 152 | 3 | 5 | 77,7 / 16,8 / 4,1 / 1,4 |
| Grama contínua, noite, neblina | 2,35 | 4,40 | 42,6 (~13,6 s) | 23–63 | 17 | 193 | 3 | 5 | 78,2 / 16,3 / 5,4 / 0,1 |
| Só juncos do riacho | 2,15 | 4,04 | 46,4 (~14,9 s) | 25–67 | 17 | 193 | 3 | 5 | 86,1 / 13,9 / 0 / 0 |
| Só mata SE | 2,43 | 4,55 | 41,2 (~13,2 s) | 23–62 | 17 | 170 | 3 | 5 | 76,4 / 17,9 / 5,7 / 0 |
| **Rota realista** (4–14 passos de mata, 6–30 de trilha) | **2,28** | **1,43** | **43,9 (~14 s de mata)** | 24–65 | 17 | 156 | 3 | 5 | 76,6 / 20,6 / 2,8 / 0 |
| Ingênua 10%, rota realista | 10,18 | 6,39 | 9,8 (~3,1 s) | 1–22 | 1 | 96 | 57 | 24 | — |

Estabilidade entre seeds na rota realista: seed 7 dá 2,26/100 com média de 44,3; seed 99 dá 2,31/100 com média de 43,4. O mínimo é sempre 17 passos.

### Leitura

- **Não interrompe a cada poucos passos:** o mínimo garantido é de **17 passos** (~5,4 s andando na grama) depois de cada encontro, mais 4 s após o fim do combate. Em geral (p10) são 24 passos.
- **Na prática (rota realista):** ~**1,4 encontro por minuto andando**, ou um a cada ~42 s de caminhada mista. A regra ingênua daria 6,4 por minuto.
- **Raridade:** comuns ~76%, incomuns ~20%, raros ~3% (até 5,4% com neblina à noite, por causa do Goburimon). Os muito raros só aparecem nas condições deles: Numemon com chuva (1,2%) e Dorugamon à noite, na antessala do covil, com parceira Nv.5+ (0,1% da floresta inteira).
- **Exclusivos funcionam:** Floramon e Lalamon somem à noite; Goburimon só aparece no anoitecer e à noite; Biyomon só de dia; na chuva, Tanemon e Palmon ficam 1,5× mais prováveis.
- **Juncos:** só Tsunomon, Koromon e Tentomon (pool curto, sem raros). Se o game-design quiser um raro de água, ele entra aqui.

## Anexo — saída completa do simulador (`--naive`, seed 12012)

```
tabela digimon-forest-01 · seed 12012 · 200000 passos/cenário · combate 15s · passo 0.32s

## grama contínua (todas as áreas) · dia, céu limpo
  encontros 4541 (+624 farfalhar vazio) · 2.27/100 passos em vegetação · 4.26/min andando
  intervalo (passos em vegetação): média 44 (~14.1s) · p10 24 · p50 42 · p90 65 · p99 107 · mín 17
  maior seca: 193 passos · maior rajada (gaps<=20): 3 · máx em 100 passos: 5
  raridade %: common 77.1 · uncommon 19.7 · rare 3.1 · very_rare 0
  espécies %: Koromon 22.5, Gigimon 19, Tsunomon 17.1, Tanemon 13.7, Palmon 7.3, Tentomon 7.2, Tokomon 4.8, Floramon 3.1, Dorumon 2.3, Lalamon 2, Biyomon 0.9

## grama contínua (todas as áreas) · anoitecer, limpo
  encontros 4541 (+624 farfalhar vazio) · 2.27/100 passos em vegetação · 4.26/min andando
  intervalo (passos em vegetação): média 44 (~14.1s) · p10 24 · p50 42 · p90 65 · p99 107 · mín 17
  maior seca: 193 passos · maior rajada (gaps<=20): 3 · máx em 100 passos: 5
  raridade %: common 77.6 · uncommon 17.5 · rare 4.9 · very_rare 0
  espécies %: Koromon 22.9, Gigimon 19, Tsunomon 17.1, Tanemon 13.5, Tentomon 7.4, Palmon 7.1, Tokomon 5.2, Floramon 3, Goburimon 2.6, Dorumon 2.3

## grama contínua (todas as áreas) · noite, limpo
  encontros 4690 (+640 farfalhar vazio) · 2.35/100 passos em vegetação · 4.4/min andando
  intervalo (passos em vegetação): média 42.6 (~13.6s) · p10 23 · p50 41 · p90 63 · p99 106 · mín 17
  maior seca: 193 passos · maior rajada (gaps<=20): 3 · máx em 100 passos: 5
  raridade %: common 79.3 · uncommon 16.2 · rare 4.3 · very_rare 0.1
  espécies %: Koromon 24.1, Gigimon 18.7, Tsunomon 17, Tanemon 14, Tentomon 8.7, Palmon 7.5, Tokomon 5.6, Goburimon 2.5, Dorumon 1.8, Dorugamon 0.1

## grama contínua (todas as áreas) · dia, chuva
  encontros 4733 (+637 farfalhar vazio) · 2.37/100 passos em vegetação · 4.44/min andando
  intervalo (passos em vegetação): média 42.2 (~13.5s) · p10 23 · p50 40 · p90 63 · p99 102 · mín 17
  maior seca: 193 passos · maior rajada (gaps<=20): 3 · máx em 100 passos: 5
  raridade %: common 76.1 · uncommon 21.1 · rare 1.5 · very_rare 1.2
  espécies %: Koromon 22.1, Tanemon 17.6, Tsunomon 16.9, Gigimon 15.1, Palmon 8.9, Tentomon 7.5, Tokomon 4.4, Floramon 2.9, Lalamon 1.8, Dorumon 1.5, Numemon 1.2

## grama contínua (todas as áreas) · noite, chuva
  encontros 4873 (+669 farfalhar vazio) · 2.44/100 passos em vegetação · 4.57/min andando
  intervalo (passos em vegetação): média 41 (~13.1s) · p10 23 · p50 38 · p90 61 · p99 101 · mín 17
  maior seca: 152 passos · maior rajada (gaps<=20): 3 · máx em 100 passos: 5
  raridade %: common 77.7 · uncommon 16.8 · rare 4.1 · very_rare 1.4
  espécies %: Koromon 22.5, Tanemon 17.6, Tsunomon 16.4, Gigimon 16.3, Palmon 9.5, Tentomon 7.4, Tokomon 4.9, Goburimon 2.1, Dorumon 1.9, Numemon 1.2, Dorugamon 0.2

## grama contínua (todas as áreas) · noite, neblina
  encontros 4690 (+640 farfalhar vazio) · 2.35/100 passos em vegetação · 4.4/min andando
  intervalo (passos em vegetação): média 42.6 (~13.6s) · p10 23 · p50 41 · p90 63 · p99 106 · mín 17
  maior seca: 193 passos · maior rajada (gaps<=20): 3 · máx em 100 passos: 5
  raridade %: common 78.2 · uncommon 16.3 · rare 5.4 · very_rare 0.1
  espécies %: Koromon 23.9, Gigimon 18.4, Tsunomon 17, Tanemon 13.2, Tentomon 9, Palmon 7.3, Tokomon 5.7, Goburimon 3.5, Dorumon 1.9, Dorugamon 0.1

## só oculta-grama (tall_grass) · dia, limpo
  encontros 4747 (+636 farfalhar vazio) · 2.37/100 passos em vegetação · 4.45/min andando
  intervalo (passos em vegetação): média 42.1 (~13.5s) · p10 23 · p50 40 · p90 63 · p99 103 · mín 17
  maior seca: 170 passos · maior rajada (gaps<=20): 3 · máx em 100 passos: 5
  raridade %: common 68.9 · uncommon 28.4 · rare 2.7 · very_rare 0
  espécies %: Gigimon 21.6, Koromon 20, Tanemon 15.1, Tokomon 12.1, Palmon 8.1, Floramon 7.7, Tentomon 7.5, Lalamon 5.2, Biyomon 2.7

## só concentracao-grama (tall_grass) · dia, limpo
  encontros 4610 (+624 farfalhar vazio) · 2.31/100 passos em vegetação · 4.32/min andando
  intervalo (passos em vegetação): média 43.4 (~13.9s) · p10 23 · p50 42 · p90 63 · p99 108 · mín 17
  maior seca: 193 passos · maior rajada (gaps<=20): 3 · máx em 100 passos: 5
  raridade %: common 67.1 · uncommon 27.9 · rare 5 · very_rare 0
  espécies %: Gigimon 21.1, Koromon 19.3, Tanemon 15, Tokomon 11.6, Palmon 7.6, Floramon 7.6, Tentomon 7, Lalamon 5.7, Biyomon 2.6, Dorumon 2.4

## só riacho-oeste-juncos (reeds) · dia, limpo
  encontros 4308 (+585 farfalhar vazio) · 2.15/100 passos em vegetação · 4.04/min andando
  intervalo (passos em vegetação): média 46.4 (~14.9s) · p10 25 · p50 45 · p90 67 · p99 113 · mín 17
  maior seca: 193 passos · maior rajada (gaps<=20): 3 · máx em 100 passos: 5
  raridade %: common 86.1 · uncommon 13.9 · rare 0 · very_rare 0
  espécies %: Tsunomon 45.9, Koromon 40.2, Tentomon 13.9

## só riacho-leste-juncos (reeds) · dia, limpo
  encontros 4308 (+585 farfalhar vazio) · 2.15/100 passos em vegetação · 4.04/min andando
  intervalo (passos em vegetação): média 46.4 (~14.9s) · p10 25 · p50 45 · p90 67 · p99 113 · mín 17
  maior seca: 193 passos · maior rajada (gaps<=20): 3 · máx em 100 passos: 5
  raridade %: common 86.1 · uncommon 13.9 · rare 0 · very_rare 0
  espécies %: Tsunomon 45.9, Koromon 40.2, Tentomon 13.9

## só sudeste-mata (dense_bush) · dia, limpo
  encontros 4853 (+649 farfalhar vazio) · 2.43/100 passos em vegetação · 4.55/min andando
  intervalo (passos em vegetação): média 41.2 (~13.2s) · p10 23 · p50 38 · p90 62 · p99 100 · mín 17
  maior seca: 170 passos · maior rajada (gaps<=20): 3 · máx em 100 passos: 5
  raridade %: common 76.4 · uncommon 17.9 · rare 5.7 · very_rare 0
  espécies %: Gigimon 44.2, Tanemon 32.2, Palmon 17.9, Dorumon 5.7

## rota realista (trilha + vegetação) · dia, limpo
  encontros 1525 (+202 farfalhar vazio) · 2.28/100 passos em vegetação · 1.43/min andando
  intervalo (passos em vegetação): média 43.9 (~14s) · p10 24 · p50 42 · p90 65 · p99 103 · mín 17
  maior seca: 156 passos · maior rajada (gaps<=20): 3 · máx em 100 passos: 5
  raridade %: common 76.6 · uncommon 20.6 · rare 2.8 · very_rare 0
  espécies %: Koromon 23.2, Gigimon 19.1, Tsunomon 16, Tanemon 13.2, Palmon 8.1, Tentomon 7.3, Tokomon 5.1, Floramon 3.1, Lalamon 2.2, Dorumon 1.7, Biyomon 1.1

## INGÊNUA 10%/passo · grama contínua · dia, limpo
  encontros 20439 (+0 farfalhar vazio) · 10.22/100 passos em vegetação · 19.16/min andando
  intervalo (passos em vegetação): média 9.8 (~3.1s) · p10 1 · p50 7 · p90 22 · p99 43 · mín 1
  maior seca: 121 passos · maior rajada (gaps<=20): 58 · máx em 100 passos: 23
  raridade %: common 76.3 · uncommon 21.1 · rare 2.6 · very_rare 0
  espécies %: Koromon 24.2, Tsunomon 17.6, Gigimon 17, Tanemon 12.3, Tentomon 8.7, Palmon 6.8, Tokomon 5.1, Floramon 3.3, Lalamon 2.4, Dorumon 1.6, Biyomon 0.9

## INGÊNUA 10%/passo · rota realista · dia, limpo
  encontros 6811 (+0 farfalhar vazio) · 10.18/100 passos em vegetação · 6.39/min andando
  intervalo (passos em vegetação): média 9.8 (~3.1s) · p10 1 · p50 7 · p90 22 · p99 43 · mín 1
  maior seca: 96 passos · maior rajada (gaps<=20): 57 · máx em 100 passos: 24
  raridade %: common 76.6 · uncommon 20.7 · rare 2.7 · very_rare 0
  espécies %: Koromon 24, Tsunomon 18.2, Gigimon 16.9, Tanemon 12, Tentomon 8.7, Palmon 6.6, Tokomon 5.4, Floramon 3.3, Lalamon 2.2, Dorumon 1.6, Biyomon 1.1
```
