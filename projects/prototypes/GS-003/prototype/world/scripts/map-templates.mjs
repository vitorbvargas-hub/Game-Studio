// Map Factory — gera os 5 modelos do game-design (world-design/briefs/templates/*.json) como mapas de TESTE com o
// adaptador + kit forest-v6, valida todos e escreve o relatório (o que passou, o que falhou e por quê).
// Uso: npm run map:templates [-- --kit forest-v6] [--preview]
//   saída: tests/fixtures/maps/templates/<id>.tmj.json + .aliases.json (não registrados no jogo)
//          scripts/map-factory/briefs/adapted/<id>.brief.json, docs/map-factory/templates-report.{md,json}
//          --preview: docs/map-factory/previews/<id>.png
// Sai com código 0 mesmo com falhas: o relatório é o resultado (as falhas esperadas estão documentadas nele).

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { adaptDesignBrief } from "./map-factory/adapt-brief.mjs";
import { contextFor, loadMaps, loadSpecies, MAPS_DIR, WORLD_DIR } from "./map-factory/context.mjs";
import { aliasesFor, generateFromBrief } from "./map-factory/generate.mjs";
import { validateMap } from "./map-factory/validate.mjs";

const args = process.argv.slice(2);
const ki = args.indexOf("--kit");
const kitId = ki >= 0 ? args[ki + 1] : "forest-v6";
const preview = args.includes("--preview");
const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
const TEMPLATES = join(WORLD_DIR, "../../world-design/briefs/templates");
const OUT = join(WORLD_DIR, "tests/fixtures/maps/templates");
const kit = readJson(join(WORLD_DIR, "scripts/map-factory/kits", `${kitId}.kit.json`));

mkdirSync(OUT, { recursive: true });
mkdirSync(join(WORLD_DIR, "scripts/map-factory/briefs/adapted"), { recursive: true });
const generated = [];
for (const f of readdirSync(TEMPLATES).filter((n) => n.endsWith(".json")).sort()) {
  const gd = readJson(join(TEMPLATES, f));
  const { brief, report } = adaptDesignBrief(gd, kit, {});
  writeFileSync(join(WORLD_DIR, "scripts/map-factory/briefs/adapted", `${gd.id}.brief.json`), JSON.stringify(brief, null, 2) + "\n");
  const { tmj, stats } = generateFromBrief(brief);
  writeFileSync(join(OUT, `${gd.id}.tmj.json`), JSON.stringify(tmj) + "\n");
  writeFileSync(join(OUT, `${gd.id}.aliases.json`), JSON.stringify(aliasesFor(brief, readJson(join(MAPS_DIR, `${brief.pack.aliasesFrom}.aliases.json`))), null, 2) + "\n");
  generated.push({ id: gd.id, file: f, biome: gd.biome, size: stats.size, report });
}

const maps = loadMaps([MAPS_DIR, OUT]);
const species = loadSpecies();
const rows = [];
for (const g of generated) {
  const r = validateMap(g.id, maps[g.id].tmj, contextFor(g.id, maps, species));
  rows.push({ ...g, ok: r.ok, gates: Object.fromEntries(r.gates.map((x) => [x.id, x.status])), errors: r.gates.flatMap((x) => x.errors.map((e) => `${x.id}: ${e}`)), warnings: r.gates.flatMap((x) => x.warnings.map((e) => `${x.id}: ${e}`)) });
  console.log(`${r.ok ? "PASS" : "FAIL"} ${g.id} (${g.biome}, ${g.size}) ${r.gates.map((x) => `${x.id}:${x.status}`).join(" ")}`);
  for (const e of rows.at(-1).errors) console.log(`   ✗ ${e}`);
  if (preview) execFileSync(process.execPath, [join(WORLD_DIR, "scripts/map-preview.mjs"), join(OUT, `${g.id}.tmj.json`)], { stdio: "inherit" });
}

const GATES = ["layers", "tile_ids", "asset_keys", "reach", "placement", "wang", "species", "portals"];
const md = [
  "# Map Factory — modelos do game-design gerados como mapas de teste",
  "",
  `Gerado por \`npm run map:templates\` (kit \`${kitId}\`). Fonte: \`world-design/briefs/templates/*.json\` (schema oficial v1) → \`scripts/map-factory/adapt-brief.mjs\` → gerador → validador. Saída em \`tests/fixtures/maps/templates/\` (não registrada no jogo).`,
  "",
  "Todos usam a arte de floresta (forest-v4 + forest-v6): não há kit de caverna, deserto, montanha ou vila na Map Factory ainda. O teste é da planta (zonas, rotas, alcance, colocação, espécies e portais), não do visual do bioma.",
  "",
  `| Modelo | Bioma | Tamanho | ${GATES.join(" | ")} | Resultado |`,
  `|---|---|---|${GATES.map(() => "---").join("|")}|---|`,
  ...rows.map((r) => `| \`${r.id}\` | ${r.biome} | ${r.size} | ${GATES.map((g) => (r.gates[g] === "pass" ? "✅" : "❌")).join(" | ")} | ${r.ok ? "PASS" : "FAIL"} |`),
  "",
  "## Falhas e motivos",
  "",
  ...rows.flatMap((r) => (r.ok ? [] : [`### ${r.id}`, "", ...r.errors.map((e) => `- ${e}`), ""])),
  ...(rows.every((r) => r.ok) ? ["Nenhuma.", ""] : []),
  "## Decisões do adaptador por modelo",
  "",
  ...rows.flatMap((r) => [`- \`${r.id}\`: ${r.report.length ? r.report.join("; ") : "sem ajuste"}`]),
  "",
];
mkdirSync(join(WORLD_DIR, "docs/map-factory"), { recursive: true });
writeFileSync(join(WORLD_DIR, "docs/map-factory/templates-report.md"), md.join("\n"));
writeFileSync(join(WORLD_DIR, "docs/map-factory/templates-report.json"), JSON.stringify(rows.map(({ report, ...r }) => ({ ...r, adapter: report })), null, 2) + "\n");
console.log("relatório: docs/map-factory/templates-report.md");
