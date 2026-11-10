#!/usr/bin/env python3
"""Circuit Kit v1 (completo) — GS-003 UI "circuito digital".

Primeira entrega cobria só painel/botões/ícone/barra/divisor. Esta versão
completa o pedido original: 3 níveis de moldura (raridade), estado
"bloqueado", barra de PV e de XP (cores do próprio ByteLine-18 — `volt` já é
"barra de HP cheia" e `blood` "HP crítica" no guia do projeto, `cyan` é o
acento "digital" geral), selo de raridade, ícone de notificação (`magenta` =
"alerta de UI" no guia), emblema do Digivice, e uma montagem simulada de HUD
com tudo junto. Sem PixelLab, sem PIL — PNG escrito à mão
(`art/_tools/pngw.py`). Paleta = ByteLine-18 exata de `art/PIXEL_ART_DIRECTION.md`
§3 (hex idênticos, nenhuma cor inventada nesta peça do kit).
"""
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "_tools"))
from pngw import Canvas  # noqa: E402

OUT = os.path.dirname(__file__)

PAL = {
    "void0": (0, 0, 0, 0),
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


# ---------------------------------------------------------------- shapes --
def chamfer_corners(c, ox, oy, w, h, size):
    for i in range(size):
        c.rect(ox, oy + i, size - i, 1, PAL["void0"])
        c.rect(ox + w - (size - i), oy + i, size - i, 1, PAL["void0"])
        c.rect(ox, oy + h - 1 - i, size - i, 1, PAL["void0"])
        c.rect(ox + w - (size - i), oy + h - 1 - i, size - i, 1, PAL["void0"])


def corner_trace(c, x, y, fx, fy, dim, bright, node):
    def p(dx, dy):
        return x + dx * fx, y + dy * fy

    a, b = p(2, 0), p(7, 0)
    c.line(a[0], a[1], b[0], b[1], dim)
    d = p(7, 5)
    c.line(b[0], b[1], d[0], d[1], dim)
    nx, ny = b
    c.rect(min(nx, nx + fx), min(ny, ny + fy), 2 if fx > 0 else 1, 2 if fy > 0 else 1, node)
    lead = p(2, 0)
    c.set(lead[0], lead[1], bright)


def base_border(c, ox, oy, w, h, chamfer, border_col=None):
    border_col = border_col or PAL["steel"]
    c.rect(ox, oy, w, h, PAL["void"])
    chamfer_corners(c, ox, oy, w, h, chamfer)
    c.rect_outline(ox, oy, w, h, PAL["ink"], 1)
    c.rect_outline(ox + 1, oy + 1, w - 2, h - 2, border_col, 1)
    chamfer_corners(c, ox, oy, w, h, chamfer - 1)


# --------------------------------------------------------------- panel ---
def draw_panel(c, ox, oy, w=96, h=64):
    base_border(c, ox, oy, w, h, 5)
    c.rect(ox + 2, oy + 2, w - 4, (h - 4) // 2, shade(PAL["void"], 0.18))
    c.rect(ox + 2, oy + 2 + (h - 4) // 2, w - 4, (h - 4) - (h - 4) // 2, shade(PAL["void"], -0.1))
    chamfer_corners(c, ox, oy, w, h, 5)
    c.rect_outline(ox, oy, w, h, PAL["ink"], 1)
    c.rect_outline(ox + 1, oy + 1, w - 2, h - 2, PAL["steel"], 1)
    chamfer_corners(c, ox, oy, w, h, 4)
    for fx, fy, cx, cy in ((1, 1, ox + 2, oy + 2), (-1, 1, ox + w - 3, oy + 2),
                           (1, -1, ox + 2, oy + h - 3), (-1, -1, ox + w - 3, oy + h - 3)):
        corner_trace(c, cx, cy, fx, fy, PAL["cyanDk"], PAL["cyan"], PAL["cyanLt"])
    for yy in (oy + 3, oy + h - 4):
        c.line(ox + 14, yy, ox + w // 2 - 6, yy, PAL["cyanDk"])
        c.line(ox + w // 2 + 6, yy, ox + w - 15, yy, PAL["cyanDk"])
        c.rect(ox + w // 2 - 1, yy, 2, 1, PAL["cyanLt"])


# -------------------------------------------------------------- button ---
def draw_button(c, ox, oy, state, w=64, h=20):
    base_border(c, ox, oy, w, h, 3)
    fill = PAL["void"]
    border = PAL["steel"]
    top_hi = shade(fill, 0.18)
    bottom_lo = shade(fill, -0.22)
    if state == "pressed":
        fill = shade(PAL["void"], -0.12)
        border = PAL["amber"]
        top_hi = fill
        bottom_lo = shade(fill, -0.1)
    elif state == "locked":
        fill = shade(PAL["void"], -0.25)
        border = PAL["steel"]
        top_hi = bottom_lo = fill
    c.rect(ox + 2, oy + 2, w - 4, h - 4, fill)
    c.rect(ox + 2, oy + 2, w - 4, 1, top_hi)
    c.rect(ox + 2, oy + h - 3, w - 4, 1, bottom_lo)
    chamfer_corners(c, ox, oy, w, h, 3)
    c.rect_outline(ox, oy, w, h, PAL["ink"], 1)
    c.rect_outline(ox + 1, oy + 1, w - 2, h - 2, border, 1)
    chamfer_corners(c, ox, oy, w, h, 2)

    tick_col = PAL["cyanDk"]
    if state == "hover":
        tick_col = PAL["cyan"]
    elif state == "pressed":
        tick_col = PAL["amber"]
    elif state == "locked":
        tick_col = PAL["steel"]
    for side in (0, 1):
        bx = ox + (5 if side == 0 else w - 7)
        for i in range(3):
            c.set(bx + i, oy + 1, tick_col)
            c.set(bx + i, oy + h - 2, tick_col)
    if state == "hover":
        c.rect(ox + 2, oy + 2, w - 4, 1, PAL["cyanLt"])
        c.set(ox + 3, oy + 2, PAL["paper"])
        c.set(ox + w - 4, oy + 2, PAL["paper"])
    if state == "pressed":
        c.rect(ox + 2, oy + h - 4, w - 4, 1, shade(PAL["amber"], -0.4))
    if state == "locked":
        # cadeado central (botão indisponível)
        lx, ly = ox + w // 2 - 3, oy + h // 2 - 3
        c.rect_outline(lx, ly, 6, 5, PAL["mist"], 1)
        c.rect(lx + 1, ly - 2, 4, 3, (0, 0, 0, 0))
        c.rect_outline(lx + 1, ly - 2, 4, 3, PAL["mist"], 1)
        c.rect(lx + 2, ly + 1, 2, 2, PAL["ink"])


# ----------------------------------------------------- icon frame tiers --
TIER_COL = {
    1: {"name": "common", "border": PAL["steelLt"], "trace": PAL["mist"], "glow": PAL["paper"]},
    2: {"name": "rare", "border": PAL["cyanDk"], "trace": PAL["cyan"], "glow": PAL["cyanLt"]},
    3: {"name": "legendary", "border": PAL["amberDk"], "trace": PAL["amber"], "glow": PAL["paper"]},
}


def draw_icon_frame(c, ox, oy, tier=1, w=32, h=32):
    tc = TIER_COL[tier]
    c.rect_outline(ox, oy, w, h, PAL["ink"], 1)
    c.rect_outline(ox + 1, oy + 1, w - 2, h - 2, tc["border"], 1 if tier < 3 else 2)
    chamfer_corners(c, ox, oy, w, h, 4)
    corners = ((1, 1, ox + 1, oy + 1), (-1, 1, ox + w - 2, oy + 1),
               (1, -1, ox + 1, oy + h - 2), (-1, -1, ox + w - 2, oy + h - 2))
    for fx, fy, cx, cy in corners:
        c.rect(cx if fx > 0 else cx - 1, cy if fy > 0 else cy - 1, 2, 2, tc["glow"])
        c.line(cx, cy, cx + fx * 6, cy, tc["trace"])
        c.line(cx, cy, cx, cy + fy * 6, tc["trace"])
    if tier == 3:
        # 4 facetas extras no meio das bordas (moldura lendária, mais ornada)
        for mx, my in ((ox + w // 2, oy + 1), (ox + w // 2, oy + h - 2),
                       (ox + 1, oy + h // 2), (ox + w - 2, oy + h // 2)):
            c.rect(mx - 1, my - 1, 2, 2, tc["glow"])


# ------------------------------------------------------------- lock badge
def draw_lock_badge(c, cx, cy):
    c.rect(cx - 3, cy - 1, 6, 5, PAL["ink"])
    c.rect_outline(cx - 3, cy - 1, 6, 5, PAL["mist"], 1)
    c.rect_outline(cx - 2, cy - 4, 4, 3, PAL["mist"], 1)
    c.rect(cx - 1, cy + 1, 2, 2, PAL["steelLt"])


# --------------------------------------------------------------- bars ---
def draw_bar_frame(c, ox, oy, w=64, h=12):
    c.rect(ox + 1, oy + 1, w - 2, h - 2, shade(PAL["void"], -0.1))
    c.rect_outline(ox, oy, w, h, PAL["ink"], 1)
    c.rect_outline(ox + 1, oy + 1, w - 2, h - 2, PAL["steel"], 1)
    for i in range(1, 16):
        x = ox + 2 + i * 3
        if x < ox + w - 3:
            c.set(x, oy + 1, PAL["ink"])
            c.set(x, oy + h - 2, PAL["ink"])


def draw_bar_fill(c, ox, oy, w, h, kind):
    base = PAL["volt"] if kind == "hp" else PAL["cyan"]
    dark = PAL["magentaDk"] if kind == "hp" else PAL["cyanDk"]
    # faixa "hp" reaproveita volt (ByteLine: "barra de HP cheia"); engine
    # troca para `blood` (HP crítica) via tint quando o valor cair, não
    # cozido nesta textura (ver README).
    for x in range(w):
        c.rect(ox + x, oy, 1, h, base if (x // 3) % 2 == 0 else shade(base, -0.12))
    c.rect(ox, oy, w, 1, shade(base, 0.3))
    for i in range(1, 16):
        x = i * 3
        if x < w:
            c.rect(ox + x, oy + 1, 1, h - 1, dark)


def draw_divider(c, ox, oy, w=64, h=6):
    c.line(ox + 2, oy + 2, ox + w // 2 - 3, oy + 2, PAL["cyanDk"])
    c.line(ox + w // 2 + 3, oy + 2, ox + w - 3, oy + 2, PAL["cyanDk"])
    c.rect(ox + w // 2 - 2, oy + 1, 4, 4, PAL["cyan"])
    c.rect(ox + w // 2 - 1, oy + 2, 2, 2, PAL["paper"])


# --------------------------------------------------------- rarity seal ---
SEAL_COL = {
    "common": {"body": PAL["steel"], "edge": PAL["mist"]},
    "rare": {"body": PAL["cyanDk"], "edge": PAL["cyan"]},
    "legendary": {"body": PAL["amberDk"], "edge": PAL["amber"]},
}


def draw_rarity_seal(c, cx, cy, rarity, r=7):
    sc = SEAL_COL[rarity]
    c.circle_fill(cx, cy, r, PAL["ink"])
    c.circle_fill(cx, cy, r - 1, sc["body"])
    c.circle_fill(cx, cy, r - 3, sc["edge"])
    # pontas de estrela (4 picos simples)
    for dx, dy in ((0, -r - 1), (0, r + 1), (-r - 1, 0), (r + 1, 0)):
        c.set(cx + dx, cy + dy, sc["edge"])
    if rarity == "legendary":
        c.set(cx, cy, PAL["paper"])


# ---------------------------------------------------- notification badge
def draw_notification_badge(c, cx, cy, r=6):
    c.circle_fill(cx, cy, r, PAL["ink"])
    c.circle_fill(cx, cy, r - 1, PAL["magenta"])
    c.rect(cx - 1, cy - 3, 1, 4, PAL["paper"])
    c.rect(cx - 1, cy + 2, 1, 1, PAL["paper"])


# ------------------------------------------------------- digivice emblem
def draw_digivice_emblem(c, cx, cy, r=10):
    c.line(cx - r, cy, cx, cy - r, PAL["cyan"])
    c.line(cx, cy - r, cx + r, cy, PAL["cyan"])
    c.line(cx + r, cy, cx, cy + r, PAL["cyan"])
    c.line(cx, cy + r, cx - r, cy, PAL["cyan"])
    c.line(cx - r + 3, cy, cx, cy - r + 3, PAL["cyanDk"])
    c.line(cx, cy - r + 3, cx + r - 3, cy, PAL["cyanDk"])
    c.line(cx + r - 3, cy, cx, cy + r - 3, PAL["cyanDk"])
    c.line(cx, cy + r - 3, cx - r + 3, cy, PAL["cyanDk"])
    c.rect(cx - 1, cy - 1, 2, 2, PAL["cyanLt"])


# ========================================================= HUD mockup ===
def build_hud_mockup():
    W, H = 320, 180
    c = Canvas(W, H, PAL["bgGrid"])
    for y in range(0, H, 2):
        c.rect(0, y, W, 1, shade(PAL["bgGrid"], 0.06))

    # --- canto superior esquerdo: emblema + HP/XP ---
    draw_panel(c, 4, 4, w=130, h=34)
    draw_digivice_emblem(c, 20, 21, r=10)
    draw_bar_frame(c, 38, 9, w=88, h=10)
    draw_bar_fill(c, 40, 11, int(84 * 0.72), 6, "hp")
    draw_bar_frame(c, 38, 21, w=88, h=9)
    draw_bar_fill(c, 40, 23, int(84 * 0.4), 5, "xp")

    # --- canto superior direito: notificação sobre ícone raro ---
    draw_icon_frame(c, W - 40, 6, tier=2, w=32, h=32)
    draw_notification_badge(c, W - 12, 10)

    # --- canto inferior esquerdo: moldura lendária + selo ---
    draw_icon_frame(c, 8, H - 40, tier=3, w=32, h=32)
    draw_rarity_seal(c, 8 + 32 - 6, H - 40 + 6, "legendary")

    # --- moldura comum ao lado, pra comparar os 3 níveis ---
    draw_icon_frame(c, 46, H - 40, tier=1, w=32, h=32)
    draw_rarity_seal(c, 46 + 32 - 6, H - 40 + 6, "common")
    draw_icon_frame(c, 84, H - 40, tier=2, w=32, h=32)
    draw_rarity_seal(c, 84 + 32 - 6, H - 40 + 6, "rare")

    # --- barra inferior com 4 botões (normal/hover/pressed/locked) ---
    draw_panel(c, 120, H - 30, w=196, h=26)
    bx = 128
    for state in ("normal", "hover", "pressed", "locked"):
        draw_button(c, bx, H - 24, state, w=42, h=16)
        bx += 46

    draw_divider(c, 120, 100, w=90)

    c.save(os.path.join(OUT, "hud_mockup.png"))


# ================================================================ main ===
def main():
    panel = Canvas(96, 64, PAL["void0"])
    draw_panel(panel, 0, 0)
    panel.save(os.path.join(OUT, "panel_9slice.png"))

    for state in ("normal", "hover", "pressed", "locked"):
        btn = Canvas(64, 20, PAL["void0"])
        draw_button(btn, 0, 0, state)
        btn.save(os.path.join(OUT, f"button_{state}.png"))

    for tier in (1, 2, 3):
        icon = Canvas(32, 32, PAL["void0"])
        draw_icon_frame(icon, 0, 0, tier=tier)
        icon.save(os.path.join(OUT, f"icon_frame_tier{tier}_{TIER_COL[tier]['name']}.png"))

    frame = Canvas(64, 12, PAL["void0"])
    draw_bar_frame(frame, 0, 0)
    frame.save(os.path.join(OUT, "bar_frame.png"))

    hp = Canvas(60, 8, PAL["void0"])
    draw_bar_fill(hp, 0, 0, 60, 8, "hp")
    hp.save(os.path.join(OUT, "bar_fill_hp.png"))

    xp = Canvas(60, 7, PAL["void0"])
    draw_bar_fill(xp, 0, 0, 60, 7, "xp")
    xp.save(os.path.join(OUT, "bar_fill_xp.png"))

    div = Canvas(64, 6, PAL["void0"])
    draw_divider(div, 0, 0)
    div.save(os.path.join(OUT, "divider.png"))

    for rarity in ("common", "rare", "legendary"):
        seal = Canvas(20, 20, PAL["void0"])
        draw_rarity_seal(seal, 10, 10, rarity)
        seal.save(os.path.join(OUT, f"rarity_seal_{rarity}.png"))

    notif = Canvas(16, 16, PAL["void0"])
    draw_notification_badge(notif, 8, 8)
    notif.save(os.path.join(OUT, "notification_badge.png"))

    emblem = Canvas(24, 24, PAL["void0"])
    draw_digivice_emblem(emblem, 12, 12, r=11)
    emblem.save(os.path.join(OUT, "digivice_emblem.png"))

    build_hud_mockup()

    meta = {
        "palette": "ByteLine-18 (art/PIXEL_ART_DIRECTION.md §3) — hex idênticos, 0 cores novas nesta peça",
        "panel_9slice": {"size": [96, 64], "nine_slice": {"left": 8, "right": 8, "top": 8, "bottom": 8}},
        "button": {"size": [64, 20], "states": ["normal", "hover", "pressed", "locked"],
                   "nine_slice": {"left": 5, "right": 5, "top": 5, "bottom": 5}},
        "icon_frame": {"size": [32, 32], "tiers": {1: "common (steel)", 2: "rare (cyan)", 3: "legendary (amber)"}},
        "bar_frame": {"size": [64, 12], "fill_inset": {"left": 2, "right": 2, "top": 2, "bottom": 2}},
        "bar_fill_hp": {"size": [60, 8], "base_color": "volt #9df24a (ByteLine: HP cheia)",
                        "note": "engine deve tingir p/ blood #e8465f (ByteLine: HP crítica) quando valor baixo — não cozido na textura"},
        "bar_fill_xp": {"size": [60, 7], "base_color": "cyan #3fe0d0"},
        "rarity_seal": {"size": [20, 20], "tiers": ["common", "rare", "legendary"]},
        "notification_badge": {"size": [16, 16], "color": "magenta #e8459d (ByteLine: alerta de UI)"},
        "digivice_emblem": {"size": [24, 24]},
        "divider": {"size": [64, 6]},
        "hud_mockup": {"size": [320, 180], "note": "resolução interna do projeto (PIXEL_ART_DIRECTION.md §2)"},
    }
    with open(os.path.join(OUT, "metadata.json"), "w") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)
    print("circuit-kit-v1 (completo) gerado.")


if __name__ == "__main__":
    main()
