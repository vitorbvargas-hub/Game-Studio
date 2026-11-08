# GS-001 — Catálogo de Conceitos de Produto (Task 3)

- **Projeto:** GS-001
- **Autor (agente):** game-design
- **Data:** 2026-11-08
- **Status:** rascunho

> Marcação: **[E]** evidência (fonte + data) · **[H]** hipótese não verificada.
>
> **Nota metodológica [E]:** a ferramenta de busca web (provider) retornou erro 429 (rate limit) em três tentativas nesta sessão (2026-11-08) e não pôde ser usada para checar colisão de nomes nem demanda de mercado em tempo real. Todas as afirmações de mercado, concorrência e "sem colisão de nome" abaixo são **[H]** — baseadas em conhecimento geral do mercado até o cutoff do modelo (jan/2026), não em pesquisa ao vivo. Antes de registrar marca/domínio ou publicar qualquer conceito, repetir a checagem de nome/trademark/App Store/Play Store/Steam com busca ao vivo.
>
> Referência de inspiração (mecânica, não cópia): https://idledex.com/play — idle + coleção + progressão por camadas. Nenhum nome, personagem, arte ou mecânica-assinatura foi copiado; os 10 conceitos abaixo são composições originais de gêneros/padrões genéricos de mercado.

---

## C01 — "Loopwright" (jogo idle + coleção)

- **Categoria/Plataforma:** Jogo incremental/idle + coleção — Web (PWA) → mobile (Android/iOS) na v1.
- **Entretenimento oferecido:** progressão contínua de baixa fricção — o jogador monta e otimiza uma "linha de produção" de criaturas/engrenagens abstratas que geram recursos sozinhas, com coleção de variantes raras.
- **Público-alvo:** jogadores casuais 25–45 anos que jogam em pausas curtas (idle genre players), fãs de coleção/gacha leve sem gastar muito tempo ativo.
- **Proposta de valor:** profundidade de otimização (tipo "factory game") com a fricção zero de um idle — jogável em 2 minutos ou em 2 horas.
- **Diferencial [H]:** maioria dos idles de coleção (ex.: categoria "idle RPG/collector" no mobile) foca em power-creep de stats; Loopwright foca em otimização de layout/combinação (puzzle leve), dando sensação de skill, não só de espera.
- **Funcionalidades principais:** geração offline de recursos; árvore de upgrades por ramificação; coleção com raridades e sinergias; prestígio (reset com bônus permanente); eventos sazonais leves.
- **Core loop:**
  - Curto prazo (minutos): coletar recursos acumulados, comprar upgrade, reorganizar unidades.
  - Médio prazo (dias): desbloquear nova camada de produção, completar coleção de um "set", disputar ranking semanal.
  - Longo prazo (semanas/meses): prestígio/reset com multiplicadores permanentes, completar coleção "master", novos biomas/temas.
- **Monetização:** free-to-play com anúncios opcionais (boost de recompensa) + IAP cosmético e "pacotes de conveniência" (não pay-to-win duro) + eventual battle pass sazonal.
- **MVP (entra):** 1 linha de produção, 15–20 upgrades, 1 ciclo de prestígio, 10 colecionáveis, salvamento em nuvem simples, anúncio recompensado.
- **MVP (fica fora):** multiplayer/guildas, eventos sazonais, loja cosmética expandida, múltiplos biomas.
- **Roadmap:** MVP (loop completo + 1 prestígio) → v1 (2º bioma, leaderboard, loja cosmética) → v2 (eventos sazonais, guildas assíncronas, cross-save mobile/web).
- **Riscos:** gênero saturado de clones; retenção depende de ritmo de progressão bem calibrado (requer playtesting); ads/IAP exigem SDK de terceiros com custo de integração e compliance de privacidade (COPPA/GDPR) se público incluir menores.

---

## C02 — "Fathom Freight" (jogo browser, strategy leve)

