#!/usr/bin/env python3
"""GS-003 — importa os sprites animados oficiais de Digimon World DS/Dawn/Dusk (rip AngelOfHope,
preservado em E-M-B-E-R/digimon-world-ds-dawn-dusk-animated-sprites) para GAME-ASSETS/01-creatures.

Entrada: assets/GAME-ASSETS/01-creatures/CREATURE-NNNN/source/<Nome>.gif (o rip original, intacto).
Saída por criatura: sprites/ (PNG por quadro único), spritesheets/ (folha + atlas JSON Hash),
previews/ (idle ampliado 4x), creature.json, license.json. Mais evolution-lines/*.json,
08-licenses/CREDITS.md e 09-previews/pilot_lines_contact_sheet.png.

Sem dependências (o host não tem PIL): GIF/PNG em Python puro (gifpng.py).
Uso: python3 import_ember.py [--fetch-dir /tmp/gs003dl/gif]  (copia os GIFs baixados para source/ antes)
"""
import argparse
import hashlib
import json
import os
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gifpng import blank, blit, decode_gif, write_png  # noqa: E402

STUDIO = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../.."))
GA = os.path.join(STUDIO, "assets/GAME-ASSETS")
CRE = os.path.join(GA, "01-creatures")

REPO = "E-M-B-E-R/digimon-world-ds-dawn-dusk-animated-sprites"
REPO_URL = f"https://github.com/{REPO}"
COMMIT = "4b2273e163f023b9562cc69e4642f97a0684cb87"  # main em 2026-11-08 (commit de 2025-12-26)
THREAD = "https://withthewill.net/threads/digimon-sprite-animation-thread-read-first-post-fully-working.10472/"
RETRIEVED = "2026-11-08"

# Direção do rip (pose de batalha, conferida no olho): 3/4 virada para a esquerda da tela → SW, com SE
# espelhado; de frente → S, sem espelho (o rip não é simétrico, espelhar S não vira outra direção).
FRONT = {"Tsunomon", "Tokomon", "Patamon", "Angemon"}

# (id, nome, pasta no repo, blob sha git, estágio schema, estágio DW, atributo, linha)
# Atributos: [H] conhecimento geral da franquia (Vaccine/Data/Virus; In-Training não tem) — conferir na Wikimon.
ROSTER = [
    ("CREATURE-0002", "Gigimon", "in-training", "4c905536cea0874e79a8e10387f8602b2717afaf", "baby", "In-Training", "none", "guilmon"),
    ("CREATURE-0003", "Guilmon", "rookie", "709ba1060cca203704dfff5dbe5cd37ce3d0f544", "rookie", "Rookie", "virus", "guilmon"),
    ("CREATURE-0004", "Growlmon", "champion", "747187043aeee77a5e9cc07d86f6b0d30956ed37", "champion", "Champion", "virus", "guilmon"),
    ("CREATURE-0005", "Koromon", "in-training", "fb6a8e9620d71e326a4b991a2c865cd02f48dd94", "baby", "In-Training", "none", "agumon"),
    ("CREATURE-0006", "Agumon", "rookie", "82a2b8b290753a5346bf30e71c5c39cab0a9259e", "rookie", "Rookie", "vaccine", "agumon"),
    ("CREATURE-0007", "Greymon", "champion", "206a1037890e960c092ff627975f3ca6049b9cfa", "champion", "Champion", "vaccine", "agumon"),
    ("CREATURE-0008", "Tsunomon", "in-training", "de5be225a1a5f8cd8817aaeb287c464228d072c9", "baby", "In-Training", "none", "gabumon"),
    ("CREATURE-0009", "Gabumon", "rookie", "8de15cecfe8fffc440cd34eaf86955249a630b49", "rookie", "Rookie", "data", "gabumon"),
    ("CREATURE-0010", "Garurumon", "champion", "68f8e5692bf72961a2656df21b323d74914616c3", "champion", "Champion", "vaccine", "gabumon"),
    ("CREATURE-0011", "Tokomon", "in-training", "0499e983ea5350c7229da8df330ea2f571ea9d69", "baby", "In-Training", "none", "patamon"),
    ("CREATURE-0012", "Patamon", "rookie", "d00ef14485d7f59fb7806de5ec54754073f4c619", "rookie", "Rookie", "data", "patamon"),
    ("CREATURE-0013", "Angemon", "champion", "d3b2ffa5730ff77c5495f2fb6f96739ca6d91fa6", "champion", "Champion", "vaccine", "patamon"),
]
LINES = {
    "guilmon": "Gigimon → Guilmon → Growlmon",
    "agumon": "Koromon → Agumon → Greymon",
    "gabumon": "Tsunomon → Gabumon → Garurumon",
    "patamon": "Tokomon → Patamon → Angemon",
}
COPYRIGHT = "Sprites are property of Digimon and Bandai Namco Entertainment Inc/Namco Bandai Games (README do repo de origem)"


