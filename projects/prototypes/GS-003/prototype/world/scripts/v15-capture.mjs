// GS-003 v15 integration: capturas 1920×1080 na URL PADRÃO (sem flags): criador (Tamers v13) → inicial → Digi
// Forest v15b. Dia, noite (Configurações → Tempo do dia = noite, o mesmo campo que o jogador usa), Tamer andando no
// mato, um encontro, um Digimon forte na clareira e o Mapa-múndi aberto pelo portal (andando até ele).
// Ambiente: PW_CORE, CHROME, CHROME_LIBS, OUT, BASE (padrão http://127.0.0.1:5191).
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = process.env.OUT;
const BASE = process.env.BASE ?? "http://127.0.0.1:5191";
const W = 1920, H = 1080;
mkdirSync(OUT, { recursive: true });
const { chromium } = await import(process.env.PW_CORE);
const browser = await chromium.launch({
  executablePath: process.env.CHROME,
  args: ["--no-sandbox", "--disable-gpu", "--no-proxy-server", "--hide-scrollbars", "--mute-audio", "--disable-dev-shm-usage"],
  env: { ...process.env, LD_LIBRARY_PATH: [process.env.CHROME_LIBS, process.env.LD_LIBRARY_PATH].filter(Boolean).join(":") },
});
const report = { date: new Date().toISOString(), url: `${BASE}/`, viewport: [W, H], shots: {}, consoleErrors: [], pageErrors: [] };
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
page.on("console", (m) => m.type() === "error" && report.consoleErrors.push(m.text()));
page.on("pageerror", (e) => report.pageErrors.push(String(e)));
const sleep = (ms) => page.waitForTimeout(ms);

const state = () =>
  page.evaluate(() => {
    const g = window.__gs003;
    if (!g) return null;
    const me = g.sim.state.entities.find((e) => e.id === "p1");
    const partner = g.sim.state.entities.find((e) => e.id === "p1:partner");
    const wild = g.sim.state.entities.filter((e) => e.kind === "wild" && !e.removed);
    const enc = g.encounters();
    return {
      mapId: g.mapId,
      tile: me ? [Math.floor(me.x / 16), Math.floor(me.y / 16)] : null,
      tamerVisual: g.view.opts.tamerVisuals?.p1?.manifest.id ?? null,
      tamerFrame: g.view.opts.tamerVisuals?.p1?.manifest.dimensions ?? null,
      night: Number(g.view.nightMix.toFixed(2)),
      phase: g.clock.phase(performance.now()),
      partner: partner ? `${partner.name} Nv.${partner.level} ${partner.state}` : null,
      wild: wild.map((e) => `${e.name} Nv.${e.level} @${Math.floor(e.x / 16)},${Math.floor(e.y / 16)} ${e.entryId ?? ""}`),
      inEncounter: g.sim.state.encounters.filter((x) => !x.done).length,
      enc: enc ? { area: enc.areaId, terrain: enc.terrain, pStep: Number(enc.pStep.toFixed(3)), counters: enc.counters } : null,
      worldmapOpen: !!document.querySelector(".panel.open .worldmap, .panel.open .wm2, [data-panel='map'].open"),
      travelEnabled: [...document.querySelectorAll("[data-travel]")].filter((b) => !b.disabled).length,
    };
  });
const shot = async (name, meta = {}) => {
  await page.screenshot({ path: join(OUT, name) });
  const st = await state();
  report.shots[name] = { ...meta, state: st };
  console.log("ok", name, JSON.stringify(st));
};
/** Coloca Tamer e parceira numa célula (capturas: atalho para não andar o mapa inteiro). */
const place = (x, y) =>
  page.evaluate(([x0, y0]) => {
    const g = window.__gs003;
    const m = g.sim.map;
    // célula livre mais próxima (e a da parceira, à esquerda, também livre e sem prop no pé)
    const busy = new Set(m.props.filter((p) => p.solid || /campfire|sign|lantern|totem|ruin|crystal|portal|log/.test(p.key)).map((p) => Math.floor((p.y - 1) / 32) * m.width + Math.floor(p.x / 32)));
    const free = (cx, cy) => cx >= 0 && cy >= 0 && cx < m.width && cy < m.height && !m.solid[cy * m.width + cx] && !busy.has(cy * m.width + cx);
    let x = x0, y = y0;
    for (let r = 0, done = false; r < 6 && !done; r++)
      for (let dy = -r; dy <= r && !done; dy++)
        for (let dx = -r; dx <= r && !done; dx++)
          if (free(x0 + dx, y0 + dy) && free(x0 + dx - 1, y0 + dy)) [x, y, done] = [x0 + dx, y0 + dy, true];
    for (const [id, dx] of [["p1", 0], ["p1:partner", -1]]) {
      const e = g.sim.state.entities.find((q) => q.id === id);
      e.x = (x + dx) * 16 + 8;
      e.y = y * 16 + 8;
      e.trail = [{ x: e.x, y: e.y }];
      e.home = { x: e.x, y: e.y };
    }
  }, [x, y]);
