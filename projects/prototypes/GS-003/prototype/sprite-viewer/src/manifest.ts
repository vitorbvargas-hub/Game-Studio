// Parser/validador de creature.json (schema provisório em schema/creature.schema.provisional.json,
// compatível com o briefing 01 §5). Puro: sem DOM e sem fs. Tolerante: campos extras são ignorados,
// problemas viram `errors`/`warnings` no item em vez de derrubar a galeria.

import { pmdToVersion } from "./animdata";
import {
  DIRS8,
  LICENSE_TIERS,
  STATUSES,
  type AnimView,
  type AssetStatus,
  type CreatureView,
  type Dir,
  type FrameRef,
  type LibraryItem,
  type ReviewEntry,
} from "./types";

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown): string | undefined => (typeof v === "string" && v.trim() ? v : undefined);
const num = (v: unknown): number | undefined => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
const isDir = (v: unknown): v is Dir => typeof v === "string" && (DIRS8 as readonly string[]).includes(v);

export const DEFAULT_FPS = 8;

/** Normaliza status: aceita minúsculas/hífens (com aviso). undefined se inválido. */
export function normalizeStatus(v: unknown): AssetStatus | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim().toUpperCase().replace(/[\s-]+/g, "_");
  return (STATUSES as readonly string[]).includes(s) ? (s as AssetStatus) : undefined;
}

/** Junta caminho relativo à pasta da criatura, recusando sair dela (".." / absoluto). */
export function joinRel(dir: string, rel: string): string | undefined {
  if (rel.startsWith("/") || /^[a-z]+:/i.test(rel)) return undefined;
  const parts = [...dir.split("/"), ...rel.split("/")].filter((p) => p && p !== ".");
  const out: string[] = [];
  const base = dir.split("/").filter((p) => p && p !== ".").length;
  for (const p of parts) {
    if (p === "..") {
      if (out.length <= base) return undefined;
      out.pop();
    } else out.push(p);
  }
  return out.join("/");
}

export interface GridSheetInfo {
  /** Tamanho real das folhas, por caminho relativo à raiz (o servidor lê do PNG). */
  sheetSizes?: Record<string, { w: number; h: number }>;
}

/** Uma animação format=grid de creature.json → AnimView. */
export function parseGridAnim(
  name: string,
  raw: unknown,
  ctx: { root: string; dir: string; fileUrl: (root: string, rel: string) => string; sheetSizes?: Record<string, { w: number; h: number }> },
  errors: string[],
  warnings: string[],
): AnimView | undefined {
  const where = `animations.${name}`;
  if (!isObj(raw)) return void errors.push(`${where}: deve ser objeto`);
  const sheet = str(raw.sheet);
  const fw = num(raw.frameWidth);
  const fh = num(raw.frameHeight);
  if (!sheet) return void errors.push(`${where}.sheet ausente`);
  if (!fw || !fh || fw <= 0 || fh <= 0) return void errors.push(`${where}: frameWidth/frameHeight inválidos`);
  const rel = joinRel(ctx.dir, sheet);
  if (!rel) return void errors.push(`${where}.sheet "${sheet}" sai da pasta da criatura`);
  const size = ctx.sheetSizes?.[rel];
  if (ctx.sheetSizes && !size) warnings.push(`${where}: folha ${sheet} não encontrada`);

  const dirsRaw = Array.isArray(raw.directions) ? raw.directions : ["S"];
  const rows: Dir[] = [];
  for (const d of dirsRaw) {
    if (isDir(d)) rows.push(d);
    else errors.push(`${where}.directions: "${String(d)}" inválida (use ${DIRS8.join(", ")})`);
  }
  if (!rows.length) rows.push("S");

  let frames = num(raw.frames);
  if (frames === undefined && size) frames = Math.floor(size.w / fw);
  if (frames === undefined && Array.isArray(raw.durationsMs)) frames = raw.durationsMs.length;
  if (!frames || frames < 1) return void errors.push(`${where}: nº de quadros desconhecido (informe "frames")`);
  if (size) {
    if (frames * fw > size.w) errors.push(`${where}: ${frames} quadros de ${fw}px não cabem na folha de ${size.w}px`);
    if (rows.length * fh > size.h) errors.push(`${where}: ${rows.length} direções de ${fh}px não cabem na folha de ${size.h}px`);
  }

  let durations: number[];
  if (Array.isArray(raw.durationsMs)) {
    durations = raw.durationsMs.map((d) => num(d) ?? 0);
    if (durations.length !== frames || durations.some((d) => d <= 0)) {
      errors.push(`${where}.durationsMs: precisa de ${frames} valores > 0`);
      durations = Array(frames).fill(1000 / DEFAULT_FPS);
    }
  } else {
    const fps = num(raw.fps);
    if (fps === undefined) warnings.push(`${where}: sem fps/durationsMs, usando ${DEFAULT_FPS} fps`);
    else if (fps <= 0) errors.push(`${where}.fps deve ser > 0`);
    durations = Array(frames).fill(1000 / (fps && fps > 0 ? fps : DEFAULT_FPS));
  }

  const url = ctx.fileUrl(ctx.root, rel);
  const out: Partial<Record<Dir, FrameRef[]>> = {};
  rows.forEach((d, row) => {
    out[d] = durations.map((ms, col) => ({ image: url, sx: col * fw, sy: row * fh, sw: fw, sh: fh, flipX: false, durationMs: ms }));
  });
  const directions = [...rows];
  if (isObj(raw.mirror)) {
    for (const [to, from] of Object.entries(raw.mirror)) {
      if (!isDir(to) || !isDir(from) || !out[from]) {
        errors.push(`${where}.mirror: ${to}←${String(from)} inválido`);
        continue;
      }
      out[to] = out[from]!.map((f) => ({ ...f, flipX: !f.flipX }));
      if (!directions.includes(to)) directions.push(to);
    }
  }
  directions.sort((a, b) => DIRS8.indexOf(a) - DIRS8.indexOf(b));

  const events = Array.isArray(raw.events)
    ? raw.events.filter(isObj).flatMap((e) => {
        const frame = num(e.frame);
        const ename = str(e.name);
        if (frame === undefined || !ename || frame < 0 || frame >= frames!) {
          errors.push(`${where}.events: evento inválido ${JSON.stringify(e)}`);
          return [];
        }
        return [{ frame, name: ename }];
      })
    : [];
  const origin = isObj(raw.origin) && num(raw.origin.x) !== undefined && num(raw.origin.y) !== undefined
    ? { x: raw.origin.x as number, y: raw.origin.y as number }
    : undefined;
  return {
    name,
    loop: typeof raw.loop === "boolean" ? raw.loop : true,
    frameWidth: fw,
    frameHeight: fh,
    directions,
    frames: out,
    origin,
    events,
  };
}

