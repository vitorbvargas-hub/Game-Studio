# UI v2 — proposta de direção visual (não implementado)

- **Autor:** game-design (UI-UX-DESIGNER) · **Data:** 2026-11-09
- **Base:** `quality-overhaul/audit/UI_WORLD_AUDIT.md` (D3), GS-010 §5.
- **Status:** proposta para aprovação do GAME-ART-DIRECTOR e do fundador. Nada aqui foi implementado. Preserva 100% das funcionalidades, rotas e dados existentes — é só a casca visual.

---

## 1. Tipografia

- **Problema atual:** `font: 13px/1.3 Ubuntu, "DejaVu Sans", system-ui` (`style.css`) — fonte de sistema idêntica a qualquer app web, sem relação com pixel art ou com Digimon.
- **Proposta:**
  - **Títulos de painel** ("EQUIPE & BOX", "MAPA-MÚNDI", "DIGIVICE"): fonte pixel bitmap própria, tamanho fixo (ex. 16px nativo, sem anti-aliasing, `image-rendering: pixelated` como o resto do jogo). Gerar com `pixellab.create_font` quando entrarmos na Fase 3 (laboratório visual) — esta auditoria não gera asset.
  - **Corpo/números** (PV, dano, nomes de Digimon): pode continuar com uma sans-serif legível em tamanho pequeno (13–14px), mas trocar Ubuntu por uma fonte com métrica mais "redonda/amigável" (ex. uma pixel-UI de 8–12px) para não misturar 2 famílias tipográficas tão diferentes quanto bitmap-título + Ubuntu-corpo.
  - Regra: **nunca mais que 2 famílias** na tela ao mesmo tempo (título pixel + corpo pixel-ui menor), contra a mistura atual de só 1 família genérica usada para tudo sem variação de peso.

## 2. Molduras

- **Problema atual:** uma única classe `.panel` (fundo `rgba(20,23,34,.92)`, borda 2px sólida `#3b4261`, `border-radius:6px`) aplicada a 7+ tipos de elemento diferentes (`.panel, .pill, .event, .coins, .hud-log, .chat-head, .hud-tamerxp`) — zero diferenciação.
- **Proposta — 3 níveis de moldura, por importância:**
  1. **Crítico de combate** (PV do parceiro, PV do alvo, log de dano): moldura com canto reforçado (ex. "garra"/ornamento nos 4 cantos, 4–6px), cor de borda que reage ao estado (verde→amarelo→vermelho conforme PV, não só a barra interna).
  2. **Navegação/sistema** (inventário, equipe, mapa, Digivice): moldura padrão ilustrada — pergaminho/placa digital com leve textura de ruído e cantos chanfrados, consistente entre os painéis (hoje já são consistentes, mas genéricos; manter a consistência, trocar a textura).
  3. **Informativo/passivo** (aviso legal, placeholders de feature como Passe de Temporada): moldura mais discreta, menor contraste, para não competir com 1 e 2. O aviso legal deve colapsar para uma linha fixa no rodapé após ~4s (texto completo só em hover/clique), em vez de ocupar 230×95px fixos o jogo inteiro.
- Ponto de partida de referência visual: Drakantos usa avatar em losango com borda ornamentada e caixa de diálogo com faixa de nome destacada (`audit/img/ref_drakantos_vila.png`) — não copiar o desenho, mas adotar o princípio de "moldura com identidade", não retângulo genérico.

## 3. Ícones

- **Problema atual:** `src/ui/icons.ts` — ícones de linha monocromáticos (provavelmente SVG/path simples), mesma cor/peso para tudo: atalho, item, estado.
- **Proposta:**
  - Ícones de **categoria de item** (Cura, Captura, Evolução, Cosmético) ganham cor de fundo própria por categoria (ex. verde=cura, azul=captura, roxo=evolução, dourado=cosmético), como já faz o IdleDex nas bordas por raridade (`audit/img/ref_idledex_equipe_box.png`).
  - Ícones de **elemento/atributo** do Digimon (Fogo, Água, Vacina, Dados...) passam a ter cor de fundo consistente no badge, não só texto preto-sobre-cinza como hoje (`audit/img/06_painel_equipe_golpes.png`).
  - Atalhos da grade inferior (12 itens) ganham ilustração simples por função em vez de glifo de linha fino — mais peso visual pixel-art, menos "ícone de admin panel".

## 4. Estados (hover / seleção / confirmação)

- **Problema atual:** não verificado via CSS estático se há estado de hover distinto por tipo de elemento; os cartões de evolução bloqueada (`audit/img/07_painel_evolucao.png`) mostram o requisito com ✗ mas o cartão em si não parece visualmente "trancado" (sem cadeado, sem dessaturação).
- **Proposta — regras mínimas para v2, aplicadas a todo elemento interativo:**
  - **Hover:** leve brilho na borda (não mudança de cor de fundo abrupta) + cursor pointer (já existe).
  - **Seleção/ativo** (ex. slot de golpe equipado, Digimon ativo na equipe): borda dourada (`--ui-gold`, já existe no tema) + leve escala (102%) — já parcialmente usado (grade de atalhos do parceiro tem borda amarela em `audit/img/05_hud_floresta_combate.png`), **padronizar para todo elemento selecionável**, hoje é inconsistente.
  - **Bloqueado** (evolução não elegível, região não liberada, item sem estoque): dessaturar 40% + ícone de cadeado pequeno no canto, não só texto cinza. Hoje a única pista é cor de texto (`audit/img/01_hud_mapa_mundi.png`, nó "Montanha" fica em texto avermelhado) — manter a cor, somar o ícone.
  - **Confirmação** (evoluir, viajar, resetar save): flash breve (150–200ms) na própria borda do botão clicado antes de fechar o modal, para feedback de "seu clique registrou" antes da transição.

