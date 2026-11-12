# Vídeos do fundador (jogo atual), observações do coordenador

- **Fonte [E]:** gravações do fundador, lidas direto de `C:\Users\vitor\Videos\Captures\` (WSL `/mnt/c/...`). Nenhum arquivo foi copiado: só quadros extraídos com PyAV em `founder-videos/`.
  - **v1:** `GS-003 — prova visual ao vivo (mundo) 2026-11-09 18-40-05.mp4`, 190 s, 1920×1032, look padrão, noite.
  - **v2:** `... 19-09-21.mp4`, 51 s, look=v8, noite.
- Quadros a cada 12 s (v1) e a cada 6 s (v2). Quadros parados não mostram a qualidade das animações, só pose e escala. Para avaliar movimento, o game-art precisa ver os vídeos (ou extrair sequências curtas a 10–15 fps com o script `/tmp/xf.py` adaptado).

## Observações [E] (quadros v1_t0038, v1_t0122, v2_t0020)
1. **Os Digimon e o Tamer ficam minúsculos na tela.** Em 1920 px de largura, o Gigimon e o Tamer "Kaio" ocupam ~20–28 px de altura, menos de 3% da tela. Não dá para ler expressão nem animação, e o mundo engole os personagens. No Drakantos o herói ocupa ~1/12 da altura da tela, muito maior.
2. **Escala inconsistente entre entidades:** no v2 aparece o NPC grande antigo (PixelLab, 2× o Tamer). A gravação pode ser anterior ao recarregamento com o commit cb80b7d; conferir. Gabumon e Patamon têm proporções e níveis de detalhe diferentes do Gigimon (fontes de sprite misturadas).
3. **Look padrão de noite (v1):** tudo azul-roxo monocromático, padrão de tufos em grade bem visível no chão (repetição), copas como "nuvens" de blobs iguais e a trilha roxa sem textura. Personagens sem contraste com o fundo.
4. **Look v8 de noite (v2):** os halos estão grandes e fortes demais e espalhados demais. Viram ruído visual (bolhas rosas/ciano por toda parte) e competem com os personagens. O Tamer sob halo fica lavado e meio translúcido. As rachaduras pretas do chão se repetem em padrão.
5. **Combate:** números de dano e "MISS" legíveis, mas o golpe é um marcador pequeno. Não há antecipação/impacto perceptível no quadro.
6. **HUD:** barra inferior grande e densa, com coluna direita de botões e log de combate que cobrem área de jogo. O banner de depuração do Chrome ("OpenClaw começou a depurar") aparece porque a extensão estava ligada; não é do jogo.

## Implicações para o plano
- **Prioridade 1 (barata e de alto impacto):** escala de câmera/sprites. Zoom maior ou sprites maiores para os personagens ocuparem ~8–10% da altura da tela, como no Drakantos.
- **Prioridade 2:** reduzir quantidade e intensidade das luzes (poucas fontes, com propósito) e garantir rim/contraste nos personagens.
- **Prioridade 3:** unificar a fonte e o padrão de sprite dos Digimon do piloto.
