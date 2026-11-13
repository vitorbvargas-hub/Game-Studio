# ESTUDO_REGIOES_E_MAPA_PILOTO — Etapa 6, Comando 1 (entregável do §6)

- **Parte 1 (esta seção): pesquisa das regiões.** Autor: game-research (subagente) · Data: 2026-11-13.
- **Parte 2 (layout-brief do piloto da floresta de Adventure): NÃO escrita aqui** — é trabalho do `game-design` (regra explícita do comando), que deve usar a seção 6 deste documento como insumo.
- Regra do comando: **referência artística, nunca cópia** de cenário, mapa ou imagem do anime. Toda afirmação carrega fonte e continuidade.

## 1. O que já existe no projeto (não refaço)

`docs/GDD_MMO_V1.md` §1 já mapeia **6 regiões** do GS-003 sobre áreas oficiais de File Island (Adventure): Vila dos Bebês, Floresta Densa, Praia dos Postes, Montanha, Deserto, Zona Corrompida — todas **[E, `wikimon.net/File_Island`]**, data 2026-11-08. `research/etapa3-imersao/04_MUNDO_DIGITAL.md` (2026-11-12) já cruzou essa escolha com a taxonomia de bioma e identificou 3 lacunas (Caverna, Oceano navegável, Cidade tecnológica), todas ainda dentro de File Island/Adventure. Este documento **não repete** essas duas pesquisas — cita e complementa, e amplia a cobertura para **02, Tamers e Frontier**, que o GDD atual não cobre.

## 2. Adventure — File Island e referências ambientais

**Fontes:** `wikimon.net/File_Island` (categoria 1, cita o oficial; já reaproveitado de 2026-11-08/12); `research/etapa3-imersao/01_UNIVERSO.md` e `04_MUNDO_DIGITAL.md` (2026-11-12, reaproveitado); resumos de vídeo `sources/yt_8f8lXcrQ7MM_resumo.md`, `yt_PpcQOhYyTSE_resumo.md`, `yt_UkiTCB0XUfE_resumo.md` (categoria 4, "[OFICIAL via vídeo]" = apresentado como fato pelo vídeo, não confirmado em fonte primária).

