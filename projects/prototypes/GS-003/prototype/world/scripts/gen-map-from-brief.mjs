// Map Factory — gera <id>.tmj.json + <id>.aliases.json a partir de um brief JSON e valida o resultado.
// Uso: npm run map:brief -- <brief.json> [--out <dir>] [--kit <kit>] [--build <x.build.json>] [--no-validate]
//   Aceita os dois formatos de brief:
//   - brief do game-design (world-design/map-brief.schema.json, schemaVersion 1): passa antes pelo adaptador
//     (scripts/map-factory/adapt-brief.mjs) com o kit (--kit, senão build.kit, senão forest-v6 → scripts/map-factory/kits/) e os
//     ajustes de montagem (--build, senão scripts/map-factory/briefs/<id>.build.json se existir). O brief v0.1
//     resultante fica em scripts/map-factory/briefs/adapted/<id>.brief.json (para revisão e reprodução).
//   - brief v0.1 do gerador (scripts/map-factory/brief.schema.json): direto.
//   saída: --out, senão build.out/brief.out (relativo a prototype/world/), senão src/data/maps/
//   aliases: brief.pack.aliasesFrom (id de um mapa de src/data/maps) é a base; pack/prefix/night/extraPacks por cima.
// Sai com código 1 se a validação falhar.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { adaptDesignBrief, isDesignBrief } from "./map-factory/adapt-brief.mjs";
import { contextFor, loadMaps, loadSpecies, MAPS_DIR, WORLD_DIR } from "./map-factory/context.mjs";
import { aliasesFor, generateFromBrief } from "./map-factory/generate.mjs";
import { validateMap } from "./map-factory/validate.mjs";
import { applyLook, lookAliases } from "./map-factory/look.mjs";

const args = process.argv.slice(2);
const opt = (n) => {
  const i = args.indexOf(n);
  return i >= 0 ? args.splice(i, 2)[1] : undefined;
};
const outArg = opt("--out");
const kitOpt = opt("--kit");
const buildArg = opt("--build");
const noValidate = args.includes("--no-validate");
const briefPath = args.find((a) => !a.startsWith("--"));
if (!briefPath) {
  console.error("uso: npm run map:brief -- <brief.json> [--out <dir>] [--kit forest-v6] [--build <x.build.json>] [--no-validate]");
  process.exit(2);
}
const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
let brief = readJson(resolve(process.cwd(), briefPath));
if (isDesignBrief(brief)) {
  const defBuild = join(WORLD_DIR, "scripts/map-factory/briefs", `${brief.id}.build.json`);
  const buildPath = buildArg ? resolve(process.cwd(), buildArg) : existsSync(defBuild) ? defBuild : null;
  let build = buildPath ? readJson(buildPath) : {};
  // build.extends: outra montagem como base (ex. o look v8 por cima da montagem do mapa padrão), campos rasos por cima
  if (build.extends) build = { ...readJson(resolve(dirname(buildPath), build.extends)), ...build, extends: undefined };
  // kit: --kit, senão o da montagem (build.kit), senão forest-v6
  const kitArg = kitOpt ?? build.kit ?? "forest-v6";
  const kitPath = kitArg.endsWith(".json") ? resolve(process.cwd(), kitArg) : join(WORLD_DIR, "scripts/map-factory/kits", `${kitArg}.kit.json`);
  const { brief: adapted, report, warnings } = adaptDesignBrief(brief, readJson(kitPath), build);
  console.log(`brief do game-design '${brief.id}' → v0.1 (kit ${kitArg}${buildPath ? `, montagem ${buildPath.replace(WORLD_DIR + "/", "")}` : ""})`);
  for (const r of report) if (!warnings.includes(r)) console.log(`   · ${r}`);
  for (const w of warnings) console.warn(`   ⚠ ${w}`);
  const adaptedDir = join(WORLD_DIR, "scripts/map-factory/briefs/adapted");
  mkdirSync(adaptedDir, { recursive: true });
  // look (ex. v8): passe de profundidade e troca do chão; o brief adaptado vai para <id>.<look>.brief.json
  if (build.look) applyLook(adapted, build);
  writeFileSync(join(adaptedDir, `${brief.id}${build.look ? `.${build.look.id}` : ""}.brief.json`), JSON.stringify(adapted, null, 2) + "\n");
  brief = adapted;
}
const outDir = outArg ? resolve(process.cwd(), outArg) : resolve(WORLD_DIR, brief.out ?? "src/data/maps");
const baseId = brief.pack?.aliasesFrom;
const basePath = baseId ? join(MAPS_DIR, `${baseId}.aliases.json`) : null;
if (basePath && !existsSync(basePath)) {
  console.error(`pack.aliasesFrom: ${basePath} não existe`);
  process.exit(2);
}

const { tmj, stats } = generateFromBrief(brief);
const aliases = lookAliases(brief, aliasesFor(brief, basePath ? readJson(basePath) : null));
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, `${brief.id}.tmj.json`), JSON.stringify(tmj) + "\n");
writeFileSync(join(outDir, `${brief.id}.aliases.json`), JSON.stringify(aliases, null, 2) + "\n");
console.log(`ok: ${join(outDir, `${brief.id}.tmj.json`).replace(WORLD_DIR + "/", "")} (${stats.size}, ${stats.props} props, ${stats.tiles} tiles; terreno ${Object.entries(stats.terrain).map(([k, v]) => `${k} ${v}`).join(", ")})`);
for (const br of stats.bridges) console.log(`   ponte '${br.name}': ${br.w}×${br.h} em (${br.x},${br.y})`);
if (stats.depth) console.log(`   depth: ${JSON.stringify(stats.depth)}`);

if (!noValidate) {
  const maps = loadMaps([MAPS_DIR, outDir]);
  const r = validateMap(brief.id, tmj, contextFor(brief.id, maps, loadSpecies()));
  console.log(`${r.ok ? "PASS" : "FAIL"} ${brief.id} [${r.profile}] ${r.gates.map((g) => `${g.id}:${g.status}`).join(" ")}`);
  for (const g of r.gates) {
    for (const e of g.errors) console.log(`   ✗ ${g.id}: ${e}`);
    for (const w of g.warnings) console.log(`   ⚠ ${g.id}: ${w}`);
  }
  if (!r.ok) process.exitCode = 1;
}
