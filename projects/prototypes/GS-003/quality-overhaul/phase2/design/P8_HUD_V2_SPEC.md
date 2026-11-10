# P8 — HUD e painéis v2 (especificação implementável)

- **Autor:** game-design (UI-UX-DESIGNER) · **Data:** 2026-11-10
- **Base:** `UI_DIRECTION_V2.md` (direção aprovada pendente de validação), `audit/UI_WORLD_AUDIT.md` (D3), `PHASE1_REPORT.md` §7 (P8), `ART_DIRECTION_V2.md` (paleta/escala), `PROJECT_LOG.md`, `encounters/ENCOUNTER_ARCHITECTURE.md` §4 (GS-012, feedback de encontro), `docs/DRAKANTOS_VISUAL_STUDY.md`.
- **Leitura de código (read-only, worktree de outro agente, nada editado):** `workspaces/game-dev/qo/.../prototype/world/src/style.css` e `src/ui/hud.ts` em `ca8267c` (branch `quality-overhaul`) — usados só para ancorar esta spec nos valores em px já existentes, para que a mudança seja de acabamento, não de reconstrução.
- **Escopo:** HUD em jogo (vida/energia do Tamer e do parceiro, alvo, hotbar, minimapa), painel do parceiro, inventário, diálogo (novo) e feedback de encontro selvagem (GS-012). Nenhum código, arte ou asset foi gerado ou alterado. **PixelLab não foi usado nesta entrega** (0 créditos gastos).
- **Escala de referência:** `?dpr=1` (escala inteira em px físicos, nearest-neighbor, sem blur — `TECH_AUDIT.md` L5, confirmado em `PROJECT_LOG.md` 2026-11-10 01:3x). Todos os px desta spec são px CSS lógicos nessa escala, não px de tela escalados. Tile de mundo = 32 px (não muda; a HUD é overlay de tela, desacoplada do grid de mundo).

---

## 0. Princípios herdados (não reabertos aqui)

1. **Mesma organização espacial, outro peso visual** — `UI_DIRECTION_V2.md` §5: esta spec não move blocos de posição, só redesenha a casca. Onde esta spec adiciona um bloco novo (Tamer na barra inferior, diálogo), é porque o próprio P8 pede dados que hoje não existem na HUD (vida/energia do Tamer).
2. **3 níveis de moldura por importância** (`UI_DIRECTION_V2.md` §2) — formalizados em px na seção 2.
3. **Paleta ligada a `ART_DIRECTION_V2.md`**: Endesga-32 como base; criaturas/UI/Tamer ficam **fora** do grade de cor do cenário (`ART_DIRECTION_V2.md` §2, regra do `look.ts` "Criaturas, UI, NPCs... ficam fora"). As cores de elemento/raridade abaixo (seção 1.3) reaproveitam tokens **já existentes** no CSS atual (`chip.e-*`, `.aff-*`, `--ui-gold/green/cyan/red`) — não são uma paleta nova, são a mesma paleta, promovida de "etiqueta de texto" para "cor de moldura" nos locais citados pelo `UI_WORLD_AUDIT.md` §2.2/§2.3.
4. **Nunca mais que 2 famílias tipográficas na tela** (`UI_DIRECTION_V2.md` §1) — título pixel + corpo pixel-ui.
5. **Texto flutuante sobre o mundo sempre com fundo semi-opaco**, nunca só contorno — corrige o achado do `UI_WORLD_AUDIT.md` §1 ("nomes/PV ilegíveis sobre areia clara") e do `phase3/qa/QA_PHASE3.md` ("contraste dia/noite fraco"). Regra aplicada a toda placa/nameplate desta spec (seções 4, 6, 7).

---

## 1. Fundamentos

### 1.1 Grid

- **Unidade base da HUD: 4 px.** Toda margem, padding e gap desta spec é múltiplo de 4 (herdado do que o CSS atual já faz em ~80% dos casos — ex. `gap: 4px/6px/8px`; esta spec fecha os 20% que fogem, como `padding: 3px 9px 3px 6px` do `.pill` atual).
- **Grid de mundo:** 32 px/tile, inalterado (não é tocado por esta spec — a HUD é camada de tela fixa, `position: fixed`, como já é hoje).
- **Breakpoint único de referência:** 1920×1080 lógicos a `?dpr=1`. Elementos com `min()`/`vw` do CSS atual (ex. `.hud-log { width: min(300px, 40vw) }`) são mantidos — esta spec não resolve responsividade, só acabamento.

### 1.2 Tipografia

