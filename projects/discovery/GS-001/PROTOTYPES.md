# GS-001 — Prototipagem Conceitual dos 3 Finalistas (Task 5)

> Marcação: **[E]** evidência (fonte + data) · **[H]** hipótese não verificada.
>
> **Entradas:** `OPPORTUNITY_CATALOG.md` (game-design, 2026-11-08), `TECHNICAL_FEASIBILITY.md` (game-dev, 2026-11-08), `FINAL_RANKING.md` (game-studio, 2026-11-08). Templates de apoio: `shared/templates/GDD.md`, `shared/templates/PRD.md`.
> **Nota metodológica [E]:** a busca web esteve indisponível (429) durante a produção do catálogo e da pesquisa de mercado; isso é herdado aqui. Toda jornada de usuário, wireframe e decisão de UX abaixo é um **protótipo conceitual [H]** — não testado com usuários reais. Nenhum nome, personagem ou arte de produto existente foi usado.

- **Projeto:** GS-001
- **Autor (agente):** game-design
- **Data:** 2026-11-08
- **Status:** rascunho

---

# 1. C01 — Loopwright (jogo idle + coleção)

## 1.1 Descrição do produto

Loopwright é um jogo idle web (PWA, depois mobile) ambientado numa oficina de relojoaria mecânica abandonada: o jogador assume o papel de um "Wright" (artífice) que recupera e organiza uma linha de produção de engrenagens automatizada, otimizando o layout de estações para gerar "Engrenagens" mesmo offline, enquanto coleciona 10 Autômatos de Bronze que concedem sinergias de produção. O jogo é jogável em sessões de 2 minutos (checar progresso, comprar upgrade) ou de 2 horas (reorganizar a linha, perseguir o próximo prestígio), sem pressão competitiva direta entre jogadores — apenas um ranking assíncrono opcional.

## 1.2 Jornada do usuário

**Primeiros 5 minutos:**
1. Tela de título → toque único "Começar" (sem conta, sem tutorial de texto longo).
2. Oficina vazia com 1 estação piscando → toque na estação → ela começa a produzir Engrenagens visivelmente (partícula + contador subindo).
3. Primeiro upgrade fica disponível em ~20s de produção → toque → animação de "nível 2" na estação, produção visivelmente mais rápida.
4. Por volta do minuto 3–4, o jogo introduz a 2ª estação (compra, não desbloqueio gratuito) e, em paralelo, revela o primeiro slot de coleção vazio com um "?" — cria curiosidade sem exigir ação ainda.
5. Ao fechar a aba/app, um toast explica: "A oficina continua trabalhando enquanto você não está aqui."

**Dia 1 (sessões subsequentes no mesmo dia):**
- Jogador volta, vê popup de "progresso offline" com quantidade de Engrenagens acumuladas (até o teto de 8h) → sensação de recompensa por voltar.
- Compra 3–5 upgrades, desbloqueia a 3ª estação, ganha o primeiro Autômato comum (drop por marco de produção total, não aleatório puro — reduz frustração).
- Ad recompensado aparece como *oferta opcional* (dobrar progresso offline), não como interrupção forçada.

**Semana 1:**
- Jogador completa a árvore de upgrades da 1ª linha, desbloqueia 2ª linha de produção.
- Acumula 4–6 dos 10 Autômatos, entende a mecânica de sinergia (combinar Autômatos de um mesmo "conjunto" dá bônus extra).
- Atinge o primeiro Prestígio (meta de pacing: 45–90 min de jogo ativo+idle somado, ver §1.9) — tela de reset com multiplicador permanente explicado em 1 frase + confirmação explícita (não é acidental).
- Reabre o jogo pós-prestígio e sente a produção inicial mais rápida que no dia 1 → motivo para continuar.

## 1.3 MVP — MoSCoW

| Prioridade | Item |
|---|---|
| **Must** | 1 linha de produção com 3 estações; 15–20 upgrades (custo exponencial); 10 colecionáveis com drop por marco; 1 ciclo de prestígio completo; progresso offline com teto de 8h; save local (IndexedDB) |
| **Must** | Onboarding sem texto (aprender por toque, não por tutorial escrito) |
| **Should** | Sync de save em nuvem (Worker + D1) para não perder progresso ao trocar de aparelho |
| **Should** | Anúncio recompensado opcional para dobrar progresso offline |
| **Could** | Leaderboard assíncrono simples (total de Engrenagens histórico) |
| **Could** | 2ª linha de produção (pode entrar no MVP se o tempo permitir; senão vai para v1) |
| **Won't (MVP)** | Multiplayer/guildas, eventos sazonais, loja cosmética expandida, múltiplos biomas/temas visuais, battle pass |

