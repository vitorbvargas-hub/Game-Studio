# Panels Spec v3 — Guilda, Correio, Passe, Fonte dos Desejos, Chefe Mundial, Conquistas, Configurações

- **Autor:** game-design (UI-UX-DESIGNER) · **Data:** 2026-11-10
- **Gatilho:** feedback do fundador, item 2 (`quality-overhaul/PROJECT_LOG.md`, 2026-11-10 ~06:1x): *"Terminar os itens do painel... as abas ainda são placeholders."*
- **Base:** `docs/GDD_MMO_V1.md` (World Boss §4, Economia §7, Arena §5 — únicos sistemas desta lista já especificados), `shared/decisions/ADR-007-...md` (condição 1: sem monetização de nenhum tipo), `docs/REFERENCE_LIBRARY.md` (mecânicas genéricas aproveitáveis do IdleDex, nunca a casca/nomes), `teardowns/IDLEDEX.md`, `P8_HUD_V2_SPEC.md` (sistema de moldura/paleta reaproveitado), `HUD_IDENTITY_V3.md` (entrega irmã, de onde esses painéis são abertos), arquitetura real do código (`prototype/world/src/ui/panel.ts`, `screens.ts`, `main.ts`).
- **Achado estrutural:** `docs/GDD_MMO_V1.md` **não especifica** Guilda nem Correio em lugar nenhum (grep confirmado, zero ocorrências com conteúdo funcional). Fonte dos Desejos não tem definição de mecânica em documento nenhum do estúdio — só aparece como rótulo de UI (`VISUAL_ANALYSIS_V2.md` linha 26, `hud.ts`). Chefe Mundial e Passe (Arena) **já têm** spec no GDD (§4, §5) — esses dois painéis aqui só dão casca de UI a uma mecânica que já existe; os outros quatro (Guilda, Correio, Fonte dos Desejos, Passe de Temporada) são **sistema novo**, proposto por mim nesta entrega, marcado [H] onde não há base.
- **Arquitetura herdada (não muda):** cada painel é um `Panel` (`panel.ts`) — modal com header/×/corpo rolável, aberto por `data-short` no `.hud-menu`/hub do `HUD_IDENTITY_V3.md`, HTML puro gerado por uma função em `screens.ts`, sem estado de jogo próprio na view (lê de `save`/`content`). Nenhum painel aqui inventa uma arquitetura nova.
- **Sem servidor (confirmado, `GDD_MMO_V1.md` §0):** todo painel "social" (Guilda, Correio, ranking de Chefe Mundial) é **local**, com dados mockados de forma explícita (bots/placeholders), no mesmo espírito que o World Boss já usa (§4.2) — nunca finge ter outros jogadores reais.
- **ADR-007, condição 1, reforçada pelo briefing:** nenhum painel aqui tem caminho de compra com dinheiro real. Onde o IdleDex usa moeda premium comprável, aqui ela — quando existe — é só um sink cosmético ganho jogando (Passe, §3).

---

## 0. Convenção usada em cada seção

- **Objetivo:** por que o painel existe, em 1–2 frases.
- **Dados:** o que é **[E]** (já existe na sim/GDD) vs. **[H mock local]** (não existe backend; valor fixo/determinístico calculado no cliente, deixado explícito na UI como tal, nunca disfarçado de dado real).
- **Layout:** estrutura do painel, em texto (não ASCII — os painéis são listas/formulários, não composição espacial; ASCII fica para o `HUD_IDENTITY_V3.md`).
- **Estados:** vazio, carregando, bloqueado (quando aplicável).
- **Critérios de aceite:** lista verificável por game-qa.

---

## 1. Guilda

### Objetivo

Dar ao jogador uma identidade social persistente e um motivo para voltar a uma rota específica (disputa territorial), adaptando o conceito genérico "Guild War" do IdleDex (`teardowns/IDLEDEX.md` linha 157: *"adaptar o conceito (guildas disputando zonas com bônus temporários)... sem copiar a mecânica Pokémon-específica"*) — sem copiar nomes, bandeiras ou UI.

### Dados

