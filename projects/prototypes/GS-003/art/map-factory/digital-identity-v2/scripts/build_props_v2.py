#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Kit de props v2 -- Direcao Hibrida A+B ("ruinas de dados como tecido do mapa" + portal +
torre), polimento pedido pelo coordenador: pedra texturizada/rachada, musgo organico,
veios de dados integrados a pedra, circuito de chao organico meio-enterrado, portal com
superficie animavel, fragmentos animaveis, glitch sutil opcional. 100% Pillow local."""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).parent))
from common import (  # noqa: E402
    STONE, MOSS, DIRT, ROOT, OUTLINE, CYAN, CYAN_CORE, CYAN_DARK, AMBER, AMBER_DARK,
    MAGENTA, MAGENTA_DARK, hx, hxa, lighten, darken, new_canvas, textured_fill, blob_mask,
    rect_mask, mask_or, mask_sub, outline_from_alpha, contact_shadow, meander, draw_vein,
    moss_overhang,
)

ROOT_DIR = Path("/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/art/map-factory/digital-identity-v2")
PROPS = ROOT_DIR / "props"
PROPS.mkdir(parents=True, exist_ok=True)


def save(canvas, name):
    canvas.save(PROPS / name)
    print("ok", name)


# ---------------------------------------------------------------------------
# 1) RUIN PILLAR SMALL -- 32x32 (bloco de pedra quebrado, musgo, 1 veio)
# ---------------------------------------------------------------------------
def build_ruin_pillar_small():
    w, h = 32, 32
    silhouette = blob_mask(w, h, seed=101, circles=[(0.45, 0.55, 0.30), (0.62, 0.70, 0.22), (0.38, 0.75, 0.20)])
    # corta o topo para parecer quebrado (nao um blob redondo inteiro) -- mask_sub(a,b) remove b de a,
    # entao b precisa ser a regiao a REMOVER (topo), nao a regiao a manter
    silhouette = mask_sub(silhouette, rect_mask(w, h, 0, 0, w, 11))
    body = textured_fill(silhouette, STONE, light_dir=(-1, -1), seed=11)
    canvas = new_canvas(w, h)
    contact_shadow(canvas, 16, 29, 9, 3, 0.30)
    canvas.alpha_composite(body)
    canvas = moss_overhang(canvas, silhouette, seed=11, coverage=0.55)
    pts = meander((13, 27), (17, 11), 4, 3.2, seed=11)
    draw_vein(canvas, pts, width=1, node_every=0)
    canvas = outline_from_alpha(canvas)
    save(canvas, "ruin_pillar_small_32x32.png")


# ---------------------------------------------------------------------------
# 2) RUIN COLUMN TALL -- 32x96 (coluna alta tipo arvore, veio vertical + 2 nos, raizes)
# ---------------------------------------------------------------------------
def build_ruin_column_tall():
    w, h = 32, 96
    silhouette = blob_mask(w, h, seed=202, circles=[
        (0.5, 0.18, 0.26), (0.5, 0.40, 0.24), (0.5, 0.62, 0.25), (0.5, 0.84, 0.27),
        (0.38, 0.92, 0.14), (0.62, 0.90, 0.13),
    ])
    jagged_top = rect_mask(w, h, 0, 0, w, 8)
    silhouette = mask_sub(silhouette, jagged_top)
    body = textured_fill(silhouette, STONE, light_dir=(-1, -1), seed=22)
    canvas = new_canvas(w, h)
    contact_shadow(canvas, 16, 92, 11, 3, 0.34)
    canvas.alpha_composite(body)
    # fissuras horizontais (tijolos antigos) -- escurece faixas finas, nao risca por cima
    d = ImageDraw.Draw(canvas)
    sil_px = silhouette.load()
    for y in (28, 46, 64, 80):
        for x in range(w):
            if sil_px[x, y] >= 128:
                d.point((x, y), fill=hxa(STONE[0], 160))
    canvas = moss_overhang(canvas, silhouette, seed=22, coverage=0.4)
    pts = meander((16, 10), (15, 90), 7, 4.5, seed=22)
    draw_vein(canvas, pts, width=1, node_every=18)
    canvas = outline_from_alpha(canvas)
    save(canvas, "ruin_column_tall_32x96.png")


# ---------------------------------------------------------------------------
# 3) RUIN ARCH -- 96x96 (peca de assinatura: arco assimetrico, textura, musgo, veio)
# ---------------------------------------------------------------------------
def build_ruin_arch():
    w, h = 96, 96
    left_pillar = blob_mask(w, h, seed=301, circles=[
        (0.18, 0.35, 0.16), (0.16, 0.5, 0.17), (0.20, 0.65, 0.16), (0.17, 0.82, 0.15), (0.22, 0.90, 0.13),
    ])
    right_pillar = blob_mask(w, h, seed=302, circles=[
        (0.80, 0.45, 0.15), (0.83, 0.60, 0.16), (0.79, 0.75, 0.15), (0.82, 0.88, 0.13),
    ])
    lintel = blob_mask(w, h, seed=303, circles=[(0.30, 0.18, 0.17), (0.48, 0.15, 0.16), (0.63, 0.19, 0.15)])
    lintel = mask_sub(lintel, rect_mask(w, h, 72, 0, w, h))
    silhouette = mask_or(left_pillar, right_pillar, lintel)
    body = textured_fill(silhouette, STONE, light_dir=(-1, -1), seed=33)
    canvas = new_canvas(w, h)
    contact_shadow(canvas, 46, 90, 34, 6, 0.32)
    canvas.alpha_composite(body)
    d = ImageDraw.Draw(canvas)
    lp, rp = left_pillar.load(), right_pillar.load()
    for y in (36, 52, 68):
        for x in range(w):
            if lp[x, y] >= 128 or rp[x, y] >= 128:
                d.point((x, y), fill=hxa(STONE[0], 150))
    canvas = moss_overhang(canvas, silhouette, seed=33, coverage=0.45)
    d = ImageDraw.Draw(canvas)  # `canvas` foi reatribuido por moss_overhang -- precisa de um Draw novo
    # raizes finas descendo do lintel sobre o pilar esquerdo (vegetacao tomando a ruina)
    root_pts = meander((30, 20), (20, 55), 5, 6, seed=34)
    for i in range(len(root_pts) - 1):
        d.line([root_pts[i], root_pts[i + 1]], fill=hxa(ROOT[1], 220), width=1)
    pts_v = meander((16, 85), (18, 20), 6, 5, seed=33)
    pts_h = meander((18, 20), (66, 14), 5, 3, seed=35)
    draw_vein(canvas, pts_v, width=1, node_every=14)
    draw_vein(canvas, pts_h, width=1, node_every=14)
    canvas = outline_from_alpha(canvas)
    save(canvas, "ruin_arch_96x96.png")


# ---------------------------------------------------------------------------
# 4) RUIN BLOCK FALLEN -- 48x32 (bloco caido/inclinado, meio-enterrado em terra+musgo)
# ---------------------------------------------------------------------------
def build_ruin_block_fallen():
    w, h = 48, 32
    silhouette = blob_mask(w, h, seed=401, circles=[(0.30, 0.55, 0.26), (0.55, 0.60, 0.28), (0.75, 0.50, 0.20)])
    buried = rect_mask(w, h, 0, 22, w, h)  # metade inferior "afunda" na terra
    body = textured_fill(silhouette, STONE, light_dir=(-1, -1.2), seed=44)
    canvas = new_canvas(w, h)
    contact_shadow(canvas, 24, 29, 20, 4, 0.30)
    # terra/grama por cima da base (enterrado), pintada ANTES da pedra terminar de aparecer
    dirt_mask = Image.composite(silhouette, Image.new("L", (w, h), 0), buried)
    dirt_fill = textured_fill(dirt_mask, DIRT, light_dir=(-1, -1), seed=45)
    canvas.alpha_composite(body)
    canvas.alpha_composite(dirt_fill)
    canvas = moss_overhang(canvas, silhouette, seed=44, coverage=0.6)
    pts = meander((10, 18), (36, 12), 4, 3.5, seed=44)
    draw_vein(canvas, pts, width=1)
    canvas = outline_from_alpha(canvas)
    save(canvas, "ruin_block_fallen_48x32.png")


# ---------------------------------------------------------------------------
# 5) CIRCUIT PLATE -- 32x32 (placa metal/pedra com circuito gravado, semi-enterrada)
# ---------------------------------------------------------------------------
def build_circuit_plate():
    w, h = 32, 32
    silhouette = blob_mask(w, h, seed=501, circles=[(0.5, 0.55, 0.42)])
    body = textured_fill(silhouette, [STONE[0], STONE[1], STONE[2]], light_dir=(-1, -1), seed=55)
    canvas = new_canvas(w, h)
    contact_shadow(canvas, 16, 29, 13, 3, 0.26)
    canvas.alpha_composite(body)
    d = ImageDraw.Draw(canvas)
    # circuito gravado na placa (linhas retas, propositalmente mais geometricas que o veio
    # organico -- e uma PLACA tecnologica, nao uma rachadura natural)
    d.line([(7, 10), (7, 22), (14, 22)], fill=hxa(CYAN_DARK, 200), width=1)
    d.line([(14, 22), (14, 16), (24, 16)], fill=hxa(CYAN_DARK, 200), width=1)
    for (x, y) in [(7, 10), (14, 22), (14, 16), (24, 16)]:
        d.ellipse([x - 1, y - 1, x + 1, y + 1], fill=hxa(CYAN, 230))
    canvas = outline_from_alpha(canvas)
    # terra/grama cobrindo so ~20-25% da placa (1 canto), translucido -- decalque organico
    # "semi-enterrado" que ainda deixa o circuito gravado legivel, nao uma regua de metal
    # exposta inteira nem uma pedra totalmente coberta
    dirt_cover = blob_mask(w, h, seed=56, circles=[(0.22, 0.80, 0.16), (0.78, 0.72, 0.13)])
    dirt_on_plate = Image.composite(silhouette, Image.new("L", (w, h), 0), dirt_cover)
    dirt_fill = textured_fill(dirt_on_plate, DIRT, light_dir=(-1, -1), seed=57)
    dirt_fill.putalpha(dirt_fill.split()[3].point(lambda v: int(v * 0.65)))
    canvas.alpha_composite(dirt_fill)
    canvas = moss_overhang(canvas, dirt_on_plate, seed=58, coverage=1.0)
    save(canvas, "circuit_plate_32x32.png")


# ---------------------------------------------------------------------------
# 6) GROUND CIRCUIT DECALS -- organicos, parcialmente cobertos por terra/grama por cima
#    (decalque embutido no chao, nao uma linha neon flutuando) -- reto/curva/T/no/terminal
# ---------------------------------------------------------------------------
def build_circuit_decal(kind, seed):
    w, h = 32, 32
    canvas = new_canvas(w, h)
    paths = {
        "straight": [[(2, 24), (30, 22)]],
        "curve": [[(4, 10), (10, 20), (22, 26), (30, 27)]],
        "t": [[(2, 20), (30, 22)], [(16, 20), (15, 4)]],
        "node": [[(2, 22), (30, 20)], [(16, 30), (15, 10)]],
        "terminal": [[(4, 16), (18, 18)]],
    }[kind]
    for raw in paths:
        pts = meander(raw[0], raw[-1], 4, 2.2, seed=seed)
        if len(raw) > 2:
            pts = raw
        draw_vein(canvas, pts, width=1, node_every=0, crack_shadow=False)
    if kind == "node":
        d = ImageDraw.Draw(canvas)
        d.ellipse([13, 18, 19, 24], fill=hxa(CYAN, 230))
    if kind == "terminal":
        d = ImageDraw.Draw(canvas)
        d.ellipse([15, 13, 21, 19], outline=hxa(CYAN, 220), width=1)
        d.ellipse([17, 15, 19, 17], fill=hxa(CYAN_CORE, 230))
    # cobre so uma fatia (~20-30%, 1-2 tufos pequenos num canto) com terra/grama por cima --
    # o veio tem que continuar lendo como a peca principal (regra do brief: "meio coberto",
    # nao escondido); por isso o tom de terra sai translucido (alpha ~150), nao opaco
    cover = blob_mask(w, h, seed=seed + 50, circles=[(0.18, 0.78, 0.14), (0.82, 0.22, 0.11)])
    full = rect_mask(w, h, 0, 0, w, h)
    cover_region = Image.composite(full, Image.new("L", (w, h), 0), cover)
    cover_fill = textured_fill(cover_region, DIRT, light_dir=(-1, -1), seed=seed + 60)
    cover_fill.putalpha(cover_fill.split()[3].point(lambda v: int(v * 0.6)))
    canvas.alpha_composite(cover_fill)
    d2 = ImageDraw.Draw(canvas)
    rnd2 = __import__("random").Random(seed + 61)
    cpx = cover_region.load()
    tufts = 0
    while tufts < 5:
        x, y = rnd2.randint(0, w - 1), rnd2.randint(0, h - 1)
        if cpx[x, y] >= 128:
            d2.point((x, y), fill=hxa(MOSS[rnd2.randint(1, 2)], 220))
            tufts += 1
    save(canvas, f"ground_circuit_{kind}_32x32.png")


# ---------------------------------------------------------------------------
# 7) PORTAL GATE -- 80x112 (moldura de pedra-dados maior, textura real; energia em folha
#    separada animavel de 4 quadros)
# ---------------------------------------------------------------------------
def build_portal_gate():
    w, h = 80, 112
    outer = [(16, 106), (16, 46), (40, 12), (64, 46), (64, 106)]
    inner = [(26, 102), (26, 48), (40, 26), (54, 48), (54, 102)]
    outer_mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(outer_mask).polygon(outer, fill=255)
    inner_mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(inner_mask).polygon(inner, fill=255)
    frame_mask = mask_sub(outer_mask, inner_mask)
    frame = textured_fill(frame_mask, STONE, light_dir=(-1, -1), seed=66)
    canvas = new_canvas(w, h)
    contact_shadow(canvas, 40, 108, 24, 5, 0.34)
    # base/soquete
    d = ImageDraw.Draw(canvas)
    base_l = textured_fill(rect_mask(w, h, 12, 100, 28, 110), STONE, light_dir=(-1, -1), seed=67)
    base_r = textured_fill(rect_mask(w, h, 52, 100, 68, 110), STONE, light_dir=(-1, -1), seed=68)
    canvas.alpha_composite(base_l)
    canvas.alpha_composite(base_r)
    canvas.alpha_composite(frame)
    canvas = moss_overhang(canvas, frame_mask, seed=66, coverage=0.4)
    # veio de dados correndo pela moldura inteira (integrado, nao decorativo solto)
    pts = meander(outer[0], outer[2], 6, 2.5, seed=69)
    draw_vein(canvas, pts, width=1, node_every=10)
    pts2 = meander(outer[2], outer[4], 6, 2.5, seed=70)
    draw_vein(canvas, pts2, width=1, node_every=10)
    canvas = outline_from_alpha(canvas)
    save(canvas, "portal_gate_80x112.png")
    # ---- superficie de energia, folha animavel 4 quadros (64x64 por quadro) ----
    fw, fh, n = 64, 64, 4
    sheet = new_canvas(fw * n, fh)
    for i in range(n):
        fc = new_canvas(fw, fh)
        fd = ImageDraw.Draw(fc)
        im = Image.new("L", (fw, fh), 0)
        ImageDraw.Draw(im).polygon([(x - 16, y - 38) for (x, y) in inner], fill=255)
        phase = i / n
        for ring in range(3):
            rad = 10 + ring * 7 + (phase * 7) % 7
            alpha = max(0, 160 - ring * 40 - int(phase * 30))
            fd.ellipse([fw / 2 - rad, fh / 2 - rad, fw / 2 + rad, fh / 2 + rad], outline=hxa(CYAN, alpha), width=2)
        fd.ellipse([fw / 2 - 9, fh / 2 - 9, fw / 2 + 9, fh / 2 + 9], fill=hxa(CYAN_CORE, 235))
        masked = new_canvas(fw, fh)
        masked.paste(fc, (0, 0), im)
        sheet.alpha_composite(masked, (i * fw, 0))
    save(sheet, "portal_energy_anim_4f_256x64.png")


# ---------------------------------------------------------------------------
# 8) DATA TOWER -- 40x104, corpo de pedra texturizado + anel ambar no topo
# ---------------------------------------------------------------------------
def build_data_tower():
    w, h = 40, 104
    silhouette = blob_mask(w, h, seed=801, circles=[
        (0.5, 0.52, 0.22), (0.5, 0.70, 0.23), (0.5, 0.88, 0.24),
    ])
    silhouette = mask_sub(silhouette, rect_mask(w, h, 0, 0, w, 46))
    body = textured_fill(silhouette, STONE, light_dir=(-1, -1), seed=81)
    canvas = new_canvas(w, h)
    contact_shadow(canvas, 20, 100, 14, 4, 0.34)
    canvas.alpha_composite(body)
    d = ImageDraw.Draw(canvas)
    sp = silhouette.load()
    for y in (60, 74, 88):
        for x in range(w):
            if sp[x, y] >= 128:
                d.point((x, y), fill=hxa(STONE[0], 150))
    canvas = moss_overhang(canvas, silhouette, seed=81, coverage=0.3)
    d = ImageDraw.Draw(canvas)  # `canvas` foi reatribuido por moss_overhang -- precisa de um Draw novo
    # haste + anel emissor ambar
    d.rectangle([17, 18, 22, 48], fill=hxa(AMBER_DARK, 255))
    d.rectangle([17, 18, 22, 48], outline=hxa(OUTLINE, 255))
    d.ellipse([10, 8, 29, 27], outline=hxa(AMBER, 255), width=2)
    d.ellipse([14, 12, 25, 23], fill=hxa(AMBER, 210))
    d.ellipse([17, 15, 22, 20], fill=hxa(lighten(AMBER, 0.5), 240))
    canvas = outline_from_alpha(canvas)
    save(canvas, "data_tower_40x104.png")


# ---------------------------------------------------------------------------
# 9) CRISTAIS -- facetas organicas, textura de dither leve, glow suave
# ---------------------------------------------------------------------------
def build_crystal(name, size, accent, accent_dark, n_shards=1, seed=0):
    w, h = size
    c = new_canvas(w, h)
    contact_shadow(c, w // 2, h - 3, max(4, w // 3), 2, 0.30)
    d = ImageDraw.Draw(c)
    xs = [w * 0.5, w * 0.32, w * 0.68]
    for i in range(n_shards):
        cx = xs[i % len(xs)]
        base_y = h - 4
        top_y = 4 if i == 0 else int(h * 0.32)
        hw = max(3, w // (6 if n_shards > 1 else 4))
        d.polygon([(cx, top_y), (cx - hw, base_y), (cx + hw, base_y)], fill=hxa(accent, 235))
        d.polygon([(cx, top_y), (cx - hw, base_y), (cx, base_y)], fill=hxa(accent_dark, 235))
        d.line([(cx, top_y), (cx - 1, top_y + (base_y - top_y) * 0.4)], fill=hxa(lighten(accent, 0.6), 220), width=1)
    out = Image.new("RGBA", (w, h), hxa(OUTLINE, 255))
    alpha = c.split()[3].point(lambda v: 255 if v > 0 else 0)
    from PIL import ImageFilter
    edge = alpha.filter(ImageFilter.FIND_EDGES).point(lambda v: 255 if v > 10 else 0)
    out.putalpha(edge)
    glow = new_canvas(w, h)
    ImageDraw.Draw(glow).ellipse([w * 0.1, h * 0.05, w * 0.9, h * 0.95], fill=hxa(accent, 30))
    final = Image.alpha_composite(glow, c)
    final = Image.alpha_composite(final, out)
    save(final, f"{name}_{w}x{h}.png")


def build_crystal_cluster():
    w, h = 36, 50
    c = new_canvas(w, h)
    contact_shadow(c, 18, 47, 13, 3, 0.32)
    d = ImageDraw.Draw(c)
    shards = [(11, 10, CYAN, CYAN_DARK), (20, 22, AMBER, AMBER_DARK), (27, 16, MAGENTA, MAGENTA_DARK)]
    for (cx, top_y, acc, acc_d) in shards:
        base_y = 46
        hw = 4
        d.polygon([(cx, top_y), (cx - hw, base_y), (cx + hw, base_y)], fill=hxa(acc, 235))
        d.polygon([(cx, top_y), (cx - hw, base_y), (cx, base_y)], fill=hxa(acc_d, 235))
    out = Image.new("RGBA", (w, h), hxa(OUTLINE, 255))
    alpha = c.split()[3].point(lambda v: 255 if v > 0 else 0)
    from PIL import ImageFilter
    edge = alpha.filter(ImageFilter.FIND_EDGES).point(lambda v: 255 if v > 10 else 0)
    out.putalpha(edge)
    final = Image.alpha_composite(c, out)
    save(final, "crystal_cluster_mixed_36x50.png")


# ---------------------------------------------------------------------------
# 10) DATA FRAGMENT -- animacao 4 quadros (mantido de v1, com nucleo + leve rastro)
# ---------------------------------------------------------------------------
def build_data_fragment_anim():
    import math as _m
    fw, fh, n = 16, 16, 4
    sheet = new_canvas(fw * n, fh)
    for i in range(n):
        fc = new_canvas(fw, fh)
        d = ImageDraw.Draw(fc)
        bob = [0, -2, 0, 2][i]
        cx, cy = fw // 2, fh // 2 + bob
        d.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=hxa(CYAN, 55))
        pts = [(cx, cy - 4), (cx + 4, cy), (cx, cy + 4), (cx - 4, cy)]
        rad = _m.radians(i * 14)
        rp = []
        for (px, py) in pts:
            dx, dy = px - cx, py - cy
            rx = dx * _m.cos(rad) - dy * _m.sin(rad)
            ry = dx * _m.sin(rad) + dy * _m.cos(rad)
            rp.append((cx + rx, cy + ry))
        d.polygon(rp, fill=hxa(CYAN, 230))
        d.polygon(rp, outline=hxa(OUTLINE, 255))
        d.point((cx, cy), fill=hxa(CYAN_CORE, 255))
        sheet.alpha_composite(fc, (i * fw, 0))
    save(sheet, "data_fragment_anim_4f_64x16.png")


# ---------------------------------------------------------------------------
# 11) GLITCH OVERLAY (dir. C sutil) -- apenas para uso opcional perto do portal
# ---------------------------------------------------------------------------
def build_glitch_overlay():
    import random as _r
    w, h = 48, 48
    canvas = new_canvas(w, h)
    rnd = _r.Random(999)
    d = ImageDraw.Draw(canvas)
    for _ in range(10):
        x = rnd.randint(0, w - 6)
        y = rnd.randint(0, h - 3)
        bw = rnd.randint(3, 8)
        d.rectangle([x, y, x + bw, y + 1], fill=hxa(CYAN, 110))
    for _ in range(6):
        x = rnd.randint(0, w - 4)
        y = rnd.randint(0, h - 4)
        d.rectangle([x, y, x + 3, y + 3], outline=hxa(CYAN, 160))
    save(canvas, "glitch_overlay_subtle_48x48.png")


def run_all():
    build_ruin_pillar_small()
    build_ruin_column_tall()
    build_ruin_arch()
    build_ruin_block_fallen()
    build_circuit_plate()
    for i, kind in enumerate(("straight", "curve", "t", "node", "terminal")):
        build_circuit_decal(kind, seed=100 + i)
    build_portal_gate()
    build_data_tower()
    build_crystal("crystal_cyan", (26, 34), CYAN, CYAN_DARK, n_shards=2, seed=11)
    build_crystal("crystal_amber", (20, 26), AMBER, AMBER_DARK, n_shards=1, seed=12)
    build_crystal("crystal_magenta", (16, 20), MAGENTA, MAGENTA_DARK, n_shards=1, seed=13)
    build_crystal_cluster()
    build_data_fragment_anim()
    build_glitch_overlay()
    print("props v2 ok:", sorted(p.name for p in PROPS.glob("*.png")))


if __name__ == "__main__":
    run_all()
