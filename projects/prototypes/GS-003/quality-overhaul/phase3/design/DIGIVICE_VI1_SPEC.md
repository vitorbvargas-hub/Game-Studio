# Digivice VI 1.0 — spec implementável (Tamer/Digimon/talentos/vínculo/banco de dados/registros)

- **Autor:** game-design (UI-UX-DESIGNER) · **Data:** 2026-11-11
- **Gatilho:** auditoria do fundador ("não mudou nada", `PROJECT_LOG.md` 2026-11-11 ~10:5x) — achado: *"Digivice sem as seções do VI 1.0 §08 (Tamer/Digimon/talentos/vínculo/banco de dados)"*.
- **Fonte do requisito:** briefing do fundador (resumido na tarefa desta entrega, repetido aqui para rastreabilidade): o DIGIVICE deve conter **Perfil Tamer, Atributos Tamer, Poderes Tamer, Árvore de talentos Tamer, Perfil Digimon, Atributos Digimon, Habilidades Digimon, Árvore de talentos Digimon, Evolução, Vínculo, Banco de dados, Registros e descobertas** — evitando abas duplicadas; com estados fechado/aberto, navegação, painéis internos, selecionado, bloqueado e visualização de talentos; sem alterar as regras reais de progressão. HUD inferior com Tamer, Digimon ativo, HP/XP, equipe, habilidades rápidas, itens e notificações.
- **Leitura de código feita para esta entrega (read-only, worktree `workspaces/game-dev/qo`, branch `quality-overhaul`, nada alterado):** `ui/digivice.ts`, `ui/holo-card.ts`, `ui/screens.ts`, `ui/evolve-ui.ts`, `ui/moves-ui.ts`, `ui/hud.ts`, `ui/hud-v2.ts`, `ui/panel.ts`, `ui/icons.ts`, `sim/evolution.ts`, `sim/types.ts`, `sim/moves.ts`, `data/content/achievements.json`, `data/evolution-paths.json`, `main.ts` (wiring de `data-short`, `SHORTCUTS`, `updateTamer`).
- **Specs-base lidas (herdadas, não reabertas):** `HUD_IDENTITY_V3.md` (Digivice Radial Alt A, aprovada — geometria do hub/arco **não é tocada aqui**), `PANELS_SPEC.md` (Guilda/Correio/Passe/Fonte/Chefe Mundial/Conquistas, já com P0 implementado), `VIDEO_IDEAS_SPEC.md` §2 (Elogiar/Repreender/Ignorar — base do Vínculo) e §3 (ficha holográfica + árvore de evolução — já implementado), `P8_HUD_V2_SPEC.md` (sistema de moldura/paleta/estados — herdado integralmente).
- **Nenhum código ou arte foi alterado nesta entrega.** Nenhuma regra real de progressão (XP, evolução, combate) é alterada. Onde esta spec propõe algo que a sim não tem, o item vem marcado **[H]** e pendente de aprovação do fundador antes de qualquer implementação.

---

## 0. Achado estrutural — por que "Digivice" parecia incompleto

A auditoria do fundador está certa, e o código mostra exatamente a causa: **hoje existem DOIS objetos diferentes chamados "Digivice"**, e nenhum dos dois tem as 12 seções do VI 1.0.

| Objeto | Onde está no código | O que mostra hoje | Como se abre |
|---|---|---|---|
| **"Digivice" nº 1** — hub radial do canto superior direito | `ui/digivice.ts` (`Digivice` class, `digiviceHudHtml`) | Guilda, Correio, Passe de Temporada, Fonte dos Desejos, Chefe Mundial, Conquistas (a Alt A aprovada, `HUD_IDENTITY_V3.md` §2) | Clique no hub (ou tecla **H**) abre o arco de 6 ícones |
| **"Digivice" nº 2** — atalho da grade inferior | `ui/hud.ts` `SHORTCUTS` linha `{ id: "dex", label: "Digivice", icon: "dex", key: "V" }` → `ui/screens.ts` `digiviceHtml` | Só o Bestiário/Banco de dados (lista de espécies vistas/escaneadas, varredura %) | Botão "Digivice" na grade de 12 ícones (ou tecla **V**) |

Nenhum dos dois tem Perfil/Atributos/Poderes/Talentos do Tamer, nem Árvore de talentos do Digimon, nem Vínculo — por isso a auditoria do fundador lê como "Digivice sem as seções do VI 1.0". Além disso, a **ficha holográfica do parceiro** (`ui/holo-card.ts`, abas "Ficha"/"Evolução") é um **terceiro** modal, aberto pelo retrato do parceiro, com Perfil+Atributos+Evolução do Digimon — já pronto, mas sem nenhum vínculo visual com os outros dois "Digivice".

**A causa raiz não é falta de conteúdo — é falta de um objeto único.** Perfil/Atributos/Habilidades/Evolução do Digimon já existem (na ficha holográfica); Banco de dados já existe (no atalho "dex"); Conquistas/Registros parciais já existem (no hub). Faltam: tudo do lado Tamer (Atributos, Poderes, Árvore de talentos) e o lado Vínculo — e falta **um só lugar** que reúna as 12 seções sem repetir nome ou conteúdo.

