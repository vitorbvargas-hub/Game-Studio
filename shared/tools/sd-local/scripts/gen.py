#!/usr/bin/env python3
"""Gera pixel art via API HTTP do ComfyUI (127.0.0.1:8188) + pós-processamento de pixel.

Exemplo:
  .venv/bin/python scripts/gen.py "red health potion bottle, game item" --size 32 \
      --palette endesga32 --transparent --out samples/potion.png

Requer ComfyUI rodando (scripts/start.sh). Imprime JSON com tempo e pico de VRAM.
"""
import argparse, json, random, subprocess, sys, threading, time, urllib.parse, urllib.request, uuid
from io import BytesIO
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
from pixelize import pixelize  # noqa: E402

# Loopback sem proxy (o ambiente define HTTP(S)_PROXY)
OPENER = urllib.request.build_opener(urllib.request.ProxyHandler({}))
NVSMI = "/usr/lib/wsl/lib/nvidia-smi"

STYLE_POS = "pixel art, 16-bit game sprite, clean outlines, flat shading, limited palette, centered, single object, plain white background"
STYLE_NEG = "blurry, photo, realistic, 3d render, gradient, noise, text, watermark, signature, multiple objects, cropped, frame, jpeg artifacts"


def api(base, path, data=None):
    req = urllib.request.Request(base + path, data=json.dumps(data).encode() if data is not None else None,
                                 headers={"Content-Type": "application/json"})
    with OPENER.open(req, timeout=600) as r:
        return r.read()


def workflow(prompt, neg, ckpt, lora, lora_w, w, h, steps, cfg, seed, sampler, scheduler):
    model_src, clip_src = ["1", 0], ["1", 1]
    wf = {"1": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": ckpt}}}
    if lora:
        wf["2"] = {"class_type": "LoraLoader", "inputs": {"model": model_src, "clip": clip_src, "lora_name": lora,
                                                           "strength_model": lora_w, "strength_clip": lora_w}}
        model_src, clip_src = ["2", 0], ["2", 1]
    wf.update({
        "3": {"class_type": "CLIPTextEncode", "inputs": {"clip": clip_src, "text": prompt}},
        "4": {"class_type": "CLIPTextEncode", "inputs": {"clip": clip_src, "text": neg}},
        "5": {"class_type": "EmptyLatentImage", "inputs": {"width": w, "height": h, "batch_size": 1}},
        "6": {"class_type": "KSampler", "inputs": {"model": model_src, "positive": ["3", 0], "negative": ["4", 0],
                                                   "latent_image": ["5", 0], "seed": seed, "steps": steps, "cfg": cfg,
                                                   "sampler_name": sampler, "scheduler": scheduler, "denoise": 1.0}},
        "7": {"class_type": "VAEDecode", "inputs": {"samples": ["6", 0], "vae": ["1", 2]}},
        "8": {"class_type": "SaveImage", "inputs": {"images": ["7", 0], "filename_prefix": "sdlocal"}},
    })
    return wf


class VramPeak(threading.Thread):
    """Amostra memória usada da GPU inteira (inclui outros processos/desktop do Windows)."""
    def __init__(self):
        super().__init__(daemon=True); self.peak = 0; self.base = self._read(); self.stop = False
    def _read(self):
        try:
            return int(subprocess.check_output([NVSMI, "--query-gpu=memory.used", "--format=csv,noheader,nounits"]).split()[0])
        except Exception:
            return -1
    def run(self):
        while not self.stop:
            self.peak = max(self.peak, self._read()); time.sleep(0.25)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("prompt")
    ap.add_argument("--out", required=True)
    ap.add_argument("--size", default="32", help="tamanho final em pixels: 32 ou 32x48")
    ap.add_argument("--palette", default="k16", help="pico8|gb|endesga32|arquivo.hex|k<N>")
    ap.add_argument("--transparent", action="store_true", help="remove fundo pela cor das bordas")
    ap.add_argument("--gen", default="512", help="resolução de geração SD (512 ou 512x768)")
    ap.add_argument("--ckpt", default="sd15-v1-5-pruned-emaonly.safetensors")
    ap.add_argument("--lora", default="pixelart-sedatal-sd15-comfy.safetensors", help="'' para desativar")
    ap.add_argument("--lora-weight", type=float, default=0.9)
    ap.add_argument("--neg", default="")
    ap.add_argument("--no-style", action="store_true", help="não anexar sufixo de estilo pixel art")
    ap.add_argument("--steps", type=int, default=25)
    ap.add_argument("--cfg", type=float, default=7.0)
    ap.add_argument("--sampler", default="dpmpp_2m")
    ap.add_argument("--scheduler", default="karras")
    ap.add_argument("--seed", type=int, default=None)
    ap.add_argument("--host", default="http://127.0.0.1:8188")
    a = ap.parse_args()

    gw, gh = map(int, a.gen.split("x")) if "x" in a.gen else (int(a.gen),) * 2
    size = tuple(map(int, a.size.split("x"))) if "x" in a.size else int(a.size)
    seed = a.seed if a.seed is not None else random.randint(0, 2**32 - 1)
    prompt = a.prompt if a.no_style else f"{a.prompt}, {STYLE_POS}"
    neg = ", ".join(x for x in (a.neg, STYLE_NEG) if x)
    wf = workflow(prompt, neg, a.ckpt, a.lora or None, a.lora_weight, gw, gh, a.steps, a.cfg, seed, a.sampler, a.scheduler)

    mon = VramPeak(); mon.start()
    t0 = time.time()
    pid = json.loads(api(a.host, "/prompt", {"prompt": wf, "client_id": str(uuid.uuid4())}))["prompt_id"]
    while True:
        hist = json.loads(api(a.host, f"/history/{pid}"))
        if pid in hist:
            entry = hist[pid]
            if entry.get("status", {}).get("status_str") == "error":
                mon.stop = True; sys.exit(f"ComfyUI erro: {json.dumps(entry['status'])[:800]}")
            if entry.get("outputs"):
                break
        time.sleep(0.5)
    dt = time.time() - t0
    mon.stop = True; mon.join()

    img_meta = entry["outputs"]["8"]["images"][0]
    raw = Image.open(BytesIO(api(a.host, "/view?" + urllib.parse.urlencode(img_meta))))
    out = Path(a.out); out.parent.mkdir(parents=True, exist_ok=True)
    raw.save(out.with_name(out.stem + "_raw.png"))
    px = pixelize(raw, size, a.palette, a.transparent)
    px.save(out)
    px.resize((px.width * 8, px.height * 8), Image.Resampling.NEAREST).save(out.with_name(out.stem + "_x8.png"))
    print(json.dumps({"out": str(out), "seed": seed, "seconds": round(dt, 2), "gen_res": [gw, gh],
                      "final_size": list(px.size), "vram_baseline_mib": mon.base, "vram_peak_mib": mon.peak}))


if __name__ == "__main__":
    main()
