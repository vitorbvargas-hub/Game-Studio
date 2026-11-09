# Tamers v3 — presets "inspirados em protagonista"

**Gerado em:** 2026-11-08 · **Agente:** game-art · **GS-003** · pipeline: `tools/char_import/build_tamer_presets.js`

Cada preset parte de um NPC oficial de `11-characters/official-npcs/` (DW DS, official-fan-use) e aplica:
1. **recolor de cabelo** (hue-shift preservando sombreado) para uma paleta própria do estúdio;
2. **kitbash leve** de um acessório desenhado por cima do sprite (goggles, viseira, óculos, lenço, gola, boné) —
   vetor simples (círculos/linhas/polígonos), não é arte final, serve de base para um passe manual.

Nomes são **neutros** (arquétipo, não nome de personagem) para uso em jogo/UI, conforme pedido do fundador.
A coluna "lembra" é leitura visual **[H]**, não afirmação de cópia — nenhum preset é uma reprodução 1:1.

| ID | Nome | Base oficial | Acessório | Lembra [H] |
|---|---|---|---|---|
| TAMER-0003 | Coragem (goggles) | NPC-0003 | goggles laranja | Tai/Takato |
| TAMER-0004 | Amizade (loiro) | NPC-0021 | gola alta azul | Matt/Yamato |
| TAMER-0005 | Amor (lenço) | NPC-0013 | lenço laranja | Sora |
| TAMER-0006 | Determinação (goggles azul) | NPC-0008 | goggles azuis | Davis/Daisuke |
| TAMER-0007 | Esperança (boné) | NPC-0002 | boné claro | TK/Takeru |
| TAMER-0008 | Vínculo (goggles, jaqueta) | NPC-0010 | goggles laranja | Takato |
| TAMER-0009 | Raposa (viseira) | NPC-0006 | viseira roxa | Rika/Ruki |
| TAMER-0010 | Vento (óculos) | NPC-0019 | óculos | Henry/Jenrya |
| TAMER-0011 | Chama (goggles vermelhos) | NPC-0009 | goggles vermelhos | Takuya |
| TAMER-0012 | Vanguarda (jaqueta vermelha) | NPC-0024 | gola/jaqueta vermelha | Marcus/Masaru |
| TAMER-0013 | Xeno (cabelo prateado) | NPC-0022 | gola clara | Kiriha/Michael |
| TAMER-0014 | Fúria (goggles verdes) | NPC-0032 | goggles verdes | Tagiru |

## Recolor de cabelo (8 cores)

Cada preset exporta, além da cor canônica acima, **7 variantes extras de cor de cabelo** (mesmo kitbash) em
`TAMER-00NN/sprites/recolor_<cor>/`, referenciadas em `character.json.hairRecolors.options`. Paleta:
preto `#2B2B2B`, castanho `#6B3A1F`, loiro `#D9A441`, ruivo `#B03A2E`, azul `#1F6FB0`, verde `#3E8E41`,
roxo `#7B4BA6`, prateado `#C9CCCF`.

## Formato

Mesmo schema de `TAMER-0001/character.json` (schemaVersion 1): `dimensions`, `pivot`, `directions`, `animations`
(idle/walk, `dirFrames` por S/N/W/E), consumível pelo loader de `prototype/world/src/assets/` sem mudança.
Campos extras não quebram o schema: `hairRecolors` (opções de cor) e `kitbash` (acessório aplicado, metadado).

## Limitações

- Kitbash é vetor primitivo (círculo/linha/elipse/polígono), não arte final — recomenda-se passe manual de
  pixel art antes de considerar qualquer preset "pronto para produção".
- Nenhum preset foi validado em jogo (só sprites estáticos + preview); falta QA de legibilidade em movimento e
  em tile real (32px) a 100% (as prévias usam 4x).

## Correção 2026-11-09 (ver `README.md` desta pasta para o detalhe completo)

- **Direções:** a folha de origem só tem 2 vistas de frente e 2 de costas, não 4 cardeais; os
  `dirFrames` de cada preset agora usam `SW/SE/NW/NE` honestos em vez de `S/N/W/E` errados.
- **Cor do cabelo:** a detecção de seed caía no contorno cel-shade (quase sem saturação) em 8 dos 12
  presets, então o recolor não tinha efeito visível; 3 outros recoloriam a roupa por engano. Corrigido
  com um filtro de saturação mínima no seed — as 8 cores agora são visivelmente distintas nos 12
  presets (conferido numa grade 12×8).
- **Acessório:** goggles/viseira/óculos agora só vão nas 2 vistas de frente (antes vazavam para as
  costas em 7 presets e faltavam numa das vistas de frente).
