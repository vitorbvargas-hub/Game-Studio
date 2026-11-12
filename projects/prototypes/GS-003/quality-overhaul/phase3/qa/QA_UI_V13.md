# QA_UI_V13 — Visual-QA do pacote de interface UI v13 "GBA Clean" (hub/Digivice/HUD/mapa-múndi)

- **Autor:** game-qa (subagente) · **Data:** 2026-11-11
- **Custo:** zero. Nenhuma chamada PixelLab usada (0 gerações, `generations_remaining` intocado). Toda a análise foi feita com `read` (inspeção visual direta dos PNGs) e Pillow local (`~/projects/GameStudio/shared/tools/sd-local/.venv`, já instalado) para crops, zoom nearest-neighbor, contagem de cores e simulação de 9-slice — nenhuma arte foi alterada, nenhum arquivo do pacote foi movido ou sobrescrito.
- **Escopo revisado:** `art/ui-v13/` completo (hub, 16 ícones, 3 tiers de painel/botão/aba/barra decorativa, barras funcionais HP/XP/Energia, HUD inferior composta, 6 regiões do mapa-múndi em 64/128px, fonte "Digivice GBA Clean", 3 mockups 1920×1080, `manifest.json`).
- **Referências usadas:** `DIGIMON_STYLE_GUIDE.md` (Style Bible v1.0), `VISUAL_IDENTITY_1.0_BRIEF.md` §08, `DIGIVICE_VI1_SPEC.md` (game-design, phase3/design), `P8_HUD_V2_SPEC.md` (game-design, phase2/design), refs `direction-v13/refs/pokeidledex/*`. Também inspecionei, **só leitura**, o worktree `workspaces/game-dev/qo` (branch `quality-overhaul`, commits `1ce3019`/`23de52d`) para comparar a arte entregue com o que o Digivice VI 1.0 (P0/P1) já renderiza hoje em jogo.
- Marcação: **[E]** evidência (arquivo/medição desta sessão, citada) · **[H]** julgamento de direção/hipótese.

---

## 1. Resumo executivo

O pacote tem identidade interna forte nos componentes isolados (ícones, fonte, hub, 6 regiões) e **falha em dois pontos que bloqueiam a entrega como está**: (1) o texto composto nos mockups e na HUD montada (`build_hud_components.py`/`build_mockups.py`) tem anti-aliasing visível — viola a regra dura do próprio Style Bible ("sem anti-aliasing", §1 regra 2) e o pedido explícito de legibilidade em `?dpr=1`; (2) o estado **bloqueado** do botão tier1 tem o ícone de cadeado sobreposto diretamente ao texto "START", tornando o rótulo ilegível. Fora isso, a consistência **entre tiers** (botão vs. painel vs. aba) é mais fraca do que a autoavaliação do game-art admite (7/10): o botão usa uma linguagem visual (cápsula com cantos em circuito ciano) que não bate com o corte sólido em bloco dos painéis/abas/barras do mesmo tier. Confirmei que o Digivice VI 1.0 já implementado em código (`1ce3019`/`23de52d`) **não usa nenhuma peça deste pacote hoje** — é uma tela cinza plana, sem ícones, sem moldura, sem fonte nova — então toda a integração visual ainda está por fazer; a boa notícia é que os dados (nome, nível, XP, atributos, contadores) já batem exatamente com o que a spec pede.

**Nota geral ponderada: 6,5/10** (abaixo do mínimo 8/10 do VI 1.0 §10) — falha crítica em legibilidade de texto (regra dura do Style Bible) reprova a entrega como está; nenhuma falha crítica de identidade Digimon/pixel-art em si (as peças isoladas, uma a uma, são sólidas).

---

## 2. Achados por item — nota, prioridade, caminho

### 2.1 Fonte pixel "Digivice GBA Clean" — **9/10** [E]

