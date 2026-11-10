// Quality Overhaul P8 (HUD v2, só P0, ?hud=v2): capturas 1920×1080 com e sem a flag — dia, noite, faixas de PV
// do Tamer e a sequência de um encontro selvagem (GS-012). Usa o servidor JÁ rodando na 5190; nunca a 5174.
// Mesmo ambiente do scripts/qo3-capture.mjs (PW_CORE, CHROME, CHROME_LIBS). Uso (de prototype/world/):
//   node scripts/p8-capture.mjs
// Saída: quality-overhaul/phase3/img/p8_hud_*.png + p8_hud_capture.json (metadados de cada captura).

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.env.OUT ?? join(ROOT, "../../quality-overhaul/phase3/img");
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

async function open(page, query) {
  const url = `${BASE}/?map=${ID}&criador=0&novo=1&seed=7&auto=0&look=v9&dpr=1&anim=v2&encounters=1${query}`;
  // o dev server às vezes demora no "load" (muitas imagens): espera o DOM e tenta de novo uma vez
  for (let i = 0; ; i++) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
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
const hideDebug = (page) => page.evaluate(() => document.querySelectorAll(".enc-debug").forEach((e) => (e.style.display = "none")));
const shot = async (page, name, meta, clip) => {
  await page.screenshot({ path: join(OUT, name), ...(clip ? { clip } : {}) });
  report.shots[name] = { ...meta, ...(clip ? { clip } : {}) };
  console.log("ok", name);
};
const BOTTOM = { x: 0, y: H - 200, width: W, height: 200 };
const state = (page) =>
  page.evaluate(() => {
    const r = document.querySelector("#hud");
    const tm = r.querySelector(".hud-tamer");
    const pa = r.querySelector('[data-testid="partner"]');
    const mv = [...r.querySelectorAll(".mv")].map((b) => b.dataset.kind ?? null);
    return { v2: r.classList.contains("hud-v2"), tamerTier: tm?.dataset.tier ?? null, partnerTier: pa?.dataset.tier ?? null, partnerAffinity: pa?.dataset.affinity ?? null, moveKinds: mv };
  });

// 1) HUD sem/com a flag, dia e noite (mesma câmera, Tamer na clareira, nenhum combate)
if (process.env.ONLY !== "enc") {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  for (const time of ["day", "night"])
    for (const [tag, q] of [["v1", ""], ["v2", "&hud=v2"]]) {
      await open(page, `${q}&time=${time}`);
      await tp(page, 29, 20);
      await page.waitForTimeout(1800);
      const t = time === "day" ? "dia" : "noite";
      const meta = { query: q, time, ...(await state(page)) };
      await shot(page, `p8_hud_${tag}_${t}.png`, meta);
      await shot(page, `p8_hud_${tag}_${t}_barra.png`, { of: `p8_hud_${tag}_${t}.png` }, BOTTOM);
    }
  // 2) faixas da moldura do Tamer (?tamerhp força o PV mostrado): 35% dourado, 12% vermelho pulsante
  for (const [hp, tag] of [[35, "warn"], [12, "crit"]]) {
    await open(page, `&hud=v2&time=day&tamerhp=${hp}`);
    await tp(page, 29, 20);
    await page.waitForTimeout(1500);
    await shot(page, `p8_hud_v2_tamer_${tag}_barra.png`, { query: `&hud=v2&tamerhp=${hp}`, ...(await state(page)) }, BOTTOM);
  }
  await page.close();
}

// 3) encontro selvagem forçado na grama (GS-012), sem e com a flag: "!" (alerta), placa no pouso, combate
async function encounterCase(tag, q, time) {
    const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    await open(page, `${q}&encdebug=1&time=${time}`);
    await hideDebug(page);
    await tp(page, 22, 21);
    await page.waitForFunction(() => window.__gs003?.forceEncounter, null, { timeout: 30000 });
    await page.waitForTimeout(1200);
    await page.evaluate(() => window.__gs003.forceEncounter(undefined, "rare"));
    await page.waitForFunction(() => window.__gs003.view.encFx?.fx?.some((f) => f.kind === "appear"), null, { timeout: 5000 });
    const t = time === "day" ? "dia" : "noite";
    const since = () => page.evaluate(() => { const fx = window.__gs003.view.encFx; const f = [...fx.fx].reverse().find((x) => x.kind === "appear"); return f ? Math.round(performance.now() - f.start) : 1e9; });
    const waitUntil = async (ms) => { for (;;) { const s = await since(); if (s >= ms) return s; await page.waitForTimeout(Math.min(60, ms - s)); } };
    for (const [ph, ms] of [["1_alerta", 750], ["2_placa", 1650], ["3_combate", 2450]]) {
      const at = await waitUntil(ms);
      const extra = await page.evaluate(() => { const g = window.__gs003; const fx = g.view.encFx; const f = [...fx.fx].reverse().find((x) => x.kind === "appear"); return { phase: fx.phase(performance.now()), rarity: f?.rarity, name: f?.name, plateIds: [...(g.view.plateIds ?? [])] }; });
      await shot(page, `p8_hud_${tag}_encontro_${t}_${ph}.png`, { query: q, time, msAfterRoll: at, ...extra });
    }
    await page.waitForTimeout(1500);
    await shot(page, `p8_hud_${tag}_encontro_${t}_4_combate_barra.png`, { query: q, time, ...(await state(page)) }, BOTTOM);
    await page.close();
}
// máquina compartilhada: a página às vezes recarrega no meio (HMR do dev server); tenta de novo até 3 vezes
// ONLY=base: só a parte 1/2; ONLY=enc: só os encontros (rodadas separadas numa máquina carregada)
for (const [tag, q] of process.env.ONLY === "base" ? [] : [["v1", ""], ["v2", "&hud=v2"]])
  for (const time of ["day", "night"])
    for (let i = 0; ; i++) {
      try {
        await encounterCase(tag, q, time);
        break;
      } catch (e) {
        console.log("retry", tag, time, String(e).split("\n")[0]);
        if (i >= 2) throw e;
      }
    }

writeFileSync(join(OUT, process.env.ONLY === "enc" ? "p8_hud_capture_enc.json" : "p8_hud_capture.json"), JSON.stringify(report, null, 2));
await browser.close();
