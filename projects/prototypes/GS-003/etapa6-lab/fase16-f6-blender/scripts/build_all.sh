#!/usr/bin/env bash
# F6: reproduz tudo. Uso: scripts/build_all.sh   (a partir de fase16-f6-blender/)
set -e
cd "$(dirname "$0")/.."
B=~/projects/GameStudio/assets/tools/blender/run_blender.sh
rm -rf raw pacote_agumon_f6
"$B" -b --factory-startup --python scripts/agumon_blender.py -- "$PWD/raw" ${1:-} 2>&1 | grep -E "F6_OK|Traceback|line |^[A-Za-z]*Error:" || true
python3 scripts/pixelize.py raw pacote_agumon_f6
