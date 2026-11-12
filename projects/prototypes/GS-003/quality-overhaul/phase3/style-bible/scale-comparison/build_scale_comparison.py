#!/usr/bin/env python3
"""Comparativo 16x16 vs 32x32 — mesma cena pequena da Digital Forest.

Monta duas versoes da MESMA cena (mesmo footprint em pixels de mundo,
mesmos sprites oficiais sem redimensionar) variando so o tamanho do tile
de chao: 32px (grade atual do projeto) vs 16px (proxy por downscale
nearest 2x dos tiles de 32px existentes — NAO e arte nativa 16px nova,
e uma simulacao de proporcao, custo zero, sem PixelLab).

Uso: ~/projects/GameStudio/shared/tools/sd-local/.venv/bin/python3 build_scale_comparison.py
"""
import os
import random
from PIL import Image, ImageDraw

ROOT = "/home/openclaw/projects/GameStudio"
GS003 = f"{ROOT}/projects/prototypes/GS-003"
ASSETS = f"{ROOT}/assets/GAME-ASSETS"
OUT_DIR = os.path.dirname(os.path.abspath(__file__))

FOREST_V11 = f"{GS003}/art/map-factory/forest-v11-ground"
FOREST_V10 = f"{GS003}/art/map-factory/forest-v10-ground-trees"

# --- Fontes oficiais (sem redimensionar, ASSET_LICENSE_POLICY.md "official-fan-use") ---
GUILMON_FRAME = f"{ASSETS}/01-creatures/CREATURE-0003/sprites/CREATURE-0003_walk_S_01.png"  # 30x34, pivot (15,33)
GABUMON_FRAME = f"{ASSETS}/01-creatures/CREATURE-0009/sprites/CREATURE-0009_walk_S_01.png"  # 36x34, pivot (18,33)
TAMER_FRAME = f"{ASSETS}/11-characters/TAMER-0009/sprites/TAMER-0009_walk_SW_01.png"        # 26x33, pivot (13,32)

GUILMON_PIVOT = (15, 33)
GABUMON_PIVOT = (18, 33)
TAMER_PIVOT = (13, 32)

# --- Tiles de chao (forest-v11-ground, ja em producao, tile=32px) ---
GROUND_VARIANTS = [f"{FOREST_V11}/tiles/ground_variant_{i}.png" for i in range(10)]

# --- Arvore de borda (forest-v10-ground-trees, trunk+copa separados p/ y-sort) ---
TREE_BASE = f"{FOREST_V10}/trees/tall_narrow_small_base.png"
TREE_TOP = f"{FOREST_V10}/trees/tall_narrow_small_top.png"

# Grade do mundo (em tiles de 32px): 6 largura x 4 altura -> footprint fixo 192x128px,
# igual nas duas versoes (so o tile muda, o MUNDO nao).
GRID_W_32, GRID_H_32 = 6, 4
WORLD_W, WORLD_H = GRID_W_32 * 32, GRID_H_32 * 32  # 192x128

DISPLAY_SCALE = 3  # upscale nearest p/ leitura, igual nas duas cenas (fator inteiro)


def load(path):
    return Image.open(path).convert("RGBA")


def build_floor(tile_size: int, seed: int = 7) -> Image.Image:
    """Preenche o footprint fixo (WORLD_W x WORLD_H) com tiles do tamanho pedido.

    tile_size=32: usa os PNGs originais do forest-v11-ground, sem alterar.
    tile_size=16: faz downscale NEAREST 2x dos mesmos PNGs (proxy de proporcao,
    nao arte nativa 16px — ver limitacao no DIGIMON_STYLE_GUIDE.md).
    """
    rnd = random.Random(seed)
    variants = [load(p) for p in GROUND_VARIANTS]
    if tile_size != 32:
        variants = [v.resize((tile_size, tile_size), Image.NEAREST) for v in variants]

    cols = WORLD_W // tile_size
    rows = WORLD_H // tile_size
    canvas = Image.new("RGBA", (WORLD_W, WORLD_H), (0, 0, 0, 0))
    for ty in range(rows):
        for tx in range(cols):
            tile = rnd.choice(variants)
            canvas.paste(tile, (tx * tile_size, ty * tile_size), tile)
    return canvas


def paste_pivot(canvas: Image.Image, sprite: Image.Image, pivot, foot_xy):
    """Cola o sprite usando seu pivo (pe) na coordenada foot_xy do canvas."""
    fx, fy = foot_xy
    px, py = pivot
    top_left = (fx - px, fy - py)
    canvas.alpha_composite(sprite, top_left)


