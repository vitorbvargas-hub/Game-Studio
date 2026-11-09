// Capturas AO VIVO da prova visual (docs/screens/proof_live_*.png): o jogo real rodando no Chromium headless,
// com o HUD em DOM, os nomes e o modal. Sobe o Vite em modo dev, abre a página via Chrome DevTools Protocol
// (WebSocket nativo do Node), espera os momentos certos (lendo window.__gs003) e fotografa.
//
// Uso: npm run shots:live
//   CHROME=/caminho/chrome-headless-shell   (padrão: ~/.cache/ms-playwright/chromium_headless_shell-*/…)
//   CHROME_LIBS=/dir/com/libnss3…           (opcional: LD_LIBRARY_PATH extra, se o host não tiver as libs)
//   SEED=7 W=1600 H=900 · QUERY="map=meadow" · ONLY=geral|golpes|forest|daynight|v41|creator|offline|maps|screens|evolve|arena|factory|factory-full|factory-v3|factory-v4|factory-v5|perf|evodemo|wargreymon
//   (perf: medição de frame-time no mapa inteiro, ver perf() — PERF_MAP, PERF_FRAMES, PERF_WARMUP) (creator inclui a escolha do inicial; STARTER=CREATURE-NNNN) · TIME=day|night · OUT=/outro/dir

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
        if (msg.params.type === "error" || msg.params.type === "warning" || process.env.DEBUG_CONSOLE) console.log(`[página:${msg.params.type}]`, text.slice(0, 300));
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
    if (process.env.ONLY === "v41") return await forestV41(cdp);
    if (process.env.ONLY === "offline") return await offline(cdp);
    if (process.env.ONLY === "maps") return await maps(cdp);
    if (process.env.ONLY === "factory") return await factory(cdp);
    if (process.env.ONLY === "factory-full") return await factoryFull(cdp);
    if (process.env.ONLY === "factory-v3") return await factoryV3(cdp);
    if (process.env.ONLY === "factory-v4") return await factoryV4(cdp);
    if (process.env.ONLY === "factory-v5") return await factoryV5(cdp);
    if (process.env.ONLY === "perf") return await perf(cdp);
    if (process.env.ONLY === "screens") return await screens(cdp);
    if (process.env.ONLY === "evolve") return await evolveChoice(cdp);
    if (process.env.ONLY === "arena") return await arena(cdp);
    if (process.env.ONLY === "evodemo") return await evoDemo(cdp);
    if (process.env.ONLY === "wargreymon") return await warGreymon(cdp);
    // criador=0: as capturas do mundo pulam o criador de Tamer (usa o visual padrão)
    // TIME fixa a hora das capturas padrão (proof_live_*, moves_*): dia por padrão, comparável às capturas antigas;
    // TIME=night mostra a noite nas entidades. Sem isto o relógio do jogo começaria na hora local real.
    await cdp.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/?seed=${SEED}&auto=1&criador=0&time=${process.env.TIME ?? "day"}${QUERY}` });
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
    // fecha pelo × do modal (o Esc sintético no document não chegava ao atalho do jogo e o modal ficava aberto)
    await cdp.eval(`document.querySelector('button.x[data-act="close"]')?.click()`);
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
  // Criador v3: um preset da grade, uma cor de cabelo e o nome
  await cdp.eval(`(() => { const c = (sel) => document.querySelector(sel).click();
    c('[data-preset="${process.env.PRESET ?? "TAMER-0013"}"]'); c('[data-hair="${process.env.HAIR ?? "verde"}"]');
    const i = document.querySelector('[data-testid="cr-name"]'); i.value = "Nina"; i.dispatchEvent(new Event("input")); })()`);
  await sleep(600);
  await cdp.shot("creator_v3.png");
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
  // Jogo novo: depois do criador vem a escolha do Digimon inicial (5 bebês).
  await cdp.waitFor(`!!document.querySelector(".starter [data-starter]")`, 30000, "a escolha do inicial abrir");
  await sleep(900);
  await cdp.shot("starter_tela.png");
  await cdp.eval(`document.querySelector('[data-starter="${process.env.STARTER ?? "CREATURE-0014"}"]').click()`);
  await sleep(700);
  await cdp.shot("starter_escolha.png");
  await cdp.eval(`document.querySelector('.starter [data-act="confirm"]').click()`);
  await cdp.waitFor("!!window.__gs003", 30000, "o jogo iniciar");
  await sleep(3000);
  console.log("parceira:", await cdp.eval(`(() => { const g = window.__gs003; const p = g.sim.state.entities.find((e) => e.id === "p1:partner"); return p.name + " Nv." + p.level; })()`));
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

/**
 * Escolha de evolução, na Vila (zona segura: sem selvagens, o modal abre fora de combate). A parceira é trocada por
 * `__gs003.setPartner` (espécie + nível, stats recalculados): Dorumon Nv.16 (Dorugamon e Drimogemon elegíveis → o
 * modal abre sozinho), Agumon Nv.16 (GeoGreymon com Defesa pendente) e a aba Golpes / Evolução com a preferência.
 */
/**
 * ?demo=evo na Digimon Forest 01 (jogo novo, sem criador: parceira da cena, Guilmon): vitória com "+XP", level up,
 * quadros da digivolução (carga, silhuetas, clarão, revelação, faixa) e a forma nova no mapa, mais um GIF curto
 * recortado em volta da parceira. Saída: GS-003/evidence/evolution/ (OUT= troca).
 */
async function evoDemo(cdp) {
  const out = process.env.OUT ?? join(ROOT, "../../evidence/evolution");
  mkdirSync(out, { recursive: true });
  const shot = async (name, clip) => {
    const r = await cdp.send("Page.captureScreenshot", clip ? { format: "png", clip } : { format: "png" });
    writeFileSync(join(out, name), Buffer.from(r.data, "base64"));
    console.log("ok", name);
    return Buffer.from(r.data, "base64");
  };
  await cdp.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/?seed=${SEED}&map=digimon-forest-01&demo=evo&auto=1&criador=0&novo=1&time=day` });
  await cdp.waitFor("!!window.__gs003", 60000, "o jogo iniciar");
  await sleep(1500);
  console.log("demo:", JSON.stringify(await cdp.eval(`(() => { const g = window.__gs003; const p = g.sim.state.entities.find((e) => e.id === "p1:partner"); const pl = g.sim.state.players.find((x) => x.id === "p1"); return { sp: p.name, lv: p.level, xp: p.xp, mult: pl.xpMult, autoEvolve: pl.autoEvolve, badge: !!document.querySelector(".demo-badge") }; })()`)));
  await shot("evo_00_inicio_demo.png");
  // Recorte 2× em volta da parceira (px de tela), para ler o efeito.
  const zoom = async () => {
    const at = await cdp.eval(`(() => { const g = window.__gs003; const v = g.view; const p = v.motionPos(g.presenter.localPartnerId);
      const s = parseFloat(document.querySelector("#world").style.width) / document.querySelector("#world").width;
      return { x: (p.x - v.camera.x) * s, y: (p.y - v.camera.y) * s }; })()`);
    const cw = 480;
    const ch = 300;
    return { x: Math.max(0, Math.min(W - cw, at.x - cw / 2)), y: Math.max(0, Math.min(H - ch, at.y - ch * 0.62)), width: cw, height: ch, scale: 1 };
  };
  const floaterAge = (re) => `(() => { const g = window.__gs003; const now = performance.now(); const f = g.presenter.floaters.find((f) => !f.thirdParty && ${re}.test(f.text)); return f ? now - f.start : -1; })()`;
  // 1) vitória: "+N XP" subindo da parceira e a barra de XP do HUD enchendo
  await cdp.waitFor(`(() => { const a = ${floaterAge("/XP$/")}; return a > 150 && a < 400; })()`, 90000, "o +XP de uma vitória");
  await shot("evo_01_vitoria_xp.png");
  await shot("evo_01_vitoria_xp_zoom.png", await zoom());
  // 2) level up: "Nível X!", anel dourado e brilho no painel
  await cdp.waitFor(`(() => { const a = ${floaterAge("/^N.vel/")}; return a > 120 && a < 350; })()`, 120000, "o level up");
  await shot("evo_02_level_up.png");
  await shot("evo_02_level_up_zoom.png", await zoom());
  // 3) digivolução: quadros em instantes fixos da linha do tempo + GIF recortado
  await cdp.waitFor(`!!window.__gs003.presenter.entities.get("p1:partner")?.evo`, 120000, "a evolução");
  const clip = await zoom();
  const evoT = `(() => { const v = window.__gs003.presenter.entities.get("p1:partner"); return v?.evo ? performance.now() - v.evo.start : 99999; })()`;
  const marks = [
    [250, "evo_03_carga.png"],
    [800, "evo_04_silhuetas_lento.png"],
    [1550, "evo_05_silhuetas_rapido.png"],
    [1940, "evo_06_clarao.png"],
    [2350, "evo_07_revelacao.png"],
    // tela inteira: o aviso "X digivolveu para Y!" do HUD sai no clarão
    [2650, "evo_08_faixa_nome.png", true],
  ];
  const gifFrames = [];
  let last = 0;
  const t0 = Date.now();
  for (let mi = 0; Date.now() - t0 < 12000; ) {
    const t = await cdp.eval(evoT);
    if (t === 99999 || t > 5600) break;
    if (t < -400) {
      await sleep(20);
      continue;
    }
    if (mi < marks.length && t >= marks[mi][0]) {
      await shot(marks[mi][1], marks[mi][2] ? undefined : clip);
      mi++;
      continue;
    }
    const r = await cdp.send("Page.captureScreenshot", { format: "png", clip });
    gifFrames.push({ t, png: Buffer.from(r.data, "base64") });
    last = t;
  }
  console.log(`gif: ${gifFrames.length} quadros até t=${Math.round(last)} ms`);
  await sleep(1500);
  await shot("evo_09_forma_nova_mapa.png");
  await shot("evo_09_forma_nova_mapa_zoom.png", await zoom());
  console.log("depois:", JSON.stringify(await cdp.eval(`(() => { const p = window.__gs003.sim.state.entities.find((e) => e.id === "p1:partner"); return { sp: p.name, lv: p.level }; })()`)));
  // GIF: quadros reais na cadência capturada (meia escala, nearest), atraso = intervalo medido
  const { loadImage, createCanvas } = await import("@napi-rs/canvas");
  const { encodeGif } = await import("./gif.mjs");
  const frames = [];
  for (let i = 0; i < gifFrames.length; i++) {
    const img = await loadImage(gifFrames[i].png);
    const w = Math.round(img.width / 2);
    const h = Math.round(img.height / 2);
    const c = createCanvas(w, h);
    const g = c.getContext("2d");
    g.imageSmoothingEnabled = false;
    g.drawImage(img, 0, 0, w, h);
    const next = gifFrames[i + 1]?.t ?? gifFrames[i].t + 120;
    frames.push({ data: g.getImageData(0, 0, w, h).data, width: w, height: h, delayMs: i === gifFrames.length - 1 ? 1200 : Math.max(20, next - gifFrames[i].t) });
  }
  if (frames.length) {
    writeFileSync(join(out, "evo_digivolucao.gif"), encodeGif(frames));
    console.log("ok evo_digivolucao.gif", frames.length, "quadros");
  }
  await cdp.eval(`localStorage.clear()`);
}

