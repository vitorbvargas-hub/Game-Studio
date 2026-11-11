// GS-003 QO P2: capturas 1920×1080 na URL PADRÃO (dia) — Digivice aberto, as 4 abas novas (Guilda, Correio, Passe,
// Fonte dos Desejos), encontro selvagem e Tamer/Digimon parados de pés juntos (anim v2). Servidor já na 5190.
// Ambiente: PW_CORE, CHROME, CHROME_LIBS (como no v12-default-capture.mjs).
//   node scripts/p2-capture.mjs
// Saída: quality-overhaul/phase3/panels/p2_*.png + p2_capture.json.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.env.OUT ?? join(ROOT, "../../quality-overhaul/phase3/panels");
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
const report = { date: new Date().toISOString(), base: BASE, viewport: [W, H], defaultUrl: `${BASE}/?map=${ID}`, shots: {} };
const errors = [];

async function open(page, extra = "") {
  // URL padrão + só o necessário para reproduzir (sem criador, save novo, semente fixa, AUTO desligado, dia)
  const url = `${BASE}/?map=${ID}&criador=0&novo=1&seed=7&auto=0&time=day${extra}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForFunction((id) => window.__gs003 && window.__gs003.mapId === id, ID, { timeout: 90000 });
  await page.waitForSelector('[data-testid="dg-hub"]', { timeout: 30000 });
  await page.evaluate(() => localStorage.clear()); // save novo também para o Digivice
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction((id) => window.__gs003 && window.__gs003.mapId === id, ID, { timeout: 90000 });
  await page.waitForSelector('[data-testid="dg-hub"]', { timeout: 30000 });
  await page.waitForTimeout(2000);
  return url;
}
const state = (page) =>
  page.evaluate(() => {
    const g = window.__gs003;
    const p = g.sim.state.players.find((q) => q.id === "p1");
    return {
      animV2: !!g.view.opts.animV2,
      encounters: !!g.encounters(),
      visibleWild: g.encounters()?.visibleAlive ?? null,
      locks: document.querySelectorAll(".dg-lock").length,
      lockedPanels: document.querySelectorAll('.panel-wrap.open [data-testid="dg-locked"]').length,
      openPanel: document.querySelector(".panel-wrap.open")?.dataset.panel ?? null,
      tamerLevel: g.hud.tamerProgress().level,
      scanMult: p.scanMult ?? 1,
    };
  });
async function shot(page, name, meta) {
  await page.screenshot({ path: join(OUT, name) });
  report.shots[name] = { ...meta, state: await state(page) };
  console.log("ok", name, JSON.stringify(report.shots[name].state));
}
const panel = async (page, id) => {
  await page.evaluate((id) => window.__gs003.hud.digivice.openPanel(id), id);
  await page.waitForTimeout(500);
};
const click = async (page, sel) => {
  await page.click(sel);
  await page.waitForTimeout(400);
};

const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
page.on("pageerror", (e) => errors.push(String(e)));

// 1) Digivice aberto (clique no hub)
let url = await open(page);
await click(page, '[data-testid="dg-hub"]');
await page.hover('[data-dg="guild"]');
await page.waitForTimeout(500);
await shot(page, "p2_digivice_aberto.png", { url, what: "hub aberto: 6 atalhos, nenhum com cadeado" });

// 2) Guilda: sem guilda (lista de guildas-bot rotuladas) e depois de fundar
await page.keyboard.press("Escape");
await panel(page, "guild");
await shot(page, "p2_guilda.png", { url, what: "Guilda sem guilda: Fundar + guildas-bot rotuladas 'simulada'" });
await click(page, '[data-testid="gd-found"]');
await page.fill('[data-testid="gd-name"]', "Guardiões da Mata");
await click(page, '[data-gd-emblem="6"]');
await click(page, '[data-testid="gd-create"]');
await shot(page, "p2_guilda_fundada.png", { url, what: "Guilda fundada: 1 membro (você), rota dominada e barra de contribuição" });

// 3) Correio: carta de boas-vindas aberta
await panel(page, "mail");
await click(page, '[data-testid="ml-row"]');
await shot(page, "p2_correio.png", { url, what: "Correio: carta de boas-vindas aberta (anexo: Potinho de Energia)" });

// 4) Passe: save novo (0 pontos) e com pontos injetados pelo script (estado de teste, rotulado aqui)
await panel(page, "pass");
await shot(page, "p2_passe.png", { url, what: "Passe de Temporada, save novo (0 pontos, nada a coletar)" });
await page.evaluate(() => window.__gs003.hud.digivice.noteDailyClaim(150));
await page.waitForTimeout(400);
await shot(page, "p2_passe_progresso.png", { url, what: "Passe com 150 Pontos de Passe INJETADOS pelo script (= 3 diárias de 50 XP), nível 3" });

// 5) Fonte dos Desejos: enchendo e pronta (100% injetado pelo script)
await panel(page, "wish");
await shot(page, "p2_fonte.png", { url, what: "Fonte dos Desejos enchendo (save novo)" });
await page.evaluate(() => {
  window.__gs003.hud.digivice.save.wish.pct = 100;
  window.__gs003.hud.digivice.openPanel("wish");
});
await page.waitForTimeout(500);
await shot(page, "p2_fonte_pronta.png", { url, what: "Fonte em 100% (INJETADO pelo script): pedido disponível" });
await click(page, '[data-testid="wf-wish"]');
await page.waitForTimeout(600);
await shot(page, "p2_fonte_ativa.png", { url, what: "pedido feito: contador de 15 min, varredura ×1,5 na sim (scanMult)" });

// 6) Encontro selvagem (encontros padrão): força um encontro aleatório ao lado do Tamer
url = await open(page);
// o ponto inicial fica junto do portal (encontro bloqueado ali): leva o Tamer para a clareira (como no v12)
await page.evaluate(([tx, ty]) => {
  const s = window.__gs003.sim, SUB = 16;
  const p = s.state.players.find((q) => q.id === "p1");
  const t = s.state.entities.find((e) => e.id === p.tamerId), pa = s.state.entities.find((e) => e.id === p.partnerId);
  t.x = tx * SUB + 8; t.y = ty * SUB + 8; t.dest = undefined; t.trail = [{ x: t.x - 4, y: t.y }, { x: t.x, y: t.y }];
  if (pa) { pa.x = t.x - SUB; pa.y = t.y; pa.dest = undefined; }
}, [28, 20]);
await page.waitForTimeout(2500);
let forced = false;
for (let i = 0; i < 15 && !forced; i++) {
  await page.evaluate(() => window.__gs003.forceEncounter());
  await page.waitForTimeout(900);
  forced = await page.evaluate(() => (window.__gs003.encounters()?.randomAlive ?? 0) > 0);
}
await page.waitForTimeout(1200);
report.encounterForced = forced;
await shot(page, "p2_encontro_selvagem.png", { url, what: "encontro selvagem forçado ao lado do Tamer (GS-012 padrão), pontos visíveis no mapa" });

// 7) Tamer/Digimon parados de pés juntos (anim v2 padrão): tela inteira + recorte 4× ampliado do centro
url = await open(page);
await page.waitForTimeout(2500);
await shot(page, "p2_pes_juntos.png", { url, what: "Tamer e parceira parados (idle v2: pés juntos)" });
// centro entre o Tamer e a parceira, medido na tela (posição da entidade no canvas → CSS px)
const { cx, cy } = await page.evaluate(() => {
  const g = window.__gs003;
  const c = document.querySelector("#world");
  const r = c.getBoundingClientRect();
  const s = g.sim.state, p = s.players.find((q) => q.id === "p1");
  const ids = [p.tamerId, p.partnerId];
  const ents = ids.map((id) => g.presenter.entities.get(id)).filter(Boolean);
  const cam = g.view.camera ?? g.view.cam;
  if (!cam || !ents.length) return { cx: 900, cy: 680 };
  const k = r.width / c.width;
  const mx = ents.reduce((a, e) => a + e.cur.x, 0) / ents.length;
  const my = ents.reduce((a, e) => a + e.cur.y, 0) / ents.length;
  return { cx: r.left + (mx - cam.x) * k, cy: r.top + (my - cam.y) * k - 20 };
});
report.zoomCenter = [Math.round(cx), Math.round(cy)];
const crop = await page.screenshot({ clip: { x: Math.max(0, Math.min(W - 480, cx - 240)), y: Math.max(0, Math.min(H - 270, cy - 135)), width: 480, height: 270 } });
const img = await loadImage(crop);
const cv = createCanvas(W, H);
const g = cv.getContext("2d");
g.imageSmoothingEnabled = false;
g.drawImage(img, 0, 0, W, H);
writeFileSync(join(OUT, "p2_pes_juntos_zoom4x.png"), cv.toBuffer("image/png"));
report.shots["p2_pes_juntos_zoom4x.png"] = { url, what: "recorte 480×270 do centro de p2_pes_juntos (mesmo instante +1 quadro), ampliado 4× sem suavização" };

report.errors = errors;
writeFileSync(join(OUT, "p2_capture.json"), JSON.stringify(report, null, 2));
console.log("erros de página:", errors.length);
await browser.close();
