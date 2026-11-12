"""Pure-Python PNG decoder (stdlib zlib only, no PIL).

Supports the subset of PNG needed for the sprite-rip PNGs used in GS-003:
bit depth 8, color types 0 (gray), 2 (RGB), 3 (indexed/palette), 4 (gray+alpha),
6 (RGBA). Both non-interlaced and Adam7-interlaced PNGs are supported.
"""
import struct
import zlib


def paeth(a, b, c):
    p = a + b - c
    pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
    if pa <= pb and pa <= pc:
        return a
    if pb <= pc:
        return b
    return c


def unfilter_subimage(raw, offset, sub_w, sub_h, bpp, pixels, sx, sy, stepx, stepy, path):
    """Decode one Adam7 pass (or the whole image, for stepx=stepy=1,
    sx=sy=0) starting at byte `offset` in the decompressed IDAT stream.
    Writes raw per-pixel byte-tuples into `pixels[sy + row*stepy][sx + col*stepx]`.
    Returns the new offset."""
    stride = sub_w * bpp
    prev = bytearray(stride)
    for row in range(sub_h):
        filt = raw[offset]
        offset += 1
        line = bytearray(raw[offset:offset + stride])
        offset += stride
        if filt == 0:
            pass
        elif filt == 1:  # Sub
            for i in range(bpp, stride):
                line[i] = (line[i] + line[i - bpp]) & 0xFF
        elif filt == 2:  # Up
            for i in range(stride):
                line[i] = (line[i] + prev[i]) & 0xFF
        elif filt == 3:  # Average
            for i in range(stride):
                a = line[i - bpp] if i >= bpp else 0
                b = prev[i]
                line[i] = (line[i] + (a + b) // 2) & 0xFF
        elif filt == 4:  # Paeth
            for i in range(stride):
                a = line[i - bpp] if i >= bpp else 0
                b = prev[i]
                c = prev[i - bpp] if i >= bpp else 0
                line[i] = (line[i] + paeth(a, b, c)) & 0xFF
        else:
            raise ValueError(f"{path}: unknown filter {filt}")
        y = sy + row * stepy
        out_row = pixels[y]
        for col in range(sub_w):
            x = sx + col * stepx
            i = col * bpp
            out_row[x] = bytes(line[i:i + bpp])
        prev = line
    return offset


def read_png(path):
    with open(path, "rb") as f:
        data = f.read()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"{path}: not a PNG")
    pos = 8
    width = height = bit_depth = color_type = interlace = None
    palette = None
    trns = None
    idat = bytearray()
    while pos < len(data):
        length = struct.unpack(">I", data[pos:pos + 4])[0]
        ctype = data[pos + 4:pos + 8]
        cdata = data[pos + 8:pos + 8 + length]
        pos += 12 + length
        if ctype == b"IHDR":
            width, height, bit_depth, color_type, _comp, _filt, interlace = struct.unpack(
                ">IIBBBBB", cdata
            )
        elif ctype == b"PLTE":
            palette = [tuple(cdata[i:i + 3]) for i in range(0, len(cdata), 3)]
        elif ctype == b"tRNS":
            trns = cdata
        elif ctype == b"IDAT":
            idat += cdata
        elif ctype == b"IEND":
            break
    if bit_depth != 8:
        raise NotImplementedError(f"{path}: bit depth {bit_depth} not supported")

    channels_by_type = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}
    bpp = channels_by_type[color_type]
    raw = zlib.decompress(bytes(idat))

    raw_pixels = [[None] * width for _ in range(height)]

    if not interlace:
        unfilter_subimage(raw, 0, width, height, bpp, raw_pixels, 0, 0, 1, 1, path)
    else:
        # Adam7: 7 passes, each a sub-grid over the full image.
        passes = [
            (0, 0, 8, 8), (4, 0, 8, 8), (0, 4, 4, 8), (2, 0, 4, 4),
            (0, 2, 2, 4), (1, 0, 2, 2), (0, 1, 1, 2),
        ]
        offset = 0
        for sx, sy, stepx, stepy in passes:
            sub_w = max(0, (width - sx + stepx - 1) // stepx)
            sub_h = max(0, (height - sy + stepy - 1) // stepy)
            if sub_w == 0 or sub_h == 0:
                continue
            offset = unfilter_subimage(raw, offset, sub_w, sub_h, bpp, raw_pixels, sx, sy, stepx, stepy, path)

    pixels = [[None] * width for _ in range(height)]
    for y in range(height):
        in_row = raw_pixels[y]
        out_row = pixels[y]
        if color_type == 2:  # RGB
            for x in range(width):
                b = in_row[x]
                out_row[x] = (b[0], b[1], b[2], 255)
        elif color_type == 6:  # RGBA
            for x in range(width):
                b = in_row[x]
                out_row[x] = (b[0], b[1], b[2], b[3])
        elif color_type == 0:  # gray
            for x in range(width):
                g = in_row[x][0]
                out_row[x] = (g, g, g, 255)
        elif color_type == 4:  # gray+alpha
            for x in range(width):
                b = in_row[x]
                out_row[x] = (b[0], b[0], b[0], b[1])
        elif color_type == 3:  # indexed
            for x in range(width):
                idx = in_row[x][0]
                r, g, b = palette[idx]
                a = trns[idx] if (trns and idx < len(trns)) else 255
                out_row[x] = (r, g, b, a)
        else:
            raise NotImplementedError(f"{path}: color type {color_type} not supported")
    return width, height, pixels
