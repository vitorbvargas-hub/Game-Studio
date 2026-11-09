// Map Factory — gera <id>.tmj.json + <id>.aliases.json a partir de um brief JSON e valida o resultado.
// Uso: npm run map:brief -- <brief.json> [--out <dir>] [--no-validate]
//   saída: --out, senão brief.out (relativo a prototype/world/), senão src/data/maps/
//   aliases: brief.pack.aliasesFrom (id de um mapa de src/data/maps) é a base; pack/prefix/night do brief por cima.
// Interface do brief: scripts/map-factory/brief.schema.json. Sai com código 1 se a validação falhar.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { contextFor, loadMaps, loadSpecies, MAPS_DIR, WORLD_DIR } from "./map-factory/context.mjs";
import { aliasesFor, generateFromBrief } from "./map-factory/generate.mjs";
import { validateMap } from "./map-factory/validate.mjs";

const args = process.argv.slice(2);
const oi = args.indexOf("--out");
const outArg = oi >= 0 ? args.splice(oi, 2)[1] : undefined;
const noValidate = args.includes("--no-validate");
const briefPath = args.find((a) => !a.startsWith("--"));
if (!briefPath) {
  console.error("uso: npm run map:brief -- <brief.json> [--out <dir>] [--no-validate]");
  process.exit(2);
}
const brief = JSON.parse(readFileSync(resolve(process.cwd(), briefPath), "utf8"));
const outDir = outArg ? resolve(process.cwd(), outArg) : resolve(WORLD_DIR, brief.out ?? "src/data/maps");
const baseId = brief.pack?.aliasesFrom;
const basePath = baseId ? join(MAPS_DIR, `${baseId}.aliases.json`) : null;
if (basePath && !existsSync(basePath)) {
  console.error(`pack.aliasesFrom: ${basePath} não existe`);
  process.exit(2);
}

const { tmj, stats } = generateFromBrief(brief);
const aliases = aliasesFor(brief, basePath ? JSON.parse(readFileSync(basePath, "utf8")) : null);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, `${brief.id}.tmj.json`), JSON.stringify(tmj) + "\n");
writeFileSync(join(outDir, `${brief.id}.aliases.json`), JSON.stringify(aliases, null, 2) + "\n");
console.log(`ok: ${join(outDir, `${brief.id}.tmj.json`).replace(WORLD_DIR + "/", "")} (${stats.size}, ${stats.props} props, ${stats.tiles} tiles; terreno ${Object.entries(stats.terrain).map(([k, v]) => `${k} ${v}`).join(", ")})`);

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
