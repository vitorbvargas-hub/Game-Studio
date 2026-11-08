# Business Case — GS-003 (idle de coleção de monstros, linhas A e B)

> Template Game Studio. Datas em ISO. **[E]** evidência (com fonte) · **[H]** hipótese/projeção não verificada.

- **Projeto:** GS-003
- **Autor (agente):** game-growth (Nação Games)
- **Data:** 2026-11-08
- **Status:** rascunho — Parte 4b (business case preliminar de discovery, não decisão de investimento)
- **Entrada:** `README.md`, `teardowns/IDLEDEX.md`, `teardowns/DIGIWORLDIDLE.md`, `MARKET_AND_IP.md`, `ART_DIRECTION_OPTIONS.md` (todos de 2026-11-08), `shared/standards/INFRASTRUCTURE.md`, `portfolio/capital-allocation/CAPITAL_ALLOCATION.md`, `portfolio/performance/COSTS.md`.
- **Nota metodológica:** `web_search` indisponível nesta sessão (mesma limitação já registrada em `MARKET_AND_IP.md`). Benchmarks de monetização/tráfego/ARPDAU específicos do nicho **não têm fonte quantitativa** — ficam explicitamente [H]. O que é [E] abaixo vem de `web_fetch` direto em páginas oficiais (Stripe, Apple) ou dos teardowns jogados nesta mesma sessão.

---

## Resumo

Dois conceitos de idle de coleção de monstros com criaturas/nomes/arte 100% originais (restrição de GOVERNANCE): **Linha A** (coleção/captura, público Pokémon/IdleDex) e **Linha B** (monstros digitais/digievolução, público Digimon/BR). Os três concorrentes diretos estudados (IdleDex, Digi World Idle, Pokechill) rodam 100% em navegador, sem app nativo, e têm monetização ativa — evidência de que a demanda paga existe no nicho, mas sem dado quantitativo de tamanho de mercado ou ARPDAU (`MARKET_AND_IP.md` §3 e §5). A arte usaria o pipeline vetorial já disponível no estúdio (Recraft), compartilhado entre as duas linhas. A recomendação qualitativa já registrada em `MARKET_AND_IP.md` é validar a Linha A primeiro, em plataforma web. Este documento detalha monetização, custo, cenários financeiros [H] e critérios de validação para embasar a decisão de orçamento do fundador — **nenhum valor aqui é aprovação de gasto**.

---

## 1. Modelos de monetização comparados (idle web e mobile)

