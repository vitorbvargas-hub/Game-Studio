// Tamer modular (GAME-ASSETS/11-characters/player/character_parts.json v2): corpo + cabelo + roupa em camadas,
// recoloridos por paleta. Só apresentação.
//
// Recolor: cada camada é carregada numa única cor-base e trocada por rampa. Uma rampa do JSON tem 3 tons
// (light/base/dark); a arte usa mais 2 derivados dela, medidos nos PNGs prontos: contorno = dark → tinta #181425
// a 65% e brilho = light → branco a 55% (arredondado). Com os 5 tons, o recolor reproduz pixel a pixel as
// variantes pré-renderizadas do pacote (tests/tamer.test.ts). Bases escolhidas sem colisão com as cores fixas da
// camada: pele "pale", cabelo "castanho", roupa casual "vermelho", aventureiro "marrom", tamer-clássico "amarelo"
// (o azul colide com o detalhe tecnológico fixo #0099db da jaqueta).

import type { CanvasFactory, ImageLike, ImageStore } from "../render/images";
import type { AnimFrame, CreatureManifest, CreatureVisual } from "./creatures";
import partsJson from "@game-assets/11-characters/player/character_parts.json";

export interface Ramp {
  light: string;
  base: string;
  dark: string;
}

export interface PartsData {
  frame: { w: number; h: number };
  pivot: { x: number; y: number };
  anchors: { head: { x: number; y: number }; shadow: { cx: number; cy: number; rx: number; ry: number } };
  drawOrder: string[];
  animations: Record<string, { frames: number; fps?: number; loop: boolean; directions: string[] }>;
  layers: {
    body: { models: string[]; skinTones: Record<string, Ramp> };
    hair: { cuts: string[]; colors: Record<string, Ramp> };
    clothing: { outfits: string[]; colorOptions: Record<string, string[]>; colorRamps: Record<string, Ramp> };
  };
}

export const PARTS = partsJson as unknown as PartsData;

export type Model = "male" | "female";

export interface TamerLook {
  name: string;
  model: Model;
  skin: string;
  hairCut: string;
  hairColor: string;
  outfit: string;
  outfitColor: string;
}

/** Cor-base carregada de cada camada (o resto sai por recolor). */
export const BASE = { skin: "pale", hair: "castanho", outfit: { casual: "vermelho", aventureiro: "marrom", "tamer-classico": "amarelo" } as Record<string, string> };

/** Rótulos pt-BR das opções. */
export const LABELS: Record<string, string> = {
  male: "Modelo 1",
  female: "Modelo 2",
  pale: "Clara",
  tan: "Média",
  deep: "Escura",
  curto: "Curto",
  "espetado-tai": "Espetado",
  "longo-liso": "Longo liso",
  "rabo-de-cavalo": "Rabo de cavalo",
  "marias-chiquinhas": "Marias-chiquinhas",
  "franja-longa": "Franja longa",
  moicano: "Moicano",
  preto: "Preto",
  castanho: "Castanho",
  loiro: "Loiro",
  ruivo: "Ruivo",
  azul: "Azul",
  rosa: "Rosa",
  verde: "Verde",
  branco: "Branco",
  vermelho: "Vermelho",
  amarelo: "Amarelo",
  roxo: "Roxo",
  marrom: "Marrom",
  aco: "Aço",
  casual: "Casual",
  aventureiro: "Aventureiro",
  "tamer-classico": "Tamer clássico",
};

/** Opções do criador: modelo (2), pele (3), corte (7), cor do cabelo (8), roupa (3) × cor (todas as rampas). */
export function lookOptions(p: PartsData = PARTS) {
  return {
    model: p.layers.body.models as Model[],
    skin: Object.keys(p.layers.body.skinTones),
    hairCut: p.layers.hair.cuts,
    hairColor: Object.keys(p.layers.hair.colors),
    outfit: p.layers.clothing.outfits,
    outfitColor: Object.keys(p.layers.clothing.colorRamps),
  };
}

