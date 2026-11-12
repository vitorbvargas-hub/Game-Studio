# QA Fase 3 — P7 Clareira piloto + GS-012 encontros (GS-003, branch `quality-overhaul`)

- **Autor:** game-qa (VISUAL-QA) · **Data:** 2026-11-10
- **Revisado:** `projects/prototypes/GS-003/quality-overhaul/phase3/P7_GS012_DEV.md` (commits `fa0ab12`/`d9b1550`/`6dd415d`, worktree `~/projects/GameStudio/workspaces/game-dev/qo`, branch `quality-overhaul`), capturas e vídeo em `phase3/img/`.
- **Método:** leitura do DEV_REPORT, do brief `phase2/design/P7_CLAREIRA_BRIEF.md`, de GS-010 §8 (`docs/briefing/15_gs010_visual_quality_overhaul.md`) e GS-012 §6/§11 (`docs/briefing/17_gs012_wild_encounters.md`); inspeção visual de todas as 14 PNGs em `phase3/img/`; extração do WebM (`p12_clareira_passeio_encontro.webm`) a cada 0,5 s com PyAV (`.venv` de `shared/tools/sd-local`), 55 quadros (0,0–27,0 s).
- **Não alterei nada** no worktree `qo`; nenhum comando de build/teste foi reexecutado — as métricas numéricas do DEV_REPORT (testes, `map:validate`, Clark–Evans, 60/30/10) são citadas como relatadas por game-dev, não reverificadas por mim.
- **Legenda:** **[E]** evidência própria (captura/quadro citado) · **[E-dev]** número relatado pelo DEV_REPORT, não reproduzido por mim · **[H]** hipótese/julgamento de QA.

---

## 1. Notas (0–10) — critérios GS-010 §8 aplicáveis a esta peça

Meta de homologação: média ≥9, nenhuma categoria <8. **Nenhuma das notas abaixo atinge essa barra** — avaliação de QA independente, não homologação.

| Critério | Nota | Evidência |
|---|---:|---|
| Qualidade do cenário | **6** | Decalques de chão variados e bolsões de cogumelo/cristal visíveis e menos uniformes (`p7_clareira_depois_v9p7_dia_geral.png` [E]); ponte não é mais coberta pela água animada, correção confirmada em 3 quadros do vídeo (`frame_006.0`, `frame_008.0`, `frame_013.0` [E]). Puxa a nota para baixo: o **mirante** (POI 28,15) aparece em praticamente todo quadro como uma laje retangular cinza/azulada lisa, sem desenho de plataforma elevada, grade ou identidade (visível em `p7_clareira_depois_v9p7_dia.png`, `_noite.png`, `p7_fg_bau_tamer_atras.png`, e em quase todo quadro do vídeo [E]) — é o elemento mais visível do recorte e não lê como "mirante". |
| Profundidade e composição | **6** | As 3 molduras de FG são o pedido central do brief; nas capturas dedicadas (`p7_fg_ponte_tamer_atras.png`, `p7_fg_bau_tamer_atras.png`) o Tamer está **ao lado**, não atrás, da moita — nenhuma captura entregue mostra o personagem parcialmente oculto. O próprio DEV_REPORT mede a altura opaca das moitas em 15–24 px [E-dev] contra um corpo de ~56–60 px (`ART_DIRECTION_V2.md` §1.2) — isso é ~25–40% da altura, mais perto de joelho/coxa do que de cintura (~45–50%); a frase "até a cintura" não bate com o próprio número relatado. 60/30/10 ficou 50/25/25 [E-dev], no limite da tolerância de ±15 pontos do brief (25−10=15). |
| Iluminação e efeitos | **6** | 5 luzes com função justificada por POI, sem brilho aditivo nos cogumelos/cristais — resolve a queixa de "bolhas rosas por toda parte" (comparar `p7_clareira_antes_v8_noite_geral.png` × `p7_clareira_depois_v9p7_noite_geral.png` [E]). Contraste dia/noite é fraco: as capturas "dia" (`p7_clareira_depois_v9p7_dia.png`) têm tom quase tão escuro/azulado quanto as de "noite" — a leitura de "é dia" não é clara pela paleta sozinha [E, H]. |
| Vida ambiental | **6** | Vagalumes e poeira aparecem como pontos de partícula espalhados nas capturas noturnas [E]; vento (`look.sway`) não foi possível confirmar por quadros estáticos de 0,5 s — não há verificação visual própria de movimento nas touceiras/grama. Zona de "grama alta" (GS-012) não se lê como zona distinta: nos quadros 20–27 do vídeo, os traços de grama sobre a área de encontro são decalques finos e esparsos, visualmente parecidos com o chão normal do resto do mapa, sem massa ou altura que sinalize "aqui tem mais chance de encontro" [E, H]. Borboleta (item opcional do brief) não foi produzida — aceito como limitação registrada, não penaliza isoladamente. |
| Consistência artística | **6** | Nenhum asset novo, reaproveitamento consistente de sprites já aprovados — mantém a paleta. Mas o conjunto visual final mistura: laje cinza do mirante, disclaimer legal fixo no canto superior esquerdo em toda captura, e HUD de debug — três elementos que quebram a leitura de "cenário acabado" nas mesmas imagens usadas para avaliar arte [E, H]. |
| Integração com gameplay | **8** | Ponto mais forte da entrega: vídeo mostra o ciclo completo grama→salto→combate→vitória com recompensa (`frame_022.0` "Um Floramon selvagem saltou da grama!" → `frame_025.0` "Venceu! +22 XP · +9 bits" [E]); reaproveita o combate existente (sem sistema duplicado, GS-012 §7); painel de debug funcional e não deixa vazar RNG para o cliente por evidência do próprio relatório [E-dev]. Performance na visão de jogo igual ao v8 [E-dev, não reverificado]. |

