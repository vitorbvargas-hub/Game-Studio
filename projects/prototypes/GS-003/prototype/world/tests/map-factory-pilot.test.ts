// Map Factory: piloto "Digimon Forest — Prototype 01" e os 5 modelos. Desde a R2 o mapa registrado sai do brief v2 do
// game-design com o kit forest-v7 (riacho em Z contínuo de borda a borda, ponte + vau, NPCs humanos, peças do PixelLab);
// o brief v1 (digimon-forest-01.v1.json) com o kit forest-v6 fica como regressão do adaptador. Mapa gerado = mapa
// registrado (determinismo), pacotes fp6_/fp7_ sem placeholder, 8 gates, interativos/NPC/arena na sim e um passeio do
// início até a clareira que termina num encontro.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { adaptDesignBrief, isDesignBrief, signText } from "../scripts/map-factory/adapt-brief.mjs";
import { contextFor, loadMaps, loadSpecies, MAPS_DIR, WORLD_DIR } from "../scripts/map-factory/context.mjs";
import { generateFromBrief } from "../scripts/map-factory/generate.mjs";
import { validateMap } from "../scripts/map-factory/validate.mjs";
import { extraPackTiles, loadSceneTiles, usedKeys } from "../src/assets/scene-tiles";
import { CHEST_BITS, applyOpenedChests, arenaOf, interact, nearestInteraction } from "../src/sim/interact";
import { isSolidAt, parseTiledMap } from "../src/sim/map";
import { SUB } from "../src/sim/params";
import { createMapWorld, LOCAL_PLAYER } from "../src/sim/setup";
import type { WorldEvent } from "../src/sim/types";
import { getEntity, getPlayer, stepWorld } from "../src/sim/world";
import { MAPS } from "../src/world/regions";

const readJson = (p: string) => JSON.parse(readFileSync(p, "utf8"));
const DESIGN = join(WORLD_DIR, "../../world-design/briefs");
const kitV6 = readJson(join(WORLD_DIR, "scripts/map-factory/kits/forest-v6.kit.json"));
const pilotBrief = readJson(join(DESIGN, "digimon-forest-01.json"));
const briefV1 = readJson(join(DESIGN, "digimon-forest-01.v1.json"));
const pilotBuild = readJson(join(WORLD_DIR, "scripts/map-factory/briefs/digimon-forest-01.build.json"));
const kit = readJson(join(WORLD_DIR, `scripts/map-factory/kits/${pilotBuild.kit}.kit.json`));
/** Montagem do v1: a rota do vau não existe nele; o resto dos ajustes vale igual. */
const buildV1 = { ...pilotBuild, kit: "forest-v6", routes: { rota_secundaria_riacho: pilotBuild.routes.rota_secundaria_riacho } };
const ID = "digimon-forest-01";
const def = MAPS[ID];
const map = parseTiledMap(ID, def.tmj);
const GATES = ["layers", "tile_ids", "asset_keys", "reach", "placement", "wang", "species", "portals"];

describe("Map Factory fase 2: adaptador do brief oficial do game-design", () => {
  it("reconhece o schema v1 e o mapa registrado é exatamente o que o gerador produz do brief (determinístico)", () => {
    expect(isDesignBrief(pilotBrief)).toBe(true);
    const { brief, report } = adaptDesignBrief(pilotBrief, kit, pilotBuild);
    expect(pilotBuild.kit).toBe("forest-v7");
    expect(report.some((r) => r.includes("poi-ponte-riacho") && r.includes("ponte perpendicular"))).toBe(true);
    expect(report.some((r) => r.includes("poi-vau-pedras") && r.includes("vau"))).toBe(true);
    const { tmj } = generateFromBrief(brief);
    expect(JSON.stringify(tmj)).toBe(JSON.stringify(def.tmj));
    // o texto da placa sai do effect do brief (trecho entre aspas)
    expect(signText(pilotBrief.interactables[1])).toMatch(/^Trilha principal ao norte/);
  });

  it("os 5 modelos geram e passam em 7 gates; só falha `portals` quando o destino não tem a chegada (pendência de integração)", () => {
    const report = readJson(join(WORLD_DIR, "docs/map-factory/templates-report.json")) as { id: string; gates: Record<string, string>; errors: string[] }[];
    expect(report.map((r) => r.id).sort()).toEqual(["template-cave", "template-desert", "template-forest", "template-mountain", "template-village"]);
    const maps = loadMaps([MAPS_DIR, join(WORLD_DIR, "tests/fixtures/maps/templates")]);
    for (const r of report) {
      const v = validateMap(r.id, maps[r.id].tmj, contextFor(r.id, maps, loadSpecies()));
      for (const g of v.gates) if (g.id !== "portals") expect(g.status, `${r.id}.${g.id}: ${g.errors.join("; ")}`).toBe("pass");
      // o relatório commitado bate com a validação de agora
      expect(Object.fromEntries(v.gates.map((g) => [g.id, g.status]))).toEqual(r.gates);
      for (const e of v.gates.find((g) => g.id === "portals")!.errors) expect(e).toMatch(/não tem o início|não é um mapa conhecido/);
    }
    expect(report.find((r) => r.id === "template-village")!.gates.portals).toBe("pass");
  });
});

