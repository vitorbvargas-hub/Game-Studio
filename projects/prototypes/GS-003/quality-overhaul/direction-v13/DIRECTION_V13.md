# DIRECTION V13 — "GBA Clean" (mockups + teste PixelLab grátis)

- **Missão:** Digimon Visual Identity 1.0 — direção v13, pós-Gate 1 (Style Bible GBA Plus aprovado).
- **Autor:** game-art (subagente) · **Data:** 2026-11-11.
- **Escopo:** SÓ MOCKUPS. Nenhum arquivo do game-dev (`workspaces/game-dev/qo/...`) foi escrito — apenas lido (Guilmon `CREATURE-0018`, Tamer `TAMER-0009`), copiado em modo leitura para `assets/` deste diretório. Nenhuma integração na engine, nenhum `.tmj`/tileset de produção tocado.
- Marcação: **[E]** evidência (arquivo/medição desta sessão) · **[H]** hipótese/julgamento de direção.

---

## 1. Por que o fundador não gostou — análise lado a lado

Baseado em inspeção visual direta de `refs/nosso_atual.jpg`, `refs/pokeidledex/ref_1..6`, `refs/pixellab-site/site_1..6` e das medições de paleta já registradas em `phase3/style-bible/DIGIMON_STYLE_GUIDE.md` §3.1 para os sprites oficiais DS.

| Critério | PokeIdleDex (aprovado) | PixelLab site (referência) | **Nosso atual** (v9–v12) | Sprites DS (Guilmon/Gabumon) |
|---|---|---|---|---|
| **Paleta** | Saturada, poucas famílias de cor por cena (verde-grama + marrom-trilha + acento), sem mistura de tom frio/quente no mesmo plano | Saturada, idêntica lógica: 1 verde de base + acentos (vermelho casaco, telhado) | Verde-oliva **dessaturado**, sombras puxando para roxo/cinza sem relação clara com a paleta da grama | 6–8 cores concentradas por criatura `[E]`, saturadas, sem mistura com o cenário |
| **Valor/contraste** | Uniforme, cena inteira com a mesma exposição; contraste vem do contorno, não da luz | Igual — nenhuma vinheta, nenhum "hot spot" | **Contraste "estranho"**: canto do mapa com glow radial claro (luz pontual), resto do chão comprimido escuro — exposição não-uniforme | Sprite desenhado para ler sobre fundo neutro uniforme (sem variação de exposição própria) |
| **Contorno** | 1–2px preto, nítido, em 100% dos objetos (árvore, chão-prop, personagem) | Igual, inclusive em telhado e tronco | Presente no personagem, mas **se perde** porque o valor do contorno e do chão ao redor são parecidos (chão escuro demais) | Contorno escuro macio ~1,5–2px `[E, Style Bible §4]`, mas desenhado para contrastar com fundo claro |
| **Sombra de contato** | Elipse suave, mesma opacidade em toda cena | Elipse suave, idêntica | Sombra **inconsistente** — quase ausente sob Guilmon/Kaio na referência enviada | N/A (o sprite não traz sombra própria; depende do cenário prover uma) |
| **Textura do chão** | Quase lisa — leve ponteado repetido, sem variação aleatória de valor | Lisa com traços de grama repetidos (padrão, não ruído) | **Ruído/granulado real** por pixel — exatamente o problema já documentado em `MIRANTE_TOP_AND_SCALE.md` e proibido em `DIGIMON_STYLE_GUIDE.md` §8.3 | N/A |
| **Leitura do personagem** | Personagem sempre o objeto mais saturado/contrastado da cena — nunca compete com o chão | Igual | Guilmon e Kaio **se misturam** ao fundo: mesma faixa de valor escuro, outline do personagem não "corta" o chão ruidoso atrás | Sprite foi desenhado para precisar de **pouco** contraste externo — ele já entrega o contraste via outline+cor sólida |

**Conclusão [H], fundamentada nas medições acima:** a linguagem que casa com os sprites oficiais do DS é a do **PokeIdleDex/PixelLab site** — cor sólida + contorno nítido + iluminação uniforme + chão de baixo ruído — porque é exatamente o modelo de contraste que o próprio sprite DS já pressupõe (poucas cores saturadas, outline fazendo o trabalho de separação de forma, nenhuma variação de exposição própria). O v9–v12 tenta competir com o sprite usando **ruído de textura + luz pontual + paleta dessaturada**, que é um modelo de contraste diferente (pintura "atmosférica") — e quando os dois modelos coexistem na mesma cena, o personagem perde a briga porque ele não foi desenhado para aquele tipo de concorrência visual. Resolver isso não é question de "desenhar melhor o chão ruidoso", é trocar de modelo de contraste inteiro — exatamente o que a v13 abaixo testa.

