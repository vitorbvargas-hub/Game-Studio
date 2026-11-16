# Standard Visual 2.0 — CANDIDATO (não aprovado)

Digital Odyssey (GS-003) · game-studio · 2026-11-16 · Fase 11 do Comando F9.
Base: **2 espécies** (Hawkmon v2, bípede; Labramon F9, quadrúpede). Não é padrão definitivo: precisa de parecer do ChatGPT, homologação do Vitor e uma 3ª espécie de anatomia diferente.
Fan game não oficial, sem licença, sem monetização. Legenda: **[V] validado** em 2 espécies com medição · **[P] proposto** (1 espécie ou sem teste em jogo) · **[L] limitação conhecida** · **[H] hipótese não testada**.

## 1. Pipeline
| # | Etapa | Dono | Ferramenta | Custo medido | Status |
|---|---|---|---|---|---|
| 0 | Reference Gate: ≥5 refs oficiais, 10 invariantes, paleta do sprite oficial, divergências | game-research (Opus) | digimon.net, Reference Book, Wikimon (1 req/65 s) | 0 ger | [V] |
| 1 | Direção de arte: escala vs Tamer, canvas, pivô, colisão | game-art (Opus) | — | 0 | [V] |
| 2 | **Arte-mestra no ChatGPT**: 4 poses paradas EM PÉ, fundo #FF00FF, grade 8×8, ≤24 cores, imagem oficial anexada | Vitor | ChatGPT | 0 | [V] |
| 3 | Limpeza: recorte → `unzoom_image` → magenta → redução box-filter + contorno 1 px → `correct_pixelart` **antes** de `reduce_colors` → âncora (29,5;49) | game-art | PixelLab + scripts | 0,6–0,8 | [V] |
| 4 | Personagem PixelLab importando as 4 rotações como desenhadas | game-art | `create_character` v3 import | 0,25 | [V] |
| 5 | Animação: **pixminimax com `palette`** (19 cores da rotação), S e E primeiro; **trava de rosto local** (cola cabeça/rosto da rotação no deslocamento medido) | game-art (Fable) | PixelLab + scripts | 1 ger/clipe ≤8 q | [V] Labramon; Hawkmon usou v3 [L] |
| 6 | Pós-processo: pé y=49, pontos soltos, orelha oposta, realinhar (o PixelLab recentra o canvas com `end_frame`) | game-art | scripts | 0 | [V] |
| 7 | Laboratório / build isolado com tempo por espécie | game-dev (Sonnet) | HTML ou build 5197 | 0 | [V] |
| 8 | QA independente → correções → QA de regressão → ChatGPT → Vitor | game-qa (Opus) | scripts de medição | 0 | [V] |

## 2. Prompt Mestre 2.0 (etapa 2)
```
Use the attached official <SPECIES> image as the source of truth for anatomy, colors and markings. Do not invent accessories or features.
<ANATOMY: 4–6 lines from the Reference Gate invariants, in English, including "no collar/goggles/scars" traps found in tests>
Create ONE image, 1536x1024, landscape: a GBA Plus pixel art reference sheet of <SPECIES> from Digimon.
4 STANDING poses side by side, same scale, same ground line, generous space between them:
1 = FRONT, 2 = BACK, 3 = facing LEFT, 4 = facing RIGHT. Left and right drawn independently, never mirrored.
<BIPED: standing upright, both feet on the ground> | <QUADRUPED: standing on all four legs (NOT sitting), four paws visible, one tail>
Camera: top-down RPG view, low 3/4 perspective, like classic GBA monster RPGs. Not a side-scroller view.
Pixel art: strict grid, every art pixel an exact 8x8 block; about 36–40 art-pixels tall; NO anti-aliasing, blur, gradients, glow, halo or painted shadow; no extra limbs or duplicated tails; max 24 flat colors; dark clean 1-pixel outline; light from the top-left; 2–3 tones per material.
Background: one flat solid #FF00FF everywhere. No scenery, text, labels, grid lines, checkerboard or watermark.
```
Lição: o ChatGPT tende a desenhar quadrúpedes **sentados** (arte oficial costuma ser sentada); escrever "standing … NOT sitting" [V Labramon].

