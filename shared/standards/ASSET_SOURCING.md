# Asset Sourcing — pipeline de assets visuais

> **Autor:** game-art (Art Director) · **Data:** 2026-11-08 · **Status:** rascunho
>
> Marcação: **[E]** evidência (fonte + data) · **[H]** hipótese/não confirmado nesta sessão.
>
> Regra geral (`VISION.md` princípio 2): nunca copiar arte, nomes ou marcas de terceiros. Preferir **CC0**. Registrar origem e licença de todo asset usado em `assets/<categoria>/LICENSES.md`. Nunca usar asset sem licença clara.

---

## 1. Gerador de imagem aprovado pelo fundador: Recraft API (recraftv3)

Pipeline já testado com sucesso em 2026-11-08 (saída SVG vetorial, ver seção 3).

**Comando exato** (script pertence ao repositório Sharp, **não alterado**, executado apenas como consumidor externo; a chave de API fica em `~/.config/sharp-os/wa-secrets.env`, nunca lida ou exposta por este agente):

```
cd ~/projects/Sharp/sharp-os && OUT_DIR=/home/openclaw/projects/GameStudio/assets/<pasta> node scripts/ilustra-gen.mjs <nome> "<cena>" [vetor|capa]
```

- `vetor` (padrão): ilustração vetorial flat, tamanho 1365×1024.
- `capa`: still de animação 3D estilizada, tamanho 1024×1365.
- Também existem modos `noir`/`noirclaro` no script (estilo HQ), não testados por esta tarefa.

### ⚠️ Limitação confirmada [E: leitura direta de `~/projects/Sharp/sharp-os/scripts/ilustra-gen.mjs`, 2026-11-08]

O modo `vetor` (e também `capa`) **injeta automaticamente a paleta oficial da Sharp** no prompt, independentemente da cena pedida:

> `"Brand palette strictly: navy #101b2f for outlines and dark shapes, gold #c99430 accents, cream #fbfaf5 background, sand #e6e3d8 secondary surfaces, warm skin tones."`

Isso significa que **qualquer imagem gerada por este comando hoje sai nas cores da Sharp**, não nas cores do Game Studio ou de um produto específico (ex.: âmbar/grafite do Loopwright). Confirmado na prática: as 3 imagens de teste geradas para este guia (seção 3) saíram em navy/dourado/creme, não na paleta institucional do Game Studio definida em `BRAND_GUIDE.md`.

**Proposta ao coordenador (não implementada por esta tarefa):** criar um wrapper próprio do estúdio — uma cópia adaptada do script com a paleta hardcoded trocada por um parâmetro `PALETTE` configurável por projeto (Game Studio institucional, ou paleta de cada produto), para evitar recolorir manualmente toda geração. Requer decisão/aprovação do coordenador antes de criar, pois envolve duplicar lógica do repositório Sharp fora dele.

### Custo

Cada geração consome créditos pagos da conta Recraft do fundador. **`portfolio/performance/COSTS.md` ainda não existe neste repositório** (confirmado em 2026-11-08) — não foi criado por esta tarefa (fora do escopo de escrita autorizado). Registro de uso desta tarefa, para o coordenador lançar quando o arquivo existir:

| Data | Projeto | Qtde gerações | Modo | Arquivo gerado |
|---|---|---|---|---|
| 2026-11-08 | Brand Guide (Game Studio) | 3 | vetor | `symbol-01-loop-gem.svg`, `symbol-02-controller-spark.svg`, `symbol-03-pixel-leaf.svg` em `assets/branding/proposals/` |

Há também um teste anterior do dia (`assets/original/_tests/teste-recraft-gamestudio.svg`), não gerado por esta tarefa — mencionado aqui apenas para visibilidade de custo acumulado do dia.

---

## 2. Alternativas gratuitas de geração de imagem por IA

Pesquisa com web search; várias fontes retornaram bloqueio anti-bot (Cloudflare) ou 404 durante esta sessão — itens sem fonte acessível ficam marcados **[H]** com recomendação de verificação manual.

