// Catálogo visual das criaturas: lê creature.json + atlas (formato JSON Hash) de GAME-ASSETS/01-creatures.
// Só a apresentação usa isto; a sim nunca importa este módulo.

import type { LogicState } from "../sim/types";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface AnimFrame {
  durationMs: number;
  atlasKey?: string;
}

export interface CreatureAnimation {
  loop: boolean;
  fps?: number;
  frames: AnimFrame[];
  /** v2: quadros por direção desenhada (S, N, W, E…). `frames` continua sendo o fallback. */
  dirFrames?: Record<string, AnimFrame[]>;
  /** v2: "map" (escala do mapa) ou "battle" (pose de batalha em escala nativa, fora do mapa). */
  space?: "map" | "battle";
  events?: { frame: number; name: string }[];
}

export interface CreatureManifest {
  id: string;
  name: string;
  evolutionStage?: string;
  dimensions: { frameW: number; frameH: number; tile?: number };
  pivot: { x: number; y: number };
  hitbox?: Rect;
  anchors?: {
    head?: { x: number; y: number };
    hit?: { x: number; y: number };
    shadow?: { cx: number; cy: number; rx: number; ry: number };
  };
  directions?: Record<string, { drawn: string[]; mirrored?: Record<string, string> }>;
  animations: Record<string, CreatureAnimation>;
  combatStates?: Partial<Record<LogicState, string>>;
  /** v2: fator inteiro do sprite no mapa (1 = nativo do DS, já relativo entre espécies). */
  mapScale?: number;
  /** v2: altura-alvo da pose de pé no mapa, em px (hook para a tabela de tamanhos). */
  targetHeightPx?: number;
  nativeMapHeightPx?: number;
  /** v2: velocidade de referência do ciclo de walk (px/s); a cadência acompanha a velocidade real. */
  walkSpeedPxPerSec?: number;
  schemaVersion?: number;
  version?: string;
}

export interface AtlasJson {
  frames: Record<string, { frame: Rect; pivotPx?: { x: number; y: number } }>;
}

export interface CreatureVisual {
  manifest: CreatureManifest;
  atlas: AtlasJson;
  /** URL (navegador) ou caminho (script de capturas) da folha PNG. */
  sheetUrl: string;
  /** Sem folha: uma PNG por quadro (sprites/<atlasKey>), cada uma ocupando o quadro inteiro. */
  frameUrls?: Record<string, string>;
}

/** URL da imagem que contém o quadro `key` (folha ou PNG avulsa). */
export function imageUrlOf(cv: CreatureVisual, key: string): string {
  return cv.frameUrls?.[key] ?? cv.sheetUrl;
}

/** Todas as URLs de imagem de um visual (para pré-carregar). */
export function imageUrlsOf(cv: CreatureVisual): string[] {
  return cv.frameUrls ? Object.values(cv.frameUrls) : [cv.sheetUrl];
}

/** Monta o catálogo a partir dos mapas devolvidos por import.meta.glob (chave = caminho do arquivo). */
export function buildCreatureCatalog(
  manifests: Record<string, unknown>,
  atlases: Record<string, unknown>,
  sheets: Record<string, string>,
  frames: Record<string, string> = {},
): Record<string, CreatureVisual> {
  const out: Record<string, CreatureVisual> = {};
  const dirOf = (p: string) => p.replace(/\\/g, "/").split("/").slice(0, -1).join("/");
  for (const [path, raw] of Object.entries(manifests)) {
    const manifest = raw as CreatureManifest;
    const dir = dirOf(path);
    const atlasPath = Object.keys(atlases).find((p) => dirOf(dirOf(p)) === dir);
    const sheetPath = Object.keys(sheets).find((p) => dirOf(dirOf(p)) === dir);
    if (atlasPath && sheetPath) {
      out[manifest.id] = { manifest, atlas: atlases[atlasPath] as AtlasJson, sheetUrl: sheets[sheetPath] };
      continue;
    }
    // Sem folha: aceita uma PNG por quadro em sprites/ (nome = atlasKey), se cobrir todos os quadros usados.
    const own = Object.entries(frames).filter(([p]) => dirOf(dirOf(p)) === dir);
    if (!own.length) continue; // criatura sem arte ainda (ex. CREATURE-0001 piloto)
    const byName = new Map(own.map(([p, url]) => [p.replace(/\\/g, "/").split("/").pop()!, url]));
    const keys = new Set(
      Object.values(manifest.animations ?? {}).flatMap((a) => [...a.frames, ...Object.values(a.dirFrames ?? {}).flat()].map((f) => f.atlasKey!)),
    );
    if (![...keys].every((k) => byName.has(k))) continue;
    const { frameW: w, frameH: h } = manifest.dimensions;
    const frameUrls = Object.fromEntries([...keys].map((k) => [k, byName.get(k)!]));
    const atlas: AtlasJson = { frames: Object.fromEntries([...keys].map((k) => [k, { frame: { x: 0, y: 0, w, h } }])) };
    out[manifest.id] = { manifest, atlas, sheetUrl: frameUrls[[...keys][0]], frameUrls };
  }
  return out;
}