---

## 2. Checklist do brief `P7_CLAREIRA_BRIEF.md` §7, item por item

| # | Item do checklist | Resultado | Evidência |
|---|---|---|---|
| 1 | Captura `?look=v9` dia/noite do recorte, comparada com antes | **OK** | 4 pares antes/depois entregues, dia e noite, visão de jogo e geral [E]. |
| 2 | Contar luzes acesas à noite: deve dar 5 (não mais que 6) | **Não verificável com precisão por mim** | Visualmente a contagem no `_geral` bate com "pouco mais de 5" [E], mas a captura geral extrapola o recorte exato (12–41,6–29) e eu não contei célula a célula; aceito o número do DEV_REPORT [E-dev] sem reverificação própria. |
| 3 | Confirmar visualmente as 3 molduras de FG (Tamer atrás em algum ponto) | **FALHA** | As 2 capturas dedicadas (`p7_fg_ponte_tamer_atras.png`, `p7_fg_bau_tamer_atras.png`) mostram o Tamer ao lado das moitas, não atrás/oculto; nenhuma imagem demonstra oclusão real. A 3ª moldura (trecho curvo do riacho) não tem captura dedicada nenhuma. O teste de oclusão citado pelo DEV_REPORT (`fgAlphaCovering: []`) é instrumentado, não visual. |
| 4 | Zonas de grama alta não cobrem o centro da trilha | **Não verificável** | Nenhuma captura em plano geral com a trilha e as 2 áreas de grama marcadas foi entregue; o vídeo passa pela zona oeste mas sem enquadramento que permita medir distância até o eixo da trilha. |
| 5 | `sim.mjs --check` após adicionar as áreas | **Aceito, não reverificado** | DEV_REPORT relata "ok (19 entradas, 7 áreas)" [E-dev]; não reexecutei. |
| 6 | Zonas de spawn antigas desligadas quando os pontos GS-012 equivalentes estão ativos | **Consistente, indireto** | Nas capturas "depois" só aparecem "Tentomon"/"Palmon" nomeados como selvagens visíveis dentro do recorte, nada que sugira duplicação; não inspecionei a tabela/código. |
| 7 | Testar em movimento real (não só captura estática) | **Parcial** | O vídeo cobre sul→baú→ponte→grama oeste→encontro, mas não fecha o "volta" (retorno) nem passa pelo vau ou pela fonte de cura. |
| 8 | Enquadramento: personagem a ~9% da altura lógica com `?dpr=1` | **Plausível, não medido** | Proporção do Tamer nas capturas de jogo parece compatível com a referência [H]; não medi pixel a pixel. |

---

## 3. Encontros (GS-012 §6/§11)

