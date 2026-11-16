# Brief C15c — Correções gratuitas do Hawkmon v2 após QA (game-art)

Data: 2026-11-15 · Dono: game-art · Origem: `fase23-c14-4-f5/QA_HAWKMON_V2_INDEPENDENTE.md` (média 7,78; P1 cintilação no idle).
Decisão do game-studio (reversível, custo 0): corrigir antes do ChatGPT.

## Correções
1. **P1, cintilação do rosto no idle:** em cada direção, o rosto/faixa deve ficar **igual à rotação C15a daquela direção** em todos os quadros do idle (mesmo estado olho/faixa). Idle E q1–q2 e idle S q0–q1 são os casos medidos.
2. **P1, salto de massa no idle:** suavizar a respiração em idle S (q1→q2: +4 w, +3 h) e idle N (q2: largura cai 5 px). Variação máxima entre quadros vizinhos: 1 px na altura e 2 px na largura; pé em y=49.
3. **P2, walk W q3→q5:** remover o salto de +8 px do pé de apoio (recuo monotônico entre 2 e 5 px por quadro).
4. Conferir também a walk (8 quadros, 4 direções): o rosto não pode alternar olho visível/visor entre quadros; se alternar, uniformizar pela rotação.

## Regras
- **0 gerações PixelLab** (saldo 545,40, no piso). Só edição local: `pixelart_workbench` (grátis) e scripts. Se for impossível sem gerar, pare e reporte.
- Paleta das 18 cores da C15a; 0 semitransparência; canvas 60x60; âncora (29,5;49).
- Saída: atualizar `pacote_hawkmon_v2/` **mantendo cópia do estado anterior** em `pacote_hawkmon_v2_pre_c15c/`; regenerar GIFs, folha de contato e `pacote.json`; `RELATORIO_C15C.md` com medições antes/depois (bbox por quadro do idle, presença de olho por quadro, recuo do pé W).
- Não tocar jogo/labs/Database/v1b; não publicar. `PROGRESS.md` atualizado.

## Depois
game-dev reimporta no 5197 → re-QA rápido → ChatGPT → Vitor.
