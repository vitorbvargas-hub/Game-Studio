# MODELS.md — modelos do gerador local (sd-local)

Status em 2026-11-09 (tarde): **os dois modelos foram baixados**, com SHA-256 conferidos contra o HF (`models.sha256`). O LoRA precisa da cópia convertida `pixelart-sedatal-sd15-comfy.safetensors` (ver `INSTALL_REPORT.md`). Os metadados abaixo vieram da API pública do Hugging Face, consultada em 2026-11-09 via `web_fetch`.

Critérios: arquivo público, `gated: false`, sem login/token, licença declarada no model card. Revisões fixadas por commit em `scripts/download_models.sh`.

| Papel | Modelo | Arquivo | Revisão (commit) | Licença | Gated | Verificado |
|---|---|---|---|---|---|---|
| Checkpoint base | [stable-diffusion-v1-5/stable-diffusion-v1-5](https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5) | `v1-5-pruned-emaonly.safetensors` (~4,3 GB) | `451f4fe16113bff5a5d2269ed5ad43b0592e9a14` | CreativeML OpenRAIL-M | não | [E] API HF, 2026-11-09 |
| LoRA pixel art (padrão) | [SedatAl/pixel-art-LoRa](https://huggingface.co/SedatAl/pixel-art-LoRa) | `pytorch_lora_weights.safetensors` | `54ed39696bebc825817a6d9dc630dd4c50edc813` | CreativeML OpenRAIL-M | não | [E] API HF, 2026-11-09 |

## Notas de licença

- **CreativeML OpenRAIL-M** [E]: permite uso comercial das imagens geradas. Inclui restrições de uso (Anexo A: nada ilegal, nada que cause dano etc.) que se propagam para redistribuições do modelo. Não redistribuímos pesos (estão no `.gitignore`).
- O LoRA da SedatAl foi treinado no dataset `jainr3/diffusiondb-pixelart`, conforme o model card [E]. Esse dataset é composto de imagens geradas pelo próprio SD a partir de prompts do DiffusionDB. [H] O risco de proveniência é baixo, mas não é zero: alguns prompts do DiffusionDB citam artistas ou IPs. **Nunca use nomes de artistas, franquias ou marcas nos prompts** (regra do estúdio).
- Base SD 1.5 [H]: a proveniência do LAION-5B é discutida publicamente. Para assets comerciais, trate as saídas como rascunho/base e faça revisão humana antes do uso final.

## Alternativas avaliadas (não baixadas)

| Modelo | Base | Licença | Motivo de não ser padrão |
|---|---|---|---|
| [artificialguybr/pixelartredmond-1-5v…](https://huggingface.co/artificialguybr/pixelartredmond-1-5v-pixel-art-loras-for-sd-1-5) (`PixelArtRedmond15V-PixelArt-PIXARFK.safetensors`, commit `eb7c3bf…`) | SD 1.5 | "bespoke" no estilo Civitai: `allowCommercialUse=Rent`, `allowDerivatives=True`, `allowDifferentLicense=False` | [H] Provavelmente tem mais qualidade, mas a licença é ambígua para venda de imagens geradas. Precisa de leitura jurídica antes de usar comercialmente. Gatilho: `PixArFK` |
| [nerijs/pixel-art-xl](https://huggingface.co/nerijs/pixel-art-xl) | SDXL | CreativeML OpenRAIL-M, não gated | Opcional (`WITH_SDXL=1`). [H] SDXL base (~6,9 GB) + 7 GB de RAM no WSL = risco real de OOM/swap no carregamento. Testar só depois do SD1.5 funcionar e com `COMFY_VRAM_FLAG=--lowvram` |
| Civitai (vários) | — | variam | Muitos downloads exigem conta/token: **não usados**, conforme o escopo aprovado |
