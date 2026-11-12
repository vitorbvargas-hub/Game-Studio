#!/usr/bin/env python3
"""v13 'GBA Clean' main mockup: PixelLab background (free-tier test) +
official DS sprites (Guilmon, Tamer) composited at real game scale,
nearest-neighbor 5x zoom only (no interpolation on official sprites,
per Style Bible Sec.1/Sec.4 hard rules), elliptical contact shadows,
2 hand-drawn Digimon-touch props, optional light HUD labels."""
from PIL import Image, ImageDraw, ImageFont

ROOT = "/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/quality-overhaul/direction-v13"
ASSETS = f"{ROOT}/assets"
TEST = f"{ROOT}/pixellab-test"
MOCK = f"{ROOT}/mockups"
ZOOM = 5  # integer nearest-neighbor factor, applied to every layer alike

FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"


def nn(im, factor):
    return im.resize((im.width * factor, im.height * factor), Image.NEAREST)


def contact_shadow(width, height, alpha=95):
    """Flat dark ellipse, style bible Sec.5: 25-40% opacity, neutral dark."""
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([0, 0, width - 1, height - 1], fill=(24, 20, 37, alpha))
    return img


def paste_with_shadow(base, sprite, foot_xy, shadow_wh):
    sx, sy = foot_xy
    sw, sh = shadow_wh
    shadow = contact_shadow(sw, sh)
    base.alpha_composite(shadow, (int(sx - sw / 2), int(sy - sh / 2)))
    base.alpha_composite(sprite, (int(sx - sprite.width / 2), int(sy - sprite.height)))


def name_chip(text, level_text, width=190):
    """Minimal flat HUD label chip, v13 style: solid fill, 2px outline, no gradient."""
    h = 40
    img = Image.new("RGBA", (width, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, width - 1, h - 1], radius=8,
                         fill=(18, 24, 20, 215), outline=(235, 245, 235, 255), width=2)
    try:
        font = ImageFont.truetype(FONT_PATH, 16)
        font_small = ImageFont.truetype(FONT_PATH, 12)
    except Exception:
        font = ImageFont.load_default()
        font_small = font
    d.text((10, 4), text, font=font, fill=(255, 255, 255, 255))
    d.text((10, 22), level_text, font=font_small, fill=(170, 230, 170, 255))
    # tiny flat HP bar
    d.rounded_rectangle([width - 70, 24, width - 10, 32], radius=3, fill=(20, 40, 24, 255))
    d.rounded_rectangle([width - 68, 26, width - 14, 30], radius=2, fill=(90, 200, 100, 255))
    return img


def main():
    bg = Image.open(f"{TEST}/pixen_clareira_ruinas_384x216.png").convert("RGBA")
    scene = nn(bg, ZOOM)  # 384*5=1920, 216*5=1080

    guilmon = nn(Image.open(f"{ASSETS}/guilmon_official_S.png").convert("RGBA"), ZOOM)   # 200x180
    tamer = nn(Image.open(f"{ASSETS}/tamer_official_SE.png").convert("RGBA"), ZOOM)       # 130x165
    crystal = Image.open(f"{ASSETS}/prop_data_crystal_5x.png").convert("RGBA")
    totem = Image.open(f"{ASSETS}/prop_digital_totem_5x.png").convert("RGBA")

    # foot anchors measured from each sprite's own content bbox (bottom-center),
    # expressed on the ALREADY-ZOOMED sprite (so still integer-consistent).
    tamer_foot_local = (65, 160)     # 26x33 canvas *5, bbox bottom ~31*5=155, small margin
    guilmon_foot_local = (103, 172)  # 40x36 canvas *5, bbox bottom ~34*5=170

    def crop_offset(img, local_xy):
        return local_xy

    # Scene placement (1920x1080 canvas) — open path/clearing center, per bg composition.
    tamer_pos = (760, 760)
    guilmon_pos = (1040, 700)
    totem_pos = (1540, 560)
    crystal_pos = (300, 540)
    crystal_pos2 = (1680, 430)

    # --- shadows + sprites ---
    def place_official(base, sprite, local_foot, world_xy, shadow_w, shadow_h):
        wx, wy = world_xy
        lx, ly = local_foot
        top_left = (wx - lx, wy - ly)
        shadow = contact_shadow(shadow_w, shadow_h)
        base.alpha_composite(shadow, (int(wx - shadow_w / 2), int(wy - shadow_h * 0.6)))
        base.alpha_composite(sprite, top_left)

    place_official(scene, tamer, tamer_foot_local, tamer_pos, 70, 26)
    place_official(scene, guilmon, guilmon_foot_local, guilmon_pos, 90, 30)

    # --- hand-drawn Digimon-touch props (own shadow baked lightly) ---
    def place_prop(base, prop, world_xy):
        wx, wy = world_xy
        shadow = contact_shadow(prop.width, int(prop.height * 0.22), alpha=80)
        base.alpha_composite(shadow, (wx - prop.width // 2, wy - prop.height // 10))
        base.alpha_composite(prop, (wx - prop.width // 2, wy - prop.height))

    place_prop(scene, totem, totem_pos)
    place_prop(scene, crystal, crystal_pos)
    place_prop(scene, crystal, crystal_pos2)

    # --- optional light HUD labels (not a HUD redesign, just game-view context) ---
    guilmon_chip = name_chip("Guilmon  Nv.6", "player: Kaio")
    tamer_chip = name_chip("Kaio  Nv.44", "Tamer")
    scene.alpha_composite(guilmon_chip, (guilmon_pos[0] - 95, guilmon_pos[1] - 270))
    scene.alpha_composite(tamer_chip, (tamer_pos[0] - 95, tamer_pos[1] - 250))

    scene.convert("RGB").save(f"{MOCK}/v13_mockup_1920x1080.png", quality=95)
    scene.save(f"{MOCK}/v13_mockup_1920x1080_rgba.png")
    print("saved", scene.size)


if __name__ == "__main__":
    main()
