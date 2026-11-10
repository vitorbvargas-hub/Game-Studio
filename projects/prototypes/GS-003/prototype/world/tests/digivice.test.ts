// @vitest-environment jsdom
// HUD Identity v3 — Alternativa A "Digivice Radial" + abas P0 (quality-overhaul/phase3/design/HUD_IDENTITY_V3.md §2,
// PANELS_SPEC.md §5 Chefe Mundial, §6 Conquistas, §7 Configurações), atrás de ?hud=v2.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import achievementsJson from "../src/data/content/achievements.json";
import { loadWorldContent } from "../src/sim/species";
import { FOREST_PROOF_SCENE } from "../src/sim/setup";
import type { WorldEvent } from "../src/sim/types";
import {
  ACHIEVEMENTS,
  achievementViews,
  arcLayout,
  awakenBoss,
  BOSS_BOTS,
  BOSS_HP,
  BOSS_REWARD_BITS,
  BOSS_WINDOW_MS,
  bossArc,
  bossFor,
  bossPhase,
  bossRanking,
  bossTotal,
  claimAchievement,
  claimBoss,
  DIGIVICE_KEY,
  emptyDigivice,
  HUB_ITEMS,
  hubPips,
  loadDigivice,
  settleBoss,
  trackDigivice,
} from "../src/ui/digivice";
import { Hud, type HudScene } from "../src/ui/hud";

const content = loadWorldContent();
const scene: HudScene = { ...FOREST_PROOF_SCENE, tamerName: "Kaio", tamerLevel: 3, region: { name: "Floresta Densa", route: "Rota 1" } };
const T0 = new Date(2026, 10, 10, 10, 0, 0).getTime();

class MemStorage {
  m = new Map<string, string>();
  getItem(k: string) {
    return this.m.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.m.set(k, v);
  }
  removeItem(k: string) {
    this.m.delete(k);
  }
}

function mount(opts: { storage?: MemStorage; now?: () => number; grants?: number[] } = {}) {
  const root = document.createElement("div");
  document.body.appendChild(root);
  const grants = opts.grants ?? [];
  const hud = new Hud(root, content, "p1", { onAuto() {}, onFlee() {}, onGrantBits: (b) => grants.push(b) }, false, {
    scene,
    variant: "v2",
    shortcuts: ["map", "dex", "inv", "quest", "gear", "arena"],
    digivice: { storage: opts.storage ?? new MemStorage(), now: opts.now ?? (() => T0) },
  });
  return { root, hud, grants, dv: hud.digivice! };
}

const reward = (n = 1): WorldEvent[] => Array.from({ length: n }, () => ({ t: "reward", ownerId: "p1", xp: 10, bits: 5 }) as unknown as WorldEvent);

afterEach(() => {
  for (const el of document.querySelectorAll(".hud-v2")) (el as HTMLElement).remove();
  document.body.innerHTML = "";
});

