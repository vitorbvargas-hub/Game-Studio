// Shell do vertical slice: loop rAF com acumulador de tick fixo (100 ms), interpolação, input → intents.
// Ordem por tick: intents → WorldSim.step → Presenter.onTick (eventos confirmados) → HUD.

import { xpToNext } from "@game/src/sim/formulas";
import { imageUrlsOf, loadCharacterCatalog, loadCreatureCatalog, pickTamers, loadSizeTable } from "./assets/creatures";
import { loadSceneTiles, packSummary, usedKeys } from "./assets/scene-tiles";
import { clockFromParams, formatClock, GameClock } from "./render/daynight";
import { botLook, defaultLook, distinctHairs, loadPresets, lookKey, presetVisual, urlsForLook, type TamerLook } from "./assets/tamer-presets";
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
import { applyOpenedChests, arenaOf, interact, nearestInteraction, type InteractResult } from "./sim/interact";
import { TICK_MS } from "./sim/params";
import { createDefaultWorld, createMapWorld, FOREST_PROOF_SCENE, LOCAL_PLAYER } from "./sim/setup";
import type { Intent, WorldEvent } from "./sim/types";
import { canEvolveNow, encounterInspect, getEntity, getPlayer, restorePartner, snapshot, snapshotOf, stepWorld } from "./sim/world";
import { autoEvolveTarget, isBranching, statusesOf } from "./sim/evolution";
import { evolveChoiceHtml } from "./ui/evolve-ui";
import "./style.css";
import { Hud, type HudScene } from "./ui/hud";
import { STARTER_LEVEL, StarterPicker } from "./ui/starter";
import { loadWorldContent } from "./sim/species";
import { Panel } from "./ui/panel";
import { worldMapHtml } from "./ui/worldmap";
import { canTravel, DEFAULT_MAP, MAPS, mapOfRegion, regionById, withLook, type MapDef, type Progress } from "./world/regions";
import { gradeTiles } from "./render/look";
import { Minimap, type MinimapDot } from "./ui/minimap";
import type { MovesView } from "./ui/moves-ui";
import { loadSheetCatalog, sheetDrawer } from "./render/vfx/engine";
import { drawMoveIcon } from "./render/vfx/icon";
import type { Entity } from "./sim/types";
import type { WorldSim } from "./sim/world";
import { ArenaScreen } from "./ui/arena";
import { ARENA_OWNER } from "./sim/arena";
import { emptyArena, type ArenaSave } from "./save/arena-league";
import vilaPack from "./data/maps/vila.aliases.json";
import { DEMO_XP_MULT, demoModeOf, demoStorage, prepareDemo } from "./save/demo";
import { PARTNER_SAVE_KEY, partnerParamOf, partnerStorage, preparePartnerTest, resolvePartnerSpecies } from "./save/partner";
import type { ScenePack } from "./assets/scene-tiles";
import { dprLayout, REF_CHAR_PX } from "./render/scale";
import { setSkipResampled } from "./render/anim";
import { EncounterFx, T_END, T_FIGHT, T_LAND, T_PLATE } from "./render/encounterFx";
import { drawTargetPlate, platesFor } from "./render/targetplate";
import { ENCOUNTER_TABLES, periodOf } from "./sim/encounters/table";
import { mountEncounterDebug } from "./ui/encdebug";
import { hudVariantOf } from "./ui/hud-v2";


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
/**
 * ?zoom=N força a escala inteira N; ?zoom=1.5x / 2x multiplica a escala automática (arredondada para inteiro: o
 * pixel continua perfeito). Sem ?zoom, o look do mapa pode trazer o seu multiplicador (v8: ×1,5).
 */
const ZOOM_RAW = (params.get("zoom") ?? "").trim().toLowerCase();
const ZOOM = /x$/.test(ZOOM_RAW) ? 0 : Math.max(0, Math.round(Number(ZOOM_RAW || 0)));
const ZOOM_MUL = /x$/.test(ZOOM_RAW) ? Math.max(0.5, Number(ZOOM_RAW.slice(0, -1)) || 1) : undefined;
/** ?look=v8: variante de look do mapa (luz, paleta, profundidade), quando o mapa tiver uma (regions.ts `looks`). */
const LOOK = params.get("look");
/**
 * ?dpr=1 (Quality Overhaul, fase 2): escala inteira em pixels FÍSICOS (devicePixelRatio), para os pixels saírem
 * iguais com o Windows em 125%/150%, e zoom alvo pela altura do personagem (`charScale`). ?charh=N muda o alvo
 * (% da altura da tela, padrão 9). ?zoom=N continua forçando a escala (agora em pixels físicos).
 */
