"""Batch-run extract_walk_height over every target Digimon sheet + the
Hero (Tamer) baseline sheet. Writes raw_measurements.json for audit and
prints a sorted summary table to stdout."""
import json
import os

from extract_walk_height import estimate_walk_height

DWDS_SHEETS = "/home/openclaw/projects/GameStudio/assets/GAME-ASSETS/10-source-files/dwds-sheets"
SPRITERS = "/home/openclaw/projects/GameStudio/assets/GAME-ASSETS/10-source-files/spriters-resource"

# name -> relative path (resolved against DWDS_SHEETS or SPRITERS below)
TARGETS = {
    # --- 12 pilot (curated dwds-sheets/, labeled sections per SOURCES.md) ---
    "Guilmon": (DWDS_SHEETS, "guilmon.png"),
    "Growlmon": (DWDS_SHEETS, "growlmon.png"),
    "Koromon": (DWDS_SHEETS, "koromon.png"),
    "Agumon": (DWDS_SHEETS, "agumon.png"),
    "Greymon": (DWDS_SHEETS, "greymon.png"),
    "Tsunomon": (DWDS_SHEETS, "tsunomon.png"),
    "Gabumon": (DWDS_SHEETS, "gabumon.png"),
    "Garurumon": (DWDS_SHEETS, "garurumon.png"),
    "Tokomon": (DWDS_SHEETS, "tokomon.png"),
    "Patamon": (DWDS_SHEETS, "patamon.png"),
    "Angemon": (DWDS_SHEETS, "angemon.png"),
    # Gigimon: not present in the DW DS (dgmnworldds) roster at all -> no proxy, see table note.

    # --- next stages of the 4 pilot lines ---
    "WarGrowlmon": (SPRITERS, "dgmnworldds__arrow-drop-down__WarGrowlmon__48670.png"),
    "Gallantmon": (SPRITERS, "dgmnworldds__arrow-drop-down__Gallantmon__48623.png"),
    "MetalGreymon": (SPRITERS, "dgmnworldds__arrow-drop-down__MetalGreymon__48322.png"),
    "WarGreymon": (SPRITERS, "dgmnworldds__arrow-drop-down__WarGreymon__48613.png"),
    "WereGarurumon": (SPRITERS, "dgmnworldds__arrow-drop-down__WereGarurumon__48684.png"),
    "MetalGarurumon": (SPRITERS, "dgmnworldds__arrow-drop-down__MetalGarurumon__48720.png"),
    "MagnaAngemon": (SPRITERS, "dgmnworldds__arrow-drop-down__MagnaAngemon__48701.png"),
    "Seraphimon": (SPRITERS, "dgmnworldds__arrow-drop-down__Seraphimon__48694.png"),

    # --- 20 common wild Digimon (all dgmnworldds, same engine/scale) ---
    "Numemon": (SPRITERS, "dgmnworldds__arrow-drop-down__Numemon__48598.png"),
    "Gizamon": (SPRITERS, "dgmnworldds__arrow-drop-down__Gizamon__48584.png"),
    "Betamon": (SPRITERS, "dgmnworldds__arrow-drop-down__Betamon__48421.png"),
    "Goburimon": (SPRITERS, "dgmnworldds__arrow-drop-down__Goburimon__48522.png"),
    "Vegiemon": (SPRITERS, "dgmnworldds__arrow-drop-down__Vegiemon__48440.png"),
    "Floramon": (SPRITERS, "dgmnworldds__arrow-drop-down__Floramon__48316.png"),
    "Gotsumon": (SPRITERS, "dgmnworldds__arrow-drop-down__Gotsumon__48428.png"),
    "Otamamon": (SPRITERS, "dgmnworldds__arrow-drop-down__Otamamon__48426.png"),
    "Bakemon": (SPRITERS, "dgmnworldds__arrow-drop-down__Bakemon__48533.png"),
    "Kuwagamon": (SPRITERS, "dgmnworldds__arrow-drop-down__Kuwagamon__41254.png"),
    "Monzaemon": (SPRITERS, "dgmnworldds__arrow-drop-down__Monzaemon__41256.png"),
    "Sukamon": (SPRITERS, "dgmnworldds__arrow-drop-down__Sukamon__48548.png"),
    "Gekomon": (SPRITERS, "dgmnworldds__arrow-drop-down__Gekomon__41250.png"),
    "Hagurumon": (SPRITERS, "dgmnworldds__arrow-drop-down__Hagurumon__48317.png"),
    "Divermon": (SPRITERS, "dgmnworldds__arrow-drop-down__Divermon__48540.png"),
    "Kamemon": (SPRITERS, "dgmnworldds__arrow-drop-down__Kamemon__48718.png"),
    "Dracmon": (SPRITERS, "dgmnworldds__arrow-drop-down__Dracmon__48610.png"),
    "Mamemon": (SPRITERS, "dgmnworldds__arrow-drop-down__Mamemon__48627.png"),
    "Raremon": (SPRITERS, "dgmnworldds__arrow-drop-down__Raremon__48600.png"),
    "Airdramon": (SPRITERS, "dgmnworldds__arrow-drop-down__Airdramon__48330.png"),

    # --- baseline: the human Tamer overworld sprite ---
    "Hero_Tamer_baseline": (SPRITERS, "dgmnworldds__arrow-drop-down__Hero__48323.png"),
}


def main():
    results = {}
    for name, (base, rel) in TARGETS.items():
        path = os.path.join(base, rel)
        r = estimate_walk_height(path)
        r["name"] = name
        results[name] = r

    out_path = os.path.join(os.path.dirname(__file__), "raw_measurements.json")
    with open(out_path, "w") as f:
        json.dump(results, f, indent=2)

    print(f"{'Digimon':<20} {'ok':<5} {'walk_h_px':<10} {'cluster_n':<10} {'sheet_size'}")
    for name, r in sorted(results.items(), key=lambda kv: kv[1].get("walk_height_px", -1) or -1):
        print(f"{name:<20} {str(r['ok']):<5} {str(r.get('walk_height_px')):<10} "
              f"{str(r.get('cluster_member_count')):<10} {r.get('sheet_size')}")
    print(f"\nWrote {out_path}")


if __name__ == "__main__":
    main()
