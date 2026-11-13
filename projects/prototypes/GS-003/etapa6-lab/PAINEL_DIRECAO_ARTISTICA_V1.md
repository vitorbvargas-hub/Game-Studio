# PAINEL_DIRECAO_ARTISTICA_V1 — Etapa 6, Comando 2, passo 3 (game-art)

- **Autor:** game-art (subagente) · **Data:** 2026-11-13.
- **Base:** `COMANDO_ETAPA6_C2_HOMOLOGACAO_PARCIAL.md` §3 (6 itens pedidos) + §1 ("GBA Plus continua como referência, não como teto de qualidade"; "indicar referências e decisões candidatas, sem gerar assets novos nem fixar prematuramente a paleta final").
- **Regra respeitada: 0 gerações.** Este painel só organiza referências já existentes no projeto (Style Bible, V15/V15B, ADR-010/015) e um moodboard de composição local (`painel/moodboard_v1.png`, script `workspaces/game-art/tools/build_moodboard.py`, sem dependências pagas). `get_balance` antes e depois desta tarefa: sem variação (ver §8).
- **Nenhuma decisão final é tomada aqui.** Cada seção termina com "decisões candidatas" marcadas [H]/[PROPOSTA] — a decisão é do fundador.

## 0. Como ler este painel

- **[E]** = evidência já registrada em arquivo do projeto, com caminho citado.
- **[H]** = conhecimento geral do agente sobre a franquia Digimon Adventure (não houve busca na web nesta sessão — `web_search` retornou indisponível; é conhecimento de treinamento, não verificado por fonte externa agora). Tratado como referência de ambientação, não como fato a ser citado como comprovado.
- Nenhum hex novo, nenhuma escala e nenhuma referência aqui é uma aprovação — é matéria-prima para a decisão do fundador.

## 1. Digimon Adventure e File Island

**[H]** File Island (temporada 1, Digimon Adventure) é composta de biomas contrastantes dentro de uma ilha isolada: floresta densa perto do ponto de queda dos protagonistas (geralmente chamada "Floresta Nativa" nas traduções), montanha/vulcão central (Monte Infinito), vilarejo digital (File City/Vila Primária), áreas desérticas e de gelo em outras regiões da mesma ilha. O traço comum relevante para a floresta-piloto é: **vegetação tropical densa, luz filtrada pela copa, formações rochosas com musgo, e estruturas digitais (torres, pilares, símbolos binários) emergindo da paisagem natural sem parecer "colada"**.

**O que já está decidido e aprovado no projeto (não deste painel):** ADR-015 autoriza expressamente recriar "locais, cidades, ilhas, estruturas e cenários" da franquia no desenvolvimento interno (`ADR-015` §"Decisão"), sem que isso seja licença jurídica (§"Responsabilidade e riscos"). ADR-010 fixa a estrutura de mundo (IdleDex) e o nível de acabamento (Drakantos) como referências de composição/qualidade, com Digimon como identidade de conteúdo — não contradiz o uso de File Island como ambientação.

**Decisão candidata [H]/[PROPOSTA], não aprovada aqui:** tratar a floresta-piloto atual (`V15.md`/`V15B.md`) como uma reinterpretação livre de "Floresta Nativa de File Island" (categoria 2 da classificação ADR-015 — recriação/adaptação), não uma cópia de cena específica do anime. Nenhuma cena, episódio ou minuto específico foi usado como referência direta nesta tarefa (nenhuma extração de frame foi feita) — se o fundador quiser extração de frame real (`ADR-015` §"Extração de material do anime"), é uma tarefa nova, com fonte/episódio/minuto registrados, fora do escopo de 0 gerações deste painel.

## 2. Vegetação — árvores, gramíneas, clareiras

