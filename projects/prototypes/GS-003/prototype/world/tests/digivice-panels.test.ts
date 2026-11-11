// @vitest-environment jsdom
// PANELS_SPEC.md §1 Guilda, §2 Correio, §3 Passe de Temporada, §4 Fonte dos Desejos — critérios de aceite de cada
// seção, na lógica pura (src/ui/digivice-panels.ts) e no DOM do Digivice (HUD v2).
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadWorldContent } from "../src/sim/species";
import { FOREST_PROOF_SCENE } from "../src/sim/setup";
import type { WorldEvent } from "../src/sim/types";
import { DIGIVICE_KEY, emptyDigivice, loadDigivice } from "../src/ui/digivice";
import {
  addMail,
  botGuilds,
  claimPassLevel,
  ensureSeason,
  ensureWelcome,
  foundGuild,
  GUILD_MIN_LEVEL,
  joinBotGuild,
  MAIL_LIMIT,
  mailStaleQuests,
  makeWish,
  PASS_DAYS,
  PASS_LEVEL_PTS,
  passLevel,
  QUEST_MAIL_AFTER_MS,
  routeStandings,
  rollSeason,
  WISH_PLAY_MS,
  WISH_WINDOW_MS,
  wishOnPlay,
  wishOnWin,
} from "../src/ui/digivice-panels";
import { Hud, type HudScene } from "../src/ui/hud";

const content = loadWorldContent();
const T0 = new Date(2026, 10, 10, 10, 0, 0).getTime();
const DAY = 24 * 3600_000;

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

interface Calls {
  bits: number[];
  items: Record<string, number>[];
  quests: string[];
  mult: number[];
}

function mount(opts: { storage?: MemStorage; now?: () => number; level?: number; quests?: () => never[] } = {}) {
  const root = document.createElement("div");
  document.body.appendChild(root);
  const calls: Calls = { bits: [], items: [], quests: [], mult: [] };
  const scene: HudScene = { ...FOREST_PROOF_SCENE, tamerName: "Kaio", tamerLevel: opts.level ?? 6, region: { name: "Floresta Densa", route: "Rota 1" } };
  const hud = new Hud(
    root,
    content,
    "p1",
    {
      onAuto() {},
      onFlee() {},
      onGrantBits: (b) => calls.bits.push(b),
      onGrantItems: (i) => calls.items.push(i),
      onClaimQuest: (k) => (calls.quests.push(k), true),
      onScanMult: (m) => calls.mult.push(m),
    },
    false,
    { scene, variant: "v2", shortcuts: [], digivice: { storage: opts.storage ?? new MemStorage(), now: opts.now ?? (() => T0), scanBase: 25, quests: opts.quests } },
  );
  hud.setTamerProgress(opts.level ?? 6, 0);
  const dv = hud.digivice!;
  const body = (id: string) => root.querySelector<HTMLElement>(`[data-panel="dg-${id}"] .panel-body`)!;
  return { root, hud, dv, calls, body };
}

const reward = (n = 1, xp = 10): WorldEvent[] => Array.from({ length: n }, () => ({ t: "reward", ownerId: "p1", xp, bits: 5 }) as unknown as WorldEvent);

afterEach(() => {
  document.body.innerHTML = "";
});