const hold = async (key, ms) => {
  await page.keyboard.down(key);
  await sleep(ms);
  await page.keyboard.up(key);
};

// ---- URL padrão: criador (Tamers v13) e escolha do inicial ----
await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 120000 });
await page.waitForSelector(".cr-go", { timeout: 120000 });
await sleep(1500);
await shot("v15_00_criador_tamers_v13.png", { note: "criador com os 12 presets v13 (padrão Coragem)" });
await page.click(".cr-go");
await page.waitForSelector(".st-card", { timeout: 60000 });
await page.click(".st-card");
await page.click(".st-card ~ * .cr-go, [data-act='confirm']");
await page.waitForFunction(() => !!window.__gs003?.view, null, { timeout: 120000 });
await sleep(4000);
// pausa o AUTO explorador (qualquer tecla de movimento) e fica parado na entrada sul
await hold("s", 120);
await sleep(1500);
await shot("v15_01_mapa_dia.png", { note: "entrada sul, dia" });

// ---- Tamer andando no mato (mancha da entrada sul, (21,31)) ----
await place(23, 30);
await sleep(900);
await page.keyboard.down("a");
await sleep(700);
await shot("v15_02_tamer_andando_no_mato.png", { note: "andando para oeste dentro do mato da entrada sul" });
// ---- encontro: continua andando no mato (vai e volta) até sair um ----
const t0 = Date.now();
let got = false;
for (let i = 0; i < 40 && !got; i++) {
  await page.keyboard.up("a");
  await page.keyboard.up("d");
  await page.keyboard.down(i % 2 ? "d" : "a");
  for (let k = 0; k < 6 && !got; k++) {
    await sleep(250);
    got = await page.evaluate(() => window.__gs003.sim.state.entities.some((e) => e.kind === "wild" && e.encOwner === "p1" && !e.removed));
  }
}
await page.keyboard.up("a");
await page.keyboard.up("d");
report.encounterAfterMs = Date.now() - t0;
await sleep(1600);
await shot("v15_03_encontro.png", { note: `encontro no mato (${report.encounterAfterMs} ms de caminhada contando a captura anterior)` });
await sleep(2500);
await shot("v15_03b_encontro_luta.png", { note: "combate do encontro" });
await page.keyboard.press("f");
await sleep(2500);

// ---- Digimon forte visível na clareira do santuário ----
const strong = await page.evaluate(() =>
  window.__gs003.sim.state.entities.filter((e) => e.kind === "wild" && !e.removed && (e.entryId ?? "").startsWith("forte-")).map((e) => ({ x: Math.floor(e.x / 16), y: Math.floor(e.y / 16), name: e.name, level: e.level, entry: e.entryId })),
);
report.strongVisible = strong;
const s0 = strong.find((s) => s.entry === "forte-clareira-oeste") ?? strong[0];
if (s0) await place(s0.x + 3, s0.y);
await sleep(2500);
await shot("v15_04_digimon_forte_clareira.png", { note: `forte visível: ${s0 ? `${s0.name} Nv.${s0.level} (${s0.entry})` : "nenhum"}` });

// ---- noite (Configurações → Tempo do dia = noite) ----
await page.evaluate(() => {
  window.__gs003.clock.opts.forced = "night";
});
await place(21, 17);
await sleep(4500);
await shot("v15_05_mapa_noite.png", { note: "margem oeste do rio e ponte, noite" });
await place(14, 16);
await sleep(2500);
await shot("v15_05b_noite_fogueira.png", { note: "clareira oeste com a fogueira, noite" });
await page.evaluate(() => {
  window.__gs003.clock.opts.forced = "day";
});
await sleep(3000);
await place(34, 8);
await sleep(2500);
await shot("v15_06_cachoeira_dia.png", { note: "lago e cachoeira animada, dia" });

// ---- portal → Mapa-múndi (andando até o portal) ----
await place(43, 10);
await sleep(1200);
await hold("w", 1300);
await sleep(1500);
await shot("v15_07_mapa_mundi_pelo_portal.png", { note: "Mapa-múndi aberto pelo portal: Viajar ligado" });
report.hudWorldmap = await page.evaluate(() => {
  const g = window.__gs003;
  g.panels.map.close();
  g.openScreen("map");
  return [...document.querySelectorAll("[data-travel]")].filter((b) => !b.disabled).length;
});
await sleep(800);
await shot("v15_08_mapa_mundi_pelo_hud.png", { note: "Mapa-múndi pelo HUD: só consulta (Viajar desligado)" });

writeFileSync(join(OUT, "v15_capture.json"), JSON.stringify(report, null, 1));
console.log("erros", report.consoleErrors.length, report.pageErrors.length);
await browser.close();
