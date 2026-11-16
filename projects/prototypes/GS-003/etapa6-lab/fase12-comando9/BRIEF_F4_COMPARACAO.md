# Comando 9 — F4: comparação e híbrido (game-art)

**Data:** 2026-11-14 · **Dono:** game-art · **Coordenação:** game-studio

## Objetivo
Comparar os métodos testados e montar **um teste híbrido**. A partir disso, propor o **Sprite Production Standard 1.1**. Custo PixelLab: 0.

## Entradas
- **A — PixelLab original:** pacotes em `etapa6-lab/fase9-pixellab-d12/pacote_{agumon_v7,gomamon_v2,ikkakumon_v2}/`.
- **B — polimento (F2/F2b):** `fase12-comando9/f2/`, com `RELATORIO_F2.md` e `QA_F2_INDEPENDENTE.md`.
- **C — rig 2D (F3):** `fase12-comando9/f3/`, com `RELATORIO_F3.md` e `QA_F3_INDEPENDENTE.md`.
- **Emoções do v3 custom:** `fase9-pixellab-d12/teste_metodos/` e `f3/ref_v3_custom_feliz_1x/`.
- **Padrão atual:** `etapa6-lab/SPRITE_PRODUCTION_STANDARD_1.0.md`, mais as fichas em `fase11-fichas-anatomia/`.
- **Referências:** `fase12-comando9/f1/`, que trazem o passo 0 (pesquisa de pixel art pronta e permissões).

## D — híbrido (Agumon, direção S)
Monte e entregue os quadros:
1. **Idle:** rig F3 (o QA deu 7,5).
2. **Ataque Pepper Breath:** 1–2 quadros de antecipação do rig (só agachar e abrir a boca, como o QA recomendou), seguidos do miolo do golpe v3 polido F2b e da volta ao idle do rig. Teste a **emenda**, que o QA apontou que não foi testada.
3. **Feliz:** v3 custom polido. Não use o rig, que ficou com braços mecânicos.

Corrija, se for barato, os P2 do QA da F3 que caírem no híbrido.

## Saída em `fase12-comando9/f4/`
- `hibrido_agumon_S/{idle,ataque,feliz}/frame_*.png`
- `pagina_comparacao.html`: página local, sem rede, com A, B, C e D lado a lado em 1× e 4×, animando com CSS ou JS (sprite sheet ou GIF), e as notas e o custo de cada um.
- `RELATORIO_F4.md` com a tabela por método:

  | Critério | A | B | C | D |
  |---|---|---|---|---|

  Critérios: fidelidade, animação, consistência anatômica, tempo, gerações e facilidade de repetir em outra espécie. Use as notas dos QAs independentes, não as autoavaliações.
- `PROPOSTA_STANDARD_1.1.md`: o pipeline final recomendado, passo a passo. Inclua:
  - o **passo 0** (buscar pixel art pronta: Pinterest, DeviantArt, Spriters Resource; usar o que tiver licença e pedir permissão para o resto);
  - o **passo 1** (ficha de anatomia);
  - o Método A;
  - o polimento obrigatório;
  - o rig para idle e antecipação;
  - o QA independente.
  Inclua também o custo por espécie e quando gerar de novo em vez de polir. Marque como PROPOSTA: quem homologa é o fundador.

## Proibido
Gastar créditos, mexer no jogo e nos Links, sobrescrever pacotes e arte de terceiros.
