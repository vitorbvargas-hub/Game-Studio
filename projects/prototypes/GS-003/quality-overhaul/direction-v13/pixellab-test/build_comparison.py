#!/usr/bin/env python3
"""Comparison board: current v9-v12 x v13 GBA Clean x PokeIdleDex reference,
same panel height, labeled, for side-by-side evaluation."""
from PIL import Image, ImageDraw, ImageFont

ROOT = "/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/quality-overhaul/direction-v13"
PANEL_H = 480
FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"


def load_panel(path, crop_box=None):
    im = Image.open(path).convert("RGB")
    if crop_box:
        im = im.crop(crop_box)
    w, h = im.size
    new_w = int(w * PANEL_H / h)
    return im.resize((new_w, PANEL_H), Image.LANCZOS if path.endswith((".jpg", ".jpeg")) else Image.NEAREST)


def label_bar(width, text, bg=(18, 24, 20)):
    bar = Image.new("RGB", (width, 46), bg)
    d = ImageDraw.Draw(bar)
    font = ImageFont.truetype(FONT_PATH, 20)
    d.text((14, 12), text, font=font, fill=(255, 255, 255))
    return bar


def main():
    atual = load_panel(f"{ROOT}/refs/nosso_atual.jpg")
    # crop v13 mockup to a comparable mid-scene region (1000x900 -> keep aspect close to atual's)
    v13_box = (320, 260, 1600, 1000)  # 1280x740 crop, central action area
    v13 = load_panel(f"{ROOT}/mockups/v13_mockup_1920x1080.png", v13_box)
    poke = load_panel(f"{ROOT}/refs/pokeidledex/ref_2.jpg")

    panels = [
        ("ATUAL (forest v9-v12) — reprovado pelo fundador", atual),
        ("V13 GBA CLEAN (proposta, este documento)", v13),
        ("POKEIDLEDEX (referencia aprovada)", poke),
    ]

    gap = 10
    total_w = sum(p.width for _, p in panels) + gap * (len(panels) - 1)
    board_h = PANEL_H + 46
    board = Image.new("RGB", (total_w, board_h), (10, 10, 14))

    x = 0
    for title, panel in panels:
        bar = label_bar(panel.width, title)
        board.paste(bar, (x, 0))
        board.paste(panel, (x, 46))
        x += panel.width + gap

    out = f"{ROOT}/mockups/v13_comparison_board.png"
    board.save(out)
    print("saved", out, board.size)


if __name__ == "__main__":
    main()
