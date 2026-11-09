# Performance — digimon-forest-01 (frame-time, ambiente headless)

- **Data:** 2026-11-09T20:43:51.188Z · **Gerado por:** `scripts/capture-live.mjs` (`ONLY=perf`)
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
| day: trabalho do quadro | 3.1 | 3.9 | 4.5 | 3.214 | 11.2 |
| day: intervalo entre quadros | 16.7 | 33.4 | 33.4 | 20.055 | 33.5 |
| day: render + raster | 12.6 | 14 | 15.9 | 12.717 | 17.8 |
| night: trabalho do quadro | 4.7 | 6.2 | 7 | 4.949 | 20 |
| night: intervalo entre quadros | 16.7 | 33.4 | 33.4 | 21.055 | 50 |
| night: render + raster | 14.7 | 16.4 | 20.9 | 14.99 | 30.6 |

| Hora | fps médio | fps potencial (p50 trabalho) | quadros > 16,7 ms (trabalho / render+raster) | cena |
|---|---|---|---|---|
| day | 49.9 | 322.6 | 0 / 4 | 56×40 tiles, 642 props, 32 entidades (29 selvagens), canvas 1792×1280 |
| night | 47.5 | 212.8 | 3 / 25 | 56×40 tiles, 642 props, 32 entidades (29 selvagens), canvas 1792×1280 |