## 5. Layout do HUD (wireframe ASCII)

Mantém a organização espacial atual (ela já segue a referência aprovada do IdleDex, ADR-010) — a mudança é de **peso visual e agrupamento**, não de posição.

```
┌─ [legal, 1 linha, colapsa após 4s] ──────────────┐        ┌─[moeda]─[social]┐
│ Região · Rota                                     │        │  (peso leve)    │
└────────────────────────────────────────────────────┘        └─────────────────┘
                         ┌──── AUTO · Fugir · Auto-evoluir ────┐
                         └──────────────────────────────────────┘


                 [ mundo — personagem e Digimon sempre visíveis ]


┌─ log de combate (peso médio, ícone por tipo de evento) ──────────────────┐
└────────────────────────────────────────────────────────────────────────┘
┌─chat (colapsado)┐
└─────────────────┘
┌─minimap─┐ ┌inv┐ [grade de atalhos, 12] ┌── parceiro: retrato·nome·Nv·PV·XP ──┐ [equipe, 5]
└─────────┘ └───┘                        └──────────────────────────────────────┘
```

Mudanças-chave sobre o wireframe atual:
- A pilha "Passe de Temporada / Fonte dos Desejos / Chefe Mundial / Guilda" (hoje ocupando o canto superior direito inteiro, `audit/img/05_hud_floresta_combate.png`) move para **peso leve e recolhido** (ícones pequenos, sem caixa de texto própria) até cada feature existir de verdade — não deve competir com moeda/social.
- O log de combate ganha ícone de prioridade (espada=dano, lupa=scan, seta=XP) para escaneável num relance, em vez de texto corrido uniforme.

## 6. Wireframes por painel (ASCII)

### 6.1 Mapa-múndi (maior prioridade de retrabalho)

```
┌─ MAPA-MÚNDI ──────────────────────────────────────────── × ─┐
│  [ilustração de fundo: relevo do Digimundo, não grid vazio]  │
│                                                                │
│      ╔══════════╗                    ╔══════════╗            │
│      ║ MONTANHA ║╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌║ DESERTO  ║            │
│      ║ [mini]🔒 ║                    ║ [mini]🔒 ║            │
│      ╚══════════╝                    ╚══════════╝            │
│           ╎                               ╎                   │
│      ╔══════════╗                    ╔══════════════╗        │
│      ║ FLORESTA ║═══════════════════ ║ ZONA CORROMP.║        │
│      ║ [mini]📍 ║                    ║ [mini]🔒      ║        │
│      ╚══════════╝                    ╚══════════════╝        │
│        ╎        ╲                                             │
│   ╔══════════╗  ╔══════════╗                                  │
│   ║   VILA   ║  ║  PRAIA   ║                                  │
│   ║ [mini]✓  ║  ║ [mini]✓  ║                                  │
│   ╚══════════╝  ╚══════════╝                                  │
│                                                                 │
│  ┌─ painel lateral da região selecionada (abre ao clicar) ──┐ │
│  │ [ilustração maior]  Floresta Densa — Nv.1–15              │ │
│  │ "Mata densa cortada por um riacho raso..."                │ │
│  │ Digimon encontrados: Guilmon, Gabumon, Tsunomon...         │ │
│  │ Requisito: nenhum · Eventos: —            [ Viajar ]      │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```
Diferenças do atual: cada nó ganha uma **miniatura ilustrada** (não precisa ser arte final nova — pode ser um recorte/crop do próprio mapa já existente, ex. `forest_v41_dia.png` cortado, para a Floresta); clicar abre um **painel lateral com descrição, Digimon encontrados e requisito**, em vez de tudo já espremido dentro da caixinha do nó (GS-009 §2 pede nome/ilustração/descrição/requisitos/nível/Digimon/eventos — hoje só nome+nível+estado cabem no nó).

### 6.2 Digivice