| Modelo | Como funciona | Ético / não pay-to-win? | Permitido nas plataformas-alvo | Observação |
|---|---|---|---|---|
| **Assinatura premium** (como IdleDex) | Recorrência (ex. 30/60/90 dias) por conveniência: box maior, mais tempo offline, +XP, mais ofertas de mercado | **[E]** Majoritariamente conveniência/velocidade no IdleDex, não poder bruto de PvP — mas "+50% rankexp" e Exp Share em grupo dão vantagem real de progressão (`IDLEDEX.md` §4) | Web própria/itch/portais: sim, sem restrição conhecida. App Store/Google Play: sim, via IAP de assinatura nativa (gestão de recibo e taxa de loja aplicável) | Modelo validado comercialmente pelos 2 concorrentes diretos (IdleDex e Digi World Idle usam variantes dele) |
| **Passe de batalha (battle pass)** | Temporada com trilha free + paga, missões diárias/semanais/sazonais | Sim, se recompensas da trilha paga forem cosmético/conveniência, não poder puro | Permitido nas duas lojas e em web; é padrão de indústria | **[E]** Observado em ambos os concorrentes (IdleDex Passe de Batalha, Digi World Idle D-Pass) — sistema de retenção mais denso nos dois casos |
| **Anúncios recompensados (rewarded ads)** | Jogador opta por ver um anúncio em troca de boost/item/moeda | Sim — é o modelo mais "ético" por definição (opt-in, sem pressão de pagamento) | **Poki e CrazyGames são portais ad-funded por natureza** — exigem/esperam integração de SDK de anúncios como parte do modelo de distribuição [H, não confirmado com fonte primária nesta sessão: tentativas de `web_fetch` em `developers.poki.com` e `docs.crazygames.com` retornaram 404 na página específica consultada]. itch.io e App/Play Store permitem, mas não exigem | **[E]** Nenhum dos 3 concorrentes diretos (IdleDex, Digi World Idle, Pokechill) usa ads de vídeo — modelo observado no nicho é 100% IAP/assinatura, não ad-based (`MARKET_AND_IP.md` §5) |
| **Cosméticos** (skins, banners, recolor) | Compra avulsa, sem efeito de jogo | Sim, é o padrão mais ético de todos | Permitido em todas as plataformas-alvo | **[E]** Ambos concorrentes já vendem cosméticos ("seu para sempre" no IdleDex; skins no D-Coin Store do Digi World Idle) |
| **Compra única (preço fixo)** | Preço fixo de entrada, sem IAP recorrente | Sim | Steam (ver referências pagas: Temtem, Coromon, Monster Sanctuary — todos vendidos com sucesso, `MARKET_AND_IP.md` §1); App/Play Store permitem apps pagos; portais ad-funded (Poki/CrazyGames) normalmente não fazem sentido com preço fixo (modelo deles é grátis + anúncio) | Exige mais conteúdo/polimento antes do lançamento — menos compatível com MVP rápido de validação |
| **Pacotes de conveniência** (ex. expansão de box, boost avulso, "kit diário") | Compra pontual de vantagem de progresso, não de poder competitivo direto | Zona cinzenta — depende de calibração: expandir box/tempo offline é conveniência; "Gold Ball" (+captura) e boosts de XP/dano começam a se aproximar de pay-to-win se desbalanceados | Permitido nas lojas, sujeito a regras de loot box/gacha se houver elemento de sorte na compra | **[E]** Ambos concorrentes usam fortemente (Suprimentos/Kit diário no IdleDex; boosts e D-Coin Store no Digi World Idle) |

**Recomendação de modelo [H]:** combinar **assinatura de conveniência** (não-P2W) + **passe de batalha sazonal** + **cosméticos** como base, com **anúncios recompensados opt-in** adicionados só se o canal de distribuição for um portal ad-funded (Poki/CrazyGames) — evitando qualquer mecânica de vantagem de poder vendável (sem "Gold Ball" equivalente, sem boost de dano comprável). Isso segue o padrão já validado comercialmente pelos dois concorrentes diretos e evita o risco de reputação de pay-to-win. Loot box/gacha com dinheiro real (não apenas moeda ganha jogando) deve ser evitado ou tratado com cautela regulatória — várias jurisdições e lojas têm regras específicas de disclosure de probabilidade; isso não foi verificado com fonte primária nesta sessão **[H]**.

---

## 2. Distribuição e aquisição de custo zero ou baixo

**[E]** Os três concorrentes diretos rodam 100% em navegador, sem app nativo nas lojas — nenhum paga comissão de 15-30% de app store hoje (`MARKET_AND_IP.md` §4).

| Canal | Custo | Observação |
|---|---|---|
| Portais web (Poki, CrazyGames, itch.io) | Zero para publicar; monetização via ads/revshare do portal | **[H]** Termos exatos de revshare e políticas de IA generativa em asset não verificados nesta sessão — recomenda-se confirmação antes do lançamento (já apontado como lacuna em `ART_DIRECTION_OPTIONS.md` §5.2) |
| Comunidades (Reddit r/incremental_games, Discord) | Zero (tempo de agente/fundador) | Público nativo de idle games, alta afinidade com o gênero; risco de regra de autopromoção por subreddit, não verificado |
| Criadores BR (YouTube/TikTok de nostalgia Digimon/Pokémon) | Baixo a médio — parceria orgânica ou micro-influenciador | Relevante principalmente para a Linha B (nicho BR de nostalgia Digimon); sem benchmark de CPM/custo de parceria nesta sessão |
| SEO / site próprio | Zero em dinheiro, custo de tempo | Jogos como IdleDex têm wiki própria indexável — padrão replicável sem custo de mídia |
| App Store / Google Play (orgânico) | Zero para publicar; comissão de 15% sobre receita até US$1M/ano de proceeds por desenvolvedor **[E]**, confirmado via `developer.apple.com/app-store/small-business-program` (2026-11-08): "reduced commission rate of 15% on paid apps and Apple In-App Purchases" para quem ganhou até US$1M no ano anterior; acima disso, taxa padrão de 30%. Google Play tem programa equivalente historicamente conhecido (15% nos primeiros US$1M/ano) **[H, não reverificado com fonte primária nesta sessão]** | Custo de distribuição só aparece quando há receita — favorável para um MVP sem orçamento de mídia |

