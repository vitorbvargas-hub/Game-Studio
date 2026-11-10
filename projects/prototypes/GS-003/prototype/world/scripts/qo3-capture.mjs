// Quality Overhaul fase 3 (P7 + GS-012 passos 5–7): capturas 1920×1080, desempenho na Clareira e vídeo WebM com
// Playwright (recordVideo). Usa um servidor JÁ rodando na 5190 (npx vite --port 5190); nunca a 5174.
//
// Uso (de prototype/world/):
//   PW_CORE=~/.npm/_npx/<hash>/node_modules/playwright-core/index.mjs \
//   CHROME=~/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell \
//   CHROME_LIBS=/tmp/chromelibs/root/usr/lib/x86_64-linux-gnu PLAYWRIGHT_BROWSERS_PATH=/tmp/pwb \
//   node scripts/qo3-capture.mjs [shots|fg|encounter|perf|video|all]
// (PLAYWRIGHT_BROWSERS_PATH aponta para links das revisões instaladas: o ffmpeg do recordVideo vem de lá. O
// ffmpeg-1011 só tem VP8: /tmp/pwb/ffmpeg-1013/ffmpeg-linux é um wrapper que troca libvpx-vp9 por libvpx.)

import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.env.OUT ?? join(ROOT, "../../quality-overhaul/phase3/img");
const BASE = process.env.BASE ?? "http://127.0.0.1:5190";
const W = 1920;
const H = 1080;
const ID = "digimon-forest-01";
const what = process.argv[2] ?? "all";
mkdirSync(OUT, { recursive: true });

const { chromium } = await import(process.env.PW_CORE);
const browser = await chromium.launch({
  executablePath: process.env.CHROME,
  args: ["--no-sandbox", "--disable-gpu", "--no-proxy-server", "--hide-scrollbars", "--mute-audio"],
  env: { ...process.env, LD_LIBRARY_PATH: [process.env.CHROME_LIBS, process.env.LD_LIBRARY_PATH].filter(Boolean).join(":") },
});
const report = { date: new Date().toISOString(), base: BASE, viewport: [W, H], shots: {}, perf: [], encounter: {}, video: {} };

/** Anda pela grade de tiles (BFS 8-vizinhos sem cortar quina) até (tx, ty), dando `dest` de tile em tile. */
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

async function open(page, query) {
  await page.goto(`${BASE}/?map=${ID}&criador=0&novo=1&seed=7&auto=0${query}`);
  await page.waitForFunction((id) => window.__gs003 && window.__gs003.mapId === id, ID, { timeout: 90000 });
  await page.evaluate(WALKER);
  await page.waitForTimeout(2000);
}
/** Teleporta o Tamer (centro do tile, ou px exatos com `px`) e põe a parceira em `partner` (tiles relativos). */
const tp = (page, tx, ty, opt = {}) =>
  page.evaluate(([tx, ty, opt]) => {
    const g = window.__gs003, s = g.sim, SUB = 16;
    const p = s.state.players.find((q) => q.id === "p1");
    p.auto = false;
    const t = s.state.entities.find((e) => e.id === p.tamerId), pa = s.state.entities.find((e) => e.id === p.partnerId);
    t.x = opt.px ? Math.round(tx / 2) : tx * SUB + 8; t.y = opt.px ? Math.round(ty / 2) : ty * SUB + 8;
    t.dest = undefined; t.trail = [{ x: t.x - 4, y: t.y }, { x: t.x, y: t.y }];
    const [dx, dy] = opt.partner ?? [-1, 0];
    if (pa) { pa.x = t.x + dx * SUB; pa.y = t.y + dy * SUB; pa.dest = undefined; }
  }, [tx, ty, opt]);
const hideHud = (page, on = true) => page.evaluate((on) => { document.querySelector("#hud").style.visibility = on ? "hidden" : ""; }, on);
const shot = async (page, name, meta) => {
  await page.screenshot({ path: join(OUT, name) });
  report.shots[name] = meta;
  console.log("ok", name);
};

