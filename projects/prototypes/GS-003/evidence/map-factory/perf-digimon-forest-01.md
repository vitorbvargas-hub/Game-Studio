# Performance — digimon-forest-01 (frame-time, ambiente headless)

- **Data:** 2026-11-09T17:05:34.739Z · **Gerado por:** `scripts/capture-live.mjs` (`ONLY=perf`)
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
| day: trabalho do quadro | 4 | 5.6 | 6.6 | 4.173 | 10.5 |
| day: intervalo entre quadros | 16.7 | 33.4 | 33.4 | 24.749 | 50.1 |
| day: render + raster | 15.9 | 20 | 24.8 | 16.431 | 33.1 |
| night: trabalho do quadro | 5.8 | 7.7 | 9.4 | 5.951 | 15.4 |
| night: intervalo entre quadros | 33.3 | 33.4 | 33.5 | 26.055 | 50.1 |
| night: render + raster | 17.9 | 20.4 | 23.2 | 18.129 | 37.1 |

| Hora | fps médio | fps potencial (p50 trabalho) | quadros > 16,7 ms (trabalho / render+raster) | cena |
|---|---|---|---|---|
| day | 40.4 | 250 | 0 / 207 | 56×40 tiles, 852 props, 34 entidades (31 selvagens), canvas 1792×1280 |
| night | 38.4 | 172.4 | 0 / 526 | 56×40 tiles, 852 props, 34 entidades (31 selvagens), canvas 1792×1280 |