- **[H, sistema novo]** Não há Guilda em `GDD_MMO_V1.md`. Entidade proposta: `{ id, name (jogador define, até 18 caracteres), emblemId (1 de 12 predefinidos — sem upload, sem moderação possível sem servidor), createdAt }`.
- **[H mock local]** Sem servidor, **não existem outros jogadores reais** para preencher uma guilda. Dois caminhos ficam visíveis ao jogador, nunca escondidos:
  - **Fundar:** cria uma guilda com 1 membro (o próprio jogador). É o caminho honesto — a UI nunca finge ter mais gente.
  - **Entrar:** lista 3–5 "guildas-bot" fixas por região (nomes genéricos gerados localmente, ex. "Punho do Dragão", sem IP) com contagem de membros falsa mas **rotulada** ("12 membros simulados — sem servidor ainda"). Entrar nessas não muda a jogabilidade do jogador (é cosmético/social), só preenche a lista de "guildas rivais" para a disputa de rota ter contexto.
- **[H mock local] Rota dominada:** cada rota das 6 regiões (`GDD_MMO_V1.md` §1.2/§1.3) acumula "pontos de contribuição" por guilda-bot (incrementados por um relógio local determinístico, não aleatório, para ser reproduzível em QA) mais os pontos reais do jogador (ver Contribuição). A guilda com mais pontos na rota nos últimos 7 dias de jogo é a "dominante" — mostrado no painel da Guilda, não mais na HUD permanente (ver `HUD_IDENTITY_V3.md` §4, linha "Guilda dominante").
- **[E, reaproveitado] Contribuição:** pontos = XP de vitória já emitido pelo evento `reward` (`hud.ts` `case "reward"`) enquanto o jogador está na rota e tem guilda — **nenhum evento novo na sim**, só uma soma feita na UI/save a partir do que já é emitido.
- **Cargo:** só "Líder" é funcional nesta versão (o único membro real é o próprio jogador). Cargos de Oficial/Membro ficam no schema (`role: "leader" | "officer" | "member"`) para quando houver servidor (Fase 3+ do `GDD_MMO_V1.md` §7), mas a UI não oferece "promover" enquanto não há 2º jogador real — **não construir uma tela de promoção para 1 pessoa**.

### Layout

- **Sem guilda:** 2 botões grandes, "Fundar guilda" (abre formulário: nome + 1 de 12 emblemas) e "Entrar em uma guilda" (lista as 3–5 guildas-bot da região atual, com o aviso "simulada — sem servidor ainda" em todas).
- **Com guilda:** cabeçalho (emblema, nome, cargo do jogador); lista de membros (hoje: só o jogador, com indicador visual "você"); seção "Rota atual: Floresta Densa — dominada por [guilda-bot ou a sua]", barra de contribuição (pontos da sua guilda vs. 2ª colocada, últimos 7 dias); botão "Sair da guilda" (com confirmação, mesmo padrão de "Resetar save" em `screens.ts`).

### Estados

- **Vazio:** tela "Sem guilda" acima — nunca um painel em branco sem CTA.
- **Carregando:** não aplicável (dado local, síncrono).
- **Bloqueado:** fundar/entrar exige Tamer nível 5 **[H, gate de progressão consistente com outros desbloqueios do GDD, ex. regiões por nível]**; abaixo disso, os 2 botões aparecem desabilitados com o motivo ("Disponível a partir do Nível 5").

### Critérios de aceite

- [ ] Fundar grava `{id, name, emblemId}` no save; reabrir o jogo mantém a guilda.
- [ ] Entrar numa guilda-bot sempre mostra o aviso "simulada — sem servidor ainda" sem exceção (nenhuma tela some com esse aviso).
- [ ] A barra de contribuição usa só XP de vitórias já emitidas pelo evento `reward` existente — nenhum contador nasce de um evento novo na sim.
- [ ] "Guilda dominante da rota" não aparece em nenhuma caixa permanente da HUD fora deste painel (ver `HUD_IDENTITY_V3.md`).

---

## 2. Correio

### Objetivo

Entregar recompensas e avisos de forma assíncrona (o jogador não precisa estar olhando a tela no momento exato de um evento) — cobre o gap de "sem servidor, sem chat real entre jogadores", mas ainda dá uma caixa de entrada com conteúdo real.

### Dados