**Custo de aquisição de usuário (CAC) [H]:** não há dado de mercado verificável nesta sessão para CAC de idle de monstro-coleção. Como hipótese de ordem de grandeza para planejamento (não benchmark real), um lançamento sem budget de mídia paga, apoiado só em portais/comunidades/SEO, tende a gerar CAC próximo de **zero em dinheiro, mas alto em tempo de agente/fundador** (produção de conteúdo, posts, parcerias). Qualquer CAC pago (ads no TikTok/YouTube, UA mobile) ficaria tipicamente na faixa de **US$0,50–3,00 por instalação para jogos casuais/idle** [H, memória geral de mercado não verificada com fonte nesta sessão] — **não orçado, não aprovado**.

---

## 3. Custos

### 3.1 Arte (Recraft, pipeline vetorial)

**[E]** O estúdio já tem pipeline funcionando (`ART_DIRECTION_OPTIONS.md` §2-3): modo `vetor` do Recraft, ~45-47 KB por SVG, uma geração por criatura. Custo exato por geração da API Recraft **não foi exposto nesta sessão** — os 4 testes de arte do GS-003 estão registrados em `portfolio/performance/COSTS.md` como "NÃO VERIFICADO" (créditos vêm da conta Recraft do fundador, sem valor por crédito confirmado).

| Item | Estimativa | Observação |
|---|---|---|
| Criaturas por linha (brief do fundador) | 150–300 por linha | Definido no pedido original; dobra se as duas linhas forem feitas (pode compartilhar % de assets genéricos de UI) |
| Gerações por criatura | ≥1 (vetor base) + possíveis reprompts/correções de paleta | Recoloração de paleta é scriptável (SVG é texto) — não exige nova geração de API por correção de cor |
| Animação | Fora do custo de geração de imagem: rigging 2D esqueletal (corpo/olhos/membros separados) é trabalho manual adicional, não cobertos pelo preço por criatura do Recraft | `ART_DIRECTION_OPTIONS.md` §1, Opção 2 |
| **Custo monetário total de arte** | **NÃO VERIFICADO [H]** | Sem preço por crédito/geração do Recraft confirmado, não é possível calcular 150×custo ou 300×custo com confiança — **esta é uma lacuna que bloqueia um orçamento de arte preciso e precisa ser preenchida antes de qualquer aprovação de gasto** |
| Assets CC0 de apoio (UI, tiles, ícones) | US$0 | Kenney.nl, OpenGameArt, game-icons.net — confirmado como opção de custo zero em `ART_DIRECTION_OPTIONS.md` §3, desde que licença seja verificada por item antes do uso |

### 3.2 Infraestrutura (Cloudflare + Supabase, `INFRASTRUCTURE.md`)

**[E]** Valores herdados do padrão de infraestrutura já aprovado como proposta pelo estúdio (`shared/standards/INFRASTRUCTURE.md`, preços lidos em 2026-11-08):

