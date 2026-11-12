#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Compoe as 3 direcoes de identidade sobre as capturas reais da Digital Forest 01
(forest01_{day,night}_full.png, servidor 5190, scale=3 -> 1 px de mundo = 3 px de tela).
Props nativos (32px/tile) sao escalados 3x nearest-neighbor para casar com a tela."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import random

ROOT = Path("/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/art/map-factory/digital-identity-v1")
REF = ROOT / "reference"
PROPS = ROOT / "props"
MOCKUPS = ROOT / "mockups"
MOCKUPS.mkdir(parents=True, exist_ok=True)
SCALE = 3  # world px -> screenshot px (medido via window.__gs003, scale=3)


# Classificacao de cor para re-tingir de noite (DIGIMON_STYLE_GUIDE.md §6: pedra/opaco escurece
# ~0,55-0,6x a noite; luz pontual -- cristal/circuito/acento -- fica MAIS intensa a noite, nao mais fraca).
STONE_HEXES = {"#474b54", "#656b75", "#8c9199"}
MOSS_HEXES = {"#445838", "#49643c"}
GLOW_HEXES = {"#2ce8f5", "#139aa8", "#feae34", "#b06f12", "#f23fb0", "#9c1d75"}


def _hex_of(rgb):
    return "#%02x%02x%02x" % rgb


def night_tint(im):
    im = im.convert("RGBA")
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, al = px[x, y]
            if al == 0:
                continue
            h = _hex_of((r, g, b))
            if h in STONE_HEXES or h in MOSS_HEXES or h == "#08181e":
                px[x, y] = (int(r * 0.55), int(g * 0.58), min(255, int(b * 0.68)), al)
            elif h in GLOW_HEXES:
                px[x, y] = (min(255, int(r * 1.12)), min(255, int(g * 1.12)), min(255, int(b * 1.18)), al)
    return im


def load_prop(name, time="day"):
    im = Image.open(PROPS / name).convert("RGBA")
    if time == "night":
        im = night_tint(im)
    return im.resize((im.width * SCALE, im.height * SCALE), Image.NEAREST)


def paste_anchored_bottom(base, prop, cx, bottom_y):
    """cx/bottom_y em px de tela; ancora o prop pelo centro-base (como uma sombra de contato)."""
    x = int(cx - prop.width / 2)
    y = int(bottom_y - prop.height)
    base.alpha_composite(prop, (x, y))


def scatter_fragments(base, frag_sheet, positions):
    fw = frag_sheet.width // 4
    fh = frag_sheet.height
    for i, (x, y) in enumerate(positions):
        frame = frag_sheet.crop(((i % 4) * fw, 0, (i % 4 + 1) * fw, fh))
        base.alpha_composite(frame, (int(x - fw / 2), int(y - fh / 2)))


def label(base, text):
    d = ImageDraw.Draw(base)
    pad = 10
    d.rectangle([0, 0, 420, 34], fill=(10, 12, 16, 210))
    d.text((pad, 8), text, fill=(235, 240, 245, 255))


# ------------------------------------------------------------------
# Direcao A -- Ruinas de Dados + circuito no chao (RECOMENDADA)
# ------------------------------------------------------------------
def build_direction_a(time):
    base = Image.open(REF / f"forest01_{time}_full.png").convert("RGBA")
    arch = load_prop("ruin_arch_64x64.png", time)
    column = load_prop("ruin_column_32x64.png", time)
    tower = load_prop("data_tower_32x96.png", time)
    amber = load_prop("crystal_amber_20x26.png", time)
    frag = load_prop("data_fragment_anim_4f_64x16.png", time)
    straight = load_prop("ground_circuit_straight_32x32.png", time)
    corner = load_prop("ground_circuit_corner_32x32.png", time)
    node = load_prop("ground_circuit_node_32x32.png", time)

    # arco de ruina no lugar do platô de pedra existente (reinterpreta o blob roxo como estas ruinas)
    paste_anchored_bottom(base, arch, cx=430, bottom_y=232)
    paste_anchored_bottom(base, column, cx=330, bottom_y=236)
    # torre de dados ao fundo, meio encoberta pela copa (sugere que o elemento se repete no mundo, nao so aqui)
    paste_anchored_bottom(base, tower, cx=1010, bottom_y=330)
    # circuito de dados: trilha do arco ate a clareira central, sobre a terra existente
    # (decalque e desenhado colado na base do proprio canvas do prop -- bottom_y = altura do chao, sem offset)
    for (x, y, piece) in [
        (430, 260, node), (430, 352, straight), (430, 444, corner), (520, 444, straight),
    ]:
        paste_anchored_bottom(base, piece, cx=x, bottom_y=y)
    # cristal ambar perto do arco (variedade de cor, nao so ciano)
    paste_anchored_bottom(base, amber, cx=505, bottom_y=256)
    scatter_fragments(base, frag, [(455, 150), (395, 300), (1035, 260)])
    label(base, f"Direção A — Ruínas de Dados ({time})")
    base.save(MOCKUPS / f"direcaoA_ruinas_dados_{time}.png")


