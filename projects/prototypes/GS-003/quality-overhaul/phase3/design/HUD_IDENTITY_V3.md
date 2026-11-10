# HUD Identity v3 — canto superior direito (resolve o clone do IdleDex)

- **Autor:** game-design (UI-UX-DESIGNER) · **Data:** 2026-11-10
- **Gatilho:** feedback do fundador, item 1 (`quality-overhaul/PROJECT_LOG.md`, 2026-11-10 ~06:1x): *"O painel do canto superior direito está exatamente igual ao outro jogo (IdleDex) e precisa ser trocado."*
- **Base:** `UI_DIRECTION_V2.md` (direção v2, ainda não implementada), `P8_HUD_V2_SPEC.md` (sistema de moldura/paleta/tipografia já especificado — **herdado, não reaberto aqui**), `quality-overhaul/audit/UI_WORLD_AUDIT.md` (achado original do clone), `docs/REFERENCE_LIBRARY.md` (regra do estúdio: copiar conceito genérico, nunca a casca), `teardowns/IDLEDEX.md`, `shared/decisions/ADR-010-gs003-referencia-visual-canonica.md` (organização espacial aprovada).
- **Escopo:** só o bloco `.hud-tr` do HUD (moeda, Passe de Temporada, Fonte dos Desejos, grade de 6 ícones, Chefe Mundial, Guilda) — o bloco citado literalmente pelo fundador. Nada mais do HUD muda aqui: a barra inferior, a hotbar, o minimapa e o sistema de moldura/paleta seguem exatamente o que `P8_HUD_V2_SPEC.md` já definiu, para não reabrir uma decisão em andamento.
- **Nenhuma arte foi produzida. Nenhum código foi alterado.** Os mockups são wireframes vetoriais de grid/dimensão (mesma convenção do `P8_HUD_V2_SPEC.md` §11), não arte final.

---

## 0. O que está copiado, exatamente (evidência)

**[E, `prototype/world/src/ui/hud.ts`, branch `quality-overhaul`, leitura em `workspaces/game-dev/qo`]** O bloco é gerado por este HTML (trecho literal, hoje em produção):

```html
<div class="hud-tr">
  <div class="coins">🪙<b>0</b><span>bits</span><button class="plus">+</button></div>
  <button class="event gold">⭐<b>PASSE DE TEMPORADA</b></button>
  <div class="event">🎁<span>Fonte dos Desejos</span><em>61%</em></div>
  <div class="icon-grid"><!-- 6 botões: arena, mapa, amigos, correio, chefe, troféu --></div>
  <div class="event dim">👹<span>Chefe Mundial</span><em>6h55</em></div>
  <div class="event dim">🛡️<span>Guilda dominante da rota</span><em>—</em></div>
</div>
```

Todos os 6 blocos usam a mesma classe CSS (`.panel`/`.event`, `src/style.css`): fundo `rgba(20,23,34,.92)`, borda 2px `#3b4261`, `border-radius:6px` — é literalmente a mesma pilha retangular de caixas, no mesmo canto, com os mesmos papéis funcionais (moeda, passe de batalha, boost de sorte, menu de atalhos, world boss, guilda) que o IdleDex usa (`quality-overhaul/audit/UI_WORLD_AUDIT.md` linha 16, 18; `teardowns/IDLEDEX.md`). A organização espacial (canto superior direito = moeda/social) **é aprovada** pelo ADR-010 — o problema não é "onde", é "como": é a mesma casca, não só a mesma posição.

**Causa estrutural:** 4 das 6 peças são placeholders de sistemas que **não existem no GDD** (`docs/GDD_MMO_V1.md` não especifica Guilda nem Correio em nenhum lugar; Fonte dos Desejos não tem definição de mecânica em documento nenhum do estúdio). Trocar a casca sem dar conteúdo real a essas 4 peças (feito em `PANELS_SPEC.md`, entrega irmã deste documento) deixaria o mesmo problema com roupa nova.

---

## 1. Princípio de identidade

O Digivice é o objeto central da franquia Digimon: um aparelho físico que o Tamer carrega, que mostra dados (Digidex, HP, mapa) e vira interface de tudo. Hoje nosso HUD não tem esse objeto — tem uma pilha de caixas de texto genéricas, que é exatamente o que o IdleDex também tem (ele não tem um "objeto" na UI, só caixas).

