import { loadPack } from "../src/packs";
import type { ContentBundle } from "../src/sim/types";

/** Pacote usado nos testes de regra do motor (monstros originais, ids estáveis). */
export const ENGINE_PACK = "original-b";
export const enginePack = (): ContentBundle => loadPack(ENGINE_PACK);

export class MemoryStorage {
  data = new Map<string, string>();
  getItem(k: string) { return this.data.get(k) ?? null; }
  setItem(k: string, v: string) { this.data.set(k, v); }
  removeItem(k: string) { this.data.delete(k); }
}
