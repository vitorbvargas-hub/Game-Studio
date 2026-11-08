// Save versionado em localStorage (ou qualquer StorageLike, para testes).
// Envelope: { v, savedAt, pack, packVersion, state }. Migrações encadeadas v -> v+1.
// Cada content pack tem seu próprio save (chave gs003.save.<packId>).

import type { GameState } from "./types";

export const SAVE_VERSION = 3;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface SaveEnvelope {
  v: number;
  savedAt: number;
  pack: string;
  packVersion: string;
  state: GameState;
}

/** migrations[n] converte um envelope da versão n para n+1. */
export type Migrations = Record<number, (env: any) => any>;

/** v1 (esqueleto inicial) usava "linhas"; v2 usa content packs. */
const LEGACY_LINE_TO_PACK: Record<string, string> = { "line-b": "original-b", "line-a": "original-a" };

export const MIGRATIONS: Migrations = {
  1: (env) => {
    const { line, ...state } = env.state;
    const pack = LEGACY_LINE_TO_PACK[line] ?? line;
    return { v: 2, savedAt: env.savedAt, pack, packVersion: "0", state: { ...state, pack } };
  },
  // v3: decisões do onboarding (parceiro inicial, Varredura, escolha de encontro). Saves antigos já têm time.
  2: (env) => {
    const s = env.state;
    const recruited = [...new Set<string>((s.party ?? []).map((p: { speciesId: string }) => p.speciesId))];
    return {
      ...env,
      v: 3,
      state: { ...s, starterPending: false, scan: {}, recruited, encounter: null, winsSinceEncounter: 0, encountersChosen: 0 },
    };
  },
};

export function saveKey(packId: string): string {
  return `gs003.save.${packId}`;
}

export function serialize(state: GameState, now: number, packVersion = "0"): string {
  const env: SaveEnvelope = { v: SAVE_VERSION, savedAt: now, pack: state.pack, packVersion, state };
  return JSON.stringify(env);
}

export type LoadResult =
  | { ok: true; state: GameState; migratedFrom?: number }
  | { ok: false; reason: "empty" | "corrupt" | "future_version" | "wrong_pack" | "migration_missing"; detail?: string };

export function deserialize(
  raw: string | null,
  expectedPack: string,
  migrations: Migrations = MIGRATIONS,
  current: number = SAVE_VERSION,
): LoadResult {
  if (!raw) return { ok: false, reason: "empty" };
  let env: any;
  try {
    env = JSON.parse(raw);
  } catch (e) {
    return { ok: false, reason: "corrupt", detail: String(e) };
  }
  if (!env || typeof env.v !== "number" || typeof env.state !== "object" || env.state === null) {
    return { ok: false, reason: "corrupt", detail: "envelope inválido" };
  }
  if (env.v > current) return { ok: false, reason: "future_version", detail: `save v${env.v} > jogo v${current}` };
  const from = env.v;
  while (env.v < current) {
    const m = migrations[env.v];
    if (!m) return { ok: false, reason: "migration_missing", detail: `sem migração v${env.v}` };
    env = m(env);
  }
  if (env.pack !== expectedPack) return { ok: false, reason: "wrong_pack", detail: env.pack };
  const s = env.state as GameState;
  if (!Array.isArray(s.party) || typeof s.rngState !== "number") {
    return { ok: false, reason: "corrupt", detail: "estado inválido" };
  }
  return from !== current ? { ok: true, state: s, migratedFrom: from } : { ok: true, state: s };
}

export function saveToStorage(storage: StorageLike, state: GameState, now: number, packVersion = "0"): void {
  state.lastSeenAt = now;
  storage.setItem(saveKey(state.pack), serialize(state, now, packVersion));
}

/** Carrega; se o save estiver corrompido, guarda uma cópia em `<key>.corrupt` para não perder dados. */
export function loadFromStorage(storage: StorageLike, packId: string): LoadResult {
  const key = saveKey(packId);
  const raw = storage.getItem(key);
  const res = deserialize(raw, packId);
  if (!res.ok && res.reason !== "empty" && raw) storage.setItem(`${key}.corrupt`, raw);
  return res;
}
