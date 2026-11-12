#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Contact sheet com zoom 2x de cada peca do kit v2 (dia), lado a lado com rotulo --
'zoom 2x nas pecas' pedido no briefing."""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path("/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/art/map-factory/digital-identity-v2")
PROPS = ROOT / "props"
OUT = ROOT / "mockups" / "props_zoom2x_contact_sheet.png"

ITEMS = [
    ("ruin_pillar_small_32x32.png", "ruin_pillar_small"),
    ("ruin_column_tall_32x96.png", "ruin_column_tall"),
    ("ruin_arch_96x96.png", "ruin_arch (assinatura)"),
    ("ruin_block_fallen_48x32.png", "ruin_block_fallen"),
    ("circuit_plate_32x32.png", "circuit_plate"),
    ("ground_circuit_straight_32x32.png", "circuit: reto"),
    ("ground_circuit_curve_32x32.png", "circuit: curva"),
    ("ground_circuit_t_32x32.png", "circuit: T"),
    ("ground_circuit_node_32x32.png", "circuit: nó"),
    ("ground_circuit_terminal_32x32.png", "circuit: terminal"),
    ("portal_gate_80x112.png", "portal_gate"),
    ("data_tower_40x104.png", "data_tower"),
    ("crystal_cyan_26x34.png", "crystal_cyan"),
    ("crystal_amber_20x26.png", "crystal_amber"),
    ("crystal_magenta_16x20.png", "crystal_magenta"),
    ("crystal_cluster_mixed_36x50.png", "crystal_cluster"),
    ("glitch_overlay_subtle_48x48.png", "glitch (dir. C, sutil)"),
]

CELL_W, CELL_H, PAD, LABEL_H = 200, 240, 12, 18
COLS = 6
ROWS = (len(ITEMS) + COLS - 1) // COLS
sheet = Image.new("RGBA", (COLS * (CELL_W + PAD) + PAD, ROWS * (CELL_H + LABEL_H + PAD) + PAD), (18, 20, 26, 255))
d = ImageDraw.Draw(sheet)

for i, (fname, label) in enumerate(ITEMS):
    col, row = i % COLS, i // COLS
    cx = PAD + col * (CELL_W + PAD)
    cy = PAD + row * (CELL_H + LABEL_H + PAD)
    im = Image.open(PROPS / fname).convert("RGBA")
    im2x = im.resize((im.width * 2, im.height * 2), Image.NEAREST)
    d.rectangle([cx, cy, cx + CELL_W, cy + CELL_H], outline=(60, 64, 72, 255))
    px = cx + (CELL_W - im2x.width) // 2
    py = cy + (CELL_H - im2x.height) // 2
    sheet.alpha_composite(im2x, (max(cx, px), max(cy, py)))
    d.text((cx + 4, cy + CELL_H + 2), label, fill=(225, 230, 235, 255))

sheet.save(OUT)
print("ok", OUT)
