# ASSET_QA_CHECKLIST — GS-003

- **Autor:** game-art · **Data:** 2026-11-08 · **Base:** briefing `02_module18_generative_sprite_factory.md` (ETAPA 5), `06_procedural_sprite_creation.md` §6, `ART_STYLE_GUIDE.md`, `SPRITE_SPECIFICATION.md`, `ASSET_LICENSE_POLICY.md`.
- Usar este checklist **antes** de mudar `approvalStatus` de `UNDER_REVIEW` para `APPROVED`, e de novo antes de `INTEGRATED`. Reprovado em qualquer item obrigatório → volta para o agente responsável (game-sprite-artist/game-animator), não vira `APPROVED` "com ressalva".

---

## 1. Licença (bloqueante — nenhum outro item importa se isto falhar)

- [ ] Origem do asset identificada e registrada em `license.json` (`layer`, fonte, autor, data).
- [ ] Se `layer: licensed` — licença verificada por `web_fetch`/inspeção direta (não "de memória"), com link e data no `license.json`.
- [ ] Se `layer: original` com `fanException: true` — `baseCharacter`, `basis` (ADR) e `restrictions` preenchidos (`ASSET_LICENSE_POLICY.md` §3).
- [ ] Nenhum rip oficial, nenhuma fonte de "licença não clara" sem autorização por escrito (`ASSET_LICENSE_POLICY.md` §4).
- [ ] Se usa crédito de terceiro: entrada correspondente em `CREDITS.md`.

## 2. Técnico (arquivo)

- [ ] Transparência correta (fundo 100% transparente, sem halo de cor residual nas bordas).
- [ ] Nenhum frame duplicado dentro de uma animação (exceto quando o design pede, ex. idle com hold intencional — documentar se for o caso).
- [ ] Nenhum frame cortado (silhueta inteira dentro dos limites do canvas declarado em `creature.schema.json`).
- [ ] Alinhamento consistente entre frames da mesma animação (o pivô não "pula" de frame para frame, exceto o deslocamento intencional de antecipação/impacto/recuo).
- [ ] Resolução nativa bate com o porte declarado (`SPRITE_SPECIFICATION.md` §1: 32/48/64px).
- [ ] Escala, se houver preview ampliado, é fator inteiro + nearest-neighbor (sem blur).

## 3. Animação

- [ ] Loop fecha sem salto perceptível (último frame → primeiro frame é uma transição suave, para animações `loop: true`).
- [ ] `fps`/`durationMs` por frame batem com `ANIMATION_STANDARD.md` (ou têm justificativa registrada para o desvio).
- [ ] `events` (ex. `hitFrame`) apontam para o índice de frame correto — conferir visualmente que o frame marcado é de fato o de impacto/consumo/etc.
- [ ] Direções entregues batem com a regra de `SPRITE_SPECIFICATION.md` §5 (não falta direção exigida pelo comportamento da animação, não sobra direção desnecessária).
- [ ] Animação de ataque/hurt **não** decide resultado nenhum por si só — é possível trocar por 1 frame sem quebrar a simulação (teste conceitual de `WORLD_COMBAT_VISUAL_SPEC.md` §8).

## 4. Consistência visual (entre frames e entre criaturas da mesma linha evolutiva)

- [ ] Paleta usada é um subconjunto de Endesga-32, ≤ 5–6 cores por criatura (`ART_STYLE_GUIDE.md` §4).
- [ ] Contorno 1px `#181425` presente e consistente.
- [ ] Luz superior-esquerda respeitada (realce no quadrante certo).
- [ ] Nenhuma mudança involuntária de anatomia, olhos, formato de cabeça, proporções ou acessórios entre animações da mesma criatura.
- [ ] Dentro de uma linha evolutiva: silhueta/paleta/motivo reconhecíveis como a mesma família (não precisa ser idêntico, precisa "parecer parente").

## 5. Legibilidade no mapa (`ART_STYLE_GUIDE.md` §6)

- [ ] Silhueta reconhecível no tamanho de exibição real (não só ampliado 4–8× no preview).
- [ ] Cor base + no máximo 1 marca já diferenciam a espécie, sem depender de detalhe fino.
- [ ] Âncoras `head`/`hit`/`shadow` não ficam escondidas atrás de partes do corpo (testar com a barra de HP desenhada por cima, mesmo que só mentalmente/por overlay simples).

## 6. Originalidade (quando aplicável — `ART_STYLE_GUIDE.md` §8)

- [ ] Checklist "não copiar" revisado para criaturas `original` sem exceção ADR-007.
- [ ] Para redesenhos Digimon-fan (ADR-007): confirmado que nenhum arquivo/imagem oficial foi aberto/rastreado durante a produção (registrar no próprio código-fonte ou no `creature.json`, como já é convenção em `art/src/agumon.js` etc.).

## 7. Teste na engine (quando houver engine para testar — hoje: Canvas 2D custom, `docs/TECH_AUDIT.md`)

- [ ] Atlas JSON carrega sem erro de parsing.
- [ ] Pivô posiciona a entidade corretamente sobre o tile esperado.
- [ ] Animação toca no fps/duração certos dentro do loop de tick do jogo (não só no preview isolado do gerador).
- [ ] Não há regressão de performance perceptível com várias instâncias da mesma criatura em tela simultaneamente (quando aplicável — P0 só, ver `WORLD_COMBAT_VISUAL_SPEC.md` §7 sobre LOD).

---

## Resultado

- **Todos os itens obrigatórios (§1–§5) passam →** `approvalStatus: APPROVED`.
- **§1 falha →** `approvalStatus: REJECTED`, motivo registrado, binário removido do repo (`ASSET_LICENSE_POLICY.md` §1).
- **§2–§6 falham, §1 ok →** volta para produção (`UNDER_REVIEW` continua, não regride para `DISCOVERED`), com os itens reprovados listados no `creature.json` (campo livre `qaNotes`, ver `creature.schema.json`).
- **§7 só se aplica depois que existir uma engine real para testar** — até lá, `APPROVED` não depende de §7, mas `INTEGRATED` depende.

## Limitações

- Este checklist não foi aplicado ponta a ponta a nenhuma criatura completa nesta entrega (a única produção desta sessão é a ficha piloto de calibração, que é intencionalmente fora do fluxo de aprovação — `ART_STYLE_GUIDE.md` §7).
- O item §7 (teste na engine) é hoje teórico — não existe ainda o renderer de mundo real do game-dev para rodar o teste (`WORLD_COMBAT_VISUAL_SPEC.md` é spec, não implementação).