/**
 * ?partner=wargreymon&look=v8 (save/partner.ts): o WarGreymon importado de DW DS como parceira ativa. Fotografa
 * andando nas 4 direções (tecla WASD do Tamer, a parceira segue), o golpe forte (Gaia Force) e o dano em combate
 * contra selvagens da floresta, e grava GIFs curtos (andando e combate) em evidence/wargreymon/.
 */
async function warGreymon(cdp) {
  const out = process.env.OUT ?? join(ROOT, "../../evidence/wargreymon");
  mkdirSync(out, { recursive: true });
  const shot = async (name, clip) => {
    const r = await cdp.send("Page.captureScreenshot", clip ? { format: "png", clip } : { format: "png" });
    writeFileSync(join(out, name), Buffer.from(r.data, "base64"));
    console.log("ok", name);
  };
  await cdp.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/?seed=${SEED}&map=digimon-forest-01&look=v8&partner=wargreymon&criador=0&novo=1&time=${process.env.TIME ?? "day"}` });
  await cdp.waitFor("!!window.__gs003", 60000, "o jogo iniciar");
  await sleep(1500);
  const P = `window.__gs003.sim.state.entities.find((e) => e.id === "p1:partner")`;
  console.log("parceira:", JSON.stringify(await cdp.eval(`(() => { const p = ${P}; return { sp: p.speciesId, nome: p.name, nv: p.level, hp: p.maxHp, atk: p.stats.atk, golpes: p.moves, badge: document.querySelector('[data-testid="partner-badge"]')?.textContent }; })()`)));
  const zoomAt = async (cw = 440, ch = 360) => {
    const at = await cdp.eval(`(() => { const g = window.__gs003; const v = g.view; const p = v.motionPos(g.presenter.localPartnerId);
      const s = parseFloat(document.querySelector("#world").style.width) / document.querySelector("#world").width;
      return { x: (p.x - v.camera.x) * s, y: (p.y - v.camera.y) * s }; })()`);
    return { x: Math.max(0, Math.min(W - cw, at.x - cw / 2)), y: Math.max(0, Math.min(H - ch, at.y - ch * 0.78)), width: cw, height: ch, scale: 1 };
  };
  const key = (k, type) => cdp.send("Input.dispatchKeyEvent", { type, key: k, text: type === "keyDown" ? k : undefined, code: /\d/.test(k) ? `Digit${k}` : `Key${k.toUpperCase()}` });
  const look = () => cdp.eval(`(() => { const g = window.__gs003; const id = g.presenter.localPartnerId; const v = g.presenter.entities.get(id); const cv = g.view.creatures?.[v?.speciesId]; const f = cv ? g.view.frameFor(cv, v, g.presenter, performance.now()) : null; return f ? f.key + (f.mirror ? " (espelho)" : "") + " " + f.anim : "?"; })()`);
  // sem AUTO para andar sem puxar briga
  await cdp.eval(`(() => { const g = window.__gs003; const p = g.sim.state.players.find((x) => x.id === "p1"); p.auto = false; })()`);
  await shot("wg_00_inicio.png");
  // combate: AUTO ligado, prioridade com o Gaia Force primeiro
  await cdp.eval(`(() => { const g = window.__gs003; const p = g.sim.state.players.find((x) => x.id === "p1"); p.auto = true; })()`);
  const atkAge = `(() => { const g = window.__gs003; const v = g.presenter.entities.get(g.presenter.localPartnerId); return v?.attack ? performance.now() - v.attack.start : -1; })()`;
  const fightFrames = [];
  const tc0 = Date.now();
  const taken = new Set();
  const log = [];
  // vai até o selvagem mais perto: clique nele (engage) se está na tela, senão clique na borda na direção dele
  const approach = () => cdp.eval(`(() => { const g = window.__gs003; const v = g.view; const cv = document.querySelector("#world");
    const s = parseFloat(cv.style.width) / cv.width; const me = v.motionPos(g.presenter.localPartnerId);
    const ws = g.sim.state.entities.filter((e) => e.kind === "wild" && e.hp > 0);
    let best = null, bd = 1e9;
    for (const e of ws) { const p = v.motionPos(e.id) ?? { x: e.x * 2, y: e.y * 2 }; const d = Math.hypot(p.x - me.x, p.y - me.y); if (d < bd) { bd = d; best = { id: e.id, p }; } }
    if (!best) return null;
    let x = (best.p.x - v.camera.x) * s, y = (best.p.y - v.camera.y) * s - 8;
    const r = cv.getBoundingClientRect(); const pad = 60;
    const inside = x > pad && y > pad && x < r.width - pad && y < r.height - pad;
    if (!inside) { const cx = (me.x - v.camera.x) * s, cy = (me.y - v.camera.y) * s; const k = Math.min(1, 220 / Math.hypot(x - cx, y - cy)); x = cx + (x - cx) * k; y = cy + (y - cy) * k; }
    return { x: Math.round(x + r.left), y: Math.round(y + r.top), inside, d: Math.round(bd) }; })()`);
  const click = async (x, y) => {
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
    await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
  };
  let lastApproach = 0;
  while (Date.now() - tc0 < 150000 && taken.size < 4) {
    if (Date.now() - lastApproach > 1200 && !(await cdp.eval(`!!${P}.encounterId`))) {
      const a = await approach();
      if (a) await click(a.x, a.y);
      if (process.env.DEBUG_WG) console.log("aproxima:", JSON.stringify(a), await cdp.eval(`window.__gs003.mapId`));
      lastApproach = Date.now();
    }
    const st = await cdp.eval(`(() => { const g = window.__gs003; const v = g.presenter.entities.get(g.presenter.localPartnerId); const now = performance.now(); const p = ${P};
      return { enc: !!p.encounterId, atk: v?.attack ? now - v.attack.start : -1, sp: v?.attack?.special, flash: (v?.flashUntil ?? 0) > now, gaia: p.moveCd?.gaia_force ?? 0, cds: JSON.stringify(p.moveCd), hurt: v?.hurt ? now - v.hurt.start : -1, hp: p.hp, max: p.maxHp }; })()`);
    if (st.enc) {
      const clip = await zoomAt(560, 420);
      const r = await cdp.send("Page.captureScreenshot", { format: "png", clip });
      if (fightFrames.length < 160) fightFrames.push({ t: Date.now(), png: Buffer.from(r.data, "base64") });
      const k = st.atk >= 0 || st.hurt >= 0 ? await look() : "";
      // tecla 1 = slot do Gaia Force (o mesmo atalho do jogador); a foto sai logo depois que ele é usado
      if (st.gaia === 0 && !taken.has("golpe")) await key("1", "keyDown").then(() => key("1", "keyUp"));
      const noFlash = `(() => { const g = window.__gs003; const v = g.presenter.entities.get(g.presenter.localPartnerId); const now = performance.now(); return now >= (v?.flashUntil ?? 0) && !(v?.lvUpAt !== undefined && now - v.lvUpAt < 900); })()`;
      if (/_attack_/.test(k) && st.sp && st.gaia >= 50 && st.atk > 150 && !taken.has("golpe") && (await cdp.eval(noFlash))) {
        const r2 = await cdp.send("Page.captureScreenshot", { format: "png", clip });
        if (!(await cdp.eval(noFlash)) || !/_attack_/.test(await look())) continue;
        writeFileSync(join(out, "wg_03_golpe_forte.png"), Buffer.from(r2.data, "base64"));
        await shot("wg_03_golpe_forte_tela.png");
        console.log("ok wg_03_golpe_forte.png", k, "recargas (ticks restantes):", st.cds);
        taken.add("golpe");
      }
      if (/_hurt_/.test(k) && !taken.has("dano")) {
        const r2 = await cdp.send("Page.captureScreenshot", { format: "png", clip });
        writeFileSync(join(out, "wg_04_levando_dano.png"), Buffer.from(r2.data, "base64"));
        console.log("ok wg_04_levando_dano.png", k, `PV ${st.hp}/${st.max}`);
        taken.add("dano");
      }
      if (!taken.has("combate") && fightFrames.length > 20) {
        await shot("wg_05_combate_tela.png");
        taken.add("combate");
      }
    } else if (fightFrames.length > 100 && taken.has("golpe") && taken.has("dano")) taken.add("fim");
    await sleep(30);
  }
  // golpes que a parceira usou e vitórias (do log da sim não guardamos eventos: lê do HUD)
  await cdp.eval(`(() => { const g = window.__gs003; const p = g.sim.state.players.find((x) => x.id === "p1"); p.auto = false; })()`);
  await sleep(1500);
  const walkFrames = [];
  // anda clicando no chão (move_to com pathfinding) a ~260 px em cada direção; guarda a 1ª foto em que a parceira
  // está de fato no quadro de walk daquela direção (a parceira segue o Tamer com atraso)
  const clickAt = async (x, y) => {
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
    await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
    await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
  };
  const partnerScreen = () => cdp.eval(`(() => { const g = window.__gs003; const v = g.view; const cv = document.querySelector("#world"); const r = cv.getBoundingClientRect();
      const s = parseFloat(cv.style.width) / cv.width; const p = v.motionPos(g.presenter.localPartnerId); return { x: (p.x - v.camera.x) * s + r.left, y: (p.y - v.camera.y) * s + r.top, w: r.width, h: r.height }; })()`);
  const want = [
    ["norte", "w", /walk_N_\d+\.png walk/],
    ["oeste", "a", /walk_W_\d+\.png walk/],
    ["leste", "d", /walk_W_\d+\.png \(espelho\) walk/],
    ["sul", "s", /walk_S_\d+\.png walk/],
  ];
  const got = new Set();
  const map0 = await cdp.eval(`window.__gs003.mapId`);
  for (let round = 0; round < 3 && got.size < want.length; round++)
    for (const [nome, k0, re] of want) {
      if (got.has(nome)) continue;
      await key(k0, "keyDown");
      const t1 = Date.now();
      while (Date.now() - t1 < 2600) {
        const clip = await zoomAt();
        const r = await cdp.send("Page.captureScreenshot", { format: "png", clip });
        const k = await look();
        walkFrames.push({ t: Date.now(), png: Buffer.from(r.data, "base64") });
        if (process.env.DEBUG_WG && walkFrames.length % 15 === 0) console.log("walk:", nome, k);
        if (re.test(k) && Date.now() - t1 > 400) {
          writeFileSync(join(out, `wg_01_andando_${nome}.png`), Buffer.from(r.data, "base64"));
          console.log("ok", `wg_01_andando_${nome}.png`, k);
          got.add(nome);
          if (Date.now() - t1 > 1200) break;
        }
        await sleep(30);
      }
      await key(k0, "keyUp");
      await sleep(250);
      if ((await cdp.eval(`window.__gs003.mapId`)) !== map0) console.warn("trocou de mapa andando para", nome);
    }
  if (got.size < want.length) console.warn("direções sem foto:", want.map((w) => w[0]).filter((n) => !got.has(n)));
  await shot("wg_02_andando_tela.png");
  // sem AUTO de novo para os GIFs não misturarem combate

  console.log("mapa depois de andar:", await cdp.eval(`window.__gs003.mapId`));
  console.log("combate:", [...taken].join(","), "· quadros", fightFrames.length);
  console.log("log HUD:", await cdp.eval(`(document.querySelector("#hud")?.innerText ?? "").split("\\n").filter((l) => /Gaia|Dramon|Tornado|Shield|venceu|derrot|XP|dano/i.test(l)).slice(-10).join(" | ")`));
  const { loadImage, createCanvas } = await import("@napi-rs/canvas");
  const { encodeGif } = await import("./gif.mjs");
  const gif = async (list, name, scale = 0.75) => {
    const frames = [];
    for (let i = 0; i < list.length; i++) {
      const img = await loadImage(list[i].png);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const c = createCanvas(w, h);
      const g = c.getContext("2d");
      g.imageSmoothingEnabled = false;
      g.drawImage(img, 0, 0, w, h);
      const next = list[i + 1]?.t ?? list[i].t + 100;
      frames.push({ data: g.getImageData(0, 0, w, h).data, width: w, height: h, delayMs: i === list.length - 1 ? 800 : Math.max(20, Math.min(200, next - list[i].t)) });
    }
    if (frames.length) {
      writeFileSync(join(out, name), encodeGif(frames));
      console.log("ok", name, frames.length, "quadros");
    }
  };
  await gif(walkFrames.filter((_, i) => i % 2 === 0), "wg_andando.gif", 0.6);
  await gif(fightFrames, "wg_combate.gif", 0.6);
  await cdp.eval(`localStorage.clear()`);
}

async function evolveChoice(cdp) {
  await cdp.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/?seed=${SEED}&time=day&map=vila&novo=1&criador=0` });
  await cdp.waitFor("!!window.__gs003", 60000, "o jogo iniciar");
  await sleep(1500);
  const open = async (speciesId, level) => {
    await cdp.eval(`(() => { const g = window.__gs003; for (const p of Object.values(g.panels)) p.close(); g.hud.closeTeam(); g.setPartner("${speciesId}", ${level}); })()`);
    await cdp.waitFor(`!!document.querySelector('[data-panel="evolve"].open [data-evo-path="${speciesId === "CREATURE-0101" ? "SP-DRIMOGEMON" : "SP-GEOGREYMON"}"]')`, 20000, "a escolha de evolução abrir");
    await sleep(800);
  };
  await open("CREATURE-0101", 16);
  await cdp.shot("evolucao_escolha.png");
  await open("CREATURE-0006", 16);
  await cdp.shot("evolucao_escolha_requisito.png");
  // aba Golpes / Evolução: "Agora não", abre Equipe & Box → Golpes / Evolução e marca a preferência
  await cdp.eval(`document.querySelector('[data-evo-later]').click()`);
  await sleep(400);
  await cdp.eval(`(() => { window.__gs003.hud.openTeam(); document.querySelector('[data-testid="tab-moves"]').click(); })()`);
  await sleep(300);
  await cdp.eval(`(() => { const s = document.querySelector('select[data-evo-pref="CREATURE-0006"]'); s.value = "SP-GEOGREYMON"; s.dispatchEvent(new Event("change", { bubbles: true })); })()`);
  await sleep(500);
  await cdp.eval(`document.querySelector('[data-testid="evo-sec"]').scrollIntoView({ block: "center" })`);
  await sleep(300);
  await cdp.shot("evolucao_preferencia.png");
  console.log("preferências:", JSON.stringify(await cdp.eval(`window.__gs003.sim.state.players.find((p) => p.id === "p1").evoPrefs`)));
  // confirma pelo modal: Dorumon → Drimogemon (ramo sem arte: marcador "?" no mapa)
  await open("CREATURE-0101", 16);
  await cdp.eval(`document.querySelector('[data-evolve-to="SP-DRIMOGEMON"]').click()`);
  await sleep(1500);
  console.log("parceira depois da escolha:", await cdp.eval(`(() => { const p = window.__gs003.sim.state.entities.find((e) => e.id === "p1:partner"); return p.name + " Nv." + p.level; })()`));
  await cdp.shot("evolucao_depois.png");
  // o jogo novo (?novo=1) salvou por cima: limpa para não deixar save de captura no perfil temporário
  await cdp.eval(`localStorage.removeItem("gs003.world.save")`);
}

