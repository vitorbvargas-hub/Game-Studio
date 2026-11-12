// QA GS-003 (game-qa, read-only): verifica ao vivo a URL EXATA do fundador
// http://127.0.0.1:5190/?map=digimon-forest-01 — SEM nenhuma flag — e depois abre o Digivice/4 abas novas/
// mapa-múndi/encontro para nota qualitativa. Script temporário, roda e é apagado (não fica no worktree).
// Ambiente: PW_CORE, CHROME, CHROME_LIBS.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = process.env.OUT;
const BASE = process.env.BASE ?? "http://127.0.0.1:5190";
const W = 1920, H = 1080;
const ID = "digimon-forest-01";
mkdirSync(OUT, { recursive: true });

const { chromium } = await import(process.env.PW_CORE);
const browser = await chromium.launch({
  executablePath: process.env.CHROME,
  args: ["--no-sandbox", "--disable-gpu", "--no-proxy-server", "--hide-scrollbars", "--mute-audio", "--disable-dev-shm-usage"],
  env: { ...process.env, LD_LIBRARY_PATH: [process.env.CHROME_LIBS, process.env.LD_LIBRARY_PATH].filter(Boolean).join(":") },
});

const report = { date: new Date().toISOString(), base: BASE, viewport: [W, H], literalUrl: `${BASE}/?map=${ID}`, shots: {}, consoleErrors: [], pageErrors: [] };

