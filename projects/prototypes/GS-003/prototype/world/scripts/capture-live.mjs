// Capturas AO VIVO da prova visual (docs/screens/proof_live_*.png): o jogo real rodando no Chromium headless,
// com o HUD em DOM, os nomes e o modal. Sobe o Vite em modo dev, abre a página via Chrome DevTools Protocol
// (WebSocket nativo do Node), espera os momentos certos (lendo window.__gs003) e fotografa.
//
// Uso: npm run shots:live
//   CHROME=/caminho/chrome-headless-shell   (padrão: ~/.cache/ms-playwright/chromium_headless_shell-*/…)
//   CHROME_LIBS=/dir/com/libnss3…           (opcional: LD_LIBRARY_PATH extra, se o host não tiver as libs)
//   SEED=7 W=1600 H=900 · QUERY="map=meadow" · ONLY=geral · OUT=/outro/dir

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.env.OUT ?? join(ROOT, "docs/screens");
/** QUERY extra na URL (ex. "map=meadow"); ONLY=geral tira só a visão geral (checagem rápida). */
const QUERY = process.env.QUERY ? `&${process.env.QUERY}` : "";
const SEED = Number(process.env.SEED ?? 7);
const W = Number(process.env.W ?? 1600);
const H = Number(process.env.H ?? 900);
const PORT = 5190;
const DEBUG_PORT = 9333;

function findChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  const base = join(homedir(), ".cache/ms-playwright");
  for (const d of existsSync(base) ? readdirSync(base).sort().reverse() : []) {
    const p = join(base, d, "chrome-headless-shell-linux64/chrome-headless-shell");
    if (existsSync(p)) return p;
    const q = join(base, d, "chrome-linux/chrome");
    if (existsSync(q)) return q;
  }
  throw new Error("Chromium não encontrado: defina CHROME=/caminho/do/binário");
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cdpConnect() {
  for (let i = 0; i < 50; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)).json();
      const page = list.find((t) => t.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      /* ainda subindo */
    }
    await sleep(200);
  }
  throw new Error("Chromium não respondeu no DevTools");
}

class Cdp {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.id = 0;
    this.pending = new Map();
    this.ws.onmessage = (m) => {
      const msg = JSON.parse(m.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { res, rej } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) rej(new Error(msg.error.message));
        else res(msg.result);
      } else if (msg.method === "Runtime.consoleAPICalled") {
        const text = msg.params.args.map((a) => a.value ?? a.description ?? "").join(" ");
        if (msg.params.type === "error" || msg.params.type === "warning") console.log(`[página:${msg.params.type}]`, text.slice(0, 300));
      } else if (msg.method === "Runtime.exceptionThrown") {
        console.log("[página:exceção]", msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text);
      }
    };
  }
  open() {
    return new Promise((res, rej) => {
      this.ws.onopen = res;
      this.ws.onerror = rej;
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((res, rej) => this.pending.set(id, { res, rej }));
  }
  async eval(expr) {
    const r = await this.send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result.value;
  }
  async shot(name) {
    const r = await this.send("Page.captureScreenshot", { format: "png" });
    writeFileSync(join(OUT, name), Buffer.from(r.data, "base64"));
    console.log("ok", name);
  }
  async waitFor(expr, timeoutMs, label) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeoutMs) {
      if (await this.eval(expr)) return true;
      await sleep(25);
    }
    console.warn(`aviso: tempo esgotado esperando ${label}`);
    return false;
  }
}