```
┌─ DIGIVICE ──────────────────────────────────── × ─┐
│ ╭──────────────────────────────────────────────╮  │
│ │ [moldura de "aparelho": cantos arredondados,  │  │
│ │  leve brilho de tela CRT atrás da grade]       │  │
│ │  Vistos 18/31  Escaneados 0/31  [███▁▁▁] 6%   │  │
│ ├──────────────────────────────────────────────┤  │
│ │ [01][02][03][04][05][06][07]                  │  │
│ │ [08][09][10][11][12][13][14]   ┌─detalhe───┐  │  │
│ │ [15][16][17][18][19][20][21]   │ [sprite]   │  │  │
│ │ [22][23][24][25][26][27][28]   │ Gigimon    │  │  │
│ │ [29][30][31]                   │ Bebê·Vírus │  │  │
│ │                                 │ [▓▓▓▁] 50% │  │  │
│ │                                 └────────────┘  │  │
│ ╰──────────────────────────────────────────────╯  │
└──────────────────────────────────────────────────┘
```
Mudança: envolve a grade numa moldura única de "aparelho" (cantos redondos + leve glow interno), em vez da grade solta sobre fundo escuro plano de hoje. Conteúdo/dados idênticos — só a casca.

### 6.3 Equipe & Box (Digimon)

```
┌─ EQUIPE & BOX ───────────────────────── [Digimon|Golpes|Times] × ─┐
│ EQUIPE 5/5                    │  Guilmon Nv.13         MP ▓▓▓▁ 35/46│
│ ┌────┐┌────┐┌────┐┌────┐┌────┐│  [retrato grande, borda por elemento]│
│ │🔥 ⭐⭐│radiais por elemento, não cinza plano                      │
│ └────┘└────┘└────┘└────┘└────┘│                                     │
│ BOX 12/60  [busca...]          │  Golpes ativos 4/4 (cards coloridos │
│ ┌────┐┌────┐┌────┐┌────┐       │  por elemento, não badge cinza)     │
│ │... │grade igual, borda       │                                     │
│ └────┘  colorida por elemento  │                                     │
└─────────────────────────────────────────────────────────────────┘
```
Mudança central: cada card de Digimon ganha **cor de borda pelo elemento/atributo** (Fogo=laranja, Água=azul, Vacina=dourado, Vírus=roxo, Dados=verde) — hoje todos os cards são idênticos em cinza, só o sprite muda. Isso sozinho já resolve boa parte da sensação "tabela de dados".

## 7. Composição da região piloto — Clareira Central + riacho com ponte

`quality-overhaul/audit/VISUAL_AUDIT.md` (game-art) não existe neste workspace no momento desta proposta — segue a sugestão do próprio briefing na ausência dele.

**Local:** dentro da Floresta Densa (`forest-proof`), reaproveitando o riacho com ponte de tronco que **já existe** no mapa atual (visível em `audit/img/11_floresta_composicao_atual.png`, atravessando a trilha principal perto do centro). Não é mapa novo — é a reconstrução de uma área já presente, como pede o GS-010 §4 ("escolher uma pequena área da floresta existente").

- **BG (background, sem colisão):** copas de árvore distantes em tom mais frio/dessaturado (a paleta de sombra atual, `canopyShadow`, já existe no preset — usar como base), leve névoa baixa perto do riacho pela manhã/noite.
- **MID (terreno + vegetação principal, com colisão):** a clareira central em grama clara (o jogo já tem `clearing_floor_v41`, 4 variantes) cercada por mata densa (`denseedge_w47`); o riacho atravessa a clareira raso o bastante para não cortar o acesso, com a ponte de tronco já modelada como a única travessia "oficial" — reforça leitura de caminho.
- **FG (primeiro plano, acima do jogador em partes, sem bloquear leitura):** moitas/folhagem baixa nas bordas do quadro, usadas com critério (GS-010 §A: "sem esconder o jogador de forma inadequada") — não cobrir o centro da clareira, só emoldurar os cantos da composição.
- **Overlay (luz/efeitos):** rim-light nas copas já existe (v4.1); somar brilho na água do riacho (reflexo simples, 2–3 frames) e partículas de "dados"/vaga-lumes ocasionais sobre a clareira à noite — sutil, não constante (GS-010 §4E pede sutileza).

**Pontos de interesse:**
1. A ponte em si — ponto de passagem natural, bom lugar para um NPC ou Digimon parado, já que é gargalo de movimento.
2. Uma margem de areia/pedra no riacho, fora da trilha principal, como pequeno desvio opcional (recompensa de exploração — item ou Digimon raro).
3. Um ponto alto nas rochas/raízes na borda da clareira para variar silhueta vertical (hoje o terreno é quase todo plano).

**Ritmo aberto/denso:** a clareira central = **espaço aberto** (abertura visual, zona de respiro, bom para combate); a mata ao redor = **densidade visual alta** (variação de troncos, copas, sombra) sem aumentar a densidade de colisão a ponto de travar movimento; a trilha + ponte = **corredor de transição** entre os dois, guiando o olho e o movimento do jogador pela composição, não um grid aberto genérico.

---

## Limitações desta proposta

- Nenhuma arte nova foi gerada — é diagnóstico + direção, conforme a Fase 1 do GS-011.
- Cores/paleta exatas de borda por elemento (§6.3) não foram validadas contra a paleta já aprovada em `docs/ART_STYLE_GUIDE.md` — precisa checagem cruzada com game-art antes da Fase 3.
- A composição da região piloto (§7) assume prioridade da Floresta Densa por já ter o maior investimento técnico (v4.1); se o game-art entregar `VISUAL_AUDIT.md` com outra escolha, este documento precisa ser revisto.
