# COMPARATIVO_FERRAMENTAS_VISUAIS — Etapa 6, Comando 1 (entregável do §4)

- **Autor:** game-art (subagente, 3º da sequência) · **Data:** 2026-11-13.
- **Regra respeitada:** só planejamento. Nenhuma geração no PixelLab nem em outra ferramenta nesta entrega (só `get_balance`, leitura). Nenhum asset produzido, nenhum arquivo do jogo/Database alterado, nenhum outro agente acionado.
- **Saldo PixelLab no momento desta entrega [E, `get_balance`, 2026-11-13]:** 737,95 de 2000 gerações restantes (usado 1262,05 no ciclo); créditos US$ 0,00; renova em 2026-12-11.

## 0. Nota de precedência documental (achado, não decisão)

Existem **duas definições diferentes** dos métodos A/B/C nos documentos-fonte:

| Documento | Data | Método A | Método B | Método C |
|---|---|---|---|---|
| `studio-alignment/07_BRIEFING_ETAPA6_VISUAL.md` §5 | 2026-11-12, status "PROPOSTA" | PixelLab refinado | Tilesets próprios (mão) | Híbrido PixelLab + mão |
| `etapa6-lab/COMANDO_ETAPA6_C1.md` §4 | 2026-11-13, comando do fundador em execução | ChatGPT + ferramentas gratuitas | PixelLab | Híbrido ChatGPT + PixelLab + editores |

Pela regra de precedência do contexto comum (§0: "decisão do fundador e ADR mais recente prevalece"), **este documento usa a definição do Comando C1 (2026-11-13)**, que é o comando ativo e mais recente. A definição do briefing 07 está desatualizada neste ponto — registro para o `game-studio` decidir se arquiva ou atualiza aquele documento. Não é um dos 5 conflitos visuais abertos oficiais (§2 do contexto comum); é uma inconsistência de planejamento entre duas rodadas da Etapa 5/6.

A matriz de critérios mensuráveis V1–V12 do briefing 07 §6 continua útil e é reaproveitada na seção 3 deste documento, porque mede qualidade de resultado, não depende de qual método produziu.

## 0b. Adendo do fundador (ADR-015, 2026-11-13) — uso criativo amplo da franquia

Recebido durante a produção deste documento. Lido `shared/decisions/ADR-015-digital-odyssey-uso-criativo-da-franquia.md` e o contexto comum v1.2 (`DIGITAL_ODYSSEY_CONTEXT.md` §1.2, versão atualizada após o início desta tarefa). **Ajustes aplicados neste documento em consequência:**

1. **Nenhum método é restrito a "só inspiração genérica".** O ADR-015 autoriza, no desenvolvimento interno, recriar elementos reconhecíveis da franquia — espécies, personagens do anime como NPCs, locais/cidades/ilhas/estruturas, objetos e dispositivos — sem troca automática por alternativa "original" por precaução. Isso substitui a leitura mais cautelosa que `ESTUDO_REGIOES_E_MAPA_PILOTO.md` §7 (escrito antes do ADR-015) dava à recriação de local reconhecível (antes: "risco médio, não produzir sem aprovação específica"; agora: autorizado no planejamento/desenvolvimento interno, com a classificação documental abaixo). O briefing da seção 2.2 foi ajustado para permitir referência direta a File Island, à praia dos postes e à Torre Infinita, não só ao "tipo" de bioma.
2. **Classificação documental do ADR-015** (substitui a antiga tabela "inspiração × cópia proibida") aplicada ao elenco e ao cenário do laboratório — ver nova seção 2.4.
3. **Ponto aberto registrado e CONFLITO encontrado** sobre extração de frame/imagem do anime como asset — ver caixa de destaque na seção 2.5. Não resolvido por este agente; fica para o `game-studio`/fundador.

---

## 1. Os 3 métodos

**Nota pós-ADR-015:** a restrição de propriedade intelectual que antes limitava referência de cenário a "tipo de paisagem genérico" (floresta tropical, obelisco negro genérico) não se aplica mais no planejamento interno — qualquer um dos 3 métodos pode usar diretamente elementos reconhecíveis da franquia (local, estrutura, personagem) como alvo de produção, não só como inspiração de estilo. Isso não muda a capacidade técnica de cada ferramenta (seções 1.1–1.3 abaixo), só amplia o que cada uma tem permissão de tentar reproduzir.

### 1.1 Método A — ChatGPT + ferramentas gratuitas

**Composição:** ChatGPT (ou outro gerador de imagem por texto/IA generalista) para a arte-base + Aseprite/LibreSprite/Piskel (edição de pixel art, exportação, paleta, folha de sprite) + GIMP/Krita (tratamento de imagem, remoção de fundo, ajuste de cor) — tudo gratuito ou já licenciado fora desta conta PixelLab.

**Acesso real desta execução: zero.** Este ambiente de sandbox não tem chave de API OpenAI nem acesso à conta de ChatGPT do fundador. Tudo neste método A é [H] — conhecimento de domínio sobre como a ferramenta funciona, nunca testado nesta sessão nem em sessão anterior do projeto (não há registro de uso de ChatGPT em nenhum `V1x.md`/`PROJECT_LOG.md` revisado). **Qualquer execução do Método A depende da conta do fundador ou de autorização e credencial específica.**

| Etapa | Ferramenta | Como funciona [H] | Limitação conhecida [H, documentada no domínio] |
|---|---|---|---|
| **Sprite (Digimon ou Tamer)** | ChatGPT (geração de imagem) | Prompt de texto descrevendo a pose/ângulo único; a cada chamada nova, 1 imagem isolada, sem "memória" de rotação nem de outras direções | Geradores de imagem generalistas (incluindo o modelo de imagem do ChatGPT) não têm noção de "sprite de jogo": a grade de pixel não é nativa — a saída normal é uma ilustração em alta resolução com antialiasing, sombreamento suave e proporção livre, **não** pixel art real. Para virar sprite, precisa de um passo de conversão (pixelização manual ou outra ferramenta) que o próprio ChatGPT não faz de forma confiável. Sem controle de direções (só 1 ângulo por vez, sem garantia de consistência entre chamadas) |
| **Pixelização/limpeza** | Aseprite/LibreSprite ou Piskel | Reduzir a arte gerada para uma grade de pixel fixa (downscale + quantização de cor manual), redesenhar contornos à mão, ajustar paleta | Trabalho manual intensivo: a imagem gerada raramente cai numa grade de pixel limpa; cada quadro precisa de correção humana pixel a pixel para remover ruído de antialiasing e fixar contorno — é o oposto de "sprite pronto" |
| **Transparência / exportação** | GIMP ou o próprio Aseprite | Remoção de fundo (varinha mágica/chroma key), exportação em PNG com alpha, folha de sprite (`.aseprite`/spritesheet) | Remoção de fundo manual é imprecisa em bordas com antialiasing (halo residual); exportação de folha de sprite depende de o artista posicionar cada quadro manualmente — sem ferramenta de "layout automático por frame" como a de produtos dedicados a pixel art com IA |
| **Animação** | Aseprite (timeline de camadas) ou geração quadro a quadro no ChatGPT | Desenhar/gerar cada quadro manualmente e montar a timeline; ChatGPT não gera sequências coerentes de animação nativamente — cada quadro é uma chamada isolada, sem garantia de que a pose, a cor e o contorno fiquem idênticos entre quadros | **Maior fraqueza do método**: consistência entre quadros é o problema central. Sem um pipeline de interpolação/esqueleto, cada quadro novo pode "derivar" (cor, proporção, detalhe mudando sutilmente) — corrigir isso é trabalho manual de reequilíbrio de paleta e redesenho, quadro a quadro |
| **Tileset de cenário** | ChatGPT (textura base) + Aseprite/GIMP (recorte em grade, autotile manual) | Gerar uma textura de referência, recortar manualmente em blocos de 32×32px, desenhar as variantes de borda/transição (grama↔água, por exemplo) à mão, já que não há ferramenta de Wang-tile automática no pacote gratuito | Autotile (bordas que conectam terrenos diferentes sem costura) exige desenhar manualmente cada combinação de borda (até 16+ variantes por par de terreno) — processo lento, sem o atalho de geração de "Wang tileset" que o PixelLab tem nativamente |
| **Prop de cenário (árvore, pedra, totem)** | ChatGPT (ilustração base) + Aseprite (conversão/limpeza) | Mesmo fluxo do sprite: gerar, pixelizar manualmente, limpar contorno, exportar com transparência | Sem controle de "múltiplas variantes consistentes" (ex.: 3 árvores da mesma família, cores e traço parecidos) sem repetir manualmente o trabalho de limpeza em cada uma |

**Limitações gerais do Método A (consolidado):**
1. **Imagem gerada não é sprite pronto** (restrição do próprio comando §4) — todo resultado do ChatGPT exige conversão manual para pixel art real, com perda de tempo e risco de inconsistência.
2. Sem controle nativo de dimensão exata em pixels, direções (8 direções), nem de reaproveitamento de estilo entre assets (cada chamada é isolada).
3. Sem ferramenta de autotile, esqueleto de animação, nem exportação de spritesheet pronta para engine — tudo isso é trabalho humano com Aseprite/GIMP.
4. Dependência de uma conta externa (não controlada por este ambiente de agente) e de um custo de assinatura que varia pelo plano do fundador — não medido aqui.
5. Ponto forte real: controle criativo e iterativo direto por quem desenha (o humano decide cada pixel final), e zero dependência do saldo PixelLab.

### 1.2 Método B — PixelLab

**Composição:** só as ferramentas MCP do PixelLab já usadas no projeto (`create_character`, `animate_character`, `create_topdown_tileset`/`create_tiles_pro`, `create_map_object`, `create_map`/`edit_map`, `pixelart_workbench` para ajustes locais grátis).

