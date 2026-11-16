# PROGRESS_QA — QA independente Hawkmon v2 (build 5197)

Tarefa: QA independente do Hawkmon v2 (estilo ChatGPT, pacote_hawkmon_v2) no build isolado 5197, commit `01f82b8`, branch `lab/hawkmon-v1b`.
Saída final: `QA_HAWKMON_V2_INDEPENDENTE.md` + evidências em `qa_v2/`.

## Checklist

- [x] Ler DIGITAL_ODYSSEY_CONTEXT.md
- [x] Ler RELATORIO_C14_4A.md, RELATORIO_C14_4B.md, medicoes_c14_4b/
- [x] Ler RELATORIO_C15A.md, RELATORIO_C15B.md, pacote_hawkmon_v2/
- [x] Ler QA_BUILD_HAWKMON_INDEPENDENTE.md (fase21, régua de 8 critérios)
- [x] Confirmar build: worktree `workspaces/game-dev/lab-hawkmon`, branch `lab/hawkmon-v1b`, commit `01f82b8` [E]
- [x] Serviço 5197 ativo, HTTP 200 [E]
- [x] Database md5 `8b71f53e42eec53bd184a5b6947dd960` confirmado de forma independente (caminho real: `projects/prototypes/GS-003/database/data/*.json`, não dentro do worktree) [E]
- [x] 5196 (lab-f7v2) ativo, worktree limpo [E]; 5191 não está ativo (nem estava antes, não é regressão desta tarefa) [E]
- [x] Ambiente de browser: mcp browser tool sem Chromium completo instalado; usado `chrome-headless-shell-1243` (mesmo binário do game-dev/QA anterior) via os scripts `tools/h143` (só leitura) e `qa_scripts/c143` (meus). Causa raiz de uma falha inicial: variáveis HTTP(S)_PROXY do ambiente da sessão interceptavam o fetch ao DevTools local (127.0.0.1); corrigido com `env -u HTTP_PROXY -u HTTPS_PROXY ... NO_PROXY='*'` nas minhas próprias chamadas node. Registrado como achado de ambiente, não do jogo.
- [x] Smoke test: build carrega, `window.__gs003` presente, 0 erros de console, 0 falhas de rede no load [E]
- [x] Medir cadência v2 (padrão) de forma independente — `walk.mjs`+`analisa.mjs` meus, tag `qa_v2_padrao`: mediana 50ms, 5px/quadro, 88-92px/s, 0 pulos, q5-q6 100% em 50ms (confirma relatório)
- [x] Medir pé de apoio / escorregamento v2 E/W — `pe_v2.mjs` (automático, nearest-neighbor): E recuo méd 1.67px/escorrega 66.7%, W recuo méd 3.92px/escorrega 21.7% com salto +8px em q3→q4 (irregular, bate qualitativamente com o C14.4-B mas magnitude difere por método de rastreio do pé)
- [x] Verificar Agumon de comparação andando N/S — confirmado, 21-27 quadros de walk por direção (Q2 da fase21 CORRIGIDO)
- [x] Capturar evidências visuais em qa_v2/: pes_walk_EW_8x.png, prof_folha.png, full_idle_{S,E,N,W}.png, full_walk_E.png, zoom_idle_*.png, zoom_walk_*.png, 4 GIFs reais de screencast (walk{E,W,N,S}_qa_v2_independente.gif + cena_*), 3 PNGs de tela real
- [x] ACHADO NOVO: cintilação de identidade no idle (óculos/olho visível alterna entre quadros, mais forte em E) + variação de massa perceptível entre quadros em S/N — ver relatório final, P1
- [x] Regressão: Agumon ativo, Tamer, WORLD, console 0 erros em 11 sessões próprias (padrão, 4 modos de URL, rota de profundidade, 4 direções de screencast real)
- [x] Database md5 e isolamento (5196, 5191) confirmados de forma independente
- [x] Escrever QA_HAWKMON_V2_INDEPENDENTE.md com notas por critério (régua fase21, 8 critérios), achados com severidade, recomendação
- [x] Resumo final em pt-BR para o game-studio

## Status final

**CONCLUÍDO.** Relatório final em `QA_HAWKMON_V2_INDEPENDENTE.md` (mesma pasta). 37 arquivos de evidência em `qa_v2/` (~56 MB, GIFs reais de screencast inclusos). Achado principal: cintilação de identidade no idle (óculos/olho visível alterna entre quadros) + salto de massa perceptível em idle S/N — não reportado pelos relatórios de arte (C15a/C15b). Média da régua de 8 critérios: 7,78 (abaixo de 8; GS-010 não atingido). Recomendação: enviar ao ChatGPT/Vitor com a cintilação do idle como pergunta central; não homologado para produção.

## Notas de retomada

Se a sessão cair, retomar lendo este arquivo e os `*.json` já gravados em `qa_v2/` (cada rodada é independente e nomeada).
