#!/usr/bin/env python3
"""Mapa-múndi v1 (retomada) — GS-003, File Island fã-feita.

Reprovado na primeira entrega: ruído procedural repetitivo (mosaico), sem
relação com o GDD. Esta versão desenha **um continente autorado à mão**
(spline fechada por pontos de controle escolhidos manualmente, não ruído
periódico) com as 6 regiões reais do GDD (`regions.json` /
`src/ui/worldmap.ts`), cada uma com bioma reconhecível, rotas conectando-as
como no grafo real, ícones de POI com estado (aqui/liberada/bloqueada), e
uma moldura de Digivice ao redor. Sem PixelLab, sem PIL — PNG escrito à mão
(`art/_tools/pngw.py`), paleta ByteLine-18 do projeto
(`art/PIXEL_ART_DIRECTION.md` §3) + rampas de grama/terra/madeira de
`art/map-factory/forest-v8-depth/palette.json` para a Floresta Densa.
"""
import json
import math
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "_tools"))
from pngw import Canvas  # noqa: E402

OUT = os.path.dirname(__file__)

# ---------------------------------------------------------------- paleta ---
BL18 = {
    "ink": (0x12, 0x12, 0x1c, 255),
    "void": (0x1d, 0x22, 0x38, 255),
    "steel": (0x3a, 0x47, 0x66, 255),
    "steelLt": (0x6b, 0x7a, 0xa1, 255),
    "mist": (0xae, 0xbb, 0xd6, 255),
    "paper": (0xee, 0xf2, 0xfb, 255),
    "cyan": (0x3f, 0xe0, 0xd0, 255),
    "cyanDk": (0x1c, 0x8b, 0x86, 255),
    "cyanLt": (0xa4, 0xf7, 0xef, 255),
    "magenta": (0xe8, 0x45, 0x9d, 255),
    "magentaDk": (0x8a, 0x27, 0x63, 255),
    "amber": (0xff, 0xd2, 0x7a, 255),
    "amberDk": (0xd9, 0x9a, 0x33, 255),
    "volt": (0x9d, 0xf2, 0x4a, 255),
    "blood": (0xe8, 0x46, 0x5f, 255),
    "bgGrid": (0x0c, 0x10, 0x24, 255),
}
# Rampas reaproveitadas de forest-v8-depth/palette.json (grama/terra/casca) —
# nenhum hex novo para o bioma Floresta Densa.
FOREST = {
    "grass_base": (0x51, 0x75, 0x4b, 255),
    "grass_dk": (0x38, 0x58, 0x3a, 255),
    "grass_vdk": (0x27, 0x3f, 0x2b, 255),
    "canopy_vvdk": (0x1b, 0x2e, 0x20, 255),
    "moss": (0x44, 0x58, 0x38, 255),
    "dirt_dk": (0x3f, 0x30, 0x25, 255),
    "dirt_mid": (0x58, 0x45, 0x31, 255),
    "bark_mid": (0x5e, 0x47, 0x34, 255),
    "bark_dk": (0x3a, 0x2d, 0x22, 255),
}
# Novo (não estava no projeto): paleta pastel da Vila dos Bebês (brinquedos
# gigantes), documentado — ver README "Paleta".
VILA = {
    "grass_light": (0xa9, 0xb7, 0x77, 255),
    "wall_cream": (0xf3, 0xe6, 0xc8, 255),
    "toy_pink": (0xe9, 0x8f, 0xb0, 255),
    "toy_blue": (0x6f, 0xb3, 0xd9, 255),
}
SAND = {"lt": (0xe8, 0xd9, 0xa8, 255), "dk": (0xcd, 0xb7, 0x7e, 255)}

# ----------------------------------------------------------- geometria ---
CANVAS_W, CANVAS_H = 640, 360
BEZEL, TOP_CHROME, BOT_CHROME = 14, 16, 14
VX0, VY0 = BEZEL, BEZEL + TOP_CHROME
VW = CANVAS_W - 2 * BEZEL
VH = CANVAS_H - BEZEL - TOP_CHROME - BOT_CHROME

# Posições (%) — IDÊNTICAS a src/ui/worldmap.ts `POS` (não reinventadas).
POS_PCT = {
    "vila_dos_bebes": (13, 72),
    "floresta_densa": (33, 48),
    "praia_dos_postes": (56, 78),
    "montanha": (44, 18),
    "deserto": (72, 28),
    "zona_corrompida": (88, 62),
}
# Grafo de rotas — IDÊNTICO a regions.json `routesTo` (par únicos).
EDGES = [
    ("floresta_densa", "vila_dos_bebes"),
    ("floresta_densa", "praia_dos_postes"),
    ("floresta_densa", "montanha"),
    ("montanha", "deserto"),
    ("deserto", "zona_corrompida"),
]