| Uso | Fonte | Tamanho nativo | Peso | Observação |
|---|---|---|---|---|
| Títulos de painel (`EQUIPE & BOX`, `DIGIVICE`, `MAPA-MÚNDI`, `INVENTÁRIO`) | Pixel bitmap própria (a produzir via `create_font`, **fora desta entrega** — zero créditos aqui) | 16 px nativo, sem anti-aliasing | Regular | `font-size: 16px` exato (múltiplo do glyph nativo); `text-rendering: optimizeSpeed`; letter-spacing `0.05em`; caixa alta. |
| Nome do selvagem/alvo, nameplates flutuantes no mundo | Mesma pixel bitmap | 10 px nativo (ou 16 px com `transform: scale(0.625)` só se o glyph de 10 não existir ainda — ver Limitações) | Regular | Sempre sobre pill de fundo (princípio 0.5). |
| Corpo/números (PV, dano, descrições, listas) | Pixel-UI 12 px (até a fonte existir, mantém a família atual do CSS, mas **travada em 12px** em vez da mistura 9.5–14px hoje espalhada pelo arquivo) | 12 px | Regular/Bold conforme ênfase | Nunca menor que 10px (hoje há `.card small { font-size: 9.5px }`, `.rules li` em 11px — esta spec eleva o piso para 10px, único valor abaixo de 12 permitido, para legendas secundárias). |
| Destaque numérico (nível, dano crítico) | Pixel-UI 14 px Bold | 14 px | Bold | Igual ao `.hud-name` atual (`font-size: 14px`), generalizado. |

**Regra de 2 famílias:** pixel-bitmap (títulos + nameplates) + pixel-UI (todo o resto). Até a pixel-bitmap existir, os dois papéis convivem na família de sistema atual (Ubuntu/DejaVu) só como **placeholder visual**, sem contar como 3ª família — a troca de fonte em si (produção da bitmap) é tarefa separada (`create_font`), fora deste P8.

### 1.3 Paleta funcional (reaproveitada, não nova)

**Elemento/atributo** (já existe em `chip.e-*`/`.aff-*`, promovido a cor de borda):

| Elemento | Cor | Token CSS atual |
|---|---|---|
| Fogo | `#feae34` | `.chip.e-fire` |
| Água | `#9ee8ff` | `.chip.e-water` |
| Vento/Planta | `#c9f7d0` | `.chip.e-wind` |
| Gelo | `#a8f0ff` | `.chip.e-ice` |
| Luz | `#fff3a8` | `.chip.e-light` |
| Trovão | `#c8e3ff` | `.chip.e-thunder` |
| Trevas | `#f2c9ff` | `.chip.e-dark` |
| Vacina (atributo) | `#4fa8ff` (acento sobre fundo `#124e89`) | `.aff-vaccine` |
| Dados (atributo) | `#8fe07a` (acento sobre fundo `#3e8948`) | `.aff-data` |
| Vírus (atributo) | `#c77ad1` (acento sobre fundo `#68386c`) | `.aff-virus` |
| Livre (atributo) | `#b8c2d8` (acento sobre fundo `#5a6988`) | `.aff-free` |

**Raridade** (nova aplicação de tokens já existentes — hoje só usados em estrelas/XP):

| Raridade | Cor de borda | Token |
|---|---|---|
| Comum | `#8b93b0` | `--ui-dim` |
| Incomum | `#63c74d` | `--ui-green` |
| Raro | `#2ce8f5` | `--ui-cyan` |
| Muito raro | `#e8b84a` + cintilação (ver 4.4) | `--ui-gold` |

**Categoria de golpe** (já existe em `.chip.k-*`, promovido a cor de borda de slot):

| Categoria | Cor de fundo | Token |
|---|---|---|
| Físico | `#4a2f2a` | `.chip.k-physical` |
| Especial | `#2a3550` | `.chip.k-special` |
| Buff | `#4a3f1f` | `.chip.k-buff` |
| Debuff | `#3e2153` | `.chip.k-debuff` |
| Cura | `#1f4a2f` | `.chip.k-heal` |

**Categoria de item** (nova, 4 cores — `UI_DIRECTION_V2.md` §3 pede, não havia token ainda):

| Categoria | Cor de fundo do ícone |
|---|---|
| Cura | `#1f4a2f` (mesmo de `k-heal`, reaproveitado) |
| Captura | `#124e89` (mesmo de `aff-vaccine`) |
| Evolução | `#68386c` (mesmo de `aff-virus`) |
| Cosmético | `#5a3a1f` (novo, dourado-terroso — não conflita com `--ui-gold` de seleção/raridade) |

---

## 2. Sistema de moldura (3 níveis, em px)

| Nível | Uso | Borda | Canto | Fundo | Radius/forma |
|---|---|---|---|---|---|
| **1 — Crítico de combate** | PV/Energia do Tamer, PV/MP do parceiro, PV do alvo, hotbar de golpes, log de dano | 3 px sólida, cor reage ao estado (ver 2.1) | Ornamento "garra" 6×6px cravado nos 4 cantos (ver 2.2) | `rgba(14,16,24,0.78)` (mais opaco que hoje, para legibilidade dia/noite) | `clip-path` com corte de 4px nos 4 cantos (sem `border-radius` — pixel-perfeito), **não** o `border-radius:6px` genérico atual |
| **2 — Navegação/sistema** | Modais (Equipe&Box, Digivice, Inventário, Mapa-múndi), minimapa, menu de atalhos | 2 px sólida `#3b4261` (mantido, é o token atual) | Chanfro de 4px nos 4 cantos (`clip-path: polygon(...)`, mesma técnica do `.auto-btn` já existente, generalizada) | `rgba(20,23,34,0.92)` (mantido) | Chanfrado, substitui `border-radius:6px` |
| **3 — Informativo/passivo** | Aviso legal, placeholders de feature (Passe de Temporada etc.) | 1 px `#2b3047` (mais fino que hoje) | Nenhum (reto) | `rgba(14,16,28,0.55)` (mais transparente) | `border-radius: 4px` (único nível que mantém radius — é deliberadamente "mole", para recuar visualmente) |

