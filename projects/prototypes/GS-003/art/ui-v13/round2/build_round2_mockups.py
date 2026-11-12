#!/usr/bin/env python3
"""Rodada 2 - monta os 3 mockups 1920x1080 a partir do chrome unificado
(round2/out/) + material aprovado da rodada 1 (icons/, regions/, hud bar
fills). So NEAREST em qualquer resize (Style Bible: nunca interpolar upscale).
Texto: sempre >= 32px (2x do glifo nativo de 16px da DigiviceGBAClean) e com
alpha thresholded (sem anti-aliasing) para nunca ficar borrado.
"""
import os
import json
import unicodedata
from PIL import Image, ImageDraw, ImageFont

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(BASE)          # ui-v13/
OUT = os.path.join(BASE, "out")
MOCKUPS = os.path.join(ROOT, "mockups")
os.makedirs(MOCKUPS, exist_ok=True)

FONT_PATH = os.path.join(ROOT, "font", "DigiviceGBAClean-Regular.ttf")
CLAREIRA = "/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/quality-overhaul/direction-v13/mockups/v13_mockup_1920x1080.png"

MIN_TEXT_PX = 32  # >= 2x the font's native 16px glyph (hard floor, round 2 fix)


def load(p):
    return Image.open(p).convert("RGBA")


def font(size):
    assert size >= MIN_TEXT_PX, f"texto {size}px abaixo do minimo legivel {MIN_TEXT_PX}px"
    return ImageFont.truetype(FONT_PATH, size)


def strip_accents(s):
    """DigiviceGBAClean-Regular.ttf only ships the glyph_px charset documented
    on create_font (A-Z a-z 0-9 + common punctuation) -- no accented Latin
    characters. Feeding it 'Nível'/'Vitórias' silently draws a
    blank/zero-width glyph for the accent (confirmed via font.getbbox: a
    (0,26,12,26) empty box), producing gaps like 'N vel'/'Vit rias' -- a new
    illegibility bug round2 must not introduce. Drop diacritics instead
    (standard practice for a limited pixel charset): 'Nivel', 'Vitorias'."""
    return "".join(c for c in unicodedata.normalize("NFKD", s) if not unicodedata.combining(c))


def draw_crisp_text(base, xy, s, size, fill=(238, 242, 251, 255), anchor="la"):
    """Draw text on its own layer and hard-threshold the alpha so it reads as
    flat pixel-art glyphs instead of an anti-aliased, 'blurred' filter edge."""
    s = strip_accents(s)
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.text(xy, s, font=font(size), fill=fill, anchor=anchor)
    r, g, b, a = layer.split()
    a = a.point(lambda v: 255 if v >= 110 else 0)
    layer.putalpha(a)
    base.alpha_composite(layer)


def nn_scale(im, factor):
    return im.resize((int(im.width * factor), int(im.height * factor)), Image.NEAREST)


def nn_resize(im, w, h):
    return im.resize((w, h), Image.NEAREST)


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


# ---------------------------------------------------------------------------
# shared assets
# ---------------------------------------------------------------------------
panel = {t: load(os.path.join(OUT, "panels", f"panel_{t}.png")) for t in
         ["tier1_common", "tier2_rare", "tier3_legendary"]}
tab = {t: load(os.path.join(OUT, "panels", f"tab_{t}.png")) for t in
       ["tier1_common", "tier2_rare", "tier3_legendary"]}
bar_deco = {t: load(os.path.join(OUT, "bars", f"bar_frame_{t}.png")) for t in
            ["tier1_common", "tier2_rare", "tier3_legendary"]}
btn = {s: load(os.path.join(OUT, "buttons", f"button_unified_{s}.png")) for s in
       ["normal", "hover", "pressed", "locked"]}

bar_frame_empty = load(os.path.join(ROOT, "bars", "bar_frame_empty.png"))
bar_fill_hp = load(os.path.join(ROOT, "bars", "bar_fill_hp.png"))
bar_fill_xp = load(os.path.join(ROOT, "bars", "bar_fill_xp.png"))
bar_fill_energy = load(os.path.join(ROOT, "bars", "bar_fill_energy.png"))
slot_frame = load(os.path.join(ROOT, "hud", "slot_frame.png"))

hub_notification = load(os.path.join(OUT, "hub", "hub_notification.png"))

PANEL_INSETS = (10, 10, 10, 10)
BTN_INSETS = (8, 8, 8, 8)
BAR_INSETS = (9, 9)


def icon(name, size=None):
    im = load(os.path.join(ROOT, "icons", f"icon_{name}.png"))
    if size and size != im.width:
        im = nn_resize(im, size, size)
    return im


