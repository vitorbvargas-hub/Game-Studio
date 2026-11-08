#!/usr/bin/env python3
"""GS-003 — importa as folhas Digimon World DS (Spriters Resource, enviadas pelo fundador) para GAME-ASSETS/01-creatures.

Entrada: assets/GAME-ASSETS/10-source-files/dwds-sheets/<nome>.png (folha original, intacta).
Saída por criatura (creature.json v2):
  sprites/       uma PNG por quadro (walk_<DIR>, idle_<DIR>, attack_W, hurt_W, battle_*_SW)
  spritesheets/  <id>.png + <id>.atlas.json (JSON Hash, pivô por quadro em fração e em px)
  previews/      map_walk_x4.png, battle_x2.png e attack_map_x4.png (só revisão)
  versions/v1/   creature.json, license.json, sprites/ e spritesheets/ da v1 (rip E-M-B-E-R), preservados
  creature.json, license.json
Mais 09-previews/dwds_map_sprites_contact_sheet.png.

Recorte: chroma key pelas cores de fundo de cada folha (fundo + caixas), componentes conexos (8-vizinhança)
dentro de uma região por seção, fundidos quando as caixas estão a <= 2 px. A ordem dos quadros e as direções
foram conferidas no olho (tabela SHEETS); a convenção do DS é 3 direções desenhadas (S, N, W) com E espelhado,
e algumas folhas também desenham E.

As poses de batalha (IDLE/HURT/ATTACK) estão em escala de batalha (2–4x o sprite de mapa). Para o mapa, o
importador gera `attack` e `hurt` reduzidos para a altura do sprite de mapa (redução por moda de bloco, sem
interpolação de cor). Os originais em escala de batalha ficam em `battle_idle`, `battle_hurt`, `battle_attack`.

Gigimon não existe no DS: o mapa usa o rip E-M-B-E-R (v1) reduzido para a altura média dos In-Training do DS,
com status PENDING_OFFICIAL_MAP_SPRITE.

Python 3 puro (sem PIL). Uso: python3 import_dwds_sheets.py
"""
import hashlib
import json
import os
import shutil
import sys
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gifpng import blank, blit, read_png, write_png  # noqa: E402

STUDIO = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../.."))
GA = os.path.join(STUDIO, "assets/GAME-ASSETS")
CRE = os.path.join(GA, "01-creatures")
SHEETS_DIR = os.path.join(GA, "10-source-files/dwds-sheets")
SR_PAGE = "https://www.spriters-resource.com/ds_dsi/dgmnworldds/"
TODAY = "2026-11-08"
COPYRIGHT = "Digimon © Bandai Namco Entertainment Inc. / Toei Animation; Digimon World DS © Bandai Namco Games"

