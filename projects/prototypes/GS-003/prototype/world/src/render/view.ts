// WorldView: renderer Canvas 2D do mundo. Lê o Presenter (estado visual) e nunca a sim.
// Camadas (§6): chão (chunks pré-renderizados) → sombras → entidades e props por Y dos pés → efeitos → barras/números.
// Pixel-perfect: coordenadas inteiras, imageSmoothing desligado; a escala inteira de tela é feita pelo CSS (main.ts).

import { framePivot, imageUrlOf, mapScaleOf, type CreatureVisual, type SizeEntry } from "../assets/creatures";
import { ANIMATED_TILES, animatedTileKey, drawPlaceholderTile, propPlaceholder, type TileSource } from "../assets/tiles";
import type { MapProp, WorldMap } from "../sim/map";
import type { Dir8, LogicState, Vec } from "../sim/types";
import {
  ANTICIPATION_FRAC,
  attackLunge,
  DEFEAT_FADE_MS,
  ease,
  frameAt,
  framesFor,
  knockback,
  LUNGE_PX,
  resolveAnim,
  resolveFacing,
  type Dir4,
} from "./anim";
import { drawCharge, drawImpact, drawProjectile, projectilePos, shakeOffset } from "./fx";
import type { CanvasFactory, ImageStore } from "./images";
import { idleBob, lerpCamera, MOVING_PX_S, newMotion, stepMotion, walkFrameIndex, type MotionState } from "./motion";
import { drawOutlinedText, pixelTextWidth } from "./pixelfont";
import { EXCLAIM_MS, type Presenter, type VisualEntity } from "./presenter";
import { BOT_TAMER, LOCAL_TAMER, makeTamerFrames, TAMER_H, TAMER_PIVOT, TAMER_W } from "./tamer";

export const CHUNK_TILES = 16;

export interface ViewOptions {
  /** Fator inteiro global aplicado aos sprites de criatura (DS nativo = 1). Multiplica o mapScale de cada manifest. */
  creatureScale: number;
  /** Tabela de tamanhos (GS-003/research/DIGIMON_SIZE_TABLE.json). Só usada se passada (?size=table). */
  sizeTable?: Record<string, SizeEntry>;
  /** Sprites do Tamer (GAME-ASSETS/11-characters): local e outro jogador. Ausente → placeholder desenhado em código. */
  tamers?: { local?: CreatureVisual; remote?: CreatureVisual };
  /** Suavização visual do movimento (desligar para comparar com a v1). */
  smoothing?: boolean;
}

const LOCOMOTION: LogicState[] = ["IDLE", "WALK", "FOLLOW", "ENGAGE", "RETURN"];
const DIR4_TO_8: Record<Dir4, Dir8> = { S: "S", N: "N", E: "E", W: "W" };
const sideOf = (f: Dir4): Dir4 => (f === "E" ? "E" : "W");

export interface Camera {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Drawable {
  y: number;
  order: string;
  draw: () => void;
}

export class WorldView {
  readonly ctx: CanvasRenderingContext2D;
  camera: Camera = { x: 0, y: 0, w: 0, h: 0 };
  /** Centro da câmera em ponto flutuante (lerp); `camera` é a versão inteira usada para desenhar. */
  private camCenter?: Vec;
  private motions = new Map<string, MotionState>();
  private lastUpdate?: number;
  private chunks = new Map<string, HTMLCanvasElement>();
  private silhouettes = new Map<string, HTMLCanvasElement>();
  private shadows = new Map<string, HTMLCanvasElement>();
  private propImages = new Map<string, HTMLCanvasElement>();
  private tamers: Record<string, ReturnType<typeof makeTamerFrames>>;
  /** Estatística do último quadro (culling). */
  stats = { entitiesDrawn: 0, propsDrawn: 0, chunksDrawn: 0 };

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly map: WorldMap,
    private readonly creatures: Record<string, CreatureVisual>,
    private readonly tiles: Record<string, TileSource>,
    private readonly images: ImageStore,
    private readonly makeCanvas: CanvasFactory,
    readonly opts: ViewOptions,
  ) {
    this.ctx = canvas.getContext("2d")!;
    this.tamers = { local: makeTamerFrames(LOCAL_TAMER, makeCanvas), remote: makeTamerFrames(BOT_TAMER, makeCanvas) };
  }

  get worldW(): number {
    return this.map.width * this.map.tileSize;
  }

