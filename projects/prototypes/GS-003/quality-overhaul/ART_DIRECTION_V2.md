# ART_DIRECTION_V2 — GS-010 (GAME-ART-DIRECTOR)

- **Autor:** game-art, no papel de GAME-ART-DIRECTOR (ADR-012) · **Data:** 2026-11-09
- **Base:** `audit/VISUAL_AUDIT.md` (diagnóstico), `docs/ART_STYLE_GUIDE.md` e `docs/SPRITE_SPECIFICATION.md` (direção v1, do game-art em 2026-11-08), `docs/DRAKANTOS_VISUAL_STUDY.md`, `phase2/art/scale-proof/` (prova técnica de escala nativa maior, 2026-11-10, confirma §1.4).
- **Status:** proposta de Fase 1/2 — precisa de aprovação do fundador antes de virar regra obrigatória de produção (GS-011 §3, Fase 2).
- Este documento **substitui** a decisão de escala de `ART_STYLE_GUIDE.md` §3 e §9b, que hoje se contradizem entre si (ver `VISUAL_AUDIT.md` §2.1) — mantém o resto do guia v1 (paleta Endesga-32, regras de contorno/luz) como válido, só corrige escala e acrescenta o que o GS-010 pede (padrão de animação por anatomia, checklist do diretor).

---

## 1. Escala oficial

### 1.1 O problema que esta seção resolve

`ART_STYLE_GUIDE.md` tem duas decisões de escala que se contradizem: §3 diz "Rookie = 48×48 px (1,5 tile)"; §9b diz "fator de escala = 1× (nativo), nenhum sprite oficial é redimensionado" — o que colocaria um Rookie DS nativo em ~70–86 px (até 2,7 tiles). **O que foi de fato entregue** nos `creature.json` reais é um terceiro valor: Rookies de mapa em 25–31 px, claramente **menores** que as duas decisões documentadas, obtidos por downscale automático (~0,4×) de uma pose de batalha nativa de ~71–86 px (`VISUAL_AUDIT.md` §2.1). Esta seção fecha essa divergência com uma regra única.

### 1.2 Regra de escala por porte (tile = 32 px, mantido) — proposta inicial, ver §1.4 para a decisão oficial confirmada

> **Esta tabela foi revisada em §1.4** (2026-11-10) depois da prova técnica de escala (`phase2/art/scale-proof/`). Fica aqui só como registro da lógica original — **não usar para produção**, usar §1.4. **Para o Tamer especificamente, os "52–60 px" abaixo estão SUPERADOS por §1.5 (2026-11-10)** — voltaram a circular em `quality-overhaul/phase3/qa/QA_PHASE3.md` apesar deste aviso, e `QA_P8_AND_V3FIX.md` §1.2.1 apontou a confusão; §1.5 fecha o número oficial único.

| Porte | Altura nativa alvo (sprite de mapa, só o corpo, sem folga) | Relação ao tile |
|---|---|---|
| Bebê / In-Training | 24–28 px | ~0,8–0,9× |
| Rookie | ~~44–52 px~~ → 56–64 px (§1.4) | ~1,4–1,6× |
| Champion | 60–72 px | ~1,9–2,25× |
| Ultimate/Mega | 76–96 px | ~2,4–3× |
| Tamer (jogador) | **52–60 px** de altura (corpo), canvas 48–64 px de largura | ~1,6–1,9× |

**Por que subir o Rookie de ~28 px (hoje) para ~44–52 px:** a auditoria mostrou que o Tamer mede ~28 px na tela hoje e o Drakantos usa personagens de ~48–64 px (`DRAKANTOS_VISUAL_STUDY.md` item 7) — dobrar a escala aproxima a leitura sem exigir redesenhar tudo do zero em detalhe Drakantos (que tem orçamento de arte muito maior). Isso também resolve o desperdício do asset de batalha nativo do Guilmon (75 px) — nessa nova faixa ele cabe quase sem redução, preservando detalhe (presas, garras, expressão) que hoje se perde no downscale cego.

