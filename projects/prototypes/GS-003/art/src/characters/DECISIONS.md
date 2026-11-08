# Character creator — decisões e iterações

- **Autor:** game-art · **Data:** 2026-11-08 · **Pedido:** fundador, GS-003 — criador de Tamer próprio (corpo/cabelo/cor), ver `ART_STYLE_GUIDE.md`, ADR-009.
- **Técnica obrigatória:** matriz de caracteres pixel a pixel (ver header de `grid.js`). Nenhum arquivo deste pacote chama `Canvas.fillRect/fillEllipse/fillCircle/fillPolygon`.

## Grid e escala (decisão própria desta entrega, diferente do Tamer de `SPRITE_SPECIFICATION.md`)

`SPRITE_SPECIFICATION.md` já define um Tamer de 48×64 (overworld geral, ao lado de criaturas 48×48 Rookie). O pedido do fundador para **este** criador de personagem pede explicitamente um frame de 32×32 ou 32×40 com o personagem em ~28–32px, "coerente com o tile de 32" e mais perto da escala do avatar do IdleDex (~30px em tela, `evidence/founder-video-idledex/t22_map_walk.png`). Optei por **32×40**, pivô `(16,35)`, altura real do personagem ~29px (y4 a y33) — é uma escala **menor e separada** da do Tamer overworld de `SPRITE_SPECIFICATION.md`, não uma correção dele. Isso é uma decisão de direção de arte **[H]** desta entrega, a reconciliar com game-dev se os dois sistemas (overworld x criador de personagem) precisarem usar o mesmo asset.

## Iteração 1 — proporção do corpo

Primeira versão (`body_test_x8.png`, descartada): cabeça com 12 linhas de largura 2→7→2, torso com "nubs" de mão soltos (ilhas de 1 linha de altura, 2px de largura, sem tocar o torso). Resultado: cabeça leu como um bulbo alongado, não uma cabeça redonda; os nubs de mão geraram contornos próprios (autoOutline trata pixel não-conectado como ilha separada) e pareciam orelhas/abas falsas.

**Correção:** redesenhei `HEAD_WIDTHS` como uma curva tipo círculo (raio 8, [4,5,6,7,7,8,8,8,8,7,7,5]) com largura máxima claramente maior que os ombros (modelo masculino: ombro máx. 5 vs cabeça máx. 8) para o efeito "bobblehead" chibi. Removi os nubs de mão — o personagem é pequeno o bastante (32×40) para que mãos separadas sejam ruído, não leitura; braços ficam implícitos na silhueta do torso, dentro da regra de legibilidade de `ART_STYLE_GUIDE.md` seção 6 ("no máximo 2 quebras de silhueta").

## Iteração 2 — comparação lado a lado com o Hero (DS) e goggles

Recortei um frame parado do Hero oficial (`10-source-files/spriters-resource/.../Hero__48323.png`, crop local y34–76, ~41×42px) e montei `hero_comparison.png` ao lado do meu Tamer (cabelo espetado estilo Tai, roupa Tamer-clássico, direção S). Achados:

1. **Proporção geral confere** — cabeça grande, torso curto, pernas curtas batem com a referência (o Hero tem a cabeça ocupando ~40% da altura; meu bobblehead fica um pouco mais extremo, ~45%, mais perto do IdleDex que do Hero — aceitável, já que o pedido combina as duas referências, e o IdleDex é a referência de escala mais próxima deste asset específico).
2. **Problema real encontrado:** os goggles do conjunto Tamer-clássico (2 linhas de correia + 2 linhas de lente) cobriam quase toda a testa, lendo como um capacete sólido em vez de óculos sobre o cabelo — o cabelo espetado ficava "cortado" ao meio pela correia.

**Correção:** reduzi a correia para 1 linha na altura y7 e as lentes para 1 linha em y8, mais estreitas (ver `clothing.js` `buildGoggles`). Resultado em `hero_comparison_v2.png`: mais cabelo/testa visível acima da correia, lentes lêem como dois blocos cyan distintos em vez de uma faixa única. Ainda é uma faixa bem presente (não um óculio fino) — decisão consciente: o visual "goggles grandes na testa" é o próprio tropo visual do Tamer clássico de Digimon (ex. Tai/Davis), não um erro a esconder.

## Iteração 3 — retomada: identidade de Tamer Digimon completa + comparação DS

Esta sessão retomou a entrega (interrompida por limite de uso). Ao revisar o trabalho parcial encontrado em `GAME-ASSETS/11-characters/player/` e este diretório, achei que `clothing.js` só implementava os goggles do pedido do fundador ("identidade de Tamer Digimon: goggles, luvas, jaqueta com detalhe tecnológico, Digivice próprio no cinto, acentos em ciano/digital, nada de boné estilo Ash") — luvas, jaqueta tech e Digivice ainda não existiam em nenhum outfit, e a comparação lado a lado com o Tamer do DS (deliverable pedido) não tinha sido gerada (só sobrava `hero_comparison_iteration2.png`, um teste de proporção da iteração 2, sem o Digivice/luvas/tech trim desta entrega).

