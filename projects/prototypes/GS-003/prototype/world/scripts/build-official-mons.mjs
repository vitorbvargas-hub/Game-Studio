// Monta CREATURE-0018-guilmon-official e CREATURE-0019-gabumon-official: os sprites de MAPA oficiais do Digimon World
// DS recortados direto das folhas do fundador (GAME-ASSETS/10-source-files/dwds-sheets/{guilmon,gabumon}.png), para o
// modo ?mon=official (fan game: os Digimon iguais aos oficiais, decisão do fundador 2026-11-11).
//
// O que o script faz (nenhum pixel é redesenhado nem reamostrado; só recorte, chroma key e translação inteira):
// 1. acha os quadros da grade de mapa por componentes conexos (fundo = cor da folha / das caixas → transparente);
// 2. prova na folha quais quadros são espelho de quais (a 2ª linha do Guilmon e as linhas pares do Gabumon são o
//    espelho exato da de cima → o próprio DS espelha; usamos `mirrored` em vez de copiar);
// 3. cola cada quadro num canvas único (40×36) com o PÉ fixo (última linha opaca em y = 33, pivô y = 34) e o x
//    registrado pela cabeça/tronco contra o quadro parado da direção (sem "pulo" entre quadros);
// 4. escreve creature.json (walk f0-f1-f0-f2 com os DOIS passos, idle, attack e hurt compostos de quadros oficiais),
//    license.json e source/metrics.json (bbox, deslocamento e origem de cada quadro).
//
// Uso (de prototype/world/): node scripts/build-official-mons.mjs   (0 gerações; idempotente)

import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const GA = join(ROOT, "../../../../../assets/GAME-ASSETS");
const SHEETS = join(GA, "10-source-files/dwds-sheets");
const CW = 40;
const CH = 36;
const FOOT = 33; // última linha opaca
const PIVOT = { x: CW / 2, y: FOOT + 1 };

/**
 * Cada espécie: a região da grade de mapa na folha, as cores de fundo, quantos quadros a grade tem e o papel de cada
 * quadro (índice 1-based na ordem linha → coluna, ver `cells`). Facing conferido no olho [H] e pelos espelhos [E].
 */
const SPECIES = [
  {
    id: "CREATURE-0018",
    slug: "guilmon-official",
    name: "Guilmon",
    species: "CREATURE-0003",
    sheet: "guilmon.png",
    region: [0, 195, 240, 90],
    bg: [0x000080],
    cells: 16,
    // linha 1: S (1 parado, 2 passo, 3 = 1, 4 passo) · W (5 parado, 6 passo, 7 = 5, 8 passo); linha 2 = espelho da 1
    mirrorsExpected: [[1, 10], [2, 11], [4, 9], [5, 14], [6, 15], [8, 13]],
    dupesExpected: [[1, 3], [5, 7]],
    dirs: { S: { stand: 1, steps: [2, 4] }, W: { stand: 5, steps: [6, 8] } },
    attack: { S: [1, 2, 1], W: [5, 8, 5] },
    element: "virus",
    credit: { ripper: "Sonicteam24", creditRequiredBySheet: true, creditTextOnSheet: "Guilmon Digimon Wold DS sprites ripped by Sonicteam24 Credit is needed if used..." },
  },
  {
    id: "CREATURE-0019",
    slug: "gabumon-official",
    name: "Gabumon",
    species: "CREATURE-0009",
    sheet: "gabumon.png",
    region: [305, 0, 107, 175],
    bg: [0xc8d8a0, 0x008080],
    cells: 15,
    // 1–3 SW (frente 3/4, olhando à esquerda) · 4–6 = espelho (SE) · 7–9 NW (costas 3/4) · 10–12 = espelho (NE) ·
    // 13–14 S (2 quadros) · 15 S de punho erguido (única pose de ação do mapa)
    mirrorsExpected: [[1, 4], [2, 5], [3, 6], [7, 10], [8, 11], [9, 12]],
    dupesExpected: [],
    dirs: { S: { stand: 13, steps: [14] }, SW: { stand: 1, steps: [2, 3] }, NW: { stand: 7, steps: [8, 9] } },
    attack: { S: [13, 15, 13], SW: [1, 3, 1], NW: [7, 9, 7] },
    element: "data",
    credit: { ripper: "redblueyellow", creditRequiredBySheet: false, creditTextOnSheet: "Ripped by redblueyellow. No credit needed." },
  },
];

