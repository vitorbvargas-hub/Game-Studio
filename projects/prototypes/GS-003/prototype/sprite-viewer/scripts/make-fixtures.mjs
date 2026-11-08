// Gera fixtures/GAME-ASSETS-sample/: criaturas de TESTE (formas geométricas, arte original do estúdio,
// sem relação com nenhuma criatura real) para exercitar o viewer enquanto GAME-ASSETS/ não existe.
// Node puro: encoder PNG próprio (zlib + CRC32). Uso: `npm run fixtures` (sobrescreve as fixtures).

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(here, "../fixtures/GAME-ASSETS-sample/01-creatures/original");

const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function encodePng(w, h, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

class Sheet {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.px = Buffer.alloc(w * h * 4);
  }
  set(x, y, [r, g, b, a = 255]) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.px.set([r, g, b, a], (y * this.w + x) * 4);
  }
  ellipse(cx, cy, rx, ry, col) {
    for (let y = Math.floor(cy - ry); y <= cy + ry; y++)
      for (let x = Math.floor(cx - rx); x <= cx + rx; x++) if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) this.set(x, y, col);
  }
  png() {
    return encodePng(this.w, this.h, this.px);
  }
}

const hex = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
const OUTLINE = hex("#1b1b2a");
const EYE = hex("#ffffff");

/** Blob de teste numa célula (ox, oy) de fw×fh. dirX/dirY: -1..1 (olhar); pose: bob, stretch, flash. */
function drawBlob(s, ox, oy, fw, fh, col, { bob = 0, lean = 0, dirX = 0, dirY = 1, flash = false, sleep = false }) {
  const cx = ox + fw / 2 + lean;
  const base = oy + fh - 3;
  const rx = fw * 0.32;
  const ry = fh * 0.28 - bob;
  const cy = base - ry;
  s.ellipse(ox + fw / 2, base, rx * 0.9, 1.5, [0, 0, 0, 90]);
  s.ellipse(cx, cy, rx + 1, ry + 1, OUTLINE);
  s.ellipse(cx, cy, rx, ry, flash ? [255, 255, 255] : col);
  // Crista: marca de direção e silhueta.
  s.ellipse(cx + dirX * 2, cy - ry, 2, 2, OUTLINE);
  if (dirY >= 0) {
    for (const ex of [-3, 3]) {
      const x = cx + ex + dirX * 3;
      if (sleep) s.set(x, cy, OUTLINE), s.set(x + 1, cy, OUTLINE);
      else s.ellipse(x, cy - 1, 1, 1.5, EYE), s.set(x + dirX, cy - 1, OUTLINE);
    }
  }
}

const DIRV = { S: [0, 1], SE: [0.7, 0.7], E: [1, 0.3], NE: [0.7, -0.7], N: [0, -1], NW: [-0.7, -0.7], W: [-1, 0.3], SW: [-0.7, 0.7] };

function makeSheet(file, fw, fh, dirs, poses, col) {
  const s = new Sheet(fw * poses.length, fh * dirs.length);
  dirs.forEach((d, row) => poses.forEach((p, i) => drawBlob(s, i * fw, row * fh, fw, fh, col, { ...p, dirX: DIRV[d][0], dirY: DIRV[d][1] })));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, s.png());
}

const POSES = {
  idle: [{ bob: 0 }, { bob: 1 }, { bob: 2 }, { bob: 1 }],
  walk: [{ lean: -1 }, { bob: 1 }, { lean: 1 }, { bob: 1 }],
  attack: [{ lean: -2, bob: 1 }, { lean: 4, flash: true }, { lean: 1 }],
  hurt: [{ flash: true, lean: -2 }, { lean: -1 }],
  sleep: [{ sleep: true, bob: 2 }, { sleep: true, bob: 3 }],
};

function writeJson(file, obj) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + "\n");
}