  get worldH(): number {
    return this.map.height * this.map.tileSize;
  }

  /** Invalida chunks do chão (ex.: tiles reais acabaram de carregar). */
  invalidateGround(): void {
    this.chunks.clear();
    this.propImages.clear();
  }

  /**
   * Câmera centrada no alvo com suavização (lerp exponencial, `dtMs` desde o último quadro; sem dtMs = corte seco),
   * presa às bordas do mapa. O desenho usa sempre a posição arredondada (pixel inteiro).
   */
  follow(target: Vec, dtMs?: number, shake: Vec = { x: 0, y: 0 }): void {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.camCenter = dtMs === undefined || !this.camCenter ? { ...target } : lerpCamera(this.camCenter, target, dtMs);
    const clamp = (v: number, max: number) => (max <= 0 ? Math.round(max / 2) : Math.max(0, Math.min(max, v)));
    this.camera = {
      x: clamp(Math.round(this.camCenter.x - w / 2), this.worldW - w) + shake.x,
      y: clamp(Math.round(this.camCenter.y - h / 2), this.worldH - h) + shake.y,
      w,
      h,
    };
  }

  /** Tremida de câmera pendente no presenter (críticos), em px inteiros. */
  shakeFor(p: Presenter, now: number): Vec {
    return shakeOffset(p.shakes, now);
  }

  /**
   * Avança o movimento visual de todas as entidades (chamar 1x por quadro, antes de follow/render).
   * Posição desenhada = mola sobre a posição interpolada da sim; direção e fase do walk vêm daqui.
   */
  update(p: Presenter, alpha: number, now: number): void {
    const dt = this.lastUpdate === undefined ? 0 : now - this.lastUpdate;
    this.lastUpdate = now;
    for (const id of [...this.motions.keys()]) if (!p.entities.has(id)) this.motions.delete(id);
    for (const v of p.entities.values()) {
      const target = p.renderPos(v, alpha);
      const m = this.motions.get(v.id) ?? newMotion(v.facing);
      let force: Dir4 | undefined;
      // Golpe/dano: as poses do DS são laterais (W, E espelhado) → vira para o lado do alvo/atacante.
      if (v.attack && now < v.attack.start + v.attack.durationMs) force = v.attack.dir.x > 0 ? "E" : v.attack.dir.x < 0 ? "W" : sideOf(m.face);
      else if (v.hurt) force = v.hurt.dir.x < 0 ? "E" : v.hurt.dir.x > 0 ? "W" : sideOf(m.face);
      const next = this.opts.smoothing === false ? { ...stepMotion(newMotion(v.facing), target, 0, v.facing, force), walked: m.walked + Math.hypot(target.x - m.pos.x, target.y - m.pos.y), speed: dt > 0 ? Math.hypot(target.x - m.pos.x, target.y - m.pos.y) / (dt / 1000) : 0 } : stepMotion(m, target, dt, v.facing, force);
      this.motions.set(v.id, next);
    }
  }

  /** Posição visual (suavizada) de uma entidade, ou undefined se ainda não houve update. */
  motionPos(id: string): Vec | undefined {
    return this.motions.get(id)?.pos;
  }

  private posOf(p: Presenter, v: VisualEntity, alpha: number): Vec {
    return this.motions.get(v.id)?.pos ?? p.renderPos(v, alpha);
  }

  screenToWorld(sx: number, sy: number): Vec {
    return { x: sx + this.camera.x, y: sy + this.camera.y };
  }

