# GS-001 — Visual Concept Proposal dos 3 finalistas (Task 5)

- **Projeto:** GS-001
- **Autor (agente):** game-art
- **Data:** 2026-11-08
- **Status:** rascunho
- **Entrada:** `OPPORTUNITY_CATALOG.md` (C01, C06, C07 — game-design, 2026-11-08) e `TECHNICAL_FEASIBILITY.md` (stacks — game-dev, 2026-11-08)

> Marcação: **[E]** evidência (fonte + data) · **[H]** hipótese não verificada.
>
> **Nota metodológica [H]:** nenhum provider de geração de imagem está configurado nesta sessão e nenhum foi contratado ou configurado para esta tarefa. Os "prompts de geração de imagem" abaixo são texto preparado para uso futuro, não execuções reais — nenhuma imagem foi gerada. Todas as referências de estilo são links públicos para orientação de linguagem visual (grafismo/paleta/composição), não para cópia de personagens, logotipos, UI ou marcas de terceiros. Nenhuma arte, nome ou identidade visual de produto existente foi reproduzida.
>
> Esta tarefa cobre apenas os 3 finalistas indicados no brief: **C01 Loopwright**, **C07 ReplyDraft**, **C06 StatusPing**. Não publiquei nada, não criei contas e não enviei comunicações.

---

## C01 — Loopwright (jogo idle + coleção, Web PWA → mobile)

Stack confirmada **[E: TECHNICAL_FEASIBILITY.md]**: Vite + TypeScript + PixiJS (render 2D) + Preact (UI), PWA → Capacitor para mobile. Isso é compatível com sprites 2D (raster) ou formas vetoriais renderizadas via canvas/WebGL — não exige um estilo específico.

### Três direções visuais alternativas

#### Direção A — Pixel art (16–32px, paleta limitada)

- **Conceito em 1 frase:** uma "linha de produção" de engrenagens-criatura abstratas, desenhada em pixel art limpo de paleta restrita, como uma oficina de brinquedos mecânicos em miniatura.
- **Prós de produção:** sprites pequenos e baratos de gerar/iterar; grids de pixel são fáceis de reaproveitar entre raridades (trocar paleta = nova variante); leve para carregar em portais web (crítico para C01 **[E: TECHNICAL_FEASIBILITY.md linha 93, "tempo de carregamento mínimo (crítico em portais)"]**); abundância de tooling e fontes de referência de estilo gratuitas.
- **Contras de produção:** com baixa resolução, diferenciar 10+ colecionáveis raros exige disciplina de silhueta (fácil virar "tudo parecido"); animações idle (bobbing, partículas de produção) precisam de poucos frames bem desenhados ou ficam travadas.
- **Complexidade de produção:** 2/5.

#### Direção B — Vetor flat / geométrico (estilo "icon-set" animado)

- **Conceito em 1 frase:** engrenagens e criaturas-forma construídas com formas geométricas simples e cor chapada, como um painel de ícones vivos que se movem.
- **Prós de produção:** escala infinita sem perda de qualidade (bom para telas retina/diferentes tamanhos de portal e mobile); fácil gerar variantes por recombinação de formas/cores (baixo custo marginal por colecionável novo); se alinha bem com UI em Preact (pode compartilhar paleta/tokens de design entre jogo e menus).
- **Contras de produção:** risco de parecer "genérico/corporativo" se não houver um traço de personalidade forte (textura, outline, assinatura de forma); animação de squash/stretch em vetor puro exige rigging (SVG morph ou sprite-sheet gerado a partir do vetor) — mais trabalho de setup do que pixel art.
- **Complexidade de produção:** 3/5.

#### Direção C — "Cozy" pintado (ilustração digital com textura suave)