describe("§1 Guilda", () => {
  it("fundar grava {id, name, emblemId} no save; reabrir o jogo mantém a guilda", () => {
    const storage = new MemStorage();
    const { dv, body } = mount({ storage });
    dv.openPanel("guild");
    body("guild").querySelector<HTMLElement>('[data-testid="gd-found"]')!.click();
    body("guild").querySelector<HTMLInputElement>('[data-testid="gd-name"]')!.value = "Guardiões da Mata";
    body("guild").querySelector<HTMLElement>('[data-gd-emblem="3"]')!.click();
    body("guild").querySelector<HTMLElement>('[data-testid="gd-create"]')!.click();
    const g = JSON.parse(storage.getItem(DIGIVICE_KEY)!).guild;
    expect(g).toMatchObject({ name: "Guardiões da Mata", emblemId: 3, role: "leader" });
    expect(g.id).toBeTruthy();
    dv.dispose();
    expect(loadDigivice(storage).guild?.name).toBe("Guardiões da Mata");
    const again = mount({ storage });
    again.dv.openPanel("guild");
    expect(again.body("guild").querySelector('[data-testid="gd-title"]')!.textContent).toBe("Guardiões da Mata");
    // membros: só o jogador real (sem tela de promoção para 1 pessoa)
    expect(again.body("guild").querySelectorAll('[data-testid="gd-members"] li')).toHaveLength(1);
    expect(again.body("guild").textContent).not.toMatch(/promover/i);
    again.dv.dispose();
  });

  it("nome até 18 caracteres e gate de nível 5 (abaixo disso os 2 botões aparecem desabilitados com o motivo)", () => {
    const s = emptyDigivice();
    expect(foundGuild(s, "x".repeat(19), 0, 9, T0)).toMatch(/18/);
    expect(foundGuild(s, "Ok", 0, GUILD_MIN_LEVEL - 1, T0)).toMatch(/Nível 5/);
    expect(s.guild).toBeUndefined();
    const { dv, body } = mount({ level: 3 });
    dv.openPanel("guild");
    expect(body("guild").querySelector<HTMLButtonElement>('[data-testid="gd-found"]')!.disabled).toBe(true);
    for (const b of body("guild").querySelectorAll<HTMLButtonElement>("[data-gd-join]")) expect(b.disabled).toBe(true);
    expect(body("guild").querySelector('[data-testid="gd-gate"]')!.textContent).toContain("Disponível a partir do Nível 5");
    dv.dispose();
  });

  it("toda guilda-bot mostra 'simulada — sem servidor ainda', na lista e depois de entrar", () => {
    const { dv, body } = mount();
    dv.openPanel("guild");
    const bots = body("guild").querySelectorAll('[data-testid="gd-bot"]');
    expect(bots.length).toBeGreaterThanOrEqual(3);
    expect(bots.length).toBeLessThanOrEqual(5);
    for (const b of bots) expect(b.textContent).toContain("simulada — sem servidor ainda");
    body("guild").querySelector<HTMLElement>("[data-gd-join]")!.click();
    expect(body("guild").querySelector('[data-testid="gd-title"]')).not.toBeNull();
    expect(body("guild").querySelector('[data-testid="gd-sim"]')!.textContent).toContain("simulada — sem servidor ainda");
    // sair pede confirmação
    body("guild").querySelector<HTMLElement>('[data-testid="gd-leave"]')!.click();
    expect(body("guild").querySelector('[data-testid="gd-confirm"]')).not.toBeNull();
    body("guild").querySelector<HTMLElement>('[data-testid="gd-leave-yes"]')!.click();
    expect(body("guild").querySelector('[data-testid="gd-found"]')).not.toBeNull();
    dv.dispose();
  });

  it("contribuição = só XP das vitórias do evento `reward` já existente, na rota atual; bots determinísticos", () => {
    const { hud, dv } = mount();
    hud.onEvents(reward(3, 12)); // sem guilda: nada conta
    expect(dv.save.guildPts).toEqual({});
    expect(foundGuild(dv.save, "Minha", 0, 6, T0)).toBeNull();
    hud.onEvents(reward(2, 15));
    hud.onEvents([{ t: "reward", ownerId: "p2", xp: 99 } as unknown as WorldEvent]); // de outro jogador: não conta
    expect(Object.values(dv.save.guildPts)[0]).toEqual({ "Rota 1": 30 });
    const a = routeStandings(dv.save, "Floresta Densa", "Rota 1", T0);
    const b = routeStandings(dv.save, "Floresta Densa", "Rota 1", T0);
    expect(a).toEqual(b);
    expect(a.find((r) => r.you)!.pts).toBe(30);
    expect(a.filter((r) => r.bot)).toHaveLength(botGuilds("Floresta Densa").length);
    dv.dispose();
  });

  it("a guilda dominante não aparece em nenhuma caixa permanente da HUD fora do painel", () => {
    const { root, dv } = mount();
    joinBotGuild(dv.save, "Floresta Densa", botGuilds("Floresta Densa")[0].id, 6, T0);
    const outside = [...root.children].filter((el) => !el.matches(".panel-wrap")).map((el) => el.textContent ?? "").join(" ");
    expect(outside).not.toMatch(/dominad/i);
    dv.dispose();
  });
});