  render(p: Presenter, alpha: number, now: number): void {
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#181425";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGround(now);
    const cam = this.camera;
    const margin = 160;
    const inView = (x: number, y: number) => x > cam.x - margin && x < cam.x + cam.w + margin && y > cam.y - 32 && y < cam.y + cam.h + margin;

    const visible: { v: VisualEntity; pos: Vec }[] = [];
    for (const v of p.entities.values()) {
      const pos = this.posOf(p, v, alpha);
      if (inView(pos.x, pos.y)) visible.push({ v, pos });
    }
    // sombras (sempre sob a entidade, inclusive em ATTACK/HURT)
    for (const { v, pos } of visible) this.drawShadow(v, pos, now, p);
    // anel do alvo atual da parceira local
    const partner = p.entities.get(p.localPartnerId);
    const target = partner?.targetId ? p.entities.get(partner.targetId) : undefined;
    if (target) this.drawTargetRing(target, this.posOf(p, target, alpha), now);

    const list: Drawable[] = [];
    let props = 0;
    for (const pr of this.map.props) {
      if (!inView(pr.x, pr.y)) continue;
      props++;
      list.push({ y: pr.y, order: `p${pr.x}`, draw: () => this.drawProp(pr) });
    }
    for (const { v, pos } of visible) list.push({ y: pos.y, order: v.id, draw: () => this.drawEntity(v, pos, p, now) });
    list.sort((a, b) => a.y - b.y || (a.order < b.order ? -1 : 1));
    for (const d of list) d.draw();
    ctx.globalAlpha = 1;

    this.drawCharges(p, alpha, now);
    this.drawProjectiles(p, alpha, now);
    for (const fx of p.hitFx) {
      const v = p.entities.get(fx.targetId);
      if (!v) continue;
      const pos = this.posOf(p, v, alpha);
      const h = this.headOffset(v);
      drawImpact(ctx, fx, Math.round(pos.x - cam.x + h.hit.x), Math.round(pos.y - cam.y + h.hit.y), now - fx.start);
    }
    for (const { v, pos } of visible) this.drawOverheads(v, pos, p, now);
    for (const f of p.floaters) {
      const t = (now - f.start) / f.durationMs;
      if (t < 0 || t >= 1) continue;
      // Arco: sobe rápido (ease-out), assenta um pouco no fim; deriva lateral; fade nos últimos 35%.
      const rise = 22 * ease.outCubic(Math.min(1, t / 0.5)) - (t > 0.5 ? 7 * ((t - 0.5) / 0.5) ** 2 : 0);
      ctx.globalAlpha = (f.thirdParty ? 0.7 : 1) * (t > 0.65 ? Math.max(0, (1 - t) / 0.35) : 1);
      const scale = f.big ? (t < 0.08 ? 3 : 2) : 1;
      const fv = f.targetId ? p.entities.get(f.targetId) : undefined;
      const fpos = fv ? this.posOf(p, fv, alpha) : { x: f.x, y: f.y };
      const baseX = fv ? fpos.x + (f.x - fv.cur.x) : f.x;
      const x = Math.round(baseX + f.drift * 10 * t - cam.x - pixelTextWidth(f.text, scale) / 2);
      const lift = fv ? this.headOffset(fv).top : 20;
      const y = Math.round((fv ? fpos.y : f.y) - cam.y - lift - 10 - rise);
      drawOutlinedText(ctx, f.text, x, y, f.color, scale);
    }
    ctx.globalAlpha = 1;
    this.stats = { ...this.stats, entitiesDrawn: visible.length, propsDrawn: props };
  }

  // ---------- chão ----------

  private drawGround(now: number): void {
    const ts = this.map.tileSize;
    const size = CHUNK_TILES * ts;
    const cam = this.camera;
    let n = 0;
    for (let cy = Math.floor(cam.y / size); cy * size < cam.y + cam.h; cy++)
      for (let cx = Math.floor(cam.x / size); cx * size < cam.x + cam.w; cx++) {
        if (cx < 0 || cy < 0 || cx * CHUNK_TILES >= this.map.width || cy * CHUNK_TILES >= this.map.height) continue;
        this.ctx.drawImage(this.chunk(cx, cy, now), cx * size - cam.x, cy * size - cam.y);
        n++;
      }
    this.stats.chunksDrawn = n;
  }

  /** Chunk de 16×16 tiles pré-renderizado. Tiles animados (água) geram uma versão por quadro. */
  private chunk(cx: number, cy: number, now: number): HTMLCanvasElement {
    const animFrame = Object.values(ANIMATED_TILES).reduce((s, a) => s + (Math.floor(now / a.frameMs) % a.frames.length), 0);
    const key = `${cx},${cy},${animFrame}`;
    let c = this.chunks.get(key);
    if (c) return c;
    const ts = this.map.tileSize;
    c = this.makeCanvas(CHUNK_TILES * ts, CHUNK_TILES * ts);
    const g = c.getContext("2d")!;
    g.imageSmoothingEnabled = false;
    for (let ty = 0; ty < CHUNK_TILES; ty++)
      for (let tx = 0; tx < CHUNK_TILES; tx++) {
        const mx = cx * CHUNK_TILES + tx;
        const my = cy * CHUNK_TILES + ty;
        if (mx >= this.map.width || my >= this.map.height) continue;
        for (const layer of this.map.tileLayers) {
          const key = layer.keys[my * this.map.width + mx];
          if (key) this.drawTile(g, animatedTileKey(key, now), tx * ts, ty * ts);
        }
      }
    this.chunks.set(key, c);
    return c;
  }