- **Conceito em 1 frase:** criaturas-engrenagem com textura pintada à mão (gradientes suaves, luz quente), como uma oficina acolhedora de brinquedos vivos.
- **Prós de produção:** maior apelo emocional/retenção em público casual 25–45 **[H: hipótese do catálogo sobre público-alvo]**; diferencia de clones "flat genérico" do gênero idle.
- **Contras de produção:** cada colecionário novo é mais caro (pintura/shading individual, menos reaproveitável por recombinação); maior risco de inconsistência visual entre peças feitas em momentos diferentes (precisa de guia de estilo rígido); pior relação custo/benefício para um MVP de 4–7 semanas-pessoa **[E: TECHNICAL_FEASIBILITY.md linha 90]**.
- **Complexidade de produção:** 4/5.

### Recomendação

**Direção A (pixel art)** para o MVP. Motivo: menor custo/hora por asset, melhor alinhamento com a meta de carregamento rápido em portais (requisito técnico explícito), e paleta restrita facilita gerar variantes de raridade (comum → lendário) via troca de cor sem redesenhar a silhueta — essencial para os "10 colecionáveis" do MVP sem explodir o orçamento de arte. A Direção C fica como possível reposicionamento de v1/v2 se a retenção pedir mais apelo emocional.

### Identidade

- **Personalidade da marca:** engenhoca charmosa — curiosa, um pouco bagunçada, nunca séria. Como uma oficina de brinquedos que ganhou vida.
- **Logo (descrito):** uma engrenagem estilizada partida ao meio formando um "loop" (símbolo de infinito simplificado), com um pequeno "olho" ou traço de personalidade em um dos dentes da engrenagem — sugere mecanismo + vida, sem usar nenhuma criatura reconhecível.
- **Tom:** leve, lúdico, sem pressão — reforça a proposta "jogável em 2 minutos ou 2 horas" do catálogo **[E: OPPORTUNITY_CATALOG.md]**.

### Paleta

| Cor | Hex | Papel |
|---|---|---|
| Âmbar quente | `#E8A33D` | Cor primária de marca, CTAs, destaque de produção ativa |
| Grafite escuro | `#2B2730` | Fundo de UI/HUD, texto sobre áreas claras |
| Creme | `#F6EFE3` | Fundo de cena/cards, texto sobre áreas escuras |
| Verde-musgo | `#5C8A5A` | Estado "sucesso"/recurso coletado |
| Vermelho-terracota | `#C25B4A` | Estado "atenção"/upgrade bloqueado |
| Azul-petróleo | `#3A6B7A` | Raridade rara/épica (colecionáveis) |

**Checagem WCAG AA (texto principal):**
- Creme `#F6EFE3` sobre Grafite `#2B2730`: contraste ≈ 13.9:1 — passa AA e AAA para texto normal e pequeno.
- Grafite `#2B2730` sobre Creme `#F6EFE3`: mesmo par, mesmo resultado (13.9:1) — passa AA/AAA.
- Texto branco sobre Âmbar `#E8A33D` (para botões): contraste ≈ 1.8:1 — **não passa AA**; usar Grafite `#2B2730` como texto sobre botões âmbar (contraste ≈ 7.7:1 — passa AA/AAA).

### Tipografia

- **Display/títulos:** "Press Start 2P" (Google Fonts, licença **OFL 1.1**) — reforça o tom pixel art sem exigir fonte proprietária.
- **Corpo/UI (números, upgrades, HUD):** "Inter" (Google Fonts, licença **OFL 1.1**) — alta legibilidade em tamanhos pequenos, essencial para números grandes de idle game.

### Interface — componentes e telas-chave

- **Componentes principais:** card de colecionável (ícone + nome + raridade por cor de borda), barra de progresso de produção, botão de upgrade (estado disponível/bloqueado/comprado), painel de prestígio (confirmação com preview de bônus).
- **Tela principal (linha de produção):** área de canvas PixiJS central com a linha de produção visível e animada; HUD superior fixo (recursos, taxa de produção); botão de upgrade flutuante inferior.
- **Tela de coleção:** grid de cards (estilo "binder" de colecionáveis), com slots vazios visíveis (incentiva completude) e filtro por raridade.
- **Tela de prestígio:** modal de confirmação com comparação "antes/depois" dos multiplicadores, para reduzir ansiedade de reset.