export const DEFAULT_LOOK: TamerLook = { name: "Kaio", model: "male", skin: "tan", hairCut: "espetado-tai", hairColor: "castanho", outfit: "tamer-classico", outfitColor: "azul" };

/** Tamanho máximo do nome do Tamer (o mesmo do `maxlength` do criador). */
export const NAME_MAX = 14;
/** Letras (com acento), números, espaço, `_`, `-` e `.`. */
const NAME_OK = /^[\p{L}\p{N} _.\-]+$/u;

export type NameCheck = { ok: true; name: string } | { ok: false; name: string; error: "empty" | "long" | "chars" };

/**
 * Validação do nome do Tamer em JS (não depende do `maxlength` do input): apara, junta espaços, recusa vazio,
 * mais de NAME_MAX caracteres (por code point) e caracteres fora de letras/números/espaço/`_-.`.
 */
export function checkTamerName(raw: unknown): NameCheck {
  const name = String(raw ?? "").replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim();
  if (!name) return { ok: false, name, error: "empty" };
  if ([...name].length > NAME_MAX) return { ok: false, name, error: "long" };
  if (!NAME_OK.test(name)) return { ok: false, name, error: "chars" };
  return { ok: true, name };
}

/** Nome seguro para o dado: o válido, ou o saneado (só caracteres aceitos, cortado em NAME_MAX), ou o padrão. */
export function safeTamerName(raw: unknown): string {
  const c = checkTamerName(raw);
  if (c.ok) return c.name;
  const cleaned = [...c.name.replace(/[^\p{L}\p{N} _.\-]/gu, "")].slice(0, NAME_MAX).join("").trim();
  return cleaned || DEFAULT_LOOK.name;
}

/** Look válido (campos desconhecidos caem no padrão); nome saneado, 1–14 caracteres. */
export function normalizeLook(l: Partial<TamerLook>, p: PartsData = PARTS): TamerLook {
  const o = lookOptions(p);
  const pick = <T extends string>(v: unknown, list: T[], d: T): T => (list.includes(v as T) ? (v as T) : d);
  const name = safeTamerName(l.name);
  return {
    name,
    model: pick(l.model, o.model, DEFAULT_LOOK.model),
    skin: pick(l.skin, o.skin, DEFAULT_LOOK.skin),
    hairCut: pick(l.hairCut, o.hairCut, DEFAULT_LOOK.hairCut),
    hairColor: pick(l.hairColor, o.hairColor, DEFAULT_LOOK.hairColor),
    outfit: pick(l.outfit, o.outfit, DEFAULT_LOOK.outfit),
    outfitColor: pick(l.outfitColor, o.outfitColor, DEFAULT_LOOK.outfitColor),
  };
}

/** Combinação aleatória determinística (bots): mesma semente → mesmo visual. */
export function randomLook(seed: number, name: string, p: PartsData = PARTS): TamerLook {
  let s = seed >>> 0;
  const rnd = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const o = lookOptions(p);
  const pick = <T,>(a: T[]): T => a[Math.floor(rnd() * a.length)];
  return { name, model: pick(o.model), skin: pick(o.skin), hairCut: pick(o.hairCut), hairColor: pick(o.hairColor), outfit: pick(o.outfit), outfitColor: pick(o.outfitColor) };
}

