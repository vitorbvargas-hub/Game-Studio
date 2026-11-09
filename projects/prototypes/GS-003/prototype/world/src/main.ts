// Shell do vertical slice: loop rAF com acumulador de tick fixo (100 ms), interpolação, input → intents.
// Ordem por tick: intents → WorldSim.step → Presenter.onTick (eventos confirmados) → HUD.

import { xpToNext } from "@game/src/sim/formulas";
import { imageUrlsOf, loadCharacterCatalog, loadCreatureCatalog, pickTamers, loadSizeTable } from "./assets/creatures";
import { loadSceneTiles, packSummary, usedKeys, type ScenePack } from "./assets/scene-tiles";
import { clockFromParams, formatClock, GameClock } from "./render/daynight";
import { botLook, composeTamer, DEFAULT_LOOK, frameList, loadPartUrls, lookKey, PARTS, type TamerLook } from "./assets/tamer-parts";
import { TamerCreator, type PreviewDir } from "./ui/creator";
import type { CreatureVisual } from "./assets/creatures";
import { countDwdsSources, loadTileSources } from "./assets/tiles";
import forestProofPack from "./data/maps/forest-proof.aliases.json";
import { browserCanvasFactory, browserImageLoader, ImageStore } from "./render/images";
import { drawLabels, labelMetrics, layoutLabels, measureWith } from "./render/labels";
import { makePortraitFn } from "./render/portrait";
import { Presenter } from "./render/presenter";
import { WorldView } from "./render/view";
import { pxToSub } from "./sim/map";
import { TICK_MS } from "./sim/params";
import { createDefaultWorld, createForestProofWorld, FOREST_PROOF_SCENE, LOCAL_PLAYER } from "./sim/setup";
import type { Intent } from "./sim/types";
import { getEntity, getPlayer, snapshot, snapshotOf, stepWorld } from "./sim/world";
import "./style.css";
import { Hud, type HudScene } from "./ui/hud";
import { Minimap, type MinimapDot } from "./ui/minimap";
import type { MovesView } from "./ui/moves-ui";
import { loadSheetCatalog, sheetDrawer } from "./render/vfx/engine";
import { drawMoveIcon } from "./render/vfx/icon";
import type { Entity } from "./sim/types";
import type { WorldSim } from "./sim/world";

const params = new URLSearchParams(location.search);
const SEED = Number(params.get("seed") ?? Date.now() % 100000);
const CREATURE_SCALE = Math.max(1, Math.floor(Number(params.get("creatureScale") ?? 1)));
/** ?size=table liga a tabela de tamanhos do game-research (escala inteira por espécie); padrão = nativo do DS. */
const SIZE_MODE = params.get("size") ?? "native";
/** ?smooth=0 desliga a suavização visual (comparação com a v1). ?tiles=original ignora os biomas DS. */
const SMOOTH = params.get("smooth") !== "0";
const TILES_DWDS = params.get("tiles") !== "original";
/** ?map=meadow volta ao mapa de teste da v2; padrão = cena da prova visual (floresta densa + 3 jogadores bot). */
const MAP = params.get("map") === "meadow" ? "meadow" : "forest-proof";
/** Altura da barra inferior do HUD (CSS px): a câmera centra o Tamer na área visível acima dela. */
const HUD_BOTTOM_PX = 96;
const ZOOM = Math.max(0, Math.floor(Number(params.get("zoom") ?? 0)));
/** Resolução lógica mínima; a tela é preenchida com o maior fator inteiro que caiba. */
const MIN_W = 400;
const MIN_H = 240;

/** ?criador=0 pula o criador de Tamer (capturas/testes) e usa o visual padrão. */
const CREATOR = params.get("criador") !== "0";

/**
 * Tela do criador de Tamer (antes do mundo). Carrega só os PNGs-base das camadas (o resto sai por recolor) e
 * compõe o preview sob demanda, com cache por combinação.
 */
