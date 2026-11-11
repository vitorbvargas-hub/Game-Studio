# World Map v2.1 (pintado) — GS-003

**Status:** reacao ao QA (`quality-overhaul/phase3/qa/QA_V11_WORLDMAP.md`): "Mapa-mundi — ilustracao x
procedural: **4/10**... le como mapa de regioes em cor chapada... as hachuras diagonais leem como padrao
de preenchimento vetorial/CSS, nao como textura de areia ou neve pintada a mao" + "[P1] Marcador residual
na Vila". Este pacote e **paralelo** a `worldmap-v1` (integrado atras de `?hud=v2`, `WORLDMAP_KIT_DEV.md`)
— `worldmap-v1` **nao e sobrescrito**. Mesma geometria (ilha, 6 regioes, `pos_pct`/`pos_px`, rotas — tudo
lido literalmente de `worldmap-v1/generate_worldmap.py`, 0 coordenada reinventada), pintura reescrita do
zero.

## O que mudou vs. v1 (por achado do QA)

| Achado do QA | Como foi endereçado em v2.1 |
|---|---|
| "cor chapada... hachuras diagonais leem como padrao de preenchimento vetorial" | Campo de elevacao por fbm (ruido de valor fractal bilinear-suavizado, `value_noise`/`fbm`) por bioma + sombreamento direcional por inclinacao (luz NW, `slope_shade_factor` via diferenca central do campo de elevacao) — Montanha tem neve em nuvens (nao faixa diagonal), Deserto tem dunas onduladas que seguem o relevo (`sin((x-y)*0.35 + dune_tex*8)`, nao `(x-y)%6` fixo), Zona Corrompida tem trincas em manchas (2 camadas de fbm), Floresta tem aglomerados de copa por densidade (fbm de baixa frequencia decidindo onde a copa e mais cheia, nao 1 pixel a cada 5). |
| (achado desta entrega, nao do QA, mas mesma causa raiz) fronteiras de bioma com corte Voronoi reto | Faixa de ~6px onde os 2 biomas vizinhos se misturam por um limiar de ruido por-pixel (`border_threshold`, hash determinístico — nao um dither ordenado Bayer, que criava um padrão periódico visível nos primeiros testes) — mesma ideia conceitual da "mordida de vegetação cruzando a linha" já usada pelo autotile grama↔terra do `forest-v11-ground`, aplicada à escala de mapa-múndi. |
| "agua... sem profundidade" (3 aneis solidos concentricos em v1) | Profundidade por distancia-ao-litoral (BFS a partir da costa real, não um círculo) interpolada numa rampa suave de 3 tons já existentes (cyanLt→cyan→cyanDk, 0 hex novo) + espuma quebrada na linha da costa (probabilidade por pixel, não um anel sólido) + faixas de "correnteza" de baixa frequência (fbm lenta modulando o brilho) — a transição rasa→funda acontece em ~15–20px, não num halo largo (ver antes/depois). |
| "[P1] Marcador residual na Vila" (POI assado embaixo do dinamico) | **Nenhum icone de POI e desenhado no PNG** (dia nem noite) — causa raiz eliminada por design, nao so corrigida: o jogo ja desenha TODOS os estados (here/open/locked) em tempo real via `poi_icons.png` (inalterado, copiado de v1) + `pos_px`, entao nao ha mais nenhum selo assado pra sobrar embaixo. |

## Arquivos

- `worldmap_v2_1.png` — 640x360, mesma moldura de Digivice de v1 (bezel/emblema/botoes — nao e o alvo da
  critica do QA, mantida identica), viewport 612x316 repintado.
- `worldmap.json` — mesmo schema de v1 (`image`, `canvas`, `viewport_px`, `regions[].pos_pct/pos_px/icon`,
  `routes`, `poi_icon_sheet`) com `image: "worldmap_v2_1.png"` — **mesmas 6 regioes, mesmas posicoes,
  mesmas 5 rotas** de `worldmap-v1/worldmap.json`, compativel com a integracao que `src/ui/worldmap.ts`
  ja fez (`demo_state` foi removido do schema porque nunca era consumido em runtime — o proprio
  `WORLDMAP_KIT_DEV.md` confirma que o estado real vem de `unlockState()`/`canTravel()`, nao do JSON).
- `poi_icons.png`/`poi_icons.py` — copiados sem alteracao de `worldmap-v1/` (os icones em si nunca foram
  o problema apontado pelo QA; so o PNG do mapa parou de bater-los).
- `generate_worldmap_v2_1.py` — gerador determinístico (sem seed aleatória — todo ruido é hash
  determinístico por coordenada).
- `before_after.py` + `before_after_worldmap.png` — reimplementa fielmente a pintura de
  `worldmap-v1/generate_worldmap.py` (sem importar o arquivo — v1 não expõe funções reutilizáveis, é
  uma cópia da lógica de cor/oceano/rotas/ícones) lado a lado com o viewport v2.1 (chamando as MESMAS
  funções usadas para gerar o PNG final, 0 divergência entre a prancha e o artefato entregue). Faixa de
  10px no topo: âmbar = antes (v1), ciano = depois (v2.1) — sem fonte pixel neste pipeline para rotular
  em texto.