### 2.1 Cor de borda reativa (Nível 1, PV)

```
PV ≥ 50%: borda --ui-green (#63c74d)
PV 20–49%: borda --ui-gold (#e8b84a)
PV < 20%: borda --ui-red (#e43b44), + pulso de opacidade 0.6↔1.0 a cada 600ms
```
Aplica-se à moldura inteira do bloco (Tamer, parceiro, alvo), não só à barra interna — resolve o achado do `UI_DIRECTION_V2.md` §2.1 ("cor de borda que reage ao estado, não só a barra interna").

### 2.2 Ornamento "garra" (Nível 1)

Peça de 6×6 px, 1-bit (2 cores: contorno escuro `#0b0d13` + preenchimento na cor da borda ativa), repetida nos 4 cantos via `background-image` ou pseudo-elemento absoluto. Não é 9-slice de imagem única — é 1 sprite de canto (6×6) + borda sólida CSS entre os cantos. Produção: `pixelart_workbench` (gratuito), fora desta entrega (ver Prioridades, P1).

### 2.3 9-slice (Nível 2, quando a moldura vier de imagem, não de CSS puro)

Para os modais que migrarem para arte de moldura ilustrada (ex. "placa digital" do `UI_DIRECTION_V2.md` §2.2), a folha de 9-slice segue:

- Canvas fonte: 48×48 px (3 colunas × 3 linhas de 16 px cada).
- Insets: `{ left: 16, right: 16, top: 16, bottom: 16 }` (cantos fixos 16×16, bordas repetem 16px de espessura, miolo estica).
- Isso é o mesmo formato que `update_ui_asset(nine_slice=...)` do PixelLab já aceita — quando a arte for produzida (P1/P2), o ativo entra direto sem reespecificação.

---

## 3. Estados (hover / seleção / pressed / disabled) — valores exatos

| Estado | Regra visual | Timing |
|---|---|---|
| **Hover** | Brilho na borda: a cor de borda recebe `filter: brightness(1.25)` (não troca de cor, só brilha). Cursor `pointer` (já existe). | Transição `0.1s ease-out` (mais rápido que o `0.12s` atual do `.card:hover`, imperceptível a diferença, mas padroniza) |
| **Seleção/ativo** | Borda dourada `--ui-gold`, espessura **+1px** sobre o nível base (nível 2: 2→3px; nível 1 combat já é 3px, vira 4px), escala `transform: scale(1.02)` | Transição `0.12s ease-out` (igual ao `.card` atual, generalizado para todo elemento selecionável — hoje só cards de Digimon/golpe têm isso; esta spec estende a atalhos, abas, slots de item) |
| **Bloqueado/desabilitado** | `filter: grayscale(0.4) brightness(0.85)` (dessaturação 40%, não 100% — mantém alguma leitura de cor) + ícone de cadeado 10×10px no canto superior-direito do elemento, fundo `rgba(10,12,18,0.85)` atrás do cadeado para contraste | Sem transição (estado estático) |
| **Confirmação (clique registrado)** | Flash na própria borda: `box-shadow: 0 0 0 2px #fff` por 1 frame, depois decai para a cor normal | `150ms` decaindo linear (dentro da faixa 150–200ms pedida pelo `UI_DIRECTION_V2.md` §4) — aplicado antes de qualquer modal fechar ou transição iniciar |

---

## 4. HUD em jogo (overlay sempre visível)

Mantém a disposição espacial atual (`UI_DIRECTION_V2.md` §5): barra inferior (96px, inalterada) + topo. Mudança de conteúdo real: **hoje não existe barra de vida/energia do Tamer separada da do parceiro** — o P8 pede explicitamente, então este é o único bloco novo de posição (inserido na barra inferior, à esquerda do bloco do parceiro).

### 4.1 Barra inferior — novo layout (altura 96px, inalterada)

```
┌──────┬────┬──────────┬────────────┬──────────────────────┬───────────────┐
│ mini-│inv │  menu    │   TAMER    │       PARCEIRO        │     EQUIPE    │
│ mapa │ 82 │ 2×46×2  │  120×88    │        260×88         │  5× 62×88     │
│ 112ø │    │  (atalhos)│ (NOVO)     │     (existente)       │  (existente)  │
└──────┴────┴──────────┴────────────┴──────────────────────┴───────────────┘
```

