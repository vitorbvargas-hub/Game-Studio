#!/usr/bin/env python3
"""Prancha de escala: v13 Coragem x Tamer atual (TAMER-0003) x Guilmon oficial
(CREATURE-0003), todos no mesmo fator de zoom nearest-neighbour, com uma linha
de 32px (tile) marcada para referencia. Os dois sprites OFICIAIS (Tamer atual,
Guilmon) sao ampliados por fator INTEIRO nearest-neighbour (regra dura do
Style Bible); o v13 (arte nova, nao oficial) idem para integridade visual."""
import sys
from PIL import Image, ImageDraw, ImageFont

INBOX = "/home/openclaw/workspaces/game-art/art/tamers-v13/_inbox"
INBOX = "/home/openclaw/projects/GameStudio/workspaces/game-art/art/tamers-v13/_inbox"
OUT = sys.argv[1] if len(sys.argv) > 1 else "/tmp/scale_cmp.png"

ZOOM = 8
TILE = 32

def load(path):
    return Image.open(path).convert("RGBA")

v13 = load(f"{INBOX}/coragem_v2_south.png")          # 36x36, content 24x34
cur = load(f"{INBOX}/current_tamer0003_SE.png")       # 26x33 (official, diagonal pose)
gui = load(f"{INBOX}/guilmon_official_S.png")         # 30x34 (official)

def bbox_crop(im):
    b = im.getbbox()
    return im.crop(b) if b else im

v13c = bbox_crop(v13)
curc = bbox_crop(cur)
guic = bbox_crop(gui)

print("content sizes: v13", v13c.size, "tamer-atual", curc.size, "guilmon", guic.size)

def zoomed(im, z=ZOOM):
    return im.resize((im.width * z, im.height * z), Image.NEAREST)

v13z, curz, guiz = zoomed(v13c), zoomed(curc), zoomed(guic)

pad = 40
col_w = max(v13z.width, curz.width, guiz.width) + pad * 2
row_h = max(v13z.height, curz.height, guiz.height) + 90
tile_h = TILE * ZOOM

W = col_w * 3
H = row_h + 60

canvas = Image.new("RGBA", (W, H), (24, 26, 33, 255))
draw = ImageDraw.Draw(canvas)
try:
    font = ImageFont.load_default()
except Exception:
    font = None

draw.text((16, 10), "GS-003 v13 — escala: Tamer v13 (Coragem) x Tamer atual (TAMER-0003) x Guilmon oficial (CREATURE-0003 DS) — zoom x8 nearest-neighbour, linha pontilhada = 1 tile (32px)", fill=(230, 230, 230, 255), font=font)

entries = [
    ("Tamer v13 Coragem\n(novo, PixelLab v3)", v13z, v13c.size),
    ("Tamer atual\n(TAMER-0003, oficial-fan-use)", curz, curc.size),
    ("Guilmon oficial\n(CREATURE-0003, DW DS)", guiz, guic.size),
]

baseline_y = 60 + tile_h  # anchor all feet to the same "ground line" = 1 tile down from top of art area

for i, (label, img, native_size) in enumerate(entries):
    x0 = i * col_w
    # tile reference line (dashed) at baseline
    for dx in range(0, col_w, 10):
        draw.line([(x0 + dx, 60 + tile_h), (x0 + dx + 5, 60 + tile_h)], fill=(120, 120, 130, 255))
    px = x0 + (col_w - img.width) // 2
    py = baseline_y - img.height
    canvas.alpha_composite(img, (px, py))
    for j, line in enumerate(label.split("\n")):
        draw.text((x0 + 16, H - 70 + j * 12), line, fill=(220, 220, 220, 255), font=font)
    draw.text((x0 + 16, H - 34), f"{native_size[0]}x{native_size[1]}px nativo", fill=(160, 200, 255, 255), font=font)

canvas.convert("RGB").save(OUT)
print("saved", OUT, canvas.size)
