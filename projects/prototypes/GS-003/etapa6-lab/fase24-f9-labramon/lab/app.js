// F9 Fase 9 — Laboratório interativo do Labramon. JS puro, sem dependências, sem build.
// Carrega os PNGs reais via lab-data.js (gerado dos manifesto.json). Estados sem arte na direção
// ativa aparecem como INDISPONÍVEL — nunca são simulados nem desenhados por aproximação.
"use strict";

const DATA = window.LAB_DATA;
const PIVOT = DATA.pivot; // {x, y_chao}
const CANVAS_W = DATA.canvas[0], CANVAS_H = DATA.canvas[1];
const TAMER_GAP = 6; // px nativos entre o Labramon e o Tamer de referência, quando exibido no palco (L7)

// ---------- erro global (para o teste automatizado contar) ----------
window.__labErrors = [];
window.addEventListener("error", (e) => window.__labErrors.push(String(e.message || e.error || e)));
window.addEventListener("unhandledrejection", (e) => window.__labErrors.push("unhandledrejection: " + String(e.reason)));

// ---------- preload + status de assets ----------
const assetStatus = new Map(); // src -> 'loading'|'ok'|'erro'
const assetImg = new Map(); // src -> HTMLImageElement
function collectAllSrcs() {
  const set = new Set();
  const add = (s) => { if (s) set.add(s); };
  for (const dir of DATA.direcoesMovimento) {
    add(DATA.movement.standing[dir]?.frames?.[0]);
    (DATA.movement.idle[dir]?.frames || []).forEach(add);
    (DATA.movement.walk[dir]?.frames || []).forEach(add);
  }
  for (const grp of [DATA.emotions, DATA.rest, DATA.interactions, DATA.combat]) {
    for (const estado of Object.values(grp.estados)) {
      for (const clipe of Object.values(estado.clipes)) clipe.frames.forEach(add);
      if (estado.poseMestra) add(estado.poseMestra);
      if (estado.fx) estado.fx.frames.forEach(add);
    }
  }
  if (DATA.tamerRef) add(DATA.tamerRef.src);
  return [...set];
}
const ALL_SRCS = collectAllSrcs();

function preloadAll(onProgress) {
  let done = 0;
  return Promise.all(
    ALL_SRCS.map(
      (src) =>
        new Promise((resolve) => {
          assetStatus.set(src, "loading");
          const img = new Image();
          img.onload = () => { assetStatus.set(src, "ok"); assetImg.set(src, img); done++; onProgress?.(done, ALL_SRCS.length); resolve(); };
          img.onerror = () => { assetStatus.set(src, "erro"); done++; onProgress?.(done, ALL_SRCS.length); resolve(); };
          img.src = src;
        })
    )
  );
}

// ---------- análise ao vivo de quadro (bbox real + nº de cores) ----------
const analysisCache = new Map(); // src -> {w,h,bbox,colors,footY,semitransparentes}
const probeCanvas = document.createElement("canvas");
const probeCtx = probeCanvas.getContext("2d", { willReadFrequently: true });
function analyzeFrame(src) {
  if (analysisCache.has(src)) return analysisCache.get(src);
  const img = assetImg.get(src);
  if (!img || assetStatus.get(src) !== "ok") return null;
  const w = img.naturalWidth, h = img.naturalHeight;
  probeCanvas.width = w; probeCanvas.height = h;
  probeCtx.clearRect(0, 0, w, h);
  probeCtx.drawImage(img, 0, 0);
  let data;
  try { data = probeCtx.getImageData(0, 0, w, h).data; } catch { return null; }
  let x0 = w, y0 = h, x1 = -1, y1 = -1, semit = 0;
  const colors = new Set();
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const a = data[i + 3];
      if (a === 0) continue;
      if (a !== 255) semit++;
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
      colors.add(data[i] + "," + data[i + 1] + "," + data[i + 2] + "," + a);
    }
  }
  const result = {
    w, h,
    bbox: x1 >= 0 ? { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 } : null,
    colors: colors.size,
    footY: y1,
    semitransparentes: semit,
  };
  analysisCache.set(src, result);
  return result;
}

// ---------- disponibilidade (nunca simula; só reporta) ----------
function emotionsAvail(dir) { return dir === "E"; }
function restAvail(dir) { return dir === "E"; }
function interactionsAvail(dir) { return dir === "E"; }
function combatAvail(dir) { return dir === "E"; }
function movementAvail(dir) { return DATA.direcoesMovimento.includes(dir); }

// ---------- player (uma instância por painel) ----------
class ClipPlayer {
  constructor(id) {
    this.id = id;
    this.canvas = document.getElementById("canvas" + id);
    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.direction = id === 0 ? "E" : "W";
    this.zoom = 2;
    this.bg = "transparente";
    this.showPivot = false;
    this.paused = false;
    this.clip = null; // {frames, durations, cum, totalMs, loop}
    this.fx = null;
    this.fxSchedule = null;
    this.stateName = "idle";
    this.startTime = 0;
    this.frameIndex = 0;
    this.fxIndex = null;
    this.done = true;
    this.onDone = null;
    this.frameCountTick = 0; this.lastFpsT = performance.now(); this.fps = 0;
    this.restState = "despertou"; // despertou | deitado | dormindo
    this.combatState = "normal"; // normal | incapacitado
    this.activeToggle = null; // feliz/triste/irritado/assustado/carinho (quando em loop, para 2º clique = saida)
    this.showTamerRef = false; // L7: Tamer de referência desenhado dentro do palco (toggle)
    this._unavailableTimer = null; // L6: só um timeout de "INDISPONÍVEL" pendente por vez
    this._savedLabelBeforeUnavail = null;
    requestAnimationFrame((t) => this.loop(t));
  }