- **Minimapa:** footprint mantido (~132×80px do `.mm` atual), **máscara circular interna de 96px de diâmetro** (em vez do canvas quadrado 128×80 atual), anel de moldura 4px nível-2 chanfrado, marcador "N" no topo (8px, pixel-bitmap), seta do jogador 8×8px centrada. Referência: minimapa circular do Drakantos (`DRAKANTOS_VISUAL_STUDY.md`, "minimapa circular no canto"), sem copiar o desenho — só o princípio de moldura redonda em vez de caixa quadrada genérica.
- **Inventário (atalho):** mantido 82px, sem mudança de posição — só a moldura (nível 2) e o ícone de bolsa (já existe, `.hud-menu .bag`).
- **Menu de atalhos (12 ícones, 2 linhas×6):** mantido 6×34px por célula — moldura nível 2 chanfrada em vez do `border-radius:5px` atual; ícones ganham fundo colorido por categoria quando aplicável (seção 1.3, "categoria de item").
- **Bloco TAMER (NOVO, 120×88px):**
  - Retrato mini 48×48px (recorte do sprite do Tamer, direção sul, mesma técnica do `.pt` atual).
  - Nome + nível: `Nome Lv.N`, pixel-UI 12px Bold, cor `--ui-text`.
  - Barra de **Vida (PV)**: largura 68px, altura 7px, moldura nível-1 fina (1px interna, a barra em si não é um bloco nível-1 completo, é um elemento dentro de um bloco nível-1), preenchimento gradiente verde→vermelho conforme 2.1.
  - Barra de **Energia**: largura 68px, altura 5px, abaixo da barra de PV, gap 2px, preenchimento gradiente azul `#9ad4ff → #3a78c4` (mesmo token de MP já usado em `.mpbar i`). **[H] significado funcional da Energia do Tamer ainda não existe na sim** (não há stamina/sprint no motor hoje — `TECH_AUDIT.md` não cita) — esta spec reserva o espaço visual e o estado "cheio/vazio" que o GS-010/P8 pediu; a regra de consumo fica para game-dev definir (ver Prioridades, P2).
  - Moldura do bloco: nível 1, reage por PV (2.1).
- **Bloco PARCEIRO (260×88px, existente, `.hud-partner`):**
  - Mantém retrato 64×64px, nome 14px, barras de PV (7px)/MP (segmentada, já existe `.hud-bar.seg`)/XP (7px).
  - **Mudança:** moldura muda de nível-3-genérica (`.panel` atual) para **nível 1**, com borda reativa por PV (2.1) e anel de 3px na cor do **elemento/atributo** do parceiro (seção 1.3) contornando o retrato — resolve o achado do `UI_WORLD_AUDIT.md` §2.2 ("texto preto-sobre-cinza, sem cor por elemento") diretamente na HUD, não só no modal.
- **Equipe (5×62×88px, existente, `.hud-team`):**
  - Mantém dimensão do `.slot` atual (62px largura).
  - **Mudança:** borda do slot (hoje `2px #2f3550` fixo) passa a usar a cor do elemento do Digimon daquele slot (seção 1.3), espessura 2px; slot ativo mantém borda dourada +escala (estado "seleção", seção 3) sobreposta — quando ativo **e** com elemento, a borda é dourada (seleção tem prioridade sobre elemento, para não confundir qual é o ativo).

### 4.2 Topo (inalterado em posição, moldura atualizada)

- Aviso legal: nível 3, comportamento de colapso após ~4s mantido do `UI_DIRECTION_V2.md` §2 (não há mudança nova aqui além da moldura nível-3).
- Pills de região/rota, moeda, eventos: nível 3 (informativo) exceto quando o evento for de recompensa real (gold), que sobe para nível 2.
- Botão AUTO: mantém o recorte em bisel (`clip-path` já existente no `.auto-btn`), mas a borda passa a ser nível 1 (3px) quando AUTO está ligado **e** em combate — reflete que é controle crítico de combate nesse momento, nível 2 (2px) fora de combate.
- Passe de Temporada/Fonte dos Desejos/Chefe Mundial/Guilda: nível 3, ícones 20px sem caixa de texto própria (conforme `UI_DIRECTION_V2.md` §5, "peso leve e recolhido").

### 4.3 Alvo (combate) — dois elementos, não um só

1. **Placa flutuante sobre o selvagem** (no mundo, não fixa na tela): nome + Nv., moldura nível-1 fina (altura 20px, largura mínima 64px, padding 4px), fundo `rgba(10,12,18,0.72)` (regra 0.5, sempre sobre pill), borda 2px na cor de **raridade** (seção 1.3) — é o mesmo elemento especificado em detalhe na seção 6 (GS-012), reaproveitado aqui como "alvo" em combate contínuo (a placa passa a mostrar PV em barra de 4px abaixo do nome quando o combate começa, substituindo o "Nv." por "PV: barra").
2. **Anel de alvo no solo**: anel pontilhado 32px de diâmetro, 2px de espessura, cor `--ui-red` a 70% de opacidade, sob os pés do selvagem travado pela parceira — referência de princípio ao "anel vermelho de alvo" do Drakantos (`DRAKANTOS_VISUAL_STUDY.md`), desenho próprio, não copiado.