  private drawTile(g: CanvasRenderingContext2D, key: string, x: number, y: number): void {
    const ts = this.map.tileSize;
    const src = this.tiles[key];
    const img = src && this.images.get(src.url);
    if (!img) return drawPlaceholderTile(g, key, x, y, ts);
    const [sx, sy, sw, sh] = src.rect ?? [0, 0, img.width, img.height];
    g.drawImage(img, sx, sy, sw, sh, x, y, ts, ts);
  }

  private drawProp(pr: MapProp): void {
    const cam = this.camera;
    const src = this.tiles[pr.key];
    const img = src && this.images.get(src.url);
    if (img) {
      const [sx, sy, sw, sh] = src.rect ?? [0, 0, img.width, img.height];
      const [px, py] = src.pivot ?? [Math.floor(sw / 2), sh - 1];
      this.ctx.drawImage(img, sx, sy, sw, sh, Math.round(pr.x - px - cam.x), Math.round(pr.y - py - cam.y), sw, sh);
      return;
    }
    const ph = propPlaceholder(pr.key);
    let c = this.propImages.get(pr.key);
    if (!c) {
      c = this.makeCanvas(ph.w, ph.h);
      ph.draw(c.getContext("2d")!);
      this.propImages.set(pr.key, c);
    }
    this.ctx.drawImage(c, Math.round(pr.x - ph.pivot[0] - cam.x), Math.round(pr.y - ph.pivot[1] - cam.y));
  }

  // ---------- entidades ----------

  private visualOf(v: VisualEntity): CreatureVisual | undefined {
    return v.speciesId ? this.creatures[v.speciesId] : undefined;
  }

  /** Escala inteira da criatura no mapa: global × mapScale do manifest (ou da tabela de tamanhos, se ligada). */
  private scaleOf(cv: CreatureVisual | undefined): number {
    return this.opts.creatureScale * (cv ? mapScaleOf(cv.manifest, this.opts.sizeTable) : 1);
  }

  /** Deslocamento do golpe e do knockback em px (só visual: a posição lógica não muda). */
  private combatOffset(v: VisualEntity, p: Presenter, now: number): Vec {
    let x = 0;
    let y = 0;
    if (v.attack) {
      const a = v.attack;
      const reach = Math.max(2, Math.min(LUNGE_PX, a.gap - 12));
      const t = p.localTime(v, now) - a.start;
      const k = attackLunge(t, a.hitAtMs, a.durationMs, reach, a.launchAtMs);
      x += a.dir.x * k;
      y += a.dir.y * k;
    }
    if (v.hurt) {
      const k = knockback(now - v.hurt.start, v.hurt.px);
      x += v.hurt.dir.x * k;
      y += v.hurt.dir.y * k;
    }
    return { x: Math.round(x), y: Math.round(y) };
  }

  private drawEntity(v: VisualEntity, pos: Vec, p: Presenter, now: number): void {
    if (v.kind === "player" || v.kind === "remote_player") {
      const tv = v.kind === "player" ? this.opts.tamers?.local : this.opts.tamers?.remote;
      if (tv && this.images.get(tv.sheetUrl)) return this.drawSprite(tv, v, pos, p, now);
      return this.drawTamer(v, pos, now);
    }
    const cv = this.visualOf(v);
    if (cv) this.drawSprite(cv, v, pos, p, now);
  }

