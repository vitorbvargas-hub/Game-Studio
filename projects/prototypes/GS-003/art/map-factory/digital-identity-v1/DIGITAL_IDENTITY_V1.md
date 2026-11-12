# Identidade Digital do Mapa — Digital Forest 01 (v1, custo zero)

- **Autor:** game-art (subagente GS-003) · **Data:** 2026-11-11 · **Custo:** zero — sem PixelLab, sem geração de IA de imagem; tudo composto localmente com Pillow (`shared/tools/sd-local/.venv`) sobre capturas reais do jogo (Chromium headless via CDP, mesmo padrão de `scripts/capture-live.mjs`).
- **Problema que motiva:** o fundador apontou que a identidade visual da Digital Forest 01 "não mudou" — o look v9–v12 é uma floresta bonita e natural, mas genérica/estilo Drakantos, sem os elementos de Mundo Digital pedidos no Style Bible (`quality-overhaul/phase3/style-bible/DIGIMON_STYLE_GUIDE.md`) §7: ruínas, cristais, portais, estruturas de dados, arquitetura própria de Digimon.
- **Marcação:** **[E]** evidência (arquivo/captura desta sessão) · **[H]** hipótese/julgamento de direção.

## ⚠️ Limitação de acesso ao briefing citado (leia antes do resto)

A missão pediu para seguir "o briefing Digimon Visual Identity 1.0 (§03.D e §05 DIGITAL FOREST 01)" e autoavaliar pela "rubrica do VI 1.0 §10". **Eu não encontrei, dentro do meu escopo de leitura (`projects/prototypes/GS-003/`, `shared/`, `portfolio/`, `assets/`, este workspace), nenhum arquivo com esse nome ou com seções `§03.D`/`§05 DIGITAL FOREST 01`/`§10`** — só o `PROJECT_LOG.md` cita "VI 1.0" como o nome da missão guarda-chuva, e o documento operacional real que existe no meu escopo é o `DIGIMON_STYLE_GUIDE.md` ("Style Bible GBA Plus — Digimon Visual Identity 1.0, Fase 1/Gate 1"), cujo §7 ("Identidade do Mundo Digital") é, por conteúdo, o equivalente do "§05 DIGITAL FOREST 01" descrito na missão, e cujo §8 ("matriz de nota... mínimo 8/10") é o equivalente funcional do "§10" pedido. **Usei esses dois como substitutos diretos**, citados aqui explicitamente **[H]** — se existir um documento "Digimon Visual Identity 1.0" separado (provavelmente no workspace de `game-design`, fora do meu escopo de escrita/leitura), esta entrega precisa ser reconferida contra ele.

## O que foi feito

1. **Captura de referência real** (`reference/`) — floresta atual, dia e noite, `http://127.0.0.1:5190/?map=digimon-forest-01&seed=7&time=day|night` (servidor já rodando, mantido pelo game-dev; não reiniciei nem alterei nada nele). Confirma o diagnóstico do fundador: no estado atual só existem cristais ciano (clusters pontuais) e cogumelos "digitais" — sem ruína, sem circuito, sem portal, sem torre. O platô de pedra roxo já existente (`forest-v9-cliffs`) lê como rocha genérica, não como ruína.
2. **3 direções de identidade**, cada uma como mockup dia+noite sobre a captura real (`mockups/`, 6 PNGs):
   - **Direção A — Ruínas de Dados + circuito no chão** (recomendada): reinterpreta o platô de pedra existente como um arco/coluna de ruína rachados por um veio de dados ciano; decalques de circuito achatados correm pela trilha de terra já existente; cristal âmbar some variedade de cor perto da ruína; torre de dados ao fundo sugere repetição no mundo.
   - **Direção B — Portais e Torres de Transmissão**: um portal (arco de pedra + disco de energia) como landmark na clareira aberta + uma torre de transmissão à distância. Mudança mais pontual/pouco invasiva que A.
   - **Direção C — Glitch/Wireframe na vegetação**: deslocamento de "scanline" + blocos translúcidos ciano sobre árvore/arbusto existentes, simulando corrupção digital na vegetação. A mais experimental/divisiva; inclusa só para comparação, **não recomendada** como direção principal (risco de ler como bug de renderização em vez de efeito deliberado a distância de leitura de jogo).
3. **Kit de props da Direção A** (`props/`, 13 PNGs + `PROPS_MANIFEST.md` com nomes/posições sugeridas): ruína em 3 tamanhos (pilar pequeno 32×32, coluna 32×64, arco 64×64), portal/gate 64×96, pilar/torre de dados 32×96, 3 decalques de circuito de chão (reto/curva/nó, achatados — não são um Wang-47 completo, ver limitações), 4 variantes de cristal (ciano/âmbar/magenta/cluster misto) e 1 folha de animação de fragmento de dados (4 quadros, 64×16). Scripts reprodutíveis em `scripts/` (`capture_reference.mjs`, `build_props.py`, `build_mockups.py`).

## Por que recomendo a Direção A

