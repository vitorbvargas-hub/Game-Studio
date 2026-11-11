#!/usr/bin/env python3
"""Prancha antes (worldmap-v1) | depois (worldmap-v2_1), lado a lado.

Reimplementa a logica de PINTURA do viewport de worldmap-v1 (nao importa o
arquivo -- v1 nao expoe funcoes reutilizaveis, so um `main()` monolitico;
esta e uma copia fiel da parte de coloracao/oceano/rotas/icones de
`worldmap-v1/generate_worldmap.py`, sem a moldura de Digivice) ao lado do
viewport v2.1 (importado de `generate_worldmap_v2_1.py`, mesma funcao
usada pra gerar o PNG final -- 0 divergencia entre a prancha e o artefato
entregue). Uma faixa de 10px no topo de cada painel marca antes (ambar) vs
depois (ciano) -- sem fonte pixel disponivel neste pipeline pra escrever
"antes"/"depois" em texto.
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "_tools"))
from pngw import Canvas  # noqa: E402
import generate_worldmap_v2_1 as v21  # noqa: E402

OUT = os.path.dirname(__file__)
VW, VH = v21.VW, v21.VH
ANCHORS = v21.ANCHORS
EDGES = v21.EDGES


# ------------------------------------------------- v1, fiel ao original ---
def render_v1():
    land = v21.polygon_mask(VW, VH, v21.COAST)

    def warp(x, y):
        wx = x + 14 * math.sin(y * 0.021 + 0.7) + 7 * math.sin(x * 0.015 + 1.3)
        wy = y + 14 * math.cos(x * 0.019 + 0.4) + 7 * math.cos(y * 0.017 + 2.1)
        return wx, wy

    region_ids = list(ANCHORS.keys())

    def nearest_region(x, y):
        wx, wy = warp(x, y)
        best, best_d = None, 1e18
        for rid in region_ids:
            ax, ay = ANCHORS[rid]
            d = (wx - ax) ** 2 + (wy - ay) ** 2
            if d < best_d:
                best_d, best = d, rid
        return best

    owner = [[None] * VW for _ in range(VH)]
    for y in range(VH):
        for x in range(VW):
            if land[y][x]:
                owner[y][x] = nearest_region(x, y)

    def montanha_elev(x, y):
        ax, ay = ANCHORS["montanha"]
        d = math.hypot(x - ax, y - ay)
        e = 1.0 - v21.clamp(d / 70.0, 0.0, 1.0)
        e += (v21.hash2(x, y, 11) - 0.5) * 0.12
        return e

    BL18, FOREST, VILA, SAND = v21.BL18, v21.FOREST, v21.VILA, v21.SAND
    color = [[(0, 0, 0, 0)] * VW for _ in range(VH)]
    for y in range(VH):
        for x in range(VW):
            if not land[y][x]:
                continue
            rid = owner[y][x]
            h = v21.hash2(x, y, 1)
            if rid == "floresta_densa":
                if h < 0.12:
                    c = FOREST["canopy_vvdk"]
                elif h < 0.4:
                    c = FOREST["grass_vdk"]
                elif (x + 2 * y) % 5 == 0:
                    c = FOREST["grass_dk"]
                else:
                    c = FOREST["grass_base"]
                if v21.hash2(x, y, 2) < 0.015:
                    c = FOREST["moss"]
            elif rid == "vila_dos_bebes":
                c = VILA["grass_light"] if (x + y) % 6 else v21.shade(VILA["grass_light"], -0.12)
            elif rid == "praia_dos_postes":
                c = SAND["lt"] if h > 0.3 else SAND["dk"]
            elif rid == "montanha":
                e = montanha_elev(x, y)
                c = BL18["paper"] if e > 0.58 else (BL18["mist"] if e > 0.5 else BL18["steel"])
                if e <= 0.5 and (x + y) % 7 == 0:
                    c = BL18["steelLt"]
            elif rid == "deserto":
                band = (x - y) % 6
                c = BL18["amberDk"] if band < 2 else BL18["amber"]
                if v21.hash2(x, y, 3) < 0.02:
                    c = BL18["steel"]
            else:
                c = BL18["magenta"] if h < 0.55 else BL18["magentaDk"]
                hh = v21.hash2(x, y, 4)
                if hh < 0.01:
                    c = BL18["blood"]
                elif hh < 0.018:
                    c = BL18["cyan"]
                elif hh < 0.03:
                    c = BL18["void"]
            color[y][x] = c

    from collections import deque

    dist = [[-1] * VW for _ in range(VH)]
    dq = deque()
    for y in range(VH):
        for x in range(VW):
            if land[y][x]:
                dist[y][x] = 0
                dq.append((x, y))
    while dq:
        x, y = dq.popleft()
        d = dist[y][x]
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < VW and 0 <= ny < VH and dist[ny][nx] == -1:
                dist[ny][nx] = d + 1
                dq.append((nx, ny))
    for y in range(VH):
        for x in range(VW):
            if land[y][x]:
                continue
            d = dist[y][x]
            if d <= 1:
                c = BL18["cyanLt"]
            elif d <= 10:
                c = BL18["cyan"]
            else:
                c = BL18["cyanDk"]
            if v21.hash2(x, y, 5) < 0.01:
                c = v21.shade(c, 0.18)
            color[y][x] = c

    canvas = Canvas(VW, VH, BL18["void"])
    for y in range(VH):
        for x in range(VW):
            canvas.set(x, y, color[y][x])

    def is_land_local(lx, ly):
        return 0 <= lx < VW and 0 <= ly < VH and land[ly][lx]

    def snap_to_land(px, py, max_r=36):
        lx0, ly0 = int(px), int(py)
        if is_land_local(lx0, ly0):
            return px, py
        for r in range(1, max_r):
            for dx in range(-r, r + 1):
                for dy in (-r, r):
                    if is_land_local(lx0 + dx, ly0 + dy):
                        return lx0 + dx, ly0 + dy
            for dy in range(-r, r + 1):
                for dx in (-r, r):
                    if is_land_local(lx0 + dx, ly0 + dy):
                        return lx0 + dx, ly0 + dy
        return None

    for i, (a, b) in enumerate(EDGES):
        ax, ay = ANCHORS[a][0] - v21.VX0, ANCHORS[a][1] - v21.VY0
        bx, by = ANCHORS[b][0] - v21.VX0, ANCHORS[b][1] - v21.VY0
        mx, my = (ax + bx) / 2, (ay + by) / 2
        dx, dy = bx - ax, by - ay
        length = math.hypot(dx, dy) or 1
        nx, ny = -dy / length, dx / length
        narrow_edge = {a, b} & {"deserto", "zona_corrompida", "montanha"} and {a, b} != {"floresta_densa", "montanha"}
        off = 0 if narrow_edge else (12 if i % 2 == 0 else -12)
        cxp, cyp = mx + nx * off, my + ny * off
        steps = 56
        for s in range(steps + 1):
            t = s / steps
            px = (1 - t) ** 2 * ax + 2 * (1 - t) * t * cxp + t ** 2 * bx
            py = (1 - t) ** 2 * ay + 2 * (1 - t) * t * cyp + t ** 2 * by
            snapped = snap_to_land(px, py)
            if snapped is None or (s // 2) % 2 != 0:
                continue
            ix, iy = int(snapped[0]), int(snapped[1])
            dot = BL18["ink"] if (s % 8 == 0) else BL18["paper"]
            for ox, oy in ((0, 0), (1, 0), (0, 1), (1, 1)):
                canvas.set(ix + ox, iy + oy, dot)

    pax, pay = ANCHORS["praia_dos_postes"][0] - v21.VX0, ANCHORS["praia_dos_postes"][1] - v21.VY0
    for i, (ox, oy) in enumerate(((14, -6), (22, 2), (8, 10))):
        px, py = int(pax + ox), int(pay + oy)
        canvas.line(px, py - 10, px, py, FOREST["bark_dk"])
        canvas.set(px - 1, py - 8, FOREST["bark_mid"])

    vax, vay = ANCHORS["vila_dos_bebes"][0] - v21.VX0, ANCHORS["vila_dos_bebes"][1] - v21.VY0
    bx0, by0 = int(vax - 10), int(vay - 10)
    canvas.rect(bx0, by0, 6, 6, VILA["toy_pink"])
    canvas.rect_outline(bx0, by0, 6, 6, BL18["ink"], 1)
    canvas.rect(bx0 + 8, by0 + 3, 6, 6, VILA["toy_blue"])
    canvas.rect_outline(bx0 + 8, by0 + 3, 6, 6, BL18["ink"], 1)
    canvas.rect(bx0 + 3, by0 - 7, 5, 5, VILA["wall_cream"])
    canvas.rect_outline(bx0 + 3, by0 - 7, 5, 5, BL18["ink"], 1)
    canvas.set(bx0 + 5, by0 - 9, BL18["amber"])

    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "worldmap-v1"))
    from poi_icons import ICON_FOR, draw_icon  # noqa: E402

    progress_demo = {
        "vila_dos_bebes": "here", "floresta_densa": "open",
        "praia_dos_postes": "locked", "montanha": "locked",
        "deserto": "locked", "zona_corrompida": "locked",
    }
    for rid in region_ids:
        ax, ay = ANCHORS[rid][0] - v21.VX0, ANCHORS[rid][1] - v21.VY0
        draw_icon(canvas, int(ax), int(ay), ICON_FOR[rid], progress_demo[rid], BL18)

    return canvas


# --------------------------------------------------------------- v2.1 ---
def render_v21():
    land = v21.polygon_mask(VW, VH, v21.COAST)
    owner1 = [[None] * VW for _ in range(VH)]
    owner2 = [[None] * VW for _ in range(VH)]
    gap = [[0.0] * VW for _ in range(VH)]
    for y in range(VH):
        for x in range(VW):
            if not land[y][x]:
                continue
            ds = v21.region_distances(x, y)
            owner1[y][x] = ds[0][1]
            owner2[y][x] = ds[1][1]
            gap[y][x] = math.sqrt(ds[1][0]) - math.sqrt(ds[0][0])

    color = [[(0, 0, 0, 0)] * VW for _ in range(VH)]
    for y in range(VH):
        for x in range(VW):
            if not land[y][x]:
                continue
            rid = owner1[y][x]
            if gap[y][x] < v21.BORDER_PX and owner2[y][x] is not None:
                t = 1.0 - v21.clamp(gap[y][x] / v21.BORDER_PX, 0.0, 1.0)
                if t > v21.border_threshold(x, y):
                    rid = owner2[y][x]
            e = v21.elevation(rid, x, y)
            c = v21.biome_color(rid, x, y, e)
            sfac = v21.slope_shade_factor(v21.elevation, x, y, rid)
            c = v21.shade(c, v21.clamp(sfac * 0.6, -0.3, 0.3))
            c = v21.shade(c, v21.clamp((e - 0.45) * 0.18, -0.12, 0.12))
            c = v21.shade(c, (v21.hash2(x, y, 777) - 0.5) * 0.08)
            color[y][x] = c

    from collections import deque

    dist = [[-1] * VW for _ in range(VH)]
    dq = deque()
    for y in range(VH):
        for x in range(VW):
            if land[y][x]:
                dist[y][x] = 0
                dq.append((x, y))
    while dq:
        x, y = dq.popleft()
        d = dist[y][x]
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < VW and 0 <= ny < VH and dist[ny][nx] == -1:
                dist[ny][nx] = d + 1
                dq.append((nx, ny))
    for y in range(VH):
        for x in range(VW):
            if land[y][x]:
                continue
            d = dist[y][x]
            jitter = (v21.fbm(x, y, 150, octaves=2, freq=0.06) - 0.5) * 1.1
            depth = max(0.0, d + jitter)
            if d == 1 and v21.hash2(x, y, 151) < 0.4:
                color[y][x] = v21.shade(v21.WATER_STOPS[0], 0.22)
                continue
            c = v21.water_ramp(depth / 7.0)
            current = v21.fbm(x, y, 160, octaves=2, freq=0.012)
            c = v21.shade(c, (current - 0.5) * 0.1)
            color[y][x] = c

    canvas = Canvas(VW, VH, v21.BL18["void"])
    for y in range(VH):
        for x in range(VW):
            canvas.set(x, y, color[y][x])

    def is_land_local(lx, ly):
        return 0 <= lx < VW and 0 <= ly < VH and land[ly][lx]

    def snap_to_land(px, py, max_r=36):
        lx0, ly0 = int(px), int(py)
        if is_land_local(lx0, ly0):
            return px, py
        for r in range(1, max_r):
            for dx in range(-r, r + 1):
                for dy in (-r, r):
                    if is_land_local(lx0 + dx, ly0 + dy):
                        return lx0 + dx, ly0 + dy
            for dy in range(-r, r + 1):
                for dx in (-r, r):
                    if is_land_local(lx0 + dx, ly0 + dy):
                        return lx0 + dx, ly0 + dy
        return None

    BL18, FOREST, VILA = v21.BL18, v21.FOREST, v21.VILA
    for i, (a, b) in enumerate(EDGES):
        ax, ay = ANCHORS[a][0] - v21.VX0, ANCHORS[a][1] - v21.VY0
        bx, by = ANCHORS[b][0] - v21.VX0, ANCHORS[b][1] - v21.VY0
        mx, my = (ax + bx) / 2, (ay + by) / 2
        dx, dy = bx - ax, by - ay
        length = math.hypot(dx, dy) or 1
        nx, ny = -dy / length, dx / length
        narrow_edge = {a, b} & {"deserto", "zona_corrompida", "montanha"} and {a, b} != {"floresta_densa", "montanha"}
        off = 0 if narrow_edge else (12 if i % 2 == 0 else -12)
        cxp, cyp = mx + nx * off, my + ny * off
        steps = 56
        for s in range(steps + 1):
            t = s / steps
            px = (1 - t) ** 2 * ax + 2 * (1 - t) * t * cxp + t ** 2 * bx
            py = (1 - t) ** 2 * ay + 2 * (1 - t) * t * cyp + t ** 2 * by
            snapped = snap_to_land(px, py)
            if snapped is None or (s // 2) % 2 != 0:
                continue
            ix, iy = int(snapped[0]), int(snapped[1])
            dot = BL18["ink"] if (s % 8 == 0) else BL18["cyanLt"]
            for ox, oy in ((0, 0), (1, 0), (0, 1), (1, 1)):
                canvas.set(ix + ox, iy + oy, dot)

    pax, pay = ANCHORS["praia_dos_postes"][0] - v21.VX0, ANCHORS["praia_dos_postes"][1] - v21.VY0
    for i, (ox, oy) in enumerate(((14, -6), (22, 2), (8, 10))):
        px, py = int(pax + ox), int(pay + oy)
        canvas.line(px, py - 10, px, py, FOREST["bark_dk"])
        canvas.set(px - 1, py - 8, FOREST["bark_mid"])

    vax, vay = ANCHORS["vila_dos_bebes"][0] - v21.VX0, ANCHORS["vila_dos_bebes"][1] - v21.VY0
    bx0, by0 = int(vax - 10), int(vay - 10)
    canvas.rect(bx0, by0, 6, 6, VILA["toy_pink"])
    canvas.rect_outline(bx0, by0, 6, 6, BL18["ink"], 1)
    canvas.rect(bx0 + 8, by0 + 3, 6, 6, VILA["toy_blue"])
    canvas.rect_outline(bx0 + 8, by0 + 3, 6, 6, BL18["ink"], 1)
    canvas.rect(bx0 + 3, by0 - 7, 5, 5, VILA["wall_cream"])
    canvas.rect_outline(bx0 + 3, by0 - 7, 5, 5, BL18["ink"], 1)
    canvas.set(bx0 + 5, by0 - 9, BL18["amber"])

    return canvas


def main():
    before = render_v1()
    after = render_v21()
    gap = 10
    tab_h = 10
    W = VW * 2 + gap
    H = VH + tab_h
    out = Canvas(W, H, v21.BL18["ink"])
    out.rect(0, 0, VW, tab_h, v21.BL18["amber"])  # antes
    out.rect(VW + gap, 0, VW, tab_h, v21.BL18["cyan"])  # depois
    for y in range(VH):
        for x in range(VW):
            out.set(x, tab_h + y, before.get(x, y))
            out.set(VW + gap + x, tab_h + y, after.get(x, y))
    out.rect_outline(0, tab_h, VW, VH, v21.BL18["ink"], 1)
    out.rect_outline(VW + gap, tab_h, VW, VH, v21.BL18["ink"], 1)
    out.save(os.path.join(OUT, "before_after_worldmap.png"))
    print("before_after_worldmap.png escrito (faixa ambar = antes v1, faixa ciano = depois v2.1).")


if __name__ == "__main__":
    main()
