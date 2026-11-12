#!/usr/bin/env python3
"""Draw 2 small Digimon-world props by hand (no PixelLab budget left),
in the same clean flat GBA style as the v13 direction: solid color bands,
single dark outline, no gradient/noise. Outputs native small canvas +
5x nearest-neighbor upscale (same integer zoom used for the mockup)."""
from PIL import Image

OUTLINE = (20, 18, 32, 255)  # #181425-ish, matches style bible outline note


def px(draw_img, rows, palette, ox=0, oy=0):
    w = max(len(r) for r in rows)
    for y, row in enumerate(rows):
        for x, c in enumerate(row):
            if c == ".":
                continue
            draw_img.putpixel((ox + x, oy + y), palette[c])


def make_canvas(w, h):
    return Image.new("RGBA", (w, h), (0, 0, 0, 0))


# ---------------------------------------------------------------
# 1) Data crystal cluster ("cristal de dados") — faceted gem, stepped
#    silhouette (classic low-res gem technique), cyan/teal data-accent.
# ---------------------------------------------------------------
crystal_palette = {
    "o": OUTLINE,
    "d": (20, 80, 110, 255),   # dark facet
    "m": (40, 144, 200, 255),  # mid facet  (#2890c8 family, style bible accent)
    "l": (120, 216, 232, 255),  # light facet
    "h": (232, 251, 255, 255),  # highlight glint
    "g": (39, 63, 43, 255),   # grass-shadow base tuft (#273f2b, style bible grassFamilyA)
    "G": (81, 117, 75, 255),  # grass mid (#51754b)
}
crystal_rows = [
    "..ooo..",
    ".oldmo.",
    "oldmmho",
    "oldmmmo",
    "o.dmmo.",
    ".odmo..",
    ".ommo..",
    ".ogGo..",
    "oGggGo.",
]
crystal_w = max(len(r) for r in crystal_rows)
crystal_h = len(crystal_rows)
crystal = make_canvas(crystal_w, crystal_h)
px(crystal, crystal_rows, crystal_palette)
crystal.save("/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/quality-overhaul/direction-v13/assets/prop_data_crystal_native.png")
crystal_5x = crystal.resize((crystal_w * 5, crystal_h * 5), Image.NEAREST)
crystal_5x.save("/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/quality-overhaul/direction-v13/assets/prop_data_crystal_5x.png")

# ---------------------------------------------------------------
# 2) Digital totem/post ("poste digital") — dark stone shaft, glowing
#    cyan ring/orb on top, small moss accent at base.
# ---------------------------------------------------------------
totem_palette = {
    "o": OUTLINE,
    "D": (63, 48, 37, 255),    # dark wood/stone base (#3f3025)
    "S": (71, 75, 84, 255),   # stone mid (#474b54)
    "s": (140, 145, 153, 255),  # stone light (#8c9199)
    "c": (40, 144, 200, 255),  # cyan ring mid
    "C": (120, 216, 232, 255),  # cyan ring light
    "H": (232, 251, 255, 255),  # glow highlight
    "k": (68, 88, 56, 255),   # moss (#445838)
}
totem_rows = [
    "..ooo..",
    ".oCHCo.",
    "ocCCCco",
    ".occo..",
    "..oSo..",
    "..oSo..",
    ".osSo..",
    ".osSo..",
    "oosSoo.",
    "oDDDDo.",
    "oDkkDo.",
    ".oooo..",
]
totem_w = max(len(r) for r in totem_rows)
totem_h = len(totem_rows)
totem = make_canvas(totem_w, totem_h)
px(totem, totem_rows, totem_palette)
totem.save("/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/quality-overhaul/direction-v13/assets/prop_digital_totem_native.png")
totem_5x = totem.resize((totem_w * 5, totem_h * 5), Image.NEAREST)
totem_5x.save("/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/quality-overhaul/direction-v13/assets/prop_digital_totem_5x.png")

print("crystal native", crystal.size, "totem native", totem.size)
print("done")
