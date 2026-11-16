// F9 Fase 9 — teste automatizado do laboratório com chrome-headless-shell via CDP puro (sem playwright,
// mesmo padrão de capture_reference.mjs do map-factory). Verifica: 0 erros de console, todos os assets
// carregam, cada estado toca (window.__labSelfTest). --no-proxy-server contorna o HTTP_PROXY do sandbox
// para o localhost da própria página.
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

// O sandbox define HTTP_PROXY/HTTPS_PROXY globais; sem contorná-los, o fetch/WebSocket do próprio Node
// (undici, NODE_USE_ENV_PROXY=1) tenta rotear 127.0.0.1 pelo proxy de egresso e nunca conecta ao CDP local.
process.env.NO_PROXY = "127.0.0.1,localhost";
process.env.no_proxy = "127.0.0.1,localhost";
delete process.env.HTTP_PROXY;
delete process.env.HTTPS_PROXY;
delete process.env.http_proxy;
delete process.env.https_proxy;

const BASE = "http://127.0.0.1:5198";
const DEBUG_PORT = 9512;
const OUT = "/home/openclaw/projects/GameStudio/projects/prototypes/GS-003/etapa6-lab/fase24-f9-labramon/scripts_f9_fase9/_evidencias_teste";
mkdirSync(OUT, { recursive: true });
const CHROME = "/home/openclaw/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const LIBS = "/tmp/chromelibs/ex/usr/lib/x86_64-linux-gnu";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cdpConnect() {
  for (let i = 0; i < 100; i++) {
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
  constructor(url) {
    this.ws = new WebSocket(url);
    this.id = 0;
    this.pending = new Map();
    this.consoleMsgs = [];
    this.pageErrors = [];
    this.requestFailed = [];
    this.ws.onmessage = (m) => {
      const msg = JSON.parse(m.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { res, rej } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) rej(new Error(msg.error.message));
        else res(msg.result);
        return;
      }
      if (msg.method === "Runtime.consoleAPICalled") {
        const type = msg.params.type;
        const text = (msg.params.args || []).map((a) => a.value ?? a.description ?? "").join(" ");
        this.consoleMsgs.push({ type, text: text.slice(0, 500) });
      }
      if (msg.method === "Runtime.exceptionThrown") {
        this.pageErrors.push(String(msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text || "").slice(0, 800));
      }
      if (msg.method === "Network.loadingFailed") {
        this.requestFailed.push(`${msg.params.requestId} ${msg.params.errorText}`);
      }
    };
  }
  open() { return new Promise((res, rej) => { this.ws.onopen = res; this.ws.onerror = rej; }); }
  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((res, rej) => this.pending.set(id, { res, rej }));
  }
  async eval(expr, awaitPromise = true) {
    const r = await this.send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result.value;
  }
  async shot(name) {
    const r = await this.send("Page.captureScreenshot", { format: "png" });
    writeFileSync(`${OUT}/${name}`, Buffer.from(r.data, "base64"));
    console.log("shot", name);
  }
  async waitFor(expr, timeoutMs, label) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeoutMs) {
      try { if (await this.eval(expr, false)) return true; } catch {}
      await sleep(100);
    }
    console.warn(`timeout esperando ${label}`);
    return false;
  }
}

