# Circuit Kit v1 (completo) — GS-003, UI "circuito digital"

Kit de UI tema HUD/circuito digital: cantos chanfrados, traços em L nos 4 cantos,
ciano = normal/ativo, âmbar = pressed/legendary, magenta = alerta. Primeira
entrega cobria só painel/botão/ícone/barra/divisor; esta completa o pedido
original: 3 níveis de moldura, estado bloqueado, PV + XP, selo de raridade,
notificação, emblema do Digivice e uma montagem de HUD com tudo junto.

## O que mudou vs. a primeira entrega
- **Paleta trocada para ByteLine-18 exata** (`art/PIXEL_ART_DIRECTION.md` §3) —
  a v1 usava uma paleta navy/ciano inventada por mim, parecida mas não idêntica
  à do projeto; agora é hex a hex a mesma paleta usada nas criaturas/UI do GS-003.
- `button_locked.png` (estado bloqueado, com cadeado).
- `icon_frame_tier{1,2,3}_{common,rare,legendary}.png` (3 níveis de moldura).
- `bar_fill_hp.png` (verde `volt`) e `bar_fill_xp.png` (ciano), além do
  `bar_frame.png` já existente.
- `rarity_seal_{common,rare,legendary}.png` (selo).
- `notification_badge.png` (magenta — "alerta de UI" no guia do projeto).
- `digivice_emblem.png` (emblema avulso, também usado na moldura do mapa-múndi).
- `hud_mockup.png` (320x180 — a mesma resolução interna do projeto, §2 do guia)
  com HP/XP + emblema, ícone raro + notificação, moldura lendária/comum/rara
  lado a lado com selo, e os 4 estados de botão numa barra — montagem simulada
  pedida pelo coordenador.

## Arquivos
| Arquivo | Tamanho | Descrição |
|---|---|---|
| `panel_9slice.png` | 96x64 | Painel/janela principal |
| `button_normal/hover/pressed/locked.png` | 64x20 | 4 estados de botão |
| `icon_frame_tier1_common.png` | 32x32 | Moldura nível 1 (comum, aço) |
| `icon_frame_tier2_rare.png` | 32x32 | Moldura nível 2 (rara, ciano) |
| `icon_frame_tier3_legendary.png` | 32x32 | Moldura nível 3 (lendária, âmbar, mais ornada) |
| `bar_frame.png` | 64x12 | Moldura de barra (serve p/ PV e XP) |
| `bar_fill_hp.png` | 60x8 | Preenchimento de PV (verde `volt`) |
| `bar_fill_xp.png` | 60x7 | Preenchimento de XP (ciano) |
| `rarity_seal_common/rare/legendary.png` | 20x20 | Selo de raridade |
| `notification_badge.png` | 16x16 | Indicador de notificação (magenta) |
| `digivice_emblem.png` | 24x24 | Emblema do Digivice |
| `divider.png` | 64x6 | Linha separadora |
| `hud_mockup.png` | 320x180 | Montagem simulada de HUD com todas as peças |
| `metadata.json` | — | Paleta, tamanhos e insets de 9-slice de cada peça |

## Paleta
100% ByteLine-18 do projeto, **nenhuma cor nova**: `ink #12121c`, `void #1d2238`,
`steel #3a4766`, `steelLt #6b7aa1`, `mist #aebbd6`, `paper #eef2fb`,
`cyan #3fe0d0` / `cyanDk #1c8b86` / `cyanLt #a4f7ef`, `magenta #e8459d` /
`magentaDk #8a2763`, `amber #ffd27a` / `amberDk #d99a33`, `volt #9df24a`,
`blood #e8465f`, `bgGrid #0c1024`.

## Uso sugerido
- `panel_9slice`: 9-slice `{8,8,8,8}`.
- `bar_fill_hp`: **a textura é verde (`volt`) fixo** — para PV crítico, a
  convenção do próprio guia do projeto (§3, "`blood` = barra de HP crítica")
  é tingir/trocar a cor em tempo real, não há uma 2ª textura vermelha cozida
  aqui (ver limitações).
- `icon_frame_tier*`: escolher pelo tier do item (comum/raro/lendário);
  compor `rarity_seal_*` no canto para reforçar visualmente.
- `button_locked`: usar quando a ação exigir requisito não cumprido (ex.: nível
  insuficiente), mesma lógica de `unlockState()` do mapa-múndi.

## Limitações
- **[H]** Nenhuma validação em engine real — só inspeção visual nesta sessão
  (incluindo zoom 4x da barra de botões e das 3 molduras lado a lado).
- `bar_fill_hp`/`bar_fill_xp` não têm variação de cor por valor (crítico/cheio)
  cozida na textura — depende de tint em runtime, como registrado acima.
- Selo de raridade usa um glow circular simples, não uma estrela nítida
  (o pico de 1px por ponta quase não aparece em 20px) — funciona como
  indicador de nível, mas não é um ícone de estrela desenhado à mão.
- Sem glifos de texto/número (PV 24/30, etc.) — fora do escopo deste kit visual.
- `hud_mockup.png` é só montagem/demo; não testado dentro do Phaser do protótipo.

## Regenerar
```
python3 generate_circuit_kit.py
```
