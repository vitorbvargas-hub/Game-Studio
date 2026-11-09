// Shell do vertical slice: loop rAF com acumulador de tick fixo (100 ms), interpolação, input → intents.
// Ordem por tick: intents → WorldSim.step → Presenter.onTick (eventos confirmados) → HUD.

import { xpToNext } from "@game/src/sim/formulas";
import { imageUrlsOf, loadCharacterCatalog, loadCreatureCatalog, pickTamers, loadSizeTable } from "./assets/creatures";
import { loadSceneTiles, packSummary, usedKeys } from "./assets/scene-tiles";
import { clockFromParams, formatClock, GameClock } from "./render/daynight";
import { botLook, defaultLook, loadPresets, lookKey, presetVisual, urlsForLook, type TamerLook } from "./assets/tamer-presets";
import { TamerCreator, type PreviewDir } from "./ui/creator";
import { applyOffline, applySave, captureSave, offlineBalance, offlineSeed, type OfflineReport } from "./save/offline";
import { browserStorage, loadFromStorage, SAVE_KEY, saveToStorage, STARTING_INVENTORY, type LoadResult, type SaveData, type SettingsData } from "./save/save";
import { dayKey, emptyQuestLog, questViews, QUESTS, rollDay, trackEvents } from "./save/questlog";
import { digiviceHtml, inventoryHtml, questsHtml, settingsHtml } from "./ui/screens";
import economyJson from "./data/content/economy.json";
import { showOfflineReport } from "./ui/offline-report";
import type { CreatureVisual } from "./assets/creatures";
import { countDwdsSources, globalTileFilter, loadTileSources } from "./assets/tiles";
import { browserCanvasFactory, browserImageLoader, ImageStore } from "./render/images";
import { drawLabels, labelMetrics, layoutLabels, measureWith } from "./render/labels";
import { makePortraitFn, makeSpriteFn } from "./render/portrait";
import { Presenter } from "./render/presenter";
import { WorldView } from "./render/view";
import { parseTiledMap, portalAt, pxToSub, subToPx } from "./sim/map";
import { TICK_MS } from "./sim/params";
import { createDefaultWorld, createMapWorld, FOREST_PROOF_SCENE, LOCAL_PLAYER } from "./sim/setup";
import type { Intent, WorldEvent } from "./sim/types";
import { canEvolveNow, getEntity, getPlayer, restorePartner, snapshot, snapshotOf, stepWorld } from "./sim/world";
import { autoEvolveTarget, isBranching, statusesOf } from "./sim/evolution";
import { evolveChoiceHtml } from "./ui/evolve-ui";
import "./style.css";
import { Hud, type HudScene } from "./ui/hud";
import { STARTER_LEVEL, StarterPicker } from "./ui/starter";
import { loadWorldContent } from "./sim/species";
import { Panel } from "./ui/panel";
import { worldMapHtml } from "./ui/worldmap";
import { canTravel, DEFAULT_MAP, MAPS, mapOfRegion, regionById, type MapDef, type Progress } from "./world/regions";
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
/**
 * ?map=meadow volta ao mapa de teste da v2 (sem save nem troca de mapa); ?map=praia|vila|forest-proof começa nesse
 * mapa. Padrão = o mapa do save, ou a floresta da prova visual (cena com 3 jogadores bot).
 */
const MAP = params.get("map") === "meadow" ? "meadow" : params.get("map") ?? "";
/** Altura da barra inferior do HUD (CSS px): a câmera centra o Tamer na área visível acima dela. */
const HUD_BOTTOM_PX = 96;
const ZOOM = Math.max(0, Math.floor(Number(params.get("zoom") ?? 0)));
/** Resolução lógica mínima; a tela é preenchida com o maior fator inteiro que caiba. */
const MIN_W = 400;
const MIN_H = 240;

/** ?criador=0 pula o criador de Tamer (capturas/testes) e usa o visual padrão. */
const CREATOR = params.get("criador") !== "0";

/**
 * Tela do criador de Tamer v3 (antes do mundo): grade dos 12 presets do disco. Pré-carrega a cor canônica de cada
 * preset; as outras cores carregam quando escolhidas (o preview aparece assim que a imagem chega).
 */
