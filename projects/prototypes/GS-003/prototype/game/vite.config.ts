import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "./",
  server: { host: "127.0.0.1", port: 5173 },
  build: { target: "es2022", assetsInlineLimit: 0 },
  test: { include: ["tests/**/*.test.ts"], environment: "node" },
});