---

## 2. Teste PixelLab — só grátis, registro completo

**Regra seguida:** `get_balance` antes/depois de cada chamada; parei assim que o bônus diário (`generations_today`) chegou a 0. **Nenhum crédito pago foi gasto** — `credits` permaneceu `$0.00` do início ao fim; o plano pago (`generations_remaining`) já estava em 0 desde antes desta sessão (trial esgotado, 40.20/40 usados por trabalho anterior do projeto) — só o bônus diário foi usado aqui.

| # | Chamada | Parâmetros-chave | Custo | Saldo após |
|---|---|---|---|---|
| 0 | `get_balance` (antes) | — | — | credits $0.00, generations_remaining 0, **generations_today 4** |
| 1 | `create_topdown_tileset` (mode=standard) | lower="dirt forest path, clean colorful GBA-era..."; upper="bright green grass, ... crisp outlines, simple flat shading, no grain"; tile_size 32×32; transition_size 0 | 1 geração | generations_today → 3 |
| 2 | `create_image_pixen` | "top-down forest clearing... clean colorful GBA-era RPG pixel art, crisp black outlines, simple flat shading, flat solid color blocks, no noise, no grain, no volumetric lighting"; 320×180; view high top-down; outline single color black | 1 geração | generations_today → 2 |
| 3 | `create_image_pixen` | mesma receita de estilo + "a few low grey stone ruins with moss... teal digital crystal shards"; 384×216 (16:9, múltiplo exato de 5 → 1920×1080 em zoom inteiro) | 1 geração | generations_today → 1 |
| 4 | `create_image_pixen` | ícone de região "Dense Forest"; 64×64; transparente | 1 geração | generations_today → **0** |
| 5 | `get_balance` (depois) | — | — | credits **$0.00**, generations_remaining 0, generations_used 44.20/40 (+4,00 exatos), `generations_today` ausente (bônus esgotado) |

**Total: 4 gerações gastas, todas do bônus diário gratuito, $0,00 em créditos.** Parei aqui conforme instrução — não tentei um 5º teste.

**Resultado dos 4 jobs** (arquivos brutos em `pixellab-test/`, copiados para `workspaces/game-studio/review/` com prefixo `v13_pixellab_...`):

1. **Tileset grama↔terra** (`tileset_grass_dirt_32px.png`, 16 tiles, 32×32px, Wang/blob) — bloco de cor sólido, sem ruído, contorno discreto. Única ressalva: o tool sempre gera a 90° high top-down em modo standard (não dá pra pedir low top-down aqui).
2. **Clareira 320×180** (`pixen_clareira_320x180.png`) — grama/trilha/cogumelos/cristais, chapado.
3. **Clareira com ruínas 384×216** (`pixen_clareira_ruinas_384x216.png`) — a melhor das três; virou o fundo do mockup principal (§3).
4. **Ícone "Floresta Densa" 64×64** (`pixen_icon_floresta_densa_64x64.png`) — ícone de bioma para mapa-múndi, fundo transparente.

Todas as 4 saídas confirmam visualmente a hipótese da §1: cor chapada, contorno nítido, zero granulado, zero luz volumétrica — bate com PokeIdleDex/PixelLab site, não com o v9–v12.

---

## 3. Mockup principal — "visão de jogo" 1920×1080

`mockups/v13_mockup_1920x1080.png` (cópia em `review/v13_mockup_1920x1080.png`).

**Como foi montado** (`pixellab-test/build_mockup.py`, Pillow, reprodutível):
- **Fundo:** o teste #3 do PixelLab (384×216) ampliado **×5 com nearest-neighbor** (384×5=1920, 216×5=1080 — fator inteiro exato, sem interpolação).
- **Guilmon:** sprite oficial `CREATURE-0018_map_S_00` (DW DS, catálogo do game-dev, só leitura) — mesmo fator **×5 nearest-neighbor**, nunca redimensionado com filtro suave (regra dura do Style Bible §1/§4/§8.3).
- **Tamer:** sprite oficial `TAMER-0009_walk_SE_00` — mesmo tratamento, ×5 nearest-neighbor.
- **Sombra de contato:** elipse plana 25–35% opacidade sob os dois, ancorada no pé — regra do Style Bible §5.
- **HUD leve (opcional, incluído):** duas etiquetas simples (nome + nível + barrinha de HP) estilo "chip" flat, só pra dar contexto de "jogo", não é proposta de redesenho de HUD (isso é Gate 5, fora de escopo aqui).
- **Toque Digimon extra:** os 2 props desenhados à mão (§4) somados aos elementos que o próprio PixelLab já gerou no fundo (ruínas de pedra com musgo, cristais maiores nos cantos).