async function chooseLook(images: ImageStore, partUrls: Record<string, string>): Promise<TamerLook> {
  if (!CREATOR) return DEFAULT_LOOK;
  const cache = new Map<string, CreatureVisual>();
  const visualOf = (l: TamerLook) => {
    const k = lookKey(l);
    let v = cache.get(k);
    if (!v) cache.set(k, (v = composeTamer(l, partUrls, images, browserCanvasFactory)));
    return v;
  };
  const draw = (cv: HTMLCanvasElement, l: TamerLook, dir: PreviewDir, frame: number) => {
    const v = visualOf(l);
    const src = v.manifest.animations.walk.dirFrames![dir === "W" ? "E" : dir];
    const fr = v.atlas.frames[src[frame % src.length].atlasKey!].frame;
    const g = cv.getContext("2d")!;
    g.imageSmoothingEnabled = false;
    g.clearRect(0, 0, cv.width, cv.height);
    g.save();
    if (dir === "W") {
      g.translate(cv.width, 0);
      g.scale(-1, 1);
    }
    g.drawImage(images.get(v.sheetUrl) as CanvasImageSource, fr.x, fr.y, fr.w, fr.h, 0, 0, fr.w, fr.h);
    g.restore();
  };
  return new Promise((resolve) => new TamerCreator(document.body, { initial: DEFAULT_LOOK, drawPreview: draw, onConfirm: resolve }));
}

