# GS-003 — Fontes Digimon World 1 (romhacking/decomp)

**Autor:** game-research (subagente) · **Data:** 2026-11-11 · **Encomendado por:** fundador (via game-studio), mandou as 3 URLs diretamente.

> Marcação: **[E]** evidência (fonte + data) · **[H]** hipótese/inferência não verificada hoje.
> **Custo zero / regra de segurança cumprida:** só `web_fetch` (páginas HTML/Markdown/texto e API pública do GitHub) e leitura local. **Nenhuma ROM/ISO baixada, nenhum arquivo binário de jogo obtido, nenhuma conta criada.** Todo conteúdo lido abaixo é texto (README, headers `.c`/`.h`, `.txt`, JSON de metadados do GitHub) — nunca imagem, sprite ou arquivo de save/ROM.
> **Não refiz pesquisa já feita:** não toquei `research/sprite-recovery/*` (licenças de sprite já fechadas em `digimon_asset_licenses.json`, ADR-009), nem `research/multi-source/MAP_SOURCES_REPORT.md`/`FREE_LIBRARIES.md`/`AI_TOOLS_FREE_TIER.md`, nem `knowledge/*` (evolução, treino, DATA_QUALITY_REPORT). Uso esses arquivos só como baseline de comparação.

## 0. Baseline: o que já tínhamos antes desta tarefa

`knowledge/training_systems.json` e `knowledge/DATA_QUALITY_REPORT.md` (pesquisa de 2026-11-09, wikis Fandom/StrategyWiki) registram **DW1 como o jogo com pior cobertura** dos 5 pesquisados: evolução com só 0-3/5 estágios confirmados por linha (as wikis de DW1 são majoritariamente stub, "to be added"), e os campos `happiness`, `discipline` e `bond_affinity` estavam **todos marcados "pendente - não confirmado"** — a pesquisa via wiki não achou essas mecânicas documentadas para DW1 especificamente (achou só a existência de "cuidado" genérico e o risco conhecido de virar Numemon). Essa é exatamente a lacuna que o fundador pediu para checar com as 3 fontes técnicas abaixo.

---

## 1. romhacking.net/games/1646/

**[E] Acesso bloqueado hoje.** Tentei fetch direto (403 "Just a moment..." — desafio Cloudflare), proxy de leitura `r.jina.ai` (mesmo desafio, o crawler deles também foi bloqueado), Wayback Machine (snapshot de 2024-01-15 existe, mas `web.archive.org` retornou 429 "suspected abusive bot traffic" em duas tentativas com espera entre elas), e `corsproxy.io` (exige API key). Confirma o mesmo bloqueio já documentado em `knowledge/SOURCE_REGISTRY.md` (2026-11-09) para sites com Cloudflare — a proteção parece ter ficado mais agressiva (até o jina.ai renderizador caiu no desafio, o que não tinha acontecido antes). Uma segunda página do mesmo domínio (`/hacks/8069/`) também retornou 403, confirmando bloqueio no domínio inteiro, não só na página específica.

**[E] O que é confirmado indiretamente:** o ID 1646 do romhacking.net é referenciado pelo próprio README do `Dw1DataAndPatches` como a página do hack "Maeson" para Digimon World (link `romhacking.net/hacks/8069/`, não `/games/1646/`, mas no mesmo domínio/jogo) — confirma que o jogo cadastrado é Digimon World (PS1) e que a comunidade de romhacking já referencia esse domínio como repositório central de hacks/documentos para o jogo.

**[H] O que a página provavelmente contém** (padrão conhecido do site, não verificado hoje nesta página específica): romhacking.net organiza cada jogo em seções *Hacks*, *Translations*, *Utilities*, *Documents*, *Homebrew*. Para um jogo de culto como DW1 com comunidade ativa (ver seção 2), é provável que a página tenha: a ROM map/offset notes de SydMontague (citado como base de todo o trabalho em Dw1DataAndPatches e dw_decomp), talvez o próprio patch "Vice"/"Maeson", e documentos de texto sobre a estrutura de dados do jogo. **Nada disso foi confirmado por leitura direta hoje** — é inferência de como o site funciona, não dado extraído.

**Formato:** página HTML indexadora, sem download direto de dados — levaria a arquivos de terceiros (patches `.ppf`/`.xdelta`, documentos `.txt`/`.pdf`). **Licença:** desconhecida página a página (romhacking.net não define uma licença-padrão; cada autor de hack/documento escolhe a sua, geralmente nenhuma explícita). **Exige o jogo original:** sim, para qualquer patch (por definição, um patch é aplicado sobre uma ROM que o usuário já possui) — e por isso está fora do nosso escopo de qualquer forma.

