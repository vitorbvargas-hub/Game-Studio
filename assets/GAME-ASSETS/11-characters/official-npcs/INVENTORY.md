# Inventário — NPCs humanos oficiais (Digimon World DS), v3

**Gerado em:** 2026-11-08 · **Agente:** game-art · **GS-003**

Fonte principal: `10-source-files/spriters-resource/dgmnworldds__arrow-drop-down__NPC-Characters__48318.png`
(Digimon World DS, Spriters Resource, ripada por **redblueyellow**, "No credit needed"). Camada **official-fan-use**
(ADR-009). Cada `NPC-00NN` tem `character.json` + `license.json` + `portrait.png` + `preview.png` + `sprites/`
(4 direções S/N/W/E × 3 quadros de walk, pivô nos pés; alguns têm um 13º quadro extra em
`sprites/..._extra_sleep.png`, provavelmente dormir/desmaiar).

Pipeline: `tools/char_import/extract_npc_characters.js` (recorte por componentes conexos contra o teal de fundo,
colunas por terço de largura, limpeza de linhas-fantasma de divisória). Folha de contato:
`09-previews/official_npcs_contact_sheet.png`.

**[H] hipótese de semelhança** com protagonistas da franquia — é leitura visual (cor/estilo de cabelo, acessório),
não é cópia nem afirmação de que a folha original pretendia representar o personagem. Nomes provisórios são
descritivos, não usar em texto de jogo.

| ID | Nome provisório | Descrição visual | Semelhança [H] |
|---|---|---|---|
| NPC-0001 | Visionário (azul) | Cabelo azul-marinho espetado, masc. | — |
| NPC-0002 | Lenço Violeta | Loiro espetado, lenço roxo, masc. | TK/Takeru adulto (fraco) |
| NPC-0003 | Chama Ruiva | Cabelo ruivo-acastanhado espetado, masc. | Tai/Takato (arquétipo goggles) |
| NPC-0004 | Vermelho Intenso | Cabelo vermelho/castanho espetado, masc. | Marcus/Taiki (fraco) |
| NPC-0005 | Ancião Grisalho | Cabelo grisalho, masc. mais velho | — (mentor/NPC de vila) |
| NPC-0006 | Marias Roxas | Cabelo roxo em duas marias-chiquinhas, fem. | Rika (cor errada, estilo parecido) |
| NPC-0007 | Rosa Longo | Cabelo rosa/magenta longo, fem. | — |
| NPC-0008 | Headband Laranja | Cabelo laranja com faixa, masc. | Davis/Daisuke (faixa lembra goggles) |
| NPC-0009 | Moicano Castanho | Cabelo castanho desgrenhado, masc. aventureiro | Takuya (fraco) |
| NPC-0010 | Laranja Curto | Cabelo laranja curto, masc. | Tai jovem (fraco) |
| NPC-0011 | Verde Vivo | Cabelo verde vibrante, masc. | — (incomum, bom p/ kitbash) |
| NPC-0012 | Dourado Espetado | Cabelo loiro-dourado espetado, masc. | Matt/Yamato |
| NPC-0013 | Castanho Curto | Cabelo castanho curto, fem. | Sora (fraco) |
| NPC-0014 | Cinza-Azulado | Cabelo azul-acinzentado, fem. | — |
| NPC-0015 | Ciano | Cabelo ciano/turquesa, fem. | — (incomum) |
| NPC-0016 | Castanho Claro | Cabelo castanho claro, masc. | — |
| NPC-0017 | Dourado Longo | Cabelo loiro longo, fem. | Mimi (fraco) |
| NPC-0018 | Roxo Escuro | Cabelo roxo escuro, fem. | — |
| NPC-0019 | Azul Espetado | Cabelo azul espetado, masc. | Henry/Jenrya (cor) |
| NPC-0020 | Azul-Preto | Cabelo azul petróleo espetado, masc. | — |
| NPC-0021 | Loiro Vivo | Cabelo loiro espetado vibrante, masc. | Matt/Takuya |
| NPC-0022 | Platina Grande | Cabelo loiro-platinado volumoso, masc. | Kiriha (fraco) |
| NPC-0023 | Loiro Claro | Cabelo loiro claro, fem. | — |
| NPC-0024 | Vinho Escuro | Cabelo vinho/marrom-avermelhado, masc. | Davis/Marcus (fraco) |
| NPC-0025 | Magenta Espetado | Cabelo magenta espetado, fem. | — |
| NPC-0026 | Azul Puro | Cabelo azul puro, masc. | Henry/Jenrya |
| NPC-0027 | Cinza-Azul | Cabelo acinzentado, masc. | — |
| NPC-0028 | Cinza Espetado | Cabelo cinza espetado, masc. | — |
| NPC-0029 | Marinho Longo | Cabelo azul-marinho longo, fem. | Rika (alt, fraco) |
| NPC-0030 | Azul Curto | Cabelo azul curto, ambíguo | — |
| NPC-0031 | Roxo-Vermelho | Cabelo roxo com mechas vermelhas espetado, masc. | — (visual forte p/ kitbash) |
| NPC-0032 | Roxo-Dourado | Cabelo roxo com detalhe dourado, estilo ninja, masc. | Tagiru (fraco, silhueta) |
| NPC-0033 | Ruivo Criança | Cabelo ruivo, sprite menor (criança) | — |
| NPC-0034 | Castanho Jovem | Cabelo castanho, fem. jovem | — |

