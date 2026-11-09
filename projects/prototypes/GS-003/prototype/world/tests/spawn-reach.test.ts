// QA Digimon Forest 01, P1: o sorteio de spawn selvagem só usa células alcançáveis a partir dos inícios do mapa
// (BFS pré-computado no carregamento), nunca um bolsão livre cercado de sólidos.
import { describe, expect, it } from "vitest";
import { computeReachable, isReachableAt, parseTiledMap, reachableCellsOf, type TiledMap } from "../src/sim/map";
import { SUB } from "../src/sim/params";
import { createMapWorld } from "../src/sim/setup";

// 14×14 tudo livre; um bolsão 3×3 (5..7, 5..7) murado (anel 4..8 sólido) no meio da zona de spawn 2..11
const N = 14;
const T = 32;
const solidCell = (x: number, y: number) => x >= 4 && x <= 8 && y >= 4 && y <= 8 && !(x >= 5 && x <= 7 && y >= 5 && y <= 7);
const POCKET = (x: number, y: number) => x >= 5 && x <= 7 && y >= 5 && y <= 7;
function pocketMap(): TiledMap {
  const data: number[] = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) data.push(solidCell(x, y) ? 2 : 1);
  return {
    width: N, height: N, tilewidth: T, tileheight: T,
    tilesets: [{ firstgid: 1, name: "t", tiles: [{ id: 0, properties: [{ name: "key", value: "chao" }] }, { id: 1, properties: [{ name: "key", value: "muro" }, { name: "solid", value: true }] }] }],
    layers: [
      { type: "tilelayer", name: "ground", data },
      {
        type: "objectgroup", name: "objects",
        objects: [
          { id: 1, name: "player", type: "start", x: 1 * T + 16, y: 12 * T + 16, point: true },
          // zona de sorteio 2..11 × 2..11 (centro 6,6 = dentro do bolsão; raio 5 tiles)
          { id: 2, name: "spawn-teste", type: "spawn", x: 1.5 * T, y: 1.5 * T, width: 10 * T, height: 10 * T, properties: [{ name: "species", value: "CREATURE-0002" }, { name: "levelMin", value: 1 }, { name: "levelMax", value: 2 }, { name: "count", value: 8 }] },
        ],
      },
    ],
  } as unknown as TiledMap;
}

describe("spawn selvagem só em célula alcançável (QA P1)", () => {
  it("o alcance é pré-computado no carregamento e exclui o bolsão murado", () => {
    const map = parseTiledMap("bolsao", pocketMap());
    expect(map.reachable).toBeInstanceOf(Uint8Array);
    expect(map.reachable).toEqual(computeReachable(map));
    for (let y = 5; y <= 7; y++)
      for (let x = 5; x <= 7; x++) {
        expect(map.solid[y * N + x], `${x},${y} livre`).toBe(0);
        expect(map.reachable![y * N + x], `${x},${y} inalcançável`).toBe(0);
        expect(isReachableAt(map, x * SUB + 8, y * SUB + 8)).toBe(false);
      }
    expect(isReachableAt(map, 2 * SUB + 8, 2 * SUB + 8)).toBe(true);
    const cells = reachableCellsOf(map, map.spawns[0]);
    expect(cells.length).toBeGreaterThan(40);
    expect(cells.some((c) => POCKET(c % N, Math.floor(c / N)))).toBe(false);
  });

  it("em 40 sementes nenhum selvagem nasce no bolsão nem em sólido (o centro da zona está no bolsão)", () => {
    const map = parseTiledMap("bolsao", pocketMap());
    let wilds = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const { sim } = createMapWorld(map, false, seed, {});
      for (const e of sim.state.entities.filter((q) => q.kind === "wild")) {
        wilds++;
        const tx = Math.floor(e.x / SUB);
        const ty = Math.floor(e.y / SUB);
        expect(POCKET(tx, ty), `semente ${seed}: ${e.id} em ${tx},${ty}`).toBe(false);
        expect(map.solid[ty * N + tx], `semente ${seed}: ${e.id} em sólido`).toBe(0);
        expect(map.reachable![ty * N + tx]).toBe(1);
      }
    }
    expect(wilds).toBeGreaterThanOrEqual(40 * 8);
  });
});
