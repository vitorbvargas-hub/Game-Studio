// Map Factory, fase 2: piloto "Digimon Forest — Prototype 01" (brief do game-design + kit forest-v6) e os 5 modelos.
// Adaptador do schema oficial, mapa gerado = mapa registrado (determinismo), pacote fp6_ sem placeholder, 8 gates,
// interativos/NPC/arena na sim e um passeio do início até a clareira que termina num encontro.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { adaptDesignBrief, isDesignBrief, signText } from "../scripts/map-factory/adapt-brief.mjs";
import { contextFor, loadMaps, loadSpecies, MAPS_DIR, WORLD_DIR } from "../scripts/map-factory/context.mjs";
import { generateFromBrief } from "../scripts/map-factory/generate.mjs";
import { validateMap } from "../scripts/map-factory/validate.mjs";
import { extraPackTiles, loadSceneTiles, usedKeys } from "../src/assets/scene-tiles";
import { CHEST_BITS, arenaOf, interact, nearestInteraction } from "../src/sim/interact";
import { isSolidAt, parseTiledMap } from "../src/sim/map";
import { SUB } from "../src/sim/params";
import { createMapWorld, LOCAL_PLAYER } from "../src/sim/setup";
import type { WorldEvent } from "../src/sim/types";
import { getEntity, getPlayer, stepWorld } from "../src/sim/world";
import { MAPS } from "../src/world/regions";

const readJson = (p: string) => JSON.parse(readFileSync(p, "utf8"));
const DESIGN = join(WORLD_DIR, "../../world-design/briefs");
const kit = readJson(join(WORLD_DIR, "scripts/map-factory/kits/forest-v6.kit.json"));
const pilotBrief = readJson(join(DESIGN, "digimon-forest-01.json"));
const pilotBuild = readJson(join(WORLD_DIR, "scripts/map-factory/briefs/digimon-forest-01.build.json"));
const ID = "digimon-forest-01";
const def = MAPS[ID];
const map = parseTiledMap(ID, def.tmj);
const GATES = ["layers", "tile_ids", "asset_keys", "reach", "placement", "wang", "species", "portals"];

describe("Map Factory fase 2: adaptador do brief oficial do game-design", () => {
  it("reconhece o schema v1 e o mapa registrado é exatamente o que o gerador produz do brief (determinístico)", () => {
    expect(isDesignBrief(pilotBrief)).toBe(true);
    const { brief, report } = adaptDesignBrief(pilotBrief, kit, pilotBuild);
    expect(report.some((r) => r.includes("ponte horizontal de 4 tiles"))).toBe(true);
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

  it("pacote forest-v6 entra com prefixo fp6_ (aditivo): água, ponte e props resolvem de dia e de noite, sem placeholder", () => {
    const keys = usedKeys(map);
    expect(keys.filter((k) => k.startsWith("fp6_water_blob_")).length).toBeGreaterThan(4);
    for (const k of ["fp6_bridge_h_0", "fp6_bridge_h_1", "fp6_bridge_h_2", "fp6_chest_closed", "fp6_sign_post", "fp6_healing_point"]) expect(keys).toContain(k);
    for (const preset of ["day", "night"] as const) expect(loadSceneTiles(def.pack, preset, keys).missing, preset).toEqual([]);
    // recorte da ponte: 1 tile do PNG de 96×32
    expect(extraPackTiles(def.pack)["fp6_bridge_h_1"].rect).toEqual([32, 0, 32, 32]);
    // o fp4_ do forest-proof continua igual (nada sobrescrito)
    expect(def.pack.prefix).toBe("fp4_");
    expect(MAPS["forest-proof"].pack.extraPacks).toBeUndefined();
  });

  it("água colide, a ponte não; rochas, baú e placa colidem; o ponto de cura não", () => {
    const at = (tx: number, ty: number) => isSolidAt(map, tx * SUB + SUB / 2, ty * SUB + SUB / 2);
    for (const y of [3, 6, 12]) for (const x of [26, 27, 28, 29]) expect(at(x, y), `água ${x},${y}`).toBe(true);
    for (const x of [26, 27, 28, 29]) expect(at(x, 9), `ponte ${x},9`).toBe(false);
    for (const p of map.props.filter((q) => /^fp6_(rock_big|chest_closed|sign_post)$/.test(q.key))) expect(p.solid, p.key).toBe(true);
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
    const p = getPlayer(sim.state, LOCAL_PLAYER)!;
    const tamer = getEntity(sim.state, p.tamerId)!;
    const go = (tx: number, ty: number) => Object.assign(tamer, { x: tx * SUB + SUB / 2, y: ty * SUB + SUB / 2 });
    go(23, 31);
    expect(nearestInteraction(sim, LOCAL_PLAYER)?.id).toMatch(/npc-guia-gigimon|interact-placa-entrada/);
    expect(interact(sim, LOCAL_PLAYER, "npc-guia-gigimon", new Set())!.text).toMatch(/rotas/);
    expect(interact(sim, LOCAL_PLAYER, "interact-placa-entrada", new Set())!.text).toMatch(/Clareira Central/);
    const opened = new Set<string>();
    const bits0 = p.bits;
    expect(interact(sim, LOCAL_PLAYER, "interact-bau", opened)!.bits).toBe(CHEST_BITS);
    expect(interact(sim, LOCAL_PLAYER, "interact-bau", opened)!.bits).toBeUndefined();
    expect(p.bits).toBe(bits0 + CHEST_BITS);
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
