// Recorte suave da trilha e da borda da mata (forest-v4.1). O mapa guarda a chave Wang/blob-47 de cada tile (path_w47_<máscara>), mas a
// geometria pintada nesses PNGs corta um círculo de ~10 px em todo canto que tem só uma borda: numa trilha reta, cada
// emenda entre tiles vira um "dente" e a trilha lê como uma corrente de cruzes (serrilhado). Aqui o recorte sai de um
// campo contínuo no mundo: B-spline quadrática da grade de trilha (1 = tile de trilha; curva sem quina nas diagonais), com um
// ruído de valor em coordenadas do mundo somado ao limiar (borda orgânica, sem costura entre tiles). A textura continua
// a do pacote: terra = o próprio PNG path_w47 do tile (ou path_w47_255 onde ele pintou grama); fora da trilha = o chão
// da clareira (clearing_floor_v41), o mesmo do resto da clareira. A borda da mata (denseedge_w47) tem o mesmo corte e
// recebe o mesmo tratamento, com o miolo de denseedge_w47_255. Só apresentação.

export interface PathSmoothCfg {
  /** Prefixo das chaves do conjunto no mapa (ex.: "fp4_path_w47_"). */
  prefix: string;
  /** Tile do miolo cheio (máscara 255). */
  full: string;
  /** Terra (trilha): aproveita os pixels de terra do próprio PNG Wang-47. Sem isto, o miolo vem só de `full`. */
  keepOwnDirt?: boolean;
  /** Fora do mapa: "edge" repete a borda (trilha que sai do mapa); "fill" conta como do conjunto (mata). */
  outside: "edge" | "fill";
  /** Chão em volta da trilha (variantes). */
  ground: string[];
  /**
   * Limiar do campo B-spline. Numa faixa reta de 1 tile o campo vale 0,5 na divisa: o limiar precisa ficar acima de
   * 0,5 + ruído para a borda cair sempre dentro dos tiles do conjunto (senão a divisa do tile vira um corte reto).
   */
  threshold: number;
  /** Amplitude do ruído somado ao limiar e escala dele (px do mundo). */
  noise: number;
  noiseScale: number;
}

const hash = (x: number, y: number): number => {
  let h = (x * 374761393 + y * 668265263) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

/** Ruído de valor suave (0..1) em coordenadas contínuas. */
export function valueNoise(x: number, y: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const s = (t: number) => t * t * (3 - 2 * t);
  const a = hash(x0, y0) + (hash(x0 + 1, y0) - hash(x0, y0)) * s(fx);
  const b = hash(x0, y0 + 1) + (hash(x0 + 1, y0 + 1) - hash(x0, y0 + 1)) * s(fx);
  return a + (b - a) * s(fy);
}

/**
 * Máscara de terra (1) / chão (0) de um tile `ts×ts` na célula (cx, cy). `isPath(x, y)` diz se a célula é trilha
 * (fora do mapa: quem chama decide). O campo usa só a vizinhança 3×3, então é contínuo entre tiles vizinhos.
 */
export function pathMask(cx: number, cy: number, ts: number, isPath: (x: number, y: number) => boolean, cfg: Pick<PathSmoothCfg, "threshold" | "noise" | "noiseScale">): Uint8Array {
  const out = new Uint8Array(ts * ts);
  const v = (dx: number, dy: number) => (isPath(cx + dx, cy + dy) ? 1 : 0);
  const g = [-1, 0, 1].map((dy) => [-1, 0, 1].map((dx) => v(dx, dy)));
  for (let py = 0; py < ts; py++)
    for (let px = 0; px < ts; px++) {
      // posição em tiles relativa ao centro desta célula (-0,5..0,5); pesos da B-spline quadrática nas 3 colunas/linhas
      const u = (px + 0.5) / ts - 0.5;
      const w = (py + 0.5) / ts - 0.5;
      const wx = [0.5 * (0.5 - u) ** 2, 0.75 - u * u, 0.5 * (0.5 + u) ** 2];
      const wy = [0.5 * (0.5 - w) ** 2, 0.75 - w * w, 0.5 * (0.5 + w) ** 2];
      let field = 0;
      for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) field += g[j][i] * wx[i] * wy[j];
      const n = (valueNoise((cx * ts + px) / cfg.noiseScale, (cy * ts + py) / cfg.noiseScale) - 0.5) * 2 * cfg.noise;
      out[py * ts + px] = field > cfg.threshold + n ? 1 : 0;
    }
  return out;
}

/** Terra pelo tom: nas rampas do forest-v4 (dia e noite) a terra tem R > G e a grama/clareira G > R. */
export const isDirtPixel = (r: number, g: number): boolean => r > g;

/**
 * Pixels RGBA do tile final: terra onde a máscara diz trilha (pixel do próprio PNG Wang-47 se ele for terra; senão o
 * da terra cheia), chão da clareira fora. Na borda, 1 px de pontilhado (35%) mistura os dois, como as bordas do pacote.
 */
export function composePathTile(mask: Uint8Array, ts: number, own: Uint8ClampedArray | undefined, full: Uint8ClampedArray, ground: Uint8ClampedArray, seed: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(ts * ts * 4);
  const m = (x: number, y: number) => (x < 0 || y < 0 || x >= ts || y >= ts ? -1 : mask[y * ts + x]);
  for (let y = 0; y < ts; y++)
    for (let x = 0; x < ts; x++) {
      const i = (y * ts + x) * 4;
      let fg = mask[y * ts + x] === 1;
      const edge = [m(x - 1, y), m(x + 1, y), m(x, y - 1), m(x, y + 1)].some((k) => k !== -1 && k !== mask[y * ts + x]);
      if (edge && fg && hash(seed + x, y * 31 + seed) < 0.35) fg = false;
      const src = fg ? (own && isDirtPixel(own[i], own[i + 1]) ? own : full) : ground;
      out[i] = src[i];
      out[i + 1] = src[i + 1];
      out[i + 2] = src[i + 2];
      out[i + 3] = 255;
    }
  return out;
}
