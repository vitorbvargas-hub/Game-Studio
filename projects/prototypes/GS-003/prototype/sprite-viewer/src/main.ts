// UI do sprite viewer: galeria + filtros, preview animado, quadros, direções, comparação de versões,
// licença e aprovação/rejeição (POST /api/review → creature.json). Só lê dados via /api/library e /fs/.

import { applyFilters, normalizeItem, type Filters } from "./manifest";
import { frameAt, frameStartMs } from "./player";
import { STATUSES, type AnimView, type AssetStatus, type CreatureView, type Dir, type FrameRef, type LibraryResponse, type VersionView } from "./types";

const $ = <T extends HTMLElement>(sel: string) => document.querySelector(sel) as T;
const h = <K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> & { class?: string } = {}, ...kids: (Node | string)[]) => {
  const el = document.createElement(tag);
  const { class: cls, ...rest } = props;
  if (cls) el.className = cls;
  Object.assign(el, rest);
  el.append(...kids);
  return el;
};

// ---------- imagens ----------
const images = new Map<string, HTMLImageElement>();
function img(url: string): HTMLImageElement {
  let im = images.get(url);
  if (!im) {
    im = new Image();
    im.src = url;
    images.set(url, im);
  }
  return im;
}
function bustImages(): void {
  images.clear();
}

