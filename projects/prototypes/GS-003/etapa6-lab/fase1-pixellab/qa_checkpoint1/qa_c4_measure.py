"""QA independente — Etapa 6 C4 checkpoint 1. Só leitura/medição; não gera arte.
Uso: python3 -I qa_c4_measure.py <dir_tamer1> <dir_tamer2> <dir_agumon> <lab_dir>
"""
import sys, os, json, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pxpng import load_png_rgba as _load
def load_png_rgba(p):
    return [[tuple(c) for c in row] for row in _load(p)[2]]

PII = ["76ca9f","95ad6d","2bc4c4","51754b","181425","273f2b","38583a","2a432d","53a785","111e16",
       "3a5938","1b2e20","1d3022","8ff0f0","3f3025","72935b","527044","90f2bb","584531","6d8351",
       "49c5fa","63ba91","715b41","42ab76","3c9e72","487460","8c9199","02050a"]
PII = [tuple(int(h[i:i+2], 16) for i in (0, 2, 4)) for h in PII]

def opaque(px):
    return [(x, y, p) for y, row in enumerate(px) for x, p in enumerate(row) if p[3] == 255]

def bbox(px):
    o = [(x, y) for x, y, p in opaque(px)]
    xs = [a for a, _ in o]; ys = [b for _, b in o]
    return min(xs), min(ys), max(xs), max(ys)

def semi(px):
    return sum(1 for row in px for p in row if 0 < p[3] < 255)

def dist(c):
    return min(math.dist(c[:3], q) for q in PII)

def adherence(pixels, thr=(16, 32, 48)):
    ds = [dist(p) for p in pixels]
    n = len(ds)
    return {f"<= {t}": round(100 * sum(d <= t for d in ds) / n, 1) for t in thr} | {"n": n, "mediana": round(sorted(ds)[n // 2], 1)}

def is_blue(p):
    r, g, b = p[:3]
    return b > r + 25 and b > g + 10

def frames(d):
    return [load_png_rgba(os.path.join(d, f)) for f in sorted(os.listdir(d)) if f.endswith('.png')]

def walk_stats(d):
    fr = frames(d)
    bbs = [bbox(f) for f in fr]
    hs = [b[3] - b[1] + 1 for b in bbs]
    ws = [b[2] - b[0] + 1 for b in bbs]
    feet = [b[3] for b in bbs]
    # amplitude: % de pixels opacos que mudam vs quadro 0, só no terço inferior do bbox (pernas)
    f0 = fr[0]; x0, y0, x1, y1 = bbs[0]; leg_top = y1 - (y1 - y0) // 3
    diffs, legdiffs = [], []
    for f in fr[1:]:
        tot = ch = lt = lc = 0
        for y in range(len(f)):
            for x in range(len(f[0])):
                a, b = f0[y][x], f[y][x]
                if a[3] or b[3]:
                    tot += 1; c = a != b; ch += c
                    if y >= leg_top:
                        lt += 1; lc += c
        diffs.append(round(100 * ch / tot, 1)); legdiffs.append(round(100 * lc / max(lt, 1), 1))
    return {"quadros": len(fr), "canvas": [len(fr[0][0]), len(fr[0])], "alturas": hs, "larguras": ws, "pe_y": feet,
            "var_altura_pct": round(100 * (max(hs) - min(hs)) / max(hs), 1),
            "mudanca_px_vs_q0_pct": diffs, "mudanca_pernas_vs_q0_pct": legdiffs,
            "media_mudanca_pernas_pct": round(sum(legdiffs) / len(legdiffs), 1)}

def main():
    t1, t2, ag, lab = sys.argv[1:5]
    out = {}
    for name, d in (("tamer1", t1), ("tamer2", t2), ("agumon", ag)):
        r = {}
        for dirn in ("south", "east", "north", "west"):
            px = load_png_rgba(os.path.join(d, "Idle/rotations", dirn + ".png"))
            x0, y0, x1, y1 = bbox(px)
            r[dirn] = {"canvas": [len(px[0]), len(px)], "w": x1 - x0 + 1, "h": y1 - y0 + 1, "topo_livre": y0, "semi": semi(px)}
        sp = [p for _, _, p in opaque(load_png_rgba(os.path.join(d, "Idle/rotations/south.png")))]
        r["pii_south"] = adherence(sp)
        r["cores_south"] = len({p for p in sp})
        if name == "agumon":
            r["pixels_azuis_south"] = sum(is_blue(p) for p in sp)
            r["pct_azuis_south"] = round(100 * r["pixels_azuis_south"] / len(sp), 1)
        wd = os.path.join(d, "Idle/animations/walk")
        if os.path.isdir(wd):
            r["walk"] = {k: walk_stats(os.path.join(wd, k)) for k in sorted(os.listdir(wd))}
        out[name] = r
    # referências
    for name, f in (("agumon_ds", "fase1-pixellab/referencias/agumon_ds_south.png"), ("tamer_v13", "fase1-pixellab/referencias/tamer_v13_south.png")):
        px = load_png_rgba(os.path.join(lab, f)); x0, y0, x1, y1 = bbox(px); sp = [p for _, _, p in opaque(px)]
        out[name] = {"w": x1 - x0 + 1, "h": y1 - y0 + 1, "pii": adherence(sp),
                     "pixels_azuis": sum(is_blue(p) for p in sp)}
    # cenário: aderência do próprio recorte (controle) e composição
    for name, f in (("v15b_crop_controle", "fase1-pixellab/referencias/v15b_crop_NW_1x.png"),
                    ("composicao_nova", "fase1-pixellab/composicao_novo_tamer_agumon_floresta_v15b.png"),
                    ("composicao_atual", "fase1-pixellab/comparacao_atual_tamerv13_agumonds_floresta_v15b.png")):
        px = load_png_rgba(os.path.join(lab, f))
        sp = [p for _, _, p in opaque(px)]
        out[name] = adherence(sp) | {"cores": len({p for p in sp})}
    print(json.dumps(out, indent=1))

main()