| Opção | Tipo | Free tier / limites | Licença de uso comercial da saída | Fonte |
|---|---|---|---|---|
| **Stable Diffusion (SDXL / SD 3.5)** | Open-source, local (Automatic1111/ComfyUI) | Sem limite de gerações (custo = hardware/tempo) | Stability AI Community License: gratuita para empresas com receita anual < US$1M; acima disso exige licença Enterprise paga | **[E]** stability.ai/license, verificado 2026-11-08 |
| **FLUX.1 [schnell]** | Open-source, local | Sem limite (hardware próprio) | Apache 2.0 — uso comercial livre, sem restrição de receita | **[E]** huggingface.co/black-forest-labs/FLUX.1-schnell, verificado 2026-11-08 |
| **FLUX.1 [dev]** | Open-source, local | Sem limite (hardware próprio) | Licença "Non-Commercial" própria — uso comercial da saída tem restrições; ler `LICENSE.md` antes de usar em produto vendável | **[E]** huggingface.co/black-forest-labs/FLUX.1-dev, verificado 2026-11-08; **[H]** detalhe exato do que conta como "uso comercial da saída" não totalmente claro |
| **Playground AI** | Hospedado, free tier | ~5 imagens/3h (Playground v3) + 6 créditos mensais em modelos premium | Licença "world-wide, royalty-free" já no plano gratuito — uso comercial permitido | **[E]** playgroundai.com/design/pricing, verificado 2026-11-08 |
| **Adobe Firefly** | Hospedado, free tier | Nº exato de créditos gratuitos/mês não confirmado nesta sessão | Saídas de features não-beta podem ser usadas em projetos comerciais; treinado em conteúdo licenciado/domínio público ("commercially safe" por design) | **[E]** helpx.adobe.com/firefly FAQ (atualizado maio/2026), verificado 2026-11-08; **[H]** nº de créditos não encontrado |
| **Leonardo.Ai** | Hospedado, free tier | Não confirmado — página bloqueada por proteção anti-bot nesta sessão | Não confirmado | **[H]** verificar manualmente em leonardo.ai/pricing |
| **Ideogram** | Hospedado, free tier | Não confirmado — página vazia/bloqueada | Não confirmado | **[H]** verificar manualmente em ideogram.ai |
| **Bing Image Creator / Microsoft Designer** | Hospedado, free tier | Não confirmado nesta sessão | Não confirmado | **[H]** verificar manualmente |
| **Craiyon, NightCafe** | Hospedado, free tier | Não confirmado — bloqueados por Cloudflare nesta sessão | Não confirmado | **[H]** verificar manualmente |

**Recomendação prática:** para protótipos/testes sem custo e sem depender de free tier instável, **FLUX.1 [schnell] local (Apache 2.0)** é a opção mais segura para uso comercial confirmado. Para uso imediato sem setup local, **Playground AI free tier** tem licença comercial confirmada por fonte oficial.

---

## 3. Sprites/assets prontos gratuitos

| Fonte | Licença predominante | Atribuição exigida | Uso comercial | Link | Fonte da info |
|---|---|---|---|---|---|
| **OpenGameArt.org** | Mista por item: CC0, CC-BY 3.0/4.0, CC-BY-SA, OGA-BY, GPL | Depende do item (CC0 = não; CC-BY/CC-BY-SA/OGA-BY = sim) | Sim, respeitando a licença de cada item individual | opengameart.org | **[E]** opengameart.org/content/faq, verificado 2026-11-08 |
| **game-icons.net** | CC-BY 3.0 (todos os ícones) | Sim — "Icons made by {autor}. Available on https://game-icons.net" | Sim | game-icons.net | **[E]** game-icons.net/about.html, verificado 2026-11-08 |
| **Freesound.org** (SFX, se necessário) | Mista por som: CC0, CC-BY 4.0, CC-BY-NC 4.0 | CC0 = não; CC-BY/CC-BY-NC = sim | CC0/CC-BY = sim; **CC-BY-NC = não** | freesound.org | **[E]** freesound.org/help/faq, verificado 2026-11-08 |
| **Kenney.nl** | Amplamente reportado como CC0 ("Creative Commons Zero") em toda a biblioteca | Não (CC0 não exige) | Sim | kenney.nl | **[H]** página de licença oficial não acessível nesta sessão (404/bloqueio) — **confirmar manualmente antes do primeiro uso real**, apesar de ser a licença amplamente divulgada pelo autor |
| **Google Fonts** | Majoritariamente SIL Open Font License (OFL); algumas em Apache 2.0 | OFL geralmente não exige atribuição obrigatória | Sim | fonts.google.com | **[H]** página dinâmica, conteúdo não extraído nesta sessão — fato amplamente documentado, mas sem fonte primária verificada aqui; confirmar licença individual de cada fonte na página dela antes de uso |
| **itch.io (free game assets)** | Definida por cada criador, **sem licença-padrão do site** | Varia por item | Varia por item | itch.io/game-assets/free | **[H]** página de licenciamento geral não encontrada — **sempre ler a licença específica de cada pacote antes de usar** |
| **Pixabay** | Pixabay Content License (própria, não é CC) | Não | Geralmente sim, com exceções (identificabilidade de pessoas/marcas) | pixabay.com | **[H]** página bloqueada nesta sessão — confirmar manualmente |

**Regra de registro:** antes de usar qualquer asset de terceiro num produto, registrar em `assets/<categoria>/LICENSES.md`: nome do asset, autor, fonte/link, licença exata, exigência de atribuição (texto exato se houver), data de verificação. Nunca usar um asset sem essa linha preenchida.

---

## 4. Lacunas e próximos passos

- Vários itens da seção 2 e 3 ficaram **[H]** por bloqueio de acesso (Cloudflare/404) e por rate-limit da ferramenta de busca nesta sessão (2026-11-08). Recomenda-se revalidação manual pelo coordenador ou por quem for efetivamente usar cada fonte, antes de depender dela em produção.
- Wrapper de paleta própria do estúdio para o pipeline Recraft (seção 1) é uma **proposta pendente**, não implementada.
- `portfolio/performance/COSTS.md` precisa ser criado pelo coordenador (fora do escopo de escrita desta tarefa) para registrar o uso de créditos Recraft de forma contínua.
