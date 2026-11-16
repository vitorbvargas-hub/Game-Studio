# Comando 9 — F3: rig 2D por partes (game-art)

**Data:** 2026-11-14 · **Dono:** game-art · **Coordenação:** game-studio · **Aprovado:** ChatGPT (designer) + fundador ("segue os próximos testes").

## Objetivo
Provar, **sem gerar nada** (PixelLab 0), se animar o Agumon **por partes** é melhor ou mais rápido que o método atual (PixelLab v3 custom + polimento). As partes são cabeça, tronco, braços, pernas e cauda, recortadas do sprite aprovado e movidas por transformações inteiras, sem rotação borrada.

## Entrada
- Sprite base: Agumon v7 polido, `etapa6-lab/fase12-comando9/f2/pacote_agumon_f2/`. Use as `rotations/` e, se ajudar, quadros do `walk/`.
- Ficha de anatomia: `etapa6-lab/fase11-fichas-anatomia/FICHA_AGUMON.md`.
- Referências oficiais: `f1/imagens/oficiais/`. O DW3 Agumon tem 8 direções; as emoções do Digital Partner servem como guia de pose. Use só como guia: **nenhum pixel copiado**.
- Ferramentas: Python local (`workspaces/game-art/tools/`) e o `pixelart_workbench` grátis. Você já tem um rig antigo em `etapa6-lab/fase7-digimon-proprio/tool/rig.py`, que pode reaproveitar.

## O que produzir (direção S; E se der tempo)
1. **Idle**, 4 a 6 quadros: respiração (o tronco sobe 1 px), a cauda balança e o piscar fica opcional.
2. **Feliz**, 6 a 8 quadros: pulinho com os braços erguidos.
3. **Preparação de ataque**, 4 a 6 quadros: inclina para trás e abre a boca.

## Regras de qualidade
- Só deslocamentos inteiros. Troca de quadro de parte (ex.: braço erguido) só se a peça vier do próprio sprite ou for redesenhada à mão em pixel.
- Proibido rotação com interpolação, borrão, reescala e cores novas fora da paleta do sprite.
- O pé fica fixo na linha do chão, exceto no quadro do pulo.
- O tamanho da cabeça não muda.

## Saída em `etapa6-lab/fase12-comando9/f3/`
- `rig_agumon/`: partes recortadas (PNG) e o script do rig.
- `anim_{idle,feliz,preparo}_S/frame_*.png`, e a direção E se houver.
- `comparativo_f3.gif` e `.png`, em 4×: lado a lado o v3 custom (as emoções do `fase9-pixellab-d12/teste_metodos/` e o ataque do pacote f2) e o rig.
- `RELATORIO_F3.md` com:
  - o tempo gasto por animação;
  - o que ficou bom e o que ficou ruim;
  - quanto dá para reaproveitar em outras espécies (quadrúpedes!);
  - a nota 0–10 de cada animação, ao lado da nota do v3 custom;
  - a recomendação: o rig substitui, complementa ou não vale.

## Proibido
Gastar créditos, mexer no jogo e nos Links, sobrescrever pacotes e usar arte de terceiros.

## Validação
game-qa (independente), depois o ChatGPT e o fundador.
