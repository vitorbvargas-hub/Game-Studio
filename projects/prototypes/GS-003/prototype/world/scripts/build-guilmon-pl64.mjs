// Monta a criatura CREATURE-0017-guilmon-pl64 (Guilmon 64 px do PixelLab) a partir da melhor versão do teste de
// escala: phase2/art/scale-proof-v3-reanim/fixed (start frame = south.png + paleta travada; REANIM_REPORT.md), com
// fallback para phase2/art/scale-proof-v3-fix/pipeline-m1-fixed. Só copia e renomeia os PNGs (nenhum pixel muda) e
// escreve o creature.json no formato do jogo, medindo o bbox de cada quadro para o pivô, a hitbox e o relatório.
//
// Uso (de prototype/world/): node scripts/build-guilmon-pl64.mjs   (0 gerações; idempotente)

import { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ART = join(ROOT, "../../quality-overhaul/phase2/art");
const REANIM = join(ART, "scale-proof-v3-reanim/fixed");
const FIX = join(ART, "scale-proof-v3-fix/pipeline-m1-fixed");
const ID = "CREATURE-0017";
const OUT = join(ROOT, "../../../../../assets/GAME-ASSETS/01-creatures", `${ID}-guilmon-pl64`);
const SPR = join(OUT, "sprites");
mkdirSync(SPR, { recursive: true });

const pick = (anim) => (existsSync(join(REANIM, anim)) ? { dir: join(REANIM, anim), from: "scale-proof-v3-reanim/fixed" } : { dir: join(FIX, anim), from: "scale-proof-v3-fix/pipeline-m1-fixed" });
const framesOf = (dir) => readdirSync(dir).filter((f) => /^frame_\d+\.png$/.test(f)).sort();

async function bbox(path) {
  const img = await loadImage(path);
  const c = createCanvas(img.width, img.height);
  const g = c.getContext("2d");
  g.drawImage(img, 0, 0);
  const a = g.getImageData(0, 0, img.width, img.height).data;
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let y = 0; y < img.height; y++)
    for (let x = 0; x < img.width; x++)
      if (a[(y * img.width + x) * 4 + 3] > 0) [x0, y0, x1, y1] = [Math.min(x0, x), Math.min(y0, y), Math.max(x1, x), Math.max(y1, y)];
  return { w: img.width, h: img.height, x0, y0, x1, y1, height: y1 - y0 + 1 };
}

const metrics = {};
const copy = async (src, key) => {
  copyFileSync(src, join(SPR, key));
  metrics[key] = await bbox(src);
};

// idle S: os 5 quadros (0 = âncora south.png, 1–4 = respiração gerada)
const idle = pick("idle-s");
const idleKeys = [];
for (const [i, f] of framesOf(idle.dir).entries()) {
  const k = `${ID}_idle_S_${String(i).padStart(2, "0")}.png`;
  await copy(join(idle.dir, f), k);
  idleKeys.push(k);
}
// walk S: os 9 quadros (0 = âncora, pés juntos; 1–8 = passada gerada)
const walk = pick("walk-s");
const walkKeys = [];
for (const [i, f] of framesOf(walk.dir).entries()) {
  const k = `${ID}_walk_S_${String(i).padStart(2, "0")}.png`;
  await copy(join(walk.dir, f), k);
  walkKeys.push(k);
}
// SW: só existe a rotação parada (scale-proof-v3-fix, paleta travada) → idle SW de 1 quadro; o walk SW não existe
const swSrc = join(FIX, "rotations/south-west.png");
const idleSW = existsSync(swSrc) ? `${ID}_idle_SW_00.png` : undefined;
if (idleSW) await copy(swSrc, idleSW);

const fr = (k, ms) => ({ durationMs: ms, atlasKey: k });
const ms = Object.values(metrics);
const anchorFoot = metrics[idleKeys[0]].y1;
// pivô no pé da âncora (south.png): os quadros gerados variam ±1–2 px em volta dele (REANIM_REPORT.md §2)
const footY = anchorFoot;
const top = Math.min(...ms.map((m) => m.y0));
const maxFoot = Math.max(...ms.map((m) => m.y1));
const left = Math.min(...ms.map((m) => m.x0));
const right = Math.max(...ms.map((m) => m.x1));
const W = ms[0].w;
const H = ms[0].h;
const anchor = metrics[idleKeys[0]];
const cx = Math.round((anchor.x0 + anchor.x1 + 1) / 2);

