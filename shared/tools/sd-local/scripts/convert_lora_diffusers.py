"""Renomeia um LoRA SD1.5 no formato antigo do diffusers (attn processors) para o formato kohya que o
ComfyUI carrega. Só troca nomes de chave; tensores ficam idênticos (sem alpha => escala 1.0, igual ao diffusers).

  unet.down_blocks.0.attentions.0.transformer_blocks.0.attn1.to_k.lora.down.weight
  -> lora_unet_down_blocks_0_attentions_0_transformer_blocks_0_attn1_to_k.lora_down.weight

Uso: .venv/bin/python scripts/convert_lora_diffusers.py IN.safetensors OUT.safetensors
"""
import sys
from safetensors.torch import load_file, save_file

src, dst = sys.argv[1], sys.argv[2]
sd = load_file(src)
out = {}
for k, v in sd.items():
    prefix, rest = k.split(".", 1)
    if prefix not in ("unet", "text_encoder"):
        raise SystemExit(f"chave inesperada: {k}")
    for kind in ("down", "up"):
        suffix = f".lora.{kind}.weight"
        if rest.endswith(suffix):
            base = rest[: -len(suffix)].replace(".", "_")
            tag = "lora_unet_" if prefix == "unet" else "lora_te_"
            out[f"{tag}{base}.lora_{kind}.weight"] = v.contiguous()
            break
    else:
        raise SystemExit(f"chave inesperada: {k}")
assert len(out) == len(sd)
save_file(out, dst, metadata={"converted_from": src.rsplit("/", 1)[-1], "format": "pt"})
print(f"{len(out)} chaves -> {dst}")