const state = (page) =>
  page.evaluate(() => {
    const g = window.__gs003;
    if (!g) return null;
    const p = g.sim.state.players.find((q) => q.id === "p1");
    const ground = g.sim.map.tileLayers?.find((l) => l.name === "ground");
    return {
      hudV2: !!document.querySelector(".hud-v2"),
      digiviceHub: !!document.querySelector('[data-testid="dg-hub"]'),
      animV2: !!g.view.opts?.animV2,
      encountersOn: !!g.encounters(),
      lipMirante: ground?.keys?.some((k) => /^fp12_mirante_top_edge_/.test(k)) ?? null,
      worldmapArt: (document.querySelector(".wm2")?.getAttribute("style") ?? "").match(/worldmap[^/'"]*\.png/)?.[0] ?? null,
      dprMode: g.scaleInfo?.dprMode ?? null,
      dpr: g.scaleInfo?.dpr ?? null,
      scale: g.scaleInfo?.scale ?? null,
      officialScale: g.officialScale ?? null,
      tamerLevel: p ? g.hud.tamerProgress().level : null,
      locks: document.querySelectorAll(".dg-lock").length,
      mapId: g.mapId,
    };
  });

const shot = async (page, name, meta) => {
  await page.screenshot({ path: join(OUT, name) });
  const st = await state(page);
  report.shots[name] = { ...meta, state: st };
  console.log("ok", name, JSON.stringify(st));
};

const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
page.on("console", (m) => {
  if (m.type() === "error") report.consoleErrors.push(m.text());
});
page.on("pageerror", (e) => report.pageErrors.push(String(e)));

// ---- PASSO 1: URL LITERAL, zero params extras, sessão nova (sem save) ----
await page.goto(report.literalUrl, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(1500);
const hasCreator = await page.evaluate(() => !!document.querySelector('.cr-go'));
report.literalFlow = { hasCreatorOnFreshVisit: hasCreator };
if (hasCreator) {
  await shot(page, "p2d_00_criador.png", { url: report.literalUrl, what: "primeira tela com save novo: Criador de Tamer (onboarding normal, não é flag)" });
  await page.click('.cr-go');
  await page.waitForTimeout(1500);
}
await page.waitForFunction((id) => window.__gs003 && window.__gs003.mapId === id, ID, { timeout: 90000 }).catch(() => {});
await page.waitForSelector('[data-testid="dg-hub"]', { timeout: 20000 }).catch(() => {});
await page.waitForTimeout(2500);
await shot(page, "p2d_01_mapa_padrao.png", { url: report.literalUrl, what: "URL literal (map=digimon-forest-01, zero outras flags) após onboarding: estado do mapa" });

// ---- PASSO 2: reload da URL literal com save já existente (segunda visita, como o fundador faria) ----
await page.reload({ waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForFunction((id) => window.__gs003 && window.__gs003.mapId === id, ID, { timeout: 90000 });
await page.waitForSelector('[data-testid="dg-hub"]', { timeout: 20000 });
await page.waitForTimeout(2500);
await shot(page, "p2d_02_mapa_padrao_reload.png", { url: report.literalUrl, what: "segunda visita (com save): direto no mapa, dia" });

// zoom no Tamer/Digimon oficial para avaliar escala/andar
const zoomPlayer = async (name, what) => {
  const { cx, cy } = await page.evaluate(() => {
    const g = window.__gs003;
    const c = document.querySelector("#world");
    const r = c.getBoundingClientRect();
    const s = g.sim.state, p = s.players.find((q) => q.id === "p1");
    const ents = [p.tamerId, p.partnerId].map((id) => g.presenter.entities.get(id)).filter(Boolean);
    const cam = g.view.camera ?? g.view.cam;
    if (!cam || !ents.length) return { cx: c.width / 2, cy: c.height / 2 };
    const k = r.width / c.width;
    const mx = ents.reduce((a, e) => a + e.cur.x, 0) / ents.length;
    const my = ents.reduce((a, e) => a + e.cur.y, 0) / ents.length;
    return { cx: r.left + (mx - cam.x) * k, cy: r.top + (my - cam.y) * k - 20 };
  });
  const clip = { x: Math.max(0, Math.min(W - 500, cx - 250)), y: Math.max(0, Math.min(H - 300, cy - 150)), width: 500, height: 300 };
  await page.screenshot({ path: join(OUT, name), clip });
  report.shots[name] = { what, clip };
};
await zoomPlayer("p2d_03_tamer_mon_zoom.png", "recorte perto do Tamer/parceiro oficial: escala e idle");

// ---- PASSO 3: mirante (altura lida?) ----
const tp = (tx, ty) =>
  page.evaluate(([tx, ty]) => {
    const s = window.__gs003.sim, SUB = 16;
    const p = s.state.players.find((q) => q.id === "p1");
    p.auto = false;
    const t = s.state.entities.find((e) => e.id === p.tamerId), pa = s.state.entities.find((e) => e.id === p.partnerId);
    t.x = tx * SUB + 8; t.y = ty * SUB + 8; t.dest = undefined; t.trail = [{ x: t.x - 4, y: t.y }, { x: t.x, y: t.y }];
    if (pa) { pa.x = t.x - SUB; pa.y = t.y; pa.dest = undefined; }
  }, [tx, ty]);
await tp(25, 20);
await page.waitForTimeout(2000);
await shot(page, "p2d_04_mirante.png", { url: report.literalUrl, what: "mirante: borda norte/platô (lip), lê-se a diferença de altura?" });

// ---- PASSO 4: noite (time=night só altera relógio, não é flag de produto) ----
await page.goto(`${report.literalUrl}&time=night`, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForFunction((id) => window.__gs003 && window.__gs003.mapId === id, ID, { timeout: 90000 });
await page.waitForSelector('[data-testid="dg-hub"]', { timeout: 20000 });
await tp(28, 20);
await page.waitForTimeout(2500);
await shot(page, "p2d_05_noite.png", { url: `${report.literalUrl}&time=night`, what: "noite pintada (nightEarth, copas noturnas)" });

// ---- PASSO 5: mapa-múndi v2.1 (tecla M) ----
await page.keyboard.press("m");
await page.waitForSelector(".wm2", { timeout: 15000 }).catch(() => {});
await page.waitForTimeout(900);
await shot(page, "p2d_06_mundi.png", { url: `${report.literalUrl}&time=night`, what: "mapa-múndi v2.1 aberto (M)" });
await page.keyboard.press("Escape");
await page.waitForTimeout(400);

// ---- PASSO 6: Digivice hub + 4 abas novas (Guilda/Correio/Passe/Fonte) ----
await page.click('[data-testid="dg-hub"]');
await page.waitForTimeout(700);
await shot(page, "p2d_07_digivice_hub.png", { url: `${report.literalUrl}&time=night`, what: "Digivice: hub com 6 atalhos (cadeados?)" });

const panel = async (id) => {
  await page.evaluate((id) => window.__gs003.hud.digivice.openPanel(id), id);
  await page.waitForTimeout(600);
};
const readPanelText = () =>
  page.evaluate(() => {
    const el = document.querySelector(".panel-wrap.open");
    return el ? el.textContent.replace(/\s+/g, " ").trim().slice(0, 600) : null;
  });

await panel("guild");
await shot(page, "p2d_08_guilda.png", { url: report.literalUrl, what: "aba Guilda (antes bloqueada)" });
report.panelText = report.panelText ?? {};
report.panelText.guild = await readPanelText();

await panel("mail");
await shot(page, "p2d_09_correio.png", { url: report.literalUrl, what: "aba Correio (antes bloqueada)" });
report.panelText.mail = await readPanelText();

await panel("pass");
await shot(page, "p2d_10_passe.png", { url: report.literalUrl, what: "aba Passe de Temporada (antes bloqueada)" });
report.panelText.pass = await readPanelText();

await panel("wish");
await shot(page, "p2d_11_fonte.png", { url: report.literalUrl, what: "aba Fonte dos Desejos (antes bloqueada)" });
report.panelText.wish = await readPanelText();

await page.keyboard.press("Escape");
await page.waitForTimeout(400);

// ---- PASSO 7: encontro selvagem (sem flags: padrão GS-012) ----
await tp(28, 20);
await page.waitForTimeout(2000);
let forced = false;
for (let i = 0; i < 15 && !forced; i++) {
  await page.evaluate(() => window.__gs003.forceEncounter());
  await page.waitForTimeout(900);
  forced = await page.evaluate(() => (window.__gs003.encounters()?.randomAlive ?? 0) > 0);
}
await page.waitForTimeout(1200);
report.encounterForced = forced;
await shot(page, "p2d_12_encontro.png", { url: report.literalUrl, what: "encontro selvagem (padrão GS-012), legibilidade dos pontos" });

report.finalConsoleErrorCount = report.consoleErrors.length;
report.finalPageErrorCount = report.pageErrors.length;
writeFileSync(join(OUT, "p2_default_url_capture.json"), JSON.stringify(report, null, 2));
console.log("console errors:", report.consoleErrors.length, "page errors:", report.pageErrors.length);
await page.close();
await browser.close();