**Como migrar sem redesenhar do zero:** para as espécies que já têm um conjunto `battle_*` nativo (Guilmon, Agumon confirmados), usar **essa pose nativa como base de referência** para `animate_character`/edição, em vez de continuar downscaling automaticamente. Para espécies sem `battle_*` (Dorumon, Tentomon, a maioria do roster), a altura nativa de mapa já registrada (24–28 px) fica perto do teto de "Bebê" desta tabela — **promovê-las ao padrão de Rookie exige redesenho real**, não é um simples reescalonamento (redimensionar rip pixel art com interpolação degrada; a regra de nunca-interpolar continua valendo).

### 1.3 Resolução interna e zoom

- **Tile:** 32×32 px (mantido, é o grid já usado por todo o pipeline de mapa — Wang, autotile, colisão, `place_map_tiles`).
- **Zoom-alvo:** **×1,5 sobre a escala-base do renderer**, igual ao que o look v8 já implementa (`look.ts`, `zoomMul: 1.5`, arredondado para fator inteiro de tela para manter o pixel perfeito) — não é preciso inventar um novo valor, só **promover o que já existe e já foi medido** (`evidence/map-factory/README.md`, seção look v8).
- **Regra de escala de tela:** só fatores inteiros, nearest-neighbor, sem blur (herdado de `ART_STYLE_GUIDE.md` §2, confirmado ainda válido).

### 1.4 Escala nativa oficial — confirmada por prova técnica (2026-11-10)

**Decisão: esta seção substitui a tabela de §1.2 como regra de produção.** Motivo: §1.2 era lógica de proporção sem teste (`[H]`); a prova `phase2/art/scale-proof/` testou o Guilmon (Rookie) de verdade em resolução nativa maior — `create_character(v3, reference)` a partir de um nearest-upscale ×2 do frame S do rip, canvas final 60×68px — e confirmou: identidade oficial preservada em 20/20 quadros (8 rotações + idle/walk em S/SW), detalhe real ganho (focinho, olhos, garras, faixa do peito legíveis separadamente — o que não acontece em 30×34px), e **custo igual ao da escala pequena** (§1.4.3) — não há razão econômica pra manter a escala antiga.

#### 1.4.1 Tabela oficial

| Porte | Altura nativa oficial (corpo, sem folga) | Relação ao tile (32px) | Status |
|---|---|---|---|
| Bebê / In-Training | 28–32px | ~0,9–1× | Proposto, mesma lógica proporcional de §1.2 — **não testado** |
| **Rookie** (Guilmon testado) | **56–64px** | ~1,75–2× | **Confirmado** — `phase2/art/scale-proof/`, Guilmon entregue em 60×68px |
| **Tamer (jogador)** | **56–64px** de altura de corpo, canvas 64–72px | ~1,75–2× | Proposto, harmonizado com o Rookie (ambos no nível Drakantos citado pelo coordenador, `evidence/drakantos-video/`) — **não testado nesta prova**, mas é a mesma técnica (`create_character` v3+reference a partir do sprite atual do Tamer, ~32×32px) |
| Champion | 76–88px | ~2,4–2,75× | Proposto, próximo degrau na mesma razão Champion/Rookie da tabela original (§1.2, ~1,36×) — **não testado** |
| Ultimate/Mega | 96–112px | ~3–3,5× | Proposto, mesma razão Mega/Champion da tabela original (~1,3×) — **não testado** |

**Por que 56–64px e não 44–52px (§1.2 original):** o pedido do coordenador que autorizou esta prova pediu explicitamente "o nível do Drakantos" como referência ("onde o herói tem ~48–64px nativos"), um alvo mais alto que a lógica de proporção original de §1.2. A prova testou esse alvo mais alto diretamente e ele funcionou dentro do teto de gerações — não há razão pra ficar no valor menor e não testado quando o valor maior já está confirmado.

