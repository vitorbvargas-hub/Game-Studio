# Método ChatGPT → PixelLab (Sprite Production Standard 1.1, proposta)

Digital Odyssey · rascunho do game-studio · 2026-11-15 · **não homologado** (falta parecer do ChatGPT e homologação do Vitor).
Origem: Hawkmon v2 (C15a → C15b → C14.4-B → QA → C15c). Decisão do Vitor (15/11): "use o novo para tudo… fazer esse sprite sheet no chat antes da gente criar vai ajudar muito".
Fan game não oficial, sem licença, sem monetização. Nada é publicado.

## Por que funciona
- O ChatGPT acerta o **visual** (volume, penas, expressão), mas não entrega pixel art técnica nem animação consistente.
- O PixelLab entrega **formato de jogo e animação**, mas o visual dele sozinho ficou mais pobre (Hawkmon v1b).
- Juntos: o ChatGPT desenha as poses paradas; nós limpamos; o PixelLab anima **a partir das poses**, sem redesenhar.

## Etapas

| # | Etapa | Quem | Ferramenta | Custo medido (Hawkmon) |
|---|---|---|---|---|
| 0 | Referência oficial da espécie (Reference Gate) | game-research | Database/KB | 0 |
| 1 | Folha de estilo livre (opcional, para achar o visual) | Vitor | ChatGPT | 0 |
| 2 | **4 poses paradas** S/N/W/E, fundo magenta #FF00FF, blocos 8x8, ~40 px de altura, ≤24 cores (prompt abaixo) | Vitor | ChatGPT | 0 |
| 3 | Limpeza: recorte, `unzoom_image`, flood fill do magenta, redução para 60x60 com âncora (29,5;49), `correct_pixelart` **antes** de `reduce_colors` | game-art | PixelLab + scripts | 0,8 ger |
| 4 | Personagem v3 importando as 4 rotações como desenhadas (`create_character` v3 com `reference_image` + `direction_images`) | game-art | PixelLab | 0,25 ger |
| 5 | Walk 8q e idle 4q por direção (v3 custom; S e E primeiro); limpeza com `reduce_colors` usando a rotação como paleta; correção de âncora | game-art | PixelLab + scripts | ~13,5 ger |
| 6 | Correções manuais pós-QA (rosto consistente, respiração suave, passada) | game-art | workbench/scripts | 0 |
| 7 | Integração no build isolado, tempo por espécie (~50 ms), medição | game-dev | código | 0 |
| 8 | QA independente → ChatGPT → Vitor | game-qa | — | 0 |

**Total do Hawkmon:** 14,55 gerações (sem contar correções gratuitas).

## Prompt da etapa 2 (ChatGPT)
```
Use the attached <species> sheet ONLY as style reference (feather detail, shading, colors). Do not copy its layout.
Create ONE image, 1536x1024, landscape.
Content: <species> from Digimon, faithful to the official design. 4 standing poses side by side in a single row, same size, same ground line:
1 = front (facing the viewer), 2 = back, 3 = facing left, 4 = facing right.
Left and right drawn separately, not mirrored. Neutral standing pose, both feet on the ground.
Camera: top-down RPG view, 3/4 low top-down, like classic GBA monster RPGs.
Pixel art rules: strict grid, every art pixel an exact 8x8 block; character about 40 art-pixels tall; NO anti-aliasing, blur, gradients, glow, halo or painted shadow; max 24 flat colors; dark 1-pixel outline; light from the top-left, 2-3 tones per color.
Background: one flat solid #FF00FF everywhere; no checkerboard, ground, text, labels, grid lines or watermark.
```

## Lições do Hawkmon (viram regra no prompt/brief)
1. Pedir no prompt detalhes da espécie que o modelo erra (ex.: "cloth headband, no goggles, no scars") e conferir contra a referência oficial antes da etapa 3.
2. `correct_pixelart` antes de `reduce_colors` (a ordem inversa reintroduz milhares de cores).
3. Idle por template quebra âncora e escala; usar v3 custom.
4. Prompt de "passada exagerada" pode colapsar a vista N; usar prompt neutro em N.
5. QA precisa medir **presença do olho/faixa por quadro** e **bbox por quadro do idle** (a cintilação passou despercebida na arte).
6. A passada desenhada deve casar com o tempo por espécie (alvo: recuo do pé ≈ passo em px).

## Pendências
- Parecer do ChatGPT e homologação do Vitor.
- Comparação com o Retro Diffusion (Parte B do Comando 14.4).
- Conflitos abertos da Etapa 6 seguem abertos (escala Tamer/Digimon, paleta).
