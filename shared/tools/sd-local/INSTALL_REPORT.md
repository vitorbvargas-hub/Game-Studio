# INSTALL_REPORT — sd-local (ComfyUI + SD1.5 local)

Data: 2026-11-09 · Máquina: WSL2, RTX 2060 6 GB, 7,7 GB RAM WSL (+2 GB swap), driver 610.57 (CUDA UMD 13.3)

## Resultado por etapa

| Etapa | Status | Evidência |
|---|---|---|
| install | **OK** | [E] `install.log`: torch 2.15.0+cu132, `cuda.is_available(): True`, RTX 2060 cap (7, 5) |
| modelos | **OK** | [E] `models.log`: SD1.5 (4,0 GiB) + LoRA (3,1 MB) baixados só por `huggingface.co` → `us.aws.cdn.hf.co`. Nenhum outro host bloqueado apareceu. SHA-256 em `models.sha256` **conferem** com o `lfs.oid` da API de árvore do HF nas revisões fixadas |
| start | **OK** | [E] ComfyUI 0.44.0 (commit `fca60fe`) em `127.0.0.1:8188` (só loopback), `NORMAL_VRAM`, cuda:0 RTX 2060 |
| smoke test (4 sprites) | **OK, com LoRA** | [E] `logs/smoke.log`, `samples/results.jsonl`: 0 avisos `lora key not loaded` na rodada final |
| stop | **OK** | [E] `ComfyUI parado (288515)`. Nenhum `main.py` rodando e `:8188` não responde. **Servidor parado** |

## Smoke test — números (rodada final, com LoRA)

Parâmetros padrão do `gen.py`: 25 passos, dpmpp_2m, cfg 7, LoRA 0,9, paleta endesga32.

| Sprite | Gerado em | Final | Tempo total* | Tempo GPU** | Pico VRAM (GPU inteira) |
|---|---|---|---|---|---|
| poção | 512×512 | 32×32 | 22,5 s (frio: inclui carga do modelo) | 19,2 s | 4 452 MiB |
| baú | 512×512 | 32×32 | 4,5 s | 4,0 s | 4 455 MiB |
| tile de grama | 512×512 | 32×32 | 4,1 s | 3,8 s | 4 453 MiB |
| chibi | 512×768 | 32×48 | 8,9 s | 5,5 s | 4 872 MiB |

\* `seconds` do `gen.py` (envio → imagem pronta). \*\* `Prompt executed in` do log do ComfyUI.

- **VRAM** [E]: o baseline antes do ComfyUI era ~1,2 GB, usados pelo desktop do Windows. O ComfyUI soma ~3,2–3,7 GB, com pico de 4,87 de 6 GB no 512×768. Sobram ~1,2 GB. 768×768 ou batch>1 [H] devem apertar.
- **RAM do WSL** [E] (`scripts/memwatch.sh`, 1 amostra/s, `logs/mem_smoke.csv`): usada 2,6 GB antes → **pico 6,1 GB** de 7,7 GB, com mínimo de 1,77 GB disponível. Swap 386 → 440 MB. O pico é a carga do checkpoint fp32 de 4 GB. Cabe, mas com pouca folga. SDXL (6,9 GB) [H] quase certamente não cabe sem mais RAM no `.wslconfig`.
- Throughput quente [E]: ~4 s por sprite 512² e ~6–9 s por 512×768.

## Caminhos dos 4 sprites (rodada final, com LoRA)

| Sprite | Original SD (512 px) | Pixelizado (tamanho real) | Preview 8× |
|---|---|---|---|
| poção | `samples/potion_raw.png` | `samples/potion.png` (32×32, 23 cores) | `samples/potion_x8.png` |
| baú | `samples/chest_raw.png` | `samples/chest.png` (32×32, 19 cores) | `samples/chest_x8.png` |
| grama | `samples/grass_tile_raw.png` | `samples/grass_tile.png` (32×32, 13 cores) | `samples/grass_tile_x8.png` |
| chibi | `samples/chibi_hero_raw.png` | `samples/chibi_hero.png` (32×48, 26 cores) | `samples/chibi_hero_x8.png` |

Base absoluta: `~/projects/GameStudio/shared/tools/sd-local/`. Comparativo: `samples/contact_sheet.png` (linha 1: originais com LoRA, linha 2: pixelizados com LoRA, linha 3: pixelizados **sem** LoRA, da rodada 1 em `samples/run1_sem_lora/`).

## Avaliação visual [H, olho humano/agente, não medida]

- **chibi**: o melhor resultado. Silhueta legível, contorno escuro, quase usável como rascunho.
- **baú**: bom volume e paleta. O prompt pedia "closed" e o baú saiu **aberto**.
- **poção**: saiu uma garrafa de vinho sem rolha. O fundo bege irregular deixou **resíduos soltos** depois do `--transparent` (um frasco-fantasma à esquerda). Precisa de limpeza manual ou de outro seed.
- **grama**: textura ruidosa com motivo vermelho repetido. Não foi testado se é tileável. Inutilizável como tile sem retrabalho.
- Sem LoRA (rodada 1), baú e chibi ficam claramente piores (chibi deformado). **O LoRA é necessário.**

## Correções feitas durante a instalação

1. **Índice do torch**: o padrão de `install.sh` agora é o PyPI. O índice cu128 redireciona para `pypi.nvidia.com`, que está bloqueado.
2. **`--normalvram`** foi removido do ComfyUI atual. `start.sh` agora passa a flag vazia por padrão.
3. **LoRA não carregava em silêncio**: o arquivo da SedatAl usa chaves diffusers antigas (`unet.….lora.down.weight`) e o ComfyUI ignorava todas as 256 (`lora key not loaded`). A 1ª rodada do smoke test saiu **sem LoRA**. Criei `scripts/convert_lora_diffusers.py` (só renomeia para `lora_unet_*`, tensores idênticos, sem alpha = escala 1,0 como no diffusers) e gerei `pixelart-sedatal-sd15-comfy.safetensors`. `download_models.sh` chama a conversão e o `gen.py` usa esse arquivo por padrão. A rodada final teve 0 avisos. [H] O arquivo convertido é derivado e continua sob CreativeML OpenRAIL-M.
4. Novo `scripts/memwatch.sh` (RAM/VRAM a cada 1 s, CSV).
5. A instalação interrompida foi retomada sem apagar nada. Logs anteriores ficaram em `install.log.attempt1` e `models.log.attempt1`.

## Disco

`.venv` 6,8 GB · modelos 4,0 GB · `ComfyUI/` 81 MB · `.tools/` 243 MB (o cache do uv pode ser limpo com `UV_CACHE_DIR=.tools/uv-cache .tools/uv cache clean`; não limpei).

## Limitações / não verificado

- Uma rodada só, com um seed por sprite. Não há estatística de qualidade nem teste de consistência entre sprites, poses ou frames de animação.
- O tile não foi testado quanto a ser tileável. O `--transparent` falha com fundo não liso.
- A VRAM medida é da GPU inteira (inclui o Windows). O pico de 1 s do `memwatch` (3,8 GB) é menor que o do `gen.py` (amostra a 0,25 s). Vale o do `gen.py`.
- Hosts `us.gcp.cdn.hf.co` / `cdn-lfs-us-1.hf.co` seguem bloqueados. Não foram necessários hoje, mas [H] outro arquivo/região do HF pode cair neles.
