# PROGRESS · C14 F8B Hawkmon · Etapa 2a (ajustes gratuitos + rotações S/N/E/W)

- 2026-11-15 02:35 · Brief e Re-QA v2 lidos. Saldo inicial PixelLab: **563,95**. Piso: 552. Teto: 6 gerações. Preço conferido em `search_help(create_character)`: v3 com referência = ceil(w·h·8/65536), mínimo 1 → canvas 48×48 = **1 geração**.
- Plano: (1) base v3 à mão em `scripts/base_v3.py` (tufos nas linhas 11–13, cantos arredondados, pontas das asas −1 px); (2) conferir silhueta com `reqa_v2.py`; (3) 1 chamada `create_character` v3 + referência, `n_directions=4`; (4) polir à mão em P1.
- 02:40 · **Base v3 pronta** em `base_v3/` (0 gerações): 38×20, área 492 = 0,845 do Agumon, 24 cores P1, tufos nas linhas 11–13, vão perna/asa de 1 px na linha 31 e livre a partir da 32. Conferida com `reqa_v2.py` (saída em `base_v3/reqa_v2_saida_v3.txt`). Referência 48×48 (offset x=13, y=5) enviada por upload. Próximo: `create_character` v3, 4 direções, custo esperado 1.
- 02:42 · **Geração 1 disparada:** `create_character` v3 + referência, 4 direções, 48×48, low top-down, character id `cdca6904-006a-4c86-9530-1044e16a31e9`, recibo: **1 geração**. Saldo antes: 563,95. Próximo: esperar, `get_balance`, baixar em `rotacoes_cruas/`. Não disparar outra sem olhar o resultado.
- 02:47 · Geração 1 concluída. **Saldo: 562,95** (−1). Cruas baixadas em `rotacoes_cruas/{south,east,north,west}.png` (48×48). Próximo: avaliar, polir à mão em P1.
- 02:47 · Geração 1 concluída. **Saldo: 562,95** (−1). O link do Backblaze deu 403 pelo proxy; baixei pelo ZIP de `api.pixellab.ai` e extraí para `rotacoes_cruas/` (ZIP guardado em `_zip/`).
- 02:55 · Polimento à mão em `scripts/polir.py`: S = base v3 (0 px mudados), N e E redesenhados em P1, W = espelho de E. Saída em `rotacoes_polidas/` (corpo, topete, composto, 1× e 4×, grades, `metricas_rotacoes.json`).
- 03:00 · Pranchas em `prancha/`, `RELATORIO_ETAPA2A.md` e `sha256.txt` escritos. **Etapa 2a concluída. 1 geração gasta; saldo final 562,95.** Pendência conhecida: massa de E/W em 0,78 do Agumon S (alvo 0,80–0,90). **Parado:** nada de walk nem idle; aguardando game-qa → ChatGPT → Vitor.
- Retomada: editar as grades em `scripts/base_v3.py` ou `scripts/polir.py` e rodar `python3 base_v3.py && python3 polir.py && python3 prancha.py` em `scripts/`; depois refazer o `sha256.txt`.

## E2a-b · correções gratuitas do QA independente (2026-11-15)
- Lido `QA_ETAPA2A_INDEPENDENTE.md` (conjunto 7,75). Plano: grades novas em `scripts/polir_v2.py`, saída em `rotacoes_polidas_v2/` e `prancha_v2/`, v1 intocada. 0 gerações, sem PixelLab.
- Passada 1: E/W com asa recolhida, cauda vermelha, pé de trás e bico +1 px → 466 px = 0,801 do Agumon S. N com leque largo cobrindo as pernas: silhueta virou um bloco. Refeito.
- Passada 2: N com leque estreito de 3 penas iguais: lia como uma coluna no meio. Marcas de penas nas costas liam como rosto: tiradas. Refeito.
- Passada 3 (final): N com pena central de 4 px e laterais abertas para fora, barra das costas em zigue-zague, nuca sombreada → 500 px = 0,859. S intocada, W = espelho de E, topete igual à v1, tudo em P1, 0 semitransparentes.
- Relatório: seção "Correções E2a-b" em `RELATORIO_ETAPA2A.md`. Hashes: `sha256_e2ab.txt`.
- **E2a-b concluída. Parado:** nada de walk nem idle. Próximo passo é do `game-qa` (conferência rápida da silhueta 4× e da prancha 1×), depois fundador.
- Retomada: editar as listas `setrows(...)` em `scripts/polir_v2.py`, rodar `python3 polir_v2.py` em `scripts/` e refazer o `sha256_e2ab.txt`.
