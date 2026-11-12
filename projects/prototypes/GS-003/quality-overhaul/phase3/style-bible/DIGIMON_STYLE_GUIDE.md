# DIGIMON_STYLE_GUIDE — Style Bible "GBA Plus" v1.0

- **Missão:** Digimon Visual Identity 1.0 — Fase 1 / Gate 1.
- **Autor:** game-art (GAME-ART-DIRECTOR, ADR-012 §3) · **Data:** 2026-11-11.
- **Custo:** zero. Nenhuma chamada PixelLab, nenhuma compra, nenhuma geração de IA nos assets finais deste documento — tudo abaixo é consolidação de documentos já existentes + composição local em Python/Pillow (`~/projects/GameStudio/shared/tools/sd-local/.venv`, que já tinha Pillow/NumPy instalados) sobre sprites e tiles que já estão no repositório.
- **Decisão do fundador que motiva este documento (2026-11-11):** os Digimon do jogo serão **iguais aos oficiais** — sprites oficiais de *Digimon World DS/Dawn/Dusk* (catálogo em `projects/prototypes/GS-003/research/sprite-recovery/`), não redesenhados nem re-escalados por IA. Isso **supera** a premissa de `ART_DIRECTION_V2.md` §1.4/§1.5 (Rookie/Tamer "redesenhado em 56–64px via `create_character(v3, reference)`") — aquele caminho dependia de gerar arte nova a partir da referência pequena; a decisão de hoje fecha essa porta. Cenário e UI precisam casar com o sprite oficial como ele é, não com uma versão ampliada dele.
- **Fontes consolidadas** (o que este documento substitui/herda, sem jogar fora o que já foi decidido e continua válido):
  - `quality-overhaul/ART_DIRECTION_V2.md` (escala, paleta, contorno, luz, animação por anatomia, checklist) — mantido **exceto** a escala nativa de criatura (§1.4/§1.5), que este documento revisa à luz da decisão do fundador de hoje.
  - `quality-overhaul/UI_DIRECTION_V2.md` (tipografia, molduras, ícones, estados, layout do HUD).
  - `quality-overhaul/PROJECT_LOG.md` (ADR-012 "Quality First", ADR-010 "referência visual canônica do IdleDex").
  - `quality-overhaul/phase2/art/scale-proof/README.md` e `quality-overhaul/phase2/art/gabumon-hand64/REPORT.md` (prova técnica de escala, agora reinterpretada: confirmam a técnica, não mais a escala-alvo).
  - `quality-overhaul/phase3/art/MIRANTE_TOP_AND_SCALE.md` (fix de textura do topo do platô, decisão de escala do Tamer — revisada aqui).
  - `art/map-factory/MAP_ART_BIBLE.md` (paleta por bioma, tile 32px, camadas, autotile, checklist de mapa) e `docs/ART_STYLE_GUIDE.md` (paleta Endesga-32, contorno, luz, §9b "tile 32 + sprite oficial nativo 1×, câmera larga").
  - `research/sprite-recovery/digimon_sprite_catalog.json` + `digimon_sprite_quality_report.md` (dimensões reais medidas dos sprites oficiais).
- Marcação: **[E]** evidência (arquivo/medição desta ou de sessão anterior, citada) · **[H]** hipótese/julgamento de direção, não testado com jogador real.

---

## 1. Visual — identidade "GBA Plus"

Top-down 2D em 3/4 (câmera "low top-down"), nunca isométrico nem 3D. Pixel **nítido**: sem anti-aliasing, sem blur, sem gradiente suave pixel a pixel, sem upscale com interpolação em lugar nenhum do pipeline (`ART_STYLE_GUIDE.md` §2/§5.3, `MAP_ART_BIBLE.md` §7 regra 2). O nome "GBA Plus" descreve a referência de geração: a proporção e a crueza de um RPG de Game Boy Advance (personagem claramente maior que um "ícone" dentro do tile, poucos tons por cor, contorno visível), com o "plus" sendo só a composição de cena mais densa que o GBA tinha orçamento para fazer (vegetação em camadas, água com reflexo, luz pontual — herdado da referência Drakantos, `ART_STYLE_GUIDE.md` §1).

