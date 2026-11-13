# DIGITAL ODYSSEY — contexto comum dos agentes

> **Versão 1.2 · 2026-11-13** · v1.0 = Etapa 5 (`studio-alignment/COMANDO_IMPLANTACAO_ETAPA5.md`); v1.1 = ADR-015 (uso criativo amplo da franquia, adendo à Etapa 6), que acrescentou a §1.2 e ajustou a linha "Protagonista"; v1.2 = extração do anime liberada (ADR-015) · Dono: `game-studio` · Local: `~/projects/GameStudio/shared/knowledge/DIGITAL_ODYSSEY_CONTEXT.md`, citado pelo `AGENTS.md` dos 7 agentes.
> **Precedência documental:** decisões do fundador e ADRs > este contexto > documentos antigos. Entre duas decisões, vale a mais recente. Se este arquivo contradisser uma decisão do fundador ou um ADR, vale a decisão e este arquivo está errado — avise o `game-studio`, que o atualiza com nova versão e data.

## 1. O que é o jogo

| Item | Valor | Fonte |
|---|---|---|
| Nome | **Digital Odyssey** — "Um fangame de Digimon" | ADR-014 |
| Identificador técnico legado | **GS-003** (pastas, ids, chaves de save `gs003.*`, scripts, branches, projeto Vercel `gs003-digimon-preview`). Não renomeie nada técnico | ADR-014 |
| Natureza | **Fangame independente, não oficial e não licenciado**, não comercial, com Digimon de **espécies oficiais** (nomes e designs oficiais). Exceção do fundador à regra de IP do estúdio, válida só para este projeto (§1.1) | ADR-007, ADR-009, fundador 13/11 |
| Franquia | **Só Digimon.** Nenhuma tarefa, asset ou pesquisa de Pokémon | ADR-009 |
| Gênero | Idle MMORPG 2D em pixel art, top-down 3/4, mundo compartilhado (hoje simulado localmente), exploração em grade, automação (AUTO) | ADR-009, ADR-010 |
| Combate | **No próprio mapa. Nunca tela de batalha separada.** Estados IDLE, WALK, FOLLOW, ENGAGE, ATTACK, HURT, DEFEAT, RETURN. Lógica separada da apresentação; a animação nunca decide o resultado | ADR-009 |
| Evoluções | Respeitam **continuidade e fonte**; nunca inventar relação canônica. O que não tem fonte é lacuna ou proposta da Camada B | fundador 13/11; Etapa 4 |
| Equipe | Vários Digimon com progressão completa **e um parceiro especial** (papel de uma instância, não espécie; sem bônus arbitrário de atributo; os outros não ficam inferiores) | ADR-013 |
| Protagonista | **Tamer jogável original e personalizável** (12 presets v13 aprovados). Personagens do anime entram como **NPCs** e no conteúdo narrativo; skins deles são ideia futura **[PROPOSTA]** (ADR-015) | ADR-007 §3, ADR-015 |
| Diferenciais | Evolução e relacionamento; mundo vivo; Digimon reconhecíveis e bem animados | brief Etapa 5 §4; Reddit (Etapa 3b: parceiro com vínculo é o desejo nº 1) |
| Direção visual | **GBA Plus** aprovada; a identidade visual atual **ainda não está homologada** (§4) | fundador 11/11 e 13/11 |
| Decisões preservadas | Parceiro especial, equipe, afinidade, talentos, montarias, cuidados e reencarnação ficam **preservados como estão: nada é implementado nem modificado** sem tarefa autorizada | fundador 13/11 |

### 1.1 Propriedade intelectual (decisão do fundador, 2026-11-13)
O fundador reconhece que o Digital Odyssey **não tem licença nem autorização** dos titulares de Digimon. Vale para todos os agentes:
1. o projeto é **independente, não oficial e não licenciado**;
2. usar Digimon oficiais é uma **decisão específica deste fangame** (ADR-007, ADR-009, ADR-014);
3. essa decisão **não constitui autorização jurídica** para reproduzir, distribuir ou publicar;
4. o projeto **nunca se apresenta** como oficial, licenciado, patrocinado ou afiliado;
5. o uso de elementos protegidos **envolve risco de propriedade intelectual**;
6. **toda publicação pública** exige aprovação específica do fundador e avaliação de risco;
7. **não há autorização de monetização**.

