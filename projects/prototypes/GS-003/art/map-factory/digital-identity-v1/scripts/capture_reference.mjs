// Captura de referência da Digital Forest 01 atual (servidor 5190 já rodando), dia e noite.
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const PORT = 5190;
const DEBUG_PORT = 9455;
const W = 1600, H = 900;
const OUT = process.argv[2] || "/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/art/map-factory/digital-identity-v1/reference";
mkdirSync(OUT, { recursive: true });
const CHROME = "/home/openclaw/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cdpConnect() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)).json();
      const page = list.find((t) => t.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(200);
  }
  throw new Error("Chromium não respondeu");
}

class Cdp {
  constructor(url) { this.ws = new WebSocket(url); this.id = 0; this.pending = new Map();
    this.ws.onmessage = (m) => { const msg = JSON.parse(m.data);
      if (msg.id && this.pending.has(msg.id)) { const { res, rej } = this.pending.get(msg.id); this.pending.delete(msg.id);
        if (msg.error) rej(new Error(msg.error.message)); else res(msg.result); } }; }
  open() { return new Promise((res, rej) => { this.ws.onopen = res; this.ws.onerror = rej; }); }
  send(method, params = {}) { const id = ++this.id; this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((res, rej) => this.pending.set(id, { res, rej })); }
  async eval(expr) { const r = await this.send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result.value; }
  async shot(name, clip) { const r = await this.send("Page.captureScreenshot", clip ? { format: "png", clip } : { format: "png" });
    writeFileSync(`${OUT}/${name}`, Buffer.from(r.data, "base64")); console.log("ok", name); }
  async waitFor(expr, timeoutMs, label) { const t0 = Date.now();
    while (Date.now() - t0 < timeoutMs) { if (await this.eval(expr)) return true; await sleep(50); }
    console.warn(`timeout esperando ${label}`); return false; }
}

async function main() {
  const env = { ...process.env, LD_LIBRARY_PATH: ["/tmp/chromelibs/root/usr/lib/x86_64-linux-gnu", process.env.LD_LIBRARY_PATH].filter(Boolean).join(":") };
  const proc = spawn(CHROME, ["--headless", "--no-sandbox", "--no-proxy-server", "--disable-gpu", "--hide-scrollbars",
    "--mute-audio", `--remote-debugging-port=${DEBUG_PORT}`, `--window-size=${W},${H}`, "--force-device-scale-factor=1", "about:blank"],
    { env, stdio: ["ignore", "ignore", "pipe"] });
  try {
    const cdp = new Cdp(await cdpConnect());
    await cdp.open();
    await cdp.send("Runtime.enable");
    await cdp.send("Page.enable");
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });

    for (const time of ["day", "night"]) {
      await cdp.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/?seed=7&auto=1&criador=0&novo=1&map=digimon-forest-01&time=${time}` });
      await cdp.waitFor("!!window.__gs003", 30000, "o jogo iniciar");
      await sleep(3000);
      await cdp.shot(`forest01_${time}_full.png`);
      // recorte central (clareira), ~ metade da tela
      const cw = 760, ch = 540;
      const r = await cdp.send("Page.captureScreenshot", { format: "png", clip: { x: (W - cw) / 2, y: (H - ch) / 2, width: cw, height: ch, scale: 2 } });
      writeFileSync(`${OUT}/forest01_${time}_clareira_zoom.png`, Buffer.from(r.data, "base64"));
      console.log("ok", `forest01_${time}_clareira_zoom.png`);
      const info = await cdp.eval(`(() => { const g = window.__gs003; const cv = document.querySelector('#world');
        const s = parseFloat(cv.style.width) / cv.width; return { mapId: g.mapId, props: g.sim.map.props?.length,
          tileSize: g.sim.map.tileSize ?? g.sim.map.tileWidth, scale: s, camera: g.view.camera, worldCanvas: { w: cv.width, h: cv.height } }; })()`);
      console.log("info", time, JSON.stringify(info));
    }
  } finally {
    proc.kill("SIGKILL");
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