  /** Quadro atual (chave do atlas + espelho) de uma entidade com manifest. Exportado para testes via view. */
  frameFor(cv: CreatureVisual, v: VisualEntity, p: Presenter, now: number): { key: string; mirror: boolean; state: LogicState; anim: string } {
    const m = cv.manifest;
    const mo = this.motions.get(v.id) ?? newMotion(v.facing);
    const lt = p.localTime(v, now);
    const state = p.visualState(v, now);
    const moving = mo.speed > MOVING_PX_S;
    const look: LogicState = LOCOMOTION.includes(state) ? (moving ? "WALK" : "IDLE") : state;
    const choice = resolveAnim(m, look, moving);
    const face = resolveFacing(m, choice.name, DIR4_TO_8[mo.face]);
    const frames = framesFor(choice.anim, face.dir);
    const anim = { ...choice.anim, frames };
    let fi: number;
    if (choice.procedural === "fade") fi = frames.length - 1;
    else if (look === "WALK" && choice.name !== "idle")
      fi = walkFrameIndex(mo.walked, frames.map((f) => f.durationMs), m.walkSpeedPxPerSec ?? 100);
    else if (look === "WALK") fi = walkFrameIndex(mo.walked, frames.map((f) => f.durationMs), (m.walkSpeedPxPerSec ?? 100) * 0.6);
    else if (state === "ATTACK" && v.attack) fi = frameAt(anim, lt - v.attack.start, false);
    else if ((state === "HURT" || state === "DEFEAT") && v.hurt) fi = frameAt(anim, lt - v.hurt.start, false);
    else fi = frameAt(anim, lt + v.phase, choice.anim.loop);
    return { key: frames[fi]?.atlasKey ?? "", mirror: face.mirror, state, anim: choice.name };
  }

  private drawSprite(cv: CreatureVisual, v: VisualEntity, pos: Vec, p: Presenter, now: number): void {
    const mo = this.motions.get(v.id);
    const { key, mirror, state } = this.frameFor(cv, v, p, now);
    const img = this.images.get(imageUrlOf(cv, key));
    if (!img) return;
    const fr = cv.atlas.frames[key]?.frame;
    if (!fr) return;
    const pv = framePivot(cv, key);
    const S = this.scaleOf(cv);
    const off = this.combatOffset(v, p, now);
    const moving = (mo?.speed ?? 0) > MOVING_PX_S;
    let bob = 0;
    if (!moving && LOCOMOTION.includes(state) && !v.hitStop) bob = idleBob(now, v.phase);
    else if (moving && !cv.manifest.animations.walk) bob = Math.floor((mo?.walked ?? 0) / 8) % 2 ? -1 : 0;
    const pivotX = mirror ? fr.w - pv.x : pv.x;
    const dx = Math.round(pos.x - this.camera.x - pivotX * S + off.x);
    const dy = Math.round(pos.y - this.camera.y - pv.y * S + off.y + bob);
    const ctx = this.ctx;
    const fade = state === "DEFEAT" && v.defeatedAt !== undefined ? Math.max(0, 1 - (now - v.defeatedAt) / DEFEAT_FADE_MS) : 1;
    ctx.globalAlpha = fade;
    this.blit(img, fr, dx, dy, S, mirror);
    // Flash branco do impacto (alvo, durante o hit-stop) e brilho curto do atacante.
    const flash = now < v.flashUntil ? 1 : v.attackFlashAt && now >= v.attackFlashAt && now < v.attackFlashAt + 50 ? 0.5 : 0;
    if (flash > 0 && fade > 0) {
      ctx.globalAlpha = flash * fade;
      this.blit(this.silhouette(cv, key, img, fr), { x: 0, y: 0, w: fr.w, h: fr.h }, dx, dy, S, mirror);
    }
    ctx.globalAlpha = 1;
  }

  /** Brilho de carga do golpe especial, entre a antecipação e o lançamento. */
  private drawCharges(p: Presenter, alpha: number, now: number): void {
    for (const pr of p.projectiles) {
      const a = p.entities.get(pr.attackerId);
      if (!a?.attack || a.attack.seq !== pr.seq) continue;
      const t = p.localTime(a, now) - a.attack.start;
      const launch = a.attack.launchAtMs ?? a.attack.hitAtMs;
      const from = launch * ANTICIPATION_FRAC * 0.5;
      const k = (t - from) / Math.max(1, launch - from);
      const pos = this.posOf(p, a, alpha);
      const h = this.headOffset(a);
      const off = this.combatOffset(a, p, now);
      drawCharge(this.ctx, pr.element, Math.round(pos.x - this.camera.x + off.x + h.hit.x + a.attack.dir.x * 6), Math.round(pos.y - this.camera.y + off.y + h.hit.y), k, now);
    }
  }

