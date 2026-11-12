# GS-003 — Asset Discovery Catalog (ambiente + UI)

**Autor:** game-research · **Data:** 2026-11-08 · **Escopo:** Módulo 2 / doc 05 do briefing (`docs/briefing/05_module2_asset_discovery_engine.md`), restrito a **ambiente e UI** — tilesets de grama, floresta, água, pedras, construções, props, efeitos de combate e partículas. **Monstros genéricos ficam fora do escopo** por proibição explícita do fundador (não substituir Digimon).

Dados estruturados completos em [`ASSET_DISCOVERY_CATALOG.json`](./ASSET_DISCOVERY_CATALOG.json). Este documento é o resumo legível.

Marcação: **[E]** evidência (fonte + data, via `web_fetch` nesta sessão) · **[H]** hipótese/inferência não verificada diretamente.

---

## 1. Limitações da pesquisa (ler antes de usar o catálogo)

- **[E]** `web_search` ficou indisponível durante toda a sessão (`web_search is disabled or no provider is available`, 3+ tentativas) — igual ao que `PIXEL_ART_DIRECTION.md` já havia registrado em 2026-11-08 para outra tarefa deste mesmo projeto. Toda a pesquisa usou `web_fetch` direto em URLs conhecidas da indústria (Kenney, OpenGameArt, itch.io, Lospec), **não busca livre**. Isso significa que o catálogo reflete fontes já conhecidas/verificáveis, não uma varredura exaustiva do mercado.
- **[E]** Algumas páginas de tag do itch.io com filtro `/free/` retornaram bloqueio Cloudflare (403 "Just a moment"); contornado usando páginas de produto individuais, que carregaram normalmente.
- **[E]** `craftpix.net/freebies/` não lista os itens em texto simples via fetch (grade renderizada por JavaScript) — **nenhum asset específico da CraftPix entrou no catálogo**, porque as duas tentativas de slug plausível retornaram 404 (página genérica de "não encontrado"), e inventar uma URL violaria a regra de não inventar links. Recomenda-se que alguém com acesso a navegador real (não só `web_fetch`) revisite esse site.
- **[E]** O preço exato dos pacotes CSAF "Verdant" (os dois com melhor nota técnica/visual do catálogo) não foi confirmado nesta sessão — a página de produto não expôs o valor em texto simples via fetch. Tratar como **PAGO** até confirmação manual; **nenhuma compra foi feita**.
- Lospec (`lospec.com/palette-list`) exige navegador moderno para a busca filtrada por tag — a listagem geral carregou, mas sem filtro por "nature"/"forest" funcional via fetch puro; as duas paletas citadas (DawnBringer 32, Resurrect 64) foram verificadas individualmente por serem clássicos conhecidos do gênero, não por busca filtrada.

---

## 2. Candidatos avaliados (15 assets + 2 paletas)