/** Desenha um quadro em (dx,dy) com escala inteira e flip opcional. Devolve false se a imagem não carregou. */
function drawFrame(ctx: CanvasRenderingContext2D, f: FrameRef, dx: number, dy: number, zoom: number, alpha = 1): boolean {
  const im = img(f.image);
  if (!im.complete || !im.naturalWidth) return false;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = false;
  if (f.flipX) {
    ctx.translate(dx + f.sw * zoom, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(im, f.sx, f.sy, f.sw, f.sh, 0, 0, f.sw * zoom, f.sh * zoom);
  } else ctx.drawImage(im, f.sx, f.sy, f.sw, f.sh, dx, dy, f.sw * zoom, f.sh * zoom);
  ctx.restore();
  return true;
}

// ---------- estado ----------
interface UiState {
  lib: LibraryResponse | null;
  creatures: CreatureView[];
  filters: Filters;
  selKey?: string;
  versionA?: string;
  versionB?: string;
  compare: boolean;
  anim?: string;
  dir: Dir;
  speed: number;
  zoom: number;
  playing: boolean;
  elapsed: number;
  showShadow: boolean;
  showAnchors: boolean;
  showHitbox: boolean;
}
const ui: UiState = {
  lib: null,
  creatures: [],
  filters: {},
  compare: false,
  dir: "S",
  speed: 1,
  zoom: 4,
  playing: true,
  elapsed: 0,
  showShadow: true,
  showAnchors: false,
  showHitbox: false,
};

const fileUrl = (root: string, rel: string) => `/fs/${root}/${rel.split("/").map(encodeURIComponent).join("/")}`;
const sel = () => ui.creatures.find((c) => c.key === ui.selKey);
const version = (c: CreatureView, id?: string) => c.versions.find((v) => v.id === id) ?? c.versions[c.versions.length - 1];
const findAnim = (v: VersionView | undefined, name?: string) =>
  v?.anims.find((a) => a.name === name) ?? v?.anims.find((a) => a.name.toLowerCase() === name?.toLowerCase());
const framesOf = (a: AnimView | undefined, d: Dir) => (a ? a.frames[d] ?? a.frames[a.directions[0]] ?? [] : []);

async function load(): Promise<void> {
  const res = await fetch("/api/library");
  if (!res.ok) throw new Error(`GET /api/library: ${res.status}`);
  const lib = (await res.json()) as LibraryResponse & { sheetSizes: Record<string, Record<string, { w: number; h: number }>> };
  bustImages();
  ui.lib = lib;
  ui.creatures = lib.items
    .map((it) => normalizeItem(it, { fileUrl, sheetSizes: it.kind === "creature" ? lib.sheetSizes[it.root] ?? {} : undefined }))
    .sort((a, b) => a.root.localeCompare(b.root) || a.id.localeCompare(b.id));
  const badge = $("#schema-badge");
  badge.textContent = lib.schema ? (lib.schema.provisional ? "schema PROVISÓRIO (viewer)" : "schema oficial 07-manifests") : "sem schema";
  badge.className = `badge ${lib.schema?.provisional ? "st-UNDER_REVIEW" : "st-APPROVED"}`;
  badge.title = lib.schema?.path ?? "";
  $("#roots").textContent = lib.roots.map((r) => `${r.key}${r.exists ? "" : " (ausente)"}${r.editable ? "" : " [leitura]"}`).join(" · ");
  fillFilters();
  renderGallery();
  renderDetail();
}

function fillFilters(): void {
  const opts = (id: string, values: (string | undefined)[], first: string) => {
    const s = $<HTMLSelectElement>(id);
    const cur = s.value;
    s.replaceChildren(h("option", { value: "", textContent: first }), ...[...new Set(values.filter(Boolean) as string[])].sort().map((v) => h("option", { value: v, textContent: v })));
    s.value = cur;
  };
  opts("#f-root", ui.creatures.map((c) => c.root), "Todas as fontes");
  opts("#f-category", ui.creatures.map((c) => c.category), "Todas as categorias");
  opts("#f-rarity", ui.creatures.map((c) => c.rarity), "Todas as raridades");
  opts("#f-status", [...STATUSES, ...ui.creatures.map((c) => c.status)], "Todos os status");
}

// ---------- galeria ----------
function thumb(c: CreatureView): HTMLCanvasElement {
  const cv = h("canvas", { class: "checker" });
  const v = version(c, c.currentVersion);
  const a = findAnim(v, "idle") ?? v?.anims[0];
  const f = framesOf(a, "S")[0];
  cv.width = f?.sw ?? 32;
  cv.height = f?.sh ?? 32;
  if (f) {
    const ctx = cv.getContext("2d")!;
    const paint = () => drawFrame(ctx, f, 0, 0, 1);
    if (!paint()) img(f.image).addEventListener("load", paint, { once: true });
  }
  return cv;
}

function renderGallery(): void {
  const list = applyFilters(ui.creatures, ui.filters);
  $("#count").textContent = `${list.length} de ${ui.creatures.length}`;
  $("#gallery").replaceChildren(
    ...list.map((c) => {
      const card = h(
        "div",
        { class: `card${c.key === ui.selKey ? " sel" : ""}${c.errors.length ? " err" : ""}`, title: c.key },
        thumb(c),
        h("div", { class: "name", textContent: c.name }),
        h("div", { class: "muted", textContent: `${c.id} · ${c.rarity ?? "—"}` }),
        h("div", {}, h("span", { class: `badge st-${c.status}`, textContent: c.status }), c.errors.length ? h("span", { class: "badge st-REJECTED", textContent: ` ${c.errors.length} erro(s)` }) : ""),
      );
      card.onclick = () => select(c.key);
      return card;
    }),
  );
}

function select(key: string): void {
  ui.selKey = key;
  const c = sel()!;
  ui.versionA = c.currentVersion ?? c.versions[c.versions.length - 1]?.id;
  ui.versionB = c.versions.find((v) => v.id !== ui.versionA)?.id ?? ui.versionA;
  ui.compare = false;
  const a = findAnim(version(c, ui.versionA), ui.anim) ?? findAnim(version(c, ui.versionA), "idle") ?? version(c, ui.versionA)?.anims[0];
  ui.anim = a?.name;
  if (a && !a.directions.includes(ui.dir)) ui.dir = a.directions[0];
  ui.elapsed = 0;
  renderGallery();
  renderDetail();
}

// ---------- detalhe ----------
let stageCanvases: { canvas: HTMLCanvasElement; which: "A" | "B" }[] = [];
let stripEls: HTMLElement[] = [];
let allDirCanvases: { canvas: HTMLCanvasElement; dir: Dir }[] = [];
let frameLabel: HTMLElement | null = null;

function info(c: CreatureView): HTMLElement {
  const kv = (k: string, v?: string | number) => (v === undefined || v === "" ? [] : [h("span", { class: "muted", textContent: k }), h("span", { textContent: String(v) })]);
  const L = c.license;
  return h(
    "div",
    { class: "stages" },
    h(
      "div",
      { class: "box" },
      h("h3", { textContent: "Ficha" }),
      h("div", { class: "grid2" }, ...kv("id", c.id), ...kv("fonte", `${c.root}:${c.dir}`), ...kv("categoria", c.category), ...kv("raridade", c.rarity), ...kv("elemento", c.element), ...kv("estágio", c.stage), ...kv("linha", c.evolutionLine), ...kv("score", c.score), ...kv("dimensões", c.dimensions && `${c.dimensions.width}×${c.dimensions.height}`), ...kv("hitbox", c.hitbox && `${c.hitbox.x},${c.hitbox.y} ${c.hitbox.w}×${c.hitbox.h}`), ...kv("âncoras", c.anchors && Object.keys(c.anchors).join(", "))),
      c.description ? h("p", { class: "muted", textContent: c.description }) : "",
    ),
    h(
      "div",
      { class: "box" },
      h("h3", { textContent: "Licença e origem" }),
      h("div", { class: "grid2" }, ...kv("camada", L.tier), ...kv("SPDX", L.spdx), ...kv("autor", L.author), ...kv("arquivo", L.file), ...kv("origem", c.origin?.type), ...kv("fonte", c.origin?.source), ...kv("criado por", c.origin?.author)),
      L.url ? h("div", {}, h("a", { href: L.url, target: "_blank", rel: "noreferrer", textContent: L.url })) : "",
      L.notes ? h("p", { class: "muted", textContent: L.notes }) : "",
      L.file && c.root !== "pmd" ? h("div", {}, h("a", { href: fileUrl(c.root, `${c.dir}/${L.file}`), target: "_blank", textContent: "abrir arquivo de licença" })) : "",
    ),
    c.errors.length || c.warnings.length
      ? h(
          "div",
          { class: "box" },
          h("h3", { textContent: "Validação do manifest" }),
          h("ul", { class: "errs" }, ...c.errors.map((e) => h("li", { textContent: e }))),
          h("ul", { class: "warns" }, ...c.warnings.map((w) => h("li", { textContent: w }))),
        )
      : "",
  );
}

function reviewBox(c: CreatureView): HTMLElement {
  const note = h("input", { placeholder: "Observação (opcional)" });
  note.style.cssText = "flex:1;min-width:200px";
  const by = h("input", { placeholder: "Revisor", value: localStorage.getItem("gs003.viewer.by") ?? "fundador" });
  by.style.width = "110px";
  const msg = h("span", { class: "muted" });
  const send = async (status: AssetStatus) => {
    localStorage.setItem("gs003.viewer.by", by.value);
    msg.textContent = "gravando…";
    const res = await fetch("/api/review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ root: c.root, dir: c.dir, status, note: note.value, by: by.value }) });
    const body = await res.json();
    if (!res.ok) {
      msg.textContent = `erro: ${body.error}`;
      return;
    }
    const key = c.key;
    await load();
    select(key);
  };
  const btn = (label: string, status: AssetStatus, cls: string) => {
    const b = h("button", { textContent: label, className: cls, disabled: !c.editable || c.status === status });
    b.onclick = () => void send(status);
    return b;
  };
  return h(
    "div",
    { class: "box" },
    h("h3", { textContent: "Homologação" }),
    h("div", { class: "row" }, h("span", {}, "Status atual: "), h("span", { class: `badge st-${c.status}`, textContent: c.status })),
    c.editable
      ? h("div", { class: "row" }, by, note, btn("Aprovar", "APPROVED", "st-APPROVED"), btn("Rejeitar", "REJECTED", "st-REJECTED"), btn("Em revisão", "UNDER_REVIEW", ""), msg)
      : h("p", { class: "muted", textContent: "Somente leitura: sem creature.json gravável (pastas PMD de referência)." }),
    c.review.length
      ? h("ul", {}, ...c.review.slice().reverse().map((r) => h("li", { textContent: `${r.at} · ${r.status}${r.by ? ` · ${r.by}` : ""}${r.note ? ` — ${r.note}` : ""}` })))
      : "",
  );
}

function controls(c: CreatureView): HTMLElement {
  const vA = version(c, ui.versionA);
  const verSel = (val: string | undefined, on: (v: string) => void) => {
    const s = h("select", {}, ...c.versions.map((v) => h("option", { value: v.id, textContent: `${v.label}${v.date ? ` (${v.date})` : ""} · ${v.format}` })));
    s.value = val ?? "";
    s.onchange = () => on(s.value);
    return s;
  };
  const animSel = h("select", {}, ...(vA?.anims ?? []).map((a) => h("option", { value: a.name, textContent: `${a.name}${a.loop ? "" : " (1×)"} · ${framesOf(a, "S").length}q` })));
  animSel.value = ui.anim ?? "";
  animSel.onchange = () => {
    ui.anim = animSel.value;
    ui.elapsed = 0;
    renderDetail();
  };
  const anim = findAnim(vA, ui.anim);
  // Rosa dos ventos 3×3 (N em cima).
  const layout: (Dir | null)[] = ["NW", "N", "NE", "W", null, "E", "SW", "S", "SE"];
  const dirs = h(
    "div",
    { class: "dirs" },
    ...layout.map((d) => {
      if (!d) return h("span");
      const has = !!anim?.frames[d];
      const b = h("button", { textContent: d, disabled: !has, className: d === ui.dir ? "on" : "", title: has && anim!.frames[d]![0].flipX ? "espelhada" : "" });
      b.onclick = () => {
        ui.dir = d;
        renderDetail();
      };
      return b;
    }),
  );
  const speed = h("select", {}, ...[0.1, 0.25, 0.5, 1, 2, 4].map((s) => h("option", { value: String(s), textContent: `${s}×` })));
  speed.value = String(ui.speed);
  speed.onchange = () => (ui.speed = Number(speed.value));
  const zoom = h("input", { type: "range", min: "1", max: "10", value: String(ui.zoom), title: "zoom (inteiro)" } as Partial<HTMLInputElement>);
  zoom.oninput = () => {
    ui.zoom = Number(zoom.value);
    renderDetail();
  };
  const play = h("button", { textContent: ui.playing ? "⏸ Pausar" : "▶ Tocar" });
  play.onclick = () => {
    ui.playing = !ui.playing;
    play.textContent = ui.playing ? "⏸ Pausar" : "▶ Tocar";
  };
  const stepBy = (d: number) => {
    const frames = framesOf(anim, ui.dir);
    const durs = frames.map((f) => f.durationMs);
    const cur = frameAt(durs, ui.elapsed, true);
    ui.playing = false;
    play.textContent = "▶ Tocar";
    ui.elapsed = frameStartMs(durs, (cur + d + durs.length) % Math.max(1, durs.length));
  };
  const prev = h("button", { textContent: "◀ quadro" });
  prev.onclick = () => stepBy(-1);
  const next = h("button", { textContent: "quadro ▶" });
  next.onclick = () => stepBy(1);
  const toggle = (label: string, key: "showShadow" | "showAnchors" | "showHitbox" | "compare") => {
    const cb = h("input", { type: "checkbox", checked: ui[key] } as Partial<HTMLInputElement>);
    cb.onchange = () => {
      ui[key] = cb.checked;
      renderDetail();
    };
    return h("label", {}, cb, ` ${label}`);
  };
  return h(
    "div",
    { class: "box" },
    h(
      "div",
      { class: "row" },
      h("span", { class: "muted", textContent: "Versão" }),
      verSel(ui.versionA, (v) => {
        ui.versionA = v;
        renderDetail();
      }),
      toggle("comparar com", "compare"),
      ui.compare
        ? verSel(ui.versionB, (v) => {
            ui.versionB = v;
            renderDetail();
          })
        : "",
    ),
    h("div", { class: "row" }, h("span", { class: "muted", textContent: "Animação" }), animSel, dirs, h("span", { class: "muted", textContent: "Velocidade" }), speed, h("span", { class: "muted", textContent: "Zoom" }), zoom, play, prev, next),
    h("div", { class: "row" }, toggle("sombra", "showShadow"), toggle("origem/âncoras", "showAnchors"), toggle("hitbox", "showHitbox")),
    vA?.notes ? h("div", { class: "muted", textContent: `Notas ${vA.id}: ${vA.notes}` }) : "",
  );
}

function renderDetail(): void {
  const c = sel();
  const root = $("#detail");
  stageCanvases = [];
  stripEls = [];
  allDirCanvases = [];
  frameLabel = null;
  if (!c) {
    root.replaceChildren(h("p", { class: "muted", textContent: ui.creatures.length ? "Selecione uma criatura na galeria." : "Biblioteca vazia." }));
    return;
  }
  const vA = version(c, ui.versionA);
  // Versão nova pode não ter a animação/direção atuais: cai para a primeira disponível.
  if (!findAnim(vA, ui.anim) && vA?.anims[0]) ui.anim = vA.anims[0].name;
  const anim = findAnim(vA, ui.anim);
  if (anim && !anim.frames[ui.dir]) ui.dir = anim.directions[0];
  const stageBox = h("div", { class: "stages" });
  const which: ("A" | "B")[] = ui.compare ? ["A", "B"] : ["A"];
  // Mesmo tamanho para os dois lados: maior célula entre as versões comparadas.
  const anims = which.map((w) => findAnim(version(c, w === "A" ? ui.versionA : ui.versionB), ui.anim));
  const cw = Math.max(16, ...anims.map((a) => a?.frameWidth ?? 0));
  const ch = Math.max(16, ...anims.map((a) => a?.frameHeight ?? 0));
  which.forEach((w, i) => {
    const cv = h("canvas", { class: "checker", width: cw * ui.zoom, height: ch * ui.zoom });
    stageCanvases.push({ canvas: cv, which: w });
    const vid = w === "A" ? ui.versionA : ui.versionB;
    stageBox.append(h("div", { class: "stage" }, h("div", { class: "muted", textContent: `${w}: ${vid}${anims[i] ? "" : " — sem esta animação"}` }), cv));
  });
  frameLabel = h("div", { class: "muted" });

  // Quadros individuais (versão A, direção atual).
  const frames = framesOf(anim, ui.dir);
  const strip = h(
    "div",
    { class: "frames" },
    ...frames.map((f, i) => {
      const cv = h("canvas", { class: "checker", width: f.sw * 2, height: f.sh * 2 });
      const paint = () => drawFrame(cv.getContext("2d")!, f, 0, 0, 2);
      if (!paint()) img(f.image).addEventListener("load", paint, { once: true });
      const ev = anim!.events.filter((e) => e.frame === i).map((e) => e.name);
      const el = h("div", { class: `frame${ev.length ? " ev" : ""}`, title: "clique para pausar neste quadro" }, cv, `#${i} · ${Math.round(f.durationMs)}ms${ev.length ? ` · ${ev.join(",")}` : ""}`);
      el.onclick = () => {
        ui.playing = false;
        ui.elapsed = frameStartMs(frames.map((x) => x.durationMs), i);
        renderDetail();
      };
      stripEls.push(el);
      return el;
    }),
  );

  // Todas as direções animando juntas.
  const alldirs = h(
    "div",
    { class: "alldirs" },
    ...(anim?.directions ?? []).map((d) => {
      const f0 = anim!.frames[d]![0];
      const cv = h("canvas", { class: "checker", width: anim!.frameWidth * 2, height: anim!.frameHeight * 2 });
      allDirCanvases.push({ canvas: cv, dir: d });
      const el = h("div", { class: "frame" }, cv, `${d}${f0.flipX ? " (esp.)" : ""}`);
      el.onclick = () => {
        ui.dir = d;
        renderDetail();
      };
      return el;
    }),
  );

  root.replaceChildren(
    h("h2", { textContent: c.name }),
    h("div", { class: "muted", textContent: `${c.versions.length} versão(ões) · ${vA?.anims.map((a) => a.name).join(", ") ?? "—"}` }),
    controls(c),
    h("div", { class: "box" }, h("h3", { textContent: "Preview" }), stageBox, frameLabel),
    h("div", { class: "box" }, h("h3", { textContent: `Quadros (${ui.dir})` }), strip),
    h("div", { class: "box" }, h("h3", { textContent: "Direções" }), alldirs),
    reviewBox(c),
    info(c),
  );
}

// ---------- loop ----------
function drawStage(cv: HTMLCanvasElement, a: AnimView | undefined, c: CreatureView, elapsed: number): number {
  const ctx = cv.getContext("2d")!;
  ctx.clearRect(0, 0, cv.width, cv.height);
  if (!a) return -1;
  const frames = framesOf(a, ui.dir);
  if (!frames.length) return -1;
  const i = frameAt(frames.map((f) => f.durationMs), elapsed, a.loop);
  const f = frames[i];
  const z = ui.zoom;
  // Centraliza a célula; alinha pela base (pés), como no jogo.
  const dx = Math.floor((cv.width - f.sw * z) / 2 / z) * z;
  const dy = cv.height - f.sh * z;
  if (ui.showShadow && a.shadow) {
    const sf = (a.shadow[ui.dir] ?? a.shadow[a.directions[0]])?.[i];
    if (sf) drawFrame(ctx, sf, dx, dy, z, 0.45);
  }
  drawFrame(ctx, f, dx, dy, z);
  if (ui.showAnchors) {
    const pts = { ...(c.anchors ?? {}), ...(a.origin ? { origin: a.origin } : {}) };
    for (const [name, p] of Object.entries(pts)) {
      const x = f.flipX ? f.sw - 1 - p.x : p.x;
      ctx.fillStyle = name === "origin" || name === "feet" ? "#ff3df2" : "#3dfff2";
      ctx.fillRect(dx + x * z, dy + p.y * z, z, z);
    }
  }
  if (ui.showHitbox && c.hitbox) {
    const hb = c.hitbox;
    const x = f.flipX ? f.sw - hb.x - hb.w : hb.x;
    ctx.strokeStyle = "#ff5555";
    ctx.lineWidth = 1;
    ctx.strokeRect(dx + x * z + 0.5, dy + hb.y * z + 0.5, hb.w * z - 1, hb.h * z - 1);
  }
  return i;
}

let last = performance.now();
function tick(now: number): void {
  const dt = Math.min(100, now - last);
  last = now;
  if (ui.playing) ui.elapsed += dt * ui.speed;
  const c = sel();
  if (c) {
    let curA = -1;
    for (const s of stageCanvases) {
      const a = findAnim(version(c, s.which === "A" ? ui.versionA : ui.versionB), ui.anim);
      const i = drawStage(s.canvas, a, c, ui.elapsed);
      if (s.which === "A") curA = i;
    }
    stripEls.forEach((el, i) => el.classList.toggle("cur", i === curA));
    const anim = findAnim(version(c, ui.versionA), ui.anim);
    if (frameLabel && anim) {
      const fr = framesOf(anim, ui.dir);
      const total = fr.reduce((s, f) => s + f.durationMs, 0);
      const ev = anim.events.filter((e) => e.frame === curA).map((e) => e.name);
      frameLabel.textContent = `quadro ${curA + 1}/${fr.length} · ${Math.round(anim.loop ? ui.elapsed % total : Math.min(ui.elapsed, total))}/${Math.round(total)} ms · ${anim.loop ? "loop" : "uma passada"}${ev.length ? ` · evento: ${ev.join(", ")}` : ""}`;
    }
    for (const { canvas, dir } of allDirCanvases) {
      const fr = anim?.frames[dir];
      if (!fr || !anim) continue;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawFrame(ctx, fr[frameAt(fr.map((f) => f.durationMs), ui.elapsed, anim.loop)], 0, 0, 2);
    }
  }
  requestAnimationFrame(tick);
}

// ---------- boot ----------
function bindFilters(): void {
  const bind = (id: string, key: keyof Filters, ev = "change") => {
    const el = $<HTMLInputElement | HTMLSelectElement>(id);
    el.addEventListener(ev, () => {
      ui.filters[key] = el.value || undefined;
      renderGallery();
    });
  };
  bind("#f-text", "text", "input");
  bind("#f-root", "root");
  bind("#f-category", "category");
  bind("#f-rarity", "rarity");
  bind("#f-status", "status");
  $("#reload").onclick = () => void load().then(() => ui.selKey && select(ui.selKey));
  // Atalhos: espaço = tocar/pausar; ←/→ = quadro; ↑/↓ = animação anterior/próxima.
  addEventListener("keydown", (e) => {
    if ((e.target as HTMLElement).tagName === "INPUT") return;
    const c = sel();
    if (!c) return;
    const v = version(c, ui.versionA);
    if (e.key === " ") {
      ui.playing = !ui.playing;
      e.preventDefault();
      renderDetail();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      const names = v?.anims.map((a) => a.name) ?? [];
      const i = names.indexOf(ui.anim ?? "");
      ui.anim = names[(i + (e.key === "ArrowDown" ? 1 : -1) + names.length) % names.length];
      ui.elapsed = 0;
      e.preventDefault();
      renderDetail();
    }
  });
}

bindFilters();
load().catch((e) => {
  $("#detail").replaceChildren(h("p", { class: "errs", textContent: `Falha ao carregar a biblioteca: ${(e as Error).message}. Rode com \`npm run dev\` (o endpoint só existe no servidor de dev).` }));
});
requestAnimationFrame(tick);
