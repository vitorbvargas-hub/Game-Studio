// Lado servidor (só no `vite dev`): varre as raízes de assets, serve arquivos com proteção de caminho
// e grava status de homologação no creature.json. Node puro (fs/path), testável sem Vite.

import fs from "node:fs";
import path from "node:path";
import type { AssetStatus, LibraryItem, LibraryResponse, PmdSource } from "../src/types";
import { STATUSES } from "../src/types";

export interface RootDef {
  /** Chave curta usada nas URLs (`/fs/<key>/...`). */
  key: string;
  path: string;
  /** creature.json desta raiz pode ser alterado pelo endpoint de review. */
  editable: boolean;
  /** "assets" = procura creature.json; "pmd" = cada subpasta com AnimData.xml é uma criatura (versão = key). */
  kind: "assets" | "pmd";
}

const SKIP = new Set(["node_modules", ".git", "dist"]);
const MAX_DEPTH = 6;

/** Resolve `rel` dentro de `root`; undefined se escapar (.., absoluto, symlink para fora). */
export function safeResolve(root: string, rel: string): string | undefined {
  const rootAbs = path.resolve(root);
  const decoded = rel.split("/").map((p) => decodeURIComponent(p)).join("/");
  if (decoded.includes("\0")) return undefined;
  const abs = path.resolve(rootAbs, "." + path.posix.normalize("/" + decoded));
  if (abs !== rootAbs && !abs.startsWith(rootAbs + path.sep)) return undefined;
  try {
    const real = fs.realpathSync(abs);
    const realRoot = fs.realpathSync(rootAbs);
    if (real !== realRoot && !real.startsWith(realRoot + path.sep)) return undefined;
  } catch {
    // inexistente: quem chama trata 404
  }
  return abs;
}

/** Largura/altura do cabeçalho IHDR de um PNG (sem decodificar). */
export function pngSize(file: string): { w: number; h: number } | undefined {
  try {
    const fd = fs.openSync(file, "r");
    const buf = Buffer.alloc(24);
    fs.readSync(fd, buf, 0, 24, 0);
    fs.closeSync(fd);
    if (buf.readUInt32BE(0) !== 0x89504e47 || buf.toString("ascii", 12, 16) !== "IHDR") return undefined;
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  } catch {
    return undefined;
  }
}

function walk(dir: string, depth: number, visit: (d: string, entries: fs.Dirent[]) => boolean | void): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  // visit devolve true = não descer (pasta já é uma criatura).
  if (visit(dir, entries) === true || depth >= MAX_DEPTH) return;
  for (const e of entries) if (e.isDirectory() && !SKIP.has(e.name) && !e.name.startsWith(".")) walk(path.join(dir, e.name), depth + 1, visit);
}

const toPosix = (p: string) => p.split(path.sep).join("/");

function pmdSource(root: RootDef, absDir: string, versionId: string, fileBase: string): PmdSource | undefined {
  const xmlPath = path.join(absDir, "AnimData.xml");
  if (!fs.existsSync(xmlPath)) return undefined;
  const sheetSizes: PmdSource["sheetSizes"] = {};
  for (const f of fs.readdirSync(absDir)) if (f.toLowerCase().endsWith(".png")) {
    const s = pngSize(path.join(absDir, f));
    if (s) sheetSizes[f] = s;
  }
  const rel = toPosix(path.relative(root.path, absDir));
  return { versionId, baseUrl: `${fileBase}/${root.key}/${rel ? rel + "/" : ""}`, animDataXml: fs.readFileSync(xmlPath, "utf8"), sheetSizes };
}

/** Tamanhos de todas as PNG sob a pasta de uma criatura, por caminho relativo à raiz. */
function sheetSizesUnder(rootPath: string, absDir: string, out: Record<string, { w: number; h: number }>): void {
  walk(absDir, 0, (d, entries) => {
    for (const e of entries) if (e.isFile() && e.name.toLowerCase().endsWith(".png")) {
      const s = pngSize(path.join(d, e.name));
      if (s) out[toPosix(path.relative(rootPath, path.join(d, e.name)))] = s;
    }
  });
}

