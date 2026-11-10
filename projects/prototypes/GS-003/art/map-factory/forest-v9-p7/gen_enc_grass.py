"""Grama alta de encontro (GS-012, QA fase 3 rodada 2 / P2): tufos procedurais 24x26, determinísticos.

Feita por game-dev como peça provisória (sem PixelLab, sem custo): mais alta (até ~24 px, contra 14 px do
fp4_tall_grass) e mais densa que a grama comum, num verde-azulado mais saturado com pontas claras, para ler como
"zona de encontro". Rodar de novo gera os mesmos PNGs:
    ~/projects/GameStudio/shared/tools/sd-local/.venv/bin/python gen_enc_grass.py
"""
import random
from PIL import Image

W, H = 24, 26
# base -> ponta (escuro, médio, claro, ponta, brilho) + contorno/sombra
PAL = [(22, 58, 52), (30, 92, 72), (46, 134, 88), (104, 186, 98), (178, 226, 112), (226, 244, 150)]
OUTLINE = (14, 32, 30, 255)
SHADOW = (12, 22, 20, 90)


def blade(px, x0, h, lean, w, rng):
    # lâmina de baixo (y=H-2) para cima, inclinação crescente; cor por altura relativa
    pts = []
    for i in range(h):
        u = i / max(1, h - 1)
        x = x0 + lean * u * u
        y = H - 2 - i
        pts.append((x, y, u))
    for (x, y, u) in pts:
        xi = int(round(x))
        k = 0 if u < 0.18 else 1 if u < 0.42 else 2 if u < 0.7 else 3 if u < 0.9 else 4
        if u > 0.96 and rng.random() < 0.6:
            k = 5
        for dx in range(w if u < 0.75 else 1):
            if 0 <= xi + dx < W and 0 <= y < H:
                px[xi + dx, y] = PAL[k] + (255,)


def clump(seed):
    rng = random.Random(seed)
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    px = im.load()
    n = 11
    blades = []
    for i in range(n):
        x0 = 3 + (i * 17 / (n - 1)) + rng.uniform(-1, 1)
        centre = 1 - abs(x0 - W / 2) / (W / 2)
        h = int(12 + centre * 11 + rng.uniform(-2, 2))
        lean = (x0 - W / 2) * 0.35 + rng.uniform(-2.5, 2.5)
        blades.append((h, x0, lean, 2 if rng.random() < 0.55 else 1))
    # mais baixas primeiro (atrás), altas por cima
    for h, x0, lean, w in sorted(blades, key=lambda b: (b[0] < 17, -b[0])):
        blade(px, x0, h, lean, w, rng)
    # contorno escuro de 1 px nas bordas laterais/topo (lê sobre o chão escuro do v9)
    src = im.copy().load()
    for y in range(H):
        for x in range(W):
            if src[x, y][3]:
                continue
            nb = [(x + dx, y + dy) for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))]
            if any(0 <= a < W and 0 <= b < H and src[a, b][3] == 255 for a, b in nb):
                px[x, y] = OUTLINE
    # base: sombra de contato
    for x in range(4, W - 4):
        if not px[x, H - 1][3]:
            px[x, H - 1] = SHADOW
    return im


for name, seed in (("enc_grass_a", 11), ("enc_grass_b", 23), ("enc_grass_c", 37)):
    clump(seed).save(f"props/{name}.png")
    print("ok", name)
