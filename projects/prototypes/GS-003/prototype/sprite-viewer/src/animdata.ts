// Parser do formato PMD (AnimData.xml + <Anim>-Anim.png / <Anim>-Shadow.png).
// Puro (sem DOM): roda no navegador e no Node (vitest). XML mínimo próprio, só o subconjunto
// que o AnimData usa: elementos, texto, comentários, declaração <?xml?>. Atributos são ignorados.
//
// Convenção da grade (art/sprites/pmd/README.md): 1 linha por direção, ordem S, SE, E, NE, N, NW, W, SW;
// 1 coluna por quadro. Folha com 1 linha só = animação sem direção (vale para todas).
// Durações em ticks; 1 tick = 1/60 s [H: convenção do PMD Collab, não verificada em fonte primária].

import { DIRS8, type AnimEvent, type AnimView, type Dir, type FrameRef, type PmdSource, type VersionView } from "./types";

export const PMD_TICK_MS = 1000 / 60;

export interface XmlNode {
  name: string;
  children: XmlNode[];
  text: string;
}

export function parseXml(src: string): XmlNode {
  const root: XmlNode = { name: "#root", children: [], text: "" };
  const stack: XmlNode[] = [root];
  let i = 0;
  while (i < src.length) {
    const lt = src.indexOf("<", i);
    const textEnd = lt === -1 ? src.length : lt;
    if (textEnd > i) stack[stack.length - 1].text += decodeEntities(src.slice(i, textEnd));
    if (lt === -1) break;
    if (src.startsWith("<!--", lt)) {
      const end = src.indexOf("-->", lt + 4);
      if (end === -1) throw new Error("XML: comentário sem fim");
      i = end + 3;
      continue;
    }
    if (src.startsWith("<?", lt) || src.startsWith("<!", lt)) {
      const end = src.indexOf(">", lt);
      if (end === -1) throw new Error("XML: declaração sem fim");
      i = end + 1;
      continue;
    }
    const gt = src.indexOf(">", lt);
    if (gt === -1) throw new Error("XML: tag sem fim");
    const raw = src.slice(lt + 1, gt).trim();
    i = gt + 1;
    if (raw.startsWith("/")) {
      const name = raw.slice(1).trim();
      const top = stack.pop();
      if (!top || top.name !== name || stack.length === 0) throw new Error(`XML: fechamento inesperado </${name}>`);
      continue;
    }
    const selfClosing = raw.endsWith("/");
    const name = (selfClosing ? raw.slice(0, -1) : raw).trim().split(/\s+/)[0];
    if (!name) throw new Error("XML: tag vazia");
    const node: XmlNode = { name, children: [], text: "" };
    stack[stack.length - 1].children.push(node);
    if (!selfClosing) stack.push(node);
  }
  if (stack.length !== 1) throw new Error(`XML: <${stack[stack.length - 1].name}> não foi fechado`);
  return root;
}

function decodeEntities(s: string): string {
  return s.replace(/&(lt|gt|amp|quot|apos);/g, (_, e: string) => ({ lt: "<", gt: ">", amp: "&", quot: '"', apos: "'" })[e]!);
}

const child = (n: XmlNode, name: string) => n.children.find((c) => c.name === name);
const textOf = (n: XmlNode | undefined) => n?.text.trim() ?? "";
function intOf(n: XmlNode | undefined, what: string): number {
  const v = Number(textOf(n));
  if (!Number.isInteger(v) || v < 0) throw new Error(`AnimData: ${what} inválido ("${textOf(n)}")`);
  return v;
}

export interface PmdAnim {
  name: string;
  index?: number;
  frameWidth: number;
  frameHeight: number;
  /** Durações em ticks. */
  durations: number[];
  rushFrame?: number;
  hitFrame?: number;
  returnFrame?: number;
  /** <CopyOf>: reaproveita folha e dados de outra animação. */
  copyOf?: string;
}

export interface AnimData {
  shadowSize?: number;
  anims: PmdAnim[];
}

