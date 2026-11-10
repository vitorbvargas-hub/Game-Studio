// Look v8 (DRAKANTOS_VISUAL_STUDY.md + pacote art/map-factory/forest-v8-depth): grade de cor da arte do cenário,
// luzes pontuais aditivas, névoa na borda da mata, partículas, sombra de contato, lama roxa e decalques de chão.
// Só apresentação, ligado por mapa (`look` no <mapa>.aliases.json da variante) e por ?look=v8 no main.ts.

import type { TileSource } from "../assets/tiles";
import type { MapDecal, MapPatch, MapProp, WorldMap } from "../sim/map";
import type { Vec } from "../sim/types";
import type { CanvasFactory, ImageLike, ImageStore } from "./images";

export interface GradeRule {
  match: string;
  skip?: boolean;
  saturationMul?: number;
  valueMul?: number;
  /** Graus de matiz (positivo = para o azul/roxo nos verdes). */
  hueShift?: number;
  /** Puxa a cor para `tint` (ex. pedra e terra roxo-acinzentadas do frame do vídeo), 0..1. */
  tint?: string;
  tintMix?: number;
  /**
   * Arte sem preset noturno (pacotes extras da Map Factory): valores próprios da noite, no lugar dos do dia. Sem
   * isto a noite reaproveita a regra do dia com o valor suavizado. forest-v10: copas puxadas para o azul da noite do
   * forest-v4, senão ficam verdes no meio da mata azul.
   */
  night?: Omit<GradeRule, "match" | "skip" | "night">;
}

export interface LightCfg {
  color: string;
  radius: number;
  intensity: number;
  /** Deslocamento do centro da luz em relação ao pé do prop (px). */
  ox?: number;
  oy?: number;
}

export interface AmbientCfg {
  multiply: string;
  tint: string;
  tintAlpha: number;
  vignette: number;
  /** Escala da intensidade das luzes nesse preset (dia mais fraco, noite mais forte). */
  lightScale: number;
}

import type { ForegroundCfg, SwayCfg, WaterCfg } from "./life";

export interface LookCfg {
  id: string;
  zoomMul?: number;
  grade: {
    groundFoliageSaturationMul?: number;
    groundFoliageValueMul?: number;
    rimHighlightSaturationMul?: number;
    rimHighlightValueMul?: number;
    rules?: GradeRule[];
    /** Empurra as sombras (pixels escuros) para o azul/roxo, 0..1. */
    coolShift?: number;
  };
  lights: Record<string, Partial<LightCfg>>;
  playerLight?: LightCfg;
  ambient: { day: AmbientCfg; night: AmbientCfg };
  trees?: { rimLight?: { day: string; night: string; alpha: number }; castShadow?: { day: string; dayAlpha: number; night: string; nightAlpha: number } };
  shadows?: { color: string; entityAlpha: number; propAlpha: number };
  fog?: { color: string; dayAlpha: number; nightAlpha: number; every?: number };
  particles?: { fireflies?: number; dust?: number; leaves?: number };
  mud?: { dark: string; mid: string; light: string; rim: string };
  /** Props que são corpo de NPC humano no frame do Tamer (26×33): desenhados pelo caminho do Tamer, não pelo de prop. */
  npcKeys?: string[];
  /** Props cuja luz é fogo (lanterna, fogueira): flicker quente. */
  fireKeys?: string[];
  /** Opacidade da máscara das copas sobre as luzes (0 = luz por cima das copas, 1 = a copa apaga a luz sob ela). */
  canopyMask?: number;
  /** Look v9: vento em copas e grama (life.ts). */
  sway?: SwayCfg;
  /** Look v9: água das curvas correndo (scroll de UV por quadros). */
  water?: WaterCfg;
  /** Look v9: camada objects_above (primeiro plano) com transparência ao cobrir o jogador. */
  foreground?: ForegroundCfg;
}

// ---------- cor ----------

export function hexRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const d = mx - mn;
  let h = 0;
  if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return [h, mx ? d / mx : 0, mx];
}

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [r + m, g + m, b + m];
}

/** Regra de grade de uma chave (primeira que casa; nenhuma = o preset do palette.json). */
export function gradeRuleFor(key: string, look: LookCfg): GradeRule | undefined {
  return look.grade.rules?.find((r) => new RegExp(r.match).test(key));
}