### Duplicação secundária encontrada (mesma causa, outro sintoma)

A grade inferior (`SHORTCUTS`) tem um atalho próprio **"Evolução"** (`id: "evo"`, sem tecla) que abre `evolveChoiceHtml` (`ui/evolve-ui.ts`) — a mesmíssima função de dados (`statusesOf`/`pathStatuses`) que a aba "Evolução" da ficha holográfica (`ui/holo-card.ts` `evoTreeHtml`) já usa, só que renderizada como cartões lado a lado em vez de árvore. São duas telas, dois nomes idênticos ("Evolução"), uma fonte de dados. A grade inferior também repete "Guilda"/"Correio"/"Conquistas" como botões próprios — esses três já são redirecionados ao hub pelo próprio código (`SHORTCUT_TO_HUB` em `ui/digivice.ts`), então **não são duplicados na prática** (é um alias, resolvido); mas "dex" e "evo" **não têm** esse redirecionamento e por isso duplicam de verdade.

---

## 1. Mapeamento item a item — VI 1.0 §08 → código existente

| # | Seção pedida (VI 1.0 §08) | Existe? | Onde (evidência) | O que falta |
|---|---|---|---|---|
| 1 | Perfil Tamer | **[E] parcial** | `ui/hud-v2.ts` `tamerBlockHtml`/`TamerVitals` (nome, nível); `main.ts` `hud.tamerProgress()`/`addTamerXp` (XP, curva `base 40 + perLevel 18`, `ui/hud.ts:85-87`); visual (`TamerLook` do criador, `assets/tamer-presets.ts`) | Uma tela própria que junte isso num "Perfil" (hoje só aparece espalhado: nome+nível na barra inferior, XP só como número cru) |
| 2 | Atributos Tamer | **[H] não existe** | `sim/types.ts` `PlayerState`/`Entity` não tem `StatBlock` para o Tamer (só o Digimon tem `hp/atk/def/spd`); `Energia` do Tamer existe só visualmente, sem regra (`hud-v2.ts` comentário: *"ainda sem regra de consumo"*) | Decisão de design (ver §3.1): não inventar stats de combate novos — reaproveitar contadores já reais do `DigiviceSave` (vitórias, varreduras, digivoluções, mapas, chefões) como "atividade do Tamer" |
| 3 | Poderes Tamer | **[H] não existe** | Nenhuma habilidade ativa do Tamer na sim (`Intent`/`WorldEvent` de `sim/types.ts` não tem nada do tipo); só o Digimon ataca | Proposta mínima [H], sem tocar na sim (ver §3.1) |
| 4 | Árvore de talentos Tamer | **[H] não existe** | idem acima | Proposta mínima [H], cosmética, gatilho = `tamerLevel` já rastreado (`DigiviceSave.tamerLevel`, `noteTamerLevel`) |
| 5 | Perfil Digimon | **[E] completo** | `ui/holo-card.ts` `holoCardHtml` (retrato em anel de scanner, estágio, atributo, PV/XP) | Nada — só precisa de um lugar sem nome duplicado (ver §3) |
| 6 | Atributos Digimon | **[E] completo** | `holoCardHtml` `STAT_ROWS` (PV/Ataque/Defesa/Velocidade com barra, cor por elemento) | Nada |
| 7 | Habilidades Digimon | **[E] completo** | `ui/moves-ui.ts` (`MovesView`, 4 slots ativos, golpes aprendidos, prioridade do AUTO) — hoje vive na aba "Golpes" do modal Equipe & Box | Só reaproveitar (leitura), não duplicar a edição (ver §3.2) |
| 8 | Árvore de talentos Digimon | **[H] não existe** | `sim/evolution.ts` só tem árvore de **evolução** (mudança de espécie); não há "pontos de talento" gastáveis em stats | Proposta mínima [H], sem tocar na sim — ver §3.1 (distinta da evolução) |
| 9 | Evolução | **[E] completo** | `ui/holo-card.ts` `evoTreeHtml`/`evoTree` — usa `pathStatuses()`/`forksAhead()` já existentes, % calculada só a partir de dados reais | Nada |
| 10 | Vínculo | **[H] não existe** | `grep` confirma: nenhum campo `discipline`/`affection` em `sim/types.ts`; já havia uma proposta pronta em `VIDEO_IDEAS_SPEC.md §2` ("Elogiar/Repreender/Ignorar"), nunca implementada | Reaproveitar essa proposta como a regra mínima do Vínculo (ver §3.1), pendente de aprovação |
| 11 | Banco de dados | **[E] completo** | `ui/screens.ts` `digiviceHtml`/`dexDetailHtml` (bestiário com varredura %, onde aparece, golpes, evolução) | Só mudar de endereço (hoje é o atalho "dex" duplicado, ver §0) |
| 12 | Registros e descobertas | **[E] parcial** | Conquistas (`ui/digivice.ts` `achievementsHtml`, P0 já implementado: 12 itens, 4 categorias) rastreiam exploração/combate/coleção; **mapas visitados já são salvos** (`DigiviceSave.maps`, `noteMap`) mas **nunca aparecem em tela nenhuma** | Uma 2ª aba dentro da mesma seção, listando `maps` (dado já existe, zero regra nova) |

---

