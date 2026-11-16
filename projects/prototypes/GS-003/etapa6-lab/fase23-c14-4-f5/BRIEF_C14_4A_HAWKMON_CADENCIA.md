# Brief C14.4-A — Fechamento técnico da caminhada do Hawkmon (game-dev)

Data: 2026-11-15 · Dono: game-dev · Coordenação: game-studio · Origem: Comando 14.4 do ChatGPT (`COMANDO_14_4_F5_CHATGPT.md`), autorizado pelo Vitor ("vamos fechar esses testes para passar para próxima etapa").
Fan game não oficial, sem licença; nada é publicado.

## Objetivo
Fixar ~50 ms por quadro como padrão da walk do Hawkmon no build isolado (porta 5197) e corrigir o Agumon de comparação que não anda N/S.

## Entradas
- Worktree `workspaces/game-dev/lab-hawkmon` (branch `lab/hawkmon-v1b`, commit 34327c7), dist `dist-lab-hawkmon`.
- `etapa6-lab/fase21-build-hawkmon/RELATORIO_BUILD_HAWKMON.md` e `QA_BUILD_HAWKMON_INDEPENDENTE.md` (§2: 50 ms = 5 px/quadro, faixa 45–55 ms).

## Saída
- Commit local em `lab/hawkmon-v1b`; dist recompilado; serviço `gs003-lab-hawkmon-5197` religado.
- `etapa6-lab/fase23-c14-4-f5/RELATORIO_C14_4A.md` + `PROGRESS.md`.

## Critérios de aceite
1. Sem parâmetro na URL, o Hawkmon anda a 50 ms (±5) por quadro na velocidade normal; `&hawkms=` continua funcionando para comparação.
2. Tempo por espécie: Agumon, Tamer e velocidade global (`WORLD`) inalterados (medir antes/depois).
3. Agumon de comparação (`?comparar=`) anda S/N/E/W; se o defeito for da ferramenta de teste, corrigir só nela.
4. tsc ok; testes no mesmo patamar de antes (não aumentar falhas); 0 erros de console.
5. Links de teste entregues já com `&time=dia`.

## Proibido
Alterar sprites/arte, jogo principal, Database, labs 5191/5196, merge, deploy público, gerar no PixelLab, mudar regras de jogo.

## Validação
game-qa independente (caminhada, transições, profundidade, regressão) → ChatGPT → Vitor.

## Retomada
"Continue do parcial em `etapa6-lab/fase23-c14-4-f5/PROGRESS.md`."

## Nota de coordenação
Em paralelo de decisão (não de execução): C15a (game-art) limpa rotações do Hawkmon no estilo ChatGPT. Se o Vitor adotar esse visual, a walk será refeita sobre a arte nova e a cadência será re-medida com a passada nova; o mecanismo de tempo por espécie deste brief continua valendo.