| Fase | Custo mensal |
|---|---|
| Discovery / protótipo sem backend | **US$0** |
| MVP com save/leaderboard/ranking ou proxy de API em produção (Cloudflare Workers + D1/KV) | **US$0–5/mês** (Workers Paid só acima de 100k req/dia) |
| Se precisar de auth de conta de usuário e/ou dados relacionais com PII (ex. perfil, amizades, chat) | **+US$25/mês** (Supabase Pro, `sa-east-1`) — Free pausa após 1 semana de inatividade, não serve para produção |
| Cada linha de produto adicional na mesma org Supabase (se linha B tiver conta separada) | +US$10/mês (compute Micro) |

**Observação de design:** dados de jogo "leves" sem PII (progresso, box, pokédex equivalente) podem ficar em D1/KV sem custo adicional; qualquer dado de conta real de usuário (e-mail, login) deve ir para Supabase conforme regra de LGPD já registrada em `INFRASTRUCTURE.md` §4-5.

### 3.3 Backend de ranking e eventos

**[H]** Não há linha de custo dedicada documentada para isso — ranking/leaderboard e calendário de eventos (como observados em ambos concorrentes) tipicamente cabem dentro do mesmo orçamento de Workers + D1/KV acima (consultas de leaderboard, cron de rotação de evento), sem custo incremental relevante até escala significativa de usuários. Sem volume de usuários estimado com confiança, não é possível projetar quando isso ultrapassaria o free tier.

### 3.4 Taxas de loja e de pagamento

| Canal de pagamento | Taxa | Fonte |
|---|---|---|
| **Stripe (cartão nacional, BR)** | **3,99% + R$0,39 por transação** para cartões nacionais; +2% adicional para cartão internacional | **[E]** `stripe.com/br/pricing`, lido via `web_fetch` em 2026-11-08 |
| **Mercado Pago** | Taxa por transação não confirmada nesta sessão — página consultada (`mercadopago.com.br/ajuda/taxas-cobrancas-planos`) não retornou a tabela de taxas no fetch realizado | **[H]** Recomenda-se nova verificação direta no painel Mercado Pago antes de decidir provedor; de memória geral de mercado (não confirmado agora), Mercado Pago historicamente cobra em faixa similar a 4-5% por transação de cartão para recebimento via checkout |
| **Apple App Store** | **15%** sobre vendas e IAP para desenvolvedores com até US$1M de proceeds/ano (Small Business Program); **30%** padrão acima disso | **[E]** `developer.apple.com/app-store/small-business-program`, lido em 2026-11-08 |
| **Google Play** | Historicamente 15% nos primeiros US$1M de receita anual por app, 30% acima — programa equivalente ao da Apple | **[H]** não reverificado com fonte primária nesta sessão |
| **Portais web (Poki/CrazyGames)** | Monetização por revshare de anúncio, não taxa de transação de IAP (modelo é ad-funded, não de loja) | **[H]** termos exatos não verificados (fetch às páginas de documentação retornou 404 nas URLs tentadas) |

---

## 4. Cenários conservador, base e otimista — 3, 6 e 12 meses

**Aviso obrigatório: tudo nesta seção é projeção [H], não previsão nem compromisso de receita.** Segue o mesmo padrão de curva hipotética de usuários já usado em `CAPITAL_ALLOCATION.md` §2 para o GS-002 — aqui aplicado ao GS-003 como **exercício de ordem de grandeza**, sem qualquer base em usuário real (produto não existe, não tem canal de aquisição validado).

### 4.1 Premissas [H, todas hipóteses]

- Modelo de monetização: assinatura (ARPU do pagante mensal hipotético: conservador US$5, base US$8, otimista US$15 — faixa mais baixa que o GS-002/ReplyDraft por ser jogo casual/web, não SaaS B2B) + passe de batalha + cosméticos.
- % de usuários ativos que convertem em pagante: conservador 1%, base 3%, otimista 7% (nicho de monster-collector idle tende a converter melhor que app genérico por ter fãs dedicados, mas pior que SaaS de produtividade — faixa intermediária hipotética).
- Taxa de pagamento: Stripe 3,99% + R$0,39 por transação [E, seção 3.4], assumido ~4% de taxa efetiva.
- Custo variável (infra por usuário ativo): assumido próximo de zero por usuário no free tier de Cloudflare/D1 até a faixa de milhares de usuários simultâneos (ver `INFRASTRUCTURE.md`); custo fixo entra em saltos (US$0 → US$5 → US$30) ao cruzar limiares de free tier, não de forma linear por usuário.
- Impostos: **NÃO VALIDADO** — depende de regime tributário do estúdio/fundador, não calculado aqui (mesma lacuna já registrada em `CAPITAL_ALLOCATION.md` §2.3 para o GS-002).
- Curva de usuários ativos hipotética (sem base em aquisição real, só para preencher o formato pedido):