  setClip(seq, { loop = false, onDone = null, fx = null, stateName = null } = {}) {
    this.clip = {
      frames: seq.frames,
      durations: seq.durations,
      cum: cumulative(seq.durations),
      totalMs: seq.totalMs || seq.durations.reduce((s, x) => s + x, 0) || 1,
      loop,
    };
    this.fx = fx || null;
    this.fxSchedule = fx ? buildFxSchedule(fx) : null;
    this.onDone = onDone;
    if (stateName) this.stateName = stateName;
    this.startTime = performance.now();
    this.frameIndex = 0;
    this.fxIndex = null;
    this.done = false;
    this.render();
  }

  holdStatic(src, stateName) {
    this.setClip({ frames: [src], durations: [0], totalMs: 1 }, { loop: false, stateName });
    this.done = true; // segura sem avançar
  }

  loop(now) {
    this.frameCountTick++;
    if (now - this.lastFpsT >= 500) { this.fps = Math.round((this.frameCountTick * 1000) / (now - this.lastFpsT)); this.frameCountTick = 0; this.lastFpsT = now; }
    if (this.clip && !this.paused && !this.done) {
      const elapsed = now - this.startTime;
      const total = this.clip.totalMs;
      let idx;
      if (this.clip.loop) {
        const t = elapsed % total;
        idx = findIdx(this.clip.cum, t);
      } else {
        if (elapsed >= total) {
          idx = this.clip.durations.length - 1;
          this.frameIndex = idx;
          this.fxIndex = this.fxSchedule ? fxIdxAt(this.fxSchedule, total) : null;
          this.render();
          this.done = true;
          const cb = this.onDone; this.onDone = null;
          if (cb) cb();
          requestAnimationFrame((t2) => this.loop(t2));
          return;
        }
        idx = findIdx(this.clip.cum, elapsed);
      }
      this.frameIndex = idx;
      this.fxIndex = this.fxSchedule ? fxIdxAt(this.fxSchedule, elapsed) : null;
      this.render();
    }
    requestAnimationFrame((t2) => this.loop(t2));
  }

  stepFrame(delta) {
    if (!this.clip) return;
    this.paused = true;
    this.frameIndex = Math.max(0, Math.min(this.clip.durations.length - 1, this.frameIndex + delta));
    this.render();
  }

  resume() {
    if (!this.clip) return;
    this.paused = false;
    // retoma a partir do quadro atual, sem saltar
    this.startTime = performance.now() - (this.clip.cum[this.frameIndex - 1] || 0);
    this.done = false;
  }

  render() {
    if (!this.clip) return;
    const src = this.clip.frames[this.frameIndex];
    const img = assetImg.get(src);
    const wide = !!this.fx;
    let w = wide ? Math.max(CANVAS_W, this.fx.canvas[0]) : CANVAS_W;
    const h = CANVAS_H;
    // L7: Tamer de referência desenhado no próprio palco, ao lado do Labramon, alinhado pelo chão.
    // Arquivo original não é tocado: só lido via assetImg (mesmo preload de todo o resto) e composto no canvas.
    let tamerDraw = null;
    if (this.showTamerRef && DATA.tamerRef) {
      const tSrc = DATA.tamerRef.src;
      const tImg = assetImg.get(tSrc);
      if (tImg && assetStatus.get(tSrc) === "ok") {
        const an = analyzeFrame(tSrc);
        const footY = an?.bbox ? an.bbox.y1 : tImg.naturalHeight - 1;
        const x = w + TAMER_GAP;
        const y = PIVOT.y_chao - footY;
        tamerDraw = { img: tImg, x, y };
        w = x + tImg.naturalWidth;
      }
    }
    if (this.canvas.width !== w || this.canvas.height !== h) { this.canvas.width = w; this.canvas.height = h; }
    this.ctx.clearRect(0, 0, w, h);
    if (img && assetStatus.get(src) === "ok") this.ctx.drawImage(img, 0, 0);
    if (this.fx && this.fxIndex != null) {
      const fxSrc = this.fx.frames[this.fxIndex];
      const fxImg = assetImg.get(fxSrc);
      if (fxImg && assetStatus.get(fxSrc) === "ok") this.ctx.drawImage(fxImg, 0, 0);
    }
    if (tamerDraw) this.ctx.drawImage(tamerDraw.img, tamerDraw.x, tamerDraw.y);
    if (this.showPivot) this.drawPivot(w, h);
    const stageEl = document.getElementById("canvas" + this.id).parentElement;
    stageEl.style.width = w * this.zoom + "px";
    stageEl.style.height = h * this.zoom + "px";
    this.canvas.style.width = w * this.zoom + "px";
    this.canvas.style.height = h * this.zoom + "px";
    updateDiagnostics(this);
  }

