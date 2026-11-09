// Dev server sem cache (vite.config.ts): toda resposta do `npm run dev` sai com no-store, as pastas do GAME-ASSETS
// (fora da raiz) são vigiadas para arquivo novo entrar no glob sem reiniciar, e a porta é fixa (strictPort).

import { describe, expect, it, vi } from "vitest";
import config, { devNoStore, WATCHED_ASSET_DIRS } from "../vite.config";

function fakeServer() {
  const add = vi.fn();
  let mw: ((req: unknown, res: unknown, next: () => void) => void) | undefined;
  return { add, get mw() { return mw!; }, server: { watcher: { add }, middlewares: { use: (f: typeof mw) => (mw = f) } } };
}

describe("dev server sem cache", () => {
  it("só no `vite` (serve): força Cache-Control no-store, mesmo quando o Vite tenta pôr no-cache/immutable", () => {
    const p = devNoStore();
    expect(p.apply).toBe("serve");
    const f = fakeServer();
    (p.configureServer as (s: unknown) => void)(f.server);
    const headers: Record<string, string> = {};
    const res = { setHeader: (k: string, v: string) => void (headers[k.toLowerCase()] = String(v)) };
    const next = vi.fn();
    f.mw({}, res, next);
    expect(next).toHaveBeenCalled();
    expect(headers["cache-control"]).toBe("no-store");
    res.setHeader("Cache-Control", "max-age=31536000,immutable");
    res.setHeader("Content-Type", "image/png");
    expect(headers).toMatchObject({ "cache-control": "no-store", "content-type": "image/png" });
  });

  it("vigia as pastas do GAME-ASSETS lidas por glob (personagens, criaturas, ambientes, efeitos)", () => {
    const f = fakeServer();
    (devNoStore().configureServer as (s: unknown) => void)(f.server);
    expect(f.add).toHaveBeenCalledWith(WATCHED_ASSET_DIRS);
    expect(WATCHED_ASSET_DIRS.map((d) => d.split("/").pop())).toEqual(["01-creatures", "03-environments", "04-effects", "11-characters"]);
  });

  it("porta fixa 5174 com strictPort (um dev antigo na porta faz o novo falhar, em vez de subir em outra porta)", () => {
    expect(config.server).toMatchObject({ port: 5174, strictPort: true });
    expect(config.plugins?.some((p) => (p as { name?: string }).name === "gs003-dev-no-store")).toBe(true);
  });
});
