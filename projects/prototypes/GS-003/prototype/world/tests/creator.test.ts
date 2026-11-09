// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { previewPose, PREVIEW_FRAME_MS, PREVIEW_TURN_MS, TamerCreator } from "../src/ui/creator";

afterEach(() => {
  document.body.innerHTML = "";
});

function mount() {
  const onConfirm = vi.fn();
  const drawPreview = vi.fn();
  const c = new TamerCreator(document.body, { onConfirm, drawPreview, seed: 3 });
  return { c, el: c.el, onConfirm, drawPreview };
}

describe("criador de Tamer v3 (pt-BR)", () => {
  it("grade dos 12 presets (retrato + sprite), 8 cores de cabelo e nome; sem as opções modulares antigas", () => {
    const { el } = mount();
    expect(el.querySelectorAll("[data-preset]")).toHaveLength(12);
    expect(el.querySelectorAll("[data-portrait]")).toHaveLength(12);
    expect(el.querySelectorAll("[data-sprite]")).toHaveLength(12);
    expect(el.querySelectorAll("[data-hair]")).toHaveLength(8);
    for (const g of ["model", "skin", "hairCut", "outfit", "outfitColor"]) expect(el.querySelector(`[data-group="${g}"]`)).toBeNull();
    expect(el.textContent).not.toContain("Tom de pele");
    expect(el.textContent).toContain("Personagem");
    expect(el.textContent).toContain("Cor do cabelo");
    expect(el.textContent).toContain("Coragem");
    expect(el.querySelector('[data-act="confirm"]')!.textContent).toBe("Entrar no mundo");
    expect(el.querySelector<HTMLInputElement>('[data-testid="cr-name"]')!.value).toBe("Kaio");
    // preset 1 na cor canônica
    expect(el.querySelector('[data-preset="TAMER-0003"]')!.getAttribute("aria-pressed")).toBe("true");
    expect(el.querySelector('[data-hair="ruivo"]')!.getAttribute("aria-pressed")).toBe("true");
  });

  it("escolher preset e cor atualiza o look, os botões e o preview; trocar de preset volta à cor original dele", () => {
    const { c, el, drawPreview } = mount();
    el.querySelector<HTMLButtonElement>('[data-preset="TAMER-0009"]')!.click();
    expect(c.look).toMatchObject({ preset: "TAMER-0009", hair: "ruivo" });
    el.querySelector<HTMLButtonElement>('[data-hair="azul"]')!.click();
    expect(c.look).toMatchObject({ preset: "TAMER-0009", hair: "azul" });
    expect(el.querySelector('[data-preset="TAMER-0009"]')!.getAttribute("aria-pressed")).toBe("true");
    expect(el.querySelector('[data-preset="TAMER-0003"]')!.getAttribute("aria-pressed")).toBe("false");
    expect(el.querySelector('[data-hair="azul"]')!.getAttribute("aria-pressed")).toBe("true");
    expect(drawPreview).toHaveBeenCalledWith(el.querySelector('[data-testid="cr-preview"]'), expect.objectContaining({ preset: "TAMER-0009", hair: "azul" }), "S", 0);
    expect(el.querySelector('[data-testid="cr-summary"]')!.textContent).toBe("Raposa · Viseira · cabelo azul");
    el.querySelector<HTMLButtonElement>('[data-preset="TAMER-0013"]')!.click();
    expect(c.look).toMatchObject({ preset: "TAMER-0013", hair: "prateado" });
  });

  it("Aleatório troca preset/cor e mantém o nome", () => {
    const { c, el } = mount();
    const seen = new Set<string>();
    for (let i = 0; i < 8; i++) {
      el.querySelector<HTMLButtonElement>('[data-act="random"]')!.click();
      seen.add(`${c.look.preset}|${c.look.hair}`);
      expect(c.look.name).toBe("Kaio");
    }
    expect(seen.size).toBeGreaterThan(3);
  });

  it("nome vazio bloqueia a confirmação; Entrar no mundo devolve o look e fecha a tela", () => {
    const { el, onConfirm } = mount();
    const input = el.querySelector<HTMLInputElement>('[data-testid="cr-name"]')!;
    input.value = "  ";
    input.dispatchEvent(new Event("input"));
    expect(el.querySelector<HTMLButtonElement>('[data-act="confirm"]')!.disabled).toBe(true);
    expect(el.querySelector<HTMLElement>('[data-testid="cr-err"]')!.hidden).toBe(false);
    input.value = "Nina";
    input.dispatchEvent(new Event("input"));
    el.querySelector<HTMLButtonElement>('[data-preset="TAMER-0005"]')!.click();
    el.querySelector<HTMLButtonElement>('[data-act="confirm"]')!.click();
    expect(onConfirm).toHaveBeenCalledWith({ name: "Nina", preset: "TAMER-0005", hair: "ruivo" });
    expect(document.querySelector(".creator")).toBeNull();
  });

  it("preview gira S → E → N → W andando (4 quadros de walk)", () => {
    expect(previewPose(0)).toEqual({ dir: "S", frame: 0 });
    expect(previewPose(PREVIEW_TURN_MS).dir).toBe("E");
    expect(previewPose(PREVIEW_TURN_MS * 2).dir).toBe("N");
    expect(previewPose(PREVIEW_TURN_MS * 3).dir).toBe("W");
    expect(previewPose(PREVIEW_TURN_MS * 4).dir).toBe("S");
    expect(previewPose(PREVIEW_FRAME_MS * 5).frame).toBe(1);
    expect(previewPose(-5)).toEqual({ dir: "S", frame: 0 });
  });
});

