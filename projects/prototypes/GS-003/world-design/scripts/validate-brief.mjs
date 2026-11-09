#!/usr/bin/env node
// Validador leve de um map-brief contra map-brief.schema.json — NÃO é um motor de JSON Schema genérico
// (não lê $ref/if-then do arquivo .schema.json em runtime), é uma checagem manual que espelha as mesmas
// regras, escrita para não precisar instalar ajv ou qualquer outra dependência nova (ADR-011 §4/§6).
// Uso: node scripts/validate-brief.mjs <arquivo1.json> [arquivo2.json ...]

import { readFileSync } from "node:fs";

const ZONE_TYPES = new Set([
  "spawn_area", "clearing", "concentration", "secret", "boss_arena",
  "water", "rock_field", "village_hub", "dense_border", "cave_floor",
  "dune", "cliff", "other",
]);
const DENSITY = new Set(["low", "medium", "high"]);
const EDGES = new Set(["n", "e", "s", "w"]);

function fail(errors, msg) {
  errors.push(msg);
}

function checkRect(r, path, errors) {
  if (typeof r !== "object" || r === null) return fail(errors, `${path}: rect ausente ou inválido`);
  for (const k of ["x", "y", "width", "height"]) {
    if (typeof r[k] !== "number") fail(errors, `${path}.${k}: esperado número`);
  }
}

function checkTileCoord(c, path, errors) {
  if (!Array.isArray(c) || c.length !== 2 || c.some((n) => typeof n !== "number")) {
    fail(errors, `${path}: esperado [x,y] numérico`);
  }
}

function validateBrief(brief, file) {
  const errors = [];
  const W = brief.dimensions?.widthTiles;
  const H = brief.dimensions?.heightTiles;

  for (const k of ["schemaVersion", "id", "name", "biome", "dimensions", "zones", "routes", "designGates"]) {
    if (!(k in brief)) fail(errors, `campo obrigatório ausente: ${k}`);
  }
  if (brief.schemaVersion !== 1) fail(errors, "schemaVersion deve ser 1");
  if (brief.dimensions) {
    if (brief.dimensions.tileSizePx !== 32) fail(errors, "dimensions.tileSizePx deve ser 32");
    if (!(W >= 8) || !(H >= 8)) fail(errors, "dimensions.widthTiles/heightTiles devem ser >= 8");
  }

  const zoneIds = new Set();
  for (const z of brief.zones ?? []) {
    zoneIds.add(z.id);
    if (!ZONE_TYPES.has(z.type)) fail(errors, `zone ${z.id}: type '${z.type}' não está no enum`);
    if (z.shape === "rect") checkRect(z.rect, `zone ${z.id}`, errors);
    else if (z.shape === "polygon") {
      if (!z.polygon?.points?.length) fail(errors, `zone ${z.id}: polygon.points ausente`);
    } else fail(errors, `zone ${z.id}: shape deve ser 'rect' ou 'polygon'`);
    if (W && H && z.shape === "rect" && z.rect) {
      const { x, y, width, height } = z.rect;
      if (x < 0 || y < 0 || x + width > W || y + height > H) {
        fail(errors, `zone ${z.id}: rect fora dos limites do mapa (${W}x${H})`);
      }
    }
  }

  for (const r of brief.routes ?? []) {
    if (!["main", "secondary"].includes(r.type)) fail(errors, `route ${r.id}: type inválido`);
    if (!Array.isArray(r.waypoints) || r.waypoints.length < 2) fail(errors, `route ${r.id}: precisa de >=2 waypoints`);
    for (const wp of r.waypoints ?? []) checkTileCoord(wp, `route ${r.id} waypoint`, errors);
    for (const zref of r.connectsZones ?? []) {
      if (!zoneIds.has(zref)) fail(errors, `route ${r.id}: connectsZones referencia zone inexistente '${zref}'`);
    }
  }
  if (!brief.routes?.some((r) => r.type === "main")) fail(errors, "nenhuma route do tipo 'main'");

  for (const s of brief.spawns ?? []) {
    if (!s.speciesId) fail(errors, `spawn ${s.id}: speciesId ausente`);
    if (!DENSITY.has(s.density)) fail(errors, `spawn ${s.id}: density inválida`);
    if (s.zoneRef && !zoneIds.has(s.zoneRef)) fail(errors, `spawn ${s.id}: zoneRef '${s.zoneRef}' não existe`);
    if (!["E", "H"].includes(s.evidence)) fail(errors, `spawn ${s.id}: evidence deve ser 'E' ou 'H'`);
  }

  for (const n of brief.npcs ?? []) {
    if (!["digimon_resident", "tamer"].includes(n.kind)) fail(errors, `npc ${n.id}: kind inválido`);
    if (n.zoneRef && !zoneIds.has(n.zoneRef)) fail(errors, `npc ${n.id}: zoneRef '${n.zoneRef}' não existe`);
  }

  for (const it of brief.interactables ?? []) {
    if (!["chest", "sign", "heal_point", "other"].includes(it.type)) fail(errors, `interactable ${it.id}: type inválido`);
    if (it.zoneRef && !zoneIds.has(it.zoneRef)) fail(errors, `interactable ${it.id}: zoneRef '${it.zoneRef}' não existe`);
  }

  if (brief.bossArena) {
    if (!brief.bossArena.bossId) fail(errors, "bossArena.bossId ausente");
    if (brief.bossArena.zoneRef && !zoneIds.has(brief.bossArena.zoneRef)) {
      fail(errors, `bossArena: zoneRef '${brief.bossArena.zoneRef}' não existe`);
    }
  }

  for (const e of brief.exits ?? []) {
    if (!EDGES.has(e.edge)) fail(errors, `exit ${e.id}: edge inválido`);
    checkRect(e.rect, `exit ${e.id}`, errors);
    if (!e.to) fail(errors, `exit ${e.id}: 'to' ausente`);
    if (!e.toStart) fail(errors, `exit ${e.id}: 'toStart' ausente`);
    if (typeof e.integrated !== "boolean") fail(errors, `exit ${e.id}: 'integrated' deve ser booleano`);
  }

  if (brief.designGates) {
    for (const k of ["spawnToBossMainRoute", "altRouteToBossExists", "allPoisReachableByDesign"]) {
      if (typeof brief.designGates[k] !== "boolean") fail(errors, `designGates.${k} deve ser booleano`);
    }
  }

  console.log(`${errors.length === 0 ? "OK " : "FALHOU "}${file} (${brief.id ?? "?"})`);
  for (const e of errors) console.log(`  - ${e}`);
  return errors.length === 0;
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("uso: node scripts/validate-brief.mjs <arquivo1.json> [...]");
  process.exit(2);
}
let allOk = true;
for (const f of files) {
  const brief = JSON.parse(readFileSync(f, "utf8"));
  if (!validateBrief(brief, f)) allOk = false;
}
process.exit(allOk ? 0 : 1);
