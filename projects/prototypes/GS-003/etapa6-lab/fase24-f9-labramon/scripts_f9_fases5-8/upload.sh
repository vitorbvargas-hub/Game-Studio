#!/bin/bash
# upload.sh <upload_url> file... -> imprime JSON array de refs
U="$1"; shift; out="["; for f in "$@"; do r=$(curl -sS -F "file=@$f" "$U" | python3 -I -c "import sys,json;print(json.load(sys.stdin)['ref'])"); out="$out\"$r\","; done; echo "${out%,}]"