## 2. Arquitetura proposta — um Digivice, sem abas duplicadas

**Princípio:** o Digivice continua sendo exatamente o objeto da Alt A aprovada (hub circular + arco, `HUD_IDENTITY_V3.md` §2) — **a geometria do arco não muda** (não reabre a correção de raio/ângulo que o `QA_HUD_FB1_COMPARE.md` já apontou e o game-dev já ajustou). O que muda é que esse mesmo Digivice ganha um **segundo conteúdo interno** (o "núcleo" Tamer/Digimon), acessado por pontos de entrada que **já existem no jogo hoje e não fazem nada de útil para isso** — nenhum gesto novo, nenhum ícone novo na tela.

### 2.1 Dois anéis, um só objeto

| Anel | Conteúdo | Pontos de entrada | Muda a Alt A? |
|---|---|---|---|
| **Anel social/eventos** (igual a hoje) | Guilda · Correio · Passe de Temporada · Fonte dos Desejos · Chefe Mundial · **Registros e descobertas** (renomeado de "Conquistas" — mesmo conteúdo + 1 aba nova, §2.3) | Clique no hub ou tecla **H** (Alt A, inalterado) | **Não.** Mesmos 6 nós, mesmo raio 140px, mesmo arco 90°→184° (`ARC_RADIUS`/`ARC_FROM`/`ARC_TO` de `ui/digivice.ts`, intocados) |
| **Núcleo Tamer/Digimon** (novo) | Perfil/Atributos/Poderes/Talentos do Tamer · Perfil/Atributos/Habilidades/Talentos do Digimon · Evolução · Vínculo · Banco de dados | 3 pontos de entrada já existentes, reaproveitados (§2.2) — **nenhum ícone novo** | Não usa o arco; é um modal próprio, maior, com aba lateral (§4) |

Por que não um 7º ícone no arco: o arco já foi calibrado para 6 (raio/ângulo ajustados pelo game-dev após o `QA_HUD_FB1_COMPARE.md`); adicionar um nó reabriria exatamente a questão de legibilidade que o QA já levantou (P1: *"com 120px de raio e só 6 ícones... o resultado visual é mais parecido com um menu em grade do que com um leque"*) — um 7º ícone pioraria isso, não resolveria. O núcleo Tamer/Digimon também é conteúdo bem mais denso (9 sub-seções) do que cabe num ícone de arco de 32px; ele já pede um modal próprio do tamanho da ficha holográfica atual (820px, herdado do `P8_HUD_V2_SPEC.md` §5).

### 2.2 Pontos de entrada do núcleo (reaproveitados, zero UI nova)

| Gesto (já existe hoje) | O que faz hoje | O que passa a fazer |
|---|---|---|
| Tecla **V** / botão "Digivice" (`dex`) da grade inferior (`ui/hud.ts` `SHORTCUTS`) | Abre só o Bestiário (`digiviceHtml`) | Abre o núcleo do Digivice, aba inicial **Banco de dados** (o próprio bestiário, sem mudar 1 linha de `digiviceHtml`) |
| Clique no retrato do parceiro (já abre a ficha holográfica hoje) | Abre `holoPanelHtml` (abas Ficha/Evolução) | Abre o mesmo núcleo, aba inicial **Digimon → Perfil** |
| Clique no bloco TAMER da barra inferior (`ui/hud-v2.ts` `tamerBlockHtml`, 120×88px — **existe na tela, mas hoje não tem `onclick` nenhum**, confirmado por grep) | Nada (elemento decorativo) | Abre o mesmo núcleo, aba inicial **Tamer → Perfil** — é o único gesto novo desta spec, e não é "novo": é dar função a um elemento que já está na tela sem fazer nada |

Resultado: **3 portas, 1 sala.** Quem aperta V, quem clica no parceiro e quem clica no Tamer chegam todos ao mesmo modal, só que destacando a aba relevante — exatamente como "Ver árvore ›" já faz hoje dentro da própria ficha holográfica (`holoCardHtml`, troca de aba sem trocar de modal).

### 2.3 O que acontece com o que já existia

| Elemento de hoje | Destino nesta proposta |
|---|---|
| Atalho "dex" da grade inferior (`SHORTCUTS`) | Mantido (ícone, tecla V, posição) — só o conteúdo que abre muda (vira o núcleo, aba Banco de dados) |
| Atalho "evo" da grade inferior | **Removido como atalho separado** — vira o mesmo "Ver árvore" que já existe dentro de Habilidades/Perfil Digimon; o popup automático de nível (`evolveChoiceHtml`, disparado ao subir de nível com caminho elegível) **continua existindo**, porque é um gatilho diferente (interrupção no momento certo, não uma aba de navegação) — ele só passa a abrir a aba Evolução do núcleo em vez de um modal próprio paralelo, reaproveitando `evoTreeHtml` em vez de manter 2 renderizações da mesma % |
| Ficha holográfica (`holo-card.ts`) | Vira as abas **Perfil Digimon + Atributos Digimon** (a função `holoCardHtml` já existe pronta — ver §3.2, ela é só reorganizada em 2 abas em vez de 1) + **Evolução** (idêntica, `evoTreeHtml` sem mudança) |
| "Conquistas" do hub (`ui/digivice.ts` `achievementsHtml`) | Renomeada para **Registros e descobertas**, ganha uma 2ª sub-aba "Mapas visitados" (lista `DigiviceSave.maps`, dado já salvo) — mesmo node do arco, mesmo P0 já entregue, zero trabalho de sim |
| Aba "Golpes" do Equipe & Box (`moves-ui.ts`) | Mantida como está (é onde a edição de verdade acontece); **Habilidades Digimon** no núcleo é uma vitrine somente-leitura dos mesmos dados, com um botão "Editar em Equipe & Box" — nunca duas telas que editam a mesma coisa (ver §3.2) |