A exceção vale **só para este projeto**. `GOVERNANCE.md` e `VISION.md` **não** foram alterados; a incompatibilidade entre eles e esta exceção está registrada (`studio-alignment/08` C1) para revisão posterior.

### 1.2 Uso criativo da franquia (ADR-015, fundador, 2026-11-13)
No planejamento e no desenvolvimento **interno**, é permitido usar e recriar elementos reconhecíveis de Digimon:
- espécies e linhas evolutivas;
- personagens do anime como NPCs e na narrativa;
- locais, cidades, ilhas, estruturas e cenários;
- acontecimentos das temporadas;
- objetos e dispositivos;
- recriação de ambientes e de elementos visuais.

**Não** troque elementos de Digimon por alternativas "originais" por precaução genérica.

O risco jurídico é **registrado** de forma objetiva, mas **não bloqueia** automaticamente o planejamento interno.

Classifique cada elemento como **(1) oficial da franquia**, **(2) recriação ou adaptação** ou **(3) original do projeto**, e registre **(4) a fonte e o risco**. Essa classificação serve para rastrear, não para descaracterizar.

Cada temporada pode inspirar uma região. A fidelidade visual e conceitual dos Digimon é obrigatória, e a nota mínima continua 8/10.

**Ainda NÃO autorizado:** publicação, divulgação ou distribuição pública, monetização, contratação, crédito pago sem aprovação, mudança no jogo fora do escopo e mudança de permissões.

**Extração do anime (decidida, fundador 13/11):** pode extrair frames e imagens do anime e usar como referência ou base de asset quando agregar. Condições: classificar (1)/(2); registrar a fonte (obra, episódio, minuto, URL); usar a camada `official-fan-use` ou `reference`, com crédito; tratar para a identidade visual (nota ≥ 8); só de fonte com acesso legítimo, sem contornar DRM ou login. Publicação continua exigindo decisão específica.

A §1.1 e as condições abaixo continuam valendo. A §1.2 amplia o uso **criativo interno** e não muda nenhum limite público ou comercial.

### Condições do fangame (valem sempre)
1. Sem monetização de nenhum tipo (venda, anúncio, doação vinculada, IAP, coleta comercial de dados).
2. Sem logo ou marca oficial no título, ícone ou divulgação; aviso de "fan game não oficial, sem afiliação com Bandai/Toei".
3. Publicação exige aprovação **específica** do fundador e avaliação de risco (§1.1). Padrão: uso local e privado.
4. Conteúdo em pacote de dados trocável (content pack).
5. Sprites oficiais extraídos de jogos (DW DS/Dawn/Dusk etc.) são **permitidos** com a camada `official-fan-use` e crédito do ripper/fonte (ADR-009, revogando o item 2 do ADR-007). Meta de longo prazo: substituir por arte própria.

**Atenção:** o `AGENTS.md`, o `GOVERNANCE.md` e o `VISION.md` dizem "nunca copiar arte, nomes ou marcas de terceiros". Para o Digital Odyssey essa regra vale **com a exceção acima (§1.1)**, e só ela. Fora deste projeto a regra geral continua intacta.

## 2. Estado do projeto (não antecipe)

- **A versão visual atual NÃO é a qualidade aprovada.** É referência de progresso. Etapa 2: nota visual média **4,6/10** (mínimo 8).
- **Não expandir mapas** antes de validar a qualidade (ADR-012: expansão de mundo congelada).
- **Não produzir sprites em massa** antes de homologar o padrão (ADR-010: nada de produção em massa antes da prova visual).
- **Regras de jogo congeladas** até a identidade visual estar definida (fundador, 11/11). Vínculo/Poderes/Talentos mínimos estão aprovados, mas só entram depois do descongelamento.
- **Não antecipar o roadmap.** Cada etapa só começa com autorização do fundador. Etapa atual: **5 (alinhamento)**. A Etapa 6 (laboratório visual) **não começou**.
- **Um agente de execução e uma tarefa por vez** até a conclusão e a homologação da Etapa 6, cada passo aprovado pelo fundador. Depois, o fundador decide se autoriza até 4 simultâneas. Ninguém altera a configuração global de concorrência.