### Experiência do usuário

- **Feedback visual:** partículas curtas (pop) ao coletar recurso; pulso de brilho no botão de upgrade quando o jogador tem recursos suficientes; shake leve + confete de pixel ao desbloquear colecionável raro.
- **Animações:** idle loop de 2–4 frames por unidade de produção (leve, sem travar em aparelhos fracos); transição suave (fade + scale) entre telas.
- **Acessibilidade:** modo de alto contraste opcional (usa só o par Creme/Grafite); todas as ações críticas (comprar upgrade, prestígio) têm confirmação textual, não só cor (daltonismo); suporte a navegação por teclado no menu de coleção (web).

### Referências visuais (estilo, não cópia)

- https://lospec.com/pixel-art-tutorials — referência de estilo: paletas limitadas e técnica de pixel art.
- https://www.pixiljs.com/ — referência de estilo: comunidade/galeria de pixel art de pequenos sprites animados.
- https://www.reddit.com/r/PixelArt/ — referência de estilo: variedade de paletas e silhuetas em pixel art de pequeno porte.

### Assets necessários (MVP)

| Asset | Quantidade | Formato | Tamanho |
|---|---|---|---|
| Sprites de colecionáveis (idle, 3 frames) | 10 | PNG (spritesheet), pixel art | 32×32px por frame |
| Ícones de recurso/moeda | 3–4 | PNG/SVG | 24×24px |
| Ícones de upgrade (árvore de 15–20) | 15–20 | PNG/SVG | 24×24px |
| Fundo de cena (linha de produção) | 1 | PNG (tileable ou fixo) | 1 camada, até 1024×512px |
| Logo/ícone do app | 1 (+ variações de tamanho) | SVG + PNG (múltiplos tamanhos para PWA/lojas) | 512×512px base |
| Ícones de UI (botão, confirmação, fechar) | ~8 | SVG | 24×24px |

### Complexidade e horas

- **Complexidade de produção artística:** 2/5 (Direção A recomendada).
- **Estimativa de horas:** 35–55 horas de produção de arte para o MVP (10 colecionáveis + ícones + UI + logo), considerando iteração e ajuste de paleta por raridade. Compatível com o MVP de engenharia de 4–7 semanas-pessoa **[E: TECHNICAL_FEASIBILITY.md]** correndo em paralelo.

### Prompts de geração de imagem (prontos para uso futuro — nenhum provider configurado)

1. "16-bit pixel art sprite of a small whimsical clockwork creature made of gears and springs, warm amber and terracotta color palette, idle animation pose, isolated on transparent background, no text, original creature design"
2. "pixel art icon set, 24x24px, simple mechanical workshop resource icons (gear, spark, cog coin), limited warm color palette, flat shading, clean readable silhouette"
3. "pixel art background, cozy mechanical workshop production line, warm cream and dark graphite tones, tileable, no characters, side-view 2D game background"
4. "pixel art logo icon, stylized gear forming an infinity loop shape, small friendly detail suggesting life, amber and dark graphite palette, simple flat design, app icon style"
5. "pixel art rare collectible creature variant, petrol blue color scheme, glowing accent, clockwork gear creature, small sprite, transparent background"
6. "pixel art UI button set, rounded small buttons, warm amber primary and graphite secondary states, flat pixel style, game HUD icons"

---

## C07 — ReplyDraft (extensão Chrome MV3 + IA para Gmail)

Stack confirmada **[E: TECHNICAL_FEASIBILITY.md]**: extensão Chrome MV3 (content script no Gmail) + Worker proxy de LLM + painel web leve (React/Supabase). Superfícies visuais: ícone da extensão, popup/overlay dentro do Gmail, painel de configuração web.