| Horizonte | Conservador | Base | Otimista |
|---|---|---|---|
| 3 meses | 200 | 500 | 1.500 |
| 6 meses | 500 | 1.500 | 5.000 |
| 12 meses | 1.000 | 4.000 | 15.000 |

### 4.2 Projeção financeira por cenário e horizonte [H]

| Horizonte | Cenário | Usuários ativos [H] | Pagantes | Receita bruta mensal [H] | Taxa Stripe (~4%) [H] | Impostos | Custo variável (infra) [H] | Custo fixo mensal | Margem mensal [H] |
|---|---|---|---|---|---|---|---|---|---|
| 3 meses | Conservador | 200 | 2 (1%) | US$10 | ~US$0,40 | NÃO VALIDADO | ~US$0 (free tier) | US$0 | ~US$9,60 |
| 3 meses | Base | 500 | 15 (3%) | US$120 | ~US$4,80 | NÃO VALIDADO | ~US$0–5 | US$0 | ~US$110–115 |
| 3 meses | Otimista | 1.500 | 105 (7%) | US$1.575 | ~US$63 | NÃO VALIDADO | ~US$5 | US$0 | ~US$1.507 |
| 6 meses | Conservador | 500 | 5 (1%) | US$25 | ~US$1 | NÃO VALIDADO | ~US$0 | US$0 | ~US$24 |
| 6 meses | Base | 1.500 | 45 (3%) | US$360 | ~US$14,40 | NÃO VALIDADO | ~US$5 | US$0–5 | ~US$335–340 |
| 6 meses | Otimista | 5.000 | 350 (7%) | US$5.250 | ~US$210 | NÃO VALIDADO | ~US$5–30 | US$0–25 | ~US$4.985–5.005 |
| 12 meses | Conservador | 1.000 | 10 (1%) | US$50 | ~US$2 | NÃO VALIDADO | ~US$0–5 | US$0 | ~US$43–48 |
| 12 meses | Base | 4.000 | 120 (3%) | US$960 | ~US$38,40 | NÃO VALIDADO | ~US$5 | US$0–30 | ~US$886–916 |
| 12 meses | Otimista | 15.000 | 1.050 (7%) | US$15.750 | ~US$630 | NÃO VALIDADO | ~US$30+ | US$25–35 | ~US$15.025–15.065 |

**Leitura obrigatória desta seção:** a tabela existe para dar ordem de grandeza e não deve orientar decisão de investimento isolada — nenhum dos números de usuários tem base em canal de aquisição validado ou dado real de conversão do nicho. O risco mais crítico que pode inverter qualquer cenário é a ausência de benchmark real de conversão/ARPU para idle de monster-collector **[H]** — os percentuais usados são estimativas de ordem de grandeza do agente, não dado de mercado.

---

## 5. Quanto investir para validar

**[H]** Proposto como referência de ordem de grandeza, sujeito a aprovação explícita do fundador item a item, conforme `GOVERNANCE.md` e regra 2 de `CAPITAL_ALLOCATION.md` §3 — **nenhum valor abaixo é gasto aprovado**.

### 5.1 Orçamento máximo de protótipo (validar o loop, não o produto completo)

