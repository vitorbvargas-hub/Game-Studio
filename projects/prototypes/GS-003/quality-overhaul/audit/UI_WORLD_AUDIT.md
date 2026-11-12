# UI/HUD + mundo instanciado — auditoria (D3, Fase 1 diagnóstico)

- **Autor:** game-design (UI-UX-DESIGNER + WORLD-COMPOSER) · **Data:** 2026-11-09
- **Base:** ADR-012, GS-009 (`docs/briefing/14_gs009_instanced_world.md`), GS-010 §5+§4 (`docs/briefing/15_gs010_visual_quality_overhaul.md`), GS-011 (`docs/briefing/16_gs011_master_execution.md`).
- **Escopo:** só diagnóstico. Nenhum código ou asset do jogo foi alterado. Imagens citadas são capturas já existentes em `prototype/world/docs/screens/` e `evidence/`, copiadas sem edição para `quality-overhaul/audit/img/`.
- **Método:** leitura de `src/ui/*.ts`, `src/world/regions.ts`, `src/style.css`, `docs/GDD_MMO_V1.md`; inspeção visual das capturas listadas abaixo. Não abri o jogo ao vivo nesta rodada porque as capturas existentes (muito recentes, de 2026-11-09, geradas pelo próprio `shots:live` na porta 5190) já cobrem todos os painéis pedidos; novo print só seria necessário para um estado ainda não fotografado.

---

## 1. HUD principal

**[E]** Estrutura atual (`src/ui/hud.ts`, comentário do próprio arquivo): "no padrão estrutural do IdleDex (referência canônica, ADR-010)". Ou seja, o layout já foi desenhado para imitar IdleDex de propósito: barra inferior com minimapa + inventário + atalhos + XP do Tamer + Digimon ativo + equipe; AUTO no topo-centro; moeda/eventos à direita; log de batalha à direita; chat recolhido à esquerda. Ver `img/05_hud_floresta_combate.png`.

**Hierarquia e poluição visual**
- **[E]** São 8 blocos de HUD simultâneos na tela: aviso legal (topo-esquerda, fixo e grande), região/rota, AUTO+Fugir+Auto-evoluir, moeda, atalhos (3 ícones soltos), Passe de Temporada, Fonte dos Desejos, Chefe Mundial, Guilda, log de combate, chat, minimapa, inventário, grade de atalhos (12 ícones), barra do parceiro (PV/XP), tira da equipe (5 retratos). Em `img/05_hud_floresta_combate.png` dá para contar mais de 10 caixas com borda própria ao mesmo tempo, todas do mesmo peso visual — nada "grita" mais que o resto.
- **[E]** Todos os blocos usam a mesma classe CSS (`.panel`, `src/style.css` linha ~61): fundo `rgba(20,23,34,0.92)`, borda 2px `#3b4261`, `border-radius:6px`, mesma sombra. Resultado: aviso legal, Passe de Temporada, log de combate e PV do parceiro têm o **mesmo peso visual** — nada no CSS distingue "informação vital de combate" de "enfeite de monetização futura" (Passe de Temporada, Fonte dos Desejos, Chefe Mundial, Guilda são todos placeholders de feature ainda não implementada, ocupando a faixa mais nobre da tela, o canto superior direito).
- **[H]** O aviso legal fixo ("Fan game não oficial...") ocupa ~230×95px permanentes no canto superior esquerdo em toda sessão. Correto do ponto de vista jurídico, mas deveria encolher para uma linha/rodapé depois de alguns segundos ou ficar só no loading — hoje compete por atenção com a região/rota atual.
- **[H]** A pilha de atalhos "Passe de Temporada / Fonte dos Desejos / Chefe Mundial / Guilda" é 4 caixas de feature inexistente competindo com dados reais (moeda, equipe). Isso é "ruído de roadmap" dentro do HUD de jogo.

**Legibilidade sobre o cenário**
- **[E]** Nomes e barras de PV dos Digimon/Tamers ficam direto sobre o canto (texto branco/verde sem fundo sólido, só contorno), o que funciona na grama escura mas falha em áreas claras: em `img/03_hud_mapa_praia_placeholder.png` os textos "Guilmon Nv.5", "Kaio Nv.12" ficam quase ilegíveis sobre a areia clara (mesmo contraste insuficiente que se repetiria em neve/gelo).
- **[E]** O log de combate (canto inferior direito) é texto corrido sem ícone, sem cor por tipo de evento consistente — mistura "Escaneando", "Venceu", "causou dano" em cinza/branco/verde sem hierarquia clara de prioridade (dano > scan).

