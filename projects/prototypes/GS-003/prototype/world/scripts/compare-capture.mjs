// ?team=compare: capturas do Guilmon 64 px (PixelLab) e do Gabumon 64 px (à mão) lado a lado no mapa, a troca entre
// eles e um WebM curto. Usa o servidor JÁ rodando na 5190 e as mesmas variáveis do qo3-capture.mjs.
// Uso (de prototype/world/): node scripts/compare-capture.mjs [lado|troca|video|all]
// Saída: ../../quality-overhaul/phase3/feedback1/compare/

import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.env.OUT ?? join(ROOT, "../../quality-overhaul/phase3/feedback1/compare");
const BASE = process.env.BASE ?? "http://127.0.0.1:5190";
const ID = "digimon-forest-01";
const Q = `/?team=compare&map=${ID}&look=v9&dpr=1&time=day&criador=0&novo=1&seed=7&auto=0`;
const what = process.argv[2] ?? "all";
mkdirSync(OUT, { recursive: true });

const { chromium } = await import(process.env.PW_CORE);
const browser = await chromium.launch({
  executablePath: process.env.CHROME,
  args: ["--no-sandbox", "--disable-gpu", "--no-proxy-server", "--hide-scrollbars", "--mute-audio"],
  env: { ...process.env, LD_LIBRARY_PATH: [process.env.CHROME_LIBS, process.env.LD_LIBRARY_PATH].filter(Boolean).join(":") },
});
const report = { date: new Date().toISOString(), url: `${BASE}${Q}`, shots: {}, video: {} };

const WALKER = `window.__walkTo = (tx, ty, maxMs = 30000) => new Promise((res) => {
  const g = window.__gs003, s = g.sim, m = s.map, W = m.width, H = m.height, SUB = 16;
  const p = s.state.players.find((q) => q.id === "p1"), t = s.state.entities.find((e) => e.id === p.tamerId);
  const free = (x, y) => x >= 0 && y >= 0 && x < W && y < H && !m.solid[y * W + x];
  const sx = Math.floor(t.x / SUB), sy = Math.floor(t.y / SUB);
  const prev = new Int32Array(W * H).fill(-1); const q = [sy * W + sx]; prev[q[0]] = q[0];
  for (let h = 0; h < q.length; h++) { const x = q[h] % W, y = Math.floor(q[h] / W); if (x === tx && y === ty) break;
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]) { const nx = x + dx, ny = y + dy;
      if (!free(nx, ny) || prev[ny * W + nx] !== -1) continue; if (dx && dy && (!free(x + dx, y) || !free(x, y + dy))) continue;
      prev[ny * W + nx] = q[h]; q.push(ny * W + nx); } }
  const path = []; let c = ty * W + tx; if (prev[c] === -1) return res(false);
  while (c !== prev[c]) { path.unshift({ x: c % W, y: Math.floor(c / W) }); c = prev[c]; }
  let i = 0; const t0 = performance.now();
  const iv = setInterval(() => { const cur = path[i];
    if (!cur || performance.now() - t0 > maxMs) { clearInterval(iv); t.dest = undefined; return res(!cur); }
    const cx = cur.x * SUB + 8, cy = cur.y * SUB + 8;
    if (Math.hypot(t.x - cx, t.y - cy) < 5) { i++; return; }
    t.dest = { x: cx, y: cy }; t.stuckTicks = 0; }, 40); });`;

async function open(page, extra = "") {
  await page.goto(`${BASE}${Q}${extra}`);
  await page.waitForFunction((id) => window.__gs003 && window.__gs003.mapId === id, ID, { timeout: 120000 });
  await page.evaluate(WALKER);
  await page.waitForTimeout(1500);
}
/** Tamer em (tx, ty); a parceira 1 tile à esquerda e 1,5 abaixo dele (à frente), olhando para o sul. */
const place = (page, tx, ty) =>
  page.evaluate(([tx, ty]) => {
    const s = window.__gs003.sim, SUB = 16, p = s.state.players.find((q) => q.id === "p1");
    const t = s.state.entities.find((e) => e.id === p.tamerId), pa = s.state.entities.find((e) => e.id === p.partnerId);
    t.x = tx * SUB + 8; t.y = ty * SUB + 8; t.dest = undefined; t.facing = "S"; t.trail = [{ x: t.x, y: t.y - 4 }, { x: t.x, y: t.y }];
    pa.x = t.x - SUB; pa.y = t.y + 24; pa.dest = undefined; pa.facing = "S";
    // capturas limpas: selvagens perto saem de cena (despawn normal da sim)
    for (const e of s.state.entities) if (e.kind === "wild" && Math.hypot(e.x - t.x, e.y - t.y) < 9 * SUB) { e.state = "DEFEAT"; e.stateTicks = 1; e.zoneIndex = undefined; }
  }, [tx, ty]);
