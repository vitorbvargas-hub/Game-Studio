# QA — Ficha holográfica + árvore de evolução (HUD v2), forest-v12-plateau-night, worldmap v2.1

- **Autor:** game-qa · **Data:** 2026-11-11 · **Custo:** 0 gerações PixelLab, 0 código/arte alterado (só leitura + relatório).
- **Revisado:**
  - **A)** commit `ab41fcf` na branch `quality-overhaul` (worktree `workspaces/game-dev/qo`) — `phase3/hud/HOLO_CARD_DEV.md` + capturas `hc_*`/`fix_*` (1920×1080, dia/noite).
  - **B)** `projects/prototypes/GS-003/art/map-factory/forest-v12-plateau-night/` (master, commit `e506b0a`) — README, `before_after_20x12.png`, `preview.png`, `tileability_check.png`.
  - **C)** `projects/prototypes/GS-003/art/map-factory/worldmap-v2_1/` (master, commit `e506b0a`) — README, `before_after_worldmap.png`, `worldmap_v2_1.png`.
- **Método:** leitura dos 2 relatórios de dev + `VIDEO_IDEAS_SPEC.md` §3 + `QA_HUD_FB1_COMPARE.md` + `QA_V11_WORLDMAP.md`; inspeção visual direta das imagens citadas (copiadas para fora dos worktrees, só para visualização — nada alterado na origem); conferência cruzada de 1 medida numérica (`hc_capture.json`: `tamerWidth: 120`, `%` dos nós da árvore) contra o que as capturas mostram. **Não rodei** `npm test`/build/capturas novas — os números citados (439 testes, `map:validate` 6/6) são autoatestados pelo dev, não verificação independente minha.
- **Legenda:** **[E]** evidência (arquivo/captura citada) · **[H]** hipótese/julgamento meu.

---

## A) HUD v2 — correções do QA + ficha holográfica (commit `ab41fcf`)

### A.1 Correções do `QA_HUD_FB1_COMPARE.md`

| Achado anterior | Nota 0–10 | Veredito |
|---|---|---|
| **[P1] Arco não lê como arco** (raio 120px, ~90°) | **6** | **Parcial, melhorou de verdade mas não é um "leque" óbvio.** Medi a geometria na captura `fix_aberto_dia_canto.png` [E]: os 6 ícones caem num raio visualmente consistente (~85–91px em tela escalada, compatível com os 140px declarados) e varrem ~95° (de oeste a quase-sul), batendo com o `90°→184°` do relatório. O trilho `.dg-rail` (linha ciano tracejada) de fato conecta os 6 ícones e ajuda a leitura de "percurso", não "menu solto". **Mas** a curvatura só é óbvia matematicamente, não ao olhar rápido: os 3 últimos ícones (ghost/mail/config) ficam quase na mesma linha horizontal — correto para quem está perto do ponto sul do círculo (tangente horizontal), mas para o jogador lê mais como "corrente em L com uma dobra" do que como um leque simétrico espalhado. É uma melhora real e documentada (teste `digivice.test.ts` com asserções de raio/abertura/flecha), mas eu não chamaria de "lê como arco" sem reserva — chamaria de "lê como circuito curvo de 1 dobra", o que resolve o P1 original (não é mais retangular/diagonal solto) mas fica aquém do "leque" que a spec original de referência sugeria. Dia e noite têm a mesma leitura [E, `fix_aberto_dia_canto.png`/`fix_aberto_noite_canto.png`].
| **[P1] Ranking com bots nomeados vs. spec** | **n/a (decisão de produto)** | Reconfirmado visualmente [E, `fix_chefe_2_ativo_dia.png`]: rótulo "BOT · simulado" continua visível em cada linha de bot. Isto é uma decisão do coordenador registrada pelo dev, não um defeito de qualidade — não pontuo, só confirmo que a execução visual (rótulo nunca escondido) se mantém.
| **[P2] Tamer 120px** | **9** | **Resolvido e verificado.** `hc_capture.json` [E] confirma `tamerWidth: 120` medido no DOM (não só alegado), e a captura `hc_tamer_barra_dia.png`/`_noite.png` [E] mostra o bloco proporcional, sem corte de texto ou barra, nas duas condições de luz. A barra foi reduzida para 58px para caber (68px da spec não cabia com 120px externo) — é um desvio documentado da spec original, mas a decisão (medida externa prevalece) foi do coordenador, então não é um achado novo.
| **[P2] Grama alta +10% saturação** | **5** | **Implementado no código, não confirmável a olho.** Comparei `hc_grama_v1_dia_centro.png` × `hc_grama_v2_dia_centro.png` [E] pixel a pixel visualmente: a diferença é imperceptível nas duas capturas — concordo com a autoavaliação do próprio dev de que a prova real é o teste unitário (`hud-v2.test.ts`), não a imagem. Para fins de QA visual, o critério "legibilidade em jogo" continua não atendido por captura (seria preciso uma ferramenta de diff de pixel, que não tenho neste ambiente) — tratar como resolvido-no-código, não resolvido-visualmente.

