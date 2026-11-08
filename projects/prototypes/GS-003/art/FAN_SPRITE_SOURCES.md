# GS-003 — Inventário e política de uso de sprites de fãs (Digimon)

- **Data:** 2026-11-08
- **Base legal:** ADR-007, regra 2 (emendada 2026-11-08) — permite sprites próprios ou de fãs com licença/autorização que cubra uso não comercial, com crédito em `CREDITS.md`. Proíbe rips oficiais e redistribuições de rips (ex.: sprites Chunsoft, coleções baseadas em rip).
- **Pack de referência:** Koromon, Tsunomon, Tokomon, Agumon, Gabumon, Patamon, Greymon, Garurumon, Angemon, Devimon (10 monstros).

> Nesta etapa **nenhum sprite final foi copiado para o jogo**. Só inventário. Amostras de inspeção (com crédito) ficam em `art/_samples/` — ver seção 5.

---

## 1. Fontes avaliadas

### 1.1 Digimon Pixels (thejeneral.wixsite.com/dgmnpixels)

- **Licença [E] (2026-11-08):** página "About Us" do site declara:
  > "All art found in this gallery are free to use on your own website, projects, etc.! Please store them on your own web space. Credit where it is due and a link back to this site or the [HGGF] would be very much appreciated."
  Fonte: https://thejeneral.wixsite.com/dgmnpixels/about
  - Leitura: permissão de uso livre (inclusive em projetos), crédito **pedido mas não obrigatório** pelo texto ("appreciated", não "required"). Para o padrão do estúdio (ADR-007 exige crédito), vamos creditar mesmo assim — supera o mínimo exigido pelo site e reduz risco.
  - Sem cláusula explícita sobre uso comercial/não comercial. **[H]** Tratar como não comercial por segurança, já que o GS-003 já está sob a restrição geral de não monetização do ADR-007.
- **Formato e tamanhos [E]:** GIFs de pixel art organizados por era (Adventure, 02, Tamers, Frontier, Xros Wars, Appmon, Ghost Game) e por categoria: "mugshots" (retratos de cabeça), "small pixels", "mid-size pixels", "big pixels", organizados por artista (ex.: Fenrir, ShuriTogemon, DigiStarDBZ, Burai). Sem dimensões em pixels declaradas no texto das páginas.
- **Animações de andar/atacar/dano [H]:** a navegação do site não lista nenhuma categoria "battle", "attack" ou "walk cycle" — só mugshots e pixels por tamanho. Pela convenção conhecida desse tipo de arte de fã (herdeira da "Happy Galgomon Gif Factory"), o padrão é **pose única ou GIF de idle/bounce simples**, não um sprite sheet de combate com quadros de ataque e dano. **Não confirmado por inspeção de imagem** (a extração de texto não lista imagens individualmente) — recomenda-se checagem visual antes de decidir.
- **Cobertura dos 10 monstros [H]:** Agumon, Gabumon, Patamon, Greymon, Garurumon, Angemon e Devimon são protagonistas/antagonistas centrais de Digimon Adventure e aparecem com frequência em arte de fã; é razoável esperar cobertura alta. Koromon, Tsunomon e Tokomon (formas "in-training") são menos comuns em arte de fã. **Não verificado monstro a monstro** — a página por era (ex. "Adventure Small Pixels") lista só os artistas, não os monstros desenhados por cada um; confirmar por inspeção visual das galerias.
- **Contato para dúvidas de licença:** dgmnpixelgal@gmail.com (listado na página About).

### 1.2 Happy Galgomon Pixel Preserve (happygalgomon.neocities.org)

- **Licença [E] (2026-11-08):** não há página de termos/licença no site (tentativas de acesso a `/terms.html` e páginas afins retornaram 404). O texto da home diz que o site é "dedicated to fan-made pixel art from the Digimon franchise", sem declarar termos de uso explícitos.
  - Confirma o que o coordenador já havia apontado: **licença não está clara**. Tratar como "permissão implícita de fã para fã", insuficiente por si só para o padrão do ADR-007 sem contato direto com a autora (Fenrir) pedindo autorização por escrito.
