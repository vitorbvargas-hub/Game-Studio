// Kit de UI "circuito digital" do game-art (art/ui/circuit-kit-v1, ver metadata.json) no HUD v2 (?hud=v2).
// As peças viram variáveis CSS no #hud (--ck-*), e o style.css as usa como border-image (9-slice) e fundo, sempre
// escopado em .hud-v2. Sem a flag nada disso é aplicado. Escala de pixel: 2× para painéis, botões, molduras e
// barras (insets do metadata × 2); o selo de notificação fica em 1× (16 px) para caber no aro de 64 px do hub.

import barFill from "../../../../art/ui/circuit-kit-v1/bar_fill_hp.png?url";
import barXp from "../../../../art/ui/circuit-kit-v1/bar_fill_xp.png?url";
import barFrame from "../../../../art/ui/circuit-kit-v1/bar_frame.png?url";
import btnHover from "../../../../art/ui/circuit-kit-v1/button_hover.png?url";
import btnLocked from "../../../../art/ui/circuit-kit-v1/button_locked.png?url";
import btnNormal from "../../../../art/ui/circuit-kit-v1/button_normal.png?url";
import btnPressed from "../../../../art/ui/circuit-kit-v1/button_pressed.png?url";
import emblem from "../../../../art/ui/circuit-kit-v1/digivice_emblem.png?url";
import divider from "../../../../art/ui/circuit-kit-v1/divider.png?url";
import frame1 from "../../../../art/ui/circuit-kit-v1/icon_frame_tier1_common.png?url";
import frame2 from "../../../../art/ui/circuit-kit-v1/icon_frame_tier2_rare.png?url";
import frame3 from "../../../../art/ui/circuit-kit-v1/icon_frame_tier3_legendary.png?url";
import badge from "../../../../art/ui/circuit-kit-v1/notification_badge.png?url";
import panel from "../../../../art/ui/circuit-kit-v1/panel_9slice.png?url";
import sealLegendary from "../../../../art/ui/circuit-kit-v1/rarity_seal_legendary.png?url";

/** Peça do kit → variável CSS. */
export const CIRCUIT_KIT: Record<string, string> = {
  panel,
  "btn": btnNormal,
  "btn-hover": btnHover,
  "btn-pressed": btnPressed,
  "btn-locked": btnLocked,
  "frame1": frame1,
  "frame2": frame2,
  "frame3": frame3,
  "bar": barFrame,
  "bar-hp": barFill,
  "bar-xp": barXp,
  badge,
  emblem,
  divider,
  "seal-legendary": sealLegendary,
};

/** Liga o kit num container (o #hud do v2): define --ck-<peça>: url(...). */
export function applyCircuitKit(el: HTMLElement): void {
  for (const [k, url] of Object.entries(CIRCUIT_KIT)) el.style.setProperty(`--ck-${k}`, `url("${url}")`);
  el.dataset.kit = "circuit-v1";
}
