# ADR-008 — GS-003: visão do produto (reafirmada pelo fundador)

- **Data:** 2026-11-08
- **Decisor:** Vitor Vargas (fundador)
- **Contexto:** o fundador testou o protótipo, que tinha grid vazio, blocos coloridos e só tela de batalha, e o reprovou como "totalmente fora do que falamos". O estúdio construiu motor e mecânicas antes de validar o visual com ele.

## Visão (fonte da verdade)

1. **"Igual ao IdleDex, mas com Digimon."** Mapa top-down, o Tamer e o time andando, e o AUTO upa e captura sozinho, **inclusive com o navegador fechado**. No IdleDex isso acontece no servidor.
2. **Visual no formato PMD Collab:** sprites top-down com 8 direções e várias animações (AnimData.xml). Se não houver Digimon nesse formato, o estúdio desenha os sprites ele mesmo. A referência de formato está em `projects/prototypes/GS-003/art/reference/pmd-format-founder/` (só formato, não pode ser usada no jogo).
3. **A Arena é um evento dentro do jogo**, com dois modos: a Arena Clássica e a Arena de Batalha em tempo real, no estilo Poké Arena 2D / Battlegrounds.
4. **Ordem:** Digimon primeiro, Pokémon depois (ADR-006).

## Regra de processo (lição aprendida)

- **O visual é aprovado pelo fundador antes de qualquer código de tela.** Primeiro vêm os mockups e sprites, depois a implementação.
- Não se pede ao fundador que teste build com placeholder sem avisar claramente o que ele vai ver.

## Pendências que exigem aprovação

- Servidor sempre ligado, para o AUTO funcionar com o navegador fechado. Isso é publicação e pode ter custo, então requer aprovação explícita (GOVERNANCE).
