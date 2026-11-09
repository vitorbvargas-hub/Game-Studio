# GS-003 · Frente "Map Factory" — briefing v2

- **Origem:** script "GS-007 — AI MAP FACTORY" do fundador (2026-11-09), revisado por game-studio.
- **Status:** **aprovado com ajustes no ADR-011 (2026-11-09).** O ADR-011 prevalece sobre este texto nos pontos de orçamento (40 créditos), referências de terceiros (permitidas como estilo) e agentes (todos os que ajudarem).
- **Estado real descoberto em 2026-11-09:** o jogo (`prototype/world/`) já carrega mapas Tiled (`src/data/maps/*.tmj.json`: forest-proof, praia, vila), com geradores (`scripts/gen-forest-proof.mjs`, `gen-region-maps.mjs`), autotile Wang-47, portais entre mapas e testes. A fábrica **generaliza esse pipeline** e não recomeça do zero.
- **Enquadramento:** é uma **frente de trabalho dentro do GS-003**, e não um projeto novo. Assim não ocupa uma vaga do portfólio (limite de 2) e herda as regras dos ADR-006 a 010.

## 1. O que mudou em relação ao v1 e por quê

| v1 | v2 | Motivo |
|---|---|---|
| Auditoria completa do zero | **Auditoria delta**: só o que não está em `docs/TECH_AUDIT.md` (SD local, PixelLab, editor de mapas) | Motor, render, save e testes já foram auditados em 2026-11-08 |
| "Não presumir o motor" | Motor conhecido: **Canvas 2D próprio, TS + Vite**, com sim/render separados (TECH_AUDIT §1) | Já foi verificado. Phaser está bloqueado neste host |
| 8 agentes novos permanentes | **8 papéis distribuídos entre os 6 agentes existentes** (§3) | O limite de 4 tarefas simultâneas e o custo de manutenção não justificam 8 agentes que ficam ociosos entre mapas |
| Tiled e LDtk em avaliação | **Formato fonte: Tiled JSON (.tmj)**, escrito por código. Tiled GUI é opcional, para edição humana no Windows. LDtk fica fora | Formato documentado e estável, gerável sem a GUI e com bom encaixe no renderer em chunks. Um formato só |
| Nota de 0 a 10 por critério, dada pela IA | **Gates automáticos** (pass/fail) + **nota visual do fundador** | Nota subjetiva de IA sobre a própria obra não serve como critério de aceite |
| Pastas em `GameStudio/AI-Map-Factory/` | Pipeline em `shared/tools/map-factory/`, conteúdo em `projects/prototypes/GS-003/world/` | A raiz do estúdio está fora do escopo de escrita (AGENTS.md). Pipeline é reutilizável, mapa é do jogo |
| "Respeitar o orçamento aprovado" | **Teto explícito de gerações PixelLab** (§6) | O v1 não define número. Sem teto, a regra não tem efeito |
| SD gera referências, texturas e elementos | SD fica **só com moodboard e paleta**. Tiles e props vêm do PixelLab ou são feitos à mão | SD 1.5 não gera tiles que encaixam sem costura, e a RTX 2060 com 6 GB limita o SDXL |
| "Testar no jogo" | Aceite com **evidência objetiva** (§7) | "Carregou" sem prova não fecha a entrega |

## 2. Restrições herdadas (não negociáveis nesta frente)

- **IP:** fan game **não comercial** (ADR-007). Digimon só da lista do banco do projeto (`knowledge/`). Sprites de fã só com licença registrada em `CREDITS.md` (`art/FAN_SPRITE_SOURCES.md`). Nada gerado por IA que imite sprite oficial de um Digimon específico.
- **Referências de terceiros** (Drakantos, PokeIdleDex, Digimon): **podem ser usadas como referência de estilo** (decisão do fundador, ADR-011 §5). Fica registrado o risco de proximidade com a arte de terceiros caso o projeto seja monetizado.
- **Custo:** nenhum gasto novo além da assinatura PixelLab que o fundador já paga, dentro do teto da §6.
- **Motor:** não trocar. O mapa entra pelo renderer de mundo descrito em `WORLD_COMBAT_VISUAL_SPEC.md`.

## 3. Papéis → agentes existentes

| Papel do v1 | Quem executa | Entrega |
|---|---|---|
| Map Director | game-studio | Escopo, gates, aprovação |
| World Designer | game-design | Planta lógica (regiões, rotas, spawns, POIs) em JSON + PNG esquemático |
| Art Director | game-art | Paleta, tile size, regras de estilo, aprovação de assets |
| Asset Generator | game-art | Assets via PixelLab/SD, com log de prompt, custo e licença |
| Tileset Engineer + Map Builder | game-dev | Tilesets com metadados de encaixe, `.tmj` com camadas, colisão e objetos |
| Validator | game-qa | Validador automático + relatório |
| World Integrator | game-dev | Loader `.tmj` → renderer, teste de carga |

