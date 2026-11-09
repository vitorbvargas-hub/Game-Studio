# Modelo de mapa — Deserto

- **Arquivo de dados:** `desert.json`.
- **Inspirado em:** `deserto` (`src/data/content/regions.json`, Nv.30–45, officialArea "Gear Savannah" — GDD_MMO_V1 registra a reinterpretação como "deserto mecânico" como hipótese **[H]**, Limitações #2).

## Layout

Oposto da floresta: **aberto, sem cobertura**, visada longa. Um único ponto de contraste (o oásis) concentra tudo que normalmente estaria espalhado (água, vegetação, segredo):

```
spawn_area → duna_aberta (grande, vazia) → zona_concentracao → boss_arena
     \\                                         ^
      \\__ oasis_secreto (desvio) ______________/
```

## Ritmo de exploração

- A rota principal é **direta e exposta** — o jogador atravessa rápido, sem muito para parar.
- A rota secundária (desvio pelo oásis) é **mais longa, mas recompensadora**: único lugar com `secret`, único ponto de cura fora do início, e um encontro raro (Angemon).
- Perto do chefe, a densidade sobe (zona de concentração "engrenagens"), dando uma transição clara entre "travessia" e "combate".

## Faixa de nível

`deserto`: Nv.30–45 (`regions.json`), liberado só depois de Nv.30 + derrotar BOSS-SHELLMON (praia).

## Regras de distribuição

- **Vegetação:** `"low"` como padrão do mapa inteiro, com uma única exceção `"high"` no oásis — o contraste é a regra, não uma zona isolada qualquer.
- **Spawns:** baixa densidade nas dunas abertas (pouca cobertura = pouco sentido em emboscadas), média na zona de concentração.
- **Tema mecânico:** a reinterpretação de "Gear Savannah" como engrenagens/mecanismo é uma hipótese de direção de arte já registrada no GDD — não é uma invenção isolada deste template, e deve ser mantida se outro mapa de deserto for feito.