**Decisão de design:** o canto superior direito deixa de ser "uma lista de recursos empilhados" e passa a ser **um instrumento** (um mostrador físico, não uma lista). Isso por si só já diferencia de qualquer clone de IdleDex, porque IdleDex (e a maioria dos idle games do gênero) usa listas de caixa — não é uma escolha estética aleatória, é a diferença estrutural entre "painel de dashboard" e "painel de dispositivo".

Duas alternativas abaixo seguem esse princípio por caminhos diferentes. **Nenhuma move o bloco de posição** (seguindo `P8_HUD_V2_SPEC.md` §0.1, "mesma organização espacial, outro peso visual") — ambas ocupam exatamente o espaço do atual `.hud-tr`, canto superior direito.

---

## 2. Alternativa A — "Digivice Radial"

Um único objeto circular (o "hub") substitui as 6 caixas. Os números (moeda) saem do hub e vão para uma ribbon fina no topo; o resto (Passe, Fonte dos Desejos, Chefe Mundial, Guilda, Correio, Conquistas) só aparece quando o jogador abre o hub.

### 2.1 Estado fechado (padrão, sempre visível)

- **Ribbon do topo** (nova, 20px de altura, moldura nível 3 — a mais discreta do sistema P8 §2): atravessa a largura da área de recursos, fundo `rgba(14,16,28,0.55)`, sem borda própria de caixa. À direita: ícone de moeda (10px) + número de bits (pixel-UI 12px) — é só leitura, não há botão "+" (não existe loja de moeda premium, `GDD_MMO_V1.md` §7.1/ADR-007).
- **Hub** (64×64px, círculo, moldura nível 3 chanfrada — ver P8 §2 nível 3 adaptado a círculo): fica abaixo da ribbon, mesmo canto. Mostra um emblema estático do Tamer/Digivice (identidade, não dado) no centro. Até 3 **pips** de notificação (6px, cor `--ui-gold`) no aro, em posições fixas (10h/2h/6h), um por sistema com novidade real (Correio não lido, Passe com recompensa pronta, Guilda com evento da rota) — **sem pip quando não há novidade** (resolve o "—" permanente do placeholder atual).
- **Arco de Chefe Mundial:** um arco de progresso (2px, `--ui-gold`) sobreposto ao aro externo do hub, enchendo conforme a janela se aproxima (ver `PANELS_SPEC.md` §5) — substitui o texto fixo "6h55". Sem janela ativa/próxima, o arco não aparece (vazio = nada desenhado, não "—").

### 2.2 Estado aberto (1 clique no hub, fecha com outro clique ou Esc)

Um arco de 6 ícones (32×32px cada, moldura nível 2 chanfrada pequena) se abre a partir do hub, raio 72px, no quadrante inferior-esquerdo do hub (abre para dentro da tela, nunca para fora da área jogável): Guilda, Correio, Passe (ícone `star`), Fonte dos Desejos (ícone `gift`), Chefe Mundial (ícone `boss`), Conquistas (ícone `trophy`). Entrada escalonada, 120ms por ícone (mesma família de timing do P8 §3, "seleção"). Cada ícone abre o `Panel` correspondente (arquitetura já existente, `panel.ts`/`screens.ts` — ver `PANELS_SPEC.md`), e o hub fecha.

**Sem gesto novo de input:** o hub é só a apresentação visual dos mesmos atalhos que já existem por teclado/clique direto (nenhuma tecla nova é necessária; o clique no hub é equivalente a abrir qualquer modal hoje).

### 2.3 Mockups

`v3_mockups/alt_a_closed.svg` (estado fechado, ribbon + hub + arco de boss) e `v3_mockups/alt_a_open.svg` (estado aberto, 6 ícones no arco).

---

## 3. Alternativa B — "Painel Digivice + Trilho de Insígnias"

Mantém 2 peças fixas, mas cada uma é uma forma própria (não uma lista de caixas idênticas), e sem gesto de abrir/fechar — menor risco de implementação que a Alternativa A.

### 3.1 Ticker de topo (18px, full-width, nível 3)

Uma única linha, no topo da tela (acima até da pílula de região), que cicla **uma mensagem por vez** (4s cada) só quando há algo real para anunciar: "Passe: novo nível disponível", "Chefão Mundial disponível em 2h", "Sua guilda perdeu a Floresta Densa". **Sem mensagem = ticker vazio (altura zero), não uma caixa com "—".**

### 3.2 Digivice Display (140×56px, moldura nível 2 chanfrada, uma peça só)

