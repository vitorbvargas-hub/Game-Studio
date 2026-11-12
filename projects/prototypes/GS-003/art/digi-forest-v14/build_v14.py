#!/usr/bin/env python3
"""Pure stdlib PNG pipeline for GS-003 Digi Forest v14: stitch quadrants, apply the
founder-approved cartoon filter (saturation +40%, contrast +15%, brightness/shadow
unchanged), build a night pass, and compose a day/night x filtered comparison plank.
No PIL available in this sandbox (reused approach from round2/round3)."""
import struct, zlib, os, colorsys

def read_png(path):
    with open(path, 'rb') as f:
        data = f.read()
    assert data[:8] == b'\x89PNG\r\n\x1a\n'
    pos = 8
    width = height = bitdepth = colortype = None
    idat = b''
    palette = None
    trns = None
    while pos < len(data):
        length = struct.unpack('>I', data[pos:pos+4])[0]
        ctype = data[pos+4:pos+8]
        cdata = data[pos+8:pos+8+length]
        pos += 8 + length + 4
        if ctype == b'IHDR':
            width, height, bitdepth, colortype = struct.unpack('>IIBB', cdata[:10])
        elif ctype == b'IDAT':
            idat += cdata
        elif ctype == b'PLTE':
            palette = cdata
        elif ctype == b'tRNS':
            trns = cdata
        elif ctype == b'IEND':
            break
    raw = zlib.decompress(idat)
    if colortype == 6:
        channels = 4
    elif colortype == 2:
        channels = 3
    elif colortype == 3:
        channels = 1
    else:
        raise ValueError(f'unsupported colortype {colortype}')
    assert bitdepth == 8
    stride = width * channels
    out = bytearray(width * height * 4)
    prev = bytearray(stride)
    p = 0
    for y in range(height):
        ftype = raw[p]; p += 1
        line = bytearray(raw[p:p+stride]); p += stride
        for x in range(stride):
            a = line[x-channels] if x >= channels else 0
            b = prev[x]
            c = prev[x-channels] if x >= channels else 0
            if ftype == 0:
                val = line[x]
            elif ftype == 1:
                val = (line[x] + a) & 0xFF
            elif ftype == 2:
                val = (line[x] + b) & 0xFF
            elif ftype == 3:
                val = (line[x] + ((a + b) // 2)) & 0xFF
            elif ftype == 4:
                pa = abs(b - c); pb = abs(a - c); pc = abs(a + b - 2*c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                val = (line[x] + pr) & 0xFF
            else:
                raise ValueError('bad filter')
            line[x] = val
        prev = line
        row_off = y * width * 4
        if channels == 4:
            out[row_off:row_off+stride] = line
        elif channels == 3:
            for x in range(width):
                out[row_off+x*4:row_off+x*4+3] = line[x*3:x*3+3]
                out[row_off+x*4+3] = 255
        elif channels == 1:
            for x in range(width):
                idx = line[x]
                r, g, b = palette[idx*3:idx*3+3]
                a = trns[idx] if trns and idx < len(trns) else 255
                out[row_off+x*4:row_off+x*4+4] = bytes([r, g, b, a])
    return width, height, bytes(out)

def write_png(path, width, height, rgba):
    raw = bytearray()
    stride = width * 4
    for y in range(height):
        raw.append(0)
        raw.extend(rgba[y*stride:(y+1)*stride])
    compressed = zlib.compress(bytes(raw), 9)
    def chunk(ctype, data):
        c = ctype + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xFFFFFFFF)
    out = b'\x89PNG\r\n\x1a\n'
    out += chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0))
    out += chunk(b'IDAT', compressed)
    out += chunk(b'IEND', b'')
    with open(path, 'wb') as f:
        f.write(out)