export interface NormalizeCtx {
  fileUrl: (root: string, rel: string) => string;
  sheetSizes?: Record<string, { w: number; h: number }>;
}

/** Item da biblioteca (creature.json ou pasta PMD) → CreatureView. Nunca lança. */
export function normalizeItem(item: LibraryItem, ctx: NormalizeCtx): CreatureView {
  const errors: string[] = [];
  const warnings: string[] = [];
  const base: CreatureView = {
    key: `${item.root}:${item.dir}`,
    root: item.root,
    dir: item.dir,
    id: item.dir.split("/").pop() || item.dir,
    name: item.dir.split("/").pop() || item.dir,
    status: "UNKNOWN",
    license: { tier: "desconhecida" },
    versions: [],
    review: [],
    editable: false,
    errors,
    warnings,
  };

  if (item.kind === "pmd") {
    base.category = "pmd-reference";
    base.license = { tier: "desconhecida", notes: "Pasta PMD sem creature.json: só visualização (sem aprovar/rejeitar). Licença: ver README da pasta de origem." };
    for (const src of item.pmd ?? []) {
      try {
        const { version, warnings: w } = pmdToVersion(src);
        base.versions.push(version);
        warnings.push(...w.map((x) => `[${src.versionId}] ${x}`));
      } catch (e) {
        errors.push(`[${src.versionId}] ${(e as Error).message}`);
      }
    }
    if (!base.versions.length) errors.push("nenhuma versão PMD legível");
    return base;
  }

  if (item.parseError) {
    errors.push(`creature.json inválido: ${item.parseError}`);
    return base;
  }
  const m = item.manifest;
  if (!isObj(m)) {
    errors.push("creature.json: raiz deve ser objeto");
    return base;
  }
  base.editable = item.editable;
  base.id = str(m.id) ?? (errors.push("id ausente"), base.id);
  base.name = str(m.name) ?? (errors.push("name ausente"), base.id);
  base.description = str(m.description);
  base.category = str(m.category);
  base.rarity = str(m.rarity);
  base.element = str(m.element);
  base.stage = str(m.stage);
  base.evolutionLine = str(m.evolutionLine);
  base.score = num(m.score);
  if (base.score !== undefined && (base.score < 0 || base.score > 100)) errors.push("score fora de 0–100");

  const st = normalizeStatus(m.status);
  if (!st) errors.push(`status inválido: ${JSON.stringify(m.status)} (use ${STATUSES.join(", ")})`);
  else if (st !== m.status) warnings.push(`status "${String(m.status)}" normalizado para ${st}`);
  base.status = st ?? "UNKNOWN";

  if (isObj(m.license)) {
    const tier = str(m.license.tier);
    if (!tier || !(LICENSE_TIERS as readonly string[]).includes(tier))
      errors.push(`license.tier inválido: ${JSON.stringify(m.license.tier)} (use ${LICENSE_TIERS.join(", ")})`);
    base.license = {
      tier: tier ?? "desconhecida",
      spdx: str(m.license.spdx),
      url: str(m.license.url),
      author: str(m.license.author),
      file: str(m.license.file),
      notes: str(m.license.notes),
    };
  } else errors.push("license ausente");
  if (isObj(m.origin)) base.origin = { type: str(m.origin.type), source: str(m.origin.source), author: str(m.origin.author) };
  if (isObj(m.dimensions) && num(m.dimensions.width) && num(m.dimensions.height))
    base.dimensions = { width: m.dimensions.width as number, height: m.dimensions.height as number };
  if (isObj(m.hitbox) && ["x", "y", "w", "h"].every((k) => num((m.hitbox as Obj)[k]) !== undefined))
    base.hitbox = m.hitbox as CreatureView["hitbox"];
  if (isObj(m.anchors)) {
    base.anchors = {};
    for (const [k, v] of Object.entries(m.anchors))
      if (isObj(v) && num(v.x) !== undefined && num(v.y) !== undefined) base.anchors[k] = { x: v.x as number, y: v.y as number };
      else errors.push(`anchors.${k} inválido`);
  }
  if (Array.isArray(m.review))
    base.review = m.review.filter(isObj).flatMap((r): ReviewEntry[] => {
      const s = normalizeStatus(r.status);
      return s && str(r.at) ? [{ status: s, at: r.at as string, by: str(r.by), note: str(r.note) }] : [];
    });

  // Versões: `versions[]` ou atalho `animations` (versão única "current").
  const rawVersions: Obj[] = Array.isArray(m.versions)
    ? m.versions.filter(isObj)
    : isObj(m.animations)
      ? [{ id: "current", format: "grid", animations: m.animations }]
      : [];
  const pmdById = new Map((item.pmd ?? []).map((p) => [p.versionId, p]));
  for (const v of rawVersions) {
    const id = str(v.id);
    if (!id) {
      errors.push("versions[]: versão sem id");
      continue;
    }
    if (base.versions.some((x) => x.id === id)) {
      errors.push(`versions[]: id duplicado ${id}`);
      continue;
    }
    const format = v.format === "pmd" ? "pmd" : "grid";
    if (format === "pmd") {
      const src = pmdById.get(id);
      if (!src) {
        errors.push(`versão ${id}: AnimData.xml não encontrado em "${String(v.path)}"`);
        continue;
      }
      try {
        const { version, warnings: w } = pmdToVersion(src, id);
        base.versions.push({ ...version, date: str(v.date), notes: str(v.notes) });
        warnings.push(...w.map((x) => `[${id}] ${x}`));
      } catch (e) {
        errors.push(`versão ${id}: ${(e as Error).message}`);
      }
      continue;
    }
    const anims: AnimView[] = [];
    if (isObj(v.animations)) {
      for (const [name, raw] of Object.entries(v.animations)) {
        const a = parseGridAnim(name, raw, { root: item.root, dir: item.dir, fileUrl: ctx.fileUrl, sheetSizes: ctx.sheetSizes }, errors, warnings);
        if (a) anims.push(a);
      }
    } else errors.push(`versão ${id}: sem animations`);
    base.versions.push({ id, label: id, date: str(v.date), notes: str(v.notes), format: "grid", anims });
  }
  if (!base.versions.length) errors.push("nenhuma versão/animação declarada");
  base.currentVersion = str(m.currentVersion) ?? base.versions[base.versions.length - 1]?.id;
  if (base.currentVersion && !base.versions.some((v) => v.id === base.currentVersion))
    errors.push(`currentVersion "${base.currentVersion}" não existe em versions`);
  for (const p of ["idle", "walk"]) {
    const cur = base.versions.find((v) => v.id === base.currentVersion);
    if (cur && !cur.anims.some((a) => a.name.toLowerCase() === p)) warnings.push(`versão atual sem animação P0 "${p}"`);
  }
  return base;
}

export interface Filters {
  text?: string;
  category?: string;
  rarity?: string;
  status?: string;
  root?: string;
}

export function applyFilters(list: CreatureView[], f: Filters): CreatureView[] {
  const t = f.text?.trim().toLowerCase();
  return list.filter(
    (c) =>
      (!f.category || c.category === f.category) &&
      (!f.rarity || c.rarity === f.rarity) &&
      (!f.status || c.status === f.status) &&
      (!f.root || c.root === f.root) &&
      (!t || `${c.id} ${c.name} ${c.element ?? ""} ${c.stage ?? ""}`.toLowerCase().includes(t)),
  );
}