## 1.4 Wireframe textual (ASCII)

```
TELA: OFICINA (principal)
┌─────────────────────────────────────────────┐
│ ⚙ 12.450 Engrenagens        [≡ menu] [👤]    │
├─────────────────────────────────────────────┤
│                                               │
│   [Estação 1]   [Estação 2]   [Estação 3]    │
│    nível 4        nível 2        bloqueada    │
│   +12/s           +5/s           (comprar)    │
│      ⚙⚙⚙            ⚙⚙              🔒        │
│                                               │
├─────────────────────────────────────────────┤
│ [▲ Upgrades]   [◆ Coleção: 4/10]  [★ Prestígio]│
└─────────────────────────────────────────────┘

TELA: UPGRADES (painel deslizante sobre a Oficina)
┌─────────────────────────────────────────────┐
│ ← Upgrades da Estação 1                      │
│  Nível 4 → 5      custo: 1.847 ⚙   [Comprar] │
│  Nível 4 → 10 (x6) custo: 14.230 ⚙ [Comprar] │
│  Barra de progresso até o próximo upgrade    │
└─────────────────────────────────────────────┘

TELA: COLEÇÃO
┌─────────────────────────────────────────────┐
│ ← Autômatos de Bronze          4/10          │
│  [Tic-Tak]  [Engrenor]  [Ponteiro]  [?]      │
│  [?]        [?]         [?]        [?]  [?]  │
│  Toque num autômato coletado → ficha com      │
│  bônus de sinergia e lore de 2 linhas         │
└─────────────────────────────────────────────┘

TELA: PRESTÍGIO (ao atingir meta)
┌─────────────────────────────────────────────┐
│        ★ Reiniciar a Oficina?                │
│  Você ganhará +15% de produção permanente     │
│  (Essência Eterna: 3)                         │
│  Perderá: estações, upgrades, engrenagens     │
│  Manterá: coleção de Autômatos                │
│       [Cancelar]        [Confirmar]           │
└─────────────────────────────────────────────┘
```

## 1.5 Estrutura de telas (mapa de navegação)

```
Título ──(toque)──▶ Oficina (hub principal)
                       │
        ┌──────────────┼──────────────┬───────────────┐
        ▼              ▼              ▼               ▼
   Upgrades        Coleção        Prestígio        Menu (≡)
  (painel sobre   (grade 2x5,   (modal de       (config, perfil,
   a Oficina)      ficha por     confirmação)     restaurar compra,
                   item)                           política de privac.)
```
Nenhuma tela é mais do que 1 toque de distância da Oficina — crítico para o ritmo "checar em 2 minutos".

## 1.6 Fluxo principal (passo a passo)

1. Jogador abre o app → tick de produção offline calculado e exibido em popup.
2. Toque na Oficina → engrenagens acumuladas em tempo real (tick visual a cada ~0,5s).
3. Ao acumular saldo suficiente, botão de upgrade de uma estação fica destacado (affordance visual, sem precisar abrir menu).
4. Jogador compra upgrade → produção/s sobe → feedback imediato (número e partícula).
5. A cada N marcos de produção total, um Autômato é revelado na Coleção (notificação discreta, sem travar o jogo).
6. Quando a meta de prestígio é atingível, o botão "★ Prestígio" pulsa → jogador abre, vê o ganho, confirma ou cancela.
7. Pós-prestígio, volta ao passo 2 com multiplicador permanente aplicado.

## 1.7 Arquitetura inicial (resumo do TF + ajustes de design)

Conforme `TECHNICAL_FEASIBILITY.md` (C01): Vite + TypeScript + PixiJS (render) + Preact (UI) como PWA; simulação core em TS puro (tick + cálculo offline com `Δt × taxa` e teto); save local em IndexedDB; sync opcional via Worker + D1; anúncios via SDK do portal (CrazyGames/Poki) ou AdMob na v1 mobile.

**Ajuste de design sobre o TF:** o TF já prevê "números grandes com `break_infinity.js` ou similar **[H]**" — confirmo essa necessidade a partir do design: como o custo de upgrade cresce geometricamente (1,15^n) e o jogo é pensado para múltiplos prestígios, números ultrapassam `Number.MAX_SAFE_INTEGER` rapidamente após 2–3 prestígios. **Recomendo fixar isso como requisito do MVP, não de uma v1 futura**, porque trocar o tipo numérico depois do lançamento exige migração de saves salvos. Nenhuma outra mudança de arquitetura é necessária — o design do MVP cabe inteiramente no que o game-dev já desenhou.

## 1.8 Monetização integrada à experiência