### Etapas
| Etapa | Conteúdo | Status |
|---|---|---|
| 1 | Proteção no git (backup, push privado) | concluída 12/11 |
| 2 | Homologação técnica, funcional e visual (`qa/ETAPA2_HOMOLOGACAO.md`) | concluída 12/11 |
| 3 / 3b | Imersão Digimon (`research/etapa3-imersao/`, comece pelo `09`) | concluída 12/11 |
| 4 | Digimon Database 1.0 (`database/`) | **homologada com ressalvas** |
| 5 | Alinhamento do estúdio (`studio-alignment/`) | aprovada; **implantação autorizada em 13/11**, em curso |
| 6 | Laboratório visual (3 abordagens de mapa) | **não iniciada** |

## 3. Universo Digimon — o mínimo que todo agente precisa saber

Fonte de verdade: a **Database** (`projects/prototypes/GS-003/database/`, regras em §5 abaixo) e `research/etapa3-imersao/01_UNIVERSO.md` e `03_EVOLUCAO.md`. Este resumo **não substitui** a Database; em dúvida, consulte-a.

### 3.1 Espécies e estágios — nunca misturar convenções
| Normalizado (Database, JP) | Japonês | Inglês oficial |
|---|---|---|
| `baby_i` | Baby I | In-Training I (Fresh) |
| `baby_ii` | Baby II | In-Training II |
| `child` | Child | Rookie |
| `adult` | Adult | Champion |
| `perfect` | Perfect | **Ultimate** |
| `ultimate` | Ultimate | **Mega** |
| `armor` | Armor | Armor |

**"Ultimate" em inglês é o `perfect` japonês.** Um documento que diz "Ultimate" sem dizer a convenção é ambíguo: pergunte ou consulte a Database. O jogo hoje usa números de estágio (1–5) e rótulos em pt-BR; o mapeamento fica no `gs003_mapping.json`.

### 3.2 Evolução
- É **grafo, não árvore**: uma espécie tem vários destinos e várias origens; a mesma dupla pode ter arestas de tipos diferentes; requisitos variam por continuidade (jogo/anime).
- 16 tipos de evolução na Database (natural, Jogress/fusão, Armor, warp, Matrix Evolution em dois sentidos distintos, etc.). **Biomerge e Matrix Evolution não são sinônimos soltos**: são dois tipos com o mesmo termo japonês.
- **Nenhuma aresta de evolução tem fonte oficial** (o Reference Book não publica evoluções; o grafo vem do Wikimon). Trate evolução como "atestada pela comunidade", nunca como "oficial".
- Na franquia, evolução depende de Field, ambiente, talento, cuidado, dados consumidos e modificação externa; com Tamer, de **vínculo + Digivice**. Evolução forçada pode falhar de forma visível (SkullGreymon). Há regra oficial de custo/des-evolução depois de evolução alta (Adventure).

### 3.3 Continuidades
Cada série é uma continuidade própria (Adventure/02/tri juntas; Tamers, Frontier, Savers, Ghost Game isoladas), e cada jogo tem as próprias árvores. **Toda afirmação sobre evolução, estágio ou atributo precisa da continuidade.** Sem fonte de obra, use `ctx.franchise_general`. "Multiverso" é interpretação de fã.

### 3.4 Atributos
Vaccine, Data, Virus, Free, Variable — e **`none`** (bebês não têm atributo no Reference Book). **`none` ≠ `free`.** A mesma espécie pode ter atributo diferente por obra (ex.: MetalGarurumon Data no oficial, Vaccine em Pendulum).

