// QA independente F9 (game-qa): teste do laboratório em chrome-headless-shell via CDP, roteiro próprio.
// Não altera o lab. Uso: node qa_f9/scripts/lab_qa.mjs   (cwd = fase24-f9-labramon)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
for (const k of ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy', 'ALL_PROXY', 'all_proxy']) delete process.env[k];
process.env.NO_PROXY = process.env.no_proxy = '127.0.0.1,localhost';

const BASE = 'http://127.0.0.1:5198', PORT = 9533, OUT = 'qa_f9/lab';
fs.mkdirSync(OUT, { recursive: true });
const CHROME = process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const LIBS = '/tmp/chromelibs/ex/usr/lib/x86_64-linux-gnu';
const sleep = ms => new Promise(r => setTimeout(r, ms));

class Cdp {
  constructor(url) {
    this.ws = new WebSocket(url); this.id = 0; this.p = new Map(); this.console = []; this.exc = []; this.fail = []; this.http = [];
    this.ws.onmessage = m => {
      const x = JSON.parse(m.data);
      if (x.id && this.p.has(x.id)) { const { res, rej } = this.p.get(x.id); this.p.delete(x.id); x.error ? rej(new Error(x.error.message)) : res(x.result); return; }
      if (x.method === 'Runtime.consoleAPICalled') this.console.push({ type: x.params.type, text: (x.params.args || []).map(a => a.value ?? a.description ?? '').join(' ').slice(0, 300) });
      if (x.method === 'Runtime.exceptionThrown') this.exc.push(String(x.params.exceptionDetails?.exception?.description || x.params.exceptionDetails?.text).slice(0, 500));
      if (x.method === 'Network.loadingFailed') this.fail.push(x.params.errorText);
      if (x.method === 'Network.responseReceived' && x.params.response.status >= 400) this.http.push(`${x.params.response.status} ${x.params.response.url}`);
      if (x.method === 'Log.entryAdded' && x.params.entry.level === 'error') this.console.push({ type: 'log-error', text: x.params.entry.text.slice(0, 300) });
    };
  }
  open() { return new Promise((r, j) => { this.ws.onopen = r; this.ws.onerror = j; }); }
  send(method, params = {}) { const id = ++this.id; this.ws.send(JSON.stringify({ id, method, params })); return new Promise((res, rej) => this.p.set(id, { res, rej })); }
  async ev(expr) { const r = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text); return r.result.value; }
  async shot(n) { const r = await this.send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(`${OUT}/${n}`, Buffer.from(r.data, 'base64')); }
  async key(k, type) { const code = 'Key' + k.toUpperCase(); await this.send('Input.dispatchKeyEvent', { type, key: k, code, windowsVirtualKeyCode: k.toUpperCase().charCodeAt(0), text: type === 'keyDown' ? k : undefined }); }
}

// helpers injetados na página (só leitura do estado do lab)
const HELPERS = `
window.__qa = {
  st(i=0){ const p=players[i]; return { state:p.stateName, dir:p.direction, frame:p.frameIndex, n:p.clip?.frames.length, src:p.clip?.frames[p.frameIndex], rest:p.restState, combat:p.combatState, done:p.done, paused:p.paused,
    label:document.getElementById('stateLabel'+i).textContent, acordarDis:document.querySelector('[data-ctrl="acordar"]').disabled, recDis:document.querySelector('[data-ctrl="recuperacao"]').disabled,
    durations:p.clip?.durations, frames:p.clip?.frames }; },
  click(c){ document.querySelector('.ctrl-btn[data-ctrl="'+c+'"][data-p="0"]').click(); },
  // compara o canvas do painel 0 com o PNG do quadro atual (pixel exato, sem reamostragem)
  canvasMatches(){ const p=players[0]; const img=assetImg.get(p.clip.frames[p.frameIndex]); const c=document.createElement('canvas'); c.width=p.canvas.width; c.height=p.canvas.height; const x=c.getContext('2d'); x.drawImage(img,0,0);
    if (p.fx && p.fxIndex!=null) x.drawImage(assetImg.get(p.fx.frames[p.fxIndex]),0,0);
    const a=x.getImageData(0,0,c.width,c.height).data, b=p.ctx.getImageData(0,0,c.width,c.height).data; let d=0; for(let i=0;i<a.length;i++) if(a[i]!==b[i]) d++; return d; },
  // registra a linha do tempo de quadros (src + t) até o estado mudar ou tempo esgotar
  trace(ms){ return new Promise(res=>{ const p=players[0]; const t0=performance.now(); const log=[]; let last=null; const f=(t)=>{ const k=p.stateName+'|'+p.frameIndex; if(k!==last){ log.push({t:Math.round(t-t0), s:p.stateName, i:p.frameIndex, src:(p.clip.frames[p.frameIndex]||'').split('/').slice(-3).join('/')}); last=k; } if(t-t0<ms) requestAnimationFrame(f); else res(log); }; requestAnimationFrame(f); }); },
  fps(){ return players[0].fps; }
};`;

