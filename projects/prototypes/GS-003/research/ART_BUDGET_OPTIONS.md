# Opções de orçamento — resolver qualidade de mapa e criaturas (GS-003)

> **Autor:** game-research (subagente) · **Data:** 2026-11-09 · **Encomendado por:** fundador (via game-studio), para subsidiar uma decisão de **orçamento** — nenhuma compra, conta ou assinatura foi feita nesta tarefa.
>
> Marcação: **[E]** evidência (fonte + data) · **[H]** hipótese/estimativa não confirmada.
>
> **Referências de estilo usadas:** `GS-003/evidence/idledex-canonical/canonical_founder_screenshot_night_forest.png` (floresta com copas grandes tipo "bolha", densidade alta, personagens pixel art nítidos) e Drakantos (referência de **composição de mundo** — floresta densa, água, construções, acabamento "AA indie" — já registrada em `docs/ART_STYLE_GUIDE.md`). Decisão de arte já tomada no estúdio: **tile = 32px**, criaturas em múltiplos de 32 por porte; 16px também é aceitável para tiles de chão/autotile.

## Limitações metodológicas [E, 2026-11-09]

- `web_search` esteve **indisponível** durante toda a pesquisa ("disabled or no provider available"). Toda a coleta foi feita via `web_fetch` direto nas páginas oficiais, com fallback a motores de busca via HTML.
- **Bloqueios confirmados por proteção anti-bot:** DuckDuckGo (captcha), Bing (resultados genéricos suspeitos de cache/bloqueio sutil), Google (403), Fiverr (403 "It needs a human touch"), ArtStation (403 Blocked), GameDevMarket (Cloudflare "Just a moment...", 403), Workana (403 Cloudflare), 99Freelas (404 nos caminhos tentados). O **feed RSS do Reddit** (`/search.rss`) foi a única via de busca que funcionou sem bloqueio.
- Várias páginas de preço (CraftPix, itch.io em alguns casos, PixelLab) renderizam o valor em **JavaScript no client-side** — `web_fetch` não executa JS, então o preço exato não apareceu no HTML estático nesses casos. Marcado [H]/"não extraível" onde ocorreu; recomenda-se checagem manual rápida (sem comprar) antes de aprovar orçamento.
- Nenhuma conta foi criada, nenhum plano foi assinado, nenhuma compra foi feita.

---

## 1. Tilesets premium top-down (16/32px)

**Fontes consultadas [E, 2026-11-09]:** CraftPix (craftpix.net/categorys/tilesets), itch.io (vários autores), LimeZu, Cainos, Cup Nooble (Sprout Lands), Game Endeavor (Mystic Woods). GameDevMarket bloqueado por Cloudflare (nenhum dado coletável). Humble Bundle: nenhum bundle ativo de tilesets/game assets encontrado em 2026-11-09 (busca JS-renderizada, não 100% conclusivo).

