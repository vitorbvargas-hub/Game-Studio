// Capturas AO VIVO da prova visual (docs/screens/proof_live_*.png): o jogo real rodando no Chromium headless,
// com o HUD em DOM, os nomes e o modal. Sobe o Vite em modo dev, abre a página via Chrome DevTools Protocol
// (WebSocket nativo do Node), espera os momentos certos (lendo window.__gs003) e fotografa.
//
// Uso: npm run shots:live
//   CHROME=/caminho/chrome-headless-shell   (padrão: ~/.cache/ms-playwright/chromium_headless_shell-*/…)
//   CHROME_LIBS=/dir/com/libnss3…           (opcional: LD_LIBRARY_PATH extra, se o host não tiver as libs)
//   SEED=7 W=1600 H=900 · QUERY="map=meadow" · ONLY=geral|golpes|forest|daynight|v41|creator|offline|maps|screens|evolve|arena (creator inclui a escolha do inicial; STARTER=CREATURE-NNNN) · TIME=day|night · OUT=/outro/dir

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
    if (process.env.ONLY === "screens") return await screens(cdp);
    if (process.env.ONLY === "evolve") return await evolveChoice(cdp);
    if (process.env.ONLY === "arena") return await arena(cdp);
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

/** Mapa inteiro no jogo real: janela do tamanho do mapa (W=1792 H=1280), zoom 1, HUD escondido. */
async function factoryFull(cdp) {
  const ID = "digimon-forest-01";
  for (const time of ["day", "night"]) {
    await cdp.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/?seed=${SEED}&auto=1&criador=0&novo=1&time=${time}&zoom=1&map=${ID}${QUERY}` });
    await cdp.waitFor(`!!window.__gs003 && window.__gs003.mapId === "${ID}"`, 40000, "o jogo iniciar");
    await sleep(2500);
    await cdp.eval(`document.querySelector("#hud").style.visibility = "hidden"`);
    await sleep(300);
    await cdp.shot(`factory_00_mapa_inteiro_${time === "day" ? "dia" : "noite"}.png`);
  }
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
