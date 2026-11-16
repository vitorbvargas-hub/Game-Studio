# Brief game-art: Comando 14, Etapa 2b, caminhada e idle do Hawkmon

**Data:** 2026-11-15 · **Dono:** game-art (Fable 5.2) · **QA:** game-qa (Opus 5.5) · **Coordenação:** game-studio

O ChatGPT **aprovou as rotações v2** (2026-11-15 ~05:10) e liberou a caminhada e o idle. O comando dele vale como especificação. Resumo:

## Decisões de direção (ChatGPT)
- Escala de 38 px.
- Régua de massa: o Agumon S, conferindo também a consistência interna entre as direções. Não vale como regra universal.
- Massa de E/W em 0,80: aceita. Não aumente o corpo.
- Topete estreito, 2–3 px.
- Cauda do N: fica o leque atual; vigie a separação das pernas.

## Entradas
- Rotações aprovadas: `fase20-f8b-hawkmon/etapa2a_rotacoes/rotacoes_polidas_v2/`. Preserve-as e confira os hashes em `sha256_e2ab.txt`.
- Os 6 pontos de atenção da caminhada: `QA_ETAPA2A_INDEPENDENTE.md`, seção "Re-QA v2".
- Personagem no PixelLab: `cdca6904-006a-4c86-9530-1044e16a31e9`. Veja com `get_character` se as rotações dele servem de base para o `animate_character`. Se não servirem, use `animate_image` sobre as rotações v2.
- Padrão de montagem: o pacote F7v2 do Agumon (`fase17-f7-hibrido/v2/`): 60×60, âncora, `pacote.json`, pé plantado, W como espelho de E.

## Caminhada
- Até 8 quadros por direção, com movimento real de pernas e pés; sem marcha no lugar e sem deformar a cabeça.
- Asas com movimento discreto, que não leia como voo.
- **N:** pernas e cauda não podem se fundir. A ponta central do leque nunca toca o chão. Os pés ficam 1 px mais curtos por dentro.
- **E/W:** a asa continua recolhida e a cauda vermelha fica visível, sempre acima e atrás da asa. O pé de trás é mais escuro e nunca passa à frente do pé de perto.
- O topete oscila no máximo 1 px.

**Fonte:** PixelLab v3 (`animate_character` ou `animate_image`, ~1 geração por direção).
- Comece por **S e E**, confira o resultado e só depois gere o N. O W é espelho do E.
- Se um resultado vier com deformação grave, **pare e escreva o diagnóstico antes de gerar de novo**.
- Depois, polimento à mão: forçar a P1, transplantar a cabeça e o topete aprovados em todos os quadros (técnica da F7) e plantar o pé. O Blender pode servir de gabarito de movimento, se ajudar.

## Idle
Respiração, piscar (os candidatos 01/02 da Etapa 1 têm os olhos fechados e servem de referência) e pequenos ajustes de postura. Use rig ou edição à mão, **sem gastar gerações**. Não deforme rosto, bico nem faixa.

## Créditos
- Restam **11 gerações**, até o piso de **552**.
- Não gaste tudo de uma vez.
- Rode `get_balance` antes e depois de cada chamada.
- Pare se o saldo cair abaixo de 552.

## Saída
`etapa6-lab/fase20-f8b-hawkmon/etapa2b_walk_idle/`:
- `pacote_hawkmon_v1/`: rotações, walk e idle, `pacote.json` (60×60, âncora) e o topete em camada separada, se fizer sentido;
- comparação em 1× e 4×: GIFs de walk e idle nas 4 direções, na mesma velocidade do Agumon F7v2, com o Agumon e o Tamer lado a lado, e o ciclo idle → walk → idle;
- métricas: área por quadro, paleta, pixels soltos, deslizamento do pé, oscilação do topete;
- `RELATORIO_ETAPA2B.md`, com gerações gastas, saldo e problemas;
- `PROGRESS.md`.

## Limites
Não integre ao jogo principal. Não faça ataques. Não use Retro Diffusion. Teto de ~2 h 30 de agente. Ao terminar, pare: o próximo passo é o game-qa e depois o ChatGPT.