async function shots() {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  // antes = look v8 (31 selvagens das zonas antigas); depois = v9 + P7 com ?encounters=1 (5 pontos visíveis)
  const cases = [
    ["antes_v8", "&look=v8&dpr=1"],
    ["depois_v9p7", "&look=v9&dpr=1&anim=v2&encounters=1"],
  ];
  for (const time of what === "fg" ? [] : ["day", "night"]) {
    for (const [tag, q] of cases) {
      // visão de jogo (escala inteira ~9% da altura), Tamer no centro da clareira, perto do baú
      await open(page, `${q}&time=${time}`);
      await hideHud(page);
      await tp(page, 29, 20);
      await page.waitForTimeout(2200);
      await shot(page, `p7_clareira_${tag}_${time === "day" ? "dia" : "noite"}.png`, { query: q, time, framing: "jogo (dpr=1)", tamerTile: [29, 20] });
      // visão geral da clareira inteira (zoom=1: 1 px físico por px de arte), mesma câmera
      await open(page, `${q}&time=${time}&zoom=1`);
      await hideHud(page);
      await tp(page, 27, 18);
      await page.waitForTimeout(2200);
      await shot(page, `p7_clareira_${tag}_${time === "day" ? "dia" : "noite"}_geral.png`, { query: `${q}&zoom=1`, time, framing: "geral (zoom=1)", tamerTile: [27, 18] });
    }
  }
  // molduras de primeiro plano com o Tamer atrás: ponte e baú (v9 + P7)
  await open(page, "&look=v9&dpr=1&anim=v2&encounters=1&time=day&charh=11");
  await hideHud(page);
  // pés do Tamer 13 px atrás (ao norte) do pé da moita composta, na trilha: ela cobre pernas e cintura e fica opaca
  for (const [name, x, y, partner] of [
    ["p7_fg_ponte_tamer_atras.png", 25.6 * 32, 10.28 * 32 - 13, [-1.2, -0.6]],
    ["p7_fg_bau_tamer_atras.png", 30.7 * 32, 19.38 * 32 - 13, [-1.2, -0.4]],
  ]) {
    await tp(page, x, y, { px: true, partner });
    await page.waitForTimeout(1800);
    const alpha = await page.evaluate(() => [...window.__gs003.view.fgAlpha?.values?.() ?? []]);
    await shot(page, name, { tamerPx: [x, y], fgAlphaCovering: alpha });
  }
  await page.close();
}

async function encounter() {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await open(page, "&look=v9&dpr=1&anim=v2&encounters=1&encdebug=1&time=day");
  await tp(page, 22, 21);
  await page.waitForTimeout(1500);
  // quadros do salto: força um encontro (painel de debug) e fotografa o mais rápido possível, guardando o tempo
  await page.evaluate(() => window.__gs003.forceEncounter("tentomon-grama"));
  const t0 = await page.evaluate(() => performance.now());
  const frames = [];
  for (let i = 0; i < 7; i++) {
    const t = Math.round((await page.evaluate(() => performance.now())) - t0);
    const buf = await page.screenshot();
    frames.push({ t, buf });
  }
  // 3 quadros: grama mexendo + "!" (< 350 ms), salto (350–700), placa de raridade (700–1200)
  const pickIn = (a, b) => frames.find((f) => f.t >= a && f.t < b) ?? frames.reduce((x, y) => (Math.abs(y.t - (a + b) / 2) < Math.abs(x.t - (a + b) / 2) ? y : x));
  const chosen = [
    ["p12_encontro_1_grama.png", pickIn(0, 350)],
    ["p12_encontro_2_salto.png", pickIn(350, 700)],
    ["p12_encontro_3_placa.png", pickIn(700, 1200)],
  ];
  for (const [name, f] of chosen) {
    writeFileSync(join(OUT, name), f.buf);
    report.shots[name] = { msAfterForce: f.t };
    console.log("ok", name, f.t, "ms");
  }
  report.encounter.allFrameTimesMs = frames.map((f) => f.t);
  await page.waitForTimeout(1500);
  await shot(page, "p12_encontro_4_combate_debug.png", { note: "combate no mapa + painel ?encdebug=1" });
  report.encounter.inspectAfter = await page.evaluate(() => window.__gs003.encounters());
  await page.close();
}

async function perf() {
  const N = 600;
  // aquecimento em quadros: 120 (padrão) deixa a montagem do cache da água (orçamento por quadro) dentro da janela
  const WARM = Number(process.env.PERF_WARM ?? 120);
  const ONLY = process.env.PERF_ONLY; // ex.: geral:night
  const stats = (xs) => {
    const a = [...xs].sort((p, q) => p - q);
    const q = (f) => a[Math.min(a.length - 1, Math.max(0, Math.ceil(f * a.length) - 1))];
    const r3 = (v) => Math.round(v * 1000) / 1000;
    return { n: a.length, p50: r3(q(0.5)), p95: r3(q(0.95)), p99: r3(q(0.99)), mean: r3(a.reduce((s, v) => s + v, 0) / a.length), max: r3(a.at(-1)) };
  };
  for (const framing of [["jogo", "&dpr=1"], ["geral", "&dpr=1&zoom=1"]])
    for (const time of ["day", "night"])
      for (const [lk, extra] of [["v8", ""], ["v9+P7", "&anim=v2&encounters=1"]]) {
        if (ONLY && ONLY !== `${framing[0]}:${time}`) continue;
        const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
        await page.addInitScript(() => {
          const raf = window.requestAnimationFrame.bind(window);
          const P = (window.__perf = { on: false, work: [], ts: [] });
          window.requestAnimationFrame = (cb) => raf((t) => { const t0 = performance.now(); cb(t); if (P.on) { P.work.push(performance.now() - t0); P.ts.push(t); } });
        });
        await open(page, `&look=${lk === "v8" ? "v8" : "v9"}${extra}${framing[1]}&time=${time}`);
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
        const scene = await page.evaluate(() => { const g = window.__gs003; const ents = [...g.presenter.entities.values()]; return { wild: ents.filter((v) => v.kind === "wild").length, props: g.sim.map.props.length, fg: g.sim.map.fgProps?.length ?? 0, stats: g.view.stats }; });
        const iv = loop.ts.slice(1).map((t, i) => t - loop.ts[i]);
        const r = { framing: framing[0], time, look: lk, warmFrames: WARM, canvas: raster.canvas, scene, loopWorkMs: stats(loop.work), loopIntervalMs: stats(iv), renderRasterMs: stats(raster.out) };
        report.perf.push(r);
        console.log(`perf ${framing[0]} ${time} ${lk}: trabalho p50 ${r.loopWorkMs.p50} p95 ${r.loopWorkMs.p95} · render+raster p50 ${r.renderRasterMs.p50} p95 ${r.renderRasterMs.p95} · canvas ${raster.canvas}`);
        await page.close();
      }
}

