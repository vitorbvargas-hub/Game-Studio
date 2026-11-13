#!/usr/bin/env python3
"""Monta os arquivos finais de 03_PROPOSTAS/ a partir das fontes em _build/.

Uso (Python 3 stdlib, sem dependências):
    python3 -I _build/assemble.py           # (re)gera os 15 arquivos finais e imprime md5
    python3 -I _build/assemble.py --check   # só confere se os finais batem com as fontes (exit 1 se não)

Regras de montagem (Etapa 5, Fase 1, 2026-11-13):
- <agente>/AGENTS.md = título + linha de versão + common_top.md + <agente>_body.md
  (+ common_specialist_bottom.md para os 6 especialistas; o game-studio tem §7–§8 próprios no body).
- <agente>/SOUL.md   = título + <agente>_soul.md + common_soul_bottom.md
- shared/DIGITAL_ODYSSEY_CONTEXT.md = shared_DIGITAL_ODYSSEY_CONTEXT.md (cópia literal; o cabeçalho
  de versão e precedência está na própria fonte).
Os arquivos finais não levam cabeçalho de "proposta": são implantados como estão (Fase 3).
"""
import hashlib
import pathlib
import sys

BUILD = pathlib.Path(__file__).resolve().parent
OUT = BUILD.parent

VERSION_LINE = (
    "> Digital Odyssey · v1.0 · 2026-11-13 (Etapa 5). "
    "Contexto comum obrigatório: `~/projects/GameStudio/shared/knowledge/DIGITAL_ODYSSEY_CONTEXT.md`."
)

AGENTS = {
    # id: (nome no título do SOUL, subtítulo do AGENTS)
    "game-studio": ("Game Studio", "coordenador e Game Director"),
    "game-research": ("Game Research", "universo Digimon, fontes e Database"),
    "game-design": ("Game Design", "sistemas, mecânicas, UX e World Design"),
    "game-art": ("Game Art", "direção de arte, sprites, animações e cenários"),
    "game-dev": ("Game Dev", "arquitetura, desenvolvimento e integração"),
    "game-qa": ("Game QA", "qualidade, testes e homologação técnica"),
    "game-growth": ("Game Growth", "Digital Odyssey Marketing & Community Lead (Nível 1 ativo)"),
}
COORDINATOR = "game-studio"


def src(name: str) -> str:
    text = (BUILD / name).read_text(encoding="utf-8")
    return text.rstrip("\n") + "\n"


def build() -> dict:
    out = {}
    top = src("common_top.md")
    bottom = src("common_specialist_bottom.md")
    soul_bottom = src("common_soul_bottom.md")
    for agent, (name, subtitle) in AGENTS.items():
        parts = [f"# AGENTS.md — {name} — {subtitle}\n\n{VERSION_LINE}\n", top, src(f"{agent}_body.md")]
        if agent != COORDINATOR:
            parts.append(bottom)
        out[f"{agent}/AGENTS.md"] = "\n".join(parts)
        out[f"{agent}/SOUL.md"] = "\n".join([f"# SOUL.md — {name}\n", src(f"{agent}_soul.md"), soul_bottom])
    out["shared/DIGITAL_ODYSSEY_CONTEXT.md"] = src("shared_DIGITAL_ODYSSEY_CONTEXT.md")
    return out


def main() -> int:
    check = "--check" in sys.argv[1:]
    files = build()
    bad = 0
    for rel, text in files.items():
        path = OUT / rel
        data = text.encode("utf-8")
        if check:
            ok = path.exists() and path.read_bytes() == data
            bad += 0 if ok else 1
            print(("OK   " if ok else "DIFF ") + rel)
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
            print(f"{hashlib.md5(data).hexdigest()}  {rel}")
    if check:
        print(f"{len(files) - bad}/{len(files)} iguais às fontes")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