**Aproveitável para GS-003:** nenhum dado extraído hoje. Recomendo não insistir nesta fonte por `web_fetch` — se o fundador quiser o conteúdo específico da página, só é possível manualmente (browser humano) ou aceitando o risco de nova tentativa futura (bloqueio pode ser intermitente).

---

## 2. github.com/Vicen04/Dw1DataAndPatches

**[E] O que é:** repositório ativo (último push 2026-10-29, 146 stars, 6 forks) de **Vicen04**, com base no reverse-engineering de **SydMontague** (mesma pessoa citada no `dw_decomp`) e dados de **Romsstar**. Contém: (a) o código-fonte C# (Godot) de um **instalador/patcher "Vice"** que aplica correções de bugs e um hack de balanceamento sobre a ROM do jogador (`DWViceSimpleInstaller/`, `New installer/`); (b) uma pasta `New installer/DataCheck/` com uma **ferramenta de inspeção de dados** (`EvoChart.cs`, `DigimonStuff.cs`, `StatGains.cs`, `TechData.cs`, `TechDamage.cs`, `TechBoost.cs`, `MapsStuff.cs`, `ItemsStuff.cs`, `ItemDropsStuff.cs`, `Recruits.cs`, `TournamentsData.cs`, `Bosses2.cs`, etc.); (c) notas de texto em `Other data/*.txt` e `Information links.txt`.

**[E] Achado crítico sobre o formato:** li o código de `EvoChart.cs` e `DigimonStuff.cs` por inteiro. Todas as ferramentas em `DataCheck/` recebem um `System.IO.Stream bin` (ex.: `public void SetupData(System.IO.Stream bin, ...)`) e **leem bytes diretamente de um arquivo binário da ROM em runtime** (`bin.Position = i * 11 + startOffset; bin.ReadByte();`). **Não há nenhuma tabela de dados (evolução, stats, itens, mapas) armazenada como texto/constante no repositório** — o repo é 100% uma ferramenta de visualização que só produz números quando executada contra a ROM do usuário. Ou seja: **para extrair qualquer valor real (ex. "Agumon evolui pra Greymon com requisito X"), seria necessário possuir e carregar a ROM** — exatamente o que a tarefa proíbe.

**[E] O que É aproveitável sem a ROM — texto puro, sem bytes de jogo:**
- `Other data/Movements that can be used by digimon lists.txt`: lista de **56 técnicas/movimentos por categoria elemental** (Fire, Wind, Ice, Mech, Earth, Fight, Filth) com nomes em inglês (ex. "Fire Tower", "Prominence Beam", "Pepper Breath" como finisher do Agumon, "Lovely Attack" do Monzaemon) + offsets de ROM (não úteis sem ROM, mas os **nomes e a taxonomia por elemento/categoria sim**).
- `Changelog.txt`, `README.md`, `Other data/Animation offsets.txt` (JP/US): texto descritivo, sem valores de design diretamente reaproveitáveis.
- `Information links.txt`: aponta para uma planilha Google Sheets pública ("movement allowed list") — não abri (fora do escopo de "ferramentas, docs, tabelas em texto" só por precaução de ser conteúdo de terceiro fora do GitHub, mas é texto público, sem login).

**Licença:** `"license": null` na API do GitHub — **sem licença explícita**, portanto *all rights reserved* por padrão (uso de leitura/referência é razoável, mas **não há permissão de reuso/redistribuição do código ou dos nomes de dados compilados**).

**Aproveitável no GS-003:**
- (a) Game design: a lista de técnicas por **tipo elemental** (Fire/Wind/Ice/Mech/Earth/Fight/Filth) é uma referência direta de taxonomia de ataques que pode orientar como organizar "técnicas" no nosso sistema — mas são **nomes de movimentos do jogo original**, não dados numéricos de balanceamento (dano, custo). Uso como inspiração de categoria, não como tabela a copiar.
- (b)/(c): nenhum (sem dados de mundo nem arte).
- **Risco:** zero uso de ROM/arte aqui; risco é só de **confundir isso com uma fonte de dados prontos** — não é. Repositório inteiro é uma ferramenta, não um dataset.

---

## 3. github.com/jype0/dw_decomp

