// Conteúdo das telas secundárias (pt-BR, estilo IdleDex) — HTML puro a partir de dados; o main abre cada uma num
// Panel e liga os botões (data-*). Digivice/Bestiário, Inventário (economy.json), Missões (quests.json, com
// progresso real) e Configurações. Os retratos são canvases [data-sp] pintados depois pelo portrait do HUD.

import economyJson from "../data/content/economy.json";
import { itemName, type QuestView } from "../save/questlog";
import type { WorldContent } from "../sim/species";
import { REGIONS } from "../world/regions";
import { icon } from "./icons";
import { AFFINITY_PT, STAGE_PT } from "./starter";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const fmt = (n: number) => n.toLocaleString("pt-BR");
const ELEMENT_PT: Record<string, string> = { neutral: "Neutro", fire: "Fogo", ice: "Gelo", water: "Água", wind: "Vento", light: "Luz", thunder: "Trovão", dark: "Trevas" };

// ---------- Digivice / Bestiário ----------

export interface DexState {
  seen: string[];
  scans: Record<string, number>;
  captured: string[];
}

export function dexSummary(content: WorldContent, s: DexState): { total: number; seen: number; scanned: number; pct: number } {
  const ids = Object.keys(content.species);
  const total = ids.length;
  const seen = ids.filter((id) => s.seen.includes(id) || (s.scans[id] ?? 0) > 0).length;
  const scanned = ids.filter((id) => s.captured.includes(id)).length;
  const pct = Math.round(ids.reduce((a, id) => a + Math.min(100, s.scans[id] ?? 0), 0) / total);
  return { total, seen, scanned, pct };
}

export function digiviceHtml(content: WorldContent, s: DexState, selected?: string): string {
  const ids = Object.keys(content.species).sort();
  const sum = dexSummary(content, s);
  const sel = selected && content.species[selected] ? selected : ids.find((id) => s.seen.includes(id)) ?? ids[0];
  const cards = ids
    .map((id, i) => {
      const sp = content.species[id];
      const seen = s.seen.includes(id) || (s.scans[id] ?? 0) > 0;
      const pct = Math.min(100, s.scans[id] ?? 0);
      return `<button type="button" class="dx-card${seen ? "" : " unseen"}${id === sel ? " sel" : ""}${pct >= 100 ? " done" : ""}" data-dex="${id}" title="${seen ? esc(sp.name) : "???"}">
        <span class="dx-no">Nº ${String(i + 1).padStart(3, "0")}</span>
        <canvas width="44" height="44" data-sp="${id}" ${seen ? "" : 'data-silhouette="1"'}></canvas>
        <b>${seen ? esc(sp.name) : "???"}</b>
        <div class="dx-bar"><i style="width:${pct}%"></i></div>
      </button>`;
    })
    .join("");
  return `<div class="dex">
    <div class="dx-head">
      <div class="dx-stat"><span>Vistos</span><b data-testid="dx-seen">${sum.seen}/${sum.total}</b></div>
      <div class="dx-stat"><span>Escaneados</span><b data-testid="dx-scanned">${sum.scanned}/${sum.total}</b></div>
      <div class="dx-stat wide"><span>Varredura total</span><div class="dx-bar big"><i style="width:${sum.pct}%"></i></div><b data-testid="dx-pct">${sum.pct}%</b></div>
    </div>
    <div class="dx-body"><div class="dx-grid">${cards}</div><div class="dx-detail">${dexDetailHtml(content, s, sel)}</div></div>
  </div>`;
}

export function dexDetailHtml(content: WorldContent, s: DexState, id: string): string {
  const sp = content.species[id];
  if (!sp) return "";
  const seen = s.seen.includes(id) || (s.scans[id] ?? 0) > 0;
  if (!seen) return `<div class="dx-sheet"><canvas class="big" width="96" height="96" data-sp="${id}" data-silhouette="1"></canvas><h3>???</h3><p class="note">Ainda não visto. Encontre este Digimon num mapa para registrá-lo no Digivice.</p></div>`;
  const pct = Math.min(100, s.scans[id] ?? 0);
  const where = REGIONS.filter((r) => r.wildSpecies.some((w) => w.speciesId === id)).map((r) => r.name);
  const moves = (content.moves.learnsets[id] ?? []).map((l) => content.moves.moves[l.move]?.name ?? l.move);
  const evo = content.moves.evolutions[id];
  return `<div class="dx-sheet">
    <canvas class="big" width="96" height="96" data-sp="${id}"></canvas>
    <h3>${esc(sp.name)}</h3>
    <div class="chips"><span class="chip">${STAGE_PT[sp.stage] ?? `Estágio ${sp.stage}`}</span><span class="chip aff-${sp.affinity}" data-testid="dx-aff">${AFFINITY_PT[sp.affinity] ?? sp.affinity}</span><span class="chip">${ELEMENT_PT[content.moves.speciesElement[id] ?? "neutral"] ?? "Neutro"}</span></div>
    <div class="row"><label>Varredura</label><div class="dx-bar big"><i style="width:${pct}%"></i></div><em data-testid="dx-detail-pct">${pct}%</em></div>
    <p>${pct >= 100 ? "Dados completos: espécie registrada." : "Derrote mais deste Digimon para completar a varredura."}</p>
    ${evo && content.species[evo.to] ? `<p><b>Evolui:</b> ${esc(content.species[evo.to].name)} (Nv.${evo.level})</p>` : ""}
    <p><b>Golpes:</b> ${moves.length ? moves.map(esc).join(", ") : "—"}</p>
    <p><b>Onde:</b> ${where.length ? where.map(esc).join(", ") : "não aparece como selvagem nesta prova"}</p>
  </div>`;
}

