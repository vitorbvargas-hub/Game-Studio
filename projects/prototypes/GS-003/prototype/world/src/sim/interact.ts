// Interativos do mapa (Map Factory): placa, baú, ponto de cura, NPC residente e arena de chefe.
// O mínimo que a sim suporta hoje: chegar perto dispara a interação (sem botão), o efeito é aplicado direto no
// estado autoritativo (bits do jogador, PV/MP da parceira) e o texto volta para a UI mostrar. Puro: sem DOM.

import type { MapArena } from "./map";
import { PX_PER_SUB, SUB } from "./params";
import { getEntity, getPlayer, type WorldSim } from "./world";

/** Alcance da interação: 1,5 tile do centro do Tamer ao ponto. */
export const INTERACT_RADIUS = Math.round(1.5 * SUB);
/** Bits do baú (placeholder até o game-design balancear o loot). */
export const CHEST_BITS = 50;

export type InteractKind = "chest" | "sign" | "heal_point" | "npc" | "arena";

export interface InteractResult {
  id: string;
  kind: InteractKind;
  title: string;
  text: string;
  bits?: number;
  healed?: boolean;
}

/** Interativo ou NPC mais perto do Tamer, dentro do alcance. */
export function nearestInteraction(sim: WorldSim, playerId: string): { id: string; kind: InteractKind } | undefined {
  const p = getPlayer(sim.state, playerId);
  const t = p && getEntity(sim.state, p.tamerId);
  if (!t) return undefined;
  let best: { id: string; kind: InteractKind; d: number } | undefined;
  const consider = (id: string, kind: InteractKind, x: number, y: number) => {
    const d = Math.hypot(t.x - x, t.y - y);
    if (d <= INTERACT_RADIUS && (!best || d < best.d)) best = { id, kind, d };
  };
  for (const it of sim.map.interactables ?? []) consider(it.id, it.kind, it.pos.x, it.pos.y);
  for (const n of sim.map.npcs ?? []) consider(n.id, "npc", n.pos.x, n.pos.y);
  return best && { id: best.id, kind: best.kind };
}

/**
 * Aplica a interação `id` para o jogador. `opened`: baús já abertos (chave `<mapa>:<id>`), mantido pela UI entre
 * mapas. Baú: +CHEST_BITS uma vez. Cura: PV e MP da parceira no máximo (fora de combate). Placa e NPC: só texto.
 */
export function interact(sim: WorldSim, playerId: string, id: string, opened: Set<string>): InteractResult | undefined {
  const p = getPlayer(sim.state, playerId);
  if (!p) return undefined;
  const npc = (sim.map.npcs ?? []).find((n) => n.id === id);
  if (npc) return { id, kind: "npc", title: npc.name, text: npc.dialogue ?? "..." };
  const it = (sim.map.interactables ?? []).find((i) => i.id === id);
  if (!it) return undefined;
  if (it.kind === "sign") return { id, kind: "sign", title: it.title, text: it.text };
  if (it.kind === "chest") {
    const key = `${sim.map.id}:${id}`;
    if (opened.has(key)) return { id, kind: "chest", title: it.title, text: "O baú está vazio." };
    opened.add(key);
    p.bits += CHEST_BITS;
    return { id, kind: "chest", title: it.title, text: `Você encontrou ${CHEST_BITS} bits!`, bits: CHEST_BITS };
  }
  const partner = getEntity(sim.state, p.partnerId);
  if (!partner) return { id, kind: "heal_point", title: it.title, text: "Nenhum Digimon para curar." };
  if (partner.encounterId) return { id, kind: "heal_point", title: it.title, text: "Não dá para se curar no meio de um combate." };
  partner.hp = partner.maxHp;
  partner.mp = partner.maxMp;
  return { id, kind: "heal_point", title: it.title, text: `${partner.name} recuperou PV e MP.`, healed: true };
}

/** Arena de chefe que contém o Tamer (posição em sub-tiles). */
export function arenaOf(sim: WorldSim, playerId: string): MapArena | undefined {
  const p = getPlayer(sim.state, playerId);
  const t = p && getEntity(sim.state, p.tamerId);
  if (!t) return undefined;
  const x = t.x * PX_PER_SUB;
  const y = t.y * PX_PER_SUB;
  return (sim.map.arenas ?? []).find((a) => x >= a.x && x < a.x + a.w && y >= a.y && y < a.y + a.h);
}