- **Escopo:** 1 linha (A, conforme recomendação de `MARKET_AND_IP.md` §6), 15-30 criaturas (não 150-300), loop idle + captura + 1-2 decisões táticas reais desde os primeiros 5 minutos (melhoria já identificada em `IDLEDEX.md` §8, item 1), sem passe de batalha completo, sem guilda/PvP.
- **Infra:** US$0 (free tier Cloudflare, sem Supabase ainda — sem conta de usuário real no protótipo).
- **Arte:** custo de geração Recraft **não orçável com confiança hoje** (preço por crédito não verificado) — recomenda-se confirmar o custo por crédito da API Recraft antes de aprovar este orçamento, mesmo que o protótipo use só 15-30 criaturas.
- **Tempo:** majoritariamente tempo de agente (já em curso via assinatura Claude do fundador, custo PENDENTE conforme `CAPITAL_ALLOCATION.md` §1, GS-001).

### 5.2 Orçamento de teste de mercado (pós-protótipo, antes de MVP completo)

- **Escopo:** publicar o protótipo em 1 portal web (itch.io, custo zero) + 1 comunidade (Reddit/Discord, custo zero) por 2-4 semanas, medindo retenção/conversão real.
- **Custo de caixa estimado:** US$0–20 (domínio opcional se não usar itch.io direto) — **não aprovado, apenas referência**.
- **Não incluir:** ads pagos, parceria com criador, ou qualquer assinatura paga (Supabase Pro, Workers Paid) antes que o teste de mercado justifique o volume.

### 5.3 Kill criteria [H, proposto — segue o padrão de `CAPITAL_ALLOCATION.md` §4 item do GS-002]

Abandonar ou pausar o projeto se, ao final do teste de mercado (2-4 semanas):
- **D1 (retenção dia 1) < 20%** — sinal de que o onboarding/loop não prende nem no padrão mínimo de jogo casual.
- **D7 (retenção dia 7) < 5%** — sinal de que não há motivo de retorno além da primeira sessão.
- **Sessão média < 3 minutos** no primeiro acesso — indica que o "gancho" de progresso rápido (replicando o padrão do IdleDex, `IDLEDEX.md` §1) não está funcionando.
- **Conversão em pagante < 0,5%** em 60 dias de teste de mercado — abaixo da faixa conservadora usada na própria projeção da seção 4.
- **Qualquer notificação de IP** (mesmo que infundada) sobre semelhança de nome/arte com Pokémon/Digimon — critério de parada imediata para revisão, não só financeiro (ver `MARKET_AND_IP.md` §2).

### 5.4 Métricas de validação a instrumentar desde o protótipo

D1/D7/D30 de retenção, tempo até primeira captura/decisão real, duração média de sessão, % de usuários que liga o modo "auto", conversão free→pagante, e NPS/feedback qualitativo via comunidade (Discord/Reddit).

---

## 6. Linha A vs. Linha B vs. base compartilhada

| Dimensão | Linha A (coleção/captura) | Linha B (monstros digitais/BR) | Base compartilhada |
|---|---|---|---|
| Público | Pokémon/IdleDex — presumivelmente maior e mais internacional [H, `MARKET_AND_IP.md` §3] | Digimon/BR — nicho menor, mas presumivelmente mais apaixonado e com maior disposição a pagar [H, baseado na monetização ativa do Digi World Idle] | — |
| Risco de IP | Mais fácil de gerenciar — mecânica de captura/evolução genérica é testada à prova de litígio por anos (Temtem, Coromon, Monster Sanctuary, Cassette Beasts) [E, `MARKET_AND_IP.md` §2] | Mais perto da linha de risco — o próprio concorrente direto (Digi World Idle) já usa nomes oficiais de parceiros/Tamers, e nosso produto precisaria manter disciplina maior de originalidade [E/H, `MARKET_AND_IP.md` §2 item 4] | GOVERNANCE exige criaturas/nomes/arte 100% originais nas duas |
| Arte | Pipeline vetorial padrão (Opção 2) | Pipeline vetorial + camada "digital/cyber" (Opção 2+3) — trabalho de direção de arte incremental, não pipeline paralelo | Mesma base de produção Recraft, reduz custo e risco de inconsistência (`ART_DIRECTION_OPTIONS.md` §2) |
| Monetização | Mesmos modelos (assinatura/passe/cosmético) — mercado mais testado (IdleDex) | Mesmos modelos, mas concorrente direto mostra disposição a pagar mais alta e cedo (VIP + D-Pass + boosts + doação R$500+ visíveis desde o dia 1) [E, `DIGIWORLDIDLE.md` §4] — risco de copiar agressividade excessiva de monetização do concorrente, que já é apontada como fraqueza a evitar [E, `DIGIWORLDIDLE.md` §9] | — |
| Recomendação de sequência | **Validar primeiro** — menor risco de IP, mercado mais testado, maior público potencial | Segundo produto ou expansão temática reaproveitando o mesmo motor, depois da Linha A validada | Um híbrido A+B simultâneo desde o dia 1 **não é recomendado** — divide orçamento de arte/design exatamente na fase de maior incerteza de validação [E, `MARKET_AND_IP.md` §6] |