# Índices 1-based na lista de quadros de mapa ordenada por linha (y) e depois por x.
# walk: direção → quadros. A pose "de pé" é o quadro do meio (ciclo f0-f1-f2-f1); com 2 quadros, f0.
# battle/ha: regiões (x0, y0, x1, y1) da folha; ha_order diz qual componente (por x) é hurt e qual é attack.
SHEETS = [
    dict(cid="CREATURE-0003", name="Guilmon", file="guilmon.png", keys=[(0, 0, 128)],
         map=(0, 195, 215, 275), walk={"S": [1, 2, 3], "W": [5, 6, 7], "N": [13, 14, 15]}, extra=[4, 8, 9, 10, 11, 12, 16],
         battle=(0, 0, 300, 90), ha=(0, 90, 190, 180), ha_order=["hurt", "attack"],
         credit=dict(ripper="Sonicteam24", text="Guilmon Digimon Wold DS sprites ripped by Sonicteam24 Credit is needed if used...", required=True)),
    dict(cid="CREATURE-0004", name="Growlmon", file="growlmon.png", keys=[(0, 0, 0), (128, 0, 128)],
         map=(0, 240, 130, 440), walk={"S": [1, 2, 3], "W": [4, 5, 6], "N": [10, 11, 12]}, extra=[7, 8, 9],
         battle=(0, 0, 299, 120), ha=(0, 120, 299, 235), ha_order=["hurt", "attack"],
         credit=dict(ripper="Atlanta", text="Growlmon Riped By Atlanta please give note if used and if put on you/A site leave this on Thank you", required=True)),
    dict(cid="CREATURE-0005", name="Koromon", file="koromon.png", keys=[(128, 3, 175), (0, 0, 0)],
         map=(88, 100, 187, 204), walk={"W": [1, 2, 3], "N": [4, 5, 6], "S": [7, 8, 9]}, extra=[10, 11, 12],
         battle=(0, 15, 135, 50), ha=(0, 50, 95, 88), ha_order=["hurt", "attack"],
         credit=dict(ripper="Atlanta", text="Koromon Riped By Atlanta Please Give Note If used If Put on a/ Your Site Leave this On", required=True)),
    dict(cid="CREATURE-0006", name="Agumon", file="agumon.png", keys=[(116, 236, 96), (255, 0, 255)],
         map=(0, 74, 305, 108), walk={"W": [1, 2, 3], "N": [4, 5, 6], "S": [7, 8]}, extra=[9],
         battle=(0, 0, 205, 76), ha=(205, 0, 352, 76), ha_order=["hurt", "attack"],
         credit=dict(ripper="Mighty Jetters, redblueyellow", text="Agumon from Digimon World DS ripped by Mighty Jetters and redblueyellow. Credit is not required.", required=False)),
    dict(cid="CREATURE-0007", name="Greymon", file="greymon.png", keys=[(0, 128, 128), (80, 176, 88)],
         map=(0, 315, 346, 370), walk={"W": [1, 2, 3], "N": [4, 5, 6], "S": [7, 8]}, extra=[9],
         battle=(0, 40, 346, 168), ha=(0, 168, 346, 305), ha_order=["hurt", "attack"],
         credit=dict(ripper="A.J. Nitro, redblueyellow", text="Ripped by A.J. Nitro & redblueyellow. Give credit if used.", required=True)),
    dict(cid="CREATURE-0008", name="Tsunomon", file="tsunomon.png", keys=[(0, 128, 128), (88, 168, 88)],
         map=(155, 0, 218, 170), walk={"W": [1, 2, 3], "E": [4, 5, 6], "N": [7, 8, 9], "S": [13, 14]}, extra=[10, 11, 12, 15],
         battle=(0, 30, 155, 90), ha=(0, 95, 155, 150), ha_order=["hurt", "attack"],
         credit=dict(ripper="redblueyellow", text="Ripped by redblueyellow. No credit needed.", required=False)),
    dict(cid="CREATURE-0009", name="Gabumon", file="gabumon.png", keys=[(0, 128, 128), (200, 216, 160)],
         map=(300, 0, 412, 175), walk={"W": [1, 2, 3], "E": [4, 5, 6], "N": [7, 8, 9], "S": [13, 14]}, extra=[10, 11, 12, 15],
         battle=(0, 30, 300, 113), ha=(0, 113, 200, 200), ha_order=["hurt", "attack"],
         credit=dict(ripper="redblueyellow", text="Ripped by redblueyellow. No credit needed.", required=False)),
    dict(cid="CREATURE-0010", name="Garurumon", file="garurumon.png", keys=[(0, 176, 0), (88, 168, 88)],
         map=(0, 250, 313, 294), walk={"N": [1, 2, 3], "W": [4, 5, 6], "S": [7, 8]}, extra=[9],
         battle=(0, 10, 313, 124), ha=(0, 124, 215, 254), ha_order=["hurt", "attack"],
         credit=dict(ripper="redblueyellow (rip), RadSpyro (compilação), Dazz (agradecimento)",
                     text="Compiled by RadSpyro. Ripped by redblueyellow. Special thanks Dazz", required=True)),
    dict(cid="CREATURE-0011", name="Tokomon", file="tokomon.png", keys=[(0, 174, 246)],
         map=(210, 280, 300, 440), walk={"N": [1, 2, 3], "W": [4, 5, 6], "S": [13, 14]}, extra=[7, 8, 9, 10, 11, 12, 15],
         battle=(0, 10, 240, 70), hurt=(0, 100, 100, 170), attack=(0, 210, 200, 280),
         credit=dict(ripper="Verion", text="Tokomon from \"Digimon World DS\" ripped by Verion. Credit please", required=True)),
    dict(cid="CREATURE-0012", name="Patamon", file="patamon.png", keys=[(116, 236, 96), (255, 0, 255)],
         map=(0, 66, 280, 100), walk={"N": [1, 2, 3], "W": [4, 5, 6], "S": [7, 8]}, extra=[],
         battle=(0, 0, 205, 66), ha=(205, 0, 352, 66), ha_order=["attack", "hurt"],
         credit=dict(ripper="Mighty Jetters, redblueyellow", text="Patamon from Digimon World DS ripped by Mighty Jetters and redblueyellow. Credit is not required.", required=False)),
    dict(cid="CREATURE-0013", name="Angemon", file="angemon.png", keys=[(0, 128, 128), (80, 176, 88)],
         map=(0, 350, 312, 410), walk={"N": [1, 2, 3], "W": [4, 5, 6], "S": [7, 8]}, extra=[9],
         battle=(0, 35, 312, 180), ha=(0, 180, 312, 345), ha_order=["hurt", "attack"],
         credit=dict(ripper="A.J. Nitro, Dazz", text="Ripped by A.J. Nitro & Dazz. Give credit if used.", required=True)),
]

BATTLE_FRAME_MS = 250
WALK_FRAME_MS = 150


def sha256(path):
    return hashlib.sha256(open(path, "rb").read()).hexdigest()


