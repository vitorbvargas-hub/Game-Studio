import { describe, expect, it } from "vitest";
import { labelMetrics, layoutLabels, type EntityLabel, type PlacedLabel } from "../src/render/labels";

const m = labelMetrics(2);
const measure = (l: EntityLabel) => (l.name.length + (l.level !== undefined ? 5 : 0)) * 7;
const lab = (id: string, x: number, y: number, priority = 1, name = id): EntityLabel => ({ id, name, level: 5, x, y, color: "#fff", priority });
const overlap = (a: PlacedLabel, b: PlacedLabel) => a.px < b.px + b.w && b.px < a.px + a.w && a.py < b.py + b.h && b.py < a.py + a.h;

describe("nomes e níveis sobre as entidades (layout sem sobreposição)", () => {
  it("rótulos afastados ficam na posição natural", () => {
    const out = layoutLabels([lab("a", 50, 100), lab("b", 200, 100)], measure, 2, m);
    expect(out.every((l) => l.lifted === 0)).toBe(true);
  });

  it("vários juntos no mesmo ponto: nenhum par se sobrepõe; quem colide sobe (empilha)", () => {
    const labels = Array.from({ length: 8 }, (_, i) => lab(`e${i}`, 100 + (i % 3) * 4, 120 + (i % 2) * 3, i === 0 ? 5 : 1, `Digimon${i}`));
    const out = layoutLabels(labels, measure, 2, m);
    for (let i = 0; i < out.length; i++) for (let j = i + 1; j < out.length; j++) expect(overlap(out[i], out[j]), `${out[i].id}×${out[j].id}`).toBe(false);
    expect(out.filter((l) => l.lifted > 0).length).toBeGreaterThanOrEqual(6);
  });

  it("prioridade: o Tamer local fica no lugar natural e os outros desviam", () => {
    const out = layoutLabels([lab("wild", 100, 100, 1), lab("p1", 102, 101, 5), lab("partner", 98, 99, 4)], measure, 2, m);
    const by = Object.fromEntries(out.map((l) => [l.id, l]));
    expect(by.p1.lifted).toBe(0);
    expect(by.partner.lifted).toBeGreaterThan(0);
    expect(by.wild.lifted).toBeGreaterThan(0);
  });

  it("escala: a âncora é multiplicada pela escala da tela e a fonte nunca fica abaixo de 11 px", () => {
    const [l] = layoutLabels([lab("a", 100, 50)], measure, 3, labelMetrics(3));
    expect(l.py + l.h).toBe(150);
    expect(Math.round(l.px + l.w / 2)).toBe(300);
    expect(labelMetrics(1).font).toMatch(/\b11px/);
  });
});