### Direção visual

- **Conceito em 1 frase:** uma ferramenta "invisível até precisar" — interface mínima, neutra, que se parece com uma extensão profissional do Google Workspace, não com um app de IA chamativo.
- **Descrição:** linguagem visual de produtividade B2B discreta — cantos levemente arredondados, poucos elementos, hierarquia tipográfica clara. A IA aparece como um "assistente de rascunho", não como personagem ou mascote (evita infantilizar uma ferramenta de trabalho).

### Identidade

- **Personalidade da marca:** eficiente, confiável, discreta — "fica fora do caminho" até o momento de gerar o rascunho.
- **Logo (descrito):** um ícone de balão de resposta (reply arrow) com um pequeno traço de "caneta/lápis" sobreposto, sugerindo rascunho assistido sem usar símbolos de IA genéricos (estrela/cintilação) já saturados por outras ferramentas.
- **Tom:** profissional, direto, sem jargão técnico — o usuário-alvo é dono de e-commerce pequeno ou freelancer de atendimento **[E: OPPORTUNITY_CATALOG.md]**, não um desenvolvedor.

### Paleta

| Cor | Hex | Papel |
|---|---|---|
| Azul-petróleo | `#1D4E5F` | Cor primária de marca, ícone, header do painel |
| Branco-gelo | `#FAFAF8` | Fundo principal do painel/overlay |
| Cinza-grafite | `#2E2E33` | Texto principal |
| Verde-ação | `#3C8A5B` | Botão "inserir rascunho" / confirmação |
| Cinza-neutro | `#8A8A92` | Texto secundário, placeholders |
| Laranja-alerta | `#D97B3D` | Aviso de cota/limite de plano |

**Checagem WCAG AA (texto principal):**
- Cinza-grafite `#2E2E33` sobre Branco-gelo `#FAFAF8`: contraste ≈ 12.6:1 — passa AA/AAA.
- Branco-gelo `#FAFAF8` sobre Azul-petróleo `#1D4E5F` (header): contraste ≈ 7.1:1 — passa AA/AAA.
- Branco sobre Verde-ação `#3C8A5B` (botão): contraste ≈ 2.9:1 — **não passa AA** para texto normal; usar texto branco apenas em tamanho ≥24px bold (contraste mínimo AA large text é 3:1, ainda marginal) — recomendado escurecer para `#2F6E48` (contraste ≈ 4.1:1, passa AA) ou usar texto escuro `#1A2E20` sobre o verde atual.

### Tipografia

- **UI/painel:** "Inter" (Google Fonts, licença **OFL 1.1**) — padrão de legibilidade para interfaces densas de produtividade.
- **Monoespaçada (trechos de e-mail/preview, se necessário):** "JetBrains Mono" (licença **OFL 1.1**, disponível no Google Fonts) — opcional, só se houver preview de texto bruto.

### Interface — componentes e telas-chave

- **Ícone da extensão (barra do Chrome):** estado padrão (neutro) e estado "pronto" (indicador de rascunho disponível) — mudança sutil de cor, não animação chamativa.
- **Overlay dentro do Gmail:** botão "Gerar rascunho" inserido perto do botão de resposta nativo, com popover de preview do rascunho (editável inline antes de inserir) — deve respeitar a hierarquia visual do Gmail para não parecer invasivo.
- **Painel web de configuração (React):** lista de "tons de voz" salvos, histórico de uso/cota do mês, tela de billing (Stripe Checkout). Layout em coluna única, sidebar simples.
- **Componente-chave:** card de "tom de voz" (nome + exemplo + botão editar/excluir).

### Experiência do usuário

