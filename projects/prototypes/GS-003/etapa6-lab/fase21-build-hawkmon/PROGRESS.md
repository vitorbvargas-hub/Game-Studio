# PROGRESS — Comando 14.3, build isolado Hawkmon v1b (porta 5197)

- [x] 2026-11-15 06:50 Brief e Re-QA v1b lidos. Primeira tentativa caiu sem produzir nada; recomeço do zero.
- [x] 07:30 Worktree `workspaces/game-dev/lab-hawkmon`, branch `lab/hawkmon-v1b` (de `lab/f7v2` 415825a); node_modules = symlink do lab-etapa6.
- [x] Assets `lab-assets/a-hawkmon` = cópia de `a-f7v2` + `digimon/LAB-HAWKMON/pixellab1` (60 PNG do v1b, cmp 60/60 iguais). `scripts/lab/import-hawkmon.mjs`.
- [x] Código: espécie local `src/data/lab-species-hawkmon.json` (só com VITE_LAB_BUILD=hawkmon); `walkPxPerFrame` (passo fixo da walk, sem mexer no limiar de corrida); `?parceiro=`, `?comparar=`, Shift lento, `?hawkpx=`/`?hawkms=`; Tamer de comparação (2º jogador). tsc 0.
- [x] Build `dist-lab-hawkmon` + serviço `gs003-lab-hawkmon-5197`.
- Religar: `cd workspaces/game-dev/lab-hawkmon/projects/prototypes/GS-003/prototype/world && systemd-run --user --unit=gs003-lab-hawkmon-5197 --property=Restart=on-failure --working-directory=$PWD --setenv=PATH=$PATH $(which npx) vite preview --outDir dist-lab-hawkmon --port 5197 --strictPort --host 127.0.0.1`
- Build: `VITE_LAB_VARIANT=a VITE_LAB_ASSETS_DIR=a-hawkmon VITE_LAB_BUILD=hawkmon npx vite build --outDir dist-lab-hawkmon`
- Próximo: capturas no Chromium headless (roteiros em `workspaces/game-dev/tools/h143/`).
- [x] 07:10 Medição (`tools/h143/walk.mjs` + `analisa.mjs`): pé travado 2 px/quadro → ~17 ms/quadro a ~91 px/s (normal) e 50 ms a ~38 px/s (Shift); 0 pulos; deslizamento médio 0 (−1..+2 por quantização do rAF). `?hawkms=73` → 67–83 ms, desliza ~5,3 px/quadro.
- [x] Reconstrução exata (`recon.mjs`) GIF + folhas com régua no chão. Screencast real (`capturas.mjs`) sem rótulo de quadro (o tempo do screencast headless não casa com o rAF).
- [x] Passeio (`passeio.mjs`): água, ponte, árvores, objetos; Tamer de comparação mudado para FORMAÇÃO (move_to ao lado) depois de ver os grupos se sobrepondo.
- Próximo: vitest/tsc/map:validate, conferir 5191/5196/Database, commit, relatório.
- [x] 07:25 tsc 0; vitest 523/527 (4 antigas de lab-duas-linhas) + 3/3 novos; map:validate --no-write 9/9 PASS. Modos (`modos.mjs`) 0 erros. 5191/5196 intactos; Database md5 igual; pacote v1b íntegro.
- [x] Commit local `34327c7` na branch `lab/hawkmon-v1b` (worktree `workspaces/game-dev/lab-hawkmon`). Sem push/deploy.
- [x] Relatório: `RELATORIO_BUILD_HAWKMON.md`. Valor final: walkPxPerFrame = 2 (~20 ms/quadro a 100 px/s; ~50 ms no lento). 73 ms só por `&hawkms=73` (desliza ~5,3 px/quadro).
- **Concluído. Parado aguardando game-qa / ChatGPT / Vitor.**