| ID | Nome | Fonte | Tipo | Licença (resumo) | Preço | Nota | Status |
|---|---|---|---|---|---|---|---|
| A01 | Tiny Dungeon | Kenney | tileset dungeon/interior | CC0 | Grátis | 69 | UNDER_REVIEW |
| A02 | Roguelike/RPG pack | Kenney | tileset grande (terreno/construções) | CC0 | Grátis | 72 | **APPROVED** |
| A03 | Tiny Town | Kenney | tileset vila/overworld | CC0 | Grátis | 69 | UNDER_REVIEW |
| A04 | UI Pack — Pixel Adventure | Kenney | UI (painéis/botões/barras) | CC0 | Grátis | 72 | **APPROVED** |
| A05 | LPC Base Assets | Comunidade LPC | tileset base (grama/água/construções) | Mista: CC-BY (parcial, Sharm/Redshrike) / CC-BY-SA 3.0 / GPLv3 | Grátis | 68 | UNDER_REVIEW |
| A06 | [LPC] Forest tiles | Comunidade LPC | tileset de floresta | Mista, ver credits.txt | Grátis | 67 | UNDER_REVIEW |
| A07 | LPC Animated Water and waterfalls | ZaPaper + base LPC | água animada/cachoeiras | Dual CC-BY-SA 3.0 / GPLv3 | Grátis | 73 | **APPROVED** (com ressalva de licença) |
| A08 | LPC cliffs/mountains with grass top | Lanea Zimmerman (Sharm) et al. | tileset penhasco/montanha | CC-BY-SA | Grátis | 67 | UNDER_REVIEW |
| A09 | [LPC] Terrain Repack | Comunidade LPC | tileset de terreno | Família LPC (mista) | Grátis | 59 | UNDER_REVIEW |
| A10 | [LPC] House Insides | Comunidade LPC | interior de construções | Família LPC (mista) | Grátis | 58 | UNDER_REVIEW |
| A11 | Verdant 01 — Overworld | CSAF (csaf.itch.io) | tileset de campo | Comercial própria, sem crédito exigido | **Pago** (valor não confirmado) | 78 | APPROVED_PENDENTE_COMPRA |
| A12 | Verdant 04 — Tidewater | CSAF (csaf.itch.io) | tileset de beira d'água | Comercial própria, sem crédito exigido | **Pago** (valor não confirmado) | **91** | APPROVED_PENDENTE_COMPRA |
| A13 | PIPOYA FREE RPG TILESET 32x32 | Pipoya | tileset outdoor/indoor | Própria: uso comercial/pessoal, sem revenda | Grátis | 71 | **APPROVED** |
| A14 | Explosion Animations Pack | ansimuz | efeitos de combate (explosão) | CC0 | Grátis | **92** | **APPROVED** |
| A15 | Pixel Fantasy RPG Icons — Complete Free Collection | Caz (cazwolf) | UI (ícones) | EULA externa não lida | Grátis | 60 | UNDER_REVIEW (licença pendente de leitura) |
| P01 | DawnBringer 32 | DawnBringer / Lospec | paleta de cor | Uso livre em Lospec, sem termo formal nesta página | Grátis | — (referência) | REFERENCE |
| P02 | Resurrect 64 | Lospec | paleta de cor | Idem P01 | Grátis | — (referência) | REFERENCE |

**Nenhum asset foi comprado ou baixado para dentro do jogo nesta tarefa** — catálogo é só inventário e avaliação, conforme regra do estúdio.

---

## 3. Top 5 recomendado por bioma

### 3.1 Campo de grama
1. **Verdant 01 — Overworld** (A11, nota 78) — melhor visual/técnica, mas **pago**, pendente de aprovação de compra do fundador. Testar primeiro o sampler gratuito `csaf.itch.io/verdant-00-sample`.
2. **Roguelike/RPG pack** (A02, nota 72) — CC0, fallback sólido e sem custo.
3. **PIPOYA FREE RPG TILESET 32x32** (A13, nota 71) — gratuito, licença própria sem redistribuição.
4. **Tiny Town** (A03, nota 69) — CC0, construções complementares de vila.
5. **LPC cliffs/mountains with grass top** (A08, nota 67) — transições grama→pedra, CC-BY-SA.

### 3.2 Floresta
1. **[LPC] Forest tiles** (A06, nota 67) — melhor encaixe temático (água animada, teias, ninhos), mas **licença precisa checagem arquivo a arquivo** via `credits.txt` dentro do zip antes de aprovar.
2. **LPC Base Assets** (A05, nota 68) — usar só os arquivos com waiver CC-BY confirmado (Sharm/Redshrike).
3. **LPC cliffs/mountains with grass top** (A08, nota 67) — bordas rochosas de clareira.
4. **Roguelike/RPG pack** (A02, nota 72) — fallback CC0, mas sem tiles de floresta dedicados (só vegetação genérica).
5. **[LPC] Terrain Repack** (A09, nota 59) — referência de organização de autotile; licença ainda não confirmada.

**Gap identificado:** nenhum asset 100% livre de ambiguidade de licença e com nota ≥70 foi encontrado especificamente para floresta nesta sessão — é o bioma com maior risco de precisar de `NEEDS_CREATION` (acionar game-sprite-artist/game-world-designer) se a checagem de `credits.txt` da LPC não resolver a licença a favor do uso.

### 3.3 Beira d'água
1. **Verdant 04 — Tidewater** (A12, nota **91**, melhor nota do catálogo inteiro) — 3 sets de água animada (ressaca, recife, correnteza). **Pago**, pendente de aprovação de compra.
2. **LPC Animated Water and waterfalls** (A07, nota 73) — melhor opção **não paga**; checar a licença dual CC-BY-SA/GPLv3 antes de uso comercial amplo.
3. **Verdant 01 — Overworld** (A11, nota 78) — água rasa incluída, mas sem animação própria; pago.
4. **Roguelike/RPG pack** (A02, nota 72) — fallback CC0, água estática simples.
5. **PIPOYA FREE RPG TILESET 32x32** (A13, nota 71) — inclui tiles de água básicos no pacote outdoor.