### A.2 Ficha holográfica + árvore de evolução (`VIDEO_IDEAS_SPEC.md` §3, P0)

| Critério de aceite da spec §3 | Nota 0–10 | Observação |
|---|---|---|
| **Leitura/clareza** | **8** | A ficha com anel de scanner (retrato 96px, aro ciano duplo) lê claramente como "instrumento", não como card quadrado [E, `hc_ficha_dia.png`, `hc_ficha_noite.png` — tela cheia 1920×1080]. Hierarquia (nome/nível → PV/XP → atributos → afinidade → próxima evolução) é limpa e sem ambiguidade nas duas condições de luz.
| **Árvore: nós, arestas, hierarquia** | **8,5** | Testada em 3 profundidades (Guilmon Nv.5 sem ramo; Agumon Nv.10 com ramo Greymon/GeoGreymon; Agumon Nv.20 com os dois a 100%) [E, `hc_arvore_dia.png`, `hc_arvore_ramo_nv10_dia.png`, `hc_arvore_ramo_nv20_dia.png`]. Hierarquia passado→atual→futuro é imediatamente legível, aresta em "degrau" de circuito, nó elegível em dourado com botão "Evoluir" visível e funcional na captura Nv.20 [E, anel 100% dourado + "pronta para evoluir"]. Nó sem arte (`GeoGreymon`) aparece com "?" na moldura — falta de asset, documentado, não falha de UI.
| **% só de `pathStatuses()`/`ReqCheck`** | **9** | Confirmei por amostragem cruzada: Nv.10 mostra Greymon 62%/GeoGreymon 67% [E, `hc_capture.json` + `hc_arvore_ramo_nv10_dia.png`, números batem entre JSON e captura], Nv.5 mostra Growlmon 31% — consistente com a fórmula documentada. Não recalculei a fórmula eu mesma linha a linha (confio no teste do dev), mas não há sinal de número "mágico" nas capturas.
| **O que falta acessível sem 3º menu** | **9** | Tooltip do nó Greymon mostra "✗ Nível 16 (10)" em vermelho + "Ramo: Dawn & Dusk LV 18, Dragon EXP 280+" [E, `hc_arvore_ramo_nv10_dia_tooltip.png`] — texto legível, sem precisar abrir mais nada, exatamente como o critério pede.
| **Ramificação via `forksAhead`, nada hardcoded** | **n/v (código, não captura)** | A estrutura visual (1 nó se ramificando em 2) é consistente com o que a spec descreve, mas verificar "nada hardcoded" exige ler o código/teste, fora do escopo desta QA visual — aceito por autorrelato do dev (`forksAhead` ⇔ `node.fork`, testado).
| **Cadeado de traço (item 2 da spec)** | **n/a** | O próprio dev marca como "não feito" por falta de dado (afeto/disciplina não existem na sim) — não é uma lacuna desta entrega, é uma dependência de outro item da spec (item 2), corretamente adiada.

### Notas consolidadas — A)

| Item | Nota |
|---|---|
| Correções do QA anterior (arco/bots/Tamer/grama) | **7** (média ponderada: Tamer forte, grama fraca em prova visual, arco parcial) |
| Ficha holográfica + árvore (P0 da spec) | **8,5** |

### Achados — A)

