// @vitest-environment jsdom
// @vitest-environment-options {"url": "http://localhost/?pack=original-b"}
// Smoke test do shell do navegador (main.ts + HUD + renderer) em jsdom.
// Canvas 2D é substituído por um stub que só conta chamadas: valida a integração, não os pixels.
import { beforeAll, describe, expect, it } from "vitest";
import indexHtml from "../index.html?raw";
import { SAVE_VERSION, saveKey, serialize } from "../src/sim/save";
import { chooseStarter, newGame } from "../src/sim/game";
import { ENGINE_PACK, enginePack } from "./helpers";
import { loadPack } from "../src/packs";
import { Hud } from "../src/ui/hud";

const rafQueue: FrameRequestCallback[] = [];
let clock = 0;
let drawCalls = 0;

function pump(frames: number, msPerFrame = 1000) {
  for (let i = 0; i < frames; i++) {
    clock += msPerFrame;
    const cbs = rafQueue.splice(0);
    cbs.forEach((cb) => cb(clock));
  }
}
const click = (sel: string) => {
  const el = document.querySelector<HTMLButtonElement>(sel);
  expect(el, sel).not.toBeNull();
  el!.click();
};
const gs = () => (window as any).gs;

beforeAll(async () => {
  document.body.innerHTML = indexHtml.match(/<body>([\s\S]*)<\/body>/)![1].replace(/<script[\s\S]*?<\/script>/, "");
  const ctx = new Proxy({}, { get: (_t, p) => (p === "imageSmoothingEnabled" ? false : () => void drawCalls++), set: () => true });
  HTMLCanvasElement.prototype.getContext = (() => ctx) as any;
  window.requestAnimationFrame = (cb) => (rafQueue.push(cb), rafQueue.length);
  clock = performance.now();
  // Save existente de 2 h atrás => deve mostrar o relatório offline ao abrir.
  const c = enginePack();
  const s = newGame(c, 77, Date.now() - 2 * 3600_000);
  localStorage.setItem(saveKey(ENGINE_PACK), serialize(s, s.lastSeenAt));
  await import("../src/main");
});

describe("shell do navegador (jsdom)", () => {
  it("carrega o save, aplica offline e mostra o relatório", () => {
    expect(document.querySelector("#offline")?.textContent).toMatch(/Tempo creditado: 2\.00 h/);
    expect(gs().state.party[0].level).toBeGreaterThan(1);
    click("[data-action=close-offline]");
    expect(document.querySelector("#offline")).toBeNull();
  });

  it("roda o loop, desenha e renderiza o HUD com o time 3v3", () => {
    pump(30);
    expect(drawCalls).toBeGreaterThan(100);
    expect(document.querySelectorAll(".party li")).toHaveLength(3);
    expect(document.querySelector("header")?.textContent).toContain(enginePack().areas["zona_01"].name);
    expect(document.querySelector("select[data-action=pack]")?.textContent).toMatch(/Digimon/);
  });

  it("chefe: botão, pausa de decisão com modal, escolha e vitória", () => {
    click("[data-action=boss]");
    pump(1);
    expect(document.querySelector(".decision")).not.toBeNull();
    const frozenTick = gs().state.tick;
    pump(20);
    expect(gs().state.tick).toBe(frozenTick);
    let guard = 0;
    while (!gs().state.bossesDefeated["zona_01"] && guard++ < 500) {
      if (document.querySelector(".decision")) click("[data-action=decide][data-index='0']");
      pump(1, 200);
    }
    expect(gs().state.bossesDefeated["zona_01"]).toBe(true);
    expect(document.querySelector(".log")?.textContent).toMatch(/derrotado/);
  });

  it("salvar grava envelope versionado no localStorage", () => {
    click("[data-action=save]");
    const env = JSON.parse(localStorage.getItem(saveKey(ENGINE_PACK))!);
    expect(env.v).toBe(SAVE_VERSION);
    expect(env.pack).toBe(ENGINE_PACK);
    expect(env.state.bossesDefeated.zona_01).toBe(true);
  });
});

describe("HUD com fan pack", () => {
  it("mostra o aviso de não afiliação e textos do pacote", () => {
    const c = loadPack("digimon-fan");
    const root = document.createElement("div");
    const hud = new Hud(root, c, [c.pack], {} as any);
    const s = newGame(c, 1, Date.now());
    hud.render(s, 1);
    expect(root.querySelector(".disclaimer")?.textContent).toMatch(/não oficial[\s\S]*Bandai/);
    expect(root.textContent).toContain("Campo de Bits");
    // Jogo novo abre na escolha de parceiro: um card por opção do pacote, com a evolução em preview.
    const cards = root.querySelectorAll<HTMLButtonElement>(".starter [data-action=starter]");
    expect([...cards].map((b) => b.dataset.species)).toEqual(c.theme.starterOptions);
    for (const id of c.theme.starterOptions!) expect(root.textContent).toContain(c.creatures[id].name);
    expect(root.textContent).toContain(c.creatures[c.creatures[c.theme.starterOptions![0]].evolutions![0].to].name);
  });

  it("HUD: escolha de encontro e Pontos de Treino aparecem e emitem comandos", () => {
    const c = loadPack("digimon-fan");
    const root = document.createElement("div");
    const calls: string[] = [];
    const hud = new Hud(root, c, [c.pack], {
      chooseEncounter: (i: number) => calls.push(`enc${i}`),
      allocateTraining: (uid: string, stat: string) => calls.push(`${uid}:${stat}`),
    } as any);
    const s = newGame(c, 1, Date.now());
    chooseStarter(c, s, c.theme.starterOptions![0]);
    s.party[0].trainPoints = 1;
    s.encounter = { options: [0, 1], autoAtTick: 100 };
    hud.render(s, 1);
    expect(root.querySelector(".starter")).toBeNull();
    root.querySelector<HTMLButtonElement>(".encounter [data-action=encounter][data-index='1']")!.click();
    root.querySelector<HTMLButtonElement>("[data-action=train][data-stat=def]")!.click();
    expect(calls).toEqual(["enc1", `${s.party[0].uid}:def`]);
  });
});
