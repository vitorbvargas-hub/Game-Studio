"""Heuristic extractor: estimate the overworld/map walking-sprite pixel
height from a full Spriters Resource / dwds-sheets PNG sheet.

Method (documented for reproducibility -- see DIGIMON_SIZE_TABLE.md):
1. Decode the PNG with the pure-Python decoder (png_decode.py).
2. Treat the background/chroma-key color(s) as transparent: the single
   most frequent whole-image color, plus any other color whose count is
   still within ratio_floor of it (handles the two-layer canvas+chroma-key
   sheets). See blobs.background_colors.
3. Flood-fill (4-connected, with a small gap-bridging dilation to rejoin
   limbs separated by anti-aliased seams) all non-background pixels into
   blobs via blobs.find_blobs.
4. These sheets mix 3 very different blob scales: a few large battle
   idle/attack "portrait" poses, a mid-size group of repeated walk-cycle
   frames (4 directions, several frames each), and handwritten
   ripper-credit text scattered in several spots (not just one footer
   band). We isolate the walk group by:
     a. Dropping wide-short blobs (width/height > MAX_ASPECT_RATIO) and
        narrow/tiny blobs (width < MIN_BLOB_WIDTH or area < SPECK_AREA):
        this removes the handwritten credit-text lines and AA specks.
     b. Dropping any remaining blob whose area exceeds MAX_REL_AREA of
        the whole sheet: those are the battle "portrait" poses, which
        are always a much bigger share of the sheet than a walk frame,
        regardless of how many distinct portrait sizes a given sheet has
        (a sort-and-cut-at-the-first-big-gap approach missed sheets with
        several portrait sizes between the gap and the true walk group).
     c. Clustering the remaining blobs by (height, tolerance) and keeping
        only clusters with >= MIN_CLUSTER_MEMBERS (a walk cycle repeats
        several times; one-off UI icons do not).
     d. Picking the SMALLEST qualifying cluster (by mean height), not the
        most populous one: the map sprite is the smallest *repeated*
        group on every sheet verified by hand, even though an "other
        pose" repeat can occasionally have more members (observed on
        Tokomon).
   If no cluster reaches MIN_CLUSTER_MEMBERS, the best available cluster
   is still returned, flagged `low_confidence: true` -- never silently
   trusted as a clean reading (see DIGIMON_SIZE_TABLE.md for every case
   where this flag fired and how it was resolved by hand).
5. Report the cluster's median height as the walk-sprite height estimate,
   plus the cluster size (member count) as a confidence signal.

This is a measurement heuristic, not ground truth -- every value it
produces is recorded as [E, proxy] in the size table with the sheet path
and blob list for audit, and any result with < 4 cluster members is
flagged as low-confidence rather than trusted silently.
"""
from png_decode import read_png
from blobs import background_colors, find_blobs

TEXT_BAND_FRAC = 0.0  # disabled: the area-gap portrait split (below) already
# separates the wide, large-area handwritten-credit-text blob from the much
# smaller walk-sprite blobs more reliably than a fixed fraction of sheet
# height, which wrongly cut off real near-bottom walk clusters on taller
# sheets (observed on Angemon, where the walk group sits at y~356-403 of a
# 425px-tall sheet, just above the real credit line at y~411).
HEIGHT_TOLERANCE = 3
MIN_CLUSTER_MEMBERS = 4
SPECK_AREA = 60  # drop AA specks AND the scattered handwritten ripper-credit
# glyph fragments these sheets stamp in multiple spots (not just one footer
# band) -- those glyphs are small, narrow, and otherwise cluster into a
# false "repeated height" group that has nothing to do with the creature.
MIN_BLOB_WIDTH = 8  # credit-text glyph strokes are narrower than any real sprite frame
MAX_ASPECT_RATIO = 2.6  # drop wide-short blobs: handwritten credit-text LINES
# (observed width/height ~4.5-9.4 on every sheet) are far wider relative to
# their height than any creature sprite frame (observed ~0.5-1.1 on every
# walk/idle cluster sampled).
MAX_REL_AREA = 0.03  # a battle-idle/attack "portrait" pose always covers a much
# bigger share of the sheet than a walk frame on every sheet sampled (Agumon's
# portraits ~9-10%, walk frames ~0.5-1.5%; Garurumon's portraits ~5%, walk-area
# fragments <1.5%) -- filtering by share of total sheet area, not by an
# absolute-pixel gap in the sorted area list, survives sheets where several
# distinct portrait poses of different sizes sit between the true walk group
# and the single largest outlier (a sort-and-cut-at-first-gap missed this).


