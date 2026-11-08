import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";
import { applyReview, safeResolve, scanLibrary, type RootDef } from "./server/library";

const here = path.dirname(fileURLToPath(import.meta.url));
const gs003 = path.resolve(here, "../..");
const studio = path.resolve(gs003, "../../..");

// Raízes lidas pelo viewer. Variáveis de ambiente sobrescrevem (caminhos separados por ":").
const assetsRoot = process.env.GS_ASSETS_ROOT ?? path.join(studio, "assets/GAME-ASSETS");
const pmdRoots = (process.env.GS_PMD_ROOTS ?? ["pmd", "pmd-v2"].map((d) => path.join(gs003, "art/sprites", d)).join(":"))
  .split(":")
  .filter(Boolean);

export const ROOTS: RootDef[] = [
  { key: "assets", path: assetsRoot, editable: true, kind: "assets" },
  { key: "fixtures", path: path.join(here, "fixtures/GAME-ASSETS-sample"), editable: true, kind: "assets" },
  ...pmdRoots.map((p): RootDef => ({ key: path.basename(p), path: p, editable: false, kind: "pmd" })),
];

const MIME: Record<string, string> = { ".png": "image/png", ".json": "application/json", ".xml": "application/xml", ".md": "text/plain; charset=utf-8", ".txt": "text/plain; charset=utf-8" };

/** Endpoints só de desenvolvimento: GET /api/library, GET /fs/<root>/<arquivo>, POST /api/review. */
function libraryApi(): Plugin {
  return {
    name: "gs003-sprite-library",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url ?? "/", "http://local");
        const send = (code: number, body: unknown) => {
          res.statusCode = code;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.setHeader("Cache-Control", "no-store");
          res.end(JSON.stringify(body));
        };
        if (req.method === "GET" && url.pathname === "/api/library") {
          return send(200, scanLibrary(ROOTS, {
            schemaPath: path.join(assetsRoot, "07-manifests/creature.schema.json"),
            provisionalSchemaPath: path.join(here, "schema/creature.schema.provisional.json"),
          }));
        }
        if (req.method === "GET" && url.pathname.startsWith("/fs/")) {
          const [, , key, ...rest] = url.pathname.split("/");
          const root = ROOTS.find((r) => r.key === key);
          const abs = root && safeResolve(root.path, rest.join("/"));
          const ext = abs ? path.extname(abs).toLowerCase() : "";
          if (!abs || !MIME[ext] || !fs.existsSync(abs) || !fs.statSync(abs).isFile()) return send(404, { error: "não encontrado" });
          res.setHeader("Content-Type", MIME[ext]);
          res.setHeader("Cache-Control", "no-cache");
          return fs.createReadStream(abs).pipe(res);
        }
        if (req.method === "POST" && url.pathname === "/api/review") {
          // Só aceita chamadas da própria página (dev local); bloqueia POST cross-site.
          const origin = req.headers.origin;
          if (origin && new URL(origin).host !== req.headers.host) return send(403, { error: "origem não permitida" });
          let body = "";
          req.on("data", (c) => {
            body += c;
            if (body.length > 16_384) req.destroy();
          });
          req.on("end", () => {
            try {
              send(200, applyReview(ROOTS, JSON.parse(body)));
            } catch (e) {
              send(400, { error: (e as Error).message });
            }
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [libraryApi()],
  server: { host: "127.0.0.1", port: 5180, strictPort: false },
  test: { include: ["tests/**/*.test.ts"], environment: "node" },
});
