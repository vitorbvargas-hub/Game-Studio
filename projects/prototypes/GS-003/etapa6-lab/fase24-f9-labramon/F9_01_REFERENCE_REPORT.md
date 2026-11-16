# F9_01 — Reference Report: Labramon (Fase 0)

Digital Odyssey (GS-003) · F9 Labramon Complete Production · Fase 0 (inventário + Knowledge Base) · **2026-11-15** (BRT) · Autor: `game-research` (Opus 5.5) · Comando: `COMANDO_F9_LABRAMON.md` §4 · Protocolo: `shared/knowledge/GS-003-DIGIMON-REFERENCE-GATE.md` (GD-072).
Fan game não oficial e não licenciado; uso interno; nada publicado. Labramon é espécie oficial (Bandai/Toei); as imagens em `refs/` são referência com crédito (`refs/FONTES.md`), não asset.

Legenda: **[E]** evidência com fonte e data · **[H]** hipótese/leitura minha · Categoria da fonte: 1 oficial · 2 oficial de continuidade · 3 wiki · 5 inferência.
**Nada foi gerado no PixelLab.** Única chamada PixelLab: `get_balance` (leitura, custo 0).

---

## 1. Inventário das fontes do pipeline

Repositório raiz: `/home/openclaw/projects/GameStudio`, branch **`master`**, HEAD **`f02fbab`** (2026-11-13 17:35, "Etapa 6 C4–C5…"). A árvore tem muito material **não commitado** (ver coluna Estado). [E, `git status`, 2026-11-15 22:55]

