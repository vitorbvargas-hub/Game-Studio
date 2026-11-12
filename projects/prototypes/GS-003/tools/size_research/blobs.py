"""Chroma-key blob (connected-component) detection over a decoded PNG.

Background = the most common pixel color(s) in the image (by frequency),
treated as transparent/background regardless of literal alpha channel,
since many of these sprite-sheet rips bake a magenta/solid-color chroma key
instead of real alpha. Foreground blobs are found via 4-connected flood fill.
"""
from collections import Counter, deque


def background_colors(pixels, width, height, top_n=6, ratio_floor=0.25, min_share=0.01):
    """Pick background/chroma-key colors from whole-image frequency,
    using a RELATIVE gap rule rather than an absolute min_share: these
    sheets have 1-2 background/chroma-key colors that each cover a large
    double-digit-percent share, clearly ahead of any single sprite color
    (outline black, highlight white, etc. are each a few percent at most
    even on sheets where the character fills most of the canvas).
    Always take the single most frequent color; keep additional colors
    only while each is still at least `ratio_floor` of the top color's
    count AND at least `min_share` of total pixels, stopping at the first
    one that fails (frequencies are already sorted descending)."""
    counts = Counter()
    for row in pixels:
        for p in row:
            counts[p] += 1
    total = width * height
    ranked = counts.most_common(top_n)
    if not ranked:
        return set()
    top_count = ranked[0][1]
    bg = [ranked[0][0]]
    for color, n in ranked[1:]:
        if n >= ratio_floor * top_count and n / total >= min_share:
            bg.append(color)
        else:
            break
    return set(bg)


def _dilate_mask(fg, width, height, radius):
    """Morphological dilation of a boolean foreground grid by `radius`
    pixels (Chebyshev distance), used to bridge small gaps (anti-aliased
    seams, 1-3px background-colored slivers between a sprite's limbs)
    before connected-component labeling, without inflating the final
    bounding box (that is computed later from the ORIGINAL mask)."""
    if radius <= 0:
        return [row[:] for row in fg]
    # Horizontal pass then vertical pass (separable dilation).
    tmp = [[False] * width for _ in range(height)]
    for y in range(height):
        row = fg[y]
        out = tmp[y]
        for x in range(width):
            if row[x]:
                lo = max(0, x - radius)
                hi = min(width, x + radius + 1)
                for xx in range(lo, hi):
                    out[xx] = True
    out_grid = [[False] * width for _ in range(height)]
    for x in range(width):
        col = [tmp[y][x] for y in range(height)]
        for y in range(height):
            if col[y]:
                lo = max(0, y - radius)
                hi = min(height, y + radius + 1)
                for yy in range(lo, hi):
                    out_grid[yy][x] = True
    return out_grid


def find_blobs(pixels, width, height, bg_colors, min_area=4, merge_radius=0):
    """Return list of dicts: {x0,y0,x1,y1,w,h,area} for each connected
    foreground region, filtering specks smaller than min_area pixels.

    merge_radius>0 bridges small gaps between disjoint fragments of the
    same sprite (e.g. separated limbs) via morphological dilation before
    labeling; the reported bounding box/area still comes from the
    original (non-dilated) foreground pixels only.
    """
    fg = [[pixels[y][x] not in bg_colors for x in range(width)] for y in range(height)]
    label_mask = _dilate_mask(fg, width, height, merge_radius) if merge_radius else fg

    visited = [[False] * width for _ in range(height)]
    blobs = []
    for y0 in range(height):
        for x0 in range(width):
            if visited[y0][x0] or not label_mask[y0][x0]:
                continue
            q = deque([(x0, y0)])
            visited[y0][x0] = True
            minx = maxx = None
            miny = maxy = None
            area = 0
            while q:
                x, y = q.popleft()
                if fg[y][x]:
                    area += 1
                    minx = x if minx is None else min(minx, x)
                    maxx = x if maxx is None else max(maxx, x)
                    miny = y if miny is None else min(miny, y)
                    maxy = y if maxy is None else max(maxy, y)
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < width and 0 <= ny < height and not visited[ny][nx]:
                        if label_mask[ny][nx]:
                            visited[ny][nx] = True
                            q.append((nx, ny))
            if area >= min_area:
                blobs.append({
                    "x0": minx, "y0": miny, "x1": maxx, "y1": maxy,
                    "w": maxx - minx + 1, "h": maxy - miny + 1,
                    "area": area,
                })
    return blobs