## 3. Regras técnicas
| Regra | Valor | Status |
|---|---|---|
| Canvas | 60×60 (Rookie) | [V] |
| Âncora / chão | (29,5; 49); pé de apoio em y=49 em todos os quadros, exceto pulos | [V] |
| Altura | Hawkmon 38 px, Labramon 36 px; Tamer 34–36 | [P] — **G-2 (escala Tamer/Digimon) segue aberto** |
| Paleta | ≤24 cores por espécie, compartilhada entre direções; cor padrão = Reference Book | [V] técnica / [P] cor — **G-1 (paleta) aberto** |
| Transparência | 0 pixels semitransparentes; sem sombra pintada (o motor desenha) | [V] |
| Direções | S/N/E/W desenhadas; E e W independentes | [V] |
| Idle | 4 q; rosto 0 px de mudança; altura ±1 px; bbox sem salto | [V] (era o defeito do Hawkmon) |
| Walk | 8 q; recuo do pé medido; **casar recuo × tempo por espécie × velocidade do Tamer antes de produzir** | [P] — falhou nas 2 espécies (Hawkmon escorrega 48–60%; Labramon passada 2,3–2,8 px/q) |
| Quadrúpedes | alternância diagonal das patas; patas do fundo 1 tom mais escuro; cauda com movimento secundário | [P] 1 espécie |
| Emoções / descanso / interações / combate | 1 direção (E) por estado na validação; entrada/loop/saída + duração; pose deitada desenhada, nunca achatada; incapacitação com recuperação, sem morte | [P] 1 espécie |
| Transições | medir "costura" (px que mudam) idle→entrada; meta ≤ ~450 px; inserir intermediário local quando passar | [P] (geração pixminimax não resolveu) |
| Arquivos | `<pasta>/<estado>/<dir>/frame_NNN.png`, `manifesto.json` com durações e SHA-256, spritesheet, GIF 1x/4x, folha de contato | [V] |

## 4. QA obrigatório (checklist do produtor + QA independente)
1. 10 invariantes da espécie em todas as direções e quadros.
2. Presença de olho/marcas **por quadro** (contagem por cor) — pegou a cintilação do Hawkmon.
3. bbox por quadro no idle (salto de massa).
4. Recuo do pé de apoio × velocidade do Tamer.
5. Costura de entrada a partir do idle.
6. Técnica: canvas, semitransparência, paleta, pé, manifesto × disco × SHA.
7. Lab/build: 0 erros, assets carregam, estados ausentes aparecem como indisponíveis.
Meta: média ≥ 8, nenhum P0. Nota não substitui a homologação humana.

## 5. Custos medidos
| Item | Hawkmon v2 | Labramon F9 |
|---|---|---|
| Limpeza + import | 1,05 | 0,85 |
| Movimento 4 direções (walk+idle) | 13,5 | 15,05 (6 em testes reprovados) |
| Emoções, descanso, interações, combate (E) | — | 16 |
| Correções | 0 | 2 (não aproveitadas) |
| **Total** | **14,55** | **33,65** |
Estimativa [H] para uma espécie nova com o método já calibrado: ~9 ger (movimento) + ~16 por direção de estados especiais.

## 6. Limitações conhecidas [L]
- A passada nunca casou com a velocidade do Tamer (P1 em aberto nas duas espécies): decisão de design (Digimon mais lento, trote, ou velocidade da parceira).
- O modelo redesenha a cabeça nos picos de ação; a trava resolve o topo, não a expressão.
- O ChatGPT erra traços finos da espécie (Hawkmon: faixa vira óculos); exige conferência contra o Reference Gate antes da etapa 3.
- Pós-processo manual e específico por espécie; scripts reaproveitáveis, mas não um pipeline de um botão.
- Navegador do ChatGPT instável para automação: a arte-mestra depende do Vitor.
- Nada foi testado no jogo principal; só build isolado (Hawkmon) e lab HTML (Labramon).

## 7. Hipóteses não testadas [H]
- Champions/Megas maiores que 60×60, voadores, serpentes, espécies sem pernas.
- 8 direções.
- Estados especiais em S/N/W com o mesmo custo de E.
- Escala definitiva Tamer/Digimon.

## 8. Critérios para homologar o Standard 2.0
1. Parecer do ChatGPT e homologação do Vitor.
2. Decisões G-1 (paleta) e G-2 (escala) fechadas.
3. Regra de locomoção (A1) decidida e validada em jogo com uma espécie.
4. Uma 3ª espécie de anatomia diferente produzida só com este documento, com QA ≥ 8.
