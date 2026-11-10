// Quality Overhaul fase 3 / forest-v10: capturas 1920×1080 da clareira-piloto (look v9) antes e depois do chão e das
// árvores do pacote art/map-factory/forest-v10-ground-trees, zoom no chão com medição de grade e desempenho.
// Usa o servidor JÁ rodando na 5190; nunca a 5174. Mesmo ambiente do scripts/qo3-capture.mjs (PW_CORE, CHROME,
// CHROME_LIBS). Uso (de prototype/world/):
//   TAG=antes node scripts/v10-capture.mjs [shots|ground|perf|all]   (antes de rodar o derive-look-v9 com o v10)
//   TAG=depois node scripts/v10-capture.mjs all
// Saída: quality-overhaul/phase3/v10/v10_<TAG>_*.png + v10_<TAG>_capture.json.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.env.OUT ?? join(ROOT, "../../quality-overhaul/phase3/v10");
const BASE = process.env.BASE ?? "http://127.0.0.1:5190";
const TAG = process.env.TAG ?? "depois";
const W = 1920;
const H = 1080;
const ID = "digimon-forest-01";
const Q = "&look=v9&dpr=1&anim=v2&encounters=1";
const what = process.argv[2] ?? "all";
mkdirSync(OUT, { recursive: true });

const { chromium } = await import(process.env.PW_CORE);
const browser = await chromium.launch({
  executablePath: process.env.CHROME,
  args: ["--no-sandbox", "--disable-gpu", "--no-proxy-server", "--hide-scrollbars", "--mute-audio"],
  env: { ...process.env, LD_LIBRARY_PATH: [process.env.CHROME_LIBS, process.env.LD_LIBRARY_PATH].filter(Boolean).join(":") },
});
const report = { date: new Date().toISOString(), base: BASE, tag: TAG, viewport: [W, H], shots: {}, ground: {}, perf: [] };

async function open(page, query) {
  for (let i = 0; ; i++) {
    try {
      await page.goto(`${BASE}/?map=${ID}&criador=0&novo=1&seed=7&auto=0${query}`, { waitUntil: "domcontentloaded", timeout: 90000 });
      break;
    } catch (e) {
      if (i >= 1) throw e;
    }
  }
  await page.waitForFunction((id) => window.__gs003 && window.__gs003.mapId === id, ID, { timeout: 90000 });
  await page.waitForTimeout(2000);
}
const tp = (page, tx, ty, partner = [-1, 0]) =>
  page.evaluate(([tx, ty, partner]) => {
    const s = window.__gs003.sim, SUB = 16;
    const p = s.state.players.find((q) => q.id === "p1");
    p.auto = false;
    const t = s.state.entities.find((e) => e.id === p.tamerId), pa = s.state.entities.find((e) => e.id === p.partnerId);
    t.x = tx * SUB + 8; t.y = ty * SUB + 8; t.dest = undefined; t.trail = [{ x: t.x - 4, y: t.y }, { x: t.x, y: t.y }];
    if (pa) { pa.x = t.x + partner[0] * SUB; pa.y = t.y + partner[1] * SUB; pa.dest = undefined; }
  }, [tx, ty, partner]);
const hideHud = (page) => page.evaluate(() => { for (const s of ["#hud", ".enc-debug"]) document.querySelectorAll(s).forEach((e) => (e.style.visibility = "hidden")); });
const cam = (page) => page.evaluate(() => { const v = window.__gs003.view; return { x: v.camera.x, y: v.camera.y, w: v.camera.w, h: v.camera.h }; });
const shot = async (page, name, meta, clip) => {
  await page.screenshot({ path: join(OUT, name), ...(clip ? { clip } : {}) });
  report.shots[name] = { ...meta, ...(clip ? { clip } : {}) };
  console.log("ok", name);
};

async function shots() {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  for (const time of ["day", "night"]) {
    const t = time === "day" ? "dia" : "noite";
    // visão de jogo (mesma câmera das capturas p7_clareira_*): Tamer no centro da clareira, perto do baú
    await open(page, `${Q}&time=${time}`);
    await hideHud(page);
    await tp(page, 29, 20);
    await page.waitForTimeout(2200);
    await shot(page, `v10_${TAG}_${t}_jogo.png`, { query: Q, time, framing: "jogo (dpr=1)", tamerTile: [29, 20], camera: await cam(page) });
    // visão geral da clareira inteira (zoom=1: 1 px físico por px de arte)
    await open(page, `${Q}&time=${time}&zoom=1`);
    await hideHud(page);
    await tp(page, 27, 18);
    await page.waitForTimeout(2200);
    await shot(page, `v10_${TAG}_${t}_geral.png`, { query: `${Q}&zoom=1`, time, framing: "geral (zoom=1)", tamerTile: [27, 18], camera: await cam(page) });
  }
  await page.close();
}

