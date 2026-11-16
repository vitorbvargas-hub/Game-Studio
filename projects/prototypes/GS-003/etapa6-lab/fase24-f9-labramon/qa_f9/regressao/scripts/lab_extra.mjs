// QA independente F9 (game-qa): teste do laboratório em chrome-headless-shell via CDP, roteiro próprio.
// Não altera o lab. Uso: node qa_f9/scripts/lab_qa.mjs   (cwd = fase24-f9-labramon)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
for (const k of ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy', 'ALL_PROXY', 'all_proxy']) delete process.env[k];
process.env.NO_PROXY = process.env.no_proxy = '127.0.0.1,localhost';

const BASE = 'http://127.0.0.1:5198', PORT = 9534, OUT = 'qa_f9/regressao/lab_extra';
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
  const ok = (k, v) => { R.resultados[k] = v; console.log(k, JSON.stringify(v)); };
  const dir = d => `(document.querySelector('.dirSelect[data-p="0"]').value='${d}', document.querySelector('.dirSelect[data-p="0"]').dispatchEvent(new Event('change')))`;
  const pick = s => ({ state: s.state, rest: s.rest, combat: s.combat, label: s.label, src: (s.src||'').split('/').slice(-3).join('/') });
  try {
    let url; for (let i = 0; i < 100 && !url; i++) { try { url = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find(t => t.type === 'page')?.webSocketDebuggerUrl; } catch { } await sleep(200); }
    const c = new Cdp(url); await c.open();
    for (const m of ['Runtime.enable', 'Page.enable', 'Network.enable', 'Log.enable']) await c.send(m);
    await c.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 1500, deviceScaleFactor: 1, mobile: false });
    await c.send('Page.navigate', { url: `${BASE}/lab/index.html?qa=${Date.now()}` });
    for (let i = 0; i < 300; i++) { try { if (await c.ev('!!window.__labReady')) break; } catch { } await sleep(100); }
    await c.ev(HELPERS); await c.ev(dir('E')); await sleep(300);
    // L3: WASD deitado, Dormir a partir de deitado, Levantar
    const l3 = {};
    await c.ev(`__qa.click('deitar')`); await sleep(1300); l3.deitado = pick(await c.ev('__qa.st()'));
    l3.botao_deitar_rotulo = await c.ev(`document.querySelector('[data-ctrl="deitar"]').textContent`);
    await c.key('d', 'keyDown'); await sleep(400); l3.wasd_deitado = pick(await c.ev('__qa.st()')); await c.key('d', 'keyUp'); await sleep(200);
    await c.ev(`__qa.click('ataque')`); await sleep(300); l3.ataque_deitado = pick(await c.ev('__qa.st()'));
    await c.ev(`__qa.click('dormir')`); const tr = await c.ev('__qa.trace(900)'); l3.dormir_de_deitado_primeiros = tr.slice(0, 3).map(x => `${x.s}#${x.i} ${x.src}`);
    await sleep(2200); await c.ev(`__qa.click('acordar')`); await sleep(3300); l3.apos_acordar = pick(await c.ev('__qa.st()'));
    await c.ev(`__qa.click('deitar')`); await sleep(1300); await c.ev(`__qa.click('deitar')`); const tl = await c.ev('__qa.trace(1400)'); l3.levantar_trace = tl.map(x => `${x.t}:${x.s}#${x.i} ${x.src}`); l3.apos_levantar = pick(await c.ev('__qa.st()'));
    ok('L3', l3);
    // L6: dois avisos seguidos fora de E, depois ação real em E; rótulo ao longo de 2,5 s
    const l6 = {};
    await c.ev(dir('W')); await sleep(200); await c.ev(`__qa.click('feliz')`); await sleep(150); await c.ev(`__qa.click('carinho')`); await sleep(150);
    l6.aviso = (await c.ev('__qa.st()')).label;
    await c.ev(dir('E')); await sleep(150); await c.ev(`__qa.click('ataque')`);
    l6.rotulos = []; for (let i = 0; i < 6; i++) { await sleep(450); const s = await c.ev('__qa.st()'); l6.rotulos.push(`${(i+1)*450}ms: ${s.label} | ${s.state}`); }
    ok('L6', l6);
    // L7: Tamer no palco
    const l7 = {};
    l7.toggle_visivel = await c.ev(`!document.getElementById('tamerRefToggleWrap').hidden`);
    l7.largura_antes = await c.ev(`players[0].canvas.width`);
    await c.ev(`(()=>{const t=document.getElementById('tamerRefToggle'); if(!t.checked) t.click();})()`); await sleep(400);
    l7.largura_depois = await c.ev(`players[0].canvas.width`); l7.altura = await c.ev(`players[0].canvas.height`);
    // procura pixels do Tamer à direita do palco de 60 px e mede linha de chão (último y opaco) do Labramon e do Tamer
    l7.medida = await c.ev(`(()=>{const p=players[0];const W=p.canvas.width,H=p.canvas.height;const d=p.ctx.getImageData(0,0,W,H).data;let bl=-1,bt=-1,nt=0;for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(d[(y*W+x)*4+3]<255)continue;const bg=d[(y*W+x)*4]; if(x<60){} }
      const bgc=[d[0],d[1],d[2]];const isBg=(i)=>d[i]===bgc[0]&&d[i+1]===bgc[1]&&d[i+2]===bgc[2];
      for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;if(isBg(i))continue;if(x<60){if(y>bl)bl=y;}else{nt++;if(y>bt)bt=y;}}
      return {fundo:bgc, ultimo_y_labramon:bl, ultimo_y_tamer:bt, px_tamer:nt};})()`);
    await c.ev(`document.getElementById('zoomSelect').value='4'; document.getElementById('zoomSelect').dispatchEvent(new Event('change'))`); await sleep(300);
    await c.shot('L7_tamer_no_palco.png');
    ok('L7', l7);
    ok('console', { erros: c.console.filter(m => /error/.test(m.type)), excecoes: c.exc, falhas_rede: c.fail, http: c.http, labErrors: await c.ev('window.__labErrors') });
  } finally { proc.kill('SIGKILL'); fs.writeFileSync(`${OUT}/lab_extra_report.json`, JSON.stringify(R, null, 1)); }
}
main().catch(e => { console.error('FALHA', e); process.exit(1); });