- **Anúncio recompensado (opcional, não forçado):** aparece apenas no popup de "progresso offline" como botão "Dobrar (assistir anúncio)" — o jogador já ganhou algo, o anúncio é upside, nunca bloqueio. Ponto de contato: toda vez que o app é reaberto após ausência.
- **IAP cosmético (pós-MVP/v1):** skins visuais para as estações (não afetam produção) — vendidas na tela de Coleção/Menu, nunca interrompem o loop.
- **Pacote de conveniência (v1):** "acelerar upgrade em andamento" — vendido no momento exato em que o jogador está olhando para uma barra de progresso longa (contextual, não um banner genérico).
- **Sem paywall de progressão dura no MVP:** nada que bloqueie o core loop por pagamento — consistente com o diferencial "otimização, não power-creep" do catálogo.

## 1.9 Mini-GDD do MVP

### Core loop numérico

- **Produção por estação:** `produção/s = base_produção × nível × multiplicador_coleção`
  - `base_produção` por estação: Estação 1 = 1/s, Estação 2 = 4/s, Estação 3 = 15/s (cada estação nova é ~4x mais "densa" para justificar o custo de desbloqueio).
- **Custo de upgrade (geométrico padrão do gênero):** `custo(n) = custo_base × 1,15^n`, onde `n` = nível atual da estação.
  - Estação 1: `custo_base = 10`. Nível 10 → `10 × 1,15^10 ≈ 40,5` Engrenagens. Nível 30 → `10 × 1,15^30 ≈ 662`.
- **Custo de desbloqueio de nova estação:** `custo_desbloqueio = 20 × custo_base_anterior × 8` (sempre um salto visível, ~8x o custo do upgrade mais caro da estação anterior no momento típico de desbloqueio).
- **Multiplicador de coleção:** cada Autômato coletado soma +5% (comuns), +12% (raros) ou +25% (épicos) à produção total; completar um "conjunto" de 3 dá +10% adicional (sinergia).

### Prestígio

- **Condição:** disponível ao atingir `total_engrenagens_geradas ≥ 50.000` (meta MVP calibrada para a faixa de 45–90 min, ver tabela de pacing).
- **Recompensa:** `Essência Eterna ganha = floor(sqrt(total_engrenagens_geradas / 10.000))`. Em 50.000 → `floor(sqrt(5)) = 2` Essências.
- **Efeito permanente:** `multiplicador_prestígio = 1 + (Essência_total × 0,05)` (cada Essência = +5% de produção para sempre, acumulado entre prestígios).
- **O que reseta:** nível das estações, engrenagens, estações desbloqueadas. **O que persiste:** coleção de Autômatos, Essência Eterna total, estatísticas históricas.

### 10 colecionáveis originais — "Autômatos de Bronze"

Tema: relojoaria mecânica/steampunk abandonado. Nenhuma referência a franquias existentes.

| # | Nome | Raridade | Conjunto | Bônus |
|---|------|----------|----------|-------|
| 1 | Tic-Tak, o Primeiro | Comum | Guardiões do Tique | +5% produção |
| 2 | Engrenor | Comum | Guardiões do Tique | +5% produção |
| 3 | Ponteiro Veloz | Comum | Guardiões do Tique | +5% produção (+10% ao completar o conjunto) |
| 4 | Mola Dourada | Raro | Corações de Latão | +12% produção |
| 5 | Guardião de Bronze | Raro | Corações de Latão | +12% produção |
| 6 | Relojeiro Sombrio | Raro | Corações de Latão | +12% produção (+10% ao completar o conjunto) |
| 7 | Cristal-Pêndulo | Épico | Ordem das Horas | +25% produção |
| 8 | Fênix de Cobre | Épico | Ordem das Horas | +25% produção |
| 9 | Oráculo das Horas | Épico | Ordem das Horas | +25% produção (+10% ao completar o conjunto) |
| 10 | Coração do Tempo | Lendário (prêmio do 1º prestígio) | — | +50% produção, não depende de conjunto |

### Tabela de pacing (meta: 1º prestígio em 45–90 min)

| Marco | Engrenagens acumuladas (aprox.) | Tempo estimado (ativo + idle) **[H]** |
|---|---|---|
| Início | 0 | 0 min |
| Estação 2 desbloqueada | ~300 | 3–5 min |
| 1º Autômato coletado | ~1.000 | 8–12 min |
| Estação 3 desbloqueada | ~4.000 | 20–30 min |
| 3º Autômato (1º conjunto completo) | ~15.000 | 35–55 min |
| **Prestígio disponível (meta)** | **50.000** | **45–90 min** |

