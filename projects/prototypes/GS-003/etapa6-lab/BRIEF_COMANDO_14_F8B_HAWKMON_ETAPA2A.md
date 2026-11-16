# Brief game-art: Comando 14, Etapa 2a do Hawkmon (ajustes + rotações S/N/E/W)

**Data:** 2026-11-15 · **Dono:** game-art (Fable 5.2) · **QA:** game-qa (Opus 5.5) · **Coordenação:** game-studio

**Aprovado pelo ChatGPT** (2026-11-15 ~03:55): a v2 da pose base foi aprovada como base, com 2 ajustes gratuitos. O texto do comando dele vale como especificação; os pontos abaixo resumem.

## 1. Ajustes gratuitos, antes de gastar qualquer geração
Base de partida: `etapa1_pose_base/base_polida_v2/`, editável em `scripts/base_v2.py`. Gere a v3 sem sobrescrever a v2.
- **Tufos da cabeça:** descer para as laterais, na altura da faixa (linhas 11–13), apontando para fora; arredondar 1 px nos cantos de cima.
- **Pontas das asas:** encurtar cerca de 1 px, mantendo as 3 penas escuras reconhecíveis e separando melhor asa de perna.
- **Preservar:** 38 px, paleta P1, expressão determinada, topete separado, fivela, bico curvo.
- **Conferência rápida da silhueta:** com o `qa_independente/reqa_v2.py` do QA, confirme que a cabeça não lê mais como "orelhas" e que a massa ficou entre 0,80 e 0,90 do Agumon.

## 2. Rotações S/N/E/W, com o menor consumo possível
- **Ferramenta:** `create_character` com `mode="v3"`, `reference_image` = a base v3 composta (S, de frente, com o topete junto), `n_directions=4`.
  - Antes de gerar, confira o preço na referência da ferramenta (`search_help tool=create_character`).
  - A base tem 38 px: centralize num canvas múltiplo de 4 (por exemplo 48×48 ou 60×60), **sem reescalar**.
- **Orçamento:**
  - teto desta etapa: **6 gerações**;
  - rode `get_balance` antes e depois de cada chamada;
  - **pare se o saldo cair abaixo de 552.**
- **Polimento das rotações, à mão e sem custo:**
  - forçar a paleta P1 (a rotação costuma criar tons intermediários);
  - topete em camada separada em cada direção;
  - W = espelho de E, se a assimetria permitir;
  - pontos de vigilância do QA: tufos saindo para trás na altura da faixa; olho que não some nas laterais; fivela que não vire óculos; gancho do bico visível de lado; massa entre 0,80 e 0,90 do Agumon em cada direção; costas (N) sem rosto e com as 3 pontas escuras.

## Saída
`etapa6-lab/fase20-f8b-hawkmon/etapa2a_rotacoes/`:
- `base_v3/`;
- `rotacoes_cruas/` (o que o PixelLab devolveu);
- `rotacoes_polidas/` (S/N/E/W, com corpo e topete separados);
- **prancha comparativa** das 4 direções em 1× e 4×, ao lado do Agumon F7v2 e do Tamer;
- `RELATORIO_ETAPA2A.md`, com gerações gastas, saldo e problemas;
- `PROGRESS.md`.

## Limites
- **PARE depois das rotações.** Nada de walk, idle ou montagem final sem nova aprovação.
- Não integre ao jogo.
- Não use Retro Diffusion.
- Preserve todos os arquivos anteriores.
- Teto: cerca de 1 h 30 de agente.