- **Formato e tamanhos [E]:** mesma convenção do Digimon Pixels (é o site predecessor/irmão) — "small-sized characters", "medium" (chamado de "bigger 'medium'" no texto do update), mugshots, itens diversos. Sem dimensões em pixels declaradas.
- **Animações [H]:** mesma observação do item 1.1 — sem evidência de sprite sheets de combate; provavelmente pose única/idle.
- **Cobertura dos 10 monstros [E/H]:** o changelog da home cita **Gabumon** (com Matt Ishida, Adventure 2020) e **Patamon** (com T.K., Adventure 02) nominalmente **[E]**. Não há menção textual a Agumon, Greymon, Garurumon, Angemon, Devimon, Koromon, Tsunomon ou Tokomon no changelog recuperado — podem existir em páginas/galerias mais antigas não listadas no texto capturado. **[H]** cobertura potencialmente maior do que o texto mostra, pois o changelog é só "atualizações recentes".
- **Ação recomendada antes de qualquer uso:** contatar Fenrir (dados de contato não localizados no fetch; verificar redes sociais vinculadas) para autorização explícita por escrito, dado que a licença não está clara.

### 1.3 DragonRod Art — DIM Digimon Database (dragonrod-art.com/dim-digimon-database)

- **Licença [E] (2026-11-08):** não foi encontrada nenhuma página de termos/licença (`/about-5` retornou 404; busca web indisponível para localizar termos). O site tem uma seção de loja ("Store" / `/category/all-products`), o que indica intenção comercial do autor sobre a própria arte — reforça a leitura do coordenador de que a licença **não está clara** e que não há permissão de uso de terceiros declarada.
  - **[H]** Como o autor vende produtos próprios, é prudente assumir que os sprites da galeria **não têm permissão de redistribuição/uso em projetos de terceiros** até confirmação explícita por contato direto (Instagram @dragonrod342 / Twitter @Dragonrod_Art).
- **Formato e tamanhos [E]:** página organiza Digimon por estágio evolutivo ("Baby I", "Baby II", "Rookie", ...), consistente com fichas de pixel art por digimon. Não foi possível extrair nomes de monstros individuais nem dimensões via fetch (conteúdo é majoritariamente imagem, texto da página excede o limite de captura).
- **Animações [H]:** sem evidência de sprites de combate; aparenta ser galeria de arte estática por estágio, não sprite sheet de jogo.
- **Cobertura dos 10 monstros:** **não verificável** com as ferramentas disponíveis nesta etapa (conteúdo em imagem, sem alt-text capturado).
- **Recomendação:** não usar sem contato e autorização explícita por escrito do autor, por causa da loja e da ausência de licença declarada.

### 1.4 PMD Collab (sprites.pmdcollab.org / github.com/PMDCollab/SpriteCollab)

- **Achado crítico [E]:** PMD Collab é o banco de sprites de **Pokémon Mystery Dungeon** ("PMD Sprite Repository"; comandos do bot usam nomes como Pikachu, Shaymin). **Não é um banco de sprites de Digimon.** Cobertura dos 10 monstros do pack (todos Digimon): **0 de 10**. Este projeto não serve como fonte de sprites para o pack atual — mantém-se relevante só se o estúdio algum dia incluir monstros de Pokémon (Linha A do GS-003, conforme ADR-007 menciona ambas franquias).
- **Licença [E] (2026-11-08):** `LICENSE.md` do repositório é o texto integral da **CC BY-NC 4.0** (Creative Commons Attribution-NonCommercial 4.0 International). Confirmado também no `README.md`:
  > "By submitting files to the bot, you provide permission for others to copy and redistribute the material in any medium or format, or remix, transform, and build upon the material, as long as the work is `non-commercial` and `appropriate credit` is given. For specific terms, view the CC BY-NC license: https://creativecommons.org/licenses/by-nc/4.0/"
  Fontes: https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/LICENSE.md e /README.md
- **Regra sobre sprites oficiais [E]:** o mesmo README declara:
  > "As a rule, we do not allow modifications or overwriting of any existing Chunsoft portraits or sprites within the SpriteBot repository (...)"
  Isto é, os sprites "Chunsoft" (oficiais, dos jogos Pokémon Mystery Dungeon) convivem no mesmo repositório que os sprites de fã, e **são oficiais — proibidos pelo ADR-007**. Sprites submetidos por fãs (não-Chunsoft) são os únicos sob CC BY-NC.
