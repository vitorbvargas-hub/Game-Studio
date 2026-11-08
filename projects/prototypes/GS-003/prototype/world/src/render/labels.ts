// Nomes e níveis sobre as entidades (referência canônica do IdleDex): texto com contorno escuro, desenhado numa
// camada própria na resolução da tela (nítido, independente da escala inteira do mundo).
// Legibilidade com várias entidades juntas: os rótulos nunca se sobrepõem; quem colide sobe e empilha.

export interface EntityLabel {
  id: string;
  name: string;
  /** Nível exibido como "Nv.N" depois do nome. */
  level?: number;
  /** Âncora (centro, base do texto) em px lógicos de tela (canvas do mundo, antes da escala). */
  x: number;
  y: number;
  color: string;
  /** Maior = posicionado antes (fica no lugar natural; os outros desviam). */
  priority: number;
  alpha?: number;
}

export interface PlacedLabel extends EntityLabel {
  /** Retângulo final em px de tela (já multiplicado pela escala). */
  px: number;
  py: number;
  w: number;
  h: number;
  /** Quanto o rótulo subiu para desviar (px de tela). */
  lifted: number;
}

export interface LabelMetrics {
  font: string;
  levelFont: string;
  height: number;
  gap: number;
}

export function labelMetrics(scale: number): LabelMetrics {
  const size = Math.max(11, Math.round(4.3 * scale));
  return {
    font: `700 ${size}px Ubuntu, "DejaVu Sans", system-ui, sans-serif`,
    levelFont: `700 ${Math.max(10, size - 2)}px Ubuntu, "DejaVu Sans", system-ui, sans-serif`,
    height: size + 4,
    gap: 1,
  };
}

const levelText = (l: EntityLabel) => (l.level !== undefined ? `Nv.${l.level}` : "");

function overlaps(a: { px: number; py: number; w: number; h: number }, b: { px: number; py: number; w: number; h: number }): boolean {
  return a.px < b.px + b.w && b.px < a.px + a.w && a.py < b.py + b.h && b.py < a.py + a.h;
}

/**
 * Posiciona os rótulos sem sobreposição: em ordem de prioridade (e, no empate, de baixo para cima na tela),
 * cada um tenta a posição natural; se colidir com um já posicionado, sobe para logo acima dele e tenta de novo.
 * `measure` devolve a largura em px de tela do texto completo (nome + nível).
 */
export function layoutLabels(labels: EntityLabel[], measure: (l: EntityLabel) => number, scale: number, m: LabelMetrics): PlacedLabel[] {
  const order = [...labels].sort((a, b) => b.priority - a.priority || b.y - a.y || (a.id < b.id ? -1 : 1));
  const placed: PlacedLabel[] = [];
  for (const l of order) {
    const w = Math.ceil(measure(l)) + 6;
    const h = m.height;
    const r: PlacedLabel = { ...l, px: Math.round(l.x * scale - w / 2), py: Math.round(l.y * scale - h), w, h, lifted: 0 };
    for (let guard = 0; guard < 12; guard++) {
      const hit = placed.find((o) => overlaps(r, o));
      if (!hit) break;
      const ny = hit.py - h - m.gap;
      r.lifted += r.py - ny;
      r.py = ny;
    }
    placed.push(r);
  }
  return placed;
}

/** Mede com o contexto (fontes reais) a largura de nome + nível. */
export function measureWith(ctx: CanvasRenderingContext2D, m: LabelMetrics): (l: EntityLabel) => number {
  return (l) => {
    ctx.font = m.font;
    let w = ctx.measureText(l.name).width;
    const lv = levelText(l);
    if (lv) {
      ctx.font = m.levelFont;
      w += 4 + ctx.measureText(lv).width;
    }
    return w;
  };
}

export function drawLabels(ctx: CanvasRenderingContext2D, placed: PlacedLabel[], m: LabelMetrics): void {
  ctx.save();
  ctx.textBaseline = "alphabetic";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#0d0f18";
  for (const l of placed) {
    ctx.globalAlpha = l.alpha ?? 1;
    const base = l.py + l.h - 4;
    ctx.font = m.font;
    const nameW = ctx.measureText(l.name).width;
    let x = l.px + 3;
    ctx.lineWidth = 3;
    ctx.strokeText(l.name, x, base);
    ctx.fillStyle = l.color;
    ctx.fillText(l.name, x, base);
    const lv = levelText(l);
    if (lv) {
      x += nameW + 4;
      ctx.font = m.levelFont;
      ctx.strokeText(lv, x, base);
      ctx.fillStyle = "#fee761";
      ctx.fillText(lv, x, base);
    }
    // Rótulo desviado: tracinho vertical ligando ao ponto natural (só quando subiu bastante).
    if (l.lifted > m.height) {
      const cx = Math.round(l.px + l.w / 2);
      ctx.globalAlpha = (l.alpha ?? 1) * 0.5;
      ctx.fillStyle = "#0d0f18";
      ctx.fillRect(cx - 1, l.py + l.h, 3, l.lifted - 2);
      ctx.fillStyle = l.color;
      ctx.fillRect(cx, l.py + l.h, 1, l.lifted - 2);
    }
  }
  ctx.restore();
}
