# PROGRESS · C14 F8B Hawkmon · Etapa 1 (pose base S)

- 2026-11-15 02:15 · Brief, ficha 03, recomendação 09 e proposta 05 lidos. Saldo inicial PixelLab: **573,95**. Piso desta etapa: 562. Teto: 12 gerações.
- Plano: 1 chamada `create_image_pro` 64×64 (10 gerações, 16 candidatos) → saldo esperado 563,95. Não há margem para 2ª chamada paga.
- Próximo: reference report, recortar a referência oficial, upload, gerar.
- 02:20 · Referências recortadas e enviadas por `get_upload_url` + `curl -F` (funcionou): ref1 batalha DS Dawn/Dusk 78×80, ref2 mini DS 28×37, ref3 Agumon F7v2 S 60×60. Cópias em `refs_enviadas/`.
- 02:21 · **Geração disparada:** `create_image_pro` 64×64, 16 candidatos, paleta P1 (24 cores) travada, job `71cced11-2425-4080-a99f-5abe8893173f`, custo no recibo: **10 gerações** (cobradas ao concluir; saldo ainda 573,95 logo após o envio).
- Próximo: esperar o job, baixar os 16, montar folha 1×/4×, escolher top 3. **Não disparar outra geração paga** (saldo esperado 563,95; piso 562).
- 02:27 · Job concluído (141 s). **Saldo: 563,95** (−10). 16 candidatos baixados em `candidatos/cand_00..15.png`. Nenhuma outra geração paga será feita nesta etapa. Próximo: folhas, medidas, top 3.
- 02:35 · Top 3 escolhido: cand_00, cand_08, cand_09. Todos os candidatos saíram com ~61 px (o modelo ignorou "38 px"). Polimento = redução manual pixel a pixel do cand_00 para 22×38 em P1, script `scripts/base.py` (grade de texto). Em andamento.
- 02:50 · Base polida pronta em `base_polida/` (corpo, topete, composto; 1× e 4×). 22×38, 19 cores, 100% P1.
- 02:55 · Top 3, comparações e `RELATORIO_ETAPA1.md` escritos. **Etapa 1 concluída. Saldo final 563,95; 10 gerações gastas.** Parado: aguardando game-qa → ChatGPT → Vitor. Nada de rotação ou animação foi feito.
- Retomada, se precisar: editar `scripts/base.py` e rodar `python3 base.py && python3 entrega.py` dentro de `scripts/`.
- 2026-11-15 02:25 (relógio do sistema; os horários acima vieram de outra sessão e não foram conferidos) · **E1b (correções do QA independente) iniciada.** 0 gerações, sem PixelLab. Fonte nova: `scripts/base_v2.py` (não altera `base.py` nem `base_polida/`).
- 02:31 · **E1b concluída.** `base_polida_v2/` com corpo, topete, composto (1× e 4×), comparações v1 × v2 × cand_00 × Agumon, silhuetas, escala, `metricas_v2.json`, `sha256_v2.txt`. v2: 38 × 20, cabeça 14, 4 linhas de perna, área 484 (0,83 do Agumon), 24 cores todas P1. Relatório: seção 10 de `RELATORIO_ETAPA1.md`. Saldo PixelLab não consultado nem alterado (nenhuma chamada). Parado: aguardando re-QA → ChatGPT → Vitor.
- Retomada da v2: editar `MEIO` em `scripts/base_v2.py` e rodar `python3 base_v2.py && python3 entrega_v2.py` em `scripts/`, depois refazer `base_polida_v2/sha256_v2.txt`.