def draw_grid(img: Image.Image, tile_size: int, scale: int, color=(255, 255, 255, 60)):
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    step = tile_size * scale
    for x in range(0, img.width + 1, step):
        draw.line([(x, 0), (x, img.height)], fill=color, width=1)
    for y in range(0, img.height + 1, step):
        draw.line([(0, y), (img.width, y)], fill=color, width=1)
    return Image.alpha_composite(img, overlay)


def build_scene(tile_size: int) -> Image.Image:
    canvas = build_floor(tile_size)

    # arvore de borda (canto superior-direito), ancorada no "chao" por baixo do tronco
    tree_base = load(TREE_BASE)
    tree_top = load(TREE_TOP)
    base_foot = (WORLD_W - 18, 30)  # pe do tronco
    paste_pivot(canvas, tree_base, (tree_base.width // 2, tree_base.height - 2), base_foot)
    top_anchor = (base_foot[0], base_foot[1] - tree_base.height + 14)
    paste_pivot(canvas, tree_top, (tree_top.width // 2, tree_top.height - 6), top_anchor)

    # elenco: Guilmon, Gabumon oficiais + Tamer — na MESMA linha de base (mesmo "y" de pe),
    # sprites oficiais sem nenhum redimensionamento (nearest-free, pixel a pixel).
    baseline_y = WORLD_H - 14
    guilmon = load(GUILMON_FRAME)
    gabumon = load(GABUMON_FRAME)
    tamer = load(TAMER_FRAME)

    paste_pivot(canvas, tamer, TAMER_PIVOT, (36, baseline_y))
    paste_pivot(canvas, guilmon, GUILMON_PIVOT, (70, baseline_y))
    paste_pivot(canvas, gabumon, GABUMON_PIVOT, (108, baseline_y))

    # upscale nearest p/ leitura (fator inteiro, regra de tela do ART_STYLE_GUIDE.md SS2)
    big = canvas.resize((canvas.width * DISPLAY_SCALE, canvas.height * DISPLAY_SCALE), Image.NEAREST)
    big = draw_grid(big, tile_size, DISPLAY_SCALE)
    return big


def label(img: Image.Image, lines) -> Image.Image:
    pad_top = 15 + 14 * len(lines)
    out = Image.new("RGBA", (img.width, img.height + pad_top), (18, 20, 28, 255))
    draw = ImageDraw.Draw(out)
    for i, line in enumerate(lines):
        draw.text((8, 6 + i * 14), line, fill=(240, 240, 220, 255))
    out.alpha_composite(img, (0, pad_top))
    return out


def main():
    scene32 = build_scene(32)
    scene16 = build_scene(16)

    # alturas nativas reais (sem redimensionar) para a legenda
    g_h = load(GUILMON_FRAME).height
    ga_h = load(GABUMON_FRAME).height
    t_h = load(TAMER_FRAME).height

    txt32 = [
        "TILE 32px -- grade atual do projeto (MAP_ART_BIBLE.md SS2, nao-negociavel nesta fase)",
        f"mundo {GRID_W_32}x{GRID_H_32} tiles, {WORLD_W}x{WORLD_H}px nativos",
        f"Guilmon {g_h}px = {g_h/32:.2f} tile | Gabumon {ga_h}px = {ga_h/32:.2f} tile | Tamer {t_h}px = {t_h/32:.2f} tile",
    ]
    txt16 = [
        "TILE 16px -- proxy por downscale nearest 2x (NAO e arte 16px nativa nova)",
        f"mesmo footprint {WORLD_W}x{WORLD_H}px, agora {WORLD_W//16}x{WORLD_H//16} tiles",
        f"Guilmon {g_h}px = {g_h/16:.2f} tile | Gabumon {ga_h}px = {ga_h/16:.2f} tile | Tamer {t_h}px = {t_h/16:.2f} tile",
    ]

    panel32 = label(scene32, txt32)
    panel16 = label(scene16, txt16)

    gap = 24
    combo = Image.new(
        "RGBA",
        (panel32.width + gap + panel16.width, max(panel32.height, panel16.height) + 40),
        (10, 11, 16, 255),
    )
    draw = ImageDraw.Draw(combo)
    draw.text(
        (8, 8),
        "GS-003 Digimon Visual Identity 1.0 — comparativo de grade: tile 32px vs 16px "
        "(mesma cena, mesmos sprites oficiais, sem redimensionar criatura/Tamer)",
        fill=(230, 230, 230, 255),
    )
    combo.alpha_composite(panel32, (0, 36))
    combo.alpha_composite(panel16, (panel32.width + gap, 36))

    out_path = os.path.join(OUT_DIR, "scene_16_vs_32.png")
    combo.convert("RGB").save(out_path)
    print("saved", out_path, combo.size)


if __name__ == "__main__":
    main()