// Direções que faltam: `fallback: "nearest"` (src/render/anim.ts resolveFacing) → a desenhada mais próxima pelo
// ângulo, ou o espelho dela se o espelho for mais próximo (E/SE/NE = espelho de SW quando há SW).
const idleDirs = idleSW ? ["S", "SW"] : ["S"];
const manifest = {
  schemaVersion: 2,
  version: "1.0.0",
  previousVersions: [],
  id: ID,
  name: "Guilmon",
  category: "digital-creature",
  rarity: "common",
  element: "virus",
  attributes: {},
  evolutionStage: "rookie",
  evolutionLine: { lineId: "guilmon", previous: null, next: [] },
  evolutionRequirements: {},
  description:
    "Guilmon 64 px gerado no PixelLab (teste de escala v3 do Quality Overhaul, personagem c9035021…, animações v3 com custom_start_frame = south.png e paleta travada de 18 cores). Criatura de COMPARAÇÃO (?team=compare) contra o Gabumon à mão (CREATURE-0119); não substitui o Guilmon rip (CREATURE-0003) nem entra no roster.",
  dimensions: { frameW: W, frameH: H, tile: 64 },
  pivot: { x: cx, y: footY },
  mapScale: 1,
  targetHeightPx: anchor.height,
  nativeMapHeightPx: anchor.height,
  sizeNotes: `Mesma convenção do Gabumon à mão (CREATURE-0119): canvas ${W}×${H}, corpo ~${anchor.height} px, pé em y=${footY}. mapScale 1 = mesma escala de tela do Guilmon rip (corpo ~31 px).`,
  hitbox: { x: left, y: top, w: right - left + 1, h: maxFoot - top + 1 },
  anchors: {
    head: { x: cx, y: anchor.y0 + 4 },
    hit: { x: cx, y: Math.round((anchor.y0 + footY) / 2) },
    shadow: { cx, cy: footY, rx: 10, ry: 4 },
  },
  directions: {
    walk: { drawn: ["S"], mirrored: {}, fallback: "nearest" },
    idle: { drawn: idleDirs, mirrored: {}, fallback: "nearest" },
  },
  walkSpeedPxPerSec: 96,
  anatomy: "biped",
  combatStates: { IDLE: "idle", WALK: "walk", FOLLOW: "walk", ENGAGE: "walk", RETURN: "walk" },
  animations: {
    idle: {
      loop: true,
      space: "map",
      frames: idleKeys.map((k) => fr(k, 240)),
      events: [],
      dirFrames: { S: idleKeys.map((k) => fr(k, 240)), ...(idleSW ? { SW: [fr(idleSW, 240)] } : {}) },
    },
    walk: {
      loop: true,
      space: "map",
      // ciclo dos 8 quadros gerados (1–8); o 0 é a âncora parada (fica de fora para não "parar" no meio do passo)
      frames: walkKeys.slice(1).map((k) => fr(k, 110)),
      events: [],
      dirFrames: { S: walkKeys.slice(1).map((k) => fr(k, 110)) },
    },
  },
  sprites: "./sprites/",
  assetOrigin: {
    layer: "ai-generated",
    tool: "PixelLab (create_character v3 + animate_character v3 custom_start_frame)",
    source: `quality-overhaul/phase2/art/${idle.from} (idle S), ${walk.from} (walk S), scale-proof-v3-fix/pipeline-m1-fixed/rotations/south-west.png (idle SW parado)`,
    built: "prototype/world/scripts/build-guilmon-pl64.mjs (cópia e renomeação; nenhum pixel alterado)",
  },
  approvalStatus: "UNDER_REVIEW",
  qaNotes: [
    `[E] bbox por quadro em source/metrics.json: altura ${Math.min(...ms.map((m) => m.height))}–${Math.max(...ms.map((m) => m.height))} px, pé ${Math.min(...ms.map((m) => m.y1))}–${maxFoot} (pivô no da âncora, ${footY}).`,
    "Só S tem animação; SW só a rotação parada. Walk em W/E/N cai no S (fallback nearest).",
  ],
};
writeFileSync(join(OUT, "creature.json"), JSON.stringify(manifest, null, 2) + "\n");
writeFileSync(
  join(OUT, "license.json"),
  JSON.stringify(
    {
      creatureId: ID,
      version: "1.0.0",
      layer: "ai-generated",
      officialRip: false,
      fanException: true,
      baseCharacter: "Guilmon",
      basis: "ADR-007 (fan game não comercial com monstros oficiais de Digimon); arte gerada no PixelLab pela conta do estúdio (teste de escala v3, phase2/art).",
      nonCommercial: true,
      noRip: true,
      copyright: "Digimon © Bandai Namco Entertainment Inc. / Toei Animation (nome e conceito do personagem, não os pixels)",
      restrictions: ["ADR-007: fan game sem monetização", "Publicação exige aprovação separada do fundador", "Criatura de comparação (?team=compare) — não integrada ao roster nem substitui CREATURE-0003"],
      source: { type: "pixellab", characterId: "c9035021-cb9d-4edb-9c2f-5792e6a2239c", costLog: "quality-overhaul/phase2/art/scale-proof-v3-reanim/pixellab_cost_log.csv" },
      verifiedAt: "2026-11-10",
      verifiedBy: "game-dev",
    },
    null,
    2,
  ) + "\n",
);
mkdirSync(join(OUT, "source"), { recursive: true });
writeFileSync(join(OUT, "source/metrics.json"), JSON.stringify(metrics, null, 2) + "\n");
console.log(ID, { idle: idleKeys.length, walk: walkKeys.length, idleSW: !!idleSW, pivot: manifest.pivot, height: anchor.height, footY });
