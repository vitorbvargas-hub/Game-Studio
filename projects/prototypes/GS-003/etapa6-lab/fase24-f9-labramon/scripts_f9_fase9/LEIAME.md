# Scripts F9 Fase 9 (Node, sem dependências)

1. `build_lab_data.mjs` — lê os `manifesto.json` reais de `movement/`, `emotions/`, `rest/`, `interactions/`,
   `combat/` e o índice de contratos; escreve `lab/lab-data.js` (todos os caminhos relativos a `lab/`, nenhum
   pixel regenerado). Copia (não move, não edita) `etapa6-lab/fase1-pixellab/referencias/tamer_v13_south.png`
   para `lab/assets/tamer_reference/` como referência visual do Tamer provisório. Reexecutar sempre que a arte
   ou os manifestos das Fases 3–8 mudarem:
   ```
   node scripts_f9_fase9/build_lab_data.mjs
   ```

2. `run_headless_test.mjs` — abre `http://127.0.0.1:5198/lab/index.html` no `chrome-headless-shell` do
   Playwright (`~/.cache/ms-playwright/chromium_headless_shell-1243`, libs em `/tmp/chromelibs/ex/usr/lib/...`)
   via CDP puro (mesmo padrão do `capture_reference.mjs` do map-factory; sem Playwright/Puppeteer como
   dependência). Reescreve `process.env.NO_PROXY`/apaga `HTTP_PROXY`/`HTTPS_PROXY` do próprio processo Node
   antes de qualquer `fetch`/`WebSocket`, porque o sandbox define um proxy de egresso global que, sem isso,
   intercepta até as chamadas ao `127.0.0.1` do CDP. Verifica: todos os assets carregam (`window.__labReady`
   + `window.__labAssetSummary`), roda `window.__labSelfTest()` (todo controle, todas as direções do
   movimento, checagem de indisponibilidade fora de E) e conta erros de console/página via
   `Runtime.consoleAPICalled`/`Runtime.exceptionThrown`. Evidências em `_evidencias_teste/` (3 capturas +
   `report.json`). Pré-requisito: o servidor do laboratório já rodando em 5198.
   ```
   node scripts_f9_fase9/run_headless_test.mjs
   ```

Servir o laboratório (unit systemd --user usada nesta entrega):
```
systemd-run --user --unit=gs003-lab-labramon-5198 \
  --working-directory=/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/etapa6-lab/fase24-f9-labramon \
  -- python3 -m http.server 5198 --bind 127.0.0.1
```
Parar: `systemctl --user stop gs003-lab-labramon-5198`.