def split_off_portraits(blobs, sheet_area):
    """Return (candidates, dropped_portraits): drop any blob covering more
    than MAX_REL_AREA of the whole sheet -- battle portraits -- regardless
    of how many distinct portrait sizes exist on a given sheet."""
    candidates, portraits = [], []
    for b in blobs:
        if b["area"] / sheet_area > MAX_REL_AREA:
            portraits.append(b)
        else:
            candidates.append(b)
    return candidates, portraits


def cluster_by_height(blobs, tol=HEIGHT_TOLERANCE):
    heights = sorted(b["h"] for b in blobs)
    clusters = []
    for h in heights:
        placed = False
        for c in clusters:
            if abs(c["mean"] - h) <= tol:
                c["members"].append(h)
                c["mean"] = sum(c["members"]) / len(c["members"])
                placed = True
                break
        if not placed:
            clusters.append({"mean": h, "members": [h]})
    return clusters


def estimate_walk_height(path):
    width, height, pixels = read_png(path)
    bg = background_colors(pixels, width, height)
    blobs = find_blobs(pixels, width, height, bg, min_area=4, merge_radius=2)

    text_band_y = height * (1 - TEXT_BAND_FRAC) if TEXT_BAND_FRAC else height
    above_text = [
        b for b in blobs
        if b["y0"] < text_band_y and b["area"] >= SPECK_AREA and b["w"] >= MIN_BLOB_WIDTH
        and (b["w"] / b["h"]) <= MAX_ASPECT_RATIO
    ]
    candidates, portraits = split_off_portraits(above_text, width * height)

    if not candidates:
        return {"path": path, "ok": False, "reason": "no candidate blobs after portrait split",
                "sheet_size": [width, height], "n_blobs_total": len(blobs)}

    clusters = [c for c in cluster_by_height(candidates) if len(c["members"]) >= MIN_CLUSTER_MEMBERS]
    if not clusters:
        # Fall back to the best cluster even if under the member threshold,
        # but mark it low-confidence via a small member count in the result.
        clusters = cluster_by_height(candidates)
        if not clusters:
            return {"path": path, "ok": False, "reason": "no height clusters",
                     "sheet_size": [width, height], "n_blobs_total": len(blobs)}

    # Prefer the SMALLEST qualifying cluster, not the most populous one:
    # on every sheet sampled the walk cycle is the smallest repeated group
    # (idle/attack/hurt "portrait" poses are excluded above by relative
    # area, but a same-scale "other pose" repeat can still occasionally tie
    # or beat the walk cycle on member count, e.g. Tokomon).
    clusters.sort(key=lambda c: (c["mean"], -len(c["members"])))
    best = clusters[0]
    members = sorted(best["members"])
    median_h = members[len(members) // 2]

    return {
        "path": path,
        "ok": True,
        "sheet_size": [width, height],
        "n_blobs_total": len(blobs),
        "n_candidates": len(candidates),
        "n_portraits_dropped": len(portraits),
        "cluster_member_count": len(members),
        "cluster_heights": members,
        "walk_height_px": median_h,
        "low_confidence": len(members) < MIN_CLUSTER_MEMBERS,
    }


if __name__ == "__main__":
    import sys
    r = estimate_walk_height(sys.argv[1])
    import json
    print(json.dumps(r, indent=2))