**Leitura [E, inspeção visual do resultado]:** Guilmon e o Tamer agora **se destacam** do chão — a grama é consideravelmente mais clara e uniforme que o contorno escuro do sprite, nenhuma competição de ruído, nenhuma luz pontual estranha. É visivelmente mais perto de PokeIdleDex/PixelLab site do que o v9–v12.

## 4. Prancha comparativa

`mockups/v13_comparison_board.png` (cópia em `review/v13_comparison_board.png`) — três painéis, mesma altura (480px), lado a lado: **Atual (v9–v12)** × **V13 GBA Clean (este mockup)** × **PokeIdleDex**. A diferença de valor/ruído salta aos olhos nessa montagem; recomendo que o fundador julgue a direção por esta imagem primeiro.

## 5. Toque "Digimon" sem pesar

Como o bônus PixelLab já tinha acabado (§2), os 2 elementos abaixo foram **desenhados localmente** (Pillow, pixel a pixel, sem IA) no mesmo vocabulário de cor chapada + contorno:

- **Cristal de dados** (`assets/prop_data_crystal_5x.png`) — gema facetada ciano, silhueta "degrau" (técnica clássica de pixel art em baixa resolução), acento pontual conforme Style Bible §7.2.
- **Poste/totem digital** (`assets/prop_digital_totem_5x.png`) — haste de pedra escura + anel/orbe ciano brilhante no topo, sem ruína pesada (silhueta simples, só 1 peça vertical), conforme pedido.

**Limitação honesta:** esses 2 props são rascunhos de diretor de arte, não arte de produção — ficam visivelmente mais simples que o fundo gerado por IA ou que o sprite oficial quando olhados de perto. Servem para provar o **vocabulário visual** (cor chapada, contorno, sem gradiente), não como asset final.

---

## 6. Autoavaliação — rubrica VI 1.0 §10 (0–10, peso por critério)

| Critério | Peso | Nota | Justificativa |
|---|---|---|---|
| Identidade Digimon | 25% | **9** | Guilmon oficial inconfundível, ruínas + cristais + totem reforçam Mundo Digital sem pesar. Não testei com 2ª espécie (Gabumon) nesta entrega — só Guilmon, por orçamento de tempo/geração. |
| Consistência pixel art | 25% | **7** | Fundo + tileset (IA) estão consistentes entre si (mesma receita de prompt); os 2 props feitos à mão (§5) são visivelmente mais toscos — puxam a nota para baixo. |
| Fidelidade do personagem | 20% | **10** | Guilmon e Tamer são os arquivos oficiais, zero redesenho, zero interpolação (regra dura cumprida, só nearest-neighbor ×5 inteiro). |
| Consistência com outros assets | 15% | **7** | Os 3 outputs do PixelLab (tileset, 2 cenas, ícone) compartilham a mesma frase de estilo, mas foram 4 chamadas independentes — não passei um `reduce_colors` para forçar paleta única entre eles; em produção isso seria necessário. |
| Integração técnica | 15% | **fora de escopo desta entrega** | Esta missão é explicitamente "SÓ MOCKUPS, não integrar nada no jogo" — não há integração pra avaliar. Não pontuo este critério como reprovação; ele está pendente de um gate futuro (Fase 7, se a direção for aprovada). |

**Nota ponderada nos 4 critérios aplicáveis (85% do peso total):** (9×0,25 + 7×0,25 + 10×0,20 + 7×0,15) / 0,85 ≈ **8,3/10** — acima do mínimo de 8/10 da rubrica, sem falha crítica (nenhuma regra dura do Style Bible §8.3 foi violada: sem interpolação em sprite oficial, sem blur/AA sobre contorno, sem isométrico/3D, sem cor fora de paleta, sombra de contato presente). **Mas isto é uma autoavaliação do próprio produtor — ADR-012 §3 exige revisão cruzada (game-qa) antes de virar critério obrigatório de produção**, exatamente como o Style Bible já registra em sua própria limitação §10.

---

## 7. Recomendação