---

## 3. Dados reais vs. regra nova, por seção

### 3.1 O que exige regra nova — proposta mínima [H], pendente de aprovação do fundador

Nada abaixo altera XP, evolução, combate ou qualquer número que já existe. São leituras/estruturas novas, não mudanças na sim atual.

**Atributos Tamer** — não proponho inventar um `StatBlock` de combate para o Tamer (mexeria na sim de verdade, fora do pedido "sem alterar as regras reais de progressão"). Proposta: reaproveitar os contadores que **já são reais e já são salvos** em `DigiviceSave` — vitórias (`wins`), varreduras completas (`scans.length`), digivoluções (`evolves`), mapas visitados (`maps.length`), chefões despertados/derrotados (`bossAwakens`/`bossDefeats`) — apresentados como "registro de atividade do Tamer", não como estatística de combate (RPG). É o mesmo dado que já alimenta as Conquistas, só reaproveitado numa leitura diferente. **[H] rótulo e formato de apresentação**, não o dado em si (esse já é real).

**Poderes Tamer** — não existe nenhuma habilidade ativa do Tamer na sim hoje. Proposta mínima: marcos cosméticos por nível de Tamer já rastreado (`tamerLevel`) — ex. "Nível 5: título 'Tamer em formação'" (o próprio texto da conquista `tamer_5` já existente em `achievements.json`) exibido como um "poder" narrativo (sem efeito numérico, sem gate de jogo). **[H], pendente de aprovação**: se o fundador quiser poderes com efeito real (ex. um Tamer que cura/buffa em combate), isso é mudança de sim e fica fora desta entrega (P2, ver §5).

**Árvore de talentos Tamer** — proposta mínima: nós cosméticos (moldura de retrato, título) desbloqueados pelos mesmos marcos de `tamerLevel` acima — zero ponto gastável, zero efeito em stat. **[H], pendente de aprovação.**

**Árvore de talentos Digimon** — distinta da Evolução (que troca de espécie). Proposta mínima: uma trilha **informativa**, não um sistema de pontos — mostra os golpes já aprendidos (`Entity.learned`, ordem real de aprendizado) como uma "trilha de maestria" read-only, sem gastar nada e sem mudar quando um golpe é aprendido (isso já é 100% decidido pela sim hoje). **[H], pendente de aprovação**: um sistema real de pontos de talento que altere stats é mudança de sim (P2, fora desta entrega).

**Vínculo** — a proposta já existe, pronta, em `VIDEO_IDEAS_SPEC.md §2` ("Elogiar/Repreender/Ignorar"): dois traços `discipline`/`affection` (0–100), decaimento passivo para 50, efeito só em **ramos alternativos** de evolução (nunca no caminho padrão, nunca risco de morte/perda). Esta spec **não reabre** aquela proposta — só a referencia como a regra mínima que a seção Vínculo do Digivice precisa para existir. **[H], pendente de aprovação do fundador** (ainda não implementada — `grep` confirma 0 ocorrências de `discipline`/`affection` no código). Enquanto não aprovada, a aba mostra um estado "ainda não ativo" explícito (§4.6), nunca um número inventado.

### 3.2 O que já é dado real — só reorganização de UI, zero sim nova

Perfil/Atributos/Evolução do Digimon (`holo-card.ts`), Banco de dados (`screens.ts` `digiviceHtml`), Registros/Conquistas (`digivice.ts` `achievementsHtml`) e os contadores do Tamer (nome/nível/XP) **já existem e já são calculados a partir de eventos reais da sim** (`reward`, `capture`, `evolve`, `level_up` — todos em `sim/types.ts` `WorldEvent`). Habilidades Digimon (`moves-ui.ts`) idem. Nada disso precisa de uma linha de sim nova — só precisa parar de estar em 3 modais sem relação entre si.

---

## 4. Layout por painel — estados, critérios de aceite, prioridade

Convenção igual à do `PANELS_SPEC.md`: cada painel é um `Panel` (`panel.ts`) — cabeçalho com título+×, corpo rolável. O núcleo (Tamer/Digimon/Evolução/Vínculo/Banco de dados) é **um só** `Panel` maior, com aba lateral esquerda (2 grupos + 3 abas soltas) em vez de 9 modais separados — mesma arquitetura que a ficha holográfica já usa para Ficha/Evolução, só com mais abas.

### 4.1 Estrutura geral do núcleo (container)

