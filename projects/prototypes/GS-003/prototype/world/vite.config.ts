import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

// Biblioteca de assets do estúdio (fora deste projeto). Lida via import.meta.glob com o alias abaixo.
const GAME_ASSETS = fileURLToPath(new URL("../../../../../assets/GAME-ASSETS", import.meta.url));
// Pacote de conteúdo do protótipo idle (stats, skills, balance), reaproveitado sem cópia.
const GAME_PROTO = fileURLToPath(new URL("../game", import.meta.url));
// Pesquisa do GS-003 (tabela de tamanhos do game-research, opcional).
const GS003_RESEARCH = fileURLToPath(new URL("../../research", import.meta.url));
/** Pastas do GAME-ASSETS lidas pelo jogo (glob): vigiadas no dev para arquivo novo/removido entrar sem reiniciar. */
export const WATCHED_ASSET_DIRS = ["01-creatures", "03-environments", "04-effects", "11-characters"].map((d) => `${GAME_ASSETS}/${d}`);

/**
 * Dev sem cache: toda resposta do `npm run dev` sai com `Cache-Control: no-store` (o padrão do Vite é `no-cache`
 * com ETag, e as dependências pré-empacotadas são `immutable`), para o navegador nunca mostrar uma versão velha do
 * jogo nem dos PNG/JSON do game-art. Também vigia as pastas do GAME-ASSETS (fora da raiz do projeto): sem isso, um
 * arquivo NOVO que casa com um glob só aparecia depois de reiniciar o servidor. Só vale no `vite` (dev), não no build.
 */
export function devNoStore(): Plugin {
  return {
    name: "gs003-dev-no-store",
    apply: "serve",
    configureServer(server) {
      server.watcher.add(WATCHED_ASSET_DIRS);
      server.middlewares.use((_req, res, next) => {
        const set = res.setHeader.bind(res);
        res.setHeader = (name: string, value: number | string | readonly string[]) =>
          name.toLowerCase() === "cache-control" ? set(name, "no-store") : set(name, value);
        set("Cache-Control", "no-store");
        next();
      });
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [devNoStore()],
  resolve: { alias: { "@game-assets": GAME_ASSETS, "@game": GAME_PROTO, "@gs003-research": GS003_RESEARCH } },
  // strictPort: se a 5174 estiver ocupada (outro `npm run dev` antigo), falha em vez de subir em outra porta e deixar
  // a aba velha apontando para o servidor antigo.
  server: { host: "127.0.0.1", port: 5174, strictPort: true, fs: { allow: [".", GAME_ASSETS, GAME_PROTO, GS003_RESEARCH] } },
  build: { target: "es2022", assetsInlineLimit: 0 },
  test: { include: ["tests/**/*.test.ts"], environment: "node" },
});