  drawPivot(w, h) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = "#ff3b3b";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(PIVOT.x - 3, PIVOT.y_chao); ctx.lineTo(PIVOT.x + 3, PIVOT.y_chao);
    ctx.moveTo(PIVOT.x, PIVOT.y_chao - 3); ctx.lineTo(PIVOT.x, PIVOT.y_chao + 3);
    ctx.stroke();
    // colisão: proposta do laboratório [H] — elipse de contato no pé, não há caixa oficial da produção
    ctx.strokeStyle = "rgba(111,177,255,0.8)";
    ctx.beginPath();
    ctx.ellipse(PIVOT.x, PIVOT.y_chao - 1, 9, 3, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function reversedClip(clip) {
  // usado só para "levantar" a partir de deitado (lie_to_stand): toca stand_to_lie ao contrário,
  // sem gerar nem tocar em nenhum pixel novo (L3).
  return { frames: [...clip.frames].reverse(), durations: [...clip.durations].reverse(), totalMs: clip.totalMs };
}

function cumulative(durations) {
  let acc = 0; const out = [];
  for (const d of durations) { acc += d; out.push(acc); }
  return out;
}
function findIdx(cum, t) {
  for (let i = 0; i < cum.length; i++) if (t < cum[i]) return i;
  return cum.length - 1;
}
function buildFxSchedule(fx) {
  let t = 0; const sched = [];
  for (const e of fx.timeline) {
    if (e.quadro_fx !== null && e.quadro_fx !== undefined) sched.push({ start: t, end: t + e.ms, frame: e.quadro_fx });
    t += e.ms;
  }
  return sched;
}
function fxIdxAt(sched, t) {
  for (const s of sched) if (t >= s.start && t < s.end) return s.frame;
  if (sched.length && t >= sched[sched.length - 1].start) return sched[sched.length - 1].frame;
  return null;
}

// ---------- players ----------
const players = [new ClipPlayer(0), new ClipPlayer(1)];

function idleFallback(p) {
  const dir = p.direction;
  if (movementAvail(dir)) p.setClip(DATA.movement.idle[dir], { loop: true, stateName: "idle" });
}

// ---------- controles (estado => sequência real; nada simulado) ----------
function requireE(p, nomeEstado) {
  if (p.direction !== "E") {
    flashUnavailable(p, `${nomeEstado} só existe em E`);
    return false;
  }
  return true;
}
// L1-L3: outras ações só com o Labramon em pé (despertou + normal); senão, bloqueia com aviso
// (em vez de tocar a transição a partir de uma pose errada) até a transição de volta ser tocada.
function requireStanding(p, nomeAcao) {
  if (p.combatState === "incapacitado") { flashUnavailable(p, `${nomeAcao}: toque Recuperação primeiro`); return false; }
  if (p.restState === "dormindo") { flashUnavailable(p, `${nomeAcao}: toque Acordar primeiro`); return false; }
  if (p.restState === "deitado") { flashUnavailable(p, `${nomeAcao}: toque Deitar/Levantar primeiro`); return false; }
  return true;
}
// L6: um único timeout pendente por painel; cancelado sempre que um rótulo real é escrito (label()),
// para que uma restauração atrasada nunca sobrescreva um estado legítimo mais recente.
function flashUnavailable(p, mensagem) {
  const lbl = document.getElementById("stateLabel" + p.id);
  if (p._unavailableTimer) { clearTimeout(p._unavailableTimer); p._unavailableTimer = null; }
  if (p._savedLabelBeforeUnavail == null) p._savedLabelBeforeUnavail = lbl.textContent;
  lbl.textContent = `INDISPONÍVEL (${mensagem})`;
  lbl.style.color = "var(--danger)";
  p._unavailableTimer = setTimeout(() => {
    lbl.textContent = p._savedLabelBeforeUnavail;
    lbl.style.color = "";
    p._savedLabelBeforeUnavail = null;
    p._unavailableTimer = null;
  }, 1800);
}

const CTRL = {
  standing(p) {
    const dir = p.direction;
    if (!movementAvail(dir)) return flashUnavailable(p, "standing (sem arte de movimento nesta direção)");
    if (!requireStanding(p, "standing")) return;
    p.activeToggle = null;
    p.holdStatic(DATA.movement.standing[dir].frames[0], "standing");
    label(p, "standing");
  },
  idle(p) {
    const dir = p.direction;
    if (!movementAvail(dir)) return flashUnavailable(p, "idle (sem arte de movimento nesta direção)");
    if (!requireStanding(p, "idle")) return;
    p.activeToggle = null;
    p.setClip(DATA.movement.idle[dir], { loop: true, stateName: "idle" });
    label(p, "idle");
  },
  feliz: emotionToggle("happy", "feliz"),
  triste: emotionToggle("sad", "triste"),
  irritado: emotionToggle("angry", "irritado"),
  assustado: emotionToggle("scared", "assustado"),
  carinho: emotionToggle("petting", "carinho", DATA.interactions),

  comemoracao(p) {
    if (!requireE(p, "comemoração")) return;
    if (!requireStanding(p, "comemoração")) return;
    p.activeToggle = null;
    const clip = DATA.interactions.estados.celebrate.clipes.comemoracao;
    p.setClip(clip, { loop: false, stateName: "comemoracao", onDone: () => idleFallback(p) });
    label(p, "comemoracao");
  },

  deitar(p) {
    if (!requireE(p, "deitar")) return;
    if (p.combatState === "incapacitado") return flashUnavailable(p, "deitar: toque Recuperação primeiro");
    if (p.restState === "dormindo") return flashUnavailable(p, "deitar: toque Acordar primeiro");
    p.activeToggle = null;
    if (p.restState === "deitado") {
      // 2º clique com deitado: levanta (lie_to_stand = stand_to_lie ao contrário; sem arte nova) — L3.
      const clip = reversedClip(DATA.rest.estados.rest.clipes.stand_to_lie);
      p.setClip(clip, {
        loop: false, stateName: "levantando (lie_to_stand)",
        onDone: () => { p.restState = "despertou"; idleFallback(p); updateRestButtons(p); },
      });
      label(p, "levantando");
      updateRestButtons(p);
      return;
    }
    const clip = DATA.rest.estados.rest.clipes.stand_to_lie;
    p.setClip(clip, {
      loop: false, stateName: "deitar",
      onDone: () => { p.restState = "deitado"; p.holdStatic(clip.frames[clip.frames.length - 1], "deitado (parado — sem loop de repouso acordado na produção)"); updateRestButtons(p); },
    });
    label(p, "deitar");
    updateRestButtons(p);
  },
  dormir(p) {
    if (!requireE(p, "dormir")) return;
    if (p.combatState === "incapacitado") return flashUnavailable(p, "dormir: toque Recuperação primeiro");
    if (p.restState === "dormindo") return flashUnavailable(p, "dormir: já está dormindo (toque Acordar)");
    p.activeToggle = null;
    const goSleep = () => {
      const clip = DATA.rest.estados.rest.clipes.lie_to_sleep;
      p.setClip(clip, {
        loop: false, stateName: "adormecendo",
        onDone: () => {
          p.restState = "dormindo";
          p.setClip(DATA.rest.estados.rest.clipes.sleep_loop, { loop: true, stateName: "dormindo (loop)" });
          updateRestButtons(p);
        },
      });
    };
    if (p.restState === "despertou") {
      // auto-encadeado: em pé -> deitado -> dormir (documentado; são clipes reais, não inventados)
      const clip = DATA.rest.estados.rest.clipes.stand_to_lie;
      p.setClip(clip, { loop: false, stateName: "deitar (auto, antes de dormir)", onDone: () => { p.restState = "deitado"; goSleep(); } });
    } else {
      goSleep();
    }
    label(p, "dormir");
  },
  acordar(p) {
    if (!requireE(p, "acordar")) return;
    if (p.restState !== "dormindo") return flashUnavailable(p, "acordar (só dormindo)");
    const wake = DATA.rest.estados.rest.clipes.sleep_to_wake;
    p.setClip(wake, {
      loop: false, stateName: "acordando",
      onDone: () => {
        const stand = DATA.rest.estados.rest.clipes.wake_to_stand;
        p.setClip(stand, { loop: false, stateName: "levantando", onDone: () => { p.restState = "despertou"; idleFallback(p); updateRestButtons(p); } });
      },
    });
    label(p, "acordar");
    updateRestButtons(p);
  },

  ataque(p) {
    if (!requireE(p, "ataque")) return;
    if (!requireStanding(p, "ataque")) return;
    p.activeToggle = null;
    const estado = DATA.combat.estados.attack_retriever_bark;
    p.setClip(estado.clipes.ataque, { loop: false, stateName: "ataque (retriever bark)", fx: estado.fx, onDone: () => idleFallback(p) });
    label(p, "ataque");
  },
  dano(p) {
    if (!requireE(p, "receber dano")) return;
    if (!requireStanding(p, "receber dano")) return;
    p.activeToggle = null;
    const clip = DATA.combat.estados.hurt.clipes.dano;
    p.setClip(clip, { loop: false, stateName: "dano", onDone: () => idleFallback(p) });
    label(p, "dano");
  },
  incapacitacao(p) {
    if (!requireE(p, "incapacitação")) return;
    if (!requireStanding(p, "incapacitação")) return;
    p.activeToggle = null;
    const inc = DATA.combat.estados.incapacitated;
    p.setClip(inc.clipes.queda, {
      loop: false, stateName: "incapacitando (queda)",
      onDone: () => { p.combatState = "incapacitado"; p.setClip(inc.clipes.estado, { loop: true, stateName: "incapacitado (loop)" }); updateCombatButtons(p); },
    });
    label(p, "incapacitacao");
    updateCombatButtons(p);
  },
  recuperacao(p) {
    if (!requireE(p, "recuperação")) return;
    if (p.combatState !== "incapacitado") return flashUnavailable(p, "recuperação (só incapacitado)");
    const clip = DATA.combat.estados.incapacitated.clipes.recuperacao;
    p.setClip(clip, { loop: false, stateName: "recuperação", onDone: () => { p.combatState = "normal"; idleFallback(p); updateCombatButtons(p); } });
    label(p, "recuperacao");
    updateCombatButtons(p);
  },
};

// L4: qualquer ação real (ataque, emoção, deitar...) encerra uma caminhada pendente do painel dela,
// para que o setTimeout de 900 ms do botão de walk nunca corte a ação seguinte.
for (const _k of Object.keys(CTRL)) {
  const _orig = CTRL[_k];
  CTRL[_k] = function (p) { if (activeWalk && activeWalk.p === p) activeWalk = null; return _orig(p); };
}

function emotionToggle(estadoId, nome, grupo = DATA.emotions) {
  return function (p) {
    if (!requireE(p, nome)) return;
    const estado = grupo.estados[estadoId];
    if (p.activeToggle === estadoId) {
      p.activeToggle = null;
      p.setClip(estado.clipes.saida, { loop: false, stateName: nome + " (saída)", onDone: () => idleFallback(p) });
      label(p, nome, false);
    } else {
      if (!requireStanding(p, nome)) return;
      p.activeToggle = estadoId;
      p.setClip(estado.clipes.entrada, {
        loop: false, stateName: nome + " (entrada)",
        onDone: () => { if (p.activeToggle === estadoId) p.setClip(estado.clipes.loop, { loop: true, stateName: nome + " (loop)" }); },
      });
      label(p, nome, true);
    }
  };
}

function label(p, name, active) {
  if (p._unavailableTimer) { clearTimeout(p._unavailableTimer); p._unavailableTimer = null; p._savedLabelBeforeUnavail = null; } // L6
  document.getElementById("stateLabel" + p.id).textContent = name;
  document.getElementById("stateLabel" + p.id).style.color = "";
  document.querySelectorAll(`.ctrl-btn[data-p="${p.id}"]`).forEach((b) => b.classList.remove("active-toggle"));
  if (active) {
    const btn = document.querySelector(`.ctrl-btn[data-p="${p.id}"][data-ctrl="${name}"]`);
    if (btn) btn.classList.add("active-toggle");
  }
}

function updateRestButtons(p) {
  if (p.id !== 0) return; // botões globais seguem o painel 0
  const emE = p.direction === "E";
  const deitarBtn = document.querySelector('[data-ctrl="deitar"]');
  deitarBtn.textContent = p.restState === "deitado" ? "Levantar" : "Deitar"; // L3
  deitarBtn.disabled = !emE || p.restState === "dormindo" || p.combatState === "incapacitado";
  document.querySelector('[data-ctrl="dormir"]').disabled = !emE || p.restState === "dormindo" || p.combatState === "incapacitado";
  document.querySelector('[data-ctrl="acordar"]').disabled = !(emE && p.restState === "dormindo");
}
function updateCombatButtons(p) {
  if (p.id !== 0) return;
  document.querySelector('[data-ctrl="recuperacao"]').disabled = !(p.direction === "E" && p.combatState === "incapacitado");
}

// ---------- caminhada WASD ----------
const KEY_DIR = { w: "N", a: "W", s: "S", d: "E" };
let activeWalk = null; // {p, dir}
function startWalk(p, dir) {
  if (!movementAvail(dir)) return;
  if (!requireStanding(p, "caminhar")) return; // L3: sem WASD/andar fora de pé
  p.direction = dir;
  syncDirSelect(p);
  if (activeWalk && activeWalk.p === p && activeWalk.dir === dir) return;
  activeWalk = { p, dir };
  p.activeToggle = null;
  const cadence = Number(document.getElementById("cadenceInput").value) || 100;
  const base = DATA.movement.walk[dir];
  const durations = new Array(base.durations.length).fill(cadence);
  p.setClip({ frames: base.frames, durations, totalMs: durations.reduce((s, x) => s + x, 0), medidasProducao: base.medidasProducao }, { loop: true, stateName: "walk " + dir });
  label(p, "walk " + dir);
  updateCadenceInfo(dir, cadence);
}
function stopWalk(p) {
  if (!activeWalk || activeWalk.p !== p) return;
  activeWalk = null;
  CTRL.idle(p);
}
// L5: pilha de teclas seguras — soltar uma tecla volta para a direção da tecla ainda segurada,
// em vez de ir direto para idle enquanto outra ainda está pressionada.
const heldDirKeys = [];
document.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (!KEY_DIR[k] || e.repeat) return;
  if (!heldDirKeys.includes(k)) heldDirKeys.push(k);
  startWalk(players[0], KEY_DIR[k]);
});
document.addEventListener("keyup", (e) => {
  const k = e.key.toLowerCase();
  if (!KEY_DIR[k]) return;
  const idx = heldDirKeys.indexOf(k);
  if (idx !== -1) heldDirKeys.splice(idx, 1);
  if (heldDirKeys.length) startWalk(players[0], KEY_DIR[heldDirKeys[heldDirKeys.length - 1]]);
  else stopWalk(players[0]);
});
window.addEventListener("blur", () => { heldDirKeys.length = 0; stopWalk(players[0]); });