| Etapa | Ferramenta PixelLab | Fluxo real já usado no projeto | Limitação conhecida [E, histórico do projeto] |
|---|---|---|---|
| **Sprite (Digimon)** | `create_character(mode="v3", reference_image_url=...)` a partir do rip oficial DS, ou sprite oficial `official-fan-use` direto (sem gerar nada) | Regra de arte vigente (AGENTS.md §5): Digimon = sprite DS oficial primeiro; PixelLab só para adaptação autorizada/lacuna | `create_character` sem referência produz Digimon **genérico**, não o oficial — viola a regra "iguais aos oficiais" se usado sem cuidado. Testado no projeto para Guilmon 64px: 3 rodadas (5+5,2+8 gerações) até ficar "limpo", nunca passou de nota 4–6/10 em identidade/clusters no QA [E, `PROJECT_LOG.md` 2026-11-10 00:2x–02:1x] |
| **Sprite (Tamer)** | `create_character(mode="v3")` por descrição (humano original, sem rip) | 12 presets v13, 8 direções, 36×36px, walk+idle | Funcionou bem (Tamer é humano original, sem exigência de "igual ao oficial") — mas abre tensão de escopo com o Style Bible, que recomendava manter o Tamer também no sprite oficial sem redesenho [E, `TAMERS_V13.md` limitação 1] |
| **Animação** | `animate_character(mode="template"|"v3", template_animation_id=...)` + `mirror_animation` (grátis) para direções espelháveis | Walk/idle 8 direções em 12 presets: 43 gerações pagas + 44 mirrors grátis [E, `TAMERS_V13.md`] | Risco documentado de **encolhimento entre quadros** (v3 custom start frame corrige, mas exige descoberta por tentativa: 3 iterações de QA antes de achar o pipeline estável) [E, `PROJECT_LOG.md` 2026-11-10 02:1x–04h] |
| **Tileset de cenário** | `create_topdown_tileset(mode="standard")` (1 geração) para pares de terreno (grama↔água, grama↔mato) | Usado nas 3 rodadas da Digi Forest v13/v14/v15 | Bordas em **degrau de célula** entre terrenos sem tileset de transição dedicado (admitido pela própria ferramenta); sem tileset entre um par específico, a borda fica reta/dura [E, `V15.md` limitações, `ETAPA2_HOMOLOGACAO.md` item 7] |
| **Prop de cenário** | `create_map_object`/objetos reaproveitados da conta (árvores, totens, ruínas, cristais) via `place_map_object` | 230–512 árvores plantadas por script com zona de exclusão de água, 0 geração extra (reaproveitamento) | Variedade real baixa se não se gerar propositalmente mais variantes: a v15b usa 4 espécies de árvore e 1 tufo de mato repetidos, nota 4/10 em variedade na auditoria [E, `ETAPA2_HOMOLOGACAO.md` item 6] |
| **Mapa (composição completa)** | `create_map` + `edit_map` (terreno, grátis) + `place_map_object` (objetos) + filtro cartoon local (Pillow, grátis) | Pipeline completo das rodadas v13→v15b | Fluxo é rápido e **a composição (não a arte individual) é o maior risco**: 2 rodadas inteiras (v13 r1 com 203 gerações, v14 com 0 gerações) foram **reprovadas pelo coordenador só por composição** (trilhas em grade, miolo vazio, árvores "em pomar") antes da v15 (2 gerações) ser aprovada — ou seja, o custo real não está na ferramenta, está nas iterações de direção até acertar a composição [E, `PROJECT_LOG.md` 2026-11-11 ~15:1x, 2026-11-12 ~07:1x e ~11:0x] |

**Limitações gerais do Método B (consolidado):**
1. **Consistência de estilo é alta dentro de uma mesma sessão/pipeline** (mesma ferramenta, mesmos parâmetros), mas **entre fontes diferentes dentro do próprio jogo** (rip DS × PixelLab × procedural) a consistência é baixa — 3 estilos convivem hoje, nota 4/10 (`ETAPA2_HOMOLOGACAO.md` item 11).
2. Depende de saldo de um plano pago (Tier 1, 2000 gerações/mês) — já consumido 1262 de 2000 no ciclo atual, e boa parte desse gasto histórico foi em rodadas reprovadas (composição, não arte individual).
3. Autotile/tileset de transição nem sempre existe para o par de terrenos desejado — gera borda dura.
4. Ferramentas de animação (`animate_character`) têm comportamento documentado de encolhimento entre quadros que precisa de ajuste de pipeline (custom_start_frame) para ser evitado.
5. Ponto forte real: sprite/animação/tileset/mapa saem rápido e já em formato de jogo (ZIP, spritesheet, `.tmj` via exportação), sem trabalho manual de recorte; reaproveitamento de objetos já pagos é gratuito; correção local (`pixelart_workbench`, filtro cartoon em Pillow) é grátis e já usada em produção real (v15b: 0 gerações).

### 1.3 Método C — Híbrido (ChatGPT + PixelLab + editores)

**Composição:** combina os dois acima, usando cada ferramenta onde ela é mais forte.

| Etapa | Onde cada ferramenta entra [H, proposta de fluxo — nunca executado neste projeto] |
|---|---|
| **Sprite (Digimon)** | Base sempre o sprite oficial DS (regra do projeto, nenhum método muda isso) → PixelLab (`create_character` com referência) só para adaptação/variante autorizada → se precisar de concept art ou pose nova antes de ir para o PixelLab, ChatGPT pode gerar referência visual de composição (não o sprite final) → Aseprite para qualquer ajuste fino de pixel que nem o PixelLab nem o oficial resolvem |
| **Sprite (Tamer)** | ChatGPT para explorar conceito/visual do preset (roupa, cor de cabelo) em alta resolução → PixelLab `create_character` com esse concept como `concept_image_url` (mode="pro") ou só como referência descritiva → Aseprite para correção pontual |
| **Animação** | PixelLab para o ciclo-base (`animate_character`/`mirror_animation`, mais barato e mais consistente que animar quadro a quadro no ChatGPT) → Aseprite só para retoque pontual de 1–2 quadros problemáticos, sem regenerar o ciclo inteiro |
| **Tileset de cenário** | PixelLab (`create_topdown_tileset`) para a base autotile → GIMP/Aseprite para pintar à mão as transições que o PixelLab não oferece entre certos pares de terreno (o problema de borda em degrau documentado em B) |
| **Prop de cenário** | PixelLab (`create_map_object`/reaproveitamento) para a maioria → ChatGPT + conversão manual só para um prop muito específico de identidade do Mundo Digital (portal, cristal) que não existe pronto na conta e vale explorar primeiro em concept antes de gastar geração |

**Limitações gerais do Método C:**
1. **Soma as dependências dos dois métodos** (conta ChatGPT do fundador + saldo PixelLab) em vez de eliminar uma delas.
2. Risco de **duas fontes de estilo no mesmo quadro** (já é um risco citado no próprio briefing antigo, §5, mesmo com definição de métodos diferente) — precisa de disciplina extra de unificação de paleta/contorno entre o que vem de cada ferramenta.
3. Mais etapas de decisão por asset ("isso vai pelo ChatGPT ou pelo PixelLab?") aumenta o tempo de produção por asset em relação a usar uma ferramenta só, mesmo que o resultado final seja melhor.
4. Ponto forte real: em tese, combina o controle criativo humano (bom para concept/variedade e para resolver limitações específicas do PixelLab, como as transições de terreno) com a velocidade e a integração nativa do PixelLab (bom para volume e para animação consistente).
5. **Nunca foi testado no projeto** — toda esta seção é proposta de fluxo [H], sem dado real de custo/retrabalho híbrido; só os dois lados isolados (A nunca testado nesta conta; B com histórico real citado em 1.2) têm evidência.

---

## 2. Briefing único dos testes (igual nos 3 métodos)

Mesmo elenco, mesmo cenário, mesmas dimensões de partida — para que a comparação meça a ferramenta, não o brief.

### 2.1 Elenco

| Entidade | Papel no teste | Fonte de identidade obrigatória |
|---|---|---|
| **1 Tamer de referência** | Preset "Coragem" (âncora v13, já existente, 8 direções) ou equivalente — decisão de qual preset é do `game-studio`/fundador, não deste comando | PixelLab v13 (humano original, sem exigência de "igual ao oficial") |
| **Koromon** | Digimon pequeno (baby_ii) | Sprite oficial DW DS (base obrigatória, regra do projeto) |
| **Agumon** | Digimon médio (child) | Sprite oficial DW DS |
| **WarGreymon** | Digimon grande/gigante (ultimate) — escolhido deliberadamente porque no sprite de mapa original ele é idêntico em altura ao próprio Greymon (teto de legibilidade), testando se cada método rompe ou preserva esse teto | Sprite oficial DW DS |

Os três Digimon formam uma única linha evolutiva coerente (Koromon → Agumon → ... → WarGreymon), conforme recomendado em `ESTUDO_ESCALA_DIGIMONS.md` §5.

### 2.2 Cenário

Recorte de **~12×10 tiles** (384×320px, tile 32px) da floresta-piloto especificada em `ESTUDO_REGIOES_E_MAPA_PILOTO.md` Parte 2 — sugestão: a zona da trilha inicial (T) até a clareira de descanso (C), que já cobre corredor estreito, mato raso, 1 clareira e ao menos 1 maciço de árvore, sem precisar do mapa de 40×30 completo. **Decisão exata do recorte (coordenadas) é do `game-design`/`game-art` produtor, não deste comando de planejamento.**

**Atualização pós-ADR-015:** o briefing de teste pode usar referência direta a elementos reconhecíveis de File Island/Adventure — por exemplo, compor o recorte com a lembrança visual da praia dos postes (`wikimon.net/File_Island`, cena do episódio 1) ou um marco à Torre Infinita no horizonte — em vez de só o "tipo" de floresta tropical genérica que `ESTUDO_REGIOES_E_MAPA_PILOTO.md` §7 recomendava antes do ADR-015. É permissão, não obrigação: o recorte pode continuar só com a floresta-piloto genérica se o produtor preferir — a decisão de quanto usar de referência específica fica com quem executar o teste.

### 2.4 Classificação documental (ADR-015) — aplicada ao elenco e ao cenário deste laboratório

Substitui, para esta entrega, a antiga leitura de "referência artística × recriação de local reconhecível × reprodução direta" (`ESTUDO_REGIOES_E_MAPA_PILOTO.md` §7). Cada elemento recebe uma das 3 categorias do ADR-015 **e, sempre**, o registro de fonte/risco (categoria 4):

| Elemento | (1)/(2)/(3) | Classe | (4) Fonte e risco |
|---|---|---|---|
| Koromon, Agumon, WarGreymon | (1) oficial da franquia | Espécies e designs oficiais, sprite-base DW DS (regra do projeto, AGENTS.md §5) | Fonte: Digimon Reference Book oficial (nomes/designs) + rip DW DS (`official-fan-use`, crédito ao ripper). Risco: uso de IP de terceiros sem licença, já registrado no §1.1 do contexto comum; ADR-015 autoriza o uso criativo interno, não a publicação |
| Tamer de referência (preset v13) | (3) original do projeto | Personagem humano original e personalizável (ADR-007 §3, ADR-015 "Regras de design preservadas") | Fonte: criação PixelLab por descrição, sem referência de personagem de anime. Risco: baixo — não é elemento protegido de terceiros |
| Recorte de cenário — floresta-piloto genérica (padrão do brief) | (3) original do projeto, inspirado em (1) | Tipo de bioma (floresta tropical densa) com liberdade de composição | Fonte: `ESTUDO_REGIOES_E_MAPA_PILOTO.md` Parte 2 (layout-brief original do projeto). Risco: baixo |
| Recorte de cenário — com referência direta a File Island/praia dos postes/Torre Infinita (opção habilitada pelo ADR-015) | (2) recriação ou adaptação | Estrutura/local reconhecível da franquia, recriado em pixel art original | Fonte: `wikimon.net/File_Island` (categoria 1, cita o oficial) — ver `ESTUDO_REGIOES_E_MAPA_PILOTO.md` §2 para a descrição já levantada. Risco: uso de elemento protegido reconhecível; ADR-015 autoriza no planejamento/desenvolvimento interno; nenhuma publicação sem decisão específica (ADR-015 "Limites operacionais mantidos") |

