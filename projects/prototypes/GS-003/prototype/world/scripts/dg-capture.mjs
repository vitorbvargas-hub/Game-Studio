// HUD Identity v3, Alt A "Digivice Radial" + abas P0 (?hud=v2): capturas 1920×1080 (hub fechado/aberto, Chefe
// Mundial nos 4 estados, Conquistas, um atalho bloqueado, Configurações; dia e noite) e um WebM curto.
// Usa o servidor JÁ rodando na 5190; nunca a 5174. Mesmo ambiente do scripts/qo3-capture.mjs:
//   PW_CORE=~/.npm/_npx/<hash>/node_modules/playwright-core/index.mjs \
//   CHROME=~/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell \
//   CHROME_LIBS=/tmp/chromelibs/root/usr/lib/x86_64-linux-gnu PLAYWRIGHT_BROWSERS_PATH=/tmp/pwb \
//   node scripts/dg-capture.mjs [shots|video|worldmap|all]
// PREFIX= troca o prefixo dos arquivos (padrão dg_; a rodada com o kit circuit-kit-v1 usa PREFIX=kit_).
// "worldmap": mapa-múndi v2 (ilustração worldmap-v1) dia/noite, POI escolhido, viagem à Vila e volta (wm_*.png).
// O estado do Digivice (chave separada do save, gs003.world.save.digivice) é semeado por addInitScript antes do
// carregamento, para mostrar cada estado do Chefe Mundial sem esperar 10 min de jogo.
// Saída: quality-overhaul/phase3/hud/dg_*.png, dg_capture.json, dg_digivice.webm.

import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.env.OUT ?? join(ROOT, "../../quality-overhaul/phase3/hud");
const BASE = process.env.BASE ?? "http://127.0.0.1:5190";
const W = 1920;
const H = 1080;
const ID = "digimon-forest-01";
const KEY = "gs003.world.save.digivice";
const WHAT = process.argv[2] ?? "all";
const PREFIX = process.env.PREFIX ?? "dg_";
mkdirSync(OUT, { recursive: true });

const { chromium } = await import(process.env.PW_CORE);
const browser = await chromium.launch({
  executablePath: process.env.CHROME,
  args: ["--no-sandbox", "--disable-gpu", "--no-proxy-server", "--hide-scrollbars", "--mute-audio"],
  env: { ...process.env, LD_LIBRARY_PATH: [process.env.CHROME_LIBS, process.env.LD_LIBRARY_PATH].filter(Boolean).join(":") },
});
const report = { date: new Date().toISOString(), base: BASE, viewport: [W, H], shots: {} };

const dayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const base = () => ({ v: 1, wins: 0, scans: [], evolves: 0, maps: [], tamerLevel: 1, bossAwakens: 0, bossDefeats: 0, claimed: [], boss: {} });
/** Estados semeados (cada um vira o conteúdo da chave do Digivice antes do load). */
const SEEDS = {
  fresh: () => base(),
  progress: () => ({ ...base(), wins: 12, scans: ["A", "B", "C"], maps: ["Floresta Densa · Rota 1", "Vila dos Bebês · Praça"], tamerLevel: 3, claimed: ["win_1"], boss: { lastDay: dayKey() } }),
  active: () => {
    const now = Date.now();
    return { ...base(), wins: 5, bossAwakens: 1, boss: { lastDay: dayKey(), active: { bossId: "BOSS-KUWAGAMON", day: dayKey(), start: now - 4 * 60_000, end: now + 6 * 60_000, dmg: 3 } } };
  },
  reward: () => {
    const now = Date.now();
    const w = { bossId: "BOSS-KUWAGAMON", day: dayKey(), start: now - 11 * 60_000, end: now - 60_000, dmg: 6 };
    return { ...base(), wins: 9, bossAwakens: 1, boss: { lastDay: dayKey(), last: { ...w, defeated: false }, pending: { bits: 200, defeated: false, dmg: 6, day: dayKey() } } };
  },
  cooldown: () => {
    const now = Date.now();
    const w = { bossId: "BOSS-KUWAGAMON", day: dayKey(), start: now - 30 * 60_000, end: now - 20 * 60_000, dmg: 6 };
    return { ...base(), wins: 9, bossAwakens: 1, boss: { lastDay: dayKey(), last: { ...w, defeated: false } } };
  },
};

async function newPage(seed, ctxOpts = {}) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, ...ctxOpts });
  await ctx.addInitScript(([k, v]) => localStorage.setItem(k, v), [KEY, JSON.stringify(SEEDS[seed]())]);
  return { ctx, page: await ctx.newPage() };
}

async function open(page, time, extra = "&hud=v2") {
  const url = `${BASE}/?map=${ID}&criador=0&novo=1&seed=7&auto=0&look=v9&dpr=1&anim=v2&encounters=1${extra}&time=${time}`;
  for (let i = 0; ; i++) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
      break;
    } catch (e) {
      if (i >= 1) throw e;
    }
  }
  await page.waitForFunction((id) => window.__gs003 && window.__gs003.mapId === id, ID, { timeout: 90000 });
  if (extra.includes("hud=v2")) await page.waitForSelector('[data-testid="dg-hub"]', { timeout: 30000 });
  await page.waitForTimeout(1800);
}

