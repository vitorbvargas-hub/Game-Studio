# PLANO_TESTES_JOGAVEIS_A_B_C — Etapa 6, Comando 3, passo 5 de 7

- **Autor:** game-dev (subagente) · **Data:** 2026-11-13.
- **Prevalece sobre este documento:** `ADR_ETAPA6_DECISOES_FUNDADOR.md` (D1–D6) e `COMANDO_ETAPA6_C3_ADENDO_PORTAO.md` (objetivo: 3 versões **jogáveis**, 3 links, ambiente isolado do jogo principal; portão obrigatório de autorização).
- **Regra respeitada: só inspeção e plano.** Nenhum código alterado, nenhuma rota criada, nenhum branch criado, nenhum commit, nenhuma geração PixelLab, nenhum outro agente acionado. Código lido: worktree `qo`, branch `quality-overhaul`, HEAD **`3289e32`**, `git status` limpo (verificado antes e depois desta leitura).
- **Legenda:** **[E]** verificado diretamente no código/arquivo, caminho:linha, 13/11/2026 · **[H]** hipótese/estimativa · **[NV]** não verificado.
- **Base lida:** `BRIEFING_UNICO_LAB_A_B_C.md`, `ESCALA_E5_POR_ESPECIE_V1.md`, `ESPECIFICACAO_TAMER_PERSONALIZAVEL_V1.md`, `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6 (M1–M5, R1–R6, I-01..I-16, de mim mesmo em tarefa anterior), `AJUSTES_RUBRICA_VISUAL_V1.md` (Dimensão 3).

---

## 1. Inspeção do motor atual

### 1.1 O que permite carregar um conjunto de assets alternativo sem tocar no jogo principal — **hoje: nada**

**Achado central, verificado nesta sessão:** não existe hoje nenhum mecanismo de "pacote de assets alternativo por flag". Os três carregadores de asset (`creatures.ts`, `tiles.ts`, `tamer-presets.ts`) usam `import.meta.glob(..., { eager: true })` [E, `src/assets/creatures.ts:127-150`; `src/assets/tiles.ts:75-101`; `src/assets/tamer-presets.ts:217-225`]. `eager: true` significa que **todo arquivo que casa com o padrão do glob é importado e empacotado no bundle de build**, incondicionalmente — não existe "carregar só se a URL pedir". As flags de URL que já existem (`?map=`, `?creatureScale=`, `?charh=`, `?dpr=`, `?look=`) [E, `src/main.ts:66-152`] mudam **câmera, escala de exibição e qual mapa já carregado é mostrado** — nenhuma delas troca o **catálogo** de personagens/tiles por outro.

Dois mecanismos parecidos já existem e são o ponto de partida mais barato para construir o isolamento do laboratório:
- **`MAPS: Record<string, MapDef>`** [E, `src/world/regions.ts:66-100`]: registro estático de mapas, cada um importado por `import` direto (não glob) do seu `.tmj`/`.aliases`. Acessível hoje por `?map=<id>` [E, `main.ts:78,392`].
- **`?look=`** [E, `regions.ts:48-58`]: troca o `.tmj`/`.aliases` de um mapa **já registrado** por uma variante (`looks: Record<string, {...}>`), sem tocar no mapa base, com `defaultLook` por mapa.

Nenhum dos dois troca o **elenco de personagens** (`creatures.ts`) nem a **biblioteca de tiles** (`tiles.ts`) — só o mapa (`regions.ts`) tem esse padrão de variante. Para o laboratório, o padrão `looks`/`MAPS` é reaproveitável para o mapa; o elenco de Digimon/Tamer do laboratório precisaria de um glob próprio, **novo**, apontando para uma pasta separada (ver §2 e §5, M4).

**Alias de pasta:** `@game-assets` resolve para `assets/GAME-ASSETS` (fora do worktree, no estúdio) e `@gs003-art` para `art/` (dentro do projeto GS-003, fora do worktree também) [E, `vite.config.ts:6-11,33`]. Qualquer pasta nova para o laboratório precisaria de um alias próprio (ex.: `@etapa6-lab`) apontando para `etapa6-lab/<método>/` — **hoje não existe esse alias**.

### 1.2 Como o mapa é carregado e a limitação do importador (M1, fixo na v15b)

O mapa em jogo é um subconjunto de Tiled JSON (`.tmj.json` + `.aliases.json`) [E, `src/sim/map.ts:1-55`], registrado estaticamente em `regions.ts` (§1.1) e lido por `import` — **não** por `fetch` em runtime. Dois caminhos entram nesse formato:
1. **Montagem manual** (Tiled/Map Factory) — já usado em 5 dos 6 mapas hoje (`digimon-forest-01`, `forest-proof`, `praia`, `vila` e seus `looks`).
2. **Importador do PixelLab** (`scripts/import-pixellab-map.mjs`) — usado só para `digi-forest-v15b`, o mapa padrão (`DEFAULT_MAP`).

**Confirmado nesta sessão, linha a linha, que o importador está fixo na v15b:**
- `const MAP_ID = "digi-forest-v15b"; const PACK = MAP_ID; const PREFIX = "v15_";` [E, `scripts/import-pixellab-map.mjs:35-37`].
- O tileset Wang é lido por **nome de arquivo literal**: `tileset-ea8ba16a-water-grass.json` [E, `:108`] — só funciona se o export do PixelLab trouxer exatamente esse arquivo; não há como apontar para outro tileset ou encadear um 2º par de terrenos.
- Só **2 terrenos** são reconhecidos: a grade ASCII (`terrain_grid.txt`) distingue apenas `isWater` (`"s"`) vs. o resto (`"upper"`) [E, `:102-125`] — o briefing do laboratório pede **3–4 conjuntos de tileset** (grama↔água, grama↔desnível, +variante de grama, +piso de santuário opcional), o que o importador atual não suporta sem reescrita.
- A **ponte é uma linha fixa**: `const BRIDGE_ROW = 17;` [E, `:198-200`] — qualquer mapa novo com ponte em linha/coluna diferente (o layout-brief do laboratório tem a ponte por volta de y=12, não y=17) exige editar o número à mão no script, não é parametrizável hoje.
- `TS = 32` está fixo [E, `:41`] — compatível com o briefing (tile 32), não é um bloqueio.

**Conclusão:** rodar o importador para o mapa-piloto 40×30 do laboratório, como está hoje, **falha ou produz um mapa errado** (ponte na linha errada, só 1 par de terreno reconhecido, tileset de nome diferente rejeitado). Isso é exatamente o que `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6.6 já havia estimado como M1 (1–2 dias) — confirmado aqui com os números de linha atuais, sem mudança desde aquela entrega (mesmo commit `3289e32`).

