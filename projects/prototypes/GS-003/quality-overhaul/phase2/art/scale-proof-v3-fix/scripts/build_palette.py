#!/usr/bin/env python3
"""Build a locked master palette (<=18 colors) for Guilmon v3 from the union
of all pipeline-m1 frames (south, south-west, idle-s x4, walk-s x6), weighted
by pixel frequency. Deterministic weighted k-means in RGB space (no RNG):
seeded by farthest-point sampling starting from the most frequent color.
Pure stdlib, zero PixelLab cost.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from png_io import read_png, color_counts

BASE = os.path.join(os.path.dirname(__file__), "../../scale-proof-v3/pipeline-m1")
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

K = 18  # target palette size (ramps by material, within the 16-20 brief)


def dist2(c1, c2):
    return (c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2 + (c1[2] - c2[2]) ** 2


def farthest_point_init(colors_weights, k):
    colors = list(colors_weights.keys())
    weights = colors_weights
    # start from the single most frequent color (deterministic)
    first = max(colors, key=lambda c: weights[c])
    chosen = [first]
    dists = {c: dist2(c, first) for c in colors}
    for _ in range(k - 1):
        nxt = max(colors, key=lambda c: dists[c])
        chosen.append(nxt)
        for c in colors:
            d = dist2(c, nxt)
            if d < dists[c]:
                dists[c] = d
    return chosen


def weighted_kmeans(colors_weights, k, iters=40):
    centroids = farthest_point_init(colors_weights, k)
    colors = list(colors_weights.keys())
    weights = colors_weights
    for _ in range(iters):
        clusters = [[] for _ in range(k)]
        for c in colors:
            best_i, best_d = 0, None
            for i, cen in enumerate(centroids):
                d = dist2(c, cen)
                if best_d is None or d < best_d:
                    best_d, best_i = d, i
            clusters[best_i].append(c)
        new_centroids = []
        changed = False
        for i, cluster in enumerate(clusters):
            if not cluster:
                new_centroids.append(centroids[i])
                continue
            tw = sum(weights[c] for c in cluster)
            r = sum(c[0] * weights[c] for c in cluster) / tw
            g = sum(c[1] * weights[c] for c in cluster) / tw
            b = sum(c[2] * weights[c] for c in cluster) / tw
            nc = (round(r), round(g), round(b))
            if nc != centroids[i]:
                changed = True
            new_centroids.append(nc)
        centroids = new_centroids
        if not changed:
            break
    return centroids


def classify_material(rgb):
    r, g, b = rgb
    mx, mn = max(r, g, b), min(r, g, b)
    if mx < 70 and (mx - mn) < 20:
        return "outline/black"
    if r > 180 and g > 180 and b > 180:
        return "white/highlight"
    if abs(r - g) < 25 and abs(g - b) < 25 and mx < 210:
        return "gray/claw"
    if r > g and g >= b and r - b > 40 and g - b < 60 and r > 180 and g > 170:
        return "yellow/eye"
    if r > g and r > b and g > b and r > 140:
        return "red/body"
    if r > g and r > b and r - g < 90:
        return "cream/belly"
    return "other"


def main():
    totals = {}
    for rel in FILES:
        w, h, rows = read_png(os.path.join(BASE, rel))
        cc = color_counts(w, h, rows, alpha_threshold=127)
        for (r, g, b, a), n in cc.items():
            key = (r, g, b)
            totals[key] = totals.get(key, 0) + n

    print(f"Input: {len(totals)} distinct opaque colors across {len(FILES)} frames, {sum(totals.values())} px total")

    centroids = weighted_kmeans(totals, K)

    # dedupe identical centroids (can happen if a cluster absorbed by neighbor)
    seen = {}
    for c in centroids:
        seen[c] = seen.get(c, 0) + 1
    unique_centroids = list(seen.keys())

    palette = []
    for c in unique_centroids:
        mat = classify_material(c)
        palette.append({"rgb": list(c), "hex": "#%02x%02x%02x" % c, "material": mat})
    palette.sort(key=lambda p: (p["material"], sum(p["rgb"])))

    out_path = os.path.join(os.path.dirname(__file__), "../board/master_palette.json")
    with open(out_path, "w") as f:
        json.dump({
            "source": "phase2/art/scale-proof-v3/pipeline-m1 (12 frames: south, south-west, idle-s x4, walk-s x6)",
            "method": "weighted k-means (RGB, pixel-frequency weighted), deterministic farthest-point init, pure stdlib",
            "k_requested": K,
            "k_actual": len(palette),
            "colors": palette,
        }, f, indent=2)

    print(f"\nLocked palette ({len(palette)} colors), by material:")
    for p in palette:
        print(f"  {p['hex']}  rgb={tuple(p['rgb'])}  {p['material']}")
    print(f"\nWritten to {out_path}")
    return unique_centroids


if __name__ == "__main__":
    main()