/**
 * Zoom no chão (zoom=4, dia): recorte de 5×4 tiles de grama aberta. Medição de grade: diferença média de cor entre
 * pixels de arte vizinhos que ficam em LADOS OPOSTOS de uma linha de tile (32 px) contra a mesma diferença dentro do
 * tile. Razão ~1 = a linha do tile não se distingue do resto da textura; > 1,3 começa a ler como grade.
 */
async function ground() {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const AREAS = [
    { id: "clareira-leste", tamer: [44, 25], box: [39, 17, 48, 22] },
    { id: "clareira-norte", tamer: [10, 4], box: [5, 2, 12, 6] },
    // terra batida do v10 (autotile grama↔terra) em volta da fogueira
    { id: "acampamento", tamer: [45, 27], box: [38, 23, 47, 30] },
  ];
  for (const a of AREAS) {
    await open(page, `${Q}&time=day&zoom=4`);
    await hideHud(page);
    await tp(page, ...a.tamer);
    await page.waitForTimeout(2200);
    const c = await cam(page);
    const k = W / c.w;
    const [bx0, by0, bx1, by1] = a.box;
    const x0 = Math.max(0, Math.round((bx0 * 32 - c.x) * k));
    const y0 = Math.max(0, Math.round((by0 * 32 - c.y) * k));
    const clip = { x: x0, y: y0, width: Math.min(W - x0, Math.round((bx1 - bx0) * 32 * k)), height: Math.min(H - y0, Math.round((by1 - by0) * 32 * k)) };
    const name = `v10_${TAG}_chao_zoom_${a.id}.png`;
    await shot(page, name, { query: `${Q}&zoom=4`, time: "day", framing: "zoom no chão (zoom=4)", box: a.box, camera: c, scale: k }, clip);
    report.ground[a.id] = await seamMetric(join(OUT, name), k, (bx0 * 32 - c.x) * k - x0, (by0 * 32 - c.y) * k - y0);
    console.log("grade", a.id, JSON.stringify(report.ground[a.id]));
    await gridOverlay(join(OUT, name), k, (bx0 * 32 - c.x) * k - x0, (by0 * 32 - c.y) * k - y0, join(OUT, name.replace(".png", "_grade32.png")));
  }
  await page.close();
}

async function seamMetric(file, k, ox, oy) {
  const img = await loadImage(file);
  const cv = createCanvas(img.width, img.height);
  const g = cv.getContext("2d");
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, img.width, img.height).data;
  const px = (x, y) => { if (x < 0 || y < 0 || x >= img.width || y >= img.height) return undefined; const i = (y * img.width + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
  const diff = (a, b) => (a && b ? Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) : undefined);
  const s = Math.round(k);
  const ax = Math.round(ox), ay = Math.round(oy);
  let seam = 0, ns = 0, inner = 0, ni = 0;
  // pares horizontais de pixels de arte (centro do bloco k×k): u = coluna de arte desde a borda esquerda do box
  for (let v = 0; (v + 1) * s + ay < img.height; v++)
    for (let u = 0; (u + 2) * s + ax < img.width; u++) {
      const y = ay + v * s + (s >> 1);
      const dd = diff(px(ax + u * s + (s >> 1), y), px(ax + (u + 1) * s + (s >> 1), y));
      if (dd === undefined) continue;
      if ((u + 1) % 32 === 0) { seam += dd; ns++; } else { inner += dd; ni++; }
    }
  for (let u = 0; (u + 1) * s + ax < img.width; u++)
    for (let v = 0; (v + 2) * s + ay < img.height; v++) {
      const x = ax + u * s + (s >> 1);
      const dd = diff(px(x, ay + v * s + (s >> 1)), px(x, ay + (v + 1) * s + (s >> 1)));
      if (dd === undefined) continue;
      if ((v + 1) % 32 === 0) { seam += dd; ns++; } else { inner += dd; ni++; }
    }
  const r = (x) => Math.round(x * 100) / 100;
  return { seamPairs: ns, innerPairs: ni, seamMeanDiff: r(seam / ns), innerMeanDiff: r(inner / ni), ratio: r(seam / ns / (inner / ni)) };
}

