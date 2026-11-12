#!/usr/bin/env bash
# Instala ComfyUI + venv próprio + PyTorch CUDA dentro de shared/tools/sd-local/.
# Sem sudo/apt. Idempotente. Retries agressivos (rede instável).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
# PyPI padrão: torch cu13x com libs NVIDIA em files.pythonhosted.org. O índice download.pytorch.org/whl/cu128
# redireciona as libs para pypi.nvidia.com (fora da allowlist do proxy). Driver WSL suporta CUDA 13.3; sm_75 ok.
TORCH_INDEX="${TORCH_INDEX:-https://pypi.org/simple}"
export UV_HTTP_TIMEOUT=120 UV_HTTP_RETRIES=8 UV_CACHE_DIR="$ROOT/.tools/uv-cache"

retry() { local n=0; until "$@"; do n=$((n+1)); [ $n -ge 6 ] && return 1; echo "retry $n: $*" >&2; sleep $((n*10)); done; }

# 1) uv standalone local (o python do sistema não tem pip/ensurepip)
if [ ! -x .tools/uv ]; then
  mkdir -p .tools
  retry curl -fL --retry 8 --retry-all-errors --connect-timeout 30 -o .tools/uv.tgz \
    https://github.com/astral-sh/uv/releases/latest/download/uv-x86_64-unknown-linux-gnu.tar.gz
  tar -xzf .tools/uv.tgz -C .tools --strip-components=1
  rm -f .tools/uv.tgz
fi
UV="$ROOT/.tools/uv"

# 2) ComfyUI (shallow clone)
if [ ! -d ComfyUI/.git ]; then
  retry git clone --depth 1 https://github.com/comfyanonymous/ComfyUI.git ComfyUI
fi
git -C ComfyUI log -1 --format='ComfyUI commit %h (%cs)'

# 3) venv + torch CUDA + deps
[ -d .venv ] || "$UV" venv .venv --python 3.12
PY="$ROOT/.venv/bin/python"
retry "$UV" pip install --python "$PY" torch torchvision torchaudio --index-url "$TORCH_INDEX"
retry "$UV" pip install --python "$PY" -r ComfyUI/requirements.txt
retry "$UV" pip install --python "$PY" pillow numpy

# 4) Verificação
"$PY" - <<'EOF'
import torch
print("torch", torch.__version__, "cuda build", torch.version.cuda)
ok = torch.cuda.is_available()
print("cuda.is_available():", ok)
if ok:
    print("device:", torch.cuda.get_device_name(0), "cap", torch.cuda.get_device_capability(0))
raise SystemExit(0 if ok else 1)
EOF