function updateCadenceInfo(dir, cadence) {
  const med = DATA.movement.walk[dir]?.medidasProducao;
  const recoil = med?.recuo_pe_apoio_px_quadro;
  let txt;
  if (recoil && typeof recoil === "object") {
    const speed = (recoil.media / cadence) * 1000;
    txt = `[E] recuo medido na Fase 4 (dir. ${dir}): média ${recoil.media} px/quadro (min ${recoil.min}, max ${recoil.max}). Com cadência ${cadence} ms/quadro → velocidade aproximada ${speed.toFixed(1)} px/s.`;
  } else {
    txt = `[H] dir. ${dir} sem recuo lateral medido (frente/costas); cadência ${cadence} ms/quadro usada sem correção.`;
  }
  document.getElementById("cadenceInfo").textContent = txt;
}

// ---------- wiring de botões/estado ----------
document.querySelectorAll(".ctrl-btn[data-ctrl]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const ctrl = btn.dataset.ctrl;
    const pIdx = Number(btn.dataset.p || 0);
    const p = players[pIdx];
    if (ctrl === "walk") {
      const dir = btn.dataset.dir;
      startWalk(p, dir);
      setTimeout(() => stopWalk(p), 900); // clique = um trecho curto de caminhada
      return;
    }
    CTRL[ctrl]?.(p);
  });
});