describe("Digivice — hub e arco (HUD_IDENTITY_V3 §2)", () => {
  it("v2 troca o .hud-tr pelo hub: faixa de bits + 1 objeto circular, sem botão '+', sem textos fixos do clone", () => {
    const { root, hud } = mount();
    expect(root.querySelector(".hud-tr")).toBeNull();
    const dg = root.querySelector<HTMLElement>('[data-testid="digivice"]')!;
    expect(dg).not.toBeNull();
    expect(dg.querySelector('[data-testid="dg-ribbon"] [data-testid="coins"]')).not.toBeNull();
    expect(dg.querySelector(".plus")).toBeNull();
    for (const txt of ["PASSE DE TEMPORADA", "61%", "6h55", "Guilda dominante"]) expect(dg.textContent).not.toContain(txt);
    hud.setBits(1234);
    expect(dg.querySelector('[data-testid="coins"]')!.textContent).toBe("1.234");
    // fechado por padrão; os 6 atalhos não recebem foco
    expect(dg.classList.contains("open")).toBe(false);
    expect([...dg.querySelectorAll<HTMLElement>(".dg-node")].map((n) => n.tabIndex)).toEqual([-1, -1, -1, -1, -1, -1]);
  });

  it("arco: 6 atalhos, raio fixo, do pé do hub até a esquerda (abre para dentro da tela)", () => {
    const pos = arcLayout(6);
    expect(pos).toHaveLength(6);
    for (const p of pos) {
      expect(Math.hypot(p.x, p.y)).toBeGreaterThan(118);
      expect(Math.hypot(p.x, p.y)).toBeLessThan(122);
      expect(p.x).toBeLessThanOrEqual(0); // nunca para a direita (fora da tela)
      expect(p.y).toBeGreaterThanOrEqual(0); // nunca para cima (fora da tela)
    }
    // vizinhos não se sobrepõem (ícone de 32 px + moldura)
    for (let i = 1; i < pos.length; i++) expect(Math.hypot(pos[i].x - pos[i - 1].x, pos[i].y - pos[i - 1].y)).toBeGreaterThan(36);
    expect(HUB_ITEMS.map((i) => i.id)).toEqual(["guild", "mail", "pass", "wish", "boss", "trophy"]);
    expect(HUB_ITEMS.filter((i) => i.tier === "P0").map((i) => i.id)).toEqual(["boss", "trophy"]);
  });

  it("clique no hub abre/fecha; H abre com foco no 1º atalho; Esc e clique fora fecham", () => {
    const { root, dv } = mount();
    const hub = root.querySelector<HTMLButtonElement>('[data-testid="dg-hub"]')!;
    hub.click();
    expect(dv.isOpen).toBe(true);
    expect(hub.getAttribute("aria-expanded")).toBe("true");
    hub.click();
    expect(dv.isOpen).toBe(false);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "h" }));
    expect(dv.isOpen).toBe(true);
    expect(document.activeElement).toBe(root.querySelector(".dg-node"));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(dv.isOpen).toBe(false);
    hub.click();
    document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    expect(dv.isOpen).toBe(false);
  });

  it("cada atalho abre um Panel e fecha o hub; P1/P2 abrem o estado bloqueado explicado (sem número falso)", () => {
    const { root, dv } = mount();
    for (const it of HUB_ITEMS) {
      dv.open();
      root.querySelector<HTMLElement>(`[data-dg="${it.id}"]`)!.click();
      expect(dv.isOpen).toBe(false);
      const wrap = root.querySelector<HTMLElement>(`[data-panel="dg-${it.id}"]`)!;
      expect(wrap.classList.contains("open")).toBe(true);
      expect(root.querySelectorAll(".panel-wrap.open")).toHaveLength(1);
      if (it.tier !== "P0") {
        const l = wrap.querySelector<HTMLElement>('[data-testid="dg-locked"]')!;
        expect(l.dataset.tier).toBe(it.tier);
        expect(l.textContent).toContain(`PANELS_SPEC.md ${it.spec}`);
        expect(wrap.textContent).not.toMatch(/\d+%/);
      }
    }
  });

  it("atalhos antigos da grade (Guilda, Correio, Conquistas) levam ao mesmo painel do hub", () => {
    const { root } = mount();
    const btn = document.createElement("button");
    btn.dataset.short = "trophy";
    btn.title = "Conquistas";
    root.querySelector(".hud-bottom")?.appendChild(btn);
    btn.click();
    expect(root.querySelector<HTMLElement>('[data-panel="dg-trophy"]')!.classList.contains("open")).toBe(true);
  });

  it("pips só com novidade real: nada a coletar = nenhum pip; conquista pronta acende o pip de Conquistas", () => {
    const s = emptyDigivice();
    s.boss.lastDay = "2026-11-10"; // cooldown: sem novidade do chefe
    expect(hubPips(s, T0)).toEqual({ trophy: false, boss: false, mail: false });
    trackDigivice(s, reward(), "p1", () => false, T0);
    expect(hubPips(s, T0).trophy).toBe(true);
    claimAchievement(s, "win_1");
    expect(hubPips(s, T0).trophy).toBe(false);
    const { root, hud } = mount();
    const pip = root.querySelector<HTMLElement>('[data-pip="trophy"]')!;
    expect(pip.hidden).toBe(true);
    hud.onEvents(reward());
    expect(pip.hidden).toBe(false);
  });

  it("CSS do hub/abas: todo seletor novo escopado em .hud-v2; animação de abrir respeita reduced-motion", () => {
    const css = readFileSync(join(__dirname, "../src/style.css"), "utf8");
    const block = css.slice(css.indexOf(".hud-v2 .dg {"));
    expect(block.length).toBeGreaterThan(1000);
    expect(css).toMatch(/prefers-reduced-motion[\s\S]*\.hud-v2 \.dg/);
    expect(css).toMatch(/\.hud-v2 \.modal\.panel\s*\{[^}]*clip-path/); // Configurações e abas: moldura chanfrada
  });
});

