// WorldView: renderer Canvas 2D do mundo. Lê o Presenter (estado visual) e nunca a sim.
// Camadas (§6): chão (chunks pré-renderizados) → sombras → entidades e props por Y dos pés → efeitos → barras/números.
// Pixel-perfect: coordenadas inteiras, imageSmoothing desligado; a escala inteira de tela é feita pelo CSS (main.ts).

import { framePivot, imageUrlOf, mapScaleOf, type CreatureVisual, type SizeEntry } from "../assets/creatures";
import { ANIMATED_TILES, animatedTileKey, drawPlaceholderTile, propPlaceholder, type TileSource } from "../assets/tiles";
import type { MapCurve, MapProp, WorldMap } from "../sim/map";
import type { Dir8, LogicState, Vec } from "../sim/types";
import {
  attackLunge,
  DEFEAT_FADE_MS,
  ease,
  frameAt,
  framesFor,
  knockback,
  LUNGE_PX,
  resolveAnim,
  resolveFacing,
  type Dir4,
} from "./anim";
import { ctlFrame, newCtl, stepCtl, type CtlFrame, type CtlInput, type CtlState } from "./animctl";
import { standPose, standRemap } from "./standpose";
import { drawImpact, shakeOffset } from "./fx";
import type { EncounterFx } from "./encounterFx";
import { bandRows, bandShifts, fadeToward, fgCovers, scrollPixels, swayOffset, waterCompose, waterComposeNoisy, waterFrame, waterMixFrom, waterNoiseFor, type Rect, type SwayCfg, type WaterMix } from "./life";
import { hueShifted, type CanvasFactory, type ImageLike, type ImageStore } from "./images";
import type { EntityLabel } from "./labels";
import { idleBob, lerpCamera, MOVING_PX_S, newMotion, stepMotion, walkFrameIndex, type MotionState } from "./motion";
import { drawOutlinedText, pixelTextWidth } from "./pixelfont";
import { LEVEL_UP_FX_MS, EXCLAIM_MS, elementOf, evoFrame, swapFrame, SWAP_ENTER_MS, type EvoFrame, type Presenter, type SwapFrame, type VisualEntity } from "./presenter";
import type { VfxFrame } from "./vfx/archetypes";
import { drawCast, type Cast, type SheetDrawer } from "./vfx/engine";
import { ambientAt } from "./daynight";
import { castShadowCanvas, castShadowGeometry, rimLit, type CastShadowCfg, type RimLightCfg } from "./lighting";
import { NIGHT_STEPS, nightFrame, nightStep } from "./nightgrade";
import { buildCurveIndex, composeCurveOverlay, type CurveIndex } from "./curves";
import { composePathTile, pathMask, type PathSmoothCfg } from "./pathsmooth";
import { BOT_TAMER, LOCAL_TAMER, makeTamerFrames, TAMER_H, TAMER_PIVOT, TAMER_W } from "./tamer";
import { ambientMix, drawDecals, drawParticles, drawPatches, drawPropShadows, flicker, fogAnchors, fogSprite, lightSprite, mapLights, type LightSource, type LookCfg } from "./look";

export const CHUNK_TILES = 16;

/** Touceiras da grama de encontro (GS-012): a de P4 e a dedicada da rodada 2 da fase 3. */
export const ENC_GRASS_RE = /^(fp4_tall_grass_|fp9_enc_grass_)/;

export interface ViewOptions {
  /** ?team=compare: espécie → criatura de comparação, só para a parceira local (save/compare.ts). */
  partnerVisuals?: Record<string, string>;
  /**
   * ?mon=official: espécie → visual oficial recortado (save/official.ts), em todas as entidades da espécie (a
   * comparação da parceira, se houver, tem prioridade) e sempre nos modelos `official-show-*` das capturas.
   */
  officialVisuals?: Record<string, string>;
  /** ?monscale: fator inteiro de exibição por id de visual (multiplica a escala da criatura). */
  visualScale?: Record<string, number>;
  /** Fator inteiro global aplicado aos sprites de criatura (DS nativo = 1). Multiplica o mapScale de cada manifest. */
  creatureScale: number;
  /**
   * Escala unificada (?dpr=1, fase 2 do Quality Overhaul): ignora o mapScale do manifest (sem ×2 isolado, ex.
   * WarGreymon) para todas as criaturas e Tamers ficarem na mesma densidade de pixel.
   */
  unifiedScale?: boolean;
  /** Tabela de tamanhos (GS-003/research/DIGIMON_SIZE_TABLE.json). Só usada se passada (?size=table). */
  sizeTable?: Record<string, SizeEntry>;
  /** Sprites do Tamer (GAME-ASSETS/11-characters): local e outro jogador. Ausente → placeholder desenhado em código. */
  tamers?: { local?: CreatureVisual; remote?: CreatureVisual };
  /** Tamer composto por jogador (criador de Tamer / bots aleatórios); tem prioridade sobre `tamers`. */
  tamerVisuals?: Record<string, CreatureVisual>;
  /** Suavização visual do movimento (desligar para comparar com a v1). */
  smoothing?: boolean;
  /** ?anim=v2 (fase 2 do Quality Overhaul): controlador de animação v2 (animctl.ts), só na apresentação. */
  animV2?: boolean;
  /**
   * P8 (?hud=v2, §8.3): multiplicador da amplitude do vento na grama de encontro (touceiras fp4_tall_grass_* e
   * fp9_enc_grass_*), para ela ler como "aqui nasce Digimon" pelo movimento. Ausente = 1 (como hoje).
   */
  encGrassSwayMul?: number;
  /** Só apresentação (dados de cena): nível exibido no nome de cada Tamer, por id de jogador. */
  tamerLevels?: Record<string, number>;
  /** Só apresentação: matiz (graus) do sprite de cada outro jogador, para diferenciar quem usa o mesmo sprite. */
  tamerTints?: Record<string, number>;
  /** Folhas de efeito do game-art (04-effects), desenhadas por cima do VFX em código. */
  fxSheets?: SheetDrawer;
  /**
   * Árvores em 2 sprites (forest-v4): prop `K` sem imagem própria mas com `K_base` e `K_top` vira tronco em Y-sort +
   * copa na camada acima das entidades, com sombra decal no chão. Sem isto, o prop é desenhado como sprite único.
   */
  trees?: TreesCfg;
  /** Autotile Wang-47 com recorte suave (pathsmooth.ts): conjuntos por prefixo de chave. */
  smoothAutotile?: PathSmoothCfg[];
  /** Look v8 (render/look.ts): lama, decalques e sombra de contato no chão; grade ambiente, luzes, névoa, partículas. */
  look?: LookCfg;
  /** Desenho extra logo acima do chão e abaixo das entidades (Arena: arquibancada e linhas do campo). */
  underlay?: (ctx: CanvasRenderingContext2D, camera: Camera, now: number) => void;
}

/** Árvores em 2 sprites (forest-v4) + luz do forest-v4.1 (sombra projetada, rim-light, ajuste fino da copa). */
export interface TreesCfg {
  overlap: number;
  shadowSmall: string;
  shadowLarge: string;
  largeShadowMinW: number;
  behindAlpha: number;
  /** Sombra projetada procedural (v4.1); sem isto, usa o decal canopy_shadow_* do v4. */
  castShadow?: CastShadowCfg;
  /** Rim-light na borda de cima/esquerda das copas (v4.1). */
  rimLight?: RimLightCfg;
  /** Deslocamento extra (px) da copa por árvore, ex. a palmeira de tronco curvo: { "fp4_tree_palm_digital": [4, 0] }. */
  topOffset?: Record<string, number[]>;
}

/** Geometria de uma árvore em 2 sprites, em px do mundo (sx/sy = canto superior esquerdo de cada parte). */
export interface TreeGeom {
  index: number;
  key: string;
  footY: number;
  /** Copa recebe o rim-light em tempo de execução (as do v4.1 já vêm com ele no PNG). */
  rim: boolean;
  base: { url: string; x: number; y: number; w: number; h: number };
  top: { url: string; x: number; y: number; w: number; h: number };
  /** Decal do v4 (`url`) ou sombra projetada do v4.1 (`rx`/`ry`, desenhada em código). */
  shadow?: { url?: string; x: number; y: number; w: number; h: number; rx?: number; ry?: number };
}

/** Look v9: no máximo isto de células de água preparadas por quadro (~0,5 ms cada; a tela enche em ~1 s). */
const WATER_BUILD_BUDGET = 6;
/** Look v9: no máximo isto de quadros de água novos (célula × quadro do ciclo) por quadro de tela. */
const WATER_FRAME_BUDGET = 40;
/** Feather da máscara das copas sobre as luzes do look (px de tela do mundo): fator de redução do buffer da máscara. */
const CANOPY_FEATHER = 3;
/** Pivô do frame 26×33 dos Tamers v3 (character.json), quando não há Tamer carregado para copiar. */
const NPC_PIVOT = { x: 13, y: 32 };

const LOCOMOTION: LogicState[] = ["IDLE", "WALK", "FOLLOW", "ENGAGE", "RETURN"];
const DIR4_TO_8: Record<Dir4, Dir8> = { S: "S", N: "N", E: "E", W: "W" };
const sideOf = (f: Dir4): Dir4 => (f === "E" ? "E" : "W");

export interface Camera {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Drawable {
  y: number;
  order: string;
  draw: () => void;
}

export class WorldView {
  readonly ctx: CanvasRenderingContext2D;
  camera: Camera = { x: 0, y: 0, w: 0, h: 0 };
  /** Centro da câmera em ponto flutuante (lerp); `camera` é a versão inteira usada para desenhar. */
  private camCenter?: Vec;
  private motions = new Map<string, MotionState>();
  /** ?anim=v2: estado do controlador por entidade (só criaturas com manifest). */
  private ctls = new Map<string, CtlState>();
  private interactAt = new Map<string, number>();
  private lastUpdate?: number;
  private chunks = new Map<string, HTMLCanvasElement>();
  private silhouettes = new Map<string, HTMLCanvasElement>();
  private shadows = new Map<string, HTMLCanvasElement>();
  private propImages = new Map<string, HTMLCanvasElement>();
  private tinted = new Map<string, HTMLCanvasElement>();
  /** Pose parada (feedback 1, item 3): por visual, quadro de passada do idle → quadro de pés juntos. */
  private stands = new Map<CreatureVisual, Map<string, string>>();
  /** Capturas "antes": desliga a troca para o quadro de pés juntos (volta o idle de passada). */
  standPoseOff = false;
  private tamers: Record<string, ReturnType<typeof makeTamerFrames>>;
  /** Alpha atual de cada copa (índice do prop), suavizado para a transparência quando alguém passa por trás. */
  private canopyAlpha = new Map<number, number>();
  private trees?: TreeGeom[];
  private lastRender?: number;
  /** Preset noturno do pacote (mesmas chaves): URL do dia → URL da noite. */
  private nightUrls = new Map<string, string>();
  private nightTiles?: Record<string, TileSource>;
  /** Copas com rim-light (por URL do preset) e sombras projetadas (por tamanho e preset). */
  private litTops = new Map<string, HTMLCanvasElement>();
  private castShadows = new Map<string, HTMLCanvasElement>();
  /** Quadros de entidade com a grade noturna, só do degrau atual da mistura. */
  private nightFrames = new Map<string, HTMLCanvasElement>();
  private nightFramesStep = 0;
  /** Pixels RGBA dos PNGs de chão (por URL) e tiles de recorte suave já compostos (por célula e preset). */
  private pixels = new Map<string, Uint8ClampedArray>();
  private smoothTiles = new Map<string, HTMLCanvasElement | null>();
  /** Curvas contínuas (camada `curves`): índice por célula e faixas já compostas (por célula e preset). */
  private curveIdx?: CurveIndex;
  private curveTiles = new Map<string, HTMLCanvasElement | null>();
  /** Look v9: faixa da água por célula × quadro do ciclo × preset, e as células com água. */
  private waterTiles = new Map<string, HTMLCanvasElement | null>();
  private waterMixes = new Map<string, WaterMix | "empty">();
  private waterCells?: number[];
  /** Look v9: opacidade atual de cada prop de primeiro plano (índice em map.fgProps). */
  private fgAlpha = new Map<number, number>();
  /** Caixa opaca (offsets dentro do recorte) dos sprites de primeiro plano, por url+recorte. */
  private fgOpaque = new Map<string, { x0: number; y0: number; x1: number; y1: number }>();
  private swayRe?: RegExp;
  /** GS-012 (?encounters=1): apresentação do encontro (salto da grama, "!", placa, farfalhar). */
  encFx?: EncounterFx;
  /** P8 (?hud=v2): entidades com placa de alvo na camada de nomes — sem rótulo comum nem barra de PV no mundo. */
  plateIds?: Set<string>;
  /** Look v9: sprites cisalhados pelo vento (imagem × deslocamento × preset). */
  private sheared = new Map<string, HTMLCanvasElement>();
  /** Look v9: tiles de água montados neste quadro (orçamento por quadro, para não travar no 1º ciclo). */
  private waterBuilt = 0;
  private waterFramesBuilt = 0;
  /** Último tile de água desenhado por célula × preset (fallback fora do orçamento). */
  private waterLast = new Map<string, HTMLCanvasElement>();
  private lastFg?: number;
  /** Look v8: luzes do mapa, sprites de luz em cache, âncoras e sprite da névoa, brilho dos vagalumes. */
  private lookLights?: LightSource[];
  private lightSprites = new Map<string, HTMLCanvasElement>();
  private fog?: { anchors: Vec[]; img: HTMLCanvasElement };
  private glow?: HTMLCanvasElement;
  private veil?: { id: string; c: HTMLCanvasElement };
  /** Buffer das luzes do look (máscara das copas). */
  private lightBuf?: HTMLCanvasElement;
  /** Máscara das copas em 1/CANOPY_FEATHER da tela (a ampliação bilinear dá a borda suave, sem degrau na luz). */
  private canopyMaskBuf?: HTMLCanvasElement;
  /** Mistura noite 0..1 (ciclo dia/noite): troca de paleta em crossfade + overlay ambiente. */
  nightMix = 0;
  /** Estatística do último quadro (culling). */
  stats = { entitiesDrawn: 0, propsDrawn: 0, chunksDrawn: 0 };

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly map: WorldMap,
    private readonly creatures: Record<string, CreatureVisual>,
    private tiles: Record<string, TileSource>,
    private readonly images: ImageStore,
    private readonly makeCanvas: CanvasFactory,
    readonly opts: ViewOptions,
  ) {
    this.ctx = canvas.getContext("2d")!;
    this.tamers = { local: makeTamerFrames(LOCAL_TAMER, makeCanvas), remote: makeTamerFrames(BOT_TAMER, makeCanvas) };
  }

