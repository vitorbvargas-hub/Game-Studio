# Props Manifest — Kit "Ruínas de Dados" (Direção A, recomendada)

Todos os arquivos em `props/`, PNG transparente, grid de 32px (footprint em tiles =
largura/altura ÷ 32), paleta e contorno do `DIGIMON_STYLE_GUIDE.md` (stone/moss/dirt
reaproveitados de `forest-v11-ground/palette.json`; ciano/âmbar reaproveitados dos
props existentes `data_crystal.png`/`data_totem.png`). Posições sugeridas foram lidas
na captura de referência (`?map=digimon-forest-01&seed=7&time=day`, câmera
`{x:548,y:662}`, escala tela/mundo = 3×) — **são aproximadas e amarradas a esta
sessão/seed específica**, não coordenadas fixas confirmadas no `.tmj`; o agente que
integrar deve reconferir contra o mapa real antes de gravar `place_map_object`.

| Arquivo | Footprint (tiles) | O que é | Posição sugerida nesta clareira |
|---|---|---|---|
| `ruin_pillar_small_32x32.png` | 1×1 | Ruína pequena: bloco de pedra quebrado, musgo na base, 1 rachadura de dados ciano. Para bordas/preenchimento, não para o centro de composição. | Espalhar 1–2 unidades nas bordas da clareira, perto de troncos/arbustos já existentes. |
| `ruin_column_32x64.png` | 1×2 | Coluna de ruína alta (prop "tipo árvore", bloqueia visão), veio de dados vertical com 2 nós luminosos. | ~tile (20–21, 23) — ao lado do platô rochoso existente (`forest-v9-cliffs`), reforçando-o como ruína, não como pedra lisa. |
| `ruin_arch_64x64.png` | 2×2 | Arco/pórtico quebrado assimétrico (pilar esquerdo alto, direito mais baixo, lintel parcial), circuito ciano correndo pelo lintel e descendo o pilar. Peça de assinatura do bioma. | ~tile (21–23, 23) — substitui/reveste o blob de pedra roxa genérico já presente, reinterpretando-o como ruína de dados. |
| `portal_gate_64x96.png` | 2×3 | Moldura de pedra em arco gótico simples (silhueta geométrica achatada, nunca 3D/isométrico) com disco de energia ciano pulsante no miolo — "portal", mas sem lore de teleporte funcional neste Gate (decorativo/landmark). | ~tile (24, 25–26), num trecho aberto de grama da clareira, de frente para o caminho principal. |
| `data_tower_32x96.png` | 1×3 | Pilar/torre de transmissão: haste + anel emissor âmbar no topo. Arquitetura própria (não orgânica), legível de longe. | 1 unidade ao fundo da clareira (entre as árvores, parcialmente encoberta) + repetir em outras clareiras do mesmo bioma para reforçar que é um elemento recorrente do Mundo Digital, não único. |
| `ground_circuit_straight_32x32.png` | 1×1 (decalque, sem colisão) | Traço reto de circuito luminoso, **achatado** (ocupa só a faixa inferior do tile, como textura de chão — não é uma estrutura em pé). | Sobre tiles de terra (`dirt`) já existentes, em linha entre a ruína e o centro da clareira. |
| `ground_circuit_corner_32x32.png` | 1×1 (decalque) | Curva em L do mesmo traço. | Nos cantos da trilha de circuito, para mudar de direção sem quebrar o padrão. |
| `ground_circuit_node_32x32.png` | 1×1 (decalque) | Cruzamento/nó (via), ponto mais brilhante. | Nos encontros de trilha (perto da base da ruína / cristais). |
| `crystal_cyan_24x32.png` | 1×1 | Variante do cristal ciano existente (2 lascas, levemente diferente da `data_crystal.png` original — não substitui, soma variedade). | Junto aos clusters de cristal ciano já plantados no mapa. |
| `crystal_amber_20x26.png` | 1×1 | Cristal âmbar (cor do `data_totem.png` reaproveitada), 1 lasca. | Perto da ruína/arco, para misturar cor (regra §7.2: nunca só ciano). |
| `crystal_magenta_16x20.png` | 1×1 (pequeno) | Cristal magenta, 1 lasca pequena. **Cor fora da Endesga-32/ramps aprovados — ver limitação abaixo.** | Uso esparso, 1 unidade por cena, como acento raro (não cluster). |
| `crystal_cluster_mixed_32x48.png` | 1×2 | Formação com as 3 cores (ciano/âmbar/magenta) na mesma base — peça de "mostruário" para aprovação; pode ser dividida em uso real. | Ponto focal único na clareira principal, não repetir em todo mapa (perderia o efeito de raridade). |
| `data_fragment_anim_4f_64x16.png` | spritesheet 4 quadros de 16×16 (64×16 total) | Fragmento de dados flutuante, 4 quadros (rotação + leve "bob" vertical), para partícula ambiente contínua ou reaproveito no efeito de evolução (já previsto em `UI_DIRECTION_V2.md §7`). | Espalhar 2–4 instâncias por clareira "de assinatura" (não em todo tile de grama — viraria ruído, regra §7.4). |

## Reaproveitamento vs. novo

- **Reaproveitado sem alteração de hex:** stone `#474b54/#656b75/#8c9199`, moss `#445838/#49643c`, contorno `#08181e` (igual ao `data_crystal.png`), ciano `#2ce8f5` e âmbar `#feae34` (ambos lidos diretamente dos props existentes `forest-v8-depth/props/data_crystal.png` e `data_totem.png`).
- **Novo, fora da paleta documentada:** magenta `#f23fb0`/`#9c1d75`. O `DIGIMON_STYLE_GUIDE.md` §7.2 pede explicitamente "acento de luz quente âmbar/ciano/magenta" para cristais — ou seja, o próprio guia prevê esta cor — mas §3.2/§8.3 trata qualquer hex fora da Endesga-32/ramps como falha crítica de cenário. **Esta é uma contradição do próprio Style Bible, não um erro desta entrega**; meu julgamento foi tratar cristal como elemento de "identidade de Mundo Digital" (§7), não como "cenário" genérico (§3.2/§8.3), e seguir a instrução mais específica. Precisa confirmação do GAME-ART-DIRECTOR antes de produção final — registrado também no relatório.