async function main() {
  // Tudo aqui é loopback (Vite + DevTools): se o host força proxy no fetch/WebSocket do Node, reexecuta sem ele.
  if (process.env.NODE_USE_ENV_PROXY) {
    const env = { ...process.env, NO_PROXY: "127.0.0.1,localhost" };
    delete env.NODE_USE_ENV_PROXY;
    const child = spawn(process.execPath, process.argv.slice(1), { env, stdio: "inherit" });
    await new Promise((r) => child.on("exit", (code) => r((process.exitCode = code ?? 1))));
    return;
  }
  mkdirSync(OUT, { recursive: true });
  const server = await createServer({ root: ROOT, server: { port: PORT, strictPort: true, host: "127.0.0.1" }, logLevel: "warn" });
  await server.listen();
  const chrome = findChrome();
  const env = { ...process.env };
  if (process.env.CHROME_LIBS) env.LD_LIBRARY_PATH = [process.env.CHROME_LIBS, env.LD_LIBRARY_PATH].filter(Boolean).join(":");
  const proc = spawn(
    chrome,
    ["--headless", "--no-sandbox", "--no-proxy-server", "--disable-gpu", "--hide-scrollbars", "--mute-audio", `--remote-debugging-port=${DEBUG_PORT}`, `--window-size=${W},${H}`, "--force-device-scale-factor=1", "about:blank"],
    { env, stdio: ["ignore", "ignore", "pipe"] },
  );
  let stderr = "";
  proc.stderr.on("data", (d) => (stderr += d));
  try {
    const cdp = new Cdp(await cdpConnect());
    await cdp.open();
    await cdp.send("Runtime.enable");
    await cdp.send("Page.enable");
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });
    if (process.env.ONLY === "creator") return await creator(cdp);
    // criador=0: as capturas do mundo pulam o criador de Tamer (usa o visual padrão)
    await cdp.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/?seed=${SEED}&auto=1&criador=0${QUERY}` });
    await cdp.waitFor("!!window.__gs003", 30000, "o jogo iniciar");
    await sleep(3500);
    if (process.env.ONLY === "forest") return await forestV4(cdp);
    if (process.env.ONLY === "daynight") return await dayNight(cdp);
    await cdp.shot("proof_live_geral.png");
    if (process.env.ONLY === "geral") return;
    if (process.env.ONLY === "golpes") return await golpes(cdp);

    // Combate: o instante do impacto de um golpe da parceira local (flash, faíscas/anel, número de dano).
    await cdp.waitFor(
      `(() => { const g = window.__gs003; const now = performance.now();
        return g.presenter.hitFx.some((f) => { const t = g.presenter.entities.get(f.targetId);
          return f.attackerId === g.presenter.localPartnerId && t && t.defeatedAt === undefined && now - f.start >= 0 && now - f.start < 90; }); })()`,
      40000,
      "um impacto da parceira",
    );
    await cdp.shot("proof_live_combate.png");
    // Recorte ampliado (2×) em volta da parceira, para ler o efeito e os rótulos.
    const at = await cdp.eval(`(() => { const g = window.__gs003; const v = g.view; const p = v.motionPos(g.presenter.localPartnerId);
      const s = parseFloat(document.querySelector("#world").style.width) / document.querySelector("#world").width;
      return { x: (p.x - v.camera.x) * s, y: (p.y - v.camera.y) * s }; })()`);
    const cw = 560;
    const ch = 300;
    const r = await cdp.send("Page.captureScreenshot", {
      format: "png",
      clip: { x: Math.max(0, Math.min(W - cw, at.x - cw / 2)), y: Math.max(0, Math.min(H - ch, at.y - ch * 0.6)), width: cw, height: ch, scale: 2 },
    });
    writeFileSync(join(OUT, "proof_live_combate_zoom.png"), Buffer.from(r.data, "base64"));
    console.log("ok proof_live_combate_zoom.png");

    // Outros jogadores: um Digimon de bot acertando um selvagem com AUTO.
    await cdp.waitFor(
      `(() => { const g = window.__gs003; const now = performance.now();
        return g.presenter.hitFx.some((f) => f.attackerId && g.presenter.entities.get(f.attackerId)?.kind === "remote_partner" && now - f.start < 50); })()`,
      30000,
      "um impacto de bot",
    );
    await cdp.shot("proof_live_jogadores.png");

    // Modal Equipe & Box pelo atalho do HUD.
    await cdp.eval(`document.querySelector('[data-short="team"]').click()`);
    await sleep(120);
    await cdp.shot("proof_live_modal_transicao.png");
    await sleep(400);
    await cdp.shot("proof_live_modal.png");
    await cdp.eval(`document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })) || window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))`);
    await sleep(300);
    await golpes(cdp);
    const report = await cdp.eval(`(() => { const g = window.__gs003; const ents = [...g.presenter.entities.values()];
      return { jogadores: ents.filter((v) => v.kind === "remote_player").length, selvagens: ents.filter((v) => v.kind === "wild").length,
               props: g.sim.map.props.length, tick: g.sim.state.tick }; })()`);
    console.log("estado:", JSON.stringify(report));
  } finally {
    proc.kill("SIGKILL");
    await server.close();
    if (process.env.DEBUG_CHROME) console.error(stderr.slice(-2000));
  }
}

/**
 * Criador de Tamer: a tela inicial, uma combinação escolhida pelos botões (com nome), o preview girando nas
 * 4 direções (recortes ampliados lado a lado) e o Tamer escolhido já no mundo com os bots aleatórios.
 */
async function creator(cdp) {
  await cdp.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/?seed=${SEED}&auto=1&time=day${QUERY}` });
  await cdp.waitFor(`!!document.querySelector(".creator [data-testid=cr-preview]")`, 30000, "o criador abrir");
  await sleep(800);
  await cdp.shot("creator_tela.png");
  await cdp.eval(`(() => { const c = (sel) => document.querySelector(sel).click();
    c('[data-opt="model"][data-val="female"]'); c('[data-opt="skin"][data-val="deep"]'); c('[data-opt="hairCut"][data-val="marias-chiquinhas"]');
    c('[data-opt="hairColor"][data-val="rosa"]'); c('[data-opt="outfit"][data-val="aventureiro"]'); c('[data-opt="outfitColor"][data-val="roxo"]');
    const i = document.querySelector('[data-testid="cr-name"]'); i.value = "Nina"; i.dispatchEvent(new Event("input")); })()`);
  await sleep(400);
  await cdp.shot("creator_escolhas.png");
  // preview: um recorte por direção (o preview troca a cada 1,4 s)
  const box = await cdp.eval(`(() => { const r = document.querySelector('[data-testid="cr-preview"]').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })()`);
  const { createCanvas, loadImage } = await import("@napi-rs/canvas");
  const strip = createCanvas(box.w * 4 + 50, box.h + 40);
  const g = strip.getContext("2d");
  g.fillStyle = "#141722";
  g.fillRect(0, 0, strip.width, strip.height);
  const seen = new Set();
  for (let k = 0; k < 80 && seen.size < 4; k++) {
    const dir = await cdp.eval(`document.querySelector('[data-testid="cr-dir"]').textContent`);
    if (!seen.has(dir)) {
      await sleep(300);
      const r = await cdp.send("Page.captureScreenshot", { format: "png", clip: { x: box.x, y: box.y, width: box.w, height: box.h, scale: 1 } });
      const img = await loadImage(Buffer.from(r.data, "base64"));
      const x = 10 + seen.size * (box.w + 10);
      g.drawImage(img, x, 10);
      g.fillStyle = "#e6e9f2";
      g.font = "16px sans-serif";
      g.fillText(dir, x + 6, box.h + 30);
      seen.add(dir);
    }
    await sleep(150);
  }
  writeFileSync(join(OUT, "creator_preview_4dir.png"), strip.toBuffer("image/png"));
  console.log("ok creator_preview_4dir.png", [...seen].join(","));
  await cdp.eval(`document.querySelector('[data-act="confirm"]').click()`);
  await cdp.waitFor("!!window.__gs003", 30000, "o jogo iniciar");
  await sleep(3000);
  await cdp.shot("creator_no_mundo.png");
  const at = await cdp.eval(`(() => { const g = window.__gs003; const v = g.view; const p = v.motionPos("p1");
    const s = parseFloat(document.querySelector("#world").style.width) / document.querySelector("#world").width;
    return { x: (p.x - v.camera.x) * s, y: (p.y - v.camera.y) * s, nome: g.sim.state.entities.find((e) => e.id === "p1").name }; })()`);
  const cw = 640;
  const ch = 340;
  const r = await cdp.send("Page.captureScreenshot", { format: "png", clip: { x: Math.max(0, Math.min(W - cw, at.x - cw / 2)), y: Math.max(0, Math.min(H - ch, at.y - ch * 0.55)), width: cw, height: ch, scale: 2 } });
  writeFileSync(join(OUT, "creator_no_mundo_zoom.png"), Buffer.from(r.data, "base64"));
  console.log("ok creator_no_mundo_zoom.png", JSON.stringify(at));
}