### 1.3 Como sprites, quadros e pivôs são lidos

- **Formato preferido:** 1 manifesto (`creature.json`/`tamer.json`/`character.json`) + 1 folha (`spritesheets/<ID>.atlas.json`, JSON Hash, com `pivotPx` **por quadro**) + 1 PNG [E, `src/assets/creatures.ts:69,91-123`].
- **Formato alternativo:** 1 PNG por quadro, nome = `atlasKey` (`<ID>_<anim>_<dir>_NN.png`), tamanho fixo do manifesto (`frameW`×`frameH`), origem (0,0) [E, `creatures.ts:117-120`].
- **Pivô:** sempre no pé — centro da linha de pixels opacos mais baixa do quadro [E, `creatures.ts:69`, R3]; o Tamer usa o mesmo princípio, medido no pé da rotação sul pelo importador (`import-tamers-v13.mjs:50-62`).
- **Direções:** Digimon usa `Dir8`, com `resolveFacing()` decidindo entre a direção desenhada, o espelho (`mirrored`) ou a mais próxima [E, `render/anim.ts:134-183`]. **O Tamer está hardcoded em 4 direções** — confirmado nesta sessão: `export const DIRS4: Dir4[] = ["S", "N", "W", "E"];` [E, `src/assets/tamer-presets.ts:9`], usado em toda a montagem do preset (linhas 110-124, 172, 396-413). Mesmo que um método gere 8 direções do Tamer, só 4 entram no jogo sem mudar o código (M5).

### 1.4 Colisão (`radiusByStage`) e Y-sort

