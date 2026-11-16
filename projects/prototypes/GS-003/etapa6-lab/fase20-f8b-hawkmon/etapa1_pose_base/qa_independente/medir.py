"""QA independente C14 E1 Hawkmon: decodificador PNG próprio (sem PIL), medições e ampliações.
Uso: python3 -I medir.py <pasta_etapa1> <pasta_saida>  (só lê a pasta da etapa; escreve só na saída)."""
import sys, zlib, struct, json, os

def load_png(p):
    d = open(p, 'rb').read(); assert d[:8] == b'\x89PNG\r\n\x1a\n'
    i = 8; idat = b''; plte = None; trns = None
    while i < len(d):
        n = struct.unpack('>I', d[i:i+4])[0]; t = d[i+4:i+8]; c = d[i+8:i+8+n]; i += 12 + n
        if t == b'IHDR': w, h, bd, ct, _, _, il = struct.unpack('>IIBBBBB', c)
        elif t == b'PLTE': plte = [tuple(c[k:k+3]) for k in range(0, len(c), 3)]
        elif t == b'tRNS': trns = c
        elif t == b'IDAT': idat += c
    assert bd == 8 and il == 0, (p, bd, il)
    ch = {6: 4, 2: 3, 3: 1, 0: 1, 4: 2}[ct]
    raw = zlib.decompress(idat); st = w * ch; rows = []; prev = bytearray(st); k = 0
    for y in range(h):
        f = raw[k]; k += 1; line = bytearray(raw[k:k+st]); k += st
        for x in range(st):
            a = line[x-ch] if x >= ch else 0; b = prev[x]; cc = prev[x-ch] if x >= ch else 0
            if f == 1: line[x] = (line[x] + a) & 255
            elif f == 2: line[x] = (line[x] + b) & 255
            elif f == 3: line[x] = (line[x] + (a + b) // 2) & 255
            elif f == 4:
                pp = a + b - cc; pa, pb, pc = abs(pp-a), abs(pp-b), abs(pp-cc)
                pr = a if pa <= pb and pa <= pc else (b if pb <= pc else cc)
                line[x] = (line[x] + pr) & 255
        rows.append(line); prev = line
    px = []
    for line in rows:
        r = []
        for x in range(w):
            if ct == 6: r.append(tuple(line[x*4:x*4+4]))
            elif ct == 2: r.append(tuple(line[x*3:x*3+3]) + (255,))
            elif ct == 3:
                idx = line[x]; a = trns[idx] if trns and idx < len(trns) else 255
                r.append(plte[idx] + (a,))
            elif ct == 0: r.append((line[x],)*3 + (255,))
            elif ct == 4: r.append((line[x*2],)*3 + (line[x*2+1],))
        px.append(r)
    return w, h, px

def save_png(p, px):
    h = len(px); w = len(px[0]); raw = b''
    for r in px: raw += b'\x00' + b''.join(bytes(c) for c in r)
    def chunk(t, c): return struct.pack('>I', len(c)) + t + c + struct.pack('>I', zlib.crc32(t + c) & 0xffffffff)
    open(p, 'wb').write(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b''))

def hexc(c): return '#%02x%02x%02x' % c[:3]

def bbox(px):
    ys = [y for y, r in enumerate(px) if any(c[3] for c in r)]
    xs = [x for r in px for x, c in enumerate(r) if c[3]]
    return (min(xs), min(ys), max(xs), max(ys)) if xs else None

P1 = ['#1a0807','#fbf7ee','#e4dccd','#b4aa9b','#7a7066','#e2473b','#b82a2a','#7e1b1f','#4a1015','#5d5c68','#3a3944','#24232c',
      '#3d3c46','#2a2932','#dfe1e8','#9c9eac','#ffe45c','#f2b52e','#c77a1c','#7c4512','#8fd0f2','#3b7ac2','#f6f6f6','#b9bdc6']

def measure(p):
    w, h, px = load_png(p); bb = bbox(px)
    cols = {}; semi = 0
    for r in px:
        for c in r:
            if 0 < c[3] < 255: semi += 1
            if c[3] == 255: cols[hexc(c)] = cols.get(hexc(c), 0) + 1
    out = {'arquivo': os.path.basename(p), 'canvas': [w, h], 'bbox': bb,
           'largura': bb[2]-bb[0]+1 if bb else 0, 'altura': bb[3]-bb[1]+1 if bb else 0,
           'cores': len(cols), 'fora_P1': sorted(c for c in cols if c not in P1), 'semitransp': semi}
    # pixels isolados (sem vizinho 4-conexo da mesma cor)
    iso = 0
    for y in range(h):
        for x in range(w):
            c = px[y][x]
            if c[3] != 255: continue
            if not any(0 <= y+dy < h and 0 <= x+dx < w and px[y+dy][x+dx] == c for dx, dy in ((1,0),(-1,0),(0,1),(0,-1))): iso += 1
    out['isolados'] = iso
    # largura por linha (perfil da silhueta)
    out['perfil'] = [sum(1 for c in r if c[3]) for r in px[bb[1]:bb[3]+1]] if bb else []
    return out, px

def scale(px, s): return [[c for c in r for _ in range(s)] for r in px for _ in range(s)]

def silhouette(px):
    return [[(0, 0, 0, 255) if c[3] else (255, 255, 255, 255) for c in r] for r in px]

def dump(px, legend):
    lines = []
    for r in px:
        s = ''
        for c in r:
            if not c[3]: s += '.'
            else:
                k = hexc(c)
                if k not in legend: legend[k] = chr(ord('A') + len(legend)) if len(legend) < 26 else chr(ord('a') + len(legend) - 26)
                s += legend[k]
        lines.append(s)
    return lines

if __name__ == '__main__':
    src, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
    res = {}
    files = ['base_polida/base_S_composto.png', 'base_polida/base_S_corpo.png', 'base_polida/base_S_topete.png'] + \
            ['candidatos/cand_%02d.png' % i for i in range(16)]
    for f in files:
        m, px = measure(os.path.join(src, f)); res[f] = m
    # ampliações e silhuetas da base e do top 3
    for f, tag in [('base_polida/base_S_composto.png', 'base'), ('candidatos/cand_00.png', 'c00'), ('candidatos/cand_08.png', 'c08'), ('candidatos/cand_09.png', 'c09')]:
        _, _, px = load_png(os.path.join(src, f)); bb = bbox(px)
        crop = [r[bb[0]:bb[2]+1] for r in px[bb[1]:bb[3]+1]]
        save_png(os.path.join(out, tag + '_10x.png'), scale(crop, 10))
        save_png(os.path.join(out, tag + '_silh_4x.png'), scale(silhouette(crop), 4))
    _, _, bpx = load_png(os.path.join(src, 'base_polida/base_S_composto.png'))
    legend = {}; grid = dump(bpx, legend)
    res['base_grade'] = grid; res['base_legenda'] = {v: k for k, v in legend.items()}
    json.dump(res, open(os.path.join(out, 'medicoes.json'), 'w'), indent=1, ensure_ascii=False)
    for f in files:
        m = res[f]; print(f, m['canvas'], 'LxA', m['largura'], m['altura'], 'cores', m['cores'], 'foraP1', m['fora_P1'], 'semi', m['semitransp'], 'iso', m['isolados'])
    print('\n'.join(grid)); print(res['base_legenda'])
