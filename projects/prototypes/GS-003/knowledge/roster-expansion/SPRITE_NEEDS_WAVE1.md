# SPRITE_NEEDS_WAVE1 — arte faltante para a Onda 1 (Floresta Densa)

- **Autor:** game-research (subagente) · **Data:** 2026-11-09
- **Base:** `roster_expansion.json` (25 espécies novas), `art/FAN_SPRITE_SOURCES.md` (inventário de fontes de fã já feito pelo game-art), `art/sprites/digimon-fan/` (sprites próprios já existentes no repo).
- **Regra de licença (ADR-007 regra 2 emendada + `art/FAN_SPRITE_SOURCES.md`):** só sprite próprio do estúdio, ou sprite de fã com licença clara e crédito em `CREDITS.md`. Nunca rip oficial, nunca redistribuição de rip.

## 1. Checagem contra o que já existe no repositório

**[E]** `art/sprites/digimon-fan/` só tem frames (idle/walk/attack/hit) para **5 monstros**: Agumon, Gabumon, Koromon, Patamon, Tokomon, Tsunomon. **Nenhuma das 25 espécies novas desta onda tem sprite no repositório.** Confirmado por listagem direta do diretório nesta sessão.

**[E]** `art/FAN_SPRITE_SOURCES.md` (inventário de fontes de fã, 2026-11-08) cobriu só o pack de referência de 10 monstros: Koromon, Tsunomon, Tokomon, Agumon, Gabumon, Patamon, Greymon, Garurumon, Angemon, Devimon. **Nenhuma das 25 espécies novas foi avaliada nesse inventário** — logo, para todas elas a disponibilidade de fonte de fã é **"não verificada"**, não "inexistente". Antes de gerar arte nova por IA, vale repetir a checagem do inventário (Digimon Pixels / Happy Galgomon / DragonRod Art) especificamente para estes 25 nomes, já que várias são formas icônicas de Adventure 01 (Birdramon, Garudamon, Phoenixmon, Togemon, Lillymon, Rosemon, Kabuterimon, MegaKabuterimon, HerculesKabuterimon, WarGreymon, MetalGarurumon, Seraphimon, Gallantmon) com alta chance de cobertura nessas galerias — mesma observação que o inventário já fez para Greymon/Garurumon/Angemon.

## 2. Ordem de prioridade (selvagens do piloto primeiro, conforme pedido)

A ordem segue: (1) selvagens já visíveis no mapa do piloto (papel `selvagem comum`/`selvagem raro`), (2) formas que o jogador vai ver evoluindo em pouco tempo de jogo (In-Training/Baby, loop curto), (3) formas de evolução tardia (Ultimate/Mega, `evolucao_apenas`, não aparecem como spawn selvagem no piloto).

### Prioridade 1 — selvagens do piloto (aparecem no mapa, vistas por todo jogador desde o primeiro minuto)

| # | Espécie | Papel | Estágio | Frames mínimos (padrão do repo) |
|---|---|---|---|---|
| 1 | Yokomon (`RX-YOKOMON`) | selvagem comum | In-Training | idle, walk, attack, hit (seguir padrão de `tokomon_*` já existente) |
| 2 | Motimon (`RX-MOTIMON`) | selvagem comum | In-Training | idle, walk, attack, hit |
| 3 | Birdramon (`RX-BIRDRAMON`) | selvagem raro | Champion | idle, walk, attack, hit (sprite maior, estilo `growlmon`/`greymon` ainda não gerado no repo — checar se já existe fora de `digimon-fan/`) |
| 4 | Togemon (`RX-TOGEMON`) | selvagem raro | Champion | idle, walk, attack, hit |
| 5 | Kabuterimon (`RX-KABUTERIMON`) | selvagem raro | Champion | idle, walk, attack, hit |

### Prioridade 2 — Baby/filhotes (NPCs já existem como arte? **Não.**)

**[E]** `content/bosses.json` lista Botamon/Punimon/Poyomon/Yuramon como NPCs da Vila dos Bebês, mas **nenhum deles tem arquivo de sprite referenciado em `world-species.json` ou em `art/sprites/`** — são citados só por nome/stage no JSON de conteúdo. Ou seja, mesmo os 4 "bebês" que já existem conceitualmente no jogo **não têm arte nenhuma hoje**.