**[E] O que é:** decompilação **em progresso** (WIP, "work in progress" no próprio README) do executável de Digimon World (PS1), baseada no mesmo trabalho de reverse-engineering de SydMontague (`DW1-SydPatches`, `DW1-Code`, citados no README). Repositório ativo (89 stars, 24 forks, push em 2026-10-19), linguagem C, **licença MIT confirmada** (li o arquivo `LICENSE` por inteiro).

**[E] Exige o jogo original para "funcionar":** sim, explicitamente — o README documenta o passo `dumpsxiso -x disks/us ... "/path/to/Digimon World (USA).bin"` como pré-requisito para compilar/comparar o binário. **Não baixei nem toquei nesse passo.** O que fiz foi ler só os arquivos-fonte `.c`/`.h` do repositório via GitHub (texto, sem ROM).

**[E] Achado mais importante da pesquisa — estrutura de dados do sistema de cuidado/vínculo de DW1**, lida direto do header `include/dw/params.h` (texto puro, licença MIT, sem bytes de ROM envolvidos):
```c
typedef struct {
    uint32_t condition;          // bitflags: SLEEPY, TIRED, HUNGRY, POOPY, UNHAPPY, INJURED, SICK
    ...
    int16_t discipline;          // <- disciplina existe como campo nomeado
    int16_t happiness;           // <- felicidade existe como campo nomeado
    ...
    int16_t weight;
    int16_t careMistakes;        // <- contador de "erros de cuidado" (liga ao risco de evoluir pra Numemon)
    int16_t battles;
    int16_t evoTimer;
    int16_t upgradeHPcounter; upgradeMPcounter; upgradeOffCounter;
    int16_t upgradeDefenseCounter; upgradeSpeedCounter; upgradeBrainCounter;
    ...
} PartnerPara;
```
Isso **confirma estruturalmente** (nomes de campo, não valores) que o jogo original tem `discipline`, `happiness` e `careMistakes` como variáveis distintas de progresso do parceiro — exatamente os três campos que `knowledge/training_systems.json` tinha marcado como **"pendente - não confirmado"** em 2026-11-09. É evidência direta de que a mecânica existe e tem esse nome interno, **mas não dá os valores/fórmulas** (threshold de happiness que afeta evolução, taxa de ganho/perda por ação) — isso só sairia de dump de dados da ROM, fora do escopo.

**[E] Achado relevante nº2 — não existe mecânica de "Elogiar/Repreender" em DW1 original.** Li `include/dw/tamer.h` por inteiro: as únicas funções relacionadas ao Tamer são de movimento, animação, estado de batalha e interação de mapa (`checkMapInteraction`, `tamerSetState`, `startBattle`...). **Nenhuma função de "praise"/"scold" aparece no código do Tamer nem do Partner** (`include/dw/partner.h`: `partnerTick`, `updateConditionAnimation`, `partnerSetState` — nada de elogio/repreensão direto). O sistema de `discipline`/`happiness` em DW1 parece ser **indireto** (afetado por alimentar na hora certa, deixar dormir, limpar o cocô, treinar sem exagerar — ver `RaiseData` abaixo), não por um botão de interação direta como em brinquedos virtuais ou em Next Order. **Isto é um dado importante para a decisão do fundador**: o "Vínculo com Elogiar/Repreender" aprovado é inspirado na *ideia* de disciplina/felicidade de DW1, mas **não é uma recriação literal da mecânica original** (que não tinha botão de elogiar/repreender) — é uma simplificação/estilização nossa, o que é desejável de qualquer forma (mecânica mínima > réplica 1:1), só não deve ser vendido internamente como "é assim que o DW1 original fazia".

**[E] `include/dw/partner.h` — `RaiseData` (por espécie, `RAISE_DATA[66]`):**
```c
typedef struct {
    int8_t hungerTimes[8];
    uint8_t energyCap, energyThreshold, energyUsage;
    int16_t poopTimer; uint8_t poopSize;
    uint8_t favoriteFood;
    uint8_t sleepCycle;
    uint8_t favoredRegion;      // região preferida do Digimon no mapa
    uint8_t trainingType;       // tipo de treino que mais beneficia essa espécie
    uint8_t defaultWeight;
} RaiseData;
```
Confirma que DW1 tem, **por espécie**, horários de fome, comida favorita, ciclo de sono, região de mapa favorita e tipo de treino favorito — um sistema bem mais granular que "Vínculo mínimo", útil como **referência de profundidade possível** caso o GS-003 queira evoluir o sistema depois (não para a versão mínima aprovada agora).

