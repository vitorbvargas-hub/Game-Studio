// ?mon=official: capturas lado a lado (Tamer · Guilmon oficial DS · Guilmon PixelLab v3 · Gabumon oficial DS · Gabumon
// à mão) nas 3 escalas (?monscale=1|2|auto), de dia e de noite, na clareira e no vau; e GIFs curtos de walk e attack
// da parceira oficial. Usa um servidor JÁ rodando (BASE, padrão 5196) e o Playwright do npx (mesmas variáveis do
// qo3-capture.mjs: PW_CORE, CHROME, CHROME_LIBS).
// Uso (de prototype/world/): node scripts/official-capture.mjs [lado|gif|all]
// Saída: ../../quality-overhaul/phase3/official-mons/img/

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createCanvas, ImageData, loadImage } from "@napi-rs/canvas";
import { encodeGif } from "./gif.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.env.OUT ?? join(ROOT, "../../quality-overhaul/phase3/official-mons/img");
const BASE = process.env.BASE ?? "http://127.0.0.1:5196";
const ID = "digimon-forest-01";
const what = process.argv[2] ?? "all";
mkdirSync(OUT, { recursive: true });

const { chromium } = await import(process.env.PW_CORE);
const browser = await chromium.launch({
  executablePath: process.env.CHROME,
  args: ["--no-sandbox", "--disable-gpu", "--no-proxy-server", "--hide-scrollbars", "--mute-audio"],
  env: { ...process.env, LD_LIBRARY_PATH: [process.env.CHROME_LIBS, process.env.LD_LIBRARY_PATH].filter(Boolean).join(":") },
});
const report = { date: new Date().toISOString(), base: BASE, shots: {}, gifs: {} };

/** Lugares (tile do Tamer). Clareira Central (fonte de cura em 33,21) e o vau do riacho (Map Factory R2). */
const PLACES = { clareira: [27, 22], vau: [14, 22] };
const SCALES = ["1", "2", "auto"];

const q = (extra) => `/?map=${ID}&look=v9&dpr=1&criador=0&novo=1&seed=7&${extra}`;
async function open(page, extra) {
  await page.goto(`${BASE}${q(extra)}`);
  await page.waitForFunction((id) => window.__gs003 && window.__gs003.mapId === id, ID, { timeout: 120000 });
  await page.waitForTimeout(1500);
}

/** Tamer em (tx, ty); a parceira dx tiles (da sim) à direita na mesma linha de pés; selvagens perto saem de cena. */
const place = (page, tx, ty, dxTiles = 1.75) =>
  page.evaluate(([tx, ty, dx]) => {
    const s = window.__gs003.sim, SUB = 16, p = s.state.players.find((q) => q.id === "p1");
    const t = s.state.entities.find((e) => e.id === p.tamerId), pa = s.state.entities.find((e) => e.id === p.partnerId);
    t.x = tx * SUB + 8; t.y = ty * SUB + 8; t.dest = undefined; t.facing = "S"; t.trail = [{ x: t.x, y: t.y - 4 }, { x: t.x, y: t.y }];
    pa.x = t.x + Math.round(dx * SUB); pa.y = t.y; pa.dest = undefined; pa.facing = "S"; pa.targetId = undefined;
    for (const e of s.state.entities) if (e.kind === "wild" && Math.hypot(e.x - t.x, e.y - t.y) < 14 * SUB) { e.state = "DEFEAT"; e.stateTicks = 1; e.zoneIndex = undefined; }
  }, [tx, ty, dxTiles]);

/**
 * Recorte (CSS px) da fileira: do Tamer ao último modelo, pés na linha do Tamer, `above` px de tela lógica acima dos
 * pés. Posições da VIEW (motionPos: px lógicos do mundo desenhado; 1 unidade da sim = 2 px aqui).
 */
