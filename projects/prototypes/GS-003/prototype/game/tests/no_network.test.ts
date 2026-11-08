// ADR-007: sem monetização, anúncios nem telemetria. Guarda estática sobre o código e os pacotes.
import { describe, expect, it } from "vitest";

const sources = import.meta.glob(["../src/**/*.ts", "../index.html"], { eager: true, query: "?raw", import: "default" }) as Record<string, string>;
const packFiles = import.meta.glob("../packs/*/*.json", { eager: true, query: "?raw", import: "default" }) as Record<string, string>;

describe("sem rede, telemetria, anúncios ou monetização", () => {
  it("código não usa APIs de rede nem URLs externas", () => {
    expect(Object.keys(sources).length).toBeGreaterThan(5);
    const banned = /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|RTCPeerConnection|https?:\/\/|gtag|analytics|adsbygoogle/i;
    for (const [path, text] of Object.entries(sources)) expect(text, path).not.toMatch(banned);
  });

  it("pacotes não têm campos de loja, preço, anúncio ou telemetria", () => {
    const banned = /"(price|prices|iap|store|shop|ads?|adUnit|premium|currencyPremium|analytics|telemetry|tracking)"\s*:/i;
    for (const [path, text] of Object.entries(packFiles)) expect(text, path).not.toMatch(banned);
  });
});
