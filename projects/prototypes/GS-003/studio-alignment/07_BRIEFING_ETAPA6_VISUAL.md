# 07 — Briefing da Etapa 6: laboratório visual (proposta)

- **Data:** 2026-11-12 · **Autor:** game-studio (Etapa 5) · **Status:** **PROPOSTA.** A Etapa 6 **não foi iniciada**. Nenhum mapa, sprite ou geração foi feito para escrever este documento.
- **Base:** brief Etapa 5 §8; `qa/ETAPA2_HOMOLOGACAO.md` §E–G; Style Bible GBA Plus §2, §3, §8; `direction-v13/`; `art/digi-forest-v15/`; ADR-010/011/012.

## 1. Objetivo

Escolher, com evidência medida, **como o Digital Odyssey vai produzir mapas e personagens com qualidade homologável** (nota ≥ 8), comparando três abordagens de mapa na **mesma área**, com a **escala Tamer × Digimon resolvida** e sem tocar na versão atual do jogo.

Saída da Etapa 6: um relatório comparativo + recomendação + uma área de prova homologável. **Não** é produção de mapas, regiões nem roster.

## 2. Pré-requisitos (decisões antes de começar)

| # | Decisão | Por que antes | Recomendação desta etapa |
|---|---|---|---|
| P1 | **G-1 — qual referência manda**: Style Bible GBA Plus (Endesga-32, contorno do sprite oficial) × referência PixelLab v13/v15 aprovada (saturada, contorno preto) | Sem isso o QA reprova qualquer abordagem por uma das réguas | Rebaixar a regra de paleta Endesga-32 do Style Bible para "recomendação", manter o resto do Style Bible (pixel nítido, sombra, sem AA, matriz §8) e adotar a v15 + refs do fundador como referência de cor/contorno. **[H]** — decisão do fundador |
| P2 | **G-2 — hipótese de escala** a testar (ver §4) | Toda arte da Etapa 6 herda a escala | Deixar a escala como **eixo do passo 0** (prancha sem geração) e congelar uma só antes das 3 abordagens |
| P3 | **D4 — Drimogemon × Digmon** e **D2/D3** (nomes, atributos) | Evita pôr espécie errada na prova | Corrigir só o catálogo/registro antes; nada no jogo |
| P4 | Orçamento PixelLab da etapa | Saldo ~738 de 2.000 em 12/11; renova 11/12 | Teto total **150 gerações** (A ≤ 60, C ≤ 60, B ≤ 20, reserva 10) **[H]** |
| P5 | Regra "um agente por vez" | Vale até 15/11 | Se a Etapa 6 começar antes de 15/11: abordagens em série, não em paralelo |

## 3. A área de teste (igual para as três)

- **Mapa:** Digi Forest (início do jogo), recorte da **área de spawn**: ponto inicial + primeiro corredor + primeira zona de mato + margem do rio/ponte. **[H]** 30×20 células de 32 px (960×640 lógicos) — dentro do mapa v15b atual (48×36).
- **Por que essa área:** é onde a Etapa 2 achou os piores problemas juntos (spawn colado em sólido T7, chão chapado nota 4, sem caminho nota 4, água em degrau, escala nota 4, HUD cobrindo a parceira) e é a primeira coisa que o jogador vê.
- **Elenco fixo em todas:** Tamer v13 (1 preset), Koromon, Agumon, Greymon (Champion DS — o caso crítico de escala), Guilmon, Garurumon; 1 NPC. Mesmo layout de jogo (colisão, mato, rotas) nas três — **o que muda é só a produção da arte**.
- **Condições de captura:** 1920×1080, mesma câmera e zoom inteiro, dia e noite, mesmo trecho de 60 s de movimento + 1 combate + 1 encontro no mato.

## 4. Problema de escala (Etapa 2) e o passo 0

**[E] Etapa 2, nota 4/10 em proporções:** num tile de 32 px, Tamer v13 ≈ 36 px (1,1 tile); Rookies DS 30–34 px (do tamanho do Tamer); Champions DS 38–42 px (Greymon 40×42) — **um Greymon é praticamente do tamanho de uma criança humana**; Koromon 28×22 some ao lado de árvores de 3 tiles; WarGreymon foi integrado com `mapScale 2` (~72 px), uma terceira regra. Na referência do fundador, o Tamer tem ~1,5 tile e o companheiro fica grande. O Style Bible §2.4 deixou em aberto tile 16 × 32; o fundador aprovou tile 32 em 11/11.

