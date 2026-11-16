"""Leitor mínimo de PNG indexado/RGB/RGBA (1/2/4/8 bits, sem entrelaçamento), puro Python."""
import zlib, struct
def load_any(p):
    d = open(p, 'rb').read(); assert d[:8] == b'\x89PNG\r\n\x1a\n'
    i = 8; idat = b''; plte = []; trns = b''
    while i < len(d):
        n = struct.unpack('>I', d[i:i+4])[0]; t = d[i+4:i+8]; c = d[i+8:i+8+n]; i += 12+n
        if t == b'IHDR': w, h, bd, ct, _, _, il = struct.unpack('>IIBBBBB', c)
        elif t == b'PLTE': plte = [tuple(c[j:j+3]) for j in range(0, len(c), 3)]
        elif t == b'tRNS': trns = c
        elif t == b'IDAT': idat += c
    assert il == 0
    ch = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[ct]
    bpp = max(1, ch*bd//8); stride = (w*ch*bd+7)//8
    raw = zlib.decompress(idat); prev = bytearray(stride); rows = []; o = 0
    for y in range(h):
        f = raw[o]; line = bytearray(raw[o+1:o+1+stride]); o += 1+stride
        for x in range(stride):
            a = line[x-bpp] if x >= bpp else 0; b = prev[x]; cc = prev[x-bpp] if x >= bpp else 0
            if f == 1: line[x] = (line[x]+a) & 255
            elif f == 2: line[x] = (line[x]+b) & 255
            elif f == 3: line[x] = (line[x]+(a+b)//2) & 255
            elif f == 4:
                pp = a+b-cc; pa, pb, pc = abs(pp-a), abs(pp-b), abs(pp-cc)
                line[x] = (line[x]+(a if pa <= pb and pa <= pc else b if pb <= pc else cc)) & 255
        rows.append(line); prev = line
    px = []
    for line in rows:
        r = []
        if ct == 3 or (ct == 0 and bd < 8):
            per = 8//bd
            for x in range(w):
                v = (line[x//per] >> (8-bd*(x % per+1))) & ((1 << bd)-1)
                if ct == 3:
                    al = trns[v] if v < len(trns) else 255
                    r.append(plte[v]+(al,))
                else:
                    g = v*255//((1 << bd)-1); r.append((g, g, g, 255))
        else:
            for x in range(w):
                s = line[x*ch:(x+1)*ch]
                if ct == 2: r.append(tuple(s)+(255,))
                elif ct == 6: r.append(tuple(s))
                elif ct == 0: r.append((s[0], s[0], s[0], 255))
                elif ct == 4: r.append((s[0], s[0], s[0], s[1]))
        px.append(r)
    return w, h, px
