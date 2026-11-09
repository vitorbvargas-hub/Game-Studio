# Modelo de mapa — Montanha

- **Arquivo de dados:** `mountain.json`.
- **Inspirado em:** `montanha` (`src/data/content/regions.json`, Nv.20–35, officialArea "Outlook Mountain + Infinity Mountain + Ancient Dino Region").

## Layout

Orientação **vertical** (o mapa é mais alto que largo: 40×56 tiles no exemplo), subindo em zigue-zague (switchback) da base ao pico:

```
                  boss_arena (pico)
                       ^
              zona_concentracao
                       ^
                   planalto (respiro, baú, cura)
                       ^
                  encosta_1 (zigue-zague)
                       ^
                  spawn_area (base, vindo da floresta)
```

A rota secundária ("Atalho da Encosta Rochosa") corre em paralelo à principal, mais direta e mais exposta — menos cobertura visual, selvagens mais fortes, mas chega mais rápido ao topo.

## Ritmo de exploração

Diferente da floresta (densidade cresce de forma contínua) e do deserto (um só contraste), a montanha tem um **respiro estrutural no meio** (o planalto): a subida para e o jogador cura/saqueia antes do trecho final, mais difícil. É o padrão "sobe, descansa, sobe de novo".

## Faixa de nível

`montanha`: Nv.20–35 (`regions.json`), liberada com Nv.20 + derrotar BOSS-KUWAGAMON.

## Regras de distribuição

- **Vegetação decrescente com a altitude:** média na base (ainda é transição com a floresta), baixa a partir da encosta (predomínio de rocha nua).
- **Um encontro raro de stage mais alto perto do chefe** (aqui, DoruGreymon stage 4) — reforça a sensação de que o topo é onde estão os Digimon mais fortes da região.
- **Duas rotas, dois estilos:** a principal prioriza segurança (mais vegetação/cobertura), a secundária prioriza velocidade (mais exposta, mais XP por risco).
