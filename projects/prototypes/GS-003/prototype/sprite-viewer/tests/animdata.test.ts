import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseAnimData, parseXml, pmdToVersion, PMD_TICK_MS } from "../src/animdata";
import { pngSize } from "../server/library";

const AGUMON = path.resolve(__dirname, "../../../art/sprites/pmd/agumon");
const hasAgumon = fs.existsSync(path.join(AGUMON, "AnimData.xml"));

describe("parseXml", () => {
  it("lê elementos, texto, comentários e declaração", () => {
    const doc = parseXml('<?xml version="1.0"?>\n<!-- c --><A x="1"><B>12</B><C/><B> 3 </B></A>');
    const a = doc.children[0];
    expect(a.name).toBe("A");
    expect(a.children.map((c) => c.name)).toEqual(["B", "C", "B"]);
    expect(a.children[2].text.trim()).toBe("3");
  });
  it("decodifica entidades", () => {
    expect(parseXml("<A>a &amp; b &lt;c&gt;</A>").children[0].text).toBe("a & b <c>");
  });
  it("rejeita XML malformado", () => {
    expect(() => parseXml("<A><B></A>")).toThrow(/fechamento/);
    expect(() => parseXml("<A>")).toThrow(/não foi fechado/);
    expect(() => parseXml("<A")).toThrow(/sem fim/);
  });
});

const SAMPLE = `<?xml version="1.0" ?>
<AnimData><ShadowSize>2</ShadowSize><Anims>
  <Anim><Name>Idle</Name><Index>0</Index><FrameWidth>24</FrameWidth><FrameHeight>32</FrameHeight>
    <Durations><Duration>30</Duration><Duration>15</Duration></Durations></Anim>
  <Anim><Name>Attack</Name><Index>1</Index><FrameWidth>40</FrameWidth><FrameHeight>40</FrameHeight>
    <RushFrame>0</RushFrame><HitFrame>2</HitFrame><ReturnFrame>3</ReturnFrame>
    <Durations><Duration>4</Duration><Duration>4</Duration><Duration>6</Duration><Duration>4</Duration></Durations></Anim>
  <Anim><Name>Strike</Name><Index>2</Index><CopyOf>Attack</CopyOf></Anim>
</Anims></AnimData>`;

describe("parseAnimData", () => {
  it("lê animações, tamanhos, durações e quadros de evento", () => {
    const d = parseAnimData(SAMPLE);
    expect(d.shadowSize).toBe(2);
    expect(d.anims.map((a) => a.name)).toEqual(["Idle", "Attack", "Strike"]);
    expect(d.anims[0]).toMatchObject({ frameWidth: 24, frameHeight: 32, durations: [30, 15] });
    expect(d.anims[1]).toMatchObject({ rushFrame: 0, hitFrame: 2, returnFrame: 3 });
  });
  it("resolve CopyOf mantendo nome e índice próprios", () => {
    const s = parseAnimData(SAMPLE).anims[2];
    expect(s).toMatchObject({ name: "Strike", index: 2, copyOf: "Attack", frameWidth: 40, durations: [4, 4, 6, 4], hitFrame: 2 });
  });
  it("falha com mensagem clara em dados inválidos", () => {
    expect(() => parseAnimData("<Foo/>")).toThrow(/AnimData/);
    expect(() => parseAnimData("<AnimData><Anims><Anim><Name>X</Name><FrameWidth>8</FrameWidth><FrameHeight>8</FrameHeight></Anim></Anims></AnimData>")).toThrow(/Durations/);
    expect(() => parseAnimData("<AnimData><Anims><Anim><Name>X</Name><FrameWidth>a</FrameWidth><FrameHeight>8</FrameHeight><Durations><Duration>1</Duration></Durations></Anim></Anims></AnimData>")).toThrow(/FrameWidth/);
    expect(() => parseAnimData("<AnimData><Anims><Anim><Name>X</Name><CopyOf>Nada</CopyOf></Anim></Anims></AnimData>")).toThrow(/CopyOf/);
  });
});

