# Brief game-dev — duas linhas jogáveis no Link A

**Data:** 2026-11-14 · **Dono:** game-dev · **Coordenação:** game-studio
**Pedido do fundador:** "coloque o gomamon no jogo como segundo digimon para eu jogar… vamos jogar com o bukamon ate ikakumon e com koromon ate graymom".

## Objetivo
No Link A (porta 5191, só laboratório), o jogador deve ter **dois parceiros jogáveis**, cada um com a sua linha:
- **Linha 1:** Koromon → Agumon → Greymon. É a linha atual, com o Agumon v6 hoje.
- **Linha 2 (nova):** Bukamon → Gomamon → Ikkakumon.

O jogador precisa conseguir trocar qual parceiro está ativo. Use um mecanismo que já exista (slot de equipe ou tecla); se não existir, crie algo mínimo, como a tecla `Tab` ou um botão na barra de equipe. O fundador quer **jogar com o Gomamon como segundo Digimon**.

## Entradas (arte 1:1, sem reescalar, D13)
Todos os pacotes estão em `etapa6-lab/fase9-pixellab-d12/`. Cada um traz `rotations/{S,W,E,N}.png`, `walk/{S,W,E,N}/frame_*.png` e, quando houver, `attack/...`, além de `pacote.json`. O canvas pode variar por direção, então alinhe pelo pé, como no v6.
- `pacote_bukamon_v1/`: o `walk` é flutuar (N parado); sem ataque. Use o ataque genérico atual ou nenhum quadro de ataque.
- `pacote_gomamon_v1/`: andar e atacar (garra, evento no quadro 3) nas 4 direções.
- `pacote_ikkakumon_v1/`: andar nas 4 direções, com as presas fixas; sem ataque.
- **Linha 1, por enquanto:** Agumon v6 (já integrado). O Koromon e o Greymon atuais são de pose única (`lab-assets/a/digimon/CREATURE-0005` e `-0007`). **Vai chegar um segundo pacote** (Koromon v1, Agumon v7 e Greymon v1, do PixelLab). Deixe o importador genérico, para ligar esse pacote só apontando a pasta.

## Evolução
Use o mecanismo de evolução que já existe no lab (hoje Agumon→Greymon, `?novo=1` / `?demo=evo`) e estenda para as duas linhas:
- Koromon→Agumon→Greymon;
- Bukamon→Gomamon→Ikkakumon.

Gatilho: o mesmo de hoje (nível ou auto-evoluir). Para o fundador testar rápido, inclua um atalho de laboratório (ex.: `?demo=evo2` ou tecla) que evolui o parceiro ativo. Não mude dano nem balanceamento além do mínimo para as espécies novas existirem (copie os stats de uma espécie equivalente e marque como placeholder de lab). Use os nomes oficiais.

## Critérios de aceite
- Os dois parceiros aparecem em `?novo=1`; dá para trocar o ativo; cada um anda nas 4 direções com o sprite novo.
- O Gomamon ataca com a animação de garra pelo evento de ataque existente; a animação toca 1 vez e volta.
- As duas linhas evoluem até o champion com o sprite certo (capturas de cada estágio).
- `tsc` limpo, `vitest` verde, 0 erros de console.
- A porta 5191 continua servida pelo serviço systemd do usuário **`gs003-lab-a-5191`**. Depois do build: `systemctl --user restart gs003-lab-a-5191`. **Não** suba um processo solto. 5192 e 5193 intocadas.
- Commit em `lab/etapa6`.
- Relatório `integracao/INTEGRACAO_DUAS_LINHAS.md` com capturas em `integracao/duas_linhas/`.

## Proibido
Jogo principal (3289e32), Database oficial e saves; deploy ou push; gerar no PixelLab (custo 0); editar a arte.

## Retomada
Leia `git log` e o relatório parcial.

## ATUALIZAÇÃO (game-studio): pacote da linha 1 pronto
- `pacote_koromon_v1/`: walk = pular; norte parado; sem ataque.
- `pacote_agumon_v7/`: andar + Pepper Breath nas 4 direções. **Vira o padrão** do Agumon; manter `?agumon=v6|v5`.
- `pacote_greymon_v1/`: andar + Mega Flame nas 4 direções. Substitui a pose única.
Linha 1 final: Koromon v1 → Agumon v7 → Greymon v1.
