# Brief game-dev: Comando 12.2, build isolado da F7v2 (Agumon) para o teste do Vitor

**Data:** 2026-11-14 · **Dono:** game-dev (Opus 5.5) · **QA:** game-qa (Opus 5.5) · **Coordenação:** game-studio

**Aprovado pelo ChatGPT**, revisor artístico obrigatório, em 2026-11-14 ~23:00. A F7v2 é candidata a teste jogável, **sem homologação definitiva**. Quem decide é o Vitor, no jogo.

## Entradas
| O quê | Onde |
|---|---|
| Pacote | `etapa6-lab/fase17-f7-hibrido/v2/pacote_agumon_f7v2/` (`pacote.json`: canvas 60×60, âncora (29,5 ; 49), tempos, fases do ataque) |
| Projétil | `etapa6-lab/fase17-f7-hibrido/v2/projetil_pepper_breath/` (`projetil.json`: origem por direção, quadro de disparo, nascer/voo/impacto) |
| Relatórios | `v2/RELATORIO_F7V2.md` e `v2/QA_F7V2_INDEPENDENTE.md`, incluindo as condições do build |
| Lab atual | worktree `~/projects/GameStudio/workspaces/game-dev/lab-etapa6`, em `projects/prototypes/GS-003/prototype/world`, build `VITE_LAB_VARIANT=a npx vite build --outDir dist-lab-a`, servido pelo serviço systemd de usuário `gs003-lab-a-5191` em http://127.0.0.1:5191/?novo=1. O Agumon atual é o `pixellab8` (F2b); as versões antigas abrem por `?agumon=v7` etc. A importação usa `scripts/lab/import-pixellab-line.mjs` |

## O que fazer
1. **Isolamento:**
   - não mexa no jogo principal (master, 3289e32) nem no build atual do Lab A em 5191;
   - crie um build separado, por exemplo `dist-lab-f7v2`, servido numa **porta nova (5196)** por um serviço systemd de usuário próprio (`gs003-lab-f7v2-5196`, Restart=on-failure, com `--setenv=PATH=$PATH`);
   - mesmo mundo, Koromon → Agumon → Greymon e as linhas do Gomamon, como no Lab A.
2. **Agumon F7v2:**
   - integrar como a versão padrão desse build, com a walk S experimental, a walk N original e E/W espelhado, como no pacote;
   - respeitar o canvas 60×60, a âncora e os tempos do `pacote.json`;
   - o F2b continua acessível por parâmetro, para comparar no jogo.
3. **Pepper Breath como projétil:**
   - criado no **início do quadro de disparo**, com o centro da bola sobre a origem da boca por direção;
   - **atrás** do Agumon no N e na frente nas outras direções;
   - deslocamento, velocidade, alcance, colisão e impacto ficam com o jogo; use valores razoáveis e documente quais;
   - não pode haver ataque sem fogo.
4. **Transições:** idle → walk → ataque → recuperação → idle nas 4 direções, incluindo a entrada e a saída da walk S, que o ChatGPT pediu para observar.
5. **Teste:**
   - Chromium headless em `~/.cache/ms-playwright/chromium_headless_shell-1243/*/chrome-headless-shell`, com LD_LIBRARY_PATH apontando para os diretórios `.so` de `/tmp/chromelibs/ex`, `NODE_USE_ENV_PROXY=0 NO_PROXY='*'`;
   - capturas e um GIF curto do Agumon andando e atacando no mapa nas 4 direções;
   - 0 erros de console.
6. **Saída:**
   - `etapa6-lab/fase18-build-f7v2/RELATORIO_BUILD_F7V2.md`, com o link, como testar (teclas, parâmetros), o que foi mexido, os valores do projétil e as evidências;
   - `PROGRESS.md`.

## Limites
- Nada de polimento artístico: não edite pixels.
- PixelLab: 0 gerações.
- Nada de deploy público, push ou merge.
- Não integre ao jogo principal.
- Não altere a Database nem o formato de save.
- Teto: ~2 h de agente.
- Se cair, o `PROGRESS.md` aponta onde parou.

Ao terminar, pare. Depois vêm o game-qa, o ChatGPT e o link para o Vitor.
