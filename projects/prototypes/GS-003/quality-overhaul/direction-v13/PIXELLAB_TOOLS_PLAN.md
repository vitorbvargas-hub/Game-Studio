# PIXELLAB_TOOLS_PLAN — Digi Forest v13 ("GBA Clean"), GS-003

Autor: game-art (subagente) · Data: 2026-11-11 · Teto: 350 gerações (confirmado `get_balance`: 2000/2000 disponíveis no início do Tier 1).

## Âncora de estilo e paleta travada

- **Âncora:** `direction-v13/pixellab-test/pixen_clareira_ruinas_384x216.png` — o melhor resultado do teste v13 (cor chapada, contorno nítido, zero ruído/grain, zero luz volumétrica — bate com PokeIdleDex/site PixelLab). Upload único: `upload:762550fe-b675-49ef-bd63-5497e4539590`, reusado como `style_image` em todos os tilesets/props Pro/Pro Flash.
- **View:** `low top-down` em todos os tools que aceitam o parâmetro — câmera "3/4 clássica GBA/SNES" (Pokémon, referência §1 do brief master), compatível com os sprites oficiais Guilmon/Tamer (medidos no Style Bible §2.2 como quase-frontais/baixo ângulo).
- **Tile:** 32×32px — travado por `DIGIMON_STYLE_GUIDE.md` §2.1 ("não negociável nesta fase") e pela aprovação do Gate 1 citada na missão.
- **Paleta travada (hex, ~43 cores, herdada de `DIGIMON_STYLE_GUIDE.md` §3.2 + extensão documentada [H] para água e acentos Mundo Digital que o Style Bible descreve mas não fixa em hex):**
  outline `#181425` · dirt `#3f3025 #584531 #715b41 #8c7656` · grassA `#273f2b #38583a #51754b #72935b #95ad6d` · grassB `#2b432b #405d3d #5e7c52 #839c63 #a9b777` · grassShade `#1d3022 #2a432d #3a5938 #527044 #6d8351` · foliageDay extra `#111e16 #1b2e20 #cfdd8a` · stone `#474b54 #656b75 #8c9199` · moss `#445838 #49643c` · **[H nova] água** `#1a3550 #2a5a7a #3f84a8 #7ec8d8 #cfeef2` · **[H nova] cristal ciano** `#0b3d3d #157a7a #2bc4c4 #8ff0f0` · **[H nova] dado/âmbar** `#5a3a12 #a86a1e #e2993a #ffd37a` · **[H nova] acento magenta (raro)** `#7a2f5e #c957a0`.
  Passada como `palette` (+ `max_colors≈24`) em todo tool que aceita o parâmetro, para cumprir literalmente `DIGIMON_STYLE_GUIDE.md` §8.2 ("só Endesga-32 + ramps aprovados, nenhum hex novo solto") — as 3 extensões [H] (água/cristal/dado) ficam documentadas aqui como proposta de ramp a aprovar pelo diretor de arte, não hex solto inventado por asset.

## Mapeamento ferramenta → peça

| Peça | Ferramenta | Por quê |
|---|---|---|
| Tileset grama↔terra/trilha (base da família) | `create_topdown_tileset(mode=pro)` | Wang 16 tiles encadeável; define o `base_tile_id` de "grama" reusado nos 3 pares seguintes — é o único tool que encadeia terrenos via `lower_base_tile_id`/`upper_base_tile_id`, essencial para 4 pares conviverem num mapa sem costura. |
| Tileset grama↔água rasa (rio) | `create_topdown_tileset(mode=pro, upper_base_tile_id=<grama>)` | Reusa a grama já gerada; `transition_size≈0.25` dá margem de areia/seixo ao rio. |
| Tileset grama↔capim alto (encontro) | `create_topdown_tileset(mode=pro, upper_base_tile_id=<grama>)` | Mesmo mecanismo; terreno novo "capim alto" para a zona de emboscada. |
| Tileset grama↔platô de pedra (mirante) | `create_topdown_tileset(mode=pro, lower_base_tile_id=<grama>, transition_size≈0.5)` | `transition_size` cria a parede/banco elevado = a face do penhasco; mais barato e mais encadeável que `create_tiles_pro`'s `elevation` (que não teria o mesmo `base_tile_id` de grama). |
| Trilhas com junções (T, cruzamento, beco sem saída) | `create_path_tiles` | A trilha do brief tem ramificações reais (rota principal × 2 rotas secundárias convergindo); um Wang de 2 terrenos não desenha T-junções/cruzamento como peça própria — `create_path_tiles` tem essas 18 configs dedicadas. |
| Árvores (3 espécies), moitas, pedras, cogumelos, flores, tronco, ponte, placa, poste, totem, cristais, ruínas, portal, fogueira/fonte (imagem-base) | `create_object_pro_flash(n_directions=1)` | 1 direção basta (top-down, mundo principal não usa objetos giratórios); custo 5 gerações até 96px (metade de `create_1_direction_object`), aceita `style_image`+`palette`, tamanho customizado (múltiplos de 4) para props não-quadrados (ponte larga, poste alto). |
| Baú aberto (2º estado do fechado) | `create_object_state` | Garante que é **o mesmo baú**, não um 2º objeto parecido — identidade visual exigida pelo brief ("2º estado"). |
| Fogueira / fonte de cura / cristal — animação leve | `animate_object(mode=v3)` | Loop curto (8 frames) sobre o objeto já aprovado; v3 é o modo mais barato/rápido para "leve" (flicker/pulso), sem precisar de esqueleto. |
| Água do rio animada | — (não usado) | `animate_object`/`animate_image` operam sobre OBJETOS/imagens soltas, não sobre um tileset de terreno; não há tool para "animar" os 16 tiles Wang do rio sem recriá-los como objeto solto (perderia o autotile). Marcado como pendência honesta, §"se couber" do brief cumprido como "não coube" com justificativa técnica. |
| Mockup da clareira e visão geral do mapa | `create_map` + `edit_map` (path/rect) + `place_map_object` + `view_map`/`get_map(export)` | Monta de fato com os tilesets/props gerados (prova que a família funciona junto, não só imagens soltas); todas essas chamadas são **grátis** (só a geração dos tiles/props acima consome o teto). Guilmon/Tamer oficiais (não são assets PixelLab) entram depois, localmente, via composição Pillow sobre o render exportado — mesma técnica já usada e documentada em `DIRECTION_V13.md` §3 (nearest-neighbor ×N, nunca filtro suave). |
| Redução/trava final de paleta | `reduce_colors` (se necessário) | Só acionado se a inspeção visual final mostrar deriva de cor entre lotes gerados em chamadas diferentes; a `palette` fixa (acima) já deve prevenir a maior parte da deriva. |

## Por que não `create_building_kit` para o platô

Testado mentalmente e descartado: o building kit gera camadas de **tile group** (parede/piso/escada), que no `create_map`/`place_map_tiles` da API MCP **não se mistura** com um mapa semeado por terreno Wang (`add_group` de `place_map_tiles` exige que o mapa tenha nascido de `tile_group_id`, não de `tileset_id`) — misturar os dois exigiria 2 mapas ou um passo manual fora da API disponível aqui. A solução de `transition_size` dentro da própria família Wang (acima) resolve a face do penhasco sem esse custo de integração; a "rampa" de acesso ao mirante é resolvida como **prop dedicado** (rampa de terra/madeira) colocado no ponto de subida, mais simples e também encadeável no mesmo mapa via `place_map_object`.