| # | Item | Fonte / URL | Preço [E/H, 2026-11-09] | Licença (resumo) [E] | Tile size | Biomas / temas | Autotile | Nota visual 0-100 |
|---|------|-------------|---------------------------|------------------------|-----------|-----------------|----------|---------------------|
| 1 | **Forest Top-Down Tileset Pixel Art** | CraftPix — craftpix.net/product/forest-top-down-tileset-pixel-art/ | [H] não extraível via fetch leve (widget JS); loja também oferece assinatura "All-Access" (subscription, preço não extraído) | Licença CraftPix padrão: uso comercial permitido, **pode vender/distribuir jogos** feitos com o asset, redistribuição do asset **isolado** proibida, crédito não obrigatório | **16×16** [E] | Floresta (grama, lama, água, 5 tipos de árvore incl. spruce/birch/oak, ruínas, pedras, lírios-d'água), com rio/lago **animados** | Sim (tiles de borda grama/água) | **88** — pixel art granulado genuíno, copas arredondadas, contorno nítido, paleta verde viva; o mais próximo do print de referência entre os itens pesquisados |
| 2 | Giant Mushroom Location 2D Top-Down Tileset | CraftPix | [H] não extraível | Licença CraftPix padrão (igual acima) | não informado (vetor PNG/AI/EPS escalável) | Floresta de cogumelos gigantes (casas-cogumelo, trilhas, decoração) | Sim (variações/transições de chão) | 85 — estilo vetorial liso com contorno grosso; conceito de "copa grande" combina, mas técnica diverge de pixel art granulado |
| 3 | Cave Tileset Top Down Pixel Art | CraftPix | [H] não extraível | Licença CraftPix padrão | não informado (linha 16×16) | Caverna (estalactites, cristais, lava, teias, monstro-chefe aranha) | Provável (grade de piso/parede) | 65 — tecnicamente boa, mas paleta escura/sombria destoa do tom "fofo" do print de referência |
| 4 | Green Village Top Down Pixel Art Tileset (Raven Fantasy) | CraftPix | [H] não extraível | Licença CraftPix padrão (artista terceiro, direitos comprados pela CraftPix) | **16×16, 32×32, 48×48, 64×64** [E] (múltiplas escalas) | Vila pequena (casa, cerca, barris, poço, placas) | Não mencionado | 80 — cabanas de madeira, tom outonal quente, contorno nítido; boa aderência ao estilo pedido |
| 5 | Top View Island Game Assets Pack (praia/ilha) | CraftPix | [H] não extraível | Licença CraftPix padrão | não é pixel art — vetorial liso | Praia/ilha tropical (barcos, coqueiros, docas) | Não informado | 35 — tematicamente cobre praia, mas é vetor liso sem grade de pixel; destoaria do resto do set |
| 6 | **Mystic Woods** | itch.io — Game Endeavor — game-endeavor.itch.io/mystic-woods | **[E] $3.99 USD** (pay-what-you-want, mínimo confirmado na página de checkout) | Grátis: **só uso não-comercial**, pode modificar, não pode redistribuir/revender. **Pago ($3.99+): uso comercial liberado**, mesma proibição de redistribuir/revender mesmo modificado. Crédito apreciado, **não obrigatório** | **16×16** [E] | Ambiente rústico fofo (slime, grama, água); roadmap planeja cavernas/casas/fortes (pack ainda em expansão) | Não confirmado no texto | **95** — citado no próprio briefing como benchmark de estilo; paleta vibrante, contorno pixel nítido, é o visual mais parecido com IdleDex/print de referência |
| 7 | Sprout Lands Asset Pack | itch.io — Cup Nooble — cupnooble.itch.io/sprout-lands-asset-pack | **[E] $3.99 USD mínimo** (premium) | Premium: comercial/não-comercial liberado, pode modificar, **proibido revender/redistribuir mesmo modificado**. Grátis: só não-comercial. **Crédito obrigatório** ("Cup Nooble" ou link) | 16-bit (16×16 padrão da linha) [H tamanho exato não declarado no texto] | Fazenda/vila pastel (grama, água, plantio, animais); inclui 24 animações de personagem (idle/walk/run/till/chop/water × 4 direções) | Não confirmado | 75 — paleta pastel fofa combina com o tom, mas é focado em fazenda, não floresta densa |
| 8 | **Pixel Art Top Down - Basic** (correção: autor é **Cainos**, não Cup Nooble como no briefing original) | itch.io — Cainos — cainos.itch.io/pixel-art-top-down-basic | **[E] Gratuito** | Uso livre e comercial, pode modificar, crédito não obrigatório, proibido redistribuir/revender | **32×32** [E] | Base genérica (grama, pedra, parede, 3 árvores, props) — não é um bioma fechado | Não confirmado se é autotile completo | 60 — base limpa e útil como fundação, mas pouco detalhe próprio de floresta densa |
| 9 | Pixel Art Top Down - Village | itch.io — Cainos — cainos.itch.io/pixel-art-top-down-village | **[E] $39.99 USD mínimo** (compra obrigatória, sem versão grátis) | Uso livre e comercial, pode modificar/usar para geração de IA, crédito não necessário, proibido redistribuir/revender | **32×32** [E] | Vila completa: 203 props, 20 construções, 55 plantas, terreno, tileset de terreno dedicado | Indício forte de sim (terrain tileset dedicado) | 78 — pacote robusto e profissional (inclui demo Unity), porém o mais caro da lista |
| 10 | Serene Village | itch.io — LimeZu — limezu.itch.io/serenevillage | [H] não extraível (página retornou seção de comentários na extração) | [H, por consistência com outros produtos LimeZu] uso livre comercial/não-comercial, proibido revender isolado — não confirmado nesta página específica | **16×16** [E] | Vila pequena/aconchegante (há versão gratuita "revamped") | Não confirmado | 82 (estimado pela consistência visual da linha LimeZu, muito citada como referência AA indie) |
| 11 | Fungus Cave | itch.io — LimeZu — limezu.itch.io/fungus-cave | [H] não extraível (demo com 1 tileset grátis; versão completa paga, valor não confirmado) | **[E] Licença comercial = CC-BY 4.0** (creativecommons.org/licenses/by/4.0/) — **exige atribuição**, diferente do padrão "crédito opcional" dos outros itens | **16×16** [E] | Caverna de fungos + QG de refugiados + esgotos (3 sub-temas) | Não confirmado | 70 — estilo fofo consistente, mas tema fungo/esgoto é mais nicho que caverna clássica de pedra |

**Itens citados no briefing, não verificados com confiança [H]:**
- **Ninja Adventure Premium** — não localizado com confiança no tempo disponível.
- **Time Fantasy / Seasons (Finalbossblues/Cainos)** — itch.io aplicou rate-limit (HTTP 429) antes da confirmação.
- **LimeZu Modern Exteriors/Interiors** — localizados e confirmados ($2.50 / $1.50, [E, 2026-11-09]), mas tema **urbano moderno**, não combina com floresta/vila medieval do briefing — por isso fora da tabela principal.
- **GameDevMarket** — 100% bloqueado por Cloudflare, nenhum dado coletável [E, bloqueio confirmado 2026-11-09].

### Combinações de pacote mínimo (3 biomas), preço somado

| Combo | Itens | Preço total | Observação |
|---|---|---|---|
| **A — mais barata, 100% preço confirmado** | Cainos Basic (grátis) + Sprout Lands Premium ($3.99) + Cainos Village ($39.99) | **US$ 43,98 [E]** | 3 autores diferentes → risco de inconsistência de paleta/contorno entre biomas; falta bioma de caverna/praia dedicado |
| **B — mesmo estúdio, maior compatibilidade visual** | CraftPix Forest (88) + CraftPix Green Village (80) + CraftPix Cave (65), todos mesma paleta/artista | **[H] preço não confirmado** (checkout JS) — CraftPix individual costuma ficar na faixa de US$ 9–25 por item [H, não verificado nesta sessão], ou assinatura All-Access | Melhor consistência visual entre biomas; precisa checagem manual do checkout antes de aprovar |
| **C — mais fiel ao benchmark de estilo** | Mystic Woods (95) + Serene Village (82) + Fungus Cave (70, exige atribuição CC-BY) | **US$ 3,99 confirmado + 2 preços não confirmados [H]** | Visual mais próximo do pedido pelo fundador, mas exige checagem manual de 2 dos 3 preços |

---

## 2. PixelLab e ferramentas de IA equivalentes

**Fontes [E, 2026-11-09]:** pixellab.ai (home, docs, /termsofservice, /ai-game-builder), retrodiffusion.ai (/pricing, /learn-more, /app/guide), scenario.com (/pricing). web_search indisponível; DuckDuckGo bloqueou com captcha — dados vieram de fetch direto nas páginas oficiais.

| Ferramenta | Preço de entrada | O que gera | Termos de uso do output | Risco de IP |
|---|---|---|---|---|
| **PixelLab** (pixellab.ai) | **[H] valores exatos dos planos pagos não extraíveis** (pricing carrega via JS: "Loading subscription plans..."). [E] Confirmado: há plano grátis sem cartão, modelo por créditos, tier nomeado "Pixel Apprentice" já inclui o AI Game Builder. | **[E]** Personagens com **4 e 8 direções** + suporte isométrico; animações walk/run/attack/custom via texto ou esqueleto; **"Create Map"** — tilesets e mapas top-down/side-scroller com spritesheet generator; geração de cenas/texturas; UI (botões, barras de vida); inpainting real; **Image to Pixel Art** (converte foto/render em pixel art); **Rotate** com upload de "concept image" e, opcionalmente, **"reference sprite"** para gerar as views direcionais | **[E]** ToS cláusula 3.3: usuário retém propriedade do que cria, livre para usar/modificar/distribuir os outputs para qualquer fim (comercial e não comercial), exceto treinar outros modelos com os outputs sem autorização. Mesma cláusula: usuário **assume total responsabilidade legal** por infração de terceiros no conteúdo gerado. Sujeito a licença Open RAIL-M (restrições de uso do modelo). Empresa: Pixel Heart AB (Suécia). | **Prompt só texto (criatura original inspirada):** BAIXO-MÉDIO. **Usando imagem oficial de Digimon como "reference sprite"/input em Rotate ou Image-to-Pixel-Art:** **ALTO** — a ferramenta foi desenhada para reproduzir fielmente a referência enviada; desaconselhado |
| **Retro Diffusion** (retrodiffusion.ai) | **[E]** Sem assinatura, pay-as-you-go: RD Fast $0,03/imagem, RD Plus $0,06, RD Pro $0,18; animações a partir de $0,07/run, avançadas a partir de $0,10/run; tilesets a partir de $0,06/run. Conta nova começa com $0,50 grátis, sem cartão. Recargas a partir de $5. | **[E]** Pixel art em grid real (não filtro); estilos Top Down/Isometric/Dungeon Map/Spritesheet; **Advanced Animations** (a partir de 1 frame, gera walk/idle/jump/attack/custom, inclusive a partir de upload próprio); **Animations**: walk cycles 4 direções, battle sprites, rotação 8 direções; **Tilesets** "wang-style" com export para SpriteFusion; RD Pro aceita até 9 imagens de referência | **[E]** FAQ oficial: "The art you generate is yours to use in personal or commercial projects" — licença simples, sem distinção de plano | **Prompt só texto:** BAIXO-MÉDIO. **Usando arte oficial de Digimon como frame inicial ou referência (até 9 imagens no RD Pro):** **ALTO** — desaconselhado |
| **Scenario** (scenario.com) | **[E]** Starter $15/mês (1.500 créditos), Pro $45/mês (5.000), Max $75/mês (10.000, até 25 usuários). Free: 50 créditos/dia, sem cartão. Anual: -33%. | **[E]** Plataforma multi-modelo generalista (Flux, GPT Image, Seedance, etc.), não especializada em pixel art como as outras duas; permite **treinar LoRA customizado** (10-30 imagens para estilo, **5-15 imagens para personagem específico**); galeria mostra casos de uso em jogos (wang-tiles, iso-cycles) mas não é gerador dedicado de sprite 4/8-direção | **[E]** FAQ: "All paid plans include a full commercial license. You own what you create." Free plan: **só uso pessoal/avaliação**, não comercial | **Prompt só texto:** BAIXO-MÉDIO. **Referência oficial pontual:** ALTO. **Risco extra específico:** treinar um **LoRA de personagem (5-15 imagens)** com arte oficial de Digimon para depois gerar "criaturas originais" a partir desse modelo é **ALTO e mais grave** — cria um modelo derivado treinado sobre obra protegida, não apenas uma geração pontual. Desaconselhado mesmo que o resultado pareça "diferente" |
| Layer.ai (opcional, menor relevância) | [E] Sem taxa por assento; "Creative Units", a partir de $10/mês = 300 CUs, $0,08/CU base (-25% na assinatura) | [H] Hub genérico de modelos (Flux, GPT Image, Nano Banana, etc.), sem feature nativa de 4/8-direção, animação de sprite ou tileset dedicado | Não verificado nesta pesquisa | Não avaliado em detalhe; provavelmente mesma lógica (texto=baixo-médio, referência oficial=alto) |

**Recomendação da frente 2 [H, síntese]:** para gerar as **criaturas** (não o mapa), Retro Diffusion e PixelLab são mais diretamente competitivas por serem construídas especificamente para sprites de jogo. Retro Diffusion tem preço mais transparente/testável (pay-as-you-go, $0,50 grátis para testar sem cartão) e ToS claro. PixelLab parece mais completa em recursos (inclusive "Create Map" para o próprio mapa, não só criaturas), mas o preço exato do plano pago não pôde ser confirmado nesta sessão — **checar a página de pricing logado no navegador antes de decidir**. Scenario só compensa se o estúdio quiser treinar um LoRA de estilo/personagem consistente entre todos os assets — mas treinar esse LoRA com qualquer imagem oficial de Digimon/Pokémon é o cenário de risco de IP mais sério das três ferramentas e deve ser evitado.

---

## 3. Pixel artist freelancer

**Fontes tentadas [E, 2026-11-09]:** Fiverr (403 "It needs a human touch" — bloqueado), ArtStation (403 Blocked), Reddit r/HungryArtists (**funcionou** via RSS, `reddit.com/r/HungryArtists/search.rss`), Twitter/X (não acessível sem login), Workana (403 Cloudflare), 99Freelas (404 nos caminhos tentados). **Só há evidência [E] verificada para a fonte Reddit** — as demais faixas são estimativa de mercado [H], não confirmadas ao vivo nesta sessão.

### Dados [E] verificados — r/HungryArtists (reddit.com/r/HungryArtists/search.rss, 2026-11-09)

| Post | Data | Preço/escopo |
|---|---|---|
| u/Yomnne — "[For Hire] Digital artist · Chibi · Pixelart" | 2026-11-09 | Pixel art: $30; Chibi: $30; Halfbody: $40; Fullbody: $50 |
| u/c4lamaro — "[For Hire] Pixel Art Game Assets – 4 Slots" | 2026-11-03 | Game assets **starting at $30** |
| u/awwind_px — "[For Hire] Custom Pixel Art Loading Screens & Animated Backgrounds" | 2026-11-05 | Cena animada (256×144, até 3 elementos) **starting at $80** |

Nenhum post no período coberto tinha o detalhamento exato "criatura 4 direções + walk" ou "tileset de bioma" — são serviços gerais de pixel art/assets avulsos.

### Faixas consolidadas (USD, Fiverr/ArtStation/X/BR são [H] — não verificadas ao vivo)

| Categoria | Fiverr [H] | ArtStation [H] | Reddit [E/H] | X/Twitter [H] | Brasil [H] |
|---|---|---|---|---|---|
| (a) Criatura 4 direções + walk (poucos frames) | $25–$80 | $40–$150 | ~$30 base (sem specs exatas) | $20–$100 | R$50–R$250 (~US$10–45) |
| (b) Tileset completo de 1 bioma | $50–$250+ | $100–$400 | não encontrado nesse recorte | não verificado | R$150–R$600 (~US$27–108) |
| (c) Personagem/NPC com walk cycle | $30–$120 | $60–$200 | $30 base; $80 p/ cena animada (parcial) | $25–$120 | R$80–R$350 (~US$14–63) |

**Estimativa de pacote mínimo via freelancer [H]:** ~US$ 1.000–1.300 para freelancer internacional (3 biomas × ~$150 + 10 criaturas × ~$55 + eventual personagem jogável × ~$90), ou ~R$ 3.000–5.000 (~US$ 550–900) para freelancer brasileiro. Prazo estimado: **4–8 semanas** com 1 artista em paralelo (produção sequencial de criatura por criatura).

---

## 4. Tabela final — pacote mínimo viável (3 biomas + 10 criaturas com walk)

| Combinação | Mapa (3 biomas) | Criaturas (10, 4 dir + walk) | Custo total estimado | Tempo estimado | Risco |
|---|---|---|---|---|---|
| **1. 100% tilesets premium + freelancer BR para criaturas** | Combo A (tilesets, US$ 43,98 [E]) ou B/C (a confirmar) | 10 × ~R$150 (BR) ≈ R$1.500 (~US$270) [H] | **~US$ 310–490** | Mapa: imediato (download). Criaturas: 3–5 semanas | **Baixo** — tilesets com licença comercial clara; freelancer = trabalho original sob encomenda |
| **2. 100% tilesets premium + freelancer internacional para criaturas** | idem acima | 10 × ~$55 ≈ $550 [H] | **~US$ 590–770** | Mapa: imediato. Criaturas: 3–5 semanas | **Baixo** |
| **3. Tilesets premium (mapa) + Retro Diffusion/PixelLab (criaturas, com curadoria humana)** | Combo A/B/C (US$ 44–90) | 10 criaturas × 4 dir + walk via Retro Diffusion (pay-as-you-go): ~$0,06–0,18/imagem × várias iterações + $0,07–0,10/animação ≈ **US$ 20–60 em créditos** [H], **mais horas de curadoria/revisão de alguém do estúdio** (não incluídas no preço) | **~US$ 65–150 em créditos** (+ tempo interno de curadoria) | Mais rápido: dias, não semanas — mas exige revisão humana iterativa para consistência de estilo entre as 10 criaturas | **Médio** — ToS das ferramentas é favorável (output é seu), mas depende 100% de **nunca** usar imagem oficial de Digimon como referência/input; exige disciplina de prompt e revisão de originalidade por criatura (checklist já existente em `ART_STYLE_GUIDE.md` §riscos) |
| **4. 100% freelancer (mapa custom + criaturas), internacional** | 3 × ~$150 ≈ $450 [H] | 10 × ~$55 ≈ $550 [H] | **~US$ 1.000–1.300** | **4–8 semanas** | **Baixo**, mas maior custo e prazo; melhor opção se quiser 100% original sob encomenda e nenhuma dependência de IA |
| **5. 100% freelancer, Brasil** | 3 × ~R$550 ≈ R$1.650 (~$300) [H] | 10 × ~R$150 ≈ R$1.500 (~$270) [H] | **~US$ 550–900 (~R$3.000–5.000)** | 4–8 semanas | **Baixo** |

---

## 5. Recomendação

**[H, síntese do estúdio]** A combinação de **melhor custo-benefício para resolver mapa E criaturas dentro de um orçamento pequeno** é a **Opção 3**: comprar um tileset premium mesmo-estúdio (Combo B, CraftPix Forest+Village+Cave, ou Combo C se os 2 preços pendentes forem baixos) para resolver o mapa imediatamente por um valor confirmado baixo (US$ 4–90), e usar **Retro Diffusion** (preço mais transparente e testável que PixelLab nesta pesquisa) para gerar a base das 10 criaturas por um custo de créditos muito baixo (dezenas de dólares), **com revisão humana obrigatória** de cada criatura antes de aprovar (silhueta, paleta, consistência de contorno) — reaproveitando o checklist de originalidade já existente em `ART_STYLE_GUIDE.md`.

Se o fundador preferir **risco zero de IP e não quiser lidar com curadoria de IA**, a **Opção 1/2 (tileset premium + freelancer para as criaturas)** é a alternativa mais segura e ainda barata (US$ 310–770), só trocando velocidade (3–5 semanas vs. dias) por previsibilidade total de originalidade — um freelancer humano produzindo a partir de descrição textual elimina de vez o risco de "referência oficial acidental" que as ferramentas de IA carregam.

A **Opção 4/5 (100% freelancer)** só se justifica se o estúdio quiser um artista único responsável por mapa e criaturas desde o início (melhor consistência de estilo entre os dois), aceitando o custo mais alto (US$ 550–1.300) e o prazo mais longo (4–8 semanas).

**Não recomendado como ponto de partida:** gerar tiles de mapa via PixelLab/Retro Diffusion/Scenario sem antes comparar com um tileset premium pronto — tilesets como Mystic Woods e CraftPix Forest já atingem nota visual 85–95/100 de compatibilidade por **US$ 4–90**, valor dificilmente competitivo de bater gerando e curando tiles via IA do zero.

---

## 6. O que falta verificar manualmente (sem comprar)

1. Preço exato dos 3 itens CraftPix da Combo B (checkout carrega valor via JS — abrir no navegador, sem finalizar compra).
2. Preço de Serene Village e Fungus Cave (LimeZu) — páginas de checkout itch.io não renderizaram o valor em `web_fetch`.
3. Valores exatos dos planos pagos do PixelLab (pricing carrega via JS).
4. Ninja Adventure Premium e Time Fantasy/Seasons — não localizados com confiança (itch.io aplicou rate-limit 429 durante a pesquisa).
5. Faixas de preço Fiverr/ArtStation/X ao vivo — bloqueadas por proteção anti-bot nesta sessão; os valores usados são estimativa de mercado [H], recomenda-se checagem humana direta (um navegador logado não sofre o mesmo bloqueio que `web_fetch`).
