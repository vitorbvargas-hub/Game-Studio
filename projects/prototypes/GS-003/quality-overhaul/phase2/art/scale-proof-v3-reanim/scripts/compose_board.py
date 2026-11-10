#!/usr/bin/env python3
"""Nearest-neighbor x4 contact sheet: anchor + all walk-s and idle-s frames
(palette-locked), raw vs fixed pair for 2 sample frames. Pure stdlib, 0 PixelLab calls.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from png_io import read_png, write_png, new_canvas, get_pixel, set_pixel  # noqa: E402

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(BASE, "raw")
FIXED = os.path.join(BASE, "fixed")
BOARD = os.path.join(BASE, "board")

SCALE = 4
CELL = 64 * SCALE
PAD = 6


def upscale(w, h, rows, scale):
    nw, nh = w * scale, h * scale
    out = new_canvas(nw, nh)
    for y in range(h):
        for x in range(w):
            px = get_pixel(rows, x, y)
            for dy in range(scale):
                for dx in range(scale):
                    set_pixel(out, x * scale + dx, y * scale + dy, px)
    return nw, nh, out


def paste(canvas, cw, ch, img_w, img_h, img_rows, ox, oy):
    for y in range(img_h):
        for x in range(img_w):
            set_pixel(canvas, ox + x, oy + y, get_pixel(img_rows, x, y))


def load_up(path):
    w, h, rows = read_png(path)
    return upscale(w, h, rows, SCALE)


def main():
    frames = []
    frames.append(("anchor", os.path.join(FIXED, "south_anchor_locked.png")))
    for i in range(9):
        frames.append((f"walk{i}", os.path.join(FIXED, "walk-s", f"frame_{i:03d}.png")))
    for i in range(5):
        frames.append((f"idle{i}", os.path.join(FIXED, "idle-s", f"frame_{i:03d}.png")))

    cols = 5
    rows_n = (len(frames) + cols - 1) // cols
    sheet_w = cols * CELL + (cols + 1) * PAD
    sheet_h = rows_n * CELL + (rows_n + 1) * PAD
    canvas = new_canvas(sheet_w, sheet_h)
    for y in range(sheet_h):
        row = canvas[y]
        for x in range(sheet_w):
            set_pixel(canvas, x, y, (18, 18, 20, 255))

    for idx, (label, path) in enumerate(frames):
        r, c = divmod(idx, cols)
        ox = PAD + c * (CELL + PAD)
        oy = PAD + r * (CELL + PAD)
        w, h, up_rows = load_up(path)
        paste(canvas, sheet_w, sheet_h, w, h, up_rows, ox, oy)

    write_png(os.path.join(BOARD, "reanim_board_fixed_x4.png"), sheet_w, sheet_h, canvas)

    # before/after pair for 2 sample frames (walk frame_001 = biggest shrink-risk, idle frame_002)
    pairs = [
        ("walk-s/frame_001.png", "walk sample (frame_001)"),
        ("idle-s/frame_002.png", "idle sample (frame_002)"),
    ]
    pw = CELL * 2 + PAD * 3
    ph = CELL + PAD * 2
    for rel, _label in pairs:
        raw_w, raw_h, raw_up = load_up(os.path.join(RAW, rel))
        fix_w, fix_h, fix_up = load_up(os.path.join(FIXED, rel))
        canvas2 = new_canvas(pw, ph)
        for y in range(ph):
            for x in range(pw):
                set_pixel(canvas2, x, y, (18, 18, 20, 255))
        paste(canvas2, pw, ph, raw_w, raw_h, raw_up, PAD, PAD)
        paste(canvas2, pw, ph, fix_w, fix_h, fix_up, PAD * 2 + CELL, PAD)
        out_name = rel.replace("/", "_").replace(".png", "_before_after.png")
        write_png(os.path.join(BOARD, out_name), pw, ph, canvas2)

    print("wrote board/reanim_board_fixed_x4.png and before/after pairs")


if __name__ == "__main__":
    main()