const state = (page) =>
  page.evaluate(() => {
    const dg = document.querySelector(".dg");
    const open = [...document.querySelectorAll(".panel-wrap.open")].map((w) => w.dataset.panel);
    const pips = [...document.querySelectorAll(".dg-pip")].filter((p) => !p.hidden).map((p) => p.dataset.pip);
    return { hubOpen: dg?.classList.contains("open") ?? false, bossPhase: dg?.dataset.boss ?? null, pips, openPanels: open, oldTr: !!document.querySelector(".hud-tr") };
  });

/** Recorte do canto superior direito (o hub e o arco em tamanho real, sem escala). */
const CORNER = { x: 1520, y: 0, width: 400, height: 300 };
async function shot(page, name0, meta, clip) {
  const name = name0.startsWith("dg_") ? PREFIX + name0.slice(3) : name0;
  await page.screenshot({ path: join(OUT, name), ...(clip ? { clip } : {}) });
  report.shots[name] = { ...meta, ...(clip ? { clip } : {}), ...(await state(page)) };
  console.log("ok", name);
}

const click = (page, sel) => page.click(sel, { timeout: 10000 });

async function shots() {
  for (const time of ["day", "night"]) {
    const t = time === "day" ? "dia" : "noite";
    // hub fechado e aberto (estado com progresso: pip de Conquistas aceso)
    {
      const { ctx, page } = await newPage("progress");
      await open(page, time);
      await shot(page, `dg_fechado_${t}.png`, { seed: "progress", time });
      await shot(page, `dg_fechado_${t}_canto.png`, { seed: "progress", time }, CORNER);
      await click(page, '[data-testid="dg-hub"]');
      await page.waitForTimeout(900);
      await page.hover('[data-dg="boss"]');
      await page.waitForTimeout(300);
      await shot(page, `dg_aberto_${t}.png`, { seed: "progress", time });
      await shot(page, `dg_aberto_${t}_canto.png`, { seed: "progress", time }, CORNER);
      // Conquistas (pelo arco), aba Combate com uma pronta e uma coletada
      await click(page, '[data-dg="trophy"]');
      await page.waitForTimeout(500);
      await shot(page, `dg_conquistas_${t}.png`, { seed: "progress", time });
      if (time === "day") {
        await click(page, '[data-ach-tab="exploration"]');
        await page.waitForTimeout(300);
        await shot(page, `dg_conquistas_exploracao_${t}.png`, { seed: "progress", time });
        await click(page, '[data-ach-tab="social"]');
        await page.waitForTimeout(300);
        await shot(page, `dg_conquistas_social_bloqueada_${t}.png`, { seed: "progress", time });
        // atalho P1 bloqueado (Guilda): Esc fecha o painel (o fundo do modal cobre o hub, como nos outros painéis)
        await page.keyboard.press("Escape");
        await click(page, '[data-testid="dg-hub"]');
        await page.waitForTimeout(700);
        await click(page, '[data-dg="guild"]');
        await page.waitForTimeout(400);
        await shot(page, `dg_bloqueado_guilda_${t}.png`, { seed: "progress", time });
      }
      // Configurações (moldura chanfrada; opções inalteradas)
      await page.keyboard.press("Escape");
      await page.keyboard.press("o");
      await page.waitForTimeout(500);
      await shot(page, `dg_configuracoes_${t}.png`, { seed: "progress", time });
      await ctx.close();
    }
    // Chefe Mundial: disponível, ativo, recompensa, recarga
    for (const seed of ["fresh", "active", "reward", "cooldown"]) {
      if (time === "night" && seed !== "active" && seed !== "fresh") continue;
      const { ctx, page } = await newPage(seed);
      await open(page, time);
      if (seed === "active") await shot(page, `dg_fechado_chefe_ativo_${t}_canto.png`, { seed, time }, CORNER);
      await click(page, '[data-testid="dg-hub"]');
      await page.waitForTimeout(800);
      await click(page, '[data-dg="boss"]');
      await page.waitForTimeout(600);
      const tag = { fresh: "1_disponivel", active: "2_ativo", reward: "3_recompensa", cooldown: "4_recarga" }[seed];
      await shot(page, `dg_chefe_${tag}_${t}.png`, { seed, time });
      await ctx.close();
    }
  }
}