- **Legibilidade do salto:** fraca para quem assiste em velocidade normal. Nas 4 capturas estáticas da sequência (`p12_encontro_1_grama.png` → `_2_salto.png` → `_3_placa.png`), o Tentomon alvo está visualmente quase na mesma posição nos 3 quadros — não dá para "ler" um arco de salto ou o farfalhar da touceira parando nessas imagens isoladas; só o surgimento da placa de nome no quadro 3 é claramente legível. No vídeo, a amostragem a cada 0,5 s (quadros `frame_022.0` e `frame_023.0`) mostra o encontro inteiro — mensagem de log, Floramon no mapa e já em combate — acontecendo dentro de 1 s: o ciclo de 1,2 s descrito pelo DEV_REPORT (grama → arco → pouso/placa) é curto demais para qualquer verificação quadro a quadro de 0,5 s e, por extensão, arriscado de passar despercebido em jogo normal sem pausar.
- **Ritmo no vídeo:** os marcos do roteiro (sul, baú, ponte, grama, encontro, combate) batem com a ordem declarada e com as posições de câmera observadas (`frame_000.0` a `frame_027.0` [E]); o trecho de exploração (0–22 s) é bem mais longo que o de combate (~3 s), o que deixa a demonstração "passeio-pesada" e o encontro em si sub-representado — não há repetição do ciclo de encontro para mostrar variação (raridade diferente, fuga, etc.), só um caso de sucesso.
- **Bugs:** nenhum bug funcional observado nas capturas e no vídeo — fluxo grama→salto→combate→recompensa (+22 XP, +9 bits) completou sem erro visível, texto de log consistente em todos os quadros, painel de debug sem artefatos [E]. Não testei entradas de borda (fuga, múltiplos jogadores, etc.) — fora do escopo de uma revisão de mídia estática/vídeo.

---

## 4. Lista de defeitos visuais

### P0 — nenhum
Nenhum problema bloqueante de funcionamento foi identificado nas evidências disponíveis (vídeo e capturas mostram o ciclo de jogo completando corretamente).

### P1
1. **Mirante (28,15) lê como laje cinza genérica**, sem trabalho de composição visível, aparecendo em quase toda captura "depois" como o elemento de fundo mais chamativo e menos acabado do recorte (`p7_clareira_depois_v9p7_{dia,noite}.png`, `p7_fg_bau_tamer_atras.png`).
2. **Molduras de primeiro plano não demonstradas**: nenhuma captura entregue mostra o Tamer de fato atrás/parcialmente oculto por uma moita, contradizendo o item 3 do checklist do próprio brief; a altura opaca medida pelo DEV_REPORT (15–24 px) é inferior ao necessário para cobrir "até a cintura" de um corpo de ~56–60 px.
3. **Legibilidade do salto/encontro é marginal**: a transição grama→salto→combate ocorre em ~1 s de tempo de tela observável, sem quadro claro de farfalhar/arco/pouso nas capturas dedicadas da sequência.

### P2
4. **Rótulo de isenção legal** ("Fan game não oficial...") fixo no canto superior esquerdo em 100% das capturas e do vídeo, ocupando área de leitura relevante e competindo visualmente com o cenário.
5. **Zonas de grama alta (GS-012) não se distinguem visualmente** do chão comum — os tufos ficam finos e esparsos, sem massa que sinalize "zona de encontro" ao jogador.
6. **Contraste dia/noite fraco**: as capturas "dia" têm tom quase tão escuro/azulado quanto as de "noite", prejudicando a leitura de período do dia só pela paleta.

---

## Limitações desta revisão

- Não reexecutei `npm test`, `npm run build`, `map:validate` nem `sim.mjs --check`; os números citados do DEV_REPORT são **[E-dev]**, não verificados por mim.
- Contagem exata de luzes dentro do recorte 12–41,6–29 não foi feita célula a célula (só inspeção visual das capturas gerais, que extrapolam o recorte).
- Vento/`look.sway` não pôde ser avaliado por quadros estáticos a 0,5 s — exigiria vídeo a taxa de quadro cheia ou inspeção de código.
- Enquadramento de câmera (9% da altura) foi julgado por proporção visual, não medido em pixels.
- Por regra do workspace (`AGENTS.md`), este relatório **não foi gravado dentro do worktree `qo` de game-dev** (`~/projects/GameStudio/workspaces/game-dev/qo`), por ser workspace de outro agente. Está em `~/projects/GameStudio/workspaces/game-qa/phase3_qa_GS003/QA_PHASE3.md`; recomendo que o coordenador (game-studio) copie para `quality-overhaul/phase3/qa/QA_PHASE3.md` no worktree de game-dev, ou peça a game-dev para puxar o arquivo.