- **Feedback visual:** spinner discreto (3 pontos, sem logo animado) durante geração do rascunho (latência de API); confirmação visual breve (check verde) ao inserir o rascunho na caixa de composição; aviso visual claro (laranja) ao se aproximar do limite de cota mensal.
- **Animações:** transições rápidas (150–200ms), sem bounce/elastic — reforça a percepção de ferramenta profissional e rápida.
- **Acessibilidade:** todo texto do overlay respeita contraste AA (ver acima); overlay não deve capturar foco do teclado de forma que trave a navegação do Gmail; rascunho inserido como **texto puro** (requisito técnico de segurança já definido em TECHNICAL_FEASIBILITY.md, linha 260 — evita XSS e também evita herdar formatação inacessível).

### Referências visuais (estilo, não cópia)

- https://www.figma.com/community/tag/chrome%20extension — referência de estilo: layouts de extensões de produtividade discretas.
- https://ui.shadcn.com/ — referência de estilo: componentes de UI minimalistas para painéis B2B (botões, cards, forms).
- https://material.io/design — referência de estilo (princípios gerais, não cópia de ícones específicos): hierarquia e espaçamento em interfaces de produtividade.

### Assets necessários (MVP)

| Asset | Quantidade | Formato | Tamanho |
|---|---|---|---|
| Ícone da extensão (estados: padrão/ativo) | 2 variações | PNG/SVG (múltiplos tamanhos exigidos pela Chrome Web Store) | 16, 32, 48, 128px |
| Logo (painel web + marketing) | 1 (+ variações) | SVG + PNG | 512×512px base |
| Ícones de UI (editar, excluir, copiar, cota) | ~6 | SVG | 20×20px |
| Ilustração vazia/onboarding (painel sem tons de voz ainda) | 1 | SVG (flat, sem personagem) | até 400×300px |
| Favicon do painel web | 1 | ICO/PNG | 32×32px |

### Complexidade e horas

- **Complexidade de produção artística:** 1/5 (é majoritariamente design de UI/componentes, não ilustração).
- **Estimativa de horas:** 10–16 horas (ícone de extensão em múltiplos tamanhos + kit de componentes de UI + logo + 1 ilustração de onboarding). Compatível com o MVP de engenharia de 2–4 semanas-pessoa **[E: TECHNICAL_FEASIBILITY.md]** — arte não é caminho crítico aqui.

### Prompts de geração de imagem (prontos para uso futuro — nenhum provider configurado)

1. "minimal flat vector icon, reply arrow combined with a small pencil stroke, petrol blue color, simple line work, browser extension icon style, no text, transparent background"
2. "flat vector illustration, empty state for a productivity dashboard, simple desk and envelope shapes, muted petrol blue and ice white palette, no characters, clean B2B SaaS style"
3. "set of minimal line icons for a productivity web panel: edit pencil, trash, copy, usage gauge, consistent 20px grid, petrol blue and neutral gray, flat style"
4. "flat vector app icon, rounded square background, reply arrow and pencil mark symbol, petrol blue on ice white, Chrome extension icon aesthetic, no gradients, no text"
5. "simple flat vector illustration of a tone-of-voice card concept, abstract speech bubble with a small waveform line, muted professional color palette, SaaS onboarding style"

---

## C06 — StatusPing (micro-SaaS de monitoramento de uptime + status page)

Stack confirmada **[E: TECHNICAL_FEASIBILITY.md]**: Cloudflare Workers + D1 + Queues (bloco Edge) + painel React SPA. Superfícies visuais: painel de monitoramento (dashboard), status pages públicas geradas por Worker, e-mails de alerta.

### Direção visual

- **Conceito em 1 frase:** clareza instantânea de "está tudo bem ou não" — interface de dashboard técnico com estados de cor inequívocos, pensada para ser lida em 2 segundos durante um incidente.
- **Descrição:** linguagem visual de "painel de controle" — fundo neutro, uso de cor reservado quase exclusivamente para status (verde/vermelho/amarelo), tipografia monoespaçada para timestamps/latência (reforça precisão técnica).

### Identidade

