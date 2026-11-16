# Brief C14.4-B — Hawkmon v2 (estilo ChatGPT) no build isolado 5197 (game-dev)

Data: 2026-11-15 · Dono: game-dev · Autorização: Vitor ("use o novo para tudo… faça o novo dentro do jogo e já ajusta a cadência de 50 ms dele").

## Objetivo
Trocar o Hawkmon v1b pelo Hawkmon v2 no build isolado (worktree `workspaces/game-dev/lab-hawkmon`, branch `lab/hawkmon-v1b`, porta 5197) e ajustar a cadência para ~50 ms por quadro com a arte nova.

## Entradas
- Pacote: `etapa6-lab/fase22-hawkmon-estilo-chatgpt/pacote_hawkmon_v2/` (pacote.json; walk 8q e idle 4q em S/E/N/W; 60x60; âncora (29,5;49)). Relatórios C15a/C15b na mesma pasta.
- Build atual: commit 3dd8837 (`HAWK_WALK_PX_DEFAULT = 5`), `RELATORIO_C14_4A.md`.

## Saída
Commit local; dist recompilado; serviço gs003-lab-hawkmon-5197 religado; `RELATORIO_C14_4B.md` + `PROGRESS.md` nesta pasta.

## Critérios
1. Padrão sem parâmetro = Hawkmon v2. Manter o v1b acessível por parâmetro (ex.: `&hawk=v1b`) para comparação.
2. Cadência do v2: mediana 50 ms (±5) por quadro na velocidade normal; medir o recuo real do pé de apoio da arte v2 e informar o escorregamento (% da velocidade). Se a passada da arte pedir outro passo em px, reportar a recomendação, mas manter 50 ms.
3. Âncora fixa sem crop, sombra de contato, profundidade iguais ao v1b.
4. Agumon, Tamer e WORLD inalterados; tsc 0; testes sem novas falhas; 0 erros de console.
5. Links com `&time=dia`; capturas/GIF do v2 andando no mapa ao lado do Agumon e do Tamer.

## Proibido
Jogo principal, Database, 5196, arte (não editar pixels), PixelLab, merge, deploy, push.

## Validação
game-qa → ChatGPT → Vitor.

## Retomada
"Continue do parcial em `etapa6-lab/fase23-c14-4-f5/PROGRESS.md`."
