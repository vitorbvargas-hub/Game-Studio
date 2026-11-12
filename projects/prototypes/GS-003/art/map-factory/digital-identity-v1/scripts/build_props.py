#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Gera o kit de props de identidade digital (Direção A - Ruínas de Dados) e os
mockups das 3 direções sobre as capturas reais da clareira (dia/noite).
Tudo local (Pillow), sem PixelLab, sem IA generativa de imagem. Paleta e regras
de 'DIGIMON_STYLE_GUIDE.md' (Style Bible GBA Plus): tile 32px, blocos solidos de
cor (2-3 tons/faixa), sem granulado/blur, contorno escuro macio, sombra de
contato elipse 25-40% opacidade, luz sup-esquerda / sombra inf-direita."""
import math
import colorsys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path("/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/art/map-factory/digital-identity-v1")
PROPS = ROOT / "props"
MOCKUPS = ROOT / "mockups"
REF = ROOT / "reference"
for d in (PROPS, MOCKUPS):
    d.mkdir(parents=True, exist_ok=True)

# ---- paleta (forest-v11-ground/palette.json, DIGIMON_STYLE_GUIDE.md §3.2) ----
STONE = ["#474b54", "#656b75", "#8c9199"]
MOSS = "#445838"
MOSS_EDGE = "#49643c"
DIRT = ["#3f3025", "#584531", "#715b41", "#8c7656"]
OUTLINE = "#08181e"          # mesmo tom escuro do data_crystal.png existente
CYAN = "#2ce8f5"             # cor do data_crystal.png existente (reaproveitada)
CYAN_DARK = "#139aa8"
AMBER = "#feae34"            # cor do data_totem.png existente (reaproveitada)
AMBER_DARK = "#b06f12"
MAGENTA = "#f23fb0"          # novo acento (regra §7.2: ambar/ciano/magenta), harmonizado em luminosidade com os outros dois
MAGENTA_DARK = "#9c1d75"


def hx(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (255,)


def a(color_hex, alpha):
    r, g, b, _ = hx(color_hex)
    return (r, g, b, alpha)


def new_canvas(w, h):
    return Image.new("RGBA", (w, h), (0, 0, 0, 0))


def rect(d, x0, y0, x1, y1, color, alpha=255):
    r, g, b, _ = hx(color) if isinstance(color, str) else (*color[:3], 255)
    d.rectangle([x0, y0, x1, y1], fill=(r, g, b, alpha))


def outline_px(d, points, color=OUTLINE, alpha=255):
    r, g, b, _ = hx(color)
    for (x, y) in points:
        d.point((x, y), fill=(r, g, b, alpha))


def contact_shadow(canvas, cx, bottom_y, rx, ry, opacity=0.32):
    d = ImageDraw.Draw(canvas)
    alpha = int(255 * opacity)
    d.ellipse([cx - rx, bottom_y - ry, cx + rx, bottom_y + ry], fill=(8, 10, 10, alpha))


def shade_block(d, x0, y0, x1, y1, tones, light="tl"):
    """Bloco solido com 2-3 tons (claro no canto sup-esq, escuro no inf-dir) -- sem gradiente continuo."""
    w, h = x1 - x0 + 1, y1 - y0 + 1
    n = len(tones)
    for i in range(n):
        band_y0 = y0 + round(h * i / n)
        band_y1 = y0 + round(h * (i + 1) / n) - 1
        rect(d, x0, band_y0, x1, band_y1, tones[i])


def circuit_crack(d, points, color=CYAN, width=1):
    r, g, b, _ = hx(color)
    for i in range(len(points) - 1):
        d.line([points[i], points[i + 1]], fill=(r, g, b, 255), width=width)


# ------------------------------------------------------------------
# 1) RUIN PILLAR SMALL -- 32x32, 1x1 tile
# ------------------------------------------------------------------
def build_ruin_small():
    c = new_canvas(32, 32)
    d = ImageDraw.Draw(c)
    contact_shadow(c, 16, 29, 9, 3, 0.30)
    # bloco de pedra quebrada (silhueta irregular, nao parede lisa)
    shade_block(d, 9, 10, 22, 27, [STONE[2], STONE[1], STONE[0]])
    # topo quebrado (degrau diagonal)
    rect(d, 9, 10, 15, 13, STONE[2])
    rect(d, 16, 14, 22, 17, STONE[1])
    # musgo na base
    rect(d, 9, 24, 14, 27, MOSS)
    rect(d, 18, 25, 22, 27, MOSS_EDGE)
    # rachadura de dados (ciano) atravessando a pedra
    circuit_crack(d, [(12, 27), (13, 22), (11, 18), (14, 13)], CYAN, 1)
    circuit_crack(d, [(14, 13), (16, 11)], CYAN, 1)
    # contorno escuro macio (so nas bordas externas da silhueta de pedra)
    for x0, y0, x1, y1 in [(9, 10, 15, 13), (16, 14, 22, 17), (9, 18, 22, 27)]:
        d.rectangle([x0, y0, x1, y1], outline=hx(OUTLINE))
    c.save(PROPS / "ruin_pillar_small_32x32.png")


# ------------------------------------------------------------------
# 2) RUIN COLUMN -- 32x64, 1x2 tiles (prop alto, tipo tronco/coluna)
# ------------------------------------------------------------------
def build_ruin_column():
    c = new_canvas(32, 64)
    d = ImageDraw.Draw(c)
    contact_shadow(c, 16, 61, 10, 3, 0.34)
    shade_block(d, 11, 12, 20, 58, [STONE[2], STONE[1], STONE[0]])
    # topo quebrado em angulo (silhueta de ruina, nao coluna perfeita)
    d.polygon([(11, 12), (20, 12), (20, 16), (15, 8), (11, 16)], fill=hx(STONE[2]))
    # fissuras horizontais (tijolos antigos)
    for y in (24, 36, 48):
        rect(d, 11, y, 20, y, STONE[0])
    # musgo subindo pela base
    rect(d, 11, 50, 15, 58, MOSS)
    rect(d, 17, 54, 20, 58, MOSS_EDGE)
    # veio de dados vertical, pulsante, do topo ate a base (identidade §7.4)
    circuit_crack(d, [(15, 10), (14, 20), (16, 30), (14, 40), (15, 50), (15, 57)], CYAN, 1)
    # pequenos nos luminosos no veio
    for (nx, ny) in [(14, 20), (14, 40)]:
        d.ellipse([nx - 1, ny - 1, nx + 1, ny + 1], fill=hx(CYAN))
    d.rectangle([11, 8, 20, 58], outline=hx(OUTLINE))
    c.save(PROPS / "ruin_column_32x64.png")


# ------------------------------------------------------------------
# 3) RUIN ARCH -- 64x64, 2x2 tiles (arco/portico quebrado)
# ------------------------------------------------------------------
def build_ruin_arch():
    c = new_canvas(64, 64)
    d = ImageDraw.Draw(c)
    contact_shadow(c, 32, 60, 22, 5, 0.32)
    # pilar esquerdo
    shade_block(d, 6, 20, 20, 58, [STONE[2], STONE[1], STONE[0]])
    # pilar direito (mais quebrado, mais baixo -- assimetria de ruina)
    shade_block(d, 44, 26, 58, 58, [STONE[2], STONE[1], STONE[0]])
    # lintel parcial (só ate o meio -- "quebrado", nunca parede lisa inteira)
    shade_block(d, 6, 14, 40, 20, [STONE[2], STONE[1]])
    d.polygon([(40, 14), (46, 20), (40, 20)], fill=hx(STONE[0]))  # ponta quebrada do lintel
    # musgo nas bases
    rect(d, 6, 52, 14, 58, MOSS)
    rect(d, 50, 52, 58, 58, MOSS_EDGE)
    rect(d, 16, 54, 20, 58, MOSS_EDGE)
    # circuito de dados correndo pelo lintel e descendo o pilar esquerdo (assinatura do arco)
    circuit_crack(d, [(10, 57), (9, 45), (11, 30), (9, 20)], CYAN, 1)
    circuit_crack(d, [(9, 20), (6, 17), (20, 17), (30, 17), (38, 16)], CYAN, 1)
    for (nx, ny) in [(9, 30), (20, 17)]:
        d.ellipse([nx - 1, ny - 1, nx + 1, ny + 1], fill=hx(CYAN))
    for box in [(6, 14, 40, 20), (6, 20, 20, 58), (44, 26, 58, 58)]:
        d.rectangle(box, outline=hx(OUTLINE))
    c.save(PROPS / "ruin_arch_64x64.png")


# ------------------------------------------------------------------
# 4) PORTAL GATE -- 64x96, 2x3 tiles (anel/arco geometrico simples, nunca 3D/isometrico)
# ------------------------------------------------------------------
def build_portal_gate():
    c = new_canvas(64, 96)
    d = ImageDraw.Draw(c)
    contact_shadow(c, 32, 92, 20, 5, 0.34)
    # moldura de pedra em formato de arco gotico simples (silhueta geometrica, achatada -- nunca 3D)
    frame_pts_outer = [(16, 90), (16, 40), (32, 14), (48, 40), (48, 90)]
    frame_pts_inner = [(24, 88), (24, 42), (32, 26), (40, 42), (40, 88)]
    d.polygon(frame_pts_outer, fill=hx(STONE[1]))
    d.polygon(frame_pts_inner, fill=(0, 0, 0, 0))  # fura o miolo (desenha por cima o preenchimento energia)
    # como PIL nao faz "furo" direto por poligono, redesenha o miolo com o disco de energia
    d.polygon(frame_pts_outer, fill=hx(STONE[1]))
    for i, (x0, y0) in enumerate(frame_pts_outer):
        pass
    # reconstroi: moldura = outer - inner, preenchido com energia por baixo
    energy = new_canvas(64, 96)
    ed = ImageDraw.Draw(energy)
    ed.polygon(frame_pts_inner, fill=hx(CYAN_DARK))
    ed.ellipse([26, 44, 38, 80], fill=a(CYAN, 150))
    ed.ellipse([29, 50, 35, 74], fill=a(CYAN, 220))
    c.alpha_composite(energy)
    d = ImageDraw.Draw(c)
    stone_ring = new_canvas(64, 96)
    sd = ImageDraw.Draw(stone_ring)
    sd.polygon(frame_pts_outer, fill=hx(STONE[2]))
    sd.polygon(frame_pts_inner, fill=(0, 0, 0, 0))
    mask = Image.new("L", (64, 96), 0)
    md = ImageDraw.Draw(mask)
    md.polygon(frame_pts_outer, fill=255)
    md.polygon(frame_pts_inner, fill=0)
    ring_colored = Image.new("RGBA", (64, 96), hx(STONE[1]))
    ring_colored.putalpha(mask)
    c.alpha_composite(ring_colored)
    d = ImageDraw.Draw(c)
    # sombreamento do anel (sup-esq mais claro)
    hi_mask = Image.new("L", (64, 96), 0)
    hd = ImageDraw.Draw(hi_mask)
    hd.polygon([(16, 60), (16, 40), (32, 14), (40, 14), (26, 40), (26, 60)], fill=255)
    hi = Image.new("RGBA", (64, 96), hx(STONE[2]))
    hi.putalpha(Image.composite(hi_mask, Image.new("L", (64, 96), 0), mask))
    c.alpha_composite(hi)
    # base/soquete
    rect(ImageDraw.Draw(c), 12, 88, 22, 94, STONE[0])
    rect(ImageDraw.Draw(c), 42, 88, 52, 94, STONE[0])
    # contorno externo
    outline_mask = mask.filter(ImageFilter.FIND_EDGES)
    out_img = Image.new("RGBA", (64, 96), hx(OUTLINE))
    out_img.putalpha(outline_mask.point(lambda v: 255 if v > 10 else 0))
    c.alpha_composite(out_img)
    c.save(PROPS / "portal_gate_64x96.png")


# ------------------------------------------------------------------
# 5) DATA TOWER -- 32x96, 1x3 tiles (pilar/torre de transmissao)
# ------------------------------------------------------------------
def build_data_tower():
    c = new_canvas(32, 96)
    d = ImageDraw.Draw(c)
    contact_shadow(c, 16, 92, 11, 4, 0.34)
    shade_block(d, 11, 40, 20, 90, [STONE[2], STONE[1], STONE[0]])
    # faixas horizontais (segmentos da torre)
    for y in (54, 68, 80):
        rect(d, 11, y, 20, y, STONE[0])
    d.rectangle([11, 40, 20, 90], outline=hx(OUTLINE))
    # topo: haste + anel emissor (nao organico -- arquitetura propria de Digimon)
    rect(d, 14, 14, 17, 40, AMBER_DARK)
    d.rectangle([14, 14, 17, 40], outline=hx(OUTLINE))
    d.ellipse([9, 8, 22, 21], outline=hx(AMBER), width=2)
    d.ellipse([12, 11, 19, 18], fill=a(AMBER, 200))
    d.ellipse([14, 13, 17, 16], fill=hx(AMBER))
    c.save(PROPS / "data_tower_32x96.png")


# ------------------------------------------------------------------
# 6) GROUND CIRCUIT DECALS -- overlay 32x32 (reto / curva / no) p/ sobrepor terra existente
# ------------------------------------------------------------------
def build_circuit_decal(kind):
    """Decalque de chao FLAT: toda a marca fica comprimida na faixa inferior do tile
    (y 18-30), como uma textura pintada no piso -- nunca uma linha vertical de
    tile inteiro (isso leria como estrutura em pe, nao como decalque de chao)."""
    c = new_canvas(32, 32)
    d = ImageDraw.Draw(c)
    glow = a(CYAN, 60)
    line = hx(CYAN)
    base_y = 25
    if kind == "straight":
        d.line([(2, base_y), (29, base_y)], fill=glow, width=4)
        d.line([(2, base_y), (29, base_y)], fill=line, width=1)
        for x in (8, 16, 24):
            d.point((x, base_y - 1), fill=hx(CYAN))
    elif kind == "corner":
        d.line([(6, base_y), (16, base_y), (16, base_y - 9)], fill=glow, width=4)
        d.line([(6, base_y), (16, base_y), (16, base_y - 9)], fill=line, width=1)
        d.ellipse([15, base_y - 1, 17, base_y + 1], fill=hx(CYAN))
    elif kind == "node":
        for p0, p1 in [((4, base_y), (28, base_y))]:
            d.line([p0, p1], fill=glow, width=4)
            d.line([p0, p1], fill=line, width=1)
        for p0, p1 in [((16, base_y - 8), (16, base_y))]:
            d.line([p0, p1], fill=glow, width=4)
            d.line([p0, p1], fill=line, width=1)
        d.ellipse([13, base_y - 3, 19, base_y + 3], fill=a(CYAN, 220))
        d.ellipse([15, base_y - 1, 17, base_y + 1], fill=hx(CYAN))
    c.save(PROPS / f"ground_circuit_{kind}_32x32.png")


# ------------------------------------------------------------------
# 7) CRISTAIS -- variantes de cor/tamanho (ciano reaproveitado, ambar e magenta novos)
# ------------------------------------------------------------------
def build_crystal(name, size, accent, accent_dark, n_shards=1, seed_shift=0):
    w, h = size
    c = new_canvas(w, h)
    d = ImageDraw.Draw(c)
    contact_shadow(c, w // 2, h - 3, max(4, w // 3), 2, 0.30)
    rng_x = [w * 0.5, w * 0.3, w * 0.7]
    for i in range(n_shards):
        cx = rng_x[i % len(rng_x)] + seed_shift
        base_y = h - 4
        top_y = 4 if i == 0 else int(h * 0.3)
        hw = max(3, w // (6 if n_shards > 1 else 4))
        d.polygon([(cx, top_y), (cx - hw, base_y), (cx + hw, base_y)], fill=a(accent, 235))
        d.polygon([(cx, top_y), (cx - hw, base_y), (cx, base_y)], fill=a(accent_dark, 235))
        d.polygon([(cx, top_y), (cx - 1, top_y + (base_y - top_y) // 3), (cx + 1, top_y + (base_y - top_y) // 3)], fill=(255, 255, 255, 180))
    out = Image.new("RGBA", (w, h), hx(OUTLINE))
    alpha = c.split()[3].point(lambda v: 255 if v > 0 else 0)
    edge = alpha.filter(ImageFilter.FIND_EDGES).point(lambda v: 255 if v > 10 else 0)
    out.putalpha(edge)
    glow = new_canvas(w, h)
    gd = ImageDraw.Draw(glow)
    gd.ellipse([w * 0.15, h * 0.1, w * 0.85, h * 0.9], fill=a(accent, 28))
    final = Image.alpha_composite(glow, c)
    final = Image.alpha_composite(final, out)
    final.save(PROPS / f"{name}_{w}x{h}.png")


def build_crystal_cluster():
    w, h = 32, 48
    c = new_canvas(w, h)
    d = ImageDraw.Draw(c)
    contact_shadow(c, 16, 45, 12, 3, 0.32)
    shards = [(10, 10, CYAN, CYAN_DARK), (18, 20, AMBER, AMBER_DARK), (24, 16, MAGENTA, MAGENTA_DARK)]
    for (cx, top_y, acc, acc_d) in shards:
        base_y = 44
        hw = 4
        d.polygon([(cx, top_y), (cx - hw, base_y), (cx + hw, base_y)], fill=a(acc, 235))
        d.polygon([(cx, top_y), (cx - hw, base_y), (cx, base_y)], fill=a(acc_d, 235))
    out = Image.new("RGBA", (w, h), hx(OUTLINE))
    alpha = c.split()[3].point(lambda v: 255 if v > 0 else 0)
    edge = alpha.filter(ImageFilter.FIND_EDGES).point(lambda v: 255 if v > 10 else 0)
    out.putalpha(edge)
    final = Image.alpha_composite(c, out)
    final.save(PROPS / "crystal_cluster_mixed_32x48.png")


# ------------------------------------------------------------------
# 8) DATA FRAGMENT -- animacao 4 quadros (16x16 cada, sheet 64x16)
# ------------------------------------------------------------------
def build_data_fragment_anim():
    fw, fh, n = 16, 16, 4
    sheet = new_canvas(fw * n, fh)
    for i in range(n):
        fc = new_canvas(fw, fh)
        d = ImageDraw.Draw(fc)
        bob = [0, -2, 0, 2][i]
        cx, cy = fw // 2, fh // 2 + bob
        d.rectangle([cx - 3, cy - 3, cx + 3, cy + 3], fill=a(CYAN, 60))
        pts = [(cx, cy - 4), (cx + 4, cy), (cx, cy + 4), (cx - 4, cy)]
        rot = i * 12
        rad = math.radians(rot)
        rp = []
        for (px, py) in pts:
            dx, dy = px - cx, py - cy
            rx = dx * math.cos(rad) - dy * math.sin(rad)
            ry = dx * math.sin(rad) + dy * math.cos(rad)
            rp.append((cx + rx, cy + ry))
        d.polygon(rp, fill=a(CYAN, 230))
        d.polygon(rp, outline=hx(OUTLINE))
        sheet.alpha_composite(fc, (i * fw, 0))
    sheet.save(PROPS / "data_fragment_anim_4f_64x16.png")


def run_all_props():
    build_ruin_small()
    build_ruin_column()
    build_ruin_arch()
    build_portal_gate()
    build_data_tower()
    for k in ("straight", "corner", "node"):
        build_circuit_decal(k)
    build_crystal("crystal_cyan", (24, 32), CYAN, CYAN_DARK, n_shards=2, seed_shift=-2)
    build_crystal("crystal_amber", (20, 26), AMBER, AMBER_DARK, n_shards=1)
    build_crystal("crystal_magenta", (16, 20), MAGENTA, MAGENTA_DARK, n_shards=1)
    build_crystal_cluster()
    build_data_fragment_anim()
    print("props ok:", sorted(p.name for p in PROPS.glob("*.png")))


if __name__ == "__main__":
    run_all_props()
