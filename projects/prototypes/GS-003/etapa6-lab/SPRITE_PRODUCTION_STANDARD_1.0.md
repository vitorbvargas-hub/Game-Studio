# Sprite Production Standard 1.0 — Digital Odyssey (PROPOSTA)

**Status:** proposta do game-studio, avaliada junto com o ChatGPT (revisor externo) em 2026-11-14. **Aguarda homologação do fundador.** Não resolve os conflitos abertos da Etapa 6 (escala e paleta); só padroniza o *como produzir*.

## Pipeline padrão (Método A)
1. **Referência oficial de design** da espécie. Fonte preferida: arte oficial com o Digimon de frente (Wikimon/Reference Book). Registre a fonte em `ref/FONTE.txt`. Uso interno, conforme o D12.
2. **Âncora de estilo:** um Digimon já aprovado do jogo, de tamanho parecido (hoje: Gomamon c0 ou Agumon v7 de frente).
3. **`create_image_pro`**, com 2 `reference_images` (design + estilo), sem fundo, com a descrição "facing the viewer straight on".
   - Baby: 32 px (64 candidatos). Rookie: 48 px (25). Champion: 64 px (16).
   - Custa 10 gerações. Os candidatos já trazem poses de emoção de bônus: guarde todos em `cand/`.
   - Champion grande e conhecido: o `create_character_pro_flash` (6 gerações, 8 direções) também funcionou, com só texto mais a âncora.
4. **Rotação:** `create_character` v3 com a referência (o candidato neutro de frente), em 4 direções. Custa 1 geração. Se houver uma vista lateral boa entre os candidatos, passe-a em `direction_images`.
5. **Animações:** `animate_character` v3 custom, 8 quadros, direções S, E e N (1 geração cada). O oeste é `mirror_animation`, de graça.
   - Escreva o movimento na descrição, terminando sempre com "same size in every frame" e com o detalhe que não pode sumir ("tusks stay visible").
   - Andar: walk, hop (baby sem pernas) ou float (baby flutuante).
   - Ataque: o golpe assinatura (Pepper Breath, Mega Flame, garra…).
6. **Emoções:** v3 custom (1 geração por direção). Alternativa barata: `animate_image` sobre um candidato de emoção já aprovado (1 geração).
7. **Polimento obrigatório** (de graça), por script, LibreSprite ou Pixelorama:
   - limpar artefatos;
   - corrigir peças que somem;
   - costas: cauda e cabeça;
   - olhos da frente;
   - selecionar e reordenar os quadros do ataque.
8. **Empacotar:** `rotations/{S,W,E,N}`, `walk/…` e `attack/…`, mais o `pacote.json`.
9. **game-dev integra** 1:1, sem reescalar (D13), alinhando pelo pé de cada quadro.

## O que NÃO usar
- **Template genérico** (walking-8-frames, fireball…): deforma o Digimon.
- **skeleton-v3:** girou o personagem e quebrou a identidade no teste, custando 3 gerações. Descartado.
- **Geração de Digimon pelo ChatGPT:** bloqueada pela diretriz de semelhança. Não contornar.
- **image_to_pixelart sobre arte branca em fundo branco:** resultado tosco.
- **Arte de fã de terceiros** sem autorização escrita do autor.

## Critérios de homologação (por Digimon)
1. **Fidelidade visual ≥ 8/10:** a espécie é reconhecível, com anatomia e paleta consistentes.
2. **Escala:** compatível com o Tamer e com o estágio. Hoje: baby 32, rookie 48 e champion 64 de canvas. Conflito aberto.
3. **4 direções corretas:** sem deformação e sem peça sumindo.
4. **Animações legíveis** (idle, andar, ataque). A altura do corpo fica constante; num pulo varia a posição, não a escala, e o pé volta ao mesmo ponto.
5. **Integração no mapa ok:** sprite, sombra, direção e efeito do ataque, com 0 erros de console.

## Custo de referência
| Item | Gerações |
|---|---|
| Espécie nova (pro + rotate) | 11 |
| Andar (S/E/N) | 3 |
| Ataque (S/E/N) | 3 |
| Emoção (por direção) | 1 |
| Linha de 3 formas, com andar e ataque | ~45–50 |

## Reserva (sem testes agora)
Retro Diffusion pago, Blender 3D→pixel, animação por partes/rig. Esta última só para quadrúpedes grandes, se o v3 falhar.
