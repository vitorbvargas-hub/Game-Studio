# Brief C15b — Hawkmon novo (estilo ChatGPT): walk + idle nas 4 direções (game-art)

Data: 2026-11-15 · Dono: game-art · Coordenação: game-studio.
Autorização do Vitor (2026-11-15 ~21:00): "use o novo para tudo" · "Animar o novo, ficou muito melhor que o anterior … faça o novo dentro do jogo e já ajusta a cadência de 50 ms dele". Entendido como aprovação de gasto além do piso 552: **novo piso 545**.
Fan game não oficial, sem licença; nada publicado.

## Objetivo
Gerar walk (8 quadros) e idle (4–6 quadros) nas 4 direções a partir das rotações C15a, mantendo o visual aprovado pelo Vitor, e entregar um pacote no mesmo formato do v1b para o game-dev trocar no build.

## Entradas
- Rotações: `fase22-hawkmon-estilo-chatgpt/rotacoes/hawkmon_c15a_{S,N,E,W}.png` (60x60, âncora (29,5;49), 18 cores).
- Formato de referência do pacote: `fase20-f8b-hawkmon/etapa2b_walk_idle/pacote_hawkmon_v1b/` (pacote.json, nomes, âncora).
- Cadência alvo: ~50 ms por quadro a ~91 px/s no jogo (≈ 5 px andados por quadro). **Passada desenhada**: o pé de apoio deve recuar ~3–5 px por quadro (passada mais longa que o v1b, que tinha 2 px), para escorregar menos que o Agumon (73%). Ver `fase21-build-hawkmon/QA_BUILD_HAWKMON_INDEPENDENTE.md` §2.
- Referência de pose da passada lateral: `referencias-externas/hawkmon_polloai_2026-11-15.jpg` (só pose).

## Método sugerido (o agente decide os detalhes)
Criar personagem no PixelLab com `create_character(mode="v3", reference_image=S, direction_images={N,E,W})` para usar as rotações como desenhadas; animar walk e idle (v3 custom ou template, o que preservar melhor a anatomia); limpar com `pixelart_workbench`/scripts (âncora fixa, sem crop, paleta da C15a, 0 semitransparência). Testar S e E primeiro; só gerar N e W se S/E estiverem bons.

## Saída
- `fase22-hawkmon-estilo-chatgpt/pacote_hawkmon_v2/` no formato do v1b (+ `pacote.json`).
- Folha de contato e GIFs 1x/4x por direção; prancha com Tamer/Agumon.
- `RELATORIO_C15B.md`, `PROGRESS.md` atualizado a cada passo.

## Critérios de aceite
- Identidade igual à C15a (faixa com fivela, topete separado, leque, 18–24 cores compartilhadas).
- Âncora estável: pé de apoio na linha 49, 0 px de tremida vertical do pé de apoio.
- Massa constante entre quadros (sem encolher/crescer), E e W desenhados (não espelhar).
- 0 semitransparência; canvas 60x60.
- Medir e registrar o recuo do pé de apoio por quadro (px).

## Custo
Teto **12 gerações**; piso de saldo **545** (saldo inicial 559,15). Se atingir o teto, parar e reportar. Nunca comprar créditos.

## Proibido
Mexer no jogo, nos labs, na Database, no v1b; publicar; usar outros personagens como base.

## Validação
game-dev integra no build 5197 (C14.4-B) → game-qa → ChatGPT → Vitor.

## Retomada
"Continue do parcial em `fase22-hawkmon-estilo-chatgpt/PROGRESS.md`; confira no PixelLab (list_characters/list_jobs) o que já foi gerado antes de gerar de novo."
