// Feedback 1 do fundador (fase 3 do Quality Overhaul): capturas e vídeo WebM do mapa-múndi, da pose parada com os pés
// juntos, do AUTO explorador até um encontro e da troca de Digimon. Usa o servidor JÁ rodando na 5190.
//
// Uso (de prototype/world/), com as mesmas variáveis do qo3-capture.mjs (PW_CORE, CHROME, CHROME_LIBS,
// PLAYWRIGHT_BROWSERS_PATH):
//   node scripts/fb1-capture.mjs [mapa|parado|auto|troca|video|all]
// Saída: ../../quality-overhaul/phase3/feedback1/ (PNGs 1920×1080, recortes ampliados e fb1_report.json).

import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.env.OUT ?? join(ROOT, "../../quality-overhaul/phase3/feedback1");
const BASE = process.env.BASE ?? "http://127.0.0.1:5190";
const W = 1920;
const H = 1080;
const ID = "digimon-forest-01";
const LOOK = "&look=v9&dpr=1&time=day";
const what = process.argv[2] ?? "all";
mkdirSync(OUT, { recursive: true });

const { chromium } = await import(process.env.PW_CORE);
const browser = await chromium.launch({
  executablePath: process.env.CHROME,
  args: ["--no-sandbox", "--disable-gpu", "--no-proxy-server", "--hide-scrollbars", "--mute-audio"],
  env: { ...process.env, LD_LIBRARY_PATH: [process.env.CHROME_LIBS, process.env.LD_LIBRARY_PATH].filter(Boolean).join(":") },
});
const report = { date: new Date().toISOString(), base: BASE, viewport: [W, H], shots: {}, stand: {}, auto: {}, swap: {}, worldmap: {}, video: {} };

/** Anda pela grade de tiles (BFS) até (tx, ty), dando `dest` de tile em tile (mesmo do qo3-capture). */
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
  await page.goto(`${BASE}/?map=${ID}&criador=0&novo=1&seed=7${query}`);
  await page.waitForFunction((id) => window.__gs003 && window.__gs003.mapId === id, ID, { timeout: 90000 });
  await page.evaluate(WALKER);
  await page.waitForTimeout(1800);
}
const shot = async (page, name, meta, clip) => {
  await page.screenshot({ path: join(OUT, name), ...(clip ? { clip } : {}) });
  report.shots[name] = meta;
  console.log("shot", name);
};
const tp = (page, tx, ty) =>
  page.evaluate(([tx, ty]) => {
    const s = window.__gs003.sim, SUB = 16;
    const p = s.state.players.find((q) => q.id === "p1");
    const t = s.state.entities.find((e) => e.id === p.tamerId), pa = s.state.entities.find((e) => e.id === p.partnerId);
    t.x = tx * SUB + 8; t.y = ty * SUB + 8; t.dest = undefined; t.trail = [{ x: t.x - 4, y: t.y }, { x: t.x, y: t.y }];
    if (pa) { pa.x = t.x - SUB; pa.y = t.y; pa.dest = undefined; }
  }, [tx, ty]);
/** Retângulo de tela (CSS px) em volta do Tamer e da parceira. */
const aroundTamer = (page, w = 320, h = 220) =>
  page.evaluate(([w, h]) => {
    const g = window.__gs003, v = g.view, k = g.scaleInfo.cssPerLogical;
    const s = g.sim, p = s.state.players.find((q) => q.id === "p1");
    const a = v.motionPos("p1"), b = v.motionPos(p.partnerId) ?? a;
    const cx = ((a.x + b.x) / 2 - v.camera.x) * k, cy = ((a.y + b.y) / 2 - v.camera.y) * k - 20 * k;
    return { x: Math.max(0, Math.round(cx - w / 2)), y: Math.max(0, Math.round(cy - h / 2)), width: w, height: h };
  }, [w, h]);
const partnerInfo = (page) =>
  page.evaluate(() => {
    const s = window.__gs003.sim, p = s.state.players.find((q) => q.id === "p1");
    const pa = s.state.entities.find((e) => e.id === p.partnerId);
    return { species: pa.speciesId, name: pa.name, level: pa.level, hp: pa.hp, maxHp: pa.maxHp, target: pa.targetId ?? null, enc: pa.encounterId ?? null, swapCd: p.swapCd ?? 0, explore: p.explore?.mode ?? null };
  });

