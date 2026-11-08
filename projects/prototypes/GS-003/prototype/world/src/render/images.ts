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