- `font/digivice_gba_clean_atlas.png` — inspecionado em zoom 4× nearest-neighbor: glifos perfeitamente nítidos, 2 cores puras (preto/transparente), sem anti-aliasing, grade de pixel consistente. Atende à regra dura do Style Bible.
- Único reparo: não testei o `.ttf` renderizado num motor real (fora do escopo desta QA, que é só leitura de arte) — a nota pressupõe que o `.ttf` reproduz o atlas fielmente.

### 2.2 Texto composto na HUD e nos mockups — **3/10 — P0** [E]

- **Achado:** `hud/digimon_block.png`, `hud/tamer_block.png` e os 3 mockups (`mockups/ui13_*`) têm o nome/nível/rótulos ("GUILMON", "Nv.6", "KAIO", "Nv.44", "ATRIBUTOS (ATIVIDADE DO TAMER)", "Vitórias" etc.) renderizados com **anti-aliasing visível** (halo cinza em degradê nas bordas das letras, confirmado em zoom 4× via Pillow) — não é a fonte pixel do atlas (§2.1), é texto desenhado por `ImageFont.truetype`/Pillow sem desabilitar suavização.
- **Por que é P0:** o Style Bible (`DIGIMON_STYLE_GUIDE.md` §1, regra dura 2) proíbe "blur, glow difuso ou soft-shadow com gradiente contínuo" — texto com anti-aliasing cai na mesma categoria de suavização destrutiva que a regra de contorno (§4) já proíbe para sprites; e é exatamente o item que o briefing desta QA pediu para verificar ("legibilidade do texto em `?dpr=1`"). Em `?dpr=1` (escala inteira, nearest-neighbor, sem blur — `P8_HUD_V2_SPEC.md` princípio 0), esse halo ficaria ainda mais visível, não menos.
- **Causa provável:** `build_hud_components.py`/`build_mockups.py` usam `ImageDraw.text(..., font=ImageFont.truetype(...))` sem renderizar em modo bitmap/1-bit nem usar o atlas pixel já produzido — a fonte certa existe (§2.1), só não foi usada na composição.
- **Arquivos afetados:** `hud/tamer_block.png`, `hud/digimon_block.png`, `hud/bottom_hud_bar.png`, `mockups/ui13_hud_overlay_clareira_1920x1080.png`, `mockups/ui13_digivice_tamer_1920x1080.png`, `mockups/ui13_mapa_mundi_1920x1080.png`.
- **Correção (zero geração):** trocar a chamada de texto por amostragem do próprio `font/digivice_gba_clean_atlas.png` (recortar glifo a glifo pela grade 10×8 já documentada) ou renderizar com `ImageFont` em modo `"1"` (1-bit, sem anti-aliasing) e then `im.convert` sem suavização — ambos custam 0 gerações, é só correção de script Pillow.

### 2.3 Botão — estado bloqueado — **1/10 — P0** [E]

- **Achado:** `buttons/button_tier1_locked.png` (zoom 6× nearest-neighbor): o ícone de cadeado está centralizado **diretamente sobre** a palavra "START", cobrindo o "A" e parte do "R"/"T" — o rótulo fica ilegível ("S??RT" na prática).
- **Por que é P0:** é exatamente o item que a `P8_HUD_V2_SPEC.md` §3 (estado "Bloqueado/desabilitado") e o VI 1.0 §10 ("falha crítica em identidade... reprova o asset independentemente da nota") cobrem — um botão cujo rótulo não dá pra ler no estado que mais precisa comunicar "por que não". Sem o cadeado sobre o texto, o estado em si (cor dessaturada, cinza) já comunicaria "bloqueado" sem ambiguidade.
- **Correção (zero geração):** `inpaint_image`/`pixelart_workbench` **custam geração** e não é o caminho — a correção de zero-custo é local: mover o cadeado para o canto superior-direito do botão (como `P8_HUD_V2_SPEC.md` §3 já define para outros elementos bloqueados, "ícone de cadeado 10×10px no canto") via composição Pillow, não regerar a arte.