- **Moldura:** nível 2 do `P8_HUD_V2_SPEC.md` §2 (chanfrada), mesma classe do modal Equipe & Box — nenhuma moldura nova.
- **Aba lateral esquerda (nova neste modal):** 120px de largura, 2 grupos com disclosure (▸/▾) — **TAMER** (Perfil/Atributos/Poderes/Talentos) e **DIGIMON** (Perfil/Atributos/Habilidades/Talentos) — mais 3 itens soltos abaixo dos grupos: Evolução, Vínculo, Banco de dados. É a mesma convenção visual das abas por categoria já usada em Conquistas (`.dg-tabs`), só vertical em vez de horizontal.
- **Corpo:** troca de conteúdo por `Panel.update()` (já existe, sem piscar o modal inteiro) — igual à troca de aba Ficha/Evolução de hoje.
- **Estado "selecionado":** aba ativa com borda dourada `--ui-gold` (regra de seleção já definida, `P8_HUD_V2_SPEC.md` §3) — reaproveitada, não inventada.
- **Estado "bloqueado":** qualquer aba cujo dado dependa de uma proposta **[H] ainda não aprovada** (Poderes Tamer, Talentos Tamer, Talentos Digimon, Vínculo) usa o mesmo padrão visual de `lockedHtml` (`digivice.ts`) — ícone + "Bloqueado nesta versão" + explicação honesta do que falta, nunca um número inventado.

### 4.2 Tamer → Perfil [P0]

- **Dados:** [E] retrato (placeholder de moldura — `TAMER_PORTRAIT_CROP` ainda `null`, decisão de game-art pendente, igual ao que já é hoje na barra inferior), nome, nível, XP (barra + "X/Y para o próximo nível", mesma curva `tamerXp.base/perLevel` já usada no cálculo da barra da barra inferior).
- **Layout:** retrato 96×96px (mesmo tamanho do retrato grande da ficha do parceiro, §5 do P8, por paridade visual Tamer/Digimon) + nome/nível/XP ao lado, igual ao cabeçalho `hc-head`/`hc-id` já existente em `holoCardHtml` (reaproveita a classe, não inventa uma 2ª disposição).
- **Estados:** sempre disponível (não há "vazio" — Tamer sempre existe numa sessão ativa).
- **Critérios de aceite:**
  - [ ] Nome/nível/XP mostrados são exatamente os de `hud.tamerProgress()` — nenhum número paralelo.
  - [ ] Abrir por V, pelo retrato do parceiro ou pelo bloco Tamer sempre mostra o mesmo nome/nível (teste de consistência entre os 3 pontos de entrada).

### 4.3 Tamer → Atributos [P1]

- **Dados:** [E, reaproveitado — ver §3.1] `wins`, `scans.length`, `evolves`, `maps.length`, `bossAwakens`, `bossDefeats` do `DigiviceSave`.
- **Layout:** 6 linhas rotuladas ("Vitórias", "Espécies escaneadas", "Digivoluções acompanhadas", "Mapas visitados", "Chefões despertados", "Chefões derrotados"), cada uma só número — sem barra de progresso (não há "máximo" para "vitórias", ao contrário das Conquistas que têm meta).
- **Estados:** sempre disponível, todos os valores podem ser 0 (não é um estado "vazio" especial, é só o número 0).
- **Critérios de aceite:**
  - [ ] Todo número bate exatamente com `statValue(s, stat)` (`digivice.ts`) para o mesmo `stat` — zero cálculo paralelo.
  - [ ] Nenhuma destas linhas usa a palavra "atributo de combate" ou sugere que afeta o combate (evita confundir com `StatBlock` do Digimon).

### 4.4 Tamer → Poderes [P2 — bloqueado, pendente de aprovação]

- **Dados:** [H] ver §3.1 — nenhum poder real existe.
- **Layout:** estado bloqueado (`lockedHtml`), explicando: *"Poderes do Tamer ainda não existem como mecânica. Proposta em avaliação: marcos cosméticos por nível (sem efeito em combate)."*
- **Critérios de aceite:**
  - [ ] Nenhum "poder" aparece como utilizável/ativável nesta versão — só o aviso.

### 4.5 Tamer → Árvore de talentos [P2 — bloqueado, pendente de aprovação]

- Mesma convenção de 4.4. Texto: *"Árvore de talentos do Tamer: proposta em avaliação (cosmética, sem pontos gastáveis em stats). Aguardando aprovação do fundador."*

### 4.6 Digimon → Perfil [P0 — já existe]

- **Dados:** [E] 100% — `holoCardHtml`, metade de cima (retrato em anel de scanner, nome/nível, chips de estágio/atributo, barras PV/XP).
- **Mudança de UI:** nenhuma — só passa a viver dentro do núcleo em vez de um modal próprio. `holoCardHtml` é **dividida em 2 blocos reaproveitáveis** (cabeçalho+vitais = Perfil; tabela de stats+afinidades = Atributos) em vez de uma função só — é refatoração de apresentação, a lógica de cálculo não muda.
- **Critérios de aceite:** idênticos aos já existentes para a ficha holográfica (não repetidos aqui).

### 4.7 Digimon → Atributos [P0 — já existe]

- **Dados:** [E] 100% — `STAT_ROWS` de `holo-card.ts` (PV/Ataque/Defesa/Velocidade, barra na cor do elemento) + `affinityMatchups` (bate forte/sofre mais/resiste).
- **Critérios de aceite:** idênticos aos já existentes.