#### 1.4.2 Impacto no tile e na câmera

- **Tile continua 32px**, sem mudança — a escala nativa maior é só do sprite (altura do personagem), não do grid de colisão/movimento/autotile.
- **Zoom (§1.3, ×1,5 sobre a base) foi calibrado no look v8 com o Rookie antigo (~31px nativo, ~46px na tela).** Com o Rookie confirmado em 56–64px, o mesmo zoom ×1,5 coloca o personagem em ~84–96px de tela — quase o dobro da altura ocupada hoje, ou seja, **~2,6–3× a largura do tile na tela**, contra ~1,45× hoje. Isso reduz quantas linhas de tile ficam visíveis verticalmente com o mesmo zoom.
- **Esta decisão de escala não resolve sozinha o zoom** — recomendo ao `game-dev`/`game-design` testar a nova altura **dentro do jogo real** antes de travar o fator ×1,5: pode ser que o zoom precise cair um pouco (ex. ×1,25) pra manter área visível de mapa confortável, ou pode ser que ×1,5 continue bom porque o ganho de legibilidade compensa ver menos mapa de uma vez. **Fora do escopo deste documento de arte** (mesma ressalva já registrada em §1.3 e §4 pra outras decisões de integração).

#### 1.4.3 Custo por criatura, nesta escala

**Achado central da prova:** nos limites testados (canvas até ~90×90px pro personagem, até ~92px de lado pra `animate_character` modo template), **o custo em gerações é o mesmo da escala pequena antiga** — `create_character` ficou em 1 geração em 60×68px (igual ao que custaria em 32×40px), e cada `animate_character` template ficou em 1 geração por direção (igual). **Subir a escala não tem penalidade extra de gerações**, contanto que o roster fique dentro desses limites de canvas (o que cobre toda a tabela §1.4.1 — até Mega em 112px de canvas ainda fica sob o teto de `animate_character`, 92px; `create_character` passa a custar 2 gerações acima de ~90×90px, o que afeta só Champion/Mega).

| Cobertura de direções | Cálculo (por criatura, 4 estados: idle/walk/attack/hurt) | Gerações/criatura | Roster completo (Guilmon+Dorumon+Tentomon+Tamer) |
|---|---|---:|---:|
| **P0** (§5: 3 direções desenhadas S/E/N + W espelhado de graça) | 1 (`create_character` 8-dir) + 4 estados × 3 direções × 1 geração | **13** | **~52** (Champion/Mega subiriam pra ~14/criatura se passarem de 90px no personagem) |
| **P1** (§5: 5 desenhadas + 3 espelhadas) | 1 + 4 estados × 5 direções × 1 geração | **21** | **~84** |

**Leitura para o fundador:** o custo por criatura nesta escala maior é, na prática, **o mesmo que já estava estimado pra escala pequena** no piloto anterior (`phase2/art/README.md` §4, via híbrida ~17–20/criatura) — a diferença aqui (13–21) é só porque este cálculo assume cobertura mínima P0/P1 (§5) via PixelLab puro, sem a etapa manual de polimento que a via híbrida usava pra baratear ainda mais. **Não há custo adicional por escolher a escala maior** — a prova confirma isso como fato medido, não estimativa.

#### 1.4.4 Limitações desta decisão

- Só Rookie (Guilmon) foi testado de verdade; Bebê/Champion/Mega/Tamer na tabela §1.4.1 são proposta por extrapolação proporcional, não teste (`[H]`).
- O impacto em zoom/câmera (§1.4.2) é análise de arte, não foi validado dentro do jogo rodando — decisão de integração fica com `game-dev`/`game-design`.
- O custo §1.4.3 assume que toda criatura consegue uma referência de entrada equivalente ao frame S limpo do Guilmon — espécies sem isso (ver `phase2/art/scale-proof/README.md` §6) podem custar mais ou sair com qualidade diferente.

