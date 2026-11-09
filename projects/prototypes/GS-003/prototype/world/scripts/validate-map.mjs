// Map Factory — valida mapas .tmj.json e grava relatório JSON + MD (gates em scripts/map-factory/validate.mjs).
// Uso:
//   npm run map:validate                         todos os mapas de src/data/maps (+ tests/fixtures/maps)
//   npm run map:validate -- vila praia           só esses ids
//   npm run map:validate -- caminho/x.tmj.json   um arquivo (o diretório dele entra no índice de portais)
//   opções: --out <dir> (padrão docs/map-factory/validation), --profile legacy|factory-v1, --no-write
// Sai com código 1 se algum mapa falhar.

import { mkdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { contextFor, loadMaps, loadSpecies, MAPS_DIR, WORLD_DIR } from "./map-factory/context.mjs";
import { reportMarkdown, validateMap } from "./map-factory/validate.mjs";

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  if (i < 0) return undefined;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const flag = (name) => {
  const i = args.indexOf(name);
  if (i >= 0) args.splice(i, 1);
  return i >= 0;
};
const outDir = resolve(WORLD_DIR, opt("--out") ?? "docs/map-factory/validation");
const profile = opt("--profile");
const noWrite = flag("--no-write");

const dirs = [MAPS_DIR, join(WORLD_DIR, "tests/fixtures/maps")];
const ids = [];
for (const a of args) {
  if (a.endsWith(".tmj.json")) {
    const p = resolve(process.cwd(), a);
    if (!dirs.includes(dirname(p))) dirs.push(dirname(p));
    ids.push(basename(p).replace(/\.tmj\.json$/, ""));
  } else ids.push(a);
}
const maps = loadMaps(dirs);
const species = loadSpecies();
const todo = ids.length ? ids : Object.keys(maps);
const results = [];
for (const id of todo) {
  if (!maps[id]) {
    console.error(`mapa '${id}' não encontrado em ${dirs.join(", ")}`);
    process.exitCode = 1;
    continue;
  }
  const r = validateMap(id, maps[id].tmj, { ...contextFor(id, maps, species), ...(profile ? { profile } : {}) });
  r.file = maps[id].path.replace(WORLD_DIR + "/", "");
  results.push(r);
  const bad = r.gates.filter((g) => g.status === "fail");
  console.log(`${r.ok ? "PASS" : "FAIL"} ${id} [${r.profile}] ${r.gates.map((g) => `${g.id}:${g.status}`).join(" ")}`);
  for (const g of bad) for (const e of g.errors) console.log(`   ✗ ${g.id}: ${e}`);
}
if (results.length && !noWrite) {
  mkdirSync(outDir, { recursive: true });
  const date = new Date().toISOString();
  for (const r of results) {
    writeFileSync(join(outDir, `${r.map}.json`), JSON.stringify({ date, ...r }, null, 2) + "\n");
    writeFileSync(join(outDir, `${r.map}.md`), reportMarkdown([r], { title: `Validação — ${r.map}`, date }));
  }
  if (results.length > 1) {
    writeFileSync(join(outDir, "summary.json"), JSON.stringify({ date, ok: results.every((r) => r.ok), maps: results.map((r) => ({ map: r.map, ok: r.ok, profile: r.profile, gates: Object.fromEntries(r.gates.map((g) => [g.id, g.status])) })) }, null, 2) + "\n");
    writeFileSync(join(outDir, "summary.md"), reportMarkdown(results, { title: "Validação de mapas — resumo", date }));
  }
  console.log(`relatórios: ${outDir.replace(WORLD_DIR + "/", "")}/`);
}
if (results.some((r) => !r.ok)) process.exitCode = 1;