- **Colisão:** raio fixo **só pelo estágio numérico de jogo**, sem relação com a altura/largura visual do sprite — confirmado nesta sessão: `const radius = worldSpecies.radiusByStage as Record<string, number>; ... radius: radius[String(stage)] ?? 14` [E, `src/sim/species.ts:45,60`]; a tabela em si: `"radiusByStage": { "1": 12, "2": 16, "3": 22, "4": 26, "5": 30 }` [E, `src/data/world-species.json:3`]. Isso é exatamente a "Rota 1" que `ESCALA_E5_POR_ESPECIE_V1.md` §2 documenta como a única regra ativa — confirmado aqui direto no código, não por inferência.
- **Escala visual × `mapScale`:** o fator de escala por manifesto (`mapScale`) é **ignorado** quando `unifiedScale` está ativo — e `?dpr=1` (padrão da branch desde 11/11) ativa `unifiedScale` [E, `src/render/view.ts:59-62,1400-1403`; `main.ts:100`]. Confirma, com a linha atual, o achado já registrado em `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6.2 item 1: na URL padrão, WarGreymon aparece a 1× (conteúdo ~36 px), não a 72 px.
- **Y-sort:** lista de entidades visíveis ordenada por `y` (posição no mundo), com `order` como critério de empate [E, `view.ts:514`: `list.sort((a, b) => a.y - b.y || (a.order < b.order ? -1 : 1))`] — depende do pivô no pé (§1.3) estar correto; não há Y-sort "por camada" separado do mapa.
- **Save:** a chave de save é `SAVE_KEY = "gs003.world.save"` [E, `src/save/save.ts:12`] — único ponto de persistência local; qualquer isolamento do laboratório precisa garantir que nenhuma rota/flag nova leia ou grave essa chave (AGENTS.md §5, "preserve save e compatibilidade").

---

## 2. Proposta de isolamento para as 3 versões

| Critério | (a) Rotas/flags no mesmo build | (b) 3 builds estáticos separados (`lab-a/`, `lab-b/`, `lab-c/`) | (c) 3 branches `lab/etapa6-a\|b\|c` |
|---|---|---|---|
| **O que muda no código** | Novo alias (`@etapa6-lab`), novo glob em `creatures.ts`/`tiles.ts`/`tamer-presets.ts` **condicional** à flag, nova entrada em `MAPS` por `?lab=a\|b\|c`, nova cena/overlay de teste (M4) | Mesmo código-base (a branch `quality-overhaul`), mas **3 configurações de build distintas** (3 `vite.config` ou 3 variáveis de ambiente), cada uma apontando `@game-assets`/novo alias para a pasta do método, gerando 3 `dist/` separados | 3 branches a partir de `quality-overhaul`, cada uma com os assets do seu método já dentro de `assets/GAME-ASSETS` (ou pasta própria), sem flag nem alias extra — o próprio checkout já é a versão |
| **Risco ao jogo principal** | **Médio.** O glob `eager: true` empacota **tudo que casa com o padrão** no mesmo bundle de produção (`src/assets/creatures.ts:127-150`) — os assets dos 3 métodos (Tamer + 9 Digimon × 3 ≈ 30 personagens) entrariam no **mesmo** `dist/` que o jogo principal usa, mesmo que só visíveis atrás de `?lab=`. Aumenta o bundle, o tempo de build e a superfície de "algo aparece onde não devia" se a flag falhar | **Baixo.** Cada build só inclui os assets do seu próprio método (se o alias de cada build apontar só para a pasta daquele método) — o jogo principal nunca carrega nada do laboratório, porque é um `dist/` diferente, publicado num destino diferente | **Baixo.** Mesma lógica de (b): cada branch, buildada e publicada separadamente, nunca mistura assets no mesmo bundle. Diferença de (b): o isolamento é por histórico git, não por config de build |
| **Esforço de implementação** | **Alto.** Precisa de: alias novo, 3 globs condicionais, `MAPS` com 3 entradas novas (piloto 40×30 × 3), M1 (generalizar importador) **ou** montagem manual do mapa-piloto para os 3, M2 (importador de personagem genérico) para os Digimon/Tamer novos, e a flag `?lab=` tem de desviar corretamente de `DEFAULT_MAP`/`MAPS`/catálogo sem quebrar a URL padrão | **Médio.** Mesmo M1/M2 são necessários (a arte ainda precisa entrar no formato do motor), mas **não** precisa de flag nova nem de glob condicional — é o mesmo código de hoje, só apontado para pastas diferentes em 3 execuções de build | **Médio**, igual a (b) em código; **mais esforço de processo** (3 branches para manter sincronizadas com qualquer correção de bug comum ao motor, risco de divergência se o motor evoluir enquanto os 3 labs existem) |
| **Reversibilidade** | **Alta** se tudo ficar atrás de flag nunca ativada por padrão — mas como o código (glob, alias, `MAPS`) muda na **mesma** branch de produção, desfazer depois exige reverter commits misturados com o trabalho real do Comando 3 em diante | **Alta.** Apagar as 3 pastas `lab-*/` e as 3 configs de build não toca em nenhum arquivo do jogo principal | **Alta.** Apagar os 3 branches não toca em `quality-overhaul`. É o mais fácil de "nunca ter existido" |
| **Proteção do save `gs003.world.save`** | **Precisa de cuidado explícito** — se o laboratório roda na mesma origem/porta que o jogo principal (mesmo `localStorage`), uma sessão de teste pode gravar ou ler o save real por engano, a menos que a flag force um save próprio (`gs003.world.save.lab<X>`) ou desative o save (M4 já propõe isso) | **Protegido por padrão** — origem/porta diferente (ou pasta estática diferente servida separadamente) normalmente significa `localStorage` separado (a chave é por origem no navegador); ainda assim, se publicado na mesma origem Vercel (ex.: `/lab-a/`), o `localStorage` é compartilhado — mesmo cuidado de (a) se for esse o caso | **Protegido por padrão**, pela mesma lógica de (b); o mesmo cuidado se publicado na mesma origem |
| **Cada link permite mover o Tamer, ver os Digimon, explorar, avaliar animação/câmera/escala/colisão/ambientação?** | **Sim**, em princípio — mas é o **mesmo motor e a mesma build** que o jogo principal, incluindo todo o combate/evolução/boss já implementado; **exige disciplina extra** para garantir que a flag não ligue, por acidente, um sistema de combate novo, boss ou evolução (proibidos nesta rodada) | **Sim** — e, por ser um build próprio, é mais fácil **remover** código de combate/boss/evolução do bundle do laboratório (ou nunca incluí-lo), em vez de só "não expor" | **Sim** — mesma vantagem de (b): cada branch pode remover ou nunca copiar sistemas de combate/boss/evolução, não só ocultá-los por flag |

### Recomendação

**Recomendo (b) — 3 builds estáticos separados**, com o código (motor, loaders, importadores) vindo de uma branch comum (pode até ser a própria `quality-overhaul`, sem criar branches novas) e só a pasta de assets/config de build variando por método. Motivo:

1. É a opção com **menor risco ao jogo principal**: o bundle do jogo principal nunca inclui os ~30 personagens e os 3 mapas do laboratório, porque são builds `dist/` diferentes.
2. É **mais barata que (c)** em esforço de processo: não exige manter 3 branches sincronizadas com o motor comum (qualquer correção no motor beneficia os 3 builds automaticamente, se o build script for parametrizado por pasta de assets em vez de por branch).
3. Resolve a **proteção do save** quase de graça: publicando cada build num path/subdomínio próprio (ex.: `lab-a.`/`lab-b.`/`lab-c.` ou `/lab-a/`, `/lab-b/`, `/lab-c/` em origens Vercel distintas), o `localStorage` fica isolado por origem — sem precisar inventar uma chave de save alternativa no código.
4. Ainda precisa de **M1 (generalizar o importador OU montar o mapa-piloto à mão)** e de **M2 (importador de personagem genérico)** — isso é comum às 3 opções, não é economizado por nenhuma delas.
5. **Não** precisa de M4 no sentido original (flag `?lab=` dentro do jogo principal) — a "flag" vira simplesmente "qual pasta de assets este build usa", decidida em tempo de build, não de URL. Isso **reduz** o risco listado em M4 (algo escapar para o jogo principal por engano).

**Quando (a) ou (c) fariam mais sentido:** (a) seria preferível só se o objetivo fosse comparar os 3 métodos **dentro da mesma sessão de jogo** (ex.: um switcher ao vivo, sem reload) — não é o caso aqui (o objetivo é 3 links separados). (c) seria preferível se o fundador quisesse rastrear a história de cada método em commits próprios, independente do jogo principal — mas isso é uma preferência de processo de versionamento, não uma necessidade técnica desta rodada.

---

## 3. Onde hospedar os 3 links

| Opção | Como funciona | Risco de PI | Observação |
|---|---|---|---|
| **Localmente (via `portal`/localhost)** | `npm run dev` ou servir o `dist/` de cada build numa porta própria (ex.: 5190 `qo` já é a porta do jogo principal — os 3 labs precisariam de 3 portas novas, ex. 5191/5192/5193), expostas via a ferramenta `portal` deste ambiente | **Nenhum.** Nada sai do host; é o mínimo risco possível | Não dá 3 "links" no sentido de URL pública persistente — dá 3 túneis/portas que dependem da sessão estar ativa. Serve para avaliação interna (fundador, game-qa), não para um link permanente |
| **Homologação interna (prévia Vercel, mesma conta do jogo)** | 3 deploys separados (ex.: 3 "projetos" Vercel ou 3 branches de preview), publicados via API REST (único caminho disponível, já que npm/GitHub estão bloqueados neste host) | **Médio.** Sai do host local para a internet pública (mesmo que "não divulgado", uma URL `*.vercel.app` é, por padrão, acessível por quem tiver o link — não há garantia de index privado só por não divulgar) | Mesma limitação já registrada no contexto desta tarefa: `*.vercel.app` não abre a partir deste host para verificação — qualquer deploy aqui precisaria de confirmação externa (fundador ou outro ambiente) de que os links carregam |
| **Homologação interna, mas com proteção de acesso (senha/allowlist do Vercel, se o plano permitir)** | Mesmo deploy acima, com uma camada extra de autenticação antes de servir o conteúdo | **Baixo-médio.** Reduz o risco de acesso não autorizado, mas **não elimina** o risco de PI do conteúdo em si (Digimon reconhecíveis, nomes, locais da franquia) — só reduz quem pode ver | Depende de recurso do plano Vercel atual, não verificado nesta tarefa [NV] |
| **Prévia Vercel pública, sem proteção** | Deploy normal, sem senha | **Alto.** Combina a exposição pública de um link ativo com o conteúdo de maior risco de PI da etapa (elenco Digimon reconhecível, Tamer, ambientação de File Island) — exatamente o cenário que o AGENTS.md §2 e o ADR-015 ("nenhuma publicação sem decisão específica") instruem a não fazer sem aprovação | Esta é a opção que o próprio ADENDO §1 e §7 do Comando 3 já marcam como exigindo aprovação específica — não é uma opção neutra |

**A decisão é do fundador** (AGENTS.md §1: "sem aprovação do fundador, nunca... publicar"). Minha leitura técnica: **localmente/portal** é o único caminho com risco zero de PI, mas não entrega "link" persistente fora da sessão; **homologação interna protegida** é o meio-termo mais defensável se o fundador quiser um link que sobrevive entre sessões; **prévia pública sem proteção** é a opção de maior risco e deveria vir só depois de os métodos A/B/C estarem prontos e o fundador decidir explicitamente publicar, nunca por omissão.

---

## 4. Formato de entrada que cada método precisa entregar ao motor

| Elemento | Formato exigido pelo motor hoje | Quem teria de produzir nesse formato |
|---|---|---|
| **Manifesto** (`creature.json`/`tamer.json`/`character.json`) | JSON com `id`, `dimensions`, `pivot`, `directions`, `animations`, `combatStates` (Digimon), `schemaVersion: 2` [E, `creatures.ts:29-66`] | O método que produzir a arte não entrega isso nativamente (nem A, nem B, nem C) — é sempre um passo de conversão humano/script (A7-A8 de `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6.4, ou o equivalente de M2 para B/C) |
| **Spritesheet** | Folha + `atlas.json` JSON Hash com `frame` e `pivotPx` por quadro [E, `creatures.ts:69-70`], **ou** 1 PNG por quadro nomeado por `atlasKey` | A folha que `export_asset(format="spritesheet")` do PixelLab devolve **não** está nesse formato — precisa de conversão (M2). O Aseprite exporta "Sprite Sheet → JSON Hash" nativamente, compatível com pouca adaptação |
| **Pivô** | No pé, por quadro, em px do quadro [E, R3] | Nenhuma ferramenta externa calcula isso automaticamente para o formato do motor — é sempre medido (bounding box opaco mais baixo) no passo de conversão, como o `import-tamers-v13.mjs` já faz hoje |
| **Colisão separada do visual (E5)** | `radiusByStage`, só por estágio numérico de jogo, em `world-species.json` [E, §1.4] | **Nenhum método precisa produzir nada aqui** — é dado de jogo, não de arte; a Rota 1 (já em vigor) significa que a escala visual de E5 não altera a colisão. Se as 9 espécies do laboratório não tiverem entrada em `world-species.json`, precisam ganhar uma (estágio de jogo 1–5, por analogia, como a própria `ESCALA_E5_POR_ESPECIE_V1.md` §2 já propõe) — isso é dado, não asset visual |
| **Tamer em camadas ou preset** | O motor **não lê camadas em tempo real** — lê sempre um preset já composto (PNG final por direção/quadro) [E, confirmado por não haver nenhum código de composição de camadas em `tamer-presets.ts`, que só monta `walk`/`idle` a partir de PNGs já prontos]. `ESPECIFICACAO_TAMER_PERSONALIZAVEL_V1.md` §9 já havia notado isso para o PixelLab (sem ferramenta nativa de camada); aqui confirmo que o **motor em si** também não tem composição de camadas em runtime | Qualquer método (A/B/C) que produza camadas reais (corpo, roupa, cabelo separados) precisaria de **um passo extra de composição** antes de entrar no jogo — achatar as camadas num preset final, ou escrever um compositor de runtime novo (fora do escopo desta rodada; nenhum dos 3 links precisa disso: o briefing já aceita "preset completo" como equivalente, §1.1 do briefing) |
| **Mapa em `.tmj` ou export do PixelLab** | `.tmj.json` + `.aliases.json` no formato de `sim/map.ts` [E, §1.2] | Export do PixelLab **não entra direto** — precisa do importador (M1, hoje só funciona para v15b) ou de montagem manual (Tiled/Map Factory, caminho já usado em 5 dos 6 mapas atuais, não depende do PixelLab) |