const rgbOf = (d, i) => (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];

async function readSheet(file) {
  const img = await loadImage(file);
  const c = createCanvas(img.width, img.height);
  const g = c.getContext("2d");
  g.drawImage(img, 0, 0);
  return { W: img.width, H: img.height, d: g.getImageData(0, 0, img.width, img.height).data };
}

/** Componentes conexos (8-viz.) não-fundo na região; os pequenos (< 20 px) vão para o quadro grande que os contém. */
function findCells(S, [rx, ry, rw, rh], bg) {
  const isBg = (x, y) => bg.has(rgbOf(S.d, (y * S.W + x) * 4)) || S.d[(y * S.W + x) * 4 + 3] === 0;
  const seen = new Uint8Array(S.W * S.H);
  const comps = [];
  for (let y = ry; y < ry + rh; y++)
    for (let x = rx; x < rx + rw; x++) {
      const p = y * S.W + x;
      if (seen[p] || isBg(x, y)) continue;
      const q = [p];
      const px = [];
      seen[p] = 1;
      while (q.length) {
        const c = q.pop();
        const cx = c % S.W;
        const cy = (c - cx) / S.W;
        px.push([cx, cy]);
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx < rx || ny < ry || nx >= rx + rw || ny >= ry + rh) continue;
            const np = ny * S.W + nx;
            if (seen[np] || isBg(nx, ny)) continue;
            seen[np] = 1;
            q.push(np);
          }
      }
      comps.push(px);
    }
  const box = (px) => {
    const xs = px.map((p) => p[0]);
    const ys = px.map((p) => p[1]);
    return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
  };
  const big = comps.filter((c) => c.length >= 20).map((px) => ({ px, ...box(px) }));
  let merged = 0;
  for (const c of comps.filter((c) => c.length < 20)) {
    const b = box(c);
    const host = big.find((h) => b.x0 >= h.x0 - 3 && b.x1 <= h.x1 + 3 && b.y0 >= h.y0 - 3 && b.y1 <= h.y1 + 3);
    if (!host) throw new Error(`pixel solto sem quadro em ${b.x0},${b.y0}`);
    host.px.push(...c);
    Object.assign(host, box(host.px));
    merged++;
  }
  big.sort((a, b) => Math.round(a.y0 / 20) - Math.round(b.y0 / 20) || a.x0 - b.x0);
  return { cells: big, merged };
}

/** Quadro como matriz w×h de RGB (-1 = transparente). */
function cellPixels(S, c) {
  const w = c.x1 - c.x0 + 1;
  const h = c.y1 - c.y0 + 1;
  const m = new Int32Array(w * h).fill(-1);
  for (const [x, y] of c.px) m[(y - c.y0) * w + (x - c.x0)] = rgbOf(S.d, (y * S.W + x) * 4);
  return { w, h, m };
}

function diff(a, b, flip) {
  if (a.w !== b.w || a.h !== b.h) return Infinity;
  let n = 0;
  for (let y = 0; y < a.h; y++) for (let x = 0; x < a.w; x++) if (a.m[y * a.w + x] !== b.m[y * b.w + (flip ? b.w - 1 - x : x)]) n++;
  return n;
}

/**
 * dx (translação inteira) que melhor encaixa a cabeça/tronco (55% de cima) de `f` sobre a do quadro parado `ref`,
 * os dois com o pé na mesma linha. Conta pixels opacos de cor IGUAL; empate → o menor |dx|.
 */