  get worldW(): number {
    return this.map.width * this.map.tileSize;
  }

  get worldH(): number {
    return this.map.height * this.map.tileSize;
  }

  /** Invalida chunks do chão (ex.: tiles reais acabaram de carregar). */
  invalidateGround(): void {
    this.chunks.clear();
    this.smoothTiles.clear();
    this.curveTiles.clear();
    this.waterTiles.clear();
    this.waterMixes.clear();
    this.waterLast.clear();
    this.sheared.clear();
    this.litTops.clear();
    this.propImages.clear();
    this.trees = undefined;
  }

  /** Troca o conjunto de tiles/props e refaz o chão. */
  setTiles(tiles: Record<string, TileSource>): void {
    this.tiles = tiles;
    this.invalidateGround();
  }

  /** Preset noturno (mesmas chaves do dia, outra paleta). As imagens precisam estar no ImageStore. */
  setNightTiles(tiles: Record<string, TileSource>): void {
    this.nightTiles = tiles;
    this.nightUrls.clear();
    for (const [k, t] of Object.entries(this.tiles)) if (tiles[k] && tiles[k].url !== t.url) this.nightUrls.set(t.url, tiles[k].url);
    this.chunks.clear();
    this.sheared.clear();
    this.waterTiles.clear();
    this.waterMixes.clear();
    this.waterLast.clear();
  }

  /** Imagem de um URL do dia no preset pedido (cai no dia se não houver versão noturna carregada). */
  private presetImage(url: string, night: boolean): ImageLike | undefined {
    const n = night ? this.nightUrls.get(url) : undefined;
    return (n && this.images.get(n)) || this.images.get(url);
  }

  /** drawImage com crossfade dia → noite (respeita o globalAlpha corrente). */
  private drawPreset(
    url: string,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw = sw,
    dh = sh,
    resolve: (url: string, night: boolean) => CanvasImageSource | undefined = (u, n) => this.presetImage(u, n),
  ): void {
    const ctx = this.ctx;
    const mix = this.nightUrls.size ? this.nightMix : 0;
    const a = ctx.globalAlpha;
    if (mix < 1) {
      const img = resolve(url, false);
      if (img) ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    }
    if (mix > 0) {
      const img = resolve(url, true);
      ctx.globalAlpha = a * (mix < 1 ? mix : 1);
      if (img) ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
      ctx.globalAlpha = a;
    }
  }

  /**
   * Árvores em 2 sprites do mapa (só as com imagens carregadas). Ancoragem do forest-v4: tronco com os pés no ponto
   * do prop; copa centrada no mesmo X com o fundo `overlap × top.h` px abaixo do topo do tronco (+ `topOffset` da
   * árvore). Sombra: com `castShadow` (v4.1), elipse alongada projetada para baixo/direita a partir do pé, do tamanho
   * da copa; sem ele, o decal do v4 deslocado 20% da largura para a direita. Luz sempre de cima à esquerda.
   */
  treeGeoms(): TreeGeom[] {
    if (this.trees) return this.trees;
    const cfg = this.opts.trees;
    const out: TreeGeom[] = [];
    if (cfg)
      this.map.props.forEach((pr, index) => {
        if (this.tiles[pr.key]) return;
        const b = this.tiles[`${pr.key}_base`];
        const t = this.tiles[`${pr.key}_top`];
        const bi = b && this.images.get(b.url);
        const ti = t && this.images.get(t.url);
        if (!bi || !ti) return;
        const base = { url: b.url, x: Math.round(pr.x - Math.floor(bi.width / 2)), y: pr.y - bi.height, w: bi.width, h: bi.height };
        const [ox, oy] = cfg.topOffset?.[pr.key] ?? [0, 0];
        const top = { url: t.url, x: Math.round(pr.x - Math.floor(ti.width / 2)) + ox, y: pr.y - bi.height - ti.height + Math.round(ti.height * cfg.overlap) + oy, w: ti.width, h: ti.height };
        let shadow: TreeGeom["shadow"];
        if (cfg.castShadow) {
          const g = castShadowGeometry(pr.x, pr.y, ti.width);
          shadow = { x: g.cx - g.rx, y: g.cy - g.ry, w: g.rx * 2 + 1, h: g.ry * 2 + 1, rx: g.rx, ry: g.ry };
        } else {
          const s = this.tiles[ti.width > cfg.largeShadowMinW ? cfg.shadowLarge : cfg.shadowSmall];
          const si = s && this.images.get(s.url);
          shadow = si ? { url: s.url, x: Math.round(pr.x - si.width / 2 + Math.round(si.width * 0.2)), y: pr.y - Math.round(si.height * 0.55) + 3, w: si.width, h: si.height } : undefined;
        }
        out.push({ index, key: pr.key, footY: pr.y, rim: !!cfg.rimLight && !cfg.rimLight.baked.includes(pr.key), base, top, shadow });
      });
    // só fixa o cache quando as imagens já existem (senão tenta de novo no próximo quadro)
    if (out.length || !cfg) this.trees = out;
    return out;
  }

  /**
   * Câmera centrada no alvo com suavização (lerp exponencial, `dtMs` desde o último quadro; sem dtMs = corte seco),
   * presa às bordas do mapa. O desenho usa sempre a posição arredondada (pixel inteiro).
   */
  follow(target: Vec, dtMs?: number, shake: Vec = { x: 0, y: 0 }): void {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.camCenter = dtMs === undefined || !this.camCenter ? { ...target } : lerpCamera(this.camCenter, target, dtMs);
    const clamp = (v: number, max: number) => (max <= 0 ? Math.round(max / 2) : Math.max(0, Math.min(max, v)));
    this.camera = {
      x: clamp(Math.round(this.camCenter.x - w / 2), this.worldW - w) + shake.x,
      y: clamp(Math.round(this.camCenter.y - h / 2), this.worldH - h) + shake.y,
      w,
      h,
    };
  }

  /** Tremida de câmera pendente no presenter (críticos), em px inteiros. */
  shakeFor(p: Presenter, now: number): Vec {
    return shakeOffset(p.shakes, now);
  }

  /**
   * Avança o movimento visual de todas as entidades (chamar 1x por quadro, antes de follow/render).
   * Posição desenhada = mola sobre a posição interpolada da sim; direção e fase do walk vêm daqui.
   */
  update(p: Presenter, alpha: number, now: number): void {
    const dt = this.lastUpdate === undefined ? 0 : now - this.lastUpdate;
    this.lastUpdate = now;
    for (const id of [...this.motions.keys()]) if (!p.entities.has(id)) this.motions.delete(id);
    for (const v of p.entities.values()) {
      const target = p.renderPos(v, alpha);
      const m = this.motions.get(v.id) ?? newMotion(v.facing);
      let force: Dir4 | undefined;
      // Golpe/dano: as poses do DS são laterais (W, E espelhado) → vira para o lado do alvo/atacante.
      if (v.attack && now < v.attack.start + v.attack.durationMs) force = v.attack.dir.x > 0 ? "E" : v.attack.dir.x < 0 ? "W" : sideOf(m.face);
      else if (v.hurt) force = v.hurt.dir.x < 0 ? "E" : v.hurt.dir.x > 0 ? "W" : sideOf(m.face);
      const next = this.opts.smoothing === false ? { ...stepMotion(newMotion(v.facing), target, 0, v.facing, force), walked: m.walked + Math.hypot(target.x - m.pos.x, target.y - m.pos.y), speed: dt > 0 ? Math.hypot(target.x - m.pos.x, target.y - m.pos.y) / (dt / 1000) : 0 } : stepMotion(m, target, dt, v.facing, force);
      this.motions.set(v.id, next);
      if (this.opts.animV2) this.stepAnimCtl(p, v, next, now);
    }
    if (this.opts.animV2) for (const id of [...this.ctls.keys()]) if (!p.entities.has(id)) this.ctls.delete(id);
  }

  /** ?anim=v2: interação (placa, baú, NPC...) vista pela entidade: dispara o one-shot `interact` dela. */
  notifyInteract(id: string, now: number): void {
    this.interactAt.set(id, now);
  }

  /** Estado atual do controlador v2 (capturas e testes). */
  animCtl(id: string): CtlState | undefined {
    return this.ctls.get(id);
  }

  private ctlInput(p: Presenter, v: VisualEntity, mo: MotionState, now: number): CtlInput {
    const c = this.ctls.get(v.id);
    const tgt = c?.lastAttackTarget ? p.entities.get(c.lastAttackTarget) : undefined;
    const a = v.attack;
    return {
      now,
      lt: p.localTime(v, now),
      visual: p.visualState(v, now),
      speed: mo.speed,
      face: mo.face,
      walked: mo.walked,
      isPartner: v.kind === "partner" || v.kind === "remote_partner",
      attack: a ? { start: a.start, hitAtMs: a.hitAtMs, durationMs: a.durationMs, special: a.special, launchAtMs: a.launchAtMs, targetId: a.targetId } : undefined,
      hurtStart: v.hurt?.start,
      targetDefeatedAt: tgt?.defeatedAt !== undefined && now >= tgt.defeatedAt ? tgt.defeatedAt : undefined,
      interactAt: this.interactAt.get(v.id),
    };
  }

  private stepAnimCtl(p: Presenter, v: VisualEntity, mo: MotionState, now: number): void {
    const cv = this.visualOf(v);
    if (!cv) return;
    const c = this.ctls.get(v.id) ?? newCtl(mo.face, p.localTime(v, now));
    this.ctls.set(v.id, stepCtl(c, this.ctlInput(p, v, mo, now), cv.manifest));
  }

  /** Quadro do controlador v2 para a entidade (dirFrames da direção já aplicados). */
  private ctlFrameOf(cv: CreatureVisual, v: VisualEntity, p: Presenter, now: number): { f: CtlFrame; dir: string; mirror: boolean } | undefined {
    const mo = this.motions.get(v.id);
    const c = this.ctls.get(v.id);
    if (!mo || !c) return undefined;
    const m = cv.manifest;
    let face: { dir: string; mirror: boolean } = { dir: "S", mirror: false };
    const f = ctlFrame(c, this.ctlInput(p, v, mo, now), m, (a) => {
      const name = Object.keys(m.animations).find((k) => m.animations[k] === a) ?? "idle";
      face = resolveFacing(m, name, DIR4_TO_8[mo.face]);
      return { ...a, frames: framesFor(a, face.dir) };
    });
    return { f, dir: face.dir, mirror: face.mirror };
  }

  /** Posição visual (suavizada) de uma entidade, ou undefined se ainda não houve update. */
  motionPos(id: string): Vec | undefined {
    return this.motions.get(id)?.pos;
  }

  private posOf(p: Presenter, v: VisualEntity, alpha: number): Vec {
    return this.motions.get(v.id)?.pos ?? p.renderPos(v, alpha);
  }

  screenToWorld(sx: number, sy: number): Vec {
    return { x: sx + this.camera.x, y: sy + this.camera.y };
  }