### 1.5 Decisão de escala — 2026-11-10 (Tamer, resolve QA P8 §1.2.1)

**Problema [E]:** `QA_P8_AND_V3FIX.md` §1.2.1 (`quality-overhaul/phase2/qa/`) achou **3 números de "altura do Tamer" não reconciliados** circulando no projeto, nenhum citado pela spec de HUD v2 (P8) ao descrever o "retrato mini 48×48px, recorte do sprite do Tamer":

1. **52–60 px** — `ART_DIRECTION_V2.md` §1.2 (tabela descartada, já marcada "não usar para produção" mas citada de novo por `quality-overhaul/phase3/qa/QA_PHASE3.md`).
2. **56–64 px nativos** — `ART_DIRECTION_V2.md` §1.4.1 (tabela oficial atual), harmonizado com o Rookie/Guilmon testado — mas o próprio §1.4.4 já avisava: **só o Guilmon foi testado, o Tamer nessa faixa não**.
3. **~90 px físicos na tela** — `phase2/PHASE2_DEV.md` §2, o que está de fato implementado hoje: `dprLayout()` escala um Tamer de referência de **30 px lógicos** (a arte-placeholder atual, ~32×32px) por um fator inteiro de **3** (a 1080p) para atingir `charh` ≈ 9% da altura física da tela.

(1) e (2) são tamanho de **arte nativa** (canvas do sprite, o que o game-art desenha). (3) é tamanho **renderizado na tela** depois do zoom de câmera — uma grandeza diferente, que não deveria ter sido comparada diretamente com (1)/(2) para começar. Nenhum documento fazia essa distinção explicita antes desta seção.

**Decisão (diretor de arte, 2026-11-10):**

- **Padrão único de arte nativa do Tamer: altura de corpo 56–64 px, canvas 64–72 px.** É exatamente a mesma faixa já testada e confirmada para o Rookie (Guilmon, `phase2/art/scale-proof/`, entregue em 60×68 px) — Tamer e parceiro ficam na MESMA régua "nível Drakantos" pedida pelo fundador (`evidence/drakantos-video/`), em vez de o Tamer ficar levemente menor como a tabela antiga de §1.2 propunha (52–60 px vs. Rookie 56–64 px). §1.4.1 é, a partir de agora, o único número de arte nativa válido para o Tamer — §1.2 (item 1 acima) fica formalmente superado, sem exceção.
- **O fator de escala de tela é um parâmetro separado da arte, não o mesmo tipo de número.** O "~90 px físicos" de `PHASE2_DEV.md` §2 mede o placeholder de 30 px lógicos de hoje após o zoom `dprLayout()`, não a arte nova de 56–64 px — os dois números param de ser comparados entre si a partir de agora.
- **Relação entre os dois quando a arte nova entrar:** se o Tamer for redesenhado em 56–64 px nativos (quase o dobro do placeholder de 30 px), o fator inteiro de `dprLayout()` precisa CAIR para manter o mesmo alvo de tela já aprovado (`charh` 8–10%, hoje fator 3) — grosso modo de 3× para algo entre 1× e 2×, dependendo do arredondamento ao inteiro mais próximo que `dprLayout()` já faz. **O valor exato é decisão de `game-dev`, testada no jogo real** — mesma ressalva já registrada em §1.4.2 para o Rookie: este documento de arte fixa só a escala nativa do sprite, não o zoom/câmera.

**O que isso desbloqueia (P8):**

- Retrato mini (48×48 px) e retrato grande (72×72 px, §5 da spec P8) devem ser recortados a partir da arte nativa de 56–64 px (canvas 64–72 px) definida aqui — nunca do placeholder de 30 px hoje em produção: um recorte de 48–72 px a partir de 30 px sairia upscaled/borrado, exatamente o risco já citado por `QA_P8_AND_V3FIX.md` §1.2.1.
- Para o parceiro Digimon (Guilmon/Rookie), não há bloqueio: a escala já está confirmada e testada (§1.4.1), o retrato pode ser recortado da arte existente hoje.
- Para o Tamer, a AMBIGUIDADE que travava a spec (3 números concorrentes, nenhum oficial) acaba aqui: quando a arte do Tamer for redesenhada (fora do escopo desta decisão — custo zero hoje, ver limitação abaixo), ela já nasce no tamanho certo para os dois recortes do P8, sem mais escolha entre 3 valores.

