// Quality Overhaul fase 3 / forest-v12: capturas 1920×1080 do "depois" com a URL PADRÃO da branch (sem flags de look,
// HUD, mon ou dpr): http://127.0.0.1:5190/?map=digimon-forest-01 — prova de que o padrão já abre com o look v9 +
// forest-v12, o HUD v2/Digivice, o mapa-múndi v2.1, os Digimon oficiais e o dpr=1. HUD visível (é o que o fundador vê).
// Servidor JÁ rodando na 5190 (worktree qo). Nunca a 5174. Ambiente: PW_CORE, CHROME, CHROME_LIBS (como no v12-capture.mjs).
//   node scripts/v12-default-capture.mjs
// Saída: quality-overhaul/phase3/v12/v12_padrao_*.png + v12_padrao_capture.json.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.env.OUT ?? join(ROOT, "../../quality-overhaul/phase3/v12");
const BASE = process.env.BASE ?? "http://127.0.0.1:5190";
const W = 1920;
const H = 1080;
const ID = "digimon-forest-01";
mkdirSync(OUT, { recursive: true });

const { chromium } = await import(process.env.PW_CORE);
const browser = await chromium.launch({
  executablePath: process.env.CHROME,
  args: ["--no-sandbox", "--disable-gpu", "--no-proxy-server", "--hide-scrollbars", "--mute-audio"],
  env: { ...process.env, LD_LIBRARY_PATH: [process.env.CHROME_LIBS, process.env.LD_LIBRARY_PATH].filter(Boolean).join(":") },
});
const report = { date: new Date().toISOString(), base: BASE, viewport: [W, H], url: `${BASE}/?map=${ID}`, shots: {} };

async function open(page, query) {
  // só o necessário para a captura ser reproduzível (sem criador, save novo, semente fixa, AUTO desligado) + hora
  const url = `${BASE}/?map=${ID}&criador=0&novo=1&seed=7&auto=0${query}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForFunction((id) => window.__gs003 && window.__gs003.mapId === id, ID, { timeout: 90000 });
  await page.waitForSelector('[data-testid="dg-hub"]', { timeout: 30000 });
  await page.waitForTimeout(2000);
  return url;
}
const tp = (page, tx, ty) =>
  page.evaluate(([tx, ty]) => {
    const s = window.__gs003.sim, SUB = 16;
    const p = s.state.players.find((q) => q.id === "p1");
    p.auto = false;
    const t = s.state.entities.find((e) => e.id === p.tamerId), pa = s.state.entities.find((e) => e.id === p.partnerId);
    t.x = tx * SUB + 8; t.y = ty * SUB + 8; t.dest = undefined; t.trail = [{ x: t.x - 4, y: t.y }, { x: t.x, y: t.y }];
    if (pa) { pa.x = t.x - SUB; pa.y = t.y; pa.dest = undefined; }
  }, [tx, ty]);
const state = (page) =>
  page.evaluate(() => ({
    hudV2: !!document.querySelector(".hud-v2"),
    digivice: !!document.querySelector('[data-testid="dg-hub"]'),
    lip: window.__gs003.sim.map.tileLayers?.find((l) => l.name === "ground")?.keys.some((k) => /^fp12_mirante_top_edge_/.test(k)) ?? null,
    worldmapArt: (document.querySelector(".wm2")?.getAttribute("style") ?? "").match(/worldmap[^/'"]*\.png/)?.[0] ?? null,
    dpr: window.__gs003.scaleInfo?.dprMode ?? null,
  }));
const shot = async (page, name, meta) => {
  await page.screenshot({ path: join(OUT, name) });
  report.shots[name] = { ...meta, state: await state(page) };
  console.log("ok", name, JSON.stringify(report.shots[name].state));
};

const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const VIEWS = [
  { id: "jogo", q: "", tamer: [28, 20], framing: "visão de jogo na clareira (URL padrão, sem zoom)" },
  { id: "geral", q: "&zoom=1", tamer: [28, 20], framing: "mapa inteiro (zoom=1)" },
  { id: "mirante", q: "", tamer: [25, 20], framing: "mirante, visão de jogo (lip da borda norte)" },
  { id: "copas", q: "&zoom=2", tamer: [9, 20], framing: "borda oeste da mata (zoom=2): variantes de copa" },
];
for (const time of ["day", "night"]) {
  const t = time === "day" ? "dia" : "noite";
  for (const v of VIEWS) {
    const url = await open(page, `${v.q}&time=${time}`);
    await tp(page, ...v.tamer);
    await page.waitForTimeout(2200);
    await shot(page, `v12_padrao_${v.id}_${t}.png`, { url, time, framing: v.framing, tamerTile: v.tamer });
  }
  // mapa-múndi v2.1 aberto (tecla M) e Digivice aberto (clique no hub)
  let url = await open(page, `&time=${time}`);
  await tp(page, 28, 20);
  await page.keyboard.press("m");
  await page.waitForSelector(".wm2", { timeout: 15000 });
  await page.waitForTimeout(900);
  await shot(page, `v12_padrao_mundi_${t}.png`, { url, time, framing: "mapa-múndi v2.1 aberto (M)" });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  await page.click('[data-testid="dg-hub"]', { timeout: 10000 });
  await page.waitForTimeout(900);
  await shot(page, `v12_padrao_digivice_${t}.png`, { url, time, framing: "Digivice aberto (clique no hub)" });
}
await page.close();
await browser.close();
writeFileSync(join(OUT, "v12_padrao_capture.json"), JSON.stringify(report, null, 2));
console.log("fim");
