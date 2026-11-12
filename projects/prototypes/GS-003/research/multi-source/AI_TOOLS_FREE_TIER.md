# GS-003 — Ferramentas de IA de pixel art: free tier, 1º plano pago, recursos e termos

**Autor:** game-research (subagente) · **Data:** 2026-11-11 · **Encomendado por:** fundador (via game-studio).

> Marcação: **[E]** evidência (fonte + data) · **[H]** hipótese/estimativa não confirmada.
> **Custo zero:** nenhuma conta nova criada, nenhum cartão cadastrado. O saldo do PixelLab citado abaixo é o **da conta do estúdio já existente** (consultado via `get_balance`, ferramenta MCP já conectada — não é uma conta nova desta tarefa).

---

## 1. Retro Diffusion (retrodiffusion.ai) [E, 2026-11-11, fetch direto em `/pricing`]

**Modelo:** pay-as-you-go, **sem assinatura obrigatória**. Preço mostrado em cada botão antes de gerar.

| Item | Preço |
|---|---|
| RD Fast | $0,03/imagem |
| RD Plus | $0,06/imagem |
| RD Pro | $0,18/imagem |
| RD Mini | a partir de $0,03/imagem |
| Animações | a partir de $0,07/run |
| Animações avançadas | a partir de $0,10/run |
| Tilesets | a partir de $0,06/run |
| Modelos Low-Poly 3D | a partir de $0,10/modelo |

- **Free tier real:** conta nova começa com **$0,50 de saldo, sem cartão** — dá pra ~16 imagens RD Fast ou ~2 imagens RD Pro. Gerações com falha são reembolsadas automaticamente. Saldo **nunca expira**.
- **"1º plano pago":** não existe "plano" no sentido de assinatura — o primeiro degrau de gasto real é uma recarga, a partir de **$5** (≈166 imagens RD Fast ou 27 RD Pro). Recargas ≥$50 ganham +10% de bônus.
- **Recursos de mapa/animação/referência [E, já documentado em `research/ART_BUDGET_OPTIONS.md`, 2026-11-09, não re-verificado agora]:** estilos Top Down/Isometric/Dungeon Map/Spritesheet; "Advanced Animations" (gera walk/idle/jump/attack/custom a partir de 1 frame, aceita upload próprio); walk cycles em 4 direções, rotação 8 direções; "Tilesets" wang-style com export para SpriteFusion; RD Pro aceita até 9 imagens de referência.
- **Termos de uso do output [E, 2026-11-09]:** FAQ oficial — "A arte que você gera é sua para usar em projetos pessoais ou comerciais", sem distinção por plano.
- **Avaliação [E]/[H]:** prompt só texto (criatura original) = risco baixo-médio de IP. **Usar sprite oficial de Digimon como referência/frame inicial (até 9 imagens no RD Pro) é desaconselhado para o caso comercial**, mas no contexto atual (fan game não comercial, fundador já autorizou Digimon idênticos aos oficiais — ADR-009 + decisão de 2026-11-11) o cenário de "referência oficial" deixa de ser o risco crítico que seria num produto comercial; ainda assim, usar RD para **gerar o mapa/cenário** (não a criatura) a partir de texto puro continua sendo a aplicação mais segura e mais barata desta ferramenta para o GS-003.

---

## 2. PixelLab (pixellab.ai) [E misto + observação direta da conta, 2026-11-11]

### 2.1 O que o plano grátis realmente dá — **observado diretamente nesta sessão**

A conta do estúdio já conectada ao MCP do PixelLab está em `subscription: "trial"` **[E, `get_balance`, 2026-11-11]**:

- **40 gerações totais** no pacote trial (`generations_total: 40`).
- **Bônus diário de até +5 gerações/dia** (`generations_today`), que só é gasto depois que o pacote principal (`generations_remaining`) chega a zero, e **recarrega sozinho todas as noites até um teto de 20** — ou seja, mesmo esgotado o trial de 40, a conta continua recebendo algumas gerações grátis por dia indefinidamente (não precisa virar paga para continuar gerando algo, só em volume bem menor: até ~5/dia).
- **Sem cartão cadastrado** para esse trial — confirma o que a página pública (`/ai-game-builder`) também afirma: "No credit card required".
- Pequenas ações (melhorar prompt, estimar esqueleto, reduzir cores, importar sprite) custam fração de geração (0,05 a 0,25) e não aparecem como "job" — rodam de forma quase gratuita dentro do mesmo saldo.