### 2.3 Dimensões de partida, paleta e contorno — registradas como VARIÁVEIS do teste, não decisão

Os 2 conflitos visuais abertos relevantes aqui (Endesga-32 × referência v13/v15; escala Tamer/Digimon) **não são resolvidos neste documento** — entram como parâmetros que os 3 métodos devem testar e relatar, não travar.

| Entidade | Altura em px medida/registrada [E] | Fonte | Razão Tamer/tile ou altura/tile (tile=32) |
|---|---|---|---|
| Tamer (PixelLab v13) | ~36px | `ETAPA2_HOMOLOGACAO.md` item 2 | 1,13× |
| Tamer (official-fan-use, TAMER-0009) | 33px útil (canvas 26×33, pivô 13,32) | `DIGIMON_STYLE_GUIDE.md` §2.2 | 1,03× |
| Koromon (Baby II) | 17px (DWDS, sprite de mapa), canvas 28×22 (import atual) | `ESTUDO_ESCALA_DIGIMONS.md` §3; `ETAPA2_HOMOLOGACAO.md` item 2 | 0,53–0,69× |
| Agumon (Rookie/Child) | 26px (DWDS), 30–34px (import DS geral) | `ESTUDO_ESCALA_DIGIMONS.md` §3 | 0,81–1,06× |
| WarGreymon (Ultimate) | 37px (DWDS, igual ao Greymon Champion da linha); import atual com `mapScale 2` ≈ 72px | `ESTUDO_ESCALA_DIGIMONS.md` §3; `ETAPA2_HOMOLOGACAO.md` item 2 | 1,16× (DWDS) ou 2,25× (import atual) — **as duas convenções já discordam entre si dentro do próprio jogo** |

**Instrução para quem executar o teste:** cada método deve registrar a altura final em px de Tamer, Koromon, Agumon e WarGreymon que o próprio método produziu, e comparar com a tabela acima — não forçar um valor específico antes do teste. O objetivo da rodada é ver que escala cada ferramenta entrega "naturalmente" e que esforço custa fazê-la seguir uma hierarquia Baby < Rookie/Child < Tamer ≤ Champion/Ultimate.

**Paleta e contorno de partida (ponto de partida, não trava):**
- Paleta do cenário: testar contra as **duas** referências em conflito — Endesga-32 (`DIGIMON_STYLE_GUIDE.md` §3.2) **e** a referência v13/v15 aprovada (0% Endesga-32, `ETAPA2_HOMOLOGACAO.md` §E). Cada método relata a % de pixels do cenário dentro de cada paleta, sem escolher uma como meta.
- Paleta dos Digimon/Tamer: paleta própria do arquivo oficial (Digimon) + paleta que o método escolher para o Tamer (sem travar em Endesga-32, regra já vigente no Style Bible §3).
- Contorno: preservar o contorno nativo de cada sprite oficial de Digimon (regra dura do Style Bible §1 regra 1 e §4, falha crítica se violada); contorno do Tamer e do cenário é livre por método, a relatar.

### 2.5 Extração de frame/imagem do anime — liberada pelo fundador (ADR-015), opção legítima dentro dos 3 métodos

**Atualização do fundador (2026-11-13, posterior ao adendo anterior):** a extração de frames e imagens do anime para uso interno está **liberada** ("pode extrair e usar se achar") — confirma e resolve a contradição que a versão anterior deste documento havia sinalizado entre o texto do próprio ADR-015/contexto v1.2 (que já diziam "decidido"/"liberada") e a instrução conservadora do primeiro adendo ("ponto aberto, nenhum método usa"). O ponto aberto fica **desconsiderado**: extração é opção legítima nos 3 métodos (A/B/C), quando quem produzir julgar que agrega ao resultado — não é obrigatória nem preferida sobre as outras fontes (sprite oficial DS para Digimon continua a base, AGENTS.md §5).

**Condições de rastreabilidade (ADR-015, não são bloqueio, mas são obrigatórias quando a extração for usada em qualquer método):**

| Condição | O que registrar |
|---|---|
| Classificação documental | (1) oficial, se o frame for usado como veio, ou (2) recriação/adaptação, se for redesenhado/tratado — nunca (3) original |
| Fonte | Obra, episódio e minuto (quando houver) + URL de onde foi extraído |
| Camada de licença | `official-fan-use` (se vira base de asset tratado) ou `reference` (se for só consulta visual, sem entrar no arquivo final) — sempre com crédito |
| Qualidade mínima | Nota ≥ 8/10 na régua da Etapa 6 **e** coerência com a identidade visual escolhida — **um frame cru extraído do anime não é sprite de jogo**: precisa do mesmo tratamento de pixel art (limpeza de contorno, redução de cor, ajuste de escala) que qualquer outro asset, nos 3 métodos |
| Fonte legítima | Só extrair de fonte a que o estúdio tenha acesso legítimo; nunca contornar DRM, login ou bloqueio de acesso (regra dura do ADR-015, sem exceção) |
| Limite público | Nada disso é publicado, distribuído ou monetizado sem decisão específica do fundador (ADR-015 "Limites operacionais mantidos", já vale para todo o projeto) |

**Onde isso entra em cada método (atualiza §1.1/1.2/1.3):**
- **Método A:** um frame extraído pode ser a referência de composição que o ChatGPT reinterpreta, ou a base que Aseprite/GIMP tratam à mão (pixelização, limpeza de contorno) — o trabalho manual de "transformar frame em sprite" descrito em §1.1 é exatamente o tratamento que a condição de qualidade mínima acima exige.
- **Método B:** um frame extraído pode entrar como `reference_image_url`/`style_image` em `create_character`/`create_map_object`/`create_image_pro` (todos já aceitam referência de imagem), deixando o PixelLab fazer a conversão para pixel art — ainda precisa da classificação e do crédito.
- **Método C:** combina os dois — ex.: extrair um frame de um local reconhecível (Torre Infinita, praia dos postes), usar como `concept_image_url`/referência no PixelLab, e corrigir à mão o que sobrar.

**Não executado nesta entrega:** nenhuma extração foi feita (seria produção de asset, fora do escopo "só planejamento" deste comando); esta seção só registra a opção e suas condições para quando a rodada real do laboratório for autorizada.

---

## 3. Matriz de comparação — critérios e COMO medir cada um

Reaproveita e simplifica a matriz V1–V12 de `studio-alignment/07_BRIEFING_ETAPA6_VISUAL.md` §6, adaptada para os 3 asset types do brief (sprite/animação/tileset/prop) em vez de só mapa.

| Critério | O que é | Como medir (procedimento objetivo) | Quem mede |
|---|---|---|---|
| **Qualidade** | Nota da régua de qualidade visual da Etapa 6 (`RUBRICA_QUALIDADE_VISUAL_V1.md`, entregável do `game-qa`, ainda não escrito nesta sequência) | Aplicar a mesma rubrica (pesos: fidelidade/beleza Digimon 35%, mapas/exploração 35%, animação/imersão 15%, escala/consistência 10%, UI 5% — herdado de `COMANDO_ETAPA6_C1.md` §7) a cada asset de cada método, em sessão separada da que produziu, com falhas críticas reprovando sozinhas | `game-qa`, nunca o produtor |
| **Consistência entre quadros** | Para animação: o sprite muda de tamanho/cor/pose fora da intenção entre quadros do mesmo ciclo | Medir altura em px (bounding box) de cada quadro do ciclo walk/idle; variação aceitável ±5% da âncora (critério já usado em produção real, `REANIM_REPORT.md`); contar cores fora da paleta travada por quadro | `game-qa` ou script determinístico (ex.: o mesmo tipo de script Pillow já usado em `scale-proof-v3-fix/`) |
| **Consistência entre assets** | Para sprite/tileset/prop: os assets do mesmo método/entrega usam a mesma paleta, o mesmo tipo de contorno, a mesma escala relativa | Contar "famílias" de contorno/paleta visíveis quando todos os assets do método aparecem juntos numa mesma cena de teste (critério V2 do briefing 07) | `game-art` diretor, em sessão separada da produção |
| **Tempo** | Tempo humano/agente gasto por asset, do início ao "aprovado" | Cronometrar (ou registrar os timestamps de início/fim da sessão produtora) por asset; separar tempo de 1ª tentativa × tempo de retrabalho até aprovação | Produtor registra; `game-studio` consolida |
| **Retrabalho** | Quantas rodadas/iterações até um asset passar na régua (≥8, 0 falha crítica) | Contar nº de rodadas reprovadas antes da aprovada, por asset (ex.: Digi Forest precisou de v13→v14→v15 = 3 rodadas de composição até aprovar; o Guilmon 64px nunca aprovou em 3 rodadas) | `game-qa` registra a cada rodada; `game-studio` soma |
| **Custo por asset aprovado** | Custo total (gerações PixelLab + horas humanas/agente, convertidas numa unidade comum ou relatadas separadas) dividido pelo nº de assets que **chegaram a aprovado**, não pelo nº de assets tentados | `custo_total_do_lote (gerações + horas) ÷ nº_de_assets_aprovados_no_lote`. Assets reprovados e descartados contam no custo total, não no denominador — pune retrabalho corretamente | `game-studio`, a partir dos registros de `game-art` e `game-qa` |
| **Integração técnica** | O asset final chega num formato que o `game-dev` consegue importar sem trabalho manual extra (dimensões múltiplas de 4px, transparência correta, nº de direções, formato de exportação) | Checklist binária por asset: dimensão ok (sim/não), transparência ok (sim/não), nº de direções conforme pedido (sim/não), formato de exportação aceito pelo pipeline atual (`.tmj`/ZIP/spritesheet/PNG) (sim/não) — ver seção 6 (placeholder do `game-dev`) | `game-dev`, quando a seção 6 for preenchida |