---

## 5. Mudanças de código necessárias (só listadas e estimadas, nada implementado)

Ordem de dependência (cada item pressupõe os anteriores, salvo indicação contrária):

| # | Mudança | Depende de | Estimativa [H] | Necessário para o **1º link** funcionar? |
|---|---|---|---|---|
| **M2** | Importador de personagem genérico: ZIP do `export_asset`/folha Aseprite → `creature.json`/`tamer.json` + atlas, com pivô medido no pé (como `import-tamers-v13.mjs` já faz, generalizado para qualquer entrada) | Nenhuma | 1 dia | **Sim — é o item mínimo.** Sem ele, nenhum Digimon/Tamer novo de nenhum método entra no jogo, de nenhuma forma |
| **M1-lite** | Montagem manual do mapa-piloto 40×30 (ou do recorte reduzido) em `.tmj`/`.aliases`, pelo caminho que **já funciona hoje sem o importador do PixelLab** (Tiled/Map Factory, usado em 5 dos 6 mapas atuais) | Nenhuma (alternativa a M1 completo) | 0,5–1 dia por versão do mapa (×3 métodos, se cada um tiver seu próprio mapa) OU 0,5–1 dia uma vez, se os 3 métodos **compartilharem** o mesmo mapa base e só o elenco de personagens mudar (ver nota abaixo) | **Sim, se for o caminho escolhido** — é mais rápido para o 1º link do que M1 completo |
| **M1 (completo)** | Generalizar `import-pixellab-map.mjs`: id/pasta por argumento, N tilesets Wang encadeados, ponte/portal lidos dos objetos em vez de linha fixa | Nenhuma | 1–2 dias | **Não, só se o Método B/C quiser usar o Map Workshop do PixelLab para o mapa-piloto em vez de montagem manual** — mais caro que M1-lite para o objetivo mínimo de "1 link jogável" |
| **Entrada em `world-species.json`** | Adicionar as 9 espécies do elenco (ou as que faltam) com `stage` (estágio de jogo 1–5, por analogia, como `ESCALA_E5_POR_ESPECIE_V1.md` §2 propõe) | Nenhuma | <0,5 dia (dado, não código novo — é editar um JSON existente, sem mudar lógica) | **Sim**, para qualquer Digimon do elenco que ainda não tenha entrada (hoje confirmado: WarGreymon tem `stage: 5`; os demais prioritários "usam `pack` do protótipo idle", conforme `ESCALA_E5_POR_ESPECIE_V1.md` §2) |
| **Config de build por método (b)** | 3 variáveis de ambiente/configs de `vite.config.ts` apontando o alias de assets para `etapa6-lab/<método>/` em vez de `@game-assets` padrão, SEM flag nem rota nova no jogo principal | M2, mapa pronto | 0,5 dia | **Sim** — é o que torna o build do laboratório isolado do jogo principal (§2) |
| M3 | Script de checklist automático (I-01 a I-06, I-09, I-10, I-14) | M2 | 0,5–1 dia | Não — é verificação, não bloqueia o link existir, só a nota de qualidade (game-qa) |
| M4 (se a opção (a) for escolhida em vez de (b)) | Rota/flag `?lab=A\|B\|C` dentro do jogo principal | M2, M1-lite, alias novo, glob condicional | 1–2 dias (mais caro que a config de build de (b), porque precisa garantir que a flag nunca ative por acidente e não vaze para o `dist/` padrão) | Não recomendado como caminho mínimo — ver §2 |
| M5 | Tamer em 8 direções (`DIRS4` → `Dir8`) | Nenhuma | 0,5 dia | **Não.** O briefing já fixa 4 direções como MVP (`BRIEFING_UNICO_LAB_A_B_C.md` §1.1); só necessário se o fundador decidir usar as diagonais |