export function scanLibrary(roots: RootDef[], opts: { fileBase?: string; schemaPath?: string; provisionalSchemaPath?: string } = {}): LibraryResponse & { sheetSizes: Record<string, Record<string, { w: number; h: number }>> } {
  const fileBase = opts.fileBase ?? "/fs";
  const items: LibraryItem[] = [];
  const sheetSizes: Record<string, Record<string, { w: number; h: number }>> = {};
  const pmdByName = new Map<string, LibraryItem>();

  for (const root of roots) {
    if (!fs.existsSync(root.path)) continue;
    sheetSizes[root.key] = {};
    if (root.kind === "pmd") {
      for (const e of fs.readdirSync(root.path, { withFileTypes: true })) {
        if (!e.isDirectory()) continue;
        const src = pmdSource(root, path.join(root.path, e.name), root.key, fileBase);
        if (!src) continue;
        // Mesmo nome em várias raízes PMD = versões da mesma criatura (ex. pmd e pmd-v2).
        let item = pmdByName.get(e.name);
        if (!item) {
          item = { root: "pmd", dir: e.name, kind: "pmd", editable: false, pmd: [] };
          pmdByName.set(e.name, item);
          items.push(item);
        }
        item.pmd!.push(src);
      }
      continue;
    }
    walk(root.path, 0, (d, entries) => {
      if (!entries.some((e) => e.isFile() && e.name === "creature.json")) return;
      const rel = toPosix(path.relative(root.path, d));
      const item: LibraryItem = { root: root.key, dir: rel, kind: "creature", editable: root.editable };
      try {
        item.manifest = JSON.parse(fs.readFileSync(path.join(d, "creature.json"), "utf8"));
      } catch (e) {
        item.parseError = (e as Error).message;
      }
      const m = item.manifest as { versions?: { id?: string; format?: string; path?: string }[]; spritesheets?: unknown } | undefined;
      // Schema oficial (07-manifests): license.json ao lado e atlas JSON na pasta `spritesheets`.
      const lic = path.join(d, "license.json");
      if (fs.existsSync(lic)) {
        try {
          item.licenseJson = JSON.parse(fs.readFileSync(lic, "utf8"));
        } catch {
          /* license.json quebrado: o parser acusa a falta */
        }
      }
      const sheetsDir = typeof m?.spritesheets === "string" ? safeResolve(d, m.spritesheets) : undefined;
      if (sheetsDir && fs.existsSync(sheetsDir) && fs.statSync(sheetsDir).isDirectory()) {
        for (const f of fs.readdirSync(sheetsDir)) if (f.toLowerCase().endsWith(".json")) {
          try {
            (item.atlases ??= {})[toPosix(path.relative(root.path, path.join(sheetsDir, f)))] = JSON.parse(fs.readFileSync(path.join(sheetsDir, f), "utf8"));
          } catch {
            /* ignora JSON inválido */
          }
        }
      }
      for (const v of Array.isArray(m?.versions) ? m!.versions : []) {
        if (v?.format !== "pmd" || typeof v.path !== "string" || typeof v.id !== "string") continue;
        const abs = safeResolve(d, v.path);
        const src = abs && pmdSource(root, abs, v.id, fileBase);
        if (src) (item.pmd ??= []).push(src);
      }
      sheetSizesUnder(root.path, d, sheetSizes[root.key]);
      items.push(item);
      return true;
    });
  }

  let schema: LibraryResponse["schema"] = null;
  for (const [p, provisional] of [[opts.schemaPath, false], [opts.provisionalSchemaPath, true]] as const) {
    if (p && fs.existsSync(p)) {
      try {
        schema = { path: p, provisional, json: JSON.parse(fs.readFileSync(p, "utf8")) };
        break;
      } catch {
        /* tenta o próximo */
      }
    }
  }
  return {
    roots: roots.map((r) => ({ key: r.key, path: r.path, editable: r.editable, exists: fs.existsSync(r.path) })),
    schema,
    items,
    sheetSizes,
  };
}

export interface ReviewRequest {
  root: string;
  dir: string;
  status: string;
  note?: string;
  by?: string;
}

/** Grava status + entrada de histórico no creature.json (escrita atômica). Lança Error com mensagem para o cliente. */
export function applyReview(roots: RootDef[], req: ReviewRequest, now = new Date()): { status: AssetStatus; review: unknown[] } {
  const root = roots.find((r) => r.key === req.root);
  if (!root || root.kind !== "assets") throw new Error("raiz desconhecida");
  if (!root.editable) throw new Error("raiz somente leitura");
  if (!(STATUSES as readonly string[]).includes(req.status)) throw new Error(`status inválido: ${req.status}`);
  const dirAbs = safeResolve(root.path, req.dir);
  if (!dirAbs) throw new Error("caminho fora da raiz");
  const file = path.join(dirAbs, "creature.json");
  if (!fs.existsSync(file)) throw new Error("creature.json não encontrado");
  const text = fs.readFileSync(file, "utf8");
  const json = JSON.parse(text) as Record<string, unknown>;
  const status = req.status as AssetStatus;
  // Schema oficial usa `approvalStatus`; o provisório, `status`.
  if ("approvalStatus" in json) json.approvalStatus = status;
  else json.status = status;
  const entry: Record<string, string> = { status, at: now.toISOString() };
  if (req.by?.trim()) entry.by = req.by.trim().slice(0, 80);
  if (req.note?.trim()) entry.note = req.note.trim().slice(0, 500);
  const review = Array.isArray(json.review) ? json.review : [];
  review.push(entry);
  json.review = review;
  const tmp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, JSON.stringify(json, null, 2) + (text.endsWith("\n") ? "\n" : ""));
  fs.renameSync(tmp, file);
  return { status, review };
}