- **Categoria/Plataforma:** Strategy/tycoon leve, turnos simultâneos — navegador (desktop-first), responsivo para tablet.
- **Entretenimento oferecido:** gerenciar uma pequena rede de rotas de transporte (frota abstrata) competindo por contratos num mapa procedural.
- **Público-alvo:** fãs de jogos de estratégia leve/tycoon que jogam no navegador no trabalho/pausas (nicho de "browser strategy" tipo Travian/OGame, mas sessão curta).
- **Proposta de valor:** estratégia assíncrona que não exige login diário longo — decisões importantes em 5–10 min, resultado processado em "turnos" por tempo real.
- **Diferencial [H]:** jogos de frota/tycoon tendem a ser ou hipercasuais (sem profundidade) ou MMO pesados (Travian-like, alta fricção social); Fathom Freight fica no meio — profundidade estratégica, sessão curta, sem pressão de guerra constante.
- **Funcionalidades principais:** mapa procedural de rotas; contratos com janelas de tempo; upgrades de frota; eventos de mercado (preços flutuantes); ranking sazonal (temporadas de 4–6 semanas, reset).
- **Core loop:**
  - Curto prazo: aceitar contratos, despachar frota, coletar pagamento.
  - Médio prazo: expandir rotas, especializar frota, reagir a eventos de mercado.
  - Longo prazo: disputar ranking da temporada, desbloquear "era" tecnológica seguinte.
- **Monetização:** assinatura leve ("passe de temporada" com benefícios de conveniência) + cosméticos de frota; sem pay-to-win nas mecânicas centrais de contrato.
- **MVP (entra):** 1 mapa fixo (não procedural ainda), 3 tipos de frota, sistema de contratos, 1 temporada de teste, sem ranking social.
- **MVP (fica fora):** mapa procedural, eventos de mercado dinâmicos, multiplayer direto/PvP, cosméticos.
- **Roadmap:** MVP (loop econômico single-player) → v1 (ranking de temporada, mapa procedural) → v2 (eventos de mercado, interação leve entre jogadores — leilões assíncronos).
- **Riscos:** browser strategy é nicho menor que mobile (alcance orgânico mais difícil); precisa de boa IA/balanceamento econômico para não virar planilha chata; monetização por assinatura exige massa crítica de usuários antes de converter bem.

---

## C03 — "Scrapline" (jogo incremental/factory, mobile+web)

- **Categoria/Plataforma:** Incremental/automação (factory-lite) — mobile (Android/iOS) com versão web espelhada.
- **Entretenimento oferecido:** construir uma cadeia de produção visual (esteiras, processadores) que se automatiza progressivamente, estilo "Factorio para o bolso", mas sem a curva de aprendizado pesada.
- **Público-alvo:** jogadores de incremental/automação que acham factory games "sérios" intimidadores; público mobile casual-to-midcore.
- **Proposta de valor:** satisfação visual de automação complexa com tutorial guiado e sem necessidade de manual externo.
- **Diferencial [H]:** factory games de referência (ex. estilo Factorio/Mindustry) são densos e PC-first; Scrapline traz a fantasia de automação para touch-first com onboarding curto.
- **Funcionalidades principais:** grid de construção; esteiras/processadores; desafios de eficiência (metas opcionais); desbloqueio de novas peças por progressão; modo "sandbox" pós-MVP.
- **Core loop:**
  - Curto prazo: posicionar/otimizar uma esteira, resolver um bottleneck.
  - Médio prazo: desbloquear nova peça, completar um desafio de eficiência.
  - Longo prazo: completar o grid "mestre", desbloquear modo sandbox ou prestígio com novo material.
- **Monetização:** compra única (premium, preço baixo ~US$3–5) OU freemium com anúncios + remoção de anúncios paga — testar qual converte melhor no MVP.
- **MVP (entra):** 1 grid, 6 tipos de peça, 10 desafios guiados, sem sandbox.
- **MVP (fica fora):** sandbox livre, segundo material/grid, multiplayer/comparação de layouts.
- **Roadmap:** MVP (tutorial + 10 desafios) → v1 (sandbox + compartilhamento de layout) → v2 (segundo material, desafios comunitários, leaderboard de eficiência).
- **Riscos:** complexidade de UX em telas pequenas (grid touch pode ser frustrante — exige prototipagem cedo); concorrência indireta forte de factory games estabelecidos; precisa decidir modelo de monetização antes do MVP para não refazer fluxo de onboarding.

---

## C04 — "Pocket Orchard" (jogo mobile casual, coleção+idle leve)

