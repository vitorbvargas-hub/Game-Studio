#!/usr/bin/env python3
"""Render the locked master palette as a swatch strip PNG for the report."""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from png_io import write_png

PALETTE_PATH = os.path.join(os.path.dirname(__file__), "../board/master_palette.json")
OUT_PATH = os.path.join(os.path.dirname(__file__), "../board/master_palette_swatch.png")

CELL = 32


def main():
    with open(PALETTE_PATH) as f:
        data = json.load(f)
    colors = [tuple(c["rgb"]) for c in data["colors"]]
    n = len(colors)
    w, h = CELL * n, CELL
    rows = [bytearray(w * 4) for _ in range(h)]
    for idx, (r, g, b) in enumerate(colors):
        x0 = idx * CELL
        for y in range(h):
            row = rows[y]
            for x in range(x0, x0 + CELL):
                i = x * 4
                row[i], row[i + 1], row[i + 2], row[i + 3] = r, g, b, 255
    write_png(OUT_PATH, w, h, rows)
    print(f"wrote {OUT_PATH}: {w}x{h}, {n} swatches")


if __name__ == "__main__":
    main()