// ---------- 1. mapa-múndi ----------
async function mapa() {
  for (const [vw, vh, q, tag] of [
    [W, H, LOOK, ""],
    [1366, 768, LOOK, "_1366"],
  ]) {
    const page = await browser.newPage({ viewport: { width: vw, height: vh } });
    await open(page, `${q}&auto=0`);
    await page.click(".mm-world"); // pelo botão do minimapa
    await page.waitForTimeout(400);
    const box = await page.evaluate(() => {
      const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
      return { canvas: r(".wm-canvas"), arena: r(".wm-arena"), arenaIcon: r(".wm-arena svg"), nodes: [...document.querySelectorAll(".wm-node")].map((n) => [n.dataset.region, n.className.replace("wm-node ", "")]) };
    });
    await shot(page, `fb1_mapa_mundi_floresta${tag}.png`, { viewport: [vw, vh], query: q, ...box });
    await page.click("[data-travel=vila_dos_bebes]", { timeout: 5000 });
    await page.waitForFunction(() => window.__gs003.mapId === "vila", null, { timeout: 15000 });
    await page.waitForTimeout(900);
    await page.keyboard.press("m"); // pela tecla M
    await page.waitForTimeout(400);
    await shot(page, `fb1_mapa_mundi_na_vila${tag}.png`, { viewport: [vw, vh], map: "vila" });
    await page.click("[data-travel=floresta_densa]", { timeout: 5000 });
    await page.waitForFunction(() => window.__gs003.mapId !== "vila", null, { timeout: 15000 });
    await page.waitForTimeout(900);
    const back = await page.evaluate(() => window.__gs003.mapId);
    await shot(page, `fb1_mapa_mundi_volta${tag}.png`, { viewport: [vw, vh], map: back });
    report.worldmap[tag || "1920"] = { arenaIcon: box.arenaIcon, backTo: back, ok: back === ID };
    await page.close();
  }
}

// ---------- 2. parado com os pés juntos (antes × depois, v1 e anim=v2) ----------
async function parado() {
  const crops = [];
  for (const anim of ["", "&anim=v2"]) {
    const page = await browser.newPage({ viewport: { width: W, height: H } });
    await open(page, `${LOOK}&auto=0${anim}`);
    await page.evaluate(() => (document.querySelector("#hud").style.visibility = "hidden"));
    for (const [dir, from, to] of [
      ["E", [24, 20], [29, 20]],
      ["S", [33, 17], [33, 22]],
      ["W", [30, 21], [25, 21]],
      ["N", [33, 23], [33, 18]],
    ]) {
      await tp(page, ...from);
      await page.waitForTimeout(500);
      const walked = await page.evaluate(([x, y]) => window.__walkTo(x, y), to);
      if (!walked) console.warn("rota não completou", dir, from, to);
      await page.waitForTimeout(900); // parou (a mola visual assenta)
      const clip = await aroundTamer(page, 240, 170);
      for (const off of [true, false]) {
        await page.evaluate((off) => (window.__gs003.view.standPoseOff = off), off);
        await page.waitForTimeout(120);
        const name = `fb1_parado_${anim ? "v2" : "v1"}_${dir}_${off ? "antes" : "depois"}.png`;
        await shot(page, name, { dir, anim: anim ? "v2" : "v1", standPoseOff: off }, clip);
        crops.push({ name, anim: anim ? "v2" : "v1", dir, off });
      }
      await page.evaluate(() => (window.__gs003.view.standPoseOff = false));
    }
    await page.close();
  }
  // folha de comparação: linhas = direção, colunas = v1 antes/depois, v2 antes/depois (ampliado 3×)
  const cell = { w: 240, h: 170 };
  const Z = 3;
  const sheet = createCanvas(cell.w * 4 * Z + 50, cell.h * 4 * Z + 40);
  const g = sheet.getContext("2d");
  g.imageSmoothingEnabled = false;
  g.fillStyle = "#11131c";
  g.fillRect(0, 0, sheet.width, sheet.height);
  g.fillStyle = "#e8ecf8";
  g.font = "bold 22px sans-serif";
  ["v1 antes", "v1 depois", "anim=v2 antes", "anim=v2 depois"].forEach((t, i) => g.fillText(t, 50 + i * cell.w * Z + 12, 28));
  const dirs = ["E", "S", "W", "N"];
  for (const c of crops) {
    const col = (c.anim === "v2" ? 2 : 0) + (c.off ? 0 : 1);
    const row = dirs.indexOf(c.dir);
    const img = await loadImage(join(OUT, c.name));
    g.drawImage(img, 50 + col * cell.w * Z, 40 + row * cell.h * Z, cell.w * Z, cell.h * Z);
  }
  dirs.forEach((d, i) => g.fillText(d, 14, 40 + i * cell.h * Z + (cell.h * Z) / 2));
  writeFileSync(join(OUT, "fb1_parado_comparacao.png"), sheet.toBuffer("image/png"));
  report.stand.sheet = "fb1_parado_comparacao.png";
  console.log("shot fb1_parado_comparacao.png");
}