  private drawProjectiles(p: Presenter, alpha: number, now: number): void {
    for (const pr of p.projectiles) {
      const a = p.entities.get(pr.attackerId);
      const t = p.entities.get(pr.targetId);
      const ha = a ? this.headOffset(a) : undefined;
      const ht = t ? this.headOffset(t) : undefined;
      const from = a ? this.posOf(p, a, alpha) : pr.from;
      const to = t ? this.posOf(p, t, alpha) : pr.to;
      const f = { x: from.x + (ha?.hit.x ?? 0), y: from.y + (ha?.hit.y ?? -10) };
      const d = { x: to.x + (ht?.hit.x ?? 0), y: to.y + (ht?.hit.y ?? -10) };
      const at = projectilePos(pr, f, d, now);
      if (!at) continue;
      const len = Math.hypot(d.x - f.x, d.y - f.y) || 1;
      drawProjectile(this.ctx, pr, Math.round(at.pos.x - this.camera.x), Math.round(at.pos.y - this.camera.y), { x: (d.x - f.x) / len, y: (d.y - f.y) / len }, now);
    }
  }

  private blit(img: CanvasImageSource, fr: { x: number; y: number; w: number; h: number }, dx: number, dy: number, S: number, mirror: boolean): void {
    const ctx = this.ctx;
    if (!mirror) {
      ctx.drawImage(img, fr.x, fr.y, fr.w, fr.h, dx, dy, fr.w * S, fr.h * S);
      return;
    }
    ctx.save();
    ctx.translate(dx + fr.w * S, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(img, fr.x, fr.y, fr.w, fr.h, 0, 0, fr.w * S, fr.h * S);
    ctx.restore();
  }

  private silhouette(cv: CreatureVisual, key: string, img: CanvasImageSource, fr: { x: number; y: number; w: number; h: number }): HTMLCanvasElement {
    const id = `${cv.manifest.id}|${key}`;
    let c = this.silhouettes.get(id);
    if (c) return c;
    c = this.makeCanvas(fr.w, fr.h);
    const g = c.getContext("2d")!;
    g.drawImage(img, fr.x, fr.y, fr.w, fr.h, 0, 0, fr.w, fr.h);
    g.globalCompositeOperation = "source-in";
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, fr.w, fr.h);
    this.silhouettes.set(id, c);
    return c;
  }

  /** Tamer placeholder: 4 direções pela velocidade visual, passo sincronizado com a distância, bob parado. */
  private drawTamer(v: VisualEntity, pos: Vec, now: number): void {
    const set = v.kind === "player" ? this.tamers.local : this.tamers.remote;
    const mo = this.motions.get(v.id);
    const walking = (mo?.speed ?? 0) > MOVING_PX_S;
    const step = walking ? Math.floor((mo?.walked ?? 0) / 10) % 2 : 0;
    const face = mo?.face ?? "S";
    const side = face === "E" || face === "W";
    const frames = side ? set.east : set.south;
    const mirror = face === "W";
    const bob = walking ? (step ? -1 : 0) : idleBob(now, v.phase, 1100);
    const dx = Math.round(pos.x - this.camera.x - (mirror ? TAMER_W - TAMER_PIVOT.x : TAMER_PIVOT.x));
    const dy = Math.round(pos.y - this.camera.y - TAMER_PIVOT.y + bob);
    this.blit(frames[step], { x: 0, y: 0, w: TAMER_W, h: TAMER_H }, dx, dy, 1, side && mirror);
  }

  private drawShadow(v: VisualEntity, pos: Vec, now: number, p?: Presenter): void {
    let rx = 6;
    let ry = 2;
    let ox = 0;
    let oy = 0;
    const cv = this.visualOf(v);
    const S = this.scaleOf(cv);
    if (cv?.manifest.anchors?.shadow) {
      const s = cv.manifest.anchors.shadow;
      rx = Math.max(3, Math.round(s.rx * 0.8 * S));
      ry = Math.max(1, Math.round(s.ry * 0.7 * S));
      ox = Math.round((s.cx - cv.manifest.pivot.x) * S);
      oy = Math.round((s.cy - cv.manifest.pivot.y) * S);
    }
    const key = `${rx}x${ry}`;
    let c = this.shadows.get(key);
    if (!c) {
      c = this.makeCanvas(rx * 2 + 1, ry * 2 + 1);
      const g = c.getContext("2d")!;
      g.fillStyle = "#000000";
      for (let y = -ry; y <= ry; y++) {
        const half = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
        g.fillRect(rx - half, ry + y, half * 2 + 1, 1);
      }
      this.shadows.set(key, c);
    }
    const fade = v.defeatedAt !== undefined && now >= v.defeatedAt ? Math.max(0, 1 - (now - v.defeatedAt) / DEFEAT_FADE_MS) : 1;
    this.ctx.globalAlpha = 0.28 * fade;
    const off = p ? this.combatOffset(v, p, now) : { x: 0, y: 0 };
    this.ctx.drawImage(c, Math.round(pos.x - this.camera.x + ox - rx + off.x), Math.round(pos.y - this.camera.y + oy - ry + off.y));
    this.ctx.globalAlpha = 1;
  }

