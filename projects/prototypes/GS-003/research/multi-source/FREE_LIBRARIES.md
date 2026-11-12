# GS-003 — Bibliotecas grátis de assets (Kenney, OpenGameArt, itch.io, CraftPix freebies, game-icons.net)

**Autor:** game-research (subagente) · **Data:** 2026-11-11 · **Encomendado por:** fundador (via game-studio).

> Marcação: **[E]** evidência (fonte + data) · **[H]** hipótese/estimativa não confirmada.
> **Custo zero:** só pacotes **gratuitos** (sem compra), sem criar conta nos sites avaliados. Nenhum download executado nesta tarefa — links e licenças conferidos na própria página do produto.
> **Filtro "casa com GBA Plus":** decisão de arte já registrada no estúdio é **tile = 32px** (16px aceitável para chão/autotile), estilo top-down ~3/4 (RPG clássico de GBA/SNES), paleta viva, contornos nítidos (ver `research/ART_BUDGET_OPTIONS.md` e `docs/ART_STYLE_GUIDE.md`). Pacotes vetoriais lisos, isométricos puros ou fora da escala 16/32px foram marcados como **fora do filtro** mesmo quando gratuitos.

---

## 1. Kenney (kenney.nl) — licença CC0 em tudo [E, 2026-11-11]

Todo o catálogo Kenney usado abaixo é **Creative Commons CC0** (domínio público — uso comercial livre, sem crédito obrigatório, sem restrição de redistribuição do jogo final). Confirmado individualmente em cada página de produto (campo "License" visível, 2026-11-11).

| Pacote | Link | Tile size | Bioma/uso | Encaixe GBA Plus |
|---|---|---|---|---|
| **Roguelike/RPG Pack** | kenney.nl/assets/roguelike-rpg-pack | **16×16** [E] | Genérico RPG: terreno, parede, móveis, botões/painéis de UI — 1700+ tiles. Tags: rpg, tile, town, furniture, button, panel, roguelike | ✅ Alto — maior volume de peças soltas pra montar vila/ruína/interior; precisa de curadoria porque é um "kit genérico", não um bioma fechado |
| **Tiny Dungeon** | kenney.nl/assets/tiny-dungeon | **16×16** [E] | Caverna/dungeon/esgoto (tags: dungeon, sewer), 130 arquivos | ✅ Alto para **caverna** — tema certo, tamanho certo |
| **Tiny Town** | kenney.nl/assets/tiny-town | **16×16** [E] | Vila/overworld (tags: town, overworld, map), 130 arquivos | ✅ Alto para **vila** |
| **Pixel Shmup** (citado por completude; não é o foco) | kenney.nl/assets/pixel-shmup | 16×16 | Nave/efeitos de tiro top-down — tema errado (shmup, não RPG) | ❌ Fora do filtro temático, mesmo CC0 e 16px |

**Observação sobre floresta/ruínas:** o catálogo Kenney não tem um pacote dedicado "floresta densa" ou "ruínas" isolado — a árvore/vegetação/pedra vem misturada dentro do **Roguelike/RPG Pack** genérico (teria que ser filtrada manualmente das 1700 peças). Não encontrado pacote CC0 da Kenney específico de ruínas antigas nesta pesquisa [H — pode existir e não ter aparecido na navegação feita; recomenda-se checar `kenney.nl/assets?q=ruins` manualmente, página que retornou vazia via `web_fetch` por ser busca client-side].

**Como baixar sem conta:** cada página tem botão "Download" direto, sem login — Kenney pede doação opcional, não obrigatória ("Continue without donating..." está sempre disponível) [E, confirmado no HTML de cada página].

---

## 2. OpenGameArt.org — licenças mistas, checar por item [E, 2026-11-11]

OpenGameArt é um agregador comunitário: **cada submissão tem sua própria licença** (CC0, CC-BY, CC-BY-SA, GPL, OGA-BY 3.0...) — não existe uma licença única do site. A busca avançada (`/art-search-advanced`) é renderizada client-side e não retornou resultados via `web_fetch` sem JS; a navegação direta por página de conteúdo funcionou.