def stitch_2x2(tl, tr, bl, br):
    (tlw, tlh, tld) = tl
    (trw, trh, trd) = tr
    (blw, blh, bld) = bl
    (brw, brh, brd) = br
    assert tlw == blw and trw == brw and tlh == trh and blh == brh
    W = tlw + trw
    H = tlh + blh
    out = bytearray(W*H*4)
    for (ox, oy, w, h, d) in [(0,0,tlw,tlh,tld), (tlw,0,trw,trh,trd), (0,tlh,blw,blh,bld), (tlw,tlh,brw,brh,brd)]:
        for y in range(h):
            srow = y*w*4
            drow = ((oy+y)*W + ox) * 4
            out[drow:drow+w*4] = d[srow:srow+w*4]
    return W, H, bytes(out)

def upscale2x(width, height, rgba):
    nw, nh = width*2, height*2
    out = bytearray(nw*nh*4)
    for y in range(height):
        srow = y*width*4
        for x in range(width):
            px = rgba[srow+x*4:srow+x*4+4]
            for dy in (0,1):
                drow = ((y*2+dy)*nw + x*2) * 4
                out[drow:drow+4] = px
                out[drow+4:drow+8] = px
    return nw, nh, bytes(out)

def cartoon_filter(width, height, rgba, sat_boost=0.40, contrast_boost=0.15):
    """Founder-approved filter: saturation +40%, contrast +15%, brightness/shadows unchanged."""
    out = bytearray(len(rgba))
    for i in range(0, len(rgba), 4):
        r, g, b, a = rgba[i], rgba[i+1], rgba[i+2], rgba[i+3]
        if a == 0:
            out[i:i+4] = bytes([r, g, b, a])
            continue
        h, l, s = colorsys.rgb_to_hls(r/255.0, g/255.0, b/255.0)
        s = min(1.0, s * (1.0 + sat_boost))
        nr, ng, nb = colorsys.hls_to_rgb(h, l, s)
        nr, ng, nb = nr*255.0, ng*255.0, nb*255.0
        # contrast around mid-grey 128, brightness (mean luminance) preserved by pivoting at 128
        nr = (nr - 128.0) * (1.0 + contrast_boost) + 128.0
        ng = (ng - 128.0) * (1.0 + contrast_boost) + 128.0
        nb = (nb - 128.0) * (1.0 + contrast_boost) + 128.0
        out[i]   = max(0, min(255, round(nr)))
        out[i+1] = max(0, min(255, round(ng)))
        out[i+2] = max(0, min(255, round(nb)))
        out[i+3] = a
    return width, height, bytes(out)

LIGHTS_WARM = [(np_x+16, np_y+24, 70, True) for (np_x, np_y) in [
    (388, 144), (516, 144), (164, 848), (352, 864),  # totem lanterns, sw lantern, sw campfire
]]
LIGHTS_COOL = [(np_x+16, np_y+24, 65, False) for (np_x, np_y) in [
    (1412, 160), (1380, 288), (1400, 240), (1424, 880),  # crystal cyan/amber, fountain, portal
]]

def make_night(width, height, rgba):
    out = bytearray(len(rgba))
    for y in range(height):
        for x in range(width):
            i = (y*width+x)*4
            r,g,b,a = rgba[i], rgba[i+1], rgba[i+2], rgba[i+3]
            if a == 0:
                out[i:i+4] = bytes([r,g,b,a])
                continue
            nr = int(r*0.28 + 10)
            ng = int(g*0.30 + 14)
            nb = int(b*0.42 + 34)
            out[i] = min(255,nr); out[i+1] = min(255,ng); out[i+2] = min(255,nb); out[i+3] = a
    for (cx,cy,rad,warm) in LIGHTS_WARM + LIGHTS_COOL:
        x0 = max(0, cx-rad); x1 = min(width, cx+rad)
        y0 = max(0, cy-rad); y1 = min(height, cy+rad)
        for y in range(y0, y1):
            for x in range(x0, x1):
                dx = x-cx; dy = y-cy
                d2 = dx*dx+dy*dy
                if d2 > rad*rad:
                    continue
                t = 1.0 - (d2 ** 0.5) / rad
                t = t*t
                i = (y*width+x)*4
                if out[i+3] == 0:
                    continue
                if warm:
                    addr, addg, addb = 150*t, 95*t, 25*t
                else:
                    addr, addg, addb = 20*t, 90*t, 150*t
                out[i]   = min(255, int(out[i]   + addr))
                out[i+1] = min(255, int(out[i+1] + addg))
                out[i+2] = min(255, int(out[i+2] + addb))
    return width, height, bytes(out)