### Mínimo para o 1º link funcionar

**M2 (importador de personagem genérico) + M1-lite (mapa montado à mão, não via importador do PixelLab) + entrada em `world-species.json` para as espécies que faltarem + a config de build isolada (b)** — nessa ordem, **M2 primeiro** (sem ele nenhum personagem de nenhum método entra, independente do mapa). Estimativa somada: **~2–3 dias** para o 1º link ter Tamer andando + 1 Digimon visível + 1 mapa (mesmo que reduzido, não o 40×30 completo) — o mapa completo 40×30 e o elenco inteiro (9 Digimon) podem vir depois, incrementalmente, sem bloquear a existência do 1º link.

**Nota sobre compartilhar o mapa entre os 3 métodos:** se os 3 métodos produzirem **o mesmo layout 40×30** (como o briefing exige, "mesmo layout, condições equivalentes"), mas cada um com sua própria arte de tileset/props, então M1-lite monta **a estrutura do `.tmj`** (células, colisão, Y-sort, objectgroup) **uma única vez**, e cada build (b) só troca **qual PNG de tileset/prop** é referenciado — o que reduz o esforço de M1-lite de "×3" para "×1 estrutura + 3 trocas de PNG", desde que os 3 métodos respeitem o mesmo recorte de células acordado no briefing.

