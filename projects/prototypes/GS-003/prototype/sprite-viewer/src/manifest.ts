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
  if (isOfficialManifest(m)) return parseOfficial(item, m, base, ctx);
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

/** creature.json no schema oficial (GAME-ASSETS/07-manifests): `approvalStatus` + `animations.*.frames[]` com `atlasKey`. */
export function isOfficialManifest(m: Obj): boolean {
  return "approvalStatus" in m || (isObj(m.animations) && Object.values(m.animations).some((a) => isObj(a) && Array.isArray(a.frames)));
}

interface AtlasEntry {
  imageRel: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Junta os atlas JSON Hash (TexturePacker/Phaser) da criatura num índice chave → retângulo. */
function atlasIndex(atlases: Record<string, unknown> | undefined, errors: string[]): Map<string, AtlasEntry> {
  const out = new Map<string, AtlasEntry>();
  for (const [rel, a] of Object.entries(atlases ?? {})) {
    if (!isObj(a) || !isObj(a.frames)) continue;
    const image = isObj(a.meta) ? str(a.meta.image) : undefined;
    if (!image) {
      errors.push(`atlas ${rel}: meta.image ausente`);
      continue;
    }
    const imageRel = joinRel(rel.split("/").slice(0, -1).join("/"), image);
    if (!imageRel) {
      errors.push(`atlas ${rel}: meta.image sai da pasta`);
      continue;
    }
    for (const [key, f] of Object.entries(a.frames)) {
      const r = isObj(f) && isObj(f.frame) ? f.frame : undefined;
      if (r && ["x", "y", "w", "h"].every((k) => num(r[k]) !== undefined))
        out.set(key, { imageRel, x: r.x as number, y: r.y as number, w: r.w as number, h: r.h as number });
    }
  }
  return out;
}

/**
 * Schema oficial → CreatureView. Direções: `directions[anim].drawn` + `mirrored` (flipX). O schema dá um
 * `atlasKey` por quadro; para a 2ª direção desenhada em diante, a chave é a da 1ª com `_<DIR>_` trocado
 * (convenção de nome `<id>_<anim>_<dir>_<NN>` do SPRITE_SPECIFICATION §6).
 */
function parseOfficial(item: LibraryItem, m: Obj, base: CreatureView, ctx: NormalizeCtx): CreatureView {
  const { errors, warnings } = base;
  base.id = str(m.id) ?? (errors.push("id ausente"), base.id);
  base.name = str(m.name) ?? (errors.push("name ausente"), base.id);
  base.description = str(m.description);
  base.category = str(m.category);
  base.rarity = str(m.rarity);
  base.element = str(m.element);
  base.stage = str(m.evolutionStage);
  base.evolutionLine = isObj(m.evolutionLine) ? str(m.evolutionLine.lineId) : undefined;
  base.score = num(m.score);
  const st = normalizeStatus(m.approvalStatus);
  if (!st) errors.push(`approvalStatus inválido: ${JSON.stringify(m.approvalStatus)} (use ${STATUSES.join(", ")})`);
  base.status = st ?? "UNKNOWN";

  const origin = isObj(m.assetOrigin) ? m.assetOrigin : {};
  const lic = isObj(item.licenseJson) ? item.licenseJson : undefined;
  const tier = str(lic?.layer) ?? str(origin.layer);
  if (!tier || !(LICENSE_TIERS as readonly string[]).includes(tier))
    errors.push(`camada de licença inválida: ${JSON.stringify(tier)} (use ${LICENSE_TIERS.join(", ")})`);
  if (!lic) warnings.push("license.json ausente (só assetOrigin)");
  const credit = lic && isObj(lic.credit) ? lic.credit : {};
  const source = lic && isObj(lic.source) ? lic.source : {};
  base.license = {
    tier: tier ?? "desconhecida",
    author: [str(credit.ripper), str(credit.preservedBy)].filter(Boolean).join(" · ") || undefined,
    url: str(source.fileUrl) ?? str(source.repository),
    file: lic ? "license.json" : undefined,
    notes: str(lic?.copyright) ?? str(lic?.notes),
  };
  base.origin = { type: str(origin.layer), source: str(origin.sourceDescription), author: str(credit.ripper) };

  const dims = isObj(m.dimensions) ? m.dimensions : {};
  if (num(dims.frameW) && num(dims.frameH)) base.dimensions = { width: dims.frameW as number, height: dims.frameH as number };
  if (isObj(m.hitbox) && ["x", "y", "w", "h"].every((k) => num((m.hitbox as Obj)[k]) !== undefined))
    base.hitbox = m.hitbox as CreatureView["hitbox"];
  const pivot = isObj(m.pivot) && num(m.pivot.x) !== undefined && num(m.pivot.y) !== undefined ? { x: m.pivot.x as number, y: m.pivot.y as number } : undefined;
  if (!pivot) errors.push("pivot ausente");
  base.anchors = pivot ? { feet: pivot } : {};
  if (isObj(m.anchors))
    for (const [k, v] of Object.entries(m.anchors)) {
      if (isObj(v) && num(v.x) !== undefined && num(v.y) !== undefined) base.anchors[k] = { x: v.x as number, y: v.y as number };
      else if (isObj(v) && num(v.cx) !== undefined && num(v.cy) !== undefined) base.anchors[k] = { x: v.cx as number, y: v.cy as number };
      else errors.push(`anchors.${k} inválido`);
    }
  if (Array.isArray(m.review))
    base.review = m.review.filter(isObj).flatMap((r): ReviewEntry[] => {
      const s = normalizeStatus(r.status);
      return s && str(r.at) ? [{ status: s, at: r.at as string, by: str(r.by), note: str(r.note) }] : [];
    });

  const atlas = atlasIndex(item.atlases, errors);
  if (!atlas.size) errors.push("nenhum atlas JSON em spritesheets/");
  const dirsByAnim = isObj(m.directions) ? m.directions : {};
  const anims: AnimView[] = [];
  for (const [name, raw] of Object.entries(isObj(m.animations) ? m.animations : {})) {
    const where = `animations.${name}`;
    if (!isObj(raw) || !Array.isArray(raw.frames) || !raw.frames.length) {
      errors.push(`${where}: sem frames`);
      continue;
    }
    const fps = num(raw.fps);
    const spec = raw.frames.filter(isObj).map((f) => ({ key: str(f.atlasKey), ms: num(f.durationMs) ?? 1000 / (fps && fps > 0 ? fps : DEFAULT_FPS) }));
    const dcfg = isObj(dirsByAnim[name]) ? (dirsByAnim[name] as Obj) : {};
    const drawn = (Array.isArray(dcfg.drawn) ? dcfg.drawn : []).filter((d) => {
      if (!isDir(d)) errors.push(`directions.${name}.drawn: "${String(d)}" inválida`);
      return isDir(d);
    }) as Dir[];
    if (!drawn.length) drawn.push("S");
    const out: Partial<Record<Dir, FrameRef[]>> = {};
    let fw = 0;
    let fh = 0;
    for (const d of drawn) {
      const frames: FrameRef[] = [];
      for (const [i, f] of spec.entries()) {
        const key = f.key && (d === drawn[0] ? f.key : f.key.replace(`_${drawn[0]}_`, `_${d}_`));
        const e = key ? atlas.get(key) : undefined;
        if (!e) {
          errors.push(`${where}[${d}] quadro ${i}: atlasKey ${JSON.stringify(key)} não está no atlas`);
          continue;
        }
        if (ctx.sheetSizes && !ctx.sheetSizes[e.imageRel]) warnings.push(`${where}: folha ${e.imageRel} não encontrada`);
        fw = Math.max(fw, e.w);
        fh = Math.max(fh, e.h);
        frames.push({ image: ctx.fileUrl(item.root, e.imageRel), sx: e.x, sy: e.y, sw: e.w, sh: e.h, flipX: false, durationMs: f.ms });
      }
      if (frames.length) out[d] = frames;
    }
    const directions = Object.keys(out) as Dir[];
    if (!directions.length) continue;
    if (isObj(dcfg.mirrored))
      for (const [to, from] of Object.entries(dcfg.mirrored)) {
        if (!isDir(to) || !isDir(from) || !out[from]) {
          errors.push(`directions.${name}.mirrored: ${to}←${String(from)} inválido`);
          continue;
        }
        out[to] = out[from]!.map((f) => ({ ...f, flipX: !f.flipX }));
        if (!directions.includes(to)) directions.push(to);
      }
    directions.sort((a, b) => DIRS8.indexOf(a) - DIRS8.indexOf(b));
    const events = Array.isArray(raw.events)
      ? raw.events.filter(isObj).flatMap((e) => (num(e.frame) !== undefined && str(e.name) ? [{ frame: e.frame as number, name: e.name as string }] : []))
      : [];
    anims.push({ name, loop: typeof raw.loop === "boolean" ? raw.loop : true, frameWidth: fw, frameHeight: fh, directions, frames: out, origin: pivot, events });
  }
  base.versions.push({ id: "current", label: "atual", format: "grid", anims });
  base.currentVersion = "current";
  if (!anims.length) errors.push("nenhuma animação legível");
  for (const p of ["idle", "walk"]) if (!anims.some((a) => a.name.toLowerCase() === p)) warnings.push(`sem animação P0 "${p}"`);
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
