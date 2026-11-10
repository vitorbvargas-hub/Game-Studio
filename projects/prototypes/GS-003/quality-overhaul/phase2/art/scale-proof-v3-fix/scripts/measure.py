#!/usr/bin/env python3
"""Measure bbox/colors/alpha distribution for every pipeline-m1 frame.
Pure stdlib, zero PixelLab cost. Cross-checks QA_SCALE_PROOF_V3.md numbers
independently before any fix is applied.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
from png_io import read_png, bbox_alpha, color_counts

SRC = "../../scale-proof-v3/pipeline-m1"

FILES = [
    "rotations/south.png",
    "rotations/south-west.png",
    "idle-s/frame_000.png",
    "idle-s/frame_001.png",
    "idle-s/frame_002.png",
    "idle-s/frame_003.png",
    "walk-s/frame_000.png",
    "walk-s/frame_001.png",
    "walk-s/frame_002.png",
    "walk-s/frame_003.png",
    "walk-s/frame_004.png",
    "walk-s/frame_005.png",
]


def alpha_histogram(width, height, rows):
    hist = {}
    for y in range(height):
        row = rows[y]
        for x in range(width):
            a = row[x * 4 + 3]
            hist[a] = hist.get(a, 0) + 1
    return hist


def main():
    base = os.path.join(os.path.dirname(__file__), SRC)
    print(f"{'file':<24}{'bbox(w x h)':<14}{'foot_y':<8}{'px>0':<8}{'colors(a>0)':<12}{'colors(a>127)':<14}")
    results = {}
    for rel in FILES:
        path = os.path.join(base, rel)
        w, h, rows = read_png(path)
        bb = bbox_alpha(w, h, rows, threshold=0)
        cc_any = color_counts(w, h, rows, alpha_threshold=0)
        cc_opaque = color_counts(w, h, rows, alpha_threshold=127)
        ah = alpha_histogram(w, h, rows)
        results[rel] = {
            "w": w, "h": h, "bbox": bb,
            "colors_any_alpha": len(cc_any),
            "colors_opaque": len(cc_opaque),
            "alpha_hist": ah,
        }
        bbox_str = f"{bb['width']}x{bb['height']}" if bb else "empty"
        foot_y = bb["ymax"] if bb else -1
        print(f"{rel:<24}{bbox_str:<14}{foot_y:<8}{bb['pixels'] if bb else 0:<8}{len(cc_any):<12}{len(cc_opaque):<14}")

    print("\n--- alpha value distribution (non-zero alphas present, excluding 0 and 255) ---")
    for rel in FILES:
        ah = results[rel]["alpha_hist"]
        partial = {a: n for a, n in ah.items() if 0 < a < 255}
        if partial:
            print(f"{rel}: {partial}")
        else:
            print(f"{rel}: binary alpha only (0 or 255)")

    print("\n--- union palette across clips (alpha>127) ---")
    sw, sh, srows = read_png(os.path.join(base, "rotations/south.png"))
    south_colors = set(color_counts(sw, sh, srows, alpha_threshold=127).keys())
    idle_colors = set()
    for rel in FILES[2:6]:
        w, h, rows = read_png(os.path.join(base, rel))
        idle_colors |= set(color_counts(w, h, rows, alpha_threshold=127).keys())
    walk_colors = set()
    for rel in FILES[6:12]:
        w, h, rows = read_png(os.path.join(base, rel))
        walk_colors |= set(color_counts(w, h, rows, alpha_threshold=127).keys())
    all_colors = set()
    for rel in FILES:
        w, h, rows = read_png(os.path.join(base, rel))
        all_colors |= set(color_counts(w, h, rows, alpha_threshold=127).keys())

    print(f"south.png opaque colors: {len(south_colors)}")
    print(f"idle-s union opaque colors: {len(idle_colors)} (new vs south: {len(idle_colors - south_colors)})")
    print(f"walk-s union opaque colors: {len(walk_colors)} (new vs south: {len(walk_colors - south_colors)})")
    print(f"ALL FRAMES union opaque colors: {len(all_colors)}")

    return results


if __name__ == "__main__":
    main()
