#!/usr/bin/env python3
"""Mapa-mundi v2.1 (pintado) -- GS-003.

QA (quality-overhaul/phase3/qa/QA_V11_WORLDMAP.md) deu nota 4/10 em
"ilustracao x procedural" para o worldmap-v1: "le como mapa de regioes em
cor chapada... as hachuras diagonais leem como padrao de preenchimento
vetorial/CSS, nao como textura de areia ou neve pintada a mao". Este
pacote mantem a MESMA geometria de v1 (ilha, 6 regioes, pos_pct/pos_px,
rotas -- tudo lido literalmente de worldmap-v1/generate_worldmap.py, 0
coordenada reinventada) e reescreve so a pintura:

1. Campo de elevacao por fbm (ruido de valor fractal, bilinear suavizado)
   por bioma, com sombreamento direcional por inclinacao (luz NW) -- da
   relevo real (nao so dither de 2 tons) a Montanha/Deserto/Floresta.
2. Fronteiras de bioma com dither ordenado (Bayer 4x4) numa faixa de ~5px
   em vez do corte Voronoi puro de v1 -- os dois biomas se misturam em
   pixels soltos perto da linha (mesma ideia das "mordidas" de grama na
   terra do forest-v11, aplicada aqui a escala de mapa).
3. Textura por bioma substituindo as hachuras/dither uniforme de v1:
   duna (ondulacao por fbm, nao faixa diagonal fixa), neve em nuvens (fbm
   de alto contraste, nao faixa diagonal), copa de floresta em
   aglomerados (fbm de baixa frequencia decidindo onde a copa e mais
   densa, nao 1 pixel a cada 5), trincas/glitch na Zona Corrompida em
   manchas (2 camadas de fbm, nao probabilidade uniforme por pixel).
4. Agua com profundidade em bandas suaves + espuma quebrada na costa +
   faixas de "correnteza" de baixa frequencia -- v1 tinha so 3 aneis
   concentricos de cor solida.
5. NENHUM marcador de POI assado no PNG (a causa raiz do "marcador
   residual na Vila" documentado em WORLDMAP_KIT_DEV.md: o selo assado
   fica embaixo do dinamico). `poi_icons.png` continua disponivel,
   inalterado, para o jogo desenhar todos os POIs em tempo real.

Sem PixelLab, sem PIL -- mesmo `art/_tools/pngw.py` do resto do projeto.
"""
import json
import math
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "_tools"))
from pngw import Canvas  # noqa: E402

OUT = os.path.dirname(__file__)

# ---------------------------------------------------------------- paleta ---
# Mesma ByteLine-18 do projeto + rampas de forest-v8-depth (floresta) ja
# usadas por worldmap-v1 -- 0 hex novo nessas duas. Vila/praia reaproveitam
# os tons "novos mas ja documentados" de worldmap-v1/README.md.
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
FOREST = {
    "grass_base": (0x51, 0x75, 0x4b, 255),
    "grass_dk": (0x38, 0x58, 0x3a, 255),
    "grass_vdk": (0x27, 0x3f, 0x2b, 255),
    "canopy_vvdk": (0x1b, 0x2e, 0x20, 255),
    "canopy_lt": (0x3e, 0x63, 0x3c, 255),
    "moss": (0x44, 0x58, 0x38, 255),
    "dirt_dk": (0x3f, 0x30, 0x25, 255),
    "dirt_mid": (0x58, 0x45, 0x31, 255),
    "bark_mid": (0x5e, 0x47, 0x34, 255),
    "bark_dk": (0x3a, 0x2d, 0x22, 255),
}
VILA = {
    "grass_light": (0xa9, 0xb7, 0x77, 255),
    "grass_light_dk": (0x93, 0xa1, 0x62, 255),
    "wall_cream": (0xf3, 0xe6, 0xc8, 255),
    "toy_pink": (0xe9, 0x8f, 0xb0, 255),
    "toy_blue": (0x6f, 0xb3, 0xd9, 255),
}
SAND = {"lt": (0xe8, 0xd9, 0xa8, 255), "dk": (0xcd, 0xb7, 0x7e, 255), "wet": (0xb9, 0xa0, 0x6c, 255)}
WATER_STOPS = [BL18["cyanLt"], BL18["cyan"], BL18["cyanDk"]]  # raso -> fundo, 0 hex novo