async function chooseLook(images: ImageStore, initial: TamerLook = defaultLook()): Promise<TamerLook> {
  if (!CREATOR) return initial;
  const presets = loadPresets();
  await images.loadAll([...presets.flatMap((p) => urlsForLook({ name: "", preset: p.id, hair: p.defaultHair })), ...urlsForLook(initial)]);
  const cache = new Map<string, CreatureVisual | undefined>();
  const visualOf = (l: TamerLook) => {
    const k = lookKey(l);
    if (!cache.has(k)) {
      const v = presetVisual(l, presets);
      cache.set(k, v);
      if (v) void images.loadAll(urlsForLook(l, presets));
    }
    return cache.get(k);
  };
  const blit = (cv: HTMLCanvasElement, l: TamerLook, dir: PreviewDir, frame: number, bust: boolean) => {
    const v = visualOf(l);
    const g = cv.getContext("2d")!;
    g.imageSmoothingEnabled = false;
    g.clearRect(0, 0, cv.width, cv.height);
    if (!v) return;
    const src = v.manifest.animations.walk.dirFrames![dir];
    const key = src[frame % src.length].atlasKey!;
    const img = images.get(v.frameUrls![key]);
    if (!img) return;
    const { frameW: w, frameH: h } = v.manifest.dimensions;
    const pv = v.manifest.pivot;
    if (bust) {
      // retrato: a cabeça (topo do quadro, 24×20 em volta do pivô x) parada de frente
      g.drawImage(img as CanvasImageSource, Math.max(0, pv.x - 12), 0, 24, 20, 0, 0, 24, 20);
      return;
    }
    // pés no pivô, centrado no canvas
    g.drawImage(img as CanvasImageSource, 0, 0, w, h, Math.round(cv.width / 2 - pv.x), cv.height - 1 - pv.y, w, h);
  };
  return new Promise((resolve) =>
    new TamerCreator(document.body, {
      initial,
      presets,
      drawPreview: (cv, l, dir, frame) => blit(cv, l, dir, frame, false),
      drawPortrait: (cv, l) => blit(cv, l, "S", 0, true),
      onConfirm: resolve,
    }),
  );
}

/** Tela "Escolha seu parceiro" (jogo novo, depois do criador): devolve o bebê escolhido. */
async function chooseStarter(images: ImageStore, creatures: Record<string, CreatureVisual>): Promise<string> {
  await images.loadAll(Object.values(creatures).flatMap(imageUrlsOf));
  const content = loadWorldContent();
  const forced = params.get("inicial");
  return new Promise((resolve) => new StarterPicker(document.body, { content, initial: forced ?? undefined, drawSprite: makeSpriteFn(creatures, images), onConfirm: resolve }));
}

/** Um mapa carregado: sim, visual e apresentação (trocados juntos na troca de mapa). */
interface Live {
  mapId: string;
  /** Mapa jogável das regiões (src/world/regions.ts); ausente = mapa de teste ?map=meadow. */
  def?: MapDef;
  sim: WorldSim;
  view: WorldView;
  presenter: Presenter;
  spawnEvents: WorldEvent[];
}