def pct_to_px(pct):
    x, y = pct
    return (VX0 + x / 100.0 * VW, VY0 + y / 100.0 * VH)


ANCHORS = {k: pct_to_px(v) for k, v in POS_PCT.items()}

# Pontos de controle do litoral (%), autorados à mão — NÃO é ruído
# periódico: cada vértice foi colocado para dar a cada região um relevo
# reconhecível (cabo norte da Montanha, planalto do Deserto, istmo estreito
# para a Zona Corrompida, baía entre Floresta/Praia, península da Vila e
# ponta sul da Praia dos Postes).
ISLAND_CTRL_PCT = [
    (40, 8), (50, 10), (58, 16),
    (70, 12), (80, 16), (86, 22), (90, 30),
    (84, 34), (88, 40), (96, 46), (98, 56), (94, 66), (86, 72), (80, 66),
    (76, 54), (70, 46), (64, 40), (58, 34), (52, 30), (46, 24), (40, 20),
    (34, 26), (28, 34), (22, 42), (16, 50), (10, 58), (6, 66), (8, 76),
    (14, 84), (22, 80), (28, 74), (36, 78), (44, 86), (52, 84), (60, 78),
    (56, 64), (48, 56), (42, 44),
]
ISLAND_CTRL = [pct_to_px(p) for p in ISLAND_CTRL_PCT]


def catmull_rom_closed(points, steps=10):
    n = len(points)
    out = []
    for i in range(n):
        p0 = points[(i - 1) % n]
        p1 = points[i % n]
        p2 = points[(i + 1) % n]
        p3 = points[(i + 2) % n]
        for s in range(steps):
            t = s / steps
            t2, t3 = t * t, t * t * t
            x = 0.5 * (
                2 * p1[0] + (-p0[0] + p2[0]) * t
                + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2
                + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3
            )
            y = 0.5 * (
                2 * p1[1] + (-p0[1] + p2[1]) * t
                + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2
                + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3
            )
            out.append((x, y))
    return out


COAST = catmull_rom_closed(ISLAND_CTRL, steps=12)


def polygon_mask(width, height, poly):
    mask = [[False] * width for _ in range(height)]
    n = len(poly)
    edges = [(poly[i][0], poly[i][1], poly[(i + 1) % n][0], poly[(i + 1) % n][1]) for i in range(n)]
    for y in range(height):
        yc = y + 0.5
        xs = []
        for x1, y1, x2, y2 in edges:
            if (y1 <= yc < y2) or (y2 <= yc < y1):
                t = (yc - y1) / (y2 - y1)
                xs.append(x1 + t * (x2 - x1))
        xs.sort()
        for i in range(0, len(xs) - 1, 2):
            xa, xb = xs[i], xs[i + 1]
            xa_i = max(0, int(math.ceil(xa - 0.5)))
            xb_i = min(width - 1, int(math.floor(xb - 0.5)))
            for x in range(xa_i, xb_i + 1):
                mask[y][x] = True
    return mask


def point_in_polygon(pt, poly):
    x, y = pt
    inside = False
    n = len(poly)
    for i in range(n):
        x1, y1 = poly[i]
        x2, y2 = poly[(i + 1) % n]
        if (y1 > y) != (y2 > y):
            xin = x1 + (y - y1) * (x2 - x1) / (y2 - y1)
            if x < xin:
                inside = not inside
    return inside


def clamp(v, lo, hi):
    return lo if v < lo else hi if v > hi else v


def shade(color, f):
    r, g, b, a = color
    f = clamp(f, -1.0, 1.0)
    if f >= 0:
        r = r + (255 - r) * f
        g = g + (255 - g) * f
        b = b + (255 - b) * f
    else:
        r = r * (1 + f)
        g = g * (1 + f)
        b = b * (1 + f)
    return (int(clamp(r, 0, 255)), int(clamp(g, 0, 255)), int(clamp(b, 0, 255)), a)


def hash2(x, y, seed=0):
    h = (x * 374761393 + y * 668265263 + seed * 2246822519) & 0xFFFFFFFF
    h = (h ^ (h >> 13)) * 1274126177 & 0xFFFFFFFF
    return (h ^ (h >> 16)) / 0xFFFFFFFF