**Passo 0 (sem geração, só composição local com sprites existentes):** uma prancha por hipótese, na área de teste:

| Hipótese | Como | Custo | Risco |
|---|---|---|---|
| E1 — nativo 1× + câmera mais larga | tudo como hoje, viewport maior | ~0 | não resolve a hierarquia (Greymon ≈ Tamer) |
| E2 — escala por estágio | multiplicadores inteiros por estágio (ex.: Baby/Rookie 1×, Champion 2× nearest, Ultimate/Mega 2×) com Tamer 1× | baixo (código de render) | ×2 inteiro de rip DS fica "gordo"; precisa de aprovação da matriz (sem interpolação = permitido) |
| E3 — personagens ×2, cenário 32 | Tamer e Digimon ×2 nearest, tile 32 | baixo | Tamer ~72 px domina o tile; mapa parece pequeno |
| E4 — tile 16 nativo | cenário redesenhado em 16 px | alto (refazer tudo) | contradiz a aprovação de tile 32 (11/11) |

**Critério de escolha da escala (mensurável):** hierarquia de altura visível Baby < Rookie < Tamer ≤ Champion < Ultimate/Mega, com razão **Champion/Rookie ≥ 1,3** e **Tamer/tile entre 1,1 e 1,6** **[H, metas a aprovar]**; nenhum fator não inteiro; legível a 1920×1080. O fundador escolhe uma; as três abordagens usam a escolhida.

## 5. As três abordagens

| | A — PixelLab refinado | B — Tilesets próprios | C — Híbrido |
|---|---|---|---|
| O que é | Pipeline atual (Map Workshop: tileset Wang + objetos de mapa + `import-pixellab-map.mjs` + filtro cartoon) melhorado: caminhos, margem de água, variação de chão, penhasco | Tileset de chão/caminho/água/penhasco **do estúdio** (autotile Wang-47/blob em Tiled), desenhado ou editado à mão na paleta decidida (P1); props podem ser existentes | Chão, caminhos, água e transições como em B; árvores, props e animações ambientais do PixelLab como em A |
| Ponto forte esperado | rápido, já integrado, aprovado pelo fundador como direção | controle total de borda, transição e repetição (fraquezas da Etapa 2) | junta controle do chão com riqueza de props |
| Risco | borda em degrau da grade PixelLab; repetição; dependência de créditos | custo/tempo de mão; histórico de arte própria "abaixo do nível" (ADR-010, lição 09/11) | duas fontes de estilo no mesmo quadro |
| Teto | ≤ 60 gerações | ≤ 20 gerações (só apoio) | ≤ 60 gerações |
| Dono | game-art (produção) · game-design (layout comum) · game-dev (integração em flag) | idem | idem |

## 6. Critérios visuais mensuráveis

Cada abordagem é medida pelo `game-qa` com os mesmos roteiros; nota final 0–10 por critério (régua da Etapa 2) **e** a métrica bruta.

