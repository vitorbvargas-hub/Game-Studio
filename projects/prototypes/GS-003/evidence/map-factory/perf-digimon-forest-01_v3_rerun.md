# Performance — digimon-forest-01 (frame-time, ambiente headless)

- **Data:** 2026-11-09T22:00:13.071Z · **Gerado por:** `scripts/capture-live.mjs` (`ONLY=perf`)
- **Comando:** `OUT=../../evidence/map-factory W=1792 H=1280 CHROME_LIBS=/tmp/chromelibs/root/usr/lib/x86_64-linux-gnu ONLY=perf npm run shots:live`
- **Ambiente:** HeadlessChrome/153.0.8010.12, AMD Ryzen 5 5500 (12 núcleos), 8 GB, kernel 6.18.33.2-microsoft-standard-WSL2, Node v24.19.0

> **Headless.** Chromium headless (`chrome-headless-shell`) com `--disable-gpu`: o Canvas 2D é rasterizado em software e o rAF segue um relógio de ~60 Hz, não o vsync de um monitor. Os números servem para comparar versões do mapa/renderer nesta máquina, não como garantia de fps no dispositivo do jogador.

## Método

- Mapa inteiro na tela: janela 1792×1280, zoom 1, HUD escondido, semente 7, AUTO ligado (selvagens, parceira e bots em movimento).
- 120 quadros de aquecimento, depois **600 quadros** medidos, de dia e de noite (grade noturno + luzes).
- **Trabalho do quadro (loop real):** wrapper em requestAnimationFrame injetado antes do carregamento (Page.addScriptToEvaluateOnNewDocument): work = duração do callback do quadro (sim + render + rótulos + HUD); interval = diferença entre timestamps do rAF.
- **Render + raster:** N chamadas síncronas de view.render(presenter, 0, now) + getImageData(0,0,1,1) no #world (força a rasterização).
- Percentis por posto mais próximo sobre as N amostras; fps médio = 1000 / intervalo médio; fps potencial = 1000 / p50 do trabalho.

## Resultado (ms)

| Medida | p50 | p95 | p99 | média | máx |
|---|---|---|---|---|---|
| day: trabalho do quadro | 3.3 | 4.6 | 5.2 | 3.426 | 9.7 |
| day: intervalo entre quadros | 16.7 | 33.4 | 33.4 | 20.833 | 33.5 |
| day: render + raster | 13.6 | 15.1 | 16.8 | 13.65 | 20.6 |
| night: trabalho do quadro | 5 | 6.7 | 8.1 | 5.252 | 20.4 |
| night: intervalo entre quadros | 16.7 | 33.4 | 33.4 | 22.166 | 33.5 |
| night: render + raster | 15.1 | 17.4 | 21.5 | 15.513 | 28.9 |

| Hora | fps médio | fps potencial (p50 trabalho) | quadros > 16,7 ms (trabalho / render+raster) | cena |
|---|---|---|---|---|
| day | 48 | 303 | 0 / 8 | 56×40 tiles, 642 props, 32 entidades (29 selvagens), canvas 1792×1280 |
| night | 45.1 | 200 | 1 / 58 | 56×40 tiles, 642 props, 32 entidades (29 selvagens), canvas 1792×1280 |
