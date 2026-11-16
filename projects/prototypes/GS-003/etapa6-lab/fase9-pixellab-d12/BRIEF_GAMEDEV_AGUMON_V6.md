# Brief game-dev — Agumon v6 (PixelLab) no Link A

**Data:** 2026-11-14 · **Dono:** game-dev · **Coordenação:** game-studio · **Autorização:** mandato noturno do fundador ("pode ficar a vontade… quando eu acordar eu avalio").

## Objetivo
Pôr o Agumon v6 (caminhada nas 4 direções + ataque Pepper Breath nas 4 direções) no **Link A** (laboratório, porta 5191), como **padrão**, mantendo as versões anteriores acessíveis para comparação.

## Entradas
- Pacote: `etapa6-lab/fase9-pixellab-d12/pacote_agumon_v6/`
  - `rotations/{S,W,E,N}.png` (56×56)
  - `walk/{S,W,E,N}/frame_000..007.png` (56×56, loop de 8 quadros, ~10 fps)
  - `attack/{S,W,E,N}/frame_000..008.png` (56×56, 9 quadros, ~8 fps; o disparo do fogo cai nos quadros 3–4)
  - `pacote.json`: alturas e linha do pé por animação
- Integração anterior para usar como modelo: `lab-assets/a/digimon/CREATURE-0006/fixer5/` (v5) e o relatório `fase8-fixer-no-jogo/v5/INTEGRACAO_V5.md`.
- Worktree: `~/projects/GameStudio/workspaces/game-dev/lab-etapa6`, branch `lab/etapa6` (HEAD 62aef2d).

## O que fazer
1. Copiar o pacote para `lab-assets/a/digimon/CREATURE-0006/pixellab6/`, seguindo o formato do `fixer5` (`lab-character.json` com o pivô pelo pé de cada quadro). **Sem reescalar** (D13): os quadros entram 1:1.
2. Fazer do v6 o padrão do Agumon no Link A. Manter `?agumon=v5` e `?agumon=v4` funcionando.
3. **Ataque:** hoje o Agumon não se mexe ao atacar. Ligue a animação `attack` da direção atual ao evento de ataque que **já existe** no combate (sem mudar regras, dano ou balanceamento). Ao terminar, ele volta a `idle`/`walk`.
4. Ligar o sprite v6 também na evolução Agumon→Greymon (`?novo=1`), sem mexer no Greymon.
5. Fazer o build do `dist-lab-a` e servir na 5191 **desacoplado da sessão**:
   `setsid nohup npx vite preview --outDir dist-lab-a --port 5191 --strictPort --host 127.0.0.1 > /tmp/lab-a-5191.log 2>&1 &`
   O processo atual da 5191 (pid 187780) pode ser substituído.
6. Commit no `lab/etapa6` com mensagem clara.

## Critérios de aceite (mensuráveis)
- `curl` em 127.0.0.1:5191 responde 200. As portas 5192 e 5193 continuam respondendo 200.
- O jogo carrega no navegador sem erros de console (anexar evidência).
- O Agumon v6 anda nas 4 direções com o pé fixo na linha do chão (sem tremer verticalmente mais de 2 px entre quadros).
- Ao atacar, a animação Pepper Breath toca 1 vez na direção correta e volta ao estado anterior.
- `?agumon=v5` mostra a versão anterior.
- Capturas: frente, lado e costas andando, mais 1 quadro do ataque, salvas em `etapa6-lab/fase9-pixellab-d12/integracao/`.
- Relatório: `etapa6-lab/fase9-pixellab-d12/integracao/INTEGRACAO_V6.md` (o que mudou, commit, como testar, problemas).

## Proibido
Alterar o jogo principal (protegido em 3289e32), a Database ou os saves; deploy público ou push; gastar gerações do PixelLab (custo desta tarefa: **0**); mudar a escala do Tamer; editar a arte do pacote. Se a arte tiver defeito, relate em vez de corrigir.

## Validação
QA visual pelo game-studio e avaliação final do fundador.

## Retomada se cair
Confira `git log` e `integracao/INTEGRACAO_V6.md` e continue do parcial.