describe("Chefe Mundial (PANELS_SPEC §5)", () => {
  it("ciclo: disponível → despertar (1×/dia) → janela → recompensa cheia → coletar → recarga até a meia-noite", () => {
    const s = emptyDigivice();
    expect(bossPhase(s, T0)).toBe("available");
    expect(awakenBoss(s, T0, "BOSS-KUWAGAMON")).toBe(true);
    expect(awakenBoss(s, T0 + 1000, "BOSS-KUWAGAMON")).toBe(false);
    expect(bossPhase(s, T0)).toBe("active");
    trackDigivice(s, reward(3), "p1", () => false, T0 + 60_000);
    expect(s.boss.active!.dmg).toBe(3);
    expect(settleBoss(s, T0 + 60_000)).toBe(false);
    expect(settleBoss(s, T0 + BOSS_WINDOW_MS)).toBe(true);
    expect(bossPhase(s, T0 + BOSS_WINDOW_MS)).toBe("reward");
    expect(s.boss.pending!.bits).toBe(BOSS_REWARD_BITS); // participação = cheia, sem fração
    expect(claimBoss(s)).toBe(BOSS_REWARD_BITS);
    expect(claimBoss(s)).toBe(0);
    expect(bossPhase(s, T0 + BOSS_WINDOW_MS)).toBe("cooldown");
    const tomorrow = new Date(2026, 10, 11, 0, 0, 1).getTime();
    expect(bossPhase(s, tomorrow)).toBe("available");
  });

  it("sem participação (0 vitórias) a janela fecha sem recompensa", () => {
    const s = emptyDigivice();
    awakenBoss(s, T0, "BOSS-KUWAGAMON");
    settleBoss(s, T0 + BOSS_WINDOW_MS);
    expect(bossPhase(s, T0 + BOSS_WINDOW_MS)).toBe("cooldown");
    expect(s.boss.pending).toBeUndefined();
  });

  it("chefe cai antes do tempo quando a soma (você + bots) chega ao PV; conta para a conquista", () => {
    const s = emptyDigivice();
    awakenBoss(s, T0, "BOSS-KUWAGAMON");
    trackDigivice(s, reward(BOSS_HP), "p1", () => false, T0 + 1000);
    expect(bossTotal(s.boss.active!, T0 + 1000)).toBeGreaterThanOrEqual(BOSS_HP);
    settleBoss(s, T0 + 1000);
    expect(s.boss.pending!.defeated).toBe(true);
    expect(s.bossDefeats).toBe(1);
  });

  it("ranking: bots determinísticos pelo dia, sempre rotulados; a sua linha nunca some", () => {
    const s = emptyDigivice();
    awakenBoss(s, T0, "BOSS-KUWAGAMON");
    const a = bossRanking(s.boss.active!, T0 + BOSS_WINDOW_MS, "Kaio");
    const b = bossRanking(s.boss.active!, T0 + BOSS_WINDOW_MS, "Kaio");
    expect(a).toEqual(b);
    expect(a.filter((r) => r.you)).toHaveLength(1);
    expect(a.filter((r) => r.bot).map((r) => r.name).sort()).toEqual([...BOSS_BOTS].sort());
    for (const r of a.filter((x) => x.bot)) expect(r.name.startsWith("BOT-")).toBe(true);
  });

  it("arco do hub: cheio quando disponível, PV restante em combate, enchendo na recarga; o chefe da Floresta é Kuwagamon", () => {
    const s = emptyDigivice();
    expect(bossArc(s, T0)).toEqual({ frac: 1, tone: "gold" });
    awakenBoss(s, T0, "BOSS-KUWAGAMON");
    expect(bossArc(s, T0)!.tone).toBe("red");
    settleBoss(s, T0 + BOSS_WINDOW_MS);
    const arc = bossArc(s, T0 + BOSS_WINDOW_MS)!;
    expect(arc.frac).toBeGreaterThan(0);
    expect(arc.frac).toBeLessThan(1);
    expect(bossFor("Floresta Densa").id).toBe("BOSS-KUWAGAMON");
    expect(bossFor("Lugar sem chefe").id).toBe("BOSS-KUWAGAMON");
  });

  it("DOM: aba abre em 'disponível', Despertar → timer ao vivo; coletar chama onGrantBits; estado persiste no save separado", () => {
    let now = T0;
    const storage = new MemStorage();
    const { root, hud, grants } = mount({ storage, now: () => now });
    hud.digivice!.openPanel("boss");
    const body = () => root.querySelector<HTMLElement>('[data-panel="dg-boss"] .panel-body')!;
    expect(body().querySelector('[data-wb-state="available"]')).not.toBeNull();
    expect(body().querySelector('[data-testid="wb-rank-empty"]')).not.toBeNull();
    expect(body().textContent).toContain("Kuwagamon");
    body().querySelector<HTMLElement>('[data-testid="wb-awaken"]')!.click();
    expect(body().querySelector('[data-wb-state="active"]')).not.toBeNull();
    expect(body().querySelector('[data-testid="wb-timer"]')!.textContent).toBe("10:00");
    expect(body().querySelector('[data-testid="wb-rank"]')!.textContent).toContain("BOT · simulado");
    hud.onEvents(reward(2));
    now = T0 + BOSS_WINDOW_MS + 1;
    hud.onEvents([]);
    hud.digivice!.openPanel("boss");
    expect(body().querySelector('[data-wb-state="reward"]')).not.toBeNull();
    body().querySelector<HTMLElement>('[data-testid="wb-claim"]')!.click();
    expect(grants).toEqual([BOSS_REWARD_BITS]);
    expect(body().querySelector('[data-wb-state="cooldown"]')).not.toBeNull();
    const saved = JSON.parse(storage.getItem(DIGIVICE_KEY)!);
    expect(saved.boss.lastDay).toBe("2026-11-10");
    expect(saved.wins).toBe(2);
    // recarregar: o cooldown vem do save
    expect(bossPhase(loadDigivice(storage), now)).toBe("cooldown");
    hud.digivice!.dispose();
  });
});

