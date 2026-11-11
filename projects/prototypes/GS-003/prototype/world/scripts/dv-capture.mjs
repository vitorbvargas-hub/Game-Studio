// GS-003 QO — Digivice VI 1.0 (DIGIVICE_VI1_SPEC.md P0/P1): capturas 1920×1080 na URL PADRÃO (?map=digimon-forest-01)
// de cada seção do núcleo do Digivice, abertas pelas portas reais (bloco do Tamer, retrato do parceiro, tecla V, nó
// Conquistas do anel) e pela aba lateral. Servidor PRÓPRIO na 5191 (a 5190 é do coordenador — não usar/derrubar).
//   (cd prototype/world && npx vite --port 5191 --strictPort &)
//   PW_CORE=… CHROME=… CHROME_LIBS=… BASE=http://127.0.0.1:5191 node scripts/dv-capture.mjs
// Saída: quality-overhaul/phase3/panels/dv_*.png + dv_capture.json.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = process.env.OUT ?? join(ROOT, "../../quality-overhaul/phase3/panels");
const BASE = process.env.BASE ?? "http://127.0.0.1:5191";
const W = 1920;
const H = 1080;
const ID = "digimon-forest-01";
mkdirSync(OUT, { recursive: true });

const { chromium } = await import(process.env.PW_CORE);
const browser = await chromium.launch({
  executablePath: process.env.CHROME,
  args: ["--no-sandbox", "--disable-gpu", "--no-proxy-server", "--hide-scrollbars", "--mute-audio"],
  env: { ...process.env, LD_LIBRARY_PATH: [process.env.CHROME_LIBS, process.env.LD_LIBRARY_PATH].filter(Boolean).join(":") },
});
const report = { date: new Date().toISOString(), base: BASE, viewport: [W, H], defaultUrl: `${BASE}/?map=${ID}`, shots: {} };
const errors = [];

async function open(page) {
  const url = `${BASE}/?map=${ID}&criador=0&novo=1&seed=7&auto=0&time=day`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForFunction((id) => window.__gs003 && window.__gs003.mapId === id, ID, { timeout: 120000 });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction((id) => window.__gs003 && window.__gs003.mapId === id, ID, { timeout: 120000 });
  await page.waitForSelector('[data-testid="dg-hub"]', { timeout: 30000 });
  await page.waitForTimeout(2000);
  return url;
}
const state = (page) =>
  page.evaluate(() => {
    const g = window.__gs003;
    const dvc = document.querySelector('[data-panel="dvc"] [data-testid="dvc"]');
    const dv = g.hud.digivice.save;
    return {
      openPanel: document.querySelector(".panel-wrap.open")?.dataset.panel ?? null,
      section: dvc?.dataset.section ?? null,
      pendingBlocks: document.querySelectorAll('.panel-wrap.open [data-testid="dvc-pending"]').length,
      barsInPending: document.querySelectorAll('.panel-wrap.open [data-testid="dvc-pending"] .dg-bar').length,
      evoShortcutInGrid: !!document.querySelector('.hud-menu [data-short="evo"]'),
      tamer: g.hud.tamerProgress(),
      activity: { wins: dv.wins, scans: dv.scans.length, evolves: dv.evolves, maps: dv.maps.length, bossAwakens: dv.bossAwakens, bossDefeats: dv.bossDefeats },
    };
  });
async function shot(page, name, meta) {
  await page.waitForTimeout(450);
  await page.screenshot({ path: join(OUT, name) });
  report.shots[name] = { ...meta, state: await state(page) };
  console.log("ok", name, JSON.stringify(report.shots[name].state));
}
const nav = async (page, sec) => {
  await page.click(`[data-panel="dvc"] [data-core="${sec}"]`);
  await page.waitForTimeout(300);
};

const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
page.on("pageerror", (e) => errors.push(String(e)));

const url = await open(page);
// um pouco de jogo real (AUTO ligado ~35 s) para o registro de atividade não ficar todo em zero — nada injetado
await page.click('[data-act="auto"]');
await page.waitForTimeout(35000);
await page.click('[data-act="auto"]');
await page.waitForTimeout(4000);

// porta 3: bloco do Tamer → Tamer · Perfil
await page.click('[data-testid="tamer"]');
await shot(page, "dv_tamer_perfil.png", { url, door: "clique no bloco TAMER da barra inferior", what: "Tamer · Perfil (nome/nível/XP = hud.tamerProgress)" });
await nav(page, "tamer-attrs");
await shot(page, "dv_tamer_atributos.png", { url, door: "aba lateral", what: "Tamer · Atributos = registro de atividade do DigiviceSave (jogo real, AUTO ~35 s)" });
await nav(page, "tamer-powers");
await shot(page, "dv_tamer_poderes.png", { url, door: "aba lateral", what: "Tamer · Poderes — P2, aguardando aprovação de regra (sem número)" });
await nav(page, "tamer-talents");
await shot(page, "dv_tamer_talentos.png", { url, door: "aba lateral", what: "Tamer · Árvore de talentos — P2, aguardando aprovação de regra" });