/** Visual de um Tamer bot: combinação aleatória pela semente do mundo + id do jogador (estável entre sessões). */
export function botLook(worldSeed: number, playerId: string, name: string): TamerLook {
  const h = [...playerId].reduce((a, c) => Math.imul(a ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
  return randomLook((Math.imul(worldSeed, 31) + h) >>> 0, name);
}

export function lookKey(l: TamerLook): string {
  return [l.model, l.skin, l.hairCut, l.hairColor, l.outfit, l.outfitColor].join("|");
}

// ---------- paleta ----------

type RGB = [number, number, number];
const INK: RGB = [0x18, 0x14, 0x25];
const WHITE: RGB = [255, 255, 255];

export function hexToRgb(h: string): RGB {
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
}

const lerp = (a: RGB, b: RGB, t: number): RGB => a.map((v, i) => Math.round(v + (b[i] - v) * t)) as RGB;

/** Os 5 tons usados pela arte a partir de uma rampa de 3: light, base, dark, contorno e brilho. */
export function expandRamp(r: Ramp): RGB[] {
  const light = hexToRgb(r.light);
  const dark = hexToRgb(r.dark);
  return [light, hexToRgb(r.base), dark, lerp(dark, INK, 0.65), lerp(light, WHITE, 0.55)];
}

/** Tabela de troca (cor 0xRRGGBB → RGB) de uma rampa para outra. */
export function swapTable(from: Ramp, to: Ramp): Map<number, RGB> {
  const a = expandRamp(from);
  const b = expandRamp(to);
  const m = new Map<number, RGB>();
  a.forEach((c, i) => m.set((c[0] << 16) | (c[1] << 8) | c[2], b[i]));
  return m;
}

/** Recolore pixels RGBA no lugar (alpha preservado; cores fora da tabela ficam como estão). */
export function recolorPixels(d: Uint8ClampedArray, table: Map<number, RGB>): void {
  if (!table.size) return;
  for (let i = 0; i < d.length; i += 4) {
    if (!d[i + 3]) continue;
    const t = table.get((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]);
    if (t) {
      d[i] = t[0];
      d[i + 1] = t[1];
      d[i + 2] = t[2];
    }
  }
}

// ---------- arquivos ----------

/** Quadros desenhados: anim → direção → nº de quadros (W = E espelhado). */
export function frameList(p: PartsData = PARTS): { anim: string; dir: string; n: number }[] {
  const out: { anim: string; dir: string; n: number }[] = [];
  for (const [anim, a] of Object.entries(p.animations)) for (const dir of a.directions) out.push({ anim, dir, n: a.frames });
  return out;
}

const fname = (anim: string, dir: string, i: number) => (anim === "point" ? `point_${String(i + 1).padStart(2, "0")}` : `${anim}_${dir}_${String(i + 1).padStart(2, "0")}`);

/** Arquivos da cor-base de cada camada para um look (nome do PNG, sem pasta). */
export function layerFiles(l: TamerLook, anim: string, dir: string, i: number): { layer: string; file: string; from: Ramp; to: Ramp }[] {
  const L = PARTS.layers;
  const f = fname(anim, dir, i);
  const outfitBase = BASE.outfit[l.outfit] ?? L.clothing.colorOptions[l.outfit][0];
  const byLayer: Record<string, { layer: string; file: string; from: Ramp; to: Ramp }> = {
    body: { layer: "body", file: `body_${l.model}_${BASE.skin}_${f}.png`, from: L.body.skinTones[BASE.skin], to: L.body.skinTones[l.skin] },
    hair: { layer: "hair", file: `hair_${l.hairCut}_${BASE.hair}_${f}.png`, from: L.hair.colors[BASE.hair], to: L.hair.colors[l.hairColor] },
    clothing: { layer: "clothing", file: `clothing_${l.outfit}_${outfitBase}_${l.model}_${f}.png`, from: L.clothing.colorRamps[outfitBase], to: L.clothing.colorRamps[l.outfitColor] },
  };
  return PARTS.drawOrder.map((k) => byLayer[k]);
}

/** URLs dos PNGs-base (só as cores-base; o Vite resolve). Chave = nome do arquivo. */
export function loadPartUrls(): Record<string, string> {
  const g = import.meta.glob<string>(
    [
      "@game-assets/11-characters/player/body/body_*_pale_*.png",
      "@game-assets/11-characters/player/hair/hair_*_castanho_*.png",
      "@game-assets/11-characters/player/clothing/clothing_casual_vermelho_*.png",
      "@game-assets/11-characters/player/clothing/clothing_aventureiro_marrom_*.png",
      "@game-assets/11-characters/player/clothing/clothing_tamer-classico_amarelo_*.png",
    ],
    { eager: true, query: "?url", import: "default" },
  );
  return Object.fromEntries(Object.entries(g).map(([p, url]) => [p.replace(/\\/g, "/").split("/").pop()!, url]));
}

/** URLs necessárias para compor um look (para pré-carregar). */
export function urlsForLook(l: TamerLook, urls: Record<string, string>): string[] {
  const out = new Set<string>();
  for (const { anim, dir, n } of frameList()) for (let i = 0; i < n; i++) for (const f of layerFiles(l, anim, dir, i)) if (urls[f.file]) out.add(urls[f.file]);
  return [...out];
}

// ---------- composição ----------

/**
 * Compõe o look numa folha (linhas = anim×direção, colunas = quadros) e devolve um CreatureVisual no mesmo contrato
 * dos Tamers do pacote (idle/walk em S/E/N, W = E espelhado), registrado no ImageStore com um URL sintético.
 */
export function composeTamer(l: TamerLook, urls: Record<string, string>, images: ImageStore, make: CanvasFactory): CreatureVisual {
  const { w, h } = PARTS.frame;
  const rows = frameList();
  const cols = Math.max(...rows.map((r) => r.n));
  const sheet = make(w * cols, h * rows.length);
  const g = sheet.getContext("2d")!;
  g.imageSmoothingEnabled = false;
  const id = `tamer:${lookKey(l)}`;
  const frames: Record<string, { frame: { x: number; y: number; w: number; h: number } }> = {};
  const animations: CreatureManifest["animations"] = {};
  const directions: CreatureManifest["directions"] = {};
  rows.forEach(({ anim, dir, n }, r) => {
    const a = PARTS.animations[anim];
    const dur = anim === "point" ? 0 : Math.round(1000 / (a.fps ?? 8));
    const list: AnimFrame[] = [];
    for (let i = 0; i < n; i++) {
      for (const part of layerFiles(l, anim, dir, i)) {
        const url = urls[part.file];
        const img = url ? images.get(url) : undefined;
        if (!img) continue;
        if (part.from === part.to) {
          g.drawImage(img as CanvasImageSource, i * w, r * h);
          continue;
        }
        // canvas novo por camada: reaproveitar um só faz o @napi-rs/canvas desenhar uma cópia antiga dele
        const layer = make(w, h);
        const lg = layer.getContext("2d")!;
        lg.drawImage(img as CanvasImageSource, 0, 0);
        const data = lg.getImageData(0, 0, w, h);
        recolorPixels(data.data, swapTable(part.from, part.to));
        lg.putImageData(data, 0, 0);
        g.drawImage(layer, i * w, r * h);
      }
      const key = `${anim}_${dir}_${i}`;
      frames[key] = { frame: { x: i * w, y: r * h, w, h } };
      list.push({ atlasKey: key, durationMs: dur });
    }
    const an = (animations[anim] ??= { loop: a.loop, space: "map", frames: [], dirFrames: {} });
    an.dirFrames![dir] = list;
    if (!an.frames.length) an.frames = list;
    directions[anim] = { drawn: a.directions, mirrored: a.directions.includes("E") ? { W: "E" } : {} };
  });
  images.put(id, sheet as unknown as ImageLike);
  const manifest: CreatureManifest = {
    id,
    name: l.name,
    dimensions: { frameW: w, frameH: h, tile: 32 },
    pivot: PARTS.pivot,
    anchors: { head: PARTS.anchors.head, shadow: PARTS.anchors.shadow },
    directions,
    animations,
    walkSpeedPxPerSec: 110,
  };
  return { manifest, atlas: { frames }, sheetUrl: id };
}