### 4.4 Hotbar de golpes (mantida, moldura atualizada)

- Dimensão mantida: 4 slots de 52×52px, gap 6px (`.hud-moves`/`.mv` atuais).
- **Mudança:** moldura do slot passa de `2px #4a5175` fixo para **nível 1**, borda colorida pela **categoria do golpe** (seção 1.3, `k-*`) em vez de neutra — hoje a cor de categoria só aparece como chip de texto pequeno dentro do modal de Golpes, nunca na hotbar em jogo.
- Recarga radial (`conic-gradient`) e MP (`.mpbar`) mantidos sem alteração — já funcionam bem, não é "dashboard admin" nesse componente.

---

## 5. Painel do parceiro (ficha detalhada — modal, aba "Digimon" do Equipe & Box)

Escopo: a ficha (`.sheet`, `UI_WORLD_AUDIT.md` §2.2) que abre ao selecionar um Digimon — é o "painel de parceiro" citado no P8, distinto do dock sempre-visível (seção 4.1).

- **Moldura externa do modal:** nível 2, chanfrada, 820px de largura mantida (`.modal` atual), título em pixel-bitmap 16px.
- **Retrato grande (`.pt.big`, 72×72px mantido):** ganha **anel de 3px na cor do elemento/atributo** (seção 1.3) — resolve diretamente o achado do `UI_WORLD_AUDIT.md` §2.2 ("borda radial por elemento, não cinza plano").
- **Nome + Nv. (`.sheet h3`):** mantido 14px, sem mudança de tamanho; ganha badge de **estágio** (Bebê/Rookie/Champion/Ultimate/Mega) como pill 10px à direita do nível, cor neutra (nível 3 — informativo, não compete com o nome).
- **Barras de stats (`.stats`, 5px altura mantida):** preenchimento passa de gradiente verde fixo (`#3e8948→#8fe07a`) para gradiente **na cor do elemento** do Digimon (seção 1.3) — hoje todas as stats de todos os Digimon usam o mesmo verde, independente do elemento.
- **Lista de golpes (`.moves`):** cada `<li>` ganha barra lateral esquerda de 3px na cor de categoria (`k-*`), substituindo o fundo neutro `#1a1e2c` uniforme atual.
- **Cards de equipe/box (`.card`, 76×86px mínimo mantido):** borda passa de `2px #2f3550` fixo para cor do elemento (seção 1.3), mantendo o estado `.sel` dourado por cima quando selecionado (regra de prioridade igual à seção 4.1, equipe).

---

## 6. Inventário

Escopo: modal de itens (`screens.ts`, `UI_WORLD_AUDIT.md` §2.3).

- **Moldura externa:** nível 2, igual aos demais modais.
- **Cartão de item (equivalente ao `.card` do Equipe&Box, reaproveitar a mesma classe-base, 76×86px):**
  - Borda 2px na cor de **categoria de item** (seção 1.3: Cura/Captura/Evolução/Cosmético) — hoje todos os cartões são idênticos em cinza (`UI_WORLD_AUDIT.md` §2.3).
  - Ícone com fundo colorido por categoria (não só o glifo de linha atual, `src/ui/icons.ts`) — ocupa 24×24px dentro do cartão de 76px, centrado no terço superior.
  - Quantidade (`×N`) mantida no canto inferior-direito, 10px.
- **Raridade:** cartão ganha **segunda borda interna** de 1px na cor de raridade (seção 1.3), 2px para dentro da borda de categoria — resolve o gap citado no `UI_WORLD_AUDIT.md` §2.3 ("não há raridade visualmente identificável, só texto").
- **Painel de detalhe ao selecionar (NOVO — gap confirmado no audit, "GS-010 §D pede, não existe"):** coluna direita de 220px (menor que os 270px do Equipe&Box, porque o conteúdo é mais simples: nome, categoria, raridade, descrição completa, quantidade, "Usar"/"Equipar" quando aplicável). Nível 2, aparece ao clicar um cartão (estado "seleção" aplicado ao cartão clicado, seção 3).
- **Remoção de frase de debug:** a nota "não existe moeda premium..." citada no audit (`UI_WORLD_AUDIT.md` §2.3) **não tem lugar nesta spec visual** — é correção de conteúdo, não de casca; registrar como achado repassado ao game-dev/texto, fora do escopo de design visual do P8.

---

## 7. Diálogo (NOVO — não existe hoje no jogo)

Não há sistema de diálogo implementado (`UI_WORLD_AUDIT.md` não cita um, e o `ENCOUNTER_ARCHITECTURE.md` não usa diálogo para encontros aleatórios). Esta seção especifica a casca visual **para quando o sistema existir** (NPC do riacho, `interact-fonte-cura`/mercador do `P7_CLAREIRA_BRIEF.md`) — é especificação visual adiantada, não implica que o P8 crie o sistema de diálogo em si (isso é game-dev).