**Nota [H]:** esta tabela é uma estimativa de design baseada nas fórmulas acima, não testada com jogadores reais. O spike recomendado pelo game-dev em `TECHNICAL_FEASIBILITY.md` §5 ("simulador headless da curva de progressão, 2–3 dias") é o próximo passo obrigatório antes de travar esses números — o protótipo HTML descartável desta entrega (ver §4) serve só para sentir a cadência de clique/espera, não para validar o pacing final.

---

# 2. C07 — ReplyDraft (extensão Chrome + IA para Gmail)

## 2.1 Descrição do produto

ReplyDraft é uma extensão Chrome que adiciona um botão "Gerar rascunho" dentro do Gmail web: ao abrir um e-mail, o usuário toca o botão e recebe um rascunho de resposta gerado por IA que já incorpora o histórico da conversa e um "tom de voz" configurável da marca/pessoa, editável antes de enviar — sem exigir login em outra ferramenta, sem trocar de aba, sem conceder escopos sensíveis da API do Gmail.

## 2.2 Jornada do usuário

**Primeiros 5 minutos:**
1. Instala a extensão na Chrome Web Store → ícone aparece na barra.
2. Abre o Gmail → popup de boas-vindas de 1 tela: "Escolha seu tom de voz" (3 exemplos pré-prontos: formal, casual, direto) ou cola um exemplo próprio de 2–3 frases.
3. Abre um e-mail recebido → botão flutuante "✦ Gerar rascunho" aparece perto do botão "Responder" nativo do Gmail.
4. Toca → rascunho aparece na caixa de composição em texto puro, editável, com aviso discreto "gerado por IA — revise antes de enviar".
5. Edita 1–2 palavras e envia pelo fluxo normal do Gmail (ReplyDraft nunca envia nada por conta própria).

**Dia 1:**
- Usuário repete o fluxo em 3–5 e-mails diferentes, percebendo que o rascunho usa o tom escolhido e referencia detalhes da thread.
- Ajusta o tom de voz na configuração da extensão depois de um rascunho "errado" — loop rápido de correção.

**Semana 1:**
- Atinge o limite do plano grátis (ex.: 20 rascunhos/mês) e vê um prompt claro de upgrade, não um bloqueio surpresa.
- Adiciona um segundo exemplo de tom (ex.: "respostas de reclamação" vs "respostas de orçamento") e nota que o rascunho muda de acordo com o tipo de e-mail recebido.
- Se assina o plano pago, ganha acesso ao "modo qualidade" (Sonnet 5) para e-mails sensíveis, escolhido manualmente por e-mail (não automático, para controlar custo).

## 2.3 MVP — MoSCoW

| Prioridade | Item |
|---|---|
| **Must** | Content script no Gmail (ler thread aberta, inserir texto puro no compose) |
| **Must** | 1 exemplo de tom de voz configurável; geração via proxy Worker + Haiku 5.5 |
| **Must** | Edição manual antes de enviar (nunca envio automático) |
| **Must** | Autenticação + cota por usuário (Supabase + billing simples) |
| **Should** | Biblioteca com múltiplos exemplos de tom (não só 1) |
| **Should** | Indicador visual de cota restante no mês |
| **Could** | "Modo qualidade" (Sonnet 5) selecionável manualmente |
| **Could** | Histórico de rascunhos aprovados (para refinar o prompt, não fine-tune de modelo) |
| **Won't (MVP)** | Multicanal (chat/reviews), multilíngue automático, times multiusuário, Gmail API oficial |

## 2.4 Wireframe textual (ASCII)

```
TELA: GMAIL (com a extensão ativa) — dentro do e-mail aberto
┌─────────────────────────────────────────────┐
│ De: cliente@exemplo.com   Assunto: Orçamento │
│ "Olá, gostaria de saber o prazo..."          │
│                                               │
│  [Responder] [Responder a todos] [✦ Rascunho]│ ← botão da extensão
├─────────────────────────────────────────────┤
│ (caixa de composição do Gmail, nativa)       │
│ "Olá! O prazo médio é de 5 dias úteis..."    │
│ ⚠ Gerado por IA — revise antes de enviar      │
│                        [Descartar] [Enviar]  │
└─────────────────────────────────────────────┘

TELA: POPUP DA EXTENSÃO (ícone na barra)
┌───────────────────────────────┐
│ ReplyDraft                     │
│ Rascunhos este mês: 14/20      │
│ [Gerenciar tom de voz]         │
│ [Ver plano / assinar]          │
└───────────────────────────────┘

TELA: CONFIGURAÇÃO DE TOM DE VOZ (aba própria)
┌─────────────────────────────────────────────┐
│ ← Tons de voz                                │
│  [Padrão ✓]  [Reclamação]  [+ Novo tom]      │
│  Cole 2-3 exemplos de respostas que você já   │
│  enviou e que representam seu estilo:         │
│  ┌─────────────────────────────────────────┐ │
│  │ (textarea)                               │ │
│  └─────────────────────────────────────────┘ │
│                         [Salvar tom]          │
└─────────────────────────────────────────────┘
```

