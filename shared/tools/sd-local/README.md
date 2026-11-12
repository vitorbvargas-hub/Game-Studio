# sd-local — gerador de pixel art local (Stable Diffusion via ComfyUI)

Alternativa gratuita e offline ao PixelLab. Roda na RTX 2060 6 GB desta máquina (WSL2).

## Status (2026-11-09, tarde): FUNCIONANDO. Instalado, modelos baixados, smoke test de 4 sprites OK (~4 s/sprite 512²). Ver `INSTALL_REPORT.md`, que substitui o histórico abaixo.

### Histórico (manhã de 2026-11-09)

- [E] 2026-11-09: todo tráfego HTTPS de shell passa por um proxy de egress do OpenClaw (`HTTPS_PROXY`). Esse proxy responde `403` a `CONNECT` para **qualquer** host fora da allowlist: `github.com`, `pypi.org`, `huggingface.co`, `download.pytorch.org` e até `example.com`. Mensagem do proxy: *"Host … is not in the secret egress proxy traffic allowlist. Add it to secrets.egressProxy.allowedHosts …, then restart the Gateway."*
- Liberar isso exige alterar a config do OpenClaw/Gateway, o que está **fora do escopo deste agente**. Por isso **nada foi instalado nem baixado**. Não há ComfyUI, venv, torch, modelos nem samples.
- [E] Não existe torch, Pillow, pip/ensurepip nem pesos `.safetensors` locais aproveitáveis (busca feita em 2026-11-09).
- Ainda não há números de tempo/imagem, VRAM nem qualidade. Todos dependem do desbloqueio.

### Para desbloquear (decisão do fundador/coordenador)

Hosts a liberar em `secrets.egressProxy.allowedHosts`. Os redirecionamentos de CDN estão marcados com [H]: confirme pelo log do proxy na primeira tentativa.

| Uso | Hosts |
|---|---|
| ComfyUI + uv | `github.com`, `codeload.github.com`, [H] `release-assets.githubusercontent.com`, `objects.githubusercontent.com` |
| PyTorch CUDA | `download.pytorch.org`, [H] `download-r2.pytorch.org` |
| Dependências Python | `pypi.org`, `files.pythonhosted.org` |
| Modelos | `huggingface.co`, [H] `cdn-lfs.hf.co`, `cdn-lfs-us-1.hf.co`, `cas-bridge.xethub.hf.co`, `transfer.xethub.hf.co` |

Volume estimado [H]: torch+CUDA ≈ 3 GB, deps ≈ 0,5 GB, SD1.5 4,3 GB, LoRA < 0,2 GB.

Depois de liberar, a instalação é retomável e tem retries:

```bash
cd ~/projects/GameStudio/shared/tools/sd-local
scripts/install.sh          # uv local + clone ComfyUI + venv + torch cu128; falha se cuda.is_available() != True
scripts/download_models.sh  # SD1.5 + LoRA pixel art (revisões fixadas), grava models.sha256
scripts/smoke_test.sh       # sobe ComfyUI, gera os 4 sprites, grava samples/results.jsonl, PARA o ComfyUI
```

## Estrutura

```
sd-local/
  .gitignore          # exclui ComfyUI/, .venv/, .tools/, pesos, logs, samples/raw/
  MODELS.md           # fonte, URL, commit, licença e data de cada modelo
  scripts/
    install.sh        # sem sudo/apt; uv standalone em .tools/ (o python do sistema não tem pip)
    download_models.sh# curl -C - com retries; WITH_SDXL=1 para o opcional SDXL
    start.sh          # ComfyUI em 127.0.0.1:8188 (só loopback), em background; --fg para foreground
    stop.sh           # para pelo pidfile em logs/
    gen.py            # prompt -> API HTTP do ComfyUI -> pixelize; mede tempo e pico de VRAM
    pixelize.py       # downscale para grade real + quantização de paleta + alpha binário
    smoke_test.sh     # os 4 sprites de teste (poção, baú, tile de grama 32x32, chibi 32x48)
  samples/            # saídas finais (raw intermediário vai para samples/raw/, ignorado)
```

## Uso (depois de instalado)

```bash
scripts/start.sh
.venv/bin/python scripts/gen.py "blue mana potion, round flask, rpg item icon" \
    --size 32 --palette endesga32 --transparent --seed 7 --out samples/mana.png
scripts/stop.sh
```

