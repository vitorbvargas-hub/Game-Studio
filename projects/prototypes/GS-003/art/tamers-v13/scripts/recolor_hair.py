#!/usr/bin/env python3
"""Recolor hair pixels of a v13 Tamer sprite into the 8 canonical hair hexes
already used by the game's hair-recolor system (tamer-presets.ts / character.json
hairRecolors.options). Zero PixelLab generations -- pure local pixel remap.

Usage:
    python3 recolor_hair.py <input.png> <hair_rgb_source_hex> <out_dir> <id_prefix>

The source hair color is matched by nearest-neighbour within a tolerance (hair
is usually 2-4 shades: base, shadow, highlight) and remapped onto an equivalent
ramp for each target hue, preserving relative luminance so shading survives.
"""
import sys
from PIL import Image

HAIR_HEXES = {
    "preto": "#2B2B2B",
    "castanho": "#6B3A1F",
    "loiro": "#D9A441",
    "ruivo": "#B03A2E",
    "azul": "#1F6FB0",
    "verde": "#3E8E41",
    "roxo": "#7B4BA6",
    "prateado": "#C9CCCF",
}


def hex2rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def rgb2hsv(r, g, b):
    import colorsys

    return colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)


def hsv2rgb(h, s, v):
    import colorsys

    r, g, b = colorsys.hsv_to_rgb(h, s, v)
    return int(round(r * 255)), int(round(g * 255)), int(round(b * 255))


def recolor(im, source_hex, target_hex, tolerance=40):
    """Shift every pixel close to source_hex onto target_hex's hue/sat,
    keeping each pixel's own value (lightness) so shading bands survive."""
    src = hex2rgb(source_hex)
    th, ts, tv0 = rgb2hsv(*hex2rgb(target_hex))
    out = im.convert("RGBA").copy()
    px = out.load()
    w, h = out.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            dist = ((r - src[0]) ** 2 + (g - src[1]) ** 2 + (b - src[2]) ** 2) ** 0.5
            if dist <= tolerance:
                _, _, v = rgb2hsv(r, g, b)
                nr, ng, nb = hsv2rgb(th, ts, v)
                px[x, y] = (nr, ng, nb, a)
    return out


if __name__ == "__main__":
    src_png, source_hex, out_dir, prefix = sys.argv[1:5]
    im = Image.open(src_png)
    import os

    os.makedirs(out_dir, exist_ok=True)
    for name, hexcode in HAIR_HEXES.items():
        result = recolor(im, source_hex, hexcode)
        result.save(os.path.join(out_dir, f"{prefix}_{name}.png"))
        print(name, hexcode, "->", os.path.join(out_dir, f"{prefix}_{name}.png"))