### 4.8 Digimon → Habilidades [P1]

- **Dados:** [E, reaproveitado, somente leitura] `MovesView` de `moves-ui.ts` — 4 slots ativos, lista de aprendidos, MP, recarga.
- **Layout:** os mesmos 4 slots (`.mv`, ícone+recarga) em modo somente-leitura (sem `data-mv` clicável) + lista de aprendidos abaixo + botão **"Editar em Equipe & Box"** que fecha o núcleo e abre o modal de Equipe & Box já na aba Golpes (reaproveita a navegação existente, `onShortcut`/`data-short="team"`).
- **Por que somente-leitura aqui:** evita exatamente o "abas duplicadas" pedido pelo fundador — a troca de golpe ativo, a edição da prioridade do AUTO e a escolha de evolução continuam tendo **um único lugar que edita de verdade** (Equipe & Box); o Digivice só mostra.
- **Estados:** vazio (nenhum golpe aprendido ainda — não deveria acontecer no fluxo normal, mas o texto existe: *"Ainda sem golpes aprendidos."*).
- **Critérios de aceite:**
  - [ ] Os 4 slots mostrados aqui são sempre idênticos aos da hotbar em jogo no mesmo instante (nenhum estado próprio, só leitura de `MovesView`).
  - [ ] O botão "Editar" sempre leva à mesma aba Golpes do Equipe & Box — nunca abre um 2º formulário de edição dentro do Digivice.

### 4.9 Digimon → Árvore de talentos [P2 — bloqueado, pendente de aprovação]

- **Layout quando aprovado (não implementado agora):** trilha horizontal de nós = `Entity.learned` em ordem, cada nó = ícone do golpe + nome, sem anel de %/sem requisito (é um histórico, não uma meta) — visualmente mais simples que a Árvore de evolução (4.10), para não ser confundida com ela.
- **Estado bloqueado (atual):** texto: *"Árvore de talentos do Digimon: proposta em avaliação (trilha informativa dos golpes aprendidos, sem pontos gastáveis). Distinta da Evolução — aqui a espécie não muda."*

### 4.10 Evolução [P0 — já existe]

- **Dados:** [E] 100% — `evoTreeHtml`/`evoTree`, % calculada só a partir de `pathStatuses()`/`ReqCheck` já existentes (fórmula documentada em `VIDEO_IDEAS_SPEC.md §3`, já implementada).
- **Mudança de UI:** nenhuma na lógica — só o popup automático de nível (`evolveChoiceHtml`) passa a, ao ser aceito/dispensado, abrir esta mesma aba em vez de manter sua própria renderização em cartões (ver §2.3) — **unificação sem perder o gatilho de interrupção no momento do nível**.
- **Critérios de aceite:** os já existentes da ficha holográfica, mais:
  - [ ] O popup automático de nível e a aba Evolução do núcleo nunca mostram uma % diferente para o mesmo caminho no mesmo instante (teste: forçar nível com `?demo=evo`, comparar as duas telas).

### 4.11 Vínculo [P1 — bloqueado até aprovação, estrutura de UI pronta para quando for aprovada]

- **Dados quando aprovado:** [H, ver §3.1 e `VIDEO_IDEAS_SPEC.md §2`] `discipline`/`affection` (0–100), decaimento passivo, efeito só em ramos alternativos de evolução.
- **Layout:**
  - 2 barras (0–100), rotuladas "Disciplina" e "Afeto", sempre visíveis (requisito já fixado pelo `VIDEO_IDEAS_SPEC.md`: *"nunca escondidos"*).
  - 3 botões (Elogiar/Repreender/Ignorar) que, no gatilho certo (vitória, fuga, item), aparecem por 10s — aqui dentro do painel, sem bloquear o jogo.
  - Nota fixa explicando o efeito: *"Afeta só caminhos alternativos de evolução — o caminho padrão nunca tem gate de vínculo."*
- **Estado atual (não aprovado ainda):** em vez das barras, um aviso: *"Vínculo ainda não é uma mecânica ativa. Proposta pronta em `VIDEO_IDEAS_SPEC.md §2`, aguardando aprovação do fundador — nenhum número é mostrado até a regra existir de fato."* — **nunca mostrar uma barra em 50% fingindo que já funciona.**
- **Critérios de aceite (quando aprovado, não verificáveis ainda):**
  - [ ] Nenhum caminho de evolução **padrão** (sem `alternate`) tem gate de `minAffection`/`minDiscipline` (idêntico ao já escrito em `VIDEO_IDEAS_SPEC.md §2`).
  - [ ] As barras persistem no save e decaem para 50 sem interação, nunca saturam em 0/100 por omissão.
- **Critério de aceite válido já (estado bloqueado):**
  - [ ] Nenhuma barra numérica aparece nesta aba enquanto a mecânica não for aprovada — só o aviso de pendência.

### 4.12 Banco de dados [P0 — já existe]

- **Dados:** [E] 100% — `digiviceHtml`/`dexDetailHtml` (`screens.ts`): grade de espécies, detalhe com varredura %, onde aparece, golpes, evolução.
- **Mudança de UI:** nenhuma na lógica — só passa a ser uma aba do núcleo em vez do antigo atalho "dex" isolado (que deixa de existir como modal próprio, ver §2.3).
- **Critérios de aceite:** os já existentes de `digiviceHtml` (não repetidos).

