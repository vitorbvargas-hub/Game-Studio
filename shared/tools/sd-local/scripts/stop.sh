#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PIDF="$ROOT/logs/comfyui.pid"
[ -f "$PIDF" ] || { echo "sem pidfile; nada a parar"; exit 0; }
PID="$(cat "$PIDF")"
if kill -0 "$PID" 2>/dev/null; then kill "$PID"; sleep 3; kill -0 "$PID" 2>/dev/null && kill -9 "$PID"; echo "ComfyUI parado ($PID)"; fi
rm -f "$PIDF"
