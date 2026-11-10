#!/usr/bin/env python3
"""Ícones de POI do mapa-múndi (16x16), um por tipo de região + 3 estados
(here/open/locked). Usado por generate_worldmap.py e também exportado como
sprite sheet standalone (poi_icons.png) para a engine desenhar os marcadores
dinamicamente (coordenadas em worldmap.json), sem precisar reabrir o PNG do
mapa inteiro.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "_tools"))
from pngw import Canvas  # noqa: E402

ICON_FOR = {
    "vila_dos_bebes": "hub",
    "floresta_densa": "tree",
    "praia_dos_postes": "wave",
    "montanha": "peak",
    "deserto": "gear",
    "zona_corrompida": "skull",
}
ORDER = ["hub", "tree", "wave", "peak", "gear", "skull"]


def _glyph(c, cx, cy, kind, col):
    """Desenha o glifo 16x16 centrado em (cx,cy), cor sólida `col`."""
    L = lambda x0, y0, x1, y1: c.line(cx + x0, cy + y0, cx + x1, cy + y1, col)
    R = lambda x0, y0, w, h: c.rect(cx + x0, cy + y0, w, h, col)
    if kind == "hub":  # casinha (vila)
        R(-5, -1, 10, 6)
        L(-6, -1, 0, -7)
        L(0, -7, 6, -1)
        R(-2, 1, 3, 4)
    elif kind == "tree":  # pinheiro (floresta)
        R(-1, 3, 2, 3)
        L(-6, 2, 0, -7)
        L(0, -7, 6, 2)
        L(-4, 2, 0, -2)
        L(0, -2, 4, 2)
    elif kind == "wave":  # onda + poste (praia)
        L(-7, 1, -3, -2)
        L(-3, -2, 1, 1)
        L(1, 1, 5, -2)
        L(5, -2, 7, 0)
        R(2, -7, 1, 6)
    elif kind == "peak":  # montanha com neve
        L(-7, 3, 0, -6)
        L(0, -6, 7, 3)
        L(-7, 3, 7, 3)
        L(-2, -1, 0, -3)
        L(0, -3, 2, -1)
    elif kind == "gear":  # engrenagem (deserto mecânico)
        c.circle_fill(cx, cy, 4, col)
        c.circle_fill(cx, cy, 2, (0, 0, 0, 0))
        for ang in range(0, 360, 45):
            import math

            rx = cx + round(6 * math.cos(math.radians(ang)))
            ry = cy + round(6 * math.sin(math.radians(ang)))
            c.rect(rx - 1, ry - 1, 2, 2, col)
    elif kind == "skull":  # caveira (zona corrompida)
        c.circle_fill(cx, cy - 1, 5, col)
        R(-2, 2, 1, 2)
        R(1, 2, 1, 2)
        c.rect(cx - 2, cy - 2, 1, 1, (0, 0, 0, 0))
        c.rect(cx + 1, cy - 2, 1, 1, (0, 0, 0, 0))


def draw_icon(canvas, x, y, kind, state, pal):
    """Desenha o marcador completo (anel de estado + glifo) no canvas do
    mapa, centrado em (x, y). state: 'here' | 'open' | 'locked'."""
    if state == "here":
        canvas.circle_fill(x, y, 8, pal["cyanLt"])
        canvas.circle_fill(x, y, 6, pal["void"])
        glyph_col = pal["paper"]
    elif state == "open":
        canvas.circle_fill(x, y, 7, pal["cyanDk"])
        canvas.circle_fill(x, y, 5, pal["void"])
        glyph_col = pal["paper"]
    else:  # locked
        canvas.circle_fill(x, y, 7, pal["ink"])
        canvas.circle_fill(x, y, 5, pal["steel"])
        glyph_col = pal["mist"]
    _glyph(canvas, x, y, kind, glyph_col)
    if state == "locked":
        # cadeado pequeno no canto inferior-direito do marcador
        canvas.rect(x + 3, y + 3, 4, 3, pal["ink"])
        canvas.rect_outline(x + 3, y + 1, 4, 3, pal["mist"], 1)


def build_sheet():
    cell = 16
    w, h = cell * len(ORDER), cell * 2
    c = Canvas(w, h, (0, 0, 0, 0))
    pal_white = (0xee, 0xf2, 0xfb, 255)
    pal_mist = (0xae, 0xbb, 0xd6, 255)
    for i, kind in enumerate(ORDER):
        cx = i * cell + cell // 2
        _glyph(c, cx, cell // 2, kind, pal_white)
    for i, kind in enumerate(ORDER):
        cx = i * cell + cell // 2
        cy = cell + cell // 2
        c.rect_outline(cx - 6, cy - 6, 12, 12, pal_mist, 1)
        _glyph(c, cx, cy, kind, pal_mist)
        c.rect(cx + 3, cy + 3, 4, 3, (0x12, 0x12, 0x1c, 255))
    return c


if __name__ == "__main__":
    out = os.path.dirname(__file__)
    build_sheet().save(os.path.join(out, "poi_icons.png"))
    print("poi_icons.png escrito:", ORDER)