describe("§2 Correio", () => {
  it("carta de boas-vindas existe desde a 1ª sessão e nunca duplica nas seguintes", () => {
    const storage = new MemStorage();
    const a = mount({ storage });
    expect(a.dv.save.mail.filter((m) => m.subject.includes("Bem-vindo"))).toHaveLength(1);
    a.dv.dispose();
    const b = mount({ storage });
    expect(b.dv.save.mail.filter((m) => m.subject.includes("Bem-vindo"))).toHaveLength(1);
    expect(ensureWelcome(b.dv.save, T0)).toBe(false);
    b.dv.dispose();
  });

  it("abrir marca read=true de forma persistente; o ponto de não-lido reflete read===false", () => {
    const storage = new MemStorage();
    const { dv, body, root } = mount({ storage });
    expect(root.querySelector<HTMLElement>('[data-pip="mail"]')!.hidden).toBe(false);
    dv.openPanel("mail");
    expect(body("mail").querySelectorAll('[data-testid="ml-unread"]')).toHaveLength(1);
    body("mail").querySelector<HTMLElement>('[data-testid="ml-row"]')!.click();
    expect(body("mail").querySelectorAll('[data-testid="ml-unread"]')).toHaveLength(0);
    expect(root.querySelector<HTMLElement>('[data-pip="mail"]')!.hidden).toBe(true);
    expect(loadDigivice(storage).mail[0].read).toBe(true);
    dv.dispose();
  });

  it("Coletar usa os mesmos caminhos das Missões: itens → onGrantItems, bits → onGrantBits, missão → onClaimQuest", () => {
    const { dv, body, calls } = mount();
    addMail(dv.save, { iconId: "boss", subject: "Chefe", body: "x", attachment: { bits: 200 }, ts: T0 + 1 });
    addMail(dv.save, { iconId: "gift", subject: "Missão", body: "x", attachment: { questKey: "collect_5_species" }, ts: T0 + 2 });
    dv.openPanel("mail");
    for (const id of ["m1", "m2", "m3"]) {
      body("mail").querySelector<HTMLElement>(`[data-ml="${id}"]`)!.click();
      body("mail").querySelector<HTMLElement>('[data-testid="ml-claim"]')!.click();
      expect(body("mail").querySelector('[data-testid="ml-claim"]')).toBeNull();
    }
    expect(calls.items).toEqual([{ potinho_de_energia: 1 }]);
    expect(calls.bits).toEqual([200]);
    expect(calls.quests).toEqual(["collect_5_species"]);
    dv.dispose();
  });

  it("limite de 20: expira a mais antiga sem anexo pendente; carta com anexo não coletado nunca sai", () => {
    const s = emptyDigivice();
    addMail(s, { iconId: "gift", subject: "com anexo", body: "", attachment: { bits: 10 }, ts: T0 });
    for (let i = 1; i <= 40; i++) addMail(s, { iconId: "mail", subject: `aviso ${i}`, body: "", ts: T0 + i });
    expect(s.mail).toHaveLength(MAIL_LIMIT);
    expect(s.mail.some((m) => m.subject === "com anexo")).toBe(true);
    expect(s.mail.some((m) => m.subject === "aviso 1")).toBe(false);
    // só cartas com anexo pendente: passa do limite em vez de descartar recompensa
    const t = emptyDigivice();
    for (let i = 0; i < 25; i++) addMail(t, { iconId: "gift", subject: `r${i}`, body: "", attachment: { bits: 1 }, ts: T0 + i });
    expect(t.mail).toHaveLength(25);
  });

  it("marco completo e não coletado há 48 h vira carta (uma vez); diária não", () => {
    const s = emptyDigivice();
    const q = (kind: string, key: string) => ({ kind, title: key, progress: 1, goal: 1, trackable: true, claimed: false, claimKey: key, rewardText: "50 bits" });
    expect(mailStaleQuests(s, [q("milestone", "m1"), q("daily", "d1@x")], T0)).toBe(0);
    expect(mailStaleQuests(s, [q("milestone", "m1"), q("daily", "d1@x")], T0 + QUEST_MAIL_AFTER_MS)).toBe(1);
    expect(mailStaleQuests(s, [q("milestone", "m1")], T0 + 2 * QUEST_MAIL_AFTER_MS)).toBe(0);
    expect(s.mail[0].attachment).toMatchObject({ questKey: "m1" });
  });

  it("janela do chefe que fechou com o jogo fechado: a recompensa chega por carta", () => {
    const storage = new MemStorage();
    const s = emptyDigivice();
    s.boss = { lastDay: "2026-11-10", active: { bossId: "BOSS-KUWAGAMON", day: "2026-11-10", start: T0, end: T0 + 600_000, dmg: 3 } };
    storage.setItem(DIGIVICE_KEY, JSON.stringify(s));
    const { dv } = mount({ storage, now: () => T0 + 3600_000 });
    expect(dv.save.boss.pending).toBeUndefined();
    expect(dv.save.mail.find((m) => m.iconId === "boss")?.attachment?.bits).toBe(200);
    dv.dispose();
  });
});