**Observação sobre custo comum:** gerações PixelLab (Método B/C) e horas humanas (Método A/C) são unidades diferentes. Este documento **não inventa uma taxa de conversão** (ex.: "1 geração = X minutos") sem dado real — isso fica para a seção 4, registrado separado por tipo, nunca somado artificialmente numa única "nota de custo".

---

## 4. Estimativa de custo

### 4.1 PixelLab — gerações por asset, com base no histórico real do projeto

| Tipo de asset | Caso real | Gerações gastas | Resultado (aprovado?) | Fonte |
|---|---|---|---|---|
| Sprite de criatura (adaptação de rip oficial, 64px) | Guilmon 64px, 3 rodadas | 5 + 5,2 + 8 = **18,2 gerações**, só para 1 sprite, 1 pose | **Nunca aprovado** nas 3 rodadas (QA 4–6/10, consistentemente); ficou sem uso em produção | `PROJECT_LOG.md` 2026-11-10 00:2x–02:1x |
| Sprite de criatura (à mão, sem gerar) | Gabumon hand64 | **0 gerações**, 25 min de trabalho direto | Reprovado na leitura do coordenador ("identidade fraca") | `PROJECT_LOG.md` 2026-11-10 ~07:2x |
| Animação (walk+idle, 8 direções, 1 personagem) | Tamer v13, médio por preset que precisava de produção (6 de 12 presets) | **43 gerações ÷ 6 presets ≈ 7,2 gerações/preset** (mais 44 `mirror_animation` grátis) | Aprovado pelo fundador | `TAMERS_V13.md` |
| Tileset de terreno (par de terrenos, modo standard) | Vários pares usados nas rodadas v13–v15 | **1 geração/par** (`create_topdown_tileset(mode="standard")`) | Variável — a arte do tileset isolado é barata; o problema é composição, não o tileset em si | ferramenta (preço fixo do tool) |
| Mapa completo (recorte comparável, 48×36, composição + reaproveitamento) | v13 r1 (reprovado) → v15 (aprovado) | v13 r1: **203 gerações**, reprovado; v14: **0 gerações**, reprovado; v15: **2 gerações**, aprovado; v15b: **0 gerações** (ajuste do coordenador, não do produtor) | Mostra que o **custo em gerações não prediz aprovação** — a rodada aprovada (v15) custou menos que a reprovada (v13 r1) | `PROJECT_LOG.md` 2026-11-11 ~15:1x, 2026-11-12 ~07:1x, ~11:0x, ~11:5x |
| UI (hub completo, painéis, HUD) | ui-v13 r1 → r2 | r1: **~147 gerações**; r2: **0 gerações** (composição local sobre o material da r1) | r1 teve problemas (texto ilegível, sem acentos); r2 melhorou sem gastar nada | `PROJECT_LOG.md` 2026-11-11 ~15:0x, ~18:2x |

**Leitura consolidada:** o histórico real do projeto mostra que **a maior parte do gasto em gerações no PixelLab não vem da produção "normal" de um asset, vem do retrabalho por decisão de composição/direção não travada antes de produzir** (v13 r1 sozinho gastou mais que todas as rodadas seguintes de mapa somadas). Isso é uma evidência direta a favor do que o Comando C1 já pede: travar o briefing (feito na seção 2 deste documento) antes de qualquer produção.

**Projeção para a rodada do laboratório (1 Tamer + 3 Digimon + 1 cenário 12×10, Método B):**
- Sprite/animação de 1 Tamer (se precisar regenerar do zero, não reaproveitar v13): **[H]** ~15–25 gerações (`create_character` v3 por tamanho 16–128px, `search_help(tool="create_character")` lista 2–7 gerações pela imagem só na criação por texto; walk+idle 8 direções soma o custo de animação por cima, análogo ao caso Tamer v13 ≈ 7 gerações/preset já com direção pronta).
- 3 Digimon, se forem **reaproveitados do rip oficial sem gerar** (regra do projeto): **0 gerações** — único jeito de manter o teto baixo e seguir a regra "iguais aos oficiais" ao mesmo tempo.
- 3 Digimon, se qualquer adaptação for tentada via PixelLab (não recomendado pela regra, mas hipótese de teste): **[H]** repetir o padrão Guilmon 64px custaria ~18 gerações **por Digimon**, sem garantia de aprovação (histórico: 0 de 3 rodadas aprovou).
- Cenário 12×10: **[H]** bem menor que o mapa completo 48×36 (área ~7% do mapa de produção) — por analogia de custo/área com a v15 (2 gerações para 48×36 reaproveitando quase tudo), um recorte pequeno com composição já definida (seção 2.2) deveria ficar **≤ 10 gerações**, mas **a composição (não a geração) é o fator decisivo de aprovação**, como mostrado acima.
- **Teto total estimado [H] para a rodada completa pelo Método B, respeitando a regra "iguais aos oficiais": ~25–40 gerações**, bem dentro do teto de 150 que o fundador já havia reservado no briefing 07 (P4) para esta fase.

### 4.2 ChatGPT — sem acesso, custo depende do fundador

- **Este ambiente não tem credencial nem acesso de API para ChatGPT.** Nenhuma chamada foi feita, nenhuma é possível nesta execução.
- O Método A depende de (a) a conta/assinatura pessoal do fundador, ou (b) uma autorização e credencial específica fornecida pelo estúdio — nenhuma das duas está disponível ao `game-art` hoje.
- O custo de uso (preço por geração de imagem, limite de mensagens no plano, etc.) varia pelo plano do fundador e **não pode ser estimado aqui sem inventar um número** — registrar como decisão/dado pendente do fundador, não como lacuna de pesquisa.
- Custo de **tempo humano/agente de conversão** (pixelização manual, limpeza de contorno, montagem de spritesheet) é a parte que mais pesa no Método A e está estimada em §4.3.

### 4.3 Tempo humano/agente por asset — estimativa qualitativa [H]

Sem execução real do Método A nem do Método C neste projeto, os números abaixo são estimativa de domínio (prática comum de pixel art manual), não medição:

| Asset | Método A (manual) [H] | Método B (PixelLab) [E, histórico] | Método C (híbrido) [H] |
|---|---|---|---|
| 1 sprite estático (1 direção) | 30–90 min (gerar + pixelizar + limpar contorno + exportar) | ~2–5 min de chamada + fila de job (minutos), **quando aprova de 1ª** — histórico real mostra 3 rodadas no caso difícil (Guilmon 64px), então o tempo real pode multiplicar | 20–60 min (um pouco menos que A, porque parte do trabalho de limpeza é poupado pelo PixelLab) |
| 1 ciclo de animação (8 quadros, 1 direção) | 2–6 h (desenhar/gerar e alinhar cada quadro manualmente para não "derivar") | ~5–10 min de chamada; histórico real (Tamer v13) mostra robustez quando o pipeline já está calibrado (custom_start_frame) | 1–3 h |
| 1 tileset (1 par de terrenos) | 3–8 h (recortar, desenhar cada variante de borda à mão) | ~1–3 min de chamada (`create_topdown_tileset`, 1 geração) | 1–3 h (base pelo PixelLab, transições à mão) |
| 1 prop de cenário | 20–60 min | ~2–5 min, **quando reaproveitado da conta, 0 min de geração nova** | 15–45 min |
| Composição de cenário 12×10 tiles | **Não estimado** — depende inteiramente de habilidade humana de composição, maior variável de todo o comparativo | Histórico real: de 0 a várias horas-sessão por rodada de composição reprovada (v13 r1, v14) até acertar (v15) — **o tempo de composição, não de geração, domina o custo real em qualquer método** | idem a B, com tempo extra de decidir o que vai por qual ferramenta |

**Conclusão de §4:** nos três métodos, **o maior custo real não é gerar o asset individual — é a iteração de composição/direção até aprovar**. Qualquer estimativa de custo que ignore retrabalho de composição subestima o custo real do método, inclusive do PixelLab.

---

## 5. O que revisar no Style Bible — propostas comparativas (sem decidir)

Direção pedida pelo fundador: "GBA Plus + identidade própria + imersão", **sem limitar automaticamente à Endesga-32**. O Style Bible atual (`DIGIMON_STYLE_GUIDE.md`) trava a paleta de cenário em Endesga-32 como regra dura (§3.2, §8.3 falha crítica) e a v13/v15 aprovada tem 0% de pixels nessa paleta (`ETAPA2_HOMOLOGACAO.md` §E) — a tensão já está documentada e é um dos 5 conflitos abertos.

| Item do Style Bible | Situação atual | Proposta 1 — manter a regra dura | Proposta 2 — rebaixar a regra | Proposta 3 — paleta ampliada por bioma |
|---|---|---|---|---|
| **Paleta do cenário (§3.2, §8.3)** | Só Endesga-32 + ramps aprovados; fora disso é falha crítica | Continua travado em Endesga-32; qualquer arte nova (nos 3 métodos) precisa ser corrigida para caber nela — custo de conversão em todo asset de cenário | Endesga-32 vira **recomendação**, não falha crítica; a paleta real de cada bioma (ex.: a da v13/v15, saturada, estilo Pokémon-cartoon) vira a referência de fato, desde que internamente consistente | Endesga-32 continua como paleta-base, mas cada bioma ganha um ramp próprio adicional (ainda documentado e travado, só que maior que 32 cores) — meio-termo entre as duas acima |
| **Escala do tile/sprite (§2.2–2.4)** | Tile 32 fixo, aprovado; sprite oficial nativo (~30–42px) compete visualmente com o tile; recomendação do próprio Style Bible era tile 16, nunca executada | Mantém tile 32 + sprite nativo, resolvendo só por câmera mais larga (alternativa já registrada em `ART_STYLE_GUIDE.md` §9b, custo baixo) | Mantém tile 32, mas Digimon/Tamer ganham escala por estágio (multiplicador inteiro ×1/×2 por estágio, como a hipótese E2 do briefing 07 §4) — rompe o "teto de legibilidade" que hoje faz WarGreymon = Greymon em altura | Migra para tile 16 (recomendação original do Style Bible), redesenhando a tileset do zero — maior custo, mas resolve a proporção "GBA" de forma nativa, sem downscale |
| **Contorno (§4)** | Contorno do sprite oficial preservado como veio; cenário sem contorno rígido (separação por cor/sombra) | Mantém a regra — nenhum stroke genérico sobre Digimon oficial | Permite um contorno leve e unificado sobre **todo** o elenco (Digimon + Tamer + props), desde que aplicado sem blur/AA — ganha consistência visual entre as 3 fontes hoje convivendo, mas é uma intervenção sobre o sprite oficial que o Style Bible hoje proíbe (§1 regra 1) | Mantém a regra para Digimon; aplica um contorno próprio só a Tamer/UI/props (que já são arte nova, sem restrição de "oficial") |
| **Identidade imersiva (§7, novo item do pedido do fundador)** | Style Bible já lista ruínas/cristais/portais como elementos de "Mundo Digital", mas nenhum asset de portal existe ainda; não há seção sobre densidade/profundidade de mapa | Adicionar ao Style Bible (não decidir aqui) critérios mensuráveis de imersão reaproveitando V6–V9 do briefing 07 §6 (Y-sort, sombra, desnível, pontos focais, % de área vazia) — já existem como métrica, faltam como regra formal de aprovação de asset de cenário | — | — |