### 4.13 Registros e descobertas [P0 — já existe, só renomeado + 1 aba nova]

- **Dados:**
  - Sub-aba "Conquistas": [E] 100% — `achievementsHtml` (`digivice.ts`), sem nenhuma mudança de lógica.
  - Sub-aba "Mapas visitados" (**nova, zero sim nova**): [E] `DigiviceSave.maps` (array de `regionKey`, já salvo por `noteMap` a cada troca de região) — só nunca teve uma tela.
- **Layout da sub-aba nova:** lista simples (nome da região · rota), ordem de primeira visita, sem agrupamento — é um log, não precisa de grid.
- **Estados:** "Mapas visitados" vazio só na primeiríssima sessão antes de qualquer `noteMap` (não deveria ocorrer no fluxo normal, já que o mapa inicial é registrado ao entrar); texto de vazio: *"Nenhum mapa registrado ainda."*
- **Critérios de aceite:**
  - [ ] O nó do arco (hub) mostra "Registros e descobertas" como rótulo (não mais "Conquistas") — verificar `title`/`aria-label` do nó.
  - [ ] A lista de mapas usa só `DigiviceSave.maps` — nenhum evento novo na sim, nenhuma 2ª fonte de verdade sobre "onde o jogador já esteve".
  - [ ] O pip de notificação do hub (`hubPips`, hoje `trophy`) continua disparado pela mesma condição (conquista completa não coletada) — a renomeação não muda quando o pip acende.

---

## 5. Prioridades (P0/P1/P2)

| Prioridade | Itens | Critério de corte |
|---|---|---|
| **P0 — zero sim nova, maior ganho imediato** | (a) Container do núcleo com aba lateral (§4.1); (b) Tamer→Perfil (4.2); (c) Digimon→Perfil (4.6, refatoração de apresentação de `holoCardHtml`); (d) Digimon→Atributos (4.7); (e) Evolução unificada (4.10); (f) Banco de dados realocado (4.12); (g) Registros e descobertas renomeado (4.13, sub-aba Conquistas); (h) os 3 pontos de entrada (§2.2) | Resolve o achado da auditoria ("Digivice sem as seções") usando só dados e telas que já existem — nenhuma linha de sim, só reorganização de UI |
| **P1 — UI nova pequena sobre dado já real** | (a) Tamer→Atributos (4.3, leitura do `DigiviceSave`); (b) Digimon→Habilidades somente-leitura + botão "Editar" (4.8); (c) Registros e descobertas, sub-aba Mapas visitados (4.13, dado já salvo, UI nova); (d) estrutura de UI do Vínculo no estado bloqueado (4.11, só o aviso, sem dado) | Cada um é só uma tela nova sobre dado que já existe — nenhum requer decisão de regra pendente para funcionar |
| **P2 — depende de aprovação de regra nova [H]** | (a) Vínculo funcional (4.11, precisa aprovar `VIDEO_IDEAS_SPEC.md §2`); (b) Poderes Tamer (4.4); (c) Árvore de talentos Tamer (4.5); (d) Árvore de talentos Digimon (4.9) | Todos exigem uma decisão do fundador sobre regra nova antes de qualquer número real aparecer — até lá, ficam no estado bloqueado honesto (não placeholder fingido) |

---

## 6. HUD inferior — o que falta (itens, notificações)

O pedido do briefing ("HUD inferior com Tamer, Digimon ativo, HP/XP, equipe, habilidades rápidas, itens e notificações") já tem 5 dos 7 blocos prontos e confirmados em código: Tamer (`tamerBlockHtml`, P8 §4.1), Digimon ativo + HP/XP (`.hud-partner`, existente), equipe (`.hud-team`, existente), habilidades rápidas (`moveBarHtml`, hotbar de 4 golpes, existente). Faltam **itens** e **notificações** — nenhum dos dois tem tela ou indicador na barra inferior hoje.

### 6.1 Itens — gap confirmado

- **O que existe:** o atalho "Inventário" (`.inv`, `data-short="inv"`, tecla **I**) já está na barra inferior (`ui/hud.ts` linha 212) e abre `inventoryHtml` (`screens.ts`) — a tela de itens **existe**.
- **O que falta:** o próprio botão não mostra nada sobre o conteúdo (nenhuma contagem, nenhum destaque de item novo) — é um ícone de bolsa estático, igual esteja vazio ou cheio.
- **Proposta [H, UI só, zero sim nova]:** o botão ganha um badge numérico pequeno (reaproveita a classe `.badge` já existente, usada hoje só no chat — `ui/hud.ts` linha 198) mostrando a contagem total de itens consumíveis em posse (soma de `inv[id]` para itens de categoria "cura"/"captura", os que se gastam jogando) — **não** para cosméticos (que não se consomem, não fazem sentido como contador de urgência).
- **Critérios de aceite:**
  - [ ] O número do badge bate com a soma real do inventário (mesmo dado de `inventoryHtml`, sem contador paralelo).
  - [ ] O badge não aparece quando a soma é 0 (mesmo princípio "sem pip = sem novidade" já usado no hub).