  render(p: Presenter, alpha: number, now: number): void {
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#181425";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGround(now);
    const cam = this.camera;
    this.opts.underlay?.(ctx, cam, now);
    const margin = 160;
    const inView = (x: number, y: number) => x > cam.x - margin && x < cam.x + cam.w + margin && y > cam.y - 32 && y < cam.y + cam.h + margin;

    const visible: { v: VisualEntity; pos: Vec }[] = [];
    for (const v of p.entities.values()) {
      const pos = this.posOf(p, v, alpha);
      // GS-012: o selvagem do encontro fica escondido na grama até o salto
      if (this.encFx?.entityOffset(v.id, now)?.hidden) continue;
      if (inView(pos.x, pos.y)) visible.push({ v, pos });
    }
    // sombras (sempre sob a entidade, inclusive em ATTACK/HURT)
    // (no salto da grama a sombra fica no chão e cresce enquanto o selvagem cai: encounterFx.entityOffset().shadow)
    for (const { v, pos } of visible) this.drawShadow(v, pos, now, p, this.encFx?.entityOffset(v.id, now)?.shadow);
    // VFX: camada do chão (círculos de área, marcas, rachaduras) fica sob as entidades
    for (const c of p.casts) this.drawCastLayer(p, c, alpha, now, "ground");
    // anel do alvo atual da parceira local
    const partner = p.entities.get(p.localPartnerId);
    const target = partner?.targetId ? p.entities.get(partner.targetId) : undefined;
    if (target) this.drawTargetRing(target, this.posOf(p, target, alpha), now);

    const list: Drawable[] = [];
    let props = 0;
    const trees = this.treeGeoms();
    const treeAt = new Map(trees.map((t) => [t.index, t]));
    const npcKeys = this.opts.look?.npcKeys;
    this.map.props.forEach((pr, i) => {
      if (!inView(pr.x, pr.y)) return;
      props++;
      const tree = treeAt.get(i);
      if (npcKeys?.includes(pr.key)) {
        // NPC humano no frame do Tamer: sombra e quadro pelo caminho do Tamer
        this.drawShadow({ id: `npc:${pr.key}` } as VisualEntity, pr, now);
        list.push({ y: pr.y, order: `p${pr.x}`, draw: () => this.drawNpcProp(pr, now) });
        return;
      }
      list.push({ y: pr.y, order: `p${pr.x}`, draw: tree ? () => this.blitWorld(tree.base) : () => this.drawProp(pr, now) });
    });
    for (const { v, pos } of visible) {
      // salto da grama: o corpo sobe no arco; a sombra e a ordem de desenho ficam no chão
      const jump = this.encFx?.entityOffset(v.id, now);
      const at = jump?.dy ? { x: pos.x, y: pos.y + jump.dy } : pos;
      list.push({ y: pos.y, order: v.id, draw: () => this.drawEntity(v, at, p, now) });
    }
    list.sort((a, b) => a.y - b.y || (a.order < b.order ? -1 : 1));
    for (const d of list) d.draw();
    ctx.globalAlpha = 1;
    this.drawCanopies(p, trees, visible, now);
    this.drawForeground(p, visible, now);
    if (this.opts.look) this.drawLook(this.opts.look, p, alpha, now);
    else this.drawAmbient();

    for (const c of p.casts) this.drawCastLayer(p, c, alpha, now, "over");
    // Impacto genérico da v2 só para golpes sem Cast (eventos sintéticos/legado).
    for (const fx of p.hitFx) {
      const v = p.entities.get(fx.targetId);
      if (!v || p.casts.some((c) => c.seq === fx.seq)) continue;
      const pos = this.posOf(p, v, alpha);
      const h = this.headOffset(v);
      drawImpact(ctx, fx, Math.round(pos.x - cam.x + h.hit.x), Math.round(pos.y - cam.y + h.hit.y), now - fx.start);
    }
    for (const { v, pos } of visible) this.drawOverheads(v, pos, p, now);
    if (this.encFx) {
      const me = p.entities.get(p.localPlayerId);
      this.encFx.draw(ctx, cam, now, (id) => (p.entities.get(id) ? this.posOf(p, p.entities.get(id)!, alpha) : undefined), me ? this.tamerTop(me) : 30);
    }
    for (const f of p.floaters) {
      const t = (now - f.start) / f.durationMs;
      if (t < 0 || t >= 1) continue;
      // Arco: sobe rápido (ease-out), assenta um pouco no fim; deriva lateral; fade nos últimos 35%.
      const rise = 22 * ease.outCubic(Math.min(1, t / 0.5)) - (t > 0.5 ? 7 * ((t - 0.5) / 0.5) ** 2 : 0);
      ctx.globalAlpha = (f.thirdParty ? 0.7 : 1) * (t > 0.65 ? Math.max(0, (1 - t) / 0.35) : 1);
      const scale = f.big ? (t < 0.08 ? 3 : 2) : 1;
      const fv = f.targetId ? p.entities.get(f.targetId) : undefined;
      const fpos = fv ? this.posOf(p, fv, alpha) : { x: f.x, y: f.y };
      const baseX = fv ? fpos.x + (f.x - fv.cur.x) : f.x;
      const x = Math.round(baseX + f.drift * 10 * t - cam.x - pixelTextWidth(f.text, scale) / 2);
      const lift = fv ? this.headOffset(fv).top : 20;
      const y = Math.round((fv ? fpos.y : f.y) - cam.y - lift - 10 - rise);
      drawOutlinedText(ctx, f.text, x, y, f.color, scale);
    }
    ctx.globalAlpha = 1;
    this.stats = { ...this.stats, entitiesDrawn: visible.length, propsDrawn: props };
  }

  private blitWorld(part: { url: string; x: number; y: number; w: number; h: number }): void {
    this.drawPreset(part.url, 0, 0, part.w, part.h, part.x - this.camera.x, part.y - this.camera.y);
  }