def components(img, keys, reg, merge=2, min_px=20):
    """Componentes não-fundo dentro de `reg`, fundidos quando as caixas ficam a <= merge px."""
    H, W = len(img), len(img[0])
    ks = set(keys)
    x0r, y0r, x1r, y1r = reg
    fg = [[x0r <= x < x1r and y0r <= y < y1r and img[y][x][3] > 0 and img[y][x][:3] not in ks for x in range(W)] for y in range(H)]
    seen = [[False] * W for _ in range(H)]
    out = []
    for y in range(y0r, min(H, y1r)):
        for x in range(x0r, min(W, x1r)):
            if not fg[y][x] or seen[y][x]:
                continue
            st = [(x, y)]
            seen[y][x] = True
            bx0 = bx1 = x
            by0 = by1 = y
            n = 0
            while st:
                cx, cy = st.pop()
                n += 1
                bx0, bx1, by0, by1 = min(bx0, cx), max(bx1, cx), min(by0, cy), max(by1, cy)
                for nx in (cx - 1, cx, cx + 1):
                    for ny in (cy - 1, cy, cy + 1):
                        if 0 <= nx < W and 0 <= ny < H and fg[ny][nx] and not seen[ny][nx]:
                            seen[ny][nx] = True
                            st.append((nx, ny))
            out.append([bx0, by0, bx1, by1, n])
    changed = True
    while changed:
        changed = False
        for i in range(len(out)):
            for j in range(i + 1, len(out)):
                a, b = out[i], out[j]
                if a[0] - merge <= b[2] and b[0] - merge <= a[2] and a[1] - merge <= b[3] and b[1] - merge <= a[3]:
                    out[i] = [min(a[0], b[0]), min(a[1], b[1]), max(a[2], b[2]), max(a[3], b[3]), a[4] + b[4]]
                    del out[j]
                    changed = True
                    break
            if changed:
                break
    return fg, [c for c in out if c[4] >= min_px]


def grid_order(cs, row_gap=12):
    """Ordena por linha (centro y, nova linha quando salta > row_gap) e depois por x."""
    cs = sorted(cs, key=lambda c: (c[1] + c[3]) / 2)
    rows, last = [], None
    for c in cs:
        cy = (c[1] + c[3]) / 2
        if last is None or cy - last > row_gap:
            rows.append([])
        rows[-1].append(c)
        last = cy
    return [c for r in rows for c in sorted(r, key=lambda c: c[0])]


def cut(img, fg, c):
    return [[img[y][x] if fg[y][x] else (0, 0, 0, 0) for x in range(c[0], c[2] + 1)] for y in range(c[1], c[3] + 1)]


def opaque_pts(cell):
    return [(x, y) for y, r in enumerate(cell) for x, p in enumerate(r) if p[3] > 0]


def centroid_x(cell):
    pts = opaque_pts(cell)
    return sum(p[0] for p in pts) / len(pts)


def normalize(cells, pad=2):
    """Põe os quadros num tamanho comum, base alinhada (pés na última linha opaca) e centróide em x no pivô."""
    cx = [centroid_x(c) for c in cells]
    left = max(cx[i] for i in range(len(cells)))
    right = max(len(c[0]) - cx[i] for i, c in enumerate(cells))
    half = int(max(left, right) + 0.999) + pad
    h = max(len(c) for c in cells) + pad + 1
    out = []
    for i, c in enumerate(cells):
        f = blank(2 * half, h)
        blit(f, c, half - round(cx[i]), h - 1 - len(c))
        out.append(f)
    return out, {"x": half, "y": h - 1}


def downscale(cell, r):
    """Redução por moda de bloco: cada pixel de destino pega a cor opaca mais frequente do bloco de origem,
    e fica transparente se < 45% do bloco é opaco. Sem interpolação (a paleta continua a do rip)."""
    h, w = len(cell), len(cell[0])
    tw, th = max(1, round(w * r)), max(1, round(h * r))
    out = blank(tw, th)
    for ty in range(th):
        y0, y1 = int(ty / r), max(int(ty / r) + 1, int((ty + 1) / r))
        for tx in range(tw):
            x0, x1 = int(tx / r), max(int(tx / r) + 1, int((tx + 1) / r))
            block = [cell[y][x] for y in range(y0, min(h, y1)) for x in range(x0, min(w, x1))]
            op = [p for p in block if p[3] > 0]
            if not block or len(op) < 0.45 * len(block):
                continue
            # Contorno escuro vale 1,4x (preserva a linha de contorno do DS na redução).
            cnt = Counter(op)
            for p in [p for p in cnt if sum(p[:3]) < 120]:
                cnt[p] = cnt[p] * 1.4
            out[ty][tx] = cnt.most_common(1)[0][0]
    return out


def bbox_h(cell):
    ys = [p[1] for p in opaque_pts(cell)]
    return max(ys) - min(ys) + 1


def mirror(cell):
    return [list(reversed(r)) for r in cell]


