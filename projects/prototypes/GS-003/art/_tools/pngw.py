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


def _paeth(a, b, c):
    p = a + b - c
    pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
    if pa <= pb and pa <= pc:
        return a
    if pb <= pc:
        return b
    return c


def load_png(path):
    """Minimal reader for 8-bit RGBA, non-interlaced PNGs (what save_png and
    this project's JS canvas.js both produce). Returns (width, height,
    pixels) with pixels[y][x] = (r, g, b, a). Raises NotImplementedError for
    any other bit depth/color type/interlacing."""
    with open(path, "rb") as f:
        data = f.read()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError("not a PNG file: %s" % path)
    pos = 8
    idat = bytearray()
    width = height = bitdepth = colortype = None
    while pos < len(data):
        length = struct.unpack(">I", data[pos:pos + 4])[0]
        tag = data[pos + 4:pos + 8]
        chunk = data[pos + 8:pos + 8 + length]
        if tag == b"IHDR":
            width, height, bitdepth, colortype, comp, filt, inter = struct.unpack(">IIBBBBB", chunk)
            if bitdepth != 8 or colortype != 6 or inter != 0:
                raise NotImplementedError(
                    "load_png only supports 8-bit RGBA non-interlaced PNGs (got bitdepth=%d colortype=%d interlace=%d)"
                    % (bitdepth, colortype, inter)
                )
        elif tag == b"IDAT":
            idat += chunk
        elif tag == b"IEND":
            break
        pos += 8 + length + 4
    raw = zlib.decompress(bytes(idat))
    bpp = 4
    stride = width * bpp
    pixels = [[None] * width for _ in range(height)]
    prev = bytearray(stride)
    off = 0
    for y in range(height):
        ftype = raw[off]
        off += 1
        line = raw[off:off + stride]
        off += stride
        out = bytearray(stride)
        for i in range(stride):
            a = out[i - bpp] if i >= bpp else 0
            b = prev[i]
            c = prev[i - bpp] if i >= bpp else 0
            if ftype == 0:
                val = line[i]
            elif ftype == 1:
                val = (line[i] + a) & 0xFF
            elif ftype == 2:
                val = (line[i] + b) & 0xFF
            elif ftype == 3:
                val = (line[i] + ((a + b) >> 1)) & 0xFF
            elif ftype == 4:
                val = (line[i] + _paeth(a, b, c)) & 0xFF
            else:
                raise NotImplementedError("unsupported PNG filter type %d" % ftype)
            out[i] = val
        for x in range(width):
            o = x * 4
            pixels[y][x] = (out[o], out[o + 1], out[o + 2], out[o + 3])
        prev = out
    return width, height, pixels


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