- **Categoria/Plataforma:** Casual/coleção com idle leve — mobile-first (Android/iOS), sem versão web no MVP.
- **Entretenimento oferecido:** cuidar de um "pomar"/jardim de criaturas-planta híbridas que crescem com o tempo, colecionar variedades, decorar o espaço.
- **Público-alvo:** público casual amplo (inclui mulheres 25-55, mercado historicamente bem monetizável em jogos de "cuidado"/decoração), jogadores de sessão curta e frequente.
- **Proposta de valor:** fantasia de cuidado/colecionismo tranquilo (sem pressão competitiva), com retorno visual (decoração) e progressão idle.
- **Diferencial [H]:** jogos de "cuidado"/decoração existentes tendem a ser só estética (sem profundidade de coleção) ou só idle (sem apelo emocional); Pocket Orchard combina os dois com arte própria e sem tema de animal de estimação genérico já saturado.
- **Funcionalidades principais:** espaço de jardim customizável; coleção por raridade/combinação genética simplificada; crescimento em tempo real (idle); troca/presente entre amigos (assíncrono, sem exigir amigos para progredir).
- **Core loop:**
  - Curto prazo: colher, plantar, decorar.
  - Médio prazo: desbloquear nova variedade por combinação, expandir o espaço.
  - Longo prazo: completar coleção "sazonal", desbloquear temas visuais novos.
- **Monetização:** freemium com cosméticos de decoração (maior potencial de IAP em jogos de "cuidado") + anúncio recompensado opcional; sem energia/vidas limitantes agressivas.
- **MVP (entra):** 1 espaço de jardim, 12 variedades colecionáveis, crescimento idle básico, loja cosmética pequena.
- **MVP (fica fora):** sistema social/presentes, eventos sazonais, expansão de espaço, combinações genéticas complexas.
- **Roadmap:** MVP (loop de colheita+coleção) → v1 (expansão de espaço, loja cosmética maior) → v2 (sistema social assíncrono, eventos sazonais).
- **Riscos:** arte/custo de produção visual é maior que nos outros conceitos de jogo (depende de qualidade estética para converter); mercado "cozy/care game" tem concorrentes fortes e marcas estabelecidas; precisa de pipeline de arte original robusto desde o MVP.

---

## C05 — micro-SaaS "InvoiceLoop"

- **Categoria/Plataforma:** micro-SaaS B2B — web app (responsivo), sem app nativo no MVP.
- **Problema resolvido:** freelancers e microempresas (1–5 pessoas) perdem tempo/dinheiro com follow-up manual de faturas atrasadas e não têm visibilidade simples de fluxo de caixa futuro.
- **Público-alvo:** freelancers, consultores e agências pequenas que faturam por projeto/retainer, sem orçamento para ERP completo.
- **Proposta de valor:** cobrança automática e previsão de caixa simples, configurável em minutos, sem integração contábil complexa.
- **Diferencial [H]:** ferramentas de fatura existentes (categoria "invoicing SaaS") geralmente fazem emissão de fatura bem, mas follow-up de cobrança e previsão de caixa ficam fracos ou são add-ons caros; InvoiceLoop foca só nisso, com preço de entrada baixo.
- **Funcionalidades principais:** lembretes automáticos escalonados (e-mail, depois WhatsApp opcional); dashboard de previsão de caixa (recebíveis futuros); templates de fatura; integração com Stripe/PIX para link de pagamento.
- **Monetização:** assinatura mensal (ex.: plano único simples, preço baixo tipo US$9–15/mês) por número de clientes ativos cobrados.
- **MVP (entra):** criação de fatura, lembretes automáticos por e-mail, link de pagamento via Stripe, dashboard básico de recebíveis.
- **MVP (fica fora):** WhatsApp, integração contábil/NF-e, multi-moeda avançada, relatórios customizados.
- **Roadmap:** MVP (fatura + lembrete + link de pagamento) → v1 (dashboard de previsão de caixa, PIX) → v2 (WhatsApp, integrações contábeis, multiusuário/agência).
- **Riscos:** categoria com muitos concorrentes estabelecidos (risco de ser "mais um"); emissão fiscal (NF-e no Brasil) é complexidade regulatória real se expandir; depende de integração de pagamento de terceiros (Stripe) com custo/compliance.

---

## C06 — micro-SaaS "StatusPing"

