// Shell do vertical slice: loop rAF com acumulador de tick fixo (100 ms), interpolação, input → intents.
// Ordem por tick: intents → WorldSim.step → Presenter.onTick (eventos confirmados) → HUD.

import { xpToNext } from "@game/src/sim/formulas";
import { loadCreatureCatalog } from "./assets/creatures";
import { loadTileSources } from "./assets/tiles";
import { browserCanvasFactory, browserImageLoader, ImageStore } from "./render/images";
import { Presenter } from "./render/presenter";
import { WorldView } from "./render/view";
import { pxToSub } from "./sim/map";
import { TICK_MS } from "./sim/params";
import { createDefaultWorld, LOCAL_PLAYER } from "./sim/setup";
import type { Intent } from "./sim/types";
import { getEntity, getPlayer, snapshot, snapshotOf, stepWorld } from "./sim/world";
import "./style.css";
import { Hud } from "./ui/hud";

const params = new URLSearchParams(location.search);
const SEED = Number(params.get("seed") ?? Date.now() % 100000);
const CREATURE_SCALE = Math.max(1, Math.floor(Number(params.get("creatureScale") ?? 1)));
/** Resolução lógica mínima; a tela é preenchida com o maior fator inteiro que caiba. */
const MIN_W = 400;
const MIN_H = 240;

async function boot() {
  const canvas = document.querySelector<HTMLCanvasElement>("#world")!;
  const hudRoot = document.querySelector<HTMLElement>("#hud")!;
  const { sim, events: spawnEvents } = createDefaultWorld(SEED, { auto: params.get("auto") === "1" });
  const creatures = loadCreatureCatalog();
  const tiles = loadTileSources();
  const images = new ImageStore(browserImageLoader);
  const failed = await images.loadAll([...Object.values(creatures).map((c) => c.sheetUrl), ...Object.values(tiles).map((t) => t.url)]);
  if (failed.length) console.warn("assets não carregados:", failed);

  const presenter = new Presenter((id) => (id ? creatures[id]?.manifest : undefined), LOCAL_PLAYER);
  const view = new WorldView(canvas, sim.map, creatures, tiles, images, browserCanvasFactory, { creatureScale: CREATURE_SCALE });
  const intents: Intent[] = [];
  const player = getPlayer(sim.state, LOCAL_PLAYER)!;
  const hud = new Hud(hudRoot, sim.content, LOCAL_PLAYER, {
    onAuto: (on) => intents.push({ t: "set_auto", playerId: LOCAL_PLAYER, on }),
    onFlee: () => intents.push({ t: "flee", playerId: LOCAL_PLAYER }),
  }, player.auto);
  hud.onEvents(spawnEvents);
  presenter.onTick(snapshot(sim), spawnEvents, performance.now());

  // ---- escala inteira pixel-perfect ----
  let scale = 1;
  const resize = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    scale = Math.max(1, Math.floor(Math.min(vw / MIN_W, vh / MIN_H)));
    canvas.width = Math.ceil(vw / scale);
    canvas.height = Math.ceil(vh / scale);
    canvas.style.width = `${canvas.width * scale}px`;
    canvas.style.height = `${canvas.height * scale}px`;
  };
  window.addEventListener("resize", resize);
  resize();

  // ---- input: clique/toque e WASD ----
  canvas.addEventListener("pointerdown", (e) => {
    const r = canvas.getBoundingClientRect();
    const wpt = view.screenToWorld(Math.floor((e.clientX - r.left) / scale), Math.floor((e.clientY - r.top) / scale));
    const hit = pickWild(wpt.x, wpt.y);
    if (hit) intents.push({ t: "engage", playerId: LOCAL_PLAYER, targetId: hit });
    else intents.push({ t: "move_to", playerId: LOCAL_PLAYER, x: pxToSub(wpt.x), y: pxToSub(wpt.y) });
  });
  const keys = new Set<string>();
  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if ("wasd".includes(k) && k.length === 1) keys.add(k);
    if (k === "f") intents.push({ t: "flee", playerId: LOCAL_PLAYER });
  });
  window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));
  window.addEventListener("blur", () => keys.clear());

  /** Clique sobre a hitbox (creature.json) de um selvagem visível. */
  function pickWild(x: number, y: number): string | undefined {
    let best: string | undefined;
    let bestY = -Infinity;
    for (const v of presenter.entities.values()) {
      if (v.kind !== "wild" || v.defeatedAt !== undefined) continue;
      const m = v.speciesId ? creatures[v.speciesId]?.manifest : undefined;
      if (!m) continue;
      const hb = m.hitbox ?? { x: 0, y: 0, w: m.dimensions.frameW, h: m.dimensions.frameH };
      const S = CREATURE_SCALE;
      const left = v.cur.x + (hb.x - m.pivot.x) * S;
      const top = v.cur.y + (hb.y - m.pivot.y) * S;
      if (x >= left && x < left + hb.w * S && y >= top && y < top + hb.h * S && v.cur.y > bestY) {
        best = v.id;
        bestY = v.cur.y;
      }
    }
    return best;
  }

  // ---- loop ----
  let acc = 0;
  let last = performance.now();
  const frame = (now: number) => {
    acc += Math.min(1000, now - last);
    last = now;
    let steps = 0;
    while (acc >= TICK_MS && steps < 10) {
      const dx = (keys.has("d") ? 1 : 0) - (keys.has("a") ? 1 : 0);
      const dy = (keys.has("s") ? 1 : 0) - (keys.has("w") ? 1 : 0);
      if (dx || dy) intents.push({ t: "move_dir", playerId: LOCAL_PLAYER, dx, dy });
      const evs = stepWorld(sim, intents.splice(0));
      presenter.onTick(snapshot(sim), evs, now);
      hud.onEvents(evs);
      acc -= TICK_MS;
      steps++;
    }
    if (steps === 10) acc = 0;
    presenter.update(now);
    const me = presenter.entities.get(LOCAL_PLAYER);
    const alpha = acc / TICK_MS;
    if (me) view.follow(presenter.renderPos(me, alpha));
    view.render(presenter, alpha, now);
    const partner = getEntity(sim.state, player.partnerId);
    if (partner) hud.updatePartner(snapshotOf(partner), partner.xp, xpToNext(sim.content.balance, partner.level), player.bits);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  Object.assign(window, { __gs003: { sim, presenter, view } });
}

boot();
