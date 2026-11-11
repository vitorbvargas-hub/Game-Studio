// forest-v12: pranchas lado a lado (antes | depois [| troca inteira]) das capturas de quality-overhaul/phase3/v12/.
// Uso: node scripts/v12-sidebyside.mjs  (depois do v12-capture.mjs com TAG=antes, depois e troca)
import { existsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "../../../quality-overhaul/phase3/v12");
const PAIRS = [
  "zoom_mirante",
  "zoom_mirante_noite",
  "mirante_jogo_dia",
  "mirante_jogo_noite",
  "mirante_geral_dia",
  "mirante_geral_noite",
  "copas_oeste_dia",
  "copas_sul_dia",
  "copas_sul_noite",
  "zoom_terra-trilha-vau_noite",
  "zoom_acampamento_noite",
  "zoom_terra-fonte_noite",
  "mundi_vila_dia",
  "mundi_vila_sem-poi_dia",
  "mundi_aberto_dia",
];
for (const id of PAIRS) {
  // "troca" (?v12night=swap) só muda a noite
  const files = ["antes", "depois", ...(/noite/.test(id) ? ["troca"] : [])].map((t) => join(OUT, `v12_${t}_${id}.png`)).filter(existsSync);
  const imgs = await Promise.all(files.map((f) => loadImage(f)));
  const gap = 12;
  const c = createCanvas(imgs.reduce((s, i) => s + i.width, 0) + gap * (imgs.length - 1), Math.max(...imgs.map((i) => i.height)));
  const g = c.getContext("2d");
  g.fillStyle = "#111";
  g.fillRect(0, 0, c.width, c.height);
  let x = 0;
  for (const i of imgs) {
    g.drawImage(i, x, 0);
    x += i.width + gap;
  }
  writeFileSync(join(OUT, `v12_lado-a-lado_${id}.png`), c.toBuffer("image/png"));
  console.log("ok", `v12_lado-a-lado_${id}.png`, files.map((f) => f.split("_")[1]).join(" | "));
}