| # | Fonte | Caminho | Branch / commit | Estado | Observação |
|---|---|---|---|---|---|
| 1 | Repositório Game Studio | `~/projects/GameStudio` | `master` @ `f02fbab` | Modificados: `.gitignore`, `etapa6-lab/PROGRESS.md`, `PROJECT_LOG.md`, ADR-007, ADR-010, `DIGITAL_ODYSSEY_CONTEXT.md`. Não rastreados: `etapa6-lab/fase6…fase24` inteiras, `assets/GAME-ASSETS/*` | **Risco:** as fases 6–24 (incl. Hawkmon v2 e esta F9) não estão em nenhum commit |
| 2 | Knowledge Base GD-066 (DigimonDex, WorldDex, AnimeDex) | worktree `workspaces/game-research/kb-gs003`, pasta `projects/prototypes/GS-003/knowledge-base/` | `feat/gs003-knowledge-base` @ `0923a6d` (2026-11-14 12:39) | Lote-piloto `0.1.0-pilot`. Pendente local: `scripts/build_kb.py` modificado; `extract_species_pages.py` e `sources/index_extracts/species_pages/` não rastreados (lote C1 em andamento, não commitado) | Ver §1.1 |
| 3 | DigimonDex | `knowledge-base/digimondex/` (`catalog.json` 1.628 espécies, `species/`, `evolutions/`, `visual-references/`) | idem | Labramon existe só como **índice**: `sp.labramon`, `record_status: imported_index`, nível e atributo `pending`, `priority: unassigned`, sem ficha nem REF-01..05 | Esta F9 fecha a lacuna fora da KB (ver §8) |
| 4 | WorldDex | `knowledge-base/worlddex/` (`regions/adventure_01_file_island*.json`, `maps/costa_do_despertar.json`, `environments/README.md`) | idem | Piloto: 19 regiões, 1 mapa | Não tem nada sobre Labramon (esperado) |
| 5 | AnimeDex | `knowledge-base/animedex/` (`seasons/adventure_01*.json`, `episodes/adventure_01.*`, `events/README.md`) | idem | Piloto: 54 episódios de Adventure (1999), 13 sinopses | Labramon não aparece em Adventure 1999; as aparições estão no filme de Tamers, *Adventure:* (2020) e *Ghost Game* — fora do piloto |
| 6 | Reference Gate GD-072 | `shared/knowledge/GS-003-DIGIMON-REFERENCE-GATE.md` (texto central) e cópia `knowledge-base/agent-rules/…` | central: **não rastreado** no `master`; cópia: commit `0923a6d` | **Divergem** em 1 linha (linha 6): a central diz "EM VIGOR desde 2026-11-14"; a cópia da KB ainda diz "não está em vigor até a instalação". Vale a central (mais recente, citada no contexto comum §4.1) | Divergência registrada para o `game-studio` |
| 7 | `METODO_CHATGPT_PIXELLAB_v1.md` | `etapa6-lab/fase22-hawkmon-estilo-chatgpt/` (4.024 B, 2026-11-15 22:16) | não rastreado | "Sprite Production Standard 1.1, proposta", **não homologado**; Vitor aprovou como padrão 1.1 provisório (brief F9) | Etapa 0 do método = este relatório |
| 8 | Hawkmon C15a | `fase22…/BRIEF_C15A_LIMPEZA_ROTACOES.md`, `RELATORIO_C15A.md`, `rotacoes/hawkmon_c15a_{S,N,E,W}.png` | não rastreado | Concluído | Limpeza das 4 rotações do ChatGPT |
| 9 | Hawkmon C15b (+C15b-2) | `fase22…/BRIEF_C15B_ANIMACAO.md`, `RELATORIO_C15B.md`, `pacote_hawkmon_v2/` | não rastreado | Concluído: walk 8q + idle 4q × 4 direções; 11,45 + 2,3 ger | Personagem PixelLab `a3dc7c3d-e63a-43f0-a4d7-dadc124417fc` |
| 10 | Hawkmon C15c | `fase22…/BRIEF_C15C_CORRECOES.md`, `pacote_hawkmon_v2_pre_c15c/` | não rastreado | Brief existe e há backup "pre_c15c"; **não achei relatório C15c** | [H] correções aplicadas sobre `pacote_hawkmon_v2/`; não conferido |
| 11 | QA independente Hawkmon v2 | `etapa6-lab/fase23-c14-4-f5/QA_HAWKMON_V2_INDEPENDENTE.md` (2026-11-15 22:08) | não rastreado | **Média 7,78/10** (régua de 8 critérios; fidelidade 7,0; consistência anatômica 6,5); não homologado | QA anterior (v1b): `fase21-build-hawkmon/QA_BUILD_HAWKMON_INDEPENDENTE.md` |
| 12 | Build Hawkmon (lab) | worktree `workspaces/game-dev/lab-hawkmon` | `lab/hawkmon-v1b` @ `01f82b8` (2026-11-15 21:49, C14.4-B) | Limpo, exceto `node_modules` não rastreado | Porta 5197 |
| 13 | Ferramentas e manifestos PixelLab | MCP `pixellab` (ativo); scripts `fase20-f8b-hawkmon/*/scripts*/` (Python), `pacote_hawkmon_v2/pacote.json`; scripts C15b em `workspaces/game-art/tmp-c15b/scripts/` (workspace, fora de entrega) | — | MCP respondeu. **Saldo 545,40 gerações** (Tier 1, renova 2026-12-11), `get_balance` 2026-11-15 ~23:05 | Teto F9 = 60 ger, piso 485 (brief) |
| 14 | Fichas de anatomia (Gate) | `etapa6-lab/fase11-fichas-anatomia/` (Agumon, Gomamon, Ikkakumon, `MODELO_FICHA.md`) | não rastreado | Não há ficha do Labramon | Este relatório faz o papel da ficha |

### 1.1 Estado da Knowledge Base (verificado, não assumido)
- [E] `manifest.json`: versão `0.1.0-pilot`, gerado 2026-11-14; 1.628 espécies importadas, só 82 com nível e atributo, 19 P0, 5 espécies com 5 refs presentes, 0 com 5 refs verificadas, 12 conflitos abertos.
- [E] `PROGRESS.md` da KB: último item aberto = "aprovação do fundador para os próximos lotes (R1, C1, C2)". O cache local do lote C1 (`workspaces/game-research/kb_cache/pages/sp.labramon.json`, lido do Wikimon em 2026-11-14 12:57) **existe**, mas o extrato `species_pages/l.json` não tem Labramon. Conclusão: **a KB não está pronta para o Labramon**; os dados abaixo vêm da pesquisa desta Fase 0.

---