# ------------------------------------------------------------------
# Direcao B -- Portais / Torres de transmissao
# ------------------------------------------------------------------
def build_direction_b(time):
    base = Image.open(REF / f"forest01_{time}_full.png").convert("RGBA")
    gate = load_prop("portal_gate_64x96.png", time)
    tower = load_prop("data_tower_32x96.png", time)
    frag = load_prop("data_fragment_anim_4f_64x16.png", time)

    paste_anchored_bottom(base, gate, cx=660, bottom_y=470)
    paste_anchored_bottom(base, tower, cx=1050, bottom_y=340)
    scatter_fragments(base, frag, [(660, 330), (690, 420), (1000, 280)])
    label(base, f"Direção B — Portais e Torres ({time})")
    base.save(MOCKUPS / f"direcaoB_portais_torres_{time}.png")


# ------------------------------------------------------------------
# Direcao C -- Glitch / wireframe na vegetacao
# ------------------------------------------------------------------
def glitch_block(base, x0, y0, x1, y1, hue_shift=True, seed=0):
    rnd = random.Random(seed)
    region = base.crop((x0, y0, x1, y1)).convert("RGBA")
    w, h = region.size
    out = region.copy()
    # fatias horizontais deslocadas (scanline displacement -- sem blur, so deslocamento de bloco)
    slice_h = max(2, h // 10)
    for y in range(0, h, slice_h):
        if rnd.random() < 0.5:
            dx = rnd.choice([-4, -3, 3, 4])
            row = region.crop((0, y, w, min(y + slice_h, h)))
            out.paste((0, 0, 0, 0), (0, y, w, min(y + slice_h, h)))
            out.alpha_composite(row, (dx, y))
    # blocos ciano translucido (hologram/wireframe) sobre partes aleatorias
    d = ImageDraw.Draw(out)
    bs = 6
    for by in range(0, h, bs):
        for bx in range(0, w, bs):
            if rnd.random() < 0.12:
                d.rectangle([bx, by, bx + bs - 1, by + bs - 1], fill=(44, 232, 245, 90))
                d.rectangle([bx, by, bx + bs - 1, by + bs - 1], outline=(44, 232, 245, 200))
    base.paste(out, (x0, y0), out)


def build_direction_c(time):
    base = Image.open(REF / f"forest01_{time}_full.png").convert("RGBA")
    frag = load_prop("data_fragment_anim_4f_64x16.png", time)
    ruin = load_prop("ruin_pillar_small_32x32.png", time)
    # glitch sobre a arvore grande (canto inferior direito) e o arbusto central
    glitch_block(base, 1060, 420, 1220, 640, seed=11)
    glitch_block(base, 840, 380, 1040, 470, seed=22)
    paste_anchored_bottom(base, ruin, cx=250, bottom_y=430)
    scatter_fragments(base, frag, [(1120, 400), (900, 360), (300, 400)])
    label(base, f"Direção C — Glitch/Wireframe ({time})")
    base.save(MOCKUPS / f"direcaoC_glitch_wireframe_{time}.png")


if __name__ == "__main__":
    for t in ("day", "night"):
        build_direction_a(t)
        build_direction_b(t)
        build_direction_c(t)
    print("mockups ok:", sorted(p.name for p in MOCKUPS.glob("*.png")))
