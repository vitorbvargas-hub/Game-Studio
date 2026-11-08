// Shell do navegador: relógio de parede, loop rAF com acumulador de tick fixo,
// save/load em localStorage e progresso offline. Toda regra de jogo está em src/sim/.

import { RAW_PACKS, defaultPackId, listPacks, loadPack } from "./packs";
import { allocateTraining, challengeBoss, chooseDecision, chooseEncounter, chooseEvolution, chooseStarter, newGame, step, travelTo } from "./sim/game";
import { applyOffline } from "./sim/offline";
import { loadFromStorage, saveKey, saveToStorage } from "./sim/save";
import { fmt } from "./sim/strings";
import type { GameEvent, GameState } from "./sim/types";
import { BattleRenderer } from "./render/renderer";
import { Hud } from "./ui/hud";
import "./style.css";

const AUTOSAVE_MS = 10_000;
const MAX_STEPS_PER_FRAME = 240; // evita "espiral da morte"; ausências longas vão pelo caminho offline
const OFFLINE_ON_RETURN_MS = 5_000;

const params = new URLSearchParams(location.search);
// Pacote escolhido por ?pack=<id>; senão o marcado como default em pack.json.
const packId = RAW_PACKS[params.get("pack") ?? ""] ? params.get("pack")! : defaultPackId();
const content = loadPack(packId);
const storage = window.localStorage;

function boot(): GameState {
  const res = loadFromStorage(storage, packId);
  if (res.ok) return res.state;
  if (res.reason !== "empty") console.warn("Save não carregado:", res.reason, res.detail);
  return newGame(content, (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0, Date.now());
}

let state = boot();
let speed = 1;
const canvas = document.querySelector<HTMLCanvasElement>("#view")!;
const renderer = new BattleRenderer(canvas, content);
document.documentElement.style.setProperty("--bg", content.theme.palette.bg);
document.documentElement.style.setProperty("--ui", content.theme.palette.ui);
document.documentElement.style.setProperty("--accent", content.theme.palette.accent);
document.documentElement.style.setProperty("--text", content.theme.palette.text);
document.title = fmt(content.strings, "title");

const hud = new Hud(document.querySelector<HTMLElement>("#hud")!, content, listPacks(), {
  challengeBoss: () => dispatch(() => challengeBoss(content, state)),
  chooseDecision: (i) => dispatch(() => chooseDecision(content, state, i)),
  chooseEvolution: (uid, to) => dispatch(() => chooseEvolution(content, state, uid, to)),
  chooseStarter: (id) => dispatch(() => chooseStarter(content, state, id)),
  chooseEncounter: (i) => dispatch(() => chooseEncounter(content, state, i)),
  allocateTraining: (uid, stat) => dispatch(() => allocateTraining(content, state, uid, stat)),
  travel: (areaId) => dispatch(() => travelTo(content, state, areaId)),
  setSpeed: (x) => (speed = x),
  save: () => save(),
  reset: () => {
    if (!confirm(fmt(content.strings, "confirmNewGame"))) return;
    storage.removeItem(saveKey(packId));
    state = newGame(content, (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0, Date.now());
  },
  switchPack: (id) => {
    save();
    location.search = `?pack=${encodeURIComponent(id)}`;
  },
});

function dispatch(cmd: () => GameEvent[]): void {
  try {
    feed(cmd());
  } catch (e) {
    console.warn(e);
  }
}

function feed(events: GameEvent[]): void {
  if (!events.length) return;
  renderer.onEvents(events);
  hud.pushEvents(state, events);
}

function save(): void {
  try {
    saveToStorage(storage, state, Date.now(), content.pack.version);
  } catch (e) {
    console.warn("Falha ao salvar", e);
  }
}

function catchUpOffline(): void {
  const report = applyOffline(content, state, Date.now());
  if (report) {
    hud.pushEvents(state, report.events);
    hud.showOffline(report);
    save();
  }
}

function fit(): void {
  renderer.fit(window.innerWidth - 16, window.innerHeight * 0.62);
}
window.addEventListener("resize", fit);
fit();

// Tab oculta: rAF para; ao voltar, credita o tempo pelo caminho offline (com teto).
let hiddenAt = 0;
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    hiddenAt = Date.now();
    save();
  } else if (Date.now() - hiddenAt > OFFLINE_ON_RETURN_MS) {
    catchUpOffline();
    last = performance.now();
    acc = 0;
  }
});
window.addEventListener("pagehide", save);

catchUpOffline();

let last = performance.now();
let acc = 0;
let lastSave = performance.now();
function frame(now: number): void {
  acc += Math.min(now - last, 1000) * speed;
  last = now;
  let n = 0;
  while (acc >= content.balance.tickMs && n < MAX_STEPS_PER_FRAME) {
    feed(step(content, state));
    acc -= content.balance.tickMs;
    n++;
  }
  if (n === MAX_STEPS_PER_FRAME) acc = 0;
  state.lastSeenAt = Date.now();
  renderer.draw(state, now);
  hud.render(state, speed);
  if (now - lastSave > AUTOSAVE_MS) {
    save();
    lastSave = now;
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Ganchos de depuração no console (somente dev).
if (import.meta.env.DEV) Object.assign(window, { gs: { get state() { return state; }, content, save } });