- **[H, sistema novo]** Não é mensagem jogador-para-jogador (não existe servidor para isso — isso é o `.hud-chat` simulado já existente, que não muda aqui). É **correio do sistema**: entrada = `{ id, iconId, subject, body, attachment?: {bits?, itemId?, qty?}, read: bool, ts }`.
- **[E, reaproveitado] Gatilhos de criação de correio** (nenhum evento novo na sim — só a UI decide "em vez de um toast instantâneo, manda para o correio"):
  - Primeira vez que o jogo é aberto: carta de boas-vindas com 1 item de cura (reaproveita `economyJson.items`).
  - Conclusão de uma missão de coleção/`milestone` (já existe em `questlog`/`questsHtml`) cuja recompensa não foi reclamada em 48h de jogo — vira correio em vez de só ficar pendente na aba Missões (evita perda de recompensa percebida).
  - Recompensa de participação do Chefe Mundial (§5) quando o jogador estava offline no momento em que a janela fechou.
  - Fechamento de temporada do Passe (§3): recompensas de níveis não coletados chegam por correio.

### Layout

- Lista (mais recente no topo): ícone por tipo (gift/mail/boss conforme a fonte), assunto, data relativa ("há 2 dias"), ponto de não-lido (`--ui-red`, 6px). Clicar abre o corpo da carta à direita (ou embaixo em telas estreitas) com o texto e, se houver anexo, um chip "Coletar" (reaproveita exatamente o botão `data-claim` de `questsHtml`).
- Correio sem anexo (só aviso) não tem botão "Coletar" — só "Marcar como lida" implícito ao abrir.
- Limite de 20 itens guardados; o mais antigo **sem anexo pendente** expira primeiro ao passar do limite (nunca descarta algo com recompensa não coletada).

### Estados

- **Vazio:** "Sem correspondências." (nunca acontece de fato no fluxo normal, porque a carta de boas-vindas sempre existe desde o primeiro login — mas a mensagem de vazio existe para o caso de todas as cartas serem lidas/expiradas).
- **Carregando:** não aplicável.
- **Bloqueado:** não aplicável — correio é sempre acessível.

### Critérios de aceite

- [ ] A carta de boas-vindas existe no save desde a primeira sessão e nunca é duplicada em sessões seguintes.
- [ ] Clicar "Coletar" move o anexo para o inventário/bits usando o mesmo caminho de `onClaim` já usado pelas Missões — nenhum novo caminho de concessão de item é criado.
- [ ] Uma carta com anexo não coletado nunca é removida pelo limite de 20 (testar enchendo o correio).
- [ ] O ponto de não-lido reflete exatamente `read === false`; abrir a carta marca `read = true` de forma persistente (sobrevive a recarregar).

---

## 3. Passe de Temporada

### Objetivo

Dar uma trilha de progressão de médio prazo (14 dias) **100% gratuita**, reaproveitando o conceito genérico de "temporada com trilha de níveis e recompensa cosmética" (`teardowns/IDLEDEX.md` linha 109, 151) sem a camada paga.

### Regra de monetização (explícita, por pedido do briefing)

**Não há trilha paga, não há moeda premium comprável, não há nada no Passe que se compre com dinheiro real** — condição 1 do ADR-007, reforçada pelo briefing desta entrega ("o Passe e a moeda premium ficam só como sistema de progressão gratuita/visual"). A "moeda" interna do Passe (nome provisório: **Cristal Digital**, deliberadamente diferente de "Gold"/"Pass Token" do IdleDex, `REFERENCE_LIBRARY.md`) só é **ganha jogando** e só é **gasta em cosméticos** dentro do próprio jogo — nunca comprada, nunca trocada por dinheiro.

### Dados