**Vale assinar PixelLab por 1 mês — mas com escopo definido, não uma assinatura aberta.** Motivo: o bônus diário grátis (4–5 gerações/dia) foi suficiente para **validar a direção** (este documento), mas está longe de bastar para **refazer o bioma inteiro**. Uma Floresta Densa completa em produção precisa de, no mínimo:

- 3–4 pares de tileset Wang (grama↔terra ✅ já testado, grama↔água, grama↔pedra/elevação, trilha dedicada via `create_path_tiles`);
- 1 `create_building_kit` para a ruína modular (parede, piso, escada) em vez de recortes manuais;
- 6–10 props isolados (árvore, moita, rocha, cogumelo, 2–3 variações de cristal/totem) via `create_1_direction_object`/`create_8_direction_object`;
- 1 passe de `reduce_colors` unificando a paleta de tudo isso junto (o que a nota 7/10 do critério "consistência" acima está cobrando).

Isso são **15–30 gerações** dependendo do modo (standard vs pro) — inviável no ritmo de ~4/dia grátis (3–8 dias só de espera, sem contar reentregas). Um mês de plano Tier 1 destrava concorrência >1 job simultâneo e as ferramentas "pro" (melhor acabamento, paleta fixa). **Recomendo contratar especificamente para esta lista fechada** (biome Floresta Densa v13 completo), não para os Digimons (ficam sprites oficiais, por decisão do fundador) nem para UI/Digivice (outro gate). Decisão de compra é do fundador — não contratei nada nesta sessão.

**Esforço para refazer a floresta neste estilo, se aprovado [H]:**
- *Com plano pago:* ~1–2 sessões de geração (tileset family + path tiles + building kit + props, ~15–25 gerações) + 1 sessão de remontagem do mapa na engine (`edit_map`/Tiled, tarefa de game-dev, fora deste gate).
- *Só com bônus grátis:* mesma lista espalhada em 3–6 dias (4–5 gerações/dia), sem concorrência (um job por vez) — viável mas lento, atrapalha ciclo de aprovação rápida.

---

## 8. Limitações

- Só 1 espécie testada em composição (Guilmon); Gabumon não entrou neste mockup por orçamento de tempo, não por problema técnico — mesmo pipeline se aplica (`CREATURE-0019` já existe no mesmo build script).
- Os 2 props "toque Digimon" (§5) são desenho manual de diretor de arte, não arte de produção — ver limitação honesta já registrada ali.
- O tileset de teste (#1, §2) só prova a receita de prompt/paleta; não foi encadeado com um 2º par (grama↔água etc.) nem testado dentro da engine — é only a Wang de 16 tiles isolada.
- A prancha comparativa (§4) usa um recorte do mockup v13 redimensionado com LANCZOS só para bater a altura dos 3 painéis lado a lado (fins de apresentação) — o mockup original (`v13_mockup_1920x1080.png`) continua com os sprites oficiais em nearest-neighbor puro, sem interpolação.
- Autoavaliação (§6) não foi revisada por outro agente (game-qa) — é a palavra do próprio produtor, como toda autoavaliação desta fase.
- Nenhum arquivo de produção (game-dev, `.tmj`, tileset ativo) foi criado, alterado ou integrado — cumprindo a restrição "SÓ MOCKUPS" desta tarefa.

---

## Arquivos produzidos

```
direction-v13/
├── DIRECTION_V13.md              (este arquivo)
├── refs/                         (já existentes — referências lidas)
├── pixellab-test/
│   ├── tileset_grass_dirt_32px.png
│   ├── pixen_clareira_320x180.png
│   ├── pixen_clareira_ruinas_384x216.png
│   ├── pixen_icon_floresta_densa_64x64.png
│   ├── build_props.py
│   ├── build_mockup.py
│   └── build_comparison.py
├── assets/
│   ├── guilmon_official_S.png / guilmon_official_W.png  (lido do game-dev, só cópia local)
│   ├── tamer_official_SE.png / tamer_official_SW.png    (idem)
│   ├── prop_data_crystal_native.png / _5x.png
│   └── prop_digital_totem_native.png / _5x.png
└── mockups/
    ├── v13_mockup_1920x1080.png (+ _rgba.png)
    └── v13_comparison_board.png
```

Copiados para `workspaces/game-studio/review/` com prefixo `v13_`: `v13_mockup_1920x1080.png`, `v13_comparison_board.png`, `v13_pixellab_tileset_grass_dirt_32px.png`, `v13_pixellab_clareira_320x180.png`, `v13_pixellab_clareira_ruinas_384x216.png`, `v13_pixellab_icon_floresta_densa_64x64.png`.