Cada papel vira um **playbook** em `shared/tools/map-factory/playbooks/`. Se algum papel ficar com volume recorrente, aí sim cria-se um agente dedicado.

## 4. Pipeline (5 etapas, com gate em cada uma)

1. **Briefing + planta** (game-design). Gate: a planta tem rota do spawn inicial até o chefe, com pelo menos 1 rota alternativa.
2. **Direção de arte + kit mínimo** (game-art). Kit essencial para a floresta: grama, terra/trilha, água rasa e borda, 3 árvores, 2 arbustos, 2 rochas, flores, 1 prop interativo. Gate: aprovação visual do fundador **antes** de montar o mapa.
3. **Tileset + montagem** (game-dev). Camadas fixas: `ground`, `ground_detail`, `objects_below`, `objects_above`, `collision` (camada de objetos, independente da arte), `spawns`, `npcs`, `triggers`, `poi`.
4. **Validação automática** (game-qa), §7.
5. **Integração e evidência** (game-dev), §7.

WFC: fica **fora do piloto**. Entra só para gerar variações depois que existir 1 mapa aprovado manualmente, que serve de amostra de regras.

## 5. Ferramentas

| Ferramenta | Papel | Estado em 2026-11-09 |
|---|---|---|
| PixelLab (MCP) | Tilesets top-down Wang, props, mapa de rascunho | Ferramentas visíveis, mas a chamada retorna **401 (falta header Authorization)** |
| ComfyUI + SD 1.5 + LoRA pixel | Moodboard e paleta | Scripts prontos em `shared/tools/sd-local/`, instalação aguardando o proxy |
| Tiled | Edição humana opcional | Não instalado. Não é necessário para o pipeline |
| Validador | Gates automáticos | A construir (TS, roda no `npm test`) |

## 6. Orçamento PixelLab (proposta)

- **Saldo total: 40 créditos (ADR-011).** Só ferramentas de 1 crédito (tileset standard, pixen, pixflux). O texto abaixo é a proposta original de 60, que foi substituída. Estimativa: 4 tilesets top-down standard (~1 cada), cerca de 12 props via `create_1_direction_object` (10–15 cada, mas cada chamada devolve vários candidatos, então ~4 chamadas = ~50) e folga para retrabalho.
- Antes de cada chamada: `get_balance`, custo estimado no log e verificação de duplicata. O log fica em `shared/tools/map-factory/logs/pixellab-usage.csv`.
- Se o teto acabar, para e pede autorização. Não segue com outra ferramenta paga.

## 7. Critério de aceite do piloto "Digimon Forest — Prototype 01"

**Gates automáticos (todos obrigatórios):**
- O `.tmj` valida contra o schema (camadas obrigatórias presentes, IDs de tile existentes).
- **Alcance:** um BFS na grade de colisão chega do spawn do jogador a 100% dos POIs, spawns de Digimon, NPC e arena do chefe.
- Nenhum spawn ou NPC em célula bloqueada, nem sobreposto a um objeto.
- Encaixe de tiles: nenhuma borda Wang inválida entre vizinhos.
- Espécies em `spawns` existem no banco do projeto e têm sprite com licença registrada.
- Performance: o mapa renderiza a 60 fps no renderer em chunks (medição registrada) e o `npm test` continua verde.

**Evidência de integração:**
- O jogo carrega o mapa no dev server local.
- Teste automatizado (Playwright ou headless): o jogador anda do spawn até a clareira e um encontro acontece no próprio mapa.
- Screenshots + vídeo curto em `evidence/map-factory/`.

**Aceite humano:** o fundador dá nota visual ≥ 8 e aprova a sensação de exploração.

## 8. Fases

| Fase | Conteúdo | Gate |
|---|---|---|
| A | Auditoria delta (SD, PixelLab, editor) | Relatório curto |
| B | Infra: SD instalado, PixelLab autenticado, validador e loader `.tmj` | 4 sprites de teste SD + 1 tileset PixelLab de teste |
| C | Piloto: etapas 1–3 | Aprovação visual do kit |
| D | Validação + integração + documentação | §7 completo |

A implantação só fecha na Fase D, com o mapa carregado no jogo e as evidências salvas.

## 9. Decisões pedidas ao fundador

1. Teto de **60 gerações PixelLab** para o piloto.
2. **Tiled JSON** como formato fonte único, sem LDtk.
3. Papéis distribuídos entre os agentes existentes, em vez de 8 agentes novos.