- **[P1]** O arco do Digivice ainda não lê como um "leque" espalhado de relance — lê como um trilho em L de 1 dobra (oeste→sul). Isto **resolve** o P1 original (não é mais diagonal/retangular solto, tem raio/abertura corretos e um trilho visual conectando os ícones), mas não atinge o nível de "arco óbvio" que normalmente se espera de uma referência de leque radial. **Dono: game-design**, decidir se aceita esta leitura como suficiente ou se vale abrir ainda mais o ângulo (120–140°) para a curvatura ficar visível em mais de 1 ponto do trajeto, não só nas pontas.
- **[P2]** A saturação +10% da grama alta (`boostEncGrass`) está no código e no teste, mas segue **sem prova visual em captura** — não é um erro do dev (ele documenta a mesma limitação), só reforço que esta QA também não conseguiu confirmar a olho; se o critério de aceite exige confirmação visual, ele continua pendente nesse sentido estrito.
- **[P2]** A ficha só abre pelo retrato do parceiro (sem atalho no arco nem no Equipe & Box) — descobribilidade baixa, já sinalizado como hipótese pelo próprio dev. Concordo que, se o QA de usabilidade (fora do escopo desta leitura) achar baixa a descoberta, um botão no Equipe & Box é mais barato que um 7º atalho no arco.
- **Positivo:** o exemplo numérico da spec (§3, "≈61%") está matematicamente errado (a fórmula correta dá 73,8%, como o próprio relatório do dev observa) — recomendo ao game-design corrigir o exemplo em `VIDEO_IDEAS_SPEC.md`, para não confundir QAs futuras que tentem reconferir a conta.

---

## B) forest-v12-plateau-night (master, commit `e506b0a`)

### Notas

| Critério | Nota | Observação |
|---|---|---|
| **Lip da borda norte do platô** | **6,5** | Na prancha `before_after_20x12.png` [E] dá para ver uma faixa de textura diferenciada (tufos/sombra) na fileira superior do platô, mas a prova usa uma planta simétrica pequena (10×6) e a borda norte fica parcialmente cortada pelo enquadramento da imagem — não consigo confirmar com total segurança, só pela imagem, que a transição "lê" como musgo caindo sobre uma face a distância de jogo normal (câmera real), só que ela existe e é visualmente distinta da grama ao redor na prancha disponível. `tileability_check.png` [E] confirma que a repetição 6×6 do topo do mirante noturno **não tem costura visível** — textura contínua, sem linha de grade perceptível. **Recomendo conferência em jogo real** (fora do escopo de custo zero desta QA) antes de aceitar como 100% resolvido — a prancha estática é um bom indício, não uma prova definitiva em contexto de câmera de jogo.
| **Noite pintada (terra + mirante) vs. tint** | **7,5** | Comparando as duas metades de `before_after_20x12.png` [E, dia em cima/noite embaixo] e o grid `preview.png` [E, linhas "LIP...DIA" vs "...NOITE PINTADA" lado a lado], a paleta noturna muda de matiz (verde→azul-violeta), não só escurece o mesmo tom — isso é consistente com "pintado com paleta própria" e diferente de um tint uniforme (que preservaria o matiz verde, só mais escuro). Dá para perceber a diferença de matiz com clareza nas tiras de preview. Não tenho como medir "matiz idêntico ao `GradeRule.night`" numericamente (seria preciso extrair valores RGB, sem ferramenta neste ambiente) — aceito a alegação "é pintura, não tint" como visualmente plausível, não matematicamente verificada por mim.
| **Variedade de copa (flip/tom, item 6)** | **n/v** | Não inspecionei `canopy-edge-variety/` nesta rodada (fora do escopo direto da tarefa, que pedia foco em lip/noite); o README documenta a entrega como "regra documentada, não implementada no jogo" — fica como pendência de verificação futura.

### Notas consolidadas — B)

**7/10** — resolve as duas pendências do v11 com técnica correta (repintura por paleta, não tint; lip com sombra/musgo e variação por seed) e sem costura de tile, mas a prova visual disponível (planta pequena, enquadramento cortado) não é suficiente para confirmar 100% a leitura em câmera real de jogo.

### Achados — B)

- **[P2]** A prova (`before_after_20x12.png`) usa uma planta de mirante pequena (10×6) e a fileira norte fica parcialmente cortada pelo enquadramento da imagem fornecida — recomendo ao game-art/game-dev gerar (ou capturar em jogo) uma prova com a borda norte inteiramente visível antes de fechar este item como 100% confirmado.
- **[P2]** README do próprio pacote já documenta: lip só cobre o lado norte (não leste/oeste), canto interno (reentrância) sem peça própria, só 3 variantes retas por seed (pode repetir em fileiras >15-20 tiles) — nenhum destes é um achado novo desta QA, só reforço que continuam em aberto.

---

## C) Mapa-múndi v2.1 (master, commit `e506b0a`)

### Leitura prévia do coordenador — confirmação/refutação

> *"O deserto ainda lê como listras diagonais regulares e os biomas como manchas de camuflagem em vez de pintura."*

**Parcialmente refutada.** Por bioma, comparando `before_after_worldmap.png` [E, antes=faixa âmbar/esquerda, depois=faixa ciano/direita]:

