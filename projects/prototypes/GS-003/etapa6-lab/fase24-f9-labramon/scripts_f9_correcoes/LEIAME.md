# Scripts — F9 correções de arte pós-QA (A2–A8), 2026-11-16 (Node, sem dependências)

Tudo local, 0 gerações (as 2 gerações pixminimax da rodada ficaram só como evidência; ver relatório).
Pasta de trabalho: `workspaces/game-art/tmp-f9/` (`f58/` = clipes das Fases 5–8, `f4/` = movimento da Fase 4).

## Ordem (reexecutável)
1. **A5 — rotações S/W:** `node a5_rot.js <_pre_correcao/rotacoes> <rotacoes>` (lista explícita de pixels; só a paleta de 19).
2. **Clipes E (A3, A4, A8, A2):** em `tmp-f9/f58/` (com `rot_E.png` e `idle_E_q0.png` = `movement/idle/E/frame_000.png`):
   - `node post58.js` grava `fin/`; renomeie para `fin_pre_correcao/` (já feito nesta rodada);
   - `node fix_f9.js fin_pre_correcao fin` → A3 (tufo), A4 (`a4_f9.js`: topo do capuz, olho fechado), A8 (rampa horizontal), A2 (`intermed_f9.js`: frame_008 do irritado e da comemoração), medições em `fin/_log.json`;
   - `node build58_f9c.js <fase24-f9-labramon>` → remonta `combat/ rest/ emotions/ interactions/` (preserva `interactions/contratos/`).
3. **Movimento (A5 trava de rosto, A7):** `node build_mov_f9.js <fase24-f9-labramon> <tmp-f9/f4>` — usa `post_mov.js` (= `scripts_f9_fase4/post.js` com o rosto S incluindo y=32) e, de `scripts_f9_fase4/`, `specks.js`, `make_idle.js`, `gif.js`, `sheet.js`, `qa.js`, `manifest.js`; `a7_walkN.js` desce o corpo do walk N 2 px.
4. **Lab (só dados):** `node scripts_f9_fase9/build_lab_data.mjs`.
5. **Medição (cópia dos scripts do QA, saída fora de `qa_f9/`):** `QA_OUT=<pasta> node qa/visual.mjs` e `QA_OUT=<pasta> node qa/check.mjs` com cwd = `fase24-f9-labramon` (ou `_pre_correcao/` para o "antes").

Auxiliares: `crop.js` (recortes ampliados), `ascii.js`, `sheet58.js`, `gif.js`, `gif_decode_check.js`, `fx_bark.js`, `lib.js`, `rig.js`, `png.js`.
