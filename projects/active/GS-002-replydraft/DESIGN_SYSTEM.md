# GS-002 — ReplyDraft: Design System + UI

- **Projeto:** GS-002 (ReplyDraft) · **Autor (agente):** game-art · **Data:** 2026-11-08
- **Status:** PRÉ-APROVAÇÃO — protótipo local. Ver `shared/decisions/ADR-002-gs002-sem-aprovacao.md`. Nenhum asset aqui foi publicado na Chrome Web Store.
- **Entrada:** `projects/discovery/GS-001/VISUAL_PROPOSALS.md` (§C07, direção "invisível até precisar") e `PROTOTYPES.md` (§2, wireframes C07).

> Marcação: **[E]** evidência (fonte+data) · **[H]** hipótese não verificada.

---

## 1. Identidade

### 1.1 Personalidade da marca

Eficiente, confiável, discreta. ReplyDraft **[E: VISUAL_PROPOSALS.md §C07]** se comporta como uma extensão profissional de produtividade, não como um produto de IA chamativo — fica fora do caminho até o momento em que o usuário pede o rascunho.

### 1.2 Logo (descrito)

Um ícone de seta de resposta (reply arrow) curvando para a esquerda, com um pequeno traço de lápis/caneta sobreposto perto da ponta — sugere "rascunho assistido" sem usar símbolos de IA genéricos (estrela/cintilação/faísca) já saturados por outras ferramentas. Nenhuma semelhança com os ícones de resposta do Gmail, com o logo do Gemini ou com qualquer marca do Google.

### 1.3 Versão SVG simples (24×24, monocromática por padrão)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" role="img" aria-label="ReplyDraft">
  <path d="M 15.5 6.5 C 11 6.5 7.8 8.8 6.6 12.3" fill="none" stroke="#1D4E5F" stroke-width="1.8" stroke-linecap="round" />
  <path d="M 9.2 9.6 L 6.1 12.6 L 9.6 14.4" fill="none" stroke="#1D4E5F" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 13.3 12.6 L 18.4 17.7 L 16.9 19.2 L 11.8 14.1 Z" fill="#2F6E48" />
  <path d="M 16.9 19.2 L 15.4 20.7 L 14.6 18.9 Z" fill="#1D4E5F" />
</svg>
```

Arquivo-fonte: `app/extension/src/ui/icon.svg`. Para fundos escuros (dark mode do Gmail/toolbar escura do Chrome), trocar `#1D4E5F` → `#3A7D94` e `#2F6E48` → `#2A7A4B` (mesmos tons usados nos tokens de tema escuro, §2).

---

## 2. Tokens

Arquivo-fonte: `app/extension/src/ui/tokens.css` (custom properties, prefixo `--rd-`, escopo isolado sob a classe `.rd-root`). O game-dev consome este arquivo diretamente — não editar outros arquivos de código da extensão.

### 2.1 Cor — tema claro

| Token | Hex | Papel |
|---|---|---|
| `--rd-color-primary` | `#1D4E5F` | Marca, ícone, header, foco |
| `--rd-color-bg` | `#FAFAF8` | Fundo do painel/overlay |
| `--rd-color-bg-elevated` | `#FFFFFF` | Cards, popover |
| `--rd-color-text` | `#2E2E33` | Texto principal |
| `--rd-color-text-secondary` | `#6E6E76` | Texto secundário/placeholder (ajustado — ver §4) |
| `--rd-color-success` | `#2F6E48` | Botão "inserir rascunho", confirmação (ajustado — ver §4) |
| `--rd-color-warning` | `#D97B3D` | Aviso de cota próxima do limite |
| `--rd-color-error` | `#B23128` | Erro/falha de geração |
| `--rd-color-border-interactive` | `#1D4E5F` | Borda de input/botão outline |

### 2.2 Cor — tema escuro (`prefers-color-scheme: dark` ou classe `.rd-dark`)