async function video() {
  const dir = join(OUT, "_video");
  mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, recordVideo: { dir, size: { width: W, height: H } } });
  const page = await ctx.newPage();
  const t0 = Date.now();
  const marks = [];
  const mark = (label) => marks.push({ s: +((Date.now() - t0) / 1000).toFixed(1), label });
  await open(page, "&look=v9&dpr=1&anim=v2&encounters=1&time=day");
  // começa ao sul da clareira, na trilha principal
  await tp(page, 27, 26);
  await page.waitForTimeout(1500);
  mark("início: sul da clareira, trilha principal");
  await page.evaluate(() => window.__walkTo(31, 20)); // passa pela moita na frente do baú
  mark("baú atrás da moita (moldura de primeiro plano)");
  await page.evaluate(() => window.__walkTo(33, 13));
  await page.evaluate(() => window.__walkTo(26, 10)); // ponte, moitas de primeiro plano
  mark("ponte do riacho com as molduras de primeiro plano");
  await page.waitForTimeout(600);
  await page.evaluate(() => window.__walkTo(30, 21));
  await page.evaluate(() => window.__walkTo(21, 21)); // entra na grama alta (zona oeste da clareira)
  mark("grama alta da clareira (área de encontro)");
  // passeia na grama até sair um encontro de verdade (sem forçar); teto de 60 s, depois força (registrado)
  let natural = false;
  const tStart = Date.now();
  let leg = 0;
  while (Date.now() - tStart < 60000) {
    const n = await page.evaluate(() => window.__gs003.encounters().counters.encounters);
    if (n > 0) { natural = true; break; }
    const [tx, ty] = [[25, 21], [20, 20], [24, 22], [21, 21], [25, 20]][leg++ % 5];
    await page.evaluate(([tx, ty]) => window.__walkTo(tx, ty, 6000), [tx, ty]);
  }
  if (!natural) await page.evaluate(() => window.__gs003.forceEncounter(undefined, "uncommon"));
  mark(natural ? "encontro aleatório (natural) — salto da grama" : "encontro forçado (o natural não saiu em 60 s)");
  // para de andar e assiste ao combate no mapa até o fim
  await page.evaluate(() => { const s = window.__gs003.sim; const t = s.state.entities.find((e) => e.id === "p1"); t.dest = undefined; });
  await page.waitForFunction(() => { const s = window.__gs003.sim; const p = s.state.players.find((q) => q.id === "p1"); const pa = s.state.entities.find((e) => e.id === p.partnerId); return !!pa?.encounterId; }, null, { timeout: 8000 }).catch(() => {});
  mark("combate no mapa (mesmo sistema de sempre)");
  await page.waitForFunction(() => { const s = window.__gs003.sim; const p = s.state.players.find((q) => q.id === "p1"); const pa = s.state.entities.find((e) => e.id === p.partnerId); return !pa?.encounterId; }, null, { timeout: 40000 }).catch(() => {});
  await page.waitForTimeout(2500);
  mark("fim do combate");
  const info = await page.evaluate(() => window.__gs003.encounters());
  const vid = page.video();
  await ctx.close();
  const name = "p12_clareira_passeio_encontro.webm";
  await vid.saveAs(join(OUT, name));
  await vid.delete();
  rmSync(dir, { recursive: true, force: true });
  report.video = { file: name, natural, marks, encountersAfter: info.counters, rewardsPaid: info.rewardsPaid, size: [W, H] };
  console.log("ok", name, JSON.stringify(report.video));
}

try {
  if (what === "shots" || what === "fg" || what === "all") await shots();
  if (what === "encounter" || what === "all") await encounter();
  if (what === "video" || what === "all") await video();
  if (what === "perf" || what === "all") await perf();
} finally {
  await browser.close();
  writeFileSync(join(OUT, `qo3_capture_report_${what}.json`), `${JSON.stringify(report, null, 2)}\n`);
}