### 3.5 Habilidades
Golpes de assinatura oficiais (Special Moves) são N:N com espécies (Acid Bubbles em quatro bebês; Mega Flame em Greymon e GeoGreymon). Efeito de habilidade está **pendente** em toda a Database: não invente números.

### 3.6 Personalidade e relacionamento
Na franquia o humano é parceiro, não dono; o Digimon tem personalidade própria e a evolução emocional segue uma "grade" (proteção → coragem/superação → aceitação/identidade). Isso é **inspiração**; as regras do Digital Odyssey sobre vínculo, confiança, cuidado e personalidade ainda são **propostas** (Camada B), exceto o que o ADR-013 aprovou.

### 3.7 Parceiro especial (ADR-013)
- Vários Digimon por jogador, todos com XP, nível, habilidades, árvore evolutiva, personalidade, afinidade, talentos, histórico.
- **Um** pode ter o papel de parceiro especial: camada extra de relacionamento, emoção, narrativa e possíveis condições evolutivas próprias.
- Não dá vantagem arbitrária de atributo; não torna os outros inferiores.
- **Em aberto (não decida):** como se escolhe; se pode trocar; consequência da troca; como vínculo/personalidade influenciam a evolução; como o resto da equipe mantém relevância.

### 3.8 Armadilhas conhecidas
| Erro | Certo |
|---|---|
| Drimogemon = nome japonês de Digmon | **Duas espécies.** Drimogemon (Champion, Data); Digmon (Armor). O catálogo de sprites tem esse erro (`SP-DRIMOGEMON`) |
| Slug `greymon` no Reference Book = Greymon clássico | `greymon` é a versão Xros Wars (Virus); o clássico é `greymon-first` |
| Penmon é Data | Penmon é **Vaccine** no oficial (o jogo diverge) |
| Gaia Force / Terra Force, Goburimon / Goblimon, Penguinmon / Penmon intercambiáveis | Convenções diferentes; a convenção de nome do jogo é **decisão pendente (D2 da Etapa 4)** |
| "Montaria é sistema da franquia" | Não existe sistema oficial de montaria; é invenção do Digital Odyssey |

## 4. Identidade visual e referências

- **Direção:** "GBA Plus" (aprovada; a identidade atual **não** está homologada) / "GBA Clean" — top-down 3/4, pixel nítido sem AA, contorno legível, sombra de contato elíptica, iluminação uniforme, chão de baixo ruído; mundo denso e vivo. **Qualidade visual acima da velocidade.**
- **Referências (ADR-010):** IdleDex = estrutura (MMO de captura, grade, HUD inferior, encontros no mapa); Drakantos = nível de qualidade; Digimon = identidade. Composição canônica: visão de cima, vegetação densa, copas grandes, grama alta, flores, clareiras, nomes/níveis sobre entidades, HUD inferior.
- **Aprovado pelo fundador:** tile 32 px (11/11); Style Bible GBA Plus como Gate 1 (11/11); direção v13 PixelLab (11/11); mapa v15 com ajustes e Tamers v13 (12/11); filtro cartoon +40% saturação / +15% contraste (Mega Knight); Digimon **iguais aos oficiais** (sprites DS, 11/11).
- **Conflitos visuais ABERTOS (fundador, 13/11 — não resolva; são tratados na Etapa 6):**
  1. Endesga-32 × referências posteriores;
  2. escala Tamer/Digimon;
  3. critério unificado de qualidade;
  4. composição e densidade dos mapas;
  5. convenções da Database relevantes para sprites.

  Não produzir assets agora. Detalhe dos dois primeiros abaixo.
- **Paleta (aberto):** o Style Bible exige paleta Endesga-32 no cenário e trata fora dela como falha crítica; a v15b aprovada tem 0% de pixels na Endesga-32. **Qual manda é decisão do fundador** (Etapa 2, G-1). Até lá: avalie contra os dois e reporte ambos.
- **Escala (aberto)** (Etapa 2, G-2): Tamer ~36 px, Rookie DS 30–34 px, Champion DS 38–42 px num tile 32 — um Greymon quase do tamanho do Tamer. Toda arte nova herda o problema até haver decisão. É o tema central da Etapa 6.
- **Três estilos convivem no jogo** (rip DS, PixelLab cartoon, procedural v8–v12). Nada novo deve criar um quarto.
- **PixelLab:** Tier 1 (2.000 gerações/mês, renova 11/12). Toda geração tem teto definido pelo coordenador e entra no `PROJECT_LOG.md`. Comprar créditos exige aprovação.