export function parseAnimData(xml: string): AnimData {
  const doc = parseXml(xml);
  const root = child(doc, "AnimData");
  if (!root) throw new Error("AnimData: elemento raiz <AnimData> ausente");
  const animsNode = child(root, "Anims");
  if (!animsNode) throw new Error("AnimData: <Anims> ausente");
  const shadow = child(root, "ShadowSize");
  const raw = animsNode.children.filter((c) => c.name === "Anim");
  const anims: PmdAnim[] = raw.map((a) => {
    const name = textOf(child(a, "Name"));
    if (!name) throw new Error("AnimData: <Anim> sem <Name>");
    const copyOf = textOf(child(a, "CopyOf")) || undefined;
    const opt = (tag: string) => (child(a, tag) ? intOf(child(a, tag), `${name}.${tag}`) : undefined);
    if (copyOf) return { name, index: opt("Index"), copyOf, frameWidth: 0, frameHeight: 0, durations: [] };
    const durs = child(a, "Durations");
    const durations = (durs?.children ?? []).filter((d) => d.name === "Duration").map((d) => intOf(d, `${name}.Duration`));
    if (!durations.length) throw new Error(`AnimData: ${name} sem <Durations>`);
    const anim: PmdAnim = {
      name,
      index: opt("Index"),
      frameWidth: intOf(child(a, "FrameWidth"), `${name}.FrameWidth`),
      frameHeight: intOf(child(a, "FrameHeight"), `${name}.FrameHeight`),
      durations,
      rushFrame: opt("RushFrame"),
      hitFrame: opt("HitFrame"),
      returnFrame: opt("ReturnFrame"),
    };
    if (!anim.frameWidth || !anim.frameHeight) throw new Error(`AnimData: ${name} com tamanho de quadro 0`);
    return anim;
  });
  // Resolve CopyOf (um nível, como no PMD Collab), mantendo o nome próprio.
  const byName = new Map(anims.map((a) => [a.name, a]));
  for (const a of anims) {
    if (!a.copyOf) continue;
    const src = byName.get(a.copyOf);
    if (!src || src.copyOf) throw new Error(`AnimData: ${a.name} CopyOf "${a.copyOf}" inexistente ou encadeado`);
    Object.assign(a, { ...src, name: a.name, index: a.index, copyOf: a.copyOf });
  }
  return { shadowSize: shadow ? intOf(shadow, "ShadowSize") : undefined, anims };
}

/** Animações que não repetem (one-shot) por convenção de nome. */
const ONE_SHOT = /^(attack|hurt|hit|defeat|faint|evolution|special|shoot|strike|swing|charge|pose)/i;

/** Nome do arquivo de folha da animação (CopyOf usa a folha da origem). */
export function sheetFile(a: PmdAnim, kind: "Anim" | "Shadow" = "Anim"): string {
  return `${a.copyOf ?? a.name}-${kind}.png`;
}

/** Monta os quadros de uma grade (linhas = direções). `rows` vem da altura real da folha, se conhecida. */
export function gridFrames(
  url: string,
  fw: number,
  fh: number,
  durationsMs: number[],
  rows: number,
): { directions: Dir[]; frames: Partial<Record<Dir, FrameRef[]>> } {
  const dirs: Dir[] = rows >= 8 ? [...DIRS8] : rows === 1 ? ["S"] : DIRS8.slice(0, rows);
  const frames: Partial<Record<Dir, FrameRef[]>> = {};
  dirs.forEach((d, row) => {
    frames[d] = durationsMs.map((ms, col) => ({ image: url, sx: col * fw, sy: row * fh, sw: fw, sh: fh, flipX: false, durationMs: ms }));
  });
  return { directions: dirs, frames };
}

/** Converte uma pasta PMD (XML + tamanhos de folha) em versão do viewer. Devolve avisos de consistência. */
export function pmdToVersion(src: PmdSource, label = src.versionId): { version: VersionView; warnings: string[] } {
  const data = parseAnimData(src.animDataXml);
  const warnings: string[] = [];
  const anims: AnimView[] = [];
  for (const a of data.anims) {
    const file = sheetFile(a);
    const size = src.sheetSizes[file];
    if (!size) {
      warnings.push(`${a.name}: folha ${file} não encontrada`);
      continue;
    }
    const cols = Math.floor(size.w / a.frameWidth);
    const rows = Math.floor(size.h / a.frameHeight);
    if (size.w % a.frameWidth || size.h % a.frameHeight)
      warnings.push(`${a.name}: folha ${size.w}×${size.h} não é múltiplo do quadro ${a.frameWidth}×${a.frameHeight}`);
    if (cols !== a.durations.length) warnings.push(`${a.name}: ${a.durations.length} durações mas ${cols} colunas na folha`);
    if (rows !== 1 && rows !== 8) warnings.push(`${a.name}: ${rows} linhas (esperado 1 ou 8 direções)`);
    const n = Math.min(cols, a.durations.length);
    const ms = a.durations.slice(0, n).map((t) => t * PMD_TICK_MS);
    const grid = gridFrames(src.baseUrl + file, a.frameWidth, a.frameHeight, ms, rows);
    const shadowFile = sheetFile(a, "Shadow");
    const shadow = src.sheetSizes[shadowFile]
      ? gridFrames(src.baseUrl + shadowFile, a.frameWidth, a.frameHeight, ms, rows).frames
      : undefined;
    const events: AnimEvent[] = [];
    if (a.rushFrame !== undefined) events.push({ frame: a.rushFrame, name: "rush" });
    if (a.hitFrame !== undefined) events.push({ frame: a.hitFrame, name: "hit" });
    if (a.returnFrame !== undefined) events.push({ frame: a.returnFrame, name: "return" });
    anims.push({
      name: a.name,
      loop: !ONE_SHOT.test(a.name),
      frameWidth: a.frameWidth,
      frameHeight: a.frameHeight,
      directions: grid.directions,
      frames: grid.frames,
      shadow,
      events,
    });
  }
  return { version: { id: src.versionId, label, format: "pmd", anims }, warnings };
}