**O que cobre os personagens**
- **[E]** O personagem e a parceira ficam sempre visíveis no centro — nenhum painel fixo cobre a área de jogo (confirma a regra do GS-010 §A "não esconder personagens atrás de painéis desnecessários"). Isso é um acerto a preservar.
- **[E]** Os modais (Equipe & Box, Digivice, Inventário, Mapa-múndi) cobrem ~70% da tela quando abertos, inclusive o próprio personagem — aceitável para telas de pausa, mas nenhum deles tem transparência/blur que deixe o mundo "respirando" atrás, o que reforça a sensação de "trocar de app" em vez de abrir um menu no mundo.

**Comparação com Drakantos** (`img/ref_drakantos_vila.png`, `ref_drakantos_ui_habilidades.png`)
- Drakantos usa **moldura diegética**: avatar em losango com borda ornamentada, barra de XP com textura própria, caixa de diálogo com retrato do NPC e nome em faixa destacada, minimapa circular com borda metálica. Nosso jogo usa caixas retangulares `border-radius:6px` genéricas para tudo — **[H] essa é a maior diferença de "parece dashboard" vs. "parece jogo"**: não é a quantidade de informação, é a ausência de moldura/ornamento específico do universo Digimon.
- Drakantos tem **tooltip de habilidade em destaque** (texto narrativo "Usando sua lança, Reyra realiza uma Estocada de Lança...") em vez de só número — nosso golpe mostra "Poder 155 · 16 MP · 4,5s" cru (`img/06_painel_equipe_golpes.png`).

**Comparação com IdleDex** (`img/ref_idledex_map_walk.png`, `ref_idledex_equipe_box.png`)
- **[H] Achado importante:** a estrutura de HUD do IdleDex (barra inferior com ícones, PV do líder + equipe à direita, minimapa inferior esquerdo, moeda/social superior direito) é **estruturalmente quase idêntica à nossa**, porque foi copiada de propósito (ADR-010). Isso significa que a crítica "não pode parecer dashboard" não é sobre a organização espacial — essa já está alinhada com a referência de organização aprovada — e sim sobre **acabamento visual**: mesmo o IdleDex tem caixas escuras retangulares relativamente simples, mas usa cores de borda por raridade/tipo nos Pokémon da equipe (estrelas douradas, bordas coloridas por elemento) e ícones mais ilustrados na barra inferior, onde o nosso usa ícones de linha monocromáticos simples (`src/ui/icons.ts`) todos do mesmo cinza/branco.

---

## 2. Painéis

Para cada painel: o que existe, problemas, "dashboard admin" vs. MMORPG.

### 2.1 Personagem (criador, `src/ui/creator.ts`, `img/10_tela_criador.png`)
- **Existe:** grade de 12 presets DS com retrato+sprite animado, nome com validação, cor de cabelo, resumo textual embaixo.
- **Problemas:** tela isolada sem fundo de mundo (fundo liso `#141722`), sem moldura temática, sem ambientação (nenhuma referência ao Digimundo na tela de criação — é puramente formulário). Título "Crie seu Tamer" em fonte de sistema simples, sem textura.
- **Dashboard vs. MMORPG:** é hoje a tela mais "formulário de cadastro" do jogo — nenhum elemento (iluminação, vinheta, texto ambientado) sugere universo Digimon. Falta também um painel de **atributos/progressão** do Tamer in-game (GS-010 §B pede nível, XP, atributos, equipamentos do Tamer) — isso **não existe**: hoje só a barra de nível/PV do Digimon ativo aparece no HUD; não há tela dedicada ao Tamer (nível, atributos, equipamento) fora do criador inicial.