- **Categoria/Plataforma:** micro-SaaS de monitoramento — web app + webhook/API, sem app nativo no MVP.
- **Problema resolvido:** donos de pequenos sites/produtos (indie makers, pequenas agências) não sabem quando seu site/API cai e descobrem pelo cliente reclamando.
- **Público-alvo:** indie hackers, pequenas agências digitais, donos de SaaS early-stage que não querem pagar por ferramentas enterprise de observabilidade.
- **Proposta de valor:** monitoramento de uptime + status page pública simples, configurado em 2 minutos, com preço de entrada muito baixo ou free tier real.
- **Diferencial [H]:** categoria "uptime monitoring" tem players estabelecidos com planos que escalam caro rápido para múltiplos monitores; StatusPing foca em simplicidade radical e preço fixo baixo para quem tem poucos serviços (1–10 endpoints).
- **Funcionalidades principais:** checagem periódica de endpoints (HTTP/ping); alertas por e-mail/webhook (Discord/Slack); página de status pública customizável (subdomínio); histórico simples de incidentes.
- **Monetização:** freemium (1–2 monitores grátis) + plano pago baixo por faixa de nº de monitores.
- **MVP (entra):** checagem HTTP a cada N minutos, alerta por e-mail, página de status pública básica.
- **MVP (fica fora):** alertas multi-canal (Slack/Discord), checagem de regiões múltiplas, SLA/relatórios avançados.
- **Roadmap:** MVP (monitor + alerta e-mail + status page) → v1 (webhooks Slack/Discord, múltiplas regiões de checagem) → v2 (relatórios de SLA, times/múltiplos usuários).
- **Riscos:** infraestrutura de checagem distribuída tem custo operacional real se escalar (precisa monitorar o próprio custo de infra); categoria competitiva com players com anos de confiança de marca; falsos positivos de alerta destroem confiança rápido — exige engenharia cuidadosa de retry/threshold.

---

## C07 — micro-SaaS "ReplyDraft"

- **Categoria/Plataforma:** micro-SaaS AI-powered — extensão de navegador + web app leve.
- **Problema resolvido:** pequenos negócios e suporte solo (e-commerce pequeno, freelancers que atendem cliente) gastam tempo demais escrevendo respostas repetitivas de e-mail/chat/review.
- **Público-alvo:** donos de e-commerce pequeno, freelancers de atendimento, pequenas equipes de suporte sem orçamento para Zendesk+IA enterprise.
- **Proposta de valor:** rascunhos de resposta gerados por IA a partir do histórico e do tom da marca, revisáveis em 1 clique, sem precisar sair da ferramenta que já usam (Gmail, chat do e-commerce).
- **Diferencial [H]:** ferramentas de "IA para e-mail" tendem a ser genéricas (tom neutro, sem contexto de histórico do cliente) ou acopladas a uma plataforma de helpdesk cara; ReplyDraft funciona como camada leve sobre o que a pessoa já usa, com biblioteca de "tom de voz" configurável.
- **Funcionalidades principais:** extensão de navegador (Gmail/Webmail) com botão "gerar rascunho"; biblioteca de tom de voz/exemplos da marca; histórico de respostas aprovadas para fine-tuning de prompt (não de modelo); rascunho multilíngue.
- **Monetização:** assinatura mensal por nº de rascunhos gerados/mês (plano de entrada barato, custo de IA via API de terceiros repassado na precificação).
- **MVP (entra):** extensão de navegador para Gmail, geração de rascunho a partir do e-mail recebido + 1 exemplo de tom, edição manual antes de enviar.
- **MVP (fica fora):** multi-canal (chat/reviews), fine-tuning de tom avançado, suporte multilíngue, times multiusuário.
- **Roadmap:** MVP (extensão Gmail + rascunho básico) → v1 (biblioteca de tom, multilíngue) → v2 (canais de chat/review, multiusuário/equipe).
- **Riscos:** depende de custo e disponibilidade de API de LLM de terceiros (risco de margem e de mudança de preço do provedor); privacidade de dados de cliente é sensível (precisa de política clara, não pode logar conteúdo sem consentimento); extensões de navegador têm fricção de distribuição/aprovação em lojas.

---

## C08 — app "FocusRail" (productivity)