**Regras duras (falha crítica, reprova sozinha — ver §8):**
1. Nenhum sprite de criatura oficial é redimensionado com interpolação (bicúbica, bilinear, Lanczos). Zoom de tela é sempre fator inteiro + nearest-neighbor (`ART_STYLE_GUIDE.md` §2).
2. Nenhum blur, glow difuso ou soft-shadow com gradiente contínuo sobre sprite de personagem/criatura — ver exemplo reprovado §6.1.
3. Sem perspectiva isométrica nem 3D em personagem, criatura ou chão de bioma (tiles isométricos do `create_tiles_pro`/`create_building_kit` **não** entram no mundo principal; ficam fora de escopo deste Style Bible).
4. Cenário usa separação de forma por contraste de cor e sombreamento em blocos — **sem** contorno rígido no tile (`ART_STYLE_GUIDE.md` §1, Drakantos como referência de composição de mundo, nunca de sprite de criatura).

---

## 2. Escala

### 2.1 Tile

**32×32px continua sendo o tile oficial de produção** (`MAP_ART_BIBLE.md` §2, "não negociável nesta fase"; motor já usa `tileSize=32` em `prototype/world/src/sim/map.ts` e em todo `.tmj` ativo). Isso não muda com este documento.

### 2.2 O problema real: sprite oficial × tile 32px

Com a decisão do fundador de hoje, a altura nativa do sprite de mapa de cada Digimon é um número **fixo e já medido**, não mais um alvo de direção de arte:

| Entidade | Fonte | Frame (W×H) | Pivô (pé) | Altura útil / tile 32px |
|---|---|---:|---:|---:|
| Guilmon (Rookie) | `CREATURE-0003` (DW DS, Spriters Resource) | 30×34px | (15, 33) | **34px → 1,06× tile** |
| Gabumon (Rookie) | `CREATURE-0009` (DW DS, Spriters Resource) | 36×34px | (18, 33) | **34px → 1,06× tile** |
| Tamer (TAMER-0009) | base DW DS NPC-0006 + recolor (`official-fan-use` + kitbash leve) | 26×33px | (13, 32) | **33px → 1,03× tile** |

**[E] medido nesta sessão** com Pillow sobre os PNGs reais do repositório (ver `scale-comparison/build_scale_comparison.py`) — consistente com `digimon_sprite_quality_report.md` §13.2 ("Guilmon `CREATURE-0003_walk_W_00.png` = 30×34px").

Isso é **a confirmação definitiva** do que `ART_STYLE_GUIDE.md` §9b já havia registrado em 2026-11-08 como hipótese ("Rookies de mapa em 25–31px") e que `ART_DIRECTION_V2.md` §1.4 tentou resolver gerando uma versão redesenhada maior — caminho agora fechado. Com tile=32px e sprite oficial nativo, **a criatura/Tamer ocupa ~1 tile de altura**, não os 1,5–2,25× que `ART_STYLE_GUIDE.md` §3 (tabela original, para criaturas "originais" desenhadas do zero) ou `ART_DIRECTION_V2.md` §1.4.1 (tabela redesenhada, descartada) previam.

### 2.3 Comparativo 16px × 32px — o que a prova mostra

Ver `scale-comparison/scene_16_vs_32.png` (mesma cena da Digital Forest, mesmo footprint de mundo 192×128px, Guilmon + Gabumon + Tamer oficiais, **pixel a pixel sem redimensionar**; só o tamanho do tile de chão muda). Medições exatas embutidas na própria imagem:

| | Tile 32px (grade atual) | Tile 16px (proxy) |
|---|---:|---:|
| Guilmon | 1,06× tile | 2,12× tile |
| Gabumon | 1,06× tile | 2,12× tile |
| Tamer | 1,03× tile | 2,06× tile |
| Tiles visíveis na mesma cena | 6×4 | 12×8 |

