# Brief game-art: Comando 10b, a versão combinada F2b + C10 do Agumon v7 (vista lateral)

**Data:** 2026-11-14 · **Dono:** game-art (modelo Fable 5.2) · **QA:** game-qa (Opus 5.5) · **Coordenação:** game-studio

**Origem:** o parecer do ChatGPT (revisor artístico obrigatório) sobre o Comando 10, de 2026-11-14. O fundador concordou que o F2b fica melhor parado ("antes ta melhor n?").

## Decisão do revisor
1. **Pose lateral parada:** mantém a do F2b. A cabeça corrigida do C10 só entra se melhorar a consistência **sem mudar a postura**. A pose do C10, com a perna muito projetada e a cauda colada à coxa, **não** pode virar o idle.
2. **Acabamento autorizado**, sem perseguir o 8,5 de forma artificial. Mantenha a silhueta natural do F2b. Do C10, aproveite só as correções técnicas: o pé de apoio parado, o alinhamento, a estabilidade, a cabeça estável e os pés que não se sobrepõem.
3. **Saída do ataque S pelo q8:** aprovada provisoriamente. Confira que não há pausa perceptível no retorno ao idle.

## Três cuidados obrigatórios
- **Cauda:** movimento secundário discreto (um leve atraso na ponta), sem atravessar a coxa nem se fundir com ela.
- **Braços:** balanço natural de ~4–5 px, sem contorno duplicado ou laço, sem deformação.
- **Transição caminhada → ataque → idle:** sem mudança brusca de tronco, escala ou posição dos pés. O ataque lateral usa o tronco da versão combinada e o pé em y=49, igual à caminhada.
- **E/W:** simetria, volume do corpo e posição dos braços consistentes. O W é espelho exato.

## Entradas
- O F2b: `etapa6-lab/fase12-comando9/f2/pacote_agumon_f2/`. O backup fica em `fase13-comando10/backup_f2b/`.
- O C10: `etapa6-lab/fase13-comando10/pacote_agumon_c10/`, `RELATORIO_C10.md`, `QA_C10_INDEPENDENTE.md` (com as regressões R1 a R5) e `scripts/`.
- O protocolo GS-003-DIGIMON-REFERENCE-GATE: `fase11-fichas-anatomia/FICHA_AGUMON.md` e as referências oficiais em `fase12-comando9/f1/imagens/oficiais/`.

## Saída
`etapa6-lab/fase14-comando10b/`:
- `pacote_agumon_c10b/` (rotations, walk, attack e `pacote.json`, no mesmo formato do C10). Paleta, escala, canvas e âncora iguais aos atuais.
- Os GIFs pedidos pelo revisor:
  - **caminhada lateral** em 1× e 4×, com F2b, C10 e C10b lado a lado;
  - **ciclo completo do ataque** (S e lateral) em 4×: idle, ataque e volta ao idle;
  - **sequência caminhada → ataque → idle** em 4×.
- PNG das rotações S/N/E/W.
- `RELATORIO_C10B.md`: um reference report curto, o que veio de cada versão, as métricas (oscilação, pé, cores, y do pé) e as regressões.

## Limites
- **PixelLab: 0 gerações.**
- Não integrar.
- Não tocar no F2, no C10 nem na Knowledge Base (o game-research está trabalhando no worktree `kb-gs003`).
- O fogo saindo do peito fica **fora** do escopo (precisa de geração; é outra decisão).
- Teto: ~1 h de agente.
- Se cair: o `PROGRESS.md` em `fase14-comando10b/` aponta onde parou.

Ao terminar, pare. O game-studio aciona o game-qa e leva o resultado ao ChatGPT antes do Vitor.
