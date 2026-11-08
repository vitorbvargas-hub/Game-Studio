import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Biblioteca de assets do estúdio (fora deste projeto). Lida via import.meta.glob com o alias abaixo.
const GAME_ASSETS = fileURLToPath(new URL("../../../../../assets/GAME-ASSETS", import.meta.url));
// Pacote de conteúdo do protótipo idle (stats, skills, balance), reaproveitado sem cópia.
const GAME_PROTO = fileURLToPath(new URL("../game", import.meta.url));

export default defineConfig({
  base: "./",
  resolve: { alias: { "@game-assets": GAME_ASSETS, "@game": GAME_PROTO } },
  server: { host: "127.0.0.1", port: 5174, fs: { allow: [".", GAME_ASSETS, GAME_PROTO] } },
  build: { target: "es2022", assetsInlineLimit: 0 },
  test: { include: ["tests/**/*.test.ts"], environment: "node" },
});
