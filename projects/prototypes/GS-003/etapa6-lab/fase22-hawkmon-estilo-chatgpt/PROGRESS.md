# PROGRESS — C15b Hawkmon novo: walk + idle (4 direções)

**STATUS: CONCLUÍDO (2026-11-15).** Ver `RELATORIO_C15B.md` para o relatório completo (atualizado com a tarefa de continuação C15b-2). Entregue: walk e idle nas 4 direções (S,E,N,W). A tarefa original (C15b) parou no teto de 12 gerações com idle N/W pendente; a tarefa de continuação (C15b-2, mesma data) completou idle N/W dentro de um teto próprio de 2,5 gerações (gasto real 2,3), sem reabrir o teto do brief original. Brief: `BRIEF_C15B_ANIMACAO.md`. Teto original 12 gerações (gasto 11,45) + teto da continuação 2,5 gerações (gasto 2,3) = 13,75 no total; piso de saldo 545 respeitado nas duas tarefas (saldo inicial 559,15 → final 545,40).

## Passos

- [x] Lido `DIGITAL_ODYSSEY_CONTEXT.md`, `BRIEF_C15B_ANIMACAO.md`, `RELATORIO_C15A.md`, `pacote.json` do v1b, `QA_BUILD_HAWKMON_INDEPENDENTE.md` §2 (cadência/recoil) e a referência PolloAI (só pose).
- [x] Copiadas as 4 rotações C15a para `~/projects/GameStudio/workspaces/game-art/tmp-c15b/` (workspace, não é entrega).
- [x] Inspecionadas as rotações (ASCII grid local) — pernas/pés em y~42-49 na S, cores amarelas `#f1ce2d`/`#c19e25` para os pés.
- [x] `get_balance` inicial: 559,15.
- [x] Upload das 4 PNG (upload:3cedb341…, upload:15affc69…, upload:7488da16…, upload:8af94da0…).
- [x] `create_character` v3, import das 4 rotações (0,25 geração, 0 regeneração) — id `a3dc7c3d-e63a-43f0-a4d7-dadc124417fc`.
- [x] walk S/E v3 custom (8 quadros, 1 ger/direção) — tentativa 1 (passada curta, ~2px/quadro).
- [x] idle template (breathing-idle) S/E — REPROVADO (âncora caiu para y41-44, altura encolheu para 33-35; longe do alvo y=49/h=38). Apagado (`delete_animation`).
- [x] idle v3 custom S/E (4 quadros, 1 ger/direção) — âncora estável em y=49, altura 37-41 (E ficou 38 constante nos 4 quadros).
- [x] Pipeline de limpeza (igual C15a): `correct_pixelart` (0,1/chamada) → `reduce_colors` com `palette_image` = PNG original C15a da própria direção (0,1/chamada) → script local de correção de âncora (shift vertical) quando necessário.
- [x] Auditoria: 0 semitransparência, 17-18 cores (dentro das 18 da C15a) em todas as 32 imagens testadas até agora.
- [x] walk E tentativa 1 media ~2px/quadro de recuo do pé (igual ao v1b, não atingiu a meta 3-5px) → reprovado para uso final.
- [x] walk E tentativa 2 (`walk_longstride`, prompt pedindo passada "exagerada, grande, pernas bem afastadas") — recuo medido: quadros finais do passo (5→6→7) 4, 3.5, 3 px/quadro (dentro da meta); primeira metade do ciclo mais curta (~1,75px/quadro) e 1 quadro de duplo apoio (ambos os pés no chão, transição). Usada como walk/E final.
- [x] walk N/W v3 custom: W aprovado direto (prompt de passada longa); N com esse mesmo prompt COLAPSOU (altura 37→27px, âncora y49→y45) — descartado; N refeito com o prompt neutro (igual à S) e aprovado.
- [x] Pipeline de limpeza aplicado a N+W também (correct_pixelart + reduce_colors combinados numa chamada cada, 16 quadros).
- [x] Correção de âncora (shift_y.js) em 11 dos 40 quadros finais — 100% em y=49 depois.
- [x] `pacote_hawkmon_v2/` montado: pacote.json, rotations/, walk/{S,E,N,W}, idle/{S,E}, folha_contato_3x.png, prancha_comparacao_v2.png, 12 GIFs (1x/4x por animação).
- [x] `RELATORIO_C15B.md` escrito.
- [x] **idle N/W — FEITO em tarefa de continuação (C15b-2, 2026-11-15).** Mesmo personagem (`a3dc7c3d-...`), mesmo prompt de S/E, mesmo funil (correct_pixelart combinando os 8 quadros em 1 chamada + reduce_colors por direção com palette_image da rotação original). Âncora já saiu em y=49 nos 8 quadros, sem precisar de `shift_y.js`. Gasto: 2,3 gerações (teto da tarefa: 2,5; saldo final 545,40, piso 545, margem 0,40). `pacote_hawkmon_v2/` atualizado: `idle/N/`, `idle/W/`, 4 GIFs novos (`idle_N_1x/4x.gif`, `idle_W_1x/4x.gif`), `pacote.json` e `folha_contato_3x.png` (agora 8 linhas) atualizados.

### Saldo e custo (final)
- Saldo inicial: 559,15. Saldo final: **547,70** (`get_balance` confirmado). Gasto total: **11,45 gerações** (teto do brief: 12; margem final 0,55). Acima do piso 545 (margem 2,70).
- Personagem PixelLab: `a3dc7c3d-e63a-43f0-a4d7-dadc124417fc` (mantido, não apagado — útil para gerar idle N/W numa tarefa de continuação sem reimportar as rotações).

## Conclusão (C15b-2, 2026-11-15)
Tarefa de continuação executada: idle N/W gerado, limpo e integrado ao pacote. Nenhuma pendência de animação resta no brief C15b (walk e idle completos nas 4 direções). Pendências que continuam fora de escopo (ver RELATORIO_C15B.md §7): recuo do pé de apoio não uniforme em todos os quadros de walk E/W (medido, dentro do critério "medir e registrar" do brief), camadas separadas, confirmação visual dos GIFs num visualizador externo, integração no jogo e homologação (fora do escopo do game-art).

## Retomada
Se interrompido: conferir `list_characters`/`list_jobs` no PixelLab antes de gerar de novo (ids anotados acima). Scripts locais em `~/projects/GameStudio/workspaces/game-art/tmp-c15b/scripts/` (workspace, não é entrega).
