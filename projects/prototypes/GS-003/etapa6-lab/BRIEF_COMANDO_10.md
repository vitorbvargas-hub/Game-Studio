# Brief game-art: Comando 10, polimento final do Agumon v7 (vista lateral)

**Data:** 2026-11-14 · **Dono:** game-art · **Coordenação:** game-studio
**Comando do fundador (leia inteiro):** `projects/prototypes/GS-003/etapa6-lab/COMANDO_10_POLIMENTO_AGUMON.md`
Exceção à regra de "um agente por vez", autorizada pelo fundador ("vamos executando o polimento final do agumon em paralelo"). O game-research está rodando a Knowledge Base ao mesmo tempo. **Não toque em nada dela.**

## Base
- **Sprite atual, versão no jogo:** `etapa6-lab/fase12-comando9/f2/pacote_agumon_f2/`. Use o F2b, a última versão.
- Faça backup antes de mexer.
- Saída num pacote novo, `etapa6-lab/fase13-comando10/pacote_agumon_c10/`. Não sobrescreva o F2.
- **Antes de editar** (é o protocolo novo de referência), consulte:
  - a ficha `fase11-fichas-anatomia/FICHA_AGUMON.md`;
  - as referências oficiais `fase12-comando9/f1/imagens/oficiais/` (DW3 Agumon de lado, Dawn/Dusk e Digital Partner, que mostra o perfil);
  - os QAs anteriores: `f2/QA_F2_INDEPENDENTE.md` e `f4/QA_F4_INDEPENDENTE.md`.
- Registre um `DIGIMON-REFERENCE-REPORT` curto no início do relatório: espécie e forma, fontes, características obrigatórias, riscos e critérios.

## Foco (comando §2–3)
Vista lateral, leste e o oeste espelhado:
- braços com volume e articulação, sem ficarem colados ao tronco;
- pernas sem sobreposição dos pés, com alternância clara e deslocamento real;
- silhueta mais suave entre a cabeça, o pescoço e a barriga;
- cauda contínua entre os quadros.

Mais o que o QA da F4 apontou:
- o estalo na saída do ataque: teste sair pelo q8 do F2b;
- se der, sem gerar nada, aproxime a origem do fogo da boca.

Edição pixel a pixel e scripts. **PixelLab: 0 gerações.** Paleta, escala, canvas e âncora iguais aos atuais.

## Entregas em `etapa6-lab/fase13-comando10/`
- PNG antes e depois da lateral, GIF da caminhada antes e depois, e GIF em 1× e 4×.
- Comparação com as vistas S e N.
- `RELATORIO_C10.md`, com o reference report, o que mudou, as métricas (oscilação, pé, cores) e as regressões.

**Pare depois disso: não integre.** O game-studio aciona o game-qa e leva tudo ao fundador. A meta é nota ≥ 8,5. Se não chegar, explique os limites e proponha alternativas antes de qualquer geração.