/**
 * Grade de cor em RGBA no lugar (palette.json renderPreset): HSV com saturação e valor multiplicados; os ~12% de
 * pixels mais claros (rim de luz) com os multiplicadores mais suaves; sombras empurradas para o azul/roxo.
 */
export function gradePixels(d: Uint8ClampedArray, look: LookCfg, rule0?: GradeRule, night = false): void {
  const g = look.grade;
  const ownNight = night && !!rule0?.night;
  const rule = ownNight ? { ...rule0!, ...rule0!.night } : rule0;
  const sMul = rule?.saturationMul ?? g.groundFoliageSaturationMul ?? 0.64;
  // à noite o pacote já é escuro: o grade mexe só um pouco no valor (senão escurece duas vezes)
  const vMul0 = rule?.valueMul ?? g.groundFoliageValueMul ?? 0.8;
  const vMul = night && !ownNight ? 1 - (1 - vMul0) * 0.3 : vMul0;
  const tint = rule?.tint ? hexRgb(rule.tint).map((v) => v / 255) : undefined;
  const tMix = rule?.tintMix ?? 0;
  const rimS = rule ? Math.min(1, sMul * 1.25) : (g.rimHighlightSaturationMul ?? 0.88);
  const rimV = rule ? Math.min(1, vMul * 1.15) : (g.rimHighlightValueMul ?? 0.92);
  const hue = rule?.hueShift ?? 0;
  const cool = g.coolShift ?? 0;
  // limiar dos 12% mais claros por valor
  const hist = new Uint32Array(256);
  let n = 0;
  for (let i = 0; i < d.length; i += 4)
    if (d[i + 3]) {
      hist[Math.max(d[i], d[i + 1], d[i + 2])]++;
      n++;
    }
  let acc = 0;
  let rimAt = 256;
  for (let v = 255; v >= 0; v--) {
    acc += hist[v];
    if (acc > n * 0.12) {
      rimAt = v + 1;
      break;
    }
  }
  for (let i = 0; i < d.length; i += 4) {
    if (!d[i + 3]) continue;
    const rim = Math.max(d[i], d[i + 1], d[i + 2]) >= rimAt;
    let [h, s, v] = rgbToHsv(d[i] / 255, d[i + 1] / 255, d[i + 2] / 255);
    s *= rim ? rimS : sMul;
    v *= rim ? rimV : vMul;
    // verdes e amarelos giram um pouco para o frio (nada de verde-limão)
    if (h > 50 && h < 170) h = Math.min(180, h + hue + 6 * (1 - Math.abs(h - 100) / 70));
    let [r, gg, b] = hsvToRgb(h, Math.min(1, s), Math.min(1, v));
    if (tint && tMix > 0) {
      // tinta multiplicada pela luminância do pixel (mantém o desenho)
      const l = Math.min(1, (0.3 * r + 0.59 * gg + 0.11 * b) / 0.45);
      r += (tint[0] * l - r) * tMix;
      gg += (tint[1] * l - gg) * tMix;
      b += (tint[2] * l - b) * tMix;
    }
    if (cool > 0 && v < 0.42) {
      const k = cool * (1 - v / 0.42);
      r = r * (1 - k * 0.5) + 0.16 * k;
      gg = gg * (1 - k * 0.6) + 0.1 * k;
      b = b * (1 - k * 0.2) + 0.32 * k;
    }
    d[i] = Math.round(r * 255);
    d[i + 1] = Math.round(gg * 255);
    d[i + 2] = Math.round(b * 255);
  }
}

/**
 * Tiles com o grade do look: cada (URL, regra) vira um canvas registrado no ImageStore sob `look:<id>:<regra>:<url>`.
 * As imagens precisam estar carregadas. Chaves com regra `skip` (emissores, NPCs, baú, placa, cura) ficam como estão.
 */