### 2.2 Equipe de Digimon / Golpes (`src/ui/moves-ui.ts`, modal "Equipe & Box", `img/06_painel_equipe_golpes.png`)
- **Existe:** abas Digimon/Golpes/Times salvos; grade de Equipe (5 slots) e Box (12/página, paginado, com busca); por Digimon: sprite, nome, nível, estrelas de raridade/estágio, PV/MP; aba Golpes com 4 slots ativos, lista "Aprendidos", prioridade do AUTO reordenável (▲▼, "usar" on/off), "Restaurar padrão".
- **Problemas:** é funcionalmente o painel mais completo e bem pensado do jogo (edição de prioridade do AUTO é um diferencial real), mas visualmente é uma **tabela de dados** — colunas alinhadas, linhas com ícone+texto+número, sem nenhuma ilustração de fundo, sem indicação visual do elemento/atributo do Digimon além de uma etiqueta de texto pequena ("Físico", "Fogo", "Único"). Comparado ao IdleDex (`img/ref_idledex_equipe_box.png`), que já usa cor de borda por raridade (estrelas coloridas, ícones de tipo com cor de fundo), o nosso usa só texto preto-sobre-cinza em etiquetas (badge) idênticas para todo tipo.
- **Dashboard vs. MMORPG:** **é o caso mais claro de "admin dashboard"** do jogo — grade densa, texto pequeno, zero ilustração de fundo, cabeçalho "EQUIPE & BOX" em caixa alta sem ornamento. Funcionalmente ótimo, visualmente é uma ferramenta de debug, não uma tela de MMORPG.

### 2.3 Inventário (`src/ui/screens.ts`, `img/09_painel_inventario.png`)
- **Existe:** itens por categoria (Cura, Captura, Evolução, Cosméticos) com ícone, nome, descrição curta, fonte e quantidade (×N).
- **Problemas:** todas as categorias usam o mesmo cartão retangular cinza-escuro; não há indicação de raridade por cor/borda (GS-010 §D pede "raridade visualmente identificável" — hoje só existe via texto, ex. "item cosmético", sem cor); não há clique para ver detalhe/expandir (texto já vem todo visível, então "informações ao selecionar" do GS-010 §D não existe de fato, é só exibição estática); frase de debug visível ao jogador — "não existe moeda premium neste jogo — diferente do 'gold' do IdleDex" — é uma nota de design vazada na UI final, não deveria estar em produção.
- **Dashboard vs. MMORPG:** cartões uniformes em grade = catálogo de e-commerce, não baú de RPG. Falta diferenciação por raridade (cor de borda) e um ícone por item mais ilustrado (hoje são ícones de linha genéricos, `icons.ts`).

### 2.4 Evolução (`src/ui/evolve-ui.ts`, modal "Digivolução disponível", `img/07_painel_evolucao.png`)
- **Existe:** 2 colunas (ou mais) lado a lado, uma por caminho possível; cada uma com imagem (ou "?" se espécie sem arte), nome, estágio, requisitos com ✓/✗ e valor atual ("Ataque 45+ (você: 49)"), botão "Evoluir para X" habilitado só quando elegível, "Agora não". **Confirma o requisito do GS-010 §E: o jogo nunca escolhe sozinho** — testado via `tests/evolution.test.ts` (intent `evolve` sem `to` é recusado com 2+ caminhos elegíveis).
- **Estados disponível/bloqueado/desconhecido:** ✅ disponível = botão verde habilitado; ✅ bloqueado = requisito com ✗ e botão sem habilitar (mas o botão continua visível com o mesmo texto "Evoluir para X", só sem destaque — não há um estado visual "cadeado"/cinza explícito, é sutil); ✅ desconhecido = espécie sem arte mostra "?" tanto no card quanto seria na silhueta da animação (conforme `PROJECT_LOG.md`, ramos `SP-GEOGREYMON`/`SP-DRIMOGEMON` sem arte).
- **Problemas:** é o painel que melhor atende à letra do GS-010 §E, mas visualmente é 2 cartões verdes genéricos — não há "árvore de evolução" real (GS-010 §E pede "preservar a identidade e a árvore individual de cada Digimon"); hoje só mostra o próximo passo, não a linha completa (bebê→...→atual→próximos). Não há atalho para ver a árvore completa de uma espécie fora deste modal reativo (o Digivice mostra só "Evolui: X" como texto single-line, não uma árvore visual).
- **Dashboard vs. MMORPG:** estrutura correta (2 cards comparáveis), mas sem nenhuma ambientação de "ritual de evolução" — comparar com a animação de evolução no mapa (que É cinematográfica, por `PROJECT_LOG.md`: colunas de luz, silhuetas, clarão) mostra que o jogo já sabe fazer "momento especial" em outro lugar; o modal de escolha fica aquém disso.