def git_blob_sha(b):
    return hashlib.sha1(b"blob %d\0" % len(b) + b).hexdigest()


def opaque(px):
    return px[3] > 0


def analyse(frames):
    """União dos pixels opacos de todos os quadros → bbox, linha dos pés e centro dos pés."""
    H, W = len(frames[0]), len(frames[0][0])
    xs, ys = [], []
    for f in frames:
        for y in range(H):
            for x in range(W):
                if opaque(f[y][x]):
                    xs.append(x)
                    ys.append(y)
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    # Pés: pixels opacos nas 3 linhas mais baixas do 1º quadro (pose de repouso).
    feet = [x for y in range(max(0, y1 - 2), y1 + 1) for x in range(W) if opaque(frames[0][y][x])]
    if not feet:
        feet = [x for y in range(H) for x in range(W) if opaque(frames[0][y][x])]
    fx = round(sum(feet) / len(feet))
    return x0, y0, x1, y1, fx


def crop(f, left, top, w, h):
    H, W = len(f), len(f[0])
    out = blank(w, h)
    for y in range(h):
        for x in range(w):
            sx, sy = left + x, top + y
            if 0 <= sx < W and 0 <= sy < H:
                out[y][x] = f[sy][sx]
    return out


def bbox(rows):
    pts = [(x, y) for y, r in enumerate(rows) for x, px in enumerate(r) if opaque(px)]
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    return min(xs), min(ys), max(xs), max(ys)


