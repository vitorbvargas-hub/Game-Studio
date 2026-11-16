# Scripts F9 Fases 5–8 (Node, sem dependências)

Rodar de uma pasta de trabalho com `raw/<animação>/frame_NNN.png` (quadros brutos do PixelLab) e `rot_E.png` (cópia de `rotacoes/labramon_E.png`):

1. `node pre58.js` — recorta para 60x60 no deslocamento medido, remove componentes soltos, ancora em y=49 → `pre/`.
2. `node post58.js` — correções pontuais (queixo, topo da cabeça), trava de rosto nos quadros neutros, falhas de contorno, medições → `fin/`.
3. `node build58.js <pasta fase24-f9-labramon>` — monta `combat/ rest/ emotions/ interactions/` (quadros, tiras, GIFs, folhas, manifestos). Preserva `interactions/contratos/`.

Auxiliares: `fx_bark.js` (onda de choque), `sheet58.js` (folha de contato), `gif.js`/`gif_decode_check.js`, `offset.js`, `fdiff.js`, `d2.js`, `measure.js`, `ascii.js`, `fetch.sh`, `upload.sh`.
Os quadros brutos usados estão em `<pasta>/_evidencias/bruto_pixminimax/`.
