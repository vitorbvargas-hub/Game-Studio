"""Compile DIGIMON_SIZE_TABLE.json / .md from raw_measurements.json plus
manual review overrides (documented inline) for entries where the
automated extractor was inconclusive (cluster_member_count < 4) or gave
an implausible value rejected after direct blob/ASCII-art inspection.

Tamer (Hero) baseline, measured: 26 px (n=85, highest-confidence reading
in the whole dataset) -- used as the denominator for every stage ratio.
GS-003 target Tamer reference: 36 px (midpoint of the 32-40px asked for
in the brief) -- used only to turn the ratio into a concrete pixel target
at the project's 32px tile; the ratio itself is the portable number.
"""
import json

TAMER_PX_RAW = 26
TAMER_PX_TARGET = 36
TILE_PX = 32

SOURCE_DWDS_SHEET = "assets/GAME-ASSETS/10-source-files/dwds-sheets/{f}.png (proxy script)"
SOURCE_SPRITERS = "assets/GAME-ASSETS/10-source-files/spriters-resource/{f} (proxy script)"

# name: (stage, line, px_measured_or_estimated, evidence_tag, n_members, note)
# evidence_tag: "E" = automated proxy measurement trusted (n>=4, plausible);
#               "H" = hypothesis / manual override, justified in `note`.
ROWS = [
    # ---- 12 pilot ----
    ("Gigimon", "Baby/In-Training", "Guilmon", 17, "H", None,
     "Nao presente no roster do Digimon World DS (nenhuma folha encontrada em dwds-sheets/ nem spriters-resource); sem proxy de pixel possivel. Estimado por analogia de estagio com Koromon/Tokomon (mesma fase In-Training, criaturas-bolha simples)."),
    ("Guilmon", "Rookie/Child", "Guilmon", 28, "H", 4,
     "Medicao automatica no arquivo curado (dwds-sheets/guilmon.png) ficou inconclusiva: o unico cluster com >=4 membros (h=76,n=4) e, por inspecao manual dos blobs, o grupo de poses de batalha (idle/hurt/attack), nao o sprite de mapa; o grupo pequeno real so tem n=2 (h=31). Valor adotado interpolado entre Agumon (26) e Gabumon (29), Rookies da mesma escala de folha."),
    ("Growlmon", "Champion/Adult", "Guilmon", 37, "E", 11, None),
    ("Koromon", "In-Training", "Agumon", 17, "E", 7, None),
    ("Agumon", "Rookie/Child", "Agumon", 26, "E", 10, None),
    ("Greymon", "Champion/Adult", "Agumon", 37, "E", 9, None),
    ("Tsunomon", "In-Training", "Gabumon", 24, "E", 5, None),
    ("Gabumon", "Rookie/Child", "Gabumon", 29, "E", 16, None),
    ("Garurumon", "Champion/Adult", "Gabumon", 28, "H", 1,
     "Unico candidato acima do limiar de confianca (n=1): a folha curada parece nao conter um ciclo de caminhada isolavel com repeticao suficiente (confirmado por ASCII-art manual - a area central da folha e dominada pelas poses de batalha grandes). Valor mantido como leitura pontual, nao como media de cluster; plausivel por ser proximo do Rookie da mesma linha (Gabumon=29), o que e consistente com Garurumon ser quadrupede: pode ganhar comprimento/massa ao evoluir sem ganhar altura de sprite proporcional. Recomenda-se conferencia visual manual antes de usar em produção."),
    ("Tokomon", "In-Training", "Patamon", 19, "E", 4, None),
    ("Patamon", "Rookie/Child", "Patamon", 23, "E", 8, None),
    ("Angemon", "Champion/Adult", "Patamon", 35, "E", 5, None),

    # ---- next stages of the 4 pilot lines ----
    ("WarGrowlmon", "Ultimate/Perfect", "Guilmon", 39, "H", None,
     "Sem leitura automatica (nenhum cluster valido na folha). Estimado pela media das leituras Ultimate confirmadas (MetalGreymon=34, MagnaAngemon=39) e pelo teto de legibilidade observado em Mega da mesma familia."),
    ("Gallantmon", "Mega/Ultimate", "Guilmon", 39, "H", 1,
     "Cluster de confianca baixa (n=1, h=27) rejeitado por ser inferior ao proprio Champion da linha (Growlmon=37), o que contraria a progressao de estagio. Estimado pelo teto de legibilidade Mega observado em WarGreymon (37, igual ao Champion) e Seraphimon (39)."),
    ("MetalGreymon", "Ultimate/Perfect", "Agumon", 34, "E", 5, None),
    ("WarGreymon", "Mega/Ultimate", "Agumon", 37, "E", 5,
     "Igual ao Champion da linha (Greymon=37): evidencia direta do teto de legibilidade de sprite no mapa do DW DS - Mega nao fica mais alto que Champion nesta folha."),
    ("WereGarurumon", "Ultimate/Perfect", "Gabumon", 37, "H", 1,
     "Leitura automatica de confianca baixa (n=1, h=24) rejeitada: ficaria menor que o proprio Rookie (Gabumon=29), o que contraria a progressao de estagio. Estimado pela media dos Ultimates confirmados (34, 39) e pelo padrao de teto observado nas demais linhas."),
    ("MetalGarurumon", "Mega/Ultimate", "Gabumon", 38, "H", 1,
     "Mesmo problema que WereGarurumon (leitura automatica n=1, h=24, inferior ao Rookie). Estimado ligeiramente acima do Ultimate da mesma linha, seguindo o padrao Mega>=Ultimate visto em MagnaAngemon/Seraphimon (ambos 39)."),
    ("MagnaAngemon", "Ultimate/Perfect", "Patamon", 39, "E", 6, None),
    ("Seraphimon", "Mega/Ultimate", "Patamon", 39, "E", 15,
     "Igual ao Ultimate da linha (MagnaAngemon=39): segundo caso observado de teto de legibilidade Mega=Ultimate."),

    # ---- 20 common wild Digimon (all Digimon World DS roster) ----
    ("Numemon", "Rookie/Child", "wild", 23, "E", 15, None),
    ("Gizamon", "Rookie/Child", "wild", 24, "H", 1, "Cluster de confianca baixa (n=1); valor plausivel (faixa Rookie comum 22-29) mas nao confirmado por repeticao."),
    ("Betamon", "Rookie/Child", "wild", 24, "E", 9, None),
    ("Goburimon", "Rookie/Child", "wild", 27, "H", 1, "Cluster de confianca baixa (n=1); valor plausivel, nao confirmado por repeticao."),
    ("Vegiemon", "Rookie/Child", "wild", 28, "E", 15, None),
    ("Floramon", "Rookie/Child", "wild", 27, "E", 16, None),
    ("Gotsumon", "Rookie/Child", "wild", 28, "H", 3, "Cluster abaixo do limiar de confianca (n=3); valor plausivel, mantido como leitura de referencia."),
    ("Otamamon", "Rookie/Child", "wild", 22, "E", 5, None),
    ("Bakemon", "Champion/Adult", "wild", 22, "E", 15,
     "Nota: Bakemon e Champion no anime/card game mas aparece com porte visual proximo de Rookie nesta folha do DW DS; mantido o valor medido."),
    ("Kuwagamon", "Champion/Adult", "wild", 40, "E", 6,
     "Consistente com a reputacao do Kuwagamon no canone (inseto gigante, celebre por ser desproporcionalmente grande ja no primeiro encontro do anime)."),
    ("Monzaemon", "Champion/Adult", "wild", 37, "E", 15, None),
    ("Sukamon", "Rookie/Child", "wild", 22, "E", 7, None),
    ("Gekomon", "Rookie/Child", "wild", 27, "E", 10, None),
    ("Hagurumon", "Rookie/Child", "wild", 23, "E", 14, None),
    ("Divermon", "Rookie/Child", "wild", 28, "E", 7, None),
    ("Kamemon", "Rookie/Child", "wild", 24, "H", 1, "Cluster de confianca baixa (n=1); valor plausivel, nao confirmado por repeticao."),
    ("Dracmon", "Rookie/Child", "wild", 26, "H", 4,
     "Leitura automatica (h=66,n=4) rejeitada por inspecao: implausivel para um Rookie pequeno tipo duende (maior que todos os Champions medidos). Valor estimado pela media dos Rookies comuns confirmados (faixa 22-29)."),
    ("Mamemon", "Ultimate/Perfect", "wild", 12, "E", 15,
     "Nota: nivel de evolucao Ultimate no jogo, mas o sprite de mapa mede proporcao muito compacta (menor que todos os In-Training medidos). Alta confianca estatistica (n=15) sustenta o numero; registrar como peculiaridade de design da folha, nao erro de medicao - Mamemon e desenhado como criatura atarracada/arredondada mesmo em estagio avancado."),
    ("Raremon", "Champion/Adult", "wild", 33, "E", 5, None),
    ("Airdramon", "Champion/Adult", "wild", 37, "E", 13, None),
]