- É a que mais **reaproveita produção já existente** (o platô de `forest-v9-cliffs` vira a ruína, em vez de virar um elemento novo do zero) — menor custo de retrabalho para quem for integrar.
- É a mais "RPG de Digimon" reconhecível sem copiar nenhum jogo específico: ruína + circuito + cristal é o motivo central de Mundo Digital descrito em §7 do Style Bible (ruínas, cristais, dados), diferente de B (só portais/torres, mais "sci-fi genérico") e C (mais abstrata, risco de não comunicar "Digimon" à primeira vista).
- Permite misturar com a vegetação gradualmente (um platô por clareira, não um reskin total do bioma) — baixo risco de descaracterizar o trabalho de produção já aprovado em v9–v12.
- Portal e torre de transmissão (pedidos explicitamente no briefing) **entram no kit mesmo assim**, como elementos de fundo/pontuais, não como a assinatura central — preservando a opção de evoluir para a Direção B em biomas futuros sem desperdiçar o trabalho de hoje.

## Autoavaliação (adaptada do §8 do Style Bible, critérios de tile/cenário — nota mín. 8/10, falha crítica reprova sozinha)

| Critério | Nota | Observação |
|---|---:|---|
| Paleta | **8/10** | Stone/moss/dirt/ciano/âmbar 100% reaproveitados de ramps e props já aprovados. Magenta (`#f23fb0`) é hex novo, fora da Endesga-32/ramps documentados — mas explicitamente previsto em §7.2 ("acento âmbar/ciano/magenta") para cristal, não para cenário genérico. Marco como pendência de confirmação, não como falha crítica silenciosa (ver `PROPS_MANIFEST.md`). |
| Textura | **7,5/10** | Blocos sólidos, 2–3 tons por faixa, sem granulado/ruído aleatório — cumpre a regra dura. Mas é arte gerada proceduralmente (retângulos/polígonos via Pillow), não desenhada à mão quadro a quadro: abaixo do polimento dos sprites oficiais ou de um tile de produção real. Adequada para **aprovar direção**, não para ir direto a produção sem retrabalho manual. |
| Luz (dia/noite) | **8/10** | Corrigi no processo um erro real: a primeira versão dos mockups de noite colava os props com as MESMAS cores do dia sobre o fundo escurecido. Reescrevi `build_mockups.py` para escurecer (~×0,55–0,68) os pixels de pedra/musgo e intensificar (~×1,12–1,18) os acentos ciano/âmbar/magenta nas versões de noite, na mesma direção do §6 (luz pontual mais fraca de dia, mais forte de noite). É uma aproximação por classificação de cor exata, não o pipeline real de `look.ts`/`mapLights` — a integração final deve rodar os props pelo pipeline real, não por este script. |
| Identidade de Mundo Digital | **9,5/10** | Cobre as 4 categorias do §7 (ruínas, cristais, portais, dados) na mesma cena, lendo claramente como "isto é um lugar digital" sem textura de preenchimento nem 3D/isométrico. |
| Autotile (decalque de circuito) | **não aplicável nesta entrega** | Entreguei 3 peças (reto/curva/nó) como amostra de conceito, não um conjunto Wang completo — registrado como pendência, não como nota baixa (mesmo tratamento que o Style Bible deu a "portais" em sua própria limitação §10). |
| Camadas (`suggestedLayer`/colisão) | **não aplicável nesta entrega** | Por instrução explícita da missão, não integrei nada no `.tmj`/jogo; não há camada para declarar ainda. |
| **Falhas críticas (§8.3)** | **Nenhuma identificada** | Nenhum blur/AA sobre contorno, nenhuma perspectiva 3D/isométrica, nenhuma sombra ausente em prop com silhueta vertical (todos os props "em pé" têm elipse de contato 25–40%), nenhum contorno duplicado. |

**Média dos 4 critérios aplicáveis: (8 + 7,5 + 8 + 9,5) / 4 = 8,25/10 — acima do mínimo de 8/10**, sem falha crítica. Esta é uma autoavaliação do produtor (eu mesmo), não a aprovação formal do GAME-ART-DIRECTOR exigida pelo processo §8.4 — precisa de revisão cruzada antes de virar regra de produção.

## Limitações

- **Não encontrei o documento-fonte "Digimon Visual Identity 1.0" com as seções §03.D/§05/§10** citadas na missão, dentro do meu escopo de leitura — usei o `DIGIMON_STYLE_GUIDE.md` (mesma missão, "Fase 1/Gate 1") como substituto funcional; ver aviso no topo.
- Mockups são **composições sobre screenshot real**, não assets já integrados ao `.tmj` — as posições em `PROPS_MANIFEST.md` são aproximadas (calculadas a partir da câmera desta captura específica, seed=7) e precisam ser reconferidas no mapa real por quem for integrar.
- Arte dos props é procedural (retângulos/polígonos), não pintada à mão — suficiente para aprovar direção e fornecer silhueta/paleta corretas, mas abaixo do acabamento de um tile de produção final (`forest-v11-ground`) ou de um sprite oficial.
- Conjunto de decalque de circuito tem só 3 peças (reto/curva/nó), não um Wang-47 completo.
- Magenta (`crystal_magenta`) é um hex novo fora dos ramps documentados — ver nota de contradição no Style Bible em `PROPS_MANIFEST.md`; precisa decisão do GAME-ART-DIRECTOR antes de ir para produção.
- Direção C (glitch) é a mais arriscada de leitura e não foi aprofundada em prop kit — só o mockup, por ser a não-recomendada.
- Nenhuma destas decisões foi revisada por outro agente (mesma ressalva do Style Bible, ADR-012 §3) — autoavaliação do próprio produtor, não aprovação formal.
- Não integrei nada no jogo (`.tmj`, código, `place_map_object`) — por instrução explícita da missão, essa etapa cabe a outro agente.
