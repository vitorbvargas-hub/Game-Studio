// Catálogo visual das criaturas: lê creature.json + atlas (formato JSON Hash) de GAME-ASSETS/01-creatures.
// Só a apresentação usa isto; a sim nunca importa este módulo.

import type { LogicState } from "../sim/types";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CreatureAnimation {
  loop: boolean;
  fps?: number;
  frames: { durationMs: number; atlasKey?: string }[];
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
}

export interface AtlasJson {
  frames: Record<string, { frame: Rect }>;
}

export interface CreatureVisual {
  manifest: CreatureManifest;
  atlas: AtlasJson;
  /** URL (navegador) ou caminho (script de capturas) da folha PNG. */
  sheetUrl: string;
}

/** Monta o catálogo a partir dos mapas devolvidos por import.meta.glob (chave = caminho do arquivo). */
export function buildCreatureCatalog(
  manifests: Record<string, unknown>,
  atlases: Record<string, unknown>,
  sheets: Record<string, string>,
): Record<string, CreatureVisual> {
  const out: Record<string, CreatureVisual> = {};
  const dirOf = (p: string) => p.replace(/\\/g, "/").split("/").slice(0, -1).join("/");
  for (const [path, raw] of Object.entries(manifests)) {
    const manifest = raw as CreatureManifest;
    const dir = dirOf(path);
    const atlasPath = Object.keys(atlases).find((p) => dirOf(dirOf(p)) === dir);
    const sheetPath = Object.keys(sheets).find((p) => dirOf(dirOf(p)) === dir);
    if (!atlasPath || !sheetPath) continue; // criatura sem folha ainda (ex. CREATURE-0001 piloto)
    out[manifest.id] = { manifest, atlas: atlases[atlasPath] as AtlasJson, sheetUrl: sheets[sheetPath] };
  }
  return out;
}

/** Catálogo real, resolvido pelo Vite (navegador, vitest e vite-node). */
export function loadCreatureCatalog(): Record<string, CreatureVisual> {
  const manifests = import.meta.glob("@game-assets/01-creatures/CREATURE-*/creature.json", { eager: true, import: "default" });
  const atlases = import.meta.glob("@game-assets/01-creatures/CREATURE-*/spritesheets/*.atlas.json", { eager: true, import: "default" });
  const sheets = import.meta.glob<string>("@game-assets/01-creatures/CREATURE-*/spritesheets/*.png", {
    eager: true,
    query: "?url",
    import: "default",
  });
  return buildCreatureCatalog(manifests, atlases, sheets);
}