- **Posição:** fixo, `bottom: calc(96px + 16px)` (acima da barra inferior, mesmo princípio de "nunca cobrir a barra inferior" do resto da HUD), centralizado horizontalmente.
- **Dimensão:** 760×140px.
- **Moldura:** nível 2, chanfrada.
- **Retrato do NPC:** 96×96px, ancorado no canto superior-esquerdo da caixa, **sobressaindo 24px para fora do topo da caixa** (efeito "avatar que ultrapassa a moldura", referência de princípio ao avatar em losango do Drakantos, `UI_WORLD_AUDIT.md` §1 — desenho próprio, não losango, retrato retangular com moldura chanfrada igual ao resto do sistema, para manter consistência com o Nível 2 desta spec em vez de introduzir uma 4ª forma de moldura).
- **Faixa de nome (nameplate):** sobre o retrato, largura igual ao retrato (96px) + 8px de margem, altura 20px, fundo `--ui-gold` a 15% de opacidade sobre nível-1 escuro, texto pixel-bitmap 12px (reduzido do título 16px, por ser inline) em `--ui-gold`.
- **Área de texto:** à direita do retrato, 640px de largura, padding 16px, pixel-UI 13px, `line-height: 1.4`.
- **Indicador de avanço:** chevron pixel 12×12px, inferior-direito da caixa, pisca (`opacity 0.4↔1.0`, 700ms) enquanto há mais texto.
- **Botões de escolha (quando houver):** linhas de largura total menos padding (728px), altura 36px cada, moldura nível 2, empilhadas com gap 4px, substituem a área de texto quando a fala pede escolha.

---

## 8. Feedback de encontro selvagem (GS-012) — leitura, rótulo, grama alta

Esta seção **formaliza em px/cor/timing** o que `encounters/ENCOUNTER_ARCHITECTURE.md` §4 já desenhou em prosa (tempos em ms, comportamento) e o que `phase2/design/P7_CLAREIRA_BRIEF.md` §4 já desenhou em posição (as 2 zonas de grama alta da Clareira). Nenhum valor de timing/engine é alterado — só os parâmetros visuais que faltavam (tamanho de sprite, cor exata, moldura) para o game-art/game-dev implementarem sem decisão própria.

### 8.1 Entrada em combate legível (sequência completa)

| t (ms) | Elemento visual | Tamanho/cor | Moldura/estado |
|---|---|---|---|
| 0 | Farfalhar da touceira (3 quadros) | Sprite nativo já existente (`fp4_tall_grass_a/b`); inclinação ±2px por quadro, 90ms/quadro | — (é animação de prop, não UI) |
| 0–350 | Ícone **"!"** sobre o Tamer | 12×16px, 1-bit (branco + contorno 1px `#0b0d13`), **sobre pill de fundo** `rgba(10,12,18,0.72)` 18×22px (regra 0.5) | Nível 1 (é alerta de combate) |
| 350–700 | Salto do selvagem | Sem UI nova — é animação de entidade (arco 10–14px, já especificado no `ENCOUNTER_ARCHITECTURE.md` §4) | — |
| 700–1000 | **Placa de identificação** acima do selvagem | Altura 20px, largura mínima 64px (cresce com o nome), pixel-bitmap 10px, fundo `rgba(10,12,18,0.72)` | Nível 1 fino, **borda 2px na cor de raridade** (seção 1.3) — mesma peça especificada na seção 4.3.1 |
| 700–1000 (1ª vez da espécie) | Selo **"NOVO"** | 28×14px, canto superior-direito da placa, fundo `--ui-gold`, texto `#171a26` Bold 9px | — |
| 1000–1200 | Transição da placa → barra de PV padrão | A mesma peça de 700–1000 ganha uma 2ª linha: barra de PV 4px de altura, largura igual à placa, preenchimento por 2.1 | Mantém borda de raridade |

- **Farfalhar vazio (12% dos testes):** só o farfalhar, sem "!" e sem placa — nenhuma peça de UI nova nesse caso, confirma o design do `ENCOUNTER_ARCHITECTURE.md` §4 sem adição.
- **Muito raro:** antes do salto, brilho dourado 2 quadros subindo da grama — **sem UI fixa**, é VFX de mundo (`vfx_workbench`, fora do escopo de HUD/painel desta entrega).

### 8.2 Rótulo dos selvagens (fora de combate, pontos visíveis do GS-012)

Para os 5 pontos visíveis (`ENCOUNTER_ARCHITECTURE.md` §2.5/§5: Dorumon agressivo, Gotsumon parado, Tentomon que foge, 2 Palmon passivos, Patamon noturno) a mesma placa da seção 8.1 fica **sempre visível** (não só ao engajar), em modo "passivo": só nome + Nv., sem barra de PV até o combate começar, opacidade reduzida a 85% quando o Tamer está a mais de 4 tiles de distância (evita poluir a tela a distância, resolve o "ruído" que o `UI_WORLD_AUDIT.md` critica em outros contextos).

### 8.3 Grama alta — distinção visual (resolve achado do `phase3/qa/QA_PHASE3.md`: "grama alta indistinta")

