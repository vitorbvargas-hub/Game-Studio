// Modelo normalizado que o viewer desenha. Tanto creature.json quanto pastas PMD (AnimData.xml)
// viram este formato; o jogo (fase 5) pode reaproveitar o mesmo modelo.

export const DIRS8 = ["S", "SE", "E", "NE", "N", "NW", "W", "SW"] as const;
export type Dir = (typeof DIRS8)[number];

export const STATUSES = ["DISCOVERED", "UNDER_REVIEW", "APPROVED", "REJECTED", "NEEDS_CREATION", "INTEGRATED"] as const;
export type AssetStatus = (typeof STATUSES)[number];

export const LICENSE_TIERS = ["reference", "private-prototype", "official-fan-use", "licensed", "original", "rejected"] as const;
export type LicenseTier = (typeof LICENSE_TIERS)[number];

export interface Point {
  x: number;
  y: number;
}

/** Um quadro: recorte de uma imagem (URL) + duração. flipX = direção espelhada. */
export interface FrameRef {
  image: string;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  flipX: boolean;
  durationMs: number;
}

export interface AnimEvent {
  frame: number;
  name: string;
}

export interface AnimView {
  name: string;
  loop: boolean;
  frameWidth: number;
  frameHeight: number;
  /** Direções disponíveis (incluindo as espelhadas), na ordem de exibição. */
  directions: Dir[];
  frames: Partial<Record<Dir, FrameRef[]>>;
  /** Folha de sombra na mesma grade (PMD `*-Shadow.png`), se houver. */
  shadow?: Partial<Record<Dir, FrameRef[]>>;
  origin?: Point;
  events: AnimEvent[];
}

export interface VersionView {
  id: string;
  label: string;
  date?: string;
  notes?: string;
  format: "grid" | "pmd";
  anims: AnimView[];
}

export interface LicenseView {
  tier: string;
  spdx?: string;
  url?: string;
  author?: string;
  file?: string;
  notes?: string;
}

export interface ReviewEntry {
  status: AssetStatus;
  at: string;
  by?: string;
  note?: string;
}

export interface CreatureView {
  /** Chave única no viewer: `<root>:<dir relativo>`. */
  key: string;
  root: string;
  dir: string;
  id: string;
  name: string;
  description?: string;
  category?: string;
  rarity?: string;
  element?: string;
  stage?: string;
  evolutionLine?: string;
  status: AssetStatus | "UNKNOWN";
  score?: number;
  license: LicenseView;
  origin?: { type?: string; source?: string; author?: string };
  dimensions?: { width: number; height: number };
  hitbox?: { x: number; y: number; w: number; h: number };
  anchors?: Record<string, Point>;
  versions: VersionView[];
  currentVersion?: string;
  review: ReviewEntry[];
  /** Pode gravar status (só creature.json em raiz gravável). */
  editable: boolean;
  /** Problemas de validação (o item aparece mesmo assim, marcado). */
  errors: string[];
  warnings: string[];
}

/** Item cru devolvido por GET /api/library (ver server/library.ts). */
export interface LibraryItem {
  root: string;
  dir: string;
  kind: "creature" | "pmd";
  editable: boolean;
  /** creature.json já parseado (kind=creature) — ou erro de parse. */
  manifest?: unknown;
  parseError?: string;
  /** license.json ao lado do creature.json (schema oficial), se existir. */
  licenseJson?: unknown;
  /** Atlas JSON Hash (`*.json` da pasta `spritesheets`), por caminho relativo à raiz. */
  atlases?: Record<string, unknown>;
  /** PMD: versões (cada uma uma pasta com AnimData.xml). Para creature, versões format=pmd. */
  pmd?: PmdSource[];
}

export interface PmdSource {
  /** id da versão (ex. nome da raiz "pmd", "pmd-v2", ou o id em creature.json). */
  versionId: string;
  /** URL base (termina em "/") de onde as folhas são servidas. */
  baseUrl: string;
  animDataXml: string;
  /** Tamanho real das folhas em px, por nome de arquivo (lido do cabeçalho PNG pelo servidor). */
  sheetSizes: Record<string, { w: number; h: number }>;
}

export interface LibraryResponse {
  roots: { key: string; path: string; editable: boolean; exists: boolean }[];
  schema: { path: string; provisional: boolean; json: unknown } | null;
  items: LibraryItem[];
}