const clipRow = (page, above, below = 14, pad = 22) =>
  page.evaluate(([above, below, pad]) => {
    const g = window.__gs003, v = g.view, k = g.scaleInfo.cssPerLogical, s = g.sim, p = s.state.players.find((q) => q.id === "p1");
    const ids = [p.tamerId, p.partnerId, "official-show-0", "official-show-1", "compare-show"];
    const ps = ids.map((id) => v.motionPos(id)).filter(Boolean);
    const x0 = Math.min(...ps.map((q) => q.x)) - pad, x1 = Math.max(...ps.map((q) => q.x)) + pad + 8, y = ps[0].y;
    return { x: Math.max(0, Math.round((x0 - v.camera.x) * k)), y: Math.max(0, Math.round((y - above - v.camera.y) * k)), width: Math.round((x1 - x0) * k), height: Math.round((above + below) * k) };
  }, [above, below, pad]);

const posOf = (page) =>
  page.evaluate(() => {
    const s = window.__gs003.sim, p = s.state.players.find((q) => q.id === "p1");
    const t = s.state.entities.find((e) => e.id === p.tamerId), pa = s.state.entities.find((e) => e.id === p.partnerId);
    return { t: { x: t.x, y: t.y }, pa: { x: pa.x, y: pa.y }, k: window.__gs003.scaleInfo.cssPerLogical, scale: window.__gs003.officialScale };
  });

async function shot(page, name, meta, clip) {
  await page.screenshot({ path: join(OUT, name), ...(clip ? { clip } : {}) });
  report.shots[name] = meta;
  console.log("shot", name);
}

async function zoom(src, dst, k) {
  const img = await loadImage(join(OUT, src));
  const c = createCanvas(img.width * k, img.height * k);
  const g = c.getContext("2d");
  g.imageSmoothingEnabled = false;
  g.drawImage(img, 0, 0, c.width, c.height);
  writeFileSync(join(OUT, dst), c.toBuffer("image/png"));
}

// ---------- lado a lado: 3 escalas × dia/noite × clareira/vau ----------
async function lado() {
  const crops = {};
  for (const [placeName, [tx, ty]] of Object.entries(PLACES))
    for (const time of ["day", "night"])
      for (const sc of SCALES) {
        const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
        // ?team=compare: a parceira é o Guilmon PixelLab e o compare-show o Gabumon à mão; os official-show-* são os oficiais
        await open(page, `team=compare&mon=official&monscale=${sc}&time=${time}&auto=0`);
        await place(page, tx, ty);
        // fileira (dx em tiles da sim a partir da parceira = Guilmon PixelLab, que fica colada no Tamer para não voltar
        // andando): Guilmon oficial, Gabumon oficial e Gabumon à mão à direita (modelos npc parados)
        await page.evaluate(() => {
          const g = window.__gs003;
          g.officialShowcase("CREATURE-0003", 2.25, 0);
          g.officialShowcase("CREATURE-0009", 4.75, 1);
          g.compareShowcase("CREATURE-0009", 7);
        });
        await page.waitForTimeout(1800);
        const tag = `${placeName}_${time === "day" ? "dia" : "noite"}_x${sc}`;
        const pos = await posOf(page);
        await shot(page, `om_${tag}_tela.png`, { place: placeName, tamerTile: [tx, ty], time, monscale: sc, officialScale: pos.scale, row: "Tamer · Guilmon PixelLab v3 · Guilmon oficial · Gabumon oficial · Gabumon à mão" });
        await page.evaluate(() => (document.querySelector("#hud").style.visibility = "hidden"));
        const clip = await clipRow(page, 84);
        await shot(page, `om_${tag}.png`, { clip }, clip);
        await zoom(`om_${tag}.png`, `om_${tag}_x2.png`, 2);
        crops[tag] = `om_${tag}.png`;
        await page.close();
      }
  // pranchas: por lugar, linhas = escala, colunas = dia | noite
  for (const placeName of Object.keys(PLACES)) {
    const imgs = {};
    for (const sc of SCALES) for (const t of ["dia", "noite"]) imgs[`${sc}|${t}`] = await loadImage(join(OUT, crops[`${placeName}_${t}_x${sc}`]));
    const cw = Math.max(...Object.values(imgs).map((i) => i.width));
    const ch = Math.max(...Object.values(imgs).map((i) => i.height));
    const c = createCanvas(cw * 2 + 30, (ch + 34) * SCALES.length + 40);
    const g = c.getContext("2d");
    g.imageSmoothingEnabled = false;
    g.fillStyle = "#11131c";
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = "#e8ecf8";
    g.font = "bold 20px sans-serif";
    g.fillText(`${placeName}: Tamer · Guilmon PixelLab v3 · Guilmon OFICIAL DS · Gabumon OFICIAL DS · Gabumon à mão`, 10, 26);
    SCALES.forEach((sc, r) =>
      ["dia", "noite"].forEach((t, col) => {
        const y = 40 + r * (ch + 34);
        g.fillStyle = "#fee761";
        g.font = "bold 16px sans-serif";
        g.fillText(`?monscale=${sc} · ${t}`, 10 + col * (cw + 10), y + 18);
        g.drawImage(imgs[`${sc}|${t}`], 10 + col * (cw + 10), y + 26);
      }),
    );
    writeFileSync(join(OUT, `om_prancha_${placeName}.png`), c.toBuffer("image/png"));
    console.log("prancha", placeName);
  }
}