A QA da Fase 3 já apontou que a grama alta não se distingue da grama comum. Esta spec fixa a regra visual (produção fica com game-art, não é arte nova desta entrega):

- **Altura do sprite:** touceira de grama alta (`fp4_tall_grass_a/b`) deve medir **40–60% mais alto** que o tufo decorativo comum (`fp8_tuft_over_path_a/b`) no mesmo recorte — hoje ambos aparentam altura similar.
- **Saturação:** grama alta recebe +10% de saturação sobre a grama comum (contraria a regra geral de dessaturação do `ART_DIRECTION_V2.md` §2 **deliberadamente**, porque é a única informação de gameplay no chão — o jogador precisa diferenciar "aqui pode nascer um Digimon" de "aqui é só decoração").
- **Amplitude de vento:** `look.sway` (já existe) aplicado à grama alta com amplitude **2×** a da grama comum — reforça a leitura por movimento, não só por forma estática.
- **Densidade nas bordas das zonas GS-012:** conforme já pedido pelo `P7_CLAREIRA_BRIEF.md` §4, densidade decrescente nas bordas do retângulo de `areas[]`, para a zona "ler" como orgânica mesmo com hitbox reto.

---

## 9. Prioridades (P0/P1/P2)

| Prioridade | Itens | Critério de corte |
|---|---|---|
| **P0 — bloqueante para a demo do piloto** | (a) Moldura Nível 1 reativa por PV nos blocos Tamer/parceiro/alvo (seção 2.1, 4.1, 4.3); (b) Bloco Tamer novo na barra inferior com PV+Energia (seção 4.1); (c) Hotbar com borda por categoria de golpe (seção 4.4); (d) Placa de alvo com borda por raridade + "!" + timing da seção 8.1; (e) Grama alta distinguível (seção 8.3) | Sem isso, o P9 (encontros na clareira) não tem feedback legível — é o próprio objetivo do GS-012 citado no P8 |
| **P1 — melhora substancial, não bloqueia a demo** | (a) Minimapa circular (4.1); (b) Anel de alvo no solo (4.3.2); (c) Painel do parceiro com anel de elemento (seção 5); (d) Inventário com borda de categoria+raridade e painel de detalhe (seção 6); (e) Ornamento "garra" de canto (2.2); (f) Rótulo passivo dos 5 pontos visíveis (8.2) | Melhora a percepção "não é dashboard admin", mas o jogo é demonstrável sem isso |
| **P2 — polimento, pode esperar a Fase 3/4** | (a) Diálogo completo (seção 7, sistema ainda não existe no motor); (b) Fonte pixel-bitmap real (`create_font`); (c) Significado funcional da Energia do Tamer (hoje só visual); (d) 9-slice ilustrado para os modais (2.3); (e) Confirmação com flash de clique (3, "Confirmação") em todos os botões; (f) Selo "NOVO" com cintilação de muito raro (4 sparkle keyframes) | Depende de produção de arte nova (fora do orçamento PixelLab atual, `PROJECT_LOG.md`: saldo ~2,8 gerações) ou de sistema que não existe ainda (diálogo) |

---

## 10. Critérios de aceite mensuráveis (para game-qa)

### 10.1 Legibilidade geral

- [ ] Todo texto flutuante sobre o mundo (nameplate, "!", NOVO, placa de alvo) tem fundo com opacidade ≥ 0,70 — testar sobre **3 fundos**: grama escura (floresta, dia), grama clara/areia (se aplicável no piloto), e noite — contraste mínimo 4,5:1 (texto vs. fundo da pill, não vs. o cenário) nas 3 condições.
- [ ] Nenhum elemento de Nível 1 (combate) usa `border-radius` — só `clip-path` com cantos cortados/chanfrados (verificação via inspeção do CSS computado).
- [ ] No máximo 2 famílias tipográficas simultâneas em qualquer captura de tela (contagem manual em 3 telas: HUD em combate, modal de Equipe, diálogo).

### 10.2 Barras de vida/energia (Tamer + parceiro)

- [ ] Bloco Tamer visível na barra inferior com 2 barras (PV 7px altura, Energia 5px altura) sempre que o jogo está em uma sessão ativa (não só no criador).
- [ ] Cor de borda do bloco muda nos 3 limiares exatos: ≥50% verde, 20–49% dourado, <20% vermelho pulsante — testar forçando dano até cruzar cada limiar.
- [ ] Anel de 3px ao redor do retrato do parceiro na cor do elemento correto (verificar contra `src/data/world-species.json` para ao menos 3 elementos diferentes: Fogo, Água, Dados).

### 10.3 Alvo e hotbar

- [ ] Placa de alvo aparece em ≤100ms após `encounter_roll` (dentro da janela 700–1000ms já especificada pelo `ENCOUNTER_ARCHITECTURE.md`, não deve atrasar o próprio evento).
- [ ] Cor da borda da placa corresponde à raridade real da entrada sorteada (testar com `?encdebug=1`, forçando ao menos 1 encontro de cada raridade: comum, incomum, raro, muito raro).
- [ ] As 4 bordas de slot da hotbar mudam de cor quando um golpe de categoria diferente é equipado em cada slot (testar com 4 golpes de categorias distintas, se existirem no roster do piloto; senão, no mínimo físico vs. especial).