def compose_grid(images, cell_w, cell_h, cols, labels=None):
    rows = (len(images)+cols-1)//cols
    gap = 6
    W = cols*cell_w + (cols+1)*gap
    H = rows*cell_h + (rows+1)*gap
    out = bytearray(W*H*4)
    for i in range(W*H):
        out[i*4:i*4+4] = bytes([30,30,34,255])
    border_colors = [(80,200,120),(255,210,60),(90,170,255)]
    for idx,(w,h,rgba) in enumerate(images):
        col = idx % cols; row = idx // cols
        ox = gap + col*(cell_w+gap)
        oy = gap + row*(cell_h+gap)
        bc = border_colors[idx % len(border_colors)]
        for yy in range(cell_h):
            for xx in range(cell_w):
                sx = min(w-1, int(xx * w / cell_w))
                sy = min(h-1, int(yy * h / cell_h))
                si = (sy*w+sx)*4
                r,g,b,a = rgba[si], rgba[si+1], rgba[si+2], rgba[si+3]
                if a < 255:
                    r = r*a//255 + 20*(255-a)//255
                    g = g*a//255 + 20*(255-a)//255
                    b = b*a//255 + 20*(255-a)//255
                di = ((oy+yy)*W + (ox+xx))*4
                border = (xx < 3 or yy < 3 or xx >= cell_w-3 or yy >= cell_h-3)
                if border:
                    out[di:di+4] = bytes([bc[0],bc[1],bc[2],255])
                else:
                    out[di:di+4] = bytes([r,g,b,255])
    return W, H, bytes(out)

if __name__ == '__main__':
    base = os.path.dirname(os.path.abspath(__file__))
    screens = os.path.join(base, 'screens')
    os.makedirs(screens, exist_ok=True)

    tl = read_png('/tmp/q_tl.png')
    tr = read_png('/tmp/q_tr.png')
    bl = read_png('/tmp/q_bl.png')
    br = read_png('/tmp/q_br.png')
    w, h, day = stitch_2x2(tl, tr, bl, br)
    print('day stitched', w, h)
    write_png(os.path.join(screens, 'day_full.png'), w, h, day)

    w2, h2, day_cartoon = cartoon_filter(w, h, day)
    write_png(os.path.join(screens, 'day_full_cartoon.png'), w2, h2, day_cartoon)
    print('day cartoon done')

    nw, nh, night = make_night(w, h, day)
    write_png(os.path.join(screens, 'night_full.png'), nw, nh, night)
    nw2, nh2, night_cartoon = cartoon_filter(nw, nh, night)
    write_png(os.path.join(screens, 'night_full_cartoon.png'), nw2, nh2, night_cartoon)
    print('night + night cartoon done')

    # comparison plank: round3 day, v14 day (no filter), v14 day (cartoon)
    r3_path = os.path.join(base, '..', 'digi-forest-v13', 'round3', 'screens', 'day_full.png')
    r3 = read_png(r3_path)
    cell_w, cell_h = 384, 304
    imgs = [r3, (w, h, day), (w2, h2, day_cartoon)]
    pw, ph, plank = compose_grid(imgs, cell_w, cell_h, 3)
    write_png(os.path.join(base, 'comparison_plank.png'), pw, ph, plank)
    print('plank done', pw, ph)
