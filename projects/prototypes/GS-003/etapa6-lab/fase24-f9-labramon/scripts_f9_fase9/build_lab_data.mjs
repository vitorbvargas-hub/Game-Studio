// F9 Fase 9 — gera lab/lab-data.js a partir dos manifesto.json reais de movement/, combat/, rest/,
// emotions/, interactions/ (Fases 3-8). Não gera pixel nenhum; só lê e organiza os caminhos e metadados
// já produzidos. Reexecutar sempre que a arte mudar. Sem dependências externas (só Node builtin).
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, ".."); // fase24-f9-labramon/
const LAB = join(ROOT, "lab");
mkdirSync(LAB, { recursive: true });
mkdirSync(join(LAB, "assets", "tamer_reference"), { recursive: true });

const loadManifest = (folder) => JSON.parse(readFileSync(join(ROOT, folder, "manifesto.json"), "utf8"));

function clipFrom(folder, clipeObj) {
  const n = clipeObj.quadros ?? clipeObj.arquivos.length;
  let durations = clipeObj.duracao_ms_por_quadro;
  if (!Array.isArray(durations)) {
    const v = typeof durations === "number" ? durations : clipeObj.duracao_sugerida_ms_por_quadro ?? 100;
    durations = new Array(n).fill(v);
  }
  return {
    frames: clipeObj.arquivos.map((a) => `../${folder}/${a.arquivo}`),
    durations,
    totalMs: clipeObj.duracao_total_ms ?? durations.reduce((s, x) => s + x, 0),
    loop: !!clipeObj.loop,
    retornaA: clipeObj.retorna_a ?? null,
    segueFara: clipeObj.segue_para ?? null,
    fases: clipeObj.fases_quadros_inicio_fim ?? null,
    quadroImpacto: clipeObj.quadro_de_impacto ?? null,
    fonte: clipeObj.fonte ?? null,
    medidasProducao: clipeObj.medidas ?? null,
  };
}

// --- movement (4 direções: standing, idle, walk) ---
const mv = loadManifest("movement");
const movement = {
  pivot: mv.ancora,
  canvas: mv.canvas,
  paleta: mv.paleta,
  standing: {},
  idle: {},
  walk: {},
};
for (const f of mv.standing.arquivos) {
  const m = f.arquivo.match(/standing\/(\w)\.png/);
  if (!m) continue;
  movement.standing[m[1]] = { frames: [`../movement/${f.arquivo}`], durations: [0], loop: false, totalMs: 0 };
}
for (const [key, a] of Object.entries(mv.animacoes)) {
  const [kind, dir] = key.split("/"); // "walk","S"
  const durations = new Array(a.quadros).fill(a.duracao_sugerida_ms_por_quadro ?? 100);
  movement[kind][dir] = {
    frames: a.arquivos.map((x) => `../movement/${x.arquivo}`),
    durations,
    totalMs: durations.reduce((s, x) => s + x, 0),
    loop: true,
    fonte: a.fonte,
    medidasProducao: {
      h_min_max: a.h_min_max,
      w_min_max: a.w_min_max,
      cores: a.cores,
      pe_y49: a.pe_y49,
      recuo_pe_apoio_px_quadro: a.recuo_pe_apoio_px_quadro,
      olho_px_por_quadro: a.olho_px_por_quadro,
      marcas_px_por_quadro: a.marcas_px_por_quadro,
    },
  };
}

// --- emotions / rest / interactions / combat (direção única E) ---
function buildGroup(folder) {
  const m = loadManifest(folder);
  const group = { pivot: m.ancora, canvas: m.canvas, direcao: m.direcao ?? "E", estados: {} };
  for (const [estadoId, estadoObj] of Object.entries(m.estados)) {
    const estado = { doc: estadoObj.doc ?? null, clipes: {}, poseMestra: null, fx: null };
    if (estadoObj.pose_mestra) estado.poseMestra = `../${folder}/${estadoObj.pose_mestra.arquivo}`;
    for (const [clipeId, clipeObj] of Object.entries(estadoObj.clipes ?? {})) {
      estado.clipes[clipeId] = clipFrom(folder, clipeObj);
    }
    if (estadoObj.fx_onda_de_choque) {
      const fx = estadoObj.fx_onda_de_choque;
      estado.fx = {
        canvas: fx.canvas,
        origemBocaXY: fx.origem_boca_xy,
        alcanceMaxX: fx.alcance_max_x,
        timeline: fx.linha_do_tempo,
        frames: fx.arquivos.map((a) => `../${folder}/${a.arquivo}`),
      };
    }
    group.estados[estadoId] = estado;
  }
  return group;
}

const emotions = buildGroup("emotions");
const rest = buildGroup("rest");
const interactions = buildGroup("interactions");
const combat = buildGroup("combat");

const contratoIndicePath = join(ROOT, "interactions", "contratos", "contrato_estados_labramon_indice.json");
const contratoIndice = existsSync(contratoIndicePath) ? JSON.parse(readFileSync(contratoIndicePath, "utf8")) : null;

// --- Tamer provisório: só referência visual, cópia (não modifica o original) ---
const TAMER_SRC = join(ROOT, "..", "fase1-pixellab", "referencias", "tamer_v13_south.png");
let tamerRef = null;
if (existsSync(TAMER_SRC)) {
  const dest = join(LAB, "assets", "tamer_reference", "tamer_v13_south.png");
  copyFileSync(TAMER_SRC, dest);
  tamerRef = { src: "assets/tamer_reference/tamer_v13_south.png", origem: "etapa6-lab/fase1-pixellab/referencias/tamer_v13_south.png (cópia de leitura; original não alterado)" };
}

const LAB_DATA = {
  geradoEm: new Date().toISOString(),
  especie: "Labramon (sp.labramon) — Rookie/child, Beast, Vaccine",
  licenca: "private-prototype (fan game não oficial, sem licença, sem monetização). NÃO homologado. Nada publicado.",
  direcoesMovimento: ["S", "E", "N", "W"],
  direcaoUnicaDemaisEstados: "E",
  pivot: movement.pivot,
  canvas: movement.canvas,
  movement,
  emotions,
  rest,
  interactions,
  combat,
  contratoIndice,
  tamerRef,
};

writeFileSync(join(LAB, "lab-data.js"), `// GERADO por scripts_f9_fase9/build_lab_data.mjs a partir dos manifesto.json reais. Não editar à mão.\nwindow.LAB_DATA = ${JSON.stringify(LAB_DATA, null, 1)};\n`);
console.log("lab-data.js escrito em", join(LAB, "lab-data.js"));
console.log("tamerRef:", tamerRef ? tamerRef.src : "não encontrado (seção fica oculta no lab)");
