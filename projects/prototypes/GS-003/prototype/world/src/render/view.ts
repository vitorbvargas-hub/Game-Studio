// WorldView: renderer Canvas 2D do mundo. Lê o Presenter (estado visual) e nunca a sim.
// Camadas (§6): chão (chunks pré-renderizados) → sombras → entidades e props por Y dos pés → efeitos → barras/números.
// Pixel-perfect: coordenadas inteiras, imageSmoothing desligado; a escala inteira de tela é feita pelo CSS (main.ts).

import type { CreatureVisual } from "../assets/creatures";
import { ANIMATED_TILES, animatedTileKey, drawPlaceholderTile, propPlaceholder, type TileSource } from "../assets/tiles";
import type { MapProp, WorldMap } from "../sim/map";
import type { Vec } from "../sim/types";
import { frameAt, KNOCKBACK_PX, LUNGE_PX, resolveAnim, resolveFacing, DEFEAT_FADE_MS, HURT_VIS_MS } from "./anim";
import type { CanvasFactory, ImageStore } from "./images";
import { drawOutlinedText, pixelTextWidth } from "./pixelfont";
import { EXCLAIM_MS, HIT_FX_MS, type Presenter, type VisualEntity } from "./presenter";
import { BOT_TAMER, LOCAL_TAMER, makeTamerFrames, TAMER_H, TAMER_PIVOT, TAMER_W } from "./tamer";

export const CHUNK_TILES = 16;

