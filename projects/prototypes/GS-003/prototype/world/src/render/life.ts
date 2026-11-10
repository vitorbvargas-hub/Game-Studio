// Vida do mapa no look v9 (Quality Overhaul, fase 2): vento em copas e grama, água correndo e primeiro plano.
// Funções puras (testáveis); o desenho fica na view. Tudo em pixels inteiros: o "shader" é um cisalhamento por
// faixas (a faixa de cima desloca ±1 px, a de baixo fica presa), sem reamostrar a arte.

export interface SwayCfg {
  /** Regex das chaves de prop que balançam (grama, juncos, samambaias). */
  keys: string;
  /** Copas das árvores de 2 sprites também balançam. */
  canopies: boolean;
  /** Deslocamento máximo da faixa de cima (px de arte). */
  amp: number;
  /** Período do vento (ms). */
  periodMs: number;
  /** Faixas horizontais do cisalhamento da copa (2–4). */
  bands: number;
}

export interface WaterCfg {
  /** Terreno das curvas que correm (`terrain` da camada curves). */
  terrain: string;
  /** Deslocamento por quadro (px de arte) e duração de cada quadro (ms). */
  stepPx: [number, number];
  frameMs: number;
  /** Quadros do ciclo (o deslocamento dá a volta no tile em frames × stepPx). */
  frames: number;
  /**
   * P7: quebra a repetição da textura (que ladrilha a cada tile). Ruído contínuo no espaço do mundo, sem costura na
   * borda das células: deslocamento de fase por pixel (0..phasePx, em escala `scale` px) e brilho que respira no ciclo.
   */
  noise?: WaterNoiseCfg;
}

export interface WaterNoiseCfg {
  /** Deslocamento máximo de fase da textura (px de arte) em x e y. */
  phasePx: [number, number];
  /** Escala do ruído de fase (px de mundo por célula de ruído) em x e y. */
  scale: [number, number];
  /** Amplitude do brilho (0–255) que oscila no ciclo. */
  shade: number;
  seed: number;
}