/**
 * Telas secundárias (atalhos V, I, Q, O): joga ~40 s no AUTO para ter vitórias e varreduras reais, abre o Digivice
 * (e um detalhe), o Inventário, as Missões (coleta uma, se houver) e as Configurações (com a confirmação do reset).
 */
async function screens(cdp) {
  await cdp.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/?seed=${SEED}&auto=1&criador=0&novo=1&time=day${QUERY}` });
  await cdp.waitFor("!!window.__gs003", 30000, "o jogo iniciar");
  await sleep(Number(process.env.PLAY_MS ?? 40000));
  const key = async (k) => {
    await cdp.eval(`window.dispatchEvent(new KeyboardEvent("keydown", { key: "${k}" }))`);
    await cdp.eval(`window.dispatchEvent(new KeyboardEvent("keyup", { key: "${k}" }))`);
    await sleep(500);
  };
  await key("v");
  await cdp.shot("tela_digivice.png");
  await cdp.eval(`(() => { const c = [...document.querySelectorAll(".dx-card")].find((b) => !b.classList.contains("unseen") && !b.classList.contains("sel")); c && c.click(); })()`);
  await sleep(300);
  await cdp.shot("tela_digivice_detalhe.png");
  console.log("digivice:", await cdp.eval(`[...document.querySelectorAll(".dx-stat b")].map((b) => b.textContent).join(" · ")`));
  await key("i");
  await cdp.shot("tela_inventario.png");
  await key("q");
  await cdp.shot("tela_missoes.png");
  console.log("missões:", await cdp.eval(`[...document.querySelectorAll(".qs-item")].map((q) => q.dataset.quest + "=" + q.querySelector("[data-testid=qs-progress]").textContent).join(" ")`));
  const claimed = await cdp.eval(`(() => { const b = document.querySelector("[data-claim]"); if (!b) return ""; b.click(); return b.dataset.claim; })()`);
  await sleep(1300);
  if (claimed) await cdp.shot("tela_missoes_coletada.png");
  console.log("coletada:", claimed || "(nenhuma completa)");
  await key("o");
  await cdp.shot("tela_configuracoes.png");
  await cdp.eval(`document.querySelector('[data-time="night"]').click()`);
  await sleep(600);
  await cdp.eval(`document.querySelector('[data-reset="ask"]').click()`);
  await sleep(300);
  await cdp.shot("tela_configuracoes_reset.png");
  console.log("noite forçada:", await cdp.eval(`window.__gs003.clock.opts.forced`));
  await cdp.eval(`document.querySelector('[data-reset="confirm"]').click()`);
  await sleep(1500);
  await cdp.waitFor("!!window.__gs003", 30000, "o jogo reiniciar");
  await sleep(1500);
  console.log("depois do reset:", await cdp.eval(`(() => { const d = JSON.parse(localStorage.getItem("gs003.world.save")).data; return JSON.stringify({ bits: d.bits, seen: d.seen.length, claimed: d.quests.claimed, time: d.settings.time }); })()`));
}

/**
 * Troca de mapa: Mapa-múndi na floresta → viaja para a Praia dos Postes e para a Vila dos Bebês (fade) → sai da vila
 * pela borda norte andando (W) e chega na floresta pela saída sul. Recortes ampliados do HUD (região + minimapa).
 */
/**
 * Map Factory (piloto digimon-forest-01): o jogo real no mapa gerado do brief. Teleporta o Tamer (e a parceira) para
 * cada ponto do brief e fotografa: entrada com o NPC e a placa, Clareira Central com o baú e a cura, o riacho com a
 * ponte, o Campo de Pedras e a arena do chefe; depois a ida e volta pela Vila andando nos portais. Uso:
 *   OUT=../../evidence/map-factory ONLY=factory npm run shots:live
 */
async function factory(cdp) {
  const ID = "digimon-forest-01";
  const open = async (time) => {
    await cdp.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/?seed=${SEED}&auto=1&criador=0&novo=1&time=${time}&map=${ID}${QUERY}` });
    await cdp.waitFor(`!!window.__gs003 && window.__gs003.mapId === "${ID}"`, 40000, "o jogo iniciar no mapa da Map Factory");
    await sleep(2500);
  };
  /** Teleporta o Tamer local e a parceira para o tile (tx, ty); a câmera segue sozinha. */
  const tp = (tx, ty) =>
    cdp.eval(`(() => { const g = window.__gs003, s = g.sim, SUB = 16; const p = s.state.players.find((q) => q.id === "p1");
      const t = s.state.entities.find((e) => e.id === p.tamerId), pa = s.state.entities.find((e) => e.id === p.partnerId);
      t.x = ${tx} * SUB + 8; t.y = ${ty} * SUB + 8; t.dest = undefined; t.trail = [{ x: t.x - 20, y: t.y }, { x: t.x, y: t.y }];
      if (pa) { pa.x = t.x - 20; pa.y = t.y; pa.targetId = undefined; }
      return [t.x, t.y]; })()`);
  const log = async (label) => console.log(label, JSON.stringify(await cdp.eval(`(() => { const g = window.__gs003; return { mapa: g.mapId, interacoes: g.interactions.map((i) => i.kind + ":" + i.id + " → " + i.text), bits: g.sim.state.players[0].bits, encontros: g.sim.state.encounters.length, toast: document.querySelector(".hud-toast")?.textContent }; })()`)));
  await open("day");
  await cdp.shot("factory_01_entrada_inicio.png");
  // NPC guia (fala ao chegar perto) e depois a placa da entrada
  await tp(22, 29);
  await sleep(2200);
  await cdp.shot("factory_02a_entrada_npc_guia.png");
  await tp(25, 32);
  await sleep(1500);
  await cdp.shot("factory_02b_entrada_placa.png");
  await log("entrada:");
  // Clareira Central: baú (31,18) e fonte de cura (33,21)
  await tp(30, 19);
  await sleep(700);
  await cdp.shot("factory_03_clareira_bau.png");
  // cura fora de combate: espera a parceira sair do encontro e chega na fonte
  await cdp.waitFor(`(() => { const s = window.__gs003.sim; const p = s.state.players[0]; return !s.state.entities.find((e) => e.id === p.partnerId)?.encounterId; })()`, 20000, "a parceira sair do combate");
  await cdp.eval(`(() => { const s = window.__gs003.sim; const p = s.state.players[0]; const e = s.state.entities.find((x) => x.id === p.partnerId); e.hp = Math.max(1, Math.round(e.maxHp * 0.3)); })()`);
  await tp(33, 22);
  await sleep(1500);
  await cdp.shot("factory_04_clareira_cura.png");
  await log("clareira:");
  // encontro na clareira (AUTO ligado): espera a parceira engajar um selvagem
  await cdp.waitFor("window.__gs003.sim.state.encounters.length > 0", 20000, "um encontro na clareira");
  await sleep(900);
  await cdp.shot("factory_05_clareira_encontro.png");
  await log("encontro:");
  // riacho com a ponte (26..29, 9): Tamer na margem leste e depois em cima da ponte
  await tp(31, 11);
  await sleep(2500);
  await cdp.shot("factory_06_riacho_ponte.png");
  await tp(27, 9);
  await sleep(1200);
  await cdp.shot("factory_07_riacho_sobre_a_ponte.png");
  // Clareira Oculta (placa secreta) e Campo de Pedras
  await tp(9, 6);
  await sleep(2500);
  await cdp.shot("factory_08_clareira_oculta.png");
  await tp(44, 31);
  await sleep(2500);
  await cdp.shot("factory_09_campo_de_pedras.png");
  // arena do Kuwagamon (aviso de chefe ainda não implementado)
  await tp(50, 20);
  await sleep(2500);
  await cdp.shot("factory_10_arena_chefe.png");
  await log("arena:");
  // noite: riacho e ponte (forest-v6 não tem noite: a água usa o PNG do dia sob o grade noturno)
  await open("night");
  await tp(30, 10);
  await sleep(1500);
  await cdp.shot("factory_11_riacho_noite.png");
  // ida e volta: Vila → (saída sul, andando) → Floresta Digimon → (saída sul, andando) → Vila
  await cdp.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/?seed=${SEED}&auto=1&criador=0&novo=1&time=day&map=vila${QUERY}` });
  await cdp.waitFor(`!!window.__gs003 && window.__gs003.mapId === "vila"`, 40000, "a vila");
  await sleep(2000);
  await tp(17, 21);
  await sleep(800);
  await cdp.shot("factory_12_vila_saida_sul.png");
  const key = (k, type) => cdp.eval(`window.dispatchEvent(new KeyboardEvent("${type}", { key: "${k}" }))`);
  await key("s", "keydown");
  await cdp.waitFor(`window.__gs003.mapId === "${ID}"`, 20000, "chegar na floresta Digimon pela saída sul da vila");
  await key("s", "keyup");
  await cdp.waitFor(`!document.querySelector(".map-fade.on")`, 5000, "o fade acabar");
  await sleep(1800);
  await cdp.shot("factory_13_chegada_da_vila.png");
  await log("chegada:");
  await key("s", "keydown");
  await cdp.waitFor(`window.__gs003.mapId === "vila"`, 20000, "voltar para a vila pela saída sul da floresta");
  await key("s", "keyup");
  await cdp.waitFor(`!document.querySelector(".map-fade.on")`, 5000, "o fade acabar");
  await sleep(1800);
  await cdp.shot("factory_14_volta_na_vila.png");
  console.log("volta:", await cdp.eval(`window.__gs003.mapId`));
}

/**
 * Map Factory R2 (brief v2 + kit forest-v7): riacho contínuo com a ponte e o vau, trilha curva, entrada secreta, arena,
 * NPC do PixelLab de perto, NPC × Tamer lado a lado (escala), baú aberto e o riacho de noite. Sufixo _v3. Uso:
 *   OUT=../../evidence/map-factory CHROME_LIBS=… ONLY=factory-v3 npm run shots:live
 * O mapa inteiro (dia/noite): W=1792 H=1280 SUFFIX=_v3 ONLY=factory-full.
 */
async function factoryV3(cdp) {
  const ID = "digimon-forest-01";
  const open = async (time, zoom = 0) => {
    await cdp.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/?seed=${SEED}&auto=1&criador=0&novo=1&time=${time}&map=${ID}${zoom ? `&zoom=${zoom}` : ""}${QUERY}` });
    await cdp.waitFor(`!!window.__gs003 && window.__gs003.mapId === "${ID}"`, 40000, "o jogo iniciar no mapa da Map Factory");
    await sleep(2500);
  };
  /** Teleporta o Tamer local (e a parceira, deslocada dx tiles) para o tile (tx, ty); AUTO desligado para ninguém sair andando. */
  const tp = (tx, ty, dx = -1.3) =>
    cdp.eval(`(() => { const g = window.__gs003, s = g.sim, SUB = 16; const p = s.state.players.find((q) => q.id === "p1"); p.auto = false;
      const t = s.state.entities.find((e) => e.id === p.tamerId), pa = s.state.entities.find((e) => e.id === p.partnerId);
      t.x = ${tx} * SUB + 8; t.y = ${ty} * SUB + 8; t.dest = undefined; t.trail = [{ x: t.x - 20, y: t.y }, { x: t.x, y: t.y }];
      if (pa) { pa.x = t.x + ${dx} * SUB; pa.y = t.y; pa.targetId = undefined; pa.dest = undefined; }
      return [t.x, t.y]; })()`);
  const shot = async (name, wait = 2200) => {
    await sleep(wait);
    await cdp.shot(name);
  };
  await open("day");
  await tp(33, 12);
  await shot("factory_v3_01_riacho_ponte_v3.png");
  await tp(28, 9);
  await shot("factory_v3_02_sobre_a_ponte_v3.png", 1500);
  await tp(21, 22);
  await shot("factory_v3_03_riacho_vau_v3.png");
  await tp(16, 22);
  await shot("factory_v3_04_no_vau_v3.png", 1500);
  await tp(10, 16);
  await shot("factory_v3_05_trilha_curva_margem_oeste_v3.png");
  await tp(15, 6);
  await shot("factory_v3_06_entrada_secreta_v3.png");
  await tp(50, 20);
  await shot("factory_v3_07_arena_v3.png");
  // baú (31,18): ao chegar perto abre e troca para o chest_open
  await tp(31, 19);
  await shot("factory_v3_08_bau_aberto_v3.png", 1800);
  console.log("baú:", JSON.stringify(await cdp.eval(`(() => { const g = window.__gs003; return { interacoes: g.interactions.map((i) => i.kind + ":" + i.id), bau: g.sim.map.props.filter((p) => p.openKey).map((p) => p.key) }; })()`)));
  // NPC do PixelLab de perto e lado a lado com o Tamer (zoom 4)
  await open("day", 4);
  await tp(43, 26, 1.4);
  await shot("factory_v3_09_npc_ranger_perto_v3.png");
  await tp(26, 22, 1.4);
  await shot("factory_v3_10_npc_comerciante_vs_tamer_v3.png");
  // escala: altura visível (px opacos) do sprite do NPC e do quadro do Tamer, para o relatório
  console.log("escala:", JSON.stringify(await cdp.eval(`(async () => { const g = window.__gs003; const out = {};
    const opaque = async (url) => { const img = new Image(); img.src = url; await img.decode(); const c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
      const x = c.getContext("2d"); x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, c.width, c.height).data; let y0 = 1e9, y1 = -1, x0 = 1e9, x1 = -1;
      for (let y = 0; y < c.height; y++) for (let xx = 0; xx < c.width; xx++) if (d[(y * c.width + xx) * 4 + 3] > 0) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); x0 = Math.min(x0, xx); x1 = Math.max(x1, xx); }
      return { canvas: [img.width, img.height], opaqueW: x1 - x0 + 1, opaqueH: y1 - y0 + 1 }; };
    for (const k of ["fp7_npc_merchant", "fp7_npc_ranger"]) out[k] = await opaque(g.view.tiles?.[k]?.url ?? "");
    return out; })()`)));
  await open("night");
  await tp(33, 12);
  await shot("factory_v3_11_riacho_noite_v3.png");
}

