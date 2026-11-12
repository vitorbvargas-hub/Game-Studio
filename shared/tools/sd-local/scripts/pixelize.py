#!/usr/bin/env python3
"""Reduz imagem gerada por SD a uma grade real de pixels.

Pipeline: (opcional) remove fundo pela cor das bordas -> downscale para o tamanho alvo
(box para escolher a cor média de cada célula, depois sem suavização) -> quantização
para uma paleta fixa ou N cores -> alpha binário -> preview ampliado em nearest neighbor.

Uso: pixelize.py in.png out.png --size 32 [--palette pico8|gb|endesga32|path.hex|k16] [--transparent]
"""
import argparse
from pathlib import Path

import numpy as np
from PIL import Image

PALETTES = {
    # PICO-8 (16 cores, paleta pública amplamente usada)
    "pico8": "000000 1d2b53 7e2553 008751 ab5236 5f574f c2c3c7 fff1e8 ff004d ffa300 ffec27 00e436 29adff 83769c ff77a8 ffccaa",
    # 4 tons estilo handheld monocromático
    "gb": "0f380f 306230 8bac0f 9bbc0f",
    # ENDESGA 32 (Lospec, uso livre)
    "endesga32": "be4a2f d77643 ead4aa e4a672 b86f50 733e39 3e2731 a22633 e43b44 f77622 feae34 fee761 63c74d 3e8948 265c42 193c3e 124e89 0099db 2ce8f5 ffffff c0cbdc 8b9bb4 5a6988 3a4466 262b44 181425 ff0044 68386c b55088 f6757a e8b796 c28569",
}


def load_palette(spec):
    if spec is None:
        return None, 16
    if spec.startswith("k") and spec[1:].isdigit():
        return None, int(spec[1:])
    if spec in PALETTES:
        hexes = PALETTES[spec].split()
    else:
        hexes = [l.strip().lstrip("#") for l in Path(spec).read_text().splitlines() if l.strip() and not l.startswith(";")]
    return [tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) for h in hexes], len(hexes)


def remove_background(img, tol=40):
    """Flood-fill a partir das bordas usando a cor mediana da borda como fundo."""
    a = np.asarray(img.convert("RGB")).astype(int)
    h, w, _ = a.shape
    border = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    bg = np.median(border, axis=0)
    close = np.abs(a - bg).sum(axis=2) < tol
    mask = np.zeros((h, w), bool)
    stack = [(y, x) for y in (0, h - 1) for x in range(w)] + [(y, x) for x in (0, w - 1) for y in range(h)]
    while stack:
        y, x = stack.pop()
        if 0 <= y < h and 0 <= x < w and close[y, x] and not mask[y, x]:
            mask[y, x] = True
            stack += [(y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)]
    rgba = img.convert("RGBA")
    alpha = np.where(mask, 0, 255).astype(np.uint8)
    rgba.putalpha(Image.fromarray(alpha))
    return rgba


def pixelize(img, size, palette_spec=None, transparent=False):
    img = remove_background(img) if transparent else img.convert("RGBA")
    w, h = (size, size) if isinstance(size, int) else size
    small = img.resize((w, h), Image.Resampling.BOX)
    alpha = np.asarray(small.getchannel("A")) >= 128
    rgb = small.convert("RGB")
    pal, n = load_palette(palette_spec)
    if pal:
        pimg = Image.new("P", (1, 1))
        flat = [c for rgbc in pal for c in rgbc]
        pimg.putpalette(flat + flat[:3] * (256 - len(pal)))
        q = rgb.quantize(palette=pimg, dither=Image.Dither.NONE)
    else:
        q = rgb.quantize(colors=n, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    out = q.convert("RGBA")
    out.putalpha(Image.fromarray((alpha * 255).astype(np.uint8)))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src"); ap.add_argument("dst")
    ap.add_argument("--size", default="32", help="32 ou 32x48")
    ap.add_argument("--palette", default=None, help="pico8|gb|endesga32|arquivo.hex|k<N> (default k16)")
    ap.add_argument("--transparent", action="store_true")
    ap.add_argument("--preview-scale", type=int, default=8)
    a = ap.parse_args()
    size = tuple(map(int, a.size.split("x"))) if "x" in a.size else int(a.size)
    out = pixelize(Image.open(a.src), size, a.palette, a.transparent)
    out.save(a.dst)
    if a.preview_scale > 1:
        p = Path(a.dst)
        out.resize((out.width * a.preview_scale, out.height * a.preview_scale), Image.Resampling.NEAREST) \
           .save(p.with_name(p.stem + f"_x{a.preview_scale}" + p.suffix))
    print(a.dst, out.size, "cores:", len(set(c for c in out.getdata() if c[3])))


if __name__ == "__main__":
    main()
