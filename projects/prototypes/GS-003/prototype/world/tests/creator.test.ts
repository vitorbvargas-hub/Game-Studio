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

describe("criador de Tamer (pt-BR)", () => {
  it("grupos e quantidades: modelo 2, pele 3, corte 7, cabelo 8, roupa 3, cor da roupa 7; nome; textos em português", () => {
    const { el } = mount();
    const n = (g: string) => el.querySelectorAll(`[data-group="${g}"] button`).length;
    expect([n("model"), n("skin"), n("hairCut"), n("hairColor"), n("outfit"), n("outfitColor")]).toEqual([2, 3, 7, 8, 3, 7]);
    expect(el.querySelector("h1")!.textContent).toBe("Crie seu Tamer");
    expect(el.textContent).toContain("Tom de pele");
    expect(el.textContent).toContain("Cor do cabelo");
    expect(el.textContent).toContain("Marias-chiquinhas");
    expect(el.querySelector('[data-act="confirm"]')!.textContent).toBe("Entrar no mundo");
    expect(el.querySelector<HTMLInputElement>('[data-testid="cr-name"]')!.value).toBe("Kaio");
  });

  it("escolher atualiza o look, o botão marcado e o preview; Aleatório muda tudo e mantém o nome", () => {
    const { c, el, drawPreview } = mount();
    el.querySelector<HTMLButtonElement>('[data-opt="hairCut"][data-val="moicano"]')!.click();
    el.querySelector<HTMLButtonElement>('[data-opt="skin"][data-val="deep"]')!.click();
    el.querySelector<HTMLButtonElement>('[data-opt="outfitColor"][data-val="roxo"]')!.click();
    expect(c.look).toMatchObject({ hairCut: "moicano", skin: "deep", outfitColor: "roxo" });
    expect(el.querySelector('[data-opt="hairCut"][data-val="moicano"]')!.getAttribute("aria-pressed")).toBe("true");
    expect(el.querySelector('[data-opt="hairCut"][data-val="curto"]')!.getAttribute("aria-pressed")).toBe("false");
    expect(drawPreview).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ hairCut: "moicano" }), "S", 0);
    const before = { ...c.look };
    el.querySelector<HTMLButtonElement>('[data-act="random"]')!.click();
    expect(c.look).not.toEqual(before);
    expect(c.look.name).toBe("Kaio");
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
    el.querySelector<HTMLButtonElement>('[data-opt="model"][data-val="female"]')!.click();
    el.querySelector<HTMLButtonElement>('[data-act="confirm"]')!.click();
    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ name: "Nina", model: "female" }));
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
