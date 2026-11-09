// WorldView: renderer Canvas 2D do mundo. Lê o Presenter (estado visual) e nunca a sim.
// Camadas (§6): chão (chunks pré-renderizados) → sombras → entidades e props por Y dos pés → efeitos → barras/números.
// Pixel-perfect: coordenadas inteiras, imageSmoothing desligado; a escala inteira de tela é feita pelo CSS (main.ts).

import { framePivot, imageUrlOf, mapScaleOf, type CreatureVisual, type SizeEntry } from "../assets/creatures";
import { ANIMATED_TILES, animatedTileKey, drawPlaceholderTile, propPlaceholder, type TileSource } from "../assets/tiles";
import type { MapProp, WorldMap } from "../sim/map";
import type { Dir8, LogicState, Vec } from "../sim/types";
import {
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
import { drawImpact, shakeOffset } from "./fx";
import { hueShifted, type CanvasFactory, type ImageLike, type ImageStore } from "./images";
import type { EntityLabel } from "./labels";
import { idleBob, lerpCamera, MOVING_PX_S, newMotion, stepMotion, walkFrameIndex, type MotionState } from "./motion";
import { drawOutlinedText, pixelTextWidth } from "./pixelfont";
import { EXCLAIM_MS, type Presenter, type VisualEntity } from "./presenter";
import type { VfxFrame } from "./vfx/archetypes";
import { drawCast, type Cast, type SheetDrawer } from "./vfx/engine";
import { ambientAt } from "./daynight";
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
  /** Só apresentação (dados de cena): nível exibido no nome de cada Tamer, por id de jogador. */
  tamerLevels?: Record<string, number>;
  /** Só apresentação: matiz (graus) do sprite de cada outro jogador, para diferenciar quem usa o mesmo sprite. */
  tamerTints?: Record<string, number>;
  /** Folhas de efeito do game-art (04-effects), desenhadas por cima do VFX em código. */
  fxSheets?: SheetDrawer;
  /**
   * Árvores em 2 sprites (forest-v4): prop `K` sem imagem própria mas com `K_base` e `K_top` vira tronco em Y-sort +
   * copa na camada acima das entidades, com sombra decal no chão. Sem isto, o prop é desenhado como sprite único.
   */
  trees?: { overlap: number; shadowSmall: string; shadowLarge: string; largeShadowMinW: number; behindAlpha: number };
}