Substitui a caixa de moeda **e** a caixa de Fonte dos Desejos por **um único objeto**: metade esquerda = ícone de moeda + número (igual à leitura da ribbon da Alt A); metade direita = **mostrador circular de 40px** (anel preenchido + número % no centro) para a Fonte dos Desejos — em vez do texto cru "Fonte dos Desejos · 61%" num card, a % é um instrumento analógico, com a mesma leitura de "nível de algo enchendo" que qualquer medidor físico.

### 3.3 Trilho de insígnias (vertical, abaixo do Display)

5 hexágonos de 28px (moldura nível 2, forma hexagonal via `clip-path: polygon(...)`, não quadrado) — Guilda, Correio, Passe, Chefe Mundial, Conquistas — gap 4px, cada um clicável direto (sem hub, sem radial). Notificação = badge numérico pequeno (10px, `--ui-red`, reaproveita `.badge` já existente no CSS) sobreposto ao canto do hexágono, só quando há conteúdo não visto — mesmo padrão do badge de chat que já existe hoje.

### 3.4 Mockups

`v3_mockups/alt_b_overview.svg` (ticker + display + trilho) e `v3_mockups/alt_b_detail.svg` (zoom no Digivice Display, mostrando o mostrador circular da Fonte dos Desejos).

---

## 4. Comparação item a item com o IdleDex (e com o nosso clone atual)

| Peça atual (clone) | Como o IdleDex faz (`teardowns/IDLEDEX.md`) | Alternativa A | Alternativa B | Por que não é só reskin |
|---|---|---|---|---|
| `.coins` (ícone + número + botão "+") | Caixa fixa com ícone de moeda, número e botão de loja de gold (moeda premium) | Número inline na ribbon fina, sem caixa própria, sem botão "+" | Metade esquerda do Digivice Display (1 peça, 2 leituras) | O botão "+" desaparece porque não existe loja de moeda premium (ADR-007) — manter o botão seria copiar um CTA que não corresponde a nenhuma feature nossa |
| Botão dourado fixo "PASSE DE TEMPORADA" | Ícone/caixa permanente de acesso ao passe de batalha | Vira 1 ícone do hub, só visível ao abrir; pip só com recompensa pronta | Hexágono no trilho, com badge só quando há recompensa pronta | Deixa de ocupar espaço fixo nobre da tela por algo relevante só ocasionalmente — era o achado nº 1 do audit ("ruído de roadmap") |
| `.event` "Fonte dos Desejos · 61%" (texto cru) | Barra/escada de "Shiny Boost" acumulado por tempo | % só visível dentro do painel (ícone no hub) | Mostrador circular (anel + número), não etiqueta de texto | Em ambas, quando a % aparece, é lida como instrumento (anel), nunca como rótulo solto num card cinza — resolve a leitura "planilha" do audit |
| Grade 3×2 de 6 ícones soltos (mesmo peso) | Menu inferior denso (até 14 botões) | 6 ícones só aparecem no arco ao abrir o hub (sob demanda) | 5 hexágonos (forma própria, não botão quadrado genérico) | De "6 caixas sempre visíveis, peso idêntico ao resto" para "1 controle visível + conteúdo sob demanda" (A) ou "forma geométrica distinta de qualquer botão do resto da UI" (B) |
| `.event.dim` "Chefe Mundial · 6h55" | Timer de evento calendarizado, texto fixo | Arco de progresso no aro do hub, sem texto permanente | Badge numérico sobre o hexágono (como contador de notificação) | Vira leitura de instrumento, não rótulo tipo planilha; só chama atenção quando o tempo importa de fato |
| `.event.dim` "Guilda dominante da rota · —" | Guild War territorial sempre visível | Fica dentro do painel de Guilda; "—" permanente desaparece (sem pip = sem novidade) | Idêntico | O em-dash fixo (porque a feature nem existe) some — ou não mostra nada, ou mostra dado real quando a Guilda existir (`PANELS_SPEC.md` §2) |
| Container geral: pilha vertical de 6 caixas idênticas | Pilha vertical de caixas, mesmo fundo/borda | 1 objeto central (hub) + ribbon fina — nenhuma pilha de caixas | 1 objeto (display) + 1 trilho de formas hexagonais — nenhuma caixa quadrada | É o achado mais citado do audit ("mesma classe CSS para 7+ tipos de elemento", `UI_DIRECTION_V2.md` §2) — ambas alternativas eliminam a pilha de retângulos idênticos, não só trocam a cor dela |