/** Ciclo dia/noite: mesma semente em ?time=day, ?time=18:30 (relógio parado no meio do anoitecer) e ?time=night. */
async function dayNight(cdp) {
  const shots = [
    ["daynight_dia.png", "time=day"],
    ["daynight_anoitecer.png", "time=18:30&timescale=0"],
    ["daynight_noite.png", "time=night"],
  ];
  for (const [name, q] of shots) {
    await cdp.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/?seed=${SEED}&auto=1&criador=0&${q}${QUERY}` });
    await sleep(500);
    await cdp.waitFor("!!window.__gs003", 30000, "o jogo iniciar");
    await sleep(3500);
    const st = await cdp.eval(`(() => { const g = window.__gs003; return { mix: g.view.nightMix, hud: document.querySelector('[data-testid="daytime"]').textContent }; })()`);
    console.log(name, JSON.stringify(st));
    await cdp.shot(name);
  }
}

/**
 * forest-v4 no jogo: visão geral e o Tamer atrás de uma copa (copa translúcida), com recorte ampliado.
 * O Tamer é posto (só posição lógica) num ponto andável sob a copa da árvore mais próxima.
 */
async function forestV4(cdp) {
  await cdp.shot("forest_v4_depois.png");
  const spot = await cdp.eval(`(() => { const g = window.__gs003; const me = g.sim.state.entities.find((e) => e.id === "p1");
    const m = g.sim.map; const px = me.x * 2, py = me.y * 2;
    const free = (x, y) => !m.solid[Math.floor(y / 32) * m.width + Math.floor(x / 32)];
    const c = g.view.treeGeoms().map((t) => ({ t, x: t.top.x + t.top.w / 2, y: t.top.y + t.top.h * 0.62 }))
      .filter((o) => free(o.x, o.y) && free(o.x, o.y - 12) && o.t.top.w < 80).sort((a, b) => Math.hypot(a.x - px, a.y - py) - Math.hypot(b.x - px, b.y - py))[0];
    me.x = Math.round(c.x / 2); me.y = Math.round(c.y / 2); me.dest = undefined;
    return { index: c.t.index, x: c.x, y: c.y }; })()`);
  await sleep(1200);
  const alpha = await cdp.eval(`window.__gs003.view.canopyAlphaOf(${spot.index})`);
  console.log("copa atrás:", JSON.stringify({ ...spot, alpha }));
  await cdp.shot("forest_v4_copa.png");
  const at = await cdp.eval(`(() => { const g = window.__gs003; const v = g.view; const p = v.motionPos("p1");
    const s = parseFloat(document.querySelector("#world").style.width) / document.querySelector("#world").width;
    return { x: (p.x - v.camera.x) * s, y: (p.y - v.camera.y) * s }; })()`);
  const cw = 480;
  const ch = 300;
  const r = await cdp.send("Page.captureScreenshot", { format: "png", clip: { x: Math.max(0, Math.min(W - cw, at.x - cw / 2)), y: Math.max(0, Math.min(H - ch, at.y - ch * 0.6)), width: cw, height: ch, scale: 2 } });
  writeFileSync(join(OUT, "forest_v4_copa_zoom.png"), Buffer.from(r.data, "base64"));
  console.log("ok forest_v4_copa_zoom.png");
}

/**
 * Golpes (sistema de 4 slots + VFX): golpe da parceira em voo/impacto com a barra de recarga, aviso de golpe
 * aprendido (XP da parceira posta a 1 ponto do Nv.13 pela própria sim: a próxima vitória sobe o nível e o learnset
 * dispara o move_learned) e o modal Equipe & Box na aba Golpes (slots, aprendidos, prioridade do AUTO, Trocar).
 */
async function golpes(cdp) {
  await cdp.waitFor(
    `(() => { const g = window.__gs003; const now = performance.now();
      return g.presenter.casts.some((c) => c.attackerId === g.presenter.localPartnerId && c.archetype !== "tackle_impact" && now >= c.hitAt && now < c.hitAt + 70); })()`,
    40000,
    "um golpe da parceira",
  );
  await cdp.shot("moves_hud_combate.png");
  await cdp.eval(`(() => { const g = window.__gs003; const p = g.sim.state.entities.find((e) => e.id === g.presenter.localPartnerId);
    const b = g.sim.content.balance; let need = -p.xp; for (let l = p.level; l < 13; l++) need += Math.round(b.xpCurve.base * Math.pow(l, b.xpCurve.exponent));
    p.xp += Math.max(0, need - 1); return need; })()`);
  await cdp.waitFor(`!!document.querySelector(".hud-learn.show")`, 60000, "o aviso de golpe aprendido");
  await sleep(250);
  await cdp.shot("moves_aprendeu.png");
  // AUTO desligado e espera a parceira sair do combate (troca só fora de combate, §2.4)
  await cdp.eval(`(() => { const b = document.querySelector('[data-act="auto"]'); if (b.getAttribute("aria-pressed") === "true") b.click(); })()`);
  await cdp.waitFor(`(() => { const g = window.__gs003; const p = g.sim.state.entities.find((e) => e.id === g.presenter.localPartnerId); return !p.encounterId && !p.targetId && p.state !== "ATTACK" && p.state !== "HURT"; })()`, 20000, "a parceira sair do combate");
  await sleep(600);
  await cdp.eval(`document.querySelector('[data-short="team"]').click()`);
  await sleep(300);
  await cdp.eval(`document.querySelector('[data-testid="tab-moves"]').click()`);
  await sleep(400);
  await cdp.shot("moves_modal.png");
  await cdp.eval(`(() => { const b = document.querySelector("[data-swap]"); if (b) b.click(); return !!b; })()`);
  await sleep(250);
  await cdp.shot("moves_modal_trocar.png");
  const state = await cdp.eval(`(() => { const g = window.__gs003; const p = g.sim.state.entities.find((e) => e.id === g.presenter.localPartnerId);
    return { nome: p.name, nivel: p.level, mp: p.mp + "/" + p.maxMp, slots: p.moves, aprendidos: p.learned }; })()`);
  console.log("golpes:", JSON.stringify(state));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