---

## 4. Efeitos de combate e partículas

- **Explosion Animations Pack** (ansimuz, A14, **nota 92, CC0**) — melhor achado do catálogo inteiro; 7 spritesheets de explosão animada, uso comercial livre, sem crédito obrigatório.
- **Gap identificado [H]:** nenhuma fonte verificada nesta sessão cobre efeito de "corte"/"slash" simples ou "faísca" de impacto leve (o tipo de efeito mais comum para ataques corpo a corpo "sem exagero", conforme pedido no briefing). Recomenda-se uma sessão de pesquisa dedicada a esse gap específico, ou acionar `game-sprite-artist` para produção original (consistente com a regra de produção do doc 05: "se não encontrar solução adequada... criar asset original").

---

## 5. UI

- **UI Pack — Pixel Adventure** (Kenney, A04, nota 72, CC0) — melhor cobertura genérica (painéis, botões, barras de vida), já recomendado anteriormente por game-art em `PIXEL_ART_DIRECTION.md` §9.
- **Pixel Fantasy RPG Icons — Complete Free Collection** (Caz, A15, nota 60) — bom volume de ícones de item/equipamento, mas a licença está num documento externo (Google Docs) **não lido nesta sessão**; não aprovar sem ler `https://docs.google.com/document/d/1RvcwRvbgEe8ttTMSG5PmqQedFmvc13_n6hdocV4ksU4/edit` primeiro.

---

## 6. Regras de licença aplicadas

- **CC0** (Kenney, ansimuz): sem restrição, pode usar, modificar e integrar livremente, inclusive em build comercial futura. Nota de licença máxima (20/20).
- **Licença própria de autor individual** (Pipoya): permite uso comercial e edição, proíbe apenas revenda/redistribuição do pacote em si — compatível com integração no jogo, nota de licença 16/20 (não é uma licença "padrão de mercado" com jurisprudência tão testada quanto CC).
- **Licença comercial própria CSAF/Verdant**: uso comercial livre sem crédito, mas o pacote é **pago** — regra do estúdio proíbe compra sem aprovação do fundador, então o asset fica tecnicamente aprovado mas **operacionalmente bloqueado** até decisão de compra.
- **Família LPC (CC-BY-SA 3.0 / GPLv3 dual, ou CC-BY quando há waiver explícito)**: maior fonte de incerteza do catálogo. GPLv3 é uma licença copyleft forte, pouco comum e potencialmente arriscada para arte usada num jogo comercial com código sob licença diferente — **todo uso de asset LPC precisa de checagem arquivo a arquivo via `credits.txt` dentro do zip** antes de aprovação final; isso não foi feito nesta sessão (fora de escopo: a tarefa pedia inventário/pontuação, não download/extração de zips).
- **EULA em documento externo não lido** (Caz Pixel Free): tratado como `UNDER_REVIEW` até leitura — nunca aprovar licença sem ler o texto completo.

---

## 7. Próximos passos recomendados

1. Baixar e abrir o `credits.txt` dos 5 pacotes LPC (A05, A06, A07, A08, A09, A10) para resolver, arquivo por arquivo, quais tiles têm waiver CC-BY e quais ficam sob GPLv3 — decide se o bioma de floresta sai de `UNDER_REVIEW` para `APPROVED` ou `NEEDS_CREATION`.
2. Pedir ao fundador decisão de compra para a série Verdant (A11/A12 — melhores notas técnicas, mas pagas) antes de qualquer integração.
3. Ler o EULA completo do Caz Pixel Free (A15) antes de decidir sobre os ícones de UI.
4. Abrir uma sessão de pesquisa dedicada (ou acionar game-sprite-artist) para o gap de efeito de "slash"/impacto leve, não coberto por nenhuma fonte verificada aqui.
5. Revisar `craftpix.net/freebies/` manualmente com navegador real — o conteúdo é renderizado por JS e não pôde ser enumerado via `web_fetch` nesta sessão.