function registerX(ref, refX, f) {
  const rows = Math.ceil(Math.max(ref.h, f.h) * 0.55);
  let best = { dx: 0, score: -1 };
  for (let dx = -8; dx <= 8; dx++) {
    let s = 0;
    for (let yy = 0; yy < rows; yy++) {
      // linha a partir do topo do ref (alinhado pelo pé)
      const yr = yy;
      const yf = yy - (ref.h - f.h);
      if (yf < 0 || yf >= f.h) continue;
      for (let x = 0; x < f.w; x++) {
        const c = f.m[yf * f.w + x];
        if (c < 0) continue;
        const xr = x + dx + (refX.fx - refX.rx);
        if (xr < 0 || xr >= ref.w) continue;
        if (ref.m[yr * ref.w + xr] === c) s++;
      }
    }
    if (s > best.score || (s === best.score && Math.abs(dx) < Math.abs(best.dx))) best = { dx, score: s };
  }
  return best;
}

async function build(sp) {
  const src = join(SHEETS, sp.sheet);
  const S = await readSheet(src);
  const { cells, merged } = findCells(S, sp.region, new Set(sp.bg));
  if (cells.length !== sp.cells) throw new Error(`${sp.name}: ${cells.length} quadros na grade (esperava ${sp.cells})`);
  const pix = cells.map((c) => cellPixels(S, c));
  // prova dos espelhos e duplicatas (falha alto se a folha mudar)
  for (const [a, b] of sp.mirrorsExpected) if (diff(pix[a - 1], pix[b - 1], true) !== 0) throw new Error(`${sp.name}: #${b} não é espelho de #${a}`);
  for (const [a, b] of sp.dupesExpected) if (diff(pix[a - 1], pix[b - 1], false) !== 0) throw new Error(`${sp.name}: #${b} não é igual a #${a}`);

  const OUT = join(GA, "01-creatures", `${sp.id}-${sp.slug}`);
  rmSync(join(OUT, "sprites"), { recursive: true, force: true });
  mkdirSync(join(OUT, "sprites"), { recursive: true });
  mkdirSync(join(OUT, "source"), { recursive: true });

  const metrics = {};
  const keyOf = {}; // índice da folha → atlasKey
  const place = (idx, dir, role, n, refInfo) => {
    const f = pix[idx - 1];
    let x0;
    let reg = null;
    if (!refInfo) x0 = Math.round(CW / 2 - f.w / 2);
    else {
      // a posição relativa ao ref que a cabeça pede: dx sobre a borda esquerda do ref
      reg = registerX(refInfo.p, { fx: 0, rx: 0 }, f);
      x0 = refInfo.x0 + reg.dx;
    }
    const y0 = FOOT - f.h + 1;
    if (x0 < 0 || x0 + f.w > CW || y0 < 0) throw new Error(`${sp.name} #${idx}: não cabe no canvas ${CW}×${CH} (x0 ${x0}, y0 ${y0})`);
    const c = createCanvas(CW, CH);
    const g = c.getContext("2d");
    const id = g.createImageData(CW, CH);
    for (let y = 0; y < f.h; y++)
      for (let x = 0; x < f.w; x++) {
        const v = f.m[y * f.w + x];
        if (v < 0) continue;
        const o = ((y0 + y) * CW + (x0 + x)) * 4;
        id.data[o] = (v >> 16) & 255;
        id.data[o + 1] = (v >> 8) & 255;
        id.data[o + 2] = v & 255;
        id.data[o + 3] = 255;
      }
    g.putImageData(id, 0, 0);
    const key = `${sp.id}_${role}_${dir}_${String(n).padStart(2, "0")}.png`;
    writeFileSync(join(OUT, "sprites", key), c.toBuffer("image/png"));
    const cell = cells[idx - 1];
    metrics[key] = { sheetCell: idx, sheetRect: { x: cell.x0, y: cell.y0, w: f.w, h: f.h }, canvasRect: { x: x0, y: y0, w: f.w, h: f.h }, footY: FOOT, height: f.h, registerDx: reg?.dx ?? null, registerScore: reg?.score ?? null };
    keyOf[`${dir}:${idx}`] = key;
    return { x0, p: f };
  };

  // um arquivo por quadro ÚNICO de cada direção desenhada (parado = _00, passos = _01, _02; pose extra = _03)
  for (const [dir, d] of Object.entries(sp.dirs)) {
    const ref = place(d.stand, dir, "map", 0, null);
    d.steps.forEach((idx, i) => place(idx, dir, "map", i + 1, ref));
    for (const idx of sp.attack[dir]) if (!keyOf[`${dir}:${idx}`]) place(idx, dir, "map", 3, ref);
  }

  const fr = (dir, idx, ms) => ({ durationMs: ms, atlasKey: keyOf[`${dir}:${idx}`] });
  const dirs = Object.keys(sp.dirs);
  const walkOf = (dir) => {
    const d = sp.dirs[dir];
    // DS: parado → passo A → parado → passo B (com 1 passo só: parado ↔ passo)
    const seq = d.steps.length >= 2 ? [d.stand, d.steps[0], d.stand, d.steps[1]] : [d.stand, d.steps[0]];
    return seq.map((i) => fr(dir, i, d.steps.length >= 2 ? 150 : 200));
  };
  const per = (fn) => Object.fromEntries(dirs.map((d) => [d, fn(d)]));
  const first = dirs[0];
  const attackOf = (dir) => sp.attack[dir].map((idx, i) => fr(dir, idx, [180, 160, 60][i]));
  const hurtOf = (dir) => [fr(dir, sp.dirs[dir].stand, 220)];
  const idleOf = (dir) => [fr(dir, sp.dirs[dir].stand, 600)];
  const mirroredOf = Object.fromEntries(dirs.filter((d) => d !== "S" && d !== "N").map((d) => [{ W: "E", SW: "SE", NW: "NE" }[d], d]));
  const dirSpec = { drawn: dirs, mirrored: mirroredOf, fallback: "nearest" };
  const stand = pix[sp.dirs.S.stand - 1];
  const heights = Object.values(metrics).map((m) => m.height);
  const xs0 = Object.values(metrics).map((m) => m.canvasRect.x);
  const xs1 = Object.values(metrics).map((m) => m.canvasRect.x + m.canvasRect.w - 1);
  const top = Math.min(...Object.values(metrics).map((m) => m.canvasRect.y));

  const manifest = {
    schemaVersion: 2,
    version: "1.0.0",
    previousVersions: [],
    id: sp.id,
    name: sp.name,
    category: "digital-creature",
    rarity: "common",
    element: sp.element,
    attributes: {},
    evolutionStage: "rookie",
    evolutionLine: { lineId: sp.name.toLowerCase(), previous: null, next: [] },
    evolutionRequirements: {},
    description: `${sp.name} com os sprites de MAPA oficiais do Digimon World DS, recortados direto da folha (sem redesenho nem reamostragem). Visual do modo ?mon=official para a espécie ${sp.species}; não substitui ${sp.species} nem entra no roster.`,
    dimensions: { frameW: CW, frameH: CH, tile: 32 },
    pivot: PIVOT,
    mapScale: 1,
    targetHeightPx: stand.h,
    nativeMapHeightPx: stand.h,
    sizeNotes: `Altura nativa do DS (parado, frente): ${stand.h} px. A escala de exibição vem de ?monscale=1|2|auto (src/save/official.ts); auto = inteiro que deixa a altura mais perto de 48–64 px.`,
    hitbox: { x: Math.min(...xs0), y: top, w: Math.max(...xs1) - Math.min(...xs0) + 1, h: FOOT - top + 1 },
    anchors: { head: { x: PIVOT.x, y: FOOT - stand.h + 3 }, hit: { x: PIVOT.x, y: FOOT - Math.round(stand.h / 2) }, shadow: { cx: PIVOT.x, cy: PIVOT.y - 1, rx: 10, ry: 4 } },
    directions: { idle: dirSpec, walk: dirSpec, attack: dirSpec, hurt: dirSpec },
    animations: {
      idle: { loop: true, space: "map", frames: idleOf(first), events: [], dirFrames: per(idleOf) },
      walk: { loop: true, space: "map", frames: walkOf(first), events: [], dirFrames: per(walkOf) },
      attack: { loop: false, space: "map", frames: attackOf(first), events: [{ frame: 1, name: "hitFrame" }], dirFrames: per(attackOf) },
      hurt: { loop: false, space: "map", frames: hurtOf(first), events: [], dirFrames: per(hurtOf) },
    },
    walkSpeedPxPerSec: 160,
    anatomy: "biped",
    combatStates: { IDLE: "idle", WALK: "walk", FOLLOW: "walk", ENGAGE: "walk", RETURN: "walk", ATTACK: "attack", HURT: "hurt", DEFEAT: "hurt" },
    sprites: "./sprites/",
    assetOrigin: {
      layer: "official-fan-use",
      sourceDescription: `Folha Digimon World DS (${sp.sheet}) do The Spriters Resource, ripada por ${sp.credit.ripper}; enviada pelo fundador (10-source-files/dwds-sheets/). Só a grade de MAPA.`,
      built: "prototype/world/scripts/build-official-mons.mjs (recorte + chroma key + translação inteira; nenhum pixel redesenhado ou reamostrado)",
    },
    approvalStatus: "UNDER_REVIEW",
    qaNotes: [
      `[E] Grade de mapa: ${sp.cells} quadros; espelhos exatos na própria folha: ${sp.mirrorsExpected.map(([a, b]) => `#${b}=espelho(#${a})`).join(", ")}${sp.dupesExpected.length ? `; duplicatas: ${sp.dupesExpected.map(([a, b]) => `#${b}=#${a}`).join(", ")}` : ""}. Desenhadas: ${dirs.join(", ")}; espelhadas: ${Object.entries(mirroredOf).map(([k, v]) => `${k}←${v}`).join(", ")}.`,
      "[E] Sem vista de costas (N) no DS: N e as diagonais que faltam caem na desenhada mais próxima (fallback nearest).",
      "attack/hurt: o DS não tem golpe nem dano no sprite de MAPA. attack = parado → passo/pose → parado, com o avanço procedural; hurt = quadro parado + flash/knockback procedurais. As poses de batalha (75–80 px) ficam em CREATURE-0003/0009 battle_*.",
    ],
  };
  writeFileSync(join(OUT, "creature.json"), JSON.stringify(manifest, null, 2) + "\n");
  const sha = createHash("sha256").update(readFileSync(src)).digest("hex");
  writeFileSync(
    join(OUT, "license.json"),
    JSON.stringify(
      {
        creatureId: sp.id,
        version: "1.0.0",
        layer: "official-fan-use",
        officialRip: true,
        fanException: false,
        baseCharacter: sp.name,
        basis: "ADR-009 §Licença (fundador, 2026-11-08: sprites oficiais liberados em todo o projeto) + decisão do fundador 2026-11-11 (fan game: Digimon iguais aos oficiais)",
        nonCommercial: true,
        noRip: false,
        copyright: "Digimon © Bandai Namco Entertainment Inc. / Toei Animation; Digimon World DS © Bandai Namco Games",
        restrictions: ["ADR-007: fan game sem monetização de nenhum tipo, sem logo oficial, com aviso de fan game", "Publicação exige aprovação separada do fundador", `Visual do modo ?mon=official; a espécie da sim continua ${sp.species}`],
        source: { type: "game-rip", game: "Digimon World DS (Nintendo DS)", site: "The Spriters Resource", sitePage: "https://www.spriters-resource.com/ds_dsi/dgmnworldds/", sheetFile: `10-source-files/dwds-sheets/${sp.sheet}`, sha256: sha, providedBy: "fundador", modifications: "chroma key do fundo; quadros da grade de mapa recortados e realinhados por translação inteira (pé fixo, x pela cabeça)" },
        credit: { ...sp.credit, site: "The Spriters Resource" },
        verifiedAt: "2026-11-11",
        verifiedBy: "game-dev",
      },
      null,
      2,
    ) + "\n",
  );
  writeFileSync(join(OUT, "source/metrics.json"), JSON.stringify({ sheet: sp.sheet, region: sp.region, mergedLoosePixels: merged, frames: metrics }, null, 2) + "\n");
  console.log(sp.id, sp.name, { frames: Object.keys(metrics).length, drawn: dirs, standH: stand.h, heights: `${Math.min(...heights)}–${Math.max(...heights)}`, merged, dx: Object.fromEntries(Object.entries(metrics).map(([k, m]) => [k.replace(`${sp.id}_map_`, ""), m.registerDx])) });
}

for (const sp of SPECIES) await build(sp);