| Token | Hex | Papel |
|---|---|---|
| `--rd-color-bg` | `#1B1E22` | Fundo (compatível com Gmail dark, que usa cinza-azulado escuro, não preto puro) |
| `--rd-color-text` | `#F0F0ED` | Texto principal |
| `--rd-color-primary` | `#3A7D94` | Petróleo clareado — o tom original `#1D4E5F` falha contraste de componente contra o fundo escuro (ver §4) |
| `--rd-color-success` | `#2A7A4B` | Botão de confirmação em dark |
| `--rd-color-warning` | `#E8A463` | Aviso de cota em dark |
| `--rd-color-error` | `#C94A3F` | Erro em dark |

A classe `.rd-dark` tem prioridade sobre `prefers-color-scheme`, porque o tema relevante é o do **Gmail aberto**, não o do sistema operacional — o content script deve detectar o tema do Gmail (atributo/classe que o Gmail aplica ao `<html>`/`<body>` quando o usuário ativa o tema escuro dentro do próprio Gmail) e aplicar `.rd-dark` de acordo, já que um usuário pode ter SO claro + Gmail escuro ou vice-versa.

### 2.3 Tipografia

- **UI:** `Inter` (Google Fonts, **OFL 1.1**), com fallback para a pilha de fontes do sistema (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`) — garante que a extensão nunca trave esperando um download de fonte e funcione offline/com rede lenta.
- **Monoespaçada (preview de texto bruto, se necessário):** `JetBrains Mono` (**OFL 1.1**), fallback `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`.
- Escala: `--rd-font-size-xs` 11px (metadados) → `--rd-font-size-xl` 18px (títulos de painel). Nenhum texto de corpo abaixo de 12px, para legibilidade em overlay pequeno.

### 2.4 Espaçamento, raio, sombra, z-index

- Espaçamento em escala de 4px (`--rd-space-1` 4px … `--rd-space-7` 48px).
- Raio: `--rd-radius-sm` 4px (inputs pequenos), `--rd-radius-md` 6px (botões/cards), `--rd-radius-lg` 10px (popover/modal) — cantos levemente arredondados, consistente com a linguagem "B2B discreta", nunca totalmente quadrado nem pill em elementos grandes.
- Sombra: 3 níveis (`sm`/`md`/`lg`), tingida de petróleo (`rgba(29,78,95,...)`) em vez de preto puro, para não parecer um componente genérico de UI kit.
- **Z-index:** faixa alta e específica (`2147483001`–`2147483005`, escalonada: botão flutuante → popover → scrim de modal → modal → toast) em vez de valores redondos (`999`/`9999`) que colidem com outras extensões. O Gmail usa z-index muito altos internamente em seus próprios diálogos; a extensão precisa ficar acima do conteúdo do e-mail mas não necessariamente acima de diálogos nativos críticos do Gmail (ex. não deve cobrir um alerta nativo de "sem conexão" do próprio Gmail) — **[H]** valor exato a confirmar empiricamente pelo game-dev contra o DOM real do Gmail antes do spike de content script (TF §5).

---

## 3. Componentes

### 3.1 Botão flutuante "Gerar rascunho"

Inserido perto do botão "Responder" nativo do Gmail, dentro do fluxo de layout do Gmail (não `position: fixed` na viewport) para herdar o scroll natural da thread.

**Estados:**

| Estado | Visual |
|---|---|
| `idle` | Fundo `--rd-color-bg-elevated`, borda `--rd-color-border-interactive` 1px, texto/ícone `--rd-color-primary`, ícone ReplyDraft 16px + rótulo "Gerar rascunho" |
| `hover` | Fundo muda para `--rd-color-primary` 8% (tint), sem mudança de tamanho (evita layout shift no Gmail) |
| `focus` | Anel de foco visível: `outline: 2px solid var(--rd-color-focus-ring); outline-offset: 2px` — nunca `outline: none` |
| `loading` | Ícone substituído por spinner de 3 pontos (sem logo animado), rótulo muda para "Gerando…", botão `aria-busy="true"`, desabilitado para novo clique |
| `sucesso` | Transição rápida (200ms) para check verde (`--rd-color-success`) + rótulo "Rascunho inserido", retorna a `idle` após 1.5s |
| `erro` | Ícone de alerta (`--rd-color-error`), rótulo "Não foi possível gerar — tentar de novo", botão permanece clicável (retry) |
| `quota excedida` | Ícone/rótulo mudam para `--rd-color-warning`, texto "Limite do mês atingido", clique abre modal de upgrade em vez de gerar (nunca perde a ação do usuário — paywall contextual, não bloqueio mudo) |
| `offline` | Rótulo "Sem conexão — tente novamente", botão desabilitado (`aria-disabled="true"`), sem spinner infinito |

### 3.2 Painel de preview do rascunho (popover)

Aparece ancorado ao botão, antes de inserir o texto na caixa de composição — permite revisar/editar antes de colar.

```
┌─────────────────────────────────────────────┐
│ Rascunho (editável)                     [×]  │
│ ┌───────────────────────────────────────┐   │
│ │ Olá! O prazo médio é de 5 dias úteis...│   │
│ │ (textarea editável, texto puro)        │   │
│ └───────────────────────────────────────┘   │
│ ⚠ Gerado por IA — revise antes de enviar      │
│                   [Descartar]  [Inserir]     │
└─────────────────────────────────────────────┘
```

- Texto do rascunho entra como **texto puro** (sem HTML), requisito de segurança já definido em TECHNICAL_FEASIBILITY.md (evita XSS e herança de formatação inacessível).
- `[Inserir]` usa `--rd-color-success`; `[Descartar]` é botão secundário (texto `--rd-color-text-secondary`, sem fundo).
- O popover não pode capturar foco de forma que trave a navegação por teclado do Gmail — `Esc` sempre fecha e devolve foco ao botão de origem.

### 3.3 Seletor de tom

Dentro do popup da extensão (clique no ícone da barra) e na página de opções — mesmo componente reutilizado nos dois lugares.

```
┌───────────────────────────────┐
│ Tom de voz                     │
│ ( ) Padrão                     │
│ (•) Reclamação                 │
│ ( ) Orçamento                  │
│ [+ Novo tom]                   │
└───────────────────────────────┘
```

Implementado como radio group acessível (`role="radiogroup"`, cada opção com `role="radio"` + `aria-checked`), não `<select>` — porque o usuário frequentemente compara 2-3 tons lado a lado antes de escolher, e radio visível facilita esse scan, enquanto `<select>` esconde as opções.

### 3.4 Popup da extensão (ícone da barra)

```
┌───────────────────────────────┐
│ [logo] ReplyDraft               │
│ Rascunhos este mês: 14/20       │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░  (barra)   │
│ [Gerenciar tom de voz]          │
│ [Ver plano / assinar]           │
└───────────────────────────────┘
```

Largura fixa de popup (limite técnico do Chrome): 320px. Barra de cota usa `--rd-color-primary` até 80% de uso, `--rd-color-warning` de 80–99%, `--rd-color-error` ao atingir 100% — mudança de cor é sempre acompanhada de texto numérico (`14/20`), nunca só cor (acessibilidade para daltonismo).

---

## 4. Checagem de contraste WCAG AA (calculada por luminância relativa, WCAG 2.x)

Fórmula padrão aplicada diretamente (não é citação de outra fonte — recalculada nesta tarefa):

| Par | Contraste | Resultado |
|---|---|---|
| Texto grafite `#2E2E33` / fundo claro `#FAFAF8` | 12.92:1 | Passa AA/AAA |
| Texto claro `#FAFAF8` / header petróleo `#1D4E5F` | 8.71:1 | Passa AA/AAA |
| Branco / verde-ação **original** `#3C8A5B` | 4.22:1 | Passa só texto grande — **ajustado** |
| Branco / verde-ação **ajustado** `#2F6E48` (adotado) | 6.10:1 | Passa AA |
| Cinza-neutro **original** `#8A8A92` / fundo claro | 3.28:1 | Só texto grande — **ajustado** |
| Cinza-neutro **ajustado** `#6E6E76` (adotado) | 4.84:1 | Passa AA |
| Branco / laranja-alerta `#D97B3D` | 3.07:1 | Só texto grande — por isso o aviso de cota usa **texto escuro `#3A2200`** sobre o laranja |
| Texto escuro `#3A2200` / laranja-alerta `#D97B3D` | 4.86:1 | Passa AA (adotado) |
| Branco / vermelho-erro `#B23128` (novo, não estava no VISUAL_PROPOSALS) | 6.24:1 | Passa AA |
| **Dark mode** — texto claro `#F0F0ED` / fundo escuro `#1B1E22` | 14.65:1 | Passa AA/AAA |
| **Dark mode** — texto secundário `#B4B4BC` / fundo escuro | 8.12:1 | Passa AA |
| **Dark mode** — petróleo original `#1D4E5F` como contraste de componente contra fundo escuro | 1.84:1 | **Não passa** (mínimo 3:1 p/ componente não-textual) — por isso o primário em dark usa `#3A7D94` |
| **Dark mode** — petróleo ajustado `#3A7D94` contra fundo escuro (contraste de componente) | 3.62:1 | Passa |
| **Dark mode** — branco sobre `#3A7D94` (texto de botão) | 4.62:1 | Passa AA |
| **Dark mode** — borda de input `#6B6F77` contra fundo escuro | 3.32:1 | Passa (mínimo de componente) |

**Decisões derivadas desta checagem** (diferem do VISUAL_PROPOSALS.md original, que já sinalizava o problema do verde mas não recalculou os demais pares nem cobria o tema escuro):

1. Verde-ação mudado de `#3C8A5B` → `#2F6E48` para texto branco em todos os tamanhos.
2. Cinza-neutro mudado de `#8A8A92` → `#6E6E76` para uso como texto secundário normal; `#8A8A92` fica reservado só para elementos puramente decorativos (não é mais usado como texto).
3. Aviso de cota usa texto escuro sobre laranja, não branco.
4. Tema escuro não reutiliza as cores do tema claro 1:1 — petróleo precisou ser clareado para `#3A7D94` e a borda interativa escurecida para `#6B6F77`, caso contrário ambos ficam quase invisíveis contra o fundo escuro (`#1B1E22`), mesmo passando contraste de *texto* em outros contextos.

**Limitação [H]:** os cálculos usam a fórmula padrão de luminância relativa (WCAG 2.x) implementada e executada nesta tarefa, não um checador externo (ex. axe, Stark, WebAIM) — recomenda-se confirmação cruzada com uma dessas ferramentas antes da implementação final, especialmente para os pares de dark mode que são compostos nesta tarefa e não têm registro de teste anterior.

---

## 5. Página de opções (gerenciar perfis de tom)

### 5.1 Wireframe ASCII — desktop (≥960px)

```
┌───────────────────────────────────────────────────────────────┐
│ [logo] ReplyDraft — Opções                         [tema: ⚙]   │
├───────────────┬───────────────────────────────────────────────┤
│ Tons de voz    │  Tom: "Reclamação"                             │
│ ▸ Padrão       │  ┌───────────────────────────────────────┐   │
│ ▸ Reclamação ✓ │  │ Cole 2–3 exemplos de respostas que você │   │
│ ▸ Orçamento    │  │ já enviou e que representam este tom:   │   │
│ [+ Novo tom]   │  │ (textarea, até ~2000 caracteres)        │   │
│                │  └───────────────────────────────────────┘   │
│ Conta          │                           [Excluir] [Salvar]  │
│ Plano / cota   │                                                │
└───────────────┴───────────────────────────────────────────────┘
```

### 5.2 Wireframe ASCII — mobile/estreito (<640px, sidebar colapsa em abas)

```
┌─────────────────────────────┐
│ [logo] ReplyDraft            │
│ [Tons de voz ▾] [Conta]      │   ← abas, não sidebar
├─────────────────────────────┤
│ ▸ Padrão                     │
│ ▸ Reclamação ✓                │
│ ▸ Orçamento                   │
│ [+ Novo tom]                  │
│ ───────────────────────────  │
│ Tom: "Reclamação"              │
│ (textarea)                     │
│ [Excluir]  [Salvar]            │
└─────────────────────────────┘
```

Breakpoint único em 640px é suficiente aqui porque a página de opções não precisa de densidade de informação alta (poucos tons de voz por usuário, tipicamente 1–5) — sidebar fixa até 640px, abas abaixo disso.

---

## 6. Responsividade do painel/overlay dentro do Gmail (360–1440px)

O Gmail web roda em larguras muito variadas (painel lateral de visualização em tela dividida até monitor largo). O overlay da extensão precisa se adaptar sem quebrar o layout nativo do Gmail:

| Faixa | Comportamento |
|---|---|
| 360–479px (Gmail em painel estreito/split-view) | Botão "Gerar rascunho" perde o rótulo de texto, mostra só o ícone (16px) com `aria-label` completo mantido; popover de preview ocupa 100% da largura disponível do compose, com padding reduzido (`--rd-space-2` em vez de `--rd-space-4`) |
| 480–767px | Botão mostra ícone + rótulo curto ("Rascunho"); popover com largura máxima de 360px |
| 768–1199px | Layout padrão — botão com rótulo completo "Gerar rascunho"; popover 420px |
| 1200–1440px+ | Sem mudança adicional de layout — o Gmail já limita a largura da coluna de e-mail nessas resoluções, então o overlay segue o container do compose, não a viewport inteira |

Regra geral: a extensão nunca define largura própria independente do container do Gmail — sempre `max-width` relativo ao elemento de compose em que está ancorada, para não romper com mudanças futuras de layout do Gmail.

---

## 7. Acessibilidade

- **Contraste:** ver §4 (todos os pares de texto e de componente verificados por cálculo).
- **Foco visível:** todo elemento interativo (botão, radio, input, link) usa `outline: 2px solid var(--rd-color-focus-ring); outline-offset: 2px` — nunca remover outline sem substituto equivalente.
- **ARIA:**
  - Botão flutuante: `aria-label="Gerar rascunho de resposta com IA"` (varia por estado — ex. `aria-label="Gerando rascunho…"` durante loading).
  - Popover: `role="dialog"`, `aria-modal="false"` (não bloqueia a página, é um popover ancorado, não um modal verdadeiro), `aria-labelledby` apontando para o título "Rascunho (editável)".
  - Barra de cota: `role="progressbar"`, `aria-valuenow`/`aria-valuemin`/`aria-valuemax`, mais texto visível redundante (`14/20`) — nunca só a barra.
  - Seletor de tom: `role="radiogroup"` com `aria-label="Tom de voz"`, cada item `role="radio"` + `aria-checked`.
- **`prefers-reduced-motion`:** implementado em `tokens.css` — zera durações de transição/animação quando o usuário tem a preferência ativada no SO (inclui o spinner de loading, que passa a ser estático/sem rotação quando reduzido — recomenda-se ao game-dev usar um ícone de "carregando" estático ou pulsação de opacidade lenta em vez de rotação nesse caso, nunca remover o indicador por completo).
- **Modo escuro coerente com o Gmail:** `.rd-dark` segue o tema do Gmail, não do SO (ver §2.2) — evita o cenário em que o usuário vê um popover claro brilhante sobre um Gmail escuro (ou vice-versa), que é desconfortável e quebra a percepção de "ferramenta nativa discreta".
- **Teclado:** toda a jornada (abrir popover → editar texto → inserir ou descartar) deve ser operável só com teclado, com ordem de tab lógica (botão → textarea → Descartar → Inserir) e `Esc` fechando o popover sem perder o texto editado (mantido em memória até o usuário fechar o e-mail ou enviar).

---

## 8. Microcopy (PT-BR / EN)

| Contexto | PT-BR | EN |
|---|---|---|
| Botão idle | "Gerar rascunho" | "Draft reply" |
| Botão loading | "Gerando…" | "Generating…" |
| Botão sucesso | "Rascunho inserido" | "Draft inserted" |
| Botão erro | "Não foi possível gerar — tentar de novo" | "Couldn't generate — try again" |
| Botão quota excedida | "Limite do mês atingido" | "Monthly limit reached" |
| Botão offline | "Sem conexão — tente novamente" | "You're offline — try again" |
| Aviso sobre o rascunho | "Gerado por IA — revise antes de enviar" | "AI-generated — review before sending" |
| Popover — título | "Rascunho (editável)" | "Draft (editable)" |
| Popover — ação primária | "Inserir" | "Insert" |
| Popover — ação secundária | "Descartar" | "Discard" |
| Popup — cota | "Rascunhos este mês: {n}/{limite}" | "Drafts this month: {n}/{limit}" |
| Popup — CTA gerenciar | "Gerenciar tom de voz" | "Manage tone of voice" |
| Popup — CTA plano | "Ver plano / assinar" | "View plan / subscribe" |
| Modal de upgrade (ao esgotar cota) | "Você atingiu o limite do plano grátis. Assine para continuar gerando rascunhos este mês." | "You've reached your free plan limit. Subscribe to keep generating drafts this month." |
| Opções — placeholder do textarea de tom | "Cole 2–3 exemplos de respostas que você já enviou e que representam este tom." | "Paste 2–3 examples of replies you've already sent that represent this tone." |
| Opções — ação salvar | "Salvar tom" | "Save tone" |
| Opções — ação excluir | "Excluir" | "Delete" |
| Erro genérico de rede | "Algo deu errado. Tente de novo em alguns segundos." | "Something went wrong. Try again in a few seconds." |

Tom geral do microcopy: direto, sem jargão técnico, sem exclamações exageradas — consistente com o público-alvo (dono de pequeno negócio/freelancer de atendimento, não desenvolvedor) **[E: VISUAL_PROPOSALS.md §C07]**.

---

## 9. Arquivos produzidos nesta tarefa

- `app/extension/src/ui/tokens.css` — tokens CSS consumidos pela extensão (game-dev).
- `app/extension/src/ui/icon.svg` — ícone-fonte, original, sem semelhança com marcas de terceiros.
- Este documento.

## 10. Limitações

- Nenhuma tela foi renderizada/testada em um Gmail real ou em fixture HTML — os wireframes são ASCII e as regras de responsividade/z-index são especificação para o game-dev implementar e validar contra o DOM real (TF §5, spike de content script).
- Checagem de contraste é cálculo próprio (fórmula padrão WCAG 2.x), não verificação por ferramenta externa — ver limitação detalhada em §4.
- Logo/ícone não passou por checagem de colisão de marca/trademark em tempo real **[H: herdado de VISUAL_PROPOSALS.md]**.
- Nenhuma imagem foi gerada por IA nesta tarefa (nenhum provider configurado/contratado) — a lista de assets da Chrome Web Store (próximo documento) contém apenas prompts preparados para uso futuro.
- Dark mode do Gmail não foi inspecionado ao vivo nesta sessão — os tons de `.rd-dark` foram compostos para contraste AA e para ficarem próximos ao cinza-azulado escuro típico de UIs do Google Workspace, mas **[H]** até confirmação visual lado a lado com o Gmail real.
