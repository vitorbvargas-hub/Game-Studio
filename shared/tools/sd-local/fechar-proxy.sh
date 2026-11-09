#!/usr/bin/env bash
# Desfaz liberar-proxy.sh (+ liberar-proxy-hf.sh): remove os hosts temporários e mantém o [0] original.
set -euo pipefail
n=$(openclaw config get secrets.egressProxy.allowedHosts | grep -c REDACTED)
for i in $(seq $((n-1)) -1 1); do
  openclaw config unset "secrets.egressProxy.allowedHosts[$i]"
done
openclaw config get secrets.egressProxy.allowedHosts
openclaw gateway restart