**Leitura visual [E, inspeção desta sessão]:** em 32px a criatura e o chão competem em escala — cada tile de grama/terra é visualmente tão grande quanto o Digimon em cima dele, o que lê como "criatura pequena boiando sobre blocos grandes de textura", não como a proporção clássica de RPG 2D (personagem claramente mais alto que uma unidade de chão). Em 16px (proxy), Guilmon/Gabumon/Tamer passam a ocupar ~2 tiles de altura — a proporção "GBA clássico" (Pokémon, Golden Sun, a própria série Digimon World DS no overworld) volta a aparecer, porque é exatamente a proporção em que esses sprites foram desenhados originalmente (o DS usa uma grade de referência menor que 32px).

**Mas a imagem de 16px desta prova NÃO é arte 16px nativa** — é um downscale nearest-neighbor 2× dos mesmos tiles de 32px já em produção (`forest-v11-ground/tiles/ground_variant_*.png`), feito só para medir a PROPORÇÃO, não a qualidade final. Isso já aparece como limitação visível na própria imagem: o chão em 16px fica mais "ruidoso"/granulado do que o original em 32px, porque o tile não foi desenhado para aquela densidade de pixel — é esperado que uma tileset 16px nativa (desenhada do zero nessa escala) ficasse mais limpa que este proxy.

### 2.4 Recomendação do diretor de arte **[H]** — decisão em aberto, não executada

**Recomendo adotar tile = 16px como padrão de produção para a reconstrução de cenário da Digital Forest sob esta missão (Visual Identity 1.0)**, pelas razões acima: é a única forma de a proporção criatura↔mundo ficar "GBA" de verdade quando o sprite de criatura está congelado no tamanho oficial (não pode mais crescer via redesenho). O nome da própria missão ("GBA Plus") e a decisão de hoje (sprites oficiais, sem redesenho) apontam na mesma direção.

**Isto NÃO é uma migração executada — é uma proposta.** Pesa contra ela:
- `MAP_ART_BIBLE.md` §2 trava tile=32 como "não negociável nesta fase" e todo o investimento de Map Factory (forest-v4 até v12, building kits, path tiles, autotile Wang-47) foi feito nessa escala — mudar o tile não é um parâmetro, é redesenhar/reduzir à mão cada peça já aprovada, custo real e não-zero.
- Existe uma alternativa já documentada e nunca descartada: `ART_STYLE_GUIDE.md` §9b (2026-11-08) já previa exatamente este cenário — "sprite oficial nativo 1×, tile 32 mantido, resolve-se com câmera larga (viewport de 30–40 tiles de largura)" em vez de mudar a grade. Essa alternativa **preserva 100% do investimento em tile 32px** e tem custo de implementação muito menor (é ajuste de câmera, não arte nova).
- Uma tileset 16px nativa de qualidade equivalente à família forest-v4→v12 (32px) precisaria ser desenhada do zero — não é um downscale do que já existe (ver §2.3, o downscale fica "ruidoso").

**Esta é uma decisão de arquitetura de grade, não só de arte — fica fora do escopo de execução deste Gate 1 (custo zero) e precisa de aprovação explícita do fundador antes de qualquer trabalho de produção em qualquer uma das duas direções.** O que este Gate 1 entrega é a evidência (comparativo) e a recomendação justificada pedida, não a migração.

### 2.5 Tamer

Mesma régua do Digimon: arte nativa fixa no tamanho oficial-fan-use já em uso (`TAMER-0009`, 26×33px, pivô 13,32) — as faixas de `ART_DIRECTION_V2.md` §1.2/§1.4.1/§1.5 (52–64px "redesenhado") ficam **supersedidas** pela mesma razão do Digimon (§2.2). Direções desenhadas hoje: só diagonais (SW/SE/NW/NE) — **nenhuma direção cardeal (S/N/E/W) existe para o Tamer** `[E, ls do repositório]`; isso é uma lacuna de cobertura a resolver com recorte/espelhamento local (zero custo) ou produção futura, não deste documento.

