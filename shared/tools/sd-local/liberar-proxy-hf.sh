#!/usr/bin/env bash
# Complemento do liberar-proxy.sh: CDNs do Hugging Face para baixar os modelos (posições [13]..[15]).
set -euo pipefail
i=13
for h in us.aws.cdn.hf.co us.gcp.cdn.hf.co cdn-lfs-us-1.hf.co; do
  openclaw config set "secrets.egressProxy.allowedHosts[$i]" "$h"
  i=$((i+1))
done
openclaw config get secrets.egressProxy.allowedHosts | grep -c REDACTED
echo "Reiniciando o Gateway (as conversas caem por ~1 min)..."
openclaw gateway restart