### 2.5 Digivice (`src/ui/screens.ts`, `img/08_painel_digivice.png`)
- **Existe:** grade de todas as espécies (31 na prova), silhueta "???" preta para não vistas, contadores "Vistos"/"Escaneados"/"Varredura total" com barra de progresso, painel de detalhe (sprite, nome, estágio, atributo, elemento, % de varredura, "Evolui:", golpes, "Onde:").
- **Problemas:** visualmente é o **mais próximo de uma Pokédex genérica** possível — grade cinza uniforme de miniaturas quadradas, sem textura de "aparelho Digivice" (moldura, tela CRT, LED), apesar do nome do painel referenciar um objeto físico icônico da franquia que teria identidade visual óbvia a explorar (não usada).
- **Dashboard vs. MMORPG:** **o maior contraste nome-vs-aparência** do jogo: "Digivice" é um objeto com décadas de identidade visual reconhecível (tela, antena, botões), mas a tela é uma grade HTML genérica sem nenhuma referência a isso.

### 2.6 Mapa-múndi (`src/ui/worldmap.ts`, `img/01_hud_mapa_mundi.png`, `02_hud_mapa_mundi_praia.png`)
- **Existe:** nós posicionados por % (`POS`, coordenadas fixas hardcoded `[H]` no código) ligados por linhas SVG retas, cada nó é uma caixa retangular com nome/faixa de nível/estado/botão "Viajar"; cor de borda muda por estado (aqui=amarelo, liberada=verde provável, bloqueada=vermelho, sem mapa=cinza).
- **Problemas:** **confirma literalmente a crítica do GS-010 §F "evitar aparência de menu administrativo"** — é exatamente isso hoje: fundo semitransparente escuro, linhas retas finas conectando caixas de texto, zero ilustração, zero textura de "Digimundo", nenhuma miniatura/ícone por região (GS-009 §2 pede "ilustração ou miniatura" por destino — **não existe**, cada região é só uma caixa de texto). Compare com um mapa-múndi real de RPG (ilha, pergaminho, relevo) — aqui é um grafo de nós, puro diagrama técnico.
- **Dashboard vs. MMORPG:** é, junto com Equipe & Box, o painel mais "admin" do jogo — literalmente um diagrama de grafo (nós + arestas) sem nenhuma camada de ilustração por cima.

---

## 3. GS-009 — análise de lacunas (item por item, §8–9)

| Item GS-009 §8 | Status | Evidência |
|---|---|---|
| 1. Tela de mapa-múndi | **[E] Existe, mas incompleta visualmente** | `img/01_hud_mapa_mundi.png`: navegação funcional (nome, faixa de nível, nº espécies, estado, botão Viajar), mas **sem** "ilustração ou miniatura" por região (GS-009 §2 pede explicitamente), sem descrição textual do bioma, sem lista de Digimon encontrados nem eventos disponíveis — só a contagem "N espécies". |
| 2. Duas regiões desbloqueadas | **[E] Existe** | Floresta Densa (`você está aqui`) + Vila dos Bebês (`liberada`, zona segura) partem abertas; Praia abre em Tamer Nv.10. No print capturado, já há 3 regiões liberadas (Floresta, Vila, Praia) — atende e supera o mínimo de 2. |
| 3. Uma região bloqueada | **[E] Existe (3, na verdade)** | Montanha (Nv.20+Kuwagamon), Deserto (Nv.30+Shellmon), Zona Corrompida (Nv.40+2 chefes) — todas sem mapa ainda, só definição de desbloqueio (`regions.json`). |
| 4. Região jogável de floresta | **[E] Existe e é a mais trabalhada** | Floresta Densa (`forest-proof`, pacote v4.1): Wang-47 autotile suavizado, árvores com sombra projetada e rim-light, trilha orgânica por spline, gradiente dia/noite nas entidades. É hoje o **padrão de qualidade mais alto do jogo** (ver `img/11_floresta_composicao_atual.png`) — mas ver §5 abaixo: ainda está abaixo do nível Drakantos em profundidade de camadas e pontos de interesse dedicados. |
| 5. Região jogável de praia/costa | **[H] Existe tecnicamente, mas visualmente quebrada** | `img/03_hud_mapa_praia_placeholder.png` mostra **vários tiles renderizando como ícone de textura ausente** (quadrados brancos com borda pontilhada) em vez de areia/decoração — a praia funciona como mapa jogável (colisão, selvagens, portal) mas **não está pronta visualmente**; isso é uma lacuna de arte, não de sistema, e deveria estar no plano de correção do GS-010 antes de qualquer nova região. |
| 6. Sistema de viagem | **[E] Existe e funciona** | `worldmap.ts` + `regions.ts`: seleção de destino, checagem de desbloqueio (`canTravel`), "Viajar" só habilitado quando liberada **e** com mapa nesta prova; `PROJECT_LOG.md` confirma fade de transição (~0,3s) e também **saídas físicas na borda do mapa** (floresta↔praia, floresta↔vila) sem precisar voltar ao mapa-múndi — atende ao pedido do GS-009 §4 ("não precisa retornar ao mapa-múndi... quando houver conexão direta"). |
| 7. Persistência de progresso | **[E] Existe** | `PROJECT_LOG.md` descreve save versionado (v3 a v8) cobrindo Tamer, equipe, Box, inventário, missões, configurações, região/mapa atual, vistos/escaneados do Digivice, preferências de evolução — e migração encadeada entre versões testada. |
| 8. Testes de carregamento e retorno | **[E] Existe (parcial)** | `tests/regions.test.ts` cobre saídas válidas de ida e volta, migração de save por versão; não há confirmação explícita de teste de "ir para fora e voltar preservando posição exata", mas a suíte cobre o essencial de persistência. Fora do escopo desta auditoria de UI validar testes automatizados a fundo — isso é melhor coberto pelo audit técnico (D2, game-dev). |