**[E] `include/dw/evolution.h`:** confirma 4 funções de transição por estágio (`getFreshEvolutionTarget`, `getInTrainingEvolutionTarget`, `getRookieEvolutionTarget`, `getChampionEvolutionTarget` — nomenclatura confirma a progressão Fresh→In-Training→Rookie→Champion→[Ultimate/Mega via outras rotas]) e uma função `reincarnatePartner` (o "renascimento"/novo ciclo do parceiro ao fim da vida, mecânica conhecida de DW1). **Sem os valores de threshold** (de novo, dependem da ROM).

**[E] `include/dw/params.h` também define:**
- `NUM_DIGIMON = 180` (total de espécies catalogadas no jogo) e `NUM_PARTNER_DIGIMON = 66` (quantas podem ser o parceiro do jogador) — número exato, consistente com o que `EvoChart.cs` do Vicen04 lê (`for i < 63`/`digiLevels` até 67).
- `DigimonPara`: `name`, `boneCount`, `radius`, `height`, `type`, `level`, `special[3]`, `dropItem`, `dropChance`, `moves[16]` — confirma que cada espécie tem até 16 slots de movimento e 1 item de drop com chance associada.

**[E] `include/dw/map.h`:** confirma estrutura técnica de mapa (`MapEntry` com `filename`, `doorsId`, `toiletId`; tiles de 35 posições, até 188 objetos locais por mapa) — é estrutura de **engine de tile PS1**, não dá os nomes das regiões de File City nem o grafo de conexões entre mapas (isso estaria em dados/arrays preenchidos a partir da ROM, fora do escopo). **Não encontrei o grafo de conexões do mundo neste header** — essa parte da pergunta do fundador (estrutura de File City/regiões/conexões) **não foi respondida por esta fonte dentro do que é seguro ler sem ROM**; continua dependendo das wikis/vídeos já usados em `knowledge/` e `MAP_SOURCES_REPORT.md`.

**Licença:** MIT confirmada no arquivo `LICENSE` (texto lido por inteiro) — aplica-se ao **código/toolchain de build que o autor escreveu** (Makefile, scripts Python, configs YAML). **[H] ressalva legal, não é parecer jurídico:** o C reconstruído imita a lógica do binário original da Bandai; a prática da comunidade de decomp (Mario 64, Zelda OoT, etc.) é licenciar o *toolchain*/código reconstruído como MIT mesmo assim, mas a reprodução de **nomes de struct e campos** (como `discipline`, `happiness`) é factual/estrutural, não uma expressão criativa protegida — ler e citar esses nomes como referência de design (o que fiz acima) é uso de baixo risco; **redistribuir o próprio arquivo `.c`/`.h`, ou qualquer dado numérico extraído via o decomp rodando contra a ROM, teria risco maior** e está fora do que fiz aqui.

**Exige o jogo original para extrair algo:** sim, para rodar o pipeline completo (`make regenerate`, `make compare`) e gerar/validar binários. **Para só ler a estrutura de dados (nomes de campo) como fiz nesta tarefa, não.**

**Aproveitável no GS-003:**
- (a) **Forte.** Confirma que `discipline`, `happiness` e `careMistakes` são conceitos estruturalmente distintos no DW1 original — dá legitimidade de design ao sistema de Vínculo aprovado (mesmo sendo uma simplificação, não cópia). Atualiza a lacuna "pendente" de `knowledge/training_systems.json` para "**[E] confirmado que existe, [H] valores desconhecidos**".
- (b) **Fraco.** Confirma a engine técnica de mapas (tiles/portas/banheiros por mapa), mas não o grafo de regiões/conexões de File City — isso continua vindo só de `knowledge/` e `MAP_SOURCES_REPORT.md` já existentes.
- (c) **Nenhum.** Não há arte/sprite neste repositório (é só C/config de build).
- **Risco:** baixo para o uso que fiz (ler nomes de struct como referência de design, citando a fonte). Risco sobe se alguém tentar rodar o pipeline contra a ROM ou redistribuir os `.c`/`.h` como parte do nosso jogo — **não fazer isso**.

---

## 4. Comparação com o que já temos