describe("nome do Tamer: validação em JS (QA R1 #2)", () => {
  it("checkTamerName: vazio, longo e caracteres inválidos; aparar e juntar espaços", async () => {
    const { checkTamerName, safeTamerName, normalizeLook } = await import("../src/assets/tamer-presets");
    expect(checkTamerName("  Nina   Sol ")).toEqual({ ok: true, name: "Nina Sol" });
    expect(checkTamerName("   ")).toMatchObject({ ok: false, error: "empty" });
    expect(checkTamerName("NomeMuitoLongoDemaisQA")).toMatchObject({ ok: false, error: "long" });
    expect(checkTamerName("<b>x</b>")).toMatchObject({ ok: false, error: "chars" });
    expect(checkTamerName("Joãozinho_2")).toEqual({ ok: true, name: "Joãozinho_2" });
    expect(safeTamerName("NomeMuitoLongoDemaisQA")).toBe("NomeMuitoLongo");
    expect(safeTamerName("<<>>")).toBe("Kaio");
    expect(normalizeLook({ name: "NomeMuitoLongoDemaisQA" }).name).toHaveLength(14);
  });

  it("valor setado por script além do maxlength é cortado no input e no look; caractere inválido bloqueia", () => {
    const { c, el, onConfirm } = mount();
    const input = el.querySelector<HTMLInputElement>('[data-testid="cr-name"]')!;
    input.value = "NomeMuitoLongoDemaisQA";
    input.dispatchEvent(new Event("input"));
    expect(input.value).toBe("NomeMuitoLongo");
    expect(c.look.name).toBe("NomeMuitoLongo");
    input.value = "Ana<script>";
    input.dispatchEvent(new Event("input"));
    expect(el.querySelector<HTMLButtonElement>('[data-act="confirm"]')!.disabled).toBe(true);
    expect(el.querySelector('[data-testid="cr-err"]')!.textContent).toContain("letras");
    c.confirm();
    expect(onConfirm).not.toHaveBeenCalled();
    input.value = "Ana";
    input.dispatchEvent(new Event("input"));
    c.confirm();
    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ name: "Ana" }));
  });

  it("aviso de fan game do index.html tem o texto do ADR-007 (Bandai/Toei Animation)", async () => {
    const { readFileSync } = await import("node:fs");
    const html = readFileSync(`${process.cwd()}/index.html`, "utf8");
    expect(html).toContain("Fan game não oficial, sem afiliação com Bandai/Toei Animation.");
  });
});