---

## 6. Roteiro de teste por link (mesmas condições nos 3)

### 6.1 Spawn

- Posição inicial fixa, igual nos 3: célula de entrada (S), coordenada (16, 30) do layout-brief (`BRIEFING_UNICO_LAB_A_B_C.md` §2.1) — a mesma para A, B e C, para que nenhuma diferença de ponto de partida contamine a comparação.
- Confirmar, antes de qualquer captura: o Tamer aparece, não há erro no console, não há "chave faltando" no `packSummary` (I-16).

### 6.2 Trajeto padrão

- Percurso fixo: S → T (trilha) → C (clareira de descanso) → M (mata densa) → P (ponte) → R (margem do rio, zona de exibição) → Z (santuário) — o mesmo caminho descrito no layout-brief (§2.1 da `BRIEFING_UNICO_LAB_A_B_C.md`), percorrido **na mesma ordem** nos 3 links.
- Sem atalhos: se um método não tiver ainda todos os POIs implementados, registrar onde o trajeto para, não inventar um caminho alternativo só para aquele link.

### 6.3 Capturas na mesma posição

- Captura obrigatória em cada POI do trajeto (6 pontos: S, T, C, M, P, R/Z), com a **mesma posição de câmera relativa ao Tamer** (mesmo `?charh=`, mesmo `?dpr=`, mesmo `?zoom=` se usado) nos 3 links — qualquer diferença de enquadramento entre métodos deve vir da arte, não da configuração de câmera.
- Captura adicional na zona R/Z: 1 enquadramento mostrando o Digimon de maior porte do elenco (WarGreymon ou Kuwagamon, conforme o que cada método tiver implementado) assim que ele entra no campo de visão, para a checagem de oclusão (métrica N1 de `ESCALA_E5_POR_ESPECIE_V1.md` §7.5).