describe("Conquistas v1 (PANELS_SPEC §6)", () => {
  it("lista vem do content pack; todo stat é alimentado por evento/tela que já existe", () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(10);
    expect(ACHIEVEMENTS.length).toBeLessThanOrEqual(15);
    const known = new Set(["wins", "scans", "evolves", "maps", "tamerLevel", "bossAwakens", "bossDefeats"]);
    for (const a of achievementsJson.achievements) {
      expect(known.has(a.stat), a.id).toBe(true);
      expect(a.rewardBits).toBeGreaterThan(0);
    }
    const src = readFileSync(join(__dirname, "../src/ui/screens.ts"), "utf8");
    expect(src).not.toContain("win_1"); // não está hardcoded na UI
  });

  it("eventos: reward → vitórias; capture done (único por espécie) → varreduras; evolve só da parceira", () => {
    const s = emptyDigivice();
    const ev = [
      ...reward(2),
      { t: "reward", ownerId: "outro", xp: 1, bits: 1 },
      { t: "capture", ownerId: "p1", speciesId: "A", done: true },
      { t: "capture", ownerId: "p1", speciesId: "A", done: true },
      { t: "capture", ownerId: "p1", speciesId: "B", done: false },
      { t: "evolve", id: "p1:partner" },
      { t: "evolve", id: "wild:1" },
    ] as unknown as WorldEvent[];
    expect(trackDigivice(s, ev, "p1", (id) => id === "p1:partner", T0)).toBe(true);
    expect([s.wins, s.scans, s.evolves]).toEqual([2, ["A"], 1]);
  });

  it("estados: bloqueada (0) → progresso → completa → coletada; coletar só uma vez", () => {
    const s = emptyDigivice();
    const st = (id: string) => achievementViews(s).find((a) => a.id === id)!.state;
    expect(st("win_10")).toBe("locked");
    s.wins = 4;
    expect(st("win_10")).toBe("progress");
    expect(claimAchievement(s, "win_10")).toBe(0);
    s.wins = 10;
    expect(st("win_10")).toBe("complete");
    expect(claimAchievement(s, "win_10")).toBe(60);
    expect(st("win_10")).toBe("claimed");
    expect(claimAchievement(s, "win_10")).toBe(0);
  });

  it("DOM: abas por categoria, contador, coletar → onGrantBits; Social bloqueada com motivo; mapas e nível contam", () => {
    const { root, hud, grants } = mount();
    hud.setRegion("Vila dos Bebês", "Praça");
    hud.setTamerProgress(5, 0);
    hud.onEvents(reward());
    hud.digivice!.openPanel("trophy");
    const body = () => root.querySelector<HTMLElement>('[data-panel="dg-trophy"] .panel-body')!;
    expect(body().querySelector('[data-testid="ach-count"]')!.textContent).toBe(`3/${ACHIEVEMENTS.length}`); // win_1 + map_2 (2 regiões) + tamer_5;
    body().querySelector<HTMLElement>('[data-ach-claim="win_1"]')!.click();
    expect(grants).toEqual([20]);
    expect(body().querySelector<HTMLElement>('[data-ach="win_1"]')!.dataset.state).toBe("claimed");
    expect(body().querySelector<HTMLElement>('[data-ach="win_10"]')!.dataset.state).toBe("progress");
    body().querySelector<HTMLElement>('[data-ach-tab="exploration"]')!.click();
    expect(body().querySelector<HTMLElement>('[data-ach="map_2"]')!.dataset.state).toBe("complete");
    expect(body().querySelector<HTMLElement>('[data-ach="tamer_5"]')!.dataset.state).toBe("complete");
    body().querySelector<HTMLElement>('[data-ach-tab="social"]')!.click();
    expect(body().querySelector('[data-testid="ach-locked"]')).not.toBeNull();
    hud.digivice!.dispose();
  });
});