---

## 5. Recomendação

**Recomendo a Alternativa A (Digivice Radial).**

Razões:
1. **Resolve o achado do audit com a maior margem:** a pilha vira 1 objeto só no estado padrão (vs. 2 objetos fixos na B). É a versão que menos se parece com qualquer HUD de idle game genérico.
2. **Identidade mais forte:** um Digivice que "abre" quando tocado é um gesto que a franquia já ensina (o próprio aparelho, na ficção, tem uma tela que liga/desliga) — reforça o tema sem inventar nada fora do personagem-conceito do jogo.
3. **Custo de implementação comparável:** o arco de 6 ícones reaproveita os mesmos `Panel`/atalhos já existentes (`panel.ts`, `screens.ts`) — é posicionamento CSS (`transform` em arco) + 1 handler de clique para abrir/fechar, não um sistema novo. Não é mais caro que desenhar 5 hexágonos com `clip-path` (B).

**Risco da A, mitigado:** interação "clique para abrir" pode ser menos descoberta por um jogador novo que um ícone sempre visível. Mitigação: o primeiro pip de notificação relevante (ex. Correio com o item de boas-vindas, ver `PANELS_SPEC.md` §3) funciona como o próprio tutorial do gesto — o jogador clica no hub porque viu um pip, não porque leu uma instrução.

**Se o fundador preferir o caminho mais conservador** (sem gesto de abrir/fechar, menor risco de QA), a **Alternativa B é a recomendação de fallback** — ela já resolve sozinha os itens mais citados pelo audit (caixa de moeda com botão de loja inexistente, texto cru de %, pilha de caixas idênticas), só não chega ao mesmo nível de "redução para 1 objeto".

---

## 6. O que não muda (herdado, não reaberto)

- Sistema de 3 níveis de moldura, paleta funcional, tipografia, estados (hover/seleção/bloqueado) — `P8_HUD_V2_SPEC.md` §1–3, integralmente.
- Barra inferior (minimapa, inventário, bloco Tamer, parceiro, equipe, hotbar) — `P8_HUD_V2_SPEC.md` §4, integralmente.
- Pílula de região/rota (topo-esquerda) e botão AUTO (topo-centro) — posição e conteúdo atuais, só a moldura (já coberta pelo P8).
- Arquitetura de painéis (`Panel`, `screens.ts`, `data-short`/`onShortcut`) — reaproveitada tal como está; `PANELS_SPEC.md` detalha o conteúdo de cada painel novo dentro dessa mesma arquitetura.

---

## 7. Mockups

`v3_mockups/`:

| Arquivo | Conteúdo |
|---|---|
| `alt_a_closed.svg` | Ribbon de topo + hub fechado (64px, emblema, pips, arco de boss), em escala 1:1 px com grid de 4px. |
| `alt_a_open.svg` | Mesmo hub, estado aberto: arco de 6 ícones com raio e espaçamento anotados. |
| `alt_b_overview.svg` | Ticker de topo + Digivice Display + trilho de 5 hexágonos, visão geral. |
| `alt_b_detail.svg` | Zoom no Digivice Display: divisão moeda/mostrador circular da Fonte dos Desejos, com anotação de raio/espessura do anel. |

São wireframes vetoriais de grid/dimensão (mesma convenção do `P8_HUD_V2_SPEC.md` §11) — a arte final (textura do emblema, ilustração do hexágono) é produção de game-art, fora desta entrega.

---

## 8. Limitações

- **Nenhuma arte foi produzida.** Emblema do Digivice, textura dos hexágonos e qualquer ilustração além de formas geométricas lisas ainda não existem.
- **Não testado com usuário.** A escolha entre A e B é uma recomendação de design, não um resultado de teste de usabilidade (o estúdio não tem jogadores externos nesta fase).
- **Dependência cruzada com `PANELS_SPEC.md`:** os pips/badges de notificação descritos aqui (Correio não lido, Passe com recompensa pronta, Guilda com evento) só funcionam quando os sistemas da entrega irmã existirem; até lá, o hub/display ficam sempre no estado "sem novidade" (nenhum pip), o que é o estado correto e não um bug.
- **Raio/ângulos do arco (Alt A §2.2) não foram testados em tela real** — os valores (72px, 120° de abertura) são uma primeira proposta geométrica; pode exigir ajuste fino do game-dev ao implementar, sem mudar o princípio.
