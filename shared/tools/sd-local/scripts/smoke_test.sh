#!/usr/bin/env bash
# Gera os 4 sprites de teste, registra tempo e VRAM em samples/results.jsonl e para o ComfyUI no fim.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
PY=.venv/bin/python
trap 'scripts/stop.sh' EXIT
scripts/start.sh
: > samples/results.jsonl
# 1ª chamada inclui carga do modelo (cold); as demais medem o tempo quente.
$PY scripts/gen.py "red health potion in a glass bottle with cork, rpg item icon" --size 32 --palette endesga32 --transparent --seed 101 --out samples/potion.png | tee -a samples/results.jsonl
$PY scripts/gen.py "wooden treasure chest with gold trim, closed, rpg item, front view" --size 32 --palette endesga32 --transparent --seed 202 --out samples/chest.png | tee -a samples/results.jsonl
$PY scripts/gen.py "pixel art, seamless grass ground tile, top-down view, 16-bit game tileset, small flowers, tileable texture" --no-style --neg "object, character, white background" --size 32 --palette endesga32 --seed 303 --out samples/grass_tile.png | tee -a samples/results.jsonl
$PY scripts/gen.py "chibi adventurer character, full body, front view, standing, big head, small body, game sprite" --gen 512x768 --size 32x48 --palette endesga32 --transparent --seed 404 --out samples/chibi_hero.png | tee -a samples/results.jsonl
