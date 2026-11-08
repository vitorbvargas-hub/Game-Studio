// SPIKE — shell da Arena de Ação: teclado -> ArenaInput, loop de passo fixo, render em Canvas 320x180.
// Parâmetros de URL: ?pack=digimon-fan&p=agumon&e=gabumon&lv=10&seed=1

import { defaultPackId, loadPack } from "../src/packs";
import type { ContentBundle } from "../src/sim/types";
import { aiInput, createArena, stepArena, type ArenaConfig, type ArenaInput, type ArenaState, type Fighter } from "./arena";
import { ArenaRenderer } from "./render";
import cfgJson from "./arena.json";

const cfg = cfgJson as ArenaConfig;
const params = new URLSearchParams(location.search);
const content: ContentBundle = loadPack(params.get("pack") ?? defaultPackId());
const withSprite = Object.values(content.creatures).filter((c) => c.sprite);
// Padrão do spike: Gabumon (jogador) x Agumon (IA) — no pack, dado > vacina (1,25x), o que compensa
// a IA reagir melhor que um humano. Outro par: ?p=agumon&e=patamon. Sem os dois: primeiros com sprite.
const pick = (id: string | null, fallback: string | undefined) => (id && content.creatures[id] ? id : fallback);
const playerId = pick(params.get("p") ?? "gabumon", withSprite[0]?.id) ?? Object.keys(content.creatures)[0];
const enemyId = pick(params.get("e") ?? "agumon", withSprite.find((c) => c.id !== playerId)?.id) ?? playerId;
const level = Number(params.get("lv") ?? content.creatures[playerId]?.baseLevel ?? 1) || 1;
let seed = Number(params.get("seed") ?? Date.now()) >>> 0;

const canvas = document.getElementById("arena") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const hud = document.getElementById("hud")!;
const affColor = (id: string) => content.theme.affinities.find((a) => a.id === id)?.color ?? "#ffffff";

let st: ArenaState = newMatch();
const images = new Map<string, HTMLImageElement>();
const renderer = new ArenaRenderer(ctx, content, cfg, (path) => {
  const url = content.assets[path];
  if (!url) return null;
  let img = images.get(url);
  if (!img) images.set(url, (img = Object.assign(new Image(), { src: url })));
  return img;
});

function newMatch(): ArenaState {
  seed = (seed + 1) >>> 0;
  return createArena(content, cfg, { creatureId: playerId, level }, { creatureId: enemyId, level }, seed);
}

// ---------- Input ----------
const keys = new Set<string>();
const pressed = new Set<string>();
addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
  if (!keys.has(k)) pressed.add(k);
  keys.add(k);
  if (k === "r" && st.outcome) {
    st = newMatch();
    renderer.reset();
  }
});
addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));
addEventListener("blur", () => keys.clear());

function playerInput(): ArenaInput {
  const h = (a: string[]) => a.some((k) => keys.has(k));
  const once = (a: string[]) => a.some((k) => keys.has(k) || pressed.has(k));
  return {
    mx: (h(["d", "arrowright"]) ? 1 : 0) - (h(["a", "arrowleft"]) ? 1 : 0),
    my: (h(["s", "arrowdown"]) ? 1 : 0) - (h(["w", "arrowup"]) ? 1 : 0),
    basic: once(["j", " "]),
    special: once(["k", "e"]),
  };
}

// ---------- Loop de passo fixo ----------
const STEP_MS = 1000 / cfg.simHz;
let acc = 0;
let last = performance.now();
function frame(now: number) {
  acc += Math.min(250, now - last);
  last = now;
  while (acc >= STEP_MS) {
    acc -= STEP_MS;
    const evs = stepArena(st, content, cfg, [playerInput(), aiInput(st, cfg, 1)]);
    pressed.clear();
    for (const e of evs) renderer.onEvent(st, e);
  }
  renderer.draw(st);
  renderHud();
  requestAnimationFrame(frame);
}

const OUTCOME_TEXT = { win: "VITÓRIA!", lose: "DERROTA", draw: "EMPATE" } as const;
let lastHud = "";
function renderHud() {
  const [p, e] = st.fighters;
  const cd = (f: Fighter) => (f.specialCd === 0 ? "pronto" : `${(f.specialCd / cfg.simHz).toFixed(1)} s`);
  const line = (f: Fighter) =>
    `<div class="f"><b>${f.name}</b> Nv ${f.level} · <span style="color:${affColor(f.affinity)}">${f.affinity}</span>
      <div class="hp"><i style="width:${(100 * f.hp) / f.maxHp}%"></i></div>
      <small>HP ${f.hp}/${f.maxHp} · ATK ${f.atk} DEF ${f.def} SPD ${f.spd} · básico: ${f.basic.name} · especial: ${f.special.name} (${cd(f)})</small></div>`;
  const html = `${line(p)}${line(e)}
    ${st.outcome ? `<div class="end">${OUTCOME_TEXT[st.outcome]} <small>— R para lutar de novo</small></div>` : ""}
    <p class="keys">Mover: WASD/setas · Básico: J ou Espaço · Especial: K ou E (sai na direção em que você olha) · R: revanche</p>
    ${content.pack.disclaimer ? `<footer class="disclaimer">${content.pack.disclaimer}</footer>` : ""}`;
  if (html !== lastHud) hud.innerHTML = lastHud = html;
}

function fit() {
  const s = Math.max(1, Math.floor(Math.min((innerWidth - 24) / cfg.width, (innerHeight - 200) / cfg.height)));
  canvas.style.width = `${cfg.width * s}px`;
  canvas.style.height = `${cfg.height * s}px`;
}
canvas.width = cfg.width;
canvas.height = cfg.height;
addEventListener("resize", fit);
fit();
requestAnimationFrame(frame);
