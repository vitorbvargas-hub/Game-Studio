# Brief game-art: Comando 14, F8B Hawkmon, ETAPA 1 (só a pose base)

**Data:** 2026-11-15 · **Dono:** game-art (Fable 5.2) · **Seleção e QA:** game-qa (Opus 5.5) · **Coordenação:** game-studio
**Comando do fundador:** `etapa6-lab/COMANDO_FUNDADOR_14_F8B_HAWKMON.md`.

## Pré-condições, todas cumpridas
1. **F8A concluída:** `fase19-f8a-hawkmon/`.
2. **Direção aprovada pelo ChatGPT** (2026-11-15 02:25) para o protótipo:
   - **escala A, 38 px** (30 px de corpo + 8 de topete);
   - **paleta P1**, a partir das rampas do Agumon F7v2, com vermelho intermediário e **cabeça creme quente**;
   - **topete como peça separada** (obrigatório);
   - **detalhes obrigatórios:** bico curvo, faixa com fivela e 3 pontas escuras por asa.
3. **Orçamento do Vitor:** "só controla o todo". Libera o teto de **22 gerações** para o C14 inteiro, com o piso do PixelLab baixando para **552**. O game-studio controla por etapas.

## ETAPA 1: só a pose base (sul, de frente)
- **Teto desta etapa: 12 gerações.** Antes de cada chamada, confira o custo no `search_help` ou na tabela da ferramenta; depois de cada chamada, rode `get_balance`. **Se o saldo cair abaixo de 562, pare.**
- **Método A** (PixelLab `create_image_pro`):
  - `reference_images`: uma folha oficial em `fase19-f8a-hawkmon/biblioteca/oficiais/`, com `usage` de anatomia e cores do Hawkmon;
  - âncora de estilo: a rotação S do Agumon F7v2 (`fase17-f7-hibrido/v2/pacote_agumon_f7v2/rotations/S.png`), com `usage` de estilo, contorno e escala GBA Plus;
  - canvas 64×64 na faixa de 16 candidatos (10 gerações);
  - descrição com tudo da ficha `03_FICHA_ANATOMICA_HAWKMON.md`: faixa com fivela, pena do topete, bico curvo, asas com 3 pontas escuras, pernas e garras, cauda.
  - Antes de gerar, faça o DIGIMON-REFERENCE-REPORT curto, conforme o protocolo §4.1.
- **Seleção:**
  - escolha os 3 melhores candidatos pela ficha (o game-qa confere depois);
  - polimento gratuito só do melhor, por script ou pixel a pixel: escala 38 px, paleta P1, topete numa camada separada (`base_S_corpo.png` + `base_S_topete.png` + composto);
  - **não rotacione e não anime.**
- **Upload de referência:** use `get_upload_url` e `curl -F` (o proxy pode bloquear; se bloquear, use base64 pequeno). Não envie arte de fã.

## Saída
`etapa6-lab/fase20-f8b-hawkmon/etapa1_pose_base/`:
- os candidatos (folha 1× e 4×);
- top 3 com justificativa;
- a base polida (1× e 4×);
- a comparação com o Agumon F7v2 e com um placeholder de 41 px do Tamer, se houver sprite;
- `RELATORIO_ETAPA1.md`, com gerações gastas, saldo, reference report e problemas;
- `PROGRESS.md`.

## Limites
- **Pare depois da Etapa 1.** Rotação, walk e idle só depois da aprovação do game-qa, do ChatGPT e do Vitor.
- Não integre, não use Retro Diffusion e não toque em outros pacotes.
- Teto de ~1 h 30 de agente.