**[E] Já aprovado em jogo** (`V15B.md`): mata fechada com 512 árvores de 4 espécies (já na conta), fileiras deslocadas meia célula para evitar grade óbvia; mato alto feito de objetos (`tallgrass_tuft_b`, 3 tufos por célula) em manchas elípticas de borda irregular, não blocos de terreno; **nenhuma trilha de terra exposta** (decisão do fundador registrada em `V15.md`: "estilo Pokémon — chão todo verde, caminho por maciços de árvore, sem trilha marrom"); 10 zonas de mato (8 de batalha + 2 de surpresa) com coordenadas fixas; clareiras abertas reservadas para "Digimon fortes visíveis" (margem oeste do rio, santuário).

**[E] Técnica de profundidade já em uso** (`V15.md` "Técnicas de profundidade"): sombra oval integrada nas árvores; grade 2×2 com offset de 1 célula ("padrão tijolo"); `layer` crescente por `y` ascendente para sobreposição correta; bordas de maciço irregulares porque os retângulos de exclusão não seguem a grade de árvore.

**Pendência técnica já registrada, não resolvida aqui** (`V15B.md` "Pendências para o game-dev"): Y-sort por pé ainda não está no motor — alguns tufos de mato aparecem com `layer` acima de árvores que deveriam cobri-los. Isso é pré-requisito de composição antes de qualquer nova vegetação.

**Decisão candidata [H]/[PROPOSTA]:** se o fundador quiser aproximar mais de File Island (vs. a floresta genérica atual), as duas adições de menor risco seriam (a) uma 5ª/6ª espécie de árvore com copa mais tropical/larga (sem mudar a técnica de grade já aprovada) e (b) flores/pequenas plantas digitais como acento pontual em clareiras (ligando à §4), nunca cobrindo o chão inteiro (viola a regra "chão todo verde" só se virar textura, não objeto pontual). Nenhuma das duas foi gerada aqui.

## 3. Água — rios, cachoeiras, desníveis

