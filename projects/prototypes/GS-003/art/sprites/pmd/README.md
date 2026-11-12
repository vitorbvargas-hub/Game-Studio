# Formato PMD -- GS-003 Digimon-fan (ADR-007)

- **Autor:** game-art · **Data:** 2026-11-08
- **Referência de FORMATO (não de arte):** `art/reference/pmd-format-founder/` -- amostra enviada pelo fundador (Charmander, provavelmente sprite oficial Chunsoft do PMD Collab). Usada **somente** para entender a estrutura do formato (grid de 8 direções, `AnimData.xml`, folhas `Anim`/`Offsets`/`Shadow`). **Nenhum pixel dessa referência foi lido, copiado ou traçado** para gerar qualquer forma deste pacote -- todas as silhuetas aqui são geradas por código em `art/src/pmd/`, reaproveitando cores/traços já aprovados dos sprites de batalha (`art/src/{koromon,agumon,...}.js`, `art/src/digimon_palette.js`).

## O que é este formato

Cada monstro em `art/sprites/pmd/<monstro>/` tem:

- **`AnimData.xml`** -- lista as animações do monstro (nome, índice, tamanho de quadro em pixels, durações em *ticks*, e para `Attack` os quadros de evento `RushFrame`/`HitFrame`/`ReturnFrame`). Estrutura compatível com a referência do fundador, cobrindo só as 5 animações deste pacote (a referência tem ~35).
- **`<Anim>-Anim.png`** -- a folha de sprite da animação. Grade: **1 linha por direção** (8 linhas, ordem `S, SE, E, NE, N, NW, W, SW`, de cima para baixo) × **1 coluna por quadro** (da esquerda para a direita). O tamanho de cada célula é `FrameWidth × FrameHeight` do `AnimData.xml` daquela animação.
- **`<Anim>-Shadow.png`** -- mesma grade, uma elipse escura sólida marcando a posição do pé/contato com o chão em cada quadro (para o motor desenhar a sombra separada do sprite, como na referência).
- **`<Anim>-Offsets.png`** -- mesma grade. **Convenção simplificada, própria deste pacote, documentada aqui e NÃO uma cópia do formato exato de múltiplos pontos coloridos do PMD Collab** (esse formato exato não foi verificado por nenhuma fonte disponível nesta tarefa, e inventar valores seria contra a regra do estúdio de não inventar dados). Em vez disso: **um único pixel opaco magenta `#FF00FF`** por célula, na posição de ancoragem (centro-base do sprite, onde ele deve alinhar com o tile). Suficiente para um motor alinhar o sprite ao chão; não codifica pontos de cabeça/mão como o formato original.

## Animações entregues

| Animação | Quadros | Tamanho de quadro | Observação |
|---|---|---|---|
| Idle | 4 | 32×40 | Respiração (bounce leve) + piscar |
| Walk | 4 | 32×32 | Passada/hover de 4 quadros em loop |
| Attack | 3 | 48×48 | Antecipação → impacto (flash) → retorno. `RushFrame=0`, `HitFrame=1`, `ReturnFrame=2` |
| Hurt | 2 | 32×32 | Recuo + flash branco, desvanecendo no 2º quadro |
| Sleep | 2 | 32×24 | Olhos fechados + marca "Z" pulsando |

Durações de `Idle`/`Walk`/`Hurt`/`Sleep` copiadas literalmente do `AnimData.xml` de referência (são uma convenção genérica de "sensação" de jogo, não arte específica do Charmander). `Attack` foi simplificado para 3 quadros (a referência usa 11 quadros em 64×64) -- nossos monstros são menores/mais simples; 3 quadros já comunicam a pose.

## 8 direções

Só **5 direções foram desenhadas à mão** (S, SE, E, NE, N) -- a tarefa permite essa redução explicitamente ("se 8 direções for inviável, faça 5 com espelhamento"). As outras 3 (**NW, W, SW**) são espelhamento horizontal de NE/E/SE (`Canvas.flipX()`), a mesma técnica padrão usada por jogos do gênero para não redesenhar o lado simétrico. As 8 linhas existem no arquivo final -- só a metade delas foi desenhada originalmente.

A diferença entre direções é geométrica, não um redesenho pose a pose: um fator `turn` (-1 oeste .. 0 .. +1 leste) desloca cabeça/orelhas/cauda/membros, e um fator `face` (1 de frente .. -1 de costas) controla a visibilidade dos olhos/boca -- de costas (N) o monstro fica sem rosto, só a silhueta + qualquer detalhe que já exista no topo da cabeça (chifre, crista, orelha), igual ao efeito de "ver a nuca" de jogos top-down reais.

## Pipeline (reprodutível, 100% Node nativo)

```
node art/src/pmd/build.js [outDir]        # gera os 6 monstros em art/sprites/pmd/
node art/src/pmd/mockup_map.js [outDir]   # gera mapa_exploracao.png em art/mockups/
node art/src/pmd/mockup_battle.js [outDir]
```

Determinístico, sem aleatoriedade, sem dependência além dos módulos nativos do Node (mesmo encoder PNG e biblioteca de desenho por pixel já usados pelos sprites de batalha, `art/src/png.js` / `art/src/canvas.js`).

Arquivos-chave:

- `art/src/pmd/common.js` -- desenhista genérico de criatura (corpo/olhos/contorno/sombra), tabela de 8 direções, sequência de poses por animação.
- `art/src/pmd/creatures/*.js` -- um arquivo por monstro, só com cor + ganchos de desenho (orelha, cauda, capuz, crista) que reaproveitam o desenhista genérico.
- `art/src/pmd/sheet.js` / `xml.js` / `anim_specs.js` -- montagem das folhas e do XML.
- `art/src/pmd/build.js` -- orquestrador + folha de contato de revisão (`art/sprites/pmd/pmd_contact_sheet.png`).

## Limitações

- **Offsets.png é uma convenção própria simplificada** (ver acima), não uma engenharia reversa confirmada do formato PMD Collab real -- um motor que espera o formato original com múltiplos pontos coloridos (cabeça, mão, sombra) vai precisar de um parser adaptado ou de uma segunda passada de arte para esse arquivo.
- **Só 5 direções desenhadas à mão**, as outras 3 são espelhamento -- para um monstro perfeitamente simétrico isso é invisível, mas qualquer assimetria futura (cicatriz, acessório de um lado só) quebraria a ilusão nas direções espelhadas.
- **Attack reduzido a 3 quadros** (vs. 11 da referência) -- lê a pose, mas não tem a cadência rica de antecipação/contato/retorno gradual da referência.
- **Diferença entre direções é sutil em alguns monstros** (mais clara em Agumon/Gabumon pela crista/capuz assimétricos ao virar; mais sutil nos "blobs" simétricos como Koromon/Tsunomon) -- aceitável para um protótipo, mas uma segunda passada de arte dedicada deixaria a leitura de direção mais forte.
- **Walk de Patamon/Tokomon continua sendo um ciclo de hover/flap reinterpretado**, não uma passada de perna real -- mesma decisão já documentada em `art/PIXEL_ART_DIRECTION.md` §0.1 para os sprites de batalha, agora também no formato PMD.
- **Não comparado lado a lado, pixel a pixel, com a referência do fundador** além da inspeção visual desta sessão -- recomenda-se revisão do fundador antes de qualquer aprovação final de produto.