describe("Map Factory fase 2: piloto digimon-forest-01 no jogo", () => {
  it("passa nos 8 gates do validador", () => {
    const maps = loadMaps();
    const r = validateMap(ID, maps[ID].tmj, contextFor(ID, maps, loadSpecies()));
    expect(r.gates.map((g) => g.id)).toEqual(GATES);
    for (const g of r.gates) expect(g.status, `${g.id}: ${g.errors.join("; ")}`).toBe("pass");
  });

  it("pacotes forest-v6 (fp6_) e forest-v7 (fp7_) entram aditivos: água Wang-16, ponte e props resolvem de dia e de noite, sem placeholder; o concept não entra", () => {
    const keys = usedKeys(map);
    expect(keys.filter((k) => k.startsWith("fp7_wg_c16_")).length).toBeGreaterThan(4);
    for (const k of ["fp6_bridge_h_0", "fp6_bridge_h_1", "fp6_bridge_h_2", "fp6_chest_closed", "fp7_chest_open", "fp7_sign_post_arrow", "fp6_healing_point"]) expect(keys).toContain(k);
    for (const k of ["fp7_npc_ranger", "fp7_npc_merchant", "fp7_bush_dense_secret", "fp7_boss_arena_floor", "fp7_flower_digital", "fp7_rock_small_flat"]) expect(keys).toContain(k);
    for (const preset of ["day", "night"] as const) expect(loadSceneTiles(def.pack, preset, keys).missing, preset).toEqual([]);
    // recorte da ponte: 1 tile do PNG de 96×32; Wang-16: o tile só-água (NW|NE|SW|SE = 15) é a célula (2,1) da prancha
    const extra = extraPackTiles(def.pack);
    expect(extra["fp6_bridge_h_1"].rect).toEqual([32, 0, 32, 32]);
    expect(extra["fp7_wg_c16_15"].rect).toEqual([64, 32, 32, 32]);
    expect(Object.keys(extra).filter((k) => /^fp7_wg_c16_\d+$/.test(k))).toHaveLength(16);
    expect(Object.keys(extra).some((k) => /kuwagamon|concept/.test(k))).toBe(false);
    // o fp4_ do forest-proof continua igual (nada sobrescrito)
    expect(def.pack.prefix).toBe("fp4_");
    expect(MAPS["forest-proof"].pack.extraPacks).toBeUndefined();
  });

  it("água colide, a ponte e o vau não; rochas, baú, placa e NPCs humanos colidem; cura, arbusto secreto e pedras do vau não", () => {
    const at = (tx: number, ty: number) => isSolidAt(map, tx * SUB + SUB / 2, ty * SUB + SUB / 2);
    for (const y of [3, 6]) for (const x of [27, 28, 29]) expect(at(x, y), `água ${x},${y}`).toBe(true);
    for (const y of [26, 30, 36]) for (const x of [15, 16, 17]) expect(at(x, y), `água ${x},${y}`).toBe(true);
    for (let x = 25; x <= 31; x++) expect(at(x, 9), `ponte ${x},9`).toBe(false);
    for (let x = 14; x <= 18; x++) expect(at(x, 22), `vau ${x},22`).toBe(false);
    for (const p of map.props.filter((q) => /^(fp6_(rock_big|chest_closed)|fp7_(sign_post_arrow|npc_ranger|npc_merchant))$/.test(q.key))) expect(p.solid, p.key).toBe(true);
    for (const p of map.props.filter((q) => /^fp7_(bush_dense_secret|flower_digital|mushroom_digital)$/.test(q.key))) expect(p.solid, p.key).toBe(false);
    const stones = map.props.filter((q) => Math.floor(q.y / 32 - 0.01) === 22 && q.x / 32 >= 14 && q.x / 32 < 19);
    expect(stones.length, "pedras do vau").toBeGreaterThanOrEqual(4);
    for (const p of stones) expect(p.solid, `pedra do vau ${p.key}`).toBe(false);
    const heal = map.props.find((q) => q.key === "fp6_healing_point")!;
    expect(heal.solid).toBe(false);
    expect(at(33, 21)).toBe(false);
  });

  it("interativos, NPC e arena chegam à sim: placa e NPC dão texto, baú dá bits uma vez, cura enche PV/MP, arena detecta o Tamer", () => {
    expect(map.interactables!.map((i) => `${i.kind}:${i.id}`).sort()).toEqual(["chest:interact-bau", "heal_point:interact-fonte-cura", "sign:interact-placa-entrada", "sign:interact-placa-secreta"]);
    expect(map.arenas!.map((a) => a.boss)).toEqual(["BOSS-KUWAGAMON"]);
    const { sim } = createMapWorld(map, false, 7, {});
    const npc = sim.state.entities.find((e) => e.kind === "npc")!;
    expect(npc.speciesId).toBe("CREATURE-0002");
    expect(npc.name).toBe("Gigimon Guia");
    // NPCs humanos do brief v2: sem entidade na sim, corpo parado (sprite sólido) e diálogo por proximidade
    expect(sim.state.entities.filter((e) => e.kind === "npc")).toHaveLength(1);
    expect(map.npcs!.map((n) => n.id).sort()).toEqual(["npc-guia-gigimon", "npc-merchant", "npc-ranger"]);
    expect(interact(sim, LOCAL_PLAYER, "npc-ranger", new Set())!.text).toMatch(/Kuwagamon/);
    const p = getPlayer(sim.state, LOCAL_PLAYER)!;
    const tamer = getEntity(sim.state, p.tamerId)!;
    const go = (tx: number, ty: number) => Object.assign(tamer, { x: tx * SUB + SUB / 2, y: ty * SUB + SUB / 2 });
    go(23, 31);
    expect(nearestInteraction(sim, LOCAL_PLAYER)?.id).toMatch(/npc-guia-gigimon|interact-placa-entrada/);
    expect(interact(sim, LOCAL_PLAYER, "npc-guia-gigimon", new Set())!.text).toMatch(/rotas/);
    expect(interact(sim, LOCAL_PLAYER, "interact-placa-entrada", new Set())!.text).toMatch(/Clareira Central.*Vau/);
    const opened = new Set<string>();
    const bits0 = p.bits;
    expect(interact(sim, LOCAL_PLAYER, "interact-bau", opened)!.bits).toBe(CHEST_BITS);
    expect(interact(sim, LOCAL_PLAYER, "interact-bau", opened)!.bits).toBeUndefined();
    expect(p.bits).toBe(bits0 + CHEST_BITS);
    // baú aberto troca para o 2º estado (chest_open do forest-v7)
    const chest = map.props.find((q) => q.openKey);
    expect(chest?.key).toBe("fp6_chest_closed");
    expect(applyOpenedChests(map, opened)).toBe(1);
    expect(chest!.key).toBe("fp7_chest_open");
    expect(applyOpenedChests(map, opened)).toBe(0);
    const partner = getEntity(sim.state, p.partnerId)!;
    partner.hp = 1;
    expect(interact(sim, LOCAL_PLAYER, "interact-fonte-cura", opened)!.healed).toBe(true);
    expect(partner.hp).toBe(partner.maxHp);
    go(51, 20);
    expect(arenaOf(sim, LOCAL_PLAYER)?.boss).toBe("BOSS-KUWAGAMON");
    go(25, 34);
    expect(arenaOf(sim, LOCAL_PLAYER)).toBeUndefined();
  });

  it("o jogador anda do início (chegada da Vila) até a Clareira Central e um encontro acontece no mapa", () => {
    const { sim, events } = createMapWorld(map, false, 7, { auto: true, start: "from_vila" });
    const all: WorldEvent[] = [...events];
    const W = map.width;
    const tamer = () => getEntity(sim.state, LOCAL_PLAYER)!;
    const cellOf = () => [Math.floor(tamer().x / SUB), Math.floor(tamer().y / SUB)];
    // BFS na colisão da sim, do início até o centro da clareira (28,21)
    const [sx, sy] = cellOf();
    const goal = 21 * W + 28;
    const prev = new Int32Array(W * map.height).fill(-1);
    prev[sy * W + sx] = sy * W + sx;
    const q = [sy * W + sx];
    for (let h = 0; h < q.length && prev[goal] < 0; h++)
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const x = (q[h] % W) + dx;
        const y = Math.floor(q[h] / W) + dy;
        if (x < 0 || y < 0 || x >= W || y >= map.height || map.solid[y * W + x] || prev[y * W + x] >= 0) continue;
        prev[y * W + x] = q[h];
        q.push(y * W + x);
      }
    expect(prev[goal]).toBeGreaterThanOrEqual(0);
    const route: number[] = [];
    for (let c = goal; c !== sy * W + sx; c = prev[c]) route.unshift(c);
    let ticks = 0;
    for (const c of route) {
      const target = { x: (c % W) * SUB + SUB / 2, y: Math.floor(c / W) * SUB + SUB / 2 };
      for (let k = 0; k < 40 && Math.hypot(tamer().x - target.x, tamer().y - target.y) > 2; k++, ticks++)
        all.push(...stepWorld(sim, [{ t: "move_to", playerId: LOCAL_PLAYER, ...target }]));
    }
    const [cx, cy] = cellOf();
    expect(cx >= 20 && cx < 36 && cy >= 14 && cy < 28, `terminou em ${cx},${cy} após ${ticks} ticks`).toBe(true);
    // na clareira, com AUTO, a parceira acha um selvagem e o encontro começa
    for (let k = 0; k < 600 && !all.some((e) => e.t === "encounter_start"); k++) all.push(...stepWorld(sim, []));
    const enc = all.find((e) => e.t === "encounter_start");
    expect(enc, "encontro no mapa").toBeDefined();
    // o selvagem do encontro é de um spawn do brief (Tsunomon na entrada, Gigimon/Koromon na clareira)
    const members = enc!.t === "encounter_start" ? enc!.members : [];
    const wild = all.find((e) => e.t === "spawn" && e.entity.kind === "wild" && members.includes(e.entity.id));
    expect(wild && wild.t === "spawn" ? wild.entity.speciesId : undefined).toMatch(/^CREATURE-000[258]$/);
  });
});

