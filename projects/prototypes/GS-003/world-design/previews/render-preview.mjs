#!/usr/bin/env node
// Gera um PNG esquemático (planta com zonas coloridas e rotas) a partir de um map-brief.json.
// Zero dependências novas: usa só node:fs e node:zlib (o zlib do próprio Node escreve o stream
// comprimido que o formato PNG exige para o chunk IDAT). CRC32 e os chunks são montados à mão.
// Uso: node render-preview.mjs <brief.json> <saida.png> [escalaPxPorTile]

import { readFileSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

// ---------- PNG mínimo (sem libs de imagem) ----------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}
function writePNG(path, width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0; // filter: none
    rgba.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = deflateSync(raw, { level: 9 });
  const out = Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
  writeFileSync(path, out);
}

// ---------- canvas simples em memória (RGBA) ----------
function makeCanvas(w, h, bg) {
  const buf = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) buf.set(bg, i * 4);
  return { w, h, buf };
}
function setPx(cv, x, y, color) {
  if (x < 0 || y < 0 || x >= cv.w || y >= cv.h) return;
  cv.buf.set(color, (y * cv.w + x) * 4);
}
function fillRect(cv, x0, y0, w, h, color) {
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) setPx(cv, x, y, color);
}
function strokeRect(cv, x0, y0, w, h, color, thickness = 1) {
  for (let t = 0; t < thickness; t++) {
    for (let x = x0; x < x0 + w; x++) {
      setPx(cv, x, y0 + t, color);
      setPx(cv, x, y0 + h - 1 - t, color);
    }
    for (let y = y0; y < y0 + h; y++) {
      setPx(cv, x0 + t, y, color);
      setPx(cv, x0 + w - 1 - t, y, color);
    }
  }
}
function fillCircle(cv, cx, cy, r, color) {
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r) setPx(cv, cx + x, cy + y, color);
}
function drawThickLine(cv, x0, y0, x1, y1, thickness, color) {
  const dx = x1 - x0, dy = y1 - y0;
  const dist = Math.max(1, Math.hypot(dx, dy));
  const steps = Math.ceil(dist * 2);
  const half = thickness / 2;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const cx = x0 + dx * t, cy = y0 + dy * t;
    for (let oy = -half; oy <= half; oy++) for (let ox = -half; ox <= half; ox++) {
      if (ox * ox + oy * oy <= half * half + 0.5) setPx(cv, Math.round(cx + ox), Math.round(cy + oy), color);
    }
  }
}
function drawX(cv, cx, cy, r, color, thickness = 2) {
  drawThickLine(cv, cx - r, cy - r, cx + r, cy + r, thickness, color);
  drawThickLine(cv, cx - r, cy + r, cx + r, cy - r, thickness, color);
}

// ---------- cores (RGBA) ----------
const C = {
  outside: [26, 46, 30, 255],
  grid: [40, 60, 44, 255],
  zone: {
    spawn_area: [120, 196, 120, 255],
    clearing: [232, 214, 125, 255],
    concentration: [224, 120, 70, 255],
    secret: [150, 90, 200, 255],
    boss_arena: [196, 40, 40, 255],
    water: [60, 140, 220, 255],
    rock_field: [140, 130, 120, 255],
    village_hub: [230, 150, 190, 255],
    dense_border: [26, 46, 30, 255],
    cave_floor: [110, 100, 110, 255],
    dune: [224, 200, 140, 255],
    cliff: [150, 120, 100, 255],
    other: [160, 160, 160, 255],
  },
  routeMain: [120, 80, 40, 255],
  routeSecondary: [180, 150, 90, 255],
  poi: [40, 220, 220, 255],
  npc: [60, 100, 240, 255],
  chest: [230, 150, 30, 255],
  sign: [235, 225, 60, 255],
  heal: [255, 120, 190, 255],
  exit: [255, 255, 255, 255],
  border: [15, 15, 20, 255],
};

