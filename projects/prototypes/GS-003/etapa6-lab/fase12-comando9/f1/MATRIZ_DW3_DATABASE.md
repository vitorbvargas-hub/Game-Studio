# Matriz comparativa: Digimon World 3 × Digimon Database (6 espécies)

**Digital Odyssey (GS-003) · Comando 9, F1 · game-research · 2026-11-14**

> **Nada foi incorporado à Database.** Esta matriz só compara. Qualquer incorporação (novas arestas, claims, contextos) exige aprovação. Não baixei ROM e não usei repositório que distribua o jogo.

## Fontes usadas

| Fonte | Categoria | Lido em | O que deu |
|---|---|---|---|
| Database `projects/prototypes/GS-003/database/data/` (`species.json`, `evolutions.json`, `skills.json`, `claims.json`) | interna (agrega cat. 1 e 3) | 2026-11-14 | Estágio, atributo, golpe, arestas com `ctx.digimon_world_3` |
| Wikimon, seção "Digimon World 3" das páginas Agumon, Greymon, Gomamon, Ikkakumon, Koromon, Pukamon | **3** (wiki) | 2026-11-14 (6 requisições, 1/min, conforme `Crawl-delay: 60`) | Papel de cada espécie no DW3 |
| The Spriters Resource, página do DW3 (via Wayback) | 4 (ripagem de fã, material oficial) | 2026-11-14 | Quais espécies têm sprite de campo no DW3 |
| Repositórios do brief (abaixo) | 4 | 2026-11-14 | Quase nada utilizável. Ver avaliação |

## Avaliação dos repositórios DW3 [E, lidos em 2026-11-14 via API do GitHub]

| Repositório | Licença | O que tem | Usável para a matriz? |
|---|---|---|---|
| **markisha64/dmw3-randomizer** | MIT (`LICENSE.md`) | Código Rust que **lê as tabelas da ROM do próprio usuário** em tempo de execução. A única tabela no repo é `resources/enemyDigimon.csv` (nome → id de inimigo). | Só a lista de inimigos: Agumon/Greymon/Gomamon/Ikkakumon/Koromon/Bukamon **não estão** nela. "MetalGreymon" (0x1c1) e "BK WayGreymon" (0x1c0) estão. Evoluções e golpes por espécie **exigem a ROM** → não usado. |
| **ReGame-Labs/dw3_decomp** | MIT (segundo o brief; não reli o arquivo) | Decompilação em C (`src/battle/.../techs.c`, `digimon_change.c` etc.). Para montar precisa da ROM (arquivos `.sha1` do disco). | Não há tabela legível de espécie → evolução/golpe sem a ROM. Não usado. |
| **markisha64/ddw3** | não verificado | O README diz que contém as imagens do jogo (`tim`) convertidas para PNG, os arquivos de localização e "outros arquivos copiados" do disco, além de `data/digimon_profiles.toml` (55 perfis com status, resistências, crescimento e ids de golpes, **sem nome**). | **Não usar.** Distribui conteúdo do jogo, o que o brief proíbe. Li só o README e esse arquivo antes de perceber. Os números (balanceamento) não foram copiados nem usados: a Database não aceita número de balanceamento. |
| **dawsonc623/digimon-world-2003** | MIT (`LICENSE`) | Esqueleto de interface web (React/webpack), sem dados. | Não. |
| **RonnyAraujoTest/digimon-world-3-api** | não declarada | API Express/Mongo com esquema `{digimonName, digimonHp, itemDropped}`; os dados não estão no repo. | Não. |

**Conclusão [E]:** nenhum dos 5 repositórios entrega, sem ROM, as tabelas de evolução, golpes e atributos por espécie do DW3. A coluna DW3 abaixo usa **Wikimon (cat. 3)**. O que só sairia da tabela do jogo ficou **pendente**.

---

## Matriz

Legenda: ✅ concorda · ➕ o DW3 traz algo que a Database não tem para o contexto DW3 · ⚠️ estranho ou contraditório · ⏳ pendente · — não se aplica.

### 1. Presença no DW3

| Espécie | DW3 (Wikimon, cat. 3) [E] | Database (`appearances` tem `ctx.digimon_world_3`?) [E] | Comparação |
|---|---|---|---|
| Koromon | Sem seção "Digimon World 3" na página | Não | ✅ ausente nos dois. Ausência de seção é evidência fraca |
| Bukamon (Pukamon) | Sem seção DW3 | Não | ✅ idem |
| Agumon | **Parceiro jogável**: vem no "Offensive Pack" (com Renamon ou "Koemon", grafia do Wikimon, [H] provavelmente Kotemon) ou se obtém entregando o DDNA de Agumon (dropado por MetalGreymon no Bulk Swamp, Asuka Server) ao Professor do Digimon Lab. Também é carta (Red, 5 AP / 3 HP) | Sim | ✅ |
| Greymon | **Evolução Adult natural do Agumon e opcional para todos os outros parceiros jogáveis**; carta Red (1 S-Energy, 20 AP / 20 HP) | Sim | ✅ presença; ver evoluções |
| Gomamon | **Só carta** (azul, 2/3) | **Não** | ➕ Database não registra a aparição como carta |
| Ikkakumon | **Só carta** (azul, 13/13) | **Não** | ➕ idem |

### 2. Digivoluções

