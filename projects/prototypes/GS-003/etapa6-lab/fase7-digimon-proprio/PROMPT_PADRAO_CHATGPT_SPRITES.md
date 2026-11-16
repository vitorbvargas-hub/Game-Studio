# Prompt padrão para o ChatGPT: spritesheets para o Digital Odyssey

Uso: cole **um prompt por vez** e gere **uma imagem por animação**. Depois:
1. passe a imagem no Pixel Art Fixer, motor **Neural**;
2. mande o resultado ao game-studio, que fatia e coloca no Link A.

---

## PROMPT 1: Agumon, caminhada (repetir trocando a animação)

```
Crie UMA spritesheet de pixel art para jogo, estilo GBA (Pokémon/Digimon da era GBA), do Digimon AGUMON, fiel ao design oficial.

REGRAS TÉCNICAS (obrigatórias):
- Fundo LISO de uma única cor: magenta puro #FF00FF. Sem sombra no fundo, sem degradê, sem textura.
- SEM texto, SEM títulos, SEM legendas, SEM bordas, SEM painéis, SEM moldura, SEM prévia, SEM cenário.
- Grade exata: 4 linhas × 8 colunas. Cada célula é um quadrado do mesmo tamanho, com o personagem centralizado e os PÉS sempre na mesma altura (mesma linha de chão em todas as células).
- O personagem tem EXATAMENTE o mesmo tamanho em todas as 32 células. Não mude a escala entre linhas.
- Pixel art de verdade: pixels grandes e quadrados, todos do mesmo tamanho, cores chapadas, contorno escuro de 1 pixel, sem antialiasing, sem desfoque, sem brilho suave. Paleta pequena (até 16 cores).
- Altura do personagem: cerca de 34 pixels de arte (os "pixels grandes"), ocupando ~70% da altura da célula.

ORDEM DAS LINHAS (respeite exatamente a direção do olhar):
- Linha 1: de FRENTE (olhando para quem vê).
- Linha 2: de perfil OLHANDO PARA A ESQUERDA da imagem.
- Linha 3: de perfil OLHANDO PARA A DIREITA da imagem.
- Linha 4: de COSTAS (vemos a nuca, as costas e a CAUDA no centro embaixo; NÃO desenhe uma bola sem forma).

ANIMAÇÃO: caminhada em 8 quadros por linha, com as pernas alternando de forma bem visível (passo esquerdo, passo direito), braços balançando e um leve sobe-desce do corpo.

DESIGN DO AGUMON: dinossauro bípede amarelo-alaranjado, cabeça grande e arredondada com focinho, olhos verdes grandes, três garras brancas em cada mão e pé, cauda curta e grossa, barriga da mesma cor do corpo, sem roupa, sem chifres, sem listras.
```

**Variações:** troque o parágrafo "ANIMAÇÃO" por um destes:
- **Parado (idle):** "respiração parada em 4 quadros (use 4 colunas): corpo sobe e desce 1 pixel, cauda balança, uma piscada".
- **Ataque Pepper Breath:** "ataque em 8 quadros: prepara, inclina para trás, abre a boca e solta uma bola de fogo laranja; a bola fica DENTRO da célula".
- **Emoções (uma linha cada, só de frente):** "Linha 1 feliz (pulando), Linha 2 triste (cabeça baixa), Linha 3 bravo (rosnando), Linha 4 dano (recuo com olhos fechados)".

---

## PROMPT 2: Tamer original (não pode lembrar Tai, Takato nem Ash)

```
Crie UMA spritesheet de pixel art estilo GBA de um TAMER ORIGINAL (personagem humano criado por mim, não de nenhum anime), um adolescente aventureiro.

DESIGN (obrigatório, não use óculos de proteção, não use boné vermelho, não use jaqueta vermelha nem combinação vermelho+azul):
- cabelo verde-azulado, curto e despenteado, visível (sem chapéu);
- colete verde-oliva sobre camiseta creme, calça marrom, botas marrons;
- pulseira digital com uma luz ciano no pulso esquerdo;
- bolsa pequena de lado.

[cole aqui as mesmas REGRAS TÉCNICAS, ORDEM DAS LINHAS e ANIMAÇÃO do Prompt 1, trocando "o personagem tem ~34 pixels" por "~41 pixels"]
```

---

## Checklist antes de mandar ao Fixer
- [ ] Fundo magenta liso, sem texto nem painéis.
- [ ] 4 linhas na ordem certa: frente, olhando para a esquerda, olhando para a direita, costas.
- [ ] O mesmo tamanho em todas as células, com os pés alinhados.
- [ ] Nas costas aparece a cauda (Agumon) ou o cabelo e a bolsa (Tamer).
- [ ] As pernas realmente alternam na caminhada.

Se algum item falhar, peça ao ChatGPT: "refaça mantendo tudo, mas corrija: <item>".
