// HUD em DOM (texto nítido, acessível e barato para menus de idle).
// Lê o estado e emite comandos via callbacks; nunca altera o estado diretamente.
// Nenhum texto fixo: tudo vem de content.strings (pacote) via fmt().

import { areaUnlocked, bossUnlocked, evolutionOptions, TRAIN_STATS, waveEnemies } from "../sim/game";
import { xpToNext } from "../sim/formulas";
import { fmt } from "../sim/strings";
import type { OfflineReport } from "../sim/offline";
import type { ContentBundle, GameEvent, GameState, PackManifest, TrainStat } from "../sim/types";

export interface HudActions {
  challengeBoss(): void;
  chooseDecision(i: number): void;
  chooseEvolution(uid: string, to: string): void;
  chooseStarter(speciesId: string): void;
  chooseEncounter(i: number): void;
  allocateTraining(uid: string, stat: TrainStat): void;
  travel(areaId: string): void;
  setSpeed(x: number): void;
  save(): void;
  reset(): void;
  switchPack(packId: string): void;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!);

export class Hud {
  private log: string[] = [];
  private lastKey = "";

  constructor(
    private root: HTMLElement,
    private content: ContentBundle,
    private packs: PackManifest[],
    actions: HudActions,
  ) {
    root.addEventListener("click", (ev) => {
      const el = (ev.target as HTMLElement).closest<HTMLElement>("[data-action]");
      if (!el || (el as HTMLButtonElement).disabled) return;
      const a = el.dataset;
      switch (a.action) {
        case "boss": return actions.challengeBoss();
        case "decide": return actions.chooseDecision(Number(a.index));
        case "evolve": return actions.chooseEvolution(a.uid!, a.to!);
        case "starter": return actions.chooseStarter(a.species!);
        case "encounter": return actions.chooseEncounter(Number(a.index));
        case "train": return actions.allocateTraining(a.uid!, a.stat as TrainStat);
        case "travel": return actions.travel(a.area!);
        case "speed": return actions.setSpeed(Number(a.x));
        case "save": return actions.save();
        case "reset": return actions.reset();
        case "close-offline": return this.root.querySelector("#offline")?.remove();
      }
    });
    root.addEventListener("change", (ev) => {
      const el = ev.target as HTMLSelectElement;
      if (el.dataset.action === "pack") actions.switchPack(el.value);
    });
  }

  /** Texto do pacote com escape HTML. */
  private t(key: string, vars: Record<string, string | number> = {}): string {
    return esc(fmt(this.content.strings, key, vars));
  }

  pushEvents(state: GameState, events: GameEvent[]): void {
    const c = this.content;
    const s = (key: string, vars: Record<string, string | number> = {}) => fmt(c.strings, key, vars);
    const nameOf = (uid: string) => {
      const p = state.party.find((x) => x.uid === uid);
      return p ? c.creatures[p.speciesId].name : uid;
    };
    for (const e of events) {
      if (e.t === "reward") this.log.unshift(s("logVictory", { xp: e.xp, bits: e.bits, currency: s("currency") }));
      else if (e.t === "level_up") this.log.unshift(s("logLevelUp", { name: nameOf(e.uid), level: e.level }));
      else if (e.t === "evolution_ready") this.log.unshift(s("logEvolutionReady", { name: nameOf(e.uid) }));
      else if (e.t === "evolved") this.log.unshift(s("logEvolved", { name: c.creatures[e.to].name }));
      else if (e.t === "travel") this.log.unshift(s("logTravel", { area: c.areas[e.areaId].name }));
      else if (e.t === "battle_end" && e.outcome === "lose") this.log.unshift(s("logRetreat"));
      else if (e.t === "battle_end" && e.kind === "boss") {
        const boss = c.areas[state.areaId].boss;
        this.log.unshift(s("logBossDefeated", { boss: boss ? c.enemies[boss.enemyId].name : s("boss") }));
      } else if (e.t === "sync") this.log.unshift(s("logSync", { sync: s("sync"), skill: c.skills[e.skillId].name }));
      else if (e.t === "starter_chosen") this.log.unshift(s("logStarter", { name: c.creatures[e.speciesId].name }));
      else if (e.t === "scan") this.log.unshift(s("logScan", { name: c.creatures[e.speciesId].name, pct: e.pct }));
      else if (e.t === "recruited") this.log.unshift(s("logRecruited", { name: c.creatures[e.speciesId].name }));
      else if (e.t === "training_ready") this.log.unshift(s("logTrainingReady", { name: nameOf(e.uid) }));
    }
    this.log.length = Math.min(this.log.length, 8);
  }

