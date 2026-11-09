// Motor de VFX por arquétipo. O Presenter cria um Cast no `attack_start` confirmado (a sim já decidiu tudo);
// aqui só se decide COMO e QUANDO desenhar: tempos das fases, paleta, escala e o despacho para o arquétipo.
// Os dados vêm de src/data/moves/vfx_archetypes.json (game-design) ou do provisório src/data/moves-dev/.
// Folhas de efeito do game-art (GAME-ASSETS/04-effects/**/*.vfx.json + PNG) entram por cima do desenho em código.

import vfxFile from "../../data/moves/vfx_archetypes.json";
import type { CreatureManifest } from "../../assets/creatures";
import type { MoveDef, Vec } from "../../sim/types";
import { attackTiming } from "../anim";
import { ARCHETYPES, type Phase, type VfxFrame } from "./archetypes";
import { clamp01, step8 } from "./pixel";

/** Parâmetros finais de um golpe na apresentação (arquétipo do game-design + ajustes por golpe). */
export interface ArchetypeParams {
  /** Implementação desenhada em código (chave de ARCHETYPES). */
  impl: string;
  shape: string;
  charge: number;
  launch: number;
  travel: number;
  impact: number;
  residue: number;
  shake: { amp: number; dur: number } | null;
  /** Clarão LOCAL no ponto de impacto (nunca tela cheia). */
  flash: { color: string; alpha: number; dur: number } | null;
  glow: number;
  /** Rampa de 7 cores: núcleo claro → borda escura. */
  palette: string[];
  /** Nome da paleta (elemento, cura ou o próprio arquétipo). */
  paletteName: string;
  count: number;
  scale: number;
}

interface RawArchetype {
  id: string;
  name?: string;
  shape?: string;
  palette?: string[];
  particles?: { type?: string; count?: number; sizePx?: [number, number] };
  screenShake?: { amplitudePx: number; durationMs: number } | null;
  flash?: { color: string; alpha: number; durationMs: number } | null;
  keyframes?: { chargeMs?: number; launchMs?: number; travelMs?: number; impactMs?: number; residueMs?: number };
}

/** Arquétipo do game-design → implementação em código. Os ids sem par aqui usam a implementação de mesmo nome. */
export const IMPL_OF: Record<string, string> = {
  fireball: "fire_bolt",
  breath_flame: "flame_breath",
  ice_shard: "ice_shard",
  beam: "beam",
  claw_slash: "slash",
  energy_blade: "energy_blade",
  holy_burst: "holy_burst",
  bubble_spit: "bubbles",
  wind_blade: "wind_cutter",
  tackle_impact: "melee_impact",
  tornado_field: "tornado_field",
  guard_aura: "buff_aura",
  fear_howl: "howl_wave",
  freeze_bind: "freeze_bind",
  multi_hit_flurry: "multi_hit_flurry",
};

const RAW: Record<string, RawArchetype> = Object.fromEntries(((vfxFile as unknown as { archetypes: RawArchetype[] }).archetypes ?? []).map((a) => [a.id, a]));
export const ARCHETYPE_IDS = Object.keys(RAW);

/** Rampas por elemento (Endesga-32 + tons próprios), usadas quando o golpe tinge um arquétipo genérico. */
export const ELEMENT_RAMPS: Record<string, string[]> = {
  fire: ["#ffffff", "#fff3a8", "#fee761", "#feae34", "#f77622", "#e43b44", "#a22633"],
  ice: ["#ffffff", "#e6fbff", "#a8f0ff", "#2ce8f5", "#0099db", "#124e89", "#0b2a5c"],
  water: ["#ffffff", "#e8fbff", "#9ee8ff", "#2ce8f5", "#0099db", "#3a78c4", "#124e89"],
  wind: ["#ffffff", "#f4fff4", "#c9f7d0", "#8fe3a8", "#5ac58a", "#3e8948", "#265c42"],
  light: ["#ffffff", "#fffbe0", "#fff3a8", "#fee761", "#feae34", "#d59a3a", "#8a5a2b"],
  thunder: ["#ffffff", "#f4f7ff", "#c8e3ff", "#7ac7ff", "#5a8cff", "#6a4bd8", "#3b2a8c"],
  dark: ["#ffffff", "#f2c9ff", "#c87ae0", "#b55088", "#68386c", "#3e2153", "#181425"],
  heal: ["#ffffff", "#eaffd8", "#b6f28c", "#63c74d", "#3e8948", "#265c42", "#193c3e"],
  neutral: ["#ffffff", "#fff6c8", "#fee761", "#feae34", "#f77622", "#be4a2f", "#733e39"],
};