async function main() {
  const env = { ...process.env, LD_LIBRARY_PATH: [LIBS, process.env.LD_LIBRARY_PATH].filter(Boolean).join(":") };
  const proc = spawn(
    CHROME,
    ["--headless", "--no-sandbox", "--no-proxy-server", "--disable-gpu", "--hide-scrollbars", "--mute-audio",
     `--remote-debugging-port=${DEBUG_PORT}`, "--window-size=1100,1400", "--force-device-scale-factor=1", "about:blank"],
    { env, stdio: ["ignore", "ignore", "pipe"] }
  );
  const report = { date: new Date().toISOString(), base: BASE, tests: {} };
  try {
    const cdp = new Cdp(await cdpConnect());
    await cdp.open();
    await cdp.send("Runtime.enable");
    await cdp.send("Page.enable");
    await cdp.send("Network.enable");
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1100, height: 1400, deviceScaleFactor: 1, mobile: false });

    await cdp.send("Page.navigate", { url: `${BASE}/lab/index.html` });
    const ready = await cdp.waitFor("!!window.__labReady", 30000, "assets carregarem (__labReady)");
    await sleep(500);
    await cdp.shot("01_carregado.png");

    const assetSummary = await cdp.eval("window.__labAssetSummary");
    report.tests.assets = { ready, assetSummary };
    console.log("assets:", JSON.stringify(assetSummary));

    const selfTest = await cdp.eval("window.__labSelfTest()");
    report.tests.selfTest = selfTest;
    console.log("selfTest: passed", selfTest.passed, "failed", selfTest.failed, "newErrors", selfTest.newErrors.length);
    console.log("Lchecks (L1-L7):", JSON.stringify(selfTest.Lchecks, null, 1));
    console.log("LfailedCount:", selfTest.LfailedCount);
    await sleep(300);
    await cdp.shot("02_apos_selftest.png");

    // comparação lado a lado + zoom 4x + pivô/colisão + fundo grama, para evidência visual
    await cdp.eval(`document.getElementById('compareToggle').click();`, false);
    await cdp.eval(`document.getElementById('pivotToggle').click();`, false);
    await cdp.eval(`document.getElementById('bgSelect').value='grama'; document.getElementById('bgSelect').dispatchEvent(new Event('change'));`, false);
    await cdp.eval(`document.getElementById('zoomSelect').value='4'; document.getElementById('zoomSelect').dispatchEvent(new Event('change'));`, false);
    await sleep(400);
    await cdp.shot("03_comparacao_zoom4_pivo_grama.png");

    // L7: Tamer de referência dentro do palco (escala), evidência visual à parte da comparação acima
    await cdp.eval(`document.getElementById('compareToggle').click();`, false); // volta a 1 painel
    await cdp.eval(`document.getElementById('pivotToggle').checked ? document.getElementById('pivotToggle').click() : null;`, false);
    await cdp.eval(`document.getElementById('tamerRefToggle').checked = true; document.getElementById('tamerRefToggle').dispatchEvent(new Event('change'));`, false);
    await sleep(300);
    await cdp.shot("04_tamer_no_palco_L7.png");

    report.tests.consoleErrorCount = cdp.consoleMsgs.filter((m) => m.type === "error").length;
    report.tests.consoleMsgs = cdp.consoleMsgs.slice(0, 200);
    report.tests.pageErrors = cdp.pageErrors;
    report.tests.requestFailed = cdp.requestFailed;

    const assetsOk = !!assetSummary && assetSummary.erro === 0 && ready;
    const selfTestOk = selfTest.failed === 0 && (selfTest.LfailedCount || 0) === 0 && (selfTest.newErrors || []).length === 0;
    const noPageErrors = cdp.pageErrors.length === 0 && report.tests.requestFailed.length === 0;
    const noConsoleErrors = report.tests.consoleErrorCount === 0;
    report.ok = assetsOk && selfTestOk && noPageErrors && noConsoleErrors;
    report.okBreakdown = { assetsOk, selfTestOk, noPageErrors, noConsoleErrors };

    writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1));
    console.log("console errors:", report.tests.consoleErrorCount, "pageErrors:", cdp.pageErrors.length);
    console.log("RESULTADO FINAL:", report.ok ? "PASSOU (0 erros)" : "FALHOU", JSON.stringify(report.okBreakdown));
    if (!report.ok) process.exitCode = 1;
  } finally {
    proc.kill("SIGKILL");
  }
}
main().catch((e) => { console.error("FALHA", e); process.exit(1); });
