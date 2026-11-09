// Escolha de evolução (pt-BR, EVOLUTION_PROPOSAL.md §4–5): HTML puro a partir dos dados. O main abre o modal num
// Panel e liga os botões (data-evolve-to); a aba "Golpes / Evolução" do Equipe & Box usa a seção de preferência
// (select[data-evo-pref]). Os sprites são canvases [data-evo-sp] pintados depois; sem arte → "?".

import { forksAhead, REQ_PT, statusesOf, type PathStatus, type ReqCheck } from "../sim/evolution";
import type { WorldContent } from "../sim/species";
import type { StatBlock } from "../sim/types";
import { AFFINITY_PT, STAGE_PT } from "./starter";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export interface EvoSubject {
  speciesId: string;
  name: string;
  level: number;
  stats: StatBlock;
}

function reqHtml(r: ReqCheck): string {
  return `<li class="${r.ok ? "ok" : "no"}" data-req="${r.stat}"><i>${r.ok ? "✓" : "✗"}</i>${REQ_PT[r.stat]} ${r.need}${r.stat === "level" ? "" : "+"} <small>(${r.stat === "level" ? "Nv." : "você: "}${r.have})</small></li>`;
}

export function statusesFor(content: WorldContent, s: EvoSubject): PathStatus[] {
  return statusesOf(content.moves, s, (id) => !!content.species[id]);
}

/**
 * Modal "Digivolução disponível": todos os caminhos da espécie, elegíveis ou não, cada um com prévia do sprite,
 * estágio, atributo, os requisitos (✓/✗ com o valor atual) e a fonte do ramo. Só os elegíveis têm botão.
 */
export function evolveChoiceHtml(content: WorldContent, s: EvoSubject, opts: { pref?: string; inCombat?: boolean; autoEvolve?: boolean } = {}): string {
  const st = statusesFor(content, s);
  const n = st.filter((x) => x.eligible).length;
  const cards = st
    .map((x) => {
      const sp = content.species[x.path.to];
      const name = sp?.name ?? x.path.to;
      return `<div class="evo-path${x.eligible ? " ok" : " locked"}${opts.pref === x.path.to ? " pref" : ""}" data-evo-path="${esc(x.path.to)}">
        <div class="evo-prev"><canvas width="64" height="64" data-evo-sp="${esc(x.path.to)}"></canvas><span class="q">?</span></div>
        <h3>${esc(name)}</h3>
        <div class="chips">${sp ? `<span class="chip">${STAGE_PT[sp.stage] ?? `Estágio ${sp.stage}`}</span><span class="chip aff-${sp.affinity}">${AFFINITY_PT[sp.affinity] ?? sp.affinity}</span>` : ""}${opts.pref === x.path.to ? `<span class="chip gold">Preferido</span>` : ""}</div>
        <ul class="evo-reqs">${x.reqs.map(reqHtml).join("")}</ul>
        ${x.path.source ? `<p class="src" title="Fonte do ramo (knowledge/evolution_chains.json); números [H] no nosso balanceamento">Ramo: ${esc(x.path.source)}</p>` : ""}
        ${
          x.eligible
            ? `<button type="button" class="act go" data-evolve-to="${esc(x.path.to)}" ${opts.inCombat ? "disabled title='Em combate: confirme quando a luta acabar.'" : ""}>Evoluir para ${esc(name)}</button>`
            : `<button type="button" class="act" disabled>Requisitos pendentes</button>`
        }
      </div>`;
    })
    .join("");
  const lead =
    n > 1
      ? `<b>${esc(s.name)}</b> pode seguir por ${n} caminhos. Escolha um: o jogo nunca decide sozinho quando há mais de um.`
      : n === 1
        ? `<b>${esc(s.name)}</b> já pode evoluir por um dos caminhos. Os outros mostram o que ainda falta.`
        : `<b>${esc(s.name)}</b> ainda não cumpre os requisitos de nenhum caminho.`;
  return `<div class="evo-choice" data-testid="evo-choice">
    <p class="lead">${lead}</p>
    ${opts.inCombat ? `<p class="note warn">Em combate: a evolução fica liberada quando a luta acabar.</p>` : ""}
    <div class="evo-paths">${cards}</div>
    <p class="note">${opts.autoEvolve ? "Auto-evoluir ligado: ele só evolui sozinho com um caminho elegível ou com a preferência marcada em Equipe &amp; Box → Golpes / Evolução." : "Dica: em Equipe &amp; Box → Golpes / Evolução você marca um caminho preferido para o Auto-evoluir."}</p>
    <footer class="evo-foot"><button type="button" class="act" data-panel-close data-evo-later>Agora não</button></footer>
  </div>`;
}

