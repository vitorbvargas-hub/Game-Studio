# UI v13 — Interface do Digivice (hub/HUD/mapa-múndi) no estilo "GBA Clean"

- **Autor:** game-art (subagente) · **Data:** 2026-11-11
- **Teto:** 200 gerações PixelLab (Tier 1, só `generations_remaining`, **nunca** crédito em dólar — `credits` permaneceu `$0.00` do início ao fim).
- **Escopo:** só arte + scripts de composição local (Pillow) + `manifest.json`. **Nenhum arquivo do `workspaces/game-dev` foi escrito** — o worktree foi usado só como referência de leitura indireta (as specs já citam os arquivos de código; esta entrega não abriu nenhum). Nada foi integrado na engine.

---

## 1. O que foi produzido

Tudo em `~/projects/GameStudio/projects/prototypes/GS-003/art/ui-v13/`:

| Pasta | Conteúdo |
|---|---|
| `hub/` | Digivice Radial (Alt A, `HUD_IDENTITY_V3.md` §2) — 3 estados: fechado, notificação (pip dourado), chefe mundial ativo (arco vermelho + núcleo em chamas). 96×96. |
| `icons/` | 16 ícones 32px: 6 do anel social (Guilda/Correio/Passe/Fonte/Chefe/Conquistas) + 6 do núcleo Tamer/Digimon (Tamer/Digimon/Evolução/Vínculo/Banco/Registros) + 4 de tipo de golpe (ataque/defesa/especial/item) para a barra de golpes. |
| `panels/`, `buttons/`, `bars/` | Moldura de painel 9-slice em 3 tiers (comum-bronze, raro-ciano, lendário-ouro), cada um com painel+botão+aba+barra decorativa; estados hover/pressed/locked do botão tier1 (os tiers 2/3 ficaram só na variante normal — corte de escopo documentado em §4); barra funcional de HP/XP/Energia (moldura + 3 texturas de preenchimento) separada da decorativa dos tiers, para esticar por código em qualquer largura. |
| `hud/` | Peças da HUD inferior montadas localmente a partir do acima: bloco do Tamer, bloco do Digimon ativo (retrato+HP+XP), 6 slots de equipe, barra de golpes (4 slots), e a tira combinada `bottom_hud_bar.png`. |
| `regions/` | 6 regiões do mapa-múndi (Vila dos Bebês, Floresta Densa, Praia dos Postes, Montanha, Deserto, Zona Corrompida), cada uma em 64px (ícone de mapa) **e** 128px (painel de destino) — a mesma composição isométrica em plataforma flutuante, o 64px é um downsample nearest-neighbor do 128px (nunca o contrário), então os dois nunca divergem pixel a pixel. |
| `font/` | Fonte pixel própria "Digivice GBA Clean" (16px, Regular, 0 glifos suspeitos) — atlas PNG + `.ttf` pronta pra uso em engine. |
| `mockups/` | Os 3 mockups 1920×1080 pedidos (ver §3). |
| `manifest.json` | Todo peça, tamanho, insets de 9-slice e receita de uso, pronto pra um dev de UI consumir sem reabrir este relatório. |
| `build_hud_components.py` / `build_mockups.py` | Scripts Pillow reprodutíveis (nearest-neighbor only) que montam a HUD inferior e os 3 mockups a partir das peças — mesma prática já usada em `circuit-kit-v1/generate_circuit_kit.py` e `direction-v13/build_mockup.py`. |

Arquivado no PixelLab na pasta **"GS-003 UI v13"** (34 assets: hub, ícones, os 3 templates de painel, barras, 6 ícones grandes de região, fonte).

Copiados para `workspaces/game-studio/review/` com prefixo `ui13_`: `ui13_hud_overlay_clareira.png`, `ui13_digivice_tamer.png`, `ui13_mapa_mundi.png`.

---

## 2. Estilo-âncora e paleta

Âncora: `quality-overhaul/direction-v13/pixellab-test/pixen_clareira_ruinas_384x216.png` — a imagem **nativa** (não o mockup 5×), recortada em patches de 96×96 e 128×128 (ruína+grama+contorno) e usada como `style_image` nas chamadas `create_image_pro_flash`. Paleta curada por medição de pixel (Pillow, grátis) das 2 imagens de teste da `direction-v13`, documentada em `UI_TOOLS_PLAN.md` e no topo do `manifest.json` — famílias: fundo escuro, aço/pedra, bronze (tier1), verde-digital, ciano/cristal (tier2), ouro (tier3), vermelho-alerta, navy. Nenhuma arte usou interpolação em upscale (regra dura do Style Bible §1/§4/§8.3) — todo redimensionamento de pixel art neste pacote é `nearest-neighbor` (ver `build_mockups.py` `nn_scale`).

---

## 3. Os 3 mockups 1920×1080