/** Catálogo real, resolvido pelo Vite (navegador, vitest e vite-node). Só a versão corrente (versions/ fica de fora). */
export function loadCreatureCatalog(): Record<string, CreatureVisual> {
  const manifests = import.meta.glob("@game-assets/01-creatures/CREATURE-*/creature.json", { eager: true, import: "default" });
  const atlases = import.meta.glob("@game-assets/01-creatures/CREATURE-*/spritesheets/*.atlas.json", { eager: true, import: "default" });
  const sheets = import.meta.glob<string>("@game-assets/01-creatures/CREATURE-*/spritesheets/*.png", {
    eager: true,
    query: "?url",
    import: "default",
  });
  // Criatura ainda em produção (game-art) pode vir só com PNGs por quadro em sprites/: entra assim mesmo.
  const frames = import.meta.glob<string>("@game-assets/01-creatures/CREATURE-*/sprites/*.png", { eager: true, query: "?url", import: "default" });
  return buildCreatureCatalog(manifests, atlases, sheets, frames);
}

/**
 * Personagens humanos (Tamer) em GAME-ASSETS/11-characters/TAMER-NNNN/. Mesmo contrato do creature.json
 * (character.json ou creature.json + spritesheets/*.atlas.json + PNG). Pasta ausente → catálogo vazio → placeholder.
 */
export function loadCharacterCatalog(): Record<string, CreatureVisual> {
  const manifests = {
    ...import.meta.glob("@game-assets/11-characters/*/creature.json", { eager: true, import: "default" }),
    ...import.meta.glob("@game-assets/11-characters/*/character.json", { eager: true, import: "default" }),
  };
  const atlases = import.meta.glob("@game-assets/11-characters/*/spritesheets/*.atlas.json", { eager: true, import: "default" });
  const sheets = import.meta.glob<string>("@game-assets/11-characters/*/spritesheets/*.png", { eager: true, query: "?url", import: "default" });
  const frames = import.meta.glob<string>("@game-assets/11-characters/*/sprites/*.png", { eager: true, query: "?url", import: "default" });
  return buildCreatureCatalog(manifests, atlases, sheets, frames);
}

/** Tamers por papel: `role: "player"` → jogador local; `"npc"` (ou o segundo) → outro jogador. */
export function pickTamers(chars: Record<string, CreatureVisual>): { local?: CreatureVisual; remote?: CreatureVisual } {
  const list = Object.values(chars).sort((a, b) => a.manifest.id.localeCompare(b.manifest.id));
  const role = (c: CreatureVisual) => (c.manifest as CreatureManifest & { role?: string }).role;
  const local = list.find((c) => role(c) === "player") ?? list[0];
  const remote = list.find((c) => c !== local && role(c) === "npc") ?? list.find((c) => c !== local) ?? local;
  return { local, remote };
}

/** Pivô do quadro: o do atlas (v2, por quadro) ou o do manifest. */
export function framePivot(cv: CreatureVisual, key: string): { x: number; y: number } {
  return cv.atlas.frames[key]?.pivotPx ?? cv.manifest.pivot;
}

// ---------- tabela de tamanhos (GS-003/research/DIGIMON_SIZE_TABLE.json, do game-research) ----------

export interface SizeEntry {
  name: string;
  heightPx: number;
}

/**
 * Lê a tabela de forma tolerante (o formato ainda não foi fixado): aceita array ou objeto com array em
 * `entries`/`digimon`/`table`, e o primeiro campo numérico de altura em px que existir. Nomes em minúsculas.
 */
export function parseSizeTable(raw: unknown): Record<string, SizeEntry> {
  const out: Record<string, SizeEntry> = {};
  const obj = raw as Record<string, unknown> | unknown[] | undefined;
  const list: unknown[] = Array.isArray(obj)
    ? obj
    : obj
      ? ((obj.entries ?? obj.digimon ?? obj.table ?? obj.species ?? Object.values(obj).find(Array.isArray)) as unknown[]) ?? []
      : [];
  const H_FIELDS = ["mapTargetHeightPx", "targetHeightPx", "mapHeightPx", "heightPx", "dsMapHeightPx", "spriteHeightPx"];
  for (const e of list) {
    if (!e || typeof e !== "object") continue;
    const r = e as Record<string, unknown>;
    const name = String(r.name ?? r.digimon ?? r.id ?? "").toLowerCase();
    const f = H_FIELDS.find((k) => typeof r[k] === "number");
    if (name && f) out[name] = { name, heightPx: r[f] as number };
  }
  return out;
}

export function loadSizeTable(): Record<string, SizeEntry> {
  const files = import.meta.glob("@gs003-research/DIGIMON_SIZE_TABLE.json", { eager: true, import: "default" });
  const raw = Object.values(files)[0];
  return raw ? parseSizeTable(raw) : {};
}

/**
 * Fator inteiro no mapa. Padrão: mapScale do manifest (1 = nativo do DS). Com a tabela (modo "table"), usa a
 * razão altura-alvo / altura nativa arredondada para inteiro >= 1, para não sair do pixel-perfect.
 */
export function mapScaleOf(m: CreatureManifest, table?: Record<string, SizeEntry>): number {
  const base = Math.max(1, Math.round(m.mapScale ?? 1));
  const e = table?.[m.name.toLowerCase()];
  const native = m.nativeMapHeightPx ?? m.targetHeightPx;
  if (!e || !native) return base;
  return Math.max(1, Math.round(e.heightPx / native));
}