**Leitura central:** nenhuma das propostas acima é recomendada por este documento — são alternativas comparáveis, cada uma com custo e risco próprios, para o fundador e para a sessão de homologação da Etapa 6 decidirem com a evidência da rodada de laboratório (seção 2) em mãos.

---

## 6. Requisitos técnicos de exportação e integração (game-dev)

- **Autor:** game-dev (subagente, 4º da sequência) · **Data:** 2026-11-13 · **Escopo:** só leitura e planejamento. Nenhum código, sprite, mapa, Database ou configuração foi alterado. Nenhum commit, nenhuma geração no PixelLab.
- **Código lido:** worktree `workspaces/game-dev/qo`, branch `quality-overhaul`, HEAD `3289e32`, `git status` limpo no momento da leitura. Abaixo, `world/` = `projects/prototypes/GS-003/prototype/world/` dentro do worktree, e `GA` = `qo/assets/GAME-ASSETS`. É para lá que o alias `@game-assets` resolve no worktree (`world/vite.config.ts:6`). A divergência entre o `GA` do `qo` e o do master (Etapa 2, T6) continua aberta e **não** foi tocada.
- **Legenda:** **[E]** verificado no código ou no arquivo (caminho:linha) em 2026-11-13 · **[H]** hipótese ou estimativa · **[NV]** não verificado.

### 6.1 Como o pipeline carrega sprites, tiles e mapas hoje

| Tipo | Formato no disco | Onde fica | Loader ou conversor | Evidência |
|---|---|---|---|---|
| **Digimon** | `creature.json` (manifesto v2) + `spritesheets/<ID>.atlas.json` (JSON Hash, com `pivotPx` por quadro) + `spritesheets/<ID>.png` (RGBA). Alternativa: uma PNG por quadro em `sprites/<atlasKey>.png`, sem folha | `GA/01-creatures/CREATURE-*/` | `loadCreatureCatalog()`, via `import.meta.glob` *eager* (resolvido no build; não há `fetch` de JSON em runtime) | [E] `world/src/assets/creatures.ts:126-137`; contrato do manifesto `:29-66`; PNG por quadro `:109-120` |
| **Digimon oficial DS** | O mesmo formato, gerado por script a partir da folha do Spriters Resource: recorte, chroma key e translação inteira, **sem reamostrar**. Canvas único 40×36, pé fixo em y=33, pivô (20,34) | `GA/01-creatures/CREATURE-0018-guilmon-official`, `-0019-gabumon-official`; folhas em `GA/10-source-files/dwds-sheets/` | `scripts/build-official-mons.mjs`, para Guilmon e Gabumon (0 gerações). O padrão de URL é `?mon=official` | [E] `world/scripts/build-official-mons.mjs:1-30`; `world/src/main.ts:145` |
| **Tamer v13 (PixelLab)** | `tamer.json` + `walk/<dir>/frame_NNN.png` e `idle/<dir>/frame_NNN.png`, um PNG por quadro, 36×36, pivô medido no pé da rotação sul | `projects/prototypes/GS-003/art/tamers-v13/game/TAMER-*/` | Importador `scripts/import-tamers-v13.mjs` (ZIP do `export_asset`) → `loadPresetsV13()` via glob `@gs003-art` | [E] `world/scripts/import-tamers-v13.mjs:2-6,50-64`; `world/src/assets/tamer-presets.ts:223-227`; `tamer.json` do TAMER-0003: frame 36×36, pivô (18,34) |
| **Tiles e props da biblioteca** | PNG solto, cuja chave é o nome do arquivo. Tile 32×32; prop de qualquer tamanho, com o pé no centro da base. Opcional: `tileset.json` com `rect` e `pivot` para recortar uma folha | `GA/03-environments/**` | `loadTileSources()` / `buildTileSources()` | [E] `world/src/assets/tiles.ts:1-5,35-57,75-76` |
| **Pacotes da Map Factory / import do PixelLab** | PNGs por nome de arquivo dentro do pacote; `terrain.png` inteiro recortado em grade 32 px (`grid`); pivôs por arquivo (`pivots`); props animados (`animProps`); água por deslocamento (`waterAnim`) | `projects/prototypes/GS-003/art/map-factory/<pack>/` | `loadMapFactoryPack()` + `extraPackTiles()` | [E] `world/src/assets/tiles.ts:101-115`; `world/src/assets/scene-tiles.ts:22-66,123-149` |
| **Mapa** | Subconjunto de Tiled JSON: `<id>.tmj.json` (camadas de tile com 1 chave por célula + `objectgroup` com props, pé e `solid`, inícios e portal) + `<id>.aliases.json` (pacote de cena) + `src/data/encounters/<id>.json` | `world/src/data/maps/`, `world/src/data/encounters/` | Import estático em `world/src/world/regions.ts` (registro `MAPS`, `DEFAULT_MAP = "digi-forest-v15b"`) e `sim/map.ts` (só a grade de colisão, spawns e inícios). Validação: `npm run map:validate` | [E] `world/src/sim/map.ts:1-55`; `world/src/world/regions.ts:5-6,66-67,98`; `world/src/sim/encounters/table.ts:5,12`; `world/scripts/validate-map.mjs:1-7` |
| **Mapa do PixelLab** | Export `pixellab` do Map Workshop (`map.json` + `objects/manifest.json` + PNGs + tilesets), a **grade de terreno em ASCII** salva à mão em `source/terrain_grid.txt` e os ZIPs das animações (`export_asset`) | `art/map-factory/digi-forest-v15b/source/` | `scripts/import-pixellab-map.mjs` → gera `.tmj` + `.aliases` + tabela de encontros + PNGs com o **filtro cartoon assado** (+40% de saturação, +15% de contraste) | [E] `world/scripts/import-pixellab-map.mjs:1-19,64-99` |
| **Render** | Canvas 2D próprio. Coordenadas inteiras, `imageSmoothingEnabled = false`. Escala de tela **inteira em pixels físicos** (`?dpr=1`, padrão) e `image-rendering: pixelated` no CSS. Y-sort por pé | — | `render/view.ts`, `render/scale.ts`, `main.ts` | [E] `world/src/render/view.ts:3,464,514`; `world/src/render/scale.ts:8,23-33`; `world/src/main.ts:100`; `world/src/style.css:31` |
| **Direção e espelho** | O renderer pede `Dir8`. Direção ausente cai no espelho declarado (`mirrored`), na mais próxima (`fallback: "nearest"`) ou no eixo de 4 direções | — | `resolveFacing()` / `nearestFacing()` | [E] `world/src/render/anim.ts:134-183` |

**Medidas dos 3 Digimon do elenco, como estão hoje no `qo`** [E, `GA/01-creatures/<ID>/creature.json` e `.atlas.json`]:

| Digimon | Quadro | Pivô | Altura de conteúdo | `mapScale` | Direções desenhadas (resto por espelho) | Quadros de walk por direção | Atlas |
|---|---|---|---|---|---|---|---|
| Koromon `CREATURE-0005` | 28×22 | (14,21) | 17 | 1 | S, N, W (+E espelho) | S4 · N4 · W4, 150 ms | folha 264×127, 16 quadros |
| Agumon `CREATURE-0006` | 30×30 | (15,29) | 27 | 1 | S, N, W (+E) | S**2** · N4 · W4, 150 ms | 15 quadros |
| WarGreymon `CREATURE-0016` | 36×46 | (18,45) | 36 | **2** (alvo 72) | N, W, S (+E) | N4 · W4 · S**1** | folha 337×725, 14 quadros |

### 6.2 Divergências com outras seções e documentos (registradas aqui; as seções originais não foram editadas)

1. **Escala do WarGreymon (§2.3 deste documento; `ESTUDO_ESCALA_DIGIMONS.md` §4 e §6):** a afirmação "import atual com `mapScale 2` ≈ 72 px" vale só com `?dpr=0`. Na URL padrão (`?dpr=1`, padrão desde 11/11) o renderer **ignora o `mapScale`** (`unifiedScale`) e desenha o WarGreymon a 1×: quadro 36×46, conteúdo de ~36 px. [E] `world/src/render/view.ts:58-62,1400-1404`; `world/src/main.ts:100,347`. A tabela "duas convenções discordam" continua certa, mas o que o jogador vê hoje é a convenção DWDS (1×), não a de 72 px.
2. **"Saem já em formato de jogo (ZIP, spritesheet, `.tmj` via exportação)" (§1.2):** o PixelLab **não** exporta `.tmj`. O export `pixellab` traz `map.json` e, quando o mapa nunca foi salvo no Map Workshop, vem **sem a grade nem o render do terreno**. A conversão para `.tmj` é feita pelo `import-pixellab-map.mjs`, que hoje é **específico da v15b** (ver 6.6). [E] `world/scripts/import-pixellab-map.mjs:2-5,35-37,105,108,198`.
3. **"Dimensões múltiplas de 4 px" como critério de integração (§3, linha "Integração técnica"):** o motor **não exige** múltiplo de 4. Múltiplo de 4 é restrição de entrada de várias ferramentas do PixelLab. O motor exige pixels inteiros, pivô no pé, tile exatamente 32 e quadros de tamanho constante dentro da animação (ver 6.2.1). A checklist da 6.4 substitui esse item.
4. **8 direções do Tamer:** os 12 presets v13 têm 8 direções no PixelLab, mas o runtime só monta **4** (S, N, W, E). As diagonais não são usadas. [E] `world/src/assets/tamer-presets.ts:8-9,172-183`. Pedir 8 direções de Tamer em qualquer método hoje custa sem retorno no jogo, a não ser que se mude o código (6.6).
5. **`DIAGNOSTICO_TECNICO_1.0.md` §I.2** ("os mapas do PixelLab não entram no jogo hoje") está desatualizado: o commit `69b9487` integrou a v15b como mapa padrão. O diagnóstico é de 12/11; o commit é posterior. [E] `git log` do `qo`; `world/src/world/regions.ts:98`.

#### 6.2.1 Regras que o motor impõe (valem para os 3 métodos)