// ---------- GIFs: walk e attack da parceira oficial (Guilmon e Gabumon), ×2 ----------
const WALKER = `window.__walkTo = (tx, ty, maxMs = 30000) => new Promise((res) => {
  const g = window.__gs003, s = g.sim, m = s.map, W = m.width, H = m.height, SUB = 16;
  const p = s.state.players.find((q) => q.id === "p1"), t = s.state.entities.find((e) => e.id === p.tamerId);
  const free = (x, y) => x >= 0 && y >= 0 && x < W && y < H && !m.solid[y * W + x];
  const sx = Math.floor(t.x / SUB), sy = Math.floor(t.y / SUB);
  const prev = new Int32Array(W * H).fill(-1); const q = [sy * W + sx]; prev[q[0]] = q[0];
  for (let h = 0; h < q.length; h++) { const x = q[h] % W, y = Math.floor(q[h] / W); if (x === tx && y === ty) break;
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) { const nx = x + dx, ny = y + dy;
      if (!free(nx, ny) || prev[ny * W + nx] !== -1) continue; prev[ny * W + nx] = q[h]; q.push(ny * W + nx); } }
  const path = []; let c = ty * W + tx; if (prev[c] === -1) return res(false);
  while (c !== prev[c]) { path.unshift({ x: c % W, y: Math.floor(c / W) }); c = prev[c]; }
  let i = 0; const t0 = performance.now();
  const iv = setInterval(() => { const cur = path[i];
    if (!cur || performance.now() - t0 > maxMs) { clearInterval(iv); t.dest = undefined; return res(!cur); }
    const cx = cur.x * SUB + 8, cy = cur.y * SUB + 8;
    if (Math.hypot(t.x - cx, t.y - cy) < 5) { i++; return; }
    t.dest = { x: cx, y: cy }; t.stuckTicks = 0; }, 40); });`;

/**
 * Coletor no navegador: a cada ~40 ms copia do canvas LÓGICO do mundo (#world, pixels nativos) um recorte w×h em
 * volta da parceira (pés a `foot` px do fundo). Rápido mesmo com a máquina carregada; sem nomes/HUD (outra camada).
 */
const startCollect = (page, w, h, foot = 14, keep = Infinity) =>
  page.evaluate(([w, h, foot, keep]) => {
    const g = window.__gs003, cv = document.querySelector("#world"), ctx = cv.getContext("2d");
    window.__frames = [];
    window.__keep = keep; // buffer circular até a hora de gravar (window.__keep = Infinity)
    let last = performance.now();
    clearInterval(window.__col);
    window.__col = setInterval(() => {
      const v = g.view, a = v.motionPos(g.presenter.localPartnerId);
      if (!a) return;
      const x = Math.max(0, Math.min(cv.width - w, Math.round(a.x - v.camera.x - w / 2)));
      const y = Math.max(0, Math.min(cv.height - h, Math.round(a.y - v.camera.y - h + foot)));
      const now = performance.now();
      window.__frames.push({ dt: Math.round(now - last), d: Array.from(ctx.getImageData(x, y, w, h).data) });
      if (window.__frames.length > window.__keep) window.__frames.shift();
      last = now;
    }, 40);
  }, [w, h, foot, keep]);
const stopCollect = (page) => page.evaluate(() => { clearInterval(window.__col); const f = window.__frames; window.__frames = []; return f; });

