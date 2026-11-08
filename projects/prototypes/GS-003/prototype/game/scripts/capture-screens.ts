// Gera as capturas de docs/screens/ com o renderer real (sem navegador: Chromium headless não roda neste host).
// Uso (dependência só para esta ferramenta, fora do package.json):
//   npm install --offline --no-save @napi-rs/canvas@0.1.100
//   npx vite-node scripts/capture-screens.ts
// O jogo é simulado de verdade a partir de um save novo; nenhum nome de pacote/espécie é fixo além dos ids de pacote abaixo.

import { createCanvas, loadImage } from "@napi-rs/canvas";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPack } from "../src/packs";
import { BattleRenderer, VIEW_H, VIEW_W } from "../src/render/renderer";
import { areaUnlocked, bossUnlocked, challengeBoss, chooseDecision, chooseEncounter, chooseEvolution, chooseStarter, evolutionOptions, newGame, step, travelTo } from "../src/sim/game";
import type { ContentBundle, GameEvent, GameState } from "../src/sim/types";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "docs/screens");
const SCALE = 3;
const SEED = 7;

(globalThis as { Image?: unknown }).Image ??= class {};

/** Renderer real sobre um canvas do @napi-rs/canvas, com os sprites do pacote já carregados do disco. */
async function makeRenderer(content: ContentBundle) {
  const canvas = createCanvas(VIEW_W, VIEW_H);
  const r = new BattleRenderer(canvas as unknown as HTMLCanvasElement, content);
  const cache = (r as unknown as { images: Map<string, unknown> }).images;
  for (const url of Object.values(content.assets)) cache.set(url, await loadImage(readFileSync(join(ROOT, url))));
  return { canvas, r };
}

/** Joga sozinho; evolui (1º ramo) só até `maxStage`, para o time ficar no estágio que tem sprite. Para quando `until` for verdadeiro. */
function play(c: ContentBundle, s: GameState, maxStage: number, until: (s: GameState) => boolean, maxTicks: number, onEvents?: (e: GameEvent[]) => void) {
  for (let i = 0; i < maxTicks && !until(s); i++) {
    const ev = s.battle?.decision ? chooseDecision(c, s, 0) : s.encounter ? chooseEncounter(c, s, 0) : step(c, s);
    onEvents?.(ev);
    for (const uid of [...s.pendingEvolutions]) {
      const p = s.party.find((x) => x.uid === uid)!;
      const to = evolutionOptions(c, p)[0]?.to;
      if (!to || c.creatures[to].stage > maxStage) continue;
      const evolved = chooseEvolution(c, s, uid, to);
      onEvents?.(evolved);
    }
  }
  if (!until(s)) throw new Error(`condição de captura não atingida em ${maxTicks} ticks`);
}

const stage = (c: ContentBundle, s: GameState) => Math.min(...s.party.map((p) => c.creatures[p.speciesId].stage));
const midWave = (s: GameState) => !!s.battle && s.battle.kind === "wave" && s.battle.enemies.every((e) => e.hp > 0) && s.battle.allies.every((a) => a.hp > 0);

async function capture(file: string, packId: string, kind: "wave" | "boss") {
  const c = loadPack(packId);
  const s = newGame(c, SEED);
  if (s.starterPending) chooseStarter(c, s, c.theme.starterOptions![0]);
  const { canvas, r } = await makeRenderer(c);
  // Time no 1º estágio com sprite (ou no inicial, se o pacote não tiver sprites), para a captura mostrar a arte do pacote.
  const withSprite = Object.values(c.creatures).filter((x) => x.sprite).map((x) => x.stage);
  const target = withSprite.length ? Math.min(...withSprite) : stage(c, s);
  play(c, s, target, (st) => stage(c, st) >= target, 200_000);
  if (kind === "boss") {
    // Primeira área com chefe: caça até ela abrir, viaja, caça até o chefe liberar.
    const bossArea = Object.values(c.areas).find((a) => a.boss)!;
    play(c, s, target, (st) => areaUnlocked(c, st, bossArea.id) && !st.battle, 400_000);
    if (s.areaId !== bossArea.id) travelTo(c, s, bossArea.id);
    play(c, s, target, (st) => bossUnlocked(c, st) && !st.battle, 400_000);
    r.onEvents(challengeBoss(c, s));
    play(c, s, target, (st) => !!st.battle && st.battle.enemies.some((e) => e.isBoss && e.hp < e.maxHp * 0.9), 2_000, (e) => r.onEvents(e));
  } else {
    play(c, s, target, (st) => st.tick >= 200 && !st.battle, 5_000);
    play(c, s, target, midWave, 5_000, (e) => r.onEvents(e));
  }
  // Tempo do rAF simulado (a animação deriva do timestamp, não da contagem de quadros).
  for (let i = 0; i < 20; i++) r.draw(s, 1000 + i * (1000 / 60));
  const big = createCanvas(VIEW_W * SCALE, VIEW_H * SCALE);
  const ctx = big.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(canvas, 0, 0, VIEW_W * SCALE, VIEW_H * SCALE);
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, file), big.toBuffer("image/png"));
  const names = s.battle ? [...s.battle.allies, ...s.battle.enemies].map((u) => `${u.name}${u.sprite ? "*" : ""}`) : [];
  console.log(`${file}: pack=${packId} tick=${s.tick} em cena: ${names.join(", ")} (* = sprite)`);
}

await capture("line-b_wave.png", "digimon-fan", "wave");
await capture("line-b_boss.png", "digimon-fan", "boss");
await capture("original-b_wave.png", "original-b", "wave");
await capture("line-a_boss.png", "original-a", "boss");
