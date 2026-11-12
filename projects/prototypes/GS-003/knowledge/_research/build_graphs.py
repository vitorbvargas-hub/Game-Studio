#!/usr/bin/env python3
import json, os

BASE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(BASE)
GRAPH_DIR = os.path.join(OUT, "evolution_graphs")
os.makedirs(GRAPH_DIR, exist_ok=True)

with open(os.path.join(OUT, "evolution_chains.json"), encoding="utf-8") as f:
    chains = json.load(f)

GAME_LABELS = {
    "dw1": "Digimon World (PS1)",
    "next_order": "Next Order",
    "cyber_sleuth": "Cyber Sleuth/Hacker's Memory",
    "dmo": "DMO",
    "dawn_dusk": "Dawn & Dusk",
}
GAME_ORDER = ["dw1", "next_order", "cyber_sleuth", "dmo", "dawn_dusk"]

STATUS_MARK = {"confirmed": "", "pendente": " [pendente]", "not_in_game": " [AUSENTE no jogo]"}

def fmt_digimon(d):
    name = d.get("name", "?")
    mark = STATUS_MARK.get(d.get("status"), "")
    stage = d.get("stage", "pendente")
    return f"{name} ({stage}){mark}"

md_lines = ["# EVOLUTION_GRAPHS — grafos ASCII por linha e por jogo\n",
            "Gerado em 2026-11-09. `[pendente]` = Digimon existe no jogo mas a fonte não publicou/não foi possível confirmar o requisito exato. `[AUSENTE no jogo]` = Digimon desta linha não existe neste jogo (não inventado — ver `evolution_chains.json` para a fonte de cada afirmação).\n"]

for line in chains["lines"]:
    line_id = line["line_id"]
    md_lines.append(f"\n## Linha {line_id.capitalize()} — {line['line_name']}\n")
    for game_key in GAME_ORDER:
        g = line["games"].get(game_key, {})
        dmons = g.get("digimon", [])
        if not dmons:
            md_lines.append(f"\n### {GAME_LABELS[game_key]}\n\nSem dados coletados nesta pesquisa.\n")
            continue
        md_lines.append(f"\n### {GAME_LABELS[game_key]}\n")
        md_lines.append("```")
        for idx, d in enumerate(dmons):
            prefix = "" if idx == 0 else "  -> "
            md_lines.append(f"{prefix}{fmt_digimon(d)}")
            # show requirement(s) to reach the NEXT digimon from this one
            evolves_to = d.get("evolves_to") or []
            if evolves_to and idx < len(dmons) - 1:
                next_name = (dmons[idx + 1].get("name") or "").strip().lower()
                exact = [ev for ev in evolves_to if isinstance(ev, dict) and str(ev.get("target", "")).strip().lower() == next_name]
                matched = exact if exact else [ev for ev in evolves_to if isinstance(ev, dict) and next_name and next_name == str(ev.get("target", "")).strip().lower().split(" (")[0]]
                for ev in matched:
                    req = ev.get("requirement", "pendente")
                    alt = ev.get("alternate")
                    alt_txt = " (caminho alternativo existe)" if alt is True else ""
                    md_lines.append(f"       requisito: {req}{alt_txt}")
                if not matched:
                    md_lines.append("       requisito: pendente (vínculo nome-a-nome não confirmado explicitamente pela fonte)")
                # also list OTHER branches not part of this 5-line path, briefly
                other_targets = [ev.get("target") for ev in evolves_to if isinstance(ev, dict) and ev not in matched]
                if other_targets:
                    md_lines.append(f"       outros caminhos possíveis (fora desta linha): {', '.join(str(t) for t in other_targets)}")
        md_lines.append("```")

with open(os.path.join(OUT, "EVOLUTION_GRAPHS.md"), "w", encoding="utf-8") as f:
    f.write("\n".join(md_lines) + "\n")

# --- Simple SVGs: one per line, canonical 5-stage box chain with branch count badges ---
SVG_TEMPLATE = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 220" width="980" height="220" font-family="monospace">
  <rect width="980" height="220" fill="#101418"/>
  <text x="20" y="28" fill="#e6e6e6" font-size="18">{title}</text>
  {boxes}
  {arrows}
</svg>
"""

def build_svg(line):
    names = []
    dmons = line["games"].get("cyber_sleuth", {}).get("digimon", [])
    if not dmons:
        dmons = line["games"].get("dawn_dusk", {}).get("digimon", [])
    for d in dmons:
        if d.get("status") != "not_in_game":
            names.append(d.get("name"))
    if not names:
        names = [line["line_name"]]
    n = len(names)
    box_w = 160
    gap = 40
    start_x = 20
    y = 90
    boxes = []
    arrows = []
    colors = ["#2b6cb0", "#2f855a", "#c05621", "#6b46c1", "#b7791f"]
    for i, name in enumerate(names):
        x = start_x + i * (box_w + gap)
        color = colors[i % len(colors)]
        boxes.append(f'<rect x="{x}" y="{y}" width="{box_w}" height="60" rx="8" fill="{color}" stroke="#e6e6e6"/>')
        boxes.append(f'<text x="{x + box_w/2}" y="{y+35}" fill="#ffffff" font-size="14" text-anchor="middle">{name}</text>')
        if i < n - 1:
            ax1 = x + box_w
            ax2 = ax1 + gap
            ay = y + 30
            arrows.append(f'<line x1="{ax1}" y1="{ay}" x2="{ax2}" y2="{ay}" stroke="#e6e6e6" stroke-width="2" marker-end="url(#arrow)"/>')
    defs = '<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#e6e6e6"/></marker></defs>'
    return SVG_TEMPLATE.format(title=line["line_name"].replace("->", "→"), boxes=defs + "".join(boxes), arrows="".join(arrows))

for line in chains["lines"]:
    svg = build_svg(line)
    with open(os.path.join(GRAPH_DIR, f"{line['line_id']}.svg"), "w", encoding="utf-8") as f:
        f.write(svg)

print("OK - EVOLUTION_GRAPHS.md e SVGs gerados em", GRAPH_DIR)