const partnerSp = (page) => page.evaluate(() => { const s = window.__gs003.sim, p = s.state.players.find((q) => q.id === "p1"); return s.state.entities.find((e) => e.id === p.partnerId).speciesId; });
/** Recorte (CSS px) em volta da parceira. */
const around = (page, w, h, dy = -18) =>
  page.evaluate(([w, h, dy]) => {
    const g = window.__gs003, v = g.view, k = g.scaleInfo.cssPerLogical, s = g.sim, p = s.state.players.find((q) => q.id === "p1");
    const a = v.motionPos(p.partnerId), b = v.motionPos("compare-show") ?? { x: a.x + 40, y: a.y };
    const cx = ((a.x + b.x) / 2 - v.camera.x) * k, cy = ((a.y + b.y) / 2 + dy - v.camera.y) * k;
    return { x: Math.max(0, Math.round(cx - w / 2)), y: Math.max(0, Math.round(cy - h / 2)), width: w, height: h };
  }, [w, h, dy]);
const shot = async (page, name, meta, clip) => {
  await page.screenshot({ path: join(OUT, name), ...(clip ? { clip } : {}) });
  report.shots[name] = meta;
  console.log("shot", name);
};
async function zoom(src, dst, k) {
  const img = await loadImage(join(OUT, src));
  const c = createCanvas(img.width * k, img.height * k);
  const g = c.getContext("2d");
  g.imageSmoothingEnabled = false;
  g.drawImage(img, 0, 0, c.width, c.height);
  writeFileSync(join(OUT, dst), c.toBuffer("image/png"));
}

// ---------- lado a lado ----------
async function lado() {
  for (const [anim, tag] of [["&anim=v2", "v2"], ["", "v1"]]) {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await open(page, anim);
    await place(page, 30, 21);
    // parceira ativa = Guilmon PixelLab; o modelo parado do Gabumon à mão 2 tiles à direita dela
    await page.evaluate(() => window.__gs003.compareShowcase("CREATURE-0009", 2.5));
    await page.waitForTimeout(1500);
    await shot(page, `cmp_lado_a_lado_${tag}_tela.png`, { anim: tag, left: await partnerSp(page), right: "CREATURE-0009 (visual CREATURE-0119)" });
    await page.evaluate(() => (document.querySelector("#hud").style.visibility = "hidden"));
    const clip = await around(page, 440, 190);
    await shot(page, `cmp_lado_a_lado_${tag}.png`, { anim: tag, clip }, clip);
    await zoom(`cmp_lado_a_lado_${tag}.png`, `cmp_lado_a_lado_${tag}_x3.png`, 3);
    await page.evaluate(() => (document.querySelector("#hud").style.visibility = ""));
    await page.close();
  }
}