  /**
   * Luz ambiente do preset (forest-v4): véu de cor em tela cheia + vinheta, interpolados pela mistura noite.
   * Fica acima do mundo e das copas e abaixo do VFX, para os golpes continuarem brilhando à noite.
   */
  private drawAmbient(): void {
    if (!this.opts.trees) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const amb = ambientAt(this.nightMix);
    ctx.globalAlpha = 1;
    ctx.fillStyle = `rgba(${amb.rgb.join(",")},${amb.alpha.toFixed(3)})`;
    ctx.fillRect(0, 0, w, h);
    const r = Math.hypot(w, h) / 2;
    const g = ctx.createRadialGradient(w / 2, h / 2, r * 0.72, w / 2, h / 2, r);
    g.addColorStop(0, "rgba(24,20,37,0)");
    g.addColorStop(1, `rgba(24,20,37,${amb.vignette.toFixed(3)})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  /**
   * Look v8 por cima do mundo e das copas (abaixo do VFX e dos números): ambiente em multiply + véu frio + vinheta,
   * névoa na borda da mata, luzes pontuais aditivas com flicker (fracas de dia, fortes à noite, + a luz do Tamer à
   * noite) e partículas (vagalumes, poeira digital, folhas).
   */
  private drawLook(look: LookCfg, p: Presenter, alpha: number, now: number): void {
    const ctx = this.ctx;
    const cam = this.camera;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const night = this.nightMix;
    const amb = ambientMix(look, night);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = amb.multiply;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
    // véu frio + vinheta num canvas só (cache por tamanho e degrau da noite: 1 drawImage por quadro)
    const vid = `${w}x${h}|${Math.round(night * 16)}`;
    if (this.veil?.id !== vid) {
      const c = this.veil?.c.width === w && this.veil.c.height === h ? this.veil.c : this.makeCanvas(w, h);
      const g = c.getContext("2d")!;
      g.clearRect(0, 0, w, h);
      g.globalAlpha = amb.tintAlpha;
      g.fillStyle = amb.tint;
      g.fillRect(0, 0, w, h);
      g.globalAlpha = 1;
      const r = Math.hypot(w, h) / 2;
      const vg = g.createRadialGradient(w / 2, h / 2, r * 0.55, w / 2, h / 2, r);
      vg.addColorStop(0, "rgba(10,8,22,0)");
      vg.addColorStop(1, `rgba(10,8,22,${amb.vignette.toFixed(3)})`);
      g.fillStyle = vg;
      g.fillRect(0, 0, w, h);
      this.veil = { id: vid, c };
    }
    ctx.globalAlpha = 1;
    ctx.drawImage(this.veil.c, 0, 0);
    // névoa
    if (look.fog) {
      this.fog ??= { anchors: fogAnchors(this.map, look.fog.every ?? 3), img: fogSprite(look.fog.color, this.makeCanvas) };
      const fa = look.fog.dayAlpha + (look.fog.nightAlpha - look.fog.dayAlpha) * night;
      const t = now / 1000;
      for (const a of this.fog.anchors) {
        const ph = (a.x * 0.37 + a.y * 0.71) % 6.283;
        const x = Math.round(a.x - 36 + Math.sin(t * 0.12 + ph) * 10 - cam.x);
        const y = Math.round(a.y - 15 + Math.sin(t * 0.09 + ph * 1.7) * 3 - cam.y);
        if (x > w || y > h || x < -72 || y < -30) continue;
        ctx.globalAlpha = fa * (0.7 + 0.3 * Math.sin(t * 0.3 + ph));
        ctx.drawImage(this.fog.img, x, y);
      }
      ctx.globalAlpha = 1;
    }
    // luzes: num buffer de tela, mascarado pelas copas (a luz não vaza por cima das árvores), somado com 'lighter'
    this.lookLights ??= mapLights(this.map, look);
    const mask = look.canopyMask ?? 0;
    let lg: CanvasRenderingContext2D = ctx;
    if (mask > 0) {
      if (this.lightBuf?.width !== w || this.lightBuf.height !== h) this.lightBuf = this.makeCanvas(w, h);
      lg = this.lightBuf.getContext("2d")!;
      lg.imageSmoothingEnabled = false;
      lg.globalCompositeOperation = "source-over";
      lg.globalAlpha = 1;
      lg.clearRect(0, 0, w, h);
    }
    lg.globalCompositeOperation = "lighter";
    let lit = 0;
    const drawLight = (l: { color: string; radius: number }, x: number, y: number, a: number) => {
      const rad = Math.max(4, Math.round(l.radius));
      if (x + rad < 0 || y + rad < 0 || x - rad > w || y - rad > h || a <= 0.01) return;
      lg.globalAlpha = Math.min(1, a);
      lg.drawImage(lightSprite(l.color, rad, this.makeCanvas, this.lightSprites), Math.round(x - rad), Math.round(y - rad));
      lit++;
    };
    for (const l of this.lookLights) {
      const f = flicker(l, now);
      drawLight({ color: l.color, radius: l.radius * f.r }, l.x + (l.ox ?? 0) - cam.x, l.y + (l.oy ?? 0) - cam.y, l.intensity * f.k * amb.lightScale);
    }
    const me = p.entities.get(p.localPlayerId);
    if (look.playerLight && me && night > 0.05) {
      const pos = this.posOf(p, me, alpha);
      drawLight(look.playerLight, pos.x - cam.x, pos.y - 10 - cam.y, look.playerLight.intensity * night);
    }
    if (mask > 0 && this.lightBuf) {
      if (lit) {
        // máscara: a silhueta de cada copa visível apaga a luz sob ela (× o alpha atual da copa, que fica translúcida
        // quando cobre o Tamer). As silhuetas vão para um buffer em 1/CANOPY_FEATHER da tela (a redução faz a média da
        // cobertura) e voltam ampliadas com filtro bilinear: a borda da máscara ganha ~CANOPY_FEATHER px de feather e o
        // halo não fica cortado em degrau junto à copa.
        const F = CANOPY_FEATHER;
        const mw = Math.ceil(w / F) + 2;
        const mh = Math.ceil(h / F) + 2;
        if (this.canopyMaskBuf?.width !== mw || this.canopyMaskBuf.height !== mh) this.canopyMaskBuf = this.makeCanvas(mw, mh);
        const mg = this.canopyMaskBuf.getContext("2d")!;
        mg.globalCompositeOperation = "source-over";
        mg.globalAlpha = 1;
        mg.clearRect(0, 0, mw, mh);
        mg.imageSmoothingEnabled = true;
        for (const t of this.treeGeoms()) {
          const r = t.top;
          if (r.x > cam.x + cam.w || r.x + r.w < cam.x || r.y > cam.y + cam.h || r.y + r.h < cam.y) continue;
          const img = this.presetImage(r.url, false);
          if (!img) continue;
          mg.globalAlpha = this.canopyAlphaOf(t.index);
          mg.drawImage(img, (Math.round(r.x - cam.x) + F) / F, (Math.round(r.y - cam.y) + F) / F, img.width / F, img.height / F);
        }
        mg.globalAlpha = 1;
        lg.globalCompositeOperation = "destination-out";
        lg.globalAlpha = mask;
        lg.imageSmoothingEnabled = true;
        lg.drawImage(this.canopyMaskBuf, -F, -F, mw * F, mh * F);
        lg.imageSmoothingEnabled = false;
        lg.globalCompositeOperation = "source-over";
        lg.globalAlpha = 1;
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 1;
        ctx.drawImage(this.lightBuf, 0, 0);
      }
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    // partículas
    if (look.particles) {
      if (!this.glow) {
        this.glow = this.makeCanvas(7, 7);
        const g = this.glow.getContext("2d")!;
        g.fillStyle = "rgba(220,255,140,0.35)";
        g.fillRect(1, 2, 5, 3);
        g.fillRect(2, 1, 3, 5);
        g.fillStyle = "rgba(240,255,170,0.6)";
        g.fillRect(2, 2, 3, 3);
      }
      drawParticles(ctx, cam, now, night, look.particles, this.glow);
    }
  }

  /**
   * Camada canopy-top: copas acima de todas as entidades (ordem pelo pé da árvore). Uma copa que cobre o Tamer local
   * ou a parceira dele fica translúcida (`behindAlpha`), com transição suave (~120 ms).
   */
  private drawCanopies(p: Presenter, trees: TreeGeom[], visible: { v: VisualEntity; pos: Vec }[], now: number): void {
    const cfg = this.opts.trees;
    if (!cfg || !trees.length) return;
    const dt = this.lastRender === undefined ? 16 : Math.max(0, now - this.lastRender);
    this.lastRender = now;
    const k = Math.min(1, dt / 120);
    const cam = this.camera;
    const watch = visible.filter(({ v }) => v.id === p.localPlayerId || v.id === p.localPartnerId).map(({ v, pos }) => {
      const top = v.kind === "player" ? this.tamerTop(v) : this.headOffset(v).top;
      return { x0: pos.x - 7, x1: pos.x + 7, y0: pos.y - top, y1: pos.y };
    });
    const ctx = this.ctx;
    for (const t of trees) {
      const r = t.top;
      if (r.x > cam.x + cam.w || r.x + r.w < cam.x || r.y > cam.y + cam.h || r.y + r.h < cam.y) {
        this.canopyAlpha.delete(t.index);
        continue;
      }
      // miolo da copa (as bordas dela são puffs ralos): 12% de margem lateral e 15% no fundo
      const behind = watch.some((e) => e.x1 > r.x + r.w * 0.12 && e.x0 < r.x + r.w * 0.88 && e.y1 > r.y && e.y0 < r.y + r.h * 0.85);
      const target = behind ? cfg.behindAlpha : 1;
      const a0 = this.canopyAlpha.get(t.index) ?? 1;
      const a = Math.abs(target - a0) < 0.01 ? target : a0 + (target - a0) * k;
      if (a < 1) this.canopyAlpha.set(t.index, a);
      else this.canopyAlpha.delete(t.index);
      ctx.globalAlpha = a;
      const sway = this.opts.look?.sway;
      const res = t.rim ? (u: string, n: boolean) => this.rimTop(u, n) : undefined;
      if (sway?.canopies) this.drawSwayed(r.url, 0, 0, r.w, r.h, r.x - cam.x, r.y - cam.y, swayOffset(t.base.x, t.footY, now, sway), sway.bands, res);
      else if (t.rim) this.drawPreset(r.url, 0, 0, r.w, r.h, r.x - cam.x, r.y - cam.y, r.w, r.h, res);
      else this.blitWorld(r);
    }
    ctx.globalAlpha = 1;
  }

  /**
   * Sprite com o cisalhamento do vento (a faixa de cima desloca `s`, a de baixo fica presa). O sprite cisalhado é
   * montado uma vez por (imagem, s, preset) e cacheado: no quadro é 1 drawImage, como o sprite parado.
   */
  private drawSwayed(url: string, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, s: number, bands: number, resolve?: (url: string, night: boolean) => CanvasImageSource | undefined): void {
    if (!s) return this.drawPreset(url, sx, sy, sw, sh, dx, dy, sw, sh, resolve);
    const base = resolve ?? ((u: string, n: boolean) => this.presetImage(u, n));
    const pad = Math.abs(s);
    const w = sw + 2 * pad;
    this.drawPreset(url, 0, 0, w, sh, dx - pad, dy, w, sh, (u, n) => this.shearedImage(u, n, sx, sy, sw, sh, s, bands, base, !!resolve));
  }

  private shearedImage(u: string, night: boolean, sx: number, sy: number, sw: number, sh: number, s: number, bands: number, base: (url: string, night: boolean) => CanvasImageSource | undefined, rim: boolean): HTMLCanvasElement | undefined {
    const id = `${u}|${night ? 1 : 0}|${sx},${sy},${sw},${sh}|${s}|${bands}|${rim ? 1 : 0}`;
    const hit = this.sheared.get(id);
    if (hit) return hit;
    const img = base(u, night);
    if (!img) return undefined;
    const pad = Math.abs(s);
    const c = this.makeCanvas(sw + 2 * pad, sh);
    const g = c.getContext("2d")!;
    g.imageSmoothingEnabled = false;
    const shifts = bandShifts(s, bands);
    bandRows(sh, shifts.length).forEach(([y0, y1], i) => {
      if (y1 > y0) g.drawImage(img, sx, sy + y0, sw, y1 - y0, pad + shifts[i], y0, sw, y1 - y0);
    });
    this.sheared.set(id, c);
    return c;
  }

  /**
   * Look v9: primeiro plano (objects_above). Desenhado por cima das entidades e das copas, sem Y-sort; fica
   * translúcido (behindAlpha) quando cobre o jogador ou a parceira, com a mesma transição das copas.
   */
  private drawForeground(p: Presenter, visible: { v: VisualEntity; pos: Vec }[], now: number): void {
    const fg = this.map.fgProps;
    const cfg = this.opts.look?.foreground;
    if (!fg?.length) return;
    const dt = this.lastFg === undefined ? 16 : Math.max(0, now - this.lastFg);
    this.lastFg = now;
    const watch: Rect[] = visible
      .filter(({ v }) => v.id === p.localPlayerId || v.id === p.localPartnerId)
      .map(({ v, pos }) => {
        const top = v.kind === "player" ? this.tamerTop(v) : this.headOffset(v).top;
        // P7 (headFrac): só a cabeça conta; pernas e cintura escondidas pela moita não deixam ela translúcida
        return { x0: pos.x - 7, x1: pos.x + 7, y0: pos.y - top, y1: cfg?.headFrac ? pos.y - top * (1 - cfg.headFrac) : pos.y };
      });
    const cam = this.camera;
    const ctx = this.ctx;
    const sway = this.opts.look?.sway;
    const re = sway ? new RegExp(sway.keys) : undefined;
    fg.forEach((pr, i) => {
      const src = this.tiles[pr.key];
      const img = src && this.images.get(src.url);
      if (!img) return;
      const [sx, sy, sw, sh] = src.rect ?? [0, 0, img.width, img.height];
      const [px, py] = src.pivot ?? [Math.floor(sw / 2), sh - 1];
      const x = Math.round(pr.x - px);
      const y = Math.round(pr.y - py);
      if (x > cam.x + cam.w || x + sw < cam.x || y > cam.y + cam.h || y + sh < cam.y) {
        this.fgAlpha.delete(i);
        return;
      }
      // headFrac: mede pela parte OPACA do sprite (as samambaias têm 7 px transparentes no topo do recorte)
      const ob = cfg?.headFrac ? this.opaqueBox(src.url, img, sx, sy, sw, sh) : { x0: 0, y0: 0, x1: sw, y1: sh };
      const target = fgCovers({ x0: x + ob.x0, y0: y + ob.y0, x1: x + ob.x1, y1: y + ob.y1 }, watch) ? (cfg?.behindAlpha ?? 0.4) : 1;
      const a = fadeToward(this.fgAlpha.get(i) ?? 1, target, dt, cfg?.fadeMs ?? 120);
      if (a < 1) this.fgAlpha.set(i, a);
      else this.fgAlpha.delete(i);
      ctx.globalAlpha = a;
      const s = (re?.test(pr.key) ? this.swayAt(pr.key, pr.x, pr.y, now, sway!) : 0) + (this.encFx?.rustleAt(pr.x, pr.y, now) ?? 0);
      this.drawSwayed(src.url, sx, sy, sw, sh, x - cam.x, y - cam.y, s, 2);
    });
    ctx.globalAlpha = 1;
  }

  private opaqueBox(url: string, img: CanvasImageSource, sx: number, sy: number, sw: number, sh: number): { x0: number; y0: number; x1: number; y1: number } {
    const key = `${url}|${sx},${sy},${sw},${sh}`;
    let b = this.fgOpaque.get(key);
    if (b) return b;
    b = { x0: 0, y0: 0, x1: sw, y1: sh };
    try {
      const c = this.makeCanvas(sw, sh);
      const g = c.getContext("2d")!;
      g.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      const d = g.getImageData(0, 0, sw, sh).data;
      let x0 = sw, y0 = sh, x1 = 0, y1 = 0;
      for (let y = 0; y < sh; y++)
        for (let x = 0; x < sw; x++)
          if (d[(y * sw + x) * 4 + 3] > 24) {
            x0 = Math.min(x0, x);
            y0 = Math.min(y0, y);
            x1 = Math.max(x1, x + 1);
            y1 = Math.max(y1, y + 1);
          }
      if (x1 > x0) b = { x0, y0, x1, y1 };
    } catch {
      // sem getImageData (canvas de teste): fica o recorte inteiro
    }
    this.fgOpaque.set(key, b);
    return b;
  }

  /** Copa com o rim-light do preset (cache por URL; cai na copa sem rim enquanto a imagem não carregou). */
  private rimTop(url: string, night: boolean): CanvasImageSource | undefined {
    const rim = this.opts.trees?.rimLight;
    const img = this.presetImage(url, night);
    if (!rim || !img) return img;
    const id = `${night ? (this.nightUrls.get(url) ?? url) : url}|${night ? "n" : "d"}`;
    let c = this.litTops.get(id);
    if (!c) this.litTops.set(id, (c = rimLit(img, night ? rim.night : rim.day, rim.alpha, this.makeCanvas)));
    return c;
  }

  /** Sombra projetada (v4.1) de um tamanho, no preset pedido. */
  private castShadowImage(rx: number, ry: number, night: boolean): HTMLCanvasElement | undefined {
    const cs = this.opts.trees?.castShadow;
    if (!cs) return undefined;
    const id = `${rx}x${ry}|${night ? "n" : "d"}`;
    let c = this.castShadows.get(id);
    if (!c) this.castShadows.set(id, (c = castShadowCanvas(rx, ry, night ? cs.night : cs.day, night ? cs.nightAlpha : cs.dayAlpha, this.makeCanvas)));
    return c;
  }

  /**
   * Quadro de entidade com a grade noturna (nightgrade.ts) no degrau atual da mistura; undefined de dia (ou fora da
   * cena com preset noturno). O cache guarda só o degrau atual.
   */
  private entityNight(id: string, img: CanvasImageSource, fr: { x: number; y: number; w: number; h: number }, mirror: boolean): HTMLCanvasElement | undefined {
    const step = this.nightTiles ? nightStep(this.nightMix) : 0;
    if (!step) return undefined;
    if (step !== this.nightFramesStep) {
      this.nightFrames.clear();
      this.nightFramesStep = step;
    }
    const key = `${id}|${mirror ? "m" : ""}`;
    let c = this.nightFrames.get(key);
    if (!c) this.nightFrames.set(key, (c = nightFrame(img, fr, step / NIGHT_STEPS, mirror, this.makeCanvas)));
    return c;
  }

  /** Desenha um quadro de entidade: com a grade noturna (1 px de margem) ou o original. */
  private blitEntity(id: string, img: CanvasImageSource, fr: { x: number; y: number; w: number; h: number }, dx: number, dy: number, S: number, mirror: boolean): void {
    const n = this.entityNight(id, img, fr, mirror);
    if (n) this.blit(n, { x: 0, y: 0, w: fr.w + 2, h: fr.h + 2 }, dx - S, dy - S, S, mirror);
    else this.blit(img, fr, dx, dy, S, mirror);
  }

  /** Alpha atual da copa de uma árvore (1 = opaca), para testes e capturas. */
  canopyAlphaOf(index: number): number {
    return this.canopyAlpha.get(index) ?? 1;
  }

  // ---------- chão ----------

  private drawGround(now: number): void {
    const ts = this.map.tileSize;
    const size = CHUNK_TILES * ts;
    const cam = this.camera;
    let n = 0;
    for (let cy = Math.floor(cam.y / size); cy * size < cam.y + cam.h; cy++)
      for (let cx = Math.floor(cam.x / size); cx * size < cam.x + cam.w; cx++) {
        if (cx < 0 || cy < 0 || cx * CHUNK_TILES >= this.map.width || cy * CHUNK_TILES >= this.map.height) continue;
        const mix = this.nightTiles ? this.nightMix : 0;
        if (mix < 1) this.ctx.drawImage(this.chunk(cx, cy, now, false), cx * size - cam.x, cy * size - cam.y);
        if (mix > 0) {
          this.ctx.globalAlpha = mix < 1 ? mix : 1;
          this.ctx.drawImage(this.chunk(cx, cy, now, true), cx * size - cam.x, cy * size - cam.y);
          this.ctx.globalAlpha = 1;
        }
        n++;
      }
    this.stats.chunksDrawn = n;
    if (this.opts.look?.water) this.drawWater(now);
  }

  /**
   * Look v9: água correndo. As células perto de uma curva de água recebem por cima do chunk a mesma faixa das
   * curvas, mas com a textura da água deslocada (scroll de UV em quadros, com volta no tile). A espuma da margem e
   * o vau continuam no lugar (são calculados pela posição). Cache por célula × quadro × preset.
   */
  private drawWater(now: number): void {
    const cfg = this.opts.look!.water!;
    const idx = this.curveIndex();
    if (!idx) return;
    const ts = this.map.tileSize;
    // célula com detalhe de chão (a ponte, camada ground_detail) fica fora: a água animada não pode cobrir a ponte
    const detail = this.map.tileLayers.filter((l) => l.name !== "ground");
    this.waterCells ??= [...idx.near]
      .filter(([i, cis]) => cis.some((ci) => idx.curves[ci].terrain === cfg.terrain) && !detail.some((l) => l.keys[i]))
      .map(([i]) => i);
    const { frame, dx, dy } = waterFrame(now, cfg, ts);
    const cam = this.camera;
    this.waterBuilt = 0;
    this.waterFramesBuilt = 0;
    const mix = this.nightTiles ? this.nightMix : 0;
    for (const i of this.waterCells) {
      const mx = i % this.map.width;
      const my = Math.floor(i / this.map.width);
      const x = mx * ts - cam.x;
      const y = my * ts - cam.y;
      if (x < -ts || y < -ts || x > cam.w || y > cam.h) continue;
      for (const night of mix <= 0 ? [false] : mix >= 1 ? [true] : [false, true]) {
        // quadro novo fora do orçamento: repete o último quadro desta célula (ou fica a água parada do chunk)
        const lk = `${i}|${night ? "n" : "d"}`;
        const c = this.waterTile(mx, my, frame, dx, dy, night) ?? this.waterLast.get(lk);
        if (!c) continue;
        this.waterLast.set(lk, c);
        this.ctx.globalAlpha = night && mix < 1 ? mix : 1;
        this.ctx.drawImage(c, x, y);
      }
    }
    this.ctx.globalAlpha = 1;
  }

  private waterTile(mx: number, my: number, frame: number, dx: number, dy: number, night: boolean): HTMLCanvasElement | undefined {
    const id = `${mx},${my}|${frame}|${night ? "n" : "d"}`;
    const hit = this.waterTiles.get(id);
    if (hit !== undefined) return hit ?? undefined;
    const ts = this.map.tileSize;
    if (this.waterFramesBuilt >= WATER_FRAME_BUDGET) return undefined;
    const mix = this.waterMixOf(mx, my, night);
    if (!mix) return undefined;
    this.waterFramesBuilt++;
    let c: HTMLCanvasElement | null = null;
    if (mix !== "empty") {
      const set = night && this.nightTiles ? { ...this.tiles, ...this.nightTiles } : this.tiles;
      const src = set[mix.fill];
      const fill = this.pixelsOf(src?.url, src?.rect);
      if (!fill) return undefined;
      c = this.makeCanvas(ts, ts);
      const g = c.getContext("2d")!;
      const data = g.createImageData(ts, ts);
      const nz = this.opts.look!.water!.noise;
      data.data.set(mix.noise && nz ? waterComposeNoisy(mix, fill, ts, dx, dy, mix.noise, nz.shade, frame / this.opts.look!.water!.frames) : waterCompose(mix, scrollPixels(fill, ts, dx, dy)));
      g.putImageData(data, 0, 0);
    }
    this.waterTiles.set(id, c);
    return c ?? undefined;
  }

  /**
   * A faixa das curvas é linear na textura da água (espuma e vau são misturas): out = A + B·textura. Dois passes de
   * composeCurveOverlay (textura 0 e 255) dão A e B uma vez por célula; cada quadro do ciclo vira uma mistura de
   * ts² pixels. O passe caro tem orçamento por quadro (WATER_BUILD_BUDGET); sem ele a célula mostra a água parada.
   */
  private waterMixOf(mx: number, my: number, night: boolean): WaterMix | "empty" | undefined {
    const id = `${mx},${my}|${night ? "n" : "d"}`;
    const hit = this.waterMixes.get(id);
    if (hit) return hit;
    if (this.waterBuilt >= WATER_BUILD_BUDGET) return undefined;
    const idx = this.curveIndex()!;
    const ts = this.map.tileSize;
    const set = night && this.nightTiles ? { ...this.tiles, ...this.nightTiles } : this.tiles;
    const terrain = this.opts.look!.water!.terrain;
    const flat = (v: number) => new Uint8ClampedArray(ts * ts * 4).fill(v);
    let missing = false;
    let fill = "";
    const pass = (v: number) =>
      composeCurveOverlay(idx, mx, my, ts, this.map.width, (ci) => {
        if (idx.curves[ci].terrain === terrain) {
          fill = idx.curves[ci].fill;
          return flat(v);
        }
        const src = set[idx.curves[ci].fill];
        const d = this.pixelsOf(src?.url, src?.rect);
        if (!d) missing = true;
        return d;
      });
    this.waterBuilt++;
    const a = pass(0);
    const b = pass(255);
    if (missing) return undefined;
    const mix: WaterMix | "empty" = a && b ? waterMixFrom(a, b, fill) : "empty";
    const nz = this.opts.look!.water!.noise;
    if (mix !== "empty" && nz) mix.noise = waterNoiseFor(mx, my, ts, nz);
    this.waterMixes.set(id, mix);
    return mix;
  }


  /** Chunk de 16×16 tiles pré-renderizado. Tiles animados (água) geram uma versão por quadro. */
  private chunk(cx: number, cy: number, now: number, night = false): HTMLCanvasElement {
    const animFrame = Object.values(ANIMATED_TILES).reduce((s, a) => s + (Math.floor(now / a.frameMs) % a.frames.length), 0);
    const key = `${cx},${cy},${animFrame}${night ? ",n" : ""}`;
    const set = night && this.nightTiles ? { ...this.tiles, ...this.nightTiles } : this.tiles;
    let c = this.chunks.get(key);
    if (c) return c;
    const ts = this.map.tileSize;
    c = this.makeCanvas(CHUNK_TILES * ts, CHUNK_TILES * ts);
    const g = c.getContext("2d")!;
    g.imageSmoothingEnabled = false;
    const x0 = cx * CHUNK_TILES * ts;
    const y0 = cy * CHUNK_TILES * ts;
    const size = CHUNK_TILES * ts;
    const imageOf = (key: string) => {
      const src = set[key];
      const img = src && this.images.get(src.url);
      if (!img) return undefined;
      return { img, w: src.rect?.[2] ?? img.width, h: src.rect?.[3] ?? img.height, rect: src.rect };
    };
    // passes (os tiles não passam da própria célula, então a ordem entre células não importa): 1) chão; 2) manchas
    // macro do forest-v10, em px do mundo; 3) faixa das curvas (trilha/riacho) sobre o chão; 4) demais camadas
    // (ground_detail: ponte, face do penhasco)
    const eachCell = (fn: (mx: number, my: number, tx: number, ty: number) => void) => {
      for (let ty = 0; ty < CHUNK_TILES; ty++)
        for (let tx = 0; tx < CHUNK_TILES; tx++) {
          const mx = cx * CHUNK_TILES + tx;
          const my = cy * CHUNK_TILES + ty;
          if (mx < this.map.width && my < this.map.height) fn(mx, my, tx, ty);
        }
    };
    const drawLayerTile = (li: number, mx: number, my: number, tx: number, ty: number) => {
      const layer = this.map.tileLayers[li];
      const key = layer.keys[my * this.map.width + mx];
      // célula pintada por uma curva contínua: o chão de baixo no lugar do tile Wang (a faixa vem depois)
      const own = li === 0 ? this.curveOwner(mx, my) : undefined;
      const smooth = !own && key ? this.smoothTile(layer.keys, key, mx, my, set, night) : undefined;
      if (own) this.drawTile(g, own.ground[(mx * 7 + my * 3) % own.ground.length], tx * ts, ty * ts, set);
      else if (smooth) g.drawImage(smooth, tx * ts, ty * ts);
      else if (key) this.drawTile(g, animatedTileKey(key, now), tx * ts, ty * ts, set);
    };
    if (this.map.tileLayers.length) eachCell((mx, my, tx, ty) => drawLayerTile(0, mx, my, tx, ty));
    // forest-v11: as manchas já chegam com alfa 0 nos 8 px da borda do PNG (o feather de 14 px do v10 saiu)
    if (this.map.macroOverlays?.length) drawDecals(g, this.map.macroOverlays, x0, y0, size, imageOf);
    eachCell((mx, my, tx, ty) => {
      const band = this.curveTile(mx, my, set, night);
      if (band) g.drawImage(band, tx * ts, ty * ts);
    });
    for (let li = 1; li < this.map.tileLayers.length; li++) eachCell((mx, my, tx, ty) => drawLayerTile(li, mx, my, tx, ty));
    // sombras das copas: decal no chão (fica sob tudo; pode atravessar a borda do chunk)
    const look = this.opts.look;
    if (look) {
      // look v8: lama roxa, decalques e sombra de contato dos props (estáticos: ficam no chunk)
      if (this.map.patches?.length) drawPatches(g, this.map.patches, x0, y0, size, ts, this.map.width, look);
      if (this.map.decals?.length) drawDecals(g, this.map.decals, x0, y0, size, imageOf);
      // oclusão na base da face do penhasco: faixa escura em degraus logo abaixo (a face é a camada ground_detail)
      const det = this.map.tileLayers.find((l) => l.name === "ground_detail")?.keys;
      if (det) {
        g.fillStyle = look.shadows?.color ?? "#0a0812";
        for (let ty = 0; ty < CHUNK_TILES; ty++)
          for (let tx = 0; tx < CHUNK_TILES; tx++) {
            const mx = cx * CHUNK_TILES + tx;
            const my = cy * CHUNK_TILES + ty - 1;
            if (my < 0 || mx >= this.map.width || !/cliff_face|cliff_ramp/.test(det[my * this.map.width + mx] ?? "")) continue;
            for (const [dy, h, a] of [[0, 2, 0.45], [2, 3, 0.25], [5, 3, 0.12]]) {
              g.globalAlpha = a;
              g.fillRect(tx * ts, ty * ts + dy, ts, h);
            }
          }
        g.globalAlpha = 1;
      }
      const treeKeys = new Set(this.treeGeoms().map((t) => t.key));
      drawPropShadows(g, this.map.props, x0, y0, size, look, (pr) => {
        if (treeKeys.has(pr.key)) return { w: 18, tree: true };
        if (look.npcKeys?.includes(pr.key)) return undefined; // sombra de entidade, por quadro (drawShadow)
        const src = this.tiles[pr.key];
        const img = src && this.images.get(src.url);
        return img ? { w: src.rect?.[2] ?? img.width, tree: false } : undefined;
      });
    }
    for (const t of this.treeGeoms()) {
      const s = t.shadow;
      if (!s || s.x > x0 + size || s.x + s.w < x0 || s.y > y0 + size || s.y + s.h < y0) continue;
      const img = s.url ? this.presetImage(s.url, night) : this.castShadowImage(s.rx!, s.ry!, night);
      if (img) g.drawImage(img, s.x - x0, s.y - y0);
    }
    this.chunks.set(key, c);
    return c;
  }

  /**
   * Pixels RGBA de um PNG de 1 tile (cache por URL e recorte); undefined enquanto a imagem não carregou. `rect`: o
   * tile é um recorte de uma prancha (ex. o Wang-16 do forest-v7).
   */
  private pixelsOf(url: string | undefined, rect?: [number, number, number, number]): Uint8ClampedArray | undefined {
    if (!url) return undefined;
    const id = rect ? `${url}#${rect.join(",")}` : url;
    const hit = this.pixels.get(id);
    if (hit) return hit;
    const img = this.images.get(url);
    if (!img) return undefined;
    const ts = this.map.tileSize;
    const c = this.makeCanvas(ts, ts);
    const g = c.getContext("2d")!;
    if (rect) g.drawImage(img, rect[0], rect[1], rect[2], rect[3], 0, 0, ts, ts);
    else g.drawImage(img, 0, 0, ts, ts);
    const d = g.getImageData(0, 0, ts, ts).data;
    this.pixels.set(id, d);
    return d;
  }

  /** Índice das curvas contínuas do mapa (preguiçoso: só mapas com a camada `curves`). */
  private curveIndex(): CurveIndex | undefined {
    if (!this.map.curves?.length) return undefined;
    if (!this.curveIdx) {
      const keys = this.map.tileLayers[0]?.keys ?? [];
      this.curveIdx = buildCurveIndex(this.map.curves, this.map.width, this.map.height, this.map.tileSize, (i) => keys[i] ?? "");
    }
    return this.curveIdx;
  }

  /** Curva dona da célula (célula do conjunto pintada por ela), ou undefined. */
  private curveOwner(mx: number, my: number): MapCurve | undefined {
    const idx = this.curveIndex();
    const ci = idx?.owner.get(my * this.map.width + mx);
    return ci === undefined ? undefined : idx!.curves[ci];
  }

  /** Faixa das curvas na célula (transparente fora dela), ou undefined se nenhuma curva passa ali. */
  private curveTile(mx: number, my: number, set: Record<string, TileSource>, night: boolean): HTMLCanvasElement | undefined {
    const idx = this.curveIndex();
    if (!idx?.near.has(my * this.map.width + mx)) return undefined;
    const id = `${mx},${my}|${night ? "n" : "d"}`;
    const hit = this.curveTiles.get(id);
    if (hit !== undefined) return hit ?? undefined;
    const ts = this.map.tileSize;
    let missing = false;
    const px = composeCurveOverlay(idx, mx, my, ts, this.map.width, (ci) => {
      const src = set[idx.curves[ci].fill];
      const d = this.pixelsOf(src?.url, src?.rect);
      if (!d) missing = true;
      return d;
    });
    // imagem ainda não carregada: não guarda (tenta de novo no próximo chunk)
    if (missing) return undefined;
    let c: HTMLCanvasElement | null = null;
    if (px) {
      c = this.makeCanvas(ts, ts);
      const g = c.getContext("2d")!;
      const data = g.createImageData(ts, ts);
      data.data.set(px);
      g.putImageData(data, 0, 0);
    }
    this.curveTiles.set(id, c);
    return c ?? undefined;
  }

  /**
   * Tile Wang-47 com recorte suave (pathsmooth.ts) da célula (mx, my), ou undefined se a chave não é de um conjunto
   * configurado ou as imagens ainda não carregaram (cai no PNG original).
   */
  private smoothTile(keys: string[], key: string, mx: number, my: number, set: Record<string, TileSource>, night: boolean): HTMLCanvasElement | undefined {
    const cfg = this.opts.smoothAutotile?.find((c) => key.startsWith(c.prefix));
    if (!cfg) return undefined;
    const id = `${cfg.prefix}|${mx},${my}|${night ? "n" : "d"}`;
    const hit = this.smoothTiles.get(id);
    if (hit !== undefined) return hit ?? undefined;
    const W = this.map.width;
    const H = this.map.height;
    const ts = this.map.tileSize;
    const variant = cfg.ground[(mx * 7 + my * 3) % cfg.ground.length];
    const full = this.pixelsOf(set[cfg.full]?.url, set[cfg.full]?.rect);
    const ground = this.pixelsOf(set[variant]?.url, set[variant]?.rect);
    const own = cfg.keepOwnDirt ? this.pixelsOf(set[key]?.url, set[key]?.rect) : undefined;
    if (!full || !ground || (cfg.keepOwnDirt && !own)) return undefined;
    const isSet = (x: number, y: number) => {
      if (x < 0 || y < 0 || x >= W || y >= H) {
        if (cfg.outside === "fill") return true;
        x = Math.max(0, Math.min(W - 1, x));
        y = Math.max(0, Math.min(H - 1, y));
      }
      return keys[y * W + x].startsWith(cfg.prefix);
    };
    const px = composePathTile(pathMask(mx, my, ts, isSet, cfg), ts, own, full, ground, mx * 131 + my * 977);
    const c = this.makeCanvas(ts, ts);
    const g = c.getContext("2d")!;
    const data = g.createImageData(ts, ts);
    data.data.set(px);
    g.putImageData(data, 0, 0);
    this.smoothTiles.set(id, c);
    return c;
  }

  private drawTile(g: CanvasRenderingContext2D, key: string, x: number, y: number, set = this.tiles): void {
    const ts = this.map.tileSize;
    const src = set[key];
    const img = src && this.images.get(src.url);
    if (!img) return drawPlaceholderTile(g, key, x, y, ts);
    const [sx, sy, sw, sh] = src.rect ?? [0, 0, img.width, img.height];
    g.drawImage(img, sx, sy, sw, sh, x, y, ts, ts);
  }

  /**
   * NPC humano parado (peça 26×33 do mesmo pipeline dos Tamers v3): pivô e escala do Tamer, grade noturna de
   * entidade (blitEntity) e a mesma respiração parada. Sem a imagem, cai no caminho de prop.
   */
  private drawNpcProp(pr: MapProp, now: number): void {
    const src = this.tiles[pr.key];
    const img = src && this.images.get(src.url);
    if (!img) return this.drawProp(pr);
    const tv = Object.values(this.opts.tamerVisuals ?? {})[0] ?? this.opts.tamers?.local;
    const pv = tv?.manifest.pivot ?? NPC_PIVOT;
    const S = this.scaleOf(tv);
    const fr = { x: src.rect?.[0] ?? 0, y: src.rect?.[1] ?? 0, w: src.rect?.[2] ?? img.width, h: src.rect?.[3] ?? img.height };
    const bob = idleBob(now, (pr.x * 37 + pr.y * 11) % 900);
    const dx = Math.round(pr.x - this.camera.x - pv.x * S);
    const dy = Math.round(pr.y - this.camera.y - pv.y * S + bob);
    this.blitEntity(`npc|${src.url}`, img, fr, dx, dy, S, false);
  }

  private drawProp(pr: MapProp, now = 0): void {
    const cam = this.camera;
    const src = this.tiles[pr.key];
    const img = src && this.images.get(src.url);
    if (img) {
      const [sx, sy, sw, sh] = src.rect ?? [0, 0, img.width, img.height];
      const [px, py] = src.pivot ?? [Math.floor(sw / 2), sh - 1];
      const sway = this.opts.look?.sway;
      if (sway && (this.swayRe ??= new RegExp(sway.keys)).test(pr.key)) {
        this.drawSwayed(src.url, sx, sy, sw, sh, Math.round(pr.x - px - cam.x), Math.round(pr.y - py - cam.y), this.swayAt(pr.key, pr.x, pr.y, now, sway) + (this.encFx?.rustleAt(pr.x, pr.y, now) ?? 0), 2);
        return;
      }
      this.drawPreset(src.url, sx, sy, sw, sh, Math.round(pr.x - px - cam.x), Math.round(pr.y - py - cam.y));
      return;
    }
    const ph = propPlaceholder(pr.key);
    let c = this.propImages.get(pr.key);
    if (!c) {
      c = this.makeCanvas(ph.w, ph.h);
      ph.draw(c.getContext("2d")!);
      this.propImages.set(pr.key, c);
    }
    this.ctx.drawImage(c, Math.round(pr.x - ph.pivot[0] - cam.x), Math.round(pr.y - ph.pivot[1] - cam.y));
  }

  // ---------- entidades ----------

  private visualOf(v: VisualEntity): CreatureVisual | undefined {
    if (!v.speciesId) return undefined;
    // a parceira local e o "modelo" ao lado dela nas capturas da comparação (id compare-show)
    const alias = v.kind === "partner" || v.id === "compare-show" ? this.opts.partnerVisuals?.[v.speciesId] : undefined;
    // ?mon=official: o visual oficial em toda entidade da espécie (inclusive os modelos official-show-* das capturas)
    const official = this.opts.officialVisuals?.[v.speciesId];
    return (alias && this.creatures[alias]) || (official && this.creatures[official]) || this.creatures[v.speciesId];
  }

  /** Escala inteira da criatura no mapa: global × mapScale do manifest (ou da tabela de tamanhos, se ligada). */
  private scaleOf(cv: CreatureVisual | undefined): number {
    const k = (cv && this.opts.visualScale?.[cv.manifest.id]) || 1;
    if (this.opts.unifiedScale) return this.opts.creatureScale * k;
    return this.opts.creatureScale * k * (cv ? mapScaleOf(cv.manifest, this.opts.sizeTable) : 1);
  }

  /** Deslocamento do golpe e do knockback em px (só visual: a posição lógica não muda). */
  private combatOffset(v: VisualEntity, p: Presenter, now: number): Vec {
    let x = 0;
    let y = 0;
    if (v.attack) {
      const a = v.attack;
      const reach = Math.max(2, Math.min(LUNGE_PX, a.gap - 12));
      const t = p.localTime(v, now) - a.start;
      const k = attackLunge(t, a.hitAtMs, a.durationMs, reach, a.launchAtMs);
      x += a.dir.x * k;
      y += a.dir.y * k;
    }
    if (v.hurt) {
      const k = knockback(now - v.hurt.start, v.hurt.px);
      x += v.hurt.dir.x * k;
      y += v.hurt.dir.y * k;
    }
    return { x: Math.round(x), y: Math.round(y) };
  }

  private drawEntity(v: VisualEntity, pos: Vec, p: Presenter, now: number): void {
    if (v.kind === "player" || v.kind === "remote_player") {
      const own = this.opts.tamerVisuals?.[v.id];
      if (own && this.images.get(own.sheetUrl)) return this.drawSprite(own, v, pos, p, now);
      const tv = v.kind === "player" ? this.opts.tamers?.local : this.opts.tamers?.remote;
      if (tv && this.images.get(tv.sheetUrl)) return this.drawSprite(tv, v, pos, p, now, this.opts.tamerTints?.[v.id]);
      return this.drawTamer(v, pos, now);
    }
    const sw = v.swap ? swapFrame(v.swap, now) : undefined;
    if (sw && sw.phase !== "done") return this.drawSwapping(v, pos, p, now, sw);
    const f = v.evo ? evoFrame(v.evo, now) : undefined;
    if (f && f.phase !== "wait" && f.phase !== "done") return this.drawEvolving(v, pos, p, now, f);
    const cv = this.visualOf(v);
    const lv = v.lvUpAt !== undefined ? (now - v.lvUpAt) / LEVEL_UP_FX_MS : -1;
    if (lv >= 0 && lv < 1) this.drawLevelUpAura(pos, lv, "under");
    // Level up: a parceira pisca branca no começo do brilho.
    const white = lv >= 0 && lv < 0.35 ? 0.75 * (1 - lv / 0.35) * (Math.floor(lv * 20) % 2 ? 0.6 : 1) : 0;
    if (cv) this.drawSprite(cv, v, pos, p, now, undefined, white);
    else if (v.speciesId) this.drawMissing(v, pos, p, now, white);
    if (lv >= 0 && lv < 1) this.drawLevelUpAura(pos, lv, "over");
  }

  /** Brilho do level up: anel dourado que abre no chão e faíscas subindo (pixel a pixel, sem blur). */
  private drawLevelUpAura(pos: Vec, k: number, layer: "under" | "over"): void {
    const ctx = this.ctx;
    const cx = Math.round(pos.x - this.camera.x);
    const cy = Math.round(pos.y - this.camera.y);
    ctx.globalAlpha = Math.max(0, 1 - k);
    if (layer === "under") {
      const rx = Math.round(6 + 14 * Math.min(1, k * 1.6));
      this.pixelRing(cx, cy, rx, Math.max(2, Math.round(rx / 3)), "#feae34");
      if (k < 0.6) this.pixelRing(cx, cy, Math.max(3, rx - 4), Math.max(2, Math.round(rx / 3) - 1), "#fee761");
    } else {
      for (let i = 0; i < 8; i++) {
        const x = cx + Math.round(Math.sin(i * 2.39) * (6 + (i % 3) * 3));
        const y = cy - 4 - Math.round((k * 34 + i * 5) % 30) - (i % 2) * 6;
        ctx.fillStyle = i % 2 ? "#fee761" : "#ffffff";
        ctx.fillRect(x, y, 1 + (i % 2), 1 + (i % 2));
      }
    }
    ctx.globalAlpha = 1;
  }

  /**
   * Digivolução no mapa (presenter.evoFrame): coluna e anel de luz, silhuetas brancas alternando entre a forma
   * antiga e a nova cada vez mais rápido, clarão e a forma nova revelada. Tudo em fillRect/sprites inteiros.
   */
  private drawEvolving(v: VisualEntity, pos: Vec, p: Presenter, now: number, f: EvoFrame): void {
    const evo = v.evo!;
    const ctx = this.ctx;
    const cx = Math.round(pos.x - this.camera.x);
    const cy = Math.round(pos.y - this.camera.y);
    const speciesId = f.show === "from" ? evo.from : evo.to;
    const sv: VisualEntity = { ...v, speciesId };
    const cv = this.visualOf(sv);
    const top = cv ? Math.round(this.headOffset(sv).top) + 6 : 30;
    if (f.aura > 0) {
      // Coluna de luz (faixas verticais que pulsam) atrás do corpo.
      const pulse = Math.floor(now / 90) % 2;
      const w = Math.round(4 + 10 * f.aura) + pulse * 2;
      ctx.globalAlpha = 0.18 * f.aura;
      ctx.fillStyle = "#fff6c8";
      ctx.fillRect(cx - w, cy - top - 24, w * 2, top + 26);
      ctx.globalAlpha = 0.3 * f.aura;
      ctx.fillRect(cx - Math.ceil(w / 2), cy - top - 24, Math.ceil(w / 2) * 2, top + 26);
      // Anéis no chão: um gira para dentro, o outro respira.
      ctx.globalAlpha = Math.min(1, f.aura * 1.2);
      const r1 = Math.round(10 + 8 * f.aura + 2 * Math.sin(now / 120));
      this.pixelRing(cx, cy, r1, Math.max(3, Math.round(r1 / 3)), "#fee761");
      const r2 = Math.round(18 - ((now / 30) % 12));
      if (r2 > 4) this.pixelRing(cx, cy, r2, Math.max(2, Math.round(r2 / 3)), "#ffffff");
      ctx.globalAlpha = 1;
    }
    if (cv) this.drawSprite(cv, sv, pos, p, now, undefined, f.white);
    else this.drawMissing(sv, pos, p, now, f.white);
    if (f.aura > 0) {
      // Partículas de dados subindo em espiral.
      for (let i = 0; i < 14; i++) {
        const ph = ((now / 700 + i / 14) % 1);
        const ang = i * 2.4 + now / 260;
        const r = 6 + (i % 4) * 3;
        const x = cx + Math.round(Math.cos(ang) * r);
        const y = cy - Math.round(ph * (top + 18));
        ctx.globalAlpha = f.aura * (1 - ph);
        ctx.fillStyle = i % 3 ? "#ffffff" : "#2ce8f5";
        ctx.fillRect(x, y, i % 4 === 0 ? 2 : 1, i % 4 === 0 ? 2 : 1);
      }
      ctx.globalAlpha = 1;
    }
    if (f.flash > 0) {
      // Clarão: esfera branca que cresce e some (elipse em linhas inteiras).
      const grow = f.phase === "flash" ? 1 : f.flash;
      const rx = Math.round(8 + 30 * grow);
      ctx.globalAlpha = 0.9 * f.flash;
      ctx.fillStyle = "#ffffff";
      this.pixelEllipse(cx, cy - Math.round(top / 2), rx, Math.round(rx * 0.85));
      ctx.globalAlpha = 1;
    }
  }

  /**
   * Troca de Digimon (presenter.swapFrame): quem sai vira silhueta branca e recua até o Tamer por um feixe de luz,
   * sumindo; quem entra aparece no mesmo lugar como silhueta que se revela, com anel no chão e o estouro de impacto
   * do seu elemento (fx.drawImpact, o mesmo dos golpes).
   */
  private drawSwapping(v: VisualEntity, pos: Vec, p: Presenter, now: number, f: SwapFrame): void {
    const sw = v.swap!;
    const ctx = this.ctx;
    const speciesId = f.show === "from" ? sw.from : sw.to;
    const sv: VisualEntity = { ...v, speciesId };
    const cv = this.visualOf(sv);
    const at = f.phase === "recall" ? { x: pos.x + (sw.tamerAt.x - pos.x) * f.pull, y: pos.y + (sw.tamerAt.y - pos.y) * f.pull } : pos;
    const cx = Math.round(at.x - this.camera.x);
    const cy = Math.round(at.y - this.camera.y);
    const top = cv ? Math.round(this.headOffset(sv).top) : 24;
    if (f.phase === "recall") {
      // feixe: pontos de luz do corpo até o Tamer
      const tx = Math.round(sw.tamerAt.x - this.camera.x);
      const ty = Math.round(sw.tamerAt.y - this.camera.y) - 12;
      const n = 10;
      for (let i = 0; i < n; i++) {
        const u = ((i / n + now / 260) % 1) * (1 - f.pull * 0.5) + f.pull * 0.5;
        ctx.globalAlpha = Math.min(1, f.k * 2) * (1 - u * 0.6);
        ctx.fillStyle = i % 3 ? "#ffffff" : "#2ce8f5";
        const x = Math.round(cx + (tx - cx) * u);
        const y = Math.round(cy - top / 2 + (ty - (cy - top / 2)) * u) - Math.round(Math.sin(u * Math.PI) * 6);
        ctx.fillRect(x, y, i % 3 ? 1 : 2, i % 3 ? 1 : 2);
      }
      ctx.globalAlpha = Math.min(1, f.k * 1.5) * f.alpha;
      const r = Math.round(6 + 6 * f.k);
      this.pixelRing(cx, cy, r, Math.max(2, Math.round(r / 3)), "#2ce8f5");
      ctx.globalAlpha = 1;
    } else {
      // entrada: anel que abre no chão + estouro do elemento da espécie nova
      const r = Math.round(4 + 16 * f.k);
      ctx.globalAlpha = Math.max(0, 1 - f.k);
      this.pixelRing(cx, cy, r, Math.max(2, Math.round(r / 3)), "#fee761");
      if (f.k < 0.5) this.pixelRing(cx, cy, Math.max(3, r - 5), Math.max(2, Math.round(r / 3) - 1), "#ffffff");
      ctx.globalAlpha = 1;
    }
    if (cv) this.drawSprite(cv, sv, at, p, now, undefined, f.white, f.alpha);
    else this.drawMissing(sv, at, p, now, f.white);
    if (f.phase === "enter") {
      const t = f.k * SWAP_ENTER_MS;
      drawImpact(ctx, { targetId: v.id, start: 0, seq: Math.round(sw.start) % 997, crit: true, special: true, element: elementOf(sw.to), dir: { x: 0, y: -1 } }, cx, cy - Math.round(top / 2), t);
    }
  }

  /** Elipse cheia em linhas de 1 px (fillStyle já definido). */
  private pixelEllipse(cx: number, cy: number, rx: number, ry: number): void {
    for (let y = -ry; y <= ry; y++) {
      const half = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
      this.ctx.fillRect(cx - half, cy + y, half * 2 + 1, 1);
    }
  }

  /** Espécie ainda sem arte (ramo de evolução SP-*): marcador "?" no lugar do sprite, para não sumir do mapa. */
  private drawMissing(v: VisualEntity, pos: Vec, p: Presenter, now: number, white = 0): void {
    const off = this.combatOffset(v, p, now);
    const x = Math.round(pos.x - this.camera.x + off.x);
    const y = Math.round(pos.y - this.camera.y + off.y);
    const r = 11;
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = white >= 1 ? "#ffffff" : "#3a4466";
    ctx.strokeStyle = white >= 1 ? "#ffffff" : "#c0cbdc";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y - r - 1, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("?", x, y - r);
    ctx.restore();
  }

  /** Quadro atual (chave do atlas + espelho) de uma entidade com manifest. Exportado para testes via view. */
  frameFor(cv: CreatureVisual, v: VisualEntity, p: Presenter, now: number): { key: string; mirror: boolean; state: LogicState; anim: string; v2?: CtlFrame } {
    const m = cv.manifest;
    if (this.opts.animV2) {
      const r = this.ctlFrameOf(cv, v, p, now);
      if (r) {
        const k = r.f.frames.frames[r.f.index]?.atlasKey ?? "";
        return { key: r.f.anim === "idle" ? this.standKey(cv, k) : k, mirror: r.mirror, state: p.visualState(v, now), anim: r.f.anim, v2: r.f };
      }
    }
    const mo = this.motions.get(v.id) ?? newMotion(v.facing);
    const lt = p.localTime(v, now);
    const state = p.visualState(v, now);
    const moving = mo.speed > MOVING_PX_S;
    const look: LogicState = LOCOMOTION.includes(state) ? (moving ? "WALK" : "IDLE") : state;
    const choice = resolveAnim(m, look, moving);
    const face = resolveFacing(m, choice.name, DIR4_TO_8[mo.face]);
    const frames = framesFor(choice.anim, face.dir);
    const anim = { ...choice.anim, frames };
    let fi: number;
    if (choice.procedural === "fade") fi = frames.length - 1;
    else if (look === "WALK" && choice.name !== "idle")
      fi = walkFrameIndex(mo.walked, frames.map((f) => f.durationMs), m.walkSpeedPxPerSec ?? 100);
    else if (look === "WALK") fi = walkFrameIndex(mo.walked, frames.map((f) => f.durationMs), (m.walkSpeedPxPerSec ?? 100) * 0.6);
    else if (state === "ATTACK" && v.attack) fi = frameAt(anim, lt - v.attack.start, false);
    else if ((state === "HURT" || state === "DEFEAT") && v.hurt) fi = frameAt(anim, lt - v.hurt.start, false);
    else fi = frameAt(anim, lt + v.phase, choice.anim.loop);
    const key = frames[fi]?.atlasKey ?? "";
    return { key: choice.name === "idle" ? this.standKey(cv, key) : key, mirror: face.mirror, state, anim: choice.name };
  }

  /**
   * Parado: troca o quadro de passada do idle pelo de pés juntos da mesma direção (render/standpose.ts). O fallback
   * por bbox lê os pixels da folha; enquanto ela não carregou, usa só o quadro neutro do walk / idle desenhado.
   */
  standKey(cv: CreatureVisual, key: string): string {
    if (this.standPoseOff) return key;
    let map = this.stands.get(cv);
    if (!map) {
      const loaded = (k: string) => this.images.get(imageUrlOf(cv, k));
      const ready = Object.keys(cv.atlas.frames).every((k) => loaded(k));
      const alphaAt = (k: string) => {
        const img = loaded(k);
        const fr = cv.atlas.frames[k]?.frame;
        if (!img || !fr) return undefined;
        const c = this.makeCanvas(fr.w, fr.h);
        const g = c.getContext("2d");
        try {
          g!.drawImage(img, fr.x, fr.y, fr.w, fr.h, 0, 0, fr.w, fr.h);
          const d = g!.getImageData(0, 0, fr.w, fr.h).data;
          return (x: number, y: number) => d[(y * fr.w + x) * 4 + 3];
        } catch {
          return undefined; // canvas de teste sem pixels: sem fallback por bbox
        }
      };
      const sizeOf = (k: string) => cv.atlas.frames[k]?.frame;
      map = standRemap(cv.manifest, standPose(cv.manifest, ready ? alphaAt : undefined, sizeOf));
      if (ready) this.stands.set(cv, map);
    }
    return map.get(key) ?? key;
  }

  /** `white` 0..1: silhueta branca por cima do sprite (1 = só a silhueta: digivolução). */
  private drawSprite(cv: CreatureVisual, v: VisualEntity, pos: Vec, p: Presenter, now: number, tint?: number, white = 0, alphaMul = 1): void {
    const mo = this.motions.get(v.id);
    const { key, mirror, state, v2 } = this.frameFor(cv, v, p, now);
    const url = imageUrlOf(cv, key);
    let img: ImageLike | HTMLCanvasElement | undefined = this.images.get(url);
    if (!img) return;
    if (tint) {
      const id = `${url}|${tint}`;
      let t = this.tinted.get(id);
      if (!t) this.tinted.set(id, (t = hueShifted(img, tint, this.makeCanvas)));
      img = t;
    }
    const fr = cv.atlas.frames[key]?.frame;
    if (!fr) return;
    const pv = framePivot(cv, key);
    const S = this.scaleOf(cv);
    const off = this.combatOffset(v, p, now);
    const moving = (mo?.speed ?? 0) > MOVING_PX_S;
    let bob = 0;
    let lean = 0;
    if (v2) {
      // v2: o controlador decide o deslocamento procedural (bob só com idle de 1 quadro; hop, hover, dip, lean).
      bob = v.hitStop ? 0 : v2.dy * S;
      lean = (mo?.face === "W" ? -1 : mo?.face === "E" ? 1 : 0) * v2.dx * S;
    } else if (!moving && LOCOMOTION.includes(state) && !v.hitStop) bob = idleBob(now, v.phase);
    else if (moving && !cv.manifest.animations.walk) bob = Math.floor((mo?.walked ?? 0) / 8) % 2 ? -1 : 0;
    const pivotX = mirror ? fr.w - pv.x : pv.x;
    const dx = Math.round(pos.x - this.camera.x - pivotX * S + off.x + lean);
    const dy = Math.round(pos.y - this.camera.y - pv.y * S + off.y + bob);
    const ctx = this.ctx;
    const fade = (state === "DEFEAT" && v.defeatedAt !== undefined ? Math.max(0, 1 - (now - v.defeatedAt) / DEFEAT_FADE_MS) : 1) * alphaMul;
    ctx.globalAlpha = fade;
    if (white < 1) this.blitEntity(`${url}|${tint ?? 0}|${key}`, img, fr, dx, dy, S, mirror);
    // Flash branco do impacto (alvo, durante o hit-stop) e brilho curto do atacante.
    const flash = Math.max(white, now < v.flashUntil ? 1 : v.attackFlashAt && now >= v.attackFlashAt && now < v.attackFlashAt + 50 ? 0.5 : 0);
    if (flash > 0 && fade > 0) {
      ctx.globalAlpha = flash * fade;
      this.blit(this.silhouette(cv, key, img, fr), { x: 0, y: 0, w: fr.w, h: fr.h }, dx, dy, S, mirror);
    }
    ctx.globalAlpha = 1;
  }

  /** Monta o quadro de VFX de um golpe (posições de tela vivas) e desenha a camada pedida. */
  private drawCastLayer(p: Presenter, c: Cast, alpha: number, now: number, layer: "ground" | "over"): void {
    const cam = this.camera;
    const a = p.entities.get(c.attackerId);
    const t = p.entities.get(c.targetId);
    const scr = (v: Vec): Vec => ({ x: Math.round(v.x - cam.x), y: Math.round(v.y - cam.y) });
    const anchor = (v: VisualEntity | undefined, fallback: Vec): { hit: Vec; feet: Vec } => {
      if (!v) return { hit: scr({ x: fallback.x, y: fallback.y - 10 }), feet: scr(fallback) };
      const pos = this.posOf(p, v, alpha);
      const off = this.combatOffset(v, p, now);
      const h = this.headOffset(v);
      return { hit: scr({ x: pos.x + off.x + h.hit.x, y: pos.y + off.y + h.hit.y }), feet: scr({ x: pos.x + off.x, y: pos.y + off.y }) };
    };
    const A = anchor(a, c.from);
    const T = c.self ? A : anchor(t, c.to);
    const targets = c.targetIds.map((id) => (id === c.attackerId ? A : id === c.targetId ? T : anchor(p.entities.get(id), c.at)));
    // Área: centro no alvo vivo (lançada) ou nos pés do atacante (ao redor de si); linha: ponta relativa ao atacante.
    const aPos = a ? this.posOf(p, a, alpha) : c.from;
    const aroundSelf = Math.hypot(c.at.x - c.from.x, c.at.y - c.from.y) < 2;
    const center = c.self || aroundSelf ? A.feet : t ? T.feet : scr(c.at);
    const endWorld = { x: aPos.x + (c.at.x - c.from.x), y: aPos.y + (c.at.y - c.from.y) };
    const end = { x: Math.round(endWorld.x - cam.x) + (A.hit.x - A.feet.x), y: Math.round(endWorld.y - cam.y) + (A.hit.y - A.feet.y) };
    const line = this.moveTarget(p, c) === "line";
    const tip = line ? end : T.hit;
    const dx = tip.x - A.hit.x;
    const dy = tip.y - A.hit.y;
    const len = Math.hypot(dx, dy) || 1;
    const f: VfxFrame = {
      g: this.ctx,
      seq: Math.abs(c.seq),
      P: c.params.palette,
      S: c.params.scale,
      count: c.params.count,
      now,
      o: A.hit,
      of: A.feet,
      d: T.hit,
      df: T.feet,
      targets,
      c: center,
      end: tip,
      radius: c.radius,
      dir: c.self ? { x: 1, y: 0 } : { x: dx / len, y: dy / len },
      self: c.self,
      glow: c.params.glow,
    };
    drawCast(f, c, now, layer, layer === "over" ? this.opts.fxSheets : undefined);
  }

  private moveTarget(p: Presenter, c: Cast): string | undefined {
    return p.moves.moves[c.moveId]?.target;
  }

  private blit(img: CanvasImageSource, fr: { x: number; y: number; w: number; h: number }, dx: number, dy: number, S: number, mirror: boolean): void {
    const ctx = this.ctx;
    if (!mirror) {
      ctx.drawImage(img, fr.x, fr.y, fr.w, fr.h, dx, dy, fr.w * S, fr.h * S);
      return;
    }
    ctx.save();
    ctx.translate(dx + fr.w * S, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(img, fr.x, fr.y, fr.w, fr.h, 0, 0, fr.w * S, fr.h * S);
    ctx.restore();
  }

  private silhouette(cv: CreatureVisual, key: string, img: CanvasImageSource, fr: { x: number; y: number; w: number; h: number }): HTMLCanvasElement {
    const id = `${cv.manifest.id}|${key}`;
    let c = this.silhouettes.get(id);
    if (c) return c;
    c = this.makeCanvas(fr.w, fr.h);
    const g = c.getContext("2d")!;
    g.drawImage(img, fr.x, fr.y, fr.w, fr.h, 0, 0, fr.w, fr.h);
    g.globalCompositeOperation = "source-in";
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, fr.w, fr.h);
    this.silhouettes.set(id, c);
    return c;
  }

  /** Tamer placeholder: 4 direções pela velocidade visual, passo sincronizado com a distância, bob parado. */
  private drawTamer(v: VisualEntity, pos: Vec, now: number): void {
    const set = v.kind === "player" ? this.tamers.local : this.tamers.remote;
    const mo = this.motions.get(v.id);
    const walking = (mo?.speed ?? 0) > MOVING_PX_S;
    const step = walking ? Math.floor((mo?.walked ?? 0) / 10) % 2 : 0;
    const face = mo?.face ?? "S";
    const side = face === "E" || face === "W";
    const frames = side ? set.east : set.south;
    const mirror = face === "W";
    const bob = walking ? (step ? -1 : 0) : idleBob(now, v.phase, 1100);
    const dx = Math.round(pos.x - this.camera.x - (mirror ? TAMER_W - TAMER_PIVOT.x : TAMER_PIVOT.x));
    const dy = Math.round(pos.y - this.camera.y - TAMER_PIVOT.y + bob);
    this.blitEntity(`tamer-ph|${v.kind}|${side ? "e" : "s"}|${step}`, frames[step], { x: 0, y: 0, w: TAMER_W, h: TAMER_H }, dx, dy, 1, side && mirror);
  }

  private drawShadow(v: VisualEntity, pos: Vec, now: number, p?: Presenter, scale = 1): void {
    let rx = 6;
    let ry = 2;
    let ox = 0;
    let oy = 0;
    const cv = this.visualOf(v);
    const S = this.scaleOf(cv);
    if (cv?.manifest.anchors?.shadow) {
      const s = cv.manifest.anchors.shadow;
      rx = Math.max(3, Math.round(s.rx * 0.8 * S * scale));
      ry = Math.max(1, Math.round(s.ry * 0.7 * S * scale));
      ox = Math.round((s.cx - cv.manifest.pivot.x) * S);
      oy = Math.round((s.cy - cv.manifest.pivot.y) * S);
    }
    // look v8: sombra de contato um pouco maior, com núcleo mais escuro logo abaixo dos pés
    if (this.opts.look) {
      const core = this.shadowImage(Math.max(2, Math.round(rx * 0.6)), Math.max(1, Math.round(ry * 0.7)));
      rx = Math.round(rx * 1.15);
      ry += 1;
      const off0 = p ? this.combatOffset(v, p, now) : { x: 0, y: 0 };
      const fade0 = v.defeatedAt !== undefined && now >= v.defeatedAt ? Math.max(0, 1 - (now - v.defeatedAt) / DEFEAT_FADE_MS) : 1;
      this.ctx.globalAlpha = 0.3 * fade0;
      this.ctx.drawImage(core, Math.round(pos.x - this.camera.x + ox - (core.width - 1) / 2 + off0.x), Math.round(pos.y - this.camera.y + oy - (core.height - 1) / 2 + off0.y));
    }
    const key = `${rx}x${ry}`;
    let c = this.shadows.get(key);
    if (!c) {
      c = this.makeCanvas(rx * 2 + 1, ry * 2 + 1);
      const g = c.getContext("2d")!;
      g.fillStyle = "#000000";
      for (let y = -ry; y <= ry; y++) {
        const half = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
        g.fillRect(rx - half, ry + y, half * 2 + 1, 1);
      }
      this.shadows.set(key, c);
    }
    const fade = v.defeatedAt !== undefined && now >= v.defeatedAt ? Math.max(0, 1 - (now - v.defeatedAt) / DEFEAT_FADE_MS) : 1;
    this.ctx.globalAlpha = (this.opts.look?.shadows?.entityAlpha ?? 0.28) * fade;
    const off = p ? this.combatOffset(v, p, now) : { x: 0, y: 0 };
    this.ctx.drawImage(c, Math.round(pos.x - this.camera.x + ox - rx + off.x), Math.round(pos.y - this.camera.y + oy - ry + off.y));
    this.ctx.globalAlpha = 1;
  }

  /** Elipse preta cheia (cache por tamanho), base das sombras de entidade. */
  private shadowImage(rx: number, ry: number): HTMLCanvasElement {
    const key = `${rx}x${ry}`;
    let c = this.shadows.get(key);
    if (!c) {
      c = this.makeCanvas(rx * 2 + 1, ry * 2 + 1);
      const g = c.getContext("2d")!;
      g.fillStyle = "#000000";
      for (let y = -ry; y <= ry; y++) {
        const half = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
        g.fillRect(rx - half, ry + y, half * 2 + 1, 1);
      }
      this.shadows.set(key, c);
    }
    return c;
  }

  private drawTargetRing(v: VisualEntity, pos: Vec, now: number): void {
    const cv = this.visualOf(v);
    const r = cv?.manifest.anchors?.shadow;
    const S = this.scaleOf(cv);
    const pulse = Math.floor(now / 250) % 2;
    const rx = (r ? Math.round(r.rx * S) + 2 : 10) + pulse;
    const ry = r ? Math.max(3, Math.round(r.ry * S) + 1) : 4;
    this.pixelRing(Math.round(pos.x - this.camera.x), Math.round(pos.y - this.camera.y), rx, ry, "#feae34");
  }

  /** Contorno de elipse em pixels inteiros (anel do alvo, level up, digivolução). */
  private pixelRing(cx: number, cy: number, rx: number, ry: number, color: string): void {
    this.ctx.fillStyle = color;
    let lastHalf = -1;
    for (let y = -ry; y <= ry; y++) {
      const half = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
      this.ctx.fillRect(cx - half, cy + y, 1, 1);
      this.ctx.fillRect(cx + half, cy + y, 1, 1);
      if (lastHalf >= 0 && Math.abs(half - lastHalf) > 1) {
        const a = Math.min(half, lastHalf);
        const b = Math.max(half, lastHalf);
        const yy = cy + (half > lastHalf ? y - 1 : y);
        this.ctx.fillRect(cx - b, yy, b - a, 1);
        this.ctx.fillRect(cx + a + 1, yy, b - a, 1);
      }
      lastHalf = half;
    }
  }

  private headOffset(v: VisualEntity): { top: number; width: number; hit: Vec } {
    const cv = this.visualOf(v);
    const S = this.scaleOf(cv);
    if (!cv) return { top: TAMER_PIVOT.y, width: 16, hit: { x: 0, y: -16 } };
    const m = cv.manifest;
    const headY = m.anchors?.head?.y ?? 0;
    const hit = m.anchors?.hit ?? { x: m.pivot.x, y: Math.round(m.pivot.y / 2) };
    const mirror = resolveFacing(m, "idle", DIR4_TO_8[this.motions.get(v.id)?.face ?? "S"]).mirror;
    const hx = (mirror ? m.dimensions.frameW - hit.x : hit.x) - m.pivot.x;
    return { top: (m.pivot.y - headY) * S, width: Math.min(m.dimensions.frameW * S, 24) + 2, hit: { x: hx * S, y: (hit.y - m.pivot.y) * S } };
  }

  private drawOverheads(v: VisualEntity, pos: Vec, p: Presenter, now: number): void {
    const ctx = this.ctx;
    const h = this.headOffset(v);
    const x0 = Math.round(pos.x - this.camera.x);
    const top = Math.round(pos.y - this.camera.y - h.top);
    if (now < v.exclaimUntil && now >= v.exclaimUntil - EXCLAIM_MS) drawOutlinedText(ctx, "!", x0 - 1, top - 14, "#fee761");
    if (!p.barVisible(v, now) || this.plateIds?.has(v.id)) return;
    const w = h.width;
    const bx = x0 - Math.floor(w / 2);
    const by = top - 3 - 3;
    const hp = p.hpNow(v, now);
    const ratio = v.maxHp > 0 ? hp / v.maxHp : 0;
    const inner = w - 2;
    ctx.fillStyle = "#181425";
    ctx.fillRect(bx, by, w, 4);
    ctx.fillStyle = "#3a4466";
    ctx.fillRect(bx + 1, by + 1, inner, 2);
    if (now < v.ghostUntil && v.ghostHp > hp) {
      ctx.fillStyle = "#ead4aa";
      ctx.fillRect(bx + 1, by + 1, Math.round((inner * v.ghostHp) / v.maxHp), 2);
    }
    ctx.fillStyle = ratio > 0.5 ? "#63c74d" : ratio > 0.25 ? "#feae34" : "#e43b44";
    ctx.fillRect(bx + 1, by + 1, Math.max(hp > 0 ? 1 : 0, Math.round(inner * ratio)), 2);
  }

  /** Vento de um prop: a grama de encontro balança `encGrassSwayMul` vezes mais (P8 v2, §8.3). */
  private swayAt(key: string, x: number, y: number, now: number, sway: SwayCfg): number {
    const mul = this.opts.encGrassSwayMul ?? 1;
    return swayOffset(x, y, now, mul !== 1 && ENC_GRASS_RE.test(key) ? { ...sway, amp: sway.amp * mul } : sway);
  }

  /** P8 v2: ponto acima da cabeça de uma entidade (px lógicos de tela), onde a placa de alvo apoia a base. */
  plateAnchor(p: Presenter, id: string, alpha: number, now: number): { x: number; y: number } | undefined {
    const v = p.entities.get(id);
    if (!v || (v.defeatedAt !== undefined && now > v.defeatedAt + 400)) return undefined;
    const pos = this.posOf(p, v, alpha);
    const off = this.combatOffset(v, p, now);
    const jump = this.encFx?.entityOffset(v.id, now);
    return { x: Math.round(pos.x - this.camera.x) + off.x, y: Math.round(pos.y - this.camera.y + (jump?.dy ?? 0) - this.headOffset(v).top) - 3 };
  }

  /** PV mostrado agora (com a animação de dano do presenter). */
  hpShown(p: Presenter, id: string, now: number): { hp: number; maxHp: number; name: string; level: number; speciesId?: string } | undefined {
    const v = p.entities.get(id);
    return v && { hp: p.hpNow(v, now), maxHp: v.maxHp, name: v.name, level: v.level, speciesId: v.speciesId };
  }

  /** Altura (px) do topo da cabeça acima dos pés, para Tamers com sprite real ou placeholder. */
  private tamerTop(v: VisualEntity): number {
    const tv = this.opts.tamerVisuals?.[v.id] ?? (v.kind === "player" ? this.opts.tamers?.local : this.opts.tamers?.remote);
    if (!tv) return TAMER_PIVOT.y;
    const m = tv.manifest;
    return m.pivot.y - (m.anchors?.head?.y ?? 0);
  }

  /**
   * Rótulos de nome e nível (Tamers e Digimon) das entidades visíveis, ancorados acima da cabeça (e acima da barra
   * de HP quando ela aparece), em px lógicos de tela. A disposição sem sobreposição fica em labels.ts.
   */
  labels(p: Presenter, alpha: number, now: number): EntityLabel[] {
    const out: EntityLabel[] = [];
    const cam = this.camera;
    const localPartner = p.entities.get(p.localPartnerId);
    for (const v of p.entities.values()) {
      if (v.defeatedAt !== undefined && now > v.defeatedAt + 400) continue;
      // GS-012: do salto da grama até a placa sumir, o nome fica na placa de raridade (encounterFx), não no rótulo
      if (this.encFx?.hidesLabel(v.id, now) || this.plateIds?.has(v.id)) continue;
      const pos = this.posOf(p, v, alpha);
      const x = Math.round(pos.x - cam.x);
      const y = Math.round(pos.y - cam.y);
      if (x < -40 || y < -10 || x > cam.w + 40 || y > cam.h + 120) continue;
      const tamer = v.kind === "player" || v.kind === "remote_player";
      const top = tamer ? this.tamerTop(v) : this.headOffset(v).top;
      const bar = p.barVisible(v, now) ? 8 : 1;
      const mine = v.kind === "player" || v.ownerId === p.localPlayerId;
      const off = tamer ? { x: 0, y: 0 } : this.combatOffset(v, p, now);
      out.push({
        id: v.id,
        name: v.name,
        level: tamer ? this.opts.tamerLevels?.[v.id] : v.level,
        x: x + off.x,
        y: y - Math.round(top) - bar - 1,
        color: tamer ? (mine ? "#ffe9a8" : "#ffffff") : v.kind === "wild" ? "#ffb4a2" : mine ? "#9ff0ff" : "#cdb8ff",
        priority: v.kind === "player" ? 5 : v.id === p.localPartnerId ? 4 : localPartner?.targetId === v.id ? 3 : tamer || v.kind === "remote_partner" ? 2 : 1,
        alpha: v.defeatedAt !== undefined ? 0.5 : v.kind === "wild" && !v.encounterId ? 0.85 : 1,
      });
    }
    return out;
  }
}
