# Comando 9 — F2: polimento gratuito (game-art)

**Data:** 2026-11-14 · **Dono:** game-art · **Coordenação:** game-studio · **Aprovado por:** ChatGPT (designer) e fundador (validador final): "segue os próximos testes".

## Objetivo
Melhorar, **sem gerar nada novo** (custo PixelLab 0), os sprites atuais do Agumon v7, do Gomamon v2 e do Ikkakumon v2. Medir quanto o polimento à mão ou por script melhora a qualidade e quanto tempo leva.

## Entradas
- **Sprites atuais (não sobrescrever):** os pacotes `etapa6-lab/fase9-pixellab-d12/pacote_agumon_v7/`, `pacote_gomamon_v2/` e `pacote_ikkakumon_v2/`, nas pastas `rotations`, `walk/<D>/` e `attack/<D>/`.
- **Referência oficial de anatomia e pose:** `etapa6-lab/fase12-comando9/f1/imagens/oficiais/`.
  - **Digital Partner (WonderSwan):** rotação frente/3/4/perfil/costas e emoções.
  - **DW3:** Agumon em 8 direções.
  - **DW Dawn/Dusk:** mini colorido.
  - Leia também `f1/SELECAO_COMENTADA.md`.
- **Fichas de anatomia:** `etapa6-lab/fase11-fichas-anatomia/FICHA_*.md`. A lista "o que NÃO existe" é obrigatória.
- **Ferramentas:** scripts locais em Python ou Node (`workspaces/game-art/tools/`: pxpng.py, gifenc.py) e o `pixelart_workbench` do PixelLab, que é **grátis**. Pixelorama ou LibreSprite só se já estiverem instalados; não instale software pago.

## O que corrigir (prioridade)
1. **Peças que somem ou mudam entre quadros:** presas, chifre, garras, crina e cauda.
2. **Anatomia contra a ficha:** marcas que não existem, membros errados, costas (o Agumon de costas e o Gomamon de costas, que estão "lisos").
3. **Estabilidade:** o tamanho da cabeça e do corpo fica constante; o pé volta à mesma linha.
4. **Limpeza:** pixels soltos, artefatos de efeito e contorno quebrado.
5. **Transições:** o quadro de ataque deformado vira um intermediário simples.

**Proibido:** mudar a escala, mudar a paleta de forma visível, redesenhar o personagem e copiar pixels das folhas oficiais para dentro do sprite. A folha oficial serve para **guiar** a correção, não para colar.

## Saída: `etapa6-lab/fase12-comando9/f2/`
- `pacote_<especie>_f2/`: cópias corrigidas, no mesmo formato dos pacotes.
- `antes_depois_<especie>.gif` e `.png`: lado a lado, escala 4×, com as 4 direções andando e o ataque.
- `RELATORIO_F2.md`: o que foi corrigido em cada sprite, quantos quadros, o **tempo gasto por correção**, o que não deu para corrigir sem gerar de novo, e uma nota 0–10 de antes e depois por critério (fidelidade, estabilidade, limpeza, legibilidade).

## Regras
- Não altere o Link A/B nem o jogo principal. A integração fica para depois, com OK.
- Não gaste créditos PixelLab: só o workbench grátis.
- Não use arte de terceiros.
- O game-studio revisa e leva ao ChatGPT e ao fundador.