CLASS_BANDS = [
    (0.55, "XS"),
    (0.80, "S"),
    (1.05, "M"),
    (1.30, "L"),
    (1.50, "XL"),
    (float("inf"), "XXL"),
]


def body_class(ratio):
    for upper, label in CLASS_BANDS:
        if ratio < upper:
            return label
    return "XXL"


def main():
    out_rows = []
    for name, stage, line, px, tag, n, note in ROWS:
        ratio = round(px / TAMER_PX_RAW, 3)
        target_px = round(ratio * TAMER_PX_TARGET)
        out_rows.append({
            "name": name,
            "stage": stage,
            "line": line,
            "walk_sprite_px_dwds": px,
            "tamer_ratio": ratio,
            "body_class": body_class(ratio),
            "target_height_px_tile32": target_px,
            "evidence": tag,
            "cluster_members": n,
            "note": note,
        })

    payload = {
        "meta": {
            "generated": "2026-11-08",
            "project": "GS-003",
            "method": "pure-python PNG decode + chroma-key blob detection over Digimon World DS (dgmnworldds) overworld/map sprite sheets; see tools/size_research/*.py",
            "tamer_baseline_px_dwds": TAMER_PX_RAW,
            "tamer_baseline_source": "spriters-resource dgmnworldds__arrow-drop-down__Hero__48323.png, cluster n=85 (highest-confidence reading in the dataset)",
            "tamer_reference_px_target": TAMER_PX_TARGET,
            "tile_px": TILE_PX,
            "evidence_legend": {
                "E": "medicao automatica (proxy empirico) com cluster >=4 membros e valor plausivel",
                "H": "hipotese / correcao manual - ver campo note",
            },
        },
        "rows": out_rows,
    }

    out_path = "/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/research/DIGIMON_SIZE_TABLE.json"
    with open(out_path, "w") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
    print(f"wrote {out_path} with {len(out_rows)} rows")


if __name__ == "__main__":
    main()