class Pack:
    """Acumula quadros (chave → célula + pivô) e gera folha em linhas por animação, 1 px de margem."""

    def __init__(self, cid):
        self.cid = cid
        self.rows = []  # [(nome da linha, [(key, cell, pivot)])]

    def add_row(self, name, items):
        self.rows.append((name, items))

    def write(self, d):
        sw = max(sum(len(c[0]) + 1 for _, c, _ in items) - 1 for _, items in self.rows)
        sh = sum(max(len(c) for _, c, _ in items) + 1 for _, items in self.rows) - 1
        sheet = blank(sw, sh)
        frames = {}
        y = 0
        for _, items in self.rows:
            x = 0
            rh = max(len(c) for _, c, _ in items)
            for key, c, pv in items:
                fw, fh = len(c[0]), len(c)
                blit(sheet, c, x, y)
                write_png(os.path.join(d, "sprites", key), c)
                frames[key] = {
                    "frame": {"x": x, "y": y, "w": fw, "h": fh}, "rotated": False, "trimmed": False,
                    "spriteSourceSize": {"x": 0, "y": 0, "w": fw, "h": fh}, "sourceSize": {"w": fw, "h": fh},
                    "pivot": {"x": round(pv["x"] / fw, 4), "y": round(pv["y"] / fh, 4)},
                    "pivotPx": {"x": pv["x"], "y": pv["y"]},
                }
                x += fw + 1
            y += rh + 1
        write_png(os.path.join(d, "spritesheets", f"{self.cid}.png"), sheet)
        atlas = {"frames": frames, "meta": {
            "app": "GS-003 tools/dwds_import/import_dwds_sheets.py", "version": "2",
            "image": f"{self.cid}.png", "format": "RGBA8888", "size": {"w": sw, "h": sh}, "scale": "1"}}
        with open(os.path.join(d, "spritesheets", f"{self.cid}.atlas.json"), "w") as fp:
            json.dump(atlas, fp, indent=2)
            fp.write("\n")


def preserve_v1(d):
    """Guarda a v1 (rip E-M-B-E-R) em versions/v1/ uma única vez; nada da v1 é apagado."""
    v1 = os.path.join(d, "versions", "v1")
    if os.path.exists(os.path.join(v1, "creature.json")):
        return json.load(open(os.path.join(v1, "creature.json"))), json.load(open(os.path.join(v1, "license.json")))
    old = json.load(open(os.path.join(d, "creature.json")))
    if old.get("schemaVersion", 1) >= 2:
        raise SystemExit(f"{d}: creature.json já é v2 e versions/v1 não existe")
    os.makedirs(v1, exist_ok=True)
    for f in ("creature.json", "license.json"):
        shutil.copyfile(os.path.join(d, f), os.path.join(v1, f))
    for sub in ("sprites", "spritesheets", "previews"):
        src = os.path.join(d, sub)
        if os.path.isdir(src):
            shutil.move(src, os.path.join(v1, sub))
    return old, json.load(open(os.path.join(v1, "license.json")))


def anim(frames, loop=True, events=None, space="map", dir_frames=None):
    a = {"loop": loop, "space": space, "frames": frames, "events": events or []}
    if dir_frames:
        a["dirFrames"] = dir_frames
    return a


def walk_cycle(keys):
    return [keys[0], keys[1], keys[0], keys[2]] if len(keys) == 3 else list(keys)


def stand_key(keys):
    return keys[1] if len(keys) == 3 else keys[0]


def common_manifest(old, v):
    """Campos da v1 que continuam valendo (identidade, linha, estágio, atributos)."""
    keep = ("id", "name", "category", "rarity", "element", "attributes", "evolutionStage", "evolutionLine",
            "evolutionRequirements")
    return {k: old[k] for k in keep if k in old}


def shadow_from(cells, pivot):
    xs = [p[0] for c in cells for p in opaque_pts(c)]
    w = max(xs) - min(xs) + 1
    rx = max(3, round(w * 0.38))
    return {"cx": pivot["x"], "cy": pivot["y"], "rx": rx, "ry": max(2, round(rx * 0.35))}


def union_bbox(cells):
    pts = [p for c in cells for p in opaque_pts(c)]
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    return {"x": min(xs), "y": min(ys), "w": max(xs) - min(xs) + 1, "h": max(ys) - min(ys) + 1}


def preview(cells, path, S, bg=(36, 38, 56, 255)):
    fw = max(len(c[0]) for c in cells)
    fh = max(len(c) for c in cells)
    pv = blank(len(cells) * (fw + 2) * S, fh * S, bg)
    for i, c in enumerate(cells):
        blit(pv, c, i * (fw + 2) * S, (fh - len(c)) * S, S)
    write_png(path, pv)