// ---------- 3. AUTO explorador até um encontro ----------
async function auto() {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await open(page, `${LOOK}&anim=v2&encounters=1&auto=0`);
  const t0 = Date.now();
  await page.click(".auto-btn"); // o botão AUTO do HUD (set_auto); a exploração já vem ligada (set_auto_explore)
  const trace = [];
  let shotExplore = false;
  let appear;
  while (Date.now() - t0 < 150000) {
    await page.waitForTimeout(500);
    const s = await page.evaluate(() => {
      const g = window.__gs003, sim = g.sim, p = sim.state.players.find((q) => q.id === "p1"), t = sim.state.entities.find((e) => e.id === p.tamerId);
      const r = g.encounters();
      return { mode: p.explore?.mode, x: Math.floor(t.x / 16), y: Math.floor(t.y / 16), enc: r.counters.encounters, rewards: r.rewardsPaid, intro: sim.state.entities.some((e) => e.encOwner === "p1" && e.introTicks > 0) };
    });
    trace.push({ s: +((Date.now() - t0) / 1000).toFixed(1), ...s });
    if (!shotExplore && s.mode === "grass") {
      await shot(page, "fb1_auto_explorando_grama.png", { t: trace.at(-1) });
      shotExplore = true;
    }
    if (s.enc > 0 && s.intro) {
      appear = trace.at(-1);
      await page.waitForTimeout(250);
      await shot(page, "fb1_auto_encontro_salto.png", { t: appear });
      await page.waitForTimeout(2200);
      await shot(page, "fb1_auto_encontro_luta.png", { t: appear, partner: await partnerInfo(page) });
      break;
    }
  }
  const log = await page.evaluate(() => [...document.querySelectorAll(".hud-log li")].slice(0, 8).map((l) => l.textContent));
  report.auto = { firstGrassEncounterAt: appear?.s ?? null, trace: trace.filter((_, i) => i % 4 === 0 || trace[i].enc !== trace[i - 1]?.enc), log };
  await page.close();
}

// ---------- 4. troca de Digimon (fora e dentro de combate) ----------
async function troca() {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await open(page, `${LOOK}&anim=v2&auto=0`);
  await tp(page, 30, 20);
  await page.waitForTimeout(800);
  const before = await partnerInfo(page);
  await page.keyboard.press("Shift+Digit2");
  const clipNow = await aroundTamer(page, 420, 300);
  const seq = [];
  for (const [ms, tag] of [
    [120, "1_recuo"],
    [330, "2_recuo_fim"],
    [560, "3_entrada"],
    [1300, "4_pronto"],
  ]) {
    const t = Date.now();
    await page.waitForTimeout(Math.max(0, ms - (seq.length ? seq.at(-1).ms : 0)));
    await shot(page, `fb1_troca_fora_${tag}.png`, { ms }, clipNow);
    seq.push({ ms, tag, real: Date.now() - t });
  }
  await shot(page, "fb1_troca_fora_tela.png", { after: await partnerInfo(page) });
  const after = await partnerInfo(page);
  // em combate: AUTO até a parceira engajar, troca com Shift+3 e confere a recarga
  await page.click(".auto-btn");
  await page.waitForFunction(() => { const s = window.__gs003.sim, p = s.state.players.find((q) => q.id === "p1"); const pa = s.state.entities.find((e) => e.id === p.partnerId); return !!pa.targetId && (p.swapCd ?? 0) === 0; }, null, { timeout: 90000 });
  await page.waitForTimeout(700);
  const fightBefore = await partnerInfo(page);
  await page.keyboard.press("Shift+Digit3");
  await page.waitForTimeout(250);
  await shot(page, "fb1_troca_combate_recuo.png", {}, await aroundTamer(page, 520, 340));
  await page.waitForTimeout(450);
  await shot(page, "fb1_troca_combate_entrada.png", {}, await aroundTamer(page, 520, 340));
  const fightAfter = await partnerInfo(page);
  await page.keyboard.press("Shift+Digit2"); // durante a recarga: recusada
  await page.waitForTimeout(300);
  await shot(page, "fb1_troca_combate_recarga.png", { fightAfter });
  const log = await page.evaluate(() => [...document.querySelectorAll(".hud-log li")].slice(0, 6).map((l) => l.textContent));
  report.swap = { before, after, fightBefore, fightAfter, log };
  await page.close();
}

