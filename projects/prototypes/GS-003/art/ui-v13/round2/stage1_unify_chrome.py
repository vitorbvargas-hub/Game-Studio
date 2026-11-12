#!/usr/bin/env python3
"""Rodada 2 - Stage 1: unifica TODO o chrome (paineis/botoes/abas/barras/hub)
na familia azul-petroleo (tier2 "Digivice") e numa paleta so.

- Remove o texto cozido ("BUTTON") de dentro do botao (flood-fill local, sem IA)
  para nunca mais esticar texto via 9-slice (causa do "botao borrado").
- Faz snap de cor local (nearest-neighbor na paleta canonica) em todo chrome.
- Gera 3 variantes de nivel (comum/raro/lendario) do MESMO frame com uma gema
  de canto (bronze/ciano/ouro) em vez de 3 frames de IA diferentes.
Nunca usa interpolacao em upscale (so NEAREST), conforme Style Bible.
"""
import os
from collections import Counter
from PIL import Image

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(BASE)  # ui-v13/
OUT = os.path.join(BASE, "out")
os.makedirs(os.path.join(OUT, "panels"), exist_ok=True)
os.makedirs(os.path.join(OUT, "buttons"), exist_ok=True)
os.makedirs(os.path.join(OUT, "bars"), exist_ok=True)
os.makedirs(os.path.join(OUT, "hub"), exist_ok=True)
os.makedirs(os.path.join(OUT, "gems"), exist_ok=True)

PALETTE_HEX = [
    "#000205", "#131a35", "#121932", "#0c2956", "#114a55", "#17454c",
    "#164851", "#146160", "#1da69a", "#23b9b1", "#3befdd", "#76888e",
    "#8c999d", "#e8ead6", "#efebd0",
]
PALETTE_RGB = [tuple(int(h[i:i+2], 16) for i in (1, 3, 5)) for h in PALETTE_HEX]


def nearest(rgb, palette=PALETTE_RGB):
    r, g, b = rgb
    best, bd = palette[0], 1e18
    for p in palette:
        d = (p[0]-r)**2 + (p[1]-g)**2 + (p[2]-b)**2
        if d < bd:
            bd, best = d, p
    return best


def snap_to_palette(im, tolerance=900):
    """Snap every opaque pixel to the nearest canonical color, but only when
    it is already close (tolerance) -- keeps gem accents / functional bar
    fills (HP green, etc.) that are deliberately outside this chrome palette."""
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    cache = {}
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            key = (r, g, b)
            if key not in cache:
                n = nearest(key)
                d = (n[0]-r)**2 + (n[1]-g)**2 + (n[2]-b)**2
                cache[key] = n if d <= tolerance else key
            nr, ng, nb = cache[key]
            px[x, y] = (nr, ng, nb, a)
    return im


def mode_color(im, box):
    x0, y0, x1, y1 = box
    c = Counter()
    px = im.load()
    for y in range(y0, y1):
        for x in range(x0, x1):
            c[px[x, y]] += 1
    return c.most_common(1)[0][0]


def clean_button_text(im, insets=(8, 8, 8, 8)):
    """Flood-fill the button's flat interior to erase baked label pixels,
    so the frame can be 9-sliced to any width without ever stretching text."""
    im = im.convert("RGBA")
    w, h = im.size
    l, r, t, b = insets
    fill = mode_color(im, (l, t, w - r, h - b))
    px = im.load()
    for y in range(t, h - b):
        for x in range(l, w - r):
            if px[x, y][3] > 0:
                px[x, y] = fill
    return im


Z = os.path.join(BASE, "tier2_zip", "panel_tier2_rare")

