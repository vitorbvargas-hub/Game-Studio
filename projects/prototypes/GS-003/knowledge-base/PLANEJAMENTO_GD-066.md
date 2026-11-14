# Planejamento GD-066 a GD-075 — Knowledge Base Global

**Digital Odyssey (GS-003) · registrado pelo game-research em 2026-11-14 (Fase 7 do comando)**

## Onde isto vive e por quê

Procurei IDs `GD-0` em `shared/` e em `projects/prototypes/GS-003/` em 2026-11-14. Os únicos achados são o próprio comando GD-066, o brief do lote-piloto e uma linha do `quality-overhaul/PROJECT_LOG.md` (escrita pelo game-studio) que registra o pedido. **Não existe registro anterior de GD-0xx para reconciliar** e não achei um backlog do GS-003 com esse prefixo. Por isso o registro fica aqui, junto da KB. O `PROJECT_LOG.md` é do game-studio: cabe a ele citar este arquivo.

Nenhuma decisão de gameplay aprovada foi mudada.

## Itens

| ID | Nome | Dono previsto | Estado em 2026-11-14 | O que existe | O que falta |
|---|---|---|---|---|---|
| **GD-066** | Knowledge Base Global (projeto) | game-research (coordenação: game-studio) | **lote-piloto entregue, aguardando aprovação** | estrutura, catálogo, P0, WorldDex e AnimeDex piloto, validação, branch | aprovação de orçamento para os próximos lotes; merge (fundador) |
| GD-067 | Catálogo completo de espécies | game-research | **parcial** | 1.628 espécies importadas dos índices da Wikimon; 82 com estágio e atributo | estágio, atributo e tipo das outras 1.546; índice oficial (depende de JS); Fandom bloqueado |
| GD-068 | Referências visuais por Digimon | game-research (estudo) + game-art (uso) | **parcial (P0)** | 95 slots do P0; 49 preenchidos; 19 REF-01 com metadados confirmados | 46 slots `missing`; frames do anime; P1 a P3 |
| GD-069 | WorldDex | game-research (canônico) + game-design (mapas do jogo) | **piloto** | 19 regiões de File Island; Costa do Despertar classificada | campos ambientais pendentes em 12 regiões; outras séries; layout-brief da Costa (game-design) |
| GD-070 | AnimeDex | game-research | **piloto** | 54 episódios de Adventure 01 com títulos, Digimon, evoluções, Analyzer; 13 sinopses | sinopses 14-54; eventos, batalhas, objetos; outras temporadas |
| GD-071 | Validação e deduplicação | game-research | **feito para o piloto** | `scripts/validate.py`, `scripts/dedupe.py`, 8 testes, 0 erros estruturais | rodar a cada lote |
| GD-072 | Protocolo obrigatório de criação | game-research (texto) | **texto entregue** | `agent-rules/GS-003-DIGIMON-REFERENCE-GATE.md` | aprovação do nível mínimo de evidência |
| GD-073 | Integração com agentes | **game-studio** | **não iniciado (fora deste agente)** | trecho pronto no fim do protocolo | instalar nos AGENTS.md e provar o carregamento |
| GD-074 | Auditoria de qualidade | game-qa (independente) | **não iniciado** | — | auditoria da KB por quem não a produziu |
| GD-075 | Atualização incremental | game-research | **mecanismo pronto, sem agendamento** | scripts idempotentes; `sources/REQUESTS_LOG.md` | lotes aprovados pelo fundador (ver `reports/PROXIMOS_LOTES.md`) |