## 2. DIGIMON-REFERENCE-REPORT (formato do Gate, Etapa D)

```
DIGIMON-REFERENCE-REPORT
1. Espécie e forma: sp.labramon · Labramon (ラブラモン, Raburamon) · child (EN oficial: Rookie) · forma base (sem variante X-Antibody conhecida usada aqui)
2. Fontes consultadas: §3 (2 oficiais cat. 1, 1 oficial de continuidade cat. 2, Wikimon cat. 3)
3. Referências visuais: REF-01 present (verified_primary) · REF-02 present (verified_secondary) · REF-03 present (verified_secondary) · REF-04 present parcial (verified_secondary) · REF-05 present (verified_primary/cat. 2)
4. Características obrigatórias: §5.2
5. Divergências entre fontes: §6
6. Direção de arte proposta: fora do escopo da Fase 0 (é da Fase 1, game-art); insumos em §7
7. Animações necessárias: definidas no COMANDO F9 (Fases 4–8); notas de espécie em §7
8. Riscos: §9
9. Critérios de homologação: §5.2 vira checklist de identidade para o QA (Fase 10)
```

Nível mínimo de evidência do Gate (REF-01 presente + 1 vista de corpo inteiro em outro ângulo): **atingido** (REF-01 + folha de modelo Toei com vista lateral em pé + sprite de V-pet lateral + sprite 3/4 do Digimon RPG). **Lacuna:** não há vista **de costas** oficial (ver §8).

---

## 3. Identificação e fontes (Gate, Etapa A)

| Campo | Valor | Fonte | Cat. | Status | Acesso |
|---|---|---|---|---|---|
| Nome JP / romanização | ラブラモン / Raburamon | digimon.net/reference (JP) | 1 | verified_primary | 2026-11-15 |
| Nome EN | Labramon (o mesmo na dublagem) | digimon.net/reference_en; Wikimon `dub=Labramon` | 1 / 3 | verified_primary | 2026-11-15 |
| Nível | 成長期 = **Rookie** → normalizado **`child`** | digimon.net (JP e EN) | 1 | verified_primary | 2026-11-15 |
| Tipo | 獣型 = **Beast** | digimon.net | 1 | verified_primary | 2026-11-15 |
| Atributo | ワクチン = **Vaccine** | digimon.net | 1 | verified_primary | 2026-11-15 |
| Técnicas oficiais | **Cure Liqueur** (キュアーリキュール) e **Retriever Bark** (レトリバーク) | digimon.net | 1 | verified_primary | 2026-11-15 |
| Field (card game) | Nature Spirits; Nightmare Soldiers | Wikimon (cartas Da-016, Bo-891) | 3 | verified_secondary | 2026-11-14 (cache) |
| Estreia | 2001, *Digimon Tamers: The Adventurers' Battle* (filme) | Wikimon; KB `catalog.json` | 3 | verified_secondary | 2026-11-14 |
| Etimologia | Labrador Retriever | Wikimon | 3 | verified_secondary | 2026-11-14 |
| Continuidade | Perfil de espécie: `ctx.franchise_general` (Reference Book). Parceiros nomeados: Uehara Minami (filme de Tamers), Shibuya Aoi (*Digimon Survive*), Bell / Shishigari Neru (mangá *Digimon Dreamers*) | Wikimon | 3 | verified_secondary | 2026-11-14 |

Fontes:
- **S1** https://digimon.net/reference_en/detail.php?directory_name=labramon — Digimon Reference Book EN (Bandai), cat. 1, lido 2026-11-15 22:54 BRT.
- **S2** https://digimon.net/reference/detail.php?directory_name=labramon — Reference Book JP, cat. 1, lido 2026-11-15 22:54 BRT.
- **S3** https://digimon-sur.bn-ent.net/character/c02.html — site oficial de *Digimon Survive*, cat. 2 (continuidade Survive), lido 2026-11-15 22:55 BRT (só imagens).
- **S4** https://wikimon.net/Labramon — Wikimon, cat. 3. Wikitexto do cache do lote C1 (`kb_cache/pages/sp.labramon.json`, lido em 2026-11-14 12:57 BRT, pageid 1140); **não relido hoje** para respeitar o limite (as 5 requisições de hoje foram de imagem).
- **S5** imagens da Wikimon (5 arquivos, cat. 3), 2026-11-15 22:55–22:59 BRT, intervalo ≥ 65 s.