- **Personalidade da marca:** direta, confiável, sem ruído visual — o produto vende confiança operacional, então a própria UI não pode parecer "cheia" ou amadora.
- **Logo (descrito):** um sinal de pulso (linha de ECG/heartbeat estilizada) formando um pequeno "ping" circular na ponta — comunica monitoramento contínuo sem copiar o símbolo de nenhum concorrente estabelecido de uptime.
- **Tom:** técnico mas acessível — o público é indie hacker/pequena agência **[E: OPPORTUNITY_CATALOG.md]**, não um time de SRE enterprise; evitar jargão de observabilidade pesado na UI (ex. preferir "Fora do ar" a "Degraded SLO").

### Paleta

| Cor | Hex | Papel |
|---|---|---|
| Azul-escuro | `#1A2234` | Cor primária de marca, header, fundo de dashboard (modo claro usa como texto/acento) |
| Branco-neutro | `#F7F8FA` | Fundo principal do dashboard (modo claro) |
| Verde-status | `#2E9E5B` | Monitor operacional ("up") |
| Vermelho-status | `#D9453D` | Monitor fora do ar ("down") |
| Âmbar-status | `#E0A52E` | Degradação/latência alta |
| Cinza-texto | `#4A4F5C` | Texto secundário, labels, timestamps |

**Checagem WCAG AA (texto principal):**
- Azul-escuro `#1A2234` sobre Branco-neutro `#F7F8FA`: contraste ≈ 14.8:1 — passa AA/AAA.
- Branco sobre Verde-status `#2E9E5B` (badge "up"): contraste ≈ 2.4:1 — **não passa AA** para texto; usar texto escuro `#0F2E1C` sobre o badge verde (contraste ≈ 6.9:1, passa AA) ou aumentar o verde de saturação reduzida para `#1F7A43` com texto branco (contraste ≈ 4.6:1, passa AA).
- Branco sobre Vermelho-status `#D9453D` (badge "down"): contraste ≈ 3.8:1 — marginal, passa AA só para texto grande (≥18.66px bold); para texto normal, usar `#B23128` (contraste ≈ 4.9:1, passa AA) ou texto escuro sobre o vermelho atual.

### Tipografia

- **UI/dashboard (labels, headers):** "Inter" (Google Fonts, licença **OFL 1.1**).
- **Dados técnicos (timestamps, latência, uptime %, status page):** "JetBrains Mono" (Google Fonts, licença **OFL 1.1**) — reforça precisão e facilita leitura de números alinhados em coluna.

### Interface — componentes e telas-chave

- **Componentes principais:** card de monitor (nome, status badge, uptime % últimos 30 dias, sparkline de latência), timeline de incidentes (barra horizontal com blocos coloridos por período), toggle de canal de alerta (e-mail/webhook).
- **Dashboard principal:** grid de cards de monitor (1–10 no MVP), ordenados por status (down primeiro); barra superior com resumo geral ("9/10 operacionais").
- **Status page pública:** página minimalista com logo do cliente (customizável), lista de serviços com status atual, histórico de incidentes recentes, timestamp de "última verificação".
- **Tela de criação de monitor:** form simples (URL, intervalo, canal de alerta) com preview do badge de status antes de salvar.

### Experiência do usuário

- **Feedback visual:** badge de status pulsa sutilmente por 2–3 segundos quando muda de estado (chama atenção sem ser intrusivo); sparkline de latência anima o traçado ao carregar; e-mail de alerta usa o mesmo sistema de cor/badge do dashboard para consistência.
- **Animações:** mínimas e funcionais — nenhuma decoração que distraia durante um incidente real; transição de estado do badge (verde→vermelho) com fade de 300ms, não instantânea (evita leitura de "flicker" como bug visual).
- **Acessibilidade:** status nunca é comunicado só por cor — sempre acompanhado de ícone (check/x/triângulo) e texto ("Operacional"/"Fora do ar"/"Degradado"), essencial para daltonismo em um produto onde a leitura correta de status é crítica; status page pública testada em contraste AA por ser conteúdo voltado ao público externo do cliente.

