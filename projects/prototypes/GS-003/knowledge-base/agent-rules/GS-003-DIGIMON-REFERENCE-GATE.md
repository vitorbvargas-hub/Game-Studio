# Protocolo GS-003-DIGIMON-REFERENCE-GATE

**Digital Odyssey (GS-003) · versão 1.0 · 2026-11-14 · GD-072**
Texto central do protocolo. **Não crie uma segunda versão.** Os AGENTS.md dos agentes devem só apontar para este arquivo (trecho sugerido no fim).

> Estado: **texto entregue pelo game-research; a instalação nos agentes e a conferência do carregamento são do game-studio (Fase 6).** Até a instalação ser confirmada, este protocolo não está em vigor em nenhum agente.

## Quando vale

Toda tarefa que envolva **qualquer** um destes itens:

- criar, redesenhar ou variar um Digimon (inclusive NPC Digimon);
- criar sprite, animação, habilidade, efeito visual específico de espécie ou evolução;
- implementar um Digimon no motor;
- alterar aparência ou proporções de um Digimon existente.

Vale para os agentes de arte, animação, gameplay, narrativa, mapas e QA. Não vale para tarefa sem Digimon (tile de chão, UI genérica, Tamer).

## Onde consultar

`projects/prototypes/GS-003/knowledge-base/` (branch `feat/gs003-knowledge-base` até o merge):

| O quê | Arquivo |
|---|---|
| Espécie, nomes, estágio, atributo | `digimondex/catalog.json` (procure pelo `id` `sp.<nome>` ou pelo nome da dublagem em `names.dub_en`) |
| Ficha completa (só P0 neste lote) | `digimondex/species/<nome>.json` |
| Evoluções, com continuidade | `digimondex/evolutions/p0_edges.json` |
| Cinco referências visuais | `digimondex/visual-references/p0_visual_references.json` |
| Divergências e conflitos | `validation/conflicts.json`, campo `divergences` da ficha |
| Fichas de anatomia e catálogo de sprites | `etapa6-lab/fase11-fichas-anatomia/`, `etapa6-lab/fase12-comando9/f1/` |

Pergunta pontual sem resposta na KB: peça ao `game-research` via `game-studio`.

## Etapa A — Identificação

Confirme e registre, com fonte:

1. espécie correta (`id`), sem confundir nome japonês e da dublagem (Bukamon = `sp.pukamon`; Growlmon = `sp.growmon`; Gargomon da dublagem = `sp.galgomon`, que **não** é `sp.gargomon`);
2. forma evolutiva (estágio normalizado: "Ultimate" em inglês = `perfect`);
3. variante (X-Antibody, versão de anime, cor) — variante não é a espécie base;
4. características físicas;
5. atributo e técnicas;
6. fontes e status de cada uma (`verified_primary`, `verified_secondary`, `reused_unverified`, `pending`).

## Etapa B — Estudo visual

Abra as cinco referências quando houver (REF-01 arte oficial, REF-02 anime, REF-03 sprite, REF-04 movimento, REF-05 complementar) e analise: silhueta, anatomia, proporções, paleta, cabeça e rosto, membros, cauda, asas, acessórios, expressões, poses, movimento e traços distintivos.

Slot `missing` não se preenche com espécie parecida.

## Etapa C — Adaptação ao Digital Odyssey

Preserve: identidade GBA Plus / cartoon 2D; leitura clara na escala de gameplay; animação expressiva e fluida; proporções coerentes; consistência com os assets homologados. Qualidade acima de velocidade. Nada de 3D.

Este protocolo **não resolve** os conflitos visuais abertos da Etapa 6 (paleta Endesga-32 × referências, escala Tamer/Digimon, critério de qualidade, densidade dos mapas). Se a tarefa tocar neles, mostre o conflito.

## Etapa D — DIGIMON-REFERENCE-REPORT (antes de gerar ou mudar o asset)

```
DIGIMON-REFERENCE-REPORT
1. Espécie e forma: <id> · <nome> · <estágio> · <variante>
2. Fontes consultadas: <id da fonte, URL, data, categoria, status>
3. Referências visuais disponíveis: REF-01..05 (present / missing / unverified)
4. Características obrigatórias: <lista>
5. Divergências entre fontes: <lista ou "nenhuma encontrada">
6. Direção de arte proposta: <texto>
7. Animações necessárias: <lista>
8. Riscos: <identidade, IP, escala, conflito visual aberto>
9. Critérios de homologação: <como o QA vai conferir>
```

## Etapa E — Bloqueio de qualidade

Se não houver referência suficiente para uma criação confiável:

- não invente anatomia;
- não use espécie parecida como substituta sem dizer isso no relatório;
- não diga que o estudo foi concluído;
- registre a pendência e peça pesquisa complementar ou homologação humana.

**Nível mínimo de evidência para seguir [proposta do game-research, não aprovada]:** REF-01 `present` **e** pelo menos uma referência de corpo inteiro em outro ângulo ou em movimento (REF-03, REF-04 ou REF-05) `present`. Abaixo disso, a tarefa para na Etapa D. O fundador pode mudar esse nível.

## Etapa F — Comparação final (depois de criar)

Compare com as referências; confira proporções, cores e traços distintivos; teste a leitura no tamanho real do jogo; verifique a animação no motor quando aplicável; registre as diferenças intencionais; gere evidência para o QA.

Um Digimon não está concluído só porque o arquivo de imagem existe.

## Trecho para os AGENTS.md (o game-studio instala)

```
## Protocolo GS-003-DIGIMON-REFERENCE-GATE (obrigatório)
Antes de criar, redesenhar, animar, dar habilidade, evoluir, variar ou implementar qualquer Digimon,
siga projects/prototypes/GS-003/knowledge-base/agent-rules/GS-003-DIGIMON-REFERENCE-GATE.md
(etapas A a F e o DIGIMON-REFERENCE-REPORT). Não use outra versão desta regra.
```
