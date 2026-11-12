#!/usr/bin/env python3
"""Compose bottom-HUD components (Tamer block, Digimon block, team slots,
move bar) from the generated v13 pieces. Pure local compositing (Pillow),
no AI generation, nearest-neighbor only (Style Bible rule: no interpolation
on pixel art).
"""
from PIL import Image, ImageDraw, ImageFont
import os

BASE = os.path.dirname(os.path.abspath(__file__))
PANELS = os.path.join(BASE, "panels")
BUTTONS = os.path.join(BASE, "buttons")
BARS = os.path.join(BASE, "bars")
ICONS = os.path.join(BASE, "icons")
HUD = os.path.join(BASE, "hud")
RAW = os.path.join(BASE, "raw")
FONT_PATH = os.path.join(BASE, "font", "DigiviceGBAClean-Regular.ttf")


def load(path):
    return Image.open(path).convert("RGBA")


def nine_slice_resize(im, insets, target_w, target_h):
    """Stretch an image to (target_w, target_h) using 9-slice insets
    (l, r, t, b), never scaling the border regions, nearest-neighbor only."""
    l, r, t, b = insets
    w, h = im.size
    target_w = max(target_w, l + r + 1)
    target_h = max(target_h, t + b + 1)
    out = Image.new("RGBA", (target_w, target_h), (0, 0, 0, 0))

    def hsplit(img):
        return img.crop((0, 0, l, img.height)), img.crop((l, 0, img.width - r, img.height)), img.crop((img.width - r, 0, img.width, img.height))

    rows = [im.crop((0, 0, w, t)), im.crop((0, t, w, h - b)), im.crop((0, h - b, w, h))]
    out_rows_h = [t, target_h - t - b, b]
    y = 0
    for row_im, row_h in zip(rows, out_rows_h):
        left, mid, right = hsplit(row_im)
        x = 0
        if left.width:
            out.paste(left, (x, y))
            x += left.width
        mid_w = target_w - left.width - right.width
        if mid.width and mid_w > 0:
            mid_r = mid.resize((mid_w, row_h), Image.NEAREST) if row_h != mid.height or mid_w != mid.width else mid
            out.paste(mid_r, (x, y))
            x += mid_w
        if right.width:
            out.paste(right, (x, y))
        y += row_h
    return out


def hstretch(im, target_w):
    """Stretch only horizontally (for bar fill textures), nearest-neighbor."""
    return im.resize((target_w, im.height), Image.NEAREST)


def hslice_resize(im, left, right, target_w):
    """Horizontal-only 9-slice: keep left/right caps, stretch the middle."""
    w, h = im.size
    target_w = max(target_w, left + right + 1)
    out = Image.new("RGBA", (target_w, h), (0, 0, 0, 0))
    left_im = im.crop((0, 0, left, h))
    right_im = im.crop((w - right, 0, w, h))
    mid_im = im.crop((left, 0, w - right, h))
    mid_w = target_w - left - right
    out.paste(left_im, (0, 0))
    if mid_w > 0:
        out.paste(mid_im.resize((mid_w, h), Image.NEAREST), (left, 0))
    out.paste(right_im, (target_w - right, 0))
    return out


def font(size):
    return ImageFont.truetype(FONT_PATH, size)


def draw_text(draw, xy, text, size, fill=(238, 242, 251, 255), anchor="la"):
    draw.text(xy, text, font=font(size), fill=fill, anchor=anchor)


# ---------------------------------------------------------------------------
# Pieces
panel1 = load(os.path.join(PANELS, "panel_tier1.png"))
slot = load(os.path.join(HUD, "slot_frame.png"))
bar_frame = load(os.path.join(BARS, "bar_frame_empty.png"))
bar_hp = load(os.path.join(BARS, "bar_fill_hp.png"))
bar_xp = load(os.path.join(BARS, "bar_fill_xp.png"))

icon_tamer = load(os.path.join(ICONS, "icon_tamer.png")) if os.path.exists(os.path.join(ICONS, "icon_tamer.png")) else load(os.path.join(RAW, "icon_tamer.png"))


def icon(name):
    p = os.path.join(RAW, f"icon_{name}.png")
    return load(p)


PANEL_INSETS = (10, 10, 10, 10)
BAR_H = 16  # native bar_frame_empty height, never vertically stretched
BAR_LR = 9  # rivet cap width, left/right 9-slice inset
BAR_TOP, BAR_BOTTOM = 4, 4  # measured navy-trough bounds inside the frame
SLOT_INSETS = (8, 8, 8, 8)