- **Categoria/Plataforma:** app de produtividade (foco/timeboxing) — mobile-first (Android/iOS) com sync web leve.
- **Problema resolvido:** pessoas com TDAH/procrastinação crônica ou trabalho remoto distraído não conseguem manter blocos de foco sem fricção de configurar apps complexos de produtividade.
- **Público-alvo:** profissionais remotos, estudantes, pessoas que já tentaram Pomodoro apps e abandonaram por fricção ou falta de ajuste à rotina real.
- **Proposta de valor:** blocos de foco adaptativos que aprendem o ritmo real da pessoa (não um Pomodoro fixo de 25 min) e dão feedback visual simples de progresso ao longo do dia/semana.
- **Diferencial [H]:** apps de Pomodoro/foco existentes em geral são tempo fixo + gamificação genérica (árvores que crescem, etc.); FocusRail adapta a duração do bloco ao histórico real da pessoa e evita tema visual já batido ("plantinha").
- **Funcionalidades principais:** timer de foco adaptativo; relatório semanal de padrão de foco; modo "não perturbe" integrado (bloqueio leve de notificações durante bloco); histórico/streak sem culpa (sem punir falha).
- **Monetização:** freemium — timer básico grátis, relatórios avançados e histórico longo em assinatura mensal/anual barata.
- **MVP (entra):** timer de foco com duração ajustável manualmente, histórico simples de blocos completados, streak básico.
- **MVP (fica fora):** adaptação automática por IA/histórico, bloqueio de notificações, relatórios avançados.
- **Roadmap:** MVP (timer + histórico simples) → v1 (relatório semanal, modo não perturbe) → v2 (adaptação automática do bloco por padrão de uso, integração com calendário).
- **Riscos:** categoria de produtividade é extremamente saturada (App Store tem centenas de timers de foco); diferencial de "adaptação por histórico" só se prova com dados reais de uso — exige volume de usuários para validar; monetização freemium em produtividade tem conversão historicamente baixa sem marca forte.

---

## C09 — app "Receipt Clear" (utility)

- **Categoria/Plataforma:** app utilitário (organização financeira pessoal) — mobile-first (Android/iOS), câmera obrigatória.
- **Problema resolvido:** pessoas autônomas/PJ e famílias organizadas guardam recibos físicos/digitais de forma caótica e perdem tempo na hora de declarar imposto ou fazer reembolso de despesa.
- **Público-alvo:** autônomos/PJ, pequenos empresários, famílias que organizam gastos para IR ou reembolso corporativo.
- **Proposta de valor:** fotografar o recibo e ter categorização automática + exportação pronta para declaração/reembolso, sem precisar digitar nada manualmente.
- **Diferencial [H]:** apps de organização de recibo tendem a ser scanner genérico (vira PDF, sem categorização útil) ou parte de um app de contabilidade pesado e caro; Receipt Clear foca só na etapa de captura+categorização+exportação, simples e barato.
- **Funcionalidades principais:** captura por câmera com recorte automático; categorização automática por OCR+regras (ex.: "alimentação", "transporte"); exportação em CSV/PDF por período; busca por recibo (valor, data, categoria).
- **Monetização:** compra única com limite de recibos/mês no tier grátis, ou assinatura barata para volume ilimitado + exportação avançada.
- **MVP (entra):** captura por câmera, OCR básico de valor/data/estabelecimento, categorização manual com sugestão automática simples, exportação CSV.
- **MVP (fica fora):** integração direta com sistemas de declaração de IR, exportação PDF formatada, múltiplos usuários/família compartilhada.
- **Roadmap:** MVP (captura + OCR básico + export CSV) → v1 (categorização automática melhor, export PDF, busca) → v2 (compartilhamento família/equipe, integrações com ferramentas de contabilidade).
- **Riscos:** qualidade de OCR em recibos variados (papel térmico desbotado, fotos ruins) é tecnicamente difícil — exige teste extensivo com dados reais; app depende de permissão de câmera/armazenamento, sensível a políticas de privacidade das lojas; monetização de utility apps tende a converter pouco sem um gatilho claro (ex.: época de IR).

---

## C10 — app "Notebrief" (AI-powered)

