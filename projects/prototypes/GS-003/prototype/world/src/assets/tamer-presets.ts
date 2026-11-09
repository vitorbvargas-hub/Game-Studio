// Tamers v3: 12 presets oficiais-base DS (GAME-ASSETS/11-characters/TAMER-0003..0014, TAMERS_V3_PRESETS.md), cada um
// com quadros de walk nas 4 direções desenhadas (S/N/W/E) e 8 variantes de cor de cabelo em sprites/recolor_<cor>/.
// Os arquivos são lidos do disco pelo glob do Vite (sem cópia): o game-art pode trocar acessórios e o jogo pega na
// próxima carga. Também tem a validação do nome do Tamer e a migração do Tamer modular v2 (save v5 → v6).

import type { AnimFrame, AtlasJson, CreatureManifest, CreatureVisual } from "./creatures";

export type Dir4 = "S" | "N" | "W" | "E";
export const DIRS4: Dir4[] = ["S", "N", "W", "E"];

/** Visual do Tamer (save v6): preset + cor do cabelo + nome. */
export interface TamerLook {
  name: string;
  /** Id do preset (TAMER-NNNN). */
  preset: string;
  /** Id da cor do cabelo do preset (preto, castanho, loiro, ruivo, azul, verde, roxo, prateado). */
  hair: string;
}

export interface HairOption {
  id: string;
  hex: string;
  /** URL de cada quadro por direção (índice = número do arquivo _00, _01, _02). */
  frames: Partial<Record<Dir4, string[]>>;
}

export interface TamerPreset {
  id: string;
  /** Nome curto em pt-BR para a UI. */
  label: string;
  /** Acessório do kitbash em pt-BR. */
  accessory: string;
  /** Cor canônica do cabelo (hairRecolors.active). */
  defaultHair: string;
  hairs: HairOption[];
  frame: { w: number; h: number };
  pivot: { x: number; y: number };
  walkSpeedPxPerSec: number;
  /** Sequência do walk (índices de arquivo por direção, ex. [0, 1, 0, 2]) e duração de cada quadro. */
  walk: Record<Dir4, { i: number; ms: number }[]>;
  /** Quadro parado por direção (índice de arquivo). */
  idle: Record<Dir4, { i: number; ms: number }>;
}

/** Rótulos pt-BR (o character.json vem sem acento). */
const LABELS: Record<string, string> = {
  "TAMER-0003": "Coragem",
  "TAMER-0004": "Amizade",
  "TAMER-0005": "Amor",
  "TAMER-0006": "Determinação",
  "TAMER-0007": "Esperança",
  "TAMER-0008": "Vínculo",
  "TAMER-0009": "Raposa",
  "TAMER-0010": "Vento",
  "TAMER-0011": "Chama",
  "TAMER-0012": "Vanguarda",
  "TAMER-0013": "Xeno",
  "TAMER-0014": "Fúria",
};
const ACCESSORY_PT: Record<string, string> = { goggles: "Goggles", collar: "Gola alta", scarf: "Lenço", cap: "Boné", visor: "Viseira", glasses: "Óculos" };
export const HAIR_PT: Record<string, string> = {
  preto: "Preto",
  castanho: "Castanho",
  loiro: "Loiro",
  ruivo: "Ruivo",
  azul: "Azul",
  verde: "Verde",
  roxo: "Roxo",
  prateado: "Prateado",
};

interface RawFrameRef {
  atlasKey?: string;
  durationMs?: number;
}
interface RawCharacter {
  id: string;
  name: string;
  dimensions: { frameW: number; frameH: number };
  pivot: { x: number; y: number };
  walkSpeedPxPerSec?: number;
  animations?: Record<string, { dirFrames?: Record<string, RawFrameRef[]> }>;
  hairRecolors?: { active?: string; options?: { id: string; hex: string; default?: boolean; frames?: Record<string, string[]> }[] };
  kitbash?: { accessory?: string };
}

const dirOf = (p: string) => p.replace(/\\/g, "/").split("/").slice(0, -1).join("/");
/** Número do arquivo (`..._S_02.png` → 2). */
const fileIndex = (key: string | undefined) => Number(/_(\d+)\.png$/.exec(key ?? "")?.[1] ?? 0);

/**
 * Monta os presets a partir dos mapas do glob (chave = caminho). Só entra quem tem `hairRecolors` (TAMER-0001/0002
 * são os Tamers antigos de teste). Uma cor sem PNG no disco fica de fora; um preset sem nenhuma cor também.
 */