## 2.5 Estrutura de telas (mapa de navegação)

```
Instalação (Chrome Web Store)
        │
        ▼
Onboarding (1 tela, dentro do Gmail) ──▶ Gmail + botão flutuante (uso diário)
        │                                        │
        ▼                                        ▼
  Popup da extensão (ícone) ──▶ Config. de tom de voz
        │
        ▼
  Tela de plano/assinatura (Stripe Checkout, fora da extensão)
```

## 2.6 Fluxo principal (passo a passo)

1. Usuário abre e-mail no Gmail → content script detecta a thread.
2. Toque em "✦ Gerar rascunho" → service worker da extensão pega JWT do usuário e chama o Worker proxy.
3. Worker busca o tom de voz e a cota do usuário no Supabase, monta o prompt (thread + tom) e chama a API da Anthropic (Haiku 5.5 por padrão).
4. Resposta volta como texto puro → extensão insere na caixa de composição nativa do Gmail (nunca HTML, para evitar XSS).
5. Usuário edita e envia pelo próprio Gmail — ReplyDraft não tem acesso de envio.
6. Cota é decrementada no Supabase; ao atingir o limite, próxima tentativa mostra prompt de upgrade em vez de rascunho.

## 2.7 Arquitetura inicial (resumo do TF)

Conforme `TECHNICAL_FEASIBILITY.md` (C07): extensão Chrome MV3 (TS) com content script que lê o DOM do Gmail aberto (evitando a Gmail API e sua exigência de auditoria CASA anual); Worker como proxy de LLM (chave do lado do servidor, nunca na extensão); Supabase para auth/perfis de tom/cota; Stripe para billing; Haiku 5.5 como padrão, Sonnet 5 como modo qualidade opcional. **Nenhum ajuste de arquitetura necessário a partir do design** — o fluxo de UX descrito acima (botão flutuante + inserção em texto puro) é exatamente o que o TF já previu como spike prioritário (§5 do TF: "content script no Gmail", 1–2 dias).

## 2.8 Monetização integrada à experiência

- **Cota mensal visível:** o contador "14/20" no popup da extensão é sempre visível — sem surpresa no momento do bloqueio.
- **Paywall contextual, não interruptivo:** ao esgotar a cota, o botão "✦ Gerar rascunho" continua visível mas, ao tocar, abre um modal de upgrade em vez do rascunho — o usuário nunca perde a ação que estava tentando fazer, só é redirecionado para completá-la via assinatura.
- **Upsell de "modo qualidade" (Sonnet 5) no ponto de maior ansiedade:** ao abrir um e-mail marcado como importante/com muitas trocas na thread, oferecer a opção manual "gerar com qualidade superior" — cobra mais por rascunho, cobrado dentro do plano superior, nunca por clique isolado para não criar fricção de microtransação.
- **Sem anúncios:** modelo é 100% assinatura, consistente com o catálogo e com o público B2B/prosumer.

## 2.9 Resposta ao risco "o Gmail já tem rascunhos com Gemini"

O `FINAL_RANKING.md` aponta este como o maior risco de diferenciação do C07 (nota Dif = 8, descrita como "risco grande"). A resposta de design é que o Gemini do Gmail resolve um problema diferente do que o ReplyDraft resolve:

1. **Tom de voz persistente e explícito, não "inferido" por sessão.** O Gemini do Gmail gera num tom genérico ajustável por slider (ex.: formal/casual) a cada rascunho; o ReplyDraft guarda **exemplos reais do próprio usuário** (textos que ele já escreveu) como referência estável, reutilizada em toda resposta, sem precisar reconfigurar. O diferencial concreto de UX: configura-se o tom **uma vez**, e ele persiste — o concorrente pede ajuste a cada uso ou aceita o tom padrão do Google.
2. **Múltiplos tons por contexto de e-mail, não um tom único por conta.** O catálogo já previa isso como "biblioteca de tom de voz configurável" — na prática de UX, o usuário pode ter um tom para "reclamação" e outro para "orçamento" dentro da mesma caixa, algo que a ferramenta nativa do Google não expõe como conceito de produto (ela não distingue "qual é o seu papel neste e-mail específico").
3. **Produto para quem não tem (ou não quer) Gmail com Gemini incluso.** Parte do público-alvo (pequenos negócios com contas Workspace básicas, ou que usam Gmail pessoal/G Suite legado) não tem o recurso de IA do Gmail disponível no seu plano **[H — não verificado por busca ao vivo]**; o ReplyDraft funciona independente do plano do Google.
4. **Foco de produto em vez de recurso genérico:** o Gemini do Gmail é um recurso dentro de um produto de e-mail geral; o ReplyDraft é construído inteiramente em torno de "responder rápido e no seu tom" — isso se traduz em UX em detalhes que um recurso genérico não prioriza (ex.: histórico de rascunhos aprovados para refinar o prompt ao longo do tempo, cota visível pensada para controle de custo de um pequeno negócio).