document.querySelectorAll(".dirSelect").forEach((sel) => {
  sel.addEventListener("change", () => {
    const p = players[Number(sel.dataset.p)];
    p.direction = sel.value;
    p.activeToggle = null;
    p.restState = "despertou";
    p.combatState = "normal";
    idleFallback(p);
    label(p, "idle");
    if (p.id === 0) { updateRestButtons(p); updateCombatButtons(p); }
    renderAvailTable();
  });
});
function syncDirSelect(p) {
  document.querySelector(`.dirSelect[data-p="${p.id}"]`).value = p.direction;
}

document.getElementById("zoomSelect").addEventListener("change", (e) => { players.forEach((p) => { p.zoom = Number(e.target.value); p.render(); }); });
document.getElementById("bgSelect").addEventListener("change", (e) => {
  for (const id of [0, 1]) document.getElementById("stageBg" + id).className = "stage-bg bg-" + e.target.value;
});
document.getElementById("pivotToggle").addEventListener("change", (e) => { players.forEach((p) => { p.showPivot = e.target.checked; p.render(); }); });
document.getElementById("compareToggle").addEventListener("change", (e) => { document.getElementById("panel1").hidden = !e.target.checked; });
document.getElementById("playPauseBtn").addEventListener("click", (e) => {
  const anyPaused = players[0].paused;
  players.forEach((p) => (anyPaused ? p.resume() : (p.paused = true)));
  e.target.textContent = anyPaused ? "Pausar" : "Retomar";
});
document.getElementById("prevFrameBtn").addEventListener("click", () => { players.forEach((p) => p.stepFrame(-1)); document.getElementById("playPauseBtn").textContent = "Retomar"; });
document.getElementById("nextFrameBtn").addEventListener("click", () => { players.forEach((p) => p.stepFrame(1)); document.getElementById("playPauseBtn").textContent = "Retomar"; });
document.getElementById("cadenceInput").addEventListener("change", (e) => { if (activeWalk) updateCadenceInfo(activeWalk.dir, Number(e.target.value)); });

