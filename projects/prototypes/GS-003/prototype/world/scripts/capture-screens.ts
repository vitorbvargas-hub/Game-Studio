// Capturas de docs/screens/ com o renderer real (sem navegador: não há Chromium headless neste host).
// Uso: npm run shots   (vite-node resolve import.meta.glob e os aliases como o Vite do jogo)
// Roda o mesmo laço do main.ts (quadros de 20 ms, tick de 100 ms) a partir de uma semente fixa e fotografa
// momentos escolhidos por evento (encontro, impacto, derrota, outro jogador lutando).

import { createCanvas, loadImage, type Canvas } from "@napi-rs/canvas";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { imageUrlsOf, loadCharacterCatalog, loadCreatureCatalog, pickTamers } from "../src/assets/creatures";
import { countDwdsSources, loadTileSources } from "../src/assets/tiles";
import { ImageStore, type CanvasFactory, type ImageLike } from "../src/render/images";
import { Presenter } from "../src/render/presenter";
import { WorldView } from "../src/render/view";
import { TICK_MS } from "../src/sim/params";
import { BOT_PLAYER, createDefaultWorld, LOCAL_PLAYER } from "../src/sim/setup";
import type { Intent, WorldEvent } from "../src/sim/types";
import { snapshot, stepWorld } from "../src/sim/world";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "docs/screens");
const VIEW_W = 480;
const VIEW_H = 270;
const SAVE_SCALE = 2;
const SEED = Number(process.env.SEED ?? 11);
const FRAME_MS = 20;

/** URL devolvida pelo Vite (/@fs/abs, /abs ou relativa à raiz) → caminho no disco. */
function urlToPath(url: string): string {
  const u = decodeURIComponent(url.split("?")[0]);
  if (u.startsWith("/@fs/")) return u.slice(4);
  if (u.startsWith("/") && !u.startsWith("/home")) return join(ROOT, u);
  return u;
}

const makeCanvas: CanvasFactory = (w, h) => createCanvas(w, h) as unknown as HTMLCanvasElement;

