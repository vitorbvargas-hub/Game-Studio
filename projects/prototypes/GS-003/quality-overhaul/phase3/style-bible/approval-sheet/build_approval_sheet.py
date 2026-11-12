#!/usr/bin/env python3
"""Folha de exemplos aprovado/reprovado (contorno, sombra, ruido de textura, cores).

Todas as celulas "APROVADO" partem de assets reais do projeto (sprites
oficiais ja em uso, tile de chao ja em producao). As celulas "REPROVADO"
sao o MESMO asset alterado deliberadamente, sinteticamente, so para
ilustrar a regra que seria quebrada -- nao sao arte candidata real, so
material didatico do Style Bible (custo zero, sem PixelLab).

Uso: ~/projects/GameStudio/shared/tools/sd-local/.venv/bin/python3 build_approval_sheet.py
"""
import os
import colorsys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = "/home/openclaw/projects/GameStudio"
ASSETS = f"{ROOT}/assets/GAME-ASSETS"
GS003 = f"{ROOT}/projects/prototypes/GS-003"
OUT_DIR = os.path.dirname(os.path.abspath(__file__))

GUILMON = f"{ASSETS}/01-creatures/CREATURE-0003/sprites/CREATURE-0003_walk_S_01.png"
GROUND_TILE = f"{GS003}/art/map-factory/forest-v11-ground/tiles/ground_variant_2.png"

CELL = 180          # celula interna (sprite/tile em area quadrada)
UP = 4               # upscale nearest p/ leitura
PAD = 10
HEADER_H = 26
CAPTION_H = 44
GREEN = (99, 199, 77, 255)
RED = (228, 59, 68, 255)
BG = (24, 26, 34, 255)
INK = (235, 235, 225, 255)


def load(p):
    return Image.open(p).convert("RGBA")


def center_paste(base: Image.Image, sprite: Image.Image, scale=1):
    s = sprite.resize((sprite.width * scale, sprite.height * scale), Image.NEAREST)
    x = (base.width - s.width) // 2
    y = (base.height - s.height) // 2
    base.alpha_composite(s, (x, y))
    return x, y, s


def make_cell(content: Image.Image, header_text: str, header_color, caption: str) -> Image.Image:
    w, h = content.width, content.height + HEADER_H + CAPTION_H
    cell = Image.new("RGBA", (w, h), BG)
    draw = ImageDraw.Draw(cell)
    draw.rectangle([0, 0, w - 1, HEADER_H - 1], fill=header_color)
    tw = draw.textlength(header_text)
    draw.text(((w - tw) / 2, 6), header_text, fill=(10, 10, 10, 255))
    cell.alpha_composite(content, (0, HEADER_H))
    # caption (wrap manual simples)
    words = caption.split(" ")
    lines, cur = [], ""
    for wd in words:
        trial = (cur + " " + wd).strip()
        if draw.textlength(trial) > w - 2 * PAD:
            lines.append(cur)
            cur = wd
        else:
            cur = trial
    if cur:
        lines.append(cur)
    ty = HEADER_H + content.height + 4
    for ln in lines[:4]:
        draw.text((PAD, ty), ln, fill=INK)
        ty += 10
    draw.rectangle([0, 0, w - 1, h - 1], outline=(70, 74, 92, 255), width=1)
    return cell


# ---------------------------------------------------------------- CONTORNO
def row_contorno():
    base = load(GUILMON)
    bg = Image.new("RGBA", (CELL, CELL), (46, 92, 66, 255))  # fundo verde-escuro p/ ver o contorno
    ok = bg.copy()
    center_paste(ok, base, UP)
    cell_ok = make_cell(
        ok,
        "APROVADO",
        GREEN,
        "Contorno proprio do sprite oficial (DW DS): ~1.5-2px, macio, "
        "sem blur (ART_STYLE_GUIDE.md SS5.1 / SS9b).",
    )

    blurred = base.filter(ImageFilter.GaussianBlur(radius=1.1))
    bad = bg.copy()
    center_paste(bad, blurred, UP)
    cell_bad = make_cell(
        bad,
        "REPROVADO",
        RED,
        "Blur/AA sintetico aplicado p/ ilustrar a regra -- viola 'sem AA/blur' "
        "(identidade visual GBA Plus, ART_STYLE_GUIDE.md SS1).",
    )
    return cell_ok, cell_bad