// ---------- diagnóstico ----------
function updateDiagnostics(p) {
  if (p.id !== 0) return; // painel 0 é o diagnóstico principal
  const src = p.clip.frames[p.frameIndex];
  const status = assetStatus.get(src) || "desconhecido";
  const an = status === "ok" ? analyzeFrame(src) : null;
  document.getElementById("dState").textContent = p.stateName;
  document.getElementById("dDir").textContent = p.direction;
  document.getElementById("dFrame").textContent = `${p.frameIndex + 1}/${p.clip.frames.length}`;
  document.getElementById("dFps").textContent = p.fps;
  document.getElementById("dDuration").textContent = `${p.clip.totalMs} ms total (quadro: ${p.clip.durations[p.frameIndex]} ms)`;
  document.getElementById("dDims").textContent = an?.bbox ? `${an.bbox.w}×${an.bbox.h} px (canvas ${an.w}×${an.h})` : an ? "sem pixels opacos" : "—";
  const footOk = an?.bbox ? an.bbox.y1 === PIVOT.y_chao : null;
  document.getElementById("dAnchor").textContent = `pivô (${PIVOT.x}, ${PIVOT.y_chao})` + (footOk === null ? "" : footOk ? " — pé em y_chão ✓" : ` — pé medido em y=${an.bbox.y1} (≠ ${PIVOT.y_chao})`);
  document.getElementById("dColors").textContent = an ? `${an.colors}${an.semitransparentes ? " (" + an.semitransparentes + " px semitransparentes)" : ""}` : "—";
  document.getElementById("dAssetStatus").textContent = `${src} → ${status}`;
}

function renderAvailTable() {
  const rows = [
    ["standing/idle/walk", (d) => movementAvail(d)],
    ["feliz/triste/irritado/assustado", (d) => emotionsAvail(d)],
    ["deitar/dormir/acordar", (d) => restAvail(d)],
    ["carinho/comemoração", (d) => interactionsAvail(d)],
    ["ataque/dano/incapacitação/recuperação", (d) => combatAvail(d)],
  ];
  const dirs = DATA.direcoesMovimento;
  let html = "<tr><th>Grupo</th>" + dirs.map((d) => `<th>${d}</th>`).join("") + "</tr>";
  for (const [label, fn] of rows) {
    html += `<tr><th>${label}</th>` + dirs.map((d) => `<td class="${fn(d) ? "yes" : "no"}">${fn(d) ? "disponível" : "INDISPONÍVEL"}</td>`).join("") + "</tr>";
  }
  document.getElementById("availTable").innerHTML = html;
}