const DPR_MODE = params.get("dpr") === "1";
const CHAR_H_PCT = Math.min(25, Math.max(3, Number(params.get("charh") ?? 9) || 9));
setSkipResampled(DPR_MODE);
/** ?anim=v2 (Quality Overhaul, fase 2): controlador de animação v2 (src/render/animctl.ts), só na apresentação. */
const ANIM_V2 = params.get("anim") === "v2";
/**
 * ?encounters=1 (GS-012 passos 5–7): encontros aleatórios na grama alta + 5 pontos visíveis no lugar das zonas de
 * spawn, nos mapas com tabela (src/sim/encounters/table.ts). ?encdebug=1 liga também o painel de debug.
 * ?weather=rain|fog|storm força o clima (não há sistema de clima; padrão "clear").
 */
const ENC_DEBUG = params.get("encdebug") === "1";
const ENCOUNTERS = params.get("encounters") === "1" || ENC_DEBUG;
const WEATHER = params.get("weather") ?? "clear";
/**
 * ?hud=v2 (Quality Overhaul P8, só os itens P0 da spec): bloco do Tamer com PV/Energia, molduras nível 1 reativas,
 * hotbar por categoria, placa de alvo por raridade e "!" com fundo, grama de encontro com vento 2×. Sem a flag, o
 * HUD atual. ?tamerhp=N (0–100, só com hud=v2) força o PV mostrado do Tamer para testar as 3 faixas da moldura.
 */
const HUD_VARIANT = hudVariantOf(params);
const HUD_V2 = HUD_VARIANT === "v2";
const TAMER_HP_FORCE = params.has("tamerhp") ? Math.max(0, Math.min(100, Number(params.get("tamerhp")) || 0)) : undefined;
/** Resolução lógica mínima; a tela é preenchida com o maior fator inteiro que caiba. */
const MIN_W = 400;
const MIN_H = 240;

/** ?demo=evo: modo de teste da evolução (XP ×25, parceira a poucas vitórias da evolução, save separado; save/demo.ts). */
const DEMO = demoModeOf(params);

/** ?partner=<espécie>: parceira de teste (ex. wargreymon) num nível do estágio, save separado; save/partner.ts. */
const PARTNER_RAW = partnerParamOf(params);

/** ?criador=0 pula o criador de Tamer (capturas/testes) e usa o visual padrão. */
const CREATOR = params.get("criador") !== "0";

/**
 * Tela do criador de Tamer v3 (antes do mundo): grade dos 12 presets do disco. Pré-carrega a cor canônica de cada
 * preset; as outras cores carregam quando escolhidas (o preview aparece assim que a imagem chega).
 */