// ---------- Inventário ----------

const CATEGORY_PT: Record<string, string> = { heal: "Cura", capture: "Captura", evolution: "Evolução", cosmetic: "Cosméticos" };

export function inventoryHtml(inv: Record<string, number>, bits: number): string {
  const items = economyJson.items as Record<string, { id: string; effect?: string; source?: string[]; rarity?: string }[]>;
  const sections = Object.entries(items)
    .map(
      ([cat, list]) => `<div class="iv-sec"><h4>${CATEGORY_PT[cat] ?? cat}</h4><div class="iv-grid">${list
        .map((it) => {
          const n = inv[it.id] ?? 0;
          return `<div class="iv-item${n ? "" : " empty"}" data-item="${it.id}">
            <span class="iv-icon">${icon(cat === "heal" ? "gift" : cat === "capture" ? "dex" : cat === "evolution" ? "evo" : "star", 22)}</span>
            <div><b>${esc(itemName(it.id))}</b><small>${esc(it.effect ?? "item cosmético")}${it.rarity ? ` · ${esc(it.rarity)}` : ""}</small><small class="dim">Fonte: ${esc((it.source ?? []).join(", ") || "—")}</small></div>
            <em data-testid="iv-qty">×${n}</em>
          </div>`;
        })
        .join("")}</div></div>`,
    )
    .join("");
  const m = economyJson.market;
  return `<div class="inv-screen">
    <div class="iv-head"><div class="coins">${icon("coin", 16)}<b data-testid="iv-bits">${fmt(bits)}</b><span>bits</span></div><span class="note">${esc(economyJson.currency.premiumNote)}</span></div>
    ${sections}
    <p class="note">Mercado: só bits, sem troca item por item; taxa de ${m.listingFeePct}% ao anunciar; ${m.activeListingLimitBase} anúncios ativos (aumenta com o nível do Tamer). Usar itens fica para a próxima etapa: aqui só a contagem.</p>
  </div>`;
}

// ---------- Missões ----------

const KIND_PT: Record<QuestView["kind"], string> = { main: "História", daily: "Diárias", milestone: "Coleção" };

export function questsHtml(list: QuestView[]): string {
  const groups = (["main", "daily", "milestone"] as const)
    .map((k) => {
      const qs = list.filter((q) => q.kind === k);
      return `<div class="qs-sec"><h4>${KIND_PT[k]}</h4>${qs
        .map((q) => {
          const pct = Math.round((q.progress / Math.max(1, q.goal)) * 100);
          const complete = q.trackable && q.progress >= q.goal;
          const btn = q.claimed
            ? `<button disabled>Coletado</button>`
            : complete
              ? `<button class="claim" data-claim="${esc(q.claimKey)}" data-bits="${q.rewardBits}">Coletar</button>`
              : `<button disabled>${q.trackable ? "Em andamento" : "Em breve"}</button>`;
          return `<div class="qs-item${complete ? " complete" : ""}${q.trackable ? "" : " soon"}" data-quest="${q.id}">
            <div class="qs-main"><b>${esc(q.title)}</b><small>Recompensa: ${esc(q.rewardText || "—")}</small>
              <div class="row"><div class="dx-bar big"><i style="width:${pct}%"></i></div><em data-testid="qs-progress">${q.trackable ? `${q.progress}/${q.goal}` : "—"}</em></div></div>
            ${btn}
          </div>`;
        })
        .join("")}</div>`;
    })
    .join("");
  return `<div class="quests">${groups}<p class="note">Diárias viram à meia-noite. "Derrote N" conta as vitórias da sua parceira na região atual; "Escaneie/Capture N" conta espécies que chegam a 100% de varredura. Arena, dungeons e chefes ainda não existem nesta prova.</p></div>`;
}

// ---------- Configurações ----------

export type TimeMode = "auto" | "day" | "night";

export interface SettingsState {
  auto: boolean;
  autoEvolve: boolean;
  time: TimeMode;
  confirmReset: boolean;
}

const TIME_PT: Record<TimeMode, string> = { auto: "Automático (relógio)", day: "Sempre dia", night: "Sempre noite" };

export function settingsHtml(s: SettingsState): string {
  const toggle = (id: string, label: string, hint: string, on: boolean) =>
    `<div class="st-row"><div><b>${label}</b><small>${hint}</small></div><button class="toggle${on ? " on" : ""}" data-set="${id}" aria-pressed="${on}">${on ? "LIG." : "DESL."}</button></div>`;
  return `<div class="settings">
    ${toggle("auto", "AUTO", "A parceira caça e ataca sozinha.", s.auto)}
    ${toggle("autoEvolve", "Auto-evoluir", "Ao atingir o nível, evolui sozinha fora de combate (herda até 2 golpes).", s.autoEvolve)}
    <div class="st-row"><div><b>Tempo do dia</b><small>Automático segue o relógio do jogo (1 dia = 24 min).</small></div>
      <div class="seg">${(Object.keys(TIME_PT) as TimeMode[]).map((t) => `<button data-time="${t}" aria-pressed="${s.time === t}" class="${s.time === t ? "on" : ""}">${TIME_PT[t]}</button>`).join("")}</div></div>
    <div class="st-row danger"><div><b>Resetar save</b><small>Apaga o Tamer, o parceiro e todo o progresso deste navegador.</small></div>
      ${
        s.confirmReset
          ? `<div class="confirm" role="alertdialog" aria-label="Confirmar reset"><span>Tem certeza? Isso não pode ser desfeito.</span><button data-reset="cancel">Cancelar</button><button class="danger" data-reset="confirm">Apagar e recomeçar</button></div>`
          : `<button class="danger" data-reset="ask">Resetar save</button>`
      }</div>
  </div>`;
}