### 10.4 Grama alta e encontros

- [ ] Altura do sprite de grama alta mensuravelmente maior (≥40%, por contagem de pixels na captura) que o tufo decorativo comum, nas 2 zonas do `P7_CLAREIRA_BRIEF.md` (`clareira-noroeste-grama`, `clareira-corredor-grama`).
- [ ] Amplitude de vento visivelmente maior na grama alta vs. grama comum em vídeo de pelo menos 3s (comparação de frames, não captura estática).
- [ ] 0 encontros com placa sem borda de raridade (toda entrada da tabela tem raridade definida — conferir contra `encounters/tables/digimon-forest-01.json`).

### 10.5 Inventário e painel de parceiro

- [ ] Todo cartão de item no inventário tem 2 bordas visíveis e distintas (categoria + raridade) quando o item tem ambos os atributos definidos.
- [ ] Clicar um cartão de item abre o painel de detalhe de 220px em ≤200ms, sem fechar o modal.
- [ ] Toda barra de stat na ficha do parceiro usa a cor do elemento do Digimon, não o verde fixo atual (testar com 2 Digimon de elementos diferentes).

---

## 11. Mockups

`phase2/design/p8_mockups/`:

| Arquivo | Conteúdo |
|---|---|
| `hud_overview.svg` | Barra inferior completa (minimapa, inventário, menu, Tamer, parceiro, equipe) em escala 1:1 px, com grid de 4px marcado e rótulos de dimensão. |
| `hotbar_target.svg` | Hotbar de golpes (4 slots, bordas por categoria) + placa de alvo com anel no solo, em escala 1:1. |
| `partner_panel.svg` | Ficha do parceiro (retrato com anel de elemento, stats coloridas, lista de golpes com barra de categoria). |
| `inventory_panel.svg` | Grade de inventário (3 cartões: Cura comum, Captura raro, Evolução muito raro) + painel de detalhe lateral. |
| `dialogue_box.svg` | Caixa de diálogo completa (retrato, nameplate, texto, chevron, botões de escolha). |
| `encounter_feedback_timeline.svg` | Sequência de 4 quadros (farfalhar → "!" → salto → placa com NOVO) lado a lado com marcação de tempo em ms. |

São wireframes vetoriais de grid/dimensão, não arte final — a arte real (texturas, ilustrações de moldura, ícones) é produção de game-art (P1/P2 da seção 9), a ser feita com o orçamento de PixelLab que o fundador autorizar.

---

## 12. Limitações

- **Nenhuma arte foi produzida.** Esta spec define px/cor/estado/timing para implementação; os ativos visuais em si (ornamento de canto, ícones de categoria coloridos, fonte pixel-bitmap, retrato de NPC) ainda não existem e exigem produção (game-art, com ou sem PixelLab conforme orçamento).
- **"Energia do Tamer"** não tem significado funcional confirmado na simulação hoje (`TECH_AUDIT.md` não cita stamina/sprint) — esta spec reserva o espaço visual por pedido explícito do P8, mas o comportamento de consumo/recarga é decisão de game-dev, não desta entrega.
- **Diálogo (seção 7)** é especificação adiantada para um sistema que não existe no motor — não deve ser lido como "o P8 implementa diálogo", é casca visual pronta para quando o sistema for construído (ex. ao redor do NPC mercador citado no `P7_CLAREIRA_BRIEF.md`).
- **Minimapa circular (4.1)** muda a forma de render do canvas interno (de quadrado para máscara circular) — é mudança pequena de código, mas não documentada no `TECH_AUDIT.md`; precisa confirmação de esforço com game-dev antes de entrar em P1.
- **Cores de elemento/raridade/categoria** (seção 1.3) foram verificadas contra os tokens já existentes no CSS atual (`style.css`, lido em `ca8267c`), não contra `docs/ART_STYLE_GUIDE.md`/Endesga-32 pixel a pixel — a ressalva já registrada em `UI_DIRECTION_V2.md` ("precisa checagem cruzada com game-art antes da Fase 3") continua válida; esta spec só confirma que os tokens do CSS **não contradizem** a regra geral do `ART_DIRECTION_V2.md` §2 (criaturas/UI fora do grade de cor do cenário).
- **Critérios de aceite (seção 10)** assumem que P0 dos itens de P9 (encontros) e P5/P6 (Tamer/Digimon refeitos) estarão implementados o suficiente para teste — vários itens (ex. "2 Digimon de elementos diferentes") dependem do roster do piloto estar com arte funcional, não só placeholder.
- Esta entrega não rodou o jogo real (worktree de outro agente, regra de não tocar) — todos os px referenciados foram conferidos por leitura de `style.css`/`hud.ts`, não por captura de tela ao vivo.