async function boot() {
  const images = new ImageStore(browserImageLoader);
  const regionMode = MAP !== "meadow";
  // Save (só nos mapas das regiões). ?novo=1 ignora o save (começa do zero; o save é sobrescrito no próximo salvamento).
  const storage = regionMode ? browserStorage() : undefined;
  const loaded: LoadResult = storage && params.get("novo") !== "1" ? loadFromStorage(storage) : { ok: false, reason: "empty" };
  if (!loaded.ok && loaded.reason !== "empty") console.warn(`save ignorado (${loaded.reason}): ${loaded.detail ?? ""}`);
  // Com save, o criador só abre com ?criador=1 (trocar o visual mantendo o progresso).
  const look = loaded.ok && params.get("criador") !== "1" ? loaded.data.tamer : await chooseLook(images, loaded.ok ? loaded.data.tamer : defaultLook());
  const creatures = loadCreatureCatalog();
  // Jogo novo: depois do criador, escolhe o bebê inicial (nível 1). ?criador=0 pula as duas telas.
  const starter: string | null = loaded.ok ? loaded.data.starter : regionMode && CREATOR ? await chooseStarter(images, creatures) : null;
  const newStarter = !loaded.ok && !!starter;
  // Telas secundárias: espécies vistas (Digivice), inventário, missões do dia e configurações (save v5).
  const seen = new Set<string>(loaded.ok ? loaded.data.seen : []);
  const inventory: Record<string, number> = loaded.ok ? { ...loaded.data.inventory } : { ...STARTING_INVENTORY };
  let quests = loaded.ok ? rollDay(loaded.data.quests, dayKey(new Date())) : emptyQuestLog(dayKey(new Date()));
  const settings: SettingsData = loaded.ok ? { ...loaded.data.settings } : { time: "auto" };
  const canvas = document.querySelector<HTMLCanvasElement>("#world")!;
  const labelCanvas = document.querySelector<HTMLCanvasElement>("#labels")!;
  const hudRoot = document.querySelector<HTMLElement>("#hud")!;
  const auto = params.get("auto") === "1";
  // Relógio do jogo (?time=night|day|HH:MM força; ?timescale=N minutos de jogo por segundo real).
  const clock = new GameClock(clockFromParams(params, new Date()));
  // ?time= da URL manda; sem ele, vale a configuração salva (Configurações → Tempo do dia).
  if (!params.has("time") && settings.time !== "auto") clock.opts.forced = settings.time;
  const tamers = pickTamers(loadCharacterCatalog());
  const fxSheets = loadSheetCatalog();
  const sizeTable = SIZE_MODE === "table" ? loadSizeTable() : undefined;
  const failed = await images.loadAll([
    ...Object.values(creatures).map((c) => c.sheetUrl),
    ...[tamers.local, tamers.remote].flatMap((t) => (t ? imageUrlsOf(t) : [])),
    ...fxSheets.map((s) => s.url),
  ]);
  if (fxSheets.length) console.info(`04-effects: ${fxSheets.length} folha(s) de VFX do game-art`, fxSheets.map((s) => `${s.archetype}/${s.phase}`));
  if (failed.length) console.warn("assets não carregados:", failed);
  const tamerLevels: Record<string, number> = Object.fromEntries(FOREST_PROOF_SCENE.players.map((p) => [p.id, p.tamerLevel]));
  const tamerTints = Object.fromEntries(FOREST_PROOF_SCENE.players.filter((p) => p.tint).map((p) => [p.id, p.tint]));
  /** Desbloqueio de regiões (?desbloquear=1 libera todas, para testes). */
  const progress = (): Progress => ({ tamerLevel: hud.tamerProgress().level, defeatedBosses: [], all: params.get("desbloquear") === "1" });

  /**
   * Monta um mapa: sim (cena com bots só na floresta), tiles do pacote da região (dia/noite), visual e apresentação.
   * `carry` = save do estado atual (parceira, golpes, bits, Digidex, AUTO), aplicado por cima da sim nova.
   */
  async function buildMap(mapId: string, start: string | undefined, carry?: SaveData): Promise<Live> {
    const def = regionMode ? MAPS[mapId] ?? MAPS[DEFAULT_MAP] : undefined;
    const opts = { auto, localName: look.name, start, ...(newStarter && !carry ? { partnerSpecies: starter!, partnerLevel: STARTER_LEVEL } : {}) };
    const { sim, events } = def ? createMapWorld(parseTiledMap(def.id, def.tmj), def.scene, SEED, opts) : createDefaultWorld(SEED, { auto });
    if (carry) {
      applySave(sim, LOCAL_PLAYER, carry);
      if (auto) getPlayer(sim.state, LOCAL_PLAYER)!.auto = true;
    }
    let tiles = loadTileSources(TILES_DWDS, globalTileFilter);
    let nightTiles: typeof tiles | undefined;
    if (def) {
      const day = loadSceneTiles(def.pack, "day", usedKeys(sim.map), TILES_DWDS);
      const night = loadSceneTiles(def.pack, "night", usedKeys(sim.map), TILES_DWDS);
      tiles = day.tiles;
      nightTiles = night.tiles;
      console.info(`${def.id} · ${packSummary(def.pack, "day", day)} · ${packSummary(def.pack, "night", night)}`, day.missing, night.missing);
    }
    const tFailed = await images.loadAll([...Object.values(tiles), ...Object.values(nightTiles ?? {})].map((t) => t.url));
    if (tFailed.length) console.warn("tiles não carregados:", tFailed);
    const ids = sim.state.players.map((p) => p.id);
    const tv = tamerVisuals(ids, look, SEED, (id) => sim.state.entities.find((e) => e.id === getPlayer(sim.state, id)?.tamerId)?.name ?? id);
    const tvFailed = await images.loadAll(Object.values(tv).flatMap(imageUrlsOf));
    if (tvFailed.length) console.warn("Tamers v3 não carregados:", tvFailed);
    const view = new WorldView(canvas, sim.map, creatures, tiles, images, browserCanvasFactory, {
      creatureScale: CREATURE_SCALE,
      sizeTable,
      tamers,
      smoothing: SMOOTH,
      tamerVisuals: tv,
      tamerLevels: def ? tamerLevels : undefined,
      tamerTints: def?.scene ? tamerTints : undefined,
      trees: def?.pack.trees,
      smoothAutotile: def?.pack.smoothAutotile,
      fxSheets: fxSheets.length ? sheetDrawer(fxSheets, (url) => images.get(url) as CanvasImageSource | undefined) : undefined,
    });
    if (nightTiles) view.setNightTiles(nightTiles);
    const presenter = new Presenter((id) => (id ? creatures[id]?.manifest : undefined), LOCAL_PLAYER);
    // Os spawns saíram antes do save: atualiza a foto de quem mudou (parceira restaurada/evoluída).
    for (const ev of events) {
      const e = ev.t === "spawn" ? getEntity(sim.state, ev.entity.id) : undefined;
      if (ev.t === "spawn" && e) ev.entity = snapshotOf(e);
    }
    presenter.onTick(snapshot(sim), events, performance.now());
    console.info(
      `GS-003 world · mapa ${sim.map.id} · criaturas ${Object.keys(creatures).length} · tiles ${Object.keys(tiles).length} (DS: ${countDwdsSources(tiles)}) · ` +
        `Tamer ${tamers.local?.manifest.id ?? "placeholder"}/${tamers.remote?.manifest.id ?? "placeholder"} · tamanho ${sizeTable ? `tabela (${Object.keys(sizeTable).length})` : "nativo DS"}`,
    );
    return { mapId: def?.id ?? "meadow", def, sim, view, presenter, spawnEvents: events };
  }

  // Mapa inicial: o do save, ?map=praia|vila, ou a floresta da prova.
  const firstMap = regionMode ? (MAPS[params.get("map") ?? ""] ? params.get("map")! : loaded.ok && MAPS[loaded.data.map] ? loaded.data.map : DEFAULT_MAP) : "meadow";
  let cur = await buildMap(firstMap, undefined);
  // Restaura o progresso e credita o tempo ausente (?offline=MIN simula MIN minutos fora, para testar/capturar).
  let bootOffline: OfflineReport | null = null;
  let speciesBefore = "";
  if (loaded.ok) {
    applySave(cur.sim, LOCAL_PLAYER, loaded.data);
    if (auto) getPlayer(cur.sim.state, LOCAL_PLAYER)!.auto = true;
    speciesBefore = loaded.data.partner.speciesId;
    const away = params.has("offline") ? Number(params.get("offline")) * 60_000 : Date.now() - loaded.savedAt;
    bootOffline = applyOffline(cur.sim, LOCAL_PLAYER, away, offlineSeed(loaded.savedAt));
    console.info(`save v${loaded.migratedFrom ? `${loaded.migratedFrom}→` : ""}ok · ausente ${Math.round(away / 60_000)} min`, bootOffline ?? "sem crédito offline");
    for (const ev of cur.spawnEvents) {
      const e = ev.t === "spawn" ? getEntity(cur.sim.state, ev.entity.id) : undefined;
      if (ev.t === "spawn" && e) ev.entity = snapshotOf(e);
    }
    cur.presenter = new Presenter((id) => (id ? creatures[id]?.manifest : undefined), LOCAL_PLAYER);
    cur.presenter.onTick(snapshot(cur.sim), cur.spawnEvents, performance.now());
  }
  console.info(`Tamer ${look.name}: ${lookKey(look)} (preset v3)`);
  const intents: Intent[] = [];
  const player = () => getPlayer(cur.sim.state, LOCAL_PLAYER)!;
  const me = FOREST_PROOF_SCENE.players.find((p) => p.id === LOCAL_PLAYER)!;
  const regionName = (d?: MapDef) => (d ? regionById(d.region)?.name ?? d.id : "Prado");
  const hudScene: HudScene | undefined = regionMode
    ? {
        region: { name: regionName(cur.def), route: cur.def!.route },
        tamerName: look.name,
        tamerLevel: me.tamerLevel,
        tamerXp: FOREST_PROOF_SCENE.tamerXp,
        // Jogo novo com inicial: a equipe é só a parceira; sem criador (capturas), a equipe placeholder da cena.
        team: loaded.ok ? loaded.data.team : newStarter ? [] : FOREST_PROOF_SCENE.team,
        box: FOREST_PROOF_SCENE.box,
        chat: FOREST_PROOF_SCENE.chat,
      }
    : undefined;
  const hud = new Hud(
    hudRoot,
    cur.sim.content,
    LOCAL_PLAYER,
    {
      onAuto: (on) => intents.push({ t: "set_auto", playerId: LOCAL_PLAYER, on }),
      onFlee: () => intents.push({ t: "flee", playerId: LOCAL_PLAYER }),
      onUseMove: (slot) => intents.push({ t: "use_move", playerId: LOCAL_PLAYER, slot }),
      onSetMoves: (slots) => intents.push({ t: "set_moves", playerId: LOCAL_PLAYER, slots }),
      onSetAutoRules: (rules) => intents.push({ t: "set_auto_priority", playerId: LOCAL_PLAYER, rules }),
      // Com ramificação, "Evoluir" abre a escolha; com um caminho só, evolui direto (como antes).
      onEvolve: () => (isBranching(cur.sim.content.moves, getEntity(cur.sim.state, player().partnerId)?.speciesId ?? "") ? openEvolve(true) : intents.push({ t: "evolve", playerId: LOCAL_PLAYER })),
      onSetEvoPref: (from, to) => intents.push({ t: "set_evo_pref", playerId: LOCAL_PLAYER, from, to }),
      onAutoEvolve: (on) => intents.push({ t: "set_auto_evolve", playerId: LOCAL_PLAYER, on }),
      onShortcut: (id) => openScreen(id),
    },
    player().auto,
    {
      scene: hudScene,
      portrait: makePortraitFn(creatures, images),
      minimap: new Minimap(cur.sim.map, browserCanvasFactory),
      moveIcon: drawMoveIcon,
      shortcuts: regionMode ? ["map", "dex", "inv", "quest", "gear"] : [],
    },
  );
  hud.onEvents(cur.spawnEvents);
  hud.setAutoEvolve(!!player().autoEvolve);
  if (loaded.ok) hud.setTamerProgress(loaded.data.tamerLevel, loaded.data.tamerXp);

  // ---- save (a cada 5 s, ao esconder a aba e ao sair) e relatório offline ----
  const portrait = makePortraitFn(creatures, images);
  const capture = (): SaveData => {
    const t = hud.tamerProgress();
    return captureSave(cur.sim, LOCAL_PLAYER, {
      tamer: look, tamerLevel: t.level, tamerXp: t.xp, team: hudScene?.team ?? [], starter, map: cur.mapId,
      seen: [...seen], inventory: { ...inventory }, quests: { ...quests, kills: { ...quests.kills }, claimed: [...quests.claimed] }, settings: { ...settings },
    });
  };
  let resetting = false;
  const persist = () => {
    tamerLevels[LOCAL_PLAYER] = hud.tamerProgress().level;
    quests = rollDay(quests, dayKey(new Date()));
    if (storage && !resetting) saveToStorage(storage, capture(), Date.now());
  };
  /** Digivice: toda espécie que aparece (selvagem, parceira, evolução) conta como vista. */
  const trackSeen = (evs: WorldEvent[]) => {
    for (const ev of evs) {
      if (ev.t === "spawn" && ev.entity.speciesId && ev.entity.kind !== "remote_partner") seen.add(ev.entity.speciesId);
      else if (ev.t === "evolve") seen.add(ev.to);
    }
  };
  trackSeen(cur.spawnEvents);
  const report = (r: OfflineReport, from: string) => {
    const partner = getEntity(cur.sim.state, player().partnerId)!;
    const tamerUp = hud.addTamerXp(r.xp);
    tamerLevels[LOCAL_PLAYER] = hud.tamerProgress().level;
    showOfflineReport(hudRoot, cur.sim.content, { report: r, partnerName: partner.name, speciesFrom: from, tamerLevels: tamerUp, autoEvolve: !!player().autoEvolve }, {
      portrait: (c, sp) => portrait(sp, c),
    });
    persist();
  };
  if (bootOffline) report(bootOffline, speciesBefore);
  persist();
  if (storage) {
    setInterval(persist, 5000);
    let hiddenAt = 0;
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        hiddenAt = Date.now();
        persist();
        return;
      }
      // Aba de volta: o rAF ficou parado; credita o tempo fora pelo mesmo caminho offline (com teto).
      const away = hiddenAt ? Date.now() - hiddenAt : 0;
      hiddenAt = 0;
      if (away < offlineBalance(cur.sim).minSeconds * 1000) return;
      const from = getEntity(cur.sim.state, player().partnerId)?.speciesId ?? "";
      const r = applyOffline(cur.sim, LOCAL_PLAYER, away, offlineSeed(Date.now()));
      if (!r) return;
      const evo = r.events.filter((e) => e.t === "evolve");
      cur.presenter.onTick(snapshot(cur.sim), evo, performance.now());
      hud.onEvents(evo);
      report(r, from);
    });
    window.addEventListener("pagehide", persist);
  }

  // ---- troca de mapa: saídas na borda (portais do mapa) e Mapa-múndi, com fade ----
  const fade = document.createElement("div");
  fade.className = "map-fade";
  fade.setAttribute("aria-hidden", "true");
  document.body.appendChild(fade);
  let traveling = false;
  /** Depois de chegar (ou de um aviso de bloqueio), o portal só arma de novo quando o Tamer sai de cima dele. */
  let portalArmed = false;
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  async function travel(mapId: string, start: string | undefined): Promise<void> {
    if (traveling || !regionMode) return;
    traveling = true;
    panels.map.close();
    fade.classList.add("on");
    await sleep(320);
    const carry = capture();
    const next = await buildMap(mapId, start, carry);
    cur = next;
    hud.setRegion(regionName(cur.def), cur.def?.route ?? "");
    hud.setMinimap(new Minimap(cur.sim.map, browserCanvasFactory));
    hud.onEvents(cur.spawnEvents);
    trackSeen(cur.spawnEvents);
    const pos = view().motionPos(LOCAL_PLAYER);
    if (pos) view().follow({ x: pos.x, y: pos.y + HUD_BOTTOM_PX / 2 / scale }, 10_000, { x: 0, y: 0 });
    portalArmed = false;
    persist();
    hud.toast(`${regionName(cur.def)}`);
    fade.classList.remove("on");
    await sleep(320);
    traveling = false;
  }
  const checkPortal = () => {
    if (!cur.def || traveling) return;
    const e = getEntity(cur.sim.state, LOCAL_PLAYER);
    if (!e) return;
    const p = portalAt(cur.sim.map, subToPx(e.x), subToPx(e.y));
    if (!p) {
      portalArmed = true;
      return;
    }
    if (!portalArmed) return;
    portalArmed = false;
    const dest = MAPS[p.to];
    const t = dest ? canTravel(dest.region, progress()) : { ok: false, reason: "Destino sem mapa" };
    if (!t.ok) hud.toast(`${dest ? regionName(dest) : p.to}: ${t.reason}`);
    else void travel(p.to, p.toStart);
  };

  // ---- telas secundárias (modais) ----
  const panels = {
    map: new Panel(hudRoot, "map", "Mapa-múndi", "map"),
    dex: new Panel(hudRoot, "dex", "Digivice", "dex"),
    inv: new Panel(hudRoot, "inv", "Inventário", "chest"),
    quest: new Panel(hudRoot, "quest", "Missões", "quest"),
    gear: new Panel(hudRoot, "gear", "Configurações", "gear"),
    evolve: new Panel(hudRoot, "evolve", "Digivolução disponível", "evo"),
  };
  let dexSel: string | undefined;
  let confirmReset = false;
  const dexState = () => ({ seen: [...seen], scans: player().scans, captured: player().captured });
  const questList = () =>
    questViews(quests, { regionId: cur.def?.region ?? "", regionName: regionName(cur.def), scans: player().scans, captured: player().captured, hasPartner: !!getEntity(cur.sim.state, player().partnerId) });
  /** Retratos dos cards ([data-sp]); quem não foi visto vira silhueta. */
  const paintSprites = (root: HTMLElement) => {
    for (const c of root.querySelectorAll<HTMLCanvasElement>("canvas[data-sp]")) {
      portrait(c.dataset.sp!, c);
      if (!c.dataset.silhouette) continue;
      const g = c.getContext("2d");
      if (!g) continue;
      g.globalCompositeOperation = "source-in";
      g.fillStyle = "#0b0d14";
      g.fillRect(0, 0, c.width, c.height);
      g.globalCompositeOperation = "source-over";
    }
  };
  const screenHtml = (id: string): string => {
    if (id === "map") return worldMapHtml(cur.def?.region ?? "", progress());
    if (id === "dex") return digiviceHtml(cur.sim.content, dexState(), dexSel);
    if (id === "inv") return inventoryHtml(inventory, player().bits);
    if (id === "quest") return questsHtml(questList());
    return settingsHtml({ auto: player().auto, autoEvolve: !!player().autoEvolve, time: settings.time, confirmReset });
  };
  function openScreen(id: string): void {
    const p = (panels as Record<string, Panel>)[id];
    if (!p) return;
    for (const o of Object.values(panels)) if (o !== p) o.close();
    hud.closeTeam();
    confirmReset = false;
    p.open(screenHtml(id));
    paintSprites(p.body);
  }
  /** Telas abertas acompanham o jogo (bits, progresso das missões); o Digivice só muda ao clicar. */
  const refreshScreens = () => {
    for (const id of ["inv", "quest"] as const) if (panels[id].isOpen) panels[id].update(screenHtml(id));
  };
  // ---- escolha de evolução (EVOLUTION_PROPOSAL.md §4–5) ----
  /** Chave do que o jogador já viu e dispensou ("Agora não"): reabre só se mudar a espécie ou os elegíveis. */
  let evoDismissed = "";
  const evoSprite = makeSpriteFn(creatures, images);
  const evoKey = (e: Entity) => `${e.speciesId}|${statusesOf(cur.sim.content.moves, e).filter((x) => x.eligible).map((x) => x.path.to).join(",")}`;
  const evoHtml = (e: Entity) => {
    const inCombat = !canEvolveNow(e);
    return evolveChoiceHtml(cur.sim.content, { speciesId: e.speciesId!, name: e.name, level: e.level, stats: e.stats }, { pref: player().evoPrefs?.[e.speciesId!], inCombat, autoEvolve: !!player().autoEvolve });
  };
  const paintEvo = () => {
    for (const c of panels.evolve.body.querySelectorAll<HTMLCanvasElement>("canvas[data-evo-sp]")) {
      const ok = evoSprite(c.dataset.evoSp!, c, performance.now());
      c.parentElement!.classList.toggle("noart", !ok);
    }
  };
  /** Abre a escolha (manual = pelo botão Evoluir; automático = ao atingir o requisito com 2+ caminhos). */
  function openEvolve(manual = false): void {
    const e = getEntity(cur.sim.state, player().partnerId);
    if (!e || !isBranching(cur.sim.content.moves, e.speciesId!)) return;
    for (const o of Object.values(panels)) if (o !== panels.evolve) o.close();
    hud.closeTeam();
    const key = evoKey(e);
    panels.evolve.open(evoHtml(e), () => {
      if (!manual) evoDismissed = key;
    });
    panels.evolve.wrap.dataset.key = key;
    paintEvo();
  }
  panels.evolve.body.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-evolve-to]");
    if (b && !b.disabled) {
      intents.push({ t: "evolve", playerId: LOCAL_PLAYER, to: b.dataset.evolveTo! });
      panels.evolve.close();
    }
  });
  /**
   * Depois de cada passo: com ramificação, algum caminho elegível e a parceira fora de combate, abre a escolha —
   * a não ser que o Auto-evoluir vá resolver sozinho (um elegível ou preferência elegível) ou o jogador já tenha
   * dispensado este mesmo estado. Aberta, acompanha os requisitos ao vivo.
   */
  const checkEvolve = () => {
    const e = getEntity(cur.sim.state, player().partnerId);
    if (!e) return;
    const branching = isBranching(cur.sim.content.moves, e.speciesId!);
    if (panels.evolve.isOpen) {
      if (!branching) return panels.evolve.close();
      const key = evoKey(e);
      if (panels.evolve.wrap.dataset.key !== key) {
        panels.evolve.wrap.dataset.key = key;
        panels.evolve.update(evoHtml(e));
        paintEvo();
      }
      return;
    }
    if (!branching || !canEvolveNow(e) || traveling) return;
    const st = statusesOf(cur.sim.content.moves, e, (id) => !!cur.sim.content.species[id]);
    if (!st.some((x) => x.eligible)) return;
    if (player().autoEvolve && autoEvolveTarget(st, player().evoPrefs?.[e.speciesId!])) return;
    if (evoDismissed === evoKey(e) || Object.values(panels).some((p) => p.isOpen) || hud.teamOpen) return;
    openEvolve();
  };
  panels.dex.body.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>("[data-dex]");
    if (!b) return;
    dexSel = b.dataset.dex;
    panels.dex.update(screenHtml("dex"));
    paintSprites(panels.dex.body);
  });
  panels.quest.body.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-claim]");
    if (!b || b.disabled) return;
    const q = questList().find((x) => x.claimKey === b.dataset.claim);
    if (!q || q.claimed || q.progress < q.goal || !q.trackable) return;
    quests.claimed.push(q.claimKey);
    if (q.rewardBits) intents.push({ t: "add_bits", playerId: LOCAL_PLAYER, bits: q.rewardBits });
    // itens da recompensa que existem no economy.json entram no inventário
    const known = new Set(Object.values(economyJson.items).flat().map((i) => i.id));
    const src = [...QUESTS.mainQuestLine.chapters, ...QUESTS.dailyQuestPool, ...QUESTS.collectionMilestones].find((x) => x.id === q.id);
    for (const it of (src?.reward as { items?: string[] } | null)?.items ?? []) if (known.has(it)) inventory[it] = (inventory[it] ?? 0) + 1;
    hud.toast(`Missão concluída: +${q.rewardText}`);
    setTimeout(() => {
      refreshScreens();
      persist();
    }, 150);
  });
  panels.gear.body.addEventListener("click", (e) => {
    const t = e.target as HTMLElement;
    const set = t.closest<HTMLElement>("[data-set]")?.dataset.set;
    const time = t.closest<HTMLElement>("[data-time]")?.dataset.time as SettingsData["time"] | undefined;
    const reset = t.closest<HTMLElement>("[data-reset]")?.dataset.reset;
    if (set === "auto") {
      const on = !player().auto;
      player().auto = on;
      hud.setAuto(on);
      intents.push({ t: "set_auto", playerId: LOCAL_PLAYER, on });
    } else if (set === "autoEvolve") {
      const on = !player().autoEvolve;
      player().autoEvolve = on;
      hud.setAutoEvolve(on);
      intents.push({ t: "set_auto_evolve", playerId: LOCAL_PLAYER, on });
    } else if (time) {
      settings.time = time;
      clock.opts.forced = time === "auto" ? undefined : time;
    } else if (reset === "ask" || reset === "cancel") confirmReset = reset === "ask";
    else if (reset === "confirm") {
      // apaga o save e recomeça (o autosave para antes, para não regravar)
      resetting = true;
      storage?.removeItem(SAVE_KEY);
      location.reload();
      return;
    } else return;
    panels.gear.update(screenHtml("gear"));
    persist();
  });
  panels.map.body.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-travel]");
    if (!b || b.disabled) return;
    const dest = mapOfRegion(b.dataset.travel!);
    if (dest) void travel(dest.id, undefined);
  });

  // ---- escala inteira pixel-perfect ----
  let scale = 1;
  const view = () => cur.view;
  const resize = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Prova visual: enquadramento da referência (~25 × 14 tiles visíveis) → escala arredondada sobre 640 × 400.
    // ?zoom=N força a escala; o mapa de teste mantém a regra antiga (maior inteiro que caiba em 400 × 240).
    scale = ZOOM > 0 ? ZOOM : regionMode ? Math.max(1, Math.round(Math.min(vw / 640, vh / 400))) : Math.max(1, Math.floor(Math.min(vw / MIN_W, vh / MIN_H)));
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
    if (traveling) return;
    const r = canvas.getBoundingClientRect();
    const wpt = view().screenToWorld(Math.floor((e.clientX - r.left) / scale), Math.floor((e.clientY - r.top) / scale));
    const hit = pickWild(wpt.x, wpt.y);
    if (hit) intents.push({ t: "engage", playerId: LOCAL_PLAYER, targetId: hit });
    else intents.push({ t: "move_to", playerId: LOCAL_PLAYER, x: pxToSub(wpt.x), y: pxToSub(wpt.y) });
  });
  const keys = new Set<string>();
  const SCREEN_KEYS: Record<string, string> = { m: "map", v: "dex", i: "inv", q: "quest", o: "gear" };
  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if ((e.target as HTMLElement).closest?.("input, select, textarea")) return;
    if ("wasd".includes(k) && k.length === 1) keys.add(k);
    if (k === "f") intents.push({ t: "flee", playerId: LOCAL_PLAYER });
    if (k === "e" && !e.repeat) hud.toggleTeam();
    if (SCREEN_KEYS[k] && !e.repeat && regionMode && (panels as Record<string, Panel>)[SCREEN_KEYS[k]]) {
      const p = (panels as Record<string, Panel>)[SCREEN_KEYS[k]];
      if (p.isOpen) p.close();
      else openScreen(SCREEN_KEYS[k]);
    }
    if (k === "escape") {
      hud.closeTeam();
      for (const p of Object.values(panels)) p.close();
    }
    if (k >= "1" && k <= "4" && k.length === 1 && !e.repeat) intents.push({ t: "use_move", playerId: LOCAL_PLAYER, slot: Number(k) - 1 });
  });
  window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));
  window.addEventListener("blur", () => keys.clear());

  /** Clique sobre a hitbox (creature.json) de um selvagem visível. */
  function pickWild(x: number, y: number): string | undefined {
    let best: string | undefined;
    let bestY = -Infinity;
    for (const v of cur.presenter.entities.values()) {
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
    drawLabels(lctx, layoutLabels(view().labels(cur.presenter, alpha, now), measureWith(lctx, m), scale, m), m);
  };

  // ---- minimapa / coordenadas / qps (4 Hz) ----
  let lastHudWorld = 0;
  let lastScreens = 0;
  let frames = 0;
  const updateHudWorld = (now: number) => {
    frames++;
    if (now - lastHudWorld < 250) return;
    const dots: MinimapDot[] = [];
    for (const v of cur.presenter.entities.values()) {
      if (v.defeatedAt !== undefined) continue;
      const kind = v.id === LOCAL_PLAYER ? "me" : v.id === cur.presenter.localPartnerId ? "partner" : v.kind === "remote_player" ? "player" : v.kind === "wild" ? "wild" : undefined;
      if (kind) dots.push({ x: v.cur.x, y: v.cur.y, kind });
    }
    hud.updateWorld(view().motionPos(LOCAL_PLAYER), dots, lastHudWorld ? (frames * 1000) / (now - lastHudWorld) : undefined);
    if (regionMode) hud.setClock(clock.phase(now - bootAt), formatClock(clock.minutes(now - bootAt)));
    if (now - lastScreens > 1000) {
      lastScreens = now;
      refreshScreens();
    }
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
      if ((dx || dy) && !traveling) intents.push({ t: "move_dir", playerId: LOCAL_PLAYER, dx, dy });
      const evs = stepWorld(cur.sim, intents.splice(0));
      cur.presenter.onTick(snapshot(cur.sim), evs, now);
      hud.onEvents(evs);
      trackSeen(evs);
      if (cur.def) trackEvents(quests, evs, LOCAL_PLAYER, cur.def.region);
      acc -= TICK_MS;
      steps++;
    }
    if (steps === 10) acc = 0;
    if (steps) checkPortal();
    if (steps && regionMode) checkEvolve();
    cur.presenter.update(now);
    const alpha = acc / TICK_MS;
    view().update(cur.presenter, alpha, now);
    const mePos = view().motionPos(LOCAL_PLAYER);
    if (mePos) view().follow({ x: mePos.x, y: mePos.y + HUD_BOTTOM_PX / 2 / scale }, now - lastFrame, view().shakeFor(cur.presenter, now));
    lastFrame = now;
    const elapsed = now - bootAt;
    view().nightMix = regionMode ? clock.nightMix(elapsed) : 0;
    view().render(cur.presenter, alpha, now);
    drawNameplates(alpha, now);
    updateHudWorld(now);
    const partner = getEntity(cur.sim.state, player().partnerId);
    if (partner) {
      hud.updatePartner(snapshotOf(partner), partner.xp, xpToNext(cur.sim.content.balance, partner.level), player().bits);
      hud.updateMoves(movesView(cur.sim, partner, player().evoPrefs));
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  // Depuração/capturas: o estado atual (cur muda na troca de mapa; os getters sempre leem o atual).
  Object.assign(window, {
    __gs003: {
      get sim() {
        return cur.sim;
      },
      get presenter() {
        return cur.presenter;
      },
      get view() {
        return cur.view;
      },
      get mapId() {
        return cur.mapId;
      },
      hud,
      clock,
      persist,
      travel,
      panels,
      openScreen,
      openEvolve,
      /** Capturas/testes: troca a parceira (espécie + nível, stats recalculados) sem passar pelo save. */
      setPartner(speciesId: string, level: number) {
        const e = getEntity(cur.sim.state, player().partnerId)!;
        restorePartner(cur.sim, LOCAL_PLAYER, { speciesId, level, xp: 0, learned: [...e.learned], moves: [...e.moves], autoRules: e.autoRules });
        hud.onEvents([{ t: "spawn", tick: cur.sim.state.tick, entity: snapshotOf(e) }]);
        evoDismissed = "";
      },
    },
  });
}

/** Visual de cada Tamer: o local vem do criador; os bots, de presets v3 aleatórios (semente do mundo + id). */
function tamerVisuals(ids: string[], look: TamerLook, seed: number, nameOf: (id: string) => string): Record<string, CreatureVisual> {
  const out: Record<string, CreatureVisual> = {};
  for (const id of ids) {
    const v = presetVisual(id === LOCAL_PLAYER ? look : botLook(seed, id, nameOf(id)));
    if (v) out[id] = v;
  }
  return out;
}

/** Estado de golpes da parceira para o HUD (cópia somente leitura). */
function movesView(sim: WorldSim, e: Entity, evoPrefs?: Record<string, string>): MovesView {
  const st = statusesOf(sim.content.moves, e, (id) => !!sim.content.species[id]);
  const name = (id: string) => sim.content.species[id]?.name ?? id;
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
    evolve: st.length
      ? { toName: st.map((x) => name(x.path.to)).join(" ou "), level: Math.min(...st.map((x) => x.path.level)), ready: st.some((x) => x.eligible), branching: st.length > 1 }
      : undefined,
    stats: { ...e.stats },
    evoPrefs: { ...(evoPrefs ?? {}) },
  };
}

boot();