export function gradeTiles(tiles: Record<string, TileSource>, look: LookCfg, images: ImageStore, make: CanvasFactory, night = false): Record<string, TileSource> {
  const out: Record<string, TileSource> = {};
  const done = new Map<string, string>();
  for (const [key, src] of Object.entries(tiles)) {
    const rule = gradeRuleFor(key, look);
    const img = images.get(src.url);
    if (rule?.skip || !img) {
      out[key] = src;
      continue;
    }
    const rid = rule ? look.grade.rules!.indexOf(rule) : -1;
    const id = `look:${look.id}:${rid}${night ? "n" : ""}:${src.url}`;
    if (!done.has(id)) {
      if (!images.get(id)) {
        const c = make(img.width, img.height);
        const g = c.getContext("2d")!;
        g.drawImage(img, 0, 0);
        const data = g.getImageData(0, 0, img.width, img.height);
        gradePixels(data.data, look, rule, night);
        g.putImageData(data, 0, 0);
        images.put(id, c as unknown as ImageLike);
      }
      done.set(id, id);
    }
    out[key] = { ...src, url: id };
  }
  return out;
}

// ---------- ruído ----------

function hash2(x: number, y: number, s: number): number {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 2147483647)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Ruído de valor bilinear em [0,1]. */
function vnoise(x: number, y: number, s: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = hash2(x0, y0, s);
  const b = hash2(x0 + 1, y0, s);
  const c = hash2(x0, y0 + 1, s);
  const d = hash2(x0 + 1, y0 + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

// ---------- chão (cacheado no chunk) ----------

/**
 * Lama roxa (manchas do brief, camada `patches`) no chunk em (x0, y0): elipse com borda por ruído (2 oitavas), borda
 * escura de 1 px, textura de 3 tons por ruído e pixels de grama que invadem a borda. Só nas células permitidas.
 */
export function drawPatches(g: CanvasRenderingContext2D, patches: MapPatch[], x0: number, y0: number, size: number, ts: number, mapW: number, look: LookCfg): void {
  const mud = look.mud ?? { dark: "#2a2136", mid: "#463757", light: "#62527a", rim: "#1f1a2a" };
  const cols = [hexRgb(mud.dark), hexRgb(mud.mid), hexRgb(mud.light)];
  const rim = hexRgb(mud.rim);
  for (const p of patches) {
    const bx0 = Math.max(x0, Math.floor(p.x));
    const by0 = Math.max(y0, Math.floor(p.y));
    const bx1 = Math.min(x0 + size, Math.ceil(p.x + p.w));
    const by1 = Math.min(y0 + size, Math.ceil(p.y + p.h));
    if (bx1 <= bx0 || by1 <= by0) continue;
    const img = g.getImageData(bx0 - x0, by0 - y0, bx1 - bx0, by1 - by0);
    const d = img.data;
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;
    const rx = p.w / 2;
    const ry = p.h / 2;
    const inside = (wx: number, wy: number) => {
      const e = ((wx - cx) / rx) ** 2 + ((wy - cy) / ry) ** 2;
      const n = vnoise(wx / 14, wy / 14, p.seed) * 0.42 + vnoise(wx / 5, wy / 5, p.seed + 7) * 0.16;
      return e < 0.62 + n && p.cells.has(Math.floor(wy / ts) * mapW + Math.floor(wx / ts));
    };
    for (let y = by0; y < by1; y++)
      for (let x = bx0; x < bx1; x++) {
        if (!inside(x, y)) continue;
        const i = ((y - by0) * (bx1 - bx0) + (x - bx0)) * 4;
        const edge = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1);
        // tufos de grama invadindo: na borda, parte dos pixels fica com o chão original
        if (edge && hash2(x, y, p.seed + 3) < 0.35) continue;
        let c: [number, number, number];
        if (edge) c = rim;
        else {
          const t = vnoise(x / 6, y / 4, p.seed + 11) * 0.7 + hash2(x, y, p.seed) * 0.3;
          c = cols[t < 0.38 ? 0 : t < 0.74 ? 1 : 2];
        }
        d[i] = c[0];
        d[i + 1] = c[1];
        d[i + 2] = c[2];
        d[i + 3] = 255;
      }
    g.putImageData(img, bx0 - x0, by0 - y0);
  }
}

/** Decalques de chão (camada `decals`) que tocam o chunk, centrados no ponto, com flip horizontal. */
/**
 * forest-v10: as manchas macro chegam com alfa baixo (até ~50) encostado na borda do PNG; cortada ali, a mancha
 * mostraria uma linha reta no chão. Multiplica o alfa por uma rampa suave (smoothstep) nos `f` px de cada borda.
 */
export function featherAlpha(data: Uint8ClampedArray, w: number, h: number, f: number): void {
  if (f <= 0) return;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const d = Math.min(x, y, w - 1 - x, h - 1 - y);
      if (d >= f) continue;
      const t = d / f;
      const i = (y * w + x) * 4 + 3;
      data[i] = Math.round(data[i] * t * t * (3 - 2 * t));
    }
}

