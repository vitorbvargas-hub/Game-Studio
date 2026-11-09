# Modelo de mapa — Caverna (dungeon linear)

- **Arquivo de dados:** `cave.json`.
- **Inspirado em:** `cripta_das_raizes` (`src/data/content/dungeons.json`, região `floresta_densa`, Nv.10–18) — é a única dungeon já desenhada no projeto, e serve de base real para este modelo, em vez de inventar uma estrutura nova.

## Layout

Diferente dos outros 4 modelos (mundo aberto), a caverna é **linear e vertical**: o jogador avança "para dentro"/"para cima" andar por andar, sem voltar livremente pelo mundo aberto.

```
   [Sala do Chefe] ← convergem os 2 ramos
        ^                    ^
 [Câmara do Tesouro]   [Passagem Oculta]
   (mais difícil,         (atalho,
    mais loot)          sem combate extra)
        ^                    ^
        \\__________________//
              Andar 2
                ^
              Andar 1
                ^
            Entrada
```

A bifurcação no meio (andar 3 no `dungeons.json` original) é o ponto de decisão: ramo A (Câmara do Tesouro) tem mais um encontro e um **mini-chefe**, mas dá bônus de loot; ramo B (Passagem Oculta) é um atalho sem combate extra. Os dois terminam na mesma Sala do Chefe.

## Ritmo de exploração

Linear, andar a andar, com dificuldade **crescente e previsível** (sem surpresa de densidade como numa floresta aberta): cada andar tem um número fixo de encontros, não uma área para explorar livremente. É o oposto do ritmo de um mapa de mundo aberto — aqui o jogador está sempre "avançando", nunca "vagando".

## Faixa de nível

Nv.10–18 no exemplo (`cripta_das_raizes`). Uma caverna nova deve herdar a faixa da região de superfície em que a entrada fica (ex.: uma caverna na Montanha usaria algo entre Nv.20–35).

## Regras de distribuição

- **Spawns por andar, não por área:** cada `zone` do tipo `cave_floor` tem um conjunto fixo de `spawns` (replicando `floors[].encounters` do `dungeons.json`), não uma densidade contínua.
- **Ponto de cura fixo antes do chefe** (`healPointBeforeBoss`): é regra, não opção — `dungeons.json` já define isso para toda dungeon (HP não se restaura entre andares, exceto loot ou esse ponto).
- **A bifurcação é o único lugar com decisão real de rota** — os demais andares são corredores de um só caminho.
- **Vegetação:** não se aplica (ambiente de rocha); a "densidade" equivalente é decisão do game-art (teias, cristais, musgo de caverna).