async function main() {
  const env = { ...process.env, LD_LIBRARY_PATH: [LIBS, process.env.LD_LIBRARY_PATH].filter(Boolean).join(':') };
  const proc = spawn(CHROME, ['--headless', '--no-sandbox', '--no-proxy-server', '--disable-gpu', '--hide-scrollbars', '--mute-audio', `--remote-debugging-port=${PORT}`, '--window-size=1280,1500', 'about:blank'], { env, stdio: ['ignore', 'ignore', 'pipe'] });
  const R = { data: new Date().toISOString(), base: BASE, resultados: {} };
  const ok = (k, v) => { R.resultados[k] = v; console.log(k, JSON.stringify(v).slice(0, 400)); };
  try {
    let url; for (let i = 0; i < 100 && !url; i++) { try { url = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find(t => t.type === 'page')?.webSocketDebuggerUrl; } catch { } await sleep(200); }
    const c = new Cdp(url); await c.open();
    for (const m of ['Runtime.enable', 'Page.enable', 'Network.enable', 'Log.enable', 'Performance.enable']) await c.send(m);
    await c.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 1500, deviceScaleFactor: 1, mobile: false });
    const tLoad = Date.now();
    await c.send('Page.navigate', { url: `${BASE}/lab/index.html?qa=${Date.now()}` });
    for (let i = 0; i < 300; i++) { try { if (await c.ev('!!window.__labReady')) break; } catch { } await sleep(100); }
    ok('carga', { ms_ate_pronto: Date.now() - tLoad, ativos: await c.ev('window.__labAssetSummary') });
    await c.ev(HELPERS);
    await sleep(400); await c.shot('01_inicial.png');
    ok('inicial', await c.ev('__qa.st()'));

    // 1. Renderização pixel-exata e durações vs manifesto, em cada controle
    const ctrls = ['standing', 'idle', 'feliz', 'triste', 'irritado', 'assustado', 'deitar', 'carinho', 'comemoracao', 'ataque', 'dano', 'incapacitacao'];
    const render = {};
    for (const k of ctrls) {
      await c.ev(`(document.querySelector('.dirSelect[data-p="0"]').value='E', document.querySelector('.dirSelect[data-p="0"]').dispatchEvent(new Event('change')))`);
      await sleep(150); await c.ev(`__qa.click('${k}')`);
      const mism = []; for (let j = 0; j < 6; j++) { await sleep(110); mism.push(await c.ev('__qa.canvasMatches()')); }
      const st = await c.ev('__qa.st()'); render[k] = { estado: st.state, quadros: st.n, difs_canvas: mism };
      if (['feliz', 'triste', 'irritado', 'assustado', 'carinho'].includes(k)) await c.ev(`__qa.click('${k}')`); // saída
      await sleep(1500);
    }
    ok('render_pixel_exato', render);

    // 2. Linha do tempo real (cadência) do ataque e do dano vs manifesto
    await c.ev(`(document.querySelector('.dirSelect[data-p="0"]').value='E', document.querySelector('.dirSelect[data-p="0"]').dispatchEvent(new Event('change')))`); await sleep(200);
    const tl = {};
    for (const k of ['ataque', 'dano', 'comemoracao']) { await c.ev(`__qa.click('${k}')`); tl[k] = await c.ev('__qa.trace(1600)'); }
    ok('linha_do_tempo', tl);

    // 3. Cadeias completas
    await c.ev(`__qa.click('dormir')`); const tDorm = await c.ev('__qa.trace(4500)'); ok('cadeia_dormir', { trace: tDorm.map(x => `${x.t}:${x.s}#${x.i}`), st: await c.ev('__qa.st()') });
    await c.shot('02_dormindo.png');
    await c.ev(`__qa.click('acordar')`); const tAc = await c.ev('__qa.trace(4000)'); ok('cadeia_acordar', { trace: tAc.map(x => `${x.t}:${x.s}#${x.i}`), st: await c.ev('__qa.st()') });
    await c.ev(`__qa.click('incapacitacao')`); await sleep(1500); ok('incapacitado', await c.ev('__qa.st()'));
    await c.ev(`__qa.click('recuperacao')`); await sleep(1600); ok('recuperado', await c.ev('__qa.st()'));

    // 4. Máquina de estados: sequências que a produção não cobre
    const sm = {};
    await c.ev(`__qa.click('dormir')`); await sleep(3200); sm.dormindo = await c.ev('__qa.st()');
    await c.ev(`__qa.click('ataque')`); await sleep(1300); sm.dormindo_depois_ataque = await c.ev('__qa.st()');
    await c.ev(`__qa.click('acordar')`); await sleep(60); sm.acordar_apos_ataque_q0 = await c.ev('__qa.st()'); await sleep(3500);
    await c.ev(`__qa.click('incapacitacao')`); await sleep(1400); await c.ev(`__qa.click('feliz')`); await sleep(1000); sm.incapacitado_depois_feliz = await c.ev('__qa.st()');
    await c.ev(`__qa.click('feliz')`); await sleep(600); await c.ev(`__qa.click('recuperacao')`); await sleep(60); sm.recuperacao_de_pe = await c.ev('__qa.st()'); await sleep(1500);
    await c.ev(`__qa.click('deitar')`); await sleep(1200); await c.ev(`__qa.click('deitar')`); await sleep(60); sm.deitar_quando_deitado = await c.ev('__qa.st()'); await sleep(1200);
    await c.key('d', 'keyDown'); await sleep(400); sm.wasd_quando_deitado = await c.ev('__qa.st()'); await c.key('d', 'keyUp'); await sleep(300); sm.apos_soltar = await c.ev('__qa.st()');
    for (const k of Object.keys(sm)) { const s = sm[k]; sm[k] = { state: s.state, rest: s.rest, combat: s.combat, acordarDis: s.acordarDis, recDis: s.recDis, src: s.src }; }
    ok('maquina_estados', sm);
    await c.ev(`(document.querySelector('.dirSelect[data-p="0"]').value='E', document.querySelector('.dirSelect[data-p="0"]').dispatchEvent(new Event('change')))`); await sleep(200);

    // 5. WASD
    const wasd = {};
    for (const k of ['w', 'a', 's', 'd']) { await c.key(k, 'keyDown'); await sleep(450); const s = await c.ev('__qa.st()'); wasd[k] = { state: s.state, dir: s.dir, dur: s.durations?.[0] }; await c.key(k, 'keyUp'); await sleep(150); wasd[k + '_solto'] = (await c.ev('__qa.st()')).state; }
    // duas teclas: segurar D, apertar A, soltar D (A ainda pressionada)
    await c.key('d', 'keyDown'); await sleep(200); await c.key('a', 'keyDown'); await sleep(200); await c.key('d', 'keyUp'); await sleep(200); wasd.d_a_soltaD = (await c.ev('__qa.st()')).state; await c.key('a', 'keyUp');
    // botão de walk seguido de ataque em < 900 ms
    await sleep(300); await c.ev(`(document.querySelector('.dirSelect[data-p="0"]').value='E', document.querySelector('.dirSelect[data-p="0"]').dispatchEvent(new Event('change')))`); await sleep(200);
    await c.ev(`document.querySelector('.walk-btn[data-dir="E"]').click()`); await sleep(300); await c.ev(`__qa.click('ataque')`); await sleep(700); wasd.ataque_apos_botao_walk = (await c.ev('__qa.st()')).state;
    ok('wasd', wasd);

    // 6. Indisponibilidade fora de E
    const ind = {};
    for (const d of ['S', 'N', 'W']) { await c.ev(`(document.querySelector('.dirSelect[data-p="0"]').value='${d}', document.querySelector('.dirSelect[data-p="0"]').dispatchEvent(new Event('change')))`); await sleep(200);
      for (const k of ['feliz', 'deitar', 'carinho', 'ataque']) { const b = await c.ev('__qa.st().src'); await c.ev(`__qa.click('${k}')`); await sleep(120); const s = await c.ev('__qa.st()'); ind[`${d}_${k}`] = { trocou: s.src !== b && s.state !== 'idle', label: s.label }; } }
    ok('indisponivel', ind); await c.shot('03_indisponivel_W.png');

    // 7. Visualização: zoom, fundo, pivô, comparação, pausa/quadro a quadro
    const vis = {};
    await c.ev(`(document.querySelector('.dirSelect[data-p="0"]').value='E', document.querySelector('.dirSelect[data-p="0"]').dispatchEvent(new Event('change')))`);
    for (const z of ['1', '2', '4']) { await c.ev(`(document.getElementById('zoomSelect').value='${z}', document.getElementById('zoomSelect').dispatchEvent(new Event('change')))`); await sleep(100); vis['zoom' + z] = await c.ev(`[document.getElementById('canvas0').style.width, getComputedStyle(document.getElementById('canvas0')).imageRendering]`); }
    await c.ev(`document.getElementById('compareToggle').click(); document.getElementById('pivotToggle').click(); document.getElementById('bgSelect').value='grama'; document.getElementById('bgSelect').dispatchEvent(new Event('change'));`);
    await c.ev(`__qa.click('ataque')`); await sleep(500); await c.shot('04_comparacao_zoom4_pivo_ataque.png');
    await c.ev(`document.getElementById('playPauseBtn').click()`); const f1 = (await c.ev('__qa.st()')).frame; await sleep(500); const f2 = (await c.ev('__qa.st()')).frame;
    await c.ev(`document.getElementById('nextFrameBtn').click()`); const f3 = (await c.ev('__qa.st()')).frame; await c.ev(`document.getElementById('prevFrameBtn').click()`); const f4 = (await c.ev('__qa.st()')).frame;
    vis.pausa = { f1, f2, parado: f1 === f2, proximo: f3, anterior: f4 };
    await c.ev(`document.getElementById('playPauseBtn').click()`); await sleep(1500);
    vis.diag = await c.ev(`Object.fromEntries(['dState','dDir','dFrame','dFps','dDuration','dDims','dAnchor','dColors','dAssetStatus'].map(i=>[i,document.getElementById(i).textContent]))`);
    ok('visualizacao', vis);

    // 8. Desempenho (indicativo, headless sem GPU): 2 painéis, zoom 4, 10 s em loop
    await c.ev(`__qa.click('feliz')`);
    const fps = []; for (let i = 0; i < 10; i++) { await sleep(1000); fps.push(await c.ev('__qa.fps()')); }
    const met = Object.fromEntries((await c.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
    ok('desempenho', { fps_amostras: fps, JSHeapUsedMB: +(met.JSHeapUsedSize / 1048576).toFixed(1), Nodes: met.Nodes, TaskDuration_s: +met.TaskDuration.toFixed(2), ScriptDuration_s: +met.ScriptDuration.toFixed(2) });
    await c.shot('05_final.png');

    ok('console', { erros: c.console.filter(m => /error/.test(m.type)), avisos: c.console.filter(m => m.type === 'warning').length, total: c.console.length, excecoes: c.exc, falhas_rede: c.fail, http_4xx_5xx: c.http, labErrors: await c.ev('window.__labErrors') });
  } finally { proc.kill('SIGKILL'); fs.writeFileSync(`${OUT}/lab_qa_report.json`, JSON.stringify(R, null, 1)); }
}
main().catch(e => { console.error('FALHA', e); process.exit(1); });