### Referências visuais (estilo, não cópia)

- https://ui.shadcn.com/ — referência de estilo: componentes de dashboard técnico (cards, badges, tabelas).
- https://www.figma.com/community/tag/dashboard — referência de estilo: layouts de dashboards de monitoramento/analytics.
- https://tailwindui.com/components/application-ui/data-display/stats — referência de estilo: composição de cards de métricas e status.

### Assets necessários (MVP)

| Asset | Quantidade | Formato | Tamanho |
|---|---|---|---|
| Logo (dashboard + status page + marketing) | 1 (+ variações) | SVG + PNG | 512×512px base |
| Ícones de status (up/down/degraded) | 3 | SVG | 20×20px |
| Ícones de UI (webhook, e-mail, sino de alerta, configurações) | ~6 | SVG | 20×20px |
| Favicon | 1 | ICO/PNG | 32×32px |
| Ilustração vazia (nenhum monitor cadastrado ainda) | 1 | SVG (flat, sem personagem) | até 400×300px |
| Template visual de e-mail de alerta (header + badges) | 1 | HTML/CSS (assets SVG embutidos) | largura 600px |

### Complexidade e horas

- **Complexidade de produção artística:** 1/5 (design de dashboard/sistema de UI, sem ilustração pesada).
- **Estimativa de horas:** 12–18 horas (logo + sistema de badges/ícones + layout de status page + template de e-mail). Compatível com o MVP de engenharia de 2–4 semanas-pessoa **[E: TECHNICAL_FEASIBILITY.md]** — arte não é caminho crítico.

### Prompts de geração de imagem (prontos para uso futuro — nenhum provider configurado)

1. "minimal flat vector logo, stylized heartbeat pulse line forming a small circular ping shape at the end, dark navy blue color, clean monitoring dashboard brand icon, no text, transparent background"
2. "flat vector icon set for a status monitoring dashboard: checkmark circle, x circle, warning triangle, bell, webhook plug, consistent 20px grid, green red amber neutral palette, minimal line style"
3. "flat vector illustration, empty state for an uptime monitoring dashboard, simple server and signal wave shapes, muted navy and white palette, no characters, clean SaaS style"
4. "flat vector app favicon, rounded square, small pulse ping icon, dark navy on white background, minimal monitoring tool aesthetic, no gradients, no text"
5. "minimal flat vector email header illustration, simple status badge icons row (green up, red down, amber warning), clean corporate monitoring tool style, white background"
6. "flat vector icon, sparkline chart with a small pulse shape, dark navy line on light background, minimal dashboard data visualization icon, no text"

---

## Observações finais / limitações

- Nenhuma imagem foi gerada e nenhum provider de geração de imagem foi configurado ou contratado — os prompts acima são preparação para uso futuro, condicionada à aprovação do fundador antes de qualquer contratação de serviço pago.
- As checagens de contraste WCAG AA acima foram calculadas por fórmula de luminância relativa padrão (WCAG 2.x), não verificadas por ferramenta externa nesta sessão — tratar como **[H]** até confirmação com um checador de contraste antes da implementação final.
- Nomes de produto ("Loopwright", "ReplyDraft", "StatusPing") são provisórios e ainda não passaram por checagem de colisão de marca/trademark em tempo real **[H: herdado de OPPORTUNITY_CATALOG.md]** — qualquer logo final só deve ser produzido após essa checagem.
- Para C01, as Direções B e C não foram descartadas definitivamente: ficam registradas como opção de reposicionamento para v1/v2 caso dados de retenção real indiquem que o público reage melhor a um visual mais "cozy" ou mais "clean/vetorial".
- Esta proposta não inclui wireframes de alta fidelidade nem protótipos clicáveis — é um guia de direção visual e sistema (paleta, tipografia, componentes-chave) para orientar a próxima fase de produção de arte e UI.
