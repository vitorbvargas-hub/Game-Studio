#!/usr/bin/env python3
"""Build the 3 final 1920x1080 v13 UI mockups. Local Pillow compositing only
(nearest-neighbor, Style Bible rule: never interpolate pixel art)."""
from PIL import Image, ImageDraw, ImageFont, ImageEnhance
import os

BASE = os.path.dirname(os.path.abspath(__file__))
PANELS = os.path.join(BASE, "panels")
BARS = os.path.join(BASE, "bars")
ICONS = os.path.join(BASE, "icons")
HUD = os.path.join(BASE, "hud")
HUBD = os.path.join(BASE, "hub")
REGIONS = os.path.join(BASE, "regions")
BUTTONS = os.path.join(BASE, "buttons")
FONT_PATH = os.path.join(BASE, "font", "DigiviceGBAClean-Regular.ttf")
MOCKUPS = os.path.join(BASE, "mockups")

CLAREIRA = "/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/quality-overhaul/direction-v13/mockups/v13_mockup_1920x1080.png"


def load(p):
    return Image.open(p).convert("RGBA")


def font(size):
    return ImageFont.truetype(FONT_PATH, size)


def text(draw, xy, s, size, fill=(238, 242, 251, 255), anchor="la"):
    draw.text(xy, s, font=font(size), fill=fill, anchor=anchor)


def nine_slice_resize(im, insets, target_w, target_h):
    l, r, t, b = insets
    w, h = im.size
    target_w = max(target_w, l + r + 1)
    target_h = max(target_h, t + b + 1)
    out = Image.new("RGBA", (target_w, target_h), (0, 0, 0, 0))
    rows = [im.crop((0, 0, w, t)), im.crop((0, t, w, h - b)), im.crop((0, h - b, w, h))]
    out_rows_h = [t, target_h - t - b, b]
    y = 0
    for row_im, row_h in zip(rows, out_rows_h):
        left = row_im.crop((0, 0, l, row_im.height))
        right = row_im.crop((row_im.width - r, 0, row_im.width, row_im.height))
        mid = row_im.crop((l, 0, row_im.width - r, row_im.height))
        x = 0
        if left.width:
            left_r = left.resize((left.width, row_h), Image.NEAREST) if row_h != left.height else left
            out.paste(left_r, (x, y))
            x += left.width
        mid_w = target_w - left.width - right.width
        if mid.width and mid_w > 0:
            mid_r = mid.resize((mid_w, row_h), Image.NEAREST)
            out.paste(mid_r, (x, y))
            x += mid_w
        if right.width:
            right_r = right.resize((right.width, row_h), Image.NEAREST) if row_h != right.height else right
            out.paste(right_r, (target_w - right.width, y))
        y += row_h
    return out


def nn_scale(im, factor):
    return im.resize((im.width * factor, im.height * factor), Image.NEAREST)


panel1 = load(os.path.join(PANELS, "panel_tier1.png"))
panel2 = load(os.path.join(PANELS, "panel_tier2.png"))
panel3 = load(os.path.join(PANELS, "panel_tier3.png"))
button1 = load(os.path.join(BUTTONS, "button_tier1_normal.png"))
button1_locked = load(os.path.join(BUTTONS, "button_tier1_locked.png"))
tab1 = load(os.path.join(PANELS, "tab_tier1.png"))

PANEL_INSETS = (10, 10, 10, 10)
BTN_INSETS = (8, 8, 8, 8)


def icon(name, size=None):
    im = load(os.path.join(ICONS, f"icon_{name}.png"))
    if size:
        im = im.resize((size, size), Image.NEAREST)
    return im


def region(name, size):
    im = load(os.path.join(REGIONS, f"region_{name}_{size}.png"))
    return im


# ---------------------------------------------------------------------------
# MOCKUP 1: HUD overlay over the v13 forest clearing
# ---------------------------------------------------------------------------
def build_mockup_hud_overlay():
    scene = load(CLAREIRA).convert("RGBA")
    W, H = scene.size

    hub = load(os.path.join(HUBD, "hub_notification.png"))
    hub = nn_scale(hub, 2)  # 192x192
    scene.alpha_composite(hub, (W - hub.width - 28, 20))

    # top-left region pill
    pill = nine_slice_resize(panel1, PANEL_INSETS, 260, 44)
    d = ImageDraw.Draw(pill)
    text(d, (14, 6), "FLORESTA DENSA", 13, fill=(238, 242, 251, 255))
    text(d, (14, 24), "Rota 3", 10, fill=(164, 247, 239, 255))
    scene.alpha_composite(pill, (24, 20))

    # bottom HUD bar, scaled x2, centered
    bar = load(os.path.join(HUD, "bottom_hud_bar.png"))
    bar = nn_scale(bar, 2)
    x = (W - bar.width) // 2
    y = H - bar.height - 18
    scene.alpha_composite(bar, (x, y))

    scene.convert("RGB").save(os.path.join(MOCKUPS, "ui13_hud_overlay_clareira_1920x1080.png"))
    return scene