### 3.1 Perfil oficial (paráfrase própria, S1/S2)
[E] Digimon Fera parecido com um cão de verdade. Diz-se que o Rookie é a forma final dos Digimon artificiais e que ele não evoluiria além disso, mas há relatos não confirmados de que evoluiu — talvez por algum "milagre". É muito leal ao Tamer e sente que protegê-lo é sua missão. **Cure Liqueur** recupera Digimon aliados (JP: repara e otimiza os dados de Digimon enfraquecidos; EN: cura ferimentos e doenças de quem ele considera aliado). **Retriever Bark**: um latido intenso que gera uma hiper-oscilação.

### 3.2 Linha evolutiva (Wikimon, cat. 3 — **nenhuma aresta é oficial**; o Reference Book não publica evoluções)
Status de todas: `verified_secondary` (lido na Wikimon, cache 2026-11-14). Contexto entre parênteses = obra citada pela Wikimon. Não conferi nas obras.

**Evolui de:**
- Xiaomon (*D-Ark Version 2.0*) — linha da continuidade do filme de Tamers/V-pet
- Paomon (*Digimon RPG*)
- Algomon (Baby II) (*Pendulum Z Nightmare Soldiers*)
- genéricos do *Digimon Card Game* (Lv.2 azul/roxo/amarelo)