export function buildPresets(manifests: Record<string, unknown>, pngs: Record<string, string>): TamerPreset[] {
  const out: TamerPreset[] = [];
  for (const [path, raw] of Object.entries(manifests)) {
    const c = raw as RawCharacter;
    if (!c?.hairRecolors?.options?.length) continue;
    const root = dirOf(path);
    const url = (rel: string) => pngs[`${root}/${rel.replace(/^\.\//, "")}`];
    const hairs: HairOption[] = [];
    for (const o of c.hairRecolors.options) {
      const frames: HairOption["frames"] = {};
      for (const d of DIRS4) {
        const src = FILE_DIR[d].find((k) => o.frames?.[k]?.length);
        const list = (src ? o.frames![src] : []).map(url);
        if (list.length && list.every(Boolean)) frames[d] = list as string[];
      }
      if (DIRS4.every((d) => frames[d]?.length)) hairs.push({ id: o.id, hex: o.hex, frames });
    }
    if (!hairs.length) continue;
    const seq = (anim: string, d: Dir4, fallback: { i: number; ms: number }[]) => {
      const df = c.animations?.[anim]?.dirFrames;
      const f = df?.[FILE_DIR[d].find((k) => df?.[k]?.length) ?? d];
      return f?.length ? f.map((x) => ({ i: fileIndex(x.atlasKey), ms: x.durationMs ?? 150 })) : fallback;
    };
    const walk = Object.fromEntries(DIRS4.map((d) => [d, seq("walk", d, [0, 1, 0, 2].map((i) => ({ i, ms: 150 })))])) as TamerPreset["walk"];
    const idle = Object.fromEntries(DIRS4.map((d) => [d, seq("idle", d, [{ i: 1, ms: 600 }])[0]])) as TamerPreset["idle"];
    const active = c.hairRecolors.active ?? c.hairRecolors.options.find((o) => o.default)?.id;
    out.push({
      id: c.id,
      label: LABELS[c.id] ?? c.name.replace(/\s*\(.*\)$/, ""),
      accessory: ACCESSORY_PT[c.kitbash?.accessory ?? ""] ?? c.kitbash?.accessory ?? "",
      defaultHair: hairs.some((h) => h.id === active) ? active! : hairs[0].id,
      hairs,
      frame: { w: c.dimensions.frameW, h: c.dimensions.frameH },
      pivot: c.pivot,
      walkSpeedPxPerSec: c.walkSpeedPxPerSec ?? 140,
      walk,
      idle,
    });
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

let cache: TamerPreset[] | undefined;

/** Presets do disco (glob do Vite: em dev, os arquivos do game-art são servidos como estão no disco). */
export function loadPresets(): TamerPreset[] {
  if (cache) return cache;
  const manifests = import.meta.glob("@game-assets/11-characters/TAMER-*/character.json", { eager: true, import: "default" });
  const pngs = import.meta.glob<string>("@game-assets/11-characters/TAMER-*/sprites/recolor_*/*.png", { eager: true, query: "?url", import: "default" });
  return (cache = buildPresets(manifests, pngs));
}

// ---------- nome ----------

/** Tamanho máximo do nome do Tamer (o mesmo do `maxlength` do criador). */
export const NAME_MAX = 14;
export const DEFAULT_NAME = "Kaio";
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
  return cleaned || DEFAULT_NAME;
}

// ---------- look ----------

/** Preset 1 (o primeiro da lista, TAMER-0003) na cor canônica. */
export function defaultLook(presets: TamerPreset[] = loadPresets(), name = DEFAULT_NAME): TamerLook {
  const p = presets[0];
  return { name, preset: p?.id ?? "TAMER-0003", hair: p?.defaultHair ?? "ruivo" };
}

/**
 * Look válido. Um look modular v2 (sem `preset`, com model/hairCut/...) vira o preset mais parecido; preset
 * desconhecido → preset 1; cor de cabelo que o preset não tem → a canônica dele. Nome saneado, 1–14 caracteres.
 */
export function normalizeLook(l: unknown, presets: TamerPreset[] = loadPresets()): TamerLook {
  const o = (l && typeof l === "object" ? l : {}) as Record<string, unknown>;
  const name = safeTamerName(o.name);
  if (typeof o.preset !== "string" && isLegacyLook(o)) return migrateLegacyLook(o, presets);
  const p = presets.find((x) => x.id === o.preset) ?? presets[0];
  if (!p) return { name, preset: String(o.preset ?? "TAMER-0003"), hair: String(o.hair ?? "ruivo") };
  return { name, preset: p.id, hair: p.hairs.some((h) => h.id === o.hair) ? (o.hair as string) : p.defaultHair };
}

/** Gerador determinístico (mulberry32). */
export function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Preset e cor aleatórios (determinístico pela semente). */
export function randomLook(seed: number, name: string, presets: TamerPreset[] = loadPresets()): TamerLook {
  const r = rng(seed);
  const p = presets[Math.floor(r() * presets.length)];
  return { name, preset: p.id, hair: p.hairs[Math.floor(r() * p.hairs.length)].id };
}

/** Visual de um Tamer bot: preset v3 aleatório pela semente do mundo + id do jogador (estável entre sessões). */
export function botLook(worldSeed: number, playerId: string, name: string, presets: TamerPreset[] = loadPresets()): TamerLook {
  const h = [...playerId].reduce((a, c) => Math.imul(a ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
  return randomLook((Math.imul(worldSeed, 31) + h) >>> 0, name, presets);
}

export function lookKey(l: TamerLook): string {
  return `${l.preset}|${l.hair}`;
}

// ---------- migração do Tamer modular v2 ----------

/** Look v2 (character_parts.json): só os campos usados para escolher o preset. */
export interface LegacyLook {
  name?: string;
  model?: string;
  skin?: string;
  hairCut?: string;
  hairColor?: string;
  outfit?: string;
  outfitColor?: string;
}

export function isLegacyLook(o: Record<string, unknown>): boolean {
  return ["model", "hairCut", "hairColor", "outfit"].some((k) => typeof o[k] === "string");
}

/** Cor do cabelo v2 → v3 (rosa e branco não existem no v3: ruivo e prateado são as mais próximas). */
const HAIR_V2_TO_V3: Record<string, string> = { preto: "preto", castanho: "castanho", loiro: "loiro", ruivo: "ruivo", azul: "azul", verde: "verde", rosa: "ruivo", branco: "prateado", roxo: "roxo" };
/** Leitura visual [H] dos presets: modelo 2 ↔ bases femininas; cortes v2 ↔ silhueta do preset. */
const FEMININE = new Set(["TAMER-0005", "TAMER-0009"]);
const CUT_HINT: Record<string, string[]> = {
  "espetado-tai": ["TAMER-0003", "TAMER-0006", "TAMER-0008", "TAMER-0011", "TAMER-0014"],
  moicano: ["TAMER-0011", "TAMER-0014"],
  curto: ["TAMER-0004", "TAMER-0007", "TAMER-0010", "TAMER-0012"],
  "franja-longa": ["TAMER-0004", "TAMER-0013"],
  "longo-liso": ["TAMER-0005", "TAMER-0009"],
  "rabo-de-cavalo": ["TAMER-0009"],
  "marias-chiquinhas": ["TAMER-0005"],
};
const OUTFIT_HINT: Record<string, string[]> = { "tamer-classico": ["TAMER-0003", "TAMER-0006", "TAMER-0008", "TAMER-0011", "TAMER-0014"], aventureiro: ["TAMER-0007", "TAMER-0010"] };

/**
 * Tamer modular v2 → preset mais parecido: pontos por modelo (3), corte (2), cor canônica do cabelo igual (2) e
 * roupa (1); empate → o menor id. A cor do cabelo escolhida no v2 é mantida (mapeada para a paleta v3). Sem dado
 * nenhum que pese → preset 1.
 */
export function migrateLegacyLook(l: LegacyLook | Record<string, unknown>, presets: TamerPreset[] = loadPresets()): TamerLook {
  const o = l as LegacyLook;
  const name = safeTamerName(o.name);
  const hair = HAIR_V2_TO_V3[o.hairColor ?? ""];
  let best = presets[0];
  let bestScore = 0;
  for (const p of presets) {
    let s = 0;
    if (o.model === "female" && FEMININE.has(p.id)) s += 3;
    if (o.model === "male" && !FEMININE.has(p.id)) s += 3;
    if (CUT_HINT[o.hairCut ?? ""]?.includes(p.id)) s += 2;
    if (hair && p.defaultHair === hair) s += 2;
    if (OUTFIT_HINT[o.outfit ?? ""]?.includes(p.id)) s += 1;
    if (s > bestScore) [best, bestScore] = [p, s];
  }
  if (!best) return { name, preset: "TAMER-0003", hair: hair ?? "ruivo" };
  return { name, preset: best.id, hair: hair && best.hairs.some((h) => h.id === hair) ? hair : best.defaultHair };
}

// ---------- visual ----------

/**
 * Os rips de NPC do DW DS só têm as 4 diagonais. Desde o ecc2744 o game-art nomeia os arquivos pelas diagonais
 * (`_SW_`/`_SE_` = frente, `_NW_`/`_NE_` = costas; 11-characters/README.md) e o jogo anda em 4 direções usando a
 * diagonal mais próxima (baixo → SW, direita → SE, cima → NE, esquerda → NW, o mapa recomendado lá) [H]. Os presets
 * antigos (arquivos `_S_`/`_N_`/`_W_`/`_E_`, que já eram essas mesmas diagonais) caem no mapa de antes.
 */
export const FILE_DIR: Record<Dir4, string[]> = { S: ["SW", "S"], E: ["SE", "N"], N: ["NE", "E"], W: ["NW", "W"] };

/**
 * Visual do Tamer no contrato dos sprites do mundo (idle/walk em S/N/W/E, sem espelho), uma PNG por quadro da cor
 * de cabelo escolhida, com as diagonais do rip mapeadas por FILE_DIR. A chave do atlas é `<dir do mundo>_<nn>`.
 */
export function presetVisual(look: TamerLook, presets: TamerPreset[] = loadPresets()): CreatureVisual | undefined {
  const p = presets.find((x) => x.id === look.preset);
  if (!p) return undefined;
  const hair = p.hairs.find((h) => h.id === look.hair) ?? p.hairs.find((h) => h.id === p.defaultHair)!;
  const key = (d: Dir4, i: number) => `${d}_${String(i).padStart(2, "0")}`;
  const frameUrls: Record<string, string> = {};
  const atlas: AtlasJson = { frames: {} };
  for (const d of DIRS4)
    hair.frames[d]!.forEach((url, i) => {
      frameUrls[key(d, i)] = url;
      atlas.frames[key(d, i)] = { frame: { x: 0, y: 0, w: p.frame.w, h: p.frame.h } };
    });
  const pick = (d: Dir4, i: number) => key(d, Math.min(i, hair.frames[d]!.length - 1));
  const walk: Record<string, AnimFrame[]> = {};
  const idle: Record<string, AnimFrame[]> = {};
  for (const d of DIRS4) {
    walk[d] = p.walk[d].map((f) => ({ atlasKey: pick(d, f.i), durationMs: f.ms }));
    idle[d] = [{ atlasKey: pick(d, p.idle[d].i), durationMs: p.idle[d].ms }];
  }
  const manifest: CreatureManifest = {
    id: `tamer:${lookKey(look)}`,
    name: look.name,
    dimensions: { frameW: p.frame.w, frameH: p.frame.h, tile: 32 },
    pivot: p.pivot,
    directions: { walk: { drawn: [...DIRS4], mirrored: {} }, idle: { drawn: [...DIRS4], mirrored: {} } },
    animations: {
      walk: { loop: true, space: "map", frames: walk.S, dirFrames: walk },
      idle: { loop: true, space: "map", frames: idle.S, dirFrames: idle },
    },
    walkSpeedPxPerSec: p.walkSpeedPxPerSec,
  };
  return { manifest, atlas, sheetUrl: frameUrls[key("S", 0)], frameUrls };
}

/**
 * Só as cores que mudam alguma coisa: uma cor cujo quadro de frente é idêntico ao de outra já listada (a canônica
 * primeiro) sai da lista. Em 2026-11-09, 8 dos 12 presets vinham com as 8 variantes byte a byte iguais [E] (recolor
 * do game-art não pegou o cabelo); o criador não mostra botão que não faz nada. `sig` = assinatura dos pixels.
 */
export function distinctHairs(p: TamerPreset, sig: (url: string) => string | undefined): TamerPreset {
  const order = [...p.hairs].sort((a, b) => Number(b.id === p.defaultHair) - Number(a.id === p.defaultHair));
  const seen = new Set<string>();
  const keep = new Set<string>();
  for (const h of order) {
    const k = sig(h.frames.S![0]);
    if (k === undefined) {
      keep.add(h.id); // sem imagem para comparar: mantém
      continue;
    }
    if (seen.has(k)) continue;
    seen.add(k);
    keep.add(h.id);
  }
  return { ...p, hairs: p.hairs.filter((h) => keep.has(h.id)) };
}

/** Todas as URLs de um look (para pré-carregar). */
export function urlsForLook(look: TamerLook, presets: TamerPreset[] = loadPresets()): string[] {
  const v = presetVisual(look, presets);
  return v?.frameUrls ? [...new Set(Object.values(v.frameUrls))] : [];
}