// QA Digimon Forest 01, P2 + R2 (brief v2): riacho contínuo em Z de borda a borda, ponte e vau, trilhas contínuas de
// largura constante, mirante seco; e, no brief v1 (regressão do adaptador), o aviso de raio de spawn recortado.
describe("Map Factory: riacho, travessias e trilhas contínuas (QA P2 / R2)", () => {
  const ground = map.tileLayers.find((l) => l.name === "ground")!;
  const water = (x: number, y: number) => map.solid[y * map.width + x] === 1 && /wg_c16/.test(ground.keys[y * map.width + x] ?? "");
  const waterRow = (y: number, x0 = 0, x1 = map.width) => {
    const xs: number[] = [];
    for (let x = x0; x < x1; x++) if (water(x, y)) xs.push(x);
    return xs;
  };

  it("o riacho segue o polígono em Z do brief, de borda a borda (norte → sul), sem ser retângulo", () => {
    const { brief } = adaptDesignBrief(pilotBrief, kit, pilotBuild);
    const river = brief.areas.find((a: { shape: string }) => a.shape === "river");
    expect(river.curve, "riacho contínuo (curve)").toBeTruthy();
    const { stats } = generateFromBrief(brief);
    expect(stats.rivers[0]).toMatchObject({ curve: true });
    expect(stats.rivers[0].cells).toBeGreaterThan(150);
    // nasce na borda norte no braço x26..30 e sai pela borda sul no braço x14..18
    expect(waterRow(0).every((x) => x >= 25 && x <= 31) && waterRow(0).length >= 3).toBe(true);
    expect(waterRow(map.height - 1).every((x) => x >= 13 && x <= 19) && waterRow(map.height - 1).length >= 3).toBe(true);
    // a curva para oeste: na linha 13 a água vai de x≤16 a x≥26
    const r13 = waterRow(13);
    expect(Math.min(...r13)).toBeLessThanOrEqual(16);
    expect(Math.max(...r13)).toBeGreaterThanOrEqual(26);
    // margem e largura variam ao longo do braço sul
    const rows = Array.from({ length: 20 }, (_, k) => waterRow(18 + k, 8, 24)).filter((r) => r.length);
    expect(new Set(rows.map((r) => r.length)).size, "largura variável").toBeGreaterThanOrEqual(2);
  });

  it("duas travessias: ponte reta perpendicular ao braço norte (+1 tile de terra em cada ponta) e vau no braço sul", () => {
    const { brief } = adaptDesignBrief(pilotBrief, kit, pilotBuild);
    const { stats } = generateFromBrief(brief);
    const [br, ford] = stats.bridges;
    expect(br).toMatchObject({ name: "poi-ponte-riacho", kind: "bridge", y: 9, h: 1 });
    expect(ford).toMatchObject({ name: "poi-vau-pedras", kind: "ford", y: 22, h: 1 });
    // a ponte cobre toda a água das linhas vizinhas no braço norte e pisa em terra nas pontas
    for (const y of [8, 10]) for (const x of waterRow(y, 22, 34)) expect(x >= br.x && x <= br.x + br.w - 1, `linha ${y} x ${x}`).toBe(true);
    expect(water(br.x, 9) || water(br.x + br.w - 1, 9)).toBe(false);
    // as duas pontas de cada travessia ficam alcançáveis (ponte e vau ligam as margens)
    for (const t of [br, ford]) {
      expect(map.reachable![t.y * map.width + t.x - 1], `${t.name} oeste`).toBe(1);
      expect(map.reachable![t.y * map.width + t.x + t.w], `${t.name} leste`).toBe(1);
    }
    // o vau aparece na curva do riacho (água rasa) e o renderer recebe o retângulo dele
    const rc = map.curves!.find((c) => c.terrain === "water")!;
    expect(rc.fords).toEqual([{ x: ford.x * 32, y: 22 * 32, w: ford.w * 32, h: 32 }]);
  });

  it("trilhas contínuas: polilinha da spline com meia-largura constante; riacho com largura suave; mirante seco e alcançável", () => {
    const paths = map.curves!.filter((c) => c.terrain === "path");
    expect(paths.length).toBeGreaterThanOrEqual(5);
    for (const c of paths) {
      expect(new Set(c.hw).size, `${c.name}: largura constante`).toBe(1);
      expect(c.points.length).toBeGreaterThan(2);
      // passo pequeno entre vértices (curva amostrada, não os waypoints)
      for (let k = 1; k < c.points.length; k++) expect(Math.hypot(c.points[k].x - c.points[k - 1].x, c.points[k].y - c.points[k - 1].y)).toBeLessThan(32);
    }
    const river = map.curves!.find((c) => c.terrain === "water")!;
    for (let k = 1; k < river.hw.length; k++) expect(Math.abs(river.hw[k] - river.hw[k - 1]), "sem salto de largura (px a cada ~meio tile)").toBeLessThan(10);
    const { report } = adaptDesignBrief(pilotBrief, kit, pilotBuild);
    expect(report.some((r) => r.includes("poi-mirante-clareira") && r.includes("em terra"))).toBe(true);
    expect(isSolidAt(map, 28 * SUB + 8, 15 * SUB + 8)).toBe(false);
    expect(map.reachable![15 * map.width + 28]).toBe(1);
  });

  it("brief v2 sem recorte de raio de spawn; no v1 o recorte gera aviso e o traçado reto da fase 2 continua disponível", () => {
    expect(adaptDesignBrief(pilotBrief, kit, pilotBuild).warnings).toEqual([]);
    const { warnings } = adaptDesignBrief(briefV1, kitV6, buildV1);
    expect(warnings.some((w) => /spawn 'spawn-palmon': radiusTiles 8 recortado/.test(w))).toBe(true);
    const v1 = adaptDesignBrief(briefV1, kitV6, buildV1).brief;
    expect(v1.areas.some((a: { shape: string; curve?: unknown }) => a.shape === "river" && !a.curve)).toBe(true);
    const flat = adaptDesignBrief(briefV1, kitV6, { ...buildV1, organic: false }).brief;
    expect(flat.areas.some((a: { shape: string }) => a.shape === "river")).toBe(false);
    expect(flat.areas.some((a: { shape: string; terrain: string }) => a.shape === "rect" && a.terrain === "water")).toBe(true);
  });
});