function render(brief, scale) {
  const W = brief.dimensions.widthTiles * scale;
  const H = brief.dimensions.heightTiles * scale;
  const cv = makeCanvas(W, H, C.outside);

  // zonas
  for (const z of brief.zones) {
    const color = C.zone[z.type] ?? C.zone.other;
    if (z.shape === "rect") {
      const { x, y, width, height } = z.rect;
      fillRect(cv, x * scale, y * scale, width * scale, height * scale, color);
      strokeRect(cv, x * scale, y * scale, width * scale, height * scale, C.border, 1);
    } else if (z.shape === "polygon") {
      // preenchimento simples por bounding box + teste par-ímpar (poligono convexo/simples o bastante para uma planta)
      const pts = z.polygon.points.map(([px, py]) => [px * scale, py * scale]);
      const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
      const minX = Math.floor(Math.min(...xs)), maxX = Math.ceil(Math.max(...xs));
      const minY = Math.floor(Math.min(...ys)), maxY = Math.ceil(Math.max(...ys));
      for (let y = minY; y <= maxY; y++) {
        let inside = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
          const [xi, yi] = pts[i], [xj, yj] = pts[j];
          if (yi > y !== yj > y && 0 < ((xj - xi) * (y - yi)) / (yj - yi) + xi - 0) inside = !inside;
        }
        for (let x = minX; x <= maxX; x++) {
          let c = false;
          for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
            const [xi, yi] = pts[i], [xj, yj] = pts[j];
            if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
          }
          if (c) setPx(cv, x, y, color);
        }
      }
    }
  }

  // rotas
  for (const r of brief.routes) {
    const color = r.type === "main" ? C.routeMain : C.routeSecondary;
    const thickness = Math.max(2, r.widthTiles * scale * 0.6);
    for (let i = 0; i < r.waypoints.length - 1; i++) {
      const [ax, ay] = r.waypoints[i];
      const [bx, by] = r.waypoints[i + 1];
      drawThickLine(cv, ax * scale, ay * scale, bx * scale, by * scale, thickness, color);
    }
  }

  // pois
  for (const p of brief.pois ?? []) {
    const [x, y] = p.position;
    fillCircle(cv, Math.round(x * scale), Math.round(y * scale), Math.max(2, scale * 0.35), C.poi);
  }
  // npcs
  for (const n of brief.npcs ?? []) {
    const [x, y] = n.position;
    fillCircle(cv, Math.round(x * scale), Math.round(y * scale), Math.max(2, scale * 0.4), C.npc);
  }
  // interactables
  for (const it of brief.interactables ?? []) {
    const [x, y] = it.position;
    const color = it.type === "chest" ? C.chest : it.type === "sign" ? C.sign : it.type === "heal_point" ? C.heal : C.poi;
    const s = Math.max(3, scale * 0.6);
    fillRect(cv, Math.round(x * scale - s / 2), Math.round(y * scale - s / 2), Math.round(s), Math.round(s), color);
  }
  // boss arena marker
  if (brief.bossArena) {
    const [x, y] = brief.bossArena.position;
    drawX(cv, Math.round(x * scale), Math.round(y * scale), Math.max(4, scale * 0.8), C.boss_arena ?? [220, 0, 0, 255], 2);
  }
  // exits
  for (const e of brief.exits ?? []) {
    const { x, y, width, height } = e.rect;
    fillRect(cv, x * scale, y * scale, Math.max(1, width * scale), Math.max(1, height * scale), C.exit);
    strokeRect(cv, x * scale, y * scale, Math.max(1, width * scale), Math.max(1, height * scale), C.border, 1);
  }

  // moldura externa
  strokeRect(cv, 0, 0, W, H, C.border, 2);
  return cv;
}

const [, , briefPath, outPath, scaleArg] = process.argv;
if (!briefPath || !outPath) {
  console.error("uso: node render-preview.mjs <brief.json> <saida.png> [escalaPxPorTile=8]");
  process.exit(2);
}
const brief = JSON.parse(readFileSync(briefPath, "utf8"));
const scale = scaleArg ? Number(scaleArg) : 8;
const cv = render(brief, scale);
writePNG(outPath, cv.w, cv.h, cv.buf);
console.log(`Gerado ${outPath} (${cv.w}x${cv.h}px, ${scale}px/tile) a partir de ${briefPath}`);
