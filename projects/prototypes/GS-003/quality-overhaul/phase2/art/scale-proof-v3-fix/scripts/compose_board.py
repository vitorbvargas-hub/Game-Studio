#!/usr/bin/env python3
"""Before/after board for the Guilmon v3 local fix (palette lock + foot
realignment). Reuses the same pure-stdlib PNG routines as
scale-proof-v3/scripts/compose_board.py. No AI, no cost.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from png_io import read_png, write_png


def nearest_scale(w, h, rows, factor):
    bpp = 4
    new_w, new_h = w * factor, h * factor
    new_rows = []
    for y in range(new_h):
        sy = y // factor
        src_row = rows[sy]
        new_row = bytearray(new_w * bpp)
        for x in range(w):
            px = src_row[x * bpp:x * bpp + bpp]
            base = x * factor * bpp
            for k in range(factor):
                new_row[base + k * bpp:base + k * bpp + bpp] = px
        new_rows.append(new_row)
    return new_w, new_h, new_rows


def blend_paste(canvas_rows, canvas_w, img_w, img_h, img_rows, dst_x, dst_y):
    bpp = 4
    for y in range(img_h):
        cy = dst_y + y
        if cy < 0 or cy >= len(canvas_rows):
            continue
        crow = canvas_rows[cy]
        srow = img_rows[y]
        for x in range(img_w):
            cx = dst_x + x
            if cx < 0 or cx >= canvas_w:
                continue
            sa = srow[x * bpp + 3]
            if sa == 0:
                continue
            si = x * bpp
            ci = cx * bpp
            crow[ci:ci + 4] = srow[si:si + 4]


def fill_rect(canvas_rows, canvas_w, x0, y0, w, h, rgba):
    bpp = 4
    for y in range(y0, y0 + h):
        if y < 0 or y >= len(canvas_rows):
            continue
        row = canvas_rows[y]
        for x in range(x0, x0 + w):
            if x < 0 or x >= canvas_w:
                continue
            i = x * bpp
            row[i:i + 4] = bytearray(rgba)


def compose_grid(rows_of_cells, out_path, gap=10, pad=10, bg=(14, 16, 24, 255), row_gap=20):
    """rows_of_cells: list of rows; each row is a list of (path, factor)."""
    loaded_rows = []
    for cells in rows_of_cells:
        loaded = []
        for path, factor in cells:
            w, h, rows = read_png(path)
            nw, nh, nrows = nearest_scale(w, h, rows, factor)
            loaded.append((nw, nh, nrows))
        loaded_rows.append(loaded)

    row_heights = [max(h for _, h, _ in row) for row in loaded_rows]
    row_widths = [sum(w for w, _, _ in row) + gap * (len(row) - 1) for row in loaded_rows]
    canvas_w = max(row_widths) + pad * 2
    canvas_h = sum(row_heights) + row_gap * (len(loaded_rows) - 1) + pad * 2

    canvas_rows = [bytearray(canvas_w * 4) for _ in range(canvas_h)]
    for row in canvas_rows:
        for x in range(canvas_w):
            i = x * 4
            row[i:i + 4] = bytearray(bg)

    y_cursor = pad
    for row_idx, loaded in enumerate(loaded_rows):
        max_h = row_heights[row_idx]
        x = pad
        for w, h, rows in loaded:
            y = y_cursor + (max_h - h)
            blend_paste(canvas_rows, canvas_w, w, h, rows, x, y)
            x += w + gap
        y_cursor += max_h + row_gap

    write_png(out_path, canvas_w, canvas_h, canvas_rows)
    return canvas_w, canvas_h


if __name__ == "__main__":
    fixdir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    src = os.path.join(os.path.dirname(fixdir), "scale-proof-v3/pipeline-m1")
    fixed = os.path.join(fixdir, "pipeline-m1-fixed")

    factor = 6
    before = [
        (os.path.join(src, "rotations/south.png"), factor),
        (os.path.join(src, "idle-s/frame_000.png"), factor),
        (os.path.join(src, "idle-s/frame_002.png"), factor),
        (os.path.join(src, "walk-s/frame_001.png"), factor),
        (os.path.join(src, "walk-s/frame_004.png"), factor),
    ]
    after = [
        (os.path.join(fixed, "rotations/south.png"), factor),
        (os.path.join(fixed, "idle-s/frame_000.png"), factor),
        (os.path.join(fixed, "idle-s/frame_002.png"), factor),
        (os.path.join(fixed, "walk-s/frame_001.png"), factor),
        (os.path.join(fixed, "walk-s/frame_004.png"), factor),
    ]
    out = os.path.join(fixdir, "board/before_after_v3fix.png")
    w, h = compose_grid([before, after], out, gap=14, pad=12, row_gap=22)
    print(f"wrote {out}: {w}x{h} (row1=antes/original pipeline-m1, row2=depois/pipeline-m1-fixed; south, idle f0, idle f2, walk f1, walk f4, factor x{factor})")