- **Formato e tamanhos [E]:** sprites "overworld" (sprite sheets de ação, com XML de animação) e "portraits" (retratos 40×40 px, até ~15 cores). Isso **é** o formato certo para um modo arena de ação (sprite sheets com XML de animação, feitos justamente para jogos estilo Mystery Dungeon).
- **Animações [E]:** o sistema de status (`tracker.json`, README) usa um conjunto padrão de "emotions" para portraits (Angry, Happy, Pain, Surprised, etc.) e sprites "overworld" com animações de jogo — mas são animações no estilo Mystery Dungeon (idle, walk, attack básico, hurt/fainted), não um conjunto genérico "andar/atacar/dano" universal. Irrelevante aqui porque **não cobre Digimon**.

---

## 2. Como filtrar no PMD Collab só os sprites de fãs (não-Chunsoft)

Útil apenas se o estúdio decidir usar Pokémon no futuro (Linha A). Verificado em `github.com/PMDCollab/SpriteCollab` em 2026-11-08:

1. **Pelo README (regra geral):** qualquer sprite/portrait que **não seja um dos originais do jogo** (Chunsoft) e que tenha sido **submetido por um usuário via bot do Discord** é, por definição, fã-feito e cai sob CC BY-NC. O README proíbe explicitamente sobrescrever os sprites Chunsoft — ou seja, tudo que está marcado como "Alternate", "AltColor", "Beta" ou que foi adicionado em um slot novo (formas não oficiais) é conteúdo de fã.
2. **Pelo `tracker.json`:** cada entrada de Pokémon/forma tem os campos `sprite_credit` e `portrait_credit` (`primary` e `secondary`), preenchidos com **menção Discord** do autor (formato `<@!ID_DISCORD>`) — e não com "Chunsoft" ou nome de empresa. Entradas sem campo de crédito preenchido ou creditadas de forma genérica tendem a ser os sprites originais do jogo (herdados na criação do repositório, antes do sistema de créditos existir). Na prática: **se `sprite_credit.primary` tem um ID de usuário Discord, é sprite de fã; trate campos vazios/genéricos como possivelmente oficiais e não os use.**
3. **Pelo `credits.txt`:** o repositório mantém um arquivo de créditos agregados (listas de usuários e suas contribuições) — consultar esse arquivo para resolver o ID Discord para um nome/contato citável no nosso `CREDITS.md`, usando os dados de `!register` (nome + contato) quando disponíveis.
4. **Na prática de download (bot `!sprite`):** cada entrega do bot já vem com um manifesto de crédito agregado, então o caminho mais simples é sempre baixar via bot/zip (não copiar o PNG solto do site), pois o zip inclui o crédito.
5. **Nunca usar:** qualquer entrada que o próprio README chama de "Chunsoft portraits/sprites" — são os sprites oficiais do jogo Pokémon Mystery Dungeon, proibidos pelo ADR-007 independentemente da licença CC BY-NC do restante do repositório (a licença CC BY-NC cobre as contribuições de fãs, não os assets oficiais que convivem no mesmo repo).

---

## 3. Status "With the Will" — Full Color Dot Sprites

- **Confirmado pelo coordenador:** baseados em rips oficiais → **proibidos pelo ADR-007, regra 2**, independentemente de qualquer licença declarada no fórum. Não usar sob nenhuma circunstância, nem como referência de proporção/paleta.

---

## 4. Modelo de `CREDITS.md`

Arquivo a ser criado em `art/CREDITS.md` (ou na raiz do pacote de conteúdo) quando o primeiro sprite de fã for efetivamente incorporado ao jogo:

```markdown
# Créditos de arte — GS-003 (fan game não oficial)

Este jogo é um fan game não comercial. Não possui afiliação com Nintendo, Game Freak,
The Pokémon Company, Bandai ou Toei Animation. Pokémon e Digimon e todos os nomes e
designs relacionados são marcas de seus respectivos detentores.

## Sprites de fãs utilizados

| Monstro | Fonte | Autor(a) | Licença | Link | Data de obtenção |
|---|---|---|---|---|---|
| Agumon | Digimon Pixels | <nome/handle do artista> | Uso livre com crédito | https://thejeneral.wixsite.com/dgmnpixels | 2026-11-08 |
| ... | ... | ... | ... | ... | ... |

## Arte original do estúdio

| Monstro | Artista (GameStudio) | Observação |
|---|---|---|
| ... | game-art | Pixel art original, redesenho não comercial |

## Licenças citadas

- CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/
- Termos específicos de cada site de fã: ver links na tabela acima.
```

---

## 5. Amostras para inspeção