- **[H, sistema novo, duração alinhada ao que já existe]** Temporada de **14 dias** (mesma duração já definida para a Arena Clássica, `GDD_MMO_V1.md` §5.1 — reaproveita um número já decidido em vez de inventar um segundo ciclo de calendário).
- **Trilha:** 20 níveis (menor que os 55 do IdleDex de propósito — nosso jogo tem muito menos conteúdo de recompensa cosmética hoje; 20 é o que cabe sem inventar itens que não existem). Cada nível pede X "Pontos de Passe".
- **[E, reaproveitado] Fonte de Pontos de Passe:** 1:1 com XP de missão diária já existente (`questsHtml`, categoria `daily`) + bônus fixo por participação no Chefe Mundial (§5) — **nenhum grind novo**, o Passe é uma segunda leitura de progresso que já está sendo gerado.
- **Recompensas:** só bits, Cristal Digital (cosmético) e itens cosméticos (moldura de retrato, título) — nunca vantagem de poder, igual à regra já fixada para Arena/World Boss (`GDD_MMO_V1.md` §5.4). Como o jogo ainda não tem cosméticos de Tamer produzidos, os primeiros níveis usam **bits + Cristal Digital**; níveis com cosmético ficam marcados "em produção" até existir arte (não bloqueia o lançamento do sistema, só os itens que faltam — ver Prioridades).

### Layout

- Trilha horizontal com 20 marcadores, posição atual destacada (moldura nível 2 dourada, igual ao estado "seleção" do P8 §3); os 3 próximos níveis mostram preview da recompensa; níveis já coletados ficam com check.
- Abaixo da trilha: contagem "Pontos de Passe: X / próximo nível Y" e "Temporada termina em N dias".
- Sem sub-aba de missões própria — reaproveita a aba Missões existente (`questsHtml`) como fonte; o Passe só lê o progresso, não duplica a lista.

### Estados

- **Vazio/antes da 1ª temporada:** "Nova temporada começa com o seu próximo login" — a temporada é ancorada no primeiro login do save (`GDD_MMO_V1.md` não tem relógio de servidor; usar o relógio local do jogo).
- **Carregando:** não aplicável.
- **Bloqueado:** nenhum — disponível desde o início (convenção do gênero, confirmada no teardown do IdleDex).
- **Temporada encerrada, níveis não coletados:** vira correio (§2) — nunca perde a recompensa.

### Critérios de aceite

- [ ] Nenhum elemento de UI do Passe tem um caminho para dinheiro real (verificação negativa explícita — procurar por qualquer botão "comprar"/preço em moeda real, não deve existir nenhum).
- [ ] Pontos de Passe avançam só a partir de fontes já existentes (missão diária, participação Chefe Mundial) — sem contador próprio paralelo.
- [ ] Virada de temporada move recompensas não coletadas para o Correio, nunca as descarta.
- [ ] Cristal Digital nunca aparece em nenhuma tela com um valor de preço em dinheiro — só em "custo: N Cristais" dentro de uma futura loja cosmética (fora do escopo desta entrega, ver Prioridades P2).

---

## 4. Fonte dos Desejos — o que é a %?

### Definição (proposta nova, [H] — não existe em documento nenhum do estúdio)

Não há especificação prévia; o rótulo "Fonte dos Desejos · 61%" (`hud.ts`) é um placeholder herdado sem mecânica. Adapto o conceito genérico mais próximo do teardown do IdleDex — o **"Shiny Boost" em escada** (`teardowns/IDLEDEX.md` linha 81, 161: *"acumula tempo, sobe degraus, reseta ao usar o prêmio"*) — sem copiar shiny (o GS-003 não tem variantes shiny) e sem copiar o nome.

**A Fonte dos Desejos é um medidor de sorte acumulada (0–100%)**, que sobe com o jogo normal (sem clique extra do jogador) e, ao chegar a 100%, pode ser **"consumida" por um pedido** que dá um bônus temporário de varredura/captura. Ela não dá item, não dá bits — só melhora a chance de algo raro acontecer por um tempo curto.

### Dados

- **[E, reaproveitado no cálculo] Acúmulo:** +1% por vitória confirmada (evento `reward` já existente) + +1% a cada 10 minutos de jogo ativo (contador de tempo já existente para o offline progress, `GDD_MMO_V1.md` §0) — teto 100%, sem decaimento.
- **[H, novo, mas plugado em sistema existente] Efeito do pedido:** ao chegar a 100% e o jogador clicar "Fazer um pedido", a % zera e abre uma janela de **15 minutos de jogo** em que `modDados` da fórmula de varredura (`GDD_MMO_V1.md` §6.1: `baseSpecies × modDados × modItem × modHP × modNível`) recebe um multiplicador adicional `×1,5` — reaproveita a fórmula de captura já especificada, **não inventa um sistema de sorte paralelo**.
- Durante a janela ativa, um ícone pequeno com contagem regressiva fica visível (local a definir pelo game-dev dentro do sistema de buffs/ícones já existente, se houver; senão, um texto simples no painel + 1 linha no log de combate ao expirar).