Esse é o dado mais confiável desta seção porque é **observação direta do produto em uso**, não leitura de página de marketing.

### 2.2 1º plano pago

- **[E, confirmado por texto da página `/ai-game-builder`, 2026-11-11]:** o **AI Game Builder** (gerador de jogo completo a partir de descrição em chat, Phaser 4 + TypeScript, multiplayer incluso, hospedagem em `seujogo.pixellab.run`) está incluído **a partir do tier "Pixel Apprentice" (Tier 1)** — ou seja, esse é o nome do primeiro plano pago que desbloqueia o Game Builder.
- **Valor exato em USD do Tier 1 "Pixel Apprentice": não extraível nesta sessão [H].** A página `/pricing` não existe mais no caminho testado (404 — a página observada 2 dias antes em `ART_BUDGET_OPTIONS.md` também já reportava "Loading subscription plans..." renderizado via JS). O sitemap oficial (`pixellab.ai/sitemap.xml`, lido nesta tarefa) **não lista mais nenhuma URL de pricing** — as páginas atuais listadas são `/`, `/pixellab-api`, `/ai-game-builder`, `/image-to-pixel-art`, `/pixel-art-vfx-generator`, `/mcp`, `/enterprise`, `/create`, `/create-character`, `/docs*`, `/termsofservice`, `/refundpolicy`, `/privacypolicy` — nenhuma delas é uma página de preços estática. **Recomendação:** checar o preço do Tier 1 logado no app (`app.pixellab.ai` ou equivalente), sem finalizar compra, antes de decidir orçamento.

### 2.3 Recursos de mapa/animação/referência

Via as próprias ferramentas MCP do PixelLab (evidência direta de uso, não de marketing) e a página `/ai-game-builder`:

- **Mapa:** `create_map` (mapa vazio semeado por um tileset), `create_topdown_tileset`/`create_tiles_pro` (Wang tiles, tilesets conectáveis, inclusive com transição de terreno), `create_building_kit` (kit de construção com paredes/portas/piso), `create_room` (sala pintada com tema), `edit_map`/`place_map_object`/`place_map_tiles` (pintura/posicionamento), `inpaint_map` (regenerar uma área do mapa com IA). O AI Game Builder consome esses mapas direto num template Phaser 4 top-down ou side-scroller já pronto.
- **Animação:** `animate_character` (4/8 direções, templates como walk/idle/attack, ou texto livre, ou pose por esqueleto), `animate_object`, `create_normal_map` (mapa de normais pra iluminação 2D).
- **Referência:** `create_character(mode="v3", reference_image_url=...)` reproduz fielmente uma imagem de referência enviada como a view "south" do personagem; `create_image_pro`/`create_image_pro_flash` aceitam `style_image`/`reference_images` para copiar estilo ou conteúdo de uma imagem existente.
- **Termos de uso do output [E, já documentado em `ART_BUDGET_OPTIONS.md`, 2026-11-09, reconfirmado nesta sessão pela instrução de servidor MCP visível no próprio ambiente]:** ToS cláusula 3.3 — usuário retém propriedade do que cria, livre para usar/modificar/distribuir para qualquer fim (comercial e não comercial), exceto treinar outros modelos com os outputs sem autorização; usuário assume responsabilidade legal por infração de terceiros no conteúdo gerado; sujeito a licença Open RAIL-M; empresa Pixel Heart AB (Suécia).
- **Avaliação de risco de IP [H, herdado e ajustado ao contexto de hoje]:** como o fundador já autorizou Digimon idênticos aos oficiais no fan game, usar uma imagem oficial de Digimon como `reference_image` no PixelLab para **gerar a criatura** passa a ser uma decisão de produto já aprovada (não um risco a mitigar) — o ToS só exige que o estúdio assuma a responsabilidade pela originalidade/direitos do que for gerado, o que já está coberto pelo rights layer `official-fan-use` registrado em ADR-009. Para o **mapa/cenário**, gerar a partir de descrição em texto (sem referenciar nenhum screenshot de jogo Digimon oficial) continua sendo a prática mais segura e mais barata.

---

## 3. SpriteCook (spritecook.ai) [E, 2026-11-11, fetch direto em `/` e `/pricing`]

