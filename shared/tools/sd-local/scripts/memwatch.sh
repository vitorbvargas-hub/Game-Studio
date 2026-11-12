#!/usr/bin/env bash
# Amostra RAM do WSL (free -m) e VRAM total (nvidia-smi) a cada 1 s até ser morto.
# Uso: scripts/memwatch.sh logs/mem.csv &   — colunas: epoch,ram_used_mib,ram_avail_mib,swap_used_mib,vram_used_mib
OUT="${1:-logs/mem.csv}"
echo "epoch,ram_used_mib,ram_avail_mib,swap_used_mib,vram_used_mib" > "$OUT"
while :; do
  read -r used avail < <(free -m | awk '/^Mem:/{print $3, $7}')
  swap=$(free -m | awk '/^Swap:/{print $3}')
  vram=$(/usr/lib/wsl/lib/nvidia-smi --query-gpu=memory.used --format=csv,noheader,nounits 2>/dev/null | head -1)
  echo "$(date +%s),$used,$avail,$swap,${vram:-NA}" >> "$OUT"
  sleep 1
done