**Avaliação honesta [H]:** os pontos 1 e 2 são os únicos defensáveis de forma durável — são diferenças de **produto**, não de modelo de IA, e sobrevivem mesmo se o Google melhorar o Gemini do Gmail. O ponto 3 é temporário (pode desaparecer se o Google expandir o acesso). Recomendo validar o ponto 1 (tom persistente por exemplos reais) como o pitch central da extensão antes de investir no MVP — é a única alegação que não depende de uma lacuna temporária do concorrente.

---

# 3. C06 — StatusPing (uptime + status page)

## 3.1 Descrição do produto

StatusPing é um micro-SaaS de monitoramento de uptime para indie makers e pequenas agências: o usuário cadastra de 1 a 10 endpoints em menos de 2 minutos, recebe alertas por e-mail quando algo cai, e tem uma página de status pública (subdomínio próprio) para mostrar transparência aos seus próprios clientes — tudo com um plano de entrada muito mais barato que os players estabelecidos de observabilidade.

## 3.2 Jornada do usuário

**Primeiros 5 minutos:**
1. Cadastro com e-mail (magic link, sem senha) → tela única: "Cole a URL do que você quer monitorar".
2. Cola a URL → sistema roda um check imediato e mostra o resultado em segundos ("✓ respondendo em 180ms").
3. Configura o e-mail de alerta (pré-preenchido com o e-mail da conta) → confirma.
4. Oferece a página de status pública com um subdomínio sugerido automaticamente (`meuapp.statusping.app`) → usuário aceita ou edita.
5. Tela final mostra o link da página de status pronto para compartilhar — valor entregue em menos de 5 minutos, sem precisar entender "intervalos" ou "regiões" ainda.

**Dia 1:**
- Usuário adiciona 2–4 endpoints adicionais (API, admin, webhook).
- Recebe o primeiro alerta de teste (StatusPing oferece um "testar alerta" para validar que o e-mail chega, sem depender de uma queda real).
- Visita a página de status pública para ver como ela aparece aos seus próprios clientes.

**Semana 1:**
- Enfrenta a primeira queda real (ou falso positivo) → avalia a confiabilidade do alerta — momento crítico de confiança no produto.
- Se o alerta foi correto e rápido, considera adicionar webhook para Slack/Discord (fica para v1 — no MVP, o usuário vê essa opção como "em breve" para gerar expectativa de upgrade de produto, não de preço).
- Decide entre continuar no plano grátis (1–2 monitores) ou assinar o plano pago para os monitores extras que já cadastrou.

## 3.3 MVP — MoSCoW

| Prioridade | Item |
|---|---|
| **Must** | Cadastro de endpoint (URL) com check HTTP periódico (intervalo fixo, ex. 5 min no grátis) |
| **Must** | Alerta por e-mail em mudança de estado (up→down e down→up), com proteção anti-falso-positivo (retry antes de alertar) |
| **Must** | Página de status pública básica (subdomínio, lista de monitores, histórico simples de incidentes) |
| **Must** | Bloqueio de IPs privados/metadados no check (mitigação de SSRF) |
| **Should** | "Testar alerta" sob demanda (sem esperar uma queda real) |
| **Should** | Intervalo de 1 min no plano pago |
| **Could** | Webhook Slack/Discord |
| **Could** | Histórico de uptime em gráfico (não só lista de incidentes) |
| **Won't (MVP)** | Checagem multi-região, relatórios de SLA, múltiplos usuários/times |

## 3.4 Wireframe textual (ASCII)

