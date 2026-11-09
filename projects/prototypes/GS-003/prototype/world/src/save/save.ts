// Save do mundo em localStorage (ou qualquer StorageLike, para testes), no padrão do prototype/game:
// envelope versionado { v, savedAt, game, data } com migrações encadeadas v → v+1 e cópia de segurança do save
// corrompido. Persistido: Tamer (visual + nome + nível/XP), equipe (parceira ativa completa + demais membros),
// golpes (aprendidos, 4 slots, prioridade do AUTO), nível e XP, bits, Digidex (varredura), AUTO e Auto-evoluir.

import { normalizeLook, type TamerLook } from "../assets/tamer-parts";
import type { PartnerSave } from "../sim/world";

export const SAVE_KEY = "gs003.world.save";
export const SAVE_GAME = "gs003-world";
/**
 * v1: primeiro esquema (Tamer, parceira com espécie/nível/XP/4 slots, bits). v2: lista de golpes aprendidos,
 * prioridade do AUTO, Auto-evoluir, XP do Tamer e demais membros da equipe. v3: Digimon inicial escolhido.
 * v4: mapa atual (troca de mapa / Mapa-múndi).
 */
export const SAVE_VERSION = 4;

export interface TeamMember {
  species: string;
  level: number;
  hpPct: number;
}

export interface SaveData {
  tamer: TamerLook;
  tamerLevel: number;
  tamerXp: number;
  bits: number;
  auto: boolean;
  autoEvolve: boolean;
  /** Parceira ativa (estado completo da sim). */
  partner: PartnerSave;
  /** Demais membros da equipe (slots 2–5). */
  team: TeamMember[];
  scans: Record<string, number>;
  captured: string[];
  /** Bebê escolhido na tela "Escolha seu parceiro" (v3); null = save anterior à escolha. */
  starter: string | null;
  /** Mapa onde o Tamer estava (v4): o jogo volta nele, no início padrão do mapa. */
  map: string;
}

export interface SaveEnvelope {
  v: number;
  savedAt: number;
  game: string;
  data: SaveData;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Migrations = Record<number, (env: any) => any>;

export const MIGRATIONS: Migrations = {
  // v1 → v2: os 4 slots viram também a lista de aprendidos; prioridade do AUTO = ordem dos slots; Auto-evoluir
  // desligado; XP do Tamer zerada no nível salvo; equipe extra vazia.
  1: (env) => {
    const d = env.data ?? {};
    const p = d.partner ?? {};
    const moves: (string | null)[] = [0, 1, 2, 3].map((i) => p.moves?.[i] ?? null);
    const learned = moves.filter((m): m is string => !!m);
    return {
      v: 2,
      savedAt: env.savedAt,
      game: env.game ?? SAVE_GAME,
      data: {
        tamer: d.tamer,
        tamerLevel: d.tamerLevel ?? 1,
        tamerXp: 0,
        bits: d.bits ?? 0,
        auto: d.auto ?? false,
        autoEvolve: false,
        partner: { speciesId: p.speciesId, level: p.level ?? 1, xp: p.xp ?? 0, learned, moves, autoRules: learned.map((moveId) => ({ moveId, cond: "always" })) },
        team: [],
        scans: d.scans ?? {},
        captured: d.captured ?? [],
      },
    };
  },
  // v2 → v3: o save é anterior à tela do Digimon inicial (a parceira continua a mesma; inicial desconhecido).
  2: (env) => ({ ...env, v: 3, data: { ...env.data, starter: null } }),
  // v3 → v4: antes da troca de mapa só existia a floresta da prova.
  3: (env) => ({ ...env, v: 4, data: { ...env.data, map: "forest-proof" } }),
};

export function serialize(data: SaveData, now: number): string {
  const env: SaveEnvelope = { v: SAVE_VERSION, savedAt: now, game: SAVE_GAME, data };
  return JSON.stringify(env);
}

export type LoadResult =
  | { ok: true; data: SaveData; savedAt: number; migratedFrom?: number }
  | { ok: false; reason: "empty" | "corrupt" | "future_version" | "wrong_game" | "migration_missing"; detail?: string };

export function deserialize(raw: string | null, migrations: Migrations = MIGRATIONS, current = SAVE_VERSION): LoadResult {
  if (!raw) return { ok: false, reason: "empty" };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let env: any;
  try {
    env = JSON.parse(raw);
  } catch (e) {
    return { ok: false, reason: "corrupt", detail: String(e) };
  }
  if (!env || typeof env.v !== "number" || typeof env.data !== "object" || env.data === null || typeof env.savedAt !== "number")
    return { ok: false, reason: "corrupt", detail: "envelope inválido" };
  if (env.v > current) return { ok: false, reason: "future_version", detail: `save v${env.v} > jogo v${current}` };
  if (env.game && env.game !== SAVE_GAME) return { ok: false, reason: "wrong_game", detail: env.game };
  const from = env.v;
  while (env.v < current) {
    const m = migrations[env.v];
    if (!m) return { ok: false, reason: "migration_missing", detail: `sem migração v${env.v}` };
    env = m(env);
  }
  const d = env.data as SaveData;
  const p = d.partner;
  if (!p || typeof p.speciesId !== "string" || typeof p.level !== "number" || !Array.isArray(p.learned) || !Array.isArray(p.moves))
    return { ok: false, reason: "corrupt", detail: "parceira inválida" };
  const data: SaveData = {
    ...d,
    tamer: normalizeLook(d.tamer ?? {}),
    tamerLevel: Math.max(1, Math.floor(d.tamerLevel ?? 1)),
    tamerXp: Math.max(0, Math.floor(d.tamerXp ?? 0)),
    bits: Math.max(0, Math.floor(d.bits ?? 0)),
    team: Array.isArray(d.team) ? d.team : [],
    scans: d.scans ?? {},
    captured: Array.isArray(d.captured) ? d.captured : [],
    starter: typeof d.starter === "string" ? d.starter : null,
    map: typeof d.map === "string" && d.map ? d.map : "forest-proof",
  };
  return from !== current ? { ok: true, data, savedAt: env.savedAt, migratedFrom: from } : { ok: true, data, savedAt: env.savedAt };
}

export function saveToStorage(storage: StorageLike, data: SaveData, now: number): void {
  storage.setItem(SAVE_KEY, serialize(data, now));
}

/** Carrega; se o save estiver corrompido ou for de versão futura, guarda uma cópia em `<chave>.corrupt`. */
export function loadFromStorage(storage: StorageLike): LoadResult {
  const raw = storage.getItem(SAVE_KEY);
  const res = deserialize(raw);
  if (!res.ok && res.reason !== "empty" && raw) storage.setItem(`${SAVE_KEY}.corrupt`, raw);
  return res;
}

/** localStorage, se existir e aceitar escrita (modo privado/cota cheia → sem save, o jogo segue). */
export function browserStorage(): StorageLike | undefined {
  try {
    const s = globalThis.localStorage;
    const k = `${SAVE_KEY}.probe`;
    s.setItem(k, "1");
    s.removeItem(k);
    return s;
  } catch {
    return undefined;
  }
}
