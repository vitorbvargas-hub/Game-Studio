#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Motor de textura/pintura procedural reutilizavel para os props v2 (ruinas de dados).
100% Pillow local, sem PixelLab, sem IA generativa de imagem. Paleta reaproveitada de
forest-v11-ground/palette.json (stone/moss/dirt ja aprovados em producao) + ciano/ambar
dos props existentes (data_crystal.png/data_totem.png). Objetivo: textura com ruido
quantizado (nao flat), silhuetas organicas (blob/metaball), veios/cracks em caminho
sinuoso (midpoint displacement), tudo sem blur/antialiasing (regra dura do Style Bible)."""
import math
import random
from PIL import Image, ImageDraw, ImageFilter

# ---------------------------------------------------------------------------
# Paleta (forest-v11-ground/palette.json + forest-v8-depth/props, 0 hex novo p/
# pedra/musgo/terra; magenta mantido como unico acento novo, ja registrado em
# PROPS_MANIFEST v1 como pendencia de decisao do GAME-ART-DIRECTOR)
# ---------------------------------------------------------------------------
STONE = ["#2f333a", "#474b54", "#656b75", "#8c9199"]       # crevice-dark, dark, mid, light (4 tons)
MOSS = ["#1d3022", "#445838", "#49643c"]                     # interior escuro, base, borda clara (3 tons)
DIRT = ["#3f3025", "#584531", "#715b41", "#8c7656"]          # forest-v11-ground, 4 tons (reaproveitado)
ROOT = ["#2a1f18", "#4a3828"]                                 # raiz/casca escura (aprox. dirt[0]/[1], sem hex novo)
OUTLINE = "#08181e"
CYAN = "#2ce8f5"
CYAN_CORE = "#c8fbff"
CYAN_DARK = "#139aa8"
AMBER = "#feae34"
AMBER_DARK = "#b06f12"
MAGENTA = "#f23fb0"
MAGENTA_DARK = "#9c1d75"


def hx(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def hxa(h, a=255):
    r, g, b = hx(h)
    return (r, g, b, a)


def lighten(h, f):
    r, g, b = hx(h)
    return "#%02x%02x%02x" % (min(255, int(r + (255 - r) * f)), min(255, int(g + (255 - g) * f)), min(255, int(b + (255 - b) * f)))


def darken(h, f):
    r, g, b = hx(h)
    return "#%02x%02x%02x" % (int(r * (1 - f)), int(g * (1 - f)), int(b * (1 - f)))


def new_canvas(w, h):
    return Image.new("RGBA", (w, h), (0, 0, 0, 0))


# ---------------------------------------------------------------------------
# Ruido determinístico (hash inteiro -> 0..1), sem numpy, sem blur -- so para
# escolher qual TOM de uma rampa discreta cada pixel recebe (dither, nao gradiente).
# ---------------------------------------------------------------------------
def _hash01(x, y, seed):
    n = (x * 374761393 + y * 668265263 + seed * 2246822519) & 0xFFFFFFFF
    n = (n ^ (n >> 13)) * 1274126177 & 0xFFFFFFFF
    n = n ^ (n >> 16)
    return (n & 0xFFFF) / 65535.0


_BAYER4 = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]


def textured_fill(mask, tones, light_dir=(-1, -1), band_strength=0.85, noise_strength=0.22, seed=0):
    """Preenche a silhueta `mask` (L, 255=dentro) com `tones` (lista de hex, escuro->claro)
    usando dither ordenado (Bayer 4x4) + ruido hash por pixel -- textura granulada mas sem
    blur, igual ao padrao de pedra/terra do jogo real (nao um gradiente continuo)."""
    w, h = mask.size
    out = new_canvas(w, h)
    px_mask = mask.load()
    px_out = out.load()
    n = len(tones)
    cx, cy = w / 2.0, h / 2.0
    lx, ly = light_dir
    norm = math.hypot(lx, ly) or 1
    lx, ly = lx / norm, ly / norm
    for y in range(h):
        for x in range(w):
            if px_mask[x, y] < 128:
                continue
            dx, dy = (x - cx) / (w / 2 + 1), (y - cy) / (h / 2 + 1)
            grad = -(dx * lx + dy * ly)  # -1 (lado da luz) .. +1 (lado da sombra)
            bayer = (_BAYER4[y % 4][x % 4] / 16.0) - 0.5
            noise = _hash01(x, y, seed) - 0.5
            t = 0.5 + grad * band_strength * 0.5 + bayer * noise_strength + noise * noise_strength * 0.6
            idx = min(n - 1, max(0, int(t * n)))
            px_out[x, y] = hxa(tones[idx], 255)
    return out


def blob_mask(w, h, seed, circles, feather=0):
    """Silhueta organica: uniao solida de elipses (cada circulo desenhado cheio e somado
    por OR -- garante preenchimento real, sem threshold fragil de metaball). `circles` =
    [(cx,cy,r), ...] em fracao 0..1 de w/h; overlaps das elipses criam a silhueta lumpy."""
    mask = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(mask)
    for (fcx, fcy, fr) in circles:
        ccx, ccy, cr = fcx * w, fcy * h, fr * max(w, h)
        d.ellipse([ccx - cr, ccy - cr, ccx + cr, ccy + cr], fill=255)
    return mask


def rect_mask(w, h, x0, y0, x1, y1):
    m = Image.new("L", (w, h), 0)
    ImageDraw.Draw(m).rectangle([x0, y0, x1, y1], fill=255)
    return m


def union_mask(a, b):
    return Image.eval(Image.composite(a, b, a), lambda v: v)


def mask_or(*masks):
    out = masks[0].copy()
    for m in masks[1:]:
        out = Image.composite(Image.new("L", out.size, 255), out, m)
    return out


def mask_sub(a, b):
    """a menos b (b vira transparente dentro de a)."""
    inv = Image.eval(b, lambda v: 255 - v)
    out = Image.new("L", a.size, 0)
    out.paste(a, (0, 0), inv)
    return out


def outline_from_alpha(canvas, color=OUTLINE):
    """Contorno escuro macio só na borda externa da silhueta (alpha>0), 1px, sem blur."""
    alpha = canvas.split()[3].point(lambda v: 255 if v > 10 else 0)
    edge = alpha.filter(ImageFilter.FIND_EDGES).point(lambda v: 255 if v > 10 else 0)
    out = Image.new("RGBA", canvas.size, hxa(color, 255))
    out.putalpha(edge)
    result = canvas.copy()
    result.alpha_composite(out)
    return result


def contact_shadow(canvas, cx, bottom_y, rx, ry, opacity=0.32):
    d = ImageDraw.Draw(canvas)
    alpha = int(255 * opacity)
    d.ellipse([cx - rx, bottom_y - ry, cx + rx, bottom_y + ry], fill=(6, 8, 8, alpha))


def meander(start, end, n_points, jitter, seed):
    """Caminho organico por deslocamento de ponto medio (midpoint displacement),
    recursivo simples -- evita linhas retas de cristal/circuito."""
    rnd = random.Random(seed)
    pts = [start, end]
    depth = max(1, int(math.log2(max(2, n_points))))
    for _ in range(depth):
        new_pts = [pts[0]]
        for i in range(len(pts) - 1):
            (x0, y0), (x1, y1) = pts[i], pts[i + 1]
            mx, my = (x0 + x1) / 2, (y0 + y1) / 2
            perp = (-(y1 - y0), (x1 - x0))
            plen = math.hypot(*perp) or 1
            off = (rnd.random() - 0.5) * jitter
            mx += perp[0] / plen * off
            my += perp[1] / plen * off
            new_pts.append((mx, my))
            new_pts.append(pts[i + 1])
        pts = new_pts
        jitter *= 0.55
    return pts


def draw_vein(canvas, points, core=CYAN, dark=CYAN_DARK, width=1, node_every=0, crack_shadow=True):
    """Veio/rachadura de dados: opcionalmente escurece uma faixa fina da pedra ao redor
    (fissura real, nao linha flutuante), depois desenha nucleo brilhante + nos luminosos."""
    d = ImageDraw.Draw(canvas)
    if crack_shadow:
        for i in range(len(points) - 1):
            d.line([points[i], points[i + 1]], fill=(*hx(darken(dark, 0.35)), 140), width=width + 2)
    for i in range(len(points) - 1):
        d.line([points[i], points[i + 1]], fill=hxa(dark, 210), width=max(1, width))
    for i in range(len(points) - 1):
        d.line([points[i], points[i + 1]], fill=hxa(core, 255), width=1)
    if node_every:
        for i in range(0, len(points), node_every):
            x, y = points[i]
            d.ellipse([x - 1.4, y - 1.4, x + 1.4, y + 1.4], fill=hxa(CYAN_CORE, 255))


def moss_overhang(canvas, mask_region, seed, tones=MOSS, coverage=0.5):
    """Musgo como blobs organicos (nao retangulo) por cima da silhueta, concentrado
    na metade inferior/saliencias (moss cresce debaixo p/ cima em superficies umidas)."""
    w, h = canvas.size
    rnd = random.Random(seed)
    region_px = mask_region.load()
    moss_layer = new_canvas(w, h)
    md = ImageDraw.Draw(moss_layer)
    blobs = max(2, int((w * h) ** 0.5 / 10))
    placed = 0
    attempts = 0
    while placed < blobs and attempts < blobs * 8:
        attempts += 1
        x = rnd.randint(0, w - 1)
        y = rnd.randint(int(h * (1 - coverage)), h - 1)
        if region_px[x, y] < 128:
            continue
        r = rnd.randint(2, 4)
        tone = tones[rnd.randint(0, len(tones) - 1)]
        md.ellipse([x - r, y - r * 0.7, x + r, y + r * 0.7], fill=hxa(tone, 230))
        placed += 1
    out = canvas.copy()
    mask_alpha = Image.composite(moss_layer.split()[3], Image.new("L", (w, h), 0), mask_region)
    moss_clipped = moss_layer.copy()
    moss_clipped.putalpha(mask_alpha)
    out.alpha_composite(moss_clipped)
    return out


def night_tint_image(im, stone_hexes=None, moss_hexes=None, glow_hexes=None, halo=True):
    """Noite: pedra/musgo escurecem, acentos luminosos (ciano/ambar/magenta) intensificam
    e ganham um halo suave (dilatacao simples por amostragem em anel, sem GaussianBlur
    para nao introduzir AA fora da regra) -- pedido explicito do brief v2."""
    stone_hexes = stone_hexes or set(STONE)
    moss_hexes = moss_hexes or set(MOSS)
    glow_hexes = glow_hexes or {CYAN, CYAN_DARK, CYAN_CORE, AMBER, AMBER_DARK, MAGENTA, MAGENTA_DARK}
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    glow_mask = Image.new("L", (w, h), 0)
    gpx = glow_mask.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            hh = "#%02x%02x%02x" % (r, g, b)
            if hh in stone_hexes or hh in moss_hexes or hh == OUTLINE:
                px[x, y] = (int(r * 0.52), int(g * 0.56), min(255, int(b * 0.72)), a)
            elif hh in glow_hexes:
                px[x, y] = (min(255, int(r * 1.15)), min(255, int(g * 1.15)), min(255, int(b * 1.22)), a)
                gpx[x, y] = 255
    if halo:
        halo_layer = new_canvas(w, h)
        hd = ImageDraw.Draw(halo_layer)
        gm = glow_mask.load()
        for y in range(h):
            for x in range(w):
                if gm[x, y]:
                    r, g, b, a = px[x, y]
                    hd.ellipse([x - 2, y - 2, x + 2, y + 2], fill=(r, g, b, 26))
        base = halo_layer.copy()
        base.alpha_composite(im)
        return base
    return im
