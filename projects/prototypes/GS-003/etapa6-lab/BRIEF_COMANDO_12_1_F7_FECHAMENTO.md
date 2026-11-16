# Brief game-art: Comando 12.1, fechamento da F7 (Agumon)

**Data:** 2026-11-14 · **Dono:** game-art (Fable 5.2) · **QA:** game-qa (Opus 5.5) · **Coordenação:** game-studio

**Origem:** a revisão do ChatGPT aprovou a F7 como **CANDIDATA**, não como versão definitiva. Vale **um único passe final**, sem créditos, depois o Vitor testa no jogo. Não prolongue o trabalho com o Agumon.

## Entradas
- `fase17-f7-hibrido/`: o pacote, `RELATORIO_F7.md` e `QA_F7_INDEPENDENTE.md`, com os achados F7-R1 a R3 e QA-1 a QA-4.
- O F2b em `fase12-comando9/f2/pacote_agumon_f2/`, como fonte das pernas e dos braços.

## Tarefas (comando 12.1 do ChatGPT)
1. **Preservar integralmente** o rosto, as proporções, a paleta e as rotações da F7.
2. **Ataque S, quadro q3:** limpar os ~11 pixels que sobraram do fogo antigo no corpo (QA-1).
3. **Ataque N:** acabar com o congelamento do corpo em q4–q7 (QA-2), que hoje fica parado 520 ms.
4. **Walk S/N experimental:** usar as pernas e os braços do F2b, com dobra do joelho e passada real, mantendo a cabeça, o tronco e a âncora da F7.
   - Compare a versão original com a experimental em movimento, a 1× e a 4×.
   - **Se a experimental não melhorar claramente, fica a original.**
   - Registre qual escolheu e por quê.
5. **Pepper Breath como projétil independente:**
   - o sprite do Agumon mostra a preparação, a abertura da boca e a recuperação;
   - o fogo vira um efeito ou projétil separado, com origem na boca, quadro de disparo e offset por direção documentados no `pacote.json`;
   - deslocamento, colisão e impacto ficam com o jogo.
   - Entregue a folha do projétil e a sua especificação.
6. **Ciclo:** refaça o GIF do ciclo com tempos de quadro de pelo menos 40 ms, para não ser arredondado (QA-3).
7. **Script de build:** pare de apagar a saída anterior ao rodar (QA-4).

## Saída
Em `etapa6-lab/fase17-f7-hibrido/v2/`, **sem sobrescrever** o pacote F7 atual:
- `pacote_agumon_f7v2/`;
- `projetil_pepper_breath/`;
- `comparacao/`: F7 contra F7v2, mais a walk S/N original contra a experimental;
- `RELATORIO_F7V2.md` e `PROGRESS.md`.

## Limites
- PixelLab: 0 gerações.
- Nada de Retro Diffusion.
- Não integrar ao jogo.
- Não tocar no F2b, no C10, no F4, no F6 nem no worktree `kb-gs003`.
- Teto: ~1 h de agente.

Ao terminar, pare. Depois vêm o game-qa, o ChatGPT e o build isolado do game-dev para o Vitor.