## 5. Database (conceitual, sem runtime)

Regras completas em `studio-alignment/04_REGRAS_CONSULTA_DATABASE.md` (após aprovação, no `database/README.md`). O essencial:
1. **Camada A** = conhecimento da franquia (`species`, `skills`, `evolutions`, `sources`, `claims`). **Camada B** = proposta ou decisão do Digital Odyssey (`gs003_proposals`, `gs003_mapping`).
2. **Proposta não vira regra aprovada.** Na Camada B só é "aprovada" a regra que cita um ADR.
3. **Fonte comunitária não é oficial.** Categorias: 1 oficial · 2 oficial de continuidade · 3 wiki · 4 vídeo/fã · 5 inferência · 6 proposta. `verified_secondary` = lido no Wikimon, **não** confirmado.
4. Não misturar estágios JP e EN. Não confundir Drimogemon com Digmon. Preservar a proveniência.
5. **O piloto revisado (23 espécies) é a referência prioritária**; a base estendida (81) é secundária.
6. A Database **não** é fonte do jogo hoje (D7 pendente). Não ligue nada ao runtime.
7. Não edite `database/data/*.json` à mão; o gerador sobrescreve. Mudança na Camada A é trabalho do `game-research`.

## 6. Arquitetura do jogo (fatos que evitam premissa errada)

- Motor **Canvas 2D próprio em TypeScript + Vite**. **Não é Phaser.**
- Código vivo: worktree `workspaces/game-dev/qo`, branch `quality-overhaul`. O master tem a pasta `prototype/` desatualizada em relação ao `qo`.
- Mapas: Tiled `.tmj`; mapas do PixelLab entram por `import-pixellab-map.mjs` (com o filtro cartoon assado).
- Persistência: `localStorage`. Sem backend: guilda, chefe mundial, chat e ranking são bots "simulado".
- Prévia pública: `gs003-digimon-preview.vercel.app`, **sem login** desde 12/11, com noindex. Risco de IP aberto (Etapa 2, G-3).

## 7. Onde está cada coisa

| Precisa de | Leia |
|---|---|
| Decisões | `shared/decisions/ADR-001..014` (para o jogo: 006–014) |
| Histórico e decisões do dia a dia | `projects/prototypes/GS-003/quality-overhaul/PROJECT_LOG.md` |
| Estado funcional e visual | `qa/ETAPA2_HOMOLOGACAO.md` |
| Universo, benchmark, evolução, mundo, UX | `research/etapa3-imersao/` (`09` primeiro) |
| Dados Digimon | `database/README.md`, `07_CATALOGO_PILOTO.md` |
| Style Bible | `quality-overhaul/phase3/style-bible/DIGIMON_STYLE_GUIDE.md` |
| Direção v13 e PixelLab | `quality-overhaul/direction-v13/`, `art/digi-forest-v13..v15/`, `art/tamers-v13/` |
| Arquitetura técnica | `docs/DIAGNOSTICO_TECNICO_1.0.md`, `workspaces/game-dev/qo/projects/prototypes/GS-003/prototype/world/README.md` |
| Responsabilidades e fluxo | `studio-alignment/02`, `05`, `06` |

## 8. Regras de conduta comuns no projeto

- Escreva em **pt-BR**. Separe **[E] evidência** (fonte e data) de **[H] hipótese**. Nunca invente dado, fonte ou resultado.
- Novos documentos usam "Digital Odyssey"; ids técnicos continuam GS-003.
- Ninguém aprova o próprio trabalho. Nenhum agente aprova sozinho mudança estratégica.
- Nenhum agente aciona outro agente permanente: só o `game-studio` dispara tarefas, uma por vez.
- Antes de propor, verifique se já foi decidido (ADR, log). Decisão posterior prevalece.
- Toda entrega: caminho do arquivo, resumo, limitações, e o que **não** foi feito.