async function chooseLook(images: ImageStore, initial: TamerLook = defaultLook()): Promise<TamerLook> {
  if (!CREATOR) return initial;
  await images.loadAll([...loadPresets().flatMap((p) => [...urlsForLook({ name: "", preset: p.id, hair: p.defaultHair }), ...p.hairs.map((h) => h.frames.S![0])]), ...urlsForLook(initial)]);
  // Cores de cabelo que não mudam nada (variantes idênticas no disco) ficam fora do criador.
  const sig = (url: string) => {
    const img = images.get(url);
    if (!img) return undefined;
    const c = browserCanvasFactory(img.width, img.height);
    const g = c.getContext("2d", { willReadFrequently: true })!;
    g.drawImage(img as CanvasImageSource, 0, 0);
    const d = g.getImageData(0, 0, img.width, img.height).data;
    let h = 2166136261;
    for (let i = 0; i < d.length; i++) h = Math.imul(h ^ d[i], 16777619);
    return `${img.width}x${img.height}:${h >>> 0}`;
  };
  const presets = loadPresets().map((p) => distinctHairs(p, sig));
  const dup = presets.filter((p) => p.hairs.length < 8).map((p) => `${p.id}:${p.hairs.length}`);
  if (dup.length) console.warn("Tamers v3: cores de cabelo idênticas no disco (só as distintas aparecem no criador):", dup.join(" "));
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
  // ?demo=evo lê o save normal só na 1ª carga e grava num slot próprio (o save normal nunca é escrito).
  const baseStorage = regionMode ? browserStorage() : undefined;
  // ?partner= também usa um slot próprio (PARTNER_SAVE_KEY) e tem prioridade sobre o do demo.
  const partnerSpecies = PARTNER_RAW ? resolvePartnerSpecies(loadWorldContent(), PARTNER_RAW) : null;
  if (PARTNER_RAW && !partnerSpecies) console.warn(`?partner=${PARTNER_RAW}: espécie desconhecida (use o id CREATURE-NNNN ou o nome)`);
  const storage = baseStorage && partnerSpecies ? partnerStorage(baseStorage) : baseStorage && DEMO ? demoStorage(baseStorage) : baseStorage;
  const loaded: LoadResult = storage && params.get("novo") !== "1" ? loadFromStorage(storage) : { ok: false, reason: "empty" };
  if (!loaded.ok && loaded.reason !== "empty") console.warn(`save ignorado (${loaded.reason}): ${loaded.detail ?? ""}`);
  // Com save, o criador só abre com ?criador=1 (trocar o visual mantendo o progresso).
  const look = loaded.ok && params.get("criador") !== "1" ? loaded.data.tamer : await chooseLook(images, loaded.ok ? loaded.data.tamer : defaultLook());
  const creatures = loadCreatureCatalog();
  // Jogo novo: depois do criador, escolhe o bebê inicial (nível 1). ?criador=0 pula as duas telas.
  // Com ?partner=, jogo novo pula a escolha do bebê: a parceira de teste entra no lugar (preparePartnerTest).
  const starter: string | null = loaded.ok ? loaded.data.starter : regionMode && partnerSpecies ? partnerSpecies : regionMode && CREATOR ? await chooseStarter(images, creatures) : null;
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
  const clockT0 = performance.now();
  /** Debug (?encdebug=1): horário forçado só para a tabela de encontros ("" = o do relógio). */
  let encTimeOverride = "";
  const encPeriod = () => encTimeOverride || periodOf(clock.phase(performance.now() - clockT0));
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
    const def0 = regionMode ? MAPS[mapId] ?? MAPS[DEFAULT_MAP] : undefined;
    const def = def0 && withLook(def0, LOOK);
    const encTable = ENCOUNTERS && def ? ENCOUNTER_TABLES[def.id] : undefined;
    const opts = {
      auto,
      localName: look.name,
      start,
      ...(newStarter && !carry ? { partnerSpecies: starter!, partnerLevel: STARTER_LEVEL } : {}),
      ...(encTable ? { world: { encounters: encTable, env: { time: encPeriod(), weather: WEATHER } } } : {}),
    };
    const { sim, events } = def ? createMapWorld(parseTiledMap(def.id, def.tmj), def.scene, SEED, opts) : createDefaultWorld(SEED, { auto });
    if (carry) {
      applySave(sim, LOCAL_PLAYER, carry);
      if (auto) getPlayer(sim.state, LOCAL_PLAYER)!.auto = true;
    }
    // O multiplicador do demo vive só na sim da sessão (não vai para o save): reaplicado a cada mapa.
    if (DEMO) getPlayer(sim.state, LOCAL_PLAYER)!.xpMult = DEMO_XP_MULT;
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
    const mapLook = def?.pack.look;
    if (mapLook) {
      // look v8: grade de cor (palette.json) na arte do cenário; criaturas, UI e emissores ficam como estão
      tiles = gradeTiles(tiles, mapLook, images, browserCanvasFactory);
      if (nightTiles) nightTiles = gradeTiles(nightTiles, mapLook, images, browserCanvasFactory, true);
      console.info(`look ${mapLook.id}: grade + ${Object.keys(mapLook.lights).length} tipos de luz`);
    }
    const ids = sim.state.players.map((p) => p.id);
    const tv = tamerVisuals(ids, look, SEED, (id) => sim.state.entities.find((e) => e.id === getPlayer(sim.state, id)?.tamerId)?.name ?? id);
    const tvFailed = await images.loadAll(Object.values(tv).flatMap(imageUrlsOf));
    if (tvFailed.length) console.warn("Tamers v3 não carregados:", tvFailed);
    const view = new WorldView(canvas, sim.map, creatures, tiles, images, browserCanvasFactory, {
      creatureScale: CREATURE_SCALE,
      unifiedScale: DPR_MODE,
      animV2: ANIM_V2,
      ...(HUD_V2 ? { encGrassSwayMul: 2 } : {}),
      sizeTable,
      tamers,
      smoothing: SMOOTH,
      tamerVisuals: tv,
      tamerLevels: def ? tamerLevels : undefined,
      tamerTints: def?.scene ? tamerTints : undefined,
      trees:
        def?.pack.trees && mapLook?.trees
          ? { ...def.pack.trees, castShadow: mapLook.trees.castShadow ?? def.pack.trees.castShadow, rimLight: def.pack.trees.rimLight && { ...def.pack.trees.rimLight, ...mapLook.trees.rimLight } }
          : def?.pack.trees,
      look: mapLook,
      smoothAutotile: def?.pack.smoothAutotile,
      fxSheets: fxSheets.length ? sheetDrawer(fxSheets, (url) => images.get(url) as CanvasImageSource | undefined) : undefined,
    });
    if (nightTiles) view.setNightTiles(nightTiles);
    if (sim.encounters)
      view.encFx = new EncounterFx({
        localPlayerId: LOCAL_PLAYER,
        nameOf: (id) => sim.content.species[id]?.name ?? id,
        // NOVO do Digidex: espécie ainda não vista (o spawn do mesmo tick ainda não entrou no `seen`)
        isNew: (id) => !seen.has(id),
        v2: HUD_V2,
      });
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
    // No demo não há crédito offline (a evolução tem de acontecer no mapa, na frente do jogador).
    const away = DEMO ? 0 : params.has("offline") ? Number(params.get("offline")) * 60_000 : Date.now() - loaded.savedAt;
    bootOffline = applyOffline(cur.sim, LOCAL_PLAYER, away, offlineSeed(loaded.savedAt));
    console.info(`save v${loaded.migratedFrom ? `${loaded.migratedFrom}→` : ""}ok · ausente ${Math.round(away / 60_000)} min`, bootOffline ?? "sem crédito offline");
    for (const ev of cur.spawnEvents) {
      const e = ev.t === "spawn" ? getEntity(cur.sim.state, ev.entity.id) : undefined;
      if (ev.t === "spawn" && e) ev.entity = snapshotOf(e);
    }
    cur.presenter = new Presenter((id) => (id ? creatures[id]?.manifest : undefined), LOCAL_PLAYER);
    cur.presenter.onTick(snapshot(cur.sim), cur.spawnEvents, performance.now());
  }
  // Demo: a parceira (do save ou a inicial nova) fica um nível antes da evolução, com a barra a ~2 vitórias de encher.
  const demoPrep = DEMO && !partnerSpecies ? prepareDemo(cur.sim, LOCAL_PLAYER) : null;
  // Parceira de teste (?partner=): troca a espécie e o nível depois do save (que já vem do slot de teste).
  const partnerPrep = partnerSpecies ? preparePartnerTest(cur.sim, LOCAL_PLAYER, partnerSpecies) : null;
  if (partnerPrep) console.info("partner", partnerPrep);
  if (demoPrep || partnerPrep) {
    for (const ev of cur.spawnEvents) {
      const e = ev.t === "spawn" ? getEntity(cur.sim.state, ev.entity.id) : undefined;
      if (ev.t === "spawn" && e) ev.entity = snapshotOf(e);
    }
    cur.presenter = new Presenter((id) => (id ? creatures[id]?.manifest : undefined), LOCAL_PLAYER);
    cur.presenter.onTick(snapshot(cur.sim), cur.spawnEvents, performance.now());
    if (demoPrep) console.info("demo=evo", demoPrep);
  }
  console.info(`Tamer ${look.name}: ${lookKey(look)} (preset v3)`);
  const intents: Intent[] = [];
  let encEnvSent = "";
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
        // Box do save (v8); jogo novo com inicial começa vazio; sem criador (capturas), o Box placeholder da cena.
        box: loaded.ok ? loaded.data.box : newStarter ? [] : FOREST_PROOF_SCENE.box,
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
      shortcuts: regionMode ? ["map", "dex", "inv", "quest", "gear", "arena"] : [],
      variant: HUD_VARIANT,
    },
  );
  hud.onEvents(cur.spawnEvents);
  hud.setAutoEvolve(!!player().autoEvolve);
  if (demoPrep) {
    const badge = document.createElement("div");
    badge.className = "demo-badge";
    badge.dataset.testid = "demo-badge";
    badge.title = "Modo de teste da evolução: XP das vitórias ×25 e save separado (o save normal não é alterado). Tire ?demo=evo da URL para voltar.";
    badge.textContent = `DEMO EVO · XP ×${DEMO_XP_MULT}`;
    hudRoot.appendChild(badge);
    const sp = cur.sim.content.species;
    hud.push(`Modo demo: XP ×${DEMO_XP_MULT}. ${sp[demoPrep.speciesId]?.name} evolui no Nv.${demoPrep.evoLevel} — vença ~2 selvagens.`, "gold");
  }
  if (partnerPrep) {
    const badge = document.createElement("div");
    badge.className = "demo-badge";
    badge.dataset.testid = "partner-badge";
    const name = cur.sim.content.species[partnerPrep.speciesId]?.name ?? partnerPrep.speciesId;
    badge.title = `Parceira de teste (${partnerPrep.speciesId}) com save separado (${PARTNER_SAVE_KEY}); o save normal não é alterado. Tire ?partner= da URL para voltar.`;
    badge.textContent = `TESTE · ${name} Nv.${partnerPrep.level}`;
    hudRoot.appendChild(badge);
    hud.push(`Parceira de teste: ${name} Nv.${partnerPrep.level} (save separado). Teclas 1–4 usam os golpes.`, "gold");
  }
  if (loaded.ok) hud.setTamerProgress(loaded.data.tamerLevel, loaded.data.tamerXp);

  // ---- save (a cada 5 s, ao esconder a aba e ao sair) e relatório offline ----
  const portrait = makePortraitFn(creatures, images);
  /** Arena local (save v8): composições, histórico e rating placeholder. */
  let arenaData: ArenaSave = loaded.ok ? loaded.data.arena : emptyArena();
  const capture = (): SaveData => {
    const t = hud.tamerProgress();
    return captureSave(cur.sim, LOCAL_PLAYER, {
      tamer: look, tamerLevel: t.level, tamerXp: t.xp, team: hudScene?.team ?? [], box: hudScene?.box ?? [], arena: arenaData, starter, map: cur.mapId,
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
    resize();
    hud.setRegion(regionName(cur.def), cur.def?.route ?? "");
    hud.setMinimap(new Minimap(cur.sim.map, browserCanvasFactory));
    hud.onEvents(cur.spawnEvents);
    trackSeen(cur.spawnEvents);
    const pos = view().motionPos(LOCAL_PLAYER);
    if (pos) view().follow({ x: pos.x, y: pos.y + HUD_BOTTOM_PX / 2 / cssPerLogical }, 10_000, { x: 0, y: 0 });
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

  // ---- interativos do mapa (Map Factory): placa, baú, cura e NPC ao chegar perto; aviso na arena do chefe ----
  /** Baús já abertos nesta sessão (`<mapa>:<id>`; não vai para o save). */
  const openedChests = new Set<string>();
  let lastInteract = "";
  let lastArena = "";
  const interactions: InteractResult[] = [];
  let chestsShown: unknown;
  const checkInteract = () => {
    if (!cur.def || traveling) return;
    // baú já aberto (nesta sessão) aparece aberto ao voltar ao mapa
    if (chestsShown !== cur.sim.map) {
      applyOpenedChests(cur.sim.map, openedChests);
      chestsShown = cur.sim.map;
    }
    const near = nearestInteraction(cur.sim, LOCAL_PLAYER);
    const key = near ? `${cur.mapId}:${near.id}` : "";
    // dispara uma vez ao chegar; só arma de novo depois de sair do alcance
    if (near && key !== lastInteract) {
      const r = interact(cur.sim, LOCAL_PLAYER, near.id, openedChests);
      if (r) {
        interactions.push(r);
        if (ANIM_V2 && cur.presenter.localPartnerId) cur.view.notifyInteract(cur.presenter.localPartnerId, performance.now());
        if (r.kind === "chest") applyOpenedChests(cur.sim.map, openedChests);
        hud.toast(r.kind === "npc" ? `${r.title}: ${r.text}` : r.text);
      }
    }
    lastInteract = key;
    const a = arenaOf(cur.sim, LOCAL_PLAYER);
    const ak = a ? `${cur.mapId}:${a.id}` : "";
    if (a && ak !== lastArena) {
      const boss = a.boss.replace(/^BOSS-/, "").toLowerCase().replace(/^./, (c) => c.toUpperCase());
      hud.toast(`Covil de ${boss}: a luta de chefe ainda não existe nesta prova`);
      interactions.push({ id: a.id, kind: "arena", title: boss, text: a.boss });
    }
    lastArena = ak;
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
    if (id === "arena") return openArena();
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
    if (!branching || !canEvolveNow(e) || e.evolveLockTicks || traveling) return;
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
  // ---- Arena PvP local (GS-006): tela cheia; o mundo fica pausado enquanto ela está aberta ----
  const arenaSprite = makePortraitFn(creatures, images);
  const arena = new ArenaScreen({
    root: document.body,
    content: cur.sim.content,
    owned: () => {
      const d = capture();
      return { partner: d.partner, team: d.team, box: d.box };
    },
    arena: () => arenaData,
    setArena: (a) => {
      arenaData = a;
      persist();
    },
    portrait: (sp, c) => arenaSprite(sp, c),
    moveIcon: drawMoveIcon,
    makeView: async (cnv, map, underlay) => {
      const t = loadSceneTiles(vilaPack as ScenePack, "day", usedKeys(map), TILES_DWDS);
      const urls = usedKeys(map).map((k) => t.tiles[k]?.url).filter((u): u is string => !!u);
      const failed = await images.loadAll(urls);
      if (failed.length || t.missing.length) console.warn("arena: tiles", failed, t.missing);
      return new WorldView(cnv, map, creatures, t.tiles, images, browserCanvasFactory, {
        creatureScale: CREATURE_SCALE,
        unifiedScale: DPR_MODE,
        animV2: ANIM_V2,
        sizeTable,
        tamers,
        smoothing: SMOOTH,
        fxSheets: fxSheets.length ? sheetDrawer(fxSheets, (url) => images.get(url) as CanvasImageSource | undefined) : undefined,
        underlay,
      });
    },
    newPresenter: () => new Presenter((id) => (id ? creatures[id]?.manifest : undefined), ARENA_OWNER[0]),
    seed: () => (params.has("arenaSeed") ? Number(params.get("arenaSeed")) : Date.now() % 1_000_000),
    roundTicks: params.has("arenaRound") ? Math.max(5, Number(params.get("arenaRound"))) * (1000 / TICK_MS) : undefined,
    onClose: () => {
      keys.clear();
      last = performance.now();
      acc = 0;
    },
  });
  function openArena(): void {
    if (!regionMode || traveling) return;
    for (const o of Object.values(panels)) o.close();
    hud.closeTeam();
    persist();
    arena.open();
  }
  panels.map.body.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest("[data-arena]")) return openArena();
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-travel]");
    if (!b || b.disabled) return;
    const dest = mapOfRegion(b.dataset.travel!);
    if (dest) void travel(dest.id, undefined);
  });

  // ---- escala inteira pixel-perfect ----
  /** Pixels do canvas de nomes (e, com ?dpr=1, pixels físicos) por pixel lógico. */
  let scale = 1;
  /** Pixels CSS por pixel lógico (clique e deslocamento do HUD). Sem ?dpr=1 é igual a `scale`. */
  let cssPerLogical = 1;
  const view = () => cur.view;
  const resize = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (DPR_MODE) {
      const r = dprLayout(vw, vh, window.devicePixelRatio || 1, { zoom: ZOOM, charPct: CHAR_H_PCT, refCharPx: REF_CHAR_PX });
      scale = r.scale;
      cssPerLogical = r.cssPerLogical;
      canvas.width = r.logicalW;
      canvas.height = r.logicalH;
      canvas.style.width = `${r.cssW}px`;
      canvas.style.height = `${r.cssH}px`;
      labelCanvas.width = r.logicalW * r.scale;
      labelCanvas.height = r.logicalH * r.scale;
      labelCanvas.style.width = `${r.cssW}px`;
      labelCanvas.style.height = `${r.cssH}px`;
      return;
    }
    // Prova visual: enquadramento da referência (~25 × 14 tiles visíveis) → escala arredondada sobre 640 × 400.
    // ?zoom=N força a escala; o mapa de teste mantém a regra antiga (maior inteiro que caiba em 400 × 240).
    const auto = regionMode ? Math.max(1, Math.round(Math.min(vw / 640, vh / 400))) : Math.max(1, Math.floor(Math.min(vw / MIN_W, vh / MIN_H)));
    const mul = ZOOM_MUL ?? cur.def?.pack.look?.zoomMul ?? 1;
    scale = ZOOM > 0 ? ZOOM : Math.max(1, Math.round(Math.min(vw / 640, vh / 400) * mul) || auto);
    if (ZOOM <= 0 && mul === 1) scale = auto;
    canvas.width = Math.ceil(vw / scale);
    canvas.height = Math.ceil(vh / scale);
    canvas.style.width = `${canvas.width * scale}px`;
    canvas.style.height = `${canvas.height * scale}px`;
    labelCanvas.width = canvas.width * scale;
    labelCanvas.height = canvas.height * scale;
    labelCanvas.style.width = `${labelCanvas.width}px`;
    labelCanvas.style.height = `${labelCanvas.height}px`;
    cssPerLogical = scale;
  };
  window.addEventListener("resize", resize);
  resize();

  // ---- input: clique/toque e WASD ----
  canvas.addEventListener("pointerdown", (e) => {
    if (traveling) return;
    const r = canvas.getBoundingClientRect();
    const wpt = view().screenToWorld(Math.floor((e.clientX - r.left) / cssPerLogical), Math.floor((e.clientY - r.top) / cssPerLogical));
    const hit = pickWild(wpt.x, wpt.y);
    if (hit) intents.push({ t: "engage", playerId: LOCAL_PLAYER, targetId: hit });
    else intents.push({ t: "move_to", playerId: LOCAL_PLAYER, x: pxToSub(wpt.x), y: pxToSub(wpt.y) });
  });
  const keys = new Set<string>();
  const SCREEN_KEYS: Record<string, string> = { m: "map", v: "dex", i: "inv", q: "quest", o: "gear" };
  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (arena.isOpen) return;
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
  const rarityById = new Map<string, string>();
  const drawNameplates = (alpha: number, now: number) => {
    lctx.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
    const m = labelMetrics(scale);
    // P8 v2: a placa de alvo/identificação substitui o rótulo comum (e a barra de PV do mundo) do alvo da parceira
    const plates = HUD_V2 ? currentPlates(now) : [];
    if (HUD_V2) view().plateIds = new Set(plates.map((p) => p.id));
    drawLabels(lctx, layoutLabels(view().labels(cur.presenter, alpha, now), measureWith(lctx, m), scale, m), m);
    const k = Math.max(1, Math.round(scale / cssPerLogical));
    for (const pl of plates) {
      const a = view().plateAnchor(cur.presenter, pl.id, alpha, now);
      if (a) drawTargetPlate(lctx, pl, a.x * scale, a.y * scale, k);
    }
  };
  /** Raridade de um selvagem: a do sorteio (wild_appear); senão a da entrada visível da tabela; senão comum. */
  const rarityOf = (id: string, speciesId?: string): string =>
    rarityById.get(id) ?? cur.sim.encounters?.table.entries.find((e) => e.speciesId === speciesId && e.mode !== "random")?.rarity ?? "common";
  const currentPlates = (now: number) => {
    const intro = view().encFx?.intro(now);
    const tid = getEntity(cur.sim.state, player().partnerId)?.targetId;
    const te = tid ? getEntity(cur.sim.state, tid) : undefined;
    const shown = te && te.kind === "wild" ? view().hpShown(cur.presenter, te.id, now) : undefined;
    const target = shown && te ? { id: te.id, name: shown.name, level: shown.level, hp: shown.hp, maxHp: shown.maxHp, rarity: rarityOf(te.id, shown.speciesId) } : undefined;
    return platesFor(intro, target, { land: T_LAND, fight: T_FIGHT, fadeFrom: T_PLATE, end: T_END }, Math.floor(now / 120) % 2 === 0);
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
    if (arena.isOpen) {
      // Arena aberta: o mundo pausa (sem passo, sem render); volta do ponto em que parou.
      last = now;
      requestAnimationFrame(frame);
      return;
    }
    acc += Math.min(1000, now - last);
    last = now;
    let steps = 0;
    while (acc >= TICK_MS && steps < 10) {
      const dx = (keys.has("d") ? 1 : 0) - (keys.has("a") ? 1 : 0);
      const dy = (keys.has("s") ? 1 : 0) - (keys.has("w") ? 1 : 0);
      if ((dx || dy) && !traveling) intents.push({ t: "move_dir", playerId: LOCAL_PLAYER, dx, dy });
      if (cur.sim.encounters) {
        // a sim só sabe que horas são por aqui (determinismo): manda o período quando ele muda
        const env = `${encPeriod()}|${WEATHER}`;
        if (env !== encEnvSent) intents.push({ t: "set_env", playerId: LOCAL_PLAYER, time: encPeriod(), weather: WEATHER });
        encEnvSent = env;
      }
      const evs = stepWorld(cur.sim, intents.splice(0));
      view().encFx?.onEvents(evs, now);
      for (const ev of evs) if (ev.t === "wild_appear") rarityById.set(ev.id, ev.rarity);
      for (const ev of evs)
        if (ev.t === "wild_appear" && ev.random && ev.playerId === LOCAL_PLAYER) {
          const nm = cur.sim.content.species[ev.speciesId]?.name ?? ev.speciesId;
          const rar = { common: "", uncommon: " (incomum)", rare: " (raro!)", very_rare: " (muito raro!!)" }[ev.rarity] ?? "";
          hud.push(`Um ${nm} selvagem saltou da grama!${rar}`, ev.rarity === "very_rare" || ev.rarity === "rare" ? "gold" : "");
        }
      cur.presenter.onTick(snapshot(cur.sim), evs, now);
      hud.onEvents(evs);
      trackSeen(evs);
      if (cur.def) trackEvents(quests, evs, LOCAL_PLAYER, cur.def.region);
      acc -= TICK_MS;
      steps++;
    }
    if (steps === 10) acc = 0;
    if (steps) checkPortal();
    if (steps) checkInteract();
    if (steps && regionMode) checkEvolve();
    cur.presenter.update(now);
    const alpha = acc / TICK_MS;
    view().update(cur.presenter, alpha, now);
    const mePos = view().motionPos(LOCAL_PLAYER);
    // GS-012: durante o salto da grama a câmera puxa um pouco em direção ao selvagem (no lugar de zoom fracionário)
    const encBias = view().encFx?.cameraBias(now, mePos) ?? { x: 0, y: 0 };
    if (mePos) view().follow({ x: mePos.x + encBias.x, y: mePos.y + encBias.y + HUD_BOTTOM_PX / 2 / cssPerLogical }, now - lastFrame, view().shakeFor(cur.presenter, now));
    lastFrame = now;
    const elapsed = now - bootAt;
    view().nightMix = regionMode ? clock.nightMix(elapsed) : 0;
    view().render(cur.presenter, alpha, now);
    drawNameplates(alpha, now);
    updateHudWorld(now);
    const partner = getEntity(cur.sim.state, player().partnerId);
    if (partner) {
      // O painel mostra a forma que está na tela: durante a digivolução, a antiga até o clarão.
      const shown = snapshotOf(partner);
      const pv = cur.presenter.entities.get(partner.id);
      if (pv?.evo && !pv.evo.revealed) Object.assign(shown, { speciesId: pv.speciesId, name: pv.name });
      else if (hud.evolvePending) hud.releaseEvolve();
      hud.updatePartner(shown, partner.xp, xpToNext(cur.sim.content.balance, partner.level), player().bits);
      hud.updateMoves(movesView(cur.sim, partner, player().evoPrefs));
    }
    if (HUD_V2) {
      // Tamer: a sim não dá dano ao Tamer hoje (PV sempre cheio); a Energia ainda não tem regra (só visual, cheia)
      const t = getEntity(cur.sim.state, player().tamerId);
      const maxHp = t?.maxHp || 100;
      const hp = TAMER_HP_FORCE !== undefined ? Math.round((maxHp * TAMER_HP_FORCE) / 100) : t?.hp ?? maxHp;
      hud.updateTamer({ name: t?.name ?? "Tamer", level: hud.tamerProgress().level, hp, maxHp, energy: 1, maxEnergy: 1 });
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  if (ENC_DEBUG)
    mountEncounterDebug(document.body, {
      inspect: () => encounterInspect(cur.sim, LOCAL_PLAYER),
      entries: () => (cur.sim.encounters?.table.entries ?? []).filter((e) => e.mode !== "visible").map((e) => ({ id: e.id, name: e.name, rarity: e.rarity })),
      force: (entryId, rarity) => intents.push({ t: "enc_force", playerId: LOCAL_PLAYER, ...(entryId ? { entryId } : {}), ...(rarity ? { rarity } : {}) }),
      setTime: (t) => {
        encTimeOverride = t;
      },
    });
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
      /** Escala atual (capturas da fase 2): pixels físicos/CSS por pixel lógico e o modo. */
      get scaleInfo() {
        return { scale, cssPerLogical, dpr: window.devicePixelRatio || 1, dprMode: DPR_MODE, logicalW: canvas.width, logicalH: canvas.height, charPct: CHAR_H_PCT };
      },
      /** GS-012: estado dos encontros (painel de debug, capturas e o passeio automatizado). */
      encounters: () => encounterInspect(cur.sim, LOCAL_PLAYER),
      forceEncounter: (entryId?: string, rarity?: string) => intents.push({ t: "enc_force", playerId: LOCAL_PLAYER, ...(entryId ? { entryId } : {}), ...(rarity ? { rarity } : {}) }),
      /** Interações disparadas (Map Factory: placa, baú, cura, NPC, arena), para capturas e testes. */
      interactions,
      hud,
      clock,
      persist,
      travel,
      panels,
      openScreen,
      arena,
      openArena,
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