---

## 3. Paleta-mestra

Duas famílias que **nunca se misturam diretamente** (regra já estabelecida, `ART_DIRECTION_V2.md` §2 e `ART_STYLE_GUIDE.md` §9b regra 3): a paleta do **sprite oficial** (própria, vem do arquivo, não é forçada para a Endesga-32) e a paleta do **cenário/UI** (Endesga-32 + ramps do bioma).

### 3.1 Cores reais medidas nos sprites oficiais **[E]**

Top-colors por contagem de pixel, extraídos nesta sessão com Pillow sobre os PNGs reais de mapa (frame walk_S):

| Digimon | Cores dominantes (hex, contagem de pixel) |
|---|---|
| **Guilmon** | `#212121` contorno/escuro · `#6b1008` sombra do corpo · `#b51808` corpo base · `#ff1000` realce/acento vermelho vivo · `#422100` marca escura · `#947b5a`/`#bdad8c` barriga/garras · `#ffefe7` realce claro |
| **Gabumon** | `#202020` contorno/escuro · `#78a0f8`/`#c8d8f8` pelagem azul-clara · `#0028d0`/`#1860d8` azul profundo (listras) · `#b05800`/`#e08808` chifre/patas âmbar · `#2890c8` acento frio · `#f8e018` detalhe amarelo · `#800070` sombra roxa |

Confirma `ART_STYLE_GUIDE.md` §4 na prática: cada criatura usa ~6–8 cores concentradas, contorno escuro quase-preto (não `#181425` puro da Endesga-32 — é a cor própria do rip, mais neutra), sem gradiente suave (poucos tons por faixa de cor, blocado).

### 3.2 Paleta do cenário (Floresta Densa, piloto) **[E]**

Herdada integralmente de `forest-v11-ground/palette.json` (produção real, 0 hex novo nesta entrega):

```
grassFamilyA        #273f2b #38583a #51754b #72935b #95ad6d
grassFamilyBOlive   #2b432b #405d3d #5e7c52 #839c63 #a9b777
grassShadePocket     #1d3022 #2a432d #3a5938 #527044 #6d8351
dirt                 #3f3025 #584531 #715b41 #8c7656
foliageDepthDay      #111e16 #1b2e20 #273f2b #38583a #51754b #72935b #95ad6d #cfdd8a
foliageDepthNight    #0e101a #181c29 #222a38 #2f384a #404b60 #57627b #707b93 #a0b5d5
stone                #474b54 #656b75 #8c9199
moss / mossEdge      #445838 / #49643c
```

Paleta-mãe de referência (mundo/UI, de onde esses ramps derivam por multiplicadores, nunca hex solto novo): **Endesga-32** (`ART_STYLE_GUIDE.md` §4, 32 cores, lista completa lá).

**Regra de uso:** cenário usa só Endesga-32 + ramps aprovados acima (`MAP_ART_BIBLE.md` §1/§7 regra 1); criatura/Tamer usam a paleta própria do arquivo oficial, nunca misturada com a do bioma (ver exemplo reprovado §6.4).

---

## 4. Contorno

- **Sprite oficial (Digimon/Tamer):** usar o contorno **como veio no arquivo** — não redesenhar, não aplicar um stroke genérico por cima. Visualmente é um contorno escuro de ~1,5–2px, macio (não um stroke rígido de 1px), consistente com `ART_STYLE_GUIDE.md` §9b (inspeção visual dos GIFs oficiais Rookie).
- **Cenário (tile, prop):** sem contorno rígido — separação por contraste de cor/sombra, técnica `rimDarken()` OU o contorno `#181425` de `autoOutline()`, **nunca os dois juntos no mesmo asset** (duplica borda, lê como erro — `MAP_ART_BIBLE.md` §7 regra 4).
- **Proibido (falha crítica):** qualquer suavização/blur aplicado sobre o contorno de um sprite oficial (anti-aliasing destrutivo) — ver exemplo reprovado §6.1. Isso inclui upscale com filtro suave: só nearest-neighbor.