- **R1 — pixel inteiro, sem reamostragem fracionária.** A escala de tela é um inteiro de pixels físicos; o motor nunca escala sprites por fator não inteiro. Um asset que já chegue reamostrado (com AA ou meia-tinta) é desenhado como veio: o motor não "conserta". [E] `world/src/render/scale.ts:23-33`; `world/src/render/view.ts:3`.
- **R2 — densidade de pixel única.** Com `?dpr=1` todas as criaturas e Tamers ficam na mesma densidade (sem ×2 isolado). Um asset desenhado em outra densidade (ex.: um "pixel" de 2×2 px reais) quebra a regra visualmente, mesmo com o tamanho certo. [E] `world/src/render/view.ts:58-62`.
- **R3 — pivô no pé.** Pivô = centro da linha opaca mais baixa (pés), em px do quadro; pode ser por quadro (`pivotPx`). Y-sort e sombra dependem dele. [E] `world/src/assets/creatures.ts:69,164-166`; `world/scripts/import-tamers-v13.mjs:50-62`.
- **R4 — quadro de tamanho constante por animação.** O fallback por PNG solto assume o quadro do manifesto (`frameW` × `frameH`) com origem em (0,0). [E] `world/src/assets/creatures.ts:117-119`.
- **R5 — tile 32.** `TS = 32` está fixo no importador PixelLab, e a biblioteca documenta tiles de 32×32. [E] `world/scripts/import-pixellab-map.mjs:41`; `world/src/assets/tiles.ts:3`.
- **R6 — transparência real.** O motor não faz chroma key em runtime: fundo tem de ser alfa 0. O chroma key existe só nos scripts de build. [E] `world/scripts/build-official-mons.mjs:5-7`.

### 6.3 Requisitos objetivos por tipo de asset (A, B e C)

Os requisitos são os mesmos para os três métodos: o motor não sabe de onde veio o PNG. A diferença está em **quanto trabalho** cada método precisa para chegar lá (6.4 e 6.5).

#### 6.3.1 Personagem: Digimon e Tamer

| Requisito | Valor exigido | Fonte |
|---|---|---|
| Tamanho do quadro | Canvas fixo por personagem, dentro da faixa já usada: Digimon de 28×22 a 40×36 e WarGreymon 36×46; Tamer 36×36. Altura de conteúdo **depende da decisão de escala (conflito aberto C2), que esta seção não resolve**. Para o laboratório, cada método entrega no tamanho que produzir e registra a altura de conteúdo (como pede a §2.3) | [E] 6.1; decisão de escala pendente (fundador) |
| Múltiplo de px | Inteiro. **Sem exigência de múltiplo de 4 no motor**. Se o asset vier do PixelLab, o canvas será múltiplo de 4 por regra da ferramenta, o que é compatível | [E] R1, R4 |
| Densidade de pixel | 1 pixel de arte = 1 pixel do arquivo (escala 1:1). Proibido entregar a arte ampliada (ex.: 128×128 representando 32×32) | [E] R2 |
| Direções | **Digimon:** mínimo S, N, W desenhadas + E por espelho (`mirrored`), como os rips DS; 8 direções são aceitas (`Dir8`), mas não obrigatórias. **Tamer:** 4 (S, N, W, E) no runtime atual; as diagonais só servem após mudança de código | [E] `anim.ts:134-183`; `tamer-presets.ts:172` |
| Quadros por animação | Mínimo jogável: `idle` ≥ 1 (Tamer v13 usa 4, respiração); `walk` ≥ 2 por direção desenhada, **ideal 4** (f0-f1-f0-f2, como o build oficial); `attack` ≥ 3 e `hurt` ≥ 1 numa direção. Duração 110–150 ms. Estados de combate mapeados em `combatStates` (IDLE, WALK, FOLLOW, ENGAGE, ATTACK, HURT, DEFEAT, RETURN — ADR-009) | [E] `creature.json` dos 3 Digimon; `import-tamers-v13.mjs:64`; `build-official-mons.mjs:10-11` |
| Pivô e âncora | Pivô no pé (R3), estável entre quadros: a variação do pé ≤ 1 px dentro de um ciclo. Âncoras recomendadas: `head`, `hit`, `shadow` (os 3 Digimon do elenco já têm). Variação de altura ≤ ±5% entre quadros (critério L4 da §7) | [E] manifestos; §7 L4 |
| Transparência | PNG RGBA, fundo alfa 0, **sem halo** (nenhum pixel semitransparente na borda além do que a arte pede); nenhuma cor de chroma residual | [E] R6 |
| Layout da folha | Aceitos dois formatos: **(a)** folha + `atlas.json` JSON Hash (`frame`, `pivotPx`) — o preferido; **(b)** um PNG por quadro com nome = `atlasKey` (`<ID>_<anim>_<dir>_NN.png`). A folha do PixelLab (`/spritesheet`: ZIP com PNG + JSON de layout) **não** é lida direto: precisa de conversão para (a) ou (b) | [E] `creatures.ts:68-70,91-123` |
| Metadados | `creature.json` com `id` `CREATURE-NNNN` (ids GS-003 preservados, ADR-014), `dimensions`, `pivot`, `directions`, `animations`, `combatStates`, `anatomy`, `schemaVersion: 2`; `license.json` com `layer` (`official-fan-use`, `reference` ou próprio), fonte e crédito (ADR-009/015) | [E] `GA/01-creatures/CREATURE-0016/license.json` |

#### 6.3.2 Tiles

| Requisito | Valor |
|---|---|
| Tamanho | 32×32, sem exceção (R5). Para um tileset de transição, o formato Wang de canto (16 tiles; 25 em tileset alto) do `create_topdown_tileset` é o único que o importador atual sabe montar (grade dupla, borda na aresta da célula) [E] `import-pixellab-map.mjs:110-128` |
| Formato | PNG RGBA. Tile de chão opaco (sem buraco de alfa). Folha + `tileset.json` com `rect`, ou PNG por tile |
| Repetição | Tile sem costura nas 4 bordas (o chão é repetido célula a célula) |
| Filtro | Se o asset vai ao lado do terreno da v15b, precisa do **mesmo** filtro cartoon assado ou da decisão de não usar filtro em nada (ver 6.7) |

#### 6.3.3 Props

| Requisito | Valor |
|---|---|
| Tamanho | Livre, inteiro; altura de 1 a 4 tiles para árvores. Canvas justo com, no máximo, ~2 px de margem (margem grande desloca o pé e desperdiça textura) |
| Pivô | Pé no centro da base (padrão) ou `pivot` explícito por arquivo [E] `tiles.ts:3-5`; `scene-tiles.ts:47-48` |
| Colisão | `solid` por prop, que bloqueia a célula do pé; props não sólidos (mato, flor, cogumelo) declarados como tais [E] `import-pixellab-map.mjs:139,188` |
| Animação | Quadros do mesmo tamanho, nomeados `<prop>_fNN.png`, com `frameMs` (cachoeira 110 ms, demais 140 ms) [E] `import-pixellab-map.mjs:57-64,167` |
| Árvore com copa | Opcional: duas peças `<chave>_base` (tronco, Y-sort normal) + `<chave>_top` (copa, que fica translúcida sobre o Tamer) [E] `scene-tiles.ts:84-86` |

#### 6.3.4 Mapa

| Caminho | O que exige | Situação hoje |
|---|---|---|
| **PixelLab Map Workshop → export `pixellab`** | 1) salvar o mapa no Map Workshop (senão o export vem sem terreno); 2) `get_map` em ASCII salvo como `terrain_grid.txt`; 3) os JSON de metadados de **cada** tileset Wang usado; 4) ZIP de cada objeto animado; 5) rodar o importador. Saída: `.tmj` + `.aliases` + encontros + PNGs com filtro assado | [E] Funciona **só para a v15b**: `MAP_ID`, prefixo, nome do tileset, linha da ponte e "2 terrenos (água × grama)" estão fixos no script (`import-pixellab-map.mjs:35,37,105,108,198`). Um mapa novo (o piloto 40×30, com rio, ponte, cachoeira, clareiras) precisa do importador generalizado (6.6, item M1) |
| **Montagem manual (Tiled ou Map Factory)** | `.tmj` com `tilewidth/tileheight = 32`, tiles com propriedade `key` (e `solid` quando bloqueia), `objectgroup` com `prop`, `start` e `portal`, + `.aliases.json` apontando o pacote; registro em `regions.ts` e na tabela de encontros | [E] Formato documentado em `sim/map.ts:1-55` e validado por `map:validate` (`scripts/map-factory/validate.mjs`). Caminho já usado nos mapas v8–v12; não depende do PixelLab |
| **Imagem inteira de mapa (Método A, cenário pintado de uma vez)** | Pode entrar como `terrain.png` recortado em grade 32 (`extraPacks[].grid`), mas aí **toda colisão, mato e água têm de ser marcados à mão** no `.tmj`, e os props pintados na imagem não terão Y-sort (o Tamer passa "por cima" de árvore pintada) | [E] `scene-tiles.ts:42-47,136-139` permite o recorte; [H] o resto é trabalho manual |

### 6.4 O que um asset do ChatGPT (Método A) precisa para entrar

Imagem gerada pelo ChatGPT **não é sprite pronto** (Comando C1 §4). O caminho mínimo, na ordem:

| # | Passo | Ferramenta gratuita [H] | Critério de saída (verificável) |
|---|---|---|---|
| A1 | **Recuperar a grade de pixel real.** Saber se é pixel art ampliada (grade regular) ou ilustração com aparência de pixel | Inspeção a 800% no Aseprite/LibreSprite; script de detecção de grade (o mesmo princípio do `unzoom_image` do PixelLab, que custa 0,1 geração e **não** está autorizado aqui) | Grade identificada (ex.: blocos de 4×4 px) ou declarada "sem grade" |
| A2 | **Reduzir a escala para 1:1.** Com grade: *nearest-neighbor* pelo fator exato da grade. Sem grade: redesenhar por cima numa camada 1:1 (não existe redução automática correta) | Aseprite (Sprite Size, nearest) ou GIMP (Interpolação: nenhuma) | Canvas no tamanho-alvo; cada pixel = 1 pixel de arte; 0 pixels de AA (contagem de cores próximas = 0) |
| A3 | **Paleta.** Quantizar para a paleta escolhida (Endesga-32 **e/ou** a de referência v13/v15, conflito aberto C1: medir contra as duas) sem *dithering* automático | Aseprite (Indexed, sem dither) | Nº de cores ≤ limite combinado; % dentro de cada paleta relatada |
| A4 | **Recorte e transparência.** Remover o fundo, apagar halo e fixar o contorno | Aseprite (varinha sem tolerância) + revisão manual da borda | Nenhum pixel com 0 < alfa < 255 na borda (salvo intenção); fundo alfa 0 |
| A5 | **Pivô e canvas.** Pôr o pé no mesmo y em todos os quadros e o canvas no tamanho fixo | Aseprite (alinhamento por camada de referência) | Pé com variação ≤ 1 px; altura ±5% (L4) |
| A6 | **Direções e quadros.** Gerar ou desenhar S, N, W (E por espelho) e os quadros de walk/idle/attack/hurt de 6.3.1. **Este é o passo mais caro**: o ChatGPT não mantém consistência entre chamadas | ChatGPT (pose por chamada) + redesenho no Aseprite | Mínimo de 6.3.1 cumprido; QA de consistência entre quadros (§3) |
| A7 | **Montagem da folha.** Exportar folha + `atlas.json` JSON Hash, ou PNGs com nome `atlasKey` | Aseprite (Export Sprite Sheet, JSON Hash) | Atlas válido; chaves batem com `creature.json` |
| A8 | **Manifesto e licença.** `creature.json` + `license.json` com classe ADR-015 (1)/(2)/(3) e fonte | Editor de texto (o `game-dev` faz) | Checklist 6.5 inteira = sim |