  showOffline(r: OfflineReport): void {
    const creature = fmt(this.content.strings, "creature");
    const el = document.createElement("div");
    el.id = "offline";
    el.className = "modal";
    el.innerHTML = `<div class="card"><h2>${this.t("offlineTitle")}</h2>
      <p>${this.t("offlineCredited", { hours: (r.creditedMs / 3600_000).toFixed(2) })}
        ${r.capped ? this.t("offlineCapped", { cap: this.content.balance.offline.capHours }) : ""}</p>
      <p>${this.t("offlineGains", { xp: r.xpPerCreature, bits: r.bits, wins: r.wins, creature, currency: fmt(this.content.strings, "currency") })}</p>
      ${r.levelUps.length ? `<p>${this.t("offlineLevelUps", { n: r.levelUps.length, creature })}</p>` : ""}
      <button data-action="close-offline">${this.t("continue")}</button></div>`;
    this.root.appendChild(el);
  }

  /** Pontos de Treino: botões por stat quando há ponto livre; resumo do que já foi alocado. */
  private trainingHtml(p: GameState["party"][number]): string {
    const tr = this.content.balance.training;
    if (!tr) return "";
    const label: Record<TrainStat, string> = { atk: this.t("trainAtk"), def: this.t("trainDef"), spd: this.t("trainSpd") };
    const spent = TRAIN_STATS.filter((k) => p.train?.[k]).map((k) => `${label[k]} +${p.train![k]! * tr.pctPerPoint}%`).join(" ");
    const free = p.trainPoints ?? 0;
    if (!free && !spent) return "";
    const buttons = free
      ? TRAIN_STATS.map((k) => `<button data-action="train" data-uid="${p.uid}" data-stat="${k}">+${label[k]}</button>`).join(" ")
      : "";
    return `<div class="train">${this.t("training")}${free ? ` (${free})` : ""}: ${buttons} <small>${spent}</small></div>`;
  }