Nenhuma amostra foi baixada nesta etapa (fora de escopo: "não baixar sprites para dentro do jogo nesta etapa"). Recomenda-se, na próxima etapa, baixar manualmente 1–2 imagens de amostra por fonte viável (Digimon Pixels) para `art/_samples/`, cada uma acompanhada de um `.txt` com autor, link de origem e data — nunca sprites da DragonRod Art ou Happy Galgomon sem autorização prévia por escrito, dado o status de licença incerta.

---

## 6. Recomendação por monstro

| Monstro | Fonte recomendada | Por quê | Risco/observação |
|---|---|---|---|
| Agumon | Digimon Pixels (com crédito) **ou** arte própria | Já existe placeholder próprio em `art/sprites/digimon-fan/agumon_idle_01.png` (frames idle) | Falta animação de ataque/dano em qualquer fonte de fã verificada — provavelmente desenho próprio é inevitável para o modo arena |
| Gabumon | Digimon Pixels / Happy Galgomon (citado nominalmente no changelog, mas licença incerta) **ou** arte própria | Já existe placeholder próprio (`gabumon_idle_*.png`) | Mesma ressalva de animação de combate |
| Patamon | Digimon Pixels / Happy Galgomon (citado nominalmente, licença incerta) **ou** arte própria | Já existe placeholder próprio (`patamon_idle_*.png`) | Mesma ressalva |
| Koromon | Desenho próprio | Forma "in-training" pouco comum em arte de fã; não localizada nominalmente em nenhuma fonte verificada | — |
| Tsunomon | Desenho próprio | Mesma situação do Koromon | — |
| Tokomon | Desenho próprio | Mesma situação do Koromon | — |
| Greymon | Digimon Pixels (checar galeria "Adventure") **ou** arte própria | Protagonista popular, alta chance de cobertura, mas não confirmado monstro a monstro | Confirmar visualmente antes de decidir |
| Garurumon | Digimon Pixels (checar galeria "Adventure") **ou** arte própria | Mesma lógica do Greymon | Confirmar visualmente antes de decidir |
| Angemon | Digimon Pixels (checar galeria "Adventure") **ou** arte própria | Mesma lógica | Confirmar visualmente antes de decidir |
| Devimon | Digimon Pixels (checar galeria "Adventure") **ou** arte própria | Vilão icônico de Adventure, provável cobertura | Confirmar visualmente antes de decidir |

**Conclusão geral:** nenhuma das fontes de fã verificadas hoje oferece, com confiança, sprite sheets completos de **ataque e tomar dano** (só idle/mugshot/pose única é a convenção observada). Para o modo arena de ação, o estúdio provavelmente terá que **desenhar as animações de ataque e dano internamente para os 10 monstros**, usando no máximo as poses de fã (quando a licença permitir, com crédito) como referência visual — nunca como asset final sem confirmação de licença e sem checagem visual completa.

---

## Limitações

- `web_search` esteve indisponível nesta sessão; toda pesquisa usou `web_fetch` direto nas URLs fornecidas e em `html.duckduckgo.com/html/?q=...`.
- As páginas de Digimon Pixels, Happy Galgomon e DragonRod Art são predominantemente visuais (galerias de imagem); a extração de texto não lista nomes de monstros por imagem, então a cobertura exata dos 10 monstros **não foi confirmada monstro a monstro por inspeção visual** — só por evidência textual indireta (changelogs, categorias). Marcado como [H] onde aplicável.
- Não foi possível localizar página de termos/licença da DragonRod Art nem da Happy Galgomon Pixel Preserve; ambas permanecem como "licença não clara", conforme já apontado pelo coordenador — não usar sem contato direto com os autores.
- PMD Collab foi investigado conforme solicitado, mas é um banco de sprites de **Pokémon**, não de Digimon — cobertura 0/10 para o pack atual. A seção 2 (como filtrar sprites de fã) fica registrada para uso futuro caso o estúdio inclua Pokémon.
- Nenhum sprite foi baixado para dentro do jogo nesta etapa, conforme instrução; nenhuma amostra foi colocada em `art/_samples/` (pasta não foi criada, pois nenhuma fonte teve licença suficientemente clara para justificar nem uma amostra sem contato prévio, exceto Digimon Pixels — cuja amostragem fica recomendada para a próxima etapa, não executada agora por já ultrapassar o escopo de "só inventário").