### 6.2 Notificações — gap confirmado

- **O que existe:** só o chat (`.hud-chat`) tem badge de não-lido hoje; o hub do Digivice tem pips próprios (`hubPips`) só para os 3 sistemas do anel social (Correio/Passe/Chefe Mundial). **Nenhum badge existe nos 12 ícones da grade inferior** (`SHORTCUTS`), nem no atalho Inventário, nem no bloco Tamer/Digimon.
- **Proposta [H, UI só, zero sim nova]:** generalizar o padrão de pip/badge já usado no hub (`hubPips`) para a grade inferior: qualquer `data-short` cujo painel correspondente tenha "algo novo e real" ganha o mesmo `.badge`/pip — ex. "trophy" (agora "Registros e descobertas") acende quando há conquista completa não coletada (mesma condição de `hubPips.trophy`, só espelhada no ícone da grade); "team" acende quando um Digimon da equipe está pronto para evoluir (`statusesOf(...).some(s=>s.eligible)`, dado já calculado por `evolveChoiceHtml`); "quest" acende quando há missão completa não coletada (`questsHtml`, já calcula `complete`).
- **Por que isto não é um sistema novo:** cada badge só espelha uma condição que **já é calculada em algum lugar do código hoje** para decidir se mostra um botão "Coletar" — a novidade é só desenhar o mesmo booleano como um ponto no ícone de fora do modal, para o jogador saber que há algo sem precisar abrir cada tela.
- **Critérios de aceite:**
  - [ ] Nenhum badge novo nasce de uma condição que a sim não calcula hoje — todos reaproveitam uma condição `complete`/`eligible`/`claimed` já existente em algum painel.
  - [ ] Sem nenhuma condição ativa, nenhum badge aparece em nenhum ícone (estado padrão = grade limpa, igual a hoje).

---

## 7. Mockups

`phase3/design/digivice_vi1_mockups/`:

| Arquivo | Conteúdo |
|---|---|
| `architecture.svg` | Visão geral: o hub+arco da Alt A (inalterado) ao lado do novo núcleo Tamer/Digimon, com as 3 setas dos pontos de entrada (V, retrato do parceiro, bloco Tamer) convergindo no mesmo modal. |
| `core_tamer.svg` | Núcleo aberto na aba Tamer → Perfil, com a aba lateral mostrando os 2 grupos (Tamer/Digimon) + 3 itens soltos, e os estados selecionado/bloqueado lado a lado (Perfil ativo vs. Poderes bloqueado). |
| `core_digimon.svg` | Núcleo aberto na aba Digimon → Habilidades (somente-leitura + botão "Editar em Equipe & Box"), com a Árvore de talentos ao lado no estado bloqueado. |
| `vinculo_blocked.svg` | Aba Vínculo no estado atual (bloqueado, aviso) ao lado do que ela mostraria se aprovada (2 barras + 3 botões), para comparação lado a lado. |
| `registros_and_hud_bottom.svg` | Registros e descobertas (sub-abas Conquistas/Mapas visitados) + a barra inferior com os 2 badges novos (Inventário com contagem, "team" com pip de evolução pronta). |

São wireframes vetoriais de grid/dimensão (mesma convenção do `P8_HUD_V2_SPEC.md` §11 e do `HUD_IDENTITY_V3.md` §7) — não é arte final; nenhuma arte foi produzida nesta entrega.

---

## 8. Limitações

- **Nenhum código foi alterado.** Esta é uma spec de reorganização e de regra mínima proposta; a refatoração de `holoCardHtml` em 2 blocos (§4.6), a fusão do atalho "dex"/"evo" no núcleo e os badges da grade inferior (§6) são trabalho de game-dev, não feito aqui.
- **Vínculo, Poderes Tamer, Talentos Tamer e Talentos Digimon continuam sem regra real** até o fundador aprovar — esta spec só organiza onde eles vão viver e qual é a proposta mínima de cada um; nenhum é implementável hoje sem essa aprovação.
- **O botão "Editar em Equipe & Box" (§4.8) assume que a navegação entre modais já suportada (`onShortcut`) aceita abrir direto na aba Golpes** — não verifiquei se `team` abre sempre na 1ª aba ou se aceita um parâmetro de aba inicial; se não aceitar, é um ajuste pequeno de `main.ts`, não desta spec.
- **Retrato do Tamer (96×96, §4.2) depende da mesma decisão de game-art já pendente para o bloco da barra inferior** (`TAMER_PORTRAIT_CROP` ainda `null`, `P8_HUD_V2_SPEC.md` §12) — enquanto isso, usa o mesmo placeholder com moldura que já existe.
- **Não testado com usuário.** A divisão em "2 anéis" e a escolha dos 3 pontos de entrada são recomendação de design a partir do código lido, não resultado de teste de usabilidade.
- **Os nomes "Registros e descobertas", "Poderes", "Árvore de talentos"** seguem literalmente o vocabulário do briefing do fundador — não foram alterados nem meia palavra; onde o código já tinha um nome diferente para a mesma coisa (ex. "Conquistas"), o mapeamento e a troca de rótulo estão explícitos em §2.3 e §4.13.
