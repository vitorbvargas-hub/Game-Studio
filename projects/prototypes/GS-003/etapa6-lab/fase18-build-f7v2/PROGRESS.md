# PROGRESS — Comando 12.2, build isolado F7v2 (porta 5196)

- [x] 2026-11-14 22:30 Brief lido; pacote/projétil/QA lidos; código do Lab A mapeado.
- [x] Worktree isolado criado: `workspaces/game-dev/lab-f7v2`, branch `lab/f7v2` (a partir de `lab/etapa6` b4b6cc2). node_modules = symlink para o do `lab-etapa6`. O worktree `lab-etapa6` e o dist-lab-a (5191) não são tocados.
- [x] Assets: `etapa6-lab/lab-assets/a-f7v2/` (cópia de `lab-assets/a` + `digimon/CREATURE-0006/pixellab9/` = F7v2).
- [x] Código (tsc limpo): VITE_LAB_ASSETS_DIR, durações por quadro, âncora, projétil Pepper Breath, tecla de ataque de teste.
- [x] Build `dist-lab-f7v2` + serviço `gs003-lab-f7v2-5196`.
- [x] Capturas/GIFs (F7v2 e F2b `?agumon=v8`), 0 erros de console.
- [x] Relatório: `RELATORIO_BUILD_F7V2.md`.

- 22:55 build ok (`VITE_LAB_VARIANT=a VITE_LAB_ASSETS_DIR=a-f7v2 VITE_LAB_BUILD=f7v2 npx vite build --outDir dist-lab-f7v2`), serviço `gs003-lab-f7v2-5196` ativo, HTTP 200. 5191 continua ativo. Próximo: capturas.
- 23:40 Commit local `5640a3f` na branch `lab/f7v2` (worktree `workspaces/game-dev/lab-f7v2`). tsc 0 erros; vitest 523/527 (as 4 falhas são pré-existentes em `lab/etapa6`). 5191 intacto.
- Religar o serviço (se cair/reboot): `cd workspaces/game-dev/lab-f7v2/projects/prototypes/GS-003/prototype/world && systemd-run --user --unit=gs003-lab-f7v2-5196 --property=Restart=on-failure --working-directory=$PWD --setenv=PATH=$PATH $(which npx) vite preview --outDir dist-lab-f7v2 --port 5196 --strictPort --host 127.0.0.1`
- Refazer: `node scripts/lab/import-f7v2.mjs` → build (ver relatório §2) → `node scripts/lab/capture-f7v2.mjs`.
- **Concluído. Parado aguardando game-qa / ChatGPT / Vitor.**

## Comando 12.2b (ajustes depois do QA) — 2026-11-14
- [x] Brief e QA lidos. Worktree `lab-f7v2`, porta 5196.
- [x] P1 walk: sem `walkSpeedPxPerSec` (mesma lógica do F2b). Medido: mediana 117 ms/quadro, 0 pulos (F2b 100 ms). Pé desliza ~7–8 px do mundo por quadro (pela conta).
- [x] P2 projétil só em Baby Burner / Triple Baby Flame (e Pepper Breath, não equipado); Mach Jab e Uppercut com o efeito próprio.
- [x] P3 fogo S/E/W sempre na frente do Tamer à frente: 0/64 amostras atrás (antes 25/64).
- [x] Rebuild, reinício só do `gs003-lab-f7v2-5196`, Chromium 0 erros, capturas em `capturas/v2b/`.
- [x] Relatório: seção "0. Como testar (v2)" em `RELATORIO_BUILD_F7V2.md`. Commit local `415825a`. tsc 0; vitest 523/527 (4 antigas). Database intacta. 0 gerações.
- **Concluído. Parado aguardando coordenação.**