### 6.4 Medição de FPS

- **Hoje não medido em lugar nenhum do projeto** — `DIAGNOSTICO_TECNICO_1.0.md` §I.7 já registra FPS como `[NV]`, confirmado aqui sem mudança. Proposta: medir com o contador de frames do próprio navegador (DevTools Performance) ou um contador `?debug` simples no overlay — **não existe hoje** (seria uma mudança de código adicional, fora da lista de M1-M5, de baixo custo: expor `requestAnimationFrame` delta como texto na tela, atrás de flag).
- Protocolo mínimo: medir FPS parado (idle, 10 s) e FPS em movimento no trecho M (mata densa, zona de maior densidade de árvores/props) — comparar os 3 links no mesmo trecho.

### 6.5 Checklist da Dimensão 3 (navegação)

Reaproveitar diretamente o roteiro e as métricas já definidos em `AJUSTES_RUBRICA_VISUAL_V1.md` §3 (que esta é exatamente a "execução real" que a Dimensão 3 esperava):
- Roteiro de 5 passos (§3.1 do AJUSTES): entrada livre, sem instrução, observador registra hesitação/retrocesso/descoberta de B1/B2, pergunta dirigida ao final.
- 7 métricas (§3.2 do AJUSTES): tempo até 1º POI (3.1), nº de retrocessos não intencionais (3.2, **bloqueante se >0**), hesitações (3.3), descoberta espontânea de B1/B2 (3.4), percepção de hierarquia de porte (3.5, **bloqueante se a maioria errar**), oclusão percebida (3.6, **bloqueante se ≥1 relato**), tempo total do percurso (3.7).
- Acrescentar as 4 métricas específicas de porte de `ESCALA_E5_POR_ESPECIE_V1.md` §7.5 (N1–N4): oclusão por outra criatura (N1, bloqueante se <100%), distância de 1ª percepção (N2, registro), relato de bloqueio por criatura confinada (N3, bloqueante se ≥1), tempo de reação à criatura grande (N4, registro).
- Mínimo recomendado: 3 testadores por link (`AJUSTES_RUBRICA_VISUAL_V1.md` §3.1 item 5), nas mesmas condições (mesmo trecho, mesma pergunta dirigida) entre A, B e C.

### 6.6 Critério de "versão jogável" (imagem estática não conta)

Uma versão só é "jogável", para efeito desta homologação, se **todos** os itens abaixo forem verdadeiros — repetindo e tornando operacional a exigência do ADENDO §4 ("nenhuma versão poderá ser considerada concluída apenas por apresentar imagens estáticas"):

1. **Input real:** o Tamer se move pelo teclado/input do jogo (não é uma imagem nem um GIF pré-gravado) — verificável simplesmente jogando.
2. **Colisão funcional:** o Tamer não atravessa árvore/água/estrutura sólida (I-15 da checklist técnica).
3. **Pelo menos 1 Digimon do elenco visível e animado** (não estático) em algum ponto do trajeto — cumpre `idle` ou `walk`, não precisa ser combate (combate é proibido nesta rodada).
4. **O trajeto S→Z (ou até onde o método tiver implementado) é percorrível sem erro no console e sem placeholder de chave faltando** (I-16).
5. **Y-sort funcionando**: o Tamer passa visualmente atrás/na frente de pelo menos 1 prop vertical (árvore, estrutura) de forma correta ao longo do trajeto — não é suficiente estar "parado numa pose boa", precisa demonstrar profundidade em movimento.
6. **FPS mensurável e reportado** (ainda que baixo) — "não sabemos o FPS" não é aceitável como entrega de versão jogável; é aceitável relatar um FPS baixo, não é aceitável não medir.

Um link que cumpra só 1–5 mas falhe em 6, por exemplo, é "jogável com ressalva" (métrica não coletada); um link que falhe em qualquer um de 1–5 não é "versão jogável", é "demonstração estática ou parcial", e deve ser nomeado assim no relatório, não "versão jogável" por aproximação.

---

## 7. Riscos técnicos

