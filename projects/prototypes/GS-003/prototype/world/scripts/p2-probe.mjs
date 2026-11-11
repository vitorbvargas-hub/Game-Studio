// GS-003 QO P2: verificação na URL PADRÃO (sem flags) de que anim v2, encontros GS-012, AUTO explorador e
// Shift+1..5 funcionam. Servidor já rodando na 5190. Ambiente: PW_CORE, CHROME, CHROME_LIBS.
//   node scripts/p2-probe.mjs  → JSON no stdout
const BASE = process.env.BASE ?? "http://127.0.0.1:5190";
const { chromium } = await import(process.env.PW_CORE);
const browser = await chromium.launch({
  executablePath: process.env.CHROME,
  args: ["--no-sandbox", "--disable-gpu", "--no-proxy-server", "--hide-scrollbars", "--mute-audio"],
  env: { ...process.env, LD_LIBRARY_PATH: [process.env.CHROME_LIBS, process.env.LD_LIBRARY_PATH].filter(Boolean).join(":") },
});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(`${BASE}/?map=digimon-forest-01&criador=0&novo=1&seed=7&time=day`, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForFunction(() => window.__gs003 && window.__gs003.mapId === "digimon-forest-01", null, { timeout: 90000 });
await page.waitForTimeout(2500);
const out = {};
out.defaults = await page.evaluate(() => ({ animV2: !!window.__gs003.view.opts.animV2, encounters: window.__gs003.encounters() }));
const pos = () =>
  page.evaluate(() => {
    const s = window.__gs003.sim, p = s.state.players.find((q) => q.id === "p1");
    const t = s.state.entities.find((e) => e.id === p.tamerId);
    const pa = s.state.entities.find((e) => e.id === p.partnerId);
    return { x: Math.round(t.x), y: Math.round(t.y), auto: p.auto, explore: p.autoExplore ?? null, partner: pa?.speciesId };
  });
out.before = await pos();
const autoOn = await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => /auto/i.test(x.textContent ?? "") || /auto/i.test(x.dataset.testid ?? ""));
  b?.click();
  return b ? b.outerHTML.slice(0, 120) : null;
});
out.autoButton = autoOn;
await page.waitForTimeout(8000);
out.afterAuto8s = await pos();
// Shift+2: troca para o 2º da faixa da equipe
await page.keyboard.down("Shift");
await page.keyboard.press("Digit2");
await page.keyboard.up("Shift");
await page.waitForTimeout(1500);
out.afterShift2 = await pos();
out.errors = errors;
console.log(JSON.stringify(out, null, 1));
await browser.close();
