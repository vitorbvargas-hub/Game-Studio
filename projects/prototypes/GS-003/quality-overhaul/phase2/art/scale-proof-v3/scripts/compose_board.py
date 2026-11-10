#!/usr/bin/env python3
"""Pure-stdlib proportion board compositor (no PIL/ImageMagick in this env).
Reuses the PNG read/write routines from scale-proof/scripts/nearest_upscale.py.
Places a row of sprites at a common nearest-neighbor scale, bottom-aligned
(feet on the same row), with a fixed gap between cells. No AI, no cost.
"""
import struct
import sys
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


def nearest_scale(w, h, rows, factor):
    bpp = 4
    new_w, new_h = w * factor, h * factor
    new_rows = []
    for y in range(new_h):
        sy = y // factor
        src_row = rows[sy]
        new_row = bytearray(new_w * bpp)
        for x in range(w):
            px = src_row[x * bpp:x * bpp + bpp]
            base = x * factor * bpp
            for k in range(factor):
                new_row[base + k * bpp:base + k * bpp + bpp] = px
        new_rows.append(new_row)
    return new_w, new_h, new_rows


def blend_paste(canvas_rows, canvas_w, img_w, img_h, img_rows, dst_x, dst_y):
    bpp = 4
    for y in range(img_h):
        cy = dst_y + y
        if cy < 0 or cy >= len(canvas_rows):
            continue
        crow = canvas_rows[cy]
        srow = img_rows[y]
        for x in range(img_w):
            cx = dst_x + x
            if cx < 0 or cx >= canvas_w:
                continue
            sa = srow[x * bpp + 3]
            if sa == 0:
                continue
            si = x * bpp
            ci = cx * bpp
            if sa == 255:
                crow[ci:ci + 4] = srow[si:si + 4]
            else:
                da = crow[ci + 3]
                out_a = sa + da * (255 - sa) // 255
                if out_a == 0:
                    continue
                for k in range(3):
                    sc = srow[si + k]
                    dc = crow[ci + k]
                    out_c = (sc * sa + dc * da * (255 - sa) // 255) // out_a
                    crow[ci + k] = min(255, max(0, out_c))
                crow[ci + 3] = out_a


def compose_row(cells, out_path, gap=14, pad=10):
    """cells: list of (path, factor). Bottom-aligned on a shared baseline."""
    loaded = []
    for path, factor in cells:
        w, h, rows = read_png(path)
        nw, nh, nrows = nearest_scale(w, h, rows, factor)
        loaded.append((nw, nh, nrows))

    max_h = max(h for _, h, _ in loaded)
    total_w = sum(w for w, _, _ in loaded) + gap * (len(loaded) - 1)
    canvas_w = total_w + pad * 2
    canvas_h = max_h + pad * 2
    bpp = 4
    canvas_rows = [bytearray(canvas_w * bpp) for _ in range(canvas_h)]

    x = pad
    for w, h, rows in loaded:
        y = pad + (max_h - h)
        blend_paste(canvas_rows, canvas_w, w, h, rows, x, y)
        x += w + gap

    write_png(out_path, canvas_w, canvas_h, canvas_rows)
    return canvas_w, canvas_h


if __name__ == "__main__":
    import os

    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    cells = [
        (os.path.join(base, "board/ref/tile_32px.png"), 3),
        (os.path.join(base, "board/ref/tamer_idle_32px.png"), 3),
        (os.path.join(base, "board/ref/guilmon_rip_idle_30x34.png"), 3),
        (os.path.join(base, "board/ref/guilmon_v2_m2_south_60x68.png"), 3),
        (os.path.join(base, "pipeline-m1/rotations/south.png"), 3),
    ]
    out = os.path.join(base, "board/proportion_board_v3.png")
    w, h = compose_row(cells, out, gap=14, pad=10)
    print(f"wrote {out}: {w}x{h}")