| Item | Conteúdo |
|---|---|
| **Biomas** | Floresta tropical densa (Tropical Jungle, Unwavering Forest, Misty Trees), savana/planície (Gear Savannah), montanha e cavernas (Outlook Mountain, Infinity Mountain, Lava Cave, Leomon's Ancestral Cave), litoral/lago (Dragon Eye Lake, Coela Point, praia dos postes do episódio 1), gelo (Freezeland), deserto/cânion (Great Canyon), pântano/esgoto (Sewers, Geko Swamp), vila/cidade (Village of Beginnings, Factorial Town, Toy Town), cemitério e ruína (Overdell Cemetery, Devimon's Mansion) |
| **Arquitetura** | Mistura deliberada de "natural" e "tecnológico fora de lugar": cabines telefônicas na praia, navio encalhado no deserto, fábrica/engrenagens em meio à savana (**[OFICIAL via vídeo]**, `yt_PpcQOhYyTSE_resumo.md`: "mundo bugado que imita a Terra"). Vilas simples de madeira/palha (Village of Beginnings); cidade mecânica geométrica (Factorial Town); mansão gótica isolada (Devimon's Mansion) |
| **Vegetação** | Floresta tropical densa e alta, com copas grandes e dossel fechado; savana com gramíneas altas e esparsas; sem flora exótica "alienígena" registrada nas fontes — a vegetação se lê como floresta tropical terrestre comum, não inventada |
| **Elementos reconhecíveis** | Postes/colunas saindo do mar na praia (cena icônica do episódio 1); Torre Infinita (Infinity Mountain) como marco vertical; Vila dos Inícios como "berçário" protegido; cânion e lago com monstro aquático (Dragon Eye Lake) |
| **Atmosfera** | Luz quente e saturada nas áreas de floresta/praia (tropical); tons frios e cinzentos na montanha/cavernas; mansão e cemitério com paleta escura/roxa (zona corrompida) |
| **Possibilidades de exploração** | Ilha única com biomas bem segmentados — já valida a divisão em regiões separadas que o GS-003 adotou; o próprio jogo oficial (Digimon World, PS1) subdivide ainda mais (ex.: "Beetle Land", "Kunemon's Bed" dentro da floresta), o que dá precedente para sub-áreas dentro de uma região |
| **Pontos de interesse** | Vila dos Inícios (hub seguro), postes na praia, Torre Infinita, cânion, lago do monstro, mansão do vilão |
| **Risco de PI** | **Médio-baixo para bioma/arquitetura genérica** (floresta tropical, savana, montanha — tipos de paisagem, não lugares únicos); **médio-alto** para recriar cenas/composições específicas e reconhecíveis do anime (os postes exatos na praia do episódio 1, a silhueta exata da mansão de Devimon, a Torre Infinita com seu desenho específico) — ver tabela §7 |

## 3. 02 — setores do Mundo Digital e Torres Negras

**Fontes:** `research/etapa3-imersao/01_UNIVERSO.md` §2 (categoria 1/3, Wikimon); `wikimon.net/Dark_Tower` (categoria 1, cita o Reference Book/anime; **lido em 2026-11-13**); resumo de vídeo `sources/yt_tXNf4-nIqks_resumo.md` (categoria 4).

| Item | Conteúdo |
|---|---|
| **Biomas** | 02 reaproveita a geografia do Mundo Digital de Adventure, mas a trama se organiza por **setores sob controle** em vez de biomas próprios novos: vilas conquistadas, cidade de "velho oeste", restaurantes/vila dos Gekomon (via vídeo, categoria 4) |
| **Arquitetura — elemento central: Torre Negra** | **[OFICIAL, `wikimon.net/Dark_Tower`, 2026-11-13]** "Grandes estruturas em forma de obelisco preto" (*large black obelisk structures*), construídas pelo Digimon Kaiser por todo o Mundo Digital para **bloquear evolução**, **alimentar os Anéis do Mal** e **marcar território conquistado**. Destruí-las anula o efeito na área. É um elemento 100% arquitetônico e reconhecível: silhueta vertical, negra, monolítica, sem ornamento — fácil de referenciar sem copiar textura/proporção exata de nenhuma cena específica |
| **Vegetação** | Sem dado novo específico de 02 nas fontes consultadas; herda os biomas de Adventure (floresta, vila, savana) agora sob controle das torres |
| **Elementos reconhecíveis** | Torre Negra (obelisco) como marcador de setor ocupado; Anéis/Espirais do Mal como símbolo de controle sobre Digimon individuais (cadeia Engrenagem → Anel → Espiral, já registrada em `01_UNIVERSO.md` §3b) |
| **Atmosfera** | Contraste "setor livre" (cores normais do bioma) × "setor ocupado" (presença da torre negra, tom mais sombrio/ameaçador) — um padrão visual de "antes/depois" já embutido na própria lore |
| **Possibilidades de exploração** | O par "setor livre/setor ocupado" dá uma mecânica de exploração natural: destruir a torre muda visualmente a região (clareira antes bloqueada se abre, NPCs voltam) — reforça a recomendação já registrada em `research/etapa3-imersao/04_MUNDO_DIGITAL.md` §3b.5 ("objetivo de mapa: libertar torre") |
| **Pontos de interesse** | A própria Torre Negra como marco de objetivo de região; vilas ocupadas com NPCs sob controle |
| **Risco de PI** | **Baixo para o conceito de obelisco negro genérico** (forma arquitetônica simples, sem textura/ornamento específico de marca); **médio** se a textura, proporção exata e o posicionamento de cena específica do anime forem copiados 1:1 |

## 4. Tamers — ambientes digitais e paisagens abstratas

**Fontes:** `research/etapa3-imersao/01_UNIVERSO.md` §2 e §3b (categoria 1/3/4); resumo de vídeo `sources/yt_yxzcbmw9QBw_resumo.md` (categoria 4).

| Item | Conteúdo |
|---|---|
| **Biomas** | Tamers é a continuidade que mais rompe com "Mundo Digital = ilha com biomas fixos": é descrito como "o outro lado", uma **realidade maleável**, acessada por portal, onde o palco narrativo principal é na verdade a **cidade real** (Shinjuku), não o Mundo Digital. O Mundo Digital em si aparece mais como espaço abstrato/de dados do que como paisagem biológica detalhada nas fontes consultadas |
| **Arquitetura** | Sem catálogo de edificações específicas nas fontes consultadas nesta sessão — o que se repete é a ideia de **espaço de dados**: realidade que se comporta de forma não-física (ex.: um personagem "nada" através de uma parede porque, no Mundo Digital, humano é dado) |
| **Vegetação** | Sem dado específico nas fontes consultadas; não documentado |
| **Elementos reconhecíveis** | Portal de acesso entre os dois mundos; feixes de luz como meio de teletransporte (**[OFICIAL via vídeo]**, `yt_yxzcbmw9QBw_resumo.md`); a própria cidade de Shinjuku como cenário "real" paralelo |
| **Atmosfera** | Tom mais sombrio e "adulto" que Adventure/02 (já registrado em `01_UNIVERSO.md` §2); sensação de instabilidade/dado corrompido culminando no D-Reaper como entidade antagonista não-biológica |
| **Possibilidades de exploração** | A ideia de "espaço que não obedece física normal" é uma referência rica para uma **área especial** com regra de movimento ou visual diferente (ex.: uma região onde o chão "flutua" em blocos de dados, cores que mudam, geometria que não fecha) — sem copiar nenhuma cena específica, só o princípio abstrato |
| **Pontos de interesse** | Portal de entrada/saída entre os mundos; "zona de dados corrompidos" como antecessor conceitual da já existente Zona Corrompida do GS-003 |
| **Risco de PI** | **Baixo**, porque o material-fonte de Tamers para o Mundo Digital em si é mais conceitual/abstrato que visualmente catalogado nesta pesquisa — há pouco "lugar específico" para copiar por acidente. O risco maior estaria em recriar literalmente Shinjuku (cidade real, fora do escopo de "Mundo Digital" e sem necessidade para o GS-003) |

## 5. Frontier — estações, trilhos e territórios elementais

**Fontes:** `research/etapa3-imersao/01_UNIVERSO.md` §2 e §3b (categoria 1/3/4); `wikimon.net/Trailmon` (categoria 1/3, cita o Reference Book; **lido em 2026-11-13**); resumos de vídeo `sources/yt_rN4tJjVoCfw_resumo.md`, `yt_I_Pa0lq4ClU_resumo.md` (categoria 4).

| Item | Conteúdo |
|---|---|
| **Biomas** | Mundo dividido em **terras/territórios ligados por trilhos**, cada um associado a um elemento/espírito (Fogo, Gelo, Vento, Trovão, Luz, Trevas, Terra, Água, Aço, Madeira — pares de Humano/Fera Espírito por elemento, conhecimento amplo da franquia); viagem feita por **Trailmon** entre terminais |
| **Arquitetura — elemento central: estações/terminais** | A estrutura logística em si é o elemento arquitetônico mais citado: terminais de trem distribuídos pelas terras, cada um sendo o ponto de entrada/saída de um território |
| **Elemento vivo reconhecível: Trailmon** | **[OFICIAL, `wikimon.net/Trailmon`, 2026-11-13]** Trailmon **é, ele mesmo, uma espécie de Digimon** (estágio Adult/Champion, tipo Machine, atributo Data, Field Metal Empire no Reference Book) que funciona como meio de transporte: "diversos tipos operam em cada linha, carregando Digimon e carga de terminal a terminal por todo o Mundo Digital". Golpes de assinatura oficiais: *Cool Running* (arrancada em alta velocidade) e *Kyū Brake Spark* (freada brusca com faíscas). Isso é uma informação valiosa para o game-design: **o "trem" de Frontier não é um veículo genérico, é um Digimon vivo** — qualquer sprite/objeto de "trem" para essa região deveria refletir isso (olhos, personalidade, não só um vagão metálico neutro) |
| **Vegetação** | Sem catálogo detalhado nas fontes consultadas; o que se repete é a associação direta território↔elemento (ex.: terra de fogo visualmente vulcânica, terra de gelo visualmente congelada) — um princípio de design, não uma paisagem específica catalogada |
| **Elementos reconhecíveis** | Terminais de trem; Trailmon com sua própria "cara" (os nomes registrados no Wikimon citam variantes como "Trailmon Mole", "Trailmon Worm", "Battle Armament Trailmon" — cada um com tema próprio de corpo); conceito de "terra que desaparece/reaparece conforme dados são roubados/recuperados" (**[OFICIAL via vídeo]**, já registrado em `01_UNIVERSO.md` §3b) |
| **Atmosfera** | Cada território assume a paleta e o clima do próprio elemento associado — alta variedade visual territorial é a assinatura da série |
| **Possibilidades de exploração** | Viagem diegética entre regiões via "trem-Digimon" como alternativa a portal/teleporte — já recomendado em `04_MUNDO_DIGITAL.md` §3b.3; perda/recuperação de território como metaprogressão de longo prazo (não implementar agora, só registrar como ideia válida) |
| **Pontos de interesse** | Estação/terminal de cada território; o próprio Trailmon como "veículo-personagem" nas plataformas |
| **Risco de PI** | **Baixo para o princípio geral** (território=elemento, viagem por trem-criatura); **médio** se um design de Trailmon específico (ex.: "Trailmon Worm") for copiado visualmente em vez de usado como inspiração para um Digimon de transporte original ou genérico |

## 6. Insumos para o layout-brief da floresta de Adventure

Esta seção é o insumo que o `game-design` deve usar para escrever a Parte 2 (layout-brief). **Não é o layout-brief** — não define caminhos, clareiras nem pontos de interação específicos; só reúne o que a pesquisa de fonte confirma sobre a floresta de Adventure para quem vai desenhar isso.

1. **Base oficial:** Tropical Jungle + Unwavering Forest + Misty Trees (File Island, `wikimon.net/File_Island`), já adotada como "Floresta Densa" em `docs/GDD_MMO_V1.md` §1.2 (nível 1–15, chefe Kuwagamon). O game-design não precisa reinventar a base, só detalhar o layout dentro dela.
2. **Densidade e dossel:** fonte confirma floresta tropical **densa**, copas grandes, dossel fechado — consistente com o pedido original do fundador ("floresta densa") e com `docs/DRAKANTOS_VISUAL_STUDY.md`/`docs/VISUAL_ANALYSIS_V2.md` (já citados em `05_DIRECAO_DE_ARTE.md` como referência de densidade/clusters de vegetação — não repetidos aqui).
3. **Precedente oficial de subdivisão:** o próprio jogo Digimon World (PS1) subdivide a floresta em sub-áreas com identidade própria (ex.: "Beetle Land" teria concentração de inseto-Digimon; "Kunemon's Bed" seria uma sub-área de toca) — sugere que o layout-brief pode (não deve, só pode) ter 2-3 "bolsões" temáticos dentro da floresta, em vez de um bioma uniforme, sem precisar inventar nomes do zero.
4. **Fauna selvagem já definida pela Database e pelo GDD:** Gigimon, Koromon, Tsunomon, Tokomon (baby_ii, spawn raso); Agumon, Gabumon, Guilmon, Patamon (child, spawn médio); chefe de região Kuwagamon (champion) — todos já no piloto (exceto Patamon/Tokomon, que não estão no piloto atual da Database, só no roster do jogo). O layout-brief pode distribuir encontros por essas 2 faixas de estágio sem inventar espécie nova.
5. **Elementos ambientais com precedente oficial para floresta tropical/File Island:** luz quente e saturada (tom tropical); possibilidade de clareira (padrão comum de floresta densa com pontos abertos); **nenhuma fonte oficial consultada garante elemento específico tipo "cachoeira" ou "ponte" dentro da Floresta Densa em particular** (cachoeira/rio aparecem em outras áreas de File Island, como Dragon Eye Lake) — se o game-design quiser incluir, é composição original coerente com o bioma, não uma cópia de cena.
6. **Risco de PI a respeitar no layout:** usar o **tipo** de paisagem (floresta tropical densa com clareiras) é referência artística (baixo risco); **não** recriar a composição exata de nenhuma cena específica do anime (ex.: o ângulo exato de uma cena-chave na Unwavering Forest) — ver tabela §7.
7. **Decisões abertas que o layout-brief NÃO deve resolver sozinho** (pertencem à Etapa 6 como um todo, não a este documento): escala Tamer×Digimon dentro do mapa (ver `ESTUDO_ESCALA_DIGIMONS.md`), paleta Endesga-32 × referência PixelLab, densidade/composição final — o layout pode ser desenhado de forma a funcionar com qualquer uma dessas decisões, sem travá-las.

## 7. Referência artística × recriação de local reconhecível × reprodução direta

> **SUPERADA pelo ADR-015 (fundador, 2026-11-13), adendo à Etapa 6.** A tabela abaixo continua como histórico. Valem agora três regras:
> - Recriar locais, estruturas, cenários, NPCs e acontecimentos das temporadas é **permitido** no planejamento e no desenvolvimento interno. Isso inclui a praia dos postes, a Torre Infinita, os Trailmon e as Torres Negras.
> - "Não produzir sem aprovação específica" e "proibido" deixam de ser bloqueio criativo. Cada elemento recebe uma classificação documental: **(1) oficial da franquia**, **(2) recriação ou adaptação** ou **(3) original**, mais **(4) fonte e risco**, para rastreabilidade (§7.1).
> - **Extrair** frames ou imagens do anime e usar como asset também está **liberado** (fundador, 13/11), com fonte registrada, a camada `official-fan-use` e tratamento para a identidade visual.
> - Continuam proibidos publicação, distribuição e monetização sem decisão específica.

### 7.0 Tabela original (histórico, 2026-11-13, antes do ADR-015)

| Categoria | Definição | Exemplo nas 4 séries pesquisadas | Decisão |
|---|---|---|---|
| **Referência artística (permitido)** | Usar o **tipo** de bioma, arquitetura ou criatura como inspiração de estilo, sem copiar uma composição, textura ou cena específica | Floresta tropical densa genérica (Adventure); obelisco negro genérico como marco de território ocupado (02); "espaço de dados maleável" como princípio abstrato (Tamers); território temático por elemento + trem-criatura genérico (Frontier) | Uso livre dentro do estilo visual que a Etapa 6 ainda vai decidir |
| **Recriação de local reconhecível (risco médio — decisão do fundador)** | Redesenhar, em pixel art original, uma composição ou marco **específico e identificável** de uma cena do anime, mesmo sem copiar pixel a pixel | A composição exata dos postes na praia do episódio 1 (Adventure); a silhueta específica da Torre Infinita; um "Trailmon" com o desenho de uma variante nomeada específica (ex.: "Trailmon Worm") em vez de um trem-Digimon genérico | **Não produzir sem aprovação específica do fundador** — registrar a intenção e esperar decisão, igual à regra de PI do §1.1 do contexto comum |
| **Reprodução direta (proibido)** | Copiar quadro a quadro, extrair frame de anime, ou redesenhar com intenção de ser indistinguível da cena oficial | Qualquer frame extraído do anime; qualquer cenário "idêntico" a um episódio específico | **Proibido sempre**, sem exceção — nem o ADR-007/009/014 (uso de Digimon oficiais como espécie) autoriza isto; a exceção de IP do projeto cobre nomes/designs de **criaturas**, não cenários de episódios específicos |

### 7.1 Classificação documental (ADR-015), aplicada aos elementos desta pesquisa
| Elemento | Classe | Fonte e risco (4) |
|---|---|---|
| Espécies Digimon (todas) | (1) Oficial | Reference Book / Wikimon; risco de IP registrado (ADR-007/009/015) |
| Floresta de File Island (bioma, vegetação, atmosfera) | (2) Recriação/adaptação | Anime Adventure (resumos de vídeo da Etapa 3, Wikimon); risco médio, assumido pelo fundador |
| Marcos reconhecíveis de File Island (praia dos postes, Torre Infinita etc.) | (2) Recriação/adaptação | Idem; recriar ou extrair (fundador 13/11), registrando episódio e minuto |
| Torres Negras (02) e Trailmon (Frontier) | (1) Oficial como conceito/espécie; (2) quando recriados como cenário | Wikimon `Dark_Tower`, `Trailmon` |
| Personagens do anime | (1) Oficial; uso como NPC | ADR-015; a skin é [PROPOSTA] futura |
| Layout do mapa-piloto, pontos de interesse, zonas de encontro | (3) Original | Projeto (Parte 2) |
| Tamer jogável | (3) Original | ADR-015 §3 |

## Limitações (Parte 1)

- As 4 séries não foram pesquisadas com o mesmo nível de profundidade: Adventure e 02 têm fonte Wikimon direta e específica (File Island, Dark Tower); Tamers e Frontier dependem mais de `01_UNIVERSO.md` (que por sua vez depende de resumos de vídeo de fã, categoria 4, e de conhecimento amplo de domínio não verificado em página própria nesta sessão) — ver limitações já registradas em `01_UNIVERSO.md` e `SOURCES.md`.
- Não consultei `wikimon.net` para páginas de território/terminal específicas de Frontier (ex.: uma lista completa de terminais/territórios) nem para Shinjuku/Mundo Digital de Tamers em detalhe — ficou restrito ao que `01_UNIVERSO.md`/`04_MUNDO_DIGITAL.md` já tinham reunido mais 2 verificações pontuais desta sessão (`Dark_Tower`, `Trailmon`).
- `digimon.fandom.com` continua bloqueado (Cloudflare 403) — não usado nesta pesquisa.
- Vegetação específica de Tamers e Frontier ficou **"sem dado específico"/"não documentado"** nas fontes consultadas — não inventei descrição de flora para preencher a lacuna.
- Este documento não contém o layout-brief da floresta (Parte 2) — essa é tarefa do `game-design`, usando a seção 6 como insumo, não como brief final.

---

# PARTE 2 — Layout-brief da floresta-piloto (Adventure)

- **Autor:** game-design (subagente) · **Data:** 2026-11-13.
- **Insumo usado:** Parte 1 §6 deste documento (game-research); `ESTUDO_ESCALA_DIGIMONS.md` §5 (3 Digimon recomendados para o laboratório); `qa/ETAPA2_HOMOLOGACAO.md` §D e §E (problemas de gameplay G1–G8 e auditoria visual da v15b); `art/digi-forest-v15/v15b/V15B.md` (estrutura atual em jogo); `quality-overhaul/PROJECT_LOG.md` (histórico de decisões do fundador sobre o mapa, 10/11 a 12/11).
- **Função deste brief:** é o **cenário comum** citado no comando §4 — o mesmo briefing que o `game-art` vai usar para comparar os 3 métodos de produção (`COMPARATIVO_FERRAMENTAS_VISUAIS.md`) e que o `game-qa` vai usar para avaliar com a régua (`RUBRICA_QUALIDADE_VISUAL_V1.md`). **Não é** uma expansão do mapa do jogo (ADR-012 continua em vigor): é a especificação de um mapa de teste do laboratório, para a 1ª rodada pequena (comando §8), separado da v15b em produção.
- **Nada aqui é implementado, nenhum mapa foi gerado, o PixelLab não foi usado.** Tudo marcado **[PROPOSTA]** é Camada B e depende de ADR/decisão do fundador — as regras de jogo continuam congeladas (fundador, 11/11) até a identidade visual ser definida. Os encontros descritos aqui são **especificação futura**, não implementação.

## 1. Decisão de partida que este brief respeita (não é nova, é do fundador)

Em 12/11 (~10:3x, `PROJECT_LOG.md`), o fundador já decidiu o princípio de legibilidade de caminho para este mapa: **"estilo Pokémon: chão todo verde, caminho formado por maciços de árvores, sem trilha marrom"**. Ou seja, a legibilidade do percurso **não** vem de uma trilha de terra pintada — vem do **espaço negativo**: clareiras e corredores que sobram entre blocos de árvores, sobre um piso verde contínuo. Este brief segue esse princípio; não propõe uma "estrada marrom".

Isso difere do item 7 da auditoria visual (`ETAPA2_HOMOLOGACAO.md` §E, nota 4: "não há caminho de terra na v15b... as referências usam estrada sinuosa"). A leitura deste brief: a nota baixa não é uma reprovação do princípio "sem trilha marrom" (que é decisão posterior do fundador e vale), e sim da **execução** da v15b — corredores em fileiras de árvore regulares, em grade, que leem como "letras" (crítica já registrada no coordenador sobre a v14, `PROJECT_LOG.md` 12/11 ~07:1x) em vez de corredores org​ânicos, variados em largura, com pontos focais. Este brief corrige a execução, não o princípio.

## 2. Dimensão proposta

**40 × 30 tiles de 32 px → 1.280 × 960 px.**

Menor que a v15b em produção (48×36) porque este é o **mapa de teste do laboratório** (comando §8: "1 mapa-piloto"), suficiente para mostrar zona segura, 2 faixas de encontro, 2 clareiras, 2 bolsões de descoberta, 1 zona de chefe e 1 transição — sem comprometer tempo/custo de comparar 3 métodos de produção no mesmo cenário. **[PROPOSTA de dimensão para o laboratório; não é o tamanho final de um mapa de produção]** — essa decisão, se a rodada for bem, fica para quando o fundador autorizar a expansão (pós-Etapa 6, ADR-012).

## 3. Diagrama de zonas (esquemático, não é grade de tile 1:1)

Cada caractere do diagrama abaixo representa um bloco de ~4×4 tiles, só para mostrar a relação entre as zonas — a forma real de cada corredor e clareira é trabalho do `game-art` dentro deste layout.

```
                 N (santuário / portal de saída)
      #  #  #  Z  Z  P  #  #  #  #
      #  .  .  Z  Z  Z  .  M  M  #
      #  B2 R  R  W  .  M  M  .  #
      #  .  R  P  R  .  M  M  M  #
      #  C  C  .  .  M  M  .  M  #
      #  C  C  .  .  .  .  M  .  #
      #  B1 .  T  T  T  T  .  .  #
      #  #  S  S  S  S  S  #  #  #
                 S (entrada / zona segura)
```

**Legenda:**
- `S` = zona segura (entrada, sem spawn hostil)
- `T` = trilha inicial — corredor de mato raso (encontros baby_ii)
- `C` = clareira de descanso (fogueira, ponto de orientação, sem spawn)
- `M` = mata densa / corredor principal (mato médio, encontros child)
- `R` = margem do rio / clareira de exibição (Digimon de porte maior, visível, sem vagar)
- `P` = ponte sobre o rio
- `W` = cachoeira
- `B1`, `B2` = bolsões de surpresa (só por caminho secundário)
- `Z` = santuário (zona de chefe de região)
- `#` = mata fechada / moldura do mapa (sólido)
- `.` = passagem/mata rala sem papel definido (preenchimento de transição)

## 4. Narrativa do percurso

O jogador entra pelo sul, numa **clareira segura** sem mato nem spawn — o ponto de chegada do mapa-múndi, equivalente à função do hub que já existe em outras regiões de Adventure (Vila dos Inícios, Parte 1 §2). Dali, uma **trilha inicial** sobe entre maciços de árvores baixos e esparsos: não é terra marrom, é grama aberta pontuada por tufos de mato raso, onde só aparecem Digimon do estágio baby_ii (os mesmos já previstos para spawn raso: Gigimon, Koromon, Tsunomon, Tokomon — Parte 1 §6.4).

A trilha termina numa **clareira de descanso**, com fogueira e um ponto de orientação (placa ou NPC-guia), sem spawn — o primeiro respiro do percurso, servindo também de bifurcação: um ramal curto leva ao **bolsão de surpresa 1 (B1)**, escondido atrás de um maciço de árvores, só alcançável saindo da rota principal.

Voltando à rota principal, o jogador entra na **mata densa**, o corredor mais longo e mais variado do mapa: maciços de árvore maiores e mais irregulares, com bolsões de mato médio nas laterais (não cobrindo o corredor inteiro) onde aparecem Digimon do estágio child (Agumon, Gabumon, Guilmon, Patamon — Parte 1 §6.4). O corredor cruza uma **ponte** sobre o rio, vindo de uma **cachoeira** a noroeste — o elemento atmosférico já aprovado conceitualmente pelo fundador nas referências de 11/11 (`founder-pixellab-chat/`) e já reaproveitado na v15/v15b.

Do outro lado da ponte, uma **margem do rio** se abre numa clareira ampla: aqui, pela 1ª vez no percurso, um Digimon de porte maior (adult/ultimate — por exemplo WarGreymon, recomendado em `ESTUDO_ESCALA_DIGIMONS.md` §5) aparece **visível à distância**, como marco de progressão, sem vagar pelo corredor nem bloquear o caminho (isso resolve diretamente G2 da homologação — ver §9). Um segundo bolsão de surpresa (**B2**), perto da cachoeira, fica escondido por outro ramal.

O percurso termina no **santuário**: uma clareira cercada por floresta mais fechada, reservada ao chefe de região (Kuwagamon, já definido no `GDD_MMO_V1.md` §1.2 para a Floresta Densa). Depois do santuário, um **portal** marca a transição para a próxima região do mapa-múndi.

## 5. Pontos de interesse e função de cada um

| POI | Zona | Função |
|---|---|---|
| Zona segura / entrada | S | Ponto de chegada do mapa-múndi; sem combate; referência de orientação ("aqui é seguro") |
| Placa/totem na entrada da trilha | S→T | Orientação/lore, sem interação mecânica obrigatória |
| Fogueira / clareira de descanso | C | Waypoint visual e marco de progressão; ponto de checkpoint/descanso **[PROPOSTA]** — função mecânica (regenerar, salvar, teleportar) é decisão de sistema, não deste brief |
| NPC-guia (reaproveitando o precedente "Gigimon Guia" de `digimon-forest-01`, já citado em `ETAPA2_HOMOLOGACAO.md` item 4b) | C | Tutorial/diálogo inicial, 1ª interação do mapa padrão — resolve G4 (mapa sem nada para interagir) **[PROPOSTA]** |
| Bolsão de surpresa 1 (B1) | fora da rota principal, perto de C | Ponto de descoberta secundário; recompensa (item/baú) ou encontro raro **[PROPOSTA]** |
| Ponte sobre o rio | M | Conexão entre a mata densa e a margem do rio; marco de travessia, referência visual já aprovada |
| Cachoeira | perto de R/B2 | Marco atmosférico; elemento já testado e aprovado pelo fundador (v15/v15b) |
| Margem do rio / clareira de exibição | R | Mostra um Digimon de porte maior à distância, sem bloquear a rota — resolve G2 **[PROPOSTA]** |
| Bolsão de surpresa 2 (B2) | fora da rota principal, perto de R/W | Segundo ponto de descoberta, perto da cachoeira **[PROPOSTA]** |
| Santuário | Z | Zona de chefe de região (Kuwagamon, já no GDD); ponto culminante do percurso |
| Portal | N, saída do santuário | Transição para outra região do mapa-múndi |

## 6. Densidade de vegetação por zona

| Zona | Cobertura de mato/obstrução | Papel |
|---|---|---|
| Zona segura (S) | ~0% — piso aberto, só decorativo (flores, pedras) | Sem combate, legibilidade máxima |
| Trilha inicial (T) | ~15–20%, tufos esparsos e pequenos | Encontros baby_ii raros, caminho sempre visível entre os tufos |
| Clareira de descanso (C) | ~5% — quase aberta, decorativa | Sem spawn; orientação |
| Mata densa / corredor (M) | ~35–45%, em bolsões irregulares nas laterais do corredor (não cobrindo o centro do corredor) | Encontros child, mais frequentes; o corredor central continua sempre livre |
| Margem do rio (R) | ~20%, vegetação baixa e esparsa (juncos, decorativo) | Zona de exibição, não de combate denso |
| Santuário (Z) | ~25%, moldura densa ao redor de um centro aberto | Combate de chefe num espaço legível, cercado por mata para dar fechamento visual |

**Nota sobre variedade:** a v15b hoje usa 4 espécies de árvore e 1 tipo de tufo de mato repetidos em todo o mapa (`ETAPA2_HOMOLOGACAO.md`, item 6, nota 4 — "repetição visível em qualquer tela"). Este brief recomenda **pelo menos 3 variantes de árvore e 2 de mato por zona densa (M e Z)**, para que a mata não leia como "pomar" uniforme — decisão de produção (`game-art`), não deste documento.

## 7. Requisitos de legibilidade

1. **Tamer e Digimon sempre visíveis.** Nenhum tufo de mato ou copa de árvore deve cobrir o sprite por completo; a regra de Y-sort (já pendente para o `game-dev` desde a v15b, `V15B.md` "Pendências") é pré-requisito técnico para este brief funcionar — repassado novamente aqui.
2. **Contraste caminho × mato, sem trilha marrom.** Seguindo a decisão do fundador (§1): o corredor livre é lido pelo espaço negativo (grama aberta contínua) contra os maciços de árvore e os bolsões de mato, não por uma textura de terra. O corredor deve ter largura variável (não uma faixa constante de 2 células, como a v14b corrigiu) e nunca ficar ambíguo sobre onde o jogador pode andar.
3. **Corredor sempre contínuo e identificável do início ao santuário**, sem depender de atravessar mata fechada — distinto dos "bolsões" (B1/B2), que são conscientemente escondidos (são descoberta, não rota).
4. **Profundidade visual.** Pelo menos uma feature de desnível (penhasco, platô, margem elevada) na moldura do mapa — a v15b hoje não tem (`ETAPA2_HOMOLOGACAO.md`, item 8: "chão plano, sem desnível"). Sugerido: a margem do rio (R) ou a área da cachoeira (W) como ponto de elevação.
5. **Variedade de chão.** Pelo menos 2 variações de textura de piso verde (não um único verde-menta chapado, item 5 da auditoria) — decisão de produção, mas o layout deve reservar espaço para essa variação nas zonas T, M e Z.

## 8. Encontros futuros — zonas de mato × áreas abertas × zona inicial segura [PROPOSTA — Camada B, regras congeladas]

Esta seção é **especificação futura**, não implementação: fica pronta para quando o fundador decidir destravar as regras de jogo (decisão pendente G-5 da `ETAPA2_HOMOLOGACAO.md` §G). Nada aqui entra em vigor sem ADR.

| Zona | Faixa de estágio proposta | Frequência proposta | Resolve |
|---|---|---|---|
| S (zona segura) | Nenhum spawn | — | G1, G2: dá ao jogador um ponto sem risco antes de qualquer luta |
| T (trilha inicial) | baby_ii (Gigimon, Koromon, Tsunomon, Tokomon) | baixa a média | G1: o inicial enfrenta rivais do próprio porte antes de qualquer Digimon mais fortes |
| C (clareira de descanso) | Nenhum spawn | — | G3: dá um ponto de respiro visível no meio do percurso |
| M (mata densa / corredor) | child (Agumon, Gabumon, Guilmon, Patamon) | média, dentro dos bolsões laterais, nunca no centro do corredor | G1, G7: ainda desafiador, mas dentro do porte do próprio Tamer inicial |
| R (margem do rio) | adult/ultimate, só em **exibição** (visível, parado ou em rota fixa curta, nunca perseguindo o jogador) | — | G2: resolve diretamente o problema de "fortes vagando perto da rota inicial" — aqui o Digimon forte é mostrado, não encontrado à força |
| Z (santuário) | Chefe de região (Kuwagamon, champion) | único, no final do percurso | Consistente com `GDD_MMO_V1.md` §1.2; a arena de chefe é "em breve" na homologação (item 6e) — este brief só reserva o espaço |

**Critério central desta proposta:** nenhuma criatura de estágio adult/ultimate aparece **vagando livremente** nas zonas S, T ou C. Isso é a resposta direta de layout a G2 ("fortes Nv.10–16 vagando perto da rota inicial derrubam o inicial em ~1,5s"). A decisão de nível/XP por faixa continua sendo trabalho de sistema (fora deste brief), mas a distribuição espacial — onde cada porte pode existir no mapa — é proposta aqui.

## 9. Transições entre áreas

- **S → T:** sem barreira, caminhada livre; a placa/totem marca a transição simbólica (fim da zona segura).
- **T → C:** a clareira de descanso é o ponto de recompensa visual da trilha inicial — abertura clara do corredor.
- **C → B1:** ramal secundário, mais estreito que o corredor principal, para marcar "isso é descoberta, não rota".
- **C → M:** entrada na mata densa marcada por um aumento perceptível da densidade de árvore (moldura mais fechada).
- **M → R:** a ponte é a transição física e visual — cruzar água é sempre um marco de progressão reconhecível.
- **R → B2:** ramal secundário perto da cachoeira, mesma lógica de B1.
- **R/M → Z:** entrada do santuário marcada por uma moldura de mata mais fechada que o resto do corredor (sinaliza "zona de chefe" antes do encontro).
- **Z → Portal:** saída única pós-chefe, para o mapa-múndi / próxima região.

## 10. Critérios verificáveis (para o `game-qa` usar depois)

1. Existe um caminho contínuo de tiles abertos (corredor/clareira) ligando a entrada (S) ao santuário (Z), sem exigir atravessar mato denso — verificável por busca de caminho (A* ou equivalente) usando só tiles de corredor/clareira.
2. Nenhum ponto de spawn de criatura adult/ultimate está nas zonas S, T ou C (critério direto de G2).
3. Existem pelo menos 2 pontos de descoberta (B1, B2) acessíveis **apenas** por ramal secundário, nunca visíveis diretamente da rota principal.
4. Existe pelo menos 1 elemento de descanso/orientação (fogueira, placa ou NPC) na trilha antes da mata densa.
5. A zona de mata densa (M) usa pelo menos 3 variantes de árvore e 2 de mato distintas (comparado às 4 árvores + 1 tufo repetidos hoje na v15b).
6. Existe pelo menos 1 feature de desnível/elevação (penhasco, platô ou margem elevada) visível na moldura do mapa.
7. A densidade de vegetação por zona fica dentro de ±5 pontos percentuais da tabela §6, medível por contagem de tiles/objetos de mato por célula de referência (ex. 10×10 tiles).
8. Nenhum sprite de Tamer ou Digimon fica mais de 50% ocluso por vegetação, amostrado em pelo menos 5 pontos ao longo do percurso principal.
9. O corredor principal nunca tem menos de 2 tiles de largura nem mantém uma largura constante de exatamente 2 tiles em toda a extensão (evita o padrão "letra K/J" já reprovado na v14).
10. Existe contraste visual perceptível entre o piso do corredor/clareira e o piso sob as zonas de mato denso (critério qualitativo — comparação lado a lado; o valor exato de paleta pertence ao conflito aberto Endesga-32 × referência PixelLab, não a este brief).

## 11. Limitações e decisões pendentes do fundador

- Este brief **não resolve** os conflitos visuais abertos da Etapa 6 (Endesga-32 × referência PixelLab, escala Tamer/Digimon, critério unificado de qualidade, composição/densidade final, convenções da Database) — foi desenhado para funcionar com qualquer decisão futura sobre eles.
- A "zona segura" e a distribuição de encontros por faixa de estágio (§8) são **recomendação de game-design**, não decisão: respondem à decisão pendente G-5 da `ETAPA2_HOMOLOGACAO.md` ("manter dificuldade alta ou criar zona inicial segura e calibrar níveis por área") propondo a 2ª opção, mas a escolha final é do fundador.
- O NPC-guia (§5) reaproveita um precedente que já existe em outro mapa (`digimon-forest-01`), mas **não está aprovado** para o mapa padrão; precisa de decisão de sistema (fora de World Design) para ganhar diálogo e lógica de jogo.
- A dimensão de 40×30 tiles (§2) é proposta só para o mapa de teste do laboratório; não é o tamanho de um mapa de produção, nem uma expansão autorizada do mapa atual (ADR-012 continua congelando expansão).
- Este brief não define valores numéricos de nível/XP/tempo de encontro — isso é trabalho de sistema de combate/progressão (Game Design "sistemas"), fora do escopo deste comando, que pede só layout.
- Nenhum mapa foi gerado, nenhuma arte foi produzida, o PixelLab não foi usado, e nenhum outro agente foi acionado para escrever esta Parte 2.
