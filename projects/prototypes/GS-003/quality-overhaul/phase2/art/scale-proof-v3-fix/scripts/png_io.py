#!/usr/bin/env python3
"""Pure-stdlib PNG read/write for 8-bit RGBA non-interlaced images.
Same approach as scale-proof/scripts/nearest_upscale.py and
scale-proof-v3/scripts/compose_board.py (no PIL/ImageMagick in this env).
Zero PixelLab calls, zero cost.
"""
import struct
import zlib


def read_png(path):
    with open(path, "rb") as f:
        data = f.read()
    assert data[:8] == b"\x89PNG\r\n\x1a\n", "not a PNG"
    pos = 8
    width = height = None
    idat = b""
    while pos < len(data):
        length = struct.unpack(">I", data[pos:pos + 4])[0]
        ctype = data[pos + 4:pos + 8].decode("ascii")
        chunk = data[pos + 8:pos + 8 + length]
        if ctype == "IHDR":
            width, height, bitdepth, colortype, comp, filt, interlace = struct.unpack(
                ">IIBBBBB", chunk
            )
            assert bitdepth == 8 and colortype == 6 and interlace == 0, (
                f"only 8-bit RGBA non-interlaced supported, got bitdepth={bitdepth} colortype={colortype}"
            )
        elif ctype == "IDAT":
            idat += chunk
        pos += 8 + length + 4
    raw = zlib.decompress(idat)
    bpp = 4
    stride = width * bpp
    rows = []
    prev = bytearray(stride)
    off = 0
    for y in range(height):
        ftype = raw[off]
        off += 1
        line = bytearray(raw[off:off + stride])
        off += stride
        if ftype == 0:
            pass
        elif ftype == 1:
            for i in range(stride):
                a = line[i - bpp] if i >= bpp else 0
                line[i] = (line[i] + a) & 0xFF
        elif ftype == 2:
            for i in range(stride):
                line[i] = (line[i] + prev[i]) & 0xFF
        elif ftype == 3:
            for i in range(stride):
                a = line[i - bpp] if i >= bpp else 0
                b = prev[i]
                line[i] = (line[i] + (a + b) // 2) & 0xFF
        elif ftype == 4:
            for i in range(stride):
                a = line[i - bpp] if i >= bpp else 0
                b = prev[i]
                c = prev[i - bpp] if i >= bpp else 0
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                pr = a if pa <= pb and pa <= pc else (b if pb <= pc else c)
                line[i] = (line[i] + pr) & 0xFF
        else:
            raise ValueError(f"unknown filter type {ftype}")
        rows.append(line)
        prev = line
    return width, height, rows


def write_png(path, width, height, rows):
    def chunk(ctype, data):
        c = ctype.encode("ascii") + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c))

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    raw = bytearray()
    for row in rows:
        raw.append(0)
        raw.extend(row)
    idat = zlib.compress(bytes(raw), 9)
    with open(path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(chunk("IHDR", ihdr))
        f.write(chunk("IDAT", idat))
        f.write(chunk("IEND", b""))


def get_pixel(rows, x, y):
    i = x * 4
    row = rows[y]
    return (row[i], row[i + 1], row[i + 2], row[i + 3])


def set_pixel(rows, x, y, rgba):
    i = x * 4
    row = rows[y]
    row[i], row[i + 1], row[i + 2], row[i + 3] = rgba


def new_canvas(width, height):
    return [bytearray(width * 4) for _ in range(height)]


def bbox_alpha(width, height, rows, threshold=0):
    """Tight bounding box of pixels with alpha > threshold. Returns None if empty."""
    xmin, ymin, xmax, ymax = width, height, -1, -1
    count = 0
    for y in range(height):
        row = rows[y]
        for x in range(width):
            a = row[x * 4 + 3]
            if a > threshold:
                count += 1
                if x < xmin:
                    xmin = x
                if x > xmax:
                    xmax = x
                if y < ymin:
                    ymin = y
                if y > ymax:
                    ymax = y
    if xmax < 0:
        return None
    return {
        "xmin": xmin, "ymin": ymin, "xmax": xmax, "ymax": ymax,
        "width": xmax - xmin + 1, "height": ymax - ymin + 1,
        "pixels": count,
    }


def color_counts(width, height, rows, alpha_threshold=0):
    """Returns dict[(r,g,b,a)] -> count for pixels with alpha > alpha_threshold."""
    counts = {}
    for y in range(height):
        row = rows[y]
        for x in range(width):
            i = x * 4
            a = row[i + 3]
            if a > alpha_threshold:
                key = (row[i], row[i + 1], row[i + 2], a)
                counts[key] = counts.get(key, 0) + 1
    return counts
