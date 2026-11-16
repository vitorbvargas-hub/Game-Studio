# Brief C15a — Hawkmon "estilo ChatGPT": limpeza das 4 rotações (custo ~0)

Data: 2026-11-15 · Dono: game-art · Coordenação: game-studio · Autorização: Vitor ("vamos tratar"), 2026-11-15.
Fan game não oficial, sem licença, sem monetização. Nada é publicado.

## Objetivo
Transformar as 4 poses paradas geradas pelo Vitor no ChatGPT (fundo magenta) em 4 rotações de pixel art real, prontas para servir de referência a uma futura animação no PixelLab, e compará-las com o Hawkmon v1b.

## Entradas
- Fonte: `etapa6-lab/referencias-externas/hawkmon_chatgpt_rotacoes_magenta_2026-11-15.png` (1536x1024; ordem: frente S, costas N, olhando à esquerda W, olhando à direita E).
- Medição do game-studio [E]: 78.532 cores, magenta com ruído (só 8 px exatos #FF00FF; ~1,26 M "quase magenta"), grade aproximada de ~8 px mas irregular.
- Estilo/escala de referência: Hawkmon v1b `etapa6-lab/fase20-f8b-hawkmon/etapa2b_walk_idle/pacote_hawkmon_v1b/` (canvas 60x60, âncora (29,5;49), escala ~38 px aprovada pelo ChatGPT).
- Folha de estilo que o Vitor gostou: `referencias-externas/hawkmon_chatgpt_vitor_2026-11-15.png`.

## Saída (exata)
Pasta `etapa6-lab/fase22-hawkmon-estilo-chatgpt/`:
1. `rotacoes/hawkmon_c15a_{S,N,E,W}.png` — RGBA, canvas 60x60, âncora (29,5;49), pé na linha 49, fundo 100% transparente, sem semitransparência.
2. `prancha_comparacao.png` — v1b × C15a nas 4 direções, 1x e 4x, sobre tile de 32 px, com Tamer/Agumon para escala.
3. `RELATORIO_C15A.md` — método, medições (cores finais, altura em px, pixels semitransparentes = 0), riscos, e nota indicativa nos critérios de reconhecimento/estilo/legibilidade (indicativa; a nota oficial é do game-qa).
4. `PROGRESS.md` atualizado a cada passo (para retomada).

## Critérios de aceite
- 4 direções, E e W como vieram (não espelhar).
- Altura do personagem 36–40 px; mesma massa entre direções (régua: Agumon S).
- Paleta ≤ 24 cores, compartilhada entre as 4 direções; contorno escuro de 1 px.
- 0 pixels semitransparentes; 0 resíduo magenta/halo nas bordas.
- Preservar o que o Vitor gostou: penas em camadas, leque das costas, volume. Preservar o aprovado: bico curvo, faixa com fivela, topete separado.

## Custo
Teto: 1 geração (ex.: `unzoom_image` 0,1, `reduce_colors` 0,1, `correct_pixelart` 0,1). Preferir ferramentas gratuitas (`pixelart_workbench`, scripts locais). **Proibido**: animar, criar personagem, qualquer geração acima do teto. Não comprar créditos.

## Proibido
- Mexer no jogo, nos labs (5191/5196/5197), na Database, no pacote v1b.
- Gerar walk/idle (é o C15b, depende de aprovação do Vitor e do custo).
- Publicar ou enviar qualquer coisa para fora.

## Validação
game-qa depois (independente) → ChatGPT → Vitor.

## Retomada
Se cair: "continue do parcial em `etapa6-lab/fase22-hawkmon-estilo-chatgpt/PROGRESS.md`; confira no PixelLab (list_jobs/list_images) o que já foi gerado antes de gerar de novo".