# ---------------------------------------------------------------- SOMBRA
def row_sombra():
    base = load(GUILMON)
    bg = Image.new("RGBA", (CELL, CELL), (99, 199, 77, 255))
    ok = bg.copy()
    x, y, s = center_paste(ok, base, UP)
    foot_y = y + s.height - 4
    cx = x + s.width // 2
    shadow = Image.new("RGBA", ok.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    ew, eh = s.width * 0.8, 10
    sd.ellipse([cx - ew / 2, foot_y - eh / 2, cx + ew / 2, foot_y + eh / 2], fill=(24, 20, 37, 90))
    ok = Image.alpha_composite(Image.alpha_composite(bg.copy(), shadow), Image.new("RGBA", ok.size, (0, 0, 0, 0)))
    ok.alpha_composite(s, (x, y))
    cell_ok = make_cell(
        ok,
        "APROVADO",
        GREEN,
        "Sombra de contato: elipse sob os pes, ~25-40% opacidade, ancora no chao "
        "(ART_STYLE_GUIDE.md SS5.4).",
    )

    bad = bg.copy()
    center_paste(bad, base, UP)  # sem sombra nenhuma = "flutuando"
    cell_bad = make_cell(
        bad,
        "REPROVADO",
        RED,
        "Sem sombra de contato: a criatura 'flutua' sobre o chao, quebra a "
        "ancoragem pedida pela regra.",
    )
    return cell_ok, cell_bad


# ---------------------------------------------------------- RUIDO DE TEXTURA
def row_ruido():
    tile = load(GROUND_TILE)
    ok = tile.resize((CELL, CELL), Image.NEAREST)
    cell_ok = make_cell(
        ok,
        "APROVADO",
        GREEN,
        "Tile de chao em producao (forest-v11-ground): blocos de cor solidos, "
        "2-3 tons, sem granulado (MAP_ART_BIBLE.md SS1/SS7).",
    )

    arr = np.array(tile).astype(np.int16)
    rng = np.random.default_rng(3)
    noise = rng.integers(-55, 55, size=arr[..., :3].shape, dtype=np.int16)
    arr[..., :3] = np.clip(arr[..., :3] + noise, 0, 255)
    noisy = Image.fromarray(arr.astype(np.uint8), mode="RGBA")
    bad = noisy.resize((CELL, CELL), Image.NEAREST)
    cell_bad = make_cell(
        bad,
        "REPROVADO",
        RED,
        "Ruido sintetico por pixel (sinteze didatica do problema real relatado em "
        "MIRANTE_TOP_AND_SCALE.md: topo 'granulado cinza-arroxeado').",
    )
    return cell_ok, cell_bad


# ---------------------------------------------------------------------- CORES
def row_cores():
    base = load(GUILMON)
    bg = Image.new("RGBA", (CELL, CELL), (46, 92, 66, 255))
    ok = bg.copy()
    center_paste(ok, base, UP)
    cell_ok = make_cell(
        ok,
        "APROVADO",
        GREEN,
        "Paleta oficial do sprite (vermelho/preto/creme/olho amarelo), 5-6 cores, "
        "sem mistura com a paleta do cenario (ART_STYLE_GUIDE.md SS4/SS2 'Criaturas... "
        "ficam fora' do grade do mapa).",
    )

    arr = np.array(base).astype(np.float32) / 255.0
    h, w = arr.shape[:2]
    out = arr.copy()
    for yy in range(h):
        for xx in range(w):
            r, g, b, a = arr[yy, xx]
            if a <= 0:
                continue
            hh, s, v = colorsys.rgb_to_hsv(r, g, b)
            hh = (hh + 0.47) % 1.0
            s = min(1.0, s * 1.6)
            nr, ng, nb = colorsys.hsv_to_rgb(hh, s, v)
            out[yy, xx] = [nr, ng, nb, a]
    neon = Image.fromarray((out * 255).astype(np.uint8), mode="RGBA")
    bad = bg.copy()
    center_paste(bad, neon, UP)
    cell_bad = make_cell(
        bad,
        "REPROVADO",
        RED,
        "Hue-shift + saturacao sintetica p/ ilustrar a regra: cor neon fora da "
        "Endesga-32/ramp aprovado (MAP_ART_BIBLE.md SS7 regra 1).",
    )
    return cell_ok, cell_bad


def main():
    rows = [
        ("1. CONTORNO", row_contorno()),
        ("2. SOMBRA", row_sombra()),
        ("3. RUIDO DE TEXTURA", row_ruido()),
        ("4. CORES", row_cores()),
    ]

    sample_ok, _ = rows[0][1]
    cell_w, cell_h = sample_ok.width, sample_ok.height
    row_label_w = 170
    gap = 16
    title_h = 40

    total_w = row_label_w + cell_w * 2 + gap
    total_h = title_h + len(rows) * (cell_h + gap)

    sheet = Image.new("RGBA", (total_w, total_h), BG)
    draw = ImageDraw.Draw(sheet)
    draw.text(
        (10, 10),
        "GS-003 Digimon Visual Identity 1.0 -- Style Bible: aprovado x reprovado",
        fill=INK,
    )

    y = title_h
    for row_name, (cell_ok, cell_bad) in rows:
        draw.text((10, y + cell_h // 2 - 6), row_name, fill=INK)
        sheet.alpha_composite(cell_ok, (row_label_w, y))
        sheet.alpha_composite(cell_bad, (row_label_w + cell_w + gap, y))
        y += cell_h + gap

    out_path = os.path.join(OUT_DIR, "approved_vs_rejected.png")
    sheet.convert("RGB").save(out_path)
    print("saved", out_path, sheet.size)


if __name__ == "__main__":
    main()