function renderAssetSummary() {
  let ok = 0, erro = 0;
  for (const s of ALL_SRCS) { const st = assetStatus.get(s); if (st === "ok") ok++; else if (st === "erro") erro++; }
  const el = document.getElementById("assetSummary");
  el.innerHTML = `${ok}/${ALL_SRCS.length} carregados` + (erro ? ` · <span class="err">${erro} com erro</span>` : "");
  window.__labAssetSummary = { total: ALL_SRCS.length, ok, erro, errSrcs: ALL_SRCS.filter((s) => assetStatus.get(s) === "erro") };
}

// ---------- Tamer de referência (L7: dentro do palco, não mais numa seção à parte) ----------
if (DATA.tamerRef) {
  document.getElementById("tamerRefToggleWrap").hidden = false;
  document.getElementById("tamerRefNote").hidden = false;
  document.getElementById("tamerRefToggle").addEventListener("change", (e) => {
    players.forEach((p) => { p.showTamerRef = e.target.checked; p.render(); });
  });
}

// ---------- boot ----------
renderAvailTable();
preloadAll((done, total) => {
  renderAssetSummary();
  document.getElementById("assetSummary").textContent += ` (${done}/${total})`;
}).then(() => {
  renderAssetSummary();
  idleFallback(players[0]);
  idleFallback(players[1]);
  label(players[0], "idle");
  label(players[1], "idle");
  updateRestButtons(players[0]);
  updateCombatButtons(players[0]);
  window.__labReady = true;
});

