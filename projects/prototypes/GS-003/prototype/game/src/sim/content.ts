// Montagem e validação de content packs. O motor não conhece nenhum pacote específico:
// só recebe um ContentBundle validado (pack.json + strings.json + dados + sprites).

import { ENCOUNTER_STRINGS, REQUIRED_STRINGS, SCAN_STRINGS, STARTER_STRINGS, TRAINING_STRINGS } from "./strings";
import type {
  AreaDef,
  BalanceDef,
  BossDef,
  ContentBundle,
  CreatureDef,
  DungeonDef,
  EnemyDef,
  PackManifest,
  SkillDef,
  SpriteSource,
  Strings,
  ThemeDef,
  WaveDef,
} from "./types";
import { ANIM_NAMES } from "./types";

export interface RawContent {
  pack: PackManifest;
  strings: Strings;
  /** Sprites encontrados na pasta do pacote: caminho relativo -> URL. */
  assets?: Record<string, string>;
  theme: ThemeDef;
  balance: BalanceDef;
  creatures: CreatureDef[];
  skills: SkillDef[];
  enemies: EnemyDef[];
  areas: AreaDef[];
  dungeons: DungeonDef[];
}

function indexById<T extends { id: string }>(list: T[], label: string, errors: string[]): Record<string, T> {
  const out: Record<string, T> = {};
  for (const item of list) {
    if (out[item.id]) errors.push(`${label}: id duplicado "${item.id}"`);
    out[item.id] = item;
  }
  return out;
}

export function buildContent(raw: RawContent): ContentBundle {
  const errors: string[] = [];
  const bundle: ContentBundle = {
    pack: raw.pack,
    strings: raw.strings ?? {},
    assets: raw.assets ?? {},
    theme: raw.theme,
    balance: raw.balance,
    creatures: indexById(raw.creatures, "creatures", errors),
    skills: indexById(raw.skills, "skills", errors),
    enemies: indexById(raw.enemies, "enemies", errors),
    areas: indexById(raw.areas, "areas", errors),
    dungeons: indexById(raw.dungeons, "dungeons", errors),
  };
  errors.push(...validateContent(bundle));
  if (errors.length) throw new Error(`Content pack inválido (${raw.pack?.id}):\n- ${errors.join("\n- ")}`);
  return bundle;
}