---

## 5. Sombra

- **Sombra de contato:** elipse (ou banda simples em baixa resolução) em tom escuro neutro (`#181425`-like, ou o próprio tom mais escuro do ramp do chão), **25–40% de opacidade**, sob os pés, ancorada no pivô (`ART_STYLE_GUIDE.md` §5.4). Toda criatura/Tamer no mapa precisa de uma — sem ela, a entidade "flutua" sobre o chão (ver exemplo reprovado §6.2).
- **Sombra projetada de objeto de cenário (árvore, rocha, prop):** elipse alongada para baixo-e-direita, na direção oposta à luz (§6 abaixo) — `MAP_ART_BIBLE.md` §3.
- **Proibido:** sombra em retângulo duro, sombra 100% opaca, ou ausência de sombra em qualquer entidade móvel no chão.

---

## 6. Luz — dia e noite

- **Fonte fixa superior-esquerda** em todo sprite/tile desenhado do zero (realce no quadrante superior-esquerdo, sombra no inferior-direito) — `ART_STYLE_GUIDE.md` §5.2, `MAP_ART_BIBLE.md` §3. **Não se aplica** a um rip oficial (ele já vem com a própria luz embutida no arquivo — não re-iluminar o sprite do Digimon/Tamer).
- **Regra de cena (grade S/V) — já em produção no look v8/v9, promover a caminho padrão:** saturação ×0,64, valor ×0,8 sobre a arte de cenário de base; rim de luz (12% mais claro) sobe para S×0,88/V×0,92 (`ART_DIRECTION_V2.md` §2, `look.ts`). **Criaturas e Tamer ficam FORA dessa grade** — mantêm a cor própria do arquivo, para não lavar com o ambiente.
- **Noite:** mesma direção de luz, paleta fria (`foliageDepthNight` do ramp real, §3.2) — intensidade de luz pontual ×0,55 de dia / ×1,35 à noite, `multiply` sobre o ambiente (`ART_DIRECTION_V2.md` §4, valores já calibrados em produção).
- **Luzes pontuais de cena (vaga-lumes, cristais, portais — ver §7):** aditivas, com flicker, mascaradas pela silhueta da copa/objeto (feather ~3px) — sistema já existente (`mapLights`/`lightSprite`/`flicker`, `view.ts drawLook`), não reinventar.
- **Pendência conhecida:** luzes pontuais ainda não projetam sombra própria nem são bloqueadas por geometria opaca — aceitável para o piloto, registrado como item de pós-homologação (`ART_DIRECTION_V2.md` §4).

---

## 7. Identidade do Mundo Digital

Elementos que tornam a Floresta (e os biomas futuros) legíveis como **Mundo Digital**, não "floresta terrestre genérica" — consolidado do que já está espalhado em `ART_DIRECTION_V2.md` §2, `MAP_ART_BIBLE.md` e no histórico de bugs do mirante (`MIRANTE_TOP_AND_SCALE.md`):

1. **Ruínas:** platôs/penhascos de pedra (`forest-v9-cliffs`) com face musgosa e raízes — topo do platô deve ler como terra/grama pisoteada (corrigido em `MIRANTE_TOP_AND_SCALE.md`, não mais laje de pedra uniforme), nunca uma textura granulada sem relação com o chão ao redor (ver exemplo reprovado §6.3). Ruína = silhueta quebrada de pedra antiga, não uma parede lisa.
2. **Cristais:** acento de luz quente âmbar/ciano/magenta em formações cristalinas e cogumelos digitais, pontual e aditivo, nunca a paleta inteira do bioma (`ART_DIRECTION_V2.md` §2) — reforça "isto é um lugar digital", sem competir com a paleta-mãe do cenário.
3. **Portais:** nenhum asset ainda produzido nesta missão — **[H]**, registrar para produção futura: mesma regra de luz pontual aditiva (§6), silhueta geométrica simples (anel/arco), nunca 3D/isométrico (viola §1 regra 3).
4. **Dados:** motivo visual já presente na referência original do fundador ("2 poses de evolução com brilho", `ART_STYLE_GUIDE.md` §1) e nas partículas de "dados"/vaga-lumes noturnas da clareira (`UI_DIRECTION_V2.md` §7) — pequenos fragmentos/partículas luminosas, sutis (não constantes), usados em evolução e como vida ambiente noturna. Nunca usar como textura de preenchimento de tile (isso viraria ruído, ver §6.3).