def make_bar(width, fill_im, pct):
    frame = hslice_resize(bar_frame, BAR_LR, BAR_LR, width)
    inner_x0 = BAR_LR + 1
    inner_x1 = width - BAR_LR - 1
    inner_w = max(1, inner_x1 - inner_x0)
    inner_h = BAR_H - BAR_TOP - BAR_BOTTOM
    fill_w = max(1, int(inner_w * pct))
    fill = fill_im.resize((fill_w, inner_h), Image.NEAREST)
    frame.paste(fill, (inner_x0, BAR_TOP), fill)
    return frame


def make_slot(size, icon_im, scale=0.62):
    s = nine_slice_resize(slot, SLOT_INSETS, size, size)
    isz = int(size * scale)
    ic = icon_im.resize((isz, isz), Image.NEAREST)
    s.paste(ic, ((size - isz) // 2, (size - isz) // 2), ic)
    return s


# ---------------------------------------------------------------------------
# Tamer block: portrait + name/level + XP bar
def build_tamer_block():
    W, H = 188, 60
    bg = nine_slice_resize(panel1, PANEL_INSETS, W, H)
    draw = ImageDraw.Draw(bg)
    port = make_slot(44, icon("tamer"))
    bg.paste(port, (6, 8), port)
    draw_text(draw, (56, 8), "KAIO", 12, fill=(238, 242, 251, 255))
    draw_text(draw, (56, 22), "Nv.44", 10, fill=(164, 247, 239, 255))
    xp = make_bar(118, bar_xp, 0.42)
    bg.paste(xp, (56, 38), xp)
    return bg


# Digimon block: portrait + name/level + HP + XP
def build_digimon_block():
    W, H = 224, 86
    bg = nine_slice_resize(panel1, PANEL_INSETS, W, H)
    draw = ImageDraw.Draw(bg)
    port = make_slot(56, icon("digimon"))
    bg.paste(port, (6, 14), port)
    draw_text(draw, (68, 8), "GUILMON", 12, fill=(238, 242, 251, 255))
    draw_text(draw, (68, 22), "Nv.6", 10, fill=(125, 242, 170, 255))
    hp = make_bar(142, bar_hp, 0.83)
    bg.paste(hp, (68, 38), hp)
    xp = make_bar(142, bar_xp, 0.55)
    bg.paste(xp, (68, 58), xp)
    return bg


# Team slots: row of up to 6 small slots
def build_team_slots(n=6):
    size = 36
    gap = 4
    W = n * size + (n - 1) * gap
    H = size
    out = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    names = ["digimon", "digimon", "digimon", "digimon", "digimon", "digimon"]
    for i in range(n):
        s = make_slot(size, icon(names[i % len(names)]), scale=0.55)
        out.paste(s, (i * (size + gap), 0), s)
    return out


# Move bar: row of 4 move-type slots
def build_move_bar():
    size = 44
    gap = 5
    moves = ["move_attack", "move_defend", "move_special", "move_item"]
    W = len(moves) * size + (len(moves) - 1) * gap
    out = Image.new("RGBA", (W, size), (0, 0, 0, 0))
    for i, m in enumerate(moves):
        s = make_slot(size, icon(m), scale=0.6)
        out.paste(s, (i * (size + gap), 0), s)
    return out


if __name__ == "__main__":
    tamer = build_tamer_block()
    digimon = build_digimon_block()
    team = build_team_slots()
    moves = build_move_bar()

    tamer.save(os.path.join(HUD, "tamer_block.png"))
    digimon.save(os.path.join(HUD, "digimon_block.png"))
    team.save(os.path.join(HUD, "team_slots.png"))
    moves.save(os.path.join(HUD, "move_bar.png"))

    # Combined bottom HUD bar (for the mockup)
    pad = 10
    H = max(tamer.height, digimon.height, team.height, moves.height) + pad * 2
    W = tamer.width + digimon.width + team.width + moves.width + pad * 5
    bar_bg = nine_slice_resize(panel1, PANEL_INSETS, W, H)
    x = pad
    for piece in (tamer, digimon, team, moves):
        y = pad + (H - pad * 2 - piece.height) // 2
        bar_bg.paste(piece, (x, y), piece)
        x += piece.width + pad
    bar_bg.save(os.path.join(HUD, "bottom_hud_bar.png"))
    print("saved", tamer.size, digimon.size, team.size, moves.size, bar_bg.size)