**Evolui para (seleção relevante):**
- **Siesamon** (filme *The Adventurers' Battle* [H: citação da Wikimon; não confirmei que a evolução aparece no filme], *D-Ark Version 2.0*, cartas St-402/Bo-892/Bo-33t, *Digimon RPG*, *Soul Chaser*)
- **Dobermon** (cartas Bo-661/Da-031, *Pendulum Z NS*, *Digimon Survive*, mangá *Dreamers*, *Soul Chaser*)
- **Cerberumon** e **Anubimon** (Warp Evolution, *Digimon Survive*); **Plutomon** (*Digimon Survive*, com Warp ou com Shibuya Aoi)
- Algomon (Adult) (*Pendulum Z NS*); Gaogamon (carta Da-029); Leomon (carta DM02-019); e mais ~20 destinos só de carta (Baromon, Black Galgomon, Coelamon, Darcmon, Devidramon, Dobermon X-Antibody, Dogmon, Galgomon, Growmon, Ikkakumon, Kyubimon, Mantaraymon, Mojyamon, Opossumon, Strikedramon, Tobucatmon, Wendimon, XV-mon).

[H] Para o Digital Odyssey, as linhas com mais peso de obra são **Xiaomon → Labramon → Siesamon** (V-pet/filme de Tamers) e **Labramon → Dobermon → Cerberumon → Anubimon / Plutomon** (*Digimon Survive*). Escolher uma é decisão de design (Camada B), não desta pesquisa.

### 3.3 Técnicas (para a Fase 8 — combate)
| Técnica | JP | Natureza (oficial) | Fonte | Uso visual sugerido [H] |
|---|---|---|---|---|
| Cure Liqueur | キュアーリキュール | Cura/otimização de aliados. JP a classifica como 得意技 (golpe característico) | S1, S2 | Não é ataque; serve a uma animação de "suporte/cura" futura, não ao ataque da Fase 8 |
| Retriever Bark | レトリバーク | Golpe especial (必殺技): latido forte que gera hiper-oscilação | S1, S2 | **Base do ataque da Fase 8**: preparação (inspira, peito estufa), latido com boca aberta, ondas de som; sem contato físico obrigatório |

Números de poder/custo citados pela Wikimon para *Digimon Survive* (55, 50, 25 SP) **não** entram aqui: nenhum número de balanceamento na Database/relatório.

---

## 4. Referências visuais (Gate, Etapa B)

Salvas em `refs/` (crédito e hash em `refs/FONTES.md`):

| Slot Gate | Arquivo | Obra / titular | Ângulo e pose | Cat. | Status |
|---|---|---|---|---|---|
| REF-01 arte oficial | `REF01_refbook_digimon-net_labramon.jpg` (320×320) | Reference Book, Bandai | 3/4 frontal, **sentado**, cabeça erguida olhando para cima-esquerda | 1 | verified_primary |
| REF-02 anime | `REF02_toei_model_sheet_tamers_movie.jpg` (300×208) | Folha de modelo final (決定稿) do filme de Tamers, Toei | **Vista lateral em pé nas 4 patas**, rosto frontal, cabeça de perfil, sentado 3/4, detalhe de pata e cauda | 3 (hospeda material oficial) | verified_secondary |
| REF-02b anime | `REF04_toei_tamers_movie_art.png` (1152×1197) | Arte do filme de Tamers, Toei | 3/4 frontal, sentado (meio erguido) | 3 | verified_secondary |
| REF-03 sprite | `REF05_vpet_dark_25th_color_sprite.png` (192×192 = 64×64 a 3×) | *D-Ark -25th COLOR EVOLUTION-*, Bandai | **Lateral em pé**, virado à esquerda, cauda erguida | 3 | verified_secondary |
| REF-04 movimento | `REF06_digimon_rpg_sprite.gif` (120×96, **8 quadros**) | *Digimon RPG* | **3/4 de cima** (mais próximo da nossa câmera), quadrúpede, cauda erguida | 3 | verified_secondary (vi só o 1º quadro) |
| REF-05 complementar | `REF03_survive_official_site_screenshot.jpg` (1200×675) | *Digimon Survive*, site oficial Bandai Namco | 3/4, sentado, close de rosto | 2 | verified_primary (cat. 2) |
| extra (não salva) | `Labramon_battle_survive.png` | *Digimon Survive* (arte de batalha) | 3/4 lateral, **postura de combate agachada**, cauda erguida sobre o dorso | 3 | verified_secondary |

Também existem (não abertas hoje): sprites de V-pet D-Ark/D-Spirit/Pendulum Z, card art de *Digimon Collectors* e *Crusader*, capturas de *Digimon Adventure:* (2020) e *Ghost Game* (ep. 11), modelo não usado de *Digimon Masters*. Fandom e Spriters Resource não foram acessados (regra da tarefa); nenhuma ROM baixada.

---

## 5. Dossiê anatômico

### 5.1 Descrição por parte
| Parte | Descrição | Evidência |
|---|---|---|
| **Silhueta geral** | Cão quadrúpede **compacto e atarracado**, cabeça grande, pernas curtas e grossas, **cauda grande em espiral** que forma um segundo volume atrás do corpo. Em pé, o contorno lateral é: domo da cabeça, orelhas caídas, tronco curto, cauda enrolada. | [E] REF-02 (lateral em pé), REF-05, REF-06 |
| **Pose típica** | A arte oficial quase sempre o mostra **sentado** (REF-01, REF-04, REF-03); em pé/andando aparece na folha de modelo, nos sprites e no Survive de batalha. | [E] todas |
| **Proporções** | Cabeça ≈ 1/3 da altura total sentado; cabeça ≈ largura do peito. No sprite oficial de V-pet a figura útil tem ~**50×39 px** (largura × altura, contando a cauda erguida) num quadro de 64×64 — mais **largo que alto** em pé. Pernas curtas: o ventre fica a ~1/3 da altura do chão. | [E] REF-05 medido (bbox 150×117 a 3×); [H] razões medidas a olho em REF-01/02 |
| **Cabeça / "capuz"** | O topo da cabeça é coberto por uma **massa de pelo branco em forma de capuz/cúpula**, que desce para trás e para os lados como cabeleira; na testa termina numa **franja recortada em zigue-zague** que cai sobre os olhos. Em perfil o capuz faz um domo arredondado que passa da nuca. | [E] REF-01, REF-02, REF-03, REF-04 |
| **Focinho** | Focinho **curto e largo**, levemente quadrado, apontando à frente; **nariz preto** arredondado na ponta (com brilho); linha da boca simples. **Presa(s) branca(s) apontando para baixo** no canto da boca — uma visível em 3/4 e em perfil. | [E] REF-01, REF-03, REF-04; [H] par simétrico na vista frontal (REF-02 frontal tem baixa resolução) |
| **Olhos** | Pequenos/médios, **íris vermelha** (REF-03 vermelho vivo; REF-01 vermelho-acastanhado; REF-04 laranja-avermelhado), pupila escura, brilho branco; ficam **logo abaixo da franja**, parcialmente sombreados por ela. Expressão calma/séria. | [E] REF-01, REF-03, REF-04, extra Survive |
| **Marcas** | **Duas listras diagonais rosa/vinho na bochecha**, abaixo e atrás do olho, paralelas, como "riscos de pintura". | [E] REF-01 (2–3 traços), REF-03 (2), REF-04 (2), extra Survive (2) |
| **Orelhas** | **Longas e caídas**, saem de baixo do capuz dos dois lados e descem até a altura do peito/ombro; **rosa-vinho** (mauve), mais escuras na parte interna/sombra, pontas com franja recortada. Pendem soltas (estilo cocker/basset), não ficam em pé. | [E] REF-01, REF-02, REF-03, REF-04 |
| **Pescoço / peito** | **Gola de pelo branco em zigue-zague** (pontas para baixo) no pescoço e alto do peito. Abaixo dela, peito/ventre claro. | [E] REF-01, REF-03, REF-04 |
| **Corpo** | Tronco curto e arredondado, pelo liso. Branco puro com sombra lilás-acinzentada (REF-01, REF-03, REF-05) **ou** creme-amarelado com ventre branco (REF-04, REF-06). | [E]; divergência §6 |
| **Patas** | Quatro patas grossas, cilíndricas, curtas; patas dianteiras retas como colunas quando sentado. Cada pata termina em **garras grandes, grossas e curvas — 3 bem visíveis por pata** — cor de osso/creme (REF-01, REF-03) ou **amarelas** (REF-04). As garras são um traço forte da silhueta. | [E] REF-01, REF-04, extra Survive; [H] uma 4ª garra escondida por perspectiva |
| **Cauda** | **Grande, grossa e felpuda, enrolada em espiral plana** (como um caracol ou rolo), com **listras/sulcos que seguem a espiral**; rosa-vinho, mesma cor das orelhas, com tom mais escuro nos sulcos. Volume próximo ao da cabeça. Dois portes: **horizontal atrás** do corpo (sentado, REF-01/02/04) e **erguida, enrolada sobre/atrás do dorso** (em pé/ação, REF-05, REF-06, Survive). | [E] todas |
| **Acessórios** | **Nenhum.** Sem coleira, roupa, marca de Digivice ou símbolo. | [E] todas as refs |

### 5.2 Invariantes (não podem mudar) — checklist de identidade para o QA
1. Quadrúpede canino compacto; pernas curtas e grossas; **4 patas**, nunca bípede em locomoção.
2. **Capuz de pelo branco** cobrindo o alto da cabeça, com **franja em zigue-zague** sobre os olhos.
3. **Orelhas longas e caídas** rosa-vinho (duas), saindo de baixo do capuz.
4. **Focinho curto** com **nariz preto**; **presa branca** visível no canto da boca.
5. **Olhos de íris vermelha**.
6. **Duas listras rosa-vinho diagonais em cada bochecha**.
7. **Gola branca em zigue-zague** no pescoço.
8. **Garras grandes claras (3 visíveis por pata)**.
9. **Uma** cauda, **em espiral plana listrada**, rosa-vinho, grande.
10. Corpo **branco/creme** com ornamentos (orelhas, cauda, marcas) **na mesma família rosa-vinho**; nenhum acessório.

### 5.3 Paleta observada
Sprite oficial V-pet (REF-05, contagem exata de cores, 18 no total) [E]:

| Papel | Hex |
|---|---|
| Contorno | `#000000`, `#191919` |
| Corpo luz / base / sombra | `#ffffff` / `#dedec5` / `#adad9c` (+ `#dedeef` lilás) |
| Orelhas e cauda (claro → escuro) | `#d67b9c` → `#ad5273` → `#7b4252` → `#421021` |
| Olho / marcas vermelhas | `#c52921`, `#9c1919`, `#841010` |
| Garras | `#ffffce`, `#efefbd`, `#ada56b` |
| Cinza auxiliar | `#847b84`, `#524a52` |

Leituras a olho (sem conta-gotas) [H]: REF-01 corpo branco com sombra lilás-acinzentada, ornamentos **framboesa/mauve dessaturado**, garras osso; REF-04 corpo creme-amarelado, ornamentos **rosa-choque** saturado, garras amarelo-ouro.

---

## 6. Diferenças entre referências (registradas, não resolvidas)
| # | Ponto | Variação | Fontes |
|---|---|---|---|
| D1 | Cor do corpo | **Branco** com sombra lilás (Reference Book, Survive, V-pet 25th) × **creme-amarelado** com ventre branco (filme Toei 2001, Digimon RPG) | REF-01/03/05 × REF-04/06 |
| D2 | Tom de orelhas/cauda | **Mauve/framboesa dessaturado** (Reference Book, Survive) × **rosa-choque** (Toei 2001, RPG) | idem |
| D3 | Garras | **Osso/creme** × **amarelas** (Toei 2001) | REF-01/03 × REF-04 |
| D4 | Íris | vermelho vivo (Survive) × vermelho-acastanhado (RB) × laranja-avermelhado (Toei) | REF-03, REF-01, REF-04 |
| D5 | Marcas da bochecha | 2 listras (Toei, Survive) × 2–3 traços finos (RB) | REF-04/03 × REF-01 |
| D6 | Porte da cauda | horizontal atrás (sentado) × erguida e enrolada sobre o dorso (em pé/ação) | REF-01/02/04 × REF-05/06/Survive batalha |
| D7 | Texto de Cure Liqueur | JP: "repara e otimiza dados de Digimon enfraquecidos"; EN: "cura ferimentos e doenças de aliados" (EN coincide com o texto do Survive) | S1 × S2 |
| D8 | Classificação de Cure Liqueur | JP separa 得意技 (Cure Liqueur) de 必殺技 (Retriever Bark); EN lista as duas como "Special Move" | S1 × S2 |

Recomendação [H] (decisão é da Fase 1 / fundador): o **Reference Book (REF-01) é a autoridade de cor** (branco + mauve + garras osso), por ser a fonte cat. 1 mais recente e por coincidir com Survive e com o sprite de V-pet de 2025; a paleta Toei 2001 vale como variação histórica. A **pose em pé** deve seguir REF-02 (lateral) e REF-06 (3/4), com a cauda erguida em espiral (REF-05/06).

---

## 7. Insumos para as próximas fases (não decidem nada)
- **Não confundir** [E/H]: Labramon não tem relação com Hawkmon (ave bípede); do Hawkmon reaproveita-se só o acabamento. Espécies caninas que o modelo de imagem pode misturar: **Dobermon** (evolução, preto/dobermann), **Gaomon/Gabumon** (bípedes), **Plotmon** (filhote branco de orelhas grandes), **Siesamon** (evolução, também canino claro). [H] — descrições de memória, não conferidas nesta fase. Pedir no prompt: "no collar, no clothes, no headband, no bow".
- **Erro provável de gerador** [H]: (a) desenhá-lo sentado em todas as vistas (as refs oficiais favorecem sentado); (b) transformar o capuz em cabelo humano ou orelhas em pé; (c) multiplicar a cauda ou deixá-la reta; (d) "labrador realista" amarelo, por causa do nome.
- **Câmera top-down 3/4:** o sprite do *Digimon RPG* (REF-06) é o precedente oficial mais próximo — quadrúpede de 3/4 com a cauda erguida em espiral, legível em ~70 px.
- **Escala:** o sprite oficial de V-pet usa ~50×39 px úteis em pé (mais largo que alto). O conflito de escala Tamer/Digimon (Etapa 6, G-2) **segue aberto**; não o resolvo.
- **Combate (Fase 8):** ataque = Retriever Bark (latido com onda de som). Cure Liqueur não é ataque.
- **Emoções/interações (Fases 5 e 7):** personalidade oficial = leal e protetor do Tamer (S1/S2); no Survive, franco e apoiador da parceira (S4, paráfrase). Cauda e orelhas são os canais naturais de emoção [H].
- **Sono/descanso (Fase 6):** nenhuma referência oficial de Labramon deitado ou dormindo foi encontrada — é **adaptação** a desenhar sobre a anatomia acima.

---

## 8. Lacunas e pendências
| # | Lacuna | Impacto | Ação sugerida |
|---|---|---|---|
| L1 | **Sem vista de costas oficial** | A pose N (costas) da arte-mestra será interpretação: capuz visto por trás, orelhas pendentes, cauda espiral erguida | Aceitar como adaptação registrada, ou pedir pesquisa complementar (anime *Adventure:* 2020 / *Ghost Game*, card art) |
| L2 | Só o 1º quadro do GIF do *Digimon RPG* foi inspecionado | Ciclo de caminhada oficial não estudado | A Fase 4 pode abrir os 8 quadros localmente (`refs/REF06…gif`) |
| L3 | Wikimon não relida hoje (cache de 2026-11-14) | Evolução/estreia com data de ontem | Aceitável para o F9; reler quando a KB entrar no lote C1 |
| L4 | Labramon não está na KB GD-066 (só índice; nível/atributo `pending`) | O Gate manda consultar a KB | Incorporar estes dados na KB no próximo lote (não feito aqui: a KB não tem ficha nem slot para ele e o brief não pede escrita na KB) |
| L5 | Folha de modelo Toei em baixa resolução (300×208) | Detalhe da vista frontal (presas, olhos) incerto | Buscar versão maior em fonte permitida |
| L6 | Reference Gate: cópia da KB diverge do texto central (estado "em vigor") | Confusão documental | `game-studio` atualiza a cópia ou anota a precedência |
| L7 | Fases 6–24 do `etapa6-lab` não commitadas | Risco de perda | Decisão do `game-studio` (fora do escopo) |

---

## 9. Riscos
- **Identidade:** médio — o design tem traços pouco comuns (capuz, cauda espiral, marcas) que geradores tendem a "normalizar" para um cão genérico. Mitigação: checklist §5.2 no prompt e no QA.
- **Propriedade intelectual:** espécie e imagens são de Bandai/Toei; as refs ficam como `reference` interna, com crédito, sem publicação; nenhuma é asset. Sem monetização.
- **Escala e paleta:** conflitos G-1/G-2 da Etapa 6 seguem abertos.
- **Processo:** nenhuma aresta evolutiva é oficial; não tratar a linha evolutiva como canônica.

---

## 10. Descrição curta da anatomia (EN), para o prompt da arte-mestra
> LABRAMON (Digimon, Rookie, Vaccine, Beast): a small, stocky quadruped puppy with short thick legs and a large head. The top of the head is covered by a rounded white fur "hood" that ends in a jagged zigzag fringe over the eyes. Short, broad muzzle with a round black nose and one small white fang pointing down at the corner of the mouth. Red eyes partly shaded by the fringe; two diagonal mauve-pink stripes on each cheek. Long floppy mauve-pink ears hanging from under the hood down to the chest. A white zigzag fur ruff around the neck. White body with soft lilac-grey shading. Each of the four paws ends in three big curved bone-cream claws. One large fluffy tail in mauve-pink, rolled into a flat spiral like a snail shell with grooves following the spiral, carried raised behind the back when standing. No collar, no clothes, no accessories.

---

## 11. Números da pesquisa
- Lido no **oficial**: 3 páginas (Reference Book EN e JP; site Survive) + 2 imagens oficiais (RB, captura Survive).
- Lido na **wiki** (Wikimon, cat. 3): 1 página (cache 2026-11-14) + 5 imagens hoje (≥ 65 s entre elas).
- Afirmações `verified_primary`: 6 (nome, nível, tipo, atributo, 2 técnicas). `verified_secondary`: Field, estreia, etimologia, parceiros, ~30 arestas evolutivas. `pending`: vista de costas, ciclo de caminhada completo.
- Imagens salvas: 6 (`refs/`), com fonte e hash. PixelLab: 0 gerações.
