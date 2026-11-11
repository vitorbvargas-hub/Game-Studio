// Ficha holográfica do parceiro + árvore de evolução com % (VIDEO_IDEAS_SPEC §3) e as correções do QA do HUD v2
// (QA_HUD_FB1_COMPARE: bloco do Tamer 120 px, grama alta +10%): capturas 1920×1080 dia/noite, ?hud=v2.
// Usa o servidor JÁ rodando na 5190; nunca a 5174. Mesmo ambiente do scripts/dg-capture.mjs:
//   PW_CORE=... CHROME=... CHROME_LIBS=... node scripts/hc-capture.mjs
// O arco do Digivice e o Chefe Mundial com bots saem do dg-capture.mjs (PREFIX=fix_).
// Saída: quality-overhaul/phase3/hud/hc_*.png, hc_capture.json.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.env.OUT ?? join(ROOT, "../../quality-overhaul/phase3/hud");
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
const report = { date: new Date().toISOString(), base: BASE, viewport: [W, H], shots: {} };

async function open(time, hud = "&hud=v2") {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const url = `${BASE}/?map=${ID}&criador=0&novo=1&seed=7&auto=0&look=v9&dpr=1&anim=v2&encounters=1${hud}&time=${time}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForFunction((id) => window.__gs003 && window.__gs003.mapId === id, ID, { timeout: 90000 });
  await page.waitForSelector('[data-testid="partner"] canvas', { timeout: 30000 });
  await page.waitForTimeout(2200);
  return { ctx, page };
}

async function shot(page, name, meta, clip) {
  await page.screenshot({ path: join(OUT, name), ...(clip ? { clip } : {}) });
  const info = await page.evaluate(() => {
    const holo = document.querySelector('[data-testid="holo"]');
    return {
      holoTab: holo?.dataset.tab ?? null,
      nodes: [...document.querySelectorAll(".hc-node")].map((n) => ({ id: n.dataset.node, state: n.dataset.state, pct: n.dataset.pct ?? null })),
      tamerWidth: document.querySelector(".hud-tamer")?.getBoundingClientRect().width ?? null,
    };
  });
  report.shots[name] = { ...meta, ...(clip ? { clip } : {}), ...info };
  console.log("ok", name);
}

const rectOf = (page, sel, pad = 8) =>
  page.$eval(
    sel,
    (el, pad) => {
      const r = el.getBoundingClientRect();
      return { x: Math.max(0, Math.floor(r.x - pad)), y: Math.max(0, Math.floor(r.y - pad)), width: Math.ceil(r.width + 2 * pad), height: Math.ceil(r.height + 2 * pad) };
    },
    pad,
  );

for (const time of ["day", "night"]) {
  const t = time === "day" ? "dia" : "noite";
  const { ctx, page } = await open(time);
  // ficha (retrato do parceiro abre)
  await page.click('[data-testid="partner"]');
  await page.waitForTimeout(900);
  await shot(page, `hc_ficha_${t}.png`, { time, tab: "card" });
  await shot(page, `hc_ficha_${t}_painel.png`, { time, tab: "card" }, await rectOf(page, '[data-panel="holo"] .modal'));
  // árvore
  await page.click('[data-testid="hc-tab-tree"]');
  await page.waitForTimeout(700);
  await shot(page, `hc_arvore_${t}.png`, { time, tab: "tree" });
  await shot(page, `hc_arvore_${t}_painel.png`, { time, tab: "tree" }, await rectOf(page, '[data-panel="holo"] .modal'));
  if (time === "day") {
    // tooltip com o que falta (foco no 1º nó à frente)
    const n = await page.$('.hc-node[data-state="next"]');
    if (n) {
      await n.hover();
      await page.waitForTimeout(400);
      await shot(page, "hc_arvore_dia_tooltip.png", { time, tab: "tree", hover: await n.getAttribute("data-node") }, await rectOf(page, '[data-panel="holo"] .modal'));
    }
  }
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  // linha que RAMIFICA: Agumon (CREATURE-0006 → Greymon | GeoGreymon) via __gs003.setPartner, em dois níveis
  for (const lvl of time === "day" ? [10, 20] : [20]) {
    await page.evaluate((l) => window.__gs003.setPartner("CREATURE-0006", l), lvl);
    await page.waitForTimeout(900);
    // com caminho elegível o main abre a tela "Evoluir" sozinho: fecha (a ficha mostra o mesmo botão no nó)
    if (await page.$('[data-panel="evolve"].open')) await page.click('[data-panel="evolve"].open [data-panel-close].x');
    await page.waitForTimeout(300);
    await page.click('[data-testid="partner"]');
    await page.waitForTimeout(700);
    await page.click('[data-testid="hc-tab-tree"]');
    await page.waitForTimeout(700);
    await shot(page, `hc_arvore_ramo_nv${lvl}_${t}.png`, { time, tab: "tree", partner: "CREATURE-0006", level: lvl });
    await shot(page, `hc_arvore_ramo_nv${lvl}_${t}_painel.png`, { time, tab: "tree", partner: "CREATURE-0006", level: lvl }, await rectOf(page, '[data-panel="holo"] .modal'));
    if (time === "day" && lvl === 10) {
      const n = await page.$('.hc-node[data-state="next"]');
      if (n) {
        await n.hover();
        await page.waitForTimeout(400);
        await shot(page, `hc_arvore_ramo_nv${lvl}_${t}_tooltip.png`, { time, tab: "tree", hover: await n.getAttribute("data-node") }, await rectOf(page, '[data-panel="holo"] .modal'));
      }
    }
    if (time === "day" && lvl === 20) {
      await page.click('[data-hc-tab="card"]');
      await page.waitForTimeout(500);
      await shot(page, `hc_ficha_ramo_nv${lvl}_${t}_painel.png`, { time, tab: "card", partner: "CREATURE-0006", level: lvl }, await rectOf(page, '[data-panel="holo"] .modal'));
    }
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  }
  // bloco do Tamer (120 px) e barra inferior
  await shot(page, `hc_tamer_barra_${t}.png`, { time }, await rectOf(page, ".hud-tamer", 140));
  await ctx.close();
}

// grama alta: o mesmo quadro com e sem a flag (o +10% de saturação só existe no v2)
for (const [hud, tag] of [
  ["", "v1"],
  ["&hud=v2", "v2"],
]) {
  const { ctx, page } = await open("day", hud);
  await shot(page, `hc_grama_${tag}_dia.png`, { time: "day", hud: tag });
  await shot(page, `hc_grama_${tag}_dia_centro.png`, { time: "day", hud: tag }, { x: 660, y: 290, width: 600, height: 500 });
  await ctx.close();
}

writeFileSync(join(OUT, "hc_capture.json"), JSON.stringify(report, null, 2));
await browser.close();