Cada geração grava `X.png` (sprite final no tamanho real), `X_x8.png` (preview ampliado em nearest) e `X_raw.png` (saída SD 512px). No stdout sai um JSON com `seconds`, `seed`, `vram_baseline_mib` e `vram_peak_mib`. O VRAM medido é o da GPU inteira via `nvidia-smi` e inclui o desktop do Windows; subtraia o baseline.

Opções úteis:

- `--palette`: `pico8`, `gb`, `endesga32`, arquivo `.hex` do Lospec (uma cor por linha) ou `k<N>` (N cores automáticas, padrão `k16`). Para manter a consistência visual de um jogo, use **sempre o mesmo `.hex` do projeto**.
- `--size 32x48`: tamanho final não quadrado. Combine com `--gen 512x768` para manter a proporção.
- `--transparent`: remove o fundo por flood-fill a partir da cor das bordas. Funciona bem com fundo liso, e por isso o sufixo de estilo pede "plain white background". **Não use em tiles.**
- `--no-style`: desliga o sufixo de estilo automático (útil para tiles/texturas).
- `--lora ''`: gera sem LoRA. `--lora-weight 0.6–1.0` controla a força do estilo.

### Como o pós-processamento funciona

O SD gera 512 px com "pseudo-pixels" de tamanho irregular. O `pixelize.py` faz quatro passos:

1. Reduz direto para o tamanho alvo com BOX, ou seja, a média de cada célula vira um pixel real.
2. Quantiza **sem dithering** para a paleta escolhida.
3. Binariza o alpha (≥128 vira opaco).
4. Amplia o preview com nearest.

O resultado é uma grade 1:1 de verdade. Ainda assim, faltam o contorno limpo e a leitura de silhueta que um pixel artist garante. [H] Espere retoque manual no Aseprite/LibreSprite para assets finais.

## Recomendação de MCP para ComfyUI (pesquisa 2026-11-09, nada instalado)

| Repo | Licença | ⭐ / último push (API GitHub, 2026-11-09) | Observação |
|---|---|---|---|
| **[Comfy-Org/comfy-mcp](https://github.com/Comfy-Org/comfy-mcp)** | AGPL-3.0-or-later OU comercial | 335 / 2026-11-05 | **Oficial** da Comfy-Org. Python, construído sobre `comfy-cli`. Usa `127.0.0.1:8188` por padrão (`COMFYUI_URL` para outro host). Ações perigosas (`install_node`, `--listen`, update) pedem confirmação e **falham fechado**. Aceita checkout existente via `comfy set-default <path>`. |
| [artokun/comfyui-mcp](https://github.com/artokun/comfyui-mcp) | MIT | 903 / 2026-11-09 | Muito ativo e rico (38 tools, instalador de packs, integração Civitai/cloud). Roda via `npx -y` (versão não fixada), com superfície grande. |
| [joenorton/comfyui-mcp-server](https://github.com/joenorton/comfyui-mcp-server) | Apache-2.0 | 411 / 2026-02-17 | Simples (generate/regenerate/view), HTTP em `:9000`. Menos ativo. |

**Recomendação: `Comfy-Org/comfy-mcp`.** É mantido pelo time do ComfyUI, roda local-first, tem gates de consentimento que falham fechado e a menor superfície de risco.

Ao conectar:

- (a) instale num venv separado com versão fixada (`pip install comfy-mcp==<versão> "comfy-cli>=1.14.0"`).
- (b) defina `DO_NOT_TRACK=1` / `COMFY_NO_TELEMETRY=1`.
- (c) **não** use `COMFY_MCP_ASSUME_CONSENT`.
- (d) aponte com `comfy set-default .../sd-local/ComfyUI`.

[H] A AGPL não impõe obrigação para uso interno como ferramenta. Só importaria se modificássemos e expuséssemos o servidor a terceiros. O registro no OpenClaw (`openclaw mcp set …`) cabe ao coordenador/fundador, não a este agente.

## Limitações conhecidas [H]

- 6 GB VRAM: SD1.5 em 512–768 px é tranquilo. SDXL só com `--lowvram`, e os 7 GB de RAM do WSL são o gargalo real.
- SD1.5 + LoRA dá *estilo* pixel art, não sprites consistentes. Personagens em várias poses/frames de animação vão exigir ControlNet/IP-Adapter ou trabalho manual. Tiles "seamless" não saem garantidamente tileáveis.
- Não foi testado se o LoRA no formato diffusers (`pytorch_lora_weights.safetensors`) carrega no `LoraLoader`. [H] O ComfyUI converte chaves diffusers/PEFT; verificar no primeiro run (o log avisa "lora key not loaded").