**[E] Já aprovado em jogo** (`V15.md` "Água em movimento", "A história do mapa" item 4): rio central corta o mapa, desce de um paredão de pedra musgosa (terreno elevado `r`) ao norte formando um lago através de um objeto de cachoeira animado (128×128, rochedo + queda d'água); ponte de madeira (`bridge_wood`) cruza o rio na zona de travessia. `V15B.md`: a cachoeira foi reposicionada para a borda norte do lago (960,220, layer 2000), "imersa na cena, sem moldura" — ajuste do coordenador, 0 gerações.

**[E] Pendência técnica registrada, não resolvida aqui** (`V15B.md`): água ainda é tile estático (só a cachoeira e os brilhos são animados); a borda do rio fica em degrau (herdado do terreno da v15), não uma curva suave.

**Decisão candidata [H]/[PROPOSTA]:** nenhuma nova feição de água é proposta aqui — o rio+cachoeira+lago já aprovado cobre o pedido do comando ("rios, cachoeiras e desníveis"). O desnível (paredão → lago) já existe; um 2º desnível menor (pequena corredeira) só deveria entrar se o layout-brief da Parte 2 do `ESTUDO_REGIOES_E_MAPA_PILOTO.md` pedir uma 2ª zona de água, o que não é o caso hoje.

## 4. Elementos digitais e estruturas reconhecíveis

**[E] Já aprovado em jogo** (`V15.md` "santuário digital", item 6): `data_totem_pillar`, 2× `ruin_piece` (pilar + bloco), 2× `lantern_post`, `data_crystal_cyan`, `mushroom_digital`, mancha pequena de terra batida (única exceção à regra "sem trilha"); `boss_portal_marker` no ponto de saída nordeste.

**[E] Regra de paleta para estes elementos** (Style Bible §7 "Identidade do Mundo Digital"): cristais usam "acento de luz quente âmbar/ciano/magenta... pontual e aditivo, nunca a paleta inteira do bioma" — reforça "lugar digital" sem competir com a paleta-mãe do cenário.

**[H] Estruturas reconhecíveis da franquia (ADR-015 agora autoriza):** torres/pilares com padrão binário, portais circulares com borda de dados, totens com inscrições digitais — a estética já descrita acima (`data_totem_pillar`, `ruin_piece`) é consistente com essa linguagem, sem copiar uma estrutura específica e nomeada do anime (ex.: não há "Torre Negra" nem réplica de local nomeado no mapa atual).

**Decisão candidata [H]/[PROPOSTA]:** o comando pede "elementos digitais e estruturas reconhecíveis da franquia" — o santuário já aprovado cumpre a letra do pedido de forma genérica (categoria 2/3 da classificação ADR-015: recriação/original, não cópia de local nomeado). Se o fundador quiser uma estrutura **nomeada e reconhecível** (ex. algo no estilo de uma torre específica do anime), isso é uma decisão nova, fora deste painel, e precisa de classificação ADR-015 item 1 (elemento oficial) com fonte registrada.

## 5. Paleta, contorno, sombra e iluminação

**[E] Regra já fixada, com um conflito aberto que este painel não resolve (AGENTS.md §5):**

| Camada | Regra fixada [E] | Fonte |
|---|---|---|
| Paleta do sprite oficial (Digimon/Tamer) | Paleta própria do arquivo, **nunca** forçada para Endesga-32 | `DIGIMON_STYLE_GUIDE.md` §3.1/§3.2 |
| Paleta do cenário/UI | **Só** Endesga-32 + ramps aprovados, nenhum hex novo solto | `DIGIMON_STYLE_GUIDE.md` §3.2, `ART_STYLE_GUIDE.md` §4 |
| Contorno do sprite oficial | Como veio no arquivo (~1,5–2px, macio) — não redesenhar | `DIGIMON_STYLE_GUIDE.md` §4 |
| Contorno do cenário | Sem contorno rígido — `rimDarken()` OU `autoOutline()` (`#181425`), nunca os dois juntos | `DIGIMON_STYLE_GUIDE.md` §4, `MAP_ART_BIBLE.md` §7 regra 4 |
| Sombra | Sombra de contato obrigatória em toda entidade móvel; proibido sombra 100% opaca ou retângulo duro | `DIGIMON_STYLE_GUIDE.md` §5 |
| Luz | Fonte fixa superior-esquerda em todo asset desenhado do zero; **não** reiluminar rip oficial; noite = mesma direção, paleta fria, intensidade ×0,55 dia/×1,35 noite | `DIGIMON_STYLE_GUIDE.md` §6 |

**Conflito aberto, medido contra os dois lados (AGENTS.md §5, não resolvido aqui):** o Style Bible (§3.2) fixa Endesga-32 como paleta-mãe do cenário; a referência v13/v15 aprovada pelo fundador foi medida (homologação Etapa 2) como 0% Endesga-32 em alguns ativos. Este painel **não** escolhe um lado — registra que qualquer decisão de paleta nova precisa medir contra os dois critérios, como já exigido pelo AGENTS.md deste agente.

**Decisão candidata [H]/[PROPOSTA]:** manter a separação de paleta já aprovada (sprite com paleta própria × cenário em Endesga-32) é a opção de menor risco porque já está em produção (v15b) e não exige nenhuma geração nova. Qualquer unificação de paleta (ex.: forçar o cenário para a paleta real do rip oficial) é uma mudança de direção, não uma composição — fica para o fundador decidir no conflito aberto.

## 6. Integração visual entre Tamer, Digimon e ambiente

**[E] Achado direto de E5** (`COMPARATIVO_ESCALAS_E1_E5.md` §6, §7.7): a proporção Tamer/tile (34/32 = 1,06×) está fora da faixa-alvo (1,1–1,6×) em **todas** as 5 hipóteses testadas (E1–E5) com fatores inteiros — não é um problema de composição, é uma propriedade do sprite nativo do Tamer (36×36, 34px de conteúdo) frente ao tile 32px. A hierarquia entre Digimon (Baby < Rookie < Ultimate) é resolvida com folga por fatores independentes por espécie (E5: WarGreymon 3× → razão 4,00 vs. Agumon), mas a classe "Gigante" a 3× viola a meta de corredor (M4: 87px de largura > 64px de corredor mínimo de 2 tiles) — risco de bloqueio visual de passagem, registrado e não resolvido.

**[E] Requisitos de integração já levantados pelo `game-design`** (`COMPARATIVO_ESCALAS_E1_E5.md` §7.5–§7.7): nenhuma classe de porte pode ocluir o Tamer ou um Digimon menor em combate (oclusão ≤50%, critério 8 do layout-brief); HUD por entidade precisa escalar com o porte sem colidir com a HUD vizinha em corredores estreitos; largura do Tamer precisa ser menor que a abertura mínima entre maciços de vegetação (requisito M7 proposto).

**Decisão candidata [H]/[PROPOSTA]:** nenhuma escala fica decidida neste painel (é a mesma regra do comando — "nenhuma hipótese de escala fica aprovada antecipadamente"). O que este painel acrescenta à discussão de escala é só a camada de **composição**: se a classe "Gigante" for adotada em qualquer fator ≥2×, os corredores nas zonas onde ela aparece (zona do rio/santuário, já mapeadas em `V15.md`/`V15B.md`) precisam ser auditados contra a largura real do footprint, não só contra a regra genérica de "2 tiles mínimo".

## 7. GBA Plus como referência, não como teto

**[E]** `DIGIMON_STYLE_GUIDE.md` §1 já registra a leitura correta: "GBA Plus" descreve a referência de **proporção e crueza** de um RPG de Game Boy Advance (personagem claramente maior que um ícone dentro do tile, poucos tons por cor, contorno visível) — o "plus" é a composição de cena mais densa que o orçamento de um GBA real não permitiria (vegetação em camadas, água com reflexo, luz pontual, herdado da referência Drakantos). Isso já está alinhado com o pedido do comando ("GBA Plus continua como referência, não como teto de qualidade") — nenhuma mudança é proposta aqui, só a confirmação de que a leitura em vigor já trata GBA como piso de proporção, não como limite de acabamento.

## 8. Moodboard (opcional, entregue)

**Arquivo:** `painel/moodboard_v1.png` (420×420px, composição local, 0 gerações — script `workspaces/game-art/tools/build_moodboard.py`).

**Conteúdo:**
- 3 faixas de swatches hex já aprovados do cenário (`CENARIO APROVADO — GRASS A`, `FOLIAGE DAY`, `FOLIAGE NIGHT`, medidos do Style Bible §3.2, não inventados).
- 2 faixas de paleta própria de sprite oficial (Guilmon, Gabumon, Style Bible §3.1), rotuladas explicitamente "nunca misturada" com as de cenário.
- Aviso em texto no próprio moodboard sobre o conflito aberto Endesga-32 × paleta própria do sprite (§5 acima), para não deixar a imagem sugerir uma harmonização que não existe.
- Recorte do cenário v15b já aprovado + os 4 thumbnails do elenco de prova (Tamer v13, Koromon, Agumon, WarGreymon) usados em E1–E5, como "ponto de partida" visual, não arte nova.

`get_balance` antes e depois desta tarefa (incluindo a geração do moodboard): **sem variação — 0 gerações gastas.** Único recurso usado: composição local com `pxpng.py` (já existente, reaproveitado de `build_pranchas.py`/`build_e5.py`).

## 9. O que este painel não faz

- Não aprova nenhuma paleta final, nenhuma escala, nenhuma estrutura nomeada da franquia.
- Não resolve o conflito aberto Endesga-32 × referência v13/v15 (§5) — só o mede contra os dois lados, como pede o AGENTS.md deste agente.
- Não busca imagens reais de File Island na web (`web_search` indisponível nesta sessão) — as referências de §1 são conhecimento geral do modelo, marcadas [H], não citação verificada.
- Não propõe nenhuma nova geração PixelLab — a Etapa 6 não autorizou produção de assets ainda (`AGENTS.md` §5: "Agora não é hora de produzir assets").

## 10. Limitações desta entrega

1. §1 (Digimon Adventure/File Island) depende de conhecimento geral do agente, sem fonte externa verificada nesta sessão — se o fundador quiser citações precisas de episódio/local, é preciso uma tarefa de pesquisa com acesso à web ou ao material de origem (condição do ADR-015 para extração).
2. Nenhuma das referências do fundador em `direction-v13/refs/founder-pixellab-chat/` foi inspecionada nesta tarefa (mesma limitação de acesso a caminho que o `game-design` já registrou no passo 2); este painel não contradiz nem confirma o que está nesses arquivos.
3. O moodboard (§8) é uma referência de composição de paleta, não um painel de referências visuais externas (imagens da franquia) — cumprir a letra total do pedido do comando ("referências visuais concretas" de File Island) exigiria imagens externas, fora do alcance de ferramentas desta sessão.
4. Esta entrega não foi revisada por sessão diferente da que a produziu (AGENTS.md §6) — a revisão cabe ao `game-qa`/fundador no próximo passo do comando.

---

## Revisão independente do game-qa (passo 4)

- **Autor:** game-qa (subagente) · **Data:** 2026-11-13. Revisão independente — não reescrevo o texto do `game-art` acima. Sessão diferente da que produziu o painel, cumprindo AGENTS.md §6.
- **Veredito: CONFORME COM RESSALVA.**

**Cobertura dos 6 eixos do comando §3:** confirmo que os §1–§6 do painel cobrem, um a um, os 6 itens pedidos (Digimon Adventure/File Island; vegetação; água/cachoeira/desnível; elementos digitais/estruturas; paleta/contorno/sombra/luz; integração Tamer×Digimon×ambiente). **Nenhum eixo ausente. Conforme.**

**Fontes sem citação ou inventadas:** o §0 já declara explicitamente que §1 (File Island) é conhecimento geral do modelo, sem busca web nesta sessão, marcado [H] — não há citação apresentada como verificada sem ser. Os demais itens (§2–§6) citam caminho de arquivo real (`V15.md`, `V15B.md`, `DIGIMON_STYLE_GUIDE.md`, `ADR-015`) — conferi os caminhos citados contra os documentos lidos nesta revisão (`AGENTS.md`, `COMANDO_ETAPA6_C2`, `PLANO_LABORATORIO_VISUAL_ETAPA6.md`) e não encontrei nenhuma citação fabricada ou fora de contexto. **Conforme.**

**Paleta fixada indevidamente:** §5 não fixa nenhuma paleta nova — só tabula regras já existentes (paleta própria do sprite × Endesga-32 do cenário) e registra o conflito aberto sem escolher lado. Verifiquei o moodboard (`painel/moodboard_v1.png`) diretamente: mostra só faixas de cores já aprovadas (verdes de cenário, paleta de sprite de Guilmon/Gabumon) e os 4 thumbnails do elenco de prova — nenhum hex novo visível, nenhuma harmonização nova sugerida. **Conforme.**

**Conflitos abertos continuam abertos:** confirmado em §5 ("não escolhe um lado") e §9 ("não resolve o conflito aberto Endesga-32 × referência v13/v15"). O achado de E5 citado em §6 (Tamer/tile 1,06× fora da faixa; classe "Gigante" a 3× violando M4) bate com a minha própria conferência numérica em `COMPARATIVO_ESCALAS_E1_E5.md` (seção de revisão acima) — citado corretamente, sem distorção. **Conforme.**

**Ressalva única encontrada:** o §1 descreve File Island com nomes específicos ("Floresta Nativa", "Monte Infinito", "File City/Vila Primária") em tom razoavelmente afirmativo, apesar do aviso [H] no §0. O aviso é claro e colocado antes do conteúdo (não é omissão), mas recomendo que qualquer reutilização desses nomes em documento voltado ao fundador repita o aviso [H] localmente, não só no cabeçalho §0 — para evitar que um leitor que pule a seção 0 leia esses nomes como fonte verificada.

**Limitações desta revisão:** não verifiquei os caminhos de `V15.md`/`V15B.md`/`DIGIMON_STYLE_GUIDE.md` abrindo cada arquivo linha a linha (fora do escopo de tempo desta revisão); a conferência foi por amostragem do moodboard e por coerência com os demais documentos desta mesma etapa, já lidos. Nenhum arquivo alterado; nenhuma geração PixelLab; nenhum outro agente acionado.