**Limitação [H]:** esta decisão fixa o número-alvo, mas não autoriza gasto de PixelLab para redesenhar o Tamer agora — a autorização de hoje é custo zero (saldo 0,80). Enquanto o Tamer não for redesenhado em 56–64 px, um retrato P8 feito do sprite atual (30 px) deve ser marcado como provisório/placeholder visual, não como arte final.

---

## 2. Paleta por região

Base: Endesga-32 (`ART_STYLE_GUIDE.md` §4), **mantida como paleta-mãe**, mas com a correção de valor/saturação que o look v8 já aplica e que resolveu a maior crítica do estudo Drakantos (`DRAKANTOS_VISUAL_STUDY.md` item 6: "verde médio e saturado em tudo, nada se destaca"):

- **Regra geral (todo bioma):** saturação ×0,64, valor ×0,8 sobre a arte de cenário de base; o rim de luz (12% mais claro) sobe para S×0,88/V×0,92. Esta é a regra `renderPreset` já implementada em `look.ts` — **não precisa ser reinventada, só documentada como padrão oficial** em vez de ficar só no código de uma variante.
- **Floresta Densa (piloto):** verde-escuro acinzentado + acento roxo/violeta (terra, pedra, manchas de lama) — já validado no look v8, ver `audit/img/char-digimon-map/03_clareira_v5b_dia.png`.
- **Regra por bioma (próximas regiões, direção a confirmar quando produzidas):** cada região herda a regra geral de S/V, mas muda o **acento de luz quente** (floresta = âmbar/ciano/magenta dos cristais e cogumelos digitais; vila = amarelo de lanterna; caverna = só o raio de luz ao redor do jogador, resto preto — padrão já registrado em `DRAKANTOS_VISUAL_STUDY.md`, frame t0820) — nunca mudar a paleta-mãe inteira por região, só o acento.
- **Criaturas e Tamer ficam FORA do grade de cor do cenário** (regra já confirmada em `look.ts`: "Criaturas, UI, NPCs... ficam fora" do `renderPreset`) — devem manter suas próprias 5–6 cores da Endesga-32 (`ART_STYLE_GUIDE.md` §5.5), para não lavarem com o ambiente e perderem leitura.

---

## 3. Outline

- **Cenário (tiles, props):** sem contorno rígido — separação de forma por contraste de cor e sombreamento, como o Drakantos (`ART_STYLE_GUIDE.md` §1, já correto, mantido).
- **Personagens e Digimon:** contorno escuro 1–2px (mais grosso que um stroke fino de 1px rígido), por ser a referência explícita da imagem conceito do fundador e dos sprites oficiais DS (`ART_STYLE_GUIDE.md` §2, observação sobre os GIFs oficiais) — **mantido como está documentado**, não muda nesta revisão.
- **UI/HUD:** fora do escopo deste documento (ver `audit/UI_WORLD_AUDIT.md`, game-design).

---

## 4. Luz

- **Fonte fixa por sprite:** superior-esquerda, para toda criatura/personagem desenhado do zero (`ART_STYLE_GUIDE.md` §5.2, mantido) — não se aplica a rips oficiais (que já vêm com sua própria luz embutida no arquivo).
- **Luz de cena (mapa):** luzes pontuais aditivas com flicker, mascaradas pela silhueta da copa (feather ~3px) — **promover o sistema do look v8 (`mapLights`/`lightSprite`/`flicker`, `view.ts drawLook`) para o caminho padrão de renderização**, em vez de ficar atrás de flag. Intensidade: ×0,55 de dia, ×1,35 à noite, sobre ambiente em `multiply` (valores já calibrados, reaproveitar).
- **Pendência:** luzes pontuais ainda não projetam sombra própria nem são bloqueadas por geometria opaca (penhasco) — aceitável para o piloto, registrar como item de P1 para depois da homologação.