- **Categoria/Plataforma:** app AI-powered de produtividade pessoal — mobile + web (PWA), foco em captura rápida.
- **Problema resolvido:** pessoas acumulam notas de voz, prints de tela e anotações soltas de reuniões/ideias e nunca mais revisitam ou conseguem extrair ação prática delas.
- **Público-alvo:** profissionais que fazem muitas reuniões/calls curtas (freelancers, consultores, fundadores solo) e precisam de resumo + próximos passos sem ferramenta corporativa pesada.
- **Proposta de valor:** gravar/anotar rápido e receber automaticamente um resumo + lista de próximos passos, sem precisar estruturar nada na hora da captura.
- **Diferencial [H]:** ferramentas de nota com IA existentes tendem a ser notetakers de reunião corporativos (caros, exigem integração de calendário/Zoom) ou apps de nota genéricos sem resumo de ação; Notebrief foca no caso "captura solo e rápida" sem exigir setup de calendário.
- **Funcionalidades principais:** captura por voz ou texto em 1 toque; resumo automático + lista de próximos passos extraída; busca semântica entre notas antigas; exportação para lista de tarefas simples.
- **Monetização:** freemium (limite de minutos de transcrição/mês grátis) + assinatura mensal para volume maior e busca semântica.
- **MVP (entra):** captura de voz/texto, transcrição+resumo automático via API de IA de terceiros, lista simples de notas.
- **MVP (fica fora):** busca semântica avançada, exportação para ferramentas externas de tarefas, integração com calendário/chamadas.
- **Roadmap:** MVP (captura + resumo automático) → v1 (busca semântica, exportação para tarefas) → v2 (integração com calendário/chamadas, times pequenos).
- **Riscos:** depende de custo/qualidade de API de transcrição+LLM de terceiros (risco de margem); precisão de resumo de IA pode frustrar se "próximos passos" vierem errados — exige revisão/edição fácil pelo usuário; privacidade de conteúdo de voz é sensível (precisa de política clara de retenção de dados).

---

## Tabela-resumo

| # | Nome | Categoria | Plataforma | Monetização | MVP (P/M/G) | Nota (1–5) | Justificativa |
|---|------|-----------|-------------|--------------|--------------|-------------|----------------|
| C01 | Loopwright | Jogo idle + coleção | Web→Mobile | Ads + IAP cosmético | M | 4 | Gênero com demanda comprovada [H], loop replicável, mas competitivo e precisa de bom balanceamento. |
| C02 | Fathom Freight | Jogo strategy browser | Web | Assinatura leve + cosmético | G | 2 | Alcance orgânico menor (nicho browser) e maior complexidade de balanceamento econômico. |
| C03 | Scrapline | Jogo incremental/factory | Mobile+Web | Premium ou freemium+ads | M | 3 | Diferencial forte, mas UX de grid em touch é risco de execução não testado. |
| C04 | Pocket Orchard | Jogo casual coleção+idle | Mobile | Freemium cosmético | M/G | 3 | Monetização historicamente boa no gênero "cozy", mas exige investimento de arte maior que os outros. |
| C05 | InvoiceLoop | Micro-SaaS cobrança | Web | Assinatura mensal | P | 3 | Problema real e recorrente, mas categoria com concorrência estabelecida; receita recorrente clara. |
| C06 | StatusPing | Micro-SaaS monitoramento | Web | Freemium + assinatura | P | 3 | MVP simples e barato de infra no início, mas custo de infra escala com monitores; marca é barreira. |
| C07 | ReplyDraft | Micro-SaaS AI | Web + extensão | Assinatura por uso | P | 4 | Problema claro, uso de IA como diferencial real, custo de API é a única fricção de margem. |
| C08 | FocusRail | App productivity | Mobile | Freemium | P | 2 | Categoria extremamente saturada; diferencial depende de dados que só vêm com escala. |
| C09 | Receipt Clear | App utility | Mobile | Compra única/assinatura | P/M | 2 | Gatilho de uso sazonal (IR) limita retenção; qualidade de OCR é risco técnico relevante. |
| C10 | Notebrief | App AI-powered | Mobile+Web | Freemium + assinatura | P | 4 | Problema recorrente e específico, uso de IA bem direcionado, MVP pequeno e testável rápido. |

*Legenda MVP: P = pequeno (2–4 semanas), M = médio (4–8 semanas), G = grande (8+ semanas, acima da meta do estúdio).*

---

## Observações finais

- Todas as marcações **[H]** de "sem colisão de nome" e "demanda de mercado" precisam de verificação com busca ao vivo antes de qualquer decisão de investimento — a busca web falhou (429) nesta sessão em 2026-11-08.
- Nenhum nome, personagem, arte ou mecânica-assinatura de produto existente foi usado; nomes provisórios podem ainda colidir com marcas registradas e devem passar por checagem de trademark/domínio antes de uso público.
- Conceitos marcados com MVP "G" (C02, parcialmente C04) excedem a meta de 4–8 semanas do estúdio e exigiriam corte de escopo adicional para entrar no MVP ideal.
