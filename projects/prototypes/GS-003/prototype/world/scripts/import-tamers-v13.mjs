#!/usr/bin/env node
// Tamers v13 (PixelLab, 12 presets 36×36, 8 direções, walk 6 + idle 4 quadros) → art/tamers-v13/game/<TAMER-ID>/.
// Entrada: uma pasta com <TAMER-ID>.zip de cada preset (export_asset(format="zip") / GET /mcp/characters/<id>/download;
// ids em art/tamers-v13/scripts/character_ids.json). Cada ZIP é extraído numa pasta temporária vazia (python3 -I
// zipfile). Saída por preset: rotations/<dir>.png, walk/<dir>/frame_NNN.png, idle/<dir>/frame_NNN.png e tamer.json
// (rótulo, tamanho, pivô medido no pé da rotação sul, quadros por direção).
//
// Uso (a partir de prototype/world): node scripts/import-tamers-v13.mjs <pasta com os ZIPs>

import { createCanvas, loadImage } from "@napi-rs/canvas";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ART = path.resolve(HERE, "../../../art/tamers-v13");
const IDS = JSON.parse(fs.readFileSync(path.join(ART, "scripts/character_ids.json"), "utf8"));
const zips = path.resolve(process.argv[2] ?? "");
const DIRS = { south: "S", "south-east": "SE", east: "E", "north-east": "NE", north: "N", "north-west": "NW", west: "W", "south-west": "SW" };
const LABEL_PT = { Determinacao: "Determinação", Esperanca: "Esperança", Vinculo: "Vínculo", Furia: "Fúria" };
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tamers-v13-"));
const summary = [];
for (const [tid, info] of Object.entries(IDS)) {
  if (!tid.startsWith("TAMER-")) continue;
  const zip = path.join(zips, `${tid}.zip`);
  if (!fs.existsSync(zip)) throw new Error(`falta ${zip}`);
  const dir = path.join(tmp, tid);
  fs.mkdirSync(dir);
  execFileSync("python3", ["-I", "-c", "import zipfile,sys; zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])", zip, dir]);
  const meta = JSON.parse(fs.readFileSync(path.join(dir, "metadata.json"), "utf8"));
  const st = meta.states.find((s) => s.character.id === info.character_id) ?? meta.states[0];
  const out = path.join(ART, "game", tid);
  fs.rmSync(out, { recursive: true, force: true });
  const frames = {};
  const copy = (rel, dest) => {
    fs.mkdirSync(path.dirname(path.join(out, dest)), { recursive: true });
    fs.copyFileSync(path.join(dir, rel), path.join(out, dest));
    return dest;
  };
  const rotations = {};
  for (const [d, rel] of Object.entries(st.frames.rotations)) rotations[DIRS[d]] = copy(rel, `rotations/${DIRS[d]}.png`);
  for (const anim of ["walk", "idle"]) {
    const a = st.frames.animations[anim];
    if (!a) throw new Error(`${tid}: sem ${anim}`);
    frames[anim] = {};
    for (const [d, list] of Object.entries(a)) frames[anim][DIRS[d]] = list.map((rel, i) => copy(rel, `${anim}/${DIRS[d]}/frame_${String(i).padStart(3, "0")}.png`));
  }
  // pivô = centro dos pés: linha opaca mais baixa da rotação sul, média x das colunas opacas dessa linha
  const img = await loadImage(path.join(out, rotations.S));
  const g = createCanvas(img.width, img.height).getContext("2d");
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, img.width, img.height).data;
  let py = 0, xs = [];
  for (let y = img.height - 1; y >= 0 && !xs.length; y--)
    for (let x = 0; x < img.width; x++)
      if (d[(y * img.width + x) * 4 + 3] > 40) {
        xs.push(x);
        py = y;
      }
  const pivot = { x: Math.round(xs.reduce((a, b) => a + b, 0) / xs.length), y: py };
  const label = LABEL_PT[info.label] ?? info.label;
  const manifest = { id: tid, label, characterId: info.character_id, source: "PixelLab (tamers-v13)", frame: { w: img.width, h: img.height }, pivot, walkMs: 110, idleMs: 260, rotations, frames };
  fs.writeFileSync(path.join(out, "tamer.json"), JSON.stringify(manifest, null, 1) + "\n");
  summary.push(`${tid} ${label} ${img.width}x${img.height} pivô ${pivot.x},${pivot.y} walk ${frames.walk.S.length} idle ${frames.idle.S.length}`);
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log(summary.join("\n"));