Dois blocos adicionais no fim da folha (perto do texto de crédito) eram apenas o texto "Ripped by redblueyellow" —
não são personagens; descartados do inventário.

## Outras fontes revisadas (DW DS2) — não extraídas individualmente nesta entrega

Revisão visual feita; decisão de time-box (ver `docs/briefing/` e nota do agente). Nenhuma foi extraída
personagem-a-personagem desta vez porque a tarefa priorizou a folha DW DS (`NPC-Characters`/`Hero`) como base,
e estas têm layout diferente (sem blocos coloridos por personagem, grade de recolores muito larga por avatar).
Ficam registradas como pista para expansão futura:

- **`Koh-Sayo-Playable-Characters__64484.png`** (792×480): são os 2 avatares jogáveis de DW DS2 (Koh/menino,
  Sayo/menina) em ~10-13 variantes de cor de roupa cada — não são 35 personagens novos, é um único "Hero" por
  gênero com muitos recolores oficiais. Útil como referência de paleta, não como fonte de personagens novos.
- **`Dawn-NPCs-Major__64485.png`** e **`Dusk-NPCs-Major__64486.png`** (700×572 cada): ~17 NPCs cada, elenco
  próprio de DW Dawn/Dusk (DS2). Nenhum bateu com um protagonista do anime de forma clara no exame visual desta
  sessão [H] — são personagens originais do jogo. Boa fonte para expansão futura de NPCs de mundo.
- **`Legend-Quest-Guests__64618.png`** (320×272, ripado por **DigistarDBZ**): **7 personagens "guest"** com
  retrato + grade 3×2 de poses (sem walk de 4 direções completo nesta folha). Visualmente, parecem ser os
  cameos reais de protagonistas do anime que o modo "Legend Quest" de Dawn/Dusk inclui (prática conhecida da
  franquia) — um deles (goggles sobre cabelo escuro despenteado, roupa azul/verde) lembra fortemente o
  arquétipo visual de **Marcus/Masaru Daimon** (Savers/Data Squad) [H]; outro (cabelo ruivo-escuro, moletom)
  lembra **Takato** [H]; outro (cabelo azul espetado escuro) lembra **Tagiru/Yuu** [H]. **Os nomes exatos não
  foram confirmados nesta sessão** (precisaria de uma wiki/guia de DW Dawn/Dusk para mapear "Legend Quest" →
  personagem). Recomenda-se uma tarefa de `game-research` dedicada antes de usar esta folha como base de preset,
  já que — ao contrário da folha `NPC-Characters` (NPCs genéricos) — esta pode conter representações mais
  diretas de personagens com nome, exigindo mais cuidado de "não copiar 1:1".
- **`digimonbattleonline__*Takato*` / `*Henry-Wong*`**: estilo de 8 direções e resolução bem maior (PC, não DS);
  usados só como referência de silhueta/paleta, não recortados (formato incompatível com o pipeline de mapa
  32×32 do protótipo).
