#!/usr/bin/env python3
"""Apply the local, zero-cost fixes to pipeline-m1 (Guilmon v3):
1. Palette lock: snap every opaque pixel to the nearest color in the
   locked master palette (board/master_palette.json, built by
   build_palette.py). Alpha is binary in the source (0/255) and is
   preserved exactly -- no resampling, no new alpha values introduced.
2. Foot/center realignment: for idle-s and walk-s frames only, translate
   the sprite by whole pixels (dx, dy) so its bbox foot row and
   horizontal center match rotations/south.png. This is a crop/shift,
   never a resize -- body height/width in pixels are NOT changed,
   because that would require blurry resampling (forbidden by the task).
   south.png and south-west.png are the scale anchor: palette-locked
   only, position untouched.

Writes fixed frames to pipeline-m1-fixed/ and a JSON report of
before/after bbox + color-count metrics used by FIX_REPORT.md.

Pure stdlib. Zero PixelLab calls, zero generations spent.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from png_io import read_png, write_png, bbox_alpha, color_counts, new_canvas

SRC_BASE = os.path.join(os.path.dirname(__file__), "../../scale-proof-v3/pipeline-m1")
OUT_BASE = os.path.join(os.path.dirname(__file__), "../pipeline-m1-fixed")
PALETTE_PATH = os.path.join(os.path.dirname(__file__), "../board/master_palette.json")

ANCHOR_FRAME = "rotations/south.png"
STATIC_FRAMES = ["rotations/south.png", "rotations/south-west.png"]
ANIMATED_FRAMES = [
    "idle-s/frame_000.png", "idle-s/frame_001.png", "idle-s/frame_002.png", "idle-s/frame_003.png",
    "walk-s/frame_000.png", "walk-s/frame_001.png", "walk-s/frame_002.png",
    "walk-s/frame_003.png", "walk-s/frame_004.png", "walk-s/frame_005.png",
]
ALL_FRAMES = STATIC_FRAMES + ANIMATED_FRAMES


def dist2(c1, c2):
    return (c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2 + (c1[2] - c2[2]) ** 2


def nearest_palette_color(rgb, palette_rgb):
    best, best_d = palette_rgb[0], None
    for p in palette_rgb:
        d = dist2(rgb, p)
        if best_d is None or d < best_d:
            best_d, best = d, p
    return best


def quantize_frame(w, h, rows, palette_rgb, cache):
    out = new_canvas(w, h)
    for y in range(h):
        row = rows[y]
        out_row = out[y]
        for x in range(w):
            i = x * 4
            a = row[i + 3]
            if a == 0:
                continue  # leave transparent (already zeroed)
            key = (row[i], row[i + 1], row[i + 2])
            if key not in cache:
                cache[key] = nearest_palette_color(key, palette_rgb)
            nr, ng, nb = cache[key]
            out_row[i], out_row[i + 1], out_row[i + 2], out_row[i + 3] = nr, ng, nb, a
    return out


def translate_frame(w, h, rows, dx, dy):
    """Integer pixel shift, canvas size unchanged. Pixels shifted out of
    bounds are dropped (none expected here: shifts are small, body is far
    from the canvas edge in every measured frame)."""
    out = new_canvas(w, h)
    for y in range(h):
        ny = y + dy
        if ny < 0 or ny >= h:
            continue
        row = rows[y]
        out_row = out[ny]
        for x in range(w):
            nx = x + dx
            if nx < 0 or nx >= w:
                continue
            i, ni = x * 4, nx * 4
            a = row[i + 3]
            if a == 0:
                continue
            out_row[ni], out_row[ni + 1], out_row[ni + 2], out_row[ni + 3] = (
                row[i], row[i + 1], row[i + 2], a
            )
    return out


def main():
    with open(PALETTE_PATH) as f:
        pal_data = json.load(f)
    palette_rgb = [tuple(c["rgb"]) for c in pal_data["colors"]]
    print(f"Loaded locked palette: {len(palette_rgb)} colors from {PALETTE_PATH}")

    # anchor bbox (from ORIGINAL, pre-quantization pixels -- alpha is untouched by
    # palette lock, so bbox is identical whether measured before or after quantizing)
    aw, ah, arows = read_png(os.path.join(SRC_BASE, ANCHOR_FRAME))
    abb = bbox_alpha(aw, ah, arows, 0)
    anchor_cx = (abb["xmin"] + abb["xmax"]) / 2
    anchor_ymax = abb["ymax"]
    print(f"Anchor (south.png): bbox h={abb['height']} w={abb['width']} ymax={anchor_ymax} cx={anchor_cx}")

    cache = {}
    report = {"anchor": {"frame": ANCHOR_FRAME, "bbox": abb, "cx": anchor_cx}, "frames": {}}

    for rel in ALL_FRAMES:
        src_path = os.path.join(SRC_BASE, rel)
        w, h, rows = read_png(src_path)
        bb_before = bbox_alpha(w, h, rows, 0)
        colors_before_any = len(color_counts(w, h, rows, alpha_threshold=0))

        dx = dy = 0
        realigned = False
        if rel in ANIMATED_FRAMES:
            cx = (bb_before["xmin"] + bb_before["xmax"]) / 2
            dx = round(anchor_cx - cx)
            dy = anchor_ymax - bb_before["ymax"]
            if dx != 0 or dy != 0:
                rows = translate_frame(w, h, rows, dx, dy)
                realigned = True

        fixed = quantize_frame(w, h, rows, palette_rgb, cache)
        bb_after = bbox_alpha(w, h, fixed, 0)
        colors_after_any = len(color_counts(w, h, fixed, alpha_threshold=0))

        out_path = os.path.join(OUT_BASE, rel)
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        write_png(out_path, w, h, fixed)

        height_mismatch_px = abb["height"] - (bb_after["height"] if bb_after else 0)
        height_mismatch_pct = round(100 * height_mismatch_px / abb["height"], 1)
        invalid_scale = rel in ANIMATED_FRAMES and abs(height_mismatch_pct) >= 10

        report["frames"][rel] = {
            "realigned_dx": dx,
            "realigned_dy": dy,
            "bbox_before": bb_before,
            "bbox_after": bb_after,
            "colors_any_alpha_before": colors_before_any,
            "colors_any_alpha_after": colors_after_any,
            "height_vs_anchor_px": height_mismatch_px,
            "height_vs_anchor_pct": height_mismatch_pct,
            "invalid_for_production_scale": invalid_scale,
        }
        tag = "INVALID (scale)" if invalid_scale else "ok"
        print(
            f"{rel:<24} dx={dx:+d} dy={dy:+d}  h {bb_before['height']}->{bb_after['height']}"
            f"  colors {colors_before_any}->{colors_after_any}  vs anchor {height_mismatch_pct:+.1f}%  [{tag}]"
        )

    report_path = os.path.join(os.path.dirname(__file__), "../board/fix_metrics.json")
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)
    print(f"\nMetrics written to {report_path}")


if __name__ == "__main__":
    main()