/**
 * Seção "Evolução" da aba Golpes / Evolução: para cada ramificação da linha (a espécie atual e as próximas), os
 * caminhos com requisitos e o select da preferência do Auto-evoluir. Requisitos de formas futuras são mostrados
 * contra o nível/stats atuais (só referência).
 */
export function evolutionSectionHtml(content: WorldContent, s: EvoSubject, prefs: Record<string, string>, editable: boolean): string {
  const forks = forksAhead(content.moves, s.speciesId);
  const own = content.moves.paths[s.speciesId] ?? [];
  const simple = !forks.includes(s.speciesId) && own.length === 1 ? own[0] : undefined;
  const block = (from: string) => {
    const st = statusesOf(content.moves, { speciesId: from, level: s.level, stats: s.stats }, (id) => !!content.species[id]);
    const cur = from === s.speciesId;
    const name = (id: string) => content.species[id]?.name ?? id;
    return `<div class="evo-fork" data-evo-fork="${esc(from)}">
      <div class="row"><b>${esc(name(from))}</b> → ${st.map((x) => esc(name(x.path.to))).join(" ou ")}${cur ? "" : ' <span class="tag">mais à frente</span>'}</div>
      ${cur ? `<ul class="evo-reqs inline">${st.map((x) => `<li class="${x.eligible ? "ok" : "no"}"><b>${esc(name(x.path.to))}:</b> ${x.reqs.map((r) => `${r.ok ? "✓" : "✗"} ${REQ_PT[r.stat]} ${r.need}${r.stat === "level" ? "" : "+"}`).join(" · ")}</li>`).join("")}</ul>` : `<ul class="evo-reqs inline">${st.map((x) => `<li><b>${esc(name(x.path.to))}:</b> ${x.reqs.map((r) => `${REQ_PT[r.stat]} ${r.need}${r.stat === "level" ? "" : "+"}`).join(" · ")}</li>`).join("")}</ul>`}
      <label class="evo-pref">Auto-evoluir prefere
        <select data-evo-pref="${esc(from)}" ${editable ? "" : "disabled"} aria-label="Preferência de evolução de ${esc(name(from))}">
          <option value="">Perguntar sempre</option>
          ${st.map((x) => `<option value="${esc(x.path.to)}"${prefs[from] === x.path.to ? " selected" : ""}>${esc(name(x.path.to))}</option>`).join("")}
        </select>
      </label>
    </div>`;
  };
  return `<div class="evo-sec" data-testid="evo-sec">
    <div class="sec"><b>Evolução</b></div>
    ${forks.length ? forks.map(block).join("") : simple ? `<p class="note">Caminho único: ${esc(content.species[simple.to]?.name ?? simple.to)} no Nv.${simple.level}. O Auto-evoluir segue sozinho.</p>` : `<p class="note">Sem evolução nesta prova.</p>`}
    ${forks.length ? `<p class="note">Com mais de um caminho elegível, o Auto-evoluir espera a sua escolha. Marque uma preferência para ele seguir sozinho por ela (vale para a próxima evolução, não desfaz nenhuma).</p>` : ""}
  </div>`;
}