/**
 * Look v8 (?look=v8, profundidade do DRAKANTOS_VISUAL_STUDY.md) no digimon-forest-01, sufixo _v4: clareira com as
 * luzes (dia e noite), riacho, platô do mirante com a rampa, arena, e o lado a lado v3 × v4 no mesmo enquadramento
 * (mesma semente, mesmo teleporte, mesmo zoom; o v3 é o mapa padrão sem ?look). Uso:
 *   OUT=../../evidence/map-factory CHROME_LIBS=… ONLY=factory-v4 npm run shots:live
 * O mapa inteiro: W=1792 H=1280 SUFFIX=_v4 QUERY=look=v8 ONLY=factory-full.
 */
async function factoryV4(cdp) {
  const ID = "digimon-forest-01";
  const open = async (time, look, zoom = 0) => {
    await cdp.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/?seed=${SEED}&auto=1&criador=0&novo=1&time=${time}&map=${ID}${look ? `&look=${look}` : ""}${zoom ? `&zoom=${zoom}` : ""}` });
    await cdp.waitFor(`!!window.__gs003 && window.__gs003.mapId === "${ID}"`, 40000, "o jogo iniciar no mapa da Map Factory");
    await sleep(2500);
  };
  const tp = (tx, ty, dx = -1.3) =>
    cdp.eval(`(() => { const g = window.__gs003, s = g.sim, SUB = 16; const p = s.state.players.find((q) => q.id === "p1"); p.auto = false;
      const t = s.state.entities.find((e) => e.id === p.tamerId), pa = s.state.entities.find((e) => e.id === p.partnerId);
      t.x = ${tx} * SUB + 8; t.y = ${ty} * SUB + 8; t.dest = undefined; t.trail = [{ x: t.x - 20, y: t.y }, { x: t.x, y: t.y }];
      if (pa) { pa.x = t.x + ${dx} * SUB; pa.y = t.y; pa.targetId = undefined; pa.dest = undefined; }
      return [t.x, t.y]; })()`);
  const shot = async (name, wait = 2200) => {
    await sleep(wait);
    await cdp.shot(name);
  };
  const frames = [
    ["clareira_luzes", 30, 23],
    ["riacho", 21, 26],
    ["plato_mirante", 25, 20],
    ["arena", 49, 20],
  ];
  for (const time of ["day", "night"]) {
    await open(time, "v8");
    for (const [name, x, y] of frames) {
      await tp(x, y);
      await shot(`factory_v4_${name}_${time === "day" ? "dia" : "noite"}_v4.png`);
    }
  }
  // em cima do platô (a colisão deixou subir pela rampa?): anda do pé da rampa até o topo
  await open("day", "v8");
  await tp(26, 19, 1.2);
  const climbed = await cdp.eval(`(async () => { const g = window.__gs003, s = g.sim, SUB = 16; const p = s.state.players.find((q) => q.id === "p1");
    const t = s.state.entities.find((e) => e.id === p.tamerId); const solid = (x, y) => s.map.solid[y * s.map.width + x];
    return { rampa: solid(26, 18), face: solid(25, 18), topo: solid(26, 16), anelLeste: solid(29, 16), mirante: solid(28, 15) }; })()`);
  console.log("colisão do platô:", JSON.stringify(climbed));
  await tp(26, 16, 1.2);
  await shot("factory_v4_plato_no_topo_dia_v4.png");
  // lado a lado v3 × v4 (mesmo enquadramento): clareira de dia e de noite
  for (const time of ["day", "night"]) {
    for (const look of ["", "v8"]) {
      await open(time, look, 3);
      await tp(28, 21);
      await shot(`_sbs_${time}_${look || "v3"}.png`, 2600);
    }
  }
  const { createCanvas, loadImage } = await import("@napi-rs/canvas");
  for (const time of ["day", "night"]) {
    const a = await loadImage(join(OUT, `_sbs_${time}_v3.png`));
    const b = await loadImage(join(OUT, `_sbs_${time}_v8.png`));
    const c = createCanvas(a.width + b.width + 8, a.height);
    const g = c.getContext("2d");
    g.fillStyle = "#181425";
    g.fillRect(0, 0, c.width, c.height);
    g.drawImage(a, 0, 0);
    g.drawImage(b, a.width + 8, 0);
    g.font = "bold 28px sans-serif";
    for (const [txt, x] of [["v3 (padrão)", 16], ["v4 (?look=v8)", a.width + 24]]) {
      g.fillStyle = "#000";
      g.fillText(txt, x + 2, a.height - 22);
      g.fillStyle = "#fee761";
      g.fillText(txt, x, a.height - 24);
    }
    writeFileSync(join(OUT, `factory_v4_lado_a_lado_v3_v4_${time === "day" ? "dia" : "noite"}.png`), c.toBuffer("image/png"));
    console.log("ok", `factory_v4_lado_a_lado_v3_v4_${time === "day" ? "dia" : "noite"}.png`);
  }
  const { unlinkSync } = await import("node:fs");
  for (const time of ["day", "night"]) for (const l of ["v3", "v8"]) unlinkSync(join(OUT, `_sbs_${time}_${l}.png`));
}

/**
 * Look v8 com os NPCs do forest-v8-depth (26×33, escala do Tamer), lanternas de poste e fogueira (luz de fogo com
 * flicker, mascarada pelas copas), sufixo _v5: clareira de dia e de noite, cada NPC ao lado do Tamer (zoom 3),
 * lanterna na ponte à noite e fogueira do acampamento à noite. Uso:
 *   OUT=../../evidence/map-factory CHROME_LIBS=… ONLY=factory-v5 npm run shots:live   (SUFFIX=_v5b: recaptura)
 */
async function factoryV5(cdp) {
  const ID = "digimon-forest-01";
  const SFX = process.env.SUFFIX ?? "_v5";
  const open = async (time, zoom = 0) => {
    await cdp.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/?seed=${SEED}&auto=1&criador=0&novo=1&time=${time}&map=${ID}&look=v8${zoom ? `&zoom=${zoom}` : ""}` });
    await cdp.waitFor(`!!window.__gs003 && window.__gs003.mapId === "${ID}"`, 40000, "o jogo iniciar no mapa da Map Factory");
    await sleep(2500);
  };
  const tp = (tx, ty, dx = -1.3) =>
    cdp.eval(`(() => { const g = window.__gs003, s = g.sim, SUB = 16; const p = s.state.players.find((q) => q.id === "p1"); p.auto = false;
      const t = s.state.entities.find((e) => e.id === p.tamerId), pa = s.state.entities.find((e) => e.id === p.partnerId);
      t.x = ${tx} * SUB + 8; t.y = ${ty} * SUB + 8; t.dest = undefined; t.trail = [{ x: t.x - 20, y: t.y }, { x: t.x, y: t.y }];
      if (pa) { pa.x = t.x + ${dx} * SUB; pa.y = t.y; pa.targetId = undefined; pa.dest = undefined; }
      return [t.x, t.y]; })()`);
  const shot = async (name, wait = 2200) => {
    await sleep(wait);
    await cdp.shot(name);
  };
  const report = () =>
    cdp.eval(`(() => { const g = window.__gs003, m = g.sim.map; const ks = ["fp8_npc_ranger", "fp8_npc_merchant", "fp8_lantern_post", "fp8_campfire_small"];
      return ks.map((k) => { const ps = m.props.filter((p) => p.key === k); const img = g.view.images?.get?.(g.view.tiles?.[k]?.url);
        return k + ": " + ps.length + " × " + (img ? img.width + "×" + img.height : "sem imagem") + " sólido=" + ps.every((p) => m.solid[Math.floor((p.y - 1) / 32) * m.width + Math.floor(p.x / 32)] === 1); }); })()`);
  for (const time of ["day", "night"]) {
    await open(time);
    if (time === "day") console.log("props v8:", JSON.stringify(await report()));
    await tp(30, 23);
    await shot(`factory_v5_clareira_${time === "day" ? "dia" : "noite"}${SFX}.png`);
  }
  await open("day", 3);
  await tp(44, 24, 1.3);
  await shot(`factory_v5_npc_ranger_ao_lado_do_tamer_dia${SFX}.png`);
  await tp(26, 22, 1.3);
  await shot(`factory_v5_npc_comerciante_ao_lado_do_tamer_dia${SFX}.png`);
  await open("night");
  await tp(28, 9, 1.3);
  await shot(`factory_v5_ponte_lanterna_noite${SFX}.png`);
  await tp(43, 26, 1.3);
  await shot(`factory_v5_fogueira_acampamento_noite${SFX}.png`);
}