function hashN(x: number, y: number, s: number): number {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Ruído de valor suave em [0, 1), contínuo no plano (o mesmo valor dos dois lados da borda de uma célula). */
export function valueNoise(x: number, y: number, s: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = hashN(x0, y0, s);
  const b = hashN(x0 + 1, y0, s);
  const c = hashN(x0, y0 + 1, s);
  const d = hashN(x0 + 1, y0 + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/** Campo de ruído de uma célula de água (fase e brilho por pixel), calculado uma vez por célula. */
export interface WaterNoise {
  ox: Uint8Array;
  oy: Uint8Array;
  /** Dois campos de brilho (−0,5..0,5) misturados pelo quadro do ciclo, que assim fecha sem salto. */
  n1: Float32Array;
  n2: Float32Array;
}

export function waterNoiseFor(mx: number, my: number, ts: number, cfg: WaterNoiseCfg): WaterNoise {
  const n = ts * ts;
  const out: WaterNoise = { ox: new Uint8Array(n), oy: new Uint8Array(n), n1: new Float32Array(n), n2: new Float32Array(n) };
  for (let y = 0; y < ts; y++)
    for (let x = 0; x < ts; x++) {
      const wx = mx * ts + x;
      const wy = my * ts + y;
      const i = y * ts + x;
      out.ox[i] = Math.min(cfg.phasePx[0], Math.floor(valueNoise(wx / cfg.scale[0], wy / cfg.scale[1], cfg.seed) * (cfg.phasePx[0] + 1)));
      out.oy[i] = Math.min(cfg.phasePx[1], Math.floor(valueNoise(wx / cfg.scale[0], wy / cfg.scale[1], cfg.seed + 1) * (cfg.phasePx[1] + 1)));
      out.n1[i] = valueNoise(wx / 9, wy / 6, cfg.seed + 2) - 0.5;
      out.n2[i] = valueNoise(wx / 9, wy / 6, cfg.seed + 3) - 0.5;
    }
  return out;
}

/**
 * Pixels da célula com a textura deslocada por (dx, dy) MAIS a fase do ruído por pixel, e o brilho do ciclo
 * (`phase` em [0, 1)) somado só onde há água (peso b). Sem ruído é igual a waterCompose(m, scrollPixels(...)).
 */
export function waterComposeNoisy(m: WaterMix, src: Uint8ClampedArray, ts: number, dx: number, dy: number, nz: WaterNoise, shade: number, phase: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(m.a.length);
  const c = (1 + Math.cos(phase * Math.PI * 2)) / 2;
  for (let y = 0; y < ts; y++)
    for (let x = 0; x < ts; x++) {
      const i = y * ts + x;
      const j = i * 4;
      const sx = (((x - dx - nz.ox[i]) % ts) + ts) % ts;
      const sy = (((y - dy - nz.oy[i]) % ts) + ts) % ts;
      const t = (sy * ts + sx) * 4;
      const k = m.b[i];
      const sh = k * shade * 2 * (nz.n1[i] * c + nz.n2[i] * (1 - c));
      out[j] = m.a[j] + k * src[t] + sh;
      out[j + 1] = m.a[j + 1] + k * src[t + 1] + sh;
      out[j + 2] = m.a[j + 2] + k * src[t + 2] + sh;
      out[j + 3] = m.a[j + 3];
    }
  return out;
}

export interface ForegroundCfg {
  /** Opacidade quando cobre o jogador ou a parceira (as copas usam a mesma ideia: behindAlpha). */
  behindAlpha: number;
  /** Tempo da transição de opacidade (ms). */
  fadeMs: number;
}

/**
 * Deslocamento do vento num ponto (px inteiros em [-amp, amp]). A fase anda pelo mapa (rajada que atravessa a mata),
 * então vizinhos se mexem quase juntos e a floresta não "pisca" em uníssono.
 */
export function swayOffset(x: number, y: number, now: number, cfg: Pick<SwayCfg, "amp" | "periodMs">): number {
  const phase = x * 0.011 + y * 0.006;
  const w = Math.sin((now / cfg.periodMs) * Math.PI * 2 - phase);
  // rajada lenta por cima: o vento não é um metrônomo
  const gust = 0.6 + 0.4 * Math.sin((now / (cfg.periodMs * 3.7)) * Math.PI * 2 - phase * 0.5);
  return Math.round(w * gust * cfg.amp);
}

/** Deslocamento de cada faixa, de cima para baixo: a de cima leva `s`, a de baixo fica presa (0). */
export function bandShifts(s: number, bands: number): number[] {
  const n = Math.max(2, Math.min(6, Math.round(bands)));
  return Array.from({ length: n }, (_, i) => Math.round((s * (n - 1 - i)) / (n - 1)) || 0);
}

/** Faixas [y0, y1) que dividem a altura `h` em `n`. */
export function bandRows(h: number, n: number): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < n; i++) out.push([Math.round((h * i) / n), Math.round((h * (i + 1)) / n)]);
  return out;
}

/** Quadro do ciclo da água e o deslocamento da textura (UV) nele, com volta no tile. */
export function waterFrame(now: number, cfg: WaterCfg, ts: number): { frame: number; dx: number; dy: number } {
  const frame = Math.floor(now / cfg.frameMs) % cfg.frames;
  const m = (v: number) => ((v % ts) + ts) % ts;
  return { frame, dx: m(frame * cfg.stepPx[0]), dy: m(frame * cfg.stepPx[1]) };
}

/** Pixels RGBA (ts×ts) do tile deslocado por (dx, dy) com volta (scroll de UV sem reamostrar). */
export function scrollPixels(src: Uint8ClampedArray, ts: number, dx: number, dy: number): Uint8ClampedArray {
  if (!dx && !dy) return src;
  const out = new Uint8ClampedArray(src.length);
  for (let y = 0; y < ts; y++)
    for (let x = 0; x < ts; x++) {
      const sx = (x - dx + ts) % ts;
      const sy = (y - dy + ts) % ts;
      const i = (y * ts + x) * 4;
      const j = (sy * ts + sx) * 4;
      out[i] = src[j];
      out[i + 1] = src[j + 1];
      out[i + 2] = src[j + 2];
      out[i + 3] = src[j + 3];
    }
  return out;
}

/** Faixa de uma célula linear na textura da água: out = a + b·textura (b por pixel, igual nos 3 canais). */
export interface WaterMix {
  a: Uint8ClampedArray;
  b: Float32Array;
  /** Chave da textura da água (fill da curva). */
  fill: string;
  /** P7: ruído da célula (fase e brilho), quando o look pede `water.noise`. */
  noise?: WaterNoise;
}

/** A e B a partir dos passes com textura 0 (`p0`) e 255 (`p255`). */
export function waterMixFrom(p0: Uint8ClampedArray, p255: Uint8ClampedArray, fill: string): WaterMix {
  const n = p0.length / 4;
  const b = new Float32Array(n);
  for (let i = 0; i < n; i++) b[i] = (p255[i * 4] - p0[i * 4]) / 255;
  return { a: p0, b, fill };
}

/** Pixels da célula para uma textura (já deslocada). */
export function waterCompose(m: WaterMix, tex: Uint8ClampedArray): Uint8ClampedArray {
  const out = new Uint8ClampedArray(m.a.length);
  const n = m.b.length;
  for (let i = 0; i < n; i++) {
    const j = i * 4;
    const k = m.b[i];
    out[j] = m.a[j] + k * tex[j];
    out[j + 1] = m.a[j + 1] + k * tex[j + 1];
    out[j + 2] = m.a[j + 2] + k * tex[j + 2];
    out[j + 3] = m.a[j + 3];
  }
  return out;
}

export interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** O retângulo do sprite de primeiro plano cobre alguma das entidades vigiadas? (miolo: 10% de margem lateral) */
export function fgCovers(r: Rect, watch: Rect[]): boolean {
  const mx = (r.x1 - r.x0) * 0.1;
  return watch.some((e) => e.x1 > r.x0 + mx && e.x0 < r.x1 - mx && e.y1 > r.y0 && e.y0 < r.y1);
}

/** Opacidade seguinte (transição exponencial até o alvo, como as copas). */
export function fadeToward(a0: number, target: number, dtMs: number, fadeMs: number): number {
  const k = Math.min(1, dtMs / Math.max(1, fadeMs));
  return Math.abs(target - a0) < 0.01 ? target : a0 + (target - a0) * k;
}