| # | Espécie | Papel | Estágio |
|---|---|---|---|
| 6 | Botamon (`RX-BOTAMON`) | NPC parceiro / filhote raro | Baby |
| 7 | Punimon (`RX-PUNIMON`) | NPC parceiro / filhote raro | Baby |
| 8 | Poyomon (`RX-POYOMON`) | NPC parceiro / filhote raro | Baby |
| 9 | Yuramon (`RX-YURAMON`) | NPC parceiro / filhote raro | Baby |
| 10 | Jyarimon (`RX-JYARIMON`) | selvagem raro (filhote) | Baby |

Frames mínimos para Baby: idle + 1 pose extra (baixa prioridade de animação de combate — formas Baby tradicionalmente não lutam ativamente na franquia; confirmar com game-design se Baby é jogável em combate ou só decorativo/evolutivo).

### Prioridade 3 — formas de evolução tardia (Ultimate/Mega, não aparecem como spawn selvagem no piloto, mas o jogador vai VER a tela de evolução do seu próprio Digimon)

Estas têm prioridade de arte **menor** porque não aparecem no mapa do piloto (papel `evolucao_apenas`, `floresta_densa` level 1-15 não comporta spawn delas), mas ainda precisam de ao menos 1 pose (idle) para a tela de evolução funcionar visualmente.

| # | Espécie | Estágio | Linha |
|---|---|---|---|
| 11 | MetalGreymon (`RX-METALGREYMON`) | Ultimate | Agumon |
| 12 | WarGreymon (`RX-WARGREYMON`) | Mega | Agumon |
| 13 | WereGarurumon (`RX-WEREGARURUMON`) | Ultimate | Gabumon |
| 14 | MetalGarurumon (`RX-METALGARURUMON`) | Mega | Gabumon |
| 15 | MagnaAngemon (`RX-MAGNAANGEMON`) | Ultimate | Patamon |
| 16 | Seraphimon (`RX-SERAPHIMON`) | Mega | Patamon |
| 17 | WarGrowlmon (`RX-WARGROWLMON`) | Ultimate | Guilmon |
| 18 | Gallantmon (`RX-GALLANTMON`) | Mega | Guilmon |
| 19 | Dorugoramon (`RX-DORUGORAMON`) | Mega | Dorumon |
| 20 | Garudamon (`RX-GARUDAMON`) | Ultimate | Biyomon |
| 21 | Phoenixmon (`RX-PHOENIXMON`) | Mega | Biyomon |
| 22 | Lillymon (`RX-LILLYMON`) | Ultimate | Palmon |
| 23 | Rosemon (`RX-ROSEMON`) | Mega | Palmon |
| 24 | MegaKabuterimon (`RX-MEGAKABUTERIMON`) | Ultimate | Tentomon |
| 25 | HerculesKabuterimon (`RX-HERCULESKABUTERIMON`) | Mega | Tentomon |

## 3. Recomendação de caminho por item (antes de gastar geração PixelLab)

1. Para os itens 1–10 (selvagens + bebês do piloto): **checar primeiro** Digimon Pixels / Happy Galgomon / DragonRod Art (mesmo processo de `FAN_SPRITE_SOURCES.md`) antes de gerar — são formas muito comuns em arte de fã de Adventure 01.
2. Teto de créditos PixelLab do Map Factory é **40 no total** (ADR-011 §4) e ferramentas de 10–25 créditos (as que geram sprite 8-direções de qualidade, `create_1_direction_object`/pro) **estão vetadas sem nova aprovação**. Isso por si só é um limitador forte: 25 espécies × animações completas não cabem no orçamento atual sem reaproveitar fonte de fã ou pedir novo teto ao fundador.
3. Para os itens 11–25 (Ultimate/Mega, `evolucao_apenas`): como não aparecem no mapa do piloto, **não são bloqueio para a aceitação do piloto "Digimon Forest — Prototype 01"** (critério de aceite em `docs/briefing/12_map_factory_v2.md` §7 fala de spawns/NPCs no mapa, não da lista completa de evolução) — podem ficar para depois da aprovação visual do fundador.

## 4. Limitações

- Não baixei nem gerei nenhum sprite nesta tarefa (fora de escopo — pesquisa e dados, não arte).
- Não reavaliei as galerias de fã (Digimon Pixels etc.) monstro a monstro para os 25 nomes novos — só apontei que isso precisa ser feito, reaproveitando a metodologia já documentada em `FAN_SPRITE_SOURCES.md` §1.
- Não tenho acesso a `shared/tools/map-factory/logs/pixellab-usage.csv` nem a `get_balance` nesta sessão de pesquisa — não sei o saldo atual de créditos PixelLab restante do teto de 40.