### 2.4 Consistência entre tiers (painel ↔ botão ↔ aba ↔ barra) — **5/10 — P1** [E]

Inspecionei os 4 componentes de cada tier lado a lado (zoom 4–6×):

| Componente | Tier1 (comum) | Tier2 (raro) | Tier3 (lendário) |
|---|---|---|---|
| **Painel** (canto) | bloco sólido bronze entalhado | **linha de circuito ciano brilhante** (técnica diferente — não é um bloco sólido, é um traço fino em neon) | bloco sólido dourado com filigrana barroca |
| **Aba** | pílula com canto bronze sólido | pílula com canto ciano brilhante | pílula com canto dourado sólido |
| **Barra decorativa** | prancha de madeira/bronze diagonal | prancha ciano/teal sólida | prancha com friso dourado |
| **Botão** | **pílula arredondada, cantos em arco ciano brilhante** (mesma técnica do painel tier2!) | pílula arredondada, cantos em arco ciano brilhante (quase idêntico ao botão tier1) | retângulo de cantos retos cinza + friso dourado fino (silhueta totalmente diferente dos outros dois) |

- **Achado principal:** o **botão tier1** usa a mesma técnica de "arco de circuito ciano" do **painel tier2**, não a técnica de "bloco sólido bronze" do seu próprio painel/aba/barra tier1 — por isso um botão tier1 e um botão tier2 ficam quase indistinguíveis lado a lado (ver `/tmp/qa_ui_v13/btn_t1_6x.png` vs. `btn_t2_6x.png` gerados nesta sessão), enquanto o botão tier3 muda de silhueta inteira (retângulo reto em vez de pílula). Isso contraria a premissa de "reconhecer o tier à distância" que o próprio sistema de 3 níveis propõe.
- **Painel tier2 em si:** a técnica "linha de circuito fina" é visualmente mais parecida com a estética do hub/anel social existente do jogo do que com os painéis tier1/tier3 (que usam bloco sólido entalhado) — não é um erro isolado, é uma 2ª linguagem de construção dentro do mesmo conjunto de 3 tiers.
- **Correção para a rodada 2:** regenerar só os 3 botões normais (ou só o tier1, reaproveitando os já existentes de tier2/3 como está) com a mesma técnica de canto sólido entalhado do painel do mesmo tier — **estimativa: 3 gerações** (`create_ui_asset` ou `edit_image_pro_flash` por botão, ~5 cada) caso o fundador aprove gastar do saldo restante (53/200 do game-art, ver `UI_V13.md` §4).

### 2.5 Paleta — moldura dourada barroca vs. teal do kit — **6/10 — P1** [E]

- **Dentro do próprio pacote**, a progressão bronze→ciano→dourado por tier é coerente e **intencional** (comum/raro/lendário) — não é um erro.
- **O problema é de integração, não do pacote em si:** no mockup `ui13_mapa_mundi_1920x1080.png`, o painel tier3 dourado-barroco (cartão "Floresta Densa") fica **dentro** de uma moldura externa de modal em ciano neon brilhante — essa moldura externa **não faz parte do pacote ui-v13** (não há nenhum arquivo de "janela/shell externo" no manifest); é o chrome de modal já existente no jogo (nível 2 do `P8_HUD_V2_SPEC.md` §2, ainda não re-pele). O resultado visual é dourado-barroco contra ciano-neon no mesmo quadro, lendo como duas identidades diferentes coexistindo.
- **Confirma achado do próprio `UI_V13.md` §6.2** ("3 tiers de painel não compartilham 1 paleta forçada"), mas o problema maior é a **ausência de um 4º asset**: uma moldura externa de modal (nível 2, "placa digital") que *também* siga a família bronze/ciano/dourado — sem ela, qualquer painel novo vai continuar encaixado dentro do chrome ciano antigo quando integrado.
- **Para rodada 2:** produzir 1 moldura de modal externo (nível 2, `P8_HUD_V2_SPEC.md` §2.3, canvas 48×48px 9-slice) na família neutra/bronze que sirva de container pros 3 tiers — **estimativa: 1 geração** (`create_ui_asset`, ~10 gerações pelo tamanho 256×256, ou usar o already-existing `panel_tier1` como shell neutro sem custo extra).