async function toGif(frames, w, h, name, scale = 3) {
  const W = w * scale;
  const H = h * scale;
  const src = createCanvas(w, h);
  const out = frames.map((f, i) => {
    src.getContext("2d").putImageData(new ImageData(new Uint8ClampedArray(f.d), w, h), 0, 0);
    const c = createCanvas(W, H);
    const g = c.getContext("2d");
    g.imageSmoothingEnabled = false;
    g.drawImage(src, 0, 0, W, H);
    return { data: g.getImageData(0, 0, W, H).data, width: W, height: H, delayMs: Math.max(20, frames[i + 1]?.dt ?? 40) };
  });
  writeFileSync(join(OUT, name), encodeGif(out));
  // prancha de conferência: 12 quadros espaçados do GIF
  const n = Math.min(12, out.length);
  const pick = Array.from({ length: n }, (_, i) => Math.floor((i * out.length) / n));
  const cols = 6;
  const sheet = createCanvas(W * cols, H * Math.ceil(n / cols));
  pick.forEach((fi, i) => sheet.getContext("2d").putImageData(new ImageData(out[fi].data, W, H), (i % cols) * W, Math.floor(i / cols) * H));
  writeFileSync(join(OUT, name.replace(/\.gif$/, "_quadros.png")), sheet.toBuffer("image/png"));
  report.gifs[name] = { frames: out.length, size: [W, H], scale: `${scale}× do canvas lógico (nearest)`, totalMs: out.reduce((s, f) => s + f.delayMs, 0) };
  console.log("gif", name, out.length);
}

/** ONLY=guilmon|gabumon restringe os GIFs a uma espécie; SKIP_WALK=1 pula os de walk. */
const ONLY_SP = (...list) => list.filter(([, slug]) => !process.env.ONLY || process.env.ONLY === slug);

async function gifs() {
  for (const [sp, slug] of ONLY_SP(["CREATURE-0003", "guilmon"], ["CREATURE-0009", "gabumon"])) {
    if (process.env.SKIP_WALK) break;
    // walk: o Tamer anda um quadrado na clareira (S, E, N, W) e a parceira oficial (×2) o segue
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await open(page, `mon=official&monscale=2&partner=${sp}&time=day&auto=0`);
    await page.evaluate(WALKER);
    await place(page, 27, 21, 1.25);
    await page.waitForTimeout(800);
    await startCollect(page, 112, 92);
    for (const [x, y] of [[27, 25], [32, 25], [32, 21], [27, 21]]) {
      await page.evaluate(([x, y]) => window.__walkTo(x, y), [x, y]);
      await page.waitForTimeout(500);
    }
    const frames = await stopCollect(page);
    await toGif(frames, 112, 92, `om_walk_${slug}_x2.gif`);
    await page.close();
  }
  // attack: AUTO ligado com encontro forçado; coleta da 1ª investida da parceira por ~3 s
  for (const [sp, slug] of ONLY_SP(["CREATURE-0003", "guilmon"], ["CREATURE-0009", "gabumon"])) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await open(page, `mon=official&monscale=2&partner=${sp}&time=day&auto=1&encounters=1`);
    await page.evaluate(() => window.__gs003.forceEncounter());
    await startCollect(page, 176, 100, 18, 8);
    const ok = await page
      .waitForFunction(() => {
        const g = window.__gs003, pr = g.presenter, v = pr.entities.get(pr.localPartnerId);
        return !!(v && v.attack);
      }, null, { timeout: 90000, polling: 50 })
      .then(() => true, () => false);
    if (!ok) {
      await stopCollect(page);
      console.log("attack: sem golpe em 90 s", slug);
      report.gifs[`om_attack_${slug}_x2.gif`] = { error: "sem golpe em 90 s" };
      await page.close();
      continue;
    }
    await page.evaluate(() => (window.__keep = Infinity)); // grava a partir de ~0,3 s antes da investida
    await page.waitForTimeout(3000);
    const frames = await stopCollect(page);
    await toGif(frames, 176, 100, `om_attack_${slug}_x2.gif`);
    await page.close();
  }
}

try {
  if (what === "lado" || what === "all") await lado();
  if (what === "gif" || what === "all") await gifs();
} finally {
  await browser.close();
  writeFileSync(join(OUT, `om_report_${what}.json`), JSON.stringify(report, null, 2));
}