/** Mapa inteiro no jogo real: janela do tamanho do mapa (W=1792 H=1280), zoom 1, HUD escondido. */
async function factoryFull(cdp) {
  const ID = "digimon-forest-01";
  for (const time of ["day", "night"]) {
    await cdp.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/?seed=${SEED}&auto=1&criador=0&novo=1&time=${time}&zoom=1&map=${ID}${QUERY}` });
    await cdp.waitFor(`!!window.__gs003 && window.__gs003.mapId === "${ID}"`, 40000, "o jogo iniciar");
    await sleep(2500);
    await cdp.eval(`document.querySelector("#hud").style.visibility = "hidden"`);
    await sleep(300);
    await cdp.shot(`factory_00_mapa_inteiro_${time === "day" ? "dia" : "noite"}${process.env.SUFFIX ?? ""}.png`);
  }
}

/**
 * Medição reproduzível de frame-time (QA Digimon Forest 01, P1). Janela do tamanho do mapa (W=1792 H=1280 para
 * 56×40 tiles), zoom 1, HUD escondido, AUTO ligado (selvagens, parceira e bots se mexendo). Três medidas por hora do
 * dia (day/night), depois de PERF_WARMUP quadros de aquecimento:
 *   loop     PERF_FRAMES quadros do jogo de verdade: um script injetado antes do carregamento embrulha os callbacks de
 *            requestAnimationFrame e mede (a) o trabalho do quadro (passo da sim + render + rótulos + HUD) e (b) o
 *            intervalo entre quadros (o que o fps médio reflete; no headless o rAF segue o relógio de ~60 Hz).
 *   raster   o mesmo nº de chamadas síncronas a view.render() seguidas de getImageData(1×1) no canvas do mundo, que
 *            força a rasterização (Canvas 2D em software: --disable-gpu): custo do render + raster, sem o resto do quadro.
 * Saída: OUT/perf-<mapa>.json + .md (p50/p95/p99/média/máx em ms, fps médio e fps potencial = 1000/p50 do trabalho).
 * Uso: OUT=../../evidence/map-factory W=1792 H=1280 CHROME_LIBS=… ONLY=perf npm run shots:live
 */
async function perf(cdp) {
  const ID = process.env.PERF_MAP ?? "digimon-forest-01";
  const N = Number(process.env.PERF_FRAMES ?? 600);
  const WARM = Number(process.env.PERF_WARMUP ?? 120);
  await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
    source: `(() => { const raf = window.requestAnimationFrame.bind(window);
      const P = (window.__perf = { on: false, work: [], ts: [] });
      window.requestAnimationFrame = (cb) => raf((t) => { const t0 = performance.now(); cb(t);
        if (P.on) { P.work.push(performance.now() - t0); P.ts.push(t); } }); })();`,
  });
  const stats = (xs) => {
    const a = [...xs].sort((p, q) => p - q);
    const q = (f) => a[Math.min(a.length - 1, Math.max(0, Math.ceil(f * a.length) - 1))];
    const mean = a.reduce((s2, v) => s2 + v, 0) / a.length;
    const r3 = (v) => Math.round(v * 1000) / 1000;
    return { n: a.length, p50: r3(q(0.5)), p95: r3(q(0.95)), p99: r3(q(0.99)), mean: r3(mean), max: r3(a[a.length - 1]), min: r3(a[0]) };
  };
  const browser = await cdp.send("Browser.getVersion");
  const { cpus, totalmem, release } = await import("node:os");
  const runs = [];
  for (const time of ["day", "night"]) {
    await cdp.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/?seed=${SEED}&auto=1&criador=0&novo=1&time=${time}&zoom=1&map=${ID}${QUERY}` });
    await cdp.waitFor(`!!window.__gs003 && window.__gs003.mapId === "${ID}"`, 40000, "o jogo iniciar");
    await sleep(2500);
    await cdp.eval(`document.querySelector("#hud").style.visibility = "hidden"`);
    // aquecimento e depois N quadros do loop real
    await cdp.eval(`new Promise((res) => { let k = 0; const f = () => (++k >= ${WARM} ? res(k) : requestAnimationFrame(f)); requestAnimationFrame(f); })`);
    await cdp.eval(`(() => { window.__perf.work = []; window.__perf.ts = []; window.__perf.on = true; })()`);
    await cdp.waitFor(`window.__perf.ts.length >= ${N} + 1`, 120000, `${N} quadros`);
    const loop = await cdp.eval(`(() => { const P = window.__perf; P.on = false; return { work: P.work.slice(1, ${N} + 1), ts: P.ts.slice(0, ${N} + 1) }; })()`);
    const intervals = loop.ts.slice(1).map((t, i) => t - loop.ts[i]);
    // render + raster síncronos (o mesmo estado do presenter; now avança 16,67 ms por chamada)
    const raster = await cdp.eval(`(() => { const g = window.__gs003; const cv = document.querySelector("#world"); const ctx = cv.getContext("2d");
      const out = []; let now = performance.now();
      for (let i = 0; i < ${WARM}; i++) { g.view.render(g.presenter, 0, (now += 16.667)); ctx.getImageData(0, 0, 1, 1); }
      for (let i = 0; i < ${N}; i++) { const t0 = performance.now(); g.view.render(g.presenter, 0, (now += 16.667)); ctx.getImageData(0, 0, 1, 1); out.push(performance.now() - t0); }
      return { out, canvas: [cv.width, cv.height], css: [cv.style.width, cv.style.height] }; })()`);
    const scene = await cdp.eval(`(() => { const g = window.__gs003; const ents = [...g.presenter.entities.values()];
      return { mapa: g.mapId, tiles: [g.sim.map.width, g.sim.map.height], props: g.sim.map.props.length, entidades: ents.length,
               selvagens: ents.filter((v) => v.kind === "wild").length, jogadores: ents.filter((v) => v.kind === "remote_player").length }; })()`);
    const work = stats(loop.work);
    const iv = stats(intervals);
    const rs = stats(raster.out);
    runs.push({
      time,
      scene: { ...scene, canvasPx: raster.canvas },
      loopWorkMs: work,
      loopIntervalMs: iv,
      fpsAvg: Math.round((1000 / iv.mean) * 10) / 10,
      fpsPotentialFromWorkP50: Math.round((1000 / work.p50) * 10) / 10,
      renderRasterMs: rs,
      framesOver16_7ms: { loopWork: loop.work.filter((v) => v > 16.667).length, renderRaster: raster.out.filter((v) => v > 16.667).length },
    });
    console.log(`perf ${time}: trabalho p50 ${work.p50} p95 ${work.p95} p99 ${work.p99} ms · intervalo médio ${iv.mean} ms (${runs.at(-1).fpsAvg} fps) · render+raster p50 ${rs.p50} p95 ${rs.p95} p99 ${rs.p99} ms`);
  }
  const res = {
    map: ID,
    date: new Date().toISOString(),
    method: {
      headless: true,
      note: "Ambiente headless (chrome-headless-shell, --disable-gpu: Canvas 2D rasterizado em software, sem vsync de monitor real). Não é medição de dispositivo de jogador; serve para comparar versões do mapa/renderer na mesma máquina.",
      window: [W, H],
      zoom: 1,
      hudHidden: true,
      seed: SEED,
      auto: true,
      warmupFrames: WARM,
      frames: N,
      loop: "wrapper em requestAnimationFrame injetado antes do carregamento (Page.addScriptToEvaluateOnNewDocument): work = duração do callback do quadro (sim + render + rótulos + HUD); interval = diferença entre timestamps do rAF",
      renderRaster: "N chamadas síncronas de view.render(presenter, 0, now) + getImageData(0,0,1,1) no #world (força a rasterização)",
      command: "OUT=../../evidence/map-factory W=1792 H=1280 CHROME_LIBS=/tmp/chromelibs/root/usr/lib/x86_64-linux-gnu ONLY=perf npm run shots:live",
    },
    environment: { browser: browser.product, userAgent: browser.userAgent, cpu: cpus()[0]?.model, cores: cpus().length, memGB: Math.round(totalmem() / 2 ** 30), kernel: release(), node: process.version },
    runs,
  };
  // PERF_TAG (ex. _v4 com QUERY=look=v8): outro arquivo, para comparar com a medição anterior
  const TAG = process.env.PERF_TAG ?? "";
  res.query = QUERY;
  writeFileSync(join(OUT, `perf-${ID}${TAG}.json`), JSON.stringify(res, null, 2) + "\n");
  const row = (label, s2) => `| ${label} | ${s2.p50} | ${s2.p95} | ${s2.p99} | ${s2.mean} | ${s2.max} |`;
  const md = [
    `# Performance — ${ID} (frame-time, ambiente headless)`,
    "",
    `- **Data:** ${res.date} · **Gerado por:** \`scripts/capture-live.mjs\` (\`ONLY=perf\`)`,
    `- **Comando:** \`${res.method.command}\``,
    `- **Ambiente:** ${res.environment.browser}, ${res.environment.cpu} (${res.environment.cores} núcleos), ${res.environment.memGB} GB, kernel ${res.environment.kernel}, Node ${res.environment.node}`,
    "",
    "> **Headless.** Chromium headless (`chrome-headless-shell`) com `--disable-gpu`: o Canvas 2D é rasterizado em software e o rAF segue um relógio de ~60 Hz, não o vsync de um monitor. Os números servem para comparar versões do mapa/renderer nesta máquina, não como garantia de fps no dispositivo do jogador.",
    "",
    "## Método",
    "",
    `- Mapa inteiro na tela: janela ${W}×${H}, zoom 1, HUD escondido, semente ${SEED}, AUTO ligado (selvagens, parceira e bots em movimento).`,
    `- ${WARM} quadros de aquecimento, depois **${N} quadros** medidos, de dia e de noite (grade noturno + luzes).`,
    `- **Trabalho do quadro (loop real):** ${res.method.loop}.`,
    `- **Render + raster:** ${res.method.renderRaster}.`,
    "- Percentis por posto mais próximo sobre as N amostras; fps médio = 1000 / intervalo médio; fps potencial = 1000 / p50 do trabalho.",
    "",
    "## Resultado (ms)",
    "",
    "| Medida | p50 | p95 | p99 | média | máx |",
    "|---|---|---|---|---|---|",
    ...runs.flatMap((r) => [row(`${r.time}: trabalho do quadro`, r.loopWorkMs), row(`${r.time}: intervalo entre quadros`, r.loopIntervalMs), row(`${r.time}: render + raster`, r.renderRasterMs)]),
    "",
    "| Hora | fps médio | fps potencial (p50 trabalho) | quadros > 16,7 ms (trabalho / render+raster) | cena |",
    "|---|---|---|---|---|",
    ...runs.map((r) => `| ${r.time} | ${r.fpsAvg} | ${r.fpsPotentialFromWorkP50} | ${r.framesOver16_7ms.loopWork} / ${r.framesOver16_7ms.renderRaster} | ${r.scene.tiles.join("×")} tiles, ${r.scene.props} props, ${r.scene.entidades} entidades (${r.scene.selvagens} selvagens), canvas ${r.scene.canvasPx.join("×")} |`),
    "",
  ].join("\n");
  writeFileSync(join(OUT, `perf-${ID}${TAG}.md`), md);
  console.log("ok", `perf-${ID}${TAG}.json`, `perf-${ID}${TAG}.md`);
}