```
TELA: ONBOARDING (1 tela)
┌─────────────────────────────────────────────┐
│  Cole a URL do que você quer monitorar        │
│  ┌───────────────────────────────────────┐   │
│  │ https://meuapp.com                     │   │
│  └───────────────────────────────────────┘   │
│                         [Monitorar agora]     │
└─────────────────────────────────────────────┘

TELA: DASHBOARD (hub principal)
┌─────────────────────────────────────────────┐
│ StatusPing            [+ Monitor] [status pg]│
├─────────────────────────────────────────────┤
│ ● meuapp.com            180ms   há 2min  [···]│
│ ● api.meuapp.com        92ms    há 2min  [···]│
│ ○ admin.meuapp.com      FORA    há 8min  [···]│ ← vermelho
│                                               │
│  [+ Adicionar monitor]                        │
└─────────────────────────────────────────────┘

TELA: DETALHE DO MONITOR
┌─────────────────────────────────────────────┐
│ ← admin.meuapp.com                            │
│  Status: FORA DO AR desde 14:32               │
│  Últimas 24h: ▁▁▁▁▁▁▂▁▁▁▁█▁▁ (uptime 97%)      │
│  Alertas enviados: 1 (e-mail, 14:34)          │
│  [Testar alerta]  [Editar]  [Pausar]          │
└─────────────────────────────────────────────┘

TELA: PÁGINA DE STATUS PÚBLICA (status.meuapp.app)
┌─────────────────────────────────────────────┐
│          Status do MeuApp                     │
│  ✓ Todos os sistemas operacionais             │
│  ──────────────────────────────────           │
│  App principal        ✓ Operacional           │
│  API                   ✓ Operacional           │
│  Painel admin          ✗ Instabilidade         │
│  Histórico de incidentes (últimos 90 dias) ↓  │
└─────────────────────────────────────────────┘
```

## 3.5 Estrutura de telas (mapa de navegação)

```
Cadastro (magic link) ──▶ Onboarding (1ª URL) ──▶ Dashboard (hub)
                                                        │
                        ┌───────────────────────────────┼──────────────┐
                        ▼                                ▼              ▼
                 Detalhe do monitor              + Adicionar monitor  Config. conta
                        │                                                 │
                        ▼                                                 ▼
              Página de status pública                           Plano/assinatura
              (pública, sem login — link
               compartilhável)
```

## 3.6 Fluxo principal (passo a passo)

1. Cron Trigger dispara a cada minuto → Worker scheduler lê no D1 quais monitores estão vencidos para checagem.
2. Lotes de ~50 checks são enfileirados via Queues → consumidores fazem `fetch` ao endpoint com timeout e retry.
3. Mudança de estado (up→down ou down→up) é detectada após N falhas/sucessos consecutivos (anti-falso-positivo) → grava no D1 e dispara alerta.
4. Alerta é enviado por e-mail (Resend) ao usuário.
5. Rollups horários agregam os checks para o histórico/uptime % — não se grava cada check individualmente (custo).
6. A página de status pública é servida como HTML cacheado no Worker, lendo o estado agregado do D1.

## 3.7 Arquitetura inicial (resumo do TF)

Conforme `TECHNICAL_FEASIBILITY.md` (C06): stack 100% Bloco E (Cloudflare Workers + Cron Trigger + Queues + D1), consumidores fazendo `fetch` em lotes (subrequests não cobradas), rollups horários em vez de gravar cada check, status pages servidas como HTML cacheado, painel em React SPA com auth Supabase/magic link. **Ajuste de design sobre o TF:** o TF já identifica o risco de SSRF/abuso como prioridade de segurança — a jornada de onboarding acima (§3.2, passo 1: "cola a URL") depende dessa validação acontecer **antes** do primeiro check visível ao usuário, então recomendo que o bloqueio de IPs privados/metadados (já no MVP "Must" do TF) rode de forma síncrona no momento do cadastro, não só no job periódico — caso contrário a mensagem de erro aparece minutos depois, fora do fluxo de onboarding de "menos de 2 minutos" que é a proposta de valor central do produto.

## 3.8 Monetização integrada à experiência

- **Freemium com limite visível desde o onboarding:** o 2º monitor grátis já mostra, discretamente, "você está usando 2/2 monitores grátis" — sem bloquear, só informar, para que o 3º monitor vire uma decisão consciente de upgrade, não uma surpresa.
- **Paywall no ponto de maior valor percebido:** ao tentar reduzir o intervalo de checagem de 5 min para 1 min (quando o usuário já teve uma queda e quer detectar mais rápido), aparece o upsell — é o momento em que o usuário mais sente a dor que o plano pago resolve.
- **Webhooks Slack/Discord como gatilho de upgrade de v1:** no MVP, a opção aparece como "em breve" na tela de detalhe do monitor — sinaliza roadmap e justifica permanência/upgrade futuro sem prometer uma feature que ainda não existe.
- **Sem anúncios:** modelo B2B de confiança/infraestrutura não combina com ads (reforça a proposta de "simplicidade e seriedade").

## 3.9 Diferencial concreto frente a monitores de uptime estabelecidos