### Layout

- Mostrador circular central (o mesmo componente do `HUD_IDENTITY_V3.md` Alt B §3.2, ou, na Alt A, uma versão maior deste mesmo mostrador dentro do painel): anel preenchido 0–100%, número no centro.
- Abaixo: texto explicando o efeito em 1 frase ("Ao completar, ganhe +50% de chance de varredura por 15 minutos") — sem esconder a mecânica atrás de um nome místico sem explicação, ao contrário do placeholder atual.
- Botão "Fazer um pedido", desabilitado até 100%, com texto do estado ("68% — continue jogando" / "100% — pedido disponível!").
- Se uma janela de bônus está ativa: o botão vira um contador regressivo ("Pedido ativo: 11:32 restantes"), sem permitir acumular um segundo pedido em paralelo.

### Estados

- **Enchendo (0–99%):** mostrador parcial, botão desabilitado.
- **Pronto (100%):** mostrador cheio, pulso sutil (reaproveita a transição de "confirmação" do P8 §3), botão habilitado.
- **Ativo (pós-pedido):** contador regressivo, mostrador zerado e recomeçando a enchimento em paralelo (o jogador pode voltar a acumular enquanto o bônus anterior ainda corre).
- **Bloqueado:** nenhum — disponível desde o início.

### Critérios de aceite

- [ ] A % só sobe por vitória confirmada ou por tempo de jogo ativo — nunca por clique manual nem por compra.
- [ ] Ao atingir 100%, "Fazer um pedido" fica habilitado e some ao clicar, zerando a % e abrindo a janela de 15 min.
- [ ] Durante a janela ativa, uma varredura/captura real usa `modDados × 1,5` (testar com `?encdebug=1` comparando a chance exibida com e sem a janela ativa).
- [ ] A explicação do efeito está sempre visível no painel (não é preciso abrir um tooltip ou outro menu para saber o que a % faz).

---

## 5. Chefe Mundial

### Objetivo

Dar casca de UI ao sistema **que já está especificado** em `GDD_MMO_V1.md` §4 — este painel não inventa mecânica, só decide layout/estado/timer.

### Dados

- **[E, já especificado, `GDD_MMO_V1.md` §4.2]** Versão local v1: HP "global" = HP da instância local do jogador; janela simulada: botão "Despertar o Chefão" 1x por dia de jogo; dano por contribuição = 100% (sem outros jogadores reais); recompensa de participação = recompensa cheia.
- **[E, `GDD_MMO_V1.md` §4.4]** Boss por região: Floresta Densa ainda sem Mega confirmado (usar o chefe de região normal, Kuwagamon, como "Chefão" da v1 local nesta região — não inventar um Mega não verificado); Zona Corrompida usa VenomMyotismon quando essa região existir.
- **[H mock local] Ranking:** sem servidor, não há ranking real. O painel mostra só a linha do próprio jogador ("Sua contribuição: 100%") com uma nota explícita "Ranking entre jogadores chega com o servidor (Fase 3+, `GDD_MMO_V1.md` §7)" — **nunca inventa nomes de outros jogadores no ranking** (diferente da Guilda, onde guildas-bot são aceitáveis como contexto social; um ranking de PvE com jogadores falsos seria enganoso de um jeito que uma lista de guildas não é).

### Layout

- Banner do chefão (retrato + nome + nível), barra de HP do chefão (nível 1, mesma moldura reativa do P8 §2.1, mas sem reagir a "PV do jogador" — reage ao HP do próprio boss: sempre vermelho/crítico visualmente conforme desce, já que é intencionalmente um alvo que se quer abater).
- Estado "disponível": botão "Despertar o Chefão" central.
- Estado "em cooldown": contagem regressiva até o próximo "Despertar" disponível (1x/dia de jogo).
- Estado "em combate": barra de HP ao vivo + log de dano causado (reaproveita o `.hud-log` já existente, filtrado).
- Estado "derrotado"/"tempo esgotado": tela de recompensa (bits + item, conforme §5.4 do GDD) com botão "Coletar" — mesma mecânica de claim das Missões.
- Linha "Sua contribuição: 100%" com a nota de ranking acima.