**Estimativa de esforço por asset (Método A, humano com Aseprite, a partir de uma imagem já gerada) [H — conhecimento de domínio, nunca medido neste projeto; os 25 min do Gabumon hand64 (§4.1) são o único dado real de trabalho manual e foram de desenho, não de conversão]:**

| Asset | A1–A5 (conversão de 1 imagem) | A6 (direções e quadros) | A7–A8 (folha e manifesto) | Total por asset |
|---|---|---|---|---|
| Prop estático (árvore, pedra) | 0,5–1,5 h | — | 0,1–0,2 h | **0,6–1,7 h** |
| Tile 32 sem costura (1 tile) | 0,5–1 h | — | 0,1 h | **0,6–1,1 h**; um par Wang de 16 tiles: **4–10 h** |
| Digimon pequeno (Koromon), mínimo de 6.3.1 (3 direções × idle 1 + walk 4, attack 3, hurt 1 ≈ 19 quadros) | 1–2 h | 6–14 h | 0,5 h | **7,5–16,5 h** |
| Digimon médio (Agumon), idem | 1–2 h | 8–18 h | 0,5 h | **9,5–20,5 h** |
| Digimon grande (WarGreymon), idem (mais detalhe por quadro) | 1,5–3 h | 10–24 h | 0,5 h | **12–27,5 h** |
| Tamer (4 direções × walk 6 + idle 4 = 40 quadros, como o v13) | 1–2 h | 12–30 h | 0,5 h | **13,5–32,5 h** |
| Mapa 12×10 do laboratório, pintado + marcação manual de colisão/mato no `.tmj` | — | — | 2–4 h só de integração (o `game-dev`), além da arte | **2–4 h de integração** |

Leitura: no Método A o custo não está em "gerar a imagem"; está em A6. Os assets já recebidos do ChatGPT (`INVENTARIO_ASSETS_CHATGPT.md`: Guilmon e ExVeemon, **ainda não recebidos**) só podem ser estimados depois de passar por A1 e se saber se há grade real.

### 6.5 Checklist binária "pronto para integrar" (alimenta a linha "Integração técnica" da matriz §3)

Um asset é **pronto para integrar** só se **todos** os itens aplicáveis forem "sim". Um "não" basta para reprovar a integração. O item marcado (auto) pode ser verificado por script; os demais, por inspeção do `game-qa`.

| # | Item | Aplica a | Como verificar |
|---|---|---|---|
| I-01 | PNG RGBA, fundo com alfa 0, sem cor de chroma residual | todos | (auto) contar pixels de alfa 0 na borda e cores do fundo original |
| I-02 | Sem halo: nenhum pixel com 0 < alfa < 255 no contorno (salvo efeito intencional declarado) | personagem, prop | (auto) contagem de alfa parcial |
| I-03 | Escala 1:1: nenhuma grade de ampliação (blocos N×N idênticos com N ≥ 2) | todos | (auto) detecção de blocos repetidos |
| I-04 | Sem antialiasing nem reamostragem: nº de cores dentro do limite combinado, sem meias-tintas de borda | todos | (auto) histograma de cores + inspeção a 800% |
| I-05 | Canvas inteiro e constante dentro de cada animação | personagem, prop animado | (auto) dimensões de todos os quadros iguais |
| I-06 | Pivô no pé: o pé varia ≤ 1 px entre quadros; altura de conteúdo ±5% (L4) | personagem | (auto) linha opaca mais baixa por quadro |
| I-07 | Direções mínimas: Digimon S, N, W (+E espelho); Tamer S, N, W, E | personagem | lista de `dirFrames` |
| I-08 | Quadros mínimos: idle ≥ 1, walk ≥ 2 por direção (4 recomendado), attack ≥ 3, hurt ≥ 1; `combatStates` mapeados | personagem | leitura do manifesto |
| I-09 | Tile exatamente 32×32, sem costura; tileset de transição no formato Wang de canto | tile | (auto) tamanho; inspeção da costura 3×3 |
| I-10 | Folha + `atlas.json` JSON Hash (ou PNG por `atlasKey`) com chaves que batem com o manifesto | personagem | (auto) `buildCreatureCatalog` não descarta o asset |
| I-11 | Manifesto válido (`creature.json`/`tamer.json`/`.tmj` + `.aliases`) e ids GS-003 preservados | todos | `tsc` + testes + `map:validate` (no mapa) passam |
| I-12 | `license.json` com classe ADR-015 (1)/(2)/(3), fonte (obra, episódio e minuto quando for anime; URL) e camada (`official-fan-use`/`reference`/própria) | todos | leitura |
| I-13 | Densidade de pixel igual à do restante da cena (R2) | todos | comparação lado a lado com Tamer v13 e o rip DS na mesma captura |
| I-14 | Tratamento de cor coerente com a cena: mesmo filtro (cartoon assado ou nenhum) e paleta medida contra Endesga-32 **e** v13/v15 | todos | (auto) % por paleta; decisão de filtro registrada |
| I-15 | Mapa: colisão, mato, água, inícios e portal marcados; `map:validate` passa; Y-sort correto (o Tamer não passa por cima de tronco) | mapa | `map:validate` + captura no jogo |
| I-16 | Carrega no jogo sem placeholder (`packSummary`: 0 chaves faltando) e sem erro no console | todos | captura + console da URL de teste |

Na matriz §3, a linha "Integração técnica" pode ser relatada como **"n de 16 itens sim"** por asset, e **aprovado = todos os aplicáveis sim**.

### 6.6 O que precisaria mudar no código (só lista e estimativa; nada implementado)

**Para a rodada do laboratório (métodos A/B/C):**

| # | Mudança | Por quê | Estimativa [H] | Risco |
|---|---|---|---|---|
| M1 | **Generalizar `import-pixellab-map.mjs`**: id, prefixo e pasta por argumento; N tilesets Wang encadeados (hoje só "água × grama", com tileset fixo); ponte e portal lidos dos objetos em vez de linha fixa | Sem isso, o mapa-piloto 40×30 ou o recorte 12×10 do PixelLab não entra no jogo | 1–2 dias | Médio: a v15b tem de continuar saindo igual (teste de regressão byte a byte no `.tmj`) |
| M2 | **Importador de personagem genérico** (ZIP do `export_asset` do PixelLab, ou folha do Aseprite em JSON Hash) → `creature.json` + atlas, medindo o pivô no pé como faz o `import-tamers-v13.mjs` | Hoje só existem importadores específicos (Tamers v13, Guilmon/Gabumon DS); os Métodos A, B e C produzem Digimon e Tamer novos | 1 dia | Baixo |
| M3 | **Script de checklist automático** (itens I-01 a I-06, I-09, I-10, I-14 da 6.5), saindo em JSON + MD para o `game-qa` | Medição igual para A, B e C, sem opinião | 0,5–1 dia | Baixo |
| M4 | **URL ou cena de comparação** (`?lab=A|B|C`) que carrega o recorte 12×10 com o elenco de cada método, sem mexer no mapa padrão nem no save | Capturas lado a lado no mesmo motor | 0,5–1 dia | Baixo, se ficar atrás de flag e fora do save `gs003.world.save` |
| M5 | Tamer em 8 direções (hoje `DIRS4`) | Só se o fundador quiser as diagonais que o PixelLab já entrega | 0,5 dia | Baixo; muda o contrato do preset (testes) |

**Para os experimentos de escala E1–E4** (definições de `studio-alignment/07_BRIEFING_ETAPA6_VISUAL.md` §4, as únicas documentadas até agora; se o `PLANO_LABORATORIO_VISUAL_ETAPA6.md` redefinir E1–E4, esta lista precisa ser reconciliada pelo `game-studio`):

| Exp. | O que já existe [E] | Mudança necessária | Estimativa [H] |
|---|---|---|---|
| **E1** — nativo 1× + câmera mais larga | `?charh=N` (altura do personagem em % da tela, 3–25) e `?zoom=N` já mudam a câmera sem tocar em arte (`main.ts:85-87,101`; `scale.ts:23-33`) | **Nenhuma.** Só capturas com `?charh` menor | 0 de código; 1–2 h de capturas |
| **E2** — escala por estágio (multiplicador inteiro) | `mapScale` por manifesto e `?size=table` existem, mas são **ignorados** na URL padrão (`unifiedScale`, `view.ts:1400-1404`). O estágio está em `world-species.json` | Multiplicador inteiro por estágio dentro de `scaleOf()`, atrás de flag (`?scale=stage`); sombra e alvo de clique seguem a escala (`view.ts:1812,1869,1897`). Colisão (`radiusByStage`) **não muda** | 0,5–1 dia + testes |
| **E3** — Tamer e Digimon ×2, cenário 32 | `?creatureScale=2` (`main.ts:68`) já multiplica criaturas e Tamer via `scaleOf()` (`view.ts:1347,1683`) | Conferir HUD, rótulos de nome, sombra e copa translúcida a ×2; nada estrutural | 0–0,5 dia (só ajustes encontrados nas capturas) |
| **E4** — tile 16 nativo | Nada: `TS = 32` está fixo no importador, nos mapas e nos pacotes | Tile 16 no importador, nos mapas, nos pacotes, na colisão (sub-células `sim/params.ts`) e **toda a arte do cenário refeita**. Contradiz o tile 32 aprovado em 11/11 | 3–5 dias de código + arte inteira de cenário; não recomendado sem decisão do fundador |

### 6.7 Riscos técnicos de misturar fontes no mesmo quadro (ChatGPT + PixelLab + rip DS + extração do anime)