describe("pmdToVersion", () => {
  const sizes = { "Idle-Anim.png": { w: 48, h: 256 }, "Idle-Shadow.png": { w: 48, h: 256 }, "Attack-Anim.png": { w: 160, h: 320 } };
  it("monta grade 8 direções × quadros, com durações em ms e eventos", () => {
    const { version, warnings } = pmdToVersion({ versionId: "v", baseUrl: "/fs/x/", animDataXml: SAMPLE, sheetSizes: sizes });
    expect(warnings).toEqual([]);
    const idle = version.anims.find((a) => a.name === "Idle")!;
    expect(idle.directions).toEqual(["S", "SE", "E", "NE", "N", "NW", "W", "SW"]);
    expect(idle.loop).toBe(true);
    expect(idle.frames.W![1]).toMatchObject({ image: "/fs/x/Idle-Anim.png", sx: 24, sy: 6 * 32, sw: 24, sh: 32 });
    expect(idle.frames.S![0].durationMs).toBeCloseTo(30 * PMD_TICK_MS);
    expect(idle.shadow?.S?.[0].image).toBe("/fs/x/Idle-Shadow.png");
    const atk = version.anims.find((a) => a.name === "Attack")!;
    expect(atk.loop).toBe(false);
    expect(atk.events).toEqual([{ frame: 0, name: "rush" }, { frame: 2, name: "hit" }, { frame: 3, name: "return" }]);
    // CopyOf usa a folha da origem.
    expect(version.anims.find((a) => a.name === "Strike")!.frames.S![0].image).toBe("/fs/x/Attack-Anim.png");
  });
  it("avisa sobre folha ausente, colunas e linhas inconsistentes", () => {
    const { warnings, version } = pmdToVersion({ versionId: "v", baseUrl: "/", animDataXml: SAMPLE, sheetSizes: { "Idle-Anim.png": { w: 72, h: 100 } } });
    expect(warnings.join("\n")).toMatch(/Attack-Anim.png não encontrada/);
    expect(warnings.join("\n")).toMatch(/2 durações mas 3 colunas/);
    expect(warnings.join("\n")).toMatch(/não é múltiplo/);
    expect(version.anims.map((a) => a.name)).toEqual(["Idle"]);
  });
  it("folha de uma linha = animação sem direção (S)", () => {
    const { version } = pmdToVersion({ versionId: "v", baseUrl: "/", animDataXml: SAMPLE, sheetSizes: { "Idle-Anim.png": { w: 48, h: 32 } } });
    expect(version.anims[0].directions).toEqual(["S"]);
  });
});

describe.skipIf(!hasAgumon)("PMD real: GS-003/art/sprites/pmd/agumon", () => {
  it("abre o AnimData.xml e as folhas sem avisos", () => {
    const xml = fs.readFileSync(path.join(AGUMON, "AnimData.xml"), "utf8");
    const sheetSizes: Record<string, { w: number; h: number }> = {};
    for (const f of fs.readdirSync(AGUMON)) if (f.endsWith(".png")) sheetSizes[f] = pngSize(path.join(AGUMON, f))!;
    const { version, warnings } = pmdToVersion({ versionId: "pmd", baseUrl: "/fs/pmd/agumon/", animDataXml: xml, sheetSizes });
    expect(warnings).toEqual([]);
    expect(version.anims.map((a) => a.name)).toEqual(["Idle", "Walk", "Attack", "Hurt", "Sleep"]);
    for (const a of version.anims) expect(a.directions).toHaveLength(8);
    const atk = version.anims.find((a) => a.name === "Attack")!;
    expect(atk.frameWidth).toBe(48);
    expect(atk.events.find((e) => e.name === "hit")?.frame).toBe(1);
  });
});