## 9. Agentes (nenhum agente novo; os 7 IDs são mantidos)

| Agente | Responsabilidade |
|---|---|
| `game-studio` | Game Director e coordenação |
| `game-research` | Universo Digimon, fontes e Database |
| `game-design` | Sistemas, mecânicas, UX e World Design |
| `game-art` | Direção de arte, sprites, animações e cenários |
| `game-dev` | Arquitetura, desenvolvimento e integração |
| `game-qa` | Qualidade, testes e homologação técnica |
| `game-growth` | Marketing, comunicação e comunidade (Digital Odyssey Marketing & Community Lead) |

Cada agente tem `AGENTS.md` e `SOUL.md` próprios; este contexto é comum, compartilhado e versionado. Matriz completa: `studio-alignment/02`; permissões: `06`.

### 9.1 World Design (decisão do fundador, 2026-11-13)
| Quem | Faz |
|---|---|
| `game-design` | Estrutura de mapas, **layout-brief**, fluxo de exploração, regiões, biomas, pontos de interesse, distribuição de encontros e interações |
| `game-art` | Composição visual, cenários, tilesets e sprites, profundidade, atmosfera, acabamento, animações, consistência estética |
| `game-dev` | Engenharia e integração técnica dos mapas |
| `game-qa` | Validação independente de composição, escala, funcionalidade e desempenho |
| `game-studio` | Coordenação e priorização. **Não produz mapas e não homologa o próprio trabalho** |

## 10. Marketing & Community (`game-growth`)

- **Função:** Digital Odyssey Marketing & Community Lead. **Status:** **ATIVO no Nível 1 — Planejamento interno**.
- **Missão:** desenvolver e, no futuro, operar o marketing e a comunidade, do desenvolvimento ao beta fechado e além. Linguagem humana, natural e envolvente; sem promessas exageradas nem texto genérico.
- **Responsabilidades:** estratégia (posicionamento, público, tom de voz, editorial, benchmarking, crescimento orgânico); Instagram (posts, Reels, Stories, carrosséis, calendário, legendas, hashtags, análise); diário de desenvolvimento; comunidade (enquetes, discussões, Discord futuro); beta fechado (plano); análise. Não inventa métricas, datas nem funcionalidades.
- **Nível 1 (ativo):** pesquisar referências públicas, criar estratégias e calendários, redigir legendas e roteiros, propor posts e campanhas, planos de comunidade, modelos de análise, relatórios internos. **Não pode:** publicar, agendar, enviar mensagens, responder comentários, criar ou conectar contas, criar anúncios, gastar, coletar dados de interessados, abrir inscrições, divulgar data de beta, nem nenhuma ação pública.
- **Níveis 2 (publicação supervisionada), 3 (operação autônoma controlada) e 4 (marketing e comunidade completos):** roadmap futuro, **não autorizado**. Nenhum nível é ativado automaticamente; toda ampliação exige autorização explícita do fundador; as permissões técnicas acompanham o nível; o agente não altera as próprias permissões. Nada de contas, credenciais nem ferramentas de publicação nesta etapa.
- Regras permanentes completas: `AGENTS.md` do `game-growth` §4.3.

## 11. Fluxo marketing ↔ desenvolvimento

1. `game-studio` informa os marcos **homologados**.
2. `game-growth` identifica as oportunidades.
3. `game-design` verifica afirmações sobre mecânicas.
4. `game-research` verifica afirmações sobre Digimon.
5. `game-art` verifica o material visual.
6. `game-qa` confere se o conteúdo corresponde ao estado real do jogo.
7. `game-studio` consolida.
8. **O fundador autoriza** qualquer divulgação pública.

**Aprovar um calendário ≠ autorizar a publicação.** O `game-growth` não aciona outros agentes; as verificações são tarefas do `game-studio`, uma por vez. Material não homologado não aparece como final.