def main():
    for rid, (ax, ay) in ANCHORS.items():
        ok = point_in_polygon((ax, ay), COAST)
        print(f"anchor {rid}: ({ax:.1f},{ay:.1f}) inside={ok}")

    land = polygon_mask(VW, VH, COAST)

    # --- warp (2 termos largos e fixos — não é ruído periódico de textura,
    # só ondula o contorno dos domínios de bioma para não ficarem retos) ---
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

    # ---------------------------------------------------- colorir bioma ---
    def montanha_elev(x, y):
        ax, ay = ANCHORS["montanha"]
        d = math.hypot(x - ax, y - ay)
        e = 1.0 - clamp(d / 70.0, 0.0, 1.0)
        e += (hash2(x, y, 11) - 0.5) * 0.12
        return e

    color = [[(0, 0, 0, 0)] * VW for _ in range(VH)]
    for y in range(VH):
        for x in range(VW):
            if not land[y][x]:
                continue
            rid = owner[y][x]
            h = hash2(x, y, 1)
            if rid == "floresta_densa":
                if h < 0.12:
                    c = FOREST["canopy_vvdk"]
                elif h < 0.4:
                    c = FOREST["grass_vdk"]
                elif (x + 2 * y) % 5 == 0:
                    c = FOREST["grass_dk"]
                else:
                    c = FOREST["grass_base"]
                if hash2(x, y, 2) < 0.015:
                    c = FOREST["moss"]
            elif rid == "vila_dos_bebes":
                c = VILA["grass_light"] if (x + y) % 6 else shade(VILA["grass_light"], -0.12)
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
                if hash2(x, y, 3) < 0.02:
                    c = BL18["steel"]
            else:  # zona_corrompida
                c = BL18["magenta"] if h < 0.55 else BL18["magentaDk"]
                hh = hash2(x, y, 4)
                if hh < 0.01:
                    c = BL18["blood"]
                elif hh < 0.018:
                    c = BL18["cyan"]
                elif hh < 0.03:
                    c = BL18["void"]
            color[y][x] = c

    # ------------------------------------------------- oceano (BFS) ---
    # Profundidade = distância (em células) até a terra mais próxima, por
    # busca em largura multi-fonte — segue o litoral de verdade, não um
    # círculo centrado no meio do mapa.
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
            if hash2(x, y, 5) < 0.01:
                c = shade(c, 0.18)
            color[y][x] = c

    # ------------------------------------------------------------ canvas
    canvas = Canvas(CANVAS_W, CANVAS_H, BL18["void"])

    # Moldura de Digivice
    canvas.rect(0, 0, CANVAS_W, CANVAS_H, BL18["void"])
    canvas.rect(2, 2, CANVAS_W - 4, CANVAS_H - 4, BL18["steel"])
    canvas.rect_outline(0, 0, CANVAS_W, CANVAS_H, BL18["ink"], 2)
    canvas.rect_outline(4, 4, CANVAS_W - 8, CANVAS_H - 8, BL18["cyan"], 1)
    # emblema (losango) no topo central
    ex, ey = CANVAS_W // 2, 9
    canvas.line(ex - 7, ey, ex, ey - 6, BL18["cyan"])
    canvas.line(ex, ey - 6, ex + 7, ey, BL18["cyan"])
    canvas.line(ex + 7, ey, ex, ey + 6, BL18["cyan"])
    canvas.line(ex, ey + 6, ex - 7, ey, BL18["cyan"])
    canvas.rect(ex - 1, ey - 1, 2, 2, BL18["cyanLt"])
    canvas.circle_fill(16, 9, 3, BL18["cyanDk"])
    canvas.circle_fill(CANVAS_W - 16, 9, 3, BL18["cyanDk"])
    # botões físicos (decorativos) embaixo
    canvas.circle_fill(20, CANVAS_H - 8, 5, BL18["steelLt"])
    canvas.circle_fill(20, CANVAS_H - 8, 2, BL18["ink"])
    canvas.circle_fill(CANVAS_W - 20, CANVAS_H - 8, 5, BL18["steelLt"])
    canvas.circle_fill(CANVAS_W - 20, CANVAS_H - 8, 2, BL18["ink"])

    # pintar o viewport
    for y in range(VH):
        for x in range(VW):
            canvas.set(VX0 + x, VY0 + y, color[y][x])
    canvas.rect_outline(VX0 - 1, VY0 - 1, VW + 2, VH + 2, BL18["ink"], 1)

    # --------------------------------------------------------- rotas ---
    def is_land_local(lx, ly):
        return 0 <= lx < VW and 0 <= ly < VH and land[ly][lx]

    def snap_to_land(px, py, max_r=36):
        lx0, ly0 = int(px - VX0), int(py - VY0)
        if is_land_local(lx0, ly0):
            return px, py
        for r in range(1, max_r):
            for dx in range(-r, r + 1):
                for dy in (-r, r):
                    if is_land_local(lx0 + dx, ly0 + dy):
                        return VX0 + lx0 + dx, VY0 + ly0 + dy
            for dy in range(-r, r + 1):
                for dx in (-r, r):
                    if is_land_local(lx0 + dx, ly0 + dy):
                        return VX0 + lx0 + dx, VY0 + ly0 + dy
        return None

    for i, (a, b) in enumerate(EDGES):
        ax, ay = ANCHORS[a]
        bx, by = ANCHORS[b]
        mx, my = (ax + bx) / 2, (ay + by) / 2
        dx, dy = bx - ax, by - ay
        length = math.hypot(dx, dy) or 1
        nx, ny = -dy / length, dx / length
        # offset curvo só nos trechos largos (evita a curva sair da faixa
        # estreita do istmo Deserto↔Zona Corrompida e Montanha↔Deserto)
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

    # postes da praia (3 marcos de madeira saindo da água perto da ponta)
    pax, pay = ANCHORS["praia_dos_postes"]
    for i, (ox, oy) in enumerate(((14, -6), (22, 2), (8, 10))):
        px, py = int(pax + ox), int(pay + oy)
        canvas.line(px, py - 10, px, py, FOREST["bark_dk"])
        canvas.set(px - 1, py - 8, FOREST["bark_mid"])

    # brinquedos gigantes na Vila dos Bebês
    vax, vay = ANCHORS["vila_dos_bebes"]
    bx0, by0 = int(vax - 10), int(vay - 10)
    canvas.rect(bx0, by0, 6, 6, VILA["toy_pink"])
    canvas.rect_outline(bx0, by0, 6, 6, BL18["ink"], 1)
    canvas.rect(bx0 + 8, by0 + 3, 6, 6, VILA["toy_blue"])
    canvas.rect_outline(bx0 + 8, by0 + 3, 6, 6, BL18["ink"], 1)
    canvas.rect(bx0 + 3, by0 - 7, 5, 5, VILA["wall_cream"])
    canvas.rect_outline(bx0 + 3, by0 - 7, 5, 5, BL18["ink"], 1)
    canvas.set(bx0 + 5, by0 - 9, BL18["amber"])

    # ------------------------------------------------- ícones de POI ---
    from poi_icons import ICON_FOR, draw_icon  # noqa: E402

    progress_demo = {
        "vila_dos_bebes": "here",
        "floresta_densa": "open",
        "praia_dos_postes": "locked",
        "montanha": "locked",
        "deserto": "locked",
        "zona_corrompida": "locked",
    }
    for rid, (ax, ay) in ANCHORS.items():
        state = progress_demo[rid]
        draw_icon(canvas, int(ax), int(ay), ICON_FOR[rid], state, BL18)

    canvas.save(os.path.join(OUT, "worldmap_v1.png"))

    # --------------------------------------------------------- json ---
    meta = {
        "image": "worldmap_v1.png",
        "canvas": {"width": CANVAS_W, "height": CANVAS_H},
        "viewport_px": {"x": VX0, "y": VY0, "width": VW, "height": VH},
        "source_of_positions": "prototype/world/src/ui/worldmap.ts POS (%) — mesmos valores",
        "regions": {
            rid: {
                "name_pt": rid.replace("_", " ").title(),
                "pos_pct": list(POS_PCT[rid]),
                "pos_px": [round(ANCHORS[rid][0], 1), round(ANCHORS[rid][1], 1)],
                "icon": ICON_FOR[rid],
                "demo_state": progress_demo[rid],
            }
            for rid in region_ids
        },
        "routes": [[a, b] for a, b in EDGES],
        "poi_icon_sheet": "poi_icons.png",
        "notes": [
            "demo_state foi calculado com unlockState()/canTravel() de world/regions.ts "
            "para tamerLevel=1 e nenhum chefe derrotado (estado inicial de uma run nova).",
            "Estados possíveis: here | open | locked (ver poi_icons.py draw_icon()).",
        ],
    }
    with open(os.path.join(OUT, "worldmap.json"), "w") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)

    print("worldmap_v1.png +", "worldmap.json escritos.")


if __name__ == "__main__":
    main()
