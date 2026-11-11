// Flags do Quality Overhaul que viraram padrão (2026-11-11): anim v2 e encontros GS-012, com opt-out.
import { describe, expect, it } from "vitest";
import { animV2Of, encountersOf } from "../src/save/flags";

const q = (s: string) => new URLSearchParams(s);

describe("flags padrão da branch quality-overhaul", () => {
  it("anim v2 é o padrão; ?anim=v1 volta ao antigo", () => {
    expect(animV2Of(q("?map=digimon-forest-01"))).toBe(true);
    expect(animV2Of(q("?anim=v2"))).toBe(true);
    expect(animV2Of(q("?anim=v1"))).toBe(false);
  });
  it("encontros ligados por padrão; ?encounters=0 desliga; ?encdebug=1 sempre liga", () => {
    expect(encountersOf(q("?map=digimon-forest-01"))).toBe(true);
    expect(encountersOf(q("?encounters=1"))).toBe(true);
    expect(encountersOf(q("?encounters=0"))).toBe(false);
    expect(encountersOf(q("?encounters=0&encdebug=1"))).toBe(true);
  });
});