// ---------- vídeo: parada, mapa-múndi, AUTO até o encontro e troca ----------
async function video() {
  const VW = 1280;
  const VH = 720;
  const dir = join(OUT, "_video");
  mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1, recordVideo: { dir, size: { width: VW, height: VH } } });
  const page = await ctx.newPage();
  const t0 = Date.now();
  const marks = [];
  const mark = (label) => marks.push({ s: +((Date.now() - t0) / 1000).toFixed(1), label });
  await open(page, `${LOOK}&anim=v2&encounters=1&auto=0`);
  mark("carregado");
  await tp(page, 24, 20);
  await page.waitForTimeout(600);
  mark("parada: anda e para (pés juntos)");
  for (const [x, y] of [[29, 20], [29, 23], [25, 23]]) {
    await page.evaluate(([x, y]) => window.__walkTo(x, y), [x, y]);
    await page.waitForTimeout(1100);
  }
  mark("mapa-múndi (M), viagem à Vila e volta");
  await page.keyboard.press("m");
  await page.waitForTimeout(1500);
  await page.click("[data-travel=vila_dos_bebes]", { timeout: 5000 });
  await page.waitForFunction(() => window.__gs003.mapId === "vila", null, { timeout: 15000 });
  await page.waitForTimeout(1200);
  await page.keyboard.press("m");
  await page.waitForTimeout(1300);
  await page.click("[data-travel=floresta_densa]", { timeout: 5000 });
  await page.waitForFunction((id) => window.__gs003.mapId === id, ID, { timeout: 15000 });
  await page.evaluate(WALKER);
  await page.waitForTimeout(1200);
  mark("troca fora de combate (Shift+2)");
  await page.keyboard.press("Shift+Digit2");
  await page.waitForTimeout(2200);
  mark("AUTO ligado: explora, caça, entra na grama");
  await page.click(".auto-btn");
  let swappedInFight = false;
  let grassEnc = false;
  const modes = [];
  const tA = Date.now();
  while (Date.now() - tA < 240000) {
    await page.waitForTimeout(300);
    const s = await page.evaluate(() => {
      const g = window.__gs003, sim = g.sim, p = sim.state.players.find((q) => q.id === "p1"), pa = sim.state.entities.find((e) => e.id === p.partnerId);
      return { mode: p.explore?.mode, enc: g.encounters().counters.encounters, intro: sim.state.entities.some((e) => e.encOwner === "p1" && e.introTicks > 0), fight: !!pa.targetId, rnd: !!(pa.targetId && sim.state.entities.find((e) => e.id === pa.targetId)?.encKey), cd: p.swapCd ?? 0, hp: Math.round((pa.hp / pa.maxHp) * 100) };
    });
    if (modes.at(-1)?.mode !== s.mode) modes.push({ s: +((Date.now() - t0) / 1000).toFixed(1), mode: s.mode, hp: s.hp });
    if (s.enc > 0 && s.intro && !grassEnc) {
      grassEnc = true;
      mark("encontro na grama alta (salto)");
    }
    // a troca em combate acontece na luta do encontro da grama
    if (grassEnc && !swappedInFight && s.fight && s.rnd && s.cd === 0) {
      await page.waitForTimeout(900);
      mark("troca em combate (Shift+3)");
      await page.keyboard.press("Shift+Digit3");
      swappedInFight = true;
      await page.waitForTimeout(1200);
      await page.keyboard.press("Shift+Digit2");
      mark("troca em recarga recusada (Shift+2)");
    }
    if (grassEnc && swappedInFight && !s.fight) {
      await page.waitForTimeout(2500);
      break;
    }
  }
  mark("fim");
  const vid = page.video();
  await ctx.close();
  const raw = join(OUT, "fb1_video_bruto.webm");
  await vid.saveAs(raw);
  await vid.delete();
  rmSync(dir, { recursive: true, force: true });
  report.video = { raw: "fb1_video_bruto.webm", marks, grassEnc, swappedInFight, modes, size: [VW, VH] };
  console.log("video", JSON.stringify(report.video));
}

try {
  if (what === "mapa" || what === "all") await mapa();
  if (what === "parado" || what === "all") await parado();
  if (what === "auto" || what === "all") await auto();
  if (what === "troca" || what === "all") await troca();
  if (what === "video" || what === "all") await video();
} finally {
  await browser.close();
  writeFileSync(join(OUT, `fb1_report_${what}.json`), JSON.stringify(report, null, 2));
}