# ---------------------------------------------------------------------------
# MOCKUP 2: Digivice aberto - painel Tamer
# ---------------------------------------------------------------------------
def build_mockup_digivice_tamer():
    base = load(CLAREIRA).convert("RGBA")
    W, H = base.size
    # dim the background scene (digivice opened as a modal over play)
    dim = Image.new("RGBA", (W, H), (10, 10, 18, 190))
    scene = Image.alpha_composite(base, dim)

    # main core window (tier3 legendary panel, big)
    win_w, win_h = 860, 560
    win = nine_slice_resize(panel3, PANEL_INSETS, win_w, win_h)
    d = ImageDraw.Draw(win)
    text(d, (64, 26), "DIGIVICE", 18, fill=(255, 222, 150, 255))
    text(d, (win_w - 64, 26), "X", 18, fill=(238, 242, 251, 255), anchor="ra")

    # left sidebar: core sections list (plain drawn rows, no baked button text)
    sidebar_items = [
        ("tamer", "Tamer", True),
        ("digimon", "Digimon", False),
        ("evolucao", "Evolucao", False),
        ("vinculo", "Vinculo", False),
        ("banco", "Banco de dados", False),
        ("registros", "Registros", False),
    ]
    sb_x, sb_y = 26, 64
    row_w, row_h = 196, 42
    for i, (ic, label, active) in enumerate(sidebar_items):
        iy = sb_y + i * (row_h + 8)
        fill = (63, 70, 97, 230) if not active else (46, 58, 70, 235)
        border = (160, 170, 190, 255) if not active else (255, 222, 150, 255)
        d.rounded_rectangle([sb_x, iy, sb_x + row_w, iy + row_h], radius=6, fill=fill, outline=border, width=2)
        im = icon(ic, 24)
        win.paste(im, (sb_x + 8, iy + (row_h - 24) // 2), im)
        text(d, (sb_x + 40, iy + row_h // 2), label, 11, fill=(238, 242, 251, 255) if active else (190, 196, 212, 255), anchor="lm")

    # right content: Tamer profile
    cx = sb_x + row_w + 34
    cy = 64
    port = icon("tamer", 96)
    port_frame = nine_slice_resize(panel1, PANEL_INSETS, 112, 112)
    win.paste(port_frame, (cx, cy), port_frame)
    win.paste(port, (cx + 8, cy + 8), port)
    text(d, (cx + 128, cy + 4), "KAIO", 20, fill=(238, 242, 251, 255))
    text(d, (cx + 128, cy + 30), "Nivel 44  -  Tamer", 13, fill=(164, 247, 239, 255))

    # XP bar
    bar_frame_img = load(os.path.join(BARS, "bar_frame_empty.png"))
    bar_xp = load(os.path.join(BARS, "bar_fill_xp.png"))

    def hslice(im, l, r, w):
        ww, hh = im.size
        out = Image.new("RGBA", (w, hh), (0, 0, 0, 0))
        left = im.crop((0, 0, l, hh))
        right = im.crop((ww - r, 0, ww, hh))
        mid = im.crop((l, 0, ww - r, hh))
        out.paste(left, (0, 0))
        mw = w - l - r
        if mw > 0:
            out.paste(mid.resize((mw, hh), Image.NEAREST), (l, 0))
        out.paste(right, (w - r, 0))
        return out

    xp_frame = hslice(bar_frame_img, 9, 9, 300)
    fillw = int((300 - 20) * 0.42)
    fill = bar_xp.resize((fillw, 8), Image.NEAREST)
    xp_frame.paste(fill, (10, 4), fill)
    win.paste(xp_frame, (cx + 128, cy + 52), xp_frame)
    text(d, (cx + 128, cy + 72), "1 840 / 4 400 XP para o Nivel 45", 11, fill=(200, 205, 220, 255))

    # attributes panel (atividade do Tamer)
    attrs = [
        ("Vitorias", "128"),
        ("Especies escaneadas", "14 / 20"),
        ("Digivolucoes acompanhadas", "3"),
        ("Mapas visitados", "2"),
        ("Chefoes despertados", "1"),
        ("Chefoes derrotados", "0"),
    ]
    ay = cy + 110
    attr_panel = nine_slice_resize(panel1, PANEL_INSETS, win_w - cx - 40, 280)
    win.paste(attr_panel, (cx, ay), attr_panel)
    dd = ImageDraw.Draw(win)
    text(dd, (cx + 20, ay + 18), "ATRIBUTOS (ATIVIDADE DO TAMER)", 12, fill=(255, 222, 150, 255))
    for i, (label, val) in enumerate(attrs):
        ry = ay + 48 + i * 36
        text(dd, (cx + 20, ry), label, 11, fill=(220, 224, 236, 255))
        text(dd, (win_w - 40, ry), val, 12, fill=(164, 247, 239, 255), anchor="ra")

    scene.alpha_composite(win, ((W - win_w) // 2, (H - win_h) // 2))
    scene.convert("RGB").save(os.path.join(MOCKUPS, "ui13_digivice_tamer_1920x1080.png"))
    return scene


# ---------------------------------------------------------------------------
# MOCKUP 3: Mapa-mundi com os novos icones de regiao
# ---------------------------------------------------------------------------
def build_mockup_world_map():
    base = load(CLAREIRA).convert("RGBA")
    W, H = base.size
    dim = Image.new("RGBA", (W, H), (10, 10, 18, 190))
    scene = Image.alpha_composite(base, dim)

    win_w, win_h = 1200, 760
    win = nine_slice_resize(panel2, PANEL_INSETS, win_w, win_h)
    d = ImageDraw.Draw(win)
    text(d, (72, 28), "MAPA-MUNDI", 18, fill=(164, 247, 239, 255))
    text(d, (win_w - 72, 28), "X", 18, fill=(238, 242, 251, 255), anchor="ra")

    cards = [
        ("vila_bebes", "Vila dos Bebes", "Nv.1-5 . zona segura", "Liberada", False, 150, 90),
        ("floresta_densa", "Floresta Densa", "Nv.1-15 . 20 especies", "Voce esta aqui", False, 500, 280, True),
        ("praia_postes", "Praia dos Postes", "Nv.10-25 . 9 especies", "Liberada", False, 850, 90),
        ("montanha", "Montanha", "Nv.20-35 . 4 especies", "Bloqueada: Nv.20 + derrote Kuwagamon", True, 150, 470),
        ("deserto", "Deserto", "Nv.30-45 . 4 especies", "Bloqueada: Nv.30 + derrote Shellmon", True, 850, 470),
        ("zona_corrompida", "Zona Corrompida", "Nv.40-55 . 4 especies", "Bloqueada: Nv.40 + 2 chefoes", True, 500, 600),
    ]

    for item in cards:
        rname, title, sub, status, locked, x, y = item[:7]
        selected = len(item) > 7 and item[7]
        card_w, card_h = (260, 150) if not selected else (300, 190)
        card = nine_slice_resize(panel1 if not selected else panel3, PANEL_INSETS, card_w, card_h)
        cd = ImageDraw.Draw(card)
        isize = 64 if not selected else 96
        reg_im = region(rname, 64 if isize == 64 else 128)
        reg_im = reg_im if reg_im.width == isize else reg_im.resize((isize, isize), Image.NEAREST)
        card.paste(reg_im, (14, 14), reg_im)
        text(cd, (isize + 24, 14), title, 13, fill=(238, 242, 251, 255))
        text(cd, (isize + 24, 32), sub, 9, fill=(180, 190, 210, 255))
        status_color = (231, 76, 60, 255) if locked else (125, 242, 170, 255)
        if selected:
            status_color = (255, 222, 150, 255)
        text(cd, (isize + 24, 50), status, 9, fill=status_color)
        btn_src = button1_locked if locked else button1
        btn = nine_slice_resize(btn_src, BTN_INSETS, 100, 28)
        bd = ImageDraw.Draw(btn)
        text(bd, (50, 14), "VIAJAR", 10, fill=(238, 242, 251, 255) if not locked else (120, 125, 135, 255), anchor="mm")
        card.paste(btn, (isize + 24, card_h - 40), btn)
        win.paste(card, (x, y), card)

    scene.alpha_composite(win, ((W - win_w) // 2, (H - win_h) // 2))
    scene.convert("RGB").save(os.path.join(MOCKUPS, "ui13_mapa_mundi_1920x1080.png"))
    return scene


if __name__ == "__main__":
    m1 = build_mockup_hud_overlay()
    m2 = build_mockup_digivice_tamer()
    m3 = build_mockup_world_map()
    print("done", m1.size, m2.size, m3.size)
