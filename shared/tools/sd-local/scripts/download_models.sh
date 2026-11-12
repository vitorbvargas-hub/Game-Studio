#!/usr/bin/env bash
# Baixa SOMENTE modelos públicos, não-gated, sem token. Fontes/licenças em ../MODELS.md.
# Downloads retomáveis (-C -) com retries; revisões fixadas por commit para reprodutibilidade.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CK="$ROOT/ComfyUI/models/checkpoints"; LO="$ROOT/ComfyUI/models/loras"
mkdir -p "$CK" "$LO"

dl() { # url dest
  local url="$1" dest="$2" n=0
  [ -s "$dest" ] && [ ! -f "$dest.part" ] && { echo "ok (já existe) $dest"; return; }
  until curl -fL --retry 10 --retry-all-errors --connect-timeout 30 -C - -o "$dest.part" "$url"; do
    n=$((n+1)); [ $n -ge 8 ] && { echo "FALHOU $url" >&2; return 1; }; sleep $((n*15))
  done
  mv "$dest.part" "$dest"; echo "ok $dest ($(du -h "$dest" | cut -f1))"
}

HF=https://huggingface.co
# SD 1.5 (CreativeML OpenRAIL-M) — ~4.3 GB, fp32 emaonly; ComfyUI carrega em fp16 na GPU
dl "$HF/stable-diffusion-v1-5/stable-diffusion-v1-5/resolve/451f4fe16113bff5a5d2269ed5ad43b0592e9a14/v1-5-pruned-emaonly.safetensors" \
   "$CK/sd15-v1-5-pruned-emaonly.safetensors"
# LoRA pixel art SD1.5 (CreativeML OpenRAIL-M) — formato diffusers; ComfyUI LoraLoader aceita
dl "$HF/SedatAl/pixel-art-LoRa/resolve/54ed39696bebc825817a6d9dc630dd4c50edc813/pytorch_lora_weights.safetensors" \
   "$LO/pixelart-sedatal-sd15.safetensors"

# O arquivo acima usa chaves diffusers antigas (unet.*.lora.down.weight) que o ComfyUI ignora em silêncio
# ("lora key not loaded"). Gera a cópia com nomes kohya, que é a usada por padrão no gen.py.
"$ROOT/.venv/bin/python" "$ROOT/scripts/convert_lora_diffusers.py" \
   "$LO/pixelart-sedatal-sd15.safetensors" "$LO/pixelart-sedatal-sd15-comfy.safetensors"

if [ "${WITH_SDXL:-0}" = 1 ]; then
  # Opcional — ver MODELS.md: ~6.9 GB; com 7 GB de RAM no WSL o carregamento é arriscado.
  dl "$HF/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_base_1.0.safetensors" "$CK/sdxl-base-1.0.safetensors"
  dl "$HF/nerijs/pixel-art-xl/resolve/main/pixel-art-xl.safetensors" "$LO/pixel-art-xl.safetensors"
fi
(cd "$ROOT/ComfyUI/models" && sha256sum checkpoints/*.safetensors loras/*.safetensors) | tee "$ROOT/models.sha256"
