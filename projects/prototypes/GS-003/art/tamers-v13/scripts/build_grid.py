#!/usr/bin/env python3
"""Grade 3x4 dos 12 presets v13 (south, nearest-neighbour upscale) com rotulo."""
import sys
from PIL import Image, ImageDraw, ImageFont

INBOX = "/home/openclaw/projects/GameStudio/workspaces/game-art/art/tamers-v13/_inbox"
OUT = sys.argv[1] if len(sys.argv) > 1 else "/tmp/grid.png"

PRESETS = [
    ("TAMER-0003", "Coragem", f"{INBOX}/coragem_v2_south.png"),
    ("TAMER-0004", "Amizade", f"{INBOX}/amizade_south.png"),
    ("TAMER-0005", "Amor", f"{INBOX}/amor_south.png"),
    ("TAMER-0006", "Determinacao", f"{INBOX}/determinacao_south.png"),
    ("TAMER-0007", "Esperanca", f"{INBOX}/esperanca_south.png"),
    ("TAMER-0008", "Vinculo", f"{INBOX}/vinculo_south.png"),
    ("TAMER-0009", "Raposa", f"{INBOX}/raposa_south.png"),
    ("TAMER-0010", "Vento", f"{INBOX}/vento_south.png"),
    ("TAMER-0011", "Chama", f"{INBOX}/chama_south.png"),
    ("TAMER-0012", "Vanguarda", f"{INBOX}/vanguarda_south.png"),
    ("TAMER-0013", "Xeno", f"{INBOX}/xeno_south.png"),
    ("TAMER-0014", "Furia", f"{INBOX}/furia_south.png"),
]

SCALE = 6
CELL = 36 * SCALE
PAD = 16
LABEL_H = 18
COLS, ROWS = 4, 3

W = COLS * (CELL + PAD) + PAD
H = ROWS * (CELL + PAD + LABEL_H) + PAD + 40

canvas = Image.new("RGBA", (W, H), (26, 28, 36, 255))
draw = ImageDraw.Draw(canvas)
try:
    font = ImageFont.load_default()
except Exception:
    font = None

draw.text((PAD, 10), "GS-003 Tamers v13 — 12 presets (south), canvas 36x36, estilo GBA Clean", fill=(230, 230, 230, 255), font=font)

for idx, (tid, label, path) in enumerate(PRESETS):
    col = idx % COLS
    row = idx // COLS
    im = Image.open(path).convert("RGBA")
    im_big = im.resize((im.width * SCALE, im.height * SCALE), Image.NEAREST)
    x = PAD + col * (CELL + PAD)
    y = 40 + row * (CELL + PAD + LABEL_H)
    cell_bg = Image.new("RGBA", (CELL, CELL), (40, 42, 54, 255))
    ox = (CELL - im_big.width) // 2
    oy = (CELL - im_big.height) // 2
    cell_bg.alpha_composite(im_big, (ox, oy))
    canvas.alpha_composite(cell_bg, (x, y))
    draw.text((x, y + CELL + 2), f"{tid} {label}", fill=(220, 220, 220, 255), font=font)

canvas.convert("RGB").save(OUT)
print("saved", OUT, canvas.size)