export function drawDecals(g: CanvasRenderingContext2D, decals: MapDecal[], x0: number, y0: number, size: number, imageOf: (key: string) => { img: CanvasImageSource; w: number; h: number; rect?: [number, number, number, number] } | undefined): void {
  for (const dc of decals) {
    const src = imageOf(dc.key);
    if (!src) continue;
    const dx = Math.round(dc.x - src.w / 2) - x0;
    const dy = Math.round(dc.y - src.h / 2) - y0;
    if (dx > size || dy > size || dx + src.w < 0 || dy + src.h < 0) continue;
    const [sx, sy, sw, sh] = src.rect ?? [0, 0, src.w, src.h];
    if (dc.flip) {
      g.save();
      g.translate(dx + src.w, dy);
      g.scale(-1, 1);
      g.drawImage(src.img, sx, sy, sw, sh, 0, 0, src.w, src.h);
      g.restore();
    } else g.drawImage(src.img, sx, sy, sw, sh, dx, dy, src.w, src.h);
  }
}

/** Elipse cheia em pixels inteiros (sombra de contato). */
export function fillPixelEllipse(g: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number): void {
  for (let y = -ry; y <= ry; y++) {
    const half = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
    g.fillRect(cx - half, cy + y, half * 2 + 1, 1);
  }
}

/**
 * Sombra de contato dos props no chunk: elipse escura no pé (2 anéis: núcleo mais escuro), do tamanho do sprite.
 * Árvores (2 sprites) ganham só o núcleo junto ao tronco (a sombra projetada já existe).
 */
export function drawPropShadows(g: CanvasRenderingContext2D, props: MapProp[], x0: number, y0: number, size: number, look: LookCfg, sizeOf: (p: MapProp) => { w: number; tree: boolean } | undefined): void {
  const sh = look.shadows ?? { color: "#0a0812", entityAlpha: 0.42, propAlpha: 0.36 };
  g.fillStyle = sh.color;
  for (const p of props) {
    if (p.x < x0 - 64 || p.x > x0 + size + 64 || p.y < y0 - 16 || p.y > y0 + size + 16) continue;
    const s = sizeOf(p);
    if (!s) continue;
    const w = s.tree ? 18 : s.w;
    const rx = Math.max(3, Math.round(w * 0.38));
    const ry = Math.max(2, Math.round(rx * 0.36));
    const cx = Math.round(p.x) - x0;
    const cy = Math.round(p.y) - 1 - y0;
    g.globalAlpha = sh.propAlpha * 0.6;
    fillPixelEllipse(g, cx, cy, rx, ry);
    g.globalAlpha = sh.propAlpha;
    fillPixelEllipse(g, cx, cy, Math.max(2, Math.round(rx * 0.62)), Math.max(1, Math.round(ry * 0.6)));
  }
  g.globalAlpha = 1;
}

// ---------- luzes, névoa, partículas (por quadro) ----------

export interface LightSource extends LightCfg {
  x: number;
  y: number;
  phase: number;
  kind: string;
  /** Fogo (lanterna/fogueira): flicker quente. */
  fire?: boolean;
}

/** Luzes do mapa: props com `light` no look (pacote + extras), em px do mundo. */
export function mapLights(map: WorldMap, look: LookCfg): LightSource[] {
  const out: LightSource[] = [];
  for (const p of map.props) {
    const l = look.lights[p.key];
    if (!l?.color || !l.radius) continue;
    const fire = look.fireKeys?.includes(p.key);
    out.push({ color: l.color, radius: l.radius, intensity: l.intensity ?? 0.6, ox: l.ox ?? 0, oy: l.oy ?? 0, x: p.x, y: p.y, phase: hash2(Math.round(p.x), Math.round(p.y), 5) * 6.283, kind: p.key, ...(fire ? { fire } : {}) });
  }
  return out;
}

/**
 * Sprite de luz (gradiente radial em degraus, cor da luz com o miolo clareando), em cache por cor e raio.
 * Desenhado com 'lighter' (aditivo).
 */
