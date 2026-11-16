# PROGRESS — QA independente F9 Labramon (game-qa)

Árvore: repo `~/projects/GameStudio`, branch `master`, HEAD `f02fbab`; pasta `fase24-f9-labramon/` inteira **não versionada** (`??`).
Roteiros: `qa_f9/scripts/` (originais) e `qa_f9/regressao/scripts/` (cópias com saída em `qa_f9/regressao/` + `lab_extra.mjs`). Rodar com cwd = `fase24-f9-labramon`.

## 1. QA independente (Fase 10) — 2026-11-16 ~01:30–02:40 BRT — CONCLUÍDO
- Entregável: `F9_QA_INDEPENDENTE.md`; evidências `qa_f9/`.
- 14 itens média **7,79**; régua Hawkmon (movimento) 7,91; P0 0, P1 1 (A1 passada × Tamer), P2/P3: A2–A10, L1–L7, I1, I2.

## 2. QA de regressão (A2–A8, L1–L7) — 2026-11-16 ~05:45–06:30 BRT — CONCLUÍDO
- [x] Lidos `F9_QA_INDEPENDENTE.md`, `RELATORIO_F9_CORRECOES.md`, `RELATORIO_F9_LAB_CORRECOES.md`.
- [x] `check.mjs` → 549 refs, 0 faltando, 211 SHA OK; 162 quadros limpos (paleta, alfa, pé y=49 exceto 3 no ar); 92 GIFs OK; standing = rotação 4/4.
- [x] `visual.mjs` → costuras: 32/41 iguais; A7 543→353, A8 703→439, A2 859→664 / 753→668.
- [x] `pe.mjs` → idêntico ao original (A1 aberto).
- [x] `lab_qa.mjs` + `lab_extra.mjs` → 182/182, 0 erros; L1–L7 corrigidos; O1 cosmético (rótulo com botão Deitar desabilitado fora de E).
- [x] Inspeção a olho: A5 (rotações S/W a 1×/3×/10×), A3/A4 (8×), A2 (6×), walk N e walk S/W.
- [x] Notas: média 14 itens **8,04**; régua movimento **8,06**.
- [x] Entregável: `F9_QA_REGRESSAO.md`.

## Retomada
Nada pendente. Próximo QA só após nova rodada autorizada (A1, A2 restante, A5 W/garras, A6, A9, A10, I1, I2).
