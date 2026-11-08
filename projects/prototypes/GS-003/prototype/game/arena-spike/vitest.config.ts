import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Config isolada: o `npm test` principal (tests/**) não enxerga o spike.
export default defineConfig({
  root: fileURLToPath(new URL("..", import.meta.url)),
  test: { include: ["arena-spike/*.check.ts"], environment: "node" },
});