def region(name, size):
    im = load(os.path.join(ROOT, "regions", f"region_{name}_{size}.png"))
    return im


def make_bar(width, height, fill_img, pct):
    frame = hslice(bar_frame_empty, BAR_INSETS[0], BAR_INSETS[1], width)
    inner_h = height
    fillw = max(0, int((width - BAR_INSETS[0] - BAR_INSETS[1]) * pct))
    if fillw > 0:
        f = nn_resize(fill_img, fillw, inner_h)
        frame.paste(f, (BAR_INSETS[0], (frame.height - inner_h) // 2), f)
    return frame


def slot(size, content_icon=None):
    s = nn_resize(slot_frame, size, size)
    if content_icon is not None:
        pad = max(2, size // 6)
        ci = nn_resize(content_icon, size - 2 * pad, size - 2 * pad)
        s.alpha_composite(ci, (pad, pad))
    return s


def button(label, w, h, state="normal", text_size=32):
    im = nine_slice_resize(btn[state], BTN_INSETS, w, h)
    color = (120, 125, 135, 255) if state == "locked" else (238, 242, 251, 255)
    draw_crisp_text(im, (w // 2, h // 2), label, text_size, fill=color, anchor="mm")
    return im


print("assets loaded ok")


# ---------------------------------------------------------------------------
# small drawing primitives (free, local -- no PixelLab generation used below)
# ---------------------------------------------------------------------------

DARKEST = (0, 2, 5, 255)          # palette[0], canonical background
GREEN_OK = (122, 171, 67, 255)     # green_digital family -> "liberado"
RED_ALERT = (212, 86, 111, 255)    # red_alert family -> "bloqueado"
GOLD_ATUAL = (237, 219, 132, 255)  # gold_tier3 family -> "voce esta aqui"
CYAN_TEXT = (61, 239, 221, 255)
WHITE_TEXT = (238, 242, 251, 255)
GREY_TEXT = (140, 148, 160, 255)


def draw_ring(base, center, radius, color, width=3):
    """Flat-color hard-edged ring behind a region icon -- a solid filled
    circle one size bigger, no gradient/blur (Style Bible rule 2)."""
    cx, cy = center
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], outline=color, width=width)
    base.alpha_composite(layer)


def draw_padlock(base, xy, size=12, color=(18, 22, 32, 255), ring_color=(170, 178, 186, 255)):
    """Hand-drawn pixel padlock (flat shapes, no AI) -- used instead of a
    baked-in lock icon so it never overlaps a button's label (round1 P0 bug:
    button_tier1_locked.png had the lock sitting on top of "START")."""
    x, y = xy
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    s = size
    # shackle (arc approximated by a thick-outlined ellipse, top half only)
    d.arc([x, y, x + s, y + s], start=190, end=350, fill=ring_color, width=max(2, s // 5))
    # body
    body_top = y + s * 0.45
    d.rectangle([x, body_top, x + s, y + s * 1.05], fill=color)
    d.rectangle([x + s * 0.42, body_top + s * 0.18, x + s * 0.58, body_top + s * 0.42], fill=ring_color)
    base.alpha_composite(layer)


def flat_fill(w, h, color):
    return Image.new("RGBA", (w, h), color)


def center_paste(base, img, cx, cy):
    base.alpha_composite(img, (int(cx - img.width / 2), int(cy - img.height / 2)))


# ===========================================================================
# MOCKUP 1 -- HUD em jogo (overlay sobre a clareira), versao LEVE (fix P1)
# ===========================================================================

def build_hud_overlay():
    base = load(CLAREIRA).convert("RGBA")

    hub = load(os.path.join(ROOT, "round2", "out", "hub", "hub_closed.png"))
    base.alpha_composite(hub, (1920 - hub.width - 24, 24))

    # location pill, top-left -- single line, crisp, >=32px
    pill_w, pill_h = 460, 56
    pill = nine_slice_resize(panel["tier2_rare"], PANEL_INSETS, pill_w, pill_h)
    base.alpha_composite(pill, (24, 24))
    draw_crisp_text(base, (24 + pill_w // 2, 24 + pill_h // 2), "FLORESTA DENSA · Nv.3", 32,
                     fill=WHITE_TEXT, anchor="mm")

    # ---- bottom HUD: ONE thin unified panel instead of round1's thick
    #      889x106 bronze tray -- same information, much lower visual weight.
    bar_w, bar_h = 1120, 84
    bar_x, bar_y = (1920 - bar_w) // 2, 1080 - bar_h - 18
    strip = nine_slice_resize(panel["tier1_common"], PANEL_INSETS, bar_w, bar_h)
    base.alpha_composite(strip, (bar_x, bar_y))

    pad = 16
    cx = bar_x + pad

    # Tamer block: portrait + "KAIO - Nv.44" + nothing else (XP lives in the
    # Digivice detail screen now, round2 -- keeps this strip light)
    tamer_slot = slot(52, icon("tamer", 40))
    base.alpha_composite(tamer_slot, (cx, bar_y + (bar_h - 52) // 2))
    draw_crisp_text(base, (cx + 64, bar_y + bar_h // 2), "KAIO · Nv.44", 32, fill=WHITE_TEXT, anchor="lm")
    cx += 64 + 230

    # Digimon block: portrait + name/level + ONE hp bar
    dig_slot = slot(52, icon("digimon", 40))
    base.alpha_composite(dig_slot, (cx, bar_y + (bar_h - 52) // 2))
    draw_crisp_text(base, (cx + 64, bar_y + 18), "GUILMON · Nv.6", 32, fill=WHITE_TEXT, anchor="lm")
    hp = make_bar(220, 16, bar_fill_hp, 0.82)
    base.alpha_composite(hp, (cx + 64, bar_y + 46))
    cx += 64 + 250

    # team roster -- 6 small slots (placeholder icon, documented limitation)
    for i in range(6):
        s = slot(40, icon("digimon", 26))
        base.alpha_composite(s, (cx + i * 44, bar_y + (bar_h - 40) // 2))
    cx += 6 * 44 + 18

    # move bar -- 4 slots with the real move-type icons
    move_icons = ["move_attack", "move_defend", "move_special", "move_item"]
    for i, mi in enumerate(move_icons):
        s = slot(48, icon(mi, 32))
        base.alpha_composite(s, (cx + i * 52, bar_y + (bar_h - 48) // 2))

    out_path = os.path.join(BASE, "mockups", "ui13_hud_overlay_clareira_1920x1080.png")
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    base.convert("RGB").save(out_path)
    print("saved", out_path)


# ===========================================================================
# MOCKUP 2 -- Digivice aberto, nucleo Tamer (moldura azul-petroleo, texto
# nitido >=32px, mesmos dados reais do round1 -- nenhum numero inventado)
# ===========================================================================

ATTRS = [
    ("Vitórias", "128"),
    ("Espécies escaneadas", "14 / 20"),
    ("Digivoluções acompanhadas", "3"),
    ("Mapas visitados", "2"),
    ("Chefões despertados", "1"),
    ("Chefões derrotados", "0"),
]

TAB_ITEMS = [
    ("tamer", "Tamer", True),
    ("digimon", "Digimon", False),
    ("evolucao", "Evolução", False),
    ("vinculo", "Vínculo", False),
    ("banco", "Banco de dados", False),
    ("registros", "Registros", False),
]


def build_digivice_tamer():
    base = load(CLAREIRA).convert("RGBA")
    scrim = flat_fill(1920, 1080, (0, 2, 5, 150))
    base.alpha_composite(scrim)

    modal_w, modal_h = 1260, 800
    mx, my = (1920 - modal_w) // 2, (1080 - modal_h) // 2
    modal = nine_slice_resize(panel["tier2_rare"], PANEL_INSETS, modal_w, modal_h)
    base.alpha_composite(modal, (mx, my))

    draw_crisp_text(base, (mx + 40, my + 36), "DIGIVICE", 44, fill=WHITE_TEXT, anchor="lm")

    # left tab rail
    tab_w, tab_h = 260, 58
    tx, ty = mx + 36, my + 96
    for i, (ic, label, active) in enumerate(TAB_ITEMS):
        y = ty + i * (tab_h + 10)
        src = btn["hover"] if active else btn["normal"]
        t = nine_slice_resize(src, BTN_INSETS, tab_w, tab_h)
        base.alpha_composite(t, (tx, y))
        ic_img = nn_resize(icon(ic), 30, 30)
        base.alpha_composite(ic_img, (tx + 14, y + (tab_h - 30) // 2))
        draw_crisp_text(base, (tx + 56, y + tab_h // 2), label, 32,
                         fill=WHITE_TEXT if active else GREY_TEXT, anchor="lm")

    # right content: portrait + name/level/xp
    cx = tx + tab_w + 40
    cy = my + 96
    portrait = slot(140, nn_resize(icon("tamer"), 110, 110))
    base.alpha_composite(portrait, (cx, cy))

    tx2 = cx + 170
    draw_crisp_text(base, (tx2, cy + 10), "KAIO", 48, fill=WHITE_TEXT, anchor="la")
    draw_crisp_text(base, (tx2, cy + 70), "Nível 44 — Tamer", 36, fill=CYAN_TEXT, anchor="la")

    xp_frame_tall = nn_resize(bar_frame_empty, bar_frame_empty.width, 30)
    xp_bar = hslice(xp_frame_tall, 9, 9, 560)
    fillw = int((560 - 18) * (1040 / 4400))
    f = nn_resize(bar_fill_xp, max(1, fillw), 22)
    xp_bar.paste(f, (9, 4), f)
    base.alpha_composite(xp_bar, (tx2, cy + 126))
    draw_crisp_text(base, (tx2, cy + 168), "1.040 / 4.400 XP para o Nível 45", 32,
                     fill=GREY_TEXT, anchor="la")

    # attributes card (real data pulled from the round1 mockup, see ROUND2.md)
    acx, acy = cx, cy + 230
    ac_w, ac_h = modal_w - (cx - mx) - 40, modal_h - (acy - my) - 40
    card = nine_slice_resize(panel["tier1_common"], PANEL_INSETS, ac_w, ac_h)
    base.alpha_composite(card, (acx, acy))
    draw_crisp_text(base, (acx + 28, acy + 30), "ATRIBUTOS (ATIVIDADE DO TAMER)", 32,
                     fill=GOLD_ATUAL, anchor="lm")
    row_y = acy + 86
    for label, value in ATTRS:
        draw_crisp_text(base, (acx + 28, row_y), label, 32, fill=WHITE_TEXT, anchor="lm")
        draw_crisp_text(base, (acx + ac_w - 28, row_y), value, 32, fill=CYAN_TEXT, anchor="rm")
        row_y += 54

    # close button
    close_w, close_h = 180, 56
    close_btn = nine_slice_resize(btn["normal"], BTN_INSETS, close_w, close_h)
    cbx, cby = mx + modal_w - close_w - 32, my + modal_h - close_h - 28
    base.alpha_composite(close_btn, (cbx, cby))
    draw_crisp_text(base, (cbx + close_w // 2, cby + close_h // 2), "FECHAR", 32,
                     fill=WHITE_TEXT, anchor="mm")

    out_path = os.path.join(BASE, "mockups", "ui13_digivice_tamer_1920x1080.png")
    base.convert("RGB").save(out_path)
    print("saved", out_path)


# ===========================================================================
# MOCKUP 3 -- mapa-mundi: o CONTINENTE (fix P1 "virou grade de cartoes"),
# as 6 regioes como pontos sobre a cena, nao cards numa grade.
# ===========================================================================

# (orig_x, orig_y) measured by hand on continent_bg_680x384.png -- see
# /tmp/gs003_r2/continent_grid.png + left_3x/right_3x crops used to pick them.
REGION_POINTS = {
    "montanha": (190, 55),
    "floresta_densa": (90, 160),
    "praia_postes": (250, 305),
    "deserto": (580, 90),
    "zona_corrompida": (620, 185),
    "vila_bebes": (330, 358),
}

# [H] status de progressao hipotetico para o mockup (round1 ja usava
# liberado/bloqueado/atual com Nv.XX placeholder; nao existe spec de game-design
# com os niveis reais de cada regiao -- ver limitacoes no ROUND2.md).
REGION_STATUS = {
    "vila_bebes": ("liberado", None),
    "praia_postes": ("liberado", None),
    "floresta_densa": ("atual", None),
    "montanha": ("bloqueado", 30),
    "deserto": ("bloqueado", 40),
    "zona_corrompida": ("bloqueado", 60),
}

REGION_LABELS = {
    "montanha": "MONTANHA",
    "floresta_densa": "FLORESTA DENSA",
    "praia_postes": "PRAIA DOS POSTES",
    "deserto": "DESERTO",
    "zona_corrompida": "ZONA CORROMPIDA",
    "vila_bebes": "VILA DOS BEBÊS",
}

MAP_SCALE = 2.6
MAP_OFFSET = (76, 41)


def map_point(orig_xy):
    ox, oy = orig_xy
    sx, sy = MAP_OFFSET
    return (int(ox * MAP_SCALE + sx), int(oy * MAP_SCALE + sy))


def build_mapa_mundi():
    base = flat_fill(1920, 1080, DARKEST)
    continent = load(os.path.join(ROOT, "round2", "continent_bg_680x384.png"))
    continent = continent.resize(
        (int(continent.width * MAP_SCALE), int(continent.height * MAP_SCALE)), Image.NEAREST)
    base.alpha_composite(continent, MAP_OFFSET)

    # title bar
    tb_w, tb_h = 520, 72
    title_bar = nine_slice_resize(panel["tier2_rare"], PANEL_INSETS, tb_w, tb_h)
    base.alpha_composite(title_bar, ((1920 - tb_w) // 2, 18))
    draw_crisp_text(base, (1920 // 2, 18 + tb_h // 2), "MAPA-MUNDI", 44, fill=WHITE_TEXT, anchor="mm")

    # back button
    bb_w, bb_h = 150, 54
    back = nine_slice_resize(btn["normal"], BTN_INSETS, bb_w, bb_h)
    base.alpha_composite(back, (36, 30))
    draw_crisp_text(base, (36 + bb_w // 2, 30 + bb_h // 2), "VOLTAR", 32, fill=WHITE_TEXT, anchor="mm")

    for key, orig_xy in REGION_POINTS.items():
        status, lvl = REGION_STATUS[key]
        px, py = map_point(orig_xy)
        is_current = status == "atual"
        icon_size = 128 if is_current else 64
        ring_color = {"atual": GOLD_ATUAL, "liberado": CYAN_TEXT, "bloqueado": GREY_TEXT}[status]
        draw_ring(base, (px, py), icon_size // 2 + 8, ring_color, width=4)
        reg_img = load(os.path.join(ROOT, "regions", f"region_{key}_{icon_size}.png"))
        center_paste(base, reg_img, px, py)

        if is_current:
            pill_w, pill_h = 420, 92
        else:
            pill_w, pill_h = 360, 48
        pill_x = px - pill_w // 2
        pill_y = py + icon_size // 2 + 10
        pill_x = max(8, min(1920 - pill_w - 8, pill_x))
        pill_y = min(1080 - pill_h - 8, pill_y)

        tier_for_pill = {"atual": "tier3_legendary", "liberado": "tier2_rare", "bloqueado": "tier1_common"}[status]
        pill = nine_slice_resize(panel[tier_for_pill], PANEL_INSETS, pill_w, pill_h)
        if status == "bloqueado":
            # read as muted/locked without hiding the chrome family
            px_arr = pill.load()
            for yy in range(pill.height):
                for xx in range(pill.width):
                    r, g, b, a = px_arr[xx, yy]
                    if a:
                        px_arr[xx, yy] = (int(r * 0.6), int(g * 0.6), int(b * 0.6), a)
        base.alpha_composite(pill, (pill_x, pill_y))

        label = REGION_LABELS[key]
        if is_current:
            draw_crisp_text(base, (pill_x + pill_w // 2, pill_y + 30), label, 32, fill=WHITE_TEXT, anchor="mm")
            draw_crisp_text(base, (pill_x + pill_w // 2, pill_y + 66), "VOCÊ ESTÁ AQUI", 32,
                             fill=GOLD_ATUAL, anchor="mm")
        else:
            draw_crisp_text(base, (pill_x + 18, pill_y + pill_h // 2), label, 32,
                             fill=WHITE_TEXT if status == "liberado" else GREY_TEXT, anchor="lm")
            if status == "bloqueado":
                draw_padlock(base, (pill_x + pill_w - 34, pill_y + pill_h // 2 - 11), size=16)

    # legend, bottom-right
    lg_w, lg_h = 360, 150
    lg_x, lg_y = 1920 - lg_w - 30, 1080 - lg_h - 30
    legend = nine_slice_resize(panel["tier1_common"], PANEL_INSETS, lg_w, lg_h)
    base.alpha_composite(legend, (lg_x, lg_y))
    legend_rows = [(GOLD_ATUAL, "Você está aqui"), (CYAN_TEXT, "Liberado"), (GREY_TEXT, "Bloqueado")]
    for i, (color, text) in enumerate(legend_rows):
        yy = lg_y + 26 + i * 40
        d = ImageDraw.Draw(base)
        d.rectangle([lg_x + 20, yy - 10, lg_x + 40, yy + 10], fill=color)
        draw_crisp_text(base, (lg_x + 54, yy), text, 32, fill=WHITE_TEXT, anchor="lm")

    out_path = os.path.join(BASE, "mockups", "ui13_mapa_mundi_1920x1080.png")
    base.convert("RGB").save(out_path)
    print("saved", out_path)


if __name__ == "__main__":
    build_hud_overlay()
    build_digivice_tamer()
    build_mapa_mundi()
    print("round2 mockups done")