async function video() {
  const dir = join(OUT, "_video");
  mkdirSync(dir, { recursive: true });
  const { ctx, page } = await newPage("progress", { viewport: { width: 1280, height: 720 }, recordVideo: { dir, size: { width: 1280, height: 720 } } });
  const t0 = Date.now();
  const marks = [];
  const mark = (m) => marks.push({ t: +((Date.now() - t0) / 1000).toFixed(1), m });
  await open(page, "day");
  mark("carregado");
  await page.waitForTimeout(1500);
  mark("clique no hub: abre o arco");
  await click(page, '[data-testid="dg-hub"]');
  await page.waitForTimeout(1200);
  for (const id of ["guild", "mail", "pass", "wish", "boss", "trophy"]) {
    await page.hover(`[data-dg="${id}"]`);
    await page.waitForTimeout(450);
  }
  mark("Conquistas: coletar");
  await click(page, '[data-dg="trophy"]');
  await page.waitForTimeout(1200);
  const claim = await page.$("[data-ach-claim]");
  if (claim) {
    await claim.click();
    await page.waitForTimeout(1500);
  }
  await click(page, '[data-ach-tab="exploration"]');
  await page.waitForTimeout(1000);
  mark("Esc fecha; H abre pelo teclado");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(700);
  await page.keyboard.press("h");
  await page.waitForTimeout(1200);
  mark("Chefe Mundial: despertar");
  await click(page, '[data-dg="boss"]');
  await page.waitForTimeout(1200);
  const aw = await page.$('[data-testid="wb-awaken"]');
  if (aw) {
    await aw.click();
    await page.waitForTimeout(3000);
  }
  mark("fecha o painel: arco do hub em vermelho (PV do chefe)");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(2500);
  mark("Configurações (O)");
  await page.keyboard.press("o");
  await page.waitForTimeout(2000);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(800);
  mark("fim");
  const v = page.video();
  await ctx.close();
  await v.saveAs(join(OUT, `${PREFIX}digivice.webm`));
  await v.delete();
  rmSync(dir, { recursive: true, force: true });
  report.video = { file: `${PREFIX}digivice.webm`, size: [1280, 720], codec: "VP8", marks };
}

async function worldmap() {
  const wmState = (page) =>
    page.evaluate(() => ({
      mapId: window.__gs003.mapId,
      pois: Object.fromEntries([...document.querySelectorAll(".wm2-poi")].map((b) => [b.dataset.wmPick, ["here", "open", "nomap", "locked"].find((c) => b.classList.contains(c))])),
      shown: [...document.querySelectorAll(".wm2-detail")].filter((d) => !d.hidden).map((d) => d.dataset.region),
    }));
  report.worldmap = {};
  for (const time of ["day", "night"]) {
    const t = time === "day" ? "dia" : "noite";
    const { ctx, page } = await newPage("progress");
    await open(page, time);
    await page.keyboard.press("m");
    await page.waitForSelector(".wm2", { timeout: 10000 });
    await page.waitForTimeout(700);
    await shot(page, `wm_aberto_${t}.png`, { time, ...(await wmState(page)) });
    await click(page, '[data-wm-pick="praia_dos_postes"]');
    await page.waitForTimeout(300);
    await shot(page, `wm_praia_${t}.png`, { time, ...(await wmState(page)) });
    if (time === "day") {
      await click(page, '[data-wm-pick="montanha"]');
      await page.waitForTimeout(300);
      await shot(page, `wm_bloqueada_montanha_${t}.png`, { time, ...(await wmState(page)) });
      // viagem: Vila dos Bebês e volta para a Floresta pelo mesmo painel
      const before = await wmState(page);
      await click(page, '[data-wm-pick="vila_dos_bebes"]');
      await click(page, '[data-travel="vila_dos_bebes"]');
      await page.waitForFunction(() => window.__gs003.mapId === "vila", null, { timeout: 30000 });
      await page.waitForTimeout(1500);
      await page.keyboard.press("m");
      await page.waitForSelector(".wm2", { timeout: 10000 });
      await page.waitForTimeout(600);
      const atVila = await wmState(page);
      await shot(page, `wm_na_vila_${t}.png`, { time, ...atVila });
      await click(page, '[data-wm-pick="floresta_densa"]');
      await click(page, '[data-travel="floresta_densa"]');
      await page.waitForFunction((id) => window.__gs003.mapId === id, ID, { timeout: 30000 });
      await page.waitForTimeout(1200);
      const back = await page.evaluate(() => window.__gs003.mapId);
      report.worldmap.travel = { from: before.mapId, toVila: atVila.mapId, vilaHere: atVila.pois.vila_dos_bebes, back };
      await shot(page, `wm_volta_floresta_${t}.png`, { time, mapId: back });
    }
    await ctx.close();
  }
  // referência: o mesmo painel sem a flag (grafo v1, inalterado)
  const { ctx, page } = await newPage("fresh");
  await open(page, "day", "");
  await page.keyboard.press("m");
  await page.waitForSelector(".worldmap", { timeout: 10000 });
  await page.waitForTimeout(600);
  await shot(page, "wm_sem_flag_v1_dia.png", { time: "day", v2: false, wm2: await page.evaluate(() => !!document.querySelector(".wm2")) });
  await ctx.close();
}

if (WHAT === "worldmap" || WHAT === "all") await worldmap();
if (WHAT === "shots" || WHAT === "all") await shots();
if (WHAT === "video" || WHAT === "all") await video();
writeFileSync(join(OUT, `${PREFIX}capture${WHAT === "all" ? "" : `_${WHAT}`}.json`), JSON.stringify(report, null, 2));
await browser.close();