O `FINAL_RANKING.md` marca este como o ponto mais fraco do C06 (Dif = 5, "diferenciação só por preço/simplicidade"). Na camada de design de produto (não de preço), os diferenciais concretos de UX que podem ser testados são:

1. **Onboarding de valor em menos de 5 minutos, sem decisão prematura.** Ferramentas estabelecidas tipicamente pedem para o usuário escolher região de checagem, tipo de alerta, canal de notificação e plano **antes** de ver o primeiro resultado **[H — baseado em padrões gerais de categoria, não verificado por busca ao vivo nesta sessão]**. O fluxo do StatusPing (§3.2) entrega o primeiro check e a página de status pública prontos antes de pedir qualquer configuração avançada — a complexidade "chega depois", quando o usuário já tem valor na mão.
2. **Preço fixo e previsível por faixa pequena de monitores (1–10), não por "assento" ou "equipe".** Ferramentas enterprise de observabilidade escalam o preço rápido para múltiplos recursos que o indie maker não usa (times, SSO, SLA); o StatusPing é desenhado para quem tem 1 produto pequeno, não uma stack de observabilidade — isso aparece na UX como ausência total de conceitos como "membros de equipe" ou "permissões" no MVP, o que simplifica radicalmente a interface comparado às ferramentas que o usuário talvez já tenha tentado e abandonado por complexidade.
3. **Página de status pública incluída desde o grátis, não como add-on separado.** Em parte das ferramentas estabelecidas, status page e monitoramento são produtos/planos distintos **[H — não verificado]**; aqui a página de status nasce automaticamente no onboarding (§3.2, passo 4) como parte do mesmo fluxo, sem configuração extra — o valor de "mostrar transparência ao meu cliente" chega de graça junto com o monitoramento.

**Avaliação honesta [H]:** nenhum desses três pontos é uma barreira técnica difícil de copiar — são decisões de onboarding e empacotamento, replicáveis por um concorrente em semanas. O diferencial real e defensável, se existir, é de **execução e confiança de marca ao longo do tempo** (uptime do próprio StatusPing, histórico de falsos positivos baixo), que só se constrói depois do lançamento — não há diferencial estrutural pré-lançamento tão forte quanto o do C01 (mecânica original) ou do C07 (abordagem de tom persistente). Recomendo tratar isso como risco de design aberto (ver §5).

---

# 4. Protótipo local descartável (C01 apenas)

Arquivo único, sem dependências externas, sem rede, só para testar a cadência de clique/espera do core loop (não valida pacing final — isso exige o spike de simulação headless já recomendado pelo game-dev):

**Caminho:** `/home/openclaw/projects/GameStudio/projects/prototypes/GS-001-C01-loopwright/index.html`

Implementa: 1 estação clicável + produção automática por segundo, upgrade com custo `base × 1,15^n`, contador de Engrenagens, e um botão de prestígio simplificado (reset com multiplicador) — o suficiente para sentir se a espera entre upgrades "parece certa" antes de investir em simulação mais rigorosa. Não é publicado nem versionado como produto; é um rascunho de sensação de jogo.

---

# 5. Riscos de design restantes

**C01 Loopwright:**
- Pacing do 1º prestígio (45–90 min) é uma hipótese de design, não testada — depende do spike de simulação headless (TF §5) antes de travar os números de produção/custo.
- Risco de "número grande" (overflow) precisa ser resolvido como requisito do MVP (biblioteca de big numbers), não deixado para depois — ver §1.7.
- Onboarding "sem texto" é uma aposta de UX; se os primeiros 20 segundos não comunicarem claramente o que fazer, a retenção D1 cai antes de qualquer outra mecânica importar.

**C07 ReplyDraft:**
- O diferencial defensável (tom persistente por exemplos reais) ainda não foi validado com usuários reais — é a hipótese central do pitch e precisa de teste qualitativo cedo, não só do spike técnico de DOM (TF §5).
- Dependência de o Gmail não mudar o DOM nem expandir o Gemini nativo a ponto de cobrir o ponto 2 (tons por contexto) — risco de janela de oportunidade estreita.

**C06 StatusPing:**
- Diferenciação é a mais fraca dos três finalistas (nota Dif = 5 no ranking) e, por design, depende de execução/confiança de marca ao longo do tempo, não de uma mecânica de produto única — recomendo decidir antes do MVP se o estúdio aceita competir primariamente por onboarding+preço, ou se vale investir em mais um diferencial estrutural (ex.: um recurso de produto que os concorrentes estabelecidos não oferecem) antes de construir.
- A validação síncrona de SSRF no cadastro (§3.7) precisa ser confirmada como viável dentro do modelo de Workers (latência da chamada de validação não pode quebrar a promessa de onboarding "em menos de 2 minutos").
