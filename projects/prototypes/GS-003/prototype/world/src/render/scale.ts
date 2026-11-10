// Escala de tela da fase 2 do Quality Overhaul (?dpr=1). Puro, testável.
// Problema [E] TECH_AUDIT L5: a escala era inteira em pixels CSS; com o Windows em 125%/150% cada pixel lógico virava
// 3,75 ou 4,5 pixels físicos (larguras desiguais). Aqui a escala é inteira em pixels FÍSICOS e o tamanho CSS do
// canvas é o físico dividido pelo devicePixelRatio (fracionário em CSS, exato no monitor).
// Zoom alvo: o personagem de referência ocupa ~charPct% da altura física da tela (Drakantos: ~1/12; fundador: 8–10%).

/** Altura de referência do personagem no mapa (px lógicos, conteúdo opaco): Tamer dos presets ~30, Guilmon 31. */
export const REF_CHAR_PX = 30;

export interface DprLayout {
  /** Pixels físicos por pixel lógico (inteiro). */
  scale: number;
  /** Pixels CSS por pixel lógico (= scale / dpr). */
  cssPerLogical: number;
  logicalW: number;
  logicalH: number;
  cssW: number;
  cssH: number;
  /** Altura do personagem de referência, em % da altura física da tela. */
  charPct: number;
}

export function dprLayout(cssW: number, cssH: number, dpr: number, o: { zoom?: number; charPct?: number; refCharPx?: number } = {}): DprLayout {
  const d = dpr > 0 && Number.isFinite(dpr) ? dpr : 1;
  const physW = Math.max(1, Math.round(cssW * d));
  const physH = Math.max(1, Math.round(cssH * d));
  const ref = o.refCharPx ?? REF_CHAR_PX;
  const pct = o.charPct ?? 9;
  const scale = o.zoom && o.zoom > 0 ? Math.round(o.zoom) : Math.max(1, Math.round(((pct / 100) * physH) / ref));
  const logicalW = Math.ceil(physW / scale);
  const logicalH = Math.ceil(physH / scale);
  return { scale, cssPerLogical: scale / d, logicalW, logicalH, cssW: (logicalW * scale) / d, cssH: (logicalH * scale) / d, charPct: (100 * ref * scale) / physH };
}
