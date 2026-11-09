// Cache de imagens por URL com carregador injetável (navegador: HTMLImageElement; capturas: @napi-rs/canvas).

export type ImageLike = CanvasImageSource & { width: number; height: number };
export type ImageLoader = (url: string) => Promise<ImageLike>;
export type CanvasFactory = (w: number, h: number) => HTMLCanvasElement;

export class ImageStore {
  private images = new Map<string, ImageLike>();

  constructor(private readonly loader: ImageLoader) {}

  get(url: string): ImageLike | undefined {
    return this.images.get(url);
  }

  /** Registra uma imagem gerada em código (ex.: folha do Tamer composta) sob um URL sintético. */
  put(url: string, img: ImageLike): void {
    this.images.set(url, img);
  }

  async loadAll(urls: string[]): Promise<string[]> {
    const failed: string[] = [];
    await Promise.all(
      [...new Set(urls)].filter((u) => !this.images.has(u)).map(async (u) => {
        try {
          this.images.set(u, await this.loader(u));
        } catch {
          failed.push(u);
        }
      }),
    );
    return failed;
  }
}

export function browserImageLoader(url: string): Promise<ImageLike> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`falha ao carregar ${url}`));
    img.src = url;
  });
}

export function browserCanvasFactory(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

/**
 * Cópia da imagem com a matiz girada `deg` graus nos pixels saturados que não são pele (variação de roupa/cabelo
 * para diferenciar outros jogadores com o mesmo sprite base). Só apresentação; resultado em cache por chamador.
 */
export function hueShifted(img: ImageLike, deg: number, make: CanvasFactory): HTMLCanvasElement {
  const c = make(img.width, img.height);
  const g = c.getContext("2d")!;
  g.drawImage(img, 0, 0);
  const data = g.getImageData(0, 0, img.width, img.height);
  const d = data.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const r = d[i] / 255;
    const gg = d[i + 1] / 255;
    const b = d[i + 2] / 255;
    const max = Math.max(r, gg, b);
    const min = Math.min(r, gg, b);
    const l = (max + min) / 2;
    const delta = max - min;
    if (delta < 0.12) continue;
    const s = delta / (1 - Math.abs(2 * l - 1));
    let h = max === r ? ((gg - b) / delta) % 6 : max === gg ? (b - r) / delta + 2 : (r - gg) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
    // pele (laranja claro, pouco saturado) fica como está
    if (h >= 12 && h <= 45 && l > 0.45 && s < 0.75) continue;
    h = (h + deg) % 360;
    const C = (1 - Math.abs(2 * l - 1)) * s;
    const X = C * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - C / 2;
    const [r1, g1, b1] = h < 60 ? [C, X, 0] : h < 120 ? [X, C, 0] : h < 180 ? [0, C, X] : h < 240 ? [0, X, C] : h < 300 ? [X, 0, C] : [C, 0, X];
    d[i] = Math.round((r1 + m) * 255);
    d[i + 1] = Math.round((g1 + m) * 255);
    d[i + 2] = Math.round((b1 + m) * 255);
  }
  g.putImageData(data, 0, 0);
  return c;
}
