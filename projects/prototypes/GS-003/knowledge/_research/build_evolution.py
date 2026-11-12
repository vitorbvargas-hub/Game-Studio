#!/usr/bin/env python3
import json, os

BASE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(BASE)  # GS-003/knowledge

GAME_FILES = {
    "dw1": "dw1.json",
    "next_order": "next_order.json",
    "cyber_sleuth": "cyber_sleuth.json",
    "dmo": "dmo.json",
    "dawn_dusk": "dawn_dusk.json",
}

GAME_LABELS = {
    "dw1": "Digimon World (PS1, 1999)",
    "next_order": "Digimon World: Next Order",
    "cyber_sleuth": "Digimon Story: Cyber Sleuth / Hacker's Memory",
    "dmo": "Digimon Masters Online",
    "dawn_dusk": "Digimon World: Dawn & Dusk",
}

LINE_IDS = ["agumon", "gabumon", "patamon", "guilmon", "dorumon"]
LINE_NAMES = {
    "agumon": "Koromon -> Agumon -> Greymon -> MetalGreymon -> WarGreymon",
    "gabumon": "Tsunomon -> Gabumon -> Garurumon -> WereGarurumon -> MetalGarurumon",
    "patamon": "Tokomon -> Patamon -> Angemon -> MagnaAngemon -> Seraphimon",
    "guilmon": "Gigimon -> Guilmon -> Growlmon -> WarGrowlmon -> Gallantmon",
    "dorumon": "Dorimon -> Dorumon -> Dorugamon -> DoruGreymon -> Dorugoramon/ChaosDukemon",
}

STAGE_SLOTS = ["baby", "rookie", "champion", "ultimate", "mega"]

data = {}
for key, fname in GAME_FILES.items():
    with open(os.path.join(BASE, fname), encoding="utf-8") as f:
        data[key] = json.load(f)

def norm_digimon(d):
    """Normalize a single digimon record to a common shape."""
    out = {
        "name": d.get("name"),
        "stage": d.get("stage", "pendente"),
        "attribute": d.get("attribute", "pendente"),
        "evolves_from": d.get("evolves_from"),
        "evolves_to": d.get("evolves_to", []),
        "status": d.get("status", "pendente"),
        "confidence": d.get("confidence", "baixa"),
        "source_url": d.get("source_url", ""),
        "source_name": d.get("source_name", ""),
        "accessed_date": d.get("accessed_date", "2026-11-09"),
    }
    if d.get("not_in_game"):
        out["status"] = "not_in_game"
    if "notes" in d:
        out["notes"] = d["notes"]
    if "note" in d:
        out["notes"] = d["note"]
    if "game_variant" in d:
        out["game_variant"] = d["game_variant"]
    if "type" in d:
        out["element_type"] = d["type"]
    if "family_species" in d:
        out["family_species"] = d["family_species"]
    return out

# Build evolution_chains.json : per line, per game, list of digimon in order
chains = {"schemaVersion": 1, "generated": "2026-11-09", "lines": []}
for line_id in LINE_IDS:
    line_entry = {"line_id": line_id, "line_name": LINE_NAMES[line_id], "games": {}}
    for game_key in GAME_FILES:
        game_data = data[game_key]
        found_line = None
        for line in game_data.get("lines", []):
            lname = line.get("line_name", "")
            # match by first token (baby name) heuristics
            baby_names = {
                "agumon": "Koromon",
                "gabumon": "Tsunomon",
                "patamon": "Tokomon",
                "guilmon": "Gigimon",
                "dorumon": "Dorimon",
            }
            if baby_names[line_id] in lname or (line_id == "dorumon" and "Dorumon" in lname and "Tsunomon" not in lname):
                found_line = line
                break
        if found_line is None:
            line_entry["games"][game_key] = {"status": "sem_dados", "digimon": []}
            continue
        normalized = [norm_digimon(d) for d in found_line.get("digimon", [])]
        line_entry["games"][game_key] = {
            "game_label": GAME_LABELS[game_key],
            "digimon": normalized,
        }
    chains["lines"].append(line_entry)