def process_sheet(s):
    cid = s["cid"]
    d = os.path.join(CRE, cid)
    old, old_lic = preserve_v1(d)
    for sub in ("sprites", "spritesheets", "previews"):
        os.makedirs(os.path.join(d, sub), exist_ok=True)
        for f in os.listdir(os.path.join(d, sub)):
            if f.endswith((".png", ".json")):
                os.remove(os.path.join(d, sub, f))
    path = os.path.join(SHEETS_DIR, s["file"])
    img = read_png(path)

    # ---- mapa ----
    fg, cs = components(img, s["keys"], s["map"], min_px=60)
    cs = grid_order(cs)
    used = sorted(i for v in s["walk"].values() for i in v)
    if max(used) > len(cs):
        raise SystemExit(f"{cid}: {len(cs)} quadros de mapa, a tabela pede #{max(used)}")
    raw_map = {dr: [cut(img, fg, cs[i - 1]) for i in idx] for dr, idx in s["walk"].items()}
    all_map = [c for v in raw_map.values() for c in v]
    norm, pivot = normalize(all_map)
    it = iter(norm)
    walk = {dr: [next(it) for _ in idx] for dr, idx in s["walk"].items()}
    dirs = [x for x in ("S", "N", "W", "E") if x in walk]
    keys = {dr: [f"{cid}_walk_{dr}_{i:02d}.png" for i in range(len(walk[dr]))] for dr in dirs}
    stand_h = bbox_h(walk["S"][1 if len(walk["S"]) == 3 else 0])

    # ---- batalha ----
    fgb, bcs = components(img, s["keys"], s["battle"], min_px=300)
    bcs = sorted(bcs, key=lambda c: c[0])
    battle_raw = [cut(img, fgb, c) for c in bcs]
    if "ha" in s:
        fgh, hcs = components(img, s["keys"], s["ha"], min_px=300)
        hcs = sorted(hcs, key=lambda c: c[0])
        if len(hcs) < 2:
            raise SystemExit(f"{cid}: HURT/ATTACK com {len(hcs)} componentes")
        named = dict(zip(s["ha_order"], [cut(img, fgh, c) for c in hcs[:2]]))
        hurt_raw, attack_raw = [named["hurt"]], [named["attack"]]
    else:
        fgh, hc = components(img, s["keys"], s["hurt"], min_px=300)
        fga, ac = components(img, s["keys"], s["attack"], min_px=300)
        hurt_raw = [cut(img, fgh, c) for c in sorted(hc, key=lambda c: c[0])][:1]
        attack_raw = [cut(img, fga, c) for c in sorted(ac, key=lambda c: c[0])]
    battle_all, bpivot = normalize(battle_raw + hurt_raw + attack_raw)
    nb, nh = len(battle_raw), len(hurt_raw)
    b_idle, b_hurt, b_attack = battle_all[:nb], battle_all[nb:nb + nh], battle_all[nb + nh:]
    battle_h = bbox_h(battle_raw[0])
    ratio = stand_h / battle_h
    map_hurt_raw = [downscale(c, ratio) for c in hurt_raw]
    map_attack_raw = [downscale(c, ratio) for c in attack_raw]
    ma, mpivot = normalize(map_hurt_raw + map_attack_raw)
    m_hurt, m_attack = ma[:nh], ma[nh:]

    pack = Pack(cid)
    for dr in dirs:
        pack.add_row(f"walk_{dr}", [(k, c, pivot) for k, c in zip(keys[dr], walk[dr])])
    k_mh = [f"{cid}_hurt_W_{i:02d}.png" for i in range(len(m_hurt))]
    k_ma = [f"{cid}_attack_W_{i:02d}.png" for i in range(len(m_attack))]
    pack.add_row("map_hurt_attack", [(k, c, mpivot) for k, c in zip(k_mh + k_ma, m_hurt + m_attack)])
    k_bi = [f"{cid}_battle_idle_SW_{i:02d}.png" for i in range(len(b_idle))]
    k_bh = [f"{cid}_battle_hurt_SW_{i:02d}.png" for i in range(len(b_hurt))]
    k_ba = [f"{cid}_battle_attack_SW_{i:02d}.png" for i in range(len(b_attack))]
    pack.add_row("battle", [(k, c, bpivot) for k, c in zip(k_bi + k_bh + k_ba, b_idle + b_hurt + b_attack)])
    pack.write(d)

    preview([c for dr in dirs for c in walk[dr]], os.path.join(d, "previews", "map_walk_x4.png"), 4)
    preview(m_hurt + m_attack, os.path.join(d, "previews", "attack_map_x4.png"), 4)
    preview(b_idle + b_hurt + b_attack, os.path.join(d, "previews", "battle_x2.png"), 2)

    # ---- manifest v2 ----
    fw, fh = len(norm[0][0]), len(norm[0])
    mirrored = {"E": "W"} if "E" not in walk else {}
    ms = lambda ks, ms_=WALK_FRAME_MS: [{"durationMs": ms_, "atlasKey": k} for k in ks]  # noqa: E731
    walk_dir = {dr: ms(walk_cycle(keys[dr])) for dr in dirs}
    idle_dir = {dr: [{"durationMs": 600, "atlasKey": stand_key(keys[dr])}] for dr in dirs}
    w_stand = stand_key(keys["W"])
    # Ataque no mapa: antecipação (pose de pé, recuo procedural) → pose ATTACK do DS (impacto) → segura → volta.
    atk_frames = [{"durationMs": 180, "atlasKey": w_stand}]
    for i, k in enumerate(k_ma):
        atk_frames.append({"durationMs": 90 if i < len(k_ma) - 1 else 160, "atlasKey": k})
    atk_frames.append({"durationMs": 60, "atlasKey": w_stand})
    hit_frame = len(k_ma)  # último quadro de ataque
    b_loop = k_bi + k_bi[-2:0:-1] if len(k_bi) == 3 else k_bi
    all_cells = [c for dr in dirs for c in walk[dr]]
    sh = shadow_from(all_cells, pivot)
    hb = union_bbox(all_cells)
    heights = {dr: bbox_h(walk[dr][0]) for dr in dirs}
    creature = {
        "schemaVersion": 2,
        "version": "2.0.0",
        "previousVersions": [{"version": "1.0.0", "path": "versions/v1/creature.json",
                              "summary": "rip E-M-B-E-R, pose de batalha idle (SW/S), sem walk/attack/hurt"}],
        **common_manifest(old, s),
        "description": (f"{s['name']}: sprites oficiais de Digimon World DS. No mapa: walk em 4 direções "
                        f"(desenhadas {', '.join(dirs)}{'; E espelhado de W' if mirrored else ''}), idle e ataque/dano reduzidos "
                        "para a escala do mapa. As poses de batalha em escala nativa ficam em battle_*."),
        "dimensions": {"frameW": fw, "frameH": fh, "tile": 32},
        "pivot": pivot,
        "mapScale": 1,
        "targetHeightPx": stand_h,
        "nativeMapHeightPx": stand_h,
        "nativeBattleHeightPx": battle_h,
        "sizeNotes": ("Altura nativa do sprite de mapa do DS (pose de pé, frente), já relativa entre espécies. "
                      "mapScale inteiro; o renderer usa targetHeightPx/DIGIMON_SIZE_TABLE só se pedido (?size=table)."),
        "hitbox": hb,
        "anchors": {
            "head": {"x": pivot["x"], "y": hb["y"]},
            "hit": {"x": pivot["x"], "y": hb["y"] + hb["h"] // 2},
            "shadow": sh,
        },
        "directions": {
            "walk": {"drawn": dirs, "mirrored": mirrored},
            "idle": {"drawn": dirs, "mirrored": mirrored},
            "attack": {"drawn": ["W"], "mirrored": {"E": "W"}},
            "hurt": {"drawn": ["W"], "mirrored": {"E": "W"}},
            "battle_idle": {"drawn": ["SW"], "mirrored": {"SE": "SW"}},
        },
        "animations": {
            "idle": anim(idle_dir["S"], dir_frames=idle_dir),
            "walk": anim(walk_dir["S"], dir_frames=walk_dir),
            "attack": anim(atk_frames, loop=False, events=[{"frame": hit_frame, "name": "hitFrame"}]),
            "hurt": anim([{"durationMs": 220, "atlasKey": k} for k in k_mh], loop=False),
            "battle_idle": anim([{"durationMs": BATTLE_FRAME_MS, "atlasKey": k} for k in b_loop], space="battle"),
            "battle_hurt": anim([{"durationMs": 300, "atlasKey": k} for k in k_bh], loop=False, space="battle"),
            "battle_attack": anim([{"durationMs": 200, "atlasKey": k} for k in k_ba], loop=False, space="battle",
                                  events=[{"frame": len(k_ba) - 1, "name": "hitFrame"}]),
        },
        "walkSpeedPxPerSec": 160,
        "combatStates": {"IDLE": "idle", "WALK": "walk", "FOLLOW": "walk", "ENGAGE": "walk", "RETURN": "walk",
                         "ATTACK": "attack", "HURT": "hurt", "DEFEAT": "hurt"},
        "sprites": "./sprites/",
        "spritesheets": "./spritesheets/",
        "assetOrigin": {
            "layer": "official-fan-use",
            "sourceDescription": (f"Folha Digimon World DS do Spriters Resource ({SR_PAGE}), ripada por {s['credit']['ripper']}; "
                                  f"enviada pelo fundador em {TODAY} (10-source-files/dwds-sheets/{s['file']}). Detalhe em license.json."),
        },
        "approvalStatus": "UNDER_REVIEW",
        "qaNotes": [
            f"Direções conferidas no olho [H]: {s['walk']} (índices na grade de mapa da folha). Quadros extras não usados: {s.get('extra', [])}.",
            f"Alturas de mapa por direção (px): {heights}. Escala nativa do DS, sem redimensionar.",
            (f"attack/hurt no mapa = poses de batalha reduzidas por moda de bloco (fator {ratio:.3f}, de {battle_h} para ~{stand_h} px). "
             "É derivado do rip, não um quadro do jogo; revisar com o game-art."),
            "Os sprites de mapa do DS têm 3 quadros por direção; o ciclo de walk é f0-f1-f0-f2 e o idle é o quadro do meio (de pé).",
            "rarity, element e evolutionStage herdados da v1 (provisórios [H]).",
        ],
    }
    with open(os.path.join(d, "creature.json"), "w") as fp:
        json.dump(creature, fp, indent=2, ensure_ascii=False)
        fp.write("\n")

    cr = s["credit"]
    license_ = {
        "creatureId": cid,
        "version": "2.0.0",
        "layer": "official-fan-use",
        "officialRip": True,
        "fanException": False,
        "baseCharacter": s["name"],
        "basis": old_lic.get("basis"),
        "nonCommercial": True,
        "noRip": False,
        "copyright": COPYRIGHT,
        "restrictions": old_lic.get("restrictions", []),
        "source": {
            "type": "game-rip",
            "game": "Digimon World DS (Nintendo DS)",
            "site": "The Spriters Resource",
            "sitePage": SR_PAGE,
            "sheetFile": f"10-source-files/dwds-sheets/{s['file']}",
            "sha256": sha256(path),
            "bytes": os.path.getsize(path),
            "providedBy": "fundador",
            "retrievedAt": TODAY,
            "modifications": ("chroma key do fundo e das caixas; quadros recortados e realinhados pelo pivô nos pés; "
                              "attack/hurt de mapa = poses de batalha reduzidas por moda de bloco (derivado)"),
        },
        "credit": {
            "ripper": cr["ripper"],
            "creditTextOnSheet": cr["text"],
            "creditRequiredBySheet": cr["required"],
            "site": "The Spriters Resource",
        },
        "previousVersions": [{"version": "1.0.0", "path": "versions/v1/license.json",
                              "credit": f"{old_lic['credit']['ripper']} ({old_lic['credit'].get('ripperCommunity', '')}), "
                                        f"preservado por {old_lic['credit'].get('preservedBy', '')}",
                              "stillShipped": False}],
        "verifiedAt": TODAY,
        "verifiedBy": "game-dev",
        "notes": (f"Créditos em qualquer build/tela de créditos: {cr['ripper']} (rip DW DS, The Spriters Resource); © Bandai Namco. "
                  "O texto de crédito acima foi transcrito da própria folha."),
    }
    with open(os.path.join(d, "license.json"), "w") as fp:
        json.dump(license_, fp, indent=2, ensure_ascii=False)
        fp.write("\n")
    return {"cid": cid, "name": s["name"], "stand": walk["S"][1 if len(walk["S"]) == 3 else 0], "pivot": pivot,
            "dirs": dirs, "stand_h": stand_h, "battle_h": battle_h, "ratio": ratio, "walk": walk,
            "attack": m_attack, "hurt": m_hurt, "mpivot": mpivot}


def process_gigimon(in_training_h):
    """Gigimon não existe no DS: mapa a partir do rip E-M-B-E-R (v1), reduzido para a altura média dos In-Training."""
    cid = "CREATURE-0002"
    d = os.path.join(CRE, cid)
    old, old_lic = preserve_v1(d)
    for sub in ("sprites", "spritesheets", "previews"):
        os.makedirs(os.path.join(d, sub), exist_ok=True)
        for f in os.listdir(os.path.join(d, sub)):
            if f.endswith((".png", ".json")):
                os.remove(os.path.join(d, sub, f))
    v1 = os.path.join(d, "versions", "v1", "sprites")
    src = [read_png(os.path.join(v1, f)) for f in sorted(os.listdir(v1)) if f.endswith(".png")]
    trimmed = []
    for c in src:
        pts = opaque_pts(c)
        x0, x1 = min(p[0] for p in pts), max(p[0] for p in pts)
        y0, y1 = min(p[1] for p in pts), max(p[1] for p in pts)
        trimmed.append([r[x0:x1 + 1] for r in c[y0:y1 + 1]])
    battle_h = bbox_h(trimmed[0])
    ratio = in_training_h / battle_h
    small = [downscale(c, ratio) for c in trimmed]
    norm, pivot = normalize(small)
    keys = [f"{cid}_walk_W_{i:02d}.png" for i in range(len(norm))]
    bnorm, bpivot = normalize(trimmed)
    bkeys = [f"{cid}_battle_idle_SW_{i:02d}.png" for i in range(len(bnorm))]
    pack = Pack(cid)
    pack.add_row("walk_W", [(k, c, pivot) for k, c in zip(keys, norm)])
    pack.add_row("battle", [(k, c, bpivot) for k, c in zip(bkeys, bnorm)])
    pack.write(d)
    preview(norm, os.path.join(d, "previews", "map_walk_x4.png"), 4)
    stand_h = bbox_h(norm[0])
    cyc = [keys[0], keys[1], keys[2], keys[1]] if len(keys) == 3 else keys
    hb = union_bbox(norm)
    creature = {
        "schemaVersion": 2,
        "version": "2.0.0",
        "previousVersions": [{"version": "1.0.0", "path": "versions/v1/creature.json",
                              "summary": "rip E-M-B-E-R, pose de batalha idle SW em escala de batalha"}],
        **common_manifest(old, None),
        "description": ("Gigimon não aparece em Digimon World DS. Sprite de mapa PROVISÓRIO: idle de batalha do rip E-M-B-E-R "
                        "reduzido para a altura média dos In-Training do DS. Uma direção (W) com E espelhado."),
        "dimensions": {"frameW": len(norm[0][0]), "frameH": len(norm[0]), "tile": 32},
        "pivot": pivot,
        "mapScale": 1,
        "targetHeightPx": stand_h,
        "nativeMapHeightPx": stand_h,
        "nativeBattleHeightPx": battle_h,
        "sizeNotes": f"Reduzido de {battle_h} para {stand_h} px (média dos In-Training do DS = {in_training_h} px).",
        "hitbox": hb,
        "anchors": {"head": {"x": pivot["x"], "y": hb["y"]}, "hit": {"x": pivot["x"], "y": hb["y"] + hb["h"] // 2},
                    "shadow": shadow_from(norm, pivot)},
        "directions": {"walk": {"drawn": ["W"], "mirrored": {"E": "W"}}, "idle": {"drawn": ["W"], "mirrored": {"E": "W"}},
                       "battle_idle": {"drawn": ["SW"], "mirrored": {"SE": "SW"}}},
        "animations": {
            "idle": anim([{"durationMs": 250, "atlasKey": k} for k in cyc]),
            "walk": anim([{"durationMs": WALK_FRAME_MS, "atlasKey": k} for k in cyc]),
            "battle_idle": anim([{"durationMs": BATTLE_FRAME_MS, "atlasKey": bkeys[i]} for i in ([0, 1, 2, 1] if len(bkeys) == 3 else range(len(bkeys)))], space="battle"),
        },
        "walkSpeedPxPerSec": 160,
        "combatStates": {"IDLE": "idle", "WALK": "walk", "FOLLOW": "walk", "ENGAGE": "walk", "RETURN": "walk"},
        "sprites": "./sprites/",
        "spritesheets": "./spritesheets/",
        "assetOrigin": old.get("assetOrigin"),
        "approvalStatus": "PENDING_OFFICIAL_MAP_SPRITE",
        "qaNotes": [
            "Sem sprite de mapa oficial (Gigimon não está no DS). Substituir quando houver fonte (ex.: outro jogo) ou arte própria.",
            "Sem attack/hurt desenhados: o renderer usa ataque e dano procedurais.",
            f"Redução por moda de bloco, fator {ratio:.3f}: perde detalhe; é placeholder.",
        ],
    }
    with open(os.path.join(d, "creature.json"), "w") as fp:
        json.dump(creature, fp, indent=2, ensure_ascii=False)
        fp.write("\n")
    lic = dict(old_lic)
    lic["version"] = "2.0.0"
    lic["source"] = dict(old_lic["source"], modifications=(old_lic["source"]["modifications"] +
                                                           "; v2: quadros reduzidos por moda de bloco para sprite de mapa provisório"))
    lic["previousVersions"] = [{"version": "1.0.0", "path": "versions/v1/license.json", "stillShipped": True}]
    with open(os.path.join(d, "license.json"), "w") as fp:
        json.dump(lic, fp, indent=2, ensure_ascii=False)
        fp.write("\n")
    return {"cid": cid, "name": "Gigimon", "stand": norm[0], "pivot": pivot, "stand_h": stand_h, "battle_h": battle_h,
            "ratio": ratio, "dirs": ["W"], "walk": {"W": norm}, "attack": [], "hurt": [], "mpivot": pivot}


def contact_sheet(results, path):
    """Uma linha por criatura: quadros de walk de cada direção + attack/hurt de mapa, 3x, base alinhada."""
    S, pad = 3, 4
    rows = []
    for r in results:
        cells = [c for dr in r["dirs"] for c in r["walk"][dr]] + r["hurt"] + r["attack"]
        rows.append(cells)
    cw = max(len(c[0]) for cells in rows for c in cells)
    ch = max(len(c) for cells in rows for c in cells)
    ncol = max(len(cells) for cells in rows)
    img = blank((ncol * (cw + pad) + pad) * S, (len(rows) * (ch + pad) + pad) * S, (36, 38, 56, 255))
    for ri, cells in enumerate(rows):
        base = (pad + ri * (ch + pad) + ch) * S
        for x in range(img and len(img[0])):
            img[base][x] = (60, 64, 92, 255)
        for ci, c in enumerate(cells):
            blit(img, c, (pad + ci * (cw + pad) + (cw - len(c[0])) // 2) * S, base - len(c) * S, S)
    write_png(path, img)


def main():
    results = [process_sheet(s) for s in SHEETS]
    it_h = round(sum(r["stand_h"] for r in results if r["cid"] in ("CREATURE-0005", "CREATURE-0008", "CREATURE-0011")) / 3)
    results.insert(0, process_gigimon(it_h))
    os.makedirs(os.path.join(GA, "09-previews"), exist_ok=True)
    contact_sheet(results, os.path.join(GA, "09-previews", "dwds_map_sprites_contact_sheet.png"))
    for r in results:
        print(f"{r['cid']} {r['name']:<10} dirs={','.join(r['dirs']):<9} mapH={r['stand_h']:>3} battleH={r['battle_h']:>3} "
              f"ratio={r['ratio']:.3f} attack={len(r['attack'])} hurt={len(r['hurt'])}")


if __name__ == "__main__":
    main()