def water_ramp(u):
    """u em 0..1 (raso->fundo), interpolado pelos 3 tons existentes."""
    u = clamp(u, 0.0, 1.0)
    if u < 0.5:
        return mix(WATER_STOPS[0], WATER_STOPS[1], u * 2.0)
    return mix(WATER_STOPS[1], WATER_STOPS[2], (u - 0.5) * 2.0)

# ----------------------------------------------------------- geometria ---
# IDENTICA a worldmap-v1/generate_worldmap.py -- mesma ilha, mesmas
# posicoes/rotas, pra manter worldmap.json compativel com o que o
# game-dev ja integrou.
CANVAS_W, CANVAS_H = 640, 360
BEZEL, TOP_CHROME, BOT_CHROME = 14, 16, 14
VX0, VY0 = BEZEL, BEZEL + TOP_CHROME
VW = CANVAS_W - 2 * BEZEL
VH = CANVAS_H - BEZEL - TOP_CHROME - BOT_CHROME

POS_PCT = {
    "vila_dos_bebes": (13, 72),
    "floresta_densa": (33, 48),
    "praia_dos_postes": (56, 78),
    "montanha": (44, 18),
    "deserto": (72, 28),
    "zona_corrompida": (88, 62),
}
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


def mix(c0, c1, t):
    t = clamp(t, 0.0, 1.0)
    return tuple(int(round(c0[i] + (c1[i] - c0[i]) * t)) for i in range(4))


def hash2(x, y, seed=0):
    h = (x * 374761393 + y * 668265263 + seed * 2246822519) & 0xFFFFFFFF
    h = (h ^ (h >> 13)) * 1274126177 & 0xFFFFFFFF
    return (h ^ (h >> 16)) / 0xFFFFFFFF


_NOISE_CACHE = {}


def value_noise(x, y, seed):
    x0, y0 = math.floor(x), math.floor(y)
    tx, ty = x - x0, y - y0
    sx = tx * tx * (3 - 2 * tx)
    sy = ty * ty * (3 - 2 * ty)
    h00 = hash2(x0, y0, seed)
    h10 = hash2(x0 + 1, y0, seed)
    h01 = hash2(x0, y0 + 1, seed)
    h11 = hash2(x0 + 1, y0 + 1, seed)
    a = h00 + (h10 - h00) * sx
    b = h01 + (h11 - h01) * sx
    return a + (b - a) * sy


def fbm(x, y, seed, octaves=4, freq=0.02, lac=2.0, gain=0.5):
    amp = 1.0
    total = 0.0
    norm = 0.0
    f = freq
    for i in range(octaves):
        total += value_noise(x * f, y * f, seed + i * 101) * amp
        norm += amp
        amp *= gain
        f *= lac
    return total / norm if norm else 0.0


# --------------------------------------------------- warp + voronoi ---
def warp(x, y):
    wx = x + 14 * math.sin(y * 0.021 + 0.7) + 7 * math.sin(x * 0.015 + 1.3)
    wy = y + 14 * math.cos(x * 0.019 + 0.4) + 7 * math.cos(y * 0.017 + 2.1)
    return wx, wy


REGION_IDS = list(ANCHORS.keys())


def region_distances(x, y):
    """Distancias (ao quadrado) de (x,y) warpado a cada ancora, ordenadas."""
    wx, wy = warp(x, y)
    ds = []
    for rid in REGION_IDS:
        ax, ay = ANCHORS[rid]
        d = (wx - ax) ** 2 + (wy - ay) ** 2
        ds.append((d, rid))
    ds.sort()
    return ds


BORDER_PX = 6.0  # faixa (em "distancia de warp", ~px) onde os 2 biomas se misturam


def border_threshold(x, y):
    # ruido por pixel (nao grade ordenada Bayer) -- mordidas espalhadas tipo
    # tufo cruzando a linha, sem o padrao periodico visivel de um dither
    # ordenado nesta escala de mapa.
    return hash2(x, y, 606)


def smoothstep(edge0, edge1, x):
    t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * (3 - 2 * t)