// ---------- self-test exposto para o teste automatizado (Fase 9) ----------
window.__labSelfTest = async function () {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const report = { checks: [], errorsBefore: window.__labErrors.length };
  const p = players[0];
  const check = async (name, fn) => {
    try {
      fn();
      await sleep(180);
      const src = p.clip?.frames?.[p.frameIndex];
      const ok = !!(src && assetStatus.get(src) === "ok");
      report.checks.push({ name, ok, state: p.stateName, src });
    } catch (e) {
      report.checks.push({ name, ok: false, error: String(e) });
    }
  };
  for (const dir of DATA.direcoesMovimento) {
    p.direction = dir; syncDirSelect(p);
    await check(`standing-${dir}`, () => CTRL.standing(p));
    await check(`idle-${dir}`, () => CTRL.idle(p));
    await check(`walk-${dir}`, () => startWalk(p, dir));
    stopWalk(p);
  }
  p.direction = "E"; syncDirSelect(p); p.restState = "despertou"; p.combatState = "normal";
  await check("feliz", () => CTRL.feliz(p));
  await sleep(250);
  await check("feliz-saida", () => CTRL.feliz(p)); // 2º clique = saída
  await check("triste", () => CTRL.triste(p));
  await sleep(250); CTRL.triste(p);
  await check("irritado", () => CTRL.irritado(p));
  await sleep(250); CTRL.irritado(p);
  await check("assustado", () => CTRL.assustado(p));
  await sleep(250); CTRL.assustado(p);
  await check("deitar", () => CTRL.deitar(p));
  await sleep(900);
  await check("dormir", () => CTRL.dormir(p));
  await sleep(1300); // lie_to_sleep (1200 ms) precisa terminar antes de acordar valer
  await check("acordar", () => CTRL.acordar(p));
  await sleep(3000); // sleep_to_wake (1920 ms) + wake_to_stand (980 ms), com margem
  await check("carinho", () => CTRL.carinho(p));
  await sleep(250); CTRL.carinho(p);
  await check("comemoracao", () => CTRL.comemoracao(p));
  await sleep(700);
  await check("ataque", () => CTRL.ataque(p));
  await sleep(900);
  await check("dano", () => CTRL.dano(p));
  await sleep(700);
  await check("incapacitacao", () => CTRL.incapacitacao(p));
  await sleep(800); // queda (720 ms), com margem
  await check("recuperacao", () => CTRL.recuperacao(p));
  await sleep(1200); // recuperacao (1130 ms), com margem
  // Indisponibilidade: tentar emoção fora de E deve marcar INDISPONÍVEL, não simular
  p.direction = "W"; syncDirSelect(p);
  CTRL.feliz(p);
  const stillWalkState = p.stateName;
  report.indisponibilidadeOk = stillWalkState !== "feliz (entrada)" && stillWalkState !== "feliz (loop)";
  p.direction = "E"; syncDirSelect(p); idleFallback(p); label(p, "idle");

  // ---- casos novos para os defeitos L1-L7 corrigidos (F9 correções do laboratório) ----
  const Lchecks = [];
  const assertL = (name, ok, extra) => Lchecks.push({ name, ok, ...(extra || {}) });

  // L1: atacar enquanto dormindo tem que ficar bloqueado, sem saltar o estado nem o botão Acordar.
  p.restState = "despertou"; p.combatState = "normal";
  await check("l1-deitar", () => CTRL.deitar(p));
  await sleep(900);
  await check("l1-dormir", () => CTRL.dormir(p));
  await sleep(1300);
  assertL("L1-dormindo-antes-do-teste", p.restState === "dormindo");
  CTRL.ataque(p);
  await sleep(200);
  assertL("L1-ataque-bloqueado-dormindo", p.restState === "dormindo" && p.stateName !== "ataque (retriever bark)", { restState: p.restState, stateName: p.stateName });
  await check("l1-acordar", () => CTRL.acordar(p));
  await sleep(3000);
  assertL("L1-acordar-completo", p.restState === "despertou", { restState: p.restState });

  // L2: emoção durante a incapacitação também fica bloqueada; recuperação volta ao normal.
  await check("l2-incapacitar", () => CTRL.incapacitacao(p));
  await sleep(800);
  assertL("L2-incapacitado-antes-do-teste", p.combatState === "incapacitado");
  CTRL.feliz(p);
  await sleep(200);
  assertL("L2-emocao-bloqueada-incapacitado", p.combatState === "incapacitado" && p.stateName !== "feliz (entrada)", { combatState: p.combatState, stateName: p.stateName });
  await check("l2-recuperacao", () => CTRL.recuperacao(p));
  await sleep(1200);
  assertL("L2-recuperacao-completa", p.combatState === "normal", { combatState: p.combatState });

  // L3: WASD/qualquer ação com o Labramon deitado fica bloqueado; 2º clique em Deitar levanta
  // (lie_to_stand = stand_to_lie ao contrário, sem arte nova).
  await check("l3-deitar", () => CTRL.deitar(p));
  await sleep(900);
  assertL("L3-deitado-antes-do-teste", p.restState === "deitado");
  startWalk(p, "E");
  await sleep(150);
  assertL("L3-walk-bloqueado-deitado", p.restState === "deitado" && p.stateName !== "walk E", { restState: p.restState, stateName: p.stateName });
  await check("l3-deitar-levanta", () => CTRL.deitar(p));
  await sleep(900);
  assertL("L3-levantou", p.restState === "despertou", { restState: p.restState });

  // L4: clique no botão de walk (com o setTimeout de 900 ms) não pode cortar a ação seguinte para idle.
  startWalk(p, "E");
  { const tok = activeWalk; setTimeout(() => { if (activeWalk === tok) stopWalk(p); }, 900); }
  await sleep(300);
  await check("l4-ataque-apos-clique-walk", () => CTRL.ataque(p));
  await sleep(650); // ~950 ms desde o início do walk: logo após os 900 ms do antigo timeout do botão,
  // mas antes do fim natural do ataque (860 ms desde o seu próprio início em t=300ms => ~1160ms)
  assertL("L4-walk-nao-corta-ataque", p.stateName === "ataque (retriever bark)", { stateName: p.stateName });
  await sleep(500);

  // L5: segurar D, apertar A, soltar D -> continua andando W (pilha de teclas), só vai para idle
  // quando TODAS as teclas de direção são soltas.
  const _kd = (k) => document.dispatchEvent(new KeyboardEvent("keydown", { key: k }));
  const _ku = (k) => document.dispatchEvent(new KeyboardEvent("keyup", { key: k }));
  _kd("d"); await sleep(150);
  _kd("a"); await sleep(150);
  _ku("d"); await sleep(150);
  assertL("L5-pilha-wasd-continua-andando", p.stateName === "walk W", { stateName: p.stateName });
  _ku("a"); await sleep(200);
  assertL("L5-pilha-wasd-solta-tudo-vira-idle", p.stateName === "idle", { stateName: p.stateName });

  // L6: cliques seguidos fora de E (rótulo "INDISPONÍVEL" duas vezes) não podem prender o rótulo
  // por cima de uma ação real feita logo depois.
  p.direction = "W"; syncDirSelect(p);
  CTRL.feliz(p); await sleep(200);
  CTRL.feliz(p); await sleep(100);
  p.direction = "E"; syncDirSelect(p);
  await check("l6-ataque-apos-flash", () => CTRL.ataque(p));
  await sleep(1900); // mais que os 1800 ms do timeout antigo do rótulo
  const _lbl6 = document.getElementById("stateLabel0").textContent;
  assertL("L6-rotulo-nao-preso", _lbl6 === "ataque", { label: _lbl6 }); // label() usa o nome curto ("ataque"), não o stateName interno
  await sleep(300);

  // L7: Tamer de referência tem que aparecer dentro do palco (canvas mais largo), sem alterar o PNG original.
  if (DATA.tamerRef) {
    const toggle = document.getElementById("tamerRefToggle");
    toggle.checked = true; toggle.dispatchEvent(new Event("change"));
    await sleep(200);
    assertL("L7-tamer-no-palco", p.canvas.width > CANVAS_W && assetStatus.get(DATA.tamerRef.src) === "ok", { canvasWidth: p.canvas.width, tamerStatus: assetStatus.get(DATA.tamerRef.src) });
    toggle.checked = false; toggle.dispatchEvent(new Event("change"));
  } else {
    assertL("L7-tamer-no-palco", false, { note: "DATA.tamerRef ausente" });
  }

  report.Lchecks = Lchecks;
  report.LfailedCount = Lchecks.filter((c) => !c.ok).length;

  // reset final, estado padrão
  p.restState = "despertou"; p.combatState = "normal";
  p.direction = "E"; syncDirSelect(p); idleFallback(p); label(p, "idle");

  report.errorsAfter = window.__labErrors.length;
  report.newErrors = window.__labErrors.slice(report.errorsBefore);
  report.assetSummary = window.__labAssetSummary;
  report.passed = report.checks.filter((c) => c.ok).length;
  report.failed = report.checks.filter((c) => !c.ok).length;
  window.__labSelfTestResult = report;
  return report;
};