  render(state: GameState, speed: number): void {
    const c = this.content;
    const area = c.areas[state.areaId];
    const wins = state.winsByArea[state.areaId] ?? 0;
    const unlocked = bossUnlocked(c, state);
    const decision = state.battle?.decision;
    const inBoss = state.battle?.kind === "boss";
    // Re-render barato: só quando algo visível muda.
    const autoIn = state.encounter ? Math.max(0, Math.ceil(((state.encounter.autoAtTick - state.tick) * c.balance.tickMs) / 1000)) : 0;
    const key = JSON.stringify([state.party, state.bits, wins, state.areaId, state.battle?.kind, decision, state.pendingEvolutions, speed, this.log[0], state.bossesDefeated, state.starterPending, state.encounter, autoIn, state.scan]);
    if (key === this.lastKey) return;
    this.lastKey = key;

    const party = state.party
      .map((p) => {
        const def = c.creatures[p.speciesId];
        const need = xpToNext(c.balance, p.level);
        const aff = c.theme.affinities.find((a) => a.id === def.affinity)!;
        const evo = state.pendingEvolutions.includes(p.uid)
          ? `<div class="evo">${this.t("evolve")}: ${evolutionOptions(c, p)
              .map((o) => `<button data-action="evolve" data-uid="${p.uid}" data-to="${o.to}">${esc(c.creatures[o.to].name)}${o.label ? ` <small>(${esc(o.label)})</small>` : ""}</button>`)
              .join(" ")}</div>`
          : "";
        return `<li><span class="sw" style="background:${def.color}"></span><b>${esc(def.name)}</b>
          <span class="aff" style="color:${aff.color}">${esc(aff.name)}</span> ${this.t("level")} ${p.level}
          <div class="bar"><i style="width:${Math.min(100, (p.xp / need) * 100).toFixed(1)}%"></i></div>${evo}${this.trainingHtml(p)}</li>`;
      })
      .join("");

    const areas = Object.values(c.areas);
    const travel =
      areas.length > 1
        ? `<div class="areas">${this.t("travel")}: ${areas
            .map((a) => {
              const open = areaUnlocked(c, state, a.id);
              const lock = !open && a.unlock?.minPartyLevel ? ` (${this.t("lockedLevel", { level: a.unlock.minPartyLevel })})` : "";
              return `<button data-action="travel" data-area="${a.id}" class="${a.id === state.areaId ? "on" : ""}" ${!open || inBoss ? "disabled" : ""}>${esc(a.name)}${lock}</button>`;
            })
            .join("")}</div>`
        : "";

    const boss = area.boss;
    const bossBtn = boss
      ? state.bossesDefeated[area.id]
        ? `<button data-action="boss" ${inBoss ? "disabled" : ""}>${this.t("challengeBoss")} (${this.t("rematch")})</button>`
        : `<button data-action="boss" ${!unlocked || inBoss ? "disabled" : ""}>${this.t("challengeBoss")} ${unlocked ? "" : `(${wins}/${boss.unlockAfterWins})`}</button>`
      : "";

    const decisionHtml = decision
      ? `<div class="modal decision"><div class="card"><h2>${this.t("sync")}!</h2>
          <p>${decision.thresholdPct === 100 ? this.t("decisionStart") : this.t("decisionThreshold", { pct: decision.thresholdPct })}
            ${this.t("decisionPrompt", { player: fmt(c.strings, "player") })}</p>
          ${decision.options
            .map((id, i) => `<button data-action="decide" data-index="${i}"><b>${esc(c.skills[id].name)}</b><br><small>${esc(c.skills[id].description ?? "")}</small></button>`)
            .join("")}</div></div>`
      : "";

    const scanList = Object.entries(state.scan)
      .map(([sp, pct]) => `${esc(c.creatures[sp].name)} ${pct}%`)
      .join(" · ");
    const scanHtml = scanList ? `<li class="scan">${this.t("scan")}: ${scanList}</li>` : "";

    const enemyNames = (ids: string[]) => ids.map((id) => esc(c.enemies[id].name)).join(" + ");
    const encounterHtml = state.encounter && !decision
      ? `<div class="modal decision encounter"><div class="card"><h2>${this.t("encounterTitle")}</h2>
          <p>${this.t("encounterPrompt")} <small>${this.t("encounterAuto", { s: autoIn })}</small></p>
          ${state.encounter.options
            .map((w, i) => {
              const ids = waveEnemies(c, state, area.waves[w]);
              const scans = [...new Set(ids.map((id) => c.enemies[id].recruitAs).filter((sp): sp is string => !!sp && !state.recruited.includes(sp)))]
                .map((sp) => `${esc(c.creatures[sp].name)} ${state.scan[sp] ?? 0}%`)
                .join(" · ");
              return `<button data-action="encounter" data-index="${i}"><b>${enemyNames(ids)}</b>${scans ? `<br><small>${this.t("scan")}: ${scans}</small>` : ""}</button>`;
            })
            .join("")}</div></div>`
      : "";

    const starterHtml = state.starterPending
      ? `<div class="modal decision starter"><div class="card"><h2>${this.t("starterTitle")}</h2>
          <p>${this.t("starterPrompt", { creature: fmt(c.strings, "creature") })}</p>
          ${(c.theme.starterOptions ?? [])
            .map((id) => {
              const def = c.creatures[id];
              const aff = c.theme.affinities.find((a) => a.id === def.affinity)!;
              const evo = def.evolutions?.[0];
              return `<button data-action="starter" data-species="${esc(id)}"><span class="sw" style="background:${def.color}"></span><b>${esc(def.name)}</b>
                <span class="aff" style="color:${aff.color}">${esc(aff.name)}</span>
                ${evo ? `<br><small>${this.t("starterEvolvesTo", { name: c.creatures[evo.to].name, level: evo.level })}</small>` : ""}
                ${def.flavor ? `<br><small>${esc(def.flavor)}</small>` : ""}</button>`;
            })
            .join("")}</div></div>`
      : "";

    const packSelect = `<label>${this.t("pack")}: <select data-action="pack">${this.packs
      .map((p) => `<option value="${esc(p.id)}" ${p.id === c.pack.id ? "selected" : ""}>${esc(p.name)}</option>`)
      .join("")}</select></label>`;

    const offline = this.root.querySelector("#offline");
    this.root.innerHTML = `
      <header><b>${this.t("title")}</b>
        <span>${this.t("area")}: ${esc(area.name)}</span>
        <span>${this.t("currency")}: ${state.bits}</span>
        <span>${this.t("victories")}: ${wins}</span></header>
      <section class="row">
        <ul class="party">${party}${scanHtml}</ul>
        <div class="side">
          ${travel}
          ${bossBtn}
          <div class="speed">${this.t("speed")}: ${[1, 4, 16].map((x) => `<button data-action="speed" data-x="${x}" class="${x === speed ? "on" : ""}">x${x}</button>`).join("")}</div>
          <div class="sys"><button data-action="save">${this.t("save")}</button><button data-action="reset">${this.t("newGame")}</button> ${packSelect}</div>
          <ol class="log">${this.log.map((l) => `<li>${esc(l)}</li>`).join("")}</ol>
        </div>
      </section>
      ${c.pack.disclaimer ? `<footer class="disclaimer">${esc(c.pack.disclaimer)}</footer>` : ""}${decisionHtml}${encounterHtml}${starterHtml}`;
    if (offline) this.root.appendChild(offline);
  }
}