async function maps(cdp) {
  await cdp.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/?seed=${SEED}&auto=1&criador=0&novo=1&time=day${QUERY}` });
  await cdp.waitFor("!!window.__gs003", 30000, "o jogo iniciar");
  await sleep(2500);
  const key = (k, type) => cdp.eval(`window.dispatchEvent(new KeyboardEvent("${type}", { key: "${k}" }))`);
  await key("m", "keydown");
  await key("m", "keyup");
  await sleep(500);
  await cdp.shot("mapa_mundi.png");
  const travel = async (region, name) => {
    await cdp.eval(`document.querySelector('[data-travel="${region}"]').click()`);
    await sleep(150);
    await cdp.shot(`mapa_fade_${name}.png`);
    await cdp.waitFor(`window.__gs003.mapId === "${name}" && !document.querySelector(".map-fade.on")`, 20000, `chegar em ${name}`);
    await sleep(2500);
    await cdp.shot(`mapa_${name}.png`);
    const r = await cdp.send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: H - 110, width: 560, height: 110, scale: 2 } });
    writeFileSync(join(OUT, `mapa_${name}_hud.png`), Buffer.from(r.data, "base64"));
    console.log("ok", `mapa_${name}_hud.png`, await cdp.eval(`document.querySelector(".pill.region").textContent.trim()`));
  };
  await travel("praia_dos_postes", "praia");
  await key("m", "keydown");
  await key("m", "keyup");
  await sleep(500);
  await cdp.shot("mapa_mundi_praia.png");
  await travel("vila_dos_bebes", "vila");
  // sai pela borda norte da vila andando
  await key("w", "keydown");
  await cdp.waitFor(`window.__gs003.mapId === "forest-proof"`, 15000, "voltar à floresta pela borda");
  await key("w", "keyup");
  await cdp.waitFor(`!document.querySelector(".map-fade.on")`, 5000, "o fade acabar");
  await sleep(2000);
  await cdp.shot("mapa_borda_floresta.png");
  console.log("save:", await cdp.eval(`JSON.parse(localStorage.getItem("gs003.world.save")).data.map`));
}

/**
 * Save + progresso offline: entra no jogo (o save é gravado no boot), liga Auto-evoluir, e reescreve o save no
 * localStorage como o de quem saiu há 5 h com o Guilmon no Nv.15 (perto do Nv.16 da evolução). Recarrega: o boot
 * real lê o save, credita 4 h (teto) pela sim e mostra o Relatório offline. Depois, "Coletar" e o mundo.
 */
async function offline(cdp) {
  const url = `http://127.0.0.1:${PORT}/?seed=${SEED}&auto=1&criador=0&time=day${QUERY}`;
  // (o save do mundo é por origem: este perfil temporário do Chromium começa sem save)
  await cdp.send("Page.navigate", { url });
  await cdp.waitFor("!!window.__gs003", 30000, "o jogo iniciar");
  await sleep(1500);
  await cdp.eval(`document.querySelector('[data-act="autoevo"]').click()`);
  await sleep(300);
  // sai do jogo (o pagehide grava o save) para uma página estática da mesma origem, e só então edita o save
  await cdp.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/package.json` });
  await sleep(800);
  const staged = await cdp.eval(`(() => { const k = "gs003.world.save"; const env = JSON.parse(localStorage.getItem(k));
    env.data.partner.level = 15; env.data.partner.xp = 0; env.savedAt = Date.now() - 5 * 3600 * 1000;
    localStorage.setItem(k, JSON.stringify(env)); return { v: env.v, autoEvolve: env.data.autoEvolve, partner: env.data.partner.speciesId + " Nv." + env.data.partner.level }; })()`);
  console.log("save preparado:", JSON.stringify(staged));
  await cdp.send("Page.navigate", { url });
  await cdp.waitFor(`!!document.querySelector('[data-testid="offline-report"]')`, 40000, "o relatório offline");
  await sleep(600);
  await cdp.shot("offline_relatorio.png");
  const rep = await cdp.eval(`(() => { const q = (s) => document.querySelector(s)?.textContent.trim(); return { tempo: q('[data-testid="off-time"]'), xp: q('[data-testid="off-xp"]'), vitorias: q('[data-testid="off-wins"]'), bits: q('[data-testid="off-bits"]'), nivel: q('[data-testid="off-level"]'), golpes: q('[data-testid="off-moves"]'), evolucoes: q('[data-testid="off-evos"]') }; })()`);
  console.log("relatório:", JSON.stringify(rep));
  const box = await cdp.eval(`(() => { const r = document.querySelector('[data-testid="offline-report"]').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })()`);
  const r = await cdp.send("Page.captureScreenshot", { format: "png", clip: { x: box.x - 10, y: box.y - 10, width: box.w + 20, height: box.h + 20, scale: 2 } });
  writeFileSync(join(OUT, "offline_relatorio_zoom.png"), Buffer.from(r.data, "base64"));
  console.log("ok offline_relatorio_zoom.png");
  await cdp.eval(`document.querySelector('[data-testid="off-collect"]').click()`);
  await sleep(2500);
  await cdp.shot("offline_depois.png");
  const st = await cdp.eval(`(() => { const g = window.__gs003; const p = g.sim.state.entities.find((e) => e.id === "p1:partner");
    const s = JSON.parse(localStorage.getItem("gs003.world.save")); return { parceira: p.name + " Nv." + p.level, golpes: p.moves, autoEvo: document.querySelector('[data-testid="autoevo-state"]').textContent, saveV: s.v, saveParceira: s.data.partner.speciesId + " Nv." + s.data.partner.level }; })()`);
  console.log("depois:", JSON.stringify(st));
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

/** Recorte ampliado (2×) da tela em volta de um ponto do mundo. */
async function zoomShot(cdp, name, world, cw, ch, fy = 0.55) {
  const at = await cdp.eval(`(() => { const v = window.__gs003.view; const c = document.querySelector("#world");
    const s = parseFloat(c.style.width) / c.width; return { x: (${world.x} - v.camera.x) * s, y: (${world.y} - v.camera.y) * s }; })()`);
  const r = await cdp.send("Page.captureScreenshot", { format: "png", clip: { x: Math.max(0, Math.min(W - cw, at.x - cw / 2)), y: Math.max(0, Math.min(H - ch, at.y - ch * fy)), width: cw, height: ch, scale: 2 } });
  writeFileSync(join(OUT, name), Buffer.from(r.data, "base64"));
  console.log("ok", name, JSON.stringify(at));
}

/**
 * forest-v4.1 no jogo: visão geral de dia e de noite (mesma semente; Digimon e Tamers com a grade noturna, nomes
 * no canvas de rótulos), recorte ampliado das entidades à noite e da trilha Wang-47 numa curva (o Tamer é posto,
 * só na posição lógica, ao lado da trilha, para a câmera ir até lá).
 */
async function forestV41(cdp) {
  for (const [name, q] of [["forest_v41_dia.png", "time=day"], ["forest_v41_noite.png", "time=night"]]) {
    await cdp.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/?seed=${SEED}&auto=1&criador=0&${q}${QUERY}` });
    await sleep(500);
    await cdp.waitFor("!!window.__gs003", 30000, "o jogo iniciar");
    await sleep(4000);
    const st = await cdp.eval(`(() => { const g = window.__gs003; const t = g.view.treeGeoms();
      return { mix: g.view.nightMix, arvores: t.length, palmeiras: t.filter((x) => x.key === "fp4_tree_palm_digital").length, folhasDeDados: t.filter((x) => x.key === "fp4_tree_data_leaf").length, comRim: t.filter((x) => x.rim).length }; })()`);
    console.log(name, JSON.stringify(st));
    await cdp.shot(name);
    if (name.includes("noite")) {
      const p = await cdp.eval(`(() => { const p = window.__gs003.view.motionPos("p1"); return { x: p.x, y: p.y }; })()`);
      await zoomShot(cdp, "forest_v41_noite_zoom.png", p, 560, 320, 0.6);
    }
  }
  // trilha: de dia, Tamer numa curva da trilha a nordeste da clareira central (tile 42,17)
  await cdp.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/?seed=${SEED}&auto=0&criador=0&time=day${QUERY}` });
  await sleep(500);
  await cdp.waitFor("!!window.__gs003", 30000, "o jogo iniciar");
  await sleep(1500);
  const spot = await cdp.eval(`(() => { const g = window.__gs003; const me = g.sim.state.entities.find((e) => e.id === "p1");
    const tx = Number(${JSON.stringify(process.env.TRAIL_TILE ?? "44,16")}.split(",")[0]); const ty = Number(${JSON.stringify(process.env.TRAIL_TILE ?? "44,16")}.split(",")[1]);
    me.x = Math.round((tx * 32 + 16) / 2); me.y = Math.round((ty * 32 + 16) / 2); me.dest = undefined;
    return { x: tx * 32 + 16, y: ty * 32 + 16 }; })()`);
  await sleep(2500);
  await zoomShot(cdp, "trilha_zoom.png", spot, 800, 450, 0.5);
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

/**
 * Arena PvP local (GS-006): entrada pelo atalho do troféu → seleção (Automático, Digimon do save) → batalha 3v3 →
 * Manual 1v1 (WASD/mouse simulados por eventos reais no canvas: anda até o fantasma, mira nele e usa LMB/RMB/Espaço/
 * Q/E) → resultado. ARENA_ROUND=SEG encurta a rodada manual (padrão 30 s nas capturas; o jogo usa 90 s).
 */
async function arena(cdp) {
  const round = Number(process.env.ARENA_ROUND ?? 30);
  await cdp.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/?seed=${SEED}&criador=0&novo=1&time=day&arenaSeed=${SEED}&arenaRound=${round}${QUERY}` });
  await cdp.waitFor("!!window.__gs003", 30000, "o jogo iniciar");
  await sleep(2500);
  await cdp.eval(`document.querySelector('.hud-menu [data-short="arena"]').click()`);
  await sleep(600);
  await cdp.shot("arena_entrada.png");
  await cdp.eval(`document.querySelector('[data-mode="auto"]').click()`);
  await sleep(700);
  await cdp.eval(`(() => { const r = document.querySelector('[data-ghost="bot:bot2"]'); r.checked = true; r.dispatchEvent(new Event("change", { bubbles: true })); })()`);
  await sleep(500);
  await cdp.shot("arena_selecao.png");
  console.log("seleção:", await cdp.eval(`[...document.querySelectorAll(".ar-slots li b")].map((b) => b.textContent).join(" | ") + " · " + document.querySelector("[data-testid=power]").textContent.replace(/\s+/g, " ")`));
  await cdp.eval(`document.querySelector('[data-fight]').click()`);
  await cdp.waitFor(`window.__gs003.arena.state.screen === "battle"`, 10000, "a batalha automática");
  await sleep(4500);
  await cdp.waitFor(`(() => { const p = window.__gs003.arena.state.presenter; const now = performance.now(); return p && p.casts.some((c) => now >= c.launchAt && now < c.hitAt + 80); })()`, 15000, "um golpe no ar");
  await cdp.shot("arena_auto.png");
  await cdp.eval(`document.querySelector('[data-speed="4"]').click()`);
  await cdp.waitFor(`window.__gs003.arena.state.screen === "result"`, 120000, "o fim do 3v3");
  await sleep(500);
  await cdp.shot("arena_resultado_auto.png");
  console.log("3v3:", await cdp.eval(`JSON.stringify(window.__gs003.arena.state.auto.result) + " · " + document.querySelector("[data-testid=result-title]").textContent`));
  await cdp.eval(`document.querySelector('[data-menu]').click()`);
  await sleep(400);
  await cdp.eval(`document.querySelector('[data-mode="manual"]').click()`);
  await sleep(500);
  await cdp.eval(`document.querySelector('[data-fight]').click()`);
  await cdp.waitFor(`window.__gs003.arena.state.screen === "pick"`, 5000, "a escolha da rodada");
  await sleep(300);
  await cdp.shot("arena_manual_rodada.png");
  // jogador simulado por eventos reais: WASD (keydown/keyup no window) e mouse (pointermove/pointerdown no canvas)
  const drive = `(() => {
    const g = window.__gs003, st = g.arena.state, r = st.match && st.match.current;
    if (!r || r.result || st.screen !== "battle") return false;
    const [me, foe] = r.ents, v = st.view, cv = document.querySelector(".ar-canvas");
    const s = parseFloat(cv.style.width) / cv.width;
    const fx = (foe.x * 2 - v.camera.x) * s, fy = (foe.y * 2 - v.camera.y) * s;
    const d = Math.hypot(foe.x - me.x, foe.y - me.y);
    const key = (k, t) => window.dispatchEvent(new KeyboardEvent(t, { key: k }));
    for (const k of "wasd") key(k, "keyup");
    if (d > 26) { if (foe.x > me.x + 4) key("d", "keydown"); if (foe.x < me.x - 4) key("a", "keydown"); if (foe.y > me.y + 4) key("s", "keydown"); if (foe.y < me.y - 4) key("w", "keydown"); }
    cv.dispatchEvent(new PointerEvent("pointermove", { clientX: fx, clientY: fy, bubbles: true }));
    const t = Math.floor(performance.now() / 300) % 5;
    if (t === 0) { cv.dispatchEvent(new PointerEvent("pointerdown", { clientX: fx, clientY: fy, button: 0, bubbles: true })); window.dispatchEvent(new PointerEvent("pointerup", { button: 0 })); }
    else if (t === 1) { cv.dispatchEvent(new PointerEvent("pointerdown", { clientX: fx, clientY: fy, button: 2, bubbles: true })); window.dispatchEvent(new PointerEvent("pointerup", { button: 2 })); }
    else if (me.moves[t - 1]) { const k = [" ", "q", "e"][t - 2]; key(k, "keydown"); key(k, "keyup"); }
    return true;
  })()`;
  let shotManual = false;
  for (let roundN = 1; roundN <= 3; roundN++) {
    const screen = await cdp.eval(`window.__gs003.arena.state.screen`);
    if (screen === "result") break;
    await cdp.waitFor(`window.__gs003.arena.state.screen === "pick"`, 15000, "a escolha da rodada");
    await cdp.eval(`document.querySelector('[data-round-pick]:not([disabled])').click()`);
    await cdp.waitFor(`window.__gs003.arena.state.screen === "battle"`, 10000, "a rodada começar");
    const t0 = Date.now();
    while (Date.now() - t0 < (round + 5) * 1000) {
      const on = await cdp.eval(drive);
      if (!on) break;
      if (!shotManual && Date.now() - t0 > 1500) {
        const flying = await cdp.eval(`(() => { const p = window.__gs003.arena.state.presenter; const now = performance.now(); return p.casts.some((c) => c.mine && now >= c.launchAt && now < c.hitAt); })()`);
        if (flying || Date.now() - t0 > 4000) {
          await cdp.shot("arena_manual.png");
          shotManual = true;
        }
      }
      await sleep(120);
    }
    await cdp.eval(`(() => { for (const k of "wasd") window.dispatchEvent(new KeyboardEvent("keyup", { key: k })); })()`);
    console.log(`rodada ${roundN}:`, await cdp.eval(`(() => { const m = window.__gs003.arena.state.match; const r = m.rounds[m.rounds.length - 1]; return r ? JSON.stringify({ placar: m.score, vencedor: r.result.winner, como: r.result.reason, pv: r.result.hpPct.map((x) => Math.round(x * 100)) }) : "?"; })()`));
    await sleep(2200);
  }
  await cdp.waitFor(`window.__gs003.arena.state.screen === "result"`, 20000, "o resultado do manual");
  await sleep(500);
  await cdp.shot("arena_resultado.png");
  console.log("manual:", await cdp.eval(`document.querySelector("[data-testid=result-title]").textContent + " " + (document.querySelector("[data-testid=final-score]")?.textContent ?? "") + " · dano " + document.querySelector("[data-testid=dmg-a]").textContent + "×" + document.querySelector("[data-testid=dmg-b]").textContent + " · acertos " + document.querySelector("[data-testid=hits-a]").textContent + "×" + document.querySelector("[data-testid=hits-b]").textContent`));
  await cdp.eval(`window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))`);
  await sleep(400);
  await cdp.shot("arena_historico.png");
  console.log("save:", await cdp.eval(`(() => { const d = JSON.parse(localStorage.getItem("gs003.world.save")).data; return JSON.stringify({ v: JSON.parse(localStorage.getItem("gs003.world.save")).v, rating: d.arena.rating, partidas: d.arena.history.map((h) => h.mode + ":" + h.result + (h.score ? " " + h.score : "")), box: d.box.length }); })()`));
}