// ---------- troca (Shift+2) ----------
async function troca() {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await open(page, "&anim=v2");
  await place(page, 30, 21);
  await page.waitForTimeout(1200);
  await shot(page, "cmp_troca_0_guilmon_tela.png", { active: await partnerSp(page) });
  const clip = await around(page, 360, 230);
  await page.evaluate(() => (document.querySelector("#hud").style.visibility = "hidden"));
  await shot(page, "cmp_troca_0_guilmon.png", {}, clip);
  await page.evaluate(() => (document.querySelector("#hud").style.visibility = ""));
  await page.keyboard.press("Shift+Digit2");
  let last = 0;
  for (const [ms, tag] of [[150, "1_recuo"], [380, "2_recuo_fim"], [600, "3_entrada"], [1400, "4_gabumon"]]) {
    await page.waitForTimeout(ms - last);
    last = ms;
    await shot(page, `cmp_troca_${tag}.png`, { ms }, clip);
  }
  await shot(page, "cmp_troca_4_gabumon_tela.png", { active: await partnerSp(page) });
  // volta (depois da recarga), clicando no retrato da equipe
  await page.waitForTimeout(1600);
  await page.click(".hud-team [data-slot=team0]");
  await page.waitForTimeout(1400);
  await shot(page, "cmp_troca_5_volta_guilmon_tela.png", { active: await partnerSp(page), via: "clique no retrato" });
  const sheet = createCanvas(360 * 3 * 2, 230 * 2 * 2 + 40);
  const g = sheet.getContext("2d");
  g.imageSmoothingEnabled = false;
  g.fillStyle = "#11131c";
  g.fillRect(0, 0, sheet.width, sheet.height);
  g.fillStyle = "#e8ecf8";
  g.font = "bold 26px sans-serif";
  g.fillText("Troca (Shift+2): Guilmon PixelLab recua, Gabumon à mão entra", 16, 30);
  const tiles = ["0_guilmon", "1_recuo", "2_recuo_fim", "3_entrada", "4_gabumon"];
  for (const [i, t] of tiles.entries()) {
    const img = await loadImage(join(OUT, `cmp_troca_${t}.png`));
    const col = i % 3, row = Math.floor(i / 3);
    g.drawImage(img, col * 360 * 2, 40 + row * 230 * 2, 360 * 2, 230 * 2);
  }
  writeFileSync(join(OUT, "cmp_troca_sequencia.png"), sheet.toBuffer("image/png"));
  console.log("shot cmp_troca_sequencia.png");
  report.shots.log = await page.evaluate(() => [...document.querySelectorAll(".hud-log li")].slice(0, 5).map((l) => l.textContent));
  await page.close();
}

// ---------- vídeo ----------
async function video() {
  const dir = join(OUT, "_video");
  mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1, recordVideo: { dir, size: { width: 1280, height: 720 } } });
  const page = await ctx.newPage();
  const t0 = Date.now();
  const marks = [];
  const mark = (label) => marks.push({ s: +((Date.now() - t0) / 1000).toFixed(1), label });
  await open(page, "&anim=v2");
  await place(page, 30, 21);
  await page.evaluate(() => window.__gs003.compareShowcase("CREATURE-0009", 2.5));
  await page.waitForTimeout(800);
  mark("lado a lado: Guilmon PixelLab (ativo) e Gabumon à mão (modelo parado)");
  await page.waitForTimeout(2600);
  await page.evaluate(() => window.__gs003.compareShowcase(null));
  mark("anda com o Guilmon PixelLab (S, E, W, N) e para");
  for (const [x, y] of [[30, 24], [34, 24], [30, 24], [30, 21]]) {
    await page.evaluate(([x, y]) => window.__walkTo(x, y), [x, y]);
    await page.waitForTimeout(700);
  }
  mark("troca (Shift+2): Gabumon à mão entra");
  await page.keyboard.press("Shift+Digit2");
  await page.waitForTimeout(1800);
  mark("anda com o Gabumon à mão (S, E, W, N) e para");
  for (const [x, y] of [[30, 24], [34, 24], [30, 24], [30, 21]]) {
    await page.evaluate(([x, y]) => window.__walkTo(x, y), [x, y]);
    await page.waitForTimeout(700);
  }
  mark("troca de volta (clique no retrato)");
  await page.click(".hud-team [data-slot=team0]");
  await page.waitForTimeout(1800);
  await place(page, 30, 21);
  await page.evaluate(() => window.__gs003.compareShowcase("CREATURE-0009", 2.5));
  mark("lado a lado de novo");
  await page.waitForTimeout(2500);
  mark("fim");
  const vid = page.video();
  await ctx.close();
  await vid.saveAs(join(OUT, "cmp_video_bruto.webm"));
  await vid.delete();
  rmSync(dir, { recursive: true, force: true });
  report.video = { raw: "cmp_video_bruto.webm", marks, size: [1280, 720] };
  console.log("video", JSON.stringify(report.video));
}

try {
  if (what === "lado" || what === "all") await lado();
  if (what === "troca" || what === "all") await troca();
  if (what === "video" || what === "all") await video();
} finally {
  await browser.close();
  writeFileSync(join(OUT, `cmp_report_${what}.json`), JSON.stringify(report, null, 2));
}