| Bioma | Antes (v1) | Depois (v2.1) | Hipótese do coordenador se sustenta? |
|---|---|---|---|
| **Deserto** (laranja) | Listras diagonais retas, paralelas, ângulo único — hachura mecânica clássica [E] | Ainda uma banda listrada, mas agora **ondulada** (curva, não reta) e com pequenos pontos escuros dispersos (ruínas/sentinelas) — não é mais um padrão de ângulo único repetido [E] | **Parcialmente.** Deixou de ser "listra reta regular" (a crítica original está tecnicamente resolvida: não há mais 1 ângulo fixo repetindo), mas a onda em si ainda é bastante regular/periódica a essa escala — continua lendo como "padrão ondulado repetitivo", não como dunas irregulares de referência pintada à mão. Melhora real, não solução completa.
| **Montanha** (cinza/branco) | Hachura diagonal em losango — a mesma crítica do deserto, versão cinza [E] | Manchas de neve em formato de nuvem/blob irregular, sem direção única — nenhuma linha reta visível [E] | **Refutada para este bioma.** É a melhora mais clara de todo o pacote: não há mais hachura, há textura de nuvem orgânica.
| **Zona Corrompida** (magenta) | Pontilhado fino uniforme (estipulagem regular) — lê como ruído de textura, não como dano [E] | Manchas maiores e irregulares (trincas), com contraste de escala nitidamente maior que antes [E] | **Majoritariamente refutada.** Ainda são manchas (não traços de rachadura linear), mas a escala/irregularidade aumentou o suficiente para não ler mais como "ruído uniforme" — lê mais como terreno danificado do que como pontilhado de preenchimento.
| **Floresta** (verde escuro) | Pontilhado pequeno e uniforme,排 muito regular [E] | Aglomerados maiores de tom (mais escuro/mais claro em blobs), ainda em padrão repetitivo reconhecível a média distância [E] | **Parcialmente confirmada.** Dos 4 biomas, este é o que menos mudou perceptivelmente — ainda lê como manchas de densidade variável em vez de copas pintadas à mão; é o bioma onde a crítica de "camuflagem" mais se sustenta.
| **Água** (teal) | Anel ciano espesso e sólido ao redor da ilha — "halo" de UI, sem gradiente visível [E] | Contorno mais fino, com indícios de espuma/ruído perto da costa; o gradiente de profundidade em si (perto→longe) **não é claramente perceptível** nesta captura em miniatura — pode existir no PNG fonte (640×360) sem sobreviver à escala do before/after [E, `worldmap_v2_1.png` em tamanho nativo também não revela gradiente óbvio ao olho, só a faixa de espuma na costa] | **Melhora confirmada no anel/espuma, gradiente de profundidade não confirmado visualmente por mim.**

### Marcador residual na Vila (achado P1 do `QA_V11_WORLDMAP.md`)

**Resolvido por eliminação de causa — confirmado.** O README [E] documenta que nenhum ícone de POI é mais desenhado no PNG (nem dia nem noite); isso é verificável diretamente olhando `worldmap_v2_1.png` [E] — não há nenhum selo/badge "assado" na textura, só o terreno pintado. Como o jogo desenha os POIs dinamicamente por cima (fora do escopo desta arte), o defeito original (selo estático + selo dinâmico sobrepostos) não tem mais como ocorrer.

### Notas consolidadas — C)

| Critério | Nota | Nota anterior (`QA_V11_WORLDMAP.md`) |
|---|---|---|
| Ilustração × procedural (leitura geral) | **6,5** | 4 |
| Água/profundidade | **6** | (incluído no 4 acima, sem nota própria antes) |
| Marcador residual da Vila | **9** (resolvido pela raiz) | n/v (autorrelato) |
| **Geral** | **6,5/10** | 5,5 (ilustração 4 + kit 7, médias diferentes) |

### Achados — C)