/** Arquétipos "genéricos" que trocam de cor pelo elemento do golpe (ex.: garra gelada, aura de fogo). */
const TINTABLE = new Set(["claw_slash", "tackle_impact", "multi_hit_flurry", "energy_blade", "beam", "guard_aura"]);

const hex = (c: string): [number, number, number] => {
  const n = parseInt(c.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const luma = (c: string): number => {
  const [r, g, b] = hex(c);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};
const toHex = (r: number, g: number, b: number): string => "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

/** Paleta de 3–4 cores do arquétipo → rampa de 7 tons (ordenada por luminância, branco no topo), interpolada em RGB. */
export function rampOf(colors: string[]): string[] {
  const stops = [...colors].sort((a, b) => luma(b) - luma(a));
  if (stops[0].toLowerCase() !== "#ffffff") stops.unshift("#ffffff");
  if (stops.length === 1) return Array(7).fill(stops[0]);
  return Array.from({ length: 7 }, (_, i) => {
    const u = (i / 6) * (stops.length - 1);
    const j = Math.min(stops.length - 2, Math.floor(u));
    const k = u - j;
    const [a, b] = [hex(stops[j]), hex(stops[j + 1])];
    return toHex(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k);
  });
}

/**
 * Parâmetros de um golpe: tempos, tremida, clarão e paleta do arquétipo (vfx_archetypes.json); escala pelo poder
 * (2 = normal, 3 = pesado a partir de 180); cura usa a rampa verde; arquétipos genéricos tingem pelo elemento do golpe.
 */
export function moveVfx(move: Pick<MoveDef, "vfx" | "type" | "element" | "power"> | undefined): ArchetypeParams {
  const id = move?.vfx && RAW[move.vfx] ? move.vfx : "tackle_impact";
  const raw = RAW[id] ?? { id };
  const kf = raw.keyframes ?? {};
  let impl = IMPL_OF[id] ?? (ARCHETYPES[id] ? id : "melee_impact");
  let paletteName = id;
  let palette = rampOf(raw.palette?.length ? raw.palette : ["#ffffff", "#c0cbdc", "#3a4466"]);
  if (move?.type === "heal") {
    impl = "heal";
    paletteName = "heal";
    palette = ELEMENT_RAMPS.heal;
  } else if (move && move.element !== "neutral" && TINTABLE.has(id) && ELEMENT_RAMPS[move.element]) {
    paletteName = move.element;
    palette = ELEMENT_RAMPS[move.element];
  }
  const power = move?.power ?? 100;
  return {
    impl,
    shape: raw.shape ?? "melee_impact",
    charge: kf.chargeMs ?? 0,
    launch: kf.launchMs ?? 0,
    travel: kf.travelMs ?? 0,
    impact: Math.max(60, kf.impactMs ?? 200),
    residue: kf.residueMs ?? 0,
    shake: raw.screenShake ? { amp: Math.min(2, raw.screenShake.amplitudePx), dur: Math.min(150, raw.screenShake.durationMs) } : null,
    flash: raw.flash ? { color: raw.flash.color, alpha: raw.flash.alpha, dur: raw.flash.durationMs } : null,
    glow: 8 + (power >= 180 ? 4 : 0),
    palette,
    paletteName,
    count: Math.max(1, raw.particles?.count ?? 6),
    scale: power >= 180 ? 3 : 2,
  };
}

/** Parâmetros só pelo id do arquétipo (capturas, ícones, eventos sintéticos como a evolução). */
export function archetypeParams(id: string, power = 150, element = "neutral"): ArchetypeParams {
  return moveVfx({ vfx: id, type: "special", element, power });
}

export interface CastTiming {
  hitAtMs: number;
  durationMs: number;
  procedural: boolean;
  launchAtMs?: number;
}

/**
 * Tempos do golpe na apresentação. Corpo a corpo: impacto no hitFrame do manifest (ou 160 ms procedural); a
 * antecipação da animação é a "carga". À distância: lança em max(hitFrame, carga) e acerta após a viagem.
 * Aura/área sem viagem: a carga toca antes do efeito. Só muda QUANDO o resultado aparece, nunca o resultado.
 */
export function castTiming(m: CreatureManifest | undefined, p: ArchetypeParams): CastTiming {
  const base = attackTiming(m, false);
  const melee = p.shape === "melee_impact" && p.travel <= 0;
  if (melee || (p.charge <= 0 && p.travel <= 0)) return base;
  const launch = Math.max(base.hitAtMs, p.charge);
  const hit = launch + p.travel;
  return { hitAtMs: hit, durationMs: base.durationMs + (hit - base.hitAtMs), procedural: base.procedural, launchAtMs: launch };
}

/** Golpe em andamento na apresentação (criado no attack_start confirmado). */
export interface Cast {
  seq: number;
  moveId: string;
  archetype: string;
  params: ArchetypeParams;
  attackerId: string;
  targetId: string;
  targetIds: string[];
  /** Centro do efeito em px do mundo (área: impacto; linha: ponta). */
  at: Vec;
  /** Origem e alvo em px do mundo no início (fallback se a entidade sumir). */
  from: Vec;
  to: Vec;
  self: boolean;
  /** Área: raio; linha: meia largura (px). */
  radius: number;
  start: number;
  launchAt: number;
  hitAt: number;
  end: number;
  mine: boolean;
}

export function castEnd(c: Pick<Cast, "hitAt" | "params">): number {
  return c.hitAt + c.params.impact + c.params.residue;
}

/** Fases ativas no instante `now` (várias podem se sobrepor: o resíduo começa na metade do impacto). */
export function phasesAt(c: Cast, now: number): { phase: Phase; t: number; k: number }[] {
  const out: { phase: Phase; t: number; k: number }[] = [];
  const p = c.params;
  const t = now - c.start;
  const L = c.launchAt - c.start;
  const H = c.hitAt - c.start;
  const ranged = c.launchAt < c.hitAt || (p.charge > 0 && p.shape !== "melee_impact");
  // Corpo a corpo: a "carga" é a antecipação do corpo, tocada logo antes do impacto.
  const chargeEnd = ranged ? L : H;
  if (p.charge > 0 && t >= chargeEnd - p.charge && t < chargeEnd) out.push({ phase: "charge", t: t - (chargeEnd - p.charge), k: clamp01((t - (chargeEnd - p.charge)) / p.charge) });
  const launchMs = Math.max(60, p.launch);
  if (ranged && t >= L && t < L + launchMs) out.push({ phase: "launch", t: t - L, k: (t - L) / launchMs });
  if (H > L && t >= L && t < H) out.push({ phase: "travel", t: t - L, k: (t - L) / (H - L) });
  if (t >= H && t < H + p.impact) out.push({ phase: "impact", t: t - H, k: (t - H) / p.impact });
  // Resíduo começa nos últimos 40% do impacto e dura residueMs depois dele (fumaça/cristais assentando).
  const r0 = H + p.impact * 0.6;
  const rLen = p.impact * 0.4 + p.residue;
  if (p.residue > 0 && t >= r0 && t < r0 + rLen) out.push({ phase: "residue", t: t - r0, k: (t - r0) / rLen });
  return out;
}

/** Desenha uma camada do golpe: "ground" (sob as entidades) ou "over" (por cima). */
export function drawCast(f: VfxFrame, c: Cast, now: number, layer: "ground" | "over", sheets?: SheetDrawer): void {
  const a = ARCHETYPES[c.params.impl];
  if (!a) return;
  const g = f.g;
  if (layer === "over") localFlash(f, c, now);
  for (const ph of phasesAt(c, now)) {
    g.save();
    if (layer === "ground") a.ground?.(f, ph.phase, ph.t, ph.k);
    else {
      switch (ph.phase) {
        case "charge":
          a.charge?.(f, ph.k, ph.t);
          break;
        case "launch":
          a.launch?.(f, ph.t);
          break;
        case "travel":
          a.travel?.(f, ph.k, ph.t);
          break;
        case "impact":
          a.impact?.(f, ph.t, ph.k);
          break;
        case "residue":
          a.residue?.(f, ph.t, ph.k);
          break;
      }
      sheets?.(f, c, ph.phase, ph.t);
    }
    g.restore();
  }
}

/** Clarão local (§4 do MOVE_SYSTEM): disco aditivo na cor do arquétipo sobre cada alvo, durante flash.dur. */
function localFlash(f: VfxFrame, c: Cast, now: number): void {
  const fl = c.params.flash;
  const t = now - c.hitAt;
  if (!fl || t < 0 || t >= fl.dur) return;
  const g = f.g;
  const a = step8(fl.alpha * (1 - t / fl.dur));
  if (a <= 0) return;
  g.save();
  g.globalCompositeOperation = "lighter";
  g.globalAlpha = a;
  const r = 6 + 3 * c.params.scale;
  for (const tg of f.targets) {
    g.fillStyle = fl.color;
    for (let y = -r; y <= r; y++) {
      const half = Math.floor(Math.sqrt(Math.max(0, r * r - y * y)));
      g.fillRect(Math.round(tg.hit.x) - half, Math.round(tg.hit.y) + y, half * 2 + 1, 1);
    }
  }
  g.restore();
}

// ---------- folhas de efeito do game-art (opcional) ----------

/** Manifest de folha de efeito: GAME-ASSETS/04-effects/<categoria>/<nome>.vfx.json (+ o PNG ao lado). */
export interface SheetManifest {
  archetype: string;
  phase: Phase;
  image: string;
  frameW: number;
  frameH: number;
  frames: number;
  frameMs: number;
  /** Pivô dentro do quadro (px), alinhado ao ponto de impacto (ou à origem, na carga/lançamento). */
  pivot?: [number, number];
  blend?: "lighter" | "source-over";
}

export interface FxSheet extends SheetManifest {
  url: string;
}

export type SheetDrawer = (f: VfxFrame, c: Cast, phase: Phase, t: number) => void;

/** Monta o catálogo de folhas a partir dos mapas do import.meta.glob (chave = caminho). */
export function buildSheetCatalog(manifests: Record<string, unknown>, pngs: Record<string, string>): FxSheet[] {
  const out: FxSheet[] = [];
  for (const [path, raw] of Object.entries(manifests)) {
    const m = raw as SheetManifest;
    if (!m?.archetype || !m.image) continue;
    const dir = path.slice(0, path.lastIndexOf("/") + 1);
    const url = pngs[dir + m.image];
    if (url) out.push({ ...m, url });
  }
  return out;
}

export function loadSheetCatalog(): FxSheet[] {
  const manifests = import.meta.glob("@game-assets/04-effects/**/*.vfx.json", { eager: true, import: "default" });
  const pngs = import.meta.glob<string>("@game-assets/04-effects/**/*.png", { eager: true, query: "?url", import: "default" });
  return buildSheetCatalog(manifests, pngs);
}

/** Desenhista de folhas: quadro pelo tempo da fase, no impacto de cada alvo (ou na origem, na carga/lançamento). */
export function sheetDrawer(sheets: FxSheet[], getImage: (url: string) => CanvasImageSource | undefined): SheetDrawer {
  const by = new Map(sheets.map((s) => [`${s.archetype}|${s.phase}`, s]));
  return (f, c, phase, t) => {
    const s = by.get(`${c.archetype}|${phase}`);
    const img = s && getImage(s.url);
    if (!s || !img) return;
    const fi = Math.min(s.frames - 1, Math.floor(t / s.frameMs));
    const cols = Math.max(1, Math.floor(((img as { width: number }).width ?? s.frameW) / s.frameW));
    const sx = (fi % cols) * s.frameW;
    const sy = Math.floor(fi / cols) * s.frameH;
    const [px, py] = s.pivot ?? [Math.floor(s.frameW / 2), Math.floor(s.frameH / 2)];
    const at = phase === "charge" || phase === "launch" ? [f.o] : f.targets.map((x) => x.hit);
    const prev = f.g.globalCompositeOperation;
    if (s.blend === "lighter") f.g.globalCompositeOperation = "lighter";
    for (const p of at) f.g.drawImage(img, sx, sy, s.frameW, s.frameH, Math.round(p.x - px), Math.round(p.y - py), s.frameW, s.frameH);
    f.g.globalCompositeOperation = prev;
  };
}