- **O que é:** ferramenta de IA + API + servidor MCP para gerar e animar arte 2D de jogo (pixel art e "detailed/HD 2D"): personagens, itens, props, inimigos, ícones, UI, tilesets, texturas. Animação é "image-to-animation" (anima um asset já existente, não texto→vídeo). Disponível como web app, API REST e MCP (compatível com Claude Code, Codex, Cursor, OpenCode, VS Code).
- **Free tier [E, `/pricing`, 2026-11-11]:** **40 créditos grátis a cada 30 dias, sem cartão.** 1 imagem custa 8-12 créditos (padrão 12), 1 animação custa 20-26 créditos (padrão 26) — ou seja, o free tier dá para **~3 imagens ou ~1-2 animações por ciclo de 30 dias** no modelo padrão.
- **1º plano pago:** **Starter, US$ 8/mês** (excl. IVA) — 800 créditos/mês (≈66 imagens ou 30 animações), até 4 variações por geração, assets privados, export Unity/Godot/sprite sheet, "Edit with Agent", créditos não usados rolam para o mês seguinte. Planos seguintes: **Adventurer US$ 30/mês** (3.000 créditos) e **Archmage US$ 70/mês** (7.000 créditos).
- **Recursos de mapa/animação/referência [E]:**
  - **Mapa/tileset:** "Tileset Base Generator" (**ferramenta grátis**, mesmo fora de plano pago — gera bases de 15 peças top-down e folhas de referência isométrica 2:1 pra detalhar depois); "Dual Grid Tileset Template" (**grátis**, template de 15 peças em 16/32/48/64px com testador de pintura de terreno in-browser).
  - **Animação:** gerador de personagem anima em side view, top-down 4 direções ou isométrico, com movimentos customizados, exportando pra Godot/Unity/Phaser/Roblox.
  - **Referência:** aceita imagem de referência como entrada; "tema" salvo trava paleta/humor/estilo entre gerações subsequentes pra manter consistência num pacote de assets.
  - **Ferramentas gratuitas extras (sem precisar de créditos nem conta):** removedor de fundo, gerador de contorno pixel-perfect, detector de grid de pixel, slicer de sprite sheet, conversor imagem→pixel art — todos listados como "Free Pixel Art Tools" no próprio site.
- **Termos de uso do output [E, `/pricing` FAQ, 2026-11-11]:** **"Yes. Pode usar a arte comercialmente, em todo plano, incluindo o Free. Não precisa creditar o SpriteCook."** Ressalva: aplicam-se os Termos de Serviço do SpriteCook **e os termos dos provedores de IA por trás dos modelos** (não detalhado quais provedores são esses nesta página).
- **Avaliação de risco de IP [H]:** termos mais permissivos e mais claros dos 4 itens avaliados nesta seção — uso comercial liberado até no tier grátis, sem exigência de crédito. Mesma lógica de cautela de referência oficial se aplicaria num cenário comercial; no fan game atual (não comercial, Digimon oficiais já autorizados) o risco principal se desloca para a cláusula "termos dos provedores de IA por trás dos modelos", que **não foi possível identificar/ler nesta sessão** (não linkada diretamente na página consultada) — recomenda-se checar os Termos de Serviço completos (`spritecook.ai/terms`) antes de um uso intensivo.

---

## 4. Sprixen (sprixen.com) [E parcial / H, 2026-11-11]

- **O que é [E, página inicial]:** gerador de assets de jogo com IA cobrindo **sprites 2D, animações, modelos 3D e "mundos"** numa consistência de estilo única por projeto. Tem "2D Studio" (pintar em cima do sprite e regenerar), "3D Studio" (props/criaturas restyled a partir de ~6.900 modelos de biblioteca, exportados em GLB, "seu agente pode fazer tudo isso via MCP") e "VFX Studio" (efeitos de magia/fogo/impacto, export de spritesheet + WebM transparente).
- **Free tier, preço do 1º plano pago, termos de uso: não extraíveis nesta sessão [H].** A página `/pricing` carrega como SPA client-side ("Loading Sprixen...") e não renderizou conteúdo via `web_fetch`; `/faq` retornou 404. Toda interação de fato (gerar algo) parece exigir login (`sprixen.com/login?...`), e não há indicação na home de um tier gratuito explícito — **diferente de PixelLab, Retro Diffusion e SpriteCook, que anunciam "sem cartão"/"grátis" na própria home/pricing**, Sprixen não deixou essa informação visível sem login.
- **Recursos de mapa/animação/referência [E, só pela descrição da home, não verificado em uso real]:** tem "3D Studio" com props/construções restyled a partir de uma biblioteca (mais próximo de "kit de nível 3D customizável" do que de "mapa 2D top-down"); não há menção explícita a tileset 2D top-down ou formato de mapa compatível com Tiled/`.tmj` na página inicial.
- **Avaliação:** **ferramenta menos madura para o caso de uso do GS-003** entre as 4 avaliadas — o foco aparente é 3D estilizado + VFX, não pixel art 2D top-down clássico de RPG. Não recomendado investir tempo de investigação adicional nela para o problema de mapa/criatura 2D do GS-003 sem antes confirmar (login, sem comprar nada) se há mesmo um tier grátis utilizável.