---

## 8. Regras de aprovação — matriz de nota

Herdado do processo já em vigor (`ART_DIRECTION_V2.md` §6, ADR-012 §3 "nenhum agente aprova o próprio trabalho visual") — formalizado aqui como **matriz de nota 0–10**, nota mínima de aprovação **8/10**, com **falha crítica reprovando o asset independente da nota total**.

### 8.1 Critérios (criatura/Tamer/Digimon) — peso igual, nota 0–10 cada, média final

| Critério | O que avalia |
|---|---|
| Fidelidade ao oficial | Para sprite `official-fan-use`: é o arquivo original, sem redimensionar com interpolação, sem redesenho não autorizado (§1 regra 1). |
| Escala no tile | Está na altura nativa medida (§2.2), não inflada nem comprimida. |
| Contorno | Preservado como no arquivo original; nenhum blur/AA aplicado por cima (§4). |
| Sombra de contato | Presente, elipse, 25–40% opacidade, ancorada no pivô (§5). |
| Paleta | Cores do próprio arquivo oficial, sem mistura com a grade do cenário (§3.1/§6). |
| Animação por anatomia | Segue o padrão de `ART_DIRECTION_V2.md` §5 (walk/idle/attack/hurt por tipo de corpo). |
| Legibilidade de silhueta | Reconhecível a distância de leitura de jogo, sem abrir close-up (`ART_STYLE_GUIDE.md` §6). |

### 8.2 Critérios (tile/mapa) — mesma régua 0–10

| Critério | O que avalia |
|---|---|
| Paleta | Só Endesga-32 + ramps aprovados (§3.2), nenhum hex novo solto. |
| Textura | Blocos de cor sólidos, 2–3 tons por faixa, **sem granulado/ruído aleatório** (§6.3 do exemplo reprovado). |
| Luz | Realce superior-esquerda / sombra inferior-direita, consistente com a cena ao redor (§6). |
| Autotile | Segue o bitmask documentado (blob-16 ou Wang-47), sem degrau quadrado na emenda (`MAP_ART_BIBLE.md` §6). |
| Identidade de Mundo Digital | Contém ao menos 1 elemento de §7 quando for peça de assinatura do bioma (não obrigatório em todo tile de chão genérico). |
| Camadas | `suggestedLayer`/`collision` declarados corretamente, nenhum prop com colisão na camada `canopy-top`/`objects_above` (`MAP_ART_BIBLE.md` §7 regra 7). |

### 8.3 Falhas críticas (reprovam sozinhas, nota final irrelevante)

- Sprite de criatura oficial redimensionado com interpolação (perde nitidez do pixel original).
- Blur/AA/glow difuso sobre contorno de personagem ou criatura.
- Perspectiva isométrica/3D em personagem, criatura ou chão de bioma principal.
- Cor fora da Endesga-32/ramp aprovado em asset de cenário, ou paleta do sprite oficial "corrigida"/misturada à força com a grade de cor do mapa.
- Ausência de sombra de contato em entidade móvel.
- Contorno rígido duplicado (`rimDarken()` + `autoOutline()` no mesmo asset de cenário).
- Prop com colisão na camada sempre-acima (`canopy-top`/`objects_above`).

### 8.4 Processo