// porta 2: retrato do parceiro → Digimon · Perfil
await page.keyboard.press("Escape");
await page.waitForTimeout(300);
await page.click('[data-testid="partner"]');
await shot(page, "dv_digimon_perfil.png", { url, door: "clique no retrato do parceiro", what: "Digimon · Perfil (antiga ficha holográfica, metade de cima)" });
await nav(page, "mon-attrs");
await shot(page, "dv_digimon_atributos.png", { url, door: "aba lateral", what: "Digimon · Atributos (PV/ATQ/DEF/VEL + afinidades)" });
await nav(page, "mon-skills");
await shot(page, "dv_digimon_habilidades.png", { url, door: "aba lateral", what: "Digimon · Habilidades — somente leitura + 'Editar em Equipe & Box'" });
await nav(page, "mon-talents");
await shot(page, "dv_digimon_talentos.png", { url, door: "aba lateral", what: "Digimon · Árvore de talentos — P2, aguardando aprovação de regra" });
await nav(page, "evo");
await shot(page, "dv_evolucao.png", { url, door: "aba lateral", what: "Evolução unificada (árvore com %; sem atalho 'evo' na grade)" });
await nav(page, "bond");
await shot(page, "dv_vinculo.png", { url, door: "aba lateral", what: "Vínculo — estado bloqueado honesto (sem barras)" });

// porta 1: tecla V → Banco de dados
await page.keyboard.press("Escape");
await page.waitForTimeout(300);
await page.keyboard.press("v");
await shot(page, "dv_banco_dados.png", { url, door: "tecla V (atalho 'Digivice' da grade)", what: "Banco de dados (o bestiário de antes, agora seção do núcleo)" });

// anel externo: nó Conquistas → Registros e descobertas
await page.keyboard.press("Escape");
await page.waitForTimeout(300);
await page.click('[data-testid="dg-hub"]');
await page.waitForTimeout(400);
await page.click('[data-dg="trophy"]');
await shot(page, "dv_registros_conquistas.png", { url, door: "nó Conquistas do anel (Alt A)", what: "Registros e descobertas · Conquistas" });
await page.click('[data-panel="dvc"] [data-rec-tab="maps"]');
await shot(page, "dv_registros_mapas.png", { url, door: "sub-aba", what: "Registros e descobertas · Mapas visitados (DigiviceSave.maps)" });

// grupos recolhidos (disclosure) + o anel continua com 6 nós
await page.click('[data-panel="dvc"] [data-core-group="tamer"]');
await page.click('[data-panel="dvc"] [data-core-group="digimon"]');
await shot(page, "dv_nav_recolhida.png", { url, door: "disclosure ▸ nos 2 grupos", what: "aba lateral com Tamer/Digimon recolhidos" });
await page.keyboard.press("Escape");
await page.waitForTimeout(300);
await page.click('[data-testid="dg-hub"]');
await page.hover('[data-dg="trophy"]');
await shot(page, "dv_anel_externo.png", { url, door: "hub", what: "anel externo inalterado: Guilda/Correio/Passe/Fonte/Chefe/Conquistas; grade inferior sem 'evo'" });
await page.keyboard.press("Escape");

// gatilho de nível → aba Evolução do núcleo (o antigo modal "Digivolução disponível"): parceira trocada para uma
// espécie que ramifica, em nível alto (estado de TESTE via __gs003.setPartner, rotulado)
const fork = await page.evaluate(() => {
  const c = window.__gs003.sim.content;
  return Object.keys(c.moves.paths).find((id) => c.species[id] && c.moves.paths[id].length >= 2 && c.moves.paths[id].every((p) => c.species[p.to]));
});
if (fork) {
  await page.evaluate((f) => window.__gs003.setPartner(f, 40), fork);
  await page.waitForTimeout(3000);
  const opened = await page.evaluate(() => document.querySelector('[data-panel="dvc"] [data-testid="dvc"]')?.dataset.section ?? null);
  if (opened !== "evo") await page.evaluate(() => window.__gs003.hud.openCore("evo", { evoPrompt: true }));
  report.evoTriggerOpenedByItself = opened === "evo";
  await shot(page, "dv_evolucao_gatilho.png", { url, door: opened === "evo" ? "gatilho automático (checkEvolve)" : "openCore('evo', {evoPrompt}) pelo script", what: `parceira de TESTE ${fork} Nv.40 (setPartner): aviso 'Digivolução disponível' + árvore` });
}

report.errors = errors;
writeFileSync(join(OUT, "dv_capture.json"), JSON.stringify(report, null, 2));
console.log("erros de página:", errors.length);
await browser.close();