async function boot() {
  const images = new ImageStore(browserImageLoader);
  const partUrls = loadPartUrls();
  const partsFailed = await images.loadAll(Object.values(partUrls));
  if (partsFailed.length) console.warn("partes do Tamer não carregadas:", partsFailed.length);
  const look = await chooseLook(images, partUrls);
  const canvas = document.querySelector<HTMLCanvasElement>("#world")!;
  const labelCanvas = document.querySelector<HTMLCanvasElement>("#labels")!;
  const hudRoot = document.querySelector<HTMLElement>("#hud")!;
  const forest = MAP === "forest-proof";
  const auto = params.get("auto") === "1";
  const { sim, events: spawnEvents } = forest ? createForestProofWorld(SEED, { auto, localName: look.name }) : createDefaultWorld(SEED, { auto });
  const creatures = loadCreatureCatalog();
  // Presets noturnos (pastas night/) repetem os nomes do dia: ficam fora do conjunto global.
  let tiles = loadTileSources(TILES_DWDS, (p) => !/\/night\//.test(p));
  const packCfg = forestProofPack as ScenePack;
  let nightTiles: typeof tiles | undefined;
  if (forest) {
    const scene = loadSceneTiles(packCfg, "day", usedKeys(sim.map), TILES_DWDS);
    const night = loadSceneTiles(packCfg, "night", usedKeys(sim.map), TILES_DWDS);
    tiles = scene.tiles;
    nightTiles = night.tiles;
    console.info(`forest-proof · ${packSummary(packCfg, "day", scene)} · ${packSummary(packCfg, "night", night)}`, scene.missing, night.missing);
  }
  // Relógio do jogo (?time=night|day|HH:MM força; ?timescale=N minutos de jogo por segundo real).
  const clock = new GameClock(clockFromParams(params, new Date()));
  const tamers = pickTamers(loadCharacterCatalog());
  const fxSheets = loadSheetCatalog();
  const sizeTable = SIZE_MODE === "table" ? loadSizeTable() : undefined;
  const failed = await images.loadAll([
    ...Object.values(creatures).map((c) => c.sheetUrl),
    ...Object.values(tiles).map((t) => t.url),
    ...Object.values(nightTiles ?? {}).map((t) => t.url),
    ...[tamers.local, tamers.remote].flatMap((t) => (t ? imageUrlsOf(t) : [])),
    ...fxSheets.map((s) => s.url),
  ]);
  if (fxSheets.length) console.info(`04-effects: ${fxSheets.length} folha(s) de VFX do game-art`, fxSheets.map((s) => `${s.archetype}/${s.phase}`));
  if (failed.length) console.warn("assets não carregados:", failed);
  console.info(
    `GS-003 world v2 · mapa ${MAP} · criaturas ${Object.keys(creatures).length} · tiles ${Object.keys(tiles).length} (DS: ${countDwdsSources(tiles)}) · ` +
      `Tamer ${tamers.local?.manifest.id ?? "placeholder"}/${tamers.remote?.manifest.id ?? "placeholder"} · tamanho ${sizeTable ? `tabela (${Object.keys(sizeTable).length})` : "nativo DS"}`,
  );

  const presenter = new Presenter((id) => (id ? creatures[id]?.manifest : undefined), LOCAL_PLAYER);
  const view = new WorldView(canvas, sim.map, creatures, tiles, images, browserCanvasFactory, {
    creatureScale: CREATURE_SCALE,
    sizeTable,
    tamers,
    smoothing: SMOOTH,
    tamerVisuals: tamerVisuals(sim.state.players.map((p) => p.id), look, SEED, (id) => sim.state.entities.find((e) => e.id === getPlayer(sim.state, id)?.tamerId)?.name ?? id, images),
    tamerLevels: forest ? Object.fromEntries(FOREST_PROOF_SCENE.players.map((p) => [p.id, p.tamerLevel])) : undefined,
    tamerTints: forest ? Object.fromEntries(FOREST_PROOF_SCENE.players.filter((p) => p.tint).map((p) => [p.id, p.tint])) : undefined,
    trees: forest ? packCfg.trees : undefined,
    fxSheets: fxSheets.length ? sheetDrawer(fxSheets, (url) => images.get(url) as CanvasImageSource | undefined) : undefined,
  });
  if (nightTiles) view.setNightTiles(nightTiles);
  console.info(`Tamer ${look.name}: ${lookKey(look)} · ${frameList().length} linhas × ${PARTS.frame.w}×${PARTS.frame.h}`);
  const intents: Intent[] = [];
  const player = getPlayer(sim.state, LOCAL_PLAYER)!;
  const me = FOREST_PROOF_SCENE.players.find((p) => p.id === LOCAL_PLAYER)!;
  const hudScene: HudScene | undefined = forest
    ? { region: FOREST_PROOF_SCENE.region, tamerName: look.name, tamerLevel: me.tamerLevel, tamerXp: FOREST_PROOF_SCENE.tamerXp, team: FOREST_PROOF_SCENE.team, box: FOREST_PROOF_SCENE.box, chat: FOREST_PROOF_SCENE.chat }
    : undefined;
  const hud = new Hud(
    hudRoot,
    sim.content,
    LOCAL_PLAYER,
    {
      onAuto: (on) => intents.push({ t: "set_auto", playerId: LOCAL_PLAYER, on }),
      onFlee: () => intents.push({ t: "flee", playerId: LOCAL_PLAYER }),
      onUseMove: (slot) => intents.push({ t: "use_move", playerId: LOCAL_PLAYER, slot }),
      onSetMoves: (slots) => intents.push({ t: "set_moves", playerId: LOCAL_PLAYER, slots }),
      onSetAutoRules: (rules) => intents.push({ t: "set_auto_priority", playerId: LOCAL_PLAYER, rules }),
      onEvolve: () => intents.push({ t: "evolve", playerId: LOCAL_PLAYER }),
    },
    player.auto,
    { scene: hudScene, portrait: makePortraitFn(creatures, images), minimap: new Minimap(sim.map, browserCanvasFactory), moveIcon: drawMoveIcon },
  );
  hud.onEvents(spawnEvents);
  presenter.onTick(snapshot(sim), spawnEvents, performance.now());

  // ---- escala inteira pixel-perfect ----
  let scale = 1;
  const resize = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Prova visual: enquadramento da referência (~25 × 14 tiles visíveis) → escala arredondada sobre 640 × 400.
    // ?zoom=N força a escala; o mapa de teste mantém a regra antiga (maior inteiro que caiba em 400 × 240).
    scale = ZOOM > 0 ? ZOOM : forest ? Math.max(1, Math.round(Math.min(vw / 640, vh / 400))) : Math.max(1, Math.floor(Math.min(vw / MIN_W, vh / MIN_H)));
    canvas.width = Math.ceil(vw / scale);
    canvas.height = Math.ceil(vh / scale);
    canvas.style.width = `${canvas.width * scale}px`;
    canvas.style.height = `${canvas.height * scale}px`;
    labelCanvas.width = canvas.width * scale;
    labelCanvas.height = canvas.height * scale;
    labelCanvas.style.width = `${labelCanvas.width}px`;
    labelCanvas.style.height = `${labelCanvas.height}px`;
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
    if (k === "e" && !e.repeat) hud.toggleTeam();
    if (k === "escape") hud.closeTeam();
    if (k >= "1" && k <= "4" && k.length === 1 && !e.repeat) intents.push({ t: "use_move", playerId: LOCAL_PLAYER, slot: Number(k) - 1 });
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

  // ---- nomes e níveis (camada nítida na resolução da tela) ----
  const lctx = labelCanvas.getContext("2d")!;
  const drawNameplates = (alpha: number, now: number) => {
    lctx.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
    const m = labelMetrics(scale);
    drawLabels(lctx, layoutLabels(view.labels(presenter, alpha, now), measureWith(lctx, m), scale, m), m);
  };

  // ---- minimapa / coordenadas / qps (4 Hz) ----
  let lastHudWorld = 0;
  let frames = 0;
  const updateHudWorld = (now: number) => {
    frames++;
    if (now - lastHudWorld < 250) return;
    const dots: MinimapDot[] = [];
    for (const v of presenter.entities.values()) {
      if (v.defeatedAt !== undefined) continue;
      const kind = v.id === LOCAL_PLAYER ? "me" : v.id === presenter.localPartnerId ? "partner" : v.kind === "remote_player" ? "player" : v.kind === "wild" ? "wild" : undefined;
      if (kind) dots.push({ x: v.cur.x, y: v.cur.y, kind });
    }
    hud.updateWorld(view.motionPos(LOCAL_PLAYER), dots, lastHudWorld ? (frames * 1000) / (now - lastHudWorld) : undefined);
    if (forest) hud.setClock(clock.phase(now - bootAt), formatClock(clock.minutes(now - bootAt)));
    lastHudWorld = now;
    frames = 0;
  };

  // ---- loop ----
  const bootAt = performance.now();
  let acc = 0;
  let last = performance.now();
  let lastFrame = last;
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
    const alpha = acc / TICK_MS;
    view.update(presenter, alpha, now);
    const mePos = view.motionPos(LOCAL_PLAYER);
    if (mePos) view.follow({ x: mePos.x, y: mePos.y + HUD_BOTTOM_PX / 2 / scale }, now - lastFrame, view.shakeFor(presenter, now));
    lastFrame = now;
    const elapsed = now - bootAt;
    view.nightMix = forest ? clock.nightMix(elapsed) : 0;
    view.render(presenter, alpha, now);
    drawNameplates(alpha, now);
    updateHudWorld(now);
    const partner = getEntity(sim.state, player.partnerId);
    if (partner) {
      hud.updatePartner(snapshotOf(partner), partner.xp, xpToNext(sim.content.balance, partner.level), player.bits);
      hud.updateMoves(movesView(sim, partner));
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  Object.assign(window, { __gs003: { sim, presenter, view, hud, clock } });
}

/** Visual composto de cada Tamer: o local vem do criador; os bots, de combinações aleatórias (semente do mundo + id). */
function tamerVisuals(ids: string[], look: TamerLook, seed: number, nameOf: (id: string) => string, images: ImageStore): Record<string, CreatureVisual> {
  const urls = loadPartUrls();
  return Object.fromEntries(ids.map((id) => [id, composeTamer(id === LOCAL_PLAYER ? look : botLook(seed, id, nameOf(id)), urls, images, browserCanvasFactory)]));
}

/** Estado de golpes da parceira para o HUD (cópia somente leitura). */
function movesView(sim: WorldSim, e: Entity): MovesView {
  const evo = sim.content.moves.evolutions[e.speciesId!];
  return {
    id: e.id,
    speciesId: e.speciesId!,
    name: e.name,
    level: e.level,
    mp: e.mp,
    maxMp: e.maxMp,
    learned: [...e.learned],
    moves: [...e.moves],
    autoRules: e.autoRules.map((r) => ({ ...r })),
    cd: { ...e.moveCd },
    queued: e.queuedMove,
    inCombat: !!e.encounterId || !!e.targetId || !["IDLE", "FOLLOW", "WALK", "RETURN"].includes(e.state),
    evolve: evo ? { toName: sim.content.species[evo.to]?.name ?? evo.to, level: evo.level, ready: e.level >= evo.level } : undefined,
  };
}

boot();