**GS-009 §9 (critério de aprovação, usuário consegue...)** — checagem rápida por função, não por playtest humano nesta rodada (Fase 1 é diagnóstico, sem execução):

| Capacidade exigida | Status |
|---|---|
| Abrir o mapa | [E] atalho M / grade de atalhos |
| Escolher uma região | [E] clique no nó |
| Entrar nela | [E] "Viajar" + fade |
| Explorar livremente | [E] movimento livre confirmado nos prints de combate (não é clique-para-andar) |
| Encontrar Digimon | [E] selvagens spawnam na Floresta/Praia |
| Combater no próprio mapa | [E] confirmado (`proof_live_combate*.png`, log de combate ao vivo) |
| Interagir com elementos | [H] não verificado nesta auditoria (fora do escopo UI — objetos interativos são D1/D2) |
| Abrir novamente o mapa | [E] mesmo fluxo |
| Viajar para outra região | [E] |
| Retornar sem perder progresso | [E] save por região + migração |

**Lacuna estrutural mais crítica para GS-009 (não é só visual):** o mapa-múndi não cumpre o requisito de "identidade visual própria, não parecer um menu genérico" (GS-009 §2, repetido no GS-010 §F) — é hoje puramente funcional. Esse é o maior gap de GS-009 do ponto de vista deste papel (UI-UX).

---

## 4. Proposta de direção de UI v2

→ Documento separado: `quality-overhaul/UI_DIRECTION_V2.md`. Só proposta — nada implementado.

---

## 5. Proposta de composição da região piloto

`quality-overhaul/audit/VISUAL_AUDIT.md` (game-art) ainda não existe neste workspace no momento desta auditoria — não houve arquivo para alinhar. Proponho conforme instruído: **Clareira Central + riacho com ponte**, dentro da própria Floresta Densa (`forest-proof`), que já tem o padrão de qualidade mais alto do jogo (v4.1: autotile Wang-47 suavizado, árvores com sombra projetada e rim-light, gradiente dia/noite). Ver `img/11_floresta_composicao_atual.png` — **o rio com a ponte de tronco já existe** no mapa atual (visível no centro-inferior do print, atravessando a trilha principal); a proposta é reconstruir essa área específica como peça de showcase em vez de criar algo do zero. Detalhe de composição, camadas e pontos de interesse também está em `UI_DIRECTION_V2.md` (seção 5, ao final).

---

## Resumo de problemas priorizados (para o PHASE1_REPORT.md consolidado)

1. **Mapa-múndi parece grafo técnico, não mapa de RPG** — maior gap de GS-009/GS-010 combinado. Sem ilustração por região.
2. **Praia com tiles quebrados (textura ausente)** — bloqueia a demonstração do GS-009 §8 item 5 em condições apresentáveis.
3. **Equipe & Box e Digivice são "admin dashboard"** — funcionalmente corretos, visualmente tabelas de dados sem textura/ornamento.
4. **Mesma caixa CSS para tudo** (`.panel` único) — aviso legal, feature-placeholder (Passe de Temporada etc.) e PV de combate têm peso visual idêntico; falta hierarquia.
5. **Sem tela de atributos/progressão do Tamer** — GS-010 §B pede, hoje só existe o criador inicial.
6. **Tipografia 100% de sistema** (Ubuntu/DejaVu Sans) em todo o jogo — nenhuma fonte pixel-art própria.
7. **Evolução funcionalmente completa e correta** (não escolhe sozinha, mostra requisitos) — manter a lógica, só evoluir a casca visual.