/** Geometria de uma árvore em 2 sprites, em px do mundo (sx/sy = canto superior esquerdo de cada parte). */
export interface TreeGeom {
  index: number;
  footY: number;
  base: { url: string; x: number; y: number; w: number; h: number };
  top: { url: string; x: number; y: number; w: number; h: number };
  shadow?: { url: string; x: number; y: number; w: number; h: number };
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
  private tinted = new Map<string, HTMLCanvasElement>();
  private tamers: Record<string, ReturnType<typeof makeTamerFrames>>;
  /** Alpha atual de cada copa (índice do prop), suavizado para a transparência quando alguém passa por trás. */
  private canopyAlpha = new Map<number, number>();
  private trees?: TreeGeom[];
  private lastRender?: number;
  /** Preset noturno do pacote (mesmas chaves): URL do dia → URL da noite. */
  private nightUrls = new Map<string, string>();
  private nightTiles?: Record<string, TileSource>;
  /** Mistura noite 0..1 (ciclo dia/noite): troca de paleta em crossfade + overlay ambiente. */
  nightMix = 0;
  /** Estatística do último quadro (culling). */
  stats = { entitiesDrawn: 0, propsDrawn: 0, chunksDrawn: 0 };

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly map: WorldMap,
    private readonly creatures: Record<string, CreatureVisual>,
    private tiles: Record<string, TileSource>,
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
    this.trees = undefined;
  }

  /** Troca o conjunto de tiles/props e refaz o chão. */
  setTiles(tiles: Record<string, TileSource>): void {
    this.tiles = tiles;
    this.invalidateGround();
  }

  /** Preset noturno (mesmas chaves do dia, outra paleta). As imagens precisam estar no ImageStore. */
  setNightTiles(tiles: Record<string, TileSource>): void {
    this.nightTiles = tiles;
    this.nightUrls.clear();
    for (const [k, t] of Object.entries(this.tiles)) if (tiles[k] && tiles[k].url !== t.url) this.nightUrls.set(t.url, tiles[k].url);
    this.chunks.clear();
  }

  /** Imagem de um URL do dia no preset pedido (cai no dia se não houver versão noturna carregada). */
  private presetImage(url: string, night: boolean): ImageLike | undefined {
    const n = night ? this.nightUrls.get(url) : undefined;
    return (n && this.images.get(n)) || this.images.get(url);
  }

  /** drawImage com crossfade dia → noite (respeita o globalAlpha corrente). */
  private drawPreset(url: string, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw = sw, dh = sh): void {
    const ctx = this.ctx;
    const mix = this.nightUrls.size ? this.nightMix : 0;
    const a = ctx.globalAlpha;
    if (mix < 1) {
      const img = this.presetImage(url, false);
      if (img) ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    }
    if (mix > 0) {
      const img = this.presetImage(url, true);
      ctx.globalAlpha = a * (mix < 1 ? mix : 1);
      if (img) ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
      ctx.globalAlpha = a;
    }
  }

  /**
   * Árvores em 2 sprites do mapa (só as com imagens carregadas). Ancoragem do forest-v4: tronco com os pés no ponto
   * do prop; copa centrada no mesmo X com o fundo `overlap × top.h` px abaixo do topo do tronco; sombra deslocada
   * 20% da largura para a direita (luz de cima à esquerda) e assentada no pé.
   */
  treeGeoms(): TreeGeom[] {
    if (this.trees) return this.trees;
    const cfg = this.opts.trees;
    const out: TreeGeom[] = [];
    if (cfg)
      this.map.props.forEach((pr, index) => {
        if (this.tiles[pr.key]) return;
        const b = this.tiles[`${pr.key}_base`];
        const t = this.tiles[`${pr.key}_top`];
        const bi = b && this.images.get(b.url);
        const ti = t && this.images.get(t.url);
        if (!bi || !ti) return;
        const base = { url: b.url, x: Math.round(pr.x - Math.floor(bi.width / 2)), y: pr.y - bi.height, w: bi.width, h: bi.height };
        const top = { url: t.url, x: Math.round(pr.x - Math.floor(ti.width / 2)), y: pr.y - bi.height - ti.height + Math.round(ti.height * cfg.overlap), w: ti.width, h: ti.height };
        const s = this.tiles[ti.width > cfg.largeShadowMinW ? cfg.shadowLarge : cfg.shadowSmall];
        const si = s && this.images.get(s.url);
        const shadow = si ? { url: s.url, x: Math.round(pr.x - si.width / 2 + Math.round(si.width * 0.2)), y: pr.y - Math.round(si.height * 0.55) + 3, w: si.width, h: si.height } : undefined;
        out.push({ index, footY: pr.y, base, top, shadow });
      });
    // só fixa o cache quando as imagens já existem (senão tenta de novo no próximo quadro)
    if (out.length || !cfg) this.trees = out;
    return out;
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
    // VFX: camada do chão (círculos de área, marcas, rachaduras) fica sob as entidades
    for (const c of p.casts) this.drawCastLayer(p, c, alpha, now, "ground");
    // anel do alvo atual da parceira local
    const partner = p.entities.get(p.localPartnerId);
    const target = partner?.targetId ? p.entities.get(partner.targetId) : undefined;
    if (target) this.drawTargetRing(target, this.posOf(p, target, alpha), now);

    const list: Drawable[] = [];
    let props = 0;
    const trees = this.treeGeoms();
    const treeAt = new Map(trees.map((t) => [t.index, t]));
    this.map.props.forEach((pr, i) => {
      if (!inView(pr.x, pr.y)) return;
      props++;
      const tree = treeAt.get(i);
      list.push({ y: pr.y, order: `p${pr.x}`, draw: tree ? () => this.blitWorld(tree.base) : () => this.drawProp(pr) });
    });
    for (const { v, pos } of visible) list.push({ y: pos.y, order: v.id, draw: () => this.drawEntity(v, pos, p, now) });
    list.sort((a, b) => a.y - b.y || (a.order < b.order ? -1 : 1));
    for (const d of list) d.draw();
    ctx.globalAlpha = 1;
    this.drawCanopies(p, trees, visible, now);
    this.drawAmbient();

    for (const c of p.casts) this.drawCastLayer(p, c, alpha, now, "over");
    // Impacto genérico da v2 só para golpes sem Cast (eventos sintéticos/legado).
    for (const fx of p.hitFx) {
      const v = p.entities.get(fx.targetId);
      if (!v || p.casts.some((c) => c.seq === fx.seq)) continue;
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

  private blitWorld(part: { url: string; x: number; y: number; w: number; h: number }): void {
    this.drawPreset(part.url, 0, 0, part.w, part.h, part.x - this.camera.x, part.y - this.camera.y);
  }

  /**
   * Luz ambiente do preset (forest-v4): véu de cor em tela cheia + vinheta, interpolados pela mistura noite.
   * Fica acima do mundo e das copas e abaixo do VFX, para os golpes continuarem brilhando à noite.
   */
  private drawAmbient(): void {
    if (!this.opts.trees) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const amb = ambientAt(this.nightMix);
    ctx.globalAlpha = 1;
    ctx.fillStyle = `rgba(${amb.rgb.join(",")},${amb.alpha.toFixed(3)})`;
    ctx.fillRect(0, 0, w, h);
    const r = Math.hypot(w, h) / 2;
    const g = ctx.createRadialGradient(w / 2, h / 2, r * 0.72, w / 2, h / 2, r);
    g.addColorStop(0, "rgba(24,20,37,0)");
    g.addColorStop(1, `rgba(24,20,37,${amb.vignette.toFixed(3)})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  /**
   * Camada canopy-top: copas acima de todas as entidades (ordem pelo pé da árvore). Uma copa que cobre o Tamer local
   * ou a parceira dele fica translúcida (`behindAlpha`), com transição suave (~120 ms).
   */
  private drawCanopies(p: Presenter, trees: TreeGeom[], visible: { v: VisualEntity; pos: Vec }[], now: number): void {
    const cfg = this.opts.trees;
    if (!cfg || !trees.length) return;
    const dt = this.lastRender === undefined ? 16 : Math.max(0, now - this.lastRender);
    this.lastRender = now;
    const k = Math.min(1, dt / 120);
    const cam = this.camera;
    const watch = visible.filter(({ v }) => v.id === p.localPlayerId || v.id === p.localPartnerId).map(({ v, pos }) => {
      const top = v.kind === "player" ? this.tamerTop(v) : this.headOffset(v).top;
      return { x0: pos.x - 7, x1: pos.x + 7, y0: pos.y - top, y1: pos.y };
    });
    const ctx = this.ctx;
    for (const t of trees) {
      const r = t.top;
      if (r.x > cam.x + cam.w || r.x + r.w < cam.x || r.y > cam.y + cam.h || r.y + r.h < cam.y) {
        this.canopyAlpha.delete(t.index);
        continue;
      }
      // miolo da copa (as bordas dela são puffs ralos): 12% de margem lateral e 15% no fundo
      const behind = watch.some((e) => e.x1 > r.x + r.w * 0.12 && e.x0 < r.x + r.w * 0.88 && e.y1 > r.y && e.y0 < r.y + r.h * 0.85);
      const target = behind ? cfg.behindAlpha : 1;
      const a0 = this.canopyAlpha.get(t.index) ?? 1;
      const a = Math.abs(target - a0) < 0.01 ? target : a0 + (target - a0) * k;
      if (a < 1) this.canopyAlpha.set(t.index, a);
      else this.canopyAlpha.delete(t.index);
      ctx.globalAlpha = a;
      this.blitWorld(r);
    }
    ctx.globalAlpha = 1;
  }

  /** Alpha atual da copa de uma árvore (1 = opaca), para testes e capturas. */
  canopyAlphaOf(index: number): number {
    return this.canopyAlpha.get(index) ?? 1;
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
        const mix = this.nightTiles ? this.nightMix : 0;
        if (mix < 1) this.ctx.drawImage(this.chunk(cx, cy, now, false), cx * size - cam.x, cy * size - cam.y);
        if (mix > 0) {
          this.ctx.globalAlpha = mix < 1 ? mix : 1;
          this.ctx.drawImage(this.chunk(cx, cy, now, true), cx * size - cam.x, cy * size - cam.y);
          this.ctx.globalAlpha = 1;
        }
        n++;
      }
    this.stats.chunksDrawn = n;
  }

  /** Chunk de 16×16 tiles pré-renderizado. Tiles animados (água) geram uma versão por quadro. */
  private chunk(cx: number, cy: number, now: number, night = false): HTMLCanvasElement {
    const animFrame = Object.values(ANIMATED_TILES).reduce((s, a) => s + (Math.floor(now / a.frameMs) % a.frames.length), 0);
    const key = `${cx},${cy},${animFrame}${night ? ",n" : ""}`;
    const set = night && this.nightTiles ? { ...this.tiles, ...this.nightTiles } : this.tiles;
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
          if (key) this.drawTile(g, animatedTileKey(key, now), tx * ts, ty * ts, set);
        }
      }
    // sombras das copas: decal no chão (fica sob tudo; pode atravessar a borda do chunk)
    const x0 = cx * CHUNK_TILES * ts;
    const y0 = cy * CHUNK_TILES * ts;
    const size = CHUNK_TILES * ts;
    for (const t of this.treeGeoms()) {
      const s = t.shadow;
      if (!s || s.x > x0 + size || s.x + s.w < x0 || s.y > y0 + size || s.y + s.h < y0) continue;
      const img = this.presetImage(s.url, night);
      if (img) g.drawImage(img, s.x - x0, s.y - y0);
    }
    this.chunks.set(key, c);
    return c;
  }

  private drawTile(g: CanvasRenderingContext2D, key: string, x: number, y: number, set = this.tiles): void {
    const ts = this.map.tileSize;
    const src = set[key];
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
      this.drawPreset(src.url, sx, sy, sw, sh, Math.round(pr.x - px - cam.x), Math.round(pr.y - py - cam.y));
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
      if (tv && this.images.get(tv.sheetUrl)) return this.drawSprite(tv, v, pos, p, now, this.opts.tamerTints?.[v.id]);
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

  private drawSprite(cv: CreatureVisual, v: VisualEntity, pos: Vec, p: Presenter, now: number, tint?: number): void {
    const mo = this.motions.get(v.id);
    const { key, mirror, state } = this.frameFor(cv, v, p, now);
    const url = imageUrlOf(cv, key);
    let img: ImageLike | HTMLCanvasElement | undefined = this.images.get(url);
    if (!img) return;
    if (tint) {
      const id = `${url}|${tint}`;
      let t = this.tinted.get(id);
      if (!t) this.tinted.set(id, (t = hueShifted(img, tint, this.makeCanvas)));
      img = t;
    }
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

  /** Monta o quadro de VFX de um golpe (posições de tela vivas) e desenha a camada pedida. */
  private drawCastLayer(p: Presenter, c: Cast, alpha: number, now: number, layer: "ground" | "over"): void {
    const cam = this.camera;
    const a = p.entities.get(c.attackerId);
    const t = p.entities.get(c.targetId);
    const scr = (v: Vec): Vec => ({ x: Math.round(v.x - cam.x), y: Math.round(v.y - cam.y) });
    const anchor = (v: VisualEntity | undefined, fallback: Vec): { hit: Vec; feet: Vec } => {
      if (!v) return { hit: scr({ x: fallback.x, y: fallback.y - 10 }), feet: scr(fallback) };
      const pos = this.posOf(p, v, alpha);
      const off = this.combatOffset(v, p, now);
      const h = this.headOffset(v);
      return { hit: scr({ x: pos.x + off.x + h.hit.x, y: pos.y + off.y + h.hit.y }), feet: scr({ x: pos.x + off.x, y: pos.y + off.y }) };
    };
    const A = anchor(a, c.from);
    const T = c.self ? A : anchor(t, c.to);
    const targets = c.targetIds.map((id) => (id === c.attackerId ? A : id === c.targetId ? T : anchor(p.entities.get(id), c.at)));
    // Área: centro no alvo vivo (lançada) ou nos pés do atacante (ao redor de si); linha: ponta relativa ao atacante.
    const aPos = a ? this.posOf(p, a, alpha) : c.from;
    const aroundSelf = Math.hypot(c.at.x - c.from.x, c.at.y - c.from.y) < 2;
    const center = c.self || aroundSelf ? A.feet : t ? T.feet : scr(c.at);
    const endWorld = { x: aPos.x + (c.at.x - c.from.x), y: aPos.y + (c.at.y - c.from.y) };
    const end = { x: Math.round(endWorld.x - cam.x) + (A.hit.x - A.feet.x), y: Math.round(endWorld.y - cam.y) + (A.hit.y - A.feet.y) };
    const line = this.moveTarget(p, c) === "line";
    const tip = line ? end : T.hit;
    const dx = tip.x - A.hit.x;
    const dy = tip.y - A.hit.y;
    const len = Math.hypot(dx, dy) || 1;
    const f: VfxFrame = {
      g: this.ctx,
      seq: Math.abs(c.seq),
      P: c.params.palette,
      S: c.params.scale,
      count: c.params.count,
      now,
      o: A.hit,
      of: A.feet,
      d: T.hit,
      df: T.feet,
      targets,
      c: center,
      end: tip,
      radius: c.radius,
      dir: c.self ? { x: 1, y: 0 } : { x: dx / len, y: dy / len },
      self: c.self,
      glow: c.params.glow,
    };
    drawCast(f, c, now, layer, layer === "over" ? this.opts.fxSheets : undefined);
  }

  private moveTarget(p: Presenter, c: Cast): string | undefined {
    return p.moves.moves[c.moveId]?.target;
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
  }

  /** Altura (px) do topo da cabeça acima dos pés, para Tamers com sprite real ou placeholder. */
  private tamerTop(v: VisualEntity): number {
    const tv = v.kind === "player" ? this.opts.tamers?.local : this.opts.tamers?.remote;
    if (!tv) return TAMER_PIVOT.y;
    const m = tv.manifest;
    return m.pivot.y - (m.anchors?.head?.y ?? 0);
  }

  /**
   * Rótulos de nome e nível (Tamers e Digimon) das entidades visíveis, ancorados acima da cabeça (e acima da barra
   * de HP quando ela aparece), em px lógicos de tela. A disposição sem sobreposição fica em labels.ts.
   */
  labels(p: Presenter, alpha: number, now: number): EntityLabel[] {
    const out: EntityLabel[] = [];
    const cam = this.camera;
    const localPartner = p.entities.get(p.localPartnerId);
    for (const v of p.entities.values()) {
      if (v.defeatedAt !== undefined && now > v.defeatedAt + 400) continue;
      const pos = this.posOf(p, v, alpha);
      const x = Math.round(pos.x - cam.x);
      const y = Math.round(pos.y - cam.y);
      if (x < -40 || y < -10 || x > cam.w + 40 || y > cam.h + 120) continue;
      const tamer = v.kind === "player" || v.kind === "remote_player";
      const top = tamer ? this.tamerTop(v) : this.headOffset(v).top;
      const bar = p.barVisible(v, now) ? 8 : 1;
      const mine = v.kind === "player" || v.ownerId === p.localPlayerId;
      const off = tamer ? { x: 0, y: 0 } : this.combatOffset(v, p, now);
      out.push({
        id: v.id,
        name: v.name,
        level: tamer ? this.opts.tamerLevels?.[v.id] : v.level,
        x: x + off.x,
        y: y - Math.round(top) - bar - 1,
        color: tamer ? (mine ? "#ffe9a8" : "#ffffff") : v.kind === "wild" ? "#ffb4a2" : mine ? "#9ff0ff" : "#cdb8ff",
        priority: v.kind === "player" ? 5 : v.id === p.localPartnerId ? 4 : localPartner?.targetId === v.id ? 3 : tamer || v.kind === "remote_partner" ? 2 : 1,
        alpha: v.defeatedAt !== undefined ? 0.5 : v.kind === "wild" && !v.encounterId ? 0.85 : 1,
      });
    }
    return out;
  }
}