# --------------------------------------------------------- elevacao ---
def elevation(rid, x, y):
    base = fbm(x, y, 900, octaves=4, freq=0.035)
    if rid == "montanha":
        ax, ay = ANCHORS["montanha"]
        d = math.hypot(x - ax, y - ay)
        peak = clamp(1.0 - d / 78.0, 0.0, 1.0) ** 1.3
        ridge = fbm(x, y, 910, octaves=3, freq=0.05)
        return clamp(peak * 0.82 + ridge * 0.33 + base * 0.12, 0.0, 1.25)
    if rid == "deserto":
        dune = fbm(x, y, 920, octaves=2, freq=0.055)
        return 0.22 + dune * 0.55 + base * 0.1
    if rid == "floresta_densa":
        return 0.22 + base * 0.4
    if rid == "zona_corrompida":
        jag = fbm(x, y, 930, octaves=5, freq=0.08)
        return 0.28 + jag * 0.68
    if rid == "vila_dos_bebes":
        return 0.14 + base * 0.08
    if rid == "praia_dos_postes":
        ax, ay = ANCHORS["praia_dos_postes"]
        d = math.hypot(x - ax, y - ay)
        return 0.1 + base * 0.1 - clamp(1.0 - d / 90.0, 0.0, 0.08)
    return 0.2 + base * 0.2


LIGHT3 = (-0.55, -0.62, 0.56)
_ll = math.sqrt(sum(c * c for c in LIGHT3))
LIGHT3 = tuple(c / _ll for c in LIGHT3)


def slope_shade_factor(elev_fn, x, y, rid, k=5.5):
    e_x1 = elev_fn(rid, x + 1, y)
    e_x0 = elev_fn(rid, x - 1, y)
    e_y1 = elev_fn(rid, x, y + 1)
    e_y0 = elev_fn(rid, x, y - 1)
    dx = (e_x1 - e_x0) * k
    dy = (e_y1 - e_y0) * k
    nl = math.sqrt(dx * dx + dy * dy + 1.0)
    nx, ny, nz = -dx / nl, -dy / nl, 1.0 / nl
    dot = nx * LIGHT3[0] + ny * LIGHT3[1] + nz * LIGHT3[2]
    return dot - 0.56  # ~0 no plano, negativo em face sul/leste, positivo NW


# --------------------------------------------------- textura por bioma ---
def biome_color(rid, x, y, elev):
    h = hash2(x, y, 1)
    if rid == "floresta_densa":
        canopy_density = fbm(x, y, 40, octaves=2, freq=0.045)
        tc = smoothstep(0.42, 0.68, canopy_density)
        micro = fbm(x, y, 41, octaves=2, freq=0.14)
        grass_mix = mix(FOREST["grass_base"], FOREST["grass_dk"], smoothstep(0.35, 0.65, micro))
        c = mix(grass_mix, mix(FOREST["grass_vdk"], FOREST["canopy_vvdk"], smoothstep(0.5, 0.9, canopy_density)), tc)
        if canopy_density > 0.7 and h > 0.9:
            c = mix(c, FOREST["canopy_lt"], 0.6)
        moss = fbm(x, y, 42, octaves=1, freq=0.3)
        if moss > 0.86:
            c = mix(c, FOREST["moss"], 0.7)
        return c
    if rid == "vila_dos_bebes":
        patch = fbm(x, y, 50, octaves=2, freq=0.06)
        return mix(VILA["grass_light_dk"], VILA["grass_light"], smoothstep(0.32, 0.6, patch))
    if rid == "praia_dos_postes":
        ripple = math.sin((x * 0.22 + y * 0.09) + fbm(x, y, 60, octaves=2, freq=0.07) * 6.0)
        wet = fbm(x, y, 61, octaves=2, freq=0.05)
        c = mix(SAND["dk"], SAND["lt"], smoothstep(-0.25, 0.25, ripple))
        return mix(c, SAND["wet"], smoothstep(0.55, 0.75, wet))
    if rid == "montanha":
        snow_mask = fbm(x, y, 70, octaves=3, freq=0.045)
        snowline = 0.56 - (elev - 0.5) * 0.6
        if snow_mask > snowline:
            t = clamp((snow_mask - snowline) * 3.0, 0.0, 1.0)
            return mix(BL18["mist"], BL18["paper"], t)
        rock = fbm(x, y, 71, octaves=3, freq=0.09)
        base = BL18["steel"] if rock < 0.5 else BL18["steelLt"]
        if rock > 0.82:
            base = shade(base, -0.18)
        return base
    if rid == "deserto":
        dune_tex = fbm(x, y, 80, octaves=1, freq=0.02)
        ripple = math.sin((x - y) * 0.35 + dune_tex * 8.0)
        base = BL18["amberDk"] if ripple < -0.1 else BL18["amber"]
        outcrop = fbm(x, y, 81, octaves=2, freq=0.1)
        if outcrop > 0.86:
            base = BL18["steel"]
        return base
    # zona_corrompida
    patch = fbm(x, y, 90, octaves=2, freq=0.05)
    crack = abs(fbm(x, y, 91, octaves=3, freq=0.1) - 0.5)
    base = BL18["magenta"] if patch > 0.5 else BL18["magentaDk"]
    if crack < 0.035:
        base = BL18["void"]
    glitch = hash2(x, y, 92)
    if glitch < 0.008:
        base = BL18["blood"]
    elif glitch < 0.016:
        base = BL18["cyan"]
    return base