| Item | Link | O que é | Licença | Observação |
|---|---|---|---|---|
| **Cave Tileset (OSARE)** | opengameart.org/content/cave-tileset | Paredes retas/convexas/côncavas em 4 direções, 16 tiles de piso (grade 4×4), trilhos/carrinhos de mina, teias, estalagmites, água simples. Já inclui **sheet específico para o Tiled** (o próprio autor achatou os tiles de água só na versão Tiled) | **[H] não extraída via `web_fetch`** — o campo de licença do OGA fica num bloco lateral que a extração em texto não capturou; o próprio autor escreve na descrição "se quiser usar sob licença diferente, me contate", sinal de que a licença padrão (provavelmente CC-BY ou CC-BY-SA, padrão comum no OGA) tem alguma restrição — **checar manualmente antes de usar** | Pronto para Tiled, mas é 3D pré-renderizado em 2D, não pixel art desenhado à mão — estilo pode não combinar 100% com o resto do GBA Plus; avaliar visualmente antes |
| **Ecossistema LPC (Liberated Pixel Cup)** | affiliate listado na home do OGA (`opengameart.org`, seção "Affiliates") | Não verificado em detalhe nesta sessão (página específica `/content/lpc-base-assets-sprites-tiles` retornou 404 — URL incorreta) [H] | **[H]** padrão conhecido da comunidade é **CC-BY-SA 3.0 / GPL 3.0 dual-license**, exige atribuição e, na variante SA, que derivados mantenham licença compatível — **não confirmado ao vivo nesta sessão**, recomenda-se busca manual por "LPC" no site antes de adotar | 32×32, estilo GBA/SNES clássico, é a base de facto de centenas de tilesets RPG gratuitos no OGA — vale investigação dedicada numa próxima tarefa |

**Limitação:** a busca avançada do OpenGameArt não é acessível via `web_fetch` (JS-only), então esta seção é só o que foi possível confirmar por URL direta de conteúdo já conhecido — **não é uma cobertura completa do catálogo** de floresta/vila/ruínas do site. Recomenda-se checagem manual (navegador) para "forest tileset", "village tileset", "ruins tileset" filtrando por licença CC0/CC-BY antes de aprovar qualquer peça.

---

## 3. itch.io (gratuitos) [E/H misto, 2026-11-11 — reaproveitado de `research/ART_BUDGET_OPTIONS.md`, 2026-11-09]

`itch.io` bloqueou `web_fetch` direto nesta tarefa (mesmo padrão já visto antes: Cloudflare/JS). Os dados abaixo **reaproveitam** o levantamento já feito em `ART_BUDGET_OPTIONS.md` (não foi feita nova pesquisa), filtrando só os itens com **camada gratuita real** (não os que exigem pagamento mínimo):

| Pacote | Autor | Link | Licença do tier **grátis** [E, 2026-11-09] | Tile size | Bioma |
|---|---|---|---|---|---|
| **Pixel Art Top Down - Basic** | Cainos | cainos.itch.io/pixel-art-top-down-basic | **Gratuito, uso comercial liberado**, pode modificar, crédito não obrigatório, proibido redistribuir/revender isolado | **32×32** [E] | Base genérica (grama, pedra, parede, 3 árvores, props) — fundação útil, não bioma fechado |
| **Mystic Woods** | Game Endeavor | game-endeavor.itch.io/mystic-woods | **Grátis = só uso NÃO-comercial.** Comercial exige pagar ≥$3,99 (fora do escopo "custo zero" desta tarefa) | 16×16 | Ambiente rústico fofo (slime, grama, água) — nota visual 95/100 no benchmark de estilo já registrado, mas **não pode ser usado de graça no jogo se o jogo deixar de ser estritamente não-comercial** |
| **Sprout Lands Asset Pack** | Cup Nooble | cupnooble.itch.io/sprout-lands-asset-pack | **Grátis = só uso NÃO-comercial**, versão paga (≥$3,99) libera comercial | 16-bit | Fazenda/vila pastel |
| **Serene Village** / **Fungus Cave** | LimeZu | limezu.itch.io/serenevillage, limezu.itch.io/fungus-cave | Fungus Cave: versão demo com **1 tileset grátis** (licença completa só na versão paga). Serene Village: existe versão "revamped" grátis, termos não confirmados nesta sessão [H] | 16×16 | Vila pequena / caverna de fungos |

**Nota importante de risco:** como GS-003 é **fan game não comercial** (confirmado no contexto desta tarefa), os itens com tier grátis "só uso não-comercial" (Mystic Woods, Sprout Lands) **já qualificam para uso de custo zero no projeto atual** — a restrição deles é justamente contra uso **comercial**, que não é o caso aqui. Se o projeto algum dia virar comercial, esses dois exigiriam pagar o valor mínimo (~$3,99 cada) antes de continuar usando a arte.

---

## 4. CraftPix freebies (craftpix.net/freebies/) [H — bloqueado, 2026-11-11]

`craftpix.net/freebies/` e a variante com filtro de categoria (`?category=2d-game-kits`) retornaram HTML genérico sem a listagem real de produtos — a página de listagem carrega os itens via JavaScript client-side, e a proteção **Cloudflare bloqueou tentativas de produto individual** ("Just a moment..." / 403), **mesmo padrão de bloqueio já registrado em `research/ART_BUDGET_OPTIONS.md` (2026-11-09)**. Não foi possível, nesta sessão, listar quais pacotes específicos do CraftPix são gratuitos vs. pagos, nem suas licenças exatas.