export interface ViewOptions {
  /** Fator inteiro aplicado aos sprites de criatura (SPRITE_SPECIFICATION não fixa um; DS nativo = 1). */
  creatureScale: number;
}

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

  /** Câmera centrada no alvo, presa às bordas do mapa, em pixels inteiros. */
  follow(target: Vec): void {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const clamp = (v: number, max: number) => (max <= 0 ? Math.round(max / 2) : Math.max(0, Math.min(max, v)));
    this.camera = { x: clamp(Math.round(target.x - w / 2), this.worldW - w), y: clamp(Math.round(target.y - h / 2), this.worldH - h), w, h };
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
      const pos = p.renderPos(v, alpha);
      if (inView(pos.x, pos.y)) visible.push({ v, pos });
    }
    // sombras (sempre sob a entidade, inclusive em ATTACK/HURT)
    for (const { v, pos } of visible) this.drawShadow(v, pos, now);
    // anel do alvo atual da parceira local
    const partner = p.entities.get(p.localPartnerId);
    const target = partner?.targetId ? p.entities.get(partner.targetId) : undefined;
    if (target) this.drawTargetRing(target, p.renderPos(target, alpha));

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

    for (const fx of p.hitFx) {
      const v = p.entities.get(fx.targetId);
      if (v) this.drawHitFx(v, p.renderPos(v, alpha), now - fx.start);
    }
    for (const { v, pos } of visible) this.drawOverheads(v, pos, p, now);
    for (const f of p.floaters) {
      const t = (now - f.start) / f.durationMs;
      if (t < 0) continue;
      const fadeFrom = 1 - 150 / f.durationMs;
      ctx.globalAlpha = (f.thirdParty ? 0.7 : 1) * (t > fadeFrom ? Math.max(0, (1 - t) / (1 - fadeFrom)) : 1);
      const scale = f.big ? 2 : 1;
      const x = Math.round(f.x - cam.x - pixelTextWidth(f.text, scale) / 2);
      const fv = f.targetId ? p.entities.get(f.targetId) : undefined;
      const lift = fv ? this.headOffset(fv).top : 20;
      const y = Math.round(f.y - cam.y - lift - 20 - 12 * Math.min(1, t));
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

  /** Deslocamento procedural (ataque/recuo) em px. Só visual: a posição lógica não muda. */
  private proceduralOffset(v: VisualEntity, now: number): Vec {
    let x = 0;
    let y = 0;
    if (v.attack) {
      const t = now - v.attack.start;
      const { hitAtMs, durationMs, dir } = v.attack;
      let k = 0;
      if (t >= 0 && t < hitAtMs) k = t / hitAtMs;
      else if (t >= hitAtMs && t < durationMs) k = 1 - (t - hitAtMs) / Math.max(1, durationMs - hitAtMs);
      if (v.attack.procedural) {
        x += dir.x * LUNGE_PX * k;
        y += dir.y * LUNGE_PX * k;
      }
    }
    if (v.hurt) {
      const t = (now - v.hurt.start) / HURT_VIS_MS;
      const k = t < 0.5 ? 1 : Math.max(0, 2 - 2 * t);
      x += v.hurt.dir.x * KNOCKBACK_PX * k;
      y += v.hurt.dir.y * KNOCKBACK_PX * k;
    }
    return { x: Math.round(x), y: Math.round(y) };
  }

  private drawEntity(v: VisualEntity, pos: Vec, p: Presenter, now: number): void {
    if (v.kind === "player" || v.kind === "remote_player") return this.drawTamer(v, pos, p, now);
    const cv = this.visualOf(v);
    if (!cv) return;
    const img = this.images.get(cv.sheetUrl);
    if (!img) return;
    const m = cv.manifest;
    const state = p.visualState(v, now);
    const moving = v.prev.x !== v.cur.x || v.prev.y !== v.cur.y;
    const choice = resolveAnim(m, state, moving);
    const elapsed = state === "ATTACK" && v.attack ? now - v.attack.start : now + v.phase;
    const fi = choice.procedural === "fade" ? choice.anim.frames.length - 1 : frameAt(choice.anim, elapsed, state === "ATTACK" ? false : choice.anim.loop);
    const face = resolveFacing(m, choice.name, v.facing);
    const baseKey = choice.anim.frames[fi]?.atlasKey ?? "";
    const drawnDir = m.directions?.[choice.name]?.drawn?.[0];
    const dirKey = drawnDir && face.dir !== drawnDir ? baseKey.replace(`_${drawnDir}_`, `_${face.dir}_`) : baseKey;
    const key = cv.atlas.frames[dirKey] ? dirKey : baseKey;
    const fr = cv.atlas.frames[key]?.frame;
    if (!fr) return;
    const S = this.opts.creatureScale;
    const off = this.proceduralOffset(v, now);
    let bob = 0;
    if (choice.procedural === "bob") bob = Math.floor((now + v.phase) / 150) % 2 === 0 ? 0 : -1;
    const pivotX = face.mirror ? m.dimensions.frameW - m.pivot.x : m.pivot.x;
    const dx = Math.round(pos.x - this.camera.x - pivotX * S + off.x);
    const dy = Math.round(pos.y - this.camera.y - m.pivot.y * S + off.y + bob);
    const ctx = this.ctx;
    const fade = state === "DEFEAT" && v.defeatedAt !== undefined ? Math.max(0, 1 - (now - v.defeatedAt) / DEFEAT_FADE_MS) : 1;
    ctx.globalAlpha = fade;
    this.blit(img, fr, dx, dy, S, face.mirror);
    // Flash branco do HURT (67 ms) e brilho curto do atacante no impacto.
    const flash = now < v.flashUntil ? 1 : v.attackFlashAt && now >= v.attackFlashAt && now < v.attackFlashAt + 50 ? 0.5 : 0;
    if (flash > 0 && fade > 0) {
      ctx.globalAlpha = flash * fade;
      this.blit(this.silhouette(cv, key, img, fr), { x: 0, y: 0, w: fr.w, h: fr.h }, dx, dy, S, face.mirror);
    }
    ctx.globalAlpha = 1;
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

  private drawTamer(v: VisualEntity, pos: Vec, p: Presenter, now: number): void {
    const set = v.kind === "player" ? this.tamers.local : this.tamers.remote;
    const walking = p.visualState(v, now) === "WALK";
    const step = walking ? Math.floor((now + v.phase) / 140) % 2 : 0;
    const side = v.facing === "E" || v.facing === "W" || v.facing === "NE" || v.facing === "NW";
    const frames = side ? set.east : set.south;
    const mirror = v.facing === "W" || v.facing === "NW" || v.facing === "SW";
    const dx = Math.round(pos.x - this.camera.x - (mirror ? TAMER_W - TAMER_PIVOT.x : TAMER_PIVOT.x));
    const dy = Math.round(pos.y - this.camera.y - TAMER_PIVOT.y - (walking && step ? 1 : 0));
    this.blit(frames[step], { x: 0, y: 0, w: TAMER_W, h: TAMER_H }, dx, dy, 1, side && mirror);
  }

  private drawShadow(v: VisualEntity, pos: Vec, now: number): void {
    let rx = 6;
    let ry = 2;
    let ox = 0;
    let oy = 0;
    const cv = this.visualOf(v);
    const S = this.opts.creatureScale;
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
    this.ctx.drawImage(c, Math.round(pos.x - this.camera.x + ox - rx), Math.round(pos.y - this.camera.y + oy - ry));
    this.ctx.globalAlpha = 1;
  }

  private drawTargetRing(v: VisualEntity, pos: Vec): void {
    const r = this.visualOf(v)?.manifest.anchors?.shadow;
    const rx = r ? Math.round(r.rx * this.opts.creatureScale) + 2 : 10;
    const ry = r ? Math.max(3, Math.round(r.ry * this.opts.creatureScale) + 1) : 4;
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
    const S = this.opts.creatureScale;
    if (!cv) return { top: TAMER_PIVOT.y, width: 16, hit: { x: 0, y: -16 } };
    const m = cv.manifest;
    const headY = m.anchors?.head?.y ?? 0;
    const hit = m.anchors?.hit ?? { x: m.pivot.x, y: Math.round(m.pivot.y / 2) };
    const mirror = resolveFacing(m, "idle", v.facing).mirror;
    const hx = (mirror ? m.dimensions.frameW - hit.x : hit.x) - m.pivot.x;
    return { top: (m.pivot.y - headY) * S, width: Math.min(m.dimensions.frameW * S, 24) + 2, hit: { x: hx * S, y: (hit.y - m.pivot.y) * S } };
  }

  private drawHitFx(v: VisualEntity, pos: Vec, t: number): void {
    // Efeito de golpe PROCEDURAL (placeholder do slot 04-effects/combat/): estrela de pixels ≤ 250 ms, sem tremer a tela.
    if (t < 0 || t > HIT_FX_MS) return;
    const h = this.headOffset(v);
    const cx = Math.round(pos.x - this.camera.x + h.hit.x);
    const cy = Math.round(pos.y - this.camera.y + h.hit.y);
    const ctx = this.ctx;
    const k = t / HIT_FX_MS;
    const r = 2 + Math.round(k * 7);
    ctx.globalAlpha = k < 0.6 ? 1 : (1 - k) / 0.4;
    ctx.fillStyle = k < 0.3 ? "#ffffff" : "#fee761";
    ctx.fillRect(cx - r, cy, r * 2 + 1, 1);
    ctx.fillRect(cx, cy - r, 1, r * 2 + 1);
    const d = Math.round(r * 0.6);
    for (const [sx, sy] of [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ])
      ctx.fillRect(cx + sx * d, cy + sy * d, 1, 1);
    if (k < 0.35) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(cx - 1, cy - 1, 3, 3);
    }
    ctx.globalAlpha = 1;
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