def main():
    land = polygon_mask(VW, VH, COAST)

    owner1 = [[None] * VW for _ in range(VH)]
    owner2 = [[None] * VW for _ in range(VH)]
    gap = [[0.0] * VW for _ in range(VH)]
    for y in range(VH):
        for x in range(VW):
            if not land[y][x]:
                continue
            ds = region_distances(x, y)
            owner1[y][x] = ds[0][1]
            owner2[y][x] = ds[1][1]
            gap[y][x] = math.sqrt(ds[1][0]) - math.sqrt(ds[0][0])

    def elev_at(rid, x, y):
        return elevation(rid, x, y)

    color = [[(0, 0, 0, 0)] * VW for _ in range(VH)]
    for y in range(VH):
        for x in range(VW):
            if not land[y][x]:
                continue
            rid = owner1[y][x]
            # fronteira: dentro da faixa, parte dos pixels usa o bioma
            # vizinho (dither ordenado), igual a uma mordida de vegetacao
            # cruzando a linha, em vez do corte Voronoi puro.
            if gap[y][x] < BORDER_PX and owner2[y][x] is not None:
                t = 1.0 - clamp(gap[y][x] / BORDER_PX, 0.0, 1.0)
                if t > border_threshold(x, y):
                    rid = owner2[y][x]
            e = elev_at(rid, x, y)
            c = biome_color(rid, x, y, e)
            sfac = slope_shade_factor(elev_at, x, y, rid)
            c = shade(c, clamp(sfac * 0.6, -0.3, 0.3))
            c = shade(c, clamp((e - 0.45) * 0.18, -0.12, 0.12))
            c = shade(c, (hash2(x, y, 777) - 0.5) * 0.08)  # grao de pintura
            color[y][x] = c

    # ------------------------------------------------- oceano (BFS) ---
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
            jitter = (fbm(x, y, 150, octaves=2, freq=0.06) - 0.5) * 1.1
            depth = max(0.0, d + jitter)
            if d == 1:
                # espuma quebrada, nao anel solido
                foam_mask = hash2(x, y, 151) < 0.4
                if foam_mask:
                    color[y][x] = shade(WATER_STOPS[0], 0.22)
                    continue
            c = water_ramp(depth / 7.0)
            current = fbm(x, y, 160, octaves=2, freq=0.012)
            c = shade(c, (current - 0.5) * 0.1)
            color[y][x] = c

    # ------------------------------------------------------------ canvas
    canvas = Canvas(CANVAS_W, CANVAS_H, BL18["void"])
    canvas.rect(0, 0, CANVAS_W, CANVAS_H, BL18["void"])
    canvas.rect(2, 2, CANVAS_W - 4, CANVAS_H - 4, BL18["steel"])
    canvas.rect_outline(0, 0, CANVAS_W, CANVAS_H, BL18["ink"], 2)
    canvas.rect_outline(4, 4, CANVAS_W - 8, CANVAS_H - 8, BL18["cyan"], 1)
    ex, ey = CANVAS_W // 2, 9
    canvas.line(ex - 7, ey, ex, ey - 6, BL18["cyan"])
    canvas.line(ex, ey - 6, ex + 7, ey, BL18["cyan"])
    canvas.line(ex + 7, ey, ex, ey + 6, BL18["cyan"])
    canvas.line(ex, ey + 6, ex - 7, ey, BL18["cyan"])
    canvas.rect(ex - 1, ey - 1, 2, 2, BL18["cyanLt"])
    canvas.circle_fill(16, 9, 3, BL18["cyanDk"])
    canvas.circle_fill(CANVAS_W - 16, 9, 3, BL18["cyanDk"])
    canvas.circle_fill(20, CANVAS_H - 8, 5, BL18["steelLt"])
    canvas.circle_fill(20, CANVAS_H - 8, 2, BL18["ink"])
    canvas.circle_fill(CANVAS_W - 20, CANVAS_H - 8, 5, BL18["steelLt"])
    canvas.circle_fill(CANVAS_W - 20, CANVAS_H - 8, 2, BL18["ink"])

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

    # postes da praia
    pax, pay = ANCHORS["praia_dos_postes"]
    for i, (ox, oy) in enumerate(((14, -6), (22, 2), (8, 10))):
        px, py = int(pax + ox), int(pay + oy)
        canvas.line(px, py - 10, px, py, FOREST["bark_dk"])
        canvas.set(px - 1, py - 8, FOREST["bark_mid"])

    # brinquedos gigantes na Vila dos Bebes (decoracao, nao marcador de POI)
    vax, vay = ANCHORS["vila_dos_bebes"]
    bx0, by0 = int(vax - 10), int(vay - 10)
    canvas.rect(bx0, by0, 6, 6, VILA["toy_pink"])
    canvas.rect_outline(bx0, by0, 6, 6, BL18["ink"], 1)
    canvas.rect(bx0 + 8, by0 + 3, 6, 6, VILA["toy_blue"])
    canvas.rect_outline(bx0 + 8, by0 + 3, 6, 6, BL18["ink"], 1)
    canvas.rect(bx0 + 3, by0 - 7, 5, 5, VILA["wall_cream"])
    canvas.rect_outline(bx0 + 3, by0 - 7, 5, 5, BL18["ink"], 1)
    canvas.set(bx0 + 5, by0 - 9, BL18["amber"])

    # NENHUM icone de POI assado -- ver README "O que mudou" item 5.

    canvas.save(os.path.join(OUT, "worldmap_v2_1.png"))

    meta = {
        "image": "worldmap_v2_1.png",
        "canvas": {"width": CANVAS_W, "height": CANVAS_H},
        "viewport_px": {"x": VX0, "y": VY0, "width": VW, "height": VH},
        "source_of_positions": "prototype/world/src/ui/worldmap.ts POS (%) -- mesmos valores de worldmap-v1",
        "regions": {
            rid: {
                "name_pt": rid.replace("_", " ").title(),
                "pos_pct": list(POS_PCT[rid]),
                "pos_px": [round(ANCHORS[rid][0], 1), round(ANCHORS[rid][1], 1)],
                "icon": {
                    "vila_dos_bebes": "hub",
                    "floresta_densa": "tree",
                    "praia_dos_postes": "wave",
                    "montanha": "peak",
                    "deserto": "gear",
                    "zona_corrompida": "skull",
                }[rid],
            }
            for rid in REGION_IDS
        },
        "routes": [[a, b] for a, b in EDGES],
        "poi_icon_sheet": "poi_icons.png",
        "notes": [
            "Mesmas posicoes/rotas de worldmap-v1/worldmap.json -- compativel com a "
            "integracao ja feita pelo game-dev (src/ui/worldmap.ts).",
            "Sem 'demo_state'/marcador assado: nenhum icone de POI esta desenhado no "
            "PNG (ver README item 5) -- todo estado (here/open/locked) e desenhado "
            "em tempo real pelo jogo via poi_icons.png + pos_px, sem selo residual.",
        ],
    }
    with open(os.path.join(OUT, "worldmap.json"), "w") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)

    print("worldmap_v2_1.png + worldmap.json escritos.")


if __name__ == "__main__":
    main()