export function lightSprite(color: string, radius: number, make: CanvasFactory, cache: Map<string, HTMLCanvasElement>): HTMLCanvasElement {
  const id = `${color}|${radius}`;
  let c = cache.get(id);
  if (c) return c;
  const size = radius * 2 + 1;
  c = make(size, size);
  const g = c.getContext("2d")!;
  const img = g.createImageData(size, size);
  const [r, gg, b] = hexRgb(color);
  const STEPS = 7;
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const dd = Math.hypot(x - radius, y - radius) / radius;
      if (dd >= 1) continue;
      // degraus (leitura de pixel art) com 1 px de pontilhado entre eles
      const raw = (1 - dd) ** 1.7;
      let q = Math.floor(raw * STEPS) / STEPS;
      if ((x + y) % 2 && raw * STEPS - Math.floor(raw * STEPS) > 0.7) q += 1 / STEPS;
      const core = Math.max(0, 1 - dd / 0.28);
      const i = (y * size + x) * 4;
      img.data[i] = Math.min(255, r + (255 - r) * core * 0.6);
      img.data[i + 1] = Math.min(255, gg + (255 - gg) * core * 0.6);
      img.data[i + 2] = Math.min(255, b + (255 - b) * core * 0.6);
      img.data[i + 3] = Math.round(255 * Math.min(1, q));
    }
  g.putImageData(img, 0, 0);
  cache.set(id, c);
  return c;
}

/** Fator de flicker de uma luz no instante `now` (cristal pulsa devagar, totem tremula, cogumelo respira). */
export function flicker(l: LightSource, now: number): { k: number; r: number } {
  const t = now / 1000;
  if (l.fire) {
    // fogo: tremor rápido + oscilação lenta + um "engasgo" curto de vez em quando (degrau, não seno puro)
    const gust = Math.sin(t * 0.9 + l.phase) > 0.93 ? -0.12 : 0;
    const jitter = Math.floor(t * 12 + l.phase * 3) % 3 === 0 ? 0.04 : 0;
    return { k: 1 + 0.09 * Math.sin(t * 9.7 + l.phase) + 0.06 * Math.sin(t * 23.3 + l.phase * 1.7) + 0.05 * Math.sin(t * 2.1 + l.phase) + gust + jitter, r: 1 + 0.035 * Math.sin(t * 8.3 + l.phase) + 0.02 * Math.sin(t * 2.1 + l.phase) };
  }
  if (/totem|sign/.test(l.kind)) return { k: 1 + 0.07 * Math.sin(t * 7.3 + l.phase) + 0.05 * Math.sin(t * 17.1 + l.phase * 2), r: 1 + 0.02 * Math.sin(t * 5.1 + l.phase) };
  if (/crystal|healing/.test(l.kind)) return { k: 1 + 0.12 * Math.sin(t * 1.6 + l.phase), r: 1 + 0.04 * Math.sin(t * 1.6 + l.phase) };
  return { k: 1 + 0.1 * Math.sin(t * 2.4 + l.phase) + 0.04 * Math.sin(t * 6.7 + l.phase), r: 1 };
}

/** Âncoras de névoa: células andáveis da borda da mata (chave de borda densa) a cada ~`every` células por hash. */
export function fogAnchors(map: WorldMap, every = 3): Vec[] {
  const keys = map.tileLayers[0]?.keys ?? [];
  const out: Vec[] = [];
  const ts = map.tileSize;
  for (let y = 0; y < map.height; y++)
    for (let x = 0; x < map.width; x++) {
      const i = y * map.width + x;
      if (!keys[i]?.includes("denseedge") || map.solid[i]) continue;
      if (hash2(x, y, 31) > 1 / every) continue;
      out.push({ x: x * ts + 16, y: y * ts + 16 });
    }
  return out;
}