### Estados

- **Bloqueado:** nenhum gate de nível adicional (o chefe de região já tem seu próprio gate de nível pela região, `GDD_MMO_V1.md` §1.2) — o painel em si é sempre acessível para consulta, mesmo em cooldown.
- **Cooldown:** contagem regressiva (substitui o "6h55" fixo do placeholder — aqui o número é real, calculado a partir do último "Despertar").
- **Ativo:** combate em andamento.
- **Recompensa pendente:** tela de coleta.

### Critérios de aceite

- [ ] "Despertar o Chefão" só fica disponível 1x por dia de jogo (verificar que o cooldown persiste entre sessões, lido do save).
- [ ] A recompensa de participação é sempre a recompensa cheia (dano por contribuição = 100%, conforme GDD §4.2) — nenhuma fração é aplicada na versão local.
- [ ] O painel nunca mostra nomes de outros jogadores no ranking — só a linha do próprio jogador + a nota de "chega com o servidor".
- [ ] Toda recompensa é bits/item comum/cosmético — nenhuma vantagem de poder (conferir contra `GDD_MMO_V1.md` §5.4).

---

## 6. Conquistas

### Objetivo

Dar um checklist de marcos de longo prazo, reaproveitando só eventos que já existem na sim — sem criar um sistema de tracking paralelo.

### Dados

- **[H, sistema novo, mas 100% sobre eventos existentes]** Lista de conquistas em um arquivo de dados (mesmo padrão de `economyJson`/`questlog` — content pack, consistente com ADR-007 condição 5), cada uma: `{ id, category: "exploração"|"combate"|"coleção"|"social", title, description, goal, rewardText, trackable }`.
- **Exemplos de gatilho, todos [E] eventos já emitidos pela sim (`hud.ts onEvents`):**
  - "Primeira captura" — evento `capture` com `done: true`.
  - "Primeira evolução" — evento `evolve`.
  - "Derrotou o chefe da Floresta Densa" — evento `defeat` do id do boss da região.
  - "Chegou ao Nível 10 (Tamer)" — contador de `tamerLevel` já existente no Hud.
  - "Entrou em uma guilda" / "Abriu o Correio pela primeira vez" — eventos de UI local dos painéis §1/§2 (não da sim de combate, mas ainda assim já emitidos por aquelas features, sem 3º sistema de tracking).

### Layout

- Abas por categoria (Exploração, Combate, Coleção, Social) — evita uma lista única gigante.
- Cada item: ícone (categoria), título, descrição, barra de progresso quando `trackable` (reaproveita `.dx-bar`/`.qs-item` já existente em `questsHtml`), botão "Coletar" quando completo (mesmo `data-claim` das Missões).
- Contagem no topo: "24/60 desbloqueadas".

### Estados

- **Bloqueada (progresso 0):** item em cinza/dessaturado (estado "bloqueado" do P8 §3), sem ícone de cadeado (não é uma trava de pré-requisito, é só "ainda não começou" — cadeado fica reservado para o que de fato está indisponível, ex. região não desbloqueada).
- **Em progresso:** barra parcial.
- **Completa, não coletada:** botão "Coletar" ativo.
- **Coletada:** check, sem botão.

### Critérios de aceite

- [ ] Toda conquista "trackable" avança a partir de um evento que **já existe** na sim ou num painel já especificado — nenhuma conquista exige inventar um evento novo só para ela.
- [ ] Coletar uma conquista usa o mesmo caminho de concessão das Missões (bits/item/cosmético) — sem caminho de recompensa duplicado.
- [ ] A lista é carregada de um arquivo de dados (não hardcoded em `screens.ts`), para crescer sem mudar código de UI (mesmo padrão de `economyJson`).

---

## 7. Configurações

### Nota — este painel já está implementado, não é placeholder

