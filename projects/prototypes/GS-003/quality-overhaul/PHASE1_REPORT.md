# Quality Overhaul — Relatório da Fase 1 (Diagnóstico)

- **Data:** 2026-11-09 · **Coordenação:** game-studio · **Base:** ADR-012, GS-008/009/010/011/012.
- **Fontes:** `audit/VISUAL_AUDIT.md` (game-art, diretor de arte), `audit/TECH_AUDIT.md` (game-dev), `audit/UI_WORLD_AUDIT.md` (game-design), `audit/FOUNDER_VIDEOS_NOTES.md` (coordenador, sobre os 2 vídeos do fundador), `ART_DIRECTION_V2.md`, `UI_DIRECTION_V2.md`.

## 1. Estado atual
- O jogo roda: Canvas 2D próprio (TS + Vite), 299 testes verdes, combate no mapa, evolução com escolha, mapa-múndi, portais e save. O look v8 (luz, névoa, paleta escura) existe, mas só atrás de `?look=v8`.
- **Gargalo: conteúdo de animação e escala.** O motor não é o problema (~4–6 ms por quadro, ~57 fps em headless).

## 2. Agentes e papéis
Tabela no ADR-012: game-art = diretor de arte e artistas; game-dev = engenharia, mapa e integração; game-design = UI/UX e composição; game-qa = QA visual; game-research = referências.

## 3. Ferramentas [E]
| Ferramenta | Estado | Serve para |
|---|---|---|
| PixelLab (MCP) | ok, trial, **26 gerações** | sprites e animação. Estimativa [H]: dá para ~1 Digimon completo, não 3 |
| ComfyUI + SD 1.5 local | ok (RTX 2060) | conceito e paleta. Não mantém consistência entre quadros |
| Pipeline local (Canvas.js, workbench) | ok, sem custo | tiles, props, recolor, kitbash |
| Chromium headless + ffmpeg do Playwright | ok, com libs em /tmp | capturas e vídeo WebM |
| Tiled / LDtk / Aseprite | não instalados | — (os mapas são gerados por código) |

## 4. Diagnóstico
**Personagem (Tamer):** precisa ser refeito. Dos 9 estados só existe o walk, mecânico, e o idle é um quadro congelado.
**Digimon:** todos usam o mesmo template de animação. Idle tem 1 quadro + bob de 1 px, walk tem 2–4 quadros, ataque e dano só para o oeste (reduzidos da pose de batalha), e os selvagens não têm ataque nem dano. O quadrúpede (Dorumon) não tem norte e o voador (Tentomon) anda com pernas. Viola o GS-010 §3.
**Escala [E, vídeos do fundador]:** Tamer e Digimon com ~20–28 px de altura numa tela de 1920 (<3%). Ilegíveis. Escalas misturadas (WarGreymon ×2, quadros reduzidos ao lado de originais) e pixels desiguais em monitores a 125–150%.
**Mapas:** o v8 já está perto da linguagem do Drakantos, mas não é o padrão. Falta primeiro plano real (`objects_above` vazio), falta vida ambiental (água parada, nada balança) e há luzes demais e fortes demais no v8.
**VFX:** ataque quase inexistente. A evolução é genérica.
**UI:** cara de "dashboard admin" (mesma `.panel` para tudo, sem hierarquia, sem cor por elemento). Evolução e lógica do mapa-múndi já cumprem o GS-010/009, só falta acabamento visual. **Bug:** a Praia renderiza tiles com textura ausente.
**GS-009:** mapa-múndi, viagem, persistência e regiões já existem. Falta o mapa ilustrado com miniaturas e consertar a Praia.

## 5. Limitações técnicas (TECH_AUDIT)
| # | Limitação | Correção mínima | Esforço [H] |
|---|---|---|---|
| L1 | Quase sem arte de animação | produção de arte (Fase 3) | alto |
| L2 | 8 estados, sem transições, skill = attack | controlador de animação só visual, atrás de `?anim=v2` | 2–3 d |
| L3 | 4 direções, leste = oeste espelhado | 8 direções na view | ~1 d |
| L4 | Sem primeiro plano nem vida ambiental | camada `objects_above` + água/vento animados, atrás de flag | 2–3 d |
| L5 | DPR/escala inconsistente | `?dpr=1` + escala unificada | 0,5 d |

## 6. Piloto escolhido (diretor de arte + design)
- **Região:** Clareira Central + riacho com ponte (~30×20 tiles) do Digimon Forest 01.
- **Elenco:** Tamer + **Guilmon** (bípede), **Dorumon** (quadrúpede), **Tentomon** (voador). Todos já nascem nessa zona.

## 7. Plano priorizado
| Ordem | Entregável | Resp. | Depende | Estimativa [H] |
|---|---|---|---|---|
| P1 | Ambiente seguro: tag `pre-quality-overhaul`, branch/worktree `quality-overhaul`, backup .tgz dos assets | game-dev | — | 0,5 d |
| P2 | Escala e câmera: personagens a ~8–10% da altura da tela, `?dpr=1` | game-dev + aprovação do diretor | P1 | 0,5–1 d |
| P3 | Controlador de animação v2 (estados + transições), primeiro plano, água/vento | game-dev | P1 | 4–6 d |
| P4 | Padrão de animação por anatomia + spec de quadros por estado | game-art | — | 1 d |
| P5 | Tamer refeito (9 estados) | game-art (+PixelLab) | P4 | 3–5 d |
| P6 | Guilmon, Dorumon e Tentomon (anatomias próprias) | game-art (+PixelLab) | P4 | 2–4 d cada |
| P7 | Clareira piloto recomposta (FG/vida, luzes com propósito) | game-art + game-design + game-dev | P3 | 3–4 d |
| P8 | HUD e painéis v2 | game-design + game-dev | — | 4–6 d |
| P9 | Encontros selvagens (GS-012) na clareira | game-dev + game-design | P3 | 4–6 d |
| P10 | Homologação: vídeo, antes/depois, notas | game-qa + diretor | todos | 1–2 d |
Total [H]: ~4–6 semanas de agente, considerando o limite de 4 tarefas simultâneas.

## 8. Decisões do fundador
1. **Orçamento de arte:** 26 gerações do PixelLab dão para ~1 Digimon completo. Para 1 Tamer + 3 Digimon com 9 estados é preciso mais créditos (comprar exige a sua aprovação) ou aceitar produção local (mais lenta, qualidade a validar).
2. **Promover o look v8 a padrão agora** (custo zero, reversível)?
