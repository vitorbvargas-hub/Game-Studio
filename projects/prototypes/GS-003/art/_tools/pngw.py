"""Minimal dependency-free RGBA PNG writer + pixel canvas helpers.

No PIL/pip available in this environment, so PNG bytes are built by hand
(signature + IHDR/IDAT/IEND chunks, zlib-compressed scanlines, filter 0).
"""
import struct
import zlib
import math
import random


def _chunk(tag, data):
    return (
        struct.pack(">I", len(data))
        + tag
        + data
        + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    )


def save_png(path, width, height, pixels):
    """pixels: list[height][width] of (r,g,b,a) 0-255 tuples."""
    raw = bytearray()
    for y in range(height):
        raw.append(0)  # filter type 0 (none) per scanline
        row = pixels[y]
        for x in range(width):
            r, g, b, a = row[x]
            raw += bytes((r, g, b, a))
    compressed = zlib.compress(bytes(raw), 9)
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    png = (
        b"\x89PNG\r\n\x1a\n"
        + _chunk(b"IHDR", ihdr)
        + _chunk(b"IDAT", compressed)
        + _chunk(b"IEND", b"")
    )
    with open(path, "wb") as f:
        f.write(png)


class Canvas:
    def __init__(self, width, height, bg=(0, 0, 0, 0)):
        self.w = width
        self.h = height
        self.px = [[bg for _ in range(width)] for _ in range(height)]

    def set(self, x, y, rgba):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.px[y][x] = rgba

    def get(self, x, y):
        if 0 <= x < self.w and 0 <= y < self.h:
            return self.px[y][x]
        return (0, 0, 0, 0)

    def rect(self, x, y, w, h, rgba):
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                self.set(xx, yy, rgba)

    def rect_outline(self, x, y, w, h, rgba, thickness=1):
        for t in range(thickness):
            self.rect(x + t, y + t, w - 2 * t, 1, rgba)
            self.rect(x + t, y + h - 1 - t, w - 2 * t, 1, rgba)
            self.rect(x + t, y + t, 1, h - 2 * t, rgba)
            self.rect(x + w - 1 - t, y + t, 1, h - 2 * t, rgba)

    def line(self, x0, y0, x1, y1, rgba):
        x0, y0, x1, y1 = int(x0), int(y0), int(x1), int(y1)
        dx = abs(x1 - x0)
        dy = abs(y1 - y0)
        sx = 1 if x1 >= x0 else -1
        sy = 1 if y1 >= y0 else -1
        x, y = x0, y0
        if dx >= dy:
            err = dx // 2
            for _ in range(dx + 1):
                self.set(x, y, rgba)
                err -= dy
                if err < 0:
                    y += sy
                    err += dx
                x += sx
        else:
            err = dy // 2
            for _ in range(dy + 1):
                self.set(x, y, rgba)
                err -= dx
                if err < 0:
                    x += sx
                    err += dy
                y += sy

    def circle_fill(self, cx, cy, r, rgba):
        for y in range(cy - r, cy + r + 1):
            for x in range(cx - r, cx + r + 1):
                if (x - cx) ** 2 + (y - cy) ** 2 <= r * r:
                    self.set(x, y, rgba)

    def save(self, path):
        save_png(path, self.w, self.h, self.px)


def lerp(a, b, t):
    return a + (b - a) * t


def lerp_color(c0, c1, t):
    return tuple(int(round(lerp(c0[i], c1[i], t))) for i in range(4))


def rng(seed):
    r = random.Random(seed)
    return r