**O que já se sabe do CraftPix (herdado de `ART_BUDGET_OPTIONS.md`, [E, 2026-11-09]):** licença padrão CraftPix permite uso comercial, venda/distribuição do jogo feito com o asset, proíbe redistribuir o asset isolado, crédito não obrigatório — **mas isso é a licença do catálogo PAGO** verificado antes; não há confirmação de que os freebies específicos (gratuitos) seguem a mesma licença sem restrição adicional. **Recomendação:** checagem manual (navegador comum, sem comprar nada) da página `craftpix.net/freebies/` antes de aprovar qualquer peça — página é pública e gratuita, só não navegável por `web_fetch`.

---

## 5. game-icons.net — ícones de UI e efeitos de batalha [E, 2026-11-11]

- **O que é:** biblioteca com **4180+ ícones SVG/PNG** vetoriais, monocromáticos (fácil de recolorir), organizados por tags. Catálogo cobre fantasia/RPG de forma ampla: armas, criaturas, magias, elementos — bom para **ícones de efeito de batalha** (chamas, raios, escudo, veneno) e **ícones de UI** (itens, status, ações).
- **Licença [E, confirmado em `game-icons.net/about.html`, 2026-11-11]:** **Creative Commons BY 3.0** — uso livre, **incluindo comercial**, **mas exige atribuição**: "Icons made by {author}. Available on https://game-icons.net". Como o projeto tem **múltiplos autores por ícone** (tabela de créditos: Lorc 1429 ícones, Delapouite 2022, Skoll 172, Caro Asercion 127, etc.), a atribuição correta exige creditar o autor específico de cada ícone usado, não "game-icons.net" genericamente — isso é um ônus de processo (manter uma lista de créditos por ícone usado), não um bloqueio de uso.
- **Encaixe GBA Plus:** ⚠️ **Parcial** — são **vetores lineares monocromáticos** (estilo "ícone de HUD", não pixel art granulado). Para usar num UI estilo GBA Plus (pixel art nítido), precisariam passar por conversão (ex. `pixelart_workbench`/`image_to_pixelart` do PixelLab, ou pixelização manual) — não são pixel art prontos "out of the box" no mesmo sentido que Kenney/CraftPix/itch.io.
- **Uso recomendado:** ótimo para **protótipo rápido de UI/HUD** (ícones de item, status, ação) antes de ter arte final; menos indicado para usar direto como asset final de um jogo pixel art sem reprocessamento.

---

## 6. Tabela-resumo — por bioma/necessidade (só opções de custo zero confirmado)

| Necessidade | Melhor opção custo-zero confirmada | Licença | Fonte |
|---|---|---|---|
| **Floresta** | Nenhum pacote dedicado 100% gratuito e confirmado nesta pesquisa; Kenney Roguelike/RPG Pack tem árvores soltas (CC0, 16×16) misturadas no kit genérico | CC0 | kenney.nl/assets/roguelike-rpg-pack |
| **Caverna** | **Kenney Tiny Dungeon** | CC0 | kenney.nl/assets/tiny-dungeon |
| **Ruínas** | Não localizado pacote dedicado gratuito nesta pesquisa [H] — recomenda-se busca manual adicional (OpenGameArt "ruins tileset", itch.io) | — | — |
| **Vila** | **Kenney Tiny Town** (CC0, 16×16) ou **Cainos Pixel Art Top Down - Basic** (gratuito, comercial liberado, 32×32, mas genérico não vila fechada) | CC0 / gratuita | kenney.nl/assets/tiny-town, cainos.itch.io/pixel-art-top-down-basic |
| **UI/ícones** | **Kenney Roguelike/RPG Pack** (botões/painéis prontos, pixel art, CC0) + **game-icons.net** (ícones vetoriais variados, CC-BY 3.0, precisa pixelizar) | CC0 / CC-BY 3.0 | ambos acima |
| **Efeitos de batalha** | **game-icons.net** (ícones de magia/elemento como base visual, CC-BY 3.0, precisa pixelizar/animar) | CC-BY 3.0 | game-icons.net |

---

## 7. Limitações desta pesquisa [E, 2026-11-11]

- `web_search` indisponível durante toda a sessão.
- `craftpix.net` bloqueado por Cloudflare em toda tentativa de listagem/produto (seção 4) — nenhum pacote freebie específico do CraftPix foi confirmado nesta tarefa.
- `itch.io` bloqueado para fetch direto; seção 3 **reaproveita** dados já coletados em 2026-11-09 (`ART_BUDGET_OPTIONS.md`), não é pesquisa nova.
- A busca avançada do OpenGameArt (`/art-search-advanced`) não renderizou resultados sem JS — a cobertura de floresta/vila/ruínas desse site é **incompleta** nesta entrega; só 1 item de caverna foi confirmado por URL direta conhecida de antemão.
- Licença exata do item OpenGameArt "Cave Tileset" **não confirmada** (bloco de licença não capturado pela extração) — marcar como pendente de checagem manual antes de qualquer uso.
- Nenhum pacote foi baixado/aberto nesta tarefa — avaliação de "encaixe GBA Plus" é por descrição/preview da página, não por inspeção pixel a pixel do arquivo real.