with open(os.path.join(OUT, "evolution_chains.json"), "w", encoding="utf-8") as f:
    json.dump(chains, f, ensure_ascii=False, indent=2)

# Build evolution_requirements.json : flattened edges with requirement text
requirements = {"schemaVersion": 1, "generated": "2026-11-09", "edges": []}
for line_id in LINE_IDS:
    for game_key in GAME_FILES:
        line_games = chains["lines"]
        line_entry = next(l for l in chains["lines"] if l["line_id"] == line_id)
        g = line_entry["games"].get(game_key, {})
        for dmon in g.get("digimon", []):
            for ev in dmon.get("evolves_to", []) or []:
                if not isinstance(ev, dict):
                    continue
                requirements["edges"].append({
                    "line_id": line_id,
                    "game": game_key,
                    "game_label": GAME_LABELS[game_key],
                    "from": dmon.get("name"),
                    "to": ev.get("target"),
                    "requirement": ev.get("requirement", "pendente"),
                    "alternate": ev.get("alternate", "pendente"),
                    "edge_type": ev.get("type", "normal"),
                    "source": ev.get("source") if isinstance(ev.get("source"), list) else None,
                    "confidence": dmon.get("confidence", "baixa"),
                    "status": dmon.get("status", "pendente"),
                    "source_url": dmon.get("source_url", ""),
                })

with open(os.path.join(OUT, "evolution_requirements.json"), "w", encoding="utf-8") as f:
    json.dump(requirements, f, ensure_ascii=False, indent=2)

# Build evolution_comparison_by_game.json : per line, per stage slot, compare across games
comparison = {"schemaVersion": 1, "generated": "2026-11-09", "lines": []}
for line_id in LINE_IDS:
    line_entry = next(l for l in chains["lines"] if l["line_id"] == line_id)
    slots = []
    max_len = max(len(line_entry["games"][gk].get("digimon", [])) for gk in GAME_FILES)
    for i in range(max_len):
        slot = {"slot_index": i, "per_game": {}}
        for game_key in GAME_FILES:
            dmons = line_entry["games"][game_key].get("digimon", [])
            if i < len(dmons):
                d = dmons[i]
                slot["per_game"][game_key] = {
                    "name": d.get("name"),
                    "stage": d.get("stage"),
                    "status": d.get("status"),
                    "attribute": d.get("attribute"),
                    "confidence": d.get("confidence"),
                }
            else:
                slot["per_game"][game_key] = {"status": "sem_dados"}
        slots.append(slot)
    comparison["lines"].append({
        "line_id": line_id,
        "line_name": LINE_NAMES[line_id],
        "slots": slots,
    })

with open(os.path.join(OUT, "evolution_comparison_by_game.json"), "w", encoding="utf-8") as f:
    json.dump(comparison, f, ensure_ascii=False, indent=2)

# Coverage stats for reporting
coverage = {}
for line_id in LINE_IDS:
    line_entry = next(l for l in chains["lines"] if l["line_id"] == line_id)
    coverage[line_id] = {}
    for game_key in GAME_FILES:
        dmons = line_entry["games"][game_key].get("digimon", [])
        confirmed = sum(1 for d in dmons if d.get("status") == "confirmed")
        not_in_game = sum(1 for d in dmons if d.get("status") == "not_in_game")
        total = len(dmons)
        coverage[line_id][game_key] = {"confirmed": confirmed, "not_in_game": not_in_game, "total": total}

with open(os.path.join(BASE, "coverage_stats.json"), "w", encoding="utf-8") as f:
    json.dump(coverage, f, ensure_ascii=False, indent=2)

print("OK - chains, requirements, comparison, coverage written")
print(json.dumps(coverage, indent=2, ensure_ascii=False))
