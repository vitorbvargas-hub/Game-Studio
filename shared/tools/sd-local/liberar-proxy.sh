#!/usr/bin/env bash
# Libera TEMPORARIAMENTE os hosts necessários para instalar o Stable Diffusion local.
# Mantém o host que já existe na posição [0] e acrescenta os novos a partir de [1].
# Rodar como o usuário que roda o OpenClaw:  bash liberar-proxy.sh
set -euo pipefail
HOSTS=(
  github.com codeload.github.com objects.githubusercontent.com raw.githubusercontent.com
  pypi.org files.pythonhosted.org download.pytorch.org download-r2.pytorch.org
  huggingface.co cdn-lfs.huggingface.co cdn-lfs.hf.co cas-bridge.xethub.hf.co
)
i=1
for h in "${HOSTS[@]}"; do
  openclaw config set "secrets.egressProxy.allowedHosts[$i]" "$h"
  i=$((i+1))
done
echo "Lista atual (o primeiro item continua oculto, é o host que já existia):"
openclaw config get secrets.egressProxy.allowedHosts
echo "Reiniciando o Gateway (as conversas caem por ~1 min)..."
openclaw gateway restart