// --- CREATURE-TEST-0001: grade, 2 versões (v1: só S; v2: S/E/N + W espelhado) ---
{
  const dir = path.join(OUT, "CREATURE-TEST-0001");
  const col = hex("#e8742c");
  makeSheet(path.join(dir, "spritesheets/v1/idle.png"), 32, 32, ["S"], POSES.idle.slice(0, 2), hex("#d0662a"));
  makeSheet(path.join(dir, "spritesheets/v1/walk.png"), 32, 32, ["S"], POSES.walk.slice(0, 2), hex("#d0662a"));
  for (const [name, poses] of Object.entries(POSES)) makeSheet(path.join(dir, `spritesheets/v2/${name}.png`), 32, 32, ["S", "E", "N"], poses, col);
  const anim = (name, extra) => ({ sheet: `spritesheets/v2/${name}.png`, frameWidth: 32, frameHeight: 32, directions: ["S", "E", "N"], mirror: { W: "E" }, origin: { x: 16, y: 29 }, ...extra });
  writeJson(path.join(dir, "creature.json"), {
    schemaVersion: "0.1-provisional",
    id: "CREATURE-TEST-0001",
    name: "Blob de Teste (laranja)",
    description: "Fixture do sprite viewer. Forma geométrica gerada por scripts/make-fixtures.mjs; não é criatura do jogo.",
    category: "starter",
    rarity: "common",
    element: "fire",
    stage: "rookie",
    evolutionLine: "test-line",
    attributes: { hp: 40, atk: 12, def: 8, spd: 10 },
    evolution: { from: null, to: [{ id: "CREATURE-TEST-0002", requirements: { level: 12 } }] },
    dimensions: { width: 32, height: 32 },
    hitbox: { x: 8, y: 12, w: 16, h: 18 },
    anchors: { feet: { x: 16, y: 29 }, head: { x: 16, y: 10 }, hit: { x: 16, y: 20 } },
    origin: { type: "original", source: "scripts/make-fixtures.mjs", author: "game-dev" },
    license: { tier: "original", spdx: "LicenseRef-GameStudio-Internal", notes: "Arte de teste gerada por código." },
    status: "UNDER_REVIEW",
    score: 40,
    review: [],
    currentVersion: "v2",
    versions: [
      {
        id: "v1",
        date: "2026-11-08",
        notes: "Primeira passada: só direção S, 2 quadros.",
        format: "grid",
        animations: {
          idle: { sheet: "spritesheets/v1/idle.png", frameWidth: 32, frameHeight: 32, fps: 2, loop: true },
          walk: { sheet: "spritesheets/v1/walk.png", frameWidth: 32, frameHeight: 32, fps: 4, loop: true },
        },
      },
      {
        id: "v2",
        date: "2026-11-08",
        notes: "3 direções desenhadas + W espelhado; P0 completo.",
        format: "grid",
        animations: {
          idle: anim("idle", { fps: 4, loop: true }),
          walk: anim("walk", { fps: 8, loop: true }),
          attack: anim("attack", { durationsMs: [120, 160, 120], loop: false, events: [{ frame: 1, name: "hit" }] }),
          hurt: anim("hurt", { durationsMs: [80, 160], loop: false }),
          sleep: anim("sleep", { fps: 1.5, loop: true }),
        },
      },
    ],
  });
}

// --- CREATURE-TEST-0002: versão em formato PMD (AnimData.xml) dentro da pasta da criatura ---
{
  const dir = path.join(OUT, "CREATURE-TEST-0002");
  const pmd = path.join(dir, "spritesheets/pmd-v1");
  const dirs8 = ["S", "SE", "E", "NE", "N", "NW", "W", "SW"];
  const col = hex("#3d8fd6");
  const specs = [
    ["Idle", 32, 32, POSES.idle, [12, 8, 8, 8]],
    ["Walk", 32, 32, POSES.walk, [6, 8, 6, 8]],
    ["Attack", 40, 32, POSES.attack, [8, 10, 8]],
  ];
  let xml = '<?xml version="1.0" ?>\n<AnimData>\n\t<ShadowSize>1</ShadowSize>\n\t<Anims>\n';
  specs.forEach(([name, fw, fh, poses, durs], i) => {
    makeSheet(path.join(pmd, `${name}-Anim.png`), fw, fh, dirs8, poses, col);
    xml += `\t\t<Anim>\n\t\t\t<Name>${name}</Name>\n\t\t\t<Index>${i}</Index>\n\t\t\t<FrameWidth>${fw}</FrameWidth>\n\t\t\t<FrameHeight>${fh}</FrameHeight>\n`;
    if (name === "Attack") xml += "\t\t\t<RushFrame>0</RushFrame>\n\t\t\t<HitFrame>1</HitFrame>\n\t\t\t<ReturnFrame>2</ReturnFrame>\n";
    xml += `\t\t\t<Durations>\n${durs.map((d) => `\t\t\t\t<Duration>${d}</Duration>\n`).join("")}\t\t\t</Durations>\n\t\t</Anim>\n`;
  });
  xml += "\t\t<Anim>\n\t\t\t<Name>Charge</Name>\n\t\t\t<Index>3</Index>\n\t\t\t<CopyOf>Attack</CopyOf>\n\t\t</Anim>\n\t</Anims>\n</AnimData>\n";
  fs.writeFileSync(path.join(pmd, "AnimData.xml"), xml);
  writeJson(path.join(dir, "creature.json"), {
    schemaVersion: "0.1-provisional",
    id: "CREATURE-TEST-0002",
    name: "Blob de Teste (azul, PMD)",
    description: "Fixture: versão em formato PMD (AnimData.xml) referenciada pelo creature.json.",
    category: "intermediate",
    rarity: "rare",
    element: "water",
    stage: "champion",
    evolutionLine: "test-line",
    evolution: { from: "CREATURE-TEST-0001", to: [] },
    dimensions: { width: 32, height: 32 },
    anchors: { feet: { x: 16, y: 29 } },
    origin: { type: "original", source: "scripts/make-fixtures.mjs", author: "game-dev" },
    license: { tier: "original", spdx: "LicenseRef-GameStudio-Internal" },
    status: "DISCOVERED",
    score: 20,
    currentVersion: "pmd-v1",
    versions: [{ id: "pmd-v1", date: "2026-11-08", format: "pmd", path: "spritesheets/pmd-v1" }],
  });
}

// --- CREATURE-TEST-0003: manifest com erros de propósito (mostra a validação na galeria) ---
writeJson(path.join(OUT, "CREATURE-TEST-0003", "creature.json"), {
  id: "CREATURE-TEST-0003",
  name: "Manifest inválido (teste)",
  category: "advanced",
  rarity: "epic",
  status: "aprovadissimo",
  license: { tier: "free-for-all" },
  animations: { idle: { sheet: "../../../../fora.png", frameWidth: 32, frameHeight: 32, frames: 2 } },
});

console.log("fixtures geradas em", path.relative(process.cwd(), OUT));
