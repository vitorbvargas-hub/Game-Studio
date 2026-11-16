# PROGRESS — C14.4-A Hawkmon cadência 50 ms + Agumon N/S (game-dev)

- [x] 2026-11-15 20:40 Brief, contexto comum, relatório 14.3 e QA independente lidos. Worktree `lab-hawkmon` limpo (34327c7; só node_modules não versionado). 5197 ativo.
- [x] Libs do Chromium reextraídas para /tmp/chromelibs (reboot apagou).
- [ ] Medição ANTES (tools/h143/walk.mjs, QA_OUT=fase23-c14-4-f5/medicoes).
- [x] 20:50 ANTES medido (`medicoes/walk_analise_antes.json`): Hawkmon 2 px → 16,7 ms mediana, 88–92 px/s; Agumon E/W 116,6 ms / 11 px; **Agumon N/S normal: 0 quadros de walk (reproduzido)**.
- [x] Diagnóstico (`tools/h143/diag_cmp.mjs`, `medicoes/diag_antes.json`): o Tamer de comparação (3 tiles à direita) trava em y=242 indo para N (obstáculo na coluna dele); como o `move_to` é reenviado a cada tick, o `stuckTicks` da sim zera e ele fica "andando" contra o obstáculo; o Agumon não sai do lugar. Defeito da FERRAMENTA de teste (formação), não do Agumon nem do motor.
- [x] Código (main.ts, só build hawkmon): `HAWK_WALK_PX_DEFAULT = 5` (50 ms a 100 px/s; `?hawkpx`/`?hawkms` vencem); `followFormation` passa a seguir a trilha do Tamer local (4 tiles atrás) quando a formação trava 2 ticks. tsc 0.
- [x] 20:55 Build dist-lab-hawkmon + 5197 religado (active, 200). DEPOIS: Hawkmon 50 ms mediana (49,5–51,7 média), 5 px, 88–92 px/s, 0 pulos; Agumon de comparação anda N/S (116,6 ms); Agumon como parceiro principal 116,6 ms/11 px/89–92 px/s (igual ao 14.3); Tamer 91–93 px/s; hawkms=73 e hawkpx=2 ok.
- [x] tsc 0; vitest 526/530 (4 antigas de lab-duas-linhas); map:validate --no-write 9/9; 0 erros de console em 11 sessões. Database 8b71f53e igual; 5191 já estava fora do ar (não tocada); 5196 ok.
- [x] Faixa mostra o passo em uso; rebuild + restart; links.json (5 links com &time=dia, 0 erros).
- [x] Commit local 3dd8837 (lab/hawkmon-v1b). Relatório: RELATORIO_C14_4A.md.
- **Concluído. Parado aguardando game-qa / ChatGPT / Vitor.**

---

# PROGRESS — C14.4-B Hawkmon v2 no build 5197 (game-dev)

- [x] 2026-11-15 ~21:40 Brief, contexto comum, RELATORIO_C14_4A, pacote v2 (pacote.json, RELATORIO_C15B) lidos. Worktree `lab-hawkmon` limpo em 3dd8837 (só node_modules não versionado). 5197 ativo.
- Plano: v2 entra como `digimon/LAB-HAWKMON/pixellab2/` ao lado do v1b (`pixellab1`, intocado) em `lab-assets/a-hawkmon`; a maior versão vence → v2 é o padrão; `&hawk=v1b` fixa `pixellab1` (via pins do `?pl=`). Passo 5 px (50 ms) mantido.
- [x] ~21:42 `scripts/lab/import-hawkmon-v2.mjs` → `a-hawkmon/digimon/LAB-HAWKMON/pixellab2/` (52 PNG, `cmp` byte a byte com o pacote = idênticos; md5 do resto de a-hawkmon igual antes/depois = 928eb541…). main.ts: `HAWK_ART` (`?hawk=v1b`), pin pixellab1/2, faixa mostra a versão. tsc 0. Build dist-lab-hawkmon + restart 5197 (200).
- [x] ~21:45 Medições (`medicoes_c14_4b/`): v2 padrão e repetição = mediana 50 ms nas 4 direções, 5 px, 88–92 px/s, 0 pulos; `&hawk=v1b` carrega a ficha v1 (mesmos 50 ms); `&parceiro=agumon`: Agumon 116,6 ms/11 px (igual 14.4-A), Hawkmon v2 ao lado 50 ms; Tamer 91–93 px/s; 0 erros/0 rede nas 4 sessões. Recuo do pé de apoio na arte v2 medido (`pe_apoio_arte.json`, `pe_componentes.json`, `pes_walk_EW_8x.png`).
- [x] ~21:48 Capturas/GIFs com &time=dia (`medicoes_c14_4b/capturas/`: cena larga com Hawkmon v2 + Tamer + Tamer de comparação + Agumon, E/W/N/S); 6 links conferidos (`links_c14_4b.json`): pivô (30,49) e sombra rx19/ry7 iguais v2 × v1b, 0 erros.
- [x] ~21:50 tsc 0; vitest 526/530 (4 antigas de lab-duas-linhas); map:validate --no-write 9/9; Database 8b71f53e igual; 5196 200.
- [x] Commit local 01f82b8 (lab/hawkmon-v1b). Relatório: RELATORIO_C14_4B.md.
- **Concluído. Parado aguardando game-qa / ChatGPT / Vitor.**