panel = Image.open(os.path.join(Z, "elements", "element_1.png")).convert("RGBA")
tab = Image.open(os.path.join(Z, "elements", "element_3.png")).convert("RGBA")
bar_deco = Image.open(os.path.join(Z, "elements", "element_4.png")).convert("RGBA")
btn_normal = Image.open(os.path.join(Z, "elements", "Button", "Button.png")).convert("RGBA")
btn_hover = Image.open(os.path.join(Z, "elements", "Button", "hover.png")).convert("RGBA")
btn_pressed = Image.open(os.path.join(Z, "elements", "Button", "pressed.png")).convert("RGBA")
btn_locked = Image.open(os.path.join(Z, "elements", "Button", "locked.png")).convert("RGBA")

# 1) snap every chrome piece onto the canonical palette (free, local)
panel = snap_to_palette(panel)
tab = snap_to_palette(tab)
bar_deco = snap_to_palette(bar_deco)
btn_normal = snap_to_palette(btn_normal)
btn_hover = snap_to_palette(btn_hover)
btn_pressed = snap_to_palette(btn_pressed)
btn_locked = snap_to_palette(btn_locked)

panel.save(os.path.join(OUT, "panels", "panel_unified.png"))
tab.save(os.path.join(OUT, "panels", "tab_unified.png"))
bar_deco.save(os.path.join(OUT, "bars", "bar_frame_unified.png"))

# 2) erase the baked "BUTTON" label -> textless, safely 9-sliceable buttons
btn_normal_clean = clean_button_text(btn_normal, (8, 8, 8, 8))
btn_hover_clean = clean_button_text(btn_hover, (8, 8, 8, 8))
btn_pressed_clean = clean_button_text(btn_pressed, (8, 8, 8, 8))
btn_locked_clean = clean_button_text(btn_locked, (8, 8, 8, 8))

btn_normal_clean.save(os.path.join(OUT, "buttons", "button_unified_normal.png"))
btn_hover_clean.save(os.path.join(OUT, "buttons", "button_unified_hover.png"))
btn_pressed_clean.save(os.path.join(OUT, "buttons", "button_unified_pressed.png"))
btn_locked_clean.save(os.path.join(OUT, "buttons", "button_unified_locked.png"))

# 3) hub states -> snap to the same palette
for name in ["hub_closed", "hub_notification", "hub_boss_active"]:
    im = Image.open(os.path.join(ROOT, "hub", f"{name}.png")).convert("RGBA")
    im = snap_to_palette(im, tolerance=1600)
    im.save(os.path.join(OUT, "hub", f"{name}.png"))

# 4) tier gems -> cut the 3x 32x32 gems out of the sheet
gems_sheet = Image.open(os.path.join(BASE, "tier_gems_96x32.png")).convert("RGBA")
names = ["bronze", "cyan", "gold"]
gems = {}
for i, n in enumerate(names):
    g = gems_sheet.crop((i * 32, 0, i * 32 + 32, 32))
    g.save(os.path.join(OUT, "gems", f"gem_{n}.png"))
    gems[n] = g

# 5) 3-tier panel/tab/bar variants = the SAME unified frame + a corner gem
GEM_SIZE = 14
gem_small = {n: g.resize((GEM_SIZE, GEM_SIZE), Image.NEAREST) for n, g in gems.items()}

tier_map = {"tier1_common": "bronze", "tier2_rare": "cyan", "tier3_legendary": "gold"}

for tier, gem_name in tier_map.items():
    p = panel.copy()
    p.alpha_composite(gem_small[gem_name], (14, 14))
    p.save(os.path.join(OUT, "panels", f"panel_{tier}.png"))

    t = tab.copy()
    gs = gem_small[gem_name].resize((10, 10), Image.NEAREST)
    t.alpha_composite(gs, (6, (t.height - 10) // 2))
    t.save(os.path.join(OUT, "panels", f"tab_{tier}.png"))

    bd = bar_deco.copy()
    gs2 = gem_small[gem_name].resize((12, 12), Image.NEAREST)
    bd.alpha_composite(gs2, (5, (bd.height - 12) // 2))
    bd.save(os.path.join(OUT, "bars", f"bar_frame_{tier}.png"))

print("stage1 done")
print("panel size", panel.size, "button size", btn_normal_clean.size, btn_hover_clean.size)