1. Produtor entrega → 2. GAME-ART-DIRECTOR aplica a matriz (§8.1/§8.2), registra nota por critério + nota final, checa falhas críticas primeiro (§8.3; qualquer uma = reprovado, não precisa nem somar a matriz) → 3. **Aprovado** exige nota final ≥ 8/10 **e** zero falhas críticas → 4. Abaixo de 8 ou com falha crítica: "Precisa melhorar"/"Refazer", com o critério específico que falhou (nunca "está ruim" genérico) → 5. Reentrega → 6. só depois de Aprovado o asset vai para integração (game-dev) → 7. Homologação final continua sendo do fundador (GS-010 §8), não deste diretor.

---

## 9. Exemplos aprovado/reprovado

Ver `approval-sheet/approved_vs_rejected.png` (gerado nesta sessão, `approval-sheet/build_approval_sheet.py`, reprodutível) — 4 pares, cada um partindo de um **asset real do projeto** (Guilmon oficial, tile `ground_variant_2` do forest-v11-ground) com o lado "reprovado" sendo uma alteração sintética deliberada, só para ilustrar a regra (não é arte candidata real):

### 9.1 Contorno
- **Aprovado:** contorno próprio do sprite oficial, macio, sem blur.
- **Reprovado:** mesmo sprite com blur gaussiano aplicado — viola a regra "sem AA/blur" (§1 regra 2, §4).

### 9.2 Sombra
- **Aprovado:** elipse de contato sob os pés, ~25–40% opacidade.
- **Reprovado:** mesmo sprite sem nenhuma sombra — "flutua" sobre o chão, viola §5.

### 9.3 Ruído de textura
- **Aprovado:** tile de chão em produção (`forest-v11-ground`), blocos de cor sólidos, sem granulado.
- **Reprovado:** mesmo tile com ruído aleatório por pixel sintetizado — ilustra o problema real já documentado em `MIRANTE_TOP_AND_SCALE.md` ("topo do platô... placa de pedra cinza-arroxeada **granulada**"), que já foi corrigido em produção mas serve de exemplo didático do que não aceitar de novo.

### 9.4 Cores
- **Aprovado:** paleta própria do sprite oficial (vermelho/preto/creme/olho amarelo), sem mistura com a paleta do cenário.
- **Reprovado:** mesmo sprite com hue-shift + saturação sintéticos — cor "neon" fora de qualquer ramp aprovado, viola §3.2/`MAP_ART_BIBLE.md` §7 regra 1.

---

## 10. Limitações deste Style Bible

- **A questão de escala (§2) fica formalmente em aberto** — este documento dá a evidência e a recomendação pedidas pelo Gate 1, mas a decisão de mudar (ou não) o tile de produção de 32px para 16px precisa de aprovação do fundador antes de qualquer execução; nenhuma migração foi feita.
- O comparativo 16px (§2.3) usa tiles **downscaled** do material 32px existente, não arte 16px nativa — a qualidade final de uma tileset 16px desenhada do zero não é medida aqui.
- A paleta-mestra do sprite oficial (§3.1) foi amostrada de **2 espécies** (Guilmon, Gabumon), ambas Rookie, mesma fonte (DW DS/Spriters Resource) — não cobre Bebê/Champion/Mega nem as outras ~30 espécies já catalogadas (`digimon_sprite_catalog.json`); a regra geral (6–8 cores, contorno escuro macio) é inferência razoável mas não verificada espécie a espécie.
- A seção de Mundo Digital (§7) consolida o que já existe disperso nos documentos — "portais" não tem nenhum asset ou prova visual ainda, é diretriz para produção futura, marcado **[H]**.
- A folha aprovado/reprovado (§9) usa edições sintéticas (blur, ruído, hue-shift) para ilustrar regras — são material didático deste Style Bible, não substituem um QA real de asset candidato a produção.
- Nenhuma destas decisões foi revisada por outro agente (`game-qa`) — ADR-012 §3 pede revisão cruzada antes de uma checklist virar obrigatória em produção; este documento é a proposta do diretor de arte, não a palavra final.