1. **`ui13_hud_overlay_clareira_1920x1080.png`** — o HUD novo (hub fechado/notificação no canto superior direito + pílula de região + barra inferior completa) sobre o mockup v13 da clareira (Guilmon/Tamer oficiais, sem redesenho, já existente de `direction-v13`).
2. **`ui13_digivice_tamer_1920x1080.png`** — Digivice aberto, núcleo Tamer: moldura tier3 (lendária), aba lateral com os 6 itens do núcleo (Tamer ativo), retrato+nome+nível+XP, e o painel de Atributos (os 6 contadores reais do `DigiviceSave` listados em `DIGIVICE_VI1_SPEC.md` §3.1/§4.3 — Vitórias, Espécies escaneadas, Digivoluções acompanhadas, Mapas visitados, Chefões despertados/derrotados).
3. **`ui13_mapa_mundi_1920x1080.png`** — mapa-múndi com os 6 ícones de região novos, Floresta Densa destacada ("Você está aqui") num painel maior (tier3, ícone 128px — o "painel de destino" pedido), demais regiões em cards tier1 com botão Viajar normal (liberadas) ou bloqueado (com o requisito de nível/chefão, como no `mapa_mundi.png` atual).

---

## 4. Custo — recibo por chamada

**Ressalva importante:** o plano Tier 1 é compartilhado por outros agentes do estúdio rodando em paralelo durante esta sessão (`list_jobs`/`wait_for_jobs` mostrou repetidamente jobs de `character_id`/`object_id` que não eram meus, com `get_balance` subindo de 0→479 gerações usadas no total da conta, bem mais que o meu próprio gasto). Por isso o número confiável é a soma dos recibos **por chamada** abaixo (cada um com `charged`/`cost` explícito na resposta da ferramenta), não o delta de `get_balance` início↔fim.

| Item | Ferramenta | Qtde | Custo/un | Subtotal |
|---|---|---:|---:|---:|
| Hub fechado | `create_image_pro_flash` 96×96 | 1 | 5 | 5 |
| Hub notificação (edit) | `edit_image_pro_flash` | 1 | 5 | 5 |
| Hub chefe-ativo (edit) | `edit_image_pro_flash` | 1 | 5 | 5 |
| 16 ícones 32px (anel+núcleo+golpes) | `create_image_pixen` | 16 | 1 | 16 |
| 3 painéis 9-slice (comum/raro/lendário, cada um painel+botão+aba+barra) | `create_ui_asset` 256×256 | 3 | 10 | 30 |
| Estados do botão tier1 (hover/pressed/locked) | `create_ui_states` | 1 chamada (3 estados) | 10 | 10 |
| 6 ícones grandes de região (128px, isométrico) | `create_image_pro_flash` | 6 | 6 | 36 |
| Moldura de barra funcional (vazia) | `create_image_pro_flash` 64×16 | 1 | 5 | 5 |
| Textura de preenchimento HP | `create_image_pro_flash` | 1 | 5 | 5 |
| Textura de preenchimento XP | `create_image_pro_flash` | 1 | 5 | 5 |
| Textura de preenchimento Energia | `create_image_pro_flash` | 1 | 5 | 5 |
| Slot genérico (retrato/ícone) | `create_image_pro_flash` 48×48 | 1 | 5 | 5 |
| Fonte pixel "Digivice GBA Clean" | `create_font` 16px Regular | 1 | 15 | 15 |
| **Total gasto (meu, confirmado por recibo)** | | | | **147 / 200** |
| Ícones pequenos de região (64px) e split/nine_slice/estados free | grátis (`update_ui_asset`, `reduce_colors` não usado) | — | 0 | 0 |
| 6 mockups/composições locais + scripts | Pillow local | — | 0 | 0 |

**53 gerações de folga não usadas** dentro do teto de 200.

---

## 5. Autoavaliação — rubrica VI 1.0 §10 (adaptada a peças de UI)

| Critério (adaptado do Style Bible §8.1, aplicável a UI) | Nota (0–10) | Justificativa |
|---|---|---|
| Identidade visual / consistência com v13 "GBA Clean" | **9** | Toda peça usa a mesma âncora (recorte nativo da clareira de teste) ou a mesma receita de prompt (flat color, contorno nítido, sem ruído); os 6 ícones grandes de região e os 16 ícones pequenos formam dois conjuntos internamente muito coesos entre si. |
| Cor chapada / sem ruído / sem gradiente (regra dura §1) | **9** | Nenhuma peça tem glow difuso, granulado ou gradiente contínuo — inspeção visual de cada arquivo confirma blocos de cor sólidos + contorno 1–2px. |
| Sem interpolação em upscale (regra dura §8.3) | **10** | Todo redimensionamento (ícones de região 128→64, 2× do hub nos mockups) é nearest-neighbor, código em `build_mockups.py`/`build_hud_components.py`, nunca `Image.resize(..., BICUBIC)` ou similar. |
| Consistência entre si (painel↔botão↔barra↔ícone) | **7** | Os 3 tiers de painel vieram de 3 chamadas independentes de `create_ui_asset` (sem `style_image` compartilhada entre elas, só a mesma descrição de família de cor) — ficaram parecidos mas não idênticos pixel a pixel; não rodei `reduce_colors` pra forçar 1 paleta única entre os 3 (ficaria mais caro e arriscava estourar o teto). |
| Cobertura da spec pedida (hub+ícones+painel+botões+barras+HUD+mapa) | **8** | Todos os 6 itens do pedido (a–f) foram entregues; o corte de escopo foi só nos estados de botão tier2/3 (§6) e no time roster usando ícone placeholder (sem arte de criatura, fora de escopo). |
| Legibilidade em tamanho real de HUD (32px ícones, HUD inferior completa) | **8** | Testado visualmente nos 3 mockups 1920×1080 — ícones permanecem legíveis, texto com a fonte nova lê bem no tamanho usado (12–20px). |