export function validateContent(c: ContentBundle): string[] {
  const e: string[] = [];
  const aff = new Set(c.theme.affinities.map((a) => a.id));
  const skill = (id: string, where: string) => {
    if (!c.skills[id]) e.push(`${where}: habilidade inexistente "${id}"`);
  };
  const enemy = (id: string, where: string) => {
    if (!c.enemies[id]) e.push(`${where}: inimigo inexistente "${id}"`);
  };
  const affinity = (id: string, where: string) => {
    if (!aff.has(id)) e.push(`${where}: afinidade inexistente "${id}"`);
  };
  const waves = (ws: WaveDef[], where: string) => {
    if (!ws.length) e.push(`${where}: sem ondas`);
    ws.forEach((w, i) => {
      if (w.enemies.length < 1 || w.enemies.length > 3) e.push(`${where}.waves[${i}]: 1–3 inimigos`);
      w.enemies.forEach((id) => enemy(id, `${where}.waves[${i}]`));
    });
  };
  const boss = (b: BossDef, where: string) => {
    enemy(b.enemyId, where);
    b.escorts?.forEach((x) => enemy(x.enemyId, `${where}.escorts`));
    b.syncOptions.forEach((id) => skill(id, `${where}.syncOptions`));
    if (!b.syncOptions.length && b.decisionAtHpPct.length) e.push(`${where}: decisões sem opções`);
  };

  // Manifesto e regras de fan pack (ADR-007: não comercial + aviso de não afiliação).
  const p = c.pack;
  if (!p?.id || !/^[a-z0-9-]+$/.test(p.id)) e.push(`pack.id ausente ou inválido`);
  if (!p?.name || !p?.version) e.push(`pack: name e version obrigatórios`);
  if (p?.kind !== "fan" && p?.kind !== "original") e.push(`pack.kind deve ser "fan" ou "original"`);
  if (p?.kind === "fan") {
    if (p.nonCommercial !== true) e.push(`pack ${p.id}: fan pack exige nonCommercial: true`);
    if (!p.disclaimer?.trim()) e.push(`pack ${p.id}: fan pack exige disclaimer`);
  }
  for (const k of REQUIRED_STRINGS) if (typeof c.strings[k] !== "string") e.push(`strings: chave obrigatória ausente "${k}"`);
  const frameList = (ref: unknown, where: string) => {
    const frames = typeof ref === "string" ? [ref] : ref;
    if (!Array.isArray(frames) || !frames.length) e.push(`${where}: sprite deve ser um caminho ou lista não vazia de frames`);
    else for (const path of frames) if (!c.assets[path]) e.push(`${where}: sprite não encontrado no pacote "${path}"`);
  };
  const positiveMs = (ms: unknown, where: string) => {
    if (ms !== undefined && !(typeof ms === "number" && ms > 0)) e.push(`${where} deve ser > 0`);
  };
  const sprite = (def: SpriteSource, where: string) => {
    if (def.sprite !== undefined) frameList(def.sprite, where);
    positiveMs(def.spriteFrameMs, `${where}: spriteFrameMs`);
    for (const [name, ref] of Object.entries(def.anims ?? {})) {
      if (!(ANIM_NAMES as readonly string[]).includes(name)) e.push(`${where}.anims: animação desconhecida "${name}" (use ${ANIM_NAMES.join("/")})`);
      else frameList(ref, `${where}.anims.${name}`);
    }
    for (const [name, ms] of Object.entries(def.animFrameMs ?? {})) {
      if (!(ANIM_NAMES as readonly string[]).includes(name)) e.push(`${where}.animFrameMs: animação desconhecida "${name}"`);
      else positiveMs(ms, `${where}: animFrameMs.${name}`);
    }
  };

  skill(c.balance.basicSkillId, "balance.basicSkillId");
  for (const [a, row] of Object.entries(c.theme.affinityChart)) {
    affinity(a, "theme.affinityChart");
    Object.keys(row).forEach((d) => affinity(d, `theme.affinityChart.${a}`));
  }
  for (const s of Object.values(c.skills)) if (s.affinity) affinity(s.affinity, `skills.${s.id}`);
  for (const cr of Object.values(c.creatures)) {
    affinity(cr.affinity, `creatures.${cr.id}`);
    sprite(cr, `creatures.${cr.id}`);
    cr.skills.forEach((id) => skill(id, `creatures.${cr.id}`));
    cr.evolutions?.forEach((ev) => {
      const to = c.creatures[ev.to];
      if (!to) e.push(`creatures.${cr.id}: evolução para inexistente "${ev.to}"`);
      else if (to.stage <= cr.stage) e.push(`creatures.${cr.id}: evolução deve subir de estágio`);
    });
  }
  for (const en of Object.values(c.enemies)) {
    affinity(en.affinity, `enemies.${en.id}`);
    sprite(en, `enemies.${en.id}`);
    if (en.recruitAs !== undefined && !c.creatures[en.recruitAs]) e.push(`enemies.${en.id}.recruitAs: criatura inexistente "${en.recruitAs}"`);
    en.skills.forEach((id) => skill(id, `enemies.${en.id}`));
  }
  for (const ar of Object.values(c.areas)) {
    waves(ar.waves, `areas.${ar.id}`);
    if (ar.boss) boss(ar.boss, `areas.${ar.id}.boss`);
    const bd = ar.unlock?.bossDefeatedIn;
    if (bd && !c.areas[bd]) e.push(`areas.${ar.id}.unlock: área inexistente "${bd}"`);
    const ec = ar.encounterChoice;
    if (ec && !(ec.firstAfterWins >= 0 && ec.everyWins >= 1 && ec.autoPickAfterTicks >= 1)) e.push(`areas.${ar.id}.encounterChoice: valores inválidos`);
    if (ec && ar.waves.length < 2) e.push(`areas.${ar.id}.encounterChoice: exige 2+ ondas`);
  }
  for (const d of Object.values(c.dungeons)) {
    if (!c.areas[d.unlockAreaId]) e.push(`dungeons.${d.id}: área inexistente "${d.unlockAreaId}"`);
    d.floors.forEach((f) => waves(f.waves, `dungeons.${d.id}.${f.id}`));
    boss(d.boss, `dungeons.${d.id}.boss`);
  }
  if (!c.areas[c.theme.startingAreaId]) e.push(`theme.startingAreaId inexistente`);
  if (c.theme.startingParty.length < 1 || c.theme.startingParty.length > 3) e.push(`theme.startingParty: 1–3 criaturas`);
  c.theme.startingParty.forEach((id) => {
    if (!c.creatures[id]) e.push(`theme.startingParty: criatura inexistente "${id}"`);
  });
  c.theme.starterOptions?.forEach((id) => {
    if (!c.creatures[id]) e.push(`theme.starterOptions: criatura inexistente "${id}"`);
  });
  const sc = c.balance.scan;
  if (sc && !(sc.pctPerEncounter > 0 && sc.partyMax >= 1 && sc.partyMax <= 3)) e.push(`balance.scan: pctPerEncounter > 0 e partyMax 1–3`);
  const tr = c.balance.training;
  if (tr && !(tr.pointsPerLevel >= 1 && tr.pctPerPoint > 0 && tr.capPerCreature >= 1)) e.push(`balance.training: valores inválidos`);
  // Textos das decisões do onboarding só são exigidos de pacotes que ligam esses sistemas.
  const need = (on: unknown, keys: readonly string[]) => {
    if (on) for (const k of keys) if (typeof c.strings[k] !== "string") e.push(`strings: chave obrigatória ausente "${k}"`);
  };
  need(c.theme.starterOptions?.length, STARTER_STRINGS);
  need(Object.values(c.areas).some((a) => a.encounterChoice), ENCOUNTER_STRINGS);
  need(sc, SCAN_STRINGS);
  need(tr, TRAINING_STRINGS);
  return e;
}