---

## 7. As 7 perguntas obrigatórias (`CAPITAL_ALLOCATION.md` §4, aplicadas ao GS-003)

1. **Quanto já foi gasto nesse projeto?** R$0 de caixa. Custo de agente nas 4 partes de discovery: PENDENTE (assinatura Claude do fundador). 4 testes de arte Recraft registrados em `portfolio/performance/COSTS.md` como "NÃO VERIFICADO" (créditos da conta Recraft do fundador).
2. **Quanto falta para a próxima decisão relevante (protótipo validável)?** Infra: US$0 (free tier). Arte: valor **não orçável com confiança** até o custo por crédito do Recraft ser confirmado — esta é a lacuna mais crítica antes de aprovar qualquer gasto de arte em escala (15-30 criaturas do protótipo, e mais ainda nas 150-300 do produto completo).
3. **Qual é o retorno esperado, com que confiança?** Projeção **[H]** de ordem de grandeza: ~US$50-960/mês no cenário conservador-a-base em 12 meses (seção 4) — confiança **baixa**, pois não há dado real de conversão/ARPU do nicho, só estimativas do agente; a curva de usuários é hipotética, sem canal de aquisição validado.
4. **Qual é o pior cenário (kill criteria)?** D1 < 20%, D7 < 5%, sessão média < 3 min, conversão < 0,5% em 60 dias, ou qualquer notificação de IP — nenhum medido ainda (produto não existe).
5. **O que precisa ser verdade para este investimento valer a pena?** Que o loop idle com 1-2 decisões reais logo no início retenha melhor que o padrão 100% passivo do IdleDex nos primeiros 20-30 minutos (`IDLEDEX.md` §3), e que ao menos a faixa conservadora de conversão (1%) se confirme no teste de mercado de 2-4 semanas — não testado.
6. **Existe alternativa de menor custo/risco que testa a mesma hipótese?** Sim — protótipo da Linha A sozinha (sem Linha B, sem backend de conta de usuário, 15-30 criaturas) testa o loop central com risco de IP mais baixo e custo de arte/infra mínimo, antes de comprometer orçamento para 150-300 criaturas ou para a Linha B.
7. **Essa decisão é reversível?** Sim — nenhuma conta paga foi aberta, nenhum domínio registrado, nenhuma arte em escala de produto foi produzida (só 4 testes). Tudo até aqui é discovery e protótipo técnico, 100% reversível.

---

## Aviso: projeções não são receita garantida

Todas as projeções financeiras deste documento (seção 4, e partes das seções 1, 2 e 5) são hipóteses de ordem de grandeza marcadas **[H]**, construídas sem dado real de mercado, usuário ou conversão para este produto específico — o produto não existe ainda. Nenhum valor aqui representa meta, previsão ou compromisso de receita, e nenhum gasto é pré-aprovado. Decisões de investimento seguem `GOVERNANCE.md` e `portfolio/capital-allocation/CAPITAL_ALLOCATION.md`.