---

## 5. Tabela-resumo comparativa

| Ferramenta | Grátis sem cartão? | O que o grátis dá | 1º plano pago | Recurso de mapa 2D top-down? | Uso comercial no free? |
|---|---|---|---|---|---|
| **Retro Diffusion** | ✅ Sim ($0,50 saldo) | ~16 imagens RD Fast | Não é assinatura — recarga a partir de $5 | ✅ Sim (Tilesets wang-style, Dungeon Map style) | ✅ Sim [E, 2026-11-09] |
| **PixelLab** | ✅ Sim (confirmado: 40 gerações trial + até 5/dia depois) | Praticamente todo o conjunto de ferramentas (personagem, mapa, animação), em volume reduzido | **Pixel Apprentice (Tier 1)** — valor exato **[H] não extraível** | ✅ Sim (`create_map`, `create_topdown_tileset`, `create_building_kit`, `create_room`) | ✅ Sim (ToS 3.3) |
| **SpriteCook** | ✅ Sim (40 créditos/30 dias) | ~3 imagens ou 1-2 animações por ciclo + ferramentas grátis ilimitadas (tileset base, remoção de fundo, outline, slicer) | **Starter US$ 8/mês** (800 créditos) | ✅ Sim (Tileset Base Generator e Dual Grid Template são **grátis mesmo fora do free tier de créditos**) | ✅ Sim, em **todo** plano incl. Free, sem crédito obrigatório |
| **Sprixen** | **[H] não confirmado** | **[H] não confirmado** | **[H] não confirmado** | ⚠️ Foco aparente em 3D/VFX, não top-down 2D clássico | **[H] não confirmado** |

**Leitura rápida para o GS-003 [H, síntese]:** **SpriteCook** tem a oferta grátis mais transparente e mais permissiva em termos de uso (comercial liberado até no Free, sem crédito, ferramentas de tileset gratuitas sempre disponíveis) — mas o volume de créditos free é pequeno (poucas imagens por mês). **PixelLab** já está em uso no estúdio (trial ativo, 40 gerações + bônus diário) e tem o conjunto de ferramentas de mapa mais completo (geração de mapa inteiro, não só tileset base) — vale esgotar o trial atual e, se precisar de mais volume, localizar o preço real do Tier 1 antes de decidir. **Retro Diffusion** é o mais barato por geração individual se o uso for pontual (pay-as-you-go sem assinatura). **Sprixen** precisa de investigação adicional (login sem compra) antes de entrar em qualquer comparação de custo real.

---

## 6. Limitações desta pesquisa [E, 2026-11-11]

- `web_search` indisponível durante toda a sessão.
- Preço exato do Tier 1 "Pixel Apprentice" do PixelLab não extraível via `web_fetch` (página de pricing não existe mais no caminho testado; sitemap oficial não lista nenhuma página de preços) — **o dado mais confiável sobre PixelLab nesta tarefa é a observação direta do saldo da conta real do estúdio via `get_balance`**, não uma página de marketing.
- Sprixen: pricing e termos de uso **não confirmados** — página carrega via JavaScript client-side, sem conteúdo estático capturável por `web_fetch`; `/faq` não existe no caminho testado.
- Dados de Retro Diffusion sobre recursos de mapa/animação/referência foram **reaproveitados** de `ART_BUDGET_OPTIONS.md` (2026-11-09), não re-verificados agora (só o `/pricing` foi reconferido nesta tarefa, sem mudança de valores).
- Nenhuma conta nova foi criada em nenhuma das 4 ferramentas; nenhum crédito foi gasto gerando imagem de teste.
