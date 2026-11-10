#!/usr/bin/env python3
"""Pure-stdlib nearest-neighbor PNG upscaler (no PIL/ImageMagick available in this env).
Reads an 8-bit RGBA PNG, duplicates each pixel into an NxN block, writes a new PNG.
Used once to build the scale-proof reference image for PixelLab create_character(v3).
"""
import struct
import sys
import zlib


def read_png(path):
    with open(path, "rb") as f:
        data = f.read()
    assert data[:8] == b"\x89PNG\r\n\x1a\n", "not a PNG"
    pos = 8
    width = height = bitdepth = colortype = None
    idat = b""
    while pos < len(data):
        length = struct.unpack(">I", data[pos : pos + 4])[0]
        ctype = data[pos + 4 : pos + 8].decode("ascii")
        chunk = data[pos + 8 : pos + 8 + length]
        if ctype == "IHDR":
            width, height, bitdepth, colortype, comp, filt, interlace = struct.unpack(
                ">IIBBBBB", chunk
            )
            assert bitdepth == 8 and colortype == 6 and interlace == 0, (
                f"only 8-bit RGBA non-interlaced supported, got bitdepth={bitdepth} colortype={colortype} interlace={interlace}"
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
        line = bytearray(raw[off : off + stride])
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


def upscale(src, dst, factor):
    w, h, rows = read_png(src)
    bpp = 4
    new_w, new_h = w * factor, h * factor
    new_rows = []
    for y in range(new_h):
        sy = y // factor
        src_row = rows[sy]
        new_row = bytearray(new_w * bpp)
        for x in range(w):
            px = src_row[x * bpp : x * bpp + bpp]
            base = x * factor * bpp
            for k in range(factor):
                new_row[base + k * bpp : base + k * bpp + bpp] = px
        new_rows.append(new_row)
    write_png(dst, new_w, new_h, new_rows)
    return new_w, new_h


if __name__ == "__main__":
    src, dst, factor = sys.argv[1], sys.argv[2], int(sys.argv[3])
    nw, nh = upscale(src, dst, factor)
    print(f"{src} -> {dst}: {factor}x nearest, new size {nw}x{nh}")
