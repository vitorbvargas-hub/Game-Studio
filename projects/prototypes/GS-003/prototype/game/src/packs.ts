// Descoberta automática de content packs: cada pasta em packs/<id>/ com pack.json é um pacote.
// Adicionar, trocar ou remover um pacote não exige mudar código.

import { buildContent, type RawContent } from "./sim/content";
import type { ContentBundle, PackManifest } from "./sim/types";

const PART_FILES = ["pack", "strings", "theme", "balance", "creatures", "skills", "enemies", "areas", "dungeons"] as const;

const jsonFiles = import.meta.glob("../packs/*/*.json", { eager: true, import: "default" }) as Record<string, unknown>;
const spriteFiles = import.meta.glob("../packs/*/sprites/**/*.png", { eager: true, query: "?url", import: "default" }) as Record<string, string>;

function collect(): Record<string, RawContent> {
  const byPack: Record<string, Record<string, unknown>> = {};
  for (const [path, data] of Object.entries(jsonFiles)) {
    const m = path.match(/packs\/([^/]+)\/([^/]+)\.json$/);
    if (!m || !(PART_FILES as readonly string[]).includes(m[2])) continue;
    (byPack[m[1]] ??= {})[m[2]] = data;
  }
  const out: Record<string, RawContent> = {};
  for (const [folder, parts] of Object.entries(byPack)) {
    if (!parts.pack) continue;
    const assets: Record<string, string> = {};
    for (const [path, url] of Object.entries(spriteFiles)) {
      const m = path.match(/packs\/([^/]+)\/(sprites\/.+)$/);
      if (m && m[1] === folder) assets[m[2]] = url;
    }
    const raw = { ...parts, dungeons: parts.dungeons ?? [], assets } as unknown as RawContent;
    out[raw.pack.id] = raw;
  }
  return out;
}

export const RAW_PACKS: Record<string, RawContent> = collect();

export function listPacks(): PackManifest[] {
  return Object.values(RAW_PACKS)
    .map((r) => r.pack)
    .sort((a, b) => a.id.localeCompare(b.id));
}

/** Pacote marcado com "default": true; senão o primeiro em ordem alfabética. */
export function defaultPackId(): string {
  const packs = listPacks();
  const d = packs.filter((p) => p.default);
  if (d.length > 1) throw new Error(`Mais de um pacote com default: ${d.map((p) => p.id).join(", ")}`);
  if (!packs.length) throw new Error("Nenhum content pack em packs/");
  return (d[0] ?? packs[0]).id;
}

export function loadPack(id: string): ContentBundle {
  const raw = RAW_PACKS[id];
  if (!raw) throw new Error(`Content pack desconhecido: ${id}`);
  return buildContent(raw);
}