| Pergunta do fundador | romhacking.net/1646 | Dw1DataAndPatches | dw_decomp | Já tínhamos (`knowledge/`) |
|---|---|---|---|---|
| Stats/evolução por Digimon (valores) | [H] provável, não acessado | Não (ferramenta, exige ROM) | Não (exige ROM) | Parcial — wikis stub, "pendente" |
| Nomes de campo de disciplina/felicidade/cuidado | [H] não verificado | Não | **[E] SIM — `discipline`, `happiness`, `careMistakes` confirmados** | "pendente" antes de hoje |
| Técnicas/movimentos (nomes, categoria) | [H] provável | **[E] lista parcial por elemento (texto)** | Não (nomes reais dependem da ROM) | Não coberto nesse nível |
| Itens | [H] provável | Ferramenta (exige ROM) | Estrutura (`dropItem`/`dropChance`), sem nomes | Não coberto |
| Mapas/conexões de File City | [H] provável | Ferramenta (`MapsStuff.cs`, exige ROM) | Estrutura técnica de tile, sem grafo de regiões | Cobertura melhor em `MAP_SOURCES_REPORT.md` (via outros decomps/wikis) |
| Encontros | — | Não visto | Não visto | Não coberto nesta tarefa |
| NPCs | [H] provável | Ferramenta (`Bosses2.cs`, `Recruits.cs`, exige ROM) | Não visto | Não coberto |
| Arte/sprites/texturas | [H] provável (links pra rips de terceiros) | Nenhuma (zero imagem no repo) | Nenhuma (zero imagem no repo) | Já resolvido em `research/sprite-recovery/*` (rights layer `official-fan-use`) |
| Ferramentas de extração | **[E] é um índice de ferramentas/hacks** | **[E] é a própria ferramenta (C#/Godot)** | **[E] é o próprio pipeline de build** | — |

---

## 5. Recomendação objetiva

1. **Usar:** os nomes de campo confirmados em `dw_decomp/include/dw/params.h` (`discipline`, `happiness`, `careMistakes`, `upgradeXCounter` por stat) como **citação de evidência de design** ao documentar o sistema de Vínculo mínimo (ex. em `knowledge/training_systems.json`, atualizando os 3 campos de "pendente" para "[E] confirmado via decomp, 2026-11-11, fonte github.com/jype0/dw_decomp"). **Não** copiar nem redistribuir os arquivos `.c`/`.h` para dentro do repositório do jogo — citar como referência de pesquisa, igual já se faz com as wikis.
2. **Usar com cautela:** a lista de técnicas por elemento do `Dw1DataAndPatches` (`Other data/Movements...txt`) só como inspiração de taxonomia (Fire/Wind/Ice/Mech/Earth/Fight/Filth), sem copiar nomes de finishers específicos (ex. "Pepper Breath" é nome oficial do franchise, não do nosso jogo — se quisermos nomes próprios de técnica, criar os nossos).
3. **Não perseguir mais hoje:** romhacking.net/1646 — Cloudflare + rate-limit do Wayback bloquearam todas as tentativas; não há sinal de que insistir resolveria. Se o fundador precisar do conteúdo específico, só abrindo no navegador dele mesmo.
4. **Não usar para nada:** qualquer coisa que exija rodar as ferramentas contra a ROM/ISO real (ambos os repos de GitHub dependem disso para dar números) — está fora da regra da tarefa e eu não fiz isso.
5. **Decisão de design a levar ao fundador:** DW1 original **não tem** mecânica de "Elogiar/Repreender" (botão direto) — o Vínculo aprovado é uma mecânica nossa inspirada na *ideia* de disciplina/felicidade do DW1, não uma recriação fiel. Isso não é um problema (mecânica mínima é a decisão certa), só não deve ser comunicado como "fidelidade ao original" se isso importar para o fundador.
6. **Risco geral:** baixo. Nenhum arquivo de jogo, ROM, sprite ou save foi obtido ou lido. Todas as citações acima são de texto público (README, header de código, `.txt` de notas) acessado via `web_fetch`/API pública do GitHub, sem login.

## Limitações desta pesquisa

- romhacking.net/games/1646/ não foi acessado (Cloudflare + rate-limit do Wayback); o conteúdo descrito na seção 1 é majoritariamente inferência [H] sobre o padrão do site, não leitura direta.
- Os dois repositórios GitHub são **ferramentas/decomp**, não datasets prontos — qualquer valor numérico exato (threshold de evolução, taxa de ganho de disciplina) segue indisponível sem a ROM, que não foi e não deve ser obtida.
- Não abri a planilha Google Sheets linkada pelo `Dw1DataAndPatches` (fora do GitHub, não essencial para a pergunta do fundador).
- `dw_decomp` é WIP — vários símbolos ainda não têm nomes reconstruídos (ex. `EVL_D_80068938`), então a cobertura de nomes úteis é parcial mesmo dentro do que já está no repositório.