---

## 5. Padrão de animação por anatomia

Esta seção substitui a prática atual (1 template de animação para todo o roster, `VISUAL_AUDIT.md` §2.1) por uma regra por anatomia, alinhada ao `ANIMATION_STANDARD.md` já existente (mantém os mesmos nomes de estado e eventos, ex. `hitFrame`) e ao pedido do GS-010 §3.

| Anatomia | Walk/locomoção | Idle | Observações de peso/comportamento |
|---|---|---|---|
| **Humanoide (Tamer)** | 4 quadros, 8 fps, contato de pé real (não só troca de perna) | 3–4 quadros, 2–3 fps, respiração + piscar | Braços com balanço oposto à perna; Turn com 1 quadro intermediário em vez de corte instantâneo. |
| **Bípede pequeno (Guilmon, Agumon)** | 4 quadros, 8 fps, bob vertical leve (1px) sincronizado com a passada | 2–4 quadros, 2–3 fps, respiração + cauda com leve oscilação contínua mesmo parado | Cabeça grande (chibi) não balança tanto quanto o corpo — manter o "peso" na base, não na cabeça. |
| **Quadrúpede (Dorumon)** | 4–6 quadros, 8–10 fps, **patas diagonais alternadas** (dianteira-E + traseira-D, depois dianteira-D + traseira-E) — nunca as 4 patas em bloco único | 2–3 quadros, respiração no tronco, cauda e orelhas com movimento secundário próprio (não sincronizado 1:1 com o corpo) | Corpo mais baixo, inclinação de pescoço ao virar — hoje Dorumon não tem nenhuma dessas características; é a maior lacuna do roster. |
| **Voador/flutuador (Tentomon e futuros)** | **Não existe "walk" — existe hover.** 4 quadros de batida de asa + bob vertical de 1–2px substituindo todo deslocamento no chão | 2 quadros, bob lento, asas semi-abertas vibrando sutilmente | Nenhuma pose de "pouso no chão" sólido — se precisar ficar parado, flutua baixo, não gruda no solo como um bípede. |
| **Armadura/pesado (futuro, Champion+)** | 4 quadros, 6 fps (mais lento = mais peso), sem bob vertical — o peso vem da lentidão, não do salto | 2 quadros, quase estático | Reação a hit mais curta/contida (menos deslocamento no `translate` de hurt). |

**Attack (toda anatomia):** 3 quadros mínimos — antecipação (recuo na direção oposta) → impacto (avanço + flash de 1 frame na cor de acento da espécie) → recuperação (retorno). **Nunca** 1 quadro único isolado entre 2 quadros de walk (o padrão atual de Guilmon/Agumon) — isso não é uma animação de ataque, é uma pose estática disfarçada.

**Hurt (toda anatomia):** 2 quadros — deslocamento na direção oposta ao golpe + flash branco decrescente (técnica já documentada em `PIXEL_ART_DIRECTION.md` §0.1, só precisa ser aplicada ao pack oficial, não só ao pack paramétrico antigo).

**Direções:** mínimo P0 = 3 desenhadas (S, E, N) + espelho para W; recomendado P1 = 5 desenhadas + 3 espelhadas (`SPRITE_SPECIFICATION.md` §5, mantido). **Nenhuma espécie deve faltar uma direção cardeal inteira** (hoje Dorumon falta Norte) — isso é bloqueio de qualidade, não nice-to-have.

---

## 6. Regras de aprovação e checklist do diretor

Nenhum asset (personagem, Digimon, animação, mapa, VFX) entra no jogo sem passar por esta checklist, assinada pelo GAME-ART-DIRECTOR (ADR-012 §3: "nenhum agente aprova o próprio trabalho visual"):