**Adicionado nesta iteração (`clothing.js`/`palettes.js`):**
- `buildGloves`: estende o punho da manga 2px além do torso em y20-22, tom cinza-azulado fixo (`GLOVE_RAMP`) que contrasta com qualquer cor de roupa — toca o torso já desenhado (mesma linha, colunas adjacentes), então não repete o erro dos "nubs" flutuantes da iteração 1.
- `buildTechTrim`: linha vertical ciano (`TECH_RAMP`) sobrepondo o centro da jaqueta (zíper/circuito), satisfaz "detalhe tecnológico" + "acentos em ciano/digital" sem criar forma nova (fica dentro da silhueta já pintada por `buildTorsoWear`).
- `buildDigivice`: ícone 3px de largura x 2 linhas (tela ciano clara em cima, caixa escura embaixo) fixo nas linhas y23-24 (o quadril, logo acima da coxa em y25) — mesma posição em todo outfit, independente do hemY de cada um, para sempre ler como "no cinto". Omitido em N (de costas o aparelho não apareceria).
- As três são desenhadas em **todo outfit** (não só tamer-clássico) — luvas/jaqueta-tech/Digivice são identidade do Tamer, não um traje específico; só os goggles continuam exclusivos do outfit `tamer-classico`, que já os diferenciava visualmente dos outros dois (ART_STYLE_GUIDE.md seção 6).
- Verificado visualmente (render de teste em 16x escala) antes de rodar o gerador completo: luvas/trim/Digivice legíveis em S/E, sem pixels flutuantes, consistentes entre casual/aventureiro/tamer-clássico.

**Adicionado em `hair.js`:** corte `franja-longa` (7º corte) — o pedido do fundador lista textualmente 6 cortes ("espetado volumoso, franja longa, marias-chiquinhas, rabo de cavalo, curto, longo liso") e o conjunto encontrado tinha `moicano` no lugar de uma franja longa. Em vez de remover `moicano` (trabalho já pronto, corte genérico válido como variedade extra), adicionei `franja-longa` como sétimo corte — assim os 6 pedidos pelo fundador existem todos, mais uma opção extra, sem descartar nada do que já estava pronto.

**Gerado nesta iteração:** `art/src/characters/ds_comparison.js` (novo) — carrega `TAMER-0001_walk_S_00.png` (sprite oficial DW DS já na biblioteca, camada `official-fan-use`) via `png_decode.js` e monta `09-previews/character_vs_ds_tamer_comparison.png`: os dois personagens na mesma escala de tela (fator 12), ancorados na mesma linha de chão pelos respectivos pivôs (DS: 16,31 · nosso: 16,35), com rótulos. Confirma visualmente que a proporção chibi do nosso Tamer fica na mesma ordem de grandeza do Tamer oficial do DS sem copiar nenhum pixel dele (o builder usa só `body.js`/`hair.js`/`clothing.js`, nunca lê o PNG do DS como fonte de desenho).

## Limitações conhecidas desta entrega
- **Perfil (E) é uma aproximação**, não uma vista lateral desenhada do zero — reaproveita a mesma largura-por-linha da vista frontal com um leve recuo e um bump de nariz (`body.js` `headSpan`), técnica suficiente na escala de 32px mas mais simples que uma silhueta de perfil "de verdade".
- **Mãos/braços não são desenhados como um membro articulado** — ficam implícitos na silhueta do torso (ver iteração 1); a luva da iteração 3 é um acento de 2px no punho do torso, não um braço separado. Para animações de combate mais expressivas (ex. golpe com braço avançando), isso provavelmente precisa de um braço desenhado à parte.
- **Digivice não aparece na direção N (de costas)** — decisão consciente (um aparelho preso no quadril frontal não se veria de costas), mas quer dizer que o ícone de identidade "Digivice no cinto" só é 100% visível olhando o personagem de frente/perfil (S/E/W), não de costas.
- **Luvas, trim de jaqueta e Digivice não foram comparados lado a lado com nenhuma referência real de Digimon/Tamer** (diferente dos goggles, que passaram pela iteração 2 contra o Hero do DS) — são uma leitura própria de "identidade genérica de Tamer" a partir da descrição do fundador, não validada visualmente contra um Digivice oficial.
- **A pose de apontar/comando (`point`)** é só 1 frame, direção S, com um pequeno braço levantado — não foi comparada lado a lado com nenhuma referência de pose de ataque real; é uma leitura própria de "pose de comando genérica para o combate no mapa".
- Nenhum playtest ou revisão humana cruzada foi feita (mesma limitação já registrada em `ART_STYLE_GUIDE.md` seção 8, item 4) — esta é uma autoavaliação de uma sessão só.