describe("§3 Passe de Temporada", () => {
  it("nenhum caminho para dinheiro real: sem comprar/preço/R$ no painel", () => {
    const { dv, body } = mount();
    dv.openPanel("pass");
    const t = body("pass").textContent!;
    expect(t).not.toMatch(/R\$|US\$|\$\s?\d|comprar|preço|premium/i);
    expect(body("pass").querySelector('[data-testid="ps-free"]')!.textContent).toMatch(/gratuita/);
    const src = readFileSync(join(__dirname, "../src/ui/digivice-panels.ts"), "utf8");
    expect(src).not.toMatch(/price|purchase|checkout/i);
    dv.dispose();
  });

  it("pontos só de fontes existentes: XP da diária coletada e +30 do Chefe Mundial; 20 níveis, 14 dias", () => {
    const { hud, dv } = mount();
    expect(dv.save.pass).toMatchObject({ season: 1, start: T0, points: 0 });
    hud.onEvents(reward(5)); // vitórias não são Pontos de Passe
    expect(dv.save.pass!.points).toBe(0);
    dv.noteDailyClaim(50);
    expect(dv.save.pass!.points).toBe(50);
    expect(passLevel(dv.save.pass!)).toBe(1);
    dv.save.pass!.points = 99 * PASS_LEVEL_PTS;
    expect(passLevel(dv.save.pass!)).toBe(20);
    dv.dispose();
  });

  it("coletar um nível: bits pelo onGrantBits, Cristal no save; cosmético 'em produção' não coleta", () => {
    const { dv, body, calls } = mount();
    dv.noteDailyClaim(PASS_LEVEL_PTS * 2);
    dv.openPanel("pass");
    body("pass").querySelector<HTMLElement>('[data-testid="ps-claim"]')!.click();
    expect(calls.bits).toEqual([50]);
    body("pass").querySelector<HTMLElement>('[data-testid="ps-claim"]')!.click();
    expect(dv.save.crystals).toBe(10);
    expect(body("pass").querySelector('[data-testid="ps-claim"]')).toBeNull();
    dv.save.pass!.points = PASS_LEVEL_PTS * 10;
    expect(claimPassLevel(dv.save, 10)).toBeNull();
    dv.dispose();
  });

  it("virada de temporada manda os níveis não coletados para o Correio, nunca descarta", () => {
    const s = emptyDigivice();
    ensureSeason(s, T0);
    s.pass!.points = PASS_LEVEL_PTS * 4;
    claimPassLevel(s, 1);
    expect(rollSeason(s, T0 + (PASS_DAYS - 1) * DAY)).toBe(0);
    expect(rollSeason(s, T0 + PASS_DAYS * DAY)).toBe(3);
    expect(s.mail.map((m) => m.subject)).toEqual(["Passe · Temporada 1: nível 2", "Passe · Temporada 1: nível 3", "Passe · Temporada 1: nível 4"]);
    expect(s.pass).toMatchObject({ season: 2, points: 0, claimed: [] });
  });
});

describe("§4 Fonte dos Desejos", () => {
  it("só sobe por vitória confirmada ou tempo de jogo ativo (teto 100, sem decaimento)", () => {
    const s = emptyDigivice();
    wishOnWin(s);
    expect(s.wish.pct).toBe(1);
    wishOnPlay(s, WISH_PLAY_MS * 3);
    expect(s.wish.pct).toBe(4);
    for (let i = 0; i < 200; i++) wishOnWin(s);
    expect(s.wish.pct).toBe(100);
    const { hud, dv, body } = mount();
    hud.onEvents(reward(2));
    expect(dv.save.wish.pct).toBe(2);
    dv.openPanel("wish");
    // não há botão de encher nem compra; "Fazer um pedido" desabilitado até 100%
    expect(body("wish").querySelector<HTMLButtonElement>('[data-testid="wf-wish"]')!.disabled).toBe(true);
    expect(body("wish").textContent).not.toMatch(/comprar|R\$/i);
    dv.dispose();
  });

  it("100% → pedido: zera, janela de 15 min, multiplicador ×1,5 ligado na sim e desligado ao expirar", () => {
    let now = T0;
    const { dv, body, calls } = mount({ now: () => now });
    dv.save.wish.pct = 100;
    dv.openPanel("wish");
    expect(body("wish").querySelector('[data-testid="wf-status"]')!.textContent).toContain("pedido disponível");
    body("wish").querySelector<HTMLElement>('[data-testid="wf-wish"]')!.click();
    expect(dv.save.wish.pct).toBe(0);
    expect(dv.save.wish.activeUntil).toBe(T0 + WISH_WINDOW_MS);
    expect(calls.mult).toEqual([1.5]);
    expect(body("wish").querySelector('[data-testid="wf-wish"]')).toBeNull();
    expect(body("wish").querySelector('[data-testid="wf-timer"]')!.textContent).toBe("15:00");
    expect(makeWish(dv.save, now)).toBe(false); // sem 2º pedido em paralelo
    now = T0 + WISH_WINDOW_MS + 1;
    (dv as unknown as { tick(): void }).tick();
    expect(calls.mult).toEqual([1.5, 1]);
    dv.dispose();
  });

  it("a explicação do efeito está sempre visível no painel", () => {
    const { dv, body } = mount();
    dv.openPanel("wish");
    expect(body("wish").querySelector('[data-testid="wf-explain"]')!.textContent).toMatch(/\+50% de varredura por vitória por 15 minutos.*25% → 38%/);
    dv.dispose();
  });
});