/** Mesma imagem com as linhas de 32 px desenhadas (só para conferência: onde a grade estaria). */
async function gridOverlay(file, k, ox, oy, out) {
  const img = await loadImage(file);
  const cv = createCanvas(img.width * 2 + 16, img.height);
  const g = cv.getContext("2d");
  g.fillStyle = "#111";
  g.fillRect(0, 0, cv.width, cv.height);
  g.drawImage(img, 0, 0);
  g.drawImage(img, img.width + 16, 0);
  g.strokeStyle = "rgba(255,40,200,0.85)";
  g.lineWidth = 2;
  const step = 32 * k;
  for (let x = ox; x <= img.width; x += step) { g.beginPath(); g.moveTo(img.width + 16 + x, 0); g.lineTo(img.width + 16 + x, img.height); g.stroke(); }
  for (let y = oy; y <= img.height; y += step) { g.beginPath(); g.moveTo(img.width + 16, y); g.lineTo(cv.width, y); g.stroke(); }
  const { writeFileSync: wf } = await import("node:fs");
  wf(out, cv.toBuffer("image/png"));
  console.log("ok", out.split("/").pop());
}

async function perf() {
  const N = 600;
  const WARM = 120;
  const stats = (xs) => {
    const a = [...xs].sort((p, q) => p - q);
    const q = (f) => a[Math.min(a.length - 1, Math.max(0, Math.ceil(f * a.length) - 1))];
    const r3 = (v) => Math.round(v * 1000) / 1000;
    return { n: a.length, p50: r3(q(0.5)), p95: r3(q(0.95)), p99: r3(q(0.99)), mean: r3(a.reduce((s, v) => s + v, 0) / a.length), max: r3(a.at(-1)) };
  };
  for (const framing of [["jogo", ""], ["geral", "&zoom=1"]])
    for (const time of ["day", "night"]) {
      const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
      await page.addInitScript(() => {
        const raf = window.requestAnimationFrame.bind(window);
        const P = (window.__perf = { on: false, work: [], ts: [] });
        window.requestAnimationFrame = (cb) => raf((t) => { const t0 = performance.now(); cb(t); if (P.on) { P.work.push(performance.now() - t0); P.ts.push(t); } });
      });
      await open(page, `${Q}${framing[1]}&time=${time}`);
      await hideHud(page);
      await tp(page, 28, 19);
      await page.evaluate((WARM) => new Promise((res) => { let k = 0; const f = () => (++k >= WARM ? res(k) : requestAnimationFrame(f)); requestAnimationFrame(f); }), WARM);
      await page.evaluate(() => { window.__perf.work = []; window.__perf.ts = []; window.__perf.on = true; });
      await page.waitForFunction((N) => window.__perf.ts.length >= N + 1, N, { timeout: 180000 });
      const loop = await page.evaluate((N) => { const P = window.__perf; P.on = false; return { work: P.work.slice(1, N + 1), ts: P.ts.slice(0, N + 1) }; }, N);
      const raster = await page.evaluate(([N, WARM]) => {
        const g = window.__gs003; const cv = document.querySelector("#world"); const ctx = cv.getContext("2d");
        const out = []; let now = performance.now();
        for (let i = 0; i < WARM; i++) { g.view.render(g.presenter, 0, (now += 16.667)); ctx.getImageData(0, 0, 1, 1); }
        for (let i = 0; i < N; i++) { const t0 = performance.now(); g.view.render(g.presenter, 0, (now += 16.667)); ctx.getImageData(0, 0, 1, 1); out.push(performance.now() - t0); }
        return { out, canvas: [cv.width, cv.height] };
      }, [N, WARM]);
      const scene = await page.evaluate(() => { const g = window.__gs003; return { props: g.sim.map.props.length, decals: g.sim.map.decals?.length ?? 0, fg: g.sim.map.fgProps?.length ?? 0, stats: g.view.stats }; });
      const iv = loop.ts.slice(1).map((t, i) => t - loop.ts[i]);
      const r = { framing: framing[0], time, warmFrames: WARM, canvas: raster.canvas, scene, loopWorkMs: stats(loop.work), loopIntervalMs: stats(iv), renderRasterMs: stats(raster.out) };
      report.perf.push(r);
      console.log(`perf ${TAG} ${framing[0]} ${time}: trabalho p50 ${r.loopWorkMs.p50} p95 ${r.loopWorkMs.p95} · intervalo p50 ${r.loopIntervalMs.p50} · render+raster p50 ${r.renderRasterMs.p50} p95 ${r.renderRasterMs.p95}`);
      await page.close();
    }
}

if (what === "shots" || what === "all") await shots();
if (what === "ground" || what === "all") await ground();
if (what === "perf" || what === "all") await perf();
writeFileSync(join(OUT, `v10_${TAG}_capture${what === "all" ? "" : `_${what}`}.json`), `${JSON.stringify(report, null, 2)}\n`);
await browser.close();