**[E, confirmado no código, `screens.ts` `settingsHtml` + `main.ts` linhas ~599–752]** Configurações já é funcional: toggle AUTO, toggle Auto-evoluir, seleção de Tempo do dia (Automático/Sempre dia/Sempre noite), Resetar save com confirmação. O item do briefing que pede "terminar as abas" não se aplica a este painel da mesma forma que aos outros 6 — ele já entrega o que promete.

### O que esta entrega pede aqui

- **Casca visual:** aplicar a moldura nível 2 (`P8_HUD_V2_SPEC.md` §2) ao modal, que hoje usa a mesma `.panel` genérica dos demais — mudança puramente visual, sem tocar na lógica.
- **Gap identificado, fora do GDD atual:** não há sistema de áudio implementado nesta prova (`grep` no código não encontra volume/música) — um controle de volume ficaria "fingindo" controlar algo que não existe. **Não especificado aqui**; fica como item futuro condicionado a existir uma sim de áudio primeiro (P2, só depois de `search_help`/decisão de game-dev sobre se o jogo terá áudio).

### Critérios de aceite

- [ ] O modal de Configurações usa a moldura nível 2 do P8 (chanfrada, borda `#3b4261` 2px) — verificação puramente visual, nenhum toggle muda de comportamento.
- [ ] Nenhuma opção nova de áudio é adicionada nesta entrega (evitar criar uma opção que não controla nada real).

---

## 8. Prioridades (P0/P1/P2)

| Prioridade | Itens | Critério de corte |
|---|---|---|
| **P0 — maior ganho por menor sistema novo** | (a) Chefe Mundial, UI completa (mecânica já 100% especificada no GDD, só falta casca); (b) Conquistas v1 (10–15 itens iniciais, todas sobre eventos já existentes); (c) Configurações, só a moldura nível 2 | Resolve 2 dos 6 placeholders sem inventar sistema de jogo novo, e termina o 7º item (Config.) por completo |
| **P1 — sistema novo pequeno, contido** | (a) Guilda v1 (fundar/entrar local, rota dominada, contribuição a partir de evento já existente); (b) Correio v1 (inbox alimentado pelos gatilhos já listados em §2); (c) Fonte dos Desejos v1 (medidor + 1 efeito plugado na fórmula de varredura já existente) | Cada um é contido (1 entidade de dado novo + reaproveitamento de evento existente), mas exige decisão de nomenclatura/gate de nível a confirmar com o fundador |
| **P2 — depende de produção de arte ou de outro sistema primeiro** | (a) Passe de Temporada completo (precisa de cosméticos de Tamer que ainda não existem — pode nascer com só bits/Cristal Digital nos primeiros níveis, cosméticos entram depois); (b) Loja cosmética para gastar Cristal Digital (não especificada nesta entrega — fora de escopo, "fica só como sistema de progressão", não precisa de loja ainda); (c) Ranking de Chefe Mundial com outros jogadores reais (exige servidor, Fase 3+ do GDD); (d) Sistema de áudio/volume em Configurações (não existe sim de áudio) | Depende de produção (arte) ou de infraestrutura (servidor) fora do controle desta entrega de design |

---

## 9. Limitações

- **Guilda, Correio e Fonte dos Desejos são sistemas 100% novos** propostos nesta entrega — não existe nenhuma base no GDD para eles; qualquer número aqui (teto de 20 níveis no Passe, +1%/vitória na Fonte dos Desejos, gate de nível 5 na Guilda) é uma primeira proposta de design, não um valor calibrado jogando (mesmo padrão `[H]` já usado em `MOVE_SYSTEM.md`/`GDD_MMO_V1.md`).
- **Nenhum nome de "Cristal Digital", guildas-bot ou qualquer rótulo aqui foi validado com o fundador** — são placeholders de nomenclatura própria (deliberadamente não-IdleDex), substituíveis sem custo antes da implementação.
- **Nenhuma arte, ícone novo ou tela foi produzida.** Os painéis reaproveitam os ícones já existentes em `icons.ts` (guild, mail, star, gift, boss, trophy, gear) — nenhum ícone novo foi necessário para esta spec.
- **Dependência do `HUD_IDENTITY_V3.md`:** os pontos de entrada destes painéis (hub radial ou trilho de insígnias) são definidos na entrega irmã; esta spec assume que algum ponto de entrada consistente existe, sem repetir a decisão de qual.