## Veredito do diretor

**Aprovo para integração**, com uma ressalva específica (ver Limitações): este pacote ataca exatamente o
que o QA mediu 4/10 — a fronteira entre biomas deixa de ser um corte geométrico de cor sólida e passa a
ter relevo, textura orgânica e transição misturada; a água ganha profundidade real em vez de 3 anéis; e o
marcador residual da Vila é eliminado pela raiz (nenhum ícone assado, ponto final), não só reposicionado.
Isto NÃO é mais "mapa de regiões em cor chapada" — compare `before_after_worldmap.png`: o antes tem
bordas de hachura mecânica e um anel ciano espesso e uniforme ao redor da ilha; o depois tem dunas que
seguem o relevo, neve em nuvens, trincas em manchas na Zona Corrompida, e uma linha de costa que lê como
espuma/baixio, não como contorno de UI. A moldura de Digivice (bezel) foi mantida idêntica de propósito —
não era o alvo da crítica, e trocá-la sem necessidade arriscaria quebrar o CSS que já posiciona o painel
lateral sobre ela.

## Limitações (autocrítica)

- **Ainda é um mapa gerado por função matemática (fbm/voronoi/BFS), não uma pintura à mão** — comparado
  a uma referência real pintada a mão (Drakantos ou qualquer mapa-múndi de RPG comercial), o resultado é
  "procedural que lê como orgânico", não "ilustração autoral" no sentido literal. Isto é uma melhora real
  de LEITURA (o critério específico que o QA mediu — "ilustração × procedural", onde o problema citado
  era a textura ficar como preenchimento vetorial) mas não é o mesmo nível de uma pintura feita traço a
  traço; se o coordenador quer esse nível, a próxima etapa seria orçar PixelLab (`create_image_pro` numa
  tela 640×360+ em várias passagens) ou um ilustrador humano — fora do escopo de custo zero desta tarefa.
- **A faixa de mistura de fronteira (6px) foi ajustada visualmente, não medida contra uma métrica** —
  comparável à forma como `forest-v11-ground` mede sua "razão de grade" para transições de tile; aqui não
  há um numero equivalente, só inspeção visual do antes/depois e dos renders completos nesta sessão.
- **A água tem profundidade por distância à costa (BFS), não por batimetria real** — não há um "fosso"
  mais fundo no meio do oceano aberto por uma razão geográfica (correntes, fossas); é só "quanto mais
  longe da terra mais escuro", suficiente para dar textura mas não uma simulação oceanográfica.
- **Os postes da praia e os brinquedos da Vila continuam sendo decoração simples (retângulos com
  contorno)**, idêntica a v1 — não fazem parte da crítica do QA (que era sobre a textura de bioma e a
  água), então não foram redesenhados; ficam como o próximo item óbvio se o coordenador quiser mais
  detalhe autoral nesses pontos específicos do mapa.
- **As rotas continuam como linha tracejada ciano simples** — funcionais e legíveis (o QA não encontrou
  problema aqui, achado era só sobre as regiões/água), mas poderiam ganhar a mesma textura "pintada"
  (trilha de terra batida, não só pontos) numa iteração futura.
- **Nada disto foi testado no motor real** — só inspecionado via `before_after_worldmap.png` e o PNG
  final nesta sessão (sem acesso ao worktree rodando o jogo, mesma limitação já registrada pela QA
  anterior). O `worldmap.json` é compatível por construção (mesmo schema, mesmas chaves, mesma imagem
  referenciada por nome), mas a integração de fato (`src/ui/worldmap.ts` apontar para
  `worldmap-v2_1/worldmap_v2_1.png` + `worldmap.json` em vez dos de v1) é trabalho de game-dev, não
  feito aqui.
- **0 gerações do PixelLab usadas** — saldo da conta em 0,8, reservado/aguardando aprovação do fundador;
  pipeline 100% local (`art/_tools/pngw.py`, write + o novo `load_png` adicionado nesta sessão para poder
  espelhar/retonar PNGs já existentes sem PIL).

## O que o game-dev precisa ligar

1. Trocar a fonte do mapa-múndi de `worldmap-v1/worldmap_v1.png` + `worldmap-v1/worldmap.json` para
   `worldmap-v2_1/worldmap_v2_1.png` + `worldmap-v2_1/worldmap.json` em `src/ui/worldmap.ts` (mesmo
   `viewport_px`, mesmos `pos_pct`/`pos_px` por região, mesma lista `routes` — nenhuma mudança de lógica
   de posicionamento ou de cálculo de estado esperada).
2. `poi_icons.png` não mudou (cópia byte-a-byte de v1) — se o código já referencia esse arquivo por
   caminho relativo ao pacote, só o caminho do pacote muda.
3. Nenhuma mudança de `regions.json`/`regions.ts`/rotas de viagem — isto é só a camada de arte.
4. Decidir (coordenador/game-design) se v2.1 deve ser o padrão sem flag, ou continuar atrás de
   `?hud=v2` até o piloto fechar — mesmo gate de processo [P0] já levantado pela QA para v1, não resolvido
   por este pacote (é decisão de produto, não de arte).

## Regenerar

```
python3 generate_worldmap_v2_1.py && python3 before_after.py
```