/** Sprite de névoa (mancha macia em degraus, 72×30). */
export function fogSprite(color: string, make: CanvasFactory): HTMLCanvasElement {
  const w = 72;
  const h = 30;
  const c = make(w, h);
  const g = c.getContext("2d")!;
  const img = g.createImageData(w, h);
  const [r, gg, b] = hexRgb(color);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const e = ((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2;
      const n = vnoise(x / 9, y / 6, 91) * 0.6;
      const a = Math.max(0, 1 - e - n * 0.5);
      const i = (y * w + x) * 4;
      img.data[i] = r;
      img.data[i + 1] = gg;
      img.data[i + 2] = b;
      img.data[i + 3] = Math.round(255 * Math.floor(a * 4) / 4);
    }
  g.putImageData(img, 0, 0);
  return c;
}

/**
 * Partículas sem estado (posição = função do tempo e do bloco de 8×8 tiles do mundo): vagalumes (noite forte, dia
 * fraco), poeira digital subindo e folhas caindo raras. Desenha só nos blocos visíveis.
 */
export function drawParticles(ctx: CanvasRenderingContext2D, cam: { x: number; y: number; w: number; h: number }, now: number, night: number, cfg: NonNullable<LookCfg["particles"]>, glow: HTMLCanvasElement): void {
  const B = 256;
  const t = now / 1000;
  for (let by = Math.floor(cam.y / B); by * B < cam.y + cam.h; by++)
    for (let bx = Math.floor(cam.x / B); bx * B < cam.x + cam.w; bx++) {
      const nF = Math.floor((cfg.fireflies ?? 0) + hash2(bx, by, 1));
      for (let i = 0; i < nF; i++) {
        const h1 = hash2(bx, by, 10 + i);
        const h2 = hash2(bx, by, 50 + i);
        const x = bx * B + h1 * B + Math.sin(t * (0.3 + h2 * 0.4) + h1 * 20) * 18 - cam.x;
        const y = by * B + h2 * B + Math.cos(t * (0.25 + h1 * 0.3) + h2 * 20) * 12 - cam.y;
        const blink = Math.max(0, Math.sin(t * (1.2 + h2) + h1 * 40));
        const a = (0.12 + 0.88 * night) * blink;
        if (a < 0.03) continue;
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = a * 0.6;
        ctx.drawImage(glow, Math.round(x) - 3, Math.round(y) - 3);
        ctx.globalAlpha = a;
        ctx.fillStyle = "#f2ffb0";
        ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
      }
      const nD = Math.floor((cfg.dust ?? 0) + hash2(bx, by, 2));
      for (let i = 0; i < nD; i++) {
        const h1 = hash2(bx, by, 100 + i);
        const h2 = hash2(bx, by, 150 + i);
        const life = (t * (0.08 + h2 * 0.06) + h1) % 1;
        const x = bx * B + h1 * B + Math.sin(t * 0.8 + h2 * 9) * 4 - cam.x;
        const y = by * B + h2 * B - life * 40 - cam.y;
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = Math.sin(life * Math.PI) * (0.35 + 0.35 * night);
        ctx.fillStyle = i % 2 ? "#2ce8f5" : "#9b7bff";
        ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
      }
      const nL = hash2(bx, by, 3) < (cfg.leaves ?? 0) ? 1 : 0;
      for (let i = 0; i < nL; i++) {
        const h1 = hash2(bx, by, 200 + i);
        const life = (t / 7 + h1) % 1;
        const x = bx * B + h1 * B + Math.sin(life * 12) * 10 - cam.x;
        const y = by * B + hash2(bx, by, 201) * B * 0.5 + life * 90 - cam.y;
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = Math.min(1, Math.sin(life * Math.PI) * 1.4) * (1 - 0.6 * night);
        ctx.fillStyle = Math.sin(life * 30) > 0 ? "#5b6b3a" : "#7a6a3e";
        ctx.fillRect(Math.round(x), Math.round(y), 2, 1);
      }
    }
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
}

/** Mistura linear de dois presets de ambiente (0 = dia, 1 = noite). */
export function ambientMix(look: LookCfg, night: number): AmbientCfg {
  const a = look.ambient.day;
  const b = look.ambient.night;
  const mixHex = (x: string, y: string) => {
    const p = hexRgb(x);
    const q = hexRgb(y);
    return `rgb(${p.map((v, i) => Math.round(v + (q[i] - v) * night)).join(",")})`;
  };
  return {
    multiply: mixHex(a.multiply, b.multiply),
    tint: mixHex(a.tint, b.tint),
    tintAlpha: a.tintAlpha + (b.tintAlpha - a.tintAlpha) * night,
    vignette: a.vignette + (b.vignette - a.vignette) * night,
    lightScale: a.lightScale + (b.lightScale - a.lightScale) * night,
  };
}
