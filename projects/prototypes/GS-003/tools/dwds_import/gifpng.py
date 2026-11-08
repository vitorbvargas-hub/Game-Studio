"""Minimal pure-python GIF decoder + PNG encoder (no PIL on this host)."""
import struct, zlib


def _lzw(data, min_code):
    clear = 1 << min_code
    eoi = clear + 1
    size = min_code + 1
    dict_ = [[i] for i in range(clear)] + [None, None]
    out = []
    prev = None
    bitbuf = 0
    nbits = 0
    pos = 0
    while True:
        while nbits < size:
            if pos >= len(data):
                return out
            bitbuf |= data[pos] << nbits
            nbits += 8
            pos += 1
        code = bitbuf & ((1 << size) - 1)
        bitbuf >>= size
        nbits -= size
        if code == clear:
            size = min_code + 1
            dict_ = [[i] for i in range(clear)] + [None, None]
            prev = None
            continue
        if code == eoi:
            return out
        if code < len(dict_) and dict_[code] is not None:
            entry = dict_[code]
            if prev is not None:
                dict_.append(prev + [entry[0]])
        else:
            entry = prev + [prev[0]]
            dict_.append(entry)
        out.extend(entry)
        prev = entry
        if len(dict_) == (1 << size) and size < 12:
            size += 1


def decode_gif(b):
    """Return (W, H, frames) where frames = list of (rgba_rows, delay_ms). Composited."""
    assert b[:6] in (b"GIF87a", b"GIF89a")
    W, H, flags, bg, _ = struct.unpack("<HHBBB", b[6:13])
    p = 13
    gct = None
    if flags & 0x80:
        n = 2 << (flags & 7)
        gct = [tuple(b[p + 3 * i:p + 3 * i + 3]) for i in range(n)]
        p += 3 * n
    canvas = [[(0, 0, 0, 0)] * W for _ in range(H)]
    frames = []
    gce = {"delay": 100, "trans": None, "disposal": 0}
    while p < len(b):
        t = b[p]
        p += 1
        if t == 0x3B:
            break
        if t == 0x21:
            label = b[p]
            p += 1
            blocks = []
            while b[p]:
                blocks.append(b[p + 1:p + 1 + b[p]])
                p += 1 + b[p]
            p += 1
            if label == 0xF9 and blocks:
                bl = blocks[0]
                pf = bl[0]
                gce = {"delay": struct.unpack("<H", bl[1:3])[0] * 10,
                       "trans": bl[3] if pf & 1 else None,
                       "disposal": (pf >> 2) & 7}
            continue
        if t == 0x2C:
            x, y, w, h, f = struct.unpack("<HHHHB", b[p:p + 9])
            p += 9
            ct = gct
            if f & 0x80:
                n = 2 << (f & 7)
                ct = [tuple(b[p + 3 * i:p + 3 * i + 3]) for i in range(n)]
                p += 3 * n
            interlaced = bool(f & 0x40)
            mc = b[p]
            p += 1
            data = bytearray()
            while b[p]:
                data += b[p + 1:p + 1 + b[p]]
                p += 1 + b[p]
            p += 1
            idx = _lzw(bytes(data), mc)
            rows = list(range(h))
            if interlaced:
                rows = list(range(0, h, 8)) + list(range(4, h, 8)) + list(range(2, h, 4)) + list(range(1, h, 2))
            before = [r[:] for r in canvas]
            for ri, ry in enumerate(rows):
                for cx in range(w):
                    k = ri * w + cx
                    if k >= len(idx):
                        break
                    c = idx[k]
                    if c == gce["trans"]:
                        continue
                    if 0 <= y + ry < H and 0 <= x + cx < W:
                        r, g, bb = ct[c]
                        canvas[y + ry][x + cx] = (r, g, bb, 255)
            frames.append(([r[:] for r in canvas], gce["delay"]))
            if gce["disposal"] == 2:
                for ry in range(h):
                    for cx in range(w):
                        if 0 <= y + ry < H and 0 <= x + cx < W:
                            canvas[y + ry][x + cx] = (0, 0, 0, 0)
            elif gce["disposal"] == 3:
                canvas = before
            gce = {"delay": 100, "trans": None, "disposal": 0}
            continue
        raise ValueError("bad block %x at %d" % (t, p))
    return W, H, frames


def write_png(path, rows):
    H = len(rows)
    W = len(rows[0])
    raw = bytearray()
    for r in rows:
        raw.append(0)
        for px in r:
            raw += bytes(px)

    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", W, H, 8, 6, 0, 0, 0))
    png += chunk(b"IDAT", zlib.compress(bytes(raw), 9)) + chunk(b"IEND", b"")
    open(path, "wb").write(png)


def blank(w, h, c=(0, 0, 0, 0)):
    return [[c] * w for _ in range(h)]


def blit(dst, src, ox, oy, scale=1):
    for y, r in enumerate(src):
        for x, px in enumerate(r):
            if px[3] == 0:
                continue
            for sy in range(scale):
                for sx in range(scale):
                    yy, xx = oy + y * scale + sy, ox + x * scale + sx
                    if 0 <= yy < len(dst) and 0 <= xx < len(dst[0]):
                        dst[yy][xx] = px