| Risco | Descrição | Mitigação proposta [H] |
|---|---|---|
| **Vazamento de assets do laboratório para o bundle do jogo principal** | Se a opção (a) ou qualquer glob `eager: true` apontar, mesmo que por engano, para dentro de `@game-assets`, os ~30 personagens do laboratório entram no `dist/` publicado do jogo principal, aumentando o bundle e criando risco de aparecer fora de contexto | Opção (b)/(c) (§2); se (a) for escolhida mesmo assim, usar um alias **separado** (nunca `@game-assets`), nunca apontar o glob do laboratório para dentro da pasta do jogo principal, e um teste de build que falha se o `dist/` do jogo principal crescer além de um limiar (ex.: +5% de tamanho) sem justificativa |
| **Save compartilhado entre laboratório e jogo principal** | Se o laboratório rodar na mesma origem/porta do jogo principal, o `localStorage` (chave `gs003.world.save`, `save.ts:12`) pode ser lido/sobrescrito por engano por uma sessão de teste | Publicar cada build do laboratório numa origem/subcaminho diferente (§2, §3); se for inevitável a mesma origem, usar uma chave de save diferente só para o laboratório (nunca a mesma `SAVE_KEY`) e testar explicitamente que salvar no laboratório não altera o save do jogo principal |
| **Importador do PixelLab fixo na v15b usado por engano no mapa-piloto** | Rodar `import-pixellab-map.mjs` sem adaptação sobre o export do mapa-piloto (tileset de nome diferente, 3-4 terrenos, ponte em linha diferente) produz erro (`throw new Error`, linhas 108/122) ou, pior, um `.tmj` com a ponte na célula errada sem erro visível, se por acidente a linha 17 coincidir com água em algum ponto do novo mapa | M1 (generalizar) antes de usar o importador no mapa-piloto, OU M1-lite (montagem manual), que não tem esse risco porque não passa pelo script fixo |
| **Tamer com 8 direções geradas, só 4 usadas** | Qualquer método que gere/anime 8 direções do Tamer gasta esforço (produção manual ou geração PixelLab) sem efeito em jogo, porque `DIRS4` descarta as diagonais (`tamer-presets.ts:9`) | Repetir no briefing de produção (já está em `BRIEFING_UNICO_LAB_A_B_C.md` §1.1) que o MVP é 4 direções; só produzir 8 se M5 for implementado antes |
| **Colisão (Rota 1) dissociada da escala visual (E5) surpreender no playtest** | Um Digimon "Grande/Gigante" com silhueta de 46–88 px de largura, mas raio de colisão de só 22–30 px, pode "deixar passar" o Tamer visualmente por dentro do próprio corpo do Digimon, antes de qualquer decisão sobre a Rota 2 | Já registrado como efeito colateral esperado em `ESCALA_E5_POR_ESPECIE_V1.md` §2 — não é um bug a corrigir nesta rodada, é um achado a relatar nas métricas N1-N4 (§6.5) para o fundador decidir se aceita ou pede a Rota 2 em etapa futura |
| **FPS e memória nunca medidos com o elenco completo (30 personagens × 3 builds)** | Sem medição prévia, um build do laboratório pode ter desempenho muito pior que o jogo principal sem que ninguém saiba até o playtest | Medir FPS desde o 1º link (§6.4), não deixar para o último; se o 1º link já mostrar FPS baixo, é sinal de alerta antes de investir nos outros 2 |
| **Deploy de prévia Vercel não verificável a partir deste host** | `*.vercel.app` não abre a partir do host de execução — um deploy feito aqui não pode ser auto-confirmado como "carrega corretamente" sem ajuda externa (fundador, outro ambiente) | Qualquer deploy de homologação precisa de confirmação externa antes de ser reportado como "funcionando"; não declarar sucesso só porque a API REST de deploy retornou 200 |
| **Conflito entre 3 builds e "um agente/uma tarefa por vez"** | Produzir e testar 3 builds em paralelo (A, B, C) poderia tentar rodar como 3 frentes simultâneas, violando a regra do fundador até a homologação da Etapa 6 | A ordem de execução já está fixada no ADENDO §7 e repetida em `BRIEFING_UNICO_LAB_A_B_C.md` §5: A só após o ZIP do ChatGPT ser avaliado; B só após orçamento PixelLab autorizado; C só após A e B terem resultado aproveitável — isso já impõe sequência, não paralelismo, sem precisar de regra nova |

---

## 8. Limitações desta entrega

1. Nenhum código foi alterado, nenhuma rota/branch criada, nenhum commit feito — tudo acima é leitura do código real (commit `3289e32`, `git status` limpo antes e depois) e proposta, como pedido pela tarefa.
2. A estimativa de "2-3 dias para o 1º link" (§5) é [H] — soma de estimativas já registradas em `COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6.6 mais o M1-lite novo proposto aqui; nenhuma delas foi medida por execução real.
3. Não verifiquei se o plano Vercel atual do estúdio suporta deploy protegido por senha/allowlist (§3) — fica como `[NV]`, a confirmar por quem tiver acesso ao painel Vercel.
4. Não medi FPS nem memória real do jogo atual nesta sessão (proibido alterar/rodar nada que grave arquivo) — a seção 6.4 propõe o protocolo, não executa nenhuma medição.
5. A opção de compartilhar a estrutura do mapa entre os 3 métodos (nota no fim de §5) depende de os 3 métodos realmente produzirem a **mesma** divisão de células do layout-brief — se um método entregar um recorte de mapa incompatível (outra forma, outras coordenadas de POI), a economia de esforço prevista não se realiza, e M1-lite precisaria ser repetido por método.
6. Este documento não decide nem recomenda qual dos 3 métodos (A/B/C) é melhor — isso é o objetivo da rodada ainda não autorizada, não deste plano de isolamento técnico.
7. A decisão de onde hospedar (§3) e se/quando publicar fica explicitamente com o fundador, conforme AGENTS.md §1 e o ADENDO do Comando 3; este documento só compara risco, não escolhe.