| Espécie | DW3 [E Wikimon cat. 3] | Database: arestas com `ctx.digimon_world_3` [E] | Database: total de arestas (todas as continuidades) [E] | Comparação |
|---|---|---|---|---|
| Koromon | — (não aparece) | nenhuma | sai para 10 (Agumon, Gabumon, Guilmon…); vem de 3 | — |
| Bukamon | — | nenhuma | sai para 5 (Gomamon, Betamon…); vem de 3 | — |
| Agumon | Adult natural = **Greymon**. Pré-evolução não se aplica: o DW3 começa no Rookie [H, pelo modelo do jogo] | `agumon → greymon` (natural) | sai para 18; vem de 4 | ✅ |
| Greymon | Vem de **Agumon (natural) e de qualquer parceiro jogável (opcional)**. O Wikimon cita uma tabela de "unlock criteria", que não li por completo | Entradas DW3: `agumon`, `guilmon`, `patamon → greymon`. Saída DW3: `greymon → metal_greymon` | sai para 22; vem de 9 | ➕ **lacuna**: a Database tem 3 origens DW3 e o DW3 permite as 8 (Veemon, Renamon, Kotemon, Kumamon, Monmon também) [E Wikimon "optional evolution for all other playable Digimon"; a lista dos 8 é [H] de memória] |
| Greymon (extra) | O Wikimon diz que pode fazer **Jogress com "Hookmon" para o ataque "Agnimon"** | não registrado | — | ⚠️ **estranho**: Agnimon é de Frontier e "Hookmon" não confere com nada que eu conheça. Pode ser texto de outro jogo misturado na extração ou ataque combinado próprio do DW3. **Não usar sem reler a página direto** |
| Gomamon | — (só carta: carta não evolui) | nenhuma | sai para 10 (Ikkakumon…); vem de 4 | — |
| Ikkakumon | — (só carta) | nenhuma | sai para 2; vem de 7 | — |

**Observação sobre a Database (não corrigida, só sinalizada):** as arestas `agumon → greymon` e `greymon → metal_greymon` têm `ctx.digimon_world_3` vindo das listas de continuidade do Wikimon. Também carregam claims de requisito (`cl.02312`, `cl.02313`) cuja fonte é a **wiki do Digimon World 1** (fandom), ou seja, outro jogo. [H] Pode haver mistura de contexto na mesma aresta: os requisitos valem para o DW1, não para o DW3. Sugiro registrar em `01_INVENTARIO_E_CONTRADICOES.md` depois de conferir (não fiz: está fora do escopo da F1).

### 3. Golpes

| Espécie | DW3 | Database (`skills.json`, assinatura) [E] | Comparação |
|---|---|---|---|
| Koromon | — | Foam | — |
| Bukamon | — | Air Bubbles | — |
| Agumon | ⏳ O DW3 tem um sistema próprio de **techs** (básico, assinatura, aprendidos por nível, DNA-DV), mas a lista por espécie só sai da tabela do jogo ou de um guia. O Wikimon não lista techs do DW3 | Pepper Breath (EN; "Baby Flame" no Reference Book [E Wikimon]) | ⏳ |
| Greymon | ⏳ idem | Mega Flame | ⏳ |
| Gomamon | — (carta) | Marching Fishes | — |
| Ikkakumon | — (carta) | Harpoon Torpedo | — |

### 4. Atributos

| Espécie | DW3 [E Wikimon] | Database (atributo normalizado / EN oficial) [E] | Comparação |
|---|---|---|---|
| Koromon | — | none (alternativas: Data/Free/No Data por continuidade) | — |
| Bukamon | — | none (idem) | — |
| Agumon | Carta **Red**. No DW3 a "cor" da carta é um sistema de jogo, não o atributo Vaccine/Data/Virus. ⏳ o atributo do parceiro no DW3 não foi lido | vaccine / Vaccine | ⏳. **Não equiparar cor de carta a atributo** |
| Greymon | Carta **Red** | vaccine / Vaccine | ⏳ idem |
| Gomamon | Carta **azul** | vaccine / Vaccine | — (só carta) |
| Ikkakumon | Carta **azul** | vaccine / Vaccine | — (só carta) |

[E, nomes de campo, sem valores] O DW3 trabalha com afinidades elementais por perfil (fogo, água, gelo, vento, trovão, máquina, trevas), segundo os nomes de campo em `ddw3/data/digimon_profiles.toml`. É um eixo diferente do atributo Vaccine/Data/Virus da Database. Os valores **não** foram lidos para nenhuma espécie e não devem entrar na Database (número de balanceamento + fonte proibida).

---

## Resumo em números

- **6** espécies comparadas em **4** pontos (presença, evoluções, golpes, atributos) = 24 células.
- **Concordam (✅):** 5. **DW3 traz algo que a Database não tem (➕):** 3 (Gomamon carta, Ikkakumon carta, origens opcionais de Greymon). **Pendente (⏳):** 4 (golpes de Agumon e Greymon no DW3; atributo DW3 de Agumon e Greymon). **Não se aplica:** 12. Total: 24.
- **Estranho (⚠️), fora da contagem:** 1 anotação (Jogress "Hookmon/Agnimon" no Greymon).
- **Lido no oficial (cat. 1):** 0. **Lido na wiki (cat. 3):** 6 páginas do Wikimon. **Repositórios:** 5 avaliados; 0 usáveis sem ROM; 1 marcado "não usar" (ddw3).

## Decisões que dependem do fundador

1. **Incorporar à Database** as aparições de Gomamon e Ikkakumon como carta no DW3 e as origens opcionais de Greymon no DW3? (Camada A, cat. 3.) Recomendo **sim**, mas como tarefa própria da Database, com o validador.
2. **Fonte para os techs do DW3:** só há dois caminhos, e ambos precisam de aprovação. Um é um guia de texto (GameFAQs, cat. 4). O outro é tabela do jogo, que exige ROM e por isso está fora de questão.
3. **ddw3:** confirmar que fica na lista de "não usar".
