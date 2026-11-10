#!/usr/bin/env python3
"""Measure bbox/height of the reanimated frames against the south.png anchor,
then apply the locked 18-color palette from scale-proof-v3-fix (reused, not
regenerated) and write pipeline-m1-reanim-fixed/. Pure stdlib, 0 PixelLab calls.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from png_io import read_png, write_png, bbox_alpha, color_counts  # noqa: E402

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(BASE, "raw")
FIXED = os.path.join(BASE, "fixed")
BOARD = os.path.join(BASE, "board")

with open(os.path.join(BOARD, "master_palette.json")) as f:
    PALETTE = [tuple(c["rgb"]) for c in json.load(f)["colors"]]


def nearest(rgb):
    best, bd = PALETTE[0], None
    for p in PALETTE:
        d = (rgb[0] - p[0]) ** 2 + (rgb[1] - p[1]) ** 2 + (rgb[2] - p[2]) ** 2
        if bd is None or d < bd:
            bd, best = d, p
    return best


def lock_palette(width, height, rows):
    out = [bytearray(row) for row in rows]
    for y in range(height):
        row = out[y]
        for x in range(width):
            i = x * 4
            a = row[i + 3]
            if a > 127:
                r, g, b = nearest((row[i], row[i + 1], row[i + 2]))
                row[i], row[i + 1], row[i + 2] = r, g, b
    return out


def measure(path):
    w, h, rows = read_png(path)
    bb = bbox_alpha(w, h, rows)
    cc = color_counts(w, h, rows, alpha_threshold=127)
    return w, h, rows, bb, len(cc)


def main():
    anchor_path = os.path.join(RAW, "south_anchor.png")
    aw, ah, arows, abb, acolors = measure(anchor_path)
    anchor_h = abb["height"]
    anchor_cx = (abb["xmin"] + abb["xmax"]) / 2.0
    anchor_foot = abb["ymax"]

    report = {
        "anchor": {
            "file": "raw/south_anchor.png",
            "bbox": abb,
            "colors_locked_input": acolors,
            "height": anchor_h,
            "cx": anchor_cx,
            "foot_y": anchor_foot,
        },
        "clips": {},
    }

    for clip in ("walk-s", "idle-s"):
        raw_dir = os.path.join(RAW, clip)
        fixed_dir = os.path.join(FIXED, clip)
        os.makedirs(fixed_dir, exist_ok=True)
        frames = sorted(os.listdir(raw_dir))
        clip_report = []
        for fname in frames:
            path = os.path.join(raw_dir, fname)
            w, h, rows, bb, ncolors_raw = measure(path)
            fixed_rows = lock_palette(w, h, rows)
            write_png(os.path.join(fixed_dir, fname), w, h, fixed_rows)
            _, _, _, bb_fixed, ncolors_fixed = measure(os.path.join(fixed_dir, fname))
            fh = bb["height"] if bb else 0
            cx = (bb["xmin"] + bb["xmax"]) / 2.0 if bb else None
            foot = bb["ymax"] if bb else None
            dev_pct = (fh - anchor_h) / anchor_h * 100.0 if anchor_h else 0.0
            clip_report.append({
                "frame": fname,
                "bbox_raw": bb,
                "height": fh,
                "height_dev_pct_vs_anchor": round(dev_pct, 1),
                "cx": cx,
                "cx_dev_px_vs_anchor": round(cx - anchor_cx, 2) if cx is not None else None,
                "foot_y": foot,
                "foot_dev_px_vs_anchor": (foot - anchor_foot) if foot is not None else None,
                "colors_raw_gt127a": ncolors_raw,
                "colors_locked": ncolors_fixed,
                "valid_height_le5pct": abs(dev_pct) <= 5.0,
            })
        report["clips"][clip] = clip_report

    # union of colors across all fixed frames + anchor fixed version
    anchor_fixed_rows = lock_palette(aw, ah, arows)
    write_png(os.path.join(FIXED, "south_anchor_locked.png"), aw, ah, anchor_fixed_rows)
    union = set()
    _, _, arows_f = read_png(os.path.join(FIXED, "south_anchor_locked.png"))
    for y in range(ah):
        for x in range(aw):
            i = x * 4
            if arows_f[y][i + 3] > 127:
                union.add((arows_f[y][i], arows_f[y][i + 1], arows_f[y][i + 2]))
    for clip in ("walk-s", "idle-s"):
        fixed_dir = os.path.join(FIXED, clip)
        for fname in sorted(os.listdir(fixed_dir)):
            w, h, rows = read_png(os.path.join(fixed_dir, fname))
            for y in range(h):
                for x in range(w):
                    i = x * 4
                    if rows[y][i + 3] > 127:
                        union.add((rows[y][i], rows[y][i + 1], rows[y][i + 2]))
    report["palette_union_after_lock"] = len(union)
    report["palette_union_outside_locked_palette"] = len([c for c in union if c not in set(PALETTE)])

    with open(os.path.join(BOARD, "reanim_metrics.json"), "w") as f:
        json.dump(report, f, indent=2)
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