- **[P1]** O deserto e a floresta ainda leem como **padrão repetitivo reconhecível** (ondas regulares / blotches de densidade), não como pintura com variação autoral — é uma melhora real sobre v1 (não são mais hachura/pontilhado mecânico puro), mas não atinge o nível "ilustração pintada à mão" que a tarefa original buscava. O próprio README do dev já admite isto nas Limitações ("procedural que lê como orgânico, não ilustração autoral") — concordo com a autoavaliação. **Dono: game-art/coordenador**, decidir se este nível basta para o piloto ou se vale orçar `create_image_pro`/ilustrador para uma passada final.
- **[P2]** O gradiente de profundidade da água (BFS costa→largo) não é visualmente confirmável nas imagens disponíveis nesta escala (640×360 ou menor no before/after) — pode existir e não estar sendo percebido por mim, ou pode ser sutil demais para cumprir o critério "profundidade visível" sozinho. Recomendo verificação com zoom 2–4× do PNG fonte antes de fechar este sub-item.
- **Positivo confirmado:** marcador residual da Vila eliminado pela causa raiz (não só reposicionado) — critério P1 do QA anterior resolvido com solução estrutural, não paliativa.
- **Nota de escopo:** este pacote está em `master`, não atrás de flag (diferente do v1, que estava atrás de `?hud=v2`) — mas a integração em `src/ui/worldmap.ts` (apontar para os arquivos de v2.1) **ainda não foi feita** pelo game-dev, conforme a própria seção "O que o game-dev precisa ligar" do README. O gate de processo `[P0]` do QA anterior ("não conta como pronto atrás de flag") muda de natureza aqui: não é mais "atrás de flag", é "arte pronta, integração pendente" — ainda não é "pronto no jogo" até essa troca acontecer.

---

## Resumo de notas

| Entrega | Nota |
|---|---|
| A) Correções QA anterior (arco/bots/Tamer/grama) | 7 |
| A) Ficha holográfica + árvore de evolução (P0) | 8,5 |
| B) forest-v12-plateau-night | 7 |
| C) Mapa-múndi v2.1 | 6,5 |

## Achados por prioridade

- **P0:** nenhum achado bloqueante de regressão/quebra. (O que existia como P0 de processo no mapa-múndi v1 — "atrás de flag" — já não se aplica da mesma forma a v2.1, ver nota de escopo acima; vira pendência de integração, não de arte.)
- **P1:**
  1. Arco do Digivice resolve o P1 original (raio/abertura corretos, trilho conectando os ícones) mas ainda não lê como "leque" óbvio de relance — lê como trilho em L de 1 dobra. Decisão de game-design sobre se isso basta.
  2. Deserto e Floresta do mapa-múndi v2.1 melhoraram sobre v1 mas ainda leem como padrão repetitivo (ondas/blotches), não pintura autoral — autoadmitido pelo próprio dev como limite do procedural.
  3. Integração do mapa-múndi v2.1 em `src/ui/worldmap.ts` ainda não foi feita — arte pronta, jogo ainda mostra v1.
- **P2:**
  1. Grama alta +10% está no código/teste, sem prova visual confirmável em captura.
  2. Prova do lip do forest-v12 (planta 10×6, fileira norte parcialmente cortada no enquadramento) não é suficiente para confirmar 100% a leitura em câmera real de jogo — recomendo verificação em jogo.
  3. Gradiente de profundidade da água do mapa-múndi v2.1 não confirmável visualmente nas imagens disponíveis.
  4. Ficha holográfica só acessível pelo retrato do parceiro — descobribilidade baixa (hipótese do próprio dev, reforçada aqui).

## Limitações desta QA

- **Não rodei `npm test`/build/`map:validate`/capturas novas** em nenhum dos 3 artefatos — todos os números de teste e métricas citados são autoatestados pelos relatórios de dev, não verificação independente minha.
- **Não abri o jogo ao vivo** — toda avaliação é sobre PNGs estáticos já entregues (copiados para fora dos worktrees só para visualização, nada alterado na origem).
- **Sem ferramenta de diff de pixel/zoom neste ambiente** (sem ImageMagick/Pillow) — a confirmação da saturação +10% da grama, do gradiente de água do mapa-múndi e da leitura exata da borda norte do platô ficou limitada à inspeção visual direta das imagens na resolução em que foram entregues, sem medição numérica própria.
- **Não verifiquei "nada hardcoded" em `forksAhead`** nem recalculei a fórmula de % linha a linha — aceito por leitura do teste do dev, não por auditoria de código própria (esta QA é de arte/UX visual, não de código).
- **Não inspecionei `canopy-edge-variety/`** do pacote forest-v12 (fora do foco direto da tarefa) nem o `worldmap.json`/schema de v2.1 linha a linha.
- A nota da ficha holográfica/árvore é otimista em relação à nota do arco/mapa-múndi porque a primeira tem critérios objetivos verificáveis por captura (%, tooltip, texto) enquanto as outras duas dependem mais de julgamento perceptual de "o quanto isso lê como X" — tratar as notas de A.2 e B/C como tendo bases de evidência diferentes, não diretamente comparáveis em rigor.
