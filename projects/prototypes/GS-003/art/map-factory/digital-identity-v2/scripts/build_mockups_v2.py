#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Mockups v2 -- Direcao Hibrida A+B sobre a MESMA captura real reaproveitada de v1
(forest01_{day,night}_full.png 1600x900 e forest01_{day,night}_clareira_zoom.png
1520x1080, seed=7, camera identica -- recaptura ao vivo em 1920x1080 nesta sessao foi
bloqueada pela politica de rede/sandbox do host, ver limitacoes no .md). A entrega
"1920x1080" vem do crop da clareira (ja nativo 1520x1080, scale=6 em relacao ao mundo)
com letterbox de 200px de cada lado -- sem esticar pixel art."""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).parent))
from common import night_tint_image, STONE, MOSS, OUTLINE, CYAN, CYAN_DARK, AMBER, AMBER_DARK, MAGENTA, MAGENTA_DARK  # noqa: E402

ROOT = Path("/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/art/map-factory/digital-identity-v2")
REF = ROOT / "reference"
PROPS = ROOT / "props"
MOCKUPS = ROOT / "mockups"
MOCKUPS.mkdir(parents=True, exist_ok=True)

FULL_SCALE = 3     # mundo -> tela, no screenshot cheio 1600x900 (mesma camera/seed de v1)
ZOOM_SCALE = 6      # mundo -> tela, no crop da clareira 1520x1080 (clip 760x540 @ scale:2)
ZOOM_OFFSET = (420, 180)  # onde o crop da clareira comeca dentro do screenshot cheio (1600-760)/2, (900-540)/2

STONE_HEXES = set(STONE)
MOSS_HEXES = set(MOSS)
GLOW_HEXES = {CYAN, CYAN_DARK, AMBER, AMBER_DARK, MAGENTA, MAGENTA_DARK, "#c8fbff"}


def to_zoom(xy):
    x, y = xy
    ox, oy = ZOOM_OFFSET
    return ((x - ox) * (ZOOM_SCALE // FULL_SCALE), (y - oy) * (ZOOM_SCALE // FULL_SCALE))


_prop_cache = {}


def load_prop(name, time, scale):
    key = (name, time, scale)
    if key in _prop_cache:
        return _prop_cache[key]
    im = Image.open(PROPS / name).convert("RGBA")
    if time == "night":
        im = night_tint_image(im, STONE_HEXES, MOSS_HEXES, GLOW_HEXES, halo=True)
    im = im.resize((im.width * scale, im.height * scale), Image.NEAREST)
    _prop_cache[key] = im
    return im


def paste_bottom(base, prop, cx, bottom_y):
    x = int(cx - prop.width / 2)
    y = int(bottom_y - prop.height)
    base.alpha_composite(prop, (x, y))


def frame_of_sheet(sheet, index, n):
    fw = sheet.width // n
    return sheet.crop((index * fw, 0, (index + 1) * fw, sheet.height))


def label(base, text, sub=None):
    d = ImageDraw.Draw(base)
    w = min(base.width - 20, 640)
    d.rectangle([0, 0, w, 56 if sub else 34], fill=(10, 12, 16, 220))
    d.text((12, 8), text, fill=(235, 240, 245, 255))
    if sub:
        d.text((12, 32), sub, fill=(170, 220, 230, 255))


# Placements em espaco do screenshot CHEIO 1600x900 (mesma convencao de v1/build_mockups.py);
# to_zoom() converte para o crop da clareira quando necessario.
PLACEMENTS = {
    "arch": (598, 340),
    "column": (500, 300),
    "tower": (1010, 330),
    "fallen": (640, 300),
    "plate_a": (560, 320),
    "plate_b": (680, 300),
    "circuit_node": (620, 360),
    "circuit_straight_1": (660, 420),
    "circuit_curve": (600, 460),
    "circuit_t": (700, 456),
    "circuit_terminal": (560, 400),
    "crystal_amber": (650, 330),
    "crystal_cyan": (540, 280),
    "portal": (820, 500),
    "glitch": (840, 440),
}
# tower fica so no frame "full" (torre ao fundo, distante -- na zoom da clareira ela nao cabe)
ZOOM_ONLY_SKIP = {"tower"}
FRAG_POSITIONS = [(455, 150), (395, 300), (1035, 260), (640, 360)]


def place_anchored(frame, time, scale, offset=(0, 0)):
    def _place(canvas, prop_file, key, extra_dy=0):
        cx, by = PLACEMENTS[key]
        if offset != (0, 0):
            cx, by = cx + offset[0], by + offset[1]
        if frame == "full":
            px, py = cx, by
        else:
            px, py = to_zoom((cx, by))
        prop = load_prop(prop_file, time, scale)
        paste_bottom(canvas, prop, px, py + extra_dy)
    return _place


def build_scene(canvas, time, frame):
    scale = FULL_SCALE if frame == "full" else ZOOM_SCALE
    place = place_anchored(frame, time, scale)
    place(canvas, "ruin_arch_96x96.png", "arch")
    place(canvas, "ruin_column_tall_32x96.png", "column")
    if not (frame == "zoom" and "tower" in ZOOM_ONLY_SKIP):
        place(canvas, "data_tower_40x104.png", "tower")
    place(canvas, "ruin_block_fallen_48x32.png", "fallen")
    place(canvas, "circuit_plate_32x32.png", "plate_a")
    place(canvas, "circuit_plate_32x32.png", "plate_b")
    place(canvas, "ground_circuit_node_32x32.png", "circuit_node")
    place(canvas, "ground_circuit_straight_32x32.png", "circuit_straight_1")
    place(canvas, "ground_circuit_curve_32x32.png", "circuit_curve")
    place(canvas, "ground_circuit_t_32x32.png", "circuit_t")
    place(canvas, "ground_circuit_terminal_32x32.png", "circuit_terminal")
    place(canvas, "crystal_amber_20x26.png", "crystal_amber")
    place(canvas, "crystal_cyan_26x34.png", "crystal_cyan")
    place(canvas, "portal_gate_80x112.png", "portal")
    # superficie de energia do portal (folha 4 quadros), 1 quadro escolhido para a foto estatica
    energy_sheet = load_prop("portal_energy_anim_4f_256x64.png", time, scale)
    frame0 = frame_of_sheet(energy_sheet, 1, 4)
    pcx, pby = PLACEMENTS["portal"]
    px, py = (pcx, pby) if frame == "full" else to_zoom((pcx, pby))
    gate_h = load_prop("portal_gate_80x112.png", time, scale).height
    canvas.alpha_composite(frame0, (int(px - frame0.width / 2), int(py - gate_h * 0.62)))
    # glitch sutil SO perto do portal (dir. C como efeito opcional, nao na vegetacao)
    glitch = load_prop("glitch_overlay_subtle_48x48.png", time, scale)
    gcx, gby = PLACEMENTS["glitch"]
    gx, gy = (gcx, gby) if frame == "full" else to_zoom((gcx, gby))
    canvas.alpha_composite(glitch, (int(gx - glitch.width / 2), int(gy - glitch.height / 2)))
    # fragmentos de dados flutuando perto do portal/clareira
    frag_sheet = load_prop("data_fragment_anim_4f_64x16.png", time, scale)
    for i, (fx, fy) in enumerate(FRAG_POSITIONS):
        fr = frame_of_sheet(frag_sheet, i % 4, 4)
        px2, py2 = (fx, fy) if frame == "full" else to_zoom((fx, fy))
        canvas.alpha_composite(fr, (int(px2 - fr.width / 2), int(py2 - fr.height / 2)))
    return canvas


def letterbox_1920(im, bar_color=(8, 10, 14, 255)):
    canvas = Image.new("RGBA", (1920, 1080), bar_color)
    x = (1920 - im.width) // 2
    y = (1080 - im.height) // 2
    canvas.alpha_composite(im.convert("RGBA"), (x, y))
    return canvas


def build_all():
    for time in ("day", "night"):
        full_ref = Image.open(REF / f"forest01_{time}_full.png").convert("RGBA")
        zoom_ref = Image.open(REF / f"forest01_{time}_clareira_zoom.png").convert("RGBA")

        before_full = letterbox_1920(full_ref.copy())
        label(before_full, f"ANTES — Digital Forest 01 ({time}, mapa completo)", "real capture 1600x900, letterbox 1920x1080")
        before_full.save(MOCKUPS / f"before_full_{time}_1920x1080.png")

        before_zoom = letterbox_1920(zoom_ref.copy())
        label(before_zoom, f"ANTES — clareira ({time})", "real capture 1520x1080, letterbox 1920x1080")
        before_zoom.save(MOCKUPS / f"before_clareira_{time}_1920x1080.png")

        after_full = build_scene(full_ref.copy(), time, "full")
        after_full_lb = letterbox_1920(after_full)
        label(after_full_lb, f"DEPOIS — Direção Híbrida A+B ({time}, mapa completo)", "ruínas + portal + torre, sobre a mesma captura real")
        after_full_lb.save(MOCKUPS / f"after_full_{time}_1920x1080.png")

        after_zoom = build_scene(zoom_ref.copy(), time, "zoom")
        after_zoom_lb = letterbox_1920(after_zoom)
        label(after_zoom_lb, f"DEPOIS — clareira, Direção Híbrida A+B ({time})", "ruínas de dados + portal + torre + circuito orgânico")
        after_zoom_lb.save(MOCKUPS / f"after_clareira_{time}_1920x1080.png")
    print("mockups v2 ok:", sorted(p.name for p in MOCKUPS.glob("*.png")))


if __name__ == "__main__":
    build_all()
