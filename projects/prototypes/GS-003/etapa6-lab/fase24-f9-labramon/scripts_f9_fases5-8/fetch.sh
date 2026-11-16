#!/bin/bash
# fetch.sh <tag> — baixa o ZIP do personagem e extrai em dl/<tag>
set -e
cd "$(dirname "$0")/.."
curl -sSfL -o dl/$1.zip "https://api.pixellab.ai/mcp/characters/e7b2c58f-6ea0-4a49-bab1-7b2ecaa2052d/download"
rm -rf dl/$1 && mkdir dl/$1 && python3 -I -c "
import zipfile,sys;zipfile.ZipFile('dl/$1.zip').extractall('dl/$1')"
ls dl/$1/Idle/animations/