def process(entry, fetch_dir):
    cid, name, folder, blob, stage, dwstage, attr, line = entry
    d = os.path.join(CRE, cid)
    DRAWN, MIRROR = ("S", {}) if name in FRONT else ("SW", {"SE": "SW"})
    for sub in ("source", "sprites", "spritesheets", "previews"):
        os.makedirs(os.path.join(d, sub), exist_ok=True)
    gif_path = os.path.join(d, "source", f"{name}.gif")
    if fetch_dir:
        shutil.copyfile(os.path.join(fetch_dir, f"{name}.gif"), gif_path)
    raw = open(gif_path, "rb").read()
    if git_blob_sha(raw) != blob:
        raise SystemExit(f"{name}: blob sha não confere com o repo de origem")
    W, H, frames = decode_gif(raw)
    delays = [ms for _, ms in frames]
    rgba = [f for f, _ in frames]

    # Recorte: pivô (pés) no centro horizontal do quadro; 2px de folga em cima/lados; 1px sob os pés.
    x0, y0, x1, y1, fx = analyse(rgba)
    half = max(fx - x0, x1 - fx) + 3
    fw, top = 2 * half, y0 - 2
    fh = (y1 + 2) - top  # linha y1 (pés) + 1 linha livre para a sombra
    left = fx - half
    cells = [crop(f, left, top, fw, fh) for f in rgba]
    pivot = {"x": half, "y": y1 + 1 - top}

    # Quadros únicos (o rip faz A-B-C-B): guarda cada pose uma vez, a animação referencia por chave.
    uniq, order = [], []
    for c in cells:
        k = tuple(map(tuple, c))
        if k not in [tuple(map(tuple, u)) for u in uniq]:
            uniq.append(c)
        order.append([tuple(map(tuple, u)) for u in uniq].index(k))
    keys = [f"{cid}_idle_{DRAWN}_{i:02d}.png" for i in range(len(uniq))]
    for f in os.listdir(os.path.join(d, "sprites")):
        if f.endswith(".png"):
            os.remove(os.path.join(d, "sprites", f))
    for k, c in zip(keys, uniq):
        write_png(os.path.join(d, "sprites", k), c)

    # Folha: 1 linha (idle × SW), colunas = quadros únicos, 1px de margem entre células.
    sw, sh = len(uniq) * (fw + 1) - 1, fh
    sheet = blank(sw, sh)
    atlas = {"frames": {}, "meta": {
        "app": "GS-003 tools/dwds_import/import_ember.py", "version": "1",
        "image": f"{cid}.png", "format": "RGBA8888", "size": {"w": sw, "h": sh}, "scale": "1"}}
    for i, (k, c) in enumerate(zip(keys, uniq)):
        blit(sheet, c, i * (fw + 1), 0)
        atlas["frames"][k] = {
            "frame": {"x": i * (fw + 1), "y": 0, "w": fw, "h": fh}, "rotated": False, "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": fw, "h": fh}, "sourceSize": {"w": fw, "h": fh},
            "pivot": {"x": round(pivot["x"] / fw, 4), "y": round(pivot["y"] / fh, 4)}}
    write_png(os.path.join(d, "spritesheets", f"{cid}.png"), sheet)
    with open(os.path.join(d, "spritesheets", f"{cid}.atlas.json"), "w") as fp:
        json.dump(atlas, fp, indent=2)
        fp.write("\n")

    # Preview 4x (só revisão, não é asset final).
    S = 4
    pv = blank(len(cells) * (fw + 2) * S, fh * S, (36, 38, 56, 255))
    for i, c in enumerate(cells):
        blit(pv, c, i * (fw + 2) * S, 0, S)
    write_png(os.path.join(d, "previews", f"idle_{DRAWN}_x4.png"), pv)

    bx0, by0, bx1, by1 = bbox([[px for px in r] for r in _union(cells)])
    bw, bh = bx1 - bx0 + 1, by1 - by0 + 1
    topxs = [x for x, px in enumerate(cells[0][by0]) if opaque(px)] or [pivot["x"]]
    fps = round(1000 / delays[0], 2) if len(set(delays)) == 1 else None
    rx = max(3, round(bw * 0.35))
    idx = [r[0] for r in ROSTER]
    i = idx.index(cid)
    same = [r for r in ROSTER if r[7] == line]
    pos = [r[0] for r in same].index(cid)
    prev_id = same[pos - 1][0] if pos > 0 else None
    next_ids = [same[pos + 1][0]] if pos + 1 < len(same) else []

    anim = {"loop": True, "frames": [{"durationMs": ms, "atlasKey": keys[o]} for o, ms in zip(order, delays)], "events": []}
    if fps:
        anim = {"loop": True, "fps": fps, **{k: v for k, v in anim.items() if k != "loop"}}
    creature = {
        "id": cid,
        "name": name,
        "description": (f"{name} ({dwstage}), sprite animado oficial de Digimon World DS/Dawn/Dusk "
                        f"(pose de batalha, idle). Linha piloto {LINES[line]}. Rip importado sem edição de pixels; "
                        "só recorte com pivô nos pés."),
        "category": "digital-creature",
        "rarity": "common" if stage in ("baby", "rookie") else "uncommon",
        "element": attr,
        "attributes": {},
        "evolutionStage": stage,
        "evolutionLine": {"lineId": line, "previous": prev_id, "next": next_ids},
        "evolutionRequirements": {},
        "dimensions": {"frameW": fw, "frameH": fh, "tile": 32},
        "pivot": pivot,
        "hitbox": {"x": bx0, "y": by0, "w": bw, "h": bh},
        "anchors": {
            "head": {"x": round(sum(topxs) / len(topxs)), "y": by0},
            "hit": {"x": bx0 + bw // 2, "y": by0 + bh // 2},
            "shadow": {"cx": pivot["x"], "cy": pivot["y"], "rx": rx, "ry": max(2, round(rx * 0.3))},
        },
        "directions": {"idle": {"drawn": [DRAWN], "mirrored": dict(MIRROR)}},
        "animations": {"idle": anim},
        "combatStates": {s: "idle" for s in ("IDLE", "WALK", "FOLLOW", "ENGAGE", "ATTACK", "HURT", "DEFEAT", "RETURN")},
        "sprites": "./sprites/",
        "spritesheets": "./spritesheets/",
        "assetOrigin": {
            "layer": "official-fan-use",
            "sourceDescription": (f"Rip oficial DW DS/Dawn/Dusk por AngelOfHope (With the Will), preservado em {REPO_URL} "
                                  f"({folder}/{name}.gif, commit {COMMIT[:7]}). Detalhe em license.json."),
        },
        "approvalStatus": "UNDER_REVIEW",
        "qaNotes": [
            "Só existe idle (4 quadros, 3 poses únicas A-B-C-B) — a fonte E-M-B-E-R tem um GIF de batalha por Digimon, sem walk/attack/hurt/sleep.",
            ("Uma direção desenhada (S, pose de batalha de frente); as outras 7 não existem na fonte." if DRAWN == "S" else
             "Uma direção desenhada (SW, pose de batalha 3/4 virada para a esquerda); SE é espelho. As outras 6 não existem na fonte."),
            "combatStates aponta tudo para 'idle' até existirem as outras animações (fonte provável: folhas overworld do Spriters Resource, bloqueadas neste host).",
            f"Escala nativa do DS ({fw}x{fh}); não bate com o tile 32 do ART_STYLE_GUIDE — decisão de escala fica com game-art.",
            "rarity, element (atributo Vaccine/Data/Virus) e evolutionStage 'baby' para In-Training são preenchimentos provisórios [H]; game design decide.",
        ],
    }
    with open(os.path.join(d, "creature.json"), "w") as fp:
        json.dump(creature, fp, indent=2, ensure_ascii=False)
        fp.write("\n")

    license_ = {
        "creatureId": cid,
        "layer": "official-fan-use",
        "officialRip": True,
        "fanException": False,
        "baseCharacter": name,
        "basis": "ADR-009 §Licença (fundador, 2026-11-08: sprites oficiais liberados em todo o projeto, inclusive git)",
        "nonCommercial": True,
        "noRip": False,
        "copyright": COPYRIGHT,
        "restrictions": [
            "ADR-007: fan game sem monetização de nenhum tipo, sem logo oficial, com aviso de fan game",
            "Publicação exige aprovação separada do fundador",
            "Substituir por arte própria (camada 'original') ao longo do projeto (ADR-009)",
        ],
        "source": {
            "type": "game-rip",
            "game": "Digimon World DS / Digimon World Dawn / Digimon World Dusk (Nintendo DS)",
            "gamePerFile": "não informado pela fonte (o repo agrupa DS/Dawn/Dusk)",
            "repository": REPO_URL,
            "commit": COMMIT,
            "path": f"{folder}/{name}.gif",
            "fileUrl": f"{REPO_URL}/blob/{COMMIT}/{folder}/{name}.gif",
            "gitBlobSha": blob,
            "sha256": hashlib.sha256(raw).hexdigest(),
            "bytes": len(raw),
            "retrievedAt": RETRIEVED,
            "retrievedVia": "api.github.com /git/blobs/<sha> (base64) pelo web_fetch do OpenClaw; git/curl bloqueados pelo proxy deste host",
            "localCopy": f"source/{name}.gif",
            "modifications": "nenhuma nos pixels; quadros recortados (pivô nos pés), quadros repetidos deduplicados e reempacotados em PNG",
        },
        "credit": {
            "ripper": "AngelOfHope",
            "ripperCommunity": "With the Will",
            "ripperUrl": THREAD,
            "preservedBy": "E-M-B-E-R",
            "preservedByUrl": REPO_URL,
        },
        "verifiedAt": RETRIEVED,
        "verifiedBy": "game-dev",
        "notes": "Rip oficial. Créditos obrigatórios em qualquer build/tela de créditos: AngelOfHope (With the Will), preservação E-M-B-E-R; © Bandai Namco.",
    }
    with open(os.path.join(d, "license.json"), "w") as fp:
        json.dump(license_, fp, indent=2, ensure_ascii=False)
        fp.write("\n")
    return {"cid": cid, "name": name, "line": line, "idle": cells[0], "pivot": pivot, "fw": fw, "fh": fh,
            "frames": len(cells), "unique": len(uniq), "delays": delays}


def _union(cells):
    h, w = len(cells[0]), len(cells[0][0])
    out = blank(w, h)
    for c in cells:
        for y in range(h):
            for x in range(w):
                if opaque(c[y][x]):
                    out[y][x] = c[y][x]
    return out


def contact_sheet(results, path):
    """4 linhas (uma por linha evolutiva) × 3 colunas, idle quadro 0, alinhado pelos pés, 2x."""
    S, pad = 2, 8
    cw = max(r["fw"] for r in results)
    above = max(r["pivot"]["y"] for r in results)
    below = max(r["fh"] - r["pivot"]["y"] for r in results)
    rowh = above + below
    lines = list(LINES)
    W = (3 * (cw + pad) + pad) * S
    H = (len(lines) * (rowh + pad) + pad) * S
    img = blank(W, H, (36, 38, 56, 255))
    for li, line in enumerate(lines):
        for ci, r in enumerate([r for r in results if r["line"] == line]):
            ox = (pad + ci * (cw + pad) + cw // 2 - r["pivot"]["x"]) * S
            oy = (pad + li * (rowh + pad) + above - r["pivot"]["y"]) * S
            # linha do chão
            gy = (pad + li * (rowh + pad) + above) * S
            for x in range((pad + ci * (cw + pad)) * S, (pad + ci * (cw + pad) + cw) * S):
                img[gy][x] = (60, 64, 92, 255)
            blit(img, r["idle"], ox, oy, S)
    write_png(path, img)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fetch-dir", help="pasta com <Nome>.gif baixados (copiados para source/)")
    a = ap.parse_args()
    results = [process(e, a.fetch_dir) for e in ROSTER]

    os.makedirs(os.path.join(CRE, "evolution-lines"), exist_ok=True)
    for line, label in LINES.items():
        with open(os.path.join(CRE, "evolution-lines", f"{line}.json"), "w") as fp:
            json.dump({"lineId": line, "label": label, "sequence": [r["cid"] for r in results if r["line"] == line],
                       "names": [r["name"] for r in results if r["line"] == line]}, fp, indent=2, ensure_ascii=False)
            fp.write("\n")
    contact_sheet(results, os.path.join(GA, "09-previews", "pilot_lines_contact_sheet.png"))
    for r in results:
        print(f"{r['cid']} {r['name']:<10} {r['fw']}x{r['fh']} pivot={r['pivot']} frames={r['frames']} unique={r['unique']} delays={r['delays']}")


if __name__ == "__main__":
    main()
