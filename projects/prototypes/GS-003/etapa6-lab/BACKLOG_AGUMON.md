# Backlog do Agumon v7: ajustes pendentes (registrado em 2026-11-14, Comando 11 §2)

O Agumon atual é a **referência de comparação** da F5. Não é para ser substituído.

## Versões preservadas
- **F2b, no jogo do lab (pixellab8):** `fase12-comando9/f2/pacote_agumon_f2/`. Backup: `fase13-comando10/backup_f2b/`, com sha256.
- **C10:** `fase13-comando10/pacote_agumon_c10/`. QA 8,0 nos 4 critérios (`QA_C10_INDEPENDENTE.md`).
- **Híbrido F4:** `fase12-comando9/f4/` e `fase13-comando10/hibrido_agumon_S_c10/`, com a saída do ataque pelo q8.

## Pendências
1. **Comando 10b, a 3ª versão combinada:** pose parada do F2b com as correções técnicas do C10. O ChatGPT aprovou. Brief: `BRIEF_COMANDO_10B.md`. **Adiado pelo Comando 11:** o run caiu por limite de uso antes de produzir qualquer coisa; nada foi gerado.
2. **Ataque lateral:** usar o tronco novo e o pé em y=49 (regressão R1 do QA do C10).
3. **Braço:** balanço de 4–5 px, sem o laço de contorno.
4. **Cauda:** atraso discreto na ponta, sem se fundir com a coxa.
5. **Ataque S:** o Pepper Breath sai do peito em vez da boca. Corrigir exige geração.
6. **Saída do ataque S pelo q8:** aprovada provisoriamente pelo ChatGPT. Falta validar no jogo.