async function main() {
  mkdirSync(OUT, { recursive: true });
  const { sim, events: spawnEvents } = createDefaultWorld(SEED, { auto: true });
  const creatures = loadCreatureCatalog();
  const tiles = loadTileSources();
  const tamers = pickTamers(loadCharacterCatalog());
  const images = new ImageStore(async (url) => (await loadImage(urlToPath(url))) as unknown as ImageLike);
  const failed = await images.loadAll([
    ...Object.values(creatures).map((c) => c.sheetUrl),
    ...Object.values(tiles).map((t) => t.url),
    ...[tamers.local, tamers.remote].flatMap((t) => (t ? imageUrlsOf(t) : [])),
  ]);
  if (failed.length) console.warn("falharam:", failed);
  console.log(
    `criaturas: ${Object.keys(creatures).length} · tiles/props reais: ${Object.keys(tiles).length} (DS: ${countDwdsSources(tiles)}) · Tamer: ${tamers.local?.manifest.id ?? "placeholder"}/${tamers.remote?.manifest.id ?? "placeholder"}`,
  );

  const canvas = makeCanvas(VIEW_W, VIEW_H);
  const presenter = new Presenter((id) => (id ? creatures[id]?.manifest : undefined), LOCAL_PLAYER);
  const view = new WorldView(canvas, sim.map, creatures, tiles, images, makeCanvas, { creatureScale: 1, tamers });
  presenter.onTick(snapshot(sim), spawnEvents, 0);

  const big = createCanvas(VIEW_W * SAVE_SCALE, VIEW_H * SAVE_SCALE);
  const save = (name: string, crop?: { x: number; y: number; w: number; h: number; s: number }) => {
    const g = big.getContext("2d");
    g.imageSmoothingEnabled = false;
    if (crop) {
      const c = createCanvas(crop.w * crop.s, crop.h * crop.s);
      const cg = c.getContext("2d");
      cg.imageSmoothingEnabled = false;
      cg.drawImage(canvas as unknown as Parameters<typeof cg.drawImage>[0], crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w * crop.s, crop.h * crop.s);
      writeFileSync(join(OUT, name), c.toBuffer("image/png"));
    } else {
      g.drawImage(canvas as unknown as Parameters<typeof g.drawImage>[0], 0, 0, VIEW_W * SAVE_SCALE, VIEW_H * SAVE_SCALE);
      writeFileSync(join(OUT, name), big.toBuffer("image/png"));
    }
    console.log("ok", name);
  };

  let now = 0;
  let acc = 0;
  let follow = LOCAL_PLAYER;
  const taken = new Set<string>();
  const all: WorldEvent[] = [];
  const partnerId = `${LOCAL_PLAYER}:partner`;
  const botPartner = `${BOT_PLAYER}:partner`;
  let impactAt = -1;
  let lastFollow = follow;
  let seq: { start: number; hitAt: number; special: boolean; crop: { x: number; y: number; w: number; h: number; s: number }; shots: number[] } | undefined;
  let seqDone = 0;
  const seqFrames: Canvas[] = [];
  const snapshotCanvas = (c: { x: number; y: number; w: number; h: number; s: number }) => {
    const out = createCanvas(c.w * c.s, c.h * c.s);
    const g = out.getContext("2d");
    g.imageSmoothingEnabled = false;
    g.drawImage(canvas as unknown as Parameters<typeof g.drawImage>[0], c.x, c.y, c.w, c.h, 0, 0, c.w * c.s, c.h * c.s);
    return out;
  };
  const saveStrip = (frames: Canvas[], special: boolean) => {
    const w = frames[0].width;
    const h = frames[0].height;
    const strip = createCanvas(w * 3 + 8, h * 2 + 4);
    const g = strip.getContext("2d");
    g.fillStyle = "#181425";
    g.fillRect(0, 0, strip.width, strip.height);
    frames.forEach((f, i) => g.drawImage(f, (i % 3) * (w + 4), Math.floor(i / 3) * (h + 4)));
    writeFileSync(join(OUT, "06-attack-sequence-6f.png"), strip.toBuffer("image/png"));
    console.log("ok 06-attack-sequence-6f.png", special ? "(golpe especial)" : "(golpe básico)");
  };
  let defeatAt = -1;
  let botImpactAt = -1;

  for (let f = 0; f < (180 * 1000) / FRAME_MS && (!taken.has("bot") || seqDone < 6 || !taken.has("special")); f++) {
    now += FRAME_MS;
    acc += FRAME_MS;
    while (acc >= TICK_MS) {
      // Clique simulado: o Tamer anda até o prado oeste (mesmo intent do clique no main.ts).
      const intents: Intent[] = sim.state.tick === 2 ? [{ t: "move_to", playerId: LOCAL_PLAYER, x: 10 * 16, y: 26 * 16 }] : [];
      const evs = stepWorld(sim, intents);
      all.push(...evs);
      presenter.onTick(snapshot(sim), evs, now);
      acc -= TICK_MS;
    }
    presenter.update(now);
    view.update(presenter, acc / TICK_MS, now);
    const pos = view.motionPos(follow) ?? view.motionPos(LOCAL_PLAYER)!;
    // Na foto do outro jogador, enquadra o ponto médio entre o Tamer bot e a parceira dele.
    const bpos = (follow === BOT_PLAYER && view.motionPos(botPartner)) || pos;
    // Câmera: lerp normal; troca de alvo (local ↔ bot) é corte seco.
    view.follow({ x: (pos.x + bpos.x) / 2, y: (pos.y + bpos.y) / 2 }, follow === lastFollow ? FRAME_MS : undefined, view.shakeFor(presenter, now));
    lastFollow = follow;
    view.render(presenter, acc / TICK_MS, now);
    const partner = presenter.entities.get(partnerId);

    // Sequência de 6 quadros de UM golpe da parceira local (antecipação → avanço → impacto/hit-stop → knockback
    // → número em arco → volta). Recorte ampliado 3x centrado no par atacante/alvo, fixo durante a sequência.
    const seqTarget = partner?.attack ? presenter.entities.get(partner.attack.targetId) : undefined;
    if (
      !seq &&
      taken.has("overview") &&
      follow === LOCAL_PLAYER &&
      partner?.attack &&
      now - partner.attack.start <= FRAME_MS &&
      seqTarget &&
      presenter.hpNow(seqTarget, now) > seqTarget.maxHp * 0.6
    ) {
      const a = view.motionPos(partnerId)!;
      const b = view.motionPos(partner.attack.targetId)!;
      const w = 160;
      const h = 100;
      const cx = Math.round((a.x + b.x) / 2 - view.camera.x);
      const cy = Math.round((a.y + b.y) / 2 - view.camera.y);
      seq = {
        start: partner.attack.start,
        hitAt: partner.attack.start + partner.attack.hitAtMs,
        special: partner.attack.special,
        crop: { x: Math.max(0, Math.min(VIEW_W - w, cx - w / 2)), y: Math.max(0, Math.min(VIEW_H - h, cy - 62)), w, h, s: 3 },
        shots: [],
      };
      const hit = partner.attack.hitAtMs;
      // instantes relativos ao início do golpe: antecipação, avanço, impacto (hit-stop), knockback, número, volta
      seq.shots = [Math.round(hit * 0.4), hit - 20, hit + 20, hit + 140, hit + 260, hit + 420].map((t) => partner.attack!.start + t);
    }
    if (seq && seqDone < 6 && now >= seq.shots[seqDone]) {
      const label = ["1-antecipacao", "2-avanco", "3-impacto-hitstop", "4-knockback", "5-numero-arco", "6-volta"][seqDone];
      save(`06-attack-seq-${label}.png`, seq.crop);
      seqFrames.push(snapshotCanvas(seq.crop));
      seqDone++;
      if (seqDone === 6) saveStrip(seqFrames, seq.special);
    }

    if (!taken.has("overview") && now >= 3500) {
      save("01-overview.png");
      taken.add("overview");
    }
    // impacto do golpe da parceira local: número, flash e efeito no mesmo quadro
    const myFx = presenter.hitFx.find((h) => h.targetId === partner?.targetId && now - h.start <= 40);
    if (!taken.has("impact") && taken.has("overview") && myFx && impactAt < 0) impactAt = now + 60;
    if (!taken.has("impact") && impactAt > 0 && now >= impactAt) {
      save("02-combat-impact.png");
      const t = presenter.entities.get(partner!.targetId!) ?? partner!;
      const a = presenter.renderPos(partner!, acc / TICK_MS);
      const b = presenter.renderPos(t, acc / TICK_MS);
      const cx = Math.round((a.x + b.x) / 2 - view.camera.x);
      const cy = Math.round((a.y + b.y) / 2 - view.camera.y);
      const w = 200;
      const h = 130;
      save("03-combat-impact-zoom.png", { x: Math.max(0, Math.min(VIEW_W - w, cx - w / 2)), y: Math.max(0, Math.min(VIEW_H - h, cy - 90)), w, h, s: 3 });
      taken.add("impact");
    }
    // golpe especial em voo (projétil) da parceira local
    const myProj = presenter.casts.find((c) => c.attackerId === partnerId && c.hitAt > c.launchAt && now >= c.launchAt + (c.hitAt - c.launchAt) * 0.5 && now < c.hitAt);
    if (!taken.has("special") && myProj && follow === LOCAL_PLAYER) {
      const a = view.motionPos(partnerId)!;
      const cx = Math.round(a.x - view.camera.x);
      const cy = Math.round(a.y - view.camera.y);
      save("07-special-projectile.png", { x: Math.max(0, Math.min(VIEW_W - 200, cx - 100)), y: Math.max(0, Math.min(VIEW_H - 120, cy - 80)), w: 200, h: 120, s: 3 });
      taken.add("special");
    }
    const myReward = all.find((e) => e.t === "reward" && e.ownerId === LOCAL_PLAYER);
    if (!taken.has("defeat") && myReward && defeatAt < 0) defeatAt = now + 250;
    if (!taken.has("defeat") && defeatAt > 0 && now >= defeatAt) {
      save("04-defeat-xp.png");
      taken.add("defeat");
    }
    // Só troca para o outro jogador depois da sequência de 6 quadros (o recorte dela é fixo na tela local).
    if (taken.has("defeat") && seqDone >= 6 && taken.has("special") && follow === LOCAL_PLAYER && !taken.has("bot")) {
      follow = BOT_PLAYER;
    }
    if (follow === BOT_PLAYER && !taken.has("bot")) {
      const bp = presenter.entities.get(botPartner);
      const fx = presenter.hitFx.find((h) => bp && (h.targetId === bp.targetId || h.targetId === bp.id) && now - h.start <= 40);
      if (fx && botImpactAt < 0) botImpactAt = now + 60;
      if (botImpactAt > 0 && now >= botImpactAt) {
        save("05-other-player-combat.png");
        taken.add("bot");
        follow = LOCAL_PLAYER;
      }
    }
  }
  const missing = ["overview", "impact", "defeat", "bot", "special"].filter((k) => !taken.has(k));
  if (seqDone < 6) missing.push(`attack-seq (${seqDone}/6)`);
  if (missing.length) console.warn("capturas não obtidas em 180 s simulados:", missing.join(", "));
  console.log(`stats do último quadro: ${JSON.stringify(view.stats)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