| # | Critério | Métrica bruta | Meta para aprovar **[H]** |
|---|---|---|---|
| V1 | Escala e hierarquia | altura em px de cada entidade; razões da §4 | dentro das metas da escala escolhida; 0 fator não inteiro |
| V2 | Consistência Tamer × Digimon × cenário | nº de "famílias" de contorno/paleta visíveis no quadro; % de pixels de cenário na paleta decidida (P1) | 1 família de cenário; ≥ 95% na paleta decidida |
| V3 | Repetição do chão | variantes de tile de chão usadas no recorte; maior bloco contíguo de chão sem variação (células) | ≥ 6 variantes; nenhum bloco liso > 6×6 |
| V4 | Vegetação | espécies de árvore, tipos de tufo/flor no recorte; maior repetição do mesmo prop lado a lado | ≥ 4 árvores, ≥ 3 tufos/flores; nenhum prop idêntico repetido em fileira > 3 |
| V5 | Caminhos e água | células de borda em degrau visível; presença de margem/transição água-terra | 0 degrau em caminho e margem; transição em 100% da borda |
| V6 | Profundidade | erros de Y-sort no roteiro; % entidades com sombra de contato ancorada nos pés; nº de níveis de altura (penhasco/desnível) | 0 erro; 100%; ≥ 1 desnível legível |
| V7 | Animação e dinamismo | elementos animados no recorte (água, cachoeira, vento, vaga-lume); quadros por estado do Tamer; direções do Tamer | ≥ 3 ambientais; walk ≥ 6, idle ≥ 4; 8 direções (hoje 4) |
| V8 | Interface e Digivice | sobreposição do HUD sobre Tamer/parceira (px²); botões visíveis no HUD; fonte com acentos | 0 sobreposição na área de jogo; ≤ 15 botões **[H]**; 100% dos textos pt-BR com acento |
| V9 | Composição | pontos focais no recorte; caminho que guia o olhar; % de área "vazia" sem intenção | ≥ 2 focais; 1 caminho; ≤ 15% vazio |
| V10 | Desempenho | FPS no mapa e com Digivice aberto (mesmo ambiente de medição) | ≥ 60 mapa; ≥ 50 com Digivice **[H; Etapa 2 mediu 32]** |
| V11 | Custo de produção | gerações gastas; horas-agente; nº de assets para a área | registrar; usado para projetar 1 região inteira |
| V12 | Reprodutibilidade | dá para fazer a próxima área com o mesmo processo? (documento de pipeline passo a passo) | sim, com estimativa de custo por área |

**Aprovação de uma abordagem:** média ≥ 8 nos critérios V1–V10, nenhum < 7, **0 falha crítica** do Style Bible §8.3 (ajustada pela decisão P1), avaliação do game-art diretor em sessão separada **e** evidência do game-qa; homologação do fundador. **Comparação**: tabela lado a lado + capturas na mesma posição + V11/V12 para custo de escalar.

## 7. Preservação da versão atual

- Antes de qualquer coisa: tag no worktree `qo` (ex.: `pre-etapa6`) e registro do commit e do hash do build atual.
- Cada abordagem em **branch própria** (ex.: `lab/etapa6-a`, `-b`, `-c`) e atrás de **flag** (`?lab=a|b|c`). A URL padrão, o save `gs003.world.save` e o mapa v15b continuam iguais.
- Nada de deploy; a prévia Vercel não muda.
- Assets novos em `projects/prototypes/GS-003/art/etapa6/<a|b|c>/`; nenhum asset aprovado anterior é apagado ou sobrescrito.
- O `game-qa` confirma no fim: URL padrão idêntica (captura e hash), testes passando, `git status` limpo no `qo`.

## 8. Sequência proposta (um agente por vez)

| Passo | Agente | Saída |
|---|---|---|
| 0 | game-design | layout-brief da área (grade, colisão, mato, POIs, rota) — comum às 3 |
| 0b | game-art | prancha de escala E1–E4 (sem geração) → **fundador escolhe** |
| 1 | game-art | abordagem A (teto 60) |
| 2 | game-art | abordagem B (teto 20) |
| 3 | game-art | abordagem C (teto 60) |
| 4 | game-art (sessão de diretor) | matriz por abordagem |
| 5 | game-dev | integração das 3 atrás de flag, mesma área |
| 6 | game-qa | medição V1–V12, capturas lado a lado |
| 7 | game-studio → fundador | relatório comparativo + recomendação → homologação |

## 9. Fora do escopo da Etapa 6

Novos mapas ou regiões; produção do roster; regras de jogo (continuam congeladas); servidor; publicação; integração da Database ao jogo; Tamers novos além do preset de teste.

## 10. Riscos

- Créditos PixelLab acabarem antes de C (mitigação: ordem A → B → C com teto fixo; reserva 10).
- Limite de uso derrubar etapas longas (PROGRESS por passo; um passo por agente).
- O fundador preferir uma abordagem que falha em V11/V12 (custo de escalar) — o relatório tem de mostrar o custo de 1 região inteira, não só da área.
- Comparação injusta se o layout mudar entre abordagens (por isso o passo 0 é comum e congelado).
