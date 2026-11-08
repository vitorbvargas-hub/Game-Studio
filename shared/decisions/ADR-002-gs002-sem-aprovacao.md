# ADR-002 — Scripts 03/04 executados sem aprovação explícita do produto

- **Data:** 2026-11-08 · **Decisor:** game-studio · **Status:** aceito

## Contexto
O fundador enviou os Scripts 03 (MVP Factory, GS-002) e 04 (Launch, GS-003). O GS-001 recomendou o **C07 ReplyDraft condicionado a uma Fase 0**. Não há aprovação explícita do produto nem da Fase 0. O Script 03 determina: sem aprovação, "prepare os artefatos e protótipos locais, mas não inicie uma implementação completa".

## Decisão
1. GS-002 = C07 ReplyDraft em `projects/active/GS-002-replydraft/`, status **PRÉ-APROVAÇÃO**.
2. Escopo autorizado: todos os documentos do Script 03 + **protótipo local funcional** (extensão MV3 + proxy local + provider de LLM **mock**), testado com Playwright contra **fixture HTML** que simula o Gmail. Proibido: contas reais do Gmail, dados reais de terceiros, chaves de API pagas, deploy, publicação na Chrome Web Store, billing real.
3. GS-003 (Script 04) = pacote de lançamento em `GS-002-replydraft/launch/`, como **planejamento**. Script 04 assume MVP homologado, o que não é verdade, então LAUNCH_READINESS = **NÃO PRONTO**.
4. A Fase 0 itens 1–3 (pesquisa Gemini/Gmail, política Chrome Web Store, spike técnico) roda junto, pois já estava autorizada pela governança.

## Gatilho de mudança
Aprovação explícita do fundador → implementação completa (LLM real, billing sandbox, homologação com usuários).
