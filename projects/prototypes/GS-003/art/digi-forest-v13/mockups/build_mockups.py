#!/usr/bin/env python3
"""Compose DigiForest v13 mockups: PixelLab map render (nearest-neighbor upscale)
+ official DS Guilmon/Tamer sprites at native scale, no interpolation anywhere.
Night variant: Style Bible §6 grade (S*0.64 V*0.8 ambient, cooler tone) applied
only to the background map, never to the official sprites."""
import sys
from pathlib import Path
from PIL import Image, ImageEnhance

BASE = Path(__file__).parent
ASSETS = BASE.parent.parent.parent / "quality-overhaul" / "direction-v13" / "assets"
RAW = BASE / "raw"

GUILMON = ASSETS / "guilmon_official_S.png"
TAMER = ASSETS / "tamer_official_SE.png"


def nn_upscale(img: Image.Image, factor: int) -> Image.Image:
    return img.resize((img.width * factor, img.height * factor), Image.NEAREST)


def night_grade(img: Image.Image) -> Image.Image:
    """Style Bible §6: saturation x0.64, value x0.8, cooled toward foliageDepthNight."""
    rgba = img.convert("RGBA")
    r, g, b, a = rgba.split()
    rgb = Image.merge("RGB", (r, g, b))
    rgb = ImageEnhance.Color(rgb).enhance(0.64)
    rgb = ImageEnhance.Brightness(rgb).enhance(0.62)
    # cool tint: push blue up slightly, red down slightly (foliageDepthNight direction)
    r2, g2, b2 = rgb.split()
    r2 = r2.point(lambda v: max(0, v - 10))
    b2 = b2.point(lambda v: min(255, v + 18))
    rgb = Image.merge("RGB", (r2, g2, b2))
    out = Image.merge("RGBA", (*rgb.split(), a))
    return out


def paste_contact_shadow(canvas: Image.Image, x: int, y: int, w: int, h: int, opacity=90):
    shadow = Image.new("RGBA", (w, max(4, h // 5)), (0, 0, 0, 0))
    from PIL import ImageDraw
    d = ImageDraw.Draw(shadow)
    d.ellipse([0, 0, w - 1, shadow.height - 1], fill=(8, 6, 10, opacity))
    canvas.alpha_composite(shadow, (x, y + h - shadow.height // 2))


def build(raw_name: str, out_name: str, scale: int, guilmon_pos, tamer_pos, final_size):
    scene = Image.open(RAW / raw_name).convert("RGBA")
    scene_up = nn_upscale(scene, scale)

    guilmon = Image.open(GUILMON).convert("RGBA")
    tamer = Image.open(TAMER).convert("RGBA")
    guilmon_up = nn_upscale(guilmon, scale)
    tamer_up = nn_upscale(tamer, scale)

    canvas = scene_up.copy()
    gx, gy = guilmon_pos
    tx, ty = tamer_pos
    paste_contact_shadow(canvas, gx, gy, guilmon_up.width, guilmon_up.height)
    paste_contact_shadow(canvas, tx, ty, tamer_up.width, tamer_up.height)
    canvas.alpha_composite(guilmon_up, (gx, gy))
    canvas.alpha_composite(tamer_up, (tx, ty))

    # center-crop/pad to final_size (never rescale again — nearest-neighbor canvas op only)
    fw, fh = final_size
    out = Image.new("RGBA", (fw, fh), (10, 10, 16, 255))
    ox = (fw - canvas.width) // 2
    oy = (fh - canvas.height) // 2
    out.alpha_composite(canvas, (max(0, ox), max(0, oy)))
    out.convert("RGB").save(BASE / f"{out_name}_day.png")

    night = night_grade(scene_up)
    canvas_n = night.copy()
    paste_contact_shadow(canvas_n, gx, gy, guilmon_up.width, guilmon_up.height, opacity=140)
    paste_contact_shadow(canvas_n, tx, ty, tamer_up.width, tamer_up.height, opacity=140)
    canvas_n.alpha_composite(guilmon_up, (gx, gy))
    canvas_n.alpha_composite(tamer_up, (tx, ty))
    out_n = Image.new("RGBA", (fw, fh), (4, 4, 10, 255))
    out_n.alpha_composite(canvas_n, (max(0, ox), max(0, oy)))
    out_n.convert("RGB").save(BASE / f"{out_name}_night.png")
    print(f"{out_name}: day+night saved, scene {scene.size} -> {scene_up.size} -> canvas {final_size}")


if __name__ == "__main__":
    # clareira_raw.png is 480x288 native (32px tiles); x4 -> 1920x1152, crop to 1080
    build(
        "clareira_raw.png", "v13_mockup_clareira", scale=4,
        guilmon_pos=(1180, 620), tamer_pos=(1260, 600),
        final_size=(1920, 1080),
    )
    # overview_raw.png is 768x608 native; x2 -> 1536x1216, pad/crop to 1920x1080
    build(
        "overview_raw.png", "v13_mockup_overview", scale=2,
        guilmon_pos=(660, 420), tamer_pos=(700, 410),
        final_size=(1920, 1080),
    )