| Risco | O que acontece | Evidência | Mitigação proposta [H] |
|---|---|---|---|
| **Densidade de pixel diferente** | O motor desenha tudo na mesma escala inteira (R2). Um asset com "pixel" de 2×2 ou reamostrado parece de outro jogo ao lado do rip DS 1:1 | [E] `view.ts:58-62`; Etapa 2: 3 estilos convivendo, nota 4/10 | I-03, I-13 obrigatórios; nenhum asset entra sem 1:1 |
| **Escala relativa sem régua** | Rip DS (Koromon 17 px, WarGreymon 36 px), Tamer v13 (36×36) e asset novo de outra ferramenta, cada um na sua altura. Hoje o próprio jogo já tem duas convenções (§6.2 item 1) | [E] 6.1 | Medir e relatar a altura de conteúdo de cada método (§2.3); não normalizar antes da decisão de escala |
| **Filtro de cor desigual** | O terreno e os props da v15b têm o filtro cartoon **assado** no PNG; os Digimon e os Tamers **não** têm. Um asset novo sem o filtro sobre o chão filtrado (ou com o filtro aplicado duas vezes) destoa | [E] `import-pixellab-map.mjs:64-99` (filtro só no import do mapa) | Decidir por cena: ou todo o cenário da rodada passa pelo mesmo filtro, ou nenhum; nunca aplicar em asset já filtrado (I-14) |
| **Paleta** | Endesga-32 × paleta v13/v15 (0% Endesga) é conflito aberto; misturar fontes multiplica as paletas na tela | [E] `ETAPA2_HOMOLOGACAO.md` §E (citado na §2.3) | Relatar % por paleta para cada fonte (I-14); não quantizar à força antes da decisão |
| **Antialiasing e halo** | ChatGPT e frames do anime vêm com AA e borda suave; o motor desenha o halo como está, e ele aparece claro sobre a grama escura | [E] R1; [H] comportamento típico das duas fontes | I-02, I-04; nada de recorte automático sem revisão |
| **Frame do anime como base** | Resolução, ângulo de câmera e iluminação do anime não são top-down 3/4 nem pixel art; vira sprite só com redesenho (ADR-015: "um frame do anime não vira sprite de jogo sem tratamento") | [E] ADR-015 | Tratar como referência (`reference`) ou passar por A1–A8 inteiro; classe (1)/(2) e fonte com episódio e minuto (I-12) |
| **Suavização ligada em algum caminho** | A máscara da copa translúcida usa `imageSmoothingEnabled = true` de propósito (feather), só na máscara; um asset novo desenhado nesse caminho sairia borrado | [E] `view.ts:676,688-690` | Não reutilizar esse buffer para sprites; manter o teste visual de nitidez |
| **Desempenho** | Cada PNG solto é uma requisição e uma textura; o glob *eager* registra tudo que casa nas pastas. Assets grandes (mapa pintado inteiro, frames do anime) aumentam o build. **FPS e memória nunca foram medidos** com 35 espécies e mapa 48×36 | [E] `creatures.ts:127-135`; `GA` = 235 MB, `dist/` = 20 MB (`du`, 13/11); FPS [NV] (`DIAGNOSTICO_TECNICO_1.0.md` §I.7) | Preferir folha + atlas a PNG por quadro; canvas justo nos props; medir FPS e memória do recorte do laboratório (contador no `?debug` [H]) antes de qualquer expansão |
| **Fonte de verdade dos assets** | O `qo` lê o seu próprio `GA`, que diverge do master (T6). Asset do laboratório gravado no master não aparece no `qo`, e vice-versa | [E] `vite.config.ts:6` resolve para `qo/assets/GAME-ASSETS` | Decidir (game-studio) onde os assets do laboratório ficam **antes** da rodada; sugestão: pasta própria `etapa6-lab/` lida por flag, fora do `GA` |

### 6.8 Limitações desta seção

1. Nenhum teste, `tsc`, build nem `map:validate` foi rodado: a tarefa proíbe alterar arquivos, e o `map:validate` reescreve relatórios versionados (T8). Os números de testes/build citados por outros documentos não foram reverificados aqui.
2. As estimativas de esforço (6.4) e de código (6.6) são [H]. O Método A nunca foi executado neste projeto e não há acesso ao ChatGPT neste ambiente.
3. Não li as 1.996 linhas de `render/view.ts` nem o `scripts/map-factory/validate.mjs` por inteiro: os trechos citados são os que tratam de escala, pivô, sombra, suavização e formato.
4. A definição de E1–E4 usada é a do briefing 07 §4; o `PLANO_LABORATORIO_VISUAL_ETAPA6.md` ainda não existe.
5. Decisões que dependem do fundador e que esta seção **não** toma: escala Tamer/Digimon (C2); paleta (C1); usar ou não o filtro cartoon em toda a cena; onde ficam os assets do laboratório (T6); se o Tamer passa a 8 direções.

---

## 7. Critério para decidir se o PixelLab continua — limiares objetivos

Proposta de limiares, a aplicar sobre o resultado real da rodada de laboratório (seção 2), não decidido aqui:

| # | Limiar | Como verificar | Se falhar |
|---|---|---|---|
| L1 | **Custo por asset aprovado** do Método B não deve superar em mais de 50% o custo projetado em §4.1 (~25–40 gerações para a rodada completa) | Somar gerações reais gastas na rodada ÷ nº de assets aprovados pela régua do `game-qa` | Reavaliar se o gasto está em retrabalho de composição (corrigível com briefing melhor, não abandonar a ferramenta) ou em limitação real da ferramenta |
| L2 | **Taxa de aprovação na 1ª ou 2ª tentativa** (sem precisar de 3+ rodadas, como ocorreu com o Guilmon 64px) deve ser ≥ 50% dos assets da rodada | Contar nº de assets aprovados em ≤2 rodadas ÷ total de assets testados | Se < 50%, o problema pode ser briefing insuficiente (testar com briefing mais detalhado antes de descartar) ou limitação real de consistência da ferramenta |
| L3 | **Nenhuma falha crítica da régua** (Style Bible §8.3 ou equivalente revisado) deve se repetir em 2+ rodadas consecutivas do mesmo tipo de asset | `game-qa` registra falha crítica por rodada | Falha crítica repetida 2× no mesmo tipo de asset indica limitação estrutural da ferramenta para aquele tipo de asset específico (ex.: PixelLab para redesenho de criatura oficial, já historicamente fraco) |
| L4 | **Consistência entre quadros de animação** dentro de ±5% de variação de altura (critério já usado em produção real) deve valer para ≥ 80% dos quadros gerados | Medição automática de bounding box por quadro (script Pillow, já existe modelo em `scale-proof-v3-fix/`) | Se abaixo de 80%, documentar se o pipeline correto (custom_start_frame, já identificado como solução) foi usado antes de concluir que a ferramenta falha |
| L5 | **Saldo restante no ciclo** não pode cair abaixo de 200 gerações (10% do plano) sem que o fundador autorize expressamente continuar gastando | `get_balance` antes/depois de cada rodada | Pausar e reportar ao fundador antes de qualquer nova rodada |
| L6 | **Comparação com o Método A/C**: se o Método A (ou C), mesmo sem ser testado nesta conta, mostrar em qualquer teste futuro autorizado pelo fundador um custo humano/tempo por asset aprovado **menor** que o PixelLab para o mesmo nível de qualidade (régua ≥8), isso pesa contra a continuidade exclusiva do PixelLab | Comparar os registros de tempo e nota da seção 3/4 entre métodos, quando (e se) o Método A/C for autorizado e executado | Recomendar migração parcial (reservar PixelLab para animação/tileset, onde o histórico já mostra força relativa) em vez de abandono total |

**Este documento não aplica estes limiares** — define-os para a rodada de laboratório (fora do escopo deste Comando 1, que é só planejamento) e para a decisão final do fundador na homologação da Etapa 6.

---

## 8. Limitações desta entrega

1. Método A e Método C **nunca foram executados nesta conta/projeto** — toda avaliação de fluxo e limitação para eles é [H], baseada em conhecimento de domínio sobre as ferramentas citadas, não em teste real. O histórico real e detalhado (seções 1.2 e 4.1) existe só para o Método B.
2. Não há acesso de API ChatGPT neste ambiente; o custo e o comportamento reais do Método A dependem inteiramente de uma execução futura autorizada com a conta/credencial do fundador — nenhuma suposição de preço foi inventada.
3. A matriz de critérios (seção 3) define **como medir**, mas não mede nada nesta entrega — não há asset produzido para aplicar a régua.
4. A seção 6 (requisitos técnicos do game-dev) está deliberadamente vazia, por instrução do comando.
5. A proposta de revisão do Style Bible (seção 5) é comparativa, não uma recomendação única — decisão final é do fundador, dentro da homologação da Etapa 6.
6. Identificada uma divergência de datas entre dois documentos do próprio estúdio sobre a definição dos métodos A/B/C (seção 0); resolvida aqui usando a regra de precedência (documento mais recente), registrada para o `game-studio` avaliar se atualiza o documento antigo.
7. O recorte exato de 12×10 tiles do mapa-piloto (coordenadas específicas) não foi fixado por este documento — é decisão de produção, não de planejamento.
8. Os valores de custo em gerações de §4.1 para "projeção da rodada" são estimativas [H] por analogia com casos reais documentados, não cotações exatas da ferramenta para este briefing específico — qualquer execução real deve reconfirmar com `get_balance` antes/depois, como já é regra do projeto.
9. **Adendo do fundador (ADR-015) processado após a entrega inicial deste documento** (mesma data, 2026-11-13): §0b, §1 (nota), §2.2 e §2.4 foram ajustados para remover a restrição implícita a referência genérica e adicionar a classificação documental (1)/(2)/(3)/(4). O primeiro adendo pedia tratar a extração de frame como "ponto aberto, não decidido", o que contradizia o próprio texto do ADR-015/contexto v1.2 (que já diziam "decidido"/"liberada"); um segundo adendo do fundador, recebido depois, **confirmou** que a extração está liberada e desconsiderou o ponto aberto — §2.5 foi reescrita para refletir isso, com as condições de rastreabilidade do ADR-015 (fonte com obra/episódio/minuto, camada `official-fan-use`/`reference`, nota ≥ 8, só fonte legítima sem contornar DRM) e onde a opção entra em cada um dos 3 métodos. Contradição resolvida pelo fundador, não por este agente.
10. A seção 5 (Style Bible) e a seção 7 (limiares do PixelLab) não precisaram de ajuste pelo adendo — não tratam de propriedade intelectual de cenário/personagem, só de paleta/escala/contorno e de custo da ferramenta.
