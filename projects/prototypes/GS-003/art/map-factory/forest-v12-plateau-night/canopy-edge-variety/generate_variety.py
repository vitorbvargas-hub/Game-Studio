#!/usr/bin/env python3
"""Variedade de copa para a fileira da borda da mata (Map Factory, forest-v12).

QA (`quality-overhaul/phase3/qa/QA_V11_WORLDMAP.md`, achado P2): "nas bordas
da mata (faixas densas de arvore nas laterais do mapa) a disposicao le como
fileiras bastante regulares, espacamento repetitivo -- menos organico que o
aglomerado central do mapa". As 8 copas de `forest-v10-ground-trees`/
`forest-v11-ground` (4 especies x 2 tamanhos, dia + noite pintada) ja davam
8-16 combinacoes, mas numa fileira longa e reta (borda do mapa) o gerador
cicla por elas em sequencia e o padrao fica perceptivel.

Este pacote NAO desenha nenhuma copa nova (risco de divergir da silhueta ja
aprovada) -- ele MULTIPLICA as 8 copas existentes por 2 eixos adicionais,
sempre puro-pixel a partir do PNG ja aprovado (ler com `pngw.load_png`,
nunca redesenhado):

1. `flip/` -- espelho horizontal de cada copa (dia, de `forest-v10-ground-
   trees/trees/`, e noite, de `forest-v11-ground/trees/night/`). Mesma
   silhueta, orientacao invertida -- quebra a leitura de "a mesma arvore
   virada pro mesmo lado, repetida".
2. `tone/` -- cada copa com um leve ajuste de valor (`shade(-0.08)` e
   `shade(+0.06)`, a MESMA funcao de sombreamento ja usada em todo o
   pipeline v4..v11, 0 hex novo) para variar o tom sem mudar silhueta nem
   paleta base -- lotes de arvore da mesma especie ficam com variacao de
   luz, como uma copa mais/menos exposta ao sol.

Com os 8 originais + 8 flips + 16 tons (2 por original) == 32 combinacoes
por condicao dia/noite, para as MESMAS 8 silhuetas -- ver README "Regra de
distribuicao" para como o game-dev deve ciclar por elas numa fileira.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "_tools"))
from pngw import load_png, save_png, Canvas  # noqa: E402

HERE = os.path.dirname(__file__)
V10_DAY = os.path.join(HERE, "..", "..", "forest-v10-ground-trees", "trees")
V11_NIGHT = os.path.join(HERE, "..", "..", "forest-v11-ground", "trees", "night")

SPECIES_SIZES = [
    "ancient_thick_large", "ancient_thick_small",
    "leaning_large", "leaning_small",
    "tall_narrow_large", "tall_narrow_small",
    "wide_low_large", "wide_low_small",
]


def clamp(v, lo, hi):
    return lo if v < lo else hi if v > hi else v


def shade_pixel(rgba, f):
    r, g, b, a = rgba
    if a == 0:
        return rgba
    if f >= 0:
        r = r + (255 - r) * f
        g = g + (255 - g) * f
        b = b + (255 - b) * f
    else:
        r = r * (1 + f)
        g = g * (1 + f)
        b = b * (1 + f)
    return (int(clamp(r, 0, 255)), int(clamp(g, 0, 255)), int(clamp(b, 0, 255)), a)


def flip_h(w, h, px):
    return [[px[y][w - 1 - x] for x in range(w)] for y in range(h)]


def tone(w, h, px, f):
    return [[shade_pixel(px[y][x], f) for x in range(w)] for y in range(h)]


def process(src_dir, suffix, out_root):
    for name in SPECIES_SIZES:
        path = os.path.join(src_dir, f"{name}_top.png")
        w, h, px = load_png(path)

        fw = flip_h(w, h, px)
        save_png(os.path.join(out_root, "flip", suffix, f"{name}_top_flip.png"), w, h, fw)

        dark = tone(w, h, px, -0.08)
        save_png(os.path.join(out_root, "tone", suffix, f"{name}_top_tone_dark.png"), w, h, dark)
        light = tone(w, h, px, 0.06)
        save_png(os.path.join(out_root, "tone", suffix, f"{name}_top_tone_light.png"), w, h, light)


def main():
    os.makedirs(os.path.join(HERE, "flip"), exist_ok=True)
    os.makedirs(os.path.join(HERE, "flip", "night"), exist_ok=True)
    os.makedirs(os.path.join(HERE, "tone"), exist_ok=True)
    os.makedirs(os.path.join(HERE, "tone", "night"), exist_ok=True)

    process(V10_DAY, "", HERE)  # dia: flip/<name>_top_flip.png, tone/<name>_top_tone_*.png
    process(V11_NIGHT, "night", HERE)  # noite: flip/night/..., tone/night/...

    # prancha de prova: uma fileira de 16 celulas alternando as 8 especies
    # x {original, flip} para simular a borda da mata lado a lado. Cada
    # celula e grande o bastante pra copa mais alta (97px) caber inteira,
    # sem vazar pra faixa vizinha (dia em cima, noite embaixo).
    cell_w, cell_h = 110, 110
    cols = 16
    proof = Canvas(cols * cell_w, 2 * cell_h, (0x1d, 0x22, 0x38, 255))
    for row, (src_dir, suffix) in enumerate(((V10_DAY, ""), (V11_NIGHT, "night"))):
        row_y0 = row * cell_h
        for i in range(cols):
            name = SPECIES_SIZES[i % len(SPECIES_SIZES)]
            use_flip = (i // len(SPECIES_SIZES)) % 2 == 1
            if use_flip:
                path = os.path.join(HERE, "flip", suffix, f"{name}_top_flip.png")
            else:
                path = os.path.join(src_dir, f"{name}_top.png")
            w, h, px = load_png(path)
            ox = i * cell_w + (cell_w - w) // 2
            oy = row_y0 + cell_h - h
            for y in range(h):
                for x in range(w):
                    r, g, b, a = px[y][x]
                    if a > 0:
                        proof.set(ox + x, oy + y, (r, g, b, a))
        proof.rect(0, row_y0 + cell_h - 1, cols * cell_w, 1, (0x3a, 0x47, 0x66, 255))
    proof.save(os.path.join(HERE, "edge_row_proof_16x2.png"))

    print("canopy-edge-variety: flip/ + tone/ + edge_row_proof_16x2.png escritos.")


if __name__ == "__main__":
    main()