  private drawTargetRing(v: VisualEntity, pos: Vec, now: number): void {
    const cv = this.visualOf(v);
    const r = cv?.manifest.anchors?.shadow;
    const S = this.scaleOf(cv);
    const pulse = Math.floor(now / 250) % 2;
    const rx = (r ? Math.round(r.rx * S) + 2 : 10) + pulse;
    const ry = r ? Math.max(3, Math.round(r.ry * S) + 1) : 4;
    const cx = Math.round(pos.x - this.camera.x);
    const cy = Math.round(pos.y - this.camera.y);
    this.ctx.fillStyle = "#feae34";
    let lastHalf = -1;
    for (let y = -ry; y <= ry; y++) {
      const half = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
      this.ctx.fillRect(cx - half, cy + y, 1, 1);
      this.ctx.fillRect(cx + half, cy + y, 1, 1);
      if (lastHalf >= 0 && Math.abs(half - lastHalf) > 1) {
        const a = Math.min(half, lastHalf);
        const b = Math.max(half, lastHalf);
        const yy = cy + (half > lastHalf ? y - 1 : y);
        this.ctx.fillRect(cx - b, yy, b - a, 1);
        this.ctx.fillRect(cx + a + 1, yy, b - a, 1);
      }
      lastHalf = half;
    }
  }

  private headOffset(v: VisualEntity): { top: number; width: number; hit: Vec } {
    const cv = this.visualOf(v);
    const S = this.scaleOf(cv);
    if (!cv) return { top: TAMER_PIVOT.y, width: 16, hit: { x: 0, y: -16 } };
    const m = cv.manifest;
    const headY = m.anchors?.head?.y ?? 0;
    const hit = m.anchors?.hit ?? { x: m.pivot.x, y: Math.round(m.pivot.y / 2) };
    const mirror = resolveFacing(m, "idle", DIR4_TO_8[this.motions.get(v.id)?.face ?? "S"]).mirror;
    const hx = (mirror ? m.dimensions.frameW - hit.x : hit.x) - m.pivot.x;
    return { top: (m.pivot.y - headY) * S, width: Math.min(m.dimensions.frameW * S, 24) + 2, hit: { x: hx * S, y: (hit.y - m.pivot.y) * S } };
  }

  private drawOverheads(v: VisualEntity, pos: Vec, p: Presenter, now: number): void {
    const ctx = this.ctx;
    const h = this.headOffset(v);
    const x0 = Math.round(pos.x - this.camera.x);
    const top = Math.round(pos.y - this.camera.y - h.top);
    if (now < v.exclaimUntil && now >= v.exclaimUntil - EXCLAIM_MS) drawOutlinedText(ctx, "!", x0 - 1, top - 14, "#fee761");
    if (!p.barVisible(v, now)) return;
    const w = h.width;
    const bx = x0 - Math.floor(w / 2);
    const by = top - 3 - 3;
    const hp = p.hpNow(v, now);
    const ratio = v.maxHp > 0 ? hp / v.maxHp : 0;
    const inner = w - 2;
    ctx.fillStyle = "#181425";
    ctx.fillRect(bx, by, w, 4);
    ctx.fillStyle = "#3a4466";
    ctx.fillRect(bx + 1, by + 1, inner, 2);
    if (now < v.ghostUntil && v.ghostHp > hp) {
      ctx.fillStyle = "#ead4aa";
      ctx.fillRect(bx + 1, by + 1, Math.round((inner * v.ghostHp) / v.maxHp), 2);
    }
    ctx.fillStyle = ratio > 0.5 ? "#63c74d" : ratio > 0.25 ? "#feae34" : "#e43b44";
    ctx.fillRect(bx + 1, by + 1, Math.max(hp > 0 ? 1 : 0, Math.round(inner * ratio)), 2);
    const partner = p.entities.get(p.localPartnerId);
    if (v.id === p.localPartnerId || partner?.targetId === v.id) {
      const label = `LV${v.level}`;
      drawOutlinedText(ctx, label, x0 - Math.floor(pixelTextWidth(label) / 2), by - 7, v.id === p.localPartnerId ? "#2ce8f5" : "#ffffff");
    }
  }
}