### 6.1 Checklist por personagem/Digimon

- [ ] Silhueta reconhecível a distância de leitura de jogo (sem abrir o inventário/close-up).
- [ ] Escala dentro da tabela §1.2 para o porte declarado.
- [ ] Idle tem pelo menos 2 quadros reais (nunca reuso de 1 frame de walk).
- [ ] Walk segue o padrão de anatomia §5 correspondente (não o template genérico).
- [ ] Attack tem as 3 fases (antecipação/impacto/recuperação), não 1 quadro isolado.
- [ ] Hurt tem deslocamento + flash, não é idêntico ao attack.
- [ ] Todas as 4 direções cardeais existem (desenhadas ou espelhadas corretamente).
- [ ] Nenhum flickering, desalinhamento de pivô ou mudança de tamanho entre quadros (`pixelart_workbench lint` roda limpo).
- [ ] Verificado **em movimento** (sequência real, não só frame a frame) — nunca aprovar só pela folha de contato estática.

### 6.2 Checklist por mapa/região

- [ ] As 4 camadas (BG/MID/FG/overlay) estão presentes e visíveis na captura.
- [ ] Nenhuma repetição de grade perceptível num raio de ~10 tiles.
- [ ] Luz, sombra e paleta seguem a regra §2/§4 (S×0,64/V×0,8 + acento por bioma).
- [ ] Pelo menos 1 elemento de vida ambiental visível e coerente com o bioma.
- [ ] Testado dentro do jogo real (não só preview/PNG estático).
- [ ] É o caminho **padrão** de carregamento, não uma variante atrás de flag — se estiver atrás de flag, não conta como "pronto" na homologação.

### 6.3 Checklist por VFX

- [ ] O efeito é temático à habilidade/elemento, não uma explosão genérica reaproveitada.
- [ ] Sincronizado ao `hitFrame`/evento real da simulação (nunca decide dano por conta própria).
- [ ] Testado contra pelo menos 2 espécies diferentes de alvo (não quebra em cima de um quadrúpede vs. um bípede).

### 6.4 Processo

1. Produtor entrega → 2. GAME-ART-DIRECTOR revisa com a checklist acima, registra Aprovado/Precisa melhorar/Refazer com evidência → 3. Se "Precisa melhorar/Refazer", devolve com nota específica (não "está ruim", mas "qual item da checklist falhou") → 4. Reentrega → 5. só depois de Aprovado o asset pode ir para integração (game-dev) → 6. Homologação final (GS-010 §8) continua sendo do fundador, não deste diretor.

---

## 7. Limitações

- Esta direção v2 é **proposta**, não aprovada — precisa de validação do fundador antes de virar regra obrigatória (GS-011 §3, Fase 2).
- A tabela de escala §1.2 é uma correção lógica da contradição encontrada (`VISUAL_AUDIT.md` §2.1), não uma medição em pixel da imagem conceito original — continua sendo decisão de direção **[H]**; **superada por §1.4** para o Rookie, que tem evidência técnica (`phase2/art/scale-proof/`).
- A tabela §1.4.1 tem **só uma linha confirmada por teste (Rookie)** — Bebê, Tamer, Champion e Mega são extrapolação proporcional **[H]**, não testada; o custo por criatura em §1.4.3 herda a mesma ressalva pras linhas não testadas.
- O padrão de animação por anatomia (§5) é a mesma técnica validada em `art/src/pmd/common.js` e `PIXEL_ART_DIRECTION.md` §0.1, mas **nunca foi testado numa espécie completa com as 4 direções + todos os estados** — a Fase 3 é a primeira vez que isso seria feito de ponta a ponta.
- Promover o look v8 a padrão (§1.3, §4) é uma decisão de integração (game-dev), não só de arte — este documento recomenda, não executa (Fase 1 é só diagnóstico).