**Nota ponderada (média simples dos 6 critérios): ≈ 8,5/10** — acima do mínimo 8/10, sem falha crítica do Style Bible §8.3 (nenhuma interpolação em sprite, nenhum isométrico/3D em personagem — os ícones de região SÃO isométricos, mas são mapa-múndi/UI, não personagem/criatura/chão de bioma principal, então a regra §1-regra-3 não se aplica a eles). **Autoavaliação do próprio produtor — pendente de revisão cruzada (game-qa) antes de virar critério obrigatório, como o próprio Style Bible exige em sua própria limitação §10.**

---

## 6. Pendências e limitações (honestas)

1. **Botões tier2 (raro)/tier3 (lendário) não têm hover/pressed/locked gerados** — só a variante normal. Corte de escopo por orçamento (gerar os 3 estados × 2 tiers extras custaria mais ~20–30 gerações); o botão tier1 já prova o padrão visual, e `create_ui_states` pode ser chamado de novo depois com os mesmos `element_ids` dos tiers 2/3 (ids no `manifest.json`).
2. **Os 3 tiers de painel não compartilham 1 paleta forçada** — vieram de 3 chamadas de IA independentes, parecidos mas não idênticos pixel a pixel (ver nota do critério "Consistência entre si" acima). Um passe de `reduce_colors` com os 3 juntos resolveria, não foi feito por orçamento.
3. **Slots de equipe (`team_slots.png`) usam o mesmo ícone de placeholder (`icon_digimon`, uma pata genérica) para os 6 membros** — não há arte de criatura real aqui porque os Digimon do jogo são sprites oficiais (decisão do fundador, `DIGIMON_STYLE_GUIDE.md` §0), fora do escopo desta missão de UI; em produção cada slot mostraria o retrato real do Digimon capturado.
4. **Retrato do Tamer (`icon_tamer.png`) é um ícone simbólico (óculos+bandana), não um retrato de rosto** — a spec (`DIGIVICE_VI1_SPEC.md` §4.2) cita `TAMER_PORTRAIT_CROP` como "ainda null, decisão de game-art pendente" mesmo na documentação herdada; esta entrega não resolve esse pendente específico (precisaria de um recorte/retrato do sprite oficial do Tamer, não um ícone de UI).
5. **Vínculo, Poderes Tamer, Talentos (Tamer e Digimon) não têm ícone/tela própria nesta entrega** além do ícone de atalho "Vínculo" já incluído no conjunto de 16 — o conteúdo dessas abas no estado "bloqueado" (texto de aviso, sem número inventado) é responsabilidade do `game-design`/`game-dev`, não arte.
6. **"Painel de destino" do mapa-múndi** usa o ícone de região em 128px dentro de um card tier3 maior, mas o restante do layout (nome/sub-info/botão) é o mesmo padrão dos cards normais — não foi desenhado um "modo destino" com mais detalhe textual (ex. lista de espécies da região), porque isso é conteúdo de `game-design`, não arte.
7. **Ícones de região pequenos (64px) são downsamples dos grandes (128px)**, não uma 2ª geração nativa — decisão deliberada de custo (evita 2× o gasto) e de consistência (nunca divergem), mas significa que o 64px tem um pouco menos nitidez de detalhe do que uma geração nativa em 64px teria.
8. **Nenhuma integração em `game-dev`** — como pedido, o worktree ficou só leitura; os scripts Python e o `manifest.json` são o "contrato" para quem for integrar depois.
9. **Autoavaliação não revisada por game-qa** — ver §5.

---

## 7. Como usar (para quem for integrar depois)

`manifest.json` lista cada peça com tamanho e insets de 9-slice prontos para um `NineSlicePlugin`/`Phaser.GameObjects.NineSlice` (ou equivalente). `build_hud_components.py`/`build_mockups.py` são a referência de "receita" (qual inset, qual offset) em Python — útil mesmo que a integração final seja em TypeScript/Phaser, porque a geometria (onde corta, quanto estica) é a mesma.