### 2.6 HUD inferior (barra combinada) — **8/10** [E]

- `hud/bottom_hud_bar.png`: layout, peso visual e hierarquia batem com `P8_HUD_V2_SPEC.md` §4.1 (bloco Tamer + bloco Digimon + equipe + barra de golpes num só painel tier1).
- **Confirmado por medição de pixel (Pillow):** a barra de PV do Digimon é verde (`#3fbf3f`-ish) e a de XP é ciano — correto conforme `P8_HUD_V2_SPEC.md` §2.1/manifest (a impressão inicial de "as duas pareciam ciano" na miniatura foi engano de escala; em zoom 4× as cores batem com a spec).
- Único ponto fraco: os rótulos "GUILMON"/"Nv.6"/"KAIO"/"Nv.44" têm o mesmo problema de anti-aliasing do item 2.2 — a nota de 8 já desconta isso parcialmente (sem o texto, seria 9–10).

### 2.7 Ícones 32px — legibilidade em 16/24px — **7/10** [E]

Testei downsample nearest-neighbor real (32→24 e 32→16px) dos 16 ícones:

- **Em 24px:** todos os 16 continuam claramente legíveis e distintos entre si.
- **Em 16px:** 14 de 16 continuam legíveis; **`icon_fonte.png`** (gota d'água, ícone da Fonte dos Desejos) perde definição e vira um borrão azul genérico; `icon_correio.png` (carta) fica ambíguo (lê como "retângulo com algo vermelho no topo", não claramente uma carta) — ambos usados no anel social do hub, que é renderizado pequeno (os nós do arco, `HUD_IDENTITY_V3.md`).
- **Os 4 ícones de tipo de golpe** (`icon_move_attack/defend/special/item`) são ilustrações de criatura/personagem em miniatura (um "demônio" para ataque, por exemplo), não símbolos abstratos — mais ricos visualmente, mas mais carregados do que o padrão usual de ícone de categoria de golpe (que costuma ser um glifo simples: espada, escudo, estrela). Em 16px especificamente continuam legíveis como manchas de cor coerentes com a categoria (vermelho=ataque etc.), mas a leitura é "por cor", não "por forma" — **[H]** aceitável para o uso em slot de 44px da barra de golpes (`hud/move_bar.png`), arriscado se um dia forem usados menores que isso.
- **Correção (zero geração):** não é bloqueante — só sinalizar para rodada 2 um ajuste de silhueta em `icon_fonte`/`icon_correio` especificamente (reforçar contorno/simplificar forma interna), **estimativa: 2 gerações** (`edit_image_pixen`, 1 cada).

### 2.8 Painéis 9-slice — tileável de verdade? — **8/10** [E]

- Simulei o 9-slice real (insets 10/10/10/10 do `manifest.json`) esticando os 3 painéis para 320×160px (quase 2× o tamanho nativo) com script Pillow próprio (corta os 9 blocos, redimensiona só os de borda/meio, nearest-neighbor) — **cantos permanecem nítidos e sem esticar** nos 3 tiers; não há vazamento de pixel nem corte visível nas emendas corner↔borda.
- **Preenchimento interno:** medido por contagem de cores (Pillow) — a área central tem só 2–4 cores distintas, todas a 1 unidade de diferença (dither muito sutil, não gradiente real); é segura para esticar até ~2× sem criar banda visível. **Ponto de atenção para rodada 2 [H]:** o modal do núcleo Tamer/Digimon já implementado usa 820px de largura (`P8_HUD_V2_SPEC.md` §5) — mais de 4× a largura nativa do painel (172px) — não testei esse fator de estiramento extremo; recomendo ao game-dev validar visualmente ao integrar, antes de assumir que está automaticamente OK.
- **Botão tier1** também testado esticado (180×50px) — sem defeito.

### 2.9 Mapa-múndi — leitura de continente vs. grade de cartões — **5/10 — P1** [H]

- O mockup `ui13_mapa_mundi_1920x1080.png` entrega uma **grade 2×3 de cartões** (Vila dos Bebês/Praia dos Postes no topo, Montanha/Deserto embaixo, Zona Corrompida ao centro-baixo, Floresta Densa em destaque no centro) — não há posicionamento geográfico entre as regiões (sem trilhas conectando, sem silhueta de continente/arquipélago ao fundo), é puramente um menu em grade com cartões de tamanho e borda diferentes por status (liberado/bloqueado/atual).
- **Isso não é um defeito de execução** — os cartões em si são limpos, legíveis, com estado bloqueado/liberado/atual bem diferenciado por cor (verde "Liberado", vermelho "Bloqueado Nv.XX", borda dourada tier3 para "Você está aqui"). **É uma lacuna de conceito**: o nome "mapa-múndi" promete uma leitura espacial de mundo que a entrega (uma grade de 6 cards) não tenta cumprir — mais parecido com uma tela de seleção de fase do que um mapa.
- **[H] recomendação para rodada 2:** se o fundador quiser de fato uma leitura de "continente"/mundo conectado, isso exige um 7º asset (o próprio fundo do mapa-múndi, com as 6 ilhas posicionadas sobre uma silhueta de arquipélago/trilhas) — não um recorte dos cards existentes. **Estimativa: 1 geração** de um background de mapa-múndi (`create_image_pro`, ~10–15 gerações pelo tamanho 1920px-equivalente) + recomposição local (Pillow) dos 6 cards por cima, no caminho novo.

### 2.10 Regiões (ilhas flutuantes isométricas) — **7/10** [E] + [H]

- `regions/region_floresta_densa_128.png`/`_64.png`: downsample 128→64 confirmado nearest-neighbor (nenhuma interpolação) — os dois batem composição pixel a pixel como o manifest promete.
- Qualidade isolada da ilustração é boa: ruína+trilha+cogumelos+cristais lê bem como "Floresta Densa", cores batem com a paleta do bioma real do jogo (`forest-v11-ground`, confirmado visualmente contra o mockup de HUD que usa o cenário real).
- **[H] ponto de atenção, não falha crítica:** são dioramas **isométricos** de "plataforma flutuante" — o próprio `UI_V13.md` já nota que a regra-3 do Style Bible (proibição de isométrico) não se aplica a UI/ícone de mapa, e tecnicamente está certo. Mas visualmente a estética "ilha flutuante isométrica" (estilo *Clash of Clans*/mobile) destoa da identidade "GBA Clean" top-down estabelecida no resto do jogo (a cena de fundo nos mockups é top-down 3/4, sem flutuação) — é uma escolha de direção que vale confirmação explícita do fundador antes da rodada 2, não um erro técnico.

### 2.11 Hub (3 estados) — **9/10** [E]

- `hub_closed`/`hub_notification`/`hub_boss_active`: família visual muito coesa (mesmo anel facetado, mesmos rebites dourados), progressão de cor clara (ciano calmo → pip dourado → vermelho em alerta) e paleta compatível com o pequeno hub ciano já existente no jogo (confirmado contra o screenshot real do `dv_tamer_perfil.png`) — a troca deve funcionar bem visualmente como upgrade direto.

### 2.12 Retrato do Tamer — pendência confirmada — **P1** [E]

- `icons/icon_tamer.png` é usado nos mockups como "retrato" do núcleo Tamer (slot 96×96 da `DIGIVICE_VI1_SPEC.md` §4.2) — mas é um ícone simbólico de 32px escalado, não um recorte real do sprite oficial do Tamer como a spec pede. Já documentado como pendência conhecida em `UI_V13.md` §6.4; esta QA só confirma visualmente (o ícone escalado 3× fica visivelmente mais pixelado/blocado que um recorte nativo de 96px seria) e reforça a prioridade: é o único "furo" de conteúdo que impede a aba Tamer·Perfil de bater 100% com a spec.
- **Estimativa para rodada 2:** depende de decisão do fundador sobre a fonte da arte do Tamer (sprite oficial recortado, §2.5 do Style Bible, 26×33px nativo — pequeno demais para um retrato de 96×96 sem upscale, o que a regra dura #1 do Style Bible proíbe) — provavelmente exige uma pose/retrato dedicado, não um recorte do sprite de mapa. **[H] fora do escopo de custo desta QA estimar sem essa decisão.**

---

## 3. Cobertura vs. Digivice VI 1.0 P0/P1 já implementado (commits `1ce3019`/`23de52d`)

Comparei a arte entregue contra os screenshots reais do núcleo já implementado (`workspaces/game-dev/qo/.../quality-overhaul/phase3/panels/dv_*.png`, só leitura):

- **Dados: 100% corretos.** Nome, nível, XP, "faltam X XP para o próximo nível", os 6 contadores de Atributos do Tamer (Vitórias/Espécies escaneadas/Digivoluções/Mapas/Chefões despertados/derrotados), % de evolução — tudo bate exatamente com a spec, zero número inventado (confirmado em `dv_tamer_perfil.png`, `dv_tamer_atributos.png`, `dv_digimon_perfil.png`, `dv_vinculo.png`).
- **Arte: 0% integrada hoje.** O modal em jogo é uma tela cinza/navy plana (chanfro nível-2 genérico), aba lateral com ícones de emoji do sistema (🎒📋⭐🎖️🐾❤️), **nenhum** ícone do pacote (`icon_tamer`, `icon_digimon` etc.), nenhuma moldura bronze/ciano/dourada, fonte do sistema (sans-serif, não a pixel nova). Isso é esperado — o próprio `UI_V13.md` e `manifest.json` dizem claramente "nada foi integrado" — só estou confirmando com evidência visual direta que a lacuna é total, não parcial.
- **O que falta para rodada 2 fechar essa lacuna (é trabalho de `game-dev`, não de nova arte):**
  1. Trocar os ícones de emoji da aba lateral pelos 6 ícones já prontos (`icon_tamer`, `icon_digimon`, `icon_evolucao`, `icon_vinculo`, `icon_banco`, `icon_registros`) — 1:1, já existem, zero geração nova.
  2. Aplicar a moldura do painel (bronze/ciano/dourado por contexto) no modal via 9-slice (insets já documentados no manifest) — zero geração.
  3. Trocar a fonte do título/corpo pela `DigiviceGBAClean-Regular.ttf` — zero geração, mas **depende da correção do item 2.2 primeiro** (senão herda o mesmo problema de reprodução, se o motor também desenhar com anti-aliasing do navegador — isso é configuração de CSS/`font-smooth`, fora do escopo de arte).
  4. Resolver o retrato do Tamer (item 2.12) antes de trocar o placeholder atual "TAMER" (caixa vazia) pelo ícone simbólico — hoje nem o ícone simbólico está lá.

---

## 4. Tabela-resumo P0/P1/P2

| # | Prioridade | Item | Caminho | Nota |
|---|---|---|---|---|
| 1 | **P0** | Anti-aliasing no texto composto (viola regra dura do Style Bible) | `hud/*.png`, `mockups/ui13_*.png` | 3/10 |
| 2 | **P0** | Cadeado sobrepõe "START" no botão bloqueado | `buttons/button_tier1_locked.png` | 1/10 |
| 3 | **P1** | Botão tier1 usa a técnica de canto do painel tier2, não a do seu próprio tier | `buttons/button_tier1_normal.png` (e hover/pressed) | 5/10 |
| 4 | **P1** | Sem moldura de modal externo na família bronze/ciano/dourado (choca com o ciano-neon do chrome atual) | pacote não tem este asset | 6/10 |
| 5 | **P1** | Mapa-múndi é grade de cartões, não leitura de mundo/continente | `mockups/ui13_mapa_mundi_1920x1080.png` | 5/10 |
| 6 | **P1** | Retrato do Tamer ainda é ícone simbólico escalado, não recorte 96×96 | `icons/icon_tamer.png` | pendência confirmada |
| 7 | **P2** | `icon_fonte`/`icon_correio` perdem legibilidade em 16px | `icons/icon_fonte.png`, `icons/icon_correio.png` | 7/10 |
| 8 | **P2** | Ícones de golpe são ilustração de criatura, não glifo abstrato — ok no uso atual, risco se usados menores | `icons/icon_move_*.png` | [H] |
| 9 | **P2** | Regiões em diorama isométrico "ilha flutuante" destoam do top-down GBA Clean do resto do jogo | `regions/region_*.png` | [H], confirmar com fundador |
| 10 | **P2** | Validar 9-slice do painel no estiramento real de 820px do modal do núcleo (testado só até ~2×) | `panels/panel_tier*.png` | [H], sem defeito confirmado |

---

## 5. Lista para rodada 2 (com estimativa de gerações, onde cabe)

| Ação | Custo |
|---|---|
| Corrigir texto composto para usar o atlas pixel / desabilitar AA (script Pillow) | 0 (correção de código, não geração) |
| Corrigir sobreposição cadeado×texto no botão locked (reposicionar, Pillow) | 0 |
| Regenerar botões tier1 (normal/hover/pressed) com a técnica de canto do painel tier1 | ~3 gerações (`create_ui_asset`/`edit_image_pro_flash`) |
| Produzir 1 moldura de modal externo neutra/bronze (nível 2, 9-slice) | ~10 gerações (`create_ui_asset` 256×256) |
| Reforçar silhueta de `icon_fonte`/`icon_correio` para 16px | ~2 gerações (`edit_image_pixen`) |
| Background de mapa-múndi com leitura de continente (se aprovado pelo fundador) | ~10–15 gerações (`create_image_pro`) + recomposição local |
| Retrato do Tamer 96×96 (pendente decisão de fonte de arte) | não estimável sem decisão do fundador |
| **Total estimado (sem o retrato do Tamer)** | **~25–30 gerações**, dentro do saldo de 53/200 ainda livre do game-art |

---

## 6. Limitações desta QA

1. Não testei o `.ttf` renderizado dentro de um motor/browser real — só o atlas PNG; a nota de legibilidade de fonte (§2.1) é sobre o atlas, não sobre a fonte em uso real.
2. Não medi contraste numérico (WCAG) dos textos sobre fundo — a avaliação de legibilidade foi por inspeção visual em zoom, não por fórmula.
3. Não testei o 9-slice no estiramento extremo real (820px) do modal do núcleo — só simulei até ~2× (320px); fica como ponto de atenção, não um "aprovado" ou "reprovado" fechado.
4. Não tenho acesso a rodar o jogo num browser real nesta sessão (seria custo zero via `pixelart_workbench`, mas não há um ambiente de playtest acessível a este subagente) — a comparação com o Digivice VI1 implementado foi feita só com os screenshots `dv_*.png` já capturados pelo game-dev, não com uma sessão ao vivo.
5. Avaliação de "mapa-múndi vs. grade de cartões" (§2.9) e "ilha isométrica vs. GBA top-down" (§2.10) são julgamento de direção de arte **[H]**, não falha técnica objetiva — ambas pedem confirmação do fundador antes de qualquer retrabalho.
