// ADR-007: sem monetização, anúncios nem telemetria. Guarda estática sobre o código e os pacotes.
import { describe, expect, it } from "vitest";

const sources = import.meta.glob(["../src/**/*.ts", "../index.html"], { eager: true, query: "?raw", import: "default" }) as Record<string, string>;
// O spike da arena fica fora do build, mas roda no navegador (index.html próprio): mesma guarda.
const arenaSources = import.meta.glob(["../arena-spike/**/*.ts", "../arena-spike/**/*.html", "../arena-spike/**/*.json"], {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;
const packFiles = import.meta.glob("../packs/*/*.json", { eager: true, query: "?raw", import: "default" }) as Record<string, string>;

const BANNED_NETWORK = /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|RTCPeerConnection|https?:\/\/|gtag|analytics|adsbygoogle/i;

describe("sem rede, telemetria, anúncios ou monetização", () => {
  it("código não usa APIs de rede nem URLs externas", () => {
    expect(Object.keys(sources).length).toBeGreaterThan(5);
    for (const [path, text] of Object.entries(sources)) expect(text, path).not.toMatch(BANNED_NETWORK);
  });

  it("arena-spike/ também não usa APIs de rede nem URLs externas", () => {
    const paths = Object.keys(arenaSources);
    expect(paths).toContain("../arena-spike/index.html");
    expect(paths).toContain("../arena-spike/main.ts");
    expect(paths.length).toBeGreaterThan(8);
    for (const [path, text] of Object.entries(arenaSources)) expect(text, path).not.toMatch(BANNED_NETWORK);
  });

  it("pacotes não têm campos de loja, preço, anúncio ou telemetria", () => {
    const banned = /"(price|prices|iap|store|shop|ads?|adUnit|premium|currencyPremium|analytics|telemetry|tracking)"\s*:/i;
    for (const [path, text] of Object.entries(packFiles)) expect(text, path).not.toMatch(banned);
  });
});
