# TAMERS_V13 — Tamers jogáveis, estilo "GBA Clean" (GS-003)

Relançamento: retomado após queda por limite de uso. Antes de gerar qualquer coisa, esta sessão rodou `list_characters`, `list_jobs(include_recent=true)` e `get_character` em todos os 13 personagens com "Tamer" no nome e reaproveitou 100% do trabalho parcial já pago (nenhum personagem foi recriado do zero).

## Estado encontrado ao retomar

12 presets + 1 âncora rejeitada (chibi, 48x48, mantida só como referência) já existiam no PixelLab, todos 8 direções / 36x36 / estilo v13:

| Preset | Walk antes | Idle antes | Faltava |
|---|---|---|---|
| Coragem (âncora), Amizade, Determinação | 8/8 dir | 8/8 dir | nada |
| Amor, Esperança | 5/8 dir (south,north,east,SE,NE) | 8/8 dir | só espelhar walk (W/SW/NW) |
| Vínculo | 3/8 dir (east,north,south) | 8/8 dir | gerar SE,NE + espelhar walk |
| Raposa | 1/8 dir (south) | 5/8 dir | gerar 4 dir walk + espelhar walk e **idle** (idle W/SW/NW também faltavam e não tinham sido espelhados) |
| Vento | 1/8 dir (south) | 4/8 dir | gerar 4 dir walk + 1 dir idle (NE) + espelhar ambos |
| Fúria, Xeno, Vanguarda, Chama | 1/8 dir (south) | 1/8 dir (south) | gerar 4 dir em cada clipe + espelhar ambos |

## Trabalho desta sessão

Pipeline mantido igual ao já usado nos personagens completos (consistência de estilo dentro de cada personagem): `animate_character(mode="template", template_animation_id="walking"|"breathing-idle", animation_group_id=<grupo existente>, directions=[...])` gera só as 5 direções "fonte" (south, north, east, south-east, north-east); as 3 direções espelháveis (west, south-west, north-west) vêm de `mirror_animation` (grátis), **sem pagar geração nova**. Inspeção visual (rotação vs. frames de walk) não mostrou encolhimento nem perda de contato do pé — o pipeline de referência pedido no relançamento (v3+custom_start_frame) não foi necessário porque o método template já em uso nos personagens completos estava estável.

Resultado: **todos os 12 presets agora têm walk + idle completos nas 8 direções** (16 animações cada, confirmado via `list_characters`).

### Gasto

- **43 gerações pagas** (`animate_character`, 1 geração/direção a 36px): Fúria 8, Xeno 8, Vanguarda 8, Chama 8, Vento 5, Raposa 4, Vínculo 2, Esperança 0, Amor 0.
- **44 `mirror_animation`** (grátis) para preencher west/south-west/north-west em todos os clipes incompletos.
- **4 `pixelart_workbench`** (scale ×3, join ×1) para montar a prancha de escala — ferramenta de pixel-art local, sem custo de geração.
- Teto da tarefa: 100 gerações. **Usado: 43/100.** (saldo da conta, compartilhado com outros agentes, caiu de 849.97→739.97 generations_remaining no período; a diferença além das 43 é trabalho concorrente de outra sessão, não desta tarefa — `list_jobs` mostrou IDs de job que esta sessão nunca disparou.)

## Saídas

- `sheets/coragem/rotations/` — rotações da âncora (pré-existente).
- `boards/tamers_v13_grid_12_presets.png` — grade 4×3 dos 12 presets (south), pré-existente, ainda válida (south não foi alterado nesta sessão).
- `boards/tamers_v13_scale_comparison.png` — **nova**: Tamer v13 Coragem (south) × Tamer atual TAMER-0003 (oficial, SE) × Guilmon oficial DS CREATURE-0003 (S), todos ampliados ×8 nearest-neighbour no mesmo canvas, lado a lado. Mostra o v13 nitidamente maior/mais limpo que o Tamer atual e em escala compatível com o Guilmon oficial (corpo ~30-34px nativo em ambos).
- Este arquivo, `TAMERS_V13.md`.
- IDs dos 12 personagens completos (8dir/36x36/16anim): ver `scripts/character_ids.json`.

## Limitações

1. **Tensão de escopo registrada no plano anterior (não resolvida por mim):** o Tamer (personagem humano) recebeu arte nova via IA nesta entrega por instrução explícita do fundador; o Style Bible (`quality-overhaul/phase3/style-bible/DIGIMON_STYLE_GUIDE.md` §2.5) recomendava manter o Tamer no sprite oficial sem redesenho. Fica para homologação do fundador/Art Director.
2. **Sombra elíptica e contorno:** verificados visualmente nas pranchas (contorno preto único, cores chapadas), mas não há teste automatizado de paleta travada entre os 12 presets — cada preset ainda usa a paleta que a IA escolheu por conta própria; a etapa de recolor de cabelo por hex fixo (`scripts/recolor_hair.py`, 8 cores do sistema atual) está pronta mas **não foi rodada nesta sessão** (fora do escopo pedido: "melhorar os jogáveis… walk e idle"; a pasta `recolor/` está vazia).
3. Não toquei no jogo (regra do escopo respeitada) nem em nenhuma pasta fora de `art/tamers-v13/`.
4. Imagens de referência oficiais (Tamer atual, Guilmon DS) usadas apenas para medição/comparação local, nunca re-hospedadas publicamente nem usadas como estilo de geração.
