#!/usr/bin/env bash
# Sobe ComfyUI SOMENTE em loopback (127.0.0.1:8188). Uso: scripts/start.sh [--fg]
# Parar: scripts/stop.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${PORT:-8188}"
mkdir -p "$ROOT/logs"
ARGS=(main.py --listen 127.0.0.1 --port "$PORT" --disable-auto-launch
      --output-directory "$ROOT/samples/raw"
      ${COMFY_VRAM_FLAG:-})   # vazio = auto (--normalvram foi removido do ComfyUI); COMFY_VRAM_FLAG=--lowvram para SDXL
cd "$ROOT/ComfyUI"
if [ "${1:-}" = "--fg" ]; then exec "$ROOT/.venv/bin/python" "${ARGS[@]}"; fi
nohup "$ROOT/.venv/bin/python" "${ARGS[@]}" > "$ROOT/logs/comfyui.log" 2>&1 &
echo $! > "$ROOT/logs/comfyui.pid"
for i in $(seq 1 90); do
  curl -sf --noproxy '*' "http://127.0.0.1:$PORT/system_stats" >/dev/null && { echo "ComfyUI up em http://127.0.0.1:$PORT (pid $(cat "$ROOT/logs/comfyui.pid"))"; exit 0; }
  sleep 2
done
echo "ComfyUI não respondeu; veja logs/comfyui.log" >&2; exit 1
